"""
Ch08 - Z检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class ZTestScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("正态总体均值的 Z 检验", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        mu0, sigma, n = 100, 15, 36
        x_bar = 105.2
        z_stat = (x_bar - mu0) / (sigma / np.sqrt(n))
        alpha = 0.05
        z_crit = stats.norm.ppf(1 - alpha / 2)

        setup = VGroup(
            Text(f"H₀: μ = {mu0}    H₁: μ ≠ {mu0}", font_size=22, color=WHITE),
            Text(f"σ² 已知 = {sigma}²,  n = {n},  x̄ = {x_bar}", font_size=20, color=GREY_A),
            Text(f"Z = (x̄ - μ₀) / (σ/√n) = {z_stat:.3f}", font_size=22, color=YELLOW),
        ).arrange(DOWN, buff=0.2).next_to(title, DOWN, buff=0.35)
        self.play(LaggedStart(*[Write(s) for s in setup], lag_ratio=0.3), run_time=1.5)

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=9, y_length=4,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 1.5)
        self.play(Create(axes), run_time=0.5)

        curve = axes.plot(lambda x: stats.norm.pdf(x), x_range=[-4, 4, 0.05], color=WHITE, stroke_width=3)
        self.play(Create(curve), run_time=0.6)

        left_reject = axes.get_area(curve, x_range=[-4, -z_crit], color=RED, opacity=0.5)
        right_reject = axes.get_area(curve, x_range=[z_crit, 4], color=RED, opacity=0.5)
        left_line = DashedLine(axes.c2p(-z_crit, 0), axes.c2p(-z_crit, 0.4), color=RED, stroke_width=2)
        right_line = DashedLine(axes.c2p(z_crit, 0), axes.c2p(z_crit, 0.4), color=RED, stroke_width=2)
        self.play(FadeIn(left_reject), FadeIn(right_reject), Create(left_line), Create(right_line), run_time=0.8)

        z_dot = Dot(axes.c2p(z_stat, stats.norm.pdf(z_stat)), color=YELLOW, radius=0.12)
        z_lbl = Text(f"Z = {z_stat:.2f}", font_size=18, color=YELLOW).next_to(z_dot, UP)
        self.play(GrowFromCenter(z_dot), Write(z_lbl), run_time=0.6)

        if abs(z_stat) > z_crit:
            decision = Text("Z 落入拒绝域 → 拒绝 H₀", font_size=24, color=RED)
        else:
            decision = Text("Z 未落入拒绝域 → 不拒绝 H₀", font_size=24, color=GREEN)
        decision.to_edge(DOWN, buff=0.35)
        self.play(Write(decision))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
