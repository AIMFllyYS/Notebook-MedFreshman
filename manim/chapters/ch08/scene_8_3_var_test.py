"""第 8.3 节 · 正态总体方差的假设检验 —— χ² 检验与 F 检验

第一幕：χ²(9) 分布密度曲线，双侧假设检验，标注 α=0.05 的左右临界值，
        高亮两端拒绝域，标注观测值 χ²=15 落在接受域。
第二幕：F(5,8) 分布密度曲线，单侧右尾 F 检验，高亮右侧拒绝域。

中文文字用 Text（Microsoft YaHei）；数学公式用 MathTex（LaTeX/MiKTeX）。
MathTex 内绝对不含中文或全角标点。
"""

import numpy as np
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
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    Arrow,
    DashedLine,
    Dot,
    FunctionGraph,
    Line,
    Rectangle,
    Polygon,
)
from scipy.stats import chi2, f as f_dist

CJK = "Microsoft YaHei"

# ─────────────────────────────────────────────
# 工具：把分布曲线下的区域填充为多边形
# ─────────────────────────────────────────────

def area_polygon(axes, func, x_min, x_max, n=80, color=RED, opacity=0.45):
    """在 axes 坐标系中，func 在 [x_min, x_max] 下方的填充多边形。"""
    xs = np.linspace(x_min, x_max, n)
    ys = [func(x) for x in xs]
    pts_top = [axes.c2p(x, y) for x, y in zip(xs, ys)]
    pts_bot = [axes.c2p(xs[-1], 0), axes.c2p(xs[0], 0)]
    return Polygon(*pts_top, *pts_bot, color=color, fill_color=color, fill_opacity=opacity, stroke_width=0)


# ─────────────────────────────────────────────
# 场景
# ─────────────────────────────────────────────

class VarTestScene(Scene):
    def construct(self):
        # ── 幕一：χ² 检验 ────────────────────────────────────────────
        self._act1_chi2()
        self.wait(0.5)
        self._transition()
        # ── 幕二：F 检验 ─────────────────────────────────────────────
        self._act2_f()
        self.wait(0.8)

    # ── 幕一 ──────────────────────────────────────────────────────────

    def _act1_chi2(self):
        # 标题
        title = Text("方差检验（一）：χ² 检验", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # 假设说明（纯中文，不放公式）
        hyp_text = Text("H0: σ²= σ₀²  vs  H1: σ²≠ σ₀²", font=CJK).scale(0.45)
        hyp_text.next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(hyp_text))
        self.wait(0.3)

        # 统计量公式
        stat_label = MathTex(
            r"\chi^2 = \frac{(n-1)S^2}{\sigma_0^2} \sim \chi^2(n-1)"
        ).scale(0.65)
        stat_label.next_to(hyp_text, DOWN, buff=0.25)
        self.play(Write(stat_label))
        self.wait(0.5)

        # 坐标轴
        axes = Axes(
            x_range=[0, 26, 5],
            y_range=[0, 0.13, 0.05],
            x_length=8.5,
            y_length=3.5,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 1.5)

        x_label = MathTex(r"\chi^2").scale(0.6).next_to(axes.x_axis.get_right(), DOWN, buff=0.15)
        y_label = MathTex(r"f(\chi^2)").scale(0.55).next_to(axes.y_axis.get_top(), LEFT, buff=0.1)

        # χ²(9) 密度
        df_chi = 9

        def chi2_pdf(x):
            if x <= 0:
                return 0.0
            return float(chi2.pdf(x, df_chi))

        curve = axes.plot(chi2_pdf, x_range=[0.05, 25.5, 0.1], color=BLUE, stroke_width=2.5)

        self.play(Create(axes), FadeIn(x_label, y_label))
        self.play(Create(curve))
        self.wait(0.4)

        # 副标题：df 说明
        df_label = Text("χ²(9) 分布  n=10", font=CJK).scale(0.42)
        df_label.next_to(axes, UP, buff=0.12).shift(RIGHT * 2.5)
        self.play(FadeIn(df_label))

        # 临界值 α=0.05 双侧：左 2.7，右 19.0
        chi_left = 2.7
        chi_right = 19.0

        # 左拒绝域
        left_region = area_polygon(axes, chi2_pdf, 0.05, chi_left, color=RED, opacity=0.5)
        # 右拒绝域
        right_region = area_polygon(axes, chi2_pdf, chi_right, 25.5, color=RED, opacity=0.5)

        self.play(FadeIn(left_region), FadeIn(right_region))
        self.wait(0.3)

        # 临界值虚线
        def vert_dashed(x_val, color=YELLOW):
            top = axes.c2p(x_val, chi2_pdf(x_val) + 0.005)
            bot = axes.c2p(x_val, 0)
            return DashedLine(bot, top, color=color, stroke_width=1.8)

        vl_left = vert_dashed(chi_left)
        vl_right = vert_dashed(chi_right)
        self.play(Create(vl_left), Create(vl_right))

        # 临界值标注
        lbl_left = MathTex(r"\chi^2_{0.975}=2.7").scale(0.45).next_to(
            axes.c2p(chi_left, 0), DOWN + LEFT, buff=0.08
        )
        lbl_right = MathTex(r"\chi^2_{0.025}=19.0").scale(0.45).next_to(
            axes.c2p(chi_right, 0), DOWN + RIGHT, buff=0.06
        )
        self.play(FadeIn(lbl_left), FadeIn(lbl_right))
        self.wait(0.5)

        # 拒绝域标签
        rej_left_txt = Text("拒绝域", font=CJK, color=RED).scale(0.38)
        rej_left_txt.move_to(axes.c2p(1.2, 0.035))
        rej_right_txt = Text("拒绝域", font=CJK, color=RED).scale(0.38)
        rej_right_txt.move_to(axes.c2p(22.5, 0.018))
        accept_txt = Text("接受域", font=CJK, color=GREEN).scale(0.42)
        accept_txt.move_to(axes.c2p(10.0, 0.065))
        self.play(FadeIn(rej_left_txt), FadeIn(rej_right_txt), FadeIn(accept_txt))
        self.wait(0.5)

        # 观测值 χ²=15 → 接受域
        obs_x = 15.0
        obs_dot = Dot(axes.c2p(obs_x, 0), color=ORANGE, radius=0.1)
        obs_label = MathTex(r"\chi^2_{obs}=15").scale(0.5).next_to(
            axes.c2p(obs_x, 0), UP, buff=0.2
        )
        obs_label.set_color(ORANGE)
        arrow = Arrow(
            axes.c2p(obs_x, chi2_pdf(obs_x) * 0.6),
            axes.c2p(obs_x, 0.005),
            color=ORANGE, buff=0.05, stroke_width=2
        )
        self.play(FadeIn(obs_dot), Write(obs_label), Create(arrow))
        self.wait(0.4)

        result_txt = Text("观测值在接受域，不拒绝 H0", font=CJK, color=GREEN).scale(0.48)
        result_txt.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(result_txt))
        self.wait(1.2)

        # 清场
        act1_group = VGroup(
            title, hyp_text, stat_label, axes, x_label, y_label,
            curve, left_region, right_region, vl_left, vl_right,
            lbl_left, lbl_right, rej_left_txt, rej_right_txt,
            accept_txt, df_label, obs_dot, obs_label, arrow, result_txt
        )
        self.play(FadeOut(act1_group))

    # ── 过渡 ──────────────────────────────────────────────────────────

    def _transition(self):
        sep = Text("── 第二幕：F 检验 ──", font=CJK).scale(0.5)
        self.play(FadeIn(sep))
        self.wait(0.6)
        self.play(FadeOut(sep))

    # ── 幕二 ──────────────────────────────────────────────────────────

    def _act2_f(self):
        # 标题
        title2 = Text("方差检验（二）：F 检验", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title2))
        self.wait(0.3)

        # 假设说明
        hyp2 = Text("H0: σ₁²= σ₂²  vs  H1: σ₁²≠ σ₂²", font=CJK).scale(0.45)
        hyp2.next_to(title2, DOWN, buff=0.2)
        self.play(FadeIn(hyp2))
        self.wait(0.3)

        # 统计量公式
        stat2 = MathTex(
            r"F = \frac{S_1^2}{S_2^2} \sim F(m,\,n)"
        ).scale(0.65)
        stat2.next_to(hyp2, DOWN, buff=0.25)
        self.play(Write(stat2))
        self.wait(0.4)

        # 坐标轴
        axes2 = Axes(
            x_range=[0, 6, 1],
            y_range=[0, 0.85, 0.2],
            x_length=8.5,
            y_length=3.5,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False,
        ).shift(DOWN * 1.5)

        x_label2 = MathTex(r"F").scale(0.6).next_to(axes2.x_axis.get_right(), DOWN, buff=0.15)
        y_label2 = MathTex(r"f(F)").scale(0.55).next_to(axes2.y_axis.get_top(), LEFT, buff=0.1)

        # F(5,8) 密度
        dfn, dfd = 5, 8

        def f_pdf(x):
            if x <= 0:
                return 0.0
            return float(f_dist.pdf(x, dfn, dfd))

        curve2 = axes2.plot(f_pdf, x_range=[0.02, 5.9, 0.05], color=BLUE_D, stroke_width=2.5)

        self.play(Create(axes2), FadeIn(x_label2, y_label2))
        self.play(Create(curve2))

        # F(5,8) 分布说明
        df2_label = Text("F(5,8) 分布  (m=5, n=8)", font=CJK).scale(0.42)
        df2_label.next_to(axes2, UP, buff=0.12).shift(RIGHT * 2)
        self.play(FadeIn(df2_label))
        self.wait(0.4)

        # 右侧单尾临界值（α=0.05）：F_{0.05}(5,8) ≈ 3.69
        f_crit = 3.69

        # 右侧拒绝域
        right_region2 = area_polygon(axes2, f_pdf, f_crit, 5.9, color=RED, opacity=0.5)
        self.play(FadeIn(right_region2))

        # 临界值虚线
        top2 = axes2.c2p(f_crit, f_pdf(f_crit) + 0.02)
        bot2 = axes2.c2p(f_crit, 0)
        vl2 = DashedLine(bot2, top2, color=YELLOW, stroke_width=1.8)
        self.play(Create(vl2))

        lbl_crit = MathTex(r"F_{0.05}(5,8)=3.69").scale(0.46).next_to(
            axes2.c2p(f_crit, 0), DOWN + RIGHT, buff=0.06
        )
        self.play(FadeIn(lbl_crit))
        self.wait(0.4)

        # 区域标签
        rej_txt2 = Text("拒绝域", font=CJK, color=RED).scale(0.40)
        rej_txt2.move_to(axes2.c2p(4.8, 0.12))
        accept_txt2 = Text("接受域", font=CJK, color=GREEN).scale(0.42)
        accept_txt2.move_to(axes2.c2p(1.5, 0.35))
        self.play(FadeIn(rej_txt2), FadeIn(accept_txt2))
        self.wait(0.5)

        # 小结提示
        note = Text("实践中取 F = max(S1²,S2²)/min(S1²,S2²)，只检验右尾", font=CJK).scale(0.40)
        note.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(note))
        self.wait(1.5)

        # 最终全场 FadeOut
        act2_group = VGroup(
            title2, hyp2, stat2, axes2, x_label2, y_label2,
            curve2, df2_label, right_region2, vl2,
            lbl_crit, rej_txt2, accept_txt2, note
        )
        self.play(FadeOut(act2_group))


# ─────────────────────────────────────────────
# 模块顶层注册
# ─────────────────────────────────────────────

REGISTER = [
    {
        "scene": "VarTestScene",
        "id": "ch08-8.3-variance-test",
        "chapterId": "ch08",
        "sectionId": "8.3",
        "title": "方差检验：χ² 检验与 F 检验",
        "description": "通过 χ²(9) 与 F(5,8) 分布密度曲线，直观展示双侧 χ² 检验拒绝域与单侧 F 检验拒绝域的不对称性。",
    },
]
