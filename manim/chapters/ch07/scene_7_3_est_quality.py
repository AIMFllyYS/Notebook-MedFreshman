"""第 7.3 节 · 估计量的评选标准 —— 靶心类比展示无偏性、有效性与相合性。

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
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    MathTex,
    NumberLine,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    AnimationGroup,
    GrowArrow,
    always_redraw,
    ValueTracker,
)
import numpy as np

CJK = "Microsoft YaHei"


def make_target_rings(center, radii, colors):
    """Build concentric ring circles for a target diagram."""
    rings = VGroup()
    for r, c in zip(reversed(radii), reversed(colors)):
        ring = Circle(radius=r, color=c, stroke_width=2)
        ring.set_fill(c, opacity=0.18)
        ring.move_to(center)
        rings.add(ring)
    return rings


def make_scatter_dots(center, n, spread, seed=42):
    """Return VGroup of dots scattered around center."""
    rng = np.random.default_rng(seed)
    angles = rng.uniform(0, 2 * np.pi, n)
    radii_vals = rng.rayleigh(spread, n)
    dots = VGroup()
    for a, r in zip(angles, radii_vals):
        offset = np.array([r * np.cos(a), r * np.sin(a), 0])
        d = Dot(center + offset, radius=0.055, color=YELLOW)
        dots.add(d)
    return dots


class EstQualityScene(Scene):
    def construct(self):
        # ── 总标题 ──────────────────────────────────────────────────────────
        title = (
            Text("估计量的评选标准", font=CJK, weight=BOLD)
            .scale(0.72)
            .to_edge(UP, buff=0.25)
        )
        self.play(Write(title))
        self.wait(0.3)

        # ════════════════════════════════════════════════════════════════════
        # 第一幕：靶心类比说明三个概念
        # ════════════════════════════════════════════════════════════════════
        intro = (
            Text("用靶心类比理解三个标准", font=CJK)
            .scale(0.52)
            .next_to(title, DOWN, buff=0.15)
        )
        self.play(FadeIn(intro))
        self.wait(0.5)

        # ── 无偏性 ──────────────────────────────────────────────────────────
        sec1 = (
            Text("1. 无偏性", font=CJK, color=BLUE)
            .scale(0.6)
            .to_edge(LEFT, buff=0.8)
            .shift(UP * 1.2)
        )
        formula_unbias = MathTex(r"E[\hat{\theta}] = \theta", color=BLUE).scale(0.7)
        formula_unbias.next_to(sec1, RIGHT, buff=0.4)
        explain1 = (
            Text("估计量的期望等于真实参数", font=CJK)
            .scale(0.44)
            .next_to(sec1, DOWN, buff=0.2)
            .align_to(sec1, LEFT)
        )
        self.play(Write(sec1), Write(formula_unbias))
        self.play(FadeIn(explain1))
        self.wait(0.6)

        # ── 有效性 ──────────────────────────────────────────────────────────
        sec2 = (
            Text("2. 有效性", font=CJK, color=GREEN)
            .scale(0.6)
            .to_edge(LEFT, buff=0.8)
        )
        formula_eff = MathTex(
            r"D[\hat{\theta}_1] \leq D[\hat{\theta}_2]", color=GREEN
        ).scale(0.7)
        formula_eff.next_to(sec2, RIGHT, buff=0.4)
        explain2 = (
            Text("同为无偏，方差更小者更有效", font=CJK)
            .scale(0.44)
            .next_to(sec2, DOWN, buff=0.2)
            .align_to(sec2, LEFT)
        )
        self.play(Write(sec2), Write(formula_eff))
        self.play(FadeIn(explain2))
        self.wait(0.6)

        # ── 相合性 ──────────────────────────────────────────────────────────
        sec3 = (
            Text("3. 相合性", font=CJK, color=ORANGE)
            .scale(0.6)
            .to_edge(LEFT, buff=0.8)
            .shift(DOWN * 1.2)
        )
        formula_con = MathTex(
            r"\hat{\theta}_n \xrightarrow{P} \theta \quad (n\to\infty)", color=ORANGE
        ).scale(0.7)
        formula_con.next_to(sec3, RIGHT, buff=0.4)
        explain3 = (
            Text("样本量增大时依概率收敛到真值", font=CJK)
            .scale(0.44)
            .next_to(sec3, DOWN, buff=0.2)
            .align_to(sec3, LEFT)
        )
        self.play(Write(sec3), Write(formula_con))
        self.play(FadeIn(explain3))
        self.wait(0.8)

        self.play(
            FadeOut(
                VGroup(intro, sec1, formula_unbias, explain1,
                       sec2, formula_eff, explain2,
                       sec3, formula_con, explain3)
            )
        )
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 第二幕：2×2 靶心四象限
        # ════════════════════════════════════════════════════════════════════
        quad_title = (
            Text("四象限靶心图：无偏 x 有效", font=CJK, weight=BOLD)
            .scale(0.58)
            .next_to(title, DOWN, buff=0.18)
        )
        self.play(FadeIn(quad_title))

        # 靶心参数
        RING_R = [0.55, 0.38, 0.20]
        RING_C = [BLUE_D, BLUE, WHITE]

        # 四个靶心位置
        c1 = np.array([-3.0,  1.0, 0])   # 无偏 + 有效
        c2 = np.array([ 1.0,  1.0, 0])   # 无偏 + 低效
        c3 = np.array([-3.0, -1.5, 0])   # 有偏 + 低方差
        c4 = np.array([ 1.0, -1.5, 0])   # 有偏 + 高方差

        targets = VGroup(
            make_target_rings(c1, RING_R, RING_C),
            make_target_rings(c2, RING_R, RING_C),
            make_target_rings(c3, RING_R, RING_C),
            make_target_rings(c4, RING_R, RING_C),
        )
        self.play(Create(targets, lag_ratio=0.25))
        self.wait(0.3)

        # 散点：① 无偏有效（小散布，围绕靶心）
        dots1 = make_scatter_dots(c1, n=12, spread=0.10, seed=1)
        # ② 无偏低效（大散布，但均值仍在靶心）
        dots2 = make_scatter_dots(c2, n=12, spread=0.30, seed=2)
        # ③ 有偏低方差（集中但偏离靶心）
        bias3 = np.array([0.28, 0.20, 0])
        dots3 = make_scatter_dots(c3 + bias3, n=12, spread=0.10, seed=3)
        # ④ 有偏高方差（最差）
        dots4 = make_scatter_dots(c4 + bias3, n=12, spread=0.30, seed=4)

        all_dots = VGroup(dots1, dots2, dots3, dots4)
        self.play(FadeIn(all_dots, lag_ratio=0.05))
        self.wait(0.4)

        # 子标题标签
        lbl1 = Text("无偏 + 有效", font=CJK, color=GREEN).scale(0.38)
        lbl1.next_to(targets[0], UP, buff=0.08)
        lbl2 = Text("无偏 + 低效", font=CJK, color=YELLOW).scale(0.38)
        lbl2.next_to(targets[1], UP, buff=0.08)
        lbl3 = Text("有偏 + 低方差", font=CJK, color=ORANGE).scale(0.38)
        lbl3.next_to(targets[2], DOWN, buff=0.08)
        lbl4 = Text("有偏 + 高方差", font=CJK, color=RED).scale(0.38)
        lbl4.next_to(targets[3], DOWN, buff=0.08)

        self.play(FadeIn(VGroup(lbl1, lbl2, lbl3, lbl4)))
        self.wait(1.0)

        # 高亮最优：绿色圆圈框住第①象限
        highlight = Circle(radius=0.75, color=GREEN, stroke_width=4)
        highlight.move_to(c1)
        best_note = Text("最优估计量", font=CJK, color=GREEN).scale(0.42)
        best_note.next_to(highlight, RIGHT, buff=0.15)
        self.play(Create(highlight), FadeIn(best_note))
        self.wait(1.0)

        self.play(
            FadeOut(
                VGroup(targets, all_dots, lbl1, lbl2, lbl3, lbl4,
                       highlight, best_note, quad_title)
            )
        )
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 第三幕：相合性——随 n 增大的收缩动画
        # ════════════════════════════════════════════════════════════════════
        con_title = (
            Text("相合性：样本量增大，估计精度提升", font=CJK, weight=BOLD)
            .scale(0.55)
            .next_to(title, DOWN, buff=0.18)
        )
        self.play(FadeIn(con_title))

        # 数轴
        ax = NumberLine(
            x_range=[-1.5, 1.5, 0.5],
            length=9,
            include_numbers=True,
            include_tip=True,
        ).shift(DOWN * 0.1)
        theta_line = Line(
            start=ax.n2p(0) + DOWN * 0.3,
            end=ax.n2p(0) + UP * 0.5,
            color=RED,
            stroke_width=3,
        )
        theta_label = MathTex(r"\theta", color=RED).scale(0.75)
        theta_label.next_to(theta_line, UP, buff=0.1)

        self.play(Create(ax), Create(theta_line), FadeIn(theta_label))
        self.wait(0.3)

        n_label_text = Text("n = 10", font=CJK).scale(0.52).to_edge(LEFT, buff=0.6).shift(UP * 0.9)
        self.play(FadeIn(n_label_text))

        # 三组不同 n 的分布宽度（用矩形色带表示置信区间宽度）
        stages = [
            ("n = 10",  0.90),
            ("n = 50",  0.42),
            ("n = 200", 0.18),
        ]

        band = Rectangle(
            width=0.90 * 9 / 3,   # 初始宽度（坐标换像素用 ax.n2p 更精确，此处简化）
            height=0.45,
            color=BLUE,
            stroke_width=2,
        ).set_fill(BLUE, opacity=0.28).move_to(ax.n2p(0) + DOWN * 0.22)

        # 重新用实际坐标计算宽度
        w0 = ax.n2p(stages[0][1])[0] - ax.n2p(-stages[0][1])[0]
        band.set_width(w0).move_to(np.array([ax.n2p(0)[0], ax.n2p(0)[1] - 0.22, 0]))

        self.play(FadeIn(band))
        self.wait(0.5)

        for n_str, half_w in stages[1:]:
            new_w = ax.n2p(half_w)[0] - ax.n2p(-half_w)[0]
            new_band = band.copy().set_width(new_w)
            new_label = Text(n_str, font=CJK).scale(0.52).to_edge(LEFT, buff=0.6).shift(UP * 0.9)
            self.play(
                Transform(band, new_band),
                Transform(n_label_text, new_label),
                run_time=1.0,
            )
            self.wait(0.7)

        # 最终注解
        con_note = (
            Text("宽度趋向 0，估计量依概率收敛到真值", font=CJK, color=GREEN)
            .scale(0.46)
            .next_to(ax, DOWN, buff=0.4)
        )
        con_formula = MathTex(
            r"P(|\hat{\theta}_n - \theta| > \varepsilon) \to 0"
        ).scale(0.65)
        con_formula.next_to(con_note, DOWN, buff=0.22)

        self.play(FadeIn(con_note), Write(con_formula))
        self.wait(1.2)

        # ── 尾声：三标准小结 ──────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(ax, theta_line, theta_label, band,
                           n_label_text, con_note, con_formula, con_title))
        )

        summary_title = (
            Text("三个评选标准小结", font=CJK, weight=BOLD)
            .scale(0.62)
            .next_to(title, DOWN, buff=0.25)
        )
        criteria = VGroup(
            Text("无偏性：均值命中真值", font=CJK, color=BLUE).scale(0.52),
            Text("有效性：方差尽可能小", font=CJK, color=GREEN).scale(0.52),
            Text("相合性：n 趋大时依概率趋真值", font=CJK, color=ORANGE).scale(0.52),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.38)
        criteria.next_to(summary_title, DOWN, buff=0.4)

        self.play(FadeIn(summary_title))
        for line in criteria:
            self.play(FadeIn(line))
            self.wait(0.4)
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, summary_title, criteria)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "EstQualityScene",
        "id": "ch07-7.3-estimator-quality",
        "chapterId": "ch07",
        "sectionId": "7.3",
        "title": "好估计量的三个标准：无偏、有效、相合",
        "description": "用靶心四象限类比和数轴收缩动画，直观展示无偏性、有效性与相合性的含义与区别。",
    },
]
