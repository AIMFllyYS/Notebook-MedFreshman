"""
Ch06 - 抽样分布【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class SamplingDistScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("抽样分布（χ² 分布与 t 分布）", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        chi2_title = Text("① χ² (卡方) 分布：多个独立标准正态平方和", font_size=24, color=YELLOW).next_to(title, DOWN, buff=0.4)
        self.play(Write(chi2_title))

        axes1 = Axes(x_range=[0, 14, 2], y_range=[0, 0.55, 0.1], x_length=9, y_length=4, axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False).shift(DOWN * 1.2)
        self.play(Create(axes1), run_time=0.6)

        colors = [BLUE_C, GREEN_C, ORANGE, RED_C]
        dfs = [1, 2, 4, 6]
        chi_graphs = VGroup()
        chi_labels = VGroup()
        for i, df in enumerate(dfs):
            graph = axes1.plot(lambda x: stats.chi2.pdf(x, df) if x > 0.1 else 0, x_range=[0.1, 14, 0.05], color=colors[i], stroke_width=4)
            chi_graphs.add(graph)
            lbl = Text(f"df={df}", font_size=18, color=colors[i]).next_to(axes1.c2p(4, stats.chi2.pdf(4, df)), UP, buff=0.1)
            chi_labels.add(lbl)

        self.play(LaggedStart(*[Create(g) for g in chi_graphs], lag_ratio=0.2), LaggedStart(*[FadeIn(l) for l in chi_labels], lag_ratio=0.2), run_time=2.5)
        self.wait(1.5)
        self.play(FadeOut(Group(axes1, chi_graphs, chi_labels, chi2_title)), run_time=0.5)

        t_title = Text("② t 分布：小样本下的均值估计", font_size=24, color=YELLOW).next_to(title, DOWN, buff=0.4)
        self.play(Write(t_title))

        axes2 = Axes(x_range=[-5, 5, 1], y_range=[0, 0.45, 0.1], x_length=9, y_length=4, axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False).shift(DOWN * 1.2)
        self.play(Create(axes2), run_time=0.6)

        norm_g = axes2.plot(lambda x: stats.norm.pdf(x), x_range=[-5, 5, 0.05], color=WHITE, stroke_width=2)
        norm_l = Text("N(0,1)", font_size=18, color=WHITE).next_to(axes2.c2p(0, 0.4), UP, buff=0.1)
        self.play(Create(norm_g), FadeIn(norm_l), run_time=0.8)

        t_dfs = [1, 2, 5]
        t_colors = [RED, ORANGE, GREEN]
        t_graphs = VGroup()
        t_labels = VGroup()
        for i, df in enumerate(t_dfs):
            graph = axes2.plot(lambda x: stats.t.pdf(x, df), x_range=[-5, 5, 0.05], color=t_colors[i], stroke_width=3)
            lbl = Text(f"t (df={df})", font_size=18, color=t_colors[i]).next_to(axes2.c2p(2.5, stats.t.pdf(2.5, df)), UP, buff=0.1)
            t_graphs.add(graph)
            t_labels.add(lbl)

        self.play(LaggedStart(*[Create(g) for g in t_graphs], lag_ratio=0.3), LaggedStart(*[FadeIn(l) for l in t_labels], lag_ratio=0.3), run_time=2.5)

        t_desc = Text("df 越小，尾部越厚（更容易出现极端值）；df 增大，趋近 N(0,1)", font_size=20, color=GREY_A).to_edge(DOWN, buff=0.3)
        self.play(Write(t_desc), run_time=1)
        self.wait(1.5)
        self.play(FadeOut(Group(axes2, norm_g, norm_l, t_graphs, t_labels, t_title, t_desc)), run_time=0.5)

        f_title = Text("③ F 分布：方差比的检验", font_size=24, color=YELLOW).next_to(title, DOWN, buff=0.4)
        self.play(Write(f_title))

        axes3 = Axes(x_range=[0, 5, 1], y_range=[0, 1.1, 0.2], x_length=9, y_length=4, axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False).shift(DOWN * 1.2)
        self.play(Create(axes3), run_time=0.6)

        f_params = [(5, 2), (10, 10), (20, 20)]
        f_colors = [BLUE, GREEN, RED]
        f_graphs = VGroup()
        for i, (df1, df2) in enumerate(f_params):
            graph = axes3.plot(lambda x: stats.f.pdf(x, df1, df2) if x > 0.05 else 0, x_range=[0.05, 5, 0.05], color=f_colors[i], stroke_width=3)
            f_graphs.add(graph)
        self.play(LaggedStart(*[Create(g) for g in f_graphs], lag_ratio=0.3), run_time=2)
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
