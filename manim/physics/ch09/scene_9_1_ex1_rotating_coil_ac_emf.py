"""第 9.1 节 · 例题：匀强磁场中旋转线圈的感应电动势（交流电原理）。

可视化方案：
  - 左侧：矩形线圈在均匀磁场（蓝色水平箭头）中绕中心轴匀速旋转，
    用 ValueTracker(theta) + always_redraw 驱动线圈投影形变，
    并在线圈上用小箭头动态标注感应电流方向。
  - 右侧：双坐标轴实时绘制磁通量 Φ(t)（蓝色）和感应电动势 ε(t)（红色），
    两曲线相差 π/2 用 CYAN 虚线标出。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ── 物理参数 ──────────────────────────────────────────────────────────────────
OMEGA = 1.2        # 角速度 rad/s（动画用）
N_TURNS = 100      # 匝数（标签用）
B_VAL = 0.5        # 磁感应强度（T，标签用）
S_VAL = 0.02       # 面积（m²，标签用）
T_TOTAL = 2 * math.pi / OMEGA   # 一个周期


class Ch09Ex1RotatingCoilAcEmf(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════════
        title = Text("匀强磁场中旋转线圈的感应电动势", font=CJK, color=BLUE).scale(0.60).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.1 例题", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════════════
        a1 = Text("发电机的核心：线圈在磁场中不停转动，", font=CJK).scale(0.48)
        a2 = Text("转动过程中穿过线圈的磁通量不断变化，", font=CJK).scale(0.48)
        a3 = Text("由此产生的感应电动势随时间正弦变化——这就是交流电！", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 3: 物理模型参数定义（逐行出现 + 高亮）
        # ═══════════════════════════════════════════════════════════════════════
        def_title = Text("模型参数", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_title))

        def make_param_row(zh_text, formula_str, color=WHITE):
            zh = Text(zh_text, font=CJK, color=color).scale(0.42)
            fml = MathTex(formula_str, color=color).scale(0.70)
            row = VGroup(zh, fml).arrange(RIGHT, buff=0.25)
            return row

        r1 = make_param_row("匝数：", r"N", YELLOW)
        r2 = make_param_row("磁感应强度（水平向右）：", r"\vec{B}", BLUE)
        r3 = make_param_row("线圈面积：", r"S", GREEN)
        r4 = make_param_row("旋转角速度：", r"\omega", ORANGE)
        r5 = make_param_row("旋转角：", r"\theta = \omega t", WHITE)

        params = VGroup(r1, r2, r3, r4, r5).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        params.next_to(def_title, DOWN, buff=0.35)
        params.scale_to_fit_width(11)

        for row in params:
            self.play(FadeIn(row))
            self.wait(0.5)
        self.wait(1.0)
        self.play(FadeOut(VGroup(def_title, params)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 4: 公式推导（逐步）
        # ═══════════════════════════════════════════════════════════════════════
        deriv_title = Text("公式推导", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        # 磁通量
        flux_label = VGroup(
            Text("磁通量：", font=CJK).scale(0.44),
        )
        flux_eq = MathTex(r"\Phi_B", r"=", r"NBS", r"\cos(\omega t)").scale(0.88)
        flux_eq[0].set_color(BLUE)
        flux_eq[2].set_color(GREEN)
        flux_eq[3].set_color(ORANGE)
        flux_row = VGroup(flux_label, flux_eq).arrange(RIGHT, buff=0.2)
        flux_row.next_to(deriv_title, DOWN, buff=0.45)

        self.play(FadeIn(flux_label), Write(flux_eq))
        self.wait(0.8)

        # 注释：t=0 时 Φ 最大
        note1 = Text("当 θ=0：线圈面与 B 垂直，Φ 取最大值 NBS", font=CJK, color=CYAN).scale(0.40)
        note1.next_to(flux_row, DOWN, buff=0.25)
        self.play(FadeIn(note1))
        self.wait(1.0)

        # 由法拉第定律推导 ε
        faraday = MathTex(r"\varepsilon_i", r"=", r"-\frac{d\Phi_B}{dt}", r"=",
                          r"NBS\omega", r"\sin(\omega t)").scale(0.88)
        faraday[0].set_color(RED)
        faraday[2].set_color(BLUE)
        faraday[4].set_color(GREEN)
        faraday[5].set_color(ORANGE)
        faraday.next_to(note1, DOWN, buff=0.38)
        self.play(Write(faraday[:3]))
        self.wait(0.5)
        self.play(Write(faraday[3:]))
        self.wait(0.8)

        note2 = Text("当 θ=π/2：线圈面与 B 平行，Φ=0，ε 取最大值", font=CJK, color=YELLOW).scale(0.40)
        note2.next_to(faraday, DOWN, buff=0.25)
        self.play(FadeIn(note2))
        self.wait(0.8)

        # 最大值定义
        emax_eq = MathTex(r"\varepsilon_{\max}", r"=", r"NBS\omega").scale(0.88)
        emax_eq[0].set_color(RED)
        emax_eq[2].set_color(GREEN)
        emax_row = VGroup(
            Text("最大电动势：", font=CJK).scale(0.44),
            emax_eq,
        ).arrange(RIGHT, buff=0.2)
        emax_row.next_to(note2, DOWN, buff=0.28)
        self.play(FadeIn(emax_row[0]), Write(emax_eq))
        self.wait(1.2)

        self.play(FadeOut(VGroup(deriv_title, flux_label, flux_eq,
                                 note1, faraday, note2, emax_row)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 5: 核心可视化 —— 线圈旋转 + 双曲线实时追踪
        # ═══════════════════════════════════════════════════════════════════════
        # 布局：左半 = 线圈视图，右半 = 双坐标轴

        # ── 左侧：磁场箭头 ──────────────────────────────────────────────────
        coil_center = LEFT * 3.3 + DOWN * 0.3

        b_arrows = VGroup()
        for dy in [-1.2, -0.6, 0.0, 0.6, 1.2]:
            arr = Arrow(
                start=coil_center + LEFT * 2.0 + UP * dy,
                end=coil_center + RIGHT * 2.0 + UP * dy,
                buff=0,
                color=BLUE,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.15,
            )
            b_arrows.add(arr)
        b_label = VGroup(
            MathTex(r"\vec{B}", color=BLUE).scale(0.65),
        ).next_to(b_arrows, DOWN, buff=0.18)

        self.play(Create(b_arrows), FadeIn(b_label))

        # ── 左侧：旋转线圈（正视图，线圈绕水平轴旋转） ─────────────────────
        # 线圈真实形状：宽 w=2，高 h=1.4（半高）
        # 绕 X 轴旋转：正视图下，宽不变，高度 = h * |cos(θ)|，
        # 当 θ=0：正面最宽（Φ 最大），θ=π/2：变为一条线（Φ=0）

        COIL_W = 1.5   # 半宽
        COIL_H = 1.0   # 半高（θ=0 时）
        theta_t = ValueTracker(0.0)

        def make_coil():
            th = theta_t.get_value()
            # 线圈绕竖直轴（Y轴）旋转：正视图下宽变 = W*|cos θ|
            apparent_w = COIL_W * abs(math.cos(th))
            c = coil_center

            if apparent_w < 0.05:
                # 接近 π/2：退化成竖线
                coil_rect = Line(c + UP * COIL_H, c + DOWN * COIL_H, color=YELLOW, stroke_width=4)
                return coil_rect

            # 矩形四角
            tl = c + np.array([-apparent_w, COIL_H, 0])
            tr = c + np.array([apparent_w, COIL_H, 0])
            bl = c + np.array([-apparent_w, -COIL_H, 0])
            br = c + np.array([apparent_w, -COIL_H, 0])
            rect = Polygon(tl, tr, br, bl, color=YELLOW, stroke_width=4)
            return rect

        coil = always_redraw(make_coil)
        self.play(Create(coil))

        # 旋转轴（竖线）
        axis_line = DashedLine(
            coil_center + UP * 1.4,
            coil_center + DOWN * 1.4,
            color=CYAN, stroke_width=2,
        )
        axis_lbl = Text("转轴", font=CJK, color=CYAN).scale(0.33).next_to(axis_line, RIGHT, buff=0.08)
        self.play(Create(axis_line), FadeIn(axis_lbl))

        # 角度标注
        angle_readout = always_redraw(
            lambda: VGroup(
                Text("θ = ", font=CJK, color=WHITE).scale(0.36),
                MathTex(
                    rf"{theta_t.get_value() % (2*math.pi) * 180 / math.pi:.0f}^\circ",
                    color=ORANGE,
                ).scale(0.50),
            ).arrange(RIGHT, buff=0.1).next_to(coil_center + DOWN * 1.5, DOWN, buff=0.12)
        )
        self.add(angle_readout)

        # 感应电流方向箭头（线圈上边）
        def make_current_arrow():
            th = theta_t.get_value()
            apparent_w = COIL_W * abs(math.cos(th))
            c = coil_center
            # 当 0 < θ < π：电流顺时针（上边向右）
            # 当 π < θ < 2π：电流逆时针（上边向左）
            sign = 1 if (math.sin(th) >= 0) else -1
            if apparent_w < 0.05:
                # 过零点，电流反向，无意义时隐藏
                return VGroup()
            mid_top = c + np.array([0, COIL_H, 0])
            offset = sign * apparent_w * 0.5
            start = mid_top + np.array([-offset * 0.3, 0, 0])
            end = mid_top + np.array([offset * 0.5, 0, 0])
            arr = Arrow(start, end, buff=0, color=RED,
                        stroke_width=3, max_tip_length_to_length_ratio=0.4)
            return arr

        current_arrow = always_redraw(make_current_arrow)
        self.add(current_arrow)

        cur_label = Text("感应电流方向", font=CJK, color=RED).scale(0.33)
        cur_label.next_to(coil_center + UP * COIL_H, UP, buff=0.35)
        self.play(FadeIn(cur_label))

        # ── 右侧：双坐标轴 ─────────────────────────────────────────────────
        axes_right_x = RIGHT * 1.0
        T_SHOW = 2 * math.pi / OMEGA   # 显示一个周期

        # 上方：磁通量 Φ(t)
        ax_phi = Axes(
            x_range=[0, T_SHOW, T_SHOW / 4],
            y_range=[-1.5, 1.5, 1],
            x_length=5.5,
            y_length=1.8,
            axis_config={"color": BLUE_B, "include_tip": True, "include_numbers": False},
        ).shift(axes_right_x + UP * 1.8)

        phi_x_lbl = MathTex(r"t", color=BLUE_B).scale(0.45).next_to(ax_phi.x_axis.get_end(), DOWN, buff=0.12)
        phi_y_lbl = MathTex(r"\Phi_B", color=BLUE).scale(0.52).next_to(ax_phi.y_axis.get_end(), LEFT, buff=0.12)

        # 下方：感应电动势 ε(t)
        ax_emf = Axes(
            x_range=[0, T_SHOW, T_SHOW / 4],
            y_range=[-1.5, 1.5, 1],
            x_length=5.5,
            y_length=1.8,
            axis_config={"color": RED_B, "include_tip": True, "include_numbers": False},
        ).shift(axes_right_x + DOWN * 1.2)

        emf_x_lbl = MathTex(r"t", color=RED_B).scale(0.45).next_to(ax_emf.x_axis.get_end(), DOWN, buff=0.12)
        emf_y_lbl = MathTex(r"\varepsilon_i", color=RED).scale(0.52).next_to(ax_emf.y_axis.get_end(), LEFT, buff=0.12)

        # 右侧标签
        phi_tag = VGroup(
            Text("磁通量", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"\Phi_B = NBS\cos(\omega t)", color=BLUE).scale(0.48),
        ).arrange(DOWN, buff=0.1).next_to(ax_phi, RIGHT, buff=0.15)
        phi_tag.scale_to_fit_width(1.8)

        emf_tag = VGroup(
            Text("感应电动势", font=CJK, color=RED).scale(0.38),
            MathTex(r"\varepsilon_i = NBS\omega\sin(\omega t)", color=RED).scale(0.48),
        ).arrange(DOWN, buff=0.1).next_to(ax_emf, RIGHT, buff=0.15)
        emf_tag.scale_to_fit_width(1.8)

        self.play(
            Create(ax_phi), FadeIn(phi_x_lbl), FadeIn(phi_y_lbl), FadeIn(phi_tag),
            Create(ax_emf), FadeIn(emf_x_lbl), FadeIn(emf_y_lbl), FadeIn(emf_tag),
        )
        self.wait(0.5)

        # ── 实时曲线（ValueTracker 驱动）──────────────────────────────────
        # 用已经过去的时间 t_now = theta / omega 来截断曲线
        def phi_curve_now():
            th = theta_t.get_value()
            t_now = th / OMEGA
            if t_now < 1e-4:
                return VMobject()
            t_end = min(t_now, T_SHOW)
            return ax_phi.plot(
                lambda t: math.cos(OMEGA * t),
                x_range=[0, t_end, min(0.05, t_end)],
                color=BLUE,
                stroke_width=3,
            )

        def emf_curve_now():
            th = theta_t.get_value()
            t_now = th / OMEGA
            if t_now < 1e-4:
                return VMobject()
            t_end = min(t_now, T_SHOW)
            return ax_emf.plot(
                lambda t: math.sin(OMEGA * t),
                x_range=[0, t_end, min(0.05, t_end)],
                color=RED,
                stroke_width=3,
            )

        phi_curve = always_redraw(phi_curve_now)
        emf_curve = always_redraw(emf_curve_now)
        self.add(phi_curve, emf_curve)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 6: 旋转动画（一个完整周期）
        # ═══════════════════════════════════════════════════════════════════════
        anim_label = Text("线圈匀速旋转一周：", font=CJK, color=WHITE).scale(0.40)
        anim_label.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(anim_label))

        self.play(
            theta_t.animate.set_value(2 * math.pi),
            run_time=6,
            rate_func=linear,
        )
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 7: 关键时刻高亮 —— θ=0，Φ最大，ε=0
        # ═══════════════════════════════════════════════════════════════════════
        # 重置到 θ=0
        self.play(theta_t.animate.set_value(0.0), run_time=0.8)
        self.wait(0.3)

        hl1 = VGroup(
            Text("θ = 0：线圈面 ⊥ B，", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"\Phi_B = NBS \ (\text{max})", color=YELLOW).scale(0.58),
            Text("ε = 0", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(RIGHT, buff=0.2)
        hl1.to_edge(DOWN, buff=0.45)
        self.play(FadeOut(anim_label), FadeIn(hl1))
        self.wait(1.2)

        # θ = π/2
        self.play(theta_t.animate.set_value(math.pi / 2), run_time=2.0, rate_func=linear)
        hl2 = VGroup(
            Text("θ = π/2：线圈面 ∥ B，", font=CJK, color=RED).scale(0.42),
            MathTex(r"\Phi_B = 0 \ ,", color=RED).scale(0.58),
            MathTex(r"\varepsilon_i = \varepsilon_{\max}", color=RED).scale(0.58),
        ).arrange(RIGHT, buff=0.2)
        hl2.to_edge(DOWN, buff=0.45)
        self.play(FadeOut(hl1), FadeIn(hl2))
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 8: π/2 相位差虚线标注
        # ═══════════════════════════════════════════════════════════════════════
        # 在上方 Φ 坐标系：Φ=0 的交叉点 t = π/(2ω) = T/4
        t_quarter = T_SHOW / 4
        x_q_phi = ax_phi.c2p(t_quarter, 0)[0]
        x_q_emf = ax_emf.c2p(t_quarter, 0)[0]

        vline_phi = DashedLine(
            ax_phi.c2p(t_quarter, -1.4),
            ax_phi.c2p(t_quarter, 1.4),
            color=CYAN, stroke_width=2, dash_length=0.12,
        )
        vline_emf = DashedLine(
            ax_emf.c2p(t_quarter, -1.4),
            ax_emf.c2p(t_quarter, 1.4),
            color=CYAN, stroke_width=2, dash_length=0.12,
        )
        phase_lbl = VGroup(
            MathTex(r"\Delta\varphi = \frac{\pi}{2}", color=CYAN).scale(0.58),
            Text("相位差", font=CJK, color=CYAN).scale(0.38),
        ).arrange(DOWN, buff=0.1)
        phase_lbl.move_to(ax_phi.c2p(t_quarter, 1.3) + RIGHT * 0.55)

        self.play(
            Create(vline_phi), Create(vline_emf), FadeIn(phase_lbl),
        )
        self.wait(1.2)
        self.play(FadeOut(hl2))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 9: 继续旋转到完整两周（展示交变周期性）
        # ═══════════════════════════════════════════════════════════════════════
        ac_label = Text("电动势随时间正弦变化——这就是交流电（AC）！", font=CJK, color=YELLOW).scale(0.43)
        ac_label.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(ac_label))

        # 重新从 π/2 旋转到 2π（展示后半周期电流反向）
        self.play(
            theta_t.animate.set_value(2 * math.pi),
            run_time=3.5,
            rate_func=linear,
        )
        self.wait(0.8)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 10: 数值例子
        # ═══════════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(VGroup(
                coil, axis_line, axis_lbl, angle_readout, current_arrow, cur_label,
                b_arrows, b_label,
                ax_phi, phi_x_lbl, phi_y_lbl, phi_tag, phi_curve,
                ax_emf, emf_x_lbl, emf_y_lbl, emf_tag, emf_curve,
                vline_phi, vline_emf, phase_lbl,
                ac_label,
            ))
        )

        ex_t = Text("数值例题", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_t))

        ex_given = VGroup(
            Text("已知：N = 100 匝，B = 0.5 T，S = 0.02 m²，ω = 100π rad/s", font=CJK).scale(0.42),
            Text("求：最大电动势 ε_max", font=CJK).scale(0.42),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).next_to(ex_t, DOWN, buff=0.35)
        self.play(FadeIn(ex_given))
        self.wait(0.8)

        ex_calc = MathTex(
            r"\varepsilon_{\max}", r"=", r"NBS\omega",
            r"= 100 \times 0.5 \times 0.02 \times 100\pi",
            r"\approx 314\ \mathrm{V}",
        ).scale(0.72)
        ex_calc[0].set_color(RED)
        ex_calc[2].set_color(GREEN)
        ex_calc[4].set_color(YELLOW)
        ex_calc.next_to(ex_given, DOWN, buff=0.42)
        self.play(Write(ex_calc[:3]))
        self.wait(0.5)
        self.play(Write(ex_calc[3:]))
        self.wait(1.4)

        ex_note = Text("家用 220 V 交流电的峰值约 311 V，与此同量级！", font=CJK, color=GREEN).scale(0.40)
        ex_note.next_to(ex_calc, DOWN, buff=0.28)
        self.play(FadeIn(ex_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_t, ex_given, ex_calc, ex_note)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ═══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        s1 = MathTex(r"\Phi_B = NBS\cos(\omega t)", color=BLUE).scale(0.80)
        s2 = MathTex(r"\varepsilon_i = NBS\omega\sin(\omega t)", color=RED).scale(0.80)
        s3 = MathTex(r"\varepsilon_{\max} = NBS\omega", color=YELLOW).scale(0.80)
        s4 = VGroup(
            Text("Φ 与 ε 相差 π/2 的相位，", font=CJK, color=CYAN).scale(0.42),
            Text("感应电动势随时间正弦变化 = 交流电", font=CJK, color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.12)

        s = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38).next_to(s_title, DOWN, buff=0.42)
        s.scale_to_fit_width(11.5)
        box = SurroundingRectangle(s, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Ex1RotatingCoilAcEmf",
        "id": "phys-ch09-9.1-ex1-rotating-coil-ac-emf",
        "chapterId": "ch09",
        "sectionId": "9.1",
        "title": "匀强磁场中旋转线圈的感应电动势",
        "description": "正视图线圈旋转 + 双坐标轴实时追踪 Φ(t) 和 ε(t)，演示两者 π/2 相位差与交流电产生原理。",
    },
]
