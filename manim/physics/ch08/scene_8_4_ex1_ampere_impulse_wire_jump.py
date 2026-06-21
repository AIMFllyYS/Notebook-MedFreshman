"""第 8.4 节 · 例题：安培力冲量使导线跳起。

物理场景：水银槽中一根水平导线（长 l、质量 m），均匀磁场 B 垂直纸面向里，
瞬间接通电流 I(t)。安培力冲量 Blq=mv 给导线竖直速度，导线从水银槽跳出后
作竖直上抛，上升高度 h=v²/(2g)，反推所需电量 q=m/(Bl)·√(2gh)。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Ex1AmpereImpulseWireJump",
        "id": "phys-ch08-8.4-ex1-ampere-impulse-wire-jump",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "安培力冲量使导线跳起",
        "description": "通过安培力冲量 Blq=mv 推导水银槽导线跳起高度，并用 ValueTracker 演示电量 q 对跳高 h 的参数依赖。",
    },
]


class Ch08Ex1AmpereImpulseWireJump(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("安培力冲量使导线跳起", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.4 例题", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("想象用手指弹一根铁丝，手指给铁丝一个瞬间的力冲量，", font=CJK).scale(0.46)
        ana2 = Text("铁丝就能跳起来。磁场 + 电流也能做同样的事：", font=CJK).scale(0.46)
        ana3 = Text("瞬间电流在磁场中产生安培力，给导线一个冲量，导线跳出水银槽！", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 侧视图 —— 水银槽 + 导线 + 磁场符号 + 安培力方向 ────
        scene_label = Text("侧视图：物理情境", font=CJK, color=BLUE).scale(0.50)
        scene_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(scene_label))

        # 水银槽（矩形容器）
        trough = Rectangle(width=4.0, height=0.7, color=BLUE_E, fill_color=BLUE_E, fill_opacity=0.25)
        trough.move_to(DOWN * 1.5)
        trough_label = Text("水银槽", font=CJK, color=BLUE_C).scale(0.38)
        trough_label.next_to(trough, DOWN, buff=0.12)

        # 水银液面
        mercury = Rectangle(width=4.0, height=0.35, color=GRAY_B, fill_color=GRAY_B, fill_opacity=0.55)
        mercury.move_to(trough.get_top() + DOWN * 0.175)

        # 导线（横线）浸在水银中
        wire = Line(LEFT * 1.6, RIGHT * 1.6, color=ORANGE, stroke_width=5)
        wire.move_to(mercury.get_center())
        wire_label = Text("导线 (l, m)", font=CJK, color=ORANGE).scale(0.38)
        wire_label.next_to(wire, RIGHT, buff=0.18)

        # 磁场符号（× 向纸面内），散布在背景
        cross_positions = [
            LEFT * 2.8 + UP * 0.5, LEFT * 1.4 + UP * 0.5, ORIGIN + UP * 0.5,
            RIGHT * 1.4 + UP * 0.5, RIGHT * 2.8 + UP * 0.5,
            LEFT * 2.8 + DOWN * 0.1, RIGHT * 2.8 + DOWN * 0.1,
        ]
        crosses = VGroup()
        for pos in cross_positions:
            c = VGroup(
                Line(LEFT * 0.10 + UP * 0.10, RIGHT * 0.10 + DOWN * 0.10, color=CYAN, stroke_width=2),
                Line(LEFT * 0.10 + DOWN * 0.10, RIGHT * 0.10 + UP * 0.10, color=CYAN, stroke_width=2),
            ).move_to(pos)
            crosses.add(c)
        b_label = VGroup(
            MathTex(r"\vec{B}", color=CYAN).scale(0.60),
            Text("（垂直纸面向里）", font=CJK, color=CYAN).scale(0.35),
        ).arrange(RIGHT, buff=0.10)
        b_label.to_corner(UR, buff=0.55)

        # 电流方向标注（向右）
        i_arrow = Arrow(LEFT * 1.3 + DOWN * 1.5, RIGHT * 1.3 + DOWN * 1.5,
                        color=RED, buff=0, stroke_width=3)
        i_label = VGroup(
            MathTex(r"I", color=RED).scale(0.55),
            Text("（电流方向）", font=CJK, color=RED).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        i_label.next_to(i_arrow, DOWN, buff=0.12)

        # 安培力方向（向上）
        f_arrow = Arrow(wire.get_center() + LEFT * 0.05,
                        wire.get_center() + LEFT * 0.05 + UP * 1.2,
                        color=GREEN, buff=0, stroke_width=4)
        f_label = VGroup(
            MathTex(r"F", color=GREEN).scale(0.55),
            Text("安培力", font=CJK, color=GREEN).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        f_label.next_to(f_arrow, LEFT, buff=0.12)

        self.play(Create(trough), FadeIn(trough_label))
        self.play(FadeIn(mercury))
        self.play(Create(wire), FadeIn(wire_label))
        self.play(Create(crosses), FadeIn(b_label))
        self.wait(0.6)
        self.play(GrowArrow(i_arrow), FadeIn(i_label))
        self.wait(0.6)
        self.play(GrowArrow(f_arrow), FadeIn(f_label))

        # 右手定则提示
        rhr = Text("左手定则：四指指向电流 I，磁场 B 穿手心 → 大拇指朝上 = 安培力向上",
                   font=CJK, color=YELLOW).scale(0.38)
        rhr.to_edge(DOWN, buff=0.55)
        rhr.scale_to_fit_width(13.5)
        self.play(FadeIn(rhr))
        self.wait(2.0)

        side_view_all = VGroup(trough, trough_label, mercury, wire, wire_label,
                               crosses, b_label, i_arrow, i_label, f_arrow, f_label, rhr, scene_label)
        self.play(FadeOut(side_view_all))

        # ── Step 4: 冲量推导 —— 电流-时间曲线与面积 ─────────────────────
        deriv_label = Text("推导：电流冲量 → 动量", font=CJK, color=BLUE).scale(0.50)
        deriv_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(deriv_label))

        # 画 i-t 坐标轴
        ax = Axes(
            x_range=[0, 2.5, 0.5],
            y_range=[0, 2.5, 0.5],
            x_length=4.5,
            y_length=3.0,
            axis_config={"color": WHITE, "include_tip": True},
        )
        ax.shift(LEFT * 2.5 + DOWN * 0.8)
        x_lbl = VGroup(MathTex(r"t", color=WHITE).scale(0.55),
                        Text("（时间）", font=CJK, color=WHITE).scale(0.32)).arrange(RIGHT, buff=0.08)
        x_lbl.next_to(ax.x_axis, RIGHT, buff=0.15)
        y_lbl = VGroup(MathTex(r"i(t)", color=WHITE).scale(0.55),
                        Text("（电流）", font=CJK, color=WHITE).scale(0.32)).arrange(RIGHT, buff=0.08)
        y_lbl.next_to(ax.y_axis, UP, buff=0.12)

        # i(t) 曲线：快速衰减脉冲（模拟瞬间电流）
        pulse_curve = ax.plot(lambda t: 2.0 * math.exp(-2.5 * t) if t > 0.01 else 2.0,
                              x_range=[0.01, 2.4], color=YELLOW, stroke_width=3)
        # 曲线下面积 = 电量 q
        area = ax.get_area(pulse_curve, x_range=[0.01, 2.4],
                           color=ORANGE, opacity=0.40)

        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(pulse_curve))
        self.play(FadeIn(area))
        area_label = VGroup(
            Text("面积", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"=\int_0^{\tau} i\,\mathrm{d}t = q", color=ORANGE).scale(0.60),
        ).arrange(RIGHT, buff=0.10)
        area_label.next_to(ax, DOWN, buff=0.20)
        self.play(FadeIn(area_label))
        self.wait(1.2)

        # 右侧逐步写推导公式
        eq1 = MathTex(r"F = Bil", color=WHITE).scale(0.70)
        eq2 = MathTex(r"\int_0^{\tau} F\,\mathrm{d}t = Bl\int_0^{\tau} i\,\mathrm{d}t", color=WHITE).scale(0.65)
        eq3 = MathTex(r"= Blq", color=YELLOW).scale(0.70)
        eq4 = MathTex(r"= mv", color=GREEN).scale(0.70)
        eqs = VGroup(eq1, eq2, eq3, eq4).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        eqs.next_to(ax, RIGHT, buff=0.55)
        eqs.shift(UP * 0.3)

        eq1_note = Text("安培力", font=CJK, color=WHITE).scale(0.36)
        eq1_note.next_to(eq1, RIGHT, buff=0.12)
        eq2_note = Text("两边对时间积分", font=CJK, color=WHITE).scale(0.36)
        eq2_note.next_to(eq2, RIGHT, buff=0.08)
        eq3_note = Text("定义：电量", font=CJK, color=YELLOW).scale(0.36)
        eq3_note.next_to(eq3, RIGHT, buff=0.12)
        eq4_note = Text("= 动量", font=CJK, color=GREEN).scale(0.36)
        eq4_note.next_to(eq4, RIGHT, buff=0.12)

        self.play(Write(eq1), FadeIn(eq1_note))
        self.wait(0.8)
        self.play(Write(eq2), FadeIn(eq2_note))
        self.wait(0.8)
        self.play(Write(eq3), FadeIn(eq3_note))
        eq3.set_color(YELLOW)
        self.wait(0.8)
        self.play(Write(eq4), FadeIn(eq4_note))
        self.wait(1.4)

        deriv1_all = VGroup(deriv_label, ax, x_lbl, y_lbl, pulse_curve, area, area_label,
                            eq1, eq2, eq3, eq4, eq1_note, eq2_note, eq3_note, eq4_note)
        self.play(FadeOut(deriv1_all))

        # ── Step 5: 时序动画（接通 → 冲量 → 离槽 → 抛体）────────────────
        seq_label = Text("时序：导线跳出水银槽全过程", font=CJK, color=BLUE).scale(0.50)
        seq_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(seq_label))

        steps = [
            ("① 接通电路", WHITE),
            ("② 瞬间电流 i(t) 流过导线", WHITE),
            ("③ 安培力冲量：Blq = mv", YELLOW),
            ("④ 导线获得速度 v，离开水银槽", ORANGE),
            ("⑤ 竖直上抛：h = v²/(2g)", GREEN),
        ]
        step_items = VGroup()
        for txt, col in steps:
            item = Text(txt, font=CJK, color=col).scale(0.46)
            step_items.add(item)
        step_items.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        step_items.next_to(seq_label, DOWN, buff=0.45)
        step_items.scale_to_fit_width(8.0)
        step_items.shift(LEFT * 1.5)

        # 小导线动画：先静止再跳起
        mini_trough = Rectangle(width=2.0, height=0.45, color=BLUE_E,
                                 fill_color=BLUE_E, fill_opacity=0.30)
        mini_trough.to_corner(DR, buff=0.9)
        mini_mercury = Rectangle(width=2.0, height=0.20, color=GRAY_B,
                                  fill_color=GRAY_B, fill_opacity=0.55)
        mini_mercury.move_to(mini_trough.get_top() + DOWN * 0.10)
        mini_wire = Line(LEFT * 0.75, RIGHT * 0.75, color=ORANGE, stroke_width=4)
        mini_wire.move_to(mini_mercury.get_center())
        mini_label = Text("导线", font=CJK, color=ORANGE).scale(0.35)
        mini_label.next_to(mini_wire, RIGHT, buff=0.10)

        self.play(Create(mini_trough), FadeIn(mini_mercury), Create(mini_wire), FadeIn(mini_label))

        for i, item in enumerate(step_items):
            self.play(FadeIn(item))
            if i == 2:  # 冲量阶段
                imp_arrow = Arrow(mini_wire.get_center(),
                                  mini_wire.get_center() + UP * 0.7,
                                  color=GREEN, buff=0, stroke_width=3)
                self.play(GrowArrow(imp_arrow))
                self.wait(0.5)
                self.play(FadeOut(imp_arrow))
            elif i == 3:  # 导线跳出
                self.play(mini_wire.animate.shift(UP * 1.0),
                          mini_label.animate.shift(UP * 1.0), run_time=0.8)
            self.wait(0.9)

        self.wait(1.0)
        seq_all = VGroup(seq_label, step_items, mini_trough, mini_mercury, mini_wire, mini_label)
        self.play(FadeOut(seq_all))

        # ── Step 6: 完整推导链（含数值代入准备）────────────────────────
        chain_label = Text("完整推导链", font=CJK, color=BLUE).scale(0.50)
        chain_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(chain_label))

        # 逐步出现推导公式
        c1 = MathTex(r"\underbrace{Blq}_{", r"\text{impulse}",
                     r"} = mv", color=WHITE).scale(0.75)
        c1[1].set_color(YELLOW)
        c2 = MathTex(r"v = \frac{Blq}{m}", color=YELLOW).scale(0.80)
        c3 = MathTex(r"v = \sqrt{2gh}", color=ORANGE).scale(0.80)
        c4 = MathTex(r"\frac{Blq}{m} = \sqrt{2gh}", color=WHITE).scale(0.75)
        c5 = MathTex(r"q = \frac{m}{Bl}\sqrt{2gh}", color=GREEN).scale(0.85)

        chain = VGroup(c1, c2, c3, c4, c5).arrange(DOWN, buff=0.40)
        chain.next_to(chain_label, DOWN, buff=0.45)
        chain.scale_to_fit_width(10.0)

        notes = [
            Text("安培力冲量 = 动量", font=CJK, color=WHITE).scale(0.38),
            Text("导线获得速度 v", font=CJK, color=YELLOW).scale(0.38),
            Text("上抛到高度 h（能量守恒）", font=CJK, color=ORANGE).scale(0.38),
            Text("联立两式", font=CJK, color=WHITE).scale(0.38),
            Text("解出所需电量 q", font=CJK, color=GREEN).scale(0.38),
        ]
        for note, eq in zip(notes, chain):
            note.next_to(eq, RIGHT, buff=0.20)

        for eq, note in zip(chain, notes):
            self.play(Write(eq), FadeIn(note))
            self.wait(0.85)

        box_chain = SurroundingRectangle(c5, color=GREEN, buff=0.20, corner_radius=0.10)
        self.play(Create(box_chain))
        self.wait(1.8)

        chain_all = VGroup(chain_label, chain, VGroup(*notes), box_chain)
        self.play(FadeOut(chain_all))

        # ── Step 7: ValueTracker — 参数依赖演示（柱状图）───────────────
        vt_label = Text("参数依赖：电量 q 越大，导线跳得越高", font=CJK, color=BLUE).scale(0.50)
        vt_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(vt_label))

        # 固定参数
        B_val = 0.5   # T
        l_val = 0.5   # m
        m_val = 0.05  # kg
        g_val = 10.0  # m/s²

        def h_of_q(q_v):
            v = B_val * l_val * q_v / m_val
            return v * v / (2 * g_val)

        # ValueTracker
        q_tracker = ValueTracker(0.1)

        # 坐标轴（高度 vs 时间，不用；改做 q vs h 曲线）
        ax2 = Axes(
            x_range=[0, 1.2, 0.2],
            y_range=[0, 1.8, 0.3],
            x_length=5.5,
            y_length=3.2,
            axis_config={"color": WHITE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0.2, 0.4, 0.6, 0.8, 1.0]},
            y_axis_config={"numbers_to_include": [0.3, 0.6, 0.9, 1.2, 1.5]},
        )
        ax2.shift(LEFT * 1.5 + DOWN * 0.5)
        x2_lbl = VGroup(MathTex(r"q\ (\mathrm{C})", color=WHITE).scale(0.50))
        x2_lbl.next_to(ax2.x_axis, RIGHT, buff=0.10)
        y2_lbl = VGroup(MathTex(r"h\ (\mathrm{m})", color=WHITE).scale(0.50))
        y2_lbl.next_to(ax2.y_axis, UP, buff=0.10)

        h_curve = ax2.plot(lambda q_v: h_of_q(q_v),
                           x_range=[0.01, 1.15], color=ORANGE, stroke_width=2.5)

        # 动态点 + 垂线
        moving_dot = always_redraw(lambda: Dot(
            ax2.c2p(q_tracker.get_value(), h_of_q(q_tracker.get_value())),
            color=YELLOW, radius=0.10,
        ))
        v_line = always_redraw(lambda: DashedLine(
            ax2.c2p(q_tracker.get_value(), 0),
            ax2.c2p(q_tracker.get_value(), h_of_q(q_tracker.get_value())),
            color=YELLOW, dash_length=0.12,
        ))
        h_line = always_redraw(lambda: DashedLine(
            ax2.c2p(0, h_of_q(q_tracker.get_value())),
            ax2.c2p(q_tracker.get_value(), h_of_q(q_tracker.get_value())),
            color=GREEN, dash_length=0.12,
        ))

        # 右侧数值读出
        readout_q = always_redraw(lambda: VGroup(
            Text("q = ", font=CJK, color=YELLOW).scale(0.46),
            MathTex(rf"{q_tracker.get_value():.2f}", r"\ \mathrm{C}", color=YELLOW).scale(0.60),
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.7).shift(DOWN * 0.8))
        readout_h = always_redraw(lambda: VGroup(
            Text("h = ", font=CJK, color=GREEN).scale(0.46),
            MathTex(rf"{h_of_q(q_tracker.get_value()):.3f}", r"\ \mathrm{m}", color=GREEN).scale(0.60),
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.7).shift(DOWN * 1.5))

        param_info = VGroup(
            VGroup(MathTex(r"B=0.5", r"\ \mathrm{T}", color=CYAN).scale(0.50)),
            VGroup(MathTex(r"l=0.5", r"\ \mathrm{m}", color=CYAN).scale(0.50)),
            VGroup(MathTex(r"m=0.05", r"\ \mathrm{kg}", color=CYAN).scale(0.50)),
        )
        param_info.arrange(DOWN, buff=0.20, aligned_edge=LEFT)
        param_info.to_corner(UR, buff=0.7).shift(DOWN * 2.4)

        formula_box_txt = MathTex(r"h=\frac{B^2 l^2 q^2}{2m^2 g}", color=ORANGE).scale(0.60)
        formula_box_txt.to_corner(UR, buff=0.7)
        fbox = SurroundingRectangle(formula_box_txt, color=ORANGE, buff=0.12, corner_radius=0.08)

        self.play(Create(ax2), FadeIn(x2_lbl), FadeIn(y2_lbl))
        self.play(Create(h_curve))
        self.play(Create(moving_dot), Create(v_line), Create(h_line))
        self.add(readout_q, readout_h)
        self.play(FadeIn(param_info), Write(formula_box_txt), Create(fbox))
        self.wait(0.6)

        # 扫动 q
        self.play(q_tracker.animate.set_value(1.0), run_time=3.5)
        self.wait(0.6)
        self.play(q_tracker.animate.set_value(0.3), run_time=2.0)
        self.wait(0.6)
        self.play(q_tracker.animate.set_value(0.5), run_time=1.5)
        self.wait(1.2)

        q_note = Text("q 越大 → v 越大 → h 越大（二次关系：h ∝ q²）",
                      font=CJK, color=YELLOW).scale(0.42)
        q_note.to_edge(DOWN, buff=0.55)
        q_note.scale_to_fit_width(13.5)
        self.play(FadeIn(q_note))
        self.wait(1.8)

        vt_all = VGroup(vt_label, ax2, x2_lbl, y2_lbl, h_curve, moving_dot,
                        v_line, h_line, readout_q, readout_h, param_info,
                        formula_box_txt, fbox, q_note)
        self.play(FadeOut(vt_all))

        # ── Step 8: 数值代入计算 ─────────────────────────────────────────
        num_label = Text("数值计算", font=CJK, color=BLUE).scale(0.50)
        num_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(num_label))

        given = VGroup(
            Text("已知：B = 0.5 T，l = 0.5 m，m = 0.05 kg，h = 0.5 m，g = 10 m/s²",
                 font=CJK, color=WHITE).scale(0.42),
            Text("求：所需电量 q", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(DOWN, buff=0.20, aligned_edge=LEFT)
        given.next_to(num_label, DOWN, buff=0.40)
        given.scale_to_fit_width(13.0)
        self.play(FadeIn(given))
        self.wait(1.0)

        num1 = MathTex(r"q = \frac{m}{Bl}\sqrt{2gh}", color=WHITE).scale(0.80)
        num2 = MathTex(r"= \frac{0.05}{0.5 \times 0.5}\sqrt{2 \times 10 \times 0.5}",
                       color=WHITE).scale(0.72)
        num3 = MathTex(r"= \frac{0.05}{0.25}\times\sqrt{10}",
                       color=WHITE).scale(0.72)
        num4 = MathTex(r"= 0.2 \times 3.162 \approx 0.632\ \mathrm{C}",
                       color=GREEN).scale(0.80)

        num_chain = VGroup(num1, num2, num3, num4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        num_chain.next_to(given, DOWN, buff=0.40)
        num_chain.scale_to_fit_width(11.0)

        for eq in num_chain:
            self.play(Write(eq))
            self.wait(0.85)

        result_box = SurroundingRectangle(num4, color=GREEN, buff=0.15, corner_radius=0.10)
        self.play(Create(result_box))
        self.wait(1.6)

        num_all = VGroup(num_label, given, num_chain, result_box)
        self.play(FadeOut(num_all))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(s_title))

        s1 = MathTex(r"\int_0^{\tau} F\,\mathrm{d}t = Bl\int_0^{\tau} i\,\mathrm{d}t = Blq",
                     color=YELLOW).scale(0.68)
        s2 = MathTex(r"Blq = mv,\quad v = \sqrt{2gh}", color=YELLOW).scale(0.68)
        s3 = MathTex(r"q = \frac{m}{Bl}\sqrt{2gh}", color=GREEN).scale(0.78)

        s1_zh = Text("安培力冲量 = 电量 q 的函数", font=CJK, color=WHITE).scale(0.40)
        s2_zh = Text("冲量 = 动量增量，上抛能量守恒", font=CJK, color=WHITE).scale(0.40)
        s3_zh = Text("反推所需最小电量", font=CJK, color=GREEN).scale(0.40)

        r1 = VGroup(s1, s1_zh).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        r2 = VGroup(s2, s2_zh).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        r3 = VGroup(s3, s3_zh).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        summary = VGroup(r1, r2, r3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(12.5)

        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(Write(s1), FadeIn(s1_zh))
        self.wait(0.8)
        self.play(Write(s2), FadeIn(s2_zh))
        self.wait(0.8)
        self.play(Write(s3), FadeIn(s3_zh))
        self.play(Create(box_s))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box_s, title)))
        self.wait(0.4)
