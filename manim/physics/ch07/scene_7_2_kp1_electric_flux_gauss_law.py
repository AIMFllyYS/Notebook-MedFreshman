"""第 7.2 节 · 电通量与高斯定理（矢量场 + ValueTracker + 闭合曲面计数动画）。

三幕结构：
  幕一：均匀电场中倾斜面 S，ValueTracker 改变夹角 θ，实时演示 Φ=ES cosθ 的变化。
  幕二：点电荷 +q 周围不规则闭合曲面，计数穿入/穿出场线，验证净通量恒定；
        再演示 q 在面外时净通量=0。
  幕三：高斯定理公式，对照表说明内部/外部电荷的作用，矢量分布对比。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp1ElectricFluxGaussLaw(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("电通量与高斯定理", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.2", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("想象阳光穿过窗纱：", font=CJK).scale(0.5)
        ana2 = Text("窗纱正对阳光时，穿过的光最多；斜着则少。", font=CJK).scale(0.5)
        ana3 = Text("「电通量」就是衡量电场线穿过某个面的总数量。", font=CJK, color=YELLOW).scale(0.5)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana_grp))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 定义——电通量（逐步出现）
        # ═══════════════════════════════════════════════════════════════════
        def_label = Text("电通量定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        flux_def1 = MathTex(
            r"\Phi_E", r"=", r"\iint_S", r"\mathbf{E}", r"\cdot", r"\mathrm{d}\mathbf{S}"
        ).scale(0.95)
        flux_def1.next_to(def_label, DOWN, buff=0.4)
        flux_def1[0].set_color(YELLOW)
        flux_def1[3].set_color(ORANGE)
        flux_def1[5].set_color(CYAN)

        flux_def2 = MathTex(r"\mathrm{d}\Phi_E = E\,\mathrm{d}S\cos\theta").scale(0.9)
        flux_def2.next_to(flux_def1, DOWN, buff=0.38)

        note_theta = VGroup(
            Text("其中", font=CJK).scale(0.43),
            MathTex(r"\theta").scale(0.9),
            Text("为电场方向与面法向量的夹角", font=CJK).scale(0.43),
        ).arrange(RIGHT, buff=0.12)
        note_theta.next_to(flux_def2, DOWN, buff=0.3)

        self.play(FadeIn(def_label))
        self.play(Write(flux_def1))
        self.wait(0.8)
        self.play(Write(flux_def2))
        self.wait(0.6)
        self.play(FadeIn(note_theta))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_label, flux_def1, flux_def2, note_theta)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 幕一——均匀电场 + 倾斜平面 + ValueTracker 扫动 θ
        # ═══════════════════════════════════════════════════════════════════
        act1_cap = Text("幕一：均匀电场中倾斜平面的电通量", font=CJK, color=BLUE).scale(0.48)
        act1_cap.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(act1_cap))
        self.wait(0.5)

        # 场景中心偏左
        scene_center = LEFT * 1.8 + DOWN * 0.5

        # 均匀水平电场箭头（固定）
        E_arrows = VGroup()
        for row in range(-2, 3):
            for col in range(-1, 4):
                start = scene_center + RIGHT * (col * 1.0 - 0.3) + UP * (row * 0.8)
                end = start + RIGHT * 0.7
                arr = Arrow(start, end, buff=0, color=ORANGE, stroke_width=2.5,
                            max_tip_length_to_length_ratio=0.3)
                E_arrows.add(arr)
        E_label = MathTex(r"\mathbf{E}", color=ORANGE).scale(0.7)
        E_label.move_to(scene_center + RIGHT * 2.9 + UP * 1.6)

        self.play(Create(E_arrows), Write(E_label))
        self.wait(0.5)

        # ValueTracker：θ（弧度）
        theta = ValueTracker(0.0)

        # 面 S（矩形，绕中点旋转）
        S_CENTER = scene_center + RIGHT * 0.8 + UP * 0.2
        S_W, S_H = 0.08, 1.6  # 非常窄的矩形侧视

        def make_surface():
            ang = theta.get_value()
            rect = Rectangle(width=S_W, height=S_H, fill_color=CYAN,
                             fill_opacity=0.35, color=CYAN, stroke_width=2)
            rect.rotate(ang, about_point=rect.get_center())
            rect.move_to(S_CENTER)
            return rect

        surface = always_redraw(make_surface)

        # 法向量 n（垂直于面，旋转 θ+π/2 相对水平方向）
        def make_normal():
            ang = theta.get_value()
            # 法向量方向：与面法线一致（若 θ 是面与水平的夹角，法线超前 θ+90°）
            n_dir = np.array([math.cos(ang + math.pi / 2),
                              math.sin(ang + math.pi / 2), 0.0])
            start = S_CENTER
            end = start + n_dir * 1.1
            return Arrow(start, end, buff=0, color=GREEN, stroke_width=3,
                         max_tip_length_to_length_ratio=0.25)

        normal_arrow = always_redraw(make_normal)
        n_label = always_redraw(lambda: MathTex(r"\hat{n}", color=GREEN).scale(0.65).move_to(
            S_CENTER + np.array([
                math.cos(theta.get_value() + math.pi / 2),
                math.sin(theta.get_value() + math.pi / 2), 0.0
            ]) * 1.4
        ))

        # θ 弧线标注
        def make_theta_arc():
            ang = theta.get_value()
            # 角度弧：从水平(E方向)到法向量
            arc = Arc(radius=0.45, start_angle=0, angle=ang + math.pi / 2,
                      color=YELLOW, stroke_width=2)
            arc.move_arc_center_to(S_CENTER)
            return arc

        theta_arc = always_redraw(make_theta_arc)

        # θ 角度文字
        theta_label = always_redraw(lambda: VGroup(
            MathTex(r"\theta=", color=YELLOW).scale(0.6),
            MathTex(rf"{math.degrees(theta.get_value()):.0f}^\circ", color=YELLOW).scale(0.6)
        ).arrange(RIGHT, buff=0.06).move_to(S_CENTER + UP * 1.15 + LEFT * 0.5))

        # Φ 实时显示（右侧）
        E_VAL = 1.0
        S_AREA = 2.0
        phi_display = always_redraw(lambda: VGroup(
            MathTex(r"\Phi_E = E S \cos\theta", color=YELLOW).scale(0.65),
            MathTex(
                rf"= {E_VAL:.1f} \times {S_AREA:.1f} \times \cos({math.degrees(theta.get_value()):.0f}^\circ)",
                color=WHITE
            ).scale(0.58),
            MathTex(
                rf"= {E_VAL * S_AREA * math.cos(theta.get_value()):.2f}\ \mathrm{{V\cdot m}}",
                color=GREEN
            ).scale(0.65),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT).to_corner(UR, buff=0.55))

        self.play(Create(surface), Create(normal_arrow), Write(n_label))
        self.play(Create(theta_arc), FadeIn(theta_label))
        self.add(phi_display)
        self.wait(0.5)

        hint1 = Text("改变倾斜角 θ，观察电通量的变化", font=CJK, color=ORANGE).scale(0.42)
        hint1.to_edge(DOWN, buff=0.65)
        self.play(FadeIn(hint1))

        # 扫动 θ：0° → 60° → 90° → 0°
        self.play(theta.animate.set_value(math.radians(60)), run_time=2.2)
        self.wait(0.7)
        self.play(theta.animate.set_value(math.radians(90)), run_time=1.5)
        self.wait(0.5)
        hint_90 = Text("θ=90°时 cos90°=0，通量为零", font=CJK, color=RED).scale(0.42)
        hint_90.next_to(hint1, UP, buff=0.18)
        self.play(FadeIn(hint_90))
        self.wait(0.8)
        self.play(FadeOut(hint_90))
        self.play(theta.animate.set_value(0.0), run_time=1.8)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            E_arrows, E_label, surface, normal_arrow, n_label,
            theta_arc, theta_label, phi_display, act1_cap, hint1
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 幕二——点电荷周围的闭合曲面，计数场线
        # ═══════════════════════════════════════════════════════════════════
        act2_cap = Text("幕二：不管曲面形状，净穿出场线数不变", font=CJK, color=BLUE).scale(0.46)
        act2_cap.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(act2_cap))
        self.wait(0.5)

        # 点电荷 +q
        charge_pos = LEFT * 2.5 + DOWN * 0.4
        charge_dot = Dot(charge_pos, radius=0.22, color=RED)
        charge_lbl = MathTex(r"+q", color=RED).scale(0.75).next_to(charge_dot, UP, buff=0.12)
        self.play(Create(charge_dot), Write(charge_lbl))

        # 辐射状场线（8条）
        field_lines = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            end_pt = charge_pos + d * 2.6
            arr = Arrow(charge_pos + d * 0.25, end_pt, buff=0,
                        color=YELLOW, stroke_width=2,
                        max_tip_length_to_length_ratio=0.22)
            field_lines.add(arr)
        self.play(Create(field_lines))
        self.wait(0.6)

        # 第一个不规则闭合曲面（用 CubicBezier 近似椭圆偏移）
        def make_closed_curve(cx, cy, rx, ry, n=60, wiggle=0.12, seed=42):
            rng = np.random.default_rng(seed)
            pts = []
            for i in range(n):
                ang = i * TAU / n
                r = rx + rng.uniform(-wiggle * rx, wiggle * rx)
                pts.append(np.array([cx + r * math.cos(ang),
                                     cy + ry / rx * r * math.sin(ang), 0.0]))
            pts.append(pts[0])
            return pts

        def pts_to_vmob(pts, color=CYAN, width=2.5, opacity=0.55):
            mob = VMobject(color=color, stroke_width=width, fill_opacity=0)
            mob.set_points_smoothly(pts)
            return mob

        # 曲面 A（包住电荷）
        cA_pts = make_closed_curve(charge_pos[0], charge_pos[1], 1.6, 1.1, seed=7)
        curveA = pts_to_vmob(cA_pts, color=CYAN)
        label_A = Text("曲面 A", font=CJK, color=CYAN).scale(0.4)
        label_A.move_to(charge_pos + RIGHT * 1.8 + UP * 1.0)

        self.play(Create(curveA), FadeIn(label_A))
        self.wait(0.5)

        # 穿出计数文字
        out_count_A = VGroup(
            Text("穿出：8 条", font=CJK, color=GREEN).scale(0.42),
            Text("穿入：0 条", font=CJK, color=RED).scale(0.42),
        ).arrange(DOWN, buff=0.18)
        out_count_A.to_corner(UR, buff=0.55)
        net_A = VGroup(
            Text("净穿出 = 8（正比于 +q）", font=CJK, color=YELLOW).scale(0.42)
        ).next_to(out_count_A, DOWN, buff=0.25)
        self.play(FadeIn(out_count_A))
        self.wait(0.5)
        self.play(FadeIn(net_A))
        self.wait(1.0)

        # 曲面 B（更大的不规则形状，同样包住电荷）
        cB_pts = make_closed_curve(charge_pos[0] + 0.2, charge_pos[1] - 0.1,
                                   2.2, 1.55, seed=13)
        curveB = pts_to_vmob(cB_pts, color=ORANGE)
        label_B = Text("曲面 B（形状不同）", font=CJK, color=ORANGE).scale(0.38)
        label_B.move_to(charge_pos + RIGHT * 2.5 + DOWN * 1.3)

        self.play(FadeOut(VGroup(out_count_A, net_A)))
        self.play(Create(curveB), FadeIn(label_B))
        self.wait(0.5)

        out_count_B = VGroup(
            Text("穿出：8 条（曲面更大，但条数一样！）", font=CJK, color=GREEN).scale(0.4),
            Text("净穿出 = 8  →  与曲面形状无关", font=CJK, color=YELLOW).scale(0.4),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        out_count_B.to_corner(UR, buff=0.55)
        self.play(FadeIn(out_count_B))
        self.wait(1.4)
        self.play(FadeOut(VGroup(out_count_B, curveB, label_B)))

        # 电荷在曲面外的情形
        charge_pos2 = LEFT * 4.2 + DOWN * 0.4
        charge_dot2 = Dot(charge_pos2, radius=0.22, color=RED)
        charge_lbl2 = MathTex(r"+q", color=RED).scale(0.7).next_to(charge_dot2, UP, buff=0.1)

        # 固定的闭合曲面 A（在右侧，不包含电荷）
        cOut_pts = make_closed_curve(charge_pos[0], charge_pos[1], 1.5, 1.05, seed=7)
        curveOut = pts_to_vmob(cOut_pts, color=CYAN)
        label_Out = Text("曲面 A（电荷在面外）", font=CJK, color=CYAN).scale(0.38)
        label_Out.move_to(charge_pos + RIGHT * 1.9 + UP * 1.15)

        self.play(FadeOut(VGroup(curveA, label_A, field_lines, charge_dot, charge_lbl)))
        self.play(Create(charge_dot2), Write(charge_lbl2))

        # 穿过曲面的场线（部分穿入、部分穿出）
        ext_lines = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            p_start = charge_pos2 + d * 0.25
            p_end = charge_pos2 + d * 3.4
            arr = Arrow(p_start, p_end, buff=0, color=YELLOW, stroke_width=2,
                        max_tip_length_to_length_ratio=0.2)
            ext_lines.add(arr)

        self.play(Create(ext_lines))
        self.play(Create(curveOut), FadeIn(label_Out))
        self.wait(0.6)

        out_ext = VGroup(
            Text("穿入曲面：3 条（从外进入）", font=CJK, color=RED).scale(0.42),
            Text("穿出曲面：3 条（从内穿出）", font=CJK, color=GREEN).scale(0.42),
            Text("净穿出 = 0  →  外部电荷对净通量无贡献", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        out_ext.to_corner(UR, buff=0.45)
        self.play(FadeIn(out_ext))
        self.wait(1.6)
        self.play(FadeOut(VGroup(
            act2_cap, charge_dot2, charge_lbl2, ext_lines,
            curveOut, label_Out, out_ext
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: 幕三——高斯定理公式 + 对照表 + 矢量分布对比
        # ═══════════════════════════════════════════════════════════════════
        act3_cap = Text("幕三：高斯定理", font=CJK, color=BLUE).scale(0.52)
        act3_cap.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(act3_cap))
        self.wait(0.4)

        # 高斯定理公式（逐步出现）
        gauss_lhs = MathTex(r"\oint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S}", color=YELLOW).scale(1.0)
        gauss_eq = MathTex(r"=", color=WHITE).scale(1.0)
        gauss_rhs = MathTex(
            r"\frac{1}{\varepsilon_0}\sum_{\mathrm{enc}}q_i", color=GREEN
        ).scale(1.0)
        gauss_formula = VGroup(gauss_lhs, gauss_eq, gauss_rhs).arrange(RIGHT, buff=0.25)
        gauss_formula.next_to(act3_cap, DOWN, buff=0.52)

        self.play(Write(gauss_lhs))
        self.wait(0.5)
        self.play(Write(gauss_eq), Write(gauss_rhs))
        self.wait(1.0)

        # 关键说明文字（右侧注释）
        note_enc = VGroup(
            MathTex(r"\sum_{\mathrm{enc}}q_i", color=GREEN).scale(0.65),
            Text("= 高斯面内所有电荷之和", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        note_eps = VGroup(
            MathTex(r"\varepsilon_0", color=CYAN).scale(0.65),
            Text("= 真空介电常数", font=CJK, color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        notes = VGroup(note_enc, note_eps).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        notes.next_to(gauss_formula, DOWN, buff=0.45)
        self.play(FadeIn(notes))
        self.wait(1.0)

        # 对照表（手动构建，避免 MathTable 编码问题）
        table_title = Text("内部 vs 外部电荷的作用", font=CJK, color=BLUE).scale(0.48)
        table_title.next_to(notes, DOWN, buff=0.5)
        self.play(FadeIn(table_title))

        col_w = 2.8
        row_h = 0.55

        def table_row(left_text, right_text, y_off, lc=WHITE, rc=WHITE):
            lt = Text(left_text, font=CJK, color=lc).scale(0.38)
            rt = Text(right_text, font=CJK, color=rc).scale(0.38)
            lt.move_to(LEFT * (col_w / 2) + DOWN * y_off)
            rt.move_to(RIGHT * (col_w / 2) + DOWN * y_off)
            sep = Line(LEFT * col_w * 0.5 + DOWN * (y_off - row_h * 0.5),
                       RIGHT * col_w * 0.5 + DOWN * (y_off - row_h * 0.5),
                       color=GREY, stroke_width=1)
            return VGroup(lt, rt, sep)

        header = table_row("电荷位置", "对净通量的影响",
                           0.0, lc=BLUE, rc=BLUE)
        row1 = table_row("在高斯面内部", "决定净通量大小",
                         row_h * 1, lc=GREEN, rc=GREEN)
        row2 = table_row("在高斯面外部", "净通量贡献为零",
                         row_h * 2, lc=RED, rc=RED)
        row3 = table_row("外部电荷", "改变面上各点 E，但积分=0",
                         row_h * 3, lc=ORANGE, rc=ORANGE)
        border = Rectangle(width=col_w * 1.08, height=row_h * 3.85,
                           color=BLUE, stroke_width=1.5)

        table_grp = VGroup(header, row1, row2, row3, border)
        table_grp.next_to(table_title, DOWN, buff=0.3)
        # 使 border 居中
        border.move_to(VGroup(header, row1, row2, row3).get_center())

        self.play(FadeIn(header))
        self.play(FadeIn(row1))
        self.play(FadeIn(row2))
        self.play(FadeIn(row3))
        self.play(Create(border))
        self.wait(1.4)

        self.play(FadeOut(VGroup(table_title, table_grp, notes, gauss_formula, act3_cap)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 矢量分布对比——有/无外部电荷时，曲面上 E 不同但积分相同
        # ═══════════════════════════════════════════════════════════════════
        compare_cap = Text("外部电荷改变面上各点 E，但净通量不变", font=CJK, color=BLUE).scale(0.48)
        compare_cap.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(compare_cap))
        self.wait(0.4)

        # 左侧：只有内部电荷 q
        left_center = LEFT * 3.2 + DOWN * 0.6
        # 闭合曲线（圆）
        circ_L = Circle(radius=1.3, color=CYAN, stroke_width=2.5).move_to(left_center)
        qL_dot = Dot(left_center, radius=0.18, color=RED)
        qL_lbl = MathTex(r"+q", color=RED).scale(0.6).next_to(qL_dot, UP * 0.5, buff=0.08)
        lbl_L = Text("无外部电荷", font=CJK, color=CYAN).scale(0.38)
        lbl_L.next_to(circ_L, DOWN, buff=0.2)

        # 均匀辐射场线
        arrows_L = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            arr = Arrow(left_center + d * 0.22, left_center + d * 1.28,
                        buff=0, color=YELLOW, stroke_width=2,
                        max_tip_length_to_length_ratio=0.25)
            arrows_L.add(arr)

        phi_L = VGroup(
            MathTex(r"\oint \mathbf{E}\cdot d\mathbf{S}", color=YELLOW).scale(0.6),
            MathTex(r"=\frac{q}{\varepsilon_0}", color=GREEN).scale(0.6),
        ).arrange(RIGHT, buff=0.08)
        phi_L.next_to(circ_L, UP, buff=0.28)

        # 右侧：内部 q 和外部 q'
        right_center = RIGHT * 2.4 + DOWN * 0.6
        circ_R = Circle(radius=1.3, color=ORANGE, stroke_width=2.5).move_to(right_center)
        qR_dot = Dot(right_center, radius=0.18, color=RED)
        qR_lbl = MathTex(r"+q", color=RED).scale(0.6).next_to(qR_dot, UP * 0.5, buff=0.08)
        # 外部额外电荷
        qExt_pos = right_center + RIGHT * 2.4 + UP * 0.4
        qExt_dot = Dot(qExt_pos, radius=0.15, color=PURPLE)
        qExt_lbl = MathTex(r"+q'", color=PURPLE).scale(0.55).next_to(qExt_dot, UP, buff=0.08)
        lbl_R = Text("有外部电荷 q'", font=CJK, color=ORANGE).scale(0.38)
        lbl_R.next_to(circ_R, DOWN, buff=0.2)

        # 场线（从 q 辐射 + 外部 q' 略微扭曲方向，表示叠加）
        arrows_R = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            d_base = np.array([math.cos(ang), math.sin(ang), 0.0])
            # 加入外部电荷影响（向右偏移一点，模拟叠加效果）
            ext_dir = (qExt_pos - right_center)
            ext_dir = ext_dir / np.linalg.norm(ext_dir) * 0.15
            d_mod = d_base + ext_dir
            d_mod = d_mod / np.linalg.norm(d_mod)
            arr = Arrow(right_center + d_mod * 0.22, right_center + d_mod * 1.28,
                        buff=0, color=YELLOW, stroke_width=2,
                        max_tip_length_to_length_ratio=0.25)
            arrows_R.add(arr)

        phi_R = VGroup(
            MathTex(r"\oint \mathbf{E}\cdot d\mathbf{S}", color=YELLOW).scale(0.6),
            MathTex(r"=\frac{q}{\varepsilon_0}", color=GREEN).scale(0.6),
        ).arrange(RIGHT, buff=0.08)
        phi_R.next_to(circ_R, UP, buff=0.28)

        # 等号标注
        same_label = Text("积分值相同！", font=CJK, color=YELLOW).scale(0.48)
        same_label.move_to(DOWN * 2.5)

        self.play(
            Create(circ_L), Create(qL_dot), Write(qL_lbl), FadeIn(lbl_L),
            Create(circ_R), Create(qR_dot), Write(qR_lbl), FadeIn(lbl_R),
        )
        self.play(Create(arrows_L), Create(arrows_R))
        self.play(Create(qExt_dot), Write(qExt_lbl))
        self.play(Write(phi_L), Write(phi_R))
        self.wait(0.8)
        self.play(FadeIn(same_label))
        self.wait(1.6)

        note_diff = Text("面上各点 E 方向因 q' 而改变（右图箭头偏转），但积分相消 → 净通量只看内部",
                         font=CJK, color=ORANGE).scale(0.36)
        note_diff.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(note_diff))
        self.wait(1.6)

        self.play(FadeOut(VGroup(
            compare_cap,
            circ_L, qL_dot, qL_lbl, lbl_L, arrows_L, phi_L,
            circ_R, qR_dot, qR_lbl, lbl_R, arrows_R, phi_R,
            qExt_dot, qExt_lbl,
            same_label, note_diff,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("电通量：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"\Phi_E = \iint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S}=ES\cos\theta",
                    color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.18)

        s2 = VGroup(
            Text("高斯定理：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"\oint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S}=\frac{1}{\varepsilon_0}\sum_{\mathrm{enc}}q_i",
                    color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.18)

        s3 = Text("净通量只由高斯面内部电荷决定，外部电荷贡献为零",
                  font=CJK, color=GREEN).scale(0.42)
        s4 = Text("高斯定理是麦克斯韦方程组（静电）的核心之一",
                  font=CJK, color=CYAN).scale(0.42)

        summary_grp = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.36, aligned_edge=LEFT)
        summary_grp.next_to(s_title, DOWN, buff=0.45)
        summary_grp.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_grp, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.0)

        self.play(FadeOut(VGroup(s_title, summary_grp, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch07Kp1ElectricFluxGaussLaw",
        "id": "phys-ch07-7.2-kp1-electric-flux-gauss-law",
        "chapterId": "ch07",
        "sectionId": "7.2",
        "title": "电通量与高斯定理",
        "description": "用 ValueTracker 动态演示面倾角对电通量的影响，再以场线计数动画揭示高斯定理的核心——净通量只取决于闭合面内部电荷总量。",
    },
]
