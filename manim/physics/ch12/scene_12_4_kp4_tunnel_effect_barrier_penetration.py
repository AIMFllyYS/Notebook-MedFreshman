"""第 12.4 节 · 势垒穿透与隧道效应（Tunnel Effect & Barrier Penetration）

三幕结构：
  幕一 —— 经典粒子 vs 量子波函数：势垒图 + ValueTracker 控制宽度 a
  幕二 —— STM 原理：隧穿电流 I ∝ e^{-2κd}，对数坐标条形图
  幕三 —— α衰变类比：库仑势垒示意 + 与 STM 同一数学形式

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch12Kp4TunnelEffectBarrierPenetration(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════
        title = Text("势垒穿透与隧道效应", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第12章 量子力学初步 · 12.4", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════
        ana1 = Text("经典世界：没有足够能量就无法翻过墙壁，", font=CJK).scale(0.48)
        ana2 = Text("如同球滚不过高山——非此即彼，", font=CJK).scale(0.48)
        ana3 = Text("但在量子世界，粒子能穿墙而过！", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.2).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════
        # Step 3: 幕一 —— 势垒示意图（静态框架）
        # ══════════════════════════════════════════════════════
        act1_label = Text("幕一：经典粒子 vs 量子粒子", font=CJK, color=CYAN).scale(0.46)
        act1_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(act1_label))
        self.wait(0.5)

        # 坐标系：x 轴是位置，y 轴是能量/波函数
        barrier_axes = Axes(
            x_range=[-5, 8, 1],
            y_range=[-0.3, 2.8, 1],
            x_length=10,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.8)

        x_lab = MathTex(r"x").scale(0.55).next_to(barrier_axes.x_axis.get_end(), DOWN, buff=0.12)
        e_lab = MathTex(r"E / U").scale(0.55).next_to(barrier_axes.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(barrier_axes), FadeIn(x_lab), FadeIn(e_lab))
        self.wait(0.4)

        # 势垒参数
        U0 = 2.0  # 势垒高度
        E_particle = 1.2  # 粒子能量
        a_val = 2.0  # 势垒初始宽度（x 单位：-1 到 1）

        # 势垒区域（矩形）: x in [0, a_val]
        def barrier_rect(a):
            pts = [
                barrier_axes.c2p(0, 0),
                barrier_axes.c2p(0, U0),
                barrier_axes.c2p(a, U0),
                barrier_axes.c2p(a, 0),
            ]
            return Polygon(*pts, color=ORANGE, fill_color=ORANGE, fill_opacity=0.35)

        barrier = barrier_rect(a_val)
        self.play(Create(barrier))

        # 势垒高度标注 U₀
        u0_line = DashedLine(
            barrier_axes.c2p(-5, U0), barrier_axes.c2p(8, U0),
            color=ORANGE, stroke_width=1.5
        )
        u0_label = VGroup(
            MathTex(r"U_0", color=ORANGE).scale(0.55),
        ).next_to(barrier_axes.c2p(-5, U0), LEFT, buff=0.15)
        self.play(Create(u0_line), FadeIn(u0_label))

        # 粒子能量线 E
        e_line = DashedLine(
            barrier_axes.c2p(-5, E_particle), barrier_axes.c2p(8, E_particle),
            color=YELLOW, stroke_width=1.5
        )
        e_label = VGroup(
            MathTex(r"E", color=YELLOW).scale(0.55),
        ).next_to(barrier_axes.c2p(-5, E_particle), LEFT, buff=0.15)
        self.play(Create(e_line), FadeIn(e_label))

        cond_text = Text("E < U₀", font=CJK, color=RED).scale(0.42)
        cond_text.next_to(barrier_axes, DOWN, buff=0.2)
        self.play(FadeIn(cond_text))
        self.wait(0.8)

        # ── 经典粒子：实心球被反弹 ──────────────────────────────
        classic_label = Text("经典粒子：完全反弹", font=CJK, color=RED).scale(0.42)
        classic_label.to_edge(RIGHT).shift(UP * 0.5)
        classic_ball = Dot(barrier_axes.c2p(-4, E_particle), color=RED, radius=0.15)
        self.play(FadeIn(classic_label), FadeIn(classic_ball))
        # 球向右运动然后被弹回
        self.play(
            classic_ball.animate.move_to(barrier_axes.c2p(-0.3, E_particle)),
            run_time=1.0
        )
        self.play(
            classic_ball.animate.move_to(barrier_axes.c2p(-4, E_particle)),
            run_time=1.0
        )
        self.wait(0.5)
        self.play(FadeOut(classic_ball), FadeOut(classic_label))

        # ── 量子粒子：波函数在三个区域 ──────────────────────────
        quantum_label = Text("量子粒子：波函数穿透势垒", font=CJK, color=GREEN).scale(0.42)
        quantum_label.to_edge(RIGHT).shift(UP * 0.5)
        self.play(FadeIn(quantum_label))

        k_inc = 1.2   # 入射区波数（与 E 对应）
        kappa = 1.1   # 势垒内衰减常数
        T_amp = 0.38  # 透射波振幅（< 入射振幅 1.0）

        # 入射波：x in [-5, 0]
        inc_wave = barrier_axes.plot(
            lambda x: math.cos(k_inc * x) if x <= 0 else 0,
            x_range=[-5, 0, 0.05],
            color=YELLOW,
        )
        # 势垒内：指数衰减 x in [0, a_val]
        decay_wave = barrier_axes.plot(
            lambda x: math.exp(-kappa * x) if 0 < x <= a_val else 0,
            x_range=[0, a_val, 0.05],
            color=CYAN,
        )
        # 透射波：x in [a_val, 8]，振幅缩小
        trans_wave = barrier_axes.plot(
            lambda x: T_amp * math.cos(k_inc * (x - a_val)) if x > a_val else 0,
            x_range=[a_val, 8, 0.05],
            color=GREEN,
        )

        self.play(Create(inc_wave))
        self.wait(0.3)

        decay_note = Text("势垒内：指数衰减", font=CJK, color=CYAN).scale(0.38)
        decay_note.next_to(barrier_axes.c2p(1, 1.5), UP, buff=0.1)
        self.play(Create(decay_wave), FadeIn(decay_note))
        self.wait(0.4)

        trans_note = Text("透射波：振幅减小但不为零", font=CJK, color=GREEN).scale(0.38)
        trans_note.next_to(barrier_axes.c2p(5, 1.0), UP, buff=0.1)
        self.play(Create(trans_wave), FadeIn(trans_note))
        self.wait(1.2)

        # ── 核心公式：透射率 T ──────────────────────────────────
        T_formula = MathTex(
            r"T \propto e^{-2\kappa a},\quad \kappa = \sqrt{\frac{2m(U_0-E)}{\hbar^2}}"
        ).scale(0.62)
        T_formula.set_color(YELLOW)
        T_formula.next_to(barrier_axes, DOWN, buff=0.15)
        self.play(FadeOut(cond_text), Write(T_formula))
        self.wait(1.5)

        # 清除波函数和注释，保留坐标系、势垒、公式为下一步铺垫
        self.play(
            FadeOut(inc_wave), FadeOut(decay_wave), FadeOut(trans_wave),
            FadeOut(decay_note), FadeOut(trans_note),
            FadeOut(quantum_label),
        )
        self.wait(0.4)

        # ══════════════════════════════════════════════════════
        # Step 4: ValueTracker 控制势垒宽度 a，演示 T 随 a 指数衰减
        # ══════════════════════════════════════════════════════
        tracker_label = Text("改变势垒宽度 a，观察透射率 T 变化", font=CJK, color=CYAN).scale(0.44)
        tracker_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeOut(act1_label), FadeIn(tracker_label))

        a_tracker = ValueTracker(1.0)

        # 动态势垒矩形
        dyn_barrier = always_redraw(
            lambda: Polygon(
                barrier_axes.c2p(0, 0),
                barrier_axes.c2p(0, U0),
                barrier_axes.c2p(a_tracker.get_value(), U0),
                barrier_axes.c2p(a_tracker.get_value(), 0),
                color=ORANGE, fill_color=ORANGE, fill_opacity=0.35,
            )
        )
        self.play(FadeOut(barrier), FadeIn(dyn_barrier))

        # 动态入射波（固定）
        dyn_inc = always_redraw(
            lambda: barrier_axes.plot(
                lambda x: math.cos(k_inc * x),
                x_range=[-5, 0, 0.05],
                color=YELLOW,
            )
        )

        # 动态势垒内衰减波
        dyn_decay = always_redraw(
            lambda: barrier_axes.plot(
                lambda x: math.exp(-kappa * x),
                x_range=[0.001, a_tracker.get_value(), 0.05],
                color=CYAN,
            )
        )

        # 动态透射波（振幅随 a 指数衰减）
        dyn_trans = always_redraw(
            lambda: barrier_axes.plot(
                lambda x: math.exp(-kappa * a_tracker.get_value()) * math.cos(k_inc * (x - a_tracker.get_value())),
                x_range=[a_tracker.get_value(), 7.5, 0.05],
                color=GREEN,
            )
        )

        # 右下角透射率数值显示
        def make_T_display():
            a = a_tracker.get_value()
            T_val = math.exp(-2 * kappa * a)
            val_tex = MathTex(r"T \approx " + f"{T_val:.3f}").scale(0.62).set_color(GREEN)
            a_tex = MathTex(r"a = " + f"{a:.1f}").scale(0.62).set_color(ORANGE)
            grp = VGroup(a_tex, val_tex).arrange(DOWN, buff=0.2)
            grp.to_corner(DR, buff=0.5)
            return grp

        T_display = always_redraw(make_T_display)

        self.play(Create(dyn_inc), Create(dyn_decay), Create(dyn_trans), FadeIn(T_display))
        self.wait(0.5)

        # a 从 1 增大到 3 → T 从较大到极小
        self.play(a_tracker.animate.set_value(3.0), run_time=3.5, rate_func=linear)
        self.wait(0.8)
        # a 缩小回 1
        self.play(a_tracker.animate.set_value(1.0), run_time=2.0, rate_func=linear)
        self.wait(1.0)

        # 清场，保留标题
        self.play(
            FadeOut(VGroup(
                dyn_barrier, dyn_inc, dyn_decay, dyn_trans,
                T_display, barrier_axes, x_lab, e_lab,
                u0_line, u0_label, e_line, e_label,
                T_formula, tracker_label,
            ))
        )
        self.wait(0.5)

        # ══════════════════════════════════════════════════════
        # Step 5: 幕二 —— STM 原理图
        # ══════════════════════════════════════════════════════
        act2_label = Text("幕二：扫描隧穿显微镜（STM）原理", font=CJK, color=CYAN).scale(0.46)
        act2_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(act2_label))
        self.wait(0.5)

        # STM 图：针尖 + 样品 + 隧穿间隙
        # 样品（灰色矩形）
        sample = Rectangle(width=8, height=0.7, color=GRAY, fill_color=GRAY, fill_opacity=0.6)
        sample.shift(DOWN * 2.5)
        sample_label = Text("样品表面", font=CJK, color=GRAY).scale(0.42)
        sample_label.next_to(sample, DOWN, buff=0.15)

        # 针尖（三角形）
        tip_body = Polygon(
            [-0.15, 0, 0], [0.15, 0, 0], [0, -0.55, 0],
            color=WHITE, fill_color=WHITE, fill_opacity=0.8
        )
        tip_body.shift(UP * 0.4 + DOWN * 1.2)
        tip_label = Text("STM 针尖", font=CJK, color=WHITE).scale(0.42)
        tip_label.next_to(tip_body, UP, buff=0.1)

        # 隧穿间隙 d 的示意
        gap_start = tip_body.get_bottom()
        gap_end = sample.get_top() + np.array([0, 0, 0])
        gap_arrow = DoubleArrow(
            start=np.array([0.5, gap_start[1], 0]),
            end=np.array([0.5, gap_end[1] + 0.05, 0]),
            color=CYAN, buff=0, tip_length=0.15
        )
        d_label = VGroup(
            MathTex(r"d", color=CYAN).scale(0.6),
            Text("~0.1 nm", font=CJK, color=CYAN).scale(0.38),
        ).arrange(DOWN, buff=0.05).next_to(gap_arrow, RIGHT, buff=0.15)

        self.play(Create(sample), FadeIn(sample_label))
        self.play(Create(tip_body), FadeIn(tip_label))
        self.play(Create(gap_arrow), FadeIn(d_label))
        self.wait(0.8)

        # 隧穿电流公式
        stm_formula = MathTex(r"I_{\mathrm{STM}} \propto e^{-2\kappa d}").scale(0.72)
        stm_formula.set_color(YELLOW)
        stm_formula.to_edge(RIGHT).shift(UP * 1.0)
        self.play(Write(stm_formula))
        self.wait(0.8)

        # 对数坐标条形图：d 变化 0.1 nm，I 变化 ~1000 倍
        bar_note = Text("d 增加 0.1 nm  →  电流变化约 1000 倍！", font=CJK, color=GREEN).scale(0.44)
        bar_note.to_edge(LEFT).shift(UP * 1.5)
        self.play(FadeIn(bar_note))
        self.wait(0.4)

        # 两根条形（对数高度）：I₁ vs I₂
        bar_axes = Axes(
            x_range=[0, 3, 1],
            y_range=[0, 3.5, 1],
            x_length=3.0,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": False},
            y_axis_config={"include_numbers": True},
        ).to_edge(LEFT).shift(DOWN * 1.2)
        y_log_label = Text("log₁₀(I)", font=CJK).scale(0.32).next_to(bar_axes.y_axis.get_end(), LEFT, buff=0.1)

        bar1 = bar_axes.get_area(
            bar_axes.plot(lambda x: 3.0, x_range=[0.3, 1.3], color=GREEN),
            x_range=[0.3, 1.3], color=GREEN, opacity=0.7
        )
        bar2 = bar_axes.get_area(
            bar_axes.plot(lambda x: 0.0, x_range=[1.7, 2.7], color=RED),
            x_range=[1.7, 2.7], color=RED, opacity=0.7
        )
        # bar2 实际高度 0，补一个矩形代表极低值
        bar2_rect = Rectangle(width=0.8, height=0.1, color=RED, fill_color=RED, fill_opacity=0.7)
        bar2_rect.move_to(bar_axes.c2p(2.0, 0.05))

        bar1_label = VGroup(
            Text("d₁", font=CJK).scale(0.38),
            MathTex(r"I_1").scale(0.42),
        ).arrange(DOWN, buff=0.05).next_to(bar_axes.c2p(0.8, 0), DOWN, buff=0.1)

        bar2_label = VGroup(
            Text("d₁+0.1nm", font=CJK).scale(0.34),
            MathTex(r"I_2 \approx I_1/1000").scale(0.38),
        ).arrange(DOWN, buff=0.05).next_to(bar_axes.c2p(2.2, 0), DOWN, buff=0.1)

        self.play(Create(bar_axes), FadeIn(y_log_label))
        self.play(FadeIn(bar1), FadeIn(bar1_label))
        self.play(FadeIn(bar2_rect), FadeIn(bar2_label))
        self.wait(1.5)

        self.play(
            FadeOut(VGroup(
                sample, sample_label, tip_body, tip_label,
                gap_arrow, d_label, stm_formula, bar_note,
                bar_axes, y_log_label, bar1, bar2_rect,
                bar1_label, bar2_label, act2_label,
            ))
        )
        self.wait(0.4)

        # ══════════════════════════════════════════════════════
        # Step 6: 幕三 —— α衰变类比（库仑势垒）
        # ══════════════════════════════════════════════════════
        act3_label = Text("幕三：α 衰变——穿透库仑势垒", font=CJK, color=CYAN).scale(0.46)
        act3_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(act3_label))
        self.wait(0.5)

        # 示意图：原子核（内部势阱 + 外部库仑势垒）
        # 用简化剖面图：x 轴位置，y 轴势能

        nuc_axes = Axes(
            x_range=[-0.5, 8, 1],
            y_range=[-1, 3.5, 1],
            x_length=9,
            y_length=3.6,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.8)
        nx_lab = MathTex(r"r").scale(0.55).next_to(nuc_axes.x_axis.get_end(), DOWN, buff=0.12)
        nU_lab = MathTex(r"U(r)").scale(0.55).next_to(nuc_axes.y_axis.get_end(), LEFT, buff=0.12)

        # 核内势阱 (r<R₀)：强核力，近似矩形势阱
        R0 = 1.2   # 核半径
        Uc = 3.0   # 库仑势垒峰值（超出轴范围，画到 3）
        E_alpha = 1.5  # α粒子能量

        # 核内区域（低势能，势阱）
        well_pts = [
            nuc_axes.c2p(0, -0.6),
            nuc_axes.c2p(0, 2.8),
            nuc_axes.c2p(R0, 2.8),
            nuc_axes.c2p(R0, -0.6),
        ]
        well_region = Polygon(*well_pts, color=BLUE_D, fill_color=BLUE_D, fill_opacity=0.25, stroke_width=0)

        # 库仑势能曲线 U(r) = k/r for r > R0
        coulomb_curve = nuc_axes.plot(
            lambda r: min(2.8 / r, 3.2) if r > R0 else None,
            x_range=[R0 + 0.01, 8, 0.05],
            color=ORANGE,
        )

        # 势垒顶峰标注
        coulomb_peak_dot = Dot(nuc_axes.c2p(R0, 2.8), color=ORANGE, radius=0.08)
        uc_label = MathTex(r"U_C", color=ORANGE).scale(0.52)
        uc_label.next_to(coulomb_peak_dot, UP, buff=0.12)

        # α粒子能量线
        alpha_e_line = DashedLine(
            nuc_axes.c2p(0, E_alpha), nuc_axes.c2p(8, E_alpha),
            color=YELLOW, stroke_width=1.8,
        )
        alpha_e_label = MathTex(r"E_\alpha", color=YELLOW).scale(0.52)
        alpha_e_label.next_to(nuc_axes.c2p(0, E_alpha), LEFT, buff=0.12)

        # 势垒宽度（E_alpha 与库仑势能曲线相交区域）
        # 交点：2.8/r = E_alpha => r = 2.8/E_alpha ≈ 1.87
        r_exit = 2.8 / E_alpha
        barrier_span = DashedLine(
            nuc_axes.c2p(R0, E_alpha), nuc_axes.c2p(r_exit, E_alpha),
            color=CYAN, stroke_width=2.5,
        )
        barrier_brace = Brace(barrier_span, DOWN, color=CYAN)
        barrier_brace_label = VGroup(
            Text("库仑势垒宽度", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"a", color=CYAN).scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        barrier_brace_label.next_to(barrier_brace, DOWN, buff=0.1)

        self.play(Create(nuc_axes), FadeIn(nx_lab), FadeIn(nU_lab))
        self.play(FadeIn(well_region))

        # 原子核内标注
        nuc_inner_label = Text("核内", font=CJK, color=BLUE).scale(0.42)
        nuc_inner_label.move_to(nuc_axes.c2p(0.6, 1.2))
        self.play(FadeIn(nuc_inner_label))

        self.play(Create(coulomb_curve), FadeIn(coulomb_peak_dot), FadeIn(uc_label))
        self.play(Create(alpha_e_line), FadeIn(alpha_e_label))
        self.play(Create(barrier_span), Create(barrier_brace), FadeIn(barrier_brace_label))
        self.wait(0.8)

        # α粒子隧穿动画（小球从核内穿越势垒到核外）
        alpha_particle = Dot(nuc_axes.c2p(0.5, E_alpha), color=RED, radius=0.14)
        alpha_label = Text("α粒子", font=CJK, color=RED).scale(0.38)
        alpha_label.next_to(alpha_particle, UP, buff=0.08)
        self.play(FadeIn(alpha_particle), FadeIn(alpha_label))
        self.wait(0.4)

        # 在势垒内淡化（隧穿过程）并在势垒外出现
        self.play(
            alpha_particle.animate.move_to(nuc_axes.c2p(R0 + 0.3, E_alpha)).set_opacity(0.3),
            alpha_label.animate.set_opacity(0.3),
            run_time=0.8,
        )
        self.play(
            alpha_particle.animate.move_to(nuc_axes.c2p(r_exit + 0.4, E_alpha)).set_opacity(1.0),
            alpha_label.animate.set_opacity(1.0),
            run_time=0.8,
        )
        self.play(
            alpha_particle.animate.move_to(nuc_axes.c2p(6.0, E_alpha)),
            run_time=1.2,
        )
        self.wait(0.8)

        # 联系公式：同一数学形式
        connect_text = Text("与 STM 相同的数学形式：", font=CJK, color=GREEN).scale(0.44)
        connect_formula = MathTex(r"T \propto e^{-\kappa a}").scale(0.72).set_color(YELLOW)
        connect = VGroup(connect_text, connect_formula).arrange(RIGHT, buff=0.3)
        connect.next_to(nuc_axes, DOWN, buff=0.2)
        self.play(FadeIn(connect_text), Write(connect_formula))
        self.wait(1.5)

        # 清场
        self.play(
            FadeOut(VGroup(
                nuc_axes, nx_lab, nU_lab, well_region, nuc_inner_label,
                coulomb_curve, coulomb_peak_dot, uc_label,
                alpha_e_line, alpha_e_label,
                barrier_span, barrier_brace, barrier_brace_label,
                alpha_particle, alpha_label,
                connect, act3_label,
            ))
        )
        self.wait(0.4)

        # ══════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1_zh = Text("隧道效应：量子粒子能穿越经典不可逾越的势垒", font=CJK, color=WHITE).scale(0.44)
        s1_formula = MathTex(r"T \propto e^{-2\kappa a},\quad \kappa = \sqrt{\frac{2m(U_0-E)}{\hbar^2}}",
                             color=YELLOW).scale(0.66)
        s2_zh = Text("势垒越宽 / 越高，透射率按指数急剧减小", font=CJK, color=WHITE).scale(0.44)
        s3_zh = Text("STM 应用：d 变化 0.1 nm，I 变化约 1000 倍", font=CJK, color=CYAN).scale(0.44)
        s3_formula = MathTex(r"I_{\mathrm{STM}} \propto e^{-2\kappa d}", color=CYAN).scale(0.66)
        s4_zh = Text("α衰变：库仑势垒 + 同一隧穿数学形式", font=CJK, color=GREEN).scale(0.44)

        summary_group = VGroup(
            s1_zh, s1_formula, s2_zh, s3_zh, s3_formula, s4_zh
        ).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        summary_group.next_to(s_title, DOWN, buff=0.4)
        summary_group.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s1_formula))
        self.play(FadeIn(s1_zh))
        self.play(FadeIn(s2_zh))
        self.wait(0.3)
        self.play(Write(s3_formula), FadeIn(s3_zh))
        self.wait(0.3)
        self.play(FadeIn(s4_zh))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch12Kp4TunnelEffectBarrierPenetration",
        "id": "phys-ch12-12.4-kp4-tunnel-effect-barrier-penetration",
        "chapterId": "ch12",
        "sectionId": "12.4",
        "title": "势垒穿透与隧道效应",
        "description": "三幕动画：经典vs量子粒子穿越势垒、STM隧穿电流指数灵敏度、α衰变库仑势垒类比，贯穿核心公式 T∝e^{-2κa}。",
    },
]
