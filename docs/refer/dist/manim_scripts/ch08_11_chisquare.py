"""
Ch08 - 卡方检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class ChiSquareTestScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("正态总体方差的 χ² 检验", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        h_text = Text("H₀: σ² = σ₀²    检验统计量: (n-1)S²/σ₀² ~ χ²(n-1)", font_size=20, color=WHITE).next_to(title, DOWN, buff=0.35)
        self.play(Write(h_text))

        axes = Axes(
            x_range=[0, 35, 5], y_range=[0, 0.12, 0.02],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.5)
        self.play(Create(axes), run_time=0.6)

        dfs = [5, 10, 15, 20]
        colors = [BLUE, GREEN, ORANGE, RED]
        curves = VGroup()
        labels = VGroup()
        for df, color in zip(dfs, colors):
            curve = axes.plot(
                lambda x, d=df: stats.chi2.pdf(x, d) if x > 0.1 else 0,
                x_range=[0.1, 35, 0.1], color=color, stroke_width=3
            )
            peak_x = df - 2 if df > 2 else 1
            lbl = Text(f"df={df}", font_size=16, color=color).next_to(axes.c2p(peak_x, stats.chi2.pdf(peak_x, df)), UP, buff=0.05)
            curves.add(curve)
            labels.add(lbl)

        self.play(
            LaggedStart(*[Create(c) for c in curves], lag_ratio=0.25),
            LaggedStart(*[FadeIn(l) for l in labels], lag_ratio=0.25),
            run_time=2
        )

        shape_note = Text("χ² 分布：右偏、非对称", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.9)
        self.play(Write(shape_note))

        df = 10
        alpha = 0.05
        chi_lower = stats.chi2.ppf(alpha / 2, df)
        chi_upper = stats.chi2.ppf(1 - alpha / 2, df)

        left_reject = axes.get_area(curves[1], x_range=[0.1, chi_lower], color=RED, opacity=0.5)
        right_reject = axes.get_area(curves[1], x_range=[chi_upper, 35], color=RED, opacity=0.5)
        left_line = DashedLine(axes.c2p(chi_lower, 0), axes.c2p(chi_lower, 0.08), color=RED, stroke_width=2)
        right_line = DashedLine(axes.c2p(chi_upper, 0), axes.c2p(chi_upper, 0.08), color=RED, stroke_width=2)

        reject_lbl = Text(f"双侧拒绝域 (α={alpha})", font_size=18, color=RED).to_edge(DOWN, buff=0.35)
        self.play(
            FadeIn(left_reject), FadeIn(right_reject),
            Create(left_line), Create(right_line),
            Transform(shape_note, reject_lbl),
            run_time=1
        )
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
