"""第 3.3 节 · 阻尼振动（函数曲线范式：Axes.plot + ValueTracker 参数扫动）。

展示三种阻尼状态（欠阻尼/临界阻尼/过阻尼）的位移曲线，
用 ValueTracker(beta) + always_redraw 演示阻尼系数增大时波形的变化，
并用包络线直观说明振幅的指数衰减。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch03Kp1DampedOscillation",
        "id": "phys-ch03-3.3-kp1-damped-oscillation",
        "chapterId": "ch03",
        "sectionId": "3.3",
        "title": "阻尼振动：三种阻尼状态与指数衰减",
        "description": "用三色曲线对比欠阻尼/临界阻尼/过阻尼，ValueTracker 演示 β 增大时振幅指数衰减与振荡消失的完整过程。",
    },
]


class Ch03Kp1DampedOscillation(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("阻尼振动：三种阻尼状态与指数衰减", font=CJK, color=BLUE).scale(0.6).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("弹簧拨一下后，摆动会越来越弱——", font=CJK).scale(0.48)
        ana2 = Text("这是因为空气阻力或内摩擦持续「吸走」振动能量，", font=CJK).scale(0.48)
        ana3 = Text("阻尼越大，振动越快消失，甚至连一次振荡都完成不了。", font=CJK).scale(0.48)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ── Step 3: 运动方程与欠阻尼解（逐步出现）──────────────────────
        eq_label = Text("运动方程：", font=CJK, color=YELLOW).scale(0.46)
        eq_motion = MathTex(r"\ddot{x} + 2\beta\dot{x} + \omega_0^2 x = 0").scale(0.82)
        row1 = VGroup(eq_label, eq_motion).arrange(RIGHT, buff=0.18)
        row1.next_to(title, DOWN, buff=0.52)
        self.play(FadeIn(eq_label), Write(eq_motion))
        self.wait(1.0)

        eq2_label = Text("欠阻尼解：", font=CJK, color=CYAN).scale(0.46)
        eq2_body = MathTex(
            r"x = A_0 e^{-\beta t}\cos(\omega' t + \varphi)"
        ).scale(0.82)
        eq2_body[0][5:9].set_color(RED)          # e^{-βt} 指数部分
        eq2_body[0][9:].set_color(BLUE)           # cos 部分
        row2 = VGroup(eq2_label, eq2_body).arrange(RIGHT, buff=0.18)
        row2.next_to(row1, DOWN, buff=0.28)
        self.play(FadeIn(eq2_label), Write(eq2_body))
        self.wait(0.8)

        eq3_label = Text("阻尼振动角频率：", font=CJK, color=ORANGE).scale(0.46)
        eq3_body = MathTex(r"\omega' = \sqrt{\omega_0^2 - \beta^2}").scale(0.82)
        eq3_body[0].set_color(ORANGE)
        row3 = VGroup(eq3_label, eq3_body).arrange(RIGHT, buff=0.18)
        row3.next_to(row2, DOWN, buff=0.28)
        self.play(FadeIn(eq3_label), Write(eq3_body))
        self.wait(0.8)

        eq4_label = Text("周期变长：", font=CJK, color=GREEN).scale(0.46)
        eq4_body = MathTex(r"T' = \frac{2\pi}{\omega'} > T_0").scale(0.82)
        row4 = VGroup(eq4_label, eq4_body).arrange(RIGHT, buff=0.18)
        row4.next_to(row3, DOWN, buff=0.28)
        self.play(FadeIn(eq4_label), Write(eq4_body))
        self.wait(1.8)
        self.play(FadeOut(VGroup(row1, row2, row3, row4)))

        # ── Step 4: 欠阻尼曲线 + ValueTracker β 扫动 + 包络线 ──────────
        omega0 = 2.0   # 固有角频率
        A0 = 1.0

        axes = Axes(
            x_range=[0, 5.5, 1],
            y_range=[-1.4, 1.4, 0.5],
            x_length=10.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.6)
        x_lbl = MathTex(r"t").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"x").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        beta = ValueTracker(0.3)

        # 欠阻尼曲线（蓝色，仅 β < ω₀ 时有意义）
        def under_curve():
            b = beta.get_value()
            if b >= omega0:
                return axes.plot(lambda t: 0, x_range=[0, 5.5], color=BLUE)
            omega_prime = math.sqrt(max(omega0**2 - b**2, 0))
            return axes.plot(
                lambda t: A0 * math.exp(-b * t) * math.cos(omega_prime * t),
                x_range=[0, 5.5],
                color=BLUE,
                stroke_width=2.5,
            )

        # 正包络（红色虚线）
        def env_pos():
            b = beta.get_value()
            return axes.plot(
                lambda t: A0 * math.exp(-b * t),
                x_range=[0, 5.5],
                color=RED,
                stroke_width=1.8,
            ).set_stroke(dash_array=[0.12, 0.12])

        # 负包络（红色虚线）
        def env_neg():
            b = beta.get_value()
            return axes.plot(
                lambda t: -A0 * math.exp(-b * t),
                x_range=[0, 5.5],
                color=RED,
                stroke_width=1.8,
            ).set_stroke(dash_array=[0.12, 0.12])

        wave_under = always_redraw(under_curve)
        envelope_pos = always_redraw(env_pos)
        envelope_neg = always_redraw(env_neg)

        cap_under = Text("蓝色：欠阻尼振动   红虚线：振幅包络", font=CJK, color=WHITE).scale(0.4)
        cap_under.to_edge(DOWN, buff=0.5)

        beta_label_zh = Text("阻尼系数 β =", font=CJK, color=YELLOW).scale(0.42)
        beta_val_label = always_redraw(
            lambda: MathTex(f"{beta.get_value():.2f}").scale(0.55).set_color(YELLOW)
        )
        beta_row = always_redraw(
            lambda: VGroup(
                Text("β =", font=CJK, color=YELLOW).scale(0.42),
                MathTex(f"{beta.get_value():.2f}").scale(0.55).set_color(YELLOW),
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.4)
        )

        self.play(
            Create(wave_under),
            Create(envelope_pos),
            Create(envelope_neg),
            FadeIn(cap_under),
            FadeIn(beta_row),
        )
        self.wait(1.0)

        # β 从 0.3 缓慢增大到接近 ω₀（欠阻尼范围内扫动）
        self.play(
            beta.animate.set_value(0.9),
            run_time=4.0,
            rate_func=linear,
        )
        self.wait(1.2)

        env_label_pos = VGroup(
            Text("正包络：", font=CJK, color=RED).scale(0.38),
            MathTex(r"+A_0 e^{-\beta t}", color=RED).scale(0.6),
        ).arrange(RIGHT, buff=0.08).next_to(axes, UP, buff=0.08).to_edge(RIGHT, buff=0.5)
        env_label_neg = VGroup(
            Text("负包络：", font=CJK, color=RED).scale(0.38),
            MathTex(r"-A_0 e^{-\beta t}", color=RED).scale(0.6),
        ).arrange(RIGHT, buff=0.08).next_to(env_label_pos, DOWN, buff=0.12)

        self.play(FadeIn(env_label_pos), FadeIn(env_label_neg))
        self.wait(1.5)
        self.play(
            FadeOut(wave_under),
            FadeOut(envelope_pos),
            FadeOut(envelope_neg),
            FadeOut(cap_under),
            FadeOut(beta_row),
            FadeOut(env_label_pos),
            FadeOut(env_label_neg),
        )

        # ── Step 5: 三种阻尼状态对比（三色曲线并排）──────────────────────
        beta_under = 0.5      # 欠阻尼：β < ω₀
        beta_crit  = omega0   # 临界阻尼：β = ω₀
        beta_over  = 3.5      # 过阻尼：β > ω₀

        # 欠阻尼（蓝色）
        omega_prime_u = math.sqrt(omega0**2 - beta_under**2)
        curve_under = axes.plot(
            lambda t: A0 * math.exp(-beta_under * t) * math.cos(omega_prime_u * t),
            x_range=[0, 5.5],
            color=BLUE,
            stroke_width=2.5,
        )

        # 临界阻尼（橙色）：x = A₀(1+ω₀t)e^{-ω₀t}
        curve_crit = axes.plot(
            lambda t: A0 * (1 + omega0 * t) * math.exp(-beta_crit * t),
            x_range=[0, 5.5],
            color=ORANGE,
            stroke_width=2.5,
        )

        # 过阻尼（绿色）：x = A₀·cosh(√(β²-ω₀²)·t)·e^{-βt} 近似为双指数
        delta_over = math.sqrt(beta_over**2 - omega0**2)
        curve_over = axes.plot(
            lambda t: A0 * math.exp(-beta_over * t) * math.cosh(delta_over * t),
            x_range=[0, 5.5],
            color=GREEN,
            stroke_width=2.5,
        )

        # 逐条绘制
        self.play(Create(curve_under), run_time=1.5)
        lbl_u = VGroup(
            Text("欠阻尼", font=CJK, color=BLUE).scale(0.4),
            MathTex(r"\beta<\omega_0", color=BLUE).scale(0.55),
        ).arrange(DOWN, buff=0.08).next_to(axes.c2p(1.5, 1.1), UP, buff=0.08)
        self.play(FadeIn(lbl_u))
        self.wait(0.8)

        self.play(Create(curve_crit), run_time=1.5)
        # 临界阻尼标注：右侧空白区
        note_crit = VGroup(
            Text("临界阻尼", font=CJK, color=ORANGE).scale(0.4),
            MathTex(r"\beta=\omega_0", color=ORANGE).scale(0.55),
            Text("最快回平衡，不振荡", font=CJK, color=ORANGE).scale(0.36),
        ).arrange(DOWN, buff=0.08)
        note_crit.to_corner(UR, buff=0.35).shift(DOWN * 0.3)
        self.play(FadeIn(note_crit))
        self.wait(0.8)

        self.play(Create(curve_over), run_time=1.5)
        note_over = VGroup(
            Text("过阻尼", font=CJK, color=GREEN).scale(0.4),
            MathTex(r"\beta>\omega_0", color=GREEN).scale(0.55),
            Text("回平衡更慢，也不振荡", font=CJK, color=GREEN).scale(0.36),
        ).arrange(DOWN, buff=0.08)
        note_over.next_to(note_crit, DOWN, buff=0.28)
        self.play(FadeIn(note_over))
        self.wait(2.0)

        # ── Step 6: 应用场景图例 ────────────────────────────────────────
        app_title = Text("应用场景", font=CJK, color=WHITE).scale(0.44).to_edge(DOWN, buff=1.0)
        app_u = VGroup(
            Text("蓝-欠阻尼", font=CJK, color=BLUE).scale(0.38),
            Text("弹簧玩具、钟摆", font=CJK, color=WHITE).scale(0.36),
        ).arrange(RIGHT, buff=0.15)
        app_c = VGroup(
            Text("橙-临界", font=CJK, color=ORANGE).scale(0.38),
            Text("汽车减振器、门弹簧", font=CJK, color=WHITE).scale(0.36),
        ).arrange(RIGHT, buff=0.15)
        app_o = VGroup(
            Text("绿-过阻尼", font=CJK, color=GREEN).scale(0.38),
            Text("液压门铰、重阻尼缓冲器", font=CJK, color=WHITE).scale(0.36),
        ).arrange(RIGHT, buff=0.15)
        app_group = VGroup(app_u, app_c, app_o).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        app_group.to_edge(DOWN, buff=0.35)
        self.play(FadeIn(app_group))
        self.wait(2.0)

        # 清场
        self.play(
            FadeOut(VGroup(
                curve_under, curve_crit, curve_over,
                lbl_u, note_crit, note_over,
                app_group, axes, x_lbl, y_lbl,
            ))
        )

        # ── Step 7: 判据面板（公式汇总）───────────────────────────────────
        panel_title = Text("三种状态判据", font=CJK, color=BLUE).scale(0.52)
        panel_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(panel_title))

        # 欠阻尼
        crit_line = VGroup(
            MathTex(r"\beta < \omega_0", color=BLUE).scale(0.78),
            Text("→ 欠阻尼，存在振荡", font=CJK, color=BLUE).scale(0.44),
        ).arrange(RIGHT, buff=0.25)

        # 临界
        crit_line2 = VGroup(
            MathTex(r"\beta = \omega_0", color=ORANGE).scale(0.78),
            Text("→ 临界阻尼，最快无振荡回零", font=CJK, color=ORANGE).scale(0.44),
        ).arrange(RIGHT, buff=0.25)

        # 过阻尼
        crit_line3 = VGroup(
            MathTex(r"\beta > \omega_0", color=GREEN).scale(0.78),
            Text("→ 过阻尼，缓慢无振荡趋零", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.25)

        criteria = VGroup(crit_line, crit_line2, crit_line3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        criteria.next_to(panel_title, DOWN, buff=0.45)
        criteria.scale_to_fit_width(12.5)

        for line in [crit_line, crit_line2, crit_line3]:
            self.play(FadeIn(line))
            self.wait(0.8)

        self.wait(1.0)

        # ── Step 8: 公式面板 ────────────────────────────────────────────
        formula_title = Text("核心公式", font=CJK, color=YELLOW).scale(0.46)
        f1 = VGroup(
            Text("位移：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"x = A_0 e^{-\beta t}\cos(\omega' t + \varphi)", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.18)
        f2 = VGroup(
            Text("阻尼频率：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\omega' = \sqrt{\omega_0^2 - \beta^2}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.18)
        f3 = VGroup(
            Text("周期：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"T' = \dfrac{2\pi}{\omega'} > T_0", color=CYAN).scale(0.72),
        ).arrange(RIGHT, buff=0.18)

        formula_box_items = VGroup(f1, f2, f3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        formula_box_items.next_to(criteria, DOWN, buff=0.38)
        formula_box_items.scale_to_fit_width(12.5)

        formula_title.next_to(formula_box_items, UP, buff=0.25)

        box = SurroundingRectangle(formula_box_items, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(formula_title))
        self.play(Write(f1))
        self.wait(0.5)
        self.play(Write(f2))
        self.wait(0.5)
        self.play(Write(f3))
        self.play(Create(box))
        self.wait(2.0)

        self.play(
            FadeOut(VGroup(
                panel_title, criteria, formula_title,
                formula_box_items, box,
            ))
        )

        # ── Step 9: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)

        s1 = VGroup(
            Text("阻尼系数 β 决定振动衰减速率，", font=CJK, color=WHITE).scale(0.44),
        )
        s2 = MathTex(r"x = A_0 e^{-\beta t}\cos(\omega' t+\varphi),\quad \omega'=\sqrt{\omega_0^2-\beta^2}",
                     color=YELLOW).scale(0.68)
        s3_u = VGroup(
            MathTex(r"\beta < \omega_0", color=BLUE).scale(0.68),
            Text("欠阻尼：振幅按指数衰减，频率降低", font=CJK, color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.2)
        s3_c = VGroup(
            MathTex(r"\beta = \omega_0", color=ORANGE).scale(0.68),
            Text("临界：最快无振荡，汽车减振器首选", font=CJK, color=ORANGE).scale(0.42),
        ).arrange(RIGHT, buff=0.2)
        s3_o = VGroup(
            MathTex(r"\beta > \omega_0", color=GREEN).scale(0.68),
            Text("过阻尼：更慢回零，液压铰链应用", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3_u, s3_c, s3_o).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.8)

        sum_box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.play(Write(s2))
        self.play(FadeIn(s3_u))
        self.play(FadeIn(s3_c))
        self.play(FadeIn(s3_o))
        self.play(Create(sum_box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, sum_box, title)))
        self.wait(0.3)
