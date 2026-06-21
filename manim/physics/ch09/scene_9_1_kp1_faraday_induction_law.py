"""第 9.1 节 · 法拉第电磁感应定律（矢量场 + 函数曲线 + ValueTracker 扫动）。

三幕结构：
  第一幕 —— 矩形回路 + 均匀磁场，B 增大 → 磁感线密度增加 → Φ=BS 曲线同步绘制
  第二幕 —— Φ(t) 曲线的切线/斜率 dΦ/dt → 导出 ε_i = -dΦ/dt，强调负号
  第三幕 —— N 匝线圈叠放，磁链 Ψ=NΦ → ε_i = -N·dΦ/dt

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch09Kp1FaradayInductionLaw(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("法拉第电磁感应定律", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════════
        analogy1 = Text("1831年，法拉第把一块磁铁插入线圈——", font=CJK).scale(0.5)
        analogy2 = Text("磁铁动时，电流计指针偏转；磁铁不动时，电流为零。", font=CJK).scale(0.5)
        analogy3 = Text("关键不是「有没有磁场」，而是「磁通量有没有在变化」。",
                        font=CJK, color=ORANGE).scale(0.5)
        ana = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(analogy1))
        self.wait(0.8)
        self.play(FadeIn(analogy2))
        self.wait(0.8)
        self.play(FadeIn(analogy3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 第一幕 —— 矩形回路 + 磁场 + ValueTracker 控制 B
        # ═══════════════════════════════════════════════════════════════════
        act1_label = Text("第一幕：磁通量 = B × 面积", font=CJK, color=YELLOW).scale(0.48)
        act1_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(act1_label))
        self.wait(0.6)

        # 矩形回路
        loop_w, loop_h = 3.5, 2.0
        loop = Rectangle(width=loop_w, height=loop_h, color=WHITE, stroke_width=3)
        loop.shift(LEFT * 1.8 + DOWN * 0.6)
        loop_label = Text("闭合回路 S", font=CJK, color=WHITE).scale(0.38)
        loop_label.next_to(loop, DOWN, buff=0.18)
        self.play(Create(loop), FadeIn(loop_label))

        # ValueTracker 控制 B 的大小（对应磁感线密度）
        B_tracker = ValueTracker(1.0)

        # 磁感线：始终重绘的均匀向上箭头网格
        def make_b_arrows():
            arrows = VGroup()
            lc = loop.get_center()
            nx, ny = 4, 3
            density = B_tracker.get_value()  # 1 ~ 3
            cols = int(nx + density)          # 列数随 B 增加
            rows = int(ny + density - 1)
            xs = np.linspace(lc[0] - loop_w / 2 + 0.35, lc[0] + loop_w / 2 - 0.35, cols)
            ys = np.linspace(lc[1] - loop_h / 2 + 0.25, lc[1] + loop_h / 2 - 0.25, rows)
            length = 0.38 + 0.04 * density
            for x in xs:
                for y in ys:
                    arr = Arrow(
                        start=np.array([x, y - length / 2, 0]),
                        end=np.array([x, y + length / 2, 0]),
                        buff=0,
                        color=BLUE,
                        stroke_width=2.5,
                        max_tip_length_to_length_ratio=0.35,
                    )
                    arrows.add(arr)
            return arrows

        b_arrows = always_redraw(make_b_arrows)
        b_label_zh = Text("磁感线（向上，均匀分布）", font=CJK, color=BLUE).scale(0.38)
        b_label_zh.next_to(loop, UP, buff=0.2)
        self.play(FadeIn(b_arrows), FadeIn(b_label_zh))
        self.wait(0.5)

        # B 数值读数
        b_readout = always_redraw(
            lambda: VGroup(
                Text("B =", font=CJK, color=CYAN).scale(0.42),
                MathTex(rf"{B_tracker.get_value():.1f}", r"\,\mathrm{T}", color=CYAN).scale(0.55),
            ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.5)
        )
        self.add(b_readout)

        # 右侧：Φ(t) 实时曲线
        phi_axes = Axes(
            x_range=[0, 3.2, 1],
            y_range=[0, 4.2, 1],
            x_length=3.8,
            y_length=2.6,
            axis_config={"color": GRAY, "include_tip": True, "stroke_width": 1.5},
        ).shift(RIGHT * 2.8 + DOWN * 0.7)
        x_lbl = MathTex(r"t", color=GRAY).scale(0.48).next_to(phi_axes.x_axis.get_end(), DOWN, buff=0.12)
        phi_lbl = MathTex(r"\Phi_B", color=ORANGE).scale(0.55).next_to(phi_axes.y_axis.get_end(), LEFT, buff=0.1)
        phi_eq = VGroup(
            MathTex(r"\Phi_B", r"=", r"B \cdot S", color=WHITE).scale(0.55),
        )
        phi_eq.next_to(phi_axes, UP, buff=0.15)
        self.play(Create(phi_axes), FadeIn(x_lbl), FadeIn(phi_lbl), FadeIn(phi_eq))

        # 动态绘制 Φ(t) = B(t)*S，B 从 1→3
        S_area = loop_w * loop_h  # 面积（场景单位，仅比例示意）
        # 用 ValueTracker 驱动时间，B 线性从1到3
        time_tracker = ValueTracker(0.0)
        T_total = 2.8  # B 从1到3经过的时间

        def b_of_t(t):
            return 1.0 + 2.0 * min(t, T_total) / T_total

        def phi_curve_fn(t):
            return b_of_t(t) * 1.0  # S=1 归一化，仅显示相对变化

        # 动态曲线：用 always_redraw + time_tracker
        phi_curve = always_redraw(
            lambda: phi_axes.plot(
                lambda t: phi_curve_fn(t),
                x_range=[0, max(0.01, time_tracker.get_value())],
                color=ORANGE,
                stroke_width=3,
            ) if time_tracker.get_value() > 0.01 else VMobject()
        )
        self.add(phi_curve)

        # 同步：B 增大，Φ 曲线生长
        hint_grow = Text("B 增大 → 磁通量 Φ 增大", font=CJK, color=ORANGE).scale(0.42)
        hint_grow.next_to(loop, DOWN, buff=0.45)
        self.play(FadeIn(hint_grow))
        self.play(
            B_tracker.animate.set_value(3.0),
            time_tracker.animate.set_value(T_total),
            run_time=3.0,
            rate_func=linear,
        )
        self.wait(0.8)

        # 清场第一幕（保留 title）
        self.play(FadeOut(VGroup(
            loop, loop_label, b_label_zh, b_readout,
            phi_axes, x_lbl, phi_lbl, phi_eq, phi_curve,
            hint_grow, act1_label,
        )))
        # b_arrows 由 always_redraw 管理，需单独移除
        self.remove(b_arrows)
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 第二幕 —— Φ(t) 曲线 + 切线斜率 → ε_i = -dΦ/dt
        # ═══════════════════════════════════════════════════════════════════
        act2_label = Text("第二幕：感应电动势 = 磁通量变化率的负值", font=CJK, color=YELLOW).scale(0.46)
        act2_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(act2_label))
        self.wait(0.5)

        # 建立 Φ(t) 坐标系
        ax2 = Axes(
            x_range=[0, 4.2, 1],
            y_range=[0, 5.0, 1],
            x_length=5.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(LEFT * 1.8 + DOWN * 0.8)
        ax2_xl = MathTex(r"t\,(\mathrm{s})", color=BLUE).scale(0.48).next_to(ax2.x_axis.get_end(), DOWN, buff=0.12)
        ax2_yl = MathTex(r"\Phi_B\,(\mathrm{Wb})", color=BLUE).scale(0.48).next_to(ax2.y_axis.get_end(), LEFT, buff=0.1)
        self.play(Create(ax2), FadeIn(ax2_xl), FadeIn(ax2_yl))

        # 绘制 Φ(t) = 1 + 0.8*t^1.2（先慢后快，体现非线性斜率变化）
        def phi_t(t):
            return 1.0 + 0.8 * (t ** 1.2)

        phi_plot = ax2.plot(phi_t, x_range=[0, 4.0], color=ORANGE, stroke_width=3)
        phi_plot_lbl = MathTex(r"\Phi_B(t)", color=ORANGE).scale(0.55)
        phi_plot_lbl.next_to(ax2.c2p(3.5, phi_t(3.5)), UR, buff=0.1)
        self.play(Create(phi_plot), FadeIn(phi_plot_lbl))
        self.wait(0.8)

        # 取切线：在 t=t0 处显示斜率
        t0_tracker = ValueTracker(1.0)

        def get_tangent_group():
            t0 = t0_tracker.get_value()
            phi0 = phi_t(t0)
            # 数值导数
            dt = 0.01
            dphi_dt = (phi_t(t0 + dt) - phi_t(t0 - dt)) / (2 * dt)
            # 切线段
            t_lo = max(0.05, t0 - 0.9)
            t_hi = min(3.95, t0 + 0.9)
            p1 = ax2.c2p(t_lo, phi0 + dphi_dt * (t_lo - t0))
            p2 = ax2.c2p(t_hi, phi0 + dphi_dt * (t_hi - t0))
            tan_line = Line(p1, p2, color=CYAN, stroke_width=2.5)
            # 切点
            dot = Dot(ax2.c2p(t0, phi0), color=RED, radius=0.10)
            # 斜率标注
            slope_val = MathTex(
                rf"\frac{{d\Phi_B}}{{dt}}\approx{dphi_dt:.2f}\,\mathrm{{Wb/s}}",
                color=CYAN,
            ).scale(0.48)
            slope_val.next_to(ax2.c2p(t_hi, phi0 + dphi_dt * (t_hi - t0)), UR, buff=0.12)
            return VGroup(tan_line, dot, slope_val)

        tangent_grp = always_redraw(get_tangent_group)
        self.play(Create(tangent_grp))
        self.wait(0.6)

        # 切线扫动
        cap_tangent = Text("切线斜率 = dΦ/dt（Φ 变化越快，斜率越大）",
                           font=CJK, color=CYAN).scale(0.4).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(cap_tangent))
        self.play(t0_tracker.animate.set_value(3.2), run_time=3.0, rate_func=smooth)
        self.wait(0.5)
        self.play(t0_tracker.animate.set_value(1.0), run_time=2.0, rate_func=smooth)
        self.wait(0.6)
        self.play(FadeOut(cap_tangent))

        # 导出 ε_i = -dΦ/dt（右侧显示，逐步推导）
        rhs_x = RIGHT * 3.4 + DOWN * 0.5
        step_law1 = VGroup(
            Text("感应电动势：", font=CJK, color=WHITE).scale(0.45),
        ).shift(rhs_x + UP * 1.8)

        step_law2 = MathTex(
            r"\varepsilon_i", r"=", r"-\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}",
            color=WHITE,
        ).scale(0.82).next_to(step_law1, DOWN, buff=0.3)
        step_law2[0].set_color(RED)
        step_law2[2].set_color(YELLOW)

        neg_note = VGroup(
            Text("负号 = 楞次定律：", font=CJK, color=RED).scale(0.4),
            Text("感应电流阻碍磁通量变化", font=CJK, color=RED).scale(0.4),
        ).arrange(DOWN, buff=0.1).next_to(step_law2, DOWN, buff=0.35)

        self.play(FadeIn(step_law1))
        self.wait(0.4)
        self.play(Write(step_law2))
        self.wait(1.0)
        self.play(FadeIn(neg_note))
        self.wait(1.5)

        # 清场第二幕
        self.remove(tangent_grp)
        self.play(FadeOut(VGroup(
            act2_label, ax2, ax2_xl, ax2_yl,
            phi_plot, phi_plot_lbl,
            step_law1, step_law2, neg_note,
        )))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 第三幕 —— N 匝线圈 → 磁链 Ψ = NΦ → ε_i = -N dΦ/dt
        # ═══════════════════════════════════════════════════════════════════
        act3_label = Text("第三幕：N 匝线圈与磁链", font=CJK, color=YELLOW).scale(0.48)
        act3_label.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(act3_label))
        self.wait(0.5)

        # 分层叠放 N 个矩形，表示 N 匝线圈
        N = 5
        coil_group = VGroup()
        base_pos = LEFT * 3.0 + DOWN * 0.4
        r_w, r_h = 2.8, 1.6
        for i in range(N):
            offset = np.array([i * 0.14, i * 0.12, 0])
            rect = Rectangle(
                width=r_w, height=r_h,
                stroke_color=interpolate_color(BLUE, GREEN, i / (N - 1)),
                stroke_width=2.5,
                fill_color=interpolate_color(BLUE, GREEN, i / (N - 1)),
                fill_opacity=0.06,
            )
            rect.move_to(base_pos + offset)
            coil_group.add(rect)

        n_label = VGroup(
            Text("N 匝线圈（N =", font=CJK, color=WHITE).scale(0.42),
            MathTex(str(N), color=YELLOW).scale(0.55),
            Text("）", font=CJK, color=WHITE).scale(0.42),
        ).arrange(RIGHT, buff=0.06)
        n_label.next_to(coil_group, DOWN, buff=0.25)

        self.play(LaggedStart(*[Create(r) for r in coil_group], lag_ratio=0.15), run_time=1.8)
        self.play(FadeIn(n_label))
        self.wait(0.6)

        # 磁感线穿过所有匝
        def make_n_arrows():
            arrows = VGroup()
            center = base_pos + np.array([(N - 1) * 0.14 / 2, (N - 1) * 0.12 / 2, 0])
            cols, rows = 3, 2
            xs = np.linspace(center[0] - r_w / 2 + 0.5, center[0] + r_w / 2 - 0.5, cols)
            ys = np.linspace(center[1] - r_h / 2 + 0.28, center[1] + r_h / 2 - 0.28, rows)
            for x in xs:
                for y in ys:
                    arr = Arrow(
                        start=np.array([x, y - 0.3, 0]),
                        end=np.array([x, y + 0.3, 0]),
                        buff=0,
                        color=BLUE,
                        stroke_width=2.0,
                        max_tip_length_to_length_ratio=0.35,
                    )
                    arrows.add(arr)
            return arrows

        n_arrows = make_n_arrows()
        b_note = Text("同一磁场穿过每一匝", font=CJK, color=BLUE).scale(0.38)
        b_note.next_to(coil_group, UP, buff=0.2)
        self.play(FadeIn(n_arrows), FadeIn(b_note))
        self.wait(0.7)

        # 右侧：逐步淡入磁链 Ψ = NΦ → ε = -N dΦ/dt
        psi_def = VGroup(
            Text("磁链：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\Psi = N\Phi_B", color=ORANGE).scale(0.82),
        ).arrange(RIGHT, buff=0.15)
        psi_def.shift(RIGHT * 2.5 + UP * 1.2)

        psi_note = Text("每匝磁通量相同时，磁链 = N × 单匝磁通量",
                        font=CJK, color=ORANGE).scale(0.4)
        psi_note.next_to(psi_def, DOWN, buff=0.28)

        emf_n = MathTex(
            r"\varepsilon_i", r"=", r"-N\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}",
            color=WHITE,
        ).scale(0.9)
        emf_n[0].set_color(RED)
        emf_n[2].set_color(YELLOW)
        emf_n.next_to(psi_note, DOWN, buff=0.45)

        psi_alt = VGroup(
            Text("等价于：", font=CJK, color=WHITE).scale(0.4),
            MathTex(r"\varepsilon_i = -\frac{\mathrm{d}\Psi}{\mathrm{d}t}", color=GREEN).scale(0.78),
        ).arrange(RIGHT, buff=0.12).next_to(emf_n, DOWN, buff=0.3)

        self.play(FadeIn(psi_def))
        self.wait(0.8)
        self.play(FadeIn(psi_note))
        self.wait(0.8)
        self.play(Write(emf_n))
        self.wait(0.8)
        self.play(FadeIn(psi_alt))
        self.wait(1.2)

        # 清场第三幕
        self.play(FadeOut(VGroup(
            act3_label, coil_group, n_label, n_arrows, b_note,
            psi_def, psi_note, emf_n, psi_alt,
        )))
        self.wait(0.3)

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: 数值例子
        # ═══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.4)
        ex1 = Text("单匝线圈，B 在 0.5 s 内从 0.2 T 均匀增至 0.8 T，面积 S = 0.1 m²", font=CJK).scale(0.42)
        ex1.next_to(ex_title, DOWN, buff=0.35)

        ex_calc1 = MathTex(
            r"\Delta\Phi_B = \Delta B \cdot S = (0.8-0.2)\times 0.1 = 0.06\,\mathrm{Wb}",
        ).scale(0.62).next_to(ex1, DOWN, buff=0.3)

        ex_calc2 = MathTex(
            r"\varepsilon_i = -\frac{\Delta\Phi_B}{\Delta t} = -\frac{0.06}{0.5} = -0.12\,\mathrm{V}",
            color=GREEN,
        ).scale(0.68).next_to(ex_calc1, DOWN, buff=0.28)

        ex_note = Text("绝对值 0.12 V，负号说明感应电动势阻碍 B 增大",
                       font=CJK, color=GREEN).scale(0.42).next_to(ex_calc2, DOWN, buff=0.28)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1))
        self.wait(0.6)
        self.play(Write(ex_calc1))
        self.wait(0.6)
        self.play(Write(ex_calc2))
        self.wait(0.6)
        self.play(FadeIn(ex_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex1, ex_calc1, ex_calc2, ex_note)))
        self.wait(0.3)

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 小结卡（关键公式汇总 + 方框）
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.4)

        s1_row = VGroup(
            Text("磁通量：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\Phi_B = \iint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.12)

        s2_row = VGroup(
            Text("法拉第定律：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\varepsilon_i = -\dfrac{\mathrm{d}\Phi_B}{\mathrm{d}t}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.12)

        s3_row = VGroup(
            Text("N 匝线圈：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\varepsilon_i = -N\dfrac{\mathrm{d}\Phi_B}{\mathrm{d}t}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.12)

        s4 = Text("负号体现楞次定律：感应效果永远阻碍引起它的磁通量变化",
                  font=CJK, color=GREEN).scale(0.42)

        summary_group = VGroup(s1_row, s2_row, s3_row, s4).arrange(DOWN, buff=0.42)
        summary_group.next_to(s_title, DOWN, buff=0.45)
        summary_group.scale_to_fit_width(12)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_row))
        self.wait(0.5)
        self.play(Write(s2_row))
        self.wait(0.5)
        self.play(Write(s3_row))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp1FaradayInductionLaw",
        "id": "phys-ch09-9.1-kp1-faraday-induction-law",
        "chapterId": "ch09",
        "sectionId": "9.1",
        "title": "法拉第电磁感应定律",
        "description": "三幕结构：磁感线密度+Φ(t)曲线→切线斜率导出ε=-dΦ/dt（负号=楞次定律）→N匝线圈磁链ε=-NdΦ/dt。",
    },
]
