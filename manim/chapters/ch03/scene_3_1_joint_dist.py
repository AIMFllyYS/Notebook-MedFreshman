"""第 3.1 节 · 二维随机变量与联合分布

用离散竖条图展示联合分布律 p(xi, yj)，
再转换为热力图颜色编码，最后演示联合分布函数
F(x,y) = sum_{xi<=x, yj<=y} p_{ij} 的「左下角求和」动画。

中文文字用 Text（依赖系统 CJK 字体 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX / MiKTeX）。
"""

from manim import (
    BLUE,
    BLUE_D,
    BLUE_E,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    ORIGIN,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
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

# ---------------------------------------------------------------------------
# 联合分布律数据：X in {1,2,3}, Y in {1,2,3}
# p[i][j] = P(X=i+1, Y=j+1)，i,j 从 0 起
# ---------------------------------------------------------------------------
P_DATA = [
    [0.05, 0.10, 0.05],
    [0.10, 0.20, 0.10],
    [0.05, 0.10, 0.25],
]
X_VALS = [1, 2, 3]
Y_VALS = [1, 2, 3]

# 颜色插值：蓝（低）→ 黄（高）
def prob_color(p: float, p_max: float = 0.25):
    t = p / p_max
    r = t
    g = t * 0.8
    b = 1.0 - t * 0.7
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


class JointDistScene(Scene):
    def construct(self):
        # ===================================================================
        # 幕一：标题
        # ===================================================================
        title = (
            Text("二维随机变量与联合分布", font=CJK, weight=BOLD)
            .scale(0.72)
            .to_edge(UP)
        )
        subtitle = (
            Text("离散型联合分布律  p(x_i, y_j)", font=CJK)
            .scale(0.48)
            .next_to(title, DOWN, buff=0.18)
        )
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.5)

        # ===================================================================
        # 幕二：联合分布律表格（3×3 网格）
        # ===================================================================
        table_title = (
            Text("联合概率表", font=CJK)
            .scale(0.52)
            .move_to(UP * 1.6)
        )

        cell_w, cell_h = 1.15, 0.72
        origin_x, origin_y = -1.6, 0.6

        # 表头行：Y=1,2,3
        header_y = VGroup()
        row_labels = VGroup()
        cells = VGroup()
        cell_rects = []
        cell_texts = []

        # 角标签
        corner = (
            Text("X \\ Y", font=CJK)
            .scale(0.38)
            .move_to([origin_x - cell_w, origin_y + cell_h, 0])
        )

        for j, yv in enumerate(Y_VALS):
            lbl = MathTex(rf"y={yv}").scale(0.45).move_to(
                [origin_x + j * cell_w, origin_y + cell_h, 0]
            )
            header_y.add(lbl)

        for i, xv in enumerate(X_VALS):
            lbl = MathTex(rf"x={xv}").scale(0.45).move_to(
                [origin_x - cell_w, origin_y - i * cell_h, 0]
            )
            row_labels.add(lbl)

        for i in range(3):
            for j in range(3):
                p = P_DATA[i][j]
                rect = Rectangle(
                    width=cell_w - 0.06,
                    height=cell_h - 0.06,
                    stroke_color=BLUE_D,
                    stroke_width=1.5,
                    fill_color=BLUE_E,
                    fill_opacity=0.15,
                ).move_to([origin_x + j * cell_w, origin_y - i * cell_h, 0])
                txt = Text(f"{p:.2f}", font="Courier New").scale(0.38).move_to(rect.get_center())
                cell_rects.append(rect)
                cell_texts.append(txt)
                cells.add(VGroup(rect, txt))

        self.play(FadeOut(subtitle))
        self.play(Write(table_title))
        self.play(FadeIn(corner), FadeIn(header_y), FadeIn(row_labels))
        self.play(Create(cells, lag_ratio=0.06))
        self.wait(0.8)

        # 公式注释
        formula_pij = MathTex(
            r"p_{ij} = P(X = x_i,\; Y = y_j)"
        ).scale(0.52).move_to(DOWN * 2.5)
        self.play(Write(formula_pij))
        self.wait(1.0)

        # ===================================================================
        # 幕三：高亮最大概率单元格 p(3,3)=0.25
        # ===================================================================
        max_idx = 2 * 3 + 2  # i=2, j=2
        highlight = SurroundingRectangle(
            cell_rects[max_idx], color=YELLOW, stroke_width=3, buff=0.05
        )
        hl_label = (
            Text("最大概率 0.25", font=CJK, color=YELLOW)
            .scale(0.42)
            .next_to(highlight, RIGHT, buff=0.25)
        )
        self.play(Create(highlight), Write(hl_label))
        self.wait(0.8)
        self.play(FadeOut(highlight), FadeOut(hl_label))

        # ===================================================================
        # 幕四：热力图颜色变换（将单元格填充为概率对应颜色）
        # ===================================================================
        heatmap_title = (
            Text("热力图颜色编码（越亮概率越大）", font=CJK)
            .scale(0.46)
            .move_to(DOWN * 2.5)
        )
        self.play(Transform(formula_pij, heatmap_title))

        new_rects = VGroup()
        for idx, rect in enumerate(cell_rects):
            i, j = divmod(idx, 3)
            p = P_DATA[i][j]
            new_rect = Rectangle(
                width=cell_w - 0.06,
                height=cell_h - 0.06,
                stroke_color=WHITE,
                stroke_width=1.0,
                fill_color=prob_color(p),
                fill_opacity=0.85,
            ).move_to(rect.get_center())
            new_rects.add(new_rect)

        self.play(Transform(
            VGroup(*cell_rects), new_rects
        ), run_time=1.2)
        self.wait(1.0)

        # ===================================================================
        # 幕五：清场，准备演示联合分布函数 F(x,y)
        # ===================================================================
        all_table = VGroup(
            table_title, corner, header_y, row_labels, cells,
            formula_pij, VGroup(*cell_rects)
        )
        self.play(FadeOut(all_table))
        self.wait(0.3)

        # ===================================================================
        # 幕六：联合分布函数 F(x,y) 定义
        # ===================================================================
        cdf_title = (
            Text("联合分布函数  F(x,y)", font=CJK, weight=BOLD)
            .scale(0.62)
            .to_edge(UP)
        )
        self.play(Write(cdf_title))

        cdf_def = MathTex(
            r"F(x,y) = P(X \le x,\; Y \le y)"
            r" = \!\!\sum_{x_i \le x,\, y_j \le y}\!\! p_{ij}"
        ).scale(0.56).move_to(UP * 1.6)
        self.play(Write(cdf_def))
        self.wait(0.6)

        hint = (
            Text("即：左下角所有格子的概率之和", font=CJK, color=GOLD)
            .scale(0.46)
            .next_to(cdf_def, DOWN, buff=0.25)
        )
        self.play(FadeIn(hint))
        self.wait(0.5)

        # ===================================================================
        # 幕七：用网格演示 F(2,2) 的「左下角求和」
        # ===================================================================
        grid_title = (
            Text("示例：F(2,2) = ?", font=CJK)
            .scale(0.52)
            .move_to(DOWN * 0.1)
        )
        self.play(Write(grid_title))

        # 重新绘制 3×3 格子（紧凑版，居中偏下）
        g_origin_x, g_origin_y = -1.1, -1.0
        g_cell_w, g_cell_h = 0.95, 0.60

        grid_rects = []
        grid_txts = []
        grid_group = VGroup()

        for i in range(3):
            for j in range(3):
                p = P_DATA[i][j]
                rect = Rectangle(
                    width=g_cell_w - 0.05,
                    height=g_cell_h - 0.05,
                    stroke_color=BLUE_D,
                    stroke_width=1.2,
                    fill_color=BLUE_E,
                    fill_opacity=0.12,
                ).move_to([g_origin_x + j * g_cell_w, g_origin_y - i * g_cell_h, 0])
                txt = Text(f"{p:.2f}", font="Courier New").scale(0.32).move_to(rect.get_center())
                grid_rects.append(rect)
                grid_txts.append(txt)
                grid_group.add(rect, txt)

        # 行/列标签
        glabels = VGroup()
        for j, yv in enumerate(Y_VALS):
            glabels.add(
                MathTex(rf"y\!=\!{yv}").scale(0.36).move_to(
                    [g_origin_x + j * g_cell_w, g_origin_y + g_cell_h * 0.8, 0]
                )
            )
        for i, xv in enumerate(X_VALS):
            glabels.add(
                MathTex(rf"x\!=\!{xv}").scale(0.36).move_to(
                    [g_origin_x - g_cell_w * 0.8, g_origin_y - i * g_cell_h, 0]
                )
            )

        self.play(FadeIn(glabels), Create(grid_group, lag_ratio=0.04))
        self.wait(0.4)

        # 高亮 x<=2, y<=2 的单元格 (i<2, j<2) => indices 0,1,3,4
        sum_indices = [i * 3 + j for i in range(2) for j in range(2)]  # i,j<2
        highlight_rects = VGroup()
        for idx in sum_indices:
            hr = SurroundingRectangle(
                grid_rects[idx], color=GREEN_D, stroke_width=2.8, buff=0.04
            )
            highlight_rects.add(hr)

        sum_val = sum(P_DATA[i][j] for i in range(2) for j in range(2))

        self.play(Create(highlight_rects))
        self.wait(0.5)

        sum_label = MathTex(
            rf"F(2,2) = {sum_val:.2f}"
        ).scale(0.56).move_to([2.5, g_origin_y - 0.3, 0])
        self.play(Write(sum_label))
        self.wait(1.0)

        # 箭头说明方向
        direction_txt = (
            Text("X ≤ 2  且  Y ≤ 2 的所有 p_{ij}", font=CJK, color=GREEN)
            .scale(0.40)
            .next_to(sum_label, DOWN, buff=0.2)
        )
        self.play(FadeIn(direction_txt))
        self.wait(1.0)

        # ===================================================================
        # 幕八：完整 F 值对比
        # ===================================================================
        fxy_group = VGroup(
            MathTex(r"F(1,1)=" + f"{P_DATA[0][0]:.2f}").scale(0.46),
            MathTex(r"F(2,2)=" + f"{sum_val:.2f}").scale(0.46),
            MathTex(r"F(3,3)=1.00").scale(0.46),
        ).arrange(DOWN, buff=0.22).move_to([3.0, 0.3, 0])

        fxy_title = Text("部分 F 值", font=CJK).scale(0.44).next_to(fxy_group, UP, buff=0.2)
        self.play(
            FadeOut(VGroup(sum_label, direction_txt)),
            FadeIn(fxy_title),
            FadeIn(fxy_group, lag_ratio=0.3),
        )
        self.wait(1.2)

        # ===================================================================
        # 幕九：性质小结
        # ===================================================================
        all_scene = VGroup(
            cdf_title, cdf_def, hint, grid_title, grid_group, glabels,
            highlight_rects, fxy_title, fxy_group
        )
        self.play(FadeOut(all_scene))

        prop_title = (
            Text("联合分布函数的基本性质", font=CJK, weight=BOLD)
            .scale(0.60)
            .to_edge(UP)
        )
        prop2_math = MathTex(r"2.\quad F(x,y)").scale(0.50)
        prop2_text = Text("关于 x 与 y 单调不减", font=CJK).scale(0.44)
        prop2 = VGroup(prop2_math, prop2_text).arrange(RIGHT, buff=0.15)

        prop4_math = MathTex(r"4.\quad F(x,y)").scale(0.50)
        prop4_text = Text("右连续", font=CJK).scale(0.44)
        prop4 = VGroup(prop4_math, prop4_text).arrange(RIGHT, buff=0.15)

        props = VGroup(
            MathTex(r"1.\quad 0 \le F(x,y) \le 1").scale(0.50),
            prop2,
            MathTex(r"3.\quad F(+\infty,+\infty)=1,\quad F(-\infty,y)=F(x,-\infty)=0").scale(0.48),
            prop4,
        ).arrange(DOWN, buff=0.40, aligned_edge=LEFT).move_to(ORIGIN + DOWN * 0.3)

        self.play(Write(prop_title))
        for prop in props:
            self.play(FadeIn(prop, shift=RIGHT * 0.3))
            self.wait(0.35)
        self.wait(1.0)

        # ===================================================================
        # 幕十：结束语
        # ===================================================================
        end_msg = (
            Text("掌握联合分布律，是理解多维随机变量的起点", font=CJK, color=GOLD)
            .scale(0.50)
            .to_edge(DOWN, buff=0.55)
        )
        self.play(FadeIn(end_msg))
        self.wait(1.5)
        self.play(FadeOut(VGroup(prop_title, props, end_msg)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "JointDistScene",
        "id": "ch03-3.1-joint-dist",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "二维随机变量与联合分布",
        "description": "通过离散联合分布律表格、热力图与左下角求和动画，直观呈现联合分布函数 F(x,y) 的含义与性质。",
    },
]
