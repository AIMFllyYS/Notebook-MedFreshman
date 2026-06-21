"""第 4.2 节 · 波的能量：动能势能同步与能流强度

教学目标：让零基础读者理解：
1. 波动中动能与势能同相（同时最大、同时最小），区别于弹簧振子的反相；
2. 能量密度公式 w = ρA²ω²sin²[…] 及时间平均 w̄ = ½ρA²ω²；
3. 能流密度（强度）I = w̄·u，以及 I∝A²∝ω² 的比例关系。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch04Kp1WaveEnergyDensity",
        "id": "phys-ch04-4.2-kp1-wave-energy-density",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "波的能量：动能势能同步与能流强度",
        "description": "可视化演示行波中动能与势能同相变化，对比弹簧振子反相；ValueTracker 驱动高能量区随波传播；逐步导出能量密度与能流强度公式。",
    },
]


class Ch04Kp1WaveEnergyDensity(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("波的能量：动能势能同步与能流强度", font=CJK, color=BLUE).scale(0.60)
        title.to_edge(UP, buff=0.28)
        subtitle = Text("第四章 机械波 · 4.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("扔石头入水，涟漪向外扩散——水面升起又落下，", font=CJK).scale(0.46)
        ana2 = Text("但真正「跑出去」的不是水，而是能量。", font=CJK).scale(0.46)
        ana3 = Text("能量到底藏在波形的哪里？怎么随波传播？", font=CJK, color=YELLOW).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana_grp))

        # ── Step 3: 体积元 ΔV 的概念 ───────────────────────────────────
        concept_title = Text("取介质中一个体积元 ΔV", font=CJK, color=CYAN).scale(0.48)
        concept_title.next_to(title, DOWN, buff=0.45)

        # 用矩形示意体积元
        dv_rect = Rectangle(width=0.6, height=1.2, color=YELLOW, fill_color=YELLOW, fill_opacity=0.35)
        dv_rect.next_to(concept_title, DOWN, buff=0.5)

        dv_label = MathTex(r"\Delta V", color=YELLOW).scale(0.65)
        dv_label.next_to(dv_rect, DOWN, buff=0.18)

        c1 = Text("质量：", font=CJK).scale(0.42)
        c1_eq = MathTex(r"\Delta m = \rho \,\Delta V").scale(0.62)
        c1_row = VGroup(c1, c1_eq).arrange(RIGHT, buff=0.1)

        c2 = Text("速度：", font=CJK).scale(0.42)
        c2_eq = MathTex(r"v_y = \frac{\partial y}{\partial t} = -A\omega\sin[\,\cdots\,]").scale(0.62)
        c2_row = VGroup(c2, c2_eq).arrange(RIGHT, buff=0.1)

        info = VGroup(c1_row, c2_row).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        info.next_to(dv_rect, RIGHT, buff=0.7)

        self.play(FadeIn(concept_title))
        self.play(FadeIn(dv_rect), FadeIn(dv_label))
        self.wait(0.5)
        self.play(FadeIn(c1_row))
        self.wait(0.6)
        self.play(FadeIn(c2_row))
        self.wait(1.4)
        self.play(FadeOut(VGroup(concept_title, dv_rect, dv_label, info)))

        # ── Step 4: 动能公式推导 ────────────────────────────────────────
        deriv_title = Text("动能与势能推导", font=CJK, color=CYAN).scale(0.48)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        ek1 = MathTex(
            r"\Delta E_k", r"=", r"\frac{1}{2}\Delta m\, v_y^2"
        ).scale(0.78)
        ek1.next_to(deriv_title, DOWN, buff=0.45)
        ek1[0].set_color(BLUE)
        ek1[2].set_color(WHITE)

        ek2 = MathTex(
            r"\Delta E_k", r"=",
            r"\frac{1}{2}\rho\Delta V\,A^2\omega^2",
            r"\sin^2\!\left[\omega\!\left(t-\frac{x}{u}\right)\right]"
        ).scale(0.72)
        ek2.next_to(ek1, DOWN, buff=0.32)
        ek2[0].set_color(BLUE)
        ek2[2].set_color(BLUE_B)
        ek2[3].set_color(ORANGE)

        self.play(Write(ek1))
        self.wait(0.8)
        self.play(TransformMatchingTex(ek1.copy(), ek2))
        self.wait(0.8)

        ep_label = Text("弹性势能（对介质形变分析，结果相同）：", font=CJK).scale(0.40)
        ep_label.next_to(ek2, DOWN, buff=0.35)

        ep_eq = MathTex(
            r"\Delta E_p", r"=",
            r"\frac{1}{2}\rho\Delta V\,A^2\omega^2",
            r"\sin^2\!\left[\omega\!\left(t-\frac{x}{u}\right)\right]"
        ).scale(0.72)
        ep_eq.next_to(ep_label, DOWN, buff=0.22)
        ep_eq[0].set_color(ORANGE)
        ep_eq[2].set_color(ORANGE)
        ep_eq[3].set_color(ORANGE)

        self.play(FadeIn(ep_label))
        self.play(Write(ep_eq))
        self.wait(0.8)

        highlight = Text("结论：动能与势能完全同相！", font=CJK, color=YELLOW).scale(0.50)
        highlight.next_to(ep_eq, DOWN, buff=0.32)
        self.play(FadeIn(highlight))
        self.wait(1.8)
        self.play(FadeOut(VGroup(deriv_title, ek1, ek2, ep_label, ep_eq, highlight)))

        # ── Step 5: 波 vs 振子——同相 vs 反相对比 ───────────────────────
        compare_title = Text("波动 vs 弹簧振子：能量变化的本质区别", font=CJK, color=CYAN).scale(0.46)
        compare_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(compare_title))

        # 左侧：波动能量（同相）——两个柱状图同步
        wave_label = Text("行波中体积元 ΔV", font=CJK, color=YELLOW).scale(0.40)
        wave_label.shift(LEFT * 3.2 + UP * 1.3)

        # 振子标签（右侧）
        osc_label = Text("弹簧-质点振子", font=CJK, color=GREEN).scale(0.40)
        osc_label.shift(RIGHT * 2.6 + UP * 1.3)

        self.play(FadeIn(wave_label), FadeIn(osc_label))
        self.wait(0.5)

        # 用 ValueTracker 驱动相位
        phase = ValueTracker(PI / 2)  # sin² 起点

        bar_h_max = 2.0  # 最大柱高

        def make_wave_bars():
            phi = phase.get_value()
            sin2 = math.sin(phi) ** 2
            # 动能柱（蓝色）
            ek_h = max(bar_h_max * sin2, 0.02)
            ek_bar = Rectangle(width=0.55, height=ek_h, color=BLUE, fill_color=BLUE, fill_opacity=0.85)
            ek_bar.move_to(LEFT * 3.7 + DOWN * (0.5 + bar_h_max / 2 - ek_h / 2))

            ek_lbl = MathTex(r"\Delta E_k", color=BLUE).scale(0.50)
            ek_lbl.next_to(ek_bar, DOWN, buff=0.12)

            # 势能柱（橙色）
            ep_h = max(bar_h_max * sin2, 0.02)
            ep_bar = Rectangle(width=0.55, height=ep_h, color=ORANGE, fill_color=ORANGE, fill_opacity=0.85)
            ep_bar.move_to(LEFT * 2.9 + DOWN * (0.5 + bar_h_max / 2 - ep_h / 2))

            ep_lbl = MathTex(r"\Delta E_p", color=ORANGE).scale(0.50)
            ep_lbl.next_to(ep_bar, DOWN, buff=0.12)

            return VGroup(ek_bar, ek_lbl, ep_bar, ep_lbl)

        def make_osc_bars():
            phi = phase.get_value()
            sin2 = math.sin(phi) ** 2
            cos2 = math.cos(phi) ** 2
            # 振子动能（蓝）∝ cos²（与势能反相）
            ek_h = max(bar_h_max * cos2, 0.02)
            ek_bar = Rectangle(width=0.55, height=ek_h, color=BLUE, fill_color=BLUE, fill_opacity=0.85)
            ek_bar.move_to(RIGHT * 2.1 + DOWN * (0.5 + bar_h_max / 2 - ek_h / 2))

            ek_lbl = MathTex(r"E_k", color=BLUE).scale(0.50)
            ek_lbl.next_to(ek_bar, DOWN, buff=0.12)

            # 振子势能（橙）∝ sin²
            ep_h = max(bar_h_max * sin2, 0.02)
            ep_bar = Rectangle(width=0.55, height=ep_h, color=ORANGE, fill_color=ORANGE, fill_opacity=0.85)
            ep_bar.move_to(RIGHT * 2.9 + DOWN * (0.5 + bar_h_max / 2 - ep_h / 2))

            ep_lbl = MathTex(r"E_p", color=ORANGE).scale(0.50)
            ep_lbl.next_to(ep_bar, DOWN, buff=0.12)

            return VGroup(ek_bar, ek_lbl, ep_bar, ep_lbl)

        wave_bars = always_redraw(make_wave_bars)
        osc_bars = always_redraw(make_osc_bars)

        # 同相/反相注解
        sync_note = Text("同相（同升同降）", font=CJK, color=YELLOW).scale(0.40)
        sync_note.move_to(LEFT * 3.3 + DOWN * 2.85)
        anti_note = Text("反相（此消彼长）", font=CJK, color=RED).scale(0.40)
        anti_note.move_to(RIGHT * 2.5 + DOWN * 2.85)

        # 分隔竖线
        divider = DashedLine(UP * 1.6 + ORIGIN, DOWN * 3.0 + ORIGIN, color=GRAY, stroke_width=1.5)

        self.play(Create(wave_bars), Create(osc_bars), Create(divider))
        self.play(FadeIn(sync_note), FadeIn(anti_note))
        self.wait(0.5)
        # 让相位变化，展示动态对比
        self.play(phase.animate.set_value(PI / 2 + 2 * PI), run_time=5, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(VGroup(compare_title, wave_label, osc_label,
                                  wave_bars, osc_bars, divider, sync_note, anti_note)))

        # ── Step 6: 坐标系+行波+高能区随波移动 ────────────────────────────
        axes_title = Text("高能量区随波传播演示", font=CJK, color=CYAN).scale(0.48)
        axes_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(axes_title))

        A_val, k_val, omega_val, u_val = 1.0, 1.0, 1.6, 1.6
        axes = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.5, 1.5, 1],
            x_length=10.5,
            y_length=2.5,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.6)
        x_lbl = MathTex(r"x").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = MathTex(r"y").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        t_tracker = ValueTracker(0.0)

        wave_curve = always_redraw(
            lambda: axes.plot(
                lambda x: A_val * math.sin(k_val * x - omega_val * t_tracker.get_value()),
                x_range=[0.05, 4 * PI - 0.05],
                color=YELLOW,
                stroke_width=2.5,
            )
        )
        self.play(Create(wave_curve))

        # 高能量区域 = 坡度最大处（平衡位置附近），即 sin²=1 时
        # 用一个随时间移动的竖向高亮矩形标注
        def make_energy_highlight():
            t_val = t_tracker.get_value()
            # sin(kx - ωt) = ±1 时能量最大 → kx - ωt = ±π/2
            # 最近的高能量中心 x = (ωt + π/2) / k
            x_center = (omega_val * t_val + PI / 2) / k_val
            # 包含在轴范围内
            x_center = x_center % (2 * PI / k_val)
            if x_center < 0.3 or x_center > 4 * PI - 0.3:
                x_center = 0.3
            x_left = max(x_center - 0.55, 0.05)
            x_right = min(x_center + 0.55, 4 * PI - 0.05)
            p_left = axes.c2p(x_left, -1.4)
            p_right = axes.c2p(x_right, 1.4)
            rect = Rectangle(
                width=abs(p_right[0] - p_left[0]),
                height=abs(p_right[1] - p_left[1]),
                color=RED,
                fill_color=RED,
                fill_opacity=0.18,
                stroke_width=1.8,
            )
            rect.move_to(axes.c2p(x_center, 0))
            return rect

        energy_zone = always_redraw(make_energy_highlight)

        zone_cap = Text("红框=高能区（斜率最大，质点速度最大）", font=CJK, color=RED).scale(0.40)
        zone_cap.to_edge(DOWN, buff=0.42)
        self.play(Create(energy_zone), FadeIn(zone_cap))
        self.wait(0.4)
        self.play(t_tracker.animate.set_value(3 * PI / omega_val), run_time=5, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(VGroup(axes_title, axes, x_lbl, y_lbl,
                                  wave_curve, energy_zone, zone_cap)))

        # ── Step 7: 能量密度公式 ────────────────────────────────────────
        formula_title = Text("单位体积总能量（能量密度）", font=CJK, color=CYAN).scale(0.48)
        formula_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(formula_title))

        w_step1_label = Text("瞬时能量密度：", font=CJK).scale(0.44)
        w_step1_eq = MathTex(
            r"w = \frac{\Delta E_k + \Delta E_p}{\Delta V}",
            r"= \rho A^2\omega^2\sin^2\!\left[\omega\!\left(t-\frac{x}{u}\right)\right]"
        ).scale(0.70)
        w_step1_eq[1].set_color(YELLOW)
        w_step1_row = VGroup(w_step1_label, w_step1_eq).arrange(RIGHT, buff=0.18)
        w_step1_row.next_to(formula_title, DOWN, buff=0.52)
        w_step1_row.scale_to_fit_width(12.5)

        self.play(FadeIn(w_step1_label), Write(w_step1_eq[0]))
        self.wait(0.6)
        self.play(Write(w_step1_eq[1]))
        self.wait(1.0)

        avg_label = Text("时间平均（sin² 平均值 = 1/2）：", font=CJK).scale(0.44)
        avg_eq = MathTex(
            r"\bar{w}", r"=", r"\frac{1}{2}\rho A^2\omega^2"
        ).scale(0.82)
        avg_eq[0].set_color(GREEN)
        avg_eq[2].set_color(GREEN)
        avg_row = VGroup(avg_label, avg_eq).arrange(RIGHT, buff=0.18)
        avg_row.next_to(w_step1_row, DOWN, buff=0.38)
        avg_row.scale_to_fit_width(12.5)

        self.play(FadeIn(avg_label), Write(avg_eq))
        self.wait(1.2)

        prop_note = Text("平均能量密度：正比于 A²，正比于 ω²", font=CJK, color=ORANGE).scale(0.44)
        prop_note.next_to(avg_row, DOWN, buff=0.28)
        self.play(FadeIn(prop_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(formula_title, w_step1_row, avg_row, prop_note)))

        # ── Step 8: 能流密度（强度）─────────────────────────────────────
        intensity_title = Text("能流密度（波的强度）I", font=CJK, color=CYAN).scale(0.48)
        intensity_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(intensity_title))

        i_idea_label = Text("每秒流过单位截面的能量 = 能量密度 × 波速：", font=CJK).scale(0.42)
        i_idea_label.next_to(intensity_title, DOWN, buff=0.45)

        i_eq1 = MathTex(r"I = \bar{w} \cdot u").scale(0.85)
        i_eq1.next_to(i_idea_label, DOWN, buff=0.32)

        self.play(FadeIn(i_idea_label))
        self.wait(0.5)
        self.play(Write(i_eq1))
        self.wait(0.8)

        i_eq2 = MathTex(
            r"I", r"=", r"\frac{1}{2}\rho u A^2\omega^2"
        ).scale(0.88)
        i_eq2[0].set_color(GREEN)
        i_eq2[2].set_color(GREEN)
        i_eq2.next_to(i_eq1, DOWN, buff=0.32)

        self.play(Write(i_eq2))
        self.wait(0.8)

        prop_txt = Text("比例关系：", font=CJK).scale(0.44)
        prop_math = MathTex(r"I \propto A^2,\quad I \propto \omega^2").scale(0.75)
        prop_math[0][2:4].set_color(YELLOW)
        prop_row = VGroup(prop_txt, prop_math).arrange(RIGHT, buff=0.15)
        prop_row.next_to(i_eq2, DOWN, buff=0.35)

        self.play(FadeIn(prop_txt), Write(prop_math))
        self.wait(1.6)
        self.play(FadeOut(VGroup(intensity_title, i_idea_label, i_eq1, i_eq2, prop_row)))

        # ── Step 9: 数值示例 ────────────────────────────────────────────
        num_title = Text("数值示例", font=CJK, color=CYAN).scale(0.48)
        num_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(num_title))

        cond_label = Text("已知：", font=CJK).scale(0.44)
        cond_eq = MathTex(
            r"\rho=1.0\,\mathrm{kg/m^3},\;u=340\,\mathrm{m/s},\;"
            r"A=0.01\,\mathrm{m},\;\omega=200\,\mathrm{rad/s}"
        ).scale(0.60)
        cond_row = VGroup(cond_label, cond_eq).arrange(RIGHT, buff=0.1)
        cond_row.next_to(num_title, DOWN, buff=0.45)
        cond_row.scale_to_fit_width(13)

        res_label = Text("结果：", font=CJK).scale(0.44)
        res_eq = MathTex(
            r"\bar{w}=\tfrac{1}{2}\times1.0\times(0.01)^2\times200^2"
            r"=2\,\mathrm{J/m^3}"
        ).scale(0.62)
        res_row = VGroup(res_label, res_eq).arrange(RIGHT, buff=0.1)
        res_row.next_to(cond_row, DOWN, buff=0.30)
        res_row.scale_to_fit_width(13)

        i_label = Text("强度：", font=CJK).scale(0.44)
        i_num_eq = MathTex(
            r"I=\bar{w}\cdot u=2\times340=680\,\mathrm{W/m^2}"
        ).scale(0.68)
        i_num_eq.set_color(GREEN)
        i_row = VGroup(i_label, i_num_eq).arrange(RIGHT, buff=0.1)
        i_row.next_to(res_row, DOWN, buff=0.30)
        i_row.scale_to_fit_width(13)

        self.play(FadeIn(cond_row))
        self.wait(0.6)
        self.play(FadeIn(res_row))
        self.wait(0.6)
        self.play(FadeIn(i_row))
        self.wait(1.5)
        self.play(FadeOut(VGroup(num_title, cond_row, res_row, i_row)))

        # ── Step 10: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        s1_label = Text("瞬时能量密度：", font=CJK).scale(0.40)
        s1_eq = MathTex(
            r"w=\rho A^2\omega^2\sin^2\!\left[\omega\!\left(t-\frac{x}{u}\right)\right]",
            color=YELLOW
        ).scale(0.65)
        s1_row = VGroup(s1_label, s1_eq).arrange(RIGHT, buff=0.1)

        s2_label = Text("平均能量密度：", font=CJK).scale(0.40)
        s2_eq = MathTex(r"\bar{w}=\tfrac{1}{2}\rho A^2\omega^2", color=YELLOW).scale(0.75)
        s2_row = VGroup(s2_label, s2_eq).arrange(RIGHT, buff=0.1)

        s3_label = Text("能流强度：", font=CJK).scale(0.40)
        s3_eq = MathTex(r"I=\tfrac{1}{2}\rho u A^2\omega^2", color=GREEN).scale(0.75)
        s3_row = VGroup(s3_label, s3_eq).arrange(RIGHT, buff=0.1)

        s4 = Text("波动：ΔEk 与 ΔEp 同相；振子：Ek 与 Ep 反相",
                  font=CJK, color=ORANGE).scale(0.42)

        s5_label = Text("比例关系：", font=CJK).scale(0.40)
        s5_eq = MathTex(r"I\propto A^2\propto\omega^2", color=GREEN).scale(0.75)
        s5_row = VGroup(s5_label, s5_eq).arrange(RIGHT, buff=0.1)

        summary = VGroup(s1_row, s2_row, s3_row, s4, s5_row).arrange(
            DOWN, buff=0.28, aligned_edge=LEFT
        )
        summary.next_to(s_title, DOWN, buff=0.35)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(Write(s1_row))
        self.wait(0.5)
        self.play(Write(s2_row))
        self.wait(0.5)
        self.play(Write(s3_row))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(Write(s5_row))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
