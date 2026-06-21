"""第 10.1 节 · 例题：玻璃球内气泡定位。

折射球面成像公式的典型例题：观察者从空气侧看玻璃球内气泡，
气泡「表观位置」比真实位置更靠近观察者（视深变浅现象）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch10Ex1GlassBallBubblePosition",
        "id": "phys-ch10-10.1-ex1-glass-ball-bubble-position",
        "chapterId": "ch10",
        "sectionId": "10.1",
        "title": "玻璃球内气泡定位",
        "description": "用折射球面公式逐步求解玻璃球内气泡的真实与表观位置，揭示视深变浅原理。",
    },
]


class Ch10Ex1GlassBallBubblePosition(Scene):
    def construct(self):
        # ─────────────────────────────────────────────────────────────
        # Step 1: 标题
        # ─────────────────────────────────────────────────────────────
        title = Text("玻璃球内气泡定位", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.1  例题精讲", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ─────────────────────────────────────────────────────────────
        # Step 2: 生活类比引入
        # ─────────────────────────────────────────────────────────────
        ana1 = Text("游泳池里的硬币看起来比实际位置浅，", font=CJK).scale(0.48)
        ana2 = Text("这是因为光从水到空气折射后，表观像点上移了。", font=CJK).scale(0.48)
        ana3 = Text("玻璃球内的气泡同样如此——", font=CJK).scale(0.48)
        ana4 = Text("我们今天用折射球面公式精确计算它的真实位置。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        for line in ana:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ─────────────────────────────────────────────────────────────
        # Step 3: 题目情景图 — 玻璃球截面
        # ─────────────────────────────────────────────────────────────
        scene_label = Text("题目情景", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(scene_label))

        # 坐标原点 = 折射面顶点（玻璃球右侧面）
        # 玻璃球直径 2 cm → 半径 1 cm；用 1.8 manim 单位表示 1 cm 半径
        SCALE = 1.8   # 1 cm → 1.8 manim units

        ball_center = np.array([-SCALE, 0.0, 0.0])   # 球心在顶点左侧 1 cm
        ball_radius = SCALE                            # 半径 1 cm

        # 玻璃球（灰色圆）
        glass_ball = Circle(radius=ball_radius, color=GRAY, fill_color=GRAY,
                            fill_opacity=0.18, stroke_width=2.5)
        glass_ball.move_to(ball_center)
        glass_ball.shift(DOWN * 0.5)

        ball_center_pt = glass_ball.get_center()
        # 折射面顶点 = 球右端
        vertex_pt = ball_center_pt + np.array([ball_radius, 0.0, 0.0])

        # 光轴（水平线）
        axis_line = DashedLine(
            ball_center_pt + np.array([-ball_radius - 0.6, 0.0, 0.0]),
            ball_center_pt + np.array([ball_radius + 1.8, 0.0, 0.0]),
            color=GRAY, dash_length=0.12, stroke_width=1.5,
        )

        # 折射面顶点标注
        vertex_dot = Dot(vertex_pt, radius=0.06, color=WHITE)
        vertex_label = Text("顶点 V", font=CJK, color=WHITE).scale(0.36)
        vertex_label.next_to(vertex_pt, UR, buff=0.12)

        # 球心标注
        center_dot = Dot(ball_center_pt, radius=0.06, color=WHITE)
        center_label = Text("球心 C", font=CJK, color=WHITE).scale(0.36)
        center_label.next_to(ball_center_pt, UP, buff=0.12)

        # 曲率半径标注
        r_line = Line(vertex_pt, ball_center_pt, color=CYAN, stroke_width=2)
        r_brace = Brace(r_line, direction=DOWN, color=CYAN)
        r_brace_label_zh = Text("曲率半径", font=CJK, color=CYAN).scale(0.34)
        r_brace_label_eq = MathTex(r"r = 1\,\mathrm{cm}", color=CYAN).scale(0.55)
        r_brace_label = VGroup(r_brace_label_zh, r_brace_label_eq).arrange(RIGHT, buff=0.1)
        r_brace_label.next_to(r_brace, DOWN, buff=0.08)

        # 折射率标注
        n1_label = VGroup(
            Text("玻璃", font=CJK, color=GRAY).scale(0.36),
            MathTex(r"n_1 = 1.5", color=GRAY).scale(0.50),
        ).arrange(DOWN, buff=0.06).move_to(ball_center_pt + np.array([-0.55, 0.55, 0.0]))

        n2_label = VGroup(
            Text("空气", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"n_2 = 1.0", color=WHITE).scale(0.50),
        ).arrange(DOWN, buff=0.06).move_to(vertex_pt + np.array([0.9, 0.55, 0.0]))

        self.play(Create(glass_ball), Create(axis_line))
        self.play(FadeIn(vertex_dot), FadeIn(vertex_label))
        self.play(FadeIn(center_dot), FadeIn(center_label))
        self.play(Create(r_line), GrowFromCenter(r_brace), FadeIn(r_brace_label))
        self.play(FadeIn(n1_label), FadeIn(n2_label))
        self.wait(1.2)

        # ─────────────────────────────────────────────────────────────
        # Step 4: 表观像点（观察者视线逆延伸）
        # ─────────────────────────────────────────────────────────────
        # 表观像 v = -0.5 cm → 在顶点右侧 0.5×SCALE = 0.9 单位
        # (负号表示虚像，在入射光同侧即玻璃内，但约定成像空间在右侧空气中)
        # 按题意：表观像在球心左侧 0.5 cm 处（球内）
        apparent_pt = ball_center_pt + np.array([0.5 * SCALE, 0.0, 0.0])  # 距顶点左侧 0.5cm

        # 修正：v = -0.5 表示像在顶点同侧（左侧空气→玻璃内），即顶点左侧 0.9 单位
        apparent_pt = vertex_pt + np.array([-0.5 * SCALE, 0.0, 0.0])

        apparent_dot = RegularPolygon(n=3, color=ORANGE, fill_opacity=0,
                                      stroke_width=2.5).scale(0.18)
        apparent_dot.move_to(apparent_pt)

        apparent_label = VGroup(
            Text("表观像点", font=CJK, color=ORANGE).scale(0.34),
            MathTex(r"v = -0.5\,\mathrm{cm}", color=ORANGE).scale(0.45),
        ).arrange(DOWN, buff=0.05)
        apparent_label.next_to(apparent_pt, UP, buff=0.22)

        # 观察者视线虚线（从右侧延伸进来，汇聚到表观点）
        obs_pt = vertex_pt + np.array([1.5, 0.0, 0.0])
        ray_angle_up = 18 * DEGREES
        ray_angle_dn = -18 * DEGREES
        vis_ray_up = DashedLine(
            obs_pt + np.array([0, 0.35, 0]),
            apparent_pt, color=ORANGE, stroke_width=1.8, dash_length=0.10,
        )
        vis_ray_dn = DashedLine(
            obs_pt + np.array([0, -0.35, 0]),
            apparent_pt, color=ORANGE, stroke_width=1.8, dash_length=0.10,
        )
        obs_eye = Text("观察者", font=CJK, color=ORANGE).scale(0.36)
        obs_eye.next_to(obs_pt, RIGHT, buff=0.1)

        step4_label = Text("观察者视线反向延伸 → 表观像点", font=CJK, color=ORANGE).scale(0.40)
        step4_label.next_to(title, DOWN, buff=0.08)

        self.play(FadeIn(apparent_dot), FadeIn(apparent_label))
        self.play(Create(vis_ray_up), Create(vis_ray_dn), FadeIn(obs_eye))
        self.play(FadeIn(step4_label))
        self.wait(1.4)

        # ─────────────────────────────────────────────────────────────
        # Step 5: 引出折射球面公式（逐行）
        # ─────────────────────────────────────────────────────────────
        self.play(FadeOut(step4_label))
        formula_title = Text("折射球面成像公式", font=CJK, color=BLUE).scale(0.50)
        formula_title.next_to(scene_label, DOWN, buff=0.28)

        f_base = MathTex(
            r"\frac{n_1}{u}", r"+", r"\frac{n_2}{v}",
            r"=", r"\frac{n_2 - n_1}{r}"
        ).scale(0.85)
        f_base.next_to(formula_title, DOWN, buff=0.32)

        sign_convention = VGroup(
            Text("符号约定：光从左向右传播；", font=CJK).scale(0.38),
            Text("u > 0 物在左（玻璃侧），r < 0 曲率中心在左", font=CJK).scale(0.38),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
        sign_convention.next_to(f_base, DOWN, buff=0.28)

        self.play(FadeIn(formula_title))
        self.play(Write(f_base))
        self.wait(1.0)
        self.play(FadeIn(sign_convention))
        self.wait(1.4)
        self.play(FadeOut(sign_convention))

        # ─────────────────────────────────────────────────────────────
        # Step 6: 逐一代入参数，每个参数对应图中量高亮
        # ─────────────────────────────────────────────────────────────
        param_title = Text("代入已知量", font=CJK, color=BLUE).scale(0.48)
        param_title.next_to(f_base, DOWN, buff=0.30)
        self.play(FadeIn(param_title))

        # n1 = 1.5 高亮
        self.play(f_base[0].animate.set_color(YELLOW), n1_label.animate.set_color(YELLOW))
        p_n1 = VGroup(
            Text("玻璃折射率", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"n_1 = 1.5", color=YELLOW).scale(0.60),
        ).arrange(RIGHT, buff=0.12).next_to(param_title, DOWN, buff=0.18)
        self.play(FadeIn(p_n1))
        self.wait(0.9)
        self.play(f_base[0].animate.set_color(WHITE), n1_label.animate.set_color(GRAY))
        self.play(FadeOut(p_n1))

        # n2 = 1.0 高亮
        self.play(f_base[2].animate.set_color(YELLOW), n2_label.animate.set_color(YELLOW))
        p_n2 = VGroup(
            Text("空气折射率", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"n_2 = 1.0", color=YELLOW).scale(0.60),
        ).arrange(RIGHT, buff=0.12).next_to(param_title, DOWN, buff=0.18)
        self.play(FadeIn(p_n2))
        self.wait(0.9)
        self.play(f_base[2].animate.set_color(WHITE), n2_label.animate.set_color(WHITE))
        self.play(FadeOut(p_n2))

        # v = -0.5 高亮（表观像）
        self.play(f_base[2].animate.set_color(ORANGE), apparent_dot.animate.set_color(ORANGE))
        p_v = VGroup(
            Text("表观像距（虚像）", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"v = -0.5\,\mathrm{cm}", color=ORANGE).scale(0.60),
        ).arrange(RIGHT, buff=0.12).next_to(param_title, DOWN, buff=0.18)
        self.play(FadeIn(p_v))
        self.wait(0.9)
        self.play(f_base[2].animate.set_color(WHITE), apparent_dot.animate.set_color(ORANGE))
        self.play(FadeOut(p_v))

        # r = -1 高亮（曲率半径）
        self.play(f_base[4].animate.set_color(CYAN), r_line.animate.set_color(YELLOW),
                  r_brace.animate.set_color(YELLOW), r_brace_label.animate.set_color(YELLOW))
        p_r = VGroup(
            Text("曲率半径（中心在顶点左侧）", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"r = -1\,\mathrm{cm}", color=CYAN).scale(0.60),
        ).arrange(RIGHT, buff=0.12).next_to(param_title, DOWN, buff=0.18)
        self.play(FadeIn(p_r))
        self.wait(0.9)
        self.play(f_base[4].animate.set_color(WHITE),
                  r_line.animate.set_color(CYAN),
                  r_brace.animate.set_color(CYAN),
                  r_brace_label.animate.set_color(CYAN))
        self.play(FadeOut(p_r), FadeOut(param_title))

        # ─────────────────────────────────────────────────────────────
        # Step 7: 代入数值，展开方程
        # ─────────────────────────────────────────────────────────────
        eq_title = Text("代入数值展开", font=CJK, color=BLUE).scale(0.50)
        eq_title.next_to(f_base, DOWN, buff=0.30)
        self.play(FadeIn(eq_title))

        eq_sub = MathTex(
            r"\frac{1.5}{u}",
            r"+",
            r"\frac{1.0}{-0.5}",
            r"=",
            r"\frac{1.0 - 1.5}{-1}",
        ).scale(0.82)
        eq_sub.next_to(eq_title, DOWN, buff=0.28)
        eq_sub[2].set_color(ORANGE)
        eq_sub[4].set_color(CYAN)
        self.play(TransformMatchingTex(f_base.copy(), eq_sub))
        self.wait(1.0)

        eq_simp = MathTex(
            r"\frac{1.5}{u}",
            r"- 2.0",
            r"= 0.5",
        ).scale(0.82)
        eq_simp.next_to(eq_sub, DOWN, buff=0.30)
        self.play(Write(eq_simp))
        self.wait(0.8)

        eq_solve = MathTex(
            r"\frac{1.5}{u} = 2.5",
            r"\quad\Rightarrow\quad",
            r"u = \frac{1.5}{2.5} = 0.6\,\mathrm{cm}",
        ).scale(0.82)
        eq_solve[2].set_color(GREEN)
        eq_solve.next_to(eq_simp, DOWN, buff=0.30)
        self.play(Write(eq_solve))
        self.wait(1.5)

        self.play(FadeOut(VGroup(eq_title, eq_sub, eq_simp, eq_solve)))

        # ─────────────────────────────────────────────────────────────
        # Step 8: 在图中标出真实气泡位置
        # ─────────────────────────────────────────────────────────────
        # u = 0.6 cm → 在顶点左侧 0.6×SCALE 单位
        bubble_pt = vertex_pt + np.array([-0.6 * SCALE, 0.0, 0.0])

        bubble_dot = Dot(bubble_pt, radius=0.14, color=RED, fill_opacity=1)
        bubble_label = VGroup(
            Text("真实气泡", font=CJK, color=RED).scale(0.36),
            MathTex(r"u = 0.6\,\mathrm{cm}", color=RED).scale(0.50),
        ).arrange(DOWN, buff=0.05)
        bubble_label.next_to(bubble_pt, DOWN, buff=0.20)

        bubble_note = Text("气泡位于顶点左侧 0.6 cm（比表观位置 0.5 cm 更深）",
                           font=CJK, color=RED).scale(0.38)
        bubble_note.next_to(title, DOWN, buff=0.08)

        self.play(FadeIn(bubble_note))
        self.play(GrowFromCenter(bubble_dot), FadeIn(bubble_label))
        self.wait(1.2)

        # ─────────────────────────────────────────────────────────────
        # Step 9: 气泡发出的真实光线路径
        # ─────────────────────────────────────────────────────────────
        ray_title = Text("气泡发出的真实折射光线", font=CJK, color=CYAN).scale(0.40)
        ray_title.next_to(bubble_note, DOWN, buff=0.08)
        self.play(FadeIn(ray_title))

        # 两条真实光线（从气泡出发，在折射面折射后进入空气向右）
        # 简化：直线从气泡到折射面上两点，再以稍微发散的方向射出
        face_up   = vertex_pt + np.array([0.0,  0.55, 0.0])
        face_dn   = vertex_pt + np.array([0.0, -0.55, 0.0])
        exit_up   = vertex_pt + np.array([1.4,  0.72, 0.0])
        exit_dn   = vertex_pt + np.array([1.4, -0.72, 0.0])

        ray1_in  = Line(bubble_pt, face_up,  color=CYAN, stroke_width=2)
        ray1_out = Arrow(face_up, exit_up,   color=CYAN, stroke_width=2,
                         buff=0, max_tip_length_to_length_ratio=0.18)
        ray2_in  = Line(bubble_pt, face_dn,  color=CYAN, stroke_width=2)
        ray2_out = Arrow(face_dn, exit_dn,   color=CYAN, stroke_width=2,
                         buff=0, max_tip_length_to_length_ratio=0.18)

        self.play(Create(ray1_in), Create(ray2_in))
        self.play(Create(ray1_out), Create(ray2_out))
        self.wait(1.0)

        # 标注折射
        refrac_mark = Text("折射", font=CJK, color=CYAN).scale(0.36)
        refrac_mark.next_to(vertex_pt, RIGHT, buff=0.08).shift(UP * 0.6)
        self.play(FadeIn(refrac_mark))
        self.wait(1.0)
        self.play(FadeOut(ray_title))

        # ─────────────────────────────────────────────────────────────
        # Step 10: 对比表观 vs 真实，加注「视深变浅」结论
        # ─────────────────────────────────────────────────────────────
        comp_title = Text("对比：表观位置 vs 真实位置", font=CJK, color=BLUE).scale(0.50)
        comp_title.next_to(f_base, DOWN, buff=0.30)
        self.play(FadeIn(comp_title), FadeOut(bubble_note))

        comp1 = VGroup(
            Text("表观位置", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"|v| = 0.5\,\mathrm{cm}", color=ORANGE).scale(0.60),
            Text("（离顶点更近）", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.18)

        comp2 = VGroup(
            Text("真实位置", font=CJK, color=RED).scale(0.44),
            MathTex(r"u = 0.6\,\mathrm{cm}", color=RED).scale(0.60),
            Text("（离顶点更远）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.18)

        comp_arrow = MathTex(r"\Rightarrow").scale(0.9)

        concl = VGroup(
            Text("视深变浅：", font=CJK, color=GREEN).scale(0.44),
            Text("从光疏介质观察光密介质内的物体，", font=CJK, color=GREEN).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        concl2 = Text("表观深度 < 真实深度（气泡看起来比实际位置更靠近观察者）",
                      font=CJK, color=GREEN).scale(0.38)

        comp_group = VGroup(comp1, comp2).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        comp_group.next_to(comp_title, DOWN, buff=0.32)
        concl_group = VGroup(concl, concl2).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        concl_group.next_to(comp_group, DOWN, buff=0.38)

        self.play(FadeIn(comp1))
        self.wait(0.6)
        self.play(FadeIn(comp2))
        self.wait(0.8)
        self.play(FadeIn(concl_group))
        self.wait(1.4)
        self.play(FadeOut(VGroup(comp_title, comp_group)))

        # ─────────────────────────────────────────────────────────────
        # Step 11: 小结卡（关键公式汇总 + 方框）
        # ─────────────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(
            glass_ball, axis_line, vertex_dot, vertex_label,
            center_dot, center_label, r_line, r_brace, r_brace_label,
            n1_label, n2_label,
            apparent_dot, apparent_label, vis_ray_up, vis_ray_dn, obs_eye,
            bubble_dot, bubble_label,
            ray1_in, ray1_out, ray2_in, ray2_out, refrac_mark,
            f_base, scene_label, concl_group,
        )))

        sum_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1 = MathTex(
            r"\frac{n_1}{u} + \frac{n_2}{v} = \frac{n_2 - n_1}{r}",
            color=YELLOW,
        ).scale(0.85)
        s2 = MathTex(
            r"\frac{1.5}{u} + \frac{1.0}{-0.5} = \frac{1.0-1.5}{-1}"
            r"\quad\Rightarrow\quad u = 0.6\,\mathrm{cm}",
            color=GREEN,
        ).scale(0.72)
        s3 = VGroup(
            Text("结论：", font=CJK, color=WHITE).scale(0.44),
            Text("视深变浅——从光疏介质看光密介质内的物体，表观深度更小。", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.1)

        s_group = VGroup(s1, s2, s3).arrange(DOWN, buff=0.40)
        s_group.next_to(sum_title, DOWN, buff=0.42)
        s_group.scale_to_fit_width(12)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        self.play(Write(s1))
        self.wait(0.8)
        self.play(Write(s2))
        self.wait(0.8)
        self.play(FadeIn(s3))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(sum_title, s_group, box, title)))
        self.wait(0.3)
