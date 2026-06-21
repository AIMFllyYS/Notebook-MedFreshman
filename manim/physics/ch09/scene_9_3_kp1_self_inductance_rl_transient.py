"""第 9.3 节 · 自感与 RL 电路暂态（知识点讲解）

第一幕：用螺线管磁感线密度 + ValueTracker 演示自感电动势 ε_L = -L dI/dt 的物理图像。
第二幕：RL 串联电路图 → 微分方程建立 → 指数解 i(t) → Axes 实时曲线 + τ/5τ 标注
         → 断电衰减曲线叠加对比。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch09Kp1SelfInductanceRlTransient(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("自感与 RL 电路暂态", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("线圈通电时产生的磁场，会「抵制」自身电流的变化，", font=CJK).scale(0.48)
        ana2 = Text("就像惯性阻止速度突变——这就是自感。", font=CJK).scale(0.48)
        ana3 = Text("正因如此，RL 电路的电流不能瞬间跳变，只能指数式缓慢变化。",
                    font=CJK, color=GREEN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # ── 第一幕：自感概念 + 螺线管可视化 ────────────────────────────
        # ══════════════════════════════════════════════════════════════════

        # ── Step 3: 自感定义公式逐步出现 ──────────────────────────────
        def_label = Text("自感系数（电感）定义：", font=CJK, color=BLUE).scale(0.5)
        def_label.next_to(title, DOWN, buff=0.5)

        l_def = MathTex(r"L", r"=", r"\frac{\Psi}{i}", r"=",
                        r"\mu_0 n^2 V").scale(0.9)
        l_def[0].set_color(YELLOW)
        l_def[2].set_color(GREEN)
        l_def[4].set_color(CYAN)
        l_def.next_to(def_label, DOWN, buff=0.35)

        legend_l = VGroup(
            VGroup(Text("L", font=CJK, color=YELLOW).scale(0.42),
                   Text(": 电感（自感系数），单位 H（亨利）", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\Psi", color=GREEN).scale(0.55),
                   Text(": 总磁通量（匝链数）", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\mu_0 n^2 V", color=CYAN).scale(0.55),
                   Text(": 螺线管公式（n 匝/米，V 体积）", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(l_def, DOWN, buff=0.3)

        self.play(FadeIn(def_label))
        self.play(Write(l_def))
        self.wait(0.8)
        self.play(FadeIn(legend_l))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_label, l_def, legend_l)))

        # ── Step 4: 螺线管图 + 磁感线 + ValueTracker 电流扫动 ─────────
        coil_label = Text("螺线管：电流增大 → 磁通量增大 → 自感电动势阻碍增大",
                          font=CJK, color=ORANGE).scale(0.42).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(coil_label))

        # 画螺线管外框
        coil_rect = Rectangle(width=4.0, height=1.2, color=YELLOW, stroke_width=2.5)
        coil_rect.shift(DOWN * 0.6)

        # 画线圈竖线（模拟绕线）
        coil_lines = VGroup()
        n_turns = 8
        x_left = coil_rect.get_left()[0]
        x_right = coil_rect.get_right()[0]
        coil_top = coil_rect.get_top()[1]
        coil_bot = coil_rect.get_bottom()[1]
        for j in range(n_turns + 1):
            xp = x_left + (x_right - x_left) * j / n_turns
            coil_lines.add(
                Line([xp, coil_top, 0], [xp, coil_bot, 0],
                     color=YELLOW, stroke_width=1.5, stroke_opacity=0.6)
            )
        self.play(Create(coil_rect), Create(coil_lines))

        # 标注电流方向箭头（进、出）
        i_in_arrow = Arrow(
            start=coil_rect.get_left() + LEFT * 0.7,
            end=coil_rect.get_left() + LEFT * 0.05,
            color=GREEN, stroke_width=3, max_tip_length_to_length_ratio=0.35
        )
        i_label = VGroup(
            MathTex(r"i", color=GREEN).scale(0.7),
            Text("（增大）", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        i_label.next_to(i_in_arrow, UP, buff=0.1)

        # 电流 ValueTracker
        i_tracker = ValueTracker(0.3)

        # 磁感线（水平，数量随电流变化）
        def make_field_lines():
            lines = VGroup()
            i_val = i_tracker.get_value()
            n_lines = int(2 + round(i_val * 4))  # 2~6 根
            y_positions = np.linspace(coil_bot + 0.18, coil_top - 0.18, n_lines)
            for yp in y_positions:
                ln = Arrow(
                    start=[x_left + 0.15, yp, 0],
                    end=[x_right - 0.15, yp, 0],
                    color=CYAN, stroke_width=2.0,
                    max_tip_length_to_length_ratio=0.18,
                )
                lines.add(ln)
            return lines

        field_lines = always_redraw(make_field_lines)
        self.play(Create(i_in_arrow), FadeIn(i_label))
        self.play(Create(field_lines))
        self.wait(0.5)

        # 自感电动势方向标注
        eps_arrow = Arrow(
            start=coil_rect.get_right() + RIGHT * 0.05,
            end=coil_rect.get_right() + RIGHT * 0.8,
            color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.35
        )
        eps_label = VGroup(
            MathTex(r"\varepsilon_L", color=RED).scale(0.7),
            Text("（反向阻碍）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        eps_label.next_to(eps_arrow, DOWN, buff=0.1)

        # 自感公式
        eps_eq = MathTex(r"\varepsilon_L", r"=", r"-L", r"\frac{\mathrm{d}i}{\mathrm{d}t}").scale(0.88)
        eps_eq[0].set_color(RED)
        eps_eq[2].set_color(YELLOW)
        eps_eq[3].set_color(ORANGE)
        eps_eq.next_to(coil_rect, DOWN, buff=0.5)

        self.play(FadeIn(eps_arrow), FadeIn(eps_label))
        self.play(Write(eps_eq))
        self.wait(0.6)

        # 电流扫动：增大，磁感线变密
        readout = always_redraw(
            lambda: VGroup(
                MathTex(r"i=").scale(0.55),
                MathTex(rf"{i_tracker.get_value():.1f}", r"\,\mathrm{{A}}", color=GREEN).scale(0.55),
            ).arrange(RIGHT, buff=0.05).to_corner(UR, buff=0.55)
        )
        self.add(readout)
        zh_grow = Text("磁感线变密 → 磁通量增大 → ε_L 反抗电流增大",
                       font=CJK, color=ORANGE).scale(0.40).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(zh_grow))
        self.play(i_tracker.animate.set_value(1.0), run_time=2.5)
        self.wait(0.6)
        self.play(i_tracker.animate.set_value(0.3), run_time=2.0)
        self.wait(0.8)

        # 清场第一幕
        self.play(FadeOut(VGroup(
            coil_label, coil_rect, coil_lines,
            i_in_arrow, i_label, field_lines,
            eps_arrow, eps_label, eps_eq,
            readout, zh_grow,
        )))

        # ══════════════════════════════════════════════════════════════════
        # ── 第二幕：RL 暂态电路 ─────────────────────────────────────────
        # ══════════════════════════════════════════════════════════════════

        # ── Step 5: RL 电路图 ──────────────────────────────────────────
        ckt_label = Text("RL 串联电路：接通开关 S", font=CJK, color=BLUE).scale(0.5)
        ckt_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ckt_label))

        # 电路图坐标（矩形回路）
        cx, cy = -4.2, -0.3
        W, H = 2.8, 2.0

        TL = np.array([cx, cy + H / 2, 0])        # 左上
        TR = np.array([cx + W, cy + H / 2, 0])    # 右上
        BL = np.array([cx, cy - H / 2, 0])        # 左下
        BR = np.array([cx + W, cy - H / 2, 0])    # 右下
        TM = np.array([cx + W / 2, cy + H / 2, 0])  # 上中（开关位置）

        # 导线
        wire_top_l = Line(TL, TM - [0.25, 0, 0], color=WHITE, stroke_width=2)
        wire_top_r = Line(TM + [0.25, 0, 0], TR, color=WHITE, stroke_width=2)
        wire_right = Line(TR, BR, color=WHITE, stroke_width=2)
        wire_bot = Line(BL, BR, color=WHITE, stroke_width=2)
        wire_left_top = Line(TL, TL + [0, -0.55, 0], color=WHITE, stroke_width=2)
        wire_left_bot = Line(BL, BL + [0, 0.55, 0], color=WHITE, stroke_width=2)

        # 电源 ε（左侧竖导线中段）
        eps_top = TL + [0, -0.55, 0]
        eps_bot = BL + [0, 0.55, 0]
        eps_mid = (eps_top + eps_bot) / 2
        battery_pos = Line(eps_top, eps_bot, color=WHITE, stroke_width=2)
        batt_long = Line(eps_mid + [-.22, 0.08, 0], eps_mid + [.22, 0.08, 0],
                         color=WHITE, stroke_width=3)
        batt_short = Line(eps_mid + [-.13, -0.08, 0], eps_mid + [.13, -0.08, 0],
                          color=WHITE, stroke_width=2)
        eps_sym = MathTex(r"\varepsilon", color=GREEN).scale(0.6)
        eps_sym.next_to(battery_pos, LEFT, buff=0.12)

        # 电阻 R（下边导线中间）
        bot_mid = (BL + BR) / 2
        R_box = Rectangle(width=0.55, height=0.25, color=ORANGE, stroke_width=2)
        R_box.move_to(bot_mid)
        R_label = MathTex(r"R", color=ORANGE).scale(0.6).next_to(R_box, DOWN, buff=0.1)

        # 电感 L（右侧竖导线中间）
        right_mid = (TR + BR) / 2
        L_box = Rectangle(width=0.25, height=0.55, color=YELLOW, stroke_width=2)
        L_box.move_to(right_mid)
        L_ckt_label = MathTex(r"L", color=YELLOW).scale(0.6).next_to(L_box, RIGHT, buff=0.1)

        # 开关 S（上边导线中间）
        switch_dot1 = Dot(TM + [-0.25, 0, 0], color=WHITE, radius=0.05)
        switch_dot2 = Dot(TM + [0.25, 0, 0], color=WHITE, radius=0.05)
        switch_open = Line(TM + [-0.25, 0, 0], TM + [0.15, 0.3, 0],
                           color=WHITE, stroke_width=2)
        S_label = Text("S", font=CJK, color=WHITE).scale(0.42).next_to(TM, UP, buff=0.12)

        circuit = VGroup(
            wire_top_l, wire_top_r, wire_right, wire_bot,
            wire_left_top, wire_left_bot, battery_pos,
            batt_long, batt_short, eps_sym,
            R_box, R_label, L_box, L_ckt_label,
            switch_dot1, switch_dot2, switch_open, S_label,
        )
        self.play(Create(circuit), run_time=1.8)
        self.wait(0.8)

        # 接通开关：switch 线变水平
        switch_closed = Line(TM + [-0.25, 0, 0], TM + [0.25, 0, 0],
                             color=GREEN, stroke_width=2)
        sw_on_label = Text("接通！", font=CJK, color=GREEN).scale(0.42)
        sw_on_label.next_to(TM, UP, buff=0.12)
        self.play(
            ReplacementTransform(switch_open, switch_closed),
            ReplacementTransform(S_label, sw_on_label),
        )
        self.wait(0.8)

        # ── Step 6: 微分方程建立（逐行出现）──────────────────────────
        eq_label = Text("KVL 建立微分方程：", font=CJK, color=BLUE).scale(0.48)
        eq_label.next_to(title, DOWN, buff=0.45).shift(RIGHT * 2.2)

        eq1 = MathTex(r"\varepsilon", r"=", r"Ri", r"+",
                      r"L\frac{\mathrm{d}i}{\mathrm{d}t}").scale(0.82)
        eq1[0].set_color(GREEN)
        eq1[2].set_color(ORANGE)
        eq1[4].set_color(YELLOW)
        eq1.next_to(eq_label, DOWN, buff=0.3)

        eq2 = MathTex(r"L\frac{\mathrm{d}i}{\mathrm{d}t}",
                      r"=", r"\varepsilon - Ri").scale(0.82)
        eq2[0].set_color(YELLOW)
        eq2[2].set_color(GREEN)
        eq2.next_to(eq1, DOWN, buff=0.28)

        eq3 = MathTex(r"\frac{\mathrm{d}i}{\varepsilon/R - i}",
                      r"=", r"\frac{R}{L}\,\mathrm{d}t").scale(0.82)
        eq3[2].set_color(CYAN)
        eq3.next_to(eq2, DOWN, buff=0.28)

        sol_label = Text("积分求解得：", font=CJK, color=BLUE).scale(0.44)
        sol_label.next_to(eq3, DOWN, buff=0.3)

        eq_sol = MathTex(r"i(t)", r"=",
                         r"\frac{\varepsilon}{R}",
                         r"\left(1-e^{-t/\tau}\right)",
                         r",\quad \tau = \frac{L}{R}").scale(0.82)
        eq_sol[0].set_color(GREEN)
        eq_sol[2].set_color(ORANGE)
        eq_sol[3].set_color(YELLOW)
        eq_sol[4].set_color(CYAN)
        eq_sol.next_to(sol_label, DOWN, buff=0.22)

        self.play(FadeIn(eq_label))
        self.play(Write(eq1))
        self.wait(0.8)
        self.play(Write(eq2))
        self.wait(0.7)
        self.play(Write(eq3))
        self.wait(0.8)
        self.play(FadeIn(sol_label))
        self.play(Write(eq_sol))
        self.wait(1.5)

        # 清场电路图 + 方程
        self.play(FadeOut(VGroup(
            circuit, switch_closed, sw_on_label,
            ckt_label, eq_label, eq1, eq2, eq3, sol_label, eq_sol,
        )))

        # ── Step 7: Axes + 通电曲线 i(t) + τ/5τ 标注 ──────────────
        # 物理参数
        eps_val = 10.0   # V
        R_val = 5.0      # Ω
        L_val = 2.5      # H
        tau = L_val / R_val   # = 0.5 s
        i_ss = eps_val / R_val  # = 2.0 A

        t_max = 5.5 * tau

        axes = Axes(
            x_range=[0, t_max, tau],
            y_range=[0, i_ss * 1.25, i_ss / 4],
            x_length=9.5,
            y_length=4.0,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [round(tau, 2), round(5 * tau, 2)]},
            y_axis_config={"numbers_to_include": [round(i_ss, 2)]},
        ).shift(DOWN * 0.55)

        x_lbl = MathTex(r"t\,(\mathrm{s})").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_lbl = MathTex(r"i\,(\mathrm{A})").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.18)

        axes_label = Text("通电过程：指数增长", font=CJK, color=GREEN).scale(0.46)
        axes_label.next_to(title, DOWN, buff=0.42)

        self.play(FadeIn(axes_label))
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 通电曲线
        charge_curve = axes.plot(
            lambda t: i_ss * (1 - math.exp(-t / tau)),
            x_range=[0, t_max],
            color=GREEN, stroke_width=3,
        )
        self.play(Create(charge_curve), run_time=2.5, rate_func=linear)
        self.wait(0.5)

        # 稳态虚线
        steady_line = DashedLine(
            axes.c2p(0, i_ss),
            axes.c2p(t_max, i_ss),
            color=WHITE, stroke_width=1.5, dash_length=0.15,
        )
        steady_lbl = VGroup(
            MathTex(r"i_{ss}=\frac{\varepsilon}{R}", color=WHITE).scale(0.52),
            MathTex(rf"={i_ss:.1f}", r"\,\mathrm{A}", color=WHITE).scale(0.52),
        ).arrange(RIGHT, buff=0.06)
        steady_lbl.next_to(axes.c2p(t_max, i_ss), RIGHT, buff=0.12)
        self.play(Create(steady_line), FadeIn(steady_lbl))
        self.wait(0.5)

        # τ 标注：i(τ) = 0.632 × i_ss
        i_tau = i_ss * (1 - math.exp(-1))  # ≈ 0.632 i_ss
        tau_vline = DashedLine(
            axes.c2p(tau, 0),
            axes.c2p(tau, i_tau),
            color=CYAN, stroke_width=2.5,
        )
        tau_hline = DashedLine(
            axes.c2p(0, i_tau),
            axes.c2p(tau, i_tau),
            color=CYAN, stroke_width=2.5,
        )
        tau_dot = Dot(axes.c2p(tau, i_tau), color=CYAN, radius=0.09)
        tau_lbl_x = VGroup(
            MathTex(r"\tau=\frac{L}{R}", color=CYAN).scale(0.5),
            MathTex(rf"={tau:.1f}", r"\,\mathrm{s}", color=CYAN).scale(0.5),
        ).arrange(DOWN, buff=0.05)
        tau_lbl_x.next_to(axes.c2p(tau, 0), DOWN, buff=0.15)
        tau_lbl_y = MathTex(r"63.2\%\, i_{ss}", color=CYAN).scale(0.48)
        tau_lbl_y.next_to(axes.c2p(0, i_tau), LEFT, buff=0.12)

        self.play(
            Create(tau_vline), Create(tau_hline),
            FadeIn(tau_dot), FadeIn(tau_lbl_x), FadeIn(tau_lbl_y),
        )
        self.wait(0.8)

        # 5τ 标注：i ≈ i_ss
        i_5tau = i_ss * (1 - math.exp(-5))
        five_tau_vline = DashedLine(
            axes.c2p(5 * tau, 0),
            axes.c2p(5 * tau, i_5tau),
            color=ORANGE, stroke_width=2,
        )
        five_tau_dot = Dot(axes.c2p(5 * tau, i_5tau), color=ORANGE, radius=0.09)
        five_tau_lbl = VGroup(
            MathTex(r"5\tau", color=ORANGE).scale(0.5),
            Text("（近似稳定）", font=CJK, color=ORANGE).scale(0.36),
        ).arrange(DOWN, buff=0.05)
        five_tau_lbl.next_to(axes.c2p(5 * tau, 0), DOWN, buff=0.15)

        self.play(Create(five_tau_vline), FadeIn(five_tau_dot), FadeIn(five_tau_lbl))
        self.wait(1.2)

        # ── Step 8: 断电曲线 叠加 ─────────────────────────────────────
        discharge_label = Text("断电过程：指数衰减（叠加对比）",
                               font=CJK, color=RED).scale(0.44)
        discharge_label.next_to(axes_label, RIGHT, buff=0.5)
        self.play(FadeIn(discharge_label))

        discharge_curve = axes.plot(
            lambda t: i_ss * math.exp(-t / tau),
            x_range=[0, t_max],
            color=RED, stroke_width=3,
        )
        self.play(Create(discharge_curve), run_time=2.0, rate_func=linear)

        # 断电公式
        dis_eq = MathTex(r"i(t)", r"=",
                         r"\frac{\varepsilon}{R}",
                         r"e^{-t/\tau}",
                         r"\quad (\text{discharge})").scale(0.72)
        dis_eq[0].set_color(RED)
        dis_eq[2].set_color(ORANGE)
        dis_eq[3].set_color(RED)
        dis_eq.next_to(axes, DOWN, buff=0.35)
        self.play(Write(dis_eq))
        self.wait(1.5)

        # 通电公式也显示做对比
        chg_eq = MathTex(r"i(t)", r"=",
                         r"\frac{\varepsilon}{R}",
                         r"\!\left(1-e^{-t/\tau}\right)").scale(0.72)
        chg_eq[0].set_color(GREEN)
        chg_eq[2].set_color(ORANGE)
        chg_eq[3].set_color(GREEN)
        chg_eq.next_to(dis_eq, RIGHT, buff=0.6)
        chg_eq.align_to(dis_eq, DOWN)
        self.play(Write(chg_eq))
        self.wait(1.4)

        # 清场第二幕
        self.play(FadeOut(VGroup(
            axes_label, discharge_label,
            axes, x_lbl, y_lbl,
            charge_curve, discharge_curve,
            steady_line, steady_lbl,
            tau_vline, tau_hline, tau_dot, tau_lbl_x, tau_lbl_y,
            five_tau_vline, five_tau_dot, five_tau_lbl,
            dis_eq, chg_eq,
        )))

        # ── Step 9: τ 的物理意义 + 数值例子 ────────────────────────────
        ex_t = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        ex_q1 = VGroup(
            Text("已知：", font=CJK).scale(0.44),
            MathTex(r"\varepsilon=10\,\mathrm{V},\quad R=5\,\Omega,\quad L=2.5\,\mathrm{H}").scale(0.7),
        ).arrange(RIGHT, buff=0.15)
        ex_q1.next_to(ex_t, DOWN, buff=0.35)

        ex_tau = VGroup(
            Text("时间常数：", font=CJK).scale(0.44),
            MathTex(r"\tau=\frac{L}{R}=\frac{2.5}{5}=0.5\,\mathrm{s}", color=CYAN).scale(0.78),
        ).arrange(RIGHT, buff=0.15)
        ex_tau.next_to(ex_q1, DOWN, buff=0.3)

        ex_iss = VGroup(
            Text("稳态电流：", font=CJK).scale(0.44),
            MathTex(r"i_{ss}=\frac{\varepsilon}{R}=\frac{10}{5}=2\,\mathrm{A}", color=GREEN).scale(0.78),
        ).arrange(RIGHT, buff=0.15)
        ex_iss.next_to(ex_tau, DOWN, buff=0.25)

        ex_t1 = VGroup(
            Text("t = τ 时刻：", font=CJK).scale(0.44),
            MathTex(r"i(\tau)=2(1-e^{-1})\approx 1.26\,\mathrm{A}\quad (63.2\%)", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        ex_t1.next_to(ex_iss, DOWN, buff=0.25)

        self.play(FadeIn(ex_t))
        self.play(FadeIn(ex_q1))
        self.wait(0.6)
        self.play(FadeIn(ex_tau))
        self.wait(0.6)
        self.play(FadeIn(ex_iss))
        self.wait(0.6)
        self.play(FadeIn(ex_t1))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_t, ex_q1, ex_tau, ex_iss, ex_t1)))

        # ── Step 10: 小结卡 ────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1_l = MathTex(r"\varepsilon_L = -L\frac{\mathrm{d}i}{\mathrm{d}t}", color=YELLOW).scale(0.8)
        s1_r = VGroup(
            Text("自感电动势反抗电流变化", font=CJK, color=WHITE).scale(0.40),
        )
        s1 = VGroup(s1_l, s1_r).arrange(RIGHT, buff=0.4)

        s2_l = MathTex(r"i(t)=\frac{\varepsilon}{R}\!\left(1-e^{-t/\tau}\right)", color=GREEN).scale(0.78)
        s2_r = Text("通电指数增长", font=CJK, color=WHITE).scale(0.40)
        s2 = VGroup(s2_l, s2_r).arrange(RIGHT, buff=0.4)

        s3_l = MathTex(r"i(t)=\frac{\varepsilon}{R}e^{-t/\tau}", color=RED).scale(0.78)
        s3_r = Text("断电指数衰减", font=CJK, color=WHITE).scale(0.40)
        s3 = VGroup(s3_l, s3_r).arrange(RIGHT, buff=0.4)

        s4_l = MathTex(r"\tau=\frac{L}{R}", color=CYAN).scale(0.78)
        s4_r = Text("时间常数：τ 越大，过渡越慢", font=CJK, color=WHITE).scale(0.40)
        s4 = VGroup(s4_l, s4_r).arrange(RIGHT, buff=0.4)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_l), FadeIn(s1_r))
        self.wait(0.4)
        self.play(Write(s2_l), FadeIn(s2_r))
        self.wait(0.4)
        self.play(Write(s3_l), FadeIn(s3_r))
        self.wait(0.4)
        self.play(Write(s4_l), FadeIn(s4_r))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp1SelfInductanceRlTransient",
        "id": "phys-ch09-9.3-kp1-self-inductance-rl-transient",
        "chapterId": "ch09",
        "sectionId": "9.3",
        "title": "自感与 RL 电路暂态",
        "description": "第一幕：螺线管磁感线随电流变化演示自感 ε_L=-L dI/dt；第二幕：RL 电路微分方程推导 → 指数增长/衰减曲线 + τ/5τ 标注。",
    },
]
