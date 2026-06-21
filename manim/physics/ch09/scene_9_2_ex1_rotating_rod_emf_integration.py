"""第 9.2 节 · 例题：旋转金属杆的动生电动势
洛伦兹力微元积分法 与 法拉第法拉第定律法 并列推导，验证结果等价。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 全局颜色 ──────────────────────────────────────────────────────────────────
ROD_COLOR   = WHITE
B_COLOR     = BLUE
V_COLOR     = RED
F_COLOR     = GREEN
AREA_COLOR  = YELLOW
EMF_COLOR   = YELLOW


class Ch09Ex1RotatingRodEmfIntegration(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("旋转金属杆的动生电动势", font=CJK, color=BLUE).scale(0.68)
        title.to_edge(UP, buff=0.25)
        sub = Text("第九章 电磁感应  ·  9.2 例题精讲", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2  生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        a1 = Text("想象一根金属杆绕一端旋转，就像转动的时钟指针。", font=CJK).scale(0.46)
        a2 = Text("杆中每个自由电子都随杆运动，速度越远越快——", font=CJK).scale(0.46)
        a3 = Text("洛伦兹力把电子推向一端，两端产生电位差：动生电动势。", font=CJK, color=ORANGE).scale(0.46)
        analogy = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3  问题模型：俯视图（整屏显示，为后续分栏做铺垫）
        # ══════════════════════════════════════════════════════════════════════
        setup_title = Text("物理模型（俯视图）", font=CJK, color=BLUE).scale(0.5)
        setup_title.next_to(title, DOWN, buff=0.45)

        # B 向外圆点符号（多个）
        b_dots = VGroup()
        for ix in range(-3, 4):
            for iy in range(-2, 2):
                dot = Dot(point=RIGHT * ix * 1.2 + UP * iy * 1.1 + DOWN * 1.2,
                          radius=0.06, color=B_COLOR)
                b_dots.add(dot)

        b_label = VGroup(
            Text("B", font=CJK, color=B_COLOR).scale(0.5),
            Text("(向外)", font=CJK, color=B_COLOR).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        b_label.to_corner(DR, buff=0.7)

        # 金属杆
        rod_origin = DOWN * 1.2 + LEFT * 3.5
        rod_tip    = rod_origin + RIGHT * 5.0
        rod_line   = Line(rod_origin, rod_tip, color=ROD_COLOR, stroke_width=4)
        o_dot  = Dot(rod_origin, radius=0.1, color=ORANGE)
        a_dot  = Dot(rod_tip,    radius=0.08, color=WHITE)
        o_label = Text("o", font=CJK, color=ORANGE).scale(0.45).next_to(o_dot, DOWN, buff=0.1)
        a_label = Text("a", font=CJK, color=WHITE).scale(0.45).next_to(a_dot, DOWN, buff=0.1)
        L_label = MathTex(r"L").scale(0.6).move_to((rod_origin + rod_tip) / 2 + UP * 0.3)

        # omega 箭头（弧线暗示旋转方向）
        arc_arrow = Arc(radius=0.55, start_angle=-PI/6, angle=PI/1.5,
                        color=CYAN, stroke_width=3)
        arc_arrow.move_arc_center_to(rod_origin)
        arc_tip = Text("ω", font=CJK, color=CYAN).scale(0.5)
        arc_tip.next_to(arc_arrow, UP, buff=0.08)

        self.play(FadeIn(setup_title))
        self.play(FadeIn(b_dots), FadeIn(b_label))
        self.play(Create(rod_line), FadeIn(o_dot), FadeIn(a_dot),
                  FadeIn(o_label), FadeIn(a_label), FadeIn(L_label))
        self.play(Create(arc_arrow), FadeIn(arc_tip))
        self.wait(1.5)
        self.play(FadeOut(VGroup(setup_title, b_dots, b_label, rod_line,
                                 o_dot, a_dot, o_label, a_label, L_label,
                                 arc_arrow, arc_tip)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4  定义微元 — 公式逐步出现
        # ══════════════════════════════════════════════════════════════════════
        def_title = Text("方法一：洛伦兹力微元积分", font=CJK, color=BLUE).scale(0.5)
        def_title.next_to(title, DOWN, buff=0.45)

        zh1 = Text("在距轴 r 处取微元 dr，线速度为：", font=CJK).scale(0.44)
        f1  = MathTex(r"v(r) = \omega r", color=V_COLOR).scale(0.85)
        row1 = VGroup(zh1, f1).arrange(RIGHT, buff=0.25)

        zh2 = Text("该微元的动生电动势：", font=CJK).scale(0.44)
        f2  = MathTex(r"\mathrm{d}\varepsilon = Bv(r)\,\mathrm{d}r = B\omega r\,\mathrm{d}r",
                      color=YELLOW).scale(0.85)
        row2 = VGroup(zh2, f2).arrange(RIGHT, buff=0.25)

        zh3 = Text("对全杆积分：", font=CJK).scale(0.44)
        f3  = MathTex(r"\varepsilon = \int_0^L B\omega r\,\mathrm{d}r", color=WHITE).scale(0.85)
        row3 = VGroup(zh3, f3).arrange(RIGHT, buff=0.25)

        f4  = MathTex(r"= B\omega \cdot \frac{r^2}{2}\Big|_0^L", color=WHITE).scale(0.85)
        f5  = MathTex(r"= \frac{1}{2}B\omega L^2", color=GREEN).scale(1.05)
        f5.set_color_by_tex("B", GREEN)

        rows = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        rows.next_to(def_title, DOWN, buff=0.5)
        rows.scale_to_fit_width(12.5)

        f4.next_to(f3[0], DOWN, buff=0.35).align_to(f3[0], LEFT)
        f5.next_to(f4, DOWN, buff=0.35).align_to(f4, LEFT)

        self.play(FadeIn(def_title))
        self.play(FadeIn(row1))
        self.wait(1.0)
        self.play(FadeIn(row2))
        self.wait(1.0)
        self.play(FadeIn(row3))
        self.wait(0.8)
        self.play(FadeIn(f4))
        self.wait(0.8)
        self.play(FadeIn(f5))
        box1 = SurroundingRectangle(f5, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(box1))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_title, rows, f4, f5, box1)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 5  左栏：动图——微元积分可视化（ValueTracker 扫动 r）
        # ══════════════════════════════════════════════════════════════════════
        # 左侧俯视图布局
        LEFT_CENTER  = LEFT * 3.4 + DOWN * 0.5
        RIGHT_CENTER = RIGHT * 3.4 + DOWN * 0.5

        vis_title = Text("微元积分可视化", font=CJK, color=BLUE).scale(0.48)
        vis_title.next_to(title, DOWN, buff=0.35)

        # 左侧：俯视旋转杆 + 微元动态标注
        L_phys  = 2.4       # 杆的像素长度
        o_pos   = LEFT_CENTER + LEFT * 0.5

        # B 场点阵（左侧区域）
        b_dots2 = VGroup()
        for ix in range(5):
            for iy in range(4):
                p = o_pos + RIGHT * (ix * 0.65 - 0.3) + UP * (iy * 0.7 - 1.2)
                b_dots2.add(Dot(p, radius=0.05, color=B_COLOR, fill_opacity=0.55))

        rod_end = o_pos + RIGHT * L_phys
        rod_vis = Line(o_pos, rod_end, color=ROD_COLOR, stroke_width=4)
        o_vis   = Dot(o_pos, radius=0.10, color=ORANGE)
        a_vis   = Dot(rod_end, radius=0.08, color=WHITE)
        o_lv    = Text("o", font=CJK, color=ORANGE).scale(0.40).next_to(o_vis, DOWN, buff=0.08)
        a_lv    = Text("a", font=CJK, color=WHITE).scale(0.40).next_to(a_vis, UP, buff=0.08)
        L_vis   = MathTex(r"L").scale(0.5).move_to((o_pos + rod_end) / 2 + UP * 0.22)

        # ValueTracker for r
        r_tracker = ValueTracker(0.3)

        def dr_elem():
            """微元 dr 位置（红色竖向箭头 + 绿色 F 方向）"""
            rv = r_tracker.get_value()
            elem_pos = o_pos + RIGHT * rv
            # 微元位置竖线
            bar = Line(elem_pos + DOWN * 0.12, elem_pos + UP * 0.12,
                       color=YELLOW, stroke_width=5)
            # v 箭头（向上，长度 ∝ r）
            v_len = 0.18 + 0.45 * (rv / L_phys)
            v_arr = Arrow(elem_pos, elem_pos + UP * v_len,
                          buff=0, color=V_COLOR, stroke_width=3,
                          max_tip_length_to_length_ratio=0.35)
            # F=qv×B 向左（朝 o 端）
            f_arr = Arrow(elem_pos + UP * (v_len * 0.5),
                          elem_pos + UP * (v_len * 0.5) + LEFT * 0.30,
                          buff=0, color=F_COLOR, stroke_width=3,
                          max_tip_length_to_length_ratio=0.4)
            return VGroup(bar, v_arr, f_arr)

        dr_mob = always_redraw(dr_elem)

        # r 位置标注
        r_label_mob = always_redraw(lambda: MathTex(
            rf"r={r_tracker.get_value():.2f}", color=CYAN
        ).scale(0.44).move_to(o_pos + DOWN * 0.6 + RIGHT * r_tracker.get_value()))

        # 右侧：被积函数曲线 + 面积填充
        ax = Axes(
            x_range=[0, 2.6, 0.5],
            y_range=[0, 3.0, 1.0],
            x_length=4.2,
            y_length=2.8,
            axis_config={"color": WHITE, "stroke_width": 2},
        ).move_to(RIGHT_CENTER)

        ax_xlabel = MathTex(r"r").scale(0.5).next_to(ax.x_axis, RIGHT, buff=0.12)
        ax_ylabel = MathTex(r"B\omega r").scale(0.5).next_to(ax.y_axis, UP, buff=0.1)

        B_VAL  = 1.0
        OM_VAL = 1.0

        def integrand(r):
            return B_VAL * OM_VAL * r

        full_curve = ax.plot(integrand, x_range=[0, L_phys], color=ORANGE, stroke_width=3)

        def shaded_area():
            rv = r_tracker.get_value()
            if rv < 0.05:
                rv = 0.05
            area = ax.get_area(
                ax.plot(integrand, x_range=[0, rv], color=ORANGE),
                x_range=[0, rv],
                color=YELLOW, opacity=0.45,
            )
            return area

        area_mob = always_redraw(shaded_area)

        def emf_readout():
            rv = r_tracker.get_value()
            val = 0.5 * B_VAL * OM_VAL * rv ** 2
            return MathTex(rf"\varepsilon(r)={val:.2f}", color=EMF_COLOR).scale(0.5).move_to(
                RIGHT_CENTER + UP * 1.65
            )

        emf_label_mob = always_redraw(emf_readout)

        # 图例
        leg_v = VGroup(
            Line(ORIGIN, RIGHT * 0.3, color=V_COLOR, stroke_width=3),
            Text("v=wr", font=CJK, color=V_COLOR).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        leg_f = VGroup(
            Line(ORIGIN, RIGHT * 0.3, color=F_COLOR, stroke_width=3),
            Text("F=qvxB(向o)", font=CJK, color=F_COLOR).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        legend = VGroup(leg_v, leg_f).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        legend.move_to(LEFT_CENTER + DOWN * 1.5 + RIGHT * 0.5)

        self.play(FadeIn(vis_title))
        self.play(
            FadeIn(b_dots2),
            Create(rod_vis), FadeIn(o_vis), FadeIn(a_vis),
            FadeIn(o_lv), FadeIn(a_lv), FadeIn(L_vis),
        )
        self.play(Create(ax), FadeIn(ax_xlabel), FadeIn(ax_ylabel))
        self.play(Create(full_curve))
        self.add(area_mob, dr_mob, r_label_mob, emf_label_mob)
        self.play(FadeIn(legend))
        self.wait(0.5)

        # 扫动 r 从 0.3 到 L_phys
        self.play(r_tracker.animate.set_value(L_phys), run_time=4.0, rate_func=linear)
        self.wait(1.0)

        # 最终积分结果
        final_emf = MathTex(r"\varepsilon = \frac{1}{2}B\omega L^2", color=GREEN).scale(0.85)
        final_emf.move_to(RIGHT_CENTER + UP * 1.65)
        box_emf = SurroundingRectangle(final_emf, color=GREEN, buff=0.15, corner_radius=0.1)
        self.play(FadeOut(emf_label_mob), FadeIn(final_emf), Create(box_emf))
        self.wait(1.8)

        left_group = VGroup(b_dots2, rod_vis, o_vis, a_vis, o_lv, a_lv, L_vis, legend)
        right_group = VGroup(ax, ax_xlabel, ax_ylabel, full_curve, area_mob, box_emf)
        self.play(FadeOut(VGroup(left_group, right_group, dr_mob, r_label_mob,
                                 final_emf, vis_title)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6  方法二：法拉第定律
        # ══════════════════════════════════════════════════════════════════════
        fa_title = Text("方法二：法拉第定律", font=CJK, color=BLUE).scale(0.5)
        fa_title.next_to(title, DOWN, buff=0.45)

        zh_fa1 = Text("金属杆转过角度", font=CJK).scale(0.44)
        math_th = MathTex(r"\theta", color=CYAN).scale(0.85)
        zh_fa1b = Text("，扫过扇形面积：", font=CJK).scale(0.44)
        row_fa1 = VGroup(zh_fa1, math_th, zh_fa1b).arrange(RIGHT, buff=0.12)

        fa2 = MathTex(r"S = \frac{1}{2}L^2\theta", color=YELLOW).scale(0.85)
        fa3 = MathTex(r"\Phi = BS = \frac{1}{2}BL^2\theta", color=WHITE).scale(0.85)
        fa4 = MathTex(r"\varepsilon = \left|\frac{\mathrm{d}\Phi}{\mathrm{d}t}\right|"
                      r"= \frac{1}{2}BL^2\frac{\mathrm{d}\theta}{\mathrm{d}t}"
                      r"= \frac{1}{2}B\omega L^2", color=GREEN).scale(0.82)

        fa_steps = VGroup(row_fa1, fa2, fa3, fa4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        fa_steps.next_to(fa_title, DOWN, buff=0.5)
        fa_steps.scale_to_fit_width(12.8)

        self.play(FadeIn(fa_title))
        self.play(FadeIn(row_fa1))
        self.wait(0.8)
        self.play(Write(fa2))
        self.wait(0.8)
        self.play(Write(fa3))
        self.wait(0.8)
        self.play(Write(fa4))
        box_fa = SurroundingRectangle(fa4, color=GREEN, buff=0.15, corner_radius=0.1)
        self.play(Create(box_fa))
        self.wait(1.8)
        self.play(FadeOut(VGroup(fa_title, fa_steps, box_fa)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7  扇形面积随 θ 增大的动画
        # ══════════════════════════════════════════════════════════════════════
        sector_title = Text("扇形面积随转角增大（法拉第法直觉）", font=CJK, color=BLUE).scale(0.46)
        sector_title.next_to(title, DOWN, buff=0.35)

        SEC_CENTER = ORIGIN + DOWN * 0.5
        SEC_R      = 2.2

        theta_tracker = ValueTracker(0.05)

        # B 点阵（大范围）
        b_bg = VGroup()
        for ix in range(-4, 5):
            for iy in range(-3, 3):
                b_bg.add(Dot(SEC_CENTER + RIGHT * ix * 0.9 + UP * iy * 0.85,
                             radius=0.05, color=B_COLOR, fill_opacity=0.4))

        def sector_mob():
            th = theta_tracker.get_value()
            sector = Sector(
                radius=SEC_R,
                start_angle=PI / 2,
                angle=th,
                color=AREA_COLOR, fill_opacity=0.40, stroke_width=0,
            )
            sector.move_arc_center_to(SEC_CENTER)
            return sector

        def rod_mob_a():
            th = theta_tracker.get_value()
            end = SEC_CENTER + SEC_R * np.array([math.cos(PI / 2 + th), math.sin(PI / 2 + th), 0])
            return Line(SEC_CENTER, end, color=ROD_COLOR, stroke_width=4)

        rod_init = Line(SEC_CENTER, SEC_CENTER + UP * SEC_R, color=ROD_COLOR, stroke_width=4)
        o_s = Dot(SEC_CENTER, radius=0.10, color=ORANGE)
        o_s_lbl = Text("o", font=CJK, color=ORANGE).scale(0.42).next_to(o_s, LEFT, buff=0.1)

        sector_fill = always_redraw(sector_mob)
        rod_moving  = always_redraw(rod_mob_a)

        def flux_label():
            th = theta_tracker.get_value()
            phi = 0.5 * 1.0 * (SEC_R ** 2) * th   # B=1, L=SEC_R 示意
            return MathTex(rf"\Phi \propto \theta = {th:.2f}", color=CYAN).scale(0.5).to_corner(UR, buff=0.6)

        flux_mob = always_redraw(flux_label)

        self.play(FadeIn(sector_title))
        self.play(FadeIn(b_bg), Create(rod_init), FadeIn(o_s), FadeIn(o_s_lbl))
        self.add(sector_fill, rod_moving, flux_mob)
        self.play(theta_tracker.animate.set_value(PI / 3), run_time=3.5, rate_func=smooth)
        self.wait(1.2)
        self.play(FadeOut(VGroup(b_bg, rod_init, sector_fill, rod_moving, flux_mob,
                                  o_s, o_s_lbl, sector_title)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 8  两法结果对比等号
        # ══════════════════════════════════════════════════════════════════════
        compare_title = Text("两种方法结果完全等价", font=CJK, color=BLUE).scale(0.5)
        compare_title.next_to(title, DOWN, buff=0.5)

        method1_lbl = Text("洛伦兹力法", font=CJK, color=V_COLOR).scale(0.46)
        method1_f   = MathTex(r"\varepsilon = \frac{1}{2}B\omega L^2", color=GREEN).scale(0.95)
        m1 = VGroup(method1_lbl, method1_f).arrange(DOWN, buff=0.2)

        eq_sign = MathTex(r"=", color=WHITE).scale(1.2)

        method2_lbl = Text("法拉第定律", font=CJK, color=AREA_COLOR).scale(0.46)
        method2_f   = MathTex(r"\varepsilon = \frac{1}{2}B\omega L^2", color=GREEN).scale(0.95)
        m2 = VGroup(method2_lbl, method2_f).arrange(DOWN, buff=0.2)

        compare_row = VGroup(m1, eq_sign, m2).arrange(RIGHT, buff=0.6)
        compare_row.next_to(compare_title, DOWN, buff=0.6)
        box_both = SurroundingRectangle(compare_row, color=GREEN, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(compare_title))
        self.play(FadeIn(m1))
        self.wait(0.5)
        self.play(FadeIn(eq_sign))
        self.play(FadeIn(m2))
        self.play(Create(box_both))
        self.wait(2.0)
        self.play(FadeOut(VGroup(compare_title, compare_row, box_both)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9  电位高低与电流方向
        # ══════════════════════════════════════════════════════════════════════
        pol_title = Text("电位高低：o 端为高电位（正极）", font=CJK, color=BLUE).scale(0.48)
        pol_title.next_to(title, DOWN, buff=0.45)

        # 简单示意图：o —— 杆 —— a，外电路箭头
        rod_h = Line(LEFT * 2.8, RIGHT * 2.8, color=ROD_COLOR, stroke_width=5).shift(DOWN * 0.4)
        o_h   = Dot(rod_h.get_start(), radius=0.12, color=ORANGE)
        a_h   = Dot(rod_h.get_end(),   radius=0.10, color=WHITE)
        o_hl  = Text("o (+)", font=CJK, color=ORANGE).scale(0.46).next_to(o_h, DOWN, buff=0.15)
        a_hl  = Text("a (-)", font=CJK, color=WHITE).scale(0.46).next_to(a_h, DOWN, buff=0.15)

        # 外电路弧线（电流方向 a -> 外 -> o）
        ext_arc = Arc(radius=1.5, start_angle=0, angle=PI,
                      color=CYAN, stroke_width=3).shift(DOWN * 0.4)
        ext_tip = Arrow(
            ext_arc.get_end() + RIGHT * 0.01,
            ext_arc.get_end() + LEFT * 0.18,
            buff=0, color=CYAN, stroke_width=3,
            max_tip_length_to_length_ratio=0.5,
        )
        ext_lbl = Text("外电路电流方向", font=CJK, color=CYAN).scale(0.40).next_to(ext_arc, UP, buff=0.22)

        # 杆内电流方向（a -> o，即向左）
        inner_arr = Arrow(rod_h.get_end() + LEFT * 0.3,
                          rod_h.get_start() + RIGHT * 0.3,
                          buff=0, color=F_COLOR, stroke_width=3,
                          max_tip_length_to_length_ratio=0.2)
        inner_lbl = Text("杆内 F 推电子向 o (电流 a->o)", font=CJK, color=F_COLOR).scale(0.38)
        inner_lbl.next_to(rod_h, UP, buff=0.25)

        # 说明文字
        pol_note = VGroup(
            Text("洛伦兹力将自由电子推向 o 端", font=CJK).scale(0.42),
            Text("o 端积聚负电荷 → o 端为低电位？", font=CJK, color=RED).scale(0.42),
            Text("注：电流正方向与电子运动方向相反", font=CJK, color=ORANGE).scale(0.42),
            Text("o 端为正极（高电位），a 端为负极", font=CJK, color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        pol_note.next_to(title, DOWN, buff=0.42)
        pol_note.scale_to_fit_width(12.8)

        self.play(FadeIn(pol_title))
        self.play(FadeIn(pol_note))
        self.wait(2.5)
        self.play(FadeOut(pol_note))

        self.play(Create(rod_h), FadeIn(o_h), FadeIn(a_h), FadeIn(o_hl), FadeIn(a_hl))
        self.play(Create(ext_arc), FadeIn(ext_tip), FadeIn(ext_lbl))
        self.play(Create(inner_arr), FadeIn(inner_lbl))
        self.wait(2.0)
        self.play(FadeOut(VGroup(pol_title, rod_h, o_h, a_h, o_hl, a_hl,
                                  ext_arc, ext_tip, ext_lbl, inner_arr, inner_lbl)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 10  数值例子
        # ══════════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.45)

        cond_zh = Text("B = 0.5 T,  L = 0.4 m,  转速 n = 10 r/s", font=CJK).scale(0.46)
        cond_zh.next_to(ex_title, DOWN, buff=0.38)

        step_om = MathTex(r"\omega = 2\pi n = 2\pi \times 10 \approx 62.8\ \mathrm{rad/s}",
                          color=CYAN).scale(0.76)
        step_om.next_to(cond_zh, DOWN, buff=0.35)

        step_calc = MathTex(
            r"\varepsilon = \frac{1}{2}B\omega L^2"
            r"= \frac{1}{2}\times 0.5\times 62.8\times (0.4)^2"
            r"\approx 2.51\ \mathrm{V}",
            color=GREEN,
        ).scale(0.72)
        step_calc.next_to(step_om, DOWN, buff=0.38)
        step_calc.scale_to_fit_width(12.5)

        self.play(FadeIn(ex_title), FadeIn(cond_zh))
        self.wait(0.8)
        self.play(Write(step_om))
        self.wait(0.8)
        self.play(Write(step_calc))
        box_ex = SurroundingRectangle(step_calc, color=GREEN, buff=0.15, corner_radius=0.1)
        self.play(Create(box_ex))
        self.wait(2.0)
        self.play(FadeOut(VGroup(ex_title, cond_zh, step_om, step_calc, box_ex)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 11  小结卡
        # ══════════════════════════════════════════════════════════════════════
        sum_title = Text("本例小结", font=CJK, color=BLUE).scale(0.55)
        sum_title.next_to(title, DOWN, buff=0.45)

        s1_zh = Text("微元法：", font=CJK, color=WHITE).scale(0.44)
        s1_f  = MathTex(r"\mathrm{d}\varepsilon = B\omega r\,\mathrm{d}r", color=YELLOW).scale(0.82)
        s1 = VGroup(s1_zh, s1_f).arrange(RIGHT, buff=0.15)

        s2_zh = Text("积分：", font=CJK, color=WHITE).scale(0.44)
        s2_f  = MathTex(r"\varepsilon = \int_0^L B\omega r\,\mathrm{d}r = \frac{1}{2}B\omega L^2",
                        color=YELLOW).scale(0.82)
        s2 = VGroup(s2_zh, s2_f).arrange(RIGHT, buff=0.15)

        s3_zh = Text("法拉第验证：", font=CJK, color=WHITE).scale(0.44)
        s3_f  = MathTex(r"\Phi=\tfrac{1}{2}BL^2\theta \;\Rightarrow\;"
                        r"\varepsilon=\tfrac{1}{2}B\omega L^2", color=YELLOW).scale(0.78)
        s3 = VGroup(s3_zh, s3_f).arrange(RIGHT, buff=0.15)

        s4_zh = Text("o 端为高电位（正极），a 端为低电位（负极）", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(s1, s2, s3, s4_zh).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.8)
        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(sum_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4_zh))
        self.play(Create(box_sum))
        self.wait(2.5)
        self.play(FadeOut(VGroup(sum_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Ex1RotatingRodEmfIntegration",
        "id": "phys-ch09-9.2-ex1-rotating-rod-emf-integration",
        "chapterId": "ch09",
        "sectionId": "9.2",
        "title": "旋转金属杆的动生电动势",
        "description": "用洛伦兹力微元积分与法拉第定律两种方法推导旋转金属杆的动生电动势 ε=BωL²/2，ValueTracker 演示微元扫动与扇形面积增长，验证两法等价并分析极性。",
    },
]
