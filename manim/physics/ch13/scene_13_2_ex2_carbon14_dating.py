"""第 13.2 节 · 例题：碳-14 测年法推算古尸年代

通过指数衰减曲线与逐步公式推导，展示如何由 ¹⁴C/¹²C 比值反算古尸距今年代约 9090 年，
并演示如何从活度 1 Bq 反推现存核数 2.61×10¹¹。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常量
T_HALF = 5730.0           # 碳-14 半衰期（年）
LAM = math.log(2) / T_HALF  # 衰变常数 λ
N0_RATIO = 1.30e-12       # 死亡时 ¹⁴C/¹²C
N_RATIO = 4.33e-13        # 测量时 ¹⁴C/¹²C
T_RESULT = math.log(N0_RATIO / N_RATIO) / math.log(2) * T_HALF  # ≈ 9090 年


class Ch13Ex2Carbon14Dating(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("碳-14 测年法推算古尸年代", font=CJK, color=BLUE).scale(0.68)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第 13 章 · 原子核与放射性  13.2 例题", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.0)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text("活体生物不断从大气摄取碳，¹⁴C/¹²C 比值保持恒定。", font=CJK).scale(0.46)
        ana2 = Text("生物死亡后停止摄入，¹⁴C 以 T₁/₂ = 5730 年持续衰减。", font=CJK).scale(0.46)
        ana3 = Text("测出当前比值，就能推算「死了多久」。", font=CJK, color=GREEN).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.5)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(1.2)
        self.play(FadeOut(ana))

        # ── Step 3: 已知量与目标 ──────────────────────────────────────────
        known_title = Text("已知量", font=CJK, color=YELLOW).scale(0.50)
        known_title.next_to(title, DOWN, buff=0.55)
        known_title.to_edge(LEFT, buff=0.6)

        k1_lbl = Text("半衰期 T  =", font=CJK).scale(0.44)
        k1_val = MathTex(r"5730\,\mathrm{a}").scale(0.72)
        k1 = VGroup(k1_lbl, k1_val).arrange(RIGHT, buff=0.12)

        k2_lbl = Text("死亡时比值 N₀/C  =", font=CJK).scale(0.44)
        k2_val = MathTex(r"1.30\times10^{-12}").scale(0.72)
        k2 = VGroup(k2_lbl, k2_val).arrange(RIGHT, buff=0.12)

        k3_lbl = Text("测量时比值 N/C  =", font=CJK).scale(0.44)
        k3_val = MathTex(r"4.33\times10^{-13}").scale(0.72)
        k3 = VGroup(k3_lbl, k3_val).arrange(RIGHT, buff=0.12)

        known = VGroup(k1, k2, k3).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        known.next_to(known_title, DOWN, buff=0.30).to_edge(LEFT, buff=0.6)
        known.scale_to_fit_width(6.0)

        ask_lbl = Text("求：样品距今年代 t = ?", font=CJK, color=CYAN).scale(0.48)
        ask_lbl.next_to(known, DOWN, buff=0.45).to_edge(LEFT, buff=0.6)

        self.play(FadeIn(known_title))
        self.play(FadeIn(k1), FadeIn(k2), FadeIn(k3))
        self.wait(0.6)
        self.play(FadeIn(ask_lbl))
        self.wait(1.2)
        self.play(FadeOut(VGroup(known_title, known, ask_lbl)))

        # ── Step 4: 指数衰减曲线 + 两个标注点 ──────────────────────────────
        # 性能修复：Axes 的 y_range 若用 ~1e-12 量级的极小浮点步长，会触发
        # NumberLine 刻度生成卡死（manim 在极小 step 下构造 Axes 会无限/超长循环）。
        # 解决：y 轴用「以 1e-12 为单位」的常规量级数值（include_numbers=False 视觉不变）。
        YSCALE = 1e12  # 把比值乘以该系数后再喂给坐标系
        axes = Axes(
            x_range=[0, 12000, 3000],
            y_range=[0, 1.6, 0.4],
            x_length=9.0,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 2},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        ).shift(DOWN * 0.5 + LEFT * 0.5)

        x_label = Text("年代  t (年)", font=CJK, color=BLUE).scale(0.38)
        x_label.next_to(axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_label = VGroup(
            Text("¹⁴C/¹²C", font=CJK, color=BLUE).scale(0.38),
        )
        y_label.next_to(axes.y_axis.get_end(), UP, buff=0.08)

        curve = axes.plot(
            lambda x: N0_RATIO * YSCALE * math.exp(-LAM * x),
            x_range=[0, 11500, 250],
            color=YELLOW,
            stroke_width=3,
        )

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(curve), run_time=1.5)
        self.wait(0.5)

        # 死亡时 t=0 绿点
        p_start = axes.c2p(0, N0_RATIO * YSCALE)
        dot_start = Dot(p_start, color=GREEN, radius=0.11)
        lbl_start = VGroup(
            Text("死亡时 N₀/C =", font=CJK, color=GREEN).scale(0.36),
            MathTex(r"1.30\times10^{-12}", color=GREEN).scale(0.55),
        ).arrange(DOWN, buff=0.06)
        lbl_start.next_to(dot_start, UP + RIGHT, buff=0.1)

        # 测量时 t≈9090 红点
        p_end = axes.c2p(T_RESULT, N_RATIO * YSCALE)
        dot_end = Dot(p_end, color=RED, radius=0.11)
        lbl_end = VGroup(
            Text("测量值 N/C =", font=CJK, color=RED).scale(0.36),
            MathTex(r"4.33\times10^{-13}", color=RED).scale(0.55),
        ).arrange(DOWN, buff=0.06)
        lbl_end.next_to(dot_end, RIGHT, buff=0.15)

        self.play(FadeIn(dot_start), FadeIn(lbl_start))
        self.wait(0.5)
        self.play(FadeIn(dot_end), FadeIn(lbl_end))
        self.wait(0.5)

        # 垂直虚线标注时间距离
        vline_start = DashedLine(axes.c2p(0, 0), axes.c2p(0, N0_RATIO * YSCALE), color=GREEN, stroke_width=2)
        vline_end = DashedLine(axes.c2p(T_RESULT, 0), axes.c2p(T_RESULT, N_RATIO * YSCALE), color=RED, stroke_width=2)
        hline = DashedLine(axes.c2p(0, 0), axes.c2p(T_RESULT, 0), color=CYAN, stroke_width=2.5)
        t_brace = Brace(hline, DOWN, buff=0.1, color=CYAN)
        t_brace_lbl = VGroup(
            Text("所求年代", font=CJK, color=CYAN).scale(0.40),
            MathTex(r"t\approx 9090\,\mathrm{a}", color=CYAN).scale(0.65),
        ).arrange(DOWN, buff=0.08)
        t_brace_lbl.next_to(t_brace, DOWN, buff=0.12)

        self.play(Create(vline_start), Create(vline_end), Create(hline))
        self.play(GrowFromCenter(t_brace), FadeIn(t_brace_lbl))
        self.wait(1.5)

        # 清场（保留 title）
        self.play(FadeOut(VGroup(
            axes, x_label, y_label, curve,
            dot_start, lbl_start, dot_end, lbl_end,
            vline_start, vline_end, hline, t_brace, t_brace_lbl,
        )))

        # ── Step 5: 公式推导 —— 逐步出现 ─────────────────────────────────
        deriv_title = Text("解题步骤", font=CJK, color=YELLOW).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.55)

        # 步骤 1：写出衰变方程
        eq1_lbl = Text("衰变方程：", font=CJK).scale(0.44)
        eq1 = MathTex(r"\frac{N}{N_0} = e^{-\lambda t}").scale(0.82)
        row1 = VGroup(eq1_lbl, eq1).arrange(RIGHT, buff=0.2)

        # 步骤 2：代入数值
        eq2_lbl = Text("代入数值：", font=CJK).scale(0.44)
        eq2 = MathTex(
            r"\frac{4.33\times10^{-13}}{1.30\times10^{-12}}",
            r"= 0.333",
            r"= e^{-\lambda t}",
        ).scale(0.72)
        eq2[0].set_color(CYAN)
        eq2[1].set_color(YELLOW)
        row2 = VGroup(eq2_lbl, eq2).arrange(RIGHT, buff=0.2)

        # 步骤 3：反解 t
        eq3_lbl = Text("反解 t：", font=CJK).scale(0.44)
        eq3 = MathTex(
            r"t = \frac{\ln(N_0/N)}{\lambda}",
            r"= \frac{\ln(N_0/N)}{\ln 2}\,T",
        ).scale(0.78)
        eq3[1].set_color(YELLOW)
        row3 = VGroup(eq3_lbl, eq3).arrange(RIGHT, buff=0.2)

        # 步骤 4：代入 T = 5730
        eq4_lbl = Text("代入 T = 5730 a：", font=CJK).scale(0.44)
        eq4 = MathTex(
            r"t = \frac{\ln(1.30\times10^{-12}/4.33\times10^{-13})}{0.693}\times 5730",
            r"\approx 9090\,\mathrm{a}",
        ).scale(0.68)
        eq4[1].set_color(GREEN)
        row4 = VGroup(eq4_lbl, eq4).arrange(RIGHT, buff=0.2)

        steps = VGroup(row1, row2, row3, row4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        steps.next_to(deriv_title, DOWN, buff=0.45)
        steps.scale_to_fit_width(13.0)

        self.play(FadeIn(deriv_title))

        self.play(FadeIn(row1))
        self.wait(0.8)
        self.play(FadeIn(row2))
        self.wait(0.8)
        self.play(FadeIn(row3))
        self.wait(0.8)
        self.play(FadeIn(row4))
        self.wait(1.3)

        # 结论框
        result_lbl = Text("距今约", font=CJK, color=GREEN).scale(0.55)
        result_val = MathTex(r"9090\,\mathrm{a}", color=GREEN).scale(0.85)
        result_inner = VGroup(result_lbl, result_val).arrange(RIGHT, buff=0.15)
        result_box = SurroundingRectangle(result_inner, color=GREEN, buff=0.25, corner_radius=0.12)
        result_group = VGroup(result_inner, result_box)
        result_group.next_to(steps, DOWN, buff=0.45)

        self.play(FadeIn(result_inner), Create(result_box))
        self.wait(1.5)

        self.play(FadeOut(VGroup(deriv_title, steps, result_group)))

        # ── Step 6: 侧边推导 —— 活度反推核数 ──────────────────────────────
        side_title = Text("进阶：从活度反推现存核数 N", font=CJK, color=YELLOW).scale(0.50)
        side_title.next_to(title, DOWN, buff=0.55)

        # 活度定义
        s1_lbl = Text("活度定义：", font=CJK).scale(0.44)
        s1 = MathTex(r"A = \lambda N").scale(0.82)
        s_row1 = VGroup(s1_lbl, s1).arrange(RIGHT, buff=0.2)

        # 反解
        s2_lbl = Text("反解 N：", font=CJK).scale(0.44)
        s2 = MathTex(r"N = \frac{A}{\lambda} = \frac{A\,T}{\ln 2}").scale(0.82)
        s2.set_color(YELLOW)
        s_row2 = VGroup(s2_lbl, s2).arrange(RIGHT, buff=0.2)

        # 代入 A=1 Bq, T=5730 a
        s3_lbl = Text("代入 A = 1 Bq，T = 5730 a：", font=CJK).scale(0.44)
        s3 = MathTex(
            r"N = \frac{1 \times 5730 \times 3.156\times10^7}{0.693}",
        ).scale(0.68)
        s_row3 = VGroup(s3_lbl, s3).arrange(RIGHT, buff=0.2)

        # 结果
        s4_lbl = Text("结果：", font=CJK).scale(0.44)
        s4 = MathTex(r"N \approx 2.61\times10^{11}", color=GREEN).scale(0.82)
        s_row4 = VGroup(s4_lbl, s4).arrange(RIGHT, buff=0.2)

        side_steps = VGroup(s_row1, s_row2, s_row3, s_row4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        side_steps.next_to(side_title, DOWN, buff=0.45)
        side_steps.scale_to_fit_width(13.0)

        note_lbl = Text("1 Bq 的 ¹⁴C 样品中仍有约 2610 亿个 ¹⁴C 核！", font=CJK, color=CYAN).scale(0.44)
        note_lbl.next_to(side_steps, DOWN, buff=0.35)

        self.play(FadeIn(side_title))
        self.play(FadeIn(s_row1))
        self.wait(0.6)
        self.play(FadeIn(s_row2))
        self.wait(0.6)
        self.play(FadeIn(s_row3))
        self.wait(0.6)
        self.play(FadeIn(s_row4))
        self.play(FadeIn(note_lbl))
        self.wait(1.5)
        self.play(FadeOut(VGroup(side_title, side_steps, note_lbl)))

        # ── Step 7: 小结卡 ───────────────────────────────────────────────
        sum_title = Text("核心公式小结", font=CJK, color=BLUE).scale(0.54)
        sum_title.next_to(title, DOWN, buff=0.55)

        f1 = MathTex(r"\frac{N}{N_0} = e^{-\lambda t}", color=YELLOW).scale(0.80)
        f2 = MathTex(r"t = \frac{\ln(N_0/N)}{\ln 2}\,T", color=YELLOW).scale(0.80)
        f3 = MathTex(r"N = \frac{A}{\lambda} = \frac{A\,T}{\ln 2}", color=YELLOW).scale(0.80)

        c1 = Text("衰减规律：比值随时间指数下降", font=CJK, color=WHITE).scale(0.42)
        c2 = Text("测年核心：半衰期 × 对数比 → 年代", font=CJK, color=WHITE).scale(0.42)
        c3 = Text("活度 → 核数：换算需用秒制单位", font=CJK, color=WHITE).scale(0.42)

        pair1 = VGroup(f1, c1).arrange(RIGHT, buff=0.4)
        pair2 = VGroup(f2, c2).arrange(RIGHT, buff=0.4)
        pair3 = VGroup(f3, c3).arrange(RIGHT, buff=0.4)

        summary = VGroup(pair1, pair2, pair3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(13.2)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        result_remind_lbl = Text("本题答案：古尸距今约", font=CJK, color=GREEN).scale(0.46)
        result_remind_val = MathTex(r"9090\,\mathrm{a}", color=GREEN).scale(0.72)
        result_remind = VGroup(result_remind_lbl, result_remind_val).arrange(RIGHT, buff=0.15)
        result_remind.next_to(summary, DOWN, buff=0.45)

        self.play(FadeIn(sum_title))
        self.play(Write(f1), Write(f2), Write(f3), run_time=1.5)
        self.play(FadeIn(c1), FadeIn(c2), FadeIn(c3))
        self.play(Create(box))
        self.play(FadeIn(result_remind))
        self.wait(2.0)

        self.play(FadeOut(VGroup(sum_title, summary, box, result_remind, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch13Ex2Carbon14Dating",
        "id": "phys-ch13-13.2-ex2-carbon14-dating",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "碳-14 测年法推算古尸年代",
        "description": "通过指数衰减曲线与逐步公式推导，展示如何由 ¹⁴C/¹²C 比值反算古尸距今年代约 9090 年，并演示如何从活度 1 Bq 反推现存核数 2.61×10¹¹。",
    },
]
