import numpy as np
from manim import *


class AcylReactivityScene(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = Text("羧酸衍生物反应活性序列", font="Microsoft YaHei", font_size=32)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ---------- 四类衍生物数据：活性从高到低 ----------
        # (中文名, 结构式 MathTex, 离去基团说明, 离去基团 MathTex)
        derivatives = [
            ("酰氯", r"RCOCl", "离去能力 好", r"Cl^-"),
            ("酸酐", r"RCOOCOR", "离去能力 较好", r"RCOO^-"),
            ("酯",   r"RCOOR", "离去能力 较差", r"RO^-"),
            ("酰胺", r"RCONH_2", "离去能力 差", r"NH_2^-"),
        ]

        # 阶梯坐标：活性高在左上，活性低在右下
        x_positions = [-4.2, -1.6, 1.0, 3.6]
        y_positions = [1.7, 0.6, -0.5, -1.6]

        steps = VGroup()
        rows = []

        for i, (name, formula, leave_txt, leave_tex) in enumerate(derivatives):
            box = Rectangle(width=2.2, height=0.85,
                            color=BLUE, fill_opacity=0.12)
            name_t = Text(name, font="Microsoft YaHei", font_size=24)
            formula_t = MathTex(formula, font_size=26)
            label = VGroup(name_t, formula_t).arrange(RIGHT, buff=0.25)
            label.move_to(box.get_center())
            row = VGroup(box, label)
            row.move_to(np.array([x_positions[i], y_positions[i], 0]))
            rows.append(row)
            steps.add(row)

        # ① 依次出现四类衍生物，排成阶梯
        for row in rows:
            self.play(Create(row[0]), Write(row[1]), run_time=0.7)
        self.wait(0.5)

        # 连接阶梯的台阶线（垂直 + 水平），表现"逐级下降"
        connectors = VGroup()
        for i in range(len(rows) - 1):
            p_start = rows[i].get_bottom()
            p_corner = np.array([rows[i].get_center()[0],
                                 rows[i + 1].get_center()[1], 0])
            p_end = rows[i + 1].get_left()
            seg1 = Line(p_start, p_corner, color=GREY_B, stroke_width=2)
            seg2 = Line(p_corner, p_end, color=GREY_B, stroke_width=2)
            connectors.add(seg1, seg2)
        self.play(Create(connectors), run_time=1.0)
        self.wait(0.3)

        # ② 标注每个离去基团 L 的离去能力
        leave_labels = VGroup()
        for i, (name, formula, leave_txt, leave_tex) in enumerate(derivatives):
            tex = MathTex(leave_tex, font_size=24, color=YELLOW)
            txt = Text(leave_txt, font="Microsoft YaHei", font_size=18, color=YELLOW)
            grp = VGroup(tex, txt).arrange(RIGHT, buff=0.18)
            grp.next_to(rows[i], DOWN, buff=0.12)
            leave_labels.add(grp)

        for grp in leave_labels:
            self.play(FadeIn(grp, shift=DOWN * 0.2), run_time=0.5)
        self.wait(0.5)

        # ④ 向下大箭头："反应活性递减"
        arrow = Arrow(
            start=np.array([5.6, 1.9, 0]),
            end=np.array([5.6, -1.9, 0]),
            color=RED, buff=0.0, stroke_width=6,
        )
        arrow_label = Text("反应活性递减", font="Microsoft YaHei",
                           font_size=22, color=RED)
        arrow_label.rotate(-PI / 2)
        arrow_label.next_to(arrow, RIGHT, buff=0.15)
        self.play(GrowArrow(arrow), Write(arrow_label), run_time=1.2)
        self.wait(0.5)

        # ③ 文字解释（电子效应与转化方向）
        explain1 = Text("L 供电子共轭越强 → 羰基越不活泼",
                        font="Microsoft YaHei", font_size=22, color=GREEN)
        explain2 = Text("高活性可转化为低活性，反之难",
                        font="Microsoft YaHei", font_size=22, color=ORANGE)
        explains = VGroup(explain1, explain2).arrange(DOWN, buff=0.2)
        explains.to_edge(DOWN, buff=0.35)

        self.play(FadeIn(explain1, shift=UP * 0.2), run_time=1.0)
        self.wait(0.6)
        self.play(FadeIn(explain2, shift=UP * 0.2), run_time=1.0)
        self.wait(1.5)


REGISTER = [{
    "scene": "AcylReactivityScene", "id": "ch13-13.2-acyl-reactivity",
    "chapterId": "ch13", "sectionId": "13.2",
    "title": "羧酸衍生物反应活性序列",
    "description": "酰氯>酸酐>酯>酰胺的活性阶梯与离去能力、电子效应解释。",
}]
