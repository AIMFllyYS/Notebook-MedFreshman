"""第 6.3 节 · 正态总体的抽样分布定理

演示四大定理：
  定理1: X̄ ~ N(μ, σ²/n)
  定理2: (n-1)S²/σ² ~ χ²(n-1)
  定理3: (X̄-μ)/(S/√n) ~ t(n-1)
  定理4: 两样本 F 分布（简要说明）

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学公式用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
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
import numpy as np

CJK = "Microsoft YaHei"


def normal_pdf(x, mu=0.0, sigma=1.0):
    return np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))


def chi2_pdf(x, k):
    if k <= 0:
        return 0.0
    from math import gamma
    if x <= 0:
        return 0.0
    return (x ** (k / 2.0 - 1) * np.exp(-x / 2.0)) / (2 ** (k / 2.0) * gamma(k / 2.0))


def t_pdf(x, nu):
    from math import gamma
    coeff = gamma((nu + 1) / 2.0) / (np.sqrt(nu * np.pi) * gamma(nu / 2.0))
    return coeff * (1 + x * x / nu) ** (-(nu + 1) / 2.0)


class NormalSamplingScene(Scene):
    def construct(self):
        # ── 总标题 ──────────────────────────────────────────────────────────
        main_title = Text("正态总体的抽样分布定理", font=CJK, weight=BOLD).scale(0.75)
        main_title.to_edge(UP, buff=0.3)
        self.play(Write(main_title))
        self.wait(0.4)

        # ════════════════════════════════════════════════════════════════════
        # 幕 0：总体介绍
        # ════════════════════════════════════════════════════════════════════
        pop_label = Text("设总体", font=CJK).scale(0.55)
        pop_formula = MathTex(r"X \sim N(\mu,\, \sigma^2)").scale(0.9)
        pop_group = VGroup(pop_label, pop_formula).arrange(RIGHT, buff=0.2)
        pop_group.next_to(main_title, DOWN, buff=0.4)

        sample_label = Text("抽取容量为 n 的样本，计算统计量", font=CJK).scale(0.5)
        sample_label.next_to(pop_group, DOWN, buff=0.3)

        self.play(FadeIn(pop_group))
        self.play(Write(sample_label))
        self.wait(0.6)

        self.play(FadeOut(VGroup(pop_group, sample_label)))
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 幕 1：定理一  X̄ ~ N(μ, σ²/n)
        # ════════════════════════════════════════════════════════════════════
        thm1_tag = Text("定理一", font=CJK, weight=BOLD, color=BLUE_D).scale(0.6)
        thm1_tag.next_to(main_title, DOWN, buff=0.35).to_edge(LEFT, buff=0.5)

        thm1_cond = Text("σ² 已知，则样本均值", font=CJK).scale(0.5)
        thm1_formula = MathTex(r"\bar{X} \sim N\!\left(\mu,\, \frac{\sigma^2}{n}\right)").scale(0.9)
        thm1_group = VGroup(thm1_cond, thm1_formula).arrange(RIGHT, buff=0.2)
        thm1_group.next_to(thm1_tag, RIGHT, buff=0.35)

        self.play(FadeIn(thm1_tag), Write(thm1_group))
        self.wait(0.5)

        # 标准化提示
        std_label = Text("标准化后：", font=CJK).scale(0.48)
        std_formula = MathTex(
            r"\frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim N(0,1)"
        ).scale(0.85)
        std_line = VGroup(std_label, std_formula).arrange(RIGHT, buff=0.2)
        std_line.next_to(thm1_group, DOWN, buff=0.3)
        self.play(Write(std_line))
        self.wait(0.4)

        # 坐标轴 + 密度曲线（N(0,1) vs N(0,1/2) 对比 n 增大效果）
        axes1 = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 0.7, 0.2],
            x_length=6,
            y_length=2.6,
            axis_config={"include_numbers": False, "tip_width": 0.12, "tip_height": 0.12},
        ).scale(0.85).next_to(std_line, DOWN, buff=0.25)

        curve_n1 = axes1.plot(
            lambda x: normal_pdf(x, 0, 1.0),
            x_range=[-3.5, 3.5],
            color=BLUE,
            stroke_width=2.5,
        )
        curve_n4 = axes1.plot(
            lambda x: normal_pdf(x, 0, 0.5),
            x_range=[-3.5, 3.5],
            color=YELLOW,
            stroke_width=2.5,
        )
        legend_n1 = Text("n=1", font=CJK, color=BLUE).scale(0.4).next_to(axes1, RIGHT, buff=0.15).shift(UP * 0.3)
        legend_n4 = Text("n=4", font=CJK, color=YELLOW).scale(0.4).next_to(legend_n1, DOWN, buff=0.1)

        self.play(Create(axes1))
        self.play(Create(curve_n1))
        self.play(Create(curve_n4), FadeIn(VGroup(legend_n1, legend_n4)))

        insight1 = Text("n 越大，分布越集中于 μ", font=CJK, color=GREEN).scale(0.45)
        insight1.next_to(axes1, DOWN, buff=0.2)
        self.play(FadeIn(insight1))
        self.wait(1.0)

        # 高亮结论框
        box1 = SurroundingRectangle(thm1_formula, color=BLUE, buff=0.12, stroke_width=2)
        self.play(Create(box1))
        self.wait(0.6)

        grp1 = VGroup(
            thm1_tag, thm1_group, std_line,
            axes1, curve_n1, curve_n4,
            legend_n1, legend_n4, insight1, box1,
        )
        self.play(FadeOut(grp1))
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 幕 2：定理二  (n-1)S²/σ² ~ χ²(n-1)
        # ════════════════════════════════════════════════════════════════════
        thm2_tag = Text("定理二", font=CJK, weight=BOLD, color=ORANGE).scale(0.6)
        thm2_tag.next_to(main_title, DOWN, buff=0.35).to_edge(LEFT, buff=0.5)

        thm2_cond = Text("样本方差 S² 满足：", font=CJK).scale(0.5)
        thm2_formula = MathTex(
            r"\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)"
        ).scale(0.9)
        thm2_group = VGroup(thm2_cond, thm2_formula).arrange(RIGHT, buff=0.2)
        thm2_group.next_to(thm2_tag, RIGHT, buff=0.35)

        thm2_note = Text("且与 X̄ 相互独立", font=CJK, color=GOLD).scale(0.48)
        thm2_note.next_to(thm2_group, DOWN, buff=0.2)

        self.play(FadeIn(thm2_tag), Write(thm2_group))
        self.play(FadeIn(thm2_note))
        self.wait(0.5)

        # χ²(k) 密度曲线对比不同 k
        axes2 = Axes(
            x_range=[0, 14, 2],
            y_range=[0, 0.28, 0.1],
            x_length=6,
            y_length=2.5,
            axis_config={"include_numbers": False, "tip_width": 0.12, "tip_height": 0.12},
        ).scale(0.85).next_to(thm2_note, DOWN, buff=0.3)

        curve_chi2_3 = axes2.plot(
            lambda x: chi2_pdf(x, 3),
            x_range=[0.01, 14],
            color=ORANGE,
            stroke_width=2.5,
        )
        curve_chi2_6 = axes2.plot(
            lambda x: chi2_pdf(x, 6),
            x_range=[0.01, 14],
            color=RED,
            stroke_width=2.5,
        )
        leg2a = Text("k=3", font=CJK, color=ORANGE).scale(0.4).next_to(axes2, RIGHT, buff=0.15).shift(UP * 0.3)
        leg2b = Text("k=6", font=CJK, color=RED).scale(0.4).next_to(leg2a, DOWN, buff=0.1)

        self.play(Create(axes2))
        self.play(Create(curve_chi2_3), Create(curve_chi2_6), FadeIn(VGroup(leg2a, leg2b)))
        self.wait(0.4)

        insight2 = Text("自由度 = n-1（损失 1 个自由度用于估计 μ）", font=CJK, color=ORANGE).scale(0.42)
        insight2.next_to(axes2, DOWN, buff=0.2)
        self.play(FadeIn(insight2))
        self.wait(0.8)

        box2 = SurroundingRectangle(thm2_formula, color=ORANGE, buff=0.12, stroke_width=2)
        self.play(Create(box2))
        self.wait(0.6)

        grp2 = VGroup(
            thm2_tag, thm2_group, thm2_note,
            axes2, curve_chi2_3, curve_chi2_6,
            leg2a, leg2b, insight2, box2,
        )
        self.play(FadeOut(grp2))
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 幕 3：定理三  t 分布  (X̄-μ)/(S/√n) ~ t(n-1)
        # ════════════════════════════════════════════════════════════════════
        thm3_tag = Text("定理三", font=CJK, weight=BOLD, color=GREEN_D).scale(0.6)
        thm3_tag.next_to(main_title, DOWN, buff=0.35).to_edge(LEFT, buff=0.5)

        thm3_cond = Text("σ² 未知，用 S 替代：", font=CJK).scale(0.5)
        thm3_formula = MathTex(
            r"\frac{\bar{X} - \mu}{S / \sqrt{n}} \sim t(n-1)"
        ).scale(0.9)
        thm3_group = VGroup(thm3_cond, thm3_formula).arrange(RIGHT, buff=0.2)
        thm3_group.next_to(thm3_tag, RIGHT, buff=0.35)

        self.play(FadeIn(thm3_tag), Write(thm3_group))
        self.wait(0.4)

        # 关键说明（拆成纯英文 MathTex + 中文 Text）
        cost_formula = MathTex(r"\sigma^2", r"\to", r"S^2").scale(0.85)
        cost_formula.next_to(thm3_group, DOWN, buff=0.3)
        cost_label = Text("代价：自由度变为 n-1，尾部更重", font=CJK, color=RED).scale(0.46)
        cost_label.next_to(cost_formula, RIGHT, buff=0.25)

        self.play(FadeIn(cost_formula), Write(cost_label))
        self.wait(0.4)

        # t vs 标准正态 曲线
        axes3 = Axes(
            x_range=[-4.5, 4.5, 1],
            y_range=[0, 0.44, 0.1],
            x_length=6,
            y_length=2.5,
            axis_config={"include_numbers": False, "tip_width": 0.12, "tip_height": 0.12},
        ).scale(0.85).next_to(cost_label, DOWN, buff=0.3)

        curve_norm = axes3.plot(
            lambda x: normal_pdf(x, 0, 1.0),
            x_range=[-4.5, 4.5],
            color=BLUE,
            stroke_width=2,
        )
        curve_t5 = axes3.plot(
            lambda x: t_pdf(x, 5),
            x_range=[-4.5, 4.5],
            color=GREEN_D,
            stroke_width=2.5,
        )
        leg3a = Text("N(0,1)", font=CJK, color=BLUE).scale(0.38).next_to(axes3, RIGHT, buff=0.1).shift(UP * 0.3)
        leg3b = Text("t(5)", font=CJK, color=GREEN_D).scale(0.38).next_to(leg3a, DOWN, buff=0.1)

        self.play(Create(axes3))
        self.play(Create(curve_norm), Create(curve_t5), FadeIn(VGroup(leg3a, leg3b)))
        self.wait(0.4)

        heavy_tail = Text("t 分布尾部更重，n 增大则趋向 N(0,1)", font=CJK, color=GREEN).scale(0.42)
        heavy_tail.next_to(axes3, DOWN, buff=0.2)
        self.play(FadeIn(heavy_tail))
        self.wait(0.8)

        box3 = SurroundingRectangle(thm3_formula, color=GREEN_D, buff=0.12, stroke_width=2)
        self.play(Create(box3))
        self.wait(0.6)

        grp3 = VGroup(
            thm3_tag, thm3_group, cost_formula, cost_label,
            axes3, curve_norm, curve_t5,
            leg3a, leg3b, heavy_tail, box3,
        )
        self.play(FadeOut(grp3))
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 幕 4：定理四  F 分布（两总体情形）
        # ════════════════════════════════════════════════════════════════════
        thm4_tag = Text("定理四", font=CJK, weight=BOLD, color=RED).scale(0.6)
        thm4_tag.next_to(main_title, DOWN, buff=0.35).to_edge(LEFT, buff=0.5)

        thm4_intro = Text("两个正态总体：", font=CJK).scale(0.5)
        thm4_pops = MathTex(
            r"X \sim N(\mu_1, \sigma_1^2),\quad Y \sim N(\mu_2, \sigma_2^2)"
        ).scale(0.72)
        thm4_row1 = VGroup(thm4_intro, thm4_pops).arrange(RIGHT, buff=0.2)
        thm4_row1.next_to(thm4_tag, RIGHT, buff=0.35)

        thm4_result_label = Text("样本方差之比：", font=CJK).scale(0.5)
        thm4_formula = MathTex(
            r"F = \frac{S_1^2 / \sigma_1^2}{S_2^2 / \sigma_2^2} \sim F(n_1-1,\, n_2-1)"
        ).scale(0.82)
        thm4_row2 = VGroup(thm4_result_label, thm4_formula).arrange(RIGHT, buff=0.2)
        thm4_row2.next_to(thm4_row1, DOWN, buff=0.35)

        self.play(FadeIn(thm4_tag), Write(thm4_row1))
        self.play(Write(thm4_row2))
        self.wait(0.5)

        # F 分布曲线示意
        def f_pdf(x, d1, d2):
            from math import gamma
            if x <= 0:
                return 0.0
            try:
                g = (gamma((d1 + d2) / 2.0) / (gamma(d1 / 2.0) * gamma(d2 / 2.0)))
                r = (d1 / d2) ** (d1 / 2.0)
                num = x ** (d1 / 2.0 - 1)
                den = (1 + d1 * x / d2) ** ((d1 + d2) / 2.0)
                return g * r * num / den
            except Exception:
                return 0.0

        axes4 = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.0, 0.3],
            x_length=5.5,
            y_length=2.4,
            axis_config={"include_numbers": False, "tip_width": 0.12, "tip_height": 0.12},
        ).scale(0.85).next_to(thm4_row2, DOWN, buff=0.3)

        curve_f = axes4.plot(
            lambda x: f_pdf(x, 5, 10),
            x_range=[0.01, 5],
            color=RED,
            stroke_width=2.5,
        )
        leg4 = Text("F(5,10)", font=CJK, color=RED).scale(0.4).next_to(axes4, RIGHT, buff=0.1)

        self.play(Create(axes4))
        self.play(Create(curve_f), FadeIn(leg4))
        self.wait(0.4)

        f_note = Text("σ₁²=σ₂² 时分母的 σ 相消，常用于方差齐性检验", font=CJK, color=GOLD).scale(0.42)
        f_note.next_to(axes4, DOWN, buff=0.2)
        self.play(FadeIn(f_note))
        self.wait(0.8)

        box4 = SurroundingRectangle(thm4_formula, color=RED, buff=0.12, stroke_width=2)
        self.play(Create(box4))
        self.wait(0.6)

        grp4 = VGroup(
            thm4_tag, thm4_row1, thm4_row2,
            axes4, curve_f, leg4, f_note, box4,
        )
        self.play(FadeOut(grp4))
        self.wait(0.2)

        # ════════════════════════════════════════════════════════════════════
        # 幕 5：总结对照表
        # ════════════════════════════════════════════════════════════════════
        summary_title = Text("四大定理汇总", font=CJK, weight=BOLD).scale(0.62)
        summary_title.next_to(main_title, DOWN, buff=0.4)
        self.play(Write(summary_title))

        rows_text = [
            ("定理一", r"\bar{X} \sim N(\mu, \sigma^2/n)", "σ² 已知"),
            ("定理二", r"\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)", "独立于 X̄"),
            ("定理三", r"\frac{\bar{X}-\mu}{S/\sqrt{n}} \sim t(n-1)", "σ² 未知"),
            ("定理四", r"F = \frac{S_1^2/\sigma_1^2}{S_2^2/\sigma_2^2} \sim F(n_1-1,n_2-1)", "两总体"),
        ]
        colors = [BLUE_D, ORANGE, GREEN_D, RED]

        row_groups = VGroup()
        for i, (label_str, formula_str, cond_str) in enumerate(rows_text):
            label = Text(label_str, font=CJK, color=colors[i]).scale(0.48)
            formula = MathTex(formula_str, color=WHITE).scale(0.6)
            cond = Text(cond_str, font=CJK, color=GOLD).scale(0.40)
            row = VGroup(label, formula, cond).arrange(RIGHT, buff=0.35)
            row_groups.add(row)

        row_groups.arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        row_groups.next_to(summary_title, DOWN, buff=0.3)

        for row in row_groups:
            self.play(FadeIn(row))
            self.wait(0.25)

        # 最终高亮框
        final_box = SurroundingRectangle(row_groups, color=WHITE, buff=0.18, stroke_width=1.5)
        self.play(Create(final_box))
        self.wait(1.2)

        self.play(FadeOut(VGroup(summary_title, row_groups, final_box, main_title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "NormalSamplingScene",
        "id": "ch06-6.3-normal-sampling",
        "chapterId": "ch06",
        "sectionId": "6.3",
        "title": "正态总体的四大抽样分布定理",
        "description": "逐幕演示 X̄、(n-1)S²/σ²、t 统计量、F 统计量各服从的分布及其条件，最终汇总对照表。",
    },
]
