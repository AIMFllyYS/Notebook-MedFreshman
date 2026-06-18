"""
Ch08 - 检验功效与样本量【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class PowerAnalysisScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("统计功效与样本量", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        mu0, mu1, sigma = 0, 1.0, 1.0
        alpha = 0.05
        sample_sizes = [5, 15, 50]

        axes = Axes(
            x_range=[-2, 4, 1], y_range=[0, 1.2, 0.2],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.5)
        self.play(Create(axes), run_time=0.6)

        n_label = Text("n = 5", font_size=28, color=YELLOW).to_edge(RIGHT, buff=0.5).shift(UP * 1.5)
        self.play(FadeIn(n_label))

        pdf0 = None
        pdf1 = None
        crit_line = None
        area_alpha = None
        area_beta = None
        area_power = None

        for i, n in enumerate(sample_sizes):
            se = sigma / np.sqrt(n)
            crit_x = mu0 + stats.norm.ppf(1 - alpha) * se

            new_pdf0 = axes.plot(lambda x, s=se: stats.norm.pdf(x, mu0, s), x_range=[-2, 4, 0.05], color=BLUE, stroke_width=3)
            new_pdf1 = axes.plot(lambda x, s=se: stats.norm.pdf(x, mu1, s), x_range=[-2, 4, 0.05], color=ORANGE, stroke_width=3)
            new_crit = DashedLine(axes.c2p(crit_x, 0), axes.c2p(crit_x, 1.1), color=RED, stroke_width=2)
            new_alpha = axes.get_area(new_pdf0, x_range=[crit_x, 4], color=RED, opacity=0.4)
            new_beta = axes.get_area(new_pdf1, x_range=[-2, crit_x], color=YELLOW, opacity=0.4)
            new_power = axes.get_area(new_pdf1, x_range=[crit_x, 4], color=GREEN, opacity=0.35)

            if i == 0:
                pdf0, pdf1 = new_pdf0, new_pdf1
                crit_line = new_crit
                area_alpha, area_beta, area_power = new_alpha, new_beta, new_power
                lbl0 = Text("H₀", font_size=16, color=BLUE).next_to(axes.c2p(mu0, stats.norm.pdf(mu0, se)), UP)
                lbl1 = Text("H₁", font_size=16, color=ORANGE).next_to(axes.c2p(mu1, stats.norm.pdf(mu1, se)), UP)
                self.play(Create(pdf0), Create(pdf1), Create(crit_line), FadeIn(lbl0), FadeIn(lbl1), run_time=0.8)
                self.play(FadeIn(area_alpha), FadeIn(area_beta), FadeIn(area_power), run_time=0.6)
            else:
                self.play(
                    n_label.animate.become(Text(f"n = {n}", font_size=28, color=YELLOW).to_edge(RIGHT, buff=0.5).shift(UP * 1.5)),
                    Transform(pdf0, new_pdf0), Transform(pdf1, new_pdf1),
                    Transform(crit_line, new_crit),
                    Transform(area_alpha, new_alpha),
                    Transform(area_beta, new_beta),
                    Transform(area_power, new_power),
                    run_time=1.2
                )
            self.wait(0.4)

        legend = VGroup(
            Text("α 固定", font_size=18, color=RED),
            Text("β 减小 → 功效 ↑", font_size=18, color=GREEN_B),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).to_edge(LEFT, buff=0.4).shift(DOWN * 0.5)
        self.play(Write(legend))

        power_vals = []
        n_range = np.arange(5, 101, 5)
        for n in n_range:
            se = sigma / np.sqrt(n)
            crit_x = mu0 + stats.norm.ppf(1 - alpha) * se
            power = 1 - stats.norm.cdf(crit_x, mu1, se)
            power_vals.append(power)

        power_axes = Axes(
            x_range=[0, 100, 20], y_range=[0, 1, 0.2],
            x_length=4, y_length=2,
            axis_config={"color": GREY_B, "stroke_width": 1}, tips=False
        ).to_edge(DOWN, buff=0.25).shift(RIGHT * 3)
        power_curve = power_axes.plot_line_graph(
            x_values=list(n_range), y_values=power_vals,
            line_color=GREEN, add_vertex_dots=False
        )
        power_title = Text("功效曲线", font_size=16, color=GREEN).next_to(power_axes, UP, buff=0.05)
        self.play(Create(power_axes), Create(power_curve), FadeIn(power_title), run_time=1)
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
