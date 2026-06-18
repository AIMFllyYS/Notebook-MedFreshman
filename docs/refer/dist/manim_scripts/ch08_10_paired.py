"""
Ch08 - 配对t检验【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class PairedTestScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("配对样本 t 检验", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        context = Text("同一对象：治疗前 vs 治疗后", font_size=22, color=GREY_A).next_to(title, DOWN, buff=0.35)
        self.play(Write(context))

        before_vals = [72, 85, 68, 90, 77, 82]
        after_vals = [78, 88, 75, 93, 80, 86]
        diffs = [a - b for a, b in zip(after_vals, before_vals)]

        axes = Axes(
            x_range=[60, 100, 10], y_range=[60, 100, 10],
            x_length=5, y_length=5,
            axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False
        ).shift(LEFT * 3 + DOWN * 0.5)
        x_lbl = Text("治疗前", font_size=16, color=BLUE).next_to(axes.x_axis, DOWN, buff=0.15)
        y_lbl = Text("治疗后", font_size=16, color=ORANGE).next_to(axes.y_axis, LEFT, buff=0.15).rotate(PI / 2)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl), run_time=0.6)

        pairs = VGroup()
        for b, a in zip(before_vals, after_vals):
            dot_b = Dot(axes.c2p(b, b), color=GREY_D, radius=0.05)
            dot_a = Dot(axes.c2p(b, a), color=ORANGE, radius=0.07)
            line = Line(axes.c2p(b, b), axes.c2p(b, a), color=GREEN_C, stroke_width=2)
            pairs.add(VGroup(dot_b, dot_a, line))

        self.play(LaggedStart(*[Create(p) for p in pairs], lag_ratio=0.15), run_time=1.5)

        diff_title = Text("计算差值 d = 后 - 前", font_size=20, color=YELLOW).next_to(axes, RIGHT, buff=0.5).shift(UP * 1.5)
        self.play(Write(diff_title))

        diff_rows = VGroup()
        for i, d in enumerate(diffs):
            row = Text(f"d{i+1} = {d:+d}", font_size=18, color=GREEN_C)
            diff_rows.add(row)
        diff_rows.arrange(DOWN, buff=0.12, aligned_edge=LEFT).next_to(diff_title, DOWN, buff=0.3)
        self.play(LaggedStart(*[FadeIn(r) for r in diff_rows], lag_ratio=0.1), run_time=1)

        d_bar = np.mean(diffs)
        s_d = np.std(diffs, ddof=1)
        n = len(diffs)
        t_stat = d_bar / (s_d / np.sqrt(n))

        formula = VGroup(
            Text(f"d̄ = {d_bar:.2f}", font_size=20, color=WHITE),
            Text(f"t = d̄ / (S_d/√n) = {t_stat:.2f}", font_size=20, color=YELLOW),
            Text("转化为单样本 t 检验！", font_size=20, color=GREEN_B),
        ).arrange(DOWN, buff=0.2).to_edge(DOWN, buff=0.35)
        self.play(LaggedStart(*[Write(f) for f in formula], lag_ratio=0.3), run_time=1.2)
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
