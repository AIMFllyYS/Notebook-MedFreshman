"""第 2.1 节 · 随机变量的概念 —— 从样本空间 Omega 到实数轴的映射。

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
    Arrow,
    Circle,
    Create,
    CurvedArrow,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    MathTex,
    NumberLine,
    RoundedRectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "RVConceptScene",
        "id": "ch02-2.1-rv-concept",
        "chapterId": "ch02",
        "sectionId": "2.1",
        "title": "随机变量：样本空间到实数轴的映射",
        "description": "用抛硬币与掷骰子两个例子，直观展示随机变量是从样本空间到实数轴的函数映射。",
    },
]


class RVConceptScene(Scene):
    def construct(self):
        # ── 标题 ──────────────────────────────────────────────────────────
        title = (
            Text("随机变量：从样本空间到实数轴的映射", font=CJK, weight=BOLD)
            .scale(0.6)
            .to_edge(UP)
        )
        self.play(Write(title))
        self.wait(0.4)

        # ── 第一幕：核心定义 ──────────────────────────────────────────────
        defn_line1 = Text("随机变量 X 是一个", font=CJK).scale(0.52)
        defn_line2 = Text("定义在样本空间上、取值为实数的函数", font=CJK, color=YELLOW).scale(0.52)
        defn = VGroup(defn_line1, defn_line2).arrange(RIGHT, buff=0.15).shift(UP * 1.5)
        formula = MathTex(r"X : \Omega \to \mathbb{R}").scale(1.0).shift(UP * 0.6)
        self.play(FadeIn(defn, shift=UP * 0.2))
        self.wait(0.3)
        self.play(Write(formula))
        self.wait(1.0)
        self.play(FadeOut(defn), FadeOut(formula))

        # ── 第二幕：抛硬币示例 ────────────────────────────────────────────
        example1_label = (
            Text("例1：抛一枚硬币", font=CJK, weight=BOLD, color=GOLD)
            .scale(0.55)
            .to_edge(UP, buff=0.9)
        )
        self.play(FadeIn(example1_label))

        # 左侧：样本空间 Omega
        omega_box = RoundedRectangle(
            width=3.0, height=2.4, corner_radius=0.3, color=BLUE_D
        ).shift(LEFT * 3.5)
        omega_label = MathTex(r"\Omega").scale(0.9).next_to(
            omega_box.get_corner(UP + LEFT), DOWN + RIGHT, buff=0.15
        )

        h_dot = Dot(color=WHITE).move_to(omega_box.get_center() + UP * 0.5)
        h_text = Text("H（正面）", font=CJK).scale(0.42).next_to(h_dot, RIGHT, buff=0.12)

        t_dot = Dot(color=WHITE).move_to(omega_box.get_center() + DOWN * 0.5)
        t_text = Text("T（反面）", font=CJK).scale(0.42).next_to(t_dot, RIGHT, buff=0.12)

        omega_group = VGroup(omega_box, omega_label, h_dot, h_text, t_dot, t_text)
        self.play(Create(omega_box), FadeIn(omega_label))
        self.play(FadeIn(h_dot), FadeIn(h_text), FadeIn(t_dot), FadeIn(t_text))

        # 右侧：数轴
        number_line = NumberLine(
            x_range=[-0.5, 2.5, 1],
            length=4.0,
            include_numbers=True,
            numbers_to_include=[0, 1, 2],
        ).shift(RIGHT * 2.5)
        r_label = MathTex(r"\mathbb{R}").scale(0.9).next_to(number_line, RIGHT, buff=0.15)
        self.play(Create(number_line), FadeIn(r_label))
        self.wait(0.3)

        # 映射箭头 X(H) = 1
        pt_1 = number_line.number_to_point(1)
        dot_1 = Dot(color=GREEN, radius=0.12).move_to(pt_1)
        arrow_h = CurvedArrow(
            h_dot.get_center(),
            pt_1,
            color=GREEN,
            angle=-0.6,
        )
        xh_label = MathTex(r"X(H)=1", color=GREEN).scale(0.6).next_to(pt_1, UP, buff=0.25)
        self.play(Create(arrow_h))
        self.play(FadeIn(dot_1), Write(xh_label))
        self.wait(0.5)

        # 映射箭头 X(T) = 0
        pt_0 = number_line.number_to_point(0)
        dot_0 = Dot(color=RED, radius=0.12).move_to(pt_0)
        arrow_t = CurvedArrow(
            t_dot.get_center(),
            pt_0,
            color=RED,
            angle=0.6,
        )
        xt_label = MathTex(r"X(T)=0", color=RED).scale(0.6).next_to(pt_0, DOWN, buff=0.25)
        self.play(Create(arrow_t))
        self.play(FadeIn(dot_0), Write(xt_label))
        self.wait(0.5)

        # 小结文字
        summary1 = Text("X 把每个样本点映射到一个实数", font=CJK, color=YELLOW).scale(0.46)
        summary1.next_to(omega_box, DOWN, buff=0.35)
        self.play(FadeIn(summary1))
        self.wait(1.2)

        # 清除第一幕
        group1 = VGroup(
            example1_label,
            omega_group,
            number_line,
            r_label,
            arrow_h,
            dot_1,
            xh_label,
            arrow_t,
            dot_0,
            xt_label,
            summary1,
        )
        self.play(FadeOut(group1))
        self.wait(0.2)

        # ── 第三幕：掷骰子示例（离散型铺垫）────────────────────────────
        example2_label = (
            Text("例2：掷一颗骰子  X = 出现的点数", font=CJK, weight=BOLD, color=GOLD)
            .scale(0.52)
            .to_edge(UP, buff=0.9)
        )
        self.play(FadeIn(example2_label))

        # 样本空间 Omega = {1,2,3,4,5,6}
        omega2_box = RoundedRectangle(
            width=3.2, height=3.6, corner_radius=0.3, color=BLUE_D
        ).shift(LEFT * 3.5 + DOWN * 0.3)
        omega2_label = MathTex(r"\Omega").scale(0.9).next_to(
            omega2_box.get_corner(UP + LEFT), DOWN + RIGHT, buff=0.15
        )
        self.play(Create(omega2_box), FadeIn(omega2_label))

        # 六个样本点
        faces = VGroup()
        face_dots = []
        for i in range(1, 7):
            row = (i - 1) // 3
            col = (i - 1) % 3
            pos = omega2_box.get_center() + LEFT * 0.9 + UP * 1.1 + RIGHT * col * 0.9 + DOWN * row * 0.9
            d = Dot(color=WHITE, radius=0.06).move_to(pos)
            lbl = Text(str(i), font=CJK).scale(0.45).next_to(d, RIGHT, buff=0.08)
            face_dots.append(d)
            faces.add(VGroup(d, lbl))
        self.play(FadeIn(faces, lag_ratio=0.12))

        # 右侧数轴 x = 1..6
        number_line2 = NumberLine(
            x_range=[0, 7, 1],
            length=5.5,
            include_numbers=True,
            numbers_to_include=[1, 2, 3, 4, 5, 6],
        ).shift(RIGHT * 2.0 + DOWN * 0.3)
        r_label2 = MathTex(r"\mathbb{R}").scale(0.9).next_to(number_line2, RIGHT, buff=0.12)
        self.play(Create(number_line2), FadeIn(r_label2))
        self.wait(0.3)

        # 画六条映射箭头，轮流高亮
        colors = [BLUE, GREEN, YELLOW, ORANGE, RED, GOLD]
        highlight_dots = VGroup()
        for i, (d, color) in enumerate(zip(face_dots, colors), start=1):
            pt = number_line2.number_to_point(i)
            arr = Arrow(
                d.get_center(),
                pt,
                buff=0.08,
                color=color,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.18,
            )
            h_dot2 = Dot(color=color, radius=0.11).move_to(pt)
            self.play(Create(arr), FadeIn(h_dot2), run_time=0.35)
            highlight_dots.add(h_dot2)

        self.wait(0.6)

        # 公式 X(omega) = 点数 ∈ {1,2,3,4,5,6}
        note = MathTex(
            r"X(\omega) \in \{1,2,3,4,5,6\}"
        ).scale(0.75).next_to(number_line2, DOWN, buff=0.45)
        self.play(Write(note))
        self.wait(0.8)

        summary2 = Text("这就是离散型随机变量", font=CJK, color=YELLOW).scale(0.5)
        summary2.next_to(note, DOWN, buff=0.25)
        self.play(FadeIn(summary2))
        self.wait(1.4)

        # 清除第二幕
        self.play(
            FadeOut(
                VGroup(
                    example2_label,
                    omega2_box,
                    omega2_label,
                    faces,
                    number_line2,
                    r_label2,
                    highlight_dots,
                    note,
                    summary2,
                )
            )
        )
        self.wait(0.2)

        # ── 第四幕：总结 ──────────────────────────────────────────────────
        conclusion_title = (
            Text("随机变量的本质", font=CJK, weight=BOLD, color=GOLD)
            .scale(0.62)
            .shift(UP * 1.8)
        )
        box_func = MathTex(r"X : \Omega \to \mathbb{R}").scale(1.1).shift(UP * 0.7)
        line1 = Text("  随机性来自试验结果（样本点）的随机性", font=CJK).scale(0.48).shift(UP * 0.0)
        line2 = Text("  X 本身是确定的函数——只是自变量随机", font=CJK).scale(0.48).shift(DOWN * 0.5)

        divider = Line(LEFT * 3.5, RIGHT * 3.5, color=BLUE_D, stroke_width=1.5).shift(UP * 0.35)

        self.play(FadeIn(conclusion_title))
        self.play(Write(box_func))
        self.play(Create(divider))
        self.play(FadeIn(line1), FadeIn(line2))
        self.wait(1.8)

        self.play(
            FadeOut(VGroup(conclusion_title, box_func, divider, line1, line2, title))
        )
        self.wait(0.3)
