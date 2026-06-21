"""第 4.3 节 · 例题：双声源多普勒拍频

观察者在 P、Q 两声源之间向右运动：
  - P 静止（左），观察者远离 P  → νRP ≈ 912 Hz
  - Q 向右运动（右），观察者靠近 Q → νRQ = 925 Hz
  - 拍频 Δν = 925 − 912 = 13 Hz

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch04Ex2DopplerBeatFrequency",
        "id": "phys-ch04-4.3-ex2-doppler-beat-frequency",
        "chapterId": "ch04",
        "sectionId": "4.3",
        "title": "例题：双声源多普勒拍频",
        "description": "P、Q 双声源 + 运动观察者：逐步用多普勒公式求各自接收频率，再作差得拍频 13 Hz，最后用叠加波形动画演示「拍」现象。",
    },
]


class Ch04Ex2DopplerBeatFrequency(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("例题：双声源多普勒拍频", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        a1 = Text("站在铁轨旁：迎面驶来的火车笛声变高，", font=CJK).scale(0.46)
        a2 = Text("远去时笛声变低——这就是多普勒效应。", font=CJK).scale(0.46)
        a3 = Text("两个音叉同时响，频率稍有差异时，会听到「嗡——嗡——」的强弱交替，", font=CJK).scale(0.43)
        a4 = Text("这就是拍频，拍频 = 两频率之差。", font=CJK, color=YELLOW).scale(0.43)
        ana = VGroup(a1, a2, a3, a4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.8)
        self.play(FadeIn(a3))
        self.wait(0.6)
        self.play(FadeIn(a4))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 题目场景可视化 ──────────────────────────────────────
        scene_title = Text("题目场景", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(scene_title))

        # 横轴
        axis = Line(LEFT * 5.8, RIGHT * 5.8, color=GRAY, stroke_width=1.5).shift(DOWN * 0.5)
        self.play(Create(axis))

        # P（左，静止，绿点）
        p_dot = Dot(LEFT * 4.5 + DOWN * 0.5, color=GREEN, radius=0.18)
        p_label = Text("P", font=CJK, color=GREEN).scale(0.55).next_to(p_dot, UP, buff=0.12)
        p_static = Text("静止", font=CJK, color=GREEN).scale(0.38).next_to(p_label, UP, buff=0.08)
        p_freq = VGroup(Text("ν =", font=CJK, color=GREEN).scale(0.38),
                        MathTex(r"1000\,\mathrm{Hz}", color=GREEN).scale(0.42)).arrange(RIGHT, buff=0.06)
        p_freq.next_to(p_dot, DOWN, buff=0.18)

        # Q（右，向右运动，蓝点）
        q_dot = Dot(RIGHT * 4.5 + DOWN * 0.5, color=BLUE, radius=0.18)
        q_label = Text("Q", font=CJK, color=BLUE).scale(0.55).next_to(q_dot, UP, buff=0.12)
        q_arrow = Arrow(q_dot.get_right(), q_dot.get_right() + RIGHT * 0.9,
                        buff=0, color=BLUE, stroke_width=3, max_tip_length_to_length_ratio=0.35)
        q_arrow.shift(UP * 0.55)
        q_speed = VGroup(MathTex(r"v_{SQ}", color=BLUE).scale(0.42),
                         Text("= 60 m/s", font=CJK, color=BLUE).scale(0.38)).arrange(RIGHT, buff=0.05)
        q_speed.next_to(q_dot, DOWN, buff=0.18)

        # 观察者 R（中间，向右运动，红点）
        r_dot = Dot(ORIGIN + DOWN * 0.5, color=RED, radius=0.16)
        r_label = Text("R（观察者）", font=CJK, color=RED).scale(0.44).next_to(r_dot, UP, buff=0.12)
        r_arrow = Arrow(r_dot.get_right(), r_dot.get_right() + RIGHT * 0.75,
                        buff=0, color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.35)
        r_arrow.shift(UP * 0.55)
        r_speed = VGroup(MathTex(r"v_R", color=RED).scale(0.42),
                         Text("= 30 m/s", font=CJK, color=RED).scale(0.38)).arrange(RIGHT, buff=0.05)
        r_speed.next_to(r_dot, DOWN, buff=0.18)

        # 连接线
        line_pr = DashedLine(p_dot.get_right(), r_dot.get_left(), color=GREEN, stroke_width=1.5, dash_length=0.12)
        line_rq = DashedLine(r_dot.get_right(), q_dot.get_left(), color=BLUE, stroke_width=1.5, dash_length=0.12)

        # 声速标注
        sound_speed = VGroup(
            Text("声速 u =", font=CJK, color=GRAY).scale(0.38),
            MathTex(r"340\,\mathrm{m/s}", color=GRAY).scale(0.40)
        ).arrange(RIGHT, buff=0.05).to_edge(DOWN, buff=0.35)

        self.play(
            Create(p_dot), FadeIn(p_label), FadeIn(p_static), FadeIn(p_freq),
            run_time=0.8
        )
        self.play(
            Create(q_dot), FadeIn(q_label), Create(q_arrow), FadeIn(q_speed),
            run_time=0.8
        )
        self.play(
            Create(r_dot), FadeIn(r_label), Create(r_arrow), FadeIn(r_speed),
            run_time=0.8
        )
        self.play(Create(line_pr), Create(line_rq))
        self.play(FadeIn(sound_speed))
        self.wait(1.5)

        # ── Step 4: 多普勒公式通式 ──────────────────────────────────────
        formula_title = Text("多普勒公式（通式）", font=CJK, color=YELLOW).scale(0.46)
        formula_title.next_to(title, DOWN, buff=0.42)

        general_formula = MathTex(
            r"\nu_R", r"=", r"\frac{u \pm v_R}{u \mp v_S}", r"\nu"
        ).scale(0.85)
        general_formula.next_to(formula_title, DOWN, buff=0.3)
        general_formula[0].set_color(RED)
        general_formula[2].set_color(YELLOW)
        general_formula[3].set_color(GREEN)

        hint1 = Text("观察者靠近波源：分子取+", font=CJK, color=CYAN).scale(0.40)
        hint2 = Text("波源靠近观察者：分母取−", font=CJK, color=CYAN).scale(0.40)
        hints = VGroup(hint1, hint2).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        hints.next_to(general_formula, DOWN, buff=0.28)

        scene_group = VGroup(
            axis, p_dot, p_label, p_static, p_freq,
            q_dot, q_label, q_arrow, q_speed,
            r_dot, r_label, r_arrow, r_speed,
            line_pr, line_rq, sound_speed, scene_title
        )
        self.play(FadeOut(scene_group))
        self.play(FadeIn(formula_title))
        self.play(Write(general_formula))
        self.play(FadeIn(hints))
        self.wait(2.0)
        self.play(FadeOut(VGroup(formula_title, general_formula, hints)))

        # ── Step 5: 计算 νRP（P → 观察者，观察者远离 P）──────────────────
        step1_title = Text("① P → 观察者：观察者远离 P，波源 P 静止", font=CJK, color=GREEN).scale(0.43)
        step1_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step1_title))

        # 公式逐步推导
        eq1a = MathTex(
            r"\nu_{RP}", r"=", r"\frac{u - v_R}{u}", r"\cdot\nu"
        ).scale(0.82)
        eq1a.next_to(step1_title, DOWN, buff=0.35)
        eq1a[0].set_color(RED)
        eq1a[2].set_color(YELLOW)

        note1 = Text("（观察者远离P，分子取 u − vR；P静止，分母仍为 u）", font=CJK, color=GRAY).scale(0.38)
        note1.next_to(eq1a, DOWN, buff=0.2)

        eq1b = MathTex(
            r"=\frac{340-30}{340}\times1000"
        ).scale(0.82)
        eq1b.set_color(YELLOW)
        eq1b.next_to(note1, DOWN, buff=0.25)

        eq1c = MathTex(
            r"=\frac{310}{340}\times1000"
        ).scale(0.82)
        eq1c.set_color(YELLOW)
        eq1c.next_to(eq1b, DOWN, buff=0.2)

        eq1d = MathTex(
            r"\approx912\;\mathrm{Hz}"
        ).scale(0.95)
        eq1d.set_color(GREEN)
        eq1d.next_to(eq1c, DOWN, buff=0.2)

        box1 = SurroundingRectangle(eq1d, color=GREEN, buff=0.15, corner_radius=0.1)

        self.play(Write(eq1a))
        self.wait(0.8)
        self.play(FadeIn(note1))
        self.wait(0.8)
        self.play(Write(eq1b))
        self.wait(0.7)
        self.play(Write(eq1c))
        self.wait(0.7)
        self.play(Write(eq1d), Create(box1))
        self.wait(1.8)
        self.play(FadeOut(VGroup(step1_title, eq1a, note1, eq1b, eq1c, eq1d, box1)))

        # ── Step 6: 计算 νRQ（Q → 观察者，波源 Q 远离，观察者靠近 Q）──────
        step2_title = Text("② Q → 观察者：观察者靠近 Q，波源 Q 远离观察者", font=CJK, color=BLUE).scale(0.43)
        step2_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step2_title))

        eq2a = MathTex(
            r"\nu_{RQ}", r"=", r"\frac{u + v_R}{u + v_{SQ}}", r"\cdot\nu"
        ).scale(0.82)
        eq2a.next_to(step2_title, DOWN, buff=0.35)
        eq2a[0].set_color(BLUE)
        eq2a[2].set_color(YELLOW)

        note2 = Text("（观察者靠近Q，分子取 u + vR；Q远离，分母取 u + vSQ）", font=CJK, color=GRAY).scale(0.38)
        note2.next_to(eq2a, DOWN, buff=0.2)

        eq2b = MathTex(
            r"=\frac{340+30}{340+60}\times1000"
        ).scale(0.82)
        eq2b.set_color(YELLOW)
        eq2b.next_to(note2, DOWN, buff=0.25)

        eq2c = MathTex(
            r"=\frac{370}{400}\times1000"
        ).scale(0.82)
        eq2c.set_color(YELLOW)
        eq2c.next_to(eq2b, DOWN, buff=0.2)

        eq2d = MathTex(
            r"=925\;\mathrm{Hz}"
        ).scale(0.95)
        eq2d.set_color(BLUE)
        eq2d.next_to(eq2c, DOWN, buff=0.2)

        box2 = SurroundingRectangle(eq2d, color=BLUE, buff=0.15, corner_radius=0.1)

        self.play(Write(eq2a))
        self.wait(0.8)
        self.play(FadeIn(note2))
        self.wait(0.8)
        self.play(Write(eq2b))
        self.wait(0.7)
        self.play(Write(eq2c))
        self.wait(0.7)
        self.play(Write(eq2d), Create(box2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(step2_title, eq2a, note2, eq2b, eq2c, eq2d, box2)))

        # ── Step 7: 拍频计算 ────────────────────────────────────────────
        beat_title = Text("③ 拍频 = 两接收频率之差", font=CJK, color=YELLOW).scale(0.48)
        beat_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(beat_title))

        result_p = VGroup(
            MathTex(r"\nu_{RP}", color=GREEN).scale(0.72),
            Text("≈ 912 Hz（P 声源）", font=CJK, color=GREEN).scale(0.42)
        ).arrange(RIGHT, buff=0.1)

        result_q = VGroup(
            MathTex(r"\nu_{RQ}", color=BLUE).scale(0.72),
            Text("= 925 Hz（Q 声源）", font=CJK, color=BLUE).scale(0.42)
        ).arrange(RIGHT, buff=0.1)

        results = VGroup(result_p, result_q).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        results.next_to(beat_title, DOWN, buff=0.35)

        beat_eq = MathTex(
            r"\Delta\nu_{\text{beat}}", r"=", r"\nu_{RQ}", r"-", r"\nu_{RP}",
            r"=", r"925", r"-", r"912", r"=", r"13\;\mathrm{Hz}"
        ).scale(0.88)
        beat_eq.next_to(results, DOWN, buff=0.35)
        beat_eq[0].set_color(YELLOW)
        beat_eq[2].set_color(BLUE)
        beat_eq[4].set_color(GREEN)
        beat_eq[10].set_color(YELLOW)

        beat_box = SurroundingRectangle(beat_eq, color=YELLOW, buff=0.2, corner_radius=0.12)

        self.play(FadeIn(result_p))
        self.wait(0.5)
        self.play(FadeIn(result_q))
        self.wait(0.8)
        self.play(Write(beat_eq), Create(beat_box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(beat_title, results, beat_eq, beat_box)))

        # ── Step 8: 拍频波形动画 ────────────────────────────────────────
        wave_title = Text("「拍」的物理图像：两列频率相近的波叠加", font=CJK, color=YELLOW).scale(0.46)
        wave_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(wave_title))

        # 三组坐标轴：波1、波2、叠加
        axes_h = 1.6   # 每个坐标轴高度
        axes_w = 10.5  # 宽度

        ax1 = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.4, 1.4, 1],
            x_length=axes_w,
            y_length=axes_h,
            axis_config={"color": GRAY, "include_tip": False},
        ).shift(UP * 1.5)

        ax2 = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.4, 1.4, 1],
            x_length=axes_w,
            y_length=axes_h,
            axis_config={"color": GRAY, "include_tip": False},
        ).shift(DOWN * 0.3)

        ax3 = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-2.2, 2.2, 1],
            x_length=axes_w,
            y_length=axes_h,
            axis_config={"color": GRAY, "include_tip": False},
        ).shift(DOWN * 2.1)

        lbl1 = VGroup(
            MathTex(r"\nu_{RP}", color=GREEN).scale(0.5),
            Text("≈ 912 Hz", font=CJK, color=GREEN).scale(0.36)
        ).arrange(RIGHT, buff=0.06).next_to(ax1, LEFT, buff=0.15)

        lbl2 = VGroup(
            MathTex(r"\nu_{RQ}", color=BLUE).scale(0.5),
            Text("= 925 Hz", font=CJK, color=BLUE).scale(0.36)
        ).arrange(RIGHT, buff=0.06).next_to(ax2, LEFT, buff=0.15)

        lbl3 = VGroup(
            Text("叠加", font=CJK, color=YELLOW).scale(0.42),
            Text("（拍）", font=CJK, color=YELLOW).scale(0.42)
        ).arrange(DOWN, buff=0.05).next_to(ax3, LEFT, buff=0.12)

        self.play(Create(ax1), Create(ax2), Create(ax3))
        self.play(FadeIn(lbl1), FadeIn(lbl2), FadeIn(lbl3))

        # 用 ValueTracker 作为时间轴横移（模拟波传播）
        t_tracker = ValueTracker(0.0)

        # 物理参数（归一化，显示目的）
        # 912 Hz 和 925 Hz 相对归一化为角频率
        # 拍频 13 Hz，演示用稍夸大比例呈现以便可视
        omega1 = 2 * PI * 0.95   # 模拟 RP 频率
        omega2 = 2 * PI * 1.05   # 模拟 RQ 频率（略高）
        A = 1.0
        k1 = omega1 / 340.0 * 30   # 显示用波数（缩放至坐标范围）
        k2 = omega2 / 340.0 * 30

        wave1 = always_redraw(
            lambda: ax1.plot(
                lambda x: A * math.cos(k1 * x - omega1 * t_tracker.get_value()),
                x_range=[0, 4 * PI],
                color=GREEN,
            )
        )
        wave2 = always_redraw(
            lambda: ax2.plot(
                lambda x: A * math.cos(k2 * x - omega2 * t_tracker.get_value()),
                x_range=[0, 4 * PI],
                color=BLUE,
            )
        )
        wave_sum = always_redraw(
            lambda: ax3.plot(
                lambda x: (
                    A * math.cos(k1 * x - omega1 * t_tracker.get_value())
                    + A * math.cos(k2 * x - omega2 * t_tracker.get_value())
                ),
                x_range=[0, 4 * PI],
                color=YELLOW,
            )
        )

        self.play(Create(wave1), Create(wave2), Create(wave_sum))
        self.wait(0.5)

        # 动画：让时间流逝，波形移动，叠加包络缓慢涨落
        self.play(
            t_tracker.animate.set_value(12.0),
            run_time=7,
            rate_func=linear
        )
        self.wait(0.5)

        beat_caption = VGroup(
            Text("两列波频率相差 13 Hz，叠加后振幅每", font=CJK, color=YELLOW).scale(0.40),
            MathTex(r"\frac{1}{13}\approx0.077\;\mathrm{s}", color=YELLOW).scale(0.45),
            Text("涨落一次，耳朵听到「嗡嗡」声", font=CJK, color=YELLOW).scale(0.40),
        ).arrange(RIGHT, buff=0.08)
        beat_caption.to_edge(DOWN, buff=0.22)
        self.play(FadeIn(beat_caption))
        self.wait(2.0)

        self.play(
            FadeOut(VGroup(
                wave_title, ax1, ax2, ax3,
                lbl1, lbl2, lbl3,
                wave1, wave2, wave_sum,
                beat_caption
            ))
        )

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)

        line_rp = VGroup(
            Text("P → R（R 远离 P，P 静止）：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\nu_{RP}=\frac{u-v_R}{u}\nu=\frac{310}{340}\times1000\approx912\,\mathrm{Hz}", color=GREEN).scale(0.58)
        ).arrange(RIGHT, buff=0.1)

        line_rq = VGroup(
            Text("Q → R（R 靠近 Q，Q 远离 R）：", font=CJK, color=BLUE).scale(0.42),
            MathTex(r"\nu_{RQ}=\frac{u+v_R}{u+v_{SQ}}\nu=\frac{370}{400}\times1000=925\,\mathrm{Hz}", color=BLUE).scale(0.58)
        ).arrange(RIGHT, buff=0.1)

        line_beat = VGroup(
            Text("拍频：", font=CJK, color=YELLOW).scale(0.48),
            MathTex(r"\Delta\nu_{\text{beat}}=925-912=13\;\mathrm{Hz}", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.15)

        key_rule = Text("关键：判断观察者/波源的「靠近或远离」决定分子/分母取 +/−", font=CJK, color=CYAN).scale(0.40)

        summary = VGroup(line_rp, line_rq, line_beat, key_rule).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(13.0)

        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(line_rp))
        self.wait(0.6)
        self.play(Write(line_rq))
        self.wait(0.6)
        self.play(Write(line_beat))
        self.wait(0.6)
        self.play(FadeIn(key_rule), Create(box_s))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box_s, title)))
        self.wait(0.4)
