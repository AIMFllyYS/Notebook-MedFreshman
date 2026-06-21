"""第 3.1 节 · 简谐振动方程的建立与三要素

金标准范本对齐：函数曲线类（参见 ch04/scene_4_1_kp1_plane_wave.py）
核心可视化策略：
  - 弹簧振子物理模型（弹簧 + 小球 + 平衡位置标记）
  - ValueTracker 驱动小球左右运动，回复力箭头实时更新
  - 微分方程逐行出现，关键项变色高亮
  - x-t 曲线上方独立坐标系，ValueTracker 动态改变 A/ω/φ

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch03Kp2ShmEquationDerivation(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("简谐振动方程的建立与三要素", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        analogy1 = Text("弹簧挂着一个小球，拉开后放手——", font=CJK).scale(0.5)
        analogy2 = Text("小球会来回振动，越拉越远，弹力越大，而且总是指向平衡位置。", font=CJK).scale(0.48)
        analogy3 = Text("这就是简谐振动，自然界中最基本的振动形式。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(analogy1))
        self.wait(0.6)
        self.play(FadeIn(analogy2))
        self.wait(0.6)
        self.play(FadeIn(analogy3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 弹簧振子物理模型 ─────────────────────────────────────
        # 坐标轴（水平）
        axis_line = Line(LEFT * 5.5, RIGHT * 5.5, color=WHITE, stroke_width=1.5).shift(DOWN * 1.2)
        axis_arrow = Arrow(LEFT * 5.5, RIGHT * 5.5, buff=0, color=WHITE, stroke_width=1.5,
                           tip_length=0.2).shift(DOWN * 1.2)
        x_label = MathTex(r"x").scale(0.6).next_to(axis_arrow.get_end(), DOWN, buff=0.1)

        # 平衡位置 O
        eq_pos_x = 0.0  # 平衡位置 x 坐标（场景坐标）
        eq_dot = Dot(point=np.array([eq_pos_x, -1.2, 0]), color=WHITE, radius=0.06)
        eq_label = MathTex(r"O").scale(0.55).next_to(eq_dot, DOWN, buff=0.15)

        # 固定墙（左端）
        wall_x = -4.5
        wall = Line(np.array([wall_x, -0.8, 0]), np.array([wall_x, -1.6, 0]),
                    color=GRAY, stroke_width=4)
        # 墙的纹路（斜线）
        hatches = VGroup(*[
            Line(np.array([wall_x, -0.8 - i * 0.2, 0]),
                 np.array([wall_x - 0.25, -0.8 - i * 0.2 + 0.1, 0]),
                 color=GRAY, stroke_width=1.5)
            for i in range(4)
        ])

        # 弹簧（用折线段模拟）
        spring_start_x = wall_x
        spring_y = -1.2
        ball_x = ValueTracker(1.8)  # 小球初始 x 位置（平衡位右侧）

        def make_spring(ball_x_val):
            n_coils = 8
            coil_w = 0.18
            start = np.array([spring_start_x, spring_y, 0])
            end_x = ball_x_val - 0.28
            seg_len = (end_x - spring_start_x) / (n_coils * 2 + 2)
            pts = [start]
            for i in range(n_coils * 2 + 1):
                base_x = spring_start_x + (i + 1) * seg_len
                y_off = coil_w if i % 2 == 0 else -coil_w
                pts.append(np.array([base_x, spring_y + y_off, 0]))
            pts.append(np.array([end_x, spring_y, 0]))
            return VMobject(color=GRAY_B, stroke_width=2.2).set_points_as_corners(pts)

        spring = always_redraw(lambda: make_spring(ball_x.get_value()))

        # 小球
        def make_ball():
            bx = ball_x.get_value()
            return Circle(radius=0.28, color=ORANGE, fill_opacity=0.85).move_to(
                np.array([bx, -1.2, 0]))

        ball = always_redraw(make_ball)

        # 位移标注（从 O 到小球的双向箭头）
        def make_x_arrow():
            bx = ball_x.get_value()
            if abs(bx - eq_pos_x) < 0.05:
                return VGroup()
            start = np.array([eq_pos_x, -1.65, 0])
            end = np.array([bx, -1.65, 0])
            arr = DoubleArrow(start, end, buff=0, color=CYAN,
                              tip_length=0.14, stroke_width=2)
            lbl = MathTex(r"x").scale(0.5).set_color(CYAN)
            lbl.next_to(arr, DOWN, buff=0.08)
            return VGroup(arr, lbl)

        x_arrow = always_redraw(make_x_arrow)

        # 回复力箭头 F = -kx
        k_spring = 1.5  # 用于可视化（实际值）

        def make_force_arrow():
            bx = ball_x.get_value()
            displacement = bx - eq_pos_x
            if abs(displacement) < 0.05:
                return VGroup()
            force_mag = -k_spring * displacement  # F = -kx
            scale = 0.65
            arrow_len = force_mag * scale
            start = np.array([bx, -1.2, 0])
            end = np.array([bx + arrow_len, -1.2, 0])
            col = BLUE if displacement > 0 else RED
            arr = Arrow(start, end, buff=0, color=col,
                        tip_length=0.2, stroke_width=3)
            flbl = VGroup(
                MathTex(r"F").scale(0.5).set_color(col),
                MathTex(r"=").scale(0.45),
                MathTex(r"-kx").scale(0.5).set_color(col),
            ).arrange(RIGHT, buff=0.05)
            flbl.next_to(arr, UP, buff=0.12)
            return VGroup(arr, flbl)

        force_arrow = always_redraw(make_force_arrow)

        # 显示模型
        model_group = VGroup(axis_arrow, eq_dot, eq_label, wall, hatches, x_label)
        self.play(Create(axis_arrow), FadeIn(wall), FadeIn(hatches), FadeIn(eq_dot),
                  FadeIn(eq_label), FadeIn(x_label))
        self.play(Create(spring), FadeIn(ball))
        self.play(FadeIn(x_arrow), FadeIn(force_arrow))

        # 模型说明
        model_cap = Text("弹簧振子：小球偏离平衡位置 O，弹力指向 O（回复力）",
                         font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(model_cap))
        self.wait(1.5)

        # ── Step 4: 小球动态运动 ──────────────────────────────────────────
        motion_cap = Text("正方向（右）时回复力向左（蓝），负方向（左）时回复力向右（红）",
                          font=CJK, color=WHITE).scale(0.38).to_edge(DOWN, buff=0.55)
        self.play(FadeOut(model_cap), FadeIn(motion_cap))

        # 小球振动动画
        self.play(ball_x.animate.set_value(-1.8), run_time=1.8, rate_func=there_and_back)
        self.wait(0.3)
        self.play(ball_x.animate.set_value(1.8), run_time=1.0)
        self.play(ball_x.animate.set_value(-1.8), run_time=1.8, rate_func=there_and_back)
        self.wait(0.5)
        self.play(ball_x.animate.set_value(1.8), run_time=0.8)
        self.wait(0.8)

        # 清场弹簧振子
        self.play(FadeOut(VGroup(
            axis_arrow, eq_dot, eq_label, wall, hatches, x_label,
            x_arrow, force_arrow, motion_cap
        )))
        # spring 和 ball 是 always_redraw，需单独清场
        self.play(FadeOut(spring), FadeOut(ball))

        # ── Step 5: 微分方程推导（逐行出现，高亮关键项）───────────────────
        derive_cap = Text("根据牛顿第二定律，建立运动方程：", font=CJK, color=BLUE).scale(0.48)
        derive_cap.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(derive_cap))

        # 第一行：F = ma → m d²x/dt² = -kx
        eq1_lhs = MathTex(r"m\,\frac{d^{2}x}{dt^{2}}", color=WHITE).scale(0.85)
        eq1_eq = MathTex(r"=").scale(0.85)
        eq1_rhs = MathTex(r"-kx", color=YELLOW).scale(0.85)
        eq1 = VGroup(eq1_lhs, eq1_eq, eq1_rhs).arrange(RIGHT, buff=0.15)
        eq1.next_to(derive_cap, DOWN, buff=0.55)

        self.play(Write(eq1_lhs))
        self.wait(0.5)
        self.play(Write(eq1_eq), Write(eq1_rhs))
        self.wait(1.0)

        # 第二行：令 ω² = k/m
        label_let = Text("令", font=CJK, color=GREEN).scale(0.48)
        eq_omega_def = MathTex(r"\omega^{2} = \dfrac{k}{m}", color=GREEN).scale(0.8)
        row2 = VGroup(label_let, eq_omega_def).arrange(RIGHT, buff=0.2)
        row2.next_to(eq1, DOWN, buff=0.45)
        self.play(FadeIn(label_let), Write(eq_omega_def))
        self.wait(1.0)

        # 第三行：标准形式
        label_std = Text("标准形式：", font=CJK, color=YELLOW).scale(0.48)
        eq_std = MathTex(r"\frac{d^{2}x}{dt^{2}} + \omega^{2}x = 0", color=YELLOW).scale(0.85)
        eq_std[0][8:14].set_color(GREEN)   # ω² 高亮绿色
        row3_math = VGroup(label_std, eq_std).arrange(RIGHT, buff=0.2)
        row3_math.next_to(row2, DOWN, buff=0.45)
        self.play(FadeIn(label_std), Write(eq_std))

        box_eq = SurroundingRectangle(eq_std, color=YELLOW, buff=0.18, corner_radius=0.1)
        self.play(Create(box_eq))
        self.wait(1.8)

        # 清场推导
        self.play(FadeOut(VGroup(derive_cap, eq1, row2, row3_math, box_eq)))

        # ── Step 6: 通解 x = A cos(ωt + φ) ─────────────────────────────
        sol_cap = Text("微分方程的通解（简谐振动规律）：", font=CJK, color=BLUE).scale(0.48)
        sol_cap.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(sol_cap))

        eq_sol = MathTex(r"x(t)", r"=", r"A", r"\cos(", r"\omega t", r"+", r"\varphi",
                         r")").scale(1.0)
        eq_sol[2].set_color(RED)       # A 振幅
        eq_sol[4].set_color(GREEN)     # ωt 角频率
        eq_sol[6].set_color(ORANGE)    # φ 初相
        eq_sol.next_to(sol_cap, DOWN, buff=0.5)
        self.play(Write(eq_sol))
        self.wait(0.8)

        # 三要素标注
        legend_A = VGroup(
            Text("A", font=CJK, color=RED).scale(0.5),
            Text(" — 振幅（最大位移）", font=CJK).scale(0.45),
        ).arrange(RIGHT, buff=0.1)
        legend_w = VGroup(
            MathTex(r"\omega", color=GREEN).scale(0.6),
            Text(" — 角频率（决定周期）", font=CJK).scale(0.45),
        ).arrange(RIGHT, buff=0.1)
        legend_p = VGroup(
            MathTex(r"\varphi", color=ORANGE).scale(0.6),
            Text(" — 初相（决定起点位置）", font=CJK).scale(0.45),
        ).arrange(RIGHT, buff=0.1)
        legend_T = VGroup(
            MathTex(r"T = \dfrac{2\pi}{\omega} = 2\pi\sqrt{\dfrac{m}{k}}", color=CYAN).scale(0.7),
        )
        legend = VGroup(legend_A, legend_w, legend_p, legend_T).arrange(DOWN, buff=0.32,
                                                                         aligned_edge=LEFT)
        legend.next_to(eq_sol, DOWN, buff=0.45)
        self.play(FadeIn(legend_A))
        self.wait(0.5)
        self.play(FadeIn(legend_w))
        self.wait(0.5)
        self.play(FadeIn(legend_p))
        self.wait(0.5)
        self.play(Write(legend_T[0]))
        self.wait(1.5)

        self.play(FadeOut(VGroup(sol_cap, eq_sol, legend)))

        # ── Step 7: x-t 曲线可视化（上方坐标系） ──────────────────────────
        xt_cap = Text("x-t 曲线：观察三要素如何影响振动图像", font=CJK, color=BLUE).scale(0.48)
        xt_cap.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(xt_cap))

        axes_xt = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-2.5, 2.5, 1],
            x_length=10.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.5)
        x_lbl_xt = MathTex(r"t").scale(0.6).next_to(axes_xt.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_xt = MathTex(r"x").scale(0.6).next_to(axes_xt.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes_xt), FadeIn(x_lbl_xt), FadeIn(y_lbl_xt))

        # ValueTrackers for A, ω, φ
        A_vt = ValueTracker(1.5)
        omega_vt = ValueTracker(1.0)
        phi_vt = ValueTracker(0.0)

        curve_xt = always_redraw(
            lambda: axes_xt.plot(
                lambda t: A_vt.get_value() * math.cos(omega_vt.get_value() * t + phi_vt.get_value()),
                x_range=[0, 4 * PI],
                color=YELLOW,
            )
        )
        self.play(Create(curve_xt))
        self.wait(0.5)

        # 参数标签（动态更新）
        def make_param_label():
            a_val = A_vt.get_value()
            w_val = omega_vt.get_value()
            p_val = phi_vt.get_value()
            t1 = VGroup(
                Text("A=", font=CJK, color=RED).scale(0.42),
                MathTex(rf"{a_val:.1f}", color=RED).scale(0.55),
            ).arrange(RIGHT, buff=0.05)
            t2 = VGroup(
                MathTex(r"\omega=", color=GREEN).scale(0.55),
                MathTex(rf"{w_val:.1f}", color=GREEN).scale(0.55),
            ).arrange(RIGHT, buff=0.05)
            t3 = VGroup(
                MathTex(r"\varphi=", color=ORANGE).scale(0.55),
                MathTex(rf"{p_val:.2f}", color=ORANGE).scale(0.55),
            ).arrange(RIGHT, buff=0.05)
            grp = VGroup(t1, t2, t3).arrange(RIGHT, buff=0.45)
            grp.to_edge(DOWN, buff=0.5)
            return grp

        param_label = always_redraw(make_param_label)
        self.play(FadeIn(param_label))
        self.wait(0.8)

        # 改变振幅 A：峰值升高
        cap_A = Text("改变振幅 A：曲线峰值升高（振动剧烈程度增大）",
                     font=CJK, color=RED).scale(0.42).next_to(axes_xt, UP, buff=0.1)
        self.play(FadeIn(cap_A))
        self.play(A_vt.animate.set_value(2.2), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(A_vt.animate.set_value(0.8), run_time=1.5, rate_func=smooth)
        self.wait(0.8)
        self.play(A_vt.animate.set_value(1.5), run_time=1.0)
        self.play(FadeOut(cap_A))
        self.wait(0.5)

        # 改变角频率 ω：周期变化
        cap_w = Text("改变角频率 ω：ω 越大，周期越短，振动越快",
                     font=CJK, color=GREEN).scale(0.42).next_to(axes_xt, UP, buff=0.1)
        self.play(FadeIn(cap_w))
        self.play(omega_vt.animate.set_value(2.0), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(omega_vt.animate.set_value(0.5), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(omega_vt.animate.set_value(1.0), run_time=1.0)
        self.play(FadeOut(cap_w))
        self.wait(0.5)

        # 改变初相 φ：曲线整体左右平移
        cap_p = Text("改变初相 φ：曲线整体左移或右移（起点位置改变）",
                     font=CJK, color=ORANGE).scale(0.42).next_to(axes_xt, UP, buff=0.1)
        self.play(FadeIn(cap_p))
        self.play(phi_vt.animate.set_value(PI / 2), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(phi_vt.animate.set_value(-PI / 2), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(phi_vt.animate.set_value(0.0), run_time=1.0)
        self.play(FadeOut(cap_p))
        self.wait(0.5)

        # 清场坐标系
        self.play(FadeOut(VGroup(axes_xt, x_lbl_xt, y_lbl_xt, curve_xt, param_label, xt_cap)))

        # ── Step 8: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结：简谐振动三要素", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        sum_eq1 = MathTex(r"\frac{d^{2}x}{dt^{2}} + \omega^{2}x = 0,\quad"
                          r"\omega = \sqrt{\dfrac{k}{m}}",
                          color=YELLOW).scale(0.75)
        sum_eq2 = MathTex(r"x(t) = A\cos(\omega t + \varphi)", color=YELLOW).scale(0.85)
        sum_eq3 = MathTex(r"T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{m}{k}}", color=CYAN).scale(0.8)

        note_A = VGroup(
            MathTex(r"A", color=RED).scale(0.65),
            Text("— 振幅，由初始条件决定", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        note_w = VGroup(
            MathTex(r"\omega", color=GREEN).scale(0.65),
            Text("— 角频率，由系统本身 (k, m) 决定", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        note_p = VGroup(
            MathTex(r"\varphi", color=ORANGE).scale(0.65),
            Text("— 初相，由初始位移和速度决定", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        summary_group = VGroup(sum_eq1, sum_eq2, sum_eq3, note_A, note_w, note_p).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT
        ).next_to(s_title, DOWN, buff=0.42)
        summary_group.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(sum_eq1))
        self.wait(0.5)
        self.play(Write(sum_eq2))
        self.wait(0.5)
        self.play(Write(sum_eq3))
        self.wait(0.5)
        self.play(FadeIn(note_A), FadeIn(note_w), FadeIn(note_p))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch03Kp2ShmEquationDerivation",
        "id": "phys-ch03-3.1-kp2-shm-equation-derivation",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "简谐振动方程的建立与三要素",
        "description": "从弹簧振子受力出发推导微分方程，化简为标准形式，给出通解 x=Acos(ωt+φ)，用 ValueTracker 动态演示振幅、角频率、初相对 x-t 曲线的影响。",
    },
]
