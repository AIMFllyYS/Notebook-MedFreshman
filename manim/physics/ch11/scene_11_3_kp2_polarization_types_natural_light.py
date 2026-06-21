"""第 11.3 节 · 自然光与偏振态（知识点 kp2）

可视化方案：
  Step 1  — 俯视截面展示自然光：多随机方向等幅箭头
  Step 2  — 定义与分类（线/部分/圆/椭圆偏振光）
  Step 3  — 偏振片模型：过滤出线偏振光，强度 I = I₀/2
  Step 4  — Malus 定律：ValueTracker 旋转检偏器，箭头与强度 cos² 联动
  Step 5  — 消光演示（θ = 90° 时 I = 0）
  Step 6  — 部分偏振光对比（两方向不等幅矩形）
  Step 7  — 椭圆偏振光（参数椭圆轨迹）
  Step 8  — 数值例子（Malus 定律计算）
  Step 9  — 小结卡（关键公式汇总 + 方框）

铁律：MathTex 内仅 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch11Kp2PolarizationTypesNaturalLight(Scene):
    def construct(self):

        # ─────────────────────────────────────────────────────────────────
        # Step 1: 标题
        # ─────────────────────────────────────────────────────────────────
        title = Text("自然光与偏振态：横波的振动方向", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ─────────────────────────────────────────────────────────────────
        # Step 2: 生活类比
        # ─────────────────────────────────────────────────────────────────
        a1 = Text("光是横波：电场矢量垂直于传播方向振动。", font=CJK).scale(0.48)
        a2 = Text("太阳光里各方向振动都有，且强度相同——这就是「自然光」。", font=CJK).scale(0.48)
        a3 = Text("透过偏振片（如偏光墨镜），只剩一个方向——「线偏振光」。", font=CJK).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ─────────────────────────────────────────────────────────────────
        # Step 3: 自然光截面——随机方向等幅箭头
        # ─────────────────────────────────────────────────────────────────
        nat_label = Text("自然光（迎光方向截面）", font=CJK, color=YELLOW).scale(0.46)
        nat_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(nat_label))

        # 中心点代表光传播方向（⊙ 点表示向外射来）
        center_dot = Dot(ORIGIN + DOWN * 0.5, radius=0.12, color=WHITE)
        center_ring = Circle(radius=0.12, color=WHITE).move_to(center_dot.get_center())
        z_label = MathTex(r"\odot", color=WHITE).scale(0.7).move_to(center_dot.get_center())
        z_txt = Text("光传播方向", font=CJK, color=WHITE).scale(0.36).next_to(z_label, RIGHT, buff=0.15)

        n_arrows = 12
        nat_arrows = VGroup()
        arrow_len = 1.1
        seed_angles = [i * PI / n_arrows for i in range(n_arrows)]
        for ang in seed_angles:
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            s = center_dot.get_center() - d * arrow_len * 0.5
            e = center_dot.get_center() + d * arrow_len * 0.5
            arr = DoubleArrow(s, e, buff=0, color=YELLOW,
                              stroke_width=2.5, max_tip_length_to_length_ratio=0.2)
            nat_arrows.add(arr)

        nat_group = VGroup(center_dot, z_label, z_txt, nat_arrows)
        nat_group.shift(DOWN * 0.5)

        desc_nat = Text("各方向振幅相等 → 自然光", font=CJK, color=GREEN).scale(0.43)
        desc_nat.to_edge(DOWN, buff=0.7)

        self.play(FadeIn(z_label), FadeIn(z_txt))
        self.play(Create(nat_arrows), run_time=1.5)
        self.play(FadeIn(desc_nat))
        self.wait(1.8)
        self.play(FadeOut(VGroup(nat_label, nat_group, desc_nat)))

        # ─────────────────────────────────────────────────────────────────
        # Step 4: 偏振片过滤 → 线偏振光，I = I₀/2
        # ─────────────────────────────────────────────────────────────────
        pol_label = Text("偏振片：只让一个方向通过", font=CJK, color=YELLOW).scale(0.46)
        pol_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(pol_label))

        # 左侧：自然光截面（多向）
        left_dot = Dot(LEFT * 3.2 + DOWN * 0.3, radius=0.10, color=WHITE)
        left_z = MathTex(r"\odot", color=WHITE).scale(0.65).move_to(left_dot.get_center())
        left_arrows = VGroup()
        for ang in seed_angles:
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            s = left_dot.get_center() - d * 0.7
            e = left_dot.get_center() + d * 0.7
            left_arrows.add(DoubleArrow(s, e, buff=0, color=YELLOW,
                                        stroke_width=2.0, max_tip_length_to_length_ratio=0.22))
        left_txt = Text("自然光", font=CJK).scale(0.4).next_to(left_dot, DOWN, buff=0.85)

        # 偏振片：竖条纹格栅
        grating_lines = VGroup()
        for xi in np.linspace(-0.12, 0.12, 7):
            grating_lines.add(
                Line(start=np.array([xi, -0.9, 0.0]),
                     end=np.array([xi, 0.9, 0.0]),
                     color=CYAN, stroke_width=3.5)
            )
        polarizer_rect = Rectangle(width=0.36, height=1.85, color=CYAN,
                                   fill_opacity=0.12, stroke_width=2)
        polarizer = VGroup(polarizer_rect, grating_lines).move_to(ORIGIN + DOWN * 0.3)
        pol_tag = Text("偏振片", font=CJK, color=CYAN).scale(0.38).next_to(polarizer, UP, buff=0.12)

        # 右侧：线偏振光（仅 y 方向）
        right_dot = Dot(RIGHT * 3.2 + DOWN * 0.3, radius=0.10, color=WHITE)
        right_z = MathTex(r"\odot", color=WHITE).scale(0.65).move_to(right_dot.get_center())
        right_arrow = DoubleArrow(
            right_dot.get_center() + DOWN * 0.85,
            right_dot.get_center() + UP * 0.85,
            buff=0, color=ORANGE, stroke_width=3.5, max_tip_length_to_length_ratio=0.22
        )
        right_txt = Text("线偏振光", font=CJK, color=ORANGE).scale(0.4).next_to(right_dot, DOWN, buff=0.85)

        # 强度公式
        half_formula = MathTex(r"I = \frac{1}{2}I_0", color=GREEN).scale(0.85)
        half_formula.to_edge(DOWN, buff=0.75)
        half_zh = Text("强度减半", font=CJK, color=GREEN).scale(0.42)
        half_zh.next_to(half_formula, RIGHT, buff=0.3)

        self.play(FadeIn(left_z), Create(left_arrows), FadeIn(left_txt))
        self.wait(0.5)
        self.play(Create(polarizer), FadeIn(pol_tag))
        self.wait(0.7)
        self.play(FadeOut(left_arrows), Create(right_arrow), FadeIn(right_z), FadeIn(right_txt))
        self.play(Write(half_formula), FadeIn(half_zh))
        self.wait(1.8)
        self.play(FadeOut(VGroup(pol_label, left_z, left_txt,
                                 polarizer, pol_tag,
                                 right_dot, right_z, right_arrow, right_txt,
                                 half_formula, half_zh)))

        # ─────────────────────────────────────────────────────────────────
        # Step 5: Malus 定律 — ValueTracker 旋转检偏器
        # ─────────────────────────────────────────────────────────────────
        mal_label = Text("Malus 定律：检偏器转角 θ 与出射强度", font=CJK, color=YELLOW).scale(0.46)
        mal_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(mal_label))

        malus_tex = MathTex(r"I = I_0 \cos^2\theta").scale(0.95).set_color(YELLOW)
        malus_tex.next_to(mal_label, DOWN, buff=0.4)
        self.play(Write(malus_tex))
        self.wait(0.8)

        # 截面中心
        cx, cy = 0.0, -0.9
        center_pos = np.array([cx, cy, 0.0])

        theta = ValueTracker(0.0)

        # 入射线偏振：固定 y 方向（蓝色）
        in_arrow = DoubleArrow(
            center_pos + DOWN * 0.85,
            center_pos + UP * 0.85,
            buff=0, color=BLUE, stroke_width=3.0, max_tip_length_to_length_ratio=0.22
        )
        in_lbl = Text("入射线偏振", font=CJK, color=BLUE).scale(0.35).next_to(
            np.array([cx, cy + 0.85, 0.0]), RIGHT, buff=0.08)

        # 出射箭头：长度 = cos(θ)，方向 = θ 角
        def make_out_arrow():
            ang = theta.get_value()
            cos_val = math.cos(ang)
            length = abs(cos_val) * 0.85
            if length < 0.05:
                length = 0.05
            d = np.array([math.cos(ang + PI / 2), math.sin(ang + PI / 2), 0.0])
            # 检偏器通过 θ 方向
            d_pol = np.array([math.sin(ang), math.cos(ang), 0.0])
            s = center_pos - d_pol * length
            e = center_pos + d_pol * length
            return DoubleArrow(s, e, buff=0, color=ORANGE,
                               stroke_width=3.5, max_tip_length_to_length_ratio=0.22)

        out_arrow = always_redraw(make_out_arrow)

        # 强度显示
        def make_intensity_txt():
            ang = theta.get_value()
            val = math.cos(ang) ** 2
            return MathTex(rf"I = {val:.2f}\,I_0", color=GREEN).scale(0.75).to_corner(DR, buff=0.5)

        intensity_display = always_redraw(make_intensity_txt)

        # θ 角度显示
        def make_angle_txt():
            deg = math.degrees(theta.get_value())
            return MathTex(rf"\theta = {deg:.0f}^\circ", color=CYAN).scale(0.7).to_corner(DL, buff=0.5)

        angle_display = always_redraw(make_angle_txt)

        # 检偏器轮廓（随 θ 转动的矩形）
        def make_analyzer():
            ang = theta.get_value()
            rect = Rectangle(width=0.28, height=1.7, color=ORANGE,
                             fill_opacity=0.10, stroke_width=2)
            rect.move_to(center_pos)
            rect.rotate(ang)
            return rect

        analyzer_rect = always_redraw(make_analyzer)
        ana_tag = Text("检偏器", font=CJK, color=ORANGE).scale(0.35).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.9)

        dot_c = Dot(center_pos, radius=0.08, color=WHITE)

        self.play(Create(in_arrow), FadeIn(in_lbl))
        self.play(Create(analyzer_rect), FadeIn(ana_tag), FadeIn(dot_c))
        self.play(Create(out_arrow))
        self.add(intensity_display, angle_display)
        self.wait(0.8)

        # 缓慢转到 90°
        self.play(theta.animate.set_value(PI / 2), run_time=4, rate_func=linear)
        self.wait(0.8)

        # 消光点提示
        extinct_txt = Text("消光！I = 0（垂直时完全遮挡）", font=CJK, color=RED).scale(0.44)
        extinct_txt.to_edge(DOWN, buff=1.4)
        self.play(FadeIn(extinct_txt))
        self.wait(1.2)
        self.play(FadeOut(extinct_txt))

        # 继续转一圈回来
        self.play(theta.animate.set_value(PI), run_time=3, rate_func=linear)
        self.wait(0.6)
        self.play(theta.animate.set_value(PI * 3 / 2), run_time=3, rate_func=linear)
        self.wait(0.6)
        self.play(theta.animate.set_value(PI * 2), run_time=2, rate_func=linear)
        self.wait(1.0)

        self.play(FadeOut(VGroup(mal_label, malus_tex, in_arrow, in_lbl,
                                 analyzer_rect, ana_tag, out_arrow, dot_c,
                                 intensity_display, angle_display)))

        # ─────────────────────────────────────────────────────────────────
        # Step 6: 部分偏振光对比
        # ─────────────────────────────────────────────────────────────────
        part_label = Text("部分偏振光：两方向振幅不等", font=CJK, color=YELLOW).scale(0.46)
        part_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(part_label))

        pp_center = DOWN * 0.6

        # x 方向（强）
        ax_strong = DoubleArrow(
            pp_center + LEFT * 1.3,
            pp_center + RIGHT * 1.3,
            buff=0, color=BLUE, stroke_width=3.5, max_tip_length_to_length_ratio=0.20
        )
        lbl_x = VGroup(
            Text("x 方向（强）", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"A_x > A_y", color=BLUE).scale(0.6)
        ).arrange(DOWN, buff=0.1).next_to(pp_center + RIGHT * 1.35, RIGHT, buff=0.15)

        # y 方向（弱）
        ay_weak = DoubleArrow(
            pp_center + DOWN * 0.65,
            pp_center + UP * 0.65,
            buff=0, color=ORANGE, stroke_width=3.5, max_tip_length_to_length_ratio=0.20
        )
        lbl_y = Text("y 方向（弱）", font=CJK, color=ORANGE).scale(0.38).next_to(
            pp_center + UP * 0.7, RIGHT, buff=0.1)

        dot_pp = Dot(pp_center, radius=0.09, color=WHITE)
        z_pp = MathTex(r"\odot", color=WHITE).scale(0.65).move_to(pp_center)

        desc_part = Text("部分偏振光：某方向占优，但不为零", font=CJK, color=GREEN).scale(0.43)
        desc_part.to_edge(DOWN, buff=0.7)

        self.play(FadeIn(z_pp))
        self.play(Create(ax_strong), FadeIn(lbl_x))
        self.play(Create(ay_weak), FadeIn(lbl_y))
        self.play(FadeIn(desc_part))
        self.wait(2.0)
        self.play(FadeOut(VGroup(part_label, ax_strong, lbl_x,
                                 ay_weak, lbl_y, z_pp, desc_part)))

        # ─────────────────────────────────────────────────────────────────
        # Step 7: 椭圆偏振光
        # ─────────────────────────────────────────────────────────────────
        ell_label = Text("椭圆偏振光：电场矢量端点走椭圆路径", font=CJK, color=YELLOW).scale(0.46)
        ell_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ell_label))

        ell_center = DOWN * 0.55
        # 椭圆轨迹
        ell = Ellipse(width=2.4, height=1.4, color=ORANGE, stroke_width=2.5).move_to(ell_center)

        # 参数扫动：电场矢量端点沿椭圆运动
        phi = ValueTracker(0.0)
        a_ell, b_ell = 1.2, 0.7

        def make_ell_vec():
            p = phi.get_value()
            tip = ell_center + np.array([a_ell * math.cos(p), b_ell * math.sin(p), 0.0])
            return Arrow(ell_center, tip, buff=0, color=YELLOW,
                         stroke_width=3, max_tip_length_to_length_ratio=0.28)

        ell_vec = always_redraw(make_ell_vec)

        # 端点轨迹（用 TracedPath）
        tip_dot = always_redraw(
            lambda: Dot(
                ell_center + np.array([a_ell * math.cos(phi.get_value()),
                                       b_ell * math.sin(phi.get_value()), 0.0]),
                radius=0.07, color=YELLOW
            )
        )

        axes_ell = Axes(
            x_range=[-1.5, 1.5, 0.5],
            y_range=[-1.0, 1.0, 0.5],
            x_length=4.0, y_length=2.6,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
        ).move_to(ell_center)
        ax_x = MathTex(r"E_x").scale(0.5).next_to(axes_ell.x_axis.get_end(), DOWN, buff=0.12)
        ax_y = MathTex(r"E_y").scale(0.5).next_to(axes_ell.y_axis.get_end(), LEFT, buff=0.12)

        desc_ell = Text("圆偏振是特例：a = b 时变成圆形轨迹", font=CJK, color=GREEN).scale(0.42)
        desc_ell.to_edge(DOWN, buff=0.7)

        self.play(Create(axes_ell), FadeIn(ax_x), FadeIn(ax_y))
        self.play(Create(ell), FadeIn(ell_vec), FadeIn(tip_dot))
        self.play(FadeIn(desc_ell))
        self.play(phi.animate.set_value(TAU * 2), run_time=4, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(VGroup(ell_label, axes_ell, ax_x, ax_y,
                                 ell, ell_vec, tip_dot, desc_ell)))

        # ─────────────────────────────────────────────────────────────────
        # Step 8: 数值例子
        # ─────────────────────────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        ex1 = Text("自然光通过偏振片，出射强度是原来的多少？", font=CJK).scale(0.44)
        ex1.next_to(ex_title, DOWN, buff=0.35)
        ex1_ans = MathTex(r"I_1 = \frac{1}{2}I_0").scale(0.9).set_color(YELLOW)
        ex1_ans.next_to(ex1, DOWN, buff=0.3)

        ex2 = Text("再通过检偏器，θ = 30°，最终强度？", font=CJK).scale(0.44)
        ex2.next_to(ex1_ans, DOWN, buff=0.35)
        ex2_calc = MathTex(
            r"I_2 = I_1\cos^2 30^\circ = \frac{1}{2}I_0 \cdot \frac{3}{4} = \frac{3}{8}I_0"
        ).scale(0.78).set_color(GREEN)
        ex2_calc.next_to(ex2, DOWN, buff=0.3)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1))
        self.play(Write(ex1_ans))
        self.wait(1.0)
        self.play(FadeIn(ex2))
        self.play(Write(ex2_calc))
        self.wait(2.0)
        self.play(FadeOut(VGroup(ex_title, ex1, ex1_ans, ex2, ex2_calc)))

        # ─────────────────────────────────────────────────────────────────
        # Step 9: 小结卡
        # ─────────────────────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)

        s1 = VGroup(
            Text("偏振片过滤：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"I = \dfrac{1}{2}I_0", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("Malus 定律：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"I = I_0\cos^2\theta", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.2)

        s3 = Text(
            "偏振态：线偏振 / 圆偏振 / 椭圆偏振 / 部分偏振 / 自然光",
            font=CJK, color=GREEN
        ).scale(0.40)

        s4 = Text(
            "θ = 90° 消光（正交偏振片），θ = 0° 透射最强",
            font=CJK, color=ORANGE
        ).scale(0.40)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.play(FadeIn(s3), FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch11Kp2PolarizationTypesNaturalLight",
        "id": "phys-ch11-11.3-kp2-polarization-types-natural-light",
        "chapterId": "ch11",
        "sectionId": "11.3",
        "title": "自然光与偏振态：横波的振动方向",
        "description": "从自然光多向等幅截面出发，演示偏振片过滤、Malus 定律 cos² 衰减与消光，对比部分偏振和椭圆偏振。",
    },
]
