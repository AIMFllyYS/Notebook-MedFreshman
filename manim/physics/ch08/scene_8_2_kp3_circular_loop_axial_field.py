"""第 8.2 节 · 载流圆线圈轴线磁场分布（知识点 KP3）

用 2D 示意图替代 ThreeDScene：
  ① 画圆形线圈截面 + 电流方向 + 电流元 dI → 场点 P → dB 矢量 + 对称相消演示
  ② 逐步推导公式 B = μ₀IR²/[2(R²+x²)^(3/2)]
  ③ Axes 绘制 B(x) 曲线，ValueTracker 拖动场点 x 高亮
  ④ x>>R 远场近似，叠加 1/x³ 虚线对比

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch08Kp3CircularLoopAxialField(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("载流圆线圈轴线上的磁场", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("通电圆形线圈就像一块「圆饼形磁铁」：", font=CJK).scale(0.50)
        ana2 = Text("轴线上的磁场沿轴线方向，且在圆心处最强，", font=CJK).scale(0.50)
        ana3 = Text("越远越弱。今天我们来计算轴上任意点的磁场大小。", font=CJK).scale(0.50)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 几何示意图 — 圆线圈截面 + 电流方向 + 电流元 dI
        # ══════════════════════════════════════════════════════════════════
        # 用两个椭圆截面代表圆形线圈（正视投影），轴线水平
        cx, cy = 0.0, -0.8          # 线圈中心
        R_vis = 1.3                  # 可视化半径

        # 轴线（x轴）
        axis_line = Line(LEFT * 5.5 + DOWN * 0.8, RIGHT * 5.5 + DOWN * 0.8,
                         color=BLUE, stroke_width=1.5)
        axis_lbl = MathTex(r"x").scale(0.55).next_to(axis_line.get_right(), DOWN, buff=0.15)
        x_origin = axis_line.get_left() + RIGHT * 5.5  # center of coil on axis

        # 线圈椭圆（代表圆的正视图）
        coil_color = ORANGE
        coil_ellipse = Ellipse(width=0.55, height=2 * R_vis, color=coil_color, stroke_width=3)
        coil_ellipse.move_to([cx, cy, 0])

        # 电流方向箭头（圆弧上）
        cur_top = Arrow(
            start=np.array([cx - 0.28, cy + R_vis * 0.85, 0]),
            end=np.array([cx + 0.28, cy + R_vis * 0.85, 0]),
            buff=0, color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.35
        )
        cur_bot = Arrow(
            start=np.array([cx + 0.28, cy - R_vis * 0.85, 0]),
            end=np.array([cx - 0.28, cy - R_vis * 0.85, 0]),
            buff=0, color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.35
        )
        cur_lbl = VGroup(
            Text("I", font=CJK, color=RED).scale(0.5)
        ).next_to(cur_top, UP, buff=0.1)

        # 圆心标记
        center_dot = Dot([cx, cy, 0], color=WHITE, radius=0.06)
        center_lbl = Text("O", font=CJK, color=WHITE).scale(0.42).next_to(center_dot, LEFT, buff=0.12)

        # R 标注
        r_line = Line([cx, cy, 0], [cx, cy + R_vis, 0], color=CYAN, stroke_width=2)
        r_lbl = MathTex(r"R").scale(0.55).next_to(r_line, RIGHT, buff=0.1)

        # 场点 P
        P_x = 2.8
        P_dot = Dot([P_x, cy, 0], color=YELLOW, radius=0.10)
        P_lbl = Text("P", font=CJK, color=YELLOW).scale(0.48).next_to(P_dot, UP, buff=0.12)
        x_brace = Line([cx, cy - 0.2, 0], [P_x, cy - 0.2, 0], color=CYAN, stroke_width=1.5)
        x_brace_lbl = MathTex(r"x").scale(0.50).next_to(x_brace, DOWN, buff=0.12)

        # 电流元 dI（线圈顶部小段）
        dI_pos = np.array([cx, cy + R_vis, 0])
        dI_arrow = Arrow(
            dI_pos + np.array([-0.35, 0, 0]),
            dI_pos + np.array([0.35, 0, 0]),
            buff=0, color=RED, stroke_width=4, max_tip_length_to_length_ratio=0.4
        )
        dI_lbl = MathTex(r"Id\vec{l}").scale(0.52).next_to(dI_arrow, UP, buff=0.12)

        # dB 矢量（比奥-萨法尔定律给出方向）
        # dI 在顶部（朝右），到P的向量 r向量斜向右下，dB = dI × r̂，方向斜向右上且偏轴
        # 轴向分量 dBx（水平）+ 法向分量（垂直轴，相消）
        # 简化：dB 箭头从 dI 位置指向 P 并旋转90°近似
        dB_start = dI_pos
        # r vec from dI to P
        r_vec = np.array([P_x - cx, cy - (cy + R_vis), 0])
        r_len = np.linalg.norm(r_vec)
        r_hat = r_vec / r_len
        # dB perpendicular to r_hat, pointing roughly up-right
        perp = np.array([-r_hat[1], r_hat[0], 0])  # rotate 90° CCW
        dB_end = dB_start + perp * 1.0
        dB_arrow = Arrow(dB_start, dB_end, buff=0,
                         color=GREEN, stroke_width=4, max_tip_length_to_length_ratio=0.35)
        dB_lbl = MathTex(r"d\vec{B}").scale(0.52).next_to(dB_end, UP, buff=0.08)

        # 轴向分量 dBx
        dBx_end = np.array([dB_end[0], dB_start[1], 0])
        dBx_arrow = Arrow(dB_start, dBx_end, buff=0,
                          color=CYAN, stroke_width=3, max_tip_length_to_length_ratio=0.35)
        dBx_lbl = MathTex(r"dB_x").scale(0.48).next_to(dBx_end, RIGHT, buff=0.1)

        # 垂直分量 dB_perp
        dBperp_end = np.array([dB_start[0], dB_end[1], 0])
        dBperp_arrow = Arrow(dB_start, dBperp_end, buff=0,
                             color=PINK, stroke_width=3, max_tip_length_to_length_ratio=0.35)
        dBperp_lbl_zh = Text("(相消)", font=CJK, color=PINK).scale(0.38)
        dBperp_lbl = VGroup(MathTex(r"dB_\perp").scale(0.48), dBperp_lbl_zh).arrange(RIGHT, buff=0.08)
        dBperp_lbl.next_to(dBperp_end, LEFT, buff=0.12)

        # theta 角标注
        theta_arc = Arc(radius=0.38, angle=math.atan2(abs(perp[1]), abs(perp[0])),
                        start_angle=0, color=WHITE, stroke_width=1.5).move_to(dB_start)
        theta_lbl = MathTex(r"\theta").scale(0.48).next_to(theta_arc, RIGHT, buff=0.05)

        geo_cap = Text("对称性：垂直轴的分量两两抵消，只有轴向分量叠加",
                       font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)

        # 播放几何图
        self.play(Create(axis_line), FadeIn(axis_lbl))
        self.play(Create(coil_ellipse), FadeIn(cur_top), FadeIn(cur_bot), FadeIn(cur_lbl))
        self.play(FadeIn(center_dot), FadeIn(center_lbl), Create(r_line), FadeIn(r_lbl))
        self.wait(0.5)
        self.play(FadeIn(P_dot), FadeIn(P_lbl), Create(x_brace), FadeIn(x_brace_lbl))
        self.wait(0.6)
        self.play(GrowArrow(dI_arrow), FadeIn(dI_lbl))
        self.wait(0.6)
        self.play(GrowArrow(dB_arrow), FadeIn(dB_lbl))
        self.wait(0.6)
        self.play(GrowArrow(dBx_arrow), FadeIn(dBx_lbl),
                  GrowArrow(dBperp_arrow), FadeIn(dBperp_lbl))
        self.play(FadeIn(theta_arc), FadeIn(theta_lbl))
        self.play(FadeIn(geo_cap))
        self.wait(1.8)

        geo_group = VGroup(
            axis_line, axis_lbl, coil_ellipse, cur_top, cur_bot, cur_lbl,
            center_dot, center_lbl, r_line, r_lbl,
            P_dot, P_lbl, x_brace, x_brace_lbl,
            dI_arrow, dI_lbl, dB_arrow, dB_lbl,
            dBx_arrow, dBx_lbl, dBperp_arrow, dBperp_lbl,
            theta_arc, theta_lbl, geo_cap
        )
        self.play(FadeOut(geo_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 对称性说明 — 旋转一圈，垂直分量相消
        # ══════════════════════════════════════════════════════════════════
        sym_title = Text("对称性分析", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        sym1 = Text("取线圈上对径两侧的电流元 dI 和 dI'", font=CJK).scale(0.46)
        sym2 = Text("它们对 P 点的 dB 和 dB'，垂直轴分量方向相反 → 相消", font=CJK).scale(0.46)
        sym3 = Text("沿轴分量方向相同 → 叠加", font=CJK, color=GREEN).scale(0.46)
        sym4 = VGroup(
            Text("整个线圈积分后，只剩轴向磁场：", font=CJK).scale(0.46),
        )
        sym_form = MathTex(r"B = \oint dB_x = \oint dB\sin\theta").scale(0.85)
        sym_group = VGroup(sym1, sym2, sym3, sym4, sym_form).arrange(DOWN, buff=0.28)
        sym_group.next_to(sym_title, DOWN, buff=0.35)

        self.play(FadeIn(sym_title))
        self.play(FadeIn(sym1))
        self.wait(0.8)
        self.play(FadeIn(sym2))
        self.wait(0.8)
        self.play(FadeIn(sym3))
        self.wait(0.6)
        self.play(FadeIn(sym4))
        self.play(Write(sym_form))
        self.wait(1.6)
        self.play(FadeOut(VGroup(sym_title, sym_group)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 逐步推导公式
        # ══════════════════════════════════════════════════════════════════
        deriv_title = Text("积分推导", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        # 比奥-萨法尔
        biot = MathTex(r"dB", r"=", r"\frac{\mu_0 I}{4\pi}", r"\frac{dl}{r^2}").scale(0.88)
        biot.next_to(deriv_title, DOWN, buff=0.38)
        biot[0].set_color(GREEN)
        biot[2].set_color(YELLOW)
        self.play(Write(biot))
        self.wait(0.9)

        # 几何关系：r² = R² + x², sinθ = R/r
        geom = MathTex(
            r"r^2 = R^2 + x^2, \quad \sin\theta = \frac{R}{r} = \frac{R}{\sqrt{R^2+x^2}}"
        ).scale(0.78)
        geom.next_to(biot, DOWN, buff=0.35)
        geom.set_color(CYAN)
        self.play(Write(geom))
        self.wait(1.0)

        # dBx = dB sinθ
        dBx_eq = MathTex(
            r"dB_x = dB \sin\theta =", r"\frac{\mu_0 I}{4\pi}", r"\frac{R\,dl}{(R^2+x^2)^{3/2}}"
        ).scale(0.82)
        dBx_eq.next_to(geom, DOWN, buff=0.35)
        dBx_eq[1].set_color(YELLOW)
        dBx_eq[2].set_color(GREEN)
        self.play(Write(dBx_eq))
        self.wait(1.0)

        # 积分 dl = 2πR
        integ = MathTex(r"\oint dl = 2\pi R").scale(0.82)
        integ.next_to(dBx_eq, DOWN, buff=0.32)
        integ.set_color(ORANGE)
        self.play(Write(integ))
        self.wait(0.8)

        # 最终结果高亮
        result = MathTex(
            r"B = \frac{\mu_0 I R^2}{2\left(R^2+x^2\right)^{3/2}}"
        ).scale(1.0).set_color(YELLOW)
        result.next_to(integ, DOWN, buff=0.38)
        result_box = SurroundingRectangle(result, color=YELLOW, buff=0.15, corner_radius=0.10)
        self.play(Write(result))
        self.play(Create(result_box))
        self.wait(2.0)

        self.play(FadeOut(VGroup(deriv_title, biot, geom, dBx_eq, integ, result_box)))
        # 保留 result，移上去
        self.play(result.animate.scale(0.62).next_to(title, DOWN, buff=0.35))
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: B(x) 曲线 + ValueTracker 高亮场点
        # ══════════════════════════════════════════════════════════════════
        R_val = 1.0   # 令 μ₀I/(2R)=1 归一化

        def B_func(x_val):
            return R_val**2 / (2 * (R_val**2 + x_val**2) ** 1.5)

        B0 = B_func(0)  # = 0.5  (归一化)

        axes = Axes(
            x_range=[-4.2, 4.2, 1],
            y_range=[0, 0.55, 0.1],
            x_length=10,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [-4, -2, 0, 2, 4]},
            y_axis_config={"numbers_to_include": []},
        ).shift(DOWN * 1.3)

        x_ax_lbl = MathTex(r"x/R").scale(0.52).next_to(axes.x_axis.get_right(), DOWN, buff=0.18)
        y_ax_lbl = MathTex(r"B").scale(0.52).next_to(axes.y_axis.get_top(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_ax_lbl), FadeIn(y_ax_lbl))

        # 绘制 B(x) 曲线（去除 x=0 附近 Axes 的缩放问题用分段）
        b_curve = axes.plot(
            lambda x: R_val**2 / (2 * (R_val**2 + x**2) ** 1.5),
            x_range=[-4.0, 4.0, 0.02],
            color=YELLOW,
            stroke_width=3,
        )
        self.play(Create(b_curve), run_time=1.5)
        self.wait(0.5)

        # ValueTracker: 场点 x 从 -4 到 4
        x_tracker = ValueTracker(-4.0)

        def get_highlight_dot():
            xv = x_tracker.get_value()
            bv = R_val**2 / (2 * (R_val**2 + xv**2) ** 1.5)
            return Dot(axes.c2p(xv, bv), color=RED, radius=0.12)

        def get_x_vline():
            xv = x_tracker.get_value()
            bv = R_val**2 / (2 * (R_val**2 + xv**2) ** 1.5)
            return DashedLine(
                axes.c2p(xv, 0), axes.c2p(xv, bv),
                color=CYAN, stroke_width=2
            )

        def get_readout():
            xv = x_tracker.get_value()
            bv = R_val**2 / (2 * (R_val**2 + xv**2) ** 1.5)
            xv_str = f"{xv:.1f}"
            bv_str = f"{bv:.3f}"
            return VGroup(
                MathTex(rf"x/R = {xv_str}", color=CYAN).scale(0.55),
                MathTex(rf"B = {bv_str}\,\frac{{\mu_0 I}}{{2R}}", color=RED).scale(0.55),
            ).arrange(DOWN, buff=0.15).to_corner(UR, buff=0.7)

        h_dot = always_redraw(get_highlight_dot)
        x_vline = always_redraw(get_x_vline)
        readout = always_redraw(get_readout)

        self.play(FadeIn(h_dot), Create(x_vline), FadeIn(readout))
        self.wait(0.3)

        scan_cap = Text("拖动场点 x：磁场从远处增强，在圆心处达到峰值，再减弱",
                        font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(scan_cap))

        # 扫动：从 -4 到 4
        self.play(x_tracker.animate.set_value(4.0), run_time=5, rate_func=linear)
        self.wait(0.6)
        # 定格在 x=0 处
        self.play(x_tracker.animate.set_value(0.0), run_time=1.5)
        self.wait(0.5)

        # 标注圆心处极大值 B₀
        B0_dot = Dot(axes.c2p(0, B0), color=YELLOW, radius=0.13)
        B0_label = VGroup(
            MathTex(r"B_0").scale(0.58).set_color(YELLOW),
            MathTex(r"=\frac{\mu_0 I}{2R}").scale(0.55).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.06)
        B0_label.next_to(axes.c2p(0, B0), UR, buff=0.18)
        self.play(FadeIn(B0_dot), Write(B0_label))
        self.wait(1.4)

        self.play(FadeOut(VGroup(h_dot, x_vline, readout, scan_cap, B0_dot, B0_label)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 远场近似 x>>R，叠加 1/x³ 虚线
        # ══════════════════════════════════════════════════════════════════
        far_cap = VGroup(
            Text("远场近似：当", font=CJK).scale(0.46),
            MathTex(r"x \gg R").scale(0.60),
        ).arrange(RIGHT, buff=0.1)

        far_form = VGroup(
            MathTex(r"B \approx \frac{\mu_0 I R^2}{2x^3}").scale(0.78).set_color(ORANGE),
            VGroup(
                Text("（磁偶极子：", font=CJK).scale(0.44),
                MathTex(r"B \propto 1/x^3").scale(0.55).set_color(ORANGE),
                Text("衰减）", font=CJK).scale(0.44),
            ).arrange(RIGHT, buff=0.08),
        ).arrange(DOWN, buff=0.18)

        far_group = VGroup(far_cap, far_form).arrange(DOWN, buff=0.22)
        far_group.next_to(result, DOWN, buff=0.3)

        self.play(FadeIn(far_cap))
        self.play(Write(far_form))
        self.wait(1.0)

        # 在图上叠加 1/x³ 近似曲线（仅正半轴 x≥1.5R）
        dipole_curve_pos = axes.plot(
            lambda x: R_val**2 / (2 * x**3) if x > 0.6 else 0.55,
            x_range=[0.7, 4.0, 0.05],
            color=ORANGE,
            stroke_width=2.5,
        )
        dipole_curve_neg = axes.plot(
            lambda x: R_val**2 / (2 * (-x)**3) if x < -0.6 else 0.55,
            x_range=[-4.0, -0.7, 0.05],
            color=ORANGE,
            stroke_width=2.5,
        )

        # 虚线圈出远场区域 x>2R 正侧
        far_zone_rect = DashedVMobject(
            Rectangle(
                width=axes.c2p(4.0, 0)[0] - axes.c2p(2.0, 0)[0],
                height=axes.c2p(0, 0.16)[1] - axes.c2p(0, 0)[1],
                color=ORANGE,
            ).move_to(
                axes.c2p(3.0, 0.08)
            ),
            num_dashes=28,
        )
        far_lbl = VGroup(
            Text("远场近似", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"B\propto\frac{1}{x^3}", color=ORANGE).scale(0.48),
        ).arrange(DOWN, buff=0.1)
        far_lbl.move_to(axes.c2p(3.3, 0.19))

        self.play(Create(dipole_curve_pos), Create(dipole_curve_neg), run_time=1.5)
        self.play(Create(far_zone_rect))
        self.play(FadeIn(far_lbl))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            far_group, dipole_curve_pos, dipole_curve_neg,
            far_zone_rect, far_lbl, b_curve, axes, x_ax_lbl, y_ax_lbl
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(result, DOWN, buff=0.40)
        ex_q = VGroup(
            Text("单匝圆线圈 I = 2 A，R = 5 cm，求圆心磁场：", font=CJK).scale(0.44),
        )
        ex_calc = MathTex(
            r"B_0 = \frac{\mu_0 I}{2R}"
            r"= \frac{4\pi\times10^{-7}\times 2}{2\times 0.05}"
            r"\approx 2.51\times10^{-5}\ \mathrm{T}"
        ).scale(0.72).set_color(GREEN)
        ex_q2 = VGroup(
            Text("在 x = 2R = 10 cm 处：", font=CJK).scale(0.44),
        )
        ex_calc2 = MathTex(
            r"B = \frac{\mu_0 I R^2}{2(R^2+(2R)^2)^{3/2}}"
            r"= \frac{B_0}{5\sqrt{5}}"
            r"\approx 2.24\times10^{-6}\ \mathrm{T}"
        ).scale(0.68).set_color(GREEN)
        ex_block = VGroup(ex_q, ex_calc, ex_q2, ex_calc2).arrange(DOWN, buff=0.28)
        ex_block.next_to(ex_title, DOWN, buff=0.32)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_q))
        self.play(Write(ex_calc))
        self.wait(0.8)
        self.play(FadeIn(ex_q2))
        self.play(Write(ex_calc2))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_title, ex_block)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(result, DOWN, buff=0.45)
        s1 = MathTex(
            r"B = \frac{\mu_0 I R^2}{2\left(R^2+x^2\right)^{3/2}}", color=YELLOW
        ).scale(0.85)
        s2 = MathTex(
            r"B_0 = \frac{\mu_0 I}{2R} \quad (x=0,\ \text{maximum})", color=YELLOW
        ).scale(0.78)
        s3 = MathTex(
            r"B \approx \frac{\mu_0 I R^2}{2x^3} \quad (x \gg R)", color=ORANGE
        ).scale(0.78)
        s4 = Text("垂直轴分量对称相消，轴线方向分量叠加得总磁场",
                  font=CJK, color=GREEN).scale(0.42)
        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32)
        s_group.next_to(s_title, DOWN, buff=0.38)
        box = SurroundingRectangle(s_group, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s_group, box, result, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch08Kp3CircularLoopAxialField",
        "id": "phys-ch08-8.2-kp3-circular-loop-axial-field",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "载流圆线圈轴线磁场分布",
        "description": "从比奥-萨法尔定律出发，通过对称性分析推导圆线圈轴线磁场公式，ValueTracker 扫动场点演示 B(x) 曲线，并展示远场 1/x³ 磁偶极子近似。",
    },
]
