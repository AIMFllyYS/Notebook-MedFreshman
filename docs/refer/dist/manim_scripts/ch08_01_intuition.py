"""
Ch08 - 假设检验的基本直觉【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class HypothesisIntuitionScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("假设检验：小概率原理", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        exp_text = Text("实验：抛硬币 10 次，出现 9 次正面", font_size=24, color=YELLOW).next_to(title, DOWN, buff=0.4)
        self.play(Write(exp_text))

        coins = VGroup()
        results = ["正", "正", "反", "正", "正", "正", "正", "正", "正", "正"]
        for i, r in enumerate(results):
            color = GOLD if r == "正" else GREY_B
            c = Circle(radius=0.22, color=color, fill_opacity=0.8, fill_color=color, stroke_width=2)
            lbl = Text(r, font_size=16, color=BLACK if r == "正" else WHITE)
            lbl.move_to(c.get_center())
            coins.add(VGroup(c, lbl))
        coins.arrange(RIGHT, buff=0.15).next_to(exp_text, DOWN, buff=0.5)
        self.play(LaggedStart(*[GrowFromCenter(c) for c in coins], lag_ratio=0.08), run_time=1.5)

        h0_text = Text("假设 H₀：硬币公平 (p = 0.5)", font_size=22, color=BLUE).next_to(coins, DOWN, buff=0.5)
        self.play(Write(h0_text))

        n, p = 10, 0.5
        k = 9
        prob = stats.binom.sf(k - 1, n, p)
        prob_text = Text(f"P(X ≥ 9 | p=0.5) = {prob:.4f}", font_size=22, color=RED).next_to(h0_text, DOWN, buff=0.3)
        self.play(Write(prob_text))

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 0.35, 0.1],
            x_length=8, y_length=3.5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(DOWN * 1.8)
        x_lbl = Text("正面次数 k", font_size=16, color=GREY_A).next_to(axes, DOWN, buff=0.15)
        self.play(Create(axes), FadeIn(x_lbl), run_time=0.6)

        bars = VGroup()
        bar_width = 0.55
        for k_val in range(11):
            h = stats.binom.pmf(k_val, n, p)
            bottom = axes.c2p(k_val - bar_width / 2, 0)
            top = axes.c2p(k_val + bar_width / 2, h)
            bar = Rectangle(
                width=top[0] - bottom[0], height=top[1] - bottom[1],
                color=RED if k_val >= 9 else BLUE,
                fill_opacity=0.7 if k_val >= 9 else 0.5,
                fill_color=RED if k_val >= 9 else BLUE,
                stroke_width=1
            )
            bar.move_to([(bottom[0] + top[0]) / 2, (bottom[1] + top[1]) / 2, 0])
            bars.add(bar)
        self.play(LaggedStart(*[GrowFromCenter(b) for b in bars], lag_ratio=0.05), run_time=1.2)

        shade_lbl = Text("极端区域 (小概率)", font_size=18, color=RED).next_to(axes.c2p(9.5, 0.12), UP)
        self.play(FadeIn(shade_lbl))

        conclusion = Text("小概率事件发生了 → 拒绝 H₀（硬币可能不公平）", font_size=22, color=GREEN_B)
        conclusion.to_edge(DOWN, buff=0.35)
        self.play(Write(conclusion))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
