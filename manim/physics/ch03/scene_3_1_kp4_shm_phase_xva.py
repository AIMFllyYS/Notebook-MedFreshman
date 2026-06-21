"""第 3.1 节 · 简谐振动——位移、速度、加速度的相位关系

可视化方案：
  1. 在同一坐标系绘制 x/A、v/(ωA)、a/(ω²A) 三条曲线，同时动画描线。
  2. 在关键相位点 ωt=0, π/2, π, 3π/2 画竖直参考线并浮现文字注释。
  3. 用 Brace + MathTex 标注 v 超前 x 相位 π/2，a 与 x 相差 π。
  4. 右上角旋转矢量图（Phasor）展示三个矢量联动。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch03Kp4ShmPhaseXva",
        "id": "phys-ch03-3.1-kp4-shm-phase-xva",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "位移、速度、加速度的相位关系",
        "description": "动画演示简谐振动中 x、v、a 三者的余弦曲线，直观揭示 v 超前 x 相位 π/2、a 与 x 反相的规律，并用旋转矢量图联动验证。",
    },
]


class Ch03Kp4ShmPhaseXva(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════
        # Step 1  标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("位移、速度、加速度的相位关系", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第三章  振动  ·  3.1  简谐振动", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2  生活类比引入
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text("弹簧上的小球：最远处速度为零，经过中点时速度最大。", font=CJK).scale(0.46)
        ana2 = Text("「什么时候最快？什么时候加速度最大？」——相位告诉我们答案。",
                    font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3  核心公式逐行出现
        # ═══════════════════════════════════════════════════════════════
        eq_x = MathTex(
            r"x", r"=", r"A\cos(\omega t)",
            color=WHITE
        ).scale(0.82)
        eq_x[0].set_color(BLUE)

        eq_v = MathTex(
            r"v", r"=", r"-\omega A\sin(\omega t)",
            r"=", r"\omega A\cos\!\left(\omega t+\tfrac{\pi}{2}\right)",
            color=WHITE
        ).scale(0.72)
        eq_v[0].set_color(RED)
        eq_v[4].set_color(RED)

        eq_a = MathTex(
            r"a", r"=", r"-\omega^{2}A\cos(\omega t)",
            r"=", r"\omega^{2}A\cos(\omega t+\pi)",
            color=WHITE
        ).scale(0.72)
        eq_a[0].set_color(GREEN)
        eq_a[4].set_color(GREEN)

        eqs = VGroup(eq_x, eq_v, eq_a).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        eqs.next_to(title, DOWN, buff=0.52)
        eqs.scale_to_fit_width(12.5)

        self.play(Write(eq_x))
        self.wait(0.8)
        self.play(Write(eq_v))
        self.wait(0.8)
        self.play(Write(eq_a))
        self.wait(1.8)
        self.play(FadeOut(eqs))

        # ═══════════════════════════════════════════════════════════════
        # Step 4  建立坐标系（左侧占 ~ 68% 宽度，右上角留给矢量图）
        # ═══════════════════════════════════════════════════════════════
        axes = Axes(
            x_range=[0, 2 * PI, PI / 2],
            y_range=[-1.5, 1.5, 1],
            x_length=8.5,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True, "tip_length": 0.2},
        ).shift(LEFT * 1.5 + DOWN * 0.55)

        # 横轴刻度标签（用 MathTex，纯 ASCII）
        x_labels = VGroup()
        tick_vals = [
            (PI / 2,   r"\frac{\pi}{2}"),
            (PI,       r"\pi"),
            (3 * PI / 2, r"\frac{3\pi}{2}"),
            (2 * PI,   r"2\pi"),
        ]
        for val, tex in tick_vals:
            lbl = MathTex(tex).scale(0.42)
            lbl.next_to(axes.c2p(val, 0), DOWN, buff=0.15)
            x_labels.add(lbl)

        x_lbl = MathTex(r"\omega t").scale(0.55).next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)
        y_lbl = MathTex(r"\text{Normalized}").scale(0.42).next_to(axes.y_axis.get_end(), UP, buff=0.12)

        self.play(Create(axes), FadeIn(x_labels), FadeIn(x_lbl), FadeIn(y_lbl))
        self.wait(0.6)

        # ═══════════════════════════════════════════════════════════════
        # Step 5  三条曲线同时动画描线
        # ═══════════════════════════════════════════════════════════════
        def plot_x(axes_obj):
            return axes_obj.plot(
                lambda t: math.cos(t),
                x_range=[0, 2 * PI],
                color=BLUE,
                stroke_width=3,
            )

        def plot_v(axes_obj):
            return axes_obj.plot(
                lambda t: -math.sin(t),
                x_range=[0, 2 * PI],
                color=RED,
                stroke_width=3,
            )

        def plot_a(axes_obj):
            return axes_obj.plot(
                lambda t: -math.cos(t),
                x_range=[0, 2 * PI],
                color=GREEN,
                stroke_width=3,
            )

        curve_x = plot_x(axes)
        curve_v = plot_v(axes)
        curve_a = plot_a(axes)

        # 图例（右侧，避开矢量图区域）
        leg_x = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=BLUE, stroke_width=3),
            Text("x/A", font=CJK, color=BLUE).scale(0.4),
        ).arrange(RIGHT, buff=0.1)
        leg_v = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=RED, stroke_width=3),
            Text("v/(", font=CJK, color=RED).scale(0.4),
            MathTex(r"\omega A", color=RED).scale(0.4),
            Text(")", font=CJK, color=RED).scale(0.4),
        ).arrange(RIGHT, buff=0.06)
        leg_a = VGroup(
            Line(ORIGIN, RIGHT * 0.5, color=GREEN, stroke_width=3),
            Text("a/(", font=CJK, color=GREEN).scale(0.4),
            MathTex(r"\omega^2 A", color=GREEN).scale(0.4),
            Text(")", font=CJK, color=GREEN).scale(0.4),
        ).arrange(RIGHT, buff=0.06)
        legend = VGroup(leg_x, leg_v, leg_a).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        legend.to_corner(UR, buff=0.35).shift(LEFT * 0.1)

        self.play(
            Create(curve_x),
            Create(curve_v),
            Create(curve_a),
            FadeIn(legend),
            run_time=2.5,
        )
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════
        # Step 6  关键相位点——竖直参考线 + 浮现注释
        # ═══════════════════════════════════════════════════════════════
        phase_data = [
            (0,          r"\omega t=0",         "平衡外侧，x=A，v=0，a=-ω²A（最大负加速度）"),
            (PI / 2,     r"\omega t=\pi/2",     "平衡位置，v最大（-ωA），x=0，a=0"),
            (PI,         r"\omega t=\pi",       "平衡另侧，x=-A，v=0，a=ω²A"),
            (3 * PI / 2, r"\omega t=3\pi/2",   "再过平衡，v=+ωA（最大正速度），a=0"),
        ]

        vlines = VGroup()
        annotations = VGroup()

        for i, (t_val, tex_str, zh_str) in enumerate(phase_data):
            vline = DashedLine(
                axes.c2p(t_val, -1.5),
                axes.c2p(t_val,  1.5),
                color=CYAN,
                stroke_width=1.5,
                dash_length=0.12,
            )
            lbl_tex = MathTex(tex_str, color=CYAN).scale(0.38)
            lbl_zh  = Text(zh_str, font=CJK, color=WHITE).scale(0.3)
            ann = VGroup(lbl_tex, lbl_zh).arrange(DOWN, buff=0.1)
            # 偶数放上方，奇数放下方，错开防重叠
            if i % 2 == 0:
                ann.next_to(axes.c2p(t_val, 1.5), UP, buff=0.1)
            else:
                ann.next_to(axes.c2p(t_val, -1.5), DOWN, buff=0.1)
            ann.scale_to_fit_width(min(ann.width, 2.8))

            vlines.add(vline)
            annotations.add(ann)

        self.play(Create(vlines), run_time=1.2)
        for ann in annotations:
            self.play(FadeIn(ann), run_time=0.5)
            self.wait(0.5)
        self.wait(1.2)
        self.play(FadeOut(vlines), FadeOut(annotations))

        # ═══════════════════════════════════════════════════════════════
        # Step 7  Brace 标注相位差
        # ═══════════════════════════════════════════════════════════════
        # v 超前 x 的 π/2：在 x 第一个峰（ωt=0）到 v 第一个峰（ωt=3π/2，即 -sin 最大值…
        # 更直观：x 过零点 ωt=π/2 在前，v 已过峰值 ωt=0 在前——
        # 用 Brace 标注 ωt=0 到 ωt=π/2 的水平距离，说明 Δφ=π/2
        p_left  = axes.c2p(0,      0)
        p_right = axes.c2p(PI / 2, 0)

        brace_h = BraceBetweenPoints(p_left, p_right, direction=DOWN, color=YELLOW)
        brace_label_tex = MathTex(r"\Delta\varphi = \frac{\pi}{2}", color=YELLOW).scale(0.6)
        brace_label_zh  = Text("v 超前 x 相位", font=CJK, color=YELLOW).scale(0.38)
        brace_label = VGroup(brace_label_tex, brace_label_zh).arrange(DOWN, buff=0.1)
        brace_label.next_to(brace_h, DOWN, buff=0.12)

        self.play(Create(brace_h), FadeIn(brace_label))
        self.wait(1.8)

        # a 与 x 反相：brace 从 ωt=0 到 ωt=π
        p_left2  = axes.c2p(0,   0)
        p_right2 = axes.c2p(PI,  0)
        brace_h2 = BraceBetweenPoints(p_left2, p_right2, direction=UP, color=ORANGE)
        brace_label2_tex = MathTex(r"\Delta\varphi = \pi", color=ORANGE).scale(0.6)
        brace_label2_zh  = Text("a 与 x 反相", font=CJK, color=ORANGE).scale(0.38)
        brace_label2 = VGroup(brace_label2_tex, brace_label2_zh).arrange(DOWN, buff=0.1)
        brace_label2.next_to(brace_h2, UP, buff=0.12)

        self.play(Create(brace_h2), FadeIn(brace_label2))
        self.wait(2.0)
        self.play(FadeOut(brace_h), FadeOut(brace_label),
                  FadeOut(brace_h2), FadeOut(brace_label2))

        # ═══════════════════════════════════════════════════════════════
        # Step 8  旋转矢量图（Phasor）右上角，与曲线联动
        # ═══════════════════════════════════════════════════════════════
        # 旋转矢量图放在右上角，用 ValueTracker 驱动
        phasor_center = axes.c2p(0, 0) + RIGHT * 5.2 + UP * 1.0
        R = 0.75  # 矢量半径（归一化）

        ph_title = Text("旋转矢量图", font=CJK, color=WHITE).scale(0.38)
        ph_title.move_to(phasor_center + UP * 1.15)

        # 画一个小圆作参考
        ph_circle = Circle(radius=R, color=BLUE_E, stroke_width=1.2).move_to(phasor_center)

        # 两条半轴
        ph_ax_h = Line(
            phasor_center + LEFT * (R + 0.15),
            phasor_center + RIGHT * (R + 0.15),
            color=BLUE_E, stroke_width=1,
        )
        ph_ax_v = Line(
            phasor_center + DOWN * (R + 0.15),
            phasor_center + UP * (R + 0.15),
            color=BLUE_E, stroke_width=1,
        )

        self.play(FadeOut(legend))  # 先移走图例腾地方
        self.play(FadeIn(ph_title), Create(ph_circle),
                  Create(ph_ax_h), Create(ph_ax_v))
        self.wait(0.5)

        # ValueTracker 控制旋转角 θ（从 0 到 2π）
        theta = ValueTracker(0.0)

        def phasor_x():
            """x 矢量（蓝色）：方向 θ，cos(θ) 投影 = x/A"""
            t = theta.get_value()
            end = phasor_center + R * np.array([math.cos(t), math.sin(t), 0])
            arr = Arrow(phasor_center, end, buff=0, color=BLUE,
                        stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
            return arr

        def phasor_v():
            """v 矢量（红色）：超前 x 相位 π/2"""
            t = theta.get_value() + PI / 2
            end = phasor_center + R * np.array([math.cos(t), math.sin(t), 0])
            arr = Arrow(phasor_center, end, buff=0, color=RED,
                        stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
            return arr

        def phasor_a():
            """a 矢量（绿色）：超前 x 相位 π（与 x 反向）"""
            t = theta.get_value() + PI
            end = phasor_center + R * np.array([math.cos(t), math.sin(t), 0])
            arr = Arrow(phasor_center, end, buff=0, color=GREEN,
                        stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
            return arr

        ph_x = always_redraw(phasor_x)
        ph_v = always_redraw(phasor_v)
        ph_a = always_redraw(phasor_a)

        # 联动点：在曲线上的移动小球
        def dot_on_x():
            t = theta.get_value()
            return Dot(axes.c2p(t % (2 * PI), math.cos(t % (2 * PI))),
                       color=BLUE, radius=0.09)

        def dot_on_v():
            t = theta.get_value()
            return Dot(axes.c2p(t % (2 * PI), -math.sin(t % (2 * PI))),
                       color=RED, radius=0.09)

        def dot_on_a():
            t = theta.get_value()
            return Dot(axes.c2p(t % (2 * PI), -math.cos(t % (2 * PI))),
                       color=GREEN, radius=0.09)

        mov_x = always_redraw(dot_on_x)
        mov_v = always_redraw(dot_on_v)
        mov_a = always_redraw(dot_on_a)

        # 矢量标签
        lbl_phx = Text("x", font=CJK, color=BLUE).scale(0.36)
        lbl_phv = Text("v", font=CJK, color=RED).scale(0.36)
        lbl_pha = Text("a", font=CJK, color=GREEN).scale(0.36)
        # 静态放在固定位置，避免 always_redraw 性能问题
        lbl_phx.move_to(phasor_center + RIGHT * (R + 0.28))
        lbl_phv.move_to(phasor_center + UP   * (R + 0.28))
        lbl_pha.move_to(phasor_center + LEFT * (R + 0.28))

        self.play(
            Create(ph_x), Create(ph_v), Create(ph_a),
            FadeIn(mov_x), FadeIn(mov_v), FadeIn(mov_a),
            FadeIn(lbl_phx), FadeIn(lbl_phv), FadeIn(lbl_pha),
        )
        # 让矢量旋转一整圈（2π），用时 4 秒
        self.play(
            theta.animate.set_value(2 * PI),
            run_time=4.5,
            rate_func=linear,
        )
        self.wait(1.0)

        # 清除旋转矢量相关对象
        self.play(
            FadeOut(VGroup(ph_title, ph_circle, ph_ax_h, ph_ax_v,
                           ph_x, ph_v, ph_a,
                           mov_x, mov_v, mov_a,
                           lbl_phx, lbl_phv, lbl_pha)),
        )

        # ═══════════════════════════════════════════════════════════════
        # Step 9  完整公式高亮展示（推导步骤）
        # ═══════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(curve_x, curve_v, curve_a,
                                 axes, x_labels, x_lbl, y_lbl)))

        deriv_title = Text("推导：对位移求导得到速度和加速度", font=CJK, color=BLUE).scale(0.48)
        deriv_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(deriv_title))

        d1 = MathTex(
            r"x(t)", r"=", r"A\cos(\omega t)",
        ).scale(0.82)
        d1[0].set_color(BLUE); d1[2].set_color(BLUE)

        d2 = MathTex(
            r"v(t)", r"=", r"\frac{dx}{dt}", r"=",
            r"-\omega A\sin(\omega t)",
            r"=", r"\omega A\cos\!\left(\omega t+\frac{\pi}{2}\right)",
        ).scale(0.72)
        d2[0].set_color(RED); d2[4].set_color(RED); d2[6].set_color(RED)

        d3 = MathTex(
            r"a(t)", r"=", r"\frac{dv}{dt}", r"=",
            r"-\omega^{2}A\cos(\omega t)",
            r"=", r"\omega^{2}A\cos(\omega t+\pi)",
        ).scale(0.72)
        d3[0].set_color(GREEN); d3[4].set_color(GREEN); d3[6].set_color(GREEN)

        deriv_group = VGroup(d1, d2, d3).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        deriv_group.next_to(deriv_title, DOWN, buff=0.45)
        deriv_group.scale_to_fit_width(12.5)

        self.play(Write(d1))
        self.wait(1.0)
        self.play(Write(d2))
        self.wait(1.0)
        self.play(Write(d3))
        self.wait(2.0)

        # 高亮相位差
        box_pi2 = SurroundingRectangle(d2[6], color=YELLOW, buff=0.08)
        box_pi  = SurroundingRectangle(d3[6], color=ORANGE, buff=0.08)
        phase_note1 = VGroup(
            Text("v 超前 x 相位", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"\frac{\pi}{2}", color=YELLOW).scale(0.55),
        ).arrange(RIGHT, buff=0.08).next_to(box_pi2, RIGHT, buff=0.15)
        phase_note2 = VGroup(
            Text("a 与 x 反相，相位差", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"\pi", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.08).next_to(box_pi, RIGHT, buff=0.15)

        self.play(Create(box_pi2), FadeIn(phase_note1))
        self.wait(1.0)
        self.play(Create(box_pi), FadeIn(phase_note2))
        self.wait(2.0)
        self.play(FadeOut(VGroup(deriv_title, deriv_group,
                                  box_pi2, box_pi, phase_note1, phase_note2)))

        # ═══════════════════════════════════════════════════════════════
        # Step 10  物理意义小结（文字）
        # ═══════════════════════════════════════════════════════════════
        phys_title = Text("物理意义", font=CJK, color=BLUE).scale(0.52)
        phys_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(phys_title))

        meanings = [
            ("x 最大（端点）", "→ v=0，a 最大（朝平衡位置方向）"),
            ("x=0（平衡位置）", "→ v 最大，a=0"),
            ("v 超前 x 相位 π/2", "→ 速度比位移「早到」π/2"),
            ("a 与 x 反相（相差 π）", "→ 加速度始终指向平衡位置（回复力特征）"),
        ]
        mean_group = VGroup()
        for zh_key, zh_val in meanings:
            row = VGroup(
                Text(zh_key, font=CJK, color=YELLOW).scale(0.42),
                Text(zh_val, font=CJK, color=WHITE).scale(0.42),
            ).arrange(RIGHT, buff=0.3)
            mean_group.add(row)
        mean_group.arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        mean_group.next_to(phys_title, DOWN, buff=0.42)
        mean_group.scale_to_fit_width(12.5)

        for row in mean_group:
            self.play(FadeIn(row), run_time=0.6)
            self.wait(0.8)
        self.wait(1.5)
        self.play(FadeOut(VGroup(phys_title, mean_group)))

        # ═══════════════════════════════════════════════════════════════
        # Step 11  小结卡（汇总 + 方框）
        # ═══════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        sum_title.next_to(title, DOWN, buff=0.55)

        s1 = MathTex(
            r"x = A\cos(\omega t)",
            color=BLUE
        ).scale(0.78)
        s2 = MathTex(
            r"v = \omega A\cos\!\left(\omega t+\tfrac{\pi}{2}\right)",
            color=RED
        ).scale(0.78)
        s3 = MathTex(
            r"a = \omega^{2}A\cos(\omega t+\pi)",
            color=GREEN
        ).scale(0.78)

        note1 = VGroup(
            Text("v 超前 x 相位", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\dfrac{\pi}{2}", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.1)
        note2 = VGroup(
            Text("a 与 x 反相，差", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\pi", color=ORANGE).scale(0.65),
        ).arrange(RIGHT, buff=0.1)

        sum_group = VGroup(s1, s2, s3, note1, note2).arrange(DOWN, buff=0.35)
        sum_group.next_to(sum_title, DOWN, buff=0.42)
        sum_group.scale_to_fit_width(11.0)

        box = SurroundingRectangle(sum_group, color=BLUE, buff=0.35, corner_radius=0.18)

        self.play(FadeIn(sum_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(note1), FadeIn(note2))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, sum_group, box, title)))
        self.wait(0.4)
