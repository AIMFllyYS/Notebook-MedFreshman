"""第 9.3 节 · 磁场能量与能量密度（知识点 kp2）

三幕结构：
  第一幕 — RL 充电过程：功率积分 → W_m = LI²/2 逐步推导
  第二幕 — 螺线管参数替换：L = μ₀n²V，B = μ₀nI → w_m = B²/(2μ₀)
  第三幕 — 非均匀场：能量密度色彩图 + 体积分概念示意

铁律：MathTex 内只用纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch09Kp2MagneticEnergyDensity(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════
        title = Text("磁场能量与能量密度", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.3", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════
        a1 = Text("弹簧拉伸需要做功，能量储存在弹性形变里；", font=CJK).scale(0.48)
        a2 = Text("电感通电也需要做功——能量储存在它产生的磁场里。", font=CJK, color=YELLOW).scale(0.48)
        a3 = Text("磁场并非虚无，它是真实的能量载体。", font=CJK, color=GREEN).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════
        # 第一幕：RL 充电曲线 + 功率积分推导 W_m = LI²/2
        # ══════════════════════════════════════════════════════════

        # Step 3: 推导公式逐步出现
        act1_label = Text("第一幕：自感储能推导", font=CJK, color=ORANGE).scale(0.5)
        act1_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act1_label))
        self.wait(0.6)

        # 公式推导区（右半屏）
        deriv_label = Text("功率与能量推导", font=CJK, color=WHITE).scale(0.44)
        deriv_label.to_edge(RIGHT, buff=0.3).shift(UP * 1.8)

        eq1_txt = Text("瞬时功率：", font=CJK, color=WHITE).scale(0.42)
        eq1_math = MathTex(r"p = \varepsilon_L \cdot i = L\frac{di}{dt}\cdot i").scale(0.7)
        eq1 = VGroup(eq1_txt, eq1_math).arrange(RIGHT, buff=0.15)

        eq2_txt = Text("总做功：", font=CJK, color=WHITE).scale(0.42)
        eq2_math = MathTex(r"W_m = \int_0^I p\,dt = \int_0^I Li\,di").scale(0.7)
        eq2 = VGroup(eq2_txt, eq2_math).arrange(RIGHT, buff=0.15)

        eq3_math = MathTex(r"W_m = \frac{1}{2}LI^2", color=YELLOW).scale(0.85)

        derivs = VGroup(eq1, eq2, eq3_math).arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        derivs.next_to(title, DOWN, buff=0.9).to_edge(RIGHT, buff=0.5)
        derivs.scale_to_fit_width(5.5)

        self.play(FadeIn(eq1))
        self.wait(1.2)
        self.play(FadeIn(eq2))
        self.wait(1.2)
        self.play(Write(eq3_math))
        eq3_box = SurroundingRectangle(eq3_math, color=YELLOW, buff=0.12)
        self.play(Create(eq3_box))
        self.wait(0.8)

        # Step 4: RL 充电曲线 + 阴影面积（左半屏）
        axes = Axes(
            x_range=[0, 3.2, 1],
            y_range=[0, 1.3, 0.5],
            x_length=4.2,
            y_length=2.8,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        )
        axes.to_edge(LEFT, buff=0.55).shift(DOWN * 0.3)

        x_lab = Text("t", font=CJK, color=WHITE).scale(0.45)
        x_lab.next_to(axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_lab = Text("i(t)", font=CJK, color=WHITE).scale(0.45)
        y_lab.next_to(axes.y_axis.get_end(), UP, buff=0.1)

        tau = 1.0
        I_inf = 1.0

        def i_curve(t):
            return I_inf * (1 - math.exp(-t / tau))

        curve = axes.plot(i_curve, x_range=[0, 3.0], color=CYAN, stroke_width=2.5)
        I_line = axes.plot(lambda t: I_inf, x_range=[0, 3.0], color=WHITE,
                           stroke_width=1.5, stroke_dash_array=None)
        # 用 DashedLine 画水平渐近线
        I_dash_start = axes.c2p(0, I_inf)
        I_dash_end = axes.c2p(3.0, I_inf)
        I_dashed = DashedLine(I_dash_start, I_dash_end, color=WHITE, stroke_width=1.5)

        I_label = MathTex(r"I", color=WHITE).scale(0.55)
        I_label.next_to(axes.c2p(0, I_inf), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lab), FadeIn(y_lab))
        self.play(Create(curve), Create(I_dashed), FadeIn(I_label))
        self.wait(0.6)

        # ValueTracker 控制阴影积累
        t_tracker = ValueTracker(0.0)

        def make_area():
            t_val = min(t_tracker.get_value(), 2.98)
            if t_val < 0.05:
                return VGroup()
            area = axes.get_area(
                axes.plot(i_curve, x_range=[0, t_val], color=CYAN),
                x_range=[0, t_val],
                color=YELLOW,
                opacity=0.35,
            )
            return area

        area_mob = always_redraw(make_area)
        self.add(area_mob)

        cap_area = Text("阴影面积 = 已做的功", font=CJK, color=YELLOW).scale(0.42)
        cap_area.next_to(axes, DOWN, buff=0.25)
        self.play(FadeIn(cap_area))
        self.play(t_tracker.animate.set_value(3.0), run_time=2.5)
        self.wait(1.0)

        # 累计能量读出（随 t 增长）
        w_readout = always_redraw(lambda: VGroup(
            Text("W = ", font=CJK, color=GREEN).scale(0.42),
            MathTex(
                rf"\frac{{1}}{{2}}L\cdot({i_curve(min(t_tracker.get_value(),2.98)):.2f}I)^2",
                color=GREEN
            ).scale(0.55)
        ).arrange(RIGHT, buff=0.08).next_to(cap_area, DOWN, buff=0.2))

        self.add(w_readout)
        self.play(t_tracker.animate.set_value(0.0), run_time=0.01)
        self.play(t_tracker.animate.set_value(3.0), run_time=2.0)
        self.wait(1.2)

        act1_group = VGroup(axes, curve, I_dashed, I_label, x_lab, y_lab,
                            cap_area, derivs, eq3_box, act1_label)
        self.play(FadeOut(act1_group), FadeOut(w_readout))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # 第二幕：能量密度推导
        # ══════════════════════════════════════════════════════════

        # Step 5: 螺线管图（左半屏）
        act2_label = Text("第二幕：能量密度推导", font=CJK, color=ORANGE).scale(0.5)
        act2_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act2_label))
        self.wait(0.5)

        sol_left = -3.5
        sol_right = -0.2
        sol_top = 1.0
        sol_bot = -1.0
        sol_cx = (sol_left + sol_right) / 2
        sol_cy = (sol_top + sol_bot) / 2

        # 螺线管外框
        sol_rect = Rectangle(
            width=sol_right - sol_left,
            height=sol_top - sol_bot,
            color=BLUE_C,
            stroke_width=2.5
        ).move_to([sol_cx, sol_cy, 0])

        # 线圈标记（竖线）
        coil_lines = VGroup()
        n_coils = 10
        for k in range(n_coils + 1):
            xc = sol_left + k * (sol_right - sol_left) / n_coils
            ln = Line([xc, sol_top, 0], [xc, sol_bot, 0], color=BLUE_B, stroke_width=1.5)
            coil_lines.add(ln)

        # ValueTracker 控制磁感线密度
        B_tracker = ValueTracker(1.0)

        def make_field_lines():
            lines_grp = VGroup()
            density = B_tracker.get_value()
            n_lines = max(1, int(density * 4))
            ys = np.linspace(sol_bot + 0.18, sol_top - 0.18, n_lines)
            for yy in ys:
                ln = Line(
                    [sol_left + 0.12, yy, 0],
                    [sol_right - 0.12, yy, 0],
                    color=interpolate_color(BLUE, RED, (yy - sol_bot) / (sol_top - sol_bot)),
                    stroke_width=2.0
                )
                # 箭头方向
                arr = Arrow(
                    [sol_cx - 0.3, yy, 0],
                    [sol_cx + 0.3, yy, 0],
                    buff=0,
                    color=CYAN,
                    stroke_width=1.5,
                    max_tip_length_to_length_ratio=0.35,
                ).scale(0.7)
                lines_grp.add(ln, arr)
            return lines_grp

        field_lines = always_redraw(make_field_lines)

        sol_label = Text("长直螺线管", font=CJK, color=BLUE_C).scale(0.42)
        sol_label.next_to(sol_rect, DOWN, buff=0.18)

        V_label = MathTex(r"V = A \cdot l").scale(0.55).next_to(sol_label, DOWN, buff=0.15)

        self.play(Create(sol_rect), Create(coil_lines))
        self.play(Create(field_lines))
        self.play(FadeIn(sol_label), FadeIn(V_label))
        self.wait(0.8)

        # 磁感线密度增大演示
        B_hint = Text("增大电流 → 磁感线变密", font=CJK, color=YELLOW).scale(0.4)
        B_hint.next_to(sol_rect, UP, buff=0.2)
        self.play(FadeIn(B_hint))
        self.play(B_tracker.animate.set_value(2.0), run_time=1.5)
        self.wait(0.5)
        self.play(B_tracker.animate.set_value(1.0), run_time=1.0)
        self.play(FadeOut(B_hint))
        self.wait(0.5)

        # Step 6: 右侧白板推导，逐步替换
        # L = μ₀n²V 代入 W = LI²/2
        board_x = 2.8  # 右侧推导区域中心 x

        step_a_txt = Text("代入", font=CJK, color=WHITE).scale(0.40)
        step_a_math = MathTex(r"L = \mu_0 n^2 V").scale(0.68)
        step_a_math[0][0].set_color(YELLOW)   # L
        step_a = VGroup(step_a_txt, step_a_math).arrange(RIGHT, buff=0.12)

        step_b = MathTex(r"W_m = \frac{1}{2}\mu_0 n^2 V I^2").scale(0.72)
        step_b[0][2].set_color(YELLOW)  # μ₀

        step_c_txt = Text("再代入", font=CJK, color=WHITE).scale(0.40)
        step_c_math = MathTex(r"B = \mu_0 n I \;\Rightarrow\; nI = \frac{B}{\mu_0}").scale(0.62)
        step_c_math[0][0].set_color(RED)   # B
        step_c = VGroup(step_c_txt, step_c_math).arrange(RIGHT, buff=0.12)

        step_d_txt = Text("化简：", font=CJK, color=WHITE).scale(0.40)
        step_d_math = MathTex(r"W_m = \frac{B^2}{2\mu_0}\cdot V").scale(0.72)
        step_d_math[0][0:3].set_color(GREEN)
        step_d = VGroup(step_d_txt, step_d_math).arrange(RIGHT, buff=0.12)

        step_e_txt = Text("能量密度（单位体积能量）：", font=CJK, color=WHITE).scale(0.40)
        step_e_math = MathTex(
            r"w_m = \frac{W_m}{V} = \frac{B^2}{2\mu_0} = \frac{1}{2}\mu_0 H^2",
            color=YELLOW
        ).scale(0.72)
        step_e = VGroup(step_e_txt, step_e_math).arrange(DOWN, buff=0.12, aligned_edge=LEFT)

        board = VGroup(step_a, step_b, step_c, step_d, step_e).arrange(
            DOWN, buff=0.38, aligned_edge=LEFT
        )
        board.next_to(title, DOWN, buff=0.9).to_edge(RIGHT, buff=0.45)
        board.scale_to_fit_width(5.8)

        self.play(FadeIn(step_a))
        self.wait(1.0)
        self.play(Write(step_b))
        self.wait(1.0)
        self.play(FadeIn(step_c))
        self.wait(1.0)
        self.play(Write(step_d))
        self.wait(1.0)
        self.play(FadeIn(step_e))
        wm_box = SurroundingRectangle(step_e_math, color=YELLOW, buff=0.1)
        self.play(Create(wm_box))
        self.wait(1.4)

        act2_all = VGroup(act2_label, sol_rect, coil_lines, sol_label, V_label,
                          board, wm_box)
        self.play(FadeOut(act2_all), FadeOut(field_lines))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # 第三幕：非均匀场 → 积分 W = ∫w dV
        # ══════════════════════════════════════════════════════════

        # Step 7: 用渐变色矩形阵列模拟能量密度分布
        act3_label = Text("第三幕：非均匀场与体积分", font=CJK, color=ORANGE).scale(0.5)
        act3_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act3_label))
        self.wait(0.5)

        # 横截面区域（用色块表示 w_m 分布）
        nx, ny = 12, 8
        cell_w = 4.8 / nx
        cell_h = 3.0 / ny
        origin_x = -2.4
        origin_y = -1.5

        cells = VGroup()
        for ix in range(nx):
            for iy in range(ny):
                # 模拟非均匀分布：中心 B 大，边缘 B 小
                cx_frac = (ix + 0.5) / nx - 0.5   # -0.5 ~ 0.5
                cy_frac = (iy + 0.5) / ny - 0.5
                r2 = cx_frac ** 2 + cy_frac ** 2
                # 用高斯形状模拟
                val = math.exp(-r2 / 0.12)
                c = interpolate_color(BLUE_E, RED, val)
                rect = Rectangle(
                    width=cell_w, height=cell_h,
                    fill_color=c, fill_opacity=0.82,
                    stroke_color=BLACK, stroke_width=0.5
                ).move_to([origin_x + (ix + 0.5) * cell_w,
                            origin_y + (iy + 0.5) * cell_h, 0])
                cells.add(rect)

        heat_label = Text("颜色越红 → 能量密度 w_m 越大", font=CJK, color=WHITE).scale(0.42)
        heat_label.next_to(cells, DOWN, buff=0.22)

        self.play(FadeIn(cells))
        self.play(FadeIn(heat_label))
        self.wait(0.8)

        # Step 8: 高亮几个小体元，展示"切割"
        highlight_cells = VGroup()
        sample_indices = [
            nx * 4 + 6,
            nx * 3 + 5,
            nx * 5 + 7,
        ]
        for idx in sample_indices:
            if idx < len(cells):
                hc = cells[idx].copy().set_stroke(color=WHITE, width=2.5).set_fill(opacity=0.95)
                highlight_cells.add(hc)

        dV_label = MathTex(r"\Delta V", color=WHITE).scale(0.6)
        dV_label.next_to(highlight_cells, RIGHT, buff=0.2)

        seg_hint = Text("将空间分割为小体元 ΔV", font=CJK, color=WHITE).scale(0.42)
        seg_hint.next_to(heat_label, DOWN, buff=0.18)

        self.play(FadeIn(highlight_cells), FadeIn(dV_label))
        self.play(FadeIn(seg_hint))
        self.wait(1.0)

        # Step 9: 积分公式出现（右侧）
        int_title = Text("非均匀场总能量：", font=CJK, color=YELLOW).scale(0.46)
        int_eq1 = MathTex(r"W_m = \sum_i w_m(\mathbf{r}_i)\,\Delta V_i").scale(0.72)
        int_eq2 = MathTex(r"\xrightarrow{\Delta V \to 0}", color=CYAN).scale(0.65)
        int_eq3 = MathTex(
            r"W_m = \int_V \frac{B^2}{2\mu_0}\,\mathrm{d}V",
            color=GREEN
        ).scale(0.75)

        int_group = VGroup(int_title, int_eq1, int_eq2, int_eq3).arrange(DOWN, buff=0.35)
        int_group.to_edge(RIGHT, buff=0.45).shift(DOWN * 0.2)
        int_group.scale_to_fit_width(4.8)

        self.play(FadeIn(int_title))
        self.play(Write(int_eq1))
        self.wait(0.8)
        self.play(Write(int_eq2))
        self.play(Write(int_eq3))
        int_box = SurroundingRectangle(int_eq3, color=GREEN, buff=0.1)
        self.play(Create(int_box))
        self.wait(1.4)

        act3_all = VGroup(act3_label, cells, heat_label, highlight_cells,
                          dV_label, seg_hint, int_group, int_box)
        self.play(FadeOut(act3_all))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # Step 10: 小结卡（关键公式汇总）
        # ══════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.5)

        s1_txt = Text("自感储能：", font=CJK, color=WHITE).scale(0.44)
        s1_math = MathTex(r"W_m = \frac{1}{2}LI^2", color=YELLOW).scale(0.85)
        s1 = VGroup(s1_txt, s1_math).arrange(RIGHT, buff=0.2)

        s2_txt = Text("磁场能量密度：", font=CJK, color=WHITE).scale(0.44)
        s2_math = MathTex(r"w_m = \frac{B^2}{2\mu_0} = \frac{1}{2}\mu_0 H^2",
                          color=YELLOW).scale(0.85)
        s2 = VGroup(s2_txt, s2_math).arrange(RIGHT, buff=0.2)

        s3_txt = Text("非均匀场总能量：", font=CJK, color=WHITE).scale(0.44)
        s3_math = MathTex(r"W_m = \int_V w_m\,\mathrm{d}V", color=GREEN).scale(0.85)
        s3 = VGroup(s3_txt, s3_math).arrange(RIGHT, buff=0.2)

        s4 = Text("磁场能量密度与 B² 成正比，与 μ₀ 成反比", font=CJK, color=CYAN).scale(0.44)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.0)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_math), FadeIn(s1_txt))
        self.wait(0.8)
        self.play(Write(s2_math), FadeIn(s2_txt))
        self.wait(0.8)
        self.play(Write(s3_math), FadeIn(s3_txt))
        self.wait(0.8)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Kp2MagneticEnergyDensity",
        "id": "phys-ch09-9.3-kp2-magnetic-energy-density",
        "chapterId": "ch09",
        "sectionId": "9.3",
        "title": "磁场能量与能量密度",
        "description": "三幕动画：RL充电积分推导W=LI²/2、螺线管参数替换得w=B²/(2μ₀)、非均匀场体积分概念。",
    },
]
