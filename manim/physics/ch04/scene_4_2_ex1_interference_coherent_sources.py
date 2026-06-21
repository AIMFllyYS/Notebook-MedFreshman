"""第 4.2 节 · 例题：两相干波源在延长线上的干涉（金标准范本：波动/干涉/相位差）。

题意：P(0) 和 Q(3m) 是两个相干波源，λ=4m，P 的初相比 Q 超前 π/2。
     问 Q 右侧延长线上任意点 S(3+r) 处的干涉情况。
结论：相位差 Δφ = -π（与 r 无关），S 处干涉相消，全暗区。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch04Ex1InterferenceCoherentSources(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════
        title = Text("例题：两相干波源在延长线上的干涉", font=CJK, color=BLUE).scale(0.6)
        title.to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2: 生活类比 — 同频音叉的干涉
        # ══════════════════════════════════════════════════════════
        ana1 = Text("两个音叉同时振动，某些位置声音互相加强，", font=CJK).scale(0.45)
        ana2 = Text("某些位置声音互相抵消——这就是波的干涉。", font=CJK).scale(0.45)
        ana3 = Text("当两列波叠加，合振动取决于它们在该点的相位差。", font=CJK, color=YELLOW).scale(0.45)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════
        # Step 3: 题目条件（逐行出现）
        # ══════════════════════════════════════════════════════════
        cond_header = Text("题目已知条件", font=CJK, color=BLUE).scale(0.48)
        cond_header.next_to(title, DOWN, buff=0.45)

        c1_zh = Text("两波源 P(0) 与 Q(3m)，同频同振幅相干波源", font=CJK).scale(0.4)
        c2_zh = Text("波长", font=CJK).scale(0.4)
        c2_eq = MathTex(r"\lambda = 4\,\text{m}").scale(0.55)
        c2 = VGroup(c2_zh, c2_eq).arrange(RIGHT, buff=0.12)

        c3_zh = Text("P 的初相超前 Q 的初相", font=CJK).scale(0.4)
        c3_eq = MathTex(r"\varphi_P - \varphi_Q = \frac{\pi}{2}").scale(0.55)
        c3 = VGroup(c3_zh, c3_eq).arrange(RIGHT, buff=0.12)

        c4_zh = Text("求：Q 右侧延长线上任意点 S(3+r) 处的干涉情况", font=CJK).scale(0.4)

        cond_group = VGroup(c1_zh, c2, c3, c4_zh).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        cond_group.next_to(cond_header, DOWN, buff=0.35)

        self.play(FadeIn(cond_header))
        self.wait(0.4)
        for item in cond_group:
            self.play(FadeIn(item))
            self.wait(0.6)
        self.wait(1.0)
        self.play(FadeOut(VGroup(cond_header, cond_group)))

        # ══════════════════════════════════════════════════════════
        # Step 4: 水平轴示意图 — P、Q、S 三点位置
        # ══════════════════════════════════════════════════════════
        axis_y = -0.5  # 轴的垂直位置（屏幕坐标）
        axis_left = -5.5
        axis_right = 5.5

        # 比例：实际坐标 → 屏幕坐标，1m 对应 0.9 单位
        SCALE = 0.9

        def real_to_screen(x_real):
            return axis_left + x_real * SCALE

        # 轴
        number_line = Arrow(
            start=np.array([axis_left, axis_y, 0]),
            end=np.array([axis_right, axis_y, 0]),
            color=WHITE, buff=0, stroke_width=2,
            max_tip_length_to_length_ratio=0.04,
        )
        axis_label = MathTex(r"x\,(\text{m})").scale(0.5)
        axis_label.next_to(np.array([axis_right, axis_y, 0]), RIGHT, buff=0.1)

        # P 在 x=0，Q 在 x=3，r 是 QS 距离（可变）
        r_val_init = 3.0  # 初始 r=3m
        r_tracker = ValueTracker(r_val_init)

        # 固定点 P 和 Q
        P_screen = real_to_screen(0)
        Q_screen = real_to_screen(3)

        P_dot = Dot(np.array([P_screen, axis_y, 0]), color=BLUE, radius=0.12)
        Q_dot = Dot(np.array([Q_screen, axis_y, 0]), color=GREEN, radius=0.12)

        P_lbl = MathTex(r"P").scale(0.55).set_color(BLUE)
        P_lbl.next_to(P_dot, UP, buff=0.15)
        P_sub = MathTex(r"(0)").scale(0.4).set_color(BLUE)
        P_sub.next_to(P_lbl, DOWN, buff=0.05)

        Q_lbl = MathTex(r"Q").scale(0.55).set_color(GREEN)
        Q_lbl.next_to(Q_dot, UP, buff=0.15)
        Q_sub = MathTex(r"(3\,\text{m})").scale(0.4).set_color(GREEN)
        Q_sub.next_to(Q_lbl, DOWN, buff=0.05)

        # S 点随 r 移动
        S_dot = always_redraw(lambda: Dot(
            np.array([real_to_screen(3 + r_tracker.get_value()), axis_y, 0]),
            color=RED, radius=0.12,
        ))
        S_lbl = always_redraw(lambda: MathTex(r"S").scale(0.55).set_color(RED).next_to(
            np.array([real_to_screen(3 + r_tracker.get_value()), axis_y, 0]), UP, buff=0.15
        ))
        S_sub = always_redraw(lambda: Text(
            f"(3+r)", font=CJK, color=RED
        ).scale(0.35).next_to(
            np.array([real_to_screen(3 + r_tracker.get_value()), axis_y + 0.4, 0]), DOWN, buff=0.05
        ))

        # 标注 PQ = 3m
        PQ_brace = always_redraw(lambda: BraceBetweenPoints(
            np.array([P_screen, axis_y - 0.1, 0]),
            np.array([Q_screen, axis_y - 0.1, 0]),
            direction=DOWN, color=YELLOW,
        ))
        PQ_label = always_redraw(lambda: MathTex(r"3\,\text{m}").scale(0.42).set_color(YELLOW).next_to(
            PQ_brace, DOWN, buff=0.1
        ))

        self.play(
            Create(number_line), FadeIn(axis_label),
            FadeIn(P_dot), FadeIn(Q_dot),
            FadeIn(P_lbl), FadeIn(P_sub),
            FadeIn(Q_lbl), FadeIn(Q_sub),
        )
        self.wait(0.6)
        self.play(FadeIn(S_dot), FadeIn(S_lbl), FadeIn(S_sub))
        self.play(Create(PQ_brace), FadeIn(PQ_label))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════
        # Step 5: P 处振动方程 + 相量图（超前 π/2）
        # ══════════════════════════════════════════════════════════
        # 先缩小轴组到上半部分
        phasor_region_y = 1.8  # 相量图中心 y
        phasor_region_x = -3.5

        eq_header = Text("P、Q 振动方程", font=CJK, color=BLUE).scale(0.45)
        eq_header.next_to(title, DOWN, buff=0.4)

        eq_P = MathTex(r"y_P = A\cos\!\left(\omega t + \frac{\pi}{2}\right)").scale(0.6)
        eq_Q = MathTex(r"y_Q = A\cos(\omega t)").scale(0.6)
        eq_P.set_color(BLUE)
        eq_Q.set_color(GREEN)

        eq_group = VGroup(eq_P, eq_Q).arrange(DOWN, buff=0.4)
        eq_group.next_to(eq_header, DOWN, buff=0.35)
        eq_group.to_edge(LEFT, buff=0.7)

        self.play(FadeIn(eq_header))
        self.play(Write(eq_P))
        self.wait(0.5)
        self.play(Write(eq_Q))
        self.wait(0.8)

        # 相量图（小圆 + 两根箭头，分别表示 P 超前 Q π/2）
        phasor_cx = 3.0
        phasor_cy = 1.6
        phasor_R = 0.85

        phasor_circle = Circle(radius=phasor_R, color=GRAY, stroke_width=1.5)
        phasor_circle.move_to(np.array([phasor_cx, phasor_cy, 0]))

        # Q 的相量：0° (向右)
        arrow_Q = Arrow(
            start=np.array([phasor_cx, phasor_cy, 0]),
            end=np.array([phasor_cx + phasor_R, phasor_cy, 0]),
            color=GREEN, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.2,
        )
        lbl_Q_phasor = Text("Q", font=CJK, color=GREEN).scale(0.38)
        lbl_Q_phasor.next_to(np.array([phasor_cx + phasor_R, phasor_cy, 0]), RIGHT, buff=0.1)

        # P 的相量：超前 π/2，即 90°（向上）
        arrow_P = Arrow(
            start=np.array([phasor_cx, phasor_cy, 0]),
            end=np.array([phasor_cx, phasor_cy + phasor_R, 0]),
            color=BLUE, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.2,
        )
        lbl_P_phasor = Text("P", font=CJK, color=BLUE).scale(0.38)
        lbl_P_phasor.next_to(np.array([phasor_cx, phasor_cy + phasor_R, 0]), UP, buff=0.1)

        # 角度弧线
        angle_arc = Arc(
            radius=0.4,
            start_angle=0,
            angle=PI / 2,
            color=YELLOW,
            stroke_width=2,
        ).move_to(np.array([phasor_cx, phasor_cy, 0]))
        angle_lbl = MathTex(r"\frac{\pi}{2}").scale(0.45).set_color(YELLOW)
        angle_lbl.move_to(np.array([phasor_cx + 0.6, phasor_cy + 0.35, 0]))

        phasor_caption = Text("相量图：P 超前 Q 共 π/2", font=CJK, color=YELLOW).scale(0.38)
        phasor_caption.next_to(phasor_circle, DOWN, buff=0.25)

        self.play(
            Create(phasor_circle),
            Create(arrow_Q), FadeIn(lbl_Q_phasor),
        )
        self.wait(0.5)
        self.play(
            Create(arrow_P), FadeIn(lbl_P_phasor),
            Create(angle_arc), FadeIn(angle_lbl),
        )
        self.play(FadeIn(phasor_caption))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            eq_header, eq_group,
            phasor_circle, arrow_Q, lbl_Q_phasor,
            arrow_P, lbl_P_phasor,
            angle_arc, angle_lbl, phasor_caption,
        )))

        # ══════════════════════════════════════════════════════════
        # Step 6: 两段路程与路程差可视化
        # ══════════════════════════════════════════════════════════
        path_header = Text("两波到达 S 的路程", font=CJK, color=BLUE).scale(0.46)
        path_header.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(path_header))

        # PS 路程彩线（蓝色，从 P 到 S）
        PS_line = always_redraw(lambda: Line(
            start=np.array([P_screen, axis_y + 0.28, 0]),
            end=np.array([real_to_screen(3 + r_tracker.get_value()), axis_y + 0.28, 0]),
            color=BLUE, stroke_width=5,
        ))
        PS_brace = always_redraw(lambda: BraceBetweenPoints(
            np.array([P_screen, axis_y + 0.38, 0]),
            np.array([real_to_screen(3 + r_tracker.get_value()), axis_y + 0.38, 0]),
            direction=UP, color=BLUE,
        ))
        PS_txt_zh = Text("PS =", font=CJK, color=BLUE).scale(0.4)
        PS_txt_eq = MathTex(r"r + 3\,\text{m}").scale(0.5).set_color(BLUE)
        PS_txt = VGroup(PS_txt_zh, PS_txt_eq).arrange(RIGHT, buff=0.1)

        # QS 路程彩线（绿色，从 Q 到 S）
        QS_line = always_redraw(lambda: Line(
            start=np.array([Q_screen, axis_y - 0.28, 0]),
            end=np.array([real_to_screen(3 + r_tracker.get_value()), axis_y - 0.28, 0]),
            color=GREEN, stroke_width=5,
        ))
        QS_brace = always_redraw(lambda: BraceBetweenPoints(
            np.array([Q_screen, axis_y - 0.38, 0]),
            np.array([real_to_screen(3 + r_tracker.get_value()), axis_y - 0.38, 0]),
            direction=DOWN, color=GREEN,
        ))
        QS_txt_zh = Text("QS =", font=CJK, color=GREEN).scale(0.4)
        QS_txt_eq = MathTex(r"r").scale(0.5).set_color(GREEN)
        QS_txt = VGroup(QS_txt_zh, QS_txt_eq).arrange(RIGHT, buff=0.1)

        path_eqs = VGroup(PS_txt, QS_txt).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        path_eqs.next_to(path_header, DOWN, buff=0.35)
        path_eqs.to_edge(LEFT, buff=0.7)

        self.play(Create(PS_line), Create(PS_brace))
        self.play(FadeIn(PS_txt))
        self.wait(0.5)
        self.play(Create(QS_line), Create(QS_brace))
        self.play(FadeIn(QS_txt))
        self.wait(0.8)

        # 路程差
        diff_zh = Text("路程差", font=CJK, color=ORANGE).scale(0.4)
        diff_eq = MathTex(r"PS - QS = (r+3) - r = 3\,\text{m} = \frac{3\lambda}{4}").scale(0.52).set_color(ORANGE)
        diff_row = VGroup(diff_zh, diff_eq).arrange(RIGHT, buff=0.12)
        diff_row.next_to(path_eqs, DOWN, buff=0.35)

        self.play(FadeIn(diff_row))
        self.wait(1.5)
        self.play(FadeOut(VGroup(
            path_header, path_eqs, diff_row,
            PS_line, PS_brace, QS_line, QS_brace,
        )))

        # ══════════════════════════════════════════════════════════
        # Step 7: 相位差公式推导（逐步）
        # ══════════════════════════════════════════════════════════
        deriv_header = Text("相位差公式推导", font=CJK, color=BLUE).scale(0.48)
        deriv_header.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(deriv_header))

        # 通用公式
        step7a_zh = Text("两波在 S 处叠加的相位差：", font=CJK).scale(0.42)
        step7a = MathTex(
            r"\Delta\varphi",
            r"=",
            r"\left[\varphi_P - 2\pi\frac{PS}{\lambda}\right]",
            r"-",
            r"\left[\varphi_Q - 2\pi\frac{QS}{\lambda}\right]",
        ).scale(0.55)
        step7a[0].set_color(YELLOW)
        step7a[2].set_color(BLUE)
        step7a[4].set_color(GREEN)
        step7a_group = VGroup(step7a_zh, step7a).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        step7a_group.next_to(deriv_header, DOWN, buff=0.35)

        self.play(FadeIn(step7a_zh))
        self.play(Write(step7a))
        self.wait(1.2)

        # 代入初相差
        step7b_zh = Text("代入初相差：", font=CJK).scale(0.42)
        step7b = MathTex(
            r"=",
            r"(\varphi_P - \varphi_Q)",
            r"-",
            r"2\pi\frac{PS - QS}{\lambda}",
        ).scale(0.55)
        step7b[1].set_color(BLUE)
        step7b[3].set_color(ORANGE)
        step7b_group = VGroup(step7b_zh, step7b).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        step7b_group.next_to(step7a_group, DOWN, buff=0.35)

        self.play(FadeIn(step7b_zh))
        self.play(Write(step7b))
        self.wait(1.0)

        # 代入数值
        step7c_zh = Text("代入数值：", font=CJK).scale(0.42)
        step7c = MathTex(
            r"=",
            r"\frac{\pi}{2}",
            r"-",
            r"2\pi \cdot \frac{3}{4}",
            r"=",
            r"\frac{\pi}{2}",
            r"-",
            r"\frac{3\pi}{2}",
            r"=",
            r"-\pi",
        ).scale(0.55)
        step7c[1].set_color(BLUE)
        step7c[3].set_color(ORANGE)
        step7c[9].set_color(YELLOW)
        step7c_group = VGroup(step7c_zh, step7c).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        step7c_group.next_to(step7b_group, DOWN, buff=0.3)

        self.play(FadeIn(step7c_zh))
        self.play(Write(step7c))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_header, step7a_group, step7b_group, step7c_group)))

        # ══════════════════════════════════════════════════════════
        # Step 8: ValueTracker 拖动 r，展示 Δφ 与 r 无关
        # ══════════════════════════════════════════════════════════
        tracker_header = Text("改变 r，观察相位差 Δφ 的变化", font=CJK, color=BLUE).scale(0.46)
        tracker_header.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(tracker_header))

        # 动态显示 r 的值和 Δφ
        r_label_zh = Text("r =", font=CJK).scale(0.45)
        r_label_val = always_redraw(lambda: MathTex(
            rf"{r_tracker.get_value():.1f}\,\text{{m}}"
        ).scale(0.55).set_color(RED))
        r_row = always_redraw(lambda: VGroup(
            Text("r =", font=CJK).scale(0.45),
            MathTex(rf"{r_tracker.get_value():.1f}\,\text{{m}}").scale(0.55).set_color(RED),
        ).arrange(RIGHT, buff=0.12).move_to(np.array([-2.5, 0.8, 0])))

        dphi_label_zh = Text("Δφ =", font=CJK).scale(0.45)
        dphi_result = MathTex(r"-\pi").scale(0.7).set_color(YELLOW)
        dphi_row = VGroup(dphi_label_zh, dphi_result).arrange(RIGHT, buff=0.12)
        dphi_row.move_to(np.array([2.0, 0.8, 0]))

        note_zh = Text("（Δφ 始终为 -π，与 r 无关！）", font=CJK, color=GREEN).scale(0.42)
        note_zh.next_to(dphi_row, DOWN, buff=0.3)

        self.play(FadeIn(r_row), FadeIn(dphi_row))
        self.play(FadeIn(note_zh))
        self.wait(0.6)

        # 拖动 r 从 3m 到 6m 再到 1m
        self.play(r_tracker.animate.set_value(6.0), run_time=2.5, rate_func=smooth)
        self.wait(0.5)
        self.play(r_tracker.animate.set_value(1.0), run_time=2.5, rate_func=smooth)
        self.wait(0.5)
        self.play(r_tracker.animate.set_value(3.0), run_time=1.5, rate_func=smooth)
        self.wait(1.0)

        # 结论框
        key_zh = Text("Δφ = -π（奇数倍 π），满足干涉相消条件", font=CJK, color=YELLOW).scale(0.42)
        key_eq = MathTex(r"\Delta\varphi = -\pi = (2k+1)\pi \;\Rightarrow\; \text{destructive}").scale(0.5).set_color(YELLOW)
        key_group = VGroup(key_zh, key_eq).arrange(DOWN, buff=0.25)
        key_group.next_to(note_zh, DOWN, buff=0.4)
        key_box = SurroundingRectangle(key_group, color=YELLOW, buff=0.2, corner_radius=0.12)
        self.play(FadeIn(key_group), Create(key_box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(tracker_header, r_row, dphi_row, note_zh, key_group, key_box)))

        # ══════════════════════════════════════════════════════════
        # Step 9: 暗区渲染 — Q 右侧整个区域为干涉相消
        # ══════════════════════════════════════════════════════════
        dark_header = Text("结论：Q 右侧延长线为「全暗区」", font=CJK, color=RED).scale(0.48)
        dark_header.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(dark_header))

        # 用深灰色矩形覆盖 Q 右侧区域（即整个 S 可能所在的范围）
        dark_rect = Rectangle(
            width=axis_right - Q_screen,
            height=0.55,
            fill_color=DARK_GRAY,
            fill_opacity=0.72,
            stroke_color=RED,
            stroke_width=2,
        )
        dark_rect.move_to(np.array([(Q_screen + axis_right) / 2, axis_y, 0]))

        dark_lbl = Text("干涉相消（静止不动）", font=CJK, color=RED).scale(0.42)
        dark_lbl.next_to(dark_rect, DOWN, buff=0.28)

        # 在暗区内画几条"消失"的竖线表示振动抵消
        cancel_lines = VGroup(*[
            DashedLine(
                np.array([Q_screen + 0.7 * i, axis_y - 0.22, 0]),
                np.array([Q_screen + 0.7 * i, axis_y + 0.22, 0]),
                color=GRAY, stroke_width=1.5,
            )
            for i in range(1, 8)
        ])

        self.play(FadeIn(dark_rect), Create(cancel_lines))
        self.play(FadeIn(dark_lbl))
        self.wait(1.5)

        # 添加"加强/相消"对比注记（左侧 P-Q 之间简单标注）
        between_zh = Text("P-Q 之间：需分段讨论", font=CJK, color=WHITE).scale(0.36)
        between_zh.move_to(np.array([(P_screen + Q_screen) / 2, axis_y + 1.1, 0]))
        self.play(FadeIn(between_zh))
        self.wait(1.0)
        self.play(FadeOut(between_zh))
        self.wait(0.5)
        self.play(FadeOut(VGroup(dark_header, dark_rect, cancel_lines, dark_lbl)))

        # ══════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════
        # 清除轴图
        self.play(FadeOut(VGroup(
            number_line, axis_label,
            P_dot, Q_dot, P_lbl, P_sub, Q_lbl, Q_sub,
            S_dot, S_lbl, S_sub,
            PQ_brace, PQ_label,
        )))

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1_zh = Text("相位差公式", font=CJK).scale(0.42)
        s1_eq = MathTex(
            r"\Delta\varphi = (\varphi_P - \varphi_Q) - 2\pi\frac{\Delta r}{\lambda}"
        ).scale(0.6).set_color(YELLOW)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.18)

        s2_zh = Text("本题代入", font=CJK).scale(0.42)
        s2_eq = MathTex(
            r"\Delta\varphi = \frac{\pi}{2} - 2\pi\cdot\frac{3}{4} = -\pi"
        ).scale(0.6).set_color(YELLOW)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.18)

        s3_zh = Text("干涉相消条件", font=CJK).scale(0.42)
        s3_eq = MathTex(r"\Delta\varphi = (2k+1)\pi,\; k=0,\pm 1,\pm 2,\ldots").scale(0.6).set_color(YELLOW)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.18)

        s4 = Text("∴ Q 右侧延长线上 S 处恒为干涉相消（暗区），与 r 无关。",
                  font=CJK, color=GREEN).scale(0.42)

        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(12.5)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(FadeIn(s_title))
        for item in [s1, s2, s3, s4]:
            self.play(FadeIn(item))
            self.wait(0.5)
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Ex1InterferenceCoherentSources",
        "id": "phys-ch04-4.2-ex1-interference-coherent-sources",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "例题：两相干波源在延长线上的干涉",
        "description": "以 P(0)、Q(3m) 两相干波源为例，用相量图、路程彩线与 ValueTracker 逐步推导延长线上任意点 S 的相位差 Δφ=-π，说明 Q 右侧全为干涉相消暗区。",
    },
]
