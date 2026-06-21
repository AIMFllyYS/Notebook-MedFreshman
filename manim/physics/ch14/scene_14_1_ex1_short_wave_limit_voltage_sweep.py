"""第 14.1 节 · 例题精讲：短波极限随管电压的变化

可视化方案：
  左半屏逐步展示数值解题过程（λ_min = 1.242/U nm，ν_max = c/λ_min），
  右半屏绘制 λ_min-U 双曲线，ValueTracker 从 30 kV 扫到 150 kV，
  红点沿曲线运动并投影到坐标轴，50 kV 处标出题目答案。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常数
C_LIGHT = 3.0e8          # m/s
PLANCK_EV = 1.242e3      # eV·nm → λ_min(nm) = 1242/U(V) = 1.242/U(kV)


def lam_min_nm(u_kv: float) -> float:
    """短波极限 λ_min (nm), u_kv 单位 kV"""
    return 1.242 / u_kv


def nu_max_hz(u_kv: float) -> float:
    """最高频率 ν_max (×10^18 Hz), u_kv 单位 kV"""
    lam_m = lam_min_nm(u_kv) * 1e-9
    return C_LIGHT / lam_m


class Ch14Ex1ShortWaveLimitVoltageSweep(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("短波极限随管电压的变化", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP)
        subtitle = VGroup(
            Text("第14章 X射线与激光", font=CJK, color=WHITE).scale(0.38),
            Text("· 例题精讲 14.1", font=CJK, color=WHITE).scale(0.38),
        ).arrange(RIGHT, buff=0.2)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比 / 物理背景
        # ══════════════════════════════════════════════════════════════════
        bg1 = Text("X射线管：高速电子轰击金属靶，急速减速时", font=CJK).scale(0.45)
        bg2 = Text("动能转为光子能量，产生连续X射线谱。", font=CJK).scale(0.45)
        bg3 = Text("管电压越高，电子动能越大，能产生的光子能量上限越高，", font=CJK).scale(0.43)
        bg4 = Text("对应最短波长（短波极限）越短，X射线穿透力越强。", font=CJK, color=YELLOW).scale(0.43)
        bg = VGroup(bg1, bg2, bg3, bg4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        bg.next_to(title, DOWN, buff=0.5)
        bg.scale_to_fit_width(12)
        self.play(FadeIn(bg1))
        self.wait(0.6)
        self.play(FadeIn(bg2))
        self.wait(0.6)
        self.play(FadeIn(bg3))
        self.wait(0.6)
        self.play(FadeIn(bg4))
        self.wait(1.8)
        self.play(FadeOut(bg))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 核心公式推导（逐步）
        # ══════════════════════════════════════════════════════════════════
        deriv_label = Text("公式推导", font=CJK, color=BLUE).scale(0.5)
        deriv_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_label))

        # 能量守恒
        eq0 = MathTex(r"eU = h\nu_{\max} = \frac{hc}{\lambda_{\min}}", color=WHITE).scale(0.8)
        eq0.next_to(deriv_label, DOWN, buff=0.4)
        eq0_zh = Text("电子动能 = 最高频率光子能量", font=CJK, color=WHITE).scale(0.4)
        eq0_zh.next_to(eq0, DOWN, buff=0.2)
        self.play(Write(eq0))
        self.play(FadeIn(eq0_zh))
        self.wait(1.5)

        # 解出 λ_min
        eq1 = MathTex(
            r"\lambda_{\min}", r"=", r"\frac{hc}{eU}",
            r"=", r"\frac{1.242\,\mathrm{nm \cdot kV}}{U(\mathrm{kV})}",
            color=YELLOW
        ).scale(0.78)
        eq1.next_to(eq0_zh, DOWN, buff=0.35)
        eq1[0].set_color(CYAN)
        eq1[2].set_color(YELLOW)
        eq1[4].set_color(GREEN)
        self.play(Write(eq1))
        self.wait(1.5)

        # ν_max
        eq2 = MathTex(
            r"\nu_{\max}", r"=", r"\frac{c}{\lambda_{\min}}", color=ORANGE
        ).scale(0.78)
        eq2.next_to(eq1, DOWN, buff=0.3)
        self.play(Write(eq2))
        self.wait(1.2)
        self.play(FadeOut(VGroup(deriv_label, eq0, eq0_zh, eq1, eq2)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 数值解题（左半屏）+ 曲线图（右半屏）
        # ══════════════════════════════════════════════════════════════════
        # ── 左半屏：数值计算逐步出现 ──────────────────────────────────────
        left_title = Text("数值计算 (U = 50 kV)", font=CJK, color=BLUE).scale(0.46)
        left_title.to_edge(LEFT, buff=0.35).next_to(title, DOWN, buff=0.5)

        # 各步公式
        calc_step1 = VGroup(
            Text("代入 U = 50 kV：", font=CJK, color=WHITE).scale(0.4),
        )
        calc_eq1 = MathTex(
            r"\lambda_{\min} = \frac{1.242}{50} = 0.02484\,\mathrm{nm}",
            color=YELLOW
        ).scale(0.62)

        calc_step2 = VGroup(
            Text("换算最高频率：", font=CJK, color=WHITE).scale(0.4),
        )
        calc_eq2 = MathTex(
            r"\nu_{\max} = \frac{c}{\lambda_{\min}} = \frac{3\times10^8}{0.02484\times10^{-9}}",
            color=ORANGE
        ).scale(0.55)
        calc_eq3 = MathTex(
            r"\approx 1.208\times10^{19}\,\mathrm{Hz}",
            color=GREEN
        ).scale(0.65)

        left_group = VGroup(
            left_title,
            calc_step1,
            calc_eq1,
            calc_step2,
            calc_eq2,
            calc_eq3,
        ).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        left_group.to_edge(LEFT, buff=0.35)
        left_group.shift(DOWN * 0.3)
        left_group.scale_to_fit_width(5.6)

        # 分隔线
        sep_line = DashedLine(
            start=UP * 3.2,
            end=DOWN * 3.2,
            color=GRAY,
            stroke_width=1.5
        ).move_to(ORIGIN)

        # ── 右半屏：λ_min-U 双曲线 ────────────────────────────────────────
        U_MIN, U_MAX = 30, 150
        LAM_MIN_PLOT, LAM_MAX_PLOT = 0.005, 0.05  # nm

        axes = Axes(
            x_range=[U_MIN, U_MAX, 30],
            y_range=[LAM_MIN_PLOT, LAM_MAX_PLOT, 0.01],
            x_length=6.0,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).to_edge(RIGHT, buff=0.45).shift(DOWN * 0.5)

        # 手动添加 x 轴标签（kV 刻度）
        x_label = MathTex(r"U\,(\mathrm{kV})", color=BLUE).scale(0.5)
        x_label.next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_label = MathTex(r"\lambda_{\min}\,(\mathrm{nm})", color=BLUE).scale(0.5)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        # x 轴数字刻度
        x_ticks_vals = [30, 50, 90, 120, 150]
        x_tick_labels = VGroup()
        for v in x_ticks_vals:
            lbl = MathTex(str(v), color=BLUE).scale(0.4)
            lbl.next_to(axes.c2p(v, LAM_MIN_PLOT), DOWN, buff=0.15)
            x_tick_labels.add(lbl)

        y_ticks_vals = [0.01, 0.02, 0.03, 0.04]
        y_tick_labels = VGroup()
        for v in y_ticks_vals:
            lbl = MathTex(f"{v:.2f}", color=BLUE).scale(0.4)
            lbl.next_to(axes.c2p(U_MIN, v), LEFT, buff=0.15)
            y_tick_labels.add(lbl)

        # 绘制双曲线
        curve = axes.plot(
            lambda u: lam_min_nm(u),
            x_range=[U_MIN, U_MAX],
            color=YELLOW,
            stroke_width=3,
        )

        right_title = Text("短波极限与管电压关系曲线", font=CJK, color=BLUE).scale(0.42)
        right_title.next_to(axes, UP, buff=0.2)

        # ValueTracker：扫动管电压
        u_tracker = ValueTracker(U_MIN)

        # 红色点沿曲线移动
        red_dot = always_redraw(
            lambda: Dot(
                axes.c2p(u_tracker.get_value(), lam_min_nm(u_tracker.get_value())),
                color=RED,
                radius=0.10,
            )
        )

        # x 轴投影（竖向虚线）
        proj_v = always_redraw(
            lambda: DashedLine(
                start=axes.c2p(u_tracker.get_value(), LAM_MIN_PLOT),
                end=axes.c2p(u_tracker.get_value(), lam_min_nm(u_tracker.get_value())),
                color=CYAN,
                stroke_width=1.5,
            )
        )

        # y 轴投影（横向虚线）
        proj_h = always_redraw(
            lambda: DashedLine(
                start=axes.c2p(U_MIN, lam_min_nm(u_tracker.get_value())),
                end=axes.c2p(u_tracker.get_value(), lam_min_nm(u_tracker.get_value())),
                color=CYAN,
                stroke_width=1.5,
            )
        )

        # 数值标注（x 轴下方）
        u_readout_label = always_redraw(
            lambda: MathTex(
                rf"U={u_tracker.get_value():.0f}",
                color=RED,
            ).scale(0.45).next_to(
                axes.c2p(u_tracker.get_value(), LAM_MIN_PLOT), DOWN, buff=0.25
            )
        )

        # 数值标注（y 轴左侧）
        lam_readout_label = always_redraw(
            lambda: MathTex(
                rf"\lambda={lam_min_nm(u_tracker.get_value()):.4f}",
                color=RED,
            ).scale(0.42).next_to(
                axes.c2p(U_MIN, lam_min_nm(u_tracker.get_value())), LEFT, buff=0.15
            )
        )

        # ── 呈现左右两栏布局 ──────────────────────────────────────────────
        self.play(Create(sep_line))
        self.play(FadeIn(left_title))
        self.wait(0.4)

        # 右侧坐标系和曲线
        self.play(
            Create(axes),
            FadeIn(x_label),
            FadeIn(y_label),
            FadeIn(x_tick_labels),
            FadeIn(y_tick_labels),
            FadeIn(right_title),
        )
        self.play(Create(curve), run_time=1.5)
        self.wait(0.5)

        # 红点与投影线出现
        self.add(red_dot, proj_v, proj_h, u_readout_label, lam_readout_label)
        self.wait(0.5)

        # 左侧逐步出现数值计算
        self.play(FadeIn(calc_step1))
        self.wait(0.5)
        self.play(Write(calc_eq1))
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker 扫动（30 → 150 kV）
        # ══════════════════════════════════════════════════════════════════
        self.play(u_tracker.animate.set_value(U_MAX), run_time=4.5, rate_func=linear)
        self.wait(0.5)
        # 扫回到 50 kV，对应例题
        self.play(u_tracker.animate.set_value(50), run_time=2.0, rate_func=smooth)
        self.wait(0.8)

        # 左侧继续出现频率计算
        self.play(FadeIn(calc_step2))
        self.wait(0.3)
        self.play(Write(calc_eq2))
        self.wait(0.5)
        self.play(Write(calc_eq3))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 50 kV 答案标注（竖线 + 注释）
        # ══════════════════════════════════════════════════════════════════
        u50 = 50
        lam50 = lam_min_nm(u50)

        # 竖线标注答案
        ans_vline = DashedLine(
            start=axes.c2p(u50, LAM_MIN_PLOT),
            end=axes.c2p(u50, lam50),
            color=GREEN,
            stroke_width=2.5,
        )
        ans_dot = Dot(axes.c2p(u50, lam50), color=GREEN, radius=0.12)

        ans_lbl = MathTex(r"50\,\mathrm{kV}", color=GREEN).scale(0.45)
        ans_lbl.next_to(axes.c2p(u50, LAM_MIN_PLOT), DOWN, buff=0.28)

        ans_lam_lbl = MathTex(r"0.0248\,\mathrm{nm}", color=GREEN).scale(0.45)
        ans_lam_lbl.next_to(axes.c2p(U_MIN, lam50), LEFT, buff=0.1)

        self.play(Create(ans_vline), Create(ans_dot))
        self.play(FadeIn(ans_lbl), FadeIn(ans_lam_lbl))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 闪烁高亮结果数值
        # ══════════════════════════════════════════════════════════════════
        # 框住左侧结果
        result_box = SurroundingRectangle(
            VGroup(calc_eq1, calc_eq3), color=GREEN, buff=0.18, corner_radius=0.12
        )
        self.play(Create(result_box))
        # 闪烁三次
        for _ in range(3):
            self.play(result_box.animate.set_color(YELLOW), run_time=0.25)
            self.play(result_box.animate.set_color(GREEN), run_time=0.25)
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 物理规律注释
        # ══════════════════════════════════════════════════════════════════
        insight1 = Text("管电压越高，短波极限越短", font=CJK, color=YELLOW).scale(0.44)
        insight2 = Text("X射线光子能量越大，穿透力越强（硬X射线）", font=CJK, color=YELLOW).scale(0.44)
        insight3 = Text("双曲线关系：  ", font=CJK, color=WHITE).scale(0.42)
        insight3_eq = MathTex(r"\lambda_{\min} \propto \frac{1}{U}", color=CYAN).scale(0.55)
        insight3_grp = VGroup(insight3, insight3_eq).arrange(RIGHT, buff=0.1)

        insights = VGroup(insight1, insight2, insight3_grp).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        insights.next_to(axes, DOWN, buff=0.28)
        insights.scale_to_fit_width(6.2)
        insights.to_edge(RIGHT, buff=0.4)

        self.play(FadeIn(insight1))
        self.wait(0.6)
        self.play(FadeIn(insight2))
        self.wait(0.6)
        self.play(FadeIn(insight3_grp))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 清场 → 小结卡
        # ══════════════════════════════════════════════════════════════════
        to_fadeout = VGroup(
            sep_line,
            left_group, result_box,
            axes, x_label, y_label,
            x_tick_labels, y_tick_labels,
            curve, right_title,
            ans_vline, ans_dot, ans_lbl, ans_lam_lbl,
            insights,
        )
        # remove always_redraw objects
        self.remove(red_dot, proj_v, proj_h, u_readout_label, lam_readout_label)
        self.play(FadeOut(to_fadeout))
        self.wait(0.4)

        # ── 小结卡 ──────────────────────────────────────────────────────
        s_title = Text("本例小结", font=CJK, color=BLUE).scale(0.58)
        s_title.next_to(title, DOWN, buff=0.5)

        s1_zh = Text("短波极限公式：", font=CJK, color=WHITE).scale(0.45)
        s1_eq = MathTex(
            r"\lambda_{\min}(\mathrm{nm}) = \frac{1.242}{U(\mathrm{kV})}",
            color=YELLOW
        ).scale(0.75)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.2)

        s2_zh = Text("最高频率：", font=CJK, color=WHITE).scale(0.45)
        s2_eq = MathTex(
            r"\nu_{\max} = \frac{c}{\lambda_{\min}}",
            color=ORANGE
        ).scale(0.75)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.2)

        s3_num = MathTex(
            r"U=50\,\mathrm{kV}\Rightarrow\lambda_{\min}=0.0248\,\mathrm{nm},\;"
            r"\nu_{\max}\approx1.21\times10^{19}\,\mathrm{Hz}",
            color=GREEN
        ).scale(0.62)

        s4 = Text("管电压越高 → 短波极限越短 → X射线越硬", font=CJK, color=CYAN).scale(0.45)

        summary_group = VGroup(s1, s2, s3_num, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary_group.next_to(s_title, DOWN, buff=0.4)
        summary_group.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3_num))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Ex1ShortWaveLimitVoltageSweep",
        "id": "phys-ch14-14.1-ex1-short-wave-limit-voltage-sweep",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "短波极限随管电压的变化",
        "description": "从能量守恒推导短波极限公式，以 50 kV 为例逐步数值计算，ValueTracker 扫动 λ_min-U 双曲线展示管电压与短波极限的反比关系。",
    },
]
