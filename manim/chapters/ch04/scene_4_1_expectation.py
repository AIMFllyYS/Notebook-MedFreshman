"""第 4.1 节 · 数学期望 —— 用杠杆平衡类比展示期望是概率加权的重心。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
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
    GrowFromCenter,
    Line,
    MathTex,
    NumberLine,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    always_redraw,
    ValueTracker,
    DecimalNumber,
    AnimationGroup,
    Indicate,
)

CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "ExpectationScene",
        "id": "ch04-4.1-expectation",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "数学期望：概率加权的中心",
        "description": "用杠杆平衡类比展示离散随机变量的期望，再过渡到连续分布的加权重心。",
    },
]


class ExpectationScene(Scene):
    def construct(self):
        # ── 第一幕：标题 ──────────────────────────────────────────────
        title = Text("数学期望：概率加权的中心", font=CJK, weight=BOLD).scale(0.7)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.4)

        # ── 第二幕：离散分布 + 数轴 ───────────────────────────────────
        subtitle1 = Text("离散随机变量的期望", font=CJK).scale(0.55).next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(subtitle1))

        # 数轴
        number_line = NumberLine(
            x_range=[0, 7, 1],
            length=9,
            include_numbers=True,
            include_tip=True,
            label_direction=DOWN,
        )
        number_line.shift(DOWN * 0.5)
        self.play(Create(number_line))

        # 定义分布：X 取值 1,2,3,4,5，概率 0.1,0.2,0.4,0.2,0.1
        values = [1, 2, 3, 4, 5]
        probs  = [0.1, 0.2, 0.4, 0.2, 0.1]
        colors = [BLUE, GREEN, GOLD, ORANGE, RED]

        # 绘制竖线（高度 = 概率 × 缩放系数）
        prob_scale = 4.0
        bars = VGroup()
        prob_labels = VGroup()
        for v, p, c in zip(values, probs, colors):
            x_pos = number_line.n2p(v)
            bar = Line(
                start=x_pos,
                end=x_pos + UP * p * prob_scale,
                color=c,
                stroke_width=8,
            )
            dot = Dot(x_pos + UP * p * prob_scale, color=c, radius=0.08)
            label = MathTex(rf"p={p}", color=c).scale(0.42)
            label.next_to(dot, UP, buff=0.08)
            bars.add(VGroup(bar, dot))
            prob_labels.add(label)

        self.play(
            *[Create(b) for b in bars],
            lag_ratio=0.15,
        )
        self.play(FadeIn(prob_labels, lag_ratio=0.15))
        self.wait(0.5)

        # ── 第三幕：杠杆支点动画 ──────────────────────────────────────
        lever_caption = Text("把各点当「砝码」，重量 = 概率，寻找平衡支点", font=CJK).scale(0.45)
        lever_caption.to_edge(DOWN, buff=0.45)
        self.play(Write(lever_caption))

        # 杠杆横梁（画在数轴上方）
        beam = Line(
            number_line.n2p(0.5),
            number_line.n2p(6.5),
            color=WHITE,
            stroke_width=3,
        )
        beam.shift(DOWN * 0.05)

        # 支点三角形（用 Dot 模拟，实际用 Arrow 指示）
        pivot_tracker = ValueTracker(1.0)  # 初始支点位置（偏左）

        def make_pivot(x_val):
            x_pos = number_line.n2p(x_val)
            tri = Dot(x_pos + DOWN * 0.05, color=YELLOW, radius=0.15)
            return tri

        pivot_dot = always_redraw(lambda: make_pivot(pivot_tracker.get_value()))

        pivot_label_prefix = Text("x =", font=CJK, color=YELLOW).scale(0.5)
        pivot_label_num = DecimalNumber(
            pivot_tracker.get_value(),
            num_decimal_places=1,
            color=YELLOW,
        ).scale(0.5)
        pivot_label = VGroup(pivot_label_prefix, pivot_label_num).arrange(RIGHT, buff=0.1)
        pivot_label.next_to(number_line.n2p(pivot_tracker.get_value()), DOWN, buff=0.35)

        def update_pivot_label(m):
            val = pivot_tracker.get_value()
            pivot_label_num.set_value(val)
            m.arrange(RIGHT, buff=0.1)
            m.next_to(number_line.n2p(val), DOWN, buff=0.35)

        pivot_label.add_updater(update_pivot_label)

        self.play(Create(beam), FadeIn(pivot_dot), FadeIn(pivot_label))
        self.wait(0.4)

        # 支点从 1 滑动到 3（期望值），体现力矩失衡直到平衡
        self.play(pivot_tracker.animate.set_value(3.0), run_time=2.5)
        self.wait(0.5)

        # 高亮期望值
        expect_val = sum(v * p for v, p in zip(values, probs))  # = 3.0
        ex_formula = MathTex(
            r"E[X] = \sum_i x_i \, p_i = 3.0",
            color=YELLOW,
        ).scale(0.6)
        ex_formula.to_edge(LEFT, buff=0.5).shift(DOWN * 2.0)
        self.play(FadeOut(lever_caption))
        self.play(Write(ex_formula))
        self.wait(0.5)

        # 在期望处画竖线高亮
        ex_line = Line(
            number_line.n2p(expect_val) + DOWN * 0.2,
            number_line.n2p(expect_val) + UP * 1.8,
            color=YELLOW,
            stroke_width=5,
        )
        self.play(Create(ex_line))
        self.play(Indicate(ex_line, color=YELLOW, scale_factor=1.1))
        self.wait(0.8)

        # 清场，准备第二幕
        self.play(
            FadeOut(VGroup(
                subtitle1, beam, pivot_dot, pivot_label,
                bars, prob_labels, ex_line, ex_formula,
                number_line,
            )),
        )
        self.wait(0.3)

        # ── 第四幕：连续分布 ──────────────────────────────────────────
        subtitle2 = Text("连续随机变量的期望", font=CJK).scale(0.55).next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(subtitle2))

        # 坐标系
        axes = Axes(
            x_range=[-0.5, 7, 1],
            y_range=[0, 0.55, 0.1],
            x_length=9,
            y_length=4,
            axis_config={"include_numbers": False, "include_tip": True},
        ).shift(DOWN * 0.5)
        x_label = MathTex(r"x").next_to(axes.x_axis.get_right(), RIGHT, buff=0.15).scale(0.6)
        y_label = MathTex(r"f(x)").next_to(axes.y_axis.get_top(), UP, buff=0.1).scale(0.6)
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))

        # 正态分布密度 N(mu=3, sigma=1)
        import math

        def normal_pdf(x, mu=3.0, sigma=1.0):
            return (1 / (sigma * math.sqrt(2 * math.pi))) * math.exp(-0.5 * ((x - mu) / sigma) ** 2)

        curve = axes.plot(
            lambda x: normal_pdf(x),
            x_range=[0, 6, 0.05],
            color=BLUE,
            stroke_width=3,
        )
        self.play(Create(curve), run_time=1.5)
        self.wait(0.4)

        # 标注公式
        cont_formula = MathTex(
            r"E[X] = \int_{-\infty}^{+\infty} x \, f(x) \, dx",
            color=GOLD,
        ).scale(0.6)
        cont_formula.to_edge(LEFT, buff=0.5).shift(DOWN * 2.5)
        self.play(Write(cont_formula))
        self.wait(0.5)

        # 逐步填充面积，展示 ∫x·f(x)dx 累积
        fill_areas = VGroup()
        x_steps = [i * 0.4 for i in range(15)]  # 从 0 到 5.6
        for xi in x_steps:
            area = axes.get_area(
                curve,
                x_range=[0, xi + 0.4],
                color=BLUE,
                opacity=0.25,
            )
            fill_areas.add(area)

        # 依次展示面积增长
        current_area = None
        for area in fill_areas:
            if current_area is None:
                self.play(FadeIn(area), run_time=0.12)
                current_area = area
            else:
                self.play(Transform(current_area, area), run_time=0.08)
        self.wait(0.3)

        # 在均值 mu=3 处画竖线
        mu_line = axes.get_vertical_line(
            axes.c2p(3.0, normal_pdf(3.0)),
            color=YELLOW,
            stroke_width=5,
        )
        mu_label = MathTex(r"E[X]=3", color=YELLOW).scale(0.55)
        mu_label.next_to(axes.c2p(3.0, 0), DOWN, buff=0.3)
        self.play(Create(mu_line), FadeIn(mu_label))
        self.play(Indicate(mu_line, color=YELLOW, scale_factor=1.1))
        self.wait(0.8)

        # ── 第五幕：总结 ──────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(
                subtitle2, axes, curve, x_label, y_label,
                current_area, mu_line, mu_label, cont_formula,
            ))
        )

        summary_lines = VGroup(
            Text("期望 = 概率加权的平均值", font=CJK).scale(0.58),
            VGroup(
                MathTex(r"E[X] = \sum_i x_i p_i", color=BLUE).scale(0.55),
                Text("（离散）", font=CJK, color=BLUE).scale(0.45),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                MathTex(r"E[X] = \int x \, f(x) \, dx", color=GREEN).scale(0.55),
                Text("（连续）", font=CJK, color=GREEN).scale(0.45),
            ).arrange(RIGHT, buff=0.1),
            Text("直觉：杠杆上的质心 / 分布的平衡支点", font=CJK).scale(0.52),
        ).arrange(DOWN, buff=0.35).shift(DOWN * 0.3)

        for line in summary_lines:
            self.play(FadeIn(line, shift=UP * 0.15), run_time=0.6)

        self.wait(1.5)
        self.play(FadeOut(VGroup(title, summary_lines)))
        self.wait(0.3)
