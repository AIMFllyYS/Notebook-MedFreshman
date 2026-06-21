"""第 2.2 节 · 例题2 · 机翼升力与上下表面流速差

伯努利方程经典应用：机翼截面绕流 → 上快下慢 → 上低压下高压 → 升力。
逐步推导 v1 = sqrt(2Δp/ρ + v2²)，代入数值解出 v1 = 116 m/s。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


def make_airfoil_points(n_upper=60, n_lower=40):
    """
    返回 (上表面点列, 下表面点列) 作为 numpy 数组 (x, y, 0)。
    翼弦方向沿 X 轴，翼弦长 = 4 个单位，前缘在左，后缘在右。
    上表面弧长明显大于下表面（符合机翼截面特征）。
    """
    chord = 4.0
    # 上表面：正弦弓形，最高点约 chord*0.14
    t_u = np.linspace(0, math.pi, n_upper)
    x_u = np.linspace(0, chord, n_upper)
    y_u = 0.56 * np.sin(t_u)           # 最高约 0.56

    # 下表面：轻微下凸（前缘微弯，后缘平），比上表面平坦很多
    x_l = np.linspace(0, chord, n_lower)
    y_l = -0.12 * np.sin(np.linspace(0, math.pi, n_lower) * 0.8)

    pts_upper = np.stack([x_u, y_u, np.zeros(n_upper)], axis=1)
    pts_lower = np.stack([x_l, y_l, np.zeros(n_lower)], axis=1)
    return pts_upper, pts_lower


class Ch02Ex2AircraftWingLift(Scene):
    def construct(self):

        # ─────────────────────────────────────────────────────────────────
        # Step 1  标题 + 副标题
        # ─────────────────────────────────────────────────────────────────
        title = Text("机翼升力与上下表面流速差", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        sub = Text("第二章 流体运动 · 2.2 · 例题精讲", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ─────────────────────────────────────────────────────────────────
        # Step 2  生活类比引入
        # ─────────────────────────────────────────────────────────────────
        ana1 = Text("想象你把手伸出车窗——手掌微微上倾时感到一股向上的力，", font=CJK).scale(0.44)
        ana2 = Text("这就是飞机机翼升力的原理：上下流速不同，压强就不同。", font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ─────────────────────────────────────────────────────────────────
        # Step 3  绘制翼型截面（Polygon + 坐标偏移居中）
        # ─────────────────────────────────────────────────────────────────
        pts_u, pts_l = make_airfoil_points()
        chord = 4.0
        offset = np.array([-chord / 2, -0.2, 0])   # 横向居中，略微下移

        # 翼型轮廓多边形（上表面前→后，下表面后→前，闭合）
        foil_pts = list(pts_u + offset) + list(pts_l[::-1] + offset)
        airfoil = Polygon(*foil_pts, color=WHITE, fill_color=DARK_GRAY,
                          fill_opacity=0.85, stroke_width=2.5)
        airfoil.scale(0.88).shift(DOWN * 0.3)

        wing_label = Text("机翼截面（侧视）", font=CJK, color=WHITE).scale(0.4)
        wing_label.next_to(airfoil, DOWN, buff=0.22)

        self.play(Create(airfoil), FadeIn(wing_label))
        self.wait(1.2)

        # ─────────────────────────────────────────────────────────────────
        # Step 4  流线粒子动画：上表面密（快），下表面稀（慢）
        # ─────────────────────────────────────────────────────────────────
        flow_label = Text("气流绕翼型：上表面流线密 = 流速大", font=CJK, color=YELLOW).scale(0.4)
        flow_label.next_to(title, DOWN, buff=0.38)
        flow_label2 = Text("下表面流线稀 = 流速小", font=CJK, color=ORANGE).scale(0.4)
        flow_label2.next_to(flow_label, DOWN, buff=0.15)
        self.play(FadeIn(flow_label))
        self.wait(0.3)
        self.play(FadeIn(flow_label2))

        # 用静态虚线流线代替粒子动画（避免复杂路径追踪；密度差异传达流速差）
        def upper_streamline(y_offset, n_pts=80):
            """上表面流线：向上弓起，弧度随 y_offset 变化"""
            xs = np.linspace(-2.6, 2.6, n_pts)
            ys = 0.30 * np.sin(np.pi * (xs + 2.6) / 5.2) + y_offset - 0.3
            pts = [np.array([x, y, 0]) for x, y in zip(xs, ys)]
            return DashedLine(*pts[:1], *pts[-1:], color=CYAN, dash_length=0.06,
                              stroke_width=1.2) if False else \
                   VMobject(color=CYAN, stroke_width=1.5).set_points_smoothly(
                       [np.array([x, y, 0]) for x, y in zip(xs, ys)])

        def lower_streamline(y_offset, n_pts=80):
            """下表面流线：近似水平，轻微向下"""
            xs = np.linspace(-2.6, 2.6, n_pts)
            ys = -0.06 * np.sin(np.pi * (xs + 2.6) / 5.2) + y_offset - 0.3
            return VMobject(color=ORANGE, stroke_width=1.5).set_points_smoothly(
                [np.array([x, y, 0]) for x, y in zip(xs, ys)])

        # 上表面：5 条紧密流线（间距 0.13）
        upper_lines = VGroup()
        for i, dy in enumerate([0.80, 0.93, 1.06, 1.19, 1.32]):
            line = upper_streamline(dy)
            upper_lines.add(line)

        # 下表面：3 条稀疏流线（间距 0.22）
        lower_lines = VGroup()
        for dy in [-0.45, -0.67, -0.89]:
            line = lower_streamline(dy)
            lower_lines.add(line)

        # 流线标注
        v1_label = VGroup(
            Text("v", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"_1", color=CYAN).scale(0.55)
        ).arrange(RIGHT, buff=0.02).move_to(np.array([2.9, 0.88, 0]))

        v2_label = VGroup(
            Text("v", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"_2", color=ORANGE).scale(0.55)
        ).arrange(RIGHT, buff=0.02).move_to(np.array([2.9, -0.78, 0]))

        ineq_label = VGroup(
            MathTex(r"v_1", color=CYAN).scale(0.65),
            Text(" > ", font=CJK, color=WHITE).scale(0.5),
            MathTex(r"v_2", color=ORANGE).scale(0.65),
        ).arrange(RIGHT, buff=0.08).move_to(np.array([3.4, 0.05, 0]))

        self.play(Create(upper_lines), run_time=1.5)
        self.play(Create(lower_lines), run_time=1.0)
        self.play(FadeIn(v1_label), FadeIn(v2_label))
        self.wait(0.5)
        self.play(FadeIn(ineq_label))
        self.wait(1.8)

        # 清场流线（保留翼型）
        self.play(FadeOut(VGroup(upper_lines, lower_lines, v1_label, v2_label,
                                 ineq_label, flow_label, flow_label2)))

        # ─────────────────────────────────────────────────────────────────
        # Step 5  压强示意：测压计箭头（下方大、上方小），Δp 绿色高亮
        # ─────────────────────────────────────────────────────────────────
        press_title = Text("压强对比：下压强 > 上压强 → 升力", font=CJK, color=YELLOW).scale(0.42)
        press_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(press_title))

        # 上方压强箭头（朝下，较短 → 压强小）
        p1_arrow = Arrow(
            start=np.array([0, 1.35, 0]),
            end=np.array([0, 0.68, 0]),
            buff=0, color=CYAN, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        p1_text = VGroup(
            MathTex(r"p_1", color=CYAN).scale(0.7),
            Text("（小）", font=CJK, color=CYAN).scale(0.38)
        ).arrange(RIGHT, buff=0.1).next_to(p1_arrow, LEFT, buff=0.15)

        # 下方压强箭头（朝上，较长 → 压强大）
        p2_arrow = Arrow(
            start=np.array([0, -1.35, 0]),
            end=np.array([0, -0.52, 0]),
            buff=0, color=ORANGE, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        p2_text = VGroup(
            MathTex(r"p_2", color=ORANGE).scale(0.7),
            Text("（大）", font=CJK, color=ORANGE).scale(0.38)
        ).arrange(RIGHT, buff=0.1).next_to(p2_arrow, RIGHT, buff=0.15)

        self.play(GrowArrow(p1_arrow), FadeIn(p1_text))
        self.wait(0.5)
        self.play(GrowArrow(p2_arrow), FadeIn(p2_text))
        self.wait(0.8)

        # Δp 高亮绿色标注
        delta_brace = Brace(Line(np.array([0.6, -1.35, 0]), np.array([0.6, 1.35, 0])),
                            direction=RIGHT, color=GREEN)
        delta_label = VGroup(
            MathTex(r"\Delta p", color=GREEN).scale(0.72),
            MathTex(r"= p_2 - p_1", color=GREEN).scale(0.62)
        ).arrange(DOWN, buff=0.1)
        delta_label.next_to(delta_brace, RIGHT, buff=0.18)

        lift_note = Text("这就是升力的来源！", font=CJK, color=GREEN).scale(0.44)
        lift_note.next_to(delta_label, DOWN, buff=0.3)

        self.play(Create(delta_brace), Write(delta_label))
        self.wait(0.5)
        self.play(FadeIn(lift_note))
        self.wait(2.0)

        # 清场（保留标题）
        self.play(FadeOut(VGroup(airfoil, wing_label, p1_arrow, p1_text,
                                 p2_arrow, p2_text, delta_brace, delta_label,
                                 lift_note, press_title)))

        # ─────────────────────────────────────────────────────────────────
        # Step 6  伯努利方程写出
        # ─────────────────────────────────────────────────────────────────
        deriv_title = Text("用伯努利方程建立方程", font=CJK, color=BLUE).scale(0.48)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        bern = MathTex(
            r"p_1", r"+", r"\frac{1}{2}\rho v_1^2",
            r"=", r"p_2", r"+", r"\frac{1}{2}\rho v_2^2"
        ).scale(0.9)
        bern.next_to(deriv_title, DOWN, buff=0.5)
        bern[0].set_color(CYAN)      # p1
        bern[2].set_color(CYAN)      # ½ρv1²
        bern[4].set_color(ORANGE)    # p2
        bern[6].set_color(ORANGE)    # ½ρv2²

        self.play(Write(bern))
        self.wait(1.5)

        # ─────────────────────────────────────────────────────────────────
        # Step 7  已知条件标注
        # ─────────────────────────────────────────────────────────────────
        known_title = Text("已知条件", font=CJK, color=WHITE).scale(0.44)
        k1 = VGroup(
            MathTex(r"\Delta p = p_2 - p_1 = 900\ \mathrm{Pa}", color=GREEN).scale(0.68)
        )
        k2 = VGroup(
            MathTex(r"v_2 = 110\ \mathrm{m/s}", color=ORANGE).scale(0.68)
        )
        k3 = VGroup(
            MathTex(r"\rho = 1.2\ \mathrm{kg/m^3}", color=WHITE).scale(0.68)
        )
        known_group = VGroup(known_title, k1, k2, k3).arrange(DOWN, buff=0.28)
        known_group.next_to(bern, DOWN, buff=0.45)

        self.play(FadeIn(known_title))
        self.play(Write(k1))
        self.wait(0.4)
        self.play(Write(k2))
        self.wait(0.4)
        self.play(Write(k3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_title, bern, known_group)))

        # ─────────────────────────────────────────────────────────────────
        # Step 8  逐步推导 v1
        # ─────────────────────────────────────────────────────────────────
        calc_title = Text("逐步推导 v1", font=CJK, color=BLUE).scale(0.48)
        calc_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_title))

        # 8a 整理伯努利方程
        step_a_zh = Text("整理伯努利方程，移项得：", font=CJK, color=WHITE).scale(0.42)
        step_a_zh.next_to(calc_title, DOWN, buff=0.4)
        step_a = MathTex(
            r"\frac{1}{2}\rho v_1^2 - \frac{1}{2}\rho v_2^2 = p_2 - p_1 = \Delta p"
        ).scale(0.78)
        step_a[0][12:16].set_color(YELLOW)  # v1 高亮
        step_a.next_to(step_a_zh, DOWN, buff=0.32)

        self.play(FadeIn(step_a_zh))
        self.play(Write(step_a))
        self.wait(1.4)

        # 8b 提取 v1²
        step_b_zh = Text("提取 v1，两边除以 ½ρ：", font=CJK, color=WHITE).scale(0.42)
        step_b_zh.next_to(step_a, DOWN, buff=0.35)
        step_b = MathTex(
            r"v_1^2 = v_2^2 + \frac{2\Delta p}{\rho}"
        ).scale(0.85)
        step_b[0][:4].set_color(YELLOW)    # v1² 高亮
        step_b.next_to(step_b_zh, DOWN, buff=0.28)

        self.play(FadeIn(step_b_zh))
        self.play(TransformMatchingTex(step_a.copy(), step_b))
        self.wait(1.2)

        # 8c 开根号
        step_c_zh = Text("两边开方：", font=CJK, color=WHITE).scale(0.42)
        step_c_zh.next_to(step_b, DOWN, buff=0.35)
        step_c = MathTex(
            r"v_1 = \sqrt{v_2^2 + \frac{2\Delta p}{\rho}}"
        ).scale(0.85)
        step_c[0][:3].set_color(YELLOW)
        step_c.next_to(step_c_zh, DOWN, buff=0.28)

        self.play(FadeIn(step_c_zh))
        self.play(Write(step_c))
        self.wait(1.5)

        self.play(FadeOut(VGroup(calc_title, step_a_zh, step_a,
                                 step_b_zh, step_b, step_c_zh)))

        # ─────────────────────────────────────────────────────────────────
        # Step 9  代入数值计算
        # ─────────────────────────────────────────────────────────────────
        num_title = Text("代入数值求解", font=CJK, color=BLUE).scale(0.48)
        num_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(num_title))

        # 公式向上移
        step_c_anchor = step_c.copy().next_to(num_title, DOWN, buff=0.45)
        self.play(ReplacementTransform(step_c, step_c_anchor))
        self.wait(0.6)

        # 代入数值
        sub_zh = Text("代入：v2 = 110 m/s，Δp = 900 Pa，ρ = 1.2 kg/m³", font=CJK, color=WHITE).scale(0.40)
        sub_zh.next_to(step_c_anchor, DOWN, buff=0.38)
        step_d = MathTex(
            r"v_1 = \sqrt{110^2 + \frac{2 \times 900}{1.2}}"
        ).scale(0.82)
        step_d.next_to(sub_zh, DOWN, buff=0.28)

        self.play(FadeIn(sub_zh))
        self.play(Write(step_d))
        self.wait(1.0)

        # 中间结果
        step_e = MathTex(
            r"= \sqrt{12100 + 1500}"
        ).scale(0.82)
        step_e.next_to(step_d, DOWN, buff=0.28)
        self.play(Write(step_e))
        self.wait(0.8)

        step_f = MathTex(
            r"= \sqrt{13600}\ \approx\ 116.6\ \mathrm{m/s}"
        ).scale(0.82)
        step_f.set_color(GREEN)
        step_f.next_to(step_e, DOWN, buff=0.22)
        self.play(Write(step_f))
        self.wait(0.5)

        # 最终结果框
        result_box_zh = Text("上表面流速约为 116 m/s（远大于下表面 110 m/s）",
                             font=CJK, color=GREEN).scale(0.42)
        result_box_zh.next_to(step_f, DOWN, buff=0.3)
        box_result = SurroundingRectangle(step_f, color=GREEN, buff=0.18, corner_radius=0.12)
        self.play(FadeIn(result_box_zh), Create(box_result))
        self.wait(2.0)

        self.play(FadeOut(VGroup(num_title, step_c_anchor, sub_zh,
                                 step_d, step_e, step_f, result_box_zh, box_result)))

        # ─────────────────────────────────────────────────────────────────
        # Step 10  小结卡：关键公式汇总 + 方框
        # ─────────────────────────────────────────────────────────────────
        summary_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52)
        summary_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(summary_title))

        s1 = MathTex(
            r"p_1 + \tfrac{1}{2}\rho v_1^2 = p_2 + \tfrac{1}{2}\rho v_2^2",
            color=YELLOW
        ).scale(0.78)

        s2 = MathTex(
            r"v_1 = \sqrt{v_2^2 + \frac{2\Delta p}{\rho}}",
            color=YELLOW
        ).scale(0.78)

        s3_lhs = MathTex(r"v_1 \approx 116\ \mathrm{m/s}", color=GREEN).scale(0.75)

        s4 = VGroup(
            Text("上快下慢 → 上低压下高压 → 升力", font=CJK, color=WHITE).scale(0.42),
        )

        summary_group = VGroup(s1, s2, s3_lhs, s4).arrange(DOWN, buff=0.38)
        summary_group.next_to(summary_title, DOWN, buff=0.45)
        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.38, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3_lhs))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(summary_title, summary_group, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch02Ex2AircraftWingLift",
        "id": "phys-ch02-2.2-ex2-aircraft-wing-lift",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "机翼升力与上下表面流速差",
        "description": "用伯努利方程解释机翼升力原理：上表面流速大→压强小，下表面流速小→压强大，逐步推导并代入数值求 v1 ≈ 116 m/s。",
    },
]
