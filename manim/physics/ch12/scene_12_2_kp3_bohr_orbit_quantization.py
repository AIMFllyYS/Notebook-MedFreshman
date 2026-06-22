"""第 12.2 节 · 玻尔轨道量子化：半径与角动量。

可视化玻尔模型中轨道半径按 n² 量子化、角动量按 nℏ 量子化的核心思想：
  - 同心圆轨道 + 驻波条件 2πr_n = nλ_n
  - n² 棒状图展示半径跳跃
  - ValueTracker 扫 n 演示半径/角动量/速度同步变化
  - 量子化离散 vs 经典连续的对比示意

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch12Kp3BohrOrbitQuantization(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("玻尔轨道量子化：半径与角动量", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        analogy1 = Text("电子绕核运动，为什么不能停在任意轨道？", font=CJK).scale(0.48)
        analogy2 = Text("玻尔假设：轨道必须满足「驻波」条件——", font=CJK).scale(0.48)
        analogy3 = Text("就像吉他弦只能振动整数个半波长，轨道周长只能容纳整数个电子波长。", font=CJK).scale(0.44)
        ana = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(analogy1))
        self.wait(0.7)
        self.play(FadeIn(analogy2))
        self.wait(0.7)
        self.play(FadeIn(analogy3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 驻波条件引出量子化 ──────────────────────────────────
        sec_title = Text("驻波条件 → 轨道量子化", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        standing = MathTex(r"2\pi r_n = n\lambda_n", r"\quad (n=1,2,3,\ldots)").scale(0.9)
        standing.next_to(sec_title, DOWN, buff=0.4)
        standing[0].set_color(YELLOW)
        de_broglie = MathTex(r"\lambda_n = \frac{h}{m_e v_n}").scale(0.88)
        de_broglie.next_to(standing, DOWN, buff=0.35)
        de_broglie.set_color(CYAN)
        result_eq = MathTex(r"m_e v_n r_n = n\hbar", r"\quad\Rightarrow\quad",
                            r"L = n\hbar").scale(0.88)
        result_eq.next_to(de_broglie, DOWN, buff=0.35)
        result_eq[2].set_color(GREEN)

        self.play(FadeIn(sec_title))
        self.wait(0.4)
        self.play(Write(standing))
        self.wait(1.0)
        note_de = VGroup(
            Text("代入德布罗意波长", font=CJK, color=CYAN).scale(0.42),
        ).next_to(de_broglie, RIGHT, buff=0.3)
        self.play(FadeIn(de_broglie), FadeIn(note_de))
        self.wait(1.0)
        self.play(Write(result_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(sec_title, standing, de_broglie, note_de, result_eq)))

        # ── Step 4: 半径公式 r_n = n² a₀ ───────────────────────────────
        sec2 = Text("轨道半径公式", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        rn_eq = MathTex(r"r_n", r"=", r"n^2", r"a_0").scale(1.1)
        rn_eq[0].set_color(YELLOW)
        rn_eq[2].set_color(ORANGE)
        rn_eq[3].set_color(CYAN)
        rn_eq.next_to(sec2, DOWN, buff=0.45)
        a0_eq = MathTex(r"a_0 = 0.529 \times 10^{-10}\ \mathrm{m}").scale(0.8)
        a0_eq.set_color(CYAN)
        a0_eq.next_to(rn_eq, DOWN, buff=0.35)
        note_a0 = Text("玻尔半径（氢原子基态轨道半径）", font=CJK, color=CYAN).scale(0.42)
        note_a0.next_to(a0_eq, DOWN, buff=0.2)

        self.play(FadeIn(sec2))
        self.play(Write(rn_eq))
        self.wait(0.8)
        self.play(FadeIn(a0_eq), FadeIn(note_a0))
        self.wait(1.2)

        # 逐步展示 n=1,2,3,4 的数值
        vals_title = Text("各轨道半径（单位：a₀）", font=CJK, color=WHITE).scale(0.42)
        vals_title.next_to(note_a0, DOWN, buff=0.35)
        vals = VGroup(
            MathTex(r"r_1 = 1^2 a_0 = a_0").scale(0.72),
            MathTex(r"r_2 = 2^2 a_0 = 4a_0").scale(0.72),
            MathTex(r"r_3 = 3^2 a_0 = 9a_0").scale(0.72),
            MathTex(r"r_4 = 4^2 a_0 = 16a_0").scale(0.72),
        )
        colors = [WHITE, YELLOW, ORANGE, RED]
        for i, (v, c) in enumerate(zip(vals, colors)):
            v.set_color(c)
        vals.arrange(RIGHT, buff=0.55).next_to(vals_title, DOWN, buff=0.28)
        vals.scale_to_fit_width(12.5)
        self.play(FadeIn(vals_title))
        for v in vals:
            self.play(FadeIn(v), run_time=0.5)
        self.wait(1.4)
        self.play(FadeOut(VGroup(sec2, rn_eq, a0_eq, note_a0, vals_title, vals)))

        # ── Step 5: 同心圆轨道俯视图 + 驻波纹 ──────────────────────────
        orbit_label = Text("玻尔轨道俯视图（n=1,2,3,4）", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(orbit_label))

        # 核
        nucleus = Dot(ORIGIN + DOWN * 0.4, radius=0.14, color=RED)
        nuc_label = MathTex(r"+Ze", color=RED).scale(0.5).next_to(nucleus, UP, buff=0.12)
        self.play(Create(nucleus), FadeIn(nuc_label))

        # 轨道半径（视觉比例按 n² 缩放，基准单位 0.55）
        BASE = 0.52
        orbit_colors = [WHITE, YELLOW, ORANGE, RED]
        orbit_ns = [1, 2, 3, 4]
        orbits = VGroup()
        orbit_n_labels = VGroup()

        for n, col in zip(orbit_ns, orbit_colors):
            r = BASE * n * n
            circ = Circle(radius=r, color=col, stroke_width=1.8).move_to(nucleus.get_center())
            orbits.add(circ)
            lbl = MathTex(rf"n={n}", color=col).scale(0.38)
            lbl.move_to(nucleus.get_center() + np.array([r + 0.22, 0.12, 0]))
            orbit_n_labels.add(lbl)

        self.play(Create(orbits), FadeIn(orbit_n_labels), run_time=1.4)
        self.wait(0.6)

        # 在 n=2 轨道上绘制 2 个驻波波纹（用折线近似圆上正弦波）
        def make_standing_wave(n, center, base_r, amplitude=0.10, wave_color=CYAN):
            r0 = base_r * n * n
            pts = []
            num_pts = 120
            for i in range(num_pts + 1):
                theta = TAU * i / num_pts
                wave_r = r0 + amplitude * math.sin(n * theta)
                x = center[0] + wave_r * math.cos(theta)
                y = center[1] + wave_r * math.sin(theta)
                pts.append([x, y, 0])
            return VMobject(color=wave_color, stroke_width=2.2).set_points_as_corners(pts)

        center_pt = nucleus.get_center()
        wave2 = make_standing_wave(2, center_pt, BASE, amplitude=0.09, wave_color=CYAN)
        wave3 = make_standing_wave(3, center_pt, BASE, amplitude=0.09, wave_color=GREEN)

        standing_text = VGroup(
            Text("驻波条件：", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"2\pi r_n = n\lambda_n", color=CYAN).scale(0.62),
        ).arrange(RIGHT, buff=0.18).to_corner(DL, buff=0.5)

        self.play(Create(wave2), Create(wave3), FadeIn(standing_text), run_time=1.2)
        self.wait(1.0)
        self.play(FadeOut(VGroup(wave2, wave3, standing_text)))

        # 右侧棒状图：r_n 随 n² 跳跃
        bar_title = Text("r_n 随 n 跳跃（按 n²）", font=CJK, color=WHITE).scale(0.4)
        bar_title.to_corner(UR, buff=0.55)
        bars = VGroup()
        bar_labels = VGroup()
        bar_x0 = 4.2
        bar_y0 = -3.1
        bar_w = 0.38
        bar_scale = 0.13
        bar_colors = [WHITE, YELLOW, ORANGE, RED]
        for i, (n, col) in enumerate(zip(orbit_ns, bar_colors)):
            h = n * n * bar_scale
            rect = Rectangle(
                width=bar_w, height=h, color=col, fill_color=col, fill_opacity=0.7
            ).move_to([bar_x0 + i * 0.72, bar_y0 + h / 2, 0])
            nl = MathTex(rf"n={n}", color=col).scale(0.32).next_to(rect, DOWN, buff=0.08)
            rl = MathTex(rf"{n**2}a_0", color=col).scale(0.32).next_to(rect, UP, buff=0.06)
            bars.add(rect)
            bar_labels.add(nl, rl)
        self.play(FadeIn(bar_title))
        self.play(
            LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.4),
            run_time=1.4,
        )
        self.play(FadeIn(bar_labels))
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            orbit_label, orbits, orbit_n_labels,
            nucleus, nuc_label, bars, bar_labels, bar_title
        )))

        # ── Step 6: ValueTracker 扫 n，轨道+角动量+速度同步 ─────────────
        act2_title = Text("量子数 n 变化时，各量如何跟踪？", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(act2_title))

        n_tracker = ValueTracker(1.0)

        # 轨道圆（动态，仅几何更新，无 LaTeX 重编译）
        orbit_center = np.array([-3.2, -0.5, 0])
        orbit_dyn = always_redraw(
            lambda: Circle(
                radius=BASE * n_tracker.get_value() ** 2,
                color=YELLOW,
                stroke_width=2.2,
            ).move_to(orbit_center)
        )
        nucleus2 = Dot(orbit_center, radius=0.13, color=RED)
        nuc_label2 = MathTex(r"+Ze", color=RED).scale(0.45).next_to(nucleus2, UP, buff=0.1)

        panel_x = 1.5

        # 固定文字标签（静态，只创建一次）
        n_lbl = Text("n  =", font=CJK, color=WHITE).scale(0.46).move_to([panel_x + 0.2, 1.6, 0])
        r_lbl = Text("r  =", font=CJK, color=YELLOW).scale(0.46).move_to([panel_x + 0.2, 0.7, 0])
        L_lbl = Text("L  =", font=CJK, color=GREEN).scale(0.46).move_to([panel_x + 0.2, -0.2, 0])
        v_lbl = Text("v  =", font=CJK, color=CYAN).scale(0.46).move_to([panel_x + 0.2, -1.1, 0])

        # 单位后缀（静态 MathTex）
        r_unit = MathTex(r"a_0", color=YELLOW).scale(0.62)
        L_unit = MathTex(r"\hbar", color=GREEN).scale(0.62)
        v_pre = MathTex(r"v_1/", color=CYAN).scale(0.62)

        # 数值用 DecimalNumber + add_updater（避免逐帧重编译 MathTex）
        n_num = DecimalNumber(1.0, num_decimal_places=2, color=ORANGE).scale(0.62)
        n_num.next_to(n_lbl, RIGHT, buff=0.18)
        r_num = DecimalNumber(1.0, num_decimal_places=2, color=YELLOW).scale(0.62)
        L_num = DecimalNumber(1.0, num_decimal_places=2, color=GREEN).scale(0.62)
        v_num = DecimalNumber(1.0, num_decimal_places=2, color=CYAN).scale(0.62)
        r_num.next_to(r_lbl, RIGHT, buff=0.18)
        r_unit.next_to(r_num, RIGHT, buff=0.12)
        L_num.next_to(L_lbl, RIGHT, buff=0.18)
        L_unit.next_to(L_num, RIGHT, buff=0.12)
        v_pre.next_to(v_lbl, RIGHT, buff=0.12)
        v_num.next_to(v_pre, RIGHT, buff=0.08)

        formula_r = MathTex(r"r_n = n^2 a_0", color=YELLOW).scale(0.62).move_to([panel_x + 1.0, -2.2, 0])
        formula_L = MathTex(r"L = n\hbar", color=GREEN).scale(0.62).next_to(formula_r, RIGHT, buff=0.6)
        formula_v = MathTex(r"v_n = v_1/n", color=CYAN).scale(0.62).next_to(formula_r, DOWN, buff=0.3)

        self.play(Create(nucleus2), FadeIn(nuc_label2))
        self.play(Create(orbit_dyn))
        self.play(
            FadeIn(VGroup(n_lbl, r_lbl, L_lbl, v_lbl)),
            FadeIn(VGroup(n_num, r_num, r_unit, L_num, L_unit, v_pre, v_num)),
        )
        self.play(FadeIn(formula_r), FadeIn(formula_L), FadeIn(formula_v))
        self.wait(0.6)

        # add_updater 放在 FadeIn 之后（Python 3.14 zip 严格）
        n_num.add_updater(lambda m: m.set_value(n_tracker.get_value()))
        r_num.add_updater(lambda m: m.set_value(n_tracker.get_value() ** 2))
        L_num.add_updater(lambda m: m.set_value(n_tracker.get_value()))
        v_num.add_updater(lambda m: m.set_value(n_tracker.get_value()))

        # 从 n=1 扫到 n=4
        sweep_note = Text("n 从 1 增大至 4：轨道半径按 n² 迅速扩大，速度反比减小", font=CJK, color=ORANGE).scale(0.40)
        sweep_note.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(sweep_note))
        self.play(n_tracker.animate.set_value(4.0), run_time=2.0, rate_func=linear)
        self.wait(0.6)
        self.play(n_tracker.animate.set_value(1.0), run_time=1.6, rate_func=smooth)
        self.wait(0.8)

        # FadeOut 前 clear_updaters()
        for m in (n_num, r_num, L_num, v_num):
            m.clear_updaters()

        self.play(FadeOut(VGroup(
            act2_title, orbit_dyn, nucleus2, nuc_label2,
            n_lbl, r_lbl, L_lbl, v_lbl,
            n_num, r_num, r_unit, L_num, L_unit, v_pre, v_num,
            formula_r, formula_L, formula_v, sweep_note
        )))

        # ── Step 7: 量子化 vs 经典连续——离散棒状图 ──────────────────────
        act3_title = Text("量子化：角动量只能取离散值", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(act3_title))

        # 左：经典——「连续」曲线假设
        classic_label = Text("经典物理（任意 L）", font=CJK, color=RED).scale(0.44)
        classic_label.move_to([-4.0, 1.6, 0])
        classic_ax = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 5.5, 1],
            x_length=3.2,
            y_length=2.8,
            axis_config={"color": GRAY, "include_tip": False},
        ).move_to([-4.2, -0.6, 0])
        classic_line = classic_ax.plot(lambda x: x, x_range=[0, 5], color=RED, stroke_width=2.5)
        cl_xl = MathTex(r"r").scale(0.48).next_to(classic_ax.x_axis.get_end(), DOWN, buff=0.12)
        cl_yl = MathTex(r"L").scale(0.48).next_to(classic_ax.y_axis.get_end(), LEFT, buff=0.12)
        continuous_note = Text("L 可以是任意实数", font=CJK, color=RED).scale(0.38)
        continuous_note.next_to(classic_ax, DOWN, buff=0.18)

        # 右：量子——离散棒状图
        quantum_label = Text("量子力学（L = nℏ）", font=CJK, color=GREEN).scale(0.44)
        quantum_label.move_to([3.0, 1.6, 0])
        q_ax = Axes(
            x_range=[0, 5.5, 1],
            y_range=[0, 5.5, 1],
            x_length=3.2,
            y_length=2.8,
            axis_config={"color": GRAY, "include_tip": False},
        ).move_to([3.0, -0.6, 0])
        ql_xl = MathTex(r"n").scale(0.48).next_to(q_ax.x_axis.get_end(), DOWN, buff=0.12)
        ql_yl = MathTex(r"L/\hbar").scale(0.48).next_to(q_ax.y_axis.get_end(), LEFT, buff=0.12)
        q_bars = VGroup()
        q_dots = VGroup()
        for n in range(1, 5):
            bar = Line(
                q_ax.c2p(n, 0), q_ax.c2p(n, n),
                color=GREEN, stroke_width=6,
            )
            dot = Dot(q_ax.c2p(n, n), radius=0.1, color=GREEN)
            label_n = MathTex(rf"n\!=\!{n}", color=GREEN).scale(0.32).next_to(dot, UR, buff=0.04)
            q_bars.add(bar, dot, label_n)
        discrete_note = Text("L 只能是 ℏ 的整数倍", font=CJK, color=GREEN).scale(0.38)
        discrete_note.next_to(q_ax, DOWN, buff=0.18)

        vs_arrow = MathTex(r"\longrightarrow").scale(1.1).move_to([0, -0.5, 0])

        self.play(Create(classic_ax), FadeIn(classic_label), FadeIn(cl_xl), FadeIn(cl_yl))
        self.play(Create(classic_line), FadeIn(continuous_note))
        self.play(FadeIn(vs_arrow))
        self.play(Create(q_ax), FadeIn(quantum_label), FadeIn(ql_xl), FadeIn(ql_yl))
        self.play(
            LaggedStart(*[Create(b) for b in q_bars], lag_ratio=0.25),
            run_time=1.6,
        )
        self.play(FadeIn(discrete_note))
        self.wait(1.4)

        self.play(FadeOut(VGroup(
            act3_title,
            classic_label, classic_ax, classic_line, cl_xl, cl_yl, continuous_note,
            vs_arrow,
            quantum_label, q_ax, q_bars, ql_xl, ql_yl, discrete_note,
        )))

        # ── Step 8: 数值例子 ─────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        ex1_zh = Text("n=2 的轨道半径和角动量：", font=CJK).scale(0.46)
        ex1_zh.next_to(ex_title, DOWN, buff=0.38)
        ex1_r = MathTex(
            r"r_2 = 2^2 \times 0.529\times10^{-10}\ \mathrm{m} = 2.116\times10^{-10}\ \mathrm{m}"
        ).scale(0.72).set_color(YELLOW)
        ex1_r.next_to(ex1_zh, DOWN, buff=0.3)
        ex1_L = MathTex(
            r"L_2 = 2\hbar = 2 \times 1.055\times10^{-34}\ \mathrm{J\cdot s} = 2.11\times10^{-34}\ \mathrm{J\cdot s}"
        ).scale(0.65).set_color(GREEN)
        ex1_L.next_to(ex1_r, DOWN, buff=0.3)
        ex1_v = MathTex(
            r"v_2 = \frac{v_1}{2} \approx \frac{2.19\times10^6}{2}\ \mathrm{m/s} = 1.09\times10^6\ \mathrm{m/s}"
        ).scale(0.68).set_color(CYAN)
        ex1_v.next_to(ex1_L, DOWN, buff=0.3)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1_zh))
        self.play(Write(ex1_r))
        self.wait(0.7)
        self.play(Write(ex1_L))
        self.wait(0.7)
        self.play(Write(ex1_v))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex1_zh, ex1_r, ex1_L, ex1_v)))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.45)
        s1 = MathTex(r"r_n = n^2 a_0,\quad a_0 = 0.529\times10^{-10}\ \mathrm{m}",
                     color=YELLOW).scale(0.75)
        s2 = MathTex(r"L = n\hbar = n\frac{h}{2\pi}",
                     color=GREEN).scale(0.75)
        s3 = MathTex(r"2\pi r_n = n\lambda_n \quad (\text{de Broglie standing wave})",
                     color=CYAN).scale(0.68)
        s4 = VGroup(
            Text("轨道能量：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"E_n = -\frac{13.6\ \mathrm{eV}}{n^2}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.2)
        s5 = Text("量子化打破经典连续性：轨道半径、角动量均为离散值。", font=CJK, color=GREEN).scale(0.40)
        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32).next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.8)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(FadeIn(s4))
        self.wait(0.4)
        self.play(FadeIn(s5), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp3BohrOrbitQuantization",
        "id": "phys-ch12-12.2-kp3-bohr-orbit-quantization",
        "chapterId": "ch12",
        "sectionId": "12.2",
        "title": "玻尔轨道量子化：半径与角动量",
        "description": "同心圆轨道驻波条件引出 r_n=n²a₀ 与 L=nℏ，ValueTracker 扫 n 演示半径/角动量/速度联动，棒状图对比经典连续与量子离散。",
    },
]
