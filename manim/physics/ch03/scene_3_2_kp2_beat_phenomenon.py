"""第 3.2 节 · 拍现象与拍频（金标准范本：Axes.plot 双波 + ValueTracker + always_redraw）

物理动画：两个频率接近的余弦波叠加，演示包络「拍」现象，
用 ValueTracker 改变频率差，观察拍频等比例变化；
旁注调音应用（音叉+弦，拍频趋近0即音高一致）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch03Kp2BeatPhenomenon(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("拍现象与拍频", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("你有没有听过两把音叉同时响时，", font=CJK).scale(0.48)
        ana2 = Text("声音会「忽强忽弱」地周期性起伏？", font=CJK).scale(0.48)
        ana3 = Text("这就是拍现象——两个频率接近的振动叠加后产生的「慢包络」振荡。",
                    font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 定义——两分量波（逐步出现）──────────────────────────
        def_title = Text("两个频率接近的振动", font=CJK, color=YELLOW).scale(0.5)
        def_title.next_to(title, DOWN, buff=0.45)
        eq1 = MathTex(r"x_1 = A\cos(\omega_1 t)", color=BLUE).scale(0.82)
        eq2 = MathTex(r"x_2 = A\cos(\omega_2 t)", color=ORANGE).scale(0.82)
        cond = VGroup(
            Text("两波振幅相同，频率略有差异：", font=CJK).scale(0.42),
            MathTex(r"\omega_1 \approx \omega_2,\quad \omega_1 > \omega_2").scale(0.72),
        ).arrange(RIGHT, buff=0.3)
        eqs = VGroup(eq1, eq2).arrange(RIGHT, buff=1.2)
        defs = VGroup(def_title, eqs, cond).arrange(DOWN, buff=0.38)
        defs.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(def_title))
        self.wait(0.4)
        self.play(Write(eq1))
        self.wait(0.5)
        self.play(Write(eq2))
        self.wait(0.6)
        self.play(FadeIn(cond))
        self.wait(1.4)
        self.play(FadeOut(defs))

        # ── Step 4: 推导合振动公式（逐步） ──────────────────────────────
        derive_title = Text("利用积化和差推导合振动", font=CJK, color=YELLOW).scale(0.48)
        derive_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(derive_title))
        self.wait(0.4)

        d1 = MathTex(
            r"x = x_1 + x_2 = A\cos(\omega_1 t) + A\cos(\omega_2 t)"
        ).scale(0.68)
        d1.next_to(derive_title, DOWN, buff=0.4)
        self.play(Write(d1))
        self.wait(1.0)

        d2_label = Text("积化和差：", font=CJK).scale(0.42)
        d2_formula = MathTex(
            r"\cos\alpha + \cos\beta = 2\cos\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}"
        ).scale(0.65)
        d2 = VGroup(d2_label, d2_formula).arrange(RIGHT, buff=0.25)
        d2.next_to(d1, DOWN, buff=0.35)
        self.play(FadeIn(d2_label), Write(d2_formula))
        self.wait(1.0)

        d3 = MathTex(
            r"x = ",
            r"2A\cos\!\frac{(\omega_1-\omega_2)t}{2}",
            r"\cdot",
            r"\cos\!\frac{(\omega_1+\omega_2)t}{2}",
        ).scale(0.72)
        d3[1].set_color(RED)    # 慢包络
        d3[3].set_color(GREEN)  # 快速振荡
        d3.next_to(d2, DOWN, buff=0.4)
        self.play(Write(d3))
        self.wait(0.8)

        # 标注两因子含义
        label_slow = VGroup(
            Text("慢变振幅（包络）", font=CJK, color=RED).scale(0.38),
        )
        label_fast = VGroup(
            Text("快速振荡（载波）", font=CJK, color=GREEN).scale(0.38),
        )
        label_slow.next_to(d3[1], DOWN, buff=0.18)
        label_fast.next_to(d3[3], DOWN, buff=0.18)
        self.play(FadeIn(label_slow), FadeIn(label_fast))
        self.wait(1.6)
        self.play(FadeOut(VGroup(derive_title, d1, d2, d3, label_slow, label_fast)))

        # ── Step 5: 双波坐标系——同时绘制 x1, x2 ────────────────────────
        # 参数设置：ω1 略大于 ω2
        A_val = 0.7
        omega1 = 2 * math.pi * 3.2   # ≈ 3.2 Hz
        omega2 = 2 * math.pi * 2.8   # ≈ 2.8 Hz
        T_show = 2.0                  # 显示时间范围（秒）

        axes_top = Axes(
            x_range=[0, T_show, 0.5],
            y_range=[-1.6, 1.6, 1],
            x_length=10.5,
            y_length=2.2,
            axis_config={"color": GRAY, "include_tip": True},
        ).shift(UP * 0.6)
        axes_top.next_to(title, DOWN, buff=0.38)

        x_lbl_top = MathTex(r"t").scale(0.55).next_to(axes_top.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_top = MathTex(r"x").scale(0.55).next_to(axes_top.y_axis.get_end(), LEFT, buff=0.12)

        label_top = Text("两分量波（蓝=x1, 橙=x2）", font=CJK, color=WHITE).scale(0.38)
        label_top.next_to(axes_top, UP, buff=0.08)

        wave1_curve = axes_top.plot(
            lambda t_: A_val * math.cos(omega1 * t_),
            x_range=[0, T_show],
            color=BLUE,
            stroke_width=2.2,
        )
        wave2_curve = axes_top.plot(
            lambda t_: A_val * math.cos(omega2 * t_),
            x_range=[0, T_show],
            color=ORANGE,
            stroke_width=2.2,
        )

        self.play(
            Create(axes_top),
            FadeIn(x_lbl_top),
            FadeIn(y_lbl_top),
            FadeIn(label_top),
        )
        self.wait(0.3)
        self.play(Create(wave1_curve), Create(wave2_curve), run_time=2.5)
        self.wait(1.2)

        # ── Step 6: 下方坐标系——合振动 + 包络 ───────────────────────────
        axes_bot = Axes(
            x_range=[0, T_show, 0.5],
            y_range=[-1.7, 1.7, 1],
            x_length=10.5,
            y_length=2.3,
            axis_config={"color": GRAY, "include_tip": True},
        )
        axes_bot.next_to(axes_top, DOWN, buff=0.5)

        x_lbl_bot = MathTex(r"t").scale(0.55).next_to(axes_bot.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_bot = MathTex(r"x").scale(0.55).next_to(axes_bot.y_axis.get_end(), LEFT, buff=0.12)

        label_bot = Text("合振动 x = x1 + x2", font=CJK, color=WHITE).scale(0.38)
        label_bot.next_to(axes_bot, UP, buff=0.08)

        # 合振动曲线（绿色）
        sum_curve = axes_bot.plot(
            lambda t_: A_val * math.cos(omega1 * t_) + A_val * math.cos(omega2 * t_),
            x_range=[0, T_show],
            color=GREEN,
            stroke_width=2.2,
        )

        # 包络（振幅调制曲线）—— 2A·|cos((ω1-ω2)t/2)|，用虚线红色
        delta_omega = omega1 - omega2  # 频率差
        envelope_pos = DashedVMobject(
            axes_bot.plot(
                lambda t_: 2 * A_val * abs(math.cos(delta_omega / 2 * t_)),
                x_range=[0, T_show],
                color=RED,
                stroke_width=2.5,
            ),
            num_dashes=60,
        )
        envelope_neg = DashedVMobject(
            axes_bot.plot(
                lambda t_: -2 * A_val * abs(math.cos(delta_omega / 2 * t_)),
                x_range=[0, T_show],
                color=RED,
                stroke_width=2.5,
            ),
            num_dashes=60,
        )

        self.play(
            Create(axes_bot),
            FadeIn(x_lbl_bot),
            FadeIn(y_lbl_bot),
            FadeIn(label_bot),
        )
        self.wait(0.3)
        self.play(Create(sum_curve), run_time=2.0)
        self.wait(0.5)
        self.play(Create(envelope_pos), Create(envelope_neg), run_time=1.5)

        # 旁注包络含义
        env_note = VGroup(
            Text("红虚线 = 慢变振幅包络", font=CJK, color=RED).scale(0.36),
            MathTex(r"2A\cos\!\frac{(\omega_1-\omega_2)t}{2}", color=RED).scale(0.55),
        ).arrange(DOWN, buff=0.15)
        env_note.to_edge(RIGHT, buff=0.3).shift(DOWN * 0.5)
        self.play(FadeIn(env_note))
        self.wait(1.8)

        # ── Step 7: 拍频公式 ─────────────────────────────────────────────
        beat_freq_eq = MathTex(
            r"\nu_{\text{beat}} = |\nu_1 - \nu_2|"
        ).scale(0.82).set_color(YELLOW)
        beat_box = SurroundingRectangle(beat_freq_eq, color=YELLOW, buff=0.2, corner_radius=0.1)
        beat_label = Text("拍频公式", font=CJK, color=YELLOW).scale(0.42)
        beat_group = VGroup(beat_label, VGroup(beat_freq_eq, beat_box)).arrange(DOWN, buff=0.2)
        beat_group.to_edge(RIGHT, buff=0.3).shift(UP * 1.8)
        self.play(FadeIn(beat_label), Write(beat_freq_eq), Create(beat_box))
        self.wait(1.5)

        # 清场两坐标系，准备动态演示
        self.play(
            FadeOut(VGroup(
                axes_top, x_lbl_top, y_lbl_top, label_top,
                wave1_curve, wave2_curve,
                axes_bot, x_lbl_bot, y_lbl_bot, label_bot,
                sum_curve, envelope_pos, envelope_neg,
                env_note,
            ))
        )
        self.wait(0.4)

        # ── Step 8: ValueTracker 动态演示拍频变化 ────────────────────────
        dyn_title = Text("频率差增大 → 拍频加快", font=CJK, color=YELLOW).scale(0.48)
        dyn_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(dyn_title))

        # 用 ValueTracker 控制 Δν（Hz）
        delta_nu = ValueTracker(0.4)   # 初始拍频 0.4 Hz
        nu_avg = 3.0                   # 平均频率 Hz

        T_dyn = 3.0   # 动态图显示时间范围（秒）

        axes_dyn = Axes(
            x_range=[0, T_dyn, 0.5],
            y_range=[-2.2, 2.2, 1],
            x_length=9.5,
            y_length=3.2,
            axis_config={"color": GRAY, "include_tip": True},
        )
        axes_dyn.next_to(dyn_title, DOWN, buff=0.35)
        x_lbl_d = MathTex(r"t\;(\mathrm{s})").scale(0.5).next_to(axes_dyn.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_d = MathTex(r"x").scale(0.5).next_to(axes_dyn.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes_dyn), FadeIn(x_lbl_d), FadeIn(y_lbl_d))

        # 合振动（always_redraw）
        sum_dyn = always_redraw(
            lambda: axes_dyn.plot(
                lambda t_: (
                    A_val * math.cos(2 * math.pi * (nu_avg + delta_nu.get_value() / 2) * t_)
                    + A_val * math.cos(2 * math.pi * (nu_avg - delta_nu.get_value() / 2) * t_)
                ),
                x_range=[0, T_dyn],
                color=GREEN,
                stroke_width=2.0,
            )
        )
        # 正包络
        env_dyn_p = always_redraw(
            lambda: DashedVMobject(
                axes_dyn.plot(
                    lambda t_: 2 * A_val * abs(math.cos(math.pi * delta_nu.get_value() * t_)),
                    x_range=[0, T_dyn],
                    color=RED,
                    stroke_width=2.5,
                ),
                num_dashes=55,
            )
        )
        # 负包络
        env_dyn_n = always_redraw(
            lambda: DashedVMobject(
                axes_dyn.plot(
                    lambda t_: -2 * A_val * abs(math.cos(math.pi * delta_nu.get_value() * t_)),
                    x_range=[0, T_dyn],
                    color=RED,
                    stroke_width=2.5,
                ),
                num_dashes=55,
            )
        )

        self.add(sum_dyn, env_dyn_p, env_dyn_n)
        self.wait(0.5)

        # 右上角实时拍频数值显示
        def make_beat_display():
            nu_val = delta_nu.get_value()
            num_text = f"{nu_val:.1f}"
            label_zh = Text("拍频", font=CJK, color=YELLOW).scale(0.45)
            nu_sym = MathTex(r"\nu_{\text{beat}} = ").scale(0.6).set_color(YELLOW)
            nu_num = Text(num_text + " Hz", font=CJK, color=YELLOW).scale(0.52)
            row = VGroup(nu_sym, nu_num).arrange(RIGHT, buff=0.12)
            disp = VGroup(label_zh, row).arrange(DOWN, buff=0.12)
            disp.to_corner(UR, buff=0.5).shift(DOWN * 0.3)
            return disp

        beat_display = always_redraw(make_beat_display)
        self.add(beat_display)
        self.wait(1.2)

        # 动画：增大频率差 → 拍频加快
        self.play(delta_nu.animate.set_value(1.6), run_time=4.5, rate_func=linear)
        self.wait(0.8)

        # 再减小回来
        self.play(delta_nu.animate.set_value(0.2), run_time=3.0, rate_func=linear)
        self.wait(1.0)

        self.play(
            FadeOut(VGroup(
                dyn_title, axes_dyn, x_lbl_d, y_lbl_d,
                sum_dyn, env_dyn_p, env_dyn_n,
                beat_display, beat_freq_eq, beat_box, beat_label,
            ))
        )
        self.wait(0.3)

        # ── Step 9: 调音应用场景图示 ─────────────────────────────────────
        app_title = Text("应用：乐器调音", font=CJK, color=YELLOW).scale(0.52)
        app_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(app_title))

        # 音叉图示（简化为矩形+文字）
        fork_rect = Rectangle(width=0.45, height=1.6, color=GRAY_B, fill_color=GRAY_D,
                              fill_opacity=0.7, stroke_width=2)
        fork_label = Text("标准音叉", font=CJK).scale(0.36).next_to(fork_rect, DOWN, buff=0.15)
        fork_nu = MathTex(r"\nu_1 = 440\;\mathrm{Hz}").scale(0.5)
        fork_nu.next_to(fork_label, DOWN, buff=0.1)
        fork_group = VGroup(fork_rect, fork_label, fork_nu)

        # 弦（待调乐器）图示
        string_rect = Rectangle(width=0.45, height=1.6, color=ORANGE, fill_color="#3A2000",
                                fill_opacity=0.7, stroke_width=2)
        string_label = Text("琴弦（待调）", font=CJK).scale(0.36).next_to(string_rect, DOWN, buff=0.15)
        string_nu = MathTex(r"\nu_2 \approx 437\;\mathrm{Hz}").scale(0.5)
        string_nu.next_to(string_label, DOWN, buff=0.1)
        string_group = VGroup(string_rect, string_label, string_nu)

        instruments = VGroup(fork_group, string_group).arrange(RIGHT, buff=1.8)
        instruments.next_to(app_title, DOWN, buff=0.5)

        arrow_beat = Arrow(
            fork_rect.get_right(), string_rect.get_left(),
            color=WHITE, buff=0.1, stroke_width=2,
        )
        beat_hz = VGroup(
            Text("拍频", font=CJK, color=RED).scale(0.4),
            MathTex(r"\nu_{\text{beat}} = 3\;\mathrm{Hz}").scale(0.58).set_color(RED),
        ).arrange(DOWN, buff=0.1)
        beat_hz.next_to(arrow_beat, UP, buff=0.2)

        self.play(FadeIn(fork_group), FadeIn(string_group))
        self.play(GrowArrow(arrow_beat), FadeIn(beat_hz))
        self.wait(1.0)

        # 调弦：拍频趋近 0
        tune_hint = VGroup(
            Text("旋紧琴弦 → ν₂ 升高 →", font=CJK, color=GREEN).scale(0.42),
            Text("拍频趋近 0 → 音高一致！", font=CJK, color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.2)
        tune_hint.next_to(instruments, DOWN, buff=0.5)
        self.play(FadeIn(tune_hint))
        self.wait(0.6)

        # 用淡出+数字变化模拟拍频减小
        beat_hz_zero = VGroup(
            Text("拍频", font=CJK, color=GREEN).scale(0.4),
            MathTex(r"\nu_{\text{beat}} \to 0").scale(0.58).set_color(GREEN),
        ).arrange(DOWN, buff=0.1)
        beat_hz_zero.next_to(arrow_beat, UP, buff=0.2)
        self.play(
            ReplacementTransform(beat_hz, beat_hz_zero),
            string_nu.animate.set_color(GREEN),
            run_time=1.5,
        )
        self.wait(1.5)
        self.play(
            FadeOut(VGroup(
                app_title, instruments, arrow_beat, beat_hz_zero, tune_hint,
            ))
        )
        self.wait(0.3)

        # ── Step 10: 小结卡 ───────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1_lbl = Text("合振动：", font=CJK).scale(0.42)
        s1_eq = MathTex(
            r"x = 2A\cos\!\frac{(\omega_1-\omega_2)t}{2}\cdot\cos\!\frac{(\omega_1+\omega_2)t}{2}",
            color=YELLOW,
        ).scale(0.62)
        s1 = VGroup(s1_lbl, s1_eq).arrange(RIGHT, buff=0.2)

        s2_lbl = Text("拍频：", font=CJK).scale(0.42)
        s2_eq = MathTex(r"\nu_{\text{beat}} = |\nu_1 - \nu_2|", color=GREEN).scale(0.72)
        s2 = VGroup(s2_lbl, s2_eq).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("慢变包络振幅 = 快变载波振幅受调制", font=CJK, color=RED).scale(0.40),
            Text("频率差越大，拍越快；差 = 0 时纯音，无拍", font=CJK, color=WHITE).scale(0.40),
        ).arrange(DOWN, buff=0.22)

        summary = VGroup(s1, s2, s3).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(Write(s1_eq), FadeIn(s1_lbl))
        self.wait(0.6)
        self.play(Write(s2_eq), FadeIn(s2_lbl))
        self.wait(0.6)
        self.play(FadeIn(s3), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch03Kp2BeatPhenomenon",
        "id": "phys-ch03-3.2-kp2-beat-phenomenon",
        "chapterId": "ch03",
        "sectionId": "3.2",
        "title": "拍现象与拍频",
        "description": "双频率接近余弦波叠加演示拍现象：Axes绘制分量波与合振动，DashedVMobject绘制慢变包络，ValueTracker动态改变频率差观察拍频等比例变化，旁注调音应用。",
    },
]
