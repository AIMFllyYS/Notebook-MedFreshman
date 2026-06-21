"""第 3.2 节 · 同向同频简谐振动的合成（旋转矢量法）

可视化流程：
  Step 1  标题 + 副标题
  Step 2  生活类比引入
  Step 3  旋转矢量定义（静止圆图，画 A₁ A₂ 及平行四边形合矢量，标注合振幅公式）
  Step 4  ValueTracker 扫动相位差 Δφ（0→2π），A₁固定, A₂旋转，实时更新合矢量，
          右侧坐标系同步画 A(Δφ) 余弦形曲线
  Step 5  Δφ=0（同相）高亮 A_max = A₁+A₂
  Step 6  Δφ=π（反相）高亮 A_min = |A₁-A₂|
  Step 7  x-t 波形对比（x₁ x₂ x 三条曲线）
  Step 8  初相公式 + 小结卡

铁律：MathTex 内部纯 ASCII LaTeX；中文一律 Text(font=CJK)；CYAN 顶部自定义。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ──────────────────────────────────────────────────────────────
A1_VAL = 1.4        # 振幅1
A2_VAL = 1.0        # 振幅2
PHI1   = PI / 6     # 初相1 (30°)
OMEGA  = 1.0        # 角频率（均相同）
PHASOR_SCALE = 1.0  # 矢量图缩放因子（圆半径参考）


def phasor_tip(A, phi, dphi=0.0):
    """给定振幅 A、基准初相 phi 与附加相位差 dphi，返回矢量终点坐标 (x, y)。"""
    angle = phi + dphi
    return np.array([A * math.cos(angle), A * math.sin(angle), 0])


class Ch03Kp1SameFreqSynthesisPhasor(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════
        title = Text(
            "同向同频简谐振动的合成（旋转矢量法）",
            font=CJK, color=BLUE
        ).scale(0.58).to_edge(UP, buff=0.25)

        subtitle = Text(
            "第三章 振动  ·  3.2 节",
            font=CJK, color=WHITE
        ).scale(0.38).next_to(title, DOWN, buff=0.14)

        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text(
            "两列声波在空中叠加——有时声音变响，有时相互抵消。",
            font=CJK
        ).scale(0.46)
        ana2 = Text(
            "「旋转矢量法」把每个简谐振动表示成旋转的箭头，",
            font=CJK
        ).scale(0.46)
        ana3 = Text(
            "合成只需做矢量加法，一目了然。",
            font=CJK, color=YELLOW
        ).scale(0.46)

        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28)
        ana.next_to(title, DOWN, buff=0.55)

        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3  静止矢量图 + 平行四边形 + 合振幅公式
        # ══════════════════════════════════════════════════════════════════
        # —— 矢量图圆心置于左侧 ——
        center = np.array([-3.5, -0.6, 0])

        # 参考圆（虚线）
        ref_circle = Circle(radius=1.8, color=BLUE_E, stroke_opacity=0.35)
        ref_circle.move_to(center)

        # A₁ 矢量
        tip1 = center + phasor_tip(A1_VAL, PHI1)
        arr1 = Arrow(center, tip1, buff=0, color=YELLOW, stroke_width=3, max_tip_length_to_length_ratio=0.15)

        # A₂ 矢量（初始 Δφ=PI/3，即 φ₂ = φ₁ + π/3）
        PHI2_INIT = PHI1 + PI / 3
        tip2_init = center + phasor_tip(A2_VAL, PHI2_INIT)
        arr2 = Arrow(center, tip2_init, buff=0, color=GREEN, stroke_width=3, max_tip_length_to_length_ratio=0.15)

        # 合矢量 A（平行四边形对角线）
        tip_A_init = center + phasor_tip(A1_VAL, PHI1) + phasor_tip(A2_VAL, PHI2_INIT)
        arr_A = Arrow(center, tip_A_init, buff=0, color=RED, stroke_width=3.5, max_tip_length_to_length_ratio=0.15)

        # 平行四边形辅助线
        para_line1 = DashedLine(tip1, tip_A_init, color=GREEN, stroke_width=1.5, dash_length=0.1)
        para_line2 = DashedLine(tip2_init, tip_A_init, color=YELLOW, stroke_width=1.5, dash_length=0.1)

        # 标注
        lbl1 = MathTex(r"A_1", color=YELLOW).scale(0.6).next_to(tip1, UP, buff=0.1)
        lbl2 = MathTex(r"A_2", color=GREEN).scale(0.6).next_to(tip2_init, LEFT, buff=0.1)
        lbl_A = MathTex(r"A", color=RED).scale(0.6).next_to(tip_A_init, RIGHT, buff=0.1)

        # 相位角标注（圆弧）
        phi1_arc = Arc(radius=0.45, start_angle=0, angle=PHI1, color=YELLOW, stroke_width=2).move_arc_center_to(center)
        phi1_lbl = MathTex(r"\varphi_1", color=YELLOW).scale(0.5)
        phi1_lbl.move_to(center + np.array([0.65 * math.cos(PHI1 / 2), 0.65 * math.sin(PHI1 / 2), 0]))

        phi2_arc = Arc(radius=0.65, start_angle=0, angle=PHI2_INIT, color=GREEN, stroke_width=2).move_arc_center_to(center)
        phi2_lbl = MathTex(r"\varphi_2", color=GREEN).scale(0.5)
        phi2_lbl.move_to(center + np.array([0.90 * math.cos(PHI2_INIT / 2), 0.90 * math.sin(PHI2_INIT / 2), 0]))

        # 合振幅公式（右侧显示）
        formula_label = Text("合振幅公式：", font=CJK, color=WHITE).scale(0.44)
        formula_eq = MathTex(
            r"A = \sqrt{A_1^2 + A_2^2 + 2A_1 A_2 \cos(\varphi_2 - \varphi_1)}"
        ).scale(0.58)
        formula_eq.set_color_by_tex("A_1", YELLOW)
        formula_eq.set_color_by_tex("A_2", GREEN)
        formula_block = VGroup(formula_label, formula_eq).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        formula_block.next_to(title, DOWN, buff=0.55)
        formula_block.to_edge(RIGHT, buff=0.5)

        phasor_group = VGroup(
            ref_circle, arr1, arr2, arr_A,
            para_line1, para_line2,
            lbl1, lbl2, lbl_A,
            phi1_arc, phi1_lbl, phi2_arc, phi2_lbl
        )

        step3_caption = Text(
            "用平行四边形法则将 A₁ 与 A₂ 相加，得到合矢量 A",
            font=CJK, color=WHITE
        ).scale(0.4).to_edge(DOWN, buff=0.45)

        self.play(Create(ref_circle))
        self.play(GrowArrow(arr1), GrowArrow(arr2))
        self.play(FadeIn(lbl1), FadeIn(lbl2), FadeIn(phi1_arc), FadeIn(phi1_lbl), FadeIn(phi2_arc), FadeIn(phi2_lbl))
        self.play(Create(para_line1), Create(para_line2))
        self.play(GrowArrow(arr_A), FadeIn(lbl_A))
        self.play(FadeIn(formula_block), FadeIn(step3_caption))
        self.wait(2.0)

        # 清场：保留 title，清除矢量图和公式
        self.play(FadeOut(phasor_group), FadeOut(formula_block), FadeOut(step3_caption))

        # ══════════════════════════════════════════════════════════════════
        # Step 4  ValueTracker 扫动 Δφ：左侧矢量图 + 右侧 A(Δφ) 曲线
        # ══════════════════════════════════════════════════════════════════
        dphi_tracker = ValueTracker(PI / 3)   # 初始 Δφ

        # 左侧矢量图（动态）
        # 参考圆
        circ2 = Circle(radius=1.5, color=BLUE_E, stroke_opacity=0.35).move_to(center)

        # A₁（固定）
        tip1_fixed = center + phasor_tip(A1_VAL, PHI1)
        arr1_fixed = Arrow(center, tip1_fixed, buff=0, color=YELLOW,
                           stroke_width=3, max_tip_length_to_length_ratio=0.15)
        lbl1_fixed = MathTex(r"A_1", color=YELLOW).scale(0.56).next_to(tip1_fixed, UR, buff=0.05)

        # A₂（随 Δφ 旋转）
        arr2_dyn = always_redraw(lambda: Arrow(
            center,
            center + phasor_tip(A2_VAL, PHI1 + dphi_tracker.get_value()),
            buff=0, color=GREEN, stroke_width=3,
            max_tip_length_to_length_ratio=0.15
        ))
        lbl2_dyn = always_redraw(lambda: MathTex(r"A_2", color=GREEN).scale(0.56).next_to(
            center + phasor_tip(A2_VAL, PHI1 + dphi_tracker.get_value()), LEFT, buff=0.08
        ))

        # 合矢量 A（动态）
        arr_A_dyn = always_redraw(lambda: Arrow(
            center,
            center + phasor_tip(A1_VAL, PHI1) + phasor_tip(A2_VAL, PHI1 + dphi_tracker.get_value()),
            buff=0, color=RED, stroke_width=3.5,
            max_tip_length_to_length_ratio=0.15
        ))
        lbl_A_dyn = always_redraw(lambda: MathTex(r"A", color=RED).scale(0.56).next_to(
            center + phasor_tip(A1_VAL, PHI1) + phasor_tip(A2_VAL, PHI1 + dphi_tracker.get_value()),
            RIGHT, buff=0.08
        ))

        # 右侧坐标系：A 随 Δφ 的关系
        right_axes = Axes(
            x_range=[0, 2 * PI + 0.1, PI / 2],
            y_range=[0, A1_VAL + A2_VAL + 0.4, 0.5],
            x_length=5.5,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
        ).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.3)

        x_lbl2 = MathTex(r"\Delta\varphi").scale(0.52).next_to(right_axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl2 = MathTex(r"A").scale(0.52).next_to(right_axes.y_axis.get_end(), LEFT, buff=0.12)

        # A(Δφ) 完整曲线（淡显）
        def amp_func(dphi):
            return math.sqrt(A1_VAL**2 + A2_VAL**2 + 2 * A1_VAL * A2_VAL * math.cos(dphi))

        full_curve = right_axes.plot(amp_func, x_range=[0, 2 * PI], color=ORANGE)

        # 动态追踪点
        dot_curve = always_redraw(lambda: Dot(
            right_axes.c2p(dphi_tracker.get_value() % (2 * PI), amp_func(dphi_tracker.get_value())),
            color=RED, radius=0.09
        ))

        # 扫动痕迹（用 TracedPath）
        trace_ref = always_redraw(lambda: Dot(
            right_axes.c2p(dphi_tracker.get_value() % (2 * PI), amp_func(dphi_tracker.get_value())),
            radius=0
        ))

        # Δφ 数值标注
        dphi_label_prefix = Text("相位差  ", font=CJK, color=WHITE).scale(0.42)
        dphi_val_tex = always_redraw(lambda: MathTex(
            r"\Delta\varphi = {:.2f}".format(dphi_tracker.get_value())
        ).scale(0.48).set_color(CYAN))
        dphi_row = always_redraw(lambda: VGroup(
            Text("相位差  ", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta\varphi = {:.2f}".format(dphi_tracker.get_value())).scale(0.48).set_color(CYAN)
        ).arrange(RIGHT, buff=0.12).next_to(circ2, DOWN, buff=0.45))

        caption4 = Text(
            "A₁ 固定，A₂ 随 Δφ 旋转，合振幅 A 随相位差变化",
            font=CJK, color=WHITE
        ).scale(0.40).to_edge(DOWN, buff=0.35)

        self.play(
            Create(circ2),
            GrowArrow(arr1_fixed), FadeIn(lbl1_fixed),
            Create(right_axes), FadeIn(x_lbl2), FadeIn(y_lbl2)
        )
        self.play(Create(arr2_dyn), FadeIn(lbl2_dyn), Create(arr_A_dyn), FadeIn(lbl_A_dyn))
        self.play(FadeIn(dphi_row), FadeIn(caption4))
        self.play(Create(full_curve, run_time=0.8))
        self.add(dot_curve)
        self.wait(0.5)

        # 扫动 Δφ 从当前值 → 2π
        self.play(
            dphi_tracker.animate.set_value(2 * PI),
            run_time=5, rate_func=linear
        )
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 5  Δφ=0 同相：高亮 A_max = A₁+A₂
        # ══════════════════════════════════════════════════════════════════
        self.play(dphi_tracker.animate.set_value(0.0), run_time=1.2)
        self.wait(0.5)

        amax_val = A1_VAL + A2_VAL
        amax_dot = Dot(right_axes.c2p(0.0, amax_val), color=YELLOW, radius=0.13)

        amax_label_zh = Text("同相加强", font=CJK, color=YELLOW).scale(0.44)
        amax_label_eq = MathTex(r"A_{\max} = A_1 + A_2", color=YELLOW).scale(0.62)
        amax_block = VGroup(amax_label_zh, amax_label_eq).arrange(DOWN, buff=0.18)
        amax_block.next_to(right_axes, UP, buff=0.22).shift(LEFT * 1.0)

        # 合矢量此时最长（Δφ=0 意味着 A₂ 和 A₁ 方向相同）
        # 在矢量图中高亮合矢量
        highlight_box = SurroundingRectangle(arr_A_dyn, color=YELLOW, buff=0.06, corner_radius=0.05)

        self.play(
            FadeIn(amax_dot),
            Write(amax_block),
            Create(highlight_box)
        )
        self.wait(2.0)
        self.play(FadeOut(amax_block), FadeOut(amax_dot), FadeOut(highlight_box))

        # ══════════════════════════════════════════════════════════════════
        # Step 6  Δφ=π 反相：高亮 A_min = |A₁-A₂|
        # ══════════════════════════════════════════════════════════════════
        self.play(dphi_tracker.animate.set_value(PI), run_time=1.5)
        self.wait(0.5)

        amin_val = abs(A1_VAL - A2_VAL)
        amin_dot = Dot(right_axes.c2p(PI, amin_val), color=CYAN, radius=0.13)

        amin_label_zh = Text("反相相消", font=CJK, color=CYAN).scale(0.44)
        amin_label_eq = MathTex(r"A_{\min} = |A_1 - A_2|", color=CYAN).scale(0.62)
        amin_block = VGroup(amin_label_zh, amin_label_eq).arrange(DOWN, buff=0.18)
        amin_block.next_to(right_axes, UP, buff=0.22).shift(LEFT * 1.0)

        highlight_box2 = SurroundingRectangle(arr_A_dyn, color=CYAN, buff=0.06, corner_radius=0.05)

        self.play(
            FadeIn(amin_dot),
            Write(amin_block),
            Create(highlight_box2)
        )
        self.wait(2.0)

        # 清场（保留 title）
        self.play(FadeOut(VGroup(
            circ2, arr1_fixed, lbl1_fixed,
            arr2_dyn, lbl2_dyn, arr_A_dyn, lbl_A_dyn,
            right_axes, x_lbl2, y_lbl2, full_curve, dot_curve,
            dphi_row, caption4,
            amin_dot, amin_block, highlight_box2, amax_dot
        )))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 7  x-t 波形对比（x₁, x₂, x 三条曲线）
        # ══════════════════════════════════════════════════════════════════
        wt_axes = Axes(
            x_range=[0, 4 * PI + 0.1, PI],
            y_range=[-3.0, 3.0, 1.0],
            x_length=10.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.5},
        ).next_to(title, DOWN, buff=0.55).shift(DOWN * 0.1)

        wt_x_lbl = MathTex(r"\omega t").scale(0.52).next_to(wt_axes.x_axis.get_end(), DOWN, buff=0.15)
        wt_y_lbl = MathTex(r"x").scale(0.52).next_to(wt_axes.y_axis.get_end(), LEFT, buff=0.12)

        # 使用固定 Δφ=PI/3 的示例
        dphi_demo = PI / 3
        phi2_demo = PHI1 + dphi_demo

        # 合振幅和合初相
        A_comp = math.sqrt(A1_VAL**2 + A2_VAL**2 + 2 * A1_VAL * A2_VAL * math.cos(dphi_demo))
        phi_comp = math.atan2(
            A1_VAL * math.sin(PHI1) + A2_VAL * math.sin(phi2_demo),
            A1_VAL * math.cos(PHI1) + A2_VAL * math.cos(phi2_demo)
        )

        curve_x1 = wt_axes.plot(
            lambda t: A1_VAL * math.cos(OMEGA * t + PHI1),
            x_range=[0, 4 * PI], color=YELLOW, stroke_width=2.5
        )
        curve_x2 = wt_axes.plot(
            lambda t: A2_VAL * math.cos(OMEGA * t + phi2_demo),
            x_range=[0, 4 * PI], color=GREEN, stroke_width=2.5
        )
        curve_x = wt_axes.plot(
            lambda t: A_comp * math.cos(OMEGA * t + phi_comp),
            x_range=[0, 4 * PI], color=RED, stroke_width=3.0
        )

        # 图例
        leg_x1_line = Line(ORIGIN, RIGHT * 0.5, color=YELLOW, stroke_width=2.5)
        leg_x1_lbl = VGroup(
            leg_x1_line,
            MathTex(r"x_1", color=YELLOW).scale(0.52)
        ).arrange(RIGHT, buff=0.12)

        leg_x2_line = Line(ORIGIN, RIGHT * 0.5, color=GREEN, stroke_width=2.5)
        leg_x2_lbl = VGroup(
            leg_x2_line,
            MathTex(r"x_2", color=GREEN).scale(0.52)
        ).arrange(RIGHT, buff=0.12)

        leg_x_line = Line(ORIGIN, RIGHT * 0.5, color=RED, stroke_width=3.0)
        leg_x_lbl = VGroup(
            leg_x_line,
            MathTex(r"x = x_1 + x_2", color=RED).scale(0.52)
        ).arrange(RIGHT, buff=0.12)

        legend = VGroup(leg_x1_lbl, leg_x2_lbl, leg_x_lbl).arrange(RIGHT, buff=0.55)
        legend.to_edge(DOWN, buff=0.35)

        wt_caption = Text(
            "合振动仍是同频简谐振动，振幅由相位差决定",
            font=CJK, color=WHITE
        ).scale(0.40).next_to(legend, UP, buff=0.2)

        self.play(Create(wt_axes), FadeIn(wt_x_lbl), FadeIn(wt_y_lbl))
        self.play(Create(curve_x1, run_time=1.4))
        self.play(Create(curve_x2, run_time=1.4))
        self.play(Create(curve_x, run_time=1.6))
        self.play(FadeIn(legend), FadeIn(wt_caption))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            wt_axes, wt_x_lbl, wt_y_lbl,
            curve_x1, curve_x2, curve_x,
            legend, wt_caption
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 8  初相公式 + 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)

        s_eq1 = MathTex(
            r"A = \sqrt{A_1^2 + A_2^2 + 2A_1 A_2 \cos(\varphi_2 - \varphi_1)}",
            color=YELLOW
        ).scale(0.64)

        s_eq2 = MathTex(
            r"\tan\varphi = \frac{A_1\sin\varphi_1 + A_2\sin\varphi_2}"
            r"{A_1\cos\varphi_1 + A_2\cos\varphi_2}",
            color=YELLOW
        ).scale(0.64)

        s_eq3_zh = Text("同相（Δφ=0）：", font=CJK, color=GREEN).scale(0.44)
        s_eq3_math = MathTex(r"A_{\max} = A_1 + A_2", color=GREEN).scale(0.62)
        s_eq3 = VGroup(s_eq3_zh, s_eq3_math).arrange(RIGHT, buff=0.2)

        s_eq4_zh = Text("反相（Δφ=π）：", font=CJK, color=CYAN).scale(0.44)
        s_eq4_math = MathTex(r"A_{\min} = |A_1 - A_2|", color=CYAN).scale(0.62)
        s_eq4 = VGroup(s_eq4_zh, s_eq4_math).arrange(RIGHT, buff=0.2)

        s_note = Text(
            "合振动仍是同频简谐振动，合振幅完全由相位差 Δφ 决定",
            font=CJK, color=WHITE
        ).scale(0.42)

        summary = VGroup(s_eq1, s_eq2, s_eq3, s_eq4, s_note).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.35)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_eq1))
        self.wait(0.6)
        self.play(Write(s_eq2))
        self.wait(0.6)
        self.play(FadeIn(s_eq3))
        self.wait(0.5)
        self.play(FadeIn(s_eq4))
        self.wait(0.5)
        self.play(FadeIn(s_note), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch03Kp1SameFreqSynthesisPhasor",
        "id": "phys-ch03-3.2-kp1-same-freq-synthesis-phasor",
        "chapterId": "ch03",
        "sectionId": "3.2",
        "title": "同向同频简谐振动的合成（旋转矢量法）",
        "description": "用旋转矢量（相量）法演示同向同频简谐振动的合成：平行四边形法则、合振幅随相位差余弦变化、同相加强/反相相消的极值条件，以及 x-t 波形对比。",
    }
]
