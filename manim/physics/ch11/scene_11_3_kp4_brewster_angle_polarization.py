"""第 11.3 节 · 布儒斯特定律与反射偏振（知识点 KP4）

可视化方案：
  Step 1 标题 + 生活类比（太阳眼镜消反射眩光）
  Step 2 界面几何：画空气/玻璃界面，入射自然光分解为 s/p 分量
  Step 3 定格演示：反射光与折射光方向，标注角度关系
  Step 4 ValueTracker 扫入射角 i，绘制 Rs(i)/Rp(i) 反射率曲线
  Step 5 定格在布儒斯特角 i₀≈56.3°，Rp→0
  Step 6 几何推导：i₀+r=π/2 → tanI₀=n₂/n₁
  Step 7 公式逐步动画化推导
  Step 8 偏振态可视化：反射只剩 s 分量，折射含两分量（部分偏振）
  Step 9 光强条形图对比
  Step 10 数值例 n=1.5 → i₀≈56.3°
  Step 11 小结卡

铁律：MathTex 内只有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 菲涅耳反射率近似函数（用于绘制 Rs/Rp 曲线）──────────────────────────
# n1=1.0 (空气), n2=1.5 (玻璃)
def fresnel_rs(i_deg, n1=1.0, n2=1.5):
    """s 偏振反射率（菲涅耳公式）"""
    i = math.radians(i_deg)
    sin_r = n1 * math.sin(i) / n2
    if abs(sin_r) >= 1.0:
        return 1.0
    r = math.asin(sin_r)
    denom = n1 * math.cos(i) + n2 * math.cos(r)
    if abs(denom) < 1e-10:
        return 1.0
    rs = ((n1 * math.cos(i) - n2 * math.cos(r)) / denom) ** 2
    return rs

def fresnel_rp(i_deg, n1=1.0, n2=1.5):
    """p 偏振反射率（菲涅耳公式）"""
    i = math.radians(i_deg)
    sin_r = n1 * math.sin(i) / n2
    if abs(sin_r) >= 1.0:
        return 1.0
    r = math.asin(sin_r)
    denom = n2 * math.cos(i) + n1 * math.cos(r)
    if abs(denom) < 1e-10:
        return 1.0
    rp = ((n2 * math.cos(i) - n1 * math.cos(r)) / denom) ** 2
    return rp


class Ch11Kp4BrewsterAnglePolarization(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题 + 副标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("布儒斯特定律与反射偏振", font=CJK, color=BLUE).scale(0.68)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第11章 波动光学 · 11.3", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        analogy1 = Text("驾车时，地面和水面的反射光刺眼——", font=CJK, color=WHITE).scale(0.48)
        analogy2 = Text("偏光太阳镜能滤掉这种反射眩光。", font=CJK, color=YELLOW).scale(0.48)
        analogy3 = Text("为什么？因为反射光在特定角度会变成完全线偏振光！",
                        font=CJK, color=GREEN).scale(0.48)
        ana_group = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.28)
        ana_group.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(analogy1))
        self.wait(0.8)
        self.play(FadeIn(analogy2))
        self.wait(0.8)
        self.play(FadeIn(analogy3))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 界面几何图 —— 入射/反射/折射光 + s/p 分量示意
        # ══════════════════════════════════════════════════════════════════
        # 界面水平线
        interface = Line(LEFT * 5.5, RIGHT * 5.5, color=GREY, stroke_width=2)
        interface.shift(DOWN * 0.5)

        # 介质标签
        lbl_air = Text("空气  n1=1.0", font=CJK, color=CYAN).scale(0.38)
        lbl_air.move_to(LEFT * 4.0 + UP * 0.2)
        lbl_glass = Text("玻璃  n2=1.5", font=CJK, color=ORANGE).scale(0.38)
        lbl_glass.move_to(LEFT * 4.0 + DOWN * 1.1)

        # 法线（虚线）
        normal = DashedLine(
            interface.get_center() + UP * 2.3,
            interface.get_center() + DOWN * 1.8,
            color=GREY, stroke_width=1.5,
        )
        normal_lbl = Text("法线", font=CJK, color=GREY).scale(0.35)
        normal_lbl.next_to(normal.get_top(), RIGHT, buff=0.12)

        # 入射光线 (56° 约布儒斯特角)
        i0 = math.radians(56)
        origin = interface.get_center()
        inc_dir = np.array([-math.sin(i0), -math.cos(i0), 0])  # 向右下入射
        inc_start = origin - inc_dir * 2.5
        incident = Arrow(
            inc_start, origin,
            color=WHITE, stroke_width=3, buff=0,
            max_tip_length_to_length_ratio=0.12,
        )

        # 反射光线
        ref_dir = np.array([math.sin(i0), -math.cos(i0) * (-1), 0])
        # 反射：x方向同，y方向取反
        ref_dir = np.array([math.sin(i0), math.cos(i0), 0])
        ref_end = origin + ref_dir * 2.5
        reflected = Arrow(
            origin, ref_end,
            color=BLUE, stroke_width=3, buff=0,
            max_tip_length_to_length_ratio=0.12,
        )

        # 折射光线（布儒斯特角时 i+r=90°，所以 r=34°）
        r0 = math.radians(34)
        refr_dir = np.array([math.sin(r0), -math.cos(r0), 0])
        refr_end = origin + refr_dir * 2.2
        refracted = Arrow(
            origin, refr_end,
            color=ORANGE, stroke_width=3, buff=0,
            max_tip_length_to_length_ratio=0.12,
        )

        # 角度标注
        angle_arc_i = Arc(
            radius=0.55, start_angle=PI / 2, angle=-i0,
            color=YELLOW, stroke_width=2,
        ).move_to(origin)
        angle_arc_r_ref = Arc(
            radius=0.55, start_angle=PI / 2, angle=i0,
            color=BLUE, stroke_width=2,
        ).move_to(origin)
        lbl_i = MathTex(r"i_0", color=YELLOW).scale(0.55)
        lbl_i.move_to(origin + UP * 0.85 + LEFT * 0.7)
        lbl_r_ref = MathTex(r"i_0", color=BLUE).scale(0.55)
        lbl_r_ref.move_to(origin + UP * 0.85 + RIGHT * 0.7)

        # 自然光 s/p 分量标注
        # s 分量 = 垂直入射面（蓝色圆点，⊙ 表示向外）
        sp_dots = VGroup()
        for frac in [0.3, 0.55, 0.80]:
            pt = inc_start + (origin - inc_start) * frac
            dot_outer = Circle(radius=0.12, color=BLUE, stroke_width=2).move_to(pt)
            dot_inner = Dot(pt, color=BLUE, radius=0.04)
            sp_dots.add(dot_outer, dot_inner)
        s_lbl = Text("s 分量(蓝圆点)", font=CJK, color=BLUE).scale(0.33)
        s_lbl.next_to(inc_start, LEFT, buff=0.1).shift(UP * 0.3)

        # p 分量 = 平行入射面（红色箭头，在光线方向横置）
        p_arrows = VGroup()
        for frac in [0.3, 0.55, 0.80]:
            pt = inc_start + (origin - inc_start) * frac
            # 横向小箭头（垂直于入射光方向，在图面内）
            perp = np.array([-math.cos(i0), math.sin(i0), 0])
            p_arr = Arrow(
                pt - perp * 0.18, pt + perp * 0.18,
                color=RED, buff=0, stroke_width=2,
                max_tip_length_to_length_ratio=0.4,
            )
            p_arrows.add(p_arr)
        p_lbl = Text("p 分量(红箭头)", font=CJK, color=RED).scale(0.33)
        p_lbl.next_to(s_lbl, DOWN, buff=0.12)

        # 光线标签
        inc_lbl = Text("入射\n自然光", font=CJK, color=WHITE).scale(0.36)
        inc_lbl.next_to(inc_start, UP + LEFT, buff=0.05)
        ref_lbl = Text("反射光", font=CJK, color=BLUE).scale(0.36)
        ref_lbl.next_to(ref_end, UP + RIGHT, buff=0.05)
        refr_lbl = Text("折射光", font=CJK, color=ORANGE).scale(0.36)
        refr_lbl.next_to(refr_end, DOWN + RIGHT, buff=0.05)

        geo_group = VGroup(
            interface, lbl_air, lbl_glass, normal, normal_lbl,
            incident, reflected, refracted,
            angle_arc_i, angle_arc_r_ref, lbl_i, lbl_r_ref,
            sp_dots, p_arrows, s_lbl, p_lbl,
            inc_lbl, ref_lbl, refr_lbl,
        )
        geo_group.shift(LEFT * 1.5 + DOWN * 0.2)
        geo_group.scale(0.88)

        self.play(Create(interface), FadeIn(lbl_air), FadeIn(lbl_glass))
        self.play(Create(normal), FadeIn(normal_lbl))
        self.play(GrowArrow(incident), FadeIn(inc_lbl))
        self.play(FadeIn(sp_dots), FadeIn(p_arrows), FadeIn(s_lbl), FadeIn(p_lbl))
        self.wait(1.0)
        self.play(GrowArrow(reflected), GrowArrow(refracted),
                  FadeIn(ref_lbl), FadeIn(refr_lbl))
        self.play(Create(angle_arc_i), Create(angle_arc_r_ref),
                  FadeIn(lbl_i), FadeIn(lbl_r_ref))
        self.wait(1.5)

        # 关键角度关系旁注
        key_angle = VGroup(
            MathTex(r"i_0 + r = \frac{\pi}{2}", color=YELLOW).scale(0.7),
        )
        key_angle.next_to(title, DOWN, buff=0.45).to_edge(RIGHT, buff=0.8)
        key_note = Text("布儒斯特条件：", font=CJK, color=YELLOW).scale(0.40)
        key_note.next_to(key_angle, UP, buff=0.15)
        self.play(FadeIn(key_note), Write(key_angle[0]))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            geo_group, key_note, key_angle,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: ValueTracker 扫入射角，绘制 Rs/Rp 反射率曲线
        # ══════════════════════════════════════════════════════════════════
        sec_title = Text("反射率随入射角的变化", font=CJK, color=BLUE).scale(0.50)
        sec_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec_title))

        axes = Axes(
            x_range=[0, 90, 15],
            y_range=[0, 1.0, 0.2],
            x_length=9,
            y_length=3.8,
            axis_config={"color": GREY, "include_tip": False,
                         "include_numbers": True, "decimal_number_config": {"num_decimal_places": 0}},
        ).next_to(sec_title, DOWN, buff=0.4)

        x_lbl = VGroup(
            MathTex(r"i", color=WHITE).scale(0.55),
            Text("(度)", font=CJK, color=WHITE).scale(0.35),
        ).arrange(RIGHT, buff=0.05)
        x_lbl.next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_lbl = MathTex(r"R", color=WHITE).scale(0.55)
        y_lbl.next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 画静态曲线（不用 always_redraw，直接 plot）
        curve_rs = axes.plot(
            lambda x: fresnel_rs(x),
            x_range=[0.1, 89.9],
            color=BLUE,
            stroke_width=3,
        )
        curve_rp = axes.plot(
            lambda x: fresnel_rp(x),
            x_range=[0.1, 89.9],
            color=RED,
            stroke_width=3,
        )
        rs_lbl = VGroup(
            MathTex(r"R_s", color=BLUE).scale(0.6),
            Text("(s分量)", font=CJK, color=BLUE).scale(0.33),
        ).arrange(RIGHT, buff=0.05)
        rs_lbl.move_to(axes.c2p(75, fresnel_rs(75)) + UP * 0.3 + RIGHT * 0.3)
        rp_lbl = VGroup(
            MathTex(r"R_p", color=RED).scale(0.6),
            Text("(p分量)", font=CJK, color=RED).scale(0.33),
        ).arrange(RIGHT, buff=0.05)
        rp_lbl.move_to(axes.c2p(35, fresnel_rp(35)) + DOWN * 0.35)

        self.play(Create(curve_rs), run_time=1.5)
        self.play(FadeIn(rs_lbl))
        self.play(Create(curve_rp), run_time=1.5)
        self.play(FadeIn(rp_lbl))
        self.wait(0.8)

        # 标注布儒斯特角位置（Rp=0）
        brewster_deg = math.degrees(math.atan(1.5 / 1.0))  # ≈56.31°
        brewster_x = axes.c2p(brewster_deg, 0)
        brewster_dot = Dot(brewster_x, color=YELLOW, radius=0.12)
        brew_vline = DashedLine(
            axes.c2p(brewster_deg, 0),
            axes.c2p(brewster_deg, 0.25),
            color=YELLOW, stroke_width=2,
        )
        brew_lbl_math = MathTex(r"i_0 \approx 56.3°", color=YELLOW).scale(0.52)
        brew_lbl_math.next_to(axes.c2p(brewster_deg, 0.06), UP + RIGHT, buff=0.05)
        brew_note = VGroup(
            MathTex(r"R_p = 0", color=YELLOW).scale(0.55),
        )
        brew_note.next_to(brew_lbl_math, UP, buff=0.12)

        self.play(Create(brew_vline), FadeIn(brewster_dot))
        self.play(FadeIn(brew_lbl_math), Write(brew_note[0]))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            axes, x_lbl, y_lbl, curve_rs, curve_rp,
            rs_lbl, rp_lbl, brew_vline, brewster_dot,
            brew_lbl_math, brew_note, sec_title,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 公式推导 —— 从几何关系推导 tan i₀ = n₂/n₁
        # ══════════════════════════════════════════════════════════════════
        deriv_title = Text("布儒斯特定律推导", font=CJK, color=BLUE).scale(0.50)
        deriv_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(deriv_title))
        self.wait(0.5)

        # 条件1：折射定律
        step_d1_lbl = Text("折射定律：", font=CJK, color=WHITE).scale(0.44)
        step_d1 = MathTex(r"n_1 \sin i_0 = n_2 \sin r", color=WHITE).scale(0.78)
        row1 = VGroup(step_d1_lbl, step_d1).arrange(RIGHT, buff=0.18)
        row1.next_to(deriv_title, DOWN, buff=0.45)

        self.play(FadeIn(step_d1_lbl), Write(step_d1))
        self.wait(1.0)

        # 条件2：布儒斯特角时 i₀ + r = π/2，所以 r = π/2 - i₀
        step_d2_lbl = Text("布儒斯特条件：", font=CJK, color=WHITE).scale(0.44)
        step_d2 = MathTex(r"i_0 + r = \frac{\pi}{2}", color=YELLOW).scale(0.78)
        row2 = VGroup(step_d2_lbl, step_d2).arrange(RIGHT, buff=0.18)
        row2.next_to(row1, DOWN, buff=0.38)

        step_d3_lbl = Text("因此：", font=CJK, color=WHITE).scale(0.44)
        step_d3 = MathTex(r"\sin r = \sin\!\left(\frac{\pi}{2} - i_0\right) = \cos i_0",
                          color=YELLOW).scale(0.78)
        row3 = VGroup(step_d3_lbl, step_d3).arrange(RIGHT, buff=0.18)
        row3.next_to(row2, DOWN, buff=0.32)

        self.play(FadeIn(step_d2_lbl), Write(step_d2))
        self.wait(0.8)
        self.play(FadeIn(step_d3_lbl), Write(step_d3))
        self.wait(1.0)

        # 代入：n₁ sin i₀ = n₂ cos i₀  →  tan i₀ = n₂/n₁
        step_d4_lbl = Text("代入折射定律：", font=CJK, color=WHITE).scale(0.44)
        step_d4 = MathTex(r"n_1 \sin i_0 = n_2 \cos i_0", color=ORANGE).scale(0.78)
        row4 = VGroup(step_d4_lbl, step_d4).arrange(RIGHT, buff=0.18)
        row4.next_to(row3, DOWN, buff=0.32)

        step_d5_lbl = Text("得布儒斯特定律：", font=CJK, color=GREEN).scale(0.44)
        step_d5 = MathTex(r"\tan i_0 = \frac{n_2}{n_1}", color=GREEN).scale(0.88)
        row5 = VGroup(step_d5_lbl, step_d5).arrange(RIGHT, buff=0.18)
        row5.next_to(row4, DOWN, buff=0.38)
        box5 = SurroundingRectangle(row5, color=GREEN, buff=0.18, corner_radius=0.1)

        self.play(FadeIn(step_d4_lbl), Write(step_d4))
        self.wait(0.8)
        self.play(FadeIn(step_d5_lbl), Write(step_d5))
        self.play(Create(box5))
        self.wait(2.0)

        self.play(FadeOut(VGroup(row1, row2, row3, row4, row5, box5, deriv_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 偏振态可视化 —— 定格在布儒斯特角
        # ══════════════════════════════════════════════════════════════════
        polar_title = Text("布儒斯特角处的偏振状态", font=CJK, color=BLUE).scale(0.50)
        polar_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(polar_title))

        # 重新绘制简化界面
        iface2 = Line(LEFT * 5.5, RIGHT * 5.5, color=GREY, stroke_width=2).shift(DOWN * 0.2)
        lbl_air2 = Text("空气", font=CJK, color=CYAN).scale(0.38).move_to(LEFT * 4.2 + UP * 0.3)
        lbl_glass2 = Text("玻璃", font=CJK, color=ORANGE).scale(0.38).move_to(LEFT * 4.2 + DOWN * 0.8)
        origin2 = iface2.get_center()

        i0_r = math.radians(56.3)
        r0_r = math.radians(33.7)

        # 入射光（白色）
        inc2_start = origin2 + np.array([-math.sin(i0_r), math.cos(i0_r), 0]) * 2.2
        inc2 = Arrow(inc2_start, origin2, color=WHITE, buff=0, stroke_width=2.5,
                     max_tip_length_to_length_ratio=0.12)
        inc2_lbl = Text("自然光", font=CJK, color=WHITE).scale(0.36)
        inc2_lbl.next_to(inc2_start, UP + LEFT, buff=0.05)

        # 反射光（蓝色 = 只剩 s 分量）
        ref2_end = origin2 + np.array([math.sin(i0_r), math.cos(i0_r), 0]) * 2.2
        ref2 = Arrow(origin2, ref2_end, color=BLUE, buff=0, stroke_width=2.5,
                     max_tip_length_to_length_ratio=0.12)
        ref2_lbl = Text("反射光", font=CJK, color=BLUE).scale(0.36)
        ref2_lbl.next_to(ref2_end, UP + RIGHT, buff=0.05)

        # 折射光（橙色）
        refr2_end = origin2 + np.array([math.sin(r0_r), -math.cos(r0_r), 0]) * 2.0
        refr2 = Arrow(origin2, refr2_end, color=ORANGE, buff=0, stroke_width=2.5,
                      max_tip_length_to_length_ratio=0.12)
        refr2_lbl = Text("折射光", font=CJK, color=ORANGE).scale(0.36)
        refr2_lbl.next_to(refr2_end, DOWN + RIGHT, buff=0.05)

        # 反射光：仅 s 分量（蓝圆点）
        ref_pol_dots = VGroup()
        for frac in [0.2, 0.45, 0.70]:
            pt = origin2 + (ref2_end - origin2) * frac
            c = Circle(radius=0.11, color=BLUE, stroke_width=2).move_to(pt)
            d = Dot(pt, color=BLUE, radius=0.04)
            ref_pol_dots.add(c, d)

        # 折射光：s 分量（蓝圆点，少）+ p 分量（红箭头，多）
        refr_pol = VGroup()
        for frac in [0.25, 0.55]:
            pt = origin2 + (refr2_end - origin2) * frac
            c = Circle(radius=0.09, color=BLUE, stroke_width=1.5).move_to(pt)
            d = Dot(pt, color=BLUE, radius=0.035)
            refr_pol.add(c, d)
        for frac in [0.2, 0.4, 0.6, 0.75]:
            pt = origin2 + (refr2_end - origin2) * frac
            perp_r = np.array([math.cos(r0_r), math.sin(r0_r), 0])
            p_arr = Arrow(
                pt - perp_r * 0.16, pt + perp_r * 0.16,
                color=RED, buff=0, stroke_width=2,
                max_tip_length_to_length_ratio=0.45,
            )
            refr_pol.add(p_arr)

        geo2_group = VGroup(
            iface2, lbl_air2, lbl_glass2,
            inc2, inc2_lbl, ref2, ref2_lbl, refr2, refr2_lbl,
            ref_pol_dots, refr_pol,
        )
        geo2_group.shift(LEFT * 1.3)

        self.play(Create(iface2), FadeIn(lbl_air2), FadeIn(lbl_glass2))
        self.play(GrowArrow(inc2), FadeIn(inc2_lbl))
        self.play(GrowArrow(ref2), GrowArrow(refr2), FadeIn(ref2_lbl), FadeIn(refr2_lbl))
        self.play(FadeIn(ref_pol_dots))
        self.play(FadeIn(refr_pol))
        self.wait(0.8)

        # 文字说明放右侧
        note_ref = VGroup(
            Text("反射光：", font=CJK, color=BLUE).scale(0.40),
            Text("仅含 s 分量", font=CJK, color=BLUE).scale(0.40),
            Text("(完全线偏振)", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
        note_ref.to_edge(RIGHT, buff=0.5).shift(UP * 0.8)

        note_refr = VGroup(
            Text("折射光：", font=CJK, color=ORANGE).scale(0.40),
            Text("s+p 两种分量", font=CJK, color=ORANGE).scale(0.40),
            Text("(部分偏振)", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
        note_refr.next_to(note_ref, DOWN, buff=0.4, aligned_edge=LEFT)

        self.play(FadeIn(note_ref), FadeIn(note_refr))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 光强条形图对比（反射 vs 折射，s/p 分量）
        # ══════════════════════════════════════════════════════════════════
        # 先清场（保留 title 和 polar_title）
        self.play(FadeOut(VGroup(geo2_group, note_ref, note_refr, polar_title)))

        bar_title = Text("s/p 分量强度对比（布儒斯特角）", font=CJK, color=BLUE).scale(0.48)
        bar_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(bar_title))

        # 条形图：4 根柱
        bar_data = [
            # (label_text, height, color, x_pos)
            ("反射 Rs", 0.15, BLUE, -3.2),
            ("反射 Rp", 0.0, RED, -1.1),
            ("透射 Ts", 0.85, BLUE, 1.1),
            ("透射 Tp", 1.0, RED, 3.2),
        ]
        bar_h_scale = 3.0
        bar_w = 0.9
        base_y = -2.2

        bars = VGroup()
        bar_lbls = VGroup()
        bar_vlbls = VGroup()
        for (lbl_txt, h, col, xpos) in bar_data:
            bar_height = h * bar_h_scale + 0.001  # 避免零高度
            rect = Rectangle(
                width=bar_w,
                height=bar_height,
                color=col,
                fill_color=col,
                fill_opacity=0.7,
                stroke_width=1.5,
            )
            rect.move_to(np.array([xpos, base_y + bar_height / 2, 0]))
            bars.add(rect)

            lbl_t = Text(lbl_txt, font=CJK, color=col).scale(0.35)
            lbl_t.move_to(np.array([xpos, base_y - 0.3, 0]))
            bar_lbls.add(lbl_t)

            val_t = MathTex(r"\approx 0" if h < 0.01 else f"{h:.0%}", color=WHITE).scale(0.42)
            val_t.move_to(np.array([xpos, base_y + bar_height + 0.2, 0]))
            bar_vlbls.add(val_t)

        # 零标注
        zero_note = VGroup(
            MathTex(r"R_p = 0", color=YELLOW).scale(0.55),
            Text("(完全线偏振！)", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(DOWN, buff=0.1)
        zero_note.move_to(np.array([-1.1, base_y + 1.0, 0]))
        zero_arrow = Arrow(
            zero_note.get_bottom() + DOWN * 0.1,
            np.array([-1.1, base_y + 0.05, 0]),
            color=YELLOW, buff=0, stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )

        baseline = Line(
            np.array([-4.5, base_y, 0]), np.array([4.5, base_y, 0]),
            color=GREY, stroke_width=1.5,
        )

        self.play(Create(baseline))
        self.play(
            *[GrowFromEdge(b, DOWN) for b in bars],
            run_time=1.5,
        )
        self.play(FadeIn(bar_lbls), FadeIn(bar_vlbls))
        self.play(FadeIn(zero_note), GrowArrow(zero_arrow))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            bar_title, bars, bar_lbls, bar_vlbls,
            baseline, zero_note, zero_arrow,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 数值例 —— n=1.5（玻璃）求布儒斯特角
        # ══════════════════════════════════════════════════════════════════
        num_title = Text("数值例：空气/玻璃界面  n2=1.5", font=CJK, color=BLUE).scale(0.50)
        num_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(num_title))

        num1_lbl = Text("代入布儒斯特定律：", font=CJK, color=WHITE).scale(0.44)
        num1 = MathTex(r"\tan i_0 = \frac{n_2}{n_1} = \frac{1.5}{1.0} = 1.5", color=YELLOW).scale(0.80)
        row_n1 = VGroup(num1_lbl, num1).arrange(RIGHT, buff=0.2)
        row_n1.next_to(num_title, DOWN, buff=0.50)

        num2_lbl = Text("求反正切：", font=CJK, color=WHITE).scale(0.44)
        num2 = MathTex(r"i_0 = \arctan(1.5) \approx 56.3°", color=GREEN).scale(0.80)
        row_n2 = VGroup(num2_lbl, num2).arrange(RIGHT, buff=0.2)
        row_n2.next_to(row_n1, DOWN, buff=0.38)

        num3_lbl = Text("折射角：", font=CJK, color=WHITE).scale(0.44)
        num3 = MathTex(r"r = 90° - 56.3° = 33.7°", color=ORANGE).scale(0.80)
        row_n3 = VGroup(num3_lbl, num3).arrange(RIGHT, buff=0.2)
        row_n3.next_to(row_n2, DOWN, buff=0.38)

        num4_lbl = Text("验证斯涅尔定律：", font=CJK, color=WHITE).scale(0.44)
        num4 = MathTex(r"n_1\sin 56.3° = 0.832 \approx 1.5\times\sin 33.7° = 0.831",
                       color=CYAN).scale(0.65)
        row_n4 = VGroup(num4_lbl, num4).arrange(RIGHT, buff=0.2)
        row_n4.next_to(row_n3, DOWN, buff=0.38)

        self.play(FadeIn(num1_lbl), Write(num1))
        self.wait(1.0)
        self.play(FadeIn(num2_lbl), Write(num2))
        self.wait(1.0)
        self.play(FadeIn(num3_lbl), Write(num3))
        self.wait(0.8)
        self.play(FadeIn(num4_lbl), Write(num4))
        self.wait(1.8)

        self.play(FadeOut(VGroup(num_title, row_n1, row_n2, row_n3, row_n4)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        sum_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sum_title))

        s1 = VGroup(
            Text("布儒斯特角条件：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"i_0 + r = \frac{\pi}{2}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.18)

        s2 = VGroup(
            Text("布儒斯特定律：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\tan i_0 = \frac{n_2}{n_1}", color=GREEN).scale(0.88),
        ).arrange(RIGHT, buff=0.18)

        s3 = VGroup(
            Text("完整关系：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"n_1\sin i_0 = n_2\sin r = n_2\cos i_0", color=CYAN).scale(0.72),
        ).arrange(RIGHT, buff=0.18)

        s4 = Text("在布儒斯特角，反射光为完全线偏振（仅 s 分量），折射光为部分偏振",
                  font=CJK, color=ORANGE).scale(0.40)
        s5_data = VGroup(
            Text("玻璃(n=1.5)：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"i_0 \approx 56.3°", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        summary = VGroup(s1, s2, s3, s4, s5_data).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(12.5)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.12)

        self.play(Write(s1[1]), FadeIn(s1[0]))
        self.wait(0.6)
        self.play(Write(s2[1]), FadeIn(s2[0]))
        self.wait(0.6)
        self.play(Write(s3[1]), FadeIn(s3[0]))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.wait(0.6)
        self.play(FadeIn(s5_data))
        self.play(Create(box_sum))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, sum_title, summary, box_sum)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp4BrewsterAnglePolarization",
        "id": "phys-ch11-11.3-kp4-brewster-angle-polarization",
        "chapterId": "ch11",
        "sectionId": "11.3",
        "title": "布儒斯特定律与反射偏振",
        "description": "用界面几何图演示 s/p 分量分解，ValueTracker 扫反射率曲线，逐步推导 tan i₀=n₂/n₁，可视化布儒斯特角处的完全线偏振现象。",
    },
]
