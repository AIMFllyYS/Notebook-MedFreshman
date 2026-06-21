"""第 12.3 节 · 例题：电子与子弹位置不确定量对比（海森堡不确定性原理）。

双栏对比动画：宏观子弹 vs 微观电子在相同速度不确定度下的位置不确定量，
定量演示 Δx ≥ ℏ/(2Δp)，揭示「宏观物体无需量子描述」的物理直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 物理常数 ──────────────────────────────────────────────────────────────────
HBAR = 1.0546e-34   # J·s
M_BULLET = 0.01     # kg
M_ELECTRON = 9.109e-31  # kg
V0 = 200.0          # m/s
DELTA_V_FRAC = 1e-4  # Δv/v = 0.01%

DELTA_V = V0 * DELTA_V_FRAC           # = 0.02 m/s

DELTA_P_BULLET = M_BULLET * DELTA_V   # ≈ 2e-4 kg·m/s
DELTA_P_ELECTRON = M_ELECTRON * DELTA_V  # ≈ 1.82e-35 kg·m/s

DELTA_X_BULLET = HBAR / (2 * DELTA_P_BULLET)    # ≈ 2.6e-31 m  → ~10^-31 m
DELTA_X_ELECTRON = HBAR / (2 * DELTA_P_ELECTRON) # ≈ 2.9e-9 m   → ~10^-9  m


class Ch12Ex1ElectronVsBulletUncertainty(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("例：电子与子弹位置不确定量对比", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.3  海森堡不确定性原理", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("我们能同时精确知道一颗子弹的位置和速度——", font=CJK).scale(0.48)
        ana2 = Text("但对于电子，量子力学告诉我们：", font=CJK).scale(0.48)
        ana3 = Text("速度越精确，位置就越模糊，两者无法同时确定。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 不确定性原理公式
        # ══════════════════════════════════════════════════════════════════════
        label_hup = Text("海森堡不确定性原理：", font=CJK, color=CYAN).scale(0.48)
        label_hup.next_to(title, DOWN, buff=0.55)

        hup = MathTex(
            r"\Delta x", r"\cdot", r"\Delta p_x", r"\geq", r"\frac{\hbar}{2}"
        ).scale(1.0).next_to(label_hup, DOWN, buff=0.35)
        hup[0].set_color(YELLOW)
        hup[2].set_color(GREEN)
        hup[4].set_color(CYAN)

        self.play(FadeIn(label_hup))
        self.play(Write(hup))
        self.wait(0.8)

        # 展开为可计算形式
        hup2 = MathTex(
            r"\Delta x", r"\geq", r"\frac{\hbar}{2\,\Delta p_x}",
            r"=", r"\frac{\hbar}{2\,m\,\Delta v}"
        ).scale(0.88).next_to(hup, DOWN, buff=0.35)
        hup2[0].set_color(YELLOW)
        hup2[2].set_color(CYAN)
        hup2[4].set_color(GREEN)
        self.play(Write(hup2))
        self.wait(1.4)

        note_dp = VGroup(
            Text("其中：", font=CJK).scale(0.42),
            MathTex(r"\Delta p_x = m\,\Delta v_x").scale(0.72),
        ).arrange(RIGHT, buff=0.18).next_to(hup2, DOWN, buff=0.28)
        note_dp[1].set_color(GREEN)
        self.play(FadeIn(note_dp))
        self.wait(1.4)
        self.play(FadeOut(VGroup(label_hup, hup, hup2, note_dp)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 题目已知条件——双栏对比布局
        # ══════════════════════════════════════════════════════════════════════
        col_left_x = -3.2
        col_right_x = 2.8

        # 左栏：子弹
        bullet_hdr = Text("子弹", font=CJK, color=ORANGE).scale(0.55)
        bullet_hdr.move_to([col_left_x, 2.0, 0])
        bullet_box_bg = RoundedRectangle(
            width=5.6, height=3.8, corner_radius=0.2,
            fill_color="#1a1a2e", fill_opacity=0.85, stroke_color=ORANGE, stroke_width=2
        ).move_to([col_left_x, 0.3, 0])

        b1 = VGroup(Text("质量", font=CJK).scale(0.38),
                    MathTex(r"m = 0.01\ \mathrm{kg}").scale(0.62)).arrange(RIGHT, buff=0.14)
        b2 = VGroup(Text("速度", font=CJK).scale(0.38),
                    MathTex(r"v = 200\ \mathrm{m/s}").scale(0.62)).arrange(RIGHT, buff=0.14)
        b3 = VGroup(Text("相对不确定度", font=CJK).scale(0.38),
                    MathTex(r"\Delta v / v = 0.01\%").scale(0.62)).arrange(RIGHT, buff=0.14)
        bullet_conds = VGroup(b1, b2, b3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        bullet_conds.move_to([col_left_x, 0.3, 0])

        # 右栏：电子
        electron_hdr = Text("电子", font=CJK, color=CYAN).scale(0.55)
        electron_hdr.move_to([col_right_x, 2.0, 0])
        electron_box_bg = RoundedRectangle(
            width=5.6, height=3.8, corner_radius=0.2,
            fill_color="#0d1b2a", fill_opacity=0.85, stroke_color=CYAN, stroke_width=2
        ).move_to([col_right_x, 0.3, 0])

        e1 = VGroup(Text("质量", font=CJK).scale(0.38),
                    MathTex(r"m_e = 9.11\times10^{-31}\ \mathrm{kg}").scale(0.62)).arrange(RIGHT, buff=0.14)
        e2 = VGroup(Text("速度（相同）", font=CJK).scale(0.38),
                    MathTex(r"v = 200\ \mathrm{m/s}").scale(0.62)).arrange(RIGHT, buff=0.14)
        e3 = VGroup(Text("相对不确定度（相同）", font=CJK).scale(0.38),
                    MathTex(r"\Delta v / v = 0.01\%").scale(0.62)).arrange(RIGHT, buff=0.14)
        electron_conds = VGroup(e1, e2, e3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        electron_conds.move_to([col_right_x, 0.3, 0])

        divider = DashedLine(
            start=[0, 2.5, 0], end=[0, -1.8, 0],
            color=WHITE, stroke_width=1.5, dash_length=0.18
        )

        self.play(FadeIn(bullet_box_bg), FadeIn(electron_box_bg))
        self.play(Write(bullet_hdr), Write(electron_hdr), Create(divider))
        self.play(FadeIn(bullet_conds), FadeIn(electron_conds))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 计算 Δp（双栏同步，逐步展示）
        # ══════════════════════════════════════════════════════════════════════
        step5_label = Text("第一步：计算动量不确定量", font=CJK, color=WHITE).scale(0.44)
        step5_label.next_to(title, DOWN, buff=0.1)
        self.play(
            FadeOut(VGroup(bullet_box_bg, electron_box_bg, divider,
                           bullet_conds, electron_conds, bullet_hdr, electron_hdr)),
            FadeIn(step5_label)
        )
        self.wait(0.5)

        # 子弹 Δp
        b_dp_label = Text("子弹：", font=CJK, color=ORANGE).scale(0.46)
        b_dp_label.move_to([-3.8, 1.4, 0])

        b_dp1 = MathTex(
            r"\Delta p_{bullet}",
            r"= m \cdot \Delta v",
        ).scale(0.78).next_to(b_dp_label, DOWN, buff=0.25).align_to(b_dp_label, LEFT)
        b_dp1[0].set_color(ORANGE)

        b_dp2 = MathTex(
            r"= 0.01 \times (200 \times 0.01\%)"
        ).scale(0.72).next_to(b_dp1, DOWN, buff=0.22).align_to(b_dp1, LEFT)

        b_dp3 = MathTex(
            r"= 2\times10^{-4}\ \mathrm{kg\cdot m/s}"
        ).scale(0.80).next_to(b_dp2, DOWN, buff=0.22).align_to(b_dp2, LEFT)
        b_dp3.set_color(ORANGE)

        self.play(FadeIn(b_dp_label), Write(b_dp1))
        self.wait(0.6)
        self.play(Write(b_dp2))
        self.wait(0.5)
        self.play(Write(b_dp3))
        self.wait(0.8)

        # 电子 Δp
        e_dp_label = Text("电子：", font=CJK, color=CYAN).scale(0.46)
        e_dp_label.move_to([0.8, 1.4, 0])

        e_dp1 = MathTex(
            r"\Delta p_{e}",
            r"= m_e \cdot \Delta v",
        ).scale(0.78).next_to(e_dp_label, DOWN, buff=0.25).align_to(e_dp_label, LEFT)
        e_dp1[0].set_color(CYAN)

        e_dp2 = MathTex(
            r"= 9.11\times10^{-31} \times 0.02"
        ).scale(0.72).next_to(e_dp1, DOWN, buff=0.22).align_to(e_dp1, LEFT)

        e_dp3 = MathTex(
            r"= 1.82\times10^{-32}\ \mathrm{kg\cdot m/s}"
        ).scale(0.80).next_to(e_dp2, DOWN, buff=0.22).align_to(e_dp2, LEFT)
        e_dp3.set_color(CYAN)

        self.play(FadeIn(e_dp_label), Write(e_dp1))
        self.wait(0.6)
        self.play(Write(e_dp2))
        self.wait(0.5)
        self.play(Write(e_dp3))
        self.wait(1.4)

        # 质量比提示
        ratio_note = VGroup(
            Text("质量相差约", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"10^{28}").scale(0.72),
            Text("倍，Δp 差距极大！", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(RIGHT, buff=0.15).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(ratio_note))
        self.wait(1.4)

        dp_group = VGroup(b_dp_label, b_dp1, b_dp2, b_dp3,
                          e_dp_label, e_dp1, e_dp2, e_dp3, ratio_note, step5_label)

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: 代入不确定性原理，计算 Δx（逐步展示）
        # ══════════════════════════════════════════════════════════════════════
        step6_label = Text("第二步：代入不确定性原理求位置不确定量", font=CJK, color=WHITE).scale(0.42)
        step6_label.next_to(title, DOWN, buff=0.1)
        self.play(FadeOut(dp_group), FadeIn(step6_label))
        self.wait(0.5)

        formula_banner = MathTex(
            r"\Delta x \geq \frac{\hbar}{2\,\Delta p}",
            r",\quad \hbar = 1.055\times10^{-34}\ \mathrm{J\cdot s}"
        ).scale(0.72).next_to(step6_label, DOWN, buff=0.35)
        formula_banner[0].set_color(YELLOW)
        formula_banner[1].set_color(CYAN)
        self.play(Write(formula_banner))
        self.wait(0.9)

        # ─── 子弹 Δx ──────────────────────────────────────────────────────
        b_dx_label = Text("子弹的最小位置不确定量：", font=CJK, color=ORANGE).scale(0.44)
        b_dx_label.next_to(formula_banner, DOWN, buff=0.45).to_edge(LEFT, buff=0.4)

        b_dx1 = MathTex(
            r"\Delta x_{bullet}",
            r"\geq \frac{1.055\times10^{-34}}{2\times2\times10^{-4}}"
        ).scale(0.76).next_to(b_dx_label, DOWN, buff=0.22).align_to(b_dx_label, LEFT)
        b_dx1[0].set_color(ORANGE)

        b_dx2 = MathTex(
            r"\approx 2.6\times10^{-31}\ \mathrm{m}"
        ).scale(0.88).next_to(b_dx1, DOWN, buff=0.2).align_to(b_dx1, LEFT)
        b_dx2.set_color(ORANGE)

        b_cmp = VGroup(
            Text("（质子半径 ~", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"10^{-15}\ \mathrm{m}").scale(0.62),
            Text("，此值更小——", font=CJK, color=WHITE).scale(0.38),
            Text("绝对忽略不计！）", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(b_dx2, DOWN, buff=0.18).align_to(b_dx2, LEFT)

        self.play(FadeIn(b_dx_label), Write(b_dx1))
        self.wait(0.6)
        self.play(Write(b_dx2))
        self.wait(0.5)
        self.play(FadeIn(b_cmp))
        self.wait(1.4)

        # ─── 电子 Δx ──────────────────────────────────────────────────────
        e_dx_label = Text("电子的最小位置不确定量：", font=CJK, color=CYAN).scale(0.44)
        e_dx_label.next_to(b_cmp, DOWN, buff=0.4).to_edge(LEFT, buff=0.4)

        e_dx1 = MathTex(
            r"\Delta x_{e}",
            r"\geq \frac{1.055\times10^{-34}}{2\times1.82\times10^{-32}}"
        ).scale(0.76).next_to(e_dx_label, DOWN, buff=0.22).align_to(e_dx_label, LEFT)
        e_dx1[0].set_color(CYAN)

        e_dx2 = MathTex(
            r"\approx 2.9\times10^{-3}\ \mathrm{m}"
        ).scale(0.88).next_to(e_dx1, DOWN, buff=0.2).align_to(e_dx1, LEFT)
        # Wait — let me recalculate for display: ℏ/(2·1.82e-32) = 1.055e-34 / 3.64e-32 ≈ 2.9e-3 m
        e_dx2.set_color(CYAN)

        e_cmp = VGroup(
            Text("（原子直径 ~", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"10^{-10}\ \mathrm{m}").scale(0.62),
            Text("，此值达到", font=CJK, color=WHITE).scale(0.38),
            Text("毫米量级！）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(e_dx2, DOWN, buff=0.18).align_to(e_dx2, LEFT)

        self.play(FadeIn(e_dx_label), Write(e_dx1))
        self.wait(0.6)
        self.play(Write(e_dx2))
        self.wait(0.5)
        self.play(FadeIn(e_cmp))
        self.wait(1.6)

        dx_group = VGroup(formula_banner, b_dx_label, b_dx1, b_dx2, b_cmp,
                          e_dx_label, e_dx1, e_dx2, e_cmp, step6_label)
        self.play(FadeOut(dx_group))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: 尺度对比可视化（同一比例尺的直观对比）
        # ══════════════════════════════════════════════════════════════════════
        scale_title = Text("第三步：尺度直观对比", font=CJK, color=WHITE).scale(0.48)
        scale_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(scale_title))
        self.wait(0.5)

        # 用对数尺度横轴显示不同量级
        # 横轴范围：log10(1e-35) 到 log10(1e0) → -35 到 0
        axes_scale = NumberLine(
            x_range=[-35, 2, 5],
            length=11,
            include_numbers=True,
            numbers_to_include=[-30, -25, -20, -15, -10, -5, 0],
            label_direction=DOWN,
            color=WHITE,
            tip_width=0.2,
            tip_height=0.2,
        ).shift(DOWN * 0.3)

        axis_label = VGroup(
            Text("尺度 (", font=CJK).scale(0.36),
            MathTex(r"\log_{10}").scale(0.5),
            Text(" m)", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.05).next_to(axes_scale, DOWN, buff=0.5)

        self.play(Create(axes_scale), FadeIn(axis_label))
        self.wait(0.5)

        # 参考刻度标注
        def log_pos(val):
            return axes_scale.n2p(math.log10(val))

        # 质子半径 ~1e-15 m
        proton_dot = Dot(log_pos(1e-15), color=WHITE, radius=0.07)
        proton_lbl = Text("质子半径", font=CJK, color=WHITE).scale(0.32)
        proton_lbl.next_to(proton_dot, UP, buff=0.15)

        # 原子直径 ~1e-10 m
        atom_dot = Dot(log_pos(1e-10), color=GREEN, radius=0.07)
        atom_lbl = Text("原子直径", font=CJK, color=GREEN).scale(0.32)
        atom_lbl.next_to(atom_dot, UP, buff=0.15)

        # 电子 Δx ~2.9e-3 m → ≈ 毫米
        # 重新精确计算：ℏ/(2*M_ELECTRON*DELTA_V) = 1.055e-34 / (2*9.109e-31*0.02)
        # = 1.055e-34 / 3.644e-32 ≈ 2.895e-3 m
        dx_e_real = HBAR / (2 * M_ELECTRON * DELTA_V)
        electron_dot = Dot(log_pos(dx_e_real), color=CYAN, radius=0.10)
        electron_lbl = Text("电子 Δx", font=CJK, color=CYAN).scale(0.36)
        electron_lbl.next_to(electron_dot, UP, buff=0.15)

        # 子弹 Δx ~2.6e-31 m
        dx_b_real = HBAR / (2 * M_BULLET * DELTA_V)
        bullet_dot = Dot(log_pos(dx_b_real), color=ORANGE, radius=0.10)
        bullet_lbl = Text("子弹 Δx", font=CJK, color=ORANGE).scale(0.36)
        bullet_lbl.next_to(bullet_dot, DOWN, buff=0.15)

        self.play(FadeIn(proton_dot), FadeIn(proton_lbl))
        self.wait(0.4)
        self.play(FadeIn(atom_dot), FadeIn(atom_lbl))
        self.wait(0.4)
        self.play(FadeIn(bullet_dot), FadeIn(bullet_lbl))
        self.wait(0.5)
        self.play(FadeIn(electron_dot), FadeIn(electron_lbl))
        self.wait(1.4)

        contrast_txt = VGroup(
            Text("子弹 Δx 远小于质子半径", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"\Rightarrow").scale(0.65),
            Text("量子效应完全可以忽略", font=CJK, color=GREEN).scale(0.40),
        ).arrange(RIGHT, buff=0.18).to_edge(DOWN, buff=0.75)
        self.play(FadeIn(contrast_txt))
        self.wait(1.2)

        electron_txt = VGroup(
            Text("电子 Δx 达毫米量级，与原子相差", font=CJK, color=CYAN).scale(0.40),
            MathTex(r"10^7").scale(0.65),
            Text("倍——必须量子描述！", font=CJK, color=RED).scale(0.40),
        ).arrange(RIGHT, buff=0.14).next_to(contrast_txt, UP, buff=0.22)
        self.play(FadeIn(electron_txt))
        self.wait(1.6)

        scale_group = VGroup(axes_scale, axis_label, proton_dot, proton_lbl,
                             atom_dot, atom_lbl, bullet_dot, bullet_lbl,
                             electron_dot, electron_lbl, contrast_txt, electron_txt,
                             scale_title)
        self.play(FadeOut(scale_group))

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 路径直觉——子弹清晰直线 vs 电子概率云（图形类比）
        # ══════════════════════════════════════════════════════════════════════
        path_title = Text("直觉对比：宏观轨迹 vs 量子概率云", font=CJK, color=WHITE).scale(0.48)
        path_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(path_title))
        self.wait(0.4)

        # ── 左：子弹清晰轨迹 ────────────────────────────────────────────────
        bullet_title_l = Text("子弹：确定轨迹", font=CJK, color=ORANGE).scale(0.46)
        bullet_title_l.move_to([-3.5, 1.2, 0])

        bullet_path = Arrow(
            start=[-5.5, -0.3, 0], end=[-1.5, -0.3, 0],
            color=ORANGE, buff=0, stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        bullet_dot_path = Dot([-5.5, -0.3, 0], color=ORANGE, radius=0.14)
        bullet_label_path = Text("子弹", font=CJK, color=ORANGE).scale(0.38)
        bullet_label_path.next_to(bullet_dot_path, DOWN, buff=0.18)

        path_note_l = Text("位置不确定量远小于质子，\n轨迹为经典确定直线", font=CJK, color=WHITE).scale(0.36)
        path_note_l.move_to([-3.5, -1.4, 0])

        self.play(Create(bullet_path), FadeIn(bullet_dot_path),
                  Write(bullet_title_l), FadeIn(bullet_label_path))
        self.wait(0.6)
        self.play(FadeIn(path_note_l))
        self.wait(0.8)

        # ── 右：电子概率云 ──────────────────────────────────────────────────
        electron_title_r = Text("电子：概率云", font=CJK, color=CYAN).scale(0.46)
        electron_title_r.move_to([3.0, 1.2, 0])

        # 用多个透明圆形叠加模拟概率云
        cloud_center = [3.0, -0.3, 0]
        cloud_layers = VGroup()
        for r, op in [(0.9, 0.12), (0.65, 0.18), (0.42, 0.25), (0.22, 0.32)]:
            c = Circle(radius=r, color=CYAN, fill_color=CYAN,
                       fill_opacity=op, stroke_width=0)
            c.move_to(cloud_center)
            cloud_layers.add(c)

        electron_center_dot = Dot(cloud_center, color=YELLOW, radius=0.06)

        # 带箭头的速度示意（方向已知，但位置模糊）
        v_arrow = Arrow(
            start=[cloud_center[0] + 0.9, cloud_center[1], 0],
            end=[cloud_center[0] + 1.8, cloud_center[1], 0],
            color=YELLOW, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.2
        )
        v_lbl = MathTex(r"\vec{v}").scale(0.55).set_color(YELLOW)
        v_lbl.next_to(v_arrow, UP, buff=0.1)

        path_note_r = Text("位置不确定量达毫米，\n位置只能用概率分布描述", font=CJK, color=WHITE).scale(0.36)
        path_note_r.move_to([3.0, -1.4, 0])

        vert_div = DashedLine([0, 1.6, 0], [0, -2.0, 0], color=WHITE, stroke_width=1.2)
        self.play(Create(vert_div))
        self.play(FadeIn(cloud_layers), FadeIn(electron_center_dot),
                  Write(electron_title_r), Create(v_arrow), FadeIn(v_lbl))
        self.wait(0.6)
        self.play(FadeIn(path_note_r))
        self.wait(1.0)

        # ValueTracker 让概率云脉动（增强视觉）
        pulse = ValueTracker(1.0)
        cloud_animated = always_redraw(lambda: VGroup(*[
            Circle(
                radius=r * (1.0 + 0.08 * math.sin(pulse.get_value() * PI)),
                color=CYAN, fill_color=CYAN,
                fill_opacity=op, stroke_width=0
            ).move_to(cloud_center)
            for r, op in [(0.9, 0.12), (0.65, 0.18), (0.42, 0.25), (0.22, 0.32)]
        ]))
        self.remove(cloud_layers)
        self.add(cloud_animated)
        self.play(pulse.animate.set_value(3.0), run_time=2.2, rate_func=linear)
        self.wait(0.5)

        path_group = VGroup(bullet_path, bullet_dot_path, bullet_title_l, bullet_label_path,
                            path_note_l, electron_title_r, electron_center_dot, v_arrow,
                            v_lbl, path_note_r, vert_div, cloud_animated, path_title)
        self.play(FadeOut(path_group))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 结论卡片
        # ══════════════════════════════════════════════════════════════════════
        conc_title = Text("物理结论", font=CJK, color=BLUE).scale(0.52)
        conc_title.next_to(title, DOWN, buff=0.45)

        conc1 = VGroup(
            Text("子弹：", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\Delta x_{bullet} \approx 2.6\times10^{-31}\ \mathrm{m}").scale(0.72),
            Text("（绝对忽略）", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.15)

        conc2 = VGroup(
            Text("电子：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"\Delta x_{e} \approx 2.9\times10^{-3}\ \mathrm{m}").scale(0.72),
            Text("（毫米量级！）", font=CJK, color=RED).scale(0.44),
        ).arrange(RIGHT, buff=0.15)

        conc3 = Text("宏观物体：量子不确定性可完全忽略，经典力学适用", font=CJK, color=GREEN).scale(0.42)
        conc4 = Text("微观粒子：不确定性与自身尺度相当，必须用量子力学描述", font=CJK, color=YELLOW).scale(0.42)

        conc_group = VGroup(conc1, conc2, conc3, conc4).arrange(DOWN, buff=0.35).next_to(conc_title, DOWN, buff=0.4)
        conc_group.scale_to_fit_width(12.0)

        box = SurroundingRectangle(conc_group, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(conc_title))
        self.play(Write(conc1), Write(conc2))
        self.wait(0.6)
        self.play(FadeIn(conc3))
        self.wait(0.5)
        self.play(FadeIn(conc4))
        self.play(Create(box))
        self.wait(2.2)

        # ══════════════════════════════════════════════════════════════════════
        # Step 10: 小结卡（关键公式汇总）
        # ══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(conc_title, conc_group, box)))

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1 = MathTex(r"\Delta x \cdot \Delta p_x \geq \frac{\hbar}{2}", color=YELLOW).scale(0.85)
        s2 = MathTex(r"\Delta p_x = m\,\Delta v_x", color=GREEN).scale(0.85)

        s3 = VGroup(
            Text("宏观（子弹）：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"\Delta x \sim 10^{-31}\ \mathrm{m}").scale(0.70),
            Text("→ 忽略", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.15)

        s4 = VGroup(
            Text("微观（电子）：", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"\Delta x \sim 10^{-3}\ \mathrm{m}").scale(0.70),
            Text("→ 必须量子描述", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.15)

        s5 = Text("质量越小，量子效应越显著", font=CJK, color=YELLOW).scale(0.44)

        s = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.38).next_to(s_title, DOWN, buff=0.4)
        s.scale_to_fit_width(11.5)
        sbox = SurroundingRectangle(s, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3), FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5), Create(sbox))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s, sbox, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Ex1ElectronVsBulletUncertainty",
        "id": "phys-ch12-12.3-ex1-electron-vs-bullet-uncertainty",
        "chapterId": "ch12",
        "sectionId": "12.3",
        "title": "例：电子与子弹位置不确定量对比",
        "description": "双栏对比动画：用海森堡不确定性原理计算宏观子弹(Δx~10⁻³¹m)与微观电子(Δx~mm)的位置不确定量，对数尺度可视化揭示「宏观物体无需量子描述」的本质。",
    },
]
