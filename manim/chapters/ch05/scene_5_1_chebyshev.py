"""第 5.1 节 · 切比雪夫不等式 —— 以正态分布 PDF 展示尾部面积与 sigma^2/epsilon^2 上界的动态比较。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

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
    DashedLine,
    DecimalNumber,
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    ValueTracker,
    Write,
    always_redraw,
    linear,
)
import numpy as np

CJK = "Microsoft YaHei"


def normal_pdf(x, mu=0.0, sigma=1.0):
    """标准正态分布概率密度函数。"""
    return np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))


def tail_probability(eps, mu=0.0, sigma=1.0):
    """P(|X - mu| >= eps)，使用数值积分近似。"""
    from scipy import stats
    return 2 * (1 - stats.norm.cdf(eps, loc=mu, scale=sigma))


class ChebyshevScene(Scene):
    def construct(self):
        # ------------------------------------------------------------------ #
        # 参数
        MU = 0.0
        SIGMA = 1.0

        # ------------------------------------------------------------------ #
        # 第一幕：标题 + 切比雪夫不等式公式
        # ------------------------------------------------------------------ #
        title = Text("切比雪夫不等式的几何直觉", font=CJK, weight=BOLD).scale(0.65)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.4)

        ineq = MathTex(
            r"P\!\left(|X-\mu| \geq \varepsilon\right) \leq \frac{\sigma^2}{\varepsilon^2}",
            font_size=40,
        )
        ineq.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(ineq))
        self.wait(1.0)

        subtitle = Text("红色尾部面积  vs  橙色上界", font=CJK).scale(0.45)
        subtitle.next_to(ineq, DOWN, buff=0.2)
        self.play(FadeIn(subtitle))
        self.wait(0.8)

        self.play(FadeOut(VGroup(ineq, subtitle)))
        self.wait(0.2)

        # ------------------------------------------------------------------ #
        # 第二幕：建立坐标系 + PDF 曲线（静态）
        # ------------------------------------------------------------------ #
        axes = Axes(
            x_range=[-3.8, 3.8, 1],
            y_range=[0, 0.50, 0.1],
            x_length=9,
            y_length=3.8,
            axis_config={"color": WHITE, "include_tip": False},
        )
        axes.shift(DOWN * 0.7)

        x_label = MathTex(r"x", font_size=32).next_to(axes.x_axis.get_right(), RIGHT, buff=0.15)
        y_label = MathTex(r"f(x)", font_size=32).next_to(axes.y_axis.get_top(), UP, buff=0.1)

        pdf_graph = axes.plot(
            lambda x: normal_pdf(x, MU, SIGMA),
            x_range=[-3.8, 3.8],
            color=BLUE_D,
            stroke_width=3,
        )

        mu_line = axes.get_vertical_line(
            axes.c2p(MU, normal_pdf(MU, MU, SIGMA)),
            color=GREEN,
            stroke_width=2,
        )
        mu_label = MathTex(r"\mu", font_size=28, color=GREEN).next_to(
            axes.c2p(MU, 0), DOWN, buff=0.2
        )

        self.play(Create(axes), FadeIn(x_label, y_label))
        self.play(Create(pdf_graph))
        self.play(Create(mu_line), FadeIn(mu_label))
        self.wait(0.5)

        intro_text = Text("正态分布 PDF 曲线，中心在 μ", font=CJK).scale(0.42)
        intro_text.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(intro_text))
        self.wait(1.2)
        self.play(FadeOut(intro_text))

        # ------------------------------------------------------------------ #
        # 第三幕：ε 动态变化 —— 尾部面积与上界同步收缩
        # ------------------------------------------------------------------ #
        eps_tracker = ValueTracker(0.5)  # 从 0.5σ 开始

        # ε 左右边界线（always_redraw 实现动态）
        left_line = always_redraw(lambda: axes.get_vertical_line(
            axes.c2p(
                MU - eps_tracker.get_value(),
                normal_pdf(MU - eps_tracker.get_value(), MU, SIGMA),
            ),
            color=YELLOW,
            stroke_width=2.5,
        ))
        right_line = always_redraw(lambda: axes.get_vertical_line(
            axes.c2p(
                MU + eps_tracker.get_value(),
                normal_pdf(MU + eps_tracker.get_value(), MU, SIGMA),
            ),
            color=YELLOW,
            stroke_width=2.5,
        ))

        # 尾部填充（左 + 右），用 area 方法
        def make_tails():
            eps = eps_tracker.get_value()
            left_tail = axes.get_area(
                pdf_graph,
                x_range=[-3.8, MU - eps],
                color=RED,
                opacity=0.55,
            )
            right_tail = axes.get_area(
                pdf_graph,
                x_range=[MU + eps, 3.8],
                color=RED,
                opacity=0.55,
            )
            return VGroup(left_tail, right_tail)

        tails = always_redraw(make_tails)

        # ε 标注（用 Text 代替 MathTex 避免动画中反复调用 LaTeX 造成 Windows 文件锁冲突）
        eps_brace_label = always_redraw(lambda: Text(
            f"epsilon = {eps_tracker.get_value():.2f}",
            font=CJK,
            font_size=28,
            color=YELLOW,
        ).next_to(axes.c2p(MU + eps_tracker.get_value(), 0), UP + RIGHT, buff=0.15))

        self.play(Create(left_line), Create(right_line), FadeIn(tails))
        self.play(FadeIn(eps_brace_label))
        self.wait(0.5)

        tail_label = Text("红色 = P(|X-μ|≥ε)  （真实尾部面积）", font=CJK, color=RED).scale(0.42)
        tail_label.to_edge(DOWN, buff=0.25)
        self.play(Write(tail_label))
        self.wait(1.0)

        # ------------------------------------------------------------------ #
        # 第四幕：右上角数值面板 —— 真实概率 vs 上界
        # ------------------------------------------------------------------ #
        panel_bg_rect = __import__("manim").RoundedRectangle(
            width=3.5, height=1.5, corner_radius=0.18, color=WHITE, stroke_width=1
        ).set_fill(color="#1a1a2e", opacity=0.85)
        panel_bg_rect.to_corner(UP + RIGHT, buff=0.25)

        prob_label_text = Text("真实概率：", font=CJK, color=RED).scale(0.38)
        bound_label_text = Text("切比上界：", font=CJK, color=ORANGE).scale(0.38)

        def get_prob():
            eps = eps_tracker.get_value()
            # 直接数值近似（避免 scipy 依赖问题）
            from scipy import stats
            return float(2 * (1 - stats.norm.cdf(eps, loc=MU, scale=SIGMA)))

        def get_bound():
            eps = eps_tracker.get_value()
            return min(float(SIGMA ** 2 / eps ** 2), 1.0)

        prob_number = always_redraw(lambda: DecimalNumber(
            get_prob(), num_decimal_places=4, color=RED, font_size=28
        ))
        bound_number = always_redraw(lambda: DecimalNumber(
            get_bound(), num_decimal_places=4, color=ORANGE, font_size=28
        ))

        prob_row = always_redraw(lambda: VGroup(
            Text("真实概率：", font=CJK, color=RED).scale(0.38),
            DecimalNumber(get_prob(), num_decimal_places=4, color=RED, font_size=28),
        ).arrange(RIGHT, buff=0.15).move_to(panel_bg_rect.get_center() + UP * 0.3))

        bound_row = always_redraw(lambda: VGroup(
            Text("切比上界：", font=CJK, color=ORANGE).scale(0.38),
            DecimalNumber(get_bound(), num_decimal_places=4, color=ORANGE, font_size=28),
        ).arrange(RIGHT, buff=0.15).move_to(panel_bg_rect.get_center() + DOWN * 0.3))

        self.play(FadeIn(panel_bg_rect), FadeIn(prob_row), FadeIn(bound_row))
        self.wait(0.8)

        bound_txt = Text("橙色数值 ≥ 红色数值（不等式始终成立）", font=CJK, color=ORANGE).scale(0.42)
        bound_txt.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(tail_label), Write(bound_txt))
        self.wait(0.8)

        # ------------------------------------------------------------------ #
        # 第五幕：ε 从 0.5σ 增大到 3σ —— 两个数值同步收缩
        # ------------------------------------------------------------------ #
        grow_hint = Text("ε 增大 → 尾部收缩，上界也收缩，但始终不低于真实概率", font=CJK).scale(0.40)
        grow_hint.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(bound_txt), Write(grow_hint))
        self.wait(0.3)

        self.play(
            eps_tracker.animate.set_value(3.0),
            run_time=7,
            rate_func=linear,
        )
        self.wait(1.0)

        # ------------------------------------------------------------------ #
        # 第六幕：定格在 ε=2σ 展示数值对比
        # ------------------------------------------------------------------ #
        self.play(
            eps_tracker.animate.set_value(2.0),
            run_time=2,
        )
        self.wait(0.5)

        highlight = Text("ε = 2σ  时，真实概率 ≈ 0.046，上界 = 0.25", font=CJK, color=YELLOW).scale(0.42)
        highlight.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(grow_hint), Write(highlight))
        self.wait(2.0)

        self.play(FadeOut(highlight))
        self.wait(0.3)

        # ------------------------------------------------------------------ #
        # 第七幕：结语
        # ------------------------------------------------------------------ #
        outro = Text("切比雪夫不等式给出分布无关的概率上界", font=CJK, weight=BOLD).scale(0.50)
        outro.to_edge(DOWN, buff=0.30)
        formula_recap = Text(
            "P(|X - μ| ≥ ε) ≤ σ²/ε²",
            font=CJK,
            font_size=36,
            color="#FFFFFF",
        ).next_to(outro, UP, buff=0.25)

        self.play(Write(formula_recap), FadeIn(outro))
        self.wait(2.5)

        self.play(
            FadeOut(VGroup(
                title, axes, x_label, y_label, pdf_graph,
                mu_line, mu_label, left_line, right_line,
                tails, eps_brace_label, panel_bg_rect,
                prob_row, bound_row, formula_recap, outro,
            ))
        )
        self.wait(0.3)


REGISTER = [
    {
        "scene": "ChebyshevScene",
        "id": "ch05-5.1-chebyshev",
        "chapterId": "ch05",
        "sectionId": "5.1",
        "title": "切比雪夫不等式的几何直觉",
        "description": "以正态分布 PDF 为例，动态展示 ε 增大时尾部面积（真实概率）与 σ²/ε² 上界同步收缩，直观验证切比雪夫不等式始终成立。",
    },
]
