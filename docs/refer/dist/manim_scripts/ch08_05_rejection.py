"""
Ch08 - 拒绝域【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class RejectionRegionScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("拒绝域的三种形式", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        alpha = 0.05
        z_two = stats.norm.ppf(1 - alpha / 2)
        z_one = stats.norm.ppf(1 - alpha)

        panels = [
            ("双侧检验", "H₁: μ ≠ μ₀", [-z_two, z_two], "both"),
            ("右单侧", "H₁: μ > μ₀", [z_one], "right"),
            ("左单侧", "H₁: μ < μ₀", [-z_one], "left"),
        ]

        panel_groups = VGroup()
        for i, (name, h1, crits, kind) in enumerate(panels):
            x_pos = (i - 1) * 4.2
            frame = RoundedRectangle(width=3.8, height=4.5, corner_radius=0.12, color=GREY_D, stroke_width=1.5)
            frame.shift(RIGHT * x_pos + DOWN * 0.8)

            axes = Axes(
                x_range=[-3, 3, 1], y_range=[0, 0.45, 0.1],
                x_length=3.2, y_length=2.8,
                axis_config={"color": GREY_B, "stroke_width": 1}, tips=False
            ).move_to(frame.get_center() + DOWN * 0.3)

            curve = axes.plot(lambda x: stats.norm.pdf(x), x_range=[-3, 3, 0.05], color=WHITE, stroke_width=2)

            reject_areas = VGroup()
            if kind == "both":
                reject_areas.add(
                    axes.get_area(curve, x_range=[-3, -crits[0]], color=RED, opacity=0.5),
                    axes.get_area(curve, x_range=[crits[1], 3], color=RED, opacity=0.5)
                )
            elif kind == "right":
                reject_areas.add(axes.get_area(curve, x_range=[crits[0], 3], color=RED, opacity=0.5))
            else:
                reject_areas.add(axes.get_area(curve, x_range=[-3, crits[0]], color=RED, opacity=0.5))

            accept_area = axes.get_area(curve, x_range=[-3, 3], color=GREEN, opacity=0.15)

            p_title = Text(name, font_size=18, color=YELLOW).next_to(frame, UP, buff=0.1)
            p_h1 = Text(h1, font_size=14, color=ORANGE).next_to(p_title, DOWN, buff=0.05)

            panel_groups.add(VGroup(frame, axes, curve, accept_area, reject_areas, p_title, p_h1))

        self.play(LaggedStart(*[FadeIn(p) for p in panel_groups], lag_ratio=0.25), run_time=1.5)

        stat_dot = Dot(color=YELLOW, radius=0.12)
        stat_dot.move_to(panel_groups[1][1].c2p(2.2, 0))
        stat_lbl = Text("检验统计量", font_size=14, color=YELLOW).next_to(stat_dot, UP, buff=0.1)
        self.play(stat_dot.animate.shift(UP * 3), run_time=0.3)
        self.play(
            stat_dot.animate.move_to(panel_groups[1][1].c2p(2.2, 0)),
            FadeIn(stat_lbl),
            run_time=1.2,
            rate_func=rate_functions.ease_in_quad
        )

        decision = Text("落入拒绝域 → 拒绝 H₀", font_size=24, color=RED).to_edge(DOWN, buff=0.35)
        self.play(Write(decision))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
