"""第 11.2 节 · 单缝夫琅禾费衍射：半波带法

可视化方案：
  Step 1  — 标题 + 类比引入
  Step 2  — 绘制单缝及平行光入射示意
  Step 3  — 半波带概念定义（缝宽 a、衍射角 θ、路程差）
  Step 4  — 偶数半波带 → 相消 → 暗纹条件（动画均分缝宽）
  Step 5  — 奇数半波带 → 多出一个 → 明纹条件
  Step 6  — 衍射强度曲线 I(α)=(sinα/α)²，ValueTracker 扫缝宽 a
  Step 7  — 小结卡（关键公式汇总 + 方框）

铁律：MathTex 内只能有 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch11Kp2SingleSlitHalfWaveZone(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("单缝夫琅禾费衍射：半波带法", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("用小刀在纸板上划一道细缝，让激光穿过——", font=CJK).scale(0.46)
        ana2 = Text("屏幕上不是一个光点，而是一排明暗交替的条纹。", font=CJK).scale(0.46)
        ana3 = Text("这就是「单缝衍射」：缝越窄，条纹越宽。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 单缝几何示意图 ──────────────────────────────────────
        # 单缝：竖线，高度代表缝宽 a
        slit_x = -3.8
        slit_half = 1.2          # 半缝高度（代表 a/2）
        slit_color = BLUE

        # 上下遮板
        plate_top = Line(
            np.array([slit_x, slit_half + 0.8, 0]),
            np.array([slit_x, slit_half, 0]),
            color=WHITE, stroke_width=6,
        )
        plate_bot = Line(
            np.array([slit_x, -slit_half - 0.8, 0]),
            np.array([slit_x, -slit_half, 0]),
            color=WHITE, stroke_width=6,
        )
        # 缝宽标注箭头
        brace_slit = Brace(
            Line(np.array([slit_x - 0.05, -slit_half, 0]),
                 np.array([slit_x - 0.05,  slit_half, 0])),
            direction=LEFT, color=CYAN,
        )
        label_a = MathTex(r"a", color=CYAN).scale(0.7).next_to(brace_slit, LEFT, buff=0.12)

        # 几根平行入射光线（从左向右）
        rays = VGroup()
        for dy in np.linspace(-slit_half * 0.85, slit_half * 0.85, 5):
            ray = Arrow(
                start=np.array([slit_x - 1.5, dy, 0]),
                end=np.array([slit_x, dy, 0]),
                color=YELLOW, buff=0, stroke_width=2,
                max_tip_length_to_length_ratio=0.18,
            )
            rays.add(ray)

        incident_label = Text("平行光（单色）", font=CJK, color=YELLOW).scale(0.4)
        incident_label.move_to(np.array([slit_x - 1.8, -slit_half - 0.5, 0]))

        # 衍射方向 θ 箭头（向右上）
        theta_angle = 28  # degrees
        theta_rad = math.radians(theta_angle)
        diff_end = np.array([slit_x + 3.5 * math.cos(theta_rad),
                              3.5 * math.sin(theta_rad), 0])
        diff_arrow = Arrow(
            start=np.array([slit_x, 0, 0]),
            end=diff_end,
            color=GREEN, buff=0,
            max_tip_length_to_length_ratio=0.12,
        )
        # 光轴（θ=0 方向）
        axis_arrow = DashedLine(
            np.array([slit_x, 0, 0]),
            np.array([slit_x + 3.5, 0, 0]),
            color=WHITE, stroke_width=1.5,
        )
        # θ 角弧
        arc_theta = Arc(
            radius=0.75, angle=theta_rad, start_angle=0,
            arc_center=np.array([slit_x, 0, 0]),
            color=ORANGE,
        )
        theta_label = MathTex(r"\theta", color=ORANGE).scale(0.65)
        theta_label.move_to(np.array([slit_x + 0.95, 0.38, 0]))

        geom = VGroup(plate_top, plate_bot, brace_slit, label_a,
                      rays, incident_label, diff_arrow, axis_arrow,
                      arc_theta, theta_label)

        self.play(
            Create(plate_top), Create(plate_bot),
            Create(brace_slit), FadeIn(label_a),
        )
        self.play(LaggedStart(*[GrowArrow(r) for r in rays], lag_ratio=0.15))
        self.play(FadeIn(incident_label))
        self.play(Create(axis_arrow), GrowArrow(diff_arrow),
                  Create(arc_theta), FadeIn(theta_label))
        self.wait(1.5)

        # ── Step 4: 半波带概念 — 偶数分带 → 暗纹 ──────────────────────
        concept_lbl = Text("半波带法：将缝沿宽度方向均分", font=CJK, color=CYAN).scale(0.42)
        concept_lbl.to_edge(DOWN, buff=0.8)
        self.play(FadeIn(concept_lbl))
        self.wait(0.6)

        # 用若干水平线把缝分成 2 等份，然后动画到 4 份
        def make_zone_lines(n_zones, x=slit_x, y_half=slit_half):
            """返回把缝分成 n_zones 个半波带的水平线 VGroup。"""
            lines = VGroup()
            for i in range(1, n_zones):
                y = -y_half + i * (2 * y_half) / n_zones
                lines.add(
                    DashedLine(
                        np.array([x, y, 0]),
                        np.array([x + 0.5, y, 0]),
                        color=CYAN, stroke_width=1.5,
                    )
                )
            return lines

        def make_zone_fills(n_zones, x=slit_x, y_half=slit_half, width=0.5):
            """相邻半波带交替着色（偶数带组合方向相消）。"""
            fills = VGroup()
            colors = [RED_E, BLUE_E] * (n_zones // 2 + 1)
            for i in range(n_zones):
                y_bot = -y_half + i * (2 * y_half) / n_zones
                y_top = y_bot + (2 * y_half) / n_zones
                rect = Rectangle(
                    width=width, height=(2 * y_half) / n_zones,
                    fill_color=colors[i], fill_opacity=0.55, stroke_width=0,
                )
                rect.move_to(np.array([x + width / 2, (y_bot + y_top) / 2, 0]))
                fills.add(rect)
            return fills

        # 2 个半波带
        zone_lines_2 = make_zone_lines(2)
        zone_fills_2 = make_zone_fills(2)
        self.play(Create(zone_lines_2), FadeIn(zone_fills_2))
        self.wait(0.8)

        # 标注相消
        cancel_2 = Text("两带振动反相 → 相消 → 暗纹", font=CJK, color=RED).scale(0.4)
        cancel_2.to_edge(DOWN, buff=0.3)
        dark_eq_2 = MathTex(r"a\sin\theta = 2 \cdot \frac{\lambda}{2} = \lambda",
                             color=YELLOW).scale(0.65)
        dark_eq_2.next_to(cancel_2, UP, buff=0.25)
        self.play(FadeIn(cancel_2), Write(dark_eq_2))
        self.wait(1.2)

        # 清除 2 带，换成 4 带
        self.play(FadeOut(zone_lines_2), FadeOut(zone_fills_2),
                  FadeOut(cancel_2), FadeOut(dark_eq_2))

        zone_lines_4 = make_zone_lines(4)
        zone_fills_4 = make_zone_fills(4)
        self.play(Create(zone_lines_4), FadeIn(zone_fills_4))
        self.wait(0.6)

        cancel_4 = Text("四带两两反相 → 全消 → 暗纹", font=CJK, color=RED).scale(0.4)
        cancel_4.to_edge(DOWN, buff=0.3)
        dark_eq_4 = MathTex(r"a\sin\theta = 4 \cdot \frac{\lambda}{2} = 2\lambda",
                             color=YELLOW).scale(0.65)
        dark_eq_4.next_to(cancel_4, UP, buff=0.25)
        self.play(FadeIn(cancel_4), Write(dark_eq_4))
        self.wait(1.2)

        # 通用暗纹公式
        self.play(FadeOut(cancel_4), FadeOut(dark_eq_4))
        dark_general = MathTex(
            r"a\sin\theta = k\lambda,\quad k=\pm1,\pm2,\ldots",
            color=YELLOW,
        ).scale(0.65)
        dark_general.to_edge(DOWN, buff=0.55)
        dark_label = Text("（暗纹条件）", font=CJK, color=YELLOW).scale(0.38)
        dark_label.next_to(dark_general, RIGHT, buff=0.2)
        box_dark = SurroundingRectangle(dark_general, color=YELLOW, buff=0.12)
        self.play(Write(dark_general), FadeIn(dark_label), Create(box_dark))
        self.wait(1.8)

        self.play(FadeOut(VGroup(zone_lines_4, zone_fills_4,
                                  dark_general, dark_label, box_dark,
                                  concept_lbl)))

        # ── Step 5: 奇数半波带 → 明纹 ──────────────────────────────────
        odd_lbl = Text("奇数个半波带：多出一个带未被抵消 → 明纹", font=CJK, color=GREEN).scale(0.42)
        odd_lbl.to_edge(DOWN, buff=0.8)
        self.play(FadeIn(odd_lbl))

        # 3 个半波带
        zone_lines_3 = make_zone_lines(3)
        zone_fills_3 = make_zone_fills(3)
        self.play(Create(zone_lines_3), FadeIn(zone_fills_3))
        self.wait(0.6)

        bright_eq_3 = MathTex(
            r"a\sin\theta = 3 \cdot \frac{\lambda}{2}",
            color=GREEN,
        ).scale(0.65)
        bright_eq_3.to_edge(DOWN, buff=0.45)
        self.play(Write(bright_eq_3))
        self.wait(1.0)

        # 5 个半波带
        self.play(FadeOut(zone_lines_3), FadeOut(zone_fills_3), FadeOut(bright_eq_3))
        zone_lines_5 = make_zone_lines(5)
        zone_fills_5 = make_zone_fills(5)
        self.play(Create(zone_lines_5), FadeIn(zone_fills_5))
        self.wait(0.6)

        bright_eq_5 = MathTex(
            r"a\sin\theta = 5 \cdot \frac{\lambda}{2}",
            color=GREEN,
        ).scale(0.65)
        bright_eq_5.to_edge(DOWN, buff=0.45)
        self.play(Write(bright_eq_5))
        self.wait(1.0)

        self.play(FadeOut(zone_lines_5), FadeOut(zone_fills_5), FadeOut(bright_eq_5))

        bright_general = MathTex(
            r"a\sin\theta = (2k+1)\frac{\lambda}{2},\quad k=\pm1,\pm2,\ldots",
            color=GREEN,
        ).scale(0.60)
        bright_general.to_edge(DOWN, buff=0.55)
        bright_label = Text("（明纹条件，次极大）", font=CJK, color=GREEN).scale(0.36)
        bright_label.next_to(bright_general, RIGHT, buff=0.18)
        box_bright = SurroundingRectangle(bright_general, color=GREEN, buff=0.12)
        self.play(Write(bright_general), FadeIn(bright_label), Create(box_bright))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            geom, odd_lbl,
            bright_general, bright_label, box_bright,
        )))

        # ── Step 6: 衍射强度曲线 + ValueTracker 扫缝宽 a ──────────────
        # 清场，重建标题作为顶部锚点
        inten_title = Text("衍射强度分布与缝宽关系", font=CJK, color=BLUE).scale(0.50).to_edge(UP)
        self.play(Write(inten_title))

        # I(α) = I0*(sinα/α)^2,  α = π a sinθ / λ
        # 把 sinθ ≈ θ（小角），横轴用 α（无量纲）
        axes = Axes(
            x_range=[-4 * PI, 4 * PI, PI],
            y_range=[-0.2, 1.3, 0.5],
            x_length=10,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.6)

        x_lbl = MathTex(r"\alpha = \frac{\pi a \sin\theta}{\lambda}").scale(0.48)
        x_lbl.next_to(axes.x_axis.get_end(), DOWN + RIGHT, buff=0.08)
        y_lbl = MathTex(r"I/I_0").scale(0.48).next_to(axes.y_axis.get_end(), LEFT, buff=0.1)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        def sinc_sq(alpha):
            if abs(alpha) < 1e-6:
                return 1.0
            return (math.sin(alpha) / alpha) ** 2

        # 固定曲线（正常缝宽）
        curve_base = axes.plot(
            sinc_sq,
            x_range=[-4 * PI + 0.01, 4 * PI - 0.01],
            color=YELLOW,
            stroke_width=2.5,
        )
        # 填充中央主极大
        central_area = axes.get_area(
            curve_base,
            x_range=[-PI, PI],
            color=YELLOW, opacity=0.25,
        )
        self.play(Create(curve_base), FadeIn(central_area))
        self.wait(0.8)

        # 标注第一暗纹 α = ±π
        for sign, xpos in [(1, PI), (-1, -PI)]:
            vl = DashedLine(
                axes.c2p(sign * PI, 0),
                axes.c2p(sign * PI, 0.05),
                color=RED, stroke_width=1.5,
            )
            self.add(vl)
        dark_mark = MathTex(r"\alpha=\pm\pi", color=RED).scale(0.45)
        dark_mark.next_to(axes.c2p(PI, 0.08), UP + RIGHT, buff=0.05)
        self.play(FadeIn(dark_mark))
        self.wait(0.6)

        # ValueTracker：改变等效缝宽比例 scale_a
        # scale_a=1 → 正常; scale_a=0.5 → 缝缩半 → 中央明纹展宽
        inten_cap = Text("拖动缝宽：缝越窄 → 中央明纹越宽、强度越低",
                         font=CJK, color=CYAN).scale(0.40)
        inten_cap.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(inten_cap))

        scale_a = ValueTracker(1.0)

        dyn_curve = always_redraw(
            lambda: axes.plot(
                lambda alpha: sinc_sq(alpha * scale_a.get_value()),
                x_range=[-4 * PI + 0.01, 4 * PI - 0.01],
                color=ORANGE,
                stroke_width=2.5,
            )
        )
        self.play(FadeOut(curve_base), FadeOut(central_area), FadeOut(dark_mark))
        self.play(Create(dyn_curve))

        # 缩小缝宽（scale_a 减小 → sinc 展宽，峰值随 a^2 降低）
        # 左上角显示当前 a 值
        a_label = always_redraw(
            lambda: VGroup(
                Text("缝宽 a = ", font=CJK, color=WHITE).scale(0.40),
                MathTex(
                    r"{:.2f}".format(scale_a.get_value()) + r"a_0",
                    color=ORANGE,
                ).scale(0.50),
            ).arrange(RIGHT, buff=0.1).to_corner(UL, buff=0.55)
        )
        self.add(a_label)

        self.play(scale_a.animate.set_value(0.45), run_time=4, rate_func=smooth)
        self.wait(1.0)
        self.play(scale_a.animate.set_value(1.0), run_time=3, rate_func=smooth)
        self.wait(1.0)

        central_width_eq = MathTex(
            r"\Delta x = \frac{2f\lambda}{a}", color=CYAN,
        ).scale(0.72)
        central_width_eq.to_edge(DOWN, buff=0.72)
        width_label = Text("中央明纹宽度", font=CJK, color=CYAN).scale(0.40)
        width_label.next_to(central_width_eq, LEFT, buff=0.2)
        self.play(Write(central_width_eq), FadeIn(width_label))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            inten_title, axes, x_lbl, y_lbl,
            dyn_curve, inten_cap, a_label,
            central_width_eq, width_label,
        )))

        # ── Step 7: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结：半波带法核心结论", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        eq_dark = MathTex(
            r"a\sin\theta = k\lambda \quad (k=\pm1,\pm2,\ldots)",
            color=RED,
        ).scale(0.65)
        lbl_dark = Text("暗纹（偶数半波带，两两相消）", font=CJK, color=RED).scale(0.38)

        eq_bright = MathTex(
            r"a\sin\theta = (2k+1)\frac{\lambda}{2} \quad (k=\pm1,\pm2,\ldots)",
            color=GREEN,
        ).scale(0.60)
        lbl_bright = Text("明纹次极大（奇数半波带，剩余一带）", font=CJK, color=GREEN).scale(0.38)

        eq_width = MathTex(
            r"\Delta x = \frac{2f\lambda}{a}",
            color=CYAN,
        ).scale(0.65)
        lbl_width = Text("中央明纹宽度（f 为焦距）", font=CJK, color=CYAN).scale(0.38)

        eq_inten = MathTex(
            r"I(\alpha)=I_0\!\left(\frac{\sin\alpha}{\alpha}\right)^{\!2},\quad"
            r"\alpha=\frac{\pi a\sin\theta}{\lambda}",
            color=YELLOW,
        ).scale(0.58)
        lbl_inten = Text("强度分布（sinc 平方）", font=CJK, color=YELLOW).scale(0.38)

        rows = VGroup()
        for eq, lbl in [(eq_dark, lbl_dark), (eq_bright, lbl_bright),
                         (eq_width, lbl_width), (eq_inten, lbl_inten)]:
            row = VGroup(eq, lbl).arrange(RIGHT, buff=0.35, aligned_edge=DOWN)
            rows.add(row)
        rows.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        rows.next_to(s_title, DOWN, buff=0.38)
        rows.scale_to_fit_width(13.2)

        box = SurroundingRectangle(rows, color=BLUE, buff=0.32, corner_radius=0.15)

        for row in rows:
            self.play(Write(row[0]), FadeIn(row[1]))
            self.wait(0.5)
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, rows, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp2SingleSlitHalfWaveZone",
        "id": "phys-ch11-11.2-kp2-single-slit-half-wave-zone",
        "chapterId": "ch11",
        "sectionId": "11.2",
        "title": "单缝夫琅禾费衍射：半波带法",
        "description": "从单缝几何出发，动画演示偶数半波带相消得暗纹、奇数半波带多出一带得明纹，并用 ValueTracker 展示缝宽变化对中央明纹宽度与强度的影响。",
    },
]
