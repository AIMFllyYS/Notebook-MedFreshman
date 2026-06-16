"""第 3.5 节 · 两个随机变量函数的分布 —— 卷积：U(0,1)+U(0,1) 得三角分布，正态+正态得正态。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    ORIGIN,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    NumberPlane,
    Scene,
    Text,
    Indicate,
    Transform,
    VGroup,
    Write,
    Arrow,
    Line,
    Rectangle,
    Polygon,
    always_redraw,
    ValueTracker,
    FunctionGraph,
    AnimationGroup,
    LaggedStart,
    GrowFromPoint,
    GrowFromEdge,
    SurroundingRectangle,
)
import numpy as np

CJK = "Microsoft YaHei"


class SumDistScene(Scene):
    def construct(self):
        # ── 幕 0：标题 ──────────────────────────────────────────────────
        title = Text("两随机变量之和的分布", font=CJK, weight=BOLD).scale(0.75)
        subtitle = Text("卷积公式", font=CJK, color=BLUE).scale(0.52)
        subtitle.next_to(title, DOWN, buff=0.2)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.8)
        self.play(FadeOut(VGroup(title, subtitle)))

        # ── 幕 1：两个均匀分布的 PDF ─────────────────────────────────────
        act1_title = Text("第一步：两个均匀分布 X, Y ~ U(0,1)", font=CJK, weight=BOLD).scale(0.52)
        act1_title.to_edge(UP, buff=0.3)
        self.play(Write(act1_title))

        ax = Axes(
            x_range=[-0.3, 2.5, 0.5],
            y_range=[-0.1, 1.6, 0.5],
            x_length=7.5,
            y_length=3.2,
            axis_config={"include_numbers": True, "font_size": 20},
        ).shift(DOWN * 0.6)

        ax_label_x = MathTex(r"x", font_size=24).next_to(ax.get_x_axis(), RIGHT, buff=0.15)
        ax_label_y = MathTex(r"f(x)", font_size=24).next_to(ax.get_y_axis(), UP, buff=0.1)

        self.play(Create(ax), FadeIn(ax_label_x), FadeIn(ax_label_y))

        # X ~ U(0,1) 的 PDF：区间 [0,1] 上高度为 1 的矩形
        rect_X = Polygon(
            ax.c2p(0, 0), ax.c2p(1, 0), ax.c2p(1, 1), ax.c2p(0, 1),
            color=BLUE, fill_color=BLUE, fill_opacity=0.35, stroke_width=2.5,
        )
        label_X = MathTex(r"f_X(x)=1", font_size=26, color=BLUE)
        label_X.next_to(ax.c2p(0.5, 1), UP, buff=0.1)

        self.play(FadeIn(rect_X), Write(label_X))

        text_X = Text("X ~ U(0,1)", font=CJK, color=BLUE).scale(0.42)
        text_X.next_to(label_X, UP, buff=0.1)
        self.play(FadeIn(text_X))
        self.wait(0.8)

        # Y ~ U(0,1) 的 PDF：同样的矩形，用虚线区分
        rect_Y = Polygon(
            ax.c2p(0, 0), ax.c2p(1, 0), ax.c2p(1, 1), ax.c2p(0, 1),
            color=GREEN, fill_color=GREEN, fill_opacity=0.25, stroke_width=2.5,
        )
        label_Y = MathTex(r"f_Y(y)=1", font_size=26, color=GREEN)
        label_Y.next_to(ax.c2p(0.5, 1), UP, buff=0.6)

        text_Y = Text("Y ~ U(0,1)，独立", font=CJK, color=GREEN).scale(0.42)
        text_Y.next_to(label_Y, UP, buff=0.1)

        self.play(FadeIn(rect_Y), Write(label_Y), FadeIn(text_Y))
        self.wait(0.8)

        # 卷积公式
        conv_formula = MathTex(
            r"f_Z(z) = \int_{-\infty}^{+\infty} f_X(x)\, f_Y(z-x)\,dx",
            font_size=28,
        )
        conv_formula.to_edge(DOWN, buff=0.25)
        box = SurroundingRectangle(conv_formula, color=YELLOW, buff=0.12)
        self.play(Write(conv_formula), Create(box))
        self.wait(1.0)

        # 清场进入幕 2
        self.play(FadeOut(VGroup(
            act1_title, ax, ax_label_x, ax_label_y,
            rect_X, label_X, text_X,
            rect_Y, label_Y, text_Y,
            conv_formula, box,
        )))

        # ── 幕 2：卷积结果——三角形 PDF ───────────────────────────────────
        act2_title = Text("第二步：Z = X+Y 的分布（卷积）", font=CJK, weight=BOLD).scale(0.52)
        act2_title.to_edge(UP, buff=0.3)
        self.play(Write(act2_title))

        ax2 = Axes(
            x_range=[-0.2, 2.5, 0.5],
            y_range=[-0.1, 1.3, 0.5],
            x_length=7.5,
            y_length=3.5,
            axis_config={"include_numbers": True, "font_size": 20},
        ).shift(DOWN * 0.5)

        ax2_lx = MathTex(r"z", font_size=24).next_to(ax2.get_x_axis(), RIGHT, buff=0.15)
        ax2_ly = MathTex(r"f_Z(z)", font_size=24).next_to(ax2.get_y_axis(), UP, buff=0.1)

        self.play(Create(ax2), FadeIn(ax2_lx), FadeIn(ax2_ly))

        # 三角形 PDF（峰值在 z=1，高度为 1）
        tri = Polygon(
            ax2.c2p(0, 0), ax2.c2p(1, 1), ax2.c2p(2, 0),
            color=ORANGE, fill_color=ORANGE, fill_opacity=0.45, stroke_width=3,
        )

        # 分段动画：先画左半段，再画右半段
        left_tri = Polygon(
            ax2.c2p(0, 0), ax2.c2p(1, 1), ax2.c2p(1, 0),
            color=ORANGE, fill_color=ORANGE, fill_opacity=0.45, stroke_width=3,
        )
        right_tri = Polygon(
            ax2.c2p(1, 0), ax2.c2p(1, 1), ax2.c2p(2, 0),
            color=ORANGE, fill_color=ORANGE, fill_opacity=0.35, stroke_width=3,
        )

        seg_label_left = MathTex(r"f_Z(z) = z,\quad 0 \le z \le 1", font_size=22, color=ORANGE)
        seg_label_left.next_to(ax2.c2p(0.5, 0.5), LEFT, buff=0.1)

        seg_label_right = MathTex(r"f_Z(z) = 2-z,\quad 1 < z \le 2", font_size=22, color=ORANGE)
        seg_label_right.next_to(ax2.c2p(1.5, 0.5), RIGHT, buff=0.08)

        self.play(FadeIn(left_tri), Write(seg_label_left))
        self.wait(0.4)
        self.play(FadeIn(right_tri), Write(seg_label_right))

        # 高亮峰值
        peak_dot = Dot(ax2.c2p(1, 1), color=YELLOW, radius=0.1)
        peak_label = MathTex(r"(1,\,1)", font_size=22, color=YELLOW)
        peak_label.next_to(ax2.c2p(1, 1), UP + RIGHT, buff=0.1)
        self.play(FadeIn(peak_dot), FadeIn(peak_label))

        result_text = Text("三角分布（对称，峰在 z=1）", font=CJK, color=YELLOW).scale(0.42)
        result_text.to_edge(DOWN, buff=0.3)
        self.play(Write(result_text))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            act2_title, ax2, ax2_lx, ax2_ly,
            left_tri, right_tri,
            seg_label_left, seg_label_right,
            peak_dot, peak_label, result_text,
        )))

        # ── 幕 3：正态 + 正态 = 正态 ─────────────────────────────────────
        act3_title = Text("第三步：正态 + 正态 = 正态", font=CJK, weight=BOLD).scale(0.52)
        act3_title.to_edge(UP, buff=0.3)
        self.play(Write(act3_title))

        ax3 = Axes(
            x_range=[-5, 9, 2],
            y_range=[-0.02, 0.5, 0.1],
            x_length=8,
            y_length=3.5,
            axis_config={"include_numbers": True, "font_size": 18},
        ).shift(DOWN * 0.5)

        ax3_lx = MathTex(r"x", font_size=22).next_to(ax3.get_x_axis(), RIGHT, buff=0.15)
        ax3_ly = MathTex(r"f(x)", font_size=22).next_to(ax3.get_y_axis(), UP, buff=0.1)

        self.play(Create(ax3), FadeIn(ax3_lx), FadeIn(ax3_ly))

        # 正态分布辅助函数
        def normal_pdf(x, mu, sigma):
            return np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))

        # X ~ N(1, 1)
        mu1, s1 = 1.0, 1.0
        graph_X = ax3.plot(
            lambda x: normal_pdf(x, mu1, s1),
            x_range=[-3.5, 5.5],
            color=BLUE,
            stroke_width=3,
        )
        label_gX = MathTex(r"X \sim \mathcal{N}(1,\,1^2)", font_size=24, color=BLUE)
        label_gX.next_to(ax3.c2p(mu1, normal_pdf(mu1, mu1, s1)), UP + LEFT, buff=0.15)

        # Y ~ N(2, 1.5²)
        mu2, s2 = 2.0, 1.5
        graph_Y = ax3.plot(
            lambda x: normal_pdf(x, mu2, s2),
            x_range=[-3, 7],
            color=GREEN,
            stroke_width=3,
        )
        label_gY = MathTex(r"Y \sim \mathcal{N}(2,\,1.5^2)", font_size=24, color=GREEN)
        label_gY.next_to(ax3.c2p(mu2 + 1, normal_pdf(mu2, mu2, s2) * 0.7), RIGHT, buff=0.1)

        self.play(Create(graph_X), Write(label_gX))
        self.wait(0.4)
        self.play(Create(graph_Y), Write(label_gY))
        self.wait(0.6)

        # Z = X+Y ~ N(3, 1²+1.5²)
        mu_z = mu1 + mu2          # = 3
        var_z = s1**2 + s2**2     # = 1 + 2.25 = 3.25
        s_z = np.sqrt(var_z)      # ≈ 1.803

        graph_Z = ax3.plot(
            lambda x: normal_pdf(x, mu_z, s_z),
            x_range=[-2, 8],
            color=ORANGE,
            stroke_width=4,
        )
        label_gZ = MathTex(r"Z \sim \mathcal{N}(3,\,3.25)", font_size=24, color=ORANGE)
        label_gZ.next_to(ax3.c2p(mu_z + 0.5, normal_pdf(mu_z, mu_z, s_z) * 0.85), RIGHT, buff=0.05)

        self.play(Create(graph_Z), Write(label_gZ))

        # 标注核心规律
        rule_mu = MathTex(r"\mu_Z = \mu_X + \mu_Y", font_size=26, color=YELLOW)
        rule_sigma = MathTex(r"\sigma_Z^2 = \sigma_X^2 + \sigma_Y^2", font_size=26, color=YELLOW)
        rule_mu.to_edge(DOWN, buff=0.6)
        rule_sigma.next_to(rule_mu, DOWN, buff=0.18)

        box_mu = SurroundingRectangle(rule_mu, color=YELLOW, buff=0.1)
        box_sigma = SurroundingRectangle(rule_sigma, color=YELLOW, buff=0.1)

        self.play(Write(rule_mu), Create(box_mu))
        self.play(Write(rule_sigma), Create(box_sigma))
        self.wait(1.0)

        self.play(Indicate(graph_Z, color=ORANGE, scale_factor=1.05))
        self.wait(0.8)

        self.play(FadeOut(VGroup(
            act3_title, ax3, ax3_lx, ax3_ly,
            graph_X, label_gX,
            graph_Y, label_gY,
            graph_Z, label_gZ,
            rule_mu, box_mu,
            rule_sigma, box_sigma,
        )))

        # ── 幕 4：小结 ────────────────────────────────────────────────────
        summary_title = Text("小结", font=CJK, weight=BOLD).scale(0.7).to_edge(UP, buff=0.5)
        self.play(Write(summary_title))

        lines = VGroup(
            Text("1. Z = X+Y 的 PDF 由卷积公式给出", font=CJK).scale(0.46),
            Text("2. U(0,1)+U(0,1) => 三角分布（折线形 PDF）", font=CJK).scale(0.46),
            Text("3. 正态+正态 => 正态，均值相加，方差相加", font=CJK).scale(0.46),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.38)
        lines.move_to(ORIGIN)

        for line in lines:
            self.play(FadeIn(line, shift=RIGHT * 0.3))
            self.wait(0.5)

        self.wait(1.5)
        self.play(FadeOut(VGroup(summary_title, lines)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "SumDistScene",
        "id": "ch03-3.5-sum-dist",
        "chapterId": "ch03",
        "sectionId": "3.5",
        "title": "两随机变量之和的分布",
        "description": "通过卷积积分演示 U(0,1)+U(0,1) 得三角分布，以及正态+正态仍为正态（均值相加、方差相加）。",
    },
]
