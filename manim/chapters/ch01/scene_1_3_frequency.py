"""第 1.3 节 · 频率的稳定性 —— 模拟抛硬币，折线显示正面频率随次数增大趋于 0.5。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    NumberPlane,
    Scene,
    Text,
    Transform,
    VGroup,
    VMobject,
    Write,
    smooth,
)
import random

CJK = "Microsoft YaHei"

# 固定随机种子使动画可复现
random.seed(42)


def _simulate_coin_flips(n: int) -> list[float]:
    """返回前 n 次抛硬币后正面频率的累计列表（1=正面，0=反面）。"""
    heads = 0
    freq = []
    for i in range(1, n + 1):
        heads += random.randint(0, 1)
        freq.append(heads / i)
    return freq


class FrequencyStabilityScene(Scene):
    def construct(self):
        # ── 0. 标题 ──────────────────────────────────────────────────
        title = Text("频率的稳定性", font=CJK, weight=BOLD).scale(0.72).to_edge(UP, buff=0.3)
        subtitle = Text("抛硬币：正面频率随试验次数的变化", font=CJK).scale(0.42).next_to(title, DOWN, buff=0.12)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.5)

        # ── 1. 引入问题 ───────────────────────────────────────────────
        question = Text(
            "抛一枚均匀硬币，正面朝上的概率是多少？", font=CJK
        ).scale(0.48).shift(UP * 0.8)
        self.play(FadeIn(question))
        self.wait(0.8)

        freq_def_tex = MathTex(
            r"f_n(A) = \frac{n_H}{n}"
        ).scale(0.72)
        freq_def_note = Text("（nH = 正面次数）", font=CJK).scale(0.40).set_color(GRAY if False else WHITE)
        freq_def = VGroup(freq_def_tex, freq_def_note).arrange(RIGHT, buff=0.25)
        freq_def.next_to(question, DOWN, buff=0.4)
        self.play(Write(freq_def_tex), FadeIn(freq_def_note))
        self.wait(1.0)

        self.play(FadeOut(VGroup(question, freq_def_tex, freq_def_note)))

        # ── 2. 建立坐标系 ─────────────────────────────────────────────
        axes = Axes(
            x_range=[0, 200, 40],
            y_range=[0, 1, 0.25],
            x_length=9.0,
            y_length=4.2,
            axis_config={"color": WHITE, "include_ticks": True, "tick_size": 0.05},
            x_axis_config={"numbers_to_include": [40, 80, 120, 160, 200]},
            y_axis_config={"numbers_to_include": [0, 0.25, 0.5, 0.75, 1.0]},
        ).shift(DOWN * 0.6)

        x_label = Text("试验次数 n", font=CJK).scale(0.4).next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)
        y_label = Text("正面频率", font=CJK).scale(0.4).next_to(axes.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.wait(0.3)

        # ── 3. 理论概率虚线 p = 0.5 ──────────────────────────────────
        theory_line = DashedLine(
            axes.c2p(0, 0.5),
            axes.c2p(200, 0.5),
            color=GOLD,
            dash_length=0.15,
            stroke_width=2.5,
        )
        theory_label = MathTex(r"p = 0.5", color=GOLD).scale(0.55).next_to(
            axes.c2p(200, 0.5), RIGHT, buff=0.08
        )
        self.play(Create(theory_line), FadeIn(theory_label))
        self.wait(0.5)

        # ── 4. 分阶段画频率折线 ───────────────────────────────────────
        freqs = _simulate_coin_flips(200)

        def make_polyline(freq_list: list[float], color=BLUE) -> VMobject:
            """把频率序列转成 Manim VMobject 折线。"""
            line = VMobject(color=color, stroke_width=2.2)
            points = [axes.c2p(i + 1, v) for i, v in enumerate(freq_list)]
            line.set_points_as_corners(points)
            return line

        # 阶段一：前 20 次（波动大）
        phase1_label = Text("前 20 次：波动剧烈", font=CJK, color=RED).scale(0.44).to_edge(DOWN, buff=0.2)
        polyline_20 = make_polyline(freqs[:20], color=RED)
        self.play(FadeIn(phase1_label))
        self.play(Create(polyline_20), run_time=1.8, rate_func=smooth)
        self.wait(0.6)

        # 阶段一标注：当前频率点
        dot_20 = Dot(axes.c2p(20, freqs[19]), color=RED, radius=0.09)
        val_20 = MathTex(
            rf"f_{{20}} = {freqs[19]:.2f}", color=RED
        ).scale(0.48).next_to(dot_20, UP, buff=0.15)
        self.play(FadeIn(dot_20), Write(val_20))
        self.wait(0.8)
        self.play(FadeOut(VGroup(phase1_label, dot_20, val_20)))

        # 阶段二：前 80 次（开始收敛）
        phase2_label = Text("前 80 次：逐渐靠近 0.5", font=CJK, color=ORANGE).scale(0.44).to_edge(DOWN, buff=0.2)
        polyline_80 = make_polyline(freqs[:80], color=ORANGE)
        self.play(FadeIn(phase2_label))
        self.play(Transform(polyline_20, polyline_80), run_time=2.0, rate_func=smooth)
        self.wait(0.5)

        dot_80 = Dot(axes.c2p(80, freqs[79]), color=ORANGE, radius=0.09)
        val_80 = MathTex(
            rf"f_{{80}} = {freqs[79]:.2f}", color=ORANGE
        ).scale(0.48).next_to(dot_80, UP, buff=0.15)
        self.play(FadeIn(dot_80), Write(val_80))
        self.wait(0.8)
        self.play(FadeOut(VGroup(phase2_label, dot_80, val_80)))

        # 阶段三：全 200 次（稳定收敛）
        phase3_label = Text("200 次：频率稳定趋向 0.5", font=CJK, color=GREEN).scale(0.44).to_edge(DOWN, buff=0.2)
        polyline_200 = make_polyline(freqs, color=GREEN)
        self.play(FadeIn(phase3_label))
        self.play(Transform(polyline_20, polyline_200), run_time=3.0, rate_func=smooth)
        self.wait(0.5)

        dot_200 = Dot(axes.c2p(200, freqs[199]), color=GREEN, radius=0.09)
        val_200 = MathTex(
            rf"f_{{200}} = {freqs[199]:.2f}", color=GREEN
        ).scale(0.48).next_to(dot_200, UP, buff=0.15)
        self.play(FadeIn(dot_200), Write(val_200))
        self.wait(1.0)

        # ── 5. 高亮 p=0.5 区间带 ─────────────────────────────────────
        band_top = DashedLine(
            axes.c2p(0, 0.55), axes.c2p(200, 0.55),
            color=YELLOW, dash_length=0.1, stroke_width=1.2, stroke_opacity=0.5,
        )
        band_bot = DashedLine(
            axes.c2p(0, 0.45), axes.c2p(200, 0.45),
            color=YELLOW, dash_length=0.1, stroke_width=1.2, stroke_opacity=0.5,
        )
        band_note = Text("±0.05 误差带", font=CJK, color=YELLOW).scale(0.38).next_to(
            axes.c2p(200, 0.55), RIGHT, buff=0.06
        )
        self.play(Create(band_top), Create(band_bot), FadeIn(band_note))
        self.wait(1.2)

        # ── 6. 结论公式 ───────────────────────────────────────────────
        self.play(FadeOut(VGroup(phase3_label, dot_200, val_200, band_top, band_bot, band_note)))

        conclusion_cn = Text("频率的稳定性：", font=CJK, weight=BOLD).scale(0.5).shift(DOWN * 2.6)
        conclusion_formula = MathTex(
            r"\lim_{n \to \infty} f_n(A) = P(A)"
        ).scale(0.75).next_to(conclusion_cn, RIGHT, buff=0.2)
        conclusion_group = VGroup(conclusion_cn, conclusion_formula)
        bg = conclusion_group.copy().set_color(BLUE_D)

        self.play(
            FadeIn(conclusion_cn),
            Write(conclusion_formula),
        )
        self.wait(2.0)

        # ── 7. 淡出 ───────────────────────────────────────────────────
        self.play(FadeOut(VGroup(
            title, subtitle,
            axes, x_label, y_label,
            theory_line, theory_label,
            polyline_20,
            conclusion_cn, conclusion_formula,
        )))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "FrequencyStabilityScene",
        "id": "ch01-1.3-freq",
        "chapterId": "ch01",
        "sectionId": "1.3",
        "title": "频率的稳定性",
        "description": "模拟 200 次抛硬币，动态折线展示正面频率随试验次数增大而稳定趋于理论概率 0.5。",
    },
]
