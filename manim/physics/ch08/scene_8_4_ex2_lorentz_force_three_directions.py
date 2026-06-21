"""第 8.4 节 · 例题 2：电子在长直导线磁场中的洛伦兹力方向

三种速度方向 → 三种洛伦兹力结果的可视化：
  场景一：v 平行导线，v⊥B → F = evB（指向径向）
  场景二：v 垂直导线指向导线，v⊥B → F 沿平行导线方向
  场景三：v 垂直于 v-B 平面（即 v∥B），F = 0

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch08Ex2LorentzForceThreeDirections(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("电子在长直导线磁场中的洛伦兹力方向",
                     font=CJK, color=BLUE).scale(0.6).to_edge(UP, buff=0.35)
        subtitle = Text("第八章  稳恒磁场 · 8.4  例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比 / 背景交代
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("长直导线通电后，其周围会产生同心圆形磁场。", font=CJK).scale(0.46)
        ana2 = Text("当一个电子以不同方向穿越这个磁场区域——", font=CJK).scale(0.46)
        ana3 = Text("它受到的洛伦兹力方向会完全不同，甚至可以为零。", font=CJK).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 核心公式（逐步出现 + 高亮）
        # ══════════════════════════════════════════════════════════════
        def_zh = Text("洛伦兹力公式（负电荷）：", font=CJK).scale(0.48)
        def_zh.next_to(title, DOWN, buff=0.55)

        f_def = MathTex(
            r"\mathbf{F}", r"=", r"q\,\mathbf{v}\times\mathbf{B}",
            r"=", r"-e\,\mathbf{v}\times\mathbf{B}"
        ).scale(0.85)
        f_def[0].set_color(YELLOW)
        f_def[4].set_color(ORANGE)
        f_def.next_to(def_zh, DOWN, buff=0.32)

        mag_zh = Text("长直导线在距离 r 处的磁感应强度：", font=CJK).scale(0.44)
        mag_zh.next_to(f_def, DOWN, buff=0.4)
        b_formula = MathTex(r"B = \frac{\mu_0 I}{2\pi r}").scale(0.82)
        b_formula[0].set_color(CYAN)
        b_formula.next_to(mag_zh, DOWN, buff=0.25)

        size_zh = Text("力的大小：", font=CJK).scale(0.44)
        size_zh.next_to(b_formula, DOWN, buff=0.38)
        f_size = MathTex(r"F = ev B\sin\theta = \frac{e v \mu_0 I \sin\theta}{2\pi r}").scale(0.78)
        f_size[0].set_color(GREEN)
        f_size.next_to(size_zh, DOWN, buff=0.25)

        self.play(FadeIn(def_zh))
        self.play(Write(f_def))
        self.wait(1.0)
        self.play(FadeIn(mag_zh))
        self.play(Write(b_formula))
        self.wait(1.0)
        self.play(FadeIn(size_zh))
        self.play(Write(f_size))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_zh, f_def, mag_zh, b_formula, size_zh, f_size)))

        # ══════════════════════════════════════════════════════════════
        # Step 4–9: 三场景并排可视化
        # ══════════════════════════════════════════════════════════════
        # 工作区域：title 之下，content_top 往下
        content_top = title.get_bottom() + DOWN * 0.45

        # ──── 辅助函数 ──────────────────────────────────────────────
        def make_wire_label(pos):
            """绘制导线（竖线）+ 电流方向标签"""
            wire = Line(pos + UP * 1.3, pos + DOWN * 1.3, color=ORANGE, stroke_width=5)
            dot_i = Dot(pos, color=ORANGE, radius=0.06)
            lbl_i = VGroup(
                Text("I", font=CJK, color=ORANGE).scale(0.4),
            )
            lbl_i.next_to(wire, RIGHT, buff=0.08)
            return VGroup(wire, dot_i, lbl_i)

        def make_arc_B(center, radius, color=CYAN, n=8):
            """绘制同心圆磁场（取半圆弧表示）"""
            arcs = VGroup()
            for i in range(1, n + 1):
                r = radius * i / n
                arc = Arc(radius=r, start_angle=0, angle=TAU, color=color,
                          stroke_width=1.2, stroke_opacity=0.5)
                arc.move_to(center)
                arcs.add(arc)
            return arcs

        def arrow_tip(start, end, color=RED, width=4):
            return Arrow(start, end, buff=0, color=color,
                         stroke_width=width, max_tip_length_to_length_ratio=0.3)

        # ──── 场景布局常量 ────────────────────────────────────────────
        # 将画布水平分为三列
        LEFT_CTR   = np.array([-4.5, -0.5, 0])
        MID_CTR    = np.array([ 0.0, -0.5, 0])
        RIGHT_CTR  = np.array([ 4.5, -0.5, 0])

        wire_L = LEFT_CTR   + LEFT  * 1.1
        wire_M = MID_CTR    + LEFT  * 1.1
        wire_R = RIGHT_CTR  + LEFT  * 1.1

        # ──────────────────────────────────────────────────────────────
        # 场景标题行（三列）
        # ──────────────────────────────────────────────────────────────
        case_labels = VGroup(
            Text("情形一", font=CJK, color=YELLOW).scale(0.48),
            Text("情形二", font=CJK, color=YELLOW).scale(0.48),
            Text("情形三", font=CJK, color=YELLOW).scale(0.48),
        ).arrange(RIGHT, buff=2.5)
        case_labels.next_to(title, DOWN, buff=0.38)

        # 分隔线
        sep1 = DashedLine(UP * 2.8 + RIGHT * (-1.8), DOWN * 2.6 + RIGHT * (-1.8),
                          color=GREY, stroke_width=1, dash_length=0.12)
        sep2 = DashedLine(UP * 2.8 + RIGHT * 1.8, DOWN * 2.6 + RIGHT * 1.8,
                          color=GREY, stroke_width=1, dash_length=0.12)

        self.play(FadeIn(case_labels), Create(sep1), Create(sep2))
        self.wait(0.6)

        # ══════════════════════════════════════════════════════════════
        # Step 5: 情形一 —— v 平行导线，v⊥B，sinθ=1
        # ══════════════════════════════════════════════════════════════
        # 导线竖向，在左列中心左侧
        wire1_pos = LEFT_CTR + LEFT * 1.0 + DOWN * 0.1
        wire1 = Line(wire1_pos + UP * 1.4, wire1_pos + DOWN * 1.4,
                     color=ORANGE, stroke_width=5)
        # 电流向上箭头
        i1_arrow = arrow_tip(wire1_pos + DOWN * 0.5, wire1_pos + UP * 0.7,
                             color=ORANGE, width=3)
        i1_lbl = Text("I", font=CJK, color=ORANGE).scale(0.38).next_to(wire1, LEFT, buff=0.1)

        # 同心圆磁场（局部）
        B1_arcs = VGroup()
        for ri in [0.4, 0.75, 1.1]:
            arc = Arc(radius=ri, start_angle=PI * 0.25, angle=PI * 1.5,
                      color=CYAN, stroke_width=1.5, stroke_opacity=0.6)
            arc.move_to(wire1_pos)
            B1_arcs.add(arc)

        # 电子位置：导线右侧
        e1_pos = LEFT_CTR + RIGHT * 0.3
        e1_dot = Dot(e1_pos, radius=0.15, color=RED)
        e1_lbl = Text("e", font=CJK, color=RED).scale(0.38).next_to(e1_dot, UP, buff=0.08)
        neg1   = Text("-", font=CJK, color=RED).scale(0.35).next_to(e1_lbl, LEFT, buff=0.02)

        # v 向上（平行导线）
        v1 = arrow_tip(e1_pos, e1_pos + UP * 0.8, color=GREEN, width=4)
        v1_lbl = MathTex(r"\mathbf{v}", color=GREEN).scale(0.55).next_to(v1.get_tip(), UP, buff=0.08)

        # B 方向：在该位置，电流向上 → 右侧磁场向外（纸面外，用"•"圆点表示）
        B1_dot = VGroup(
            Circle(radius=0.15, color=CYAN, stroke_width=2),
            Dot(e1_pos + LEFT * 0.85, radius=0.06, color=CYAN),
        )
        B1_dot[0].move_to(e1_pos + LEFT * 0.85)
        B1_lbl = MathTex(r"\mathbf{B}", color=CYAN).scale(0.5)
        B1_lbl.next_to(B1_dot, UP, buff=0.06)

        # F 方向：F = -e (v_up × B_out) = -e (up × out) = -e (-left) = right
        # v = up = (0,1,0), B = out = (0,0,1) → v×B = (1,0,0) = right → F = -e right = left（指向导线）
        f1 = arrow_tip(e1_pos, e1_pos + LEFT * 0.85, color=YELLOW, width=4)
        f1_lbl = MathTex(r"\mathbf{F}", color=YELLOW).scale(0.55)
        f1_lbl.next_to(f1.get_tip(), LEFT, buff=0.08)

        # 大小标注
        f1_size = MathTex(r"F = \frac{ev\mu_0 I}{2\pi r}", color=GREEN).scale(0.48)
        f1_size.move_to(LEFT_CTR + DOWN * 1.75)
        sin1 = MathTex(r"\sin\theta=1", color=ORANGE).scale(0.46)
        sin1.next_to(f1_size, DOWN, buff=0.18)

        case1_group = VGroup(wire1, i1_arrow, i1_lbl, B1_arcs, e1_dot, e1_lbl, neg1,
                             v1, v1_lbl, B1_dot, B1_lbl, f1, f1_lbl, f1_size, sin1)

        self.play(Create(wire1), FadeIn(i1_arrow), FadeIn(i1_lbl))
        self.play(Create(B1_arcs))
        self.play(Create(e1_dot), FadeIn(e1_lbl), FadeIn(neg1))
        self.wait(0.4)
        self.play(GrowArrow(v1), FadeIn(v1_lbl))
        self.play(FadeIn(B1_dot), FadeIn(B1_lbl))
        self.wait(0.6)

        # 右手定则演示：先显示 v×B，再反转
        cross_lbl1 = VGroup(
            MathTex(r"\mathbf{v}\times\mathbf{B}", color=WHITE).scale(0.48),
        ).move_to(LEFT_CTR + UP * 1.35)
        arrow_cross1 = arrow_tip(e1_pos, e1_pos + RIGHT * 0.75, color=WHITE, width=2.5)
        self.play(FadeIn(cross_lbl1), GrowArrow(arrow_cross1))
        self.wait(0.5)
        neg_lbl1 = MathTex(r"-e\cdot(\mathbf{v}\times\mathbf{B})", color=YELLOW).scale(0.44)
        neg_lbl1.next_to(cross_lbl1, DOWN, buff=0.1)
        self.play(FadeIn(neg_lbl1))
        self.wait(0.4)
        self.play(FadeOut(cross_lbl1), FadeOut(neg_lbl1), FadeOut(arrow_cross1))
        self.play(GrowArrow(f1), FadeIn(f1_lbl))
        self.play(Write(f1_size), FadeIn(sin1))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════
        # Step 6: 情形二 —— v 垂直导线指向导线（径向），v⊥B，sinθ=1
        # ══════════════════════════════════════════════════════════════
        wire2_pos = MID_CTR + LEFT * 1.0 + DOWN * 0.1
        wire2 = Line(wire2_pos + UP * 1.4, wire2_pos + DOWN * 1.4,
                     color=ORANGE, stroke_width=5)
        i2_arrow = arrow_tip(wire2_pos + DOWN * 0.5, wire2_pos + UP * 0.7,
                             color=ORANGE, width=3)
        i2_lbl = Text("I", font=CJK, color=ORANGE).scale(0.38).next_to(wire2, LEFT, buff=0.1)

        B2_arcs = VGroup()
        for ri in [0.4, 0.75, 1.1]:
            arc = Arc(radius=ri, start_angle=PI * 0.25, angle=PI * 1.5,
                      color=CYAN, stroke_width=1.5, stroke_opacity=0.6)
            arc.move_to(wire2_pos)
            B2_arcs.add(arc)

        # 电子位置：导线右侧
        e2_pos = MID_CTR + RIGHT * 0.25
        e2_dot = Dot(e2_pos, radius=0.15, color=RED)
        e2_lbl = Text("e", font=CJK, color=RED).scale(0.38).next_to(e2_dot, UP, buff=0.08)
        neg2   = Text("-", font=CJK, color=RED).scale(0.35).next_to(e2_lbl, LEFT, buff=0.02)

        # v 向左（指向导线，径向方向）
        v2 = arrow_tip(e2_pos, e2_pos + LEFT * 0.8, color=GREEN, width=4)
        v2_lbl = MathTex(r"\mathbf{v}", color=GREEN).scale(0.55)
        v2_lbl.next_to(v2.get_tip(), DOWN, buff=0.08)

        # B 在该点方向：电流向上，右侧 → B 向外（z轴正方向）
        B2_dot = VGroup(
            Circle(radius=0.15, color=CYAN, stroke_width=2),
            Dot(e2_pos + RIGHT * 0.5, radius=0.06, color=CYAN),
        )
        B2_dot[0].move_to(e2_pos + RIGHT * 0.5)
        B2_lbl2 = MathTex(r"\mathbf{B}", color=CYAN).scale(0.5)
        B2_lbl2.next_to(B2_dot, UP, buff=0.06)

        # F 方向：v = left=(-1,0,0), B = out=(0,0,1)
        # v×B = (-1,0,0)×(0,0,1) = (0*1-0*0, 0*0-(-1)*1, (-1)*0-0*0) = (0,1,0) = up
        # F = -e (v×B) = -e up = down（向下，即沿导线向下方向）
        f2 = arrow_tip(e2_pos, e2_pos + DOWN * 0.9, color=YELLOW, width=4)
        f2_lbl = MathTex(r"\mathbf{F}", color=YELLOW).scale(0.55)
        f2_lbl.next_to(f2.get_tip(), RIGHT, buff=0.08)

        f2_size = MathTex(r"F = \frac{ev\mu_0 I}{2\pi r}", color=GREEN).scale(0.48)
        f2_size.move_to(MID_CTR + DOWN * 1.75)
        sin2 = MathTex(r"\sin\theta=1", color=ORANGE).scale(0.46)
        sin2.next_to(f2_size, DOWN, buff=0.18)

        case2_group = VGroup(wire2, i2_arrow, i2_lbl, B2_arcs, e2_dot, e2_lbl, neg2,
                             v2, v2_lbl, B2_dot, B2_lbl2, f2, f2_lbl, f2_size, sin2)

        self.play(Create(wire2), FadeIn(i2_arrow), FadeIn(i2_lbl))
        self.play(Create(B2_arcs))
        self.play(Create(e2_dot), FadeIn(e2_lbl), FadeIn(neg2))
        self.wait(0.4)
        self.play(GrowArrow(v2), FadeIn(v2_lbl))
        self.play(FadeIn(B2_dot), FadeIn(B2_lbl2))
        self.wait(0.5)
        self.play(GrowArrow(f2), FadeIn(f2_lbl))
        self.play(Write(f2_size), FadeIn(sin2))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════
        # Step 7: 情形三 —— v 垂直于 v-B 平面（v∥B），F=0
        # ══════════════════════════════════════════════════════════════
        wire3_pos = RIGHT_CTR + LEFT * 1.0 + DOWN * 0.1
        wire3 = Line(wire3_pos + UP * 1.4, wire3_pos + DOWN * 1.4,
                     color=ORANGE, stroke_width=5)
        i3_arrow = arrow_tip(wire3_pos + DOWN * 0.5, wire3_pos + UP * 0.7,
                             color=ORANGE, width=3)
        i3_lbl = Text("I", font=CJK, color=ORANGE).scale(0.38).next_to(wire3, LEFT, buff=0.1)

        B3_arcs = VGroup()
        for ri in [0.4, 0.75, 1.1]:
            arc = Arc(radius=ri, start_angle=PI * 0.25, angle=PI * 1.5,
                      color=CYAN, stroke_width=1.5, stroke_opacity=0.6)
            arc.move_to(wire3_pos)
            B3_arcs.add(arc)

        # 电子位置：导线右侧
        e3_pos = RIGHT_CTR + RIGHT * 0.2
        e3_dot = Dot(e3_pos, radius=0.15, color=RED)
        e3_lbl = Text("e", font=CJK, color=RED).scale(0.38).next_to(e3_dot, UP, buff=0.08)
        neg3   = Text("-", font=CJK, color=RED).scale(0.35).next_to(e3_lbl, LEFT, buff=0.02)

        # B 在该点方向向外（"•"点）
        B3_dot = VGroup(
            Circle(radius=0.15, color=CYAN, stroke_width=2),
            Dot(e3_pos, radius=0.06, color=CYAN),
        )
        # v 方向：也向外（与 B 平行），用"•"点+箭头表示
        v3_dot = VGroup(
            Circle(radius=0.14, color=GREEN, stroke_width=2.5),
            Dot(e3_pos + DOWN * 0.65, radius=0.055, color=GREEN),
        )
        v3_dot[0].move_to(e3_pos + DOWN * 0.65)

        B3_lbl3 = MathTex(r"\mathbf{B}", color=CYAN).scale(0.5)
        B3_lbl3.next_to(B3_dot, RIGHT, buff=0.08)
        v3_lbl = MathTex(r"\mathbf{v}\parallel\mathbf{B}", color=GREEN).scale(0.48)
        v3_lbl.next_to(v3_dot, RIGHT, buff=0.08)

        # 零力标志：大 "×" 叉号（用两条线）
        zero_x1 = Line(e3_pos + UP * 0.35 + LEFT * 0.35,
                        e3_pos + DOWN * 0.35 + RIGHT * 0.35,
                        color=RED, stroke_width=5)
        zero_x2 = Line(e3_pos + UP * 0.35 + RIGHT * 0.35,
                        e3_pos + DOWN * 0.35 + LEFT * 0.35,
                        color=RED, stroke_width=5)

        f3_zero = MathTex(r"\mathbf{F} = \mathbf{0}", color=RED).scale(0.75)
        f3_zero.move_to(RIGHT_CTR + DOWN * 0.9)
        f3_size = MathTex(r"F = ev B\sin 0^{\circ} = 0", color=RED).scale(0.48)
        f3_size.move_to(RIGHT_CTR + DOWN * 1.75)
        sin3 = MathTex(r"\sin\theta=0", color=ORANGE).scale(0.46)
        sin3.next_to(f3_size, DOWN, buff=0.18)

        case3_group = VGroup(wire3, i3_arrow, i3_lbl, B3_arcs, e3_dot, e3_lbl, neg3,
                             B3_dot, B3_lbl3, v3_dot, v3_lbl,
                             zero_x1, zero_x2, f3_zero, f3_size, sin3)

        self.play(Create(wire3), FadeIn(i3_arrow), FadeIn(i3_lbl))
        self.play(Create(B3_arcs))
        self.play(Create(e3_dot), FadeIn(e3_lbl), FadeIn(neg3))
        self.wait(0.4)
        self.play(FadeIn(B3_dot), FadeIn(B3_lbl3))
        self.play(FadeIn(v3_dot), FadeIn(v3_lbl))
        self.wait(0.5)
        # "零力"动画：叉号闪现
        self.play(Create(zero_x1), Create(zero_x2), run_time=0.6)
        self.play(Write(f3_zero))
        self.play(FadeIn(f3_size), FadeIn(sin3))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════
        # Step 8: 底部总结 sinθ 三种取值（短暂展示）
        # ══════════════════════════════════════════════════════════════
        sum_bar = VGroup(
            MathTex(r"\theta_1=90^\circ,\ \sin\theta=1", color=YELLOW).scale(0.48),
            MathTex(r"\theta_2=90^\circ,\ \sin\theta=1", color=YELLOW).scale(0.48),
            MathTex(r"\theta_3=0^\circ,\ \sin\theta=0", color=RED).scale(0.48),
        ).arrange(RIGHT, buff=1.1)
        sum_bar.to_edge(DOWN, buff=0.28)
        self.play(FadeIn(sum_bar))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════
        # Step 9: 清场 → 小结卡
        # ══════════════════════════════════════════════════════════════
        all_scene_objs = VGroup(
            case_labels, sep1, sep2, sum_bar,
            case1_group, case2_group, case3_group,
            zero_x1, zero_x2  # already in case3_group but harmless
        )
        self.play(FadeOut(all_scene_objs))
        self.wait(0.3)

        # ── 小结卡 ────────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s_formula1 = MathTex(r"\mathbf{F}=-e\,\mathbf{v}\times\mathbf{B}", color=YELLOW).scale(0.82)
        s_formula2 = MathTex(r"B=\frac{\mu_0 I}{2\pi r}", color=CYAN).scale(0.82)
        s_formula3 = MathTex(r"F=\frac{ev\mu_0 I}{2\pi r}\sin\theta", color=GREEN).scale(0.82)

        row_labels = VGroup(
            VGroup(Text("情形一", font=CJK, color=YELLOW).scale(0.42),
                   MathTex(r"v\parallel\text{wire},\ \theta=90^\circ,\ F=\frac{ev\mu_0 I}{2\pi r}",
                           color=WHITE).scale(0.45)).arrange(RIGHT, buff=0.18),
            VGroup(Text("情形二", font=CJK, color=YELLOW).scale(0.42),
                   MathTex(r"v\perp\text{wire (radial)},\ \theta=90^\circ,\ F=\frac{ev\mu_0 I}{2\pi r}",
                           color=WHITE).scale(0.45)).arrange(RIGHT, buff=0.18),
            VGroup(Text("情形三", font=CJK, color=RED).scale(0.42),
                   MathTex(r"v\parallel\mathbf{B},\ \theta=0^\circ,\ F=0",
                           color=WHITE).scale(0.45)).arrange(RIGHT, buff=0.18),
        ).arrange(DOWN, buff=0.3, aligned_edge=LEFT)

        formulas_block = VGroup(s_formula1, s_formula2, s_formula3).arrange(DOWN, buff=0.3)
        formulas_block.next_to(s_title, DOWN, buff=0.4)
        row_labels.next_to(formulas_block, DOWN, buff=0.45)
        row_labels.scale_to_fit_width(12.5)

        box = SurroundingRectangle(VGroup(formulas_block, row_labels),
                                   color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_formula1), Write(s_formula2), Write(s_formula3))
        self.wait(0.8)
        for rl in row_labels:
            self.play(FadeIn(rl))
            self.wait(0.4)
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, formulas_block, row_labels, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch08Ex2LorentzForceThreeDirections",
        "id": "phys-ch08-8.4-ex2-lorentz-force-three-directions",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "电子在长直导线磁场中的洛伦兹力方向",
        "description": "用三列并排场景展示电子在长直导线同心圆磁场中以三种不同速度方向运动时洛伦兹力的方向与大小，揭示 sinθ 决定力的大小的物理本质。",
    },
]
