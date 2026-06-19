import numpy as np
from manim import *


class AromaticityScene(Scene):
    def construct(self):
        # ---- 标题 ----
        title = Text("苯的离域与芳香性", font="Microsoft YaHei", font_size=36)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(0.5)

        # ---- 苯环骨架（正六边形）----
        hexagon = RegularPolygon(n=6, start_angle=PI / 6, radius=1.8, color=WHITE)
        hexagon.set_stroke(width=4)
        hexagon.move_to(LEFT * 2.0 + DOWN * 0.3)

        self.play(Create(hexagon))
        self.wait(0.3)

        # 顶点坐标（用于放置内部双键短线）
        verts = hexagon.get_vertices()  # 6 个顶点，按角度排列

        def inner_double_bond(p_start, p_end, center, shrink=0.78, offset=0.16):
            """在两顶点连线内侧画一条短双键线。"""
            mid = (p_start + p_end) / 2.0
            # 缩短端点
            a = mid + (p_start - mid) * shrink
            b = mid + (p_end - mid) * shrink
            # 向中心方向偏移
            direction = center - mid
            direction = direction / np.linalg.norm(direction)
            a2 = a + direction * offset
            b2 = b + direction * offset
            return Line(a2, b2, color=BLUE_C, stroke_width=4)

        center = hexagon.get_center()

        # 凯库勒式 A：双键在 边(0-1)、边(2-3)、边(4-5)
        kekule_a = VGroup(
            inner_double_bond(verts[0], verts[1], center),
            inner_double_bond(verts[2], verts[3], center),
            inner_double_bond(verts[4], verts[5], center),
        )
        # 凯库勒式 B：双键在 边(1-2)、边(3-4)、边(5-0)
        kekule_b = VGroup(
            inner_double_bond(verts[1], verts[2], center),
            inner_double_bond(verts[3], verts[4], center),
            inner_double_bond(verts[5], verts[0], center),
        )

        label_kekule = Text("凯库勒式（共振）", font="Microsoft YaHei", font_size=26)
        label_kekule.next_to(hexagon, DOWN, buff=0.4)

        self.play(Create(kekule_a), FadeIn(label_kekule))
        self.wait(0.8)

        # ---- 共振双向箭头（在六边形右侧）----
        reso_arrow = DoubleArrow(
            start=LEFT * 0.45, end=RIGHT * 0.45, color=YELLOW, buff=0.0,
            stroke_width=5, tip_length=0.22,
        )
        reso_arrow.move_to(hexagon.get_center() + RIGHT * 2.5)
        reso_label = Text("共振", font="Microsoft YaHei", font_size=26)
        reso_label.next_to(reso_arrow, UP, buff=0.2)

        self.play(Create(reso_arrow), FadeIn(reso_label))
        self.wait(0.3)

        # ---- 在两个凯库勒共振式之间来回 Transform ----
        moving_bonds = kekule_a.copy()
        self.add(moving_bonds)
        self.remove(kekule_a)

        self.play(Transform(moving_bonds, kekule_b), run_time=1.2)
        self.wait(0.5)
        self.play(Transform(moving_bonds, kekule_a), run_time=1.2)
        self.wait(0.5)
        self.play(Transform(moving_bonds, kekule_b), run_time=1.2)
        self.wait(0.6)

        # ---- 过渡到大 π 离域表示（中心画圆）----
        deloc_circle = Circle(radius=1.05, color=RED_C, stroke_width=5)
        deloc_circle.move_to(center)

        self.play(
            Transform(moving_bonds, deloc_circle),
            FadeOut(reso_arrow),
            FadeOut(reso_label),
            run_time=1.4,
        )
        new_label = Text("大 π 离域", font="Microsoft YaHei", font_size=26)
        new_label.move_to(label_kekule.get_center())
        self.play(Transform(label_kekule, new_label))
        self.wait(0.6)

        # ---- 右侧文字说明 ----
        aroma = Text("芳香性", font="Microsoft YaHei", font_size=30, color=YELLOW)
        huckel = MathTex(r"4n+2", color=WHITE).scale(1.0)
        huckel_txt = Text("休克尔规则", font="Microsoft YaHei", font_size=26)
        pi_count = MathTex(r"6\pi", color=BLUE_C).scale(1.0)
        pi_txt = Text("个 π 电子离域", font="Microsoft YaHei", font_size=26)
        prop = Text("易取代难加成", font="Microsoft YaHei", font_size=26, color=GREEN_C)

        huckel_line = VGroup(huckel_txt, huckel).arrange(RIGHT, buff=0.25)
        pi_line = VGroup(pi_count, pi_txt).arrange(RIGHT, buff=0.25)

        info = VGroup(aroma, huckel_line, pi_line, prop)
        info.arrange(DOWN, aligned_edge=LEFT, buff=0.45)
        info.move_to(RIGHT * 3.2)

        self.play(FadeIn(aroma, shift=RIGHT * 0.2))
        self.wait(0.4)
        self.play(FadeIn(huckel_line, shift=RIGHT * 0.2))
        self.wait(0.4)
        self.play(FadeIn(pi_line, shift=RIGHT * 0.2))
        self.wait(0.4)
        self.play(FadeIn(prop, shift=RIGHT * 0.2))
        self.wait(1.2)


REGISTER = [{
    "scene": "AromaticityScene", "id": "ch08-8.1-aromaticity",
    "chapterId": "ch08", "sectionId": "8.1",
    "title": "苯的离域与芳香性",
    "description": "苯的凯库勒共振与大π离域，体现 4n+2 芳香性。",
}]
