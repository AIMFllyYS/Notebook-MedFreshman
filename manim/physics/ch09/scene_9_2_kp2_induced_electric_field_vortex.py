"""第 9.2 节 · 感生电动势与涡旋电场（矢量场 / ValueTracker / E(r) 曲线）。

可视化方案：
  Step 1  — 圆形磁场区域（蓝色点阵，B 向外），ValueTracker 驱动 B 线性增大
  Step 2  — 感生电场涡旋箭头（橙色环形，楞次定律 → 顺时针）
  Step 3  — r < R 环路定理推导 + E_i(r) 线性段动画
  Step 4  — r > R 推导 + E_i(r) 曲线双曲衰减段，拼成完整图像
  Step 5  — 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 常量 ──────────────────────────────────────────────────────────────────────
R_FIELD = 1.4   # 磁场区域半径（场景单位）
DB_DT   = 1.0   # dB/dt 名义值（用于公式显示）


# ── 辅助：在给定圆周上生成切向箭头（顺时针方向）────────────────────────────────
def make_vortex_arrows(radius: float, n: int = 12,
                       color=ORANGE, tip_scale: float = 0.22) -> VGroup:
    """在半径 radius 的圆上放 n 个顺时针切向箭头。"""
    arrows = VGroup()
    arc_step = TAU / n
    for k in range(n):
        ang = k * arc_step
        cx, cy = radius * math.cos(ang), radius * math.sin(ang)
        # 顺时针切向 = (sin θ, -cos θ, 0)
        tx, ty = math.sin(ang), -math.cos(ang)
        length = 0.30 * radius + 0.18
        start = np.array([cx - tx * length * 0.4, cy - ty * length * 0.4, 0])
        end   = np.array([cx + tx * length * 0.6, cy + ty * length * 0.6, 0])
        arr = Arrow(start, end, buff=0,
                    color=color, stroke_width=2.5,
                    max_tip_length_to_length_ratio=tip_scale)
        arrows.add(arr)
    return arrows


class Ch09Kp2InducedElectricFieldVortex(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("感生电动势与涡旋电场", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        sub   = Text("第九章 电磁感应与电磁波 · 9.2", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.2)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("法拉第发现：变化的磁场不需要导线，", font=CJK).scale(0.46)
        ana2 = Text("也能在周围空间激发出一种旋转的电场——涡旋电场。", font=CJK).scale(0.46)
        ana3 = Text("就像水桶里的水旋转时会带动浮在其中的物体一样，", font=CJK).scale(0.44)
        ana4 = Text("涡旋电场会推动空间中任意一个电荷绕圆周运动。", font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22)
        ana.next_to(title, DOWN, buff=0.5)
        for line in ana:
            self.play(FadeIn(line), run_time=0.7)
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 磁场区域 + ValueTracker B 增大
        # ══════════════════════════════════════════════════════════════════════
        scene_center = DOWN * 0.35   # 留出标题空间

        # 磁场圆区域边界
        field_circle = Circle(radius=R_FIELD, color=BLUE, stroke_width=2)
        field_circle.move_to(scene_center)

        # B 场 ValueTracker
        B = ValueTracker(0.8)

        # 蓝色点阵（表示 B 向屏外）
        def make_b_dots():
            dots = VGroup()
            n_rings = 3
            for ring in range(n_rings):
                r_dot = 0.38 + ring * 0.42
                n_pts  = 6 + ring * 4
                for k in range(n_pts):
                    ang = k * TAU / n_pts
                    pos = scene_center + np.array([r_dot * math.cos(ang),
                                                   r_dot * math.sin(ang), 0])
                    # 点的大小随 B 变化
                    dot = Dot(point=pos, radius=0.045 + 0.03 * B.get_value(),
                              color=BLUE)
                    dots.add(dot)
            return dots

        b_dots = always_redraw(make_b_dots)

        # R 标注
        r_line = Line(scene_center, scene_center + RIGHT * R_FIELD, color=WHITE, stroke_width=1.5)
        r_label = MathTex(r"R", color=WHITE).scale(0.55)
        r_label.next_to(r_line, UP, buff=0.1)

        # B 数值显示（右上角）
        b_readout = always_redraw(
            lambda: VGroup(
                Text("B = ", font=CJK).scale(0.4),
                MathTex(rf"{B.get_value():.1f}\ \mathrm{{T}}", color=CYAN).scale(0.55)
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.5)
        )

        # dB/dt 标注
        dbdt_label = VGroup(
            MathTex(r"\frac{dB}{dt}", color=YELLOW).scale(0.6),
            MathTex(r"= \mathrm{const} > 0", color=WHITE).scale(0.52)
        ).arrange(RIGHT, buff=0.12).to_corner(UL, buff=0.5)

        cap3 = Text("磁场区域（半径 R）内 B 向外且均匀增大", font=CJK).scale(0.38)
        cap3.to_edge(DOWN, buff=0.45)

        self.play(Create(field_circle), FadeIn(r_line), FadeIn(r_label))
        self.play(Create(b_dots), FadeIn(b_readout))
        self.play(FadeIn(dbdt_label), FadeIn(cap3))
        self.wait(0.8)

        # B 从 0.8 线性增长到 2.4
        self.play(B.animate.set_value(2.4), run_time=2.5)
        self.wait(1.0)
        self.play(B.animate.set_value(1.6), run_time=1.0)   # 停在中间值
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 展示感生电场涡旋箭头（两个同心圆，r1 < R, r2 < R）
        # ══════════════════════════════════════════════════════════════════════
        lenz_cap = VGroup(
            Text("楞次定律：B 增大（向外），感生电场", font=CJK).scale(0.38),
            Text("方向为顺时针，阻碍磁通量增加", font=CJK).scale(0.38)
        ).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.45)
        self.play(FadeOut(cap3), FadeIn(lenz_cap))

        r_vals    = [0.55, 1.0]
        arrow_grps = []
        loop_circles = []
        for rv in r_vals:
            lc = Circle(radius=rv, color=ORANGE, stroke_width=1.2, stroke_opacity=0.6)
            lc.move_to(scene_center)
            ag = make_vortex_arrows(rv, n=10, color=ORANGE)
            ag.shift(scene_center)
            self.play(Create(lc), Create(ag), run_time=0.9)
            arrow_grps.append(ag)
            loop_circles.append(lc)
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 环路定理推导（r < R）
        # ══════════════════════════════════════════════════════════════════════
        # 清掉 B 增大动画，保留圆圈
        self.play(FadeOut(lenz_cap), FadeOut(b_readout), FadeOut(dbdt_label))

        # 将磁场图缩到左侧
        field_group = VGroup(field_circle, r_line, r_label, b_dots,
                             *loop_circles, *arrow_grps)
        self.play(field_group.animate.scale(0.72).to_edge(LEFT, buff=0.3).shift(DOWN * 0.2),
                  run_time=1.2)
        self.wait(0.5)

        # 推导区（右侧）
        deriv_title = Text("环路定理推导（r < R）", font=CJK, color=BLUE).scale(0.47)
        deriv_title.to_corner(UR, buff=0.5).shift(DOWN * 0.6)

        step_a = VGroup(
            Text("取半径为 r 的圆形环路，", font=CJK).scale(0.40),
            Text("由法拉第定律：", font=CJK).scale(0.40)
        ).arrange(DOWN, buff=0.15)

        eq1 = MathTex(
            r"\oint_L \mathbf{E}_i \cdot \mathrm{d}\mathbf{l}",
            r"=",
            r"-\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}"
        ).scale(0.72)
        eq1[0].set_color(ORANGE)
        eq1[2].set_color(YELLOW)

        eq2 = MathTex(
            r"E_i \cdot 2\pi r",
            r"=",
            r"\frac{\mathrm{d}B}{\mathrm{d}t} \cdot \pi r^2"
        ).scale(0.72)
        eq2[0].set_color(ORANGE)
        eq2[2].set_color(YELLOW)

        eq3 = MathTex(
            r"E_i",
            r"=",
            r"\frac{r}{2}\,\frac{\mathrm{d}B}{\mathrm{d}t}",
            r"\quad (r < R)"
        ).scale(0.78)
        eq3[0].set_color(ORANGE)
        eq3[2].set_color(GREEN)
        eq3[3].set_color(CYAN)

        rhs = VGroup(deriv_title, step_a, eq1, eq2, eq3).arrange(DOWN, buff=0.32)
        rhs.next_to(field_group, RIGHT, buff=0.45).shift(UP * 0.2)
        rhs.scale_to_fit_width(5.8)

        self.play(FadeIn(deriv_title))
        self.wait(0.4)
        self.play(FadeIn(step_a), run_time=0.8)
        self.wait(0.5)
        self.play(Write(eq1))
        self.wait(1.0)
        self.play(TransformMatchingTex(eq1.copy(), eq2))
        self.wait(1.0)
        self.play(TransformMatchingTex(eq2.copy(), eq3))
        box3 = SurroundingRectangle(eq3, color=GREEN, buff=0.12, corner_radius=0.08)
        self.play(Create(box3))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: E(r) 曲线（r < R 线性段）
        # ══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(step_a, eq1, eq2, eq3, box3, deriv_title,
                                 field_group)))

        # 建立坐标轴（下方居中）
        axes = Axes(
            x_range=[0, 3.2, 0.5],
            y_range=[0, 1.4, 0.5],
            x_length=6.8,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 2,
                         "include_tip": True, "tip_length": 0.18},
        ).shift(DOWN * 0.4 + RIGHT * 0.1)

        x_label = VGroup(
            MathTex(r"r", color=WHITE).scale(0.6),
            Text("（距中心距离）", font=CJK).scale(0.35)
        ).arrange(RIGHT, buff=0.08)
        x_label.next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)

        y_label = VGroup(
            MathTex(r"E_i", color=ORANGE).scale(0.6)
        )
        y_label.next_to(axes.y_axis.get_end(), UP, buff=0.1)

        # R 的竖虚线
        r_x = R_FIELD / 1.0   # 场景中 R_FIELD 对应坐标轴上的 1.4
        r_dash = axes.get_vertical_line(axes.c2p(R_FIELD, 0), color=BLUE,
                                        stroke_width=1.5)
        r_ax_label = MathTex(r"R", color=BLUE).scale(0.55)
        r_ax_label.next_to(axes.c2p(R_FIELD, 0), DOWN, buff=0.12)

        # E_max（r=R 时的值）= R/2 * dB/dt = 0.7
        E_max = R_FIELD / 2 * DB_DT   # = 0.7

        # ValueTracker：动画画线
        r_tracker = ValueTracker(0.0)

        # r < R 线性段
        def inner_curve():
            rt = r_tracker.get_value()
            end_r = min(rt, R_FIELD)
            if end_r <= 0.001:
                return VGroup()
            return axes.plot(lambda x: x / 2 * DB_DT,
                             x_range=[0, end_r], color=ORANGE, stroke_width=3)

        curve_inner = always_redraw(inner_curve)

        note_inner = VGroup(
            MathTex(r"E_i = \tfrac{r}{2}\,\tfrac{dB}{dt}", color=ORANGE).scale(0.55),
            Text("线性增长", font=CJK, color=ORANGE).scale(0.38)
        ).arrange(DOWN, buff=0.1).to_corner(UL, buff=0.45)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(r_dash), FadeIn(r_ax_label))
        self.add(curve_inner)
        self.play(FadeIn(note_inner))
        self.play(r_tracker.animate.set_value(R_FIELD), run_time=2.2)
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: r > R 推导（右侧文字）
        # ══════════════════════════════════════════════════════════════════════
        # 固定内圈曲线（不再 redraw）
        static_inner = axes.plot(lambda x: x / 2 * DB_DT,
                                 x_range=[0.001, R_FIELD],
                                 color=ORANGE, stroke_width=3)
        self.remove(curve_inner)
        self.add(static_inner)

        deriv2_title = Text("环路定理推导（r > R）", font=CJK, color=BLUE).scale(0.42)
        deriv2_title.to_corner(UR, buff=0.45).shift(DOWN * 0.2)

        eq4 = MathTex(
            r"E_i \cdot 2\pi r",
            r"=",
            r"\frac{\mathrm{d}B}{\mathrm{d}t} \cdot \pi R^2"
        ).scale(0.68)
        eq4[0].set_color(ORANGE)
        eq4[2].set_color(YELLOW)

        eq5 = MathTex(
            r"E_i",
            r"=",
            r"\frac{R^2}{2r}\,\frac{\mathrm{d}B}{\mathrm{d}t}",
            r"\quad (r > R)"
        ).scale(0.72)
        eq5[0].set_color(ORANGE)
        eq5[2].set_color(GREEN)
        eq5[3].set_color(CYAN)

        note_outer = VGroup(
            Text("磁通量只来自 r=R 圆内，", font=CJK).scale(0.38),
            Text("所以通量为", font=CJK).scale(0.38),
            MathTex(r"\Phi = \frac{dB}{dt}\pi R^2", color=YELLOW).scale(0.52)
        ).arrange(DOWN, buff=0.14)

        rhs2 = VGroup(deriv2_title, note_outer, eq4, eq5).arrange(DOWN, buff=0.28)
        rhs2.to_corner(UR, buff=0.35).shift(DOWN * 0.0)
        rhs2.scale_to_fit_width(4.6)

        self.play(FadeIn(deriv2_title))
        self.play(FadeIn(note_outer), run_time=0.9)
        self.wait(0.6)
        self.play(Write(eq4))
        self.wait(1.0)
        self.play(TransformMatchingTex(eq4.copy(), eq5))
        box5 = SurroundingRectangle(eq5, color=GREEN, buff=0.1, corner_radius=0.08)
        self.play(Create(box5))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 在曲线图上补画 r > R 双曲衰减段
        # ══════════════════════════════════════════════════════════════════════
        r2_tracker = ValueTracker(R_FIELD)

        def outer_curve():
            rt = r2_tracker.get_value()
            if rt <= R_FIELD + 0.001:
                return VGroup()
            return axes.plot(
                lambda x: (R_FIELD ** 2) / (2 * x) * DB_DT,
                x_range=[R_FIELD, rt],
                color=GREEN, stroke_width=3
            )

        curve_outer = always_redraw(outer_curve)
        self.add(curve_outer)

        note_outer_curve = VGroup(
            MathTex(r"E_i = \tfrac{R^2}{2r}\,\tfrac{dB}{dt}", color=GREEN).scale(0.52),
            Text("双曲衰减", font=CJK, color=GREEN).scale(0.38)
        ).arrange(DOWN, buff=0.1)
        note_outer_curve.next_to(note_inner, DOWN, buff=0.3)

        self.play(FadeIn(note_outer_curve))
        self.play(r2_tracker.animate.set_value(3.1), run_time=2.2)
        self.wait(1.2)

        # 固定外圈曲线
        static_outer = axes.plot(
            lambda x: (R_FIELD ** 2) / (2 * x) * DB_DT,
            x_range=[R_FIELD, 3.1], color=GREEN, stroke_width=3
        )
        self.remove(curve_outer)
        self.add(static_outer)

        # E_max 标注点
        peak_dot = Dot(axes.c2p(R_FIELD, E_max), color=YELLOW, radius=0.08)
        peak_label = MathTex(r"E_{i,\max}=\tfrac{R}{2}\,\tfrac{dB}{dt}",
                             color=YELLOW).scale(0.48)
        peak_label.next_to(peak_dot, UR, buff=0.12)
        self.play(FadeIn(peak_dot), FadeIn(peak_label))
        self.wait(1.5)

        # 清场，准备小结
        self.play(FadeOut(VGroup(
            rhs2, box5, note_inner, note_outer_curve, peak_dot, peak_label,
            axes, x_label, y_label, r_dash, r_ax_label,
            static_inner, static_outer
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)

        s_law = MathTex(
            r"\oint_L \mathbf{E}_i\cdot\mathrm{d}\mathbf{l} = -\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}",
            color=YELLOW
        ).scale(0.75)

        s_inner = MathTex(
            r"E_i = \frac{r}{2}\,\frac{\mathrm{d}B}{\mathrm{d}t}",
            r"\quad (r < R)",
            color=ORANGE
        ).scale(0.75)
        s_inner[1].set_color(CYAN)

        s_outer = MathTex(
            r"E_i = \frac{R^2}{2r}\,\frac{\mathrm{d}B}{\mathrm{d}t}",
            r"\quad (r > R)",
            color=GREEN
        ).scale(0.75)
        s_outer[1].set_color(CYAN)

        s_note = VGroup(
            Text("涡旋电场是闭合的，无\"源\"——电场线不起始也不终止于电荷，", font=CJK).scale(0.38),
            Text("这与静电场有本质区别。感生电场做功与路径有关。", font=CJK).scale(0.38)
        ).arrange(DOWN, buff=0.12)

        summary = VGroup(s_law, s_inner, s_outer, s_note).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(11.5)

        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_law))
        self.wait(0.6)
        self.play(Write(s_inner))
        self.wait(0.6)
        self.play(Write(s_outer))
        self.wait(0.6)
        self.play(FadeIn(s_note))
        self.play(Create(box_s))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, s_title, summary, box_s)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp2InducedElectricFieldVortex",
        "id": "phys-ch09-9.2-kp2-induced-electric-field-vortex",
        "chapterId": "ch09",
        "sectionId": "9.2",
        "title": "感生电动势与涡旋电场",
        "description": "用俯视图动画展示变化磁场激发涡旋电场，ValueTracker 驱动 B 增大，"
                       "环路定理逐步推导内外两段 E_i(r) 公式，最终拼成完整 E-r 图像。",
    },
]
