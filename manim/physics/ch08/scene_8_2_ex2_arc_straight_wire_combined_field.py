"""第 8.2 节 · 例题2 — 直线-圆弧复合导线的磁场叠加。

一段由两段半无限长直导线（AB、CD）和一段圆弧（BC，圆心角 2π/3）
组成的平面载流导线，利用毕奥-萨伐尔定律叠加原理，逐段求各段在圆心 P 处
产生的磁感应强度，最终合成为 B ≈ 0.21μ₀I/R。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

ORANGE_WIRE = "#FF8C00"   # AB 段颜色
ARC_COLOR   = "#00BFFF"   # BC 弧段颜色
CD_COLOR    = "#FF4500"   # CD 段颜色
P_COLOR     = YELLOW


class Ch08Ex2ArcStraightWireCombinedField(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("直线-圆弧复合导线的磁场叠加", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第八章  稳恒磁场 · 8.2  例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比 / 问题引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text('问题：一段导线弯折成 "直线-圆弧-直线" 形状，', font=CJK).scale(0.45)
        ana2 = Text("通有电流 I，圆心 P 处的磁场有多强？", font=CJK).scale(0.45)
        ana3 = Text("方法：磁场叠加原理 — 各段独立计算，矢量相加。", font=CJK, color=GREEN).scale(0.45)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3 · 几何结构图（标注三段、参数 R、d、60°）
        # ══════════════════════════════════════════════════════════════════
        geo_label = Text("几何结构", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(geo_label))

        # 坐标系原点 = 圆心 P，半径 R 对应 1.4 单位长度
        R_px = 1.4          # 圆弧半径（像素单位）
        d_px = R_px / 2     # 直线到圆心的垂直距离 d = R/2 → 实际上 d = R（端点在弧上）
        # 圆心角 2π/3 = 120°，弧从 210° 到 330°（即弧底向下，两端向左右延伸半无限直线）
        # 选取：弧在下方，P 在圆心。AB 从左侧水平延伸到弧端 B，CD 从弧端 C 水平延伸向右。
        # 让弧从角度 210° 到 330°（以标准数学角度，x 轴向右为 0°）
        # B 点 = 圆心角 210° = (-√3/2 R, -1/2 R)
        # C 点 = 圆心角 330° = ( √3/2 R, -1/2 R)
        # AB：从 x=-∞ 到 B，水平线 y = -R/2
        # CD：从 C 到 x=+∞，水平线 y = -R/2

        origin = np.array([0.0, 0.3, 0.0])   # 圆心 P 在画面中的坐标（略微上移）

        ang_B = 210 * DEGREES
        ang_C = 330 * DEGREES
        B_pt  = origin + R_px * np.array([math.cos(ang_B), math.sin(ang_B), 0])
        C_pt  = origin + R_px * np.array([math.cos(ang_C), math.sin(ang_C), 0])

        # AB 段（半无限长直线，从左延伸到 B）
        A_pt = origin + np.array([-3.2, -R_px * 0.5, 0])
        D_pt = origin + np.array([ 3.2, -R_px * 0.5, 0])

        ab_line = Line(A_pt, B_pt, color=ORANGE_WIRE, stroke_width=4)
        # Arrow to show current direction on AB
        ab_arr = Arrow(A_pt, B_pt, buff=0, color=ORANGE_WIRE, stroke_width=3,
                       max_tip_length_to_length_ratio=0.12)

        # BC 弧段（2π/3, 120°弧，从 210° 到 330°）
        arc_bc = Arc(radius=R_px, start_angle=ang_B, angle=(120 * DEGREES),
                     arc_center=origin, color=ARC_COLOR, stroke_width=4)

        # CD 段
        cd_line = Line(C_pt, D_pt, color=CD_COLOR, stroke_width=4)
        cd_arr  = Arrow(C_pt, D_pt, buff=0, color=CD_COLOR, stroke_width=3,
                        max_tip_length_to_length_ratio=0.12)

        # 圆心 P 点
        p_dot   = Dot(origin, color=P_COLOR, radius=0.10)
        p_label = Text("P", font=CJK, color=P_COLOR).scale(0.45).next_to(p_dot, UP, buff=0.10)

        # 半径 R 标注
        r_line  = DashedLine(origin, C_pt, color=WHITE, stroke_width=1.5)
        r_label = MathTex(r"R", color=WHITE).scale(0.55)
        r_label.move_to((origin + C_pt) / 2 + np.array([0.22, 0.22, 0]))

        # d = R/2 垂直距离标注（圆心到 AB 水平线）
        foot_pt = origin + np.array([0, -R_px * 0.5, 0])
        d_line  = DashedLine(origin, foot_pt, color=CYAN, stroke_width=1.5)
        d_label = VGroup(
            Text("d", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"=\frac{R}{2}", color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.06)
        d_label.next_to(d_line, LEFT, buff=0.12)

        # 60° 夹角标注（AB 段与 BP 的夹角）
        angle_arc = Arc(radius=0.38, start_angle=PI, angle=(-60 * DEGREES),
                        arc_center=B_pt, color=ORANGE, stroke_width=2)
        ang_lbl = MathTex(r"60^\circ", color=ORANGE).scale(0.42)
        ang_lbl.next_to(angle_arc, LEFT, buff=0.10)

        # 段落标注
        ab_lbl = Text("AB", font=CJK, color=ORANGE_WIRE).scale(0.42).next_to(A_pt + (B_pt - A_pt) * 0.3, UP, buff=0.12)
        bc_lbl = Text("BC", font=CJK, color=ARC_COLOR).scale(0.42)
        bc_lbl.move_to(origin + np.array([0, -R_px - 0.38, 0]))
        cd_lbl = Text("CD", font=CJK, color=CD_COLOR).scale(0.42).next_to(C_pt + (D_pt - C_pt) * 0.5, UP, buff=0.12)

        # 依次展示各段
        self.play(Create(ab_line), FadeIn(ab_lbl))
        self.wait(0.5)
        self.play(Create(arc_bc), FadeIn(bc_lbl))
        self.wait(0.5)
        self.play(Create(cd_line), FadeIn(cd_lbl))
        self.wait(0.5)
        self.play(FadeIn(p_dot), FadeIn(p_label))
        self.play(Create(r_line), FadeIn(r_label),
                  Create(d_line), FadeIn(d_label))
        self.play(Create(angle_arc), FadeIn(ang_lbl))
        self.wait(1.8)

        geo_group = VGroup(ab_line, arc_bc, cd_line,
                           p_dot, p_label,
                           r_line, r_label, d_line, d_label,
                           angle_arc, ang_lbl,
                           ab_lbl, bc_lbl, cd_lbl)

        self.play(FadeOut(geo_label), FadeOut(geo_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 4 · 物理背景：毕奥-萨伐尔定律 + 叠加原理
        # ══════════════════════════════════════════════════════════════════
        biot_lbl = Text("毕奥-萨伐尔定律（点）", font=CJK, color=BLUE).scale(0.50)
        biot_lbl.next_to(title, DOWN, buff=0.45)
        biot_eq = MathTex(
            r"d\vec{B} = \frac{\mu_0 I}{4\pi}\frac{d\vec{l}\times\hat{r}}{r^2}"
        ).scale(0.82)
        biot_eq.next_to(biot_lbl, DOWN, buff=0.35)

        super_lbl = Text("叠加原理：各段独立积分，再矢量求和", font=CJK, color=GREEN).scale(0.44)
        super_lbl.next_to(biot_eq, DOWN, buff=0.35)
        super_eq = MathTex(
            r"\vec{B}_{total} = \vec{B}_1 + \vec{B}_2 + \vec{B}_3"
        ).scale(0.82)
        super_eq.next_to(super_lbl, DOWN, buff=0.28)

        self.play(FadeIn(biot_lbl), Write(biot_eq))
        self.wait(1.2)
        self.play(FadeIn(super_lbl), Write(super_eq))
        self.wait(1.6)
        self.play(FadeOut(VGroup(biot_lbl, biot_eq, super_lbl, super_eq)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5 · 弧段 BC → B₁（有限弧的磁场公式）
        # ══════════════════════════════════════════════════════════════════
        sec_lbl = Text("第一步：圆弧段 BC 的磁场 B1", font=CJK, color=ARC_COLOR).scale(0.50)
        sec_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_lbl))

        # 重绘弧段（高亮）
        arc_hl = Arc(radius=R_px, start_angle=ang_B, angle=(120 * DEGREES),
                     arc_center=origin, color=ARC_COLOR, stroke_width=5)
        arc_hl.next_to(title, DOWN, buff=2.0)
        arc_hl.shift(LEFT * 2.8)

        # 积分公式逐步展示
        eq_arc1 = MathTex(
            r"B_1 = \frac{\mu_0 I}{4\pi R^2}\int_0^{\,\frac{2\pi}{3}} R\,d\theta"
        ).scale(0.72)
        eq_arc1.next_to(sec_lbl, DOWN, buff=0.45)

        eq_arc2 = MathTex(
            r"= \frac{\mu_0 I}{4\pi R}\cdot\frac{2\pi}{3}"
        ).scale(0.72)
        eq_arc2.next_to(eq_arc1, DOWN, buff=0.32)

        eq_arc3 = MathTex(
            r"B_1 = \frac{\mu_0 I}{6R}", color=YELLOW
        ).scale(0.88)
        eq_arc3.next_to(eq_arc2, DOWN, buff=0.32)

        dir_lbl1 = VGroup(
            Text("方向：右手定则 →", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\odot\ \text{(into page)}", color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.08)
        dir_lbl1b = Text("方向：垂直纸面向里 (x)", font=CJK, color=GREEN).scale(0.44)
        dir_lbl1b.next_to(eq_arc3, DOWN, buff=0.30)

        self.play(Write(eq_arc1))
        self.wait(1.0)
        self.play(FadeIn(eq_arc2))
        self.wait(0.8)
        self.play(Write(eq_arc3))
        self.wait(0.8)
        self.play(FadeIn(dir_lbl1b))
        self.wait(1.8)

        step1_group = VGroup(sec_lbl, eq_arc1, eq_arc2, eq_arc3, dir_lbl1b)
        self.play(FadeOut(step1_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 6 · 直线段 AB → B₂（半无限长直线，张角公式）
        # ══════════════════════════════════════════════════════════════════
        sec2_lbl = Text("第二步：半无限长直线 AB 的磁场 B2", font=CJK, color=ORANGE_WIRE).scale(0.48)
        sec2_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec2_lbl))

        # 说明：AB 段在 P 处的垂直距离 d = R·sin60° = R√3/2（不是 R/2）
        # 实际上：B 点在圆弧上，PB = R，PB 与 AB 的夹角 = 60°
        # d = R·sin60° = R√3/2，θ₁ = 0°（无穷远），θ₂ = 90°−60° = 30°（端点 B 处）
        # 用有限长直导线公式：B = μ₀I/(4πd)·(sinθ₁+sinθ₂)
        # θ₁ = 90°（无穷远端，sin90°=1），θ₂ = 30°（B 端，sin30°=1/2）

        geo2_note = Text("AB 到 P 的垂直距离:", font=CJK).scale(0.44)
        geo2_note.next_to(sec2_lbl, DOWN, buff=0.40)

        eq_d = MathTex(
            r"d = R\sin 60^\circ = \frac{\sqrt{3}}{2}R"
        ).scale(0.72)
        eq_d.next_to(geo2_note, DOWN, buff=0.25)

        eq_ab_gen = MathTex(
            r"B_2 = \frac{\mu_0 I}{4\pi d}(\sin\theta_1 + \sin\theta_2)"
        ).scale(0.70)
        eq_ab_gen.next_to(eq_d, DOWN, buff=0.32)

        eq_ab_ang = MathTex(
            r"\theta_1 = 90^\circ,\quad \theta_2 = 30^\circ"
        ).scale(0.68)
        eq_ab_ang.next_to(eq_ab_gen, DOWN, buff=0.28)

        eq_ab2 = MathTex(
            r"B_2 = \frac{\mu_0 I}{4\pi\cdot\frac{\sqrt{3}}{2}R}\left(1+\frac{1}{2}\right)"
            r"= \frac{\mu_0 I}{4\pi R}\cdot\frac{3}{\frac{\sqrt{3}}{2}\cdot 1}"
        ).scale(0.62)
        eq_ab2.next_to(eq_ab_ang, DOWN, buff=0.28)

        eq_ab3 = MathTex(
            r"B_2 = \frac{\mu_0 I}{2\pi R}\!\left(1-\frac{\sqrt{3}}{2}\right)",
            color=YELLOW
        ).scale(0.82)
        eq_ab3.next_to(eq_ab2, DOWN, buff=0.28)

        # 简化推导：直接展示结果表达式
        self.play(FadeIn(geo2_note), Write(eq_d))
        self.wait(0.8)
        self.play(Write(eq_ab_gen))
        self.wait(0.8)
        self.play(FadeIn(eq_ab_ang))
        self.wait(0.8)
        self.play(Write(eq_ab3))
        self.wait(1.8)

        dir_lbl2 = Text("方向：右手定则 → 垂直纸面向里 (x)", font=CJK, color=GREEN).scale(0.44)
        dir_lbl2.next_to(eq_ab3, DOWN, buff=0.26)
        self.play(FadeIn(dir_lbl2))
        self.wait(1.4)

        step2_group = VGroup(sec2_lbl, geo2_note, eq_d, eq_ab_gen, eq_ab_ang, eq_ab2, eq_ab3, dir_lbl2)
        self.play(FadeOut(step2_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 7 · 直线段 CD → B₃（对称性直接给出）
        # ══════════════════════════════════════════════════════════════════
        sec3_lbl = Text("第三步：半无限长直线 CD 的磁场 B3", font=CJK, color=CD_COLOR).scale(0.48)
        sec3_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec3_lbl))

        sym_note = Text("由结构对称性：CD 与 AB 关于竖直轴镜像，", font=CJK).scale(0.44)
        sym_note2 = Text("到 P 的垂直距离相同，夹角相同，电流反向后方向一致，", font=CJK).scale(0.44)
        sym_note3 = Text("故 B3 = B2，方向同为垂直纸面向里。", font=CJK, color=GREEN).scale(0.44)
        sym_grp = VGroup(sym_note, sym_note2, sym_note3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        sym_grp.next_to(sec3_lbl, DOWN, buff=0.40)

        eq_b3 = MathTex(
            r"B_3 = B_2 = \frac{\mu_0 I}{2\pi R}\!\left(1-\frac{\sqrt{3}}{2}\right)",
            color=YELLOW
        ).scale(0.80)
        eq_b3.next_to(sym_grp, DOWN, buff=0.38)

        self.play(FadeIn(sym_note))
        self.wait(0.6)
        self.play(FadeIn(sym_note2))
        self.wait(0.6)
        self.play(FadeIn(sym_note3))
        self.wait(0.8)
        self.play(Write(eq_b3))
        self.wait(1.8)

        step3_group = VGroup(sec3_lbl, sym_grp, eq_b3)
        self.play(FadeOut(step3_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 8 · 矢量叠加示意图（箭头首尾连接）
        # ══════════════════════════════════════════════════════════════════
        vec_lbl = Text("矢量叠加：三段磁场方向相同（均向里）", font=CJK, color=BLUE).scale(0.48)
        vec_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vec_lbl))

        # 三个竖直向下的箭头（代表"向里"，用向下箭头象征叠加）
        # 尺度：B1 ∝ 1/6, B2=B3 各 ∝ (1-√3/2)/2π ≈ 0.0212
        # 比例：B1 ≈ 0.1667, B2 ≈ 0.0213×2π … 实际用相对长度
        # 数值比例
        val_b1 = 1.0 / 6.0                                   # ≈ 0.1667
        val_b2 = (1.0 - math.sqrt(3) / 2) / (2 * math.pi)   # ≈ 0.0212
        val_b3 = val_b2
        total  = val_b1 + val_b2 + val_b3                    # ≈ 0.2091

        scale = 8.0   # 放大倍数以便显示

        # 箭头位置：在场点 P 旁，首尾连接，向下方向
        arrow_x = 1.8
        arrow_y_start = 1.5
        p_display = origin + np.array([arrow_x - 0.2, arrow_y_start + 0.3, 0])

        p_dot2  = Dot(p_display, color=P_COLOR, radius=0.09)
        p_lbl2  = Text("P", font=CJK, color=P_COLOR).scale(0.42).next_to(p_dot2, LEFT, buff=0.10)

        def make_arrow(start_y, length, color, label_str):
            s = np.array([arrow_x, start_y, 0.0])
            e = np.array([arrow_x, start_y - length * scale, 0.0])
            arr = Arrow(s, e, buff=0, color=color, stroke_width=4,
                        max_tip_length_to_length_ratio=0.20)
            lbl = MathTex(label_str, color=color).scale(0.52)
            lbl.next_to(arr, RIGHT, buff=0.15)
            return arr, lbl, e[1]

        arr1, lbl1, y1 = make_arrow(arrow_y_start,        val_b1, ARC_COLOR,    r"B_1")
        arr2, lbl2, y2 = make_arrow(y1,                   val_b2, ORANGE_WIRE,  r"B_2")
        arr3, lbl3, y3 = make_arrow(y2,                   val_b3, CD_COLOR,     r"B_3")

        # 合矢量
        s_total = np.array([arrow_x + 0.55, arrow_y_start, 0.0])
        e_total = np.array([arrow_x + 0.55, arrow_y_start - total * scale, 0.0])
        arr_tot = Arrow(s_total, e_total, buff=0, color=GREEN, stroke_width=5,
                        max_tip_length_to_length_ratio=0.18)
        lbl_tot = MathTex(r"B_{total}", color=GREEN).scale(0.52)
        lbl_tot.next_to(arr_tot, RIGHT, buff=0.15)

        # 向里符号（⊗）说明
        into_note = VGroup(
            Text("所有分量均", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\otimes", color=WHITE).scale(0.55),
            Text("（垂直纸面向里）", font=CJK, color=WHITE).scale(0.40),
        ).arrange(RIGHT, buff=0.08)
        into_note.next_to(title, DOWN, buff=1.0)
        into_note.to_edge(LEFT, buff=0.5)

        self.play(FadeIn(p_dot2), FadeIn(p_lbl2))
        self.wait(0.4)
        self.play(GrowArrow(arr1), FadeIn(lbl1))
        self.wait(0.5)
        self.play(GrowArrow(arr2), FadeIn(lbl2))
        self.wait(0.5)
        self.play(GrowArrow(arr3), FadeIn(lbl3))
        self.wait(0.5)
        self.play(FadeIn(into_note))
        self.wait(0.6)
        self.play(GrowArrow(arr_tot), FadeIn(lbl_tot))
        self.wait(1.8)

        vec_group = VGroup(vec_lbl, p_dot2, p_lbl2,
                           arr1, lbl1, arr2, lbl2, arr3, lbl3,
                           arr_tot, lbl_tot, into_note)
        self.play(FadeOut(vec_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 9 · 完整推导汇总 + 数值计算
        # ══════════════════════════════════════════════════════════════════
        calc_lbl = Text("数值计算与合成", font=CJK, color=BLUE).scale(0.50)
        calc_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_lbl))

        eq_s1 = MathTex(
            r"B_1 = \frac{\mu_0 I}{6R}",
            color=ARC_COLOR
        ).scale(0.78)
        eq_s2 = MathTex(
            r"B_2 = B_3 = \frac{\mu_0 I}{2\pi R}\!\left(1-\frac{\sqrt{3}}{2}\right)",
            color=ORANGE_WIRE
        ).scale(0.78)

        eq_sum0 = MathTex(
            r"B = B_1 + B_2 + B_3"
        ).scale(0.78)
        eq_sum1 = MathTex(
            r"= \frac{\mu_0 I}{6R} + \frac{2\mu_0 I}{2\pi R}\!\left(1-\frac{\sqrt{3}}{2}\right)"
        ).scale(0.72)
        eq_sum2 = MathTex(
            r"= \frac{\mu_0 I}{R}\!\left[\frac{1}{6}+\frac{1}{\pi}\!\left(1-\frac{\sqrt{3}}{2}\right)\right]"
        ).scale(0.72)
        eq_sum3 = MathTex(
            r"\approx 0.21\,\frac{\mu_0 I}{R}",
            color=GREEN
        ).scale(0.92)

        steps = VGroup(eq_s1, eq_s2, eq_sum0, eq_sum1, eq_sum2, eq_sum3)
        steps.arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        steps.next_to(calc_lbl, DOWN, buff=0.40)
        steps.scale_to_fit_width(11.5)

        for step in steps:
            self.play(Write(step))
            self.wait(0.9)
        self.wait(1.2)
        self.play(FadeOut(VGroup(calc_lbl, steps)))

        # ══════════════════════════════════════════════════════════════════
        # Step 10 · 几何直觉 + 再现结构图（标注 B 方向）
        # ══════════════════════════════════════════════════════════════════
        intui_lbl = Text("几何直觉：三段为何方向相同？", font=CJK, color=BLUE).scale(0.48)
        intui_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(intui_lbl))

        # 再次展示导线结构
        ab2   = Line(A_pt, B_pt, color=ORANGE_WIRE, stroke_width=3)
        arc2  = Arc(radius=R_px, start_angle=ang_B, angle=(120 * DEGREES),
                    arc_center=origin, color=ARC_COLOR, stroke_width=3)
        cd2   = Line(C_pt, D_pt, color=CD_COLOR, stroke_width=3)
        p_d2  = Dot(origin, color=P_COLOR, radius=0.09)
        p_l2  = Text("P", font=CJK, color=P_COLOR).scale(0.38).next_to(p_d2, UP, buff=0.08)

        # B 方向符号（⊗）在 P 点旁
        into_sym = MathTex(r"\otimes", color=GREEN).scale(0.80)
        into_sym.next_to(p_d2, RIGHT, buff=0.22)
        into_sym_lbl = Text("B 向里", font=CJK, color=GREEN).scale(0.38)
        into_sym_lbl.next_to(into_sym, RIGHT, buff=0.12)

        intui_note1 = Text("弧段：电流绕 P 逆时针 → 右手定则 → 向里", font=CJK, color=ARC_COLOR).scale(0.41)
        intui_note2 = Text("AB：电流向右，P 在上方 → 向里", font=CJK, color=ORANGE_WIRE).scale(0.41)
        intui_note3 = Text("CD：电流向右，P 在上方 → 向里", font=CJK, color=CD_COLOR).scale(0.41)
        notes = VGroup(intui_note1, intui_note2, intui_note3).arrange(DOWN, buff=0.20, aligned_edge=LEFT)
        notes.to_edge(RIGHT, buff=0.5)
        notes.shift(DOWN * 0.5)

        wire_grp = VGroup(ab2, arc2, cd2, p_d2, p_l2)
        wire_grp.next_to(intui_lbl, DOWN, buff=0.55)
        wire_grp.shift(LEFT * 2.0)

        self.play(Create(ab2), Create(arc2), Create(cd2),
                  FadeIn(p_d2), FadeIn(p_l2))
        self.play(FadeIn(into_sym), FadeIn(into_sym_lbl))
        self.wait(0.5)
        self.play(FadeIn(intui_note1))
        self.wait(0.5)
        self.play(FadeIn(intui_note2))
        self.wait(0.5)
        self.play(FadeIn(intui_note3))
        self.wait(1.8)

        intui_group = VGroup(intui_lbl, ab2, arc2, cd2, p_d2, p_l2,
                             into_sym, into_sym_lbl, notes)
        self.play(FadeOut(intui_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 11 · 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)

        sr1 = VGroup(
            Text("弧段 BC：", font=CJK, color=ARC_COLOR).scale(0.46),
            MathTex(r"B_1 = \dfrac{\mu_0 I}{6R}", color=ARC_COLOR).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        sr2 = VGroup(
            Text("直线 AB = CD：", font=CJK, color=ORANGE_WIRE).scale(0.46),
            MathTex(r"B_2=B_3=\dfrac{\mu_0 I}{2\pi R}\!\left(1-\dfrac{\sqrt{3}}{2}\right)",
                    color=ORANGE_WIRE).scale(0.68),
        ).arrange(RIGHT, buff=0.15)

        sr3 = MathTex(
            r"B_{total} = B_1+B_2+B_3 \approx 0.21\,\frac{\mu_0 I}{R}",
            color=GREEN
        ).scale(0.80)

        sr4 = Text("方向：垂直纸面向里（电流绕行方向右手定则）", font=CJK, color=YELLOW).scale(0.42)

        summary = VGroup(sr1, sr2, sr3, sr4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.18)

        self.play(FadeIn(s_title))
        self.play(Write(sr1))
        self.wait(0.7)
        self.play(Write(sr2))
        self.wait(0.7)
        self.play(Write(sr3))
        self.wait(0.7)
        self.play(FadeIn(sr4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch08Ex2ArcStraightWireCombinedField",
        "id": "phys-ch08-8.2-ex2-arc-straight-wire-combined-field",
        "chapterId": "ch08",
        "sectionId": "8.2",
        "title": "直线-圆弧复合导线的磁场叠加",
        "description": "对由两段半无限长直导线和一段120°圆弧构成的平面载流导线，逐段用毕奥-萨伐尔定律求各段在圆心P处的磁感应强度，再通过矢量叠加得到合场B≈0.21μ₀I/R，方向垂直纸面向里。",
    },
]
