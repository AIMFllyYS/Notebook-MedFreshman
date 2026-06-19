import numpy as np
from manim import *


class MarkovnikovScene(Scene):
    def construct(self):
        # ---------- Title ----------
        title = Text("马氏规则与亲电加成机理", font="Microsoft YaHei", font_size=34)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)

        # ============================================================
        # Step 1: 画丙烯 CH3-CH=CH2 (键线式)
        # ============================================================
        step1 = Text("① 丙烯 (propene)", font="Microsoft YaHei", font_size=26)
        step1.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step1))

        # 键线式骨架顶点坐标 (zig-zag)
        #   C1(CH3) --- C2(=CH) === C3(CH2)
        c1 = np.array([-3.5, -0.8, 0.0])   # CH3 末端
        c2 = np.array([-2.0, 0.2, 0.0])    # 中间 CH
        c3 = np.array([-0.5, -0.8, 0.0])   # CH2 末端 (双键端位)

        # 单键 C1-C2
        bond_single = Line(c1, c2, color=WHITE, stroke_width=4)

        # 双键 C2=C3 (两条平行线)
        direction = c3 - c2
        length = np.linalg.norm(direction)
        unit = direction / length
        perp = np.array([-unit[1], unit[0], 0.0]) * 0.12
        db_line1 = Line(c2 + perp, c3 + perp, color=WHITE, stroke_width=4)
        db_line2 = Line(c2 - perp, c3 - perp, color=WHITE, stroke_width=4)

        propene_group = VGroup(bond_single, db_line1, db_line2)

        # 端位标注
        label_ch3 = MathTex(r"CH_3", font_size=30)
        label_ch3.next_to(c1, LEFT, buff=0.15)
        label_ch2 = MathTex(r"CH_2", font_size=30)
        label_ch2.next_to(c3, RIGHT, buff=0.15)

        self.play(Create(bond_single))
        self.play(Create(db_line1), Create(db_line2))
        self.play(Write(label_ch3), Write(label_ch2))
        self.wait(1.5)

        # ============================================================
        # Step 2: H+ 加到端位碳 (含氢多的 CH2), 生成仲碳正离子
        # ============================================================
        self.play(FadeOut(step1))
        step2 = Text("② H⁺ 加到含氢多的碳 (CH₂)", font="Microsoft YaHei", font_size=26)
        step2.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step2))

        # H+ 出现在 CH2 上方
        h_plus = MathTex(r"H^+", font_size=34, color=YELLOW)
        h_plus.move_to(c3 + np.array([0.6, 1.4, 0.0]))
        self.play(FadeIn(h_plus, shift=DOWN * 0.3))

        # Arrow: H+ 进攻双键端位碳 (电子/进攻方向)
        attack_arrow = Arrow(
            start=h_plus.get_bottom() + DOWN * 0.05,
            end=c3 + np.array([0.0, 0.25, 0.0]),
            color=YELLOW,
            buff=0.1,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )
        self.play(Create(attack_arrow))
        self.wait(0.8)

        # 双键打开 -> 单键 (移除一条平行线), H 加到 C3, 正电荷在 C2 (仲碳)
        self.play(
            FadeOut(db_line2),
            FadeOut(attack_arrow),
            FadeOut(h_plus),
        )

        # C3 现在变成 CH3 (加了 H), C2 成为碳正离子
        new_label_ch3_right = MathTex(r"CH_3", font_size=30)
        new_label_ch3_right.next_to(c3, RIGHT, buff=0.15)
        self.play(Transform(label_ch2, new_label_ch3_right))

        # 仲碳正离子标记 (+) 在 C2
        carbocation_plus = MathTex(r"+", font_size=40, color=RED)
        carbocation_plus.move_to(c2 + np.array([0.0, 0.55, 0.0]))
        cation_dot = Dot(c2, color=RED, radius=0.08)
        self.play(FadeIn(cation_dot), Write(carbocation_plus))

        # 稳定性说明
        stable_text = Text("仲碳正离子 (更稳定)", font="Microsoft YaHei", font_size=24, color=RED)
        stable_text.to_edge(DOWN, buff=1.0)
        self.play(FadeIn(stable_text))
        self.wait(2)

        # ============================================================
        # Step 3: Br- 进攻碳正离子
        # ============================================================
        self.play(FadeOut(step2), FadeOut(stable_text))
        step3 = Text("③ Br⁻ 进攻碳正离子", font="Microsoft YaHei", font_size=26)
        step3.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step3))

        # Br- 出现在 C2 上方
        br_minus = MathTex(r"Br^-", font_size=34, color=GREEN)
        br_minus.move_to(c2 + np.array([0.0, 2.0, 0.0]))
        self.play(FadeIn(br_minus, shift=DOWN * 0.3))

        # Arrow: Br- 进攻碳正离子 (进攻方向)
        br_attack_arrow = Arrow(
            start=br_minus.get_bottom() + DOWN * 0.05,
            end=carbocation_plus.get_top() + UP * 0.05,
            color=GREEN,
            buff=0.1,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.25,
        )
        self.play(Create(br_attack_arrow))
        self.wait(1.2)

        # Br 成键: 移除正电荷, Br 连到 C2
        self.play(
            FadeOut(carbocation_plus),
            FadeOut(cation_dot),
            FadeOut(br_attack_arrow),
        )

        # Br 取代位置, 画 C2-Br 键
        br_pos = c2 + np.array([0.0, 1.0, 0.0])
        c_br_bond = Line(c2, br_pos, color=WHITE, stroke_width=4)
        br_label = MathTex(r"Br", font_size=30, color=GREEN)
        br_label.next_to(br_pos, UP, buff=0.1)
        self.play(Create(c_br_bond), Transform(br_minus, br_label))
        self.wait(1)

        # ============================================================
        # Step 4: 主产物 2-溴丙烷
        # ============================================================
        self.play(FadeOut(step3))
        step4 = Text("④ 主产物：2-溴丙烷", font="Microsoft YaHei", font_size=26)
        step4.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step4))

        product_formula = MathTex(r"CH_3CHBrCH_3", font_size=40, color=BLUE)
        product_formula.to_edge(DOWN, buff=1.6)
        self.play(Write(product_formula))
        self.wait(1.5)

        # ============================================================
        # Final: 马氏规则文字说明
        # ============================================================
        rule_text = Text(
            "马氏规则：H 加到含氢多的碳，生成更稳定的碳正离子",
            font="Microsoft YaHei",
            font_size=24,
        )
        rule_text.to_edge(DOWN, buff=0.5)

        # 先清理产物式让位 (上移)
        self.play(product_formula.animate.to_edge(DOWN, buff=1.4))
        self.play(Write(rule_text))
        self.wait(3)


REGISTER = [{
    "scene": "MarkovnikovScene", "id": "ch06-6.2-markovnikov",
    "chapterId": "ch06", "sectionId": "6.2",
    "title": "马氏规则与亲电加成机理",
    "description": "丙烯加 HBr 经仲碳正离子中间体，遵循马氏规则得 2-溴丙烷。",
}]
