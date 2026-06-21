"""第 13.1 节 · 例题2：氘核与氦核的结合能和比结合能。

通过核结构示意图、能量柱状图和折叠除法动画，
帮助零基础读者理解质量亏损、结合能与比结合能的物理意义。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数 ─────────────────────────────────────────────────────────────────
# 氘核 (²H): Z=1, A=2, 结合能 2.22 MeV, 比结合能 1.11 MeV/nucleon
DE_DEUTERIUM = 2.22      # MeV
A_DEUTERIUM = 2
EPS_DEUTERIUM = DE_DEUTERIUM / A_DEUTERIUM   # 1.11

# 氦核 (⁴He): Z=2, A=4, 结合能 28.30 MeV, 比结合能 7.075 MeV/nucleon
DE_HELIUM = 28.30        # MeV
A_HELIUM = 4
EPS_HELIUM = DE_HELIUM / A_HELIUM            # 7.075


class Ch13Ex2DeuteriumHeliumBindingEnergy(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("氘核与氦核：结合能和比结合能", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP)
        subtitle = Text("第十三章 原子核与放射性 · 13.1 · 例题2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("把散沙攥成一个拳头，需要花力气——核子聚合成原子核也一样。", font=CJK).scale(0.46)
        ana2 = Text("聚合时释放的能量来自质量亏损，就是爱因斯坦 E=mc² 的直接体现。", font=CJK).scale(0.46)
        ana3 = Text("结合能越大，核越稳定；比结合能（人均结合能）才能公平比较。", font=CJK, color=YELLOW).scale(0.46)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(13)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 核结构示意图 — 氘核 ²H (1p + 1n) 和 氦核 ⁴He (2p + 2n)
        # ══════════════════════════════════════════════════════════════
        struct_label = Text("核结构示意图", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(struct_label))

        R = 0.28   # 核子半径

        def make_proton(center):
            c = Circle(radius=R, color=RED, fill_opacity=0.85, fill_color=RED)
            c.move_to(center)
            lbl = Text("p", font=CJK, color=WHITE).scale(0.45).move_to(center)
            return VGroup(c, lbl)

        def make_neutron(center):
            c = Circle(radius=R, color=GRAY, fill_opacity=0.85, fill_color=GRAY)
            c.move_to(center)
            lbl = Text("n", font=CJK, color=WHITE).scale(0.45).move_to(center)
            return VGroup(c, lbl)

        # ── 氘核 ²H: 1质子 + 1中子 ─────────────────────────────────
        d_center = LEFT * 3.2 + DOWN * 0.2
        d_p = make_proton(d_center + LEFT * 0.32)
        d_n = make_neutron(d_center + RIGHT * 0.32)
        d_nucleus = VGroup(d_p, d_n)
        d_label = MathTex(r"{}^{2}_{1}\mathrm{H}", color=RED).scale(0.9).next_to(d_nucleus, UP, buff=0.25)
        d_desc_zh = Text("氘核", font=CJK, color=WHITE).scale(0.44).next_to(d_label, RIGHT, buff=0.18)
        d_comp = VGroup(
            Text("1 质子", font=CJK, color=RED).scale(0.40),
            Text("1 中子", font=CJK, color=GRAY).scale(0.40),
        ).arrange(DOWN, buff=0.14).next_to(d_nucleus, DOWN, buff=0.22)

        # ── 氦核 ⁴He: 2质子 + 2中子 (正方形排列) ───────────────────
        h_center = RIGHT * 2.8 + DOWN * 0.2
        offsets = [LEFT * 0.32 + UP * 0.32,
                   RIGHT * 0.32 + UP * 0.32,
                   LEFT * 0.32 + DOWN * 0.32,
                   RIGHT * 0.32 + DOWN * 0.32]
        h_p1 = make_proton(h_center + offsets[0])
        h_p2 = make_proton(h_center + offsets[1])
        h_n1 = make_neutron(h_center + offsets[2])
        h_n2 = make_neutron(h_center + offsets[3])
        h_nucleus = VGroup(h_p1, h_p2, h_n1, h_n2)
        h_label = MathTex(r"{}^{4}_{2}\mathrm{He}", color=YELLOW).scale(0.9).next_to(h_nucleus, UP, buff=0.25)
        h_desc_zh = Text("氦核", font=CJK, color=WHITE).scale(0.44).next_to(h_label, RIGHT, buff=0.18)
        h_comp = VGroup(
            Text("2 质子", font=CJK, color=RED).scale(0.40),
            Text("2 中子", font=CJK, color=GRAY).scale(0.40),
        ).arrange(DOWN, buff=0.14).next_to(h_nucleus, DOWN, buff=0.22)

        # 分割线
        sep_line = DashedLine(UP * 1.8 + DOWN * 0.0, DOWN * 1.8, color=WHITE).set_opacity(0.4)

        # 质量标注
        d_mass_zh = Text("核子质量之和 > 核质量", font=CJK, color=ORANGE).scale(0.38)
        d_mass_zh.next_to(d_comp, DOWN, buff=0.22)
        h_mass_zh = Text("核子质量之和 > 核质量", font=CJK, color=ORANGE).scale(0.38)
        h_mass_zh.next_to(h_comp, DOWN, buff=0.22)

        self.play(
            AnimationGroup(
                Create(d_nucleus), Write(d_label), FadeIn(d_desc_zh),
                lag_ratio=0.3
            )
        )
        self.play(FadeIn(d_comp))
        self.wait(0.6)
        self.play(Create(sep_line))
        self.play(
            AnimationGroup(
                Create(h_nucleus), Write(h_label), FadeIn(h_desc_zh),
                lag_ratio=0.3
            )
        )
        self.play(FadeIn(h_comp))
        self.wait(0.8)
        self.play(FadeIn(d_mass_zh), FadeIn(h_mass_zh))
        self.wait(1.2)

        struct_group = VGroup(
            struct_label, d_nucleus, d_label, d_desc_zh, d_comp, d_mass_zh,
            h_nucleus, h_label, h_desc_zh, h_comp, h_mass_zh, sep_line
        )
        self.play(FadeOut(struct_group))

        # ══════════════════════════════════════════════════════════════
        # Step 4: 结合能公式逐步推导
        # ══════════════════════════════════════════════════════════════
        deriv_label = Text("结合能公式推导", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(deriv_label))

        # 质量亏损
        zh_dm = Text("质量亏损：", font=CJK, color=WHITE).scale(0.48)
        eq_dm = MathTex(r"\Delta m = Z m_p + (A-Z)m_n - m_{\rm nuc}").scale(0.78)
        row1 = VGroup(zh_dm, eq_dm).arrange(RIGHT, buff=0.2).next_to(deriv_label, DOWN, buff=0.5)
        row1.scale_to_fit_width(13)
        self.play(FadeIn(zh_dm))
        self.play(Write(eq_dm))
        self.wait(1.2)

        # 爱因斯坦质能关系
        zh_e = Text("质能关系：", font=CJK, color=WHITE).scale(0.48)
        eq_e = MathTex(r"\Delta E = \Delta m \cdot c^2").scale(0.78)
        row2 = VGroup(zh_e, eq_e).arrange(RIGHT, buff=0.2).next_to(row1, DOWN, buff=0.38)
        self.play(FadeIn(zh_e))
        self.play(Write(eq_e))
        self.wait(1.0)

        # 统一为 MeV
        zh_mev = Text("换算为 MeV：", font=CJK, color=WHITE).scale(0.48)
        eq_mev = MathTex(
            r"\Delta E = 931.5 \times \left[Z m_p + (A-Z)m_n - m_{\rm nuc}\right]\;(\mathrm{MeV})"
        ).scale(0.68)
        eq_mev.set_color(YELLOW)
        row3 = VGroup(zh_mev, eq_mev).arrange(RIGHT, buff=0.2).next_to(row2, DOWN, buff=0.38)
        row3.scale_to_fit_width(13)
        self.play(FadeIn(zh_mev))
        self.play(Write(eq_mev))
        self.wait(1.0)

        # 比结合能
        zh_eps = Text("比结合能：", font=CJK, color=WHITE).scale(0.48)
        eq_eps = MathTex(r"\varepsilon = \frac{\Delta E}{A}").scale(0.78)
        eq_eps.set_color(CYAN)
        row4 = VGroup(zh_eps, eq_eps).arrange(RIGHT, buff=0.2).next_to(row3, DOWN, buff=0.38)
        self.play(FadeIn(zh_eps))
        self.play(Write(eq_eps))
        self.wait(1.5)

        deriv_group = VGroup(deriv_label, row1, row2, row3, row4)
        self.play(FadeOut(deriv_group))

        # ══════════════════════════════════════════════════════════════
        # Step 5: 能量柱状图 — 核子质量之和 vs 核质量（差值 = 结合能）
        # ══════════════════════════════════════════════════════════════
        bar_label = Text("能量柱状图：质量亏损 = 结合能", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(bar_label))

        # ── 坐标系 ─────────────────────────────────────────────────
        axes_orig = Axes(
            x_range=[0, 5, 1],
            y_range=[0, 35, 5],
            x_length=9,
            y_length=4.5,
            axis_config={"color": WHITE, "include_tip": False},
            y_axis_config={"include_numbers": False},
        ).next_to(bar_label, DOWN, buff=0.35).shift(LEFT * 0.5)

        y_label = VGroup(
            Text("能量", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"(\mathrm{MeV})").scale(0.38)
        ).arrange(DOWN, buff=0.08).next_to(axes_orig.y_axis, LEFT, buff=0.15)

        self.play(Create(axes_orig), FadeIn(y_label))

        # ── 比例：1 MeV ↔ 多少像素高（用 y_range [0,35], y_length=4.5）
        def mev_to_height(mev):
            return mev / 35 * 4.5

        bar_w = 0.65   # 柱宽

        # 原点的坐标系位置
        origin = axes_orig.c2p(0, 0)

        def make_bar(x_pos_axes, height_mev, color, alpha=0.85):
            """在 x_pos_axes 坐标处画一根高度为 height_mev 的矩形柱"""
            x = axes_orig.c2p(x_pos_axes, 0)[0]
            y0 = origin[1]
            h = mev_to_height(height_mev)
            bar = Rectangle(
                width=bar_w, height=h,
                fill_color=color, fill_opacity=alpha,
                stroke_color=WHITE, stroke_width=1
            )
            bar.move_to([x, y0 + h / 2, 0])
            return bar

        # ── 氘核：核子质量之和（归一到约比核质量高 2.22 MeV）─────────
        # 用相对量可视化：把核质量定为 0 基准，核子质量之和高 ΔE
        # 实际上我们画两根柱：①"核子质量之和" 柱（更高），②"核质量" 柱（较矮）
        # 差值区域橙色高亮
        # 为了让两核对比明显，氘核区域在 x=0.8~1.8，氦核在 x=2.8~3.8

        # 氘核 — 核质量柱（蓝色，高度 = 1 刻度单位，仅作比例基准）
        # 我们取"核质量"对应高度 = A×1=2（象征性）；"核子质量之和" 多 ΔE
        BASE_D = 2.22 * 4    # 让差值看起来清楚，核质量基准高度 = 基准 + 结合能
        BASE_H = 28.30 * 1.2

        d_nuc_h = BASE_D          # 核质量柱高度(相对量,MeV刻度)
        d_sum_h = BASE_D + DE_DEUTERIUM   # 核子之和柱
        h_nuc_h = BASE_H
        h_sum_h = BASE_H + DE_HELIUM

        # 氘核
        D_X_SUM = 1.0
        D_X_NUC = 1.8
        d_bar_sum = make_bar(D_X_SUM, d_sum_h, BLUE)
        d_bar_nuc = make_bar(D_X_NUC, d_nuc_h, BLUE_D)
        # 差值区域（橙色覆盖在 d_bar_sum 顶部）
        x_ds = axes_orig.c2p(D_X_SUM, 0)[0]
        delta_d_rect = Rectangle(
            width=bar_w, height=mev_to_height(DE_DEUTERIUM),
            fill_color=ORANGE, fill_opacity=0.9,
            stroke_color=ORANGE, stroke_width=1
        )
        delta_d_rect.move_to([x_ds, origin[1] + mev_to_height(d_nuc_h) + mev_to_height(DE_DEUTERIUM) / 2, 0])

        # 氦核
        H_X_SUM = 3.0
        H_X_NUC = 3.8
        h_bar_sum = make_bar(H_X_SUM, h_sum_h, GREEN_C)
        h_bar_nuc = make_bar(H_X_NUC, h_nuc_h, GREEN_E)
        x_hs = axes_orig.c2p(H_X_SUM, 0)[0]
        delta_h_rect = Rectangle(
            width=bar_w, height=mev_to_height(DE_HELIUM),
            fill_color=ORANGE, fill_opacity=0.9,
            stroke_color=ORANGE, stroke_width=1
        )
        delta_h_rect.move_to([x_hs, origin[1] + mev_to_height(h_nuc_h) + mev_to_height(DE_HELIUM) / 2, 0])

        # 柱标签
        def bar_xlabel(text_str, x_pos_axes, y_offset=-0.35):
            return Text(text_str, font=CJK, color=WHITE).scale(0.32).move_to(
                axes_orig.c2p(x_pos_axes, 0) + DOWN * abs(y_offset)
            )

        lbl_d_sum = bar_xlabel("核子之和", D_X_SUM, -0.42)
        lbl_d_nuc = bar_xlabel("核质量", D_X_NUC, -0.42)
        lbl_h_sum = bar_xlabel("核子之和", H_X_SUM, -0.42)
        lbl_h_nuc = bar_xlabel("核质量", H_X_NUC, -0.42)

        # Δm 标注
        dm_d_label = MathTex(r"\Delta E=2.22\,\mathrm{MeV}", color=ORANGE).scale(0.42)
        dm_d_label.next_to(delta_d_rect, RIGHT, buff=0.1)
        dm_h_label = MathTex(r"\Delta E=28.30\,\mathrm{MeV}", color=ORANGE).scale(0.42)
        dm_h_label.next_to(delta_h_rect, RIGHT, buff=0.1)

        # 核素标签（顶部）
        nuc_d_top = MathTex(r"{}^{2}_{1}\mathrm{H}", color=BLUE).scale(0.58)
        nuc_d_top.move_to([(axes_orig.c2p(D_X_SUM, 0)[0] + axes_orig.c2p(D_X_NUC, 0)[0]) / 2,
                            axes_orig.c2p(0, d_sum_h)[1] + 0.25, 0])
        nuc_h_top = MathTex(r"{}^{4}_{2}\mathrm{He}", color=GREEN).scale(0.58)
        nuc_h_top.move_to([(axes_orig.c2p(H_X_SUM, 0)[0] + axes_orig.c2p(H_X_NUC, 0)[0]) / 2,
                            axes_orig.c2p(0, h_sum_h)[1] + 0.25, 0])

        # 渲染动画
        self.play(GrowFromEdge(d_bar_sum, DOWN), GrowFromEdge(d_bar_nuc, DOWN))
        self.play(FadeIn(lbl_d_sum), FadeIn(lbl_d_nuc), Write(nuc_d_top))
        self.wait(0.5)
        self.play(FadeIn(delta_d_rect), Write(dm_d_label))
        self.wait(0.8)
        self.play(GrowFromEdge(h_bar_sum, DOWN), GrowFromEdge(h_bar_nuc, DOWN))
        self.play(FadeIn(lbl_h_sum), FadeIn(lbl_h_nuc), Write(nuc_h_top))
        self.wait(0.5)
        self.play(FadeIn(delta_h_rect), Write(dm_h_label))
        self.wait(1.5)

        bar_group = VGroup(
            bar_label, axes_orig, y_label,
            d_bar_sum, d_bar_nuc, delta_d_rect,
            h_bar_sum, h_bar_nuc, delta_h_rect,
            lbl_d_sum, lbl_d_nuc, lbl_h_sum, lbl_h_nuc,
            dm_d_label, dm_h_label, nuc_d_top, nuc_h_top
        )
        self.play(FadeOut(bar_group))

        # ══════════════════════════════════════════════════════════════
        # Step 6: 折叠除法动画 — 比结合能 ε = ΔE/A
        # ══════════════════════════════════════════════════════════════
        eps_label = Text("比结合能：将结合能平均分配给每个核子", font=CJK, color=BLUE).scale(0.48)
        eps_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(eps_label))

        eps_formula = MathTex(r"\varepsilon = \frac{\Delta E}{A}", color=CYAN).scale(0.9)
        eps_formula.next_to(eps_label, DOWN, buff=0.35)
        self.play(Write(eps_formula))
        self.wait(1.0)

        # ── 氘核：ΔE 柱被等分为 A=2 段 ─────────────────────────────
        # 视觉：画一根代表 ΔE 的柱，再用水平线把它切成 A 份

        # 比例因子：1 MeV → 0.35 高度单位（纯可视化用）
        SCALE = 0.25

        def eps_bar(height_mev, x_center, color, width=0.9):
            h = height_mev * SCALE
            b = Rectangle(width=width, height=h,
                           fill_color=color, fill_opacity=0.85,
                           stroke_color=WHITE, stroke_width=1.5)
            b.move_to([x_center, -1.2 + h / 2, 0])
            return b

        def split_lines(height_mev, A, x_center, width=0.9):
            """在柱内画 A-1 条水平分割线"""
            lines = VGroup()
            h = height_mev * SCALE
            seg_h = h / A
            x0 = x_center - width / 2
            x1 = x_center + width / 2
            for i in range(1, A):
                y = -1.2 + seg_h * i
                lines.add(DashedLine([x0, y, 0], [x1, y, 0], color=WHITE, stroke_width=1.5))
            return lines

        # 氘核柱
        dx = -3.0
        d_eps_bar = eps_bar(DE_DEUTERIUM, dx, BLUE)
        d_A_label = VGroup(
            Text("A=2", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta E=2.22\,\mathrm{MeV}", color=YELLOW).scale(0.42)
        ).arrange(DOWN, buff=0.12).next_to(d_eps_bar, LEFT, buff=0.22)
        d_split = split_lines(DE_DEUTERIUM, A_DEUTERIUM, dx)

        # 氘核 ε 标注
        d_eps_value = VGroup(
            Text("比结合能", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\varepsilon = \frac{2.22}{2} = 1.11\,\mathrm{MeV/nucleon}", color=GREEN).scale(0.52)
        ).arrange(DOWN, buff=0.1).next_to(d_eps_bar, DOWN, buff=0.28)
        d_eps_value.scale_to_fit_width(4.5)

        d_nuc_lbl = MathTex(r"{}^{2}_{1}\mathrm{H}", color=BLUE).scale(0.65)
        d_nuc_lbl.next_to(d_eps_bar, UP, buff=0.18)

        # 氦核柱
        hx = 2.5
        he_bar_h = DE_HELIUM * SCALE
        h_eps_bar = eps_bar(DE_HELIUM, hx, GREEN_C)
        h_A_label = VGroup(
            Text("A=4", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta E=28.30\,\mathrm{MeV}", color=YELLOW).scale(0.42)
        ).arrange(DOWN, buff=0.12).next_to(h_eps_bar, LEFT, buff=0.22)
        h_split = split_lines(DE_HELIUM, A_HELIUM, hx)

        h_eps_value = VGroup(
            Text("比结合能", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\varepsilon = \frac{28.30}{4} = 7.07\,\mathrm{MeV/nucleon}", color=GREEN).scale(0.52)
        ).arrange(DOWN, buff=0.1).next_to(h_eps_bar, DOWN, buff=0.28)
        h_eps_value.scale_to_fit_width(4.5)

        h_nuc_lbl = MathTex(r"{}^{4}_{2}\mathrm{He}", color=GREEN).scale(0.65)
        h_nuc_lbl.next_to(h_eps_bar, UP, buff=0.18)

        # 氘核动画
        self.play(GrowFromEdge(d_eps_bar, DOWN), FadeIn(d_nuc_lbl))
        self.play(FadeIn(d_A_label))
        self.wait(0.5)
        self.play(Create(d_split))
        self.play(FadeIn(d_eps_value))
        self.wait(0.8)

        # 氦核动画
        self.play(GrowFromEdge(h_eps_bar, DOWN), FadeIn(h_nuc_lbl))
        self.play(FadeIn(h_A_label))
        self.wait(0.5)
        self.play(Create(h_split))
        self.play(FadeIn(h_eps_value))
        self.wait(1.5)

        # ── Step 7: 两根 ε 柱并排比较，标注结论 ─────────────────────
        # ε 比较柱（独立绘制，更直观）
        eps_compare_label = Text("比结合能对比（直观）", font=CJK, color=BLUE).scale(0.42)
        eps_compare_label.next_to(eps_label, RIGHT, buff=1.2)

        # 用 ValueTracker 让对比柱动态出现
        EPS_SCALE = 0.45   # 1 MeV/nucleon → 0.45 高度

        # 氘核 ε 柱
        d_eps_comp = Rectangle(
            width=0.7, height=EPS_DEUTERIUM * EPS_SCALE,
            fill_color=BLUE, fill_opacity=0.9, stroke_color=WHITE, stroke_width=1
        ).move_to([-0.5, -0.6 + EPS_DEUTERIUM * EPS_SCALE / 2, 0])
        d_eps_comp_lbl = MathTex(r"1.11", color=BLUE).scale(0.55)
        d_eps_comp_lbl.next_to(d_eps_comp, UP, buff=0.1)
        d_eps_comp_nuc = MathTex(r"{}^{2}\mathrm{H}", color=BLUE).scale(0.5)
        d_eps_comp_nuc.next_to(d_eps_comp, DOWN, buff=0.08)

        # 氦核 ε 柱
        h_eps_comp = Rectangle(
            width=0.7, height=EPS_HELIUM * EPS_SCALE,
            fill_color=GREEN, fill_opacity=0.9, stroke_color=WHITE, stroke_width=1
        ).move_to([0.7, -0.6 + EPS_HELIUM * EPS_SCALE / 2, 0])
        h_eps_comp_lbl = MathTex(r"7.07", color=GREEN).scale(0.55)
        h_eps_comp_lbl.next_to(h_eps_comp, UP, buff=0.1)
        h_eps_comp_nuc = MathTex(r"{}^{4}\mathrm{He}", color=GREEN).scale(0.5)
        h_eps_comp_nuc.next_to(h_eps_comp, DOWN, buff=0.08)

        eps_unit = MathTex(r"(\mathrm{MeV/nucleon})", color=WHITE).scale(0.40)
        eps_unit.move_to([0.1, -0.6 - 0.45, 0])

        stable_zh = Text("⁴He 远比 ²H 稳定", font=CJK, color=YELLOW).scale(0.52)
        stable_zh.move_to([0.1, -0.6 - 0.9, 0])
        stable_box = SurroundingRectangle(stable_zh, color=YELLOW, buff=0.15, corner_radius=0.1)

        comp_group = VGroup(
            d_eps_comp, d_eps_comp_lbl, d_eps_comp_nuc,
            h_eps_comp, h_eps_comp_lbl, h_eps_comp_nuc,
            eps_unit, stable_zh, stable_box
        )

        # 先淡出左右两侧的柱状图（折叠除法那部分）
        fold_group = VGroup(
            d_eps_bar, d_A_label, d_split, d_eps_value, d_nuc_lbl,
            h_eps_bar, h_A_label, h_split, h_eps_value, h_nuc_lbl
        )
        self.play(FadeOut(fold_group))
        self.play(FadeOut(eps_formula))

        self.play(GrowFromEdge(d_eps_comp, DOWN), GrowFromEdge(h_eps_comp, DOWN))
        self.play(FadeIn(d_eps_comp_lbl), FadeIn(d_eps_comp_nuc))
        self.play(FadeIn(h_eps_comp_lbl), FadeIn(h_eps_comp_nuc))
        self.play(FadeIn(eps_unit))
        self.wait(0.8)
        self.play(FadeIn(stable_zh), Create(stable_box))
        self.wait(1.5)

        comp_clean = VGroup(eps_label, comp_group)
        self.play(FadeOut(comp_clean))

        # ══════════════════════════════════════════════════════════════
        # Step 8: 数值例子——完整计算过程展示
        # ══════════════════════════════════════════════════════════════
        calc_label = Text("计算示例：氦核比结合能", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(calc_label))

        zh_given = Text("已知：质子质量", font=CJK, color=WHITE).scale(0.44)
        eq_mp = MathTex(r"m_p = 1.007276\,\mathrm{u}", color=WHITE).scale(0.68)
        line_mp = VGroup(zh_given, eq_mp).arrange(RIGHT, buff=0.2).next_to(calc_label, DOWN, buff=0.4)

        zh_mn = Text("中子质量", font=CJK, color=WHITE).scale(0.44)
        eq_mn = MathTex(r"m_n = 1.008665\,\mathrm{u}", color=WHITE).scale(0.68)
        line_mn = VGroup(zh_mn, eq_mn).arrange(RIGHT, buff=0.2).next_to(line_mp, DOWN, buff=0.22)

        zh_mhe = Text("氦核质量", font=CJK, color=WHITE).scale(0.44)
        eq_mhe = MathTex(r"m_{\rm He} = 4.001506\,\mathrm{u}", color=WHITE).scale(0.68)
        line_mhe = VGroup(zh_mhe, eq_mhe).arrange(RIGHT, buff=0.2).next_to(line_mn, DOWN, buff=0.22)

        self.play(FadeIn(line_mp))
        self.wait(0.4)
        self.play(FadeIn(line_mn))
        self.wait(0.4)
        self.play(FadeIn(line_mhe))
        self.wait(0.8)

        # 计算步骤
        zh_step1 = Text("质量亏损", font=CJK, color=ORANGE).scale(0.44)
        eq_step1 = MathTex(
            r"\Delta m = 2\times1.007276 + 2\times1.008665 - 4.001506 = 0.030376\,\mathrm{u}",
            color=ORANGE
        ).scale(0.58)
        line_step1 = VGroup(zh_step1, eq_step1).arrange(RIGHT, buff=0.18).next_to(line_mhe, DOWN, buff=0.32)
        line_step1.scale_to_fit_width(13)

        zh_step2 = Text("结合能", font=CJK, color=YELLOW).scale(0.44)
        eq_step2 = MathTex(
            r"\Delta E = 931.5 \times 0.030376 = 28.30\,\mathrm{MeV}",
            color=YELLOW
        ).scale(0.68)
        line_step2 = VGroup(zh_step2, eq_step2).arrange(RIGHT, buff=0.18).next_to(line_step1, DOWN, buff=0.22)

        zh_step3 = Text("比结合能", font=CJK, color=GREEN).scale(0.44)
        eq_step3 = MathTex(
            r"\varepsilon = \frac{28.30}{4} = 7.07\,\mathrm{MeV/nucleon}",
            color=GREEN
        ).scale(0.72)
        line_step3 = VGroup(zh_step3, eq_step3).arrange(RIGHT, buff=0.18).next_to(line_step2, DOWN, buff=0.22)

        self.play(FadeIn(line_step1))
        self.wait(0.8)
        self.play(FadeIn(line_step2))
        self.wait(0.8)
        self.play(FadeIn(line_step3))
        self.wait(1.5)

        calc_group = VGroup(
            calc_label, line_mp, line_mn, line_mhe,
            line_step1, line_step2, line_step3
        )
        self.play(FadeOut(calc_group))

        # ══════════════════════════════════════════════════════════════
        # Step 9: 小结卡 — 关键公式汇总 + 方框
        # ══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1_zh = Text("质量亏损", font=CJK, color=WHITE).scale(0.44)
        s1_eq = MathTex(r"\Delta m = Zm_p + (A-Z)m_n - m_{\rm nuc}", color=YELLOW).scale(0.72)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.2)

        s2_zh = Text("结合能", font=CJK, color=WHITE).scale(0.44)
        s2_eq = MathTex(r"\Delta E = 931.5\,\Delta m\;(\mathrm{MeV})", color=YELLOW).scale(0.72)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.2)

        s3_zh = Text("比结合能", font=CJK, color=WHITE).scale(0.44)
        s3_eq = MathTex(r"\varepsilon = \frac{\Delta E}{A}", color=CYAN).scale(0.80)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.2)

        s4_zh = Text("氘核结果", font=CJK, color=WHITE).scale(0.40)
        s4_eq = MathTex(r"\Delta E=2.22\,\mathrm{MeV},\;\varepsilon=1.11\,\mathrm{MeV/nucleon}", color=BLUE).scale(0.60)
        s4 = VGroup(s4_zh, s4_eq).arrange(RIGHT, buff=0.2)

        s5_zh = Text("氦核结果", font=CJK, color=WHITE).scale(0.40)
        s5_eq = MathTex(r"\Delta E=28.30\,\mathrm{MeV},\;\varepsilon=7.07\,\mathrm{MeV/nucleon}", color=GREEN).scale(0.60)
        s5 = VGroup(s5_zh, s5_eq).arrange(RIGHT, buff=0.2)

        s_conc = Text("⁴He 比结合能约为 ²H 的 6.4 倍，核结合更稳定", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(s1, s2, s3, s4, s5, s_conc).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(13)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.4)
        self.play(FadeIn(s5))
        self.wait(0.4)
        self.play(FadeIn(s_conc), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch13Ex2DeuteriumHeliumBindingEnergy",
        "id": "phys-ch13-13.1-ex2-deuterium-helium-binding-energy",
        "chapterId": "ch13",
        "sectionId": "13.1",
        "title": "氘核与氦核结合能和比结合能",
        "description": "通过核结构示意图、能量柱状图和折叠除法动画，逐步推导并直观比较氘核（2.22 MeV/1.11 MeV per nucleon）与氦核（28.30 MeV/7.07 MeV per nucleon）的结合能和比结合能，揭示⁴He远比²H稳定的物理本质。",
    }
]
