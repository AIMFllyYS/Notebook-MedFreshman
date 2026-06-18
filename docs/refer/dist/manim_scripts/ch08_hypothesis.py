"""
Ch08 - 假设检验的两类错误【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class HypothesisErrorScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("假设检验：第一类错误与第二类错误", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        axes = Axes(
            x_range=[-1, 9, 1], y_range=[0, 0.5, 0.1],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.8)
        self.play(Create(axes), run_time=0.6)

        mu0, mu1, sigma = 3, 5.5, 1.0
        alpha_val = 0.05
        critical_z = stats.norm.ppf(1 - alpha_val)
        critical_x = mu0 + critical_z * sigma

        pdf0 = axes.plot(lambda x: stats.norm.pdf(x, mu0, sigma), x_range=[-1, 9, 0.05], color=BLUE, stroke_width=4)
        lbl0 = Text("H₀ 分布 (无效果)", font_size=20, color=BLUE).next_to(axes.c2p(mu0, 0.42), UP)

        pdf1 = axes.plot(lambda x: stats.norm.pdf(x, mu1, sigma), x_range=[-1, 9, 0.05], color=ORANGE, stroke_width=4)
        lbl1 = Text("H₁ 分布 (有效果)", font_size=20, color=ORANGE).next_to(axes.c2p(mu1, 0.42), UP)

        self.play(Create(pdf0), FadeIn(lbl0), run_time=0.8)
        self.play(Create(pdf1), FadeIn(lbl1), run_time=0.8)

        crit_line = DashedLine(axes.c2p(critical_x, 0), axes.c2p(critical_x, 0.5), color=RED, stroke_width=3)
        crit_lbl = Text("临界值", font_size=16, color=RED).next_to(crit_line, UP)
        self.play(Create(crit_line), FadeIn(crit_lbl), run_time=0.6)

        area_alpha = axes.get_area(pdf0, x_range=[critical_x, 9], color=RED, opacity=0.5)
        txt_alpha = Text("第一类错误 α (弃真)", font_size=16, color=RED_C).next_to(axes.c2p(critical_x + 0.8, 0.05), UP)
        self.play(FadeIn(area_alpha), Write(txt_alpha))

        area_beta = axes.get_area(pdf1, x_range=[-1, critical_x], color=YELLOW, opacity=0.5)
        txt_beta = Text("第二类错误 β (取伪)", font_size=16, color=YELLOW).next_to(axes.c2p(critical_x - 1.2, 0.1), UP)
        self.play(FadeIn(area_beta), Write(txt_beta))

        area_power = axes.get_area(pdf1, x_range=[critical_x, 9], color=GREEN, opacity=0.35)
        txt_power = Text("功效 = 1 - β", font_size=16, color=GREEN_B).next_to(axes.c2p(critical_x + 1.5, 0.15), UP)
        self.play(FadeIn(area_power), Write(txt_power))

        tradeoff = Text("移动临界值：α 与 β 此消彼长", font_size=20, color=WHITE).to_edge(DOWN, buff=0.8)
        self.play(Write(tradeoff))

        new_crit_x = mu0 + stats.norm.ppf(1 - 0.10) * sigma
        new_crit_line = DashedLine(axes.c2p(new_crit_x, 0), axes.c2p(new_crit_x, 0.5), color=RED, stroke_width=3)
        new_area_alpha = axes.get_area(pdf0, x_range=[new_crit_x, 9], color=RED, opacity=0.5)
        new_area_beta = axes.get_area(pdf1, x_range=[-1, new_crit_x], color=YELLOW, opacity=0.5)
        new_area_power = axes.get_area(pdf1, x_range=[new_crit_x, 9], color=GREEN, opacity=0.35)

        self.play(
            Transform(crit_line, new_crit_line),
            Transform(area_alpha, new_area_alpha),
            Transform(area_beta, new_area_beta),
            Transform(area_power, new_area_power),
            tradeoff.animate.become(Text("α 增大 → β 减小（功效提高）", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.8)),
            run_time=1.5
        )
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
