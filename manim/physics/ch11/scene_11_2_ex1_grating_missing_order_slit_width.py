"""第 11.2 节 · 例题：光栅常数、缺级与可见谱线

施工图三步走：
  Step A - 光栅方程求光栅常数 d = 3λ / sin30° = 3 μm
  Step B - 缺级条件求单缝宽 a = d / k_miss = 0.75 μm
  Step C - |k| < d/λ = 6 确定级次，去掉缺级 k = ±4，剩余 9 条谱线

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch11Ex1GratingMissingOrderSlitWidth(Scene):
    def construct(self):
        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("例题：光栅常数、缺级与可见谱线", font=CJK, color=BLUE).scale(0.60)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第11章 波动光学 · 11.2 光栅衍射", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        ana1 = Text("光栅就像一把「光梳」：", font=CJK, color=WHITE).scale(0.48)
        ana2 = Text("密密麻麻的细缝让不同方向的光互相加强或相消，", font=CJK, color=WHITE).scale(0.48)
        ana3 = Text("同时每条缝本身也会衍射——两者叠加决定哪些方向有亮纹。", font=CJK, color=GREEN).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.5)
        ana_group.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ── Step 3: 题目条件 ─────────────────────────────────────────────
        cond_title = Text("已知条件", font=CJK, color=YELLOW).scale(0.50)
        cond_title.next_to(title, DOWN, buff=0.45)
        c1 = VGroup(
            Text("第3级主极大衍射角", font=CJK).scale(0.42),
            MathTex(r"\theta_3 = 30^\circ").scale(0.70),
        ).arrange(RIGHT, buff=0.2)
        c2 = VGroup(
            Text("入射光波长", font=CJK).scale(0.42),
            MathTex(r"\lambda = 500\,\mathrm{nm}").scale(0.70),
        ).arrange(RIGHT, buff=0.2)
        c3 = VGroup(
            Text("第4级主极大缺级", font=CJK, color=RED).scale(0.42),
            MathTex(r"k_{\text{miss}}=4", color=RED).scale(0.70),
        ).arrange(RIGHT, buff=0.2)
        conds = VGroup(c1, c2, c3).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.32)
        conds.scale_to_fit_width(10)
        self.play(FadeIn(cond_title))
        self.play(FadeIn(c1))
        self.wait(0.5)
        self.play(FadeIn(c2))
        self.wait(0.5)
        self.play(FadeIn(c3))
        self.wait(1.8)
        self.play(FadeOut(VGroup(cond_title, conds)))

        # ── Step 4: 光栅示意图 ───────────────────────────────────────────
        diagram_title = Text("光栅方程几何示意", font=CJK, color=BLUE).scale(0.48)
        diagram_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(diagram_title))

        # 绘制简单光栅示意：几条竖缝 + 入射光 + 衍射角
        grating_x = -3.5
        slit_positions = [-1.0, 0.0, 1.0]
        slits = VGroup()
        for y0 in slit_positions:
            slit = Line(
                start=np.array([grating_x, y0 - 0.55, 0]),
                end=np.array([grating_x, y0 + 0.55, 0]),
                color=CYAN, stroke_width=3,
            )
            slits.add(slit)
        grating_label = Text("光栅", font=CJK, color=CYAN).scale(0.38)
        grating_label.next_to(slits, DOWN, buff=0.18)

        # 标注光栅常数 d (两缝间距)
        brace_d = Brace(VGroup(slits[0], slits[1]), direction=LEFT, color=WHITE)
        d_label = MathTex(r"d").scale(0.65).next_to(brace_d, LEFT, buff=0.10)

        # 入射光（水平）
        inc_arrow = Arrow(
            start=np.array([grating_x - 1.6, 0, 0]),
            end=np.array([grating_x + 0.05, 0, 0]),
            color=WHITE, buff=0,
        )
        inc_label = Text("入射光", font=CJK, color=WHITE).scale(0.35)
        inc_label.next_to(inc_arrow, UP, buff=0.08)

        # 衍射光方向（θ=30° 斜线）
        diff_len = 2.8
        theta_rad = math.radians(30)
        diff_end = np.array([
            grating_x + diff_len * math.sin(theta_rad),
            diff_len * math.cos(theta_rad) - 0.8,
            0,
        ])
        diff_arrow = Arrow(
            start=np.array([grating_x + 0.05, -0.8, 0]),
            end=diff_end,
            color=YELLOW, buff=0,
        )
        theta_arc = Arc(
            radius=0.55,
            start_angle=PI / 2,
            angle=-theta_rad,
            color=ORANGE,
        ).shift(np.array([grating_x + 0.05, -0.8, 0]))
        theta_label = MathTex(r"\theta_3=30^\circ", color=ORANGE).scale(0.55)
        theta_label.next_to(theta_arc, RIGHT, buff=0.08)

        k3_label = Text("第3级主极大", font=CJK, color=YELLOW).scale(0.36)
        k3_label.next_to(diff_arrow, RIGHT, buff=0.12)

        diagram_group = VGroup(
            slits, grating_label, brace_d, d_label,
            inc_arrow, inc_label, diff_arrow, theta_arc, theta_label, k3_label
        )
        diagram_group.next_to(diagram_title, DOWN, buff=0.35)

        self.play(Create(slits), FadeIn(grating_label))
        self.wait(0.4)
        self.play(Create(inc_arrow), FadeIn(inc_label))
        self.wait(0.4)
        self.play(Create(diff_arrow), Create(theta_arc), FadeIn(theta_label), FadeIn(k3_label))
        self.wait(0.5)
        self.play(Create(brace_d), FadeIn(d_label))
        self.wait(1.5)

        # ── Step 5: 代入光栅方程求 d ─────────────────────────────────────
        eq_title = Text("代入光栅方程", font=CJK, color=YELLOW).scale(0.46)
        eq_title.to_edge(RIGHT, buff=1.0).shift(UP * 1.2)

        grating_eq1 = MathTex(r"d\sin\theta_3 = k\lambda").scale(0.72)
        grating_eq1.next_to(eq_title, DOWN, buff=0.28)

        grating_eq2 = MathTex(
            r"d\sin 30^\circ", r"=", r"3\lambda"
        ).scale(0.72)
        grating_eq2.next_to(grating_eq1, DOWN, buff=0.25)
        grating_eq2[0].set_color(CYAN)
        grating_eq2[2].set_color(YELLOW)

        grating_eq3 = MathTex(
            r"d = \frac{3\lambda}{\sin 30^\circ}",
            r"= \frac{3\times 500}{0.5}",
            r"= 3000\,\mathrm{nm}",
            r"= 3\,\mu\mathrm{m}",
        ).scale(0.62)
        grating_eq3.next_to(grating_eq2, DOWN, buff=0.25)
        grating_eq3[3].set_color(GREEN)

        self.play(FadeIn(eq_title), Write(grating_eq1))
        self.wait(0.8)
        self.play(Write(grating_eq2))
        self.wait(0.8)
        self.play(Write(grating_eq3))
        self.wait(2.0)

        result_d = VGroup(
            Text("光栅常数", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"d = 3\,\mu\mathrm{m}", color=GREEN).scale(0.75),
        ).arrange(RIGHT, buff=0.15)
        result_d.next_to(grating_eq3, DOWN, buff=0.22)
        box_d = SurroundingRectangle(result_d, color=GREEN, buff=0.12, corner_radius=0.10)
        self.play(FadeIn(result_d), Create(box_d))
        self.wait(2.0)

        # 清场
        self.play(FadeOut(VGroup(
            diagram_group, diagram_title,
            eq_title, grating_eq1, grating_eq2, grating_eq3, result_d, box_d,
        )))

        # ── Step 6: 缺级条件原理示意 ─────────────────────────────────────
        miss_title = Text("缺级条件：单缝衍射暗纹 恰好盖住 光栅主极大", font=CJK, color=BLUE).scale(0.46)
        miss_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(miss_title))
        self.wait(0.5)

        # 左侧：光栅多缝干涉图样（主极大位置竖线）
        axes_l = Axes(
            x_range=[-6.5, 6.5, 1],
            y_range=[0, 1.3, 1],
            x_length=5.5,
            y_length=2.2,
            axis_config={"color": GREY, "include_tip": False},
        ).shift(LEFT * 3.2 + DOWN * 1.0)
        ax_l_xlabel = MathTex(r"k").scale(0.5).next_to(axes_l.x_axis.get_end(), RIGHT, buff=0.1)
        grating_label2 = Text("光栅主极大", font=CJK, color=YELLOW).scale(0.35)
        grating_label2.next_to(axes_l, UP, buff=0.10)

        # 主极大竖线 k = 0,±1,±2,±3,±4,±5
        peak_lines = VGroup()
        for k_val in range(-5, 6):
            col = YELLOW if abs(k_val) != 4 else RED
            pk = DashedLine(
                start=axes_l.c2p(k_val, 0),
                end=axes_l.c2p(k_val, 1.0),
                color=col, stroke_width=2,
            )
            peak_lines.add(pk)

        # k=±4 的主极大标红并打叉
        cross_minus4 = Cross(
            stroke_color=RED, stroke_width=3,
        ).scale(0.18).move_to(axes_l.c2p(-4, 0.5))
        cross_plus4 = Cross(
            stroke_color=RED, stroke_width=3,
        ).scale(0.18).move_to(axes_l.c2p(4, 0.5))
        miss_label_m4 = MathTex(r"k{=}{-4}", color=RED).scale(0.38).next_to(
            axes_l.c2p(-4, 0), DOWN, buff=0.12)
        miss_label_p4 = MathTex(r"k{=}4", color=RED).scale(0.38).next_to(
            axes_l.c2p(4, 0), DOWN, buff=0.12)

        self.play(Create(axes_l), FadeIn(ax_l_xlabel), FadeIn(grating_label2))
        self.play(Create(peak_lines))
        self.wait(0.6)
        self.play(
            FadeIn(cross_minus4), FadeIn(cross_plus4),
            FadeIn(miss_label_m4), FadeIn(miss_label_p4),
        )
        self.wait(1.0)

        # 右侧：缺级推导公式
        miss_eq_title = Text("缺级公式推导", font=CJK, color=YELLOW).scale(0.46)
        miss_eq_title.shift(RIGHT * 2.8 + DOWN * 0.3)

        # \text{} 内不能有中文，用分开的 VGroup（见下方 miss_eq1_row）
        miss_eq1_zh = Text("光栅主极大条件：", font=CJK).scale(0.38)
        miss_eq1_formula = MathTex(r"d\sin\theta = k\lambda").scale(0.65)
        miss_eq1_row = VGroup(miss_eq1_zh, miss_eq1_formula).arrange(RIGHT, buff=0.12)

        miss_eq2_zh = Text("单缝暗纹条件：", font=CJK).scale(0.38)
        miss_eq2_formula = MathTex(r"a\sin\theta = k'\lambda").scale(0.65)
        miss_eq2_row = VGroup(miss_eq2_zh, miss_eq2_formula).arrange(RIGHT, buff=0.12)

        miss_eq3_zh = Text("两式相除得缺级规律：", font=CJK, color=ORANGE).scale(0.38)
        miss_eq3_formula = MathTex(r"k = \frac{d}{a}\,k'", color=ORANGE).scale(0.70)
        miss_eq3_row = VGroup(miss_eq3_zh, miss_eq3_formula).arrange(RIGHT, buff=0.12)

        miss_eq4_zh = Text("令缺级", font=CJK, color=RED).scale(0.38)
        miss_eq4_formula = MathTex(r"k_{\text{miss}}=4,\ k'=1", color=RED).scale(0.60)
        miss_eq4_row = VGroup(miss_eq4_zh, miss_eq4_formula).arrange(RIGHT, buff=0.12)

        miss_eq5 = MathTex(
            r"a = \frac{d}{k_{\text{miss}}} = \frac{3}{4} = 0.75\,\mu\mathrm{m}",
            color=GREEN,
        ).scale(0.65)

        miss_stack = VGroup(
            miss_eq_title,
            miss_eq1_row, miss_eq2_row, miss_eq3_row, miss_eq4_row, miss_eq5,
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        miss_stack.shift(RIGHT * 2.8 + DOWN * 0.8)
        miss_stack.scale_to_fit_width(6.0)

        self.play(FadeIn(miss_eq_title))
        self.play(FadeIn(miss_eq1_row))
        self.wait(0.6)
        self.play(FadeIn(miss_eq2_row))
        self.wait(0.6)
        self.play(FadeIn(miss_eq3_row))
        self.wait(0.7)
        self.play(FadeIn(miss_eq4_row))
        self.wait(0.7)
        self.play(Write(miss_eq5))
        self.wait(0.5)

        box_a = SurroundingRectangle(miss_eq5, color=GREEN, buff=0.10, corner_radius=0.08)
        self.play(Create(box_a))
        self.wait(2.0)

        # 清场
        self.play(FadeOut(VGroup(
            miss_title, axes_l, ax_l_xlabel, grating_label2,
            peak_lines, cross_minus4, cross_plus4,
            miss_label_m4, miss_label_p4,
            miss_stack, box_a,
        )))

        # ── Step 7: 确定最大级次 ─────────────────────────────────────────
        max_title = Text("可能出现的级次：|k| < d/λ", font=CJK, color=BLUE).scale(0.50)
        max_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(max_title))

        max_eq1_zh = Text("最大级次条件（sin θ < 1）：", font=CJK).scale(0.42)
        max_eq1_f = MathTex(r"|k| < \frac{d}{\lambda}").scale(0.75)
        max_eq1 = VGroup(max_eq1_zh, max_eq1_f).arrange(RIGHT, buff=0.18)
        max_eq1.next_to(max_title, DOWN, buff=0.35)

        max_eq2 = MathTex(
            r"\frac{d}{\lambda} = \frac{3000\,\mathrm{nm}}{500\,\mathrm{nm}} = 6"
        ).scale(0.70)
        max_eq2.next_to(max_eq1, DOWN, buff=0.28)

        max_eq3_zh = Text("故级次范围：", font=CJK, color=YELLOW).scale(0.42)
        max_eq3_f = MathTex(r"k = 0,\,\pm1,\,\pm2,\,\pm3,\,\pm4,\,\pm5", color=YELLOW).scale(0.68)
        max_eq3 = VGroup(max_eq3_zh, max_eq3_f).arrange(RIGHT, buff=0.15)
        max_eq3.next_to(max_eq2, DOWN, buff=0.28)

        self.play(FadeIn(max_eq1))
        self.wait(0.8)
        self.play(Write(max_eq2))
        self.wait(0.8)
        self.play(FadeIn(max_eq3))
        self.wait(1.5)

        # ── Step 8: 逐条列出级次，去掉缺级 ──────────────────────────────
        remove_title = Text("去掉缺级 k = ±4，剩余谱线逐条确认", font=CJK, color=ORANGE).scale(0.44)
        remove_title.next_to(max_eq3, DOWN, buff=0.35)
        self.play(FadeIn(remove_title))
        self.wait(0.6)

        # 级次列表：k = 0, ±1, ±2, ±3, ±4(缺), ±5
        all_k = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5]
        missing_k = {4, -4}
        check_items = VGroup()
        for k_val in all_k:
            is_miss = k_val in missing_k
            k_str = f"k = {'+' if k_val > 0 else ''}{k_val}" if k_val != 0 else "k = 0"
            k_text = Text(k_str, font=CJK, color=RED if is_miss else WHITE).scale(0.40)
            mark = Text("X  缺级", font=CJK, color=RED).scale(0.38) if is_miss else \
                   Text("v  可见", font=CJK, color=GREEN).scale(0.38)
            row = VGroup(k_text, mark).arrange(RIGHT, buff=0.20)
            check_items.add(row)

        check_items.arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        check_items.next_to(remove_title, DOWN, buff=0.25)
        check_items.scale_to_fit_width(5.5)
        check_items.to_edge(LEFT, buff=1.5)

        for item in check_items:
            self.play(FadeIn(item), run_time=0.25)
        self.wait(1.5)

        # 右侧：谱线总数计算
        count_zh = Text("总级次数：", font=CJK, color=WHITE).scale(0.44)
        count_eq = MathTex(r"11 - 2 = 9", color=GREEN).scale(0.80)
        count_row = VGroup(count_zh, count_eq).arrange(RIGHT, buff=0.15)
        count_row.to_edge(RIGHT, buff=1.5).shift(DOWN * 0.5)

        count_desc1 = Text("可能级次共 11 条（k=0,±1,...,±5）", font=CJK, color=WHITE).scale(0.38)
        count_desc2 = Text("去掉缺级 k=±4 共 2 条", font=CJK, color=RED).scale(0.38)
        count_desc3 = Text("最终可见谱线：9 条", font=CJK, color=GREEN).scale(0.44)
        count_stack = VGroup(count_desc1, count_desc2, count_desc3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        count_stack.next_to(count_row, DOWN, buff=0.30)

        self.play(FadeIn(count_row))
        self.wait(0.5)
        self.play(FadeIn(count_stack))
        self.wait(0.8)

        box_count = SurroundingRectangle(
            VGroup(count_row, count_stack), color=GREEN, buff=0.18, corner_radius=0.12
        )
        self.play(Create(box_count))
        self.wait(2.0)

        # 清场
        self.play(FadeOut(VGroup(
            max_title, max_eq1, max_eq2, max_eq3,
            remove_title, check_items, count_row, count_stack, box_count,
        )))

        # ── Step 9: 谱线分布直观图 ───────────────────────────────────────
        vis_title = Text("可见谱线分布（衍射角示意）", font=CJK, color=BLUE).scale(0.48)
        vis_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(vis_title))

        axes_vis = Axes(
            x_range=[-6, 6, 1],
            y_range=[0, 1.4, 1],
            x_length=11.0,
            y_length=2.0,
            axis_config={"color": GREY, "include_tip": True},
        ).next_to(vis_title, DOWN, buff=0.35)

        x_label = MathTex(r"k").scale(0.55).next_to(axes_vis.x_axis.get_end(), RIGHT, buff=0.1)
        self.play(Create(axes_vis), FadeIn(x_label))

        # 绘制每条可见谱线（绿色竖条），缺级用红色 X 标记
        visible_ks = [k for k in range(-5, 6) if k not in missing_k]
        bars = VGroup()
        for k_val in visible_ks:
            bar = Line(
                start=axes_vis.c2p(k_val, 0),
                end=axes_vis.c2p(k_val, 1.1),
                color=GREEN, stroke_width=4,
            )
            bars.add(bar)

        miss_markers = VGroup()
        for k_val in [-4, 4]:
            mk_line = DashedLine(
                start=axes_vis.c2p(k_val, 0),
                end=axes_vis.c2p(k_val, 1.1),
                color=RED, stroke_width=2,
            )
            mk_x = Text("X", font=CJK, color=RED).scale(0.45).move_to(axes_vis.c2p(k_val, 0.55))
            miss_markers.add(mk_line, mk_x)

        self.play(Create(bars), run_time=1.2)
        self.play(FadeIn(miss_markers))
        self.wait(0.5)

        count_annot = VGroup(
            Text("绿线 = 可见谱线  共", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"9", color=GREEN).scale(0.70),
            Text("条", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.10)
        count_annot.next_to(axes_vis, DOWN, buff=0.28)

        red_annot = VGroup(
            Text("红X = 缺级 k=±4（光栅主极大被单缝暗纹消除）", font=CJK, color=RED).scale(0.38),
        )
        red_annot.next_to(count_annot, DOWN, buff=0.15)

        self.play(FadeIn(count_annot), FadeIn(red_annot))
        self.wait(2.0)
        self.play(FadeOut(VGroup(axes_vis, x_label, bars, miss_markers, count_annot, red_annot, vis_title)))

        # ── Step 10: 总结卡 ───────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.54)
        s_title.next_to(title, DOWN, buff=0.42)

        s1_zh = Text("光栅方程：", font=CJK, color=WHITE).scale(0.42)
        s1_f = MathTex(r"d\sin\theta = k\lambda \Rightarrow d = 3\,\mu\mathrm{m}", color=YELLOW).scale(0.68)
        s1 = VGroup(s1_zh, s1_f).arrange(RIGHT, buff=0.15)

        s2_zh = Text("缺级条件：", font=CJK, color=WHITE).scale(0.42)
        s2_f = MathTex(r"k_{\text{miss}}=\tfrac{d}{a}k' \Rightarrow a = 0.75\,\mu\mathrm{m}", color=ORANGE).scale(0.68)
        s2 = VGroup(s2_zh, s2_f).arrange(RIGHT, buff=0.15)

        s3_zh = Text("最大级次：", font=CJK, color=WHITE).scale(0.42)
        s3_f = MathTex(r"|k|_{\max} < \frac{d}{\lambda} = 6 \Rightarrow k = 0,\pm1\ldots\pm5", color=CYAN).scale(0.65)
        s3 = VGroup(s3_zh, s3_f).arrange(RIGHT, buff=0.15)

        s4_zh = Text("去掉缺级 k=±4", font=CJK, color=RED).scale(0.42)
        s4_f = MathTex(r"\Rightarrow 11 - 2 = 9\ \text{lines}", color=GREEN).scale(0.68)
        s4 = VGroup(s4_zh, s4_f).arrange(RIGHT, buff=0.15)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.35)
        summary.scale_to_fit_width(12.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(Write(s4))
        self.wait(0.4)
        self.play(Create(box_sum))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Ex1GratingMissingOrderSlitWidth",
        "id": "phys-ch11-11.2-ex1-grating-missing-order-slit-width",
        "chapterId": "ch11",
        "sectionId": "11.2",
        "title": "例题：光栅常数、缺级与可见谱线",
        "description": "三步解题：光栅方程求光栅常数d=3μm，缺级条件求单缝宽a=0.75μm，最后确定可见谱线共9条。",
    }
]
