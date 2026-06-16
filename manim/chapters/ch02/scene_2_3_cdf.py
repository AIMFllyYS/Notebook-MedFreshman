"""第 2.3 节 · 随机变量的分布函数 —— 阶梯 CDF（离散）与平滑 CDF（连续）对比展示。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BLUE_E,
    BOLD,
    DOWN,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Arrow,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    ReplacementTransform,
    Scene,
    Text,
    VGroup,
    Write,
    Line,
    DashedLine,
    AnimationGroup,
    LaggedStart,
)

CJK = "Microsoft YaHei"


class CDFScene(Scene):
    def construct(self):
        # ── Part 1: 标题页 ──────────────────────────────────────────────
        title = Text("分布函数：概率的累积", font=CJK, weight=BOLD).scale(0.75).to_edge(UP)
        subtitle = Text("F(x) = P(X ≤ x)", font=CJK).scale(0.5).next_to(title, DOWN, buff=0.15)
        subtitle.set_color(BLUE)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.5)

        # ── Part 2: 离散型 —— 先画 PMF 直方图 ──────────────────────────
        # 淡出副标题，保留主标题
        self.play(FadeOut(subtitle))

        sec1_label = Text("离散型随机变量", font=CJK, weight=BOLD).scale(0.5)
        sec1_label.set_color(BLUE_D).next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(sec1_label))

        pmf_label = Text("概率质量函数 P(X=k)", font=CJK).scale(0.42)
        pmf_label.to_edge(LEFT, buff=0.4).shift(DOWN * 0.3)

        # 离散分布：X 取 1,2,3,4,5，概率 0.1,0.2,0.3,0.25,0.15
        xs = [1, 2, 3, 4, 5]
        probs = [0.10, 0.20, 0.30, 0.25, 0.15]
        colors = [BLUE, BLUE, GREEN, ORANGE, RED]

        # PMF 图轴（左侧）
        pmf_ax = Axes(
            x_range=[0, 6, 1],
            y_range=[0, 0.45, 0.1],
            x_length=3.2,
            y_length=2.4,
            axis_config={"include_numbers": False, "tip_length": 0.15},
        ).shift(LEFT * 3.0 + DOWN * 1.2)

        x_nums = VGroup()
        for k in xs:
            lbl = MathTex(str(k)).scale(0.45)
            lbl.move_to(pmf_ax.c2p(k, 0) + DOWN * 0.25)
            x_nums.add(lbl)

        y_ticks = VGroup()
        for val in [0.1, 0.2, 0.3, 0.4]:
            lbl = MathTex(str(val)).scale(0.38)
            lbl.move_to(pmf_ax.c2p(0, val) + LEFT * 0.35)
            y_ticks.add(lbl)

        pmf_x_label = MathTex("k").scale(0.5).next_to(pmf_ax.x_axis.get_end(), RIGHT, buff=0.1)
        pmf_y_label = MathTex("P").scale(0.5).next_to(pmf_ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(pmf_ax), FadeIn(x_nums), FadeIn(y_ticks),
                  FadeIn(pmf_x_label), FadeIn(pmf_y_label), Write(pmf_label))

        # 画直方图柱子
        bars = VGroup()
        bar_width = 0.28
        for k, p, c in zip(xs, probs, colors):
            bar = Rectangle(
                width=bar_width,
                height=pmf_ax.c2p(0, p)[1] - pmf_ax.c2p(0, 0)[1],
                color=c,
                fill_color=c,
                fill_opacity=0.75,
                stroke_width=1.5,
            )
            bar.move_to(pmf_ax.c2p(k, p / 2))
            bars.add(bar)

        self.play(LaggedStart(*[Create(b) for b in bars], lag_ratio=0.18))
        self.wait(0.4)

        # ── Part 3: 右侧动态生成阶梯 CDF ──────────────────────────────
        cdf_label = Text("分布函数 F(x) = P(X ≤ x)", font=CJK).scale(0.42)
        cdf_label.to_edge(RIGHT, buff=0.4).shift(UP * 1.0)

        cdf_ax = Axes(
            x_range=[0, 6, 1],
            y_range=[0, 1.1, 0.2],
            x_length=3.2,
            y_length=2.4,
            axis_config={"include_numbers": False, "tip_length": 0.15},
        ).shift(RIGHT * 2.6 + DOWN * 1.2)

        cx_nums = VGroup()
        for k in xs:
            lbl = MathTex(str(k)).scale(0.45)
            lbl.move_to(cdf_ax.c2p(k, 0) + DOWN * 0.25)
            cx_nums.add(lbl)

        cy_ticks = VGroup()
        for val in [0.2, 0.4, 0.6, 0.8, 1.0]:
            lbl = MathTex(str(val)).scale(0.38)
            lbl.move_to(cdf_ax.c2p(0, val) + LEFT * 0.35)
            cy_ticks.add(lbl)

        cdf_x_label = MathTex("x").scale(0.5).next_to(cdf_ax.x_axis.get_end(), RIGHT, buff=0.1)
        cdf_y_label = MathTex("F").scale(0.5).next_to(cdf_ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(cdf_ax), FadeIn(cx_nums), FadeIn(cy_ticks),
                  FadeIn(cdf_x_label), FadeIn(cdf_y_label), Write(cdf_label))

        # 累积概率值
        cum = []
        running = 0.0
        for p in probs:
            running += p
            cum.append(round(running, 2))

        # 阶梯 CDF 逐步生成
        step_segments = VGroup()
        jump_dots = VGroup()    # 实心点（跳跃后值）
        open_dots = VGroup()    # 空心点（跳跃前值）

        prev_cum = 0.0
        segment_left_x = 0.0

        for i, (k, c, col) in enumerate(zip(xs, cum, colors)):
            # 水平段：从 k 到 k+1（或到 k=5 终端）
            x_start = segment_left_x
            x_end = k
            y_val = prev_cum

            # 水平线段
            p1 = cdf_ax.c2p(x_start, y_val)
            p2 = cdf_ax.c2p(x_end, y_val)
            h_line = Line(p1, p2, color=BLUE_D, stroke_width=2.5)

            # 跳跃垂直段（虚线）
            p3 = cdf_ax.c2p(k, prev_cum)
            p4 = cdf_ax.c2p(k, c)
            v_dashed = DashedLine(p3, p4, color=col, stroke_width=1.5, dash_length=0.07)

            # 实心点（跳跃后）
            solid = Dot(cdf_ax.c2p(k, c), radius=0.07, color=col)
            # 空心点（跳跃前，在跳跃处的左极限）
            hollow = Dot(cdf_ax.c2p(k, prev_cum), radius=0.07, color=col)
            hollow.set_fill(WHITE, opacity=1).set_stroke(col, width=2)

            step_segments.add(h_line, v_dashed)
            jump_dots.add(solid)
            open_dots.add(hollow)

            # 动画：先高亮对应 PMF 柱，再画阶梯
            self.play(bars[i].animate.set_fill(YELLOW, opacity=0.95), run_time=0.3)
            self.play(Create(h_line), run_time=0.3)
            self.play(Create(v_dashed), FadeIn(hollow), FadeIn(solid), run_time=0.4)
            self.play(bars[i].animate.set_fill(col, opacity=0.75), run_time=0.2)

            prev_cum = c
            segment_left_x = k

        # 最后一段水平线：从 x=5 向右延伸到 x=6
        last_line = Line(
            cdf_ax.c2p(5, 1.0), cdf_ax.c2p(6, 1.0), color=BLUE_D, stroke_width=2.5
        )
        self.play(Create(last_line), run_time=0.3)
        self.wait(0.5)

        # 阶梯 CDF 性质注释
        prop_text = Text("右连续，单调不减，F(+∞)=1", font=CJK).scale(0.38)
        prop_text.set_color(BLUE).next_to(cdf_ax, DOWN, buff=0.25)
        self.play(Write(prop_text))
        self.wait(1.0)

        # ── Part 4: 过渡到连续型 ────────────────────────────────────────
        discrete_group = VGroup(
            pmf_ax, pmf_label, x_nums, y_ticks, pmf_x_label, pmf_y_label, bars,
            cdf_ax, cdf_label, cx_nums, cy_ticks, cdf_x_label, cdf_y_label,
            step_segments, jump_dots, open_dots, last_line, prop_text,
        )
        self.play(FadeOut(discrete_group), FadeOut(sec1_label))

        sec2_label = Text("连续型随机变量", font=CJK, weight=BOLD).scale(0.5)
        sec2_label.set_color(GREEN_D).next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(sec2_label))
        self.wait(0.3)

        # ── Part 5: 正态分布 PDF + 积分面积 = F(x) ─────────────────────
        import numpy as np

        def normal_pdf(t, mu=0, sigma=1):
            return np.exp(-0.5 * ((t - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))

        # 坐标轴
        cont_ax = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 0.55, 0.1],
            x_length=5.5,
            y_length=2.6,
            axis_config={"include_numbers": False, "tip_length": 0.15},
        ).shift(LEFT * 1.0 + DOWN * 0.6)

        pdf_label = Text("PDF: f(x)", font=CJK).scale(0.42).set_color(GREEN)
        pdf_label.next_to(cont_ax, UP, buff=0.1).shift(RIGHT * 0.5)

        # 画 PDF 曲线
        from manim import FunctionGraph
        pdf_curve = cont_ax.plot(
            lambda t: normal_pdf(t),
            x_range=[-3.5, 3.5],
            color=GREEN,
            stroke_width=2.5,
        )

        x_axis_label = MathTex("x").scale(0.5).next_to(cont_ax.x_axis.get_end(), RIGHT, buff=0.1)
        y_axis_label = MathTex("f(x)").scale(0.45).next_to(cont_ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(cont_ax), FadeIn(x_axis_label), FadeIn(y_axis_label))
        self.play(Create(pdf_curve), Write(pdf_label))
        self.wait(0.4)

        # 动态选取 x0，展示 F(x0) = 积分面积
        x0_values = [-0.5, 0.5, 1.2]
        shade_obj = None
        x0_line_obj = None
        x0_dot_obj = None
        area_label_obj = None
        fx_label_obj = None

        for x0 in x0_values:
            # 阴影面积（左侧积分）
            shade = cont_ax.get_area(
                pdf_curve,
                x_range=[-3.5, x0],
                color=BLUE,
                opacity=0.4,
            )

            # x0 垂直线
            x0_line = DashedLine(
                cont_ax.c2p(x0, 0),
                cont_ax.c2p(x0, normal_pdf(x0)),
                color=YELLOW,
                stroke_width=2.0,
            )
            x0_dot = Dot(cont_ax.c2p(x0, 0), radius=0.07, color=YELLOW)

            # 积分公式标注
            area_lbl = MathTex(
                r"F(x_0) = \int_{-\infty}^{x_0} f(t)\,dt"
            ).scale(0.5).set_color(BLUE)
            area_lbl.to_edge(RIGHT, buff=0.5).shift(UP * 0.4)

            # x0 的数值标注
            x0_val_str = f"{x0:.1f}"
            import math as _math
            fx_val = round(float(
                0.5 * (1 + _math.erf(x0 / np.sqrt(2)))
            ), 3)
            fx_lbl = MathTex(
                r"F(" + x0_val_str + r") \approx " + str(fx_val)
            ).scale(0.48).set_color(ORANGE)
            fx_lbl.next_to(area_lbl, DOWN, buff=0.25)

            if shade_obj is None:
                self.play(FadeIn(shade), Create(x0_line), FadeIn(x0_dot))
                self.play(Write(area_lbl), Write(fx_lbl))
            else:
                self.play(
                    ReplacementTransform(shade_obj, shade),
                    ReplacementTransform(x0_line_obj, x0_line),
                    ReplacementTransform(x0_dot_obj, x0_dot),
                    ReplacementTransform(fx_label_obj, fx_lbl),
                    run_time=0.8,
                )

            shade_obj = shade
            x0_line_obj = x0_line
            x0_dot_obj = x0_dot
            area_label_obj = area_lbl
            fx_label_obj = fx_lbl
            self.wait(0.9)

        self.wait(0.4)

        # ── Part 6: 箭头连接 f(x) 与 F'(x)=f(x) ──────────────────────
        deriv_lbl = MathTex(r"F'(x) = f(x)").scale(0.55).set_color(RED)
        deriv_lbl.next_to(area_label_obj, DOWN, buff=0.55)

        arrow_down = Arrow(
            area_label_obj.get_bottom() + DOWN * 0.05,
            deriv_lbl.get_top() + UP * 0.05,
            buff=0.05,
            color=RED,
            stroke_width=2.5,
            max_tip_length_to_length_ratio=0.2,
        )
        self.play(Create(arrow_down), Write(deriv_lbl))

        deriv_note = Text("微分 CDF 可还原 PDF", font=CJK).scale(0.38).set_color(RED)
        deriv_note.next_to(deriv_lbl, DOWN, buff=0.15)
        self.play(FadeIn(deriv_note))
        self.wait(1.2)

        # ── Part 7: 小结 ────────────────────────────────────────────────
        all_cont = VGroup(
            cont_ax, pdf_curve, pdf_label, x_axis_label, y_axis_label,
            shade_obj, x0_line_obj, x0_dot_obj, area_label_obj, fx_label_obj,
            arrow_down, deriv_lbl, deriv_note,
        )
        self.play(FadeOut(all_cont), FadeOut(sec2_label))

        summary_title = Text("小结", font=CJK, weight=BOLD).scale(0.6)
        summary_title.next_to(title, DOWN, buff=0.3)

        pt1 = Text("离散型：F(x) 为阶梯函数，右连续，跳跃量 = P(X=k)", font=CJK).scale(0.42)
        pt2 = Text("连续型：F(x) = PDF 曲线在 x 左侧的面积（积分）", font=CJK).scale(0.42)
        pt3_a = MathTex(r"F'(x) = f(x)").scale(0.5).set_color(GREEN_D)
        pt3_b = Text("（微分 CDF = PDF）", font=CJK).scale(0.42).set_color(GREEN_D)
        pt3 = VGroup(pt3_a, pt3_b).arrange(RIGHT, buff=0.15)

        summary = VGroup(pt1, pt2, pt3).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        summary.next_to(summary_title, DOWN, buff=0.35)

        self.play(Write(summary_title))
        self.play(LaggedStart(FadeIn(pt1), FadeIn(pt2), FadeIn(pt3), lag_ratio=0.4))
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, summary_title, summary)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "CDFScene",
        "id": "ch02-2.3-cdf",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "分布函数：概率的累积",
        "description": "用阶梯图展示离散型 CDF 的逐步累积，再用正态分布 PDF 的积分面积直观呈现连续型 CDF，最后以箭头说明 F'(x)=f(x) 的微积分关系。",
    },
]
