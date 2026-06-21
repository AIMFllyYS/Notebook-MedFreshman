"""第 8.4 节 · 洛伦兹力：带电粒子圆周与螺旋运动

动画讲解带电粒子在匀强磁场中做圆周运动和螺旋运动的物理机制，
推导圆周半径 R、周期 T、频率 f 及螺距 h 公式，
并以回旋加速器工作原理收尾。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Kp2LorentzForceCircularHelicalMotion",
        "id": "phys-ch08-8.4-kp2-lorentz-force-circular-helical-motion",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "洛伦兹力：带电粒子圆周与螺旋运动",
        "description": "演示带电粒子在匀强磁场中做圆周/螺旋运动，推导 R、T、f、h 公式，展示回旋加速器原理。",
    }
]


class Ch08Kp2LorentzForceCircularHelicalMotion(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("洛伦兹力：带电粒子圆周与螺旋运动",
                     font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.4",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("想象你用绳子甩一个球做圆周运动：",
                    font=CJK).scale(0.48)
        ana2 = Text("绳子始终指向圆心，提供向心力，但不做功，速率不变。",
                    font=CJK).scale(0.48)
        ana3 = Text("洛伦兹力对带电粒子的作用完全相同——",
                    font=CJK, color=YELLOW).scale(0.48)
        ana4 = Text("始终垂直于速度，只改变方向，不改变速率。",
                    font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.0)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3), FadeIn(ana4))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 洛伦兹力定义 ────────────────────────────────────────
        def_label = Text("洛伦兹力定义", font=CJK, color=BLUE).scale(0.5)
        def_label.next_to(title, DOWN, buff=0.45)
        lorentz = MathTex(r"\vec{F} = q\vec{v} \times \vec{B}",
                          color=YELLOW).scale(1.0)
        lorentz.next_to(def_label, DOWN, buff=0.35)
        note_perp = VGroup(
            Text("方向：右手定则（正电荷），始终垂直于", font=CJK).scale(0.44),
            MathTex(r"\vec{v}", color=CYAN).scale(0.8),
            Text("和", font=CJK).scale(0.44),
            MathTex(r"\vec{B}", color=ORANGE).scale(0.8),
        ).arrange(RIGHT, buff=0.12)
        note_perp.next_to(lorentz, DOWN, buff=0.3)
        note_no_work = Text("关键：洛伦兹力不做功  →  |v| 不变  →  动能守恒",
                            font=CJK, color=GREEN).scale(0.43)
        note_no_work.next_to(note_perp, DOWN, buff=0.25)

        self.play(FadeIn(def_label))
        self.play(Write(lorentz))
        self.wait(0.8)
        self.play(FadeIn(note_perp))
        self.wait(0.8)
        self.play(FadeIn(note_no_work))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_label, lorentz, note_perp, note_no_work)))

        # ── Step 4: 正面视图——圆周运动 + ValueTracker ───────────────────
        sec_label = Text("v ⊥ B 时：带电粒子做匀速圆周运动",
                         font=CJK, color=BLUE).scale(0.48)
        sec_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec_label))

        # 磁场方向（向上，蓝色箭头）- 画在左侧
        b_arrows = VGroup()
        for row in range(-2, 3):
            for col in range(-5, -1):
                b_arrows.add(Arrow(
                    start=np.array([col * 0.75, row * 0.75 - 0.3, 0]),
                    end=np.array([col * 0.75, row * 0.75 + 0.45, 0]),
                    buff=0, color=BLUE, stroke_width=2,
                    max_tip_length_to_length_ratio=0.3
                ))
        b_label = MathTex(r"\vec{B}", color=BLUE).scale(0.7)
        b_label.move_to(np.array([-3.5, 2.5, 0]))
        b_up = Text("(向上)", font=CJK, color=BLUE).scale(0.35)
        b_up.next_to(b_label, RIGHT, buff=0.1)

        self.play(Create(b_arrows), FadeIn(b_label), FadeIn(b_up))
        self.wait(0.5)

        # 圆心在右侧区域
        circle_center = np.array([2.0, -0.3, 0])

        # ValueTracker 控制 v 的大小 → R 变化
        v_tracker = ValueTracker(1.2)

        def make_circle():
            R = v_tracker.get_value()
            return Circle(radius=R, color=RED, stroke_width=2.5).move_to(circle_center)

        def make_particle():
            R = v_tracker.get_value()
            # 粒子在圆上右侧
            pos = circle_center + np.array([R, 0, 0])
            return Dot(point=pos, radius=0.13, color=RED)

        def make_velocity_arrow():
            R = v_tracker.get_value()
            pos = circle_center + np.array([R, 0, 0])
            # 速度向上（切线方向）
            vel_end = pos + np.array([0, 0.6, 0])
            return Arrow(pos, vel_end, buff=0, color=YELLOW,
                         stroke_width=3, max_tip_length_to_length_ratio=0.35)

        def make_force_arrow():
            R = v_tracker.get_value()
            pos = circle_center + np.array([R, 0, 0])
            # 洛伦兹力向左（指向圆心）
            f_end = pos + np.array([-0.55, 0, 0])
            return Arrow(pos, f_end, buff=0, color=GREEN,
                         stroke_width=3, max_tip_length_to_length_ratio=0.35)

        def make_radius_line():
            R = v_tracker.get_value()
            pos = circle_center + np.array([R, 0, 0])
            return DashedLine(circle_center, pos, color=WHITE, stroke_width=1.5)

        def make_r_label():
            R = v_tracker.get_value()
            mid = circle_center + np.array([R / 2, 0.18, 0])
            return MathTex(rf"R={R:.1f}", color=WHITE).scale(0.55).move_to(mid)

        orbit = always_redraw(make_circle)
        particle = always_redraw(make_particle)
        vel_arr = always_redraw(make_velocity_arrow)
        force_arr = always_redraw(make_force_arrow)
        rad_line = always_redraw(make_radius_line)
        r_lbl = always_redraw(make_r_label)

        vel_text = MathTex(r"\vec{v}", color=YELLOW).scale(0.6)
        vel_text.move_to(circle_center + np.array([v_tracker.get_value() + 0.15, 0.75, 0]))

        f_text = MathTex(r"\vec{F}", color=GREEN).scale(0.6)
        f_text.move_to(circle_center + np.array([v_tracker.get_value() - 0.7, 0.2, 0]))

        # 固定标签（位置固定，不随 tracker 变化）
        v_fixed_label = MathTex(r"\vec{v}\uparrow", color=YELLOW).scale(0.55)
        v_fixed_label.move_to(circle_center + np.array([1.55, 0.8, 0]))
        f_fixed_label = MathTex(r"\vec{F}\leftarrow", color=GREEN).scale(0.55)
        f_fixed_label.move_to(circle_center + np.array([0.7, 0.2, 0]))

        self.play(Create(orbit), Create(particle), Create(vel_arr),
                  Create(force_arr), Create(rad_line), FadeIn(r_lbl))
        self.play(FadeIn(v_fixed_label), FadeIn(f_fixed_label))
        self.wait(0.8)

        # 说明向心力 = 洛伦兹力
        eq_centripetal = VGroup(
            Text("向心力 = 洛伦兹力：", font=CJK).scale(0.42),
            MathTex(r"\frac{mv^2}{R}=qvB").scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        eq_centripetal.move_to(np.array([-0.3, -2.7, 0]))
        self.play(FadeIn(eq_centripetal))
        self.wait(1.0)

        # 推导 R
        r_formula = MathTex(r"R = \frac{mv}{qB}", color=YELLOW).scale(0.9)
        r_formula.next_to(eq_centripetal, RIGHT, buff=0.5)
        self.play(Write(r_formula))
        self.wait(0.8)

        # ValueTracker 演示：v 增大 → R 增大
        v_readout = always_redraw(
            lambda: VGroup(
                Text("v = ", font=CJK).scale(0.4),
                MathTex(rf"{v_tracker.get_value():.1f}\,\mathrm{{m/s}}", color=CYAN).scale(0.65),
            ).arrange(RIGHT, buff=0.1).move_to(np.array([2.0, 2.5, 0]))
        )
        grow_tip = Text("增大 v → R 增大", font=CJK, color=ORANGE).scale(0.42)
        grow_tip.move_to(np.array([2.0, -2.7, 0]))
        self.add(v_readout)
        self.play(FadeIn(grow_tip))
        self.play(v_tracker.animate.set_value(2.0), run_time=2.0)
        self.wait(0.5)
        self.play(v_tracker.animate.set_value(0.8), run_time=2.0)
        self.wait(0.5)
        self.play(v_tracker.animate.set_value(1.2), run_time=1.2)
        self.wait(0.5)

        self.play(FadeOut(VGroup(
            b_arrows, b_label, b_up, orbit, particle, vel_arr, force_arr,
            rad_line, r_lbl, v_fixed_label, f_fixed_label,
            eq_centripetal, r_formula, v_readout, grow_tip, sec_label
        )))

        # ── Step 5: 周期与频率推导 ──────────────────────────────────────
        pf_label = Text("周期与频率：与速度无关！",
                        font=CJK, color=BLUE).scale(0.5)
        pf_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(pf_label))

        step_r = MathTex(r"R = \frac{mv}{qB}", color=WHITE).scale(0.82)
        step_r.next_to(pf_label, DOWN, buff=0.4)
        self.play(Write(step_r))
        self.wait(0.6)

        step_T = MathTex(r"T = \frac{2\pi R}{v} = \frac{2\pi m}{qB}", color=YELLOW).scale(0.82)
        step_T.next_to(step_r, DOWN, buff=0.35)
        self.play(Write(step_T))
        self.wait(0.8)

        step_f = MathTex(r"f = \frac{1}{T} = \frac{qB}{2\pi m}", color=GREEN).scale(0.82)
        step_f.next_to(step_T, DOWN, buff=0.35)
        self.play(Write(step_f))
        self.wait(0.8)

        key_note = Text("注意：f 与 v 无关！粒子无论快慢，转一圈时间相同。",
                        font=CJK, color=ORANGE).scale(0.44)
        key_note.next_to(step_f, DOWN, buff=0.35)
        self.play(FadeIn(key_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(pf_label, step_r, step_T, step_f, key_note)))

        # ── Step 6: 螺旋运动——速度分解 ──────────────────────────────────
        hel_label = Text("v 有沿 B 分量时：合成螺旋运动",
                         font=CJK, color=BLUE).scale(0.5)
        hel_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(hel_label))

        # 画坐标示意图
        axes = Axes(
            x_range=[0, 6, 1], y_range=[-2, 2, 1],
            x_length=7, y_length=4,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).move_to(np.array([0.5, -0.6, 0]))
        x_label = MathTex(r"B\text{-axis}", color=BLUE).scale(0.45)
        x_label.next_to(axes.get_right(), RIGHT, buff=0.1)

        self.play(Create(axes), FadeIn(x_label))
        self.wait(0.3)

        # 螺旋线（沿 x 轴延伸，y-z 平面做圆）
        spiral = axes.plot_parametric_curve(
            lambda t: np.array([t / (2 * math.pi) * 1.5,
                                 math.cos(t),
                                 0]),
            t_range=[0, 4 * math.pi, 0.05],
            color=RED, stroke_width=2.5,
        )
        self.play(Create(spiral), run_time=2.5)
        self.wait(0.5)

        # 螺距标注
        pitch_x1 = axes.c2p(0, 0)
        pitch_x2 = axes.c2p(1.5, 0)
        pitch_line = DashedLine(pitch_x1, pitch_x2, color=CYAN, stroke_width=2)
        pitch_brace = Brace(pitch_line, direction=DOWN, color=CYAN)
        pitch_text = MathTex(r"h = v_{\parallel} T", color=CYAN).scale(0.7)
        pitch_text.next_to(pitch_brace, DOWN, buff=0.12)
        self.play(Create(pitch_line), Create(pitch_brace), Write(pitch_text))
        self.wait(1.0)

        # 速度分解说明
        decomp_title = Text("速度分解", font=CJK, color=YELLOW).scale(0.45)
        decomp_title.to_corner(UR, buff=0.8)
        v_para = VGroup(
            MathTex(r"v_{\parallel}", color=ORANGE).scale(0.7),
            Text("沿 B 方向 → 匀速直线", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        v_perp2 = VGroup(
            MathTex(r"v_{\perp}", color=GREEN).scale(0.7),
            Text("垂直 B → 圆周运动", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        decomp_group = VGroup(v_para, v_perp2).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        decomp_group.next_to(decomp_title, DOWN, buff=0.25)
        self.play(FadeIn(decomp_title), FadeIn(decomp_group))
        self.wait(1.5)

        # 螺距公式完整版
        h_formula = MathTex(r"h = v_{\parallel} T = \frac{2\pi m v_{\parallel}}{qB}",
                            color=CYAN).scale(0.78)
        h_formula.to_corner(DR, buff=0.8)
        self.play(Write(h_formula))
        self.wait(1.8)
        self.play(FadeOut(VGroup(
            axes, x_label, spiral, pitch_line, pitch_brace, pitch_text,
            decomp_title, decomp_group, h_formula, hel_label
        )))

        # ── Step 7: 回旋加速器原理 ──────────────────────────────────────
        cyc_label = Text("应用：回旋加速器工作原理",
                         font=CJK, color=BLUE).scale(0.5)
        cyc_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(cyc_label))

        # D 形电极示意（左右两个半圆）
        d_left = Arc(radius=1.6, start_angle=PI / 2, angle=PI,
                     color=BLUE_D, stroke_width=10)
        d_left.move_to(np.array([-0.8, -0.5, 0]))
        d_right = Arc(radius=1.6, start_angle=-PI / 2, angle=PI,
                      color=BLUE_E, stroke_width=10)
        d_right.move_to(np.array([0.8, -0.5, 0]))
        gap_line = DashedLine(np.array([0, -2.1, 0]), np.array([0, 1.1, 0]),
                              color=YELLOW, stroke_width=2)
        d_left_lbl = Text("D1", font=CJK, color=BLUE).scale(0.55)
        d_left_lbl.move_to(np.array([-1.6, -0.5, 0]))
        d_right_lbl = Text("D2", font=CJK, color=BLUE_E).scale(0.55)
        d_right_lbl.move_to(np.array([1.6, -0.5, 0]))
        gap_lbl = Text("交变电压加速", font=CJK, color=YELLOW).scale(0.38)
        gap_lbl.move_to(np.array([0, 1.4, 0]))

        self.play(Create(d_left), Create(d_right), Create(gap_line))
        self.play(FadeIn(d_left_lbl), FadeIn(d_right_lbl), FadeIn(gap_lbl))
        self.wait(0.5)

        # 渐开线轨迹（近似：半圆半径逐渐增大）
        spiral_path = VGroup()
        center_l = np.array([-0.05, -0.5, 0])
        center_r = np.array([0.05, -0.5, 0])
        colors_orbit = [RED, ORANGE, YELLOW, GREEN]
        radii = [0.3, 0.6, 0.9, 1.2]
        for i, r in enumerate(radii):
            arc_l = Arc(radius=r, start_angle=-PI / 2, angle=-PI, color=colors_orbit[i],
                        stroke_width=2)
            arc_l.move_to(center_l)
            arc_r = Arc(radius=r + 0.15, start_angle=PI / 2, angle=-PI, color=colors_orbit[i],
                        stroke_width=2)
            arc_r.move_to(center_r)
            spiral_path.add(arc_l, arc_r)

        self.play(Create(spiral_path), run_time=2.5)
        self.wait(0.5)

        # 说明文字
        cyc_note1 = Text("每次穿越间隙被加速一次，v 增大，R 增大",
                         font=CJK, color=GREEN).scale(0.42)
        cyc_note1.move_to(np.array([0, -2.7, 0]))
        cyc_note2 = VGroup(
            Text("但周期 T 不变（因为", font=CJK).scale(0.42),
            MathTex(r"T=\frac{2\pi m}{qB}").scale(0.62),
            Text("与 v 无关）", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.1)
        cyc_note2.next_to(cyc_note1, DOWN, buff=0.2)
        cyc_note2.scale_to_fit_width(11.0)
        self.play(FadeIn(cyc_note1))
        self.wait(0.6)
        self.play(FadeIn(cyc_note2))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            d_left, d_right, gap_line, d_left_lbl, d_right_lbl,
            gap_lbl, spiral_path, cyc_note1, cyc_note2, cyc_label
        )))

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(s_title))

        f1 = MathTex(r"R = \frac{mv}{qB}", color=YELLOW).scale(0.82)
        f1_lbl = Text("圆周半径（v 越大圆越大）", font=CJK).scale(0.4)
        row1 = VGroup(f1, f1_lbl).arrange(RIGHT, buff=0.4)

        f2 = MathTex(r"T = \frac{2\pi m}{qB},\quad f = \frac{qB}{2\pi m}",
                     color=GREEN).scale(0.82)
        f2_lbl = Text("周期/频率与 v 无关！", font=CJK, color=ORANGE).scale(0.4)
        row2 = VGroup(f2, f2_lbl).arrange(RIGHT, buff=0.4)

        f3 = MathTex(r"h = \frac{2\pi m v_{\parallel}}{qB}", color=CYAN).scale(0.82)
        f3_lbl = Text("螺距（螺旋运动）", font=CJK).scale(0.4)
        row3 = VGroup(f3, f3_lbl).arrange(RIGHT, buff=0.4)

        summary = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(Write(f1), FadeIn(f1_lbl))
        self.wait(0.5)
        self.play(Write(f2), FadeIn(f2_lbl))
        self.wait(0.5)
        self.play(Write(f3), FadeIn(f3_lbl))
        self.wait(0.5)
        self.play(Create(box))
        self.wait(0.8)

        # 底部注记
        bottom_note = Text("回旋加速器正是利用「频率与速度无关」这一性质同步加速粒子",
                           font=CJK, color=ORANGE).scale(0.4)
        bottom_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(bottom_note))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, bottom_note, title)))
        self.wait(0.3)
