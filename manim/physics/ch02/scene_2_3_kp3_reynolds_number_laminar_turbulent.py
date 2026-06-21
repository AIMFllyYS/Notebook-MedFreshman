"""第 2.3 节 · 雷诺数与层流-湍流转变（金标准范本：ValueTracker + always_redraw 参数扫动）。

可视化方案：
- 左侧：圆管截面内流动示意图（层流=平行流线 / 湍流=波动/旋涡）
- 右侧：仪表盘式 Re 数值读数（刻度分层流/过渡/湍流区）
- 三幕：①增大流速 v → Re 升高 → 层流→湍流转变
        ②分别调 ρ、v、r、η 演示各参数对 Re 的影响
        ③血管典型 Re 数值（主动脉≈1000，心脏出口>1500）

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 颜色语义 ───────────────────────────────────────────────────────────────────
LAMINAR_COLOR   = BLUE
TRANSIT_COLOR   = YELLOW
TURBULENT_COLOR = RED
PIPE_COLOR      = "#888888"


# ─────────────────────────────────────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────────────────────────────────────

def re_value(rho, v, r, eta):
    """Re = ρ v r / η"""
    return rho * v * r / eta


def re_color(re):
    """根据 Re 值返回颜色"""
    if re < 1000:
        return LAMINAR_COLOR
    elif re < 1500:
        return TRANSIT_COLOR
    else:
        return TURBULENT_COLOR


# ─────────────────────────────────────────────────────────────────────────────
# 主场景
# ─────────────────────────────────────────────────────────────────────────────

class Ch02Kp3ReynoldsNumberLaminarTurbulent(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("雷诺数与层流-湍流转变", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("拧开水龙头时，水流一开始细而平滑——", font=CJK).scale(0.49)
        ana2 = Text("开大之后却变得翻腾混乱，还能听到水声。", font=CJK).scale(0.49)
        ana3 = Text("这两种截然不同的流态，由一个无量纲数决定：", font=CJK, color=YELLOW).scale(0.49)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3 · 雷诺数定义（逐步出现 + 高亮）
        # ══════════════════════════════════════════════════════════════════════
        defi_label = Text("雷诺数定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        re_eq = MathTex(
            r"Re", r"=", r"\frac{\rho\, v\, r}{\eta}"
        ).scale(1.1)
        re_eq[0].set_color(YELLOW)
        re_eq[2].set_color(WHITE)
        re_eq.next_to(defi_label, DOWN, buff=0.4)

        self.play(FadeIn(defi_label))
        self.play(Write(re_eq))
        self.wait(0.5)

        # 逐行参数说明
        params = VGroup(
            VGroup(MathTex(r"\rho", color=CYAN).scale(0.65),
                   Text("：流体密度（kg/m³）", font=CJK).scale(0.43)),
            VGroup(MathTex(r"v",  color=ORANGE).scale(0.65),
                   Text("：平均流速（m/s）", font=CJK).scale(0.43)),
            VGroup(MathTex(r"r",  color=GREEN).scale(0.65),
                   Text("：管道半径（m）", font=CJK).scale(0.43)),
            VGroup(MathTex(r"\eta", color=RED).scale(0.65),
                   Text("：动力粘度（Pa·s）", font=CJK).scale(0.43)),
        )
        for row in params:
            row.arrange(RIGHT, buff=0.12)
        params.arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        params.next_to(re_eq, DOWN, buff=0.4)
        params.scale_to_fit_width(9)

        for row in params:
            self.play(FadeIn(row), run_time=0.55)
            self.wait(0.35)
        self.wait(1.0)

        # 判据
        crit_lam = VGroup(
            MathTex(r"Re < 1000", color=LAMINAR_COLOR).scale(0.75),
            Text("：层流", font=CJK, color=LAMINAR_COLOR).scale(0.45),
        ).arrange(RIGHT, buff=0.2)
        crit_trans = VGroup(
            MathTex(r"1000 \leq Re \leq 1500", color=TRANSIT_COLOR).scale(0.75),
            Text("：过渡流", font=CJK, color=TRANSIT_COLOR).scale(0.45),
        ).arrange(RIGHT, buff=0.2)
        crit_turb = VGroup(
            MathTex(r"Re > 1500", color=TURBULENT_COLOR).scale(0.75),
            Text("：湍流", font=CJK, color=TURBULENT_COLOR).scale(0.45),
        ).arrange(RIGHT, buff=0.2)
        crits = VGroup(crit_lam, crit_trans, crit_turb).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        crits.next_to(params, DOWN, buff=0.35)
        crits.scale_to_fit_width(9)

        self.play(FadeIn(crit_lam))
        self.wait(0.4)
        self.play(FadeIn(crit_trans))
        self.wait(0.4)
        self.play(FadeIn(crit_turb))
        self.wait(1.4)

        self.play(FadeOut(VGroup(defi_label, re_eq, params, crits)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4 · 第一幕：圆管流动 + 仪表盘（增大流速 v）
        # ══════════════════════════════════════════════════════════════════════
        act1_label = Text("第一幕：增大流速 v", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act1_label))
        self.wait(0.5)

        # 基准参数
        RHO0 = 1060.0   # 血液密度
        V0   = ValueTracker(0.3)
        R0   = 0.01
        ETA0 = 0.003

        # ── 左侧：管道区域（固定布局）──────────────────────────────────────
        PIPE_LEFT   = -6.5
        PIPE_RIGHT  =  0.0
        PIPE_TOP    =  1.5
        PIPE_BOT    = -1.5
        PIPE_MID    = (PIPE_LEFT + PIPE_RIGHT) / 2

        pipe_top_line = Line([PIPE_LEFT, PIPE_TOP, 0], [PIPE_RIGHT, PIPE_TOP, 0],
                             color=PIPE_COLOR, stroke_width=3)
        pipe_bot_line = Line([PIPE_LEFT, PIPE_BOT, 0], [PIPE_RIGHT, PIPE_BOT, 0],
                             color=PIPE_COLOR, stroke_width=3)
        pipe_label = VGroup(
            Text("圆管截面", font=CJK, color=PIPE_COLOR).scale(0.38),
        ).to_edge(LEFT, buff=0.2).shift(DOWN * 2.5)

        self.play(Create(pipe_top_line), Create(pipe_bot_line), FadeIn(pipe_label))

        # ── 右侧：仪表盘 ───────────────────────────────────────────────────
        GAUGE_CX = 3.2
        GAUGE_CY = -0.3
        GAUGE_R  = 1.6
        gauge_center = np.array([GAUGE_CX, GAUGE_CY, 0])

        # 仪表盘弧（下半圆：-180° 到 0°，Re=0 在左，Re=3000 在右）
        gauge_bg = Arc(radius=GAUGE_R, start_angle=0, angle=PI,
                       color=PIPE_COLOR, stroke_width=6).shift(gauge_center)

        # 三段颜色弧
        def arc_segment(re_start, re_stop, re_max, arc_color):
            ang_start = PI * (1.0 - re_start / re_max)
            ang_stop  = PI * (1.0 - re_stop  / re_max)
            a = min(ang_start, ang_stop)
            span = abs(ang_stop - ang_start)
            return Arc(radius=GAUGE_R - 0.06, start_angle=a, angle=span,
                       color=arc_color, stroke_width=8).shift(gauge_center)

        RE_MAX = 3000
        seg_lam   = arc_segment(0,    1000, RE_MAX, LAMINAR_COLOR)
        seg_trans = arc_segment(1000, 1500, RE_MAX, TRANSIT_COLOR)
        seg_turb  = arc_segment(1500, RE_MAX, RE_MAX, TURBULENT_COLOR)

        # 刻度标签（Re=0, 1000, 1500, 3000）
        def gauge_tip_pos(re_val):
            ang = PI * (1.0 - re_val / RE_MAX)
            return gauge_center + (GAUGE_R + 0.28) * np.array([math.cos(ang), math.sin(ang), 0])

        tick_labels = VGroup(
            MathTex(r"0").scale(0.42).move_to(gauge_tip_pos(0)),
            MathTex(r"1000").scale(0.38).move_to(gauge_tip_pos(1000)),
            MathTex(r"1500").scale(0.38).move_to(gauge_tip_pos(1500)),
            MathTex(r"3000").scale(0.42).move_to(gauge_tip_pos(3000)),
        )

        gauge_zone_lam  = Text("层流", font=CJK, color=LAMINAR_COLOR).scale(0.32).move_to(
            gauge_center + (GAUGE_R - 0.45) * np.array([math.cos(PI * 0.85), math.sin(PI * 0.85), 0]))
        gauge_zone_tran = Text("过渡", font=CJK, color=TRANSIT_COLOR).scale(0.32).move_to(
            gauge_center + (GAUGE_R - 0.45) * np.array([math.cos(PI * 0.60), math.sin(PI * 0.60), 0]))
        gauge_zone_turb = Text("湍流", font=CJK, color=TURBULENT_COLOR).scale(0.32).move_to(
            gauge_center + (GAUGE_R - 0.45) * np.array([math.cos(PI * 0.22), math.sin(PI * 0.22), 0]))

        gauge_title = Text("Re 仪表盘", font=CJK, color=WHITE).scale(0.4).next_to(gauge_bg, UP, buff=0.15)

        # 指针（needle）：always_redraw
        def make_needle(re_val):
            ang = PI * (1.0 - min(re_val, RE_MAX) / RE_MAX)
            tip = gauge_center + (GAUGE_R - 0.15) * np.array([math.cos(ang), math.sin(ang), 0])
            return Arrow(gauge_center, tip, buff=0, color=WHITE,
                         stroke_width=4, max_tip_length_to_length_ratio=0.18)

        needle = always_redraw(
            lambda: make_needle(re_value(RHO0, V0.get_value(), R0, ETA0))
        )

        # Re 数值读数
        re_readout = always_redraw(lambda: VGroup(
            Text("Re =", font=CJK, color=WHITE).scale(0.42),
            MathTex(rf"{re_value(RHO0, V0.get_value(), R0, ETA0):.0f}",
                    color=re_color(re_value(RHO0, V0.get_value(), R0, ETA0))
                    ).scale(0.7),
        ).arrange(RIGHT, buff=0.1).next_to(gauge_bg, DOWN, buff=0.22))

        self.play(
            Create(gauge_bg),
            Create(seg_lam), Create(seg_trans), Create(seg_turb),
            FadeIn(tick_labels),
            FadeIn(gauge_zone_lam), FadeIn(gauge_zone_tran), FadeIn(gauge_zone_turb),
            FadeIn(gauge_title),
        )
        self.add(needle, re_readout)
        self.wait(0.6)

        # ── 左侧流线（层流态）──────────────────────────────────────────────
        N_LINES = 7
        Y_POSITIONS = np.linspace(PIPE_BOT + 0.2, PIPE_TOP - 0.2, N_LINES)

        def make_laminar_lines(t_phase=0.0, amplitude=0.0):
            """平直流线（层流），amplitude>0 时轻微波动（过渡区）"""
            lines = VGroup()
            for i, y0 in enumerate(Y_POSITIONS):
                pts = []
                N_PTS = 30
                for j in range(N_PTS):
                    x = PIPE_LEFT + (PIPE_RIGHT - PIPE_LEFT) * j / (N_PTS - 1)
                    phase_shift = i * 0.4 + t_phase
                    y = y0 + amplitude * math.sin(3.0 * x + phase_shift)
                    pts.append([x, y, 0])
                col = interpolate_color(BLUE, CYAN, i / (N_LINES - 1))
                lines.add(VMobject(color=col, stroke_width=2).set_points_as_corners(pts))
            return lines

        # 初始层流流线
        lam_lines = make_laminar_lines(amplitude=0.0)
        self.play(Create(lam_lines), run_time=1.2)
        self.wait(0.6)

        # 层流时流速说明
        v_label = always_redraw(lambda: VGroup(
            Text("v =", font=CJK).scale(0.38),
            MathTex(rf"{V0.get_value():.2f}\ \mathrm{{m/s}}").scale(0.52),
        ).arrange(RIGHT, buff=0.08).next_to(pipe_bot_line, DOWN, buff=0.18).shift(RIGHT * 2.0))
        self.add(v_label)

        tip_lam = Text("Re < 1000：流线平直有序（层流）", font=CJK, color=LAMINAR_COLOR).scale(0.42)
        tip_lam.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(tip_lam))
        self.wait(1.0)

        # ── 增大 v → Re 进入过渡区 ─────────────────────────────────────────
        tip_trans = Text("1000 < Re < 1500：流线开始波动（过渡流）", font=CJK, color=TRANSIT_COLOR).scale(0.42)
        tip_trans.to_edge(DOWN, buff=0.5)

        # 增大 v 让 Re → 1200（过渡区）
        v_target_trans = 1200 * ETA0 / (RHO0 * R0)   # ≈ 0.340 m/s

        self.play(FadeOut(tip_lam))
        self.play(FadeIn(tip_trans))

        # 同步改变流速 + 更新流线（分阶段重绘流线为波动态）
        self.play(V0.animate.set_value(v_target_trans), run_time=2.0)
        self.wait(0.5)

        # 换为波动流线
        wave_lines = make_laminar_lines(amplitude=0.10)
        self.play(Transform(lam_lines, wave_lines), run_time=1.0)
        self.wait(0.8)

        # ── 增大 v → Re 进入湍流区 ─────────────────────────────────────────
        tip_turb = Text("Re > 1500：出现旋涡，流动混乱（湍流）", font=CJK, color=TURBULENT_COLOR).scale(0.42)
        tip_turb.to_edge(DOWN, buff=0.5)

        v_target_turb = 2000 * ETA0 / (RHO0 * R0)   # ≈ 0.566 m/s

        self.play(FadeOut(tip_trans))
        self.play(FadeIn(tip_turb))
        self.play(V0.animate.set_value(v_target_turb), run_time=2.0)
        self.wait(0.4)

        # 湍流：随机化流线，变为混乱彩色云
        def make_turbulent_lines():
            lines = VGroup()
            np.random.seed(42)
            for i in range(14):
                pts = []
                N_PTS = 40
                y0 = np.random.uniform(PIPE_BOT + 0.15, PIPE_TOP - 0.15)
                for j in range(N_PTS):
                    x = PIPE_LEFT + (PIPE_RIGHT - PIPE_LEFT) * j / (N_PTS - 1)
                    y = y0 + np.random.uniform(-0.35, 0.35)
                    y = max(PIPE_BOT + 0.05, min(PIPE_TOP - 0.05, y))
                    pts.append([x, y, 0])
                turb_colors = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE]
                col = turb_colors[i % len(turb_colors)]
                lines.add(VMobject(color=col, stroke_width=1.5, stroke_opacity=0.75)
                          .set_points_as_corners(pts))
            return lines

        turb_lines = make_turbulent_lines()
        self.play(Transform(lam_lines, turb_lines), run_time=1.2)
        self.wait(1.4)

        # 清场第一幕
        self.play(FadeOut(VGroup(
            pipe_top_line, pipe_bot_line, pipe_label,
            lam_lines, v_label, tip_turb,
            gauge_bg, seg_lam, seg_trans, seg_turb,
            tick_labels, gauge_zone_lam, gauge_zone_tran, gauge_zone_turb,
            gauge_title, needle, re_readout,
            act1_label,
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5 · 第二幕：四参数逐一调节
        # ══════════════════════════════════════════════════════════════════════
        act2_label = Text("第二幕：哪些参数影响 Re？", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act2_label))
        self.wait(0.5)

        # 基准值（均对应 Re=500，层流）
        BASE_RHO = 1060.0
        BASE_V   = 0.15
        BASE_R   = 0.01
        BASE_ETA = 0.003
        # Re_base = 1060 * 0.15 * 0.01 / 0.003 = 530

        rho_t = ValueTracker(BASE_RHO)
        v_t   = ValueTracker(BASE_V)
        r_t   = ValueTracker(BASE_R)
        eta_t = ValueTracker(BASE_ETA)

        # 公式（高亮）
        re_formula = MathTex(
            r"Re = \frac{\rho\, v\, r}{\eta}"
        ).scale(0.95).next_to(act2_label, DOWN, buff=0.4)
        self.play(Write(re_formula))
        self.wait(0.5)

        # 参数值显示
        def make_param_row(rho, v, r, eta):
            re = re_value(rho, v, r, eta)
            row1 = VGroup(
                Text("rho=", font=CJK, color=CYAN).scale(0.4),
                MathTex(rf"{rho:.0f}", color=CYAN).scale(0.55),
                Text("  v=", font=CJK, color=ORANGE).scale(0.4),
                MathTex(rf"{v:.3f}", color=ORANGE).scale(0.55),
                Text("  r=", font=CJK, color=GREEN).scale(0.4),
                MathTex(rf"{r:.4f}", color=GREEN).scale(0.55),
                Text("  eta=", font=CJK, color=RED).scale(0.4),
                MathTex(rf"{eta:.4f}", color=RED).scale(0.55),
            ).arrange(RIGHT, buff=0.07)
            row2 = VGroup(
                Text("Re =", font=CJK, color=WHITE).scale(0.48),
                MathTex(rf"{re:.0f}", color=re_color(re)).scale(0.85),
            ).arrange(RIGHT, buff=0.12)
            return VGroup(row1, row2).arrange(DOWN, buff=0.3)

        param_display = always_redraw(lambda: make_param_row(
            rho_t.get_value(), v_t.get_value(), r_t.get_value(), eta_t.get_value()
        ).next_to(re_formula, DOWN, buff=0.45).scale_to_fit_width(12.5))
        self.add(param_display)
        self.wait(0.6)

        # ── 调 ρ（密度增大 → Re 增大）──────────────────────────────────────
        tip_rho = VGroup(
            Text("增大密度 rho：", font=CJK, color=CYAN).scale(0.44),
            Text("Re 随之增大（分子变大）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(tip_rho))
        self.play(rho_t.animate.set_value(4000.0), run_time=2.2)
        self.wait(0.8)
        self.play(rho_t.animate.set_value(BASE_RHO), run_time=1.2)
        self.play(FadeOut(tip_rho))

        # ── 调 v（流速增大 → Re 增大）─────────────────────────────────────
        tip_v = VGroup(
            Text("增大流速 v：", font=CJK, color=ORANGE).scale(0.44),
            Text("Re 随之增大（湍流判据中最常调节的量）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(tip_v))
        self.play(v_t.animate.set_value(0.60), run_time=2.2)
        self.wait(0.8)
        self.play(v_t.animate.set_value(BASE_V), run_time=1.2)
        self.play(FadeOut(tip_v))

        # ── 调 r（管径增大 → Re 增大）─────────────────────────────────────
        tip_r = VGroup(
            Text("增大管径 r：", font=CJK, color=GREEN).scale(0.44),
            Text("Re 随之增大（大管道更易湍流）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(tip_r))
        self.play(r_t.animate.set_value(0.04), run_time=2.2)
        self.wait(0.8)
        self.play(r_t.animate.set_value(BASE_R), run_time=1.2)
        self.play(FadeOut(tip_r))

        # ── 调 η（粘度增大 → Re 减小）─────────────────────────────────────
        tip_eta = VGroup(
            Text("增大粘度 eta：", font=CJK, color=RED).scale(0.44),
            Text("Re 反而减小（粘性抑制湍流）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(tip_eta))
        self.play(eta_t.animate.set_value(0.020), run_time=2.2)
        self.wait(0.8)
        self.play(eta_t.animate.set_value(BASE_ETA), run_time=1.2)
        self.play(FadeOut(tip_eta))
        self.wait(0.5)

        # 清场第二幕
        self.play(FadeOut(VGroup(act2_label, re_formula, param_display)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 6 · 第三幕：血管中的典型 Re 值
        # ══════════════════════════════════════════════════════════════════════
        act3_label = Text("第三幕：血管中的 Re 值", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act3_label))
        self.wait(0.5)

        intro = Text("血液参数：ρ ≈ 1060 kg/m³，η ≈ 0.003 Pa·s", font=CJK, color=WHITE).scale(0.44)
        intro.next_to(act3_label, DOWN, buff=0.35)
        self.play(FadeIn(intro))
        self.wait(0.8)

        # 场景一：正常主动脉（r=10 mm, v=0.3 m/s → Re≈1060）
        case1_title = Text("正常主动脉", font=CJK, color=LAMINAR_COLOR).scale(0.5)
        case1_params = VGroup(
            MathTex(r"r = 10\ \mathrm{mm},\quad v = 0.30\ \mathrm{m/s}", color=WHITE).scale(0.65),
        )
        case1_re = VGroup(
            Text("Re =", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"1060", color=LAMINAR_COLOR).scale(0.85),
            Text("（层流 / 过渡边缘）", font=CJK, color=LAMINAR_COLOR).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        case1 = VGroup(case1_title, case1_params, case1_re).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        case1.next_to(intro, DOWN, buff=0.45)

        # 主动脉管示意（小型）
        aorta_tube = VGroup(
            Line([-3.2, 0.55, 0], [3.2, 0.55, 0], color=PIPE_COLOR, stroke_width=2.5),
            Line([-3.2, -0.55, 0], [3.2, -0.55, 0], color=PIPE_COLOR, stroke_width=2.5),
        ).next_to(case1, DOWN, buff=0.3)
        aorta_stream = VGroup(*[
            Line([-3.0, y, 0], [3.0, y, 0],
                 color=interpolate_color(BLUE, CYAN, (y + 0.4) / 0.8),
                 stroke_width=1.8)
            for y in np.linspace(-0.4, 0.4, 5)
        ]).shift(aorta_tube.get_center())

        self.play(FadeIn(case1))
        self.play(Create(aorta_tube), Create(aorta_stream))
        self.wait(1.4)

        # 场景二：心脏出口（r=12 mm, v=0.5 m/s → Re≈2120）
        case2_title = Text("心脏出口（收缩期峰值）", font=CJK, color=TURBULENT_COLOR).scale(0.5)
        case2_params = VGroup(
            MathTex(r"r = 12\ \mathrm{mm},\quad v = 0.50\ \mathrm{m/s}", color=WHITE).scale(0.65),
        )
        case2_re = VGroup(
            Text("Re =", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"2120", color=TURBULENT_COLOR).scale(0.85),
            Text("（已超过湍流阈值！）", font=CJK, color=TURBULENT_COLOR).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        case2 = VGroup(case2_title, case2_params, case2_re).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        case2.next_to(aorta_tube, DOWN, buff=0.55)

        # 湍流管示意
        heart_tube = VGroup(
            Line([-3.2, 0.65, 0], [3.2, 0.65, 0], color=PIPE_COLOR, stroke_width=2.5),
            Line([-3.2, -0.65, 0], [3.2, -0.65, 0], color=PIPE_COLOR, stroke_width=2.5),
        ).next_to(case2, DOWN, buff=0.3)

        np.random.seed(7)
        heart_turb = VGroup(*[
            VMobject(color=[RED, ORANGE, YELLOW][i % 3], stroke_width=1.5, stroke_opacity=0.8)
            .set_points_as_corners([
                [-3.0 + k * 0.22,
                 np.random.uniform(-0.50, 0.50), 0]
                for k in range(28)
            ])
            for i in range(8)
        ]).shift(heart_tube.get_center())

        self.play(FadeIn(case2))
        self.play(Create(heart_tube), Create(heart_turb))
        self.wait(1.5)

        # 小结语
        note = Text("生理意义：湍流在心脏出口产生心音（可由听诊器听到）", font=CJK, color=YELLOW).scale(0.41)
        note.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(note))
        self.wait(1.5)

        # 清场第三幕
        self.play(FadeOut(VGroup(
            act3_label, intro,
            case1, aorta_tube, aorta_stream,
            case2, heart_tube, heart_turb,
            note,
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 7 · 小结卡
        # ══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1 = MathTex(r"Re = \frac{\rho\, v\, r}{\eta}", color=YELLOW).scale(0.9)
        s2 = VGroup(
            MathTex(r"Re < 1000", color=LAMINAR_COLOR).scale(0.72),
            Text("→ 层流（有序平滑）", font=CJK, color=LAMINAR_COLOR).scale(0.44),
        ).arrange(RIGHT, buff=0.18)
        s3 = VGroup(
            MathTex(r"Re > 1500", color=TURBULENT_COLOR).scale(0.72),
            Text("→ 湍流（混乱旋涡）", font=CJK, color=TURBULENT_COLOR).scale(0.44),
        ).arrange(RIGHT, buff=0.18)
        s4 = Text("ρ↑ v↑ r↑ → Re↑；η↑ → Re↓", font=CJK, color=GREEN).scale(0.44)
        s5 = Text("主动脉 Re≈1060（边缘层流）；心脏出口 Re>1500（湍流）", font=CJK, color=CYAN).scale(0.42)

        summary_content = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32)
        summary_content.next_to(s_title, DOWN, buff=0.4)
        summary_content.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary_content, color=BLUE, buff=0.35, corner_radius=0.18)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(FadeIn(s2))
        self.wait(0.4)
        self.play(FadeIn(s3))
        self.wait(0.4)
        self.play(FadeIn(s4))
        self.wait(0.4)
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary_content, box, title)))
        self.wait(0.4)


# ─────────────────────────────────────────────────────────────────────────────
REGISTER = [
    {
        "scene": "Ch02Kp3ReynoldsNumberLaminarTurbulent",
        "id": "phys-ch02-2.3-kp3-reynolds-number-laminar-turbulent",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "雷诺数与层流-湍流转变",
        "description": "用圆管流动图+Re仪表盘演示层流到湍流的转变过程，ValueTracker 扫动流速；分析四参数对 Re 的影响；展示血管中典型 Re 值。",
    },
]
