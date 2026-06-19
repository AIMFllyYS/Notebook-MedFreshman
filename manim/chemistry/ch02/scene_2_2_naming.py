import numpy as np
from manim import *


class NamingScene(Scene):
    def construct(self):
        # ---------- 配色 ----------
        chain_color = BLUE_D
        main_color = YELLOW
        sub_color = TEAL

        # ---------- 标题 ----------
        title = Text("系统命名：选主链与编号", font="Microsoft YaHei", font_size=30)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # =========================================================
        # 以 2,3-二甲基戊烷为例
        # 主链 5 个碳（戊烷），在 2、3 位各有一个甲基取代基
        # 用折线（锯齿形）表示碳骨架，碳为折线顶点
        # =========================================================

        # 主链 5 个碳顶点（锯齿形折线，碳为顶点）
        bond = 1.15        # 键长（水平投影）
        dy = 0.55          # 锯齿上下幅度
        x0 = -3.0
        y_base = -0.6

        main_pts = [
            np.array([x0 + 0 * bond, y_base + 0.0, 0.0]),   # C1 (低)
            np.array([x0 + 1 * bond, y_base + dy, 0.0]),    # C2 (高)
            np.array([x0 + 2 * bond, y_base + 0.0, 0.0]),   # C3 (低)
            np.array([x0 + 3 * bond, y_base + dy, 0.0]),    # C4 (高)
            np.array([x0 + 4 * bond, y_base + 0.0, 0.0]),   # C5 (低)
        ]

        # 取代基（甲基）顶点：在 C2 上方、C3 上方各接一个支链碳
        sub2 = main_pts[1] + np.array([0.0, dy + 0.45, 0.0])   # 接在 C2
        sub3 = main_pts[2] + np.array([0.55, -dy - 0.55, 0.0])  # 接在 C3 (向下)

        # ---------- 顶点 Dot ----------
        main_dots = VGroup(*[Dot(p, radius=0.10, color=chain_color) for p in main_pts])
        sub_dots = VGroup(
            Dot(sub2, radius=0.10, color=chain_color),
            Dot(sub3, radius=0.10, color=chain_color),
        )

        # ---------- 主链键（折线段） ----------
        main_bonds = VGroup(
            *[
                Line(main_pts[i], main_pts[i + 1], color=chain_color, stroke_width=5)
                for i in range(len(main_pts) - 1)
            ]
        )

        # ---------- 取代基键 ----------
        sub_bonds = VGroup(
            Line(main_pts[1], sub2, color=chain_color, stroke_width=5),
            Line(main_pts[2], sub3, color=chain_color, stroke_width=5),
        )

        skeleton = VGroup(main_bonds, sub_bonds, main_dots, sub_dots)

        # ① 画出碳骨架
        step1 = Text(
            "① 画出碳骨架（折线，碳在顶点）",
            font="Microsoft YaHei",
            font_size=24,
        ).to_edge(DOWN, buff=0.5)
        self.play(Write(step1))
        self.play(Create(main_bonds), Create(sub_bonds), run_time=2)
        self.play(FadeIn(main_dots), FadeIn(sub_dots), run_time=1)
        self.wait(1)

        # ② 高亮选出的最长主链（变色）
        step2 = Text(
            "② 选出最长的碳链作为主链（5 个碳 → 戊烷）",
            font="Microsoft YaHei",
            font_size=24,
        ).to_edge(DOWN, buff=0.5)
        self.play(Transform(step1, step2))

        main_bonds_hl = main_bonds.copy().set_color(main_color).set_stroke(width=8)
        main_dots_hl = main_dots.copy().set_color(main_color)
        self.play(
            Transform(main_bonds, main_bonds_hl),
            Transform(main_dots, main_dots_hl),
            run_time=1.5,
        )
        self.play(Indicate(main_bonds, color=main_color, scale_factor=1.05), run_time=1.2)
        self.wait(1)

        # ③ 从靠近取代基的一端给主链碳编号
        step3 = Text(
            "③ 从靠近取代基的一端开始编号",
            font="Microsoft YaHei",
            font_size=24,
        ).to_edge(DOWN, buff=0.5)
        self.play(Transform(step1, step3))

        # 取代基在 C2/C3（左端近），从左端编号 1,2,3,4,5
        offsets = [
            np.array([-0.05, -0.40, 0.0]),  # C1
            np.array([-0.40, 0.15, 0.0]),   # C2
            np.array([-0.05, -0.42, 0.0]),  # C3
            np.array([0.35, 0.15, 0.0]),    # C4
            np.array([0.10, -0.40, 0.0]),   # C5
        ]
        number_labels = VGroup()
        for i, p in enumerate(main_pts):
            lbl = MathTex(str(i + 1), font_size=30, color=WHITE)
            lbl.move_to(p + offsets[i])
            number_labels.add(lbl)
            self.play(Write(lbl), run_time=0.45)
        self.wait(1)

        # ④ 标出取代基位号与名称
        step4 = Text(
            "④ 标注取代基的位号与名称（甲基）",
            font="Microsoft YaHei",
            font_size=24,
        ).to_edge(DOWN, buff=0.5)
        self.play(Transform(step1, step4))

        # 高亮两个甲基取代基
        sub_bonds_hl = sub_bonds.copy().set_color(sub_color).set_stroke(width=8)
        sub_dots_hl = sub_dots.copy().set_color(sub_color)
        self.play(
            Transform(sub_bonds, sub_bonds_hl),
            Transform(sub_dots, sub_dots_hl),
            run_time=1.2,
        )

        methyl2 = Text("甲基", font="Microsoft YaHei", font_size=22, color=sub_color)
        methyl2.next_to(Dot(sub2), UP, buff=0.12)
        methyl3 = Text("甲基", font="Microsoft YaHei", font_size=22, color=sub_color)
        methyl3.next_to(Dot(sub3), DOWN, buff=0.12)

        pos_label = Text(
            "取代基位号：2 号、3 号 碳",
            font="Microsoft YaHei",
            font_size=22,
            color=sub_color,
        )
        pos_label.to_edge(UP, buff=1.1)

        self.play(FadeIn(methyl2), FadeIn(methyl3), run_time=1)
        self.play(Write(pos_label), run_time=1)
        self.play(
            Indicate(number_labels[1], color=sub_color),
            Indicate(number_labels[2], color=sub_color),
            run_time=1.2,
        )
        self.wait(1.2)

        # ⑤ 显示最终系统名
        step5 = Text(
            "⑤ 写出系统名称",
            font="Microsoft YaHei",
            font_size=24,
        ).to_edge(DOWN, buff=0.5)
        self.play(Transform(step1, step5))

        final_name = Text(
            "2,3-二甲基戊烷",
            font="Microsoft YaHei",
            font_size=44,
            color=main_color,
        )
        final_name.move_to(np.array([0.0, 2.0, 0.0]))

        box = SurroundingRectangle(final_name, color=main_color, buff=0.25)

        self.play(Write(final_name), run_time=1.5)
        self.play(Create(box), run_time=1)
        self.play(Indicate(final_name, color=WHITE, scale_factor=1.08), run_time=1.2)
        self.wait(1.5)

        # 收尾淡出步骤说明
        self.play(FadeOut(step1), run_time=0.6)
        self.wait(1)


REGISTER = [{
    "scene": "NamingScene", "id": "ch02-2.2-naming",
    "chapterId": "ch02", "sectionId": "2.2",
    "title": "系统命名：选主链与编号",
    "description": "以支链烷烃为例演示选最长主链、编号、命名的过程。",
}]
