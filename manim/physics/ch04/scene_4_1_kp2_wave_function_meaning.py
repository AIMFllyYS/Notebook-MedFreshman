"""第 4.1 节 · 波函数的三重意义与相位分析

波函数 y(x,t)=A·cos[ω(t-x/u)+φ₀] 有三重阅读视角：
  1. 固定 x=x₀ → 该质点的振动方程（时间函数）
  2. 固定 t=t₀ → 全体质点的位移快照（空间函数）
  3. 连续让 t 增大 → 波形整体向右平移，体现波速 u=ω/k

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理参数
A = 1.0        # 振幅
omega = 2.0    # 角频率
k = 1.0        # 波数
lam = 2 * math.pi / k  # 波长
u = omega / k  # 波速


class Ch04Kp2WaveFunctionMeaning(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("波函数的三重意义与相位分析", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.16)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("水面上的涟漪：每一滴水只在原地上下浮动，", font=CJK).scale(0.46)
        ana2 = Text("但波纹图案（波形）却一圈一圈地向外扩散。", font=CJK).scale(0.46)
        ana3 = Text("波函数 y(x,t) 同时描述了「每个质点」和「整体波形」两件事。",
                    font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 波函数通式（逐项展示）──────────────────────────────
        eq_label = Text("波函数通式：", font=CJK, color=GREEN).scale(0.46)
        wave_eq = MathTex(
            r"y(x,t)", r"=",
            r"A", r"\cos\!\left[",
            r"\omega", r"\!\left(t-\frac{x}{u}\right)",
            r"+\varphi_0\right]"
        ).scale(0.82)
        wave_eq[2].set_color(ORANGE)   # A 振幅
        wave_eq[4].set_color(YELLOW)   # ω
        wave_eq[5].set_color(CYAN)     # (t - x/u)
        header = VGroup(eq_label, wave_eq).arrange(RIGHT, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(eq_label))
        self.play(Write(wave_eq))
        self.wait(0.7)

        legend = VGroup(
            VGroup(Text("A", font=CJK, color=ORANGE).scale(0.42),
                   Text("振幅", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\omega", color=YELLOW).scale(0.7),
                   Text("角频率", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"u", color=CYAN).scale(0.7),
                   Text("波速", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\varphi_0").scale(0.7),
                   Text("初相", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
        ).arrange(RIGHT, buff=0.55).next_to(header, DOWN, buff=0.28)
        self.play(FadeIn(legend))
        self.wait(1.5)
        self.play(FadeOut(legend))

        # ── Step 4: 建立坐标系 ─────────────────────────────────────────
        axes = Axes(
            x_range=[0, 4 * math.pi, math.pi],
            y_range=[-1.6, 1.6, 1],
            x_length=10.5,
            y_length=2.6,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.8)
        x_lbl = MathTex(r"x\,(\mathrm{m})").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"y").scale(0.5).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 初始波形 t=0
        t_tracker = ValueTracker(0.0)
        wave = always_redraw(
            lambda: axes.plot(
                lambda x: A * math.cos(k * x - omega * t_tracker.get_value()),
                x_range=[0, 4 * math.pi],
                color=YELLOW,
                stroke_width=2.5,
            )
        )
        self.play(Create(wave))
        self.wait(0.5)

        # ── Step 5: 意义一——固定 x=x₀，质点振动 ─────────────────────
        x0 = math.pi  # x₀ = π m
        vline = DashedLine(
            axes.c2p(x0, -1.5), axes.c2p(x0, 1.5),
            color=CYAN, stroke_width=2, dash_length=0.12
        )
        x0_lbl = MathTex(r"x_0").scale(0.52).next_to(axes.c2p(x0, -1.5), DOWN, buff=0.12)
        particle = always_redraw(
            lambda: Dot(
                axes.c2p(x0, A * math.cos(k * x0 - omega * t_tracker.get_value())),
                color=RED, radius=0.11,
            )
        )

        meaning1_zh = Text("意义一：固定 x=x₀ → 该质点的振动方程", font=CJK, color=GREEN).scale(0.43)
        meaning1_eq = MathTex(r"y(x_0,\,t)=A\cos(\omega t - kx_0)").scale(0.65)
        meaning1 = VGroup(meaning1_zh, meaning1_eq).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.35)
        meaning1.scale_to_fit_width(12.5)

        self.play(Create(vline), FadeIn(x0_lbl), FadeIn(particle))
        self.play(FadeIn(meaning1))
        self.wait(0.4)
        # 让时间走 1.5 个周期，看质点上下振动
        self.play(t_tracker.animate.set_value(1.5 * 2 * math.pi / omega),
                  run_time=4.5, rate_func=linear)
        self.wait(0.5)
        self.play(FadeOut(VGroup(vline, x0_lbl, particle, meaning1)))
        t_tracker.set_value(0)  # 重置

        # ── Step 6: 意义二——固定 t=t₀，波形快照 ─────────────────────
        t0_val = 0.5  # 固定时刻
        snapshot = axes.plot(
            lambda x: A * math.cos(k * x - omega * t0_val),
            x_range=[0, 4 * math.pi],
            color=ORANGE,
            stroke_width=3.5,
        )
        meaning2_zh = Text("意义二：固定 t=t₀ → 全体质点的位移快照", font=CJK, color=ORANGE).scale(0.43)
        meaning2_eq = MathTex(r"y(x,\,t_0)=A\cos(kx-\omega t_0)").scale(0.65)
        meaning2 = VGroup(meaning2_zh, meaning2_eq).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.35)
        meaning2.scale_to_fit_width(12.5)

        # 将 t_tracker 冻结于 t0_val，让 always_redraw wave 与 snapshot 一致
        t_tracker.set_value(t0_val)
        self.play(Create(snapshot), FadeIn(meaning2))
        self.wait(0.5)

        # 用颜色渐变 Dots 表示各质点位移（采样 20 个点）
        n_dots = 22
        xs_sample = [4 * math.pi * i / n_dots for i in range(n_dots + 1)]
        disp_dots = VGroup(*[
            Dot(
                axes.c2p(xi, A * math.cos(k * xi - omega * t0_val)),
                radius=0.08,
                color=interpolate_color(BLUE, RED,
                                        (A * math.cos(k * xi - omega * t0_val) + A) / (2 * A))
            )
            for xi in xs_sample
        ])
        snap_lbl = VGroup(
            Text("蓝色", font=CJK, color=BLUE).scale(0.38),
            Text("→ 负位移", font=CJK).scale(0.38),
            Text("   红色", font=CJK, color=RED).scale(0.38),
            Text("→ 正位移", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.08).next_to(meaning2, UP, buff=0.12)
        self.play(FadeIn(disp_dots), FadeIn(snap_lbl))
        self.wait(2.0)
        self.play(FadeOut(VGroup(snapshot, disp_dots, snap_lbl, meaning2)))
        t_tracker.set_value(0)

        # ── Step 7: 意义三——波形整体向右平移（波速）────────────────────
        meaning3_zh = Text("意义三：t 增大 → 波形整体右移，体现波速", font=CJK, color=CYAN).scale(0.43)
        meaning3_eq = MathTex(r"u=\frac{\omega}{k}=\lambda\nu").scale(0.72)
        meaning3_eq[0].set_color(CYAN)
        meaning3 = VGroup(meaning3_zh, meaning3_eq).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.35)
        meaning3.scale_to_fit_width(12.5)
        self.play(FadeIn(meaning3))

        # 让波形平移两个完整周期
        self.play(t_tracker.animate.set_value(2 * 2 * math.pi / omega),
                  run_time=5.0, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(meaning3))
        t_tracker.set_value(0)

        # ── Step 8: 相位差定义与 ValueTracker 演示 ───────────────────────
        # 固定 x1，拖动 x2
        x1_val = math.pi
        x2_tracker = ValueTracker(2.0 * math.pi)

        dot1 = always_redraw(
            lambda: Dot(axes.c2p(x1_val, A * math.cos(k * x1_val - omega * 0)),
                        color=GREEN, radius=0.11)
        )
        dot2 = always_redraw(
            lambda: Dot(axes.c2p(x2_tracker.get_value(),
                                 A * math.cos(k * x2_tracker.get_value() - omega * 0)),
                        color=RED, radius=0.11)
        )
        lbl_x1 = MathTex(r"x_1").scale(0.5).next_to(axes.c2p(x1_val, -1.5), DOWN, buff=0.1)
        lbl_x2 = always_redraw(
            lambda: MathTex(r"x_2").scale(0.5).next_to(
                axes.c2p(x2_tracker.get_value(), -1.5), DOWN, buff=0.1)
        )

        # 双向箭头 Δx
        dx_arrow = always_redraw(
            lambda: DoubleArrow(
                axes.c2p(x1_val, -1.3),
                axes.c2p(x2_tracker.get_value(), -1.3),
                color=ORANGE, stroke_width=2.5, tip_length=0.15, buff=0,
            )
        )
        dx_label = always_redraw(
            lambda: MathTex(r"\Delta x").scale(0.5).next_to(
                axes.c2p((x1_val + x2_tracker.get_value()) / 2, -1.3), DOWN, buff=0.1)
        )

        # 动态相位差文字
        dphi_label = always_redraw(
            lambda: VGroup(
                MathTex(r"\Delta\varphi=k\Delta x=").scale(0.58),
                MathTex(
                    rf"{k * (x2_tracker.get_value() - x1_val):.2f}\,\mathrm{{rad}}"
                ).scale(0.58).set_color(YELLOW),
            ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.55)
        )

        phase_title = VGroup(
            Text("两点相位差：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\Delta\varphi=\frac{2\pi}{\lambda}(x_2-x_1)=k\Delta x").scale(0.65),
        ).arrange(RIGHT, buff=0.2).next_to(title, DOWN, buff=0.32)
        phase_title.scale_to_fit_width(13)

        self.play(FadeIn(phase_title))
        self.play(FadeIn(dot1), FadeIn(dot2), FadeIn(lbl_x1), FadeIn(lbl_x2))
        self.play(Create(dx_arrow), FadeIn(dx_label))
        self.play(FadeIn(dphi_label))
        self.wait(0.8)

        # 拖动 x2 展示相位差随距离变化
        self.play(x2_tracker.animate.set_value(3.5 * math.pi),
                  run_time=3.5, rate_func=smooth)
        self.wait(0.6)
        self.play(x2_tracker.animate.set_value(2.0 * math.pi),
                  run_time=2.0, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(VGroup(dot1, dot2, lbl_x1, lbl_x2, dx_arrow, dx_label,
                                 dphi_label, phase_title)))

        # ── Step 9: 特例——半波长反相，整波长同相 ─────────────────────────
        special_title = Text("特例分析", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.32)
        self.play(FadeIn(special_title))

        # 两点固定：x1=π, x2=π+λ/2（反相）
        x1v = math.pi
        x2v_half = x1v + lam / 2
        x2v_full = x1v + lam

        dot_a = Dot(axes.c2p(x1v, A * math.cos(k * x1v)), color=GREEN, radius=0.12)
        dot_b_half = Dot(axes.c2p(x2v_half, A * math.cos(k * x2v_half)), color=RED, radius=0.12)

        arrow_a = Arrow(axes.c2p(x1v, 0), axes.c2p(x1v, A * math.cos(k * x1v)),
                        color=GREEN, buff=0, stroke_width=3, tip_length=0.18)
        arrow_b = Arrow(axes.c2p(x2v_half, 0), axes.c2p(x2v_half, A * math.cos(k * x2v_half)),
                        color=RED, buff=0, stroke_width=3, tip_length=0.18)

        case1_zh = Text("Δx = λ/2 → 相位差 π → 反相（位移方向相反）", font=CJK, color=RED).scale(0.43)
        case1_eq = MathTex(r"\Delta\varphi=k\cdot\frac{\lambda}{2}=\pi").scale(0.68)
        case1 = VGroup(case1_zh, case1_eq).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.35)
        case1.scale_to_fit_width(12.5)

        self.play(FadeIn(dot_a), FadeIn(dot_b_half))
        self.play(Create(arrow_a), Create(arrow_b))
        self.play(FadeIn(case1))
        self.wait(2.0)
        self.play(FadeOut(VGroup(dot_a, dot_b_half, arrow_a, arrow_b, case1)))

        # 整波长同相
        dot_c = Dot(axes.c2p(x1v, A * math.cos(k * x1v)), color=GREEN, radius=0.12)
        dot_d = Dot(axes.c2p(x2v_full, A * math.cos(k * x2v_full)), color=GREEN, radius=0.12)
        arrow_c = Arrow(axes.c2p(x1v, 0), axes.c2p(x1v, A * math.cos(k * x1v)),
                        color=GREEN, buff=0, stroke_width=3, tip_length=0.18)
        arrow_d = Arrow(axes.c2p(x2v_full, 0), axes.c2p(x2v_full, A * math.cos(k * x2v_full)),
                        color=GREEN, buff=0, stroke_width=3, tip_length=0.18)

        case2_zh = Text("Δx = λ → 相位差 2π → 同相（位移方向相同）", font=CJK, color=GREEN).scale(0.43)
        case2_eq = MathTex(r"\Delta\varphi=k\cdot\lambda=2\pi").scale(0.68)
        case2 = VGroup(case2_zh, case2_eq).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.35)
        case2.scale_to_fit_width(12.5)

        self.play(FadeIn(dot_c), FadeIn(dot_d))
        self.play(Create(arrow_c), Create(arrow_d))
        self.play(FadeIn(case2))
        self.wait(2.0)
        self.play(FadeOut(VGroup(dot_c, dot_d, arrow_c, arrow_d, case2, special_title)))

        # ── Step 10: 清场 ─────────────────────────────────────────────
        self.play(FadeOut(VGroup(wave, axes, x_lbl, y_lbl)))
        self.wait(0.3)

        # ── Step 11: 小结卡 ────────────────────────────────────────────
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        row1_zh = Text("意义一（质点振动）：", font=CJK, color=GREEN).scale(0.40)
        row1_eq = MathTex(r"y(x_0,t)=A\cos(\omega t-kx_0)", color=YELLOW).scale(0.72)
        row1 = VGroup(row1_zh, row1_eq).arrange(RIGHT, buff=0.2)

        row2_zh = Text("意义二（波形快照）：", font=CJK, color=ORANGE).scale(0.40)
        row2_eq = MathTex(r"y(x,t_0)=A\cos(kx-\omega t_0)", color=YELLOW).scale(0.72)
        row2 = VGroup(row2_zh, row2_eq).arrange(RIGHT, buff=0.2)

        row3_zh = Text("意义三（波形传播）：", font=CJK, color=CYAN).scale(0.40)
        row3_eq = MathTex(r"u=\frac{\omega}{k}=\lambda\nu", color=YELLOW).scale(0.72)
        row3 = VGroup(row3_zh, row3_eq).arrange(RIGHT, buff=0.2)

        row4_zh = Text("相位差：", font=CJK, color=WHITE).scale(0.40)
        row4_eq = MathTex(r"\Delta\varphi=\frac{2\pi}{\lambda}\Delta x=k\Delta x",
                          color=YELLOW).scale(0.72)
        row4 = VGroup(row4_zh, row4_eq).arrange(RIGHT, buff=0.2)

        row5_zh = Text("半波长反相：", font=CJK, color=RED).scale(0.40)
        row5_eq = MathTex(r"\Delta x=\frac{\lambda}{2}\Rightarrow\Delta\varphi=\pi",
                          color=RED).scale(0.72)
        row5 = VGroup(row5_zh, row5_eq).arrange(RIGHT, buff=0.2)

        summary = VGroup(row1, row2, row3, row4, row5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(row1))
        self.wait(0.4)
        self.play(Write(row2))
        self.wait(0.4)
        self.play(Write(row3))
        self.wait(0.4)
        self.play(Write(row4))
        self.wait(0.4)
        self.play(Write(row5))
        self.wait(0.4)
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Kp2WaveFunctionMeaning",
        "id": "phys-ch04-4.1-kp2-wave-function-meaning",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "波函数的三重意义与相位分析",
        "description": "用 ValueTracker 动画依次演示波函数的三重意义（质点振动、波形快照、波形传播），并用双向箭头和动态相位差公式展示 Δφ=kΔx，最后以半波长反相、整波长同相收尾。",
    },
]
