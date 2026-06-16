"""第 1.1 节 · 样本空间与事件 —— 用掷骰子直观展示 Ω 与事件 A。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE_D,
    BOLD,
    DOWN,
    GREEN,
    LEFT,
    RIGHT,
    UP,
    YELLOW,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    MathTex,
    RoundedRectangle,
    Scene,
    Text,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"


class SampleSpaceScene(Scene):
    def construct(self):
        title = Text("样本空间与事件", font=CJK, weight=BOLD).scale(0.7).to_edge(UP)
        self.play(Write(title))

        omega = RoundedRectangle(width=8.0, height=4.2, corner_radius=0.35, color=BLUE_D)
        omega.shift(DOWN * 0.4)
        omega_label = MathTex(r"\Omega").scale(1.0)
        omega_label.next_to(omega.get_corner(UP + LEFT), DOWN + RIGHT, buff=0.2)
        self.play(Create(omega), FadeIn(omega_label))

        # 六个样本点（骰子点数）
        faces = VGroup()
        positions = [
            omega.get_center() + LEFT * 2.6 + UP * 0.7,
            omega.get_center() + UP * 0.7,
            omega.get_center() + RIGHT * 2.6 + UP * 0.7,
            omega.get_center() + LEFT * 2.6 + DOWN * 0.7,
            omega.get_center() + DOWN * 0.7,
            omega.get_center() + RIGHT * 2.6 + DOWN * 0.7,
        ]
        for i, pos in enumerate(positions, start=1):
            dot = Circle(radius=0.42, color=BLUE_D).set_fill(BLUE_D, opacity=0.12).move_to(pos)
            num = Text(str(i), font=CJK).scale(0.6).move_to(pos)
            faces.add(VGroup(dot, num))
        self.play(FadeIn(faces, lag_ratio=0.15))

        caption = Text("掷一颗骰子：Ω = {1,2,3,4,5,6}", font=CJK).scale(0.5)
        caption.next_to(omega, DOWN, buff=0.35)
        self.play(Write(caption))
        self.wait(0.6)

        # 事件 A = 出现偶数 = {2,4,6}
        even_idx = [1, 3, 5]  # 0-based -> faces 2,4,6
        rings = VGroup(*[
            Circle(radius=0.52, color=YELLOW, stroke_width=5).move_to(positions[i])
            for i in even_idx
        ])
        a_label = Text("事件 A = 出现偶数 = {2,4,6}", font=CJK, color=GREEN).scale(0.5)
        a_label.next_to(caption, DOWN, buff=0.25)
        self.play(Create(rings), Write(a_label))
        self.wait(1.2)

        self.play(FadeOut(VGroup(rings, a_label, caption)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "SampleSpaceScene",
        "id": "ch01-1.1-sample-space",
        "chapterId": "ch01",
        "sectionId": "1.1",
        "title": "样本空间与事件",
        "description": "用掷骰子直观展示样本空间 Ω 与事件 A = 出现偶数。",
    },
]
