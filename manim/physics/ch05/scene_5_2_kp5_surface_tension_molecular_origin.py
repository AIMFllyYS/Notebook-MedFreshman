"""第 5.2 节 · 表面张力的微观起源与表面能（矢量受力 + ValueTracker 扫动范式）。

可视化逻辑：
  1. 标题与副标题
  2. 生活类比：荷叶上的水珠 / 肥皂泡
  3. 液体截面：内部分子（四周引力平衡）vs 表面层分子（合力朝内）
  4. 表面张力定义：F = α L，ValueTracker 拖动分界线长度 L
  5. 拉伸液面：面积 S → S+ΔS，外力做功 ΔA = α·ΔS = ΔEp
  6. 肥皂膜收缩示意（铁丝框可滑动一侧）
  7. 小结卡：两大公式 + 方框

铁律：MathTex 内只有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch05Kp5SurfaceTensionMolecularOrigin(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("表面张力的微观起源与表面能", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第五章 分子动理论 · 5.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("荷叶上的水珠呈球形，水面上可以放缝衣针——", font=CJK).scale(0.48)
        ana2 = Text("液体表面好像一张绷紧的弹性薄膜，这就是表面张力。", font=CJK, color=YELLOW).scale(0.48)
        ana3 = Text("它的根源来自液体分子之间的吸引力。", font=CJK).scale(0.44)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 液体截面 —— 内部分子 vs 表面层分子
        # ══════════════════════════════════════════════════════════════
        sec_label = Text("液体分子受力分析", font=CJK, color=BLUE).scale(0.50)
        sec_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_label))

        # 液体蓝色矩形主体
        liq_rect = Rectangle(width=8.0, height=3.2, color=BLUE, fill_color=BLUE,
                              fill_opacity=0.22)
        liq_rect.shift(DOWN * 0.8)

        # 表面层红框（顶部约 0.55 高度）
        surf_layer = Rectangle(width=8.0, height=0.55, color=RED, fill_color=RED,
                               fill_opacity=0.18)
        surf_layer.align_to(liq_rect, UP)
        surf_layer.align_to(liq_rect, LEFT)

        surf_tag = Text("表面层 (~10^-9 m)", font=CJK, color=RED).scale(0.35)
        surf_tag.next_to(surf_layer, RIGHT, buff=0.15)

        gas_label = Text("气体（引力极弱）", font=CJK, color=WHITE).scale(0.38)
        gas_label.next_to(liq_rect, UP, buff=0.15)
        liq_label = Text("液体内部", font=CJK, color=CYAN).scale(0.38)
        liq_label.move_to(liq_rect.get_center() + DOWN * 0.9)

        self.play(Create(liq_rect), FadeIn(gas_label))
        self.wait(0.5)
        self.play(Create(surf_layer), FadeIn(surf_tag))
        self.play(FadeIn(liq_label))
        self.wait(0.8)

        # ── 内部分子：四向均匀引力（合力为零）
        inner_center = liq_rect.get_center() + DOWN * 0.6
        inner_dot = Dot(inner_center, radius=0.13, color=YELLOW)
        arw_len = 0.48
        dirs = [UP, DOWN, LEFT, RIGHT]
        inner_arrows = VGroup(*[
            Arrow(inner_center, inner_center + d * arw_len,
                  buff=0.14, color=GREEN, stroke_width=3,
                  max_tip_length_to_length_ratio=0.30)
            for d in dirs
        ])
        inner_note = Text("内部分子：引力四面对称，合力 = 0", font=CJK, color=GREEN).scale(0.38)
        inner_note.next_to(liq_rect, DOWN, buff=0.22)
        self.play(Create(inner_dot))
        self.play(Create(inner_arrows))
        self.play(FadeIn(inner_note))
        self.wait(1.4)
        self.play(FadeOut(VGroup(inner_dot, inner_arrows, inner_note)))

        # ── 表面层分子：下方引力 > 上方引力，合力朝内
        surf_center = liq_rect.get_top() + DOWN * 0.27
        surf_dot = Dot(surf_center, radius=0.13, color=ORANGE)

        # 下方液体引力（较大）
        arr_down_big = Arrow(surf_center, surf_center + DOWN * 0.75,
                             buff=0.14, color=RED, stroke_width=4,
                             max_tip_length_to_length_ratio=0.28)
        # 上方气体引力（较小）
        arr_up_small = Arrow(surf_center, surf_center + UP * 0.28,
                             buff=0.14, color=WHITE, stroke_width=3,
                             max_tip_length_to_length_ratio=0.32)
        # 合力箭头（朝下，红色加粗）
        resultant = Arrow(surf_center, surf_center + DOWN * 0.90,
                          buff=0.0, color=RED, stroke_width=6,
                          max_tip_length_to_length_ratio=0.26)

        lbl_big = Text("液体引力（大）", font=CJK, color=RED).scale(0.33)
        lbl_big.next_to(arr_down_big, RIGHT, buff=0.1)
        lbl_small = Text("气体引力（小）", font=CJK, color=WHITE).scale(0.33)
        lbl_small.next_to(arr_up_small, RIGHT, buff=0.1)
        lbl_res = Text("合力（朝内）", font=CJK, color=RED).scale(0.35)
        lbl_res.next_to(resultant, LEFT, buff=0.12)

        surf_note = Text("合力指向液体内部 → 表面有收缩倾向", font=CJK, color=RED).scale(0.40)
        surf_note.next_to(liq_rect, DOWN, buff=0.22)

        self.play(Create(surf_dot))
        self.play(GrowArrow(arr_down_big), FadeIn(lbl_big))
        self.play(GrowArrow(arr_up_small), FadeIn(lbl_small))
        self.wait(0.8)
        self.play(GrowArrow(resultant), FadeIn(lbl_res))
        self.play(FadeIn(surf_note))
        self.wait(1.8)

        # 清场（保留 title）
        self.play(FadeOut(VGroup(
            sec_label, liq_rect, surf_layer, surf_tag, gas_label, liq_label,
            surf_dot, arr_down_big, lbl_big, arr_up_small, lbl_small,
            resultant, lbl_res, surf_note
        )))

        # ══════════════════════════════════════════════════════════════
        # Step 4: 表面张力定义  F = α L  + ValueTracker 拖动 L
        # ══════════════════════════════════════════════════════════════
        def_label = Text("表面张力定义", font=CJK, color=BLUE).scale(0.50)
        def_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_label))

        # 说明行
        zh_def1 = Text("在液面上作一条分界线，张力垂直于该线、", font=CJK).scale(0.44)
        zh_def2 = Text("作用于线两侧液面，大小与线长成正比。", font=CJK).scale(0.44)
        zh_def = VGroup(zh_def1, zh_def2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        zh_def.next_to(def_label, DOWN, buff=0.30)
        self.play(FadeIn(zh_def))
        self.wait(1.0)

        # 公式
        f_eq = MathTex(r"F = \alpha L").scale(1.0)
        f_eq.set_color(YELLOW)
        f_eq.next_to(zh_def, DOWN, buff=0.40)
        alpha_note_lbl = Text("  (", font=CJK, color=WHITE).scale(0.44)
        alpha_note_eq = MathTex(r"\alpha").scale(0.80)
        alpha_note_rz = Text(": 表面张力系数，单位 N/m)", font=CJK, color=WHITE).scale(0.44)
        alpha_note = VGroup(alpha_note_lbl, alpha_note_eq, alpha_note_rz).arrange(RIGHT, buff=0.06)
        alpha_note.next_to(f_eq, DOWN, buff=0.25)

        self.play(Write(f_eq))
        self.play(FadeIn(alpha_note))
        self.wait(1.0)

        # ── ValueTracker：L 变化 → F 变化
        L = ValueTracker(3.0)
        ALPHA_VAL = 0.05  # 仅示意比例

        # 液面基准线（静态，位于屏幕下半区）
        base_y = -2.0
        liq_bg = Rectangle(width=9.0, height=1.4, color=BLUE, fill_color=BLUE,
                            fill_opacity=0.20)
        liq_bg.move_to(np.array([0.0, base_y - 0.3, 0.0]))

        # 分界线（始终居中，长度随 L 变化）
        boundary = always_redraw(lambda: Line(
            np.array([-L.get_value() / 2, base_y, 0.0]),
            np.array([L.get_value() / 2, base_y, 0.0]),
            color=CYAN, stroke_width=4
        ))

        # 分界线两端的张力箭头（向外，代表线两侧液面受到的张力）
        arr_left = always_redraw(lambda: Arrow(
            np.array([-L.get_value() / 2, base_y, 0.0]),
            np.array([-L.get_value() / 2 - 0.6, base_y, 0.0]),
            buff=0, color=RED, stroke_width=4,
            max_tip_length_to_length_ratio=0.28
        ))
        arr_right = always_redraw(lambda: Arrow(
            np.array([L.get_value() / 2, base_y, 0.0]),
            np.array([L.get_value() / 2 + 0.6, base_y, 0.0]),
            buff=0, color=RED, stroke_width=4,
            max_tip_length_to_length_ratio=0.28
        ))

        L_label = always_redraw(lambda: MathTex(
            rf"L = {L.get_value():.1f}\ \mathrm{{cm}}", color=CYAN
        ).scale(0.55).next_to(liq_bg, UP, buff=0.15).shift(LEFT * 2.0))

        F_label = always_redraw(lambda: MathTex(
            rf"F = {ALPHA_VAL * L.get_value():.3f}\ \mathrm{{N}}", color=YELLOW
        ).scale(0.55).next_to(liq_bg, UP, buff=0.15).shift(RIGHT * 2.0))

        drag_hint = Text("（拖动：L 增大 → F 增大）", font=CJK, color=ORANGE).scale(0.38)
        drag_hint.next_to(liq_bg, DOWN, buff=0.22)

        self.play(Create(liq_bg), Create(boundary))
        self.play(GrowArrow(arr_left), GrowArrow(arr_right))
        self.play(FadeIn(L_label), FadeIn(F_label), FadeIn(drag_hint))
        self.wait(0.6)
        self.play(L.animate.set_value(5.5), run_time=2.0)
        self.wait(0.5)
        self.play(L.animate.set_value(1.5), run_time=2.0)
        self.wait(0.5)
        self.play(L.animate.set_value(3.0), run_time=1.2)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            def_label, zh_def, f_eq, alpha_note,
            liq_bg, boundary, arr_left, arr_right,
            L_label, F_label, drag_hint
        )))

        # ══════════════════════════════════════════════════════════════
        # Step 5: 拉伸液面 → 表面能  ΔEp = α·ΔS
        # ══════════════════════════════════════════════════════════════
        energy_label = Text("表面能：拉伸液面需要做功", font=CJK, color=BLUE).scale(0.50)
        energy_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(energy_label))

        # 物理图像：矩形薄膜，宽固定 W，高 h 可变（ValueTracker）
        W = 4.0
        h_tracker = ValueTracker(1.5)
        film_base_y = -1.5

        film = always_redraw(lambda: Rectangle(
            width=W, height=h_tracker.get_value(),
            color=BLUE_B, fill_color=BLUE_B, fill_opacity=0.30
        ).move_to(np.array([0.0, film_base_y + h_tracker.get_value() / 2, 0.0])))

        # 拉伸方向箭头（向下）
        stretch_arr = always_redraw(lambda: Arrow(
            np.array([0.0, film_base_y - 0.1, 0.0]),
            np.array([0.0, film_base_y - 0.55, 0.0]),
            buff=0, color=ORANGE, stroke_width=5,
            max_tip_length_to_length_ratio=0.30
        ))

        # S、ΔS 标注
        S_label = always_redraw(lambda: MathTex(
            rf"S = {W * h_tracker.get_value():.1f}\ \mathrm{{cm}}^2", color=CYAN
        ).scale(0.52).to_corner(UL, buff=0.8).shift(DOWN * 2.5))

        dS = 0.0  # 基准面积存储（用 list 实现可变闭包）
        base_S = [W * 1.5]

        dEp_label = always_redraw(lambda: (
            lambda ds: MathTex(
                rf"\Delta S = {ds:.1f},\quad \Delta E_p = \alpha \cdot {ds:.1f}",
                color=YELLOW
            ).scale(0.50).to_corner(UR, buff=0.7).shift(DOWN * 2.5)
        )(W * h_tracker.get_value() - base_S[0]))

        expl1 = Text("外力将液面从 S 拉伸至 S+ΔS，", font=CJK).scale(0.42)
        expl2 = Text("外力做功 = 新增表面能 ΔEp = α · ΔS", font=CJK, color=GREEN).scale(0.42)
        expl = VGroup(expl1, expl2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        expl.next_to(energy_label, DOWN, buff=0.30)

        self.play(FadeIn(expl))
        self.wait(0.8)
        self.play(Create(film))
        self.play(FadeIn(S_label), FadeIn(dEp_label))
        self.play(FadeIn(stretch_arr))
        self.wait(0.6)

        # 拉伸动画
        self.play(h_tracker.animate.set_value(2.8), run_time=2.2)
        self.wait(0.8)
        self.play(h_tracker.animate.set_value(1.5), run_time=1.5)
        self.wait(0.6)

        # 能量条形图（显示表面能增量）
        bar_label = Text("表面能增量示意", font=CJK, color=BLUE).scale(0.38)
        bar_label.to_corner(DL, buff=0.6)

        bar_base = Rectangle(width=0.7, height=1.0, color=GREEN, fill_color=GREEN,
                              fill_opacity=0.35)
        bar_base.next_to(bar_label, UP, buff=0.15)
        bar_lbl0 = Text("基础", font=CJK, color=WHITE).scale(0.30)
        bar_lbl0.next_to(bar_base, DOWN, buff=0.08)

        self.play(Create(bar_base), FadeIn(bar_label), FadeIn(bar_lbl0))

        # 拉伸并动态增加条形高度
        bar_extra = always_redraw(lambda: Rectangle(
            width=0.7,
            height=max(0.0, (h_tracker.get_value() - 1.5) * 0.8),
            color=YELLOW, fill_color=YELLOW, fill_opacity=0.55
        ).next_to(bar_base, UP, buff=0.0))
        bar_lbl1 = Text("ΔEp", font=CJK, color=YELLOW).scale(0.33)
        bar_lbl1.add_updater(lambda m: m.next_to(bar_extra, UP, buff=0.06))

        self.add(bar_extra, bar_lbl1)
        self.play(h_tracker.animate.set_value(3.0), run_time=2.5)
        self.wait(1.2)

        # 双重含义标注
        dual = Text("α 的双重含义：表面张力系数 = 单位面积表面能（J/m²）", font=CJK, color=GREEN).scale(0.40)
        dual.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(dual))
        self.wait(1.6)

        self.play(FadeOut(VGroup(
            energy_label, expl, film, stretch_arr,
            S_label, dEp_label,
            bar_label, bar_base, bar_extra, bar_lbl0, bar_lbl1, dual
        )))

        # ══════════════════════════════════════════════════════════════
        # Step 6: 肥皂膜在铁丝框上的收缩
        # ══════════════════════════════════════════════════════════════
        soap_label = Text("肥皂膜示意：铁丝框可滑动一侧", font=CJK, color=BLUE).scale(0.50)
        soap_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(soap_label))

        # 铁丝框：三条固定边 + 一条可滑动边（用 ValueTracker 控制位置）
        frame_left = -2.5
        frame_right = 2.5
        frame_top = 0.5
        slide_y = ValueTracker(-1.0)  # 可滑动边的 y 坐标，初始 -1.0

        # 固定三边
        top_bar = Line(np.array([frame_left, frame_top, 0.0]),
                       np.array([frame_right, frame_top, 0.0]),
                       color=GREY, stroke_width=5)
        left_bar = always_redraw(lambda: Line(
            np.array([frame_left, frame_top, 0.0]),
            np.array([frame_left, slide_y.get_value(), 0.0]),
            color=GREY, stroke_width=5
        ))
        right_bar = always_redraw(lambda: Line(
            np.array([frame_right, frame_top, 0.0]),
            np.array([frame_right, slide_y.get_value(), 0.0]),
            color=GREY, stroke_width=5
        ))
        # 可滑动边（蓝色，较粗）
        slide_bar = always_redraw(lambda: Line(
            np.array([frame_left, slide_y.get_value(), 0.0]),
            np.array([frame_right, slide_y.get_value(), 0.0]),
            color=BLUE_C, stroke_width=7
        ))

        # 肥皂膜填充（矩形，随滑动边移动）
        soap_film = always_redraw(lambda: Rectangle(
            width=frame_right - frame_left,
            height=frame_top - slide_y.get_value(),
            color=CYAN, fill_color=CYAN, fill_opacity=0.22
        ).move_to(np.array([
            0.0,
            (frame_top + slide_y.get_value()) / 2,
            0.0
        ])))

        # 表面张力箭头（向上，作用于可滑动边）
        soap_f_left = always_redraw(lambda: Arrow(
            np.array([frame_left + 0.8, slide_y.get_value(), 0.0]),
            np.array([frame_left + 0.8, slide_y.get_value() + 0.55, 0.0]),
            buff=0, color=RED, stroke_width=4,
            max_tip_length_to_length_ratio=0.28
        ))
        soap_f_right = always_redraw(lambda: Arrow(
            np.array([frame_right - 0.8, slide_y.get_value(), 0.0]),
            np.array([frame_right - 0.8, slide_y.get_value() + 0.55, 0.0]),
            buff=0, color=RED, stroke_width=4,
            max_tip_length_to_length_ratio=0.28
        ))

        soap_hint = Text("松开滑动边 → 肥皂膜收缩（表面积减小，表面能降低）", font=CJK, color=ORANGE).scale(0.38)
        soap_hint.to_edge(DOWN, buff=0.6)

        slide_eq = always_redraw(lambda: MathTex(
            rf"F = 2\alpha L = {2 * ALPHA_VAL * (frame_right - frame_left):.3f}\ \mathrm{{N}}",
            color=YELLOW
        ).scale(0.52).to_corner(UR, buff=0.7).shift(DOWN * 2.0))

        soap_note = Text("(肥皂膜有两个面，故 F = 2αL)", font=CJK, color=WHITE).scale(0.36)
        soap_note.next_to(slide_eq, DOWN, buff=0.12)

        self.play(Create(top_bar), Create(left_bar), Create(right_bar), Create(slide_bar))
        self.play(FadeIn(soap_film))
        self.play(GrowArrow(soap_f_left), GrowArrow(soap_f_right))
        self.play(FadeIn(soap_hint), FadeIn(slide_eq), FadeIn(soap_note))
        self.wait(1.0)

        # 收缩动画（滑动边上移）
        self.play(slide_y.animate.set_value(0.0), run_time=2.5)
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            soap_label, top_bar, left_bar, right_bar, slide_bar,
            soap_film, soap_f_left, soap_f_right,
            soap_hint, slide_eq, soap_note
        )))

        # ══════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.50)

        # 公式行 1：F = αL（中文标注 + 公式）
        lbl_f = Text("表面张力：", font=CJK, color=WHITE).scale(0.50)
        eq_f = MathTex(r"F = \alpha L", color=YELLOW).scale(0.90)
        row_f = VGroup(lbl_f, eq_f).arrange(RIGHT, buff=0.20)

        # 公式行 2：ΔEp = α·ΔS
        lbl_e = Text("表面能增量：", font=CJK, color=WHITE).scale(0.50)
        eq_e = MathTex(r"\Delta E_p = \alpha \cdot \Delta S", color=YELLOW).scale(0.90)
        row_e = VGroup(lbl_e, eq_e).arrange(RIGHT, buff=0.20)

        # 结论行
        concl1 = Text("α 同时表示「单位长度上的表面张力」", font=CJK, color=GREEN).scale(0.44)
        concl2 = Text("和「单位面积上的表面能」（J/m² = N/m）", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(row_f, row_e, concl1, concl2).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.50)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(row_f))
        self.wait(0.8)
        self.play(Write(row_e))
        self.wait(0.8)
        self.play(FadeIn(concl1), FadeIn(concl2))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Kp5SurfaceTensionMolecularOrigin",
        "id": "phys-ch05-5.2-kp5-surface-tension-molecular-origin",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "表面张力的微观起源与表面能",
        "description": "从分子受力不均揭示表面张力的微观起源，用 ValueTracker 演示 F=αL，并展示拉伸液面做功与表面能增量的等价关系及肥皂膜收缩。",
    },
]
