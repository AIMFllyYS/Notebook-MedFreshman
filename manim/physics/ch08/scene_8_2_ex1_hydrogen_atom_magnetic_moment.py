"""第 8.2 节 · 例题：氢原子电子轨道磁矩（例题精讲）。

分三大步可视化：
① 俯视视角：圆形轨道 + 逆时针运动电子 + 顺时针等效电流标注 + 电流公式
② 安培定律：各电流元在圆心产生 dB 方向 → 合场 B 公式与数值
③ 侧视图：磁矩矢量 pm 方向、公式与玻尔磁子对照

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch08Ex1HydrogenAtomMagneticMoment(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("氢原子电子轨道磁矩", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.2 · 例题精讲", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text("电子绕氢原子核高速转动——就像一个", font=CJK).scale(0.48)
        ana2 = Text("微型「电流环」，会在轨道面上下产生磁场，", font=CJK).scale(0.48)
        ana3 = Text("这就是原子固有磁矩的来源。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line), run_time=0.7)
            self.wait(0.5)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ── Step 3: 已知条件展示 ─────────────────────────────────────────
        cond_title = Text("已知条件", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        c1 = VGroup(
            Text("轨道半径  ", font=CJK).scale(0.45),
            MathTex(r"a = 5.29\times10^{-11}\ \mathrm{m}").scale(0.75),
        ).arrange(RIGHT, buff=0.1)
        c2 = VGroup(
            Text("轨道速率  ", font=CJK).scale(0.45),
            MathTex(r"v = 2.18\times10^{6}\ \mathrm{m/s}").scale(0.75),
        ).arrange(RIGHT, buff=0.1)
        c3 = VGroup(
            Text("电子电荷  ", font=CJK).scale(0.45),
            MathTex(r"e = 1.6\times10^{-19}\ \mathrm{C}").scale(0.75),
        ).arrange(RIGHT, buff=0.1)
        conds = VGroup(c1, c2, c3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.4)
        self.play(FadeIn(cond_title))
        for item in [c1, c2, c3]:
            self.play(FadeIn(item), run_time=0.6)
            self.wait(0.4)
        self.wait(1.2)
        self.play(FadeOut(VGroup(cond_title, conds)))

        # ── Step 4: 俯视圆形轨道 + 电子运动 + 等效电流 ─────────────────
        orbit_title = Text("俯视图：电子轨道与等效电流", font=CJK, color=BLUE).scale(0.5)
        orbit_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(orbit_title))

        # 圆形轨道
        R = 2.0  # 屏幕半径（示意）
        orbit = Circle(radius=R, color=WHITE, stroke_width=2)
        orbit.shift(DOWN * 0.3)
        center = orbit.get_center()

        nucleus = Dot(point=center, radius=0.12, color=YELLOW)
        nuc_label = Text("O(核)", font=CJK, color=YELLOW).scale(0.38)
        nuc_label.next_to(nucleus, UR, buff=0.08)

        self.play(Create(orbit), Create(nucleus), FadeIn(nuc_label))
        self.wait(0.5)

        # 电子沿轨道运动（逆时针 ValueTracker）
        angle_tracker = ValueTracker(0.0)

        def electron_pos():
            a = angle_tracker.get_value()
            return center + R * np.array([math.cos(a), math.sin(a), 0])

        electron = always_redraw(lambda: Dot(point=electron_pos(), radius=0.14, color=BLUE))
        e_label = always_redraw(
            lambda: Text("e⁻", font=CJK, color=BLUE).scale(0.38).next_to(
                electron_pos(), UR, buff=0.06
            )
        )

        # 速度箭头（切线方向，逆时针）
        def vel_arrow():
            a = angle_tracker.get_value()
            pos = center + R * np.array([math.cos(a), math.sin(a), 0])
            tang = np.array([-math.sin(a), math.cos(a), 0]) * 0.55
            return Arrow(pos, pos + tang, buff=0, color=BLUE, stroke_width=3,
                         max_tip_length_to_length_ratio=0.35)

        vel_arr = always_redraw(vel_arrow)

        self.play(Create(electron), FadeIn(e_label), Create(vel_arr))

        # 动画电子绕轨道转一圈（逆时针）
        ccw_label = Text("电子逆时针转动", font=CJK, color=BLUE).scale(0.42).to_corner(UL, buff=0.6)
        self.play(FadeIn(ccw_label))
        self.play(angle_tracker.animate.set_value(TAU), run_time=3.0, rate_func=linear)
        self.wait(0.4)

        # 在轨道上叠加顺时针等效电流箭头
        cw_label = Text("等效电流方向（顺时针）", font=CJK, color=RED).scale(0.42)
        cw_label.next_to(orbit_title, DOWN, buff=0.15)
        self.play(FadeIn(cw_label))

        # 用6个红色箭头段标示顺时针方向
        cw_arrows = VGroup()
        for k in range(6):
            a = k * TAU / 6 + TAU / 12  # 错开半格，更清晰
            pos = center + R * np.array([math.cos(a), math.sin(a), 0])
            # 顺时针 → 切线方向取负
            tang = np.array([math.sin(a), -math.cos(a), 0]) * 0.45
            arr = Arrow(pos, pos + tang, buff=0, color=RED, stroke_width=3,
                        max_tip_length_to_length_ratio=0.4)
            cw_arrows.add(arr)
        self.play(Create(cw_arrows), run_time=1.2)
        self.wait(0.8)

        # 显示等效电流公式
        i_formula_label = Text("等效电流  ", font=CJK, color=RED).scale(0.44)
        i_formula_tex = MathTex(r"I = \frac{ev}{2\pi a}", color=RED).scale(0.82)
        i_formula = VGroup(i_formula_label, i_formula_tex).arrange(RIGHT, buff=0.1)
        i_formula.to_corner(DR, buff=0.5)
        self.play(FadeIn(i_formula))
        self.wait(1.4)

        # 计算数值
        i_num_label = Text("代入数值  ", font=CJK).scale(0.42)
        i_num_tex = MathTex(
            r"I = \frac{1.6\times10^{-19}\times2.18\times10^{6}}{2\pi\times5.29\times10^{-11}}"
            r"\approx 1.06\times10^{-3}\ \mathrm{A}",
            color=GREEN
        ).scale(0.58)
        i_num = VGroup(i_num_label, i_num_tex).arrange(RIGHT, buff=0.1)
        i_num.next_to(i_formula, UP, buff=0.25)
        self.play(FadeIn(i_num))
        self.wait(1.6)

        # 清场俯视图，保留 title
        self.play(FadeOut(VGroup(
            orbit, nucleus, nuc_label, electron, e_label, vel_arr,
            ccw_label, cw_label, cw_arrows, i_formula, i_num, orbit_title
        )))
        self.wait(0.3)

        # ── Step 5: 安培定律 → 圆心磁场 B ──────────────────────────────
        b_title = Text("圆心磁场：各电流元 dB 汇聚", font=CJK, color=BLUE).scale(0.5)
        b_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(b_title))

        # 重画轨道
        orbit2 = Circle(radius=R, color=WHITE, stroke_width=2).shift(DOWN * 0.3)
        center2 = orbit2.get_center()
        nucleus2 = Dot(point=center2, radius=0.12, color=YELLOW)
        self.play(Create(orbit2), Create(nucleus2))
        self.wait(0.3)

        # 用 8 个小箭头模拟各电流元在圆心处的 dB（均垂直纸面向里，用 ⊗ 符号）
        db_note = Text("每段电流元在圆心产生 dB（垂直纸面向里）", font=CJK, color=CYAN).scale(0.42)
        db_note.to_corner(DL, buff=0.5)
        self.play(FadeIn(db_note))

        db_dots = VGroup()
        for k in range(8):
            a = k * TAU / 8
            pos = center2 + R * 0.72 * np.array([math.cos(a), math.sin(a), 0])
            # ⊗ 符号：用 x 在圆内表示向里
            sym = Text("x", font=CJK, color=CYAN).scale(0.5).move_to(pos)
            db_dots.add(sym)
        self.play(LaggedStart(*[FadeIn(d) for d in db_dots], lag_ratio=0.15))
        self.wait(0.8)

        # 合场 B 箭头（向纸面里，用带圆的 × 替代，此处 2D 用向下箭头示意"合B"）
        b_arrow = Arrow(
            start=center2 + UP * 0.05,
            end=center2 + DOWN * 0.7,
            buff=0, color=ORANGE, stroke_width=5,
            max_tip_length_to_length_ratio=0.3
        )
        b_arr_label = Text("合 B（垂直纸面向里）", font=CJK, color=ORANGE).scale(0.4)
        b_arr_label.next_to(b_arrow, RIGHT, buff=0.15)
        self.play(Create(b_arrow), FadeIn(b_arr_label))
        self.wait(0.5)

        # 推导公式逐步出现
        b_step1_label = Text("由毕奥-萨伐尔定律（圆形电流）：", font=CJK).scale(0.44)
        b_step1_tex = MathTex(r"B = \frac{\mu_0 I}{2a}", color=YELLOW).scale(0.82)
        b_step1 = VGroup(b_step1_label, b_step1_tex).arrange(RIGHT, buff=0.12)
        b_step1.to_corner(DR, buff=0.5)
        self.play(FadeIn(b_step1))
        self.wait(0.8)

        b_step2_tex = MathTex(
            r"B = \frac{\mu_0 ev}{4\pi a^2}",
            color=YELLOW
        ).scale(0.82)
        b_step2_label = Text("代入 I：", font=CJK).scale(0.44)
        b_step2 = VGroup(b_step2_label, b_step2_tex).arrange(RIGHT, buff=0.12)
        b_step2.next_to(b_step1, UP, buff=0.3)
        self.play(FadeIn(b_step2))
        self.wait(0.8)

        b_num_label = Text("数值  ", font=CJK).scale(0.42)
        b_num_tex = MathTex(
            r"B \approx \frac{4\pi\times10^{-7}\times1.6\times10^{-19}\times2.18\times10^{6}}"
            r"{4\pi\times(5.29\times10^{-11})^2}"
            r"\approx 12.5\ \mathrm{T}",
            color=GREEN
        ).scale(0.5)
        b_num = VGroup(b_num_label, b_num_tex).arrange(RIGHT, buff=0.1)
        b_num.next_to(b_step2, UP, buff=0.25)
        self.play(FadeIn(b_num))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            orbit2, nucleus2, db_note, db_dots, b_arrow, b_arr_label,
            b_step1, b_step2, b_num, b_title
        )))
        self.wait(0.3)

        # ── Step 6: 侧视图 — 磁矩矢量 pm ───────────────────────────────
        pm_title = Text("侧视图：轨道磁矩矢量", font=CJK, color=BLUE).scale(0.5)
        pm_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(pm_title))

        # 画椭圆示意轨道（侧视）
        ellipse = Ellipse(width=3.2, height=0.7, color=WHITE, stroke_width=2).shift(DOWN * 0.3)
        ec = ellipse.get_center()

        # 电流方向（顺时针，从侧面看 → 底边往右，顶边往左）
        arr_right = Arrow(ec + LEFT * 1.1 + DOWN * 0.05, ec + RIGHT * 1.1 + DOWN * 0.05,
                          buff=0, color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.25)
        arr_label_i = Text("等效电流 I（顺时针）", font=CJK, color=RED).scale(0.4)
        arr_label_i.next_to(ellipse, DOWN, buff=0.2)

        self.play(Create(ellipse), Create(arr_right), FadeIn(arr_label_i))
        self.wait(0.5)

        # 磁矩 pm 箭头（垂直轨道面，即向上，用右手定则 → 实际向里/向下；
        # 这里按正确物理：电子绕逆时针 → 等效电流顺时针 → 右手螺旋 → pm 向纸面内(向下)
        # 在侧视图上，轨道面在水平面内，所以 pm 垂直轨道面，沿竖直方向向下）
        pm_arrow = Arrow(ec + UP * 0.1, ec + DOWN * 1.6,
                         buff=0, color=ORANGE, stroke_width=5,
                         max_tip_length_to_length_ratio=0.22)
        pm_label = MathTex(r"\vec{p}_m", color=ORANGE).scale(0.75)
        pm_label.next_to(pm_arrow.get_end(), LEFT, buff=0.15)

        self.play(Create(pm_arrow), FadeIn(pm_label))
        self.wait(0.5)

        # 方向说明
        dir_note = Text("右手定则：pm 与 B 同向，垂直轨道面", font=CJK, color=CYAN).scale(0.42)
        dir_note.to_corner(UL, buff=0.6)
        self.play(FadeIn(dir_note))
        self.wait(0.8)

        # Step 7: 磁矩公式推导 ─────────────────────────────────────────
        pm_step1_label = Text("磁矩定义：", font=CJK).scale(0.44)
        pm_step1_tex = MathTex(r"p_m = I \cdot \pi a^2", color=YELLOW).scale(0.82)
        pm_step1 = VGroup(pm_step1_label, pm_step1_tex).arrange(RIGHT, buff=0.12)
        pm_step1.to_corner(DR, buff=0.5)
        self.play(FadeIn(pm_step1))
        self.wait(0.7)

        pm_step2_label = Text("代入 I：", font=CJK).scale(0.44)
        pm_step2_tex = MathTex(
            r"p_m = \frac{ev}{2\pi a} \cdot \pi a^2 = \frac{eva}{2}",
            color=YELLOW
        ).scale(0.75)
        pm_step2_tex[0][4:10].set_color(RED)   # 高亮 I 的部分
        pm_step2 = VGroup(pm_step2_label, pm_step2_tex).arrange(RIGHT, buff=0.12)
        pm_step2.next_to(pm_step1, UP, buff=0.3)
        self.play(FadeIn(pm_step2))
        self.wait(0.9)

        pm_num_label = Text("数值  ", font=CJK).scale(0.42)
        pm_num_tex = MathTex(
            r"p_m = \frac{1.6\times10^{-19}\times2.18\times10^{6}\times5.29\times10^{-11}}{2}"
            r"\approx 9.22\times10^{-24}\ \mathrm{A\cdot m^2}",
            color=GREEN
        ).scale(0.52)
        pm_num = VGroup(pm_num_label, pm_num_tex).arrange(RIGHT, buff=0.1)
        pm_num.next_to(pm_step2, UP, buff=0.25)
        self.play(FadeIn(pm_num))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            ellipse, arr_right, arr_label_i, pm_arrow, pm_label,
            dir_note, pm_step1, pm_step2, pm_num, pm_title
        )))
        self.wait(0.3)

        # ── Step 8: 玻尔磁子对照 ────────────────────────────────────────
        bohr_title = Text("与玻尔磁子对照", font=CJK, color=BLUE).scale(0.52)
        bohr_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(bohr_title))

        bohr_def_label = Text("玻尔磁子（最小轨道磁矩单位）：", font=CJK).scale(0.46)
        bohr_def_label.next_to(bohr_title, DOWN, buff=0.4)
        bohr_def_tex = MathTex(
            r"\mu_B = \frac{e\hbar}{2m_e} = 9.274\times10^{-24}\ \mathrm{A\cdot m^2}",
            color=YELLOW
        ).scale(0.72)
        bohr_def_tex.next_to(bohr_def_label, DOWN, buff=0.3)

        result_label = Text("本例计算结果：", font=CJK).scale(0.46)
        result_tex = MathTex(
            r"p_m \approx 9.22\times10^{-24}\ \mathrm{A\cdot m^2} \approx \mu_B",
            color=GREEN
        ).scale(0.72)
        result = VGroup(result_label, result_tex).arrange(RIGHT, buff=0.12)
        result.next_to(bohr_def_tex, DOWN, buff=0.4)

        conclusion = Text("计算结果与玻尔磁子量级完全吻合！", font=CJK, color=ORANGE).scale(0.48)
        conclusion.next_to(result, DOWN, buff=0.35)

        self.play(FadeIn(bohr_def_label))
        self.play(Write(bohr_def_tex))
        self.wait(0.8)
        self.play(FadeIn(result))
        self.wait(0.8)
        self.play(FadeIn(conclusion))
        self.wait(1.6)
        self.play(FadeOut(VGroup(bohr_title, bohr_def_label, bohr_def_tex, result, conclusion)))
        self.wait(0.3)

        # ── Step 9: 三公式完整推导回顾（高亮关键项）───────────────────
        deriv_title = Text("完整推导链：三个关键公式", font=CJK, color=BLUE).scale(0.5)
        deriv_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(deriv_title))

        f1 = MathTex(r"I = \frac{ev}{2\pi a}", color=WHITE).scale(0.85)
        f1[0][0].set_color(RED)   # I

        f2 = MathTex(r"B = \frac{\mu_0 ev}{4\pi a^2}", color=WHITE).scale(0.85)
        f2[0][0].set_color(ORANGE)  # B

        f3 = MathTex(r"p_m = \frac{eva}{2}", color=WHITE).scale(0.85)
        f3[0][0:3].set_color(YELLOW)  # pm

        arrow1 = MathTex(r"\Rightarrow").scale(0.9).set_color(CYAN)
        arrow2 = MathTex(r"\Rightarrow").scale(0.9).set_color(CYAN)

        chain = VGroup(f1, arrow1, f2, arrow2, f3).arrange(RIGHT, buff=0.35)
        chain.next_to(deriv_title, DOWN, buff=0.55)
        chain.scale_to_fit_width(12.5)

        note1 = Text("等效电流", font=CJK, color=RED).scale(0.38).next_to(f1, DOWN, buff=0.18)
        note2 = Text("圆心磁场", font=CJK, color=ORANGE).scale(0.38).next_to(f2, DOWN, buff=0.18)
        note3 = Text("轨道磁矩", font=CJK, color=YELLOW).scale(0.38).next_to(f3, DOWN, buff=0.18)

        self.play(Write(f1), FadeIn(note1))
        self.wait(0.5)
        self.play(Write(arrow1), Write(f2), FadeIn(note2))
        self.wait(0.5)
        self.play(Write(arrow2), Write(f3), FadeIn(note3))
        self.wait(1.8)
        self.play(FadeOut(VGroup(deriv_title, chain, note1, note2, note3)))
        self.wait(0.3)

        # ── Step 10: 小结卡 ─────────────────────────────────────────────
        s_title = Text("例题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s1_label = Text("等效电流：", font=CJK).scale(0.43)
        s1_tex = MathTex(r"I = \frac{ev}{2\pi a}", color=YELLOW).scale(0.78)
        s1 = VGroup(s1_label, s1_tex).arrange(RIGHT, buff=0.12)

        s2_label = Text("圆心磁场：", font=CJK).scale(0.43)
        s2_tex = MathTex(r"B = \frac{\mu_0 ev}{4\pi a^2} \approx 12.5\ \mathrm{T}", color=YELLOW).scale(0.78)
        s2 = VGroup(s2_label, s2_tex).arrange(RIGHT, buff=0.12)

        s3_label = Text("轨道磁矩：", font=CJK).scale(0.43)
        s3_tex = MathTex(r"p_m = \frac{eva}{2} \approx 9.22\times10^{-24}\ \mathrm{A\cdot m^2}", color=YELLOW).scale(0.78)
        s3 = VGroup(s3_label, s3_tex).arrange(RIGHT, buff=0.12)

        s4_label = Text("对照玻尔磁子：", font=CJK).scale(0.43)
        s4_tex = MathTex(r"p_m \approx \mu_B = 9.274\times10^{-24}\ \mathrm{A\cdot m^2}", color=GREEN).scale(0.78)
        s4 = VGroup(s4_label, s4_tex).arrange(RIGHT, buff=0.12)

        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.4)
        s_group.scale_to_fit_width(12.0)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.4)
        self.play(Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(Write(s4))
        self.wait(0.5)
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch08Ex1HydrogenAtomMagneticMoment",
        "id": "phys-ch08-8.2-ex1-hydrogen-atom-magnetic-moment",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "氢原子电子轨道磁矩",
        "description": "通过俯视圆形轨道、安培定律汇聚dB、侧视磁矩矢量三步可视化，推导氢原子电子轨道等效电流、圆心磁场B与轨道磁矩pm，并与玻尔磁子量级对照。",
    },
]
