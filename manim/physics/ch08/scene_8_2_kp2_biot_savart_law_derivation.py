"""第 8.2 节 · 毕奥-萨伐尔定律与电流元叠加（矢量场 / ValueTracker 扫动范式）。

四步结构：
  ① 电流元 Idl 与场点 P 的矢量关系；叉积方向直觉
  ② dB 随 θ 角变化的曲线
  ③ 有限长直导线积分：ValueTracker 扫动各电流元叠加
  ④ 完整公式 + 无限长特例 + 同心圆磁场线

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Kp2BiotSavartLawDerivation",
        "id": "phys-ch08-8.2-kp2-biot-savart-law-derivation",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "毕奥-萨伐尔定律与电流元叠加",
        "description": "从电流元 Idl 出发，逐步推导毕奥-萨伐尔定律，通过叉积动画与积分扫动展示有限长导线磁场公式及无限长特例的同心圆场线。",
    },
]


class Ch08Kp2BiotSavartLawDerivation(Scene):
    def construct(self):

        # ── Step 1: 标题 ──────────────────────────────────────────────
        title = Text("毕奥-萨伐尔定律", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ──────────────────────────────────────────
        a1 = Text("电流会在周围产生磁场，就像手电筒照亮周围空间。", font=CJK).scale(0.48)
        a2 = Text("弯曲导线可以分成无数个小电流元 Idl，", font=CJK).scale(0.48)
        a3 = Text("每段都贡献一份 dB，叠加起来就是总磁场。", font=CJK).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        for line in [a1, a2, a3]:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ── Step 3: 定义——电流元与 dB 方向（叉积直觉）───────────────
        sec_label = Text("一、电流元与磁场方向", font=CJK, color=BLUE).scale(0.52)
        sec_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_label))
        self.wait(0.5)

        # 绘制几何示意图：导线段、电流元箭头、r 矢量、P 点
        wire_start = np.array([-3.2, -0.5, 0])
        wire_end   = np.array([0.8,  -0.5, 0])
        wire = Line(wire_start, wire_end, color=ORANGE, stroke_width=5)

        # 电流方向标签
        I_label = VGroup(
            Text("I", font=CJK, color=ORANGE).scale(0.55),
            Arrow(np.array([-2.4, -0.8, 0]), np.array([-1.2, -0.8, 0]),
                  buff=0, color=ORANGE, stroke_width=2,
                  max_tip_length_to_length_ratio=0.35)
        ).arrange(RIGHT, buff=0.12)
        I_label.move_to(np.array([-1.8, -1.1, 0]))

        # 电流元（Idl），黄色箭头
        dl_start = np.array([-1.0, -0.5, 0])
        dl_end   = np.array([-0.3, -0.5, 0])
        dl_arrow = Arrow(dl_start, dl_end, buff=0, color=YELLOW, stroke_width=4,
                         max_tip_length_to_length_ratio=0.35)
        dl_label = VGroup(
            Text("I", font=CJK, color=YELLOW).scale(0.45),
            MathTex(r"\mathrm{d}\mathbf{l}", color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.05).next_to(dl_arrow, DOWN, buff=0.15)

        # 场点 P 与 r 矢量
        P_pos = np.array([1.4, 1.2, 0])
        P_dot = Dot(P_pos, color=WHITE, radius=0.10)
        P_text = Text("P", font=CJK, color=WHITE).scale(0.5).next_to(P_dot, RIGHT, buff=0.1)
        dl_mid = (dl_start + dl_end) / 2
        r_arrow = Arrow(dl_mid, P_pos, buff=0.12, color=WHITE, stroke_width=3,
                        max_tip_length_to_length_ratio=0.22)
        r_label = MathTex(r"\mathbf{r}", color=WHITE).scale(0.7)
        r_label.move_to(dl_mid + (P_pos - dl_mid) * 0.55 + np.array([0.25, 0.15, 0]))

        # θ 角弧线
        theta_angle = Angle(
            Line(dl_mid, dl_end + np.array([0.5, 0, 0])),
            Line(dl_mid, P_pos),
            radius=0.55, color=GREEN
        )
        theta_label = MathTex(r"\theta", color=GREEN).scale(0.65)
        theta_label.move_to(dl_mid + np.array([0.5, 0.45, 0]))

        # dB 方向（垂直纸面向外，用圆圈+点表示）
        dB_pos = np.array([2.8, 0.2, 0])
        dB_circle = Circle(radius=0.18, color=CYAN, stroke_width=2.5).move_to(dB_pos)
        dB_dot_in = Dot(dB_pos, color=CYAN, radius=0.06)
        dB_label = VGroup(
            MathTex(r"\mathrm{d}\mathbf{B}", color=CYAN).scale(0.65),
            Text("(垂直纸面向外)", font=CJK, color=CYAN).scale(0.38),
        ).arrange(DOWN, buff=0.08).next_to(dB_circle, RIGHT, buff=0.15)

        geo_group = VGroup(wire, I_label, dl_arrow, dl_label,
                           P_dot, P_text, r_arrow, r_label,
                           theta_angle, theta_label,
                           dB_circle, dB_dot_in, dB_label)

        self.play(Create(wire), FadeIn(I_label))
        self.wait(0.5)
        self.play(Create(dl_arrow), FadeIn(dl_label))
        self.wait(0.5)
        self.play(Create(r_arrow), FadeIn(r_label), FadeIn(P_dot), FadeIn(P_text))
        self.wait(0.5)
        self.play(Create(theta_angle), FadeIn(theta_label))
        self.wait(0.8)

        # 叉积方向说明
        cross_note = Text("右手定则：dB 垂直于 Idl 与 r 所在平面", font=CJK, color=CYAN).scale(0.44)
        cross_note.to_edge(DOWN, buff=0.9)
        self.play(FadeIn(cross_note))
        self.play(FadeIn(dB_circle), FadeIn(dB_dot_in), FadeIn(dB_label))
        self.wait(1.2)

        # 毕奥-萨伐尔微分形式
        biot_eq = MathTex(
            r"\mathrm{d}\mathbf{B}",
            r"=",
            r"\frac{\mu_0}{4\pi}",
            r"\frac{I\mathrm{d}\mathbf{l}\times\hat{\mathbf{r}}}{r^2}",
            color=WHITE
        ).scale(0.78)
        biot_eq[0].set_color(CYAN)
        biot_eq[2].set_color(YELLOW)
        biot_eq[3].set_color(YELLOW)
        biot_eq.next_to(cross_note, UP, buff=0.3)
        self.play(Write(biot_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(geo_group, cross_note, biot_eq, sec_label)))

        # ── Step 4: dB 随 θ 变化的曲线 ───────────────────────────────
        sec2 = Text("二、dB 与 θ 角的关系", font=CJK, color=BLUE).scale(0.52)
        sec2.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec2))

        axes = Axes(
            x_range=[0, math.pi + 0.1, math.pi / 4],
            y_range=[0, 1.3, 0.25],
            x_length=7.0,
            y_length=3.6,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        ).next_to(sec2, DOWN, buff=0.45)

        x_label = VGroup(
            MathTex(r"\theta", color=WHITE).scale(0.65)
        ).next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)
        y_label = VGroup(
            MathTex(r"\mathrm{d}B", color=CYAN).scale(0.62)
        ).next_to(axes.y_axis.get_end(), UP, buff=0.08)

        # x 轴刻度标签
        tick_labels = VGroup(
            MathTex(r"0").scale(0.5).next_to(axes.c2p(0, 0), DOWN, buff=0.2),
            MathTex(r"\frac{\pi}{4}").scale(0.5).next_to(axes.c2p(math.pi / 4, 0), DOWN, buff=0.2),
            MathTex(r"\frac{\pi}{2}").scale(0.5).next_to(axes.c2p(math.pi / 2, 0), DOWN, buff=0.2),
            MathTex(r"\pi").scale(0.5).next_to(axes.c2p(math.pi, 0), DOWN, buff=0.2),
        )

        sin_curve = axes.plot(
            lambda x: math.sin(x),
            x_range=[0, math.pi],
            color=CYAN,
            stroke_width=3,
        )
        curve_label = VGroup(
            MathTex(r"\mathrm{d}B\propto\sin\theta", color=CYAN).scale(0.65)
        ).next_to(sin_curve, RIGHT, buff=0.15)

        # θ = π/2 最大值标注
        peak_dot = Dot(axes.c2p(math.pi / 2, 1.0), color=YELLOW, radius=0.09)
        peak_line = DashedLine(
            axes.c2p(math.pi / 2, 0),
            axes.c2p(math.pi / 2, 1.0),
            color=YELLOW, stroke_width=1.5
        )
        peak_label = VGroup(
            MathTex(r"\theta=\frac{\pi}{2}", color=YELLOW).scale(0.55),
            Text("最大", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(DOWN, buff=0.08).next_to(peak_dot, UR, buff=0.12)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), FadeIn(tick_labels))
        self.wait(0.4)
        self.play(Create(sin_curve), FadeIn(curve_label))
        self.wait(0.8)
        self.play(FadeIn(peak_dot), Create(peak_line), FadeIn(peak_label))

        theta_note = VGroup(
            Text("当", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\theta=0", color=WHITE).scale(0.6),
            Text("或", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\theta=\pi", color=WHITE).scale(0.6),
            Text("时，dB=0（平行，无贡献）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.65)
        self.play(FadeIn(theta_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(axes, x_label, y_label, tick_labels,
                                  sin_curve, curve_label,
                                  peak_dot, peak_line, peak_label,
                                  theta_note, sec2)))

        # ── Step 5: 有限长直导线积分（ValueTracker 扫动）────────────
        sec3 = Text("三、有限长直导线：积分叠加各 dB", font=CJK, color=BLUE).scale(0.52)
        sec3.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec3))

        # 布局：导线沿 y 轴竖放，场点 P 在右侧
        wire_x = -2.5
        wire_y_bot = -2.2
        wire_y_top =  2.2
        P_x = 1.2
        P_y = 0.0
        r0_val = P_x - wire_x  # 垂直距离

        main_wire = Line(
            np.array([wire_x, wire_y_bot, 0]),
            np.array([wire_x, wire_y_top, 0]),
            color=ORANGE, stroke_width=5
        )
        I_arrow = Arrow(
            np.array([wire_x - 0.35, -0.6, 0]),
            np.array([wire_x - 0.35,  0.6, 0]),
            buff=0, color=ORANGE, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.35
        )
        I_text = Text("I", font=CJK, color=ORANGE).scale(0.52).next_to(I_arrow, LEFT, buff=0.1)

        P_dot2 = Dot(np.array([P_x, P_y, 0]), color=WHITE, radius=0.10)
        P_text2 = Text("P", font=CJK, color=WHITE).scale(0.5).next_to(P_dot2, RIGHT, buff=0.1)
        r0_line = DashedLine(
            np.array([wire_x, P_y, 0]),
            np.array([P_x, P_y, 0]),
            color=CYAN, stroke_width=1.8
        )
        r0_label = MathTex(r"r_0", color=CYAN).scale(0.6).next_to(r0_line, DOWN, buff=0.12)

        # theta1, theta2 标注
        theta1_val =  math.radians(140)   # θ₁（从正 y 轴量）
        theta2_val =  math.radians(40)    # θ₂
        theta1_wire_y = wire_y_bot + 0.25
        theta2_wire_y = wire_y_top - 0.25

        t1_line = DashedLine(np.array([P_x, P_y, 0]), np.array([wire_x, theta1_wire_y, 0]),
                             color=GREEN, stroke_width=1.5)
        t2_line = DashedLine(np.array([P_x, P_y, 0]), np.array([wire_x, theta2_wire_y, 0]),
                             color=GREEN, stroke_width=1.5)
        t1_label = MathTex(r"\theta_1", color=GREEN).scale(0.55)
        t1_label.next_to(np.array([P_x, P_y, 0]) + (np.array([wire_x, theta1_wire_y, 0]) - np.array([P_x, P_y, 0])) * 0.35,
                         DOWN + LEFT, buff=0.05)
        t2_label = MathTex(r"\theta_2", color=GREEN).scale(0.55)
        t2_label.next_to(np.array([P_x, P_y, 0]) + (np.array([wire_x, theta2_wire_y, 0]) - np.array([P_x, P_y, 0])) * 0.35,
                         UP + LEFT, buff=0.05)

        self.play(Create(main_wire), FadeIn(I_arrow), FadeIn(I_text))
        self.play(FadeIn(P_dot2), FadeIn(P_text2), Create(r0_line), FadeIn(r0_label))
        self.play(Create(t1_line), Create(t2_line), FadeIn(t1_label), FadeIn(t2_label))
        self.wait(0.8)

        # ValueTracker：电流元沿导线从底部扫到顶部
        dl_tracker = ValueTracker(wire_y_bot + 0.15)

        def make_dl_element():
            yl = dl_tracker.get_value()
            src = np.array([wire_x, yl, 0])
            dst = np.array([wire_x, yl + 0.36, 0])
            arr = Arrow(src, dst, buff=0, color=YELLOW,
                        stroke_width=3.5, max_tip_length_to_length_ratio=0.38)
            return arr

        def make_dB_arrow():
            yl = dl_tracker.get_value() + 0.18
            # dB 在 P 点方向（对于竖直导线，dB 水平向左或右，这里统一向右偏上）
            # 实际叠加方向：导线左边 P 在右，dB 向纸面外，用小圆表示
            circ = Circle(radius=0.13, color=CYAN, stroke_width=2)
            dot_in = Dot(np.array([0, 0, 0]), color=CYAN, radius=0.055)
            grp = VGroup(circ, dot_in)
            # 位置：P 点右方，y 随 tracker
            px = P_x + 0.55
            py = yl * 0.18  # 压缩显示
            grp.move_to(np.array([px, py, 0]))
            return grp

        dl_elem = always_redraw(make_dl_element)
        dB_elem = always_redraw(make_dB_arrow)

        scan_note = Text("电流元 Idl 从下到上扫动，各 dB 方向一致，逐步叠加", font=CJK, color=CYAN).scale(0.40)
        scan_note.to_edge(DOWN, buff=0.7)

        self.add(dl_elem, dB_elem)
        self.play(FadeIn(scan_note))
        self.wait(0.3)
        self.play(dl_tracker.animate.set_value(wire_y_top - 0.5), run_time=3.5, rate_func=linear)
        self.wait(1.0)

        # 积分结果公式
        int_eq = MathTex(
            r"B=\frac{\mu_0 I}{4\pi r_0}(\cos\theta_1-\cos\theta_2)",
            color=YELLOW
        ).scale(0.72)
        int_eq.to_edge(DOWN, buff=1.0)
        self.play(Write(int_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(main_wire, I_arrow, I_text,
                                  P_dot2, P_text2, r0_line, r0_label,
                                  t1_line, t2_line, t1_label, t2_label,
                                  dl_elem, dB_elem, scan_note, int_eq, sec3)))

        # ── Step 6: 无限长特例 + 同心圆磁场线 ────────────────────────
        sec4 = Text("四、无限长导线特例与磁场线", font=CJK, color=BLUE).scale(0.52)
        sec4.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec4))

        # 推导无限长：θ₁→0, θ₂→π
        step_inf1 = VGroup(
            Text("当导线无限长：", font=CJK).scale(0.46),
            MathTex(r"\theta_1\to 0,\quad \theta_2\to\pi", color=WHITE).scale(0.7),
        ).arrange(RIGHT, buff=0.18)
        step_inf2 = MathTex(
            r"\cos\theta_1-\cos\theta_2\to 1-(-1)=2",
            color=YELLOW
        ).scale(0.7)
        step_inf3 = MathTex(
            r"B_{\infty}=\frac{\mu_0 I}{2\pi r_0}",
            color=GREEN
        ).scale(0.88)
        inf_group = VGroup(step_inf1, step_inf2, step_inf3).arrange(DOWN, buff=0.38)
        inf_group.next_to(sec4, DOWN, buff=0.4)
        inf_group.scale_to_fit_width(10.5)

        self.play(FadeIn(step_inf1))
        self.wait(0.8)
        self.play(Write(step_inf2))
        self.wait(0.8)
        self.play(Write(step_inf3))
        self.wait(1.2)
        self.play(FadeOut(inf_group))

        # 同心圆磁场线动画
        wire_center = np.array([0, -0.5, 0])
        wire_dot = Dot(wire_center, color=ORANGE, radius=0.14)
        wire_cross1 = Line(wire_center + np.array([-0.1, -0.1, 0]),
                           wire_center + np.array([0.1,  0.1, 0]),
                           color=ORANGE, stroke_width=2.5)
        wire_cross2 = Line(wire_center + np.array([0.1, -0.1, 0]),
                           wire_center + np.array([-0.1, 0.1, 0]),
                           color=ORANGE, stroke_width=2.5)
        wire_sym = VGroup(wire_dot, wire_cross1, wire_cross2)
        wire_sym_label = Text("I (向纸内)", font=CJK, color=ORANGE).scale(0.40)
        wire_sym_label.next_to(wire_sym, DOWN, buff=0.12)

        self.play(FadeIn(wire_sym), FadeIn(wire_sym_label))
        self.wait(0.4)

        circ_colors = [CYAN, BLUE, "#4488FF"]
        radii = [0.7, 1.3, 1.9]
        circles = []
        for i, (rad, col) in enumerate(zip(radii, circ_colors)):
            c = Circle(radius=rad, color=col, stroke_width=2.0).move_to(wire_center)
            circles.append(c)
            # 箭头标示方向（顺时针）
            ang = math.pi / 2
            arr_pos = wire_center + np.array([rad * math.cos(ang), rad * math.sin(ang), 0])
            tang = np.array([-math.sin(ang), math.cos(ang), 0])  # 顺时针取负
            B_arr = Arrow(arr_pos, arr_pos - tang * 0.3, buff=0, color=col,
                          stroke_width=2, max_tip_length_to_length_ratio=0.5)
            circles.append(B_arr)

        circ_group = VGroup(*circles)

        r0_pt = wire_center + np.array([radii[1], 0, 0])
        r0_seg = DashedLine(wire_center, r0_pt, color=CYAN, stroke_width=1.5)
        r0_lbl = MathTex(r"r_0", color=CYAN).scale(0.55).next_to(r0_seg, DOWN, buff=0.1)

        self.play(*[Create(c) for c in circles[:3:2]], run_time=1.5)
        self.play(*[Create(c) for c in circles[1::2]], run_time=0.8)
        self.play(FadeIn(r0_seg), FadeIn(r0_lbl))
        self.wait(0.8)

        B_inf_again = MathTex(r"B_{\infty}=\frac{\mu_0 I}{2\pi r_0}", color=GREEN).scale(0.78)
        B_inf_again.to_edge(RIGHT, buff=0.6).shift(UP * 0.5)
        self.play(Write(B_inf_again))

        circle_note = Text("磁场线：以导线为轴的同心圆，右手拇指向电流方向则四指环绕方向为 B 方向",
                           font=CJK, color=CYAN).scale(0.38)
        circle_note.to_edge(DOWN, buff=0.65)
        self.play(FadeIn(circle_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(wire_sym, wire_sym_label, circ_group,
                                  r0_seg, r0_lbl, B_inf_again, circle_note, sec4)))

        # ── Step 7: 小结卡 ────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        row1_lbl = Text("微分形式：", font=CJK).scale(0.46)
        row1_eq = MathTex(
            r"\mathrm{d}\mathbf{B}=\frac{\mu_0}{4\pi}\frac{I\mathrm{d}\mathbf{l}\times\hat{\mathbf{r}}}{r^2}",
            color=YELLOW
        ).scale(0.7)
        row1 = VGroup(row1_lbl, row1_eq).arrange(RIGHT, buff=0.2)

        row2_lbl = Text("有限长直导线：", font=CJK).scale(0.46)
        row2_eq = MathTex(
            r"B=\frac{\mu_0 I}{4\pi r_0}(\cos\theta_1-\cos\theta_2)",
            color=YELLOW
        ).scale(0.7)
        row2 = VGroup(row2_lbl, row2_eq).arrange(RIGHT, buff=0.2)

        row3_lbl = Text("无限长特例：", font=CJK).scale(0.46)
        row3_eq = MathTex(
            r"B_{\infty}=\frac{\mu_0 I}{2\pi r_0}",
            color=GREEN
        ).scale(0.7)
        row3 = VGroup(row3_lbl, row3_eq).arrange(RIGHT, buff=0.2)

        rule_text = Text("方向：右手定则（叉积 Idl × r̂ 的方向）", font=CJK, color=CYAN).scale(0.42)

        summary = VGroup(row1, row2, row3, rule_text).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(row1))
        self.wait(0.6)
        self.play(FadeIn(row2))
        self.wait(0.6)
        self.play(FadeIn(row3))
        self.wait(0.6)
        self.play(FadeIn(rule_text), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
