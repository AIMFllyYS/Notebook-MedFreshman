"""第 14.2 节 · 粒子数反转分布（激光核心条件）

动画结构：
  1. 标题
  2. 生活类比（"人群倒置"）
  3. 玻尔兹曼分布定义与公式
  4. 左侧：热平衡柱状图 + ValueTracker 升温演示
  5. 右侧：三能级泵浦过程动画（E1→E3→E2积累）
  6. N2>N1 粒子数反转高亮
  7. 受激辐射链式放大（光子 1→2→4→8）
  8. 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch14Kp2PopulationInversion(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("粒子数反转分布", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第十四章 X 射线与激光 · 14.2", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ──────────────────────────────────────────────
        ana1 = Text("正常情况：教室里大多数人坐着（低能级），少数人站着（高能级）。",
                    font=CJK).scale(0.45)
        ana2 = Text("「粒子数反转」= 站着的人比坐着的多 —— 这是激光的必要条件！",
                    font=CJK, color=YELLOW).scale(0.45)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 玻尔兹曼分布公式（逐步出现） ─────────────────────────
        def_zh = Text("热平衡下，高能级粒子数由玻尔兹曼因子决定：",
                      font=CJK).scale(0.46).next_to(title, DOWN, buff=0.55)
        boltz = MathTex(
            r"\frac{N_2}{N_1}",
            r"=",
            r"e^{-(E_2 - E_1)/kT}"
        ).scale(0.9).next_to(def_zh, DOWN, buff=0.4)
        boltz[0].set_color(YELLOW)
        boltz[2].set_color(CYAN)

        cond_normal = MathTex(
            r"T > 0\,\mathrm{K}",
            r"\Rightarrow",
            r"N_2 < N_1",
            r"\quad(\text{normal})"
        ).scale(0.75)
        cond_normal[2].set_color(RED)
        cond_normal.next_to(boltz, DOWN, buff=0.35)

        self.play(FadeIn(def_zh))
        self.play(Write(boltz))
        self.wait(1.2)
        self.play(FadeIn(cond_normal))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_zh, boltz, cond_normal)))

        # ── Step 4: 双面板布局准备 ────────────────────────────────────────
        # 左侧：热平衡柱状图；右侧：三能级能级图
        panel_y = -0.2  # 面板中心 y
        divider = DashedLine(
            start=UP * 2.8 + RIGHT * 0.0,
            end=DOWN * 3.2 + RIGHT * 0.0,
            color=GRAY, dash_length=0.15
        )

        left_label = Text("热平衡分布", font=CJK, color=BLUE).scale(0.45)
        left_label.move_to(LEFT * 3.3 + UP * 2.65)
        right_label = Text("三能级泵浦过程", font=CJK, color=BLUE).scale(0.45)
        right_label.move_to(RIGHT * 3.3 + UP * 2.65)

        self.play(Create(divider), FadeIn(left_label), FadeIn(right_label))
        self.wait(0.5)

        # ── Step 4a: 左侧热平衡柱状图 + ValueTracker 温度 ────────────────
        T_tracker = ValueTracker(300.0)  # 温度 K

        BAR_W = 0.7
        BAR_X_N1 = -4.8
        BAR_X_N2 = -3.6
        BAR_BASE_Y = -2.4
        MAX_H = 3.2  # N1 满高度

        def make_bars():
            T = T_tracker.get_value()
            delta_E_over_k = 1500.0  # ΔE/k (K)，令 N2/N1 ≈ e^{-5} 在 T=300K
            ratio = math.exp(-delta_E_over_k / T)  # N2/N1
            h1 = MAX_H
            h2 = MAX_H * ratio

            bar1 = Rectangle(
                width=BAR_W, height=h1,
                fill_color=BLUE, fill_opacity=0.85, stroke_color=WHITE, stroke_width=1.5
            ).move_to([BAR_X_N1, BAR_BASE_Y + h1 / 2, 0])

            bar2 = Rectangle(
                width=BAR_W, height=max(h2, 0.04),
                fill_color=BLUE, fill_opacity=0.85, stroke_color=WHITE, stroke_width=1.5
            ).move_to([BAR_X_N2, BAR_BASE_Y + max(h2, 0.04) / 2, 0])

            lbl1 = MathTex(r"N_1", color=WHITE).scale(0.55)
            lbl1.next_to(bar1, DOWN, buff=0.12)
            lbl2 = MathTex(r"N_2", color=WHITE).scale(0.55)
            lbl2.next_to(bar2, DOWN, buff=0.12)

            return VGroup(bar1, bar2, lbl1, lbl2)

        bars = always_redraw(make_bars)

        # 温度读数
        T_readout = always_redraw(
            lambda: VGroup(
                Text("T = ", font=CJK).scale(0.42),
                MathTex(rf"{T_tracker.get_value():.0f}", r"\,\mathrm{K}", color=ORANGE).scale(0.52)
            ).arrange(RIGHT, buff=0.08).move_to([-4.2, -3.1, 0])
        )

        # 玻尔兹曼因子标注（静态，放在图右上）
        boltz_note = MathTex(r"\propto e^{-\Delta E/kT}", color=CYAN).scale(0.55)
        boltz_note.move_to([-3.5, 0.7, 0])

        self.play(Create(bars), FadeIn(T_readout), FadeIn(boltz_note))
        self.wait(0.8)

        # 升温演示
        heat_tip = Text("升温 → N2/N1 比值增大，但始终 < 1", font=CJK, color=ORANGE).scale(0.38)
        heat_tip.move_to([-3.7, 1.4, 0])
        self.play(FadeIn(heat_tip))
        self.play(T_tracker.animate.set_value(3000.0), run_time=2.5)
        self.wait(0.8)
        self.play(T_tracker.animate.set_value(300.0), run_time=1.5)
        self.wait(0.8)
        self.play(FadeOut(heat_tip))

        # ── Step 4b: 右侧三能级能级图 ─────────────────────────────────────
        E_X = 1.2   # 能级线左端 x
        E_W = 2.2   # 能级线宽
        E1_Y = -2.2
        E2_Y = -0.4
        E3_Y = 1.6

        def energy_level(y, label_str, color=WHITE):
            line = Line([E_X, y, 0], [E_X + E_W, y, 0], color=color, stroke_width=2.5)
            lbl = MathTex(label_str, color=color).scale(0.55)
            lbl.next_to(line, RIGHT, buff=0.15)
            return VGroup(line, lbl)

        e1_grp = energy_level(E1_Y, r"E_1", color=WHITE)
        e2_grp = energy_level(E2_Y, r"E_2", color=GREEN)
        e3_grp = energy_level(E3_Y, r"E_3", color=RED)

        # 亚稳态标注
        metastable = Text("亚稳态", font=CJK, color=GREEN).scale(0.38)
        metastable.next_to(e2_grp, LEFT, buff=0.2)

        self.play(Create(e1_grp), Create(e2_grp), Create(e3_grp))
        self.play(FadeIn(metastable))
        self.wait(0.6)

        # ── Step 5: 泵浦过程动画（E1→E3→E2） ────────────────────────────
        # 泵浦光子：E1 → E3
        pump_arrow = Arrow(
            start=[E_X + E_W / 2 - 0.3, E1_Y, 0],
            end=[E_X + E_W / 2 - 0.3, E3_Y, 0],
            color=YELLOW, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.15
        )
        pump_label = Text("泵浦光", font=CJK, color=YELLOW).scale(0.42)
        pump_label.next_to(pump_arrow, LEFT, buff=0.12)

        self.play(Create(pump_arrow), FadeIn(pump_label))
        self.wait(0.8)

        # 快速无辐射：E3 → E2
        nr_arrow = Arrow(
            start=[E_X + E_W / 2 + 0.15, E3_Y, 0],
            end=[E_X + E_W / 2 + 0.15, E2_Y, 0],
            color=ORANGE, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.15
        )
        nr_label = Text("快速无辐射", font=CJK, color=ORANGE).scale(0.38)
        nr_label.next_to(nr_arrow, RIGHT, buff=0.1)

        self.play(Create(nr_arrow), FadeIn(nr_label))
        self.wait(0.8)

        # 粒子在 E2 积累：逐渐增多的点
        accumulate_dots = VGroup()
        for i in range(6):
            dot = Dot(
                point=[E_X + 0.3 + i * 0.27, E2_Y + 0.18, 0],
                radius=0.1, color=GREEN
            )
            accumulate_dots.add(dot)

        accum_tip = Text("粒子积累在 E2 亚稳态", font=CJK, color=GREEN).scale(0.4)
        accum_tip.move_to([E_X + E_W / 2 + 0.3, E2_Y + 0.55, 0])

        self.play(LaggedStart(*[GrowFromCenter(d) for d in accumulate_dots], lag_ratio=0.2),
                  FadeIn(accum_tip))
        self.wait(1.2)

        # ── Step 6: N2 柱高超过 N1 —— 粒子数反转 ─────────────────────────
        # 移除 always_redraw 柱，换成固定的「反转态」柱
        self.play(FadeOut(bars), FadeOut(T_readout), FadeOut(boltz_note))
        self.wait(0.3)

        h1_inv = 1.4
        h2_inv = MAX_H  # N2 现在更高

        bar1_inv = Rectangle(
            width=BAR_W, height=h1_inv,
            fill_color=BLUE, fill_opacity=0.85, stroke_color=WHITE, stroke_width=1.5
        ).move_to([BAR_X_N1, BAR_BASE_Y + h1_inv / 2, 0])

        bar2_inv = Rectangle(
            width=BAR_W, height=h2_inv,
            fill_color=GREEN, fill_opacity=0.9, stroke_color=YELLOW, stroke_width=2.5
        ).move_to([BAR_X_N2, BAR_BASE_Y + h2_inv / 2, 0])

        lbl1_inv = MathTex(r"N_1", color=WHITE).scale(0.55).next_to(bar1_inv, DOWN, buff=0.12)
        lbl2_inv = MathTex(r"N_2", color=YELLOW).scale(0.55).next_to(bar2_inv, DOWN, buff=0.12)

        inv_bars = VGroup(bar1_inv, bar2_inv, lbl1_inv, lbl2_inv)

        inversion_text = Text("粒子数反转！", font=CJK, color=GREEN).scale(0.58)
        inversion_text.move_to([-4.2, 1.1, 0])

        ratio_label = MathTex(r"N_2 > N_1", color=GREEN).scale(0.75)
        ratio_label.move_to([-4.2, 0.45, 0])

        self.play(FadeIn(inv_bars))
        self.wait(0.5)
        self.play(Write(inversion_text), Write(ratio_label))

        # 闪烁高亮
        self.play(bar2_inv.animate.set_fill(YELLOW, opacity=1.0), run_time=0.4)
        self.play(bar2_inv.animate.set_fill(GREEN, opacity=0.9), run_time=0.4)
        self.play(bar2_inv.animate.set_fill(YELLOW, opacity=1.0), run_time=0.4)
        self.play(bar2_inv.animate.set_fill(GREEN, opacity=0.9), run_time=0.4)
        self.wait(1.0)

        # ── Step 7: 受激辐射链式放大 光子 1→2→4→8 ──────────────────────
        # 清除部分右侧内容，腾出空间
        self.play(FadeOut(VGroup(
            pump_arrow, pump_label, nr_arrow, nr_label,
            accumulate_dots, accum_tip,
            e1_grp, e2_grp, e3_grp, metastable,
            right_label
        )))
        self.wait(0.3)

        amp_title = Text("受激辐射链式放大", font=CJK, color=BLUE).scale(0.48)
        amp_title.move_to([3.3, 2.65, 0])
        self.play(FadeIn(amp_title))

        # 画一条光子传播轴
        photon_axis = Arrow(
            start=[0.5, 0.0, 0], end=[6.0, 0.0, 0],
            color=GRAY, buff=0, stroke_width=1.5,
            max_tip_length_to_length_ratio=0.07
        )
        self.play(Create(photon_axis))

        def photon_dot(x, y):
            return Dot(point=[x, y, 0], radius=0.12, color=YELLOW)

        def stim_label(txt, x, y):
            return Text(txt, font=CJK, color=ORANGE).scale(0.35).move_to([x, y, 0])

        # 1 个光子
        ph_1 = VGroup(photon_dot(0.9, 0.0))
        c1 = MathTex(r"\times 1", color=YELLOW).scale(0.55).move_to([0.9, 0.45, 0])
        self.play(FadeIn(ph_1), FadeIn(c1))
        self.wait(0.6)

        # 受激辐射 → 2
        ph_2 = VGroup(photon_dot(2.1, 0.22), photon_dot(2.1, -0.22))
        c2 = MathTex(r"\times 2", color=YELLOW).scale(0.55).move_to([2.1, 0.7, 0])
        arr12 = Arrow([1.25, 0, 0], [1.7, 0, 0], color=GREEN, buff=0,
                      stroke_width=2, max_tip_length_to_length_ratio=0.25)
        self.play(Create(arr12))
        self.play(FadeIn(ph_2), FadeIn(c2))
        self.wait(0.5)

        # 再受激辐射 → 4
        ph_4 = VGroup(
            photon_dot(3.3, 0.45), photon_dot(3.3, 0.15),
            photon_dot(3.3, -0.15), photon_dot(3.3, -0.45)
        )
        c4 = MathTex(r"\times 4", color=YELLOW).scale(0.55).move_to([3.3, 0.9, 0])
        arr24 = Arrow([2.5, 0, 0], [2.95, 0, 0], color=GREEN, buff=0,
                      stroke_width=2, max_tip_length_to_length_ratio=0.25)
        self.play(Create(arr24))
        self.play(FadeIn(ph_4), FadeIn(c4))
        self.wait(0.5)

        # 再受激辐射 → 8
        ph_8_dots = []
        xs8 = [4.5] * 8
        ys8 = [0.6, 0.3, 0.0, -0.3, -0.6, 0.45, 0.15, -0.45]
        for i in range(8):
            ph_8_dots.append(photon_dot(xs8[i] + (i % 2) * 0.18, ys8[i]))
        ph_8 = VGroup(*ph_8_dots)
        c8 = MathTex(r"\times 8", color=YELLOW).scale(0.55).move_to([4.55, 1.1, 0])
        arr48 = Arrow([3.72, 0, 0], [4.15, 0, 0], color=GREEN, buff=0,
                      stroke_width=2, max_tip_length_to_length_ratio=0.25)
        self.play(Create(arr48))
        self.play(FadeIn(ph_8), FadeIn(c8))
        self.wait(0.8)

        # 指数说明
        exp_note = VGroup(
            Text("光子数：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"1 \to 2 \to 4 \to 8 \to \cdots \to 2^n", color=GREEN).scale(0.62)
        ).arrange(RIGHT, buff=0.12).move_to([3.3, -1.8, 0])
        self.play(FadeIn(exp_note))
        self.wait(1.5)

        # 清场
        self.play(FadeOut(VGroup(
            photon_axis, ph_1, c1, ph_2, c2, ph_4, c4, ph_8, c8,
            arr12, arr24, arr48, exp_note, amp_title
        )))
        self.wait(0.3)
        self.play(FadeOut(VGroup(
            inv_bars, inversion_text, ratio_label,
            left_label, divider
        )))

        # ── Step 8: 小结卡 ────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1 = VGroup(
            Text("热平衡：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"\frac{N_2}{N_1} = e^{-(E_2-E_1)/kT} < 1", color=CYAN).scale(0.72)
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("反转条件：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"N_2 > N_1", color=GREEN).scale(0.72)
        ).arrange(RIGHT, buff=0.15)

        s3 = VGroup(
            Text("实现途径：三能级泵浦，利用亚稳态积累粒子",
                 font=CJK, color=ORANGE).scale(0.44)
        )

        s4 = VGroup(
            Text("效果：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"1 \to 2^n", color=YELLOW).scale(0.72),
            Text("受激辐射链式放大（激光诞生）", font=CJK, color=YELLOW).scale(0.44)
        ).arrange(RIGHT, buff=0.12)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(Write(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Kp2PopulationInversion",
        "id": "phys-ch14-14.2-kp2-population-inversion",
        "chapterId": "ch14",
        "sectionId": "14.2",
        "title": "粒子数反转分布",
        "description": "用柱状图+三能级泵浦过程+链式放大动画，逐步演示热平衡分布、粒子数反转条件与受激辐射倍增原理。",
    },
]
