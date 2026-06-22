"""第 8.4 节 · 霍尔效应：载流子偏转与霍尔电压

金标准范本：矢量场 / 受力 + ValueTracker 扫动参数，四步递进式教学：
  ① 载流子受洛伦兹力偏转  ② 霍尔电场平衡  ③ 公式推导  ④ 参数扫动 & 载流子符号判断

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

PLATE_W = 5.6   # 导体片宽度（左右，即电流方向）
PLATE_H = 2.8   # 导体片高度（上下，即霍尔方向）


# ─── 辅助：绘制矩形导体片轮廓 ─────────────────────────────────────────────
def make_conductor_outline(w=PLATE_W, h=PLATE_H, color=WHITE):
    rect = Rectangle(width=w, height=h, color=color, fill_color="#1a2a40",
                     fill_opacity=0.55, stroke_width=2.2)
    return rect


# ─── 辅助：磁场符号（垂直纸面向外用 ⊙ odot，向里用 ⊗ otimes）─────────────
def make_b_dots(rows=4, cols=6, w=PLATE_W, h=PLATE_H, symbol="odot", color=BLUE):
    dots = VGroup()
    for r in range(rows):
        for c in range(cols):
            x = -w / 2 + (c + 0.5) * w / cols
            y = -h / 2 + (r + 0.5) * h / rows
            d = MathTex(rf"\{symbol}", color=color).scale(0.45)
            d.move_to([x, y, 0])
            dots.add(d)
    return dots


class Ch08Kp4HallEffectMechanism(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("霍尔效应：载流子偏转与霍尔电压",
                     font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场  ·  8.4 霍尔效应",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("想象一块导体薄片，让电流从左流向右。", font=CJK).scale(0.48)
        ana2 = Text("此时在垂直片面方向加上磁场——", font=CJK).scale(0.48)
        ana3 = Text("内部载流子会被磁场侧推，积累在一侧，", font=CJK).scale(0.48)
        ana4 = Text("最终在上下两面之间产生一个横向电压，这就是霍尔效应。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.5)
        ana.scale_to_fit_width(12.5)
        for line in ana:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 俯视导体片——电流 & 磁场 & 电子受洛伦兹力偏转
        # ══════════════════════════════════════════════════════════════════
        scene_label = Text("俯视图（导体片厚度方向为 z 轴）",
                           font=CJK, color=CYAN).scale(0.4).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(scene_label))

        conductor = make_conductor_outline()
        conductor.shift(DOWN * 0.35)
        self.play(Create(conductor))

        # 磁场符号（向里，⊗ otimes）—— 决定洛伦兹力把电子推向上侧
        b_field = make_b_dots(rows=3, cols=5, symbol="otimes", color=BLUE)
        b_field.shift(DOWN * 0.35)
        b_label = VGroup(
            MathTex(r"\vec{B}", color=BLUE).scale(0.65),
            Text("（垂直导体面向里）", font=CJK, color=BLUE).scale(0.36)
        ).arrange(RIGHT, buff=0.1)
        b_label.to_corner(UR, buff=0.5)
        self.play(FadeIn(b_field), FadeIn(b_label))
        self.wait(0.8)

        # 电流方向箭头（从左到右）
        i_arrow = Arrow(
            start=conductor.get_left() + LEFT * 0.6,
            end=conductor.get_right() + RIGHT * 0.6,
            color=ORANGE, stroke_width=5, buff=0,
            max_tip_length_to_length_ratio=0.12
        )
        i_label = VGroup(
            MathTex(r"I", color=ORANGE).scale(0.7),
            Text("（电流向右）", font=CJK, color=ORANGE).scale(0.36)
        ).arrange(RIGHT, buff=0.1)
        i_label.next_to(i_arrow, DOWN, buff=0.2)
        self.play(Create(i_arrow), FadeIn(i_label))
        self.wait(0.8)

        # 电子速度方向（向左，与电流反向）—— 3颗电子动画
        elec_start_xs = [-1.4, -0.2, 0.9]
        elec_y0 = conductor.get_bottom()[1] + 0.35  # 下方起始
        electrons = VGroup()
        e_vel_arrows = VGroup()
        for x0 in elec_start_xs:
            e = Dot(point=[x0, elec_y0, 0], radius=0.14, color=YELLOW)
            v_arr = Arrow(
                start=[x0, elec_y0, 0],
                end=[x0 - 0.55, elec_y0, 0],
                color=YELLOW, buff=0, stroke_width=3,
                max_tip_length_to_length_ratio=0.35
            )
            electrons.add(e)
            e_vel_arrows.add(v_arr)

        e_label = VGroup(
            MathTex(r"v_e", color=YELLOW).scale(0.6),
            Text("（电子向左运动）", font=CJK, color=YELLOW).scale(0.36)
        ).arrange(RIGHT, buff=0.1)
        e_label.to_corner(DL, buff=0.4)
        self.play(FadeIn(electrons), FadeIn(e_vel_arrows), FadeIn(e_label))
        self.wait(0.6)

        # 洛伦兹力方向（F = qv×B，v 向左，B 向里 → 向上偏转）
        # 电子 q=-e, v=-v x_hat, B=-B z_hat → v×B = (-v)(-B)(x_hat×z_hat) = vB(-y_hat) = -vB y_hat
        #   F = (-e)(-vB y_hat) = e v B y_hat（向上）
        f_arrows = VGroup()
        for e_dot in electrons:
            cx, cy, _ = e_dot.get_center()
            fa = Arrow(
                start=[cx, cy, 0],
                end=[cx, cy + 0.55, 0],
                color=RED, buff=0, stroke_width=3,
                max_tip_length_to_length_ratio=0.35
            )
            f_arrows.add(fa)

        f_formula = VGroup(
            MathTex(r"\vec{F}=q\vec{v}\times\vec{B}", color=RED).scale(0.62),
            Text("（洛伦兹力向上）", font=CJK, color=RED).scale(0.36)
        ).arrange(RIGHT, buff=0.1)
        f_formula.to_edge(DOWN, buff=0.45)
        self.play(Create(f_arrows), FadeIn(f_formula))
        self.wait(0.8)

        # 动画：电子向上偏转（移动到导体上侧附近）
        anims = []
        target_y = conductor.get_top()[1] - 0.35
        for e_dot in electrons:
            cx = e_dot.get_center()[0]
            anims.append(e_dot.animate.move_to([cx, target_y, 0]))
        for fa in f_arrows:
            cx = fa.get_start()[0]
            anims.append(fa.animate.put_start_and_end_on(
                [cx, target_y - 0.35, 0],
                [cx, target_y, 0]
            ))
        for va in e_vel_arrows:
            cx = va.get_start()[0]
            anims.append(va.animate.put_start_and_end_on(
                [cx, target_y, 0],
                [cx - 0.55, target_y, 0]
            ))
        self.play(*anims, run_time=2.0)
        self.wait(1.0)

        # 上侧积累指示（颜色加深区域）
        accum_rect = Rectangle(
            width=PLATE_W - 0.1, height=0.55,
            color=YELLOW, fill_color=YELLOW, fill_opacity=0.28,
            stroke_width=1.5
        )
        accum_rect.move_to([conductor.get_center()[0],
                            conductor.get_top()[1] - 0.27, 0])
        accum_text = Text("电子积累（上侧负电荷密度增大）",
                          font=CJK, color=YELLOW).scale(0.38)
        accum_text.next_to(conductor, RIGHT, buff=0.25)
        accum_text.shift(UP * 0.7)
        self.play(FadeIn(accum_rect), FadeIn(accum_text))
        self.wait(1.0)

        # 清场第3步
        step3_group = VGroup(
            conductor, b_field, b_label, i_arrow, i_label,
            electrons, e_vel_arrows, e_label, f_arrows, f_formula,
            accum_rect, accum_text, scene_label
        )
        self.play(FadeOut(step3_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 霍尔电场平衡——EH 与 evB 平衡
        # ══════════════════════════════════════════════════════════════════
        eq_label = Text("平衡状态：霍尔电场 vs 洛伦兹力",
                        font=CJK, color=CYAN).scale(0.45).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(eq_label))

        cond2 = make_conductor_outline()
        cond2.shift(DOWN * 0.35)
        self.play(Create(cond2))

        # 再显示 B 场符号（向里 ⊗，与第 3 步一致）
        b2 = make_b_dots(rows=3, cols=5, symbol="otimes", color=BLUE)
        b2.shift(DOWN * 0.35)
        self.play(FadeIn(b2))

        # 上侧负电荷（电子堆积），下侧正电荷
        top_minus = Text("- - - - - - -", font=CJK, color=YELLOW).scale(0.55)
        top_minus.move_to([0, cond2.get_top()[1] - 0.18, 0])
        bot_plus = Text("+ + + + + + +", font=CJK, color=GREEN).scale(0.55)
        bot_plus.move_to([0, cond2.get_bottom()[1] + 0.18, 0])
        self.play(FadeIn(top_minus), FadeIn(bot_plus))
        self.wait(0.6)

        # 霍尔电场 EH 箭头（由下向上：场线由正(下)指向负(上)）
        eh_arrow = Arrow(
            start=[1.5, cond2.get_bottom()[1] + 0.3, 0],
            end=[1.5, cond2.get_top()[1] - 0.3, 0],
            color=GREEN, stroke_width=4, buff=0,
            max_tip_length_to_length_ratio=0.12
        )
        eh_label = VGroup(
            MathTex(r"\vec{E}_H", color=GREEN).scale(0.7),
            Text("（霍尔电场向上）", font=CJK, color=GREEN).scale(0.36)
        ).arrange(DOWN, buff=0.1)
        eh_label.next_to(eh_arrow, RIGHT, buff=0.2)
        self.play(Create(eh_arrow), FadeIn(eh_label))
        self.wait(0.8)

        # 平衡条件公式（逐步出现）
        bal1 = MathTex(r"e E_H = e v B", color=WHITE).scale(0.82)
        bal1.next_to(cond2, DOWN, buff=0.5)
        bal2 = MathTex(r"\Rightarrow\quad E_H = vB", color=YELLOW).scale(0.82)
        bal2.next_to(bal1, DOWN, buff=0.3)

        note_bal = VGroup(
            Text("电场力（向下作用于电子，阻止继续积累）", font=CJK, color=GREEN).scale(0.4),
            Text("= 洛伦兹力（向上）", font=CJK, color=RED).scale(0.4)
        ).arrange(RIGHT, buff=0.12)
        note_bal.next_to(bal1, UP, buff=0.3)
        note_bal.scale_to_fit_width(12)

        self.play(FadeIn(note_bal))
        self.wait(0.6)
        self.play(Write(bal1))
        self.wait(0.8)
        self.play(TransformMatchingTex(bal1.copy(), bal2))
        self.wait(1.2)

        step4_group = VGroup(
            eq_label, cond2, b2, top_minus, bot_plus,
            eh_arrow, eh_label, bal1, bal2, note_bal
        )
        self.play(FadeOut(step4_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 公式推导——UH = IB/(nqd)
        # ══════════════════════════════════════════════════════════════════
        deriv_label = Text("公式推导：霍尔电压 UH",
                           font=CJK, color=CYAN).scale(0.45).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(deriv_label))

        # 用 VGroup 混排中文注释 + 公式
        def zh_eq(zh_str, latex_str, zh_color=WHITE, eq_color=YELLOW):
            return VGroup(
                Text(zh_str, font=CJK, color=zh_color).scale(0.44),
                MathTex(latex_str, color=eq_color).scale(0.78)
            ).arrange(RIGHT, buff=0.25)

        step_a = zh_eq("平衡条件：", r"E_H = vB")
        step_b = zh_eq("电流密度：", r"j = nqv \implies v = \frac{j}{nq} = \frac{I}{nqA_\perp}")
        step_c = zh_eq("导体截面（宽 d，单位厚）：", r"A_\perp = d \cdot 1")
        step_d = zh_eq("代入得霍尔电场：", r"E_H = vB = \frac{IB}{nqd}")
        step_e_zh = Text("霍尔电压（上下极间距 = d）：",
                         font=CJK, color=WHITE).scale(0.44)
        step_e_eq = MathTex(r"U_H = E_H \cdot d = \frac{IB}{nqd}\cdot d",
                            color=YELLOW).scale(0.78)
        step_e = VGroup(step_e_zh, step_e_eq).arrange(RIGHT, buff=0.25)
        step_f_zh = Text("化简：", font=CJK, color=WHITE).scale(0.44)
        step_f_eq = MathTex(r"U_H = \frac{IB}{nqd}", color=GREEN).scale(0.92)
        step_f = VGroup(step_f_zh, step_f_eq).arrange(RIGHT, buff=0.25)

        # 布置位置
        steps = VGroup(step_a, step_b, step_c, step_d, step_e, step_f)
        steps.arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        steps.next_to(deriv_label, DOWN, buff=0.35)
        steps.scale_to_fit_width(13.0)

        for s in [step_a, step_b, step_c, step_d, step_e]:
            self.play(FadeIn(s))
            self.wait(0.85)

        self.play(Write(step_f))
        self.wait(1.0)

        # 高亮最终结果
        box_f = SurroundingRectangle(step_f_eq, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(box_f))
        self.wait(1.2)

        # 引入霍尔系数
        kh_zh = Text("引入霍尔系数：", font=CJK, color=ORANGE).scale(0.46)
        kh_eq = MathTex(r"K = \frac{1}{nq}", color=ORANGE).scale(0.82)
        kh_combined = VGroup(kh_zh, kh_eq).arrange(RIGHT, buff=0.2)
        kh_combined.next_to(steps, DOWN, buff=0.32)

        uh_k_eq = MathTex(r"\Rightarrow\quad U_H = K\frac{IB}{d}", color=YELLOW).scale(0.82)
        uh_k_eq.next_to(kh_combined, RIGHT, buff=0.4)

        self.play(FadeIn(kh_combined), Write(uh_k_eq))
        self.wait(1.2)

        deriv_group = VGroup(deriv_label, steps, box_f, kh_combined, uh_k_eq)
        self.play(FadeOut(deriv_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker 扫动——观察 UH 线性变化
        # ══════════════════════════════════════════════════════════════════
        tracker_label = Text("参数扫动：观察霍尔电压随 I、B、d 的变化",
                             font=CJK, color=CYAN).scale(0.43).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(tracker_label))

        # 参数 TrackerS（n、q 固定）
        I_t = ValueTracker(1.0)   # 单位：A（归一化）
        B_t = ValueTracker(1.0)   # 单位：T
        d_t = ValueTracker(1.0)   # 单位：m（归一化）
        n_val = 1.0               # 固定载流子浓度（归一化）
        q_val = 1.0               # 固定电荷量（归一化）

        def uh_val():
            return I_t.get_value() * B_t.get_value() / (n_val * q_val * d_t.get_value())

        # 公式展示区（始终在左侧）
        formula_display = always_redraw(lambda: VGroup(
            MathTex(r"U_H = \frac{IB}{nqd}", color=YELLOW).scale(0.72),
        ).to_edge(LEFT, buff=1.2).shift(DOWN * 0.5))

        # 数值读出
        readout = always_redraw(lambda: VGroup(
            MathTex(
                rf"I={I_t.get_value():.1f},\ B={B_t.get_value():.1f},\ d={d_t.get_value():.1f}",
                color=WHITE
            ).scale(0.6),
            VGroup(
                Text("UH = ", font=CJK, color=GREEN).scale(0.52),
                MathTex(rf"{uh_val():.2f}\ (\text{{norm.}})", color=GREEN).scale(0.62)
            ).arrange(RIGHT, buff=0.1)
        ).arrange(DOWN, buff=0.2).to_edge(RIGHT, buff=0.9).shift(DOWN * 0.5))

        # 简单条形图：UH 大小
        bar_bg = Rectangle(width=0.5, height=3.0, color=GRAY, fill_color="#222222",
                           fill_opacity=0.7, stroke_width=1.5)
        bar_bg.shift(DOWN * 0.5)

        bar = always_redraw(lambda: Rectangle(
            width=0.5,
            height=min(3.0 * uh_val() / 4.0, 3.0),
            color=GREEN, fill_color=GREEN, fill_opacity=0.85, stroke_width=0
        ).align_to(bar_bg, DOWN).align_to(bar_bg, LEFT))

        bar_label = Text("UH", font=CJK, color=GREEN).scale(0.45)
        bar_label.next_to(bar_bg, DOWN, buff=0.2)

        # 水平基准线标注
        guide_zh = Text("UH 高度 = 霍尔电压大小（归一化）", font=CJK, color=GRAY).scale(0.38)
        guide_zh.next_to(bar_bg, UP, buff=0.2)

        self.add(formula_display, readout)
        self.play(Create(bar_bg), FadeIn(bar), FadeIn(bar_label), FadeIn(guide_zh))
        self.wait(0.5)

        # 扫动 I（线性增大）
        sweep_i = Text("增大电流 I: UH 线性增大", font=CJK, color=ORANGE).scale(0.42)
        sweep_i.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(sweep_i))
        self.play(I_t.animate.set_value(3.0), run_time=2.5)
        self.wait(0.6)
        self.play(I_t.animate.set_value(1.0), run_time=1.5)
        self.play(FadeOut(sweep_i))

        # 扫动 B
        sweep_b = Text("增大磁场 B: UH 线性增大", font=CJK, color=BLUE).scale(0.42)
        sweep_b.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(sweep_b))
        self.play(B_t.animate.set_value(3.0), run_time=2.5)
        self.wait(0.6)
        self.play(B_t.animate.set_value(1.0), run_time=1.5)
        self.play(FadeOut(sweep_b))

        # 扫动 d（增大 d，UH 减小）
        sweep_d = Text("增大厚度 d: UH 反比减小", font=CJK, color=CYAN).scale(0.42)
        sweep_d.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(sweep_d))
        self.play(d_t.animate.set_value(3.0), run_time=2.5)
        self.wait(0.6)
        self.play(d_t.animate.set_value(1.0), run_time=1.5)
        self.play(FadeOut(sweep_d))

        tracker_group = VGroup(tracker_label, bar_bg, bar, bar_label, guide_zh)
        self.play(FadeOut(tracker_group), FadeOut(formula_display), FadeOut(readout))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 正负载流子对比——霍尔效应判断载流子符号
        # ══════════════════════════════════════════════════════════════════
        sign_label = Text("霍尔效应判断载流子正负",
                          font=CJK, color=CYAN).scale(0.45).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(sign_label))

        # 左图：负载流子（电子，n 型）
        rect_n = Rectangle(width=4.2, height=2.0, color=WHITE,
                           fill_color="#0d1f36", fill_opacity=0.7, stroke_width=2)
        rect_n.to_edge(LEFT, buff=0.6).shift(DOWN * 0.5)
        n_title = Text("负载流子（电子）", font=CJK, color=YELLOW).scale(0.42)
        n_title.next_to(rect_n, UP, buff=0.2)

        # 电流方向 → ，电子向 ←
        n_i_arr = Arrow(rect_n.get_left() + LEFT * 0.3,
                        rect_n.get_right() + RIGHT * 0.3,
                        color=ORANGE, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.15)
        n_i_lbl = MathTex(r"I \rightarrow", color=ORANGE).scale(0.55)
        n_i_lbl.next_to(rect_n, DOWN, buff=0.18)

        n_e_arr = Arrow(rect_n.get_center() + RIGHT * 0.5,
                        rect_n.get_center() + LEFT * 0.5,
                        color=YELLOW, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.3)
        n_e_lbl = MathTex(r"e^- \leftarrow", color=YELLOW).scale(0.5)
        n_e_lbl.next_to(n_e_arr, UP, buff=0.1)

        # F 向上 → 上侧积累负电荷 → 上侧电位低 → UH < 0
        n_f_arr = Arrow(rect_n.get_center() + DOWN * 0.3,
                        rect_n.get_center() + UP * 0.6,
                        color=RED, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.28)
        n_uh = VGroup(
            MathTex(r"U_H < 0", color=RED).scale(0.62),
            Text("（上负下正）", font=CJK, color=RED).scale(0.36)
        ).arrange(DOWN, buff=0.08)
        n_uh.next_to(rect_n, RIGHT, buff=0.15)

        # 右图：正载流子（空穴，p 型）
        rect_p = Rectangle(width=4.2, height=2.0, color=WHITE,
                           fill_color="#2a1a0d", fill_opacity=0.7, stroke_width=2)
        rect_p.to_edge(RIGHT, buff=0.6).shift(DOWN * 0.5)
        p_title = Text("正载流子（空穴）", font=CJK, color=GREEN).scale(0.42)
        p_title.next_to(rect_p, UP, buff=0.2)

        # 空穴与电流同向 →
        p_i_arr = Arrow(rect_p.get_left() + LEFT * 0.3,
                        rect_p.get_right() + RIGHT * 0.3,
                        color=ORANGE, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.15)
        p_i_lbl = MathTex(r"I \rightarrow", color=ORANGE).scale(0.55)
        p_i_lbl.next_to(rect_p, DOWN, buff=0.18)

        p_h_arr = Arrow(rect_p.get_center() + LEFT * 0.5,
                        rect_p.get_center() + RIGHT * 0.5,
                        color=GREEN, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.3)
        p_h_lbl = MathTex(r"h^+ \rightarrow", color=GREEN).scale(0.5)
        p_h_lbl.next_to(p_h_arr, UP, buff=0.1)

        # F=qv×B，q>0, v→右, B 向里 → F=向上偏转 → 上侧积累正电荷 → 上侧电位高 → UH > 0
        p_f_arr = Arrow(rect_p.get_center() + DOWN * 0.3,
                        rect_p.get_center() + UP * 0.6,
                        color=RED, stroke_width=3, buff=0,
                        max_tip_length_to_length_ratio=0.28)
        p_uh = VGroup(
            MathTex(r"U_H > 0", color=GREEN).scale(0.62),
            Text("（上正下负）", font=CJK, color=GREEN).scale(0.36)
        ).arrange(DOWN, buff=0.08)
        p_uh.next_to(rect_p, LEFT, buff=0.15)

        conclusion_zh = Text("测量 UH 正负 → 直接判断载流子符号",
                             font=CJK, color=ORANGE).scale(0.46)
        conclusion_zh.to_edge(DOWN, buff=0.5)

        # 播放正负载流子对比
        self.play(Create(rect_n), FadeIn(n_title))
        self.play(Create(n_i_arr), FadeIn(n_i_lbl),
                  FadeIn(n_e_arr), FadeIn(n_e_lbl))
        self.play(Create(n_f_arr), FadeIn(n_uh))
        self.wait(0.8)

        self.play(Create(rect_p), FadeIn(p_title))
        self.play(Create(p_i_arr), FadeIn(p_i_lbl),
                  FadeIn(p_h_arr), FadeIn(p_h_lbl))
        self.play(Create(p_f_arr), FadeIn(p_uh))
        self.wait(0.8)

        self.play(FadeIn(conclusion_zh))
        self.wait(1.5)

        sign_group = VGroup(
            sign_label,
            rect_n, n_title, n_i_arr, n_i_lbl, n_e_arr, n_e_lbl,
            n_f_arr, n_uh,
            rect_p, p_title, p_i_arr, p_i_lbl, p_h_arr, p_h_lbl,
            p_f_arr, p_uh,
            conclusion_zh
        )
        self.play(FadeOut(sign_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡——关键公式汇总 + 方框
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sum_title))

        # 公式 1：平衡条件
        s1_zh = Text("平衡条件：", font=CJK, color=WHITE).scale(0.45)
        s1_eq = MathTex(r"eE_H = evB \implies E_H = vB", color=YELLOW).scale(0.75)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.2)

        # 公式 2：霍尔电压
        s2_zh = Text("霍尔电压：", font=CJK, color=WHITE).scale(0.45)
        s2_eq = MathTex(r"U_H = \frac{IB}{nqd}", color=GREEN).scale(0.85)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.2)

        # 公式 3：霍尔系数
        s3_zh = Text("霍尔系数：", font=CJK, color=WHITE).scale(0.45)
        s3_eq = MathTex(r"K = \frac{1}{nq},\quad U_H = K\frac{IB}{d}", color=ORANGE).scale(0.78)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.2)

        # 文字结论
        s4 = Text("UH 正负可判断载流子符号（电子/空穴），K 可测载流子浓度 n。",
                  font=CJK, color=CYAN).scale(0.42)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)
        self.play(Write(s1))
        self.wait(0.7)
        self.play(Write(s2))
        self.wait(0.7)
        self.play(Write(s3))
        self.wait(0.7)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch08Kp4HallEffectMechanism",
        "id": "phys-ch08-8.4-kp4-hall-effect-mechanism",
        "chapterId": "ch08",
        "sectionId": "8.4",
        "title": "霍尔效应：载流子偏转与霍尔电压",
        "description": "四步递进：洛伦兹力侧偏电子→霍尔电场平衡→UH公式推导→ValueTracker扫动参数与正负载流子对比。",
    },
]
