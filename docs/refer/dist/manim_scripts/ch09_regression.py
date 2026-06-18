"""
Ch09 - 线性回归【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class RegressionScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"
        np.random.seed(42)

        title = Text("一元线性回归：最小二乘法", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        axes = Axes(x_range=[0, 10, 2], y_range=[0, 10, 2], x_length=6.5, y_length=6, axis_config={"color": GREY_B, "stroke_width": 1.5}, tips=False).shift(LEFT * 1.2 + DOWN * 0.4)
        lx = Text("x", font_size=18, color=GREY_A).next_to(axes, RIGHT, buff=0.1)
        ly = Text("y", font_size=18, color=GREY_A).next_to(axes, UP, buff=0.1)
        self.play(Create(axes), FadeIn(lx), FadeIn(ly), run_time=0.6)

        n_pts = 15
        x_vals = np.random.uniform(1, 9, n_pts)
        true_w, true_b = 0.8, 1.5
        y_vals = true_w * x_vals + true_b + np.random.normal(0, 1.2, n_pts)

        dots = VGroup(*[Dot(axes.c2p(x, y), color=BLUE, radius=0.06) for x, y in zip(x_vals, y_vals)])
        self.play(LaggedStart(*[GrowFromCenter(d) for d in dots], lag_ratio=0.05), run_time=1)

        def get_line_and_errors(w, b):
            line = axes.plot(lambda x: w * x + b, x_range=[0, 10], color=YELLOW, stroke_width=3)
            errors = VGroup()
            loss = 0
            for x, y in zip(x_vals, y_vals):
                y_pred = w * x + b
                loss += (y - y_pred)**2
                err_line = DashedLine(axes.c2p(x, y), axes.c2p(x, y_pred), color=RED_C, stroke_width=2)
                errors.add(err_line)
            return line, errors, loss

        w_opt, b_opt = np.polyfit(x_vals, y_vals, 1)

        w_tracker = ValueTracker(0.2)
        b_tracker = ValueTracker(6.0)

        line_mob = always_redraw(lambda: get_line_and_errors(w_tracker.get_value(), b_tracker.get_value())[0])
        err_mob = always_redraw(lambda: get_line_and_errors(w_tracker.get_value(), b_tracker.get_value())[1])

        loss_text = always_redraw(lambda: Text(
            f"残差平方和 (SSE): {get_line_and_errors(w_tracker.get_value(), b_tracker.get_value())[2]:.1f}",
            font_size=20, color=RED_C
        ).to_edge(RIGHT, buff=1.0).shift(UP * 1.5))

        self.play(Create(line_mob), Create(err_mob), FadeIn(loss_text))
        self.wait(0.5)

        self.play(
            w_tracker.animate.set_value(w_opt),
            b_tracker.animate.set_value(b_opt),
            run_time=2.5, rate_func=there_and_back_with_pause
        )

        self.play(
            w_tracker.animate.set_value(w_opt),
            b_tracker.animate.set_value(b_opt),
            run_time=2.0
        )

        opt_text = Text("最佳拟合线！", font_size=24, color=YELLOW).next_to(loss_text, DOWN, buff=0.4)
        self.play(FadeIn(opt_text))
        self.wait(2)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
