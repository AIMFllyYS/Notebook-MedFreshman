import numpy as np
from manim import *


class DiazoniumScene(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = Text(
            "重氮盐：芳香合成的枢纽",
            font="Microsoft YaHei",
            font_size=30,
        )
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ---------- 中心枢纽：苯环 + ArN2+ ----------
        ring = RegularPolygon(n=6, radius=0.55, color=BLUE)
        ring.set_stroke(width=3)
        ring.move_to(ORIGIN)

        center_label = MathTex(r"ArN_2^+", font_size=34, color=YELLOW)
        center_label.next_to(ring, DOWN, buff=0.12)

        hub = VGroup(ring, center_label)
        hub.move_to(np.array([0.0, -0.3, 0.0]))

        self.play(Create(ring))
        self.play(Write(center_label))
        self.wait(0.4)

        hub_center = ring.get_center()

        # ---------- 六条转化路径 ----------
        # 每条路径：角度、试剂(MathTex)、产物(中文)、反应名(中文)
        paths = [
            {
                "angle": 150,
                "reagent": MathTex(r"CuCl", font_size=24, color=WHITE),
                "product": "氯苯",
                "rxn": "桑德迈尔反应",
                "color": TEAL,
            },
            {
                "angle": 90,
                "reagent": MathTex(r"CuBr", font_size=24, color=WHITE),
                "product": "溴苯",
                "rxn": "桑德迈尔反应",
                "color": GREEN,
            },
            {
                "angle": 30,
                "reagent": MathTex(r"KI", font_size=24, color=WHITE),
                "product": "碘苯",
                "rxn": "席曼类(脱氮)",
                "color": GOLD,
            },
            {
                "angle": 330,
                "reagent": MathTex(r"H_3PO_2", font_size=24, color=WHITE),
                "product": "苯",
                "rxn": "还原脱氮",
                "color": MAROON,
            },
            {
                "angle": 270,
                "reagent": MathTex(r"H_2O,\ \Delta", font_size=24, color=WHITE),
                "product": "苯酚",
                "rxn": "水解",
                "color": PURPLE,
            },
            {
                "angle": 210,
                "reagent": MathTex(r"ArOH", font_size=24, color=WHITE),
                "product": "偶氮化合物",
                "rxn": "偶联反应",
                "color": RED,
            },
        ]

        r_inner = 0.95   # 箭头起点距中心
        r_arrow = 2.4    # 箭头终点距中心
        r_label = 3.15   # 产物标注距中心

        path_groups = []

        for p in paths:
            theta = np.deg2rad(p["angle"])
            direction = np.array([np.cos(theta), np.sin(theta), 0.0])

            start = hub_center + direction * r_inner
            end = hub_center + direction * r_arrow

            arrow = Arrow(
                start=start,
                end=end,
                buff=0.0,
                stroke_width=4,
                max_tip_length_to_length_ratio=0.18,
                color=p["color"],
            )

            # 试剂标注：放在箭头中点旁
            reagent = p["reagent"]
            reagent.move_to((start + end) / 2 + np.array([0.0, 0.18, 0.0]))

            # 产物标注：箭头末端外侧
            prod_pos = hub_center + direction * r_label
            product = Text(
                p["product"],
                font="Microsoft YaHei",
                font_size=22,
                color=p["color"],
            )
            product.move_to(prod_pos)

            # 反应名：产物下方小字
            rxn = Text(
                p["rxn"],
                font="Microsoft YaHei",
                font_size=16,
                color=GREY_B,
            )
            rxn.next_to(product, DOWN, buff=0.08)

            group = VGroup(arrow, reagent, product, rxn)
            path_groups.append((group, arrow, product, p))

        # ---------- 依次出现并高亮 ----------
        for group, arrow, product, p in path_groups:
            self.play(
                GrowArrow(arrow),
                FadeIn(group[1]),  # reagent
                run_time=0.6,
            )
            self.play(
                FadeIn(product),
                FadeIn(group[3]),  # rxn name
                run_time=0.5,
            )
            self.play(Indicate(product, scale_factor=1.25, color=p["color"]), run_time=0.5)
            self.wait(0.2)

        self.wait(0.6)

        # ---------- 整体强调枢纽 ----------
        self.play(Indicate(hub, scale_factor=1.15, color=YELLOW), run_time=0.8)
        self.wait(0.4)

        # ---------- 收束文字 ----------
        summary = Text(
            "一种重氮盐，多条合成路线",
            font="Microsoft YaHei",
            font_size=20,
            color=YELLOW,
        )
        summary.to_edge(DOWN, buff=0.35)
        self.play(Write(summary))
        self.wait(1.5)


REGISTER = [{
    "scene": "DiazoniumScene", "id": "ch14-14.1-diazonium",
    "chapterId": "ch14", "sectionId": "14.1",
    "title": "重氮盐的多样转化",
    "description": "芳基重氮盐经桑德迈尔/席曼/还原/偶联等转化为多种产物。",
}]
