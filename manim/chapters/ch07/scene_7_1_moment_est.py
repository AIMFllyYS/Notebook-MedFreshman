"""第 7.1 节 · 矩估计法 —— 指数分布与均匀分布的矩估计演示。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。

思路：
  1. 介绍「替换」思想：总体矩 → 样本矩
  2. 指数分布 Exp(λ)：E[X]=1/λ，令 X̄=1/λ̂，解出 λ̂=1/X̄
  3. 模拟样本数值演示 λ̂ 随 n 增大收敛到真实 λ
  4. 均匀分布 U(0,θ)：二阶矩估计 θ̂=sqrt(3*(1/n)*Σxi²)
"""

import random

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GREEN,
    ITALIC,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Arrow,
    Create,
    DecimalNumber,
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

REGISTER = [
    {
        "scene": "MomentEstScene",
        "id": "ch07-7.1-moment-est",
        "chapterId": "ch07",
        "sectionId": "7.1",
        "title": "矩估计法：用样本矩替换总体矩",
        "description": "动画演示指数分布与均匀分布的矩估计推导，展示「用样本矩替换总体矩」的核心思想及估计量随 n 增大收敛到真实参数的过程。",
    },
]


class MomentEstScene(Scene):
    def construct(self):
        # ── 0. 标题 ──────────────────────────────────────────────────
        title = (
            Text("矩估计法", font=CJK, weight=BOLD)
            .scale(0.85)
            .to_edge(UP, buff=0.25)
        )
        subtitle = (
            Text("用样本矩替换总体矩", font=CJK, color=BLUE_D)
            .scale(0.5)
            .next_to(title, DOWN, buff=0.12)
        )
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(subtitle), run_time=0.5)
        self.wait(0.4)

        # ── 1. 核心思想 ───────────────────────────────────────────────
        idea_label = (
            Text("核心思想", font=CJK, weight=BOLD, color=YELLOW)
            .scale(0.55)
            .to_edge(LEFT, buff=0.6)
            .shift(UP * 1.5)
        )
        idea_eq = MathTex(
            r"E[X^k]", r"\;\longrightarrow\;", r"\frac{1}{n}\sum_{i=1}^n X_i^k"
        ).scale(0.75)
        idea_eq.next_to(idea_label, RIGHT, buff=0.4)

        idea_note = (
            Text("令总体 k 阶矩 = 样本 k 阶矩，解出参数估计量", font=CJK)
            .scale(0.42)
            .next_to(idea_eq, DOWN, buff=0.2)
        )

        # Color the arrow green to emphasize substitution
        idea_eq[1].set_color(GREEN)

        self.play(FadeIn(idea_label), Write(idea_eq), run_time=1.0)
        self.play(FadeIn(idea_note), run_time=0.6)
        self.wait(0.8)

        # ── 2. 指数分布矩估计 ────────────────────────────────────────
        self.play(FadeOut(VGroup(idea_label, idea_eq, idea_note)))

        # Section header
        sec1_title = (
            Text("指数分布  Exp(λ)  的矩估计", font=CJK, weight=BOLD, color=BLUE)
            .scale(0.55)
            .to_edge(UP, buff=1.1)
        )
        self.play(Write(sec1_title), run_time=0.7)

        # Step 1: population mean
        step1_label = Text("第 1 步：写出总体期望", font=CJK).scale(0.45).to_edge(LEFT, buff=0.8).shift(UP * 1.0)
        pop_mean = MathTex(r"E[X] = \frac{1}{\lambda}").scale(0.9).next_to(step1_label, RIGHT, buff=0.5)
        self.play(FadeIn(step1_label), Write(pop_mean), run_time=0.8)
        self.wait(0.5)

        # Step 2: replace population mean with sample mean
        step2_label = Text("第 2 步：用样本均值替换", font=CJK, color=GREEN).scale(0.45).to_edge(LEFT, buff=0.8)
        sub_arrow = Arrow(LEFT * 0.3, RIGHT * 0.3, color=GREEN).scale(0.6)

        eq_left = MathTex(r"E[X]").scale(0.85)
        eq_right = MathTex(r"\bar{X}").scale(0.85).set_color(GREEN)
        sub_arrow.next_to(eq_left, RIGHT, buff=0.2)
        eq_right.next_to(sub_arrow, RIGHT, buff=0.2)
        sub_group = VGroup(eq_left, sub_arrow, eq_right).next_to(step2_label, RIGHT, buff=0.5)

        self.play(FadeIn(step2_label), Write(sub_group), run_time=0.8)
        self.wait(0.4)

        # Step 3: substituted equation
        step3_label = Text("第 3 步：令样本矩 = 总体矩", font=CJK).scale(0.45).to_edge(LEFT, buff=0.8).shift(DOWN * 1.0)
        substituted = MathTex(r"\bar{X} = \frac{1}{\hat{\lambda}}").scale(0.9).next_to(step3_label, RIGHT, buff=0.5)
        self.play(FadeIn(step3_label), Write(substituted), run_time=0.8)
        self.wait(0.4)

        # Step 4: solve for lambda_hat
        step4_label = Text("第 4 步：解出估计量", font=CJK, weight=BOLD, color=YELLOW).scale(0.45).to_edge(LEFT, buff=0.8).shift(DOWN * 2.0)
        lambda_hat_eq = MathTex(r"\hat{\lambda} = \frac{1}{\bar{X}}").scale(1.0).set_color(YELLOW).next_to(step4_label, RIGHT, buff=0.5)
        box = SurroundingRectangle(lambda_hat_eq, color=YELLOW, buff=0.15)
        self.play(FadeIn(step4_label), Write(lambda_hat_eq), Create(box), run_time=0.9)
        self.wait(1.0)

        # ── 3. 数值演示：随 n 增大 λ̂→λ ─────────────────────────────
        self.play(
            FadeOut(VGroup(
                sec1_title, step1_label, pop_mean,
                step2_label, sub_group,
                step3_label, substituted,
                step4_label, lambda_hat_eq, box,
            ))
        )

        true_lambda = 2.0
        conv_title = (
            Text("数值演示：n 增大时  λ̂→λ", font=CJK, weight=BOLD, color=BLUE)
            .scale(0.55)
            .to_edge(UP, buff=1.1)
        )
        true_lam_label = (
            Text("真实参数：", font=CJK)
            .scale(0.48)
            .to_edge(LEFT, buff=0.8)
            .shift(UP * 1.5)
        )
        true_lam_val = MathTex(r"\lambda = 2.0").scale(0.8).next_to(true_lam_label, RIGHT, buff=0.3)
        self.play(Write(conv_title), FadeIn(true_lam_label), Write(true_lam_val), run_time=0.7)

        # Column headers
        n_header = Text("n", font=CJK, weight=BOLD).scale(0.5).shift(LEFT * 3.5 + UP * 0.6)
        xbar_header = Text("样本均值  X̄", font=CJK, weight=BOLD).scale(0.45).shift(LEFT * 0.5 + UP * 0.6)
        lhat_header = MathTex(r"\hat{\lambda}=1/\bar{X}").scale(0.6).shift(RIGHT * 2.5 + UP * 0.6)
        self.play(FadeIn(VGroup(n_header, xbar_header, lhat_header)), run_time=0.5)

        # Simulate samples from Exp(2)
        random.seed(42)

        def sim_exp(lam, n):
            s = sum(-1 / lam * (-(abs(random.random()) + 1e-9)) for _ in range(n))
            # Simple Box-Muller-free exponential: use -ln(U)/lambda
            return sum(-1.0 / lam * __import__("math").log(max(random.random(), 1e-9)) for _ in range(n)) / n

        sample_ns = [5, 20, 100, 500]
        rows = []
        for k, n in enumerate(sample_ns):
            xbar = sim_exp(true_lambda, n)
            lhat = 1.0 / xbar if xbar > 0 else float("inf")
            y_pos = 0.1 - k * 0.7

            n_text = Text(str(n), font=CJK).scale(0.48).shift(LEFT * 3.5 + UP * y_pos)
            xbar_text = Text(f"{xbar:.4f}", font=CJK).scale(0.48).shift(LEFT * 0.5 + UP * y_pos)
            lhat_color = GREEN if abs(lhat - true_lambda) < 0.3 else (ORANGE if abs(lhat - true_lambda) < 0.8 else RED)
            lhat_text = Text(f"{lhat:.4f}", font=CJK, color=lhat_color).scale(0.48).shift(RIGHT * 2.5 + UP * y_pos)
            rows.append(VGroup(n_text, xbar_text, lhat_text))
            self.play(FadeIn(rows[-1]), run_time=0.45)
            self.wait(0.3)

        # Annotation: convergence
        conv_note = (
            Text("随 n 增大，λ̂ 越来越接近真实值 λ=2", font=CJK, color=YELLOW)
            .scale(0.45)
            .to_edge(DOWN, buff=0.5)
        )
        self.play(Write(conv_note), run_time=0.6)
        self.wait(1.0)

        # ── 4. 均匀分布二阶矩估计 ────────────────────────────────────
        all_conv = VGroup(conv_title, true_lam_label, true_lam_val,
                          n_header, xbar_header, lhat_header, conv_note, *rows)
        self.play(FadeOut(all_conv))

        sec2_title = (
            Text("均匀分布  U(0,θ)  的二阶矩估计", font=CJK, weight=BOLD, color=ORANGE)
            .scale(0.55)
            .to_edge(UP, buff=1.1)
        )
        self.play(Write(sec2_title), run_time=0.7)

        # Second-order moment: E[X^2] = θ²/3
        u_step1_lbl = Text("二阶总体矩：", font=CJK).scale(0.45).to_edge(LEFT, buff=0.8).shift(UP * 1.3)
        u_pop2 = MathTex(r"E[X^2] = \frac{\theta^2}{3}").scale(0.85).next_to(u_step1_lbl, RIGHT, buff=0.4)
        self.play(FadeIn(u_step1_lbl), Write(u_pop2), run_time=0.8)
        self.wait(0.5)

        # Replace with sample second moment
        u_step2_lbl = Text("替换为样本二阶矩：", font=CJK, color=GREEN).scale(0.45).to_edge(LEFT, buff=0.8).shift(UP * 0.3)
        u_sub = MathTex(
            r"\frac{\hat{\theta}^2}{3} = \frac{1}{n}\sum_{i=1}^n X_i^2"
        ).scale(0.85).next_to(u_step2_lbl, RIGHT, buff=0.4)
        self.play(FadeIn(u_step2_lbl), Write(u_sub), run_time=0.8)
        self.wait(0.5)

        # Solve
        u_step3_lbl = Text("解出估计量：", font=CJK, weight=BOLD, color=YELLOW).scale(0.45).to_edge(LEFT, buff=0.8).shift(DOWN * 0.7)
        u_result = MathTex(
            r"\hat{\theta} = \sqrt{\,\frac{3}{n}\sum_{i=1}^n X_i^2\,}"
        ).scale(0.9).set_color(YELLOW).next_to(u_step3_lbl, RIGHT, buff=0.4)
        u_box = SurroundingRectangle(u_result, color=YELLOW, buff=0.15)
        self.play(FadeIn(u_step3_lbl), Write(u_result), Create(u_box), run_time=0.9)
        self.wait(1.0)

        # ── 5. 总结 ──────────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(
                sec2_title,
                u_step1_lbl, u_pop2,
                u_step2_lbl, u_sub,
                u_step3_lbl, u_result, u_box,
            ))
        )

        summary_title = (
            Text("矩估计法小结", font=CJK, weight=BOLD, color=WHITE)
            .scale(0.65)
            .to_edge(UP, buff=1.0)
        )
        self.play(Write(summary_title), run_time=0.6)

        steps = [
            "1. 写出总体 k 阶矩（含未知参数）",
            "2. 令其等于对应样本 k 阶矩",
            "3. 解方程，得到参数的矩估计量",
        ]
        step_objs = []
        for idx, s in enumerate(steps):
            t = (
                Text(s, font=CJK)
                .scale(0.5)
                .to_edge(LEFT, buff=1.0)
                .shift(UP * (0.8 - idx * 0.8))
            )
            step_objs.append(t)

        for obj in step_objs:
            self.play(FadeIn(obj), run_time=0.45)
            self.wait(0.2)

        insight = (
            Text("矩估计量直观、计算简便，是统计推断的重要基础方法", font=CJK, color=BLUE_D)
            .scale(0.44)
            .to_edge(DOWN, buff=0.8)
        )
        self.play(Write(insight), run_time=0.6)
        self.wait(1.5)

        # Fade out all
        self.play(FadeOut(VGroup(title, subtitle, summary_title, insight, *step_objs)), run_time=0.8)
