"""第 3.4 节 · 随机变量的独立性 —— 面积直观：独立⟺联合密度可分离。

通过对比有相关结构与独立结构的联合分布热力图，以及
不相关但不独立的经典例子（X~U(-1,1), Y=X^2），
建立「独立」与「不相关」的直觉区分。

中文文字用 Text（依赖系统字体 Microsoft YaHei）；
数学公式用 MathTex（依赖 LaTeX/MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
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
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
    Arrow,
    Line,
    DashedLine,
    NumberPlane,
)
import numpy as np

CJK = "Microsoft YaHei"


def _make_heatmap(
    ax,
    z_func,
    x_range=(-1.5, 1.5),
    y_range=(-1.5, 1.5),
    resolution=16,
    color_hot=RED,
    color_cold=BLUE_D,
):
    """在 Axes 坐标系内绘制近似热力图（用矩形网格着色）。"""
    cells = VGroup()
    xs = np.linspace(x_range[0], x_range[1], resolution + 1)
    ys = np.linspace(y_range[0], y_range[1], resolution + 1)
    dx = xs[1] - xs[0]
    dy = ys[1] - ys[0]
    # 计算 z 值范围以归一化
    vals = []
    for i in range(resolution):
        for j in range(resolution):
            xc = (xs[i] + xs[i + 1]) / 2
            yc = (ys[j] + ys[j + 1]) / 2
            vals.append(z_func(xc, yc))
    z_min, z_max = min(vals), max(vals)
    if z_max == z_min:
        z_max = z_min + 1e-9

    k = 0
    for i in range(resolution):
        for j in range(resolution):
            xc = (xs[i] + xs[i + 1]) / 2
            yc = (ys[j] + ys[j + 1]) / 2
            t = (vals[k] - z_min) / (z_max - z_min)
            k += 1
            # t=0 → 冷色, t=1 → 暖色
            color = interpolate_color_simple(t)
            # 像素矩形：先在 axes 坐标系内定位
            p_bl = ax.c2p(xs[i], ys[j])
            p_tr = ax.c2p(xs[i + 1], ys[j + 1])
            w = abs(p_tr[0] - p_bl[0])
            h = abs(p_tr[1] - p_bl[1])
            rect = Rectangle(
                width=w,
                height=h,
                fill_color=color,
                fill_opacity=0.85,
                stroke_width=0,
            )
            rect.move_to([(p_bl[0] + p_tr[0]) / 2, (p_bl[1] + p_tr[1]) / 2, 0])
            cells.add(rect)
    return cells


def interpolate_color_simple(t):
    """蓝→白→红渐变：t=0冷(蓝), t=0.5中性(白), t=1热(红)。"""
    if t < 0.5:
        s = t * 2  # 0..1
        r = int(s * 255)
        g = int(s * 255)
        b = 255
    else:
        s = (t - 0.5) * 2  # 0..1
        r = 255
        g = int((1 - s) * 255)
        b = int((1 - s) * 255)
    return "#{:02x}{:02x}{:02x}".format(r, g, b)


# ──────────────────────────────────────────────
# 联合密度函数

def joint_correlated(x, y):
    """有相关的联合密度（对角线趋势）：双变量正态，rho=0.8。"""
    rho = 0.8
    z = (x**2 - 2 * rho * x * y + y**2) / (2 * (1 - rho**2))
    return np.exp(-z)  # 未归一化，仅用于可视化


def joint_independent(x, y):
    """独立的联合密度：f(x,y) = f_X(x) * f_Y(y)，标准正态乘积。"""
    return np.exp(-0.5 * x**2) * np.exp(-0.5 * y**2)


# ──────────────────────────────────────────────

class RVIndepScene(Scene):
    def construct(self):
        # ────────────── 幕 1：标题 ──────────────
        title = Text("随机变量的独立性", font=CJK, weight=BOLD).scale(0.75).to_edge(UP)
        subtitle = Text("面积直观：联合密度 = 边缘密度之积", font=CJK).scale(0.45)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.8)

        # ────────────── 幕 2：左右热力图对比 ──────────────
        self.play(FadeOut(subtitle))

        # --- 左轴：相关（不独立）---
        ax_left = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            x_length=3.2,
            y_length=3.2,
            axis_config={"include_tip": False, "stroke_width": 1.5},
        ).shift(LEFT * 3.2 + DOWN * 0.3)

        lbl_left = Text("不独立（有相关）", font=CJK, color=RED).scale(0.42)
        lbl_left.next_to(ax_left, DOWN, buff=0.25)

        # --- 右轴：独立 ---
        ax_right = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            x_length=3.2,
            y_length=3.2,
            axis_config={"include_tip": False, "stroke_width": 1.5},
        ).shift(RIGHT * 3.2 + DOWN * 0.3)

        lbl_right = Text("独立（可分离）", font=CJK, color=GREEN).scale(0.42)
        lbl_right.next_to(ax_right, DOWN, buff=0.25)

        # 热力图网格
        heat_corr = _make_heatmap(ax_left, joint_correlated, resolution=18)
        heat_indep = _make_heatmap(ax_right, joint_independent, resolution=18)

        self.play(
            Create(ax_left),
            Create(ax_right),
        )
        self.play(
            FadeIn(heat_corr),
            FadeIn(heat_indep),
        )
        self.play(
            FadeIn(lbl_left),
            FadeIn(lbl_right),
        )
        self.wait(1.0)

        # 在两图中间加箭头和说明
        arrow = Arrow(ax_left.get_right(), ax_right.get_left(), buff=0.1, color=YELLOW)
        arrow_lbl = Text("独立化", font=CJK, color=YELLOW).scale(0.4)
        arrow_lbl.next_to(arrow, UP, buff=0.1)
        self.play(Create(arrow), FadeIn(arrow_lbl))
        self.wait(0.6)

        # 高亮左图的「行列模式」
        hl_box = SurroundingRectangle(heat_corr, color=RED, buff=0.05, stroke_width=3)
        hl_note = Text("对角条纹：X,Y 有线性关系", font=CJK, color=RED).scale(0.35)
        hl_note.next_to(hl_box, UP, buff=0.1)
        self.play(Create(hl_box), FadeIn(hl_note))
        self.wait(1.2)

        self.play(FadeOut(VGroup(hl_box, hl_note, arrow, arrow_lbl)))
        self.wait(0.4)

        # ────────────── 幕 3：可分离公式 ──────────────
        self.play(FadeOut(VGroup(heat_corr, heat_indep, ax_left, ax_right, lbl_left, lbl_right)))

        formula_title = Text("独立性的充要条件", font=CJK, weight=BOLD).scale(0.6).shift(UP * 2.8)
        self.play(Write(formula_title))

        # 定义式
        f_joint = MathTex(
            r"f(x, y) = f_X(x) \cdot f_Y(y)",
            color=YELLOW,
        ).scale(0.9).shift(UP * 1.5)

        iff_label = MathTex(r"\Longleftrightarrow").scale(1.0).next_to(f_joint, DOWN, buff=0.3)

        f_cdf = MathTex(
            r"F(x, y) = F_X(x) \cdot F_Y(y)",
        ).scale(0.85).next_to(iff_label, DOWN, buff=0.3)

        self.play(Write(f_joint))
        self.play(FadeIn(iff_label), Write(f_cdf))
        self.wait(0.8)

        # 「可分离」几何意义文字
        sep_text = Text("联合密度可分离", font=CJK, color=GREEN).scale(0.5)
        sep_arr = Arrow(sep_text.get_top(), f_joint.get_bottom(), buff=0.1, color=GREEN)
        sep_text.next_to(f_joint, DOWN * 3.5)
        self.play(FadeIn(sep_text), Create(sep_arr))
        self.wait(1.0)

        self.play(FadeOut(VGroup(formula_title, f_joint, iff_label, f_cdf, sep_text, sep_arr)))

        # ────────────── 幕 4：不相关 ≠ 独立 例子 ──────────────
        counter_title = Text("警示：不相关 ≠ 独立", font=CJK, weight=BOLD, color=ORANGE).scale(0.6)
        counter_title.to_edge(UP, buff=0.4)
        self.play(Write(counter_title))

        # 说明 X~U(-1,1), Y=X^2
        ex_text1 = Text("例：X ~ U(-1,1)，Y = X²", font=CJK).scale(0.5)
        ex_text1.shift(UP * 1.5)

        cor_formula = MathTex(r"\mathrm{Cov}(X,Y) = E[X^3] - E[X] \cdot E[X^2] = 0")
        cor_formula.scale(0.65).next_to(ex_text1, DOWN, buff=0.3)

        zero_corr = Text("协方差 = 0，不相关", font=CJK, color=YELLOW).scale(0.48)
        zero_corr.next_to(cor_formula, DOWN, buff=0.25)

        not_indep = Text("但 Y 由 X 完全决定，显然不独立！", font=CJK, color=RED).scale(0.48)
        not_indep.next_to(zero_corr, DOWN, buff=0.3)

        self.play(FadeIn(ex_text1))
        self.play(Write(cor_formula))
        self.play(FadeIn(zero_corr))
        self.wait(0.5)
        self.play(FadeIn(not_indep))
        self.wait(0.8)

        # 散点图示意：Y=X^2 的抛物线点云
        ax_ex = Axes(
            x_range=[-1.2, 1.2, 0.5],
            y_range=[-0.1, 1.3, 0.5],
            x_length=3.5,
            y_length=2.2,
            axis_config={"include_tip": False, "stroke_width": 1.5},
        ).shift(DOWN * 1.5)

        ax_x_lbl = MathTex("x").scale(0.55).next_to(ax_ex.x_axis.get_right(), RIGHT, buff=0.1)
        ax_y_lbl = MathTex("y = x^2").scale(0.55).next_to(ax_ex.y_axis.get_top(), UP, buff=0.1)

        # 散点云
        np.random.seed(42)
        xs_s = np.linspace(-1, 1, 30)
        dots = VGroup(*[
            Dot(ax_ex.c2p(x, x**2), radius=0.06, color=BLUE).set_opacity(0.9)
            for x in xs_s
        ])

        self.play(Create(ax_ex), FadeIn(ax_x_lbl), FadeIn(ax_y_lbl))
        self.play(FadeIn(dots, lag_ratio=0.05))

        parabola_note = Text("点全部落在抛物线上 → 完全函数相关", font=CJK, color=RED).scale(0.38)
        parabola_note.next_to(ax_ex, DOWN, buff=0.18)
        self.play(FadeIn(parabola_note))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            counter_title, ex_text1, cor_formula, zero_corr, not_indep,
            ax_ex, ax_x_lbl, ax_y_lbl, dots, parabola_note,
        )))

        # ────────────── 幕 5：小结 ──────────────
        summary_title = Text("小结", font=CJK, weight=BOLD).scale(0.65).to_edge(UP, buff=0.5)
        self.play(Write(summary_title))

        lines = [
            ("独立", r"f(x,y) = f_X(x) \cdot f_Y(y)", GREEN),
            ("热力图无「行列模式」", None, GREEN),
            ("不相关：", r"\mathrm{Cov}(X,Y)=0", YELLOW),
            ("独立", None, GREEN),
            ("不相关  \\nleq  独立", None, RED),
        ]

        # 逐条显示
        row1 = MathTex(r"X \perp Y \;\Leftrightarrow\; f(x,y)=f_X(x)\cdot f_Y(y)", color=GREEN)
        row1.scale(0.75).shift(UP * 1.2)

        row2 = Text("热力图：独立 → 行列无特定模式", font=CJK, color=GREEN).scale(0.47)
        row2.next_to(row1, DOWN, buff=0.35)

        row3 = MathTex(r"X \perp Y \;\Rightarrow\; \mathrm{Cov}(X,Y)=0", color=YELLOW)
        row3.scale(0.7).next_to(row2, DOWN, buff=0.35)

        row4 = MathTex(r"\mathrm{Cov}(X,Y)=0 \;\not\Rightarrow\; X \perp Y", color=RED)
        row4.scale(0.7).next_to(row3, DOWN, buff=0.35)

        ex_hint = Text("反例：Y = X²", font=CJK, color=RED).scale(0.45)
        ex_hint.next_to(row4, DOWN, buff=0.25)

        self.play(Write(row1))
        self.play(FadeIn(row2))
        self.play(Write(row3))
        self.play(Write(row4))
        self.play(FadeIn(ex_hint))
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, summary_title, row1, row2, row3, row4, ex_hint)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "RVIndepScene",
        "id": "ch03-3.4-rv-independence",
        "chapterId": "ch03",
        "sectionId": "3.4",
        "title": "随机变量的独立性",
        "description": "通过联合分布热力图对比与 Y=X² 反例，直观展示独立与不相关的本质区别。",
    },
]
