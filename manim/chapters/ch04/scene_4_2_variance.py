"""第 4.2 节 · 方差与标准差 —— 演示 D(X) = E[(X-mu)^2]。

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
    Create,
    DashedLine,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)
import numpy as np

CJK = "Microsoft YaHei"


def normal_pdf(x, mu, sigma):
    return np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))


class VarianceScene(Scene):
    def construct(self):
        # ── 幕一：标题 ──────────────────────────────────────────────────────
        title = Text("方差与标准差", font=CJK, weight=BOLD).scale(0.75).to_edge(UP)
        self.play(Write(title))
        self.wait(0.4)

        # ── 幕二：方差定义公式 ─────────────────────────────────────────────
        formula_label = Text("方差定义：", font=CJK).scale(0.55)
        formula = MathTex(
            r"D(X) = E\!\left[(X - \mu)^2\right]",
            color=YELLOW,
        ).scale(0.95)
        formula_group = VGroup(formula_label, formula).arrange(RIGHT, buff=0.25)
        formula_group.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(formula_label), Write(formula))
        self.wait(0.6)

        # ── 幕三：建立坐标轴（均值 μ=0，σ=1 的正态曲线）─────────────────
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.55, 0.1],
            x_length=8,
            y_length=3.2,
            axis_config={"color": WHITE},
        )
        axes.shift(DOWN * 1.1)

        x_label = MathTex(r"x").scale(0.65).next_to(axes.x_axis.get_right(), RIGHT, buff=0.15)
        y_label = MathTex(r"f(x)").scale(0.65).next_to(axes.y_axis.get_top(), UP, buff=0.1)

        curve = axes.plot(
            lambda x: normal_pdf(x, 0, 1),
            x_range=[-4, 4],
            color=BLUE_D,
            stroke_width=3,
        )

        self.play(Create(axes), FadeIn(x_label, y_label))
        self.play(Create(curve))
        self.wait(0.3)

        # 均值虚线
        mu_line = DashedLine(
            start=axes.c2p(0, 0),
            end=axes.c2p(0, normal_pdf(0, 0, 1)),
            color=GREEN,
            stroke_width=2,
        )
        mu_label = MathTex(r"\mu = 0", color=GREEN).scale(0.6)
        mu_label.next_to(axes.c2p(0, 0), DOWN, buff=0.18)

        self.play(Create(mu_line), FadeIn(mu_label))
        self.wait(0.4)

        # ── 幕四：在若干 x 点画"偏差平方"小矩形 ──────────────────────────
        hint_text = Text("每个点到均值的偏差平方 × 概率密度 = 面积贡献", font=CJK).scale(0.38)
        hint_text.next_to(axes, DOWN, buff=0.28)
        self.play(FadeIn(hint_text))

        sample_xs = [-2.0, -1.2, 1.0, 1.8]
        rect_group = VGroup()
        dev_lines = VGroup()
        dev_labels = VGroup()

        for x_val in sample_xs:
            dev = x_val - 0  # μ = 0
            dev_sq = dev ** 2
            pdf_val = normal_pdf(x_val, 0, 1)
            rect_height = dev_sq * pdf_val  # weighted contribution (scaled for visual)
            rect_width = 0.38

            rect = Rectangle(
                width=rect_width,
                height=axes.y_axis.unit_size * rect_height * 6,  # visual scale
                fill_color=ORANGE,
                fill_opacity=0.55,
                stroke_color=GOLD,
                stroke_width=1.5,
            )
            rect.align_to(axes.c2p(x_val, 0), DOWN)
            rect.move_to(axes.c2p(x_val, 0), aligned_edge=DOWN)

            # 偏差指示线（从曲线点到均值轴）
            dev_line = DashedLine(
                start=axes.c2p(0, pdf_val * 0.5),
                end=axes.c2p(x_val, pdf_val * 0.5),
                color=RED,
                stroke_width=1.5,
            )
            rect_group.add(rect)
            dev_lines.add(dev_line)

        self.play(FadeIn(rect_group, lag_ratio=0.25), Create(dev_lines))
        self.wait(0.5)

        sum_label = MathTex(
            r"D(X) = \sum_i (x_i - \mu)^2 \cdot f(x_i) \,\Delta x",
            color=YELLOW,
        ).scale(0.6)
        sum_label.next_to(hint_text, DOWN, buff=0.22)
        self.play(Write(sum_label))
        self.wait(0.8)

        # ── 清场，进入对比幕 ───────────────────────────────────────────────
        clear_group = VGroup(
            rect_group, dev_lines, hint_text, sum_label,
            mu_line, mu_label, curve, axes, x_label, y_label,
        )
        self.play(FadeOut(clear_group))
        self.wait(0.2)

        # ── 幕五：并列展示 σ=0.5 与 σ=2 的钟形 ───────────────────────────
        compare_title = Text("方差大小对比：分布宽窄", font=CJK).scale(0.6)
        compare_title.next_to(formula_group, DOWN, buff=0.4)
        self.play(Write(compare_title))

        # 左图：σ=0.5（低方差）
        ax_left = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.9, 0.2],
            x_length=4.8,
            y_length=2.6,
            axis_config={"color": WHITE},
        ).shift(LEFT * 3.2 + DOWN * 1.0)

        label_low = Text("低方差", font=CJK, color=BLUE).scale(0.52)
        sigma_low = MathTex(r"\sigma = 0.5", color=BLUE).scale(0.55)
        VGroup(label_low, sigma_low).arrange(RIGHT, buff=0.15).next_to(ax_left, UP, buff=0.15)

        curve_low = ax_left.plot(
            lambda x: normal_pdf(x, 0, 0.5),
            x_range=[-3, 3],
            color=BLUE,
            stroke_width=3,
        )

        mu_line_low = DashedLine(
            start=ax_left.c2p(0, 0),
            end=ax_left.c2p(0, normal_pdf(0, 0, 0.5)),
            color=GREEN,
            stroke_width=2,
        )

        # 右图：σ=2（高方差）
        ax_right = Axes(
            x_range=[-6, 6, 1],
            y_range=[0, 0.28, 0.1],
            x_length=4.8,
            y_length=2.6,
            axis_config={"color": WHITE},
        ).shift(RIGHT * 3.2 + DOWN * 1.0)

        label_high = Text("高方差", font=CJK, color=RED).scale(0.52)
        sigma_high = MathTex(r"\sigma = 2", color=RED).scale(0.55)
        VGroup(label_high, sigma_high).arrange(RIGHT, buff=0.15).next_to(ax_right, UP, buff=0.15)

        curve_high = ax_right.plot(
            lambda x: normal_pdf(x, 0, 2),
            x_range=[-6, 6],
            color=RED,
            stroke_width=3,
        )

        mu_line_high = DashedLine(
            start=ax_right.c2p(0, 0),
            end=ax_right.c2p(0, normal_pdf(0, 0, 2)),
            color=GREEN,
            stroke_width=2,
        )

        # 分别带入显示
        self.play(
            Create(ax_left),
            FadeIn(label_low, sigma_low),
        )
        self.play(Create(curve_low), Create(mu_line_low))
        self.wait(0.3)

        self.play(
            Create(ax_right),
            FadeIn(label_high, sigma_high),
        )
        self.play(Create(curve_high), Create(mu_line_high))
        self.wait(0.5)

        # 高亮对比说明
        insight_cn = Text("分布越窄 → 方差越小；分布越宽 → 方差越大", font=CJK, color=YELLOW).scale(0.48)
        insight_cn.to_edge(DOWN, buff=0.35)
        self.play(FadeIn(insight_cn))
        self.wait(1.0)

        # ── 幕六：方差与标准差关系 ────────────────────────────────────────
        self.play(FadeOut(VGroup(
            ax_left, ax_right,
            label_low, sigma_low,
            label_high, sigma_high,
            curve_low, curve_high,
            mu_line_low, mu_line_high,
            compare_title, insight_cn,
        )))
        self.wait(0.2)

        std_label = Text("标准差：", font=CJK).scale(0.55)
        std_formula = MathTex(
            r"\sigma = \sqrt{D(X)}",
            color=GOLD,
        ).scale(0.9)
        std_group = VGroup(std_label, std_formula).arrange(RIGHT, buff=0.25)
        std_group.next_to(formula_group, DOWN, buff=0.5)

        self.play(FadeIn(std_label), Write(std_formula))
        self.wait(0.5)

        property_text = Text("标准差与 X 量纲相同，更直观度量离散程度", font=CJK).scale(0.48)
        property_text.next_to(std_group, DOWN, buff=0.4)
        self.play(FadeIn(property_text))
        self.wait(0.5)

        shortcut_label = Text("计算公式（常用）：", font=CJK).scale(0.5)
        shortcut = MathTex(
            r"D(X) = E(X^2) - [E(X)]^2",
            color=YELLOW,
        ).scale(0.85)
        shortcut_group = VGroup(shortcut_label, shortcut).arrange(RIGHT, buff=0.2)
        shortcut_group.next_to(property_text, DOWN, buff=0.4)
        self.play(FadeIn(shortcut_label), Write(shortcut))
        self.wait(1.2)

        # 收尾淡出
        self.play(FadeOut(VGroup(
            title, formula_group,
            std_group, property_text, shortcut_group,
        )))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "VarianceScene",
        "id": "ch04-4.2-variance",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "方差：偏离均值的平均平方",
        "description": "通过正态分布 PDF 直观演示方差 D(X)=E[(X-mu)^2] 的计算过程，并对比高低方差分布的宽窄形态。",
    },
]
