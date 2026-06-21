"""第 3.2 节 · 旋转矢量法数值合成（例3-10）

用旋转矢量（相量）方法合成两个同频简谐振动：
  x1 = 4 cos(3πt + π/3)   （A1=4, φ1=π/3）
  x2 = 3 cos(3πt - π/6)   （A2=3, φ2=-π/6）

可视化流程：
  1. 相量圆图 — 分别画出 A1（蓝）与 A2（橙）
  2. 平行四边形法合矢量 A（绿）
  3. 逐步推导：Δφ=-π/2，A=5，φ=0.128π
  4. x-t 坐标系三条波形验证

铁律：MathTex 内只能含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理参数
A1 = 4.0
A2 = 3.0
PHI1 = math.pi / 3          # π/3
PHI2 = -math.pi / 6         # -π/6
OMEGA = 3 * math.pi
DELTA_PHI = PHI2 - PHI1     # -π/2
A_SUM = math.sqrt(A1**2 + A2**2 + 2 * A1 * A2 * math.cos(DELTA_PHI))  # 5.0
PHI_SUM = math.atan2(
    A1 * math.sin(PHI1) + A2 * math.sin(PHI2),
    A1 * math.cos(PHI1) + A2 * math.cos(PHI2),
)  # ≈ 0.128π


class Ch03Ex1PhasorAdditionExample(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("旋转矢量法数值合成（例3-10）", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第3章 振动 · 3.2 旋转矢量合成", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("两根弹簧同时拨动同一个质点，", font=CJK).scale(0.46)
        ana2 = Text("合振动到底振多大？「旋转矢量」让你一眼看出答案。", font=CJK).scale(0.46)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 题目给出的两个分振动 ───────────────────────────────
        prob_label = Text("已知两分振动（同频 ω=3π）：", font=CJK, color=YELLOW).scale(0.44)
        prob_label.next_to(title, DOWN, buff=0.45)
        eq1 = MathTex(
            r"x_1 = 4\cos\!\left(3\pi t + \tfrac{\pi}{3}\right)\,\mathrm{m}",
            color=BLUE,
        ).scale(0.72)
        eq2 = MathTex(
            r"x_2 = 3\cos\!\left(3\pi t - \tfrac{\pi}{6}\right)\,\mathrm{m}",
            color=ORANGE,
        ).scale(0.72)
        eqs = VGroup(eq1, eq2).arrange(DOWN, buff=0.32).next_to(prob_label, DOWN, buff=0.35)
        self.play(FadeIn(prob_label))
        self.play(Write(eq1))
        self.wait(0.5)
        self.play(Write(eq2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(prob_label, eqs)))

        # ── Step 4: 相量圆图 — 画出 A1 和 A2 ───────────────────────────
        # 圆图放在左半屏，推导文字放右半屏
        circle_center = LEFT * 3.2 + DOWN * 0.3
        SCALE = 0.88  # 单位长度（屏幕单位/物理单位）

        circle = Circle(radius=A_SUM * SCALE, color=GREY, stroke_width=1.0)
        circle.move_to(circle_center)

        # 坐标轴（仅圆图区域）
        circ_ax = NumberPlane(
            x_range=[-5.5, 5.5, 1],
            y_range=[-5.5, 5.5, 1],
            x_length=8 * SCALE * 1.2,
            y_length=8 * SCALE * 1.2,
            background_line_style={"stroke_color": GREY, "stroke_width": 0.6, "stroke_opacity": 0.35},
            axis_config={"stroke_color": GREY, "stroke_width": 1.0},
        ).move_to(circle_center)

        phasor_label = Text("相量图", font=CJK, color=WHITE).scale(0.42)
        phasor_label.next_to(circ_ax, UP, buff=0.1)

        self.play(Create(circ_ax), FadeIn(phasor_label))
        self.wait(0.4)

        # A1 矢量：幅值 4，角度 π/3（60°）蓝色
        a1_end = circle_center + np.array([
            A1 * SCALE * math.cos(PHI1),
            A1 * SCALE * math.sin(PHI1),
            0,
        ])
        vec_a1 = Arrow(
            circle_center, a1_end, buff=0,
            color=BLUE, stroke_width=3.5, max_tip_length_to_length_ratio=0.12,
        )
        lbl_a1 = MathTex(r"A_1=4", color=BLUE).scale(0.52)
        lbl_a1.next_to(a1_end, UP + RIGHT * 0.4, buff=0.08)

        # A1 端点坐标标注（余弦/正弦分量）
        cos1 = A1 * math.cos(PHI1)   # = 2.0
        sin1 = A1 * math.sin(PHI1)   # = 2√3 ≈ 3.46
        coord_a1 = VGroup(
            MathTex(r"(2,\;2\sqrt{3})", color=BLUE).scale(0.42)
        ).next_to(lbl_a1, DOWN, buff=0.05)

        self.play(GrowArrow(vec_a1), FadeIn(lbl_a1))
        self.wait(0.5)
        self.play(FadeIn(coord_a1))
        self.wait(0.8)

        # A2 矢量：幅值 3，角度 -π/6（-30°）橙色
        a2_end = circle_center + np.array([
            A2 * SCALE * math.cos(PHI2),
            A2 * SCALE * math.sin(PHI2),
            0,
        ])
        vec_a2 = Arrow(
            circle_center, a2_end, buff=0,
            color=ORANGE, stroke_width=3.5, max_tip_length_to_length_ratio=0.12,
        )
        lbl_a2 = MathTex(r"A_2=3", color=ORANGE).scale(0.52)
        lbl_a2.next_to(a2_end, DOWN + RIGHT * 0.4, buff=0.08)

        cos2 = A2 * math.cos(PHI2)   # = 3√3/2 ≈ 2.60
        sin2 = A2 * math.sin(PHI2)   # = -1.5
        coord_a2 = VGroup(
            MathTex(r"\!\left(\tfrac{3\sqrt{3}}{2},\,-\tfrac{3}{2}\right)", color=ORANGE).scale(0.42)
        ).next_to(lbl_a2, DOWN, buff=0.05)

        self.play(GrowArrow(vec_a2), FadeIn(lbl_a2))
        self.wait(0.5)
        self.play(FadeIn(coord_a2))
        self.wait(1.0)

        # ── Step 5: 平行四边形法合矢量 ─────────────────────────────────
        # A_SUM 端点
        a_sum_x = (A1 * math.cos(PHI1) + A2 * math.cos(PHI2)) * SCALE
        a_sum_y = (A1 * math.sin(PHI1) + A2 * math.sin(PHI2)) * SCALE
        a_sum_end = circle_center + np.array([a_sum_x, a_sum_y, 0])

        # 平行四边形辅助线：A1 平移到 A2 末端
        par_line1 = DashedLine(
            a2_end,
            a2_end + (a1_end - circle_center),
            color=BLUE, stroke_width=1.8, dash_length=0.12,
        )
        # A2 平移到 A1 末端
        par_line2 = DashedLine(
            a1_end,
            a1_end + (a2_end - circle_center),
            color=ORANGE, stroke_width=1.8, dash_length=0.12,
        )
        par_note = Text("平行四边形辅助线", font=CJK, color=GREY).scale(0.36)
        par_note.next_to(circ_ax, DOWN, buff=0.12)

        self.play(Create(par_line1), Create(par_line2), FadeIn(par_note))
        self.wait(0.8)

        # 合矢量
        vec_a = Arrow(
            circle_center, a_sum_end, buff=0,
            color=GREEN, stroke_width=4.5, max_tip_length_to_length_ratio=0.10,
        )
        lbl_a = MathTex(r"A=5", color=GREEN).scale(0.56)
        lbl_a.next_to(a_sum_end, LEFT, buff=0.12)

        self.play(GrowArrow(vec_a), FadeIn(lbl_a))
        self.wait(1.2)

        # ── Step 6: 右侧逐步推导 ──────────────────────────────────────
        right_x = RIGHT * 2.1
        derive_title = Text("逐步计算", font=CJK, color=YELLOW).scale(0.44)
        derive_title.move_to(right_x + UP * 2.8)

        # 6a: Δφ
        d1_zh = Text("相位差：", font=CJK).scale(0.4)
        d1_eq = MathTex(r"\Delta\varphi = \varphi_2 - \varphi_1").scale(0.58)
        d1 = VGroup(d1_zh, d1_eq).arrange(RIGHT, buff=0.12)
        d1.move_to(right_x + UP * 2.1)

        d2_eq = MathTex(
            r"= -\frac{\pi}{6} - \frac{\pi}{3} = -\frac{\pi}{2}",
            color=YELLOW,
        ).scale(0.58)
        d2_eq.next_to(d1, DOWN, buff=0.22, aligned_edge=LEFT)
        d2_eq.shift(RIGHT * 0.5)

        self.play(FadeIn(derive_title))
        self.play(Write(d1))
        self.wait(0.5)
        self.play(Write(d2_eq))
        self.wait(1.0)

        # 6b: 合振幅公式
        d3_zh = Text("合振幅：", font=CJK).scale(0.4)
        d3_eq = MathTex(
            r"A = \sqrt{A_1^2 + A_2^2 + 2A_1 A_2\cos\Delta\varphi}"
        ).scale(0.52)
        d3 = VGroup(d3_zh, d3_eq).arrange(RIGHT, buff=0.12)
        d3.next_to(d2_eq, DOWN, buff=0.28, aligned_edge=LEFT)
        d3.shift(LEFT * 0.3)

        d4_eq = MathTex(
            r"= \sqrt{16 + 9 + 24\cos\!\left(-\tfrac{\pi}{2}\right)}",
            color=WHITE,
        ).scale(0.52)
        d4_eq.next_to(d3, DOWN, buff=0.2, aligned_edge=LEFT)
        d4_eq.shift(RIGHT * 0.5)

        d5_eq = MathTex(
            r"= \sqrt{16 + 9 + 0} = \sqrt{25} = 5\,\mathrm{m}",
            color=GREEN,
        ).scale(0.58)
        d5_eq.next_to(d4_eq, DOWN, buff=0.2, aligned_edge=LEFT)

        self.play(Write(d3))
        self.wait(0.4)
        self.play(Write(d4_eq))
        self.wait(0.5)
        self.play(Write(d5_eq))
        d5_eq.set_color(GREEN)
        self.wait(1.0)

        # 6c: 合初相
        d6_zh = Text("合初相：", font=CJK).scale(0.4)
        d6_eq = MathTex(
            r"\varphi = \arctan\!\frac{A_1\sin\varphi_1+A_2\sin\varphi_2}"
            r"{A_1\cos\varphi_1+A_2\cos\varphi_2}"
        ).scale(0.44)
        d6 = VGroup(d6_zh, d6_eq).arrange(RIGHT, buff=0.1)
        d6.next_to(d5_eq, DOWN, buff=0.28, aligned_edge=LEFT)
        d6.shift(LEFT * 0.3)

        d7_eq = MathTex(
            r"\approx 0.128\pi\,\mathrm{rad}",
            color=GREEN,
        ).scale(0.56)
        d7_eq.next_to(d6, DOWN, buff=0.2, aligned_edge=LEFT)
        d7_eq.shift(RIGHT * 0.5)

        self.play(Write(d6))
        self.wait(0.5)
        self.play(Write(d7_eq))
        self.wait(1.2)

        # 清除相量图区域，保留推导文字，准备下一场景
        self.play(
            FadeOut(VGroup(
                circ_ax, phasor_label, circle,
                vec_a1, lbl_a1, coord_a1,
                vec_a2, lbl_a2, coord_a2,
                par_line1, par_line2, par_note,
                vec_a, lbl_a,
            ))
        )
        self.wait(0.4)

        # 把推导结果平移到顶部，腾出空间给波形
        result_group = VGroup(derive_title, d1, d2_eq, d3, d4_eq, d5_eq, d6, d7_eq)
        self.play(result_group.animate.scale(0.78).to_edge(UP, buff=0.5))
        self.wait(0.6)

        # ── Step 7: x-t 坐标系三条波形 ────────────────────────────────
        axes = Axes(
            x_range=[0, 2.0, 0.5],
            y_range=[-5.5, 5.5, 2],
            x_length=10,
            y_length=4.0,
            axis_config={"color": GREY, "include_tip": True, "stroke_width": 1.5},
            x_axis_config={"numbers_to_include": [0.5, 1.0, 1.5, 2.0]},
            y_axis_config={"numbers_to_include": [-4, -2, 0, 2, 4]},
        ).to_edge(DOWN, buff=0.45)

        x_lbl = MathTex(r"t\,/\,\mathrm{s}").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"x\,/\,\mathrm{m}").scale(0.5).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 三条曲线
        curve1 = axes.plot(
            lambda t_: A1 * math.cos(OMEGA * t_ + PHI1),
            x_range=[0, 2.0, 0.005],
            color=BLUE,
            stroke_width=2.5,
        )
        curve2 = axes.plot(
            lambda t_: A2 * math.cos(OMEGA * t_ + PHI2),
            x_range=[0, 2.0, 0.005],
            color=ORANGE,
            stroke_width=2.5,
        )
        curve_sum = axes.plot(
            lambda t_: A_SUM * math.cos(OMEGA * t_ + PHI_SUM),
            x_range=[0, 2.0, 0.005],
            color=GREEN,
            stroke_width=3.2,
        )

        lbl_c1 = VGroup(
            MathTex(r"x_1", color=BLUE).scale(0.5),
            Text("(A=4)", font=CJK, color=BLUE).scale(0.34),
        ).arrange(RIGHT, buff=0.08)
        lbl_c2 = VGroup(
            MathTex(r"x_2", color=ORANGE).scale(0.5),
            Text("(A=3)", font=CJK, color=ORANGE).scale(0.34),
        ).arrange(RIGHT, buff=0.08)
        lbl_cs = VGroup(
            MathTex(r"x", color=GREEN).scale(0.5),
            Text("(A=5，合振动)", font=CJK, color=GREEN).scale(0.34),
        ).arrange(RIGHT, buff=0.08)

        legend = VGroup(lbl_c1, lbl_c2, lbl_cs).arrange(RIGHT, buff=0.55)
        legend.next_to(axes, UP, buff=0.14)

        self.play(Create(curve1), Create(curve2), run_time=1.5)
        self.play(FadeIn(lbl_c1), FadeIn(lbl_c2))
        self.wait(0.6)
        self.play(Create(curve_sum), run_time=1.5)
        self.play(FadeIn(lbl_cs))
        self.wait(1.5)

        # 振幅线标注
        amp_line = DashedLine(
            axes.c2p(0, A_SUM), axes.c2p(2.0, A_SUM),
            color=GREEN, stroke_width=1.5, dash_length=0.15,
        )
        amp_lbl = MathTex(r"A=5\,\mathrm{m}", color=GREEN).scale(0.46)
        amp_lbl.next_to(amp_line, RIGHT, buff=0.08)
        self.play(Create(amp_line), FadeIn(amp_lbl))
        self.wait(1.5)

        # 清场
        self.play(
            FadeOut(VGroup(
                axes, x_lbl, y_lbl,
                curve1, curve2, curve_sum,
                lbl_c1, lbl_c2, lbl_cs, legend,
                amp_line, amp_lbl,
            )),
            FadeOut(result_group),
        )
        self.wait(0.3)

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.54)
        s_title.next_to(title, DOWN, buff=0.5)

        s1_zh = Text("两分振动相位差：", font=CJK).scale(0.40)
        s1_eq = MathTex(
            r"\Delta\varphi = -\dfrac{\pi}{2}", color=YELLOW
        ).scale(0.72)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.15)

        s2_zh = Text("合振幅：", font=CJK).scale(0.40)
        s2_eq = MathTex(
            r"A = \sqrt{4^2+3^2+2\cdot4\cdot3\cdot 0} = 5\,\mathrm{m}",
            color=GREEN,
        ).scale(0.65)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.15)

        s3_zh = Text("合振动方程：", font=CJK).scale(0.40)
        s3_eq = MathTex(
            r"x = 5\cos\!\left(3\pi t + 0.128\pi\right)\,\mathrm{m}",
            color=GREEN,
        ).scale(0.68)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.15)

        s4 = Text(
            "当 Δφ = -π/2 时，cos(-π/2)=0，合振幅恰好等于勾股定理结果！",
            font=CJK, color=CYAN,
        ).scale(0.38)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch03Ex1PhasorAdditionExample",
        "id": "phys-ch03-3.2-ex1-phasor-addition-example",
        "chapterId": "ch03",
        "sectionId": "3.2",
        "title": "旋转矢量法数值合成（例3-10）",
        "description": "用旋转矢量（相量）平行四边形法合成 x1=4cos(3πt+π/3) 与 x2=3cos(3πt-π/6)，逐步推导 Δφ=-π/2 → A=5m → 合振动方程，并用三条 x-t 波形验证结果。",
    },
]
