"""第 2.2 节 · 例题3：文丘里流量计原理与流量计算。

物理动画范式：管道几何图形 + 公式逐步推导 + ValueTracker 动态演示。
铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch02Ex3VenturiFlowmeter",
        "id": "phys-ch02-2.2-ex3-venturi-flowmeter",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "文丘里流量计原理与流量计算",
        "description": "用连续性方程与伯努利方程推导文丘里流量计公式，ValueTracker 演示液面差 h 与流量 Q 的关系。",
    },
]


class Ch02Ex3VenturiFlowmeter(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("文丘里流量计原理与流量计算", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第二章 流体运动  ·  2.2  例题 3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("自来水厂怎么测水管里的流量？", font=CJK, color=WHITE).scale(0.5)
        ana2 = Text("让管道先变细、再恢复宽——细处流快、压力低，", font=CJK, color=WHITE).scale(0.46)
        ana3 = Text("只需量两处液柱高度差 h，就能算出流量 Q。", font=CJK, color=YELLOW).scale(0.46)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_group))

        # ── Step 3: 绘制文丘里管结构图 ──────────────────────────────────
        # 管道参数
        tube_y_top = 0.9          # 宽管上壁 y
        tube_y_bot = -0.9         # 宽管下壁 y
        narrow_y_top = 0.4        # 细管上壁 y
        narrow_y_bot = -0.4       # 细管下壁 y

        x_left  = -5.5            # 左端
        x_taper_l = -1.8          # 收缩起点
        x_taper_r =  0.0          # 细段起点
        x_expand_l =  1.2         # 扩张起点（细段右端）
        x_expand_r =  3.0         # 恢复宽段起点
        x_right =  5.5            # 右端

        # 管道轮廓上壁
        top_wall = VMobject(color=WHITE, stroke_width=2.5)
        top_wall.set_points_as_corners([
            [x_left, tube_y_top, 0],
            [x_taper_l, tube_y_top, 0],
            [x_taper_r, narrow_y_top, 0],
            [x_expand_l, narrow_y_top, 0],
            [x_expand_r, tube_y_top, 0],
            [x_right, tube_y_top, 0],
        ])
        # 管道轮廓下壁
        bot_wall = VMobject(color=WHITE, stroke_width=2.5)
        bot_wall.set_points_as_corners([
            [x_left, tube_y_bot, 0],
            [x_taper_l, tube_y_bot, 0],
            [x_taper_r, narrow_y_bot, 0],
            [x_expand_l, narrow_y_bot, 0],
            [x_expand_r, tube_y_bot, 0],
            [x_right, tube_y_bot, 0],
        ])
        # 左右端封口
        left_cap  = Line([x_left, tube_y_top, 0], [x_left, tube_y_bot, 0], color=WHITE, stroke_width=2)
        right_cap = Line([x_right, tube_y_top, 0], [x_right, tube_y_bot, 0], color=WHITE, stroke_width=2)

        tube_group = VGroup(top_wall, bot_wall, left_cap, right_cap)

        # 流体填充（用矩形近似，忽略斜边，只填细段和两侧宽段）
        fluid_wide_l = Rectangle(
            width=abs(x_taper_l - x_left),
            height=abs(tube_y_top - tube_y_bot),
            fill_color=BLUE, fill_opacity=0.25, stroke_width=0
        ).move_to([(x_left + x_taper_l) / 2, 0, 0])

        fluid_narrow = Rectangle(
            width=abs(x_expand_l - x_taper_r),
            height=abs(narrow_y_top - narrow_y_bot),
            fill_color=BLUE, fill_opacity=0.25, stroke_width=0
        ).move_to([(x_taper_r + x_expand_l) / 2, 0, 0])

        fluid_wide_r = Rectangle(
            width=abs(x_right - x_expand_r),
            height=abs(tube_y_top - tube_y_bot),
            fill_color=BLUE, fill_opacity=0.25, stroke_width=0
        ).move_to([(x_expand_r + x_right) / 2, 0, 0])

        fluid_group = VGroup(fluid_wide_l, fluid_narrow, fluid_wide_r)

        # 测压竖管（宽处：x=-2.8；细处：x=0.6）
        p_col_x1 = -2.8   # 宽处竖管 x
        p_col_x2 =  0.6   # 细处竖管 x
        pipe_w = 0.22      # 竖管半宽

        pres_bot  = tube_y_top             # 竖管底部接管道上壁
        liq_h1_abs = pres_bot + 2.4        # 宽处液面（绝对 y）
        liq_h2_abs = pres_bot + 1.0        # 细处液面（绝对 y）
        pres_top  = pres_bot + 3.0         # 竖管顶端

        # 竖管左右壁
        def make_pres_tube(cx):
            left_w  = Line([cx - pipe_w, pres_bot, 0], [cx - pipe_w, pres_top, 0],
                           color=WHITE, stroke_width=2)
            right_w = Line([cx + pipe_w, pres_bot, 0], [cx + pipe_w, pres_top, 0],
                           color=WHITE, stroke_width=2)
            return VGroup(left_w, right_w)

        pres_tube1 = make_pres_tube(p_col_x1)
        pres_tube2 = make_pres_tube(p_col_x2)

        # 液柱
        liq1 = Rectangle(
            width=pipe_w * 2,
            height=liq_h1_abs - pres_bot,
            fill_color=BLUE_C, fill_opacity=0.7, stroke_width=0
        ).move_to([p_col_x1, (pres_bot + liq_h1_abs) / 2, 0])

        liq2 = Rectangle(
            width=pipe_w * 2,
            height=liq_h2_abs - pres_bot,
            fill_color=BLUE_C, fill_opacity=0.7, stroke_width=0
        ).move_to([p_col_x2, (pres_bot + liq_h2_abs) / 2, 0])

        # 液面水平线
        surf1 = Line([p_col_x1 - pipe_w, liq_h1_abs, 0],
                     [p_col_x1 + pipe_w, liq_h1_abs, 0], color=CYAN, stroke_width=2.5)
        surf2 = Line([p_col_x2 - pipe_w, liq_h2_abs, 0],
                     [p_col_x2 + pipe_w, liq_h2_abs, 0], color=CYAN, stroke_width=2.5)

        # h 标注（双向箭头 + Brace）
        h_arrow = DoubleArrow(
            [p_col_x2 + pipe_w + 0.35, liq_h2_abs, 0],
            [p_col_x2 + pipe_w + 0.35, liq_h1_abs, 0],
            buff=0, color=YELLOW, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.15
        )
        h_label = MathTex(r"h", color=YELLOW).scale(0.8)
        h_label.next_to(h_arrow, RIGHT, buff=0.1)

        # 截面标注 S1、S2
        s1_label = MathTex(r"S_1", color=GREEN).scale(0.65)
        s1_label.move_to([x_left + 0.7, (tube_y_top + tube_y_bot) / 2, 0])
        s2_label = MathTex(r"S_2", color=ORANGE).scale(0.65)
        s2_label.move_to([(x_taper_r + x_expand_l) / 2, narrow_y_bot - 0.35, 0])

        # 流向箭头
        flow_arrow = Arrow(
            [x_left + 0.3, 0, 0], [x_taper_l - 0.2, 0, 0],
            buff=0, color=CYAN, stroke_width=2.5
        )

        # p1, p2 标注
        p1_lbl = MathTex(r"p_1", color=GREEN).scale(0.6).move_to([p_col_x1, liq_h1_abs + 0.32, 0])
        p2_lbl = MathTex(r"p_2", color=ORANGE).scale(0.6).move_to([p_col_x2, liq_h2_abs + 0.32, 0])

        # v1, v2 标注
        v1_lbl = MathTex(r"v_1", color=GREEN).scale(0.6).move_to([x_left + 1.8, tube_y_bot - 0.3, 0])
        v2_lbl = MathTex(r"v_2", color=ORANGE).scale(0.6).move_to([(x_taper_r + x_expand_l) / 2, narrow_y_top + 0.28, 0])

        diagram_group = VGroup(
            fluid_group, tube_group,
            pres_tube1, pres_tube2,
            liq1, liq2, surf1, surf2,
            h_arrow, h_label,
            s1_label, s2_label, flow_arrow,
            p1_lbl, p2_lbl, v1_lbl, v2_lbl
        )
        # 整体下移，让图留在下半部，公式区在上
        diagram_group.shift(DOWN * 0.9)

        scene_label = Text("文丘里管示意图", font=CJK, color=WHITE).scale(0.4).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(scene_label))
        self.play(Create(tube_group), FadeIn(fluid_group), run_time=1.5)
        self.play(FadeIn(VGroup(pres_tube1, pres_tube2)))
        self.play(FadeIn(VGroup(liq1, liq2, surf1, surf2)))
        self.play(FadeIn(VGroup(h_arrow, h_label)))
        self.play(FadeIn(VGroup(s1_label, s2_label, v1_lbl, v2_lbl, p1_lbl, p2_lbl, flow_arrow)))
        self.wait(1.8)

        # 流线密集提示
        dense_hint = Text("细管处流线密集  →  流速大  →  压强低", font=CJK, color=YELLOW).scale(0.42)
        dense_hint.next_to(title, DOWN, buff=0.35)
        self.play(FadeOut(scene_label), FadeIn(dense_hint))
        self.wait(1.8)
        self.play(FadeOut(dense_hint))

        # ── Step 4: 方程组推导 ──────────────────────────────────────────
        # 清除图形区，只留 title，上半区写方程
        self.play(FadeOut(diagram_group))

        eq_title = Text("建立方程组", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(eq_title))
        self.wait(0.6)

        # 连续性方程
        lbl_cont = Text("连续性方程：", font=CJK, color=GREEN).scale(0.44)
        eq_cont  = MathTex(r"S_1 v_1 = S_2 v_2", color=GREEN).scale(0.85)
        row_cont = VGroup(lbl_cont, eq_cont).arrange(RIGHT, buff=0.2)

        # 伯努利方程
        lbl_bern = Text("伯努利方程：", font=CJK, color=ORANGE).scale(0.44)
        eq_bern  = MathTex(
            r"p_1 + \tfrac{1}{2}\rho v_1^2 = p_2 + \tfrac{1}{2}\rho v_2^2",
            color=ORANGE
        ).scale(0.78)
        row_bern = VGroup(lbl_bern, eq_bern).arrange(RIGHT, buff=0.2)

        # 压差方程
        lbl_pres = Text("测压管液差：", font=CJK, color=YELLOW).scale(0.44)
        eq_pres  = MathTex(r"p_1 - p_2 = \rho g h", color=YELLOW).scale(0.85)
        row_pres = VGroup(lbl_pres, eq_pres).arrange(RIGHT, buff=0.2)

        eqs = VGroup(row_cont, row_bern, row_pres).arrange(DOWN, buff=0.45, aligned_edge=LEFT)
        eqs.next_to(eq_title, DOWN, buff=0.4)
        eqs.scale_to_fit_width(11.5)

        self.play(FadeIn(row_cont))
        self.wait(1.0)
        self.play(FadeIn(row_bern))
        self.wait(1.0)
        self.play(FadeIn(row_pres))
        self.wait(1.6)

        # ── Step 5: 消去 v1、v2，推导 Q ────────────────────────────────
        derive_title = Text("消去  v₁  和  v₂，得流量公式", font=CJK, color=BLUE).scale(0.45)
        derive_title.next_to(title, DOWN, buff=0.45)

        self.play(FadeOut(eq_title), FadeIn(derive_title))

        # 用 TransformMatchingTex 逐步化简
        # Step 5a: 由连续性  v1 = (S2/S1)*v2  代入伯努利
        step_a = MathTex(
            r"p_1 - p_2",
            r"=",
            r"\tfrac{1}{2}\rho \bigl(v_2^2 - v_1^2\bigr)",
            color=WHITE
        ).scale(0.78)
        step_a.next_to(derive_title, DOWN, buff=0.5)

        note_a = Text("由伯努利整理：", font=CJK, color=WHITE).scale(0.4)
        note_a.next_to(step_a, LEFT, buff=0.18)
        note_a_row = VGroup(note_a, step_a).arrange(RIGHT, buff=0.1)
        note_a_row.next_to(derive_title, DOWN, buff=0.45)
        note_a_row.scale_to_fit_width(11.5)

        self.play(
            TransformMatchingTex(eq_bern.copy(), step_a),
            FadeOut(eqs)
        )
        self.wait(1.2)

        # Step 5b: 代入 v1=S2*v2/S1，合并
        step_b = MathTex(
            r"p_1 - p_2",
            r"=",
            r"\tfrac{1}{2}\rho v_2^2\!\left(1 - \frac{S_2^2}{S_1^2}\right)",
            color=WHITE
        ).scale(0.78)
        step_b.next_to(derive_title, DOWN, buff=0.5)
        step_b.scale_to_fit_width(11.0)

        note_b = Text("代入连续性  v₁ = (S₂/S₁)v₂ ：", font=CJK, color=WHITE).scale(0.38)
        note_b.next_to(step_b, UP, buff=0.28)

        self.play(FadeIn(note_b))
        self.play(TransformMatchingTex(step_a, step_b))
        self.wait(1.2)

        # Step 5c: 代入 p1-p2=ρgh，求 v2
        step_c = MathTex(
            r"v_2",
            r"=",
            r"\sqrt{\frac{2gh}{\,1 - S_2^2/S_1^2\,}}",
            r"=",
            r"S_1\sqrt{\frac{2gh}{S_1^2 - S_2^2}}",
            color=YELLOW
        ).scale(0.78)
        step_c.next_to(derive_title, DOWN, buff=0.5)
        step_c.scale_to_fit_width(11.0)

        note_c = Text("代入  p₁ - p₂ = ρgh  求  v₂ ：", font=CJK, color=WHITE).scale(0.38)
        note_c.next_to(step_c, UP, buff=0.28)

        self.play(FadeOut(note_b))
        self.play(FadeIn(note_c))
        self.play(TransformMatchingTex(step_b, step_c))
        self.wait(1.4)

        # Step 5d: 最终流量 Q = S2*v2
        step_d = MathTex(
            r"Q",
            r"=",
            r"S_1 S_2 \sqrt{\dfrac{2gh}{S_1^2 - S_2^2}}",
            color=GREEN
        ).scale(0.92)
        step_d.next_to(derive_title, DOWN, buff=0.5)
        step_d.scale_to_fit_width(9.5)

        note_d = Text("流量  Q = S₂ v₂ ，最终结果：", font=CJK, color=WHITE).scale(0.38)
        note_d.next_to(step_d, UP, buff=0.28)

        self.play(FadeOut(note_c))
        self.play(FadeIn(note_d))
        self.play(TransformMatchingTex(step_c, step_d))
        self.wait(1.2)

        # 高亮方框
        box_d = SurroundingRectangle(step_d, color=GREEN, buff=0.22, corner_radius=0.12)
        self.play(Create(box_d))
        self.wait(1.6)
        self.play(FadeOut(VGroup(note_d, step_d, box_d, derive_title)))

        # ── Step 6: ValueTracker 动态演示 Q ∝ √h ────────────────────────
        dyn_title = Text("流量 Q 随液面差 h 的变化（Q  ∝  √h）", font=CJK, color=BLUE).scale(0.48)
        dyn_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(dyn_title))

        # 参数（示例值）
        S1_val = 0.04   # m²
        S2_val = 0.02   # m²
        g_val  = 9.8    # m/s²
        denom  = S1_val**2 - S2_val**2   # S1²-S2²

        h_tracker = ValueTracker(0.1)

        # 坐标轴
        axes = Axes(
            x_range=[0, 2.2, 0.5],
            y_range=[0, 0.014, 0.002],
            x_length=6.5,
            y_length=3.2,
            axis_config={"color": WHITE, "include_tip": True, "tip_length": 0.18},
            x_axis_config={"numbers_to_include": [0.5, 1.0, 1.5, 2.0]},
            y_axis_config={"numbers_to_include": [0.004, 0.008, 0.012]},
        ).shift(DOWN * 1.0 + LEFT * 0.5)

        x_label = MathTex(r"h\ (\mathrm{m})", color=WHITE).scale(0.55)
        x_label.next_to(axes.x_axis.get_right(), DOWN + RIGHT, buff=0.08)
        y_label = MathTex(r"Q\ (\mathrm{m^3/s})", color=WHITE).scale(0.5)
        y_label.next_to(axes.y_axis.get_top(), LEFT, buff=0.08)

        def Q_func(h):
            return S1_val * S2_val * math.sqrt(2 * g_val * h / denom)

        sqrt_curve = axes.plot(
            lambda h: Q_func(h),
            x_range=[0.01, 2.1],
            color=YELLOW, stroke_width=2.5
        )

        curve_label = MathTex(r"Q \propto \sqrt{h}", color=YELLOW).scale(0.65)
        curve_label.next_to(axes.c2p(1.4, Q_func(1.4)), UP + RIGHT, buff=0.1)

        # 动态点
        dot = always_redraw(lambda: Dot(
            axes.c2p(h_tracker.get_value(), Q_func(h_tracker.get_value())),
            color=CYAN, radius=0.1
        ))

        # 动态读数
        readout = always_redraw(lambda: VGroup(
            Text("h = ", font=CJK, color=CYAN).scale(0.42),
            MathTex(rf"{h_tracker.get_value():.2f}", r"\ \mathrm{m}", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.05).to_corner(UR, buff=0.55))

        readout_q = always_redraw(lambda: VGroup(
            Text("Q = ", font=CJK, color=GREEN).scale(0.42),
            MathTex(
                rf"{Q_func(h_tracker.get_value()):.4f}",
                r"\ \mathrm{m^3/s}",
                color=GREEN
            ).scale(0.55),
        ).arrange(RIGHT, buff=0.05).next_to(readout, DOWN, buff=0.22))

        # 动态竖线（x 轴到点）
        v_line = always_redraw(lambda: DashedLine(
            axes.c2p(h_tracker.get_value(), 0),
            axes.c2p(h_tracker.get_value(), Q_func(h_tracker.get_value())),
            color=CYAN, stroke_width=1.5, dash_length=0.1
        ))

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(sqrt_curve), FadeIn(curve_label))
        self.add(dot, v_line)
        self.add(readout, readout_q)

        hint_grow = Text("h 增大  →  Q 增大（Q 与 √h 成正比）", font=CJK, color=ORANGE).scale(0.42)
        hint_grow.next_to(axes, DOWN, buff=0.3)
        self.play(FadeIn(hint_grow))
        self.wait(0.5)

        # 扫动 h
        self.play(h_tracker.animate.set_value(2.0), run_time=3.5, rate_func=linear)
        self.wait(0.5)
        self.play(h_tracker.animate.set_value(0.5), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(h_tracker.animate.set_value(1.0), run_time=1.2)
        self.wait(1.2)

        dyn_objs = VGroup(axes, x_label, y_label, sqrt_curve, curve_label, hint_grow)
        self.play(FadeOut(dyn_objs), FadeOut(dyn_title))
        self.remove(dot, v_line, readout, readout_q)

        # ── Step 7: 数值例子 ────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        ex_cond  = Text(
            "S₁ = 40 cm²，S₂ = 20 cm²，液面差 h = 1 m，g = 9.8 m/s²",
            font=CJK, color=WHITE
        ).scale(0.42)
        ex_cond.next_to(ex_title, DOWN, buff=0.35)

        # Q 计算式
        ex_formula = MathTex(
            r"Q = S_1 S_2 \sqrt{\dfrac{2gh}{S_1^2 - S_2^2}}"
        ).scale(0.75)
        ex_sub = MathTex(
            r"= 0.04 \times 0.02 \times \sqrt{\dfrac{2 \times 9.8 \times 1}{0.0016 - 0.0004}}"
        ).scale(0.72)
        # Q_func(1.0) ≈ 0.00811  m³/s
        ex_res = MathTex(
            r"\approx 8.11 \times 10^{-3}\ \mathrm{m^3/s}",
            color=GREEN
        ).scale(0.80)

        calc_group = VGroup(ex_formula, ex_sub, ex_res).arrange(DOWN, buff=0.35)
        calc_group.next_to(ex_cond, DOWN, buff=0.4)
        calc_group.scale_to_fit_width(11.0)

        self.play(FadeIn(ex_title), FadeIn(ex_cond))
        self.wait(0.8)
        self.play(Write(ex_formula))
        self.wait(0.8)
        self.play(Write(ex_sub))
        self.wait(0.8)
        self.play(Write(ex_res))
        box_res = SurroundingRectangle(ex_res, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(box_res))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex_cond, calc_group, box_res)))

        # ── Step 8: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("连续性方程：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"S_1 v_1 = S_2 v_2", color=GREEN).scale(0.8)
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("压差关系：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"p_1 - p_2 = \rho g h", color=YELLOW).scale(0.8)
        ).arrange(RIGHT, buff=0.15)

        s3 = MathTex(
            r"Q = S_1 S_2 \sqrt{\dfrac{2gh}{S_1^2 - S_2^2}}",
            color=GREEN
        ).scale(0.88)

        s4 = VGroup(
            Text("结论：Q  ∝  √h，液差越大，流量越大", font=CJK, color=ORANGE).scale(0.44),
        )

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(11.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.4)
