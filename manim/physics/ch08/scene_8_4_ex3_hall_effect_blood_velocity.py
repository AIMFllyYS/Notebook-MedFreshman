"""第 8.4 节 · 例题3：霍尔效应测量血流速度

用血管截面剖视动画展示霍尔效应原理：
磁场穿过血管 → 洛伦兹力偏转正离子 → 两侧积累电荷 → 形成霍尔电压。
平衡条件 qvB = qUH/d，解出血流速度 v = UH/(Bd)，
ValueTracker 扫动 UH 演示速度的线性响应，最后结合临床意义收尾。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Ex3HallEffectBloodVelocity",
        "id": "phys-ch08-8.4-ex3-hall-effect-blood-velocity",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "霍尔效应测量血流速度",
        "description": "以血管截面动画演示霍尔效应：磁场中运动的导电血液产生横向电压，由此推算血流速度 v=UH/(Bd)=0.63 m/s。",
    },
]


class Ch08Ex3HallEffectBloodVelocity(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("霍尔效应测量血流速度", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.4 · 例题3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text("医生想知道你的血流速度，但血管不能剪开……", font=CJK).scale(0.48)
        ana2 = Text("物理学家说：把磁场放在血管外，电压计就能告诉你速度！", font=CJK).scale(0.48)
        ana3 = Text("这就是霍尔效应的神奇应用。", font=CJK, color=CYAN).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        ana_group.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.9)
        self.play(FadeIn(ana2))
        self.wait(0.9)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana_group))

        # ── Step 3: 血管截面图 — 建立场景 ──────────────────────────────
        # 血管：椭圆截面（上下壁为直线，左右壁为弧）
        vessel = Ellipse(width=3.2, height=2.0, color=RED_B, stroke_width=3)
        vessel.set_fill(color="#3d1010", opacity=0.5)
        vessel.shift(LEFT * 1.5 + DOWN * 0.3)

        label_vessel = Text("血管截面", font=CJK, color=RED_B).scale(0.42)
        label_vessel.next_to(vessel, DOWN, buff=0.25)

        # 直径标注
        d_line = DashedLine(
            vessel.get_left() + RIGHT * 0.05,
            vessel.get_right() + LEFT * 0.05,
            color=WHITE, stroke_width=1.5
        )
        d_label_left = VGroup(
            Text("d", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"=", color=WHITE).scale(0.5),
            Text("2 mm", font=CJK, color=WHITE).scale(0.38),
        ).arrange(RIGHT, buff=0.06)
        d_label_left.next_to(d_line, UP, buff=0.12)

        # 磁场：N→S 方向（从上到下，即 -y 方向），用向下箭头表示 B
        b_arrows = VGroup()
        for xi in [-2.8, -1.8, -0.8, 0.2]:
            arr = Arrow(
                start=np.array([xi, 2.0, 0]),
                end=np.array([xi, -1.8, 0]),
                buff=0, color=BLUE_C, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.15
            )
            b_arrows.add(arr)

        n_label = Text("N", font=CJK, color=BLUE).scale(0.55).move_to(np.array([-1.5, 2.3, 0]))
        s_label = Text("S", font=CJK, color=BLUE).scale(0.55).move_to(np.array([-1.5, -2.1, 0]))
        b_label = MathTex(r"\vec{B}", color=BLUE_C).scale(0.7).move_to(np.array([0.5, 0.1, 0]))

        # 血流方向（向外，即 +z，用圆圈带点表示）
        flow_dot = Dot(point=vessel.get_center(), radius=0.08, color=YELLOW)
        flow_circle = Circle(radius=0.22, color=YELLOW, stroke_width=2.5).move_to(vessel.get_center())
        v_label = MathTex(r"\vec{v}", color=YELLOW).scale(0.65)
        v_label.next_to(flow_circle, RIGHT, buff=0.18)
        flow_note = Text("血流方向（向外）", font=CJK, color=YELLOW).scale(0.38)
        flow_note.next_to(flow_circle, DOWN, buff=0.25)

        caption_step3 = Text("磁场垂直穿过血管，血液向外流动", font=CJK, color=WHITE).scale(0.44)
        caption_step3.to_edge(DOWN, buff=0.55)

        self.play(Create(vessel), FadeIn(label_vessel))
        self.wait(0.5)
        self.play(FadeIn(n_label), FadeIn(s_label), Create(b_arrows), FadeIn(b_label))
        self.wait(0.5)
        self.play(Create(flow_circle), Create(flow_dot), FadeIn(v_label), FadeIn(flow_note))
        self.play(Create(d_line), FadeIn(d_label_left))
        self.play(FadeIn(caption_step3))
        self.wait(1.5)

        # ── Step 4: 洛伦兹力偏转正离子 ──────────────────────────────────
        self.play(FadeOut(caption_step3))
        caption_step4 = Text("正离子受洛伦兹力 F=qvxB，向上偏转", font=CJK, color=ORANGE).scale(0.44)
        caption_step4.to_edge(DOWN, buff=0.55)

        # 正离子：从中心向左右两端移动
        ion_start = vessel.get_center().copy()
        ion_top = vessel.get_center() + UP * 0.72
        ion_bot = vessel.get_center() + DOWN * 0.72

        ion_plus = Dot(point=ion_start, radius=0.13, color=ORANGE)
        ion_plus_label = MathTex(r"+", color=WHITE).scale(0.6)
        ion_plus_label.add_updater(lambda m: m.move_to(ion_plus.get_center()))

        # 洛伦兹力箭头（向上）
        lorenz_arrow = Arrow(
            start=vessel.get_center() + DOWN * 0.05,
            end=vessel.get_center() + UP * 0.7,
            buff=0, color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.25
        )
        f_label = VGroup(
            MathTex(r"\vec{F}", color=ORANGE).scale(0.6),
            MathTex(r"=q\vec{v}\times\vec{B}", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.06)
        f_label.next_to(lorenz_arrow, RIGHT, buff=0.12)

        self.play(FadeIn(ion_plus), FadeIn(ion_plus_label))
        self.play(Create(lorenz_arrow), FadeIn(f_label))
        self.play(FadeIn(caption_step4))
        self.play(ion_plus.animate.move_to(ion_top), run_time=1.2)
        self.wait(0.6)

        # 电荷积累：上壁正电荷，下壁负电荷
        plus_charges = VGroup(*[
            MathTex(r"+", color=ORANGE).scale(0.55).move_to(
                vessel.get_center() + UP * 0.85 + RIGHT * (i * 0.4 - 0.4)
            )
            for i in range(3)
        ])
        minus_charges = VGroup(*[
            MathTex(r"-", color=CYAN).scale(0.6).move_to(
                vessel.get_center() + DOWN * 0.85 + RIGHT * (i * 0.4 - 0.4)
            )
            for i in range(3)
        ])
        self.play(FadeIn(plus_charges), FadeIn(minus_charges))
        self.wait(1.2)
        self.play(FadeOut(caption_step4))

        # ── Step 5: 霍尔电场与电压 ──────────────────────────────────────
        # 霍尔电场：从正到负（向下）
        hall_e_arrow = Arrow(
            start=vessel.get_center() + UP * 0.82,
            end=vessel.get_center() + DOWN * 0.82,
            buff=0, color=GREEN, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.2
        )
        e_hall_label = MathTex(r"E_H", color=GREEN).scale(0.65)
        e_hall_label.next_to(hall_e_arrow, LEFT, buff=0.15)

        uh_brace = Brace(
            Line(vessel.get_center() + UP * 0.82, vessel.get_center() + DOWN * 0.82),
            direction=RIGHT
        )
        uh_label = MathTex(r"U_H", color=GREEN).scale(0.65)
        uh_label.next_to(uh_brace, RIGHT, buff=0.1)

        caption_step5 = Text("电荷积累产生霍尔电场 EH 和霍尔电压 UH", font=CJK, color=GREEN).scale(0.44)
        caption_step5.to_edge(DOWN, buff=0.55)

        self.play(Create(hall_e_arrow), FadeIn(e_hall_label))
        self.play(Create(uh_brace), FadeIn(uh_label))
        self.play(FadeIn(caption_step5))
        self.wait(1.5)
        self.play(FadeOut(caption_step5))

        # ── Step 6: 平衡条件推导（右侧公式区）────────────────────────────
        caption_step6 = Text("平衡：洛伦兹力 = 霍尔电场力", font=CJK, color=WHITE).scale(0.44)
        caption_step6.to_edge(DOWN, buff=0.55)

        # 公式区在右半边
        eq_area_x = 3.0

        eq1 = MathTex(r"qvB = qE_H", color=YELLOW).scale(0.78)
        eq1.move_to(np.array([eq_area_x, 1.6, 0]))

        eq2_line1 = MathTex(r"E_H = \frac{U_H}{d}", color=GREEN).scale(0.72)
        eq2_line1.move_to(np.array([eq_area_x, 0.75, 0]))

        eq3 = MathTex(r"qvB = q\frac{U_H}{d}", color=YELLOW).scale(0.72)
        eq3.move_to(np.array([eq_area_x, -0.1, 0]))

        arrow_derive = Arrow(
            start=np.array([eq_area_x - 0.3, 0.38, 0]),
            end=np.array([eq_area_x - 0.3, 0.16, 0]),
            buff=0, color=WHITE, stroke_width=2,
            max_tip_length_to_length_ratio=0.4
        )

        self.play(FadeIn(caption_step6))
        self.play(Write(eq1))
        self.wait(0.8)
        self.play(Write(eq2_line1))
        self.wait(0.5)
        self.play(Write(eq3))
        self.wait(1.2)
        self.play(FadeOut(caption_step6))

        # ── Step 7: 解出速度公式 ─────────────────────────────────────────
        eq_final = MathTex(r"v = \frac{U_H}{Bd}", color=YELLOW).scale(0.92)
        eq_final.move_to(np.array([eq_area_x, -1.0, 0]))
        box_final = SurroundingRectangle(eq_final, color=YELLOW, buff=0.2, corner_radius=0.1)

        caption_step7 = Text("消去 q，得到血流速度公式", font=CJK, color=YELLOW).scale(0.44)
        caption_step7.to_edge(DOWN, buff=0.55)

        self.play(FadeIn(caption_step7))
        self.play(Write(eq_final), Create(box_final))
        self.wait(1.5)
        self.play(FadeOut(caption_step7))

        # 清除截面场景，保留 title + 最终公式框
        scene_objects = VGroup(
            vessel, label_vessel, b_arrows, n_label, s_label, b_label,
            flow_circle, flow_dot, v_label, flow_note,
            d_line, d_label_left,
            ion_plus, ion_plus_label,
            lorenz_arrow, f_label,
            plus_charges, minus_charges,
            hall_e_arrow, e_hall_label,
            uh_brace, uh_label,
            eq1, eq2_line1, eq3,
        )
        self.play(FadeOut(scene_objects))
        self.wait(0.4)

        # ── Step 8: 数值代入计算 ─────────────────────────────────────────
        eq_final.generate_target()
        eq_final.target.move_to(UP * 1.8)
        box_final.generate_target()
        box_final.target.move_to(eq_final.target.get_center())

        self.play(MoveToTarget(eq_final), MoveToTarget(box_final))
        self.wait(0.3)

        given_title = Text("已知条件", font=CJK, color=WHITE).scale(0.48)
        given_title.next_to(eq_final, DOWN, buff=0.5)

        g1 = VGroup(
            MathTex(r"U_H = 0.10\ \mathrm{mV} = 1.0\times10^{-4}\ \mathrm{V}", color=CYAN).scale(0.65)
        )
        g2 = VGroup(
            MathTex(r"B = 0.08\ \mathrm{T}", color=CYAN).scale(0.65)
        )
        g3 = VGroup(
            MathTex(r"d = 2.0\ \mathrm{mm} = 2.0\times10^{-3}\ \mathrm{m}", color=CYAN).scale(0.65)
        )
        given_group = VGroup(g1, g2, g3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        given_group.next_to(given_title, DOWN, buff=0.28)
        given_group.scale_to_fit_width(9.5)

        self.play(FadeIn(given_title))
        self.play(FadeIn(g1))
        self.wait(0.5)
        self.play(FadeIn(g2))
        self.wait(0.5)
        self.play(FadeIn(g3))
        self.wait(1.0)

        # 计算过程
        calc_eq = MathTex(
            r"v = \frac{1.0\times10^{-4}}{0.08 \times 2.0\times10^{-3}}",
            color=WHITE
        ).scale(0.72)
        result_eq = MathTex(r"v \approx 0.63\ \mathrm{m/s}", color=GREEN).scale(0.85)
        box_result = SurroundingRectangle(result_eq, color=GREEN, buff=0.18, corner_radius=0.1)

        calc_eq.next_to(given_group, DOWN, buff=0.4)
        result_eq.next_to(calc_eq, DOWN, buff=0.35)

        self.play(Write(calc_eq))
        self.wait(0.8)
        self.play(Write(result_eq), Create(box_result))
        self.wait(1.5)

        self.play(FadeOut(VGroup(given_title, given_group, calc_eq)))
        self.wait(0.3)

        # ── Step 9: ValueTracker 扫动 UH → v 线性变化 ───────────────────
        uh_tracker = ValueTracker(0.10)  # 单位 mV

        def v_from_uh(uh_mv):
            uh_v = uh_mv * 1e-3
            return uh_v / (0.08 * 2.0e-3)

        readout = always_redraw(lambda: VGroup(
            MathTex(
                rf"U_H = {uh_tracker.get_value():.2f}\ \mathrm{{mV}}",
                color=CYAN
            ).scale(0.65),
            MathTex(
                rf"v = {v_from_uh(uh_tracker.get_value()):.2f}\ \mathrm{{m/s}}",
                color=GREEN
            ).scale(0.72),
        ).arrange(DOWN, buff=0.25).next_to(result_eq, DOWN, buff=0.5))

        sweep_cap = Text("改变 UH，血流速度线性响应", font=CJK, color=ORANGE).scale(0.44)
        sweep_cap.to_edge(DOWN, buff=0.55)

        self.add(readout)
        self.play(FadeIn(sweep_cap))
        self.wait(0.3)
        self.play(uh_tracker.animate.set_value(0.20), run_time=2.0)
        self.wait(0.4)
        self.play(uh_tracker.animate.set_value(0.05), run_time=2.0)
        self.wait(0.4)
        self.play(uh_tracker.animate.set_value(0.10), run_time=1.2)
        self.wait(0.5)
        self.play(FadeOut(sweep_cap), FadeOut(readout))

        self.play(FadeOut(VGroup(eq_final, box_final, result_eq, box_result)))
        self.wait(0.3)

        # ── Step 10: 临床意义解说 ────────────────────────────────────────
        clin_title = Text("临床意义", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        c1 = Text("正常成人主动脉血流速度约 0.5 ~ 1.0 m/s", font=CJK).scale(0.47)
        c2_group = VGroup(
            Text("本例测得", font=CJK, color=WHITE).scale(0.47),
            MathTex(r"v \approx 0.63\ \mathrm{m/s}", color=GREEN).scale(0.6),
            Text("——处于正常范围", font=CJK, color=GREEN).scale(0.47),
        ).arrange(RIGHT, buff=0.12)
        c3 = Text("无需侵入血管，仅靠外部磁场和两个电极即可测量，", font=CJK).scale(0.43)
        c4 = Text("这是霍尔效应在生物医学中的重要应用。", font=CJK, color=CYAN).scale(0.43)
        clin_body = VGroup(c1, c2_group, c3, c4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        clin_body.next_to(clin_title, DOWN, buff=0.4)
        clin_body.scale_to_fit_width(12.0)

        self.play(FadeIn(clin_title))
        self.play(FadeIn(c1))
        self.wait(0.8)
        self.play(FadeIn(c2_group))
        self.wait(0.8)
        self.play(FadeIn(c3))
        self.wait(0.5)
        self.play(FadeIn(c4))
        self.wait(1.5)
        self.play(FadeOut(VGroup(clin_title, clin_body)))
        self.wait(0.3)

        # ── Step 11: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s_eq1 = MathTex(r"qvB = \frac{qU_H}{d}", color=YELLOW).scale(0.82)
        s_label1 = Text("平衡条件（洛伦兹力 = 霍尔电场力）", font=CJK, color=WHITE).scale(0.4)
        row1 = VGroup(s_eq1, s_label1).arrange(RIGHT, buff=0.35)

        s_eq2 = MathTex(r"v = \frac{U_H}{Bd}", color=YELLOW).scale(0.88)
        s_label2 = Text("血流速度公式", font=CJK, color=WHITE).scale(0.4)
        row2 = VGroup(s_eq2, s_label2).arrange(RIGHT, buff=0.35)

        s_eq3 = MathTex(r"v = 0.63\ \mathrm{m/s}", color=GREEN).scale(0.82)
        s_label3 = Text("代入数值（正常范围）", font=CJK, color=GREEN).scale(0.4)
        row3 = VGroup(s_eq3, s_label3).arrange(RIGHT, buff=0.35)

        summary = VGroup(row1, row2, row3).arrange(DOWN, buff=0.45, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box_summary = SurroundingRectangle(summary, color=BLUE, buff=0.38, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_eq1), FadeIn(s_label1))
        self.wait(0.6)
        self.play(Write(s_eq2), FadeIn(s_label2))
        self.wait(0.6)
        self.play(Write(s_eq3), FadeIn(s_label3))
        self.play(Create(box_summary))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box_summary, title)))
        self.wait(0.4)
