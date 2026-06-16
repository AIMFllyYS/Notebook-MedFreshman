"""第 6.2 节 · 三大抽样分布：χ²、t、F

动画分三幕：
  第一幕：从标准正态 Z 出发，构造 χ²(n) 分布，展示 n=1,3,10 的 PDF 形状变化。
  第二幕：t 分布构造逻辑，n 增大时趋近标准正态，对比 t(1)、t(5)、N(0,1)。
  第三幕：F 分布构造逻辑，PDF 形状右偏。

中文文字用 Text（Microsoft YaHei）；数学符号用 MathTex（LaTeX）。
MathTex 内严禁中文或全角标点。
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
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    DecimalNumber,
    always_redraw,
    Line,
    DashedLine,
    Rectangle,
    RoundedRectangle,
)
import numpy as np

CJK = "Microsoft YaHei"

# ─────────────────────────────────────────────
#  PDF 函数（纯 numpy，避免 scipy 依赖）
# ─────────────────────────────────────────────

def gamma_func(n):
    """Gamma(n) for positive integer or half-integer n via Lanczos-free recursion."""
    if n == 0.5:
        return np.sqrt(np.pi)
    if n == 1.0:
        return 1.0
    if n > 1:
        return (n - 1) * gamma_func(n - 1)
    return gamma_func(n + 1) / n


def chi2_pdf(x, k):
    """χ²(k) PDF at x > 0."""
    if x <= 0:
        return 0.0
    k2 = k / 2.0
    coeff = 1.0 / (2 ** k2 * gamma_func(k2))
    return coeff * (x ** (k2 - 1)) * np.exp(-x / 2.0)


def t_pdf(x, nu):
    """t(nu) PDF."""
    nu2 = (nu + 1) / 2.0
    coeff = gamma_func(nu2) / (np.sqrt(nu * np.pi) * gamma_func(nu / 2.0))
    return coeff * (1 + x ** 2 / nu) ** (-nu2)


def norm_pdf(x):
    """Standard normal PDF."""
    return np.exp(-0.5 * x ** 2) / np.sqrt(2 * np.pi)


def f_pdf(x, d1, d2):
    """F(d1, d2) PDF at x > 0."""
    if x <= 0:
        return 0.0
    a = d1 / 2.0
    b = d2 / 2.0
    coeff = (
        gamma_func(a + b)
        / (gamma_func(a) * gamma_func(b))
        * (d1 / d2) ** a
    )
    return coeff * x ** (a - 1) * (1 + d1 * x / d2) ** (-(a + b))


# ─────────────────────────────────────────────
#  场景
# ─────────────────────────────────────────────

class ThreeDistScene(Scene):
    def construct(self):
        self._act1_chi2()
        self._act2_t()
        self._act3_f()

    # ══════════════════════════════════════════
    #  第一幕：χ² 分布
    # ══════════════════════════════════════════
    def _act1_chi2(self):
        # ── 标题 ──
        title = Text("第一幕：χ² 分布的构造", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 构造公式 ──
        form1 = MathTex(r"Z \sim N(0,1)").scale(0.75)
        form2 = MathTex(r"Z^2 \sim \chi^2(1)").scale(0.75)
        form3 = MathTex(
            r"\chi^2(n) = Z_1^2 + Z_2^2 + \cdots + Z_n^2"
        ).scale(0.72)

        form1.next_to(title, DOWN, buff=0.35).shift(LEFT * 3)
        form2.next_to(form1, RIGHT, buff=0.55)
        form3.next_to(form1, DOWN, buff=0.35).shift(RIGHT * 1.0)

        self.play(FadeIn(form1))
        self.wait(0.3)
        arrow12 = MathTex(r"\Rightarrow").scale(0.7).next_to(form1, RIGHT, buff=0.15)
        self.play(FadeIn(arrow12), FadeIn(form2))
        self.wait(0.3)
        self.play(Write(form3))
        self.wait(0.5)

        # ── 坐标轴 ──
        ax = Axes(
            x_range=[0, 14, 2],
            y_range=[0, 0.52, 0.1],
            x_length=7.0,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 1.4 + RIGHT * 0.5)

        x_label = MathTex(r"x").scale(0.65).next_to(ax.x_axis, RIGHT, buff=0.1)
        y_label = MathTex(r"f(x)").scale(0.65).next_to(ax.y_axis, UP, buff=0.1)
        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))

        # ── 三条 PDF 曲线 ──
        colors = [BLUE, GREEN, ORANGE]
        ks = [1, 3, 10]
        curves = []
        for k, col in zip(ks, colors):
            x_min = 0.05 if k == 1 else 0.1
            curve = ax.plot(
                lambda x, _k=k: chi2_pdf(x, _k),
                x_range=[x_min, 13.5, 0.05],
                color=col,
                stroke_width=2.5,
            )
            curves.append(curve)

        legend_items = VGroup()
        for i, (k, col) in enumerate(zip(ks, colors)):
            line_samp = Line(LEFT * 0.25, RIGHT * 0.25, color=col, stroke_width=3)
            lbl = MathTex(rf"\chi^2({k})", color=col).scale(0.6)
            row = VGroup(line_samp, lbl).arrange(RIGHT, buff=0.12)
            legend_items.add(row)
        legend_items.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        legend_items.next_to(ax, LEFT, buff=0.25).shift(UP * 0.5)

        for curve, item in zip(curves, legend_items):
            self.play(Create(curve), FadeIn(item), run_time=0.9)
            self.wait(0.2)

        hint = Text("自由度 n 增大，分布右移并趋于对称", font=CJK).scale(0.42).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(hint))
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, form1, arrow12, form2, form3,
                                  ax, x_label, y_label,
                                  *curves, legend_items, hint)))
        self.wait(0.2)

    # ══════════════════════════════════════════
    #  第二幕：t 分布
    # ══════════════════════════════════════════
    def _act2_t(self):
        title = Text("第二幕：t 分布的构造", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 构造公式 ──
        form = MathTex(
            r"t = \frac{Z}{\sqrt{\chi^2(n)/n}},\quad Z \perp \chi^2(n)"
        ).scale(0.72)
        form.next_to(title, DOWN, buff=0.35)
        self.play(Write(form))
        self.wait(0.5)

        # ── 坐标轴 ──
        ax = Axes(
            x_range=[-4.5, 4.5, 1],
            y_range=[0, 0.42, 0.1],
            x_length=7.5,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 1.5 + RIGHT * 0.2)

        x_label = MathTex(r"x").scale(0.65).next_to(ax.x_axis, RIGHT, buff=0.1)
        y_label = MathTex(r"f(x)").scale(0.65).next_to(ax.y_axis, UP, buff=0.1)
        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))

        # ── 三条曲线：t(1), t(5), N(0,1) ──
        specs = [
            (lambda x: t_pdf(x, 1),   RED,    r"t(1)"),
            (lambda x: t_pdf(x, 5),   GOLD,   r"t(5)"),
            (lambda x: norm_pdf(x),   BLUE_D, r"N(0,1)"),
        ]
        curves = []
        for fn, col, _ in specs:
            c = ax.plot(fn, x_range=[-4.4, 4.4, 0.05], color=col, stroke_width=2.5)
            curves.append(c)

        legend_items = VGroup()
        for (_, col, lbl_str) in specs:
            line_samp = Line(LEFT * 0.25, RIGHT * 0.25, color=col, stroke_width=3)
            lbl = MathTex(lbl_str, color=col).scale(0.62)
            row = VGroup(line_samp, lbl).arrange(RIGHT, buff=0.12)
            legend_items.add(row)
        legend_items.arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        legend_items.next_to(ax, LEFT, buff=0.2).shift(UP * 0.3)

        for curve, item in zip(curves, legend_items):
            self.play(Create(curve), FadeIn(item), run_time=0.9)
            self.wait(0.25)

        hint = Text("n 越大，t(n) 尾部越薄，趋近标准正态", font=CJK).scale(0.42).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(hint))
        self.wait(1.5)

        # ── 高亮 N(0,1) ──
        self.play(curves[2].animate.set_stroke(width=4.5), run_time=0.5)
        self.wait(1.0)

        self.play(FadeOut(VGroup(title, form, ax, x_label, y_label,
                                  *curves, legend_items, hint)))
        self.wait(0.2)

    # ══════════════════════════════════════════
    #  第三幕：F 分布
    # ══════════════════════════════════════════
    def _act3_f(self):
        title = Text("第三幕：F 分布的构造", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 构造公式 ──
        form = MathTex(
            r"F = \frac{\chi^2(m)/m}{\chi^2(n)/n},\quad \chi^2(m)\perp\chi^2(n)"
        ).scale(0.68)
        form.next_to(title, DOWN, buff=0.35)
        self.play(Write(form))
        self.wait(0.5)

        # ── 自由度标注 ──
        df_note = MathTex(r"F \sim F(m,\,n)").scale(0.68)
        df_note.next_to(form, DOWN, buff=0.25)
        self.play(FadeIn(df_note))
        self.wait(0.4)

        # ── 坐标轴 ──
        ax = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.1, 0.2],
            x_length=7.0,
            y_length=3.0,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 1.6 + RIGHT * 0.3)

        x_label = MathTex(r"x").scale(0.65).next_to(ax.x_axis, RIGHT, buff=0.1)
        y_label = MathTex(r"f(x)").scale(0.65).next_to(ax.y_axis, UP, buff=0.1)
        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))

        # ── 三条 F(m,n) 曲线 ──
        f_specs = [
            (1, 1,  BLUE,   r"F(1,1)"),
            (2, 5,  GREEN,  r"F(2,5)"),
            (5, 10, ORANGE, r"F(5,10)"),
        ]
        curves = []
        for m, n, col, _ in f_specs:
            c = ax.plot(
                lambda x, _m=m, _n=n: f_pdf(x, _m, _n),
                x_range=[0.05, 4.9, 0.04],
                color=col,
                stroke_width=2.5,
            )
            curves.append(c)

        legend_items = VGroup()
        for (_, _, col, lbl_str) in f_specs:
            line_samp = Line(LEFT * 0.25, RIGHT * 0.25, color=col, stroke_width=3)
            lbl = MathTex(lbl_str, color=col).scale(0.62)
            row = VGroup(line_samp, lbl).arrange(RIGHT, buff=0.12)
            legend_items.add(row)
        legend_items.arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        legend_items.next_to(ax, LEFT, buff=0.2).shift(UP * 0.4)

        for curve, item in zip(curves, legend_items):
            self.play(Create(curve), FadeIn(item), run_time=0.9)
            self.wait(0.25)

        hint = Text("F 分布定义在 x > 0，PDF 右偏，两个自由度参数 (m, n)", font=CJK).scale(0.40).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(hint))
        self.wait(1.8)

        self.play(FadeOut(VGroup(title, form, df_note, ax, x_label, y_label,
                                  *curves, legend_items, hint)))
        self.wait(0.3)


# ─────────────────────────────────────────────
#  模块顶层注册
# ─────────────────────────────────────────────

REGISTER = [
    {
        "scene": "ThreeDistScene",
        "id": "ch06-6.2-sampling-dist",
        "chapterId": "ch06",
        "sectionId": "6.2",
        "title": "三大抽样分布：χ²、t、F",
        "description": "从标准正态出发，逐步构造 χ²、t、F 三大抽样分布，动画对比各分布 PDF 形状随自由度的变化规律。",
    },
]
