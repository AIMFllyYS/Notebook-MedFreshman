"""第 8.1 节 · 磁感应强度方向与右手定则（矢量场 / 叉积 + ValueTracker 扫动范式）。

四步布局：
  ① 洛伦兹力 F=qv×B 的定义与几何意义（叉积方向可视化）
  ② ValueTracker 扫动夹角 θ，实时演示 F=qvBsinθ 的大小变化
  ③ 载流直导线产生磁场——电流方向与同心圆磁场方向（右手大拇指规则）
  ④ 总结卡：三个矢量关系汇总

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch08Kp3MagneticFieldRightHandRule(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════
        # Step 1：标题
        # ══════════════════════════════════════════════════════════════
        title = Text("磁感应强度方向与右手定则", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2：生活类比
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("指南针总是指向北方——这是因为地球磁场对指针施加了力。", font=CJK).scale(0.46)
        ana2 = Text("运动电荷在磁场中同样受力，方向由「右手定则」决定。", font=CJK).scale(0.46)
        ana3 = Text("今天我们用矢量叉积彻底理解这个方向关系。", font=CJK, color=CYAN).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════
        # Step 3：洛伦兹力定义（逐步出现 + 高亮）
        # ══════════════════════════════════════════════════════════════
        def_label = Text("洛伦兹力：运动电荷在磁场中受到的力", font=CJK).scale(0.48)
        def_label.next_to(title, DOWN, buff=0.5)

        lorentz = MathTex(r"\vec{F}", r"=", r"q", r"\vec{v}", r"\times", r"\vec{B}").scale(1.1)
        lorentz.next_to(def_label, DOWN, buff=0.38)
        lorentz[0].set_color(GREEN)
        lorentz[3].set_color(BLUE)
        lorentz[5].set_color(RED)

        b_def = MathTex(r"B = \frac{F_{\max}}{qv}").scale(0.9)
        b_def.next_to(lorentz, DOWN, buff=0.38)
        b_def.set_color(YELLOW)

        note_f = Text("F：洛伦兹力（绿）    v：速度（蓝）    B：磁感应强度（红）",
                      font=CJK, color=WHITE).scale(0.38)
        note_f.next_to(b_def, DOWN, buff=0.32)

        self.play(FadeIn(def_label))
        self.wait(0.4)
        self.play(Write(lorentz))
        self.wait(1.0)
        self.play(Write(b_def))
        self.wait(0.8)
        self.play(FadeIn(note_f))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_label, lorentz, b_def, note_f)))

        # ══════════════════════════════════════════════════════════════
        # Step 4：叉积方向几何可视化（v × B = F 右手判定）
        # ══════════════════════════════════════════════════════════════
        geo_label = Text("叉积几何：v × B 的方向", font=CJK, color=BLUE).scale(0.5)
        geo_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(geo_label))

        origin = np.array([0.0, -0.5, 0.0])

        # v 方向：右上角 45°
        v_dir = np.array([math.cos(math.radians(30)), math.sin(math.radians(30)), 0.0])
        # B 方向：水平向右
        b_dir = np.array([1.0, 0.0, 0.0])
        # F = v × B 方向（2D 中用 z 分量表示方向，这里显示为垂直于平面，用⊙表示朝外）
        # 实际 v×B: (cos30, sin30, 0) × (1, 0, 0) = (0·0-0·0, 0·1-cos30·0, cos30·0-sin30·1)
        #         = (0, 0, -sin30) → 指向纸面内（⊗），但为了演示清晰，我们用平面内夹角
        # 我们改用 v 向右，B 向上，F = v×B 指向屏幕外 → 用 "⊙" 符号表示

        # 重新规划：v 右方向，B 上方向，F 出纸面（⊙）
        v_vec = Arrow(origin, origin + np.array([2.0, 0.0, 0.0]),
                      buff=0, color=BLUE, stroke_width=5, max_tip_length_to_length_ratio=0.2)
        b_vec = Arrow(origin, origin + np.array([0.0, 2.0, 0.0]),
                      buff=0, color=RED, stroke_width=5, max_tip_length_to_length_ratio=0.2)

        v_lbl = MathTex(r"\vec{v}", color=BLUE).scale(0.8).next_to(v_vec.get_end(), DOWN, buff=0.12)
        b_lbl = MathTex(r"\vec{B}", color=RED).scale(0.8).next_to(b_vec.get_end(), LEFT, buff=0.12)

        # F 方向：v × B 在 v=x, B=y 时 = x×y = z（出纸面），用 ⊙ 圆点表示
        f_circle = Circle(radius=0.22, color=GREEN, stroke_width=4).move_to(origin)
        f_dot = Dot(origin, radius=0.07, color=GREEN)
        f_lbl = MathTex(r"\vec{F}=q\vec{v}\times\vec{B}", color=GREEN).scale(0.65)
        f_lbl.next_to(f_circle, RIGHT, buff=0.25)
        f_out_txt = Text("出纸面", font=CJK, color=GREEN).scale(0.38)
        f_out_txt.next_to(f_circle, DOWN, buff=0.18)

        self.play(GrowArrow(v_vec), FadeIn(v_lbl))
        self.wait(0.5)
        self.play(GrowArrow(b_vec), FadeIn(b_lbl))
        self.wait(0.5)
        self.play(Create(f_circle), FadeIn(f_dot), FadeIn(f_lbl), FadeIn(f_out_txt))
        self.wait(0.8)

        # 右手演示：用弯曲箭头模拟右手四指从 v 弯向 B，大拇指指向 F
        rh_desc1 = Text("右手四指从 v 弯向 B，大拇指所指即为 F 方向", font=CJK, color=YELLOW).scale(0.42)
        rh_desc1.to_edge(DOWN, buff=0.8)

        # 用弧形箭头表示从 v 转向 B
        arc_arrow = ArcBetweenPoints(
            origin + np.array([1.8, 0.0, 0.0]),
            origin + np.array([0.0, 1.8, 0.0]),
            angle=-TAU / 4,
            color=YELLOW,
            stroke_width=4,
        )
        arc_arrow.add_tip(tip_length=0.2)

        self.play(FadeIn(rh_desc1))
        self.play(Create(arc_arrow))
        self.wait(1.6)

        geo_group = VGroup(v_vec, b_vec, v_lbl, b_lbl, f_circle, f_dot,
                           f_lbl, f_out_txt, arc_arrow, rh_desc1, geo_label)
        self.play(FadeOut(geo_group))

        # ══════════════════════════════════════════════════════════════
        # Step 5：ValueTracker 扫动夹角 θ，演示 F = qvBsinθ
        # ══════════════════════════════════════════════════════════════
        track_label = Text("夹角 θ 变化 → 洛伦兹力大小变化", font=CJK, color=BLUE).scale(0.5)
        track_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(track_label))

        theta = ValueTracker(math.pi / 2)  # 从 90° 开始
        origin2 = np.array([-0.5, -0.8, 0.0])
        B_LEN = 2.2   # B 箭头固定长度
        V_LEN = 2.0   # v 箭头固定长度
        MAX_F = 1.8   # sinθ=1 时 F 的显示长度

        # B 固定向右
        b_fixed = Arrow(origin2, origin2 + np.array([B_LEN, 0.0, 0.0]),
                        buff=0, color=RED, stroke_width=5, max_tip_length_to_length_ratio=0.2)
        b_fixed_lbl = MathTex(r"\vec{B}", color=RED).scale(0.75).next_to(b_fixed.get_end(), DOWN, buff=0.12)

        # v 随 θ 变化
        def make_v_arrow():
            ang = theta.get_value()
            end = origin2 + np.array([V_LEN * math.cos(ang), V_LEN * math.sin(ang), 0.0])
            return Arrow(origin2, end, buff=0, color=BLUE,
                         stroke_width=5, max_tip_length_to_length_ratio=0.2)

        def make_v_lbl():
            ang = theta.get_value()
            end = origin2 + np.array([V_LEN * math.cos(ang), V_LEN * math.sin(ang), 0.0])
            return MathTex(r"\vec{v}", color=BLUE).scale(0.75).next_to(
                end, UP if math.sin(ang) >= 0 else DOWN, buff=0.12)

        # F 箭头垂直于 v-B 平面（此处显示为屏幕 y 轴方向的线段，长度按 sinθ 缩放）
        def make_f_arrow():
            ang = theta.get_value()
            sin_val = abs(math.sin(ang))
            f_len = MAX_F * sin_val
            # F 方向：在 v(左), B(右水平) 情形下，v×B 指向 z 轴；
            # 为 2D 可见，将 F 沿垂直纸面方向用向上竖直箭头（有正负）表示
            sign = 1.0 if math.sin(ang) >= 0 else -1.0
            end = origin2 + np.array([0.0, sign * f_len, 0.0])
            if f_len < 0.05:
                return VGroup()  # 太短不显示
            return Arrow(origin2, end, buff=0, color=GREEN,
                         stroke_width=5, max_tip_length_to_length_ratio=0.2)

        def make_theta_arc():
            ang = theta.get_value()
            if abs(ang) < 0.05:
                return VGroup()
            return Arc(radius=0.55, start_angle=0, angle=ang,
                       arc_center=origin2, color=YELLOW, stroke_width=3)

        def make_theta_lbl():
            ang = theta.get_value()
            mid_ang = ang / 2
            pos = origin2 + np.array([0.7 * math.cos(mid_ang), 0.7 * math.sin(mid_ang), 0.0])
            return MathTex(r"\theta", color=YELLOW).scale(0.65).move_to(pos)

        def make_f_lbl():
            ang = theta.get_value()
            sin_val = abs(math.sin(ang))
            f_len = MAX_F * sin_val
            sign = 1.0 if math.sin(ang) >= 0 else -1.0
            pos = origin2 + np.array([0.22, sign * (f_len + 0.28), 0.0])
            return MathTex(r"\vec{F}", color=GREEN).scale(0.7).move_to(pos)

        def make_readout():
            ang = theta.get_value()
            deg = math.degrees(ang)
            sin_val = math.sin(ang)
            return MathTex(
                rf"\theta={deg:.0f}^\circ,\quad F=qvB\sin\theta={sin_val:.2f}\,qvB",
                color=CYAN
            ).scale(0.6).to_corner(DR, buff=0.5)

        v_dyn = always_redraw(make_v_arrow)
        v_dyn_lbl = always_redraw(make_v_lbl)
        f_dyn = always_redraw(make_f_arrow)
        theta_arc = always_redraw(make_theta_arc)
        theta_lbl = always_redraw(make_theta_lbl)
        f_dyn_lbl = always_redraw(make_f_lbl)
        readout = always_redraw(make_readout)

        sin_formula = MathTex(r"F = qvB\sin\theta", color=YELLOW).scale(0.85)
        sin_formula.to_corner(UL, buff=0.7).shift(DOWN * 0.6)

        self.play(Create(b_fixed), FadeIn(b_fixed_lbl))
        self.play(Create(v_dyn), FadeIn(v_dyn_lbl))
        self.play(Create(f_dyn), FadeIn(f_dyn_lbl))
        self.add(theta_arc, theta_lbl, readout)
        self.play(Write(sin_formula))
        self.wait(0.8)

        # 扫动夹角 90° → 0° → 180° → 90°
        self.play(theta.animate.set_value(0.05), run_time=2.0)
        self.wait(0.5)
        self.play(theta.animate.set_value(math.pi), run_time=2.5)
        self.wait(0.5)
        self.play(theta.animate.set_value(math.pi / 2), run_time=1.5)
        self.wait(1.2)

        scan_note = Text("θ=90° 时 F 最大；θ=0° 或 180° 时 F=0（v 平行 B，无力）",
                         font=CJK, color=GREEN).scale(0.40)
        scan_note.to_edge(DOWN, buff=0.6)
        self.play(FadeIn(scan_note))
        self.wait(1.5)

        self.play(FadeOut(VGroup(b_fixed, b_fixed_lbl, v_dyn, v_dyn_lbl,
                                 f_dyn, f_dyn_lbl, theta_arc, theta_lbl,
                                 readout, sin_formula, scan_note, track_label)))

        # ══════════════════════════════════════════════════════════════
        # Step 6：载流直导线产生磁场（同心圆切线箭头）
        # ══════════════════════════════════════════════════════════════
        wire_label = Text("载流导线产生磁场：安培右手定则", font=CJK, color=BLUE).scale(0.5)
        wire_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(wire_label))

        # 导线截面：用小椭圆表示竖直导线截面，电流向上（⊙）
        wire_center = np.array([0.0, -0.3, 0.0])
        wire_circle = Circle(radius=0.28, color=YELLOW, stroke_width=4).move_to(wire_center)
        wire_dot = Dot(wire_center, radius=0.08, color=YELLOW)
        current_arrow = Arrow(wire_center + np.array([0.0, -1.4, 0.0]),
                              wire_center + np.array([0.0, 1.4, 0.0]),
                              buff=0, color=YELLOW, stroke_width=5,
                              max_tip_length_to_length_ratio=0.18)
        current_lbl = MathTex(r"I", color=YELLOW).scale(0.85)
        current_lbl.next_to(current_arrow.get_end(), RIGHT, buff=0.18)

        i_dir_txt = Text("电流 I 向上（⊙）", font=CJK, color=YELLOW).scale(0.42)
        i_dir_txt.to_edge(DOWN, buff=0.9)

        self.play(Create(current_arrow), FadeIn(current_lbl))
        self.play(Create(wire_circle), FadeIn(wire_dot))
        self.play(FadeIn(i_dir_txt))
        self.wait(0.8)

        # 同心圆磁场：逐圈旋转出现，带切线箭头（逆时针）
        field_circles = VGroup()
        field_tangents = VGroup()
        for r in [0.7, 1.2, 1.75]:
            circ = Circle(radius=r, color=RED, stroke_width=2, stroke_opacity=0.6)
            circ.move_to(wire_center)
            field_circles.add(circ)
            # 在各圆上均匀放 6 个切线箭头
            n_arrows = 6
            for k in range(n_arrows):
                ang = k * TAU / n_arrows
                # 切线方向（逆时针）= 角度 + 90°
                tan_ang = ang + math.pi / 2
                pt = wire_center + np.array([r * math.cos(ang), r * math.sin(ang), 0.0])
                d = np.array([math.cos(tan_ang), math.sin(tan_ang), 0.0])
                arr_len = 0.28 + r * 0.08
                arr = Arrow(pt - d * arr_len * 0.35,
                            pt + d * arr_len * 0.65,
                            buff=0, color=RED, stroke_width=3,
                            max_tip_length_to_length_ratio=0.35)
                field_tangents.add(arr)

        self.play(Create(field_circles), run_time=1.5)
        self.play(Create(field_tangents), run_time=1.5)
        self.wait(0.8)

        b_dir_txt = Text("磁场 B 方向：绕导线逆时针（右手大拇指沿 I，四指绕向即 B）",
                         font=CJK, color=RED).scale(0.38)
        b_dir_txt.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(b_dir_txt))
        self.wait(1.8)

        # 右手大拇指规则示意（用弧形箭头绕导线画一圈）
        rh2 = Text("右手大拇指沿电流 I 方向，四指弯曲方向就是 B 的环绕方向",
                   font=CJK, color=YELLOW).scale(0.38)
        rh2.next_to(b_dir_txt, UP, buff=0.22)
        self.play(FadeIn(rh2))
        self.wait(1.8)

        wire_group = VGroup(wire_circle, wire_dot, current_arrow, current_lbl,
                            field_circles, field_tangents, i_dir_txt, b_dir_txt,
                            rh2, wire_label)
        self.play(FadeOut(wire_group))

        # ══════════════════════════════════════════════════════════════
        # Step 7：关键公式再强调——B 的定义与洛伦兹力
        # ══════════════════════════════════════════════════════════════
        key_label = Text("关键公式回顾", font=CJK, color=BLUE).scale(0.5)
        key_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(key_label))

        kf1 = MathTex(r"B = \frac{F_{\max}}{qv}", color=YELLOW).scale(0.95)
        kf1_note = VGroup(
            Text("磁感应强度 B 的大小：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\mathrm{[T]} = \mathrm{N/(A\cdot m)}", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.15)

        kf2 = MathTex(r"F = qvB\sin\theta", color=GREEN).scale(0.95)
        kf2_note = Text("θ：v 与 B 的夹角，θ=90° 时洛伦兹力最大", font=CJK, color=WHITE).scale(0.42)

        kf3 = MathTex(r"\vec{F} = q\vec{v}\times\vec{B}", color=GREEN).scale(0.95)
        kf3_note = Text("矢量叉积形式，方向由右手定则判断", font=CJK, color=WHITE).scale(0.42)

        block1 = VGroup(kf1, kf1_note).arrange(DOWN, buff=0.15)
        block2 = VGroup(kf2, kf2_note).arrange(DOWN, buff=0.12)
        block3 = VGroup(kf3, kf3_note).arrange(DOWN, buff=0.12)
        kf_group = VGroup(block1, block2, block3).arrange(DOWN, buff=0.38)
        kf_group.next_to(key_label, DOWN, buff=0.4)
        kf_group.scale_to_fit_width(11.5)

        self.play(Write(kf1), FadeIn(kf1_note))
        self.wait(0.8)
        self.play(Write(kf2), FadeIn(kf2_note))
        self.wait(0.8)
        self.play(Write(kf3), FadeIn(kf3_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(key_label, kf_group)))

        # ══════════════════════════════════════════════════════════════
        # Step 8：总结卡（小结）
        # ══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = VGroup(
            Text("①", font=CJK, color=YELLOW).scale(0.5),
            MathTex(r"B = F_{\max}/(qv)", color=YELLOW).scale(0.8),
            Text("：B 由最大力定义，单位 T", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.18)

        s2 = VGroup(
            Text("②", font=CJK, color=GREEN).scale(0.5),
            MathTex(r"F = qvB\sin\theta", color=GREEN).scale(0.8),
            Text("：夹角 θ 决定力的大小", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.18)

        s3 = VGroup(
            Text("③", font=CJK, color=RED).scale(0.5),
            MathTex(r"\vec{F}=q\vec{v}\times\vec{B}", color=RED).scale(0.8),
            Text("：叉积+右手定则决定力的方向", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.18)

        s4 = VGroup(
            Text("④", font=CJK, color=CYAN).scale(0.5),
            Text("载流导线：右手大拇指沿 I，四指绕向即 B", font=CJK, color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.18)

        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.4)
        s_group.scale_to_fit_width(12.0)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.28, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.wait(0.5)
        self.play(FadeIn(s2))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch08Kp3MagneticFieldRightHandRule",
        "id": "phys-ch08-8.1-kp3-magnetic-field-right-hand-rule",
        "chapterId": "ch08",
        "sectionId": "8.1",
        "title": "磁感应强度方向与右手定则",
        "description": "通过叉积几何可视化、ValueTracker 扫动夹角 θ 演示洛伦兹力变化，再用同心圆切线箭头展示载流导线磁场，彻底建立右手定则直觉。",
    },
]
