"""第 2.2 节 · 离散型随机变量与常见分布
展示 B(10,0.3) 分布律直方图，再演示 n→∞, p→0, np=λ=3 时逼近泊松分布的过程。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

import math

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
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
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"


def binom_pmf(n: int, p: float, k: int) -> float:
    """计算二项分布 B(n,p) 在 k 处的概率。"""
    return math.comb(n, k) * (p ** k) * ((1 - p) ** (n - k))


def poisson_pmf(lam: float, k: int) -> float:
    """计算泊松分布 Poisson(λ) 在 k 处的概率。"""
    return (math.exp(-lam) * (lam ** k)) / math.factorial(k)


class DiscreteDistScene(Scene):
    def construct(self):
        # ── 阶段 0：标题 ──────────────────────────────────────────────
        title = (
            Text("离散型随机变量", font=CJK, weight=BOLD)
            .scale(0.75)
            .to_edge(UP, buff=0.3)
        )
        subtitle = (
            Text("二项分布与泊松分布", font=CJK)
            .scale(0.55)
            .next_to(title, DOWN, buff=0.15)
        )
        self.play(Write(title), run_time=1.0)
        self.play(FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(subtitle))

        # ── 阶段 1：显示二项分布公式 ──────────────────────────────────
        formula_label = (
            Text("二项分布公式", font=CJK)
            .scale(0.52)
            .next_to(title, DOWN, buff=0.25)
        )
        formula = MathTex(
            r"P(X=k)=\binom{n}{k}p^{k}(1-p)^{n-k},\quad k=0,1,\ldots,n"
        ).scale(0.65)
        formula.next_to(formula_label, DOWN, buff=0.2)

        param_text = (
            Text("参数：n=10，p=0.3，λ=np=3", font=CJK)
            .scale(0.50)
            .next_to(formula, DOWN, buff=0.2)
        )

        self.play(Write(formula_label))
        self.play(Write(formula))
        self.play(FadeIn(param_text))
        self.wait(1.0)

        # ── 阶段 2：绘制 B(10, 0.3) 直方图 ───────────────────────────
        self.play(FadeOut(VGroup(formula_label, formula, param_text)))

        # 计算概率值
        n_binom, p_binom = 10, 0.3
        binom_probs = [binom_pmf(n_binom, p_binom, k) for k in range(n_binom + 1)]
        max_prob = max(binom_probs)

        # 坐标轴参数
        ax_origin = LEFT * 4.2 + DOWN * 2.2
        bar_width = 0.55
        bar_spacing = 0.65
        scale_y = 5.5  # 概率 → 像素高度的缩放

        # 绘制坐标系辅助线（简单版，不用 Axes 避免复杂定制）
        x_axis = Rectangle(
            width=7.2, height=0.025, color=WHITE, fill_color=WHITE, fill_opacity=1
        ).move_to(ax_origin + RIGHT * 3.6 + UP * 0.012)
        y_axis = Rectangle(
            width=0.025, height=4.2, color=WHITE, fill_color=WHITE, fill_opacity=1
        ).move_to(ax_origin + UP * 2.1 + RIGHT * 0.012)

        # 坐标轴标签
        x_label = MathTex(r"k").scale(0.55).next_to(x_axis, RIGHT, buff=0.1)
        y_label = MathTex(r"P").scale(0.55).next_to(y_axis, UP, buff=0.1)

        hist_title = (
            Text("B(10, 0.3) 分布律直方图", font=CJK, weight=BOLD)
            .scale(0.55)
            .next_to(title, DOWN, buff=0.2)
        )
        self.play(Write(hist_title))
        self.play(Create(x_axis), Create(y_axis), FadeIn(x_label), FadeIn(y_label))

        # 画柱子
        bars = VGroup()
        k_labels = VGroup()
        for k, prob in enumerate(binom_probs):
            bar_h = prob * scale_y
            bar = Rectangle(
                width=bar_width,
                height=max(bar_h, 0.005),
                color=BLUE_D,
                fill_color=BLUE_D,
                fill_opacity=0.8,
            )
            bar_x = ax_origin + RIGHT * (k * bar_spacing + bar_spacing)
            bar.move_to(bar_x + UP * (bar_h / 2))
            bars.add(bar)

            # k 轴标签（只显示偶数减少拥挤）
            if k % 2 == 0:
                lbl = MathTex(str(k)).scale(0.38).next_to(bar, DOWN, buff=0.08)
                k_labels.add(lbl)

        self.play(FadeIn(bars, lag_ratio=0.08), run_time=1.5)
        self.play(FadeIn(k_labels))
        self.wait(0.8)

        # 高亮 k=3（众数）
        peak_bar = bars[3]
        highlight_box = SurroundingRectangle(peak_bar, color=YELLOW, buff=0.05)
        peak_label = (
            Text("k=3 概率最大", font=CJK, color=YELLOW)
            .scale(0.45)
            .next_to(peak_bar, UP, buff=0.12)
        )
        self.play(Create(highlight_box), Write(peak_label))
        self.wait(1.0)
        self.play(FadeOut(highlight_box), FadeOut(peak_label))
        self.wait(0.4)

        # ── 阶段 3：叠加泊松分布 Poisson(λ=3) ────────────────────────
        lam = 3.0
        poisson_probs = [poisson_pmf(lam, k) for k in range(n_binom + 1)]

        # 泊松分布用橙色菱形点标记
        poisson_dots = VGroup()
        poisson_lines = VGroup()
        for k, pprob in enumerate(poisson_probs):
            dot_h = pprob * scale_y
            bar_x = ax_origin + RIGHT * (k * bar_spacing + bar_spacing)
            dot_center = bar_x + UP * dot_h
            dot = (
                Rectangle(width=0.12, height=0.12, color=ORANGE, fill_color=ORANGE, fill_opacity=1)
                .move_to(dot_center)
            )
            poisson_dots.add(dot)

        poisson_legend = (
            Text("泊松分布 Poisson(3)", font=CJK, color=ORANGE)
            .scale(0.45)
            .to_edge(RIGHT, buff=0.3)
            .shift(UP * 0.5)
        )
        binom_legend = (
            Text("二项分布 B(10,0.3)", font=CJK, color=BLUE_D)
            .scale(0.45)
            .next_to(poisson_legend, DOWN, buff=0.18)
        )

        overlay_tip = (
            Text("叠加 Poisson(3)：观察吻合程度", font=CJK, color=ORANGE)
            .scale(0.48)
            .next_to(hist_title, DOWN, buff=0.12)
        )
        self.play(Write(overlay_tip))
        self.play(
            FadeIn(poisson_dots, lag_ratio=0.08),
            FadeIn(poisson_legend),
            FadeIn(binom_legend),
            run_time=1.2,
        )
        self.wait(1.2)

        # ── 阶段 4：n→∞ 收敛说明 ─────────────────────────────────────
        self.play(
            FadeOut(VGroup(bars, k_labels, poisson_dots, poisson_legend, binom_legend,
                           overlay_tip, x_axis, y_axis, x_label, y_label))
        )

        convergence_title = (
            Text("极限定理：np=λ 固定，n→∞", font=CJK, weight=BOLD)
            .scale(0.58)
            .next_to(title, DOWN, buff=0.25)
        )
        self.play(Transform(hist_title, convergence_title))

        limit_formula = MathTex(
            r"\lim_{n\to\infty}\binom{n}{k}p^{k}(1-p)^{n-k}"
            r"=\frac{\lambda^{k}e^{-\lambda}}{k!}"
        ).scale(0.70)
        limit_formula.shift(UP * 0.3)

        condition = MathTex(r"n\to\infty,\; p\to 0,\; np=\lambda\text{ (fixed)}").scale(0.55)
        condition.next_to(limit_formula, DOWN, buff=0.25)

        self.play(Write(limit_formula))
        self.play(FadeIn(condition))
        self.wait(1.5)

        # ── 阶段 5：对比不同 n 的逼近效果 ────────────────────────────
        self.play(FadeOut(VGroup(limit_formula, condition)))

        compare_label = (
            Text("不同 n 下的分布（np=3 不变）", font=CJK)
            .scale(0.52)
            .next_to(hist_title, DOWN, buff=0.2)
        )
        self.play(Write(compare_label))

        # 比较 n=10, 30, 100 与泊松(3) 的最大差距
        comparison_lines = VGroup()
        n_values = [10, 30, 100]
        colors = [BLUE, GREEN, RED]
        k_range = list(range(11))

        row_y = [0.8, 0.0, -0.8]
        for idx, (n_val, col, ry) in enumerate(zip(n_values, colors, row_y)):
            p_val = lam / n_val
            bp = [binom_pmf(n_val, p_val, k) for k in k_range]
            pp = [poisson_pmf(lam, k) for k in k_range]
            max_diff = max(abs(b - p) for b, p in zip(bp, pp))

            row_text = Text(
                f"n={n_val:3d}  p=3/{n_val}  最大误差={max_diff:.4f}",
                font=CJK,
                color=col,
            ).scale(0.46)
            row_text.move_to(UP * ry)
            comparison_lines.add(row_text)

        self.play(FadeIn(comparison_lines, lag_ratio=0.3), run_time=1.2)
        self.wait(1.5)

        # ── 阶段 6：小结 ──────────────────────────────────────────────
        self.play(FadeOut(VGroup(comparison_lines, compare_label)))

        summary_items = VGroup(
            Text("1. B(n,p) 描述 n 次独立试验中成功次数的分布", font=CJK).scale(0.48),
            Text("2. 当 n 大、p 小、np=λ 时，二项分布≈泊松分布", font=CJK).scale(0.48),
            Text("3. 泊松分布适用于稀有事件计数（客流、故障、放射）", font=CJK).scale(0.48),
        )
        summary_items.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary_items.shift(DOWN * 0.2)

        summary_title = (
            Text("本节小结", font=CJK, weight=BOLD, color=YELLOW)
            .scale(0.55)
            .next_to(hist_title, DOWN, buff=0.2)
        )
        self.play(Write(summary_title))
        self.play(FadeIn(summary_items, lag_ratio=0.25), run_time=1.5)
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, hist_title, summary_title, summary_items)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "DiscreteDistScene",
        "id": "ch02-2.2-discrete-dist",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "二项分布与泊松分布",
        "description": "通过 B(10,0.3) 直方图与 Poisson(3) 叠加对比，直观展示 np=λ 固定时二项分布收敛到泊松分布的极限过程。",
    },
]
