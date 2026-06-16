"""第 1.2 节 · 事件的关系与运算 —— 维恩图依次展示 A∪B、A∩B、A−B、对立事件、德摩根律。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GRAY,
    GREEN,
    LEFT,
    ORANGE,
    PINK,
    PURPLE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    Intersection,
    MathTex,
    Rectangle,
    Scene,
    Text,
    Transform,
    Union,
    VGroup,
    Write,
    Difference,
)

CJK = "Microsoft YaHei"

# ── 颜色常量 ──────────────────────────────────────────────────────────────
C_A      = BLUE
C_B      = RED
C_UNION  = YELLOW
C_INTER  = GREEN
C_DIFF   = ORANGE
C_COMPL  = PINK
C_MORGAN = PURPLE


def _make_venn(shift=None):
    """返回 (circle_a, circle_b) 以及两圆的圆心（用于定位标签）。"""
    ca = Circle(radius=1.3, color=C_A, stroke_width=3).set_fill(C_A, opacity=0.0)
    cb = Circle(radius=1.3, color=C_B, stroke_width=3).set_fill(C_B, opacity=0.0)
    ca.shift(LEFT * 0.75)
    cb.shift(RIGHT * 0.75)
    if shift is not None:
        ca.shift(shift)
        cb.shift(shift)
    return ca, cb


def _venn_labels(ca, cb):
    """在两圆圆心附近放 A / B 标签，返回 VGroup。"""
    la = MathTex(r"A", color=C_A).scale(0.9).move_to(ca.get_center() + LEFT * 0.55)
    lb = MathTex(r"B", color=C_B).scale(0.9).move_to(cb.get_center() + RIGHT * 0.55)
    return VGroup(la, lb)


class EventOperationsScene(Scene):
    def construct(self):
        # ── 0. 标题 ──────────────────────────────────────────────────────
        title = (
            Text("事件的关系与运算", font=CJK, weight=BOLD)
            .scale(0.72)
            .to_edge(UP, buff=0.25)
        )
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 搭建基础维恩图 ────────────────────────────────────────────
        ca, cb = _make_venn(shift=DOWN * 0.5)
        ab_labels = _venn_labels(ca, cb)

        # 样本空间外框
        omega_box = Rectangle(width=7.5, height=3.8, color=GRAY, stroke_width=2)
        omega_box.shift(DOWN * 0.5)
        omega_label = MathTex(r"\Omega").scale(0.8).next_to(
            omega_box.get_corner(UP + LEFT), DOWN + RIGHT, buff=0.15
        )

        self.play(Create(omega_box), FadeIn(omega_label))
        self.play(Create(ca), Create(cb), FadeIn(ab_labels))
        self.wait(0.5)

        # ── 2. A ∪ B（并集）─────────────────────────────────────────────
        section_text, formula, hint = self._make_labels(
            "并集", r"A \cup B", "A 或 B 至少发生其一"
        )
        self.play(Write(section_text), Write(formula), FadeIn(hint))

        union_fill = Union(ca, cb, color=C_UNION, fill_opacity=0.45, stroke_width=0)
        self.play(FadeIn(union_fill))
        self.wait(1.5)

        self.play(FadeOut(union_fill), FadeOut(section_text), FadeOut(formula), FadeOut(hint))
        self.wait(0.2)

        # ── 3. A ∩ B（交集）─────────────────────────────────────────────
        section_text, formula, hint = self._make_labels(
            "交集", r"A \cap B", "A 与 B 同时发生"
        )
        self.play(Write(section_text), Write(formula), FadeIn(hint))

        inter_fill = Intersection(ca, cb, color=C_INTER, fill_opacity=0.6, stroke_width=0)
        self.play(FadeIn(inter_fill))
        self.wait(1.5)

        self.play(FadeOut(inter_fill), FadeOut(section_text), FadeOut(formula), FadeOut(hint))
        self.wait(0.2)

        # ── 4. A − B（差集）─────────────────────────────────────────────
        section_text, formula, hint = self._make_labels(
            "差集", r"A - B", "A 发生且 B 不发生"
        )
        self.play(Write(section_text), Write(formula), FadeIn(hint))

        diff_fill = Difference(ca, cb, color=C_DIFF, fill_opacity=0.6, stroke_width=0)
        self.play(FadeIn(diff_fill))
        self.wait(1.5)

        self.play(FadeOut(diff_fill), FadeOut(section_text), FadeOut(formula), FadeOut(hint))
        self.wait(0.2)

        # ── 5. 对立事件 Aᶜ ───────────────────────────────────────────────
        section_text, formula, hint = self._make_labels(
            "对立事件", r"\bar{A}", "A 不发生（Ω 中 A 的补）"
        )
        self.play(Write(section_text), Write(formula), FadeIn(hint))

        # 用 Difference(omega_box, ca) 近似表示 Ω \ A
        compl_fill = Difference(
            omega_box.copy().set_fill(WHITE, opacity=0),
            ca.copy(),
            color=C_COMPL,
            fill_opacity=0.40,
            stroke_width=0,
        )
        self.play(FadeIn(compl_fill))
        self.wait(1.5)

        self.play(FadeOut(compl_fill), FadeOut(section_text), FadeOut(formula), FadeOut(hint))
        self.wait(0.2)

        # ── 6. 德摩根律 (A∪B)ᶜ = Aᶜ∩Bᶜ ────────────────────────────────
        # 淡出维恩图，进入专用演示
        self.play(FadeOut(VGroup(ca, cb, ab_labels, omega_box, omega_label)), run_time=0.6)

        self._demorgan_demo()
        self.wait(1.0)

    # ── 辅助：三行标签 ────────────────────────────────────────────────────
    def _make_labels(self, chinese_name: str, tex_str: str, chinese_desc: str):
        """返回 (节名 Text, 公式 MathTex, 说明 Text)，固定放在画面右侧。"""
        section_text = (
            Text(chinese_name, font=CJK, weight=BOLD, color=WHITE)
            .scale(0.58)
            .to_edge(RIGHT, buff=0.5)
            .shift(UP * 1.2)
        )
        formula = (
            MathTex(tex_str, color=YELLOW)
            .scale(1.1)
            .next_to(section_text, DOWN, buff=0.18)
        )
        hint = (
            Text(chinese_desc, font=CJK, color=GRAY)
            .scale(0.45)
            .next_to(formula, DOWN, buff=0.22)
        )
        return section_text, formula, hint

    # ── 德摩根律动画 ──────────────────────────────────────────────────────
    def _demorgan_demo(self):
        # 标题行
        dm_title = (
            Text("德摩根律", font=CJK, weight=BOLD, color=YELLOW)
            .scale(0.65)
            .to_edge(UP, buff=0.9)
        )
        dm_formula = (
            MathTex(r"\overline{A \cup B} = \bar{A} \cap \bar{B}")
            .scale(1.05)
            .next_to(dm_title, DOWN, buff=0.22)
        )
        self.play(Write(dm_title), Write(dm_formula))
        self.wait(0.5)

        # 左侧：(A∪B)ᶜ
        left_label = (
            Text("左边", font=CJK, color=GRAY).scale(0.48).shift(LEFT * 3.3 + UP * 0.7)
        )
        left_formula = (
            MathTex(r"\overline{A \cup B}", color=C_MORGAN)
            .scale(0.9)
            .next_to(left_label, DOWN, buff=0.12)
        )

        ca_l, cb_l = _make_venn(shift=LEFT * 3.2 + DOWN * 1.0)
        omega_l = Rectangle(width=3.0, height=2.5, color=GRAY, stroke_width=1.5).move_to(
            ca_l.get_center() + RIGHT * 0.75
        )
        union_l = Union(ca_l, cb_l, color=C_UNION, fill_opacity=0.35, stroke_width=0)
        compl_l = Difference(
            omega_l.copy().set_fill(WHITE, opacity=0),
            Union(ca_l.copy(), cb_l.copy(), stroke_width=0),
            color=C_MORGAN,
            fill_opacity=0.55,
            stroke_width=0,
        )
        self.play(
            Create(omega_l), Create(ca_l), Create(cb_l),
            FadeIn(left_label), Write(left_formula),
        )
        self.play(FadeIn(union_l))
        self.wait(0.4)
        self.play(FadeOut(union_l), FadeIn(compl_l))
        self.wait(1.0)

        # 右侧：Aᶜ ∩ Bᶜ
        right_label = (
            Text("右边", font=CJK, color=GRAY).scale(0.48).shift(RIGHT * 3.3 + UP * 0.7)
        )
        right_formula = (
            MathTex(r"\bar{A} \cap \bar{B}", color=C_MORGAN)
            .scale(0.9)
            .next_to(right_label, DOWN, buff=0.12)
        )

        ca_r, cb_r = _make_venn(shift=RIGHT * 3.2 + DOWN * 1.0)
        omega_r = Rectangle(width=3.0, height=2.5, color=GRAY, stroke_width=1.5).move_to(
            ca_r.get_center() + RIGHT * 0.75
        )
        # Aᶜ = Ω \ A
        compl_a = Difference(
            omega_r.copy().set_fill(WHITE, opacity=0),
            ca_r.copy(),
            color=BLUE,
            fill_opacity=0.30,
            stroke_width=0,
        )
        # Bᶜ = Ω \ B
        compl_b = Difference(
            omega_r.copy().set_fill(WHITE, opacity=0),
            cb_r.copy(),
            color=RED,
            fill_opacity=0.30,
            stroke_width=0,
        )
        # Aᶜ ∩ Bᶜ
        inter_compl = Intersection(
            Difference(
                omega_r.copy().set_fill(WHITE, opacity=0),
                ca_r.copy(),
                stroke_width=0,
            ),
            Difference(
                omega_r.copy().set_fill(WHITE, opacity=0),
                cb_r.copy(),
                stroke_width=0,
            ),
            color=C_MORGAN,
            fill_opacity=0.55,
            stroke_width=0,
        )

        self.play(
            Create(omega_r), Create(ca_r), Create(cb_r),
            FadeIn(right_label), Write(right_formula),
        )
        self.play(FadeIn(compl_a), FadeIn(compl_b))
        self.wait(0.4)
        self.play(FadeOut(compl_a), FadeOut(compl_b), FadeIn(inter_compl))
        self.wait(1.0)

        # 等号连接 —— 两侧紫色填充完全一致，强调相等
        equal_sign = MathTex(r"=").scale(1.3).move_to(DOWN * 1.0)
        self.play(Write(equal_sign))
        self.wait(0.5)

        # 闪烁对比提示
        confirm = (
            Text("两侧高亮区域完全相同！", font=CJK, color=YELLOW)
            .scale(0.52)
            .to_edge(DOWN, buff=0.3)
        )
        self.play(FadeIn(confirm))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            dm_title, dm_formula,
            left_label, left_formula, ca_l, cb_l, omega_l, compl_l,
            right_label, right_formula, ca_r, cb_r, omega_r, inter_compl,
            equal_sign, confirm,
        )))


REGISTER = [
    {
        "scene": "EventOperationsScene",
        "id": "ch01-1.2-ops",
        "chapterId": "ch01",
        "sectionId": "1.2",
        "title": "事件的关系与运算",
        "description": "维恩图动画依次展示并集、交集、差集、对立事件，最后以左右对比演示德摩根律。",
    },
]
