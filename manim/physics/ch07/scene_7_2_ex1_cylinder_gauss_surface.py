"""第 7.2 节 · 例题：无限长带电圆柱面内外场强（高斯定理应用）。

教学目标：让零基础读者通过可视化高斯面选取、通量分析、E(r) 曲线，
真正理解圆柱对称高斯定理从选面→算通量→得场强的完整逻辑。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Ex1CylinderGaussSurface(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("例题：无限长带电圆柱面内外场强", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.2  高斯定理应用", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("把一张薄导电膜卷成长筒，均匀充上电荷——", font=CJK).scale(0.46)
        ana2 = Text("筒外的电场像从中心向外射出的箭头，", font=CJK).scale(0.46)
        ana3 = Text("筒内却完全没有电场。为什么？高斯定理告诉我们答案。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 题目描述
        # ══════════════════════════════════════════════════════════════════════
        prob_title = Text("题目", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        p1 = Text("无限长圆柱面，直径 D，面电荷密度 sigma（C/m^2）", font=CJK).scale(0.42)
        p2_tex = MathTex(r"\sigma\ (\mathrm{C/m^2}),\quad D\ (\text{diameter})").scale(0.65)
        p3 = Text("求：圆柱面内（r < D/2）与圆柱面外（r > D/2）的场强 E", font=CJK).scale(0.42)
        prob_grp = VGroup(p1, p2_tex, p3).arrange(DOWN, buff=0.25).next_to(prob_title, DOWN, buff=0.3)
        self.play(FadeIn(prob_title))
        self.play(FadeIn(p1))
        self.wait(0.5)
        self.play(Write(p2_tex))
        self.play(FadeIn(p3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(prob_title, prob_grp)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 圆柱面几何图示 + 高斯面选取
        # ══════════════════════════════════════════════════════════════════════
        geo_title = Text("选取同轴圆柱体为高斯面", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(geo_title))
        self.wait(0.4)

        # 画带电圆柱面（用两个椭圆代表顶视截面 + 侧壁矩形）
        cyl_color = "#4488FF"
        # 带电圆柱面：大椭圆（上下椭圆圈） + 两条竖线表示侧壁
        cyl_top = Ellipse(width=2.0, height=0.55, color=cyl_color, fill_opacity=0.18, fill_color=cyl_color)
        cyl_top.move_to(LEFT * 2.5 + UP * 0.9)
        cyl_bot = Ellipse(width=2.0, height=0.55, color=cyl_color, fill_opacity=0.18, fill_color=cyl_color)
        cyl_bot.move_to(LEFT * 2.5 + DOWN * 0.9)
        cyl_left  = Line(cyl_top.get_left(),  cyl_bot.get_left(),  color=cyl_color)
        cyl_right = Line(cyl_top.get_right(), cyl_bot.get_right(), color=cyl_color)
        cyl_label = Text("带电圆柱面", font=CJK, color=cyl_color).scale(0.36)
        cyl_label.next_to(cyl_top, UP, buff=0.1)
        charge_label = VGroup(
            Text("面密度", font=CJK, color=YELLOW).scale(0.34),
            MathTex(r"\sigma", color=YELLOW).scale(0.75)
        ).arrange(RIGHT, buff=0.1).next_to(cyl_right, RIGHT, buff=0.1)

        # 高斯圆柱面：稍小（r < D/2 场景先画内部）
        gauss_color = GREEN
        g_top = Ellipse(width=1.2, height=0.33, color=gauss_color)
        g_top.move_to(LEFT * 2.5 + UP * 0.9)
        g_bot = Ellipse(width=1.2, height=0.33, color=gauss_color)
        g_bot.move_to(LEFT * 2.5 + DOWN * 0.9)
        g_left  = Line(g_top.get_left(),  g_bot.get_left(),  color=gauss_color)
        g_right = Line(g_top.get_right(), g_bot.get_right(), color=gauss_color)
        gauss_label = Text("高斯面 S（同轴圆柱）", font=CJK, color=GREEN).scale(0.34)
        gauss_label.next_to(g_bot, DOWN, buff=0.1)

        # 面积标注
        s1_label = Text("S1（上底）", font=CJK, color=RED).scale(0.33)
        s1_label.next_to(g_top, UP, buff=0.08)
        s2_label = Text("S2（下底）", font=CJK, color=RED).scale(0.33)
        s2_label.next_to(g_bot, DOWN, buff=0.22)
        s3_label = Text("S3（侧面）", font=CJK, color=GREEN).scale(0.33)
        s3_label.next_to(g_right, RIGHT, buff=0.08)

        self.play(Create(cyl_top), Create(cyl_bot), Create(cyl_left), Create(cyl_right))
        self.play(FadeIn(cyl_label), FadeIn(charge_label))
        self.wait(0.5)
        self.play(Create(g_top), Create(g_bot), Create(g_left), Create(g_right))
        self.play(FadeIn(gauss_label))
        self.wait(0.6)
        self.play(FadeIn(s1_label), FadeIn(s2_label), FadeIn(s3_label))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 通量分析 — 上下底面通量为零（E ⊥ n）
        # ══════════════════════════════════════════════════════════════════════
        flux_title = Text("分析各面的电通量", font=CJK, color=BLUE).scale(0.46)
        flux_title.to_edge(RIGHT, buff=0.5).shift(UP * 2.5)

        # 右侧分析区域
        bot_analysis = VGroup(
            Text("上/下底面（S1, S2）：", font=CJK, color=RED).scale(0.37),
            VGroup(
                MathTex(r"\vec{E}", color=YELLOW).scale(0.65),
                Text("垂直于轴向 →", font=CJK, color=WHITE).scale(0.37),
                MathTex(r"\vec{E}\perp\hat{n}", color=RED).scale(0.65),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                MathTex(r"\Phi_{S_1}=\Phi_{S_2}=0", color=RED).scale(0.65),
            ),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        bot_analysis.next_to(flux_title, DOWN, buff=0.3)
        bot_analysis.to_edge(RIGHT, buff=0.4)

        self.play(FadeIn(flux_title))
        self.play(FadeIn(bot_analysis))
        self.wait(1.0)

        # 在图上画"×"表示通量为零
        cross1 = Text("x", font=CJK, color=RED).scale(0.8).move_to(g_top.get_center() + UP * 0.1)
        cross2 = Text("x", font=CJK, color=RED).scale(0.8).move_to(g_bot.get_center() + DOWN * 0.1)
        self.play(FadeIn(cross1), FadeIn(cross2))
        self.wait(0.8)

        # 侧面通量分析
        side_analysis = VGroup(
            Text("侧面（S3）：", font=CJK, color=GREEN).scale(0.37),
            VGroup(
                MathTex(r"\vec{E}", color=YELLOW).scale(0.65),
                Text("沿径向 →", font=CJK, color=WHITE).scale(0.37),
                MathTex(r"\vec{E}\parallel\hat{n}", color=GREEN).scale(0.65),
            ).arrange(RIGHT, buff=0.1),
            MathTex(r"\Phi_{S_3}=E\cdot 2\pi r h", color=GREEN).scale(0.65),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        side_analysis.next_to(bot_analysis, DOWN, buff=0.35)
        side_analysis.to_edge(RIGHT, buff=0.4)
        self.play(FadeIn(side_analysis))

        # 在侧面画绿色箭头表示 E // n
        e_arr = Arrow(
            g_right.get_center(),
            g_right.get_center() + RIGHT * 0.7,
            buff=0, color=GREEN, stroke_width=3
        )
        e_arr_label = MathTex(r"\vec{E}", color=GREEN).scale(0.5).next_to(e_arr, UP, buff=0.05)
        self.play(Create(e_arr), FadeIn(e_arr_label))
        self.wait(1.5)

        # 清理几何图 + 分析
        geo_all = VGroup(
            cyl_top, cyl_bot, cyl_left, cyl_right, cyl_label, charge_label,
            g_top, g_bot, g_left, g_right, gauss_label,
            s1_label, s2_label, s3_label,
            cross1, cross2, e_arr, e_arr_label,
            flux_title, bot_analysis, side_analysis
        )
        self.play(FadeOut(geo_all), FadeOut(geo_title))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: 高斯定理主公式 + 逐步推导
        # ══════════════════════════════════════════════════════════════════════
        deriv_title = Text("应用高斯定理推导 E", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(deriv_title))

        # 高斯定理
        g_law_label = Text("高斯定理：", font=CJK).scale(0.42)
        g_law = MathTex(r"\oint_S \vec{E}\cdot d\vec{A} = \frac{1}{\varepsilon_0}\sum q_i").scale(0.82)
        g_law_row = VGroup(g_law_label, g_law).arrange(RIGHT, buff=0.2)
        g_law_row.next_to(deriv_title, DOWN, buff=0.5)
        self.play(FadeIn(g_law_label))
        self.play(Write(g_law))
        self.wait(1.2)

        # 只有侧面有贡献
        simp_label = Text("上下底贡献为 0，只剩侧面：", font=CJK).scale(0.40)
        simp_label.next_to(g_law_row, DOWN, buff=0.35)
        simp_eq = MathTex(r"E \cdot 2\pi r h = \frac{1}{\varepsilon_0}\sum q_i").scale(0.82)
        simp_eq.next_to(simp_label, DOWN, buff=0.25)
        simp_eq[0].set_color(YELLOW)
        self.play(FadeIn(simp_label))
        self.play(TransformMatchingTex(g_law.copy(), simp_eq))
        self.wait(1.2)

        # 内部（r < D/2）：enclosed charge = 0
        case_in_label = Text("情形 1：r < D/2（高斯面在圆柱面内）", font=CJK, color=RED).scale(0.40)
        case_in_label.next_to(simp_eq, DOWN, buff=0.35)
        case_in_q = MathTex(r"\sum q_i = 0", color=RED).scale(0.80)
        case_in_q.next_to(case_in_label, DOWN, buff=0.2)
        case_in_E = MathTex(r"\Rightarrow E_{\mathrm{in}} = 0", color=RED).scale(0.85)
        case_in_E.next_to(case_in_q, RIGHT, buff=0.4)
        self.play(FadeIn(case_in_label))
        self.play(Write(case_in_q))
        self.wait(0.6)
        self.play(Write(case_in_E))
        self.wait(1.2)

        # 外部（r > D/2）：enclosed charge = σ · π D h
        case_out_label = Text("情形 2：r > D/2（高斯面在圆柱面外）", font=CJK, color=GREEN).scale(0.40)
        case_out_label.next_to(case_in_E, DOWN, buff=0.32)
        case_out_label.align_to(case_in_label, LEFT)
        case_out_q = MathTex(r"\sum q_i = \sigma \pi D h", color=GREEN).scale(0.80)
        case_out_q.next_to(case_out_label, DOWN, buff=0.2)
        self.play(FadeIn(case_out_label))
        self.play(Write(case_out_q))
        self.wait(0.8)

        # 代入得 E_out
        derive_arrow = MathTex(r"\Rightarrow E \cdot 2\pi r h = \frac{\sigma \pi D h}{\varepsilon_0}").scale(0.78)
        derive_arrow.next_to(case_out_q, DOWN, buff=0.22)
        derive_arrow.set_color(CYAN)
        e_out_result = MathTex(r"E_{\mathrm{out}} = \frac{D\sigma}{2\varepsilon_0 r}", color=GREEN).scale(0.88)
        e_out_result.next_to(derive_arrow, DOWN, buff=0.22)
        self.play(Write(derive_arrow))
        self.wait(0.7)
        self.play(Write(e_out_result))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            deriv_title, g_law_row, simp_label, simp_eq,
            case_in_label, case_in_q, case_in_E,
            case_out_label, case_out_q, derive_arrow, e_out_result
        )))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: 双列：左侧圆柱图 + 右侧 E(r) 曲线（ValueTracker 演示 r 变化）
        # ══════════════════════════════════════════════════════════════════════
        vis_title = Text("E(r) 场强随半径变化", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(vis_title))

        # ── 左侧：截面示意图 ─────────────────────────────────────────────
        cx, cy = -3.2, -0.5   # 截面圆心

        # 带电圆柱面截面圆（半径代表 D/2 = 0.9）
        R_cyl = 0.9   # 视觉半径
        cyl_circle = Circle(radius=R_cyl, color=BLUE, fill_opacity=0.10, fill_color=BLUE)
        cyl_circle.move_to([cx, cy, 0])
        cyl_ring_label = Text("带电圆柱面", font=CJK, color=BLUE).scale(0.30)
        cyl_ring_label.next_to(cyl_circle, UP, buff=0.08)

        # r ValueTracker
        r_tracker = ValueTracker(0.5)

        # 高斯面圆（随 r 变化）
        def make_gauss_circle():
            r_vis = r_tracker.get_value()   # visual radius = r in units
            col = RED if r_vis < R_cyl else GREEN
            c = Circle(radius=r_vis, color=col)
            c.move_to([cx, cy, 0])
            return c

        gauss_circ = always_redraw(make_gauss_circle)

        # r 标注箭头
        def make_r_arrow():
            r_vis = r_tracker.get_value()
            start = np.array([cx, cy, 0])
            end   = np.array([cx + r_vis, cy, 0])
            return Arrow(start, end, buff=0, color=ORANGE, stroke_width=2.5,
                         max_tip_length_to_length_ratio=0.25)

        r_arrow = always_redraw(make_r_arrow)

        # r 数值标签
        def make_r_label():
            r_val = r_tracker.get_value()
            ratio = r_val / R_cyl
            return MathTex(rf"r = {ratio:.1f}\cdot(D/2)", color=ORANGE).scale(0.48)\
                     .move_to([cx, cy - 1.4, 0])

        r_label = always_redraw(make_r_label)

        # E 场线（内部空心，外部向外）
        def make_field_lines():
            r_vis = r_tracker.get_value()
            arrows = VGroup()
            if r_vis > R_cyl:
                n_lines = 8
                for k in range(n_lines):
                    ang = k * TAU / n_lines
                    d = np.array([math.cos(ang), math.sin(ang), 0.0])
                    s = np.array([cx, cy, 0]) + d * (R_cyl + 0.05)
                    e = np.array([cx, cy, 0]) + d * (r_vis + 0.35)
                    e[0] = np.clip(e[0], cx - 1.8, cx + 1.8)
                    e[1] = np.clip(e[1], cy - 1.8, cy + 1.8)
                    arrows.add(Arrow(s, e, buff=0, color=YELLOW, stroke_width=2,
                                     max_tip_length_to_length_ratio=0.30))
            else:
                # 内部 E = 0，画虚线圆提示
                pass
            return arrows

        field_lines = always_redraw(make_field_lines)

        # E = 0 提示（内部时显示）
        def make_e_zero_text():
            r_vis = r_tracker.get_value()
            if r_vis < R_cyl:
                t = MathTex(r"E=0", color=RED).scale(0.65).move_to([cx, cy, 0])
                return t
            else:
                return VGroup()

        e_zero = always_redraw(make_e_zero_text)

        self.play(Create(cyl_circle), FadeIn(cyl_ring_label))
        self.play(Create(gauss_circ), Create(r_arrow), FadeIn(r_label), FadeIn(e_zero))
        self.add(field_lines)
        self.wait(0.8)

        # ── 右侧：E(r) 分段函数图像 ───────────────────────────────────────
        axes = Axes(
            x_range=[0, 2.5, 0.5],
            y_range=[0, 2.2, 0.5],
            x_length=4.2,
            y_length=3.0,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        ).move_to([2.4, -0.6, 0])

        x_label = VGroup(
            MathTex(r"r", color=WHITE).scale(0.55),
            Text("距轴距离", font=CJK, color=WHITE).scale(0.30)
        ).arrange(RIGHT, buff=0.08)
        x_label.next_to(axes.x_axis.get_right(), UR, buff=0.1)

        y_label = VGroup(
            MathTex(r"E", color=WHITE).scale(0.55),
        )
        y_label.next_to(axes.y_axis.get_top(), LEFT, buff=0.08)

        # r = D/2 竖线
        x_d2 = 1.0   # 在 axes 坐标中 D/2 = 1.0
        vline = DashedLine(
            axes.c2p(x_d2, 0), axes.c2p(x_d2, 2.2),
            color=BLUE, dash_length=0.1
        )
        vline_label = VGroup(
            MathTex(r"r=D/2", color=BLUE).scale(0.42)
        ).next_to(axes.c2p(x_d2, 0), DOWN, buff=0.12)

        # E(r) 曲线：内部 E=0，外部 E = k/r（k = D·sigma/(2 eps0) 归一化取 1.5）
        k_val = 1.5
        curve_in  = axes.plot(lambda x: 0,         x_range=[0,   x_d2], color=RED,   stroke_width=3)
        curve_out = axes.plot(lambda x: k_val / x, x_range=[x_d2 + 0.01, 2.45], color=GREEN, stroke_width=3)

        # 跳变标注
        jump_dot_bot = Dot(axes.c2p(x_d2, 0),      color=RED,   radius=0.06)
        jump_dot_top = Dot(axes.c2p(x_d2, k_val),  color=GREEN, radius=0.06)
        jump_label = Text("E 不连续（跳变）", font=CJK, color=YELLOW).scale(0.32)
        jump_label.next_to(axes.c2p(x_d2, k_val / 2), RIGHT, buff=0.12)

        # 曲线标签
        curve_in_lab  = MathTex(r"E_{\mathrm{in}}=0",             color=RED  ).scale(0.50)
        curve_in_lab.next_to(axes.c2p(0.4, 0), UP, buff=0.18)
        curve_out_lab = MathTex(r"E_{\mathrm{out}}=\frac{D\sigma}{2\varepsilon_0 r}", color=GREEN).scale(0.45)
        curve_out_lab.next_to(axes.c2p(1.8, k_val / 1.8 + 0.1), UP, buff=0.05)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(vline), FadeIn(vline_label))
        self.play(Create(curve_in), FadeIn(jump_dot_bot))
        self.wait(0.4)
        self.play(Create(curve_out), FadeIn(jump_dot_top))
        self.play(FadeIn(jump_label), FadeIn(curve_in_lab), FadeIn(curve_out_lab))
        self.wait(1.0)

        # ── ValueTracker 动画：r 从内到外扫动 ────────────────────────────
        sweep_label = Text("调节 r：从圆柱面内→外，观察 E 变化", font=CJK, color=ORANGE).scale(0.36)
        sweep_label.next_to(cyl_circle, DOWN, buff=1.7)

        # r 值对应 vis = r_tracker 范围 0.3 ~ 1.7（R_cyl=0.9 为分界）
        self.play(FadeIn(sweep_label))
        self.wait(0.5)
        # 扫到外部
        self.play(r_tracker.animate.set_value(1.7), run_time=3.0)
        self.wait(1.0)
        # 扫回内部
        self.play(r_tracker.animate.set_value(0.35), run_time=2.5)
        self.wait(0.8)
        # 再扫一次到外部
        self.play(r_tracker.animate.set_value(1.55), run_time=2.5)
        self.wait(1.2)

        # 清场
        vis_all = VGroup(
            vis_title, cyl_circle, cyl_ring_label,
            axes, x_label, y_label,
            vline, vline_label,
            curve_in, curve_out,
            jump_dot_bot, jump_dot_top, jump_label,
            curve_in_lab, curve_out_lab,
            sweep_label
        )
        self.play(FadeOut(vis_all), FadeOut(gauss_circ), FadeOut(r_arrow),
                  FadeOut(r_label), FadeOut(e_zero), FadeOut(field_lines))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 数值示例
        # ══════════════════════════════════════════════════════════════════════
        ex_title = Text("数值示例", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        ex1 = Text("设 D = 0.2 m，sigma = 10 nC/m^2，求 r = 0.4 m 处的 E", font=CJK).scale(0.40)
        ex1.next_to(ex_title, DOWN, buff=0.30)
        ex_calc = MathTex(
            r"E_{\mathrm{out}} = \frac{D\sigma}{2\varepsilon_0 r}"
            r"= \frac{0.2 \times 10\times10^{-9}}{2\times8.85\times10^{-12}\times0.4}"
            r"\approx 28.2\ \mathrm{V/m}"
        ).scale(0.62)
        ex_calc.next_to(ex1, DOWN, buff=0.30)
        ex_calc.set_color(GREEN)

        ex2 = Text("r = 0.05 m（圆柱内）：E = 0", font=CJK, color=RED).scale(0.42)
        ex2.next_to(ex_calc, DOWN, buff=0.30)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1))
        self.wait(0.6)
        self.play(Write(ex_calc))
        self.wait(0.8)
        self.play(FadeIn(ex2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_title, ex1, ex_calc, ex2)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 物理图像直觉说明
        # ══════════════════════════════════════════════════════════════════════
        insight_title = Text("物理直觉：为什么内部 E = 0？", font=CJK, color=BLUE).scale(0.48)
        insight_title.next_to(title, DOWN, buff=0.42)
        i1 = Text("高斯面内无包围电荷（圆柱面电荷在外面），", font=CJK).scale(0.42)
        i2 = Text("高斯定理保证通量为零。由圆柱对称性，", font=CJK).scale(0.42)
        i3 = Text("侧面 E 处处相等，所以 E·面积 = 0 → E = 0。", font=CJK, color=RED).scale(0.42)
        i4 = Text("这与导体壳内无电场的道理完全相同！", font=CJK, color=YELLOW).scale(0.42)
        insight = VGroup(i1, i2, i3, i4).arrange(DOWN, buff=0.22).next_to(insight_title, DOWN, buff=0.35)
        insight.scale_to_fit_width(12)
        self.play(FadeIn(insight_title))
        for line in [i1, i2, i3, i4]:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.wait(1.2)
        self.play(FadeOut(VGroup(insight_title, insight)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 10: 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sum_title))

        f1_row = VGroup(
            Text("高斯定理：", font=CJK).scale(0.40),
            MathTex(r"E\cdot 2\pi rh = \frac{1}{\varepsilon_0}\sum q_i", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.2)

        f2_row = VGroup(
            Text("圆柱面外：", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"E_{\mathrm{out}}=\frac{D\sigma}{2\varepsilon_0 r}\quad (r>D/2)", color=GREEN).scale(0.72)
        ).arrange(RIGHT, buff=0.2)

        f3_row = VGroup(
            Text("圆柱面内：", font=CJK, color=RED).scale(0.40),
            MathTex(r"E_{\mathrm{in}}=0\quad (r<D/2)", color=RED).scale(0.72)
        ).arrange(RIGHT, buff=0.2)

        key_note = Text("r = D/2 处 E 发生不连续跳变（面电荷层引起）", font=CJK, color=CYAN).scale(0.38)

        summary = VGroup(f1_row, f2_row, f3_row, key_note).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.18)

        self.play(Write(f1_row[1]), FadeIn(f1_row[0]))
        self.wait(0.5)
        self.play(Write(f2_row[1]), FadeIn(f2_row[0]))
        self.wait(0.5)
        self.play(Write(f3_row[1]), FadeIn(f3_row[0]))
        self.wait(0.5)
        self.play(FadeIn(key_note))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch07Ex1CylinderGaussSurface",
        "id": "phys-ch07-7.2-ex1-cylinder-gauss-surface",
        "chapterId": "ch07",
        "sectionId": "7.2",
        "title": "例题：无限长带电圆柱面内外场强",
        "description": "用同轴高斯圆柱面分析通量，推导无限长带电圆柱面内 E=0、外 E=Dσ/(2ε₀r)，并用 ValueTracker 演示 E(r) 随半径的跳变行为。",
    },
]
