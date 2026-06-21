"""第 10.1 节 · 单球面折射成像公式（几何光学 · 近轴光线 + ValueTracker 物距扫动）。

物理动画范式：用光路图 + 折射定律演示单球面折射成像，
ValueTracker 拖动物距 u 实时更新像点，逐步推导高斯公式。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch10Kp1SphericalSurfaceRefraction(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("单球面折射成像公式", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        analogy1 = Text("把一根筷子斜插进水杯——", font=CJK).scale(0.5)
        analogy2 = Text("水中的部分看起来「折断」了，这就是光在界面发生折射。", font=CJK).scale(0.5)
        analogy3 = Text("球形界面（如眼球晶体、玻璃球）让折射光线汇聚，从而成像。",
                        font=CJK).scale(0.5)
        ana = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(analogy1))
        self.wait(0.7)
        self.play(FadeIn(analogy2))
        self.wait(0.7)
        self.play(FadeIn(analogy3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 几何光路图建立 ──────────────────────────────────────
        # 布局常量
        AXIS_Y = -0.5          # 光轴 y 坐标（画面中偏下，给公式留上方空间）
        VERTEX_X = 0.0         # 球面顶点 x
        R = 2.0                # 球面曲率半径（正，凸面朝左）
        N1 = 1.0               # 左侧折射率
        N2 = 1.5               # 右侧折射率

        # 介质区域
        n1_rect = Rectangle(
            width=6.5, height=3.6, fill_color="#003366", fill_opacity=0.35,
            stroke_width=0
        ).move_to(np.array([-3.25 + VERTEX_X, AXIS_Y, 0]))
        n2_rect = Rectangle(
            width=6.5, height=3.6, fill_color="#4a1800", fill_opacity=0.35,
            stroke_width=0
        ).move_to(np.array([3.25 + VERTEX_X, AXIS_Y, 0]))

        # 球面弧（凸面向左，圆心在右侧）
        # 弧从顶点 (0, AXIS_Y) 出发，圆心 C = (R, AXIS_Y)
        arc_angle = 65 * DEGREES   # 弧张角半角
        sphere_arc = Arc(
            radius=R,
            start_angle=PI - arc_angle,
            angle=2 * arc_angle,
            color=WHITE,
            stroke_width=3,
        ).move_arc_center_to(np.array([VERTEX_X + R, AXIS_Y, 0]))

        # 光轴
        axis_line = Line(
            np.array([-6.0, AXIS_Y, 0]),
            np.array([6.0, AXIS_Y, 0]),
            color=GRAY, stroke_width=1.5
        )
        axis_label = MathTex(r"\text{optical axis}").scale(0.35).set_color(GRAY)
        axis_label.next_to(np.array([5.5, AXIS_Y, 0]), UP, buff=0.12)

        # 顶点标记
        vertex_dot = Dot(np.array([VERTEX_X, AXIS_Y, 0]), color=WHITE, radius=0.05)
        vertex_label = MathTex(r"V").scale(0.5).next_to(vertex_dot, UP, buff=0.12)

        # 圆心标记
        center_dot = Dot(np.array([VERTEX_X + R, AXIS_Y, 0]), color=CYAN, radius=0.05)
        center_label = MathTex(r"C").scale(0.5).set_color(CYAN).next_to(center_dot, DOWN, buff=0.12)

        # 介质标签
        n1_label = VGroup(
            Text("n", font=CJK, color=BLUE).scale(0.45),
            MathTex(r"_1 = 1.0", color=BLUE).scale(0.45)
        ).arrange(RIGHT, buff=0.05).move_to(np.array([-4.0, AXIS_Y + 1.3, 0]))

        n2_label = VGroup(
            Text("n", font=CJK, color=ORANGE).scale(0.45),
            MathTex(r"_2 = 1.5", color=ORANGE).scale(0.45)
        ).arrange(RIGHT, buff=0.05).move_to(np.array([3.8, AXIS_Y + 1.3, 0]))

        self.play(FadeIn(n1_rect), FadeIn(n2_rect))
        self.play(Create(axis_line), FadeIn(vertex_dot), FadeIn(vertex_label))
        self.play(Create(sphere_arc), FadeIn(center_dot), FadeIn(center_label))
        self.play(FadeIn(n1_label), FadeIn(n2_label))
        self.wait(1.0)

        # ── Step 4: 光路演示（ValueTracker 物距）────────────────────────
        # 物距 u（正值；物在顶点左侧 x = -u）
        u_tracker = ValueTracker(4.5)

        def get_u():
            return u_tracker.get_value()

        def get_v(u_val):
            """近轴公式: n1/u + n2/v = (n2-n1)/r → v = n2 / ((n2-n1)/r - n1/u)"""
            denom = (N2 - N1) / R - N1 / u_val
            if abs(denom) < 1e-6:
                return 1e6  # 无穷远
            v = N2 / denom
            return v

        # 物点（光轴上方，发出近轴光线到顶点）
        OBJECT_HEIGHT = 0.9  # 物点相对光轴的高度

        def make_object_dot():
            u = get_u()
            pos = np.array([-u + VERTEX_X, AXIS_Y, 0])
            return Dot(pos, color=RED, radius=0.10)

        def make_object_label():
            u = get_u()
            pos = np.array([-u + VERTEX_X, AXIS_Y - 0.25, 0])
            return MathTex(r"P", color=RED).scale(0.6).move_to(pos)

        def make_ray_incident():
            """入射光线：从物点 P 射到顶点 V（近轴，沿轴稍上方）"""
            u = get_u()
            p_pos = np.array([-u + VERTEX_X, AXIS_Y + OBJECT_HEIGHT, 0])
            v_pos = np.array([VERTEX_X, AXIS_Y, 0])
            return Arrow(p_pos, v_pos, buff=0, color=YELLOW,
                         stroke_width=2.5, max_tip_length_to_length_ratio=0.15)

        def make_ray_refracted():
            """折射光线：从顶点出发，方向由斯涅尔定律决定（近轴简化）"""
            u = get_u()
            v = get_v(u)
            v_pos = np.array([VERTEX_X, AXIS_Y, 0])
            if v > 0:
                img_pos = np.array([VERTEX_X + v, AXIS_Y, 0])
                # 射线方向：从 V 到 P'（像点在轴上；近轴近似下折射光线汇聚）
                direction = img_pos - v_pos
                end_x = min(VERTEX_X + v, 5.5)
                end_pos = v_pos + direction * (end_x - VERTEX_X) / max(v, 0.01)
                end_pos[0] = min(end_pos[0], 5.5)
            else:
                # 虚像：折射光线发散，延长线交轴于负 v 处
                img_x = VERTEX_X + v  # 负值，在左侧
                img_pos = np.array([img_x, AXIS_Y, 0])
                # 折射光线实际向右传播（发散）
                # 从 V 出发，方向与入射光在同侧
                direction = np.array([5.5 - VERTEX_X, (AXIS_Y - (AXIS_Y + OBJECT_HEIGHT)) * 0.3, 0])
                end_pos = v_pos + direction * 0.8
            return Arrow(v_pos, end_pos, buff=0, color=GREEN,
                         stroke_width=2.5, max_tip_length_to_length_ratio=0.15)

        def make_image_dot():
            u = get_u()
            v = get_v(u)
            if abs(v) > 20:
                return VGroup()  # 像在无穷远，不显示
            pos = np.array([VERTEX_X + v, AXIS_Y, 0])
            col = GREEN if v > 0 else ORANGE
            return Dot(pos, color=col, radius=0.10)

        def make_image_label():
            u = get_u()
            v = get_v(u)
            if abs(v) > 20:
                return VGroup()
            pos = np.array([VERTEX_X + v, AXIS_Y - 0.28, 0])
            return MathTex(r"P'", color=GREEN).scale(0.6).move_to(pos)

        def make_uv_readout():
            u = get_u()
            v = get_v(u)
            u_str = rf"u = {u:.1f}"
            if abs(v) > 20:
                v_str = r"v \to \infty"
            else:
                v_str = rf"v = {v:.1f}"
            line1 = MathTex(u_str, color=RED).scale(0.6)
            line2 = MathTex(v_str, color=GREEN).scale(0.6)
            grp = VGroup(line1, line2).arrange(DOWN, buff=0.15)
            grp.to_corner(UR, buff=0.5)
            return grp

        # 用 always_redraw
        obj_dot = always_redraw(make_object_dot)
        obj_label = always_redraw(make_object_label)
        ray_in = always_redraw(make_ray_incident)
        ray_ref = always_redraw(make_ray_refracted)
        img_dot = always_redraw(make_image_dot)
        img_label = always_redraw(make_image_label)
        uv_readout = always_redraw(make_uv_readout)

        # 物点竖直指示（光轴到物点）
        def make_obj_arrow():
            u = get_u()
            base = np.array([-u + VERTEX_X, AXIS_Y, 0])
            tip = np.array([-u + VERTEX_X, AXIS_Y + OBJECT_HEIGHT, 0])
            return Arrow(base, tip, buff=0, color=RED, stroke_width=2,
                         max_tip_length_to_length_ratio=0.2)

        obj_arrow = always_redraw(make_obj_arrow)

        cap_ray = Text("近轴光线从物点 P 射向顶点 V，在球面发生折射，汇聚到像点 P'",
                       font=CJK, color=GREEN).scale(0.4).to_edge(DOWN, buff=0.55)

        self.play(FadeIn(obj_dot), FadeIn(obj_label), FadeIn(obj_arrow))
        self.play(Create(ray_in))
        self.play(Create(ray_ref))
        self.play(FadeIn(img_dot), FadeIn(img_label))
        self.add(uv_readout)
        self.play(FadeIn(cap_ray))
        self.wait(1.0)

        # 拖动物距：从远到近，观察像距变化
        drag_hint = Text("拖动物距 u，观察像点 P' 的移动", font=CJK, color=CYAN).scale(0.42)
        drag_hint.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(drag_hint))
        self.play(u_tracker.animate.set_value(2.5), run_time=2.8, rate_func=smooth)
        self.wait(0.8)
        self.play(u_tracker.animate.set_value(6.0), run_time=2.5, rate_func=smooth)
        self.wait(0.8)
        self.play(u_tracker.animate.set_value(4.5), run_time=1.5, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(drag_hint), FadeOut(cap_ray))

        # ── Step 5: 焦点高亮 ────────────────────────────────────────────
        # 第二焦点 F2（u→∞ 时像点位置）: v = f2 = n2*r/(n2-n1)
        f2 = N2 * R / (N2 - N1)
        f1 = -N1 * R / (N2 - N1)  # 第一焦点（物在 f1 处，像在无穷远）

        f2_dot = Dot(np.array([VERTEX_X + f2, AXIS_Y, 0]), color=YELLOW, radius=0.12)
        f2_label = MathTex(r"F_2").scale(0.55).set_color(YELLOW)
        f2_label.next_to(f2_dot, UP, buff=0.15)
        f2_note = VGroup(
            Text("第二焦点", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"f_2 = \frac{n_2 r}{n_2-n_1}", color=YELLOW).scale(0.7)
        ).arrange(DOWN, buff=0.15).to_corner(UR, buff=0.5)

        cap_f2 = Text("物在无穷远（平行光）时，折射光线汇聚于第二焦点 F2",
                      font=CJK, color=YELLOW).scale(0.42).to_edge(DOWN, buff=0.55)

        # 物推到无穷远（u 非常大）
        self.play(u_tracker.animate.set_value(80.0), run_time=2.0, rate_func=smooth)
        self.play(FadeIn(f2_dot), Write(f2_label), FadeIn(f2_note), FadeIn(cap_f2))
        self.wait(1.8)
        self.play(FadeOut(f2_dot), FadeOut(f2_label), FadeOut(f2_note), FadeOut(cap_f2))

        # 第一焦点 F1（像在无穷远时的物点位置）
        u_f1 = abs(f1)  # f1 是负的（物在顶点左侧 |f1| 处）
        f1_dot = Dot(np.array([VERTEX_X - u_f1, AXIS_Y, 0]), color=CYAN, radius=0.12)
        f1_label = MathTex(r"F_1").scale(0.55).set_color(CYAN)
        f1_label.next_to(f1_dot, UP, buff=0.15)
        f1_note = VGroup(
            Text("第一焦点", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"f_1 = \frac{n_1 r}{n_2-n_1}", color=CYAN).scale(0.7)
        ).arrange(DOWN, buff=0.15).to_corner(UR, buff=0.5)
        cap_f1 = Text("物在第一焦点 F1 时，折射光线平行出射（像在无穷远）",
                      font=CJK, color=CYAN).scale(0.42).to_edge(DOWN, buff=0.55)

        self.play(u_tracker.animate.set_value(u_f1), run_time=2.0, rate_func=smooth)
        self.play(FadeIn(f1_dot), Write(f1_label), FadeIn(f1_note), FadeIn(cap_f1))
        self.wait(1.8)
        self.play(FadeOut(f1_dot), FadeOut(f1_label), FadeOut(f1_note), FadeOut(cap_f1))

        # 恢复默认物距
        self.play(u_tracker.animate.set_value(4.5), run_time=1.2)
        self.wait(0.5)

        # 清场光路（保留 title，进入推导）
        self.play(FadeOut(VGroup(
            n1_rect, n2_rect, sphere_arc, axis_line,
            vertex_dot, vertex_label, center_dot, center_label,
            n1_label, n2_label,
            obj_dot, obj_label, obj_arrow,
            ray_in, ray_ref,
            img_dot, img_label, uv_readout,
        )))
        self.wait(0.5)

        # ── Step 6: 公式推导（逐步 + 高亮）──────────────────────────────
        derive_title = Text("公式推导：从几何关系到高斯公式", font=CJK, color=BLUE).scale(0.52)
        derive_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(derive_title))

        # 推导步骤：斯涅尔定律近轴近似
        d1 = MathTex(r"n_1 \sin\theta_1 = n_2 \sin\theta_2").scale(0.85)
        d1_zh = VGroup(
            Text("斯涅尔定律；近轴近似", font=CJK).scale(0.42),
            MathTex(r"\sin\theta \approx \theta").scale(0.72)
        ).arrange(RIGHT, buff=0.25)

        d2 = MathTex(r"n_1 \theta_1 \approx n_2 \theta_2").scale(0.85)

        d3_label = Text("利用三角形外角关系整理角度：", font=CJK).scale(0.42)
        d3 = MathTex(
            r"\frac{n_1}{u}", r"+", r"\frac{n_2}{v}", r"=", r"\frac{n_2 - n_1}{r}"
        ).scale(1.0)
        d3[0].set_color(RED)
        d3[2].set_color(GREEN)
        d3[4].set_color(YELLOW)

        steps = VGroup(d1, d1_zh, d2, d3_label, d3).arrange(DOWN, buff=0.38)
        steps.next_to(derive_title, DOWN, buff=0.45)
        steps.scale_to_fit_width(11.5)

        self.play(Write(d1))
        self.wait(0.8)
        self.play(FadeIn(d1_zh))
        self.wait(0.8)
        self.play(TransformMatchingTex(d1.copy(), d2))
        self.wait(1.0)
        self.play(FadeIn(d3_label))
        self.play(Write(d3))
        self.wait(1.5)

        # 高亮各项
        box_d3 = SurroundingRectangle(d3, color=YELLOW, buff=0.2, corner_radius=0.1)
        self.play(Create(box_d3))
        self.wait(1.2)
        self.play(FadeOut(VGroup(d1, d1_zh, d2, d3_label, box_d3, derive_title)))

        # 公式浮动至右上角继续参考
        d3_ref = MathTex(
            r"\frac{n_1}{u} + \frac{n_2}{v} = \frac{n_2-n_1}{r}",
            color=YELLOW
        ).scale(0.6).to_corner(UR, buff=0.55)
        self.play(TransformMatchingTex(d3, d3_ref))
        self.wait(0.5)

        # ── Step 7: 焦距关系推导 ────────────────────────────────────────
        focal_title = Text("焦距表达式", font=CJK, color=BLUE).scale(0.52)
        focal_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(focal_title))

        hint_f2 = VGroup(
            Text("令", font=CJK).scale(0.45),
            MathTex(r"u \to \infty").scale(0.8),
            Text("，得第二焦距", font=CJK).scale(0.45)
        ).arrange(RIGHT, buff=0.2)

        f2_formula = MathTex(r"f_2 = \frac{n_2}{n_2 - n_1} r", color=GREEN).scale(0.95)

        hint_f1 = VGroup(
            Text("令", font=CJK).scale(0.45),
            MathTex(r"v \to \infty").scale(0.8),
            Text("，得第一焦距", font=CJK).scale(0.45)
        ).arrange(RIGHT, buff=0.2)

        f1_formula = MathTex(r"f_1 = \frac{n_1}{n_2 - n_1} r", color=CYAN).scale(0.95)

        gauss_label = Text("代入得高斯焦点公式：", font=CJK).scale(0.45)
        gauss_eq = MathTex(
            r"\frac{f_1}{u}", r"+", r"\frac{f_2}{v}", r"=", r"1"
        ).scale(1.0)
        gauss_eq[0].set_color(CYAN)
        gauss_eq[2].set_color(GREEN)

        focal_group = VGroup(
            hint_f2, f2_formula, hint_f1, f1_formula,
            gauss_label, gauss_eq
        ).arrange(DOWN, buff=0.32)
        focal_group.next_to(focal_title, DOWN, buff=0.45)
        focal_group.scale_to_fit_width(11.0)

        self.play(FadeIn(hint_f2))
        self.play(Write(f2_formula))
        self.wait(0.8)
        self.play(FadeIn(hint_f1))
        self.play(Write(f1_formula))
        self.wait(0.8)
        self.play(FadeIn(gauss_label))
        self.play(Write(gauss_eq))
        gauss_box = SurroundingRectangle(gauss_eq, color=GREEN, buff=0.2, corner_radius=0.1)
        self.play(Create(gauss_box))
        self.wait(1.8)
        self.play(FadeOut(VGroup(focal_title, hint_f2, hint_f1, f2_formula,
                                 f1_formula, gauss_label, gauss_eq, gauss_box)))

        # ── Step 8: 符号法则 + 凸/凹对比 ────────────────────────────────
        sign_title = Text("符号法则与凸/凹球面对比", font=CJK, color=BLUE).scale(0.52)
        sign_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sign_title))

        # 手动构建表格（避免 MathTable 编码问题）
        def make_table_row(col1_text, col2_text, col3_text, col1_color=WHITE,
                           col2_color=WHITE, col3_color=WHITE):
            c1 = Text(col1_text, font=CJK, color=col1_color).scale(0.42)
            c2 = Text(col2_text, font=CJK, color=col2_color).scale(0.42)
            c3 = Text(col3_text, font=CJK, color=col3_color).scale(0.42)
            row = VGroup(c1, c2, c3).arrange(RIGHT, buff=0.9)
            return row

        header = make_table_row("类型", "r 符号", "成像特征",
                                col1_color=YELLOW, col2_color=YELLOW, col3_color=YELLOW)
        row1 = make_table_row("凸球面（向物侧凸）", "r > 0", "折射光线收敛，易成实像",
                              col2_color=GREEN, col3_color=GREEN)
        row2 = make_table_row("凹球面（向像侧凸）", "r < 0", "折射光线发散，易成虚像",
                              col2_color=RED, col3_color=ORANGE)

        table_group = VGroup(header, row1, row2).arrange(DOWN, buff=0.4)
        table_group.next_to(sign_title, DOWN, buff=0.55)
        table_group.scale_to_fit_width(12.5)

        sep_line = Line(
            table_group.get_left() + LEFT * 0.1,
            table_group.get_right() + RIGHT * 0.1,
            color=GRAY, stroke_width=1.5
        ).next_to(header, DOWN, buff=0.18)

        self.play(FadeIn(header), Create(sep_line))
        self.wait(0.5)
        self.play(FadeIn(row1))
        self.wait(0.8)
        self.play(FadeIn(row2))
        self.wait(1.0)

        # 符号法则说明
        sign_rules_title = Text("符号法则（实正虚负）", font=CJK, color=CYAN).scale(0.48)
        sign_rules_title.next_to(table_group, DOWN, buff=0.45)
        rules = VGroup(
            VGroup(Text("u：物距，实物", font=CJK).scale(0.42),
                   MathTex(r"u > 0").scale(0.55).set_color(RED)).arrange(RIGHT, buff=0.3),
            VGroup(Text("v：像距，实像", font=CJK).scale(0.42),
                   MathTex(r"v > 0").scale(0.55).set_color(GREEN)).arrange(RIGHT, buff=0.3),
            VGroup(Text("r：圆心在折射光同侧为正", font=CJK).scale(0.42),
                   MathTex(r"r > 0 \text{ (convex)}").scale(0.55).set_color(YELLOW)).arrange(RIGHT, buff=0.3),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        rules.next_to(sign_rules_title, DOWN, buff=0.28)

        self.play(FadeIn(sign_rules_title))
        for rule in rules:
            self.play(FadeIn(rule), run_time=0.6)
            self.wait(0.5)
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            sign_title, table_group, sep_line, sign_rules_title, rules
        )))

        # ── Step 9: 数值例子 ────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_title))

        ex_cond = VGroup(
            Text("玻璃球（n2 = 1.5）左半面，r = 5 cm，n1 = 1.0（空气）", font=CJK).scale(0.45),
            Text("物距 u = 30 cm，求像距 v", font=CJK, color=CYAN).scale(0.45)
        ).arrange(DOWN, buff=0.2).next_to(ex_title, DOWN, buff=0.45)

        ex_calc1 = MathTex(
            r"\frac{n_1}{u} + \frac{n_2}{v} = \frac{n_2-n_1}{r}"
        ).scale(0.85).set_color(YELLOW)
        ex_calc2 = MathTex(
            r"\frac{1.0}{30} + \frac{1.5}{v} = \frac{0.5}{5} = 0.1"
        ).scale(0.85)
        ex_calc3 = MathTex(
            r"\frac{1.5}{v} = 0.1 - \frac{1}{30} = \frac{3-1}{30} = \frac{2}{30}"
        ).scale(0.78)
        ex_calc4 = MathTex(
            r"v = 1.5 \times \frac{30}{2} = 22.5 \ \mathrm{cm}",
            color=GREEN
        ).scale(0.88)

        calc_group = VGroup(ex_calc1, ex_calc2, ex_calc3, ex_calc4).arrange(DOWN, buff=0.32)
        calc_group.next_to(ex_cond, DOWN, buff=0.4)
        calc_group.scale_to_fit_width(11.0)

        self.play(FadeIn(ex_cond))
        self.wait(0.7)
        for step in calc_group:
            self.play(Write(step), run_time=0.9)
            self.wait(0.7)
        box_ans = SurroundingRectangle(ex_calc4, color=GREEN, buff=0.2, corner_radius=0.1)
        self.play(Create(box_ans))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_title, ex_cond, calc_group, box_ans)))

        # ── Step 10: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"\frac{n_1}{u} + \frac{n_2}{v} = \frac{n_2 - n_1}{r}",
            color=YELLOW
        ).scale(0.88)
        s2_label = Text("焦距：", font=CJK).scale(0.45)
        s2 = MathTex(
            r"f_1 = \frac{n_1 r}{n_2-n_1},\quad f_2 = \frac{n_2 r}{n_2-n_1}",
            color=CYAN
        ).scale(0.75)
        s3 = MathTex(
            r"\frac{f_1}{u} + \frac{f_2}{v} = 1",
            color=GREEN
        ).scale(0.88)
        s4 = Text("符号法则：实正虚负；r 按圆心与折射光同侧为正",
                  font=CJK, color=ORANGE).scale(0.42)

        focal_row = VGroup(s2_label, s2).arrange(RIGHT, buff=0.2)

        summary_content = VGroup(s1, focal_row, s3, s4).arrange(DOWN, buff=0.38)
        summary_content.next_to(s_title, DOWN, buff=0.45)
        summary_content.scale_to_fit_width(12.0)

        box_summary = SurroundingRectangle(summary_content, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(FadeIn(focal_row))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4), Create(box_summary))
        self.wait(2.2)

        # 参考公式淡出
        self.play(FadeOut(d3_ref))
        self.play(FadeOut(VGroup(s_title, summary_content, box_summary, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp1SphericalSurfaceRefraction",
        "id": "phys-ch10-10.1-kp1-spherical-surface-refraction",
        "chapterId": "ch10",
        "sectionId": "10.1",
        "title": "单球面折射成像公式",
        "description": "光路图演示近轴光线在单球面折射，ValueTracker 拖动物距实时更新像点，逐步推导 n1/u+n2/v=(n2-n1)/r 及焦点公式。",
    },
]
