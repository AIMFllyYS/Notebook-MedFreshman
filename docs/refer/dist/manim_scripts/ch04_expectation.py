"""
Ch04 - 期望与方差的物理直观【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class ExpectationVarianceScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"
        np.random.seed(0)

        title = Text("期望与方差的物理直观意义", font_size=38, color=WHITE, weight=BOLD)
        subtitle = Text("概率分布 = 质量分布 | 期望 = 重心 | 方差 = 转动惯量", font_size=20, color=BLUE_B)
        subtitle.next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(VGroup(title, subtitle).to_edge(UP, buff=0.3)), run_time=0.8)
        self.wait(0.4)

        part1 = Text("① 把概率分布想象成数轴上的质量", font_size=24, color=YELLOW).shift(UP * 1.6)
        self.play(Write(part1), run_time=0.6)

        number_line = NumberLine(x_range=[0, 6, 1], length=9, font_size=22, color=GREY_B).shift(DOWN * 0.2)
        self.play(Create(number_line), run_time=0.7)

        probs = {1: 0.1, 2: 0.2, 3: 0.4, 4: 0.2, 5: 0.1}
        masses = VGroup()
        prob_labels = VGroup()
        for x_val, prob in probs.items():
            center = number_line.n2p(x_val)
            radius = prob * 2.0
            dot = Dot(center + UP * radius, radius=radius, color=BLUE, fill_opacity=0.7)
            label = Text(f"p={prob}", font_size=17, color=BLUE_B).next_to(dot, UP, buff=0.05)
            masses.add(dot)
            prob_labels.add(label)

        self.play(LaggedStart(*[GrowFromCenter(d) for d in masses], lag_ratio=0.15), run_time=1)
        self.play(LaggedStart(*[FadeIn(l) for l in prob_labels], lag_ratio=0.1), run_time=0.7)
        self.wait(0.6)

        part2 = Text("② 期望 E(X) = 重心位置（质心）", font_size=24, color=GREEN).shift(UP * 1.6)
        self.play(Transform(part1, part2), run_time=0.5)

        EX = 3.0
        gravity_line = DashedLine(number_line.n2p(EX) + DOWN * 0.4, number_line.n2p(EX) + UP * 2.8, color=GREEN, stroke_width=3, dash_length=0.15)
        triangle = Triangle(color=GREEN, fill_opacity=0.9).scale(0.18).rotate(PI).next_to(number_line.n2p(EX), DOWN, buff=0)
        gravity_lbl = Text("E(X) = 3.0（重心）", font_size=20, color=GREEN).next_to(number_line.n2p(EX), DOWN * 2.5)

        self.play(Create(gravity_line), GrowFromCenter(triangle), run_time=0.7)
        self.play(Write(gravity_lbl), run_time=0.6)

        ex_formula = Text("E(X) = 1×0.1 + 2×0.2 + 3×0.4 + 4×0.2 + 5×0.1 = 3.0", font_size=19, color=WHITE).to_edge(DOWN, buff=0.9)
        self.play(Write(ex_formula), run_time=1.2)
        self.wait(0.8)

        self.play(FadeOut(Group(ex_formula, prob_labels)), run_time=0.4)
        part3 = Text("③ 方差 D(X) = 各质点到重心距离² 的加权平均", font_size=22, color=ORANGE).shift(UP * 1.6)
        self.play(Transform(part1, part3), run_time=0.5)

        arrows = VGroup()
        for x_val in probs:
            if abs(x_val - EX) > 0.01:
                arr = DoubleArrow(number_line.n2p(EX) + DOWN * 0.8, number_line.n2p(x_val) + DOWN * 0.8, color=ORANGE, stroke_width=2.5, buff=0)
                arrows.add(arr)

        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.2), run_time=1)

        dx_text = Text("D(X) = (1-3)²×0.1 + (2-3)²×0.2 + 0 + (4-3)²×0.2 + (5-3)²×0.1 = 1.2", font_size=18, color=ORANGE).to_edge(DOWN, buff=0.9)
        self.play(Write(dx_text), run_time=1.2)

        shortcut = Text("（计算捷径：D(X) = E(X²) - [E(X)]²）", font_size=18, color=YELLOW).next_to(dx_text, DOWN, buff=0.2)
        self.play(Write(shortcut), run_time=0.8)
        self.wait(1)

        self.play(FadeOut(Group(*self.mobjects)), run_time=0.7)

        compare_title = Text("④ 方差的几何意义：集中 vs 分散", font_size=30, color=YELLOW).to_edge(UP, buff=0.5)
        self.play(FadeIn(compare_title), run_time=0.6)

        nl_low = NumberLine(x_range=[0, 6, 1], length=8, font_size=18, color=GREY_B).shift(LEFT * 0.3 + UP * 1.0)
        nl_high = NumberLine(x_range=[0, 6, 1], length=8, font_size=18, color=GREY_B).shift(LEFT * 0.3 + DOWN * 1.8)

        low_label = Text("低方差 D=0.4（集中）", font_size=20, color=GREEN_B).next_to(nl_low, LEFT, buff=0.2)
        high_label = Text("高方差 D=2.0（分散）", font_size=20, color=RED_B).next_to(nl_high, LEFT, buff=0.2)

        low_probs = {2.2: 0.1, 2.7: 0.2, 3: 0.4, 3.3: 0.2, 3.8: 0.1}
        high_probs = {0.8: 0.15, 1.8: 0.2, 3: 0.3, 4.2: 0.2, 5.2: 0.15}

        low_dots = VGroup(*[Dot(nl_low.n2p(x) + UP * p * 1.8, radius=p * 1.8, color=GREEN, fill_opacity=0.75) for x, p in low_probs.items()])
        high_dots = VGroup(*[Dot(nl_high.n2p(x) + UP * p * 1.8, radius=p * 1.8, color=RED, fill_opacity=0.75) for x, p in high_probs.items()])

        self.play(Create(nl_low), Create(nl_high), FadeIn(low_label), FadeIn(high_label), run_time=0.7)
        self.play(LaggedStart(*[GrowFromCenter(d) for d in low_dots], lag_ratio=0.1), LaggedStart(*[GrowFromCenter(d) for d in high_dots], lag_ratio=0.1), run_time=1.2)

        self.play(Create(DashedLine(nl_low.n2p(3) + DOWN * 0.3, nl_low.n2p(3) + UP * 1.2, color=GREEN, stroke_width=2)), Create(DashedLine(nl_high.n2p(3) + DOWN * 0.3, nl_high.n2p(3) + UP * 1.2, color=RED, stroke_width=2)), run_time=0.6)

        summary = Text("相同期望 E(X)=3，但方差越大，概率分布越分散！", font_size=22, color=WHITE).to_edge(DOWN, buff=0.5)
        self.play(Write(summary), run_time=0.9)
        self.wait(2.5)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
