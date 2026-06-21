"""第 2.3 节 · 例题 3 — 黏性流体伯努利方程与供油管能量损耗

黏性流体中，压强差 + 重力势能差 = 流体内能量损耗。
本例：等截面倾斜管道（A 高于 B 3 m），已知 pA-pB=-1500 Pa，
求单位体积能量损耗 w 及 4 m³ 流体的总能量损耗 W。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch02Ex3ViscousBernoulliEnergyLoss(Scene):
    def construct(self):

        # ══ Step 1: 标题 ══════════════════════════════════════════════════
        title = Text("黏性流体伯努利方程与供油管能量损耗",
                     font=CJK, color=BLUE).scale(0.58).to_edge(UP)
        subtitle = Text("第二章  流体运动 · 2.3  例题精讲",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══ Step 2: 生活类比引入 ══════════════════════════════════════════
        ana1 = Text("想象一根倾斜的输油管：",
                    font=CJK, color=WHITE).scale(0.48)
        ana2 = Text("低处压力更大，高处压力更小——但油依然能流上去，",
                    font=CJK, color=WHITE).scale(0.46)
        ana3 = Text("代价是：克服摩擦，消耗了一部分机械能。",
                    font=CJK, color=ORANGE).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══ Step 3: 绘制倾斜管道示意图 ════════════════════════════════════
        # 管道：从左下(B 端)到右上(A 端)，A 高于 B 约 3 m
        pipe_color = GREY
        B_pos = np.array([-4.2, -1.6, 0])
        A_pos = np.array([1.8, 1.4, 0])
        pipe_vec = A_pos - B_pos
        pipe_len = np.linalg.norm(pipe_vec)
        pipe_unit = pipe_vec / pipe_len
        pipe_perp = np.array([-pipe_unit[1], pipe_unit[0], 0]) * 0.35

        top_wall = Line(B_pos + pipe_perp, A_pos + pipe_perp, color=pipe_color, stroke_width=4)
        bot_wall = Line(B_pos - pipe_perp, A_pos - pipe_perp, color=pipe_color, stroke_width=4)
        cap_B = Line(B_pos - pipe_perp, B_pos + pipe_perp, color=pipe_color, stroke_width=4)
        cap_A = Line(A_pos - pipe_perp, A_pos + pipe_perp, color=pipe_color, stroke_width=4)
        pipe_grp = VGroup(top_wall, bot_wall, cap_B, cap_A)

        # 流向箭头（管道内）
        flow_arrow = Arrow(B_pos + pipe_unit * 0.9,
                           A_pos - pipe_unit * 0.9,
                           buff=0, color=CYAN, stroke_width=3,
                           max_tip_length_to_length_ratio=0.18)

        # 端点 A、B 标签
        dot_A = Dot(A_pos, color=GREEN, radius=0.10)
        dot_B = Dot(B_pos, color=RED, radius=0.10)
        lbl_A = Text("A", font=CJK, color=GREEN).scale(0.5).next_to(dot_A, RIGHT, buff=0.15)
        lbl_B = Text("B", font=CJK, color=RED).scale(0.5).next_to(dot_B, LEFT, buff=0.15)

        # 高度差标注（竖向虚线 + 大括号式标注）
        h_line_top = DashedLine(A_pos, np.array([A_pos[0] + 1.2, A_pos[1], 0]),
                                color=YELLOW, dash_length=0.12)
        h_line_bot = DashedLine(B_pos, np.array([A_pos[0] + 1.2, B_pos[1], 0]),
                                color=YELLOW, dash_length=0.12)
        h_vert = Line(np.array([A_pos[0] + 1.1, B_pos[1], 0]),
                      np.array([A_pos[0] + 1.1, A_pos[1], 0]),
                      color=YELLOW, stroke_width=2)
        h_brace = Brace(h_vert, direction=RIGHT, color=YELLOW)
        h_label = MathTex(r"h=3.0\ \mathrm{m}", color=YELLOW).scale(0.5)
        h_brace.put_at_tip(h_label, buff=0.08)

        # 已知量标注
        known_pA = VGroup(
            Text("A端：", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"p_A\ \text{(lower)}", color=GREEN).scale(0.48)
        ).arrange(RIGHT, buff=0.06)
        known_pA.next_to(dot_A, UP, buff=0.22)

        known_pB = VGroup(
            Text("B端：", font=CJK, color=RED).scale(0.40),
            MathTex(r"p_B\ \text{(higher)}", color=RED).scale(0.48)
        ).arrange(RIGHT, buff=0.06)
        known_pB.next_to(dot_B, DOWN, buff=0.22)

        # 压差标注
        dp_label = VGroup(
            Text("压差：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"p_A - p_B = -1.5\times10^3\ \mathrm{Pa}", color=ORANGE).scale(0.48)
        ).arrange(RIGHT, buff=0.06)
        dp_label.to_edge(DOWN, buff=0.55)

        diagram_grp = VGroup(pipe_grp, flow_arrow, dot_A, dot_B, lbl_A, lbl_B,
                             h_line_top, h_line_bot, h_vert, h_brace, h_label,
                             known_pA, known_pB, dp_label)

        self.play(Create(pipe_grp), Create(flow_arrow))
        self.play(FadeIn(dot_A), FadeIn(lbl_A), FadeIn(dot_B), FadeIn(lbl_B))
        self.play(Create(h_line_top), Create(h_line_bot), Create(h_vert),
                  FadeIn(h_brace), Write(h_label))
        self.play(FadeIn(known_pA), FadeIn(known_pB), FadeIn(dp_label))
        self.wait(1.8)
        self.play(FadeOut(diagram_grp))

        # ══ Step 4: 写出黏性伯努利方程 ════════════════════════════════════
        eq_title = Text("黏性流体广义伯努利方程", font=CJK, color=BLUE).scale(0.5)
        eq_title.next_to(title, DOWN, buff=0.45)

        eq_full = MathTex(
            r"p_1", r"+", r"\tfrac{1}{2}\rho v_1^2", r"+", r"\rho g h_1",
            r"=",
            r"p_2", r"+", r"\tfrac{1}{2}\rho v_2^2", r"+", r"\rho g h_2",
            r"+", r"\Delta E"
        ).scale(0.72)
        eq_full.next_to(eq_title, DOWN, buff=0.4)

        # 颜色语义：压强=蓝，动能=白，势能=绿，耗散=橙
        eq_full[0].set_color(BLUE)
        eq_full[6].set_color(BLUE)
        eq_full[2].set_color(WHITE)
        eq_full[8].set_color(WHITE)
        eq_full[4].set_color(GREEN)
        eq_full[10].set_color(GREEN)
        eq_full[12].set_color(ORANGE)

        legend = VGroup(
            VGroup(Text("蓝色", font=CJK, color=BLUE).scale(0.36),
                   Text("= 压强项", font=CJK, color=WHITE).scale(0.36)).arrange(RIGHT, buff=0.06),
            VGroup(Text("绿色", font=CJK, color=GREEN).scale(0.36),
                   Text("= 重力势能项", font=CJK, color=WHITE).scale(0.36)).arrange(RIGHT, buff=0.06),
            VGroup(Text("橙色", font=CJK, color=ORANGE).scale(0.36),
                   Text("= 能量损耗", font=CJK, color=WHITE).scale(0.36)).arrange(RIGHT, buff=0.06),
        ).arrange(RIGHT, buff=0.5)
        legend.next_to(eq_full, DOWN, buff=0.3)

        self.play(FadeIn(eq_title))
        self.play(Write(eq_full))
        self.wait(0.8)
        self.play(FadeIn(legend))
        self.wait(1.6)

        # ══ Step 5: 化简（等截面管 v1=v2）════════════════════════════════
        simp_note = VGroup(
            Text("等截面管：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"v_1 = v_2", color=CYAN).scale(0.68),
            Text("  →  动能项消去", font=CJK, color=WHITE).scale(0.44)
        ).arrange(RIGHT, buff=0.12)
        simp_note.next_to(legend, DOWN, buff=0.32)
        self.play(FadeIn(simp_note))
        self.wait(0.9)

        eq_simp = MathTex(
            r"p_A", r"+", r"\rho g h_A",
            r"=",
            r"p_B", r"+", r"\rho g h_B", r"+", r"w"
        ).scale(0.82)
        eq_simp[0].set_color(BLUE)
        eq_simp[4].set_color(BLUE)
        eq_simp[2].set_color(GREEN)
        eq_simp[6].set_color(GREEN)
        eq_simp[8].set_color(ORANGE)
        eq_simp.next_to(simp_note, DOWN, buff=0.38)

        w_rearr = MathTex(
            r"w", r"=",
            r"(p_A - p_B)", r"+",
            r"\rho g (h_A - h_B)"
        ).scale(0.82)
        w_rearr[2].set_color(BLUE)
        w_rearr[4].set_color(GREEN)
        w_rearr[0].set_color(ORANGE)
        w_rearr.next_to(eq_simp, DOWN, buff=0.35)

        self.play(Write(eq_simp))
        self.wait(0.8)
        self.play(Write(w_rearr))
        self.wait(1.6)
        self.play(FadeOut(VGroup(eq_title, eq_full, legend, simp_note, eq_simp, w_rearr)))

        # ══ Step 6: 代入数值逐步计算 ══════════════════════════════════════
        calc_title = Text("代入数值：逐步计算", font=CJK, color=BLUE).scale(0.5)
        calc_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(calc_title))

        # 左列：文字说明 + 公式逐行出现
        known_box_items = [
            VGroup(Text("已知量", font=CJK, color=YELLOW).scale(0.44)),
            VGroup(
                Text("密度：", font=CJK, color=WHITE).scale(0.40),
                MathTex(r"\rho = 884\ \mathrm{kg/m^3}", color=CYAN).scale(0.52)
            ).arrange(RIGHT, buff=0.08),
            VGroup(
                Text("高差：", font=CJK, color=WHITE).scale(0.40),
                MathTex(r"h_A - h_B = 3.0\ \mathrm{m}", color=CYAN).scale(0.52)
            ).arrange(RIGHT, buff=0.08),
            VGroup(
                Text("压差：", font=CJK, color=WHITE).scale(0.40),
                MathTex(r"p_A - p_B = -1.5\times10^3\ \mathrm{Pa}", color=CYAN).scale(0.52)
            ).arrange(RIGHT, buff=0.08),
        ]
        known_col = VGroup(*known_box_items).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        known_col.next_to(calc_title, DOWN, buff=0.4).shift(LEFT * 2.6)

        self.play(FadeIn(known_box_items[0]))
        self.wait(0.3)
        self.play(FadeIn(known_box_items[1]))
        self.wait(0.3)
        self.play(FadeIn(known_box_items[2]))
        self.wait(0.3)
        self.play(FadeIn(known_box_items[3]))
        self.wait(0.8)

        # 右列：逐步计算
        step_p = VGroup(
            Text("压强差贡献（负值）：", font=CJK, color=BLUE).scale(0.40),
            MathTex(r"p_A - p_B = -1.5\times10^3\ \mathrm{J/m^3}", color=BLUE).scale(0.52)
        ).arrange(DOWN, buff=0.12, aligned_edge=LEFT)

        step_h = VGroup(
            Text("重力势能贡献（正值）：", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\rho g \Delta h = 884\times9.8\times3.0",
                    color=GREEN).scale(0.52),
            MathTex(r"\approx +2.65\times10^4\ \mathrm{J/m^3}",
                    color=GREEN).scale(0.52),
        ).arrange(DOWN, buff=0.10, aligned_edge=LEFT)

        step_w = VGroup(
            Text("单位体积能量损耗：", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"w = (-1.5\times10^3) + 2.65\times10^4",
                    color=ORANGE).scale(0.52),
            MathTex(r"w \approx 2.5\times10^4\ \mathrm{J/m^3}",
                    color=YELLOW).scale(0.60),
        ).arrange(DOWN, buff=0.10, aligned_edge=LEFT)

        calc_col = VGroup(step_p, step_h, step_w).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        calc_col.next_to(calc_title, DOWN, buff=0.4).shift(RIGHT * 0.9)
        calc_col.scale_to_fit_width(5.8)

        self.play(FadeIn(step_p))
        self.wait(1.0)
        self.play(FadeIn(step_h))
        self.wait(1.0)
        self.play(FadeIn(step_w))
        self.wait(1.2)
        self.play(FadeOut(VGroup(calc_title, known_col, calc_col)))

        # ══ Step 7: 能量柱状图（堆叠棒）══════════════════════════════════
        bar_title = Text("能量贡献：堆叠柱状图", font=CJK, color=BLUE).scale(0.5)
        bar_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(bar_title))

        # 坐标系（手绘风格，简洁）
        axes = Axes(
            x_range=[0, 3, 1],
            y_range=[-5000, 30000, 5000],
            x_length=5.5,
            y_length=4.2,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=False,
        )
        axes.next_to(bar_title, DOWN, buff=0.35).shift(LEFT * 0.3)

        # y 轴单位标签
        y_unit = VGroup(
            Text("能量损耗", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"(\mathrm{J/m^3})", color=WHITE).scale(0.42),
        ).arrange(DOWN, buff=0.05)
        y_unit.next_to(axes, LEFT, buff=0.18)

        # 各分量值（实际计算值）
        dp_val = -1500.0          # pA - pB（负，A 端压低）
        dh_val = 884 * 9.8 * 3.0  # ρgΔh ≈ 25987.2
        w_val = dp_val + dh_val   # ≈ 24487.2 ≈ 2.45e4

        # 三根柱子：压差项、势能项、总损耗
        BAR_W = 0.55  # 宽度（数据单位）

        # 压差贡献柱（蓝色，负值，向下）
        bar_dp = axes.get_area(
            axes.plot(lambda x: dp_val, x_range=[0.4, 0.4 + BAR_W], color=BLUE),
            x_range=[0.4, 0.4 + BAR_W], color=BLUE, opacity=0.85
        )
        lbl_dp = VGroup(
            MathTex(r"\Delta p", color=BLUE).scale(0.52),
            MathTex(r"-1.5\!\times\!10^3", color=BLUE).scale(0.44),
        ).arrange(DOWN, buff=0.06)
        lbl_dp.next_to(axes.c2p(0.4 + BAR_W / 2, dp_val), DOWN, buff=0.12)

        # 势能贡献柱（绿色，正值，向上）
        bar_dh = axes.get_area(
            axes.plot(lambda x: dh_val, x_range=[1.2, 1.2 + BAR_W], color=GREEN),
            x_range=[1.2, 1.2 + BAR_W], color=GREEN, opacity=0.85
        )
        lbl_dh = VGroup(
            MathTex(r"\rho g \Delta h", color=GREEN).scale(0.52),
            MathTex(r"+2.65\!\times\!10^4", color=GREEN).scale(0.44),
        ).arrange(DOWN, buff=0.06)
        lbl_dh.next_to(axes.c2p(1.2 + BAR_W / 2, dh_val), UP, buff=0.12)

        # 总损耗柱（橙色）
        bar_w = axes.get_area(
            axes.plot(lambda x: w_val, x_range=[2.0, 2.0 + BAR_W], color=ORANGE),
            x_range=[2.0, 2.0 + BAR_W], color=ORANGE, opacity=0.85
        )
        lbl_w = VGroup(
            MathTex(r"w", color=ORANGE).scale(0.52),
            MathTex(r"\approx 2.5\!\times\!10^4", color=ORANGE).scale(0.44),
        ).arrange(DOWN, buff=0.06)
        lbl_w.next_to(axes.c2p(2.0 + BAR_W / 2, w_val), UP, buff=0.12)

        # 零线
        zero_line = DashedLine(axes.c2p(0, 0), axes.c2p(3, 0),
                               color=WHITE, dash_length=0.1, stroke_width=1.5)

        bar_note = Text("负值：A 端压强低于 B 端；正值：A 端高于 B 端（势能贡献大于压差）",
                        font=CJK, color=YELLOW).scale(0.36)
        bar_note.to_edge(DOWN, buff=0.45)

        self.play(Create(axes), FadeIn(y_unit), Create(zero_line))
        self.play(FadeIn(bar_dp), Write(lbl_dp))
        self.wait(0.7)
        self.play(FadeIn(bar_dh), Write(lbl_dh))
        self.wait(0.7)
        self.play(FadeIn(bar_w), Write(lbl_w))
        self.wait(0.8)
        self.play(FadeIn(bar_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(bar_title, axes, y_unit, zero_line,
                                 bar_dp, lbl_dp, bar_dh, lbl_dh,
                                 bar_w, lbl_w, bar_note)))

        # ══ Step 8: 总能量损耗 W = w × V ══════════════════════════════════
        final_title = Text("总能量损耗", font=CJK, color=BLUE).scale(0.5)
        final_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(final_title))

        w_unit = VGroup(
            Text("单位体积损耗：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"w \approx 2.5\times10^4\ \mathrm{J/m^3}", color=ORANGE).scale(0.68)
        ).arrange(RIGHT, buff=0.12)

        v_known = VGroup(
            Text("流过体积：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"V = 4.0\ \mathrm{m^3}", color=CYAN).scale(0.68)
        ).arrange(RIGHT, buff=0.12)

        W_formula = MathTex(r"W = w \cdot V", color=WHITE).scale(0.82)
        W_calc = MathTex(
            r"W = 2.5\times10^4\ \mathrm{J/m^3} \times 4.0\ \mathrm{m^3}",
            color=WHITE
        ).scale(0.70)
        W_result = MathTex(r"W = 1.0\times10^5\ \mathrm{J}", color=YELLOW).scale(0.96)
        W_result_box = SurroundingRectangle(W_result, color=YELLOW, buff=0.22, corner_radius=0.12)

        steps_grp = VGroup(w_unit, v_known, W_formula, W_calc, W_result).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT)
        steps_grp.next_to(final_title, DOWN, buff=0.45).shift(LEFT * 0.2)
        steps_grp.scale_to_fit_width(9.5)

        self.play(FadeIn(w_unit))
        self.wait(0.7)
        self.play(FadeIn(v_known))
        self.wait(0.7)
        self.play(Write(W_formula))
        self.wait(0.7)
        self.play(Write(W_calc))
        self.wait(0.7)
        self.play(Write(W_result), Create(W_result_box))
        self.wait(1.8)
        self.play(FadeOut(VGroup(final_title, steps_grp, W_result_box)))

        # ══ Step 9: 小结卡 ════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(
            r"p_A + \rho g h_A = p_B + \rho g h_B + w",
            color=YELLOW
        ).scale(0.74)
        s2 = MathTex(
            r"w = (p_A - p_B) + \rho g (h_A - h_B)",
            color=YELLOW
        ).scale(0.74)
        s3 = MathTex(
            r"= -1.5\times10^3 + 2.65\times10^4 \approx 2.5\times10^4\ \mathrm{J/m^3}",
            color=GREEN
        ).scale(0.68)
        s4 = MathTex(
            r"W = w \cdot V = 1.0\times10^5\ \mathrm{J}",
            color=ORANGE
        ).scale(0.80)

        key1 = Text("压强差为负 → A 端压低，流体需靠势能驱动",
                    font=CJK, color=WHITE).scale(0.40)
        key2 = Text("重力势能贡献（+）远大于压差贡献（-），净结果为能量损耗",
                    font=CJK, color=WHITE).scale(0.40)

        summary_grp = VGroup(s1, s2, s3, s4, key1, key2).arrange(
            DOWN, buff=0.28, aligned_edge=LEFT)
        summary_grp.next_to(s_title, DOWN, buff=0.38)
        summary_grp.scale_to_fit_width(11.0)

        box = SurroundingRectangle(summary_grp, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(Write(s4))
        self.wait(0.5)
        self.play(FadeIn(key1), FadeIn(key2), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary_grp, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch02Ex3ViscousBernoulliEnergyLoss",
        "id": "phys-ch02-2.3-ex3-viscous-bernoulli-energy-loss",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "黏性流体伯努利方程与供油管能量损耗",
        "description": "以等截面倾斜供油管为例，演示黏性伯努利方程化简、各能量项的正负贡献（柱状图直觉）与总能量损耗的计算全过程。",
    },
]
