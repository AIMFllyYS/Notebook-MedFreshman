"""第 9.3 节 · 例题：螺绕环自感系数计算

教学目标：从安培环路定理出发，推导螺绕环内磁场分布，
积分截面磁通量，最终得到自感系数 L = mu*N^2*h/(2pi) * ln(R2/R1)。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch09Ex1ToroidalInductorSelfInductance",
        "id": "phys-ch09-9.3-ex1-toroidal-inductor-self-inductance",
        "chapterId": "ch09",
        "sectionId": "9.3",
        "title": "螺绕环自感系数计算",
        "description": "用安培环路定理推导螺绕环磁场，对截面积分磁通量，逐步化简出 L = muN^2h/(2pi)*ln(R2/R1)。",
    },
]


class Ch09Ex1ToroidalInductorSelfInductance(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("螺绕环自感系数计算", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.3 例题", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text("变压器、继电器里的磁芯线圈——就是螺绕环：", font=CJK).scale(0.46)
        ana2 = Text("导线密绕在圆环上，通电后产生封闭在环内的强磁场。", font=CJK).scale(0.46)
        ana3 = Text("自感系数 L 决定线圈储存磁能的能力，也决定电流变化的惰性。", font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 俯视图——螺绕环几何图
        # ═══════════════════════════════════════════════════════════════
        geo_label = Text("俯视图：螺绕环几何结构", font=CJK, color=BLUE).scale(0.48)
        geo_label.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(geo_label))

        cx, cy = -2.5, -0.5   # 圆环中心
        R1_px = 0.9            # 内径（像素单位）
        R2_px = 1.9            # 外径（像素单位）

        # 外圆、内圆（实线表示截面轮廓）
        outer_ring = Circle(radius=R2_px, color=GRAY, stroke_width=3).move_to([cx, cy, 0])
        inner_ring = Circle(radius=R1_px, color=GRAY, stroke_width=3).move_to([cx, cy, 0])
        # 填充区域（环形区域）用浅色表示磁性材料
        ring_fill = Annulus(inner_radius=R1_px, outer_radius=R2_px, color=BLUE_E,
                            fill_opacity=0.25, stroke_width=0).move_to([cx, cy, 0])

        # 标注 R1, R2
        r1_line = Line([cx, cy, 0], [cx + R1_px, cy, 0], color=WHITE, stroke_width=1.5)
        r2_line = Line([cx, cy, 0], [cx, cy + R2_px, 0], color=WHITE, stroke_width=1.5)
        r1_lab = MathTex(r"R_1", color=WHITE).scale(0.55).next_to([cx + R1_px * 0.5, cy, 0], DOWN, buff=0.1)
        r2_lab = MathTex(r"R_2", color=WHITE).scale(0.55).next_to([cx, cy + R2_px * 0.5, 0], LEFT, buff=0.1)

        # N 匝线圈示意：沿外圆均匀画小短线代表线圈匝
        coil_ticks = VGroup()
        N_show = 16
        for k in range(N_show):
            ang = k * TAU / N_show
            mid_r = (R1_px + R2_px) / 2
            px = cx + mid_r * math.cos(ang)
            py = cy + mid_r * math.sin(ang)
            tick_len = 0.22
            tang = np.array([-math.sin(ang), math.cos(ang), 0])
            p0 = np.array([px, py, 0]) - tang * tick_len / 2
            p1 = np.array([px, py, 0]) + tang * tick_len / 2
            coil_ticks.add(Line(p0, p1, color=ORANGE, stroke_width=2.5))

        n_label_bg = Text("N 匝线圈均匀缠绕", font=CJK, color=ORANGE).scale(0.4)
        n_label_bg.move_to([cx, cy - R2_px - 0.5, 0])

        self.play(Create(ring_fill), Create(outer_ring), Create(inner_ring))
        self.play(Create(r1_line), Create(r2_line),
                  Write(r1_lab), Write(r2_lab))
        self.play(Create(coil_ticks), FadeIn(n_label_bg))
        self.wait(1.2)

        geo_group = VGroup(ring_fill, outer_ring, inner_ring,
                           r1_line, r2_line, r1_lab, r2_lab,
                           coil_ticks, n_label_bg)

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 安培环路——在环内画圆形路径，推导 B(r)
        # ═══════════════════════════════════════════════════════════════
        step4_label = Text("第一步：安培环路定理求 B(r)", font=CJK, color=GREEN).scale(0.44)
        step4_label.next_to(geo_label, DOWN, buff=0.2)
        self.play(FadeIn(step4_label))

        # 在环内画半径 r 的绿色虚线圆（作为安培路径）
        r_amp = (R1_px + R2_px) / 2   # 示例路径半径取中间值
        amp_path = DashedVMobject(
            Circle(radius=r_amp, color=GREEN, stroke_width=2.5).move_to([cx, cy, 0]),
            num_dashes=30
        )
        r_arrow = Arrow([cx, cy, 0], [cx + r_amp, cy, 0],
                        color=GREEN, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.2)
        r_label = MathTex(r"r", color=GREEN).scale(0.55).next_to([cx + r_amp * 0.5, cy, 0], UP, buff=0.08)

        self.play(Create(amp_path), Create(r_arrow), Write(r_label))
        self.wait(0.8)

        # 推导公式：右侧显示
        formula_x = 1.5
        amp_title = Text("安培环路定理：", font=CJK, color=WHITE).scale(0.44).move_to([formula_x, 1.2, 0])
        f_amp1 = MathTex(r"\oint \vec{H} \cdot d\vec{l} = N I").scale(0.7).move_to([formula_x, 0.55, 0])
        f_amp2 = MathTex(r"H \cdot 2\pi r = N I").scale(0.7).move_to([formula_x, -0.05, 0])
        f_amp3 = MathTex(r"H = \frac{NI}{2\pi r}").scale(0.7).move_to([formula_x, -0.65, 0])
        f_amp4_lhs = Text("由 ", font=CJK, color=WHITE).scale(0.44)
        f_amp4_tex = MathTex(r"B = \mu H").scale(0.65)
        f_amp4_rhs = Text(" 得：", font=CJK, color=WHITE).scale(0.44)
        f_amp4 = VGroup(f_amp4_lhs, f_amp4_tex, f_amp4_rhs).arrange(RIGHT, buff=0.1)
        f_amp4.move_to([formula_x, -1.2, 0])

        f_amp5 = MathTex(r"B(r) = \frac{\mu N I}{2\pi r}", color=YELLOW).scale(0.78).move_to([formula_x, -1.85, 0])

        self.play(FadeIn(amp_title), Write(f_amp1))
        self.wait(0.8)
        self.play(TransformMatchingTex(f_amp1.copy(), f_amp2))
        self.wait(0.7)
        self.play(TransformMatchingTex(f_amp2.copy(), f_amp3))
        self.wait(0.7)
        self.play(FadeIn(f_amp4))
        self.wait(0.5)
        self.play(Write(f_amp5))
        self.wait(1.5)

        # B(r) 双曲衰减曲线（小坐标系，右下角）
        ax = Axes(
            x_range=[0.6, 2.5, 0.5],
            y_range=[0, 2.5, 0.5],
            x_length=2.8,
            y_length=1.8,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": True},
        ).move_to([4.2, -1.6, 0])
        ax_x_lab = MathTex(r"r", color=WHITE).scale(0.45).next_to(ax.x_axis.get_end(), RIGHT, buff=0.05)
        ax_y_lab = MathTex(r"B", color=YELLOW).scale(0.45).next_to(ax.y_axis.get_end(), UP, buff=0.05)

        def b_func(r):
            return 1.0 / r  # 归一化双曲线

        b_curve = ax.plot(b_func, x_range=[0.65, 2.4], color=YELLOW, stroke_width=2.5)

        # R1, R2 竖线标注
        r1_vline = ax.get_vertical_line(ax.c2p(0.9, b_func(0.9)),
                                        line_config={"stroke_width": 1.5, "color": CYAN})
        r2_vline = ax.get_vertical_line(ax.c2p(1.9, b_func(1.9)),
                                        line_config={"stroke_width": 1.5, "color": CYAN})
        r1v_lab = MathTex(r"R_1", color=CYAN).scale(0.4).next_to(ax.c2p(0.9, 0), DOWN, buff=0.08)
        r2v_lab = MathTex(r"R_2", color=CYAN).scale(0.4).next_to(ax.c2p(1.9, 0), DOWN, buff=0.08)
        curve_cap = Text("B(r) 双曲衰减", font=CJK, color=YELLOW).scale(0.34).next_to(ax, DOWN, buff=0.1)

        self.play(Create(ax), Write(ax_x_lab), Write(ax_y_lab))
        self.play(Create(b_curve), Create(r1_vline), Create(r2_vline),
                  Write(r1v_lab), Write(r2v_lab), FadeIn(curve_cap))
        self.wait(1.5)

        # 清场（保留标题、俯视图环形，移去推导文字和曲线）
        step4_group = VGroup(step4_label, amp_title, f_amp1, f_amp2, f_amp3,
                             f_amp4, f_amp5, amp_path, r_arrow, r_label,
                             ax, ax_x_lab, ax_y_lab, b_curve,
                             r1_vline, r2_vline, r1v_lab, r2v_lab, curve_cap)
        self.play(FadeOut(step4_group))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 截面积分——ValueTracker 扫描 dr 条元，累积磁通量
        # ═══════════════════════════════════════════════════════════════
        step5_label = Text("第二步：对截面积分 → 磁通量 Phi", font=CJK, color=GREEN).scale(0.44)
        step5_label.next_to(geo_label, DOWN, buff=0.2)
        self.play(FadeIn(step5_label))

        # 右侧画截面图（矩形截面：宽 R2-R1，高 h）
        sec_x0, sec_y0 = 0.6, -1.6   # 截面左下角
        sec_w = 2.8   # 对应 R2-R1
        sec_h = 1.8   # 对应高 h
        section_rect = Rectangle(width=sec_w, height=sec_h, color=GRAY, stroke_width=2,
                                 fill_color=BLUE_E, fill_opacity=0.15)
        section_rect.move_to([sec_x0 + sec_w / 2, sec_y0 + sec_h / 2, 0])

        sec_r1_lab = MathTex(r"R_1", color=CYAN).scale(0.48).next_to([sec_x0, sec_y0, 0], DOWN, buff=0.1)
        sec_r2_lab = MathTex(r"R_2", color=CYAN).scale(0.48).next_to([sec_x0 + sec_w, sec_y0, 0], DOWN, buff=0.1)
        sec_h_brace = Brace(section_rect, direction=LEFT, color=WHITE)
        sec_h_lab = MathTex(r"h", color=WHITE).scale(0.55).next_to(sec_h_brace, LEFT, buff=0.12)
        sec_cap = Text("截面图（展开）", font=CJK, color=WHITE).scale(0.4).next_to(section_rect, UP, buff=0.15)

        self.play(Create(section_rect), Write(sec_r1_lab), Write(sec_r2_lab))
        self.play(Create(sec_h_brace), Write(sec_h_lab), FadeIn(sec_cap))
        self.wait(0.8)

        # dr 条元扫动
        r_tracker = ValueTracker(0.0)   # 0→1 对应 R1→R2

        def dr_strip():
            t = r_tracker.get_value()
            # 将 t 映射到截面宽度
            strip_x = sec_x0 + t * sec_w
            strip_width = min(0.12, sec_w * 0.06)
            rect = Rectangle(
                width=strip_width,
                height=sec_h,
                color=YELLOW,
                fill_color=YELLOW,
                fill_opacity=0.55 * (1 - 0.4 * t),  # B 随 r 减小，用透明度模拟
                stroke_width=0,
            )
            rect.move_to([strip_x + strip_width / 2, sec_y0 + sec_h / 2, 0])
            return rect

        def filled_area():
            """已扫过的积分面积（用透明矩形填充）"""
            t = r_tracker.get_value()
            if t < 0.001:
                return VGroup()
            filled = Rectangle(
                width=t * sec_w,
                height=sec_h,
                fill_color=ORANGE,
                fill_opacity=0.28,
                stroke_width=0,
            )
            filled.move_to([sec_x0 + t * sec_w / 2, sec_y0 + sec_h / 2, 0])
            return filled

        strip = always_redraw(dr_strip)
        area_fill = always_redraw(filled_area)
        self.add(area_fill, strip)

        # 积分公式（右侧）
        int_x = 3.8
        dr_label = MathTex(r"dA = h \cdot dr", color=YELLOW).scale(0.65).move_to([int_x, 1.1, 0])
        dphi_label = MathTex(r"d\Phi = B(r) \cdot h \cdot dr", color=YELLOW).scale(0.65).move_to([int_x, 0.4, 0])
        dphi_sub = MathTex(r"= \frac{\mu N I h}{2\pi r} dr", color=YELLOW).scale(0.65).move_to([int_x, -0.3, 0])

        self.play(Write(dr_label))
        self.wait(0.5)
        self.play(Write(dphi_label))
        self.wait(0.5)
        self.play(Write(dphi_sub))
        self.wait(0.5)

        # ValueTracker 扫动
        scan_cap = Text("从 R1 扫到 R2，累积磁通量...", font=CJK, color=ORANGE).scale(0.4)
        scan_cap.move_to([sec_x0 + sec_w / 2, sec_y0 - 0.55, 0])
        self.play(FadeIn(scan_cap))
        self.play(r_tracker.animate.set_value(1.0), run_time=3.0)
        self.wait(0.8)

        # 积分结果
        phi_result = MathTex(r"\Phi = \frac{\mu N I h}{2\pi} \ln\frac{R_2}{R_1}", color=GREEN)
        phi_result.scale(0.72).move_to([int_x, -1.05, 0])
        self.play(Write(phi_result))
        self.wait(1.5)

        step5_group = VGroup(step5_label, section_rect, sec_r1_lab, sec_r2_lab,
                             sec_h_brace, sec_h_lab, sec_cap,
                             dr_label, dphi_label, dphi_sub, phi_result, scan_cap)
        self.remove(strip, area_fill)
        self.play(FadeOut(step5_group))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 6: 磁链 → 自感系数 L（逐步化简）
        # ═══════════════════════════════════════════════════════════════
        step6_label = Text("第三步：磁链 Psi 与自感系数 L", font=CJK, color=GREEN).scale(0.44)
        step6_label.next_to(geo_label, DOWN, buff=0.2)
        self.play(FadeIn(step6_label))

        deriv_cx = 0.5  # 推导公式中心 x

        psi_def_lhs = Text("磁链定义：", font=CJK, color=WHITE).scale(0.44)
        psi_def_tex = MathTex(r"\Psi = N \Phi").scale(0.72)
        psi_def = VGroup(psi_def_lhs, psi_def_tex).arrange(RIGHT, buff=0.18)
        psi_def.move_to([deriv_cx, 1.1, 0])

        psi_sub = MathTex(r"\Psi = N \cdot \frac{\mu N I h}{2\pi} \ln\frac{R_2}{R_1}",
                          color=YELLOW).scale(0.70).move_to([deriv_cx, 0.35, 0])

        psi_simplify = MathTex(r"\Psi = \frac{\mu N^2 I h}{2\pi} \ln\frac{R_2}{R_1}",
                               color=YELLOW).scale(0.70).move_to([deriv_cx, -0.35, 0])

        l_def_lhs = Text("自感系数：", font=CJK, color=WHITE).scale(0.44)
        l_def_tex = MathTex(r"L = \frac{\Psi}{I}").scale(0.72)
        l_def = VGroup(l_def_lhs, l_def_tex).arrange(RIGHT, buff=0.18)
        l_def.move_to([deriv_cx, -1.05, 0])

        l_final = MathTex(r"L = \frac{\mu N^2 h}{2\pi} \ln\frac{R_2}{R_1}",
                          color=GREEN).scale(0.85).move_to([deriv_cx, -1.85, 0])
        l_final[0][0].set_color(GREEN)

        self.play(FadeIn(psi_def))
        self.wait(0.8)
        self.play(Write(psi_sub))
        self.wait(0.8)
        self.play(TransformMatchingTex(psi_sub.copy(), psi_simplify))
        self.wait(0.8)
        self.play(FadeIn(l_def))
        self.wait(0.7)
        self.play(Write(l_final))
        box_final = SurroundingRectangle(l_final, color=GREEN, buff=0.2, corner_radius=0.1)
        self.play(Create(box_final))
        self.wait(1.8)

        step6_group = VGroup(step6_label, psi_def, psi_sub, psi_simplify,
                             l_def, l_final, box_final)
        self.play(FadeOut(step6_group))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 几何直觉——L 与尺寸参数的关系图
        # ═══════════════════════════════════════════════════════════════
        step7_label = Text("几何直觉：L 如何随尺寸变化？", font=CJK, color=BLUE).scale(0.44)
        step7_label.next_to(geo_label, DOWN, buff=0.2)
        self.play(FadeIn(step7_label))

        # 重新显示俯视图（geo_group 仍在场景中）
        self.play(FadeIn(geo_group))

        # 右侧列出各参数的影响
        param_title = Text("L 的影响因素（固定其余量）：", font=CJK, color=WHITE).scale(0.42)
        param_title.move_to([3.4, 1.4, 0])

        p1_lhs = Text("N 增大 2 倍 →", font=CJK, color=ORANGE).scale(0.40)
        p1_rhs = MathTex(r"L \uparrow 4 \text{ }\mathrm{times}", color=ORANGE).scale(0.60)
        p1_note = VGroup(p1_lhs, p1_rhs).arrange(RIGHT, buff=0.12).move_to([3.4, 0.75, 0])

        p2_lhs = Text("h 增大 →", font=CJK, color=CYAN).scale(0.40)
        p2_rhs = MathTex(r"L \propto h", color=CYAN).scale(0.60)
        p2_note = VGroup(p2_lhs, p2_rhs).arrange(RIGHT, buff=0.12).move_to([3.4, 0.15, 0])

        p3_lhs = Text("R2/R1 增大 →", font=CJK, color=YELLOW).scale(0.40)
        p3_rhs = MathTex(r"L \propto \ln(R_2/R_1)", color=YELLOW).scale(0.60)
        p3_note = VGroup(p3_lhs, p3_rhs).arrange(RIGHT, buff=0.12).move_to([3.4, -0.45, 0])

        p4_lhs = Text("使用高磁导率磁芯 →", font=CJK, color=GREEN).scale(0.40)
        p4_rhs = MathTex(r"L \propto \mu", color=GREEN).scale(0.60)
        p4_note = VGroup(p4_lhs, p4_rhs).arrange(RIGHT, buff=0.12).move_to([3.4, -1.05, 0])

        self.play(FadeIn(param_title))
        self.wait(0.4)
        self.play(FadeIn(p1_note))
        self.wait(0.5)
        self.play(FadeIn(p2_note))
        self.wait(0.5)
        self.play(FadeIn(p3_note))
        self.wait(0.5)
        self.play(FadeIn(p4_note))
        self.wait(1.5)

        # N 增大动画：让环上线圈匝变密（增加几条额外 tick）
        extra_ticks = VGroup()
        N_extra = 12
        for k in range(N_extra):
            ang = (k + 0.5) * TAU / N_extra
            mid_r = (R1_px + R2_px) / 2
            px = cx + mid_r * math.cos(ang)
            py = cy + mid_r * math.sin(ang)
            tick_len = 0.18
            tang = np.array([-math.sin(ang), math.cos(ang), 0])
            p0 = np.array([px, py, 0]) - tang * tick_len / 2
            p1 = np.array([px, py, 0]) + tang * tick_len / 2
            extra_ticks.add(Line(p0, p1, color=RED, stroke_width=2.0))

        n_up_cap = Text("N 增大（匝数变多）", font=CJK, color=RED).scale(0.38)
        n_up_cap.move_to([cx, cy - R2_px - 0.55, 0])
        self.play(Create(extra_ticks), FadeIn(n_up_cap))
        self.wait(1.0)
        self.play(FadeOut(extra_ticks), FadeOut(n_up_cap))
        self.wait(0.5)

        step7_group = VGroup(step7_label, geo_group,
                             param_title, p1_note, p2_note, p3_note, p4_note)
        self.play(FadeOut(step7_group))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 数值例子
        # ═══════════════════════════════════════════════════════════════
        ex_label = Text("数值示例", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_label))

        cond_lhs = Text("已知：", font=CJK, color=WHITE).scale(0.44)
        cond_tex = MathTex(r"N=500,\ R_1=4\,\text{cm},\ R_2=6\,\text{cm},\ h=2\,\text{cm},\ \mu_r=1000").scale(0.56)
        cond = VGroup(cond_lhs, cond_tex).arrange(RIGHT, buff=0.12)
        cond.next_to(ex_label, DOWN, buff=0.35)
        cond.scale_to_fit_width(12.5)

        calc1 = MathTex(r"\mu = \mu_r \mu_0 = 1000 \times 4\pi\times10^{-7}"
                        r"\ \approx\ 1.257\times10^{-3}\ \mathrm{H/m}").scale(0.56)
        calc1.next_to(cond, DOWN, buff=0.3)

        calc2 = MathTex(r"\ln\frac{R_2}{R_1} = \ln\frac{6}{4} = \ln 1.5 \approx 0.405").scale(0.60)
        calc2.next_to(calc1, DOWN, buff=0.28)

        calc3 = MathTex(r"L = \frac{1.257\times10^{-3}\times500^2\times0.02}{2\pi}"
                        r"\times 0.405").scale(0.58)
        calc3.next_to(calc2, DOWN, buff=0.28)

        result = MathTex(r"L \approx 4.05\ \mathrm{mH}", color=GREEN).scale(0.85)
        result.next_to(calc3, DOWN, buff=0.32)
        box_result = SurroundingRectangle(result, color=GREEN, buff=0.18, corner_radius=0.08)

        self.play(FadeIn(cond))
        self.wait(0.8)
        self.play(Write(calc1))
        self.wait(0.7)
        self.play(Write(calc2))
        self.wait(0.7)
        self.play(Write(calc3))
        self.wait(0.7)
        self.play(Write(result), Create(box_result))
        self.wait(1.8)

        ex_group = VGroup(ex_label, cond, calc1, calc2, calc3, result, box_result)
        self.play(FadeOut(ex_group))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ═══════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sum_title))

        s1_lhs = Text("磁场：", font=CJK, color=WHITE).scale(0.44)
        s1_tex = MathTex(r"B(r) = \frac{\mu N I}{2\pi r}", color=YELLOW).scale(0.72)
        s1 = VGroup(s1_lhs, s1_tex).arrange(RIGHT, buff=0.15)

        s2_lhs = Text("磁通：", font=CJK, color=WHITE).scale(0.44)
        s2_tex = MathTex(r"\Phi = \frac{\mu N I h}{2\pi}\ln\frac{R_2}{R_1}", color=YELLOW).scale(0.72)
        s2 = VGroup(s2_lhs, s2_tex).arrange(RIGHT, buff=0.15)

        s3_lhs = Text("自感：", font=CJK, color=GREEN).scale(0.44)
        s3_tex = MathTex(r"L = \frac{\mu N^2 h}{2\pi}\ln\frac{R_2}{R_1}", color=GREEN).scale(0.78)
        s3 = VGroup(s3_lhs, s3_tex).arrange(RIGHT, buff=0.15)

        s4 = Text("L 正比于 N^2、h、mu，以及 ln(R2/R1) — 尺寸比值决定对数因子",
                  font=CJK, color=ORANGE).scale(0.40)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(13.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, summary, box_sum, title)))
        self.wait(0.3)
