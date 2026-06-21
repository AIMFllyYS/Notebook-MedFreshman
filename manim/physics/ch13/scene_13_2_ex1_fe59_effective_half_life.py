"""第 13.2 节 · 例题：Fe-59 有效半衰期与残留量

教学目标：零基础读者看完真正理解有效半衰期的物理含义及计算方法。

可视化方案：
1. 矩形分数图（并联通道）可视化 1/Te = 1/T + 1/Tb
2. 三条 N/N0-t 曲线：物理衰变（蓝）/ 生物排出（绿）/ 有效总衰减（红）
3. t=Te/2=13.5d 竖线标注，框注计算步骤

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常数
T_PHYS = 46.3   # 物理半衰期 (天)
T_BIO  = 65.0   # 生物半排期 (天)
T_EFF  = 1 / (1/T_PHYS + 1/T_BIO)  # ≈ 27d


class Ch13Ex1Fe59EffectiveHalfLife(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("Fe-59 有效半衰期与残留量", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第13章 原子核与放射性 · 13.2 例题", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("放射性核素进入人体后，活度会因两个原因同时下降：", font=CJK).scale(0.46)
        a2_items = VGroup(
            Text("① 物理衰变：原子核自发蜕变（半衰期 T）", font=CJK, color=YELLOW).scale(0.44),
            Text("② 生物代谢：人体将核素排泄出去（生物半排期 Tb）", font=CJK, color=GREEN).scale(0.44),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        a3 = Text("两条"排泄通道"并联 → 有效半衰期 Te 比两者都短", font=CJK, color=ORANGE).scale(0.44)
        analogy = VGroup(a1, a2_items, a3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.5).scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2_items))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.8)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════════
        # Step 3 · 公式定义（逐步出现）
        # ══════════════════════════════════════════════════════════════════
        lbl_formula = Text("有效衰减常数 = 物理衰减常数 + 生物代谢常数", font=CJK, color=CYAN).scale(0.44)
        lbl_formula.next_to(title, DOWN, buff=0.5)

        eq1 = MathTex(
            r"\frac{1}{T_e}", r"=", r"\frac{1}{T}", r"+", r"\frac{1}{T_b}"
        ).scale(0.9)
        eq1[0].set_color(RED)
        eq1[2].set_color(YELLOW)
        eq1[4].set_color(GREEN)
        eq1.next_to(lbl_formula, DOWN, buff=0.45)

        eq2 = MathTex(
            r"=", r"\frac{1}{46.3}", r"+", r"\frac{1}{65}"
        ).scale(0.9)
        eq2[1].set_color(YELLOW)
        eq2[3].set_color(GREEN)
        eq2.next_to(eq1, DOWN, buff=0.35)

        eq3 = MathTex(r"\Rightarrow\,T_e", r"\approx", r"27\,\mathrm{d}").scale(0.95)
        eq3[0].set_color(RED)
        eq3[2].set_color(RED)
        eq3.next_to(eq2, DOWN, buff=0.35)

        self.play(FadeIn(lbl_formula))
        self.wait(0.4)
        self.play(Write(eq1))
        self.wait(0.8)
        self.play(Write(eq2))
        self.wait(0.8)
        self.play(Write(eq3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(lbl_formula, eq1, eq2, eq3)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4 · 矩形分数图（"并联通道"直觉）
        # ══════════════════════════════════════════════════════════════════
        vis_title = Text("并联衰减通道示意（矩形高度 ∝ 衰减速率）", font=CJK, color=CYAN).scale(0.42)
        vis_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vis_title))

        # 归一化：以最大速率为参考，1/T_EFF = 1/T_PHYS + 1/T_BIO
        rate_phys = 1 / T_PHYS   # 0.0216
        rate_bio  = 1 / T_BIO    # 0.0154
        rate_eff  = 1 / T_EFF    # 0.0370
        max_rate  = rate_eff
        BAR_W  = 2.0
        SCALE  = 5.0 / max_rate  # pixel per rate unit

        # 物理衰变矩形
        h_phys = rate_phys * SCALE
        rect_phys = Rectangle(width=BAR_W, height=h_phys, color=YELLOW, fill_color=YELLOW, fill_opacity=0.45)
        lbl_phys_top = VGroup(
            Text("物理衰变", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"T=46.3\,\mathrm{d}", color=YELLOW).scale(0.5),
        ).arrange(DOWN, buff=0.12)
        lbl_phys_bot = MathTex(r"\frac{1}{T}=0.0216\,\mathrm{d}^{-1}", color=YELLOW).scale(0.45)

        # 生物排出矩形
        h_bio = rate_bio * SCALE
        rect_bio = Rectangle(width=BAR_W, height=h_bio, color=GREEN, fill_color=GREEN, fill_opacity=0.45)
        lbl_bio_top = VGroup(
            Text("生物代谢", font=CJK, color=GREEN).scale(0.36),
            MathTex(r"T_b=65\,\mathrm{d}", color=GREEN).scale(0.5),
        ).arrange(DOWN, buff=0.12)
        lbl_bio_bot = MathTex(r"\frac{1}{T_b}=0.0154\,\mathrm{d}^{-1}", color=GREEN).scale(0.45)

        # 有效矩形
        h_eff = rate_eff * SCALE
        rect_eff = Rectangle(width=BAR_W, height=h_eff, color=RED, fill_color=RED, fill_opacity=0.45)
        lbl_eff_top = VGroup(
            Text("有效总衰减", font=CJK, color=RED).scale(0.36),
            MathTex(r"T_e=27\,\mathrm{d}", color=RED).scale(0.5),
        ).arrange(DOWN, buff=0.12)
        lbl_eff_bot = MathTex(r"\frac{1}{T_e}=0.0370\,\mathrm{d}^{-1}", color=RED).scale(0.45)

        # 排列矩形（底部对齐）
        base_y = -2.0
        rect_phys.move_to([0, 0, 0]).align_to(ORIGIN, DOWN)
        rect_bio.move_to([0, 0, 0]).align_to(ORIGIN, DOWN)
        rect_eff.move_to([0, 0, 0]).align_to(ORIGIN, DOWN)

        rect_phys.move_to([-3.5, base_y + h_phys/2, 0])
        rect_bio.move_to([0.0,  base_y + h_bio/2,  0])
        rect_eff.move_to([3.5,  base_y + h_eff/2,  0])

        # 标签上方
        lbl_phys_top.next_to(rect_phys, UP, buff=0.15)
        lbl_bio_top.next_to(rect_bio,  UP, buff=0.15)
        lbl_eff_top.next_to(rect_eff,  UP, buff=0.15)

        # 标签下方
        lbl_phys_bot.next_to(rect_phys, DOWN, buff=0.15)
        lbl_bio_bot.next_to(rect_bio,   DOWN, buff=0.15)
        lbl_eff_bot.next_to(rect_eff,   DOWN, buff=0.15)

        # 加号 & 等号
        plus_sign = MathTex(r"+").scale(1.0).move_to([-1.75, base_y + h_bio/2, 0])
        eq_sign   = MathTex(r"=").scale(1.0).move_to([1.75,  base_y + h_bio/2, 0])

        bar_group = VGroup(
            rect_phys, rect_bio, rect_eff,
            lbl_phys_top, lbl_bio_top, lbl_eff_top,
            lbl_phys_bot, lbl_bio_bot, lbl_eff_bot,
            plus_sign, eq_sign,
        )

        self.play(
            Create(rect_phys), FadeIn(lbl_phys_top), FadeIn(lbl_phys_bot),
            FadeIn(plus_sign),
        )
        self.wait(0.4)
        self.play(
            Create(rect_bio), FadeIn(lbl_bio_top), FadeIn(lbl_bio_bot),
            FadeIn(eq_sign),
        )
        self.wait(0.4)
        self.play(Create(rect_eff), FadeIn(lbl_eff_top), FadeIn(lbl_eff_bot))
        self.wait(2.0)
        self.play(FadeOut(VGroup(bar_group, vis_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5 · 三条 N/N0-t 曲线
        # ══════════════════════════════════════════════════════════════════
        curve_title = Text("N/N₀ 随时间的衰减曲线", font=CJK, color=CYAN).scale(0.44)
        curve_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(curve_title))

        axes = Axes(
            x_range=[0, 80, 10],
            y_range=[0, 1.1, 0.25],
            x_length=9.5,
            y_length=4.0,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [0, 10, 20, 30, 40, 50, 60, 70, 80]},
            y_axis_config={"numbers_to_include": [0, 0.25, 0.5, 0.75, 1.0]},
        ).next_to(curve_title, DOWN, buff=0.3)

        x_label = MathTex(r"t\;(\mathrm{d})").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_label = MathTex(r"N/N_0").scale(0.5).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))

        # 三条曲线
        curve_phys = axes.plot(
            lambda x: math.pow(0.5, x / T_PHYS),
            x_range=[0, 80],
            color=YELLOW,
        )
        curve_bio = axes.plot(
            lambda x: math.pow(0.5, x / T_BIO),
            x_range=[0, 80],
            color=GREEN,
        )
        curve_eff = axes.plot(
            lambda x: math.pow(0.5, x / T_EFF),
            x_range=[0, 80],
            color=RED,
        )

        lbl_c_phys = VGroup(
            Text("物理衰变", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"T=46.3\,\mathrm{d}", color=YELLOW).scale(0.42),
        ).arrange(DOWN, buff=0.08).move_to(axes.c2p(55, 0.62))

        lbl_c_bio = VGroup(
            Text("生物代谢", font=CJK, color=GREEN).scale(0.36),
            MathTex(r"T_b=65\,\mathrm{d}", color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.08).move_to(axes.c2p(65, 0.49))

        lbl_c_eff = VGroup(
            Text("有效总衰减", font=CJK, color=RED).scale(0.36),
            MathTex(r"T_e=27\,\mathrm{d}", color=RED).scale(0.42),
        ).arrange(DOWN, buff=0.08).move_to(axes.c2p(40, 0.30))

        self.play(Create(curve_phys), FadeIn(lbl_c_phys))
        self.wait(0.5)
        self.play(Create(curve_bio), FadeIn(lbl_c_bio))
        self.wait(0.5)
        self.play(Create(curve_eff), FadeIn(lbl_c_eff))
        self.wait(1.2)

        # ── Step 6: 在 t = 13.5d 处画竖线标注 ──────────────────────────
        t_half_eff = T_EFF / 2  # = 13.5d
        val_phys_at_half = math.pow(0.5, t_half_eff / T_PHYS)   # ≈ 0.829
        val_bio_at_half  = math.pow(0.5, t_half_eff / T_BIO)    # ≈ 0.873
        val_eff_at_half  = math.pow(0.5, t_half_eff / T_EFF)    # ≈ 0.707 = 1/√2

        vline = DashedLine(
            axes.c2p(t_half_eff, 0),
            axes.c2p(t_half_eff, 1.05),
            color=CYAN,
            stroke_width=2,
        )
        lbl_t = VGroup(
            MathTex(r"t=13.5\,\mathrm{d}", color=CYAN).scale(0.5),
            MathTex(r"=T_e/2", color=CYAN).scale(0.5),
        ).arrange(DOWN, buff=0.1).next_to(vline, RIGHT, buff=0.08).shift(UP * 0.5)

        # 三个标注点
        dot_phys = Dot(axes.c2p(t_half_eff, val_phys_at_half), color=YELLOW, radius=0.09)
        dot_bio  = Dot(axes.c2p(t_half_eff, val_bio_at_half),  color=GREEN,  radius=0.09)
        dot_eff  = Dot(axes.c2p(t_half_eff, val_eff_at_half),  color=RED,    radius=0.09)

        lbl_val_phys = MathTex(r"0.83", color=YELLOW).scale(0.42).next_to(dot_phys, LEFT, buff=0.12)
        lbl_val_bio  = MathTex(r"0.87", color=GREEN).scale(0.42).next_to(dot_bio,  LEFT, buff=0.12)
        lbl_val_eff  = MathTex(r"0.707", color=RED).scale(0.42).next_to(dot_eff,  LEFT, buff=0.12)

        self.play(Create(vline), FadeIn(lbl_t))
        self.wait(0.5)
        self.play(FadeIn(dot_phys), FadeIn(lbl_val_phys))
        self.play(FadeIn(dot_bio),  FadeIn(lbl_val_bio))
        self.play(FadeIn(dot_eff),  FadeIn(lbl_val_eff))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            axes, x_label, y_label,
            curve_phys, curve_bio, curve_eff,
            lbl_c_phys, lbl_c_bio, lbl_c_eff,
            vline, lbl_t,
            dot_phys, dot_bio, dot_eff,
            lbl_val_phys, lbl_val_bio, lbl_val_eff,
            curve_title,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 7 · 框注计算步骤
        # ══════════════════════════════════════════════════════════════════
        calc_title = Text("计算 t=13.5d 时的残留量", font=CJK, color=CYAN).scale(0.44)
        calc_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_title))

        step_a_lbl = Text("已知：", font=CJK, color=WHITE).scale(0.44)
        step_a_eq  = MathTex(
            r"T_e = 27\,\mathrm{d},\quad t = 13.5\,\mathrm{d} = \frac{T_e}{2}"
        ).scale(0.72)
        step_a = VGroup(step_a_lbl, step_a_eq).arrange(RIGHT, buff=0.2)

        step_b_lbl = Text("代入公式：", font=CJK, color=WHITE).scale(0.44)
        step_b_eq  = MathTex(
            r"\frac{N}{N_0}", r"=",
            r"\left(\frac{1}{2}\right)^{t/T_e}",
            r"=",
            r"\left(\frac{1}{2}\right)^{13.5/27}",
        ).scale(0.72)
        step_b_eq[2].set_color(YELLOW)
        step_b_eq[4].set_color(ORANGE)
        step_b = VGroup(step_b_lbl, step_b_eq).arrange(RIGHT, buff=0.2)

        step_c_lbl = Text("化简：", font=CJK, color=WHITE).scale(0.44)
        step_c_eq  = MathTex(
            r"=",
            r"\left(\frac{1}{2}\right)^{0.5}",
            r"=",
            r"\frac{1}{\sqrt{2}}",
            r"\approx",
            r"0.707",
            r"= 70.7\%",
        ).scale(0.72)
        step_c_eq[1].set_color(ORANGE)
        step_c_eq[3].set_color(GREEN)
        step_c_eq[5].set_color(GREEN)
        step_c_eq[6].set_color(GREEN)
        step_c = VGroup(step_c_lbl, step_c_eq).arrange(RIGHT, buff=0.2)

        steps = VGroup(step_a, step_b, step_c).arrange(DOWN, buff=0.5, aligned_edge=LEFT)
        steps.next_to(calc_title, DOWN, buff=0.45).scale_to_fit_width(12.0)

        box = SurroundingRectangle(steps, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(step_a))
        self.wait(0.6)
        self.play(FadeIn(step_b))
        self.wait(0.8)
        self.play(FadeIn(step_c), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(calc_title, steps, box)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8 · 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1_lbl = Text("有效半衰期公式：", font=CJK, color=WHITE).scale(0.42)
        s1_eq  = MathTex(
            r"\frac{1}{T_e}=\frac{1}{T}+\frac{1}{T_b}", color=YELLOW
        ).scale(0.78)
        s1 = VGroup(s1_lbl, s1_eq).arrange(RIGHT, buff=0.2)

        s2_lbl = Text("Fe-59 数值：", font=CJK, color=WHITE).scale(0.42)
        s2_eq  = MathTex(
            r"\frac{1}{46.3}+\frac{1}{65}\ \Rightarrow\ T_e\approx 27\,\mathrm{d}", color=YELLOW
        ).scale(0.72)
        s2 = VGroup(s2_lbl, s2_eq).arrange(RIGHT, buff=0.2)

        s3_lbl = Text("残留量公式：", font=CJK, color=WHITE).scale(0.42)
        s3_eq  = MathTex(
            r"\frac{N}{N_0}=\left(\frac{1}{2}\right)^{t/T_e}", color=YELLOW
        ).scale(0.78)
        s3 = VGroup(s3_lbl, s3_eq).arrange(RIGHT, buff=0.2)

        s4_lbl = Text("t=13.5d 时：", font=CJK, color=WHITE).scale(0.42)
        s4_eq  = MathTex(
            r"\frac{N}{N_0}=\left(\frac{1}{2}\right)^{0.5}=70.7\%", color=GREEN
        ).scale(0.78)
        s4 = VGroup(s4_lbl, s4_eq).arrange(RIGHT, buff=0.2)

        s5 = Text("有效半衰期 Te < T 且 Te < Tb，有效衰减比任一单通道都快", font=CJK, color=ORANGE).scale(0.40)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4).scale_to_fit_width(12.5)
        sbox = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(s1), Write(s2))
        self.wait(0.6)
        self.play(Write(s3), Write(s4))
        self.wait(0.6)
        self.play(FadeIn(s5), Create(sbox))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, sbox, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch13Ex1Fe59EffectiveHalfLife",
        "id": "phys-ch13-13.2-ex1-fe59-effective-half-life",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "Fe-59 有效半衰期与残留量",
        "description": "通过并联通道矩形图与三条衰减曲线，直观演示 Fe-59 的物理衰变、生物代谢和有效总衰减，并逐步计算 t=13.5d 时体内残留量为 70.7%。",
    }
]
