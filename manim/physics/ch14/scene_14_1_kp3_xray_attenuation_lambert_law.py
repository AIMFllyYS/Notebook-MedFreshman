"""第 14.1 节 · X 射线衰减规律与半价层（Lambert-Beer 指数衰减定律）。

可视化方案：
1. 吸收材料矩形 + 入射 X 射线箭头束（密度+颜色随厚度衰减）
2. 实时绘制 I(x) = I₀ e^{-μx} 曲线（ValueTracker 驱动）
3. 半价层虚线分割 + 逐格剩余强度标注
4. 切换对数坐标 → 曲线变直线 → 坡度 = μ
5. x_{1/2} 推导逐行显示 + 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch14Kp3XrayAttenuationLambertLaw(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("X 射线衰减规律与半价层", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第14章 X射线与激光 · 14.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("想象阳光穿过越来越厚的墨镜——", font=CJK).scale(0.50)
        ana2 = Text("每层玻璃都吸收掉一部分光，穿过的光越来越弱，", font=CJK).scale(0.50)
        ana3 = Text("X 射线穿透物质的规律与此完全相同：指数衰减。", font=CJK, color=YELLOW).scale(0.50)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.65)
        ana.scale_to_fit_width(12)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 指数衰减公式逐行 ────────────────────────────────────
        def_label = Text("Lambert-Beer 衰减定律", font=CJK, color=BLUE).scale(0.52)
        def_label.next_to(title, DOWN, buff=0.50)

        eq1 = MathTex(r"\frac{dI}{dx}", r"=", r"-\mu I").scale(0.85)
        eq1[2].set_color(RED)
        eq1_zh = VGroup(
            Text("强度的变化率", font=CJK, color=WHITE).scale(0.40),
            Text("  正比于当前强度，负号表示衰减", font=CJK, color=RED).scale(0.40),
        ).arrange(RIGHT, buff=0.1)

        eq2 = MathTex(r"I(x)", r"=", r"I_0\, e^{-\mu x}").scale(0.85)
        eq2[2].set_color(YELLOW)
        eq2_zh = VGroup(
            Text("积分可得：", font=CJK).scale(0.40),
            MathTex(r"\mu").scale(0.40),
            Text(" 为线性衰减系数（单位: 1/m）", font=CJK).scale(0.40),
        ).arrange(RIGHT, buff=0.08)

        eqs = VGroup(eq1, eq1_zh, eq2, eq2_zh).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        eqs.next_to(def_label, DOWN, buff=0.45)
        eqs.scale_to_fit_width(11)

        self.play(FadeIn(def_label))
        self.wait(0.5)
        self.play(Write(eq1))
        self.play(FadeIn(eq1_zh))
        self.wait(1.2)
        self.play(Write(eq2))
        self.play(FadeIn(eq2_zh))
        self.wait(2.0)
        self.play(FadeOut(VGroup(def_label, eqs)))

        # ── Step 4: 吸收材料 + X 射线束可视化 ────────────────────────────
        # 材料矩形
        mat_w = 5.5
        mat_h = 2.2
        material = Rectangle(width=mat_w, height=mat_h, color=BLUE_E, fill_color=BLUE_E, fill_opacity=0.35)
        material.move_to(RIGHT * 1.0 + DOWN * 0.4)

        mat_label = Text("吸收材料", font=CJK, color=BLUE).scale(0.42)
        mat_label.next_to(material, UP, buff=0.18)

        # X 射线入射（左侧）和出射（右侧）的箭头束
        mu_val = 0.9      # 衰减系数，用于演示
        I0 = 1.0
        arrow_color_in = "#FFFFFF"
        mat_left = material.get_left()[0]
        mat_right = material.get_right()[0]
        mat_top = material.get_top()[1]
        mat_bot = material.get_bottom()[1]

        n_arrows = 6
        y_positions = np.linspace(mat_top - 0.25, mat_bot + 0.25, n_arrows)

        # 入射箭头（在材料左侧，等密度等亮度）
        in_arrows = VGroup()
        for yp in y_positions:
            arr = Arrow(
                start=np.array([mat_left - 2.0, yp, 0]),
                end=np.array([mat_left - 0.05, yp, 0]),
                buff=0,
                color=WHITE,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.15,
            )
            in_arrows.add(arr)

        # X-ray 标签
        xray_label = VGroup(
            Text("X", font=CJK, color=YELLOW).scale(0.46),
            Text(" 射线", font=CJK, color=YELLOW).scale(0.46),
        ).arrange(RIGHT, buff=0.0)
        xray_label.next_to(in_arrows, UP, buff=0.15)

        # 出射箭头（强度衰减，颜色变灰，密度减少）
        I_out = I0 * math.exp(-mu_val * mat_w * 0.5)  # 近似出射强度
        n_out = max(2, int(round(n_arrows * I_out)))
        n_out = min(n_out, n_arrows)
        gray_val = int(255 * I_out)
        out_color = "#{:02X}{:02X}{:02X}".format(gray_val, gray_val, gray_val)

        out_arrows = VGroup()
        # 均匀选取 n_out 根箭头位置
        out_ys = np.linspace(mat_top - 0.45, mat_bot + 0.45, n_out)
        for yp in out_ys:
            arr = Arrow(
                start=np.array([mat_right + 0.05, yp, 0]),
                end=np.array([mat_right + 1.6, yp, 0]),
                buff=0,
                color=out_color,
                stroke_width=2.0,
                max_tip_length_to_length_ratio=0.15,
            )
            out_arrows.add(arr)

        self.play(
            Create(material),
            FadeIn(mat_label),
            FadeIn(xray_label),
        )
        self.play(
            LaggedStart(*[GrowArrow(a) for a in in_arrows], lag_ratio=0.1),
            run_time=1.2,
        )
        self.wait(0.6)
        self.play(
            LaggedStart(*[GrowArrow(a) for a in out_arrows], lag_ratio=0.12),
            run_time=1.0,
        )
        dim_label = VGroup(
            Text("出射强度减弱", font=CJK, color=GRAY).scale(0.38),
            Text("（箭头变稀、变暗）", font=CJK, color=GRAY).scale(0.38),
        ).arrange(DOWN, buff=0.08)
        dim_label.next_to(out_arrows, RIGHT, buff=0.18)
        self.play(FadeIn(dim_label))
        self.wait(2.0)
        self.play(FadeOut(VGroup(in_arrows, out_arrows, material, mat_label, xray_label, dim_label)))

        # ── Step 5: I(x) 曲线 + ValueTracker 实时追踪 ────────────────────
        I0_num = 1.0
        mu_num = 0.7
        x_max = 6.0

        axes = Axes(
            x_range=[0, x_max, 1],
            y_range=[0, 1.1, 0.25],
            x_length=8.5,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [0, 1, 2, 3, 4, 5, 6]},
            y_axis_config={"numbers_to_include": [0, 0.25, 0.5, 0.75, 1.0]},
        ).shift(DOWN * 0.7 + LEFT * 0.2)

        x_lbl = MathTex(r"x\;(\mathrm{m})").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_lbl = MathTex(r"I/I_0").scale(0.5).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        # 完整的指数曲线
        full_curve = axes.plot(
            lambda x: I0_num * math.exp(-mu_num * x),
            x_range=[0, x_max],
            color=YELLOW,
        )

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(full_curve), run_time=1.8)
        self.wait(0.5)

        # 公式标注在曲线旁
        curve_eq = MathTex(r"I(x) = I_0 e^{-\mu x}", color=YELLOW).scale(0.65)
        curve_eq.next_to(axes, UP, buff=0.15).shift(RIGHT * 1.5)
        self.play(FadeIn(curve_eq))
        self.wait(1.0)

        # ValueTracker：x 点追踪
        x_tracker = ValueTracker(0.01)

        # 移动的竖线 + 点
        tracker_dot = always_redraw(
            lambda: Dot(
                axes.c2p(x_tracker.get_value(),
                         I0_num * math.exp(-mu_num * x_tracker.get_value())),
                color=RED,
                radius=0.10,
            )
        )
        tracker_vline = always_redraw(
            lambda: DashedLine(
                axes.c2p(x_tracker.get_value(), 0),
                axes.c2p(x_tracker.get_value(),
                         I0_num * math.exp(-mu_num * x_tracker.get_value())),
                color=CYAN,
                stroke_width=2,
            )
        )
        tracker_hline = always_redraw(
            lambda: DashedLine(
                axes.c2p(0, I0_num * math.exp(-mu_num * x_tracker.get_value())),
                axes.c2p(x_tracker.get_value(),
                         I0_num * math.exp(-mu_num * x_tracker.get_value())),
                color=CYAN,
                stroke_width=2,
            )
        )
        track_cap = Text("红点随 x 增大而沿曲线下降", font=CJK, color=GREEN).scale(0.38)
        track_cap.to_edge(DOWN, buff=0.5)

        self.play(FadeIn(tracker_dot), Create(tracker_vline), Create(tracker_hline), FadeIn(track_cap))
        self.play(x_tracker.animate.set_value(x_max - 0.1), run_time=3.5, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(VGroup(tracker_dot, tracker_vline, tracker_hline, track_cap)))

        # ── Step 6: 半价层虚线格 ────────────────────────────────────────
        # 半价层厚度
        x_half = math.log(2) / mu_num   # ≈ 0.99 m

        half_lines = VGroup()
        half_labels = VGroup()
        fracs = ["1/2", "1/4", "1/8"]
        for i in range(1, 4):
            xi = i * x_half
            if xi > x_max:
                break
            vl = DashedLine(
                axes.c2p(xi, 0),
                axes.c2p(xi, I0_num),
                color=ORANGE,
                stroke_width=2,
                dash_length=0.12,
            )
            half_lines.add(vl)
            # 剩余强度标签
            frac_tex = MathTex(r"I_0/" + str(2 ** i), color=ORANGE).scale(0.45)
            frac_tex.move_to(axes.c2p(xi, I0_num * (0.5 ** i)) + RIGHT * 0.55 + UP * 0.12)
            half_labels.add(frac_tex)

        half_cap = VGroup(
            Text("每隔一个半价层，强度减半", font=CJK, color=ORANGE).scale(0.44),
        )
        half_cap.to_edge(DOWN, buff=0.6)

        self.play(
            LaggedStart(*[Create(vl) for vl in half_lines], lag_ratio=0.35),
            run_time=1.5,
        )
        self.play(
            LaggedStart(*[FadeIn(lb) for lb in half_labels], lag_ratio=0.35),
        )
        self.play(FadeIn(half_cap))
        self.wait(2.2)
        self.play(FadeOut(VGroup(half_lines, half_labels, half_cap, full_curve, curve_eq, axes, x_lbl, y_lbl)))

        # ── Step 7: 对数坐标 → 直线 ─────────────────────────────────────
        log_title = Text("对数坐标系：指数曲线 → 直线", font=CJK, color=BLUE).scale(0.52)
        log_title.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(log_title))

        # 对数轴用手动刻度（y轴显示 ln(I/I0)）
        log_axes = Axes(
            x_range=[0, x_max, 1],
            y_range=[-5, 0.5, 1],
            x_length=8.0,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [0, 1, 2, 3, 4, 5, 6]},
            y_axis_config={"numbers_to_include": [-4, -3, -2, -1, 0]},
        ).shift(DOWN * 0.9 + LEFT * 0.3)

        lx_lbl = MathTex(r"x\;(\mathrm{m})").scale(0.5).next_to(log_axes.x_axis.get_end(), DOWN, buff=0.18)
        ly_lbl = MathTex(r"\ln(I/I_0)").scale(0.5).next_to(log_axes.y_axis.get_end(), LEFT, buff=0.15)

        # ln(I/I₀) = -μx  → 直线
        log_line = log_axes.plot(
            lambda x: -mu_num * x,
            x_range=[0, x_max],
            color=YELLOW,
        )

        self.play(Create(log_axes), FadeIn(lx_lbl), FadeIn(ly_lbl))
        self.play(Create(log_line), run_time=1.5)
        self.wait(0.5)

        # 坡度标注
        slope_label = VGroup(
            Text("斜率 = ", font=CJK, color=RED).scale(0.48),
            MathTex(r"-\mu", color=RED).scale(0.60),
        ).arrange(RIGHT, buff=0.08)
        slope_label.move_to(log_axes.c2p(3.5, -1.8) + RIGHT * 0.5)
        slope_arrow = Arrow(
            slope_label.get_left() + LEFT * 0.15,
            log_axes.c2p(2.5, -1.75),
            buff=0.08,
            color=RED,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        self.play(FadeIn(slope_label), GrowArrow(slope_arrow))

        log_cap = VGroup(
            Text("半对数纸上画出直线，坡度即衰减系数 ", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\mu", color=GREEN).scale(0.50),
        ).arrange(RIGHT, buff=0.08)
        log_cap.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(log_cap))
        self.wait(2.5)
        self.play(FadeOut(VGroup(log_title, log_axes, lx_lbl, ly_lbl, log_line, slope_label, slope_arrow, log_cap)))

        # ── Step 8: 半价层公式推导 ────────────────────────────────────────
        deriv_title = Text("半价层推导", font=CJK, color=BLUE).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(deriv_title))

        # 逐行推导
        d1 = MathTex(r"I(x_{1/2}) = \frac{I_0}{2}").scale(0.80)
        d2 = MathTex(r"I_0 e^{-\mu x_{1/2}} = \frac{I_0}{2}").scale(0.80)
        d3 = MathTex(r"e^{-\mu x_{1/2}} = \frac{1}{2}").scale(0.80)
        d4 = MathTex(r"-\mu x_{1/2} = \ln\frac{1}{2} = -\ln 2").scale(0.80)
        d5 = MathTex(r"x_{1/2} = \frac{\ln 2}{\mu} = \frac{0.693}{\mu}", color=YELLOW).scale(0.88)

        # 逐行高亮关键项
        d3[0][4:].set_color(RED)  # e^{-μx_{1/2}}
        d5[0].set_color(YELLOW)

        deriv_group = VGroup(d1, d2, d3, d4, d5).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        deriv_group.next_to(deriv_title, DOWN, buff=0.45)
        deriv_group.scale_to_fit_width(10)

        for step_mob in [d1, d2, d3, d4]:
            self.play(Write(step_mob), run_time=0.9)
            self.wait(1.0)
        self.play(Write(d5), run_time=1.0)
        box_d5 = SurroundingRectangle(d5, color=YELLOW, buff=0.15, corner_radius=0.08)
        self.play(Create(box_d5))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_title, deriv_group, box_d5)))

        # ── Step 9: 质量衰减系数 ─────────────────────────────────────────
        mum_title = Text("质量衰减系数", font=CJK, color=BLUE).scale(0.52)
        mum_title.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(mum_title))

        mum_eq = MathTex(r"\mu_m = \frac{\mu}{\rho}", color=CYAN).scale(0.90)
        mum_eq.next_to(mum_title, DOWN, buff=0.5)

        mum_zh1 = VGroup(
            MathTex(r"\mu_m", color=CYAN).scale(0.52),
            Text("：质量衰减系数（单位：m²/kg），与物质厚度无关", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.1)
        mum_zh2 = VGroup(
            MathTex(r"\rho", color=ORANGE).scale(0.52),
            Text("：材料密度", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.1)

        mum_desc = VGroup(mum_zh1, mum_zh2).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        mum_desc.next_to(mum_eq, DOWN, buff=0.38)
        mum_desc.scale_to_fit_width(11)

        self.play(Write(mum_eq))
        self.play(FadeIn(mum_zh1))
        self.wait(0.8)
        self.play(FadeIn(mum_zh2))
        self.wait(2.0)
        self.play(FadeOut(VGroup(mum_title, mum_eq, mum_desc)))

        # ── Step 10: 数值示例 ────────────────────────────────────────────
        ex_title = Text("数值示例", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(ex_title))

        ex_cond = VGroup(
            Text("已知：", font=CJK).scale(0.46),
            MathTex(r"\mu = 0.693\;\mathrm{cm^{-1}}", color=WHITE).scale(0.62),
            Text("，求半价层厚度", font=CJK).scale(0.46),
        ).arrange(RIGHT, buff=0.12)

        ex_sol = MathTex(
            r"x_{1/2} = \frac{0.693}{\mu} = \frac{0.693}{0.693} = 1\;\mathrm{cm}",
            color=YELLOW,
        ).scale(0.75)

        ex_interp = VGroup(
            Text("每 1 cm 铝板使 X 射线强度减半", font=CJK, color=GREEN).scale(0.48),
        )

        ex_group = VGroup(ex_cond, ex_sol, ex_interp).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        ex_group.next_to(ex_title, DOWN, buff=0.50)
        ex_group.scale_to_fit_width(11)

        self.play(FadeIn(ex_cond))
        self.wait(1.0)
        self.play(Write(ex_sol))
        self.wait(1.0)
        self.play(FadeIn(ex_interp))
        self.wait(2.0)
        self.play(FadeOut(VGroup(ex_title, ex_group)))

        # ── Step 11: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56)
        s_title.next_to(title, DOWN, buff=0.50)

        s1 = MathTex(r"I(x) = I_0\, e^{-\mu x}", color=YELLOW).scale(0.82)
        s1_zh = Text("Lambert-Beer 指数衰减定律", font=CJK, color=WHITE).scale(0.42)
        row1 = VGroup(s1, s1_zh).arrange(RIGHT, buff=0.4)

        s2 = MathTex(r"x_{1/2} = \frac{\ln 2}{\mu} = \frac{0.693}{\mu}", color=YELLOW).scale(0.82)
        s2_zh = Text("半价层：强度减半所需厚度", font=CJK, color=WHITE).scale(0.42)
        row2 = VGroup(s2, s2_zh).arrange(RIGHT, buff=0.4)

        s3 = MathTex(r"\mu_m = \frac{\mu}{\rho}", color=CYAN).scale(0.82)
        s3_zh = Text("质量衰减系数（与厚度无关）", font=CJK, color=WHITE).scale(0.42)
        row3 = VGroup(s3, s3_zh).arrange(RIGHT, buff=0.4)

        s4 = Text("对数坐标下指数曲线变为直线，斜率 = −μ", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(row1, row2, row3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(row1))
        self.wait(0.6)
        self.play(Write(row2))
        self.wait(0.6)
        self.play(Write(row3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Kp3XrayAttenuationLambertLaw",
        "id": "phys-ch14-14.1-kp3-xray-attenuation-lambert-law",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "X 射线衰减规律与半价层",
        "description": "动画演示 Lambert-Beer 指数衰减 I=I₀e^{-μx}：入射箭头束穿过吸收材料后强度减弱、实时 I(x) 曲线追踪、半价层虚线分割、对数坐标直线化、x_{1/2}=ln2/μ 逐步推导与质量衰减系数概念。",
    }
]
