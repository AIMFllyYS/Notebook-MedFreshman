"""第 7.4 节 · 电偶极子远场电势与场强

用叠加法推导电偶极子远场电势 V = p cosθ / (4πε₀r²)，
再由 E = -grad V 得到 E_r、E_θ，ValueTracker 扫 θ 演示场量变化，
最后展示完整电场线形态并与等势面正交验证。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp1ElectricDipoleFarField(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("电偶极子远场电势与场强", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.4", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("天线、水分子、化学键——自然界中许多系统可以看成", font=CJK).scale(0.48)
        ana2 = Text("一对距离很近的等量异号电荷（电偶极子）。", font=CJK).scale(0.48)
        ana3 = Text("远处的电场与单个点电荷大不相同，衰减更快，", font=CJK).scale(0.48)
        ana4 = Text("而且方向随观测角 θ 而变——这就是本节的核心。", font=CJK).scale(0.48)
        ana_grp = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(0.6)
        self.play(FadeIn(ana4))
        self.wait(1.4)
        self.play(FadeOut(ana_grp))

        # ── Step 3: 几何模型——电偶极子示意图 ──────────────────────────
        # 绘制电偶极子 +q/-q 在原点上下，矢量 p 向上
        half_l = 0.55
        q_pos = DOWN * half_l * 2 + LEFT * 2.8
        q_neg = UP * half_l * 2 + LEFT * 2.8
        center_pt = LEFT * 2.8

        dot_plus = Dot(point=q_pos, radius=0.14, color=RED)
        dot_minus = Dot(point=q_neg, radius=0.14, color=BLUE)
        lbl_plus = MathTex(r"+q", color=RED).scale(0.55).next_to(dot_plus, RIGHT, buff=0.12)
        lbl_minus = MathTex(r"-q", color=BLUE).scale(0.55).next_to(dot_minus, RIGHT, buff=0.12)

        # 偶极矩 p 箭头（从 -q 指向 +q，即向下，但物理定义是从负到正，这里 +q 在下）
        # 物理定义：p 从 -q 指向 +q；+q 在下方 → p 向下，修正为 +q 在上
        # 重新：+q 在上，-q 在下（p 从 -q 到 +q 即向上）
        dot_plus2 = Dot(point=UP * half_l + LEFT * 2.8, radius=0.14, color=RED)
        dot_minus2 = Dot(point=DOWN * half_l + LEFT * 2.8, radius=0.14, color=BLUE)
        lbl_plus2 = MathTex(r"+q", color=RED).scale(0.55).next_to(dot_plus2, RIGHT, buff=0.12)
        lbl_minus2 = MathTex(r"-q", color=BLUE).scale(0.55).next_to(dot_minus2, RIGHT, buff=0.12)

        p_arrow = Arrow(
            start=DOWN * half_l + LEFT * 2.8,
            end=UP * half_l + LEFT * 2.8,
            buff=0, color=YELLOW, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        p_label = MathTex(r"\mathbf{p}", color=YELLOW).scale(0.6)
        p_label.next_to(p_arrow, LEFT, buff=0.12)

        # 分隔线
        sep_line = DashedLine(
            start=UP * 3.0 + LEFT * 1.4,
            end=DOWN * 3.0 + LEFT * 1.4,
            color=GRAY, dash_length=0.15
        )

        # 场点 P 及角度标注
        r_len = 2.2
        theta_val = 50 * math.pi / 180
        P_pt = np.array([
            -2.8 + r_len * math.sin(theta_val),
            r_len * math.cos(theta_val),
            0.0
        ])
        dot_P = Dot(point=P_pt, radius=0.09, color=GREEN)
        lbl_P = Text("P", font=CJK, color=GREEN).scale(0.45).next_to(dot_P, RIGHT, buff=0.1)

        # r 线（从原点到 P）
        r_line = DashedLine(
            start=center_pt,
            end=P_pt,
            color=GREEN, dash_length=0.12
        )
        r_lbl = MathTex(r"r", color=GREEN).scale(0.5)
        r_lbl.move_to((center_pt + P_pt) / 2 + LEFT * 0.22)

        # θ 角弧
        theta_arc = Arc(
            radius=0.55, start_angle=PI / 2, angle=-(PI / 2 - theta_val),
            arc_center=center_pt, color=ORANGE
        )
        theta_lbl = MathTex(r"\theta", color=ORANGE).scale(0.52)
        theta_lbl.move_to(center_pt + UP * 0.72 + RIGHT * 0.38)

        # r+ 和 r- 距离线
        rplus_pt = np.array([
            -2.8 + r_len * math.sin(theta_val),
            r_len * math.cos(theta_val),
            0.0
        ])
        rplus_line = Line(
            start=UP * half_l + LEFT * 2.8,
            end=rplus_pt,
            color=RED, stroke_width=2
        )
        rminus_line = Line(
            start=DOWN * half_l + LEFT * 2.8,
            end=rplus_pt,
            color=BLUE_D, stroke_width=2
        )
        rplus_lbl = MathTex(r"r_+", color=RED).scale(0.45)
        rplus_lbl.move_to((UP * half_l + LEFT * 2.8 + rplus_pt) / 2 + RIGHT * 0.28)
        rminus_lbl = MathTex(r"r_-", color=BLUE_D).scale(0.45)
        rminus_lbl.move_to((DOWN * half_l + LEFT * 2.8 + rplus_pt) / 2 + LEFT * 0.28)

        dipole_grp = VGroup(dot_plus2, dot_minus2, lbl_plus2, lbl_minus2, p_arrow, p_label)
        geo_cap = Text("电偶极子：上 +q，下 -q，矢量 p 向上", font=CJK, color=YELLOW).scale(0.42)
        geo_cap.to_edge(DOWN, buff=0.55)

        self.play(Create(dot_plus2), Create(dot_minus2),
                  FadeIn(lbl_plus2), FadeIn(lbl_minus2))
        self.wait(0.5)
        self.play(GrowArrow(p_arrow), FadeIn(p_label))
        self.play(FadeIn(geo_cap))
        self.wait(0.8)
        self.play(Create(sep_line))
        self.play(Create(dot_P), FadeIn(lbl_P), Create(r_line),
                  FadeIn(r_lbl), Create(theta_arc), FadeIn(theta_lbl))
        self.wait(0.6)
        self.play(Create(rplus_line), FadeIn(rplus_lbl))
        self.play(Create(rminus_line), FadeIn(rminus_lbl))
        self.wait(1.0)
        self.play(FadeOut(geo_cap))

        # ── Step 4: 叠加法推导远场电势 ──────────────────────────────────
        # 右半部分显示推导步骤
        deriv_title = Text("叠加法推导电势", font=CJK, color=BLUE).scale(0.50)
        deriv_title.to_edge(RIGHT, buff=0.4).shift(UP * 2.5)

        step_v1 = MathTex(
            r"V = \frac{q}{4\pi\varepsilon_0}\!\left(\frac{1}{r_+}-\frac{1}{r_-}\right)"
        ).scale(0.60)
        step_v1.next_to(deriv_title, DOWN, buff=0.35)

        approx_note1 = Text("远场条件 r >> l ：", font=CJK, color=CYAN).scale(0.42)
        approx_note1.next_to(step_v1, DOWN, buff=0.3).align_to(step_v1, LEFT)

        step_approx = MathTex(
            r"r_+ \approx r - \tfrac{l}{2}\cos\theta,\quad r_- \approx r + \tfrac{l}{2}\cos\theta"
        ).scale(0.52)
        step_approx.next_to(approx_note1, DOWN, buff=0.22)

        step_v2 = MathTex(
            r"\frac{1}{r_+}-\frac{1}{r_-} \approx \frac{l\cos\theta}{r^2}"
        ).scale(0.60)
        step_v2.next_to(step_approx, DOWN, buff=0.3)

        step_v_final = MathTex(
            r"V = \frac{1}{4\pi\varepsilon_0}\frac{p\cos\theta}{r^2}"
        ).scale(0.70)
        step_v_final.next_to(step_v2, DOWN, buff=0.35)
        step_v_final.set_color(YELLOW)

        self.play(FadeIn(deriv_title))
        self.play(Write(step_v1))
        self.wait(1.0)
        self.play(FadeIn(approx_note1))
        self.play(Write(step_approx))
        self.wait(0.8)
        self.play(TransformMatchingTex(step_v1.copy(), step_v2))
        self.wait(0.8)
        self.play(TransformMatchingTex(step_v2.copy(), step_v_final))
        self.wait(1.4)

        # 高亮 cosθ
        cos_box = SurroundingRectangle(step_v_final, color=GREEN, buff=0.12, corner_radius=0.1)
        note_cos = Text("V 与 cosθ 成正比 — 中垂面(θ=90°)处 V=0", font=CJK, color=GREEN).scale(0.40)
        note_cos.next_to(step_v_final, DOWN, buff=0.30)
        self.play(Create(cos_box))
        self.play(FadeIn(note_cos))
        self.wait(1.6)
        self.play(FadeOut(VGroup(deriv_title, step_v1, approx_note1, step_approx,
                                 step_v2, step_v_final, cos_box, note_cos)))
        # 清场左侧几何图
        left_geo = VGroup(dot_plus2, dot_minus2, lbl_plus2, lbl_minus2,
                          p_arrow, p_label, sep_line, dot_P, lbl_P,
                          r_line, r_lbl, theta_arc, theta_lbl,
                          rplus_line, rplus_lbl, rminus_line, rminus_lbl)
        self.play(FadeOut(left_geo))

        # ── Step 5: 等势线（颜色编码 V 值）──────────────────────────────
        eq_title = Text("等势线分布（颜色 = 电势 V 大小）", font=CJK, color=BLUE).scale(0.50)
        eq_title.next_to(title, DOWN, buff=0.45)

        # 绘制等势线：V ∝ cosθ/r²，等势线方程 r = sqrt(p cosθ / (4πε₀ V₀))
        # 用参数化：对每条等势线取 V₀，在极坐标下画 r(θ) = sqrt(C cosθ / V₀)
        def make_equipotential(V0, color_val, scale_factor=1.8):
            pts = []
            steps = 300
            for i in range(steps + 1):
                th = i * math.pi / steps  # θ from 0 to π
                cos_th = math.cos(th)
                if V0 > 0 and cos_th <= 0:
                    continue
                if V0 < 0 and cos_th >= 0:
                    continue
                val = cos_th / V0
                if val <= 0:
                    continue
                r = math.sqrt(val) * scale_factor
                if r > 3.2:
                    continue
                x = r * math.sin(th)
                y = r * math.cos(th)
                pts.append([x, y, 0.0])
            if len(pts) < 4:
                return VMobject()
            curve = VMobject()
            curve.set_points_as_corners([np.array(p) for p in pts])
            curve.set_stroke(color=color_val, width=2, opacity=0.85)
            return curve

        # 正电势线（上半，红色系）
        eq_curves = VGroup()
        for v0, col in [(0.8, "#FF4444"), (0.45, "#FF8888"), (0.28, "#FFAAAA")]:
            c = make_equipotential(v0, col)
            if c.has_points():
                eq_curves.add(c)
        # 负电势线（下半，蓝色系）
        for v0, col in [(-0.8, "#4444FF"), (-0.45, "#8888FF"), (-0.28, "#AAAAFF")]:
            c = make_equipotential(v0, col)
            if c.has_points():
                eq_curves.add(c)

        # 中垂面 V=0（绿色横线）
        zero_line = DashedLine(LEFT * 3.5, RIGHT * 3.5, color=GREEN, dash_length=0.18)
        zero_lbl = VGroup(
            Text("V=0", font=CJK, color=GREEN).scale(0.40),
            Text("中垂面", font=CJK, color=GREEN).scale(0.40)
        ).arrange(DOWN, buff=0.08)
        zero_lbl.to_edge(RIGHT, buff=0.5)

        # 电偶极子标记
        d_plus = Dot(point=UP * 0.3, radius=0.14, color=RED)
        d_minus = Dot(point=DOWN * 0.3, radius=0.14, color=BLUE)
        d_lbl_p = MathTex(r"+q", color=RED).scale(0.50).next_to(d_plus, LEFT, buff=0.1)
        d_lbl_m = MathTex(r"-q", color=BLUE).scale(0.50).next_to(d_minus, LEFT, buff=0.1)

        self.play(FadeIn(eq_title))
        self.play(Create(d_plus), Create(d_minus), FadeIn(d_lbl_p), FadeIn(d_lbl_m))
        self.play(Create(eq_curves), run_time=2.0)
        self.play(Create(zero_line), FadeIn(zero_lbl))
        self.wait(1.6)

        # 颜色图例
        legend_pos = Text("红=正电势  蓝=负电势  绿线=V=0", font=CJK, color=WHITE).scale(0.38)
        legend_pos.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(legend_pos))
        self.wait(1.4)
        self.play(FadeOut(VGroup(eq_title, eq_curves, zero_line, zero_lbl,
                                 d_plus, d_minus, d_lbl_p, d_lbl_m, legend_pos)))

        # ── Step 6: 推导 E_r 和 E_θ ─────────────────────────────────────
        e_title = Text("由电势求场强：E = -grad V", font=CJK, color=BLUE).scale(0.50)
        e_title.next_to(title, DOWN, buff=0.45)

        e_step1_lbl = Text("球坐标梯度：", font=CJK, color=CYAN).scale(0.44)
        e_step1 = MathTex(
            r"E_r = -\frac{\partial V}{\partial r},\quad "
            r"E_\theta = -\frac{1}{r}\frac{\partial V}{\partial \theta}"
        ).scale(0.62)
        e_row1 = VGroup(e_step1_lbl, e_step1).arrange(RIGHT, buff=0.25)
        e_row1.next_to(e_title, DOWN, buff=0.45)

        e_step2_lbl = Text("对 V 求偏导：", font=CJK, color=CYAN).scale(0.44)
        e_step2 = MathTex(
            r"E_r = \frac{1}{4\pi\varepsilon_0}\frac{2p\cos\theta}{r^3}"
        ).scale(0.68)
        e_step2.set_color(YELLOW)

        e_step3 = MathTex(
            r"E_\theta = \frac{1}{4\pi\varepsilon_0}\frac{p\sin\theta}{r^3}"
        ).scale(0.68)
        e_step3.set_color(ORANGE)

        e_grp = VGroup(e_step2, e_step3).arrange(DOWN, buff=0.35)
        e_grp.next_to(e_row1, DOWN, buff=0.45)

        self.play(FadeIn(e_title))
        self.play(FadeIn(e_row1))
        self.wait(0.8)
        self.play(Write(e_step2))
        self.wait(0.7)
        self.play(Write(e_step3))
        self.wait(1.0)

        # 对比注记
        compare = VGroup(
            Text("对比点电荷 E ∝ 1/r²，", font=CJK, color=WHITE).scale(0.44),
            Text("电偶极子 E ∝ 1/r³，衰减更快！", font=CJK, color=GREEN).scale(0.44)
        ).arrange(RIGHT, buff=0.15)
        compare.next_to(e_grp, DOWN, buff=0.45)
        self.play(FadeIn(compare))
        self.wait(1.6)
        self.play(FadeOut(VGroup(e_title, e_row1, e_grp, compare)))

        # ── Step 7: ValueTracker 扫 θ，实时显示 E_r 和 E_θ ─────────────
        scan_title = Text("扫描观测角 θ 看场量变化", font=CJK, color=BLUE).scale(0.50)
        scan_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scan_title))

        theta_tracker = ValueTracker(0.0)

        # 坐标轴（简化）
        axes = Axes(
            x_range=[0, math.pi, math.pi / 4],
            y_range=[-1.2, 2.5, 0.5],
            x_length=6.5, y_length=4.0,
            axis_config={"color": GRAY, "stroke_width": 2},
        )
        axes.next_to(scan_title, DOWN, buff=0.4)
        x_lbl_grp = VGroup(
            MathTex(r"0").scale(0.4),
            MathTex(r"\pi/4").scale(0.4),
            MathTex(r"\pi/2").scale(0.4),
            MathTex(r"3\pi/4").scale(0.4),
            MathTex(r"\pi").scale(0.4),
        )
        for i, lbl in enumerate(x_lbl_grp):
            lbl.move_to(axes.x_axis.n2p(i * math.pi / 4) + DOWN * 0.3)

        y_lbl = MathTex(r"E\cdot r^3 / k_e p", color=GRAY).scale(0.42)
        y_lbl.next_to(axes.y_axis, LEFT, buff=0.1)
        x_lbl = MathTex(r"\theta", color=GRAY).scale(0.50)
        x_lbl.next_to(axes.x_axis, RIGHT, buff=0.1)

        # 曲线
        curve_er = axes.plot(
            lambda th: 2 * math.cos(th),
            x_range=[0, math.pi],
            color=YELLOW, stroke_width=3
        )
        curve_eth = axes.plot(
            lambda th: math.sin(th),
            x_range=[0, math.pi],
            color=ORANGE, stroke_width=3
        )

        # 竖直指示线
        v_line = always_redraw(lambda: axes.get_vertical_line(
            axes.input_to_graph_point(theta_tracker.get_value(), curve_er),
            color=CYAN, stroke_width=2
        ))

        dot_er = always_redraw(lambda: Dot(
            point=axes.input_to_graph_point(theta_tracker.get_value(), curve_er),
            color=YELLOW, radius=0.09
        ))
        dot_eth = always_redraw(lambda: Dot(
            point=axes.input_to_graph_point(theta_tracker.get_value(), curve_eth),
            color=ORANGE, radius=0.09
        ))

        val_er = always_redraw(lambda: VGroup(
            MathTex(r"E_r\cdot r^3/k_ep=", color=YELLOW).scale(0.50),
            MathTex(rf"{2*math.cos(theta_tracker.get_value()):.2f}", color=YELLOW).scale(0.50)
        ).arrange(RIGHT, buff=0.1).to_corner(DR, buff=0.5).shift(UP * 0.55))

        val_eth = always_redraw(lambda: VGroup(
            MathTex(r"E_\theta\cdot r^3/k_ep=", color=ORANGE).scale(0.50),
            MathTex(rf"{math.sin(theta_tracker.get_value()):.2f}", color=ORANGE).scale(0.50)
        ).arrange(RIGHT, buff=0.1).to_corner(DR, buff=0.5))

        leg_er = VGroup(
            Line(ORIGIN, RIGHT * 0.4, color=YELLOW, stroke_width=3),
            MathTex(r"E_r \propto 2\cos\theta", color=YELLOW).scale(0.48)
        ).arrange(RIGHT, buff=0.15).to_corner(UL, buff=1.2).shift(DOWN * 1.2)
        leg_eth = VGroup(
            Line(ORIGIN, RIGHT * 0.4, color=ORANGE, stroke_width=3),
            MathTex(r"E_\theta \propto \sin\theta", color=ORANGE).scale(0.48)
        ).arrange(RIGHT, buff=0.15).next_to(leg_er, DOWN, buff=0.25)

        self.play(Create(axes), FadeIn(x_lbl_grp), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(curve_er), Create(curve_eth))
        self.play(FadeIn(leg_er), FadeIn(leg_eth))
        self.add(v_line, dot_er, dot_eth, val_er, val_eth)
        self.wait(0.5)
        # 扫 θ 从 0 到 π
        self.play(theta_tracker.animate.set_value(math.pi), run_time=4.0, rate_func=linear)
        self.wait(0.8)
        self.play(theta_tracker.animate.set_value(0.0), run_time=2.5, rate_func=linear)
        self.wait(1.0)
        self.play(FadeOut(VGroup(scan_title, axes, x_lbl_grp, x_lbl, y_lbl,
                                 curve_er, curve_eth, leg_er, leg_eth,
                                 v_line, dot_er, dot_eth, val_er, val_eth)))

        # ── Step 8: 特殊方向 E 的方向——轴线与中垂面 ─────────────────────
        dir_title = Text("特殊方向的电场箭头", font=CJK, color=BLUE).scale(0.50)
        dir_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(dir_title))

        # 重新画电偶极子（小）
        dp2 = Dot(point=UP * 0.35, radius=0.13, color=RED)
        dm2 = Dot(point=DOWN * 0.35, radius=0.13, color=BLUE)
        dlp2 = MathTex(r"+q", color=RED).scale(0.48).next_to(dp2, LEFT, buff=0.08)
        dlm2 = MathTex(r"-q", color=BLUE).scale(0.48).next_to(dm2, LEFT, buff=0.08)
        dipole2 = VGroup(dp2, dm2, dlp2, dlm2)
        self.play(Create(dp2), Create(dm2), FadeIn(dlp2), FadeIn(dlm2))

        # 轴线 (θ=0) 上方场点
        ax_pt = UP * 1.9
        ax_arrow = Arrow(
            start=ax_pt,
            end=ax_pt + UP * 0.8,
            buff=0, color=YELLOW, stroke_width=4,
            max_tip_length_to_length_ratio=0.30
        )
        ax_lbl = VGroup(
            MathTex(r"\theta=0", color=YELLOW).scale(0.48),
            Text("轴线方向", font=CJK, color=YELLOW).scale(0.40)
        ).arrange(DOWN, buff=0.08).next_to(ax_arrow, RIGHT, buff=0.15)

        # 轴线 θ=π 下方
        ax_pt_down = DOWN * 1.9
        ax_arrow_down = Arrow(
            start=ax_pt_down,
            end=ax_pt_down + DOWN * 0.8,
            buff=0, color=YELLOW, stroke_width=4,
            max_tip_length_to_length_ratio=0.30
        )

        # 中垂面 (θ=π/2) 右侧场点
        mid_pt = RIGHT * 2.0
        mid_arrow = Arrow(
            start=mid_pt,
            end=mid_pt + DOWN * 0.55,
            buff=0, color=ORANGE, stroke_width=4,
            max_tip_length_to_length_ratio=0.30
        )
        mid_lbl = VGroup(
            MathTex(r"\theta=\pi/2", color=ORANGE).scale(0.48),
            Text("中垂面方向", font=CJK, color=ORANGE).scale(0.40)
        ).arrange(DOWN, buff=0.08).next_to(mid_arrow, RIGHT, buff=0.15)

        # 左侧中垂面
        mid_pt_l = LEFT * 2.0
        mid_arrow_l = Arrow(
            start=mid_pt_l,
            end=mid_pt_l + DOWN * 0.55,
            buff=0, color=ORANGE, stroke_width=4,
            max_tip_length_to_length_ratio=0.30
        )

        note_axis = VGroup(
            Text("轴线：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"E_r = \frac{2kp}{r^3},\;E_\theta = 0", color=YELLOW).scale(0.52)
        ).arrange(RIGHT, buff=0.15)
        note_mid = VGroup(
            Text("中垂面：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"E_r = 0,\;E_\theta = \frac{kp}{r^3}", color=ORANGE).scale(0.52)
        ).arrange(RIGHT, buff=0.15)
        notes = VGroup(note_axis, note_mid).arrange(DOWN, buff=0.3).to_edge(DOWN, buff=0.65)

        self.play(GrowArrow(ax_arrow), GrowArrow(ax_arrow_down))
        self.play(FadeIn(ax_lbl))
        self.wait(0.6)
        self.play(GrowArrow(mid_arrow), GrowArrow(mid_arrow_l))
        self.play(FadeIn(mid_lbl))
        self.wait(0.6)
        self.play(FadeIn(notes))
        self.wait(1.8)
        self.play(FadeOut(VGroup(dir_title, dipole2,
                                 ax_arrow, ax_arrow_down, ax_lbl,
                                 mid_arrow, mid_arrow_l, mid_lbl, notes)))

        # ── Step 9: 电场线形态（起于 +q，弯弧止于 -q）──────────────────
        fl_title = Text("完整电场线形态", font=CJK, color=BLUE).scale(0.50)
        fl_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(fl_title))

        dp3 = Dot(point=UP * 0.55, radius=0.14, color=RED)
        dm3 = Dot(point=DOWN * 0.55, radius=0.14, color=BLUE)
        dlp3 = MathTex(r"+q", color=RED).scale(0.50).next_to(dp3, LEFT, buff=0.10)
        dlm3 = MathTex(r"-q", color=BLUE).scale(0.50).next_to(dm3, LEFT, buff=0.10)
        self.play(Create(dp3), Create(dm3), FadeIn(dlp3), FadeIn(dlm3))

        # 绘制若干电场线（抛物弧：从 +q 出发，经过不同角度，弯向 -q）
        def dipole_field_line(start_angle, n_pts=120):
            """简单近似：在偶极子外用解析场线参数化 r = C sin²θ_line。"""
            # 场线方程（极坐标）：r = r0 * sin²θ，以 +q 为中心旋转 start_angle
            pts = []
            for i in range(n_pts + 1):
                frac = i / n_pts
                # θ_line 从 start_angle 扫到 π - start_angle（场线从 +q 到 -q）
                th_line = start_angle + frac * (math.pi - 2 * start_angle)
                # 偶极场线：r ∝ sin²(th_field) — 使用场线方程的近似
                # 这里以简化方式：椭圆弧参数化
                a = 0.85 + 1.5 * math.sin(start_angle)
                b = 1.4 * math.sin(start_angle)
                # 参数 t 从 0 到 π
                t = frac * math.pi
                x = a * math.sin(t) * math.sin(start_angle) * 2
                y = 0.55 - b * math.cos(t)
                if abs(x) > 3.8 or abs(y) > 3.2:
                    continue
                pts.append([x, y, 0.0])
            if len(pts) < 3:
                return None
            path = VMobject()
            path.set_points_smoothly([np.array(p) for p in pts])
            return path

        field_lines = VGroup()
        angles = [15, 30, 50, 75]
        colors_fl = [RED_B, RED_C, "#FF9988", "#FFBB88"]
        for ang, col in zip(angles, colors_fl):
            fl = dipole_field_line(ang * math.pi / 180)
            if fl is not None:
                fl.set_stroke(color=col, width=2.2)
                # 镜像左侧
                fl_l = fl.copy().flip(axis=UP)
                fl_l.set_stroke(color=col, width=2.2)
                field_lines.add(fl, fl_l)

        self.play(Create(field_lines), run_time=2.5)

        fl_cap = Text("场线从 +q 出发，弯曲终止于 -q，形态与点电荷截然不同",
                      font=CJK, color=GREEN).scale(0.40)
        fl_cap.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(fl_cap))
        self.wait(1.2)

        # 正交验证：取一点画等势线切线
        orth_pt = np.array([1.2, 0.6, 0.0])
        orth_dot = Dot(orth_pt, radius=0.09, color=GREEN)
        # 在该点场的切线方向（等势线方向 ⊥ E）：E 在此点的方向近似
        th_orth = math.atan2(orth_pt[0], orth_pt[1])
        r_orth = math.sqrt(orth_pt[0] ** 2 + orth_pt[1] ** 2)
        er_orth = 2 * math.cos(th_orth) / r_orth ** 3
        eth_orth = math.sin(th_orth) / r_orth ** 3
        # E 方向（径向分量 + 横向分量）
        ex = er_orth * math.sin(th_orth) + eth_orth * math.cos(th_orth)
        ey = er_orth * math.cos(th_orth) - eth_orth * math.sin(th_orth)
        e_norm = math.sqrt(ex ** 2 + ey ** 2) + 1e-9
        # 等势线切线垂直于 E
        tang = np.array([-ey / e_norm, ex / e_norm, 0.0]) * 0.55
        eq_tang = DashedLine(
            orth_pt - tang, orth_pt + tang,
            color=GREEN, dash_length=0.12, stroke_width=2
        )
        e_vec = Arrow(
            start=orth_pt,
            end=orth_pt + np.array([ex, ey, 0.0]) / e_norm * 0.65,
            buff=0, color=YELLOW, stroke_width=3,
            max_tip_length_to_length_ratio=0.30
        )
        orth_lbl = Text("E ⊥ 等势面", font=CJK, color=GREEN).scale(0.40)
        orth_lbl.next_to(orth_dot, RIGHT, buff=0.18)

        self.play(Create(orth_dot), Create(eq_tang), GrowArrow(e_vec))
        self.play(FadeIn(orth_lbl))
        self.wait(1.4)
        self.play(FadeOut(VGroup(fl_title, dp3, dm3, dlp3, dlm3,
                                 field_lines, fl_cap,
                                 orth_dot, eq_tang, e_vec, orth_lbl)))

        # ── Step 10: E ∝ 1/r³ 对比 1/r² ─────────────────────────────────
        cmp_title = Text("场强衰减速度对比", font=CJK, color=BLUE).scale(0.50)
        cmp_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(cmp_title))

        cmp_axes = Axes(
            x_range=[1, 5, 1],
            y_range=[0, 1.2, 0.3],
            x_length=6.0, y_length=3.5,
            axis_config={"color": GRAY, "stroke_width": 2},
        )
        cmp_axes.next_to(cmp_title, DOWN, buff=0.4)
        x_ax_lbl = MathTex(r"r", color=GRAY).scale(0.50).next_to(cmp_axes.x_axis, RIGHT, buff=0.1)
        y_ax_lbl = MathTex(r"E", color=GRAY).scale(0.50).next_to(cmp_axes.y_axis, UP, buff=0.1)

        curve_inv2 = cmp_axes.plot(lambda r: 1.0 / r ** 2,
                                   x_range=[1, 5], color=YELLOW, stroke_width=3)
        curve_inv3 = cmp_axes.plot(lambda r: 1.0 / r ** 3,
                                   x_range=[1, 5], color=CYAN, stroke_width=3)

        lbl_inv2 = VGroup(
            Line(ORIGIN, RIGHT * 0.4, color=YELLOW, stroke_width=3),
            Text("点电荷", font=CJK, color=YELLOW).scale(0.40),
            MathTex(r"E \propto 1/r^2", color=YELLOW).scale(0.48)
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=1.0).shift(DOWN * 1.8)
        lbl_inv3 = VGroup(
            Line(ORIGIN, RIGHT * 0.4, color=CYAN, stroke_width=3),
            Text("电偶极子", font=CJK, color=CYAN).scale(0.40),
            MathTex(r"E \propto 1/r^3", color=CYAN).scale(0.48)
        ).arrange(RIGHT, buff=0.12).next_to(lbl_inv2, DOWN, buff=0.28)

        cmp_note = Text("电偶极子远场衰减更快，距离增大时影响迅速减弱",
                        font=CJK, color=GREEN).scale(0.40)
        cmp_note.to_edge(DOWN, buff=0.55)

        self.play(Create(cmp_axes), FadeIn(x_ax_lbl), FadeIn(y_ax_lbl))
        self.play(Create(curve_inv2), FadeIn(lbl_inv2))
        self.wait(0.5)
        self.play(Create(curve_inv3), FadeIn(lbl_inv3))
        self.play(FadeIn(cmp_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(cmp_title, cmp_axes, x_ax_lbl, y_ax_lbl,
                                 curve_inv2, curve_inv3, lbl_inv2, lbl_inv3, cmp_note)))

        # ── Step 11: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s_def = VGroup(
            Text("偶极矩：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\mathbf{p} = q\mathbf{l}", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.18)

        s_v = VGroup(
            Text("远场电势：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"V = \frac{1}{4\pi\varepsilon_0}\frac{p\cos\theta}{r^2}",
                    color=YELLOW).scale(0.68)
        ).arrange(RIGHT, buff=0.18)

        s_er = VGroup(
            MathTex(r"E_r = \frac{1}{4\pi\varepsilon_0}\frac{2p\cos\theta}{r^3}",
                    color=YELLOW).scale(0.64),
            MathTex(r"E_\theta = \frac{1}{4\pi\varepsilon_0}\frac{p\sin\theta}{r^3}",
                    color=ORANGE).scale(0.64)
        ).arrange(DOWN, buff=0.28)

        s_note = Text("E ∝ 1/r³（比点电荷衰减更快），场线从 +q 弯向 -q",
                      font=CJK, color=GREEN).scale(0.40)

        summary = VGroup(s_def, s_v, s_er, s_note).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(11.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_def))
        self.wait(0.5)
        self.play(Write(s_v))
        self.wait(0.5)
        self.play(Write(s_er))
        self.wait(0.5)
        self.play(FadeIn(s_note))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch07Kp1ElectricDipoleFarField",
        "id": "phys-ch07-7.4-kp1-electric-dipole-far-field",
        "chapterId": "ch07",
        "sectionId": "7.4",
        "title": "电偶极子远场电势与场强",
        "description": "用叠加法推导远场电势 V=pcosθ/(4πε₀r²)，扫描角 θ 演示 E_r、E_θ 变化，展示场线形态与 E∝1/r³ 衰减特性。",
    },
]
