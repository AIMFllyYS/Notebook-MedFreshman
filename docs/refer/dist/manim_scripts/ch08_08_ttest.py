"""
Ch08 - t检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class TTestScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("t 检验：σ² 未知时的均值检验", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        axes = Axes(
            x_range=[-5, 5, 1], y_range=[0, 0.45, 0.1],
            x_length=10, y_length=4.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 0.6)
        self.play(Create(axes), run_time=0.6)

        norm_curve = axes.plot(lambda x: stats.norm.pdf(x), x_range=[-5, 5, 0.05], color=WHITE, stroke_width=2)
        norm_lbl = Text("N(0,1)  df=∞", font_size=18, color=WHITE).next_to(axes.c2p(0, 0.42), UP)
        self.play(Create(norm_curve), FadeIn(norm_lbl), run_time=0.8)

        dfs = [3, 10, 30]
        colors = [RED, ORANGE, GREEN_C]
        t_curves = VGroup()
        t_labels = VGroup()
        for df, color in zip(dfs, colors):
            curve = axes.plot(lambda x, d=df: stats.t.pdf(x, d), x_range=[-5, 5, 0.05], color=color, stroke_width=3)
            lbl = Text(f"df={df}", font_size=16, color=color).next_to(axes.c2p(3, stats.t.pdf(3, df)), UP, buff=0.05)
            t_curves.add(curve)
            t_labels.add(lbl)

        self.play(
            LaggedStart(*[Create(c) for c in t_curves], lag_ratio=0.3),
            LaggedStart(*[FadeIn(l) for l in t_labels], lag_ratio=0.3),
            run_time=2
        )

        note1 = Text("t 分布尾部更厚 → 临界值更大", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.7)
        self.play(Write(note1))

        alpha = 0.05
        df = 10
        t_crit = stats.t.ppf(1 - alpha / 2, df)
        z_crit = stats.norm.ppf(1 - alpha / 2)

        crit_compare = VGroup(
            Text(f"t 临界值 (df=10): ±{t_crit:.3f}", font_size=20, color=ORANGE),
            Text(f"Z 临界值: ±{z_crit:.3f}", font_size=20, color=WHITE),
        ).arrange(DOWN, buff=0.15).to_edge(DOWN, buff=0.25)
        self.play(Transform(note1, crit_compare), run_time=0.8)

        tail_area = axes.get_area(t_curves[1], x_range=[t_crit, 5], color=RED, opacity=0.4)
        self.play(FadeIn(tail_area))
        self.wait(1.5)

        converge = Text("df → ∞ 时，t 分布趋近标准正态", font_size=20, color=GREEN_B).next_to(title, DOWN, buff=0.3)
        self.play(Write(converge))
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
