"""第 7.1 节 · 电场强度（金标准范本：矢量场 / 场线 + ValueTracker 扫动）。

物理动画两大范式之一：用「矢量箭头场」呈现空间中的力场结构，
并用 ValueTracker + always_redraw 让箭头随电荷量实时伸缩，建立 E ∝ q、E ∝ 1/r² 的直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp1ElectricField(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("电场强度：电荷周围的力场", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        analogy = Text("如同磁铁周围有磁场，电荷周围的空间也被改变了：",
                       font=CJK).scale(0.5)
        analogy2 = Text("任何放进来的电荷都会感到一份力。这份「力的分布」就是电场。",
                        font=CJK).scale(0.5)
        ana = VGroup(analogy, analogy2).arrange(DOWN, buff=0.25).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(analogy))
        self.wait(0.8)
        self.play(FadeIn(analogy2))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ── Step 3: 定义（逐步出现 + 高亮）──────────────────────────────
        defi_zh = Text("电场强度 = 单位正电荷受到的力", font=CJK).scale(0.5).next_to(title, DOWN, buff=0.5)
        e_def = MathTex(r"\vec{E}", r"=", r"\frac{\vec{F}}{q_0}").scale(1.0)
        e_def.next_to(defi_zh, DOWN, buff=0.4)
        e_def[0].set_color(YELLOW)
        self.play(FadeIn(defi_zh))
        self.play(Write(e_def))
        self.wait(1.4)

        coulomb = MathTex(r"E", r"=", r"\frac{1}{4\pi\varepsilon_0}", r"\frac{q}{r^2}").scale(0.95)
        coulomb.next_to(e_def, DOWN, buff=0.45)
        coulomb[3].set_color(YELLOW)
        self.play(TransformMatchingTex(e_def.copy(), coulomb))
        self.wait(1.2)
        note = Text("关键：E 与电荷 q 成正比，与距离平方 r² 成反比",
                    font=CJK, color=GREEN).scale(0.42).next_to(coulomb, DOWN, buff=0.35)
        self.play(FadeIn(note))
        self.wait(1.4)
        self.play(FadeOut(VGroup(defi_zh, e_def, coulomb, note)))

        # ── Step 4: 矢量场 + ValueTracker 扫动 ──────────────────────────
        q = ValueTracker(1.0)
        charge = Dot(point=LEFT * 0.0, radius=0.20, color=RED).shift(DOWN * 0.3)
        charge_label = MathTex(r"+q", color=RED).scale(0.7)
        charge_label.add_updater(lambda m: m.next_to(charge, UP, buff=0.12))

        def make_field():
            arrows = VGroup()
            center = charge.get_center()
            length = 0.45 + 0.85 * q.get_value()
            for kk in range(12):
                ang = kk * TAU / 12
                d = np.array([math.cos(ang), math.sin(ang), 0.0])
                start = center + d * 0.28
                end = center + d * (0.28 + length)
                arrows.add(Arrow(start, end, buff=0, color=YELLOW, stroke_width=3,
                                 max_tip_length_to_length_ratio=0.28))
            return arrows

        field = always_redraw(make_field)
        cap = Text("正电荷的电场：箭头从电荷向外辐射（场线）", font=CJK).scale(0.46).to_edge(DOWN, buff=0.7)
        self.play(Create(charge), FadeIn(charge_label))
        self.play(Create(field), FadeIn(cap))
        self.wait(0.8)

        readout = always_redraw(lambda: MathTex(rf"q = {q.get_value():.1f}\,q_0", color=CYAN)
                                .scale(0.6).to_corner(UR, buff=0.6))
        self.add(readout)
        zh_grow = Text("增大电荷 → 场强变大（箭头变长）", font=CJK, color=ORANGE).scale(0.42)
        zh_grow.next_to(cap, UP, buff=0.2)
        self.play(FadeIn(zh_grow))
        self.play(q.animate.set_value(2.2), run_time=2.2)
        self.wait(0.6)
        self.play(q.animate.set_value(0.6), run_time=2.2)
        self.wait(0.6)
        self.play(q.animate.set_value(1.0), run_time=1.2)
        self.play(FadeOut(VGroup(field, charge, charge_label, cap, zh_grow, readout)))

        # ── Step 5: 数值例子 ────────────────────────────────────────────
        ex_t = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        ex_q = Text("点电荷 q = 2 nC，在 r = 0.1 m 处的场强？", font=CJK).scale(0.45)
        ex_q.next_to(ex_t, DOWN, buff=0.3)
        ex_calc = MathTex(r"E=\frac{9\times10^9 \cdot 2\times10^{-9}}{(0.1)^2}"
                          r"=1.8\times10^{3}\ \mathrm{V/m}").scale(0.75)
        ex_calc.next_to(ex_q, DOWN, buff=0.4)
        ex_calc.set_color(GREEN)
        self.play(FadeIn(ex_t))
        self.play(FadeIn(ex_q))
        self.wait(0.8)
        self.play(Write(ex_calc))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_t, ex_q, ex_calc)))

        # ── Step 6: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"\vec{E}=\frac{\vec{F}}{q_0}", color=YELLOW).scale(0.8)
        s2 = MathTex(r"E=\frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}", color=YELLOW).scale(0.8)
        s3 = Text("电场是矢量场：有大小、有方向，由电荷在空间各点产生",
                  font=CJK, color=GREEN).scale(0.42)
        s = VGroup(s1, s2, s3).arrange(DOWN, buff=0.4).next_to(s_title, DOWN, buff=0.45)
        box = SurroundingRectangle(s, color=BLUE, buff=0.35, corner_radius=0.15)
        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.play(FadeIn(s3), Create(box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch07Kp1ElectricField",
        "id": "phys-ch07-7.1-kp1-electric-field",
        "chapterId": "ch07",
        "sectionId": "7.1",
        "title": "电场强度：电荷周围的力场",
        "description": "用辐射状矢量场展示点电荷电场，ValueTracker 扫动电荷量演示 E∝q、E∝1/r²。",
    },
]
