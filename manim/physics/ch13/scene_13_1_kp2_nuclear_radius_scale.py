"""第 13.1 节 · 核半径经验公式与尺度比较

教学目标：让零基础读者直观理解原子核有多小、R = R0·A^(1/3) 怎么用，
以及核密度为何远超日常物质。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常数
R0 = 1.2e-15  # m，核半径常数


class Ch13Kp2NuclearRadiusScale(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("核半径经验公式与尺度比较", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第十三章 原子核和放射性 · 13.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比——原子 vs 核 ────────────────────────────────
        ana1 = Text("如果把整个原子放大到足球场那么大，", font=CJK).scale(0.48)
        ana2 = Text("原子核只有球场中央一粒豌豆那么大。", font=CJK, color=YELLOW).scale(0.48)
        ana3 = Text("两者尺度相差约 10 万倍（10^5）！", font=CJK, color=ORANGE).scale(0.44)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_group))

        # ── Step 3: 原子 vs 核 图示（左大圆 = 原子，右小点 = 核）──────────
        atom_circle = Circle(radius=1.8, color=CYAN, stroke_width=2.5)
        atom_circle.move_to(LEFT * 3.5 + DOWN * 0.3)
        atom_label = Text("原子 (~1 A = 10^-10 m)", font=CJK, color=CYAN).scale(0.38)
        atom_label.next_to(atom_circle, DOWN, buff=0.18)

        # 核相对原子缩小 10^5 倍，视觉上用一个极小圆点表示
        nucleus_dot = Dot(point=RIGHT * 2.5 + DOWN * 0.3, radius=0.07, color=RED)
        nuc_label = Text("原子核 (~1 fm = 10^-15 m)", font=CJK, color=RED).scale(0.38)
        nuc_label.next_to(nucleus_dot, DOWN, buff=0.22)

        scale_note = VGroup(
            Text("两者半径之比：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\frac{r_{\rm atom}}{r_{\rm nucleus}}\sim 10^{5}", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.18)
        scale_note.next_to(title, DOWN, buff=0.48)

        self.play(FadeIn(scale_note))
        self.wait(0.8)
        self.play(Create(atom_circle), FadeIn(atom_label))
        self.wait(0.6)
        self.play(Create(nucleus_dot), FadeIn(nuc_label))
        self.wait(1.8)
        self.play(FadeOut(VGroup(atom_circle, atom_label, nucleus_dot, nuc_label, scale_note)))

        # ── Step 4: 经验公式定义（逐步出现 + 高亮）──────────────────────
        def_zh = Text("核半径经验公式（费米 1950 年代实验拟合）：", font=CJK, color=WHITE).scale(0.44)
        def_zh.next_to(title, DOWN, buff=0.5)
        formula_main = MathTex(
            r"R", r"=", r"R_0", r"A^{1/3}"
        ).scale(1.1)
        formula_main[0].set_color(YELLOW)
        formula_main[2].set_color(CYAN)
        formula_main[3].set_color(ORANGE)
        formula_main.next_to(def_zh, DOWN, buff=0.45)

        r0_note = VGroup(
            Text("其中", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"R_0 \approx 1.2 \times 10^{-15}\ \mathrm{m}", color=CYAN).scale(0.78),
            Text("，A 为质量数", font=CJK, color=WHITE).scale(0.42)
        ).arrange(RIGHT, buff=0.15)
        r0_note.next_to(formula_main, DOWN, buff=0.38)

        self.play(FadeIn(def_zh))
        self.wait(0.6)
        self.play(Write(formula_main))
        self.wait(1.0)
        self.play(FadeIn(r0_note))
        self.wait(1.5)

        # 标注：A^(1/3) 意义
        key_note = Text("关键：半径与 A^(1/3) 成正比，而非与 A 成正比", font=CJK, color=GREEN).scale(0.42)
        key_note.next_to(r0_note, DOWN, buff=0.35)
        self.play(FadeIn(key_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_zh, formula_main, r0_note, key_note)))

        # ── Step 5: ValueTracker 扫动 A，核半径圆实时缩放 ────────────────
        A_tracker = ValueTracker(1.0)

        # 核半径归一化：R(A) = R0 * A^(1/3)，视觉半径映射
        # A=1 时视觉半径 0.10，A=238 时视觉半径 0.10 * 238^(1/3) ≈ 0.62
        def vis_radius():
            A = A_tracker.get_value()
            return 0.12 * (A ** (1.0 / 3.0))

        # 核圆（always_redraw 随 A 变化）
        nucleus_anim = always_redraw(lambda: Circle(
            radius=vis_radius(),
            color=RED,
            fill_opacity=0.45,
            stroke_width=2
        ).move_to(ORIGIN + DOWN * 0.5))

        # 数值读出
        readout_R = always_redraw(lambda: VGroup(
            Text("A =", font=CJK, color=WHITE).scale(0.42),
            MathTex(rf"{int(A_tracker.get_value())}", color=ORANGE).scale(0.72),
            Text(",  R =", font=CJK, color=WHITE).scale(0.42),
            MathTex(
                rf"{R0 * (A_tracker.get_value() ** (1.0/3.0)) * 1e15:.2f}"
                r"\ \mathrm{fm}",
                color=YELLOW
            ).scale(0.68)
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.5))

        formula_hint = MathTex(r"R = R_0 A^{1/3}", color=CYAN).scale(0.75)
        formula_hint.next_to(title, DOWN, buff=0.45)

        scan_caption = Text("随质量数 A 增大，核半径增长缓慢（A^(1/3) 效应）", font=CJK, color=GREEN).scale(0.40)
        scan_caption.to_edge(DOWN, buff=0.55)

        self.play(FadeIn(formula_hint), Create(nucleus_anim), FadeIn(scan_caption))
        self.add(readout_R)
        self.wait(0.6)

        # A 从 1 → 238 扫动
        self.play(A_tracker.animate.set_value(238), run_time=4.0, rate_func=linear)
        self.wait(0.8)
        # 回到 A=1
        self.play(A_tracker.animate.set_value(1.0), run_time=1.5)
        self.wait(0.8)

        self.play(FadeOut(VGroup(formula_hint, scan_caption)), FadeOut(nucleus_anim))
        self.remove(readout_R)

        # ── Step 6: log-log 坐标轴（R vs A，斜率 1/3）────────────────────
        axes = Axes(
            x_range=[0, 6, 1],      # log10(A): 1~10^6 → 0~6
            y_range=[-16, -12, 1],  # log10(R/m)
            x_length=6.5,
            y_length=3.5,
            axis_config={"color": WHITE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.5)

        # 轴标签（纯 MathTex）
        x_label = MathTex(r"\log_{10} A", color=WHITE).scale(0.55)
        x_label.next_to(axes.x_axis, DOWN, buff=0.22)
        y_label = MathTex(r"\log_{10}(R/\mathrm{m})", color=WHITE).scale(0.50)
        y_label.next_to(axes.y_axis, LEFT, buff=0.15).rotate(PI / 2)

        # 轴刻度手动标注（避免负数 LaTeX 问题）
        x_ticks_labels = VGroup()
        for v, lbl in [(1, "10"), (2, "10^2"), (3, "10^3"), (5, "5\\times10^3")]:
            pt = axes.c2p(v, -16)
            tx = MathTex(lbl, color=CYAN).scale(0.38).move_to(pt + DOWN * 0.28)
            x_ticks_labels.add(tx)

        y_ticks_labels = VGroup()
        for v, lbl in [(-15, r"10^{-15}"), (-14, r"10^{-14}"), (-13, r"10^{-13}")]:
            pt = axes.c2p(0, v)
            tx = MathTex(lbl, color=CYAN).scale(0.38).move_to(pt + LEFT * 0.55)
            y_ticks_labels.add(tx)

        # 理论直线：log10(R) = log10(R0) + (1/3)*log10(A)
        # log10(R0) = log10(1.2e-15) ≈ -14.921
        log_R0 = math.log10(R0)

        def log_R_func(log_A):
            return log_R0 + (1.0 / 3.0) * log_A

        theory_line = axes.plot(
            log_R_func,
            x_range=[0.1, 5.5],
            color=YELLOW,
            stroke_width=2.5
        )

        slope_label = VGroup(
            Text("斜率 =", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\frac{1}{3}", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.1)
        slope_label.move_to(axes.c2p(4.0, -13.6))

        # 标注典型核
        nuclei = [
            (1,   "H",  r"{}^{1}\mathrm{H}"),
            (4,   "He", r"{}^{4}\mathrm{He}"),
            (56,  "Fe", r"{}^{56}\mathrm{Fe}"),
            (238, "U",  r"{}^{238}\mathrm{U}"),
        ]
        nuc_dots = VGroup()
        nuc_labels = VGroup()
        for A, _, tex_str in nuclei:
            logA = math.log10(A) if A > 0 else 0.001
            logR = log_R_func(logA)
            pt = axes.c2p(logA, logR)
            d = Dot(pt, radius=0.10, color=RED)
            lbl = MathTex(tex_str, color=ORANGE).scale(0.50).next_to(d, UP, buff=0.1)
            nuc_dots.add(d)
            nuc_labels.add(lbl)

        loglog_title = Text("log-log 图：R 与 A 呈斜率 1/3 的直线", font=CJK, color=BLUE).scale(0.42)
        loglog_title.next_to(title, DOWN, buff=0.38)

        self.play(FadeIn(loglog_title))
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(FadeIn(x_ticks_labels), FadeIn(y_ticks_labels))
        self.wait(0.6)
        self.play(Create(theory_line), run_time=1.8)
        self.play(FadeIn(slope_label))
        self.wait(0.8)
        self.play(Create(nuc_dots), FadeIn(nuc_labels))
        self.wait(2.0)
        self.play(FadeOut(VGroup(loglog_title, axes, x_label, y_label,
                                 x_ticks_labels, y_ticks_labels,
                                 theory_line, slope_label, nuc_dots, nuc_labels)))

        # ── Step 7: 尺度形象类比（足球场 vs 豌豆）──────────────────────────
        # 足球场轮廓（大矩形）
        stadium = Rectangle(width=7.0, height=3.8, color=GREEN, stroke_width=2.5)
        stadium.shift(DOWN * 0.4)
        stadium_label = Text("足球场（原子大小）", font=CJK, color=GREEN).scale(0.44)
        stadium_label.next_to(stadium, UP, buff=0.15)

        # 豌豆点（原子核大小）— 放在场中央
        pea = Dot(point=stadium.get_center(), radius=0.08, color=RED)
        pea_label = Text("豌豆（原子核）", font=CJK, color=RED).scale(0.40)
        pea_label.next_to(pea, RIGHT, buff=0.18)

        analogy_cap = Text("若把原子放大至足球场，核只相当于场中一粒豌豆", font=CJK, color=YELLOW).scale(0.42)
        analogy_cap.to_edge(DOWN, buff=0.5)

        scale_math = VGroup(
            Text("原子直径 ~ 1 A，核直径 ~ 1 fm，", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\frac{r_{\rm atom}}{r_{\rm nucleus}} \approx 10^{5}", color=CYAN).scale(0.72)
        ).arrange(RIGHT, buff=0.15)
        scale_math.next_to(title, DOWN, buff=0.42)

        self.play(FadeIn(scale_math))
        self.wait(0.6)
        self.play(Create(stadium), FadeIn(stadium_label))
        self.wait(0.6)
        self.play(Create(pea), FadeIn(pea_label))
        self.play(FadeIn(analogy_cap))
        self.wait(2.0)
        self.play(FadeOut(VGroup(scale_math, stadium, stadium_label, pea, pea_label, analogy_cap)))

        # ── Step 8: 核密度推导 ──────────────────────────────────────────
        density_intro = Text("原子核密度远超普通物质：", font=CJK, color=WHITE).scale(0.46)
        density_intro.next_to(title, DOWN, buff=0.52)

        rho_step1 = MathTex(
            r"m \approx A \cdot m_p,\quad V = \frac{4}{3}\pi R^3 = \frac{4}{3}\pi R_0^3 A"
        ).scale(0.72)
        rho_step1.next_to(density_intro, DOWN, buff=0.40)

        rho_step2 = MathTex(
            r"\rho = \frac{m}{V} = \frac{A \cdot m_p}{\frac{4}{3}\pi R_0^3 A}"
            r"= \frac{3 m_p}{4\pi R_0^3}"
        ).scale(0.72)
        rho_step2.next_to(rho_step1, DOWN, buff=0.38)

        rho_result = MathTex(
            r"\rho \approx 2.3 \times 10^{17}\ \mathrm{kg\cdot m^{-3}}",
            color=YELLOW
        ).scale(0.82)
        rho_result.next_to(rho_step2, DOWN, buff=0.38)

        rho_note = Text("与 A 无关！所有核密度相同，约为水密度的 2 亿亿倍", font=CJK, color=GREEN).scale(0.40)
        rho_note.next_to(rho_result, DOWN, buff=0.32)

        self.play(FadeIn(density_intro))
        self.play(Write(rho_step1))
        self.wait(1.0)
        self.play(Write(rho_step2))
        self.wait(1.0)
        self.play(Write(rho_result))
        self.wait(0.8)
        self.play(FadeIn(rho_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(density_intro, rho_step1, rho_step2, rho_result, rho_note)))

        # ── Step 9: 数值例题 ────────────────────────────────────────────
        ex_title = Text("数值例题", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.50)

        ex_q = Text("求铁核 (A=56) 和铀核 (A=238) 的半径，并计算比值。", font=CJK).scale(0.42)
        ex_q.next_to(ex_title, DOWN, buff=0.38)

        ex_fe = MathTex(
            r"R_{\rm Fe} = 1.2 \times 56^{1/3}\ \mathrm{fm}"
            r"\approx 1.2 \times 3.83\ \mathrm{fm}"
            r"\approx 4.6\ \mathrm{fm}"
        ).scale(0.68)
        ex_fe.next_to(ex_q, DOWN, buff=0.35)
        ex_fe.set_color(GREEN)

        ex_u = MathTex(
            r"R_{\rm U} = 1.2 \times 238^{1/3}\ \mathrm{fm}"
            r"\approx 1.2 \times 6.20\ \mathrm{fm}"
            r"\approx 7.4\ \mathrm{fm}"
        ).scale(0.68)
        ex_u.next_to(ex_fe, DOWN, buff=0.28)
        ex_u.set_color(GREEN)

        ex_ratio = MathTex(
            r"\frac{R_{\rm U}}{R_{\rm Fe}} = \left(\frac{238}{56}\right)^{1/3} \approx 1.62"
        ).scale(0.80)
        ex_ratio.next_to(ex_u, DOWN, buff=0.35)
        ex_ratio.set_color(YELLOW)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_q))
        self.wait(0.6)
        self.play(Write(ex_fe))
        self.wait(0.8)
        self.play(Write(ex_u))
        self.wait(0.8)
        self.play(Write(ex_ratio))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex_q, ex_fe, ex_u, ex_ratio)))

        # ── Step 10: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.48)

        s1 = MathTex(r"R = R_0 A^{1/3},\quad R_0 \approx 1.2\ \mathrm{fm}", color=YELLOW).scale(0.82)
        s2 = MathTex(r"\rho \approx 2.3 \times 10^{17}\ \mathrm{kg\cdot m^{-3}}\quad (\text{const})", color=CYAN).scale(0.74)

        s3_row = VGroup(
            Text("原子核极小：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"r_{\rm nucleus}/r_{\rm atom} \sim 10^{-5}", color=ORANGE).scale(0.68)
        ).arrange(RIGHT, buff=0.12)

        s4 = Text("log-log 图中 R-A 关系为斜率 1/3 的直线", font=CJK, color=GREEN).scale(0.40)

        s_group = VGroup(s1, s2, s3_row, s4).arrange(DOWN, buff=0.38)
        s_group.next_to(s_title, DOWN, buff=0.42)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3_row))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch13Kp2NuclearRadiusScale",
        "id": "phys-ch13-13.1-kp2-nuclear-radius-scale",
        "chapterId": "ch13",
        "sectionId": "13.1",
        "title": "核半径经验公式与尺度比较",
        "description": "通过 R=R0·A^(1/3) 公式推导、log-log 图和足球场/豌豆类比，直观展示原子核的极小尺度与恒定超高密度。",
    }
]
