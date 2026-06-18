"""
Ch08 - 两样本检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class TwoSampleScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("两正态总体均值的比较", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        h_text = Text("H₀: μ₁ = μ₂    H₁: μ₁ ≠ μ₂", font_size=22, color=WHITE).next_to(title, DOWN, buff=0.35)
        self.play(Write(h_text))

        axes1 = Axes(
            x_range=[0, 12, 2], y_range=[0, 0.35, 0.1],
            x_length=4.5, y_length=2.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(LEFT * 3.5 + DOWN * 0.3)
        axes2 = Axes(
            x_range=[0, 12, 2], y_range=[0, 0.35, 0.1],
            x_length=4.5, y_length=2.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(RIGHT * 3.5 + DOWN * 0.3)

        mu1, sigma1, n1 = 5, 1.2, 20
        mu2, sigma2, n2 = 6.5, 1.2, 25

        pdf1 = axes1.plot(lambda x: stats.norm.pdf(x, mu1, sigma1), x_range=[1, 9, 0.05], color=BLUE, stroke_width=3)
        pdf2 = axes2.plot(lambda x: stats.norm.pdf(x, mu2, sigma2), x_range=[2, 11, 0.05], color=ORANGE, stroke_width=3)

        lbl1 = Text("总体 1  N(μ₁,σ₁²)", font_size=16, color=BLUE).next_to(axes1, UP, buff=0.1)
        lbl2 = Text("总体 2  N(μ₂,σ₂²)", font_size=16, color=ORANGE).next_to(axes2, UP, buff=0.1)

        self.play(Create(axes1), Create(axes2), run_time=0.5)
        self.play(Create(pdf1), Create(pdf2), FadeIn(lbl1), FadeIn(lbl2), run_time=1)

        sample_dots1 = VGroup()
        sample_dots2 = VGroup()
        np.random.seed(42)
        for _ in range(8):
            x1 = np.random.normal(mu1, sigma1)
            x2 = np.random.normal(mu2, sigma2)
            d1 = Dot(axes1.c2p(x1, 0.02), color=BLUE_C, radius=0.06)
            d2 = Dot(axes2.c2p(x2, 0.02), color=ORANGE, radius=0.06)
            sample_dots1.add(d1)
            sample_dots2.add(d2)

        samp_lbl = Text("从各总体抽样", font_size=18, color=YELLOW).shift(DOWN * 0.2)
        self.play(Write(samp_lbl), LaggedStart(*[GrowFromCenter(d) for d in sample_dots1], lag_ratio=0.05), LaggedStart(*[GrowFromCenter(d) for d in sample_dots2], lag_ratio=0.05), run_time=1.2)

        diff_text = Text("构造差值统计量: x̄₁ - x̄₂", font_size=20, color=YELLOW).shift(DOWN * 1.5)
        self.play(Write(diff_text))

        sp2 = ((n1 - 1) * sigma1**2 + (n2 - 1) * sigma2**2) / (n1 + n2 - 2)
        pool_text = Text(f"联合方差 S²p = {sp2:.2f}", font_size=20, color=GREEN_B).shift(DOWN * 2.2)
        self.play(Write(pool_text))

        t_stat = (mu1 - mu2) / np.sqrt(sp2 * (1/n1 + 1/n2))
        stat_text = Text(f"t = (x̄₁-x̄₂) / SE ≈ {t_stat:.2f}", font_size=20, color=WHITE).shift(DOWN * 2.9)
        self.play(Write(stat_text))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
