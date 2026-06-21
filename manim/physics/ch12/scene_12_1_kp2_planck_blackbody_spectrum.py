"""第 12.1 节 · 普朗克黑体辐射曲线与温度依赖（函数曲线类 + ValueTracker 扫动范式）。

可视化三阶段：
  1. 固定 T=5000 K，展示单条普朗克曲线与峰值标注；
  2. 叠加 3000 K / 7000 K 曲线进行对比；
  3. ValueTracker 连续扫 T=3000→7000 K，实时追踪 lambda_m·T=b 与 M=sigmaT^4。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数 ─────────────────────────────────────────────────────────────
H_CONST = 6.626e-34   # 普朗克常数 h  (J·s)
C_LIGHT  = 3.0e8      # 光速 c  (m/s)
K_BOLTZ  = 1.381e-23  # 玻尔兹曼常数 k  (J/K)
SIGMA    = 5.670e-8   # 斯特藩-玻尔兹曼常数 σ  (W/m²·K⁴)
B_WIEN   = 2.898e-3   # 维恩位移常数 b  (m·K)

# x 轴：波长范围 0.2–3.0 μm（单位：μm，内部计算换算 m）
LAM_MIN_UM = 0.25
LAM_MAX_UM = 3.0

def planck_um(lam_um: float, T: float) -> float:
    """普朗克单色辐出度 M_lambda，lam_um 单位 μm，T 单位 K。
    返回值已归一化：除以 T=5000K 时峰值，使坐标轴 y 范围在 0–1.4 左右。"""
    lam = lam_um * 1e-6  # 转为米
    if lam <= 0:
        return 0.0
    exp_arg = H_CONST * C_LIGHT / (lam * K_BOLTZ * T)
    if exp_arg > 700:
        return 0.0
    denom = math.exp(exp_arg) - 1.0
    if denom <= 0:
        return 0.0
    return 2.0 * math.pi * H_CONST * C_LIGHT**2 / (lam**5 * denom)

# 归一化参考值：T=5000K 的峰值
_REF_T = 5000.0
_REF_LAM_PEAK = B_WIEN / _REF_T  # 约 5.796e-7 m = 0.5796 μm
_M_PEAK_REF = planck_um(_REF_LAM_PEAK * 1e6, _REF_T)

def planck_norm(lam_um: float, T: float) -> float:
    """归一化普朗克曲线，y 值在 [0, ~1.4]（相对于 5000K 峰值）。"""
    raw = planck_um(lam_um, T)
    return raw / _M_PEAK_REF if _M_PEAK_REF > 0 else 0.0

def lam_peak_um(T: float) -> float:
    """维恩位移定律：峰值波长（μm）。"""
    return (B_WIEN / T) * 1e6  # μm

def color_for_T(T: float) -> str:
    """T 从 3000K→7000K 对应颜色：暖红→橙→黄→青白。"""
    t_norm = (T - 3000.0) / 4000.0  # 0→1
    t_norm = max(0.0, min(1.0, t_norm))
    if t_norm < 0.33:
        s = t_norm / 0.33
        r = int(255)
        g = int(80 + 120 * s)
        b = int(0 + 30 * s)
    elif t_norm < 0.66:
        s = (t_norm - 0.33) / 0.33
        r = int(255)
        g = int(200 + 55 * s)
        b = int(30 + 90 * s)
    else:
        s = (t_norm - 0.66) / 0.34
        r = int(255 - 55 * s)
        g = int(255)
        b = int(120 + 135 * s)
    return "#{:02X}{:02X}{:02X}".format(r, g, b)


class Ch12Kp2PlanckBlackbodySpectrum(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("普朗克黑体辐射曲线与温度依赖", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════
        a1 = Text("烧红的铁块会发出暗红色的光，", font=CJK).scale(0.48)
        a2 = Text("温度越高，颜色从红变橙变黄，甚至接近白色——", font=CJK).scale(0.48)
        a3 = Text("这正是「黑体辐射」：物体依温度向外辐射各种波长的光。", font=CJK).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 普朗克公式逐步出现
        # ═══════════════════════════════════════════════════════════════
        def_label = Text("普朗克单色辐出度公式", font=CJK, color=YELLOW).scale(0.46)
        def_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_label))
        self.wait(0.5)

        eq1 = MathTex(
            r"M_{\lambda}(T)",
            r"=",
            r"\frac{2\pi h c^2}{\lambda^5}",
            r"\cdot",
            r"\frac{1}{e^{hc/(\lambda kT)}-1}"
        ).scale(0.82)
        eq1.next_to(def_label, DOWN, buff=0.38)
        eq1[0].set_color(YELLOW)
        eq1[2].set_color(ORANGE)
        eq1[4].set_color(CYAN)
        self.play(Write(eq1[0]), Write(eq1[1]))
        self.wait(0.5)
        self.play(Write(eq1[2]))
        self.wait(0.5)
        self.play(Write(eq1[3]), Write(eq1[4]))
        self.wait(1.0)

        # 图例说明
        leg = VGroup(
            VGroup(Text("h", font=CJK, color=ORANGE).scale(0.4),
                   Text(" = 普朗克常数", font=CJK).scale(0.4)).arrange(RIGHT, buff=0.05),
            VGroup(Text("k", font=CJK, color=CYAN).scale(0.4),
                   Text(" = 玻尔兹曼常数", font=CJK).scale(0.4)).arrange(RIGHT, buff=0.05),
            VGroup(Text("c", font=CJK).scale(0.4),
                   Text(" = 光速", font=CJK).scale(0.4)).arrange(RIGHT, buff=0.05),
        ).arrange(RIGHT, buff=0.55).next_to(eq1, DOWN, buff=0.28)
        self.play(FadeIn(leg))
        self.wait(1.6)
        self.play(FadeOut(VGroup(def_label, eq1, leg)))

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 建立坐标系 + 单条曲线 T=5000K
        # ═══════════════════════════════════════════════════════════════
        axes = Axes(
            x_range=[0, 3.2, 0.5],
            y_range=[0, 1.55, 0.5],
            x_length=9.5,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 2},
        ).shift(DOWN * 0.8 + LEFT * 0.5)

        x_lbl = VGroup(
            MathTex(r"\lambda").scale(0.55),
            Text(" / μm", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.05).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)

        y_lbl = VGroup(
            MathTex(r"M_\lambda").scale(0.52),
            Text("(归一化)", font=CJK).scale(0.32),
        ).arrange(DOWN, buff=0.06).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        T5000_color = color_for_T(5000.0)
        curve5000 = axes.plot(
            lambda lam: planck_norm(lam, 5000.0),
            x_range=[LAM_MIN_UM, LAM_MAX_UM, 0.01],
            color=T5000_color,
            stroke_width=3,
        )
        label5000 = VGroup(
            Text("T = 5000 K", font=CJK).scale(0.4),
        )
        label5000.set_color(T5000_color)
        label5000.next_to(axes.c2p(1.4, planck_norm(1.4, 5000.0) + 0.12), UP, buff=0.05)

        step4_hint = Text("固定 T = 5000 K：单色辐出度随波长的分布", font=CJK, color=GREEN).scale(0.42)
        step4_hint.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(step4_hint))
        self.play(Create(curve5000), run_time=2)
        self.play(FadeIn(label5000))
        self.wait(1.0)

        # 标注峰值点
        lam_pk5000 = lam_peak_um(5000.0)  # ~0.580 μm
        pk_y5000 = planck_norm(lam_pk5000, 5000.0)
        pk_dot5000 = Dot(axes.c2p(lam_pk5000, pk_y5000), color=WHITE, radius=0.10)
        pk_line5000 = DashedLine(
            axes.c2p(lam_pk5000, 0),
            axes.c2p(lam_pk5000, pk_y5000),
            color=WHITE, stroke_width=2,
        )
        pk_tex5000 = VGroup(
            MathTex(r"\lambda_m").scale(0.46).set_color(WHITE),
            Text("= 0.58 μm", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.06)
        pk_tex5000.next_to(axes.c2p(lam_pk5000, 0), DOWN, buff=0.12)
        self.play(Create(pk_line5000), FadeIn(pk_dot5000))
        self.play(FadeIn(pk_tex5000))
        self.wait(1.5)
        self.play(FadeOut(step4_hint))

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 叠加 3000K 和 7000K 曲线
        # ═══════════════════════════════════════════════════════════════
        compare_hint = Text("叠加 3000 K 与 7000 K 曲线进行对比", font=CJK, color=GREEN).scale(0.42)
        compare_hint.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(compare_hint))

        T3000_color = color_for_T(3000.0)
        T7000_color = color_for_T(7000.0)

        curve3000 = axes.plot(
            lambda lam: planck_norm(lam, 3000.0),
            x_range=[LAM_MIN_UM, LAM_MAX_UM, 0.01],
            color=T3000_color, stroke_width=3,
        )
        curve7000 = axes.plot(
            lambda lam: planck_norm(lam, 7000.0),
            x_range=[LAM_MIN_UM, LAM_MAX_UM, 0.01],
            color=T7000_color, stroke_width=3,
        )

        lbl3000 = Text("3000 K", font=CJK).scale(0.38).set_color(T3000_color)
        lbl7000 = Text("7000 K", font=CJK).scale(0.38).set_color(T7000_color)
        lbl3000.next_to(axes.c2p(LAM_MAX_UM * 0.75, planck_norm(LAM_MAX_UM * 0.75, 3000.0)), RIGHT, buff=0.1)
        lbl7000.next_to(axes.c2p(0.7, planck_norm(0.7, 7000.0) + 0.08), UP, buff=0.05)

        self.play(Create(curve3000), run_time=1.5)
        self.play(FadeIn(lbl3000))
        self.play(Create(curve7000), run_time=1.5)
        self.play(FadeIn(lbl7000))
        self.wait(0.8)

        # 维恩位移：两条峰值虚线
        lam_pk3000 = lam_peak_um(3000.0)
        lam_pk7000 = lam_peak_um(7000.0)
        pk_line3000 = DashedLine(
            axes.c2p(lam_pk3000, 0),
            axes.c2p(lam_pk3000, planck_norm(lam_pk3000, 3000.0)),
            color=T3000_color, stroke_width=1.5,
        )
        pk_line7000 = DashedLine(
            axes.c2p(lam_pk7000, 0),
            axes.c2p(lam_pk7000, planck_norm(lam_pk7000, 7000.0)),
            color=T7000_color, stroke_width=1.5,
        )
        wien_note = Text("温度越高，峰值向短波（紫外）方向移动", font=CJK, color=YELLOW).scale(0.41)
        wien_note.next_to(compare_hint, UP, buff=0.12)
        self.play(Create(pk_line3000), Create(pk_line7000))
        self.play(FadeIn(wien_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(
            compare_hint, wien_note,
            curve3000, curve7000, lbl3000, lbl7000,
            pk_line3000, pk_line7000,
            pk_dot5000, pk_line5000, pk_tex5000, label5000,
        )))

        # ═══════════════════════════════════════════════════════════════
        # Step 6: ValueTracker 连续扫 T=3000→7000 K
        # ═══════════════════════════════════════════════════════════════
        T_tracker = ValueTracker(3000.0)

        # 动态曲线
        dyn_curve = always_redraw(lambda: axes.plot(
            lambda lam: planck_norm(lam, T_tracker.get_value()),
            x_range=[LAM_MIN_UM, LAM_MAX_UM, 0.012],
            color=color_for_T(T_tracker.get_value()),
            stroke_width=3,
        ))

        # 动态峰值竖线
        dyn_peak_line = always_redraw(lambda: DashedLine(
            axes.c2p(lam_peak_um(T_tracker.get_value()), 0),
            axes.c2p(
                lam_peak_um(T_tracker.get_value()),
                planck_norm(lam_peak_um(T_tracker.get_value()), T_tracker.get_value()),
            ),
            color=color_for_T(T_tracker.get_value()),
            stroke_width=2,
        ))

        # 动态峰值点
        dyn_peak_dot = always_redraw(lambda: Dot(
            axes.c2p(
                lam_peak_um(T_tracker.get_value()),
                planck_norm(lam_peak_um(T_tracker.get_value()), T_tracker.get_value()),
            ),
            color=WHITE, radius=0.09,
        ))

        # 右侧数值面板（静态框，内容动态更新）
        panel_bg = Rectangle(width=4.0, height=2.8, color=BLUE, fill_opacity=0.08,
                              stroke_width=1.5).to_edge(RIGHT, buff=0.15).shift(UP * 0.2)

        # 动态文字标签（用 always_redraw 更新数值）
        def make_T_label():
            T_val = T_tracker.get_value()
            return VGroup(
                Text("T = ", font=CJK, color=WHITE).scale(0.4),
                Text(f"{T_val:.0f} K", font=CJK, color=color_for_T(T_val)).scale(0.4),
            ).arrange(RIGHT, buff=0.05)

        def make_lam_label():
            T_val = T_tracker.get_value()
            lp = lam_peak_um(T_val)
            return VGroup(
                MathTex(r"\lambda_m =").scale(0.42).set_color(YELLOW),
                Text(f"{lp:.3f} μm", font=CJK, color=YELLOW).scale(0.38),
            ).arrange(RIGHT, buff=0.08)

        def make_prod_label():
            T_val = T_tracker.get_value()
            lp_m = B_WIEN / T_val  # m
            prod = lp_m * T_val    # = b
            return VGroup(
                MathTex(r"\lambda_m T =").scale(0.42).set_color(CYAN),
                Text(f"{prod:.4f} m·K", font=CJK, color=CYAN).scale(0.35),
            ).arrange(RIGHT, buff=0.06)

        def make_sigma_label():
            T_val = T_tracker.get_value()
            M_tot = SIGMA * T_val**4
            M_ref = SIGMA * 5000.0**4
            ratio = M_tot / M_ref
            return VGroup(
                MathTex(r"M/M_{5000} =").scale(0.40).set_color(GREEN),
                Text(f"{ratio:.2f}", font=CJK, color=GREEN).scale(0.4),
            ).arrange(RIGHT, buff=0.06)

        dyn_T_lbl = always_redraw(lambda: make_T_label().move_to(
            panel_bg.get_top() + DOWN * 0.45))
        dyn_lam_lbl = always_redraw(lambda: make_lam_label().move_to(
            panel_bg.get_top() + DOWN * 0.95))
        dyn_prod_lbl = always_redraw(lambda: make_prod_label().move_to(
            panel_bg.get_top() + DOWN * 1.45))
        dyn_sig_lbl = always_redraw(lambda: make_sigma_label().move_to(
            panel_bg.get_top() + DOWN * 1.95))

        scan_hint = Text("温度 T 从 3000 K 升至 7000 K，实时观察曲线变化", font=CJK, color=GREEN).scale(0.40)
        scan_hint.to_edge(DOWN, buff=0.3)

        self.add(dyn_curve, dyn_peak_line, dyn_peak_dot)
        self.play(
            FadeIn(panel_bg),
            FadeIn(dyn_T_lbl), FadeIn(dyn_lam_lbl),
            FadeIn(dyn_prod_lbl), FadeIn(dyn_sig_lbl),
            FadeIn(scan_hint),
        )
        self.wait(0.8)

        # 扫动 T：3000 → 7000 K
        self.play(
            T_tracker.animate.set_value(7000.0),
            run_time=7, rate_func=linear,
        )
        self.wait(1.2)

        # 再扫回 5000 K 作定格
        self.play(T_tracker.animate.set_value(5000.0), run_time=2, rate_func=smooth)
        self.wait(1.0)
        self.play(FadeOut(scan_hint))

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 维恩位移定律与 Stefan-Boltzmann 定律标注
        # ═══════════════════════════════════════════════════════════════
        law_hint = Text("两大定律从曲线直接读出", font=CJK, color=YELLOW).scale(0.42)
        law_hint.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(law_hint))
        self.wait(0.6)

        wien_eq = MathTex(r"\lambda_m T = b,\quad b=2.898\times10^{-3}\,\mathrm{m\cdot K}").scale(0.58)
        wien_eq.set_color(YELLOW)

        sb_eq = MathTex(r"M(T)=\sigma T^4,\quad \sigma=5.67\times10^{-8}\,\mathrm{W\,m^{-2}\,K^{-4}}").scale(0.58)
        sb_eq.set_color(GREEN)

        laws = VGroup(wien_eq, sb_eq).arrange(DOWN, buff=0.35)
        laws.next_to(title, DOWN, buff=0.48)
        laws_box = SurroundingRectangle(laws, color=BLUE, buff=0.25, corner_radius=0.12)

        # 淡出坐标系旁的动态面板，留出位置
        self.play(FadeOut(VGroup(panel_bg, dyn_T_lbl, dyn_lam_lbl, dyn_prod_lbl, dyn_sig_lbl)))
        self.play(Write(wien_eq))
        self.wait(0.8)
        self.play(Write(sb_eq))
        self.play(Create(laws_box))
        self.wait(1.6)

        wien_note2 = Text("维恩定律：峰值波长与温度成反比，T 越高颜色越蓝", font=CJK, color=YELLOW).scale(0.40)
        sb_note2   = Text("Stefan-Boltzmann：总辐射功率与 T^4 成正比，T 翻倍则功率增 16 倍", font=CJK, color=GREEN).scale(0.38)
        notes2 = VGroup(wien_note2, sb_note2).arrange(DOWN, buff=0.22)
        notes2.next_to(laws_box, DOWN, buff=0.3)
        self.play(FadeIn(wien_note2))
        self.wait(0.6)
        self.play(FadeIn(sb_note2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(laws, laws_box, notes2, law_hint,
                                 dyn_curve, dyn_peak_line, dyn_peak_dot,
                                 axes, x_lbl, y_lbl, curve5000)))

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ═══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.48)
        s1 = MathTex(
            r"M_{\lambda}(T)=\frac{2\pi hc^2}{\lambda^5}\cdot\frac{1}{e^{hc/\lambda kT}-1}",
            color=YELLOW,
        ).scale(0.68)
        s2 = MathTex(r"\lambda_m T = b = 2.898\times10^{-3}\,\mathrm{m\cdot K}", color=CYAN).scale(0.68)
        s3 = MathTex(r"M(T)=\sigma T^4", color=GREEN).scale(0.68)
        note_s1 = Text("普朗克量子假设推导出与实验完全吻合的黑体辐射公式", font=CJK, color=WHITE).scale(0.40)
        note_s2 = Text("温度升高：峰值蓝移 + 总辐射按 T^4 急增", font=CJK, color=WHITE).scale(0.40)

        s_group = VGroup(s1, s2, s3, note_s1, note_s2).arrange(DOWN, buff=0.32)
        s_group.next_to(s_title, DOWN, buff=0.4)
        s_group.scale_to_fit_width(12.5)
        s_box = SurroundingRectangle(s_group, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2), Write(s3))
        self.wait(0.5)
        self.play(FadeIn(note_s1), FadeIn(note_s2))
        self.play(Create(s_box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(title, s_title, s_group, s_box)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp2PlanckBlackbodySpectrum",
        "id": "phys-ch12-12.1-kp2-planck-blackbody-spectrum",
        "chapterId": "ch12",
        "sectionId": "12.1",
        "title": "普朗克黑体辐射曲线与温度依赖",
        "description": "三阶段演示普朗克曲线：单曲线峰值标注、三温对比、ValueTracker 动态扫温，直觉验证维恩位移定律与 Stefan-Boltzmann 定律。",
    },
]
