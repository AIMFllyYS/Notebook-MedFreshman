"""第 13.2 节 · 半衰期、平均寿命与有效半衰期

可视化方案：
  Step 1  N-t 指数衰变曲线 + T（50%）、τ（37%）标注 + 平均寿命几何面积直觉
  Step 2  纯物理衰变 vs 生物排出 vs 有效衰减 三条曲线叠加对比
  Step 3  1/Tₑ = 1/T + 1/Tb 分数运算动画 + Fe-59 数值示例
  Step 4  小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数（Fe-59 示例） ────────────────────────────────────────────────
T_PHYS = 46.3    # 物理半衰期 / d
T_BIO  = 65.0    # 生物半衰期 / d
LAM    = math.log(2) / T_PHYS
LAM_B  = math.log(2) / T_BIO
LAM_E  = LAM + LAM_B
T_EFF  = math.log(2) / LAM_E   # ≈ 27 d


class Ch13Kp4HalfLifeMeanLifeEffective(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════
        title = Text("半衰期、平均寿命与有效半衰期", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第13章 原子核和放射性 · 13.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════
        ana1 = Text("想象一锅咖啡在变凉——", font=CJK).scale(0.48)
        ana2 = Text("每隔固定时间，温差减半。放射性原子也一样：", font=CJK).scale(0.48)
        ana3 = Text("每过一个「半衰期」，剩余核数就减少一半。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════
        # Step 3: 核衰变基本公式（逐步出现）
        # ══════════════════════════════════════════════════════════
        def_title = Text("核衰变规律", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.5)
        eq_N = MathTex(r"N(t) = N_0\, e^{-\lambda t}").scale(0.85)
        eq_N.next_to(def_title, DOWN, buff=0.4)
        eq_N[0][5:8].set_color(YELLOW)   # highlight exponent part

        lbl_lam = VGroup(
            Text("衰变常数", font=CJK).scale(0.4),
            MathTex(r"\lambda = \frac{\ln 2}{T}").scale(0.72),
        ).arrange(RIGHT, buff=0.2).next_to(eq_N, DOWN, buff=0.32)
        lbl_lam[1].set_color(CYAN)

        self.play(FadeIn(def_title))
        self.play(Write(eq_N))
        self.wait(0.8)
        self.play(FadeIn(lbl_lam))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_title, eq_N, lbl_lam)))

        # ══════════════════════════════════════════════════════════
        # Step 4: N-t 曲线 + 三个特征时间点标注
        # ══════════════════════════════════════════════════════════
        curve_lam = 0.9   # 画图用的示意衰变常数（无需与 Fe 对应，仅示意）
        tau_demo  = 1.0 / curve_lam
        T_demo    = math.log(2) / curve_lam

        axes = Axes(
            x_range=[0, 3.5, 1],
            y_range=[0, 1.15, 0.5],
            x_length=9,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": []},
            y_axis_config={"numbers_to_include": []},
        ).shift(DOWN * 0.55)

        x_lbl = MathTex(r"t").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = MathTex(r"N/N_0").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        decay_curve = axes.plot(
            lambda x: math.exp(-curve_lam * x),
            x_range=[0, 3.5],
            color=YELLOW,
        )
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(decay_curve), run_time=1.5)
        self.wait(0.6)

        # ── 标注 T（N 降至 50%） ─────────────────────────────────
        xT = T_demo
        yT = 0.5
        dot_T = Dot(axes.c2p(xT, yT), color=RED, radius=0.09)
        vline_T = DashedLine(
            axes.c2p(xT, 0), axes.c2p(xT, yT), color=RED, stroke_width=2
        )
        hline_T = DashedLine(
            axes.c2p(0, yT), axes.c2p(xT, yT), color=RED, stroke_width=2
        )
        lbl_T_x = MathTex(r"T_{1/2}").scale(0.55).set_color(RED).next_to(
            axes.c2p(xT, 0), DOWN, buff=0.18
        )
        lbl_T_y = MathTex(r"0.5\,N_0").scale(0.5).set_color(RED).next_to(
            axes.c2p(0, yT), LEFT, buff=0.15
        )

        self.play(Create(vline_T), Create(hline_T), FadeIn(dot_T))
        self.play(FadeIn(lbl_T_x), FadeIn(lbl_T_y))
        self.wait(1.0)

        # ── 标注 τ（N 降至 1/e ≈ 37%） ─────────────────────────
        x_tau = tau_demo
        y_tau = math.exp(-1)
        dot_tau = Dot(axes.c2p(x_tau, y_tau), color=GREEN, radius=0.09)
        vline_tau = DashedLine(
            axes.c2p(x_tau, 0), axes.c2p(x_tau, y_tau), color=GREEN, stroke_width=2
        )
        hline_tau = DashedLine(
            axes.c2p(0, y_tau), axes.c2p(x_tau, y_tau), color=GREEN, stroke_width=2
        )
        lbl_tau_x = MathTex(r"\tau").scale(0.6).set_color(GREEN).next_to(
            axes.c2p(x_tau, 0), DOWN, buff=0.18
        )
        lbl_tau_y = MathTex(r"e^{-1}N_0").scale(0.5).set_color(GREEN).next_to(
            axes.c2p(0, y_tau), LEFT, buff=0.15
        )

        self.play(Create(vline_tau), Create(hline_tau), FadeIn(dot_tau))
        self.play(FadeIn(lbl_tau_x), FadeIn(lbl_tau_y))
        self.wait(0.8)

        # ── 平均寿命 = 曲线下面积 / N₀（几何说明） ───────────────
        area = axes.get_area(decay_curve, x_range=[0, 3.5], color=CYAN, opacity=0.22)
        area_lbl = VGroup(
            Text("曲线下面积", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"= \int_0^{\infty} N(t)\,dt = \frac{N_0}{\lambda} = N_0\,\tau").scale(0.55).set_color(CYAN),
        ).arrange(DOWN, buff=0.15).next_to(axes, RIGHT, buff=0.3)
        area_lbl.shift(UP * 0.5)

        self.play(FadeIn(area))
        self.play(FadeIn(area_lbl))
        self.wait(1.8)

        # 公式 τ = T / ln2
        tau_eq = VGroup(
            Text("平均寿命", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\tau = \frac{1}{\lambda} = \frac{T_{1/2}}{\ln 2} \approx 1.44\,T_{1/2}").scale(0.62).set_color(GREEN),
        ).arrange(RIGHT, buff=0.2)
        tau_eq.next_to(axes, DOWN, buff=0.35)
        self.play(FadeIn(tau_eq))
        self.wait(1.8)

        # 清场
        self.play(FadeOut(VGroup(
            axes, x_lbl, y_lbl, decay_curve,
            dot_T, vline_T, hline_T, lbl_T_x, lbl_T_y,
            dot_tau, vline_tau, hline_tau, lbl_tau_x, lbl_tau_y,
            area, area_lbl, tau_eq
        )))

        # ══════════════════════════════════════════════════════════
        # Step 5: 三条曲线对比——物理衰变 vs 生物排出 vs 有效
        # ══════════════════════════════════════════════════════════
        compare_title = Text("有效半衰期：物理衰变 + 生物排出", font=CJK, color=BLUE).scale(0.48)
        compare_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(compare_title))
        self.wait(0.6)

        # 双轴（用归一化时间，x 单位为 Tₑ，方便三条曲线都看清）
        t_max_norm = 3.5   # 单位：Tₑ
        T_e_norm   = 1.0   # Tₑ = 1（归一化）
        T_norm     = T_EFF / T_PHYS   # T / Tₑ
        Tb_norm    = T_EFF / T_BIO    # Tb / Tₑ（注意：Tb > T，所以 Tb_norm < T_norm）

        axes2 = Axes(
            x_range=[0, t_max_norm, 1],
            y_range=[0, 1.1, 0.5],
            x_length=9,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": []},
            y_axis_config={"numbers_to_include": []},
        ).shift(DOWN * 0.7)

        x_lbl2 = MathTex(r"t").scale(0.55).next_to(axes2.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl2 = MathTex(r"N/N_0").scale(0.55).next_to(axes2.y_axis.get_end(), LEFT, buff=0.15)
        self.play(Create(axes2), FadeIn(x_lbl2), FadeIn(y_lbl2))

        # 蓝色：纯物理衰变（衰减常数 λ）
        lam_ph_norm = math.log(2) / T_norm      # 归一化衰变常数
        curve_phys = axes2.plot(
            lambda x: math.exp(-lam_ph_norm * x),
            x_range=[0, t_max_norm],
            color=BLUE,
        )
        lbl_phys = VGroup(
            Text("物理衰变", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"e^{-\lambda t}").scale(0.5).set_color(BLUE),
        ).arrange(RIGHT, buff=0.15)
        lbl_phys.next_to(axes2.c2p(t_max_norm, math.exp(-lam_ph_norm * t_max_norm)), RIGHT, buff=0.1)

        self.play(Create(curve_phys))
        self.play(FadeIn(lbl_phys))
        self.wait(0.8)

        # 绿色虚线：生物排出（生物半衰期 Tb）
        lam_b_norm = math.log(2) / Tb_norm
        curve_bio = axes2.plot(
            lambda x: math.exp(-lam_b_norm * x),
            x_range=[0, t_max_norm],
            color=GREEN,
        )
        # DashedVMobject 让它变为虚线
        curve_bio_dashed = DashedVMobject(curve_bio, num_dashes=30)

        lbl_bio = VGroup(
            Text("生物排出", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"e^{-\lambda_b t}").scale(0.5).set_color(GREEN),
        ).arrange(RIGHT, buff=0.15)
        lbl_bio.next_to(axes2.c2p(t_max_norm, math.exp(-lam_b_norm * t_max_norm)), RIGHT, buff=0.1)

        self.play(Create(curve_bio_dashed))
        self.play(FadeIn(lbl_bio))
        self.wait(0.8)

        # 红色实线：有效衰减（两者叠加，衰减更快）
        lam_e_norm = lam_ph_norm + lam_b_norm   # λₑ = λ + λb
        curve_eff = axes2.plot(
            lambda x: math.exp(-lam_e_norm * x),
            x_range=[0, t_max_norm],
            color=RED,
            stroke_width=3,
        )
        lbl_eff = VGroup(
            Text("有效衰减（更快！）", font=CJK, color=RED).scale(0.38),
            MathTex(r"e^{-(\lambda+\lambda_b)t}").scale(0.5).set_color(RED),
        ).arrange(RIGHT, buff=0.15)
        lbl_eff.next_to(axes2.c2p(t_max_norm * 0.7, math.exp(-lam_e_norm * t_max_norm * 0.7)), RIGHT, buff=0.08)
        lbl_eff.shift(DOWN * 0.1)

        self.play(Create(curve_eff))
        self.play(FadeIn(lbl_eff))
        self.wait(1.5)

        # 在 Tₑ=1 处画竖线标注
        vline_e = DashedLine(
            axes2.c2p(1.0, 0), axes2.c2p(1.0, 0.5), color=RED, stroke_width=2
        )
        lbl_te = MathTex(r"T_e").scale(0.55).set_color(RED).next_to(
            axes2.c2p(1.0, 0), DOWN, buff=0.15
        )
        self.play(Create(vline_e), FadeIn(lbl_te))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            axes2, x_lbl2, y_lbl2,
            curve_phys, lbl_phys,
            curve_bio_dashed, lbl_bio,
            curve_eff, lbl_eff,
            vline_e, lbl_te,
            compare_title,
        )))

        # ══════════════════════════════════════════════════════════
        # Step 6: 1/Tₑ = 1/T + 1/Tb 推导动画
        # ══════════════════════════════════════════════════════════
        deriv_title = Text("有效半衰期的倒数公式推导", font=CJK, color=BLUE).scale(0.48)
        deriv_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(deriv_title))

        step_a = MathTex(
            r"\lambda_e = \lambda + \lambda_b"
        ).scale(0.82)
        step_a.next_to(deriv_title, DOWN, buff=0.45)

        step_b = MathTex(
            r"\frac{\ln 2}{T_e} = \frac{\ln 2}{T} + \frac{\ln 2}{T_b}"
        ).scale(0.82)
        step_b.next_to(step_a, DOWN, buff=0.35)

        step_c = MathTex(
            r"\therefore\quad \frac{1}{T_e} = \frac{1}{T} + \frac{1}{T_b}"
        ).scale(0.88)
        step_c.set_color(YELLOW)
        step_c.next_to(step_b, DOWN, buff=0.35)

        expl_a = VGroup(
            Text("两种衰变过程叠加，衰变常数相加", font=CJK).scale(0.38).set_color(CYAN)
        ).next_to(step_a, RIGHT, buff=0.35)

        expl_b = VGroup(
            Text("代入", font=CJK).scale(0.38),
            MathTex(r"\lambda = \frac{\ln 2}{T}").scale(0.5),
        ).arrange(RIGHT, buff=0.15).set_color(CYAN).next_to(step_b, RIGHT, buff=0.3)

        self.play(Write(step_a))
        self.play(FadeIn(expl_a))
        self.wait(1.0)
        self.play(Write(step_b))
        self.play(FadeIn(expl_b))
        self.wait(1.0)
        self.play(Write(step_c))
        box_c = SurroundingRectangle(step_c, color=YELLOW, buff=0.18, corner_radius=0.1)
        self.play(Create(box_c))
        self.wait(1.5)

        # 数轴线段类比：Tₑ < T 且 Tₑ < Tb
        analogy_line_title = Text("直觉：有效半衰期比两者都短", font=CJK, color=GREEN).scale(0.42)
        analogy_line_title.next_to(step_c, DOWN, buff=0.45)
        self.play(FadeIn(analogy_line_title))

        # 横线段示意：T 段（蓝），Tb 段（绿），Tₑ 段（红）
        bar_y = analogy_line_title.get_bottom()[1] - 0.55
        bar_x0 = -4.0
        scale_f = 0.055  # d -> scene units

        bar_T  = Line(
            [bar_x0, bar_y, 0],
            [bar_x0 + T_PHYS * scale_f, bar_y, 0],
            color=BLUE, stroke_width=6
        )
        bar_Tb = Line(
            [bar_x0, bar_y - 0.4, 0],
            [bar_x0 + T_BIO  * scale_f, bar_y - 0.4, 0],
            color=GREEN, stroke_width=6
        )
        bar_Te = Line(
            [bar_x0, bar_y - 0.8, 0],
            [bar_x0 + T_EFF * scale_f, bar_y - 0.8, 0],
            color=RED, stroke_width=6
        )

        lbl_barT  = VGroup(
            MathTex(r"T").scale(0.5).set_color(BLUE),
            Text(f"= {T_PHYS}d", font=CJK).scale(0.38).set_color(BLUE),
        ).arrange(RIGHT, buff=0.12).next_to(bar_T,  RIGHT, buff=0.18)
        lbl_barTb = VGroup(
            MathTex(r"T_b").scale(0.5).set_color(GREEN),
            Text(f"= {T_BIO}d", font=CJK).scale(0.38).set_color(GREEN),
        ).arrange(RIGHT, buff=0.12).next_to(bar_Tb, RIGHT, buff=0.18)
        lbl_barTe = VGroup(
            MathTex(r"T_e").scale(0.5).set_color(RED),
            Text(f"≈ {T_EFF:.0f}d", font=CJK).scale(0.38).set_color(RED),
        ).arrange(RIGHT, buff=0.12).next_to(bar_Te, RIGHT, buff=0.18)

        self.play(Create(bar_T),  FadeIn(lbl_barT))
        self.wait(0.4)
        self.play(Create(bar_Tb), FadeIn(lbl_barTb))
        self.wait(0.4)
        self.play(Create(bar_Te), FadeIn(lbl_barTe))
        self.wait(1.5)

        # 清场
        self.play(FadeOut(VGroup(
            deriv_title, step_a, step_b, step_c, box_c,
            expl_a, expl_b,
            analogy_line_title,
            bar_T, bar_Tb, bar_Te,
            lbl_barT, lbl_barTb, lbl_barTe,
        )))

        # ══════════════════════════════════════════════════════════
        # Step 7: Fe-59 数值示例
        # ══════════════════════════════════════════════════════════
        example_title = Text("具体示例：Fe-59（铁-59）", font=CJK, color=BLUE).scale(0.48)
        example_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(example_title))

        ex1 = VGroup(
            Text("物理半衰期", font=CJK).scale(0.42),
            MathTex(r"T_{1/2} = 46.3\,\text{d}").scale(0.72).set_color(BLUE),
        ).arrange(RIGHT, buff=0.2)

        ex2 = VGroup(
            Text("生物半衰期", font=CJK).scale(0.42),
            MathTex(r"T_b = 65\,\text{d}").scale(0.72).set_color(GREEN),
        ).arrange(RIGHT, buff=0.2)

        ex3 = VGroup(
            Text("有效半衰期", font=CJK, color=RED).scale(0.42),
            MathTex(r"\frac{1}{T_e}=\frac{1}{46.3}+\frac{1}{65}\approx\frac{1}{27}\,\text{d}^{-1}").scale(0.72).set_color(RED),
        ).arrange(RIGHT, buff=0.2)

        ex4 = VGroup(
            Text("结论", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"T_e \approx 27\,\text{d}").scale(0.72).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.2)

        examples = VGroup(ex1, ex2, ex3, ex4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        examples.next_to(example_title, DOWN, buff=0.45)
        examples.scale_to_fit_width(12)

        for ex in examples:
            self.play(FadeIn(ex))
            self.wait(0.9)

        insight = Text("有效半衰期 < 物理半衰期，辐射消散更快，对人体更安全！",
                       font=CJK, color=GREEN).scale(0.4)
        insight.next_to(examples, DOWN, buff=0.35)
        self.play(FadeIn(insight))
        self.wait(2.0)

        self.play(FadeOut(VGroup(example_title, examples, insight)))

        # ══════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("半衰期", font=CJK).scale(0.42),
            MathTex(r"T_{1/2} = \frac{\ln 2}{\lambda} = \frac{0.693}{\lambda}").scale(0.72).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("平均寿命", font=CJK).scale(0.42),
            MathTex(r"\tau = \frac{1}{\lambda} = 1.44\,T_{1/2}").scale(0.72).set_color(GREEN),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("有效半衰期", font=CJK).scale(0.42),
            MathTex(r"\frac{1}{T_e} = \frac{1}{T} + \frac{1}{T_b}").scale(0.72).set_color(RED),
        ).arrange(RIGHT, buff=0.2)

        s4 = VGroup(
            Text("Fe-59 示例", font=CJK).scale(0.42),
            MathTex(r"T_e \approx 27\,\text{d} < T_{1/2}(46.3\,\text{d})").scale(0.65).set_color(CYAN),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(Write(s4))
        self.wait(0.5)
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch13Kp4HalfLifeMeanLifeEffective",
        "id": "phys-ch13-13.2-kp4-half-life-mean-life-effective",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "半衰期、平均寿命与有效半衰期",
        "description": "N-t 指数衰变曲线标注半衰期 T 与平均寿命 τ，三条曲线对比物理/生物/有效衰减，推导 1/Tₑ=1/T+1/Tb 并以 Fe-59 为数值示例。",
    }
]
