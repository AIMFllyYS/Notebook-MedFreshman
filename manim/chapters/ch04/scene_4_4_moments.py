"""第 4.4 节 · 矩与协方差矩阵 —— 展示协方差矩阵 Σ 如何决定椭圆的形状、方向和大小。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。

动画思路：
  1. 展示单位圆（对角协方差矩阵 = I）
  2. 施加对角 Σ（缩放椭圆，主轴与坐标轴对齐）
  3. 施加旋转协方差矩阵（椭圆旋转，主轴 = 特征向量）
  4. 标出特征向量方向与特征值开方 = 半轴长
  5. 对应二维正态等高线族的直觉
"""

import numpy as np
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
    Arrow,
    Create,
    Dot,
    Ellipse,
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"


def make_ellipse_from_cov(sigma, color=BLUE, stroke_width=3, n_levels=1):
    """根据 2x2 协方差矩阵 sigma 返回椭圆 VGroup（可能多层）。

    椭圆半轴 = sqrt(eigenvalue)，旋转角 = 特征向量方向角。
    缩放到 2 倍特征值半径（对应 2-sigma 等高线）。
    """
    eigenvalues, eigenvectors = np.linalg.eigh(sigma)
    # 半轴长 = sqrt(lambda) * 2 (2-sigma 椭圆)
    a = float(np.sqrt(eigenvalues[1])) * 2.0  # major
    b = float(np.sqrt(eigenvalues[0])) * 2.0  # minor
    # 主轴方向角（与 x 轴的夹角），取较大特征值对应的特征向量
    major_vec = eigenvectors[:, 1]
    angle = float(np.arctan2(major_vec[1], major_vec[0]))

    ellipse = Ellipse(
        width=2 * a, height=2 * b, color=color, stroke_width=stroke_width
    ).rotate(angle)
    return ellipse, angle, a, b, eigenvalues, eigenvectors


class MomentsScene(Scene):
    def construct(self):
        # ── 0. 标题 ─────────────────────────────────────────────────────────
        title = Text("协方差矩阵的几何意义", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 坐标系 ────────────────────────────────────────────────────────
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-3.5, 3.5, 1],
            x_length=7,
            y_length=6,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": True},
        ).shift(DOWN * 0.3)
        self.play(Create(axes))

        # ── 2. 单位圆：Σ = I ─────────────────────────────────────────────────
        sub1 = Text("Sigma = I  单位圆", font=CJK).scale(0.48).to_edge(DOWN)
        sigma_label_1 = MathTex(r"\Sigma = \begin{pmatrix}1&0\\0&1\end{pmatrix}").scale(0.65)
        sigma_label_1.to_corner(UP + RIGHT, buff=0.4).shift(DOWN * 0.9)

        unit_circle = Ellipse(width=2 * 2.0, height=2 * 2.0, color=BLUE, stroke_width=3).move_to(
            axes.get_origin()
        )
        caption_i = Text("单位圆  (", font=CJK, color=BLUE).scale(0.48)
        cap_sigma = MathTex(r"\Sigma = I", color=BLUE).scale(0.48)
        cap_right = Text(")", font=CJK, color=BLUE).scale(0.48)
        cap_group = VGroup(caption_i, cap_sigma, cap_right).arrange(RIGHT, buff=0.08)
        cap_group.next_to(unit_circle, UP, buff=0.12)

        self.play(
            FadeIn(sigma_label_1),
            Write(sub1),
        )
        self.play(Create(unit_circle), FadeIn(cap_group))
        self.wait(1.0)

        # ── 3. 对角 Σ = diag(4, 1)：椭圆主轴平行坐标轴 ──────────────────────
        self.play(FadeOut(sub1), FadeOut(cap_group))

        sigma2 = np.array([[4.0, 0.0], [0.0, 1.0]])
        ellipse2, ang2, a2, b2, evals2, evecs2 = make_ellipse_from_cov(sigma2, color=GREEN)
        ellipse2.move_to(axes.get_origin())

        sigma_label_2 = MathTex(r"\Sigma = \begin{pmatrix}4&0\\0&1\end{pmatrix}").scale(0.65)
        sigma_label_2.to_corner(UP + RIGHT, buff=0.4).shift(DOWN * 0.9)

        sub2 = Text("对角矩阵：主轴沿坐标轴方向", font=CJK).scale(0.48).to_edge(DOWN)

        self.play(
            Transform(sigma_label_1, sigma_label_2),
            Transform(unit_circle, ellipse2),
            Write(sub2),
        )
        self.wait(1.2)

        # 标注半轴长 = sqrt(lambda)
        origin = axes.get_origin()
        arrow_x = Arrow(
            start=origin,
            end=origin + RIGHT * a2,
            color=YELLOW,
            buff=0,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.15,
        )
        arrow_y = Arrow(
            start=origin,
            end=origin + UP * b2,
            color=ORANGE,
            buff=0,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.15,
        )
        lbl_x = MathTex(r"\sqrt{\lambda_1}=2", color=YELLOW).scale(0.55)
        lbl_x.next_to(arrow_x, DOWN, buff=0.12)
        lbl_y = MathTex(r"\sqrt{\lambda_2}=1", color=ORANGE).scale(0.55)
        lbl_y.next_to(arrow_y, LEFT, buff=0.12)

        self.play(Create(arrow_x), Create(arrow_y), FadeIn(lbl_x), FadeIn(lbl_y))
        self.wait(1.2)

        # ── 4. 旋转 Σ（含相关项）：椭圆旋转 ──────────────────────────────────
        self.play(
            FadeOut(sub2),
            FadeOut(arrow_x),
            FadeOut(arrow_y),
            FadeOut(lbl_x),
            FadeOut(lbl_y),
        )

        sigma3 = np.array([[3.0, 2.0], [2.0, 2.0]])
        ellipse3, ang3, a3, b3, evals3, evecs3 = make_ellipse_from_cov(sigma3, color=RED)
        ellipse3.move_to(axes.get_origin())

        sigma_label_3 = MathTex(
            r"\Sigma = \begin{pmatrix}3&2\\2&2\end{pmatrix}"
        ).scale(0.65)
        sigma_label_3.to_corner(UP + RIGHT, buff=0.4).shift(DOWN * 0.9)

        sub3 = Text("含相关项：椭圆旋转，主轴 = 特征向量", font=CJK).scale(0.48).to_edge(DOWN)

        self.play(
            Transform(sigma_label_1, sigma_label_3),
            Transform(unit_circle, ellipse3),
            Write(sub3),
        )
        self.wait(1.0)

        # 画特征向量方向箭头
        o = axes.get_origin()
        ev1 = evecs3[:, 1]  # 主特征向量（较大特征值）
        ev0 = evecs3[:, 0]  # 次特征向量

        arrow_ev1 = Arrow(
            start=o,
            end=o + RIGHT * float(ev1[0]) * a3 + UP * float(ev1[1]) * a3,
            color=GOLD,
            buff=0,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.12,
        )
        arrow_ev0 = Arrow(
            start=o,
            end=o + RIGHT * float(ev0[0]) * b3 + UP * float(ev0[1]) * b3,
            color=ORANGE,
            buff=0,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.12,
        )
        lbl_ev1 = MathTex(r"\mathbf{v}_1", color=GOLD).scale(0.6)
        lbl_ev1.next_to(arrow_ev1.get_end(), UP + RIGHT, buff=0.1)
        lbl_ev0 = MathTex(r"\mathbf{v}_2", color=ORANGE).scale(0.6)
        lbl_ev0.next_to(arrow_ev0.get_end(), DOWN + LEFT, buff=0.1)

        self.play(
            Create(arrow_ev1),
            Create(arrow_ev0),
            FadeIn(lbl_ev1),
            FadeIn(lbl_ev0),
        )
        self.wait(1.2)

        # ── 5. 特征分解公式 ──────────────────────────────────────────────────
        self.play(FadeOut(sub3))

        formula = MathTex(
            r"\Sigma \mathbf{v}_i = \lambda_i \mathbf{v}_i"
        ).scale(0.75)
        formula.to_edge(DOWN, buff=0.45)
        self.play(Write(formula))
        self.wait(0.8)

        key_msg = Text("主轴方向 = 特征向量  |  半轴长 = 特征值开方", font=CJK).scale(0.44)
        key_msg.next_to(formula, UP, buff=0.18)
        self.play(FadeIn(key_msg))
        self.wait(1.5)

        # ── 6. 等高线族直觉：马氏距离椭圆 ───────────────────────────────────
        self.play(
            FadeOut(key_msg),
            FadeOut(formula),
            FadeOut(arrow_ev1),
            FadeOut(arrow_ev0),
            FadeOut(lbl_ev1),
            FadeOut(lbl_ev0),
        )

        contour_sub = Text("二维正态分布的等高线 = 椭圆族", font=CJK).scale(0.48).to_edge(DOWN)
        self.play(Write(contour_sub))

        # 画多层等高线椭圆（不同 c 值的 x^T Σ^{-1} x = c^2）
        colors_levels = [BLUE_D, GREEN, YELLOW, RED]
        level_scales = [0.5, 1.0, 1.5, 2.0]
        contour_ellipses = VGroup()
        for scale, col in zip(level_scales, colors_levels):
            sigma_scaled = sigma3 * (scale ** 2)
            ell, ang_s, a_s, b_s, _, _ = make_ellipse_from_cov(sigma_scaled, color=col, stroke_width=2)
            ell.move_to(axes.get_origin())
            contour_ellipses.add(ell)

        contour_center = Dot(axes.get_origin(), color=WHITE, radius=0.07)
        mahal_formula = MathTex(
            r"(\mathbf{x}-\boldsymbol{\mu})^\top \Sigma^{-1} (\mathbf{x}-\boldsymbol{\mu}) = c^2"
        ).scale(0.58)
        mahal_formula.to_corner(UP + RIGHT, buff=0.4).shift(DOWN * 1.8)

        self.play(
            Create(contour_ellipses, lag_ratio=0.25),
            FadeIn(contour_center),
            FadeOut(sigma_label_1),
            Write(mahal_formula),
        )
        self.wait(1.8)

        # ── 7. 总结 ──────────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(contour_sub, mahal_formula)))

        summary_1 = Text("协方差矩阵 Sigma 完全决定椭圆形状", font=CJK).scale(0.47)
        summary_2 = Text("特征向量 = 主轴方向  |  特征值 = 半轴长的平方", font=CJK).scale(0.47)
        summary = VGroup(summary_1, summary_2).arrange(DOWN, buff=0.22).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(summary))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            title, axes, unit_circle, contour_ellipses, contour_center, summary
        )))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "MomentsScene",
        "id": "ch04-4.4-moments",
        "chapterId": "ch04",
        "sectionId": "4.4",
        "title": "矩与协方差矩阵的几何意义",
        "description": "动画演示协方差矩阵 Sigma 如何通过特征向量（主轴方向）和特征值（半轴长的平方）决定二维正态分布等高线椭圆的形状、方向与大小。",
    },
]
