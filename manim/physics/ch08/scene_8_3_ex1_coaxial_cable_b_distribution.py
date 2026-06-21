"""第 8.3 节 · 例题精讲：同轴电缆各区域磁场与 B-r 曲线。

用安培环路定理逐区域求 B，ValueTracker 驱动动态安培回路，
最后在坐标轴上逐段描绘 B-r 曲线并标注连续条件。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数（归一化，R1=1, R2=2, R3=2.6，I=1，mu0/(2pi)=1） ──
R1 = 1.0
R2 = 2.0
R3 = 2.6
# B1_max = mu0*I/(2*pi*R1)  归一化为 1


def B_val(r):
    """归一化磁感应强度（峰值在 r=R1 处为 1）"""
    if r <= 0:
        return 0.0
    if r <= R1:
        return r / R1
    if r <= R2:
        return R1 / r
    if r <= R3:
        return (R1 / r) * (R3**2 - r**2) / (R3**2 - R2**2)
    return 0.0


class Ch08Ex1CoaxialCableBDistribution(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════
        # Step 1: 标题
        # ════════════════════════════════════════════════════════
        title = Text("同轴电缆各区域磁场分布", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.3  例题精讲", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ════════════════════════════════════════════════════════
        ana1 = Text("同轴电缆是网络信号线的核心结构：", font=CJK).scale(0.48)
        ana2 = Text("内芯导线载电流 +I，外层金属管载电流 -I，", font=CJK).scale(0.48)
        ana3 = Text("两者产生的磁场在外部完全抵消——这是屏蔽的秘密！", font=CJK, color=GREEN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════
        # Step 3: 同轴电缆结构剖面图（2D 截面）
        # ════════════════════════════════════════════════════════
        sec_label = Text("同轴电缆横截面", font=CJK, color=BLUE).scale(0.5)
        sec_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_label))

        # 绘制截面：以屏幕左侧为中心
        cx, cy = -3.5, -0.5
        scale = 0.9  # 像素缩放

        inner_disk = Circle(radius=R1 * scale, color=ORANGE, fill_color=ORANGE,
                            fill_opacity=0.55, stroke_width=2).shift([cx, cy, 0])
        gap_ring = Annulus(inner_radius=R2 * scale, outer_radius=R3 * scale,
                           color=BLUE_D, fill_opacity=0.5, stroke_width=0).shift([cx, cy, 0])
        outer_circle = Circle(radius=R3 * scale, color=BLUE_D,
                              fill_opacity=0, stroke_width=2).shift([cx, cy, 0])
        mid_circle = Circle(radius=R2 * scale, color=BLUE_D,
                            fill_opacity=0, stroke_width=1.5, stroke_color=WHITE).shift([cx, cy, 0])

        # 半径标注
        def r_arrow_label(r_val, label_str, lbl_color):
            end_pt = np.array([cx + r_val * scale, cy, 0])
            origin = np.array([cx, cy, 0])
            arr = Arrow(origin, end_pt, buff=0, color=lbl_color,
                        stroke_width=2, max_tip_length_to_length_ratio=0.2)
            lbl = MathTex(label_str, color=lbl_color).scale(0.55)
            lbl.next_to(arr, UP, buff=0.08)
            return VGroup(arr, lbl)

        arr_R1 = r_arrow_label(R1, r"R_1", ORANGE)
        arr_R2 = r_arrow_label(R2, r"R_2", WHITE)
        arr_R3 = r_arrow_label(R3, r"R_3", CYAN)

        # 颜色说明
        legend_inner = VGroup(
            Square(side_length=0.28, fill_color=ORANGE, fill_opacity=0.7,
                   stroke_width=0),
            Text("内导体（+I）", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.15)
        legend_outer = VGroup(
            Square(side_length=0.28, fill_color=BLUE_D, fill_opacity=0.7,
                   stroke_width=0),
            Text("外导体（-I）", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.15)
        legend = VGroup(legend_inner, legend_outer).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        legend.next_to(outer_circle, RIGHT, buff=0.6)
        legend.shift(UP * 0.3)

        struct_group = VGroup(inner_disk, gap_ring, outer_circle, mid_circle,
                              arr_R1, arr_R2, arr_R3, legend)
        self.play(
            Create(inner_disk), Create(gap_ring),
            Create(outer_circle), Create(mid_circle),
            run_time=1.5
        )
        self.play(FadeIn(arr_R1), FadeIn(arr_R2), FadeIn(arr_R3))
        self.play(FadeIn(legend))
        self.wait(1.8)

        # 安培定律提示（右侧）
        amp_law_title = Text("安培环路定理", font=CJK, color=YELLOW).scale(0.48)
        amp_law_title.move_to([2.2, 1.8, 0])
        amp_formula = MathTex(r"\oint \vec{B}\cdot d\vec{l} = \mu_0 I_{enc}",
                              color=YELLOW).scale(0.72)
        amp_formula.next_to(amp_law_title, DOWN, buff=0.3)
        amp_note = Text("选同心圆形回路，\n利用对称性化简积分", font=CJK).scale(0.4)
        amp_note.next_to(amp_formula, DOWN, buff=0.3)
        self.play(FadeIn(amp_law_title), Write(amp_formula))
        self.wait(0.8)
        self.play(FadeIn(amp_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(sec_label, struct_group, amp_law_title,
                                 amp_formula, amp_note)))

        # ════════════════════════════════════════════════════════
        # Step 4: 四区域安培回路动画（ValueTracker 驱动）
        # ════════════════════════════════════════════════════════
        region_title = Text("四个区域逐一分析", font=CJK, color=BLUE).scale(0.5)
        region_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(region_title))

        # 左侧截面（简化，不含标注箭头）
        cx2, cy2 = -4.2, -0.6
        s2 = 0.75
        bg_inner = Circle(radius=R1 * s2, color=ORANGE, fill_color=ORANGE,
                          fill_opacity=0.45, stroke_width=2).shift([cx2, cy2, 0])
        bg_gap = Annulus(inner_radius=R2 * s2, outer_radius=R3 * s2,
                         color=BLUE_D, fill_opacity=0.45, stroke_width=0).shift([cx2, cy2, 0])
        bg_out = Circle(radius=R3 * s2, color=BLUE_D,
                        fill_opacity=0, stroke_width=2).shift([cx2, cy2, 0])
        bg_mid = Circle(radius=R2 * s2, color=WHITE,
                        fill_opacity=0, stroke_width=1).shift([cx2, cy2, 0])
        bg_r1c = Circle(radius=R1 * s2, color=ORANGE,
                        fill_opacity=0, stroke_width=2).shift([cx2, cy2, 0])

        # 半径参考标签（静态）
        r1_lbl = MathTex(r"R_1", color=ORANGE).scale(0.42).move_to(
            [cx2 + R1 * s2 * 0.6, cy2 - 0.18, 0])
        r2_lbl = MathTex(r"R_2", color=WHITE).scale(0.42).move_to(
            [cx2 + R2 * s2 * 0.75, cy2 - 0.18, 0])
        r3_lbl = MathTex(r"R_3", color=CYAN).scale(0.42).move_to(
            [cx2 + R3 * s2 * 0.88, cy2 - 0.18, 0])
        bg = VGroup(bg_inner, bg_gap, bg_out, bg_mid, bg_r1c, r1_lbl, r2_lbl, r3_lbl)
        self.play(FadeIn(bg))

        # 右侧公式区
        rx0 = 0.4  # 右侧公式区左边界 x

        # 四个区域的定义与公式数据
        regions = [
            {
                "r_val": 0.55,
                "color": ORANGE,
                "label": "r < R_1",
                "zh_name": "区域 ①：内导体内部",
                "enc_zh": "回路包围的电流",
                "enc_eq": r"I_{enc} = I \cdot \frac{r^2}{R_1^2}",
                "result_eq": r"B = \frac{\mu_0 I r}{2\pi R_1^2}",
                "trend_zh": "B 随 r 线性增大",
            },
            {
                "r_val": 1.5,
                "color": GREEN,
                "label": "R_1 < r < R_2",
                "zh_name": "区域 ②：内外导体间隙",
                "enc_zh": "回路包围的电流",
                "enc_eq": r"I_{enc} = I",
                "result_eq": r"B = \frac{\mu_0 I}{2\pi r}",
                "trend_zh": "B 按 1/r 衰减",
            },
            {
                "r_val": 2.3,
                "color": YELLOW,
                "label": "R_2 < r < R_3",
                "zh_name": "区域 ③：外导体内部",
                "enc_zh": "净包围电流（外导体部分抵消）",
                "enc_eq": r"I_{enc} = I\!\left(1 - \frac{r^2 - R_2^2}{R_3^2 - R_2^2}\right)",
                "result_eq": r"B = \frac{\mu_0 I}{2\pi r}\cdot\frac{R_3^2 - r^2}{R_3^2 - R_2^2}",
                "trend_zh": "B 非线性减小至 0",
            },
            {
                "r_val": 3.1,
                "color": RED,
                "label": "r > R_3",
                "zh_name": "区域 ④：外导体之外",
                "enc_zh": "净包围电流为零（+I 与 -I 抵消）",
                "enc_eq": r"I_{enc} = I - I = 0",
                "result_eq": r"B = 0",
                "trend_zh": "完全屏蔽，B = 0",
            },
        ]

        for reg in regions:
            r_pix = reg["r_val"] * s2
            # 安培环路圆
            loop_circle = Circle(
                radius=r_pix, color=reg["color"],
                fill_opacity=0, stroke_width=3.5
            ).shift([cx2, cy2, 0])

            # 场点 r 点
            r_dot = Dot(point=[cx2 + r_pix, cy2, 0],
                        color=reg["color"], radius=0.1)

            # 区域标题（中文）
            reg_name = Text(reg["zh_name"], font=CJK, color=reg["color"]).scale(0.46)
            reg_name.move_to([rx0 + 3.0, 2.0, 0])

            # 范围公式
            range_formula = MathTex(reg["label"], color=reg["color"]).scale(0.65)
            range_formula.next_to(reg_name, DOWN, buff=0.25)

            # 净电流说明
            enc_note = Text(reg["enc_zh"], font=CJK).scale(0.4)
            enc_note.next_to(range_formula, DOWN, buff=0.25)

            enc_eq = MathTex(reg["enc_eq"], color=CYAN).scale(0.6)
            enc_eq.next_to(enc_note, DOWN, buff=0.2)
            if enc_eq.width > 6.5:
                enc_eq.scale_to_fit_width(6.5)

            # 安培定理展开
            amp_expand = MathTex(r"B \cdot 2\pi r = \mu_0 I_{enc}",
                                 color=WHITE).scale(0.65)
            amp_expand.next_to(enc_eq, DOWN, buff=0.3)

            # 结果
            result = MathTex(reg["result_eq"], color=GREEN).scale(0.7)
            result.next_to(amp_expand, DOWN, buff=0.3)
            if result.width > 6.8:
                result.scale_to_fit_width(6.8)

            # 趋势说明
            trend = Text(reg["trend_zh"], font=CJK, color=ORANGE).scale(0.42)
            trend.next_to(result, DOWN, buff=0.25)

            right_group = VGroup(reg_name, range_formula, enc_note,
                                 enc_eq, amp_expand, result, trend)
            # 整体安全检查宽度
            if right_group.width > 6.8:
                right_group.scale_to_fit_width(6.8)
            right_group.move_to([rx0 + right_group.width / 2 + 0.3,
                                  right_group.get_center()[1], 0])

            self.play(
                Create(loop_circle),
                FadeIn(r_dot),
                run_time=0.9
            )
            self.play(FadeIn(reg_name), Write(range_formula))
            self.wait(0.5)
            self.play(FadeIn(enc_note), Write(enc_eq))
            self.wait(0.6)
            self.play(Write(amp_expand))
            self.wait(0.5)
            self.play(Write(result))
            self.play(FadeIn(trend))
            self.wait(1.6)
            self.play(FadeOut(VGroup(loop_circle, r_dot, right_group)))

        self.play(FadeOut(VGroup(bg, region_title)))

        # ════════════════════════════════════════════════════════
        # Step 5: 四段公式汇总对比展示
        # ════════════════════════════════════════════════════════
        formula_title = Text("四区域磁场公式汇总", font=CJK, color=BLUE).scale(0.52)
        formula_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(formula_title))

        f1 = MathTex(r"B_1 = \frac{\mu_0 I r}{2\pi R_1^2}", color=ORANGE).scale(0.72)
        l1 = VGroup(MathTex(r"(r < R_1)", color=ORANGE).scale(0.55), f1).arrange(RIGHT, buff=0.4)

        f2 = MathTex(r"B_2 = \frac{\mu_0 I}{2\pi r}", color=GREEN).scale(0.72)
        l2 = VGroup(MathTex(r"(R_1 < r < R_2)", color=GREEN).scale(0.55), f2).arrange(RIGHT, buff=0.4)

        f3 = MathTex(r"B_3 = \frac{\mu_0 I}{2\pi r}\cdot\frac{R_3^2 - r^2}{R_3^2 - R_2^2}",
                     color=YELLOW).scale(0.65)
        l3 = VGroup(MathTex(r"(R_2 < r < R_3)", color=YELLOW).scale(0.55), f3).arrange(RIGHT, buff=0.4)

        f4 = MathTex(r"B_4 = 0", color=RED).scale(0.72)
        l4 = VGroup(MathTex(r"(r > R_3)", color=RED).scale(0.55), f4).arrange(RIGHT, buff=0.4)

        all_formulas = VGroup(l1, l2, l3, l4).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        all_formulas.next_to(formula_title, DOWN, buff=0.45)
        if all_formulas.width > 12.5:
            all_formulas.scale_to_fit_width(12.5)
        all_formulas.center().next_to(formula_title, DOWN, buff=0.45)

        for line in [l1, l2, l3, l4]:
            self.play(FadeIn(line))
            self.wait(0.7)

        cont_note = Text("连续条件：在 r=R1 和 r=R2 处 B 连续；在 r=R3 处 B 降为 0",
                         font=CJK, color=CYAN).scale(0.42)
        cont_note.next_to(all_formulas, DOWN, buff=0.38)
        self.play(FadeIn(cont_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(formula_title, all_formulas, cont_note)))

        # ════════════════════════════════════════════════════════
        # Step 6: B-r 曲线逐段绘制（坐标轴 + ValueTracker）
        # ════════════════════════════════════════════════════════
        curve_title = Text("B-r 分布曲线", font=CJK, color=BLUE).scale(0.52)
        curve_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(curve_title))

        # 坐标轴
        ax = Axes(
            x_range=[0, 4.0, 1.0],
            y_range=[0, 1.3, 0.5],
            x_length=9.0,
            y_length=4.5,
            axis_config={"color": WHITE, "include_tip": True, "tip_length": 0.2},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        )
        ax.next_to(curve_title, DOWN, buff=0.4)
        ax.shift(DOWN * 0.1)

        x_label = MathTex(r"r", color=WHITE).scale(0.6)
        x_label.next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        y_label = MathTex(r"B", color=WHITE).scale(0.6)
        y_label.next_to(ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))

        # R1, R2, R3 竖虚线 + 标签
        def v_dashed(r_val, clr, lbl_str):
            x_screen = ax.c2p(r_val, 0)
            top_pt = ax.c2p(r_val, 1.25)
            dl = DashedLine(x_screen, top_pt, color=clr, stroke_width=1.8,
                            dash_length=0.12)
            lbl = MathTex(lbl_str, color=clr).scale(0.5)
            lbl.next_to([x_screen[0], ax.c2p(0, 0)[1], 0], DOWN, buff=0.18)
            return dl, lbl

        dl1, lbl_r1 = v_dashed(R1, ORANGE, r"R_1")
        dl2, lbl_r2 = v_dashed(R2, WHITE, r"R_2")
        dl3, lbl_r3 = v_dashed(R3, CYAN, r"R_3")

        self.play(Create(dl1), FadeIn(lbl_r1),
                  Create(dl2), FadeIn(lbl_r2),
                  Create(dl3), FadeIn(lbl_r3))

        # B 峰值参考虚线
        b_peak_x = ax.c2p(R1, B_val(R1))
        b_peak_y0 = ax.c2p(0, B_val(R1))
        h_dl = DashedLine(b_peak_y0, b_peak_x, color=GRAY, stroke_width=1.5,
                          dash_length=0.1)
        b_peak_lbl = VGroup(
            MathTex(r"\frac{\mu_0 I}{2\pi R_1}", color=GRAY).scale(0.45)
        )
        b_peak_lbl.next_to(b_peak_y0, LEFT, buff=0.12)
        self.play(Create(h_dl), FadeIn(b_peak_lbl))

        # 逐段绘制曲线
        NPTS = 80

        # 区域 ① r < R1  线性
        seg1_pts = [ax.c2p(r, B_val(r))
                    for r in np.linspace(0.001, R1, NPTS)]
        seg1 = VMobject(color=ORANGE, stroke_width=3.5)
        seg1.set_points_smoothly(seg1_pts)

        lbl_seg1 = VGroup(
            MathTex(r"B\propto r", color=ORANGE).scale(0.5)
        ).move_to(ax.c2p(R1 * 0.45, B_val(R1 * 0.45) + 0.12))

        self.play(Create(seg1), run_time=1.2)
        self.play(FadeIn(lbl_seg1))
        self.wait(0.6)

        # 区域 ② R1 < r < R2  1/r
        seg2_pts = [ax.c2p(r, B_val(r))
                    for r in np.linspace(R1, R2, NPTS)]
        seg2 = VMobject(color=GREEN, stroke_width=3.5)
        seg2.set_points_smoothly(seg2_pts)

        lbl_seg2 = VGroup(
            MathTex(r"B\propto 1/r", color=GREEN).scale(0.5)
        ).move_to(ax.c2p((R1 + R2) / 2, B_val((R1 + R2) / 2) + 0.12))

        self.play(Create(seg2), run_time=1.2)
        self.play(FadeIn(lbl_seg2))
        self.wait(0.6)

        # 区域 ③ R2 < r < R3
        seg3_pts = [ax.c2p(r, B_val(r))
                    for r in np.linspace(R2, R3, NPTS)]
        seg3 = VMobject(color=YELLOW, stroke_width=3.5)
        seg3.set_points_smoothly(seg3_pts)

        lbl_seg3 = VGroup(
            MathTex(r"B\to 0", color=YELLOW).scale(0.5)
        ).move_to(ax.c2p((R2 + R3) / 2 + 0.05, B_val((R2 + R3) / 2) + 0.12))

        self.play(Create(seg3), run_time=1.0)
        self.play(FadeIn(lbl_seg3))
        self.wait(0.6)

        # 区域 ④ r > R3  B=0
        seg4_pts = [ax.c2p(r, 0.0) for r in np.linspace(R3, 3.8, NPTS)]
        seg4 = VMobject(color=RED, stroke_width=3.5)
        seg4.set_points_smoothly(seg4_pts)

        lbl_seg4 = MathTex(r"B=0", color=RED).scale(0.5)
        lbl_seg4.move_to(ax.c2p(3.2, 0.12))

        self.play(Create(seg4), run_time=0.8)
        self.play(FadeIn(lbl_seg4))
        self.wait(0.6)

        # 连续条件标注（在 R1、R2 处打点）
        dot_r1 = Dot(ax.c2p(R1, B_val(R1)), color=WHITE, radius=0.09)
        dot_r2 = Dot(ax.c2p(R2, B_val(R2)), color=WHITE, radius=0.09)
        dot_r3 = Dot(ax.c2p(R3, 0.0), color=WHITE, radius=0.09)

        cont_note2 = Text("曲线在 R1、R2 处连续，在 R3 处降至零", font=CJK, color=CYAN).scale(0.42)
        cont_note2.to_edge(DOWN, buff=0.35)
        self.play(Create(dot_r1), Create(dot_r2), Create(dot_r3))
        self.play(FadeIn(cont_note2))
        self.wait(2.0)

        curve_objs = VGroup(ax, x_label, y_label, dl1, dl2, dl3,
                            lbl_r1, lbl_r2, lbl_r3, h_dl, b_peak_lbl,
                            seg1, seg2, seg3, seg4,
                            lbl_seg1, lbl_seg2, lbl_seg3, lbl_seg4,
                            dot_r1, dot_r2, dot_r3, cont_note2, curve_title)
        self.play(FadeOut(curve_objs))

        # ════════════════════════════════════════════════════════
        # Step 7: 物理意义小结
        # ════════════════════════════════════════════════════════
        phys_title = Text("物理意义解读", font=CJK, color=BLUE).scale(0.52)
        phys_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(phys_title))

        p1 = Text("① 内导体内：均匀电流密度 → B 随 r 线性增大",
                  font=CJK, color=ORANGE).scale(0.44)
        p2 = Text("② 间隙区：安培回路只包围 +I → B ∝ 1/r（类似长直导线）",
                  font=CJK, color=GREEN).scale(0.44)
        p3 = Text("③ 外导体内：外层电流逐渐抵消内层 → B 非线性减小",
                  font=CJK, color=YELLOW).scale(0.44)
        p4 = Text("④ 外导体外：+I 与 -I 完全抵消 → B = 0（完美屏蔽）",
                  font=CJK, color=RED).scale(0.44)

        phys_pts = VGroup(p1, p2, p3, p4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        phys_pts.next_to(phys_title, DOWN, buff=0.45)
        if phys_pts.width > 13.0:
            phys_pts.scale_to_fit_width(13.0)
        phys_pts.center().next_to(phys_title, DOWN, buff=0.45)

        for p in [p1, p2, p3, p4]:
            self.play(FadeIn(p))
            self.wait(0.7)
        self.wait(1.2)
        self.play(FadeOut(VGroup(phys_title, phys_pts)))

        # ════════════════════════════════════════════════════════
        # Step 8: 小结卡（关键公式汇总 + 方框）
        # ════════════════════════════════════════════════════════
        sum_title = Text("小结：同轴电缆磁场", font=CJK, color=BLUE).scale(0.55)
        sum_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sum_title))

        sf1 = MathTex(r"B_1 = \frac{\mu_0 I r}{2\pi R_1^2}", color=ORANGE).scale(0.75)
        sl1 = VGroup(MathTex(r"r < R_1", color=ORANGE).scale(0.5), sf1).arrange(RIGHT, buff=0.5)

        sf2 = MathTex(r"B_2 = \frac{\mu_0 I}{2\pi r}", color=GREEN).scale(0.75)
        sl2 = VGroup(MathTex(r"R_1 < r < R_2", color=GREEN).scale(0.5), sf2).arrange(RIGHT, buff=0.5)

        sf3 = MathTex(r"B_3 = \frac{\mu_0 I}{2\pi r}\cdot\frac{R_3^2-r^2}{R_3^2-R_2^2}",
                      color=YELLOW).scale(0.65)
        sl3 = VGroup(MathTex(r"R_2 < r < R_3", color=YELLOW).scale(0.5), sf3).arrange(RIGHT, buff=0.5)

        sf4 = MathTex(r"B_4 = 0", color=RED).scale(0.75)
        sl4 = VGroup(MathTex(r"r > R_3", color=RED).scale(0.5), sf4).arrange(RIGHT, buff=0.5)

        key_note = Text("外导体外磁场为零 = 同轴电缆抗干扰的物理根源",
                        font=CJK, color=CYAN).scale(0.43)

        sum_group = VGroup(sl1, sl2, sl3, sl4, key_note).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        sum_group.next_to(sum_title, DOWN, buff=0.4)
        if sum_group.width > 12.8:
            sum_group.scale_to_fit_width(12.8)
        sum_group.center().next_to(sum_title, DOWN, buff=0.4)

        box = SurroundingRectangle(sum_group, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(sf1), Write(sf2))
        self.wait(0.5)
        self.play(Write(sf3), Write(sf4))
        self.wait(0.5)
        self.play(FadeIn(sl1[0]), FadeIn(sl2[0]), FadeIn(sl3[0]), FadeIn(sl4[0]))
        self.play(FadeIn(key_note), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(sum_title, sum_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch08Ex1CoaxialCableBDistribution",
        "id": "phys-ch08-8.3-ex1-coaxial-cable-b-distribution",
        "chapterId": "ch08",
        "sectionId": "8.3",
        "title": "同轴电缆各区域磁场与B-r曲线",
        "description": "用安培环路定理逐区域推导同轴电缆磁场，ValueTracker动态展示安培回路，最后逐段绘制B-r分布曲线并揭示电磁屏蔽原理。",
    }
]
