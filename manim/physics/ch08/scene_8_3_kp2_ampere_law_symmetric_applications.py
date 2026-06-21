"""第 8.3 节 · 安培环路定理的对称应用（知识点 KP2）

利用安培环路定理的对称性，对同轴电缆截面分区求磁场分布，
ValueTracker 动态演示回路半径扫动、B-r 完整曲线逐段绘制。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Kp2AmpereLawSymmetricApplications",
        "id": "phys-ch08-8.3-kp2-ampere-law-symmetric-applications",
        "chapterId": "ch08",
        "sectionId": "8.3",
        "title": "安培环路定理的对称应用",
        "description": "以同轴电缆为例，用安培环路定理分四区推导 B(r) 并动画绘制完整 B-r 曲线。",
    },
]


class Ch08Kp2AmpereLawSymmetricApplications(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("安培环路定理的对称应用", font=CJK, color=BLUE).scale(0.68)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第八章 稳恒磁场 · 8.3", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════════
        a1 = Text("想象把一根导线弯成圆形——电流会在周围产生磁场。", font=CJK).scale(0.48)
        a2 = Text("安培环路定理告诉我们：沿任意闭合回路积分磁场，", font=CJK).scale(0.48)
        a3 = Text("结果只取决于回路内穿过的总电流。", font=CJK).scale(0.48)
        a4 = Text("利用对称性，我们只需要选一个合适的圆形回路，", font=CJK).scale(0.48)
        a5 = Text("就能一行公式算出各处磁场大小！", font=CJK, color=YELLOW).scale(0.48)
        analogy = VGroup(a1, a2, a3, a4, a5).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.45)
        analogy.scale_to_fit_width(12)
        for line in analogy:
            self.play(FadeIn(line), run_time=0.6)
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 定理本体（公式逐步出现）
        # ═══════════════════════════════════════════════════════════════════
        def_zh = Text("安培环路定理", font=CJK, color=BLUE).scale(0.55)
        def_zh.next_to(title, DOWN, buff=0.5)
        ampere_law = MathTex(
            r"\oint_L \mathbf{B}\cdot\mathrm{d}\mathbf{l}",
            r"=",
            r"\mu_0 \sum_{\mathrm{enc}} I"
        ).scale(1.0)
        ampere_law.next_to(def_zh, DOWN, buff=0.4)
        ampere_law[0].set_color(CYAN)
        ampere_law[2].set_color(YELLOW)

        self.play(FadeIn(def_zh))
        self.play(Write(ampere_law[0]))
        self.wait(0.6)
        self.play(Write(ampere_law[1]), Write(ampere_law[2]))
        self.wait(0.8)

        # 对称条件说明
        sym_note_zh = Text("对称条件：", font=CJK).scale(0.44)
        sym_note_eq = MathTex(r"B \cdot 2\pi r = \mu_0 I_{\mathrm{enc}}").scale(0.85)
        sym_note = VGroup(sym_note_zh, sym_note_eq).arrange(RIGHT, buff=0.15)
        sym_note.next_to(ampere_law, DOWN, buff=0.38)
        sym_note_eq.set_color(GREEN)
        result_formula = MathTex(r"\Rightarrow B = \frac{\mu_0 I_{\mathrm{enc}}}{2\pi r}").scale(0.9)
        result_formula.next_to(sym_note, DOWN, buff=0.32)
        result_formula.set_color(GREEN)

        self.play(FadeIn(sym_note))
        self.wait(0.7)
        self.play(Write(result_formula))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_zh, ampere_law, sym_note, result_formula)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 三种典型导体结构示意图
        # ═══════════════════════════════════════════════════════════════════
        struct_title = Text("三种典型载流体", font=CJK, color=BLUE).scale(0.52)
        struct_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(struct_title))

        # 实心圆柱
        solid_circle = Circle(radius=0.55, color=ORANGE, fill_color=ORANGE, fill_opacity=0.35)
        solid_dot = Dot(ORIGIN, color=WHITE)
        solid_grp = VGroup(solid_circle, solid_dot)
        solid_label = Text("实心圆柱", font=CJK).scale(0.38)
        solid_label.next_to(solid_grp, DOWN, buff=0.12)
        solid_all = VGroup(solid_grp, solid_label)

        # 空心圆柱
        hollow_outer = Circle(radius=0.55, color=BLUE_C, fill_color=BLUE_C, fill_opacity=0.35)
        hollow_inner = Circle(radius=0.25, color=BLACK, fill_color=BLACK, fill_opacity=1.0)
        hollow_grp = VGroup(hollow_outer, hollow_inner)
        hollow_label = Text("空心圆柱", font=CJK).scale(0.38)
        hollow_label.next_to(hollow_grp, DOWN, buff=0.12)
        hollow_all = VGroup(hollow_grp, hollow_label)

        # 同轴电缆（内芯 + 外壳）
        coax_outer_shell = Circle(radius=0.68, color=RED_C, fill_color=RED_C, fill_opacity=0.25)
        coax_gap = Circle(radius=0.50, color=BLACK, fill_color=BLACK, fill_opacity=1.0)
        coax_inner = Circle(radius=0.28, color=ORANGE, fill_color=ORANGE, fill_opacity=0.7)
        coax_grp = VGroup(coax_outer_shell, coax_gap, coax_inner)
        coax_label = Text("同轴电缆", font=CJK, color=YELLOW).scale(0.38)
        coax_label.next_to(coax_grp, DOWN, buff=0.12)
        coax_all = VGroup(coax_grp, coax_label)

        three = VGroup(solid_all, hollow_all, coax_all).arrange(RIGHT, buff=1.1)
        three.next_to(struct_title, DOWN, buff=0.55)
        three.scale_to_fit_width(11)

        self.play(FadeIn(solid_all), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(hollow_all), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(coax_all), run_time=0.8)
        self.wait(1.2)

        focus_hint = Text("接下来聚焦同轴电缆——最完整、最经典", font=CJK, color=YELLOW).scale(0.44)
        focus_hint.next_to(three, DOWN, buff=0.35)
        self.play(FadeIn(focus_hint))
        self.wait(1.0)
        self.play(FadeOut(VGroup(struct_title, three, focus_hint)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 同轴电缆剖面 — 四区域标注
        # ═══════════════════════════════════════════════════════════════════
        sec_title = Text("同轴电缆截面（习题 8-9）", font=CJK, color=BLUE).scale(0.52)
        sec_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec_title))

        # 参数：R1=内芯外径, R2=外壳内径, R3=外壳外径
        R1_v, R2_v, R3_v = 0.60, 1.10, 1.42
        SCALE = 1.5  # 视觉缩放

        center = DOWN * 0.4 + LEFT * 2.8

        # 绘制各层
        region4 = Circle(radius=R3_v * SCALE, color=GRAY, fill_color=GRAY, fill_opacity=0.12)
        region4.move_to(center)
        region3 = Circle(radius=R3_v * SCALE, color=RED_C, fill_color=RED_C, fill_opacity=0.40)
        region3.move_to(center)
        region2_blank = Circle(radius=R2_v * SCALE, color=BLACK, fill_color=BLACK, fill_opacity=1.0)
        region2_blank.move_to(center)
        region2 = Circle(radius=R2_v * SCALE, color=BLUE_C, fill_color=BLUE_C, fill_opacity=0.08)
        region2.move_to(center)
        region1 = Circle(radius=R1_v * SCALE, color=ORANGE, fill_color=ORANGE, fill_opacity=0.55)
        region1.move_to(center)

        coax_cross = VGroup(region4, region3, region2_blank, region2, region1)
        self.play(FadeIn(coax_cross))
        self.wait(0.5)

        # 半径标注箭头
        arr_R1 = Arrow(center, center + RIGHT * R1_v * SCALE, color=ORANGE,
                       buff=0, stroke_width=2.5, max_tip_length_to_length_ratio=0.2)
        arr_R2 = Arrow(center, center + RIGHT * R2_v * SCALE, color=BLUE_C,
                       buff=0, stroke_width=2.5, max_tip_length_to_length_ratio=0.2)
        arr_R3 = Arrow(center, center + RIGHT * R3_v * SCALE, color=RED_C,
                       buff=0, stroke_width=2.5, max_tip_length_to_length_ratio=0.2)
        lbl_R1 = MathTex(r"R_1", color=ORANGE).scale(0.55)
        lbl_R1.next_to(arr_R1.get_end(), UR, buff=0.08)
        lbl_R2 = MathTex(r"R_2", color=BLUE_C).scale(0.55)
        lbl_R2.next_to(arr_R2.get_end(), UR, buff=0.08)
        lbl_R3 = MathTex(r"R_3", color=RED_C).scale(0.55)
        lbl_R3.next_to(arr_R3.get_end(), UR, buff=0.08)

        self.play(Create(arr_R1), FadeIn(lbl_R1))
        self.play(Create(arr_R2), FadeIn(lbl_R2))
        self.play(Create(arr_R3), FadeIn(lbl_R3))
        self.wait(0.6)

        # 区域文字说明放右侧
        right_x = 1.0
        zone_labels = VGroup(
            VGroup(
                Text("区域", font=CJK).scale(0.38),
                MathTex(r"r < R_1", color=ORANGE).scale(0.5),
                Text("内芯（通电流", font=CJK).scale(0.35),
                MathTex(r"I", color=ORANGE).scale(0.5),
                Text("）", font=CJK).scale(0.35),
            ).arrange(RIGHT, buff=0.06),
            VGroup(
                Text("区域", font=CJK).scale(0.38),
                MathTex(r"R_1 < r < R_2", color=BLUE_C).scale(0.5),
                Text("真空间隙", font=CJK).scale(0.35),
            ).arrange(RIGHT, buff=0.06),
            VGroup(
                Text("区域", font=CJK).scale(0.38),
                MathTex(r"R_2 < r < R_3", color=RED_C).scale(0.5),
                Text("外壳（反向电流", font=CJK).scale(0.35),
                MathTex(r"-I", color=RED_C).scale(0.5),
                Text("）", font=CJK).scale(0.35),
            ).arrange(RIGHT, buff=0.06),
            VGroup(
                Text("区域", font=CJK).scale(0.38),
                MathTex(r"r > R_3", color=GRAY).scale(0.5),
                Text("外部", font=CJK).scale(0.35),
            ).arrange(RIGHT, buff=0.06),
        ).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        zone_labels.move_to(RIGHT * 2.2 + DOWN * 0.4)
        zone_labels.scale_to_fit_width(4.8)

        self.play(FadeIn(zone_labels))
        self.wait(1.8)
        self.play(FadeOut(VGroup(coax_cross, arr_R1, arr_R2, arr_R3,
                                  lbl_R1, lbl_R2, lbl_R3, zone_labels, sec_title)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker — 安培回路动态演示
        # ═══════════════════════════════════════════════════════════════════
        track_title = Text("选取安培回路：圆形路径半径 r 扫动", font=CJK, color=BLUE).scale(0.50)
        track_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(track_title))

        # 重绘截面（较小）
        sc = 1.2
        cx = LEFT * 2.5 + DOWN * 0.5

        bg4 = Circle(radius=R3_v * sc, color=GRAY, fill_color=GRAY, fill_opacity=0.12).move_to(cx)
        bg3 = Circle(radius=R3_v * sc, color=RED_C, fill_color=RED_C, fill_opacity=0.38).move_to(cx)
        bg2b = Circle(radius=R2_v * sc, color=BLACK, fill_color=BLACK, fill_opacity=1.0).move_to(cx)
        bg2 = Circle(radius=R2_v * sc, color=BLUE_C, fill_color=BLUE_C, fill_opacity=0.08).move_to(cx)
        bg1 = Circle(radius=R1_v * sc, color=ORANGE, fill_color=ORANGE, fill_opacity=0.50).move_to(cx)
        cross_sm = VGroup(bg4, bg3, bg2b, bg2, bg1)
        self.play(FadeIn(cross_sm))

        # ValueTracker for r
        r_tracker = ValueTracker(0.25)

        def loop_color(r):
            if r < R1_v:
                return ORANGE
            elif r < R2_v:
                return BLUE_C
            elif r < R3_v:
                return RED_C
            else:
                return GRAY

        def make_loop():
            r = r_tracker.get_value()
            c = loop_color(r)
            loop = DashedVMobject(
                Circle(radius=r * sc, color=c).move_to(cx),
                num_dashes=24
            )
            return loop

        loop_obj = always_redraw(make_loop)
        self.add(loop_obj)

        # 右侧动态文字
        def enc_current_text():
            r = r_tracker.get_value()
            if r < R1_v:
                enc = rf"I_{{\mathrm{{enc}}}} = \frac{{r^2}}{{R_1^2}} I"
            elif r < R2_v:
                enc = r"I_{\mathrm{enc}} = I"
            elif r < R3_v:
                frac = (r ** 2 - R2_v ** 2) / (R3_v ** 2 - R2_v ** 2)
                enc = rf"I_{{\mathrm{{enc}}}} = I\left(1 - \frac{{r^2-R_2^2}}{{R_3^2-R_2^2}}\right)"
            else:
                enc = r"I_{\mathrm{enc}} = 0"
            return MathTex(enc, color=YELLOW).scale(0.6).move_to(RIGHT * 2.1 + DOWN * 0.2)

        enc_disp = always_redraw(enc_current_text)
        self.add(enc_disp)

        r_readout = always_redraw(lambda: VGroup(
            Text("r = ", font=CJK).scale(0.42),
            MathTex(rf"{r_tracker.get_value():.2f}", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.06).move_to(RIGHT * 2.1 + UP * 0.55))
        self.add(r_readout)

        hint_zh = Text("虚线圆 = 安培回路；颜色随区域变化", font=CJK, color=WHITE).scale(0.40)
        hint_zh.to_edge(DOWN, buff=0.6)
        self.play(FadeIn(hint_zh))

        # 扫动动画
        self.play(r_tracker.animate.set_value(R1_v * 0.9), run_time=1.8)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(R2_v * 0.5 + R1_v * 0.5), run_time=1.5)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(R2_v * 0.95), run_time=1.2)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value((R2_v + R3_v) * 0.5), run_time=1.2)
        self.wait(0.6)
        self.play(r_tracker.animate.set_value(R3_v * 1.25), run_time=1.2)
        self.wait(1.0)

        self.play(FadeOut(VGroup(cross_sm, loop_obj, enc_disp, r_readout, hint_zh, track_title)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 四个区域逐步推导 B 的表达式
        # ═══════════════════════════════════════════════════════════════════
        deriv_title = Text("各区域磁场推导", font=CJK, color=BLUE).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(deriv_title))

        # 区域1
        z1_head = VGroup(
            Text("区域一", font=CJK, color=ORANGE).scale(0.45),
            MathTex(r"r < R_1", color=ORANGE).scale(0.58),
        ).arrange(RIGHT, buff=0.12)
        z1_eq1 = MathTex(r"B \cdot 2\pi r = \mu_0 \cdot \frac{r^2}{R_1^2} I").scale(0.72)
        z1_eq2 = MathTex(r"B_1 = \frac{\mu_0 I}{2\pi R_1^2}\,r", color=ORANGE).scale(0.78)
        z1 = VGroup(z1_head, z1_eq1, z1_eq2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        z1.next_to(deriv_title, DOWN, buff=0.4).to_edge(LEFT, buff=0.8)

        self.play(FadeIn(z1_head))
        self.play(Write(z1_eq1))
        self.wait(0.5)
        self.play(TransformMatchingTex(z1_eq1.copy(), z1_eq2))
        self.wait(0.8)

        # 区域2
        z2_head = VGroup(
            Text("区域二", font=CJK, color=BLUE_C).scale(0.45),
            MathTex(r"R_1 < r < R_2", color=BLUE_C).scale(0.58),
        ).arrange(RIGHT, buff=0.12)
        z2_eq1 = MathTex(r"B \cdot 2\pi r = \mu_0 I").scale(0.72)
        z2_eq2 = MathTex(r"B_2 = \frac{\mu_0 I}{2\pi r}", color=BLUE_C).scale(0.78)
        z2 = VGroup(z2_head, z2_eq1, z2_eq2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        z2.next_to(z1, DOWN, buff=0.35).to_edge(LEFT, buff=0.8)

        self.play(FadeIn(z2_head))
        self.play(Write(z2_eq1))
        self.wait(0.5)
        self.play(TransformMatchingTex(z2_eq1.copy(), z2_eq2))
        self.wait(0.8)

        # 区域3 & 4（右列）
        z3_head = VGroup(
            Text("区域三", font=CJK, color=RED_C).scale(0.45),
            MathTex(r"R_2 < r < R_3", color=RED_C).scale(0.58),
        ).arrange(RIGHT, buff=0.12)
        z3_eq = MathTex(
            r"B_3 = \frac{\mu_0 I}{2\pi r}\cdot\frac{R_3^2 - r^2}{R_3^2 - R_2^2}",
            color=RED_C
        ).scale(0.65)
        z3 = VGroup(z3_head, z3_eq).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        z3.next_to(deriv_title, DOWN, buff=0.4).to_edge(RIGHT, buff=0.8)

        z4_head = VGroup(
            Text("区域四", font=CJK, color=GRAY).scale(0.45),
            MathTex(r"r > R_3", color=GRAY).scale(0.58),
        ).arrange(RIGHT, buff=0.12)
        z4_eq = MathTex(r"B_4 = 0", color=GRAY).scale(0.78)
        z4 = VGroup(z4_head, z4_eq).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        z4.next_to(z3, DOWN, buff=0.38).to_edge(RIGHT, buff=0.8)

        self.play(FadeIn(z3_head))
        self.play(Write(z3_eq))
        self.wait(0.5)
        self.play(FadeIn(z4_head))
        self.play(Write(z4_eq))
        self.wait(1.2)

        reason4 = Text("内外电流等量反向，总包围电流=0", font=CJK, color=GREEN).scale(0.38)
        reason4.next_to(z4_eq, DOWN, buff=0.15).to_edge(RIGHT, buff=0.7)
        self.play(FadeIn(reason4))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_title, z1, z2, z3, z4, reason4)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: B-r 曲线动画绘制
        # ═══════════════════════════════════════════════════════════════════
        curve_title = Text("B-r 完整分布曲线", font=CJK, color=BLUE).scale(0.52)
        curve_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(curve_title))

        # 建立坐标系
        ax = Axes(
            x_range=[0, 2.1, 0.5],
            y_range=[0, 1.3, 0.5],
            x_length=8.5,
            y_length=4.0,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        )
        ax.next_to(curve_title, DOWN, buff=0.3)
        ax.scale_to_fit_width(11)

        # 轴标签
        x_lbl = VGroup(
            Text("r", font=CJK).scale(0.42),
            Text("/m", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.04)
        x_lbl.next_to(ax.x_axis.get_end(), RIGHT, buff=0.12)

        y_lbl = MathTex(r"B").scale(0.5)
        y_lbl.next_to(ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl))

        # 关键 r 值在坐标轴上的位置（归一化到 x_range [0,2.1]）
        # 令 R1=0.6, R2=1.1, R3=1.42 直接对应数轴数值
        I_val = 1.0          # 归一化电流
        mu0_2pi = 0.5        # 实际 μ₀I/(2π) 归一化后令其峰值=1

        # B 函数（以坐标系 x 为半径）
        B_peak = mu0_2pi / R1_v   # 在 r=R1 处的峰值

        def B_func(r):
            if r <= 0:
                return 0
            elif r < R1_v:
                return (mu0_2pi / R1_v ** 2) * r
            elif r < R2_v:
                return mu0_2pi / r
            elif r < R3_v:
                return (mu0_2pi / r) * (R3_v ** 2 - r ** 2) / (R3_v ** 2 - R2_v ** 2)
            else:
                return 0.0

        # 归一化 B 使峰值≈1.0
        B_scale = 1.0 / B_peak

        def B_norm(r):
            return B_func(r) * B_scale

        # 分段绘制曲线
        seg1 = ax.plot(lambda x: B_norm(x), x_range=[0.001, R1_v - 0.001], color=ORANGE, stroke_width=3.5)
        seg2 = ax.plot(lambda x: B_norm(x), x_range=[R1_v + 0.001, R2_v - 0.001], color=BLUE_C, stroke_width=3.5)
        seg3 = ax.plot(lambda x: B_norm(x), x_range=[R2_v + 0.001, R3_v - 0.001], color=RED_C, stroke_width=3.5)
        seg4 = ax.plot(lambda x: 0.0, x_range=[R3_v, 2.0], color=GRAY, stroke_width=3.5)

        # 垂直虚线标记关键点
        def vdash(r_val, clr):
            x0 = ax.c2p(r_val, 0)
            x1 = ax.c2p(r_val, B_norm(r_val) + 0.05)
            return DashedLine(x0, x1, color=clr, stroke_width=1.5, dash_length=0.08)

        vd1 = vdash(R1_v, ORANGE)
        vd2 = vdash(R2_v, BLUE_C)
        vd3 = vdash(R3_v, RED_C)

        lR1 = MathTex(r"R_1", color=ORANGE).scale(0.45).next_to(ax.c2p(R1_v, 0), DOWN, buff=0.12)
        lR2 = MathTex(r"R_2", color=BLUE_C).scale(0.45).next_to(ax.c2p(R2_v, 0), DOWN, buff=0.12)
        lR3 = MathTex(r"R_3", color=RED_C).scale(0.45).next_to(ax.c2p(R3_v, 0), DOWN, buff=0.12)

        # 公式标注（段上方）
        f1 = MathTex(r"B\propto r", color=ORANGE).scale(0.40)
        f1.move_to(ax.c2p(R1_v * 0.5, B_norm(R1_v * 0.5) + 0.18))
        f2 = MathTex(r"B\propto \tfrac{1}{r}", color=BLUE_C).scale(0.40)
        f2.move_to(ax.c2p((R1_v + R2_v) * 0.5, B_norm((R1_v + R2_v) * 0.5) + 0.15))
        f3 = MathTex(r"B\to 0", color=RED_C).scale(0.40)
        f3.move_to(ax.c2p((R2_v + R3_v) * 0.5, B_norm((R2_v + R3_v) * 0.5) + 0.18))
        f4 = MathTex(r"B=0", color=GRAY).scale(0.40)
        f4.move_to(ax.c2p(R3_v + 0.35, 0.12))

        self.play(Create(seg1), Create(vd1), FadeIn(lR1), FadeIn(f1), run_time=1.2)
        self.wait(0.6)
        self.play(Create(seg2), Create(vd2), FadeIn(lR2), FadeIn(f2), run_time=1.2)
        self.wait(0.6)
        self.play(Create(seg3), Create(vd3), FadeIn(lR3), FadeIn(f3), run_time=1.2)
        self.wait(0.6)
        self.play(Create(seg4), FadeIn(f4), run_time=0.8)
        self.wait(1.6)

        self.play(FadeOut(VGroup(
            ax, x_lbl, y_lbl, seg1, seg2, seg3, seg4,
            vd1, vd2, vd3, lR1, lR2, lR3, f1, f2, f3, f4,
            curve_title
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡（关键公式汇总）
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(s_title))

        ampere_sum = MathTex(
            r"\oint_L \mathbf{B}\cdot\mathrm{d}\mathbf{l} = \mu_0 \sum_{\mathrm{enc}} I",
            color=CYAN
        ).scale(0.75)
        b1_sum = MathTex(
            r"B_1 = \frac{\mu_0 I}{2\pi R_1^2}\,r \quad (r < R_1)",
            color=ORANGE
        ).scale(0.68)
        b2_sum = MathTex(
            r"B_2 = \frac{\mu_0 I}{2\pi r} \quad (R_1 < r < R_2)",
            color=BLUE_C
        ).scale(0.68)
        b4_sum = MathTex(
            r"B_4 = 0 \quad (r > R_3)",
            color=GRAY
        ).scale(0.68)

        key_zh = Text("内芯线性增大 → 间隙反比衰减 → 外壳逐步抵消 → 外部为零",
                      font=CJK, color=GREEN).scale(0.40)

        summary_grp = VGroup(ampere_sum, b1_sum, b2_sum, b4_sum, key_zh).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT
        )
        summary_grp.next_to(s_title, DOWN, buff=0.4)
        summary_grp.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary_grp, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(ampere_sum))
        self.wait(0.5)
        self.play(FadeIn(b1_sum))
        self.wait(0.4)
        self.play(FadeIn(b2_sum))
        self.wait(0.4)
        self.play(FadeIn(b4_sum))
        self.wait(0.4)
        self.play(FadeIn(key_zh), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary_grp, box, title)))
        self.wait(0.3)
