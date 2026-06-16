"""第 5.2 节 · 大数定律 —— 多条样本均值折线随 n 增大趋近 mu，直观体现依概率收敛。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

import random

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    LEFT,
    ORANGE,
    ORIGIN,
    PURPLE,
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
    NumberPlane,
    Polygon,
    Scene,
    Text,
    Transform,
    VGroup,
    VMobject,
    Write,
    AnimationGroup,
    Line,
    Rectangle,
)

CJK = "Microsoft YaHei"

# 固定随机种子保证每次渲染结果一致
random.seed(42)

# 模拟参数
N_LINES = 5           # 折线条数
N_MAX = 60            # 最大样本量
MU = 0.0              # 总体均值
SIGMA = 1.0           # 总体标准差
EPSILON_START = 1.2   # 初始 epsilon 带宽度
EPSILON_END = 0.25    # 最终 epsilon 带宽度

LINE_COLORS = [BLUE, GREEN, ORANGE, PURPLE, RED]


def simulate_running_means(n_max, mu=0.0, sigma=1.0):
    """生成一条样本均值折线的数据（n=1..n_max）。"""
    cumsum = 0.0
    means = []
    for i in range(1, n_max + 1):
        x = random.gauss(mu, sigma)
        cumsum += x
        means.append(cumsum / i)
    return means


class LLNScene(Scene):
    def construct(self):
        # ── 0. 标题 ──────────────────────────────────────────────────────────
        title = Text("大数定律：样本均值的收敛", font=CJK, weight=BOLD).scale(0.65)
        title.to_edge(UP, buff=0.25)
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 引言文字 ───────────────────────────────────────────────────────
        intro1 = Text("重复独立试验，样本均值会越来越靠近总体均值", font=CJK).scale(0.42)
        intro1.next_to(title, DOWN, buff=0.2)
        intro2 = Text("X̄ₙ = (1/n)·ΣXᵢ  →(P)→  μ", font=CJK)
        intro2.scale(0.72).next_to(intro1, DOWN, buff=0.15)
        self.play(FadeIn(intro1))
        self.play(Write(intro2))
        self.wait(1.0)
        self.play(FadeOut(VGroup(intro1, intro2)))

        # ── 2. 建立坐标系 ────────────────────────────────────────────────────
        axes = Axes(
            x_range=[1, N_MAX, 10],
            y_range=[-2.0, 2.0, 0.5],
            x_length=9.0,
            y_length=4.5,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 0.35)

        x_label = Text("n  (样本量)", font=CJK).scale(0.38)
        x_label.next_to(axes.x_axis.get_right(), RIGHT, buff=0.1)
        y_label = Text("X̄ₙ", font=CJK).scale(0.55)
        y_label.next_to(axes.y_axis.get_top(), UP, buff=0.05)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.wait(0.2)

        # ── 3. mu 水平虚线 ────────────────────────────────────────────────────
        mu_left  = axes.c2p(1,  MU)
        mu_right = axes.c2p(N_MAX, MU)
        mu_line = DashedLine(mu_left, mu_right, color=YELLOW, stroke_width=2, dash_length=0.15)
        mu_tex = Text("μ = 0", font=CJK, color=YELLOW).scale(0.48)
        mu_tex.next_to(mu_right, RIGHT, buff=0.08)
        self.play(Create(mu_line), FadeIn(mu_tex))
        self.wait(0.3)

        # ── 4. 预先生成所有折线数据 ───────────────────────────────────────────
        all_means = [simulate_running_means(N_MAX, MU, SIGMA) for _ in range(N_LINES)]

        # ── 5. 逐步绘制 5 条折线（前 30 个点，一次画完） ─────────────────────
        section_label = Text("5 条独立模拟路径", font=CJK).scale(0.42)
        section_label.to_edge(RIGHT, buff=0.1).shift(UP * 2.8)
        self.play(FadeIn(section_label))

        polylines = []
        for li, (means, color) in enumerate(zip(all_means, LINE_COLORS)):
            # 只画前 30 点
            points = [axes.c2p(n + 1, means[n]) for n in range(30)]
            poly = VMobject(color=color, stroke_width=1.8, stroke_opacity=0.85)
            poly.set_points_smoothly(points)
            polylines.append(poly)
            self.play(Create(poly), run_time=0.5)

        self.wait(0.5)

        # ── 6. 说明：初始波动较大 ─────────────────────────────────────────────
        note_big = Text("n 较小时波动明显", font=CJK, color=ORANGE).scale(0.40)
        note_big.to_edge(LEFT, buff=0.25).shift(UP * 2.5)
        self.play(FadeIn(note_big))
        self.wait(0.8)
        self.play(FadeOut(note_big))

        # ── 7. 继续延伸折线到 n=60 ───────────────────────────────────────────
        for li, (means, color, old_poly) in enumerate(zip(all_means, LINE_COLORS, polylines)):
            points_full = [axes.c2p(n + 1, means[n]) for n in range(N_MAX)]
            new_poly = VMobject(color=color, stroke_width=1.8, stroke_opacity=0.85)
            new_poly.set_points_smoothly(points_full)
            self.play(Transform(old_poly, new_poly), run_time=0.4)

        self.wait(0.5)

        # ── 8. epsilon 带：从宽到窄 ──────────────────────────────────────────
        eps_label_text = Text("epsilon 带", font=CJK, color=GOLD).scale(0.40)
        eps_label_text.to_edge(LEFT, buff=0.25).shift(UP * 2.5)

        def make_epsilon_band(eps):
            """生成 ±eps 带的矩形（填充色）。"""
            top_left  = axes.c2p(1,      MU + eps)
            bot_right = axes.c2p(N_MAX,  MU - eps)
            rect = Rectangle(
                width=bot_right[0] - top_left[0],
                height=top_left[1] - bot_right[1],
                color=GOLD,
                fill_opacity=0.12,
                stroke_width=1.2,
                stroke_opacity=0.7,
            )
            rect.move_to([(top_left[0] + bot_right[0]) / 2,
                           (top_left[1] + bot_right[1]) / 2, 0])
            return rect

        eps_band = make_epsilon_band(EPSILON_START)
        eps_math = Text("±ε", font=CJK, color=GOLD).scale(0.50)
        eps_math.next_to(axes.c2p(N_MAX, MU + EPSILON_START), RIGHT, buff=0.05)

        self.play(FadeIn(eps_band), FadeIn(eps_label_text), FadeIn(eps_math))
        self.wait(0.5)

        # 带逐渐收缩
        epsilons = [0.9, 0.6, EPSILON_END]
        for eps in epsilons:
            new_band = make_epsilon_band(eps)
            new_math = Text("±ε", font=CJK, color=GOLD).scale(0.50)
            new_math.next_to(axes.c2p(N_MAX, MU + eps), RIGHT, buff=0.05)
            self.play(
                Transform(eps_band, new_band),
                Transform(eps_math, new_math),
                run_time=0.6,
            )
            self.wait(0.25)

        self.wait(0.4)

        # ── 9. 计数：有多少条折线在 ε 带内 ────────────────────────────────────
        eps_final = EPSILON_END
        count_in = 0
        for means in all_means:
            # 检查最后 20 个点是否都在带内
            if all(abs(means[n]) <= eps_final for n in range(N_MAX - 20, N_MAX)):
                count_in += 1

        count_label = Text(f"{count_in}/5 条路径已进入 epsilon 带", font=CJK, color=GREEN).scale(0.42)
        count_label.to_edge(RIGHT, buff=0.1).shift(UP * 2.3)
        self.play(FadeIn(count_label))
        self.wait(0.5)

        prob_note = Text(
            "P(|X̄ₙ - μ| < ε) → 1", font=CJK
        ).scale(0.60)
        prob_note.to_edge(RIGHT, buff=0.2).shift(UP * 1.5)
        self.play(Write(prob_note))
        self.wait(0.8)

        # ── 10. 弱大数定律定理文字 ────────────────────────────────────────────
        self.play(FadeOut(VGroup(section_label, eps_label_text, count_label)))

        law_title = Text("弱大数定律 (Khinchin)", font=CJK, weight=BOLD, color=BLUE).scale(0.46)
        law_title.next_to(axes, DOWN, buff=0.15)
        law_body = Text(
            "∀ε>0,  lim(n→∞) P(|X̄ₙ - μ| < ε) = 1",
            font=CJK,
        ).scale(0.55)
        law_body.next_to(law_title, DOWN, buff=0.12)

        self.play(Write(law_title))
        self.play(Write(law_body))
        self.wait(1.5)

        # ── 11. 淡出并收尾 ────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(*polylines, eps_band, eps_math, mu_line, mu_tex,
                                  axes, x_label, y_label, prob_note,
                                  law_title, law_body)))
        outro = Text("样本量越大，均值越稳定——这就是大数定律", font=CJK, color=YELLOW).scale(0.52)
        outro.move_to(ORIGIN)
        self.play(FadeIn(outro))
        self.wait(1.5)
        self.play(FadeOut(VGroup(outro, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "LLNScene",
        "id": "ch05-5.2-lln",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "大数定律：样本均值的收敛",
        "description": "用 5 条样本均值折线与收窄的 epsilon 带，直观展示大数定律——样本量越大，均值依概率收敛到总体均值 mu。",
    },
]
