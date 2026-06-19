import numpy as np
from manim import *


class CarbonylAdditionScene(Scene):
    def construct(self):
        # ---------- Titles ----------
        title = Text("羰基的亲核加成机理", font="Microsoft YaHei", font_size=34)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)

        # ============================================================
        # 1) 画羰基 C=O，标 δ+ 在 C、δ- 在 O
        # ============================================================
        c_pos = np.array([-1.0, -0.3, 0.0])
        o_pos = np.array([2.0, -0.3, 0.0])

        c_atom = Text("C", font="Microsoft YaHei", font_size=40).move_to(c_pos)
        o_atom = Text("O", font="Microsoft YaHei", font_size=40).move_to(o_pos)

        # C=O 双键（两条平行线）
        offset = np.array([0.0, 0.18, 0.0])
        bond_dir = (o_pos - c_pos)
        bond_dir = bond_dir / np.linalg.norm(bond_dir)
        c_edge = c_pos + bond_dir * 0.45
        o_edge = o_pos - bond_dir * 0.45
        double_bond_top = Line(c_edge + offset, o_edge + offset, color=WHITE)
        double_bond_bot = Line(c_edge - offset, o_edge - offset, color=WHITE)
        double_bond = VGroup(double_bond_top, double_bond_bot)

        # 部分电荷标记
        delta_plus = MathTex(r"\delta^+", color=BLUE).scale(0.8)
        delta_plus.next_to(c_atom, DOWN, buff=0.25)
        delta_minus = MathTex(r"\delta^-", color=RED).scale(0.8)
        delta_minus.next_to(o_atom, DOWN, buff=0.25)

        carbonyl = VGroup(c_atom, o_atom, double_bond, delta_plus, delta_minus)

        self.play(Write(c_atom), Write(o_atom))
        self.play(Create(double_bond))
        self.play(FadeIn(delta_plus), FadeIn(delta_minus))
        self.wait(1)

        # 提示文字：羰基碳缺电子是亲电中心
        note1 = Text("羰基碳缺电子是亲电中心", font="Microsoft YaHei", font_size=26, color=YELLOW)
        note1.to_edge(DOWN, buff=0.5)
        self.play(Write(note1))
        self.wait(2)

        # ============================================================
        # 2) Nu- 从上方进攻羰基碳；π 电子转移到 O
        # ============================================================
        nu = MathTex(r"Nu^-", color=GREEN).scale(0.9)
        nu_start = c_pos + np.array([-1.6, 2.2, 0.0])
        nu.move_to(nu_start)
        self.play(FadeIn(nu))
        self.wait(0.5)

        # 进攻箭头：从 Nu- 指向羰基碳
        attack_arrow = CurvedArrow(
            start_point=nu_start + np.array([0.3, -0.3, 0.0]),
            end_point=c_pos + np.array([-0.2, 0.6, 0.0]),
            angle=-PI / 4,
            color=GREEN,
        )
        # π 电子转移箭头：从双键中部指向 O
        pi_arrow = CurvedArrow(
            start_point=(c_edge + o_edge) / 2 + np.array([0.0, 0.35, 0.0]),
            end_point=o_pos + np.array([0.0, 0.6, 0.0]),
            angle=PI / 3,
            color=ORANGE,
        )

        self.play(Create(attack_arrow))
        self.play(Create(pi_arrow))
        self.wait(2)

        # 清理箭头与提示，准备形成中间体
        self.play(
            FadeOut(attack_arrow),
            FadeOut(pi_arrow),
            FadeOut(note1),
        )
        self.wait(0.5)

        # ============================================================
        # 3) 形成四面体中间体：C 变 sp3，O 带负电 (O-)
        # ============================================================
        # 新结构：C 与 Nu 成键，C 与 O 变单键，O 带负电
        c_new = Text("C", font="Microsoft YaHei", font_size=40).move_to(c_pos)
        o_new = Text("O", font="Microsoft YaHei", font_size=40).move_to(o_pos)

        # C-O 单键
        single_bond = Line(c_edge, o_edge, color=WHITE)

        # C-Nu 新键（Nu 移到 C 上方）
        nu_new_pos = c_pos + np.array([-0.9, 1.2, 0.0])
        nu_bonded = MathTex(r"Nu", color=GREEN).scale(0.9).move_to(nu_new_pos)
        nu_bond = Line(
            c_pos + np.array([-0.3, 0.4, 0.0]),
            nu_new_pos + np.array([0.15, -0.25, 0.0]),
            color=GREEN,
        )

        # 四面体其余两个键（示意 H / R）
        sub1_pos = c_pos + np.array([-0.9, -1.1, 0.0])
        sub2_pos = c_pos + np.array([0.0, -1.3, 0.0])
        sub1 = Text("R", font="Microsoft YaHei", font_size=30).move_to(sub1_pos)
        sub2 = Text("H", font="Microsoft YaHei", font_size=30).move_to(sub2_pos)
        sub1_bond = Line(c_pos + np.array([-0.35, -0.25, 0.0]), sub1_pos + np.array([0.1, 0.25, 0.0]), color=WHITE)
        sub2_bond = Line(c_pos + np.array([-0.05, -0.4, 0.0]), sub2_pos + np.array([0.0, 0.3, 0.0]), color=WHITE)

        # O 带负电
        o_charge = MathTex(r"O^-", color=RED).scale(0.9).next_to(o_new, RIGHT, buff=0.1)

        intermediate = VGroup(
            c_new, o_new, single_bond,
            nu_bonded, nu_bond,
            sub1, sub2, sub1_bond, sub2_bond,
            o_charge,
        )

        # 从羰基 + Nu 过渡到四面体中间体
        self.play(
            FadeOut(double_bond),
            FadeOut(delta_plus),
            FadeOut(delta_minus),
            ReplacementTransform(c_atom, c_new),
            ReplacementTransform(o_atom, o_new),
            ReplacementTransform(nu, nu_bonded),
        )
        self.play(
            Create(single_bond),
            Create(nu_bond),
            FadeIn(o_charge),
        )
        self.play(
            Create(sub1_bond), Create(sub2_bond),
            FadeIn(sub1), FadeIn(sub2),
        )

        inter_label = Text("四面体中间体（烷氧负离子）", font="Microsoft YaHei", font_size=26, color=YELLOW)
        inter_label.to_edge(DOWN, buff=0.5)
        self.play(Write(inter_label))
        self.wait(2.5)

        # ============================================================
        # 4) 质子化得到产物（醇 / 加成物）
        # ============================================================
        proton = MathTex(r"H^+", color=BLUE).scale(0.8)
        proton_start = o_pos + np.array([1.6, 1.4, 0.0])
        proton.move_to(proton_start)
        self.play(FadeIn(proton))

        proton_arrow = CurvedArrow(
            start_point=o_pos + np.array([0.9, 0.5, 0.0]),
            end_point=o_pos + np.array([0.35, 0.25, 0.0]),
            angle=-PI / 4,
            color=BLUE,
        )
        self.play(Create(proton_arrow))
        self.wait(1)

        # 形成 O-H（醇羟基）
        oh_label = MathTex(r"OH", color=WHITE).scale(0.9).move_to(o_pos).shift(RIGHT * 0.15)
        self.play(
            FadeOut(proton),
            FadeOut(proton_arrow),
            FadeOut(o_charge),
            ReplacementTransform(o_new, oh_label),
        )
        self.wait(0.5)

        product_label = Text("产物：醇（加成物）", font="Microsoft YaHei", font_size=26, color=GREEN)
        product_label.to_edge(DOWN, buff=0.5)
        self.play(ReplacementTransform(inter_label, product_label))
        self.wait(1.5)

        # ============================================================
        # 5) 结论文字：亲核加成
        # ============================================================
        conclusion = Text("亲核加成", font="Microsoft YaHei", font_size=40, color=YELLOW)
        conclusion.next_to(title, DOWN, buff=0.4)
        self.play(Write(conclusion))
        self.wait(2.5)


REGISTER = [{
    "scene": "CarbonylAdditionScene", "id": "ch12-12.1-carbonyl",
    "chapterId": "ch12", "sectionId": "12.1",
    "title": "羰基的亲核加成机理",
    "description": "亲核试剂进攻羰基碳，π 电子转向氧，形成四面体中间体。",
}]
