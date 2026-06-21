"""第 9.3 节 · 例题 2：两同轴线圈互感等于自感几何平均。

物理动画范式：螺线管截面 2D 示意 + 磁感线 + 逐步公式推导 + 耦合系数对比。
铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ── 辅助：画椭圆螺线管截面（用 Ellipse 模拟线圈匝） ──────────────────────
def make_solenoid(cx, cy, width, height, n_turns, color, label_str, label_color):
    """返回 VGroup：多个椭圆（模拟线圈匝） + 文字标注。"""
    coils = VGroup()
    for i in range(n_turns):
        frac = i / max(n_turns - 1, 1)
        x_off = (frac - 0.5) * width
        e = Ellipse(width=0.22, height=height, color=color, stroke_width=2.5)
        e.move_to(np.array([cx + x_off, cy, 0]))
        coils.add(e)
    label = Text(label_str, font=CJK, color=label_color).scale(0.45)
    label.move_to(np.array([cx, cy + height / 2 + 0.38, 0]))
    return VGroup(coils, label)


class Ch09Ex2MutualInductanceGeometryMean(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("两同轴线圈互感等于自感几何平均", font=CJK, color=BLUE).scale(0.60)
        title.to_edge(UP, buff=0.30)
        subtitle_l = Text("第九章 电磁感应与电磁波", font=CJK, color=WHITE).scale(0.38)
        subtitle_r = Text("9.3 节 · 例题 2", font=CJK, color=WHITE).scale(0.38)
        subtitle = VGroup(subtitle_l, subtitle_r).arrange(RIGHT, buff=0.6)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("两个线圈套在同一铁心上——变压器的最简模型。", font=CJK).scale(0.48)
        ana2 = Text("线圈 1 的磁场 100% 穿过线圈 2，能量传递最完整。", font=CJK).scale(0.48)
        ana3 = Text("此时互感 M 与两线圈自感 L1、L2 有着精确的几何关系。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 画两同轴螺线管（2D 截面示意）
        # ══════════════════════════════════════════════════════════════════
        scene_label = Text("几何示意：共轴同长螺线管", font=CJK, color=BLUE).scale(0.50)
        scene_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scene_label))

        # 用矩形边框表示整体螺线管轮廓
        sol_rect = Rectangle(width=7.2, height=1.5, color=GRAY, stroke_width=1.5)
        sol_rect.move_to(np.array([0, -0.5, 0]))

        # 线圈 1（蓝色，左半段，N1 匝模拟 7 个椭圆）
        coil1 = make_solenoid(-1.8, -0.5, 3.2, 1.5, 7, BLUE, "N1 匝（线圈 1）", BLUE)
        # 线圈 2（橙色，右半段，N2 匝模拟 5 个椭圆）
        coil2 = make_solenoid(1.8, -0.5, 3.2, 1.5, 5, ORANGE, "N2 匝（线圈 2）", ORANGE)

        # 轴线（虚线）
        axis_line = DashedLine(
            start=np.array([-3.8, -0.5, 0]),
            end=np.array([3.8, -0.5, 0]),
            color=GRAY, dash_length=0.18, stroke_width=1.5
        )

        # 截面尺寸标注
        brace_width = Brace(sol_rect, DOWN, color=WHITE)
        brace_label_l = Text("长度", font=CJK, color=WHITE).scale(0.38)
        brace_label_r = MathTex(r"l", color=WHITE).scale(0.65)
        brace_label = VGroup(brace_label_l, brace_label_r).arrange(RIGHT, buff=0.08)
        brace_label.next_to(brace_width, DOWN, buff=0.12)

        s_label_l = Text("截面积", font=CJK, color=WHITE).scale(0.38)
        s_label_r = MathTex(r"S", color=WHITE).scale(0.65)
        s_label = VGroup(s_label_l, s_label_r).arrange(RIGHT, buff=0.08)
        s_label.next_to(sol_rect, RIGHT, buff=0.18)

        self.play(Create(sol_rect), Create(axis_line))
        self.play(Create(coil1), Create(coil2))
        self.play(GrowFromCenter(brace_width), FadeIn(brace_label), FadeIn(s_label))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 给线圈 1 通电，画磁感线
        # ══════════════════════════════════════════════════════════════════
        current_label = VGroup(
            Text("线圈 1 通电", font=CJK, color=BLUE).scale(0.44),
            MathTex(r"I_1", color=BLUE).scale(0.75)
        ).arrange(RIGHT, buff=0.15)
        current_label.to_corner(UL, buff=0.6)
        current_label.shift(DOWN * 0.8)
        self.play(FadeIn(current_label))

        # 管内磁感线：水平蓝色箭头（5 条，代表均匀磁场）
        field_arrows = VGroup()
        for row in [-0.10, -0.35, -0.50, -0.65, -0.90]:
            arr = Arrow(
                start=np.array([-3.2, row, 0]),
                end=np.array([3.2, row, 0]),
                buff=0, color=BLUE, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.06
            )
            field_arrows.add(arr)

        b1_label = VGroup(
            MathTex(r"B_1 = \mu_0 n_1 I_1", color=BLUE).scale(0.70)
        )
        b1_label.next_to(sol_rect, UP, buff=1.0)

        self.play(LaggedStart(*[GrowArrow(a) for a in field_arrows], lag_ratio=0.15))
        self.play(Write(b1_label))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 高亮磁感线穿过线圈 2 每匝，写出磁链
        # ══════════════════════════════════════════════════════════════════
        # 在线圈 2 区域叠一个橙色高亮矩形
        coil2_highlight = Rectangle(
            width=3.4, height=1.5, color=ORANGE, stroke_width=3.5,
            fill_color=ORANGE, fill_opacity=0.12
        ).move_to(np.array([1.8, -0.5, 0]))

        flux_note = VGroup(
            Text("每条磁感线同时穿过线圈 2 的每匝", font=CJK, color=ORANGE).scale(0.43)
        )
        flux_note.next_to(sol_rect, DOWN, buff=1.0)

        psi21_eq = MathTex(
            r"\Psi_{21}", r"=", r"N_2", r"\cdot", r"B_1", r"\cdot", r"S",
            color=WHITE
        ).scale(0.80)
        psi21_eq[0].set_color(ORANGE)
        psi21_eq[2].set_color(ORANGE)
        psi21_eq[4].set_color(BLUE)
        psi21_eq.next_to(flux_note, DOWN, buff=0.28)

        self.play(FadeIn(coil2_highlight))
        self.play(FadeIn(flux_note))
        self.play(Write(psi21_eq))
        self.wait(1.6)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 推导互感 M
        # ══════════════════════════════════════════════════════════════════
        m_derive_1 = MathTex(
            r"M", r"=", r"\frac{\Psi_{21}}{I_1}",
            r"=", r"\frac{N_2 B_1 S}{I_1}",
            color=WHITE
        ).scale(0.80)
        m_derive_1[0].set_color(GREEN)
        m_derive_1[2].set_color(ORANGE)

        m_derive_2 = MathTex(
            r"M = \frac{N_2 \cdot \mu_0 n_1 I_1 \cdot S}{I_1}",
            color=WHITE
        ).scale(0.78)

        m_result = MathTex(
            r"M = \mu_0 n_1 n_2 S l",
            color=GREEN
        ).scale(0.92)

        box_m = SurroundingRectangle(m_result, color=GREEN, buff=0.18, corner_radius=0.10)

        derive_group = VGroup(m_derive_1, m_derive_2, m_result).arrange(DOWN, buff=0.38)
        derive_group.next_to(sol_rect, DOWN, buff=1.2)
        derive_group.scale_to_fit_width(11)

        # 清掉之前的 flux 注释，给推导腾位
        self.play(FadeOut(flux_note), FadeOut(psi21_eq))
        self.play(Write(m_derive_1))
        self.wait(1.0)
        self.play(Write(m_derive_2))
        self.wait(1.0)

        note_sub = VGroup(
            Text("代入", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"B_1 = \mu_0 n_1 I_1", color=BLUE).scale(0.55),
            Text("，约去", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"I_1", color=BLUE).scale(0.55),
            Text("，并令", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"N_2 = n_2 l", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.08)
        note_sub.next_to(m_derive_2, DOWN, buff=0.22)
        note_sub.scale_to_fit_width(12)
        self.play(FadeIn(note_sub))
        self.wait(0.8)

        self.play(Write(m_result), Create(box_m))
        self.wait(1.6)

        # 清场，保留标题
        self.play(FadeOut(VGroup(
            sol_rect, axis_line, coil1, coil2,
            brace_width, brace_label, s_label,
            field_arrows, b1_label, current_label,
            coil2_highlight, m_derive_1, m_derive_2,
            note_sub, m_result, box_m, scene_label
        )))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 写出 L1、L2 并推导几何平均
        # ══════════════════════════════════════════════════════════════════
        geo_label = Text("自感的几何平均推导", font=CJK, color=BLUE).scale(0.52)
        geo_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(geo_label))

        l1_eq = MathTex(r"L_1 = \mu_0 n_1^2 S l", color=BLUE).scale(0.85)
        l2_eq = MathTex(r"L_2 = \mu_0 n_2^2 S l", color=ORANGE).scale(0.85)
        l_group = VGroup(l1_eq, l2_eq).arrange(RIGHT, buff=1.0)
        l_group.next_to(geo_label, DOWN, buff=0.55)

        self.play(Write(l1_eq))
        self.wait(0.6)
        self.play(Write(l2_eq))
        self.wait(1.2)

        # L1 * L2 展开
        prod_eq = MathTex(
            r"L_1 \cdot L_2",
            r"=",
            r"\left(\mu_0 n_1^2 S l\right)",
            r"\cdot",
            r"\left(\mu_0 n_2^2 S l\right)"
        ).scale(0.78)
        prod_eq[0].set_color(YELLOW)
        prod_eq[2].set_color(BLUE)
        prod_eq[4].set_color(ORANGE)
        prod_eq.next_to(l_group, DOWN, buff=0.55)

        prod_eq2 = MathTex(
            r"L_1 \cdot L_2 = \mu_0^2\, n_1^2\, n_2^2\, S^2\, l^2"
        ).scale(0.78)
        prod_eq2.set_color(YELLOW)
        prod_eq2.next_to(prod_eq, DOWN, buff=0.38)

        self.play(Write(prod_eq))
        self.wait(1.0)
        self.play(Write(prod_eq2))
        self.wait(1.0)

        # 开根号
        sqrt_step = MathTex(
            r"\sqrt{L_1 L_2}",
            r"=",
            r"\sqrt{\mu_0^2\, n_1^2\, n_2^2\, S^2\, l^2}",
            r"=",
            r"\mu_0 n_1 n_2 S l"
        ).scale(0.82)
        sqrt_step[0].set_color(YELLOW)
        sqrt_step[2].set_color(YELLOW)
        sqrt_step[4].set_color(GREEN)
        sqrt_step.next_to(prod_eq2, DOWN, buff=0.42)
        sqrt_step.scale_to_fit_width(12)

        self.play(Write(sqrt_step))
        self.wait(1.2)

        # 最终等式高亮
        final_eq = MathTex(
            r"M = \mu_0 n_1 n_2 S l = \sqrt{L_1 L_2}"
        ).scale(1.0)
        final_eq.set_color(GREEN)
        final_eq.next_to(sqrt_step, DOWN, buff=0.48)
        box_final = SurroundingRectangle(final_eq, color=GREEN, buff=0.22, corner_radius=0.12)

        self.play(Write(final_eq), Create(box_final))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            geo_label, l_group, prod_eq, prod_eq2, sqrt_step, final_eq, box_final
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 耦合系数 k — 完全耦合 vs 部分耦合
        # ══════════════════════════════════════════════════════════════════
        k_label = Text("耦合系数 k：衡量磁通量的共享程度", font=CJK, color=BLUE).scale(0.50)
        k_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(k_label))

        k_def = MathTex(
            r"k = \frac{M}{\sqrt{L_1 L_2}},\quad 0 \le k \le 1"
        ).scale(0.82)
        k_def.next_to(k_label, DOWN, buff=0.50)
        self.play(Write(k_def))
        self.wait(1.2)

        # --- 两种情况对比 ---
        # 左：完全耦合 k=1（两线圈同轴对齐，磁感线全穿过）
        case_l_title = VGroup(
            Text("完全耦合", font=CJK, color=GREEN).scale(0.46),
            MathTex(r"k = 1", color=GREEN).scale(0.72)
        ).arrange(RIGHT, buff=0.12)
        case_l_title.move_to(np.array([-3.2, 0.2, 0]))

        rect_l = Rectangle(width=2.8, height=1.1, color=GREEN, stroke_width=2)
        rect_l.move_to(np.array([-3.2, -0.65, 0]))
        arrows_l = VGroup(*[
            Arrow(np.array([-4.4, -0.4 - 0.25 * i, 0]),
                  np.array([-2.0, -0.4 - 0.25 * i, 0]),
                  buff=0, color=BLUE, stroke_width=2,
                  max_tip_length_to_length_ratio=0.10)
            for i in range(3)
        ])
        note_l = Text("磁感线全部穿过线圈 2", font=CJK, color=GREEN).scale(0.36)
        note_l.next_to(rect_l, DOWN, buff=0.18)

        # 右：部分耦合 k<1（线圈有倾斜，部分磁感线泄漏）
        case_r_title = VGroup(
            Text("部分耦合", font=CJK, color=RED).scale(0.46),
            MathTex(r"k < 1", color=RED).scale(0.72)
        ).arrange(RIGHT, buff=0.12)
        case_r_title.move_to(np.array([3.2, 0.2, 0]))

        rect_r = Rectangle(width=2.8, height=1.1, color=RED, stroke_width=2)
        rect_r.move_to(np.array([3.2, -0.65, 0]))

        # 部分穿过（2 条直通）
        arrows_r_in = VGroup(*[
            Arrow(np.array([2.0, -0.4 - 0.3 * i, 0]),
                  np.array([4.4, -0.4 - 0.3 * i, 0]),
                  buff=0, color=BLUE, stroke_width=2,
                  max_tip_length_to_length_ratio=0.10)
            for i in range(2)
        ])
        # 泄漏磁感线（弯出矩形）
        leak1 = CurvedArrow(
            np.array([2.0, -0.40, 0]),
            np.array([4.4, -0.40, 0]),
            radius=-1.4, color=GRAY, stroke_width=1.8
        )
        note_r = Text("部分磁感线泄漏（绕开线圈 2）", font=CJK, color=RED).scale(0.36)
        note_r.next_to(rect_r, DOWN, buff=0.18)

        divider = DashedLine(
            np.array([0.0, 1.0, 0]), np.array([0.0, -2.0, 0]),
            color=GRAY, stroke_width=1.2, dash_length=0.15
        )

        self.play(Create(divider))
        self.play(FadeIn(case_l_title), Create(rect_l))
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows_l], lag_ratio=0.2))
        self.play(FadeIn(note_l))
        self.wait(0.8)
        self.play(FadeIn(case_r_title), Create(rect_r))
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows_r_in], lag_ratio=0.2))
        self.play(Create(leak1))
        self.play(FadeIn(note_r))
        self.wait(1.6)

        self.play(FadeOut(VGroup(
            k_label, k_def, divider,
            case_l_title, rect_l, arrows_l, note_l,
            case_r_title, rect_r, arrows_r_in, leak1, note_r
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_head = Text("数值例子", font=CJK, color=BLUE).scale(0.52)
        ex_head.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_head))

        cond_1 = VGroup(
            Text("已知：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"n_1 = 1000\ \mathrm{m^{-1}},\ n_2 = 2000\ \mathrm{m^{-1}}",
                    color=WHITE).scale(0.60)
        ).arrange(RIGHT, buff=0.1)
        cond_2 = VGroup(
            Text("          ", font=CJK).scale(0.44),
            MathTex(r"S = 4\times10^{-4}\ \mathrm{m^2},\ l = 0.5\ \mathrm{m}",
                    color=WHITE).scale(0.60)
        ).arrange(RIGHT, buff=0.1)
        cond_group = VGroup(cond_1, cond_2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        cond_group.next_to(ex_head, DOWN, buff=0.42)
        self.play(FadeIn(cond_group))
        self.wait(1.0)

        calc_m = MathTex(
            r"M = \mu_0 n_1 n_2 S l",
            r"= 4\pi\times10^{-7} \times 10^3 \times 2\times10^3 \times 4\times10^{-4} \times 0.5"
        ).scale(0.62)
        calc_m.next_to(cond_group, DOWN, buff=0.38)
        calc_m.scale_to_fit_width(12)

        calc_res = MathTex(r"M \approx 5.03 \times 10^{-4}\ \mathrm{H}", color=GREEN).scale(0.80)
        calc_res.next_to(calc_m, DOWN, buff=0.30)

        l1_num = MathTex(
            r"L_1 = \mu_0 n_1^2 S l \approx 2.51\times10^{-4}\ \mathrm{H}", color=BLUE
        ).scale(0.68)
        l2_num = MathTex(
            r"L_2 = \mu_0 n_2^2 S l \approx 1.005\times10^{-3}\ \mathrm{H}", color=ORANGE
        ).scale(0.68)
        verify = MathTex(
            r"\sqrt{L_1 L_2} = \sqrt{2.51\times10^{-4}\times1.005\times10^{-3}}"
            r"\approx 5.02\times10^{-4}\ \mathrm{H} \approx M",
            color=GREEN
        ).scale(0.62)

        num_group = VGroup(l1_num, l2_num, verify).arrange(DOWN, buff=0.26, aligned_edge=LEFT)
        num_group.next_to(calc_res, DOWN, buff=0.32)
        num_group.scale_to_fit_width(12)

        self.play(Write(calc_m))
        self.wait(0.8)
        self.play(Write(calc_res))
        self.wait(0.8)
        self.play(Write(l1_num))
        self.play(Write(l2_num))
        self.wait(0.8)
        self.play(Write(verify))
        self.wait(1.8)

        self.play(FadeOut(VGroup(ex_head, cond_group, calc_m, calc_res, num_group)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        sum_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sum_title))

        s1 = MathTex(r"M = \mu_0 n_1 n_2 S l", color=GREEN).scale(0.85)
        s2_l = Text("自感：", font=CJK, color=WHITE).scale(0.44)
        s2_r = MathTex(
            r"L_1 = \mu_0 n_1^2 Sl,\quad L_2 = \mu_0 n_2^2 Sl",
            color=WHITE
        ).scale(0.72)
        s2 = VGroup(s2_l, s2_r).arrange(RIGHT, buff=0.1)
        s3 = MathTex(r"M = \sqrt{L_1 L_2}", color=YELLOW).scale(1.0)
        s4 = MathTex(
            r"k = \frac{M}{\sqrt{L_1 L_2}} = 1 \quad (\text{perfect coupling})",
            color=CYAN
        ).scale(0.72)
        s5 = VGroup(
            Text("完全耦合时互感达最大值，等于两自感的几何平均。", font=CJK, color=GREEN).scale(0.42)
        )

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.38)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12)
        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(FadeIn(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5), Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Ex2MutualInductanceGeometryMean",
        "id": "phys-ch09-9.3-ex2-mutual-inductance-geometry-mean",
        "chapterId": "ch09",
        "sectionId": "9.3",
        "title": "两同轴线圈互感等于自感几何平均",
        "description": "通过共轴螺线管磁感线动画与逐步公式推导，证明完全耦合时互感 M 等于两线圈自感 L1、L2 的几何平均，并介绍耦合系数 k。",
    }
]
