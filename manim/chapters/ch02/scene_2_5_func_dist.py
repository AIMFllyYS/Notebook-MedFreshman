"""第 2.5 节 · 随机变量函数的分布 —— X~N(0,1)，Y=X² 推导 chi²(1) 分布。

教学思路：
  左侧展示标准正态 PDF；
  中间说明 Y=X^2 变换；
  用分布函数法 F_Y(y)=P(-sqrt(y)<=X<=sqrt(y)) 推导；
  微分得 f_Y(y)=(1/2*sqrt(y))*phi(sqrt(y)) + (1/2*sqrt(y))*phi(sqrt(y))；
  右侧画出 chi^2(1) 形状，与左侧正态对比。

中文文字用 Text（Microsoft YaHei）；数学公式用 MathTex（不含中文）。
"""

import math

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    TEAL,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Create,
    FadeIn,
    FadeOut,
    FunctionGraph,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"


class FuncDistScene(Scene):
    def construct(self):
        # ── 标题 ──────────────────────────────────────────────────────────────
        title = Text("随机变量函数的分布", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        subtitle = (
            Text("X ~ N(0,1)，令 Y = X²，求 Y 的分布", font=CJK)
            .scale(0.42)
            .next_to(title, DOWN, buff=0.15)
        )
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(subtitle), run_time=0.6)
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════════
        # 第一幕：左侧画标准正态 PDF
        # ══════════════════════════════════════════════════════════════════════
        act1_label = Text("标准正态密度函数", font=CJK, color=BLUE_D).scale(0.45)
        act1_label.to_edge(LEFT, buff=0.35).shift(UP * 1.2)
        self.play(FadeIn(act1_label))

        ax_normal = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 0.45, 0.1],
            x_length=5.0,
            y_length=2.8,
            axis_config={"include_tip": True, "color": WHITE},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        ).shift(LEFT * 3.0 + DOWN * 0.5)

        x_label_n = MathTex(r"x").scale(0.5).next_to(ax_normal.x_axis.get_right(), RIGHT, buff=0.1)
        y_label_n = MathTex(r"f_X(x)").scale(0.45).next_to(ax_normal.y_axis.get_top(), UP, buff=0.05)

        def phi(x):
            return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)

        normal_curve = ax_normal.plot(phi, x_range=[-3.4, 3.4], color=BLUE, stroke_width=2.5)
        normal_formula = MathTex(
            r"f_X(x)=\frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}}"
        ).scale(0.42).next_to(ax_normal, DOWN, buff=0.18)

        self.play(Create(ax_normal), FadeIn(x_label_n), FadeIn(y_label_n), run_time=0.9)
        self.play(Create(normal_curve), run_time=1.0)
        self.play(FadeIn(normal_formula), run_time=0.6)
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════════
        # 第二幕：中间说明变换 Y = X² 及分布函数法
        # ══════════════════════════════════════════════════════════════════════
        transform_label = Text("分布函数法推导", font=CJK, color=GOLD).scale(0.45)
        transform_label.move_to(UP * 2.5)
        self.play(FadeIn(transform_label))

        step1 = MathTex(r"F_Y(y) = P(Y \le y) = P(X^2 \le y)").scale(0.46)
        step1.move_to(UP * 1.6)
        self.play(Write(step1), run_time=0.9)
        self.wait(0.3)

        cond_label = Text("（y > 0，对称利用正态分布）", font=CJK).scale(0.38)
        cond_label.next_to(step1, DOWN, buff=0.2)
        self.play(FadeIn(cond_label))

        step2 = MathTex(
            r"= P(-\sqrt{y} \le X \le \sqrt{y})"
        ).scale(0.46).next_to(cond_label, DOWN, buff=0.2)
        self.play(Write(step2), run_time=0.8)
        self.wait(0.3)

        step3 = MathTex(
            r"= 2\Phi(\sqrt{y}) - 1, \quad y > 0"
        ).scale(0.46).next_to(step2, DOWN, buff=0.2)
        self.play(Write(step3), run_time=0.8)
        self.wait(0.4)

        diff_label = Text("对 y 微分得密度函数：", font=CJK, color=YELLOW).scale(0.42)
        diff_label.next_to(step3, DOWN, buff=0.28)
        self.play(FadeIn(diff_label))

        step4 = MathTex(
            r"f_Y(y) = \frac{1}{\sqrt{2\pi y}}\,e^{-\frac{y}{2}}, \quad y > 0"
        ).scale(0.46).next_to(diff_label, DOWN, buff=0.2)
        self.play(Write(step4), run_time=0.9)
        self.wait(0.5)

        # 高亮结论公式
        box = step4.copy().set_color(ORANGE)
        self.play(Transform(step4, box), run_time=0.5)
        self.wait(0.4)
        self.play(Transform(step4, step4.copy().set_color(YELLOW)), run_time=0.4)

        self.wait(0.6)

        # 淡出推导中间步骤，为下一幕腾空间
        mid_group = VGroup(transform_label, step1, cond_label, step2, step3, diff_label)
        self.play(FadeOut(mid_group), run_time=0.7)

        # ══════════════════════════════════════════════════════════════════════
        # 第三幕：右侧画 chi²(1) PDF 与左侧对比
        # ══════════════════════════════════════════════════════════════════════
        act3_label = Text("卡方分布  chi-squared(1) 密度", font=CJK, color=GREEN_D).scale(0.43)
        act3_label.to_edge(RIGHT, buff=0.3).shift(UP * 1.2)
        self.play(FadeIn(act3_label))

        ax_chi2 = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.0, 0.2],
            x_length=4.4,
            y_length=2.8,
            axis_config={"include_tip": True, "color": WHITE},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        ).shift(RIGHT * 3.1 + DOWN * 0.5)

        x_label_c = MathTex(r"y").scale(0.5).next_to(ax_chi2.x_axis.get_right(), RIGHT, buff=0.1)
        y_label_c = MathTex(r"f_Y(y)").scale(0.45).next_to(ax_chi2.y_axis.get_top(), UP, buff=0.05)

        def chi2_pdf(y):
            if y <= 0.01:
                return 0.0
            return math.exp(-y / 2) / math.sqrt(2 * math.pi * y)

        chi2_curve = ax_chi2.plot(
            chi2_pdf, x_range=[0.05, 4.9], color=GREEN, stroke_width=2.5
        )

        chi2_formula = MathTex(
            r"f_Y(y)=\frac{1}{\sqrt{2\pi y}}e^{-\frac{y}{2}}"
        ).scale(0.42).next_to(ax_chi2, DOWN, buff=0.18)

        self.play(Create(ax_chi2), FadeIn(x_label_c), FadeIn(y_label_c), run_time=0.9)
        self.play(Create(chi2_curve), run_time=1.0)
        self.play(FadeIn(chi2_formula), run_time=0.6)
        self.wait(0.4)

        # 强调"折叠"直觉
        fold_label = Text("正态曲线关于 0 对称折叠 → Y=X² 只保留正半轴", font=CJK, color=TEAL).scale(0.38)
        fold_label.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(fold_label), run_time=0.7)
        self.wait(0.5)

        # 高亮 chi²(1) 曲线
        chi2_hl = ax_chi2.plot(chi2_pdf, x_range=[0.05, 4.9], color=ORANGE, stroke_width=3.5)
        self.play(Transform(chi2_curve, chi2_hl), run_time=0.6)
        self.wait(0.4)
        self.play(Transform(chi2_curve, ax_chi2.plot(chi2_pdf, x_range=[0.05, 4.9], color=GREEN, stroke_width=2.5)), run_time=0.5)

        # ══════════════════════════════════════════════════════════════════════
        # 第四幕：小结
        # ══════════════════════════════════════════════════════════════════════
        self.wait(0.3)
        summary_title = Text("小结", font=CJK, weight=BOLD, color=YELLOW).scale(0.5)
        summary_title.to_edge(UP, buff=0.15)

        # 先淡出其他元素
        fade_group = VGroup(
            act1_label, ax_normal, normal_curve, normal_formula, x_label_n, y_label_n,
            act3_label, ax_chi2, chi2_curve, chi2_formula, x_label_c, y_label_c,
            step4, fold_label, title, subtitle,
        )
        self.play(FadeOut(fade_group), run_time=1.0)
        self.play(Write(summary_title), run_time=0.6)

        key1 = MathTex(r"X \sim N(0,1),\ Y=X^2").scale(0.52).shift(UP * 1.3)
        key2 = MathTex(
            r"F_Y(y) = 2\Phi(\sqrt{y})-1 \Rightarrow f_Y(y)=\frac{1}{\sqrt{2\pi y}}e^{-\frac{y}{2}}"
        ).scale(0.46).next_to(key1, DOWN, buff=0.35)
        key3_label = Text("Y 服从自由度为 1 的卡方分布", font=CJK, color=GREEN).scale(0.46)
        key3_label.next_to(key2, DOWN, buff=0.32)
        key3_formula = MathTex(r"Y \sim \chi^2(1)").scale(0.52).next_to(key3_label, DOWN, buff=0.2)

        self.play(FadeIn(key1), run_time=0.5)
        self.play(Write(key2), run_time=0.9)
        self.play(FadeIn(key3_label), run_time=0.5)
        self.play(Write(key3_formula), run_time=0.6)

        # 最终高亮
        self.play(key3_formula.animate.set_color(ORANGE), run_time=0.5)
        self.wait(1.5)

        self.play(
            FadeOut(VGroup(summary_title, key1, key2, key3_label, key3_formula)),
            run_time=0.8,
        )
        self.wait(0.3)


REGISTER = [
    {
        "scene": "FuncDistScene",
        "id": "ch02-2.5-func-dist",
        "chapterId": "ch02",
        "sectionId": "2.5",
        "title": "随机变量函数的分布",
        "description": "用分布函数法推导 Y=X^2 (X~N(0,1)) 的密度，展示正态曲线折叠成 chi^2(1) 的过程。",
    },
]
