"""
Ch08 - F检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class FTestScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("两正态总体方差的 F 检验", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        h_text = Text("H₀: σ₁² = σ₂²    统计量 F = S₁²/S₂² ~ F(n₁-1, n₂-1)", font_size=20, color=WHITE).next_to(title, DOWN, buff=0.35)
        self.play(Write(h_text))

        axes = Axes(
            x_range=[0, 5, 1], y_range=[0, 1.2, 0.2],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.5)
        self.play(Create(axes), run_time=0.6)

        params = [(5, 10), (10, 10), (20, 20)]
        colors = [BLUE, GREEN, ORANGE]
        curves = VGroup()
        labels = VGroup()
        for (df1, df2), color in zip(params, colors):
            curve = axes.plot(
                lambda x, d1=df1, d2=df2: stats.f.pdf(x, d1, d2) if x > 0.05 else 0,
                x_range=[0.05, 5, 0.05], color=color, stroke_width=3
            )
            lbl = Text(f"({df1},{df2})", font_size=16, color=color).next_to(axes.c2p(1.5, stats.f.pdf(1.5, df1, df2)), UP, buff=0.05)
            curves.add(curve)
            labels.add(lbl)

        self.play(
            LaggedStart(*[Create(c) for c in curves], lag_ratio=0.3),
            LaggedStart(*[FadeIn(l) for l in labels], lag_ratio=0.3),
            run_time=1.8
        )

        ratio_text = Text("F = 较大样本方差 / 较小样本方差  (≥ 1)", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.9)
        self.play(Write(ratio_text))

        df1, df2 = 10, 10
        alpha = 0.05
        f_crit = stats.f.ppf(1 - alpha, df1, df2)

        reject_area = axes.get_area(curves[1], x_range=[f_crit, 5], color=RED, opacity=0.5)
        crit_line = DashedLine(axes.c2p(f_crit, 0), axes.c2p(f_crit, 1.0), color=RED, stroke_width=2)
        crit_lbl = Text(f"F_crit = {f_crit:.2f}", font_size=18, color=RED).next_to(crit_line, UP)

        trick = Text("技巧：大方差放分子，F ≥ 1", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.35)
        self.play(
            FadeIn(reject_area), Create(crit_line), Write(crit_lbl),
            Transform(ratio_text, trick),
            run_time=1
        )
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
