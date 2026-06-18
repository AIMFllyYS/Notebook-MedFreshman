"""
Ch05 - 中心极限定理【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class CLTScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"
        np.random.seed(42)

        title = Text("中心极限定理（CLT）", font_size=42, color=WHITE, weight=BOLD)
        subtitle = Text("任意分布之和  →  标准正态分布  N(0,1)", font_size=22, color=BLUE_B).next_to(title, DOWN, buff=0.25)
        formula = Text("(X₁+X₂+⋯+Xₙ - nμ) / (√n·σ)  →  N(0,1)", font_size=22, color=YELLOW).next_to(subtitle, DOWN, buff=0.2)
        self.play(FadeIn(VGroup(title, subtitle, formula).to_edge(UP, buff=0.3)), run_time=1)
        self.wait(0.6)
        self.play(FadeOut(Group(title, subtitle, formula)), run_time=0.5)

        axes = Axes(x_range=[-4, 4, 1], y_range=[0, 0.65, 0.2], x_length=10, y_length=5, axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False).shift(DOWN * 0.4)
        lx = Text("z (标准化)", font_size=16, color=GREY_A).next_to(axes, RIGHT, buff=0.1)
        ly = Text("密度", font_size=16, color=GREY_A).next_to(axes, UP, buff=0.1).shift(LEFT * 4)
        self.play(Create(axes), FadeIn(lx), FadeIn(ly), run_time=0.7)

        mu_orig = 0.5
        sigma_orig = 1 / np.sqrt(12)
        n_samples = 60000
        n_steps = [1, 2, 5, 10, 30]
        step_colors = [RED, ORANGE, GREEN, TEAL, BLUE]

        bars_group = None
        n_label_obj = None
        desc_obj = None

        for idx, n in enumerate(n_steps):
            samples = np.random.uniform(0, 1, (n_samples, n)).sum(axis=1)
            samples_norm = (samples - n * mu_orig) / (np.sqrt(n) * sigma_orig)

            counts, bin_edges = np.histogram(samples_norm, bins=50, range=(-4, 4), density=True)
            color = step_colors[idx]

            new_bars = VGroup()
            for i, count in enumerate(counts):
                x_l, x_r = bin_edges[i], bin_edges[i + 1]
                x_mid = (x_l + x_r) / 2
                h = min(float(count), 0.6)
                if h < 1e-4: continue
                p1, p2 = axes.c2p(x_l, 0), axes.c2p(x_r, h)
                w, ht = abs(p2[0] - p1[0]), abs(p2[1] - p1[1])
                bar = Rectangle(width=w, height=ht, color=color, fill_opacity=0.55, stroke_width=0).move_to(axes.c2p(x_mid, h / 2))
                new_bars.add(bar)

            n_text = Text(f"n = {n}", font_size=34, color=color, weight=BOLD).to_edge(LEFT, buff=0.7).shift(UP * 2.5)
            desc = Text("原始分布 X ~ U(0,1)" if n == 1 else f"n={n} 个 U(0,1) 求和，归一化后", font_size=19, color=GREY_A).to_edge(LEFT, buff=0.7).shift(UP * 1.8)

            if bars_group is None:
                self.play(FadeIn(new_bars, lag_ratio=0.01), Write(n_text), Write(desc), run_time=1)
            else:
                self.play(Transform(bars_group, new_bars), Transform(n_label_obj, n_text), Transform(desc_obj, desc), run_time=0.9)
            bars_group = new_bars
            n_label_obj = n_text
            desc_obj = desc

            if n >= 5:
                nc = axes.plot(lambda z: stats.norm.pdf(z), x_range=[-4, 4, 0.05], color=YELLOW, stroke_width=4)
                nl = Text("N(0,1)", font_size=20, color=YELLOW).next_to(axes.c2p(1.5, 0.4), RIGHT, buff=0.1)
                self.play(Create(nc), FadeIn(nl), run_time=0.7)
                self.wait(0.9 if n < 30 else 1.8)
                self.play(FadeOut(Group(nc, nl)), run_time=0.4)
            else:
                self.wait(0.9)

        final_nc = axes.plot(lambda z: stats.norm.pdf(z), x_range=[-4, 4, 0.05], color=YELLOW, stroke_width=5)
        final_nl = Text("N(0,1)", font_size=22, color=YELLOW).next_to(axes.c2p(1.5, 0.42), RIGHT)
        self.play(Create(final_nc), FadeIn(final_nl), run_time=0.9)

        conclusion = Text("无论原始分布形状如何，n 足够大时，\n标准化后的求和总趋近标准正态分布！", font_size=20, color=WHITE, line_spacing=1.3).to_edge(DOWN, buff=0.35)
        self.play(Write(conclusion), run_time=1)
        self.wait(3)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
