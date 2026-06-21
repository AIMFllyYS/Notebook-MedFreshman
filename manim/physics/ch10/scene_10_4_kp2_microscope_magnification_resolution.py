"""第 10.4 节 · 显微镜放大率与分辨本领（知识点讲解）。

两阶段成像：物镜 L1 成放大实像，目镜 L2 作放大镜观察虚像；
ValueTracker + always_redraw 演示数值孔径 N.A. 变化时最小分辨距离的实时变化。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch10Kp2MicroscopeMagnificationResolution(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("显微镜放大率与分辨本领", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.4", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text("显微镜由两块透镜串联而成：", font=CJK).scale(0.50)
        ana2 = Text("物镜先把微小物体放大成实像，目镜再像放大镜一样继续放大。", font=CJK).scale(0.46)
        ana3 = Text("两级放大的「乘积」决定最终倍率。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 显微镜光路示意图（纵向排列 L1、L2）
        # ═══════════════════════════════════════════════════════════════
        # 布局参数
        L1_y = 0.8    # L1 透镜 y 坐标（下方）
        L2_y = 2.4    # L2 透镜 y 坐标（上方）
        lens_w = 2.4
        lens_h = 0.18

        # 物体 P（在 L1 正下方）
        obj_y = L1_y - 1.8
        obj_x = -0.0
        arrow_P = Arrow(
            start=np.array([obj_x, obj_y, 0]),
            end=np.array([obj_x, obj_y + 0.5, 0]),
            buff=0, color=GREEN, stroke_width=4,
        )
        label_P = Text("P (物)", font=CJK, color=GREEN).scale(0.38)
        label_P.next_to(arrow_P, RIGHT, buff=0.12)

        # L1 透镜（椭圆代表双凸透镜）
        L1 = Ellipse(width=lens_w, height=lens_h, color=BLUE_B, stroke_width=2.5)
        L1.move_to(np.array([0, L1_y, 0]))
        label_L1 = VGroup(
            Text("L", font=CJK, color=BLUE_B).scale(0.38),
            MathTex(r"_1", color=BLUE_B).scale(0.45),
        ).arrange(RIGHT, buff=0.02).next_to(L1, RIGHT, buff=0.18)
        f1_label = VGroup(
            MathTex(r"f_1", color=CYAN).scale(0.42),
            Text("(短焦)", font=CJK, color=CYAN).scale(0.35),
        ).arrange(RIGHT, buff=0.1).next_to(L1, LEFT, buff=0.25)

        # 镜筒长度标注（L1 → L2 之间）
        brace_tube = Brace(
            Line(np.array([lens_w / 2 + 0.3, L1_y, 0]),
                 np.array([lens_w / 2 + 0.3, L2_y, 0])),
            direction=RIGHT, color=WHITE,
        )
        brace_tube_label = VGroup(
            Text("镜筒长", font=CJK, color=WHITE).scale(0.35),
            MathTex(r"s", color=WHITE).scale(0.45),
        ).arrange(RIGHT, buff=0.06)
        brace_tube_label.next_to(brace_tube, RIGHT, buff=0.12)

        # L2 透镜
        L2 = Ellipse(width=lens_w, height=lens_h, color=ORANGE, stroke_width=2.5)
        L2.move_to(np.array([0, L2_y, 0]))
        label_L2 = VGroup(
            Text("L", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"_2", color=ORANGE).scale(0.45),
        ).arrange(RIGHT, buff=0.02).next_to(L2, RIGHT, buff=0.18)
        f2_label = VGroup(
            MathTex(r"f_2", color=YELLOW).scale(0.42),
            Text("(长焦)", font=CJK, color=YELLOW).scale(0.35),
        ).arrange(RIGHT, buff=0.1).next_to(L2, LEFT, buff=0.25)

        # 眼睛（L2 上方）
        eye_y = L2_y + 0.9
        eye = Circle(radius=0.22, color=WHITE, stroke_width=2)
        eye.move_to(np.array([0, eye_y, 0]))
        pupil = Dot(point=np.array([0, eye_y, 0]), radius=0.07, color=WHITE)
        eye_label = Text("眼", font=CJK, color=WHITE).scale(0.38).next_to(eye, RIGHT, buff=0.12)

        # P1 中间实像（L1 与 L2 之间）
        img1_y = (L1_y + L2_y) / 2 + 0.1
        arrow_P1 = Arrow(
            start=np.array([0, img1_y, 0]),
            end=np.array([0, img1_y + 0.85, 0]),
            buff=0, color=YELLOW, stroke_width=3,
        )
        label_P1 = Text("P1 (实像)", font=CJK, color=YELLOW).scale(0.36)
        label_P1.next_to(arrow_P1, RIGHT, buff=0.1)
        box_P1 = SurroundingRectangle(arrow_P1, color=YELLOW, buff=0.1)

        # 全部光路图组合
        optical_group = VGroup(
            arrow_P, label_P,
            L1, label_L1, f1_label,
            brace_tube, brace_tube_label,
            L2, label_L2, f2_label,
            eye, pupil, eye_label,
        )
        optical_group.scale(0.82).shift(LEFT * 3.2 + DOWN * 0.5)

        # 重新取出缩放后对象引用——用整组显示
        self.play(
            Create(L1), Create(L2),
            FadeIn(label_L1), FadeIn(label_L2),
            FadeIn(f1_label), FadeIn(f2_label),
            run_time=1.2,
        )
        self.play(
            GrowArrow(arrow_P), FadeIn(label_P),
            FadeIn(brace_tube), FadeIn(brace_tube_label),
            Create(eye), FadeIn(pupil), FadeIn(eye_label),
            run_time=1.0,
        )
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 阶段① — 物镜放大率 m = v1/u1
        # ═══════════════════════════════════════════════════════════════
        stage1_title = Text("阶段①: 物镜成放大实像", font=CJK, color=BLUE).scale(0.48)
        stage1_title.to_corner(UR, buff=0.5).shift(DOWN * 0.5)

        m_def_txt = Text("线放大率", font=CJK, color=WHITE).scale(0.42)
        m_def_eq = MathTex(r"m = \frac{v_1}{u_1}", color=YELLOW).scale(0.82)
        m_def = VGroup(m_def_txt, m_def_eq).arrange(RIGHT, buff=0.22)
        m_def.next_to(stage1_title, DOWN, buff=0.35)

        note_m = Text("u1: 物距  v1: 像距", font=CJK, color=CYAN).scale(0.38)
        note_m.next_to(m_def, DOWN, buff=0.22)

        self.play(FadeIn(stage1_title))
        self.play(Write(m_def_txt), Write(m_def_eq))
        self.wait(0.8)
        self.play(FadeIn(note_m))

        # 显示 P1 中间像 + 黄色方框
        self.play(GrowArrow(arrow_P1), FadeIn(label_P1))
        self.play(Create(box_P1))
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 阶段② — 目镜角放大率 α2 = 25/f2
        # ═══════════════════════════════════════════════════════════════
        stage2_title = Text("阶段②: 目镜放大虚像", font=CJK, color=ORANGE).scale(0.48)
        stage2_title.next_to(note_m, DOWN, buff=0.45)

        alpha_txt = Text("角放大率", font=CJK, color=WHITE).scale(0.42)
        alpha_eq = MathTex(r"\alpha_2 = \frac{25}{f_2}", color=YELLOW).scale(0.82)
        alpha_def = VGroup(alpha_txt, alpha_eq).arrange(RIGHT, buff=0.22)
        alpha_def.next_to(stage2_title, DOWN, buff=0.30)

        note_25 = Text("25 cm = 明视距离", font=CJK, color=CYAN).scale(0.38)
        note_25.next_to(alpha_def, DOWN, buff=0.20)

        self.play(FadeIn(stage2_title))
        self.play(Write(alpha_txt), Write(alpha_eq))
        self.play(FadeIn(note_25))
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════
        # Step 6: 总放大率合并 M = m·α2
        # ═══════════════════════════════════════════════════════════════
        total_title = Text("总放大率 = 两级乘积", font=CJK, color=GREEN).scale(0.50)
        total_title.next_to(note_25, DOWN, buff=0.45)

        # 用方框框出 m 和 α2，中间乘号，合并出 M
        box_m = SurroundingRectangle(m_def_eq, color=YELLOW, buff=0.10)
        box_a = SurroundingRectangle(alpha_eq, color=ORANGE, buff=0.10)

        M_eq1 = MathTex(
            r"M", r"=", r"m", r"\cdot", r"\alpha_2",
            r"=", r"\frac{v_1}{u_1}", r"\cdot", r"\frac{25}{f_2}",
            color=WHITE,
        ).scale(0.72)
        M_eq1[0].set_color(GREEN)
        M_eq1[2].set_color(YELLOW)
        M_eq1[4].set_color(ORANGE)
        M_eq1[6].set_color(YELLOW)
        M_eq1[8].set_color(ORANGE)
        M_eq1.next_to(total_title, DOWN, buff=0.30)

        M_eq2 = MathTex(r"M = \frac{25\,s}{f_1\,f_2}", color=GREEN).scale(0.82)
        M_eq2.next_to(M_eq1, DOWN, buff=0.28)

        self.play(FadeIn(total_title))
        self.play(Create(box_m), Create(box_a))
        self.wait(0.6)
        self.play(Write(M_eq1))
        self.wait(0.8)
        self.play(TransformMatchingTex(M_eq1.copy(), M_eq2))
        box_M = SurroundingRectangle(M_eq2, color=GREEN, buff=0.12)
        self.play(Create(box_M))
        self.wait(1.8)

        # 淡出第一部分（光路图+放大率推导）
        all_stage1 = VGroup(
            arrow_P, label_P, L1, label_L1, f1_label,
            brace_tube, brace_tube_label,
            L2, label_L2, f2_label,
            eye, pupil, eye_label,
            arrow_P1, label_P1, box_P1,
            stage1_title, m_def, note_m,
            stage2_title, alpha_def, note_25,
            total_title, box_m, box_a,
            M_eq1, M_eq2, box_M,
        )
        self.play(FadeOut(all_stage1), run_time=1.0)
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 切换至「分辨本领」场景 — 数值孔径几何示意
        # ═══════════════════════════════════════════════════════════════
        res_title = Text("分辨本领：能分辨的最小间距", font=CJK, color=BLUE).scale(0.50)
        res_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(res_title))
        self.wait(0.8)

        # 公式定义
        na_txt = Text("数值孔径", font=CJK, color=WHITE).scale(0.44)
        na_eq = MathTex(r"\mathrm{N.A.} = n\sin u", color=YELLOW).scale(0.85)
        na_row = VGroup(na_txt, na_eq).arrange(RIGHT, buff=0.25)
        na_row.next_to(res_title, DOWN, buff=0.40)

        z_txt = Text("最小分辨距离", font=CJK, color=WHITE).scale(0.44)
        z_eq = MathTex(r"Z = \frac{0.61\,\lambda}{\mathrm{N.A.}}", color=YELLOW).scale(0.85)
        z_row = VGroup(z_txt, z_eq).arrange(RIGHT, buff=0.25)
        z_row.next_to(na_row, DOWN, buff=0.30)

        self.play(FadeIn(na_txt), Write(na_eq))
        self.wait(0.8)
        self.play(FadeIn(z_txt), Write(z_eq))
        self.wait(1.0)
        self.play(FadeOut(VGroup(na_row, z_row)))

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 几何示意 — 圆锥光束 + ValueTracker 改变张角
        # ═══════════════════════════════════════════════════════════════
        geo_note = Text("N.A. 越大 → 收光角越大 → 分辨率越高", font=CJK, color=ORANGE).scale(0.42)
        geo_note.next_to(res_title, DOWN, buff=0.40)
        self.play(FadeIn(geo_note))

        # 物镜孔径圆锥示意（在屏幕下方中央）
        apex_y = -2.6        # 圆锥顶点（样品位置）
        lens_y_geo = 0.2     # 透镜位置
        lens_half_w = 1.6    # 透镜半径

        u_tracker = ValueTracker(0.35)   # 半张角（弧度）

        def make_cone():
            u_val = u_tracker.get_value()
            half_w = lens_y_geo - apex_y  # y 方向距离
            cone_x = half_w * math.tan(u_val)
            apex = np.array([0, apex_y, 0])
            left_edge = np.array([-cone_x, lens_y_geo, 0])
            right_edge = np.array([cone_x, lens_y_geo, 0])
            left_ray = Line(apex, left_edge, color=CYAN, stroke_width=2)
            right_ray = Line(apex, right_edge, color=CYAN, stroke_width=2)
            # 透镜线段
            lens_line = Line(
                np.array([-lens_half_w, lens_y_geo, 0]),
                np.array([lens_half_w, lens_y_geo, 0]),
                color=BLUE_B, stroke_width=3,
            )
            # 填充锥面（三角形）
            tri = Polygon(apex, left_edge, right_edge,
                          fill_color=BLUE, fill_opacity=0.18, stroke_width=0)
            return VGroup(tri, left_ray, right_ray, lens_line)

        cone = always_redraw(make_cone)

        # 角度弧线与 u 标注
        def make_angle_arc():
            u_val = u_tracker.get_value()
            arc = Arc(
                radius=0.55,
                start_angle=PI / 2 - u_val,
                angle=u_val,
                arc_center=np.array([0, apex_y, 0]),
                color=WHITE,
                stroke_width=2,
            )
            return arc

        angle_arc = always_redraw(make_angle_arc)

        u_label_static = MathTex(r"u", color=WHITE).scale(0.55)
        u_label_static.move_to(np.array([0.8, apex_y + 0.7, 0]))

        # 样品点
        sample_dot = Dot(np.array([0, apex_y, 0]), radius=0.09, color=GREEN)
        sample_label = Text("样品", font=CJK, color=GREEN).scale(0.38)
        sample_label.next_to(sample_dot, DOWN, buff=0.12)

        # n 标注（介质折射率）
        n_label = VGroup(
            Text("介质", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"n", color=WHITE).scale(0.45),
        ).arrange(RIGHT, buff=0.08)
        n_label.move_to(np.array([-2.2, (apex_y + lens_y_geo) / 2, 0]))

        self.play(Create(cone), FadeIn(sample_dot), FadeIn(sample_label),
                  FadeIn(angle_arc), FadeIn(u_label_static), FadeIn(n_label))
        self.wait(0.8)

        # ═══════════════════════════════════════════════════════════════
        # Step 9: N.A. / Z 实时读数（ValueTracker 驱动）
        # ═══════════════════════════════════════════════════════════════
        lambda_nm = 550   # 波长 nm
        n_val = 1.0       # 折射率（空气）

        na_readout = always_redraw(lambda: VGroup(
            Text("N.A. =", font=CJK, color=YELLOW).scale(0.44),
            MathTex(
                rf"{n_val * math.sin(u_tracker.get_value()):.3f}",
                color=YELLOW,
            ).scale(0.60),
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.55).shift(DOWN * 0.3))

        z_readout = always_redraw(lambda: VGroup(
            Text("Z =", font=CJK, color=GREEN).scale(0.44),
            MathTex(
                rf"{0.61 * lambda_nm / (n_val * math.sin(u_tracker.get_value())):.0f}"
                r"\,\mathrm{nm}",
                color=GREEN,
            ).scale(0.60),
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.55).shift(DOWN * 0.95))

        self.add(na_readout, z_readout)
        self.wait(0.6)

        # 增大张角 → N.A. 增大 → Z 缩短
        grow_note = Text("增大孔径角 u → N.A. 增大 → Z 缩短 → 分辨率提升", font=CJK,
                         color=ORANGE).scale(0.40)
        grow_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(grow_note))
        self.play(u_tracker.animate.set_value(0.72), run_time=2.5)
        self.wait(0.8)

        # 高亮分辨率提升
        highlight = Text("分辨率提升！", font=CJK, color=RED).scale(0.55)
        highlight.next_to(z_readout, DOWN, buff=0.18)
        self.play(FadeIn(highlight))
        self.wait(0.8)
        self.play(FadeOut(highlight))

        # 缩小张角演示
        shrink_note = Text("减小孔径角 u → N.A. 减小 → Z 增大 → 分辨率下降", font=CJK,
                           color=CYAN).scale(0.40)
        shrink_note.to_edge(DOWN, buff=0.85)
        self.play(FadeIn(shrink_note))
        self.play(u_tracker.animate.set_value(0.20), run_time=2.0)
        self.wait(0.8)
        self.play(FadeOut(shrink_note), FadeOut(grow_note))

        # 复原到中间值
        self.play(u_tracker.animate.set_value(0.50), run_time=1.2)
        self.wait(0.6)

        # 淡出几何示意
        geo_all = VGroup(
            cone, sample_dot, sample_label,
            angle_arc, u_label_static, n_label,
        )
        self.play(FadeOut(geo_all), FadeOut(na_readout), FadeOut(z_readout),
                  FadeOut(geo_note), FadeOut(res_title))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 10: 数值例子
        # ═══════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.55)
        ex1_txt = Text(
            "f1=5 mm, f2=25 mm, s=160 mm  =>  M=?",
            font=CJK,
        ).scale(0.44).next_to(ex_title, DOWN, buff=0.38)
        ex1_calc = MathTex(
            r"M = \frac{25 \times 160}{5 \times 25} = 32\times",
            color=GREEN,
        ).scale(0.80).next_to(ex1_txt, DOWN, buff=0.30)

        ex2_txt = Text(
            "N.A.=0.65, lambda=550 nm  =>  Z=?",
            font=CJK,
        ).scale(0.44).next_to(ex1_calc, DOWN, buff=0.38)
        ex2_calc = MathTex(
            r"Z = \frac{0.61 \times 550}{0.65} \approx 516\,\mathrm{nm}",
            color=GREEN,
        ).scale(0.80).next_to(ex2_txt, DOWN, buff=0.28)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1_txt))
        self.wait(0.6)
        self.play(Write(ex1_calc))
        self.wait(0.8)
        self.play(FadeIn(ex2_txt))
        self.wait(0.6)
        self.play(Write(ex2_calc))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_title, ex1_txt, ex1_calc, ex2_txt, ex2_calc)))

        # ═══════════════════════════════════════════════════════════════
        # Step 11: 小结卡（关键公式汇总 + 方框）
        # ═══════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56).next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(sum_title))

        f1 = MathTex(r"m = \frac{v_1}{u_1}", color=YELLOW).scale(0.78)
        f2 = MathTex(r"\alpha_2 = \frac{25}{f_2}", color=YELLOW).scale(0.78)
        f3 = MathTex(r"M = \frac{25\,s}{f_1\,f_2}", color=GREEN).scale(0.88)
        f4 = MathTex(r"\mathrm{N.A.} = n\sin u", color=CYAN).scale(0.78)
        f5 = MathTex(r"Z = \frac{0.61\,\lambda}{\mathrm{N.A.}}", color=CYAN).scale(0.78)

        label_m = Text("物镜线放大率", font=CJK, color=YELLOW).scale(0.38)
        label_a = Text("目镜角放大率", font=CJK, color=YELLOW).scale(0.38)
        label_M = Text("显微镜总放大率", font=CJK, color=GREEN).scale(0.38)
        label_na = Text("数值孔径", font=CJK, color=CYAN).scale(0.38)
        label_z = Text("最小分辨距离", font=CJK, color=CYAN).scale(0.38)

        row_m = VGroup(label_m, f1).arrange(RIGHT, buff=0.30)
        row_a = VGroup(label_a, f2).arrange(RIGHT, buff=0.30)
        row_M = VGroup(label_M, f3).arrange(RIGHT, buff=0.30)
        row_na = VGroup(label_na, f4).arrange(RIGHT, buff=0.30)
        row_z = VGroup(label_z, f5).arrange(RIGHT, buff=0.30)

        summary_group = VGroup(row_m, row_a, row_M, row_na, row_z).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT,
        ).next_to(sum_title, DOWN, buff=0.40)
        summary_group.scale_to_fit_width(10.0)

        box_sum = SurroundingRectangle(summary_group, color=BLUE, buff=0.28, corner_radius=0.14)

        self.play(Write(row_m), Write(row_a))
        self.wait(0.5)
        self.play(Write(row_M))
        self.wait(0.5)
        self.play(Write(row_na), Write(row_z))
        self.play(Create(box_sum))

        key_msg = Text(
            "N.A. 越大、波长越短 → 分辨本领越高",
            font=CJK, color=ORANGE,
        ).scale(0.44).next_to(box_sum, DOWN, buff=0.32)
        self.play(FadeIn(key_msg))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, summary_group, box_sum, key_msg, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch10Kp2MicroscopeMagnificationResolution",
        "id": "phys-ch10-10.4-kp2-microscope-magnification-resolution",
        "chapterId": "ch10",
        "sectionId": "10.4",
        "title": "显微镜放大率与分辨本领",
        "description": "两阶段光路示意展示物镜/目镜放大率推导，ValueTracker 动态演示数值孔径变化时最小分辨距离的实时变化。",
    },
]
