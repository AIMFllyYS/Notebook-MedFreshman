"""
Ch07 - 参数估计：置信区间【Cairo版本，不依赖LaTeX】
"""
from manim import *
import numpy as np

config.pixel_height = 720
config.pixel_width = 1280
config.frame_rate = 30
config.renderer = "cairo"

class ConfidenceIntervalScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f1115"
        np.random.seed(1)

        title = Text("参数估计：置信区间的含义", font_size=38, color=WHITE, weight=BOLD).to_edge(UP, buff=0.3)
        self.play(FadeIn(title, shift=DOWN * 0.2))

        true_mu = 5.0
        line = NumberLine(x_range=[2, 8, 1], length=10, font_size=20, color=GREY_B).shift(UP * 1.5)
        mu_dot = Dot(line.n2p(true_mu), color=YELLOW, radius=0.1)
        mu_lbl = Text("真实均值 μ", font_size=20, color=YELLOW).next_to(mu_dot, UP, buff=0.15)
        self.play(Create(line), GrowFromCenter(mu_dot), FadeIn(mu_lbl), run_time=1)

        sim_title = Text("重复抽样 50 次，计算 95% 置信区间：", font_size=22, color=BLUE_B).next_to(line, DOWN, buff=0.6)
        self.play(Write(sim_title))

        intervals = VGroup()
        n_samples = 50
        hit_count = 0

        y_start = sim_title.get_center()[1] - 0.4
        y_step = 0.08
        x_min, x_max = 2, 8

        lines_to_show = []
        for i in range(n_samples):
            sample_mean = np.random.normal(true_mu, 0.4)
            margin = 0.7 + np.random.uniform(-0.1, 0.2)
            left, right = sample_mean - margin, sample_mean + margin

            is_hit = (left <= true_mu <= right)
            if is_hit: hit_count += 1

            color = GREEN_C if is_hit else RED_C
            y_pos = y_start - i * y_step

            l_pt = [line.n2p(max(left, x_min))[0], y_pos, 0]
            r_pt = [line.n2p(min(right, x_max))[0], y_pos, 0]
            m_pt = [line.n2p(sample_mean)[0], y_pos, 0]

            segment = Line(l_pt, r_pt, color=color, stroke_width=3)
            center_dot = Dot(m_pt, color=color, radius=0.04)
            lines_to_show.append(VGroup(segment, center_dot))

        # 分批显示
        self.play(LaggedStart(*[FadeIn(l) for l in lines_to_show[:10]], lag_ratio=0.1), run_time=1.5)
        self.play(LaggedStart(*[FadeIn(l) for l in lines_to_show[10:]], lag_ratio=0.02), run_time=2)

        summary = Text(f"包含真实 μ 的区间比例：{hit_count}/{n_samples} = {hit_count/n_samples*100:.1f}%", font_size=24, color=WHITE)
        summary.to_edge(DOWN, buff=0.4)
        self.play(Write(summary))
        self.wait(2.5)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
