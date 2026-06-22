"""第 8.4 节 · 安培力与载流线圈磁力矩（矢量受力 + ValueTracker 角度扫动）。

分三大步：
  ① 矩形电流线圈在均匀磁场中受力分析（哪两边力相消、哪两边产生力偶）；
  ② 定义磁矩 pm=NIS，用 ValueTracker 旋转线圈，实时显示力矩曲线 M=NISB sinφ；
  ③ 线圈从 φ=90° 在力矩驱动下旋转到 φ=0° 稳定平衡，同步势能 U=-pm·B 曲线。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch08Kp3AmpereForceCurrentLoopTorque(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("安培力与载流线圈磁力矩", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.4", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("电动机的核心——线圈在磁场里转动——", font=CJK).scale(0.50)
        ana2 = Text("靠的正是安培力对两条平行边形成的「力偶」。", font=CJK).scale(0.50)
        ana3 = Text("理解磁力矩，就能读懂一切电机的工作原理。", font=CJK, color=GREEN).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 受力分析——矩形线圈俯视图（平面布局模拟正交投影）
        # ══════════════════════════════════════════════════════════════════
        sec_label = Text("① 载流矩形线圈在均匀磁场中的受力", font=CJK, color=YELLOW).scale(0.46)
        sec_label.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(sec_label))
        self.wait(0.5)

        # 磁场箭头背景（B 沿 x 方向，水平向右）
        b_arrows = VGroup(*[
            Arrow(
                start=np.array([-5.5 + i * 1.3, y, 0]),
                end=np.array([-5.5 + i * 1.3 + 1.0, y, 0]),
                buff=0, color=CYAN, stroke_width=2,
                max_tip_length_to_length_ratio=0.25,
            )
            for y in [-1.0, 0.0, 1.0]
            for i in range(9)
        ])
        b_label = VGroup(
            MathTex(r"\vec{B}", color=CYAN).scale(0.65),
            Text("（水平向右）", font=CJK, color=CYAN).scale(0.38),
        ).arrange(RIGHT, buff=0.15).to_corner(UR, buff=0.6)
        self.play(FadeIn(b_arrows), FadeIn(b_label))
        self.wait(0.6)

        # 矩形线圈：以坐标系原点为中心，线圈平面与 B 成 φ=90° (正交)
        # 俯视视角：线圈宽 l1 水平，高 l2 垂直
        l1, l2 = 2.8, 1.8   # 宽 × 高（屏幕单位）
        cx, cy = 0.0, -0.5   # 线圈中心（向下偏移给磁场空间）

        left   = cx - l1 / 2
        right  = cx + l1 / 2
        top    = cy + l2 / 2
        bot    = cy - l2 / 2

        # 四条边
        side_top    = Line([left, top, 0],  [right, top, 0],  color=WHITE, stroke_width=3)
        side_bot    = Line([right, bot, 0], [left, bot, 0],   color=WHITE, stroke_width=3)
        side_left   = Line([left, bot, 0],  [left, top, 0],   color=ORANGE, stroke_width=4)
        side_right  = Line([right, top, 0], [right, bot, 0],  color=ORANGE, stroke_width=4)

        # 电流方向小箭头（沿导线中点）
        def mid_arrow(p1, p2, col=WHITE):
            mid = (np.array(p1) + np.array(p2)) / 2
            d = (np.array(p2) - np.array(p1))
            d = d / np.linalg.norm(d) * 0.35
            return Arrow(mid - d, mid + d, buff=0, color=col,
                         stroke_width=2, max_tip_length_to_length_ratio=0.5)

        cur_top   = mid_arrow([left, top, 0],  [right, top, 0], WHITE)
        cur_bot   = mid_arrow([right, bot, 0], [left, bot, 0],  WHITE)
        cur_left  = mid_arrow([left, bot, 0],  [left, top, 0],  ORANGE)
        cur_right = mid_arrow([right, top, 0], [right, bot, 0], ORANGE)

        coil = VGroup(side_top, side_bot, side_left, side_right,
                      cur_top, cur_bot, cur_left, cur_right)
        self.play(Create(VGroup(side_top, side_bot, side_left, side_right)))
        self.play(FadeIn(VGroup(cur_top, cur_bot, cur_left, cur_right)))
        self.wait(0.6)

        # 受力分析（面对线圈，B 在纸面内水平向右）：
        #   橙色竖直边 电流 ⊥ B → 安培力垂直纸面：左边进入纸面 ⊗、右边穿出纸面 ⊙，
        #   等大反向且不共线 → 力偶，使线圈绕竖直轴转动。
        #   （竖直导线不可能受到纸面内的竖直力，故用 ⊗/⊙ 表示垂直纸面方向。）
        F_left_sym  = MathTex(r"\otimes", color=RED).scale(0.7).move_to([left, cy, 0])
        F_right_sym = MathTex(r"\odot",  color=RED).scale(0.7).move_to([right, cy, 0])
        F_left_tag  = Text("F 进入纸面", font=CJK, color=RED).scale(0.34).next_to(F_left_sym, LEFT, buff=0.15)
        F_right_tag = Text("F 穿出纸面", font=CJK, color=RED).scale(0.34).next_to(F_right_sym, RIGHT, buff=0.15)

        self.play(FadeIn(F_left_sym), FadeIn(F_right_sym),
                  FadeIn(F_left_tag), FadeIn(F_right_tag))
        f_couple_note = Text("橙色边（电流⊥B）：受力一进一出纸面 → 力偶使线圈转动",
                             font=CJK, color=RED).scale(0.40)
        f_couple_note.next_to(coil, DOWN, buff=0.5)
        self.play(FadeIn(f_couple_note))
        self.wait(0.8)

        f_cancel_note = Text("白色边（电流∥B）：dF = I dl × B = 0，不受力",
                             font=CJK, color=YELLOW).scale(0.40)
        f_cancel_note.next_to(f_couple_note, DOWN, buff=0.22)
        self.play(FadeIn(f_cancel_note))
        self.wait(1.4)

        # 安培力公式
        ampere_eq = MathTex(r"\mathrm{d}\mathbf{F}=I\,\mathrm{d}\mathbf{l}\times\mathbf{B}",
                            color=YELLOW).scale(0.75)
        ampere_eq.next_to(f_cancel_note, DOWN, buff=0.3)
        self.play(Write(ampere_eq))
        self.wait(1.5)

        step1_all = VGroup(sec_label, b_arrows, b_label, coil,
                           F_left_sym, F_right_sym, F_left_tag, F_right_tag,
                           f_couple_note, f_cancel_note, ampere_eq)
        self.play(FadeOut(step1_all))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 定义磁矩 pm = NIS n̂（逐步）
        # ══════════════════════════════════════════════════════════════════
        sec2 = Text("② 磁矩定义与力矩公式", font=CJK, color=YELLOW).scale(0.46)
        sec2.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(sec2))

        pm_def_zh = Text("磁矩 = 匝数 × 电流 × 面积 × 法向单位矢量", font=CJK).scale(0.46)
        pm_def_zh.next_to(sec2, DOWN, buff=0.5)
        pm_def = MathTex(r"\mathbf{p}_m", r"=", r"N", r"I", r"S", r"\hat{\mathbf{n}}")
        pm_def.scale(0.95).next_to(pm_def_zh, DOWN, buff=0.35)
        pm_def[0].set_color(YELLOW)
        pm_def[2].set_color(ORANGE)
        pm_def[3].set_color(CYAN)
        pm_def[5].set_color(GREEN)

        rhr_note = Text("方向：右手定则（四指沿电流，拇指指向 n̂）", font=CJK, color=GREEN).scale(0.43)
        rhr_note.next_to(pm_def, DOWN, buff=0.35)

        self.play(FadeIn(pm_def_zh))
        self.wait(0.5)
        self.play(Write(pm_def))
        self.wait(0.8)
        self.play(FadeIn(rhr_note))
        self.wait(1.0)

        # 力矩公式推导
        torque_step1 = MathTex(r"\mathbf{M}", r"=", r"\mathbf{p}_m", r"\times", r"\mathbf{B}")
        torque_step1.scale(0.9).next_to(rhr_note, DOWN, buff=0.45)
        torque_step1[0].set_color(RED)
        torque_step1[2].set_color(YELLOW)
        torque_step1[4].set_color(CYAN)

        torque_step2 = MathTex(r"M", r"=", r"N", r"I", r"S", r"B",
                               r"\sin\varphi").scale(0.9)
        torque_step2.next_to(torque_step1, DOWN, buff=0.32)
        torque_step2[0].set_color(RED)
        torque_step2[6].set_color(ORANGE)

        phi_note = VGroup(
            Text("φ 为磁矩方向与 B 的夹角", font=CJK, color=ORANGE).scale(0.41),
        ).next_to(torque_step2, DOWN, buff=0.28)

        self.play(Write(torque_step1))
        self.wait(0.8)
        self.play(TransformMatchingTex(torque_step1.copy(), torque_step2))
        self.wait(0.6)
        self.play(FadeIn(phi_note))
        self.wait(1.5)

        step2_group = VGroup(sec2, pm_def_zh, pm_def, rhr_note,
                             torque_step1, torque_step2, phi_note)
        self.play(FadeOut(step2_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker φ 扫动 → 力矩 M 曲线实时变化
        # ══════════════════════════════════════════════════════════════════
        sec3 = Text("② 力矩随角度变化（M = NISB sinφ）", font=CJK, color=YELLOW).scale(0.44)
        sec3.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(sec3))

        # 左侧：线圈示意图（侧视图，线圈绕转轴旋转）
        # 用两个小矩形端面 + 法向矢量表示不同 φ 角
        phi_tracker = ValueTracker(math.pi / 2)   # 从 90° 开始

        coil_cx, coil_cy = -3.2, -0.8
        coil_w, coil_h = 0.2, 1.6   # 侧视图：线圈很"薄"

        def make_coil_side():
            phi = phi_tracker.get_value()
            # 线圈法向矢量与 B 夹角为 phi，线圈平面法向在 xy 平面旋转
            # 侧视图中线圈平面投影为一条线，端点坐标：
            half = coil_h / 2
            nx = math.cos(phi)    # 法向 x 分量
            ny = math.sin(phi)    # 法向 y 分量
            # 线圈在侧视图中沿垂直于法向的方向展开
            tx = -ny * half
            ty =  nx * half
            p1 = np.array([coil_cx + tx, coil_cy + ty, 0])
            p2 = np.array([coil_cx - tx, coil_cy - ty, 0])
            coil_line = Line(p1, p2, color=WHITE, stroke_width=5)
            return coil_line

        def make_pm_arrow():
            phi = phi_tracker.get_value()
            nx = math.cos(phi) * 1.0
            ny = math.sin(phi) * 1.0
            center = np.array([coil_cx, coil_cy, 0])
            return Arrow(center, center + np.array([nx, ny, 0]),
                         buff=0, color=YELLOW, stroke_width=3,
                         max_tip_length_to_length_ratio=0.25)

        def make_phi_arc():
            phi = phi_tracker.get_value()
            if abs(phi) < 0.05:
                return VMobject()
            return Arc(radius=0.55, start_angle=0, angle=phi,
                       arc_center=np.array([coil_cx, coil_cy, 0]),
                       color=ORANGE, stroke_width=2)

        def make_phi_label():
            phi = phi_tracker.get_value()
            ang_mid = phi / 2
            pos = np.array([coil_cx + 0.78 * math.cos(ang_mid),
                            coil_cy + 0.78 * math.sin(ang_mid), 0])
            return MathTex(r"\varphi", color=ORANGE).scale(0.55).move_to(pos)

        coil_side  = always_redraw(make_coil_side)
        pm_arrow   = always_redraw(make_pm_arrow)
        phi_arc    = always_redraw(make_phi_arc)
        phi_label  = always_redraw(make_phi_label)

        # B 箭头（水平向右，固定）
        b_arr_side = Arrow(
            np.array([coil_cx - 0.1, coil_cy, 0]),
            np.array([coil_cx + 1.4, coil_cy, 0]),
            buff=0, color=CYAN, stroke_width=3,
            max_tip_length_to_length_ratio=0.2,
        )
        b_lbl_side = MathTex(r"\vec{B}", color=CYAN).scale(0.55)
        b_lbl_side.next_to(b_arr_side, UP, buff=0.12)

        pm_lbl = MathTex(r"\mathbf{p}_m", color=YELLOW).scale(0.50)
        pm_lbl.add_updater(lambda m: m.next_to(pm_arrow.get_end(), UP, buff=0.1))

        rotation_cap = Text("侧视图：线圈法向 pm 与 B 的夹角为 φ", font=CJK, color=WHITE).scale(0.40)
        rotation_cap.next_to(title, DOWN, buff=0.90).shift(LEFT * 2.8)

        self.play(FadeIn(b_arr_side), FadeIn(b_lbl_side),
                  Create(coil_side), FadeIn(pm_arrow),
                  FadeIn(phi_arc), FadeIn(phi_label), FadeIn(pm_lbl),
                  FadeIn(rotation_cap))
        self.wait(0.5)

        # 右侧：力矩曲线 M = sinφ
        m_axes = Axes(
            x_range=[0, math.pi, math.pi / 4],
            y_range=[-0.2, 1.3, 0.5],
            x_length=5.0,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 2},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        ).shift(RIGHT * 2.5 + DOWN * 0.7)

        # 坐标轴标签
        x_lbl_m = MathTex(r"\varphi").scale(0.55).next_to(m_axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_lbl_m = MathTex(r"M").scale(0.55).next_to(m_axes.y_axis.get_end(), UP, buff=0.1)
        x_tick_0   = MathTex(r"0").scale(0.45).next_to(m_axes.c2p(0, 0), DOWN, buff=0.18)
        x_tick_pi2 = MathTex(r"\pi/2").scale(0.45).next_to(m_axes.c2p(math.pi / 2, 0), DOWN, buff=0.18)
        x_tick_pi  = MathTex(r"\pi").scale(0.45).next_to(m_axes.c2p(math.pi, 0), DOWN, buff=0.18)

        m_curve = m_axes.plot(lambda x: math.sin(x), x_range=[0, math.pi], color=RED)

        self.play(Create(m_axes), FadeIn(x_lbl_m), FadeIn(y_lbl_m),
                  FadeIn(x_tick_0), FadeIn(x_tick_pi2), FadeIn(x_tick_pi))
        self.play(Create(m_curve), run_time=1.5)

        # 动点 + 竖线指示当前 φ 对应的 M 值
        def make_m_dot():
            phi = phi_tracker.get_value()
            m_val = math.sin(phi)
            return Dot(m_axes.c2p(phi, m_val), color=RED, radius=0.11)

        def make_m_vline():
            phi = phi_tracker.get_value()
            m_val = math.sin(phi)
            return DashedLine(
                m_axes.c2p(phi, 0),
                m_axes.c2p(phi, m_val),
                color=ORANGE, stroke_width=2,
            )

        m_dot   = always_redraw(make_m_dot)
        m_vline = always_redraw(make_m_vline)

        m_eq_display = always_redraw(lambda: VGroup(
            MathTex(rf"M = NISB\sin({phi_tracker.get_value():.2f})", color=RED).scale(0.48),
        ).next_to(m_axes, DOWN, buff=0.25))

        self.play(FadeIn(m_dot), FadeIn(m_vline), FadeIn(m_eq_display))
        self.wait(0.5)

        # 扫动 φ 从 π/2 → 0 → π（演示 M 曲线）
        self.play(phi_tracker.animate.set_value(0.0), run_time=2.5, rate_func=linear)
        self.wait(0.5)
        self.play(phi_tracker.animate.set_value(math.pi), run_time=3.5, rate_func=linear)
        self.wait(0.5)
        self.play(phi_tracker.animate.set_value(math.pi / 2), run_time=1.8, rate_func=linear)

        max_note = Text("φ=90° 时力矩最大；φ=0° 或 180° 时力矩为零", font=CJK, color=GREEN).scale(0.40)
        max_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(max_note))
        self.wait(1.8)

        step3_all = VGroup(sec3, b_arr_side, b_lbl_side, coil_side, pm_arrow,
                           phi_arc, phi_label, pm_lbl, rotation_cap,
                           m_axes, x_lbl_m, y_lbl_m, x_tick_0, x_tick_pi2, x_tick_pi,
                           m_curve, m_dot, m_vline, m_eq_display, max_note)
        self.play(FadeOut(step3_all))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 势能 U = -pm·B cosφ + 力矩驱动旋转至稳定平衡
        # ══════════════════════════════════════════════════════════════════
        sec4 = Text("③ 势能 U 与稳定平衡（磁矩与 B 同向）", font=CJK, color=YELLOW).scale(0.44)
        sec4.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(sec4))

        u_eq = MathTex(r"U = -\mathbf{p}_m \cdot \mathbf{B} = -p_m B\cos\varphi",
                       color=YELLOW).scale(0.78)
        u_eq.next_to(sec4, DOWN, buff=0.48)
        self.play(Write(u_eq))
        self.wait(1.0)

        u_note1 = VGroup(
            MathTex(r"\varphi=0:", color=GREEN).scale(0.62),
            Text("磁矩与B同向，", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"U_{\min}=-p_mB", color=GREEN).scale(0.62),
            Text("（稳定平衡）", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.15).next_to(u_eq, DOWN, buff=0.35)

        u_note2 = VGroup(
            MathTex(r"\varphi=\pi:", color=RED).scale(0.62),
            Text("磁矩与B反向，", font=CJK, color=RED).scale(0.44),
            MathTex(r"U_{\max}=+p_mB", color=RED).scale(0.62),
            Text("（不稳定平衡）", font=CJK, color=RED).scale(0.44),
        ).arrange(RIGHT, buff=0.15).next_to(u_note1, DOWN, buff=0.25)

        self.play(FadeIn(u_note1))
        self.wait(0.7)
        self.play(FadeIn(u_note2))
        self.wait(1.2)

        # ── 双面板：左-线圈旋转 / 右-U 曲线同步 ──────────────────────────
        phi2 = ValueTracker(math.pi / 2)   # 从 90° 出发

        # 左：线圈侧视 + 磁矩箭头
        lx, ly = -3.2, -1.5
        def make_coil2():
            phi = phi2.get_value()
            half = 0.9
            tx = -math.sin(phi) * half
            ty =  math.cos(phi) * half
            p1 = np.array([lx + tx, ly + ty, 0])
            p2 = np.array([lx - tx, ly - ty, 0])
            return Line(p1, p2, color=WHITE, stroke_width=5)

        def make_pm2():
            phi = phi2.get_value()
            center = np.array([lx, ly, 0])
            return Arrow(center,
                         center + np.array([math.cos(phi), math.sin(phi), 0]) * 1.05,
                         buff=0, color=YELLOW, stroke_width=3,
                         max_tip_length_to_length_ratio=0.22)

        b_arr2 = Arrow(np.array([lx - 0.2, ly, 0]), np.array([lx + 1.5, ly, 0]),
                       buff=0, color=CYAN, stroke_width=3,
                       max_tip_length_to_length_ratio=0.18)
        b_lbl2 = MathTex(r"\vec{B}", color=CYAN).scale(0.50).next_to(b_arr2, UP, buff=0.1)
        pm_lbl2 = MathTex(r"\mathbf{p}_m", color=YELLOW).scale(0.48)

        coil2 = always_redraw(make_coil2)
        pm_arr2 = always_redraw(make_pm2)
        pm_lbl2.add_updater(lambda m: m.next_to(pm_arr2.get_end(), UP, buff=0.1))

        eq_label2 = Text("线圈在力矩作用下朝稳定平衡旋转", font=CJK, color=WHITE).scale(0.38)
        eq_label2.next_to(u_note2, DOWN, buff=0.35).shift(LEFT * 2.2)

        # 右：U 曲线
        u_axes = Axes(
            x_range=[0, math.pi, math.pi / 4],
            y_range=[-1.4, 1.4, 0.5],
            x_length=4.5,
            y_length=2.5,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 2},
        ).shift(RIGHT * 2.8 + DOWN * 1.55)

        ux_lbl = MathTex(r"\varphi").scale(0.50).next_to(u_axes.x_axis.get_end(), RIGHT, buff=0.1)
        uy_lbl = MathTex(r"U").scale(0.50).next_to(u_axes.y_axis.get_end(), UP, buff=0.1)
        ux0   = MathTex(r"0").scale(0.40).next_to(u_axes.c2p(0, 0), DOWN, buff=0.15)
        uxpi2 = MathTex(r"\pi/2").scale(0.40).next_to(u_axes.c2p(math.pi / 2, 0), DOWN, buff=0.15)
        uxpi  = MathTex(r"\pi").scale(0.40).next_to(u_axes.c2p(math.pi, 0), DOWN, buff=0.15)

        u_curve = u_axes.plot(lambda x: -math.cos(x), x_range=[0, math.pi], color=YELLOW)

        def make_u_dot():
            phi = phi2.get_value()
            u_val = -math.cos(phi)
            return Dot(u_axes.c2p(phi, u_val), color=YELLOW, radius=0.11)

        def make_u_vline():
            phi = phi2.get_value()
            u_val = -math.cos(phi)
            return DashedLine(
                u_axes.c2p(phi, 0),
                u_axes.c2p(phi, u_val),
                color=ORANGE, stroke_width=2,
            )

        u_dot   = always_redraw(make_u_dot)
        u_vline = always_redraw(make_u_vline)

        self.play(FadeIn(b_arr2), FadeIn(b_lbl2), Create(coil2),
                  FadeIn(pm_arr2), FadeIn(pm_lbl2), FadeIn(eq_label2))
        self.play(Create(u_axes), FadeIn(ux_lbl), FadeIn(uy_lbl),
                  FadeIn(ux0), FadeIn(uxpi2), FadeIn(uxpi))
        self.play(Create(u_curve), run_time=1.2)
        self.play(FadeIn(u_dot), FadeIn(u_vline))
        self.wait(0.5)

        # 从 φ=π/2 缓慢转到 φ=0°（模拟力矩驱动旋转 + 势能减小）
        self.play(phi2.animate.set_value(0.05), run_time=3.5,
                  rate_func=rate_functions.ease_out_cubic)
        self.wait(0.5)

        stable_note = VGroup(
            MathTex(r"\varphi \to 0", color=GREEN).scale(0.65),
            Text("磁矩与B同向，势能最低，稳定平衡", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(stable_note))
        self.wait(1.8)

        step4_all = VGroup(sec4, u_eq, u_note1, u_note2, eq_label2,
                           b_arr2, b_lbl2, coil2, pm_arr2, pm_lbl2,
                           u_axes, ux_lbl, uy_lbl, ux0, uxpi2, uxpi,
                           u_curve, u_dot, u_vline, stable_note)
        self.play(FadeOut(step4_all))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        f1 = MathTex(r"\mathrm{d}\mathbf{F}=I\,\mathrm{d}\mathbf{l}\times\mathbf{B}",
                     color=YELLOW).scale(0.80)
        f2 = MathTex(r"\mathbf{p}_m=NIS\hat{\mathbf{n}}", color=YELLOW).scale(0.80)
        f3 = MathTex(r"\mathbf{M}=\mathbf{p}_m\times\mathbf{B},\quad M=NISB\sin\varphi",
                     color=YELLOW).scale(0.75)
        f4 = MathTex(r"U=-\mathbf{p}_m\cdot\mathbf{B}=-p_mB\cos\varphi",
                     color=YELLOW).scale(0.75)

        c1 = Text("平行B的边受力相消；垂直B的边产生力偶使线圈转动", font=CJK, color=GREEN).scale(0.41)
        c2 = Text("磁矩与B同向时 M=0，U 最低：稳定平衡（电动机工作原理）",
                  font=CJK, color=GREEN).scale(0.41)

        summary = VGroup(f1, f2, f3, f4, c1, c2).arrange(DOWN, buff=0.32)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(Write(f1))
        self.wait(0.4)
        self.play(Write(f2))
        self.wait(0.4)
        self.play(Write(f3))
        self.wait(0.4)
        self.play(Write(f4))
        self.wait(0.6)
        self.play(FadeIn(c1), FadeIn(c2))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch08Kp3AmpereForceCurrentLoopTorque",
        "id": "phys-ch08-8.4-kp3-ampere-force-current-loop-torque",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "安培力与载流线圈磁力矩",
        "description": "从安培力受力分析出发，用 ValueTracker 演示力矩 M=NISB sinφ 随角度变化，"
                       "再同步势能 U=-pm·B 曲线展示线圈旋转至稳定平衡的全过程。",
    },
]
