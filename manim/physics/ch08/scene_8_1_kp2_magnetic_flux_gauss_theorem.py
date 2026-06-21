"""第 8.1 节 · 磁通量与磁场高斯定理（矢量场/场线类金标准范本）。

可视化三步走：
  ① 条形磁铁的磁感应线（闭合曲线，N→外→S→内→N）
  ② 任意曲面 S + ValueTracker 改变倾斜角 θ，实时演示 dΦ = B cosθ dS
  ③ 封闭球面：穿入（红/负）与穿出（蓝/正）的磁感应线计数，说明总磁通量为零

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Kp2MagneticFluxGaussTheorem",
        "id": "phys-ch08-8.1-kp2-magnetic-flux-gauss-theorem",
        "chapterId": "ch08",
        "sectionId": "8.1",
        "title": "磁通量与磁场高斯定理",
        "description": "用条形磁铁场线、倾角扫动和封闭球面计数器，直观推导磁通量定义与磁场高斯定理 ∮B·dS=0。",
    },
]


# ─── 工具：绘制椭圆弧（模拟磁感应线段）───────────────────────────────────────
def make_field_line(
    cx: float, cy: float, rx: float, ry: float,
    t_start: float, t_end: float,
    color=WHITE, stroke_width: float = 2.0, n_points: int = 80
) -> VMobject:
    """返回一段椭圆弧 VMobject，用于拼接磁感应线。"""
    pts = []
    for i in range(n_points + 1):
        t = t_start + (t_end - t_start) * i / n_points
        x = cx + rx * math.cos(t)
        y = cy + ry * math.sin(t)
        pts.append([x, y, 0.0])
    obj = VMobject(color=color, stroke_width=stroke_width)
    obj.set_points_smoothly([np.array(p) for p in pts])
    return obj


class Ch08Kp2MagneticFluxGaussTheorem(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════
        title = Text("磁通量与磁场高斯定理", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第八章  稳恒磁场 · 8.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════
        # Step 2  生活类比：磁铁周围的「场线」直觉
        # ══════════════════════════════════════════════════════
        ana1 = Text("把铁粉撒在条形磁铁附近——铁粉会沿固定曲线排列，", font=CJK).scale(0.46)
        ana2 = Text("这些曲线就是磁感应线，它描绘了空间中磁场的方向与强弱。", font=CJK).scale(0.46)
        ana3 = Text("「穿过某个面的磁感应线数目」就是磁通量 Φ 的形象含义。", font=CJK, color=CYAN).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        ana_grp.scale_to_fit_width(13)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana_grp))

        # ══════════════════════════════════════════════════════
        # Step 3  条形磁铁 + 磁感应线动画
        # ══════════════════════════════════════════════════════
        sec3_hint = Text("条形磁铁的磁感应线（闭合曲线）", font=CJK, color=WHITE).scale(0.44)
        sec3_hint.next_to(title, DOWN, buff=0.38)

        # 磁铁本体：N S 两个矩形
        magnet_n = Rectangle(width=1.0, height=0.55, color=RED, fill_opacity=0.85,
                              fill_color=RED).shift(LEFT * 0.5 + DOWN * 0.2)
        magnet_s = Rectangle(width=1.0, height=0.55, color=BLUE_D, fill_opacity=0.85,
                              fill_color=BLUE_D).shift(RIGHT * 0.5 + DOWN * 0.2)
        label_n = Text("N", font=CJK, color=WHITE).scale(0.55).move_to(magnet_n)
        label_s = Text("S", font=CJK, color=WHITE).scale(0.55).move_to(magnet_s)
        magnet = VGroup(magnet_n, magnet_s, label_n, label_s)

        # 磁感应线：外部绕行椭圆弧（N极出 → 弧形绕到 S极入）
        # 内部直线（S→N，穿越磁铁内部）
        line_colors = [YELLOW, ORANGE, GREEN, CYAN, YELLOW_E]
        scale_r = [0.55, 0.95, 1.35, 1.75, 2.15]

        field_lines = VGroup()
        for i, (rx_mult, clr) in enumerate(zip(scale_r, line_colors)):
            rx = rx_mult * 1.3
            ry = rx_mult * 0.75
            # 外部弧：从 N 极 (左) 出发，上半弧到 S 极 (右) 入，再下半弧回来
            arc_top = make_field_line(0, -0.2, rx, ry, math.pi, 0,
                                      color=clr, stroke_width=2.0)
            arc_bot = make_field_line(0, -0.2, rx, ry, 0, -math.pi,
                                      color=clr, stroke_width=2.0)
            field_lines.add(arc_top, arc_bot)

        # 内部水平线（S→N，穿越磁铁）
        inner_line = Line(start=RIGHT * 0.5 + DOWN * 0.2,
                          end=LEFT * 0.5 + DOWN * 0.2,
                          color=WHITE, stroke_width=1.5)

        # 箭头：追踪两条代表性场线的走向
        arrow_top = Arrow(start=[-1.2, 0.55, 0], end=[0.0, 1.2, 0],
                          buff=0, color=ORANGE, stroke_width=3,
                          max_tip_length_to_length_ratio=0.22)
        arrow_right = Arrow(start=[1.0, 0.55, 0], end=[1.0, -0.05, 0],
                            buff=0, color=ORANGE, stroke_width=3,
                            max_tip_length_to_length_ratio=0.22)

        diagram_grp = VGroup(field_lines, inner_line, magnet).shift(DOWN * 0.55)

        self.play(FadeIn(sec3_hint))
        self.play(Create(magnet))
        self.play(Create(field_lines), run_time=2.5)
        self.play(Create(inner_line))
        self.wait(0.5)
        self.play(GrowArrow(arrow_top), GrowArrow(arrow_right))

        direction_note = Text("箭头方向：N极出 → 空间弧形绕行 → S极入（外部）；S→N（内部）",
                              font=CJK, color=ORANGE).scale(0.38).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(direction_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(diagram_grp, arrow_top, arrow_right,
                                 direction_note, sec3_hint)))

        # ══════════════════════════════════════════════════════
        # Step 4  磁通量定义（逐步出现）
        # ══════════════════════════════════════════════════════
        def_title = Text("磁通量的定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)

        def1_zh = Text("面积元 dS 上，磁场 B 与法向量 n 的夹角为 θ，", font=CJK).scale(0.44)
        def1_tex = MathTex(r"d\Phi = B\cos\theta\,\mathrm{d}S = \mathbf{B}\cdot\mathrm{d}\mathbf{S}")
        def1_tex.scale(0.88).set_color(YELLOW)

        def2_zh = Text("对整个曲面 S 积分，得总磁通量：", font=CJK).scale(0.44)
        def2_tex = MathTex(r"\Phi = \iint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S}"
                           r"= \iint_S B\cos\theta\,\mathrm{d}S")
        def2_tex.scale(0.82).set_color(YELLOW)

        def_grp = VGroup(def1_zh, def1_tex, def2_zh, def2_tex).arrange(DOWN, buff=0.35)
        def_grp.next_to(def_title, DOWN, buff=0.42)
        def_grp.scale_to_fit_width(12.5)

        self.play(FadeIn(def_title))
        self.play(FadeIn(def1_zh))
        self.wait(0.6)
        self.play(Write(def1_tex))
        self.wait(1.0)
        self.play(FadeIn(def2_zh))
        self.play(Write(def2_tex))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_title, def_grp)))

        # ══════════════════════════════════════════════════════
        # Step 5  ValueTracker：改变倾角 θ，实时显示 dΦ 变化
        # ══════════════════════════════════════════════════════
        theta_vt = ValueTracker(0.0)   # θ 从 0 扫到 π/2

        B_FIXED = 2.0    # 假设 B = 2 T
        dS_FIXED = 1.0   # 面积元 = 1 m²

        # 固定的 B 矢量箭头（竖直向上）
        b_base = DOWN * 0.8 + LEFT * 0.5
        b_arrow = Arrow(start=b_base, end=b_base + UP * 1.3,
                        buff=0, color=YELLOW, stroke_width=4,
                        max_tip_length_to_length_ratio=0.22)
        b_label = MathTex(r"\mathbf{B}", color=YELLOW).scale(0.65).next_to(b_arrow, LEFT, buff=0.1)

        # 面积元矩形（always_redraw：随θ旋转）
        def make_ds_rect():
            th = theta_vt.get_value()
            # 矩形中心在原点附近
            cx, cy = -0.5, -0.5
            hw, hh = 0.6, 0.04   # 扁矩形模拟面积元
            corners = [
                [cx - hw * math.cos(th) + hh * math.sin(th),
                 cy - hw * math.sin(th) - hh * math.cos(th), 0],
                [cx + hw * math.cos(th) + hh * math.sin(th),
                 cy + hw * math.sin(th) - hh * math.cos(th), 0],
                [cx + hw * math.cos(th) - hh * math.sin(th),
                 cy + hw * math.sin(th) + hh * math.cos(th), 0],
                [cx - hw * math.cos(th) - hh * math.sin(th),
                 cy - hw * math.sin(th) + hh * math.cos(th), 0],
            ]
            rect = Polygon(*[np.array(c) for c in corners],
                           color=GREEN, fill_color=GREEN, fill_opacity=0.55,
                           stroke_width=2.5)
            return rect

        ds_rect = always_redraw(make_ds_rect)

        # 法向量箭头（always_redraw）
        def make_normal():
            th = theta_vt.get_value()
            cx, cy = -0.5, -0.5
            nx = math.sin(th)
            ny = math.cos(th)
            start = np.array([cx, cy, 0])
            end = start + np.array([nx, ny, 0]) * 0.9
            return Arrow(start=start, end=end, buff=0, color=CYAN,
                         stroke_width=3, max_tip_length_to_length_ratio=0.28)

        normal_arr = always_redraw(make_normal)
        n_label = always_redraw(lambda: MathTex(r"\hat{n}", color=CYAN).scale(0.6).move_to(
            np.array([-0.5 + 1.05 * math.sin(theta_vt.get_value()),
                      -0.5 + 1.05 * math.cos(theta_vt.get_value()), 0])
        ))

        # θ 弧度标注
        def make_theta_arc():
            th = theta_vt.get_value()
            if abs(th) < 0.01:
                return VGroup()
            cx, cy = -0.5, -0.5
            arc = Arc(radius=0.45, start_angle=PI / 2 - th, angle=th,
                      arc_center=np.array([cx, cy, 0]),
                      color=ORANGE, stroke_width=2)
            return arc

        theta_arc = always_redraw(make_theta_arc)
        theta_lbl = always_redraw(lambda: MathTex(r"\theta", color=ORANGE).scale(0.55).move_to(
            np.array([-0.5 + 0.62 * math.sin(theta_vt.get_value() / 2),
                      -0.5 + 0.62 * math.cos(theta_vt.get_value() / 2), 0])
        ))

        # 实时数值显示
        def make_flux_readout():
            th = theta_vt.get_value()
            val = B_FIXED * math.cos(th) * dS_FIXED
            th_deg = math.degrees(th)
            return VGroup(
                MathTex(rf"\theta = {th_deg:.0f}^\circ", color=ORANGE).scale(0.60),
                MathTex(rf"\cos\theta = {math.cos(th):.3f}", color=CYAN).scale(0.60),
                MathTex(rf"d\Phi = {val:.3f}\ \mathrm{{Wb}}", color=GREEN).scale(0.65),
            ).arrange(DOWN, buff=0.25, aligned_edge=LEFT).to_corner(UR, buff=0.55)

        flux_readout = always_redraw(make_flux_readout)

        # 面积元高亮框
        ds_label = Text("面积元 dS（高亮绿色矩形）", font=CJK, color=GREEN).scale(0.40)
        ds_label.to_edge(DOWN, buff=0.55)

        sec5_title = Text("改变倾角 θ — 观察 dΦ 的变化", font=CJK, color=BLUE).scale(0.50)
        sec5_title.next_to(title, DOWN, buff=0.38)

        self.play(FadeIn(sec5_title))
        self.play(Create(b_arrow), FadeIn(b_label))
        self.add(ds_rect, normal_arr, n_label, theta_arc, theta_lbl, flux_readout)
        self.play(FadeIn(ds_label))
        self.wait(0.8)

        # θ 从 0 扫到 80°
        self.play(theta_vt.animate.set_value(math.radians(80)), run_time=3.5)
        self.wait(0.8)
        # 回到 0°
        self.play(theta_vt.animate.set_value(0.0), run_time=2.0)
        self.wait(0.5)
        # 到 45°
        self.play(theta_vt.animate.set_value(math.radians(45)), run_time=1.5)
        self.wait(1.2)

        zero_note = Text("θ=90° 时 cosθ=0，磁感线与面平行，磁通量为零！",
                         font=CJK, color=RED).scale(0.40).next_to(ds_label, UP, buff=0.18)
        self.play(theta_vt.animate.set_value(math.radians(90)), run_time=1.5)
        self.play(FadeIn(zero_note))
        self.wait(1.8)

        self.play(FadeOut(VGroup(sec5_title, b_arrow, b_label, ds_label, zero_note,
                                 flux_readout)))
        self.remove(ds_rect, normal_arr, n_label, theta_arc, theta_lbl)

        # ══════════════════════════════════════════════════════
        # Step 6  封闭球面：穿入（红/负） vs 穿出（蓝/正）
        # ══════════════════════════════════════════════════════
        sec6_title = Text("封闭曲面上的磁通量", font=CJK, color=BLUE).scale(0.50)
        sec6_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(sec6_title))

        # 绘制封闭球面（大圆）
        sphere_circle = Circle(radius=1.8, color=WHITE, stroke_width=2.5).shift(DOWN * 0.45)
        sphere_label = Text("封闭曲面 S", font=CJK, color=WHITE).scale(0.40)
        sphere_label.next_to(sphere_circle, RIGHT, buff=0.15)

        # 磁铁（小，放在球面内部）
        mn2 = Rectangle(width=0.55, height=0.30, color=RED,
                        fill_opacity=0.9, fill_color=RED).shift(LEFT * 0.25 + DOWN * 0.45)
        ms2 = Rectangle(width=0.55, height=0.30, color=BLUE_D,
                        fill_opacity=0.9, fill_color=BLUE_D).shift(RIGHT * 0.25 + DOWN * 0.45)
        ln2 = Text("N", font=CJK, color=WHITE).scale(0.38).move_to(mn2)
        ls2 = Text("S", font=CJK, color=WHITE).scale(0.38).move_to(ms2)
        inner_magnet = VGroup(mn2, ms2, ln2, ls2)

        self.play(Create(sphere_circle), FadeIn(sphere_label))
        self.play(Create(inner_magnet))
        self.wait(0.8)

        # 穿出球面的场线（蓝色，从 N 极方向射出）
        out_angles = [60, 90, 120]   # 度数，从上方穿出
        out_arrows = VGroup()
        for ang_deg in out_angles:
            ang = math.radians(ang_deg)
            cx, cy = sphere_circle.get_center()[0], sphere_circle.get_center()[1]
            r = 1.8
            start = np.array([cx + 0.45 * math.cos(ang + math.pi),
                               cy + 0.45 * math.sin(ang + math.pi), 0])
            end = np.array([cx + (r + 0.05) * math.cos(ang),
                            cy + (r + 0.05) * math.sin(ang), 0])
            # 画从 N 极出来穿越球面的箭头
            arr = Arrow(start=start, end=end, buff=0,
                        color=BLUE, stroke_width=3,
                        max_tip_length_to_length_ratio=0.20)
            out_arrows.add(arr)

        # 穿入球面的场线（红色，从 S 极方向射入）
        in_angles = [60, 90, 120]   # 从下方穿入（S 极方向）
        in_arrows = VGroup()
        for ang_deg in in_angles:
            ang = -math.radians(ang_deg)
            cx, cy = sphere_circle.get_center()[0], sphere_circle.get_center()[1]
            r = 1.8
            start = np.array([cx + (r + 0.05) * math.cos(ang),
                               cy + (r + 0.05) * math.sin(ang), 0])
            end = np.array([cx + 0.45 * math.cos(ang + math.pi),
                            cy + 0.45 * math.sin(ang + math.pi), 0])
            arr = Arrow(start=start, end=end, buff=0,
                        color=RED, stroke_width=3,
                        max_tip_length_to_length_ratio=0.20)
            in_arrows.add(arr)

        self.play(Create(out_arrows), run_time=1.5)
        out_note = Text("蓝色：穿出球面（Φ > 0，正）", font=CJK, color=BLUE).scale(0.40)
        out_note.to_corner(UR, buff=0.55)
        self.play(FadeIn(out_note))
        self.wait(0.8)

        self.play(Create(in_arrows), run_time=1.5)
        in_note = Text("红色：穿入球面（Φ < 0，负）", font=CJK, color=RED).scale(0.40)
        in_note.next_to(out_note, DOWN, buff=0.25)
        self.play(FadeIn(in_note))
        self.wait(0.8)

        # ── 计数器动画 ────────────────────────────────────────
        count_out_vt = ValueTracker(0)
        count_in_vt = ValueTracker(0)

        def make_counter():
            n_out = int(count_out_vt.get_value())
            n_in = int(count_in_vt.get_value())
            total = n_out - n_in
            g = VGroup(
                VGroup(
                    Text("穿出条数:", font=CJK, color=BLUE).scale(0.40),
                    MathTex(rf"+{n_out}", color=BLUE).scale(0.65),
                ).arrange(RIGHT, buff=0.12),
                VGroup(
                    Text("穿入条数:", font=CJK, color=RED).scale(0.40),
                    MathTex(rf"-{n_in}", color=RED).scale(0.65),
                ).arrange(RIGHT, buff=0.12),
                VGroup(
                    Text("合计:", font=CJK, color=GREEN if total == 0 else ORANGE).scale(0.40),
                    MathTex(rf"{total:+d}", color=GREEN if total == 0 else ORANGE).scale(0.65),
                ).arrange(RIGHT, buff=0.12),
            ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
            g.to_corner(DL, buff=0.55)
            return g

        counter_display = always_redraw(make_counter)
        self.add(counter_display)
        self.wait(0.3)

        # 穿出数目增加到 3
        self.play(count_out_vt.animate.set_value(3), run_time=1.5)
        self.wait(0.5)
        # 穿入数目增加到 3
        self.play(count_in_vt.animate.set_value(3), run_time=1.5)
        self.wait(1.2)

        equal_note = Text("穿出 = 穿入 —— 无论曲面如何，总磁通量恒为零！",
                          font=CJK, color=GREEN).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(equal_note))
        self.wait(2.0)

        self.play(FadeOut(VGroup(sphere_circle, sphere_label, inner_magnet,
                                 out_arrows, in_arrows, out_note, in_note,
                                 counter_display, equal_note, sec6_title)))

        # ══════════════════════════════════════════════════════
        # Step 7  磁场高斯定理推导（逐步 + 颜色高亮）
        # ══════════════════════════════════════════════════════
        gauss_title = Text("磁场高斯定理", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)

        step_a_zh = Text("穿过任意封闭曲面的净磁通量……", font=CJK).scale(0.44)
        step_a_tex = MathTex(r"\oiint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S}",
                             r"= 0").scale(0.92)
        step_a_tex[0].set_color(CYAN)
        step_a_tex[1].set_color(YELLOW)

        step_b_zh = Text("…恒等于零。", font=CJK).scale(0.44)

        contrast_title = Text("与电场高斯定理对比：", font=CJK, color=WHITE).scale(0.44)
        elec_gauss = MathTex(r"\oiint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S}"
                             r"= \frac{q_{\mathrm{enc}}}{\varepsilon_0}", color=ORANGE).scale(0.80)
        mag_gauss = MathTex(r"\oiint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S} = 0",
                            color=YELLOW).scale(0.80)

        grp_ab = VGroup(step_a_zh, step_a_tex, step_b_zh).arrange(DOWN, buff=0.35)
        grp_ab.next_to(gauss_title, DOWN, buff=0.40)

        contrast_grp = VGroup(contrast_title, elec_gauss, mag_gauss).arrange(DOWN, buff=0.32)
        contrast_grp.next_to(grp_ab, DOWN, buff=0.50)
        contrast_grp.scale_to_fit_width(12)

        self.play(FadeIn(gauss_title))
        self.play(FadeIn(step_a_zh))
        self.wait(0.5)
        self.play(Write(step_a_tex))
        self.wait(0.8)
        self.play(FadeIn(step_b_zh))
        self.wait(1.0)
        self.play(FadeIn(contrast_title))
        self.play(Write(elec_gauss))
        self.wait(0.6)
        self.play(Write(mag_gauss))
        self.wait(1.8)
        self.play(FadeOut(VGroup(gauss_title, grp_ab, contrast_grp)))

        # ══════════════════════════════════════════════════════
        # Step 8  物理含义：磁场是涡旋场（无源场）
        # ══════════════════════════════════════════════════════
        meaning_title = Text("物理含义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)

        m1 = Text("1. 磁场是「无源场」——自然界中不存在磁单极子，", font=CJK).scale(0.44)
        m2 = Text("   没有孤立的「磁荷」可以成为场线的起点或终点。", font=CJK).scale(0.44)
        m3 = Text("2. 磁感应线是永远闭合的曲线（涡旋场）：", font=CJK).scale(0.44)
        m3b = VGroup(
            Text("在 N 极方向从磁铁穿出，", font=CJK).scale(0.44),
            Text("经外部空间绕行，再从 S 极方向穿入磁铁内部，形成闭合回路。", font=CJK).scale(0.44),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        m4_tex = MathTex(r"\oiint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S} = 0",
                         r"\quad \Leftrightarrow \quad \nabla\cdot\mathbf{B} = 0",
                         color=YELLOW).scale(0.78)
        m4_note = Text("（积分形式          微分形式）", font=CJK, color=CYAN).scale(0.38)

        meaning_grp = VGroup(m1, m2, m3, m3b, m4_tex, m4_note).arrange(DOWN, buff=0.28,
                                                                         aligned_edge=LEFT)
        meaning_grp.next_to(meaning_title, DOWN, buff=0.42)
        meaning_grp.scale_to_fit_width(13.0)

        self.play(FadeIn(meaning_title))
        self.play(FadeIn(m1))
        self.wait(0.6)
        self.play(FadeIn(m2))
        self.wait(0.8)
        self.play(FadeIn(m3))
        self.wait(0.5)
        self.play(FadeIn(m3b))
        self.wait(0.8)
        self.play(Write(m4_tex))
        self.play(FadeIn(m4_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(meaning_title, meaning_grp)))

        # ══════════════════════════════════════════════════════
        # Step 9  小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.42)

        sf1 = VGroup(
            Text("磁通量定义：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Phi = \iint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S}"
                    r"= \iint_S B\cos\theta\,\mathrm{d}S", color=YELLOW).scale(0.80),
        ).arrange(RIGHT, buff=0.2)

        sf2 = VGroup(
            Text("磁场高斯定理：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\oiint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S} = 0", color=YELLOW).scale(0.90),
        ).arrange(RIGHT, buff=0.2)

        sf3 = VGroup(
            Text("微分形式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\nabla\cdot\mathbf{B} = 0", color=CYAN).scale(0.90),
        ).arrange(RIGHT, buff=0.2)

        sf4 = Text("磁感应线闭合 → 磁场是涡旋场 / 无源场", font=CJK, color=GREEN).scale(0.45)

        sum_content = VGroup(sf1, sf2, sf3, sf4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        sum_content.next_to(sum_title, DOWN, buff=0.45)
        sum_content.scale_to_fit_width(13.0)
        box = SurroundingRectangle(sum_content, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        self.play(Write(sf1[1]), FadeIn(sf1[0]))
        self.wait(0.6)
        self.play(Write(sf2[1]), FadeIn(sf2[0]))
        self.wait(0.6)
        self.play(Write(sf3[1]), FadeIn(sf3[0]))
        self.wait(0.6)
        self.play(FadeIn(sf4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, sum_content, box, title)))
        self.wait(0.5)
