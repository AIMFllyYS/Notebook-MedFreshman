import numpy as np
from manim import *


class MethaneSp3Scene(Scene):
    def construct(self):
        # ---- Title ----
        title = Text("甲烷的 sp3 杂化与正四面体",
                     font="Microsoft YaHei", font_size=34)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)

        # ---- Geometry (2D projection of a tetrahedron) ----
        # Central carbon at origin (shifted down a bit for layout)
        center = np.array([0.0, -0.3, 0.0])

        # Four hydrogen directions arranged so the visible angles read ~109.5 deg.
        # Two "front" bonds point down (left/right), two "back" bonds point up.
        bond_len = 2.2
        dirs = {
            "up_left":   np.array([-0.5,  0.866, 0.0]),
            "up_right":  np.array([ 0.5,  0.866, 0.0]),
            "down_left": np.array([-0.866, -0.5, 0.0]),
            "down_right":np.array([ 0.866, -0.5, 0.0]),
        }
        h_pos = {k: center + bond_len * v for k, v in dirs.items()}

        # ---- Central carbon ----
        c_dot = Dot(point=center, radius=0.18, color=YELLOW)
        c_label = Text("C", font="Microsoft YaHei", font_size=28, color=YELLOW)
        c_label.next_to(c_dot, DOWN, buff=0.12)
        self.play(FadeIn(c_dot, scale=0.5), Write(c_label))
        self.wait(0.4)

        # ---- Bonds + hydrogens appear one by one ----
        bonds = VGroup()
        h_dots = VGroup()
        h_labels = VGroup()
        order = ["up_left", "up_right", "down_left", "down_right"]
        for key in order:
            p = h_pos[key]
            bond = Line(center, p, color=WHITE, stroke_width=5)
            hdot = Dot(point=p, radius=0.14, color=BLUE)
            hlabel = Text("H", font="Microsoft YaHei", font_size=24, color=BLUE)
            # place label just outside each H
            hlabel.next_to(hdot, dirs[key][:2].tolist() + [0.0], buff=0.08)
            self.play(
                Create(bond),
                FadeIn(hdot, scale=0.5),
                Write(hlabel),
                run_time=0.8,
            )
            bonds.add(bond)
            h_dots.add(hdot)
            h_labels.add(hlabel)
        self.wait(0.5)

        # ---- sp3 hybridization caption ----
        sp3 = Text("sp3 杂化", font="Microsoft YaHei", font_size=28, color=GREEN)
        sp3.to_corner(UL).shift(DOWN * 1.1)
        self.play(Write(sp3))
        self.wait(0.4)

        tetra = Text("正四面体", font="Microsoft YaHei", font_size=28, color=ORANGE)
        tetra.next_to(sp3, DOWN, aligned_edge=LEFT, buff=0.4)
        self.play(Write(tetra))
        self.wait(0.4)

        # ---- Bond angle arc between two bonds (up_left & up_right) ----
        angle = Angle(bonds[0], bonds[1], radius=0.9, color=RED)
        angle_label = MathTex(r"109.5^\circ", color=RED, font_size=36)
        angle_label.next_to(angle, UP, buff=0.12)
        self.play(Create(angle), Write(angle_label))
        self.wait(0.5)

        # ---- Bottom caption restating the angle in Chinese ----
        angle_text = Text("键角 109.5 度", font="Microsoft YaHei",
                          font_size=28, color=RED)
        angle_text.to_edge(DOWN)
        self.play(Write(angle_text))
        self.wait(0.6)

        # ---- Show a second angle to emphasize symmetry ----
        angle2 = Angle(bonds[2], bonds[3], radius=0.9, color=RED)
        self.play(Create(angle2))
        self.wait(0.6)

        # ---- Gentle emphasis: highlight the whole molecule ----
        molecule = VGroup(c_dot, bonds, h_dots)
        self.play(Indicate(molecule, scale_factor=1.08, color=TEAL))
        self.wait(1.0)


REGISTER = [{
    "scene": "MethaneSp3Scene", "id": "ch01-1.2-hybridization",
    "chapterId": "ch01", "sectionId": "1.2",
    "title": "甲烷的 sp³ 杂化与正四面体",
    "description": "构建甲烷正四面体结构，标注 109.5° 键角与 sp³ 杂化。",
}]
