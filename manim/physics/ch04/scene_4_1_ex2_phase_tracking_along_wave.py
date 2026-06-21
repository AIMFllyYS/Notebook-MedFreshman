"""第 4.1 节 · 例题：相位追踪与运动状态传播

在 x-t 时空图中，沿等相位线追踪三个关键点：
  红点 (x=0.2m, t=1s) → φ=9.2π
  绿点 (x=0,   t=0.92s) ← 沿等相位线向左追溯
  蓝点 (x=1.45m, t=1.5s) ← 沿等相位线向右追溯

同时在 x-y 平面波形图中高亮对应质点，直觉说明相位以波速传播。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ────────────────────────────────────────────────────────────────
# φ(x,t) = 10π·t - 4π·x
# ω = 10π rad/s, k = 4π rad/m  →  u = ω/k = 10π/4π = 2.5 m/s
OMEGA = 10 * math.pi
K = 4 * math.pi
U = OMEGA / K          # 2.5 m/s
A = 1.0                # 振幅（归一化）

# 三个关键点
X1, T1 = 0.2,  1.0    # 红点
X2, T2 = 0.0,  0.92   # 绿点（φ=9.2π 在 x=0 轴处）
X3, T3 = 1.45, 1.5    # 蓝点（φ=9.2π 在 t=1.5s 处）
PHI_REF = OMEGA * T1 - K * X1  # = 10π·1 - 4π·0.2 = 9.2π


class Ch04Ex2PhaseTrackingAlongWave(Scene):
    def construct(self):

        # ════════════════════════════════════════════════════════════════
        # Step 1：标题
        # ════════════════════════════════════════════════════════════════
        title = Text("例题：相位追踪与运动状态传播", font=CJK, color=BLUE).scale(0.6)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第四章 机械波 · 4.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════
        # Step 2：生活类比
        # ════════════════════════════════════════════════════════════════
        ana1 = Text("想象一列行进的波浪——不同位置的水面", font=CJK).scale(0.47)
        ana2 = Text("在不同时刻会经历相同的振动状态（即相位相同）。", font=CJK).scale(0.47)
        ana3 = Text("相位是\"振动状态的身份证\"，它以波速 u 向前传播。", font=CJK).scale(0.47)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════
        # Step 3：波函数与相位公式（逐步展开）
        # ════════════════════════════════════════════════════════════════
        eq_label = Text("已知平面波方程：", font=CJK, color=WHITE).scale(0.44)
        eq_wave = MathTex(
            r"y(x,t)=A\cos(\varphi)",
            r"\quad\varphi=",
            r"10\pi t",
            r"-",
            r"4\pi x"
        ).scale(0.82)
        eq_wave[2].set_color(ORANGE)
        eq_wave[4].set_color(YELLOW)
        eq_row = VGroup(eq_label, eq_wave).arrange(RIGHT, buff=0.3)
        eq_row.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(eq_label), Write(eq_wave))
        self.wait(0.8)

        # 参数解读
        param_omega = VGroup(
            Text("ω=10π rad/s", font=CJK, color=ORANGE).scale(0.4),
            Text("k=4π rad/m", font=CJK, color=YELLOW).scale(0.4),
        ).arrange(RIGHT, buff=0.7)
        eq_speed = VGroup(
            Text("波速 u = ω/k =", font=CJK).scale(0.4),
            MathTex(r"\frac{10\pi}{4\pi}=2.5\text{ m/s}", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.2)
        params = VGroup(param_omega, eq_speed).arrange(DOWN, buff=0.18)
        params.next_to(eq_row, DOWN, buff=0.3)
        self.play(FadeIn(param_omega))
        self.wait(0.5)
        self.play(FadeIn(eq_speed))
        self.wait(1.4)
        self.play(FadeOut(VGroup(eq_row, params)))

        # ════════════════════════════════════════════════════════════════
        # Step 4：计算红点的相位
        # ════════════════════════════════════════════════════════════════
        calc_title = Text("第一步：求红点相位", font=CJK, color=YELLOW).scale(0.48)
        calc_title.next_to(title, DOWN, buff=0.45)
        c1 = MathTex(r"\varphi_0 = 10\pi\times 1 - 4\pi\times 0.2").scale(0.82)
        c2 = MathTex(r"= 10\pi - 0.8\pi = 9.2\pi", color=RED).scale(0.82)
        calcs = VGroup(c1, c2).arrange(DOWN, buff=0.28).next_to(calc_title, DOWN, buff=0.35)
        self.play(FadeIn(calc_title))
        self.play(Write(c1))
        self.wait(0.5)
        self.play(Write(c2))
        self.wait(1.2)
        self.play(FadeOut(VGroup(calc_title, calcs)))

        # ════════════════════════════════════════════════════════════════
        # Step 5：建立 x-t 时空坐标系（核心可视化）
        # ════════════════════════════════════════════════════════════════
        xt_label = Text("x-t 时空图（等相位线追踪）", font=CJK, color=BLUE).scale(0.46)
        xt_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(xt_label))

        # 坐标系：x 轴 [0, 2.0 m]，t 轴 [0, 2.0 s]
        axes = Axes(
            x_range=[0, 2.0, 0.5],
            y_range=[0, 2.0, 0.5],
            x_length=6.5,
            y_length=4.8,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [0.5, 1.0, 1.5, 2.0]},
            y_axis_config={"numbers_to_include": [0.5, 1.0, 1.5, 2.0]},
        ).shift(DOWN * 0.55 + LEFT * 1.2)

        x_lbl = MathTex(r"x\ (\text{m})").scale(0.52).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        t_lbl = MathTex(r"t\ (\text{s})").scale(0.52).next_to(axes.y_axis.get_end(), LEFT, buff=0.18)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(t_lbl))
        self.wait(0.8)

        # ── 等相位线：φ = 9.2π → 10π·t - 4π·x = 9.2π → t = 0.92 + (4π/10π)·x = 0.92 + 0.4·x
        # 斜率 dt/dx = k/ω = 1/u = 1/2.5 = 0.4 s/m （向右传播）
        def iso_phase_t(x_val):
            return 0.92 + x_val / U  # t = t0 + x/u

        x_iso_start = 0.0
        x_iso_end = 1.8
        iso_line = axes.plot(
            lambda x: iso_phase_t(x),
            x_range=[x_iso_start, x_iso_end],
            color=CYAN,
            stroke_width=3,
        )
        iso_lbl = VGroup(
            Text("等相位线", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"\varphi=9.2\pi", color=CYAN).scale(0.6),
        ).arrange(DOWN, buff=0.08)
        iso_lbl.next_to(axes.c2p(1.5, iso_phase_t(1.5)), UP + RIGHT, buff=0.12)
        self.play(Create(iso_line), FadeIn(iso_lbl))
        self.wait(1.0)

        # ════════════════════════════════════════════════════════════════
        # Step 6：红点 (x=0.2, t=1.0)
        # ════════════════════════════════════════════════════════════════
        red_pos = axes.c2p(X1, T1)
        red_dot = Dot(red_pos, color=RED, radius=0.10)
        red_lbl = VGroup(
            Text("A:", font=CJK, color=RED).scale(0.38),
            MathTex(r"(0.2\ \text{m},\ 1\ \text{s})", color=RED).scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        red_lbl.next_to(red_dot, RIGHT, buff=0.15)

        # 虚线从轴到红点
        red_vline = DashedLine(axes.c2p(X1, 0), red_pos, color=RED, stroke_width=1.5)
        red_hline = DashedLine(axes.c2p(0, T1), red_pos, color=RED, stroke_width=1.5)
        self.play(Create(red_vline), Create(red_hline))
        self.play(FadeIn(red_dot), FadeIn(red_lbl))
        phi_lbl = MathTex(r"\varphi=9.2\pi", color=RED).scale(0.55)
        phi_lbl.next_to(red_lbl, DOWN, buff=0.1)
        self.play(Write(phi_lbl))
        self.wait(1.2)

        # ════════════════════════════════════════════════════════════════
        # Step 7：沿等相位线向左追溯绿点 (x=0, t=0.92s)
        # ════════════════════════════════════════════════════════════════
        arrow_left = Arrow(
            red_pos,
            axes.c2p(X2, T2),
            buff=0.1,
            color=GREEN,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.15,
        )
        self.play(GrowArrow(arrow_left))

        green_pos = axes.c2p(X2, T2)
        green_dot = Dot(green_pos, color=GREEN, radius=0.10)
        green_lbl = VGroup(
            Text("B:", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"(0,\ 0.92\ \text{s})", color=GREEN).scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        green_lbl.next_to(green_dot, LEFT, buff=0.15)
        green_hline = DashedLine(axes.c2p(0, T2), green_pos, color=GREEN, stroke_width=1.5)
        self.play(FadeIn(green_dot), FadeIn(green_lbl), Create(green_hline))

        green_explain = VGroup(
            Text("令 x=0 代入等相位线：", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"t_0=0.92\ \text{s}", color=GREEN).scale(0.6),
        ).arrange(DOWN, buff=0.1)
        green_explain.next_to(green_lbl, DOWN, buff=0.15)
        self.play(FadeIn(green_explain))
        self.wait(1.3)

        # ════════════════════════════════════════════════════════════════
        # Step 8：沿等相位线向右追溯蓝点 (x=1.45m, t=1.5s)
        # ════════════════════════════════════════════════════════════════
        arrow_right = Arrow(
            red_pos,
            axes.c2p(X3, T3),
            buff=0.1,
            color=BLUE_C,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.15,
        )
        self.play(GrowArrow(arrow_right))

        blue_pos = axes.c2p(X3, T3)
        blue_dot = Dot(blue_pos, color=BLUE_C, radius=0.10)
        # 横线从 t=1.5 轴
        t15_hline = DashedLine(axes.c2p(0, T3), blue_pos, color=BLUE_C, stroke_width=1.5)
        blue_lbl = VGroup(
            Text("C:", font=CJK, color=BLUE_C).scale(0.38),
            MathTex(r"(1.45\ \text{m},\ 1.5\ \text{s})", color=BLUE_C).scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        blue_lbl.next_to(blue_dot, RIGHT, buff=0.12)
        self.play(FadeIn(blue_dot), FadeIn(blue_lbl), Create(t15_hline))

        blue_explain = VGroup(
            Text("令 t=1.5s 代入：", font=CJK, color=BLUE_C).scale(0.38),
            MathTex(r"x = u\cdot(t-t_0)=2.5\times 0.58=1.45\ \text{m}", color=BLUE_C).scale(0.52),
        ).arrange(DOWN, buff=0.1)
        blue_explain.next_to(blue_dot, UP, buff=0.18)
        self.play(FadeIn(blue_explain))
        self.wait(1.5)

        # 清场 x-t 图区域
        self.play(FadeOut(VGroup(
            axes, x_lbl, t_lbl,
            iso_line, iso_lbl,
            red_vline, red_hline, red_dot, red_lbl, phi_lbl,
            arrow_left, green_hline, green_dot, green_lbl, green_explain,
            arrow_right, t15_hline, blue_dot, blue_lbl, blue_explain,
            xt_label,
        )))

        # ════════════════════════════════════════════════════════════════
        # Step 9：平面波形图（x-y）——高亮三个质点
        # ════════════════════════════════════════════════════════════════
        wave_title = Text("对应波形图：相同相位的质点高亮", font=CJK, color=BLUE).scale(0.46)
        wave_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(wave_title))

        waxes = Axes(
            x_range=[0, 2.0, 0.5],
            y_range=[-1.4, 1.4, 0.5],
            x_length=10.0,
            y_length=3.5,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.7)
        wx_lbl = MathTex(r"x\ (\text{m})").scale(0.5).next_to(waxes.x_axis.get_end(), DOWN, buff=0.15)
        wy_lbl = MathTex(r"y").scale(0.5).next_to(waxes.y_axis.get_end(), LEFT, buff=0.15)
        self.play(Create(waxes), FadeIn(wx_lbl), FadeIn(wy_lbl))

        # 绘制 t=1.0s 时的波形 y(x, 1.0) = A cos(10π·1 - 4π·x) = cos(10π - 4πx)
        wave_t1 = waxes.plot(
            lambda x: A * math.cos(OMEGA * T1 - K * x),
            x_range=[0, 2.0],
            color=YELLOW,
            stroke_width=2.5,
        )
        wave_lbl_t1 = VGroup(
            Text("t=1.0 s 时波形", font=CJK, color=YELLOW).scale(0.4),
        )
        wave_lbl_t1.next_to(waxes, DOWN, buff=0.2)
        self.play(Create(wave_t1), FadeIn(wave_lbl_t1))
        self.wait(0.8)

        # 红点 A (x=0.2, t=1.0)
        y_A = A * math.cos(OMEGA * T1 - K * X1)
        wA = Dot(waxes.c2p(X1, y_A), color=RED, radius=0.12)
        lA = Text("A (x=0.2m)", font=CJK, color=RED).scale(0.38)
        lA.next_to(wA, UP, buff=0.15)
        self.play(FadeIn(wA), FadeIn(lA))
        self.wait(0.5)

        # 绿点 B (x=0, t=0.92 → 等效 x=0 在 t=1s 时的 y)
        # 在 t=1s 的波形上，x=0 的质点位移
        y_B_on_t1 = A * math.cos(OMEGA * T1 - K * X2)  # x=0, t=1
        # 等相位说明：t=0.92 时 x=0 的位移与 t=1 时 x=0.2 完全相同
        wB = Dot(waxes.c2p(X2, y_B_on_t1), color=GREEN, radius=0.12)
        lB = Text("B (x=0)", font=CJK, color=GREEN).scale(0.38)
        lB.next_to(wB, UP, buff=0.15)
        # 连线说明相位相同
        same_phase_line = DashedLine(wA.get_center(), wB.get_center(), color=CYAN, stroke_width=2)
        self.play(FadeIn(wB), FadeIn(lB), Create(same_phase_line))
        phase_same_lbl = Text("相位相同 → 位移相同", font=CJK, color=CYAN).scale(0.38)
        phase_same_lbl.next_to(same_phase_line, DOWN, buff=0.12)
        self.play(FadeIn(phase_same_lbl))
        self.wait(0.8)

        # 蓝点 C (x=1.45, t=1.5 → 等效 t=1s 波形上 x=1.45 处)
        y_C_on_t1 = A * math.cos(OMEGA * T1 - K * X3)
        wC = Dot(waxes.c2p(X3, y_C_on_t1), color=BLUE_C, radius=0.12)
        lC = Text("C (x=1.45m)", font=CJK, color=BLUE_C).scale(0.38)
        lC.next_to(wC, DOWN, buff=0.15)
        same_phase_line2 = DashedLine(wA.get_center(), wC.get_center(), color=CYAN, stroke_width=2)
        self.play(FadeIn(wC), FadeIn(lC), Create(same_phase_line2))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            waxes, wx_lbl, wy_lbl, wave_t1, wave_lbl_t1,
            wA, lA, wB, lB, same_phase_line, phase_same_lbl,
            wC, lC, same_phase_line2, wave_title,
        )))

        # ════════════════════════════════════════════════════════════════
        # Step 10：物理解释——等相位线斜率 = 1/u
        # ════════════════════════════════════════════════════════════════
        interp_title = Text("物理解释：等相位线的斜率", font=CJK, color=BLUE).scale(0.50)
        interp_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(interp_title))

        eq1 = MathTex(r"\varphi(x,t)=10\pi t-4\pi x=\text{const}").scale(0.78)
        eq2 = MathTex(r"\Rightarrow\quad t=\frac{\varphi}{10\pi}+\frac{4\pi}{10\pi}x").scale(0.78)
        eq2[0][1:].set_color(YELLOW)
        eq3 = MathTex(r"\text{slope}=\frac{dt}{dx}=\frac{k}{\omega}=\frac{1}{u}=0.4\ \text{s/m}", color=GREEN).scale(0.72)
        eqs = VGroup(eq1, eq2, eq3).arrange(DOWN, buff=0.35)
        eqs.next_to(interp_title, DOWN, buff=0.4)
        self.play(Write(eq1))
        self.wait(0.7)
        self.play(Write(eq2))
        self.wait(0.7)
        self.play(Write(eq3))
        self.wait(1.5)

        interp_zh = Text(
            "斜率 1/u 越小，等相位线越陡，波速越快。",
            font=CJK, color=GREEN,
        ).scale(0.42)
        interp_zh.next_to(eqs, DOWN, buff=0.28)
        self.play(FadeIn(interp_zh))
        self.wait(1.4)
        self.play(FadeOut(VGroup(interp_title, eqs, interp_zh)))

        # ════════════════════════════════════════════════════════════════
        # Step 11：数值验证
        # ════════════════════════════════════════════════════════════════
        verify_title = Text("数值验证", font=CJK, color=YELLOW).scale(0.48)
        verify_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(verify_title))

        v1 = VGroup(
            Text("A 点: ", font=CJK, color=RED).scale(0.44),
            MathTex(r"10\pi\times1.0-4\pi\times0.2=9.2\pi\ \checkmark", color=RED).scale(0.70),
        ).arrange(RIGHT, buff=0.12)
        v2 = VGroup(
            Text("B 点: ", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"10\pi\times0.92-4\pi\times0=9.2\pi\ \checkmark", color=GREEN).scale(0.70),
        ).arrange(RIGHT, buff=0.12)
        v3 = VGroup(
            Text("C 点: ", font=CJK, color=BLUE_C).scale(0.44),
            MathTex(r"10\pi\times1.5-4\pi\times1.45=15\pi-5.8\pi=9.2\pi\ \checkmark", color=BLUE_C).scale(0.62),
        ).arrange(RIGHT, buff=0.12)
        verifies = VGroup(v1, v2, v3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        verifies.next_to(verify_title, DOWN, buff=0.38)
        verifies.scale_to_fit_width(12.5)
        for v in [v1, v2, v3]:
            self.play(FadeIn(v))
            self.wait(0.6)
        self.wait(1.2)
        self.play(FadeOut(VGroup(verify_title, verifies)))

        # ════════════════════════════════════════════════════════════════
        # Step 12：小结卡
        # ════════════════════════════════════════════════════════════════
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("相位公式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\varphi(x,t)=10\pi t-4\pi x", color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("等相位线斜率：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\frac{dt}{dx}=\frac{1}{u}=0.4\ \text{s/m}", color=GREEN).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("相位以波速 u 传播：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"x_{\text{phase}}=x_0+u\cdot\Delta t", color=ORANGE).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s4 = Text(
            "三点 A(红)、B(绿)、C(蓝) 相位相同，振动状态完全相同",
            font=CJK, color=CYAN,
        ).scale(0.40)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.8)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch04Ex2PhaseTrackingAlongWave",
        "id": "phys-ch04-4.1-ex2-phase-tracking-along-wave",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "例题：相位追踪与运动状态传播",
        "description": "在 x-t 时空图上沿等相位线追踪三个关键点（红/绿/蓝），验证 φ=9.2π 以波速 u=2.5m/s 传播，并在波形图中高亮对应质点。",
    },
]
