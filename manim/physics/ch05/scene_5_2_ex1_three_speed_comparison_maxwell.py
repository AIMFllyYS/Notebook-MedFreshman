"""第 5.2 节 · 例题精讲：三种特征速率的计算与比较（氢气/氧气）。

麦克斯韦速率分布函数 f(v) 坐标系，H2（蓝色）与 O2（红色）双曲线，
逐步标注最概然速率 vp、平均速率 v_bar、方均根速率 v_rms，
双向箭头展示 4:1 之比，色块说明三种速率用途，
ValueTracker 扫温度 100K→1000K 实时动态演示 sqrt(T) 关系。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 物理常数 ───────────────────────────────────────────────────────────────
R_GAS = 8.314          # J/(mol·K)
MU_H2 = 2e-3           # kg/mol
MU_O2 = 32e-3          # kg/mol

# 三种特征速率公式（SI，返回 m/s）
def vp(mu, T):
    return math.sqrt(2 * R_GAS * T / mu)

def v_bar(mu, T):
    return math.sqrt(8 * R_GAS * T / (math.pi * mu))

def v_rms(mu, T):
    return math.sqrt(3 * R_GAS * T / mu)

# 麦克斯韦速率分布函数（归一化，适合绘图）
def maxwell_f(v, mu, T):
    """f(v) = 4π * (m/2πkT)^(3/2) * v^2 * exp(-mv^2/2kT)
    用摩尔质量形式：f(v) = 4π*(μ/2πRT)^(3/2)*v^2*exp(-μv^2/2RT)"""
    if v < 0:
        return 0.0
    prefactor = 4.0 * math.pi * (mu / (2.0 * math.pi * R_GAS * T)) ** 1.5
    exponent = -mu * v * v / (2.0 * R_GAS * T)
    return prefactor * v * v * math.exp(exponent)


class Ch05Ex1ThreeSpeedComparisonMaxwell(Scene):
    def construct(self):

        # ══ Step 1: 标题 ══════════════════════════════════════════════════════
        title = Text(
            "三种特征速率的计算与比较", font=CJK, color=BLUE
        ).scale(0.62).to_edge(UP)
        subtitle = Text(
            "第五章 分子动理论 · 5.2  麦克斯韦速率分布",
            font=CJK, color=WHITE
        ).scale(0.38).next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══ Step 2: 生活类比 ══════════════════════════════════════════════════
        ana1 = Text(
            "气体分子速度千差万别——有的飞快、有的缓慢，",
            font=CJK
        ).scale(0.45)
        ana2 = Text(
            "麦克斯韦用统计分布描述这种「速度面貌」，",
            font=CJK
        ).scale(0.45)
        ana3 = Text(
            "并定义了三个代表性速率：vp（最概然）、v_bar（平均）、v_rms（方均根）。",
            font=CJK
        ).scale(0.45)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══ Step 3: 三种速率公式逐步出现 ════════════════════════════════════
        formula_title = Text("三种特征速率公式", font=CJK, color=YELLOW).scale(0.5)
        formula_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(formula_title))

        eq_vp = MathTex(
            r"v_p = \sqrt{\frac{2RT}{\mu}}", color=BLUE
        ).scale(0.85)
        eq_vbar = MathTex(
            r"\bar{v} = \sqrt{\frac{8RT}{\pi\mu}}", color=GREEN
        ).scale(0.85)
        eq_vrms = MathTex(
            r"v_{\rm rms} = \sqrt{\frac{3RT}{\mu}}", color=RED
        ).scale(0.85)

        formulas = VGroup(eq_vp, eq_vbar, eq_vrms).arrange(RIGHT, buff=1.0)
        formulas.next_to(formula_title, DOWN, buff=0.45)
        formulas.scale_to_fit_width(12.5)

        self.play(Write(eq_vp))
        self.wait(0.7)
        self.play(Write(eq_vbar))
        self.wait(0.7)
        self.play(Write(eq_vrms))
        self.wait(0.8)

        ratio_note = VGroup(
            Text("比值：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"v_p : \bar{v} : v_{\rm rms} = 1 : 1.128 : 1.225", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.18)
        ratio_note.next_to(formulas, DOWN, buff=0.35)
        self.play(FadeIn(ratio_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(formula_title, formulas, ratio_note)))

        # ══ Step 4: 建立坐标系 + 绘制 0°C (273K) 下 H2 和 O2 曲线 ══════════
        T0 = 273.0   # 0°C

        # 坐标系布局：v 轴 0~3000 m/s（覆盖 H2），f(v) 归一化
        axes = Axes(
            x_range=[0, 2800, 500],
            y_range=[0, 0.00220, 0.0005],
            x_length=10.5,
            y_length=3.6,
            axis_config={"color": BLUE, "include_tip": True, "tip_width": 0.18, "tip_height": 0.18},
            x_axis_config={"numbers_to_include": [500, 1000, 1500, 2000, 2500]},
            y_axis_config={"decimal_number_config": {"num_decimal_places": 0}},
        ).shift(DOWN * 0.85)

        x_lbl = MathTex(r"v\ (\rm m/s)", color=BLUE).scale(0.5)
        x_lbl.next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_lbl_text = Text("f(v)", font=CJK, color=BLUE).scale(0.42)
        y_lbl_text.next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl_text))
        self.wait(0.5)

        # 绘制 H2 曲线（蓝色）
        h2_curve = axes.plot(
            lambda v: maxwell_f(v, MU_H2, T0) if v > 1 else 0,
            x_range=[1, 2799, 10],
            color=BLUE,
            stroke_width=2.8,
        )
        h2_lbl = VGroup(
            Text("H", font=CJK, color=BLUE).scale(0.42),
            MathTex(r"_2", color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.0)
        h2_lbl.next_to(axes.c2p(1700, maxwell_f(1700, MU_H2, T0)), UP, buff=0.15)

        self.play(Create(h2_curve), run_time=1.5)
        self.play(FadeIn(h2_lbl))
        self.wait(0.5)

        # 绘制 O2 曲线（红色）
        o2_curve = axes.plot(
            lambda v: maxwell_f(v, MU_O2, T0) if v > 1 else 0,
            x_range=[1, 1200, 5],
            color=RED,
            stroke_width=2.8,
        )
        o2_lbl = VGroup(
            Text("O", font=CJK, color=RED).scale(0.42),
            MathTex(r"_2", color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.0)
        o2_lbl.next_to(axes.c2p(420, maxwell_f(420, MU_O2, T0)), UP, buff=0.15)

        self.play(Create(o2_curve), run_time=1.5)
        self.play(FadeIn(o2_lbl))
        self.wait(1.0)

        # ══ Step 5: 在 H2 曲线上标注三种速率（垂线 + 标签逐一出现）══════════
        # 0°C 下 H2 精确值
        VP_H2  = vp(MU_H2, T0)      # ≈ 1564 m/s
        VB_H2  = v_bar(MU_H2, T0)   # ≈ 1761 m/s
        VR_H2  = v_rms(MU_H2, T0)   # ≈ 1845 m/s

        def make_dashed_vline(v_val, color, ymax_frac=1.05):
            """从 x 轴到曲线峰附近的虚线"""
            y_top = maxwell_f(v_val, MU_H2, T0) * ymax_frac
            return DashedLine(
                axes.c2p(v_val, 0),
                axes.c2p(v_val, min(y_top, 0.00215)),
                color=color,
                stroke_width=1.8,
                dash_length=0.06,
            )

        # vp_H2 标注
        vp_line_h2 = make_dashed_vline(VP_H2, BLUE)
        vp_dot_h2 = Dot(axes.c2p(VP_H2, maxwell_f(VP_H2, MU_H2, T0)), color=BLUE, radius=0.07)
        vp_lbl_h2 = VGroup(
            MathTex(r"v_p", color=BLUE).scale(0.48),
            Text("=1564 m/s", font=CJK, color=BLUE).scale(0.38),
        ).arrange(DOWN, buff=0.08)
        vp_lbl_h2.next_to(axes.c2p(VP_H2, 0), DOWN, buff=0.18)

        self.play(Create(vp_line_h2), FadeIn(vp_dot_h2))
        self.play(FadeIn(vp_lbl_h2))
        self.wait(0.8)

        # v_bar_H2 标注
        vb_line_h2 = make_dashed_vline(VB_H2, GREEN, ymax_frac=1.0)
        vb_dot_h2 = Dot(axes.c2p(VB_H2, maxwell_f(VB_H2, MU_H2, T0)), color=GREEN, radius=0.07)
        vb_lbl_h2 = VGroup(
            MathTex(r"\bar{v}", color=GREEN).scale(0.48),
            Text("=1761 m/s", font=CJK, color=GREEN).scale(0.38),
        ).arrange(DOWN, buff=0.08)
        vb_lbl_h2.next_to(axes.c2p(VB_H2, 0), DOWN, buff=0.18)

        self.play(Create(vb_line_h2), FadeIn(vb_dot_h2))
        self.play(FadeIn(vb_lbl_h2))
        self.wait(0.8)

        # v_rms_H2 标注
        vr_line_h2 = make_dashed_vline(VR_H2, ORANGE, ymax_frac=1.0)
        vr_dot_h2 = Dot(axes.c2p(VR_H2, maxwell_f(VR_H2, MU_H2, T0)), color=ORANGE, radius=0.07)
        vr_lbl_h2 = VGroup(
            MathTex(r"v_{\rm rms}", color=ORANGE).scale(0.48),
            Text("=1845 m/s", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(DOWN, buff=0.08)
        vr_lbl_h2.next_to(axes.c2p(VR_H2, 0), DOWN, buff=0.18)

        self.play(Create(vr_line_h2), FadeIn(vr_dot_h2))
        self.play(FadeIn(vr_lbl_h2))
        self.wait(1.0)

        # ══ Step 6: 在 O2 曲线上标注三种速率 ══════════════════════════════
        VP_O2  = vp(MU_O2, T0)      # ≈ 391 m/s
        VB_O2  = v_bar(MU_O2, T0)   # ≈ 441 m/s
        VR_O2  = v_rms(MU_O2, T0)   # ≈ 461 m/s

        def make_dashed_vline_o2(v_val, color):
            y_top = maxwell_f(v_val, MU_O2, T0) * 1.05
            return DashedLine(
                axes.c2p(v_val, 0),
                axes.c2p(v_val, min(y_top, 0.00215)),
                color=color,
                stroke_width=1.8,
                dash_length=0.06,
            )

        vp_line_o2  = make_dashed_vline_o2(VP_O2, BLUE)
        vb_line_o2  = make_dashed_vline_o2(VB_O2, GREEN)
        vr_line_o2  = make_dashed_vline_o2(VR_O2, ORANGE)

        vp_dot_o2 = Dot(axes.c2p(VP_O2, maxwell_f(VP_O2, MU_O2, T0)), color=BLUE, radius=0.07)
        vb_dot_o2 = Dot(axes.c2p(VB_O2, maxwell_f(VB_O2, MU_O2, T0)), color=GREEN, radius=0.07)
        vr_dot_o2 = Dot(axes.c2p(VR_O2, maxwell_f(VR_O2, MU_O2, T0)), color=ORANGE, radius=0.07)

        # O2 标签放在上方（曲线峰较高，需上方偏移）
        vp_lbl_o2 = VGroup(
            MathTex(r"v_p", color=BLUE).scale(0.42),
            Text("391", font=CJK, color=BLUE).scale(0.34),
        ).arrange(DOWN, buff=0.05)
        vp_lbl_o2.next_to(axes.c2p(VP_O2, maxwell_f(VP_O2, MU_O2, T0)), UP + LEFT * 0.1, buff=0.12)

        vb_lbl_o2 = VGroup(
            MathTex(r"\bar{v}", color=GREEN).scale(0.42),
            Text("441", font=CJK, color=GREEN).scale(0.34),
        ).arrange(DOWN, buff=0.05)
        vb_lbl_o2.next_to(axes.c2p(VB_O2, maxwell_f(VB_O2, MU_O2, T0)), UP, buff=0.12)

        vr_lbl_o2 = VGroup(
            MathTex(r"v_{\rm rms}", color=ORANGE).scale(0.42),
            Text("461", font=CJK, color=ORANGE).scale(0.34),
        ).arrange(DOWN, buff=0.05)
        vr_lbl_o2.next_to(axes.c2p(VR_O2, maxwell_f(VR_O2, MU_O2, T0)), UP + RIGHT * 0.1, buff=0.12)

        self.play(
            Create(vp_line_o2), Create(vb_line_o2), Create(vr_line_o2),
            FadeIn(vp_dot_o2), FadeIn(vb_dot_o2), FadeIn(vr_dot_o2),
        )
        self.play(FadeIn(vp_lbl_o2), FadeIn(vb_lbl_o2), FadeIn(vr_lbl_o2))
        self.wait(1.2)

        # ══ Step 7: 双向箭头 + 4:1 比值标注 ════════════════════════════════
        # 以最概然速率为例展示 vp_H2 / vp_O2 ≈ 4
        arrow_y = -0.0002   # 轴下方位置（坐标系数值）
        biarrow = DoubleArrow(
            axes.c2p(VP_O2, 0) + DOWN * 0.55,
            axes.c2p(VP_H2, 0) + DOWN * 0.55,
            color=YELLOW,
            buff=0.0,
            stroke_width=2.2,
            tip_length=0.18,
        )
        ratio_lbl = VGroup(
            MathTex(r"\times 4", color=YELLOW).scale(0.58),
            Text("(比 = sqrt(μO2/μH2))", font=CJK, color=YELLOW).scale(0.36),
        ).arrange(DOWN, buff=0.08)
        ratio_lbl.next_to(biarrow, DOWN, buff=0.12)

        self.play(Create(biarrow))
        self.play(FadeIn(ratio_lbl))
        self.wait(1.5)
        self.play(FadeOut(biarrow), FadeOut(ratio_lbl))

        # ══ Step 8: 用途说明色块 ════════════════════════════════════════════
        # 清理部分标签，为文字框腾空间
        self.play(
            FadeOut(vp_lbl_h2), FadeOut(vb_lbl_h2), FadeOut(vr_lbl_h2),
            FadeOut(vp_lbl_o2), FadeOut(vb_lbl_o2), FadeOut(vr_lbl_o2),
        )

        usage_title = Text("三种速率的物理用途", font=CJK, color=WHITE).scale(0.44)
        usage_title.to_edge(RIGHT, buff=0.3).shift(UP * 2.2)

        u1 = VGroup(
            MathTex(r"v_p", color=BLUE).scale(0.52),
            Text("：分子最密集速率，峰值位置", font=CJK, color=BLUE).scale(0.37),
        ).arrange(RIGHT, buff=0.12)
        u2 = VGroup(
            MathTex(r"v_{\rm rms}", color=ORANGE).scale(0.52),
            Text("：计算平均平动动能", font=CJK, color=ORANGE).scale(0.37),
        ).arrange(RIGHT, buff=0.12)
        u3_eq = MathTex(r"\bar{\varepsilon}_k = \tfrac{1}{2}mv_{\rm rms}^2 = \tfrac{3}{2}k_BT",
                        color=ORANGE).scale(0.46)
        u4 = VGroup(
            MathTex(r"\bar{v}", color=GREEN).scale(0.52),
            Text("：计算碰撞频率 Z", font=CJK, color=GREEN).scale(0.37),
        ).arrange(RIGHT, buff=0.12)

        usages = VGroup(usage_title, u1, u2, u3_eq, u4).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        usages.to_edge(RIGHT, buff=0.25).shift(UP * 0.5)
        usages.scale_to_fit_width(3.8)

        box_u = SurroundingRectangle(usages, color=CYAN, buff=0.18, corner_radius=0.12)
        self.play(FadeIn(usages), Create(box_u))
        self.wait(2.0)
        self.play(FadeOut(usages), FadeOut(box_u))

        # ══ Step 9: ValueTracker 扫温度 T=100K→1000K ════════════════════════
        # 清场旧曲线和标注，换成 always_redraw 版本
        self.play(
            FadeOut(h2_curve), FadeOut(o2_curve),
            FadeOut(h2_lbl), FadeOut(o2_lbl),
            FadeOut(vp_line_h2), FadeOut(vb_line_h2), FadeOut(vr_line_h2),
            FadeOut(vp_dot_h2), FadeOut(vb_dot_h2), FadeOut(vr_dot_h2),
            FadeOut(vp_line_o2), FadeOut(vb_line_o2), FadeOut(vr_line_o2),
            FadeOut(vp_dot_o2), FadeOut(vb_dot_o2), FadeOut(vr_dot_o2),
        )

        T_tracker = ValueTracker(273.0)

        # 动态曲线
        def h2_curve_fn():
            T = T_tracker.get_value()
            return axes.plot(
                lambda v: maxwell_f(v, MU_H2, T) if v > 1 else 0,
                x_range=[1, 2799, 12],
                color=BLUE,
                stroke_width=2.5,
            )

        def o2_curve_fn():
            T = T_tracker.get_value()
            return axes.plot(
                lambda v: maxwell_f(v, MU_O2, T) if v > 1 else 0,
                x_range=[1, 1199, 6],
                color=RED,
                stroke_width=2.5,
            )

        h2_dyn = always_redraw(h2_curve_fn)
        o2_dyn = always_redraw(o2_curve_fn)

        # 动态速率垂线 (H2)
        def make_h2_vline(speed_fn, color):
            def fn():
                T = T_tracker.get_value()
                v_val = speed_fn(MU_H2, T)
                v_val = min(v_val, 2790)
                y_top = maxwell_f(v_val, MU_H2, T) * 1.05
                y_top = min(y_top, 0.00215)
                return DashedLine(
                    axes.c2p(v_val, 0),
                    axes.c2p(v_val, y_top),
                    color=color,
                    stroke_width=1.6,
                    dash_length=0.06,
                )
            return always_redraw(fn)

        # 动态速率垂线 (O2)
        def make_o2_vline(speed_fn, color):
            def fn():
                T = T_tracker.get_value()
                v_val = speed_fn(MU_O2, T)
                v_val = min(v_val, 1190)
                y_top = maxwell_f(v_val, MU_O2, T) * 1.05
                y_top = min(y_top, 0.00215)
                return DashedLine(
                    axes.c2p(v_val, 0),
                    axes.c2p(v_val, y_top),
                    color=color,
                    stroke_width=1.6,
                    dash_length=0.06,
                )
            return always_redraw(fn)

        h2_vp_line  = make_h2_vline(vp,    BLUE)
        h2_vb_line  = make_h2_vline(v_bar, GREEN)
        h2_vr_line  = make_h2_vline(v_rms, ORANGE)
        o2_vp_line  = make_o2_vline(vp,    BLUE)
        o2_vb_line  = make_o2_vline(v_bar, GREEN)
        o2_vr_line  = make_o2_vline(v_rms, ORANGE)

        # 温度实时显示
        T_display = always_redraw(
            lambda: VGroup(
                Text("T =", font=CJK, color=WHITE).scale(0.45),
                MathTex(
                    r"{:.0f}\ \rm K".format(T_tracker.get_value()),
                    color=YELLOW
                ).scale(0.55),
            ).arrange(RIGHT, buff=0.12).to_edge(UP + RIGHT, buff=0.6).shift(DOWN * 0.75)
        )

        # sqrt(T) 公式提示
        sqrt_note = VGroup(
            Text("速率正比于", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"\sqrt{T}", color=CYAN).scale(0.6),
        ).arrange(RIGHT, buff=0.12)
        sqrt_note.to_edge(RIGHT, buff=0.4).shift(DOWN * 1.2)

        self.add(h2_dyn, o2_dyn,
                 h2_vp_line, h2_vb_line, h2_vr_line,
                 o2_vp_line, o2_vb_line, o2_vr_line,
                 T_display)
        self.play(FadeIn(sqrt_note))
        self.wait(0.5)

        # 温度从 273K 降到 100K
        self.play(T_tracker.animate.set_value(100.0), run_time=2.5, rate_func=linear)
        self.wait(0.8)
        # 温度从 100K 升到 1000K
        self.play(T_tracker.animate.set_value(1000.0), run_time=5.0, rate_func=linear)
        self.wait(0.8)
        # 回到 273K
        self.play(T_tracker.animate.set_value(273.0), run_time=1.5, rate_func=smooth)
        self.wait(1.2)

        self.play(FadeOut(sqrt_note))

        # ══ Step 10: 0°C 下数值结果对比 ════════════════════════════════════
        num_title = Text("0°C 下数值结果（m/s）", font=CJK, color=YELLOW).scale(0.48)
        num_title.to_edge(RIGHT, buff=0.3).shift(UP * 2.2)

        row_h2 = VGroup(
            Text("H2", font=CJK, color=BLUE).scale(0.44),
            MathTex(r"v_p=1564", color=BLUE).scale(0.44),
            MathTex(r"\bar{v}=1761", color=GREEN).scale(0.44),
            MathTex(r"v_{\rm rms}=1845", color=ORANGE).scale(0.44),
        ).arrange(RIGHT, buff=0.18)

        row_o2 = VGroup(
            Text("O2", font=CJK, color=RED).scale(0.44),
            MathTex(r"v_p=391", color=BLUE).scale(0.44),
            MathTex(r"\bar{v}=441", color=GREEN).scale(0.44),
            MathTex(r"v_{\rm rms}=461", color=ORANGE).scale(0.44),
        ).arrange(RIGHT, buff=0.18)

        num_box_content = VGroup(num_title, row_h2, row_o2).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        num_box_content.to_edge(RIGHT, buff=0.2).shift(UP * 0.2)
        num_box_content.scale_to_fit_width(3.8)
        num_box = SurroundingRectangle(num_box_content, color=CYAN, buff=0.18, corner_radius=0.1)

        self.play(FadeIn(num_box_content), Create(num_box))
        self.wait(2.0)

        # ══ Step 11: 清场，进入小结卡 ════════════════════════════════════════
        self.play(
            FadeOut(num_box_content), FadeOut(num_box),
            FadeOut(h2_dyn), FadeOut(o2_dyn),
            FadeOut(h2_vp_line), FadeOut(h2_vb_line), FadeOut(h2_vr_line),
            FadeOut(o2_vp_line), FadeOut(o2_vb_line), FadeOut(o2_vr_line),
            FadeOut(T_display),
            FadeOut(axes), FadeOut(x_lbl), FadeOut(y_lbl_text),
        )
        self.wait(0.4)

        # ══ Step 12: 小结卡 ══════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s_eq1 = VGroup(
            Text("最概然速率：", font=CJK, color=BLUE).scale(0.44),
            MathTex(r"v_p = \sqrt{\dfrac{2RT}{\mu}}", color=BLUE).scale(0.72),
        ).arrange(RIGHT, buff=0.2)

        s_eq2 = VGroup(
            Text("平均速率：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\bar{v} = \sqrt{\dfrac{8RT}{\pi\mu}}", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.2)

        s_eq3 = VGroup(
            Text("方均根速率：", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"v_{\rm rms} = \sqrt{\dfrac{3RT}{\mu}}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.2)

        s_ratio = MathTex(
            r"v_p : \bar{v} : v_{\rm rms} = 1 : 1.128 : 1.225",
            color=YELLOW
        ).scale(0.7)

        s_rule = VGroup(
            Text("相同 T：轻气体速率快（正比于", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"1/\sqrt{\mu}", color=CYAN).scale(0.52),
            Text("）；升温：速率正比", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\sqrt{T}", color=CYAN).scale(0.52),
        ).arrange(RIGHT, buff=0.08)

        summary = VGroup(s_eq1, s_eq2, s_eq3, s_ratio, s_rule).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.2)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s_eq1))
        self.wait(0.5)
        self.play(Write(s_eq2))
        self.wait(0.5)
        self.play(Write(s_eq3))
        self.wait(0.5)
        self.play(FadeIn(s_ratio))
        self.wait(0.5)
        self.play(FadeIn(s_rule))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch05Ex1ThreeSpeedComparisonMaxwell",
        "id": "phys-ch05-5.2-ex1-three-speed-comparison-maxwell",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "三种特征速率的计算与比较（氢气/氧气）",
        "description": "麦克斯韦速率分布双曲线（H2/O2），逐步标注 vp、v_bar、v_rms，展示 4:1 之比，ValueTracker 扫温度演示速率随 sqrt(T) 增长。",
    }
]
