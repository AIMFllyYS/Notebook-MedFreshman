import numpy as np
from manim import *


class SN2Scene(Scene):
    def construct(self):
        # ---------- 颜色 ----------
        c_color = YELLOW
        sub_color = BLUE_B
        x_color = RED
        nu_color = GREEN

        # ---------- 标题 ----------
        title = Text("SN2 背面进攻与构型翻转", font="Microsoft YaHei", font_size=32)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.4)

        # ---------- 中心碳 ----------
        center = DOWN * 0.3
        carbon = Dot(center, radius=0.16, color=c_color)
        carbon_label = MathTex(r"C", color=c_color, font_size=34)
        carbon_label.next_to(carbon, UP, buff=0.12)

        # ---------- 三个取代基（初始偏向右侧，伞形）----------
        sub_dirs_right = [
            np.array([1.3, 1.0, 0.0]),
            np.array([1.6, 0.0, 0.0]),
            np.array([1.3, -1.0, 0.0]),
        ]
        sub_bonds = VGroup()
        sub_dots = VGroup()
        sub_labels = VGroup()
        for i, d in enumerate(sub_dirs_right):
            end = center + d
            bond = Line(center, end, color=sub_color, stroke_width=5)
            dot = Dot(end, radius=0.11, color=sub_color)
            lbl = MathTex(r"R_%d" % (i + 1), color=sub_color, font_size=26)
            lbl.next_to(dot, RIGHT, buff=0.1)
            sub_bonds.add(bond)
            sub_dots.add(dot)
            sub_labels.add(lbl)

        # ---------- 离去基 X（右侧，与进攻轴共线）----------
        x_end = center + np.array([2.6, 0.0, 0.0])
        x_bond = Line(center, x_end, color=x_color, stroke_width=5)
        x_dot = Dot(x_end, radius=0.13, color=x_color)
        x_label = MathTex(r"X", color=x_color, font_size=32)
        x_label.next_to(x_dot, RIGHT, buff=0.12)

        # ---------- 反应物出现 ----------
        self.play(
            Create(carbon),
            Write(carbon_label),
        )
        self.play(
            Create(sub_bonds),
            FadeIn(sub_dots),
            Write(sub_labels),
            Create(x_bond),
            FadeIn(x_dot),
            Write(x_label),
        )
        self.wait(0.5)

        # ---------- 亲核试剂 Nu- 从左侧（背面）沿箭头接近 ----------
        nu_far = center + np.array([-5.0, 0.0, 0.0])
        nu_near = center + np.array([-2.4, 0.0, 0.0])

        nu_dot = Dot(nu_far, radius=0.14, color=nu_color)
        nu_label = MathTex(r"Nu^-", color=nu_color, font_size=32)
        nu_label.next_to(nu_dot, UP, buff=0.12)
        nu_group = VGroup(nu_dot, nu_label)

        attack_arrow = Arrow(
            start=center + np.array([-4.6, 0.0, 0.0]),
            end=center + np.array([-2.7, 0.0, 0.0]),
            color=nu_color,
            buff=0.0,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.18,
        )

        note_back = Text("背面进攻", font="Microsoft YaHei", font_size=26, color=nu_color)
        note_back.to_edge(DOWN, buff=0.5)

        self.play(FadeIn(nu_group))
        self.play(GrowArrow(attack_arrow), Write(note_back))
        self.play(nu_group.animate.move_to(nu_near), run_time=2.0)
        self.wait(0.4)

        # ---------- 过渡态：三取代基摊平成竖直平面（伞被吹平）----------
        # 三条线均为非零、彼此不同：上、略偏左、下
        ts_dirs = [
            np.array([0.0, 1.4, 0.0]),
            np.array([-0.9, 0.0, 0.0]),
            np.array([0.0, -1.4, 0.0]),
        ]
        ts_bonds = VGroup()
        ts_dots = VGroup()
        ts_lbls = VGroup()
        for i, d in enumerate(ts_dirs):
            end = center + d
            bond = Line(center, end, color=sub_color, stroke_width=4)
            dot = Dot(end, radius=0.1, color=sub_color)
            lbl = MathTex(r"R_%d" % (i + 1), color=sub_color, font_size=24)
            if i == 0:
                lbl.next_to(dot, UP, buff=0.08)
            elif i == 2:
                lbl.next_to(dot, DOWN, buff=0.08)
            else:
                lbl.next_to(dot, UP, buff=0.08)
            ts_bonds.add(bond)
            ts_dots.add(dot)
            ts_lbls.add(lbl)

        # 过渡态部分键位置（Nu 与 X 都半成键，带 δ-）
        nu_ts_pos = center + np.array([-2.0, 0.0, 0.0])
        x_ts_pos = center + np.array([2.0, 0.0, 0.0])

        nu_delta = MathTex(r"\delta^-", color=nu_color, font_size=26)
        nu_delta.next_to(nu_ts_pos, DOWN, buff=0.2)
        x_delta = MathTex(r"\delta^-", color=x_color, font_size=26)
        x_delta.next_to(x_ts_pos, DOWN, buff=0.2)

        note_ts = Text("过渡态（五配位）", font="Microsoft YaHei", font_size=26, color=WHITE)
        note_ts.to_edge(DOWN, buff=0.5)

        self.play(
            Transform(sub_bonds, ts_bonds),
            Transform(sub_dots, ts_dots),
            Transform(sub_labels, ts_lbls),
            x_bond.animate.put_start_and_end_on(center, x_ts_pos),
            x_dot.animate.move_to(x_ts_pos),
            x_label.animate.next_to(x_ts_pos, RIGHT, buff=0.12),
            nu_group.animate.move_to(nu_ts_pos),
            attack_arrow.animate.put_start_and_end_on(
                center + np.array([-1.9, 0.0, 0.0]),
                center + np.array([-0.4, 0.0, 0.0]),
            ),
            Transform(note_back, note_ts),
            run_time=2.5,
        )
        self.play(FadeIn(nu_delta), FadeIn(x_delta))
        self.wait(0.8)
        self.play(FadeOut(nu_delta), FadeOut(x_delta))

        # ---------- 产物：取代基翻转到左侧（伞被吹翻），X 离去，Nu 成键 ----------
        sub_dirs_left = [
            np.array([-1.3, 1.0, 0.0]),
            np.array([-1.6, 0.0, 0.0]),
            np.array([-1.3, -1.0, 0.0]),
        ]
        prod_bonds = VGroup()
        prod_dots = VGroup()
        prod_lbls = VGroup()
        for i, d in enumerate(sub_dirs_left):
            end = center + d
            bond = Line(center, end, color=sub_color, stroke_width=5)
            dot = Dot(end, radius=0.11, color=sub_color)
            lbl = MathTex(r"R_%d" % (i + 1), color=sub_color, font_size=26)
            lbl.next_to(dot, LEFT, buff=0.1)
            prod_bonds.add(bond)
            prod_dots.add(dot)
            prod_lbls.add(lbl)

        # Nu 与碳成完整键（左侧），新位置略靠近
        nu_final_pos = center + np.array([-2.0, 0.0, 0.0])

        # X 离去（飞向右上方）
        x_leave_pos = center + np.array([4.8, 1.4, 0.0])

        note_flip = Text("构型翻转（瓦尔登翻转）", font="Microsoft YaHei", font_size=28, color=YELLOW)
        note_flip.to_edge(DOWN, buff=0.5)

        self.play(
            Transform(sub_bonds, prod_bonds),
            Transform(sub_dots, prod_dots),
            Transform(sub_labels, prod_lbls),
            attack_arrow.animate.put_start_and_end_on(center, nu_final_pos),
            nu_group.animate.move_to(nu_final_pos + np.array([0.0, 0.4, 0.0])),
            x_bond.animate.put_start_and_end_on(center, x_leave_pos),
            x_dot.animate.move_to(x_leave_pos),
            x_label.animate.next_to(x_leave_pos, RIGHT, buff=0.12),
            Transform(note_back, note_flip),
            run_time=3.0,
        )
        self.play(
            FadeOut(x_bond),
            FadeOut(x_dot),
            FadeOut(x_label),
        )
        self.wait(0.6)

        # ---------- 强调中心碳的翻转 ----------
        self.play(Indicate(carbon, scale_factor=1.5, color=c_color))
        self.wait(1.2)

        # ---------- 收尾 ----------
        self.play(
            FadeOut(title),
            FadeOut(note_back),
            FadeOut(attack_arrow),
            FadeOut(nu_group),
            FadeOut(sub_bonds),
            FadeOut(sub_dots),
            FadeOut(sub_labels),
            FadeOut(carbon),
            FadeOut(carbon_label),
        )
        self.wait(0.5)


REGISTER = [{
    "scene": "SN2Scene",
    "id": "ch10-10.1-sn2",
    "chapterId": "ch10",
    "sectionId": "10.1",
    "title": "SN2 背面进攻与构型翻转",
    "description": "亲核试剂背面进攻中心碳，经过渡态发生瓦尔登构型翻转。",
}]
