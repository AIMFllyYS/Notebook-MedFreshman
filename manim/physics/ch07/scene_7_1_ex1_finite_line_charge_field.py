"""第 7.1 节 · 例题：有限长均匀带电直线的中垂线场强。

用 ValueTracker 动态演示电荷元 dl 沿带电直线扫动、dE 的矢量分解与对称消除，
最终推导出中垂线上合场强公式，并展示两个极限情形。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch07Ex1FiniteLineChargeField",
        "id": "phys-ch07-7.1-ex1-finite-line-charge-field",
        "chapterId": "ch07",
        "sectionId": "7.1",
        "title": "例题：有限长均匀带电直线的中垂线场强",
        "description": "用矢量分解+ValueTracker扫动演示有限长均匀带电直线在中垂线上的合场强推导，含两个极限情形的公式变化。",
    },
]

# ── 全局尺寸常量 ───────────────────────────────────────────────────────────────
SCALE = 1.3          # 坐标系单位（屏幕单位/m 的等效比例）
L_VAL = 2.0          # 带电直线半长（场景单位）
R_VAL = 1.5          # P 点到原点距离（场景单位）


class Ch07Ex1FiniteLineChargeField(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("有限长均匀带电直线的中垂线场强", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第七章 静电场 · 7.1 · 例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比
        # ════════════════════════════════════════════════════════════════════
        ana1 = Text("想象一根长发丝被均匀涂上了电荷，", font=CJK).scale(0.46)
        ana2 = Text("你站在它正中央旁边——两侧电荷的横向力恰好抵消，", font=CJK).scale(0.46)
        ana3 = Text("只剩一个沿「垂直于线」方向的合力。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22)
        ana.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3 · 建立坐标系与几何图形
        # ════════════════════════════════════════════════════════════════════
        # 坐标轴
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[-3.0, 3.0, 1],
            x_length=7.0,
            y_length=5.6,
            axis_config={"color": WHITE, "stroke_width": 1.5,
                         "tip_width": 0.18, "tip_height": 0.18},
        ).shift(DOWN * 0.3 + LEFT * 0.4)

        x_label = MathTex(r"x").scale(0.6).next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)
        y_label = MathTex(r"y").scale(0.6).next_to(axes.y_axis.get_end(), UP, buff=0.12)

        # 带电直线  [-L, L] 在 y 轴上
        top_pt = axes.c2p(0, L_VAL)
        bot_pt = axes.c2p(0, -L_VAL)
        line_charge = Line(bot_pt, top_pt, color=BLUE, stroke_width=5)

        # 端点标签
        lbl_L = MathTex(r"L", color=BLUE).scale(0.55).next_to(axes.c2p(0, L_VAL), LEFT, buff=0.1)
        lbl_mL = MathTex(r"-L", color=BLUE).scale(0.55).next_to(axes.c2p(0, -L_VAL), LEFT, buff=0.1)

        # P 点
        p_pt = axes.c2p(R_VAL, 0)
        p_dot = Dot(p_pt, color=YELLOW, radius=0.09)
        p_label = Text("P", font=CJK, color=YELLOW).scale(0.42).next_to(p_dot, UP, buff=0.08)

        # r 标注
        r_line = DashedLine(axes.c2p(0, 0), p_pt, color=CYAN, stroke_width=1.5)
        r_label = MathTex(r"r", color=CYAN).scale(0.52).next_to(axes.c2p(R_VAL / 2, 0), DOWN, buff=0.12)

        setup_group = VGroup(axes, x_label, y_label, line_charge, lbl_L, lbl_mL,
                             p_dot, p_label, r_line, r_label)
        cap_setup = Text("建立坐标系：y 轴为带电直线，P 点在中垂线上", font=CJK).scale(0.40).to_edge(DOWN, buff=0.28)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(line_charge), FadeIn(lbl_L), FadeIn(lbl_mL))
        self.play(FadeIn(p_dot), FadeIn(p_label), Create(r_line), FadeIn(r_label))
        self.play(FadeIn(cap_setup))
        self.wait(1.5)
        self.play(FadeOut(cap_setup))

        # ════════════════════════════════════════════════════════════════════
        # Step 4 · 电荷元 dl 高亮 + dE 矢量分解（静态展示原理）
        # ════════════════════════════════════════════════════════════════════
        l0 = 0.8   # 初始 l 值（场景坐标）

        # 电荷元小段（黄色）
        dl_h = 0.22  # 小段半高
        dl_seg = Line(axes.c2p(0, l0 - dl_h), axes.c2p(0, l0 + dl_h),
                      color=YELLOW, stroke_width=7)
        dl_dot = Dot(axes.c2p(0, l0), color=YELLOW, radius=0.07)
        dl_label = MathTex(r"dl", color=YELLOW).scale(0.50).next_to(axes.c2p(0, l0), LEFT, buff=0.12)

        # 距离矢量 r_vec（从 dl 到 P）
        dl_pos = axes.c2p(0, l0)
        dist_vec = Arrow(dl_pos, p_pt, buff=0, color=ORANGE, stroke_width=2.0,
                         max_tip_length_to_length_ratio=0.15)
        dist_label = MathTex(r"\vec{r}'", color=ORANGE).scale(0.50)
        dist_label.move_to(axes.c2p(R_VAL / 2, l0 / 2)).shift(UP * 0.18)

        # 角度 θ 弧
        theta_arc = Arc(
            radius=0.38,
            start_angle=PI / 2,
            angle=-math.atan2(l0, R_VAL),
            arc_center=p_pt,
            color=GREEN,
            stroke_width=1.8,
        )
        theta_label = MathTex(r"\theta", color=GREEN).scale(0.50)
        theta_label.next_to(p_pt, LEFT, buff=0.50).shift(UP * 0.10)

        # dE 矢量：方向从 dl 到 P 再延伸
        dist_r = math.sqrt(R_VAL ** 2 + l0 ** 2)
        cos_t = R_VAL / dist_r
        sin_t = l0 / dist_r
        de_len = 0.75
        de_end = p_pt + np.array([cos_t * de_len, -sin_t * de_len, 0])
        dE_vec = Arrow(p_pt, de_end, buff=0, color=WHITE, stroke_width=2.2,
                       max_tip_length_to_length_ratio=0.18)
        dE_label = MathTex(r"d\vec{E}", color=WHITE).scale(0.50).next_to(de_end, UR, buff=0.05)

        # dE_x（绿色，水平分量）
        dEx_end = p_pt + np.array([cos_t * de_len, 0, 0])
        dEx_vec = Arrow(p_pt, dEx_end, buff=0, color=GREEN, stroke_width=2.2,
                        max_tip_length_to_length_ratio=0.18)
        dEx_label = MathTex(r"dE_x", color=GREEN).scale(0.48).next_to(dEx_end, DOWN, buff=0.08)

        # dE_y（红色，垂直分量，向上/向下取决于 l 的符号）
        dEy_end = p_pt + np.array([0, -sin_t * de_len, 0])
        dEy_vec = Arrow(p_pt, dEy_end, buff=0, color=RED, stroke_width=2.2,
                        max_tip_length_to_length_ratio=0.18)
        dEy_label = MathTex(r"dE_y", color=RED).scale(0.48).next_to(dEy_end, RIGHT, buff=0.08)

        step4_group = VGroup(dl_seg, dl_dot, dl_label, dist_vec, dist_label,
                             theta_arc, theta_label, dE_vec, dE_label,
                             dEx_vec, dEx_label, dEy_vec, dEy_label)

        cap4 = Text("取电荷元 dl：dE 分解为 dE_x（保留）和 dE_y（对称消除）", font=CJK).scale(0.38).to_edge(DOWN, buff=0.28)

        self.play(Create(dl_seg), FadeIn(dl_dot), FadeIn(dl_label))
        self.play(Create(dist_vec), FadeIn(dist_label))
        self.play(Create(theta_arc), FadeIn(theta_label))
        self.play(Create(dE_vec), FadeIn(dE_label))
        self.wait(0.6)
        self.play(Create(dEx_vec), FadeIn(dEx_label),
                  Create(dEy_vec), FadeIn(dEy_label))
        self.play(FadeIn(cap4))
        self.wait(1.8)
        self.play(FadeOut(cap4))

        # ════════════════════════════════════════════════════════════════════
        # Step 5 · dE_y 对称消除动画：正负各一对同时出现、相消
        # ════════════════════════════════════════════════════════════════════
        # 对称位置 l = -0.8
        l_sym = -l0
        dist_r2 = math.sqrt(R_VAL ** 2 + l_sym ** 2)
        cos_t2 = R_VAL / dist_r2
        sin_t2 = abs(l_sym) / dist_r2  # l<0 时 dE_y 向上

        # 对称 dl 段
        dl_seg_sym = Line(axes.c2p(0, l_sym - dl_h), axes.c2p(0, l_sym + dl_h),
                          color=YELLOW, stroke_width=7)
        dl_dot_sym = Dot(axes.c2p(0, l_sym), color=YELLOW, radius=0.07)
        dl_label_sym = MathTex(r"dl'", color=YELLOW).scale(0.50).next_to(axes.c2p(0, l_sym), LEFT, buff=0.12)

        # 对称 dE（从对称 dl 指向 P 方向，x 分量向右，y 分量向上）
        de_len2 = 0.75
        de_end2 = p_pt + np.array([cos_t2 * de_len2, sin_t2 * de_len2, 0])
        dE_vec2 = Arrow(p_pt, de_end2, buff=0, color=WHITE, stroke_width=2.2,
                        max_tip_length_to_length_ratio=0.18)
        dE_label2 = MathTex(r"d\vec{E}'", color=WHITE).scale(0.50).next_to(de_end2, DR, buff=0.05)

        dEx_end2 = p_pt + np.array([cos_t2 * de_len2, 0, 0])
        dEx_vec2 = Arrow(p_pt, dEx_end2, buff=0, color=GREEN, stroke_width=2.2,
                         max_tip_length_to_length_ratio=0.18)
        dEx_label2 = MathTex(r"dE_x'", color=GREEN).scale(0.48).next_to(dEx_end2, UP, buff=0.08)

        dEy_end2 = p_pt + np.array([0, sin_t2 * de_len2, 0])
        dEy_vec2 = Arrow(p_pt, dEy_end2, buff=0, color=RED, stroke_width=2.2,
                         max_tip_length_to_length_ratio=0.18)
        dEy_label2 = MathTex(r"dE_y'", color=RED).scale(0.48).next_to(dEy_end2, RIGHT, buff=0.08)

        cap5 = Text("对称位置 dE_y 与 dE_y' 方向相反，恰好抵消！", font=CJK, color=RED).scale(0.40).to_edge(DOWN, buff=0.28)

        self.play(Create(dl_seg_sym), FadeIn(dl_dot_sym), FadeIn(dl_label_sym))
        self.play(Create(dE_vec2), FadeIn(dE_label2))
        self.play(Create(dEx_vec2), FadeIn(dEx_label2),
                  Create(dEy_vec2), FadeIn(dEy_label2))
        self.play(FadeIn(cap5))
        self.wait(0.8)
        # 消除动画：dE_y 和 dE_y' 淡出并收缩到 P 点
        self.play(
            dEy_vec.animate.scale(0.01).move_to(p_pt),
            dEy_vec2.animate.scale(0.01).move_to(p_pt),
            dEy_label.animate.fade(1),
            dEy_label2.animate.fade(1),
            run_time=1.4,
        )
        cancel_text = Text("dE_y 相消", font=CJK, color=RED).scale(0.44).next_to(p_pt, DOWN, buff=0.45)
        self.play(FadeIn(cancel_text))
        self.wait(1.2)

        # 清理 Step 4-5 的临时对象（保留坐标系）
        self.play(FadeOut(VGroup(
            dl_seg, dl_dot, dl_label, dist_vec, dist_label,
            theta_arc, theta_label,
            dE_vec, dE_label, dEx_vec, dEx_label, dEy_vec, dEy_label,
            dl_seg_sym, dl_dot_sym, dl_label_sym,
            dE_vec2, dE_label2, dEx_vec2, dEx_label2, dEy_vec2, dEy_label2,
            cap5, cancel_text,
        )))

        # ════════════════════════════════════════════════════════════════════
        # Step 6 · ValueTracker 扫动 dl：累积 dE_x 演示
        # ════════════════════════════════════════════════════════════════════
        l_tracker = ValueTracker(-L_VAL)

        def get_dl_pos():
            l = l_tracker.get_value()
            return axes.c2p(0, l)

        def get_de_arrow():
            l = l_tracker.get_value()
            dist = math.sqrt(R_VAL ** 2 + l ** 2)
            cos_th = R_VAL / dist
            sin_th = l / dist
            de_scale = 0.65
            end_pt = p_pt + np.array([cos_th * de_scale, -sin_th * de_scale, 0])
            return Arrow(p_pt, end_pt, buff=0, color=GREEN, stroke_width=2.5,
                         max_tip_length_to_length_ratio=0.20)

        def get_dl_dot():
            return Dot(get_dl_pos(), color=YELLOW, radius=0.09)

        def get_dl_seg():
            l = l_tracker.get_value()
            return Line(axes.c2p(0, l - 0.18), axes.c2p(0, l + 0.18),
                        color=YELLOW, stroke_width=7)

        sweep_dl = always_redraw(get_dl_seg)
        sweep_dot = always_redraw(get_dl_dot)
        sweep_arrow = always_redraw(get_de_arrow)

        l_readout = always_redraw(lambda: VGroup(
            Text("l =", font=CJK).scale(0.36),
            MathTex(rf"{l_tracker.get_value():.2f}", color=YELLOW).scale(0.50),
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.55))

        cap6 = Text("dl 从 -L 扫到 +L：每一段 dE_x（绿色）都沿 +x 方向叠加", font=CJK).scale(0.38).to_edge(DOWN, buff=0.28)

        self.play(Create(sweep_dl), Create(sweep_dot), Create(sweep_arrow), FadeIn(l_readout))
        self.play(FadeIn(cap6))
        self.play(l_tracker.animate.set_value(L_VAL), run_time=3.5, rate_func=linear)
        self.wait(1.0)
        self.play(FadeOut(VGroup(sweep_dl, sweep_dot, sweep_arrow, l_readout, cap6)))

        # ════════════════════════════════════════════════════════════════════
        # Step 7 · 公式推导（逐步出现 + 关键项高亮）
        # ════════════════════════════════════════════════════════════════════
        # 将公式区放在右侧，坐标系缩到左半
        axes_group = VGroup(axes, x_label, y_label, line_charge, lbl_L, lbl_mL,
                            p_dot, p_label, r_line, r_label)
        self.play(axes_group.animate.scale(0.72).to_edge(LEFT, buff=0.3))

        deriv_title = Text("积分推导", font=CJK, color=BLUE).scale(0.48)
        deriv_title.to_edge(RIGHT, buff=3.2).shift(UP * 2.8)

        step_a = MathTex(r"dE = \frac{k\,\lambda\,dl}{r'^2}", color=WHITE).scale(0.72)
        step_b = MathTex(r"dE_x = dE\cos\theta = \frac{k\,\lambda\,r\,dl}{(r^2+l^2)^{3/2}}", color=WHITE).scale(0.65)
        step_c = MathTex(r"E = \int_{-L}^{L} \frac{k\,\lambda\,r}{(r^2+l^2)^{3/2}}\,dl", color=YELLOW).scale(0.68)
        step_d = MathTex(r"E = \frac{k\lambda}{r} \cdot \frac{2L}{\sqrt{L^2+r^2}}", color=GREEN).scale(0.72)
        step_e = MathTex(r"E = \frac{kq}{r\sqrt{L^2+r^2}}", color=GREEN).scale(0.78)
        step_e[0].set_color(YELLOW)

        deriv_stack = VGroup(step_a, step_b, step_c, step_d, step_e).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        deriv_stack.next_to(deriv_title, DOWN, buff=0.35)
        # 防止超右边
        deriv_stack.scale_to_fit_width(min(deriv_stack.width, 5.6))
        deriv_stack.to_edge(RIGHT, buff=0.3)
        deriv_title.align_to(deriv_stack, LEFT)

        self.play(FadeIn(deriv_title))
        self.play(Write(step_a))
        self.wait(0.8)
        self.play(Write(step_b))
        self.wait(0.8)
        self.play(Write(step_c))
        step_c.set_color(YELLOW)
        self.wait(1.0)
        self.play(Write(step_d))
        self.wait(0.8)
        self.play(Write(step_e))
        box_result = SurroundingRectangle(step_e, color=YELLOW, buff=0.12, corner_radius=0.08)
        self.play(Create(box_result))
        self.wait(1.8)

        self.play(FadeOut(VGroup(axes_group, deriv_title, step_a, step_b, step_c, step_d, step_e, box_result)))

        # ════════════════════════════════════════════════════════════════════
        # Step 8 · 合场强箭头在 P 点展示
        # ════════════════════════════════════════════════════════════════════
        # 重建坐标系（居中）
        axes2 = Axes(
            x_range=[-0.5, 4.5, 1],
            y_range=[-2.8, 2.8, 1],
            x_length=6.5,
            y_length=5.0,
            axis_config={"color": WHITE, "stroke_width": 1.5,
                         "tip_width": 0.15, "tip_height": 0.15},
        ).shift(LEFT * 1.0 + DOWN * 0.2)

        x2 = MathTex(r"x").scale(0.55).next_to(axes2.x_axis.get_end(), RIGHT, buff=0.1)
        y2 = MathTex(r"y").scale(0.55).next_to(axes2.y_axis.get_end(), UP, buff=0.1)
        top2 = axes2.c2p(0, L_VAL)
        bot2 = axes2.c2p(0, -L_VAL)
        lc2 = Line(bot2, top2, color=BLUE, stroke_width=5)
        lL2 = MathTex(r"L", color=BLUE).scale(0.50).next_to(axes2.c2p(0, L_VAL), LEFT, buff=0.1)
        lmL2 = MathTex(r"-L", color=BLUE).scale(0.50).next_to(axes2.c2p(0, -L_VAL), LEFT, buff=0.1)
        p2_pt = axes2.c2p(R_VAL, 0)
        p2_dot = Dot(p2_pt, color=YELLOW, radius=0.09)
        p2_lbl = Text("P", font=CJK, color=YELLOW).scale(0.40).next_to(p2_dot, UP, buff=0.08)
        r2_line = DashedLine(axes2.c2p(0, 0), p2_pt, color=CYAN, stroke_width=1.5)
        r2_lbl = MathTex(r"r", color=CYAN).scale(0.48).next_to(axes2.c2p(R_VAL / 2, 0), DOWN, buff=0.1)

        E_arrow = Arrow(p2_pt, p2_pt + np.array([1.3, 0, 0]),
                        buff=0, color=GREEN, stroke_width=3.5,
                        max_tip_length_to_length_ratio=0.22)
        E_lbl = MathTex(r"\vec{E}", color=GREEN).scale(0.60).next_to(E_arrow.get_end(), RIGHT, buff=0.1)

        E_formula = MathTex(r"E = \frac{kq}{r\sqrt{L^2+r^2}}", color=YELLOW).scale(0.72)
        E_formula.next_to(title, DOWN, buff=0.45).to_edge(RIGHT, buff=0.4)

        cap8 = Text("所有 dE_x 叠加，P 点合场强沿水平方向向右", font=CJK, color=GREEN).scale(0.40).to_edge(DOWN, buff=0.28)

        self.play(Create(axes2), FadeIn(x2), FadeIn(y2))
        self.play(Create(lc2), FadeIn(lL2), FadeIn(lmL2))
        self.play(FadeIn(p2_dot), FadeIn(p2_lbl), Create(r2_line), FadeIn(r2_lbl))
        self.play(GrowArrow(E_arrow), FadeIn(E_lbl))
        self.play(Write(E_formula))
        self.play(FadeIn(cap8))
        self.wait(2.0)
        self.play(FadeOut(cap8))

        # ════════════════════════════════════════════════════════════════════
        # Step 9 · E(r) 曲线：ValueTracker 扫 r
        # ════════════════════════════════════════════════════════════════════
        ax_group2 = VGroup(axes2, x2, y2, lc2, lL2, lmL2, p2_dot, p2_lbl, r2_line, r2_lbl, E_arrow, E_lbl, E_formula)
        self.play(FadeOut(ax_group2))

        # E(r) 曲线图
        k_const = 9e9
        q_const = 1e-8
        L_phys = 0.2  # 物理单位 m

        curve_axes = Axes(
            x_range=[0.05, 1.0, 0.2],
            y_range=[0, 12, 2],
            x_length=6.5,
            y_length=4.2,
            axis_config={"color": WHITE, "stroke_width": 1.5,
                         "tip_width": 0.14, "tip_height": 0.14},
            x_axis_config={"numbers_to_include": [0.2, 0.4, 0.6, 0.8, 1.0]},
            y_axis_config={"numbers_to_include": [2, 4, 6, 8, 10]},
        ).shift(DOWN * 0.5 + LEFT * 0.3)

        x_ax_lbl = MathTex(r"r\,(\mathrm{m})", color=WHITE).scale(0.48).next_to(curve_axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_ax_lbl = MathTex(r"E\,(\mathrm{V/m})\times10^{3}", color=WHITE).scale(0.42).next_to(curve_axes.y_axis.get_end(), UP, buff=0.1)

        def E_func(r):
            val = k_const * q_const / (r * math.sqrt(L_phys ** 2 + r ** 2))
            return val / 1000  # 单位：kV/m

        E_curve = curve_axes.plot(E_func, x_range=[0.05, 1.0, 0.005], color=YELLOW, stroke_width=2.5)

        cap9 = Text("E(r) 曲线：随距离增大而减小", font=CJK).scale(0.40).to_edge(DOWN, buff=0.28)
        r_tracker = ValueTracker(0.05)
        r_dot = always_redraw(lambda: Dot(
            curve_axes.c2p(r_tracker.get_value(), E_func(r_tracker.get_value())),
            color=CYAN, radius=0.09))
        r_val_label = always_redraw(lambda: VGroup(
            Text("r =", font=CJK).scale(0.36),
            MathTex(rf"{r_tracker.get_value():.2f}\,\mathrm{{m}}", color=CYAN).scale(0.50),
        ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.55))

        self.play(Create(curve_axes), FadeIn(x_ax_lbl), FadeIn(y_ax_lbl))
        self.play(Create(E_curve), FadeIn(cap9))
        self.play(FadeIn(r_dot), FadeIn(r_val_label))
        self.play(r_tracker.animate.set_value(1.0), run_time=3.0, rate_func=smooth)
        self.wait(0.8)
        self.play(FadeOut(VGroup(r_dot, r_val_label, cap9)))

        # ════════════════════════════════════════════════════════════════════
        # Step 10 · 两个极限情形标注
        # ════════════════════════════════════════════════════════════════════
        # 极限1：L → ∞（r 很小时，曲线右端趋势标注）
        # 在曲线小 r 端标箭头
        inf_x = 0.12
        inf_y = E_func(inf_x)
        lim_inf_dot = Dot(curve_axes.c2p(inf_x, inf_y), color=RED, radius=0.08)
        lim_inf_arrow = Arrow(
            curve_axes.c2p(inf_x + 0.15, inf_y + 1.5),
            curve_axes.c2p(inf_x, inf_y),
            buff=0.05, color=RED, stroke_width=2.0, max_tip_length_to_length_ratio=0.25,
        )
        lim_inf_label = VGroup(
            Text("L→∞ ：", font=CJK, color=RED).scale(0.38),
            MathTex(r"E=\frac{\lambda}{2\pi\varepsilon_0 r}", color=RED).scale(0.58),
        ).arrange(RIGHT, buff=0.1)
        lim_inf_label.next_to(lim_inf_arrow.get_start(), UP, buff=0.08)

        # 极限2：r >> L（大 r 时退化为点电荷）
        far_x = 0.80
        far_y = E_func(far_x)
        lim_far_dot = Dot(curve_axes.c2p(far_x, far_y), color=ORANGE, radius=0.08)
        lim_far_arrow = Arrow(
            curve_axes.c2p(far_x - 0.12, far_y + 2.0),
            curve_axes.c2p(far_x, far_y),
            buff=0.05, color=ORANGE, stroke_width=2.0, max_tip_length_to_length_ratio=0.25,
        )
        lim_far_label = VGroup(
            Text("r>>L ：", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"E\approx k\frac{q}{r^2}", color=ORANGE).scale(0.58),
        ).arrange(RIGHT, buff=0.1)
        lim_far_label.next_to(lim_far_arrow.get_start(), UP, buff=0.08)

        cap10 = Text("两个极限：无限长线电荷 vs 点电荷", font=CJK, color=WHITE).scale(0.40).to_edge(DOWN, buff=0.28)

        self.play(FadeIn(lim_inf_dot), Create(lim_inf_arrow), FadeIn(lim_inf_label))
        self.wait(1.2)
        self.play(FadeIn(lim_far_dot), Create(lim_far_arrow), FadeIn(lim_far_label))
        self.play(FadeIn(cap10))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            curve_axes, x_ax_lbl, y_ax_lbl, E_curve,
            lim_inf_dot, lim_inf_arrow, lim_inf_label,
            lim_far_dot, lim_far_arrow, lim_far_label, cap10,
        )))

        # ════════════════════════════════════════════════════════════════════
        # Step 11 · 小结卡
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        f1_lbl = Text("一般公式：", font=CJK, color=WHITE).scale(0.44)
        f1_eq = MathTex(r"E = \frac{kq}{r\sqrt{L^2+r^2}}", color=YELLOW).scale(0.78)
        f1 = VGroup(f1_lbl, f1_eq).arrange(RIGHT, buff=0.18)

        f2_lbl = Text("无限长 (L→∞)：", font=CJK, color=RED).scale(0.44)
        f2_eq = MathTex(r"E = \frac{\lambda}{2\pi\varepsilon_0 r}", color=RED).scale(0.78)
        f2 = VGroup(f2_lbl, f2_eq).arrange(RIGHT, buff=0.18)

        f3_lbl = Text("点电荷极限 (r>>L)：", font=CJK, color=ORANGE).scale(0.44)
        f3_eq = MathTex(r"E \approx k\frac{q}{r^2}", color=ORANGE).scale(0.78)
        f3 = VGroup(f3_lbl, f3_eq).arrange(RIGHT, buff=0.18)

        note_sym = Text("关键：y 方向分量因上下对称完全抵消，合场强沿中垂线方向。", font=CJK, color=GREEN).scale(0.40)

        summary = VGroup(f1, f2, f3, note_sym).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(min(summary.width, 12.0))
        summary.center().shift(DOWN * 0.3)
        s_title.next_to(summary, UP, buff=0.35)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(f1_eq), FadeIn(f1_lbl))
        self.wait(0.6)
        self.play(Write(f2_eq), FadeIn(f2_lbl))
        self.wait(0.6)
        self.play(Write(f3_eq), FadeIn(f3_lbl))
        self.wait(0.6)
        self.play(FadeIn(note_sym))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
