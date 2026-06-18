"""
Ch08 - 显著性水平【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class SignificanceLevelScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("显著性水平 α 与拒绝域", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.5)
        self.play(Create(axes), run_time=0.6)

        curve = axes.plot(lambda x: stats.norm.pdf(x), x_range=[-4, 4, 0.05], color=WHITE, stroke_width=3)
        self.play(Create(curve), run_time=0.8)

        alpha_vals = [0.10, 0.05, 0.01]
        alpha_colors = [ORANGE, RED, RED_E]

        alpha_label = Text("α = 0.10", font_size=28, color=ORANGE).to_edge(RIGHT, buff=0.5).shift(UP * 1.5)
        crit_label = Text("临界值 = ±1.645", font_size=22, color=YELLOW).to_edge(RIGHT, buff=0.5).shift(UP * 0.8)
        self.play(FadeIn(alpha_label), FadeIn(crit_label))

        areas = VGroup()
        crit_lines = VGroup()

        for i, alpha in enumerate(alpha_vals):
            z_crit = stats.norm.ppf(1 - alpha / 2)
            if i > 0:
                self.play(
                    alpha_label.animate.become(Text(f"α = {alpha:.2f}", font_size=28, color=alpha_colors[i]).to_edge(RIGHT, buff=0.5).shift(UP * 1.5)),
                    crit_label.animate.become(Text(f"临界值 = ±{z_crit:.3f}", font_size=22, color=YELLOW).to_edge(RIGHT, buff=0.5).shift(UP * 0.8)),
                    run_time=0.5
                )

            if len(areas) > 0:
                self.play(FadeOut(areas), FadeOut(crit_lines), run_time=0.3)

            areas = VGroup()
            crit_lines = VGroup()

            left_area = axes.get_area(curve, x_range=[-4, -z_crit], color=alpha_colors[i], opacity=0.55)
            right_area = axes.get_area(curve, x_range=[z_crit, 4], color=alpha_colors[i], opacity=0.55)
            areas.add(left_area, right_area)

            left_line = DashedLine(axes.c2p(-z_crit, 0), axes.c2p(-z_crit, 0.4), color=RED, stroke_width=2)
            right_line = DashedLine(axes.c2p(z_crit, 0), axes.c2p(z_crit, 0.4), color=RED, stroke_width=2)
            crit_lines.add(left_line, right_line)

            self.play(FadeIn(areas), Create(crit_lines), run_time=0.8)
            self.wait(0.5)

        note = Text("α 越小 → 拒绝域越小 → 越难拒绝 H₀", font_size=22, color=GREEN_B).to_edge(DOWN, buff=0.35)
        self.play(Write(note))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
