"""第 5.2 节 · 麦克斯韦速率分布律

物理动画范式：Axes.plot + ValueTracker 扫动参数（温度 T 与质量 m），
展示 Maxwell 速率分布函数 f(v) 的形状随 T、m 变化，
以及 vp / v_bar / v_rms 三特征速率的物理意义。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数 ──────────────────────────────────────────────────────────────────
k_B = 1.380649e-23   # Boltzmann constant  J/K
m_H2 = 2 * 1.6735575e-27   # H2 分子质量  kg
m_O2 = 2 * 16 * 1.6735575e-27  # O2 分子质量  kg
T0 = 300.0  # 标准温度  K


def maxwell_f(v, T, m):
    """Maxwell 速率分布函数 f(v)，单位 s/m。"""
    if v <= 0:
        return 0.0
    A = 4 * math.pi * (m / (2 * math.pi * k_B * T)) ** 1.5
    return A * v * v * math.exp(-m * v * v / (2 * k_B * T))


def vp_func(T, m):
    """最概然速率"""
    return math.sqrt(2 * k_B * T / m)


def vbar_func(T, m):
    """平均速率"""
    return math.sqrt(8 * k_B * T / (math.pi * m))


def vrms_func(T, m):
    """方均根速率"""
    return math.sqrt(3 * k_B * T / m)


# ── 归一化缩放：将速率换算成可视化单位（O(1)）────────────────────────────────
# 以 T0=300K, m=m_O2 的 vp 作为参考长度单位，并手动缩放 y 轴
V_SCALE = vp_func(T0, m_O2)  # 约 395 m/s → 映射到 1.0


def v_norm(v_phys):
    return v_phys / V_SCALE


def fv_norm(f_phys, m):
    """y 轴也要配套归一化，使面积守恒（∫f dv=1 → ∫f_norm dv_norm=1）"""
    return f_phys * V_SCALE


class Ch05Kp2MaxwellSpeedDistribution(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("麦克斯韦速率分布律", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第五章  分子动理论 · 5.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("一杯热水里有数十亿个水分子，", font=CJK).scale(0.48)
        ana2 = Text("它们的速率各不相同——有快有慢，", font=CJK).scale(0.48)
        ana3 = Text("但整体服从一个优美的概率分布：麦克斯韦速率分布。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 公式定义（逐行）
        # ══════════════════════════════════════════════════════════════════
        eq_label = Text("分布函数：", font=CJK, color=CYAN).scale(0.48)
        eq_label.next_to(title, DOWN, buff=0.55).to_edge(LEFT, buff=0.5)
        eq_f = MathTex(
            r"f(v)=4\pi\!\left(\frac{m}{2\pi kT}\right)^{\!\!3/2}",
            r"v^{2}",
            r"e^{-mv^{2}/(2kT)}",
        ).scale(0.72)
        eq_f.next_to(eq_label, RIGHT, buff=0.2)
        eq_f[1].set_color(YELLOW)
        eq_f[2].set_color(ORANGE)

        self.play(FadeIn(eq_label), Write(eq_f))
        self.wait(0.6)

        note1 = VGroup(
            Text("  ", font=CJK, color=YELLOW).scale(0.4),
            MathTex(r"v^{2}", color=YELLOW).scale(0.55),
            Text(": 速率越高，状态数越多", font=CJK, color=YELLOW).scale(0.4),
        ).arrange(RIGHT, buff=0.12)
        note2 = VGroup(
            Text("  ", font=CJK, color=ORANGE).scale(0.4),
            MathTex(r"e^{-mv^{2}/(2kT)}", color=ORANGE).scale(0.55),
            Text(": Boltzmann 因子，速率越高越稀少", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.12)
        notes = VGroup(note1, note2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        notes.next_to(eq_f, DOWN, buff=0.3).to_edge(LEFT, buff=0.5)
        self.play(FadeIn(note1))
        self.wait(0.8)
        self.play(FadeIn(note2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq_label, eq_f, notes)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 建立坐标系 + 绘制 T0 下 O2 的分布曲线
        # ══════════════════════════════════════════════════════════════════
        # 归一化后 v_norm ∈ [0, 3.5]，f_norm ∈ [0, ~1.4]
        axes = Axes(
            x_range=[0, 3.6, 1.0],
            y_range=[0, 1.5, 0.5],
            x_length=9.5,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [1, 2, 3]},
        ).shift(DOWN * 0.7 + LEFT * 0.5)

        x_lbl = VGroup(
            MathTex(r"v").scale(0.6),
            Text("（归一化速率）", font=CJK).scale(0.32),
        ).arrange(RIGHT, buff=0.08).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_lbl = VGroup(
            MathTex(r"f(v)").scale(0.6),
        ).next_to(axes.y_axis.get_end(), LEFT, buff=0.18)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 基准曲线：T0, O2
        curve_O2 = axes.plot(
            lambda v: fv_norm(maxwell_f(v * V_SCALE, T0, m_O2), m_O2),
            x_range=[0.01, 3.5, 0.02],
            color=YELLOW,
            stroke_width=3,
        )
        label_O2 = Text("O2, T=300K", font=CJK, color=YELLOW).scale(0.38)
        label_O2.next_to(axes.c2p(1.2, 1.3), RIGHT, buff=0.1)
        self.play(Create(curve_O2), FadeIn(label_O2))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 标注三特征速率 vp / v_bar / v_rms
        # ══════════════════════════════════════════════════════════════════
        vp0   = v_norm(vp_func(T0, m_O2))    # ≈ 1.0
        vb0   = v_norm(vbar_func(T0, m_O2))  # ≈ 1.128
        vr0   = v_norm(vrms_func(T0, m_O2))  # ≈ 1.225
        fp0   = fv_norm(maxwell_f(vp_func(T0, m_O2), T0, m_O2), m_O2)

        def make_vline(xv, col):
            return DashedLine(
                axes.c2p(xv, 0),
                axes.c2p(xv, fv_norm(maxwell_f(xv * V_SCALE, T0, m_O2), m_O2) + 0.05),
                color=col,
                stroke_width=2.5,
            )

        line_vp  = make_vline(vp0,  GREEN)
        line_vb  = make_vline(vb0,  ORANGE)
        line_vr  = make_vline(vr0,  RED)

        lbl_vp = MathTex(r"v_p", color=GREEN).scale(0.55).next_to(axes.c2p(vp0, 0), DOWN, buff=0.12)
        lbl_vb = MathTex(r"\bar{v}", color=ORANGE).scale(0.55).next_to(axes.c2p(vb0, 0), DOWN, buff=0.12)
        lbl_vr = MathTex(r"v_{\rm rms}", color=RED).scale(0.55).next_to(axes.c2p(vr0, 0), DOWN, buff=0.12)

        self.play(Create(line_vp), FadeIn(lbl_vp))
        self.wait(0.5)
        self.play(Create(line_vb), FadeIn(lbl_vb))
        self.wait(0.5)
        self.play(Create(line_vr), FadeIn(lbl_vr))
        self.wait(0.8)

        # 数值比标注
        ratio_lbl = VGroup(
            MathTex(r"v_p : \bar{v} : v_{\rm rms}", color=WHITE).scale(0.58),
            MathTex(r"=1.41 : 1.60 : 1.73", color=YELLOW).scale(0.58),
        ).arrange(DOWN, buff=0.12)
        ratio_lbl.to_corner(UR, buff=0.5)
        self.play(FadeIn(ratio_lbl))
        self.wait(1.6)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 展示 f(v)dv 面积含义（小区间 dv 内分子占比）
        # ══════════════════════════════════════════════════════════════════
        dv_lo, dv_hi = vp0 - 0.08, vp0 + 0.08
        area_dv = axes.get_area(curve_O2, x_range=[dv_lo, dv_hi], color=GREEN, opacity=0.55)
        area_label = VGroup(
            Text("阴影面积 = ", font=CJK).scale(0.4),
            MathTex(r"f(v)\,\mathrm{d}v", color=GREEN).scale(0.55),
        ).arrange(RIGHT, buff=0.1)
        area_label.to_corner(UR, buff=0.5).shift(DOWN * 1.2)
        area_desc = Text("即速率落在此小区间内的分子占比", font=CJK, color=GREEN).scale(0.38)
        area_desc.next_to(area_label, DOWN, buff=0.15)
        self.play(FadeIn(area_dv))
        self.play(FadeIn(area_label), FadeIn(area_desc))
        self.wait(2.0)

        # 清除标注（保留 axes + 曲线，用于下一步动画）
        self.play(FadeOut(VGroup(
            area_dv, area_label, area_desc,
            line_vp, lbl_vp, line_vb, lbl_vb, line_vr, lbl_vr,
            ratio_lbl, label_O2,
        )))
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: ValueTracker 扫温度 T：曲线「压扁+右移」
        # ══════════════════════════════════════════════════════════════════
        temp_tracker = ValueTracker(T0)  # 300 K → 900 K

        curve_T = always_redraw(lambda: axes.plot(
            lambda v: fv_norm(maxwell_f(v * V_SCALE, temp_tracker.get_value(), m_O2), m_O2),
            x_range=[0.01, 3.5, 0.02],
            color=YELLOW,
            stroke_width=3,
        ))

        # vp 随温度移动的竖线
        vline_T = always_redraw(lambda: DashedLine(
            axes.c2p(v_norm(vp_func(temp_tracker.get_value(), m_O2)), 0),
            axes.c2p(
                v_norm(vp_func(temp_tracker.get_value(), m_O2)),
                fv_norm(maxwell_f(vp_func(temp_tracker.get_value(), m_O2),
                                  temp_tracker.get_value(), m_O2), m_O2) + 0.05,
            ),
            color=GREEN,
            stroke_width=2,
        ))

        # 温度读数
        temp_disp = always_redraw(lambda: VGroup(
            Text("T = ", font=CJK, color=CYAN).scale(0.48),
            MathTex(rf"{temp_tracker.get_value():.0f}", r"\,\mathrm{{K}}", color=CYAN).scale(0.48),
        ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.5))

        t_caption = VGroup(
            Text("温度升高：峰值右移，曲线变低变宽，", font=CJK, color=CYAN).scale(0.42),
            Text("但曲线下总面积始终 = 1（归一化）", font=CJK, color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.15).to_edge(DOWN, buff=0.45)

        # 替换静态曲线为动态版
        self.play(ReplacementTransform(curve_O2, curve_T))
        self.add(vline_T, temp_disp)
        self.play(FadeIn(t_caption))
        self.wait(0.5)

        # 从 300K → 800K（升温）
        self.play(temp_tracker.animate.set_value(800), run_time=4, rate_func=smooth)
        self.wait(0.8)
        # 再降回 300K（降温）
        self.play(temp_tracker.animate.set_value(300), run_time=3, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(t_caption, vline_T, temp_disp)))
        self.remove(curve_T)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 固定温度 T0，扫分子质量 m：H2 vs O2
        # ══════════════════════════════════════════════════════════════════
        mass_tracker = ValueTracker(m_O2)  # O2 → H2

        curve_M = always_redraw(lambda: axes.plot(
            lambda v: fv_norm(maxwell_f(v * V_SCALE, T0, mass_tracker.get_value()), mass_tracker.get_value()),
            x_range=[0.01, 3.5, 0.02],
            color=ORANGE,
            stroke_width=3,
        ))

        # 右上角显示当前"相对分子质量"
        def mass_label():
            m = mass_tracker.get_value()
            ratio = m / m_H2  # relative to H2 mass unit
            name = "H2" if ratio < 4 else ("O2" if ratio > 12 else "...")
            return VGroup(
                Text("分子：", font=CJK, color=ORANGE).scale(0.46),
                Text(name, font=CJK, color=YELLOW).scale(0.46),
            ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.5)

        mass_disp = always_redraw(mass_label)

        m_caption = VGroup(
            Text("质量越小（如 H2），峰位越靠右（速率更大），曲线更宽；", font=CJK, color=ORANGE).scale(0.4),
            Text("质量越大（如 O2），峰位靠左，曲线窄且高。", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(DOWN, buff=0.15).to_edge(DOWN, buff=0.45)

        self.add(curve_M, mass_disp)
        self.play(FadeIn(m_caption))
        self.wait(0.5)

        # 从 O2 扫到 H2
        self.play(mass_tracker.animate.set_value(m_H2), run_time=4, rate_func=smooth)
        self.wait(0.8)
        # 再扫回 O2
        self.play(mass_tracker.animate.set_value(m_O2), run_time=3, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(m_caption, mass_disp, curve_M)))
        self.play(FadeOut(VGroup(axes, x_lbl, y_lbl)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 三特征速率公式推导对比（并列展示）
        # ══════════════════════════════════════════════════════════════════
        derive_title = Text("三个特征速率", font=CJK, color=BLUE).scale(0.58)
        derive_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(derive_title))

        eq_vp = VGroup(
            Text("最概然速率", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"v_p=\sqrt{\dfrac{2kT}{m}}", color=GREEN).scale(0.72),
        ).arrange(DOWN, buff=0.2)

        eq_vb = VGroup(
            Text("平均速率", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\bar{v}=\sqrt{\dfrac{8kT}{\pi m}}", color=ORANGE).scale(0.72),
        ).arrange(DOWN, buff=0.2)

        eq_vr = VGroup(
            Text("方均根速率", font=CJK, color=RED).scale(0.44),
            MathTex(r"v_{\rm rms}=\sqrt{\dfrac{3kT}{m}}", color=RED).scale(0.72),
        ).arrange(DOWN, buff=0.2)

        three_v = VGroup(eq_vp, eq_vb, eq_vr).arrange(RIGHT, buff=0.9)
        three_v.next_to(derive_title, DOWN, buff=0.5)

        self.play(FadeIn(eq_vp))
        self.wait(0.6)
        self.play(FadeIn(eq_vb))
        self.wait(0.6)
        self.play(FadeIn(eq_vr))
        self.wait(1.0)

        # 共同点说明
        common = VGroup(
            Text("共同点：三者均正比于", font=CJK).scale(0.44),
            MathTex(r"\sqrt{T/m}", color=YELLOW).scale(0.6),
            Text("，温度升高或质量减小，速率增大", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        common.next_to(three_v, DOWN, buff=0.45)
        self.play(FadeIn(common))
        self.wait(1.8)

        self.play(FadeOut(VGroup(derive_title, three_v, common)))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.58)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            MathTex(r"f(v)=4\pi\!\left(\frac{m}{2\pi kT}\right)^{\!\!3/2}v^{2}e^{-mv^{2}/(2kT)}",
                    color=YELLOW).scale(0.62),
        )
        s2 = VGroup(
            MathTex(
                r"v_p=\sqrt{\tfrac{2kT}{m}},\quad "
                r"\bar{v}=\sqrt{\tfrac{8kT}{\pi m}},\quad "
                r"v_{\rm rms}=\sqrt{\tfrac{3kT}{m}}",
                color=GREEN,
            ).scale(0.62),
        )
        s3 = VGroup(
            Text("T 升高：曲线压平右移，面积恒为 1", font=CJK, color=CYAN).scale(0.44),
        )
        s4 = VGroup(
            Text("m 减小：峰位右移，曲线更宽", font=CJK, color=ORANGE).scale(0.44),
        )
        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.35)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.38, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3), FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Kp2MaxwellSpeedDistribution",
        "id": "phys-ch05-5.2-kp2-maxwell-speed-distribution",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "麦克斯韦速率分布律",
        "description": "Axes 绘制 f(v) 分布曲线，ValueTracker 扫动温度 T 和分子质量 m，展示三特征速率 vp/v_bar/v_rms 的物理含义与参数依赖关系。",
    },
]
