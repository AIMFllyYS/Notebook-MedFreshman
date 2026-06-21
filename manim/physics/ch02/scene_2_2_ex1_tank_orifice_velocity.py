"""第 2.2 节 · 例题：容器小孔流速（托里拆利定理）

可视化方案：
  第一幕 — 绘制竖直圆柱容器，标注 A(液面)、B(小孔)，逐步推导伯努利方程→托里拆利公式
  第二幕 — ValueTracker 控制液面高度 h 从 H0 降至 0，小孔流速箭头实时缩短，同步绘制 v(h) 曲线
  第三幕 — 叠加抛物线喷射轨迹，展示不同 h 时水平射程变化
  结尾   — 小结卡，框出核心公式

铁律：MathTex 内只有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ──────────────────────────────────────────────────────────────
G = 9.8          # 重力加速度
H0 = 2.5         # 容器初始液面高度（相对单位）
H_ORIFICE = 0.4  # 小孔距容器底部的高度（相对单位）


def v_orifice(h):
    """小孔流速 v = sqrt(2gh)，h 为液面到小孔的深度"""
    return math.sqrt(2 * G * max(h, 0.0))


class Ch02Ex1TankOrificeVelocity(Scene):
    def construct(self):

        # ════════════════════════════════════════════════════════════════════
        # Step 1: 标题 + 副标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("容器小孔流速（托里拆利定理）", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.2 伯努利方程应用", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ════════════════════════════════════════════════════════════════════
        ana1 = Text("水桶侧壁扎一个小孔——", font=CJK).scale(0.48)
        ana2 = Text("水会从小孔喷出，孔越深，水喷得越远。", font=CJK).scale(0.48)
        ana3 = Text("这个速度到底有多大？伯努利方程给出精确答案。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3: 绘制容器示意图（第一幕）
        # ════════════════════════════════════════════════════════════════════
        # 容器几何参数（屏幕坐标）
        tank_left   = -5.0
        tank_right  = -2.2
        tank_bottom = -2.8
        tank_top    =  1.6   # 固定容器顶部（液面初始位置）
        tank_w = tank_right - tank_left
        tank_h = tank_top - tank_bottom

        # 容器壁（左、右、底三条线）
        wall_left   = Line([tank_left, tank_bottom, 0],  [tank_left,  tank_top,    0], color=WHITE, stroke_width=3)
        wall_right  = Line([tank_right, tank_bottom, 0], [tank_right, tank_top,    0], color=WHITE, stroke_width=3)
        wall_bottom = Line([tank_left, tank_bottom, 0],  [tank_right, tank_bottom, 0], color=WHITE, stroke_width=3)
        container = VGroup(wall_left, wall_right, wall_bottom)

        # 液面（蓝色横线）
        water_surface_y = tank_top
        surface_line = Line([tank_left, water_surface_y, 0],
                            [tank_right, water_surface_y, 0], color=BLUE, stroke_width=3)

        # 水体（矩形填充）
        water_rect = Rectangle(
            width=tank_w, height=tank_h,
            color=BLUE, fill_opacity=0.35, stroke_width=0
        ).move_to([(tank_left + tank_right) / 2, (tank_bottom + tank_top) / 2, 0])

        # 小孔 B 位置（右壁，距底 0.6 单位）
        hole_y = tank_bottom + 0.6
        hole_dot = Dot([tank_right, hole_y, 0], radius=0.10, color=ORANGE)

        self.play(Create(container), FadeIn(water_rect), Create(surface_line))
        self.play(FadeIn(hole_dot))
        self.wait(0.5)

        # 标注 A 点（液面）
        label_A = Text("A", font=CJK, color=YELLOW).scale(0.45)
        label_A.next_to([tank_left + 0.15, water_surface_y, 0], LEFT, buff=0.12)
        arrow_A = Arrow(
            label_A.get_right() + RIGHT * 0.05,
            [tank_left + 0.05, water_surface_y, 0],
            buff=0.05, color=YELLOW, stroke_width=2, max_tip_length_to_length_ratio=0.25
        )

        # 标注 B 点（小孔）
        label_B = Text("B", font=CJK, color=ORANGE).scale(0.45)
        label_B.next_to([tank_right, hole_y, 0], RIGHT, buff=0.18)
        arrow_B = Arrow(
            label_B.get_left() - RIGHT * 0.05,
            [tank_right + 0.05, hole_y, 0],
            buff=0.05, color=ORANGE, stroke_width=2, max_tip_length_to_length_ratio=0.25
        )

        self.play(FadeIn(label_A), GrowArrow(arrow_A))
        self.play(FadeIn(label_B), GrowArrow(arrow_B))
        self.wait(0.8)

        # 深度标注 h（液面到小孔的竖直距离）
        h_depth = water_surface_y - hole_y
        brace_h = BraceBetweenPoints(
            [tank_left - 0.15, hole_y, 0],
            [tank_left - 0.15, water_surface_y, 0],
            direction=LEFT
        )
        label_h = MathTex(r"h").scale(0.7).set_color(CYAN)
        label_h.next_to(brace_h, LEFT, buff=0.12)
        self.play(Create(brace_h), Write(label_h))
        self.wait(0.8)

        # ════════════════════════════════════════════════════════════════════
        # Step 4: 逐步推导伯努利方程 → 托里拆利公式（第一幕右侧）
        # ════════════════════════════════════════════════════════════════════
        deriv_x = 0.5   # 推导区域左边界 x
        deriv_top_y = 1.8

        cond_title = Text("伯努利方程（A→B 两点）", font=CJK, color=BLUE).scale(0.42)
        cond_title.move_to([deriv_x + 2.5, deriv_top_y, 0])
        self.play(FadeIn(cond_title))

        # 条件说明
        cond1 = VGroup(
            Text("已知条件：", font=CJK, color=WHITE).scale(0.38),
        )
        cond1.next_to(cond_title, DOWN, buff=0.3).align_to(cond_title, LEFT)

        eq_pa = VGroup(
            Text("  A、B 两点大气压相等：", font=CJK).scale(0.36),
            MathTex(r"p_A = p_B = p_0").scale(0.6).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.1)

        eq_va = VGroup(
            Text("  截面积 ", font=CJK).scale(0.36),
            MathTex(r"S_A \gg S_B").scale(0.6).set_color(YELLOW),
            Text(" 故 ", font=CJK).scale(0.36),
            MathTex(r"v_A \approx 0").scale(0.6).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.08)

        conds = VGroup(eq_pa, eq_va).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.28).align_to(cond_title, LEFT)
        self.play(FadeIn(conds))
        self.wait(1.0)

        # 伯努利方程展开
        step1 = MathTex(
            r"p_A + \frac{1}{2}\rho v_A^2 + \rho g z_A",
            r"=",
            r"p_B + \frac{1}{2}\rho v_B^2 + \rho g z_B"
        ).scale(0.58)
        step1.next_to(conds, DOWN, buff=0.32).align_to(conds, LEFT)
        step1[0].set_color(BLUE)
        step1[2].set_color(ORANGE)
        self.play(Write(step1))
        self.wait(1.0)

        # 代入条件（p 相消，vA=0，zA-zB=h）
        step2 = MathTex(
            r"\rho g h",
            r"=",
            r"\frac{1}{2}\rho v_B^2"
        ).scale(0.72)
        step2.next_to(step1, DOWN, buff=0.3).align_to(step1, LEFT)
        step2[0].set_color(CYAN)
        step2[2].set_color(ORANGE)

        simp_hint = Text("（p 相消，vA=0，zA−zB=h）", font=CJK, color=WHITE).scale(0.33)
        simp_hint.next_to(step2, RIGHT, buff=0.18)

        self.play(Write(step2), FadeIn(simp_hint))
        self.wait(1.0)

        # 最终公式 vB = sqrt(2gh)
        step3 = MathTex(r"v_B = \sqrt{2gh}").scale(0.92).set_color(GREEN)
        step3.next_to(step2, DOWN, buff=0.35).align_to(step2, LEFT)
        box3 = SurroundingRectangle(step3, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Write(step3))
        self.play(Create(box3))
        self.wait(1.8)

        # 清除左侧容器示意图和推导内容，准备第二幕
        self.play(
            FadeOut(VGroup(
                container, water_rect, surface_line, hole_dot,
                label_A, arrow_A, label_B, arrow_B,
                brace_h, label_h,
                cond_title, conds, step1, step2, simp_hint, step3, box3
            ))
        )
        self.wait(0.4)

        # ════════════════════════════════════════════════════════════════════
        # Step 5: 第二幕 — ValueTracker 动态演示液面下降 + v(h) 曲线
        # ════════════════════════════════════════════════════════════════════
        sec2_title = Text("液面下降，流速如何变化？", font=CJK, color=BLUE).scale(0.48)
        sec2_title.next_to(title, DOWN, buff=0.32)
        self.play(FadeIn(sec2_title))
        self.wait(0.6)

        # ── 左侧：动态容器 ────────────────────────────────────────────────
        # 坐标：容器在屏幕左半部
        cL, cR = -5.8, -3.0
        cBot, cTop = -2.6, 1.4
        cW = cR - cL

        # 容器壁
        w_left   = Line([cL, cBot, 0], [cL,  cTop, 0], color=WHITE, stroke_width=3)
        w_right  = Line([cR, cBot, 0], [cR,  cTop, 0], color=WHITE, stroke_width=3)
        w_bottom = Line([cL, cBot, 0], [cR,  cBot, 0], color=WHITE, stroke_width=3)
        dyn_container = VGroup(w_left, w_right, w_bottom)

        # 小孔 B 在右壁距底 0.5 单位处
        h_orifice_y = cBot + 0.5          # 小孔实际 y 坐标（固定）
        h_max       = cTop - h_orifice_y  # h 的最大值（液面=容器顶时）

        h_tracker = ValueTracker(h_max)   # h = 液面到小孔的深度

        # 动态液面 y 坐标
        def surface_y():
            return h_orifice_y + h_tracker.get_value()

        # 动态水体
        dyn_water = always_redraw(lambda: Rectangle(
            width=cW,
            height=max(surface_y() - cBot, 0.01),
            color=BLUE,
            fill_opacity=0.4,
            stroke_width=0,
        ).align_to([cL, cBot, 0], DL))

        # 动态液面线
        dyn_surface = always_redraw(lambda: Line(
            [cL, surface_y(), 0], [cR, surface_y(), 0],
            color=BLUE, stroke_width=3
        ))

        # 小孔点（固定）
        dyn_hole = Dot([cR, h_orifice_y, 0], radius=0.10, color=ORANGE)

        # 流速箭头（always_redraw，随 h 缩短）
        MAX_ARROW_LEN = 1.8
        def velocity_arrow():
            h = h_tracker.get_value()
            v = math.sqrt(2 * G * max(h, 0.0))
            v_max = math.sqrt(2 * G * h_max)
            length = MAX_ARROW_LEN * (v / v_max) if v_max > 0 else 0.0
            length = max(length, 0.0)
            start = [cR, h_orifice_y, 0]
            end   = [cR + length, h_orifice_y, 0]
            if length < 0.05:
                return Line(start, start, color=RED)
            return Arrow(start, end, buff=0, color=RED, stroke_width=4,
                         max_tip_length_to_length_ratio=0.25)

        dyn_arrow = always_redraw(velocity_arrow)

        # h 标注（深度大括号）
        def h_brace_group():
            sy = surface_y()
            oy = h_orifice_y
            if sy - oy < 0.1:
                return VGroup()
            br = BraceBetweenPoints([cL - 0.1, oy, 0], [cL - 0.1, sy, 0], direction=LEFT)
            lbl = MathTex(r"h").scale(0.55).set_color(CYAN)
            lbl.next_to(br, LEFT, buff=0.08)
            return VGroup(br, lbl)

        dyn_h_brace = always_redraw(h_brace_group)

        # v 数值标注（右侧箭头上方）
        def v_label():
            h = h_tracker.get_value()
            v = math.sqrt(2 * G * max(h, 0.0))
            txt = Text(f"v = {v:.2f} m/s", font=CJK, color=RED).scale(0.36)
            txt.next_to([cR + 0.2, h_orifice_y, 0], UP, buff=0.12)
            return txt

        dyn_v_label = always_redraw(v_label)

        self.play(
            Create(dyn_container),
            FadeIn(dyn_water),
            Create(dyn_surface),
            FadeIn(dyn_hole),
            GrowArrow(dyn_arrow),
            FadeIn(dyn_h_brace),
            FadeIn(dyn_v_label),
        )
        self.wait(0.8)

        # ── 右侧：v(h) 坐标图（sqrt 曲线）────────────────────────────────
        graph_ax = Axes(
            x_range=[0, h_max * 1.1, h_max / 4],
            y_range=[0, math.sqrt(2 * G * h_max) * 1.15, 2],
            x_length=4.8,
            y_length=3.4,
            axis_config={"color": WHITE, "include_tip": True, "stroke_width": 2},
        ).shift(RIGHT * 2.0 + DOWN * 0.4)

        x_lbl_ax = VGroup(
            Text("h", font=CJK).scale(0.4),
            MathTex(r"(\mathrm{m})").scale(0.4),
        ).arrange(RIGHT, buff=0.06).next_to(graph_ax.x_axis.get_end(), DOWN, buff=0.12)

        y_lbl_ax = VGroup(
            Text("v", font=CJK).scale(0.4),
            MathTex(r"(\mathrm{m/s})").scale(0.4),
        ).arrange(RIGHT, buff=0.06).next_to(graph_ax.y_axis.get_end(), LEFT, buff=0.1)

        # 静态 sqrt 曲线（全程）
        full_curve = graph_ax.plot(
            lambda h: math.sqrt(2 * G * h) if h > 0 else 0,
            x_range=[0.01, h_max * 1.0],
            color=YELLOW,
        )
        curve_label = VGroup(
            MathTex(r"v = \sqrt{2gh}").scale(0.52).set_color(YELLOW),
        )
        curve_label.next_to(full_curve.get_end(), UR, buff=0.1)

        self.play(Create(graph_ax), FadeIn(x_lbl_ax), FadeIn(y_lbl_ax))
        self.play(Create(full_curve), Write(curve_label))
        self.wait(0.5)

        # 动态点在曲线上跟踪当前 h
        def graph_dot():
            h = h_tracker.get_value()
            v = math.sqrt(2 * G * max(h, 0.0))
            return Dot(graph_ax.c2p(h, v), radius=0.09, color=RED)

        dyn_graph_dot = always_redraw(graph_dot)
        self.play(FadeIn(dyn_graph_dot))
        self.wait(0.6)

        # ── 动画：液面从 h_max 连续下降到 0 ─────────────────────────────
        self.play(h_tracker.animate.set_value(0.01), run_time=6, rate_func=linear)
        self.wait(0.8)

        # 清场第二幕
        self.play(
            FadeOut(VGroup(
                sec2_title,
                dyn_container, dyn_water, dyn_surface, dyn_hole,
                dyn_arrow, dyn_h_brace, dyn_v_label,
                graph_ax, x_lbl_ax, y_lbl_ax, full_curve, curve_label, dyn_graph_dot,
            ))
        )
        self.wait(0.4)

        # ════════════════════════════════════════════════════════════════════
        # Step 6: 第三幕 — 喷射抛物线轨迹 + 水平射程随 h 变化
        # ════════════════════════════════════════════════════════════════════
        sec3_title = Text("水平射程与液面深度的关系", font=CJK, color=BLUE).scale(0.48)
        sec3_title.next_to(title, DOWN, buff=0.32)
        self.play(FadeIn(sec3_title))

        # 容器（固定，展示多个 h 值）
        tL, tR = -5.5, -2.8
        tBot, tTop = -2.8, 1.6
        tW = tR - tL

        t_wall_l = Line([tL, tBot, 0], [tL,  tTop, 0], color=WHITE, stroke_width=2.5)
        t_wall_r = Line([tR, tBot, 0], [tR,  tTop, 0], color=WHITE, stroke_width=2.5)
        t_wall_b = Line([tL, tBot, 0], [tR,  tBot, 0], color=WHITE, stroke_width=2.5)
        traj_container = VGroup(t_wall_l, t_wall_r, t_wall_b)

        # 地面线
        ground_y = tBot - 0.1
        ground_line = Line([-6.0, ground_y, 0], [6.5, ground_y, 0], color=GRAY, stroke_width=1.5)

        self.play(Create(traj_container), Create(ground_line))
        self.wait(0.3)

        # 小孔高度（距地面）距底 0.5 单位
        orifice_y_abs = tBot + 0.5
        orifice_x = tR
        orifice_height_above_ground = orifice_y_abs - ground_y  # 小孔距地面的高度

        # 绘制三条抛物线（不同 h 值）
        h_values   = [tTop - orifice_y_abs, (tTop - orifice_y_abs) * 0.55, (tTop - orifice_y_abs) * 0.2]
        traj_colors = [GREEN, YELLOW, ORANGE]
        traj_labels_txt = ["h 大（深）", "h 中", "h 小（浅）"]

        scale_x = 0.55   # 把物理射程缩放到屏幕坐标

        traj_group = VGroup()
        label_group = VGroup()

        for hi, col, lbl_txt in zip(h_values, traj_colors, traj_labels_txt):
            v0 = math.sqrt(2 * G * max(hi, 0.01))
            # 抛物线：x(t) = v0*t, y(t) = orifice_height_above_ground - 0.5*g*t^2
            # 落地时 y=0 => t_land = sqrt(2*orifice_height_above_ground / g)
            t_land = math.sqrt(2 * orifice_height_above_ground / G)
            x_land = v0 * t_land  # 物理射程（m）

            def parabola(x_phys, v=v0, h_ab=orifice_height_above_ground):
                if v < 0.01:
                    return 0.0
                t_p = x_phys / v
                return h_ab - 0.5 * G * t_p ** 2

            x_range_phys = [0, x_land * 0.999]
            traj = graph_ax_traj_plot(
                orifice_x, ground_y, scale_x,
                parabola, x_range_phys, col
            )
            traj_group.add(traj)

            # 射程标注
            x_land_screen = orifice_x + x_land * scale_x
            range_arrow = DoubleArrow(
                [orifice_x,       ground_y - 0.25, 0],
                [x_land_screen,   ground_y - 0.25, 0],
                buff=0, color=col, stroke_width=2,
                max_tip_length_to_length_ratio=0.15
            )
            lbl = Text(lbl_txt, font=CJK, color=col).scale(0.33)
            lbl.next_to(range_arrow, DOWN, buff=0.1)
            label_group.add(VGroup(range_arrow, lbl))

        self.play(Create(traj_group[0]))
        self.play(FadeIn(label_group[0]))
        self.wait(0.5)
        self.play(Create(traj_group[1]))
        self.play(FadeIn(label_group[1]))
        self.wait(0.5)
        self.play(Create(traj_group[2]))
        self.play(FadeIn(label_group[2]))
        self.wait(1.0)

        # 射程公式推导（右侧）
        range_title = Text("射程推导", font=CJK, color=BLUE).scale(0.44)
        range_title.move_to([2.5, 1.4, 0])

        # 小孔距地高度设为 H
        r_eq1 = VGroup(
            Text("小孔距地高度为 H，", font=CJK).scale(0.36),
            Text("落地时间：", font=CJK).scale(0.36),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)

        r_eq2 = MathTex(r"t = \sqrt{\dfrac{2H}{g}}").scale(0.62).set_color(CYAN)
        r_eq3 = MathTex(r"x = v_B \cdot t = \sqrt{2gh} \cdot \sqrt{\dfrac{2H}{g}}").scale(0.58).set_color(WHITE)
        r_eq4 = MathTex(r"x = 2\sqrt{hH}").scale(0.78).set_color(GREEN)
        box_r = SurroundingRectangle(r_eq4, color=GREEN, buff=0.15, corner_radius=0.1)

        deriv_stack = VGroup(range_title, r_eq1, r_eq2, r_eq3, r_eq4).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        deriv_stack.move_to([2.6, 0.0, 0])

        self.play(FadeIn(range_title))
        self.play(FadeIn(r_eq1))
        self.wait(0.6)
        self.play(Write(r_eq2))
        self.wait(0.6)
        self.play(Write(r_eq3))
        self.wait(0.8)
        self.play(Write(r_eq4), Create(box_r))
        self.wait(1.8)

        # 清场第三幕
        self.play(
            FadeOut(VGroup(
                sec3_title,
                traj_container, ground_line,
                traj_group, label_group,
                deriv_stack, box_r,
            ))
        )
        self.wait(0.4)

        # ════════════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = VGroup(
            Text("托里拆利定理（小孔流速）：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"v_B = \sqrt{2gh}").scale(0.85).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("条件：", font=CJK, color=WHITE).scale(0.4),
            MathTex(r"S_A \gg S_B,\quad p_A = p_B = p_0").scale(0.7).set_color(CYAN),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("水平射程：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"x = 2\sqrt{hH}").scale(0.85).set_color(GREEN),
        ).arrange(RIGHT, buff=0.2)

        s4 = Text("液面越低（h 减小），流速越慢，射程越短——满足 sqrt 衰减规律。",
                  font=CJK, color=WHITE).scale(0.38)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45).scale_to_fit_width(13)

        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box_s))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, s_title, summary, box_s)))
        self.wait(0.4)


# ── 辅助函数：生成屏幕坐标系下的抛物线（避免使用 Axes 对象）──────────────────
def graph_ax_traj_plot(origin_x, ground_y, scale_x, func_phys, x_range_phys, color):
    """
    将物理抛物线 func_phys(x_phys) -> y_above_ground 映射到屏幕坐标，
    返回 ParametricFunction 对象。
    """
    x0_phys, x1_phys = x_range_phys
    num_pts = 60

    points = []
    for i in range(num_pts + 1):
        x_phys = x0_phys + (x1_phys - x0_phys) * i / num_pts
        y_phys = func_phys(x_phys)
        x_screen = origin_x + x_phys * scale_x
        y_screen = ground_y + max(y_phys, 0.0) * 0.85  # y 缩放
        points.append([x_screen, y_screen, 0])

    return VMobject(color=color, stroke_width=2.5).set_points_smoothly(points)


REGISTER = [
    {
        "scene": "Ch02Ex1TankOrificeVelocity",
        "id": "phys-ch02-2.2-ex1-tank-orifice-velocity",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "容器小孔流速（托里拆利定理）",
        "description": "以伯努利方程为基础逐步推导托里拆利公式 v=√(2gh)，并用 ValueTracker 动画展示液面下降时流速衰减与抛物线射程变化。",
    },
]
