"""第 5.2 节 · 玻尔兹曼分布与大气压随高度变化

可视化方案：
1. 大气柱截面密度点阵 + n(h) 曲线坐标系
2. ValueTracker 扫温度 T，观察曲线斜率/大气厚度变化
3. 叠加 p(h) 曲线，标注大气标高 H = RT/(μg)
4. ValueTracker 扫摩尔质量 μ，比较轻重气体分布高度

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常量
k_B = 1.381e-23   # 玻尔兹曼常数
R_GAS = 8.314     # 气体常数
g = 9.8           # 重力加速度
M_AIR = 0.029     # 空气摩尔质量 kg/mol
p0 = 1.0          # 归一化大气压
n0 = 1.0          # 归一化数密度
H_MAX = 20.0      # 最大高度 km（坐标轴用）


def n_ratio(h_km, T_K, m_over_k=M_AIR * g / R_GAS):
    """n(h)/n0 = exp(-mgh/kT) = exp(-μgh/RT)，h 单位 km"""
    h = h_km * 1000  # 转换为 m
    return math.exp(-m_over_k * h / T_K)


def scale_height_km(T_K, mu=M_AIR):
    """大气标高 H = RT/(μg)，单位 km"""
    return R_GAS * T_K / (mu * g) / 1000


class Ch05Kp4BoltzmannDistributionAtmosphere(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("玻尔兹曼分布与大气压随高度变化",
                     font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第五章 分子动理论  ·  5.2 节",
                        font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("登山时越往高处空气越稀薄，呼吸越困难——", font=CJK).scale(0.48)
        ana2 = Text("这是因为分子在重力场中按玻尔兹曼分布排列，", font=CJK).scale(0.48)
        ana3 = Text("高度越高，能量势垒越大，分子数越少。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(13)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 玻尔兹曼分布公式（逐步出现）──────────────────────────
        label_boltz = Text("玻尔兹曼能量分布：", font=CJK, color=YELLOW).scale(0.48)
        eq_boltz = MathTex(r"n = n_0\,e^{-\varepsilon/(kT)}", color=YELLOW).scale(0.9)
        row1 = VGroup(label_boltz, eq_boltz).arrange(RIGHT, buff=0.3)
        row1.next_to(title, DOWN, buff=0.55)

        label_gravity = Text("重力势能代入：", font=CJK, color=WHITE).scale(0.48)
        eq_gravity = MathTex(r"\varepsilon = mgh", color=WHITE).scale(0.9)
        row2 = VGroup(label_gravity, eq_gravity).arrange(RIGHT, buff=0.3)

        label_nh = Text("数密度随高度：", font=CJK, color=GREEN).scale(0.48)
        eq_nh = MathTex(r"n(h) = n_0\,e^{-mgh/(kT)}", color=GREEN).scale(0.9)
        row2.next_to(row1, DOWN, buff=0.35, aligned_edge=LEFT)
        row_nh = VGroup(label_nh, eq_nh).arrange(RIGHT, buff=0.3)
        row_nh.next_to(row2, DOWN, buff=0.35, aligned_edge=LEFT)

        self.play(FadeIn(row1))
        self.wait(1.0)
        self.play(FadeIn(row2))
        self.wait(0.8)
        self.play(FadeIn(row_nh))
        self.wait(1.5)
        self.play(FadeOut(VGroup(row1, row2, row_nh)))

        # ── Step 4: 大气柱密度点阵 + n(h) 曲线 ──────────────────────────
        # 左侧：大气柱示意（密度点阵）
        # 右侧：n-h 坐标系

        T_init = 300.0  # 初始温度 K

        # 坐标系（右侧）
        axes = Axes(
            x_range=[0, 1.1, 0.25],
            y_range=[0, H_MAX, 5],
            x_length=5.5,
            y_length=5.2,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0, 0.25, 0.5, 0.75, 1.0]},
            y_axis_config={"numbers_to_include": [0, 5, 10, 15, 20]},
        ).shift(RIGHT * 2.8 + DOWN * 0.5)

        x_lbl = VGroup(
            MathTex(r"n/n_0").scale(0.55),
        ).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = VGroup(
            Text("h", font=CJK).scale(0.45),
            MathTex(r"/\mathrm{km}").scale(0.45),
        ).arrange(RIGHT, buff=0.05)
        y_lbl.next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        T_tracker = ValueTracker(T_init)

        # n(h) 曲线（always_redraw）
        n_curve = always_redraw(
            lambda: axes.plot(
                lambda h: n_ratio(h, T_tracker.get_value()),
                x_range=[0, H_MAX],
                use_smoothing=True,
                color=GREEN,
            )
        )
        self.play(Create(n_curve))
        self.wait(0.5)

        # 左侧大气柱区域
        col_left = -5.8
        col_right = -1.5
        col_bottom = axes.get_bottom()[1]
        col_top = axes.get_top()[1]
        col_width = col_right - col_left

        # 大气柱背景框
        atm_col_rect = Rectangle(
            width=col_right - col_left,
            height=col_top - col_bottom,
            color=BLUE_E,
            fill_color=BLUE_E,
            fill_opacity=0.15,
            stroke_width=1.5,
        ).move_to([(col_left + col_right) / 2, (col_bottom + col_top) / 2, 0])

        # 标注大气柱
        atm_label = Text("大气柱截面", font=CJK, color=BLUE).scale(0.4)
        atm_label.next_to(atm_col_rect, UP, buff=0.12)

        self.play(FadeIn(atm_col_rect), FadeIn(atm_label))
        self.wait(0.3)

        # 密度点阵（always_redraw，随T变化）
        def make_dot_grid():
            """根据当前T值，生成密度随高度衰减的点阵"""
            T = T_tracker.get_value()
            dots = VGroup()
            n_cols = 9  # 列数（水平）
            n_rows = 22  # 高度层数
            for row in range(n_rows):
                h_km = (row + 0.5) * (H_MAX / n_rows)
                ratio = n_ratio(h_km, T)
                # 每层显示的点数（最多 n_cols，最少 0）
                n_show = max(0, round(ratio * n_cols))
                y_pos = col_bottom + (row + 0.5) / n_rows * (col_top - col_bottom)
                # 均匀分布这些点
                for c in range(n_show):
                    x_pos = col_left + (c + 1) * col_width / (n_show + 1)
                    dot = Dot(point=[x_pos, y_pos, 0],
                              radius=0.055, color=CYAN, fill_opacity=0.8)
                    dots.add(dot)
            return dots

        dot_grid = always_redraw(make_dot_grid)
        self.play(FadeIn(dot_grid))

        # 温度标注（always_redraw）
        T_label = always_redraw(
            lambda: VGroup(
                Text("T = ", font=CJK, color=ORANGE).scale(0.45),
                MathTex(
                    r"\mathbf{" + f"{T_tracker.get_value():.0f}" + r"}", color=ORANGE
                ).scale(0.55),
                Text(" K", font=CJK, color=ORANGE).scale(0.45),
            ).arrange(RIGHT, buff=0.08).next_to(axes, DOWN, buff=0.35)
        )
        self.play(FadeIn(T_label))
        self.wait(0.8)

        # ── Step 5: 温度 T 扫动（200K → 400K）──────────────────────────
        T_prompt = Text("升高温度：气体分布更均匀，大气厚度增大",
                        font=CJK, color=YELLOW).scale(0.42)
        T_prompt.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(T_prompt))
        self.play(T_tracker.animate.set_value(400.0), run_time=3.5, rate_func=smooth)
        self.wait(0.8)

        T_prompt2 = Text("降低温度：气体向低层集中，曲线更陡",
                         font=CJK, color=CYAN).scale(0.42)
        T_prompt2.to_edge(DOWN, buff=0.45)
        self.play(ReplacementTransform(T_prompt, T_prompt2))
        self.play(T_tracker.animate.set_value(200.0), run_time=3.0, rate_func=smooth)
        self.wait(0.8)
        self.play(T_tracker.animate.set_value(300.0), run_time=1.5, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(T_prompt2))

        # ── Step 6: 大气压公式 p(h) 叠加 ──────────────────────────────
        # 先清场大气柱部分，保留坐标系和 n 曲线
        self.play(FadeOut(VGroup(atm_col_rect, atm_label, dot_grid)))
        self.wait(0.3)

        # 在坐标系上叠加 p(h) 曲线（与 n(h) 形状相同）
        p_curve = always_redraw(
            lambda: axes.plot(
                lambda h: n_ratio(h, T_tracker.get_value()),
                x_range=[0, H_MAX],
                use_smoothing=True,
                color=ORANGE,
                stroke_width=4,
            )
        )

        # 图例
        legend_n = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=GREEN, stroke_width=3),
            Text(" n(h)/n0", font=CJK, color=GREEN).scale(0.4),
        ).arrange(RIGHT, buff=0.05)
        legend_p = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=ORANGE, stroke_width=3),
            Text(" p(h)/p0", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.05)
        legend = VGroup(legend_n, legend_p).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        legend.next_to(axes, LEFT, buff=0.3).shift(UP * 1.5)

        eq_ph_label = Text("大气压随高度：", font=CJK, color=ORANGE).scale(0.42)
        eq_ph = MathTex(r"p(h) = p_0\,e^{-\mu g h/(RT)}", color=ORANGE).scale(0.82)
        eq_ph_row = VGroup(eq_ph_label, eq_ph).arrange(RIGHT, buff=0.25)
        eq_ph_row.next_to(title, DOWN, buff=0.48)

        self.play(FadeIn(eq_ph_row))
        self.wait(0.8)
        self.play(Create(p_curve), FadeIn(legend))
        self.wait(1.2)

        # 在 h=8.5 km 处画水平虚线，标注 p ≈ p0/e
        h_scale = 8.5  # km，大气标高（T=288K, μ=0.029）
        # 实际标高 = RT/(μg)
        H_actual = scale_height_km(300.0, M_AIR)  # ≈ 8.8 km
        y_point = axes.c2p(n_ratio(H_actual, 300.0), H_actual)
        # n/p 值在大气标高处 ≈ 1/e ≈ 0.368
        val_1e = math.exp(-1)

        # 水平虚线 p = 1/e
        dline_h = DashedLine(
            axes.c2p(0, H_actual),
            axes.c2p(val_1e, H_actual),
            color=YELLOW, stroke_width=2, dash_length=0.12,
        )
        # 垂直虚线 n = 1/e
        dline_v = DashedLine(
            axes.c2p(val_1e, 0),
            axes.c2p(val_1e, H_actual),
            color=YELLOW, stroke_width=2, dash_length=0.12,
        )
        dot_1e = Dot(axes.c2p(val_1e, H_actual), color=YELLOW, radius=0.09)

        lbl_h_scale = VGroup(
            Text("H = ", font=CJK, color=YELLOW).scale(0.4),
            MathTex(r"RT/(\mu g)", color=YELLOW).scale(0.5),
        ).arrange(RIGHT, buff=0.05)
        lbl_h_scale.next_to(dline_h, LEFT, buff=0.12)

        lbl_val = MathTex(r"p=p_0/e", color=YELLOW).scale(0.5)
        lbl_val.next_to(dot_1e, RIGHT, buff=0.12)

        self.play(Create(dline_h), Create(dline_v), FadeIn(dot_1e))
        self.play(FadeIn(lbl_h_scale), FadeIn(lbl_val))
        self.wait(1.5)

        # Brace 展示大气标高
        brace = Brace(dline_h, direction=LEFT, color=CYAN)
        brace_text = VGroup(
            Text("大气标高", font=CJK, color=CYAN).scale(0.4),
            MathTex(r"H=\frac{RT}{\mu g}", color=CYAN).scale(0.55),
        ).arrange(DOWN, buff=0.1)
        brace.put_at_tip(brace_text)

        self.play(FadeOut(lbl_h_scale))
        self.play(Create(brace), FadeIn(brace_text))
        self.wait(1.5)

        # ── Step 7: ValueTracker 扫摩尔质量 μ（H2 vs O2）────────────────
        # 清场部分元素，重建以 μ 为参数的坐标系
        self.play(FadeOut(VGroup(
            eq_ph_row, dline_h, dline_v, dot_1e, lbl_val, brace, brace_text,
            T_label, legend, n_curve, p_curve,
        )))
        self.wait(0.3)

        # μ ValueTracker（从 H2=0.002 到 O2=0.032）
        mu_tracker = ValueTracker(M_AIR)  # 先从空气开始

        # 叠加两条曲线：n(h) for 当前 μ，以不同颜色
        curve_mu = always_redraw(
            lambda: axes.plot(
                lambda h: math.exp(-mu_tracker.get_value() * g * h * 1000 / (R_GAS * 300.0)),
                x_range=[0, H_MAX],
                use_smoothing=True,
                color=GREEN,
                stroke_width=3,
            )
        )

        mu_label = always_redraw(
            lambda: VGroup(
                Text("mu = ", font=CJK, color=GREEN).scale(0.42),
                MathTex(
                    r"\mu=" + f"{mu_tracker.get_value()*1000:.1f}" + r"\,\mathrm{g/mol}",
                    color=GREEN
                ).scale(0.52),
            ).arrange(RIGHT, buff=0.06).next_to(axes, DOWN, buff=0.38)
        )

        mu_prompt = Text("摩尔质量越小，气体分布越高（轻气体逸散到高层）",
                         font=CJK, color=YELLOW).scale(0.4)
        mu_prompt.to_edge(DOWN, buff=0.42)

        # 固定 O2 曲线作对比
        curve_O2 = axes.plot(
            lambda h: math.exp(-0.032 * g * h * 1000 / (R_GAS * 300.0)),
            x_range=[0, H_MAX],
            use_smoothing=True,
            color=RED,
            stroke_width=2.5,
        )
        lbl_O2 = VGroup(
            Line(ORIGIN, RIGHT * 0.45, color=RED, stroke_width=2.5),
            Text(" O2 (32 g/mol)", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.04)

        curve_H2 = axes.plot(
            lambda h: math.exp(-0.002 * g * h * 1000 / (R_GAS * 300.0)),
            x_range=[0, H_MAX],
            use_smoothing=True,
            color=CYAN,
            stroke_width=2.5,
        )
        lbl_H2 = VGroup(
            Line(ORIGIN, RIGHT * 0.45, color=CYAN, stroke_width=2.5),
            Text(" H2 (2 g/mol)", font=CJK, color=CYAN).scale(0.38),
        ).arrange(RIGHT, buff=0.04)

        legend2 = VGroup(lbl_O2, lbl_H2).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        legend2.next_to(axes, LEFT, buff=0.25).shift(UP * 2.0)

        self.play(Create(curve_mu), FadeIn(mu_label), FadeIn(mu_prompt))
        self.play(Create(curve_O2), Create(curve_H2), FadeIn(legend2))
        self.wait(0.8)

        # 扫 μ 从 O2→H2
        self.play(mu_tracker.animate.set_value(0.002), run_time=3.5, rate_func=smooth)
        self.wait(0.8)
        self.play(mu_tracker.animate.set_value(0.032), run_time=2.5, rate_func=smooth)
        self.wait(0.8)

        self.play(FadeOut(VGroup(
            curve_mu, mu_label, mu_prompt,
            curve_O2, curve_H2, legend2,
            axes, x_lbl, y_lbl,
        )))
        self.wait(0.3)

        # ── Step 8: 大气标高与温度关系——数值示例 ────────────────────────
        example_title = Text("数值示例：大气标高 H = RT / (μg)",
                             font=CJK, color=BLUE).scale(0.5)
        example_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(example_title))

        # 计算几个温度下的标高
        rows = []
        for T_ex in [200, 300, 400]:
            H_ex = scale_height_km(T_ex, M_AIR)
            row = VGroup(
                Text(f"T = {T_ex} K", font=CJK, color=ORANGE).scale(0.44),
                MathTex(r"\Rightarrow").scale(0.55),
                Text(f"H = {H_ex:.1f} km", font=CJK, color=GREEN).scale(0.44),
            ).arrange(RIGHT, buff=0.4)
            rows.append(row)

        table = VGroup(*rows).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        table.next_to(example_title, DOWN, buff=0.45)
        table.scale_to_fit_width(10)

        for row in rows:
            self.play(FadeIn(row))
            self.wait(0.7)
        self.wait(1.0)

        note = Text("温度越高 → 标高越大 → 大气越厚（p 随 h 衰减越慢）",
                    font=CJK, color=YELLOW).scale(0.44)
        note.next_to(table, DOWN, buff=0.35)
        note.scale_to_fit_width(12)
        self.play(FadeIn(note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(example_title, table, note)))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54)
        s_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        s1_label = Text("玻尔兹曼分布：", font=CJK, color=YELLOW).scale(0.44)
        s1_eq = MathTex(r"n = n_0\,e^{-mgh/(kT)}", color=YELLOW).scale(0.82)
        s1 = VGroup(s1_label, s1_eq).arrange(RIGHT, buff=0.25)

        s2_label = Text("大气压高度公式：", font=CJK, color=ORANGE).scale(0.44)
        s2_eq = MathTex(r"p = p_0\,e^{-\mu g h/(RT)}", color=ORANGE).scale(0.82)
        s2 = VGroup(s2_label, s2_eq).arrange(RIGHT, buff=0.25)

        s3_label = Text("大气标高：", font=CJK, color=CYAN).scale(0.44)
        s3_eq = MathTex(r"H = \frac{RT}{\mu g}", color=CYAN).scale(0.82)
        s3 = VGroup(s3_label, s3_eq).arrange(RIGHT, buff=0.25)

        s4 = Text("轻气体标高大，分布更高；T 越高大气越均匀",
                  font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.18)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch05Kp4BoltzmannDistributionAtmosphere",
        "id": "phys-ch05-5.2-kp4-boltzmann-distribution-atmosphere",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "玻尔兹曼分布与大气压随高度变化",
        "description": "通过密度点阵+n(h)/p(h)坐标系，用ValueTracker动态演示温度T与摩尔质量μ对大气垂直分布和标高的影响。",
    }
]
