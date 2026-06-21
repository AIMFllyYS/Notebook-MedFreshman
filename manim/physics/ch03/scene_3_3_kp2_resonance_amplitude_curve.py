"""第 3.3 节 · 受迫振动与共振曲线

物理动画范式：Axes.plot 绘制振幅-频率曲线 A(Omega)，
三条典型阻尼曲线蓝/橙/绿叠加，ValueTracker 演示驱动频率
扫动时振幅的实时变化，以及共振频率的标注与 Q 值的直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；
中文一律 Text(font=CJK)；顶部定义 CYAN 与 CJK。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理参数
OMEGA0 = 2.0          # 固有角频率（归一化基准）
F0_OVER_M = 3.0       # F0/m 的值

# 三条典型曲线的阻尼系数与颜色
BETAS = [0.1 * OMEGA0, 0.3 * OMEGA0, 0.7 * OMEGA0]
COLORS_CURVE = [BLUE, ORANGE, GREEN]
BETA_LABELS = [
    r"\beta = 0.1\omega_0",
    r"\beta = 0.3\omega_0",
    r"\beta = 0.7\omega_0",
]
BETA_ZH = ["弱阻尼", "中阻尼", "强阻尼"]


def amplitude(Omega, beta, omega0=OMEGA0, f0m=F0_OVER_M):
    """受迫振动稳态振幅公式 A(Omega)"""
    denom = math.sqrt((omega0**2 - Omega**2)**2 + (2 * beta * Omega)**2)
    return f0m / denom if denom > 1e-9 else 1e6


def resonance_omega(beta, omega0=OMEGA0):
    """共振频率 Omega_res = sqrt(omega0^2 - 2*beta^2)，弱阻尼近似"""
    val = omega0**2 - 2 * beta**2
    return math.sqrt(max(val, 0.0))


class Ch03Kp2ResonanceAmplitudeCurve(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("受迫振动与共振曲线", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.3", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("推秋千时，每次推的频率若与秋千固有频率一致，", font=CJK).scale(0.46)
        ana2 = Text("振幅就会越来越大——这就是「共振」。", font=CJK, color=YELLOW).scale(0.46)
        ana3 = Text("反之，阻尼越大，共振峰越低越宽。", font=CJK, color=CYAN).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 振幅公式（逐步展示）────────────────────────────────
        eq_label = Text("稳态受迫振动振幅：", font=CJK, color=WHITE).scale(0.46)
        eq_formula = MathTex(
            r"A(\Omega) = \frac{F_0/m}{\sqrt{(\omega_0^2 - \Omega^2)^2 + (2\beta\Omega)^2}}"
        ).scale(0.75)
        eq_row = VGroup(eq_label, eq_formula).arrange(RIGHT, buff=0.25)
        eq_row.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(eq_label))
        self.play(Write(eq_formula))
        self.wait(1.0)

        # 分项说明
        note1 = VGroup(
            Text("分母最小", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"\Rightarrow").scale(0.5),
            Text("振幅最大", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(RIGHT, buff=0.18)
        note2 = VGroup(
            Text("共振频率：", font=CJK).scale(0.38),
            MathTex(r"\Omega_{\text{res}} \approx \omega_0 \text{ (small }\beta\text{)}",
                    ).scale(0.58),
        ).arrange(RIGHT, buff=0.18)
        # Note: 上面的 MathTex 里有 \text{...英文} 是合法的
        notes = VGroup(note1, note2).arrange(RIGHT, buff=0.8)
        notes.next_to(eq_row, DOWN, buff=0.3)
        self.play(FadeIn(note1))
        self.wait(0.5)
        self.play(FadeIn(note2))
        self.wait(1.2)
        self.play(FadeOut(VGroup(note1, note2)))

        # ── Step 4: 建立坐标系 ──────────────────────────────────────────
        self.play(FadeOut(eq_row))
        self.wait(0.3)

        # Omega 从 0 到 3.5 * OMEGA0，A 从 0 到 ~20
        ax = Axes(
            x_range=[0, 3.5 * OMEGA0, OMEGA0],
            y_range=[0, 18, 3],
            x_length=9.5,
            y_length=4.2,
            axis_config={"color": BLUE_B, "include_tip": True, "stroke_width": 2},
        ).shift(DOWN * 0.9)

        x_lbl = VGroup(
            MathTex(r"\Omega").scale(0.6),
            Text("（驱动频率）", font=CJK).scale(0.34),
        ).arrange(RIGHT, buff=0.1)
        x_lbl.next_to(ax.x_axis.get_end(), DOWN, buff=0.18)

        y_lbl = VGroup(
            MathTex(r"A").scale(0.6),
            Text("（振幅）", font=CJK).scale(0.34),
        ).arrange(RIGHT, buff=0.1)
        y_lbl.next_to(ax.y_axis.get_end(), LEFT, buff=0.12)

        # omega0 竖线参考
        omega0_line = DashedLine(
            ax.c2p(OMEGA0, 0), ax.c2p(OMEGA0, 17.5),
            color=WHITE, stroke_width=1.5, dash_length=0.12,
        )
        omega0_label = MathTex(r"\omega_0").scale(0.52).set_color(WHITE)
        omega0_label.next_to(ax.c2p(OMEGA0, 0), DOWN, buff=0.18)

        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(omega0_line), FadeIn(omega0_label))
        self.wait(0.8)

        # ── Step 5: 三条共振曲线逐一出现 ────────────────────────────────
        x_plot_range = [0.05, 3.45 * OMEGA0, 0.01]

        curves = []
        for beta, col in zip(BETAS, COLORS_CURVE):
            c = ax.plot(
                lambda Omega, b=beta: min(amplitude(Omega, b), 17.5),
                x_range=x_plot_range,
                color=col,
                stroke_width=2.5,
            )
            curves.append(c)

        # 图例
        legend_items = []
        for i, (col, bl, bzh) in enumerate(zip(COLORS_CURVE, BETA_LABELS, BETA_ZH)):
            dot = Dot(color=col, radius=0.07)
            lbl_tex = MathTex(bl, color=col).scale(0.42)
            lbl_zh = Text(bzh, font=CJK, color=col).scale(0.36)
            item = VGroup(dot, lbl_tex, lbl_zh).arrange(RIGHT, buff=0.15)
            legend_items.append(item)
        legend = VGroup(*legend_items).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        legend.to_corner(UR, buff=0.55)

        self.play(Create(curves[0]), FadeIn(legend_items[0]), run_time=1.2)
        self.wait(0.4)
        self.play(Create(curves[1]), FadeIn(legend_items[1]), run_time=1.2)
        self.wait(0.4)
        self.play(Create(curves[2]), FadeIn(legend_items[2]), run_time=1.2)
        self.wait(1.0)

        # ── Step 6: 标注共振峰（β最小曲线）────────────────────────────
        beta_min = BETAS[0]
        Omega_res = resonance_omega(beta_min)
        A_peak = min(amplitude(Omega_res, beta_min), 17.5)

        peak_dot = Dot(ax.c2p(Omega_res, A_peak), color=YELLOW, radius=0.10)
        peak_vline = DashedLine(
            ax.c2p(Omega_res, 0), ax.c2p(Omega_res, A_peak),
            color=YELLOW, stroke_width=2, dash_length=0.12,
        )
        res_label = MathTex(r"\Omega_{\text{res}}", color=YELLOW).scale(0.52)
        res_label.next_to(ax.c2p(Omega_res, 0), DOWN, buff=0.18)

        # Brace 标注峰值
        brace_line_start = ax.c2p(Omega_res + 0.05, 0)
        brace_line_end = ax.c2p(Omega_res + 0.05, A_peak)
        brace = Brace(
            Line(brace_line_start, brace_line_end),
            direction=RIGHT, color=YELLOW,
        )
        brace_tip_label = MathTex(r"A_{\max}", color=YELLOW).scale(0.52)
        brace.put_at_tip(brace_tip_label)

        q_text = Text("阻尼越小，峰越高越窄（Q 值越大）", font=CJK, color=YELLOW).scale(0.40)
        q_text.next_to(title, DOWN, buff=0.55)

        self.play(Create(peak_vline), FadeIn(peak_dot), FadeIn(res_label))
        self.play(Create(brace), FadeIn(brace_tip_label))
        self.play(FadeIn(q_text))
        self.wait(1.8)

        # Q 值公式
        q_formula = MathTex(r"Q = \frac{\omega_0}{2\beta}", color=YELLOW).scale(0.72)
        q_formula.next_to(q_text, DOWN, buff=0.25)
        self.play(Write(q_formula))
        self.wait(1.5)
        self.play(FadeOut(VGroup(q_text, q_formula, brace, brace_tip_label, peak_dot)))

        # ── Step 7: 可拖动频率指示器（ValueTracker + always_redraw）────
        freq_tracker = ValueTracker(0.5 * OMEGA0)

        # 垂直指示线（实时更新）
        freq_indicator = always_redraw(
            lambda: DashedLine(
                ax.c2p(freq_tracker.get_value(), 0),
                ax.c2p(freq_tracker.get_value(), 17.6),
                color=RED, stroke_width=2.5, dash_length=0.15,
            )
        )
        freq_dot_label = always_redraw(
            lambda: MathTex(r"\Omega", color=RED).scale(0.52).next_to(
                ax.c2p(freq_tracker.get_value(), 0), DOWN, buff=0.18
            )
        )

        # 右侧实时振幅数值显示
        def make_amp_display():
            Omega_val = freq_tracker.get_value()
            lines = []
            for beta, col in zip(BETAS, COLORS_CURVE):
                A_val = min(amplitude(Omega_val, beta), 17.5)
                label = MathTex(
                    rf"A = {A_val:.2f}", color=col
                ).scale(0.48)
                lines.append(label)
            grp = VGroup(*lines).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
            grp.to_edge(RIGHT, buff=0.28).shift(DOWN * 1.5)
            return grp

        amp_display = always_redraw(make_amp_display)

        amp_title = Text("各曲线振幅", font=CJK, color=WHITE).scale(0.38)
        amp_title.to_edge(RIGHT, buff=0.38).shift(DOWN * 0.7)

        # 清除共振线（让视野干净），加入频率指示器
        self.play(FadeOut(peak_vline), FadeOut(res_label))
        self.play(Create(freq_indicator), FadeIn(freq_dot_label), FadeIn(amp_title))
        self.add(amp_display)
        self.wait(0.5)

        # 从低频扫向共振频率附近再到高频
        self.play(
            freq_tracker.animate.set_value(OMEGA0 * 0.95),
            run_time=3.0, rate_func=smooth,
        )
        self.wait(0.8)
        self.play(
            freq_tracker.animate.set_value(2.2 * OMEGA0),
            run_time=3.0, rate_func=smooth,
        )
        self.wait(0.8)
        self.play(
            freq_tracker.animate.set_value(OMEGA0),
            run_time=1.5, rate_func=smooth,
        )
        self.wait(1.2)

        # 清场：移除频率指示器与振幅显示
        self.play(
            FadeOut(VGroup(freq_indicator, freq_dot_label, amp_title)),
        )
        self.remove(amp_display)
        self.wait(0.3)

        # ── Step 8: 实例图示（塔科马大桥 + 乐器共鸣箱）──────────────────
        # 清场坐标系
        self.play(
            FadeOut(VGroup(
                ax, x_lbl, y_lbl, omega0_line, omega0_label,
                curves[0], curves[1], curves[2],
                legend,
            ))
        )
        self.wait(0.3)

        ex_title = Text("共振：危害与应用", font=CJK, color=BLUE).scale(0.56)
        ex_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ex_title))

        # 左：危害
        danger_box_title = Text("危害：塔科马海峡大桥（1940）", font=CJK, color=RED).scale(0.44)

        danger_lines = [
            Text("风的涡激频率 = 桥梁固有频率", font=CJK).scale(0.38),
            Text("共振导致振幅持续增大", font=CJK, color=RED).scale(0.38),
            Text("大桥最终倒塌", font=CJK, color=RED).scale(0.38),
        ]
        danger_group = VGroup(danger_box_title, *danger_lines).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        danger_rect = SurroundingRectangle(danger_group, color=RED, buff=0.22, corner_radius=0.1)
        danger_total = VGroup(danger_group, danger_rect)

        # 右：应用
        use_box_title = Text("应用：乐器共鸣箱", font=CJK, color=GREEN).scale(0.44)
        use_lines = [
            Text("琴弦振动频率 = 箱体固有频率", font=CJK).scale(0.38),
            Text("共鸣箱放大特定频率振幅", font=CJK, color=GREEN).scale(0.38),
            Text("音色丰富、音量增大", font=CJK, color=GREEN).scale(0.38),
        ]
        use_group = VGroup(use_box_title, *use_lines).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        use_rect = SurroundingRectangle(use_group, color=GREEN, buff=0.22, corner_radius=0.1)
        use_total = VGroup(use_group, use_rect)

        examples = VGroup(danger_total, use_total).arrange(RIGHT, buff=0.9)
        examples.next_to(ex_title, DOWN, buff=0.55)
        examples.scale_to_fit_width(12.5)

        self.play(FadeIn(danger_total))
        self.wait(0.7)
        self.play(FadeIn(use_total))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, examples)))

        # ── Step 9: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56)
        s_title.next_to(title, DOWN, buff=0.5)

        s1 = MathTex(
            r"A(\Omega) = \frac{F_0/m}{\sqrt{(\omega_0^2 - \Omega^2)^2 + (2\beta\Omega)^2}}",
            color=YELLOW,
        ).scale(0.7)

        s2_label = Text("共振频率：", font=CJK).scale(0.40)
        s2_formula = MathTex(r"\Omega_{\text{res}} \approx \omega_0", color=CYAN).scale(0.68)
        s2 = VGroup(s2_label, s2_formula).arrange(RIGHT, buff=0.15)

        s3_label = Text("品质因数：", font=CJK).scale(0.40)
        s3_formula = MathTex(r"Q = \frac{\omega_0}{2\beta}", color=CYAN).scale(0.68)
        s3 = VGroup(s3_label, s3_formula).arrange(RIGHT, buff=0.15)

        s4 = Text("阻尼越小 → 共振峰越尖锐（Q 越大）", font=CJK, color=GREEN).scale(0.42)
        s5 = Text("共振既可利用（乐器），也需防范（桥梁）", font=CJK, color=GREEN).scale(0.42)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(FadeIn(s2))
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), FadeIn(s5))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch03Kp2ResonanceAmplitudeCurve",
        "id": "phys-ch03-3.3-kp2-resonance-amplitude-curve",
        "chapterId": "ch03",
        "sectionId": "3.3",
        "title": "受迫振动与共振曲线",
        "description": "绘制不同阻尼下的振幅-频率共振曲线，演示驱动频率扫动时振幅的实时变化，标注共振峰与Q值，并通过塔科马大桥和乐器共鸣箱说明共振的危害与应用。",
    },
]
