"""第 7.3 节 · 场强与电势梯度的关系（矢量场 / 等势面 / ValueTracker 扫动方向）。

核心思路：以平行板电容器（匀强电场）为主舞台，逐步建立
  E = -dV/dn · n = -grad V
的直觉，再切换点电荷场用旋转方向微元体验梯度极值方向。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─────────────────────────────────────────────────────────────────
REGISTER = [
    {
        "scene": "Ch07Kp2GradientFieldPotentialRelation",
        "id": "phys-ch07-7.3-kp2-gradient-field-potential-relation",
        "chapterId": "ch07",
        "sectionId": "7.3",
        "title": "场强与电势梯度的关系",
        "description": "用平行板匀强电场与点电荷场，动画演示 E = -grad V：等势面越密场强越大，负梯度方向即场强方向。",
    },
]


class Ch07Kp2GradientFieldPotentialRelation(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ══════════════════════════════════════════════════════════
        title = Text("场强与电势梯度的关系", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.3", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2 · 生活类比：等高线地图
        # ══════════════════════════════════════════════════════════
        ana1 = Text("类比：地形等高线地图", font=CJK, color=ORANGE).scale(0.52)
        ana2 = Text("等高线密 → 坡度陡 → 小球滚得快", font=CJK).scale(0.48)
        ana3 = Text("电场中：等势面密 → 电势梯度大 → 场强大", font=CJK, color=GREEN).scale(0.48)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.32).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana_grp))

        # ══════════════════════════════════════════════════════════
        # Step 3 · 定义：梯度与场强关系公式（逐行出现）
        # ══════════════════════════════════════════════════════════
        def_lbl = Text("核心公式（逐步推导）", font=CJK, color=BLUE).scale(0.50)
        def_lbl.next_to(title, DOWN, buff=0.50)

        f1 = MathTex(r"U_{ab}=V_a-V_b=\int_a^b \mathbf{E}\cdot\mathrm{d}\mathbf{l}",
                     color=WHITE).scale(0.80)
        f2 = MathTex(r"E_n = -\frac{\partial V}{\partial n}", color=YELLOW).scale(0.90)
        f3_lhs = MathTex(r"\mathbf{E}", color=YELLOW).scale(0.90)
        f3_eq  = MathTex(r"=-\,\mathrm{grad}\,V=-\nabla V", color=GREEN).scale(0.90)
        f3 = VGroup(f3_lhs, f3_eq).arrange(RIGHT, buff=0.10)
        formulas = VGroup(f1, f2, f3).arrange(DOWN, buff=0.40)
        formulas.next_to(def_lbl, DOWN, buff=0.40)
        formulas.scale_to_fit_width(11.5)

        self.play(FadeIn(def_lbl))
        self.play(Write(f1)); self.wait(1.2)
        self.play(Write(f2)); self.wait(1.2)
        self.play(Write(f3)); self.wait(1.6)
        note_neg = Text("负号：场强指向电势降低的方向", font=CJK, color=RED).scale(0.44)
        note_neg.next_to(formulas, DOWN, buff=0.30)
        self.play(FadeIn(note_neg))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_lbl, formulas, note_neg)))

        # ══════════════════════════════════════════════════════════
        # Step 4 · 平行板电容器：等势面 + E 箭头
        # ══════════════════════════════════════════════════════════
        scene_lbl = Text("平行板电容器（匀强电场）", font=CJK, color=BLUE).scale(0.50)
        scene_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scene_lbl))

        # 两块极板
        plate_left  = Rectangle(width=0.25, height=3.5, color=GRAY, fill_color=GRAY,
                                 fill_opacity=0.85).move_to(LEFT * 4.0)
        plate_right = Rectangle(width=0.25, height=3.5, color=GRAY, fill_color=GRAY,
                                 fill_opacity=0.85).move_to(RIGHT * 4.0)
        lbl_pos = Text("+", font=CJK, color=RED).scale(0.9).next_to(plate_left, LEFT, buff=0.15)
        lbl_neg = Text("-", font=CJK, color=BLUE).scale(1.1).next_to(plate_right, RIGHT, buff=0.15)

        self.play(FadeIn(plate_left), FadeIn(plate_right),
                  FadeIn(lbl_pos), FadeIn(lbl_neg))
        self.wait(0.6)

        # 等势面（5条竖线，颜色从红到蓝）
        equipot_colors = [RED, ORANGE, YELLOW, GREEN, BLUE]
        equipot_xs = [-2.8, -1.4, 0.0, 1.4, 2.8]
        equipot_lines = VGroup()
        v_labels = VGroup()
        for i, (x, col) in enumerate(zip(equipot_xs, equipot_colors)):
            ln = Line(UP * 1.8, DOWN * 1.8, color=col, stroke_width=2.5).move_to(RIGHT * x)
            equipot_lines.add(ln)
            v_val = 4 - i  # V4 → V0
            lbl = MathTex(rf"V_{v_val}", color=col).scale(0.45)
            lbl.next_to(ln, UP, buff=0.18)
            v_labels.add(lbl)

        self.play(Create(equipot_lines), FadeIn(v_labels))
        self.wait(0.8)

        # E 箭头（从左到右，低电势方向）
        e_arrows = VGroup()
        for y in [-0.9, 0.0, 0.9]:
            arr = Arrow(LEFT * 3.6, RIGHT * 3.6, buff=0,
                        color=YELLOW, stroke_width=3,
                        max_tip_length_to_length_ratio=0.07).move_to(UP * y)
            e_arrows.add(arr)
        e_arrow_lbl = MathTex(r"\mathbf{E}", color=YELLOW).scale(0.65)
        e_arrow_lbl.next_to(e_arrows[1], DOWN, buff=0.22)
        self.play(Create(e_arrows), FadeIn(e_arrow_lbl))
        cap4 = Text("E 指向电势降低方向（红→蓝）", font=CJK, color=YELLOW).scale(0.44)
        cap4.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(cap4))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════
        # Step 5 · 标注梯度：在法向 n 上显示 dV/dn，加负号得 E
        # ══════════════════════════════════════════════════════════
        # 在第3条（中间）等势面旁画法向箭头
        n_arrow = Arrow(ORIGIN, RIGHT * 1.2, buff=0, color=GREEN, stroke_width=3)
        n_arrow.move_to(RIGHT * 0.6)
        n_lbl = MathTex(r"\hat{n}", color=GREEN).scale(0.55).next_to(n_arrow, UP, buff=0.12)
        dv_dn = MathTex(r"\frac{\Delta V}{\Delta n}", color=GREEN).scale(0.60)
        dv_dn.next_to(n_arrow, DOWN, buff=0.18)

        self.play(GrowArrow(n_arrow), FadeIn(n_lbl))
        self.play(FadeIn(dv_dn))
        self.wait(0.8)

        eq5 = MathTex(r"E_n = -\frac{\Delta V}{\Delta n}", color=YELLOW).scale(0.72)
        eq5.to_edge(DOWN, buff=1.10)
        self.play(Write(eq5))
        self.wait(1.2)

        note5 = Text("负号：E 与梯度方向相反（从高势指向低势）",
                     font=CJK, color=RED).scale(0.42)
        note5.next_to(eq5, DOWN, buff=0.25)
        self.play(FadeIn(note5))
        self.wait(1.5)
        self.play(FadeOut(VGroup(n_arrow, n_lbl, dv_dn, eq5, note5, cap4)))

        # ══════════════════════════════════════════════════════════
        # Step 6 · 等势面越密，dV/dn 越大，E 越大（靠近极板）
        # ══════════════════════════════════════════════════════════
        dense_lbl = Text("靠近极板：等势面间距不变（匀强场），E 均匀",
                         font=CJK, color=ORANGE).scale(0.44)
        dense_lbl.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(dense_lbl))
        self.wait(1.0)

        # 演示"压缩"等势面间距 → 梯度增大（用颜色 brace 标注间距）
        brace_full = Brace(
            Line(equipot_lines[0].get_center(), equipot_lines[1].get_center()),
            direction=DOWN, color=CYAN
        )
        b_lbl = MathTex(r"\Delta n", color=CYAN).scale(0.52)
        brace_full.put_at_tip(b_lbl)
        self.play(Create(brace_full), FadeIn(b_lbl))
        self.wait(0.8)
        highlight6 = Text("等势面越密 → △n 越小 → |dV/dn| 越大 → E 越强",
                          font=CJK, color=GREEN).scale(0.43)
        highlight6.next_to(dense_lbl, UP, buff=0.25)
        self.play(FadeIn(highlight6))
        self.wait(1.6)
        self.play(FadeOut(VGroup(brace_full, b_lbl, dense_lbl, highlight6)))

        # 清空平行板场景
        self.play(FadeOut(VGroup(plate_left, plate_right, lbl_pos, lbl_neg,
                                 equipot_lines, v_labels, e_arrows, e_arrow_lbl,
                                 scene_lbl)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # Step 7 · 点电荷场：同心圆等势面 + 旋转 dl 体验梯度
        # ══════════════════════════════════════════════════════════
        pt_lbl = Text("点电荷场：等势面为同心圆", font=CJK, color=BLUE).scale(0.50)
        pt_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(pt_lbl))

        center = ORIGIN + DOWN * 0.4
        charge_dot = Dot(point=center, radius=0.18, color=RED)
        charge_sym = MathTex(r"+q", color=RED).scale(0.65).next_to(charge_dot, UP, buff=0.12)

        # 4 个同心圆等势面，颜色 red→blue
        radii = [0.7, 1.2, 1.7, 2.2]
        circle_colors = [RED, ORANGE, GREEN, BLUE]
        circles = VGroup()
        c_labels = VGroup()
        for r, col in zip(radii, circle_colors):
            c = Circle(radius=r, color=col, stroke_width=2).move_to(center)
            circles.add(c)
            lbl = MathTex(rf"V_{4-circle_colors.index(col)}", color=col).scale(0.40)
            lbl.move_to(center + UP * (r + 0.22))
            c_labels.add(lbl)

        self.play(Create(charge_dot), FadeIn(charge_sym))
        self.play(Create(circles), FadeIn(c_labels))
        self.wait(0.8)

        # ── ValueTracker：旋转 dl 方向，实时显示 dV/dl 大小 ──────────
        angle_tracker = ValueTracker(0.0)   # 0 = 径向外（法向）
        R_probe = 1.45   # 探针所在半径（在第2、3圆之间）
        V_q = 1.8        # 假设 kq/r 无量纲比例因子（归一化）

        def probe_pos():
            ang = angle_tracker.get_value()
            return center + R_probe * np.array([math.cos(ang), math.sin(ang), 0.0])

        def dl_direction():
            ang = angle_tracker.get_value()
            # dl 固定朝"旋转角"方向
            return np.array([math.cos(ang), math.sin(ang), 0.0])

        def dVdl_value():
            # 径向分量：|dV/dl| = |cos(θ_between_dl_and_radial)| * |dV/dr|
            # 当 dl 沿径向时 cos=1（最大），切向时 cos=0
            # 这里 angle_tracker 就是 dl 的方向 = 径向方向时 angle=angle_tracker
            # 额外引入"偏离法向"角 phi_offset
            # 简化：dV/dr ∝ 1/r²，dV/dl = (dV/dr)*cos(phi_offset)
            # phi_offset = angle_tracker 相对径向的偏角（我们用另一套约定）
            # 实际：probe 沿 angle_tracker 方向，径向角也是 angle_tracker —— 故 cos=1 恒成立
            # 改用 phi_offset 另一个 ValueTracker 来演示切向
            return V_q / (R_probe ** 2)   # 固定值；切向演示在下面

        # 改用两 ValueTracker：angle（探针位置角）+ phi（dl 相对径向的偏角）
        phi_tracker = ValueTracker(0.0)   # phi=0 法向，phi=PI/2 切向

        probe_dot = always_redraw(lambda: Dot(
            point=center + R_probe * np.array([math.cos(angle_tracker.get_value()),
                                               math.sin(angle_tracker.get_value()), 0.0]),
            radius=0.10, color=CYAN
        ))

        def make_dl_arrow():
            base_ang = angle_tracker.get_value()
            phi = phi_tracker.get_value()
            dl_ang = base_ang + phi
            p0 = center + R_probe * np.array([math.cos(base_ang), math.sin(base_ang), 0.0])
            p1 = p0 + 0.55 * np.array([math.cos(dl_ang), math.sin(dl_ang), 0.0])
            return Arrow(p0, p1, buff=0, color=ORANGE, stroke_width=3,
                         max_tip_length_to_length_ratio=0.30)

        dl_arrow = always_redraw(make_dl_arrow)
        dl_tex = MathTex(r"\mathrm{d}\mathbf{l}", color=ORANGE).scale(0.55)
        dl_tex.add_updater(lambda m: m.next_to(
            center + R_probe * np.array([math.cos(angle_tracker.get_value()),
                                         math.sin(angle_tracker.get_value()), 0.0])
            + 0.55 * np.array([math.cos(angle_tracker.get_value() + phi_tracker.get_value()),
                                math.sin(angle_tracker.get_value() + phi_tracker.get_value()), 0.0]),
            RIGHT, buff=0.08
        ))

        def make_dvdl_readout():
            phi = phi_tracker.get_value()
            # |dV/dl| ∝ |cos(phi)|（法向最大，切向为零）
            val = abs(math.cos(phi)) * V_q / (R_probe ** 2)
            tex = MathTex(
                rf"\left|\frac{{dV}}{{dl}}\right| = {val:.2f}",
                color=CYAN
            ).scale(0.60)
            tex.to_corner(UR, buff=0.55)
            return tex

        dvdl_readout = always_redraw(make_dvdl_readout)
        self.add(dvdl_readout)

        self.play(Create(probe_dot), Create(dl_arrow), FadeIn(dl_tex))
        cap7a = Text("旋转 dl 方向：沿法向（径向）时 dV/dl 最大", font=CJK, color=GREEN).scale(0.42)
        cap7a.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(cap7a))
        self.wait(0.8)

        # 旋转 phi 从 0（法向）→ PI/2（切向）
        self.play(phi_tracker.animate.set_value(math.pi / 2), run_time=2.5)
        self.wait(0.8)
        cap7b = Text("切向时 dV/dl = 0；法向时最大 → 梯度方向", font=CJK, color=RED).scale(0.42)
        cap7b.next_to(cap7a, UP, buff=0.22)
        self.play(FadeIn(cap7b))
        self.wait(0.8)
        # 转回法向
        self.play(phi_tracker.animate.set_value(0.0), run_time=2.0)
        self.wait(0.6)
        # 绕圆运动展示不同位置
        self.play(angle_tracker.animate.set_value(math.pi), run_time=2.5)
        self.wait(0.6)
        self.play(angle_tracker.animate.set_value(0.0), run_time=2.0)
        self.wait(1.0)

        self.play(FadeOut(VGroup(charge_dot, charge_sym, circles, c_labels,
                                 probe_dot, dl_arrow, dl_tex,
                                 dvdl_readout, cap7a, cap7b, pt_lbl)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════
        # Step 8 · 热力图 + 场强箭头叠加（电势用色彩编码）
        # ══════════════════════════════════════════════════════════
        hm_lbl = Text("电势分布热力图 + 场强矢量叠加", font=CJK, color=BLUE).scale(0.50)
        hm_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(hm_lbl))

        # 用一组矩形格子模拟点电荷热力图（颜色 = 电势大小）
        hm_group = VGroup()
        nx, ny = 14, 9
        dx, dy = 8.0 / nx, 4.5 / ny
        charge_cx, charge_cy = 0.0, -0.2   # 点电荷中心
        for ix in range(nx):
            for iy in range(ny):
                px = -4.0 + ix * dx + dx / 2
                py = -2.5 + iy * dy + dy / 2
                r = math.sqrt((px - charge_cx) ** 2 + (py - charge_cy) ** 2) + 0.01
                v_norm = min(1.0, 0.6 / r)   # 归一化电势 [0,1]
                # 颜色：高势=红，低势=蓝
                col = interpolate_color(BLUE, RED, v_norm)
                rect = Rectangle(width=dx, height=dy,
                                  fill_color=col, fill_opacity=0.55,
                                  stroke_width=0).move_to([px, py, 0])
                hm_group.add(rect)

        self.play(FadeIn(hm_group, run_time=1.2))
        self.wait(0.6)

        # 场强箭头（从电荷向外辐射，颜色黄）
        field_arrows = VGroup()
        for k in range(10):
            ang = k * TAU / 10
            r0 = 0.45
            r1 = 1.40
            p_start = np.array([charge_cx + r0 * math.cos(ang),
                                 charge_cy + r0 * math.sin(ang), 0.0])
            p_end   = np.array([charge_cx + r1 * math.cos(ang),
                                 charge_cy + r1 * math.sin(ang), 0.0])
            field_arrows.add(Arrow(p_start, p_end, buff=0, color=YELLOW,
                                   stroke_width=2.5,
                                   max_tip_length_to_length_ratio=0.28))

        self.play(Create(field_arrows))
        self.wait(0.8)

        eq8 = MathTex(r"\mathbf{E}=-\nabla V", color=YELLOW).scale(0.85)
        eq8.to_edge(DOWN, buff=0.65)
        self.play(Write(eq8))
        cap8 = Text("色越红电势越高，场强箭头从高势指向低势", font=CJK, color=WHITE).scale(0.42)
        cap8.next_to(eq8, UP, buff=0.25)
        self.play(FadeIn(cap8))
        self.wait(1.8)
        self.play(FadeOut(VGroup(hm_group, field_arrows, eq8, cap8, hm_lbl)))

        # ══════════════════════════════════════════════════════════
        # Step 9 · 推导补充：E_l = -dV/dl 分量形式
        # ══════════════════════════════════════════════════════════
        deriv_lbl = Text("推导：任意方向分量 El", font=CJK, color=BLUE).scale(0.50)
        deriv_lbl.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(deriv_lbl))

        d1 = MathTex(r"\mathrm{d}V = -\mathbf{E}\cdot\mathrm{d}\mathbf{l} = -E_l\,\mathrm{d}l",
                      color=WHITE).scale(0.80)
        d2 = MathTex(r"E_l = -\frac{\mathrm{d}V}{\mathrm{d}l}",
                      color=YELLOW).scale(0.88)
        d3 = MathTex(r"E_n = -\frac{\partial V}{\partial n}\quad(\text{normal direction})",
                      color=GREEN).scale(0.78)
        d_grp = VGroup(d1, d2, d3).arrange(DOWN, buff=0.42).next_to(deriv_lbl, DOWN, buff=0.42)
        d_grp.scale_to_fit_width(11.0)
        self.play(Write(d1)); self.wait(1.0)
        self.play(Write(d2)); self.wait(1.0)
        self.play(Write(d3)); self.wait(1.2)

        note9 = Text("沿法向（等势面垂直方向）分量最大，即场强就是负梯度",
                     font=CJK, color=RED).scale(0.42)
        note9.next_to(d_grp, DOWN, buff=0.32)
        self.play(FadeIn(note9))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_lbl, d_grp, note9)))

        # ══════════════════════════════════════════════════════════
        # Step 10 · 小结卡（关键公式 + 方框）
        # ══════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.50)

        s1 = MathTex(r"\mathbf{E} = -\,\mathrm{grad}\,V = -\nabla V",
                      color=YELLOW).scale(0.82)
        s2 = MathTex(r"E_n = -\frac{\partial V}{\partial n}",
                      color=YELLOW).scale(0.82)
        s3 = MathTex(r"U_{ab}=V_a-V_b=\int_a^b \mathbf{E}\cdot\mathrm{d}\mathbf{l}",
                      color=YELLOW).scale(0.76)
        s4_zh = Text("等势面越密 → 场强越大；场强方向 = 负梯度方向",
                     font=CJK, color=GREEN).scale(0.44)

        s_grp = VGroup(s1, s2, s3, s4_zh).arrange(DOWN, buff=0.38).next_to(s_title, DOWN, buff=0.38)
        s_grp.scale_to_fit_width(11.5)
        box = SurroundingRectangle(s_grp, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1)); self.wait(0.6)
        self.play(Write(s2)); self.wait(0.6)
        self.play(Write(s3)); self.wait(0.6)
        self.play(FadeIn(s4_zh), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s_grp, box, title)))
        self.wait(0.3)
