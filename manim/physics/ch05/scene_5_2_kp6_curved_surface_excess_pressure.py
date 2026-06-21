"""第 5.2 节 · 弯曲液面的附加压强（拉普拉斯公式）

用球形截面 + 力平衡推导 ΔP = 2α/R（单液面），过渡到肥皂泡 ΔP = 4α/R（双膜），
最后以连通管演示「小泡高压 → 气体流向大泡」的反直觉现象。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch05Kp6CurvedSurfaceExcessPressure(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("弯曲液面的附加压强", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.2  拉普拉斯公式", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("往吸管里吹肥皂泡，刚开始很费力——", font=CJK).scale(0.50)
        ana2 = Text("小泡更难吹，大泡反而越来越容易，这是为什么？", font=CJK).scale(0.50)
        ana3 = Text("答案藏在弯曲液面对内部气体施加的「额外压强」里。", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.30).next_to(title, DOWN, buff=0.60)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_group))

        # ── Step 3: 定义附加压强 ────────────────────────────────────────
        def_title = Text("什么是附加压强？", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        d1 = Text("弯曲液面两侧存在压强差：", font=CJK).scale(0.46)
        d2_lhs = Text("液面内侧压强", font=CJK, color=RED).scale(0.46)
        d2_gt = MathTex(r">").scale(0.9)
        d2_rhs = Text("液面外侧压强", font=CJK, color=BLUE).scale(0.46)
        d2 = VGroup(d2_lhs, d2_gt, d2_rhs).arrange(RIGHT, buff=0.18)
        d3 = Text("这个差值就是「附加压强」ΔP，由表面张力产生。", font=CJK).scale(0.46)
        defs = VGroup(d1, d2, d3).arrange(DOWN, buff=0.28).next_to(def_title, DOWN, buff=0.40)
        defs.scale_to_fit_width(12)
        self.play(FadeIn(def_title))
        self.play(FadeIn(d1))
        self.play(FadeIn(d2))
        self.play(FadeIn(d3))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ── Step 4: 球形液面截面 + 力平衡推导 ΔP = 2α/R ────────────────
        deriv_title = Text("球形液面力平衡推导", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(deriv_title))

        # 绘制半球截面（圆弧 + 直径线）
        R_geo = 1.4
        center_geo = DOWN * 0.5 + LEFT * 2.8

        # 圆圈代表球形液面截面
        bubble_circle = Circle(radius=R_geo, color=BLUE, stroke_width=3).move_to(center_geo)
        bubble_fill = Circle(radius=R_geo, fill_color=BLUE, fill_opacity=0.08,
                             stroke_opacity=0).move_to(center_geo)

        # 内外压强标注
        p_in_label = VGroup(
            Text("p", font=CJK, color=RED).scale(0.45),
            MathTex(r"_{in}", color=RED).scale(0.55),
        ).arrange(RIGHT, buff=0.04).move_to(center_geo + LEFT * 0.45 + UP * 0.1)

        p_out_label = VGroup(
            Text("p", font=CJK, color=BLUE).scale(0.45),
            MathTex(r"_{out}", color=BLUE).scale(0.55),
        ).arrange(RIGHT, buff=0.04).move_to(center_geo + LEFT * (R_geo + 0.65) + UP * 0.1)

        # 内部压强箭头（向外）
        inner_arrows = VGroup()
        for ang_deg in [0, 60, 120, 180, 240, 300]:
            ang = math.radians(ang_deg)
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            inner_arrows.add(Arrow(
                center_geo + d * 0.35,
                center_geo + d * 0.85,
                buff=0, color=RED, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.30,
            ))

        # 外部压强箭头（向内，更短）
        outer_arrows = VGroup()
        for ang_deg in [30, 90, 150, 210, 270, 330]:
            ang = math.radians(ang_deg)
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            outer_arrows.add(Arrow(
                center_geo + d * (R_geo + 0.65),
                center_geo + d * (R_geo + 0.18),
                buff=0, color=BLUE, stroke_width=2,
                max_tip_length_to_length_ratio=0.28,
            ))

        self.play(Create(bubble_circle), FadeIn(bubble_fill))
        self.play(FadeIn(inner_arrows), FadeIn(p_in_label))
        self.wait(0.5)
        self.play(FadeIn(outer_arrows), FadeIn(p_out_label))
        self.wait(0.8)

        # 标注面积元 dS 和球心角
        # 面积元在右上方
        ds_center = center_geo + np.array([R_geo * math.cos(math.radians(50)),
                                           R_geo * math.sin(math.radians(50)), 0.0])
        ds_dot = Dot(ds_center, color=YELLOW, radius=0.07)
        ds_label = VGroup(
            Text("面积元", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"dS", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.08).next_to(ds_dot, UR, buff=0.12)
        self.play(FadeIn(ds_dot), FadeIn(ds_label))
        self.wait(0.7)

        # 推导步骤（右侧分步展示）
        step_x = RIGHT * 1.8
        step1 = VGroup(
            Text("对面积元受力分析：", font=CJK).scale(0.42),
        ).arrange(DOWN, buff=0.15).move_to(step_x + UP * 1.9)

        eq1 = MathTex(r"\Delta P \cdot dS", r"=", r"F_{\text{tension}}", color=WHITE).scale(0.72)
        eq1.next_to(step1, DOWN, buff=0.28)
        eq1[0].set_color(YELLOW)

        step2_label = Text("表面张力切向分量提供法向合力：", font=CJK).scale(0.40)
        step2_label.next_to(eq1, DOWN, buff=0.30)

        eq2 = MathTex(r"F_{\text{tension}} = \alpha \cdot d\ell \cdot \sin\theta \approx \alpha \cdot d\ell \cdot \frac{d\ell}{2R}").scale(0.58)
        eq2.next_to(step2_label, DOWN, buff=0.20)

        step3_label = Text("对整个面积元积分后化简：", font=CJK).scale(0.40)
        step3_label.next_to(eq2, DOWN, buff=0.28)

        eq3 = MathTex(r"\Delta P", r"=", r"\frac{2\alpha}{R}", color=YELLOW).scale(0.85)
        eq3.next_to(step3_label, DOWN, buff=0.22)
        eq3[2].set_color(GREEN)

        right_group = VGroup(step1, eq1, step2_label, eq2, step3_label, eq3)
        right_group.scale_to_fit_width(5.8)
        right_group.next_to(center_geo, RIGHT, buff=1.0).shift(UP * 0.3)

        self.play(FadeIn(step1))
        self.wait(0.5)
        self.play(Write(eq1))
        self.wait(0.8)
        self.play(FadeIn(step2_label))
        self.play(Write(eq2))
        self.wait(0.8)
        self.play(FadeIn(step3_label))
        self.play(Write(eq3))
        self.wait(1.6)

        geo_group = VGroup(bubble_circle, bubble_fill, inner_arrows, outer_arrows,
                           p_in_label, p_out_label, ds_dot, ds_label, right_group)
        self.play(FadeOut(geo_group), FadeOut(deriv_title))

        # ── Step 5: ValueTracker 扫 R，展示 ΔP ∝ 1/R ───────────────────
        tracker_title = Text("半径越大，附加压强越小", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(tracker_title))

        alpha_val = 0.04   # 表面张力系数（归一化示意）
        R_tracker = ValueTracker(0.6)

        # 动态气泡圆
        bubble_center = LEFT * 2.5 + DOWN * 0.4
        dyn_bubble = always_redraw(lambda: Circle(
            radius=R_tracker.get_value() * 1.5,
            color=BLUE, stroke_width=3,
        ).move_to(bubble_center))
        dyn_fill = always_redraw(lambda: Circle(
            radius=R_tracker.get_value() * 1.5,
            fill_color=BLUE, fill_opacity=0.12, stroke_opacity=0,
        ).move_to(bubble_center))

        # 动态附加压强读数
        dyn_readout = always_redraw(lambda: VGroup(
            MathTex(r"R =", color=WHITE).scale(0.60),
            MathTex(rf"{R_tracker.get_value():.2f}\ \mathrm{{m}}", color=CYAN).scale(0.60),
        ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.55).shift(DOWN * 0.05))

        dyn_pressure = always_redraw(lambda: VGroup(
            MathTex(r"\Delta P =", color=WHITE).scale(0.60),
            MathTex(rf"{2 * alpha_val / R_tracker.get_value():.3f}\ \mathrm{{Pa}}", color=YELLOW).scale(0.60),
        ).arrange(RIGHT, buff=0.06).to_corner(UR, buff=0.55).shift(DOWN * 0.75))

        # 右侧公式（静态显示）
        formula_static = MathTex(r"\Delta P = \frac{2\alpha}{R}", color=YELLOW).scale(0.85)
        formula_static.move_to(RIGHT * 3.0 + UP * 0.4)
        note_small = Text("R 小 → ΔP 大  （小泡更难吹）", font=CJK, color=ORANGE).scale(0.44)
        note_small.next_to(formula_static, DOWN, buff=0.35)

        self.add(dyn_bubble, dyn_fill, dyn_readout, dyn_pressure)
        self.play(Create(dyn_bubble), Write(formula_static), FadeIn(note_small))
        self.wait(0.6)

        # R 从小到大扫动
        self.play(R_tracker.animate.set_value(2.0), run_time=3.5)
        self.wait(0.8)
        self.play(R_tracker.animate.set_value(0.6), run_time=2.5)
        self.wait(0.8)

        tracker_objs = VGroup(formula_static, note_small)
        self.play(FadeOut(dyn_bubble), FadeOut(dyn_fill),
                  FadeOut(dyn_readout), FadeOut(dyn_pressure),
                  FadeOut(tracker_objs), FadeOut(tracker_title))

        # ── Step 6: 肥皂泡 = 双层膜，ΔP = 4α/R ────────────────────────
        soap_title = Text("肥皂泡：双层液膜", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(soap_title))

        soap_center = LEFT * 2.0 + DOWN * 0.3
        R_soap = 1.3

        # 外层膜（红色）
        outer_film = Circle(radius=R_soap, color=RED, stroke_width=5).move_to(soap_center)
        # 内层膜（橙色，略小）
        inner_film = Circle(radius=R_soap - 0.05, color=ORANGE, stroke_width=5).move_to(soap_center)
        # 气体填充
        gas_fill = Circle(radius=R_soap - 0.08, fill_color=YELLOW, fill_opacity=0.10,
                          stroke_opacity=0).move_to(soap_center)

        # 标注两层
        outer_lbl = Text("外层膜", font=CJK, color=RED).scale(0.38)
        outer_lbl.move_to(soap_center + UP * (R_soap + 0.38))
        inner_lbl = Text("内层膜", font=CJK, color=ORANGE).scale(0.38)
        inner_lbl.move_to(soap_center + DOWN * (R_soap + 0.38))

        # 箭头指向两层
        arr_outer = Arrow(outer_lbl.get_bottom(), soap_center + UP * (R_soap - 0.0),
                          buff=0.06, color=RED, stroke_width=2.5,
                          max_tip_length_to_length_ratio=0.3)
        arr_inner = Arrow(inner_lbl.get_top(), soap_center + DOWN * (R_soap - 0.0),
                          buff=0.06, color=ORANGE, stroke_width=2.5,
                          max_tip_length_to_length_ratio=0.3)

        self.play(Create(outer_film), Create(inner_film), FadeIn(gas_fill))
        self.play(FadeIn(outer_lbl), FadeIn(inner_lbl),
                  Create(arr_outer), Create(arr_inner))
        self.wait(0.8)

        # 右侧推导对比
        soap_derive = VGroup(
            Text("每层膜各贡献", font=CJK).scale(0.44),
            MathTex(r"\Delta P_{\text{each}} = \frac{2\alpha}{R}", color=WHITE).scale(0.72),
            Text("两层叠加：", font=CJK).scale(0.44),
            MathTex(r"\Delta P_{\text{soap}}", r"=", r"\frac{4\alpha}{R}", color=YELLOW).scale(0.85),
        ).arrange(DOWN, buff=0.28)
        soap_derive[-1][2].set_color(GREEN)
        soap_derive.move_to(RIGHT * 3.0 + DOWN * 0.2)
        soap_derive.scale_to_fit_width(5.2)

        for item in soap_derive:
            self.play(FadeIn(item))
            self.wait(0.5)
        self.wait(1.0)

        # 对比框
        compare_single = VGroup(
            Text("单层液面：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta P = \frac{2\alpha}{R}", color=CYAN).scale(0.72),
        ).arrange(RIGHT, buff=0.2)
        compare_soap = VGroup(
            Text("肥皂泡：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta P = \frac{4\alpha}{R}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.2)
        compare = VGroup(compare_single, compare_soap).arrange(DOWN, buff=0.30)
        compare.next_to(soap_derive, DOWN, buff=0.40).scale_to_fit_width(5.0)
        box_compare = SurroundingRectangle(compare, color=BLUE, buff=0.20, corner_radius=0.10)
        self.play(FadeIn(compare), Create(box_compare))
        self.wait(1.4)

        soap_objs = VGroup(outer_film, inner_film, gas_fill, outer_lbl, inner_lbl,
                           arr_outer, arr_inner, soap_derive, compare, box_compare)
        self.play(FadeOut(soap_objs), FadeOut(soap_title))

        # ── Step 7: 连通管演示——小泡高压流向大泡 ──────────────────────
        tube_title = Text("连通管实验：气体从小泡流向大泡", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(tube_title))

        # 初始小泡（左）
        R_small_init = 0.55
        R_big_init   = 1.30
        c_left  = LEFT * 3.4 + DOWN * 0.4
        c_right = RIGHT * 2.8 + DOWN * 0.4

        R_s = ValueTracker(R_small_init)
        R_b = ValueTracker(R_big_init)

        small_bubble = always_redraw(lambda: Circle(
            radius=R_s.get_value(), color=ORANGE, stroke_width=3,
        ).move_to(c_left))
        big_bubble = always_redraw(lambda: Circle(
            radius=R_b.get_value(), color=BLUE, stroke_width=3,
        ).move_to(c_right))
        small_fill = always_redraw(lambda: Circle(
            radius=R_s.get_value(), fill_color=ORANGE, fill_opacity=0.15, stroke_opacity=0,
        ).move_to(c_left))
        big_fill = always_redraw(lambda: Circle(
            radius=R_b.get_value(), fill_color=BLUE, fill_opacity=0.10, stroke_opacity=0,
        ).move_to(c_right))

        # 连通管（静态水平线）
        tube_line = Line(c_left + RIGHT * R_small_init, c_right + LEFT * R_big_init,
                         color=WHITE, stroke_width=3)

        # 气流箭头（从小泡流向大泡）
        flow_arrow = Arrow(
            LEFT * 0.5 + DOWN * 0.4,
            RIGHT * 0.9 + DOWN * 0.4,
            buff=0, color=YELLOW, stroke_width=3.5,
            max_tip_length_to_length_ratio=0.25,
        )
        flow_label = Text("气体流向", font=CJK, color=YELLOW).scale(0.40)
        flow_label.next_to(flow_arrow, UP, buff=0.12)

        # 压强标注（动态）
        p_left_label = always_redraw(lambda: VGroup(
            MathTex(r"\Delta P_{\text{small}} =", color=ORANGE).scale(0.52),
            MathTex(rf"\frac{{4\alpha}}{{{R_s.get_value():.2f}}}", color=ORANGE).scale(0.52),
        ).arrange(RIGHT, buff=0.06).next_to(c_left, UP, buff=R_s.get_value() + 0.25))

        p_right_label = always_redraw(lambda: VGroup(
            MathTex(r"\Delta P_{\text{big}} =", color=BLUE).scale(0.52),
            MathTex(rf"\frac{{4\alpha}}{{{R_b.get_value():.2f}}}", color=BLUE).scale(0.52),
        ).arrange(RIGHT, buff=0.06).next_to(c_right, UP, buff=R_b.get_value() + 0.25))

        self.add(small_bubble, big_bubble, small_fill, big_fill)
        self.play(Create(small_bubble), Create(big_bubble))
        self.play(Create(tube_line))
        self.wait(0.5)
        self.add(p_left_label, p_right_label)
        self.play(FadeIn(flow_arrow), FadeIn(flow_label))
        self.wait(0.8)

        # 动画：小泡缩小，大泡增大
        total_volume = (4.0 / 3.0) * math.pi * (R_small_init**3 + R_big_init**3)
        def conservation_big(r_small):
            vol_big = total_volume - (4.0 / 3.0) * math.pi * r_small**3
            return max(vol_big, 0.001) ** (1.0 / 3.0)

        # 同步两个 tracker：小泡缩小到 0.25，大泡相应增大
        R_s_final = 0.22
        R_b_final = conservation_big(R_s_final)

        self.play(
            R_s.animate.set_value(R_s_final),
            R_b.animate.set_value(R_b_final),
            run_time=3.5,
        )
        self.wait(1.0)

        # 文字说明
        concl = Text("小泡（ΔP 大）→ 气体流入大泡（ΔP 小）→ 小泡缩小、大泡扩大",
                     font=CJK, color=GREEN).scale(0.42)
        concl.to_edge(DOWN, buff=0.55)
        concl.scale_to_fit_width(13)
        self.play(FadeIn(concl))
        self.wait(1.4)

        tube_objs = VGroup(small_bubble, big_bubble, small_fill, big_fill,
                           tube_line, flow_arrow, flow_label,
                           p_left_label, p_right_label, concl)
        self.play(FadeOut(tube_objs), FadeOut(tube_title))

        # ── Step 8: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1_label = Text("单层弯曲液面：", font=CJK, color=CYAN).scale(0.46)
        s1_formula = MathTex(r"\Delta P = \frac{2\alpha}{R}", color=YELLOW).scale(0.85)
        s1 = VGroup(s1_label, s1_formula).arrange(RIGHT, buff=0.25)

        s2_label = Text("肥皂泡（双层膜）：", font=CJK, color=CYAN).scale(0.46)
        s2_formula = MathTex(r"\Delta P = \frac{4\alpha}{R}", color=YELLOW).scale(0.85)
        s2 = VGroup(s2_label, s2_formula).arrange(RIGHT, buff=0.25)

        s3 = Text("ΔP ∝ 1/R：曲率越大（R越小），附加压强越大", font=CJK, color=GREEN).scale(0.44)
        s4 = Text("小气泡内压高 → 连通大气泡时，气体从小泡流向大泡", font=CJK, color=ORANGE).scale(0.42)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1_formula), FadeIn(s1_label))
        self.wait(0.5)
        self.play(Write(s2_formula), FadeIn(s2_label))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Kp6CurvedSurfaceExcessPressure",
        "id": "phys-ch05-5.2-kp6-curved-surface-excess-pressure",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "弯曲液面的附加压强（拉普拉斯公式）",
        "description": "从球形液面力平衡推导 ΔP=2α/R，扩展到肥皂泡双膜 ΔP=4α/R，用连通管动画演示小泡高压流向大泡的反直觉现象。",
    },
]
