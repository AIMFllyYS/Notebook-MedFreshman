"""第 7.2 节 · 最大似然估计 —— 以指数分布为例展示似然函数的峰值即 MLE。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

from manim import (
    BOLD,
    DOWN,
    LEFT,
    RIGHT,
    UP,
    YELLOW,
    GREEN,
    RED,
    BLUE,
    WHITE,
    ORANGE,
    Axes,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    VGroup,
    Write,
    Transform,
    ReplacementTransform,
    AnimationGroup,
    Arrow,
    Line,
    always_redraw,
    ValueTracker,
    DecimalNumber,
)
import numpy as np

CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "MLEScene",
        "id": "ch07-7.2-mle",
        "chapterId": "ch07",
        "sectionId": "7.2",
        "title": "极大似然估计：让数据最可能出现的参数",
        "description": "以指数分布为例，动态展示对数似然函数的曲线、MLE 峰值点 lambda_hat，并说明正态分布的联合 MLE 公式。",
    },
]


# ─────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────
DATA = [0.5, 1.2, 0.8, 2.1]
N = len(DATA)
SUM_X = sum(DATA)               # 4.6
LAMBDA_HAT = N / SUM_X         # ≈ 0.8696


def log_likelihood(lam: float) -> float:
    """指数分布的对数似然函数  ℓ(λ) = n·ln(λ) − λ·Σxi"""
    if lam <= 0:
        return float("-inf")
    return N * np.log(lam) - lam * SUM_X


# ─────────────────────────────────────────────
# 主场景
# ─────────────────────────────────────────────
class MLEScene(Scene):
    """
    幕一：直觉引入 + 对数似然曲线 + 标注 λ̂
    幕二：正态分布联合 MLE 公式小结
    估计总时长约 40–50 秒
    """

    def construct(self):
        self._act1_log_likelihood()
        self._act2_normal_mle()

    # ──────────────────────────────────────────
    # 幕一：指数分布 MLE
    # ──────────────────────────────────────────
    def _act1_log_likelihood(self):
        # ── 标题 ──
        title = Text("最大似然估计", font=CJK, weight=BOLD).scale(0.75).to_edge(UP)
        subtitle = (
            Text("让观测数据出现概率最大的参数值", font=CJK)
            .scale(0.45)
            .next_to(title, DOWN, buff=0.15)
        )
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.5)

        # ── 数据展示 ──
        data_label = Text("观测数据:", font=CJK).scale(0.48).to_edge(LEFT).shift(UP * 1.6)
        data_vals = MathTex(
            r"x_1{=}0.5,\; x_2{=}1.2,\; x_3{=}0.8,\; x_4{=}2.1"
        ).scale(0.55).next_to(data_label, RIGHT, buff=0.2)
        dist_label = Text("(指数分布样本)", font=CJK, color=YELLOW).scale(0.42).next_to(data_vals, RIGHT, buff=0.3)
        data_row = VGroup(data_label, data_vals, dist_label)
        self.play(FadeIn(data_row))
        self.wait(0.6)

        # ── 似然函数说明 ──
        ll_intro = Text("对数似然函数:", font=CJK).scale(0.46).to_edge(LEFT).shift(UP * 0.9)
        ll_formula = MathTex(
            r"\ell(\lambda) = n\ln\lambda - \lambda\sum_{i=1}^{n} x_i"
        ).scale(0.58).next_to(ll_intro, RIGHT, buff=0.25)
        self.play(FadeIn(ll_intro), Write(ll_formula))
        self.wait(0.5)

        # ── 坐标系与对数似然曲线 ──
        ax = Axes(
            x_range=[0.05, 3.0, 0.5],
            y_range=[-12, 1, 2],
            x_length=7.5,
            y_length=3.5,
            axis_config={"color": WHITE, "include_tip": True, "tip_length": 0.18},
        ).shift(DOWN * 1.55)

        x_label = MathTex(r"\lambda").scale(0.55).next_to(ax.x_axis.get_end(), RIGHT, buff=0.1)
        y_label = MathTex(r"\ell(\lambda)").scale(0.50).next_to(ax.y_axis.get_end(), UP, buff=0.1)

        curve = ax.plot(
            log_likelihood,
            x_range=[0.12, 2.9],
            color=BLUE,
            stroke_width=3,
        )

        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(curve), run_time=1.8)
        self.wait(0.4)

        # ── 标注最大值点 λ̂ ──
        lam_hat_x = LAMBDA_HAT
        lam_hat_y = log_likelihood(lam_hat_x)

        peak_dot = Dot(ax.c2p(lam_hat_x, lam_hat_y), color=YELLOW, radius=0.12)

        # 垂直虚线从 x 轴到峰值
        vline = DashedLine(
            start=ax.c2p(lam_hat_x, -12),
            end=ax.c2p(lam_hat_x, lam_hat_y),
            color=YELLOW,
            stroke_width=2.5,
            dash_length=0.12,
        )

        lam_tick = MathTex(r"\hat{\lambda}\approx 0.87").scale(0.5).set_color(YELLOW)
        lam_tick.next_to(ax.c2p(lam_hat_x, -12), DOWN, buff=0.15)

        peak_ann = MathTex(
            r"\hat{\lambda} = \frac{n}{\sum x_i} = \frac{4}{4.6} \approx 0.87"
        ).scale(0.50).set_color(YELLOW)
        peak_ann.next_to(peak_dot, UP + RIGHT, buff=0.15)

        self.play(Create(vline), FadeIn(peak_dot))
        self.play(FadeIn(lam_tick), Write(peak_ann))
        self.wait(1.0)

        # ── 强调"峰值处就是 MLE" ──
        mle_note = (
            Text("峰值处使似然函数最大", font=CJK, color=GREEN)
            .scale(0.46)
            .to_edge(RIGHT)
            .shift(UP * 2.2)
        )
        arrow_to_peak = Arrow(
            mle_note.get_bottom() + DOWN * 0.1,
            peak_dot.get_center(),
            buff=0.08,
            color=GREEN,
            stroke_width=2.5,
            max_tip_length_to_length_ratio=0.15,
        )
        self.play(FadeIn(mle_note), Create(arrow_to_peak))
        self.wait(1.2)

        # ── 求导说明 ──
        deriv_label = Text("令导数为零可解析求解:", font=CJK).scale(0.43).to_edge(LEFT).shift(DOWN * 0.05)
        deriv_eq = MathTex(
            r"\frac{d\ell}{d\lambda} = \frac{n}{\lambda} - \sum x_i = 0"
            r"\;\Longrightarrow\;\hat{\lambda} = \frac{n}{\sum x_i}"
        ).scale(0.52).next_to(deriv_label, DOWN, buff=0.12).to_edge(LEFT)
        self.play(FadeIn(deriv_label))
        self.play(Write(deriv_eq))
        self.wait(1.5)

        # ── 幕一淡出 ──
        act1_all = VGroup(
            title, subtitle, data_row, ll_intro, ll_formula,
            ax, x_label, y_label, curve,
            vline, peak_dot, lam_tick, peak_ann,
            mle_note, arrow_to_peak,
            deriv_label, deriv_eq,
        )
        self.play(FadeOut(act1_all))
        self.wait(0.3)

    # ──────────────────────────────────────────
    # 幕二：正态分布联合 MLE
    # ──────────────────────────────────────────
    def _act2_normal_mle(self):
        # ── 标题 ──
        title2 = (
            Text("正态分布的联合最大似然估计", font=CJK, weight=BOLD)
            .scale(0.68)
            .to_edge(UP)
        )
        self.play(Write(title2))
        self.wait(0.4)

        # ── 似然函数写出 ──
        intro = (
            Text("设  X ~ N(mu, sigma^2), 样本量 n", font=CJK)
            .scale(0.46)
            .to_edge(LEFT)
            .shift(UP * 1.8)
        )
        # 避免中文进 MathTex — 改用纯英文注释行
        intro_math = MathTex(
            r"X_1,\ldots,X_n \overset{iid}{\sim} \mathcal{N}(\mu,\,\sigma^2)"
        ).scale(0.58).next_to(intro, DOWN, buff=0.18).to_edge(LEFT)
        self.play(FadeIn(intro), Write(intro_math))
        self.wait(0.5)

        # ── 对数似然 ──
        ll_label = Text("对数似然:", font=CJK).scale(0.46).to_edge(LEFT).shift(UP * 0.7)
        ll_normal = MathTex(
            r"\ell(\mu,\sigma^2)"
            r"= -\frac{n}{2}\ln(2\pi\sigma^2)"
            r"- \frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i-\mu)^2"
        ).scale(0.52).next_to(ll_label, DOWN, buff=0.15).to_edge(LEFT)
        self.play(FadeIn(ll_label), Write(ll_normal))
        self.wait(0.8)

        # ── MLE 结果 ──
        result_label = Text("联合 MLE 解析解:", font=CJK, color=YELLOW).scale(0.48).shift(DOWN * 0.5).to_edge(LEFT)
        mu_hat = MathTex(
            r"\hat{\mu} = \bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i"
        ).scale(0.58).next_to(result_label, DOWN, buff=0.2).to_edge(LEFT)
        sigma_hat = MathTex(
            r"\hat{\sigma}^2 = \frac{1}{n}\sum_{i=1}^{n}(X_i - \bar{X})^2"
        ).scale(0.58).next_to(mu_hat, DOWN, buff=0.25).to_edge(LEFT)

        self.play(FadeIn(result_label))
        self.play(Write(mu_hat))
        self.wait(0.5)
        self.play(Write(sigma_hat))
        self.wait(0.8)

        # ── 关键注意事项 ──
        note_box_text = Text(
            "注意: MLE 方差为有偏估计（分母为 n，非 n-1）",
            font=CJK,
            color=ORANGE,
        ).scale(0.42).shift(DOWN * 2.3)
        self.play(FadeIn(note_box_text))
        self.wait(0.8)

        # ── 小结 ──
        summary_label = Text("MLE 核心思路:", font=CJK, weight=BOLD, color=GREEN).scale(0.46).shift(DOWN * 2.95)
        self.play(Write(summary_label))
        self.wait(0.4)
        summary = MathTex(
            r"\hat{\theta} = \arg\max_{\theta}\; L(\theta \mid \mathbf{x})"
        ).scale(0.58).next_to(summary_label, RIGHT, buff=0.3)
        self.play(Write(summary))
        self.wait(1.8)

        # ── 淡出 ──
        act2_all = VGroup(
            title2, intro, intro_math,
            ll_label, ll_normal,
            result_label, mu_hat, sigma_hat,
            note_box_text, summary_label, summary,
        )
        self.play(FadeOut(act2_all))
        self.wait(0.4)
