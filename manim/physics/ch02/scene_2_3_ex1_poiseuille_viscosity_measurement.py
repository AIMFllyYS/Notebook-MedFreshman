"""第 2.3 节 · 泊肃叶法测硫酸黏度（例题精讲）

实验装置动画：大容器（硫酸液柱 h=5 cm）→ 水平细玻璃管（d=0.1 cm, l=10 cm）→
泊肃叶公式推导 → 代入数值得 η=0.04 Pa·s。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch02Ex1PoiseuilleViscosityMeasurement",
        "id": "phys-ch02-2.3-ex1-poiseuille-viscosity-measurement",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "泊肃叶法测硫酸黏度",
        "description": "通过泊肃叶定律，利用液柱压差驱动水平细管流动，测量硫酸的动力黏度 η=0.04 Pa·s。",
    },
]


class Ch02Ex1PoiseuilleViscosityMeasurement(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────────
        title = Text("泊肃叶法测硫酸黏度", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.3 例题精讲", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────────
        ana1 = Text("蜂蜜比水流得慢——这是黏性在作怪。", font=CJK).scale(0.48)
        ana2 = Text("黏度 η 越大，液体在细管中流得越慢。", font=CJK).scale(0.48)
        ana3 = Text("泊肃叶发现：细管流量与管径四次方成正比！", font=CJK, color=YELLOW).scale(0.48)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(analogy))

        # ── Step 3: 实验装置图 ───────────────────────────────────────────────
        # 大容器：矩形，左侧，液面用蓝色填充
        container_outline = Rectangle(width=1.6, height=2.4, color=WHITE, stroke_width=2)
        container_outline.move_to(LEFT * 3.8 + DOWN * 0.5)

        # 硫酸液体（蓝色填充区域）
        liquid = Rectangle(width=1.5, height=1.6, color=BLUE, fill_opacity=0.35, stroke_width=0)
        liquid.move_to(container_outline.get_center() + DOWN * 0.4)

        # 液面线
        surface_line = Line(
            container_outline.get_left() + RIGHT * 0.05 + UP * 0.4,
            container_outline.get_right() - RIGHT * 0.05 + UP * 0.4,
            color=CYAN, stroke_width=2.5,
        )

        # 水平细管：从容器底部右侧引出
        pipe_left = container_outline.get_right() + DOWN * 0.9
        pipe_right = pipe_left + RIGHT * 3.4
        pipe_top = Line(pipe_left + UP * 0.10, pipe_right + UP * 0.10, color=WHITE, stroke_width=2)
        pipe_bot = Line(pipe_left + DOWN * 0.10, pipe_right + DOWN * 0.10, color=WHITE, stroke_width=2)

        # 细管中的流体（橙色填充）
        pipe_fluid = Rectangle(width=3.4, height=0.20, color=ORANGE, fill_opacity=0.5, stroke_width=0)
        pipe_fluid.move_to((pipe_left + pipe_right) / 2)

        # 液滴（末端）
        drop = Dot(point=pipe_right + RIGHT * 0.22 + DOWN * 0.12, radius=0.11, color=BLUE)
        drop2 = Dot(point=pipe_right + RIGHT * 0.38 + DOWN * 0.36, radius=0.08, color=BLUE)

        apparatus = VGroup(
            container_outline, liquid, surface_line,
            pipe_top, pipe_bot, pipe_fluid,
            drop, drop2,
        )
        apparatus.scale_to_fit_width(8.5)
        apparatus.move_to(DOWN * 0.5)

        self.play(Create(container_outline), FadeIn(liquid), Create(surface_line))
        self.play(Create(pipe_top), Create(pipe_bot), FadeIn(pipe_fluid))
        self.play(FadeIn(drop), FadeIn(drop2))
        self.wait(1.0)

        # ── Step 4: Brace 标注参数 ──────────────────────────────────────────
        # h：液柱高度（容器内，从底部到液面）
        surf_y = surface_line.get_center()[1]
        pipe_y = pipe_fluid.get_center()[1]
        brace_h = BraceBetweenPoints(
            np.array([container_outline.get_left()[0] - 0.15, pipe_y, 0]),
            np.array([container_outline.get_left()[0] - 0.15, surf_y, 0]),
            direction=LEFT,
            color=GREEN,
        )
        label_h = VGroup(
            MathTex(r"h", color=GREEN).scale(0.7),
            Text("=5 cm", font=CJK, color=GREEN).scale(0.36),
        ).arrange(RIGHT, buff=0.05)
        brace_h.put_at_tip(label_h, buff=0.08)

        # l：细管长度
        brace_l = Brace(pipe_fluid, direction=DOWN, color=YELLOW)
        label_l = VGroup(
            MathTex(r"l", color=YELLOW).scale(0.7),
            Text("=10 cm", font=CJK, color=YELLOW).scale(0.36),
        ).arrange(RIGHT, buff=0.05)
        brace_l.put_at_tip(label_l, buff=0.08)

        # d：内径（管截面两侧）
        pipe_top_mid = pipe_top.get_center()
        pipe_bot_mid = pipe_bot.get_center()
        brace_d = BraceBetweenPoints(
            pipe_top_mid + RIGHT * 0.3,
            pipe_bot_mid + RIGHT * 0.3,
            direction=RIGHT,
            color=CYAN,
        )
        label_d = VGroup(
            MathTex(r"d", color=CYAN).scale(0.7),
            Text("=0.1 cm", font=CJK, color=CYAN).scale(0.36),
        ).arrange(RIGHT, buff=0.05)
        brace_d.put_at_tip(label_d, buff=0.08)

        self.play(
            GrowFromCenter(brace_h), FadeIn(label_h),
        )
        self.wait(0.6)
        self.play(
            GrowFromCenter(brace_l), FadeIn(label_l),
        )
        self.wait(0.6)
        self.play(
            GrowFromCenter(brace_d), FadeIn(label_d),
        )
        self.wait(1.2)

        # ── Step 5: 压强差说明 ───────────────────────────────────────────────
        # 标注 p1（管左端）和 p2（管右端）
        p1_dot = Dot(point=pipe_fluid.get_left(), color=RED, radius=0.07)
        p2_dot = Dot(point=pipe_fluid.get_right(), color=RED, radius=0.07)

        p1_label = VGroup(
            MathTex(r"p_1", color=RED).scale(0.6),
            Text("=", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"p_0+\rho g h", color=RED).scale(0.6),
        ).arrange(RIGHT, buff=0.05)
        p1_label.next_to(p1_dot, UP, buff=0.22)

        p2_label = VGroup(
            MathTex(r"p_2", color=ORANGE).scale(0.6),
            Text("=", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"p_0", color=ORANGE).scale(0.6),
        ).arrange(RIGHT, buff=0.05)
        p2_label.next_to(p2_dot, UP, buff=0.22)

        dp_label = VGroup(
            MathTex(r"\Delta p", color=YELLOW).scale(0.65),
            Text("=", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"\rho g h", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.06)
        dp_label.next_to(pipe_fluid, UP, buff=0.55)
        dp_label.set_x(pipe_fluid.get_center()[0])

        self.play(FadeIn(p1_dot), FadeIn(p1_label))
        self.play(FadeIn(p2_dot), FadeIn(p2_label))
        self.wait(0.8)
        self.play(FadeIn(dp_label))
        self.wait(1.4)

        # 清场装置
        self.play(FadeOut(VGroup(
            apparatus, brace_h, label_h,
            brace_l, label_l, brace_d, label_d,
            p1_dot, p1_label, p2_dot, p2_label, dp_label,
        )))

        # ── Step 6: 泊肃叶公式引出 ──────────────────────────────────────────
        sec_t = Text("泊肃叶定律", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sec_t))

        poise_q = MathTex(
            r"Q", r"=", r"\frac{\pi R^4 \Delta p}{8 \eta L}",
            color=WHITE
        ).scale(0.95).next_to(sec_t, DOWN, buff=0.5)
        poise_q[0].set_color(CYAN)   # Q
        poise_q[2].set_color(WHITE)
        self.play(Write(poise_q))
        self.wait(1.0)

        # 高亮待求量 η
        eta_highlight = SurroundingRectangle(
            MathTex(r"\eta").scale(0.95).move_to(poise_q[2]),
            color=RED, buff=0.08,
        )
        # 直接高亮公式中 η 的位置（在分母中）
        note_eta = Text("η 是待求量（硫酸黏度）", font=CJK, color=RED).scale(0.42)
        note_eta.next_to(poise_q, DOWN, buff=0.35)
        self.play(FadeIn(note_eta))
        self.wait(1.2)
        self.play(FadeOut(note_eta))

        # ── Step 7: Q 的替换 ────────────────────────────────────────────────
        q_sub_label = Text("测量：一段时间 Δt 内收集到质量 m 的液体", font=CJK, color=ORANGE).scale(0.42)
        q_sub_label.next_to(poise_q, DOWN, buff=0.4)
        q_replace = MathTex(r"Q = \frac{m}{\rho \,\Delta t}", color=ORANGE).scale(0.85)
        q_replace.next_to(q_sub_label, DOWN, buff=0.28)
        self.play(FadeIn(q_sub_label))
        self.play(Write(q_replace))
        self.wait(1.2)

        # ── Step 8: 求解 η ──────────────────────────────────────────────────
        step_label = Text("将 Q 代入并解出 η：", font=CJK, color=WHITE).scale(0.44)
        step_label.next_to(q_replace, DOWN, buff=0.4)
        self.play(FadeIn(step_label))
        self.wait(0.6)

        derive1 = MathTex(
            r"\frac{m}{\rho\,\Delta t}",
            r"=",
            r"\frac{\pi R^4 \Delta p}{8\,\eta\, L}",
            color=WHITE
        ).scale(0.82)
        derive1.next_to(step_label, DOWN, buff=0.32)
        self.play(Write(derive1))
        self.wait(1.0)

        derive2 = MathTex(
            r"\eta",
            r"=",
            r"\frac{\rho\,\Delta t}{m}",
            r"\cdot",
            r"\frac{\pi R^4}{8\,L}",
            r"\cdot",
            r"\Delta p",
            color=WHITE
        ).scale(0.82)
        derive2[0].set_color(RED)     # η
        derive2[2].set_color(ORANGE)  # ρΔt/m
        derive2[4].set_color(CYAN)    # πR⁴/8L
        derive2[6].set_color(YELLOW)  # Δp
        derive2.next_to(derive1, DOWN, buff=0.35)
        self.play(TransformMatchingTex(derive1.copy(), derive2))
        self.wait(1.0)

        # 代入 Δp = ρgh
        derive3 = MathTex(
            r"\eta",
            r"=",
            r"\frac{\rho\,\Delta t}{m}",
            r"\cdot",
            r"\frac{\pi r^4}{8\,l}",
            r"\cdot",
            r"\rho g h",
            color=WHITE
        ).scale(0.82)
        derive3[0].set_color(RED)
        derive3[2].set_color(ORANGE)
        derive3[4].set_color(CYAN)
        derive3[6].set_color(YELLOW)
        derive3.next_to(derive2, DOWN, buff=0.32)

        dp_sub = Text("代入 Δp = ρgh（液柱压差）", font=CJK, color=YELLOW).scale(0.40)
        dp_sub.next_to(derive2, DOWN, buff=0.12)
        self.play(FadeIn(dp_sub))
        self.wait(0.5)
        self.play(FadeOut(dp_sub))
        self.play(Write(derive3))
        self.wait(1.2)

        # 清场推导中间步骤
        self.play(FadeOut(VGroup(sec_t, poise_q, q_sub_label, q_replace, step_label, derive1, derive2)))
        derive3.next_to(title, DOWN, buff=0.6)
        self.play(derive3.animate.move_to(ORIGIN + UP * 1.0))
        self.wait(0.8)

        # ── Step 9: 代入数值 ────────────────────────────────────────────────
        known_title = Text("已知量代入（SI 单位）", font=CJK, color=BLUE).scale(0.48)
        known_title.next_to(derive3, DOWN, buff=0.45)
        self.play(FadeIn(known_title))

        # 参数列表
        p_rho = VGroup(
            MathTex(r"\rho = 1.83\times10^3\ \mathrm{kg/m^3}").scale(0.6),
        )
        p_r = VGroup(
            MathTex(r"r = 0.05\ \mathrm{cm} = 5\times10^{-4}\ \mathrm{m}").scale(0.6),
        )
        p_l = VGroup(
            MathTex(r"l = 0.10\ \mathrm{m}").scale(0.6),
        )
        p_h = VGroup(
            MathTex(r"h = 0.05\ \mathrm{m}").scale(0.6),
        )
        p_dt = VGroup(
            MathTex(r"\Delta t / m\ \text{(measured)}").scale(0.6),
        )

        known_rows = VGroup(p_rho, p_r, p_l, p_h).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        known_rows.next_to(known_title, DOWN, buff=0.3)
        self.play(FadeIn(known_rows))
        self.wait(1.2)

        # 数值结果
        result_label = Text("计算结果：", font=CJK, color=GREEN).scale(0.50)
        result_label.next_to(known_rows, DOWN, buff=0.42)
        result_eq = MathTex(
            r"\eta = 0.04\ \mathrm{Pa\cdot s}",
            color=GREEN
        ).scale(1.05)
        result_eq.next_to(result_label, RIGHT, buff=0.2)
        result_eq.align_to(result_label, DOWN)

        result_box = SurroundingRectangle(
            VGroup(result_label, result_eq), color=GREEN, buff=0.2, corner_radius=0.12
        )
        self.play(FadeIn(result_label), Write(result_eq))
        self.play(Create(result_box))
        self.wait(1.6)

        self.play(FadeOut(VGroup(known_title, known_rows, result_label, result_eq, result_box, derive3)))

        # ── Step 10: 泊肃叶扫动直觉：r⁴ 的威力 ─────────────────────────────
        # 用 ValueTracker 演示管径变化对流量的影响
        r_tracker = ValueTracker(1.0)

        sec2_t = Text("直觉：管径微小变化，流量变化极大", font=CJK, color=BLUE).scale(0.50)
        sec2_t.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sec2_t))

        axes = Axes(
            x_range=[0.5, 2.5, 0.5],
            y_range=[0, 40, 10],
            x_length=7,
            y_length=3.5,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=False,
        ).next_to(sec2_t, DOWN, buff=0.4)

        x_label = VGroup(
            MathTex(r"r\ /\ r_0", color=WHITE).scale(0.55),
        ).next_to(axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_label = VGroup(
            MathTex(r"Q\ /\ Q_0", color=WHITE).scale(0.55),
        ).next_to(axes.y_axis.get_end(), UP, buff=0.1)

        curve_r4 = axes.plot(
            lambda x: x ** 4,
            x_range=[0.5, 2.2],
            color=YELLOW, stroke_width=3,
        )

        dot_r = always_redraw(lambda: Dot(
            point=axes.c2p(r_tracker.get_value(), r_tracker.get_value() ** 4),
            color=RED, radius=0.10,
        ))
        readout_r = always_redraw(lambda: VGroup(
            MathTex(rf"r = {r_tracker.get_value():.2f}\,r_0", color=CYAN).scale(0.55),
            MathTex(rf"Q = {r_tracker.get_value()**4:.2f}\,Q_0", color=ORANGE).scale(0.55),
        ).arrange(DOWN, buff=0.12).to_corner(UR, buff=0.5))

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(curve_r4))
        self.add(dot_r, readout_r)
        self.wait(0.6)

        r4_note = Text("r 翻倍 → 流量增加 16 倍（r⁴ 关系！）", font=CJK, color=ORANGE).scale(0.42)
        r4_note.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(r4_note))
        self.play(r_tracker.animate.set_value(2.0), run_time=2.5)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(0.8), run_time=2.0)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(1.0), run_time=1.0)
        self.wait(0.6)
        self.play(FadeOut(VGroup(axes, curve_r4, dot_r, readout_r, x_label, y_label, r4_note, sec2_t)))

        # ── Step 11: 小结卡 ─────────────────────────────────────────────────
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"Q = \frac{\pi R^4 \Delta p}{8\,\eta\,L}",
            color=YELLOW,
        ).scale(0.82)
        s2 = MathTex(
            r"\eta = \frac{\rho\,\Delta t}{m}\cdot\frac{\pi r^4}{8\,l}\cdot\rho g h",
            color=CYAN,
        ).scale(0.82)
        s3 = MathTex(r"\eta_{\text{result}} = 0.04\ \mathrm{Pa\cdot s}", color=GREEN).scale(0.82)
        note_s = Text("流量与管径四次方成正比——细管内径精度至关重要", font=CJK, color=WHITE).scale(0.40)

        summary = VGroup(s1, s2, s3, note_s).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(note_s), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
