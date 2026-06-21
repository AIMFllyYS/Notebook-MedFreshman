"""第 5.2 节 · 例 5-5：不同液体在两毛细管中的高度差比较。

用两根不同半径的毛细管同时插入同一液体槽，直观演示
Δh = 2α cosθ / (g ρ) · (1/r1 - 1/r2)，
以及 Δh1/Δh2 = (α1 ρ2)/(α2 ρ1) 的比值关系，
最终反推酒精的表面张力系数 α2。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常量（用于数值演示）────────────────────────────────────────────────
ALPHA1 = 0.073   # 水的表面张力系数 N/m
RHO1   = 1000.0  # 水的密度 kg/m³
DH1    = 0.026   # 水在两管中高度差 2.6 cm
RHO2   = 790.0   # 酒精密度 kg/m³
DH2    = 0.010   # 酒精高度差 1.0 cm


class Ch05Ex3CapillaryHeightRatioTwoTubes(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("不同液体在两毛细管中的高度差比较", font=CJK,
                     color=BLUE).scale(0.60).to_edge(UP)
        subtitle = Text("第五章 分子动理论  ·  例5-5", font=CJK,
                        color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("细吸管喝水时，水自动升高——这就是毛细现象。", font=CJK).scale(0.48)
        ana2 = Text("管越细，液面升得越高；液体不同，升高幅度也不同。", font=CJK).scale(0.48)
        ana3 = Text("本例用两根不同粗细的管，比较水与酒精的高度差，从而反推酒精的表面张力。",
                    font=CJK).scale(0.44)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(analogy))

        # ── Step 3: 毛细管公式定义（逐步出现）──────────────────────────
        def_label = Text("毛细管上升高度（单管）：", font=CJK).scale(0.46)
        formula_single = MathTex(
            r"h = \frac{2\alpha\cos\theta}{g\rho r}"
        ).scale(0.88)
        note_single = Text("α=表面张力系数，θ=接触角，r=管半径，ρ=液体密度",
                           font=CJK, color=CYAN).scale(0.38)
        single_group = VGroup(def_label, formula_single, note_single).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT)
        single_group.next_to(title, DOWN, buff=0.55)
        single_group.scale_to_fit_width(12.0)
        formula_single.set_color(YELLOW)

        self.play(FadeIn(def_label))
        self.play(Write(formula_single))
        self.wait(0.8)
        self.play(FadeIn(note_single))
        self.wait(1.2)

        # 推导高度差公式
        delta_label = Text("两管高度差（r1 < r2）：", font=CJK).scale(0.46)
        formula_delta = MathTex(
            r"\Delta h = h_1 - h_2 = \frac{2\alpha\cos\theta}{g\rho}"
            r"\left(\frac{1}{r_1}-\frac{1}{r_2}\right)"
        ).scale(0.78)
        formula_delta.set_color(ORANGE)
        dh_group = VGroup(delta_label, formula_delta).arrange(DOWN, buff=0.28)
        dh_group.next_to(single_group, DOWN, buff=0.38)
        dh_group.scale_to_fit_width(12.5)

        self.play(FadeIn(delta_label))
        self.play(Write(formula_delta))
        self.wait(1.6)
        self.play(FadeOut(VGroup(single_group, dh_group)))

        # ── Step 4: 两管图示 + 弯月面（水，完全润湿 θ≈0）──────────────
        # 坐标系参考
        TANK_LEFT  = -4.8
        TANK_RIGHT =  4.8
        TANK_BOTTOM = -3.0
        TANK_TOP    = -1.6

        # 液槽（矩形轮廓）
        tank = Rectangle(
            width=TANK_RIGHT - TANK_LEFT,
            height=TANK_TOP - TANK_BOTTOM,
            color=WHITE, stroke_width=2
        ).move_to([(TANK_LEFT + TANK_RIGHT) / 2,
                   (TANK_BOTTOM + TANK_TOP) / 2, 0])
        tank_fill = Rectangle(
            width=TANK_RIGHT - TANK_LEFT - 0.08,
            height=TANK_TOP - TANK_BOTTOM - 0.08,
            color=BLUE, fill_opacity=0.25, stroke_width=0
        ).move_to(tank.get_center())
        tank_label = Text("液槽（水）", font=CJK, color=BLUE).scale(0.38)
        tank_label.next_to(tank, DOWN, buff=0.12)

        # 细管参数
        r1_w = 0.22   # 细管半视觉宽度
        r2_w = 0.40   # 粗管半视觉宽度
        H1   = 2.2    # 细管液柱高（显示高度）
        H2   = 1.0    # 粗管液柱高
        TUBE_Y_BOT = TANK_TOP   # 管从液槽顶部插入
        TUBE_TOP   = 2.6        # 管顶部 y 坐标

        cx1 = -2.0   # 细管中心 x
        cx2 =  2.0   # 粗管中心 x

        # 管壁（两根矩形边框）
        def make_tube(cx, half_w, color=WHITE):
            left_wall  = Line([cx - half_w, TUBE_Y_BOT, 0],
                              [cx - half_w, TUBE_TOP, 0], color=color, stroke_width=3)
            right_wall = Line([cx + half_w, TUBE_Y_BOT, 0],
                              [cx + half_w, TUBE_TOP, 0], color=color, stroke_width=3)
            return VGroup(left_wall, right_wall)

        tube1 = make_tube(cx1, r1_w)
        tube2 = make_tube(cx2, r2_w)

        # 液柱（从液槽顶到对应高度）
        def make_liquid_col(cx, half_w, liquid_h, liq_color, opacity=0.55):
            top_y = TUBE_Y_BOT + liquid_h
            col = Rectangle(
                width=half_w * 2 - 0.06,
                height=liquid_h,
                color=liq_color,
                fill_color=liq_color,
                fill_opacity=opacity,
                stroke_width=0
            )
            col.move_to([cx, TUBE_Y_BOT + liquid_h / 2, 0])
            return col

        col1_water = make_liquid_col(cx1, r1_w, H1, BLUE)
        col2_water = make_liquid_col(cx2, r2_w, H2, BLUE)

        # 弯月面（凹弧，表示 θ≈0 完全润湿）
        def make_meniscus(cx, half_w, liquid_h, color):
            top_y = TUBE_Y_BOT + liquid_h
            # 用贝塞尔曲线模拟凹弯月面
            arc = ArcBetweenPoints(
                [cx - half_w + 0.03, top_y, 0],
                [cx + half_w - 0.03, top_y, 0],
                angle=PI * 0.35,   # 正值 → 向上弯（凹液面）
                color=color, stroke_width=2.5
            )
            return arc

        men1_water = make_meniscus(cx1, r1_w, H1, CYAN)
        men2_water = make_meniscus(cx2, r2_w, H2, CYAN)

        # 高度标签
        h1_brace = Brace(
            Line([cx1 + r1_w + 0.1, TUBE_Y_BOT, 0],
                 [cx1 + r1_w + 0.1, TUBE_Y_BOT + H1, 0]),
            direction=RIGHT, color=YELLOW
        )
        h1_tex = MathTex(r"h_1", color=YELLOW).scale(0.65)
        h1_tex.next_to(h1_brace, RIGHT, buff=0.12)

        h2_brace = Brace(
            Line([cx2 + r2_w + 0.1, TUBE_Y_BOT, 0],
                 [cx2 + r2_w + 0.1, TUBE_Y_BOT + H2, 0]),
            direction=RIGHT, color=ORANGE
        )
        h2_tex = MathTex(r"h_2", color=ORANGE).scale(0.65)
        h2_tex.next_to(h2_brace, RIGHT, buff=0.12)

        # 细管标注
        r1_label = VGroup(
            Text("细管", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"r_1", color=WHITE).scale(0.55)
        ).arrange(DOWN, buff=0.05)
        r1_label.next_to([cx1, TUBE_TOP, 0], UP, buff=0.12)

        r2_label = VGroup(
            Text("粗管", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"r_2", color=WHITE).scale(0.55)
        ).arrange(DOWN, buff=0.05)
        r2_label.next_to([cx2, TUBE_TOP, 0], UP, buff=0.12)

        # Δh 双向箭头
        dh_arrow = DoubleArrow(
            [cx1 - r1_w - 0.45, TUBE_Y_BOT + H2, 0],
            [cx1 - r1_w - 0.45, TUBE_Y_BOT + H1, 0],
            color=GREEN, buff=0, tip_length=0.15, stroke_width=3
        )
        dh_tex = MathTex(r"\Delta h", color=GREEN).scale(0.65)
        dh_tex.next_to(dh_arrow, LEFT, buff=0.1)

        intro_caption = Text("细管液面更高：h1 > h2，高度差 Δh = h1 - h2",
                             font=CJK, color=GREEN).scale(0.40)
        intro_caption.to_edge(DOWN, buff=0.55)

        self.play(Create(tank), FadeIn(tank_fill), FadeIn(tank_label))
        self.play(Create(tube1), Create(tube2), FadeIn(r1_label), FadeIn(r2_label))
        self.wait(0.5)
        self.play(FadeIn(col1_water), FadeIn(col2_water))
        self.play(Create(men1_water), Create(men2_water))
        self.wait(0.6)
        self.play(Create(h1_brace), FadeIn(h1_tex),
                  Create(h2_brace), FadeIn(h2_tex))
        self.play(Create(dh_arrow), FadeIn(dh_tex))
        self.play(FadeIn(intro_caption))
        self.wait(1.8)

        water_scene = VGroup(
            tank, tank_fill, tank_label,
            tube1, tube2, r1_label, r2_label,
            col1_water, col2_water,
            men1_water, men2_water,
            h1_brace, h1_tex, h2_brace, h2_tex,
            dh_arrow, dh_tex, intro_caption
        )

        # ── Step 5: 切换液体→酒精，液柱降低 ───────────────────────────────
        H1_alc = 1.3    # 酒精在细管中的液柱高（α更小、ρ更小，但 α/ρ 更小，故 Δh 缩小）
        H2_alc = 0.7    # 酒精在粗管中的液柱高

        switch_txt = Text("换液体：水 → 酒精", font=CJK, color=ORANGE).scale(0.50)
        switch_txt.to_edge(DOWN, buff=0.55)
        self.play(FadeOut(intro_caption), FadeIn(switch_txt))
        self.wait(0.6)

        # 新液槽颜色 + 新液柱
        tank_fill_alc = Rectangle(
            width=TANK_RIGHT - TANK_LEFT - 0.08,
            height=TANK_TOP - TANK_BOTTOM - 0.08,
            color=ORANGE, fill_color=ORANGE, fill_opacity=0.22, stroke_width=0
        ).move_to(tank.get_center())
        tank_label_alc = Text("液槽（酒精）", font=CJK, color=ORANGE).scale(0.38)
        tank_label_alc.next_to(tank, DOWN, buff=0.12)

        col1_alc = make_liquid_col(cx1, r1_w, H1_alc, ORANGE, opacity=0.55)
        col2_alc = make_liquid_col(cx2, r2_w, H2_alc, ORANGE, opacity=0.55)
        men1_alc = make_meniscus(cx1, r1_w, H1_alc, YELLOW)
        men2_alc = make_meniscus(cx2, r2_w, H2_alc, YELLOW)

        h1_brace_alc = Brace(
            Line([cx1 + r1_w + 0.1, TUBE_Y_BOT, 0],
                 [cx1 + r1_w + 0.1, TUBE_Y_BOT + H1_alc, 0]),
            direction=RIGHT, color=YELLOW
        )
        h1_tex_alc = MathTex(r"h_1'", color=YELLOW).scale(0.65)
        h1_tex_alc.next_to(h1_brace_alc, RIGHT, buff=0.12)

        h2_brace_alc = Brace(
            Line([cx2 + r2_w + 0.1, TUBE_Y_BOT, 0],
                 [cx2 + r2_w + 0.1, TUBE_Y_BOT + H2_alc, 0]),
            direction=RIGHT, color=ORANGE
        )
        h2_tex_alc = MathTex(r"h_2'", color=ORANGE).scale(0.65)
        h2_tex_alc.next_to(h2_brace_alc, RIGHT, buff=0.12)

        dh2_arrow = DoubleArrow(
            [cx1 - r1_w - 0.45, TUBE_Y_BOT + H2_alc, 0],
            [cx1 - r1_w - 0.45, TUBE_Y_BOT + H1_alc, 0],
            color=GREEN, buff=0, tip_length=0.15, stroke_width=3
        )
        dh2_tex = MathTex(r"\Delta h_2", color=GREEN).scale(0.60)
        dh2_tex.next_to(dh2_arrow, LEFT, buff=0.1)

        self.play(
            FadeOut(tank_fill), FadeOut(tank_label),
            FadeIn(tank_fill_alc), FadeIn(tank_label_alc)
        )
        self.play(
            FadeOut(col1_water), FadeOut(col2_water),
            FadeOut(men1_water), FadeOut(men2_water),
            FadeOut(h1_brace), FadeOut(h1_tex),
            FadeOut(h2_brace), FadeOut(h2_tex),
            FadeOut(dh_arrow), FadeOut(dh_tex)
        )
        self.play(FadeIn(col1_alc), FadeIn(col2_alc))
        self.play(Create(men1_alc), Create(men2_alc))
        self.play(
            Create(h1_brace_alc), FadeIn(h1_tex_alc),
            Create(h2_brace_alc), FadeIn(h2_tex_alc)
        )
        self.play(Create(dh2_arrow), FadeIn(dh2_tex))
        self.wait(1.0)

        compare_note = Text("酒精 α 更小 → 高度差 Δh2 < Δh1（水的高度差）",
                            font=CJK, color=ORANGE).scale(0.40)
        compare_note.to_edge(DOWN, buff=0.55)
        self.play(ReplacementTransform(switch_txt, compare_note))
        self.wait(1.8)

        alc_scene = VGroup(
            tank_fill_alc, tank_label_alc,
            col1_alc, col2_alc, men1_alc, men2_alc,
            h1_brace_alc, h1_tex_alc, h2_brace_alc, h2_tex_alc,
            dh2_arrow, dh2_tex, compare_note
        )
        self.play(FadeOut(water_scene), FadeOut(alc_scene))

        # ── Step 6: 比值公式推导 ────────────────────────────────────────
        step6_title = Text("推导高度差比值", font=CJK, color=BLUE).scale(0.52)
        step6_title.next_to(title, DOWN, buff=0.45)

        eq_dh1 = MathTex(
            r"\Delta h_1 = \frac{2\alpha_1\cos\theta}{g\rho_1}"
            r"\left(\frac{1}{r_1}-\frac{1}{r_2}\right)"
        ).scale(0.72)
        eq_dh2 = MathTex(
            r"\Delta h_2 = \frac{2\alpha_2\cos\theta}{g\rho_2}"
            r"\left(\frac{1}{r_1}-\frac{1}{r_2}\right)"
        ).scale(0.72)
        eq_dh1.set_color(BLUE)
        eq_dh2.set_color(ORANGE)

        divide_note = Text("两式相除（同一对毛细管，cosθ、g、r1、r2 均相同）：",
                           font=CJK, color=WHITE).scale(0.40)

        ratio_eq = MathTex(
            r"\frac{\Delta h_1}{\Delta h_2}",
            r"=",
            r"\frac{\alpha_1}{\rho_1}",
            r"\cdot",
            r"\frac{\rho_2}{\alpha_2}"
        ).scale(0.95)
        ratio_eq[0].set_color(YELLOW)
        ratio_eq[2].set_color(BLUE)
        ratio_eq[4].set_color(ORANGE)

        ratio_simplified = MathTex(
            r"\frac{\Delta h_1}{\Delta h_2} = \frac{\alpha_1 \rho_2}{\alpha_2 \rho_1}"
        ).scale(0.95).set_color(YELLOW)

        block = VGroup(eq_dh1, eq_dh2, divide_note, ratio_eq).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT)
        block.next_to(step6_title, DOWN, buff=0.40)
        block.scale_to_fit_width(12.5)

        self.play(FadeIn(step6_title))
        self.play(Write(eq_dh1))
        self.wait(0.6)
        self.play(Write(eq_dh2))
        self.wait(0.6)
        self.play(FadeIn(divide_note))
        self.wait(0.6)
        self.play(Write(ratio_eq))
        self.wait(1.0)

        ratio_simplified.next_to(block, DOWN, buff=0.35)
        ratio_simplified.scale_to_fit_width(8.0)
        box_ratio = SurroundingRectangle(ratio_simplified, color=YELLOW,
                                         buff=0.18, corner_radius=0.1)
        self.play(
            TransformMatchingTex(ratio_eq.copy(), ratio_simplified),
            Create(box_ratio)
        )
        self.wait(1.8)
        self.play(FadeOut(VGroup(step6_title, block, ratio_simplified, box_ratio)))

        # ── Step 7: 代入已知数据，求 α2 ─────────────────────────────────
        num_title = Text("代入已知量求酒精表面张力系数", font=CJK, color=BLUE).scale(0.50)
        num_title.next_to(title, DOWN, buff=0.45)

        known_lines = [
            VGroup(Text("水：", font=CJK).scale(0.42),
                   MathTex(r"\alpha_1=0.073\ \mathrm{N/m},\quad"
                            r"\Delta h_1=2.6\ \mathrm{cm},\quad"
                            r"\rho_1=1000\ \mathrm{kg/m^3}").scale(0.62)
                   ).arrange(RIGHT, buff=0.12),
            VGroup(Text("酒精：", font=CJK).scale(0.42),
                   MathTex(r"\rho_2=790\ \mathrm{kg/m^3},\quad"
                            r"\Delta h_2=1.0\ \mathrm{cm}").scale(0.62)
                   ).arrange(RIGHT, buff=0.12),
        ]
        known_block = VGroup(*known_lines).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        known_block.next_to(num_title, DOWN, buff=0.38)
        known_block.scale_to_fit_width(12.5)

        # α2 解的过程
        solve_step1 = MathTex(
            r"\alpha_2 = \alpha_1 \cdot \frac{\rho_2}{\rho_1} \cdot \frac{\Delta h_2}{\Delta h_1}"
        ).scale(0.80).set_color(WHITE)

        # 计算数值
        alpha2 = ALPHA1 * (RHO2 / RHO1) * (DH2 / DH1)
        solve_step2 = MathTex(
            r"\alpha_2 = 0.073 \times \frac{790}{1000} \times \frac{1.0}{2.6}"
        ).scale(0.76).set_color(CYAN)

        solve_step3 = MathTex(
            rf"\alpha_2 \approx {alpha2:.4f}\ \mathrm{{N/m}}"
            r"\approx 0.022\ \mathrm{N/m}"
        ).scale(0.82).set_color(GREEN)

        steps_block = VGroup(solve_step1, solve_step2, solve_step3).arrange(
            DOWN, buff=0.30, aligned_edge=LEFT)
        steps_block.next_to(known_block, DOWN, buff=0.38)
        steps_block.scale_to_fit_width(12.5)

        self.play(FadeIn(num_title))
        self.play(FadeIn(known_lines[0]))
        self.wait(0.5)
        self.play(FadeIn(known_lines[1]))
        self.wait(0.8)
        self.play(Write(solve_step1))
        self.wait(0.8)
        self.play(Write(solve_step2))
        self.wait(0.8)
        self.play(Write(solve_step3))
        self.wait(1.4)

        # 结果高亮框
        result_box = SurroundingRectangle(solve_step3, color=GREEN,
                                          buff=0.18, corner_radius=0.10)
        self.play(Create(result_box))

        compare_real = VGroup(
            Text("（酒精实测值约 0.022 N/m，吻合！）", font=CJK, color=ORANGE).scale(0.40)
        )
        compare_real.next_to(steps_block, DOWN, buff=0.28)
        compare_real.scale_to_fit_width(9.0)
        self.play(FadeIn(compare_real))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            num_title, known_block, steps_block, result_box, compare_real
        )))

        # ── Step 8: 小结卡 ──────────────────────────────────────────────
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1_zh = Text("两管高度差公式：", font=CJK).scale(0.42)
        s1_eq = MathTex(
            r"\Delta h = \frac{2\alpha\cos\theta}{g\rho}"
            r"\left(\frac{1}{r_1}-\frac{1}{r_2}\right)"
        ).scale(0.76).set_color(YELLOW)
        s1 = VGroup(s1_zh, s1_eq).arrange(DOWN, buff=0.16, aligned_edge=LEFT)

        s2_zh = Text("不同液体高度差比值：", font=CJK).scale(0.42)
        s2_eq = MathTex(
            r"\frac{\Delta h_1}{\Delta h_2} = \frac{\alpha_1 \rho_2}{\alpha_2 \rho_1}"
        ).scale(0.76).set_color(YELLOW)
        s2 = VGroup(s2_zh, s2_eq).arrange(DOWN, buff=0.16, aligned_edge=LEFT)

        s3_zh = Text("由此可反推未知液体的表面张力系数 α", font=CJK, color=GREEN).scale(0.42)
        s3_eq = MathTex(
            r"\alpha_2 = \alpha_1 \cdot \frac{\rho_2}{\rho_1} \cdot "
            r"\frac{\Delta h_2}{\Delta h_1}"
        ).scale(0.76).set_color(GREEN)
        s3 = VGroup(s3_zh, s3_eq).arrange(DOWN, buff=0.16, aligned_edge=LEFT)

        summary = VGroup(s1, s2, s3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_eq), FadeIn(s1_zh))
        self.wait(0.7)
        self.play(Write(s2_eq), FadeIn(s2_zh))
        self.wait(0.7)
        self.play(Write(s3_eq), FadeIn(s3_zh))
        self.wait(0.7)
        self.play(Create(box_sum))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Ex3CapillaryHeightRatioTwoTubes",
        "id": "phys-ch05-5.2-ex3-capillary-height-ratio-two-tubes",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "不同液体在两毛细管中的高度差比较（例5-5）",
        "description": "用两根不同半径毛细管演示水与酒精的高度差 Δh，由比值公式 Δh1/Δh2=α1ρ2/(α2ρ1) 反推酒精表面张力系数 α2≈0.022 N/m。",
    }
]
