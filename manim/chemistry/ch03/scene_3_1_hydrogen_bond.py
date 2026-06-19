import numpy as np
from manim import *


class HydrogenBondScene(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = Text("氢键的形成与方向性", font="Microsoft YaHei", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)

        # ============================================================
        # 构建第一个水分子（左侧，作为氢键供体 O-H 指向右）
        # ============================================================
        # 氧原子（大圆）
        o1 = Circle(radius=0.55, color=RED, fill_opacity=0.9)
        o1.set_fill(RED)
        o1.move_to(np.array([-3.6, -0.3, 0]))
        o1_label = MathTex(r"O", font_size=34, color=WHITE).move_to(o1.get_center())

        # 两个氢原子（小圆）
        h1a = Circle(radius=0.28, color=BLUE_B, fill_opacity=0.9)
        h1a.set_fill(BLUE_B)
        h1a.move_to(o1.get_center() + np.array([1.05, 0.55, 0]))
        h1a_label = MathTex(r"H", font_size=24, color=WHITE).move_to(h1a.get_center())

        h1b = Circle(radius=0.28, color=BLUE_B, fill_opacity=0.9)
        h1b.set_fill(BLUE_B)
        h1b.move_to(o1.get_center() + np.array([-0.55, -0.95, 0]))
        h1b_label = MathTex(r"H", font_size=24, color=WHITE).move_to(h1b.get_center())

        # O-H 共价键（实线）
        bond1a = Line(o1.get_center(), h1a.get_center(), color=GREY_B, stroke_width=5)
        bond1b = Line(o1.get_center(), h1b.get_center(), color=GREY_B, stroke_width=5)

        water1 = VGroup(
            bond1a, bond1b, o1, h1a, h1b,
            o1_label, h1a_label, h1b_label,
        )

        # ============================================================
        # 构建第二个水分子（右侧，作为氢键受体，O 指向左侧的 H）
        # ============================================================
        o2 = Circle(radius=0.55, color=RED, fill_opacity=0.9)
        o2.set_fill(RED)
        o2.move_to(np.array([3.6, -0.3, 0]))
        o2_label = MathTex(r"O", font_size=34, color=WHITE).move_to(o2.get_center())

        h2a = Circle(radius=0.28, color=BLUE_B, fill_opacity=0.9)
        h2a.set_fill(BLUE_B)
        h2a.move_to(o2.get_center() + np.array([0.85, 0.85, 0]))
        h2a_label = MathTex(r"H", font_size=24, color=WHITE).move_to(h2a.get_center())

        h2b = Circle(radius=0.28, color=BLUE_B, fill_opacity=0.9)
        h2b.set_fill(BLUE_B)
        h2b.move_to(o2.get_center() + np.array([0.95, -0.55, 0]))
        h2b_label = MathTex(r"H", font_size=24, color=WHITE).move_to(h2b.get_center())

        bond2a = Line(o2.get_center(), h2a.get_center(), color=GREY_B, stroke_width=5)
        bond2b = Line(o2.get_center(), h2b.get_center(), color=GREY_B, stroke_width=5)

        water2 = VGroup(
            bond2a, bond2b, o2, h2a, h2b,
            o2_label, h2a_label, h2b_label,
        )

        # ---------- 标签：两个 H2O 化学式 ----------
        formula1 = MathTex(r"H_2O", font_size=30, color=YELLOW)
        formula1.next_to(water1, DOWN, buff=0.35)
        formula2 = MathTex(r"H_2O", font_size=30, color=YELLOW)
        formula2.next_to(water2, DOWN, buff=0.35)

        # ---------- 出现两个水分子 ----------
        self.play(
            Create(water1),
            Create(water2),
            run_time=2.0,
        )
        self.play(
            Write(formula1),
            Write(formula2),
            run_time=1.0,
        )
        self.wait(0.8)

        # ============================================================
        # 两个水分子靠近（向中心移动）
        # ============================================================
        shift_in = np.array([1.1, 0, 0])
        group1_movable = VGroup(water1, formula1)
        group2_movable = VGroup(water2, formula2)
        self.play(
            group1_movable.animate.shift(shift_in),
            group2_movable.animate.shift(-shift_in),
            run_time=2.0,
        )
        self.wait(0.5)

        # ============================================================
        # 氢键出现（O···H 虚线）
        # 供体的 h1a（右上 H）  ···  受体的 o2（O）
        # ============================================================
        start_pt = h1a.get_center() + shift_in
        end_pt = o2.get_center() - shift_in
        # 计算单位方向，使虚线落在两个原子球的表面之间（避免重叠、避免空线）
        direction = end_pt - start_pt
        dist = np.linalg.norm(direction)
        unit = direction / dist
        h_bond_start = start_pt + unit * 0.30
        h_bond_end = end_pt - unit * 0.58

        h_bond = DashedLine(
            h_bond_start, h_bond_end,
            color=GREEN, stroke_width=4,
            dash_length=0.18,
        )

        h_bond_label = Text(
            "氢键 O-H···O", font="Microsoft YaHei", font_size=26, color=GREEN
        )
        h_bond_label.next_to(h_bond, UP, buff=0.45)

        self.play(Create(h_bond), run_time=1.5)
        self.play(Write(h_bond_label), run_time=1.0)
        self.wait(0.6)

        # ============================================================
        # 标注电荷 δ-（O 上）、δ+（H 上）
        # ============================================================
        delta_o1 = MathTex(r"\delta^-", font_size=30, color=ORANGE)
        delta_o1.next_to(o1, LEFT, buff=0.15).shift(shift_in)

        delta_o2 = MathTex(r"\delta^-", font_size=30, color=ORANGE)
        delta_o2.next_to(o2, RIGHT, buff=0.15).shift(-shift_in)

        delta_h1 = MathTex(r"\delta^+", font_size=28, color=TEAL)
        delta_h1.next_to(h1a, UP, buff=0.10).shift(shift_in)

        delta_h2 = MathTex(r"\delta^+", font_size=28, color=TEAL)
        delta_h2.next_to(h2a, UP, buff=0.10).shift(-shift_in)

        self.play(
            FadeIn(delta_o1),
            FadeIn(delta_o2),
            FadeIn(delta_h1),
            FadeIn(delta_h2),
            run_time=1.5,
        )
        self.wait(0.8)

        # ============================================================
        # 文字说明：方向性、键能、强度
        # ============================================================
        note1 = Text(
            "方向性：H 指向 O 的孤对电子方向",
            font="Microsoft YaHei", font_size=24, color=WHITE,
        )
        note2 = Text(
            "键能约 20-30 kJ/mol，比共价键弱",
            font="Microsoft YaHei", font_size=24, color=WHITE,
        )
        notes = VGroup(note1, note2).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        notes.to_edge(DOWN, buff=0.45)

        self.play(FadeIn(note1), run_time=1.0)
        self.wait(0.4)
        self.play(FadeIn(note2), run_time=1.0)
        self.wait(2.0)


REGISTER = [{
    "scene": "HydrogenBondScene", "id": "ch03-3.1-hydrogen-bond",
    "chapterId": "ch03", "sectionId": "3.1",
    "title": "氢键的形成与方向性",
    "description": "两个水分子间形成 O-H···O 氢键，标注偶极与方向性。",
}]
