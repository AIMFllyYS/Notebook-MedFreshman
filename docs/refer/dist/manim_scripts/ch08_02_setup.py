"""
Ch08 - 原假设与备择假设的建立【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np
from scipy import stats

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class HypothesisSetupScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("假设检验的建立流程", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        steps = [
            ("① 实际问题", "新药是否比旧药更有效？", BLUE_B),
            ("② 参数化", "比较两种药的治愈率 μ₁, μ₂", TEAL),
            ("③ 建立假设", "H₀: μ₁ = μ₂  vs  H₁: μ₁ > μ₂", YELLOW),
        ]
        flow = VGroup()
        for i, (step, content, color) in enumerate(steps):
            box = RoundedRectangle(width=9, height=0.9, corner_radius=0.15, color=color, stroke_width=2)
            box.set_fill(color, opacity=0.15)
            step_lbl = Text(step, font_size=20, color=color, weight=BOLD)
            content_lbl = Text(content, font_size=20, color=WHITE)
            row = VGroup(step_lbl, content_lbl).arrange(RIGHT, buff=0.4)
            row.move_to(box.get_center())
            group = VGroup(box, row)
            flow.add(group)
        flow.arrange(DOWN, buff=0.25).next_to(title, DOWN, buff=0.35)

        arrows = VGroup()
        for i in range(len(flow) - 1):
            arr = Arrow(flow[i].get_bottom(), flow[i + 1].get_top(), buff=0.08, color=GREY_A, stroke_width=2, max_tip_length_to_length_ratio=0.15)
            arrows.add(arr)

        self.play(LaggedStart(*[FadeIn(f, shift=RIGHT * 0.3) for f in flow], lag_ratio=0.3), run_time=1.5)
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.2), run_time=0.8)

        compare_title = Text("单侧 vs 双侧检验", font_size=26, color=WHITE).shift(DOWN * 0.3)
        self.play(Write(compare_title))

        left_panel = RoundedRectangle(width=5.5, height=3.2, corner_radius=0.15, color=ORANGE, stroke_width=2).shift(LEFT * 3.2 + DOWN * 2.2)
        right_panel = RoundedRectangle(width=5.5, height=3.2, corner_radius=0.15, color=GREEN, stroke_width=2).shift(RIGHT * 3.2 + DOWN * 2.2)

        left_title = Text("单侧检验", font_size=22, color=ORANGE).next_to(left_panel, UP, buff=0.15)
        right_title = Text("双侧检验", font_size=22, color=GREEN).next_to(right_panel, UP, buff=0.15)

        left_h0 = Text("H₀: μ = μ₀", font_size=18, color=BLUE).move_to(left_panel.get_center() + UP * 0.8)
        left_h1 = Text("H₁: μ > μ₀  (或 μ < μ₀)", font_size=18, color=ORANGE).move_to(left_panel.get_center() + UP * 0.2)
        left_note = Text("有方向性", font_size=16, color=GREY_A).move_to(left_panel.get_center() + DOWN * 0.5)

        right_h0 = Text("H₀: μ = μ₀", font_size=18, color=BLUE).move_to(right_panel.get_center() + UP * 0.8)
        right_h1 = Text("H₁: μ ≠ μ₀", font_size=18, color=ORANGE).move_to(right_panel.get_center() + UP * 0.2)
        right_note = Text("无方向性", font_size=16, color=GREY_A).move_to(right_panel.get_center() + DOWN * 0.5)

        self.play(
            Create(left_panel), Create(right_panel),
            FadeIn(left_title), FadeIn(right_title),
            run_time=0.6
        )
        self.play(
            Write(left_h0), Write(left_h1), Write(left_note),
            Write(right_h0), Write(right_h1), Write(right_note),
            run_time=1.2
        )

        tip = Text("H₀ 总是包含等号；H₁ 是我们想要证明的", font_size=20, color=YELLOW).to_edge(DOWN, buff=0.3)
        self.play(Write(tip))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
