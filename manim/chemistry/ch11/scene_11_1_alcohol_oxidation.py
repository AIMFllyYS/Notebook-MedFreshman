import numpy as np
from manim import *


class AlcoholOxidationScene(Scene):
    def construct(self):
        # ---------- Title ----------
        title = Text("醇的氧化", font="Microsoft YaHei", font_size=40)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ---------- Helper to build oxidant arrow with [O] label ----------
        def ox_arrow(start, end):
            arr = Arrow(start, end, buff=0.15, stroke_width=4,
                        max_tip_length_to_length_ratio=0.18)
            label = MathTex(r"[O]", font_size=28)
            label.next_to(arr, UP, buff=0.12)
            return arr, label

        # ============================================================
        # Row 1 : Primary alcohol  ->  aldehyde  ->  carboxylic acid
        # ============================================================
        y1 = 1.7
        prim_label = Text("伯醇", font="Microsoft YaHei", font_size=26)
        prim_struct = MathTex(r"RCH_2OH", font_size=28)
        prim = VGroup(prim_label, prim_struct).arrange(DOWN, buff=0.12)
        prim.move_to([-5.6, y1, 0])

        aldehyde_label = Text("醛", font="Microsoft YaHei", font_size=24)
        aldehyde_struct = MathTex(r"RCHO", font_size=28)
        aldehyde = VGroup(aldehyde_label, aldehyde_struct).arrange(DOWN, buff=0.12)
        aldehyde.move_to([-1.0, y1, 0])

        acid_label = Text("羧酸", font="Microsoft YaHei", font_size=24)
        acid_struct = MathTex(r"RCOOH", font_size=28)
        acid = VGroup(acid_label, acid_struct).arrange(DOWN, buff=0.12)
        acid.move_to([4.4, y1, 0])

        arr1a, lab1a = ox_arrow([-4.5, y1, 0], [-2.2, y1, 0])
        arr1b, lab1b = ox_arrow([0.1, y1, 0], [3.1, y1, 0])

        self.play(FadeIn(prim, shift=RIGHT * 0.3))
        self.wait(0.3)
        self.play(GrowArrow(arr1a), Write(lab1a))
        self.play(FadeIn(aldehyde, shift=RIGHT * 0.3))
        self.wait(0.3)
        self.play(GrowArrow(arr1b), Write(lab1b))
        self.play(FadeIn(acid, shift=RIGHT * 0.3))
        self.wait(0.6)

        # ============================================================
        # Row 2 : Secondary alcohol  ->  ketone
        # ============================================================
        y2 = -0.3
        sec_label = Text("仲醇", font="Microsoft YaHei", font_size=26)
        sec_struct = MathTex(r"R_2CHOH", font_size=28)
        sec = VGroup(sec_label, sec_struct).arrange(DOWN, buff=0.12)
        sec.move_to([-5.6, y2, 0])

        ketone_label = Text("酮", font="Microsoft YaHei", font_size=24)
        ketone_struct = MathTex(r"R_2C{=}O", font_size=28)
        ketone = VGroup(ketone_label, ketone_struct).arrange(DOWN, buff=0.12)
        ketone.move_to([-1.0, y2, 0])

        arr2, lab2 = ox_arrow([-4.5, y2, 0], [-2.2, y2, 0])

        self.play(FadeIn(sec, shift=RIGHT * 0.3))
        self.wait(0.2)
        self.play(GrowArrow(arr2), Write(lab2))
        self.play(FadeIn(ketone, shift=RIGHT * 0.3))
        self.wait(0.6)

        # ============================================================
        # Row 3 : Tertiary alcohol  ->  X (no reaction)
        # ============================================================
        y3 = -2.3
        tert_label = Text("叔醇", font="Microsoft YaHei", font_size=26)
        tert_struct = MathTex(r"R_3COH", font_size=28)
        tert = VGroup(tert_label, tert_struct).arrange(DOWN, buff=0.12)
        tert.move_to([-5.6, y3, 0])

        arr3, lab3 = ox_arrow([-4.5, y3, 0], [-2.2, y3, 0])
        cross = Cross(stroke_color=RED, stroke_width=6)
        cross.scale(0.32)
        cross.move_to([-1.0, y3, 0])

        no_react = Text("不被氧化", font="Microsoft YaHei", font_size=24)
        no_react.next_to(cross, RIGHT, buff=0.4)

        self.play(FadeIn(tert, shift=RIGHT * 0.3))
        self.wait(0.2)
        self.play(GrowArrow(arr3), Write(lab3))
        self.play(Create(cross), FadeIn(no_react))
        self.wait(0.6)

        # ============================================================
        # Explanation box
        # ============================================================
        explain = Text(
            "伯醇 / 仲醇有 α-H 可被氧化；叔醇无 α-H 难被氧化",
            font="Microsoft YaHei", font_size=24,
        )
        box = Rectangle(
            width=explain.width + 0.6,
            height=explain.height + 0.4,
            stroke_color=BLUE, stroke_width=3,
        )
        group = VGroup(box, explain)
        group.to_edge(DOWN, buff=0.3)

        self.play(Create(box), Write(explain))
        self.wait(2.0)


REGISTER = [{
    "scene": "AlcoholOxidationScene", "id": "ch11-11.1-alcohol-oxidation",
    "chapterId": "ch11", "sectionId": "11.1",
    "title": "醇的氧化",
    "description": "伯醇→醛→羧酸、仲醇→酮、叔醇不氧化的对比流程。",
}]
