"""第 1.6 节 · 事件的独立性 —— 单位正方形面积直观 P(AB)=P(A)P(B)，及串/并联可靠性。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    FadeIn,
    FadeOut,
    GREEN,
    GREEN_D,
    LEFT,
    MathTex,
    ORANGE,
    RED,
    RIGHT,
    Rectangle,
    Scene,
    Text,
    UP,
    VGroup,
    WHITE,
    YELLOW,
    Write,
    Arrow,
    Line,
    Create,
    Indicate,
    Transform,
    Brace,
    DashedLine,
)
from manim import config  # noqa: F401 – used implicitly by Scene

CJK = "Microsoft YaHei"


class IndependenceScene(Scene):
    def construct(self):
        # ------------------------------------------------------------------ #
        # 0. 标题                                                              #
        # ------------------------------------------------------------------ #
        title = Text("事件的独立性", font=CJK, weight=BOLD).scale(0.75).to_edge(UP)
        subtitle = (
            Text("P(AB) = P(A)·P(B)", font=CJK)
            .scale(0.45)
            .set_color(BLUE)
            .next_to(title, DOWN, buff=0.12)
        )
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.4)

        # ------------------------------------------------------------------ #
        # 1. 单位正方形：A 独立于 B                                            #
        # ------------------------------------------------------------------ #
        intro = (
            Text("直觉：用单位正方形面积理解独立", font=CJK)
            .scale(0.48)
            .to_edge(LEFT)
            .shift(UP * 1.6)
        )
        self.play(FadeIn(intro))

        sq_side = 3.5
        square = (
            Rectangle(width=sq_side, height=sq_side, color=WHITE, stroke_width=2)
            .shift(LEFT * 2.0 + DOWN * 0.5)
        )
        sq_label = MathTex(r"\Omega").scale(0.7).next_to(square, UP + LEFT, buff=0.1)
        self.play(Create(square), FadeIn(sq_label))

        # 事件 A：水平条带（x 方向宽度占 P(A)）
        pa = 0.6  # P(A) = 0.6
        strip_a = (
            Rectangle(
                width=sq_side * pa,
                height=sq_side,
                color=BLUE,
                stroke_width=0,
            )
            .set_fill(BLUE, opacity=0.30)
            .align_to(square, LEFT + DOWN)
        )
        brace_a = Brace(strip_a, DOWN, color=BLUE)
        brace_a_label = MathTex(r"P(A)=0.6", color=BLUE).scale(0.52)
        brace_a_label.next_to(brace_a, DOWN, buff=0.10)

        label_a = Text("A", font=CJK, color=BLUE).scale(0.55).move_to(strip_a)
        self.play(FadeIn(strip_a), FadeIn(brace_a), FadeIn(brace_a_label), FadeIn(label_a))
        self.wait(0.4)

        # 事件 B：垂直条带（y 方向高度占 P(B)）
        pb = 0.5  # P(B) = 0.5
        strip_b = (
            Rectangle(
                width=sq_side,
                height=sq_side * pb,
                color=GREEN,
                stroke_width=0,
            )
            .set_fill(GREEN, opacity=0.30)
            .align_to(square, LEFT + DOWN)
        )
        brace_b = Brace(strip_b, RIGHT, color=GREEN)
        brace_b_label = MathTex(r"P(B)=0.5", color=GREEN).scale(0.52)
        brace_b_label.next_to(brace_b, RIGHT, buff=0.10)

        label_b = Text("B", font=CJK, color=GREEN).scale(0.55).move_to(strip_b.get_right() + LEFT * 0.4)
        self.play(FadeIn(strip_b), FadeIn(brace_b), FadeIn(brace_b_label), FadeIn(label_b))
        self.wait(0.4)

        # 交集 AB：小矩形
        ab_rect = (
            Rectangle(
                width=sq_side * pa,
                height=sq_side * pb,
                color=YELLOW,
                stroke_width=2,
            )
            .set_fill(YELLOW, opacity=0.55)
            .align_to(square, LEFT + DOWN)
        )
        ab_label = MathTex(r"AB", color=YELLOW).scale(0.55).move_to(ab_rect)
        self.play(Create(ab_rect), FadeIn(ab_label))
        self.wait(0.3)

        # 独立时公式
        indep_tex = MathTex(
            r"P(AB) = P(A) \times P(B) = 0.6 \times 0.5 = 0.3",
            color=YELLOW,
        ).scale(0.50)
        indep_tex.to_edge(RIGHT).shift(UP * 1.8)
        self.play(Write(indep_tex))
        self.play(Indicate(ab_rect, color=YELLOW, scale_factor=1.08))
        self.wait(0.8)

        # ------------------------------------------------------------------ #
        # 2. 对比：不独立（条件概率不等于无条件概率）                           #
        # ------------------------------------------------------------------ #
        note_indep = (
            Text("独立：知道 B 发生不改变 A 的概率", font=CJK, color=BLUE_D)
            .scale(0.42)
            .to_edge(RIGHT)
            .shift(UP * 1.05)
        )
        self.play(FadeIn(note_indep))
        self.wait(0.5)

        note_dep = (
            Text("不独立：P(A|B) ≠ P(A)", font=CJK, color=RED)
            .scale(0.42)
            .to_edge(RIGHT)
            .shift(UP * 0.50)
        )
        self.play(FadeIn(note_dep))

        def_tex_formula = MathTex(
            r"P(A \mid B) = \frac{P(AB)}{P(B)} \neq P(A)",
        ).scale(0.46)
        def_tex_note = Text("→ 不独立", font=CJK).scale(0.40).set_color(RED)
        def_tex = VGroup(def_tex_formula, def_tex_note).arrange(RIGHT, buff=0.15)
        def_tex.to_edge(RIGHT).shift(DOWN * 0.05)
        self.play(Write(def_tex_formula), FadeIn(def_tex_note))
        self.wait(1.0)

        # 淡出面积图，准备第二部分
        area_group = VGroup(
            square, sq_label, strip_a, brace_a, brace_a_label, label_a,
            strip_b, brace_b, brace_b_label, label_b,
            ab_rect, ab_label,
        )
        side_group = VGroup(indep_tex, note_indep, note_dep, def_tex)
        self.play(FadeOut(area_group), FadeOut(side_group), FadeOut(intro), FadeOut(subtitle))
        self.wait(0.3)

        # ------------------------------------------------------------------ #
        # 3. 独立性定义（正式）                                                 #
        # ------------------------------------------------------------------ #
        def_title = Text("独立性：正式定义", font=CJK, weight=BOLD).scale(0.62).to_edge(UP).shift(DOWN * 0.1)
        self.play(Transform(title, def_title))

        defn = MathTex(
            r"A,\,B \text{ indep.} \iff P(AB) = P(A)\,P(B)",
        ).scale(0.65).shift(UP * 1.4)
        box = defn.copy().set_color(YELLOW)
        self.play(Write(defn))
        self.play(Indicate(defn, color=YELLOW))
        self.wait(0.5)

        prop1 = MathTex(
            r"\Leftrightarrow P(A \mid B) = P(A)\quad (P(B)>0)",
        ).scale(0.52).next_to(defn, DOWN, buff=0.45)
        prop2 = MathTex(
            r"A,B \text{ indep.} \Rightarrow A,\bar{B};\;\bar{A},B;\;\bar{A},\bar{B} \text{ also indep.}",
        ).scale(0.52).next_to(prop1, DOWN, buff=0.35)
        self.play(FadeIn(prop1))
        self.play(FadeIn(prop2))
        self.wait(0.8)

        # ------------------------------------------------------------------ #
        # 4. 串联系统可靠性                                                    #
        # ------------------------------------------------------------------ #
        self.play(FadeOut(VGroup(defn, prop1, prop2)))

        sys_title = Text("串联系统可靠性", font=CJK, weight=BOLD).scale(0.58).to_edge(UP).shift(DOWN * 0.1)
        self.play(Transform(title, sys_title))

        series_hint = (
            Text("每个元件独立工作，全部正常系统才正常", font=CJK)
            .scale(0.44)
            .shift(UP * 2.0)
        )
        self.play(FadeIn(series_hint))

        # 画串联示意图：→ [C1] → [C2] → [C3] →
        def make_component(label_str: str, color=BLUE_D) -> VGroup:
            box_c = Rectangle(width=1.0, height=0.6, color=color, stroke_width=2)
            txt_c = Text(label_str, font=CJK, color=color).scale(0.42).move_to(box_c)
            return VGroup(box_c, txt_c)

        c1 = make_component("C₁").shift(LEFT * 3.2 + UP * 0.5)
        c2 = make_component("C₂").shift(LEFT * 0.0 + UP * 0.5)
        c3 = make_component("C₃").shift(RIGHT * 3.2 + UP * 0.5)

        arr_in = Arrow(LEFT * 4.8 + UP * 0.5, c1.get_left(), buff=0.05, color=WHITE, stroke_width=2)
        arr_12 = Arrow(c1.get_right(), c2.get_left(), buff=0.05, color=WHITE, stroke_width=2)
        arr_23 = Arrow(c2.get_right(), c3.get_left(), buff=0.05, color=WHITE, stroke_width=2)
        arr_out = Arrow(c3.get_right(), RIGHT * 4.8 + UP * 0.5, buff=0.05, color=WHITE, stroke_width=2)

        series_group = VGroup(c1, c2, c3, arr_in, arr_12, arr_23, arr_out)
        self.play(Create(series_group))
        self.wait(0.4)

        series_tex = MathTex(
            r"P(\text{system OK}) = p_1 \cdot p_2 \cdot p_3",
        ).scale(0.60).shift(DOWN * 0.5)
        series_tex2 = MathTex(
            r"= \prod_{i=1}^{n} p_i \quad (n \text{ components in series})",
        ).scale(0.54).next_to(series_tex, DOWN, buff=0.30)
        self.play(Write(series_tex))
        self.play(FadeIn(series_tex2))
        self.wait(0.8)

        # 高亮：可靠度随元件数指数下降
        warning = (
            Text("串联越长，系统越脆弱", font=CJK, color=RED)
            .scale(0.46)
            .next_to(series_tex2, DOWN, buff=0.35)
        )
        self.play(FadeIn(warning))
        self.wait(0.8)

        self.play(FadeOut(VGroup(series_group, series_tex, series_tex2, warning, series_hint)))

        # ------------------------------------------------------------------ #
        # 5. 并联系统可靠性                                                    #
        # ------------------------------------------------------------------ #
        par_title = Text("并联系统可靠性", font=CJK, weight=BOLD).scale(0.58).to_edge(UP).shift(DOWN * 0.1)
        self.play(Transform(title, par_title))

        par_hint = (
            Text("至少一个元件正常，系统即正常", font=CJK)
            .scale(0.44)
            .shift(UP * 2.2)
        )
        self.play(FadeIn(par_hint))

        # 并联示意图：三条并行路径
        def make_par_component(label_str: str, y_off: float, color=GREEN_D) -> VGroup:
            box_c = Rectangle(width=1.1, height=0.55, color=color, stroke_width=2)
            txt_c = Text(label_str, font=CJK, color=color).scale(0.40).move_to(box_c)
            g = VGroup(box_c, txt_c).shift(UP * y_off)
            return g

        # junction points
        jl = LEFT * 2.6 + UP * 0.2
        jr = RIGHT * 2.6 + UP * 0.2

        p1 = make_par_component("C₁", 1.1)
        p2 = make_par_component("C₂", 0.0)
        p3 = make_par_component("C₃", -1.1)

        for pc in [p1, p2, p3]:
            pc.shift(UP * 0.2)  # center offset already in make_par_component

        # arrows from junction left to each component and from each to junction right
        par_arrows = VGroup()
        for pc in [p1, p2, p3]:
            par_arrows.add(
                Arrow(jl, pc.get_left(), buff=0.05, color=WHITE, stroke_width=1.5),
                Arrow(pc.get_right(), jr, buff=0.05, color=WHITE, stroke_width=1.5),
            )

        arr_par_in = Arrow(LEFT * 4.5 + UP * 0.2, jl, buff=0.05, color=WHITE, stroke_width=2)
        arr_par_out = Arrow(jr, RIGHT * 4.5 + UP * 0.2, buff=0.05, color=WHITE, stroke_width=2)

        par_diagram = VGroup(p1, p2, p3, par_arrows, arr_par_in, arr_par_out)
        self.play(Create(par_diagram))
        self.wait(0.4)

        par_tex1 = MathTex(
            r"P(\text{system fail}) = (1-p_1)(1-p_2)(1-p_3)",
        ).scale(0.54).shift(DOWN * 1.5)
        par_tex2 = MathTex(
            r"P(\text{system OK}) = 1 - \prod_{i=1}^{n}(1-p_i)",
        ).scale(0.54).next_to(par_tex1, DOWN, buff=0.30)
        self.play(Write(par_tex1))
        self.play(FadeIn(par_tex2))
        self.wait(0.5)

        boost = (
            Text("并联冗余：系统可靠度高于单个元件", font=CJK, color=GREEN)
            .scale(0.44)
            .next_to(par_tex2, DOWN, buff=0.30)
        )
        self.play(FadeIn(boost))
        self.wait(0.9)

        self.play(FadeOut(VGroup(par_diagram, par_tex1, par_tex2, boost, par_hint)))

        # ------------------------------------------------------------------ #
        # 6. 对比小结                                                          #
        # ------------------------------------------------------------------ #
        sum_title = Text("小结", font=CJK, weight=BOLD).scale(0.62).to_edge(UP).shift(DOWN * 0.1)
        self.play(Transform(title, sum_title))

        lines = [
            (
                MathTex(r"P(AB)=P(A)P(B)").scale(0.55),
                Text("：A 与 B 独立", font=CJK).scale(0.48),
            ),
            (
                MathTex(r"R_s = \prod p_i").scale(0.52),
                Text("串联（随元件增多迅速下降）", font=CJK).scale(0.44),
            ),
            (
                MathTex(r"R_p = 1-\prod(1-p_i)").scale(0.52),
                Text("并联（冗余提升可靠度）", font=CJK).scale(0.44),
            ),
        ]

        bullet_group = VGroup()
        for i, (tex, txt) in enumerate(lines):
            row = VGroup(tex, txt).arrange(RIGHT, buff=0.25)
            row.shift(UP * (0.9 - i * 0.90))
            bullet_group.add(row)

        for row in bullet_group:
            self.play(FadeIn(row))
            self.wait(0.4)

        self.wait(1.0)

        final_note = (
            Text("独立性是概率论的基石，也是可靠性工程的核心假设", font=CJK, color=ORANGE)
            .scale(0.42)
            .to_edge(DOWN, buff=0.5)
        )
        self.play(FadeIn(final_note))
        self.wait(1.5)

        self.play(FadeOut(VGroup(title, bullet_group, final_note)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "IndependenceScene",
        "id": "ch01-1.6-indep",
        "chapterId": "ch01",
        "sectionId": "1.6",
        "title": "事件的独立性",
        "description": "用单位正方形面积直观演示 P(AB)=P(A)P(B)，并对比串联/并联系统的可靠度公式。",
    },
]
