"""第 13.2 节 · 放射性活度 A 与单位 Bq/Ci

可视化方案：
  Step1: N-t 与 A-t 双坐标系同步衰减，切线斜率动画展示 A = -dN/dt。
  Step2: ValueTracker 扫动 λ，演示活度曲线随 λ 变化。
  Step3: 数字动画展示单位换算 1 Ci = 3.7e10 Bq。
  Step4: 相同活度(1 Ci)时，U-238 vs I-131 所需核数对比。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch13Kp5RadioactiveActivity(Scene):
    def construct(self):

        # ════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ════════════════════════════════════════════════════════════
        title = Text("放射性活度 A 与单位 Bq/Ci", font=CJK, color=BLUE).scale(0.60).to_edge(UP)
        subtitle = Text("第 13 章 原子核和放射性 · 13.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════
        # Step 2: 生活类比 —— 放射性「强弱」的直觉
        # ════════════════════════════════════════════════════════════
        ana1 = Text("同样是放射性物质，有的发射粒子极快，有的极慢。", font=CJK).scale(0.46)
        ana2 = Text("「活度」就是单位时间内衰变的核数——越高越「活跃」。", font=CJK).scale(0.46)
        ana3 = Text("就像水龙头流速：桶里水越多、孔越大，流得越快。", font=CJK, color=CYAN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════
        # Step 3: 活度定义（逐行出现，关键项变色）
        # ════════════════════════════════════════════════════════════
        def_title = Text("活度的定义", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(def_title))

        eq1 = MathTex(
            r"A", r"=", r"-\frac{dN}{dt}", r"=", r"\lambda N"
        ).scale(0.90)
        eq1[0].set_color(YELLOW)
        eq1[2].set_color(GREEN)
        eq1[4].set_color(ORANGE)
        eq1.next_to(def_title, DOWN, buff=0.45)

        label_A = VGroup(
            Text("活度（衰变率）", font=CJK, color=YELLOW).scale(0.38),
        )
        label_dN = VGroup(
            Text("单位时间衰变核数", font=CJK, color=GREEN).scale(0.38),
        )
        label_lN = VGroup(
            Text("衰变常数 × 现存核数", font=CJK, color=ORANGE).scale(0.38),
        )
        labels_row = VGroup(label_A, label_dN, label_lN).arrange(RIGHT, buff=1.0)
        labels_row.next_to(eq1, DOWN, buff=0.28)

        self.play(Write(eq1[:3]))
        self.wait(0.5)
        self.play(Write(eq1[3:]))
        self.wait(0.5)
        self.play(FadeIn(labels_row))
        self.wait(1.0)

        eq2 = MathTex(r"A(t) = A_0 \, e^{-\lambda t}, \quad A_0 = \lambda N_0").scale(0.85)
        eq2.next_to(labels_row, DOWN, buff=0.38)
        self.play(Write(eq2))
        self.wait(0.8)

        eq3_row = VGroup(
            Text("其中", font=CJK).scale(0.40),
            MathTex(r"A_0 = \lambda N_0 = \frac{\ln 2}{T_{1/2}} N_0").scale(0.80),
        ).arrange(RIGHT, buff=0.20)
        eq3_row.next_to(eq2, DOWN, buff=0.32)
        self.play(FadeIn(eq3_row))
        self.wait(1.5)

        self.play(FadeOut(VGroup(def_title, eq1, labels_row, eq2, eq3_row)))

        # ════════════════════════════════════════════════════════════
        # Step 4: 双坐标系同步衰减 N(t) 与 A(t)，切线斜率动画
        # ════════════════════════════════════════════════════════════
        axes_n = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.3, 0.5],
            x_length=5.8,
            y_length=1.9,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        )
        axes_a = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 1.3, 0.5],
            x_length=5.8,
            y_length=1.9,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        )

        lam_fixed = 0.6

        axes_n.next_to(title, DOWN, buff=0.50).shift(LEFT * 0.2)
        axes_a.next_to(axes_n, DOWN, buff=0.45)

        # 坐标轴标签（纯 ASCII MathTex）
        xl_n = MathTex(r"t").scale(0.5).next_to(axes_n.x_axis.get_end(), DOWN, buff=0.12)
        yl_n = MathTex(r"N(t)").scale(0.5).next_to(axes_n.y_axis.get_end(), LEFT, buff=0.12)
        xl_a = MathTex(r"t").scale(0.5).next_to(axes_a.x_axis.get_end(), DOWN, buff=0.12)
        yl_a = MathTex(r"A(t)").scale(0.5).next_to(axes_a.y_axis.get_end(), LEFT, buff=0.12)

        curve_n = axes_n.plot(lambda x: math.exp(-lam_fixed * x), x_range=[0, 5], color=YELLOW)
        curve_a = axes_a.plot(lambda x: lam_fixed * math.exp(-lam_fixed * x), x_range=[0, 5], color=GREEN)

        self.play(
            Create(axes_n), Create(axes_a),
            FadeIn(xl_n), FadeIn(yl_n), FadeIn(xl_a), FadeIn(yl_a),
        )
        self.play(Create(curve_n), Create(curve_a), run_time=2)
        self.wait(0.8)

        # 切线斜率动画：在 t0 处画切线，说明 A = -dN/dt
        t0 = ValueTracker(0.5)

        def make_tangent(tracker, axes, lam, color):
            def _draw():
                t_val = tracker.get_value()
                N_val = math.exp(-lam * t_val)
                slope = -lam * math.exp(-lam * t_val)   # dN/dt
                dt = 0.7
                x1, x2 = t_val - dt, t_val + dt
                y1 = N_val + slope * (x1 - t_val)
                y2 = N_val + slope * (x2 - t_val)
                # clamp y
                y1 = max(0.0, min(1.2, y1))
                y2 = max(0.0, min(1.2, y2))
                p1 = axes.c2p(x1, y1)
                p2 = axes.c2p(x2, y2)
                return Line(p1, p2, color=color, stroke_width=3)
            return always_redraw(_draw)

        def make_dot(tracker, axes, lam, color):
            return always_redraw(lambda: Dot(
                axes.c2p(tracker.get_value(), math.exp(-lam * tracker.get_value())),
                color=color, radius=0.09,
            ))

        tangent_n = make_tangent(t0, axes_n, lam_fixed, RED)
        dot_n = make_dot(t0, axes_n, lam_fixed, RED)

        tan_label = VGroup(
            Text("切线斜率 =", font=CJK, color=RED).scale(0.38),
            MathTex(r"\frac{dN}{dt}", color=RED).scale(0.70),
        ).arrange(RIGHT, buff=0.12)
        tan_label.next_to(axes_n, RIGHT, buff=0.30)

        slope_caption = VGroup(
            Text("活度 A 恰好等于 N(t) 曲线斜率的绝对值", font=CJK, color=GREEN).scale(0.38),
        ).next_to(axes_a, DOWN, buff=0.22)

        self.play(Create(tangent_n), FadeIn(dot_n), FadeIn(tan_label))
        self.wait(0.5)
        self.play(t0.animate.set_value(3.5), run_time=3.5, rate_func=linear)
        self.wait(0.5)
        self.play(FadeIn(slope_caption))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            axes_n, axes_a, xl_n, yl_n, xl_a, yl_a,
            curve_n, curve_a, tangent_n, dot_n, tan_label, slope_caption,
        )))

        # ════════════════════════════════════════════════════════════
        # Step 5: ValueTracker 扫动 λ —— 活度曲线随 λ 变化
        # ════════════════════════════════════════════════════════════
        sweep_title = Text("λ 越大：初始活度高，但衰减更快", font=CJK, color=BLUE).scale(0.48)
        sweep_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sweep_title))

        axes_s = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 3.2, 1],
            x_length=8.5,
            y_length=3.5,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"include_numbers": True},
            y_axis_config={"include_numbers": True},
        ).next_to(sweep_title, DOWN, buff=0.35)

        xl_s = MathTex(r"t").scale(0.5).next_to(axes_s.x_axis.get_end(), DOWN, buff=0.12)
        yl_s = VGroup(
            Text("A(t)", font=CJK).scale(0.38),
        ).next_to(axes_s.y_axis.get_end(), LEFT, buff=0.12)

        lam_tracker = ValueTracker(0.4)

        curve_s = always_redraw(lambda: axes_s.plot(
            lambda x: lam_tracker.get_value() * math.exp(-lam_tracker.get_value() * x),
            x_range=[0, 5],
            color=GREEN,
            stroke_width=3,
        ))

        # λ 数值标签
        lam_label = always_redraw(lambda: VGroup(
            MathTex(r"\lambda =").scale(0.55),
            MathTex(f"{lam_tracker.get_value():.2f}").scale(0.55).set_color(ORANGE),
        ).arrange(RIGHT, buff=0.10).to_corner(DR, buff=0.5))

        a0_label = always_redraw(lambda: VGroup(
            MathTex(r"A_0 = \lambda N_0 =").scale(0.50),
            MathTex(f"{lam_tracker.get_value():.2f} N_0").scale(0.50).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.10).next_to(axes_s, DOWN, buff=0.20))

        self.play(Create(axes_s), FadeIn(xl_s), FadeIn(yl_s))
        self.play(Create(curve_s), FadeIn(lam_label), FadeIn(a0_label))
        self.wait(0.8)
        self.play(lam_tracker.animate.set_value(2.5), run_time=3.5, rate_func=smooth)
        self.wait(0.6)
        self.play(lam_tracker.animate.set_value(0.3), run_time=3.0, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(axes_s, xl_s, yl_s, curve_s, lam_label, a0_label, sweep_title)))

        # ════════════════════════════════════════════════════════════
        # Step 6: 单位换算 —— 1 Ci = 3.7×10¹⁰ Bq
        # ════════════════════════════════════════════════════════════
        unit_title = Text("放射性单位：贝可 Bq 与 居里 Ci", font=CJK, color=BLUE).scale(0.50)
        unit_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(unit_title))

        bq_def = VGroup(
            Text("贝可（Bq）：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"1\,\mathrm{Bq} = 1\,\mathrm{s}^{-1}").scale(0.80),
        ).arrange(RIGHT, buff=0.20)

        ci_def = VGroup(
            Text("居里（Ci）：", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"1\,\mathrm{Ci} = 3.7\times10^{10}\,\mathrm{Bq}").scale(0.80),
        ).arrange(RIGHT, buff=0.20)

        ra_def = VGroup(
            Text("历史起源：1 g 镭 -226 的活度 ≈ 1 Ci", font=CJK, color=GREEN).scale(0.44),
        )

        units_group = VGroup(bq_def, ci_def, ra_def).arrange(DOWN, buff=0.40).next_to(unit_title, DOWN, buff=0.55)
        box_units = SurroundingRectangle(units_group, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(FadeIn(bq_def))
        self.wait(0.8)
        self.play(FadeIn(ci_def))
        self.wait(0.8)
        self.play(FadeIn(ra_def), Create(box_units))
        self.wait(1.8)

        # 数字动画：换算演示
        convert_lhs = MathTex(r"5\,\mathrm{Ci}").scale(0.90)
        convert_eq = MathTex(r"=").scale(0.90)
        convert_rhs = MathTex(r"5 \times 3.7\times10^{10}\,\mathrm{Bq}").scale(0.90).set_color(YELLOW)
        convert_eq2 = MathTex(r"=").scale(0.90)
        convert_final = MathTex(r"1.85\times10^{11}\,\mathrm{Bq}").scale(0.90).set_color(GREEN)
        row1 = VGroup(convert_lhs, convert_eq, convert_rhs).arrange(RIGHT, buff=0.20)
        row1.next_to(box_units, DOWN, buff=0.40)
        self.play(FadeIn(row1))
        self.wait(0.6)
        row2 = VGroup(convert_eq2, convert_final).arrange(RIGHT, buff=0.20)
        row2.next_to(row1, DOWN, buff=0.25).align_to(convert_rhs, LEFT)
        self.play(FadeIn(row2))
        self.wait(1.5)

        self.play(FadeOut(VGroup(unit_title, units_group, box_units, row1, row2)))

        # ════════════════════════════════════════════════════════════
        # Step 7: 相同活度时，U-238 vs I-131 核数对比
        # ════════════════════════════════════════════════════════════
        cmp_title = Text("相同活度 1 Ci 需要多少核？", font=CJK, color=BLUE).scale(0.50)
        cmp_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(cmp_title))

        # 推导关系式
        derive_eq = MathTex(r"N = \frac{A}{\lambda} = \frac{A \cdot T_{1/2}}{\ln 2}").scale(0.82)
        derive_eq.next_to(cmp_title, DOWN, buff=0.42)
        hint = VGroup(
            Text("半衰期越长，λ 越小，需要越多核才能达到相同活度", font=CJK, color=CYAN).scale(0.40),
        ).next_to(derive_eq, DOWN, buff=0.28)
        self.play(Write(derive_eq))
        self.play(FadeIn(hint))
        self.wait(1.2)

        # U-238 数据
        u_T_yr = 4.47e9     # 年
        u_T_s = u_T_yr * 3.156e7  # 秒
        A_ci = 3.7e10       # Bq
        u_N = A_ci * u_T_s / math.log(2)

        # I-131 数据
        i_T_day = 8.04      # 天
        i_T_s = i_T_day * 86400
        i_N = A_ci * i_T_s / math.log(2)

        u_label = VGroup(
            Text("U-238（半衰期 4.47×10⁹ 年）:", font=CJK, color=ORANGE).scale(0.42),
        )
        u_val = VGroup(
            MathTex(r"N_{U} \approx 3.5\times10^{27}").scale(0.78).set_color(ORANGE),
        )
        i_label = VGroup(
            Text("I-131（半衰期 8.04 天）:", font=CJK, color=RED).scale(0.42),
        )
        i_val = VGroup(
            MathTex(r"N_{I} \approx 4.0\times10^{14}").scale(0.78).set_color(RED),
        )

        ratio_text = VGroup(
            Text("二者核数之比约为", font=CJK).scale(0.40),
            MathTex(r"10^{13}").scale(0.75).set_color(YELLOW),
            Text("倍！", font=CJK).scale(0.40),
        ).arrange(RIGHT, buff=0.12)

        cmp_block = VGroup(
            u_label, u_val,
            i_label, i_val,
        ).arrange(DOWN, buff=0.25, aligned_edge=LEFT).next_to(hint, DOWN, buff=0.35)
        ratio_text.next_to(cmp_block, DOWN, buff=0.32)

        self.play(FadeIn(u_label), FadeIn(u_val))
        self.wait(0.7)
        self.play(FadeIn(i_label), FadeIn(i_val))
        self.wait(0.7)
        self.play(FadeIn(ratio_text))
        self.wait(1.8)

        self.play(FadeOut(VGroup(cmp_title, derive_eq, hint, cmp_block, ratio_text)))

        # ════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)
        s1 = MathTex(r"A = -\frac{dN}{dt} = \lambda N = A_0 e^{-\lambda t}", color=YELLOW).scale(0.78)
        s2 = MathTex(r"A_0 = \lambda N_0 = \frac{\ln 2}{T_{1/2}} N_0", color=YELLOW).scale(0.78)
        s3 = MathTex(r"1\,\mathrm{Ci} = 3.7\times10^{10}\,\mathrm{Bq}", color=CYAN).scale(0.78)
        s4 = VGroup(
            Text("半衰期越短，λ 越大，相同核数时活度越高", font=CJK, color=GREEN).scale(0.42),
        )
        s5 = VGroup(
            Text("相同活度时，半衰期越长需要的核数越多", font=CJK, color=GREEN).scale(0.42),
        )

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32).next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(FadeIn(s4), FadeIn(s5), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch13Kp5RadioactiveActivity",
        "id": "phys-ch13-13.2-kp5-radioactive-activity",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "放射性活度 A 与单位 Bq/Ci",
        "description": "双坐标系同步衰减动画演示 A=-dN/dt 的导数含义，ValueTracker 扫动 λ 展示活度变化规律，数字换算 1 Ci=3.7e10 Bq，并对比 U-238 与 I-131 在相同活度下核数相差 10^13 倍。",
    }
]
