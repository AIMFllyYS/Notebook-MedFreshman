"""第 3.1 节 · 旋转矢量法与初相位确定（知识点 KP3）。

物理动画范式：旋转矢量（相量）在单位圆上匀速旋转，
向 x 轴投影得到余弦振动 x=Acos(ωt+φ)；
下方坐标系同步描绘 x-t 波形；最终演示两种典型初始条件下初相位的几何意义。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ────────────────────────────────────────────────────────────────
A_VAL = 1.5        # 振幅（圆的半径，单位：Manim 单位）
OMEGA = 1.2        # 角频率 rad/s
T_PERIOD = 2 * math.pi / OMEGA   # 周期


class Ch03Kp3RotatingVectorMethod(Scene):
    def construct(self):

        # ════════════════════════════════════════════════════════════════════
        # Step 1 ── 标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("旋转矢量法与初相位确定", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2 ── 生活类比
        # ════════════════════════════════════════════════════════════════════
        a1 = Text("钟表的秒针匀速转圈，", font=CJK).scale(0.46)
        a2 = Text("把它的水平投影记录下来——就得到了余弦振动曲线。", font=CJK).scale(0.46)
        a3 = Text("旋转矢量法 就是用这一思路来分析简谐运动，帮助我们直觉判断初相位。",
                  font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55).scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3 ── 核心公式定义（逐行出现）
        # ════════════════════════════════════════════════════════════════════
        eq_x = MathTex(r"x(t)", r"=", r"A", r"\cos(", r"\omega t", r"+", r"\varphi", r")")
        eq_x.scale(0.9).next_to(title, DOWN, buff=0.55)
        eq_x[2].set_color(GREEN)    # A
        eq_x[4].set_color(ORANGE)   # ωt
        eq_x[6].set_color(YELLOW)   # φ

        lbl_A = VGroup(Text("A", font=CJK, color=GREEN).scale(0.38),
                       Text("= 振幅（矢量长度）", font=CJK).scale(0.38)).arrange(RIGHT, buff=0.1)
        lbl_phi = VGroup(Text("φ", font=CJK, color=YELLOW).scale(0.38),
                         Text("= 初相位（t=0 时矢量与 x 轴夹角）", font=CJK).scale(0.38)).arrange(RIGHT, buff=0.1)
        lbl_om = VGroup(Text("ω", font=CJK, color=ORANGE).scale(0.38),
                        Text("= 角频率（矢量旋转快慢）", font=CJK).scale(0.38)).arrange(RIGHT, buff=0.1)
        lbls = VGroup(lbl_A, lbl_om, lbl_phi).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        lbls.next_to(eq_x, DOWN, buff=0.32)

        self.play(Write(eq_x))
        self.wait(0.6)
        self.play(FadeIn(lbl_A))
        self.wait(0.4)
        self.play(FadeIn(lbl_om))
        self.wait(0.4)
        self.play(FadeIn(lbl_phi))
        self.wait(1.4)
        self.play(FadeOut(VGroup(eq_x, lbls)))

        # ════════════════════════════════════════════════════════════════════
        # Step 4 ── 旋转矢量场景搭建
        #   左侧：单位圆 + 旋转矢量 + 投影虚线
        #   右侧：x-t 坐标系同步描线
        # ════════════════════════════════════════════════════════════════════
        # ── 4a. 布局常量 ────────────────────────────────────────────────────
        CIRCLE_CENTER = np.array([-3.5, -0.2, 0])
        AXES_ORIGIN_X = 0.4   # x-t 坐标系左边界 Manim 坐标

        # ── 4b. 单位圆 ──────────────────────────────────────────────────────
        circle = Circle(radius=A_VAL, color=BLUE_C, stroke_width=2)
        circle.move_to(CIRCLE_CENTER)

        # 圆心十字
        cx_line = Line(CIRCLE_CENTER + LEFT * (A_VAL + 0.3),
                       CIRCLE_CENTER + RIGHT * (A_VAL + 0.3),
                       color=GREY, stroke_width=1.2)
        cy_line = Line(CIRCLE_CENTER + DOWN * (A_VAL + 0.3),
                       CIRCLE_CENTER + UP * (A_VAL + 0.3),
                       color=GREY, stroke_width=1.2)
        cx_lbl = MathTex(r"x").scale(0.5).next_to(cx_line.get_end(), RIGHT, buff=0.08)
        cy_lbl = MathTex(r"y").scale(0.5).next_to(cy_line.get_end(), UP, buff=0.08)

        circle_label = Text("旋转矢量", font=CJK, color=CYAN).scale(0.38)
        circle_label.next_to(circle, DOWN, buff=0.15)

        # ── 4c. ValueTracker 控制时间 ────────────────────────────────────────
        t_tracker = ValueTracker(0.0)

        # ── 4d. 初相位 φ = 0（一般演示）────────────────────────────────────
        phi_init = 0.0

        # ── 4e. 旋转矢量（always_redraw）────────────────────────────────────
        def vec_tip(phi0=phi_init):
            ang = OMEGA * t_tracker.get_value() + phi0
            return CIRCLE_CENTER + A_VAL * np.array([math.cos(ang), math.sin(ang), 0])

        rotating_vec = always_redraw(
            lambda: Arrow(
                start=CIRCLE_CENTER,
                end=vec_tip(),
                buff=0,
                color=YELLOW,
                stroke_width=4,
                max_tip_length_to_length_ratio=0.18,
            )
        )

        # 矢量尖端 Dot
        tip_dot = always_redraw(
            lambda: Dot(vec_tip(), color=YELLOW, radius=0.08)
        )

        # ── 4f. 投影虚线（矢量尖端 → x 轴）────────────────────────────────
        proj_line = always_redraw(
            lambda: DashedLine(
                start=vec_tip(),
                end=np.array([vec_tip()[0], CIRCLE_CENTER[1], 0]),
                color=CYAN,
                stroke_width=2,
                dash_length=0.12,
            )
        )
        proj_dot = always_redraw(
            lambda: Dot(
                np.array([vec_tip()[0], CIRCLE_CENTER[1], 0]),
                color=RED,
                radius=0.10,
            )
        )

        # ── 4g. x-t 坐标系 ──────────────────────────────────────────────────
        T_SHOW = T_PERIOD * 1.5   # 显示时间范围
        x_ax_len = 5.8
        y_ax_len = 3.2

        xt_axes = Axes(
            x_range=[0, T_SHOW, T_PERIOD / 2],
            y_range=[-A_VAL - 0.3, A_VAL + 0.3, A_VAL],
            x_length=x_ax_len,
            y_length=y_ax_len,
            axis_config={"color": BLUE_D, "include_tip": True, "stroke_width": 1.8},
        )
        xt_axes.shift(RIGHT * 2.8 + DOWN * 0.3)

        xt_x_lbl = MathTex(r"t").scale(0.5).next_to(xt_axes.x_axis.get_end(), DOWN, buff=0.12)
        xt_y_lbl = MathTex(r"x").scale(0.5).next_to(xt_axes.y_axis.get_end(), LEFT, buff=0.12)

        # ── 4h. 动态描线（x = A cos(ωt + φ)）──────────────────────────────
        curve_path_pts = []  # 存储历史点，用 VMobject 绘制

        traced_curve = VMobject(color=ORANGE, stroke_width=3)
        traced_curve.set_points_as_corners([[0, 0, 0]])  # 初始占位

        def update_curve(mob):
            t_now = t_tracker.get_value()
            pts = []
            steps = max(2, int(t_now / T_PERIOD * 80) + 2)
            for i in range(steps):
                t_i = t_now * i / (steps - 1)
                x_val = A_VAL * math.cos(OMEGA * t_i + phi_init)
                pt = xt_axes.c2p(t_i, x_val)
                pts.append(pt)
            if len(pts) >= 2:
                mob.set_points_smoothly(pts)
            else:
                mob.set_points_as_corners(pts * 2)

        traced_curve.add_updater(update_curve)

        # 当前时刻竖线（时间游标）
        time_cursor = always_redraw(
            lambda: DashedLine(
                start=xt_axes.c2p(t_tracker.get_value(), -A_VAL - 0.25),
                end=xt_axes.c2p(t_tracker.get_value(), A_VAL + 0.25),
                color=GREY,
                stroke_width=1.5,
            ) if t_tracker.get_value() <= T_SHOW - 0.01 else VMobject()
        )

        # ── 4i. 显示圆与坐标系 ──────────────────────────────────────────────
        self.play(
            Create(circle),
            Create(cx_line), Create(cy_line),
            FadeIn(cx_lbl), FadeIn(cy_lbl),
            FadeIn(circle_label),
        )
        self.play(
            Create(xt_axes), FadeIn(xt_x_lbl), FadeIn(xt_y_lbl)
        )
        self.wait(0.5)

        # ── 4j. 显示矢量与投影 ─────────────────────────────────────────────
        cap_vec = Text("矢量旋转一圈 = 一个完整周期", font=CJK, color=GREEN).scale(0.4)
        cap_vec.to_edge(DOWN, buff=0.4)

        self.add(rotating_vec, tip_dot, proj_line, proj_dot)
        self.add(traced_curve, time_cursor)
        self.play(FadeIn(cap_vec))
        self.wait(0.5)

        # ── 4k. 旋转一整圈（φ=0）──────────────────────────────────────────
        self.play(
            t_tracker.animate.set_value(T_PERIOD),
            run_time=6,
            rate_func=linear,
        )
        self.wait(1.0)
        self.play(FadeOut(cap_vec))

        # ════════════════════════════════════════════════════════════════════
        # Step 5 ── 投影 = 余弦位移 公式说明
        # ════════════════════════════════════════════════════════════════════
        formula_proj = MathTex(
            r"x", r"=", r"A", r"\cos(", r"\omega t", r"+", r"\varphi", r")"
        ).scale(0.78)
        formula_proj[2].set_color(GREEN)
        formula_proj[4].set_color(ORANGE)
        formula_proj[6].set_color(YELLOW)
        formula_proj.next_to(title, DOWN, buff=0.42)

        proj_explain = Text("红点在 x 轴上的坐标 = 矢量端点 x 分量 = 振子位移", font=CJK, color=CYAN).scale(0.38)
        proj_explain.next_to(formula_proj, DOWN, buff=0.22)

        self.play(Write(formula_proj))
        self.play(FadeIn(proj_explain))
        self.wait(1.8)
        self.play(FadeOut(proj_explain))

        # ════════════════════════════════════════════════════════════════════
        # Step 6 ── 清场，准备演示初始条件
        # ════════════════════════════════════════════════════════════════════
        # 移除 updater 避免后续干扰
        traced_curve.remove_updater(update_curve)

        self.play(
            FadeOut(VGroup(
                circle, cx_line, cy_line, cx_lbl, cy_lbl, circle_label,
                xt_axes, xt_x_lbl, xt_y_lbl,
                rotating_vec, tip_dot, proj_line, proj_dot,
                traced_curve, time_cursor, formula_proj,
            ))
        )
        self.wait(0.4)

        # ════════════════════════════════════════════════════════════════════
        # Step 7 ── 初相位推导公式
        # ════════════════════════════════════════════════════════════════════
        derive_title = Text("初相位的确定", font=CJK, color=BLUE).scale(0.52)
        derive_title.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(derive_title))

        # 振幅公式
        amp_eq = MathTex(
            r"A = \sqrt{x_{0}^{2} + \frac{v_{0}^{2}}{\omega^{2}}}"
        ).scale(0.82)
        amp_eq.next_to(derive_title, DOWN, buff=0.38)
        amp_lbl = VGroup(
            Text("其中", font=CJK).scale(0.38),
            MathTex(r"x_0 = x(0)").scale(0.65),
            Text("为初位移，", font=CJK).scale(0.38),
            MathTex(r"v_0 = \dot{x}(0)").scale(0.65),
            Text("为初速度", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        amp_lbl.next_to(amp_eq, DOWN, buff=0.22).scale_to_fit_width(12)

        self.play(Write(amp_eq))
        self.play(FadeIn(amp_lbl))
        self.wait(1.0)

        # 初相角公式
        phi_eq = MathTex(
            r"\tan\varphi = -\frac{v_{0}}{\omega\, x_{0}}"
        ).scale(0.82)
        phi_eq.next_to(amp_lbl, DOWN, buff=0.32)
        phi_warn = Text("注意：tan φ 有两个解，需结合 x₀ 和 v₀ 的符号用象限判断！",
                        font=CJK, color=RED).scale(0.38)
        phi_warn.next_to(phi_eq, DOWN, buff=0.22)

        self.play(Write(phi_eq))
        self.wait(0.5)
        self.play(FadeIn(phi_warn))
        self.wait(1.8)
        self.play(FadeOut(VGroup(derive_title, amp_eq, amp_lbl, phi_eq, phi_warn)))

        # ════════════════════════════════════════════════════════════════════
        # Step 8 ── 典型初始条件演示（辅助函数）
        # ════════════════════════════════════════════════════════════════════

        def show_initial_condition(phi0, label_zh, x0_str, v0_str, color_phi, quadrant_hint):
            """
            在单位圆上展示给定初相位 phi0 对应的矢量位置，
            并标注初始条件与初相位。
            """
            # 圆
            circ = Circle(radius=A_VAL, color=BLUE_C, stroke_width=2)
            circ.move_to(CIRCLE_CENTER)
            h_ax = Line(CIRCLE_CENTER + LEFT * (A_VAL + 0.4),
                        CIRCLE_CENTER + RIGHT * (A_VAL + 0.4), color=GREY, stroke_width=1.2)
            v_ax = Line(CIRCLE_CENTER + DOWN * (A_VAL + 0.4),
                        CIRCLE_CENTER + UP * (A_VAL + 0.4), color=GREY, stroke_width=1.2)

            # 矢量端点
            tip = CIRCLE_CENTER + A_VAL * np.array([math.cos(phi0), math.sin(phi0), 0])

            # 矢量
            vec = Arrow(CIRCLE_CENTER, tip, buff=0, color=color_phi,
                        stroke_width=4, max_tip_length_to_length_ratio=0.2)

            # 投影点
            x_proj = np.array([tip[0], CIRCLE_CENTER[1], 0])
            dashed = DashedLine(tip, x_proj, color=CYAN, stroke_width=2, dash_length=0.12)
            dot_proj = Dot(x_proj, color=RED, radius=0.09)

            # 初相位弧线
            arc_sign = -1 if phi0 < 0 else 1
            arc = Arc(
                radius=A_VAL * 0.45,
                start_angle=0,
                angle=phi0,
                arc_center=CIRCLE_CENTER,
                color=color_phi,
                stroke_width=2,
            )

            # 右侧文字说明
            cond_title = Text(label_zh, font=CJK, color=color_phi).scale(0.48)
            cond_title.to_edge(RIGHT, buff=0.4).shift(UP * 1.5)

            x0_row = VGroup(
                Text("初位移  ", font=CJK).scale(0.38),
                MathTex(x0_str).scale(0.7),
            ).arrange(RIGHT, buff=0.1)
            v0_row = VGroup(
                Text("初速度  ", font=CJK).scale(0.38),
                MathTex(v0_str).scale(0.7),
            ).arrange(RIGHT, buff=0.1)
            phi_row = VGroup(
                Text("初相位  ", font=CJK).scale(0.38),
                MathTex(r"\varphi = " + quadrant_hint, color=color_phi).scale(0.7),
            ).arrange(RIGHT, buff=0.1)
            info_box = VGroup(x0_row, v0_row, phi_row).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
            info_box.next_to(cond_title, DOWN, buff=0.3)
            info_box.to_edge(RIGHT, buff=0.5)

            # 象限提示
            hint = Text(
                "矢量在" + ("第四" if phi0 < 0 else "第一/二") + "象限",
                font=CJK, color=GREEN
            ).scale(0.38)
            hint.next_to(info_box, DOWN, buff=0.28)

            objs = VGroup(circ, h_ax, v_ax, vec, dashed, dot_proj, arc,
                          cond_title, info_box, hint)

            self.play(Create(circ), Create(h_ax), Create(v_ax))
            self.play(Create(vec), Create(arc))
            self.play(Create(dashed), FadeIn(dot_proj))
            self.play(FadeIn(cond_title), FadeIn(info_box))
            self.play(FadeIn(hint))
            self.wait(2.2)
            self.play(FadeOut(objs))

        # ── 8a. 案例 (a)：x₀ = A/2，v₀ > 0 → φ = -π/3 ─────────────────
        case_a_title = Text("初始条件 (a)", font=CJK, color=ORANGE).scale(0.48)
        case_a_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(case_a_title))
        self.wait(0.4)
        self.play(FadeOut(case_a_title))

        show_initial_condition(
            phi0=-math.pi / 3,
            label_zh="条件 (a)：x₀ = A/2，v₀ > 0",
            x0_str=r"x_0 = \tfrac{A}{2}",
            v0_str=r"v_0 > 0",
            color_phi=ORANGE,
            quadrant_hint=r"-\tfrac{\pi}{3}",
        )

        # ── 8b. 案例 (b)：x₀ = 0，v₀ < 0 → φ = π/2 ──────────────────────
        case_b_title = Text("初始条件 (b)", font=CJK, color=GREEN).scale(0.48)
        case_b_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(case_b_title))
        self.wait(0.4)
        self.play(FadeOut(case_b_title))

        show_initial_condition(
            phi0=math.pi / 2,
            label_zh="条件 (b)：x₀ = 0，v₀ < 0",
            x0_str=r"x_0 = 0",
            v0_str=r"v_0 < 0",
            color_phi=GREEN,
            quadrant_hint=r"\tfrac{\pi}{2}",
        )

        # ════════════════════════════════════════════════════════════════════
        # Step 9 ── 象限判断规则总结
        # ════════════════════════════════════════════════════════════════════
        rule_title = Text("象限速判法则", font=CJK, color=BLUE).scale(0.52)
        rule_title.next_to(title, DOWN, buff=0.42)

        r1 = VGroup(
            Text("x₀ > 0，v₀ > 0", font=CJK, color=CYAN).scale(0.4),
            Text("→ 矢量在第四象限，φ ∈ (−π/2, 0)", font=CJK).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        r2 = VGroup(
            Text("x₀ > 0，v₀ < 0", font=CJK, color=CYAN).scale(0.4),
            Text("→ 矢量在第一象限，φ ∈ (0, π/2)", font=CJK).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        r3 = VGroup(
            Text("x₀ < 0，v₀ > 0", font=CJK, color=CYAN).scale(0.4),
            Text("→ 矢量在第三象限，φ ∈ (−π, −π/2)", font=CJK).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        r4 = VGroup(
            Text("x₀ < 0，v₀ < 0", font=CJK, color=CYAN).scale(0.4),
            Text("→ 矢量在第二象限，φ ∈ (π/2, π)", font=CJK).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        rules = VGroup(r1, r2, r3, r4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        rules.next_to(rule_title, DOWN, buff=0.32).scale_to_fit_width(12.5)

        self.play(FadeIn(rule_title))
        for r in [r1, r2, r3, r4]:
            self.play(FadeIn(r))
            self.wait(0.5)
        self.wait(1.2)
        self.play(FadeOut(VGroup(rule_title, rules)))

        # ════════════════════════════════════════════════════════════════════
        # Step 10 ── 小结卡
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(r"x(t) = A\cos(\omega t + \varphi)", color=YELLOW).scale(0.82)
        s2 = MathTex(
            r"A = \sqrt{x_{0}^{2} + \dfrac{v_{0}^{2}}{\omega^{2}}}",
            color=GREEN,
        ).scale(0.78)
        s3 = MathTex(r"\tan\varphi = -\dfrac{v_{0}}{\omega\,x_{0}}", color=ORANGE).scale(0.78)

        s_hint = Text("用象限（x₀, v₀ 的正负）唯一确定初相位 φ",
                      font=CJK, color=CYAN).scale(0.42)

        card = VGroup(s1, s2, s3, s_hint).arrange(DOWN, buff=0.38)
        card.next_to(s_title, DOWN, buff=0.4).scale_to_fit_width(11.5)
        box = SurroundingRectangle(card, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.4)
        self.play(Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(FadeIn(s_hint), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, card, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch03Kp3RotatingVectorMethod",
        "id": "phys-ch03-3.1-kp3-rotating-vector-method",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "旋转矢量法与初相位确定",
        "description": "用旋转矢量在圆上的投影演示 x=Acos(ωt+φ)，ValueTracker 同步描绘余弦波形，并通过两种典型初始条件演示初相位的几何确定方法。",
    },
]
