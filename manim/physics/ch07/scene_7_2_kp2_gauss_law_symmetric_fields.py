"""第 7.2 节 · 高斯定理求对称电场分布（知识点讲解）。

用高斯定理分析三类对称电场：球对称（带电球面）、柱对称（无限长线电荷）、
面对称（无限大平面电荷），逐一演示高斯面选取与电场公式推导。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp2GaussLawSymmetricFields(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("高斯定理求对称电场分布", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比 — 高斯定理的物理直觉
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("高斯定理：穿过任意封闭曲面的总电通量 = 面内电荷 / ε₀",
                    font=CJK).scale(0.46)
        gauss_law = MathTex(r"\oint_S \vec{E}\cdot d\vec{A} = \frac{Q_{enc}}{\varepsilon_0}").scale(0.9)
        ana2 = Text("利用电荷分布的对称性，巧选高斯面使 E 可从积分号提出，",
                    font=CJK).scale(0.44)
        ana3 = Text("从而一步求出 E 的大小。", font=CJK).scale(0.44)
        ana_group = VGroup(ana1, gauss_law, ana2, ana3).arrange(DOWN, buff=0.28)
        ana_group.next_to(title, DOWN, buff=0.55)
        ana_group.scale_to_fit_width(12)
        gauss_law.set_color(YELLOW)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(Write(gauss_law))
        self.wait(0.8)
        self.play(FadeIn(ana2), FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 场景一 — 球对称：带电球面
        # ══════════════════════════════════════════════════════════════
        s1_label = Text("场景一：球对称（带电球面 半径 R，总电荷 Q）",
                        font=CJK, color=ORANGE).scale(0.46).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s1_label))
        self.wait(0.8)

        # 左侧：几何图（带电球面 + 高斯面）
        ball_center = LEFT * 3.2 + DOWN * 0.5
        R_val = 0.9   # 带电球面半径（场景单位）
        r_tracker = ValueTracker(1.6)   # 高斯面半径

        # 带电球面（固定）
        charged_shell = Circle(radius=R_val, color=RED, stroke_width=3).move_to(ball_center)
        shell_label = Text("Q, R", font=CJK, color=RED).scale(0.38)
        shell_label.next_to(ball_center + RIGHT * R_val, RIGHT, buff=0.08)

        # 高斯面（随 r_tracker 变化）
        def make_gauss_ball():
            r = r_tracker.get_value()
            color = GREEN if r > R_val else CYAN
            style = {}
            circ = DashedLine(ORIGIN, ORIGIN)   # placeholder
            circ = Circle(radius=r, color=color, stroke_width=2.5).move_to(ball_center)
            return circ

        gauss_ball = always_redraw(make_gauss_ball)

        # 高斯面半径标注
        def make_r_label_ball():
            r = r_tracker.get_value()
            line = Line(ball_center, ball_center + RIGHT * r_tracker.get_value(),
                        color=CYAN, stroke_width=1.5)
            lbl = MathTex(r"r", color=CYAN).scale(0.55)
            lbl.next_to(ball_center + RIGHT * r * 0.5, UP, buff=0.08)
            return VGroup(line, lbl)

        r_label_ball = always_redraw(make_r_label_ball)

        # E 箭头（仅在 r > R 时显示，正 8 方向）
        def make_e_arrows_ball():
            r = r_tracker.get_value()
            grp = VGroup()
            if r <= R_val:
                return grp
            scale_len = 0.28 / (r ** 2) * 1.6
            for k in range(8):
                ang = k * TAU / 8
                d = np.array([math.cos(ang), math.sin(ang), 0.0])
                start = ball_center + d * (r + 0.05)
                end = ball_center + d * (r + 0.05 + scale_len)
                grp.add(Arrow(start, end, buff=0, color=YELLOW,
                              stroke_width=2, max_tip_length_to_length_ratio=0.3))
            return grp

        e_arrows_ball = always_redraw(make_e_arrows_ball)

        # 内部 E=0 虚线（仅 r < R 时）
        def make_inner_label_ball():
            r = r_tracker.get_value()
            grp = VGroup()
            if r >= R_val:
                return grp
            lbl = VGroup(
                Text("E = 0", font=CJK, color=CYAN).scale(0.38)
            ).move_to(ball_center + DOWN * 0.0)
            return lbl

        inner_lbl_ball = always_redraw(make_inner_label_ball)

        # 右侧：E(r) 曲线坐标轴
        ax_ball = Axes(
            x_range=[0, 3.2, 0.8], y_range=[0, 2.2, 0.5],
            x_length=4.0, y_length=2.8,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=True
        ).move_to(RIGHT * 2.5 + DOWN * 0.6)

        ax_ball_xl = VGroup(MathTex(r"r", color=WHITE).scale(0.5))
        ax_ball_xl.next_to(ax_ball.x_axis.get_end(), RIGHT, buff=0.12)
        ax_ball_yl = VGroup(MathTex(r"E", color=YELLOW).scale(0.5))
        ax_ball_yl.next_to(ax_ball.y_axis.get_end(), UP, buff=0.1)

        # R 竖线标注
        r_mark_ball = DashedLine(
            ax_ball.c2p(R_val / 0.6, 0), ax_ball.c2p(R_val / 0.6, 2.0),
            color=RED, stroke_width=1.5, dash_length=0.08
        )
        r_mark_lbl = MathTex(r"R", color=RED).scale(0.5)
        r_mark_lbl.next_to(ax_ball.c2p(R_val / 0.6, 0), DOWN, buff=0.1)

        # 曲线：r < R 时 E=0；r > R 时 E = k/(r²) 归一化
        curve_ball_out = ax_ball.plot(
            lambda x: 0.8 / ((x * 0.6) ** 2) if x * 0.6 > R_val else 0,
            x_range=[R_val / 0.6, 3.2], color=YELLOW, stroke_width=2.5
        )
        curve_ball_in = ax_ball.plot(
            lambda x: 0,
            x_range=[0.01, R_val / 0.6], color=CYAN, stroke_width=2.5
        )

        # 移动点：跟随 r_tracker
        def make_dot_ball():
            r = r_tracker.get_value()
            xp = r / 0.6
            if xp <= 0.02 or xp > 3.1:
                xp = max(0.05, min(xp, 3.1))
            if r <= R_val:
                yp = 0
            else:
                yp = 0.8 / (r ** 2)
            return Dot(ax_ball.c2p(xp, yp), color=GREEN, radius=0.09)

        dot_ball = always_redraw(make_dot_ball)

        # 公式
        ball_formula = VGroup(
            MathTex(r"r>R:", color=WHITE).scale(0.5),
            MathTex(r"E=\frac{Q}{4\pi\varepsilon_0 r^2}", color=YELLOW).scale(0.5),
            MathTex(r"r<R:", color=WHITE).scale(0.5),
            MathTex(r"E=0", color=CYAN).scale(0.5),
        )
        ball_formula.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        ball_formula.next_to(ax_ball, RIGHT, buff=0.3)
        ball_formula.scale_to_fit_width(2.2)

        # 显示场景一
        self.play(
            Create(charged_shell), FadeIn(shell_label),
            Create(gauss_ball), Create(r_label_ball),
            Create(ax_ball), FadeIn(ax_ball_xl), FadeIn(ax_ball_yl),
            FadeIn(r_mark_ball), FadeIn(r_mark_lbl),
        )
        self.play(Create(curve_ball_out), Create(curve_ball_in))
        self.add(e_arrows_ball, inner_lbl_ball, dot_ball)
        self.play(FadeIn(ball_formula))
        self.wait(0.8)

        # ValueTracker 从外到内扫动
        note_ball = Text("r 从大到小扫过：r>R 有电场，r<R 电场为零",
                         font=CJK, color=GREEN).scale(0.4).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(note_ball))
        self.play(r_tracker.animate.set_value(2.5), run_time=1.6)
        self.play(r_tracker.animate.set_value(0.5), run_time=2.8)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(1.6), run_time=1.4)
        self.wait(0.8)

        scene1_group = VGroup(
            charged_shell, shell_label, gauss_ball, r_label_ball,
            e_arrows_ball, inner_lbl_ball, dot_ball,
            ax_ball, ax_ball_xl, ax_ball_yl,
            r_mark_ball, r_mark_lbl, curve_ball_out, curve_ball_in,
            ball_formula, note_ball, s1_label
        )
        self.play(FadeOut(scene1_group))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════
        # Step 4: 场景二 — 柱对称：无限长线电荷
        # ══════════════════════════════════════════════════════════════
        s2_label = Text("场景二：柱对称（无限长线电荷 线密度 λ）",
                        font=CJK, color=ORANGE).scale(0.46).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s2_label))
        self.wait(0.6)

        cyl_center = LEFT * 3.2 + DOWN * 0.4
        R_cyl = 0.55   # 圆柱半径（线电荷近似为细轴）
        r_cyl = ValueTracker(1.4)

        # 圆柱截面（椭圆模拟正视图）
        cyl_body = Ellipse(width=R_cyl * 2, height=R_cyl * 1.1, color=RED, stroke_width=3)
        cyl_body.move_to(cyl_center)
        cyl_top = Line(
            cyl_center + LEFT * R_cyl + UP * 0.55,
            cyl_center + RIGHT * R_cyl + UP * 0.55,
            color=RED, stroke_width=2
        )
        cyl_bot = Line(
            cyl_center + LEFT * R_cyl + DOWN * 0.55,
            cyl_center + RIGHT * R_cyl + DOWN * 0.55,
            color=RED, stroke_width=2
        )
        cyl_lside = Line(
            cyl_center + LEFT * R_cyl + UP * 0.55,
            cyl_center + LEFT * R_cyl + DOWN * 0.55,
            color=RED, stroke_width=2
        )
        cyl_rside = Line(
            cyl_center + RIGHT * R_cyl + UP * 0.55,
            cyl_center + RIGHT * R_cyl + DOWN * 0.55,
            color=RED, stroke_width=2
        )
        cyl_label = VGroup(Text("λ", font=CJK, color=RED).scale(0.5)).move_to(cyl_center)

        # 高斯圆柱（侧面圆）
        def make_gauss_cyl():
            r = r_cyl.get_value()
            color = GREEN if r > R_cyl else CYAN
            return Circle(radius=r, color=color, stroke_width=2.5).move_to(cyl_center)

        gauss_cyl = always_redraw(make_gauss_cyl)

        def make_r_label_cyl():
            r = r_cyl.get_value()
            line = Line(cyl_center, cyl_center + RIGHT * r, color=CYAN, stroke_width=1.5)
            lbl = MathTex(r"r", color=CYAN).scale(0.52)
            lbl.next_to(cyl_center + RIGHT * r * 0.5, UP, buff=0.08)
            return VGroup(line, lbl)

        r_label_cyl = always_redraw(make_r_label_cyl)

        # E 箭头（柱对称，8方向，幅度 ∝ 1/r）
        def make_e_arrows_cyl():
            r = r_cyl.get_value()
            grp = VGroup()
            if r <= R_cyl:
                return grp
            scale_len = 0.22 / r
            for k in range(8):
                ang = k * TAU / 8
                d = np.array([math.cos(ang), math.sin(ang), 0.0])
                start = cyl_center + d * (r + 0.04)
                end = cyl_center + d * (r + 0.04 + scale_len)
                grp.add(Arrow(start, end, buff=0, color=YELLOW,
                              stroke_width=2, max_tip_length_to_length_ratio=0.3))
            return grp

        e_arrows_cyl = always_redraw(make_e_arrows_cyl)

        def make_inner_lbl_cyl():
            r = r_cyl.get_value()
            if r >= R_cyl:
                return VGroup()
            return VGroup(Text("E = 0", font=CJK, color=CYAN).scale(0.38)
                          ).move_to(cyl_center + UP * 0.22)

        inner_lbl_cyl = always_redraw(make_inner_lbl_cyl)

        # 底面通量标注（静态）
        flux_note = VGroup(
            Text("底面: E⊥法向 → 通量=0", font=CJK, color=ORANGE).scale(0.38)
        ).move_to(cyl_center + DOWN * 1.1)

        # 右侧坐标轴
        ax_cyl = Axes(
            x_range=[0, 3.2, 0.8], y_range=[0, 2.2, 0.5],
            x_length=4.0, y_length=2.8,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=True
        ).move_to(RIGHT * 2.5 + DOWN * 0.6)

        ax_cyl_xl = MathTex(r"r", color=WHITE).scale(0.5)
        ax_cyl_xl.next_to(ax_cyl.x_axis.get_end(), RIGHT, buff=0.12)
        ax_cyl_yl = MathTex(r"E", color=YELLOW).scale(0.5)
        ax_cyl_yl.next_to(ax_cyl.y_axis.get_end(), UP, buff=0.1)

        r_mark_cyl = DashedLine(
            ax_cyl.c2p(R_cyl / 0.55, 0), ax_cyl.c2p(R_cyl / 0.55, 2.0),
            color=RED, stroke_width=1.5, dash_length=0.08
        )
        r_mark_cyl_lbl = MathTex(r"R", color=RED).scale(0.5)
        r_mark_cyl_lbl.next_to(ax_cyl.c2p(R_cyl / 0.55, 0), DOWN, buff=0.1)

        curve_cyl_out = ax_cyl.plot(
            lambda x: 0.7 / (x * 0.55) if x * 0.55 > R_cyl else 0,
            x_range=[R_cyl / 0.55, 3.2], color=YELLOW, stroke_width=2.5
        )
        curve_cyl_in = ax_cyl.plot(
            lambda x: 0,
            x_range=[0.01, R_cyl / 0.55], color=CYAN, stroke_width=2.5
        )

        def make_dot_cyl():
            r = r_cyl.get_value()
            xp = r / 0.55
            xp = max(0.05, min(xp, 3.1))
            yp = 0.7 / r if r > R_cyl else 0
            yp = min(yp, 2.1)
            return Dot(ax_cyl.c2p(xp, yp), color=GREEN, radius=0.09)

        dot_cyl = always_redraw(make_dot_cyl)

        cyl_formula = VGroup(
            MathTex(r"r>R:", color=WHITE).scale(0.48),
            MathTex(r"E=\frac{\lambda}{2\pi\varepsilon_0 r}", color=YELLOW).scale(0.48),
            MathTex(r"r<R:", color=WHITE).scale(0.48),
            MathTex(r"E=0", color=CYAN).scale(0.48),
        )
        cyl_formula.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        cyl_formula.next_to(ax_cyl, RIGHT, buff=0.3)
        cyl_formula.scale_to_fit_width(2.2)

        cyl_geom = VGroup(cyl_body, cyl_top, cyl_bot, cyl_lside, cyl_rside, cyl_label)
        self.play(Create(cyl_geom))
        self.play(
            Create(gauss_cyl), Create(r_label_cyl),
            Create(ax_cyl), FadeIn(ax_cyl_xl), FadeIn(ax_cyl_yl),
            FadeIn(r_mark_cyl), FadeIn(r_mark_cyl_lbl),
        )
        self.play(Create(curve_cyl_out), Create(curve_cyl_in))
        self.add(e_arrows_cyl, inner_lbl_cyl, dot_cyl)
        self.play(FadeIn(cyl_formula), FadeIn(flux_note))
        self.wait(0.8)

        note_cyl = Text("r 从大到小扫过：1/r 衰减 vs 内部 E=0",
                        font=CJK, color=GREEN).scale(0.4).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(note_cyl))
        self.play(r_cyl.animate.set_value(2.6), run_time=1.6)
        self.play(r_cyl.animate.set_value(0.28), run_time=2.8)
        self.wait(0.5)
        self.play(r_cyl.animate.set_value(1.4), run_time=1.4)
        self.wait(0.8)

        scene2_group = VGroup(
            cyl_geom, gauss_cyl, r_label_cyl, e_arrows_cyl, inner_lbl_cyl, dot_cyl,
            ax_cyl, ax_cyl_xl, ax_cyl_yl, r_mark_cyl, r_mark_cyl_lbl,
            curve_cyl_out, curve_cyl_in, cyl_formula, flux_note, note_cyl, s2_label
        )
        self.play(FadeOut(scene2_group))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════
        # Step 5: 场景三 — 面对称：无限大带电平面
        # ══════════════════════════════════════════════════════════════
        s3_label = Text("场景三：面对称（无限大带电平面 面密度 σ）",
                        font=CJK, color=ORANGE).scale(0.46).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s3_label))
        self.wait(0.6)

        plane_center = LEFT * 2.8 + DOWN * 0.4

        # 带电平面（竖线表示）
        charged_plane = Line(
            plane_center + UP * 1.5, plane_center + DOWN * 1.5,
            color=RED, stroke_width=5
        )
        plane_label = VGroup(
            Text("σ", font=CJK, color=RED).scale(0.55)
        ).next_to(charged_plane, LEFT, buff=0.15)

        # 盒形高斯面（矩形）
        box_w = 1.0   # 半宽
        box_h = 1.0   # 半高
        box = Rectangle(width=box_w * 2, height=box_h * 2,
                        color=GREEN, stroke_width=2.5).move_to(plane_center)

        # 两侧面标注 (E 方向与法向同向 → 贡献通量)
        left_face = Line(
            plane_center + LEFT * box_w + UP * box_h,
            plane_center + LEFT * box_w + DOWN * box_h,
            color=CYAN, stroke_width=3
        )
        right_face = Line(
            plane_center + RIGHT * box_w + UP * box_h,
            plane_center + RIGHT * box_w + DOWN * box_h,
            color=CYAN, stroke_width=3
        )
        left_label = Text("E·A", font=CJK, color=CYAN).scale(0.38)
        left_label.next_to(left_face, LEFT, buff=0.12)
        right_label = Text("E·A", font=CJK, color=CYAN).scale(0.38)
        right_label.next_to(right_face, RIGHT, buff=0.12)

        # 上下面标注（通量=0）
        top_face = Line(
            plane_center + LEFT * box_w + UP * box_h,
            plane_center + RIGHT * box_w + UP * box_h,
            color=ORANGE, stroke_width=2
        )
        bot_face = Line(
            plane_center + LEFT * box_w + DOWN * box_h,
            plane_center + RIGHT * box_w + DOWN * box_h,
            color=ORANGE, stroke_width=2
        )
        top_label = Text("通量=0", font=CJK, color=ORANGE).scale(0.36)
        top_label.next_to(top_face, UP, buff=0.1)
        bot_label = Text("通量=0", font=CJK, color=ORANGE).scale(0.36)
        bot_label.next_to(bot_face, DOWN, buff=0.1)

        # E 箭头双向（均匀场）
        e_left1 = Arrow(plane_center + LEFT * box_w,
                        plane_center + LEFT * (box_w + 0.55),
                        buff=0, color=YELLOW, stroke_width=2.5,
                        max_tip_length_to_length_ratio=0.25)
        e_left2 = e_left1.copy().shift(UP * 0.5)
        e_left3 = e_left1.copy().shift(DOWN * 0.5)
        e_right1 = Arrow(plane_center + RIGHT * box_w,
                         plane_center + RIGHT * (box_w + 0.55),
                         buff=0, color=YELLOW, stroke_width=2.5,
                         max_tip_length_to_length_ratio=0.25)
        e_right2 = e_right1.copy().shift(UP * 0.5)
        e_right3 = e_right1.copy().shift(DOWN * 0.5)
        e_arrows_plane = VGroup(e_left1, e_left2, e_left3,
                                e_right1, e_right2, e_right3)

        # 推导公式
        plane_deriv = VGroup(
            MathTex(r"\oint \vec{E}\cdot d\vec{A}=2EA", color=WHITE).scale(0.55),
            MathTex(r"Q_{enc}=\sigma A", color=WHITE).scale(0.55),
            MathTex(r"\Rightarrow E=\frac{\sigma}{2\varepsilon_0}", color=YELLOW).scale(0.65),
        )
        plane_deriv.arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        plane_deriv.move_to(RIGHT * 2.4 + DOWN * 0.5)

        sym_note = VGroup(
            Text("均匀场：箭头等长，双向对称", font=CJK, color=GREEN).scale(0.42)
        ).to_edge(DOWN, buff=0.55)

        self.play(Create(charged_plane), FadeIn(plane_label))
        self.play(Create(box))
        self.play(Create(left_face), Create(right_face),
                  FadeIn(left_label), FadeIn(right_label))
        self.play(Create(top_face), Create(bot_face),
                  FadeIn(top_label), FadeIn(bot_label))
        self.wait(0.5)
        self.play(GrowArrow(e_left1), GrowArrow(e_left2), GrowArrow(e_left3),
                  GrowArrow(e_right1), GrowArrow(e_right2), GrowArrow(e_right3))
        self.play(FadeIn(sym_note))
        self.wait(0.8)
        self.play(Write(plane_deriv[0]))
        self.wait(0.6)
        self.play(Write(plane_deriv[1]))
        self.wait(0.6)
        self.play(TransformMatchingTex(plane_deriv[0].copy(), plane_deriv[2]))
        self.wait(1.2)

        scene3_group = VGroup(
            charged_plane, plane_label, box,
            left_face, right_face, left_label, right_label,
            top_face, bot_face, top_label, bot_label,
            e_arrows_plane, plane_deriv, sym_note, s3_label
        )
        self.play(FadeOut(scene3_group))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════
        # Step 6: 对比总结 — 三种结果并列
        # ══════════════════════════════════════════════════════════════
        sum_title = Text("三类对称电场总结对比", font=CJK, color=BLUE).scale(0.58)
        sum_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sum_title))

        row1 = VGroup(
            Text("球（带电球面）", font=CJK, color=RED).scale(0.44),
            MathTex(r"E=\frac{Q}{4\pi\varepsilon_0 r^2}\ (r>R),\quad E=0\ (r<R)", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.3)

        row2 = VGroup(
            Text("柱（线电荷）", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"E=\frac{\lambda}{2\pi\varepsilon_0 r}\ (r>R),\quad E=0\ (r<R)", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.3)

        row3 = VGroup(
            Text("面（无限平面）", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"E=\frac{\sigma}{2\varepsilon_0}\ (\text{uniform})", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.3)

        table = VGroup(row1, row2, row3).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        table.next_to(sum_title, DOWN, buff=0.45)
        table.scale_to_fit_width(12.5)

        box_sum = SurroundingRectangle(table, color=BLUE, buff=0.3, corner_radius=0.12)

        key_note = Text("关键：选高斯面与 E 方向对齐，利用对称性将 E 提出积分号",
                        font=CJK, color=CYAN).scale(0.42)
        key_note.next_to(box_sum, DOWN, buff=0.3)

        self.play(FadeIn(row1))
        self.wait(0.6)
        self.play(FadeIn(row2))
        self.wait(0.6)
        self.play(FadeIn(row3))
        self.play(Create(box_sum))
        self.wait(0.6)
        self.play(FadeIn(key_note))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, table, box_sum, key_note, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch07Kp2GaussLawSymmetricFields",
        "id": "phys-ch07-7.2-kp2-gauss-law-symmetric-fields",
        "chapterId": "ch07",
        "sectionId": "7.2",
        "title": "高斯定理求对称电场分布",
        "description": "通过球对称、柱对称、面对称三类典型模型，演示如何借助高斯定理和对称性一步求出 E 的分布规律及公式。",
    },
]
