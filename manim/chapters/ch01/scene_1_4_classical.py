"""第 1.4 节 · 古典概型与计数 —— 以掷两颗骰子为例，展示 6×6 样本空间网格与
事件「点数和 = 7」的有利结果计数，推导 P = 6/36 = 1/6。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    AnimationGroup,
    Create,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    Square,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"

# 每个小格的边长
CELL = 0.56


def make_cell(fill_color, fill_opacity=0.15, stroke_color=BLUE_D, stroke_width=1.5):
    return Square(
        side_length=CELL,
        color=stroke_color,
        stroke_width=stroke_width,
    ).set_fill(fill_color, opacity=fill_opacity)


class ClassicalProbScene(Scene):
    def construct(self):
        # ── 0. 标题 ────────────────────────────────────────────────────
        title = Text("古典概型与计数", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 背景说明文字 ─────────────────────────────────────────────
        intro = Text(
            "掷两颗骰子，每颗点数 1–6，共 36 个等可能结果",
            font=CJK,
        ).scale(0.45)
        intro.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(intro))
        self.wait(0.8)

        # ── 2. 构建 6×6 网格 ────────────────────────────────────────────
        # 网格整体居中偏左，留右侧空间放公式
        grid_origin = LEFT * 3.2 + DOWN * 0.5

        # 行/列标签
        row_labels = VGroup()  # 骰子1 的点数（纵轴），从下到上 1..6
        col_labels = VGroup()  # 骰子2 的点数（横轴），从左到右 1..6
        for k in range(1, 7):
            # 列标签（骰子2）—— 顶部
            cl = Text(str(k), font=CJK).scale(0.38)
            cl.move_to(
                grid_origin + RIGHT * (k - 0.5) * CELL + UP * (6 + 0.6) * CELL
            )
            col_labels.add(cl)
            # 行标签（骰子1）—— 左侧，从上到下对应点数 6..1
            rl = Text(str(7 - k), font=CJK).scale(0.38)
            rl.move_to(
                grid_origin + LEFT * 0.5 * CELL + UP * (6 - k + 0.5) * CELL
            )
            row_labels.add(rl)

        axis_d1 = Text("骰子①", font=CJK).scale(0.38).set_color(BLUE)
        axis_d1.next_to(row_labels, LEFT, buff=0.08)
        axis_d2 = Text("骰子②", font=CJK).scale(0.38).set_color(BLUE)
        axis_d2.next_to(col_labels, UP, buff=0.06)

        self.play(FadeIn(VGroup(row_labels, col_labels, axis_d1, axis_d2)))
        self.wait(0.2)

        # 创建 36 个小格
        cells = []          # cells[i][j] 对应骰子1=i+1, 骰子2=j+1（0-indexed）
        cell_group = VGroup()
        for i in range(6):         # 骰子1 行：i+1
            row_cells = []
            for j in range(6):    # 骰子2 列：j+1
                c = make_cell(BLUE)
                # 行从上到下对应骰子1 = 6,5,...,1
                c.move_to(
                    grid_origin
                    + RIGHT * (j + 0.5) * CELL
                    + UP * (5 - i + 0.5) * CELL
                )
                row_cells.append(c)
                cell_group.add(c)
            cells.append(row_cells)

        self.play(Create(cell_group, lag_ratio=0.02), run_time=1.8)
        self.wait(0.5)

        # 样本空间标注
        omega_label = MathTex(r"|\Omega| = 36").scale(0.65)
        omega_label.next_to(cell_group, DOWN, buff=0.3)
        self.play(Write(omega_label))
        self.wait(0.6)

        # ── 3. 高亮和为 7 的六个格 ───────────────────────────────────────
        # 和 = 7 的对 (骰子1, 骰子2)：(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)
        # 对应矩阵索引 (i, j) where i = row 0-indexed (骰子1 = i+1 从上到下 i=5..0)
        # 骰子1 值 d1, 骰子2 值 d2, d1+d2=7
        # 行 i: 骰子1 = 6-i (i=0 -> d1=6, i=5 -> d1=1)
        # 列 j: 骰子2 = j+1
        # 条件: (6-i) + (j+1) = 7 => j = i
        highlight_cells = VGroup()
        for diag in range(6):      # i == j == 0..5
            c = cells[diag][diag]
            hc = make_cell(
                fill_color=YELLOW,
                fill_opacity=0.85,
                stroke_color=ORANGE,
                stroke_width=3,
            ).move_to(c.get_center())
            highlight_cells.add(hc)

        event_label = Text(
            "事件 A：点数和 = 7", font=CJK, color=YELLOW
        ).scale(0.48)
        event_label.to_edge(RIGHT).shift(UP * 2.0 + LEFT * 0.3)

        self.play(
            AnimationGroup(
                *[
                    Transform(cells[d][d], highlight_cells[d])
                    for d in range(6)
                ],
                lag_ratio=0.12,
            ),
            run_time=1.5,
        )
        self.play(FadeIn(event_label))
        self.wait(0.6)

        # 标注有利结果数
        favorable = Text("有利结果数 = 6", font=CJK, color=ORANGE).scale(0.48)
        favorable.next_to(event_label, DOWN, buff=0.28)
        self.play(Write(favorable))
        self.wait(0.5)

        # ── 4. 概率公式 ──────────────────────────────────────────────────
        formula_box = Rectangle(
            width=3.4,
            height=2.5,
            color=GREEN,
            stroke_width=2,
        ).set_fill(WHITE, opacity=0.06)
        formula_box.to_edge(RIGHT).shift(UP * 0.0 + LEFT * 0.3)

        formula_title = Text("古典概型公式", font=CJK, color=GREEN).scale(0.44)
        formula_title.move_to(formula_box.get_top() + DOWN * 0.32)

        prob_formula = MathTex(
            r"P(A) = \frac{|A|}{|\Omega|}"
        ).scale(0.82)
        prob_formula.move_to(formula_box.get_center() + UP * 0.35)

        prob_value = MathTex(
            r"= \frac{6}{36} = \frac{1}{6}"
        ).scale(0.82)
        prob_value.next_to(prob_formula, DOWN, buff=0.28)

        self.play(Create(formula_box), Write(formula_title))
        self.play(Write(prob_formula))
        self.wait(0.4)
        self.play(Write(prob_value))
        self.wait(0.8)

        # ── 5. 结论横幅 ──────────────────────────────────────────────────
        conclusion = Text(
            "掷两颗骰子，点数和等于 7 的概率为 1/6",
            font=CJK,
            color=GOLD,
        ).scale(0.46)
        conclusion.to_edge(DOWN, buff=0.32)
        self.play(FadeIn(conclusion))
        self.wait(1.5)

        # ── 6. 淡出收尾 ──────────────────────────────────────────────────
        self.play(
            FadeOut(
                VGroup(
                    title,
                    intro,
                    row_labels,
                    col_labels,
                    axis_d1,
                    axis_d2,
                    cell_group,
                    omega_label,
                    highlight_cells,
                    event_label,
                    favorable,
                    formula_box,
                    formula_title,
                    prob_formula,
                    prob_value,
                    conclusion,
                )
            ),
            run_time=1.2,
        )
        self.wait(0.3)


REGISTER = [
    {
        "scene": "ClassicalProbScene",
        "id": "ch01-1.4-classical",
        "chapterId": "ch01",
        "sectionId": "1.4",
        "title": "古典概型与计数",
        "description": "以掷两颗骰子为例，用 6×6 网格展示 36 个等可能结果，高亮和为 7 的 6 个有利结果，推导 P(A) = 6/36 = 1/6。",
    },
]
