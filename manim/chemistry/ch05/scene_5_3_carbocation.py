import numpy as np
from manim import *


class CarbocationStabilityScene(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = Text("碳正离子稳定性与超共轭", font="Microsoft YaHei", font_size=34)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ---------- 坐标轴（能量轴） ----------
        # 纵轴：能量（越高越不稳定）
        axis = Line(start=np.array([-5.5, -2.6, 0]), end=np.array([-5.5, 2.4, 0]))
        axis.set_color(GREY_B)
        arrow_tip = Arrow(
            start=np.array([-5.5, 2.0, 0]),
            end=np.array([-5.5, 2.6, 0]),
            buff=0,
            color=GREY_B,
            stroke_width=4,
        )
        energy_label = Text("能量", font="Microsoft YaHei", font_size=24)
        energy_label.next_to(arrow_tip, UP, buff=0.15)
        less_stable = Text("越不稳定", font="Microsoft YaHei", font_size=18, color=RED_C)
        less_stable.next_to(axis.get_top(), RIGHT, buff=0.1).shift(DOWN * 0.2)
        more_stable = Text("越稳定", font="Microsoft YaHei", font_size=18, color=GREEN_C)
        more_stable.next_to(axis.get_bottom(), RIGHT, buff=0.1).shift(UP * 0.2)

        self.play(Create(axis), Create(arrow_tip), Write(energy_label))
        self.play(FadeIn(less_stable), FadeIn(more_stable))
        self.wait(0.3)

        # ---------- 四种碳正离子数据 ----------
        # (公式, 名称, 相邻可超共轭C-H数, 柱高, x位置)
        data = [
            (r"CH_3^+", "甲基", "0", 3.4, -3.2),
            (r"R\text{-}CH_2^+", "伯 1", "~1", 2.6, -1.2),
            (r"R_2CH^+", "仲 2", "~2", 1.8, 0.8),
            (r"R_3C^+", "叔 3", "~3", 1.0, 2.8),
        ]

        baseline = -2.4   # 柱状条底部基线 y
        bar_width = 1.3

        colors = [RED_C, ORANGE, YELLOW_D, GREEN_C]
        bars = []
        formula_mobs = []
        name_mobs = []
        hyper_mobs = []

        for (formula, name, hyper_n, h, x) in data:
            color = colors[len(bars)]
            bar = Rectangle(width=bar_width, height=h, fill_opacity=0.85,
                            fill_color=color, stroke_color=WHITE, stroke_width=2)
            # 让底部对齐基线
            bar.move_to(np.array([x, baseline + h / 2, 0]))
            bars.append(bar)

            # 化学式（顶部）
            f = MathTex(formula, font_size=30)
            f.next_to(bar, UP, buff=0.12)
            formula_mobs.append(f)

            # 名称（底部下方）
            nm_text = "甲基" if name == "甲基" else None
            if name == "甲基":
                nm = Text("甲基", font="Microsoft YaHei", font_size=20)
            else:
                # 名称含度数符号，用中文+MathTex组合
                cn, deg = name.split(" ")
                cn_label = {"伯": "伯", "仲": "仲", "叔": "叔"}[cn]
                nm = VGroup(
                    Text(cn_label, font="Microsoft YaHei", font_size=20),
                    MathTex(deg + r"^\circ", font_size=24),
                ).arrange(RIGHT, buff=0.08)
            nm.next_to(bar, DOWN, buff=0.18)
            name_mobs.append(nm)

            # 超共轭C-H键数目标注
            hl = VGroup(
                Text("可超共轭 C-H", font="Microsoft YaHei", font_size=15, color=BLUE_B),
                Text(hyper_n + " 个", font="Microsoft YaHei", font_size=15, color=BLUE_B),
            ).arrange(DOWN, buff=0.05)
            hl.next_to(nm, DOWN, buff=0.12)
            hyper_mobs.append(hl)

        # ---------- 依次出现四个能级条 ----------
        for i in range(4):
            self.play(
                GrowFromEdge(bars[i], DOWN),
                run_time=0.7,
            )
            self.play(
                Write(formula_mobs[i]),
                FadeIn(name_mobs[i], shift=UP * 0.2),
                run_time=0.5,
            )
            self.play(FadeIn(hyper_mobs[i]), run_time=0.4)
            self.wait(0.2)

        # ---------- 稳定性顺序说明 ----------
        order = MathTex(r"CH_3^+ < 1^\circ < 2^\circ < 3^\circ", font_size=30)
        order.to_edge(RIGHT, buff=0.4).shift(UP * 2.2)
        order_label = Text("稳定性顺序", font="Microsoft YaHei", font_size=20)
        order_label.next_to(order, UP, buff=0.15)
        self.play(Write(order_label), Write(order))
        self.wait(0.3)

        # ---------- 机理文字说明 ----------
        explain = VGroup(
            Text("超共轭 / 诱导供电子", font="Microsoft YaHei", font_size=20, color=BLUE_B),
            Text("使正电荷分散", font="Microsoft YaHei", font_size=20, color=BLUE_B),
            Text("→ 更稳定", font="Microsoft YaHei", font_size=20, color=GREEN_C),
        ).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        explain.to_edge(RIGHT, buff=0.4).shift(DOWN * 0.4)
        self.play(FadeIn(explain, shift=LEFT * 0.3))
        self.wait(0.5)

        # ---------- 高亮叔碳正离子最稳定 ----------
        highlight = SurroundingRectangle(bars[3], color=GREEN_B, buff=0.08)
        most_stable = Text("最稳定", font="Microsoft YaHei", font_size=22, color=GREEN_B)
        most_stable.next_to(highlight, UP, buff=0.3).shift(RIGHT * 0.05)
        # 避免与化学式重叠，放在化学式上方
        most_stable.next_to(formula_mobs[3], UP, buff=0.15)

        self.play(Create(highlight))
        self.play(
            Indicate(bars[3], color=GREEN_B, scale_factor=1.1),
            FadeIn(most_stable, shift=DOWN * 0.2),
        )
        self.play(Indicate(order, color=GREEN_B))
        self.wait(1.5)


REGISTER = [{
    "scene": "CarbocationStabilityScene",
    "id": "ch05-5.3-carbocation",
    "chapterId": "ch05",
    "sectionId": "5.3",
    "title": "碳正离子稳定性与超共轭",
    "description": "能量阶梯对比甲基/伯/仲/叔碳正离子的稳定性与超共轭数目。",
}]
