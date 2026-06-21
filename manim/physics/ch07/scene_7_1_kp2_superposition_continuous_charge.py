"""第 7.1 节 · 叠加原理与连续带电体场强积分

三幕结构：
  第一幕 — 离散点电荷叠加：多个 E_i 矢量加法，合场强 E 头尾相接
  第二幕 — 连续带电体：带电直线分割为 dq 元，ValueTracker 扫 l，dE 方向含 θ 标注
  第三幕 — 对称抵消与积分结果：dE⊥抵消，dE∥累加，E = kq/[r√(L²+r²)]，r 衰减曲线

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch07Kp2SuperpositionContinuousCharge(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════
        title = Text("叠加原理与连续带电体场强积分", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════
        ana1 = Text("多个电荷同时存在时，每个都能产生电场，", font=CJK).scale(0.48)
        ana2 = Text("就像多个喇叭同时发声——叠加原理告诉我们：", font=CJK).scale(0.48)
        ana3 = Text("总场强 = 各电荷场强的矢量和。连续分布时求和变积分。", font=CJK, color=YELLOW).scale(0.45)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════
        # Step 3: 叠加原理公式定义（逐步出现）
        # ═══════════════════════════════════════════════════════════
        def_title = Text("叠加原理", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        formula_sum = MathTex(
            r"\mathbf{E}", r"=", r"\sum_{i}",
            r"\frac{1}{4\pi\varepsilon_0}", r"\frac{q_i}{r_i^2}", r"\hat{r}_{0i}"
        ).scale(0.88)
        formula_sum.next_to(def_title, DOWN, buff=0.4)
        formula_sum[0].set_color(YELLOW)
        formula_sum[4].set_color(ORANGE)

        note_sum = Text("每个点电荷独立产生场，矢量相加即得合场强", font=CJK, color=GREEN).scale(0.41)
        note_sum.next_to(formula_sum, DOWN, buff=0.3)

        formula_int = MathTex(
            r"\mathbf{E}", r"=", r"\int", r"k\frac{\mathrm{d}q}{r^2}", r"\hat{r}_0"
        ).scale(0.88)
        formula_int.next_to(note_sum, DOWN, buff=0.4)
        formula_int[0].set_color(YELLOW)
        formula_int[3].set_color(CYAN)

        note_int = Text("连续分布 → 求和变积分", font=CJK, color=GREEN).scale(0.41)
        note_int.next_to(formula_int, DOWN, buff=0.25)

        self.play(FadeIn(def_title))
        self.play(Write(formula_sum))
        self.wait(1.0)
        self.play(FadeIn(note_sum))
        self.wait(0.8)
        self.play(Write(formula_int))
        self.wait(0.8)
        self.play(FadeIn(note_int))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_title, formula_sum, note_sum, formula_int, note_int)))

        # ═══════════════════════════════════════════════════════════
        # 第一幕: 离散点电荷叠加 —— 矢量加法图示
        # ═══════════════════════════════════════════════════════════
        act1_label = Text("第一幕：离散电荷叠加", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act1_label))
        self.wait(0.6)

        # 场点 P（右侧）
        P_pos = np.array([3.0, 0.0, 0.0])
        P_dot = Dot(P_pos, color=WHITE, radius=0.08)
        P_label = Text("P", font=CJK, color=WHITE).scale(0.45).next_to(P_dot, UP, buff=0.12)

        # 三个点电荷的位置与颜色
        charge_data = [
            (np.array([-2.5,  0.8, 0.0]), RED,    r"q_1"),
            (np.array([-1.0, -1.0, 0.0]), ORANGE, r"q_2"),
            (np.array([-2.0, -0.5, 0.0]), PURPLE, r"q_3"),
        ]
        # E_i 方向：从各电荷指向 P
        arrow_colors = [RED, ORANGE, PURPLE]

        charge_dots = VGroup()
        charge_labels = VGroup()
        e_arrows = VGroup()
        e_labels = VGroup()

        e_vecs = []  # 保存方向向量（单位化后缩放）
        for i, (pos, col, ql) in enumerate(charge_data):
            d_dot = Dot(pos, color=col, radius=0.14)
            d_label = MathTex(ql, color=col).scale(0.55).next_to(d_dot, UP, buff=0.1)
            charge_dots.add(d_dot)
            charge_labels.add(d_label)

            # E_i 方向
            diff = P_pos - pos
            dist = np.linalg.norm(diff)
            unit = diff / dist
            e_length = 0.9 + 0.2 * i  # 各箭头略微错开长度
            e_start = P_pos + unit * 0.15
            e_end = P_pos + unit * (0.15 + e_length)
            arr = Arrow(e_start, e_end, buff=0, color=col, stroke_width=3,
                        max_tip_length_to_length_ratio=0.25)
            e_arrows.add(arr)
            e_label = MathTex(rf"E_{i+1}", color=col).scale(0.50)
            e_label.next_to(arr.get_end(), unit * 0.3 + UP * 0.1, buff=0.12)
            e_labels.add(e_label)
            e_vecs.append(unit * e_length)

        self.play(Create(P_dot), FadeIn(P_label))
        self.play(FadeIn(charge_dots), FadeIn(charge_labels))
        self.wait(0.5)

        # 逐步展示每个 E_i
        for arr, lbl in zip(e_arrows, e_labels):
            self.play(GrowArrow(arr), FadeIn(lbl))
            self.wait(0.5)

        # 矢量加法：头尾相接展示合场强
        add_note = Text("矢量加法：头尾相接得合场强 E", font=CJK, color=GREEN).scale(0.43)
        add_note.to_edge(DOWN, buff=0.7)
        self.play(FadeIn(add_note))
        self.wait(0.5)

        # 构建头尾相接的加法链（在场点 P 附近，平移一下展示）
        base_offset = np.array([0.0, -2.0, 0.0])
        chain_start = P_pos + base_offset
        chain_arrows = VGroup()
        tip = chain_start.copy()
        chain_colors = [RED, ORANGE, PURPLE]
        for vec, col in zip(e_vecs, chain_colors):
            ca = Arrow(tip, tip + vec, buff=0, color=col, stroke_width=2.5,
                       max_tip_length_to_length_ratio=0.22)
            chain_arrows.add(ca)
            tip = tip + vec

        # 合向量（从起点到最终终点）
        total_vec = sum(e_vecs)
        total_arrow = Arrow(chain_start, chain_start + total_vec, buff=0,
                            color=YELLOW, stroke_width=4,
                            max_tip_length_to_length_ratio=0.28)
        total_label = MathTex(r"\mathbf{E}", color=YELLOW).scale(0.65)
        total_label.next_to(total_arrow.get_end(), RIGHT, buff=0.15)

        for ca in chain_arrows:
            self.play(GrowArrow(ca), run_time=0.6)
        self.play(GrowArrow(total_arrow), FadeIn(total_label))
        self.wait(1.8)

        # 清场第一幕
        self.play(FadeOut(VGroup(
            act1_label, P_dot, P_label,
            charge_dots, charge_labels,
            e_arrows, e_labels,
            chain_arrows, total_arrow, total_label,
            add_note
        )))

        # ═══════════════════════════════════════════════════════════
        # 第二幕: 连续带电直线 —— dq 元 + ValueTracker 扫动
        # ═══════════════════════════════════════════════════════════
        act2_label = Text("第二幕：连续带电体的积分", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act2_label))
        self.wait(0.5)

        # 几何参数：带电直线沿 y 轴，从 -L 到 L；场点 P 在 x 轴正方向距离 r 处
        L_val = 1.8     # 半长
        r_val = 2.0     # 场点到直线的垂直距离
        P2_pos = np.array([r_val, 0.0, 0.0])

        # 画坐标示意
        y_line = Line(np.array([0, -L_val - 0.3, 0]), np.array([0, L_val + 0.3, 0]),
                      color=WHITE, stroke_width=2)
        y_label = Text("带电直线", font=CJK, color=WHITE).scale(0.38).next_to(y_line, LEFT, buff=0.15)
        P2_dot = Dot(P2_pos, color=WHITE, radius=0.09)
        P2_label = Text("P", font=CJK, color=WHITE).scale(0.45).next_to(P2_dot, UP, buff=0.1)

        # 垂直线（距离 r）
        r_line = DashedLine(np.array([0, 0, 0]), P2_pos, color=CYAN, stroke_width=1.5)
        r_label = MathTex(r"r", color=CYAN).scale(0.55).next_to(r_line, DOWN, buff=0.1)

        # 标注 L
        brace_L = Brace(y_line, direction=LEFT, color=GREEN)
        brace_L_label = MathTex(r"2L", color=GREEN).scale(0.55)
        brace_L.put_at_tip(brace_L_label)

        self.play(Create(y_line), FadeIn(y_label))
        self.play(Create(P2_dot), FadeIn(P2_label))
        self.play(Create(r_line), FadeIn(r_label))
        self.play(Create(brace_L), FadeIn(brace_L_label))
        self.wait(0.8)

        # ValueTracker 扫动 l：从 -L 到 L，展示各 dq 元
        l_tracker = ValueTracker(-L_val)
        N_segments = 12  # 离散化段数，用于高亮
        seg_height = 2 * L_val / N_segments

        # 预先画出所有静态小段
        segments = VGroup()
        for k in range(N_segments):
            y_bot = -L_val + k * seg_height
            y_top = y_bot + seg_height
            seg = Line(np.array([0, y_bot, 0]), np.array([0, y_top, 0]),
                       color=BLUE, stroke_width=6)
            segments.add(seg)
        self.play(Create(segments))
        self.wait(0.5)

        # 动态高亮 dq 元 + dE 箭头（用 always_redraw）
        def get_dq_highlight():
            l = l_tracker.get_value()
            y0 = max(-L_val, l - seg_height / 2)
            y1 = min(L_val, l + seg_height / 2)
            return Line(np.array([0, y0, 0]), np.array([0, y1, 0]),
                        color=YELLOW, stroke_width=10)

        def get_dE_arrow():
            l = l_tracker.get_value()
            src = np.array([0, l, 0])
            diff = P2_pos - src
            dist = np.linalg.norm(diff)
            unit = diff / dist
            de_start = P2_pos
            de_end = P2_pos + unit * 0.75
            return Arrow(de_start, de_end, buff=0, color=ORANGE, stroke_width=3,
                         max_tip_length_to_length_ratio=0.28)

        def get_theta_arc():
            l = l_tracker.get_value()
            src = np.array([0, l, 0])
            diff = P2_pos - src
            ang = math.atan2(diff[1], diff[0])  # 与 x 轴夹角
            # 画角度弧
            theta_val = abs(ang)
            arc = Arc(radius=0.25, start_angle=0, angle=-ang if ang > 0 else ang,
                      arc_center=P2_pos, color=CYAN, stroke_width=1.5)
            return arc

        dq_hl = always_redraw(get_dq_highlight)
        dE_arr = always_redraw(get_dE_arrow)
        theta_arc = always_redraw(get_theta_arc)

        theta_label = MathTex(r"\theta", color=CYAN).scale(0.55)
        theta_label.add_updater(lambda m: m.next_to(P2_dot, LEFT, buff=0.5).shift(UP * 0.15))

        dq_text = VGroup(
            Text("高亮段为 dq 元", font=CJK, color=YELLOW).scale(0.40),
            Text("橙色箭头为其产生的 dE", font=CJK, color=ORANGE).scale(0.40),
        ).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=1.0)

        self.play(FadeIn(dq_hl), FadeIn(dE_arr), FadeIn(theta_arc), FadeIn(theta_label))
        self.play(FadeIn(dq_text))
        self.wait(0.5)

        # 扫动 l 从 -L 到 L
        self.play(l_tracker.animate.set_value(L_val), run_time=3.5, rate_func=linear)
        self.wait(0.8)
        self.play(l_tracker.animate.set_value(-L_val), run_time=2.0, rate_func=linear)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            act2_label, y_line, y_label, P2_dot, P2_label,
            r_line, r_label, brace_L, brace_L_label,
            segments, dq_hl, dE_arr, theta_arc, theta_label, dq_text
        )))

        # ═══════════════════════════════════════════════════════════
        # 第三幕: 对称抵消与积分结果
        # ═══════════════════════════════════════════════════════════
        act3_label = Text("第三幕：对称性 + 积分公式 + 衰减曲线", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(act3_label))
        self.wait(0.5)

        # ── 对称抵消图示 ──────────────────────────────────────────────
        sym_note = Text("对称位置两段 dq 的贡献：", font=CJK).scale(0.46).next_to(act3_label, DOWN, buff=0.3)
        self.play(FadeIn(sym_note))
        self.wait(0.5)

        # 重新画简化几何（P 在右，两对称 dq 在 ±y₀）
        P3_pos = np.array([2.8, 0.0, 0.0])
        P3_dot = Dot(P3_pos, color=WHITE, radius=0.09)
        P3_label = Text("P", font=CJK, color=WHITE).scale(0.42).next_to(P3_dot, UP + RIGHT, buff=0.05)

        y0 = 1.2
        pos_top = np.array([0, y0, 0])
        pos_bot = np.array([0, -y0, 0])
        dot_top = Dot(pos_top, color=BLUE, radius=0.12)
        dot_bot = Dot(pos_bot, color=BLUE, radius=0.12)
        dq_label_top = MathTex(r"\mathrm{d}q", color=BLUE).scale(0.48).next_to(dot_top, LEFT, buff=0.1)
        dq_label_bot = MathTex(r"\mathrm{d}q", color=BLUE).scale(0.48).next_to(dot_bot, LEFT, buff=0.1)

        # dE 方向：从 P 沿各 dq → P 方向
        diff_top = P3_pos - pos_top
        diff_bot = P3_pos - pos_bot
        unit_top = diff_top / np.linalg.norm(diff_top)
        unit_bot = diff_bot / np.linalg.norm(diff_bot)
        dE_len = 1.0

        # 上方 dq 的 dE（指向右上→右下经P点）
        dE_top = Arrow(P3_pos, P3_pos + unit_top * dE_len, buff=0, color=RED,
                       stroke_width=3, max_tip_length_to_length_ratio=0.25)
        dE_top_lbl = MathTex(r"\mathrm{d}E_+", color=RED).scale(0.48).next_to(dE_top.get_end(), RIGHT, buff=0.1)

        # 下方 dq 的 dE
        dE_bot = Arrow(P3_pos, P3_pos + unit_bot * dE_len, buff=0, color=GREEN,
                       stroke_width=3, max_tip_length_to_length_ratio=0.25)
        dE_bot_lbl = MathTex(r"\mathrm{d}E_-", color=GREEN).scale(0.48).next_to(dE_bot.get_end(), RIGHT, buff=0.1)

        self.play(Create(P3_dot), FadeIn(P3_label))
        self.play(FadeIn(dot_top), FadeIn(dq_label_top), FadeIn(dot_bot), FadeIn(dq_label_bot))
        self.play(GrowArrow(dE_top), FadeIn(dE_top_lbl), GrowArrow(dE_bot), FadeIn(dE_bot_lbl))
        self.wait(1.0)

        # 标注⊥和∥分量
        cancel_note = Text("垂直分量（y方向）大小相等、方向相反 → 抵消", font=CJK, color=ORANGE).scale(0.40)
        keep_note = Text("平行分量（x方向）方向相同 → 相加！", font=CJK, color=YELLOW).scale(0.40)
        sym_block = VGroup(cancel_note, keep_note).arrange(DOWN, buff=0.18).to_edge(DOWN, buff=0.9)
        self.play(FadeIn(cancel_note))
        self.wait(0.8)
        self.play(FadeIn(keep_note))
        self.wait(1.2)

        # 高亮 x 分量
        # 垂直分量画为两条等长反向箭头
        perp_top = Arrow(P3_pos, P3_pos + np.array([0, unit_top[1], 0]) * dE_len,
                         buff=0, color=ORANGE, stroke_width=2, max_tip_length_to_length_ratio=0.25)
        perp_bot = Arrow(P3_pos, P3_pos + np.array([0, unit_bot[1], 0]) * dE_len,
                         buff=0, color=ORANGE, stroke_width=2, max_tip_length_to_length_ratio=0.25)
        para_arrow = Arrow(P3_pos, P3_pos + np.array([unit_top[0] * dE_len, 0, 0]) * 2,
                           buff=0, color=YELLOW, stroke_width=4, max_tip_length_to_length_ratio=0.25)
        E_para_lbl = MathTex(r"\mathrm{d}E_x", color=YELLOW).scale(0.55).next_to(para_arrow.get_end(), RIGHT, buff=0.1)

        self.play(Create(perp_top), Create(perp_bot))
        self.wait(0.6)
        cross1 = Cross(perp_top, color=RED, stroke_width=3)
        cross2 = Cross(perp_bot, color=RED, stroke_width=3)
        self.play(Create(cross1), Create(cross2))
        self.wait(0.7)
        self.play(Create(para_arrow), FadeIn(E_para_lbl))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            sym_note, P3_dot, P3_label,
            dot_top, dq_label_top, dot_bot, dq_label_bot,
            dE_top, dE_top_lbl, dE_bot, dE_bot_lbl,
            cancel_note, keep_note,
            perp_top, perp_bot, cross1, cross2,
            para_arrow, E_para_lbl
        )))

        # ── 积分结果公式（逐步推导） ──────────────────────────────────────
        deriv_label = Text("积分推导：有限长均匀带电直线", font=CJK, color=BLUE).scale(0.50).next_to(act3_label, DOWN, buff=0.35)
        self.play(FadeIn(deriv_label))
        self.wait(0.5)

        step_dE = MathTex(
            r"\mathrm{d}E_x", r"=", r"\frac{k\,\lambda\,\mathrm{d}l}{r^2+l^2}",
            r"\cdot\frac{r}{\sqrt{r^2+l^2}}"
        ).scale(0.80)
        step_dE.next_to(deriv_label, DOWN, buff=0.4)
        step_dE[0].set_color(YELLOW)
        step_dE[2].set_color(CYAN)
        step_dE[3].set_color(ORANGE)

        step_int = MathTex(
            r"E", r"=", r"\int_{-L}^{L}",
            r"\frac{k\lambda r\,\mathrm{d}l}{(r^2+l^2)^{3/2}}"
        ).scale(0.80)
        step_int.next_to(step_dE, DOWN, buff=0.4)
        step_int[0].set_color(YELLOW)
        step_int[3].set_color(CYAN)

        step_result = MathTex(
            r"E", r"=", r"\frac{kq}{r\sqrt{L^2+r^2}}"
        ).scale(1.0)
        step_result.next_to(step_int, DOWN, buff=0.45)
        step_result[0].set_color(YELLOW)
        step_result[2].set_color(GREEN)

        box_result = SurroundingRectangle(step_result, color=GREEN, buff=0.22, corner_radius=0.12)

        self.play(Write(step_dE))
        self.wait(1.0)
        self.play(Write(step_int))
        self.wait(1.0)
        self.play(TransformMatchingTex(step_int.copy(), step_result))
        self.play(Create(box_result))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_label, step_dE, step_int, step_result, box_result)))

        # ── ValueTracker: r 衰减曲线 ────────────────────────────────────
        decay_label = Text("场强随距离 r 的变化", font=CJK, color=BLUE).scale(0.50).next_to(act3_label, DOWN, buff=0.35)
        self.play(FadeIn(decay_label))
        self.wait(0.5)

        # 坐标轴
        axes = Axes(
            x_range=[0, 5.2, 1],
            y_range=[0, 3.2, 1],
            x_length=5.8,
            y_length=3.0,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        ).next_to(decay_label, DOWN, buff=0.3)

        x_lbl = MathTex(r"r", color=WHITE).scale(0.55).next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)
        y_lbl = MathTex(r"E", color=WHITE).scale(0.55).next_to(axes.y_axis.get_end(), UP, buff=0.15)

        # k, q, L 参数（归一化）
        k_n = 1.0
        q_n = 6.0
        L_n = 2.0

        def E_func(r):
            if r < 0.05:
                return 3.0
            return k_n * q_n / (r * math.sqrt(L_n**2 + r**2))

        r_tracker = ValueTracker(0.3)

        decay_curve = axes.plot(
            lambda r: min(E_func(r), 3.0),
            x_range=[0.2, 5.0, 0.05],
            color=YELLOW,
            stroke_width=2.5,
        )

        # 动态点 + 竖线
        def get_dot_on_curve():
            rv = r_tracker.get_value()
            Ev = min(E_func(rv), 3.0)
            return Dot(axes.c2p(rv, Ev), color=RED, radius=0.10)

        def get_vline():
            rv = r_tracker.get_value()
            Ev = min(E_func(rv), 3.0)
            return DashedLine(axes.c2p(rv, 0), axes.c2p(rv, Ev), color=CYAN, stroke_width=1.5)

        moving_dot = always_redraw(get_dot_on_curve)
        moving_vline = always_redraw(get_vline)

        readout = always_redraw(lambda: VGroup(
            Text("r = ", font=CJK, color=CYAN).scale(0.38),
            MathTex(rf"{r_tracker.get_value():.2f}", color=CYAN).scale(0.48),
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.45))

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(decay_curve))
        self.add(moving_dot, moving_vline, readout)
        self.wait(0.5)

        self.play(r_tracker.animate.set_value(4.8), run_time=3.5, rate_func=linear)
        self.wait(0.5)
        self.play(r_tracker.animate.set_value(0.5), run_time=2.0, rate_func=linear)
        self.wait(1.0)

        decay_note = Text("大 r 时 E ≈ kq/r²（点电荷极限）；小 r 时被长度 L 撑住", font=CJK, color=GREEN).scale(0.38)
        decay_note.next_to(axes, DOWN, buff=0.25)
        self.play(FadeIn(decay_note))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            act3_label, decay_label,
            axes, x_lbl, y_lbl, decay_curve,
            moving_dot, moving_vline, readout,
            decay_note
        )))

        # ═══════════════════════════════════════════════════════════
        # Step 最后: 小结卡
        # ═══════════════════════════════════════════════════════════
        sum_title = Text("小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sum_title))

        s1 = MathTex(
            r"\mathbf{E}=\sum_{i}\frac{1}{4\pi\varepsilon_0}\frac{q_i}{r_i^2}\hat{r}_{0i}",
            color=YELLOW
        ).scale(0.72)
        s2 = MathTex(r"\mathbf{E}=\int k\frac{\mathrm{d}q}{r^2}\hat{r}_0", color=CYAN).scale(0.72)
        s3 = MathTex(r"E=\frac{kq}{r\sqrt{L^2+r^2}}", color=GREEN).scale(0.88)

        note_sym = Text("对称性：⊥分量互消，∥分量叠加", font=CJK, color=ORANGE).scale(0.42)
        note_lim = Text("无限长直线极限：E = 2kλ/r（与 r 成反比）", font=CJK, color=WHITE).scale(0.40)

        s_group = VGroup(s1, s2, s3, note_sym, note_lim).arrange(DOWN, buff=0.32).next_to(sum_title, DOWN, buff=0.4)
        s_group.scale_to_fit_width(12.0)
        box = SurroundingRectangle(s_group, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(note_sym))
        self.wait(0.5)
        self.play(FadeIn(note_lim))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, s_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch07Kp2SuperpositionContinuousCharge",
        "id": "phys-ch07-7.1-kp2-superposition-continuous-charge",
        "chapterId": "ch07",
        "sectionId": "7.1",
        "title": "叠加原理与连续带电体场强积分",
        "description": "从离散叠加到连续积分，动画演示带电直线的 dE 方向、对称抵消与有限长场强公式 E=kq/(r√(L²+r²))。",
    },
]
