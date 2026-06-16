"""第 2.4 节 · 连续分布：均匀、指数与正态

三幕展示三种连续分布的 PDF 形状与关键性质：
  幕一：均匀分布 U(0,1) 的等高矩形 PDF
  幕二：指数分布 Exp(1) 的下凸曲线，演示无记忆性
  幕三：正态分布 N(0,1) 钟形曲线，依次高亮 1σ/2σ/3σ 规则

中文文字用 Text（依赖 Microsoft YaHei）；数学符号用 MathTex（依赖 LaTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BLUE_E,
    BOLD,
    DOWN,
    FadeIn,
    FadeOut,
    GREEN,
    GREEN_D,
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
    FunctionGraph,
    Line,
    MathTex,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    Polygon,
    NumberPlane,
    Arrow,
)
import numpy as np

CJK = "Microsoft YaHei"

# ---------------------------------------------------------------------------
# 辅助：给坐标系下方的面积区间上色（用 Polygon 填充）
# ---------------------------------------------------------------------------

def filled_area(axes, func, x_min, x_max, color, opacity=0.5, n=200):
    """在 axes 中，func 曲线下方 [x_min, x_max] 区间填充色块。"""
    xs = np.linspace(x_min, x_max, n)
    points = [axes.c2p(x, func(x)) for x in xs]
    points += [axes.c2p(x_max, 0), axes.c2p(x_min, 0)]
    poly = Polygon(*points, fill_color=color, fill_opacity=opacity,
                   stroke_width=0)
    return poly


class ContDistScene(Scene):
    def construct(self):
        # ===================================================================
        # 幕一：均匀分布 U(0,1)
        # ===================================================================
        title1 = (
            Text("均匀分布", font=CJK, weight=BOLD, color=BLUE_D)
            .scale(0.75)
            .to_edge(UP, buff=0.3)
        )
        formula1 = MathTex(
            r"f(x) = 1,\quad x \in [0,1]",
            color=WHITE,
        ).scale(0.7).next_to(title1, DOWN, buff=0.15)

        self.play(Write(title1), FadeIn(formula1))
        self.wait(0.3)

        ax1 = Axes(
            x_range=[-0.3, 1.5, 0.5],
            y_range=[0, 1.6, 0.5],
            x_length=6,
            y_length=3.5,
            axis_config={"include_tip": True, "tip_length": 0.18, "color": WHITE},
            x_axis_config={"numbers_to_include": [0, 0.5, 1]},
            y_axis_config={"numbers_to_include": [0, 0.5, 1]},
        ).shift(DOWN * 0.5)

        x_label1 = ax1.get_x_axis_label(MathTex(r"x"))
        y_label1 = ax1.get_y_axis_label(MathTex(r"f(x)"))

        self.play(Create(ax1), FadeIn(x_label1), FadeIn(y_label1))

        # 矩形 PDF：x in [0,1], f=1
        rect = Rectangle(
            width=ax1.c2p(1, 0)[0] - ax1.c2p(0, 0)[0],
            height=ax1.c2p(0, 1)[1] - ax1.c2p(0, 0)[1],
            color=BLUE,
            fill_color=BLUE,
            fill_opacity=0.45,
        ).move_to(
            (ax1.c2p(0, 0) + ax1.c2p(1, 1)) / 2
        )

        self.play(Create(rect))

        # 标注"等高 = 等可能"
        eq_label = (
            Text("等高 = 等可能", font=CJK, color=YELLOW)
            .scale(0.5)
            .next_to(rect, RIGHT, buff=0.25)
        )
        self.play(FadeIn(eq_label))
        self.wait(1.2)

        # 面积 = 1 提示
        area_label = MathTex(r"\int_0^1 1\,dx = 1", color=GREEN).scale(0.6)
        area_label.next_to(ax1, DOWN, buff=0.15)
        self.play(FadeIn(area_label))
        self.wait(1.0)

        self.play(FadeOut(VGroup(title1, formula1, ax1, x_label1, y_label1,
                                  rect, eq_label, area_label)))
        self.wait(0.2)

        # ===================================================================
        # 幕二：指数分布 Exp(1) + 无记忆性
        # ===================================================================
        title2 = (
            Text("指数分布", font=CJK, weight=BOLD, color=ORANGE)
            .scale(0.75)
            .to_edge(UP, buff=0.3)
        )
        formula2 = MathTex(
            r"f(x) = e^{-x},\quad x \ge 0",
            color=WHITE,
        ).scale(0.7).next_to(title2, DOWN, buff=0.15)

        self.play(Write(title2), FadeIn(formula2))
        self.wait(0.3)

        ax2 = Axes(
            x_range=[0, 4.5, 1],
            y_range=[0, 1.1, 0.5],
            x_length=6,
            y_length=3.2,
            axis_config={"include_tip": True, "tip_length": 0.18, "color": WHITE},
            x_axis_config={"numbers_to_include": [0, 1, 2, 3, 4]},
            y_axis_config={"numbers_to_include": [0, 0.5, 1]},
        ).shift(DOWN * 0.5)

        x_label2 = ax2.get_x_axis_label(MathTex(r"x"))
        y_label2 = ax2.get_y_axis_label(MathTex(r"f(x)"))

        self.play(Create(ax2), FadeIn(x_label2), FadeIn(y_label2))

        exp_func = lambda x: np.exp(-x)
        exp_graph = ax2.plot(exp_func, x_range=[0, 4.4], color=ORANGE)
        self.play(Create(exp_graph))
        self.wait(0.5)

        # 演示无记忆性：P(X > s+t | X > s) = P(X > t)
        # 标注 s=1, t=1 的区间
        s, t = 1.0, 1.0
        # 高亮 [s, s+t]
        area_st = filled_area(ax2, exp_func, s, s + t, color=YELLOW, opacity=0.55)
        # 高亮 [0, t]
        area_t = filled_area(ax2, exp_func, 0, t, color=GREEN, opacity=0.45)

        mem_label = (
            Text("无记忆性", font=CJK, color=YELLOW)
            .scale(0.55)
            .to_edge(RIGHT, buff=0.4)
            .shift(UP * 0.5)
        )
        mem_formula = MathTex(
            r"P(X>s{+}t\mid X>s)=P(X>t)",
            color=YELLOW,
        ).scale(0.55).next_to(mem_label, DOWN, buff=0.2)

        # 先展示 [0, t] 绿色区域
        self.play(FadeIn(area_t))
        t_label = MathTex(r"t=1", color=GREEN).scale(0.55).next_to(
            ax2.c2p(0.5, 0), DOWN, buff=0.1
        )
        self.play(FadeIn(t_label))
        self.wait(0.5)

        # 再展示 [s, s+t] 黄色区域
        self.play(FadeIn(area_st))
        st_label = MathTex(r"s{+}t=2", color=YELLOW).scale(0.55).next_to(
            ax2.c2p(1.5, 0), DOWN, buff=0.1
        )
        self.play(FadeIn(st_label))

        self.play(Write(mem_label), Write(mem_formula))
        self.wait(1.5)

        self.play(FadeOut(VGroup(title2, formula2, ax2, x_label2, y_label2,
                                  exp_graph, area_st, area_t, mem_label,
                                  mem_formula, t_label, st_label)))
        self.wait(0.2)

        # ===================================================================
        # 幕三：正态分布 N(0,1) 与 3σ 规则
        # ===================================================================
        title3 = (
            Text("正态分布", font=CJK, weight=BOLD, color=GREEN_D)
            .scale(0.75)
            .to_edge(UP, buff=0.3)
        )
        formula3 = MathTex(
            r"f(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}",
            color=WHITE,
        ).scale(0.65).next_to(title3, DOWN, buff=0.15)

        self.play(Write(title3), FadeIn(formula3))
        self.wait(0.3)

        ax3 = Axes(
            x_range=[-3.8, 3.8, 1],
            y_range=[0, 0.45, 0.1],
            x_length=7,
            y_length=3.2,
            axis_config={"include_tip": True, "tip_length": 0.18, "color": WHITE},
            x_axis_config={"numbers_to_include": [-3, -2, -1, 0, 1, 2, 3]},
        ).shift(DOWN * 0.6)

        x_label3 = ax3.get_x_axis_label(MathTex(r"x"))

        self.play(Create(ax3), FadeIn(x_label3))

        norm_func = lambda x: np.exp(-x ** 2 / 2) / np.sqrt(2 * np.pi)
        norm_graph = ax3.plot(norm_func, x_range=[-3.7, 3.7], color=GREEN_D)
        self.play(Create(norm_graph))
        self.wait(0.4)

        # ---- 依次高亮三个规则 ----
        sigma_specs = [
            (1, BLUE,   r"68\%",   "68% 落在 (-σ, σ)"),
            (2, YELLOW, r"95\%",   "95% 落在 (-2σ, 2σ)"),
            (3, RED,    r"99.7\%", "99.7% 落在 (-3σ, 3σ)"),
        ]

        prev_fill = None
        prev_text = None

        for sigma, color, pct_str, cn_str in sigma_specs:
            fill = filled_area(ax3, norm_func, -sigma, sigma,
                               color=color, opacity=0.45)
            pct_mob = (
                MathTex(pct_str, color=color)
                .scale(0.75)
                .move_to(ax3.c2p(0, norm_func(0) * 0.5))
            )
            cn_mob = (
                Text(cn_str, font=CJK, color=color)
                .scale(0.45)
                .next_to(ax3, DOWN, buff=0.15)
            )

            if prev_fill is None:
                self.play(FadeIn(fill), FadeIn(pct_mob), FadeIn(cn_mob))
            else:
                self.play(
                    Transform(prev_fill, fill),
                    Transform(prev_text, cn_mob),
                    FadeIn(pct_mob),
                )
            prev_fill = fill
            prev_text = cn_mob
            self.wait(1.3)

        self.wait(0.5)
        self.play(FadeOut(VGroup(title3, formula3, ax3, x_label3,
                                  norm_graph, prev_fill, prev_text)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "ContDistScene",
        "id": "ch02-2.4-continuous-dist",
        "chapterId": "ch02",
        "sectionId": "2.4",
        "title": "连续分布：均匀、指数与正态",
        "description": "三幕动画分别展示均匀分布的等高PDF、指数分布的无记忆性、正态分布的1σ/2σ/3σ规则。",
    },
]
