"""第 11.3 节 · 例题：三块偏振片串联光强（马吕斯定律连续应用）。

可视化方案：
  Step 1  标题 + 副标题
  Step 2  生活类比（太阳镜/LCD 屏）
  Step 3  绘制三块偏振片 P1/P2/P3 及方向角标注
  Step 4  自然光 I₀ 经 P1 得 I₁ = I₀/2
  Step 5  I₁ 经 P2（夹角 θ）得 I₂ = I₁cos²θ（马吕斯定律）
  Step 6  ValueTracker 扫 θ，实时更新光强条形图
  Step 7  I₂ 经 P3（与 P2 夹 90°-θ）得 I₃ = I₀/2·cos²θ·sin²θ
  Step 8  化简 I₃ = I₀/8·sin²(2θ)
  Step 9  绘制 I₃(θ) 曲线，高亮 θ=45° 极大值
  Step 10 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ─── 辅助：绘制偏振片（矩形 + 方向箭头）─────────────────────────────────────
def make_polarizer(label_str, angle_deg, color=BLUE, height=2.0, width=0.25):
    """返回一个 VGroup：竖立的偏振片矩形 + 透射轴箭头 + 标签。"""
    rect = Rectangle(width=width, height=height, color=color, fill_color=color,
                     fill_opacity=0.25)
    # 透射轴箭头（从矩形中心出发，按 angle_deg 旋转）
    arr_len = 0.7
    angle_rad = math.radians(angle_deg)
    end = np.array([arr_len * math.sin(angle_rad), arr_len * math.cos(angle_rad), 0])
    arrow = Arrow(ORIGIN, end, buff=0, color=YELLOW,
                  stroke_width=3, max_tip_length_to_length_ratio=0.35)
    label = Text(label_str, font=CJK, color=color).scale(0.5)
    label.next_to(rect, UP, buff=0.15)
    return VGroup(rect, arrow, label)


class Ch11Ex1ThreePolarizerTransmission(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("例题：三块偏振片串联光强", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.3  马吕斯定律", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("太阳镜镜片就是偏振片——", font=CJK).scale(0.48)
        ana2 = Text("两片镜片叠在一起旋转，光线时而全透过、时而全消失。", font=CJK).scale(0.48)
        ana3 = Text("三块偏振片串联时，中间那块的角度能让原本「全消失」的光重新透出！",
                    font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(2.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 绘制三块偏振片 P1/P2/P3
        # ══════════════════════════════════════════════════════════════════
        # P1: 透射轴竖直(0°)，P2: 斜 θ（先取 45°演示），P3: 水平(90°)
        p1 = make_polarizer("P1", 0, color=BLUE)
        p2 = make_polarizer("P2", 45, color=GREEN)
        p3 = make_polarizer("P3", 90, color=RED)

        polarizers = VGroup(p1, p2, p3).arrange(RIGHT, buff=1.6)
        polarizers.next_to(title, DOWN, buff=0.7)
        polarizers.shift(UP * 0.15)

        # 方向角标注
        ang1 = VGroup(
            Text("0", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"^\circ", color=BLUE).scale(0.52),
        ).arrange(RIGHT, buff=0.04).next_to(p1, DOWN, buff=0.12)
        ang2 = VGroup(
            MathTex(r"\theta", color=GREEN).scale(0.55),
        ).next_to(p2, DOWN, buff=0.12)
        ang3 = VGroup(
            Text("90", font=CJK, color=RED).scale(0.38),
            MathTex(r"^\circ", color=RED).scale(0.52),
        ).arrange(RIGHT, buff=0.04).next_to(p3, DOWN, buff=0.12)

        self.play(FadeIn(polarizers), FadeIn(ang1), FadeIn(ang2), FadeIn(ang3))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 自然光 I₀ 经 P1 → I₁ = I₀/2
        # ══════════════════════════════════════════════════════════════════
        # 光束：从左边射入 P1
        beam_in = Arrow(LEFT * 5.8 + p1.get_center()[1] * UP,
                        p1.get_left() + RIGHT * 0.05,
                        buff=0, color=WHITE, stroke_width=4)
        lbl_I0 = VGroup(
            MathTex(r"I_0", color=WHITE).scale(0.7),
            Text("自然光", font=CJK, color=WHITE).scale(0.38),
        ).arrange(DOWN, buff=0.1).next_to(beam_in, UP, buff=0.15)

        beam_12 = Arrow(p1.get_right() + RIGHT * 0.05,
                        p2.get_left() + LEFT * 0.05,
                        buff=0, color=YELLOW, stroke_width=4)
        lbl_I1 = MathTex(r"I_1=\frac{I_0}{2}", color=YELLOW).scale(0.58)
        lbl_I1.next_to(beam_12, UP, buff=0.15)

        self.play(Create(beam_in), FadeIn(lbl_I0))
        self.wait(0.5)
        self.play(Create(beam_12), Write(lbl_I1))

        # 推导说明（P1 将自然光变线偏振光）
        exp1 = Text("自然光经偏振片 P1 后：强度减半，变为线偏振光", font=CJK, color=GREEN).scale(0.42)
        exp1.to_edge(DOWN, buff=1.45)
        eq1 = MathTex(r"I_1 = \frac{I_0}{2}", color=YELLOW).scale(0.75)
        eq1.next_to(exp1, DOWN, buff=0.22)
        self.play(FadeIn(exp1), Write(eq1))
        self.wait(2.0)
        self.play(FadeOut(exp1), FadeOut(eq1))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: I₁ 经 P2（夹角 θ）→ I₂ = I₁cos²θ（马吕斯定律）
        # ══════════════════════════════════════════════════════════════════
        exp2_zh = Text("P1 透射光的振动方向与 P2 透射轴夹角为", font=CJK, color=WHITE).scale(0.42)
        exp2_sym = MathTex(r"\theta", color=GREEN).scale(0.6)
        exp2 = VGroup(exp2_zh, exp2_sym).arrange(RIGHT, buff=0.1)
        exp2.to_edge(DOWN, buff=1.6)

        malus = VGroup(
            Text("马吕斯定律：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"I_2 = I_1 \cos^2\theta = \frac{I_0}{2}\cos^2\theta", color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.18)
        malus.next_to(exp2, DOWN, buff=0.25)

        self.play(FadeIn(exp2))
        self.wait(0.6)
        self.play(Write(malus))
        self.wait(2.0)
        self.play(FadeOut(exp2), FadeOut(malus))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker 扫 θ，实时更新光强条形图
        # ══════════════════════════════════════════════════════════════════
        theta_tracker = ValueTracker(45.0)  # 度数

        # 条形图底座（放在偏振片下方区域）
        bar_area_y = polarizers.get_bottom()[1] - 0.6
        bar_x_center = polarizers.get_center()[0]

        # θ 数值标签
        theta_label = always_redraw(
            lambda: VGroup(
                MathTex(r"\theta = ", color=GREEN).scale(0.6),
                MathTex(
                    rf"{theta_tracker.get_value():.0f}",
                    r"^\circ",
                    color=GREEN
                ).scale(0.6),
            ).arrange(RIGHT, buff=0.05).to_edge(DOWN, buff=0.3).shift(LEFT * 3.5)
        )

        # I₂ 条形（蓝色）
        bar_max_h = 1.2
        bar_w = 0.5
        bar_bg_x = bar_x_center - 0.6
        bar_I2_bg = Rectangle(width=bar_w, height=bar_max_h, color=BLUE,
                               fill_opacity=0.15).move_to(
            [bar_bg_x, bar_area_y - bar_max_h / 2, 0])
        bar_lbl_I2 = VGroup(
            MathTex(r"I_2", color=BLUE).scale(0.5),
        ).next_to(bar_I2_bg, DOWN, buff=0.08)

        # I₃ 条形（红色，含 sin² 衰减）
        bar_I3_bg_x = bar_x_center + 0.6
        bar_I3_bg = Rectangle(width=bar_w, height=bar_max_h, color=RED,
                               fill_opacity=0.15).move_to(
            [bar_I3_bg_x, bar_area_y - bar_max_h / 2, 0])
        bar_lbl_I3 = VGroup(
            MathTex(r"I_3", color=RED).scale(0.5),
        ).next_to(bar_I3_bg, DOWN, buff=0.08)

        bar_I2 = always_redraw(lambda: Rectangle(
            width=bar_w,
            height=max(0.01, bar_max_h * math.cos(math.radians(theta_tracker.get_value())) ** 2),
            color=BLUE, fill_color=BLUE, fill_opacity=0.75,
        ).align_to(bar_I2_bg, DOWN).align_to(bar_I2_bg, LEFT))

        bar_I3 = always_redraw(lambda: Rectangle(
            width=bar_w,
            height=max(0.01,
                       bar_max_h
                       * math.cos(math.radians(theta_tracker.get_value())) ** 2
                       * math.sin(math.radians(theta_tracker.get_value())) ** 2
                       * 2),  # 归一化以可见
            color=RED, fill_color=RED, fill_opacity=0.75,
        ).align_to(bar_I3_bg, DOWN).align_to(bar_I3_bg, LEFT))

        # P2 方向箭头随 θ 实时旋转
        p2_arr_dyn = always_redraw(lambda: Arrow(
            p2[0].get_center(),
            p2[0].get_center() + 0.7 * np.array([
                math.sin(math.radians(theta_tracker.get_value())),
                math.cos(math.radians(theta_tracker.get_value())),
                0
            ]),
            buff=0, color=YELLOW, stroke_width=3,
            max_tip_length_to_length_ratio=0.35,
        ))
        # 先隐藏原 P2 箭头，替换为动态箭头
        self.play(FadeOut(p2[1]))
        self.add(p2_arr_dyn)

        bar_group = VGroup(bar_I2_bg, bar_I3_bg, bar_lbl_I2, bar_lbl_I3)
        self.play(FadeIn(bar_group), FadeIn(theta_label))
        self.add(bar_I2, bar_I3)
        self.wait(0.5)

        cap_scan = Text("拖动 θ 观察 I₂、I₃ 随角度的变化", font=CJK, color=CYAN).scale(0.4)
        cap_scan.to_edge(DOWN, buff=1.05)
        self.play(FadeIn(cap_scan))

        # θ 从 0° 扫到 90° 再回 45°
        self.play(theta_tracker.animate.set_value(0), run_time=2.0, rate_func=linear)
        self.play(theta_tracker.animate.set_value(90), run_time=3.5, rate_func=linear)
        self.play(theta_tracker.animate.set_value(45), run_time=2.0, rate_func=smooth)
        self.wait(1.0)
        self.play(FadeOut(cap_scan))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: I₂ 经 P3（与 P2 夹 90°-θ）→ I₃
        # ══════════════════════════════════════════════════════════════════
        # P2 与 P3 夹角为 90°-θ，P3 透射轴水平(90°)
        beam_23 = Arrow(p2.get_right() + RIGHT * 0.05,
                        p3.get_left() + LEFT * 0.05,
                        buff=0, color=ORANGE, stroke_width=4)
        lbl_I2_beam = MathTex(r"I_2=\frac{I_0}{2}\cos^2\theta", color=ORANGE).scale(0.52)
        lbl_I2_beam.next_to(beam_23, UP, buff=0.15)

        beam_out = Arrow(p3.get_right() + RIGHT * 0.05,
                         p3.get_right() + RIGHT * 1.5,
                         buff=0, color=RED, stroke_width=4)
        lbl_I3_beam = MathTex(r"I_3", color=RED).scale(0.65)
        lbl_I3_beam.next_to(beam_out, UP, buff=0.15)

        self.play(Create(beam_23), Write(lbl_I2_beam))
        self.wait(0.5)
        self.play(Create(beam_out), Write(lbl_I3_beam))

        exp3_line1 = VGroup(
            Text("P2 与 P3 透射轴夹角 =", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"90^\circ - \theta", color=RED).scale(0.6),
        ).arrange(RIGHT, buff=0.1)
        exp3_line1.to_edge(DOWN, buff=1.6)
        exp3_eq = MathTex(
            r"I_3 = I_2 \cos^2(90^\circ - \theta) = I_2 \sin^2\theta",
            color=YELLOW
        ).scale(0.68)
        exp3_eq.next_to(exp3_line1, DOWN, buff=0.22)

        self.play(FadeIn(exp3_line1))
        self.wait(0.5)
        self.play(Write(exp3_eq))
        self.wait(2.0)
        self.play(FadeOut(exp3_line1), FadeOut(exp3_eq))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 代入化简 → I₃ = I₀/8·sin²(2θ)
        # ══════════════════════════════════════════════════════════════════
        sub_title = Text("代入 I₂ 化简：", font=CJK, color=CYAN).scale(0.46)
        sub_title.to_edge(DOWN, buff=2.2)
        step_a = MathTex(
            r"I_3 = \frac{I_0}{2}\cos^2\theta \cdot \sin^2\theta",
            color=WHITE
        ).scale(0.72)
        step_a.next_to(sub_title, DOWN, buff=0.25)

        step_b = MathTex(
            r"= \frac{I_0}{2} \cdot \frac{\sin^2 2\theta}{4}",
            color=YELLOW
        ).scale(0.72)
        step_b.next_to(step_a, DOWN, buff=0.25)

        hint = VGroup(
            Text("利用二倍角公式：", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"\sin 2\theta = 2\sin\theta\cos\theta", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        hint.next_to(step_b, DOWN, buff=0.18)

        step_c = MathTex(
            r"I_3 = \frac{I_0}{8}\sin^2 2\theta",
            color=GREEN
        ).scale(0.88)
        step_c.next_to(hint, DOWN, buff=0.22)

        self.play(FadeIn(sub_title))
        self.play(Write(step_a))
        self.wait(1.0)
        self.play(Write(step_b))
        self.play(FadeIn(hint))
        self.wait(1.0)
        self.play(Write(step_c))
        self.wait(2.0)
        self.play(FadeOut(VGroup(sub_title, step_a, step_b, hint, step_c)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 绘制 I₃(θ) 曲线，高亮 θ=45° 极大值
        # ══════════════════════════════════════════════════════════════════
        # 清场偏振片区域
        self.play(
            FadeOut(VGroup(
                polarizers, ang1, ang2, ang3,
                beam_in, lbl_I0, beam_12, lbl_I1,
                beam_23, lbl_I2_beam, beam_out, lbl_I3_beam,
                bar_group, theta_label,
            )),
        )
        self.remove(bar_I2, bar_I3, p2_arr_dyn)
        self.wait(0.3)

        curve_title = Text("透射光强 I₃ 随偏振角 θ 的变化", font=CJK, color=BLUE).scale(0.5)
        curve_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(curve_title))

        axes = Axes(
            x_range=[0, 90, 15],
            y_range=[0, 0.14, 0.05],
            x_length=9,
            y_length=3.5,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.9)
        x_lbl = VGroup(
            MathTex(r"\theta", color=BLUE).scale(0.6),
            Text("（度）", font=CJK, color=BLUE).scale(0.35),
        ).arrange(RIGHT, buff=0.08).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_lbl = VGroup(
            MathTex(r"I_3/I_0", color=BLUE).scale(0.55),
        ).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        # x 轴刻度标注
        x_ticks_lbls = VGroup()
        for val in [0, 15, 30, 45, 60, 75, 90]:
            pos = axes.c2p(val, 0)
            lbl = MathTex(str(val), color=WHITE).scale(0.38).move_to(pos + DOWN * 0.3)
            x_ticks_lbls.add(lbl)
        # y 轴刻度
        y_ticks_lbls = VGroup()
        for val in [0.0, 0.05, 0.10]:
            pos = axes.c2p(0, val)
            lbl = MathTex(str(val), color=WHITE).scale(0.35).move_to(pos + LEFT * 0.5)
            y_ticks_lbls.add(lbl)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl),
                  FadeIn(x_ticks_lbls), FadeIn(y_ticks_lbls))

        # I₃/I₀ = sin²(2θ)/8
        curve = axes.plot(
            lambda x_deg: math.sin(math.radians(2 * x_deg)) ** 2 / 8.0,
            x_range=[0, 90],
            color=YELLOW,
            stroke_width=3,
        )
        self.play(Create(curve), run_time=2.0)
        self.wait(0.8)

        # 高亮 θ=45° 极大值
        peak_x = 45
        peak_y = math.sin(math.radians(2 * peak_x)) ** 2 / 8.0  # = 1/8 = 0.125
        peak_dot = Dot(axes.c2p(peak_x, peak_y), color=RED, radius=0.10)
        peak_v_line = DashedLine(
            axes.c2p(peak_x, 0),
            axes.c2p(peak_x, peak_y),
            color=CYAN, stroke_width=2,
        )
        peak_h_line = DashedLine(
            axes.c2p(0, peak_y),
            axes.c2p(peak_x, peak_y),
            color=CYAN, stroke_width=2,
        )
        peak_lbl_x = MathTex(r"\theta=45^\circ", color=RED).scale(0.55)
        peak_lbl_x.next_to(axes.c2p(peak_x, 0), DOWN, buff=0.35)
        peak_lbl_y = MathTex(r"\frac{I_0}{8}", color=RED).scale(0.55)
        peak_lbl_y.next_to(axes.c2p(0, peak_y), LEFT, buff=0.12)

        peak_cap = VGroup(
            Text("θ = 45° 时透射光强最大，", font=CJK, color=RED).scale(0.44),
            MathTex(r"I_{3,\max} = \frac{I_0}{8}", color=RED).scale(0.62),
        ).arrange(RIGHT, buff=0.15)
        peak_cap.to_edge(DOWN, buff=0.4)

        self.play(Create(peak_v_line), Create(peak_h_line), FadeIn(peak_dot))
        self.play(Write(peak_lbl_x), Write(peak_lbl_y))
        self.play(FadeIn(peak_cap))
        self.wait(2.2)
        self.play(FadeOut(VGroup(
            curve_title, axes, x_lbl, y_lbl, x_ticks_lbls, y_ticks_lbls,
            curve, peak_dot, peak_v_line, peak_h_line,
            peak_lbl_x, peak_lbl_y, peak_cap,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("P1 出射：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"I_1 = \dfrac{I_0}{2}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("P2 出射（马吕斯定律）：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"I_2 = \dfrac{I_0}{2}\cos^2\theta", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("P3 出射（再次马吕斯定律）：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"I_3 = I_2\cos^2(90^\circ-\theta) = I_2\sin^2\theta", color=YELLOW).scale(0.66),
        ).arrange(RIGHT, buff=0.2)

        s4_highlight = MathTex(
            r"I_3 = \frac{I_0}{8}\sin^2 2\theta",
            color=GREEN
        ).scale(0.95)

        s5 = VGroup(
            Text("极大值：θ = 45°，", font=CJK, color=RED).scale(0.44),
            MathTex(r"I_{3,\max} = \dfrac{I_0}{8}", color=RED).scale(0.75),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4_highlight, s5).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(s4_highlight, color=GREEN, buff=0.18, corner_radius=0.12)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(Write(s4_highlight), Create(box))
        self.wait(0.6)
        self.play(Write(s5))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Ex1ThreePolarizerTransmission",
        "id": "phys-ch11-11.3-ex1-three-polarizer-transmission",
        "chapterId": "ch11",
        "sectionId": "11.3",
        "title": "例题：三块偏振片串联光强",
        "description": "通过三块偏振片（P1竖直/P2斜θ/P3水平）演示马吕斯定律连续应用，ValueTracker扫角度实时更新光强，推导 I₃=I₀sin²(2θ)/8 并高亮 θ=45° 极大值。",
    },
]
