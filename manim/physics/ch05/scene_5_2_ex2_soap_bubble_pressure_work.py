"""第 5.2 节 · 吹肥皂泡的做功与附加压强（例5-4/5-15）。

物理动画：表面张力做功（双层膜面积增量）与球形液膜/液面附加压强推导，
对比单面（液面 ΔP=2α/R）与双面（液膜 ΔP=4α/R）。
ValueTracker 演示肥皂泡从 r=0 吹大到 R=5 cm 的全过程。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

BUBBLE_OUTER = "#A8D8EA"   # 外层膜颜色（浅蓝）
BUBBLE_INNER = "#F9CAD7"   # 内层膜颜色（浅粉）
SOAP_COLOR   = "#E8F4F8"   # 泡膜填充（半透明白）


class Ch05Ex2SoapBubblePressureWork(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("吹肥皂泡：做功与附加压强", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.2  表面张力", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        ana1 = Text("吹大肥皂泡时，你在克服液膜的表面张力做功；", font=CJK).scale(0.46)
        ana2 = Text("同时，泡内气压高于外界大气压，气泡才能维持球形。", font=CJK).scale(0.46)
        ana3 = Text("这节课我们计算：做了多少功？内外压差是多少？", font=CJK, color=YELLOW).scale(0.46)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(analogy))

        # ── Step 3: 双层膜结构说明 ───────────────────────────────────────
        struct_title = Text("肥皂膜的双层结构", font=CJK, color=BLUE).scale(0.50)
        struct_title.next_to(title, DOWN, buff=0.45)

        # 截面示意：同心圆弧代表双层膜
        R_show = 1.6
        center_pos = LEFT * 2.5 + DOWN * 0.5
        outer_arc = Circle(radius=R_show + 0.14, color=BUBBLE_OUTER, stroke_width=8).move_to(center_pos)
        inner_arc = Circle(radius=R_show - 0.14, color=BUBBLE_INNER, stroke_width=8).move_to(center_pos)
        fill_ring = Annulus(inner_radius=R_show - 0.14, outer_radius=R_show + 0.14,
                            color=WHITE, fill_opacity=0.18, stroke_width=0).move_to(center_pos)

        label_outer = Text("外液面", font=CJK, color=BUBBLE_OUTER).scale(0.38)
        label_inner = Text("内液面", font=CJK, color=BUBBLE_INNER).scale(0.38)
        label_outer.next_to(outer_arc, RIGHT, buff=0.12).shift(UP * 0.6)
        label_inner.next_to(inner_arc, RIGHT, buff=0.12).shift(DOWN * 0.3)

        note_double = Text("液膜有两个液面：外液面 + 内液面", font=CJK, color=GREEN).scale(0.44)
        note_double.next_to(center_pos, DOWN, buff=2.2)

        # 右侧说明
        rhs_title = Text("因此表面积增量要乘以 2：", font=CJK).scale(0.44)
        rhs_formula = MathTex(r"\Delta S = 2 \times 4\pi R^2 = 8\pi R^2", color=YELLOW).scale(0.80)
        rhs = VGroup(rhs_title, rhs_formula).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        rhs.next_to(center_pos, RIGHT, buff=1.0).shift(UP * 0.1)

        self.play(FadeIn(struct_title))
        self.play(Create(fill_ring), Create(outer_arc), Create(inner_arc))
        self.play(FadeIn(label_outer), FadeIn(label_inner))
        self.wait(0.8)
        self.play(FadeIn(note_double))
        self.wait(0.8)
        self.play(FadeIn(rhs_title))
        self.play(Write(rhs_formula))
        self.wait(1.8)
        self.play(FadeOut(VGroup(struct_title, outer_arc, inner_arc, fill_ring,
                                  label_outer, label_inner, note_double, rhs)))

        # ── Step 4: ValueTracker 演示泡泡吹大过程 ───────────────────────
        r_tracker = ValueTracker(0.0)
        R_MAX = 2.0          # 屏幕单位（对应物理 5 cm）
        R_PHYS = 5e-2        # 物理值 m
        alpha = 40e-3        # N/m

        bubble_center = LEFT * 2.0 + DOWN * 0.3

        def make_bubble():
            rv = r_tracker.get_value()
            if rv < 0.04:
                return VGroup()
            outer = Circle(radius=rv + 0.10, color=BUBBLE_OUTER, stroke_width=5).move_to(bubble_center)
            inner = Circle(radius=max(rv - 0.10, 0.01), color=BUBBLE_INNER, stroke_width=5).move_to(bubble_center)
            fill  = Circle(radius=rv + 0.10, fill_color=SOAP_COLOR,
                           fill_opacity=0.15, stroke_width=0).move_to(bubble_center)
            return VGroup(fill, outer, inner)

        bubble = always_redraw(make_bubble)

        # 右侧实时公式区域
        def make_readout():
            rv = r_tracker.get_value()
            r_phys = R_PHYS * (rv / R_MAX)
            ds = 8 * math.pi * r_phys ** 2
            da = alpha * ds
            lines = VGroup(
                MathTex(rf"R = {r_phys*100:.2f}\ \mathrm{{cm}}", color=CYAN).scale(0.62),
                MathTex(rf"\Delta S = 8\pi R^2 = {ds*1e4:.4f}\times10^{{-4}}\ \mathrm{{m}}^2",
                        color=WHITE).scale(0.52),
                MathTex(rf"\Delta A = \alpha \cdot \Delta S = {da*1e4:.4f}\times10^{{-4}}\ \mathrm{{J}}",
                        color=YELLOW).scale(0.52),
            ).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
            lines.move_to(RIGHT * 2.4 + DOWN * 0.2)
            return lines

        readout = always_redraw(make_readout)

        blow_caption = Text("正在吹大肥皂泡……", font=CJK, color=ORANGE).scale(0.44).to_edge(DOWN, buff=0.5)
        r_label = Text("半径 R 从 0 增大到 5 cm", font=CJK).scale(0.42).next_to(blow_caption, UP, buff=0.15)

        step4_title = Text("做功计算（ValueTracker 实时演示）", font=CJK, color=BLUE).scale(0.48)
        step4_title.next_to(title, DOWN, buff=0.4)

        self.play(FadeIn(step4_title))
        self.add(bubble, readout)
        self.play(FadeIn(blow_caption), FadeIn(r_label))
        self.play(r_tracker.animate.set_value(R_MAX), run_time=4.0, rate_func=smooth)
        self.wait(1.0)
        self.play(FadeOut(blow_caption), FadeOut(r_label))

        # ── Step 4b: 能量条 ──────────────────────────────────────────────
        # ΔA = alpha * 8pi R^2 = 40e-3 * 8 * pi * (5e-2)^2 ≈ 2.513e-3 J ≈ 8pi * 1e-4 J
        da_val = alpha * 8 * math.pi * R_PHYS ** 2   # ~2.513e-3 J

        bar_bg = Rectangle(width=5.0, height=0.40, color=GREY, fill_opacity=0.3).to_edge(DOWN, buff=1.2)
        bar_fg = Rectangle(width=0.01, height=0.40, color=GREEN, fill_opacity=0.85).align_to(bar_bg, LEFT)
        bar_fg.add_updater(lambda m: m.set_width(
            max(0.01, bar_bg.get_width() * r_tracker.get_value() / R_MAX), stretch=True
        ).align_to(bar_bg, LEFT))

        bar_label_zh = Text("做功", font=CJK).scale(0.38)
        bar_label_zh.next_to(bar_bg, LEFT, buff=0.2)
        bar_val = always_redraw(lambda: MathTex(
            rf"\Delta A = {alpha * 8 * math.pi * (R_PHYS * r_tracker.get_value() / R_MAX)**2 * 1e4:.3f}"
            rf"\times10^{{-4}}\ \mathrm{{J}}",
            color=GREEN).scale(0.50).next_to(bar_bg, RIGHT, buff=0.2))

        self.play(Create(bar_bg), FadeIn(bar_label_zh))
        self.add(bar_fg, bar_val)
        self.wait(0.5)

        # 数值代入最终结果
        final_da = VGroup(
            Text("代入 R = 5 cm，", font=CJK).scale(0.44),
            MathTex(r"\alpha = 40\times10^{-3}\ \mathrm{N/m}", color=CYAN).scale(0.62),
        ).arrange(RIGHT, buff=0.2).next_to(step4_title, DOWN, buff=0.35)

        final_result = MathTex(
            r"\Delta A = \alpha \cdot 8\pi R^2 = 8\pi \times 10^{-4}\ \mathrm{J}",
            color=YELLOW).scale(0.70)
        final_result.next_to(final_da, DOWN, buff=0.35)
        final_result_box = SurroundingRectangle(final_result, color=YELLOW, buff=0.18, corner_radius=0.1)

        self.play(FadeIn(final_da))
        self.play(Write(final_result), Create(final_result_box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(step4_title, final_da, final_result, final_result_box,
                                  bar_bg, bar_label_zh, bar_val, readout, bubble)))
        bar_fg.clear_updaters()
        self.remove(bar_fg)

        # ── Step 5: 截面力平衡 → 推导 ΔP = 4α/R ───────────────────────
        step5_title = Text("附加压强推导：球形液膜截面力平衡", font=CJK, color=BLUE).scale(0.48)
        step5_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step5_title))

        # 截面图（左侧）
        cross_center = LEFT * 3.2 + DOWN * 0.5
        R_cross = 1.4

        outer_c = Circle(radius=R_cross + 0.12, color=BUBBLE_OUTER, stroke_width=5).move_to(cross_center)
        inner_c = Circle(radius=R_cross - 0.12, color=BUBBLE_INNER, stroke_width=5).move_to(cross_center)
        fill_c  = Circle(radius=R_cross + 0.12, fill_color=SOAP_COLOR,
                         fill_opacity=0.12, stroke_width=0).move_to(cross_center)

        # 截取上半圆弧（留下下半部分用虚线表示截面）
        diam_line = DashedLine(
            cross_center + LEFT * (R_cross + 0.25),
            cross_center + RIGHT * (R_cross + 0.25),
            color=WHITE, stroke_width=2)

        # 内部压强箭头（向上穿越截面）
        press_arrows = VGroup(*[
            Arrow(cross_center + np.array([x, -0.05, 0]),
                  cross_center + np.array([x, 0.65, 0]),
                  buff=0, color=RED, stroke_width=3,
                  max_tip_length_to_length_ratio=0.25)
            for x in np.linspace(-R_cross * 0.7, R_cross * 0.7, 7)
        ])

        # 表面张力箭头（两端水平）
        t_left  = Arrow(cross_center + LEFT * (R_cross + 0.35) + DOWN * 0.15,
                        cross_center + LEFT * (R_cross + 0.85) + DOWN * 0.15,
                        buff=0, color=GREEN, stroke_width=4,
                        max_tip_length_to_length_ratio=0.25)
        t_right = Arrow(cross_center + RIGHT * (R_cross + 0.35) + DOWN * 0.15,
                        cross_center + RIGHT * (R_cross + 0.85) + DOWN * 0.15,
                        buff=0, color=GREEN, stroke_width=4,
                        max_tip_length_to_length_ratio=0.25)

        label_dp  = Text("内部", font=CJK, color=RED).scale(0.36).next_to(press_arrows, UP, buff=0.08)
        label_dp2 = Text("高压区", font=CJK, color=RED).scale(0.36).next_to(label_dp, DOWN, buff=0.05)
        label_t   = Text("张力 T", font=CJK, color=GREEN).scale(0.36).next_to(t_right, RIGHT, buff=0.08)

        self.play(Create(fill_c), Create(outer_c), Create(inner_c))
        self.play(Create(diam_line))
        self.play(Create(press_arrows), FadeIn(label_dp), FadeIn(label_dp2))
        self.play(Create(t_left), Create(t_right), FadeIn(label_t))
        self.wait(1.2)

        # 右侧：力平衡方程逐步推导
        eq_title = Text("竖直方向合力为零（球对称）：", font=CJK).scale(0.42)
        eq_title.move_to(RIGHT * 2.0 + UP * 1.8)

        eq1 = MathTex(r"\Delta p \cdot \pi R^2", r"=", r"2 \times 2\pi R \alpha").scale(0.72)
        eq1[0].set_color(RED)
        eq1[2].set_color(GREEN)
        eq1.next_to(eq_title, DOWN, buff=0.4)

        note_eq1_zh = Text("内外压差作用于截面积", font=CJK, color=RED).scale(0.36)
        note_eq1_2  = Text("两层膜各自的张力之和", font=CJK, color=GREEN).scale(0.36)
        note_eq1 = VGroup(note_eq1_zh, note_eq1_2).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        note_eq1.next_to(eq1, DOWN, buff=0.3)

        eq2 = MathTex(r"\Delta p = \frac{4\alpha}{R}", color=YELLOW).scale(0.90)
        eq2.next_to(note_eq1, DOWN, buff=0.45)
        eq2_box = SurroundingRectangle(eq2, color=YELLOW, buff=0.2, corner_radius=0.12)

        self.play(FadeIn(eq_title))
        self.play(Write(eq1))
        self.play(FadeIn(note_eq1))
        self.wait(1.0)
        self.play(TransformMatchingTex(eq1.copy(), eq2))
        self.play(Create(eq2_box))
        self.wait(1.8)

        cross_group = VGroup(fill_c, outer_c, inner_c, diam_line, press_arrows,
                              label_dp, label_dp2, t_left, t_right, label_t)
        self.play(FadeOut(VGroup(step5_title, eq_title, eq1, note_eq1,
                                  eq2, eq2_box, cross_group)))

        # ── Step 6: 数值代入（蒸汽泡，R = 1 mm）────────────────────────
        step6_title = Text("数值代入：R = 1 mm 时附加压强", font=CJK, color=BLUE).scale(0.48)
        step6_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step6_title))

        given_alpha = VGroup(
            Text("已知：", font=CJK).scale(0.44),
            MathTex(r"\alpha = 40\times10^{-3}\ \mathrm{N/m},\quad R = 1\times10^{-3}\ \mathrm{m}",
                    color=CYAN).scale(0.68),
        ).arrange(RIGHT, buff=0.18)
        given_alpha.next_to(step6_title, DOWN, buff=0.5)

        calc_step1 = MathTex(
            r"\Delta p = \frac{4\alpha}{R} = \frac{4 \times 40\times10^{-3}}{1\times10^{-3}}",
            color=WHITE).scale(0.70)
        calc_step1.next_to(given_alpha, DOWN, buff=0.45)

        calc_step2 = MathTex(r"\Delta p = 160\ \mathrm{Pa}", color=YELLOW).scale(0.90)
        calc_step2.next_to(calc_step1, DOWN, buff=0.45)
        calc_step2_box = SurroundingRectangle(calc_step2, color=YELLOW, buff=0.2, corner_radius=0.12)

        note_steam = VGroup(
            Text("（注：液膜双面，蒸汽泡半径较小，", font=CJK, color=WHITE).scale(0.40),
            Text("附加压强远大于大气压的 0.1%）", font=CJK, color=WHITE).scale(0.40),
        ).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        note_steam.next_to(calc_step2, DOWN, buff=0.4)

        self.play(FadeIn(given_alpha))
        self.wait(0.6)
        self.play(Write(calc_step1))
        self.wait(0.8)
        self.play(Write(calc_step2), Create(calc_step2_box))
        self.play(FadeIn(note_steam))
        self.wait(2.0)
        self.play(FadeOut(VGroup(step6_title, given_alpha, calc_step1,
                                  calc_step2, calc_step2_box, note_steam)))

        # ── Step 7: 对比液面（单面）与液膜（双面）───────────────────────
        step7_title = Text("对比：液面（单面）vs 液膜（双面）", font=CJK, color=BLUE).scale(0.48)
        step7_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step7_title))

        # 左：液面截面（单层）
        left_center = LEFT * 3.2 + DOWN * 0.7
        R_comp = 1.1
        surf_circle = Circle(radius=R_comp, color=BUBBLE_OUTER, stroke_width=7).move_to(left_center)
        surf_fill   = Circle(radius=R_comp, fill_color=BLUE_E,
                             fill_opacity=0.18, stroke_width=0).move_to(left_center)
        surf_label  = Text("液面（单层）", font=CJK, color=BUBBLE_OUTER).scale(0.40)
        surf_label.next_to(surf_circle, DOWN, buff=0.25)
        surf_eq     = MathTex(r"\Delta p = \frac{2\alpha}{R}", color=BUBBLE_OUTER).scale(0.72)
        surf_eq.next_to(surf_label, DOWN, buff=0.20)

        # 右：液膜截面（双层）
        right_center = RIGHT * 2.2 + DOWN * 0.7
        film_outer  = Circle(radius=R_comp + 0.12, color=BUBBLE_OUTER,
                             stroke_width=6).move_to(right_center)
        film_inner  = Circle(radius=R_comp - 0.12, color=BUBBLE_INNER,
                             stroke_width=6).move_to(right_center)
        film_fill   = Circle(radius=R_comp + 0.12, fill_color=SOAP_COLOR,
                             fill_opacity=0.15, stroke_width=0).move_to(right_center)
        film_label  = Text("液膜（双层）", font=CJK, color=YELLOW).scale(0.40)
        film_label.next_to(film_outer, DOWN, buff=0.25)
        film_eq     = MathTex(r"\Delta p = \frac{4\alpha}{R}", color=YELLOW).scale(0.72)
        film_eq.next_to(film_label, DOWN, buff=0.20)
        film_eq_box = SurroundingRectangle(film_eq, color=YELLOW, buff=0.14, corner_radius=0.10)

        # 中间箭头 + 倍数说明
        times2 = MathTex(r"\times 2", color=RED).scale(0.80)
        times2.move_to((left_center + right_center) / 2 + DOWN * 1.6)
        arrow_mid = Arrow(
            times2.get_left() + LEFT * 0.4,
            times2.get_right() + RIGHT * 0.4,
            buff=0.05, color=RED, stroke_width=3)
        diff_note = Text("双面 = 2 × 单面", font=CJK, color=RED).scale(0.40)
        diff_note.next_to(times2, DOWN, buff=0.18)

        self.play(Create(surf_fill), Create(surf_circle), FadeIn(surf_label))
        self.play(Write(surf_eq))
        self.wait(0.6)
        self.play(Create(film_fill), Create(film_outer), Create(film_inner), FadeIn(film_label))
        self.play(Write(film_eq), Create(film_eq_box))
        self.wait(0.6)
        self.play(FadeIn(times2), FadeIn(diff_note))
        self.wait(2.0)

        compare_group = VGroup(surf_fill, surf_circle, surf_label, surf_eq,
                                film_fill, film_outer, film_inner, film_label,
                                film_eq, film_eq_box, times2, diff_note)
        self.play(FadeOut(VGroup(step7_title, compare_group)))

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s1_label = Text("做功（双层膜）：", font=CJK, color=WHITE).scale(0.44)
        s1_form  = MathTex(r"\Delta A = \alpha \cdot 8\pi R^2", color=YELLOW).scale(0.78)
        s1 = VGroup(s1_label, s1_form).arrange(RIGHT, buff=0.25)

        s2_label = Text("液膜附加压强（双面）：", font=CJK, color=WHITE).scale(0.44)
        s2_form  = MathTex(r"\Delta p = \frac{4\alpha}{R}", color=YELLOW).scale(0.78)
        s2 = VGroup(s2_label, s2_form).arrange(RIGHT, buff=0.25)

        s3_label = Text("液面附加压强（单面）：", font=CJK, color=WHITE).scale(0.44)
        s3_form  = MathTex(r"\Delta p = \frac{2\alpha}{R}", color=BUBBLE_OUTER).scale(0.78)
        s3 = VGroup(s3_label, s3_form).arrange(RIGHT, buff=0.25)

        s4_label = Text("数值例（R=5 cm，", font=CJK, color=WHITE).scale(0.42)
        s4_mid   = MathTex(r"\alpha=40\times10^{-3}", color=CYAN).scale(0.62)
        s4_right = Text("）：", font=CJK, color=WHITE).scale(0.42)
        s4_form  = MathTex(r"\Delta A = 8\pi\times10^{-4}\ \mathrm{J}", color=GREEN).scale(0.68)
        s4_line1 = VGroup(s4_label, s4_mid, s4_right).arrange(RIGHT, buff=0.08)
        s4 = VGroup(s4_line1, s4_form).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        self.play(Write(s1_form), FadeIn(s1_label))
        self.wait(0.5)
        self.play(Write(s2_form), FadeIn(s2_label))
        self.wait(0.5)
        self.play(Write(s3_form), FadeIn(s3_label))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Ex2SoapBubblePressureWork",
        "id": "phys-ch05-5.2-ex2-soap-bubble-pressure-work",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "吹肥皂泡的做功与附加压强（例5-4/5-15）",
        "description": "动画演示肥皂泡从零吹大的做功计算（双层膜 ΔA=8πR²α），并推导球形液膜附加压强 ΔP=4α/R，对比液面单面公式 ΔP=2α/R。",
    },
]
