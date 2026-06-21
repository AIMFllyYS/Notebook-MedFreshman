"""第 3.3 节 · 例题：三种阻尼状态的判断与对比

并排展示欠阻尼、临界阻尼、过阻尼三条 x-t 曲线，
配以生活类比（弹簧小球 / 汽车过减速带 / 液压门铰），
用虚线标注首次越过平衡位置的时刻，最后汇总判据表格。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 阻尼曲线数学函数 ─────────────────────────────────────────────────────────

def x_underdamp(t, beta=0.2, omega0=1.0, A=1.0):
    """欠阻尼：x = A * e^(-β t) * cos(ω' t)，φ=0"""
    omega_p = math.sqrt(omega0**2 - beta**2)
    return A * math.exp(-beta * t) * math.cos(omega_p * t)

def x_critical(t, beta=1.0, A=1.0):
    """临界阻尼：x = A*(1 + β t)*e^(-β t)"""
    return A * (1.0 + beta * t) * math.exp(-beta * t)

def x_overdamp(t, beta=3.0, omega0=1.0, A=1.0):
    """过阻尼：x = A * ( (s2*e^(s1 t) - s1*e^(s2 t)) / (s2 - s1) )
       其中 s1,s2 = -β ± sqrt(β²-ω₀²)
    """
    disc = math.sqrt(beta**2 - omega0**2)
    s1 = -beta + disc
    s2 = -beta - disc
    # x(0)=A, x'(0)=0  =>  C1*s1 + C2*s2 = 0, C1+C2=A
    # C1 = -A*s2/(s1-s2), C2 = A*s1/(s1-s2)
    C1 = -A * s2 / (s1 - s2)
    C2 =  A * s1 / (s1 - s2)
    return C1 * math.exp(s1 * t) + C2 * math.exp(s2 * t)


REGISTER = [
    {
        "scene": "Ch03Ex1ThreeDampingComparison",
        "id": "phys-ch03-3.3-ex1-three-damping-comparison",
        "chapterId": "ch03",
        "sectionId": "3.3",
        "title": "三种阻尼状态的判断与对比",
        "description": "并排绘制欠阻尼/临界/过阻尼 x-t 曲线，配生活类比与判据表格，帮助零基础读者直观理解三种阻尼状态的差异与应用。",
    }
]


class Ch03Ex1ThreeDampingComparison(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("三种阻尼状态的判断与对比", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第三章 振动 · 3.3 阻尼振动", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("弹簧门推开后，门怎么回来？", font=CJK, color=WHITE).scale(0.48)
        ana2 = Text("太轻的铰链：来回晃很久（欠阻尼）", font=CJK, color=YELLOW).scale(0.44)
        ana3 = Text("好的液压门铰：缓慢归位，不晃动（过阻尼）", font=CJK, color=ORANGE).scale(0.44)
        ana4 = Text("最佳设计：最快归位且不超调（临界阻尼）", font=CJK, color=GREEN).scale(0.44)
        ana_group = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55)
        ana_group.scale_to_fit_width(12)
        for item in ana_group:
            self.play(FadeIn(item))
            self.wait(0.7)
        self.wait(0.8)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 核心公式
        # ══════════════════════════════════════════════════════════════════════
        eq_label = Text("阻尼振动方程的通解（欠阻尼）：", font=CJK, color=CYAN).scale(0.44)
        eq_label.next_to(title, DOWN, buff=0.5)
        eq1 = MathTex(
            r"x(t) = A_0 e^{-\beta t} \cos(\omega' t + \varphi)",
            color=YELLOW,
        ).scale(0.78)
        eq1.next_to(eq_label, DOWN, buff=0.3)
        omega_def = MathTex(r"\omega' = \sqrt{\omega_0^2 - \beta^2}", color=GREEN).scale(0.72)
        omega_def.next_to(eq1, DOWN, buff=0.28)

        criteria_label = Text("阻尼判据：", font=CJK, color=CYAN).scale(0.44)
        criteria_label.next_to(omega_def, DOWN, buff=0.35)
        c1 = VGroup(
            MathTex(r"\beta < \omega_0", color=YELLOW).scale(0.62),
            Text("欠阻尼（振荡衰减）", font=CJK, color=YELLOW).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        c2 = VGroup(
            MathTex(r"\beta = \omega_0", color=GREEN).scale(0.62),
            Text("临界阻尼（最快归位）", font=CJK, color=GREEN).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        c3 = VGroup(
            MathTex(r"\beta > \omega_0", color=ORANGE).scale(0.62),
            Text("过阻尼（缓慢归位）", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.3)
        criteria = VGroup(c1, c2, c3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        criteria.next_to(criteria_label, DOWN, buff=0.22)
        criteria.scale_to_fit_width(9)

        self.play(FadeIn(eq_label), Write(eq1))
        self.wait(0.6)
        self.play(Write(omega_def))
        self.wait(0.8)
        self.play(FadeIn(criteria_label))
        for ci in criteria:
            self.play(FadeIn(ci))
            self.wait(0.5)
        self.wait(1.0)
        self.play(FadeOut(VGroup(eq_label, eq1, omega_def, criteria_label, criteria)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 三幅并排 x-t 曲线
        # ══════════════════════════════════════════════════════════════════════
        T_MAX = 12.0
        N_PTS = 300

        def make_axes(label_color):
            ax = Axes(
                x_range=[0, T_MAX, 3],
                y_range=[-0.5, 1.2, 0.5],
                x_length=3.5,
                y_length=2.2,
                axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
                x_axis_config={"include_numbers": False},
                y_axis_config={"include_numbers": False},
            )
            return ax

        # 创建三个坐标系
        ax_u = make_axes(YELLOW)
        ax_c = make_axes(GREEN)
        ax_o = make_axes(ORANGE)
        axes_group = VGroup(ax_u, ax_c, ax_o).arrange(RIGHT, buff=0.55)
        axes_group.next_to(title, DOWN, buff=0.55)
        axes_group.scale_to_fit_width(12.5)

        # 坐标轴标签（纯 ASCII LaTeX）
        xl_u = MathTex(r"t", color=BLUE).scale(0.5).next_to(ax_u.x_axis.get_end(), DOWN, buff=0.1)
        xl_c = MathTex(r"t", color=BLUE).scale(0.5).next_to(ax_c.x_axis.get_end(), DOWN, buff=0.1)
        xl_o = MathTex(r"t", color=BLUE).scale(0.5).next_to(ax_o.x_axis.get_end(), DOWN, buff=0.1)
        yl_u = MathTex(r"x", color=BLUE).scale(0.5).next_to(ax_u.y_axis.get_end(), LEFT, buff=0.1)
        yl_c = MathTex(r"x", color=BLUE).scale(0.5).next_to(ax_c.y_axis.get_end(), LEFT, buff=0.1)
        yl_o = MathTex(r"x", color=BLUE).scale(0.5).next_to(ax_o.y_axis.get_end(), LEFT, buff=0.1)

        # 绘制曲线
        t_vals = np.linspace(0, T_MAX, N_PTS)

        def plot_curve(ax, func, color):
            points = [ax.c2p(t, max(-0.49, min(1.19, func(t)))) for t in t_vals]
            return VMobject(color=color, stroke_width=2.5).set_points_as_corners(points)

        curve_u = plot_curve(ax_u, lambda t: x_underdamp(t, beta=0.2, omega0=1.0), YELLOW)
        curve_c = plot_curve(ax_c, lambda t: x_critical(t, beta=1.0), GREEN)
        curve_o = plot_curve(ax_o, lambda t: x_overdamp(t, beta=3.0, omega0=1.0), ORANGE)

        # 零线
        zero_u = ax_u.plot(lambda t: 0, x_range=[0, T_MAX], color=CYAN, stroke_width=1)
        zero_c = ax_c.plot(lambda t: 0, x_range=[0, T_MAX], color=CYAN, stroke_width=1)
        zero_o = ax_o.plot(lambda t: 0, x_range=[0, T_MAX], color=CYAN, stroke_width=1)

        # 子标题（中文 Text）
        lbl_u = Text("欠阻尼", font=CJK, color=YELLOW).scale(0.42)
        lbl_c = Text("临界阻尼", font=CJK, color=GREEN).scale(0.42)
        lbl_o = Text("过阻尼", font=CJK, color=ORANGE).scale(0.42)
        lbl_u.next_to(ax_u, DOWN, buff=0.18)
        lbl_c.next_to(ax_c, DOWN, buff=0.18)
        lbl_o.next_to(ax_o, DOWN, buff=0.18)

        # β 注释（纯 ASCII MathTex）
        param_u = MathTex(r"\beta = 0.2\,\omega_0", color=YELLOW).scale(0.38)
        param_c = MathTex(r"\beta = \omega_0", color=GREEN).scale(0.38)
        param_o = MathTex(r"\beta = 3\,\omega_0", color=ORANGE).scale(0.38)
        param_u.next_to(lbl_u, DOWN, buff=0.1)
        param_c.next_to(lbl_c, DOWN, buff=0.1)
        param_o.next_to(lbl_o, DOWN, buff=0.1)

        self.play(Create(ax_u), Create(ax_c), Create(ax_o),
                  FadeIn(xl_u), FadeIn(xl_c), FadeIn(xl_o),
                  FadeIn(yl_u), FadeIn(yl_c), FadeIn(yl_o))
        self.play(Create(zero_u), Create(zero_c), Create(zero_o))
        self.play(
            Create(curve_u), Create(curve_c), Create(curve_o),
            FadeIn(lbl_u), FadeIn(lbl_c), FadeIn(lbl_o),
            FadeIn(param_u), FadeIn(param_c), FadeIn(param_o),
        )
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 标注"首次越过平衡位置"时刻
        # ══════════════════════════════════════════════════════════════════════
        cap_step = Text("竖线：首次经过平衡位置 x=0 的时刻", font=CJK, color=WHITE).scale(0.4)
        cap_step.next_to(param_u, DOWN, buff=0.55)
        cap_step.set_x(0)  # 水平居中
        self.play(FadeIn(cap_step))

        # 欠阻尼：ω't1 = π/2  => t1 = π/(2ω')
        omega_p_u = math.sqrt(1.0**2 - 0.2**2)
        t1_u = (math.pi / 2) / omega_p_u   # ≈ 1.60

        # 临界阻尼：(1+t)*e^(-t) 对0求导无实零点（单调），永不越过0；
        # 标注 t=5 处（已很接近0但不穿越）——改为标"无穿越"文字
        # 过阻尼：同样不穿越，标注同理
        # 欠阻尼有穿越，用 DashedLine 标注
        t1_u_clamped = min(t1_u, T_MAX - 0.01)
        dash_u = DashedLine(
            ax_u.c2p(t1_u_clamped, -0.5),
            ax_u.c2p(t1_u_clamped, 1.2),
            color=RED, stroke_width=2,
        )
        dot_u = Dot(ax_u.c2p(t1_u_clamped, 0), color=RED, radius=0.07)
        t1_lbl_u = MathTex(r"t_1", color=RED).scale(0.45)
        t1_lbl_u.next_to(ax_u.c2p(t1_u_clamped, -0.5), DOWN, buff=0.08)

        no_cross_c = Text("不穿越 x=0", font=CJK, color=GREEN).scale(0.36)
        no_cross_c.move_to(ax_c.c2p(6, 0.55))
        no_cross_o = Text("不穿越 x=0", font=CJK, color=ORANGE).scale(0.36)
        no_cross_o.move_to(ax_o.c2p(6, 0.55))

        self.play(Create(dash_u), FadeIn(dot_u), FadeIn(t1_lbl_u))
        self.play(FadeIn(no_cross_c), FadeIn(no_cross_o))
        self.wait(1.8)

        # 清理曲线区域但保留图
        self.play(FadeOut(cap_step))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: 生活类比卡通示意（用几何形状简化表达）
        # ══════════════════════════════════════════════════════════════════════
        # 在三个坐标系正上方（title 和坐标系之间空间有限），
        # 改在坐标系下方 param 下方放简短类比图标文字
        icon_u = Text("弹簧振子来回晃", font=CJK, color=YELLOW).scale(0.36)
        icon_c = Text("汽车过减速带仅弹一次", font=CJK, color=GREEN).scale(0.36)
        icon_o = Text("液压门铰缓慢关门", font=CJK, color=ORANGE).scale(0.36)
        icon_u.next_to(param_u, DOWN, buff=0.22)
        icon_c.next_to(param_c, DOWN, buff=0.22)
        icon_o.next_to(param_o, DOWN, buff=0.22)

        # 用简单几何画弹簧（欠阻尼）：锯齿线段
        spring_pts = []
        n_coils = 6
        for i in range(n_coils * 4 + 1):
            frac = i / (n_coils * 4)
            sx = ax_u.get_left()[0] + 0.3 + frac * 0.0  # 垂直弹簧
            sy_base = icon_u.get_bottom()[1] - 0.12
            direction = 1 if (i % 4 in [1, 2]) else -1
            spring_pts.append([
                ax_u.get_center()[0] + direction * 0.15,
                sy_base - frac * 0.6,
                0
            ])
        spring_line = VMobject(color=YELLOW, stroke_width=2)
        spring_line.set_points_as_corners(spring_pts)
        ball = Circle(radius=0.11, color=YELLOW, fill_opacity=0.8)
        ball.move_to([ax_u.get_center()[0], spring_pts[-1][1] - 0.15, 0])

        # 汽车减速带（临界）：矩形车 + 半圆减速带
        car_body = Rectangle(width=0.55, height=0.22, color=GREEN, fill_opacity=0.6)
        car_body.move_to([ax_c.get_center()[0], icon_c.get_bottom()[1] - 0.3, 0])
        bump = Arc(radius=0.12, start_angle=0, angle=PI, color=YELLOW, stroke_width=2)
        bump.move_to([ax_c.get_center()[0], icon_c.get_bottom()[1] - 0.48, 0])

        # 液压门铰（过阻尼）：矩形门 + 小矩形铰链
        door = Rectangle(width=0.2, height=0.55, color=ORANGE, fill_opacity=0.6)
        door.move_to([ax_o.get_center()[0] - 0.18, icon_o.get_bottom()[1] - 0.42, 0])
        hinge = Rectangle(width=0.1, height=0.12, color=GRAY, fill_opacity=0.9)
        hinge.next_to(door, RIGHT, buff=0)

        self.play(
            FadeIn(icon_u), FadeIn(icon_c), FadeIn(icon_o),
            Create(spring_line), FadeIn(ball),
            FadeIn(car_body), FadeIn(bump),
            FadeIn(door), FadeIn(hinge),
        )
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: 淡出所有曲线图区域，进入总结表格
        # ══════════════════════════════════════════════════════════════════════
        curves_all = VGroup(
            ax_u, ax_c, ax_o,
            xl_u, xl_c, xl_o, yl_u, yl_c, yl_o,
            zero_u, zero_c, zero_o,
            curve_u, curve_c, curve_o,
            lbl_u, lbl_c, lbl_o,
            param_u, param_c, param_o,
            dash_u, dot_u, t1_lbl_u,
            no_cross_c, no_cross_o,
            icon_u, icon_c, icon_o,
            spring_line, ball, car_body, bump, door, hinge,
        )
        self.play(FadeOut(curves_all))
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 判据对比总结表格（用 VGroup + Line 手动构建）
        # ══════════════════════════════════════════════════════════════════════
        tbl_title = Text("三种阻尼状态总结", font=CJK, color=BLUE).scale(0.52)
        tbl_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tbl_title))

        # 表格数据：行 = [判据, 位移行为, 典型应用]
        headers = ["判据", "位移行为", "典型应用"]
        rows = [
            ("欠阻尼",   r"\beta < \omega_0",   "振荡衰减",       "钟摆、乐器"),
            ("临界阻尼", r"\beta = \omega_0",   "最快单调归位",   "汽车减震"),
            ("过阻尼",   r"\beta > \omega_0",   "缓慢单调归位",   "液压门铰"),
        ]
        row_colors = [YELLOW, GREEN, ORANGE]

        col_widths = [2.0, 2.2, 2.8, 2.5]
        row_height = 0.62
        n_cols = 4
        n_rows = len(rows) + 1  # +1 for header

        # 表格左上角
        tbl_x0 = -4.2
        tbl_y0 = tbl_title.get_bottom()[1] - 0.45

        def cell_center(r, c):
            x = tbl_x0 + sum(col_widths[:c]) + col_widths[c] / 2
            y = tbl_y0 - r * row_height - row_height / 2
            return np.array([x, y, 0])

        # 绘制表格背景格线
        lines = VGroup()
        tbl_w = sum(col_widths)
        tbl_h = n_rows * row_height
        # 外框
        lines.add(Rectangle(width=tbl_w, height=tbl_h, color=BLUE, stroke_width=1.5)
                  .move_to([tbl_x0 + tbl_w / 2, tbl_y0 - tbl_h / 2, 0]))
        # 水平线
        for r in range(1, n_rows):
            y = tbl_y0 - r * row_height
            lines.add(Line([tbl_x0, y, 0], [tbl_x0 + tbl_w, y, 0], color=BLUE, stroke_width=0.8))
        # 垂直线
        cx = tbl_x0
        for c in range(1, n_cols):
            cx += col_widths[c - 1]
            lines.add(Line([cx, tbl_y0, 0], [cx, tbl_y0 - tbl_h, 0], color=BLUE, stroke_width=0.8))

        self.play(Create(lines))

        # 表头
        header_objs = VGroup()
        header_texts = ["类型", "判据", "位移行为", "典型应用"]
        for ci, ht in enumerate(header_texts):
            obj = Text(ht, font=CJK, color=CYAN).scale(0.4)
            obj.move_to(cell_center(0, ci))
            header_objs.add(obj)
        self.play(FadeIn(header_objs))

        # 数据行
        row_objs = VGroup()
        for ri, (name, crit, behav, app) in enumerate(rows):
            color = row_colors[ri]
            r = ri + 1

            name_obj = Text(name, font=CJK, color=color).scale(0.38)
            name_obj.move_to(cell_center(r, 0))

            crit_obj = MathTex(crit, color=color).scale(0.52)
            crit_obj.move_to(cell_center(r, 1))

            behav_obj = Text(behav, font=CJK, color=WHITE).scale(0.36)
            behav_obj.move_to(cell_center(r, 2))

            app_obj = Text(app, font=CJK, color=WHITE).scale(0.34)
            app_obj.move_to(cell_center(r, 3))

            row_group = VGroup(name_obj, crit_obj, behav_obj, app_obj)
            row_objs.add(row_group)
            self.play(FadeIn(row_group))
            self.wait(0.6)

        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 关键公式小结卡
        # ══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(lines, header_objs, row_objs, tbl_title)))

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(
            r"x(t) = A_0 e^{-\beta t}\cos(\omega' t + \varphi)",
            color=YELLOW,
        ).scale(0.72)
        s2 = MathTex(r"\omega' = \sqrt{\omega_0^2 - \beta^2}", color=GREEN).scale(0.68)

        key1 = VGroup(
            MathTex(r"\beta < \omega_0", color=YELLOW).scale(0.6),
            Text("振荡衰减（欠阻尼）", font=CJK, color=YELLOW).scale(0.4),
        ).arrange(RIGHT, buff=0.35)
        key2 = VGroup(
            MathTex(r"\beta = \omega_0", color=GREEN).scale(0.6),
            Text("最快归位（临界）", font=CJK, color=GREEN).scale(0.4),
        ).arrange(RIGHT, buff=0.35)
        key3 = VGroup(
            MathTex(r"\beta > \omega_0", color=ORANGE).scale(0.6),
            Text("缓慢归位（过阻尼）", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.35)

        summary = VGroup(s1, s2, key1, key2, key3).arrange(DOWN, buff=0.35)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(10.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(key1), FadeIn(key2), FadeIn(key3))
        self.play(Create(box))
        self.wait(2.5)

        # 最终淡出
        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)
