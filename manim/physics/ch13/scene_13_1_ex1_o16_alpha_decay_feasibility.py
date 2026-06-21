"""第 13.1 节 · 例题：¹⁶O → ¹²C + ⁴He 衰变是否可能

通过质量亏损（Δm）判断 α 衰变自发性：Δm < 0 则需要吸能，衰变不可能自发发生。
使用反应示意图 + 天平动画 + 逐步数值减法，直观展示能量守恒对核反应的约束。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch13Ex1O16AlphaDecayFeasibility(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("例题：¹⁶O 的 α 衰变是否可能？", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十三章 原子核与放射性 · 13.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比（能量守恒直觉）────────────────────────────
        ana1 = Text("想象把一块石头推到山顶：需要输入能量。", font=CJK).scale(0.48)
        ana2 = Text("核反应也一样——如果产物比原核更「重」，", font=CJK).scale(0.48)
        ana3 = Text("多出来的质量就意味着需要从外界补充能量。", font=CJK).scale(0.48)
        ana4 = Text("这样的反应不能自发发生。", font=CJK, color=YELLOW).scale(0.48)
        analogy = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55).scale_to_fit_width(11)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(0.5)
        self.play(FadeIn(ana4))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ── Step 3: 反应方程（逐步出现）────────────────────────────────
        sec_t = Text("反应方程", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        rxn = MathTex(
            r"{}^{16}_{8}\mathrm{O}",
            r"\longrightarrow",
            r"{}^{12}_{6}\mathrm{C}",
            r"+",
            r"{}^{4}_{2}\mathrm{He}",
        ).scale(1.1)
        rxn[0].set_color(BLUE)
        rxn[2].set_color(GREEN)
        rxn[4].set_color(RED)
        rxn.next_to(sec_t, DOWN, buff=0.5)
        self.play(FadeIn(sec_t))
        self.wait(0.4)
        self.play(Write(rxn[0]))
        self.wait(0.4)
        self.play(Write(rxn[1]))
        self.wait(0.4)
        self.play(Write(rxn[2]), Write(rxn[3]), Write(rxn[4]))
        self.wait(1.5)

        # 质量注释
        m_o = Text("15.994915 u", font=CJK, color=BLUE).scale(0.4)
        m_c = Text("12.000000 u", font=CJK, color=GREEN).scale(0.4)
        m_he = Text("4.002603 u", font=CJK, color=RED).scale(0.4)
        m_o.next_to(rxn[0], DOWN, buff=0.18)
        m_c.next_to(rxn[2], DOWN, buff=0.18)
        m_he.next_to(rxn[4], DOWN, buff=0.18)
        self.play(FadeIn(m_o), FadeIn(m_c), FadeIn(m_he))
        self.wait(1.8)
        self.play(FadeOut(VGroup(sec_t, rxn, m_o, m_c, m_he)))

        # ── Step 4: 反应示意图（球 + 箭头）────────────────────────────
        diag_t = Text("反应示意图", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(diag_t))

        # 左边：O 核
        o_circ = Circle(radius=0.55, color=BLUE, fill_color=BLUE, fill_opacity=0.85)
        o_circ.shift(LEFT * 3.8 + DOWN * 0.5)
        o_label = MathTex(r"{}^{16}\mathrm{O}", color=WHITE).scale(0.75)
        o_label.move_to(o_circ.get_center())
        o_mass = Text("15.994915 u", font=CJK, color=BLUE).scale(0.38)
        o_mass.next_to(o_circ, DOWN, buff=0.18)

        # 箭头
        decay_arrow = Arrow(
            start=LEFT * 2.4 + DOWN * 0.5,
            end=LEFT * 1.0 + DOWN * 0.5,
            color=WHITE, buff=0,
        )

        # 右边：C 核 + He 核
        c_circ = Circle(radius=0.48, color=GREEN, fill_color=GREEN, fill_opacity=0.85)
        c_circ.shift(RIGHT * 0.4 + UP * 0.3)
        c_label = MathTex(r"{}^{12}\mathrm{C}", color=WHITE).scale(0.7)
        c_label.move_to(c_circ.get_center())
        c_mass = Text("12.000000 u", font=CJK, color=GREEN).scale(0.38)
        c_mass.next_to(c_circ, UP, buff=0.15)

        plus_sign = MathTex(r"+").scale(0.9).shift(RIGHT * 1.35 + DOWN * 0.5)

        he_circ = Circle(radius=0.35, color=RED, fill_color=RED, fill_opacity=0.85)
        he_circ.shift(RIGHT * 2.5 + DOWN * 1.1)
        he_label = MathTex(r"{}^{4}\mathrm{He}", color=WHITE).scale(0.62)
        he_label.move_to(he_circ.get_center())
        he_mass = Text("4.002603 u", font=CJK, color=RED).scale(0.38)
        he_mass.next_to(he_circ, DOWN, buff=0.15)

        diag_group = VGroup(
            o_circ, o_label, o_mass,
            decay_arrow,
            c_circ, c_label, c_mass,
            plus_sign,
            he_circ, he_label, he_mass,
        )

        self.play(FadeIn(o_circ), Write(o_label))
        self.play(FadeIn(o_mass))
        self.play(Create(decay_arrow))
        self.play(FadeIn(c_circ), Write(c_label), FadeIn(c_mass))
        self.play(FadeIn(plus_sign))
        self.play(FadeIn(he_circ), Write(he_label), FadeIn(he_mass))
        self.wait(1.6)
        self.play(FadeOut(VGroup(diag_t, diag_group)))

        # ── Step 5: 天平动画（右边更重）────────────────────────────────
        scale_t = Text("用天平比较两边质量", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scale_t))

        # 天平支点
        fulcrum = Triangle(color=GRAY, fill_color=GRAY, fill_opacity=1.0).scale(0.22)
        fulcrum.move_to(DOWN * 1.1)
        pole = Line(start=DOWN * 0.88, end=DOWN * 0.88, color=GRAY)  # hidden baseline

        # 横梁（初始水平，然后右倾）
        beam_flat = Line(start=LEFT * 2.5 + DOWN * 0.88, end=RIGHT * 2.5 + DOWN * 0.88,
                         color=GRAY, stroke_width=5)
        # 右倾横梁
        tilt_angle = 15 * DEGREES
        beam_tilt = Line(
            start=LEFT * 2.5 + DOWN * 0.88 + UP * (2.5 * math.sin(tilt_angle)),
            end=RIGHT * 2.5 + DOWN * 0.88 - UP * (2.5 * math.sin(tilt_angle)),
            color=GRAY, stroke_width=5,
        )

        # 左盘（O）
        pan_l_flat = Line(start=LEFT * 2.6 + DOWN * 0.88,
                          end=LEFT * 1.4 + DOWN * 0.88, color=GRAY, stroke_width=3)
        rod_l_flat = Line(start=LEFT * 2.5 + DOWN * 0.88,
                          end=LEFT * 2.5 + DOWN * 1.5, color=GRAY, stroke_width=2)

        # 右盘（C+He）
        pan_r_flat = Line(start=RIGHT * 1.4 + DOWN * 0.88,
                          end=RIGHT * 2.6 + DOWN * 0.88, color=GRAY, stroke_width=3)
        rod_r_flat = Line(start=RIGHT * 2.5 + DOWN * 0.88,
                          end=RIGHT * 2.5 + DOWN * 1.5, color=GRAY, stroke_width=2)

        # 倾斜后的盘/杆
        beam_l_end = LEFT * 2.5 + DOWN * 0.88 + UP * (2.5 * math.sin(tilt_angle))
        beam_r_end = RIGHT * 2.5 + DOWN * 0.88 - UP * (2.5 * math.sin(tilt_angle))

        pan_l_tilt = Line(start=beam_l_end + LEFT * 0.6,
                          end=beam_l_end + RIGHT * 0.6, color=GRAY, stroke_width=3)
        rod_l_tilt = Line(start=beam_l_end, end=beam_l_end + DOWN * 0.62,
                          color=GRAY, stroke_width=2)

        pan_r_tilt = Line(start=beam_r_end + LEFT * 0.6,
                          end=beam_r_end + RIGHT * 0.6, color=GRAY, stroke_width=3)
        rod_r_tilt = Line(start=beam_r_end, end=beam_r_end + DOWN * 0.62,
                          color=GRAY, stroke_width=2)

        # 质量标签
        label_l = MathTex(r"m({}^{16}\mathrm{O})", color=BLUE).scale(0.58)
        label_l.next_to(pan_l_flat, DOWN, buff=0.15)
        label_r1 = MathTex(r"m({}^{12}\mathrm{C})+m({}^{4}\mathrm{He})", color=GREEN).scale(0.52)
        label_r1.next_to(pan_r_flat, DOWN, buff=0.15)

        balance_flat = VGroup(beam_flat, pan_l_flat, rod_l_flat, pan_r_flat, rod_r_flat)

        self.play(Create(fulcrum))
        self.play(Create(balance_flat))
        self.play(FadeIn(label_l), FadeIn(label_r1))
        self.wait(1.0)

        # 右盘下沉（右边更重）
        hint = Text("右边（产物）更重！", font=CJK, color=RED).scale(0.5)
        hint.next_to(fulcrum, DOWN, buff=1.2)

        balance_tilt = VGroup(beam_tilt, pan_l_tilt, rod_l_tilt, pan_r_tilt, rod_r_tilt)
        label_l_tilt = MathTex(r"m({}^{16}\mathrm{O})", color=BLUE).scale(0.58)
        label_l_tilt.next_to(pan_l_tilt, DOWN, buff=0.12)
        label_r_tilt = MathTex(r"m({}^{12}\mathrm{C})+m({}^{4}\mathrm{He})", color=GREEN).scale(0.52)
        label_r_tilt.next_to(pan_r_tilt, DOWN, buff=0.12)

        self.play(
            Transform(balance_flat, balance_tilt),
            Transform(label_l, label_l_tilt),
            Transform(label_r1, label_r_tilt),
        )
        self.play(FadeIn(hint))
        self.wait(1.8)
        self.play(FadeOut(VGroup(scale_t, fulcrum, balance_flat, label_l, label_r1, hint)))

        # ── Step 6: 逐步数值减法（Δm 推导）────────────────────────────
        calc_t = Text("逐步计算质量差 Δm", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_t))

        step_a_lbl = Text("母核质量：", font=CJK, color=WHITE).scale(0.46)
        step_a_val = MathTex(r"m({}^{16}\mathrm{O}) = 15.994915\,\mathrm{u}", color=BLUE).scale(0.72)
        row_a = VGroup(step_a_lbl, step_a_val).arrange(RIGHT, buff=0.18)
        row_a.next_to(calc_t, DOWN, buff=0.5)

        self.play(FadeIn(step_a_lbl), Write(step_a_val))
        self.wait(1.0)

        step_b_lbl = Text("减去 C 核：", font=CJK, color=WHITE).scale(0.46)
        step_b_val = MathTex(r"-\;m({}^{12}\mathrm{C}) = -\;12.000000\,\mathrm{u}", color=GREEN).scale(0.72)
        row_b = VGroup(step_b_lbl, step_b_val).arrange(RIGHT, buff=0.18)
        row_b.next_to(row_a, DOWN, buff=0.32, aligned_edge=LEFT)

        self.play(FadeIn(step_b_lbl), Write(step_b_val))
        self.wait(0.8)

        step_c_lbl = Text("减去 He 核：", font=CJK, color=WHITE).scale(0.46)
        step_c_val = MathTex(r"-\;m({}^{4}\mathrm{He}) = -\;4.002603\,\mathrm{u}", color=RED).scale(0.72)
        row_c = VGroup(step_c_lbl, step_c_val).arrange(RIGHT, buff=0.18)
        row_c.next_to(row_b, DOWN, buff=0.32, aligned_edge=LEFT)

        self.play(FadeIn(step_c_lbl), Write(step_c_val))
        self.wait(0.8)

        divider = Line(start=LEFT * 5, end=RIGHT * 5, color=WHITE, stroke_width=1.5)
        divider.next_to(row_c, DOWN, buff=0.22)
        self.play(Create(divider))

        result_lbl = Text("质量差：", font=CJK, color=YELLOW).scale(0.5)
        result_val = MathTex(r"\Delta m = -0.007688\,\mathrm{u}", color=YELLOW).scale(0.85)
        row_res = VGroup(result_lbl, result_val).arrange(RIGHT, buff=0.18)
        row_res.next_to(divider, DOWN, buff=0.28)

        self.play(FadeIn(result_lbl), Write(result_val))
        self.wait(2.0)

        dm_box = SurroundingRectangle(result_val, color=YELLOW, buff=0.18, corner_radius=0.1)
        self.play(Create(dm_box))
        self.wait(1.2)

        self.play(FadeOut(VGroup(calc_t, row_a, row_b, row_c, divider, row_res, dm_box)))

        # ── Step 7: Q 值换算 ────────────────────────────────────────────
        q_t = Text("换算释放/吸收能量 Q 值", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(q_t))

        formula_q = MathTex(
            r"Q = \Delta m \cdot c^2 = 931.5\,\mathrm{MeV/u} \times \Delta m"
        ).scale(0.78)
        formula_q.next_to(q_t, DOWN, buff=0.5)
        self.play(Write(formula_q))
        self.wait(0.8)

        calc_q = MathTex(
            r"Q = 931.5 \times (-0.007688) = -7.162\,\mathrm{MeV}"
        ).scale(0.82)
        calc_q.set_color(RED)
        calc_q.next_to(formula_q, DOWN, buff=0.4)
        self.play(Write(calc_q))
        self.wait(1.0)

        neg_hint_lbl = Text("Q < 0 表示该反应需从外界吸收约 7.16 MeV 的能量", font=CJK, color=RED).scale(0.44)
        neg_hint_lbl.next_to(calc_q, DOWN, buff=0.35)
        self.play(FadeIn(neg_hint_lbl))
        self.wait(1.8)
        self.play(FadeOut(VGroup(q_t, formula_q, calc_q, neg_hint_lbl)))

        # ── Step 8: 红色 X ──────────────────────────────────────────────
        verdict_t = Text("结论：此衰变不可能自发发生", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(verdict_t))

        # 重画反应方程
        rxn2 = MathTex(
            r"{}^{16}_{8}\mathrm{O}",
            r"\longrightarrow",
            r"{}^{12}_{6}\mathrm{C}",
            r"+",
            r"{}^{4}_{2}\mathrm{He}",
        ).scale(1.05)
        rxn2[0].set_color(BLUE)
        rxn2[2].set_color(GREEN)
        rxn2[4].set_color(RED)
        rxn2.next_to(verdict_t, DOWN, buff=0.5)
        self.play(Write(rxn2))
        self.wait(0.6)

        # 大红 X 叠在箭头上
        cross_h = Line(start=LEFT * 0.45 + DOWN * 0.22, end=RIGHT * 0.45 + UP * 0.22,
                       color=RED, stroke_width=8)
        cross_v = Line(start=LEFT * 0.45 + UP * 0.22, end=RIGHT * 0.45 + DOWN * 0.22,
                       color=RED, stroke_width=8)
        cross_h.move_to(rxn2[1].get_center())
        cross_v.move_to(rxn2[1].get_center())
        cross = VGroup(cross_h, cross_v)
        self.play(Create(cross))
        self.wait(0.8)

        reason1 = Text("因为 Δm = -0.007688 u < 0", font=CJK, color=YELLOW).scale(0.46)
        reason2 = Text("产物质量 > 母核质量，反应必须吸能。", font=CJK, color=YELLOW).scale(0.46)
        reason3 = Text("自发衰变只能放能，不可能发生这种衰变。", font=CJK, color=ORANGE).scale(0.46)
        reasons = VGroup(reason1, reason2, reason3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        reasons.next_to(rxn2, DOWN, buff=0.45).scale_to_fit_width(10.5)
        for r in reasons:
            self.play(FadeIn(r))
            self.wait(0.5)
        self.wait(1.2)
        self.play(FadeOut(VGroup(verdict_t, rxn2, cross, reasons)))

        # ── Step 9: 对比——α 衰变可能的情形 ────────────────────────────
        contrast_t = Text("对比：α 衰变可能的情形", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(contrast_t))

        c1 = Text("若 Δm > 0（母核质量 > 产物质量之和），", font=CJK, color=GREEN).scale(0.46)
        c2 = Text("多余质量转化为动能，衰变可自发发生。", font=CJK, color=GREEN).scale(0.46)
        c3 = MathTex(r"Q = \Delta m\,c^2 > 0\;\Rightarrow\;\text{energy released}", color=GREEN).scale(0.72)
        c4 = Text("例：²³⁸U → ²³⁴Th + ⁴He（Δm > 0，Q ≈ 4.27 MeV）", font=CJK, color=CYAN).scale(0.45)
        contrast = VGroup(c1, c2, c3, c4).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        contrast.next_to(contrast_t, DOWN, buff=0.45).scale_to_fit_width(11)

        self.play(FadeIn(c1))
        self.wait(0.5)
        self.play(FadeIn(c2))
        self.wait(0.5)
        self.play(Write(c3))
        self.wait(0.5)
        self.play(FadeIn(c4))
        self.wait(1.8)
        self.play(FadeOut(VGroup(contrast_t, contrast)))

        # ── Step 10: 判断准则小结 ────────────────────────────────────────
        rule_t = Text("α 衰变自发性判断准则", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(rule_t))

        rule1_lbl = Text("计算质量差：", font=CJK, color=WHITE).scale(0.46)
        rule1_tex = MathTex(
            r"\Delta m = m_{\rm parent} - m_{\rm daughter} - m_\alpha"
        ).scale(0.75)
        row_r1 = VGroup(rule1_lbl, rule1_tex).arrange(RIGHT, buff=0.15)

        rule2a = VGroup(
            MathTex(r"\Delta m > 0", color=GREEN).scale(0.75),
            Text("  →  衰变可自发发生（放能）", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.1)

        rule2b = VGroup(
            MathTex(r"\Delta m < 0", color=RED).scale(0.75),
            Text("  →  衰变不可自发发生（需吸能）", font=CJK, color=RED).scale(0.44),
        ).arrange(RIGHT, buff=0.1)

        rules = VGroup(row_r1, rule2a, rule2b).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        rules.next_to(rule_t, DOWN, buff=0.45).scale_to_fit_width(11)

        self.play(FadeIn(row_r1))
        self.wait(0.8)
        self.play(FadeIn(rule2a))
        self.wait(0.6)
        self.play(FadeIn(rule2b))
        self.wait(1.4)
        self.play(FadeOut(VGroup(rule_t, rules)))

        # ── Step 11: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"\Delta m = m({}^{16}\mathrm{O}) - m({}^{12}\mathrm{C}) - m({}^{4}\mathrm{He})",
            color=YELLOW,
        ).scale(0.7)
        s2 = MathTex(r"= 15.994915 - 12.000000 - 4.002603 = -0.007688\,\mathrm{u}",
                     color=YELLOW).scale(0.7)
        s3 = MathTex(r"Q = 931.5 \times (-0.007688) \approx -7.16\,\mathrm{MeV} < 0",
                     color=RED).scale(0.75)
        s4_lbl = Text("结论：", font=CJK, color=ORANGE).scale(0.5)
        s4_txt = Text("¹⁶O 的 α 衰变不能自发发生", font=CJK, color=ORANGE).scale(0.5)
        s4 = VGroup(s4_lbl, s4_txt).arrange(RIGHT, buff=0.12)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4).scale_to_fit_width(12)

        box = SurroundingRectangle(summary, color=YELLOW, buff=0.35, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch13Ex1O16AlphaDecayFeasibility",
        "id": "phys-ch13-13.1-ex1-o16-alpha-decay-feasibility",
        "chapterId": "ch13",
        "sectionId": "13.1",
        "title": "¹⁶O→¹²C+⁴He 衰变是否可能",
        "description": "通过计算质量差 Δm = -0.007688u（Q ≈ -7.16 MeV < 0），用天平动画和逐步减法证明 ¹⁶O 的 α 衰变需要吸能，因此不能自发发生。",
    },
]
