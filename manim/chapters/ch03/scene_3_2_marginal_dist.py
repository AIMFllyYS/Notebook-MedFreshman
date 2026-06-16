"""第 3.2 节 · 边缘分布 —— 联合分布表格逐行/列「折叠汇总」得到边缘分布律。

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
    GREEN_D,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    AnimationGroup,
    Arrow,
    Create,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"

# 联合分布表格数据 P(X=xi, Y=yj)
#         Y=1     Y=2     Y=3
# X=1     1/12    2/12    1/12
# X=2     2/12    3/12    1/12
# X=3     0/12    1/12    1/12

JOINT = [
    ["1/12", "2/12", "1/12"],
    ["2/12", "3/12", "1/12"],
    ["0",    "1/12", "1/12"],
]

# 边缘分布
MARGIN_X = ["4/12", "6/12", "2/12"]   # 行求和 → P(X=xi)
MARGIN_Y = ["3/12", "6/12", "3/12"]   # 列求和 → P(Y=yj)


def make_cell(text_str, width=1.5, height=0.7, bg_color=BLUE_D, opacity=0.12,
              text_scale=0.45, is_math=False):
    """创建一个带背景矩形的表格单元。"""
    rect = Rectangle(width=width, height=height, color=BLUE_D, stroke_width=1.5)
    rect.set_fill(bg_color, opacity=opacity)
    if is_math:
        label = MathTex(r"" + text_str).scale(text_scale)
    else:
        label = Text(text_str, font=CJK).scale(text_scale)
    label.move_to(rect.get_center())
    return VGroup(rect, label)


class MarginalDistScene(Scene):
    def construct(self):
        # ── 阶段 0：标题 ─────────────────────────────────────────
        title = Text("边缘分布：从联合到单个", font=CJK, weight=BOLD).scale(0.65)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.4)

        # ── 阶段 1：构建联合分布表格 ──────────────────────────────
        subtitle1 = Text("联合分布律", font=CJK, color=GOLD).scale(0.5)
        subtitle1.next_to(title, DOWN, buff=0.25)
        self.play(FadeIn(subtitle1))

        cell_w, cell_h = 1.5, 0.62
        table_origin = LEFT * 2.5 + DOWN * 0.2

        # 表头行：Y=1, Y=2, Y=3
        header_row = VGroup()
        corner_cell = make_cell("X \\ Y", cell_w, cell_h, opacity=0.0, text_scale=0.4)
        corner_cell.move_to(table_origin)
        header_row.add(corner_cell)
        y_labels = ["Y=1", "Y=2", "Y=3"]
        for j, lbl in enumerate(y_labels):
            c = make_cell(lbl, cell_w, cell_h, bg_color=GREEN_D, opacity=0.15,
                          text_scale=0.4)
            c.move_to(table_origin + RIGHT * (j + 1) * cell_w)
            header_row.add(c)

        # 表头列：X=1, X=2, X=3
        x_header_cells = VGroup()
        x_labels = ["X=1", "X=2", "X=3"]
        for i, lbl in enumerate(x_labels):
            c = make_cell(lbl, cell_w, cell_h, bg_color=GREEN_D, opacity=0.15,
                          text_scale=0.4)
            c.move_to(table_origin + DOWN * (i + 1) * cell_h)
            x_header_cells.add(c)

        # 数据单元格
        data_cells = []
        for i in range(3):
            row_cells = []
            for j in range(3):
                c = make_cell(JOINT[i][j], cell_w, cell_h, opacity=0.10,
                              text_scale=0.42, is_math=True)
                c.move_to(
                    table_origin
                    + RIGHT * (j + 1) * cell_w
                    + DOWN * (i + 1) * cell_h
                )
                row_cells.append(c)
            data_cells.append(row_cells)

        # 淡入表格
        self.play(FadeIn(header_row), FadeIn(x_header_cells))
        for row in data_cells:
            self.play(AnimationGroup(*[FadeIn(c) for c in row], lag_ratio=0.1))
        self.wait(0.5)

        # ── 阶段 2：高亮各列 → 列求和 → 边缘 P(Y=yj) ────────────
        margin_y_label = Text("P(Y=yj)", font=CJK, color=YELLOW).scale(0.42)
        margin_y_label.move_to(
            table_origin + RIGHT * 4 * cell_w + DOWN * 0
        ).shift(DOWN * cell_h * 0.5)

        hint2 = Text("对每列求和，得到 Y 的边缘分布", font=CJK, color=YELLOW).scale(0.4)
        hint2.to_edge(DOWN, buff=0.5)
        self.play(Write(hint2))

        margin_y_cells = []
        for j in range(3):
            # 高亮该列
            col_highlights = VGroup(*[
                SurroundingRectangle(data_cells[i][j], color=YELLOW, buff=0.04)
                for i in range(3)
            ])
            self.play(Create(col_highlights), run_time=0.5)

            # 箭头指向右侧边缘位置
            arrow_target = (
                table_origin
                + RIGHT * (j + 1) * cell_w
                + DOWN * 4 * cell_h
            )
            sum_cell = make_cell(
                MARGIN_Y[j], cell_w, cell_h,
                bg_color=YELLOW, opacity=0.22,
                text_scale=0.42, is_math=True
            )
            sum_cell.move_to(
                table_origin + RIGHT * (j + 1) * cell_w + DOWN * 4 * cell_h
            )

            down_arrow = Arrow(
                start=data_cells[2][j].get_bottom() + DOWN * 0.05,
                end=sum_cell.get_top() + UP * 0.05,
                buff=0.0,
                color=YELLOW,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.15,
            )
            self.play(Create(down_arrow), run_time=0.4)
            self.play(FadeIn(sum_cell), run_time=0.4)
            self.play(FadeOut(col_highlights), FadeOut(down_arrow), run_time=0.3)
            margin_y_cells.append(sum_cell)

        # 标签行
        py_label_cell = make_cell("P(Y=yj)", cell_w, cell_h, bg_color=YELLOW,
                                  opacity=0.0, text_scale=0.36)
        py_label_cell.move_to(table_origin + DOWN * 4 * cell_h)
        self.play(FadeIn(py_label_cell))
        self.wait(0.6)
        self.play(FadeOut(hint2))

        # ── 阶段 3：高亮各行 → 行求和 → 边缘 P(X=xi) ────────────
        hint3 = Text("对每行求和，得到 X 的边缘分布", font=CJK, color=ORANGE).scale(0.4)
        hint3.to_edge(DOWN, buff=0.5)
        self.play(Write(hint3))

        margin_x_cells = []
        for i in range(3):
            row_highlights = VGroup(*[
                SurroundingRectangle(data_cells[i][j], color=ORANGE, buff=0.04)
                for j in range(3)
            ])
            self.play(Create(row_highlights), run_time=0.5)

            sum_cell_x = make_cell(
                MARGIN_X[i], cell_w, cell_h,
                bg_color=ORANGE, opacity=0.22,
                text_scale=0.42, is_math=True
            )
            sum_cell_x.move_to(
                table_origin + RIGHT * 4 * cell_w + DOWN * (i + 1) * cell_h
            )

            right_arrow = Arrow(
                start=data_cells[i][2].get_right() + RIGHT * 0.05,
                end=sum_cell_x.get_left() + LEFT * 0.05,
                buff=0.0,
                color=ORANGE,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.15,
            )
            self.play(Create(right_arrow), run_time=0.4)
            self.play(FadeIn(sum_cell_x), run_time=0.4)
            self.play(FadeOut(row_highlights), FadeOut(right_arrow), run_time=0.3)
            margin_x_cells.append(sum_cell_x)

        # 右侧列标签
        px_label_cell = make_cell("P(X=xi)", cell_w, cell_h, bg_color=ORANGE,
                                  opacity=0.0, text_scale=0.36)
        px_label_cell.move_to(table_origin + RIGHT * 4 * cell_w)
        self.play(FadeIn(px_label_cell))
        self.wait(0.6)
        self.play(FadeOut(hint3))

        # ── 阶段 4：淡出表格，展示边缘分布律公式 ─────────────────
        all_table = VGroup(
            header_row, x_header_cells,
            *[c for row in data_cells for c in row],
            *margin_y_cells, py_label_cell,
            *margin_x_cells, px_label_cell,
        )
        self.play(FadeOut(all_table), FadeOut(subtitle1))

        # 边缘分布公式
        formula_title_x = Text("X 的边缘分布律", font=CJK, color=ORANGE, weight=BOLD).scale(0.52)
        formula_title_x.move_to(LEFT * 3 + UP * 1.2)
        self.play(Write(formula_title_x))

        fx_formula = MathTex(
            r"p_{i\cdot} = P(X=x_i) = \sum_{j} p_{ij}"
        ).scale(0.6)
        fx_formula.next_to(formula_title_x, DOWN, buff=0.3)
        self.play(Write(fx_formula))

        formula_title_y = Text("Y 的边缘分布律", font=CJK, color=YELLOW, weight=BOLD).scale(0.52)
        formula_title_y.move_to(RIGHT * 2.5 + UP * 1.2)
        self.play(Write(formula_title_y))

        fy_formula = MathTex(
            r"p_{\cdot j} = P(Y=y_j) = \sum_{i} p_{ij}"
        ).scale(0.6)
        fy_formula.next_to(formula_title_y, DOWN, buff=0.3)
        self.play(Write(fy_formula))

        # 小结文字
        summary = Text("边缘分布 = 联合分布对另一变量求和（积分）", font=CJK).scale(0.42)
        summary.to_edge(DOWN, buff=0.7)
        self.play(FadeIn(summary))
        self.wait(1.2)

        # ── 阶段 5：连续型直觉 —— 积分阴影 ───────────────────────
        self.play(FadeOut(VGroup(formula_title_x, fx_formula,
                                  formula_title_y, fy_formula, summary)))

        cont_title = Text("连续型：对另一变量积分", font=CJK, color=BLUE, weight=BOLD).scale(0.52)
        cont_title.to_edge(UP, buff=0.9).shift(DOWN * 0.3)
        self.play(Write(cont_title))

        cont_formula = MathTex(
            r"f_X(x) = \int_{-\infty}^{+\infty} f(x,\,y)\,dy"
        ).scale(0.7)
        cont_formula.next_to(cont_title, DOWN, buff=0.5)
        self.play(Write(cont_formula))

        cont_hint = Text("将联合密度沿 y 方向「压扁」，得到 X 的边缘密度", font=CJK).scale(0.4)
        cont_hint.next_to(cont_formula, DOWN, buff=0.45)
        self.play(FadeIn(cont_hint))
        self.wait(1.5)

        # ── 尾声：淡出 ───────────────────────────────────────────
        self.play(FadeOut(VGroup(title, cont_title, cont_formula, cont_hint)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "MarginalDistScene",
        "id": "ch03-3.2-marginal-dist",
        "chapterId": "ch03",
        "sectionId": "3.2",
        "title": "边缘分布：从联合到单个",
        "description": "通过 3×3 联合分布表格的逐列、逐行汇总动画，展示边缘分布律的计算过程及连续型的积分直觉。",
    },
]
