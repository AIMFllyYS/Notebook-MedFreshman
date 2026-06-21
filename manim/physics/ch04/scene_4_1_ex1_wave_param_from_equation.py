"""第 4.1 节 · 例题：由波函数读取物理量

给定 y = 0.05 cos(10π t - 4π x) m，逐步标注振幅 A、角频率 ω、波数 k，
推导频率 ν、波长 λ、波速 u，再可视化 t=0 波形与 x=0 处振动曲线，
标出质点最大速度与最大加速度的位置。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ──────────────────────────────────────────────────
A_VAL   = 0.05          # 振幅 (m) — 图中放大 ×20 显示
OMEGA   = 10 * math.pi  # 角频率 rad/s
K_VAL   = 4  * math.pi  # 波数 m⁻¹
NU      = OMEGA / (2 * math.pi)   # 5 Hz
LAM     = 2  * math.pi / K_VAL    # 0.5 m
U       = OMEGA / K_VAL            # 2.5 m/s
V_MAX   = OMEGA * A_VAL            # 质点最大速度
A_MAX   = OMEGA ** 2 * A_VAL       # 质点最大加速度


class Ch04Ex1WaveParamFromEquation(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════
        # Step 1 · 标题 + 副标题
        # ══════════════════════════════════════════════════════════
        title = Text("例题：由波函数读取物理量", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第四章 机械波 · 4.1 平面简谐波", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2 · 生活类比引入
        # ══════════════════════════════════════════════════════════
        ana1 = Text("拿到一个「波函数」，就像拿到了波的身份证——", font=CJK).scale(0.47)
        ana2 = Text("括号里的系数直接告诉你振幅、频率、波长、波速。", font=CJK).scale(0.47)
        ana3 = Text("本题就来练习如何「按图索骥」一步步读出所有物理量。", font=CJK, color=YELLOW).scale(0.47)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════
        # Step 3 · 展示完整波函数（左侧固定）
        # ══════════════════════════════════════════════════════════
        eq_label = Text("已知波函数：", font=CJK, color=WHITE).scale(0.44)
        wave_eq = MathTex(
            r"y", r"=",
            r"0.05",
            r"\cos(",
            r"10\pi",
            r"t",
            r"-",
            r"4\pi",
            r"x",
            r")\;\mathrm{m}",
        ).scale(0.82)

        eq_row = VGroup(eq_label, wave_eq).arrange(RIGHT, buff=0.25)
        eq_row.next_to(title, DOWN, buff=0.6)
        self.play(Write(eq_label), Write(wave_eq))
        self.wait(1.2)

        # 固定波函数到屏幕左侧，腾出右侧给标注
        self.play(eq_row.animate.scale(0.88).to_edge(LEFT, buff=0.4).shift(UP * 0.3))
        self.wait(0.6)

        # ══════════════════════════════════════════════════════════
        # Step 4 · 标注振幅 A = 0.05 m（圈出系数 0.05）
        # ══════════════════════════════════════════════════════════
        box_A = SurroundingRectangle(wave_eq[2], color=GREEN, buff=0.08, corner_radius=0.06)
        lbl_A_zh  = Text("振幅", font=CJK, color=GREEN).scale(0.42)
        lbl_A_eq  = MathTex(r"A = 0.05\;\mathrm{m}", color=GREEN).scale(0.7)
        lbl_A = VGroup(lbl_A_zh, lbl_A_eq).arrange(RIGHT, buff=0.18)
        lbl_A.to_edge(RIGHT, buff=0.5).shift(UP * 1.4)

        self.play(Create(box_A))
        self.play(FadeIn(lbl_A))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════
        # Step 5 · 标注角频率 ω → 频率 ν（圈出 10π）
        # ══════════════════════════════════════════════════════════
        box_omega = SurroundingRectangle(wave_eq[4], color=ORANGE, buff=0.08, corner_radius=0.06)
        lbl_omega_zh  = Text("角频率", font=CJK, color=ORANGE).scale(0.42)
        lbl_omega_eq1 = MathTex(r"\omega = 10\pi\;\mathrm{rad/s}", color=ORANGE).scale(0.68)
        lbl_omega_zh2 = Text("频率", font=CJK, color=ORANGE).scale(0.42)
        lbl_omega_eq2 = MathTex(
            r"\nu = \frac{\omega}{2\pi} = \frac{10\pi}{2\pi} = 5\;\mathrm{Hz}",
            color=ORANGE,
        ).scale(0.65)

        lbl_nu_row1 = VGroup(lbl_omega_zh,  lbl_omega_eq1).arrange(RIGHT, buff=0.18)
        lbl_nu_row2 = VGroup(lbl_omega_zh2, lbl_omega_eq2).arrange(RIGHT, buff=0.18)
        lbl_omega_group = VGroup(lbl_nu_row1, lbl_nu_row2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        lbl_omega_group.to_edge(RIGHT, buff=0.35).shift(UP * 0.3)

        self.play(Create(box_omega))
        self.play(FadeIn(lbl_nu_row1))
        self.wait(0.8)
        self.play(FadeIn(lbl_nu_row2))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════
        # Step 6 · 标注波数 k → 波长 λ（圈出 4π）
        # ══════════════════════════════════════════════════════════
        box_k = SurroundingRectangle(wave_eq[7], color=CYAN, buff=0.08, corner_radius=0.06)
        lbl_k_zh  = Text("波数", font=CJK, color=CYAN).scale(0.42)
        lbl_k_eq1 = MathTex(r"k = 4\pi\;\mathrm{m^{-1}}", color=CYAN).scale(0.68)
        lbl_k_zh2 = Text("波长", font=CJK, color=CYAN).scale(0.42)
        lbl_k_eq2 = MathTex(
            r"\lambda = \frac{2\pi}{k} = \frac{2\pi}{4\pi} = 0.5\;\mathrm{m}",
            color=CYAN,
        ).scale(0.65)

        lbl_k_row1 = VGroup(lbl_k_zh,  lbl_k_eq1).arrange(RIGHT, buff=0.18)
        lbl_k_row2 = VGroup(lbl_k_zh2, lbl_k_eq2).arrange(RIGHT, buff=0.18)
        lbl_k_group = VGroup(lbl_k_row1, lbl_k_row2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        lbl_k_group.to_edge(RIGHT, buff=0.35).shift(DOWN * 0.85)

        self.play(Create(box_k))
        self.play(FadeIn(lbl_k_row1))
        self.wait(0.8)
        self.play(FadeIn(lbl_k_row2))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════
        # Step 7 · 波速 u = ω/k 数字"飞入"公式槽
        # ══════════════════════════════════════════════════════════
        # 从 ω 标注和 k 标注分别"飞出"数字
        fly_omega = MathTex(r"10\pi", color=ORANGE).scale(0.7).move_to(lbl_nu_row1.get_center())
        fly_k     = MathTex(r"4\pi",  color=CYAN  ).scale(0.7).move_to(lbl_k_row1.get_center())

        speed_zh  = Text("波速", font=CJK, color=YELLOW).scale(0.44)
        speed_eq  = MathTex(
            r"u = \frac{\omega}{k} = \frac{10\pi}{4\pi} = 2.5\;\mathrm{m/s}",
            color=YELLOW,
        ).scale(0.7)
        speed_row = VGroup(speed_zh, speed_eq).arrange(RIGHT, buff=0.18)
        speed_row.to_edge(RIGHT, buff=0.35).shift(DOWN * 2.1)

        # 飞行动画：复制数字，飞向目标位置
        fly_omega_copy = fly_omega.copy()
        fly_k_copy     = fly_k.copy()
        self.add(fly_omega_copy, fly_k_copy)
        self.play(
            fly_omega_copy.animate.move_to(speed_eq.get_left() + RIGHT * 1.1),
            fly_k_copy.animate.move_to(speed_eq.get_left() + RIGHT * 1.8),
            run_time=0.9,
        )
        self.play(FadeOut(fly_omega_copy), FadeOut(fly_k_copy), FadeIn(speed_row))
        self.wait(1.5)

        # 清场：保留波函数和 A 标注，其余标注淡出
        self.play(
            FadeOut(box_A), FadeOut(lbl_A),
            FadeOut(box_omega), FadeOut(lbl_omega_group),
            FadeOut(box_k), FadeOut(lbl_k_group),
            FadeOut(speed_row),
        )
        self.wait(0.4)

        # 把波函数移到顶部居中，给图形空间
        self.play(eq_row.animate.scale(0.95).to_edge(UP, buff=0.45).set_x(0))
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════
        # Step 8 · t=0 时刻波形快照（Axes + plot + λ 双向箭头）
        # ══════════════════════════════════════════════════════════
        axes_wave = Axes(
            x_range=[0, 1.0, 0.25],
            y_range=[-0.07, 0.07, 0.05],
            x_length=6.5,
            y_length=2.4,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.6 + LEFT * 2.8)

        x_lbl_w = MathTex(r"x\;(\mathrm{m})").scale(0.5).next_to(axes_wave.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_w = MathTex(r"y\;(\mathrm{m})").scale(0.5).next_to(axes_wave.y_axis.get_end(), LEFT, buff=0.12)

        wave_plot = axes_wave.plot(
            lambda x: A_VAL * math.cos(K_VAL * x),   # t=0
            x_range=[0, 1.0],
            color=YELLOW,
        )
        snap_title = Text("t=0 时刻波形", font=CJK, color=WHITE).scale(0.40)
        snap_title.next_to(axes_wave, UP, buff=0.15)

        self.play(Create(axes_wave), FadeIn(x_lbl_w), FadeIn(y_lbl_w), FadeIn(snap_title))
        self.play(Create(wave_plot))
        self.wait(0.6)

        # 标注 λ = 0.5 m：从 x=0 到 x=0.5 的双向箭头
        p_start = axes_wave.c2p(0, 0)
        p_end   = axes_wave.c2p(LAM, 0)
        lam_arrow = DoubleArrow(p_start, p_end, color=GREEN, buff=0, stroke_width=2.5, tip_length=0.15)
        lam_arrow.shift(DOWN * 0.22)
        lam_lbl_zh = Text("波长", font=CJK, color=GREEN).scale(0.38)
        lam_lbl_eq = MathTex(r"\lambda=0.5\;\mathrm{m}", color=GREEN).scale(0.58)
        lam_lbl = VGroup(lam_lbl_zh, lam_lbl_eq).arrange(RIGHT, buff=0.1)
        lam_lbl.next_to(lam_arrow, DOWN, buff=0.15)

        self.play(Create(lam_arrow), FadeIn(lam_lbl))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════
        # Step 9 · x=0 处质点振动曲线（右侧）
        # ══════════════════════════════════════════════════════════
        axes_osc = Axes(
            x_range=[0, 1.0, 0.2],
            y_range=[-0.07, 0.07, 0.05],
            x_length=5.2,
            y_length=2.4,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.6 + RIGHT * 3.2)

        x_lbl_o = MathTex(r"t\;(\mathrm{s})").scale(0.5).next_to(axes_osc.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_o = MathTex(r"y\;(\mathrm{m})").scale(0.5).next_to(axes_osc.y_axis.get_end(), LEFT, buff=0.12)

        # y(0,t) = 0.05 cos(10π t)
        osc_plot = axes_osc.plot(
            lambda t_val: A_VAL * math.cos(OMEGA * t_val),
            x_range=[0, 1.0],
            color=ORANGE,
        )
        osc_title = Text("x=0 处质点振动", font=CJK, color=WHITE).scale(0.40)
        osc_title.next_to(axes_osc, UP, buff=0.15)

        self.play(Create(axes_osc), FadeIn(x_lbl_o), FadeIn(y_lbl_o), FadeIn(osc_title))
        self.play(Create(osc_plot))
        self.wait(0.6)

        # 标注 v_max（平衡点：y=0，取 t=T/4=0.05 s）
        T_wave = 1.0 / NU          # 0.2 s
        t_eq   = T_wave / 4.0     # 0.05 s  →  y=0，速度最大
        p_vmax = axes_osc.c2p(t_eq, 0)
        dot_vmax = Dot(p_vmax, color=RED, radius=0.09)
        lbl_vmax_zh = Text("速度最大", font=CJK, color=RED).scale(0.36)
        lbl_vmax_eq = MathTex(r"v_{\max}=\omega A", color=RED).scale(0.56)
        lbl_vmax = VGroup(lbl_vmax_zh, lbl_vmax_eq).arrange(DOWN, buff=0.08)
        lbl_vmax.next_to(dot_vmax, RIGHT, buff=0.18)

        # 标注 a_max（端点：y=A，取 t=0）
        p_amax = axes_osc.c2p(0, A_VAL)
        dot_amax = Dot(p_amax, color=CYAN, radius=0.09)
        lbl_amax_zh = Text("加速度最大", font=CJK, color=CYAN).scale(0.36)
        lbl_amax_eq = MathTex(r"a_{\max}=\omega^2 A", color=CYAN).scale(0.56)
        lbl_amax = VGroup(lbl_amax_zh, lbl_amax_eq).arrange(DOWN, buff=0.08)
        lbl_amax.next_to(dot_amax, UP, buff=0.15)

        self.play(FadeIn(dot_vmax), FadeIn(lbl_vmax))
        self.wait(0.8)
        self.play(FadeIn(dot_amax), FadeIn(lbl_amax))
        self.wait(1.5)

        # 平衡位置竖向虚线（辅助直觉：y=0 处速度最大）
        p_eq_top = axes_osc.c2p(t_eq,  A_VAL * 1.1)
        p_eq_bot = axes_osc.c2p(t_eq, -A_VAL * 1.1)
        dash_eq  = DashedLine(p_eq_top, p_eq_bot, color=RED, stroke_width=1.5)
        self.play(Create(dash_eq))
        self.wait(1.2)

        # 清场，准备小结
        scene_group = VGroup(
            axes_wave, x_lbl_w, y_lbl_w, wave_plot, snap_title, lam_arrow, lam_lbl,
            axes_osc,  x_lbl_o, y_lbl_o, osc_plot,  osc_title,
            dot_vmax, lbl_vmax, dot_amax, lbl_amax, dash_eq,
            eq_row,
        )
        self.play(FadeOut(scene_group))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # Step 10 · 小结卡：关键公式汇总
        # ══════════════════════════════════════════════════════════
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.6)
        s_title.next_to(title, DOWN, buff=0.5)

        row_wave = MathTex(
            r"y = 0.05\cos(10\pi t - 4\pi x)\;\mathrm{m}",
            color=YELLOW,
        ).scale(0.72)

        row_nu   = MathTex(
            r"\nu = \frac{\omega}{2\pi} = 5\;\mathrm{Hz},\quad "
            r"\lambda = \frac{2\pi}{k} = 0.5\;\mathrm{m},\quad "
            r"u = \lambda\nu = 2.5\;\mathrm{m/s}",
            color=GREEN,
        ).scale(0.62)

        row_va   = MathTex(
            r"v_{\max} = \omega A = 10\pi \times 0.05 \approx 1.57\;\mathrm{m/s},\quad "
            r"a_{\max} = \omega^2 A \approx 49.3\;\mathrm{m/s^2}",
            color=CYAN,
        ).scale(0.60)

        summary = VGroup(row_wave, row_nu, row_va).arrange(DOWN, buff=0.40)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(row_wave))
        self.wait(0.6)
        self.play(Write(row_nu))
        self.wait(0.6)
        self.play(Write(row_va))
        self.play(Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Ex1WaveParamFromEquation",
        "id": "phys-ch04-4.1-ex1-wave-param-from-equation",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "例题：由波函数读取物理量",
        "description": "给定 y=0.05cos(10πt-4πx)，逐步彩框标注系数读出振幅 A、角频率 ω、波数 k，推导频率、波长、波速，并可视化 t=0 波形与 x=0 振动曲线，标出质点最大速度与最大加速度的位置。",
    },
]
