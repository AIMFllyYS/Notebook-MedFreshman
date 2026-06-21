"""第 7.3 节 · 例题：均匀带电球体内外电势分布

矢量场范式：用 ValueTracker 展示高斯球面扫动，实时绘制 E(r) 与 V(r) 曲线；
分段积分动画演示电势从无穷远积分至场点的物理图像。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数（无量纲，取 R=1, kq=1 便于可视化）──────────────────────────────
R_VAL = 1.0      # 球体半径（屏幕单位）
KQ = 1.0         # kq = q/(4πε₀)


def E_in(r):
    """球内电场 E = kq·r/R³"""
    return KQ * r / (R_VAL ** 3)


def E_out(r):
    """球外电场 E = kq/r²"""
    if r < 1e-6:
        return 0.0
    return KQ / (r ** 2)


def V_in(r):
    """球内电势 V = kq(3R²-r²)/(2R³)"""
    return KQ * (3 * R_VAL ** 2 - r ** 2) / (2 * R_VAL ** 3)


def V_out(r):
    """球外电势 V = kq/r"""
    if r < 1e-6:
        return 0.0
    return KQ / r


class Ch07Ex1SolidSpherePotentialDistribution(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════
        title = Text("例题：均匀带电球体内外电势分布", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════
        ana1 = Text("地球引力场从地心到地表是增大的，到地表后再往外才减弱。", font=CJK).scale(0.46)
        ana2 = Text("均匀带电球体的电场与此相似：球内线性增大，球外按 1/r² 衰减。", font=CJK).scale(0.46)
        ana3 = Text("而电势是场强沿路径的积分——我们来一起推导它的分布。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════
        # Step 3: 已知条件与关键公式（逐步出现）
        # ══════════════════════════════════════════════════════
        cond_label = Text("已知条件", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        cond1 = VGroup(
            Text("半径 R，总电荷量 q，均匀分布（体电荷密度", font=CJK).scale(0.42),
            MathTex(r"\rho = \frac{q}{\tfrac{4}{3}\pi R^3}", color=YELLOW).scale(0.75),
            Text("）", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        e_in_formula = MathTex(
            r"E_{\mathrm{in}}=\frac{qr}{4\pi\varepsilon_0 R^3}", color=GREEN
        ).scale(0.78)
        e_out_formula = MathTex(
            r"E_{\mathrm{out}}=\frac{q}{4\pi\varepsilon_0 r^2}", color=ORANGE
        ).scale(0.78)

        formulas = VGroup(cond1, e_in_formula, e_out_formula).arrange(DOWN, buff=0.35)
        formulas.next_to(cond_label, DOWN, buff=0.35)
        formulas.scale_to_fit_width(11.5)

        self.play(FadeIn(cond_label))
        self.play(FadeIn(cond1))
        self.wait(0.9)
        self.play(Write(e_in_formula))
        self.wait(0.7)
        self.play(Write(e_out_formula))
        self.wait(1.4)
        self.play(FadeOut(VGroup(cond_label, formulas)))

        # ══════════════════════════════════════════════════════
        # Step 4: 截面图 + 高斯球面动画（第一幕：E(r) 曲线）
        # ══════════════════════════════════════════════════════
        scene_label = Text("第一幕：电场分布 E(r)", font=CJK, color=BLUE).scale(0.48)
        scene_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(scene_label))

        # 坐标系（左半屏）
        ax = Axes(
            x_range=[0, 3.2, 1],
            y_range=[0, 1.5, 0.5],
            x_length=4.5,
            y_length=2.8,
            axis_config={"color": WHITE, "include_tip": True},
        ).shift(LEFT * 2.8 + DOWN * 1.2)

        x_label = VGroup(
            MathTex(r"r", color=WHITE).scale(0.6),
        ).next_to(ax.x_axis.get_right(), RIGHT, buff=0.08)
        y_label = VGroup(
            MathTex(r"E", color=WHITE).scale(0.6),
        ).next_to(ax.y_axis.get_top(), UP, buff=0.06)

        # R 竖线
        r_line = DashedLine(
            ax.c2p(R_VAL, 0), ax.c2p(R_VAL, 1.45), color=CYAN, dash_length=0.12
        )
        r_tex = MathTex(r"R", color=CYAN).scale(0.55).next_to(ax.c2p(R_VAL, 0), DOWN, buff=0.12)

        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(r_line), FadeIn(r_tex))

        # ValueTracker 控制扫动半径
        r_tracker = ValueTracker(0.05)

        # 实时箭头（从圆心指向场点，长度 ∝ E）
        SPHERE_CENTER = ax.c2p(0, 0)  # 坐标原点即球心

        def make_e_arrow():
            rv = r_tracker.get_value()
            if rv <= R_VAL:
                e_mag = E_in(rv)
                color = GREEN
            else:
                e_mag = E_out(rv)
                color = ORANGE
            # 箭头在截面图上方绘制，从原点沿 x 轴正方向延伸
            tip = ax.c2p(rv, 0)
            e_visual = min(e_mag * 1.6, 1.4)  # 箭头视觉长度缩放
            end_pt = np.array([tip[0], tip[1] + e_visual, 0])
            if np.linalg.norm(end_pt - tip) < 0.05:
                end_pt = tip + np.array([0, 0.05, 0])
            return Arrow(tip, end_pt, buff=0, color=color,
                         stroke_width=3.5, max_tip_length_to_length_ratio=0.25)

        e_arrow = always_redraw(make_e_arrow)

        # 实时扫过的 E(r) 曲线（已走过部分）
        e_curve_in_pts = []
        e_curve_out_pts = []

        def make_e_curve_in():
            rv = r_tracker.get_value()
            pts = [ax.c2p(r, E_in(r)) for r in np.linspace(0.01, min(rv, R_VAL), 40)]
            if len(pts) < 2:
                return VGroup()
            return VMobject(color=GREEN, stroke_width=2.5).set_points_as_corners(pts)

        def make_e_curve_out():
            rv = r_tracker.get_value()
            if rv <= R_VAL:
                return VGroup()
            pts = [ax.c2p(r, E_out(r)) for r in np.linspace(R_VAL, rv, 40)]
            if len(pts) < 2:
                return VGroup()
            return VMobject(color=ORANGE, stroke_width=2.5).set_points_as_corners(pts)

        e_curve_in = always_redraw(make_e_curve_in)
        e_curve_out = always_redraw(make_e_curve_out)

        # 场点位置点
        r_dot = always_redraw(lambda: Dot(ax.c2p(r_tracker.get_value(), 0),
                                          radius=0.07, color=YELLOW))

        # r 数值标注
        r_readout = always_redraw(lambda: VGroup(
            Text("r = ", font=CJK).scale(0.36),
            MathTex(rf"{r_tracker.get_value():.2f}\,R", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.5))

        # 右侧说明文字
        note_in = Text("球内：E 随 r 线性增大", font=CJK, color=GREEN).scale(0.4).to_edge(RIGHT, buff=0.5).shift(UP * 0.8)
        note_out = Text("球外：E 随 r² 衰减", font=CJK, color=ORANGE).scale(0.4).to_edge(RIGHT, buff=0.5).shift(UP * 0.1)

        self.play(Create(r_dot), Create(e_arrow), FadeIn(r_readout))
        self.add(e_curve_in, e_curve_out)
        self.wait(0.5)

        # 扫动：r < R（球内）
        self.play(FadeIn(note_in))
        self.play(r_tracker.animate.set_value(R_VAL * 0.99), run_time=3.0)
        self.wait(0.8)

        # 扫动：r > R（球外）
        self.play(FadeIn(note_out))
        self.play(r_tracker.animate.set_value(3.0), run_time=3.0)
        self.wait(0.8)

        # 标注 r=R 处连续
        cont_note = VGroup(
            Text("r=R 处 E 连续，无跳变", font=CJK, color=CYAN).scale(0.4),
        ).next_to(r_tex, RIGHT, buff=0.35).shift(UP * 0.5)
        cont_arrow = Arrow(cont_note.get_left(), ax.c2p(R_VAL, E_in(R_VAL)), buff=0.08,
                           color=CYAN, stroke_width=2)
        self.play(FadeIn(cont_note), Create(cont_arrow))
        self.wait(1.5)

        # 清场第一幕
        self.play(FadeOut(VGroup(ax, x_label, y_label, r_line, r_tex,
                                  r_dot, e_arrow, e_curve_in, e_curve_out,
                                  r_readout, note_in, note_out, cont_note, cont_arrow,
                                  scene_label)))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════
        # Step 5: 第二幕——积分求电势，分段演示
        # ══════════════════════════════════════════════════════
        scene2_label = Text("第二幕：积分求电势 V(r)", font=CJK, color=BLUE).scale(0.48)
        scene2_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(scene2_label))

        int_intro = VGroup(
            Text("电势定义：从场点沿径向积分到无穷远", font=CJK).scale(0.44),
        ).next_to(scene2_label, DOWN, buff=0.35)
        int_def = MathTex(
            r"V(r)=\int_{r}^{\infty} E\,\mathrm{d}r'", color=YELLOW
        ).scale(0.85).next_to(int_intro, DOWN, buff=0.3)

        self.play(FadeIn(int_intro))
        self.play(Write(int_def))
        self.wait(1.4)

        # 分两种情况
        case_out_title = Text("情况一：场点在球外（r > R）", font=CJK, color=ORANGE).scale(0.44)
        case_out_title.next_to(int_def, DOWN, buff=0.45)
        int_out1 = MathTex(
            r"V_{\mathrm{out}}=\int_{r}^{\infty}\frac{q}{4\pi\varepsilon_0 r'^2}\,\mathrm{d}r'",
            color=ORANGE
        ).scale(0.75)
        int_out2 = MathTex(
            r"=\frac{q}{4\pi\varepsilon_0 r}", color=GREEN
        ).scale(0.85)
        out_group = VGroup(int_out1, int_out2).arrange(RIGHT, buff=0.3)
        out_group.next_to(case_out_title, DOWN, buff=0.3)
        out_group.scale_to_fit_width(11.0)

        self.play(FadeIn(case_out_title))
        self.play(Write(int_out1))
        self.wait(0.9)
        self.play(Write(int_out2))
        self.wait(1.3)

        case_in_title = Text("情况二：场点在球内（r < R），分两段积分", font=CJK, color=GREEN).scale(0.42)
        case_in_title.next_to(out_group, DOWN, buff=0.4)
        int_in1 = MathTex(
            r"V_{\mathrm{in}}=\underbrace{\int_{r}^{R}E_{\mathrm{in}}\,\mathrm{d}r'}_{\text{ball interior}}"
            r"+\underbrace{\int_{R}^{\infty}E_{\mathrm{out}}\,\mathrm{d}r'}_{\text{ball exterior}}",
            color=WHITE
        ).scale(0.68)
        int_in2 = MathTex(
            r"=\frac{q}{4\pi\varepsilon_0}\left[\frac{r'^2}{2R^3}\right]_{r}^{R}"
            r"+\frac{q}{4\pi\varepsilon_0 R}",
            color=WHITE
        ).scale(0.68)
        int_in3 = MathTex(
            r"V_{\mathrm{in}}=\frac{q(3R^2-r^2)}{8\pi\varepsilon_0 R^3}", color=GREEN
        ).scale(0.85)
        in_steps = VGroup(int_in1, int_in2, int_in3).arrange(DOWN, buff=0.28)
        in_steps.next_to(case_in_title, DOWN, buff=0.28)
        in_steps.scale_to_fit_width(11.5)

        self.play(FadeIn(case_in_title))
        self.play(Write(int_in1))
        self.wait(1.0)
        self.play(Write(int_in2))
        self.wait(0.9)
        self.play(TransformMatchingTex(int_in2.copy(), int_in3))
        int_in3.set_color(GREEN)
        self.wait(1.5)

        self.play(FadeOut(VGroup(scene2_label, int_intro, int_def,
                                  case_out_title, out_group,
                                  case_in_title, int_in1, int_in2, int_in3)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════
        # Step 6: V(r) 曲线——动态绘制（ValueTracker 扫动）
        # ══════════════════════════════════════════════════════
        scene3_label = Text("V(r) 曲线：电势随距离的变化", font=CJK, color=BLUE).scale(0.48)
        scene3_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(scene3_label))

        # 坐标系（居中偏左）
        ax2 = Axes(
            x_range=[0, 3.2, 1],
            y_range=[0, 2.0, 0.5],
            x_length=5.0,
            y_length=3.0,
            axis_config={"color": WHITE, "include_tip": True},
        ).shift(LEFT * 1.5 + DOWN * 1.0)

        x2_label = MathTex(r"r", color=WHITE).scale(0.6).next_to(ax2.x_axis.get_right(), RIGHT, buff=0.08)
        y2_label = MathTex(r"V", color=WHITE).scale(0.6).next_to(ax2.y_axis.get_top(), UP, buff=0.06)

        # R 标线
        r2_line = DashedLine(ax2.c2p(R_VAL, 0), ax2.c2p(R_VAL, 1.95), color=CYAN, dash_length=0.12)
        r2_tex = MathTex(r"R", color=CYAN).scale(0.55).next_to(ax2.c2p(R_VAL, 0), DOWN, buff=0.12)

        self.play(Create(ax2), FadeIn(x2_label), FadeIn(y2_label))
        self.play(Create(r2_line), FadeIn(r2_tex))
        self.wait(0.5)

        # ValueTracker 扫动绘制曲线
        v_tracker = ValueTracker(0.05)

        def make_v_curve_in():
            rv = v_tracker.get_value()
            end_r = min(rv, R_VAL - 0.01)
            if end_r < 0.05:
                return VGroup()
            pts = [ax2.c2p(r, V_in(r)) for r in np.linspace(0.01, end_r, 50)]
            if len(pts) < 2:
                return VGroup()
            return VMobject(color=GREEN, stroke_width=3).set_points_as_corners(pts)

        def make_v_curve_out():
            rv = v_tracker.get_value()
            if rv <= R_VAL:
                return VGroup()
            pts = [ax2.c2p(r, V_out(r)) for r in np.linspace(R_VAL, rv, 50)]
            if len(pts) < 2:
                return VGroup()
            return VMobject(color=ORANGE, stroke_width=3).set_points_as_corners(pts)

        v_curve_in = always_redraw(make_v_curve_in)
        v_curve_out = always_redraw(make_v_curve_out)
        self.add(v_curve_in, v_curve_out)

        v_note_in = Text("球内：V 为抛物线（缓慢变化）", font=CJK, color=GREEN).scale(0.38)
        v_note_in.to_edge(RIGHT, buff=0.4).shift(UP * 1.1)
        v_note_out = Text("球外：V = kq/r（反比衰减）", font=CJK, color=ORANGE).scale(0.38)
        v_note_out.to_edge(RIGHT, buff=0.4).shift(UP * 0.3)

        self.play(FadeIn(v_note_in))
        self.play(v_tracker.animate.set_value(R_VAL * 0.99), run_time=2.5)
        self.wait(0.6)
        self.play(FadeIn(v_note_out))
        self.play(v_tracker.animate.set_value(3.1), run_time=2.5)
        self.wait(0.8)

        # 连续标注（r=R 处曲线连续，斜率不连续）
        junction_dot = Dot(ax2.c2p(R_VAL, V_out(R_VAL)), radius=0.09, color=YELLOW)
        cont2_note = Text("r=R 处 V 连续", font=CJK, color=YELLOW).scale(0.38)
        cont2_note.next_to(junction_dot, RIGHT, buff=0.2).shift(UP * 0.35)
        self.play(FadeIn(junction_dot), FadeIn(cont2_note))
        self.wait(1.2)

        # 球心电势标注
        center_dot = Dot(ax2.c2p(0, V_in(0)), radius=0.09, color=RED)
        center_tex = VGroup(
            MathTex(r"V_{\mathrm{center}}=\frac{3kq}{2R}", color=RED).scale(0.62),
        ).next_to(center_dot, UP, buff=0.18)
        self.play(FadeIn(center_dot), Write(center_tex))

        # 弹出气泡说明
        bubble = SurroundingRectangle(center_tex, color=RED, buff=0.12, corner_radius=0.1)
        bubble_note = Text("球心处 V 最大且非零！", font=CJK, color=RED).scale(0.38)
        bubble_note.next_to(center_tex, DOWN, buff=0.22)
        self.play(Create(bubble), FadeIn(bubble_note))
        self.wait(1.8)

        self.play(FadeOut(VGroup(ax2, x2_label, y2_label, r2_line, r2_tex,
                                  v_curve_in, v_curve_out,
                                  v_note_in, v_note_out,
                                  junction_dot, cont2_note,
                                  center_dot, center_tex, bubble, bubble_note,
                                  scene3_label)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════
        # Step 7: 对比示意图（E 与 V 并排）
        # ══════════════════════════════════════════════════════
        compare_label = Text("E(r) 与 V(r) 对比一览", font=CJK, color=BLUE).scale(0.48)
        compare_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(compare_label))

        # 左图：E(r)
        ax_e = Axes(
            x_range=[0, 3.2, 1], y_range=[0, 1.5, 0.5],
            x_length=3.8, y_length=2.4,
            axis_config={"color": GREY},
        ).shift(LEFT * 3.0 + DOWN * 1.1)
        e_in_curve = ax_e.plot(lambda r: E_in(r), x_range=[0.01, R_VAL], color=GREEN, stroke_width=2.5)
        e_out_curve = ax_e.plot(lambda r: E_out(r), x_range=[R_VAL, 3.1], color=ORANGE, stroke_width=2.5)
        e_R_dash = DashedLine(ax_e.c2p(R_VAL, 0), ax_e.c2p(R_VAL, 1.3), color=CYAN, dash_length=0.1)
        e_axis_r = MathTex(r"r", color=WHITE).scale(0.5).next_to(ax_e.x_axis.get_right(), RIGHT, buff=0.06)
        e_axis_E = MathTex(r"E", color=WHITE).scale(0.5).next_to(ax_e.y_axis.get_top(), UP, buff=0.05)
        e_R_lab = MathTex(r"R", color=CYAN).scale(0.45).next_to(ax_e.c2p(R_VAL, 0), DOWN, buff=0.1)
        e_title_small = Text("电场强度 E(r)", font=CJK, color=GREEN).scale(0.38)
        e_title_small.next_to(ax_e, UP, buff=0.1)

        # 右图：V(r)
        ax_v = Axes(
            x_range=[0, 3.2, 1], y_range=[0, 2.0, 0.5],
            x_length=3.8, y_length=2.4,
            axis_config={"color": GREY},
        ).shift(RIGHT * 2.2 + DOWN * 1.1)
        v_in_curve = ax_v.plot(lambda r: V_in(r), x_range=[0.01, R_VAL], color=GREEN, stroke_width=2.5)
        v_out_curve = ax_v.plot(lambda r: V_out(r), x_range=[R_VAL, 3.1], color=ORANGE, stroke_width=2.5)
        v_R_dash = DashedLine(ax_v.c2p(R_VAL, 0), ax_v.c2p(R_VAL, 1.85), color=CYAN, dash_length=0.1)
        v_axis_r = MathTex(r"r", color=WHITE).scale(0.5).next_to(ax_v.x_axis.get_right(), RIGHT, buff=0.06)
        v_axis_V = MathTex(r"V", color=WHITE).scale(0.5).next_to(ax_v.y_axis.get_top(), UP, buff=0.05)
        v_R_lab = MathTex(r"R", color=CYAN).scale(0.45).next_to(ax_v.c2p(R_VAL, 0), DOWN, buff=0.1)
        v_title_small = Text("电势 V(r)", font=CJK, color=ORANGE).scale(0.38)
        v_title_small.next_to(ax_v, UP, buff=0.1)

        # 动画绘制
        self.play(Create(ax_e), Create(ax_v),
                  FadeIn(e_axis_r), FadeIn(e_axis_E),
                  FadeIn(v_axis_r), FadeIn(v_axis_V),
                  FadeIn(e_title_small), FadeIn(v_title_small))
        self.play(Create(e_R_dash), FadeIn(e_R_lab),
                  Create(v_R_dash), FadeIn(v_R_lab))
        self.play(Create(e_in_curve), Create(v_in_curve), run_time=1.5)
        self.play(Create(e_out_curve), Create(v_out_curve), run_time=1.5)
        self.wait(1.2)

        # 关键特征箭头标注
        peak_e = Dot(ax_e.c2p(R_VAL, E_in(R_VAL)), radius=0.07, color=YELLOW)
        peak_v = Dot(ax_v.c2p(0, V_in(0)), radius=0.07, color=RED)
        note_peak_e = Text("E 在 r=R 达到峰值", font=CJK, color=YELLOW).scale(0.34)
        note_peak_e.next_to(peak_e, UP, buff=0.15)
        note_peak_v = Text("V 在球心最大", font=CJK, color=RED).scale(0.34)
        note_peak_v.next_to(peak_v, RIGHT, buff=0.12)
        self.play(FadeIn(peak_e), FadeIn(peak_v))
        self.play(FadeIn(note_peak_e), FadeIn(note_peak_v))
        self.wait(1.8)

        self.play(FadeOut(VGroup(ax_e, ax_v,
                                  e_in_curve, e_out_curve, e_R_dash,
                                  e_axis_r, e_axis_E, e_R_lab, e_title_small,
                                  v_in_curve, v_out_curve, v_R_dash,
                                  v_axis_r, v_axis_V, v_R_lab, v_title_small,
                                  peak_e, peak_v, note_peak_e, note_peak_v,
                                  compare_label)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════
        # Step 8: 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("电场：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"E_{\mathrm{in}}=\frac{qr}{4\pi\varepsilon_0 R^3}", color=GREEN).scale(0.72),
            MathTex(r"\quad(r<R)", color=GREY).scale(0.6),
        ).arrange(RIGHT, buff=0.15)
        s2 = VGroup(
            Text("　　　", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"E_{\mathrm{out}}=\frac{q}{4\pi\varepsilon_0 r^2}", color=ORANGE).scale(0.72),
            MathTex(r"\quad(r>R)", color=GREY).scale(0.6),
        ).arrange(RIGHT, buff=0.15)
        s3 = VGroup(
            Text("电势：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"V_{\mathrm{in}}=\frac{q(3R^2-r^2)}{8\pi\varepsilon_0 R^3}", color=GREEN).scale(0.72),
            MathTex(r"\quad(r<R)", color=GREY).scale(0.6),
        ).arrange(RIGHT, buff=0.15)
        s4 = VGroup(
            Text("　　　", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"V_{\mathrm{out}}=\frac{q}{4\pi\varepsilon_0 r}", color=ORANGE).scale(0.72),
            MathTex(r"\quad(r>R)", color=GREY).scale(0.6),
        ).arrange(RIGHT, buff=0.15)
        s5 = VGroup(
            Text("球心电势：", font=CJK, color=RED).scale(0.44),
            MathTex(r"V_0=\frac{3q}{8\pi\varepsilon_0 R}=\frac{3}{2}\cdot\frac{q}{4\pi\varepsilon_0 R}",
                    color=RED).scale(0.68),
        ).arrange(RIGHT, buff=0.15)
        s6 = Text("两者在 r=R 处均连续（E 的斜率有突变，V 的斜率也有突变）",
                  font=CJK, color=YELLOW).scale(0.38)

        summary = VGroup(s1, s2, s3, s4, s5, s6).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.3)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(s1), Write(s2))
        self.wait(0.6)
        self.play(Write(s3), Write(s4))
        self.wait(0.6)
        self.play(Write(s5))
        self.wait(0.6)
        self.play(FadeIn(s6))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch07Ex1SolidSpherePotentialDistribution",
        "id": "phys-ch07-7.3-ex1-solid-sphere-potential-distribution",
        "chapterId": "ch07",
        "sectionId": "7.3",
        "title": "例题：均匀带电球体内外电势分布",
        "description": "用 ValueTracker 扫动高斯球面，实时绘制 E(r) 曲线；分两段积分动画推导 V(r)，展示球内抛物线分布与球心最大电势。",
    },
]
