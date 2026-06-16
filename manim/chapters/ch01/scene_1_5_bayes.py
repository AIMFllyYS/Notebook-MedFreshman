"""第 1.5 节 · 全概率公式与贝叶斯公式 —— 树状图 + 面积法直观展示划分与反推。

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
    Arrow,
    Create,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)

CJK = "Microsoft YaHei"


class BayesScene(Scene):
    def construct(self):
        # ── 0. 标题 ────────────────────────────────────────────────
        title = Text("全概率公式 与 贝叶斯公式", font=CJK, weight=BOLD).scale(0.65)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.4)

        # ── 1. 引入划分概念 ────────────────────────────────────────
        partition_hint = Text(
            "设 B₁, B₂, B₃ 是样本空间 Ω 的一个划分", font=CJK
        ).scale(0.5)
        partition_hint.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(partition_hint))
        self.wait(0.6)

        # ── 2. 面积图：把 Ω 划分为三块 ────────────────────────────
        # 整个矩形代表 Ω，宽 7，高 2.8，向下偏移留给后续公式
        rect_y = -0.5
        total_w = 7.0
        h = 2.5

        # 三块宽度比例 0.3 : 0.45 : 0.25
        ws = [total_w * 0.30, total_w * 0.45, total_w * 0.25]
        colors_b = [BLUE_D, GREEN_D, ORANGE]
        labels_b = [r"B_1", r"B_2", r"B_3"]
        prob_b = [r"P(B_1)", r"P(B_2)", r"P(B_3)"]

        x_left = -total_w / 2

        rects_b = VGroup()
        labels_b_mob = VGroup()
        prob_b_mob = VGroup()

        for i, (w, col) in enumerate(zip(ws, colors_b)):
            rect = Rectangle(width=w, height=h, color=col, fill_color=col, fill_opacity=0.22)
            rect.move_to([x_left + w / 2, rect_y, 0])
            lbl = MathTex(labels_b[i], color=col).scale(0.75)
            lbl.move_to(rect.get_center() + UP * 0.5)
            pr = MathTex(prob_b[i], color=col).scale(0.55)
            pr.move_to(rect.get_center() + DOWN * 0.5)
            rects_b.add(rect)
            labels_b_mob.add(lbl)
            prob_b_mob.add(pr)
            x_left += w

        self.play(
            Create(rects_b, lag_ratio=0.25),
            FadeIn(labels_b_mob, lag_ratio=0.25),
        )
        self.wait(0.3)
        self.play(FadeIn(prob_b_mob, lag_ratio=0.2))
        self.wait(0.8)

        # ── 3. 在面积图上叠加事件 A（横条带） ─────────────────────
        # A 是覆盖三块各自一部分的横带；用三段不同透明度矩形表示 A∩Bi
        a_h = h * 0.38
        a_colors = [YELLOW, YELLOW, YELLOW]
        a_fracs = [0.75, 0.50, 0.65]   # A|Bi 的条件概率示意高度比例

        rects_a = VGroup()
        x_left2 = -total_w / 2
        for i, (w, frac) in enumerate(zip(ws, a_fracs)):
            ra = Rectangle(
                width=w, height=h * frac,
                color=YELLOW, fill_color=YELLOW, fill_opacity=0.55,
                stroke_width=1.5
            )
            ra.align_to([x_left2, rect_y - h / 2, 0], LEFT + DOWN)
            rects_a.add(ra)
            x_left2 += w

        event_a_label = Text("事件 A", font=CJK, color=YELLOW, weight=BOLD).scale(0.5)
        event_a_label.move_to([0, rect_y - h / 2 - 0.3, 0])

        self.play(FadeIn(rects_a, lag_ratio=0.2))
        self.play(FadeIn(event_a_label))
        self.wait(0.5)

        cond_labels = VGroup()
        for i, (frac, ra) in enumerate(zip(a_fracs, rects_a)):
            cl = MathTex(rf"P(A|B_{i+1})", color=WHITE).scale(0.45)
            cl.move_to(ra.get_center())
            cond_labels.add(cl)
        self.play(FadeIn(cond_labels, lag_ratio=0.2))
        self.wait(0.9)

        # ── 4. 写出全概率公式 ──────────────────────────────────────
        self.play(FadeOut(VGroup(partition_hint)))
        total_prob_title = Text("全概率公式", font=CJK, color=GOLD, weight=BOLD).scale(0.55)
        total_prob_title.next_to(title, DOWN, buff=0.3)
        self.play(Write(total_prob_title))

        formula_total = MathTex(
            r"P(A) = \sum_{i=1}^{n} P(B_i)\,P(A|B_i)"
        ).scale(0.72)
        formula_total.to_edge(DOWN, buff=0.55)
        self.play(Write(formula_total))
        self.wait(1.2)

        # 高亮三块面积乘以条件概率，对应公式各项
        highlight_hint = Text(
            "每块面积 = P(Bᵢ)·P(A|Bᵢ)，相加得 P(A)",
            font=CJK, color=YELLOW
        ).scale(0.44)
        highlight_hint.next_to(formula_total, UP, buff=0.25)
        self.play(FadeIn(highlight_hint))
        self.wait(1.5)

        # ── 5. 清场，保留公式，准备贝叶斯 ────────────────────────
        self.play(
            FadeOut(VGroup(
                rects_b, labels_b_mob, prob_b_mob,
                rects_a, event_a_label, cond_labels,
                highlight_hint, total_prob_title,
            ))
        )
        self.wait(0.3)

        # formula_total 留在底部，往上稍移作为"已知"
        formula_total_small = MathTex(
            r"P(A) = \sum_{i} P(B_i)\,P(A|B_i)"
        ).scale(0.58)
        formula_total_small.to_edge(DOWN, buff=0.35)
        self.play(Transform(formula_total, formula_total_small))
        self.wait(0.3)

        # ── 6. 贝叶斯「反演」说明 ─────────────────────────────────
        bayes_question = Text(
            "已知 A 发生，Bᵢ 的概率是多少？—— 反推！",
            font=CJK, color=GOLD
        ).scale(0.52)
        bayes_question.next_to(title, DOWN, buff=0.35)
        self.play(Write(bayes_question))
        self.wait(0.8)

        # 树状图：左侧根节点，右侧 B1/B2/B3，再往右 A/Ac
        root_dot_x = -4.0
        branch_y = [0.9, 0.0, -0.9]
        b_colors_tree = [BLUE, GREEN, ORANGE]

        arrows_left = VGroup()
        b_nodes = VGroup()
        b_arrow_labels = VGroup()

        for i, (by, bc) in enumerate(zip(branch_y, b_colors_tree)):
            arr = Arrow(
                start=[root_dot_x, 0.0, 0],
                end=[root_dot_x + 1.9, by, 0],
                color=bc, buff=0.08, stroke_width=2.5, max_tip_length_to_length_ratio=0.18
            )
            bn = MathTex(rf"B_{i+1}", color=bc).scale(0.7).move_to([root_dot_x + 2.1, by, 0])
            bl = MathTex(rf"P(B_{i+1})", color=bc).scale(0.45)
            bl.next_to(arr, UP if by >= 0 else DOWN, buff=0.05)
            arrows_left.add(arr)
            b_nodes.add(bn)
            b_arrow_labels.add(bl)

        self.play(
            Create(arrows_left, lag_ratio=0.3),
            FadeIn(b_nodes, lag_ratio=0.3),
            FadeIn(b_arrow_labels, lag_ratio=0.3),
        )
        self.wait(0.5)

        # 右侧分支 A / Aᶜ
        right_x_start = root_dot_x + 2.3
        right_x_end = right_x_start + 1.8
        a_offsets = [0.28, -0.28]
        a_labels_tex = [r"A", r"A^c"]
        arrows_right = VGroup()
        a_nodes = VGroup()
        cond_tex_labels = VGroup()

        for i, (by, bc) in enumerate(zip(branch_y, b_colors_tree)):
            for j, (ao, al) in enumerate(zip(a_offsets, a_labels_tex)):
                arr2 = Arrow(
                    start=[right_x_start, by, 0],
                    end=[right_x_end, by + ao, 0],
                    color=bc, buff=0.06, stroke_width=2, max_tip_length_to_length_ratio=0.16
                )
                an = MathTex(al, color=WHITE).scale(0.55).move_to([right_x_end + 0.25, by + ao, 0])
                arrows_right.add(arr2)
                a_nodes.add(an)
                if j == 0:
                    cl2 = MathTex(rf"P(A|B_{i+1})", color=bc).scale(0.4)
                    cl2.next_to(arr2, UP if ao > 0 else DOWN, buff=0.04)
                    cond_tex_labels.add(cl2)

        self.play(
            Create(arrows_right, lag_ratio=0.15),
            FadeIn(a_nodes, lag_ratio=0.15),
        )
        self.play(FadeIn(cond_tex_labels, lag_ratio=0.2))
        self.wait(0.8)

        # ── 7. 写出贝叶斯公式 ─────────────────────────────────────
        bayes_formula_title = Text("贝叶斯公式", font=CJK, color=RED, weight=BOLD).scale(0.58)
        bayes_formula_title.to_edge(RIGHT, buff=0.5).shift(UP * 1.9)

        bayes_formula = MathTex(
            r"P(B_i|A) = \frac{P(B_i)\,P(A|B_i)}{\displaystyle\sum_{j} P(B_j)\,P(A|B_j)}"
        ).scale(0.68)
        bayes_formula.next_to(bayes_formula_title, DOWN, buff=0.25)

        self.play(Write(bayes_formula_title))
        self.play(Write(bayes_formula))
        self.wait(1.0)

        # ── 8. 强调分母 = P(A) ────────────────────────────────────
        denom_note_lbl = Text("分母", font=CJK, color=YELLOW).scale(0.52)
        denom_note_tex = MathTex(r"= P(A)", color=YELLOW).scale(0.55)
        denom_note = VGroup(denom_note_lbl, denom_note_tex).arrange(RIGHT, buff=0.15)
        denom_note.next_to(bayes_formula, DOWN, buff=0.3)
        self.play(FadeIn(denom_note))
        self.wait(0.6)

        remind = Text("分母正是全概率公式！", font=CJK, color=YELLOW).scale(0.48)
        remind.next_to(denom_note, DOWN, buff=0.2)
        self.play(FadeIn(remind))
        self.wait(1.5)

        # ── 9. 小结 ───────────────────────────────────────────────
        self.play(
            FadeOut(VGroup(
                arrows_left, b_nodes, b_arrow_labels,
                arrows_right, a_nodes, cond_tex_labels,
                bayes_question, denom_note, remind,
            ))
        )
        self.wait(0.2)

        summary_title = Text("小结", font=CJK, weight=BOLD, color=GOLD).scale(0.58)
        summary_title.next_to(title, DOWN, buff=0.35)

        line1 = Text("全概率：已知原因 → 求结果", font=CJK).scale(0.52)
        line2 = Text("贝叶斯：已知结果 → 反推原因", font=CJK, color=RED).scale(0.52)
        line1.next_to(summary_title, DOWN, buff=0.3)
        line2.next_to(line1, DOWN, buff=0.25)

        self.play(
            Write(summary_title),
            FadeIn(bayes_formula_title),
            FadeIn(bayes_formula),
        )
        self.play(FadeIn(line1))
        self.play(FadeIn(line2))
        self.wait(2.0)

        self.play(
            FadeOut(VGroup(
                title, summary_title,
                line1, line2,
                bayes_formula_title, bayes_formula,
                formula_total,
            ))
        )
        self.wait(0.5)


REGISTER = [
    {
        "scene": "BayesScene",
        "id": "ch01-1.5-bayes",
        "chapterId": "ch01",
        "sectionId": "1.5",
        "title": "全概率与贝叶斯",
        "description": "用面积划分展示全概率公式，再通过树状图反推贝叶斯公式，直观呈现「由因推果」与「由果溯因」。",
    },
]
