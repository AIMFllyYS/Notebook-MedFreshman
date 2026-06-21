"""第 9.1 节 · 例题 2：矩形线圈远离长直导线的感应电动势

物理动画范式：矢量场/场线 + 动生 EMF 推导 + ValueTracker 扫动运动过程。
演示矩形线圈从初位置 R1 向右运动远离长直导线，AB/CD 两边动生 EMF 之差
构成净感应电动势，并用楞次定律判断电流方向。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数与题目参数 ──────────────────────────────────────────────────
MU0_I_OVER_2PI = 1.0   # 归一化：μ₀I/(2π) = 1，用于可视化
R1_INIT = 1.2          # 初始左边 AB 距导线距离（屏幕单位）
COIL_WIDTH = 1.6       # 线圈宽度 (R2-R1)
COIL_HEIGHT = 1.4      # 线圈高度 l


class Ch09Ex2RectangularCoilMovingAwayWire(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("矩形线圈远离长直导线的感应电动势",
                     font=CJK, color=BLUE).scale(0.58).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.1 · 例题 2",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("一根通电导线周围有非均匀磁场：越远越弱。", font=CJK).scale(0.46)
        a2 = Text("当矩形线圈向远处运动时，线圈两侧感受到的磁场强弱不同，", font=CJK).scale(0.46)
        a3 = Text("两侧动生电动势之差就是驱动感应电流的净 EMF。", font=CJK).scale(0.46)
        analogy = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.4)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 核心公式推导（逐步出现）
        # ══════════════════════════════════════════════════════════════════
        deriv_label = Text("推导过程", font=CJK, color=BLUE).scale(0.5)
        deriv_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_label))

        # 3a: 安培定律给出 B(r)
        eq_B = MathTex(
            r"B(r)", r"=", r"\frac{\mu_0 I}{2\pi r}",
            color=WHITE
        ).scale(0.8)
        eq_B[0].set_color(YELLOW)
        eq_B[2].set_color(CYAN)
        eq_B.next_to(deriv_label, DOWN, buff=0.4)
        note_B = Text("安培定律：磁感应强度随距离 r 成反比", font=CJK).scale(0.38)
        note_B.next_to(eq_B, DOWN, buff=0.22)
        self.play(Write(eq_B))
        self.play(FadeIn(note_B))
        self.wait(1.2)

        # 3b: AB 边动生 EMF
        eq_eAB = MathTex(
            r"\varepsilon_{AB}", r"=", r"B(R_1)\,l\,v",
            r"=", r"\frac{\mu_0 I l v}{2\pi R_1}",
        ).scale(0.75)
        eq_eAB[0].set_color(ORANGE)
        eq_eAB[4].set_color(ORANGE)
        eq_eAB.next_to(note_B, DOWN, buff=0.3)
        note_AB = Text("AB 边（近端）动生 EMF：较大", font=CJK).scale(0.38)
        note_AB.next_to(eq_eAB, DOWN, buff=0.18)
        self.play(Write(eq_eAB))
        self.play(FadeIn(note_AB))
        self.wait(1.0)

        # 3c: CD 边动生 EMF
        eq_eCD = MathTex(
            r"\varepsilon_{CD}", r"=", r"B(R_2)\,l\,v",
            r"=", r"\frac{\mu_0 I l v}{2\pi R_2}",
        ).scale(0.75)
        eq_eCD[0].set_color(RED)
        eq_eCD[4].set_color(RED)
        eq_eCD.next_to(note_AB, DOWN, buff=0.3)
        note_CD = Text("CD 边（远端）动生 EMF：较小", font=CJK).scale(0.38)
        note_CD.next_to(eq_eCD, DOWN, buff=0.18)
        self.play(Write(eq_eCD))
        self.play(FadeIn(note_CD))
        self.wait(1.0)

        # 3d: 净 EMF = 差值
        eq_net = MathTex(
            r"\varepsilon",
            r"=",
            r"\varepsilon_{AB} - \varepsilon_{CD}",
            r"=",
            r"\frac{\mu_0 I l v}{2\pi}\!\left(\frac{1}{R_1}-\frac{1}{R_2}\right)",
        ).scale(0.7)
        eq_net[0].set_color(GREEN)
        eq_net[2].set_color(YELLOW)
        eq_net[4].set_color(GREEN)
        eq_net.next_to(note_CD, DOWN, buff=0.3)
        box_net = SurroundingRectangle(eq_net, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Write(eq_net))
        self.play(Create(box_net))
        self.wait(1.2)

        # 化简为 R2-R1 形式
        eq_final = MathTex(
            r"\varepsilon",
            r"=",
            r"\frac{\mu_0 I l v (R_2 - R_1)}{2\pi R_1 R_2}",
        ).scale(0.78)
        eq_final[0].set_color(GREEN)
        eq_final[2].set_color(GREEN)
        eq_final.next_to(box_net, DOWN, buff=0.28)
        box_final = SurroundingRectangle(eq_final, color=YELLOW, buff=0.18, corner_radius=0.1)
        note_final = Text("化简后：分子含线圈宽度 (R2-R1)，分母含位置乘积 R1·R2",
                          font=CJK).scale(0.36)
        note_final.next_to(eq_final, DOWN, buff=0.18)

        # 保证布局不超屏
        deriv_group = VGroup(deriv_label, eq_B, note_B, eq_eAB, note_AB,
                             eq_eCD, note_CD, eq_net, box_net)
        deriv_group.scale_to_fit_width(13).next_to(title, DOWN, buff=0.45)

        self.play(Write(eq_final))
        self.play(Create(box_final))
        self.play(FadeIn(note_final))
        self.wait(1.5)

        all_deriv = VGroup(deriv_group, eq_final, box_final, note_final)
        self.play(FadeOut(all_deriv))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 几何场景——长直导线 + 磁感线 + 线圈（完整可视化）
        # ══════════════════════════════════════════════════════════════════
        scene_label = Text("物理图像", font=CJK, color=BLUE).scale(0.5)
        scene_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(scene_label))

        # ── 4a: 长直导线（左侧）────────────────────────────────────────
        wire_x = -5.0
        wire = Line(
            start=np.array([wire_x, -3.5, 0]),
            end=np.array([wire_x, 3.5, 0]),
            color=GREEN,
            stroke_width=5,
        )
        wire_label = Text("I", font=CJK, color=GREEN).scale(0.55)
        wire_label.next_to(wire, LEFT, buff=0.15)
        # 电流方向箭头
        wire_arrow = Arrow(
            start=np.array([wire_x, -0.5, 0]),
            end=np.array([wire_x, 0.5, 0]),
            color=GREEN, buff=0, stroke_width=4,
        )
        self.play(Create(wire), FadeIn(wire_label), GrowArrow(wire_arrow))
        self.wait(0.5)

        # ── 4b: 磁感线（半圆弧模拟，密度随距离减小）────────────────────
        def make_field_lines():
            arcs = VGroup()
            radii = [0.7, 1.1, 1.6, 2.3, 3.1]
            for r in radii:
                opacity = 0.9 / (r ** 0.7)   # 越远越透明
                arc = Arc(
                    radius=r,
                    start_angle=-PI / 2.2,
                    angle=PI / 1.1,
                    color=BLUE_C,
                    stroke_width=max(1.5, 3.0 / r),
                    stroke_opacity=min(opacity, 0.85),
                ).shift(np.array([wire_x, 0, 0]))
                arcs.add(arc)
            return arcs

        field_lines = make_field_lines()
        fl_label = Text("磁感线（进入纸面·x）", font=CJK, color=BLUE_C).scale(0.38)
        fl_label.to_corner(DL, buff=0.4)
        self.play(Create(field_lines), FadeIn(fl_label))
        self.wait(0.8)

        # ── 4c: 初始矩形线圈 ABCD ───────────────────────────────────────
        # 线圈 ValueTracker 控制 x 偏移
        t = ValueTracker(0.0)   # 偏移量：0 = 初始位置

        # 初始位置参数（屏幕坐标）
        # AB 在 x = wire_x + R1_INIT，CD 在 x = wire_x + R1_INIT + COIL_WIDTH
        coil_y_top = COIL_HEIGHT / 2
        coil_y_bot = -COIL_HEIGHT / 2

        def get_coil():
            offset = t.get_value()
            x_left = wire_x + R1_INIT + offset
            x_right = wire_x + R1_INIT + COIL_WIDTH + offset
            rect = Polygon(
                np.array([x_left, coil_y_top, 0]),
                np.array([x_right, coil_y_top, 0]),
                np.array([x_right, coil_y_bot, 0]),
                np.array([x_left, coil_y_bot, 0]),
                color=WHITE,
                stroke_width=3,
            )
            return rect

        coil = always_redraw(get_coil)

        # 顶点标签
        def get_A():
            offset = t.get_value()
            x = wire_x + R1_INIT + offset
            return Text("A", font=CJK, color=WHITE).scale(0.38).move_to(
                np.array([x - 0.25, coil_y_top + 0.25, 0]))

        def get_B():
            offset = t.get_value()
            x = wire_x + R1_INIT + offset
            return Text("B", font=CJK, color=WHITE).scale(0.38).move_to(
                np.array([x - 0.25, coil_y_bot - 0.25, 0]))

        def get_C():
            offset = t.get_value()
            x = wire_x + R1_INIT + COIL_WIDTH + offset
            return Text("C", font=CJK, color=WHITE).scale(0.38).move_to(
                np.array([x + 0.25, coil_y_bot - 0.25, 0]))

        def get_D():
            offset = t.get_value()
            x = wire_x + R1_INIT + COIL_WIDTH + offset
            return Text("D", font=CJK, color=WHITE).scale(0.38).move_to(
                np.array([x + 0.25, coil_y_top + 0.25, 0]))

        lbl_A = always_redraw(get_A)
        lbl_B = always_redraw(get_B)
        lbl_C = always_redraw(get_C)
        lbl_D = always_redraw(get_D)

        self.play(Create(coil), FadeIn(lbl_A, lbl_B, lbl_C, lbl_D))
        self.wait(0.8)

        # ── 4d: 标注 R1、R2 与线圈宽度 ──────────────────────────────────
        r1_label = Text("R1", font=CJK, color=ORANGE).scale(0.4)
        r1_label.move_to(np.array([wire_x + R1_INIT / 2, coil_y_bot - 0.5, 0]))
        r2_label = Text("R2", font=CJK, color=RED).scale(0.4)
        r2_label.move_to(np.array([wire_x + R1_INIT + COIL_WIDTH / 2, coil_y_bot - 0.5, 0]))
        l_label = VGroup(
            Text("l", font=CJK, color=WHITE).scale(0.4),
        ).move_to(np.array([wire_x + R1_INIT + COIL_WIDTH + 0.55, 0, 0]))

        # 距离标注横线
        dash_r1 = DashedLine(
            np.array([wire_x, coil_y_bot - 0.35, 0]),
            np.array([wire_x + R1_INIT, coil_y_bot - 0.35, 0]),
            color=ORANGE, stroke_width=1.5,
        )
        dash_r2 = DashedLine(
            np.array([wire_x, coil_y_bot - 0.35, 0]),
            np.array([wire_x + R1_INIT + COIL_WIDTH, coil_y_bot - 0.35, 0]),
            color=RED, stroke_width=1.5,
        )
        self.play(Create(dash_r1), FadeIn(r1_label))
        self.play(Create(dash_r2), FadeIn(r2_label))
        self.play(FadeIn(l_label))
        self.wait(1.0)

        # ── 4e: AB / CD 边的磁场强弱标注 ─────────────────────────────────
        b_AB = VGroup(
            Text("B(AB)", font=CJK, color=ORANGE).scale(0.38),
            Text("(大)", font=CJK, color=ORANGE).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        b_AB.move_to(np.array([wire_x + R1_INIT - 0.05, coil_y_top + 0.55, 0]))

        b_CD = VGroup(
            Text("B(CD)", font=CJK, color=RED).scale(0.38),
            Text("(小)", font=CJK, color=RED).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        b_CD.move_to(np.array([wire_x + R1_INIT + COIL_WIDTH + 0.1, coil_y_top + 0.55, 0]))

        self.play(FadeIn(b_AB), FadeIn(b_CD))
        self.wait(1.0)

        # ── 4f: EMF 贡献箭头（AB 大、CD 小）────────────────────────────
        emf_AB_arrow = Arrow(
            start=np.array([wire_x + R1_INIT, coil_y_bot + 0.2, 0]),
            end=np.array([wire_x + R1_INIT, coil_y_top - 0.2, 0]),
            color=ORANGE, buff=0, stroke_width=3,
        )
        emf_AB_label = MathTex(r"\varepsilon_{AB}", color=ORANGE).scale(0.55)
        emf_AB_label.next_to(emf_AB_arrow, LEFT, buff=0.12)

        emf_CD_arrow = Arrow(
            start=np.array([wire_x + R1_INIT + COIL_WIDTH, coil_y_top - 0.2, 0]),
            end=np.array([wire_x + R1_INIT + COIL_WIDTH, coil_y_bot + 0.2, 0]),
            color=RED, buff=0, stroke_width=3,
        )
        emf_CD_label = MathTex(r"\varepsilon_{CD}", color=RED).scale(0.55)
        emf_CD_label.next_to(emf_CD_arrow, RIGHT, buff=0.12)

        self.play(GrowArrow(emf_AB_arrow), FadeIn(emf_AB_label))
        self.play(GrowArrow(emf_CD_arrow), FadeIn(emf_CD_label))
        self.wait(0.8)

        # 净 EMF 标注
        emf_net_tex = MathTex(
            r"\varepsilon = \varepsilon_{AB} - \varepsilon_{CD} > 0",
            color=GREEN,
        ).scale(0.6)
        emf_net_tex.to_corner(DR, buff=0.5)
        self.play(FadeIn(emf_net_tex))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 线圈向右运动（ValueTracker 扫动）
        # ══════════════════════════════════════════════════════════════════
        move_label = Text("线圈向右运动（远离导线）", font=CJK, color=YELLOW).scale(0.44)
        move_label.to_corner(UL, buff=0.3).shift(DOWN * 0.6)
        velocity_arrow = Arrow(
            start=np.array([wire_x + R1_INIT + COIL_WIDTH / 2, coil_y_top + 0.1, 0]),
            end=np.array([wire_x + R1_INIT + COIL_WIDTH / 2 + 0.7, coil_y_top + 0.1, 0]),
            color=YELLOW, buff=0, stroke_width=3,
        )
        v_label = MathTex(r"v", color=YELLOW).scale(0.55)
        v_label.next_to(velocity_arrow, UP, buff=0.1)

        self.play(FadeIn(move_label), GrowArrow(velocity_arrow), FadeIn(v_label))
        # 运动过程中清掉静态标注（避免错位）
        static_labels = VGroup(b_AB, b_CD, r1_label, r2_label, l_label,
                               dash_r1, dash_r2, emf_AB_arrow, emf_AB_label,
                               emf_CD_arrow, emf_CD_label, velocity_arrow, v_label)
        self.play(t.animate.set_value(2.2), run_time=3.0)
        self.wait(0.5)
        self.play(FadeOut(static_labels), FadeOut(move_label), FadeOut(emf_net_tex))

        # 清除线圈与导线场景
        scene_objects = VGroup(wire, wire_arrow, wire_label, field_lines,
                               coil, lbl_A, lbl_B, lbl_C, lbl_D,
                               fl_label, scene_label)
        self.play(FadeOut(scene_objects))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: ε(t) 随时间衰减曲线（坐标轴 + 实时曲线）
        # ══════════════════════════════════════════════════════════════════
        curve_label = Text("感应电动势随位移衰减", font=CJK, color=BLUE).scale(0.5)
        curve_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(curve_label))

        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.4, 0.5],
            x_length=7,
            y_length=3.5,
            axis_config={"color": WHITE, "include_tip": True},
        ).shift(DOWN * 0.3)

        x_label_txt = Text("位移 x", font=CJK, color=WHITE).scale(0.4)
        x_label_txt.next_to(axes.x_axis, RIGHT, buff=0.15)
        y_label_tex = MathTex(r"\varepsilon", color=WHITE).scale(0.6)
        y_label_tex.next_to(axes.y_axis, UP, buff=0.15)

        self.play(Create(axes), FadeIn(x_label_txt), FadeIn(y_label_tex))

        # ε(x) ∝ 1/((R1+x)(R1+x+L)) where L=COIL_WIDTH
        def eps_func(x):
            R1 = R1_INIT
            L = COIL_WIDTH
            r1 = R1 + x
            r2 = R1 + x + L
            return 1.0 / (r1 * r2) * (R1 * (R1 + L)) * 0.95  # normalize to ~1 at x=0

        eps_curve = axes.plot(
            eps_func,
            x_range=[0.0, 4.9],
            color=GREEN,
            stroke_width=3,
        )
        eps_curve_label = MathTex(
            r"\varepsilon(x) \propto \frac{1}{R_1(x)\cdot R_2(x)}",
            color=GREEN,
        ).scale(0.6)
        eps_curve_label.to_corner(UR, buff=0.55)

        # 初始值标注
        x0_dot = Dot(axes.c2p(0, eps_func(0)), color=YELLOW, radius=0.1)
        x0_label = MathTex(r"\varepsilon_0", color=YELLOW).scale(0.55)
        x0_label.next_to(x0_dot, UL, buff=0.12)

        self.play(Create(eps_curve), FadeIn(eps_curve_label))
        self.play(Create(x0_dot), FadeIn(x0_label))
        self.wait(1.2)

        # 滑动 ValueTracker 显示衰减
        xv = ValueTracker(0.0)
        moving_dot = always_redraw(
            lambda: Dot(axes.c2p(xv.get_value(), eps_func(xv.get_value())),
                        color=ORANGE, radius=0.1)
        )
        readout = always_redraw(
            lambda: MathTex(
                rf"x={xv.get_value():.1f},\;\varepsilon\approx{eps_func(xv.get_value()):.3f}",
                color=ORANGE,
            ).scale(0.5).to_corner(UL, buff=0.5).shift(DOWN * 1.8)
        )
        self.add(moving_dot, readout)
        self.play(xv.animate.set_value(4.5), run_time=3.0)
        self.wait(0.5)
        self.play(FadeOut(VGroup(axes, x_label_txt, y_label_tex, eps_curve,
                                 eps_curve_label, x0_dot, x0_label,
                                 moving_dot, readout, curve_label)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 楞次定律——判断电流方向
        # ══════════════════════════════════════════════════════════════════
        lenz_title = Text("楞次定律：判断感应电流方向", font=CJK, color=BLUE).scale(0.5)
        lenz_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(lenz_title))

        l1 = Text("线圈远离导线 → 穿过线圈的向内磁通量减少", font=CJK, color=WHITE).scale(0.44)
        l2 = Text("感应电流须增补磁通 → 感应电流方向：顺时针", font=CJK, color=GREEN).scale(0.44)
        l3 = Text("（在线圈平面内磁场向纸面内，顺时针电流产生向内补偿磁通）",
                  font=CJK, color=CYAN).scale(0.38)
        lenz_text = VGroup(l1, l2, l3).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        lenz_text.next_to(lenz_title, DOWN, buff=0.45)
        lenz_text.scale_to_fit_width(12.5)
        self.play(FadeIn(l1))
        self.wait(0.8)
        self.play(FadeIn(l2))
        self.wait(0.8)
        self.play(FadeIn(l3))
        self.wait(1.0)

        # 绘制简化线圈 + 顺时针箭头
        coil_rect = Rectangle(width=2.4, height=1.8, color=WHITE, stroke_width=3)
        coil_rect.shift(DOWN * 1.6)

        # 4条边的电流方向箭头（顺时针）
        cx, cy = coil_rect.get_center()[0], coil_rect.get_center()[1]
        hw, hh = 1.2, 0.9  # half width/height
        arrow_top = Arrow(
            start=np.array([cx - hw + 0.15, cy + hh, 0]),
            end=np.array([cx + hw - 0.15, cy + hh, 0]),
            color=ORANGE, buff=0, stroke_width=3,
        )
        arrow_right = Arrow(
            start=np.array([cx + hw, cy + hh - 0.15, 0]),
            end=np.array([cx + hw, cy - hh + 0.15, 0]),
            color=ORANGE, buff=0, stroke_width=3,
        )
        arrow_bot = Arrow(
            start=np.array([cx + hw - 0.15, cy - hh, 0]),
            end=np.array([cx - hw + 0.15, cy - hh, 0]),
            color=ORANGE, buff=0, stroke_width=3,
        )
        arrow_left = Arrow(
            start=np.array([cx - hw, cy - hh + 0.15, 0]),
            end=np.array([cx - hw, cy + hh - 0.15, 0]),
            color=ORANGE, buff=0, stroke_width=3,
        )
        cw_arrows = VGroup(arrow_top, arrow_right, arrow_bot, arrow_left)

        # x 符号（磁场向纸面内）在线圈中心
        into_page = Text("x", font=CJK, color=BLUE_C).scale(0.7)
        into_page.move_to(coil_rect.get_center())

        lenz_tag = VGroup(
            Text("磁通减少", font=CJK, color=RED).scale(0.4),
            Text("→ 感应电流增补 →", font=CJK, color=WHITE).scale(0.4),
            Text("顺时针", font=CJK, color=GREEN).scale(0.4),
        ).arrange(RIGHT, buff=0.2)
        lenz_tag.next_to(coil_rect, DOWN, buff=0.35)

        self.play(Create(coil_rect), FadeIn(into_page))
        self.play(GrowArrow(arrow_top), GrowArrow(arrow_right),
                  GrowArrow(arrow_bot), GrowArrow(arrow_left))
        self.play(FadeIn(lenz_tag))
        self.wait(1.5)

        self.play(FadeOut(VGroup(lenz_text, coil_rect, cw_arrows,
                                 into_page, lenz_tag, lenz_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.5)
        ex_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(ex_title))

        given = VGroup(
            VGroup(
                Text("已知：", font=CJK, color=WHITE).scale(0.42),
                MathTex(r"I=10\,\mathrm{A},\;l=0.2\,\mathrm{m},\;N=1,",
                        color=WHITE).scale(0.62),
            ).arrange(RIGHT, buff=0.15),
            MathTex(r"R_1=0.05\,\mathrm{m},\;R_2=0.10\,\mathrm{m},\;v=2\,\mathrm{m/s}",
                    color=WHITE).scale(0.62),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        given.next_to(ex_title, DOWN, buff=0.4)

        self.play(FadeIn(given))
        self.wait(1.0)

        # 代入公式
        calc1 = MathTex(
            r"\varepsilon = \frac{\mu_0 I l v (R_2 - R_1)}{2\pi R_1 R_2}",
            color=YELLOW,
        ).scale(0.72)
        calc1.next_to(given, DOWN, buff=0.35)

        calc2 = MathTex(
            r"= \frac{4\pi\times10^{-7}\times10\times0.2\times2\times0.05}"
            r"{2\pi\times0.05\times0.10}",
            color=WHITE,
        ).scale(0.62)
        calc2.next_to(calc1, DOWN, buff=0.28)

        calc3 = MathTex(
            r"\approx 4.0\times10^{-6}\,\mathrm{V} = 4.0\,\mu\mathrm{V}",
            color=GREEN,
        ).scale(0.72)
        calc3.next_to(calc2, DOWN, buff=0.28)
        box_calc = SurroundingRectangle(calc3, color=GREEN, buff=0.18, corner_radius=0.1)

        self.play(Write(calc1))
        self.wait(0.6)
        self.play(Write(calc2))
        self.wait(0.6)
        self.play(Write(calc3), Create(box_calc))
        self.wait(1.5)
        self.play(FadeOut(VGroup(given, calc1, calc2, calc3, box_calc, ex_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.42)

        s1_row = VGroup(
            Text("磁场公式", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"B=\dfrac{\mu_0 I}{2\pi r}", color=CYAN).scale(0.7),
        ).arrange(RIGHT, buff=0.3)

        s2_row = VGroup(
            Text("净 EMF 公式", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\varepsilon=\dfrac{\mu_0 I l v(R_2-R_1)}{2\pi R_1 R_2}",
                    color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.3)

        s3_row = VGroup(
            Text("楞次定律", font=CJK, color=WHITE).scale(0.42),
            Text("磁通减少 → 顺时针感应电流补偿", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.3)

        s4_row = VGroup(
            Text("衰减规律", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\varepsilon \propto \frac{1}{R_1 R_2} \to 0\;(R\to\infty)",
                    color=ORANGE).scale(0.65),
        ).arrange(RIGHT, buff=0.3)

        summary = VGroup(s1_row, s2_row, s3_row, s4_row).arrange(
            DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)
        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_row), Write(s2_row))
        self.play(FadeIn(s3_row), FadeIn(s4_row))
        self.play(Create(box_sum))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Ex2RectangularCoilMovingAwayWire",
        "id": "phys-ch09-9.1-ex2-rectangular-coil-moving-away-wire",
        "chapterId": "ch09",
        "sectionId": "9.1",
        "title": "矩形线圈远离长直导线的感应电动势",
        "description": "推导矩形线圈从初位置 R1 向右运动时，AB/CD 两边动生 EMF 之差构成净感应电动势的公式，并用楞次定律判断顺时针感应电流方向。",
    }
]
