"""第 3.2 节 · 互相垂直振动的合成与李萨如图形

两个互相垂直的简谐振动叠加时，合运动轨迹取决于频率比和相位差。
- 同频率：相位差决定直线/椭圆/圆，由椭圆方程描述。
- 不同频率：整数频率比产生稳定的李萨如图形，切点数之比等于频率比之反比。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch03Kp3PerpendicularLissajous(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("互相垂直振动的合成与李萨如图形", font=CJK, color=BLUE).scale(0.6)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第三章 振动 · 3.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("用示波器观察两路信号时，水平偏转 x 和竖直偏转 y", font=CJK).scale(0.46)
        ana2 = Text("各自做简谐振动——屏幕上描出的神奇图案就是李萨如图形！", font=CJK).scale(0.46)
        ana3 = Text("图形形状揭示了两路信号的频率比，工程师靠它校准仪器。", font=CJK, color=CYAN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.25)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 振动方程定义（逐步） ────────────────────────────────
        def_title = Text("两个垂直方向的简谐振动", font=CJK, color=YELLOW).scale(0.48)
        def_title.next_to(title, DOWN, buff=0.45)

        eq_x = MathTex(r"x = A_1 \cos(\omega t)", color=WHITE).scale(0.85)
        label_x = VGroup(
            Text("x方向：", font=CJK, color=GREEN).scale(0.42),
            eq_x,
        ).arrange(RIGHT, buff=0.18)

        eq_y = MathTex(r"y = A_2 \cos(\omega t + \Delta\varphi)", color=WHITE).scale(0.85)
        label_y = VGroup(
            Text("y方向：", font=CJK, color=ORANGE).scale(0.42),
            eq_y,
        ).arrange(RIGHT, buff=0.18)

        eqs = VGroup(label_x, label_y).arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        eqs.next_to(def_title, DOWN, buff=0.38)

        self.play(FadeIn(def_title))
        self.wait(0.4)
        self.play(Write(label_x))
        self.wait(0.6)
        self.play(Write(label_y))
        self.wait(1.2)

        # 椭圆方程
        ell_eq = MathTex(
            r"\frac{x^2}{A_1^2} + \frac{y^2}{A_2^2} - \frac{2xy}{A_1 A_2}\cos(\Delta\varphi) = \sin^2(\Delta\varphi)",
            color=YELLOW,
        ).scale(0.68)
        ell_eq.next_to(eqs, DOWN, buff=0.38)
        self.play(Write(ell_eq))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_title, eqs, ell_eq)))

        # ── Step 4: 建立坐标系 ──────────────────────────────────────────
        axes = Axes(
            x_range=[-1.6, 1.6, 0.5],
            y_range=[-1.6, 1.6, 0.5],
            x_length=5.2,
            y_length=5.2,
            axis_config={"color": BLUE_B, "include_tip": True, "stroke_width": 1.8},
        ).shift(DOWN * 0.5 + RIGHT * 0.5)

        x_lbl = MathTex(r"x", color=GREEN).scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"y", color=ORANGE).scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        # 横向投影 x(t) 坐标轴（上方水平小坐标系）
        x_sub_axes = Axes(
            x_range=[0, 2 * math.pi, math.pi],
            y_range=[-1.6, 1.6, 1],
            x_length=5.2,
            y_length=1.4,
            axis_config={"color": GREEN_C, "include_tip": False, "stroke_width": 1.2},
        ).next_to(axes, UP, buff=0.25).align_to(axes, LEFT)

        # 纵向投影 y(t) 坐标轴（左侧竖直小坐标系）
        y_sub_axes = Axes(
            x_range=[0, 2 * math.pi, math.pi],
            y_range=[-1.6, 1.6, 1],
            x_length=1.4,
            y_length=5.2,
            axis_config={"color": ORANGE, "include_tip": False, "stroke_width": 1.2},
        ).next_to(axes, LEFT, buff=0.25).align_to(axes, DOWN)

        x_sub_lbl = Text("x(t)", font=CJK, color=GREEN).scale(0.32).next_to(x_sub_axes, UP, buff=0.08)
        y_sub_lbl = Text("y(t)", font=CJK, color=ORANGE).scale(0.32).next_to(y_sub_axes, UP, buff=0.08)

        instr = Text("同频振动：相位差决定轨迹形状", font=CJK, color=WHITE).scale(0.42)
        instr.next_to(title, DOWN, buff=0.38)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(x_sub_axes), Create(y_sub_axes), FadeIn(x_sub_lbl), FadeIn(y_sub_lbl))
        self.play(FadeIn(instr))
        self.wait(0.5)

        # ── Step 5: 同频相位差扫动（ValueTracker）───────────────────────
        A1, A2 = 1.0, 1.0
        N_POINTS = 300
        dphi = ValueTracker(0.0)

        # 主轨迹（李萨如曲线：同频）
        def lissajous_path(dph):
            pts = []
            for i in range(N_POINTS + 1):
                t_val = 2 * math.pi * i / N_POINTS
                x_val = A1 * math.cos(t_val)
                y_val = A2 * math.cos(t_val + dph)
                pts.append(axes.c2p(x_val, y_val))
            return VMobject().set_points_as_corners(pts).set_stroke(color=YELLOW, width=2.5)

        traj = always_redraw(lambda: lissajous_path(dphi.get_value()))

        # x 分量投影曲线（上方）
        def x_proj_curve():
            pts = []
            for i in range(N_POINTS + 1):
                t_val = 2 * math.pi * i / N_POINTS
                x_val = A1 * math.cos(t_val)
                pts.append(x_sub_axes.c2p(t_val, x_val))
            return VMobject().set_points_as_corners(pts).set_stroke(color=GREEN, width=1.8)

        # y 分量投影曲线（左侧）：x轴=t，y轴=y值，但绘制在旋转的子轴上
        def y_proj_curve():
            pts = []
            dph = dphi.get_value()
            for i in range(N_POINTS + 1):
                t_val = 2 * math.pi * i / N_POINTS
                y_val = A2 * math.cos(t_val + dph)
                pts.append(y_sub_axes.c2p(t_val, y_val))
            return VMobject().set_points_as_corners(pts).set_stroke(color=ORANGE, width=1.8)

        x_curve = always_redraw(x_proj_curve)
        y_curve = always_redraw(y_proj_curve)

        self.play(Create(traj), Create(x_curve), Create(y_curve))
        self.wait(0.5)

        # 标注标签（右侧）
        def make_dphi_label(val_tex, color=WHITE):
            lbl = VGroup(
                Text("相位差 ", font=CJK, color=color).scale(0.42),
                MathTex(val_tex, color=color).scale(0.7),
            ).arrange(RIGHT, buff=0.1)
            lbl.to_edge(RIGHT, buff=0.35).shift(DOWN * 0.5)
            return lbl

        def make_shape_label(txt, color=GREEN):
            return Text(txt, font=CJK, color=color).scale(0.44).to_edge(RIGHT, buff=0.35).shift(DOWN * 1.4)

        # 关键相位差停留展示
        key_phases = [
            (0.0,           r"\Delta\varphi = 0",          "斜线（正斜率）"),
            (math.pi / 4,   r"\Delta\varphi = \pi/4",      "右旋椭圆"),
            (math.pi / 2,   r"\Delta\varphi = \pi/2",      "正椭圆（圆）"),
            (3 * math.pi / 4, r"\Delta\varphi = 3\pi/4",   "左旋椭圆"),
            (math.pi,       r"\Delta\varphi = \pi",         "斜线（负斜率）"),
        ]

        current_lbl = make_dphi_label(r"\Delta\varphi = 0", WHITE)
        current_shape = make_shape_label("斜线（正斜率）", GREEN)
        self.play(FadeIn(current_lbl), FadeIn(current_shape))
        self.wait(1.0)

        for phase_val, phase_tex, shape_txt in key_phases[1:]:
            new_lbl = make_dphi_label(phase_tex, YELLOW)
            new_shape = make_shape_label(shape_txt, GREEN)
            self.play(
                dphi.animate.set_value(phase_val),
                FadeOut(current_lbl), FadeOut(current_shape),
                FadeIn(new_lbl), FadeIn(new_shape),
                run_time=1.8,
                rate_func=smooth,
            )
            self.wait(1.2)
            current_lbl = new_lbl
            current_shape = new_shape

        self.play(FadeOut(current_lbl), FadeOut(current_shape))
        self.wait(0.5)

        # 继续扫到 2π（回到起点）
        cont_lbl = Text("相位差继续增大…回到原点", font=CJK, color=CYAN).scale(0.42)
        cont_lbl.to_edge(RIGHT, buff=0.35).shift(DOWN * 0.5)
        self.play(FadeIn(cont_lbl))
        self.play(dphi.animate.set_value(2 * math.pi), run_time=2.5, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(cont_lbl))

        # 清场（保留 axes 和 title）
        self.play(FadeOut(VGroup(traj, x_curve, y_curve, x_sub_axes, y_sub_axes, x_sub_lbl, y_sub_lbl, instr)))
        self.wait(0.4)

        # ── Step 6: 李萨如图形（不同频率比）───────────────────────────────
        freq_title = Text("改变频率比——李萨如图形", font=CJK, color=YELLOW).scale(0.5)
        freq_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeOut(x_lbl), FadeOut(y_lbl), FadeIn(freq_title))

        # 重新放置主坐标系（稍大一点）
        main_ax = Axes(
            x_range=[-1.6, 1.6, 1],
            y_range=[-1.6, 1.6, 1],
            x_length=4.0,
            y_length=4.0,
            axis_config={"color": BLUE_B, "include_tip": True, "stroke_width": 1.5},
        ).shift(LEFT * 2.0 + DOWN * 0.8)

        self.play(ReplacementTransform(axes, main_ax))
        self.wait(0.3)

        wx_tracker = ValueTracker(1.0)
        wy_tracker = ValueTracker(2.0)

        def lissajous_freq(wx, wy, color=YELLOW, n=500):
            pts = []
            for i in range(n + 1):
                t_val = 2 * math.pi * i / n
                x_val = A1 * math.cos(wx * t_val)
                y_val = A2 * math.cos(wy * t_val + math.pi / 4)
                pts.append(main_ax.c2p(x_val, y_val))
            return VMobject().set_points_as_corners(pts).set_stroke(color=color, width=2.2)

        # 三个频率比展示
        lissajous_cases = [
            (1, 2, "1:2", YELLOW),
            (1, 3, "1:3", CYAN),
            (2, 3, "2:3", GREEN),
        ]

        # 右侧说明面板
        panel_bg_rect = Rectangle(width=4.2, height=5.5, color=BLUE_E, fill_opacity=0.18, stroke_width=1)
        panel_bg_rect.to_edge(RIGHT, buff=0.25).shift(DOWN * 0.8)
        panel_title = Text("切点数与频率比", font=CJK, color=BLUE_C).scale(0.46)
        panel_title.next_to(panel_bg_rect, UP, buff=0.08).align_to(panel_bg_rect, LEFT).shift(RIGHT * 0.1)

        rule_lbl = VGroup(
            Text("规律：", font=CJK, color=WHITE).scale(0.4),
        )
        rule_eq = VGroup(
            Text("水平切点数", font=CJK, color=GREEN).scale(0.38),
            MathTex(r":", color=WHITE).scale(0.6),
            Text("竖直切点数", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.1)
        rule_eq2 = VGroup(
            MathTex(r"= \omega_y", color=GREEN).scale(0.6),
            MathTex(r":", color=WHITE).scale(0.6),
            MathTex(r"\omega_x", color=ORANGE).scale(0.6),
        ).arrange(RIGHT, buff=0.1)

        rule_group = VGroup(rule_lbl, rule_eq, rule_eq2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        rule_group.next_to(panel_bg_rect.get_bottom(), UP, buff=0.25).align_to(panel_bg_rect, LEFT).shift(RIGHT * 0.2)

        self.play(FadeIn(panel_bg_rect), FadeIn(panel_title), FadeIn(rule_group))
        self.wait(0.4)

        case_labels = []
        current_liss = None

        for wx, wy, ratio_str, color in lissajous_cases:
            # 绘制李萨如图形
            new_liss = lissajous_freq(wx, wy, color=color)

            # 比率标注（面板内）
            case_row = VGroup(
                Text(f"ωx:ωy = {ratio_str}", font=CJK, color=color).scale(0.42),
                Text(f"  水平{wy}个  竖直{wx}个切点", font=CJK, color=WHITE).scale(0.38),
            ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

            # 放置在面板上方，逐渐堆叠
            if case_labels:
                case_row.next_to(case_labels[-1], DOWN, buff=0.2)
            else:
                case_row.next_to(panel_title, DOWN, buff=0.3)
            case_row.align_to(panel_bg_rect, LEFT).shift(RIGHT * 0.2)

            if current_liss is not None:
                self.play(
                    ReplacementTransform(current_liss, new_liss),
                    FadeIn(case_row),
                    run_time=1.5,
                )
            else:
                self.play(Create(new_liss), FadeIn(case_row), run_time=1.5)

            # 在主坐标系上标注频率比
            ratio_main_lbl = VGroup(
                Text("ωx:ωy=", font=CJK, color=color).scale(0.38),
                Text(ratio_str, font=CJK, color=color).scale(0.46),
            ).arrange(RIGHT, buff=0.06)
            ratio_main_lbl.next_to(main_ax, DOWN, buff=0.18)

            self.play(FadeIn(ratio_main_lbl))
            self.wait(1.8)
            self.play(FadeOut(ratio_main_lbl))

            current_liss = new_liss
            case_labels.append(case_row)

        self.wait(0.8)

        # ── Step 7: 椭圆方程与同频公式回顾 ─────────────────────────────────
        self.play(
            FadeOut(VGroup(current_liss, main_ax, panel_bg_rect, panel_title, rule_group, freq_title, *case_labels))
        )
        self.wait(0.3)

        recap_title = Text("同频垂直振动：椭圆方程", font=CJK, color=YELLOW).scale(0.5)
        recap_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(recap_title))

        ell_full = MathTex(
            r"\frac{x^{2}}{A_{1}^{2}} + \frac{y^{2}}{A_{2}^{2}} - \frac{2xy}{A_{1}A_{2}}\cos(\Delta\varphi) = \sin^{2}(\Delta\varphi)",
            color=YELLOW,
        ).scale(0.7)
        ell_full.next_to(recap_title, DOWN, buff=0.42)
        self.play(Write(ell_full))
        self.wait(1.0)

        cases_text = VGroup(
            VGroup(
                MathTex(r"\Delta\varphi = 0,\,\pi", color=GREEN).scale(0.7),
                MathTex(r"\Rightarrow", color=WHITE).scale(0.7),
                Text("斜直线段", font=CJK, color=GREEN).scale(0.44),
            ).arrange(RIGHT, buff=0.22),
            VGroup(
                MathTex(r"\Delta\varphi = \pm\dfrac{\pi}{2}", color=CYAN).scale(0.7),
                MathTex(r"\Rightarrow", color=WHITE).scale(0.7),
                Text("正椭圆（A₁=A₂ 时为圆）", font=CJK, color=CYAN).scale(0.44),
            ).arrange(RIGHT, buff=0.22),
        ).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        cases_text.next_to(ell_full, DOWN, buff=0.45)

        self.play(FadeIn(cases_text[0]))
        self.wait(0.8)
        self.play(FadeIn(cases_text[1]))
        self.wait(1.2)
        self.play(FadeOut(VGroup(recap_title, ell_full, cases_text)))

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("同频垂直振动：相位差决定形状", font=CJK, color=WHITE).scale(0.42),
        )
        s2 = MathTex(
            r"\frac{x^{2}}{A_{1}^{2}}+\frac{y^{2}}{A_{2}^{2}}-\frac{2xy}{A_{1}A_{2}}\cos\Delta\varphi=\sin^{2}\!\Delta\varphi",
            color=YELLOW,
        ).scale(0.65)
        s3 = VGroup(
            Text("不同频率比 → 李萨如图形", font=CJK, color=WHITE).scale(0.42),
        )
        s4 = VGroup(
            Text("水平切点数 : 竖直切点数 = ωy : ωx", font=CJK, color=CYAN).scale(0.42),
        )
        s5 = VGroup(
            Text("Δφ=0,π → 直线；Δφ=±π/2,A₁=A₂ → 圆", font=CJK, color=GREEN).scale(0.42),
        )

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s2))
        self.play(FadeIn(s1), FadeIn(s3), FadeIn(s4), FadeIn(s5))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch03Kp3PerpendicularLissajous",
        "id": "phys-ch03-3.2-kp3-perpendicular-lissajous",
        "chapterId": "ch03",
        "sectionId": "3.2",
        "title": "互相垂直振动的合成与李萨如图形",
        "description": "通过 ValueTracker 扫动相位差演示同频垂直振动的轨迹变化（直线→椭圆→圆），再展示频率比 1:2、1:3、2:3 时的稳定李萨如图形及切点数规律。",
    },
]
