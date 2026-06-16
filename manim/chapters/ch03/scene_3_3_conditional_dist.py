"""第 3.3 节 · 条件分布 —— 高亮联合分布热力图某行，归一化后展示条件分布 P(X|Y=y_j)。

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

# ── 联合分布表数据 ──────────────────────────────────────────────
# X 取值 1,2,3；Y 取值 0,1,2
# joint[i][j] = P(Y=i, X=j)   i in {0,1,2}, j in {0,1,2}
JOINT = [
    [0.05, 0.10, 0.05],   # Y=0
    [0.10, 0.20, 0.10],   # Y=1  <- 高亮行
    [0.05, 0.15, 0.20],   # Y=2
]
# P(Y=1) = sum of row Y=1
P_Y1 = sum(JOINT[1])  # = 0.40
# 条件分布 P(X=j | Y=1)
COND = [v / P_Y1 for v in JOINT[1]]


class ConditionalDistScene(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════
        # 幕 1：标题
        # ══════════════════════════════════════════════════════
        title = (
            Text("条件分布：固定一维看另一维", font=CJK, weight=BOLD)
            .scale(0.75)
            .to_edge(UP)
        )
        self.play(Write(title))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════
        # 幕 2：绘制联合分布热力图（3×3 格子）
        # ══════════════════════════════════════════════════════
        subtitle = (
            Text("联合概率分布表 P(X, Y)", font=CJK)
            .scale(0.52)
            .next_to(title, DOWN, buff=0.25)
        )
        self.play(FadeIn(subtitle))

        cell_w, cell_h = 1.55, 0.80
        n_rows, n_cols = 3, 3
        table_origin = LEFT * 2.5 + DOWN * 0.3  # 表格左上角

        # 颜色深浅按概率值映射（简单线性）
        def heat_color(val):
            """越大越深蓝。"""
            alpha = min(val / 0.25, 1.0)
            return BLUE_D if alpha > 0.5 else BLUE

        # 行/列标签
        x_labels = VGroup()
        for j, xv in enumerate(["X=1", "X=2", "X=3"]):
            lbl = Text(xv, font=CJK).scale(0.42)
            lbl.move_to(
                table_origin + RIGHT * ((j + 0.5) * cell_w) + UP * 0.52
            )
            x_labels.add(lbl)

        y_labels = VGroup()
        for i, yv in enumerate(["Y=0", "Y=1", "Y=2"]):
            lbl = Text(yv, font=CJK).scale(0.42)
            lbl.move_to(
                table_origin + DOWN * ((i + 0.5) * cell_h) + LEFT * 0.75
            )
            y_labels.add(lbl)

        self.play(FadeIn(x_labels), FadeIn(y_labels))

        # 格子 + 数值
        cells = VGroup()
        cell_texts = VGroup()
        for i in range(n_rows):
            for j in range(n_cols):
                val = JOINT[i][j]
                rect = Rectangle(
                    width=cell_w - 0.06,
                    height=cell_h - 0.06,
                    color=heat_color(val),
                    fill_color=heat_color(val),
                    fill_opacity=val / 0.22,
                )
                rect.move_to(
                    table_origin
                    + RIGHT * ((j + 0.5) * cell_w)
                    + DOWN * ((i + 0.5) * cell_h)
                )
                cells.add(rect)

                num = MathTex(rf"{val:.2f}").scale(0.50)
                num.move_to(rect.get_center())
                cell_texts.add(num)

        self.play(Create(cells), FadeIn(cell_texts, lag_ratio=0.05))
        self.wait(0.8)

        # ══════════════════════════════════════════════════════
        # 幕 3：高亮 Y=1 那一行
        # ══════════════════════════════════════════════════════
        highlight_row = Text("选中 Y=1 这一行", font=CJK, color=YELLOW).scale(0.50)
        highlight_row.next_to(subtitle, DOWN, buff=0.2)
        self.play(Write(highlight_row))

        # 行索引 i=1 -> cells 3,4,5
        row_rects = VGroup(*[cells[3], cells[4], cells[5]])
        surround = SurroundingRectangle(row_rects, color=YELLOW, buff=0.06, stroke_width=3.5)
        self.play(Create(surround))
        self.wait(0.6)

        # 在右侧显示 P(Y=1)
        p_y1_label = MathTex(r"P(Y=1)=0.40", color=YELLOW).scale(0.60)
        p_y1_label.to_edge(RIGHT).shift(UP * 0.5)
        self.play(FadeIn(p_y1_label))
        self.wait(0.6)

        # ══════════════════════════════════════════════════════
        # 幕 4：解释缩减样本空间概念
        # ══════════════════════════════════════════════════════
        self.play(FadeOut(highlight_row))
        concept = (
            Text("已知 Y=1，样本空间缩减至这一行", font=CJK, color=ORANGE)
            .scale(0.48)
            .next_to(subtitle, DOWN, buff=0.2)
        )
        self.play(Write(concept))

        # 其余行变淡
        other_cells = VGroup(
            *[cells[k] for k in range(9) if k not in [3, 4, 5]],
            *[cell_texts[k] for k in range(9) if k not in [3, 4, 5]],
            *[x_labels[j] for j in range(3)],
            *[y_labels[i] for i in [0, 2]],
        )
        self.play(other_cells.animate.set_opacity(0.18))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════
        # 幕 5：归一化公式
        # ══════════════════════════════════════════════════════
        formula = MathTex(
            r"P(X=x_j \mid Y=1) = \frac{P(X=x_j,\, Y=1)}{P(Y=1)}"
        ).scale(0.58)
        formula.to_edge(RIGHT).shift(DOWN * 0.6)
        self.play(FadeIn(formula))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════
        # 幕 6：把高亮行「弹出」成条形图（条件分布）
        # ══════════════════════════════════════════════════════
        self.play(FadeOut(concept), FadeOut(formula), FadeOut(p_y1_label))

        # 同时淡出整个热力图，腾出空间
        all_heat = VGroup(
            cells, cell_texts, x_labels, y_labels, surround
        )
        self.play(all_heat.animate.shift(LEFT * 2.5).scale(0.72).set_opacity(0.30))
        self.wait(0.3)

        bar_label = (
            Text("条件分布  P(X | Y=1)", font=CJK, weight=BOLD, color=GREEN)
            .scale(0.60)
            .next_to(subtitle, DOWN, buff=0.25)
        )
        self.play(Write(bar_label))

        # 条形图位置
        bar_origin = RIGHT * 1.2 + DOWN * 1.8  # 左下角基准
        bar_width = 0.90
        max_height = 2.8

        bars = VGroup()
        bar_nums = VGroup()
        bar_x_labels = VGroup()
        for j, (prob, xv) in enumerate(zip(COND, ["X=1", "X=2", "X=3"])):
            bh = prob * max_height / max(COND)
            bar = Rectangle(
                width=bar_width,
                height=bh,
                color=GREEN,
                fill_color=GREEN,
                fill_opacity=0.75,
            )
            bar.align_to(bar_origin + RIGHT * j * (bar_width + 0.40), LEFT)
            bar.shift(UP * 0)   # 底部对齐 bar_origin
            # 底部对齐
            bar.move_to(
                bar_origin
                + RIGHT * (j * (bar_width + 0.40) + bar_width / 2)
                + UP * (bh / 2)
            )
            bars.add(bar)

            num = MathTex(rf"{prob:.2f}", color=WHITE).scale(0.50)
            num.next_to(bar, UP, buff=0.08)
            bar_nums.add(num)

            xl = Text(xv, font=CJK).scale(0.42)
            xl.next_to(bar, DOWN, buff=0.12)
            bar_x_labels.add(xl)

        self.play(Create(bars, lag_ratio=0.2), run_time=1.2)
        self.play(FadeIn(bar_nums), FadeIn(bar_x_labels))
        self.wait(0.8)

        # 验证 sum = 1
        sum_note = MathTex(
            r"\sum_{j} P(X=x_j \mid Y=1) = 1", color=GOLD
        ).scale(0.55)
        sum_note.next_to(bars, DOWN, buff=0.45)
        self.play(FadeIn(sum_note))
        self.wait(0.7)

        # 从联合分布热力图画箭头指向条件分布
        arrow = Arrow(
            start=all_heat.get_right(),
            end=bars.get_left() + LEFT * 0.15,
            color=YELLOW,
            buff=0.12,
        )
        arrow_text = (
            Text("归一化", font=CJK, color=YELLOW).scale(0.44).next_to(arrow, UP, buff=0.05)
        )
        self.play(Create(arrow), Write(arrow_text))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════
        # 幕 7：结尾强调
        # ══════════════════════════════════════════════════════
        self.play(
            FadeOut(VGroup(all_heat, arrow, arrow_text, sum_note, bar_x_labels, bar_nums))
        )
        closing = (
            Text("条件分布 = 在缩减样本空间内重新分配概率", font=CJK, color=YELLOW)
            .scale(0.54)
            .next_to(bars, DOWN, buff=0.55)
        )
        self.play(
            bars.animate.shift(UP * 0.4),
            Write(closing),
        )
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, subtitle, bar_label, bars, closing)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "ConditionalDistScene",
        "id": "ch03-3.3-conditional-dist",
        "chapterId": "ch03",
        "sectionId": "3.3",
        "title": "条件分布：固定一维看另一维",
        "description": "高亮联合分布热力图的 Y=1 行，归一化后动画弹出条形图展示条件分布 P(X|Y=1) 的形成过程。",
    },
]
