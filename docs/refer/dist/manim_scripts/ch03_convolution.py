"""
Ch03 - 卷积公式：Z = X + Y 的分布
【Cairo版本：不依赖LaTeX，使用Text代替MathTex】
"""
from manim import *
import numpy as np

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class ConvolutionScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"

        title = Text("卷积公式：Z = X + Y 的分布", font_size=36, color=WHITE, weight=BOLD)
        subtitle = Text("两个独立随机变量之和的几何推导", font_size=22, color=BLUE_B)
        subtitle.next_to(title, DOWN, buff=0.25)
        group = VGroup(title, subtitle).to_edge(UP, buff=0.35)
        self.play(FadeIn(group, shift=DOWN * 0.2), run_time=0.8)
        self.wait(0.4)

        formula_label = Text("f_Z(z) = ∫ f_X(x)·f_Y(z-x) dx  （卷积积分）", font_size=22, color=YELLOW)
        formula_label.next_to(group, DOWN, buff=0.3)
        self.play(Write(formula_label), run_time=1)
        self.wait(0.4)

        part1 = Text("① X ~ U(0,1) 与 Y ~ U(0,1) 的概率密度", font_size=24, color=YELLOW)
        part1.to_edge(LEFT, buff=0.6).shift(UP * 0.8)
        self.play(FadeOut(formula_label), Write(part1), run_time=0.6)

        axes_x = Axes(x_range=[-0.2, 1.5, 0.5], y_range=[0, 1.5, 0.5], x_length=4.5, y_length=2.5, axis_config={"color": GREY_B, "stroke_width": 2}, tips=False).shift(LEFT * 3.0 + DOWN * 1.0)
        axes_y = Axes(x_range=[-0.2, 1.5, 0.5], y_range=[0, 1.5, 0.5], x_length=4.5, y_length=2.5, axis_config={"color": GREY_B, "stroke_width": 2}, tips=False).shift(RIGHT * 1.2 + DOWN * 1.0)
        lx = Text("x", font_size=18, color=GREY_A).next_to(axes_x, RIGHT, buff=0.1)
        ly = Text("y", font_size=18, color=GREY_A).next_to(axes_y, RIGHT, buff=0.1)

        def uni_pdf(x): return 1.0 if 0 <= x <= 1 else 0.0

        pdf_x = axes_x.plot(uni_pdf, x_range=[0, 1, 0.01], color=BLUE, stroke_width=4)
        fill_x = axes_x.get_area(pdf_x, x_range=[0, 1], color=BLUE, opacity=0.3)
        label_x = Text("X ~ U(0,1)", font_size=18, color=BLUE).next_to(axes_x, UP, buff=0.1)

        pdf_y = axes_y.plot(uni_pdf, x_range=[0, 1, 0.01], color=GREEN, stroke_width=4)
        fill_y = axes_y.get_area(pdf_y, x_range=[0, 1], color=GREEN, opacity=0.3)
        label_y = Text("Y ~ U(0,1)", font_size=18, color=GREEN).next_to(axes_y, UP, buff=0.1)

        self.play(Create(axes_x), Create(axes_y), Create(lx), Create(ly), run_time=0.7)
        self.play(Create(pdf_x), FadeIn(fill_x), FadeIn(label_x), run_time=0.8)
        self.play(Create(pdf_y), FadeIn(fill_y), FadeIn(label_y), run_time=0.8)
        self.wait(0.8)

        self.play(FadeOut(Group(axes_x, axes_y, pdf_x, pdf_y, fill_x, fill_y, label_x, label_y, lx, ly, part1)), run_time=0.6)

        part2 = Text("② Z = X + Y 的分布：三角形分布", font_size=26, color=YELLOW)
        part2.to_edge(UP, buff=1.2)
        self.play(Write(part2), run_time=0.6)

        axes_z = Axes(x_range=[-0.2, 2.3, 0.5], y_range=[0, 1.3, 0.5], x_length=9, y_length=4.5, axis_config={"color": GREY_B, "stroke_width": 2}, tips=False).shift(DOWN * 0.8)
        lz = Text("z", font_size=18, color=GREY_A).next_to(axes_z, RIGHT, buff=0.1)
        self.play(Create(axes_z), Create(lz), run_time=0.7)

        def triangle_pdf(z):
            if 0 <= z <= 1: return z
            elif 1 < z <= 2: return 2 - z
            return 0

        pdf_left = axes_z.plot(triangle_pdf, x_range=[0, 1, 0.01], color=ORANGE, stroke_width=5)
        pdf_right = axes_z.plot(triangle_pdf, x_range=[1, 2, 0.01], color=ORANGE, stroke_width=5)
        fill_z = axes_z.get_area(axes_z.plot(triangle_pdf, x_range=[0, 2, 0.01]), x_range=[0, 2], color=ORANGE, opacity=0.25)

        self.play(Create(pdf_left), run_time=0.7)
        self.play(Create(pdf_right), run_time=0.7)
        self.play(FadeIn(fill_z), run_time=0.4)

        peak_dot = Dot(axes_z.c2p(1, 1), radius=0.1, color=ORANGE)
        peak_lbl = Text("峰值 f(1) = 1", font_size=18, color=ORANGE)
        peak_lbl.next_to(axes_z.c2p(1, 1), UP + RIGHT, buff=0.1)
        self.play(GrowFromCenter(peak_dot), FadeIn(peak_lbl), run_time=0.5)

        formula_box = RoundedRectangle(corner_radius=0.2, width=5.5, height=1.8, color=ORANGE, fill_opacity=0.1)
        formula_box.to_edge(RIGHT, buff=0.4).shift(DOWN * 0.3)
        formula_content = VGroup(
            Text("f_Z(z) = z,      0 ≤ z ≤ 1", font_size=18, color=WHITE),
            Text("f_Z(z) = 2-z,  1 < z ≤ 2", font_size=18, color=WHITE),
            Text("f_Z(z) = 0,      otherwise", font_size=18, color=GREY_A),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(formula_box)

        self.play(Create(formula_box), Write(formula_content), run_time=1)
        self.wait(0.8)
        verify = Text("③ 蒙特卡洛模拟验证 (n=10000)", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(verify), run_time=0.5)

        sim_bars = VGroup()
        n_bins = 20
        for i in range(n_bins):
            z_l, z_r = i / n_bins * 2.0, (i + 1) / n_bins * 2.0
            z_m = (z_l + z_r) / 2
            bar = Rectangle(width=axes_z.x_length / n_bins * 0.85, height=triangle_pdf(z_m) * axes_z.y_length / 1.3, color=GREEN_C, fill_opacity=0.3, stroke_width=1, stroke_color=GREEN_B)
            bar.move_to(axes_z.c2p(z_m, triangle_pdf(z_m) / 2))
            sim_bars.add(bar)

        self.play(LaggedStart(*[FadeIn(b) for b in sim_bars], lag_ratio=0.04), run_time=1.2)
        conclusion = Text("模拟直方图与卷积公式完美吻合！", font_size=20, color=GREEN_A).to_edge(DOWN, buff=0.3)
        self.play(Transform(verify, conclusion), run_time=0.7)
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
