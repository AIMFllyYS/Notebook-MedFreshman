"""第 11.1 节 · 例题：牛顿环测波长

通过牛顿环干涉条纹半径公式，推导出光波波长的测量方法。
关键：利用相邻两环半径差消去难以测准的环级次 k，得到只含几何量的简洁公式。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch11Ex2NewtonRingWavelength",
        "id": "phys-ch11-11.1-ex2-newton-ring-wavelength",
        "chapterId": "ch11",
        "sectionId": "11.1",
        "title": "例题：牛顿环测波长",
        "description": "利用牛顿环第k环与第k+5环的半径公式相减消去k，推导并代入数值得到光波长590nm。",
    }
]


class Ch11Ex2NewtonRingWavelength(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("例题：牛顿环测波长", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        analogy1 = Text("把平凸透镜放在平板玻璃上，", font=CJK).scale(0.48)
        analogy2 = Text("单色光从上方照射，透镜下方空气层形成等厚干涉——", font=CJK).scale(0.48)
        analogy3 = Text("这就是牛顿环：一圈圈明暗交替的同心圆。", font=CJK, color=YELLOW).scale(0.48)
        analogy = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.22)
        analogy.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(analogy1))
        self.wait(0.6)
        self.play(FadeIn(analogy2))
        self.wait(0.6)
        self.play(FadeIn(analogy3))
        self.wait(1.6)
        self.play(FadeOut(analogy))

        # ── Step 3: 牛顿环俯视图 ─────────────────────────────────────────
        view_label = Text("牛顿环俯视图", font=CJK, color=CYAN).scale(0.48)
        view_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(view_label))

        center = DOWN * 0.5
        rings = VGroup()
        ring_colors = [WHITE, YELLOW, WHITE, ORANGE, WHITE, GREEN, WHITE]
        radii_vals = [0.18, 0.50, 0.76, 0.99, 1.19, 1.37, 1.54]
        for i, r in enumerate(radii_vals):
            c = ring_colors[i] if i < len(ring_colors) else WHITE
            sw = 2.5 if i in (3, 5) else 1.5
            ring = Circle(radius=r, color=c, stroke_width=sw).move_to(center)
            rings.add(ring)

        center_dot = Dot(center, color=WHITE, radius=0.06)

        self.play(Create(center_dot), run_time=0.4)
        for ring in rings:
            self.play(Create(ring), run_time=0.25)
        self.wait(0.5)

        # 标注 r_k (第4圈, index=3, 橙色) 和 r_{k+5} (第6圈, index=5, 绿色)
        r_k_ring = rings[3]
        r_k5_ring = rings[5]

        # r_k 半径线和标注
        rk_end = center + RIGHT * radii_vals[3]
        rk_line = Line(center, rk_end, color=ORANGE, stroke_width=2.5)
        rk_label = MathTex(r"r_k", color=ORANGE).scale(0.6)
        rk_label.next_to(rk_end, RIGHT, buff=0.08)

        # r_{k+5} 半径线和标注（斜向左上，避免重叠）
        angle_k5 = math.pi * 0.55
        rk5_end = center + np.array([radii_vals[5] * math.cos(angle_k5),
                                      radii_vals[5] * math.sin(angle_k5), 0])
        rk5_line = Line(center, rk5_end, color=GREEN, stroke_width=2.5)
        rk5_label = MathTex(r"r_{k+5}", color=GREEN).scale(0.6)
        rk5_label.next_to(rk5_end, UL, buff=0.08)

        self.play(Create(rk_line), FadeIn(rk_label))
        self.play(Create(rk5_line), FadeIn(rk5_label))
        self.wait(1.2)

        diagram_group = VGroup(rings, center_dot, rk_line, rk_label, rk5_line, rk5_label)
        self.play(FadeOut(diagram_group), FadeOut(view_label))

        # ── Step 4: 暗环半径公式 ─────────────────────────────────────────
        formula_head = Text("暗环半径公式（第 k 暗环）：", font=CJK, color=WHITE).scale(0.46)
        formula_head.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(formula_head))

        eq_rk = MathTex(
            r"r_k^2", r"=", r"(2k-1)", r"\frac{R\lambda}{2}"
        ).scale(0.88)
        eq_rk[0].set_color(ORANGE)
        eq_rk[2].set_color(YELLOW)
        eq_rk[3].set_color(CYAN)
        eq_rk.next_to(formula_head, DOWN, buff=0.38)
        self.play(Write(eq_rk))
        self.wait(0.8)

        eq_rk5 = MathTex(
            r"r_{k+5}^2", r"=", r"(2(k+5)-1)", r"\frac{R\lambda}{2}"
        ).scale(0.88)
        eq_rk5[0].set_color(GREEN)
        eq_rk5[2].set_color(YELLOW)
        eq_rk5[3].set_color(CYAN)
        eq_rk5.next_to(eq_rk, DOWN, buff=0.35)
        self.play(Write(eq_rk5))
        self.wait(1.2)

        # 辅助说明
        hint_r = Text("R 为平凸透镜曲率半径，λ 为光波波长", font=CJK, color=WHITE).scale(0.40)
        hint_r.next_to(eq_rk5, DOWN, buff=0.30)
        self.play(FadeIn(hint_r))
        self.wait(1.2)
        self.play(FadeOut(VGroup(formula_head, eq_rk, eq_rk5, hint_r)))

        # ── Step 5: 两式相减，消去 k ──────────────────────────────────────
        sub_head = Text("两式相减，消去 k（关键技巧）：", font=CJK, color=YELLOW).scale(0.46)
        sub_head.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(sub_head))

        eq_diff1 = MathTex(
            r"r_{k+5}^2 - r_k^2",
            r"=",
            r"\left[(2(k+5)-1) - (2k-1)\right]",
            r"\frac{R\lambda}{2}"
        ).scale(0.72)
        eq_diff1[0].set_color(GREEN)
        eq_diff1[2].set_color(YELLOW)
        eq_diff1[3].set_color(CYAN)
        eq_diff1.next_to(sub_head, DOWN, buff=0.42)
        self.play(Write(eq_diff1))
        self.wait(1.0)

        # 化简括号
        eq_diff2 = MathTex(
            r"r_{k+5}^2 - r_k^2",
            r"=",
            r"\underbrace{10}_{\text{k cancelled}}",
            r"\cdot \frac{R\lambda}{2}"
        ).scale(0.82)
        eq_diff2[0].set_color(GREEN)
        eq_diff2[2].set_color(RED)
        eq_diff2[3].set_color(CYAN)
        eq_diff2.next_to(eq_diff1, DOWN, buff=0.38)
        self.play(Write(eq_diff2))
        self.wait(0.8)

        # 最终简化
        eq_diff3 = MathTex(
            r"r_{k+5}^2 - r_k^2",
            r"=",
            r"5 R \lambda"
        ).scale(0.92)
        eq_diff3[0].set_color(GREEN)
        eq_diff3[2].set_color(YELLOW)
        eq_diff3.next_to(eq_diff2, DOWN, buff=0.35)
        box_diff3 = SurroundingRectangle(eq_diff3, color=YELLOW, buff=0.14, corner_radius=0.1)
        self.play(Write(eq_diff3), Create(box_diff3))
        self.wait(1.6)

        cancel_note = Text("k 被完全消去！只剩几何量，精度大幅提升。", font=CJK, color=RED).scale(0.42)
        cancel_note.next_to(eq_diff3, DOWN, buff=0.28)
        self.play(FadeIn(cancel_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(sub_head, eq_diff1, eq_diff2, eq_diff3, box_diff3, cancel_note)))

        # ── Step 6: 推导最终公式（黑板风格逐行展示）──────────────────────
        board_bg = Rectangle(
            width=11.5, height=5.2, color="#1a2a1a", fill_opacity=0.85
        ).next_to(title, DOWN, buff=0.35)
        board_title = Text("推导过程（黑板）", font=CJK, color=GREEN).scale(0.44)
        board_title.move_to(board_bg.get_top() + DOWN * 0.38)

        self.play(FadeIn(board_bg), FadeIn(board_title))

        # 行1
        row1_lbl = Text("已知：", font=CJK, color=WHITE).scale(0.42)
        row1_eq = MathTex(r"r_{k+5}^2 - r_k^2 = 5R\lambda").scale(0.78)
        row1_eq[0].set_color(CYAN)
        row1 = VGroup(row1_lbl, row1_eq).arrange(RIGHT, buff=0.18)
        row1.move_to(board_bg.get_top() + DOWN * 1.1)

        # 行2
        row2_lbl = Text("整理得：", font=CJK, color=WHITE).scale(0.42)
        row2_eq = MathTex(r"\lambda = \frac{r_{k+5}^2 - r_k^2}{5R}").scale(0.88)
        row2_eq[0][0].set_color(YELLOW)
        row2 = VGroup(row2_lbl, row2_eq).arrange(RIGHT, buff=0.18)
        row2.move_to(board_bg.get_top() + DOWN * 2.15)

        # 行3
        row3_lbl = Text("测量值：", font=CJK, color=WHITE).scale(0.42)
        row3_eq = MathTex(
            r"r_k = 1.50\,\text{mm},\quad r_{k+5} = 2.30\,\text{mm},\quad R = 1.03\,\text{m}"
        ).scale(0.62)
        row3_eq.set_color(ORANGE)
        row3 = VGroup(row3_lbl, row3_eq).arrange(RIGHT, buff=0.18)
        row3.move_to(board_bg.get_top() + DOWN * 3.15)

        # 行4
        row4_lbl = Text("代入得：", font=CJK, color=WHITE).scale(0.42)
        row4_eq = MathTex(
            r"\lambda = \frac{(2.30)^2 - (1.50)^2}{5 \times 1.03}\,\frac{\text{mm}^2}{\text{m}}"
        ).scale(0.70)
        row4 = VGroup(row4_lbl, row4_eq).arrange(RIGHT, buff=0.18)
        row4.move_to(board_bg.get_top() + DOWN * 4.15)

        self.play(FadeIn(row1))
        self.wait(0.9)
        self.play(FadeIn(row2))
        self.wait(0.9)
        self.play(FadeIn(row3))
        self.wait(0.9)
        self.play(FadeIn(row4))
        self.wait(1.2)
        self.play(FadeOut(VGroup(board_bg, board_title, row1, row2, row3, row4)))

        # ── Step 7: 数值计算过程动画 ─────────────────────────────────────
        calc_head = Text("数值代入计算：", font=CJK, color=CYAN).scale(0.48)
        calc_head.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(calc_head))

        # 平方差计算
        sq_lbl = Text("分子：", font=CJK, color=WHITE).scale(0.44)
        sq_eq = MathTex(
            r"r_{k+5}^2 - r_k^2",
            r"= 2.30^2 - 1.50^2",
            r"= 5.29 - 2.25",
            r"= 3.04 \; (\text{mm}^2)"
        ).scale(0.70)
        sq_eq[0].set_color(GREEN)
        sq_eq[3].set_color(YELLOW)
        sq_row = VGroup(sq_lbl, sq_eq).arrange(RIGHT, buff=0.18)
        sq_row.next_to(calc_head, DOWN, buff=0.45)
        self.play(Write(sq_row[0]), Write(sq_eq[0]))
        self.wait(0.5)
        self.play(Write(sq_eq[1]))
        self.wait(0.5)
        self.play(Write(sq_eq[2]))
        self.wait(0.5)
        self.play(Write(sq_eq[3]))
        self.wait(0.9)

        # 分母
        den_lbl = Text("分母：", font=CJK, color=WHITE).scale(0.44)
        den_eq = MathTex(r"5R = 5 \times 1.03 \; (\text{m}) = 5.15 \; (\text{m})").scale(0.70)
        den_eq.set_color(ORANGE)
        den_row = VGroup(den_lbl, den_eq).arrange(RIGHT, buff=0.18)
        den_row.next_to(sq_row, DOWN, buff=0.38)
        self.play(FadeIn(den_row))
        self.wait(0.9)

        # 单位换算提示
        unit_text = Text("注意单位：mm² ÷ m = mm²/m = 10⁻⁶m²/m = 10⁻⁶m = μm", font=CJK, color=WHITE).scale(0.38)
        unit_text.next_to(den_row, DOWN, buff=0.32)
        self.play(FadeIn(unit_text))
        self.wait(1.0)

        # 最终结果
        result_eq = MathTex(
            r"\lambda",
            r"=",
            r"\frac{3.04 \times 10^{-6}}{5.15}",
            r"\approx",
            r"590 \; \text{nm}"
        ).scale(0.92)
        result_eq[0].set_color(YELLOW)
        result_eq[2].set_color(CYAN)
        result_eq[4].set_color(GREEN)
        result_eq.next_to(unit_text, DOWN, buff=0.42)
        box_result = SurroundingRectangle(result_eq, color=GREEN, buff=0.18, corner_radius=0.12)
        self.play(Write(result_eq), Create(box_result))
        self.wait(0.8)

        result_zh = Text("黄绿光，与钠黄光波长吻合！", font=CJK, color=GREEN).scale(0.44)
        result_zh.next_to(box_result, DOWN, buff=0.22)
        self.play(FadeIn(result_zh))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            calc_head, sq_row, den_row, unit_text, result_eq, box_result, result_zh
        )))

        # ── Step 8: 几何直觉 — 环半径与级次关系曲线 ──────────────────────
        geo_head = Text("几何直觉：暗环半径与级次的关系", font=CJK, color=CYAN).scale(0.46)
        geo_head.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(geo_head))

        # 参数：R=1.03m, λ=590e-9m → Rλ=6.077e-7 m²
        # r_k^2 = (2k-1)*Rλ/2 → r_k [mm] = sqrt((2k-1)*Rλ/2)*1000
        Rlam_half = 1.03 * 590e-9 / 2.0  # in m²

        axes = Axes(
            x_range=[0, 14, 2],
            y_range=[0, 3.0, 0.5],
            x_length=9.5,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
        ).shift(DOWN * 0.85)
        x_lbl = VGroup(
            Text("k", font=CJK).scale(0.40),
            Text("（环级次）", font=CJK).scale(0.36)
        ).arrange(RIGHT, buff=0.08)
        x_lbl.next_to(axes.x_axis.get_end(), DR, buff=0.12)
        y_lbl = VGroup(
            MathTex(r"r_k").scale(0.50),
            Text("(mm)", font=CJK).scale(0.36)
        ).arrange(RIGHT, buff=0.08)
        y_lbl.next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 绘制 r_k = sqrt((2k-1)*Rlam_half)*1000 曲线
        def rk_func(k):
            if k <= 0.5:
                return 0
            val = (2 * k - 1) * Rlam_half
            if val < 0:
                return 0
            return math.sqrt(val) * 1000  # mm

        curve = axes.plot(
            rk_func,
            x_range=[0.5, 13.5, 0.1],
            color=YELLOW,
            stroke_width=2.5,
        )
        self.play(Create(curve), run_time=1.8)

        # 标出 k=4 和 k=9（对应 r_k 和 r_{k+5}）
        k_val_a, k_val_b = 4, 9
        pt_a = axes.c2p(k_val_a, rk_func(k_val_a))
        pt_b = axes.c2p(k_val_b, rk_func(k_val_b))
        dot_a = Dot(pt_a, color=ORANGE, radius=0.10)
        dot_b = Dot(pt_b, color=GREEN, radius=0.10)
        lbl_a = MathTex(r"r_k", color=ORANGE).scale(0.56).next_to(dot_a, UR, buff=0.08)
        lbl_b = MathTex(r"r_{k+5}", color=GREEN).scale(0.56).next_to(dot_b, UR, buff=0.08)

        # 竖直虚线到 x 轴
        vline_a = DashedLine(axes.c2p(k_val_a, 0), pt_a, color=ORANGE, stroke_width=1.5)
        vline_b = DashedLine(axes.c2p(k_val_b, 0), pt_b, color=GREEN, stroke_width=1.5)

        self.play(
            Create(vline_a), Create(vline_b),
            FadeIn(dot_a), FadeIn(dot_b),
            FadeIn(lbl_a), FadeIn(lbl_b),
        )

        # 横向双箭头标注差值
        brace_line = DoubleArrow(
            axes.c2p(k_val_a, rk_func(k_val_a)),
            axes.c2p(k_val_b, rk_func(k_val_b)),
            color=WHITE, buff=0.0, tip_length=0.15
        )
        brace_lbl = MathTex(r"\Delta r^2 = 5R\lambda", color=WHITE).scale(0.52)
        brace_lbl.next_to(brace_line, UP, buff=0.14)
        self.play(Create(brace_line), FadeIn(brace_lbl))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            geo_head, axes, x_lbl, y_lbl, curve,
            dot_a, dot_b, lbl_a, lbl_b,
            vline_a, vline_b, brace_line, brace_lbl
        )))

        # ── Step 9: 方法要点总结 ────────────────────────────────────────
        tips_head = Text("方法要点", font=CJK, color=BLUE).scale(0.48)
        tips_head.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(tips_head))

        tip1 = VGroup(
            Text("1. 直接用单环半径测 λ：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"r_k^2=(2k-1)\frac{R\lambda}{2}", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.15)

        tip2_txt = Text("   但 k 难以数准，误差大。", font=CJK, color=RED).scale(0.43)

        tip3 = VGroup(
            Text("2. 改用两环之差消去 k：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"\lambda=\frac{r_{k+5}^2-r_k^2}{5R}", color=GREEN).scale(0.70),
        ).arrange(RIGHT, buff=0.15)

        tip4_txt = Text("   只需测半径，无需数环级次，精度高！", font=CJK, color=GREEN).scale(0.43)

        tips = VGroup(tip1, tip2_txt, tip3, tip4_txt).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        tips.next_to(tips_head, DOWN, buff=0.42)
        tips.scale_to_fit_width(12.5)

        self.play(FadeIn(tip1))
        self.wait(0.8)
        self.play(FadeIn(tip2_txt))
        self.wait(0.8)
        self.play(FadeIn(tip3))
        self.wait(0.8)
        self.play(FadeIn(tip4_txt))
        self.wait(1.5)
        self.play(FadeOut(VGroup(tips_head, tips)))

        # ── Step 10: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(s_title))

        s1_lbl = Text("核心公式：", font=CJK, color=WHITE).scale(0.44)
        s1_eq = MathTex(r"\lambda = \frac{r_{k+5}^2 - r_k^2}{5R}", color=YELLOW).scale(0.88)
        s1 = VGroup(s1_lbl, s1_eq).arrange(RIGHT, buff=0.18)

        s2_lbl = Text("本题代入：", font=CJK, color=WHITE).scale(0.44)
        s2_eq = MathTex(
            r"\lambda = \frac{(2.30)^2-(1.50)^2}{5\times1.03}\times10^{-3}\,\text{m}",
            color=CYAN
        ).scale(0.68)
        s2 = VGroup(s2_lbl, s2_eq).arrange(RIGHT, buff=0.18)

        s3_lbl = Text("计算结果：", font=CJK, color=WHITE).scale(0.44)
        s3_eq = MathTex(r"\lambda \approx 590\,\text{nm}", color=GREEN).scale(0.92)
        s3 = VGroup(s3_lbl, s3_eq).arrange(RIGHT, buff=0.18)

        s4_txt = Text("消去级次 k → 精度提升 → 实验室常用方法", font=CJK, color=WHITE).scale(0.42)

        summary = VGroup(s1, s2, s3, s4_txt).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(13.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4_txt), Create(box_sum))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.5)
