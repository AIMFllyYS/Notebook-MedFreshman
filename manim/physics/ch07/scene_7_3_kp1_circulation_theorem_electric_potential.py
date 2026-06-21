"""第 7.3 节 · 环路定理与电势的引入

三幕结构：
  幕一 —— 静电力做功路径无关 → 环路积分 = 0
  幕二 —— 等势面与电场线正交（ValueTracker 调整 V）
  幕三 —— 电势定义积分 + V(r) = kq/r 曲线

铁律：MathTex 只含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数（动画用标准化值） ──────────────────────────────────────────
K_E = 9.0   # 标准化 k，使距离 1 处 V=9


class Ch07Kp1CirculationTheoremElectricPotential(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("环路定理与电势的引入", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("把书从桌上拿起再放回原处——重力做功为零。", font=CJK).scale(0.48)
        ana2 = Text("静电力也有类似性质：绕一圈回到起点，做功恰好为零。", font=CJK).scale(0.48)
        ana3 = Text("这就是静电场的「环路定理」，也是引入电势的出发点。", font=CJK, color=GREEN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════
        # 幕一：路径无关 → 环路定理
        # ══════════════════════════════════════════════════════════════

        # Step 3: 两条路径做功相等
        act1_title = Text("幕一：静电力做功与路径无关", font=CJK, color=BLUE).scale(0.52)
        act1_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(act1_title))

        # 点电荷 +q 在原点
        origin = np.array([0.0, -0.5, 0.0])
        charge_dot = Dot(point=origin, radius=0.18, color=RED)
        charge_label = MathTex(r"+q", color=RED).scale(0.65).next_to(charge_dot, DOWN, buff=0.12)

        # A、B 两点
        pt_A = origin + np.array([-2.2, 1.8, 0.0])
        pt_B = origin + np.array([2.0, 1.6, 0.0])
        dot_A = Dot(pt_A, color=YELLOW, radius=0.10)
        dot_B = Dot(pt_B, color=GREEN, radius=0.10)
        lbl_A = Text("A", font=CJK, color=YELLOW).scale(0.45).next_to(dot_A, UL, buff=0.08)
        lbl_B = Text("B", font=CJK, color=GREEN).scale(0.45).next_to(dot_B, UR, buff=0.08)

        self.play(Create(charge_dot), FadeIn(charge_label))
        self.play(FadeIn(dot_A), FadeIn(lbl_A), FadeIn(dot_B), FadeIn(lbl_B))
        self.wait(0.6)

        # 路径1：折线 A→中间点→B（粗蓝色）
        mid1 = origin + np.array([-0.3, 2.6, 0.0])
        path1 = VMobject(color=BLUE, stroke_width=3)
        path1.set_points_as_corners([pt_A, mid1, pt_B])

        # 路径2：弧线 A→B（橙色）
        # 用 CubicBezier 近似弧线
        ctrl1 = origin + np.array([-2.8, 0.2, 0.0])
        ctrl2 = origin + np.array([2.8, 0.2, 0.0])
        path2 = CubicBezier(pt_A, ctrl1, ctrl2, pt_B, color=ORANGE, stroke_width=3)

        path1_lbl = Text("路径1", font=CJK, color=BLUE).scale(0.42).move_to(mid1 + np.array([0, 0.32, 0]))
        path2_lbl = Text("路径2", font=CJK, color=ORANGE).scale(0.42).move_to(origin + np.array([0, -1.5, 0]))

        self.play(Create(path1), FadeIn(path1_lbl))
        self.wait(0.4)
        self.play(Create(path2), FadeIn(path2_lbl))
        self.wait(0.8)

        # 做功公式与相等结论
        w_eq = MathTex(
            r"W_1 = \int_A^B \mathbf{E}\cdot\mathrm{d}\mathbf{l} = W_2",
            color=YELLOW
        ).scale(0.72).to_corner(DR, buff=0.55)
        self.play(Write(w_eq))
        self.wait(1.0)

        # 数字对比框
        box_left = VGroup(
            Text("路径1做功", font=CJK, color=BLUE).scale(0.42),
            MathTex(r"W_1 = q\Delta V", color=BLUE).scale(0.72),
        ).arrange(DOWN, buff=0.15)
        box_right = VGroup(
            Text("路径2做功", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"W_2 = q\Delta V", color=ORANGE).scale(0.72),
        ).arrange(DOWN, buff=0.15)
        eq_sign = MathTex(r"=", color=GREEN).scale(0.9)
        compare = VGroup(box_left, eq_sign, box_right).arrange(RIGHT, buff=0.4)
        compare.to_corner(UR, buff=0.5)
        cmp_rect = SurroundingRectangle(compare, color=GREEN, buff=0.15, corner_radius=0.1)
        self.play(FadeIn(compare), Create(cmp_rect))
        self.wait(1.2)

        # Step 4: 闭合路径 → 环路做功 = 0
        loop_note = Text("将两条路径首尾相接，构成闭合环路：", font=CJK, color=WHITE).scale(0.45)
        loop_note.next_to(act1_title, DOWN, buff=0.3)
        self.play(FadeOut(compare), FadeOut(cmp_rect), FadeOut(w_eq))
        self.play(FadeIn(loop_note))

        # 闭合路径：path1 正向 + path2 反向
        path2_rev = CubicBezier(pt_B, ctrl2, ctrl1, pt_A, color=ORANGE,
                                stroke_width=3, stroke_opacity=0.7)
        loop_arrow = Arrow(pt_A + np.array([0.05, 0.05, 0.0]),
                           mid1 + np.array([-0.05, 0.0, 0.0]),
                           buff=0, color=BLUE, stroke_width=2,
                           max_tip_length_to_length_ratio=0.2)
        self.play(Create(path2_rev))
        self.play(Create(loop_arrow))
        self.wait(0.5)

        circ_formula = MathTex(r"\oint_L \mathbf{E}\cdot\mathrm{d}\mathbf{l}=0",
                               color=YELLOW).scale(0.92)
        circ_label = Text("静电场环路定理", font=CJK, color=GREEN).scale(0.48)
        circ_grp = VGroup(circ_formula, circ_label).arrange(DOWN, buff=0.2)
        circ_grp.to_corner(DR, buff=0.5)
        circ_box = SurroundingRectangle(circ_grp, color=YELLOW, buff=0.2, corner_radius=0.12)
        self.play(Write(circ_formula), FadeIn(circ_label), Create(circ_box))
        self.wait(1.8)

        # 清场幕一
        self.play(FadeOut(VGroup(
            act1_title, charge_dot, charge_label,
            dot_A, dot_B, lbl_A, lbl_B,
            path1, path1_lbl, path2, path2_lbl,
            path2_rev, loop_arrow, loop_note,
            circ_formula, circ_label, circ_box,
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # 幕二：等势面与电场线正交
        # ══════════════════════════════════════════════════════════════
        act2_title = Text("幕二：等势面——相同电势的曲面", font=CJK, color=BLUE).scale(0.52)
        act2_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(act2_title))
        self.wait(0.5)

        center = np.array([0.0, -0.2, 0.0])
        charge2 = Dot(center, radius=0.18, color=RED)
        lbl_q2 = MathTex(r"+q", color=RED).scale(0.65).next_to(charge2, DOWN, buff=0.1)
        self.play(Create(charge2), FadeIn(lbl_q2))

        # 12条电场线
        field_lines = VGroup()
        for i in range(12):
            ang = i * TAU / 12
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            fl = Arrow(center + d * 0.25, center + d * 2.6,
                       buff=0, color=YELLOW, stroke_width=2,
                       max_tip_length_to_length_ratio=0.15)
            field_lines.add(fl)
        self.play(Create(field_lines), run_time=1.2)
        self.wait(0.5)

        # ValueTracker 控制等势面半径
        v_tracker = ValueTracker(1.0)

        def make_equipotential():
            circles = VGroup()
            r_base = v_tracker.get_value()
            for fac, col in [(r_base, "#FF4444"), (r_base * 1.5, "#FF9900"),
                              (r_base * 2.2, "#4488FF")]:
                if fac < 2.8:
                    c = Circle(radius=fac, color=col, stroke_width=2.5, stroke_opacity=0.85)
                    c.move_to(center)
                    circles.add(c)
            return circles

        equi = always_redraw(make_equipotential)
        self.add(equi)
        self.wait(0.4)

        equi_note = Text("等势面（彩色圆）与电场线（黄色箭头）处处垂直正交",
                         font=CJK, color=CYAN).scale(0.42).to_edge(DOWN, buff=0.65)
        self.play(FadeIn(equi_note))
        self.wait(0.6)

        # 展示垂直相交——在 0° 方向画一条小垂直记号
        perp_pt = center + np.array([1.0, 0.0, 0.0])
        tick1 = Line(perp_pt + np.array([0, -0.15, 0]), perp_pt + np.array([0, 0.15, 0]),
                     color=GREEN, stroke_width=3)
        right_angle = Square(side_length=0.18, color=GREEN, stroke_width=2)
        right_angle.move_to(perp_pt + np.array([0.09, 0.09, 0.0]))
        perp_label = Text("垂直", font=CJK, color=GREEN).scale(0.38).next_to(right_angle, UR, buff=0.08)
        self.play(Create(tick1), Create(right_angle), FadeIn(perp_label))
        self.wait(0.8)

        # ValueTracker 扫动等势面半径
        v_note = VGroup(
            Text("改变 V 值，等势面向外或向内收缩：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"r = \frac{kq}{V}", color=CYAN).scale(0.7),
        ).arrange(DOWN, buff=0.15).to_corner(UR, buff=0.5)
        self.play(FadeIn(v_note))
        self.play(v_tracker.animate.set_value(0.5), run_time=1.5)
        self.wait(0.4)
        self.play(v_tracker.animate.set_value(1.5), run_time=1.5)
        self.wait(0.4)
        self.play(v_tracker.animate.set_value(1.0), run_time=1.0)
        self.wait(1.0)

        # 清场幕二
        self.play(FadeOut(VGroup(
            act2_title, charge2, lbl_q2, field_lines,
            tick1, right_angle, perp_label,
            equi_note, v_note,
        )))
        self.remove(equi)
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # 幕三：电势定义积分 + V(r)=kq/r 曲线
        # ══════════════════════════════════════════════════════════════
        act3_title = Text("幕三：电势定义与 V(r) 曲线", font=CJK, color=BLUE).scale(0.52)
        act3_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(act3_title))
        self.wait(0.5)

        # Step 7: 电势定义公式（逐步出现）
        def_note = Text("取无穷远处为电势零点，从场点 a 积分到无穷远：",
                        font=CJK).scale(0.46).next_to(act3_title, DOWN, buff=0.35)
        self.play(FadeIn(def_note))
        self.wait(0.6)

        va_def1 = MathTex(r"V_a = \int_a^{\infty} \mathbf{E}\cdot\mathrm{d}\mathbf{l}",
                          color=YELLOW).scale(0.90)
        va_def1.next_to(def_note, DOWN, buff=0.45)
        self.play(Write(va_def1))
        self.wait(1.0)

        va_def2 = MathTex(
            r"V_a = \frac{1}{4\pi\varepsilon_0}\frac{q}{r_a}",
            color=GREEN
        ).scale(0.90)
        va_def2.next_to(va_def1, DOWN, buff=0.35)
        self.play(TransformMatchingTex(va_def1.copy(), va_def2))
        self.wait(1.0)

        # 高亮 r_a
        highlight_note = VGroup(
            Text("r 越大，V 越小；r 趋于无穷，V 趋于 0", font=CJK, color=CYAN).scale(0.44),
        ).next_to(va_def2, DOWN, buff=0.25)
        self.play(FadeIn(highlight_note))
        self.wait(1.0)
        self.play(FadeOut(VGroup(def_note, va_def1, va_def2, highlight_note)))

        # Step 8: 积分路径动画
        int_note = Text("沿电场线方向从场点 a 积分到无穷远——\"累加\"每一小段 E·dl",
                        font=CJK).scale(0.44).next_to(act3_title, DOWN, buff=0.35)
        self.play(FadeIn(int_note))

        # 画点电荷 + 积分路径
        src = np.array([-3.5, -0.5, 0.0])
        charge3 = Dot(src, radius=0.18, color=RED)
        lbl_q3 = MathTex(r"+q", color=RED).scale(0.65).next_to(charge3, DOWN, buff=0.1)

        # 场点 a
        pt_a = src + np.array([1.1, 0.0, 0.0])
        dot_a = Dot(pt_a, color=YELLOW, radius=0.10)
        lbl_a = MathTex(r"a", color=YELLOW).scale(0.6).next_to(dot_a, DOWN, buff=0.1)

        # 积分路径（从 a 向右延伸到屏幕右边代表无穷远）
        inf_end = np.array([3.6, -0.5, 0.0])
        int_path = DashedLine(pt_a, inf_end, color=CYAN, stroke_width=2.5, dash_length=0.18)
        inf_label = MathTex(r"\infty", color=CYAN).scale(0.75).next_to(inf_end, RIGHT, buff=0.1)

        self.play(Create(charge3), FadeIn(lbl_q3))
        self.play(FadeIn(dot_a), FadeIn(lbl_a))
        self.play(Create(int_path), FadeIn(inf_label))
        self.wait(0.5)

        # 沿路径滑动的小箭头（代表 E·dl 积分过程）
        t_tracker = ValueTracker(0.0)
        slide_arrow = always_redraw(lambda: Arrow(
            pt_a + np.array([t_tracker.get_value() * (inf_end[0] - pt_a[0]), 0, 0]),
            pt_a + np.array([t_tracker.get_value() * (inf_end[0] - pt_a[0]) + 0.5, 0, 0]),
            buff=0, color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.35,
        ) if t_tracker.get_value() < 0.95 else VGroup())
        self.add(slide_arrow)

        # 右侧数轴累加电势值
        ax_v = NumberLine(x_range=[0, 12, 3], length=3.5, color=WHITE,
                          include_numbers=True, numbers_to_include=[0, 3, 6, 9, 12])
        ax_v.rotate(PI / 2)
        ax_v.to_corner(UR, buff=0.6)
        ax_v_label = VGroup(
            Text("V", font=CJK, color=CYAN).scale(0.5),
            Text("(单位: V)", font=CJK, color=WHITE).scale(0.38),
        ).arrange(DOWN, buff=0.1).next_to(ax_v, LEFT, buff=0.2)
        self.play(Create(ax_v), FadeIn(ax_v_label))

        # 移动指示点
        v_dot = always_redraw(lambda: Dot(
            ax_v.n2p(max(0.0, K_E * 1.0 / max(0.05, 1.1 + t_tracker.get_value() * 3.5))),
            color=YELLOW, radius=0.12,
        ))
        self.add(v_dot)
        self.play(t_tracker.animate.set_value(1.0), run_time=3.0)
        self.wait(0.8)
        self.remove(slide_arrow)
        self.play(FadeOut(VGroup(
            charge3, lbl_q3, dot_a, lbl_a, int_path, inf_label,
            ax_v, ax_v_label, int_note,
        )))
        self.remove(v_dot)
        self.wait(0.2)

        # Step 9: V(r) = kq/r 曲线
        curve_note = Text("点电荷电势随距离 r 的分布曲线：V(r) = kq/r",
                          font=CJK, color=WHITE).scale(0.46).next_to(act3_title, DOWN, buff=0.35)
        self.play(FadeIn(curve_note))

        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 12, 3],
            x_length=6.5,
            y_length=3.5,
            axis_config={"color": WHITE, "include_numbers": True},
        ).next_to(curve_note, DOWN, buff=0.35)
        x_lbl = MathTex(r"r").scale(0.6).next_to(axes.x_axis, RIGHT, buff=0.15)
        y_lbl = MathTex(r"V").scale(0.6).next_to(axes.y_axis, UP, buff=0.1)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 用颜色渐变：高 V 红色 → 低 V 蓝色
        def v_color(r_val):
            # r 从 0.4 到 5，V 从 22.5 到 1.8，归一化到 [0,1]
            v_max, v_min = K_E / 0.4, K_E / 5.0
            v = K_E / r_val
            t = (v - v_min) / (v_max - v_min)
            t = max(0.0, min(1.0, t))
            r_c = int(255 * t)
            b_c = int(255 * (1 - t))
            return f"#{r_c:02X}44{b_c:02X}"

        # 分段绘制彩色曲线
        curve_segs = VGroup()
        r_vals = np.linspace(0.42, 4.95, 60)
        for i in range(len(r_vals) - 1):
            r1, r2 = r_vals[i], r_vals[i + 1]
            seg = axes.plot(
                lambda x, _r1=r1, _r2=r2: K_E / x,
                x_range=[r1, r2],
                color=v_color((r1 + r2) / 2),
                stroke_width=3,
            )
            curve_segs.add(seg)

        self.play(Create(curve_segs), run_time=2.2)

        # V = kq/r 公式标注
        curve_formula = MathTex(
            r"V(r) = \frac{1}{4\pi\varepsilon_0}\frac{q}{r}",
            color=YELLOW
        ).scale(0.75).to_corner(UR, buff=0.5)
        color_legend_hi = VGroup(
            Text("高电势", font=CJK, color="#FF4444").scale(0.40),
            Text("低电势", font=CJK, color="#4444FF").scale(0.40),
        ).arrange(DOWN, buff=0.15).next_to(curve_formula, DOWN, buff=0.2)
        self.play(Write(curve_formula), FadeIn(color_legend_hi))
        self.wait(1.5)

        # 清场幕三
        self.play(FadeOut(VGroup(
            act3_title, curve_note, axes, x_lbl, y_lbl,
            curve_segs, curve_formula, color_legend_hi,
        )))
        self.wait(0.2)

        # ══════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"\oint_L \mathbf{E}\cdot\mathrm{d}\mathbf{l}=0",
                     color=YELLOW).scale(0.82)
        s1_zh = Text("环路定理：静电力做功与路径无关", font=CJK, color=WHITE).scale(0.42)
        s2 = MathTex(r"V_a = \int_a^{\infty}\mathbf{E}\cdot\mathrm{d}\mathbf{l}",
                     color=YELLOW).scale(0.82)
        s2_zh = Text("电势定义：场点 a 到无穷远的积分", font=CJK, color=WHITE).scale(0.42)
        s3 = MathTex(r"V = \frac{1}{4\pi\varepsilon_0}\frac{q}{r}",
                     color=GREEN).scale(0.82)
        s3_zh = Text("点电荷电势：与距离成反比", font=CJK, color=WHITE).scale(0.42)

        row1 = VGroup(s1, s1_zh).arrange(RIGHT, buff=0.4)
        row2 = VGroup(s2, s2_zh).arrange(RIGHT, buff=0.4)
        row3 = VGroup(s3, s3_zh).arrange(RIGHT, buff=0.4)
        summary = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1), FadeIn(s1_zh))
        self.wait(0.6)
        self.play(Write(s2), FadeIn(s2_zh))
        self.wait(0.6)
        self.play(Write(s3), FadeIn(s3_zh))
        self.wait(0.4)
        self.play(Create(box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch07Kp1CirculationTheoremElectricPotential",
        "id": "phys-ch07-7.3-kp1-circulation-theorem-electric-potential",
        "chapterId": "ch07",
        "sectionId": "7.3",
        "title": "环路定理与电势的引入",
        "description": "三幕动画：路径无关与环路定理→等势面与电场线正交（ValueTracker）→电势积分定义与 V=kq/r 曲线。",
    },
]
