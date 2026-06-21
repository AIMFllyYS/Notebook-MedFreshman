"""第 5.2 节 · 毛细现象与接触角（知识点 KP7）。

教学目标：让零基础读者真正理解毛细现象背后的物理机制：
接触角 θ 决定液面凹凸，表面张力的竖直分量支撑（或压低）液柱，
推导平衡公式 h = 2α cosθ / (ρgr)，再用 ValueTracker 演示参数依赖关系。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch05Kp7CapillaryRiseContactAngle(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("毛细现象与接触角", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.2", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("把细管插入水中，水会自动往上爬——这就是毛细现象。", font=CJK).scale(0.48)
        ana2 = Text("树木用毛细管把水从根部运送到树顶，", font=CJK).scale(0.48)
        ana3 = Text("而把细管插入水银时，水银却往下缩。为什么？", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana_group))

        # ── Step 3: 并排毛细管图 —— 润湿 vs 不润湿 ──────────────────────
        sec_label = Text("接触角 θ 决定液面的凹凸", font=CJK, color=BLUE).scale(0.50)
        sec_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_label))

        # ── 辅助函数：绘制一根毛细管截面 ─────────────────────────────────
        def make_tube(cx, tube_h=3.0, tube_w=0.7):
            """返回毛细管外壳（两条竖线 + 底横线）"""
            left_wall  = Line([cx - tube_w/2, -1.5, 0], [cx - tube_w/2, -1.5 + tube_h, 0],
                               color=WHITE, stroke_width=3)
            right_wall = Line([cx + tube_w/2, -1.5, 0], [cx + tube_w/2, -1.5 + tube_h, 0],
                               color=WHITE, stroke_width=3)
            bottom     = Line([cx - tube_w/2, -1.5, 0], [cx + tube_w/2, -1.5, 0],
                               color=WHITE, stroke_width=3)
            return VGroup(left_wall, right_wall, bottom)

        # 左管：水-玻璃，润湿，液面上升，凹液面 θ < 90°
        cx_L = -3.0
        tube_w = 0.7
        tube_L = make_tube(cx_L)

        # 液柱（蓝色矩形从底部到液面）
        liq_top_L = -1.5 + 1.8   # 液面 y 坐标（管内上升）
        liquid_L = Rectangle(width=tube_w - 0.06, height=1.8,
                              fill_color=BLUE, fill_opacity=0.55,
                              stroke_width=0).move_to([cx_L, -1.5 + 1.8/2, 0])

        # 凹液面：用 Arc 模拟（向上凸的弧 → 看上去像凹面）
        meniscus_L = Arc(radius=0.38, start_angle=0, angle=PI,
                         color=BLUE, stroke_width=3).move_to([cx_L, liq_top_L, 0]).flip(UP)

        # 接触角标注（θ < 90°，箭弧）
        theta_arc_L = Arc(radius=0.25, start_angle=PI/2, angle=-PI/4,
                          color=YELLOW, stroke_width=2.5)
        theta_arc_L.move_to([cx_L - tube_w/2, liq_top_L, 0]).shift(RIGHT * 0.25)
        theta_label_L = MathTex(r"\theta < 90°").scale(0.5).set_color(YELLOW)
        theta_label_L.next_to(theta_arc_L, LEFT, buff=0.05)

        # 表面张力箭头：沿管壁向左上斜
        ft_L = Arrow(
            start=[cx_L - tube_w/2, liq_top_L, 0],
            end=[cx_L - tube_w/2 - 0.35, liq_top_L + 0.55, 0],
            buff=0, color=GREEN, stroke_width=3, max_tip_length_to_length_ratio=0.3
        )
        ft_L_label = MathTex(r"\alpha").scale(0.5).set_color(GREEN)
        ft_L_label.next_to(ft_L.get_end(), UP, buff=0.05)

        # 分量：竖直向上
        fv_L = Arrow(
            start=[cx_L - tube_w/2 - 0.05, liq_top_L, 0],
            end=[cx_L - tube_w/2 - 0.05, liq_top_L + 0.55, 0],
            buff=0, color=ORANGE, stroke_width=2.5, max_tip_length_to_length_ratio=0.3
        )
        fv_L_label = VGroup(
            MathTex(r"\alpha\cos\theta").scale(0.42).set_color(ORANGE)
        ).next_to(fv_L.get_end(), RIGHT, buff=0.05)

        lbl_L = Text("水-玻璃（润湿）", font=CJK, color=BLUE).scale(0.40)
        lbl_L.move_to([cx_L, -1.5 - 0.35, 0])

        # 右管：水银-玻璃，不润湿，液面下降，凸液面 θ > 90°
        cx_R = 3.0
        tube_R = make_tube(cx_R)

        liq_top_R = -1.5 + 0.9   # 液面下降
        liquid_R = Rectangle(width=tube_w - 0.06, height=0.9,
                              fill_color="#A0A0A0", fill_opacity=0.70,
                              stroke_width=0).move_to([cx_R, -1.5 + 0.9/2, 0])

        # 凸液面：向上突起的弧
        meniscus_R = Arc(radius=0.38, start_angle=0, angle=PI,
                         color="#A0A0A0", stroke_width=3).move_to([cx_R, liq_top_R, 0])

        theta_arc_R = Arc(radius=0.25, start_angle=PI/2, angle=PI/4,
                          color=YELLOW, stroke_width=2.5)
        theta_arc_R.move_to([cx_R - tube_w/2, liq_top_R, 0]).shift(RIGHT * 0.25)
        theta_label_R = MathTex(r"\theta > 90°").scale(0.5).set_color(YELLOW)
        theta_label_R.next_to(theta_arc_R, LEFT, buff=0.05)

        # 表面张力箭头：沿管壁向左下斜
        ft_R = Arrow(
            start=[cx_R - tube_w/2, liq_top_R, 0],
            end=[cx_R - tube_w/2 - 0.35, liq_top_R - 0.55, 0],
            buff=0, color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.3
        )
        ft_R_label = MathTex(r"\alpha").scale(0.5).set_color(RED)
        ft_R_label.next_to(ft_R.get_end(), DOWN, buff=0.05)

        fv_R = Arrow(
            start=[cx_R - tube_w/2 - 0.05, liq_top_R, 0],
            end=[cx_R - tube_w/2 - 0.05, liq_top_R - 0.55, 0],
            buff=0, color=ORANGE, stroke_width=2.5, max_tip_length_to_length_ratio=0.3
        )
        fv_R_label = VGroup(
            MathTex(r"\alpha\cos\theta").scale(0.42).set_color(ORANGE)
        ).next_to(fv_R.get_end(), RIGHT, buff=0.05)

        lbl_R = Text("水银-玻璃（不润湿）", font=CJK, color=RED).scale(0.40)
        lbl_R.move_to([cx_R, -1.5 - 0.35, 0])

        # 外部液面基准线
        ext_L = DashedLine([cx_L - 1.2, -1.5, 0], [cx_L - tube_w/2, -1.5, 0],
                            color=CYAN, stroke_width=1.5)
        ext_R = DashedLine([cx_R + tube_w/2, -1.5, 0], [cx_R + 1.2, -1.5, 0],
                            color=CYAN, stroke_width=1.5)
        ext_label = Text("外部液面", font=CJK, color=CYAN).scale(0.36).move_to([0, -1.5, 0])

        # 高度标注
        h_line_L = DashedLine([cx_L + tube_w/2 + 0.15, -1.5, 0],
                               [cx_L + tube_w/2 + 0.15, liq_top_L, 0],
                               color=GREEN, stroke_width=2)
        h_lbl_L = MathTex(r"h\uparrow").scale(0.5).set_color(GREEN)
        h_lbl_L.next_to(h_line_L, RIGHT, buff=0.05)

        h_line_R = DashedLine([cx_R + tube_w/2 + 0.15, liq_top_R, 0],
                               [cx_R + tube_w/2 + 0.15, -1.5, 0],
                               color=RED, stroke_width=2)
        h_lbl_R = MathTex(r"h\downarrow").scale(0.5).set_color(RED)
        h_lbl_R.next_to(h_line_R, RIGHT, buff=0.05)

        # 动画：先显示两根管
        self.play(
            Create(tube_L), Create(tube_R),
            FadeIn(liquid_L), FadeIn(liquid_R),
            FadeIn(lbl_L), FadeIn(lbl_R),
            FadeIn(ext_L), FadeIn(ext_R), FadeIn(ext_label)
        )
        self.wait(0.8)
        self.play(Create(meniscus_L), Create(meniscus_R))
        self.wait(0.6)
        # 接触角
        self.play(Create(theta_arc_L), FadeIn(theta_label_L),
                  Create(theta_arc_R), FadeIn(theta_label_R))
        self.wait(0.8)
        # 表面张力箭头
        self.play(GrowArrow(ft_L), FadeIn(ft_L_label),
                  GrowArrow(ft_R), FadeIn(ft_R_label))
        self.wait(0.5)
        # 分量箭头
        self.play(GrowArrow(fv_L), FadeIn(fv_L_label),
                  GrowArrow(fv_R), FadeIn(fv_R_label))
        self.wait(0.5)
        # 高度标注
        self.play(Create(h_line_L), FadeIn(h_lbl_L),
                  Create(h_line_R), FadeIn(h_lbl_R))
        self.wait(1.5)

        # 清场
        tube_scene = VGroup(
            tube_L, tube_R, liquid_L, liquid_R, lbl_L, lbl_R,
            meniscus_L, meniscus_R,
            theta_arc_L, theta_label_L, theta_arc_R, theta_label_R,
            ft_L, ft_L_label, ft_R, ft_R_label,
            fv_L, fv_L_label, fv_R, fv_R_label,
            h_line_L, h_lbl_L, h_line_R, h_lbl_R,
            ext_L, ext_R, ext_label, sec_label
        )
        self.play(FadeOut(tube_scene))

        # ── Step 4: 平衡分析 —— 逐步推导 h = 2αcosθ/(ρgr) ──────────────
        deriv_title = Text("平衡分析：表面张力 = 液柱重力", font=CJK, color=BLUE).scale(0.50)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        # 力的来源说明
        note1 = Text("管内周长 = 2πr  →  表面张力合力沿竖直分量：", font=CJK).scale(0.44)
        note1.next_to(deriv_title, DOWN, buff=0.40)
        self.play(FadeIn(note1))
        self.wait(0.7)

        # 方程左边：表面张力竖直分量
        eq_ft = MathTex(r"F_{\text{surf}} = 2\pi r \cdot \alpha \cos\theta").scale(0.85)
        eq_ft[0][9:13].set_color(YELLOW)    # α cosθ
        eq_ft.next_to(note1, DOWN, buff=0.35)
        self.play(Write(eq_ft))
        self.wait(0.8)

        note2 = Text("液柱重力（r 半径，h 高度，ρ 密度）：", font=CJK).scale(0.44)
        note2.next_to(eq_ft, DOWN, buff=0.35)
        self.play(FadeIn(note2))
        self.wait(0.5)

        eq_fg = MathTex(r"F_{\text{grav}} = \pi r^2 \cdot \rho g h").scale(0.85)
        eq_fg[0][9:13].set_color(ORANGE)    # ρgh
        eq_fg.next_to(note2, DOWN, buff=0.30)
        self.play(Write(eq_fg))
        self.wait(0.8)

        note3 = Text("平衡条件：两力相等", font=CJK, color=GREEN).scale(0.44)
        note3.next_to(eq_fg, DOWN, buff=0.35)
        self.play(FadeIn(note3))
        self.wait(0.5)

        eq_bal = MathTex(r"2\pi r\alpha\cos\theta = \pi r^2 \rho g h").scale(0.85)
        eq_bal[0][0:13].set_color(YELLOW)
        eq_bal[0][14:].set_color(ORANGE)
        eq_bal.next_to(note3, DOWN, buff=0.25)
        self.play(Write(eq_bal))
        self.wait(1.0)

        # 最终结论
        eq_h = MathTex(r"h = \frac{2\alpha\cos\theta}{\rho g r}").scale(1.05)
        eq_h.set_color(GREEN)
        eq_h.next_to(eq_bal, DOWN, buff=0.40)
        self.play(Write(eq_h))
        self.wait(0.5)
        box_h = SurroundingRectangle(eq_h, color=GREEN, buff=0.22, corner_radius=0.12)
        self.play(Create(box_h))
        self.wait(2.0)

        deriv_group = VGroup(deriv_title, note1, eq_ft, note2, eq_fg, note3, eq_bal, eq_h, box_h)
        self.play(FadeOut(deriv_group))

        # ── Step 5: ValueTracker 参数扫动 ─────────────────────────────────
        tracker_title = Text("参数影响：r、α、θ 如何改变液柱高度 h", font=CJK, color=BLUE).scale(0.48)
        tracker_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tracker_title))

        # 三个可调参数
        r_tr     = ValueTracker(0.5)   # mm 单位（示意）
        alpha_tr = ValueTracker(0.072) # 水的表面张力系数 N/m（示意）
        theta_tr = ValueTracker(10.0)  # 接触角（度）

        # 计算 h（统一换算成 cm 用于展示，ρ=1000 kg/m³, g=9.8）
        # h[cm] = 2*α*cosθ / (ρ*g*r) * 100*1000  (r in mm → m, α in N/m)
        SCALE = 1000.0  # mm to m: r[mm]/1000 → r[m]; h = 2α cosθ/(ρg r[m])

        def calc_h(r_mm, alpha, theta_deg):
            r_m = r_mm / 1000.0
            theta_rad = math.radians(theta_deg)
            return 2 * alpha * math.cos(theta_rad) / (1000.0 * 9.8 * r_m)

        # 动态显示的参数值文本
        def make_param_text():
            r   = r_tr.get_value()
            alp = alpha_tr.get_value()
            th  = theta_tr.get_value()
            h   = calc_h(r, alp, th)
            lines = VGroup(
                VGroup(Text("r = ", font=CJK, color=CYAN).scale(0.44),
                       MathTex(rf"{r:.2f}\ \text{{mm}}").scale(0.5).set_color(CYAN)).arrange(RIGHT, buff=0.05),
                VGroup(Text("α = ", font=CJK, color=YELLOW).scale(0.44),
                       MathTex(rf"{alp:.3f}\ \mathrm{{N/m}}").scale(0.5).set_color(YELLOW)).arrange(RIGHT, buff=0.05),
                VGroup(Text("θ = ", font=CJK, color=ORANGE).scale(0.44),
                       MathTex(rf"{th:.0f}^\circ").scale(0.5).set_color(ORANGE)).arrange(RIGHT, buff=0.05),
                VGroup(Text("h = ", font=CJK, color=GREEN).scale(0.50),
                       MathTex(rf"{h*100:.1f}\ \text{{cm}}").scale(0.55).set_color(GREEN)).arrange(RIGHT, buff=0.05),
            ).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
            lines.to_corner(UL, buff=0.6).shift(DOWN * 1.2)
            return lines

        param_display = always_redraw(make_param_text)
        self.add(param_display)

        # 动态毛细管示意图（单管，右侧）
        tube_cx = 3.5
        tube_disp_h = 4.0  # 管的总高度（显示用）
        tube_disp_w = 0.9
        tube_bottom_y = -2.0

        tube_walls = VGroup(
            Line([tube_cx - tube_disp_w/2, tube_bottom_y, 0],
                 [tube_cx - tube_disp_w/2, tube_bottom_y + tube_disp_h, 0],
                 color=WHITE, stroke_width=3),
            Line([tube_cx + tube_disp_w/2, tube_bottom_y, 0],
                 [tube_cx + tube_disp_w/2, tube_bottom_y + tube_disp_h, 0],
                 color=WHITE, stroke_width=3),
            Line([tube_cx - tube_disp_w/2, tube_bottom_y, 0],
                 [tube_cx + tube_disp_w/2, tube_bottom_y, 0],
                 color=WHITE, stroke_width=3),
        )
        self.play(Create(tube_walls))

        # 外部液面
        ext_line = DashedLine(
            [tube_cx - tube_disp_w/2 - 0.8, tube_bottom_y + 0.4, 0],
            [tube_cx + tube_disp_w/2 + 0.8, tube_bottom_y + 0.4, 0],
            color=CYAN, stroke_width=2
        )
        ext_lbl = Text("外部液面", font=CJK, color=CYAN).scale(0.36)
        ext_lbl.next_to(ext_line, RIGHT, buff=0.12)
        self.play(FadeIn(ext_line), FadeIn(ext_lbl))

        # 动态液柱
        MAX_H_DISPLAY = tube_disp_h - 0.6  # 最大显示高度
        EXT_Y = tube_bottom_y + 0.4         # 外部液面 y

        def make_liquid():
            h_real = calc_h(r_tr.get_value(), alpha_tr.get_value(), theta_tr.get_value())
            # 将物理高度映射到屏幕高度（最大3cm时占满显示区）
            h_display = min(h_real * 100 / 3.0 * MAX_H_DISPLAY, MAX_H_DISPLAY)
            h_display = max(h_display, 0.05)
            liq = Rectangle(
                width=tube_disp_w - 0.08,
                height=h_display,
                fill_color=BLUE, fill_opacity=0.55, stroke_width=0
            )
            liq.move_to([tube_cx, EXT_Y + h_display / 2, 0])
            return liq

        def make_meniscus():
            h_real = calc_h(r_tr.get_value(), alpha_tr.get_value(), theta_tr.get_value())
            h_display = min(h_real * 100 / 3.0 * MAX_H_DISPLAY, MAX_H_DISPLAY)
            h_display = max(h_display, 0.05)
            top_y = EXT_Y + h_display
            men = Arc(radius=tube_disp_w/2 * 0.7,
                      start_angle=0, angle=PI,
                      color=BLUE, stroke_width=3).move_to([tube_cx, top_y, 0]).flip(UP)
            return men

        def make_h_brace():
            h_real = calc_h(r_tr.get_value(), alpha_tr.get_value(), theta_tr.get_value())
            h_display = min(h_real * 100 / 3.0 * MAX_H_DISPLAY, MAX_H_DISPLAY)
            h_display = max(h_display, 0.05)
            top_y = EXT_Y + h_display
            if h_display < 0.2:
                return VGroup()
            brace = Brace(
                Line([tube_cx + tube_disp_w/2 + 0.05, EXT_Y, 0],
                     [tube_cx + tube_disp_w/2 + 0.05, top_y, 0]),
                direction=RIGHT, color=GREEN
            )
            lbl = MathTex(rf"h").scale(0.55).set_color(GREEN)
            brace.put_at_tip(lbl)
            return VGroup(brace, lbl)

        dyn_liquid  = always_redraw(make_liquid)
        dyn_meniscs = always_redraw(make_meniscus)
        dyn_brace   = always_redraw(make_h_brace)
        self.add(dyn_liquid, dyn_meniscs, dyn_brace)
        self.wait(0.5)

        # 扫动 r：管径变细，h 变大
        lbl_r = Text("缩小管径 r → h 急剧增大", font=CJK, color=CYAN).scale(0.42)
        lbl_r.next_to(tracker_title, DOWN, buff=0.25)
        self.play(FadeIn(lbl_r))
        self.play(r_tr.animate.set_value(0.15), run_time=3.0)
        self.wait(0.8)
        self.play(r_tr.animate.set_value(0.5), run_time=1.5)
        self.wait(0.5)
        self.play(FadeOut(lbl_r))

        # 扫动 α：表面张力系数增大，h 增大
        lbl_a = Text("增大 α（表面张力系数）→ h 增大", font=CJK, color=YELLOW).scale(0.42)
        lbl_a.next_to(tracker_title, DOWN, buff=0.25)
        self.play(FadeIn(lbl_a))
        self.play(alpha_tr.animate.set_value(0.14), run_time=2.0)
        self.wait(0.5)
        self.play(alpha_tr.animate.set_value(0.036), run_time=1.5)
        lbl_soap = Text("（加肥皂后 α 减小，h 降低）", font=CJK, color=RED).scale(0.40)
        lbl_soap.next_to(lbl_a, DOWN, buff=0.18)
        self.play(FadeIn(lbl_soap))
        self.wait(1.0)
        self.play(alpha_tr.animate.set_value(0.072), run_time=1.2)
        self.play(FadeOut(lbl_a), FadeOut(lbl_soap))

        # 扫动 θ：接触角增大，h 减小；θ→90°时 h→0
        lbl_t = Text("增大接触角 θ → cosθ 减小 → h 减小", font=CJK, color=ORANGE).scale(0.42)
        lbl_t.next_to(tracker_title, DOWN, buff=0.25)
        self.play(FadeIn(lbl_t))
        self.play(theta_tr.animate.set_value(80.0), run_time=3.0)
        self.wait(0.5)
        self.play(theta_tr.animate.set_value(10.0), run_time=2.0)
        self.play(FadeOut(lbl_t))
        self.wait(0.5)

        tracker_group = VGroup(
            tracker_title, tube_walls, ext_line, ext_lbl
        )
        self.play(FadeOut(tracker_group),
                  FadeOut(dyn_liquid), FadeOut(dyn_meniscs), FadeOut(dyn_brace),
                  FadeOut(param_display))

        # ── Step 6: h vs r 曲线（h ∝ 1/r 的双曲线直觉）────────────────────
        graph_title = Text("h ∝ 1/r：管越细，液柱越高", font=CJK, color=BLUE).scale(0.50)
        graph_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(graph_title))

        axes = Axes(
            x_range=[0.1, 1.2, 0.2],
            y_range=[0, 3.5, 0.5],
            x_length=7,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.5)

        x_lbl = VGroup(
            MathTex(r"r").scale(0.55),
            Text("（mm）", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.05).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)

        y_lbl = VGroup(
            MathTex(r"h").scale(0.55),
            Text("（cm）", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.05).next_to(axes.y_axis.get_end(), LEFT, buff=0.10)

        ALPHA_FIXED = 0.072
        THETA_DEG   = 10.0

        curve = axes.plot(
            lambda r_mm: min(calc_h(r_mm, ALPHA_FIXED, THETA_DEG) * 100, 3.4),
            x_range=[0.12, 1.19],
            color=YELLOW,
        )
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(curve), run_time=1.8)

        # 标注 r→0 时趋势
        trend_lbl = Text("r→0 时 h→∞（实际受管长限制）", font=CJK, color=RED).scale(0.42)
        trend_lbl.next_to(axes, DOWN, buff=0.35)
        self.play(FadeIn(trend_lbl))
        self.wait(2.0)
        self.play(FadeOut(VGroup(graph_title, axes, x_lbl, y_lbl, curve, trend_lbl)))

        # ── Step 7: 生活应用 —— 树木导管 & 肥皂对比 ────────────────────────
        app_title = Text("生活应用：树木导管与肥皂水", font=CJK, color=BLUE).scale(0.50)
        app_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(app_title))

        # 树木导管示意（一排细管）
        tree_label = Text("树木：导管极细（r ~ 0.02 mm），毛细力可将水送至数十米高", font=CJK).scale(0.43)
        tree_label.next_to(app_title, DOWN, buff=0.4)
        self.play(FadeIn(tree_label))

        # 绘制5根细管并排，液面较高
        tubes_tree = VGroup()
        for i in range(5):
            cx_i = -2.0 + i * 0.6
            wall_l = Line([cx_i - 0.25, -1.8, 0], [cx_i - 0.25, 0.8, 0], color=WHITE, stroke_width=2)
            wall_r = Line([cx_i + 0.25, -1.8, 0], [cx_i + 0.25, 0.8, 0], color=WHITE, stroke_width=2)
            liq_i  = Rectangle(width=0.44, height=2.2,
                                fill_color=BLUE, fill_opacity=0.50, stroke_width=0)
            liq_i.move_to([cx_i, -1.8 + 2.2/2, 0])
            men_i  = Arc(radius=0.22, start_angle=0, angle=PI,
                         color=BLUE, stroke_width=2).move_to([cx_i, -1.8 + 2.2, 0]).flip(UP)
            tubes_tree.add(wall_l, wall_r, liq_i, men_i)
        tubes_tree.shift(DOWN * 0.4)
        self.play(Create(tubes_tree))

        h_tree = MathTex(r"h \approx \frac{2\times 0.072 \times \cos10^\circ}{1000\times9.8\times2\times10^{-5}}"
                         r"\approx 0.73\ \text{m}").scale(0.58).set_color(GREEN)
        h_tree.next_to(tubes_tree, RIGHT, buff=0.5)
        self.play(Write(h_tree))
        self.wait(1.5)

        # 肥皂水对比
        soap_lbl = Text("加肥皂后 α 从 0.072 → 0.030 N/m，h 减少约 58%",
                        font=CJK, color=RED).scale(0.42)
        soap_lbl.next_to(h_tree, DOWN, buff=0.3)
        self.play(FadeIn(soap_lbl))
        self.wait(1.5)

        self.play(FadeOut(VGroup(app_title, tree_label, tubes_tree, h_tree, soap_lbl)))

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("润湿 θ<90°：凹液面，液面上升", font=CJK, color=CYAN).scale(0.43),
        )
        s2 = VGroup(
            Text("不润湿 θ>90°：凸液面，液面下降", font=CJK, color=RED).scale(0.43),
        )
        s3 = MathTex(r"2\pi r\alpha\cos\theta = \pi r^2\rho g h", color=YELLOW).scale(0.85)
        s4 = MathTex(r"h = \frac{2\alpha\cos\theta}{\rho g r}", color=GREEN).scale(0.95)
        s5 = Text("管越细 h 越大；α↑→h↑；θ↑→h↓", font=CJK, color=WHITE).scale(0.43)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.35).next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(11.5)
        box = SurroundingRectangle(summary, color=GREEN, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s1), FadeIn(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(Write(s4))
        self.wait(0.5)
        self.play(FadeIn(s5), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Kp7CapillaryRiseContactAngle",
        "id": "phys-ch05-5.2-kp7-capillary-rise-contact-angle",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "毛细现象与接触角",
        "description": "接触角决定液面凹凸，逐步推导平衡公式 h=2αcosθ/(ρgr)，ValueTracker 扫动 r/α/θ 演示参数依赖，配 1/r 曲线与树木导管应用。",
    },
]
