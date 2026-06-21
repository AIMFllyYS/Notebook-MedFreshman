"""第 7.4 节 · 电偶层、立体角与生物电应用（知识点 2）

分两幕：
  第一幕：曲面电偶层 → 立体角 dΩ → 电势积分 V=kτΩ（ValueTracker 扫动场点 P）
  第二幕：心脏简化模型（闭合电偶层）→ 除极波传播 → ECG 波形实时绘制

铁律：MathTex 内只含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp2DipoleLayerSolidAngle(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("电偶层、立体角与生物电应用", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.4", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比 —— 心电图引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("心电图（ECG）是如何记录心脏电活动的？", font=CJK).scale(0.50)
        ana2 = Text("关键在于：心脏表面是一个「电偶层」——两层等量异号电荷紧贴在一起。",
                    font=CJK).scale(0.44)
        ana3 = Text("每一面元对远处产生电势，累积起来就是体表可测量的信号。",
                    font=CJK, color=GREEN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 电偶层定义（逐步出现）
        # ══════════════════════════════════════════════════════════════════
        def_title = Text("电偶层的定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        d1 = Text("两层紧邻的无限大（或有限）带电面，上下两面带等量异号面电荷密度 ±σ，", font=CJK).scale(0.41)
        d2 = Text("间距 δ → 0，定义电偶层矩（面电偶密度）：", font=CJK).scale(0.41)
        tau_def = MathTex(r"\tau = \sigma \delta", color=YELLOW).scale(1.0)
        d3 = Text("每面元 dS 等效于一个电偶极矩 dp = τ dS（方向由负→正）。",
                  font=CJK).scale(0.41)
        defs = VGroup(d1, d2, tau_def, d3).arrange(DOWN, buff=0.22).next_to(def_title, DOWN, buff=0.32)
        defs.scale_to_fit_width(12.5)
        self.play(FadeIn(def_title))
        self.play(FadeIn(d1))
        self.wait(0.6)
        self.play(FadeIn(d2), Write(tau_def))
        self.wait(0.8)
        self.play(FadeIn(d3))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 电偶层几何图（2D 示意：曲面截面 + ±σ 标注）
        # ══════════════════════════════════════════════════════════════════
        geo_title = Text("电偶层截面示意", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(geo_title))

        # 曲面上层（正面）
        upper_pts = [(-3.2, -0.5, 0), (-2.0, -0.2, 0), (-0.5, 0.1, 0),
                     (1.0, 0.05, 0), (2.2, -0.15, 0), (3.2, -0.4, 0)]
        upper_curve = CubicBezier(
            np.array([-3.2, -0.5, 0]), np.array([-1.5, 0.3, 0]),
            np.array([1.5, 0.3, 0]),  np.array([3.2, -0.4, 0])
        ).set_color(ORANGE).shift(DOWN * 0.3)

        lower_curve = CubicBezier(
            np.array([-3.2, -0.8, 0]), np.array([-1.5, 0.0, 0]),
            np.array([1.5, 0.0, 0]),  np.array([3.2, -0.7, 0])
        ).set_color(BLUE_D).shift(DOWN * 0.3)

        lbl_plus  = Text("+σ (正面)", font=CJK, color=ORANGE).scale(0.40).move_to(np.array([-3.8, -0.5, 0]))
        lbl_minus = Text("-σ (负面)", font=CJK, color=BLUE_D).scale(0.40).move_to(np.array([-3.8, -1.0, 0]))

        # 法向箭头（从负面指向正面 = 偶极矩方向）
        n_arrows = VGroup()
        for xpos in [-1.8, 0.0, 1.8]:
            arr = Arrow(
                start=np.array([xpos, -1.2, 0]),
                end=np.array([xpos, -0.6, 0]),
                buff=0, color=GREEN, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.35
            ).shift(DOWN * 0.3)
            n_arrows.add(arr)
        n_lbl = Text("偶极矩方向 (由-→+)", font=CJK, color=GREEN).scale(0.38).move_to(np.array([0.0, -2.2, 0]))

        # 层厚 δ 标注
        brace_line = DashedLine(np.array([2.5, -1.1, 0]), np.array([2.5, -0.6, 0]), color=CYAN)
        delta_lbl = MathTex(r"\delta", color=CYAN).scale(0.7).next_to(brace_line, RIGHT, buff=0.1)

        # 场点 P
        p_dot = Dot(np.array([4.0, 1.5, 0]), color=RED, radius=0.12)
        p_lbl = Text("P (场点)", font=CJK, color=RED).scale(0.38).next_to(p_dot, RIGHT, buff=0.12)

        # 从面元中心到 P 的箭头
        r_arrow = Arrow(np.array([0.0, -0.45, 0]), np.array([4.0, 1.5, 0]),
                        buff=0.15, color=YELLOW, stroke_width=2,
                        max_tip_length_to_length_ratio=0.18)
        r_lbl = MathTex(r"\vec{r}", color=YELLOW).scale(0.65).move_to(np.array([2.2, 0.7, 0]))

        geo_group = VGroup(upper_curve, lower_curve, lbl_plus, lbl_minus,
                           n_arrows, n_lbl, brace_line, delta_lbl, p_dot, p_lbl, r_arrow, r_lbl)

        self.play(Create(upper_curve), Create(lower_curve))
        self.wait(0.5)
        self.play(FadeIn(lbl_plus), FadeIn(lbl_minus))
        self.play(Create(n_arrows), FadeIn(n_lbl))
        self.wait(0.5)
        self.play(Create(brace_line), Write(delta_lbl))
        self.play(Create(p_dot), FadeIn(p_lbl), Create(r_arrow), Write(r_lbl))
        self.wait(1.5)

        # 层矩公式出现
        tau_box_label = VGroup(
            Text("层矩：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\tau = \sigma\delta", color=YELLOW).scale(0.85)
        ).arrange(RIGHT, buff=0.15).to_corner(UL, buff=0.6).shift(DOWN * 0.9)
        self.play(FadeIn(tau_box_label))
        self.wait(1.2)
        self.play(FadeOut(VGroup(geo_group, geo_title, tau_box_label)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 立体角 dΩ 定义与电势公式推导
        # ══════════════════════════════════════════════════════════════════
        solid_title = Text("立体角与面元电势", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(solid_title))

        sa1 = VGroup(
            Text("面元 dS 对场点 P 张成的立体角：", font=CJK).scale(0.44),
        ).arrange(DOWN).next_to(solid_title, DOWN, buff=0.35)

        domega_eq = MathTex(
            r"\mathrm{d}\Omega = \frac{\cos\theta \,\mathrm{d}S}{r^2}",
            color=YELLOW
        ).scale(0.90).next_to(sa1, DOWN, buff=0.28)

        sa2 = Text("其中 θ 是面元法向 n̂ 与 r 的夹角。", font=CJK).scale(0.44)
        sa2.next_to(domega_eq, DOWN, buff=0.25)

        dv_label = VGroup(
            Text("该面元在 P 处产生的电势：", font=CJK).scale(0.44),
        )
        dv_eq = MathTex(
            r"\mathrm{d}V = \frac{\tau}{4\pi\varepsilon_0}\,\mathrm{d}\Omega",
            color=GREEN
        ).scale(0.90)
        dv_block = VGroup(dv_label, dv_eq).arrange(DOWN, buff=0.18).next_to(sa2, DOWN, buff=0.30)

        total_label = Text("对整个电偶层积分：", font=CJK).scale(0.44)
        total_eq = MathTex(
            r"V = \frac{\tau}{4\pi\varepsilon_0}\,\Omega",
            color=YELLOW
        ).scale(0.95)
        total_block = VGroup(total_label, total_eq).arrange(DOWN, buff=0.18).next_to(dv_block, DOWN, buff=0.30)

        all_sa = VGroup(sa1, domega_eq, sa2, dv_block, total_block)
        all_sa.scale_to_fit_width(12.0)

        self.play(FadeIn(sa1))
        self.wait(0.5)
        self.play(Write(domega_eq))
        self.wait(0.6)
        self.play(FadeIn(sa2))
        self.wait(0.6)
        self.play(FadeIn(dv_label), Write(dv_eq))
        self.wait(0.6)
        self.play(FadeIn(total_label))
        self.play(Write(total_eq))
        total_eq.set_color(YELLOW)
        self.wait(1.4)
        self.play(FadeOut(VGroup(solid_title, all_sa)))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker —— 立体角随场点 P 位置变化的直觉演示
        # ══════════════════════════════════════════════════════════════════
        vt_title = Text("场点 P 移近时，立体角 Ω 变大，电势 V 变大", font=CJK, color=BLUE).scale(0.48)
        vt_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vt_title))

        # 电偶层（简化为水平线段）
        layer_line = Line(np.array([-3.0, -1.5, 0]), np.array([3.0, -1.5, 0]),
                          color=ORANGE, stroke_width=4)
        layer_lbl = Text("电偶层 (τ=常数)", font=CJK, color=ORANGE).scale(0.38).next_to(layer_line, DOWN, buff=0.12)

        # P 点高度由 ValueTracker 控制
        p_height = ValueTracker(2.5)

        p_dot2 = always_redraw(lambda: Dot(
            np.array([0.0, -1.5 + p_height.get_value(), 0]),
            color=RED, radius=0.13
        ))
        p_lbl2 = always_redraw(lambda: Text("P", font=CJK, color=RED).scale(0.50).next_to(
            np.array([0.0, -1.5 + p_height.get_value(), 0]), RIGHT, buff=0.15
        ))

        # 从 P 到层两端的虚线（表示立体角张角）
        def make_angle_lines():
            h = p_height.get_value()
            p_pos = np.array([0.0, -1.5 + h, 0])
            left_end  = np.array([-3.0, -1.5, 0])
            right_end = np.array([3.0, -1.5, 0])
            lL = DashedLine(p_pos, left_end,  color=CYAN, dash_length=0.12, stroke_width=1.8)
            lR = DashedLine(p_pos, right_end, color=CYAN, dash_length=0.12, stroke_width=1.8)
            return VGroup(lL, lR)

        angle_lines = always_redraw(make_angle_lines)

        # 实时显示立体角（2D 中用平面角近似：2*atan(3/h)）和电势
        def omega_val():
            h = max(p_height.get_value(), 0.01)
            return 2.0 * math.atan(3.0 / h)  # 弧度，平面角近似

        omega_readout = always_redraw(lambda: VGroup(
            Text("立体角 Ω ≈ ", font=CJK, color=CYAN).scale(0.44),
            MathTex(rf"{omega_val():.2f}\ \mathrm{{sr}}", color=CYAN).scale(0.70),
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.5))

        v_readout = always_redraw(lambda: VGroup(
            Text("电势 V ∝ Ω = ", font=CJK, color=GREEN).scale(0.44),
            MathTex(rf"{omega_val():.2f}", color=GREEN).scale(0.70),
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.5).shift(DOWN * 0.7))

        hint = Text("拖动 P 点（P 移近→Ω↑→V↑）", font=CJK, color=WHITE).scale(0.40).to_edge(DOWN, buff=0.5)

        self.play(Create(layer_line), FadeIn(layer_lbl))
        self.play(Create(p_dot2), FadeIn(p_lbl2))
        self.play(Create(angle_lines))
        self.add(omega_readout, v_readout)
        self.play(FadeIn(hint))
        self.wait(0.8)

        # 场点移近 → Ω 增大
        self.play(p_height.animate.set_value(0.8), run_time=2.5)
        self.wait(0.8)
        # 场点移远 → Ω 减小
        self.play(p_height.animate.set_value(3.5), run_time=2.5)
        self.wait(0.8)
        self.play(p_height.animate.set_value(2.0), run_time=1.5)
        self.wait(0.8)

        self.play(FadeOut(VGroup(
            vt_title, layer_line, layer_lbl, angle_lines, hint
        )), FadeOut(omega_readout), FadeOut(v_readout), FadeOut(p_dot2), FadeOut(p_lbl2))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 闭合电偶层特例 —— Ω = 0 或 4π
        # ══════════════════════════════════════════════════════════════════
        closed_title = Text("闭合电偶层：重要推论", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(closed_title))

        c1 = Text("场点 P 在闭合电偶层外部：全立体角 Ω = 0  →  V = 0", font=CJK).scale(0.46)
        c2 = Text("场点 P 在闭合电偶层内部：全立体角 Ω = 4π →  V = τ/ε₀", font=CJK).scale(0.46)
        c_eq_out = MathTex(r"V_{\text{out}} = \frac{\tau}{4\pi\varepsilon_0}\cdot 0 = 0", color=CYAN).scale(0.80)
        c_eq_in  = MathTex(r"V_{\text{in}}  = \frac{\tau}{4\pi\varepsilon_0}\cdot 4\pi = \frac{\tau}{\varepsilon_0}", color=YELLOW).scale(0.80)

        closed_group = VGroup(c1, c_eq_out, c2, c_eq_in).arrange(DOWN, buff=0.28).next_to(closed_title, DOWN, buff=0.38)
        closed_group.scale_to_fit_width(12.5)

        self.play(FadeIn(c1), Write(c_eq_out))
        self.wait(0.8)
        self.play(FadeIn(c2), Write(c_eq_in))
        self.wait(1.6)

        # 简单示意图：闭合椭圆 + P 在外/内
        ell = Ellipse(width=2.4, height=1.4, color=ORANGE, stroke_width=2.5).to_edge(RIGHT, buff=1.8).shift(DOWN*0.5)
        p_out_dot = Dot(ell.get_right() + RIGHT * 0.9, color=RED, radius=0.10)
        p_out_lbl = Text("P (外)", font=CJK, color=RED).scale(0.36).next_to(p_out_dot, RIGHT, buff=0.08)
        p_in_dot  = Dot(ell.get_center(), color=GREEN, radius=0.10)
        p_in_lbl  = Text("P (内)", font=CJK, color=GREEN).scale(0.36).next_to(p_in_dot, UP, buff=0.08)

        self.play(Create(ell), Create(p_out_dot), FadeIn(p_out_lbl))
        self.wait(0.6)
        self.play(Create(p_in_dot), FadeIn(p_in_lbl))
        self.wait(1.4)
        self.play(FadeOut(VGroup(closed_title, closed_group, ell, p_out_dot, p_out_lbl, p_in_dot, p_in_lbl)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 第二幕 —— 心脏 ECG 模型
        # ══════════════════════════════════════════════════════════════════
        ecg_title = Text("第二幕：心脏电偶层与心电图（ECG）", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ecg_title))

        intro1 = Text("静息态：细胞膜外正内负 → 心脏是一个闭合电偶层，体表 V = 0。",
                      font=CJK).scale(0.42)
        intro2 = Text("除极（激动）时：一段膜翻转为外负内正，偶极矩方向改变，",
                      font=CJK).scale(0.42)
        intro3 = Text("对应区域立体角贡献变号 → 体表两电极间出现电势差 ΔV，",
                      font=CJK).scale(0.42)
        intro4 = Text("随激动波传播，ΔV(t) 形成心电波形。", font=CJK, color=GREEN).scale(0.42)
        intro_block = VGroup(intro1, intro2, intro3, intro4).arrange(DOWN, buff=0.22).next_to(ecg_title, DOWN, buff=0.38)
        intro_block.scale_to_fit_width(13.0)

        self.play(FadeIn(intro1))
        self.wait(0.6)
        self.play(FadeIn(intro2))
        self.wait(0.5)
        self.play(FadeIn(intro3))
        self.wait(0.5)
        self.play(FadeIn(intro4))
        self.wait(1.4)
        self.play(FadeOut(intro_block))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 心脏模型动画（简化椭圆 + 除极波颜色变化 + ECG 曲线）
        # ══════════════════════════════════════════════════════════════════
        # 左半区：心脏示意图
        heart = Ellipse(width=2.6, height=2.0, color=ORANGE, stroke_width=2.5)
        heart.move_to(np.array([-3.2, -0.6, 0]))

        # 标注：静息态外正内负
        rest_lbl = Text("静息态：外(+)内(-)", font=CJK, color=ORANGE).scale(0.34).next_to(heart, DOWN, buff=0.12)

        # 体表两电极
        elec_A = Dot(np.array([-5.0, 0.8, 0]), color=YELLOW, radius=0.12)
        elec_B = Dot(np.array([-1.2, 0.8, 0]), color=YELLOW, radius=0.12)
        elec_A_lbl = Text("A", font=CJK, color=YELLOW).scale(0.40).next_to(elec_A, UP, buff=0.08)
        elec_B_lbl = Text("B", font=CJK, color=YELLOW).scale(0.40).next_to(elec_B, UP, buff=0.08)
        wire = DashedLine(elec_A.get_center(), elec_B.get_center(), color=YELLOW,
                          dash_length=0.15, stroke_width=1.5)
        v_lbl = VGroup(
            Text("ΔV = V", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"_B - V_A", color=YELLOW).scale(0.60)
        ).arrange(RIGHT, buff=0.05).move_to(np.array([-3.2, 1.4, 0]))

        self.play(Create(heart), FadeIn(rest_lbl))
        self.play(Create(elec_A), FadeIn(elec_A_lbl), Create(elec_B), FadeIn(elec_B_lbl))
        self.play(Create(wire), FadeIn(v_lbl))
        self.wait(0.8)

        # 右半区：ECG 坐标轴
        ecg_ax = Axes(
            x_range=[0, 8, 1], y_range=[-1.2, 1.8, 0.5],
            x_length=5.5, y_length=3.5,
            axis_config={"color": WHITE, "include_tip": True, "stroke_width": 1.5},
        ).move_to(np.array([2.8, -0.5, 0]))
        ax_x_lbl = Text("时间 t", font=CJK, color=WHITE).scale(0.36).next_to(ecg_ax.x_axis.get_right(), RIGHT, buff=0.1)
        ax_y_lbl = Text("ΔV", font=CJK, color=WHITE).scale(0.36).next_to(ecg_ax.y_axis.get_top(), UP, buff=0.05)

        self.play(Create(ecg_ax), FadeIn(ax_x_lbl), FadeIn(ax_y_lbl))
        self.wait(0.5)

        # ECG 波形：分段绘制（P 波、QRS 波群、T 波）
        def ecg_func(t):
            """简化 ECG 波形函数"""
            val = 0.0
            # P 波（心房除极，0.5-1.5s）
            if 0.5 <= t <= 1.5:
                val = 0.5 * math.sin(math.pi * (t - 0.5) / 1.0)
            # QRS 波群（心室除极，2.0-3.2s）
            elif 1.8 <= t <= 2.1:
                val = -0.3 * math.sin(math.pi * (t - 1.8) / 0.3)  # Q 波
            elif 2.1 <= t <= 2.5:
                val = 1.5 * math.sin(math.pi * (t - 2.1) / 0.4)   # R 波
            elif 2.5 <= t <= 2.8:
                val = -0.4 * math.sin(math.pi * (t - 2.5) / 0.3)  # S 波
            # T 波（心室复极，4.0-6.0s）
            elif 4.0 <= t <= 6.0:
                val = 0.7 * math.sin(math.pi * (t - 4.0) / 2.0)
            return val

        ecg_curve = ecg_ax.plot(ecg_func, x_range=[0, 7.8, 0.02], color=GREEN, stroke_width=2.5)

        # 除极波在心脏图上的颜色动画：依次高亮不同扇形区域
        # 用多个弧形表示除极波前沿
        def make_depol_arc(angle_start, angle_span, color=RED_B):
            arc = Arc(
                radius=1.05,
                start_angle=angle_start,
                angle=angle_span,
                arc_center=heart.get_center(),
                color=color,
                stroke_width=6
            )
            return arc

        depol1 = make_depol_arc(PI * 0.3, PI * 0.5, RED_B)   # 第一段
        depol2 = make_depol_arc(-PI * 0.2, PI * 0.5, RED)    # 第二段
        depol3 = make_depol_arc(-PI * 0.7, PI * 0.5, MAROON_B) # 第三段

        # 偶极矩箭头（随除极波方向旋转）
        dipole_arr = Arrow(
            start=heart.get_center() + LEFT * 0.3,
            end=heart.get_center() + RIGHT * 0.8,
            buff=0, color=CYAN, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.30
        )
        dipole_lbl = VGroup(
            Text("合偶极矩", font=CJK, color=CYAN).scale(0.34),
            MathTex(r"\vec{p}", color=CYAN).scale(0.60)
        ).arrange(RIGHT, buff=0.06).next_to(dipole_arr, DOWN, buff=0.08)

        # 逐步绘制 ECG 与心脏除极波
        # 阶段 1：P 波 + 心房除极
        p_wave = ecg_ax.plot(ecg_func, x_range=[0, 2.0, 0.02], color=GREEN, stroke_width=2.5)
        p_wave_lbl = Text("P 波（心房除极）", font=CJK, color=GREEN).scale(0.36)
        p_wave_lbl.next_to(ecg_ax, UP, buff=0.15).shift(LEFT * 1.0)

        self.play(Create(depol1), run_time=1.0)
        self.play(Create(p_wave), FadeIn(p_wave_lbl), Create(dipole_arr), FadeIn(dipole_lbl), run_time=1.5)
        self.wait(0.8)

        # 阶段 2：QRS 波 + 心室除极
        qrs_wave = ecg_ax.plot(ecg_func, x_range=[1.8, 3.5, 0.02], color=YELLOW, stroke_width=2.5)
        qrs_lbl = Text("QRS 波（心室除极，最大）", font=CJK, color=YELLOW).scale(0.36)
        qrs_lbl.next_to(ecg_ax, UP, buff=0.15).shift(RIGHT * 0.5)

        self.play(Create(depol2), run_time=0.8)
        self.play(
            Create(qrs_wave),
            FadeIn(qrs_lbl),
            Rotate(dipole_arr, angle=PI * 0.45, about_point=heart.get_center()),
            run_time=1.5
        )
        self.wait(0.8)

        # 阶段 3：T 波 + 心室复极
        t_wave = ecg_ax.plot(ecg_func, x_range=[3.5, 7.8, 0.02], color=ORANGE, stroke_width=2.5)
        t_wave_lbl = Text("T 波（心室复极）", font=CJK, color=ORANGE).scale(0.36)
        t_wave_lbl.to_corner(DR, buff=0.6).shift(UP * 0.5)

        self.play(Create(depol3), run_time=0.8)
        self.play(
            Create(t_wave),
            FadeIn(t_wave_lbl),
            Rotate(dipole_arr, angle=-PI * 0.2, about_point=heart.get_center()),
            run_time=1.5
        )
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            ecg_title, heart, rest_lbl, elec_A, elec_B, elec_A_lbl, elec_B_lbl,
            wire, v_lbl, ecg_ax, ax_x_lbl, ax_y_lbl,
            p_wave, p_wave_lbl, qrs_wave, qrs_lbl, t_wave, t_wave_lbl,
            depol1, depol2, depol3, dipole_arr, dipole_lbl
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 点电偶极子对比（远场近似）
        # ══════════════════════════════════════════════════════════════════
        dipole_title = Text("远场：等效为点电偶极子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(dipole_title))

        dp1 = Text("当场点 P 远离电偶层时，整个电偶层等效为一个点电偶极子：",
                   font=CJK).scale(0.44)
        dp_eq = MathTex(
            r"V = \frac{1}{4\pi\varepsilon_0}\frac{\vec{p}\cdot\hat{r}}{r^2}",
            color=YELLOW
        ).scale(0.95)
        dp2 = Text("这正是心电图在体表信号较弱的原因：距心脏越远，1/r² 衰减越快。",
                   font=CJK).scale(0.44)

        dp_block = VGroup(dp1, dp_eq, dp2).arrange(DOWN, buff=0.30).next_to(dipole_title, DOWN, buff=0.40)
        dp_block.scale_to_fit_width(12.5)

        # 示意图：点偶极子的等势线（椭圆族）
        dipole_center = np.array([3.0, -0.8, 0])
        dipole_dot = Dot(dipole_center, color=CYAN, radius=0.10)
        dipole_arrow_show = Arrow(
            dipole_center + LEFT * 0.25,
            dipole_center + RIGHT * 0.5,
            buff=0, color=CYAN, stroke_width=2,
            max_tip_length_to_length_ratio=0.35
        )
        eq_lines = VGroup()
        for a_scale in [0.6, 1.0, 1.5]:
            eq_ell = Ellipse(width=a_scale * 1.4, height=a_scale * 0.9,
                             color=CYAN, stroke_width=1.2, stroke_opacity=0.55)
            eq_ell.move_to(dipole_center)
            eq_lines.add(eq_ell)
        p_far = Dot(dipole_center + UP * 1.8 + RIGHT * 0.8, color=RED, radius=0.10)
        p_far_lbl = Text("P (远)", font=CJK, color=RED).scale(0.36).next_to(p_far, RIGHT, buff=0.08)
        r_far = Arrow(dipole_center, p_far.get_center(), buff=0.12, color=YELLOW,
                      stroke_width=1.8, max_tip_length_to_length_ratio=0.25)
        r_far_lbl = MathTex(r"r", color=YELLOW).scale(0.55).next_to(r_far, LEFT, buff=0.05)

        self.play(FadeIn(dp1))
        self.wait(0.5)
        self.play(Write(dp_eq))
        self.wait(0.6)
        self.play(FadeIn(dp2))
        self.play(Create(dipole_dot), Create(dipole_arrow_show), Create(eq_lines))
        self.play(Create(p_far), FadeIn(p_far_lbl), Create(r_far), Write(r_far_lbl))
        self.wait(1.5)
        self.play(FadeOut(VGroup(dipole_title, dp_block, dipole_dot, dipole_arrow_show,
                                  eq_lines, p_far, p_far_lbl, r_far, r_far_lbl)))

        # ══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1 = VGroup(
            Text("层矩：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\tau = \sigma\delta", color=YELLOW).scale(0.80)
        ).arrange(RIGHT, buff=0.15)
        s2 = VGroup(
            Text("面元电势：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\mathrm{d}V = \frac{\tau}{4\pi\varepsilon_0}\,\mathrm{d}\Omega", color=GREEN).scale(0.80)
        ).arrange(RIGHT, buff=0.15)
        s3 = VGroup(
            Text("总电势：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"V = \frac{\tau}{4\pi\varepsilon_0}\,\Omega", color=YELLOW).scale(0.80)
        ).arrange(RIGHT, buff=0.15)
        s4 = VGroup(
            Text("远场近似：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"V = \frac{1}{4\pi\varepsilon_0}\frac{\vec{p}\cdot\hat{r}}{r^2}", color=GREEN).scale(0.80)
        ).arrange(RIGHT, buff=0.15)
        s5 = Text("闭合电偶层：外部 V=0，内部 V=τ/ε₀（心电图物理基础）",
                  font=CJK, color=CYAN).scale(0.42)

        sum_group = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.28).next_to(s_title, DOWN, buff=0.40)
        sum_group.scale_to_fit_width(12.5)
        box = SurroundingRectangle(sum_group, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1), FadeIn(s2))
        self.wait(0.5)
        self.play(FadeIn(s3), FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, sum_group, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch07Kp2DipoleLayerSolidAngle",
        "id": "phys-ch07-7.4-kp2-dipole-layer-solid-angle",
        "chapterId": "ch07",
        "sectionId": "7.4",
        "title": "电偶层、立体角与生物电应用",
        "description": "从电偶层层矩 τ=σδ 出发，推导面元电势 dV=kτdΩ 和积分公式 V=kτΩ，用 ValueTracker 演示立体角随场点位置变化，再以心脏闭合电偶层为例建立 ECG 物理模型并同步绘制心电波形。",
    },
]
