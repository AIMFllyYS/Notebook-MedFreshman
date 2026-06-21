"""第 12.3 节 · 单缝衍射导出不确定关系

从单缝衍射实验的几何分析出发，逐步推导 Heisenberg 不确定关系：
  Δx · Δp_x ≥ ℏ/2
用 ValueTracker 演示缝宽 a 缩小时 Δx 与 Δp_x 的互补关系。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch12Kp3SingleSlitUncertaintyDerivation(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("单缝衍射导出不确定关系", font=CJK, color=BLUE).scale(0.66)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第12章 量子力学初步 · 12.3", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("用手电筒照一条极细的缝：缝越细，光斑越宽。", font=CJK).scale(0.46)
        ana2 = Text("这不是仪器缺陷，而是大自然的根本约束——", font=CJK).scale(0.46)
        ana3 = Text("「位置限定得越死，动量方向越散乱」。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.26)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 单缝衍射装置示意图 ─────────────────────────────────
        # 布局：左侧入射波，中间缝，右侧屏
        slit_x = 0.0        # 缝的 x 坐标（场景中心）
        screen_x = 3.8      # 屏幕 x 坐标
        slit_half = 0.7     # 缝半宽（显示用，像素单位）
        wall_top = 2.5
        wall_bot = -2.5

        # 遮挡板（上下两段）
        wall_color = "#888888"
        wall_top_rect = Rectangle(
            width=0.18, height=wall_top - slit_half,
            fill_color=wall_color, fill_opacity=0.85, stroke_color=WHITE, stroke_width=1
        ).move_to([slit_x, (wall_top + slit_half) / 2, 0])
        wall_bot_rect = Rectangle(
            width=0.18, height=wall_top - slit_half,
            fill_color=wall_color, fill_opacity=0.85, stroke_color=WHITE, stroke_width=1
        ).move_to([slit_x, -(wall_top + slit_half) / 2, 0])

        # 缝宽标注线
        slit_brace = Brace(
            Line([slit_x - 0.5, -slit_half, 0], [slit_x - 0.5, slit_half, 0]),
            direction=LEFT, color=CYAN
        )
        slit_label = VGroup(
            Text("a =", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"\Delta x", color=CYAN).scale(0.7),
        ).arrange(RIGHT, buff=0.08)
        slit_label.next_to(slit_brace, LEFT, buff=0.1)

        # 入射平行波（几条水平箭头）
        arrows_in = VGroup(*[
            Arrow([-4.5, y, 0], [-0.1 + slit_x, y, 0], buff=0, color=GREEN,
                  stroke_width=2, max_tip_length_to_length_ratio=0.12)
            for y in np.linspace(-slit_half + 0.15, slit_half - 0.15, 5)
        ])
        arrow_label = Text("入射电子波", font=CJK, color=GREEN).scale(0.36)
        arrow_label.move_to([-3.2, -slit_half - 0.55, 0])

        # 屏幕线
        screen_line = Line([screen_x, wall_bot, 0], [screen_x, wall_top, 0],
                           color="#AAAAAA", stroke_width=2)
        screen_text = Text("接收屏", font=CJK, color=WHITE).scale(0.36)
        screen_text.next_to(screen_line, RIGHT, buff=0.12)

        diagram_group = VGroup(
            wall_top_rect, wall_bot_rect,
            arrows_in, arrow_label,
            slit_brace, slit_label,
            screen_line, screen_text
        )
        diagram_group.shift(DOWN * 0.7)

        self.play(
            Create(screen_line), FadeIn(screen_text),
            Create(wall_top_rect), Create(wall_bot_rect),
        )
        self.play(GrowArrow(arrows_in[2]))
        self.play(*[GrowArrow(arr) for arr in [arrows_in[0], arrows_in[1], arrows_in[3], arrows_in[4]]])
        self.play(FadeIn(arrow_label))
        self.play(Create(slit_brace), FadeIn(slit_label))
        self.wait(1.2)

        # ── Step 4: 第一幕——衍射强度分布曲线（a 较大时） ───────────────
        # 在屏幕右侧绘制单缝衍射强度曲线 I(y) ∝ (sinc(β))^2
        # β = π a y / (λ L)，归一化后用 y 扫
        intensity_axes = Axes(
            x_range=[-2.2, 2.2, 1],
            y_range=[0, 1.2, 0.5],
            x_length=2.2,
            y_length=3.2,
            axis_config={"color": "#666666", "stroke_width": 1.2, "include_tip": False},
        ).move_to([5.5, -0.7, 0])

        def sinc_sq(beta):
            if abs(beta) < 1e-8:
                return 1.0
            return (math.sin(beta) / beta) ** 2

        # 参数：α = π a / λ，控制衍射图样宽窄；α 大→图样窄，α 小→图样宽
        # 用 alpha 作为 ValueTracker（正比于 a）
        alpha_tracker = ValueTracker(4.0)  # 初始 a 较大

        intensity_curve = always_redraw(lambda: intensity_axes.plot(
            lambda y: sinc_sq(alpha_tracker.get_value() * y),
            x_range=[-2.2, 2.2],
            color=YELLOW,
            stroke_width=2.5,
        ))

        cap_large = Text("a 较大：衍射图样窄，电子几乎直行", font=CJK, color=GREEN).scale(0.38)
        cap_large.to_edge(DOWN, buff=0.3)

        self.play(Create(intensity_axes), Create(intensity_curve), FadeIn(cap_large))
        self.wait(1.5)

        # ── Step 5: a 缩小——衍射图样展宽 ──────────────────────────────
        cap_small = Text("a 缩小：图样展宽，Δp_x 增大！", font=CJK, color=RED).scale(0.38)
        cap_small.to_edge(DOWN, buff=0.3)

        # 同步缩小遮挡板缝（视觉上缩小 slit_half）
        # 用 ValueTracker 同步 wall 与曲线
        self.play(FadeOut(cap_large))
        self.play(
            alpha_tracker.animate.set_value(1.2),
            run_time=3.0,
            rate_func=smooth,
        )
        self.play(FadeIn(cap_small))
        self.wait(1.5)
        self.play(FadeOut(cap_small))

        # 清除衍射装置图，进入第二幕推导
        self.play(FadeOut(VGroup(
            wall_top_rect, wall_bot_rect,
            arrows_in, arrow_label,
            slit_brace, slit_label,
            screen_line, screen_text,
            intensity_axes, intensity_curve,
        )))

        # ── Step 6: 第二幕——几何推导动画 ──────────────────────────────
        deriv_title = Text("几何推导：从衍射条件到不确定关系", font=CJK, color=BLUE).scale(0.50)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))
        self.wait(0.6)

        # 绘制简洁的矢量几何图
        # 缝宽 a、第一暗纹衍射角 θ
        geo_cx = -3.0
        geo_cy = -0.5
        slit_geo = Line([geo_cx, geo_cy + 0.9, 0], [geo_cx, geo_cy - 0.9, 0],
                        color=WHITE, stroke_width=2.5)
        top_dot = Dot([geo_cx, geo_cy + 0.9, 0], color=WHITE, radius=0.06)
        bot_dot = Dot([geo_cx, geo_cy - 0.9, 0], color=WHITE, radius=0.06)

        # 第一暗纹方向箭头
        theta_val = math.radians(28)  # 示意角度
        arrow_diffr = Arrow(
            [geo_cx, geo_cy, 0],
            [geo_cx + 2.8 * math.cos(theta_val), geo_cy + 2.8 * math.sin(theta_val), 0],
            buff=0, color=YELLOW, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.12
        )
        arrow_straight = Arrow(
            [geo_cx, geo_cy, 0],
            [geo_cx + 2.8, geo_cy, 0],
            buff=0, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.12
        )

        # 标注 θ 角弧
        theta_arc = Arc(radius=0.6, start_angle=0, angle=theta_val,
                        color=ORANGE, stroke_width=2).move_arc_center_to([geo_cx, geo_cy, 0])
        theta_lbl = MathTex(r"\theta", color=ORANGE).scale(0.65)
        theta_lbl.move_to([geo_cx + 0.85, geo_cy + 0.22, 0])

        # 缝宽标注
        a_brace = Brace(slit_geo, direction=LEFT, color=CYAN)
        a_lbl = VGroup(
            MathTex(r"\Delta x", color=CYAN).scale(0.65),
            Text("= a", font=CJK, color=CYAN).scale(0.40),
        ).arrange(RIGHT, buff=0.06)
        a_lbl.next_to(a_brace, LEFT, buff=0.1)

        geo_group = VGroup(slit_geo, top_dot, bot_dot, arrow_diffr, arrow_straight,
                           theta_arc, theta_lbl, a_brace, a_lbl)
        geo_group.shift(DOWN * 0.3)

        self.play(Create(slit_geo), FadeIn(top_dot), FadeIn(bot_dot))
        self.play(GrowArrow(arrow_straight))
        self.play(GrowArrow(arrow_diffr))
        self.play(Create(theta_arc), FadeIn(theta_lbl))
        self.play(Create(a_brace), FadeIn(a_lbl))
        self.wait(1.0)

        # ── Step 7: 推导步骤逐行出现 ────────────────────────────────────
        steps_x = 1.2  # 推导公式放右侧

        # 步骤 1：第一暗纹条件
        cond_label = Text("第一暗纹条件：", font=CJK, color=WHITE).scale(0.42)
        cond_eq = MathTex(r"a \sin\theta = \lambda", color=YELLOW).scale(0.82)
        row1 = VGroup(cond_label, cond_eq).arrange(RIGHT, buff=0.15)
        row1.move_to([steps_x + 0.8, 1.3, 0])

        self.play(FadeIn(cond_label), Write(cond_eq))
        self.wait(1.0)

        # 步骤 2：位置不确定度
        dx_label = Text("缝宽即位置不确定度：", font=CJK, color=WHITE).scale(0.38)
        dx_eq = MathTex(r"\Delta x = a", color=CYAN).scale(0.82)
        row2 = VGroup(dx_label, dx_eq).arrange(RIGHT, buff=0.15)
        row2.move_to([steps_x + 0.8, 0.55, 0])

        self.play(FadeIn(dx_label), Write(dx_eq))
        self.wait(1.0)

        # 步骤 3：x 方向动量不确定度 = p sinθ
        dp_label = Text("衍射给出 x 方向动量扩散：", font=CJK, color=WHITE).scale(0.38)
        dp_eq = MathTex(r"\Delta p_x \approx p\sin\theta", color=ORANGE).scale(0.82)
        row3 = VGroup(dp_label, dp_eq).arrange(RIGHT, buff=0.15)
        row3.move_to([steps_x + 0.8, -0.22, 0])

        self.play(FadeIn(dp_label), Write(dp_eq))
        self.wait(1.0)

        # 步骤 4：de Broglie 关系 p = h/λ
        debroglie_label = Text("de Broglie：", font=CJK, color=WHITE).scale(0.38)
        debroglie_eq = MathTex(r"p = \frac{h}{\lambda}", color=GREEN).scale(0.82)
        row4 = VGroup(debroglie_label, debroglie_eq).arrange(RIGHT, buff=0.15)
        row4.move_to([steps_x + 0.8, -0.95, 0])

        self.play(FadeIn(debroglie_label), Write(debroglie_eq))
        self.wait(1.0)

        # 步骤 5：合并
        combine_eq = MathTex(
            r"\Delta p_x \approx \frac{h}{\lambda}\sin\theta = \frac{h}{a}", color=YELLOW
        ).scale(0.82)
        combine_eq.move_to([steps_x + 0.8, -1.65, 0])
        arrow_combine = MathTex(r"\Rightarrow", color=WHITE).scale(0.7)
        arrow_combine.next_to(combine_eq, LEFT, buff=0.25)

        self.play(FadeIn(arrow_combine), Write(combine_eq))
        self.wait(1.3)

        # 步骤 6：最终结果高亮
        result_eq = MathTex(r"\Delta x \cdot \Delta p_x \approx h", color=RED).scale(1.05)
        result_eq.move_to([steps_x + 0.8, -2.4, 0])
        result_box = SurroundingRectangle(result_eq, color=RED, buff=0.18, corner_radius=0.10)

        self.play(Write(result_eq))
        self.play(Create(result_box))
        self.wait(1.8)

        # 清场进入第三幕
        self.play(FadeOut(VGroup(
            deriv_title,
            geo_group,
            row1, row2, row3, row4,
            arrow_combine, combine_eq,
            result_eq, result_box,
        )))

        # ── Step 8: 第三幕——双坐标轴互补关系 ──────────────────────────
        comp_title = Text("互补关系：Δx 越小，Δp_x 越大", font=CJK, color=BLUE).scale(0.50)
        comp_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(comp_title))
        self.wait(0.5)

        # 左坐标系：Δx vs a（随 a 增大而增大）
        ax_left = Axes(
            x_range=[0.1, 3.0, 1],
            y_range=[0, 3.5, 1],
            x_length=4.5,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
        ).move_to([-3.2, -0.8, 0])
        xl_lbl = Text("a (缝宽)", font=CJK, color=WHITE).scale(0.34)
        xl_lbl.next_to(ax_left.x_axis.get_end(), DOWN, buff=0.12)
        yl_lbl = VGroup(
            MathTex(r"\Delta x", color=CYAN).scale(0.55),
        )
        yl_lbl.next_to(ax_left.y_axis.get_end(), LEFT, buff=0.12)

        # 右坐标系：Δp_x vs a（随 a 增大而减小）
        ax_right = Axes(
            x_range=[0.1, 3.0, 1],
            y_range=[0, 3.5, 1],
            x_length=4.5,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
        ).move_to([3.2, -0.8, 0])
        xr_lbl = Text("a (缝宽)", font=CJK, color=WHITE).scale(0.34)
        xr_lbl.next_to(ax_right.x_axis.get_end(), DOWN, buff=0.12)
        yr_lbl = VGroup(
            MathTex(r"\Delta p_x", color=ORANGE).scale(0.55),
        )
        yr_lbl.next_to(ax_right.y_axis.get_end(), LEFT, buff=0.12)

        # 绘制两条曲线
        # Δx = a  → linear
        curve_dx = ax_left.plot(lambda a: a, x_range=[0.1, 3.0], color=CYAN, stroke_width=3)
        # Δp_x ∝ 1/a
        curve_dp = ax_right.plot(lambda a: 0.9 / a, x_range=[0.1, 3.0], color=ORANGE, stroke_width=3)

        # 在左图上标 Δx = a
        dx_curve_lbl = MathTex(r"\Delta x = a", color=CYAN).scale(0.60)
        dx_curve_lbl.move_to(ax_left.c2p(2.3, 2.8))
        # 在右图上标 Δp_x = h/a
        dp_curve_lbl = MathTex(r"\Delta p_x = h/a", color=ORANGE).scale(0.60)
        dp_curve_lbl.move_to(ax_right.c2p(1.8, 2.6))

        self.play(Create(ax_left), FadeIn(xl_lbl), FadeIn(yl_lbl))
        self.play(Create(ax_right), FadeIn(xr_lbl), FadeIn(yr_lbl))
        self.play(Create(curve_dx), FadeIn(dx_curve_lbl))
        self.play(Create(curve_dp), FadeIn(dp_curve_lbl))
        self.wait(1.2)

        # 用竖线扫动演示 a 减小时两侧的变化
        a_scan = ValueTracker(2.8)
        scan_line_left = always_redraw(lambda: ax_left.get_vertical_line(
            ax_left.c2p(a_scan.get_value(), a_scan.get_value()),
            color=GREEN, stroke_width=2
        ))
        scan_dot_left = always_redraw(lambda: Dot(
            ax_left.c2p(a_scan.get_value(), a_scan.get_value()), color=GREEN, radius=0.09
        ))
        a_val = min(max(a_scan.get_value(), 0.11), 2.99)
        scan_line_right = always_redraw(lambda: ax_right.get_vertical_line(
            ax_right.c2p(a_scan.get_value(), 0.9 / a_scan.get_value()),
            color=GREEN, stroke_width=2
        ))
        scan_dot_right = always_redraw(lambda: Dot(
            ax_right.c2p(a_scan.get_value(), 0.9 / a_scan.get_value()), color=GREEN, radius=0.09
        ))

        cap_scan = Text("绿点同步移动：Δx 减小 ↔ Δp_x 增大", font=CJK, color=GREEN).scale(0.40)
        cap_scan.to_edge(DOWN, buff=0.25)

        self.play(
            FadeIn(scan_line_left), FadeIn(scan_dot_left),
            FadeIn(scan_line_right), FadeIn(scan_dot_right),
            FadeIn(cap_scan),
        )
        self.play(a_scan.animate.set_value(0.25), run_time=4.0, rate_func=smooth)
        self.wait(1.0)
        self.play(a_scan.animate.set_value(2.8), run_time=2.5, rate_func=smooth)
        self.wait(1.0)

        # 乘积恒量标注
        product_label = Text("乘积恒满足：", font=CJK, color=WHITE).scale(0.42)
        product_eq = MathTex(r"\Delta x \cdot \Delta p_x \geq \frac{\hbar}{2}", color=YELLOW).scale(0.85)
        product_row = VGroup(product_label, product_eq).arrange(RIGHT, buff=0.15)
        product_row.to_edge(DOWN, buff=0.28)

        self.play(FadeOut(cap_scan))
        self.play(FadeIn(product_label), Write(product_eq))
        self.wait(2.0)

        # 清场
        self.play(FadeOut(VGroup(
            comp_title,
            ax_left, xl_lbl, yl_lbl, curve_dx, dx_curve_lbl,
            ax_right, xr_lbl, yr_lbl, curve_dp, dp_curve_lbl,
            scan_line_left, scan_dot_left,
            scan_line_right, scan_dot_right,
            product_label, product_eq,
        )))

        # ── Step 9: 精确表述补充 ───────────────────────────────────────
        hbar_title = Text("精确形式（Robertson 不等式）", font=CJK, color=BLUE).scale(0.48)
        hbar_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(hbar_title))

        precise_eq = MathTex(
            r"\Delta x \cdot \Delta p_x \geq \frac{\hbar}{2}",
            color=YELLOW
        ).scale(1.1)
        precise_eq.next_to(hbar_title, DOWN, buff=0.5)

        note1 = VGroup(
            MathTex(r"\hbar = \frac{h}{2\pi}", color=GREEN).scale(0.75),
            Text("（约化普朗克常数）", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        note1.next_to(precise_eq, DOWN, buff=0.35)

        note2_l = Text("单缝推导给出估计：", font=CJK, color=WHITE).scale(0.38)
        note2_r = MathTex(r"\Delta x \cdot \Delta p_x \approx h", color=CYAN).scale(0.75)
        note2 = VGroup(note2_l, note2_r).arrange(RIGHT, buff=0.12)
        note2.next_to(note1, DOWN, buff=0.30)

        note3 = Text("量级上吻合，精确下界由量子力学正式推导给出。",
                     font=CJK, color=WHITE).scale(0.38)
        note3.next_to(note2, DOWN, buff=0.28)

        self.play(Write(precise_eq))
        self.wait(0.8)
        self.play(FadeIn(note1))
        self.wait(0.8)
        self.play(FadeIn(note2))
        self.wait(0.8)
        self.play(FadeIn(note3))
        self.wait(1.8)
        self.play(FadeOut(VGroup(hbar_title, precise_eq, note1, note2, note3)))

        # ── Step 10: 小结卡 ────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1_l = Text("第一暗纹条件：", font=CJK, color=WHITE).scale(0.42)
        s1_r = MathTex(r"a\sin\theta = \lambda", color=YELLOW).scale(0.82)
        s1 = VGroup(s1_l, s1_r).arrange(RIGHT, buff=0.12)

        s2_l = Text("估计结果：", font=CJK, color=WHITE).scale(0.42)
        s2_r = MathTex(r"\Delta x \cdot \Delta p_x \approx h", color=YELLOW).scale(0.82)
        s2 = VGroup(s2_l, s2_r).arrange(RIGHT, buff=0.12)

        s3_l = Text("精确不等式：", font=CJK, color=WHITE).scale(0.42)
        s3_r = MathTex(r"\Delta x \cdot \Delta p_x \geq \dfrac{\hbar}{2}", color=RED).scale(0.82)
        s3 = VGroup(s3_l, s3_r).arrange(RIGHT, buff=0.12)

        s4 = Text("缝越窄 → 位置限定越精确 → 动量越不确定（量子内禀特性，非测量误差）",
                  font=CJK, color=GREEN).scale(0.37)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s1), run_time=0.8)
        self.wait(0.5)
        self.play(FadeIn(s2), run_time=0.8)
        self.wait(0.5)
        self.play(FadeIn(s3), run_time=0.8)
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch12Kp3SingleSlitUncertaintyDerivation",
        "id": "phys-ch12-12.3-kp3-single-slit-uncertainty-derivation",
        "chapterId": "ch12",
        "sectionId": "12.3",
        "title": "单缝衍射导出不确定关系",
        "description": "从单缝衍射几何条件出发，逐步推导 Δx·Δp_x≈h，用双坐标轴动画展示位置与动量的互补关系，最终给出 Heisenberg 不确定关系的精确形式。",
    }
]
