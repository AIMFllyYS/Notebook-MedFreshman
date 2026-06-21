"""第 8.2 节 · 载流螺线管内部匀强磁场（金标准范本：函数曲线叠加 + ValueTracker）。

可视化三步走：
① ValueTracker 增加匝数（5→20→100），逐层叠加各圆环在轴线上的 B 分量曲线，
  观察中间逐渐趋于均匀；
② 对单匝贡献积分，引入角度参数 β1/β2，给出通用公式
  B = (μ₀nI/2)(cosβ₁ - cosβ₂)；
③ 无限长极限 β₁→π, β₂→0，定格 B = μ₀nI，
  绘制螺线管横截面磁感应线：内部平行直线、两端弯出的闭合曲线。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ── 物理工具函数 ──────────────────────────────────────────────────────────────

def biot_savart_ring_axis(z_field: float, z_ring: float, R: float) -> float:
    """单匝圆环在轴线上 z_field 处产生的 B（归一化为 μ₀I/(2R) 的倍数）。
    B/(μ₀I/2R) = R² / (R² + (z-z_ring)²)^(3/2)  *  R^(-1)   →   R³/(...)^(3/2)
    实际返回 B/(μ₀I/(2R)) = R² / (R²+(z-z0)²)^(3/2)  * R
    为可视化方便，归一化返回：R³ / (R² + dz²)^(3/2)
    """
    dz = z_field - z_ring
    return R ** 3 / (R ** 2 + dz ** 2) ** 1.5


class Ch08Kp4SolenoidInteriorField(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ════════════════════════════════════════════════════════════════
        title = Text("载流螺线管内部匀强磁场", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ════════════════════════════════════════════════════════════════
        ana1 = Text("MRI 核磁共振机器里有超导螺线管：", font=CJK).scale(0.50)
        ana2 = Text("里面有一段磁场几乎完全均匀——这正是螺线管的核心性质。", font=CJK).scale(0.50)
        ana3 = Text("为什么内部磁场均匀？每一匝电流线圈都贡献一份磁场，", font=CJK).scale(0.50)
        ana4 = Text("大量线圈叠加后，内部合场趋于常数，两端才有弯曲。", font=CJK).scale(0.50)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(0.4)
        self.play(FadeIn(ana4))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════
        # Step 3: 单匝圆环轴线磁场公式（逐步出现）
        # ════════════════════════════════════════════════════════════════
        sec3_head = Text("单匝圆环在轴线上产生的磁场（毕奥-萨伐尔定律）",
                         font=CJK, color=YELLOW).scale(0.48).next_to(title, DOWN, buff=0.45)
        f1 = MathTex(r"B_{ring}(z)=\frac{\mu_0 I R^2}{2(R^2+z^2)^{3/2}}").scale(0.88)
        f1.next_to(sec3_head, DOWN, buff=0.45)
        f1[0][:5].set_color(CYAN)

        note1 = VGroup(
            Text("其中：", font=CJK).scale(0.44),
            MathTex(r"R").scale(0.72),
            Text("—— 圆环半径", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        note2 = VGroup(
            Text("      ", font=CJK).scale(0.44),
            MathTex(r"z").scale(0.72),
            Text("—— 场点到圆心的轴向距离", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        notes = VGroup(note1, note2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        notes.next_to(f1, DOWN, buff=0.35)
        notes.scale_to_fit_width(9)

        self.play(FadeIn(sec3_head))
        self.wait(0.5)
        self.play(Write(f1))
        self.wait(0.8)
        self.play(FadeIn(notes))
        self.wait(1.6)
        self.play(FadeOut(VGroup(sec3_head, f1, notes)))

        # ════════════════════════════════════════════════════════════════
        # Step 4: ValueTracker 增加匝数 → 曲线叠加趋于均匀
        # ════════════════════════════════════════════════════════════════
        sec4_head = Text("叠加多匝：匝数越多内部越均匀", font=CJK, color=YELLOW).scale(0.50)
        sec4_head.next_to(title, DOWN, buff=0.40)

        # 坐标轴
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 1.25, 0.5],
            x_length=9.0,
            y_length=3.6,
            axis_config={"color": WHITE, "include_tip": True, "tip_length": 0.18},
        ).next_to(sec4_head, DOWN, buff=0.30)

        x_label = VGroup(MathTex(r"z", color=WHITE).scale(0.60))
        x_label.next_to(axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_label = VGroup(MathTex(r"B/B_0", color=WHITE).scale(0.55))
        y_label.next_to(axes.y_axis.get_end(), UP, buff=0.08)

        # 螺线管范围标注
        sol_len = 3.0   # 螺线管半长度（轴向单位）
        sol_R = 1.0     # 螺线管半径（归一化用）

        # ValueTracker 控制匝数
        N_tracker = ValueTracker(5)

        # 为了 always_redraw 稳定，预先定义颜色序列
        ring_colors = [ORANGE, GREEN, CYAN, YELLOW, BLUE, RED,
                       "#FF8C00", "#7FFF00", "#FF69B4", "#40E0D0"]

        def make_b_curves():
            grp = VGroup()
            N = int(round(N_tracker.get_value()))
            # 每匝位置（均匀分布在 [-sol_len, sol_len]）
            z_rings = np.linspace(-sol_len, sol_len, N)
            B_norm = 1.0  # 归一化常数：单匝在圆心处的 B = 1 (取 R=1)

            # 合成曲线数据
            z_arr = np.linspace(-3.4, 3.4, 400)
            B_total = np.zeros_like(z_arr)
            for z0 in z_rings:
                dz = z_arr - z0
                B_ring = sol_R ** 3 / (sol_R ** 2 + dz ** 2) ** 1.5
                B_total += B_ring

            # 归一化：使螺线管中心处的叠加值≈1
            B_center = sum(sol_R ** 3 / (sol_R ** 2 + (0 - z0) ** 2) ** 1.5
                           for z0 in z_rings)
            if B_center > 1e-9:
                scale = 1.0 / B_center
            else:
                scale = 1.0

            # 各圆环曲线（半透明细线）
            for i, z0 in enumerate(z_rings):
                col = ring_colors[i % len(ring_colors)]
                ring_pts = []
                for z_val in np.linspace(-3.4, 3.4, 200):
                    dz = z_val - z0
                    bv = sol_R ** 3 / (sol_R ** 2 + dz ** 2) ** 1.5 * scale
                    if 0 <= bv <= 1.2:
                        ring_pts.append(axes.c2p(z_val, bv))
                if len(ring_pts) > 2:
                    curve_i = VMobject(color=col, stroke_width=1.2, stroke_opacity=0.45)
                    curve_i.set_points_as_corners(ring_pts)
                    curve_i.make_smooth()
                    grp.add(curve_i)

            # 合成曲线（亮白色）
            B_scaled = B_total * scale
            total_pts = []
            for j, z_val in enumerate(z_arr):
                bv = float(B_scaled[j])
                if 0 <= bv <= 1.2:
                    total_pts.append(axes.c2p(z_val, bv))
            if len(total_pts) > 2:
                total_curve = VMobject(color=WHITE, stroke_width=2.8)
                total_curve.set_points_as_corners(total_pts)
                total_curve.make_smooth()
                grp.add(total_curve)

            return grp

        b_curves = always_redraw(make_b_curves)

        # 匝数读出
        n_readout = always_redraw(
            lambda: VGroup(
                Text("匝数 N =", font=CJK, color=ORANGE).scale(0.44),
                MathTex(str(int(round(N_tracker.get_value()))), color=ORANGE).scale(0.60),
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.55)
        )

        # 螺线管范围虚线
        left_line = DashedLine(
            axes.c2p(-sol_len, 0), axes.c2p(-sol_len, 1.2),
            color=CYAN, dash_length=0.12, stroke_width=1.5
        )
        right_line = DashedLine(
            axes.c2p(sol_len, 0), axes.c2p(sol_len, 1.2),
            color=CYAN, dash_length=0.12, stroke_width=1.5
        )
        range_label = VGroup(
            Text("螺线管范围", font=CJK, color=CYAN).scale(0.38),
        ).next_to(axes.c2p(0, 1.2), UP, buff=0.08)

        self.play(FadeIn(sec4_head))
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.add(b_curves, n_readout)
        self.play(Create(left_line), Create(right_line), FadeIn(range_label))
        self.wait(0.8)

        hint_5 = Text("5匝：各圆环贡献曲线清晰可见，合成曲线起伏较大",
                      font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(hint_5))
        self.wait(1.8)
        self.play(FadeOut(hint_5))

        # 增加到 20 匝
        hint_20 = Text("20匝：内部合成曲线（白色）趋于平坦",
                       font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(hint_20), N_tracker.animate.set_value(20), run_time=2.4)
        self.wait(1.6)
        self.play(FadeOut(hint_20))

        # 增加到 100 匝
        hint_100 = Text("100匝：内部近似匀强！两端出现边缘效应（场减弱）",
                        font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(hint_100), N_tracker.animate.set_value(100), run_time=2.6)
        self.wait(2.0)
        self.play(FadeOut(hint_100))

        self.play(FadeOut(VGroup(
            sec4_head, axes, b_curves, x_label, y_label,
            left_line, right_line, range_label, n_readout
        )))

        # ════════════════════════════════════════════════════════════════
        # Step 5: 角度参数 β 的几何关系示意图
        # ════════════════════════════════════════════════════════════════
        sec5_head = Text("角度参数 β 的几何意义", font=CJK, color=YELLOW).scale(0.50)
        sec5_head.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sec5_head))

        # 简化示意图：水平轴（螺线管轴线），场点 P，圆环端点，角度弧
        axis_line = Line(LEFT * 4.5, RIGHT * 4.5, color=WHITE, stroke_width=1.5)
        axis_line.next_to(sec5_head, DOWN, buff=1.0)

        # 场点 P（轴线中点左侧）
        P_pt = axis_line.get_center() + LEFT * 1.5
        P_dot = Dot(P_pt, color=YELLOW, radius=0.09)
        P_label = MathTex(r"P", color=YELLOW).scale(0.65).next_to(P_dot, DOWN, buff=0.12)

        # 螺线管两端在轴线上的投影点
        end_L = axis_line.get_start() + RIGHT * 0.8
        end_R = axis_line.get_end() + LEFT * 0.8

        end_L_dot = Dot(end_L, color=CYAN, radius=0.07)
        end_R_dot = Dot(end_R, color=CYAN, radius=0.07)

        # 圆环端点（稍微偏上，模拟圆环半径 R）
        R_visual = 1.0
        end_L_top = end_L + UP * R_visual
        end_R_top = end_R + UP * R_visual
        end_L_top_dot = Dot(end_L_top, color=ORANGE, radius=0.07)
        end_R_top_dot = Dot(end_R_top, color=ORANGE, radius=0.07)

        # 连线 P→端点顶
        line_PL = Line(P_pt, end_L_top, color=ORANGE, stroke_width=2.0)
        line_PR = Line(P_pt, end_R_top, color=GREEN, stroke_width=2.0)
        # 轴向连线（P 到两端投影）
        line_Paxis_L = DashedLine(P_pt, end_L, color=WHITE, stroke_width=1.0, dash_length=0.10)
        line_Paxis_R = DashedLine(P_pt, end_R, color=WHITE, stroke_width=1.0, dash_length=0.10)
        # 半径线
        line_RL = DashedLine(end_L, end_L_top, color=CYAN, stroke_width=1.2, dash_length=0.10)
        line_RR = DashedLine(end_R, end_R_top, color=CYAN, stroke_width=1.2, dash_length=0.10)

        # 角度标注（用 Arc）
        # β₁ = 左端切线与轴线夹角，β₂ = 右端切线与轴线夹角
        # 计算角度
        vec_L = end_L_top - P_pt
        vec_R = end_R_top - P_pt
        ang_L = math.atan2(vec_L[1], vec_L[0])  # 相对水平
        ang_R = math.atan2(vec_R[1], vec_R[0])

        arc_b1 = Arc(
            radius=0.55, start_angle=0, angle=ang_L,
            color=ORANGE, stroke_width=2.0, arc_center=P_pt
        )
        arc_b2 = Arc(
            radius=0.40, start_angle=0, angle=ang_R,
            color=GREEN, stroke_width=2.0, arc_center=P_pt
        )

        label_b1 = MathTex(r"\beta_1", color=ORANGE).scale(0.62)
        label_b1.move_to(P_pt + np.array([0.72, 0.42, 0]))
        label_b2 = MathTex(r"\beta_2", color=GREEN).scale(0.62)
        label_b2.move_to(P_pt + np.array([0.36, 0.30, 0]))

        R_label = MathTex(r"R", color=CYAN).scale(0.55).next_to(end_L_top_dot, LEFT, buff=0.08)

        geom_grp = VGroup(
            axis_line, P_dot, P_label,
            end_L_dot, end_R_dot, end_L_top_dot, end_R_top_dot,
            line_PL, line_PR, line_Paxis_L, line_Paxis_R, line_RL, line_RR,
            arc_b1, arc_b2, label_b1, label_b2, R_label,
        )

        self.play(Create(axis_line))
        self.play(FadeIn(P_dot), FadeIn(P_label))
        self.play(Create(line_RL), Create(line_RR), FadeIn(end_L_dot), FadeIn(end_R_dot),
                  FadeIn(end_L_top_dot), FadeIn(end_R_top_dot), FadeIn(R_label))
        self.play(Create(line_PL), Create(line_PR),
                  FadeIn(line_Paxis_L), FadeIn(line_Paxis_R))
        self.play(Create(arc_b1), Create(arc_b2),
                  FadeIn(label_b1), FadeIn(label_b2))
        self.wait(1.2)

        geom_note = VGroup(
            Text("β₁ = P 点看螺线管", font=CJK, color=ORANGE).scale(0.42),
            Text("左端切线与轴线的夹角", font=CJK, color=ORANGE).scale(0.42),
        ).arrange(RIGHT, buff=0.10).to_edge(DOWN, buff=1.0)
        geom_note2 = VGroup(
            Text("β₂ = P 点看螺线管", font=CJK, color=GREEN).scale(0.42),
            Text("右端切线与轴线的夹角", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.10).next_to(geom_note, DOWN, buff=0.18)
        self.play(FadeIn(geom_note), FadeIn(geom_note2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(sec5_head, geom_grp, geom_note, geom_note2)))

        # ════════════════════════════════════════════════════════════════
        # Step 6: 对单匝贡献积分 → 通用公式推导（逐步）
        # ════════════════════════════════════════════════════════════════
        sec6_head = Text("对全部匝积分——有限长螺线管公式", font=CJK, color=YELLOW).scale(0.50)
        sec6_head.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sec6_head))

        step6a = MathTex(
            r"\mathrm{d}B = \frac{\mu_0 n I}{2}\sin\beta \,\mathrm{d}\beta"
        ).scale(0.82)
        step6a.next_to(sec6_head, DOWN, buff=0.45)
        step6a[0][:2].set_color(CYAN)

        note6a = VGroup(
            Text("n = 单位长度匝数，将 z 换元为角度 β", font=CJK).scale(0.42),
        ).next_to(step6a, DOWN, buff=0.28)

        step6b = MathTex(
            r"B = \int_{\beta_1}^{\beta_2}\frac{\mu_0 nI}{2}\sin\beta\,\mathrm{d}\beta"
        ).scale(0.82)
        step6b.next_to(note6a, DOWN, buff=0.38)
        step6b[0][1].set_color(YELLOW)

        step6c = MathTex(
            r"B = \frac{\mu_0 nI}{2}\bigl(\cos\beta_1 - \cos\beta_2\bigr)"
        ).scale(0.88)
        step6c.next_to(step6b, DOWN, buff=0.42)
        step6c[0][:1].set_color(GREEN)

        box6c = SurroundingRectangle(step6c, color=GREEN, buff=0.18, corner_radius=0.10)

        self.play(Write(step6a))
        self.wait(0.8)
        self.play(FadeIn(note6a))
        self.wait(0.6)
        self.play(Write(step6b))
        self.wait(1.0)
        self.play(TransformMatchingTex(step6b.copy(), step6c))
        self.play(Create(box6c))
        self.wait(1.8)

        self.play(FadeOut(VGroup(sec6_head, step6a, note6a, step6b, step6c, box6c)))

        # ════════════════════════════════════════════════════════════════
        # Step 7: 无限长极限 → B = μ₀nI
        # ════════════════════════════════════════════════════════════════
        sec7_head = Text("无限长极限：均匀磁场的诞生", font=CJK, color=YELLOW).scale(0.50)
        sec7_head.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sec7_head))

        limit_note = VGroup(
            Text("当螺线管足够长时：", font=CJK).scale(0.48),
        ).next_to(sec7_head, DOWN, buff=0.45)

        lim_beta = MathTex(
            r"\beta_1 \to \pi,\quad \beta_2 \to 0"
        ).scale(0.88)
        lim_beta.next_to(limit_note, DOWN, buff=0.35)
        lim_beta[0][:7].set_color(ORANGE)

        cos_vals = MathTex(
            r"\cos\pi = -1,\quad \cos 0 = 1"
        ).scale(0.82)
        cos_vals.next_to(lim_beta, DOWN, buff=0.38)

        lim_result = MathTex(
            r"B = \frac{\mu_0 nI}{2}\bigl((-1) - 1\bigr) \to \mu_0 nI"
        ).scale(0.85)
        lim_result.next_to(cos_vals, DOWN, buff=0.42)
        lim_result[0][-4:].set_color(GREEN)

        final_formula = MathTex(
            r"B = \mu_0 nI"
        ).scale(1.15)
        final_formula.next_to(lim_result, DOWN, buff=0.45)
        final_formula[0].set_color(YELLOW)

        box_final = SurroundingRectangle(final_formula, color=YELLOW, buff=0.22, corner_radius=0.12)

        self.play(FadeIn(limit_note))
        self.play(Write(lim_beta))
        self.wait(0.8)
        self.play(Write(cos_vals))
        self.wait(0.8)
        self.play(Write(lim_result))
        self.wait(0.8)
        self.play(Write(final_formula), Create(box_final))
        self.wait(2.0)
        self.play(FadeOut(VGroup(sec7_head, limit_note, lim_beta, cos_vals, lim_result,
                                 final_formula, box_final)))

        # ════════════════════════════════════════════════════════════════
        # Step 8: 螺线管横截面磁感应线示意图
        # ════════════════════════════════════════════════════════════════
        sec8_head = Text("磁感应线分布：内平行 · 外弯曲", font=CJK, color=YELLOW).scale(0.50)
        sec8_head.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sec8_head))

        # 绘制螺线管外壳（矩形，截面）
        sol_w = 7.0
        sol_h = 2.2
        sol_rect = Rectangle(width=sol_w, height=sol_h, color=BLUE, stroke_width=2.0)
        sol_rect.next_to(sec8_head, DOWN, buff=0.45)

        # 线圈圈（小短线代表导线截面）
        coil_marks = VGroup()
        n_coils = 14
        xs = np.linspace(-sol_w / 2 + 0.15, sol_w / 2 - 0.15, n_coils)
        for xc in xs:
            top_tick = Line(
                sol_rect.get_top() + np.array([xc, -0.02, 0]),
                sol_rect.get_top() + np.array([xc, 0.20, 0]),
                color=BLUE, stroke_width=3.0
            )
            bot_tick = Line(
                sol_rect.get_bottom() + np.array([xc, 0.02, 0]),
                sol_rect.get_bottom() + np.array([xc, -0.20, 0]),
                color=BLUE, stroke_width=3.0
            )
            coil_marks.add(top_tick, bot_tick)

        self.play(Create(sol_rect), Create(coil_marks))
        self.wait(0.6)

        # 内部平行磁感线（水平箭头）
        inner_lines = VGroup()
        ys_inner = np.linspace(-sol_h / 2 + 0.35, sol_h / 2 - 0.35, 5)
        center = sol_rect.get_center()
        for yi in ys_inner:
            start_pt = center + np.array([-sol_w / 2 + 0.25, yi, 0])
            end_pt = center + np.array([sol_w / 2 - 0.25, yi, 0])
            arr = Arrow(start_pt, end_pt, buff=0, color=CYAN,
                        stroke_width=2.2, max_tip_length_to_length_ratio=0.12)
            inner_lines.add(arr)

        inner_label = Text("内部：平行且均匀 (B = μ₀nI)", font=CJK, color=CYAN).scale(0.42)
        inner_label.next_to(sol_rect, DOWN, buff=0.22)

        self.play(Create(inner_lines))
        self.play(FadeIn(inner_label))
        self.wait(1.2)

        # 外部弯曲磁感线（两端弯出的弧线，用参数曲线模拟）
        outer_lines = VGroup()
        # 左端弯出（从上边框绕到下边框）
        for idx, frac in enumerate([0.25, 0.5, 0.75]):
            x_start = center[0] - sol_w / 2
            y_top = center[1] + sol_h / 2 * frac
            y_bot = center[1] - sol_h / 2 * frac
            # 简化：用贝塞尔曲线近似（CubicBezier）
            r_out = 0.55 + 0.45 * frac
            p0 = np.array([x_start, y_top, 0])
            p1 = np.array([x_start - r_out, y_top * 0.5, 0])
            p2 = np.array([x_start - r_out, y_bot * 0.5, 0])
            p3 = np.array([x_start, y_bot, 0])
            curve_L = CubicBezier(p0, p1, p2, p3, color=ORANGE, stroke_width=1.8)
            outer_lines.add(curve_L)

        # 右端弯出
        for idx, frac in enumerate([0.25, 0.5, 0.75]):
            x_end = center[0] + sol_w / 2
            y_top = center[1] + sol_h / 2 * frac
            y_bot = center[1] - sol_h / 2 * frac
            r_out = 0.55 + 0.45 * frac
            p0 = np.array([x_end, y_top, 0])
            p1 = np.array([x_end + r_out, y_top * 0.5, 0])
            p2 = np.array([x_end + r_out, y_bot * 0.5, 0])
            p3 = np.array([x_end, y_bot, 0])
            curve_R = CubicBezier(p0, p1, p2, p3, color=ORANGE, stroke_width=1.8)
            outer_lines.add(curve_R)

        outer_label = Text("两端：磁感线弯曲扩散（边缘效应）", font=CJK, color=ORANGE).scale(0.42)
        outer_label.next_to(inner_label, DOWN, buff=0.18)

        self.play(Create(outer_lines))
        self.play(FadeIn(outer_label))
        self.wait(1.8)

        # 磁场方向标注（右手螺旋法则提示）
        rh_note = VGroup(
            Text("方向：右手握住螺线管，四指绕行方向 → 大拇指指向磁场方向",
                 font=CJK, color=GREEN).scale(0.40),
        ).next_to(outer_label, DOWN, buff=0.22)
        self.play(FadeIn(rh_note))
        self.wait(1.6)
        self.play(FadeOut(VGroup(
            sec8_head, sol_rect, coil_marks, inner_lines, inner_label,
            outer_lines, outer_label, rh_note
        )))

        # ════════════════════════════════════════════════════════════════
        # Step 9: 数值例子
        # ════════════════════════════════════════════════════════════════
        ex_head = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        ex1 = Text("螺线管：n = 1000 匝/m，I = 2 A，求内部磁场 B = ?",
                   font=CJK).scale(0.46)
        ex1.next_to(ex_head, DOWN, buff=0.35)

        ex_calc = MathTex(
            r"B = \mu_0 nI = 4\pi\times10^{-7}\times1000\times2"
            r"\approx 2.51\times10^{-3}\ \mathrm{T}"
        ).scale(0.78)
        ex_calc.next_to(ex1, DOWN, buff=0.38)
        ex_calc.set_color(GREEN)

        ex2 = Text("约 2.5 mT，是地球磁场的 50 倍！核磁共振机达到 1-3 T（n 与 I 大得多）",
                   font=CJK, color=ORANGE).scale(0.41)
        ex2.next_to(ex_calc, DOWN, buff=0.35)
        ex2.scale_to_fit_width(12.5)

        self.play(FadeIn(ex_head))
        self.play(FadeIn(ex1))
        self.wait(0.8)
        self.play(Write(ex_calc))
        self.wait(1.0)
        self.play(FadeIn(ex2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_head, ex1, ex_calc, ex2)))

        # ════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ════════════════════════════════════════════════════════════════
        s_head = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.42)

        s1 = VGroup(
            Text("有限长螺线管：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"B=\dfrac{\mu_0 nI}{2}(\cos\beta_1-\cos\beta_2)", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("无限长螺线管：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"B=\mu_0 nI", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.15)

        s3 = Text("内部磁场均匀，方向平行轴线；两端向外弯曲（边缘效应）",
                  font=CJK, color=GREEN).scale(0.43)

        s4 = VGroup(
            Text("n = 匝数密度  ", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"(\mathrm{turns/m})", color=CYAN).scale(0.60),
            Text("，I = 电流，右手定则定方向", font=CJK, color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.08)

        summary_grp = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary_grp.next_to(s_head, DOWN, buff=0.40)
        summary_grp.scale_to_fit_width(12.0)
        box_s = SurroundingRectangle(summary_grp, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s_head))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box_s))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_head, summary_grp, box_s, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch08Kp4SolenoidInteriorField",
        "id": "phys-ch08-8.2-kp4-solenoid-interior-field",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "载流螺线管内部匀强磁场",
        "description": "通过叠加圆环磁场曲线（ValueTracker 5→100匝）直觉化演示内部匀强过程，推导有限长公式 B=(μ₀nI/2)(cosβ₁-cosβ₂)，取无限长极限得 B=μ₀nI，并绘制磁感应线截面图。",
    },
]
