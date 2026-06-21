"""第 12.1 节 · 例题：90° 康普顿散射求波长偏移与反冲电子动能。

分步演示：散射示意图 → 康普顿公式代入 → 能量守恒柱状图 → 数值结论。
铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数（SI） ──────────────────────────────────────────────────────────
h   = 6.626e-34      # J·s
c   = 3.0e8          # m/s
m0  = 9.109e-31      # kg
eV  = 1.602e-19      # J
lam_C = 2.426e-12    # m  康普顿波长
lam0  = 0.2e-9       # m  入射波长 0.2 nm
phi   = math.pi / 2  # 90°

delta_lam = lam_C * (math.sin(phi / 2)) ** 2 * 2   # = lam_C (phi=90° -> sin^2(45°)=0.5)
# delta_lam = lam_C * 2 * sin^2(phi/2) = 2.426e-12 * 2 * 0.5 = 2.426e-12 m = 0.002426 nm
lam1  = lam0 + delta_lam

E0  = h * c / lam0    # 入射光子能量
E1  = h * c / lam1    # 散射光子能量
Ek  = E0 - E1         # 电子动能
Ek_eV = Ek / eV       # ≈ 74 eV


class Ch12Ex1ComptonScatter90deg(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────────
        title = Text("例题：90° 康普顿散射", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第12章 量子力学初步 · 12.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 背景类比引入 ────────────────────────────────────────────
        ana1 = Text("X 射线打在电子上，就像台球碰撞：", font=CJK).scale(0.48)
        ana2 = Text("光子把一部分能量转给电子，自身波长变长（颜色变红）。", font=CJK).scale(0.48)
        ana3 = Text("散射角越大，能量转移越多——这就是康普顿效应。", font=CJK, color=YELLOW).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        ana_grp.set_x(0)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_grp))

        # ── Step 3: 散射示意图 ──────────────────────────────────────────────
        diag_title = Text("散射示意图", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(diag_title))

        # 电子位置（原点偏下一点）
        e_center = DOWN * 0.5

        # 入射光子箭头（从左水平入射）
        arr_in = Arrow(e_center + LEFT * 3.2, e_center, buff=0, color=CYAN,
                       stroke_width=4, max_tip_length_to_length_ratio=0.18)
        lbl_in_lam = MathTex(r"\lambda_0 = 0.2\,\mathrm{nm}", color=CYAN).scale(0.6)
        lbl_in_lam.next_to(arr_in, UP, buff=0.12)
        lbl_in_txt = Text("入射 X 射线", font=CJK, color=CYAN).scale(0.38)
        lbl_in_txt.next_to(lbl_in_lam, UP, buff=0.08)

        # 散射光子箭头（向上，即 90°）
        arr_sc = Arrow(e_center, e_center + UP * 2.4, buff=0, color=YELLOW,
                       stroke_width=4, max_tip_length_to_length_ratio=0.18)
        lbl_sc_lam = MathTex(r"\lambda", color=YELLOW).scale(0.6)
        lbl_sc_lam.next_to(arr_sc, RIGHT, buff=0.15)
        lbl_sc_txt = Text("散射光子", font=CJK, color=YELLOW).scale(0.38)
        lbl_sc_txt.next_to(lbl_sc_lam, RIGHT, buff=0.08)

        # 反冲电子箭头（向右下，代表反冲方向）
        arr_el = Arrow(e_center, e_center + RIGHT * 2.2 + DOWN * 1.0, buff=0, color=GREEN,
                       stroke_width=3, max_tip_length_to_length_ratio=0.2)
        lbl_el = Text("反冲电子", font=CJK, color=GREEN).scale(0.38)
        lbl_el.next_to(arr_el.get_end(), RIGHT, buff=0.1)

        # 角度标注 φ = 90°
        angle_arc = Arc(radius=0.55, start_angle=0, angle=PI / 2,
                        color=WHITE, stroke_width=2).shift(e_center)
        phi_label = MathTex(r"\varphi=90°").scale(0.5).set_color(WHITE)
        phi_label.move_to(e_center + RIGHT * 0.9 + UP * 0.55)

        # 电子点
        e_dot = Dot(e_center, radius=0.14, color=GREEN)
        e_label = MathTex(r"e^-", color=GREEN).scale(0.55).next_to(e_dot, DOWN, buff=0.08)

        self.play(GrowArrow(arr_in), FadeIn(lbl_in_lam), FadeIn(lbl_in_txt))
        self.wait(0.6)
        self.play(Create(e_dot), FadeIn(e_label))
        self.wait(0.5)
        self.play(GrowArrow(arr_sc), FadeIn(lbl_sc_lam), FadeIn(lbl_sc_txt))
        self.play(GrowArrow(arr_el), FadeIn(lbl_el))
        self.play(Create(angle_arc), Write(phi_label))
        self.wait(1.8)

        diag_group = VGroup(diag_title, arr_in, lbl_in_lam, lbl_in_txt,
                            arr_sc, lbl_sc_lam, lbl_sc_txt,
                            arr_el, lbl_el, e_dot, e_label,
                            angle_arc, phi_label)
        self.play(FadeOut(diag_group))

        # ── Step 4: 康普顿公式展示 ──────────────────────────────────────────
        form_title = Text("康普顿公式", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(form_title))

        compton_full = MathTex(
            r"\Delta\lambda",
            r"=",
            r"\frac{2h}{m_0 c}",
            r"\sin^2\!\frac{\varphi}{2}"
        ).scale(0.9)
        compton_full.next_to(form_title, DOWN, buff=0.45)
        compton_full[0].set_color(YELLOW)
        compton_full[2].set_color(CYAN)
        compton_full[3].set_color(ORANGE)

        self.play(Write(compton_full))
        self.wait(1.2)

        # 标注各项含义
        note_dlam = VGroup(
            MathTex(r"\Delta\lambda", color=YELLOW).scale(0.55),
            Text(": 波长偏移", font=CJK).scale(0.4)
        ).arrange(RIGHT, buff=0.08)
        note_lc = VGroup(
            MathTex(r"\frac{2h}{m_0 c} = \lambda_C = 2.426\times10^{-3}\,\mathrm{nm}", color=CYAN).scale(0.55),
        )
        note_phi = VGroup(
            MathTex(r"\sin^2\!\frac{\varphi}{2}", color=ORANGE).scale(0.55),
            Text(": 散射角因子", font=CJK).scale(0.4)
        ).arrange(RIGHT, buff=0.08)

        notes = VGroup(note_dlam, note_lc, note_phi).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        notes.next_to(compton_full, DOWN, buff=0.35)
        notes.set_x(0)

        self.play(FadeIn(note_dlam))
        self.wait(0.6)
        self.play(FadeIn(note_lc))
        self.wait(0.6)
        self.play(FadeIn(note_phi))
        self.wait(1.4)
        self.play(FadeOut(VGroup(form_title, compton_full, notes)))

        # ── Step 5: 代入 φ=90° 逐步计算 Δλ ────────────────────────────────
        calc_title = Text("代入  φ = 90°  逐步计算", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(calc_title))

        step_a = MathTex(
            r"\Delta\lambda",
            r"= \lambda_C \cdot 2\sin^2\!\frac{90°}{2}",
        ).scale(0.8)
        step_a[0].set_color(YELLOW)
        step_a.next_to(calc_title, DOWN, buff=0.45)
        self.play(Write(step_a))
        self.wait(1.0)

        step_b = MathTex(
            r"= \lambda_C \cdot 2\sin^2\!45°",
            r"= \lambda_C \cdot 2 \times 0.5",
            r"= \lambda_C"
        ).scale(0.78)
        step_b[0].set_color(WHITE)
        step_b[1].set_color(CYAN)
        step_b[2].set_color(GREEN)
        step_b.arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        step_b.next_to(step_a, DOWN, buff=0.3)
        self.play(Write(step_b[0]))
        self.wait(0.7)
        self.play(Write(step_b[1]))
        self.wait(0.7)
        self.play(Write(step_b[2]))
        self.wait(0.8)

        step_c = MathTex(
            r"\Delta\lambda = 2.426\times10^{-3}\,\mathrm{nm}"
        ).scale(0.85).set_color(YELLOW)
        step_c.next_to(step_b, DOWN, buff=0.32)
        self.play(Write(step_c))
        self.wait(1.0)

        # 新波长
        step_d_zh = Text("散射波长：", font=CJK).scale(0.46)
        step_d_eq = MathTex(r"\lambda = \lambda_0 + \Delta\lambda"
                             r"= 0.2 + 0.002426 \approx 0.2024\,\mathrm{nm}",
                             color=GREEN).scale(0.72)
        step_d = VGroup(step_d_zh, step_d_eq).arrange(RIGHT, buff=0.12)
        step_d.next_to(step_c, DOWN, buff=0.3)
        step_d.set_x(0)
        self.play(FadeIn(step_d_zh), Write(step_d_eq))
        self.wait(1.8)

        self.play(FadeOut(VGroup(calc_title, step_a, step_b, step_c, step_d)))

        # ── Step 6: 能量守恒柱状图 ──────────────────────────────────────────
        bar_title = Text("能量守恒：柱状图直觉", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(bar_title))

        # 数值（归一化到 E0）
        bar_max_h = 2.8  # 入射光子柱高（单位：Manim 单位）
        ratio_E1 = E1 / E0       # ≈ 0.988
        ratio_Ek = Ek / E0       # ≈ 0.012

        bar_x_left  = -2.8
        bar_x_right =  1.0
        bar_w = 1.0
        bar_base_y  = -1.5

        # 入射光子柱
        bar_in = Rectangle(width=bar_w, height=bar_max_h, color=CYAN, fill_color=CYAN,
                            fill_opacity=0.55)
        bar_in.move_to([bar_x_left, bar_base_y + bar_max_h / 2, 0])

        lbl_in_e = MathTex(r"E_0 = \frac{hc}{\lambda_0}", color=CYAN).scale(0.5)
        lbl_in_e.next_to(bar_in, UP, buff=0.1)
        lbl_in_val = Text("6.19 keV", font=CJK, color=CYAN).scale(0.38)
        lbl_in_val.next_to(lbl_in_e, UP, buff=0.08)
        lbl_in_bot = Text("入射光子", font=CJK, color=CYAN).scale(0.4)
        lbl_in_bot.next_to(bar_in, DOWN, buff=0.12)

        # 散射光子柱 (E1 部分)
        h_E1 = bar_max_h * ratio_E1
        h_Ek = bar_max_h * ratio_Ek
        bar_sc = Rectangle(width=bar_w, height=h_E1, color=YELLOW, fill_color=YELLOW,
                            fill_opacity=0.55)
        bar_sc.move_to([bar_x_right, bar_base_y + h_E1 / 2, 0])

        # 电子动能叠加段
        bar_ek = Rectangle(width=bar_w, height=h_Ek, color=GREEN, fill_color=GREEN,
                            fill_opacity=0.75)
        bar_ek.move_to([bar_x_right, bar_base_y + h_E1 + h_Ek / 2, 0])

        lbl_sc_e = MathTex(r"E_\gamma = \frac{hc}{\lambda}", color=YELLOW).scale(0.5)
        lbl_sc_e.next_to(bar_sc, LEFT, buff=0.12)

        lbl_ek_e = MathTex(r"E_k", color=GREEN).scale(0.55)
        lbl_ek_e.next_to(bar_ek, RIGHT, buff=0.1)

        lbl_right_top = MathTex(r"E_0", color=WHITE).scale(0.5)
        lbl_right_top.move_to([bar_x_right, bar_base_y + bar_max_h + 0.25, 0])
        lbl_right_bot = Text("散射后总能量", font=CJK, color=WHITE).scale(0.38)
        lbl_right_bot.next_to(VGroup(bar_sc, bar_ek), DOWN, buff=0.12)

        # 等号连线提示
        eq_arrow = DashedLine(
            [bar_x_left + bar_w / 2 + 0.1, bar_base_y + bar_max_h, 0],
            [bar_x_right - bar_w / 2 - 0.1, bar_base_y + bar_max_h, 0],
            color=WHITE, dash_length=0.12, stroke_width=1.5
        )
        eq_label = MathTex(r"E_0 = E_\gamma + E_k").scale(0.6).set_color(WHITE)
        eq_label.move_to([(bar_x_left + bar_x_right) / 2, bar_base_y + bar_max_h + 0.28, 0])

        self.play(FadeIn(bar_in), FadeIn(lbl_in_e), FadeIn(lbl_in_val), FadeIn(lbl_in_bot))
        self.wait(0.8)
        self.play(FadeIn(bar_sc), FadeIn(lbl_sc_e))
        self.wait(0.5)
        self.play(FadeIn(bar_ek), FadeIn(lbl_ek_e))
        self.wait(0.5)
        self.play(Create(eq_arrow), Write(eq_label), FadeIn(lbl_right_top), FadeIn(lbl_right_bot))
        self.wait(1.8)

        bar_group = VGroup(bar_title, bar_in, lbl_in_e, lbl_in_val, lbl_in_bot,
                           bar_sc, lbl_sc_e, bar_ek, lbl_ek_e,
                           eq_arrow, eq_label, lbl_right_top, lbl_right_bot)
        self.play(FadeOut(bar_group))

        # ── Step 7: 计算电子动能 ────────────────────────────────────────────
        ek_title = Text("计算反冲电子动能", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(ek_title))

        ek_formula = MathTex(
            r"E_k",
            r"= hc\!\left(\frac{1}{\lambda_0} - \frac{1}{\lambda_0 + \Delta\lambda}\right)"
        ).scale(0.82)
        ek_formula[0].set_color(GREEN)
        ek_formula.next_to(ek_title, DOWN, buff=0.45)
        self.play(Write(ek_formula))
        self.wait(1.0)

        ek_sub = MathTex(
            r"= hc\!\left(\frac{1}{0.2\,\mathrm{nm}} - \frac{1}{0.2024\,\mathrm{nm}}\right)"
        ).scale(0.78).set_color(CYAN)
        ek_sub.next_to(ek_formula, DOWN, buff=0.3)
        self.play(Write(ek_sub))
        self.wait(1.0)

        ek_step2 = MathTex(
            r"= 6.626\times10^{-34} \times 3\times10^8"
            r"\times \frac{0.0024\times10^{-9}}{0.2\times10^{-9}\times0.2024\times10^{-9}}"
        ).scale(0.62).set_color(WHITE)
        ek_step2.next_to(ek_sub, DOWN, buff=0.28)
        self.play(Write(ek_step2))
        self.wait(1.2)

        ek_result = MathTex(r"E_k \approx 1.19\times10^{-17}\ \mathrm{J}",
                            color=YELLOW).scale(0.85)
        ek_result.next_to(ek_step2, DOWN, buff=0.3)
        self.play(Write(ek_result))
        self.wait(0.9)

        self.play(FadeOut(VGroup(ek_title, ek_formula, ek_sub, ek_step2, ek_result)))

        # ── Step 8: 大字结论 ────────────────────────────────────────────────
        res_title = Text("最终结果", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(res_title))

        res1_zh = Text("波长偏移：", font=CJK).scale(0.46)
        res1_eq = MathTex(r"\Delta\lambda = 2.426\times10^{-3}\,\mathrm{nm}", color=YELLOW).scale(0.85)
        res1 = VGroup(res1_zh, res1_eq).arrange(RIGHT, buff=0.12)
        res1.next_to(res_title, DOWN, buff=0.45)
        res1.set_x(0)

        res2_zh = Text("散射波长：", font=CJK).scale(0.46)
        res2_eq = MathTex(r"\lambda = 0.2024\,\mathrm{nm}", color=CYAN).scale(0.85)
        res2 = VGroup(res2_zh, res2_eq).arrange(RIGHT, buff=0.12)
        res2.next_to(res1, DOWN, buff=0.35)
        res2.set_x(0)

        res3_zh = Text("电子动能：", font=CJK, color=GREEN).scale(0.52)
        res3_eq = MathTex(r"E_k \approx 74.2\ \mathrm{eV}", color=GREEN).scale(1.15)
        res3 = VGroup(res3_zh, res3_eq).arrange(RIGHT, buff=0.14)
        res3.next_to(res2, DOWN, buff=0.42)
        res3.set_x(0)

        box = SurroundingRectangle(res3, color=GREEN, buff=0.22, corner_radius=0.12)

        self.play(FadeIn(res1_zh), Write(res1_eq))
        self.wait(0.8)
        self.play(FadeIn(res2_zh), Write(res2_eq))
        self.wait(0.8)
        self.play(FadeIn(res3_zh), Write(res3_eq))
        self.play(Create(box))
        self.wait(2.0)

        self.play(FadeOut(VGroup(res_title, res1, res2, res3, box)))

        # ── Step 9: 物理直觉：散射角越大偏移越大 (ValueTracker) ─────────────
        dyn_title = Text("直觉：散射角 φ 越大，Δλ 越大", font=CJK, color=BLUE).scale(0.48)
        dyn_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(dyn_title))

        axes = Axes(
            x_range=[0, 200, 45],
            y_range=[0, 0.006, 0.001],
            x_length=7,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        )
        axes.next_to(dyn_title, DOWN, buff=0.35)

        x_lbl_zh = Text("散射角", font=CJK).scale(0.38)
        x_lbl_eq = MathTex(r"\varphi\,(°)").scale(0.4)
        x_lbl = VGroup(x_lbl_zh, x_lbl_eq).arrange(RIGHT, buff=0.06)
        x_lbl.next_to(axes, DOWN, buff=0.1)

        y_lbl_zh = Text("偏移量", font=CJK).scale(0.38)
        y_lbl_eq = MathTex(r"\Delta\lambda\,(\mathrm{nm})").scale(0.4)
        y_lbl = VGroup(y_lbl_zh, y_lbl_eq).arrange(RIGHT, buff=0.06)
        y_lbl.next_to(axes, LEFT, buff=0.1).rotate(PI / 2)

        phi_tracker = ValueTracker(0.0)

        curve = always_redraw(lambda: axes.plot(
            lambda phi_deg: lam_C * 2 * (math.sin(math.radians(phi_deg) / 2)) ** 2 * 1e9,
            x_range=[0, phi_tracker.get_value() + 0.01],
            color=YELLOW, stroke_width=3
        ))

        readout = always_redraw(lambda: VGroup(
            Text("φ =", font=CJK).scale(0.4),
            MathTex(rf"{phi_tracker.get_value():.0f}°", color=ORANGE).scale(0.55),
            Text("  Δλ =", font=CJK).scale(0.4),
            MathTex(rf"{lam_C * 2 * (math.sin(math.radians(phi_tracker.get_value()) / 2))**2 * 1e9:.5f}"
                    r"\,\mathrm{nm}", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.1).to_corner(DR, buff=0.45))

        # 90° 竖线标注
        vline = DashedLine(
            axes.c2p(90, 0), axes.c2p(90, lam_C * 2 * 0.5 * 1e9),
            color=CYAN, stroke_width=1.5, dash_length=0.1
        )
        vline_lbl = MathTex(r"\varphi=90°", color=CYAN).scale(0.45)
        vline_lbl.next_to(axes.c2p(90, lam_C * 2 * 0.5 * 1e9), UR, buff=0.1)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.add(curve, readout)
        self.wait(0.4)
        self.play(phi_tracker.animate.set_value(180), run_time=4.0, rate_func=linear)
        self.wait(0.5)
        self.play(Create(vline), Write(vline_lbl))
        self.wait(1.8)

        self.play(FadeOut(VGroup(dyn_title, axes, x_lbl, y_lbl, curve,
                                 readout, vline, vline_lbl)))

        # ── Step 10: 小结卡 ─────────────────────────────────────────────────
        sum_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sum_title))

        s1 = MathTex(
            r"\Delta\lambda = \frac{2h}{m_0 c}\sin^2\!\frac{\varphi}{2}"
            r"\;\xrightarrow{\varphi=90°}\;\lambda_C = 2.426\times10^{-3}\,\mathrm{nm}",
            color=YELLOW
        ).scale(0.65)

        s2 = MathTex(
            r"E_k = hc\!\left(\frac{1}{\lambda_0}-\frac{1}{\lambda_0+\Delta\lambda}\right)"
            r"\approx 74.2\ \mathrm{eV}",
            color=GREEN
        ).scale(0.65)

        s3_zh = Text("散射角越大，Δλ 越大，电子获得能量越多。", font=CJK, color=WHITE).scale(0.43)
        s4_zh = Text("φ=180° 时 Δλ = 2λ_C 最大（正碰）", font=CJK, color=CYAN).scale(0.40)

        summary = VGroup(s1, s2, s3_zh, s4_zh).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.4)
        summary.set_x(0)
        summary.scale_to_fit_width(12.5)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.12)

        self.play(Write(s1))
        self.wait(0.8)
        self.play(Write(s2))
        self.wait(0.8)
        self.play(FadeIn(s3_zh))
        self.play(FadeIn(s4_zh))
        self.play(Create(box_sum))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Ex1ComptonScatter90deg",
        "id": "phys-ch12-12.1-ex1-compton-scatter-90deg",
        "chapterId": "ch12",
        "sectionId": "12.1",
        "title": "例：90°康普顿散射求偏移与反冲电子动能",
        "description": "分步动画演示 φ=90° 康普顿散射：散射示意图→公式代入→能量守恒柱状图→数值结论 Ek≈74.2 eV。",
    }
]
