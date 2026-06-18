"""
Ch08 - p值【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class PValueScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("p 值的几何意义", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.5)
        self.play(Create(axes), run_time=0.6)

        curve = axes.plot(lambda x: stats.norm.pdf(x), x_range=[-4, 4, 0.05], color=WHITE, stroke_width=3)
        h0_lbl = Text("H₀ 下 Z 的分布", font_size=20, color=BLUE).next_to(axes, UP, buff=0.15)
        self.play(Create(curve), FadeIn(h0_lbl), run_time=0.8)

        z_obs = 2.35
        obs_line = DashedLine(axes.c2p(z_obs, 0), axes.c2p(z_obs, 0.4), color=YELLOW, stroke_width=3)
        obs_dot = Dot(axes.c2p(z_obs, stats.norm.pdf(z_obs)), color=YELLOW, radius=0.1)
        obs_lbl = Text(f"观测值 Z = {z_obs}", font_size=20, color=YELLOW).next_to(obs_line, UP)
        self.play(Create(obs_line), GrowFromCenter(obs_dot), Write(obs_lbl), run_time=0.8)

        p_val = 2 * (1 - stats.norm.cdf(abs(z_obs)))
        p_area = axes.get_area(curve, x_range=[z_obs, 4], color=ORANGE, opacity=0.55)
        p_area_left = axes.get_area(curve, x_range=[-4, -z_obs], color=ORANGE, opacity=0.55)
        p_lbl = Text(f"p 值 = {p_val:.4f}", font_size=24, color=ORANGE).to_edge(RIGHT, buff=0.5).shift(UP * 0.5)
        p_desc = Text("≥ 观测值极端程度的概率", font_size=18, color=GREY_A).next_to(p_lbl, DOWN, buff=0.15)
        self.play(FadeIn(p_area), FadeIn(p_area_left), Write(p_lbl), Write(p_desc), run_time=1)

        alpha = 0.05
        alpha_lbl = Text(f"α = {alpha}", font_size=22, color=RED).to_edge(LEFT, buff=0.5).shift(UP * 0.5)
        self.play(Write(alpha_lbl))

        if p_val < alpha:
            result = Text(f"p < α → 拒绝 H₀", font_size=26, color=RED)
        else:
            result = Text(f"p ≥ α → 不拒绝 H₀", font_size=26, color=GREEN)
        result.to_edge(DOWN, buff=0.35)
        self.play(Write(result))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
