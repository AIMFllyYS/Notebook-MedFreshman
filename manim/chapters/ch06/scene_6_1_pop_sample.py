"""第 6.1 节 · 总体、样本与统计量

动画展示从正态总体大圆中随机抽取 n=8 个样本点，
计算样本均值 X-bar 和样本方差 S²，强调 n-1 分母保证无偏性。

中文文字用 Text（依赖 Microsoft YaHei）；数学符号用 MathTex（依赖 LaTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BLUE_E,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    AnimationGroup,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    RoundedRectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
)
import numpy as np

CJK = "Microsoft YaHei"

# 固定种子，使样本点位置可复现
_rng = np.random.default_rng(42)

# 8 个样本值（预先生成，模拟正态 μ=5, σ=1.5）
SAMPLE_VALS = [4.2, 6.1, 5.5, 3.8, 7.0, 5.2, 4.7, 6.3]
N = len(SAMPLE_VALS)


def _x_bar(vals):
    return sum(vals) / len(vals)


def _s_sq(vals):
    xb = _x_bar(vals)
    return sum((x - xb) ** 2 for x in vals) / (len(vals) - 1)


class PopSampleScene(Scene):
    def construct(self):
        # ── 0. 标题 ──────────────────────────────────────────────────────────
        title = Text(
            "总体、样本与统计量", font=CJK, weight=BOLD
        ).scale(0.72).to_edge(UP, buff=0.25)
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 绘制正态总体大圆 ──────────────────────────────────────────────
        pop_circle = Circle(radius=2.0, color=BLUE_D, stroke_width=3)
        pop_circle.set_fill(BLUE_E, opacity=0.18)
        pop_circle.shift(LEFT * 3.2 + DOWN * 0.5)

        pop_label = Text("总体", font=CJK, color=BLUE_D, weight=BOLD).scale(0.55)
        pop_label.next_to(pop_circle, UP, buff=0.12)

        pop_dist = Text("X ~ N(mu, sigma^2)", font=CJK, color=BLUE).scale(0.38)
        pop_dist.next_to(pop_circle, DOWN, buff=0.18)

        # 圆内密集点（模拟总体分布）
        _dot_rng = np.random.default_rng(7)
        dense_dots = VGroup()
        for _ in range(55):
            r = _dot_rng.uniform(0, 1.75)
            theta = _dot_rng.uniform(0, 2 * np.pi)
            pos = pop_circle.get_center() + np.array([r * np.cos(theta), r * np.sin(theta), 0])
            d = Dot(point=pos, radius=0.045, color=BLUE).set_opacity(0.55)
            dense_dots.add(d)

        self.play(Create(pop_circle), FadeIn(pop_label), FadeIn(pop_dist))
        self.play(FadeIn(dense_dots, lag_ratio=0.02))
        self.wait(0.5)

        # ── 2. 绘制样本框（右侧矩形） ────────────────────────────────────────
        sample_box = RoundedRectangle(
            width=4.8, height=4.0, corner_radius=0.3,
            color=GREEN_D, stroke_width=2.5
        )
        sample_box.set_fill(GREEN_D, opacity=0.07)
        sample_box.shift(RIGHT * 2.5 + DOWN * 0.5)

        sample_label = Text("样本  (n = 8)", font=CJK, color=GREEN_D, weight=BOLD).scale(0.52)
        sample_label.next_to(sample_box, UP, buff=0.12)

        self.play(Create(sample_box), FadeIn(sample_label))
        self.wait(0.3)

        # ── 3. 逐个抽样：箭头 + 数值出现在样本框内 ──────────────────────────
        # 样本框内 8 个位置（两列）
        box_center = sample_box.get_center()
        col_offsets = [LEFT * 1.1, RIGHT * 1.1]
        row_offsets = [UP * 1.3, UP * 0.43, DOWN * 0.43, DOWN * 1.3]
        val_positions = []
        for c in col_offsets:
            for r in row_offsets:
                val_positions.append(box_center + c + r)

        sample_val_mobs = []  # keep refs for later
        for i, (val, vpos) in enumerate(zip(SAMPLE_VALS, val_positions)):
            # 源点：总体圆内随机位置
            theta_i = _rng.uniform(0, 2 * np.pi) * 0.9
            r_i = _rng.uniform(0.3, 1.6)
            src = pop_circle.get_center() + np.array([
                r_i * np.cos(theta_i), r_i * np.sin(theta_i), 0
            ])

            # 箭头（短暂出现再消失）
            arrow = Arrow(
                start=src,
                end=vpos,
                buff=0.12,
                color=YELLOW,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.18,
            )
            # 数值标签
            val_text = MathTex(
                rf"x_{{{i+1}}} = {val}",
                color=WHITE
            ).scale(0.45).move_to(vpos)

            self.play(Create(arrow), run_time=0.22)
            self.play(FadeIn(val_text), FadeOut(arrow), run_time=0.2)
            sample_val_mobs.append(val_text)

        self.wait(0.4)

        # ── 4. 淡出样本框内数值，准备写公式 ────────────────────────────────
        subtitle_sample = Text(
            "统计量：样本的函数", font=CJK, color=GOLD, weight=BOLD
        ).scale(0.52).to_edge(DOWN, buff=0.22)
        self.play(Write(subtitle_sample))
        self.wait(0.4)

        # 淡出总体圆、样本框（保留标题），给公式腾出空间
        self.play(
            FadeOut(dense_dots),
            FadeOut(pop_circle),
            FadeOut(pop_label),
            FadeOut(pop_dist),
            FadeOut(sample_box),
            FadeOut(sample_label),
            FadeOut(subtitle_sample),
            *[FadeOut(m) for m in sample_val_mobs],
            run_time=0.7,
        )
        self.wait(0.2)

        # ── 5. 展示样本均值公式 ──────────────────────────────────────────────
        head_mean = Text("样本均值", font=CJK, color=GOLD, weight=BOLD).scale(0.6)
        head_mean.move_to(UP * 2.4 + LEFT * 3.5)

        mean_formula = MathTex(
            r"\bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i",
            color=WHITE
        ).scale(0.85).next_to(head_mean, RIGHT, buff=0.4)

        xbar_val = _x_bar(SAMPLE_VALS)
        mean_numeric = MathTex(
            rf"= \frac{{{'+'.join(str(v) for v in SAMPLE_VALS)}}}{{{N}}} \approx {xbar_val:.3f}",
            color=YELLOW
        ).scale(0.48).next_to(mean_formula, DOWN, buff=0.3).shift(RIGHT * 0.5)

        self.play(FadeIn(head_mean), Write(mean_formula))
        self.wait(0.4)
        self.play(FadeIn(mean_numeric))
        self.wait(0.6)

        # 高亮框住公式
        box_mean = SurroundingRectangle(mean_formula, color=GOLD, buff=0.12, stroke_width=2)
        self.play(Create(box_mean))
        self.wait(0.5)

        # ── 6. 展示样本方差公式 ──────────────────────────────────────────────
        head_var = Text("样本方差", font=CJK, color=ORANGE, weight=BOLD).scale(0.6)
        head_var.move_to(UP * 0.8 + LEFT * 3.5)

        var_formula = MathTex(
            r"S^2 = \frac{1}{n-1}\sum_{i=1}^{n}(X_i - \bar{X})^2",
            color=WHITE
        ).scale(0.8).next_to(head_var, RIGHT, buff=0.4)

        s2_val = _s_sq(SAMPLE_VALS)
        var_numeric = MathTex(
            rf"S^2 \approx {s2_val:.4f}",
            color=ORANGE
        ).scale(0.55).next_to(var_formula, DOWN, buff=0.3)

        self.play(FadeIn(head_var), Write(var_formula))
        self.wait(0.4)
        self.play(FadeIn(var_numeric))
        self.wait(0.4)

        # 高亮 n-1
        box_var = SurroundingRectangle(var_formula, color=ORANGE, buff=0.12, stroke_width=2)
        self.play(Create(box_var))
        self.wait(0.4)

        # ── 7. 说明 n-1 的意义（无偏性） ────────────────────────────────────
        unbias_head = Text("为什么分母用 n-1 ?", font=CJK, color=RED, weight=BOLD).scale(0.52)
        unbias_head.move_to(DOWN * 1.2 + LEFT * 0.5)

        unbias_formula = MathTex(
            r"E[S^2] = \sigma^2",
            color=GREEN
        ).scale(0.9).next_to(unbias_head, DOWN, buff=0.25)

        unbias_note = Text(
            "S² 是 sigma² 的无偏估计",
            font=CJK, color=GREEN
        ).scale(0.48).next_to(unbias_formula, RIGHT, buff=0.35)

        self.play(Write(unbias_head))
        self.play(Write(unbias_formula), FadeIn(unbias_note))
        self.wait(0.5)

        # 框住 E[S²] = σ²
        box_unb = SurroundingRectangle(
            VGroup(unbias_formula, unbias_note),
            color=GREEN, buff=0.14, stroke_width=2.5
        )
        self.play(Create(box_unb))
        self.wait(0.8)

        # ── 8. 小结 ──────────────────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(
                head_mean, mean_formula, mean_numeric, box_mean,
                head_var, var_formula, var_numeric, box_var,
                unbias_head, unbias_formula, unbias_note, box_unb,
            )),
            run_time=0.6,
        )

        line1 = Text("统计量 = 样本的函数，不含未知参数", font=CJK, color=YELLOW).scale(0.52)
        line2a = MathTex(r"\bar{X},\ S^2", color=WHITE).scale(0.6)
        line2b = Text("— 最常用的两个统计量", font=CJK, color=WHITE).scale(0.52)
        line2 = VGroup(line2a, line2b).arrange(RIGHT, buff=0.2)
        line3a = MathTex(r"S^2", color=GREEN).scale(0.58)
        line3b = Text("分母 n-1", font=CJK, color=GREEN).scale(0.48)
        line3c = MathTex(r"\Rightarrow E[S^2]=\sigma^2", color=GREEN).scale(0.58)
        line3d = Text("（无偏）", font=CJK, color=GREEN).scale(0.48)
        line3 = VGroup(line3a, line3b, line3c, line3d).arrange(RIGHT, buff=0.2)
        summary_lines = VGroup(line1, line2, line3).arrange(DOWN, buff=0.45).move_to(DOWN * 0.3)

        for line in summary_lines:
            self.play(FadeIn(line, shift=RIGHT * 0.25), run_time=0.5)
            self.wait(0.3)

        self.wait(1.2)

        self.play(FadeOut(VGroup(title, summary_lines)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "PopSampleScene",
        "id": "ch06-6.1-population-sample",
        "chapterId": "ch06",
        "sectionId": "6.1",
        "title": "总体、样本与统计量",
        "description": "从正态总体随机抽取 8 个样本，计算均值 X̄ 与无偏方差 S²，展示统计量是样本的函数。",
    },
]
