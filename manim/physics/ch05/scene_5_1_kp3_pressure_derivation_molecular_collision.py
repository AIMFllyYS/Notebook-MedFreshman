"""第 5.1 节 · 气体压强的微观推导（分子碰撞统计）。

从单个分子与器壁的弹性碰撞出发，经过统计平均，推导出气体压强公式：
p = (1/3) n m v²_bar = (2/3) n Ek_bar。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch05Kp3PressureDerivationMolecularCollision(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("气体压强的微观推导", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.1", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("打气筒越用力打，轮胎气压越高——", font=CJK).scale(0.50)
        ana2 = Text("气压从哪里来？无数气体分子不断撞击器壁，", font=CJK).scale(0.50)
        ana3 = Text("每次碰撞都给器壁一个冲击力，统计平均后就是「压强」。", font=CJK).scale(0.50)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 容器中运动的分子（2D 示意图替代 3D）──────────────────
        step3_label = Text("第一步：单个分子与器壁的弹性碰撞", font=CJK, color=BLUE).scale(0.48)
        step3_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step3_label))

        # 画容器（矩形）
        box = Rectangle(width=5.0, height=3.2, color=WHITE, stroke_width=2.5)
        box.move_to(DOWN * 0.3)
        box_label = Text("气体容器", font=CJK, color=WHITE).scale(0.38)
        box_label.next_to(box, DOWN, buff=0.15)
        self.play(Create(box), FadeIn(box_label))

        # 多个随机运动的分子（灰色小点，预先画出，不做运动以避免复杂度）
        rng = np.random.default_rng(42)
        bg_dots = VGroup()
        for _ in range(14):
            x = rng.uniform(-2.0, 1.8)
            y = rng.uniform(-1.2, 1.2)
            bg_dots.add(Dot(point=np.array([x, y - 0.3, 0]), radius=0.08, color=GREY))
        self.play(FadeIn(bg_dots))
        self.wait(0.5)

        # 高亮分子：以 vx 速度从左向右运动撞击右壁
        mol = Dot(point=np.array([-1.8, -0.3, 0]), radius=0.13, color=YELLOW)
        mol_label = Text("分子 m", font=CJK, color=YELLOW).scale(0.36)
        mol_label.next_to(mol, UP, buff=0.12)

        # 碰前速度箭头
        v_before = Arrow(
            mol.get_center(),
            mol.get_center() + np.array([1.1, 0, 0]),
            buff=0, color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.25,
        )
        vb_label_zh = Text("速度", font=CJK, color=ORANGE).scale(0.34)
        vb_label_math = MathTex(r"v_x", color=ORANGE).scale(0.65)
        vb_label = VGroup(vb_label_zh, vb_label_math).arrange(RIGHT, buff=0.08)
        vb_label.next_to(v_before, UP, buff=0.1)

        self.play(FadeIn(mol), FadeIn(mol_label))
        self.play(GrowArrow(v_before), FadeIn(vb_label))
        self.wait(0.8)

        # 分子运动到右壁（慢镜头）
        wall_x = 2.38
        self.play(
            mol.animate.move_to(np.array([wall_x - 0.13, -0.3, 0])),
            mol_label.animate.move_to(np.array([wall_x - 0.13, -0.3 + 0.25, 0])),
            v_before.animate.shift(RIGHT * (wall_x - 0.13 - (-1.8))),
            vb_label.animate.shift(RIGHT * (wall_x - 0.13 - (-1.8))),
            run_time=1.8,
        )
        self.wait(0.4)

        # 碰后：动量变化 mvx → -mvx，冲量 2mvx
        impulse_label_zh = Text("冲量", font=CJK, color=CYAN).scale(0.38)
        impulse_label_math = MathTex(r"2mv_x", color=CYAN).scale(0.75)
        impulse_row = VGroup(impulse_label_zh, impulse_label_math).arrange(RIGHT, buff=0.1)
        impulse_row.next_to(mol, LEFT, buff=0.35).shift(UP * 0.55)

        # 碰后速度箭头（反向）
        v_after = Arrow(
            mol.get_center(),
            mol.get_center() + np.array([-1.1, 0, 0]),
            buff=0, color=RED, stroke_width=3,
            max_tip_length_to_length_ratio=0.25,
        )
        va_label_math = MathTex(r"-v_x", color=RED).scale(0.65)
        va_label_math.next_to(v_after, UP, buff=0.1)

        self.play(
            ReplacementTransform(v_before, v_after),
            FadeOut(vb_label),
            FadeIn(va_label_math),
        )
        self.play(FadeIn(impulse_row))
        self.wait(1.2)

        # 动量公式
        dp_zh = Text("动量变化", font=CJK, color=WHITE).scale(0.40)
        dp_math = MathTex(r"\Delta p = mv_x - (-mv_x) = 2mv_x", color=YELLOW).scale(0.68)
        dp_row = VGroup(dp_zh, dp_math).arrange(RIGHT, buff=0.12)
        dp_row.next_to(box, DOWN, buff=0.25)
        self.play(FadeOut(box_label), FadeIn(dp_row))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            step3_label, box, bg_dots, mol, mol_label,
            v_after, va_label_math, impulse_row, dp_row
        )))

        # ── Step 4: 圆柱体扫过体积 —— 统计碰撞分子数 ───────────────────
        step4_label = Text("第二步：dt 时间内能撞到面积 dA 的分子数", font=CJK, color=BLUE).scale(0.46)
        step4_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step4_label))

        # 坐标轴示意
        ax = Axes(
            x_range=[0, 4.5, 1],
            y_range=[0, 3.0, 1],
            x_length=5.5,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": True},
        ).shift(DOWN * 0.5 + LEFT * 0.5)

        x_lbl = MathTex(r"x", color=WHITE).scale(0.6).next_to(ax.x_axis.get_end(), RIGHT, buff=0.1)
        y_lbl = MathTex(r"y", color=WHITE).scale(0.6).next_to(ax.y_axis.get_end(), UP, buff=0.1)

        # 右侧器壁（竖线）
        wall_line = Line(ax.c2p(4, 0), ax.c2p(4, 3.0), color=WHITE, stroke_width=2.5)
        wall_text = Text("器壁 dA", font=CJK, color=WHITE).scale(0.38)
        wall_text.next_to(wall_line, RIGHT, buff=0.1)

        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(wall_line), FadeIn(wall_text))

        # 圆柱体（用矩形近似）：宽度 = vx·dt
        cyl_x0 = ax.c2p(1.8, 0.8)[0]
        cyl_x1 = ax.c2p(4.0, 0.8)[0]  # 右端 = 器壁
        cyl_y0 = ax.c2p(1.8, 0.8)[1]
        cyl_y1 = ax.c2p(1.8, 2.2)[1]

        cylinder_rect = Rectangle(
            width=cyl_x1 - cyl_x0,
            height=cyl_y1 - cyl_y0,
            color=CYAN,
            fill_color=CYAN,
            fill_opacity=0.0,
            stroke_width=2,
        ).move_to(np.array([(cyl_x0 + cyl_x1) / 2, (cyl_y0 + cyl_y1) / 2, 0]))

        cyl_label_zh = Text("扫过体积", font=CJK, color=CYAN).scale(0.38)
        cyl_label_math = MathTex(r"v_x \cdot dt \cdot dA", color=CYAN).scale(0.62)
        cyl_label = VGroup(cyl_label_zh, cyl_label_math).arrange(RIGHT, buff=0.08)
        cyl_label.move_to(np.array([(cyl_x0 + cyl_x1) / 2, (cyl_y0 + cyl_y1) / 2 + 0.55, 0]))

        # vx·dt 标注
        brace_bottom = Line(
            np.array([cyl_x0, cyl_y0 - 0.22, 0]),
            np.array([cyl_x1, cyl_y0 - 0.22, 0]),
            color=ORANGE, stroke_width=2
        )
        brace_label = MathTex(r"v_x \, dt", color=ORANGE).scale(0.58)
        brace_label.next_to(brace_bottom, DOWN, buff=0.1)

        self.play(Create(cylinder_rect), FadeIn(cyl_label))
        self.play(Create(brace_bottom), FadeIn(brace_label))

        # 在圆柱体内填入分子点（动画填充）
        inner_dots = VGroup()
        mol_positions = [
            (2.1, 1.1), (2.5, 1.7), (3.0, 1.0), (3.4, 1.9), (2.8, 1.4),
            (3.2, 1.2), (2.2, 1.6), (3.6, 1.6), (3.0, 1.8), (2.6, 1.0),
        ]
        for (mx, my) in mol_positions:
            p = ax.c2p(mx, my)
            inner_dots.add(Dot(point=p, radius=0.07, color=YELLOW))

        self.play(FadeIn(cylinder_rect.copy().set_fill(CYAN, opacity=0.18)))
        self.play(LaggedStart(*[FadeIn(d) for d in inner_dots], lag_ratio=0.1), run_time=1.6)

        # 分子数公式
        n_formula_zh = Text("其中能撞到器壁的分子数", font=CJK, color=WHITE).scale(0.40)
        n_formula_math = MathTex(
            r"\Delta N = \frac{1}{2} n \, v_x \, dt \, dA",
            color=GREEN,
        ).scale(0.70)
        n_formula = VGroup(n_formula_zh, n_formula_math).arrange(DOWN, buff=0.15)
        n_formula.to_corner(DL, buff=0.45).shift(UP * 0.2)
        self.play(FadeIn(n_formula))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            step4_label, ax, x_lbl, y_lbl, wall_line, wall_text,
            cylinder_rect, cyl_label, brace_bottom, brace_label,
            inner_dots, n_formula
        )))

        # ── Step 5: 单速度分量的压力贡献 ────────────────────────────────
        step5_label = Text("第三步：单速度分量 vx 对压强的贡献", font=CJK, color=BLUE).scale(0.46)
        step5_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step5_label))

        deriv1_zh = Text("每个分子冲量", font=CJK, color=WHITE).scale(0.42)
        deriv1_math = MathTex(r"2mv_x", color=YELLOW).scale(0.80)
        deriv1 = VGroup(deriv1_zh, deriv1_math).arrange(RIGHT, buff=0.12)

        deriv2_zh = Text("dt 内碰壁分子数", font=CJK, color=WHITE).scale(0.42)
        deriv2_math = MathTex(r"\frac{1}{2}nv_x dA \, dt", color=YELLOW).scale(0.80)
        deriv2 = VGroup(deriv2_zh, deriv2_math).arrange(RIGHT, buff=0.12)

        deriv3_zh = Text("合力 = 冲量之和 / dt", font=CJK, color=WHITE).scale(0.42)
        deriv3_math = MathTex(
            r"dF = \frac{1}{2}nv_x dA \cdot 2mv_x = nmv_x^2 dA",
            color=ORANGE,
        ).scale(0.72)
        deriv3 = VGroup(deriv3_zh, deriv3_math).arrange(DOWN, buff=0.10, aligned_edge=LEFT)

        deriv4_zh = Text("压强 p = dF / dA", font=CJK, color=WHITE).scale(0.42)
        deriv4_math = MathTex(r"p_{v_x} = nmv_x^2", color=GREEN).scale(0.80)
        deriv4 = VGroup(deriv4_zh, deriv4_math).arrange(RIGHT, buff=0.12)

        steps_group = VGroup(deriv1, deriv2, deriv3, deriv4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        steps_group.next_to(step5_label, DOWN, buff=0.45)
        steps_group.scale_to_fit_width(11.5)

        for item in [deriv1, deriv2, deriv3, deriv4]:
            self.play(FadeIn(item))
            self.wait(1.0)

        self.wait(1.2)
        self.play(FadeOut(VGroup(step5_label, steps_group)))

        # ── Step 6: ValueTracker 扫速度分布累积冲量 ─────────────────────
        step6_label = Text("第四步：对全部速度分量求统计平均", font=CJK, color=BLUE).scale(0.46)
        step6_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step6_label))

        # 坐标系：横轴 vx，纵轴 贡献压强
        axes2 = Axes(
            x_range=[0, 3.5, 0.5],
            y_range=[0, 1.3, 0.5],
            x_length=5.8,
            y_length=2.8,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": True},
        ).shift(DOWN * 0.6 + LEFT * 0.5)

        xl2 = MathTex(r"v_x", color=WHITE).scale(0.55).next_to(axes2.x_axis.get_end(), RIGHT, buff=0.1)
        yl2_zh = Text("贡献", font=CJK, color=WHITE).scale(0.36)
        yl2_math = MathTex(r"nmv_x^2", color=WHITE).scale(0.52)
        yl2 = VGroup(yl2_zh, yl2_math).arrange(DOWN, buff=0.06)
        yl2.next_to(axes2.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes2), FadeIn(xl2), FadeIn(yl2))

        # ValueTracker：扫 vx 从 0 到 vmax=3
        vx_tracker = ValueTracker(0.0)
        vmax = 3.0

        # Maxwell 分布近似 f(vx) ∝ exp(-vx²/2) × vx（简化展示用）
        def boltzmann(vx_val):
            return vx_val * math.exp(-vx_val ** 2 / 2.0) * 1.3  # 缩放到 y<1.3

        # 蓝色分布曲线（固定）
        dist_curve = axes2.plot(
            lambda vx: boltzmann(vx),
            x_range=[0, vmax, 0.02],
            color=BLUE,
            stroke_width=2.5,
        )
        dist_label_zh = Text("速度分布", font=CJK, color=BLUE).scale(0.38)
        dist_label_math = MathTex(r"f(v_x)", color=BLUE).scale(0.55)
        dist_label = VGroup(dist_label_zh, dist_label_math).arrange(RIGHT, buff=0.06)
        dist_label.to_corner(UR, buff=0.9)

        self.play(Create(dist_curve), FadeIn(dist_label))
        self.wait(0.6)

        # 橙色填充区域随 vx_tracker 扫动
        fill_area = always_redraw(lambda: axes2.get_area(
            axes2.plot(
                lambda vx: boltzmann(vx),
                x_range=[0.001, max(0.01, vx_tracker.get_value()), 0.02],
                color=ORANGE,
            ),
            x_range=[0.001, max(0.01, vx_tracker.get_value())],
            color=ORANGE,
            opacity=0.45,
        ))

        vx_readout = always_redraw(lambda: MathTex(
            rf"v_x = {vx_tracker.get_value():.2f}", color=ORANGE
        ).scale(0.55).to_corner(UR, buff=0.55).shift(DOWN * 0.65))

        self.add(fill_area, vx_readout)
        self.play(vx_tracker.animate.set_value(vmax), run_time=3.5)
        self.wait(0.8)

        # 统计平均结果
        avg_zh = Text("统计平均后（各向同性）：", font=CJK, color=WHITE).scale(0.44)
        avg_math = MathTex(
            r"\overline{v_x^2} = \overline{v_y^2} = \overline{v_z^2} = \frac{\overline{v^2}}{3}",
            color=YELLOW,
        ).scale(0.75)
        avg_group = VGroup(avg_zh, avg_math).arrange(RIGHT, buff=0.12)
        avg_group.next_to(axes2, DOWN, buff=0.25)
        avg_group.scale_to_fit_width(10.0)
        self.play(FadeIn(avg_group))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            step6_label, axes2, xl2, yl2, dist_curve, dist_label,
            fill_area, vx_readout, avg_group
        )))

        # ── Step 7: 推导最终公式（逐步） ───────────────────────────────
        step7_label = Text("第五步：写出完整压强公式", font=CJK, color=BLUE).scale(0.48)
        step7_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step7_label))

        f1_zh = Text("对所有速度方向平均后", font=CJK, color=WHITE).scale(0.42)
        f1_math = MathTex(r"p = nm\,\overline{v_x^2}", color=WHITE).scale(0.80)
        f1 = VGroup(f1_zh, f1_math).arrange(RIGHT, buff=0.14)

        f2_zh = Text("代入各向同性关系", font=CJK, color=WHITE).scale(0.42)
        f2_math = MathTex(
            r"p = nm \cdot \frac{\overline{v^2}}{3} = \frac{1}{3}nm\,\overline{v^2}",
            color=YELLOW,
        ).scale(0.80)
        f2 = VGroup(f2_zh, f2_math).arrange(DOWN, buff=0.10, aligned_edge=LEFT)

        f3_zh = Text("平均平动动能", font=CJK, color=WHITE).scale(0.42)
        f3_math = MathTex(
            r"\overline{\varepsilon} = \frac{1}{2}m\,\overline{v^2}",
            color=CYAN,
        ).scale(0.80)
        f3 = VGroup(f3_zh, f3_math).arrange(RIGHT, buff=0.14)

        f4_zh = Text("最终结果", font=CJK, color=WHITE).scale(0.42)
        f4_math = MathTex(
            r"p = \frac{1}{3}nm\,\overline{v^2} = \frac{2}{3}n\,\overline{\varepsilon}",
            color=GREEN,
        ).scale(0.90)
        f4 = VGroup(f4_zh, f4_math).arrange(RIGHT, buff=0.14)

        derive_steps = VGroup(f1, f2, f3, f4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        derive_steps.next_to(step7_label, DOWN, buff=0.45)
        derive_steps.scale_to_fit_width(11.5)

        for item in [f1, f2, f3]:
            self.play(FadeIn(item))
            self.wait(1.0)

        # 最终公式高亮动画
        self.play(FadeIn(f4))
        self.wait(0.5)
        box_f4 = SurroundingRectangle(f4_math, color=GREEN, buff=0.18, corner_radius=0.12)
        self.play(Create(box_f4))
        self.wait(1.8)

        self.play(FadeOut(VGroup(step7_label, derive_steps, box_f4)))

        # ── Step 8: 物理意义说明 ────────────────────────────────────────
        step8_label = Text("物理意义", font=CJK, color=BLUE).scale(0.52)
        step8_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step8_label))

        m1 = Text("n：单位体积内的分子数（数密度）", font=CJK, color=WHITE).scale(0.45)
        m2 = Text("m：单个分子质量", font=CJK, color=WHITE).scale(0.45)
        m3_zh = Text("平均平动动能", font=CJK, color=CYAN).scale(0.45)
        m3_math = MathTex(r"\overline{\varepsilon}=\frac{1}{2}m\overline{v^2}", color=CYAN).scale(0.62)
        m3 = VGroup(m3_zh, m3_math).arrange(RIGHT, buff=0.10)
        m4 = Text("压强 = 大量分子碰撞器壁的统计平均效果，", font=CJK, color=ORANGE).scale(0.45)
        m5 = Text("对单个分子碰撞无意义。", font=CJK, color=ORANGE).scale(0.45)

        meaning_group = VGroup(m1, m2, m3, m4, m5).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        meaning_group.next_to(step8_label, DOWN, buff=0.45)
        meaning_group.scale_to_fit_width(11.5)

        for item in [m1, m2, m3, m4, m5]:
            self.play(FadeIn(item))
            self.wait(0.7)

        self.wait(1.2)
        self.play(FadeOut(VGroup(step8_label, meaning_group)))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1_math = MathTex(
            r"\Delta p_{mol} = 2mv_x",
            color=YELLOW,
        ).scale(0.78)
        s1_zh = Text("单次碰撞动量变化", font=CJK, color=YELLOW).scale(0.40)
        s1 = VGroup(s1_zh, s1_math).arrange(RIGHT, buff=0.18)

        s2_math = MathTex(
            r"\overline{v_x^2} = \overline{v_y^2} = \overline{v_z^2} = \frac{\overline{v^2}}{3}",
            color=CYAN,
        ).scale(0.78)
        s2_zh = Text("各向同性", font=CJK, color=CYAN).scale(0.40)
        s2 = VGroup(s2_zh, s2_math).arrange(RIGHT, buff=0.18)

        s3_math = MathTex(
            r"p = \frac{1}{3}nm\,\overline{v^2} = \frac{2}{3}n\,\overline{\varepsilon}",
            color=GREEN,
        ).scale(0.88)
        s3_zh = Text("气体压强", font=CJK, color=GREEN).scale(0.42)
        s3 = VGroup(s3_zh, s3_math).arrange(RIGHT, buff=0.18)

        s4 = Text("压强是大量分子集体行为的统计平均，与温度正相关。",
                  font=CJK, color=WHITE).scale(0.43)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(11.5)

        self.play(Write(s1_math), FadeIn(s1_zh))
        self.wait(0.6)
        self.play(Write(s2_math), FadeIn(s2_zh))
        self.wait(0.6)
        self.play(Write(s3_math), FadeIn(s3_zh))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.wait(0.5)

        big_box = SurroundingRectangle(summary, color=GREEN, buff=0.30, corner_radius=0.15)
        self.play(Create(big_box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, big_box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch05Kp3PressureDerivationMolecularCollision",
        "id": "phys-ch05-5.1-kp3-pressure-derivation-molecular-collision",
        "chapterId": "ch05",
        "sectionId": "5.1",
        "title": "气体压强的微观推导",
        "description": "从单分子弹性碰撞出发，经圆柱体扫过体积统计分子数、ValueTracker扫速度分布，逐步推导出 p=(1/3)nmv²=(2/3)nEk，揭示压强是大量分子碰撞的统计平均。",
    },
]
