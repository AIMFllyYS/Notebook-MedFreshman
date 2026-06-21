"""第 9.4 节 · 例题精讲：平行板电容器中的位移电流。

可视化位移电流的本质：交流电容电路中，极板间不存在传导电流，
但时变电场产生的「位移电流」在数值上等于外电路传导电流，
并在安培定律中与传导电流等价激发磁场——即「全电流连续性」原理。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch09Ex1CapacitorDisplacementCurrent(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("平行板电容器中的位移电流", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.4", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("电容器接交流电后，外导线里有电流来回流动，", font=CJK).scale(0.46)
        ana2 = Text("但极板之间是绝缘的真空，传导电流在这里「断了」。", font=CJK).scale(0.46)
        ana3 = Text("麦克斯韦说：变化的电场本身就相当于一种「电流」，", font=CJK, color=YELLOW).scale(0.46)
        ana4 = Text("他称之为位移电流，让电流回路在逻辑上「闭合」。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(0.6)
        self.play(FadeIn(ana4))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 绘制平行板电容器结构 ─────────────────────────────────
        # 极板
        plate_top = Rectangle(width=3.2, height=0.18, color=BLUE, fill_color=BLUE, fill_opacity=0.85)
        plate_bot = Rectangle(width=3.2, height=0.18, color=BLUE, fill_color=BLUE, fill_opacity=0.85)
        plate_top.move_to(UP * 1.1 + LEFT * 0.5)
        plate_bot.move_to(DOWN * 1.1 + LEFT * 0.5)

        # 极板标注
        plus_label = Text("+σ(t)", font=CJK, color=RED).scale(0.4).next_to(plate_top, RIGHT, buff=0.18)
        minus_label = Text("-σ(t)", font=CJK, color=GREEN).scale(0.4).next_to(plate_bot, RIGHT, buff=0.18)

        # 间距与面积标注
        d_line = DashedLine(plate_top.get_bottom() + RIGHT * 1.8, plate_bot.get_top() + RIGHT * 1.8,
                            color=CYAN, stroke_width=1.8)
        d_label = MathTex(r"d").scale(0.5).next_to(d_line, RIGHT, buff=0.1).set_color(CYAN)

        # 电场线（在极板间）
        e_arrows = VGroup()
        for xi in [-1.0, -0.5, -0.0, 0.5]:
            ea = Arrow(
                start=np.array([xi - 0.5, 0.85, 0]),
                end=np.array([xi - 0.5, -0.85, 0]),
                buff=0,
                color=YELLOW,
                stroke_width=2.0,
                max_tip_length_to_length_ratio=0.18,
            )
            e_arrows.add(ea)
        e_field_label = VGroup(
            MathTex(r"E(t)", color=YELLOW).scale(0.5),
        ).next_to(e_arrows, LEFT, buff=0.15)

        # 外电路连线（左侧回路）
        wire_left_top = Line(plate_top.get_left(), plate_top.get_left() + LEFT * 1.5, color=WHITE, stroke_width=2)
        wire_left_bot = Line(plate_bot.get_left(), plate_bot.get_left() + LEFT * 1.5, color=WHITE, stroke_width=2)
        wire_left_v = Line(plate_top.get_left() + LEFT * 1.5,
                           plate_bot.get_left() + LEFT * 1.5, color=WHITE, stroke_width=2)

        # 交流电源符号（圆 + ~）
        src_center = plate_top.get_left() + LEFT * 1.5 + DOWN * 1.1
        src_circle = Circle(radius=0.32, color=ORANGE, stroke_width=2.2).move_to(src_center)
        src_tilde = MathTex(r"\sim", color=ORANGE).scale(0.55).move_to(src_center)
        src_label = MathTex(r"U_0\sin\omega t", color=ORANGE).scale(0.44)
        src_label.next_to(src_circle, LEFT, buff=0.18)

        cap_diagram = VGroup(
            plate_top, plate_bot,
            wire_left_top, wire_left_bot, wire_left_v,
            src_circle, src_tilde,
            e_arrows, e_field_label,
            plus_label, minus_label,
            d_line, d_label,
        ).shift(RIGHT * 0.5)

        diagram_title = Text("平行板电容器 + 交流电源", font=CJK, color=BLUE).scale(0.46)
        diagram_title.next_to(title, DOWN, buff=0.4)

        self.play(FadeIn(diagram_title))
        self.play(
            Create(plate_top), Create(plate_bot),
            Create(wire_left_top), Create(wire_left_bot), Create(wire_left_v),
        )
        self.play(Create(src_circle), Write(src_tilde), FadeIn(src_label))
        self.play(Create(e_arrows), FadeIn(e_field_label))
        self.play(FadeIn(plus_label), FadeIn(minus_label), Create(d_line), FadeIn(d_label))
        self.wait(1.2)
        self.play(FadeOut(VGroup(cap_diagram, src_label, diagram_title)))

        # ── Step 4: 推导第一步——电场 → 电位移通量 ────────────────────────
        step1_title = VGroup(
            Text("Step 1", font=CJK, color=CYAN).scale(0.44),
            Text("电场  →  电位移通量", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.25).next_to(title, DOWN, buff=0.42)

        eq1a = MathTex(r"E(t) = \frac{\sigma(t)}{\varepsilon_0} = \frac{U(t)}{d}").scale(0.78)
        eq1b = MathTex(r"D(t) = \varepsilon_0 E(t) = \frac{U(t)}{d} \cdot \varepsilon_0").scale(0.78)
        eq1c_lhs = MathTex(r"\Phi_D", r"=", r"D \cdot S", r"=",
                           r"\varepsilon_0 \frac{U(t)}{d} S", r"=", r"CU(t)").scale(0.78)

        # 颜色高亮关键步骤
        eq1a[0].set_color(YELLOW)
        eq1b[0].set_color(ORANGE)
        eq1c_lhs[0].set_color(GREEN)
        eq1c_lhs[2].set_color(ORANGE)
        eq1c_lhs[4].set_color(YELLOW)
        eq1c_lhs[6].set_color(GREEN)

        eqs1 = VGroup(eq1a, eq1b, eq1c_lhs).arrange(DOWN, buff=0.38).next_to(step1_title, DOWN, buff=0.4)
        # 保持在屏幕内
        eqs1.scale_to_fit_width(11.5)

        note1 = Text("C = ε₀S/d 是平行板电容器的电容", font=CJK, color=CYAN).scale(0.4)
        note1.next_to(eqs1, DOWN, buff=0.3)

        self.play(FadeIn(step1_title))
        self.play(Write(eq1a))
        self.wait(1.0)
        self.play(Write(eq1b))
        self.wait(1.0)
        self.play(Write(eq1c_lhs))
        self.wait(0.8)
        self.play(FadeIn(note1))
        self.wait(1.5)
        self.play(FadeOut(VGroup(step1_title, eqs1, note1)))

        # ── Step 5: 推导第二步——位移电流 ─────────────────────────────────
        step2_title = VGroup(
            Text("Step 2", font=CJK, color=CYAN).scale(0.44),
            Text("对时间求导  →  位移电流", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.25).next_to(title, DOWN, buff=0.42)

        id_def = MathTex(
            r"I_d", r"=", r"\frac{\mathrm{d}\Phi_D}{\mathrm{d}t}",
            r"=", r"\varepsilon_0 S\frac{\mathrm{d}E}{\mathrm{d}t}"
        ).scale(0.82)
        id_def[0].set_color(GREEN)
        id_def[2].set_color(YELLOW)
        id_def[4].set_color(ORANGE)

        id_cdu = MathTex(
            r"I_d", r"=", r"C\frac{\mathrm{d}U}{\mathrm{d}t}"
        ).scale(0.82)
        id_cdu[0].set_color(GREEN)
        id_cdu[2].set_color(YELLOW)

        # 外电路传导电流
        ic_label = MathTex(
            r"I_0", r"=", r"C\frac{\mathrm{d}U}{\mathrm{d}t}"
        ).scale(0.82)
        ic_label[0].set_color(RED)
        ic_label[2].set_color(YELLOW)

        equal_arrow = MathTex(r"\Rightarrow", r"I_d = I_0").scale(0.82)
        equal_arrow[1].set_color(GREEN)

        equal_note = Text("位移电流数值上等于外电路传导电流！", font=CJK, color=GREEN).scale(0.46)

        eqs2 = VGroup(id_def, id_cdu).arrange(DOWN, buff=0.36).next_to(step2_title, DOWN, buff=0.4)
        compare = VGroup(ic_label, equal_arrow, equal_note).arrange(DOWN, buff=0.28)
        compare.next_to(eqs2, DOWN, buff=0.4)
        all2 = VGroup(eqs2, compare).scale_to_fit_width(11.5)

        self.play(FadeIn(step2_title))
        self.play(Write(id_def))
        self.wait(1.0)
        self.play(Write(id_cdu))
        self.wait(1.0)
        self.play(Write(ic_label))
        self.wait(0.8)
        self.play(Write(equal_arrow))
        self.wait(0.5)
        self.play(FadeIn(equal_note))
        self.wait(1.6)
        self.play(FadeOut(VGroup(step2_title, all2)))

        # ── Step 6: ValueTracker 演示 I_d 随交流电变化 ─────────────────
        tracker_title = Text("位移电流随交流电变化", font=CJK, color=BLUE).scale(0.46)
        tracker_title.next_to(title, DOWN, buff=0.42)

        axes = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.5, 1.5, 1],
            x_length=9.0,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.5)

        x_lbl = MathTex(r"t").scale(0.52).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = MathTex(r"I").scale(0.52).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        t_val = ValueTracker(0.0)
        omega_val = 1.0

        # U(t) = U0 sin(ωt) => I_d = C*dU/dt = C*U0*ω*cos(ωt)
        # 这里归一化 C*U0*ω = 1
        curve_id = always_redraw(
            lambda: axes.plot(
                lambda x: math.cos(omega_val * x),
                x_range=[0, min(t_val.get_value() + 0.01, 4 * PI)],
                color=GREEN,
                stroke_width=2.5,
            )
        )
        curve_u = always_redraw(
            lambda: axes.plot(
                lambda x: math.sin(omega_val * x),
                x_range=[0, min(t_val.get_value() + 0.01, 4 * PI)],
                color=RED,
                stroke_width=2.0,
                stroke_opacity=0.7,
            )
        )

        dot_id = always_redraw(
            lambda: Dot(
                axes.c2p(t_val.get_value(), math.cos(omega_val * t_val.get_value())),
                color=GREEN, radius=0.10,
            )
        )
        dot_u = always_redraw(
            lambda: Dot(
                axes.c2p(t_val.get_value(), math.sin(omega_val * t_val.get_value())),
                color=RED, radius=0.08,
            )
        )

        legend_id = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=GREEN, stroke_width=2.5),
            Text("位移电流 I_d", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        legend_u = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=RED, stroke_width=2.0),
            Text("电压 U(t)（参考）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        legend = VGroup(legend_id, legend_u).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        legend.to_corner(UR, buff=0.5)

        self.play(FadeIn(tracker_title))
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.add(curve_id, curve_u, dot_id, dot_u)
        self.play(FadeIn(legend))
        self.wait(0.4)
        self.play(t_val.animate.set_value(4 * PI), run_time=5, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(VGroup(tracker_title, axes, x_lbl, y_lbl, legend,
                                  curve_id, curve_u, dot_id, dot_u)))

        # ── Step 7: 安培定律——全电流的路径无关性 ─────────────────────────
        step3_title = VGroup(
            Text("Step 3", font=CJK, color=CYAN).scale(0.44),
            Text("安培定律：全电流的路径无关性", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.25).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step3_title))
        self.wait(0.5)

        # 重绘电容器（简化版）
        p_top = Rectangle(width=2.8, height=0.15, color=BLUE, fill_color=BLUE, fill_opacity=0.8)
        p_bot = Rectangle(width=2.8, height=0.15, color=BLUE, fill_color=BLUE, fill_opacity=0.8)
        p_top.move_to(UP * 0.9 + RIGHT * 0.2)
        p_bot.move_to(DOWN * 0.9 + RIGHT * 0.2)

        # 左侧导线
        w_lt = Line(p_top.get_left(), p_top.get_left() + LEFT * 1.6, color=WHITE, stroke_width=2)
        w_lb = Line(p_bot.get_left(), p_bot.get_left() + LEFT * 1.6, color=WHITE, stroke_width=2)
        w_lv = Line(w_lt.get_end(), w_lb.get_end(), color=WHITE, stroke_width=2)

        # 电流箭头（传导）
        i_arrow_top = Arrow(
            w_lt.get_start() + LEFT * 0.1, w_lt.get_end() + LEFT * 0.05,
            buff=0, color=RED, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.22,
        )
        i_label_top = VGroup(
            Text("传导电流", font=CJK, color=RED).scale(0.36),
            MathTex(r"I_0", color=RED).scale(0.5),
        ).arrange(DOWN, buff=0.08).next_to(i_arrow_top, UP, buff=0.12)

        # 面1：穿过导线（绿色虚线轮廓）
        surf1 = DashedVMobject(
            Ellipse(width=2.2, height=1.5, color=GREEN, stroke_width=2.0),
            num_dashes=22,
        ).move_to(w_lt.get_center() + DOWN * 0.05)
        surf1_label = VGroup(
            Text("曲面", font=CJK, color=GREEN).scale(0.35),
            MathTex(r"S_1", color=GREEN).scale(0.46),
        ).arrange(RIGHT, buff=0.08).next_to(surf1, UP, buff=0.08)

        # 面2：穿过极板间隙（绿色虚线轮廓）
        surf2 = DashedVMobject(
            Ellipse(width=2.2, height=1.5, color=GREEN, stroke_width=2.0),
            num_dashes=22,
        ).move_to(p_top.get_center() + DOWN * 0.9)
        surf2_label = VGroup(
            Text("曲面", font=CJK, color=GREEN).scale(0.35),
            MathTex(r"S_2", color=GREEN).scale(0.46),
        ).arrange(RIGHT, buff=0.08).next_to(surf2, RIGHT, buff=0.08)

        # 环路 L 圆弧（围绕左侧导线）
        loop_L = DashedVMobject(
            Circle(radius=1.0, color=ORANGE, stroke_width=2.0),
            num_dashes=20,
        ).move_to(w_lt.get_center())
        loop_label = MathTex(r"L", color=ORANGE).scale(0.55)
        loop_label.next_to(loop_L, UR, buff=0.08)

        cap_diag2 = VGroup(p_top, p_bot, w_lt, w_lb, w_lv)

        self.play(Create(p_top), Create(p_bot), Create(w_lt), Create(w_lb), Create(w_lv))
        self.play(Create(i_arrow_top), FadeIn(i_label_top))
        self.wait(0.8)
        self.play(Create(loop_L), FadeIn(loop_label))
        self.wait(0.6)
        self.play(Create(surf1), FadeIn(surf1_label))
        self.wait(0.8)
        self.play(Create(surf2), FadeIn(surf2_label))
        self.wait(1.0)

        # 安培定律全电流形式
        ampere_eq = MathTex(
            r"\oint_L \mathbf{H}\cdot\mathrm{d}\mathbf{l}",
            r"=",
            r"I_0 + I_d",
        ).scale(0.78)
        ampere_eq[0].set_color(ORANGE)
        ampere_eq[2].set_color(GREEN)
        ampere_eq.to_corner(DR, buff=0.55)

        s1_result = MathTex(r"S_1\text{:}\; I_0,\; I_d=0", color=RED).scale(0.62)
        s2_result = MathTex(r"S_2\text{:}\; I_0=0,\; I_d", color=GREEN).scale(0.62)
        s_results = VGroup(s1_result, s2_result).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        s_results.next_to(ampere_eq, UP, buff=0.3)

        self.play(Write(ampere_eq))
        self.wait(0.8)
        self.play(FadeIn(s_results))
        self.wait(1.4)

        key_msg = Text("两个曲面给出相同的环路积分——全电流守恒！", font=CJK, color=GREEN).scale(0.43)
        key_msg.next_to(step3_title, DOWN, buff=0.22)
        self.play(FadeIn(key_msg))
        self.wait(1.8)

        all_step3 = VGroup(
            step3_title, cap_diag2, i_arrow_top, i_label_top,
            loop_L, loop_label, surf1, surf1_label, surf2, surf2_label,
            ampere_eq, s_results, key_msg,
        )
        self.play(FadeOut(all_step3))

        # ── Step 8: 位移电流的物理含义说明 ──────────────────────────────
        meaning_title = Text("位移电流的物理含义", font=CJK, color=BLUE).scale(0.52)
        meaning_title.next_to(title, DOWN, buff=0.45)

        m1 = Text("位移电流不是电荷的流动，", font=CJK).scale(0.46)
        m2 = Text("而是变化电场（∂D/∂t）在安培定律中扮演的角色。", font=CJK).scale(0.46)
        m3 = Text("它产生的磁场与相同传导电流产生的磁场完全一样。", font=CJK, color=GREEN).scale(0.46)
        m4 = Text("这是麦克斯韦对安培定律的重大修正，", font=CJK, color=YELLOW).scale(0.46)
        m5 = Text("也是电磁波能够存在的根本原因。", font=CJK, color=YELLOW).scale(0.46)

        meanings = VGroup(m1, m2, m3, m4, m5).arrange(DOWN, buff=0.24).next_to(meaning_title, DOWN, buff=0.4)
        meanings.scale_to_fit_width(12.0)

        self.play(FadeIn(meaning_title))
        self.play(FadeIn(m1))
        self.wait(0.6)
        self.play(FadeIn(m2))
        self.wait(0.8)
        self.play(FadeIn(m3))
        self.wait(0.8)
        self.play(FadeIn(m4))
        self.wait(0.6)
        self.play(FadeIn(m5))
        self.wait(1.6)
        self.play(FadeOut(VGroup(meaning_title, meanings)))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)

        sum1 = MathTex(
            r"I_d = \frac{\mathrm{d}\Phi_D}{\mathrm{d}t} = \varepsilon_0 S\frac{\mathrm{d}E}{\mathrm{d}t}",
            color=YELLOW,
        ).scale(0.76)
        sum2 = MathTex(
            r"I_d = C\frac{\mathrm{d}U}{\mathrm{d}t} = I_0",
            color=YELLOW,
        ).scale(0.76)
        sum3 = MathTex(
            r"\oint_L \mathbf{H}\cdot\mathrm{d}\mathbf{l} = I_0 + I_d",
            color=ORANGE,
        ).scale(0.76)
        sum4 = Text("位移电流不是电荷流，但激发同样的磁场", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(sum1, sum2, sum3, sum4).arrange(DOWN, buff=0.36).next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.0)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(sum1))
        self.wait(0.8)
        self.play(Write(sum2))
        self.wait(0.8)
        self.play(Write(sum3))
        self.wait(0.8)
        self.play(FadeIn(sum4), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Ex1CapacitorDisplacementCurrent",
        "id": "phys-ch09-9.4-ex1-capacitor-displacement-current",
        "chapterId": "ch09",
        "sectionId": "9.4",
        "title": "平行板电容器中的位移电流",
        "description": "逐步推导平行板电容器中的位移电流 I_d = C dU/dt，演示其与传导电流数值相等，并用安培全电流定律说明路径无关性。",
    },
]
