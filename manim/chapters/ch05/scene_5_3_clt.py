"""第 5.3 节 · 中心极限定理 —— 均匀分布叠加逐步收敛到正态钟形曲线。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

import numpy as np

from manim import (
    BOLD,
    DOWN,
    LEFT,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    GREEN,
    BLUE,
    RED,
    BLACK,
    Axes,
    Create,
    FadeIn,
    FadeOut,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    FunctionGraph,
    Line,
    DashedVMobject,
    ReplacementTransform,
    AnimationGroup,
    ORANGE,
    Polygon,
)

CJK = "Microsoft YaHei"


def irwin_hall_pdf(n):
    """Return a callable PDF for the sum of n Uniform(0,1) variables (Irwin-Hall).
    Shifted and scaled to have mean=0, std=1 for display purposes.
    """
    from math import factorial

    def pdf_raw(x):
        """Irwin-Hall PDF for sum of n U(0,1): domain [0,n]."""
        # Clamp x to valid domain
        if x < 0 or x > n:
            return 0.0
        total = 0.0
        for k in range(int(x) + 1):
            sign = (-1) ** k
            binom = factorial(n) / (factorial(k) * factorial(n - k))
            total += sign * binom * (x - k) ** (n - 1)
        total /= factorial(n - 1)
        return max(total, 0.0)

    # The sum S_n has mean = n/2, variance = n/12
    mean = n / 2.0
    std = (n / 12.0) ** 0.5

    def pdf_standardized(z):
        """PDF of (S_n - mean)/std evaluated at z."""
        x = z * std + mean
        return pdf_raw(x) * std

    return pdf_standardized


def normal_pdf(z):
    """Standard normal PDF."""
    return np.exp(-0.5 * z * z) / ((2 * np.pi) ** 0.5)


class CLTScene(Scene):
    def construct(self):
        # ── Title ──────────────────────────────────────────────────────────
        title = Text("中心极限定理", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        subtitle = Text(
            "任何分布叠加后都趋近正态分布", font=CJK
        ).scale(0.42).next_to(title, DOWN, buff=0.1)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.4)

        # ── Axes ───────────────────────────────────────────────────────────
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.7, 0.1],
            x_length=9,
            y_length=4.2,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 0.55)

        x_label = Text("z = (Sₙ - nμ) / (σ√n)", font=CJK, font_size=28)
        x_label.next_to(axes.get_x_axis(), DOWN, buff=0.22)
        y_label = Text("f(z)", font=CJK, font_size=28)
        y_label.next_to(axes.get_y_axis(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.wait(0.3)

        # ── Helper: build histogram bars for n uniform samples ──────────────
        def make_histogram(n_val, bar_color, num_bars=40):
            """Return a VGroup of Rectangle bars approximating the Irwin-Hall PDF."""
            pdf = irwin_hall_pdf(n_val)
            z_min, z_max = -3.8, 3.8
            dz = (z_max - z_min) / num_bars
            bars = VGroup()
            for i in range(num_bars):
                z_left = z_min + i * dz
                z_mid = z_left + dz / 2
                height_val = pdf(z_mid) * dz  # approx probability mass
                # Convert height from probability to axis units
                bar_h = axes.y_axis.n2p(height_val)[1] - axes.y_axis.n2p(0)[1]
                bar_w = axes.x_axis.n2p(z_left + dz)[0] - axes.x_axis.n2p(z_left)[0]
                bar = Rectangle(
                    width=abs(bar_w),
                    height=max(bar_h, 0.001),
                    color=bar_color,
                    fill_color=bar_color,
                    fill_opacity=0.55,
                    stroke_width=0.6,
                )
                bar.align_to(axes.c2p(z_left, 0), LEFT + DOWN)
                bars.add(bar)
            return bars

        # ── Helper: build dashed normal curve ──────────────────────────────
        def make_normal_curve():
            curve = axes.plot(
                lambda z: normal_pdf(z),
                x_range=[-3.8, 3.8, 0.05],
                color=BLACK,
                stroke_width=2.5,
            )
            dashed = DashedVMobject(curve, num_dashes=55, dashed_ratio=0.6)
            return dashed

        # ── Step labels and n-indicator ─────────────────────────────────────
        cases = [
            (1, BLUE,   "n=1  (均匀分布)",   "矩形"),
            (2, GREEN,  "n=2  (三角形)",      "三角形"),
            (5, ORANGE, "n=5  (开始圆弧)",    "趋近正态"),
            (30, RED,   "n=30 (接近正态)",    "几乎重合"),
        ]

        n_label = None
        shape_label = None
        current_bars = None

        normal_curve = make_normal_curve()
        normal_curve_copy = None  # shown from n=5 onward

        for step_idx, (n_val, color, n_text, shape_text) in enumerate(cases):
            # Build histogram bars
            bars = make_histogram(n_val, color)

            # n-value label (top-left)
            new_n_label = Text(n_text, font=CJK, color=color).scale(0.48)
            new_n_label.to_corner(UP + LEFT).shift(DOWN * 1.25 + RIGHT * 0.35)

            new_shape_label = Text(shape_text, font=CJK, color=color).scale(0.42)
            new_shape_label.next_to(new_n_label, DOWN, buff=0.12)

            if step_idx == 0:
                # First frame: just fade in
                self.play(FadeIn(bars), Write(new_n_label), Write(new_shape_label))
            else:
                anims = [ReplacementTransform(current_bars, bars),
                         FadeOut(n_label),
                         FadeIn(new_n_label),
                         FadeOut(shape_label),
                         FadeIn(new_shape_label)]
                # From n=5, show the dashed normal curve
                if step_idx == 2:
                    normal_curve_copy = make_normal_curve()
                    anims.append(Create(normal_curve_copy))
                self.play(*anims, run_time=1.4)

            current_bars = bars
            n_label = new_n_label
            shape_label = new_shape_label

            # Hold on final step longer
            wait_time = 2.2 if step_idx == len(cases) - 1 else 1.0
            self.wait(wait_time)

        # ── Final annotation: CLT formula ──────────────────────────────────
        formula_box_bg = Rectangle(
            width=6.6, height=1.05,
            fill_color="#1a1a2e",
            fill_opacity=0.88,
            stroke_color=YELLOW,
            stroke_width=2,
        ).to_edge(DOWN, buff=0.22)

        clt_formula = Text(
            "(X̄ₙ - μ) / (σ/√n)  →(d)→  N(0, 1)",
            font=CJK,
            font_size=36,
        )
        clt_formula.next_to(formula_box_bg, UP * 0, buff=0)
        clt_formula.move_to(formula_box_bg.get_center())

        caption_clt = Text(
            "标准化样本均值依分布收敛到标准正态", font=CJK
        ).scale(0.38).next_to(formula_box_bg, UP, buff=0.08)

        self.play(
            FadeIn(formula_box_bg),
            Write(clt_formula),
            run_time=1.2,
        )
        self.play(FadeIn(caption_clt))
        self.wait(2.5)

        # ── Emphasize overlap: n=30 bars + normal curve ─────────────────────
        highlight_text = Text(
            "n=30 时直方图与正态曲线几乎完全重合", font=CJK, color=YELLOW
        ).scale(0.42)
        highlight_text.to_corner(UP + RIGHT).shift(DOWN * 1.25 + LEFT * 0.3)
        self.play(FadeIn(highlight_text))
        self.wait(1.8)

        # ── Fade out everything gracefully ─────────────────────────────────
        all_objects = VGroup(
            axes, x_label, y_label,
            current_bars, n_label, shape_label,
            formula_box_bg, clt_formula, caption_clt,
            highlight_text,
        )
        if normal_curve_copy is not None:
            all_objects.add(normal_curve_copy)

        self.play(FadeOut(all_objects), FadeOut(subtitle), run_time=1.2)

        # ── Closing summary ────────────────────────────────────────────────
        summary_title = Text("中心极限定理", font=CJK, weight=BOLD, color=YELLOW).scale(0.68)
        summary_title.move_to(UP * 1.0)

        line1 = Text("无论原始分布是什么形状，", font=CJK).scale(0.5)
        line2 = Text("独立同分布样本的均值（标准化后）", font=CJK).scale(0.5)
        line3 = Text("都趋近标准正态分布  N(0,1)", font=CJK).scale(0.5)
        line1.next_to(summary_title, DOWN, buff=0.35)
        line2.next_to(line1, DOWN, buff=0.18)
        line3.next_to(line2, DOWN, buff=0.18)

        summary_formula = Text(
            "n → ∞  ⟹  (X̄ₙ - μ)/(σ/√n) ~ N(0,1)",
            font=CJK,
            font_size=34,
        )
        summary_formula.next_to(line3, DOWN, buff=0.38)

        self.play(FadeIn(summary_title))
        self.play(FadeIn(line1), FadeIn(line2), FadeIn(line3))
        self.play(Write(summary_formula))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, summary_title, line1, line2, line3, summary_formula)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "CLTScene",
        "id": "ch05-5.3-clt",
        "chapterId": "ch05",
        "sectionId": "5.3",
        "title": "中心极限定理：任何分布加起来都变正态",
        "description": "演示均匀分布叠加 n 个样本后，标准化直方图从矩形→三角形→逐步收敛到正态钟形曲线，直观揭示中心极限定理。",
    },
]
