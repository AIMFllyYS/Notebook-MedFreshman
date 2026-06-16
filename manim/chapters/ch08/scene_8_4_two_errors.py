"""第 8.4 节 · 两类错误与检验功效 —— 并排正态分布展示 α/β 权衡与样本量影响。

中文文字用 Text（Microsoft YaHei）；数学公式用 MathTex（LaTeX/MiKTeX）。
MathTex 内不含任何中文或全角标点。
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
    always_redraw,
    ValueTracker,
    Line,
    Polygon,
    ParametricFunction,
    config,
)
import numpy as np

CJK = "Microsoft YaHei"

# ── 正态分布 PDF ──────────────────────────────────────────────
def norm_pdf(x, mu=0.0, sigma=1.0):
    return np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))


def fill_tail(axes, mu, sigma, x_start, x_end, color, opacity=0.55, n=200):
    """在 axes 坐标系内填充 [x_start, x_end] 区间下的正态曲线面积（Polygon）。"""
    xs = np.linspace(x_start, x_end, n)
    ys = norm_pdf(xs, mu, sigma)
    points_top = [axes.c2p(x, y) for x, y in zip(xs, ys)]
    points_bot = [axes.c2p(x_end, 0), axes.c2p(x_start, 0)]
    poly = Polygon(*points_top, *points_bot, color=color, fill_opacity=opacity, stroke_width=0)
    poly.set_fill(color, opacity=opacity)
    return poly


class TwoErrorScene(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════
        # 第一幕：标题
        # ════════════════════════════════════════════════════════
        title = (
            Text("两类错误与检验功效", font=CJK, weight=BOLD)
            .scale(0.75)
            .to_edge(UP, buff=0.25)
        )
        subtitle = (
            Text("弃真错误 (I类) vs 纳伪错误 (II类)", font=CJK)
            .scale(0.48)
            .next_to(title, DOWN, buff=0.12)
        )
        self.play(Write(title), run_time=0.9)
        self.play(FadeIn(subtitle), run_time=0.6)
        self.wait(0.5)

        # ════════════════════════════════════════════════════════
        # 第二幕：并排两个坐标系 + 静态分布曲线
        # ════════════════════════════════════════════════════════
        # H0: N(0,1)   H1: N(2,1)
        mu0, mu1, sigma = 0.0, 2.0, 1.0
        x_min, x_max = -3.2, 5.2

        ax = Axes(
            x_range=[x_min, x_max, 1],
            y_range=[0, 0.45, 0.1],
            x_length=9.5,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": False},
        ).shift(DOWN * 0.55)

        # 两条分布曲线
        curve_h0 = ax.plot(
            lambda x: norm_pdf(x, mu0, sigma),
            x_range=[x_min, x_max],
            color=BLUE_D,
            stroke_width=2.5,
        )
        curve_h1 = ax.plot(
            lambda x: norm_pdf(x, mu1, sigma),
            x_range=[x_min, x_max],
            color=GREEN_D,
            stroke_width=2.5,
        )

        h0_label = (
            MathTex(r"H_0: N(0,1)", color=BLUE_D)
            .scale(0.6)
            .next_to(ax.c2p(mu0, 0.41), UP, buff=0.05)
        )
        h1_label = (
            MathTex(r"H_1: N(2,1)", color=GREEN_D)
            .scale(0.6)
            .next_to(ax.c2p(mu1, 0.41), UP, buff=0.05)
        )

        self.play(
            FadeOut(subtitle),
            Create(ax),
            run_time=0.8,
        )
        self.play(
            Create(curve_h0),
            Create(curve_h1),
            FadeIn(h0_label),
            FadeIn(h1_label),
            run_time=1.0,
        )
        self.wait(0.4)

        # ════════════════════════════════════════════════════════
        # 第三幕：加入分割线 c，标注 α 和 β
        # ════════════════════════════════════════════════════════
        c_init = 1.0  # 初始分割点

        # 分割线
        c_line = DashedLine(
            ax.c2p(c_init, 0),
            ax.c2p(c_init, 0.42),
            color=YELLOW,
            stroke_width=2.5,
            dash_length=0.12,
        )
        c_label = (
            MathTex(r"c", color=YELLOW)
            .scale(0.65)
            .next_to(ax.c2p(c_init, 0.42), UP, buff=0.08)
        )

        # α 面积（H0曲线右尾，x>c）
        alpha_fill = fill_tail(ax, mu0, sigma, c_init, x_max, RED, opacity=0.50)
        # β 面积（H1曲线左尾，x<c）
        beta_fill = fill_tail(ax, mu1, sigma, x_min, c_init, ORANGE, opacity=0.45)

        alpha_tex = (
            MathTex(r"\alpha", color=RED)
            .scale(0.75)
            .move_to(ax.c2p(c_init + 0.7, norm_pdf(c_init + 0.35, mu0, sigma) * 0.45))
        )
        beta_tex = (
            MathTex(r"\beta", color=ORANGE)
            .scale(0.75)
            .move_to(ax.c2p(c_init - 0.7, norm_pdf(c_init - 0.35, mu1, sigma) * 0.45))
        )

        # 文字说明（标题行下方）
        desc_alpha = (
            Text("I类错误 (弃真)", font=CJK, color=RED)
            .scale(0.42)
            .to_corner(UP + LEFT, buff=0.25)
            .shift(DOWN * 1.1)
        )
        desc_beta = (
            Text("II类错误 (纳伪)", font=CJK, color=ORANGE)
            .scale(0.42)
            .next_to(desc_alpha, RIGHT, buff=0.5)
        )

        self.play(
            Create(c_line),
            FadeIn(c_label),
            run_time=0.6,
        )
        self.play(
            FadeIn(alpha_fill),
            FadeIn(beta_fill),
            FadeIn(alpha_tex),
            FadeIn(beta_tex),
            run_time=0.9,
        )
        self.play(
            FadeIn(desc_alpha),
            FadeIn(desc_beta),
            run_time=0.7,
        )
        self.wait(0.8)

        # ════════════════════════════════════════════════════════
        # 第四幕：移动 c → α 增大则 β 减小，直观展示权衡
        # ════════════════════════════════════════════════════════
        trade_hint = (
            Text("向左移动 c：α 增大，β 减小", font=CJK, color=YELLOW)
            .scale(0.45)
            .to_edge(DOWN, buff=0.28)
        )
        self.play(FadeIn(trade_hint), run_time=0.5)

        c_new = -0.2  # 移到偏左位置

        # 重新计算各图形
        c_line2 = DashedLine(
            ax.c2p(c_new, 0),
            ax.c2p(c_new, 0.42),
            color=YELLOW,
            stroke_width=2.5,
            dash_length=0.12,
        )
        c_label2 = (
            MathTex(r"c'", color=YELLOW)
            .scale(0.65)
            .next_to(ax.c2p(c_new, 0.42), UP, buff=0.08)
        )
        alpha_fill2 = fill_tail(ax, mu0, sigma, c_new, x_max, RED, opacity=0.55)
        beta_fill2 = fill_tail(ax, mu1, sigma, x_min, c_new, ORANGE, opacity=0.40)

        alpha_tex2 = (
            MathTex(r"\alpha\uparrow", color=RED)
            .scale(0.70)
            .move_to(ax.c2p(c_new + 1.0, norm_pdf(c_new + 0.5, mu0, sigma) * 0.5))
        )
        beta_tex2 = (
            MathTex(r"\beta\downarrow", color=ORANGE)
            .scale(0.70)
            .move_to(ax.c2p(c_new - 0.8, norm_pdf(c_new - 0.4, mu1, sigma) * 0.45))
        )

        self.play(
            Transform(c_line, c_line2),
            Transform(c_label, c_label2),
            Transform(alpha_fill, alpha_fill2),
            Transform(beta_fill, beta_fill2),
            Transform(alpha_tex, alpha_tex2),
            Transform(beta_tex, beta_tex2),
            run_time=1.8,
        )
        self.wait(0.7)

        # 再向右移动，展示 α 减小 β 增大
        trade_hint2 = (
            Text("向右移动 c：α 减小，β 增大", font=CJK, color=YELLOW)
            .scale(0.45)
            .to_edge(DOWN, buff=0.28)
        )
        self.play(Transform(trade_hint, trade_hint2), run_time=0.5)

        c_new3 = 2.5
        c_line3 = DashedLine(
            ax.c2p(c_new3, 0),
            ax.c2p(c_new3, 0.42),
            color=YELLOW,
            stroke_width=2.5,
            dash_length=0.12,
        )
        c_label3 = (
            MathTex(r"c''", color=YELLOW)
            .scale(0.65)
            .next_to(ax.c2p(c_new3, 0.42), UP, buff=0.08)
        )
        alpha_fill3 = fill_tail(ax, mu0, sigma, c_new3, x_max, RED, opacity=0.45)
        beta_fill3 = fill_tail(ax, mu1, sigma, x_min, c_new3, ORANGE, opacity=0.55)

        alpha_tex3 = (
            MathTex(r"\alpha\downarrow", color=RED)
            .scale(0.70)
            .move_to(ax.c2p(c_new3 + 0.5, norm_pdf(c_new3 + 0.3, mu0, sigma) * 0.6))
        )
        beta_tex3 = (
            MathTex(r"\beta\uparrow", color=ORANGE)
            .scale(0.70)
            .move_to(ax.c2p(c_new3 - 1.0, norm_pdf(c_new3 - 0.5, mu1, sigma) * 0.5))
        )

        self.play(
            Transform(c_line, c_line3),
            Transform(c_label, c_label3),
            Transform(alpha_fill, alpha_fill3),
            Transform(beta_fill, beta_fill3),
            Transform(alpha_tex, alpha_tex3),
            Transform(beta_tex, beta_tex3),
            run_time=1.8,
        )
        self.wait(0.7)

        # 恢复到 c=1.0
        self.play(
            Transform(c_line, DashedLine(ax.c2p(c_init, 0), ax.c2p(c_init, 0.42), color=YELLOW, stroke_width=2.5, dash_length=0.12)),
            Transform(c_label, MathTex(r"c", color=YELLOW).scale(0.65).next_to(ax.c2p(c_init, 0.42), UP, buff=0.08)),
            Transform(alpha_fill, fill_tail(ax, mu0, sigma, c_init, x_max, RED, opacity=0.50)),
            Transform(beta_fill, fill_tail(ax, mu1, sigma, x_min, c_init, ORANGE, opacity=0.45)),
            Transform(alpha_tex, MathTex(r"\alpha", color=RED).scale(0.75).move_to(ax.c2p(c_init + 0.7, norm_pdf(c_init + 0.35, mu0, sigma) * 0.45))),
            Transform(beta_tex, MathTex(r"\beta", color=ORANGE).scale(0.75).move_to(ax.c2p(c_init - 0.7, norm_pdf(c_init - 0.35, mu1, sigma) * 0.45))),
            FadeOut(trade_hint),
            run_time=1.2,
        )
        self.wait(0.5)

        # ════════════════════════════════════════════════════════
        # 第五幕：增大样本量 n，两分布分离，α 和 β 同时减小
        # ════════════════════════════════════════════════════════
        n_hint = (
            Text("增大 n：两分布分离，α 和 β 同时减小！", font=CJK, color=GREEN)
            .scale(0.45)
            .to_edge(DOWN, buff=0.28)
        )
        self.play(FadeIn(n_hint), run_time=0.6)
        self.wait(0.4)

        # n=4 时：sigma_new = 1/sqrt(4) = 0.5，均值距离 = mu1-mu0 = 2 不变
        # 但在图上等比缩放展示：用 sigma=0.5，mu0=0, mu1=2
        sigma_n = 0.5

        curve_h0_n = ax.plot(
            lambda x: norm_pdf(x, mu0, sigma_n),
            x_range=[x_min, x_max],
            color=BLUE,
            stroke_width=2.5,
        )
        curve_h1_n = ax.plot(
            lambda x: norm_pdf(x, mu1, sigma_n),
            x_range=[x_min, x_max],
            color=GREEN,
            stroke_width=2.5,
        )

        h0_label_n = (
            MathTex(r"H_0: N(0,\tfrac{1}{4})", color=BLUE)
            .scale(0.52)
            .next_to(ax.c2p(mu0, norm_pdf(0, mu0, sigma_n) + 0.02), UP, buff=0.05)
        )
        h1_label_n = (
            MathTex(r"H_1: N(2,\tfrac{1}{4})", color=GREEN)
            .scale(0.52)
            .next_to(ax.c2p(mu1, norm_pdf(0, mu1, sigma_n) + 0.02), UP, buff=0.05)
        )

        alpha_fill_n = fill_tail(ax, mu0, sigma_n, c_init, x_max, RED, opacity=0.50)
        beta_fill_n = fill_tail(ax, mu1, sigma_n, x_min, c_init, ORANGE, opacity=0.45)

        alpha_tex_n = (
            MathTex(r"\alpha", color=RED)
            .scale(0.65)
            .move_to(ax.c2p(c_init + 0.45, 0.06))
        )
        beta_tex_n = (
            MathTex(r"\beta", color=ORANGE)
            .scale(0.65)
            .move_to(ax.c2p(c_init - 0.45, 0.06))
        )

        self.play(
            Transform(curve_h0, curve_h0_n),
            Transform(curve_h1, curve_h1_n),
            Transform(h0_label, h0_label_n),
            Transform(h1_label, h1_label_n),
            Transform(alpha_fill, alpha_fill_n),
            Transform(beta_fill, beta_fill_n),
            Transform(alpha_tex, alpha_tex_n),
            Transform(beta_tex, beta_tex_n),
            run_time=1.8,
        )
        self.wait(0.6)

        # 高亮两个面积同时变小的提示
        both_small = (
            Text("两类错误同时缩小，检验功效提升", font=CJK, color=GREEN)
            .scale(0.46)
            .to_edge(DOWN, buff=0.28)
        )
        self.play(Transform(n_hint, both_small), run_time=0.6)
        self.wait(1.0)

        # ════════════════════════════════════════════════════════
        # 第六幕：功效公式小结
        # ════════════════════════════════════════════════════════
        self.play(
            FadeOut(
                VGroup(
                    ax, curve_h0, curve_h1,
                    h0_label, h1_label,
                    c_line, c_label,
                    alpha_fill, beta_fill,
                    alpha_tex, beta_tex,
                    desc_alpha, desc_beta,
                    n_hint,
                )
            ),
            run_time=0.8,
        )

        summary_title = (
            Text("小结", font=CJK, weight=BOLD, color=YELLOW)
            .scale(0.7)
            .to_edge(UP, buff=0.9)
        )

        line1 = Text("I类错误（弃真）：原假设为真但被拒绝", font=CJK).scale(0.48)
        line2 = MathTex(r"P(\text{reject }H_0 \mid H_0\text{ true}) = \alpha").scale(0.58)
        line3 = Text("II类错误（纳伪）：原假设为假但未被拒绝", font=CJK).scale(0.48)
        line4 = MathTex(r"P(\text{accept }H_0 \mid H_1\text{ true}) = \beta").scale(0.58)
        line5 = Text("检验功效 = 1 - β，样本量越大，功效越高", font=CJK, color=GREEN).scale(0.48)
        line6 = MathTex(r"\text{Power} = 1 - \beta").scale(0.58)

        group = VGroup(line1, line2, line3, line4, line5, line6).arrange(
            DOWN, aligned_edge=LEFT, buff=0.30
        ).next_to(summary_title, DOWN, buff=0.35)

        self.play(Write(summary_title), run_time=0.6)
        for mob in [line1, line2, line3, line4, line5, line6]:
            self.play(FadeIn(mob), run_time=0.45)
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, summary_title, group)), run_time=0.8)
        self.wait(0.2)


REGISTER = [
    {
        "scene": "TwoErrorScene",
        "id": "ch08-8.4-two-errors",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "两类错误与功效曲线",
        "description": "通过并排正态分布图，直观展示 I/II 类错误面积的权衡以及样本量增大后两类错误同时缩小的功效提升。",
    },
]
