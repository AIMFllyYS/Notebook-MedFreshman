"""第 13.2 节 · 例题：Na-24 示踪估算全身血容量。

放射性示踪法（稀释法）经典例题：
    注射 A0=3e5 Bq 的 Na-24（T=14.8 h），10 h 后抽取 1 cm³ 血样
    测得活度 30 Bq，反推全身血液体积 V。

动画四步走：
    Step 1 流程示意图（注射 → 扩散 → 衰变 → 取样）
    Step 2 活度-时间衰减曲线，t=10h 竖线标注 A(t)
    Step 3 稀释法核心：30V = A(t) → V = 6260 cm³
    Step 4 衰变常数与指数计算过程

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch13Ex3Na24BloodVolume(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("Na-24 示踪：估算全身血容量", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第十三章 原子核与放射性 · 13.2  例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text("把一勺盐溶入一池水，再取一勺水测盐浓度，", font=CJK).scale(0.48)
        ana2 = Text("就能反推出池水总量——放射性示踪法原理相同。", font=CJK).scale(0.48)
        ana3 = Text("只是「盐」换成了微量放射性 Na-24，浓度用活度来量。", font=CJK, color=CYAN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 流程示意图 ──────────────────────────────────────────
        flow_title = Text("实验流程", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(flow_title))

        # 四个节点框
        def make_box(text_lines, color=WHITE, width=2.6, height=1.0):
            rect = RoundedRectangle(width=width, height=height, corner_radius=0.15,
                                    color=color, fill_color=color, fill_opacity=0.08, stroke_width=2)
            labels = VGroup(*[Text(t, font=CJK, color=color).scale(0.36) for t in text_lines])
            labels.arrange(DOWN, buff=0.1)
            labels.move_to(rect.get_center())
            return VGroup(rect, labels)

        b1 = make_box(["注射 Na-24", "A₀ = 3×10⁵ Bq"], color=GREEN)
        b2 = make_box(["均匀扩散", "至全身血液（V）"], color=YELLOW)
        b3 = make_box(["等待 t = 10 h", "放射性衰变"], color=ORANGE)
        b4 = make_box(["取 1 cm³ 血样", "测活度 = 30 Bq"], color=RED)

        flow = VGroup(b1, b2, b3, b4).arrange(RIGHT, buff=0.55)
        flow.next_to(flow_title, DOWN, buff=0.45)
        flow.scale_to_fit_width(13.0)

        arrows_flow = VGroup(
            Arrow(b1.get_right(), b2.get_left(), buff=0.05, color=WHITE, stroke_width=3),
            Arrow(b2.get_right(), b3.get_left(), buff=0.05, color=WHITE, stroke_width=3),
            Arrow(b3.get_right(), b4.get_left(), buff=0.05, color=WHITE, stroke_width=3),
        )

        self.play(FadeIn(b1))
        self.wait(0.4)
        self.play(GrowArrow(arrows_flow[0]), FadeIn(b2))
        self.wait(0.4)
        self.play(GrowArrow(arrows_flow[1]), FadeIn(b3))
        self.wait(0.4)
        self.play(GrowArrow(arrows_flow[2]), FadeIn(b4))
        self.wait(1.8)

        # 目标问题
        q_text = Text("已知上述条件，求全身血液总体积 V = ?", font=CJK, color=CYAN).scale(0.44)
        q_text.next_to(flow, DOWN, buff=0.35)
        self.play(FadeIn(q_text))
        self.wait(1.5)
        self.play(FadeOut(VGroup(flow_title, b1, b2, b3, b4, arrows_flow, q_text)))

        # ── Step 4: 活度-时间衰减曲线 ────────────────────────────────────
        curve_title = Text("活度随时间衰减", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(curve_title))

        T_half = 14.8          # h
        lam = math.log(2) / T_half   # h⁻¹  ≈ 0.04682
        A0 = 3.0e5             # Bq
        t_sample = 10.0        # h
        At = A0 * math.exp(-lam * t_sample)  # ≈ 1.878e5 Bq

        axes = Axes(
            x_range=[0, 30, 5],
            y_range=[0, 3.2e5, 1e5],
            x_length=9.5,
            y_length=3.5,
            axis_config={"color": BLUE, "include_tip": True},
            y_axis_config={"decimal_number_config": {"num_decimal_places": 0}},
        ).shift(DOWN * 0.55)

        x_lbl = VGroup(
            Text("t", font=CJK, color=WHITE).scale(0.4),
            Text("(h)", font=CJK, color=WHITE).scale(0.35),
        ).arrange(RIGHT, buff=0.05).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)

        y_lbl = VGroup(
            Text("A", font=CJK, color=WHITE).scale(0.4),
            Text("(Bq)", font=CJK, color=WHITE).scale(0.35),
        ).arrange(RIGHT, buff=0.05).next_to(axes.y_axis.get_end(), LEFT, buff=0.1)

        decay_curve = axes.plot(
            lambda x: A0 * math.exp(-lam * x),
            x_range=[0, 29.5],
            color=YELLOW,
            stroke_width=3,
        )

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(decay_curve), run_time=2.0)
        self.wait(0.6)

        # 初始点标注
        dot_a0 = Dot(axes.c2p(0, A0), color=GREEN, radius=0.10)
        lbl_a0 = VGroup(
            Text("A", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"_0", color=GREEN).scale(0.55),
            Text("= 3.0×10⁵ Bq", font=CJK, color=GREEN).scale(0.36),
        ).arrange(RIGHT, buff=0.04)
        lbl_a0.next_to(dot_a0, RIGHT, buff=0.12)
        self.play(FadeIn(dot_a0), FadeIn(lbl_a0))
        self.wait(0.8)

        # t=10h 竖线 + A(t) 标注
        t10_x = axes.c2p(t_sample, 0)[0]
        t10_top = axes.c2p(t_sample, At)
        t10_bot = axes.c2p(t_sample, 0)
        vline = DashedLine(t10_bot, t10_top, color=CYAN, stroke_width=2.5)

        dot_at = Dot(axes.c2p(t_sample, At), color=RED, radius=0.11)

        lbl_at = VGroup(
            Text("A(t) = 1.878×10⁵ Bq", font=CJK, color=RED).scale(0.36),
        )
        lbl_at.next_to(dot_at, RIGHT, buff=0.14)

        t_tick = VGroup(
            Text("t = 10 h", font=CJK, color=CYAN).scale(0.36),
        ).next_to(axes.c2p(t_sample, 0), DOWN, buff=0.14)

        self.play(Create(vline), FadeIn(dot_at), FadeIn(t_tick))
        self.play(FadeIn(lbl_at))
        self.wait(1.8)

        # 半衰期位置辅助标注
        t_half_pt = axes.c2p(T_half, A0 / 2)
        dot_half = Dot(t_half_pt, color=ORANGE, radius=0.08)
        lbl_half = VGroup(
            Text("T = 14.8 h", font=CJK, color=ORANGE).scale(0.33),
        ).next_to(dot_half, UR, buff=0.1)
        self.play(FadeIn(dot_half), FadeIn(lbl_half))
        self.wait(1.4)

        self.play(FadeOut(VGroup(
            curve_title, axes, x_lbl, y_lbl, decay_curve,
            dot_a0, lbl_a0, vline, dot_at, lbl_at, t_tick, dot_half, lbl_half,
        )))

        # ── Step 5: 衰变常数计算（逐步展示）────────────────────────────────
        calc_title = Text("第一步：衰变常数 λ", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_title))

        lam_def = MathTex(r"\lambda = \frac{\ln 2}{T}").scale(0.95)
        lam_sub = MathTex(r"= \frac{0.693}{14.8\,\mathrm{h}}").scale(0.95)
        lam_val = MathTex(r"= 0.0468\,\mathrm{h}^{-1}", color=YELLOW).scale(0.95)

        lam_group = VGroup(lam_def, lam_sub, lam_val).arrange(RIGHT, buff=0.3)
        lam_group.next_to(calc_title, DOWN, buff=0.55)

        self.play(Write(lam_def))
        self.wait(0.7)
        self.play(Write(lam_sub))
        self.wait(0.7)
        self.play(Write(lam_val))
        self.wait(1.4)

        # 指数因子
        exp_title = Text("指数衰减因子  e^(-λt)", font=CJK, color=WHITE).scale(0.44)
        exp_title.next_to(lam_group, DOWN, buff=0.5)

        exp_step1 = MathTex(r"e^{-\lambda t} = e^{-0.0468 \times 10}").scale(0.9)
        exp_step2 = MathTex(r"= e^{-0.468}").scale(0.9)
        exp_step3 = MathTex(r"\approx 0.6260", color=YELLOW).scale(0.9)

        exp_row = VGroup(exp_step1, exp_step2, exp_step3).arrange(RIGHT, buff=0.3)
        exp_row.next_to(exp_title, DOWN, buff=0.35)

        self.play(FadeIn(exp_title))
        self.play(Write(exp_step1))
        self.wait(0.5)
        self.play(Write(exp_step2))
        self.wait(0.5)
        self.play(Write(exp_step3))
        self.wait(1.5)

        self.play(FadeOut(VGroup(calc_title, lam_group, exp_title, exp_row)))

        # ── Step 6: A(t) 计算 ────────────────────────────────────────────
        at_title = Text("第二步：t = 10 h 时全身血液总活度 A(t)", font=CJK, color=BLUE).scale(0.48)
        at_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(at_title))

        at_eq1 = MathTex(r"A(t) = A_0 \cdot e^{-\lambda t}").scale(0.92)
        at_eq2 = MathTex(r"= 3.0\times10^5 \times 0.6260").scale(0.92)
        at_eq3 = MathTex(r"= 1.878\times10^5\,\mathrm{Bq}", color=GREEN).scale(0.92)

        at_steps = VGroup(at_eq1, at_eq2, at_eq3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        at_steps.next_to(at_title, DOWN, buff=0.5)

        self.play(Write(at_eq1))
        self.wait(0.7)
        at_eq1.set_color(YELLOW)
        self.play(Write(at_eq2))
        self.wait(0.7)
        self.play(Write(at_eq3))

        box_at = SurroundingRectangle(at_eq3, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(box_at))
        self.wait(1.8)
        self.play(FadeOut(VGroup(at_title, at_steps, box_at)))

        # ── Step 7: 稀释法核心动画 ──────────────────────────────────────
        dil_title = Text("第三步：稀释法——用浓度反推总量", font=CJK, color=BLUE).scale(0.50)
        dil_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(dil_title))

        # 左侧：大容器（全身血液）示意
        big_rect = Rectangle(width=3.0, height=3.5, color=RED, fill_color=RED, fill_opacity=0.12, stroke_width=2)
        big_rect.shift(LEFT * 3.8 + DOWN * 0.5)
        big_lbl1 = Text("全身血液", font=CJK, color=RED).scale(0.44)
        big_lbl2 = Text("体积 = V cm³", font=CJK, color=RED).scale(0.40)
        big_lbl3 = Text("总活度 = 30V Bq", font=CJK, color=ORANGE).scale(0.40)
        big_lbl = VGroup(big_lbl1, big_lbl2, big_lbl3).arrange(DOWN, buff=0.2)
        big_lbl.move_to(big_rect.get_center())

        # 右侧：小试管（1 cm³ 血样）示意
        small_rect = Rectangle(width=1.2, height=1.8, color=YELLOW, fill_color=YELLOW, fill_opacity=0.15, stroke_width=2)
        small_rect.shift(RIGHT * 1.2 + DOWN * 1.0)
        sm_lbl1 = Text("1 cm³", font=CJK, color=YELLOW).scale(0.38)
        sm_lbl2 = Text("30 Bq", font=CJK, color=YELLOW).scale(0.38)
        sm_lbl = VGroup(sm_lbl1, sm_lbl2).arrange(DOWN, buff=0.15)
        sm_lbl.move_to(small_rect.get_center())

        arrow_sample = Arrow(big_rect.get_right(), small_rect.get_left(), buff=0.1,
                             color=WHITE, stroke_width=2.5)
        sample_note = Text("取样", font=CJK, color=WHITE).scale(0.38)
        sample_note.next_to(arrow_sample, UP, buff=0.1)

        self.play(FadeIn(big_rect), Write(big_lbl))
        self.wait(0.6)
        self.play(GrowArrow(arrow_sample), FadeIn(sample_note))
        self.play(FadeIn(small_rect), Write(sm_lbl))
        self.wait(1.0)

        # 右侧：稀释方程
        dil_eq1 = Text("均匀混合 → 浓度一致：", font=CJK, color=WHITE).scale(0.42)
        dil_eq2 = MathTex(r"\frac{30}{1\,\mathrm{cm}^3} = \frac{A(t)}{V}").scale(0.88)
        dil_eq3 = MathTex(r"30V = A(t) = 1.878\times10^5\,\mathrm{Bq}").scale(0.84)
        dil_eq4 = MathTex(r"V = \frac{1.878\times10^5}{30}", color=CYAN).scale(0.88)
        dil_eq5 = MathTex(r"V \approx 6260\,\mathrm{cm}^3 = 6.26\,\mathrm{L}", color=GREEN).scale(0.92)

        dil_rhs = VGroup(dil_eq1, dil_eq2, dil_eq3, dil_eq4, dil_eq5).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        dil_rhs.next_to(small_rect, RIGHT, buff=0.55)
        dil_rhs.shift(UP * 0.6)
        dil_rhs.scale_to_fit_width(5.8)

        self.play(FadeIn(dil_eq1))
        self.wait(0.4)
        self.play(Write(dil_eq2))
        self.wait(0.7)
        self.play(Write(dil_eq3))
        self.wait(0.7)
        self.play(Write(dil_eq4))
        self.wait(0.7)
        self.play(Write(dil_eq5))
        dil_eq5.set_color(GREEN)
        box_v = SurroundingRectangle(dil_eq5, color=GREEN, buff=0.15, corner_radius=0.10)
        self.play(Create(box_v))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            dil_title, big_rect, big_lbl, small_rect, sm_lbl,
            arrow_sample, sample_note, dil_rhs, box_v,
        )))

        # ── Step 8: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = MathTex(r"\lambda = \frac{\ln 2}{T_{1/2}} = \frac{0.693}{14.8}\,\mathrm{h}^{-1} = 0.0468\,\mathrm{h}^{-1}",
                     color=YELLOW).scale(0.72)
        s2 = MathTex(r"A(t) = A_0 e^{-\lambda t} = 3.0\times10^5 \times e^{-0.468} \approx 1.878\times10^5\,\mathrm{Bq}",
                     color=YELLOW).scale(0.68)
        s3 = MathTex(r"V = \frac{A(t)}{a_{\text{sample}}} = \frac{1.878\times10^5}{30} \approx 6260\,\mathrm{cm}^3 = 6.26\,\mathrm{L}",
                     color=GREEN).scale(0.68)

        s_note = Text("放射性稀释法：注射已知活度示踪剂，衰变校正后除以单位体积活度，得总体积。",
                      font=CJK, color=WHITE).scale(0.38)

        s_group = VGroup(s1, s2, s3, s_note).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(13.0)

        box_sum = SurroundingRectangle(s_group, color=BLUE, buff=0.32, corner_radius=0.18)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s_note))
        self.play(Create(box_sum))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, s_group, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch13Ex3Na24BloodVolume",
        "id": "phys-ch13-13.2-ex3-na24-blood-volume",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "Na-24 示踪估算全身血容量",
        "description": "用放射性稀释法四步推导：注射活度→衰减曲线→稀释方程→反求全身血液体积 6.26 L。",
    },
]
