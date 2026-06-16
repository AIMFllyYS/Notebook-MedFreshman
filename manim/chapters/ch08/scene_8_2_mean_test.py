"""第 8.2 节 · 正态总体均值的假设检验 —— 并排对比 Z 检验与 t 检验。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。

sigma 已知 -> Z 检验，拒绝域 |Z| > 1.96（N(0,1)，alpha=0.05）
sigma 未知 -> t 检验，拒绝域 |T| > t_critical（t(n-1)，临界值更大）
演示 n 从 5 增大时 t 临界值收缩到 Z 临界值 1.96。
"""

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    FadeIn,
    FadeOut,
    GREEN,
    LEFT,
    ORIGIN,
    RED,
    RIGHT,
    Transform,
    UP,
    YELLOW,
    WHITE,
    Axes,
    Create,
    DashedLine,
    MathTex,
    Scene,
    Text,
    VGroup,
    Write,
    Polygon,
    Line,
    always_redraw,
    DecimalNumber,
    ValueTracker,
    ReplacementTransform,
)
import numpy as np

CJK = "Microsoft YaHei"


def normal_pdf(x):
    """Standard normal N(0,1) density."""
    return np.exp(-0.5 * x * x) / np.sqrt(2 * np.pi)


def t_pdf(x, df):
    """Student t density with df degrees of freedom (via scipy for numerical stability)."""
    from scipy.stats import t as t_dist
    return float(t_dist.pdf(x, df))


# Precomputed t critical values (two-tailed alpha=0.05) for df = 4..30 and inf
T_CRITS = {
    4: 2.776,
    5: 2.571,
    6: 2.447,
    7: 2.365,
    8: 2.306,
    9: 2.262,
    10: 2.228,
    15: 2.131,
    20: 2.086,
    30: 2.042,
    999: 1.960,  # inf -> Z
}


class MeanTestScene(Scene):
    def construct(self):
        # ── 0. Title ──────────────────────────────────────────────────────────
        title = Text("均值检验：Z 检验与 t 检验", font=CJK, weight=BOLD).scale(0.65)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.4)

        # ── 1. Setup axes (left: Z, right: t) ────────────────────────────────
        # Left axes — Z test (sigma known)
        ax_z = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.45, 0.1],
            x_length=5.2,
            y_length=2.6,
            axis_config={"include_tip": False, "stroke_width": 1.5},
        ).shift(LEFT * 3.2 + DOWN * 0.9)

        # Right axes — t test (sigma unknown)
        ax_t = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.45, 0.1],
            x_length=5.2,
            y_length=2.6,
            axis_config={"include_tip": False, "stroke_width": 1.5},
        ).shift(RIGHT * 3.2 + DOWN * 0.9)

        label_z = Text("Z 检验  (sigma 已知)", font=CJK, color=BLUE).scale(0.42)
        label_z.next_to(ax_z, UP, buff=0.12)
        label_t = Text("t 检验  (sigma 未知)", font=CJK, color=GREEN).scale(0.42)
        label_t.next_to(ax_t, UP, buff=0.12)

        self.play(Create(ax_z), Create(ax_t), FadeIn(label_z), FadeIn(label_t))
        self.wait(0.3)

        # ── 2. Draw N(0,1) curve on the left ─────────────────────────────────
        curve_z = ax_z.plot(lambda x: normal_pdf(x), x_range=[-4, 4], color=BLUE, stroke_width=2.5)
        self.play(Create(curve_z))

        # Z critical value = 1.96
        z_crit = 1.96

        # Rejection regions (shaded) — left tail
        rej_z_left = ax_z.get_area(
            ax_z.plot(lambda x: normal_pdf(x), x_range=[-4, -z_crit]),
            x_range=[-4, -z_crit],
            color=RED,
            opacity=0.4,
        )
        rej_z_right = ax_z.get_area(
            ax_z.plot(lambda x: normal_pdf(x), x_range=[z_crit, 4]),
            x_range=[z_crit, 4],
            color=RED,
            opacity=0.4,
        )

        # Dashed critical lines
        z_line_left = ax_z.get_vertical_line(ax_z.c2p(-z_crit, normal_pdf(-z_crit)), color=RED, stroke_width=1.5)
        z_line_right = ax_z.get_vertical_line(ax_z.c2p(z_crit, normal_pdf(z_crit)), color=RED, stroke_width=1.5)

        self.play(FadeIn(rej_z_left), FadeIn(rej_z_right), Create(z_line_left), Create(z_line_right))

        # Label: |Z| > 1.96
        crit_label_z = MathTex(r"|Z| > 1.96", color=RED).scale(0.52)
        crit_label_z.next_to(ax_z, DOWN, buff=0.18)
        self.play(Write(crit_label_z))
        self.wait(0.5)

        # ── 3. Draw t(5) curve on the right ──────────────────────────────────
        df_init = 5
        t_crit_init = T_CRITS[df_init]

        curve_t = ax_t.plot(lambda x: t_pdf(x, df_init), x_range=[-4, 4], color=GREEN, stroke_width=2.5)
        self.play(Create(curve_t))

        rej_t_left = ax_t.get_area(
            ax_t.plot(lambda x: t_pdf(x, df_init), x_range=[-4, -t_crit_init]),
            x_range=[-4, -t_crit_init],
            color=RED,
            opacity=0.4,
        )
        rej_t_right = ax_t.get_area(
            ax_t.plot(lambda x: t_pdf(x, df_init), x_range=[t_crit_init, 4]),
            x_range=[t_crit_init, 4],
            color=RED,
            opacity=0.4,
        )

        t_line_left = ax_t.get_vertical_line(ax_t.c2p(-t_crit_init, t_pdf(-t_crit_init, df_init)), color=YELLOW, stroke_width=1.5)
        t_line_right = ax_t.get_vertical_line(ax_t.c2p(t_crit_init, t_pdf(t_crit_init, df_init)), color=YELLOW, stroke_width=1.5)

        self.play(FadeIn(rej_t_left), FadeIn(rej_t_right), Create(t_line_left), Create(t_line_right))

        df_label = Text("n=6, df=5", font=CJK, color=GREEN).scale(0.42)
        df_label.next_to(ax_t, UP, buff=0.12).shift(RIGHT * 0.3)
        crit_label_t = MathTex(r"|T| > 2.571", color=YELLOW).scale(0.52)
        crit_label_t.next_to(ax_t, DOWN, buff=0.18)

        self.play(FadeIn(df_label), Write(crit_label_t))
        self.wait(0.8)

        # ── 4. Insight text: t critical > Z critical ──────────────────────────
        insight = Text("t 临界值 > Z 临界值：sigma 未知，需更强证据才能拒绝 H0", font=CJK, color=YELLOW).scale(0.38)
        insight.to_edge(DOWN, buff=0.22)
        self.play(FadeIn(insight))
        self.wait(1.0)

        # ── 5. Animate n increasing: t critical shrinks to 1.96 ──────────────
        steps = [
            (8,  T_CRITS[8],  "n=9, df=8",  r"|T| > 2.306"),
            (15, T_CRITS[15], "n=16, df=15", r"|T| > 2.131"),
            (30, T_CRITS[30], "n=31, df=30", r"|T| > 2.042"),
            (999, T_CRITS[999], "n->inf", r"|T| \to 1.960"),
        ]

        prev_objs = VGroup(rej_t_left, rej_t_right, t_line_left, t_line_right, curve_t, df_label, crit_label_t)

        for df_new, tc_new, df_str, crit_str in steps:
            new_curve = ax_t.plot(lambda x, df=df_new: t_pdf(x, df), x_range=[-4, 4], color=GREEN, stroke_width=2.5)
            new_rej_left = ax_t.get_area(
                ax_t.plot(lambda x, df=df_new: t_pdf(x, df), x_range=[-4, -tc_new]),
                x_range=[-4, -tc_new],
                color=RED,
                opacity=0.4,
            )
            new_rej_right = ax_t.get_area(
                ax_t.plot(lambda x, df=df_new: t_pdf(x, df), x_range=[tc_new, 4]),
                x_range=[tc_new, 4],
                color=RED,
                opacity=0.4,
            )
            new_tll = ax_t.get_vertical_line(ax_t.c2p(-tc_new, t_pdf(-tc_new, df_new)), color=YELLOW, stroke_width=1.5)
            new_tlr = ax_t.get_vertical_line(ax_t.c2p(tc_new, t_pdf(tc_new, df_new)), color=YELLOW, stroke_width=1.5)
            new_df_label = Text(df_str, font=CJK, color=GREEN).scale(0.42)
            new_df_label.next_to(ax_t, UP, buff=0.12).shift(RIGHT * 0.3)
            new_crit = MathTex(crit_str, color=YELLOW).scale(0.52)
            new_crit.next_to(ax_t, DOWN, buff=0.18)

            new_objs = VGroup(new_rej_left, new_rej_right, new_tll, new_tlr, new_curve, new_df_label, new_crit)

            self.play(
                FadeOut(prev_objs, run_time=0.4),
                FadeIn(new_objs, run_time=0.6),
            )
            self.wait(0.7)
            prev_objs = new_objs

        # ── 6. Final convergence highlight ────────────────────────────────────
        converge_msg = Text("当 n -> 无穷，t 分布趋近 N(0,1)，临界值收敛到 1.96", font=CJK, color=BLUE).scale(0.37)
        converge_msg.to_edge(DOWN, buff=0.22)
        self.play(FadeOut(insight), FadeIn(converge_msg))

        # Overlay the Z curve on the t panel to show convergence
        curve_z_overlay = ax_t.plot(lambda x: normal_pdf(x), x_range=[-4, 4], color=BLUE, stroke_width=2, stroke_opacity=0.7)
        overlay_label = MathTex(r"N(0,1)", color=BLUE).scale(0.45)
        overlay_label.next_to(ax_t, UP, buff=0.12).shift(LEFT * 0.6)
        self.play(Create(curve_z_overlay), FadeIn(overlay_label))
        self.wait(1.2)

        # ── 7. Summary panel ──────────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(prev_objs, curve_z_overlay, overlay_label, converge_msg)),
            FadeOut(VGroup(ax_z, ax_t, curve_z, rej_z_left, rej_z_right,
                           z_line_left, z_line_right, crit_label_z,
                           label_z, label_t)),
        )

        sum_title = Text("小结", font=CJK, weight=BOLD, color=YELLOW).scale(0.6)
        sum_title.to_edge(UP, buff=1.0)

        row1 = VGroup(
            Text("Z 检验：sigma 已知，", font=CJK, color=BLUE).scale(0.45),
            MathTex(r"Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}} \sim N(0,1)", color=BLUE).scale(0.55),
        ).arrange(RIGHT, buff=0.25).shift(UP * 0.4)

        row2 = VGroup(
            Text("t 检验：sigma 未知，", font=CJK, color=GREEN).scale(0.45),
            MathTex(r"T = \frac{\bar{X}-\mu_0}{S/\sqrt{n}} \sim t(n-1)", color=GREEN).scale(0.55),
        ).arrange(RIGHT, buff=0.25).shift(DOWN * 0.4)

        row3 = Text("sigma 未知时临界值更大 -> 更难拒绝 H0", font=CJK, color=YELLOW).scale(0.42)
        row3.shift(DOWN * 1.3)

        self.play(Write(sum_title))
        self.play(FadeIn(row1), FadeIn(row2))
        self.wait(0.5)
        self.play(FadeIn(row3))
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, sum_title, row1, row2, row3)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "MeanTestScene",
        "id": "ch08-8.2-mean-test",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "均值检验：Z 检验与 t 检验",
        "description": "并排展示 Z 检验与 t 检验的拒绝域，演示自由度增大时 t 临界值收缩至 Z 临界值 1.96。",
    },
]
