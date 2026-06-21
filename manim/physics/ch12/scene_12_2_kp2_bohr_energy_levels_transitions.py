"""第 12.2 节 · 玻尔能级图与谱线系跃迁

展示氢原子玻尔模型能级图，动画化演示莱曼系、巴尔末系、帕邢系三组跃迁，
并在右侧谱线条形图上同步高亮对应谱线。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数 ──────────────────────────────────────────────
R_INF = 1.097e7   # m^-1，里德伯常数
E_GROUND = -13.6  # eV

def energy(n):
    return E_GROUND / (n * n)

def wavelength_nm(n_i, n_f):
    """发射谱线波长（nm），n_i > n_f"""
    inv_lam = R_INF * (1.0 / (n_f * n_f) - 1.0 / (n_i * n_i))
    return 1e9 / inv_lam   # nm


class Ch12Kp2BohrEnergyLevelsTransitions(Scene):
    def construct(self):

        # ════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ════════════════════════════════════════════════════════════
        title = Text("玻尔能级图与谱线系跃迁", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第十二章 量子力学初步 · 12.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ════════════════════════════════════════════════════════════
        ana1 = Text("氢原子就像一栋能量楼梯：", font=CJK).scale(0.48)
        ana2 = Text("电子只能站在特定的楼层（能级），", font=CJK).scale(0.48)
        ana3 = Text("从高楼层跳到低楼层时，释放出一份光子——谱线由此诞生。", font=CJK).scale(0.48)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.5)
        analogy.scale_to_fit_width(11.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ════════════════════════════════════════════════════════════
        # Step 3: 核心公式（逐步）
        # ════════════════════════════════════════════════════════════
        lbl_en = Text("玻尔能级公式：", font=CJK, color=WHITE).scale(0.46)
        f_en = MathTex(r"E_n = -\frac{13.6\,\mathrm{eV}}{n^2}", color=YELLOW).scale(0.9)
        row1 = VGroup(lbl_en, f_en).arrange(RIGHT, buff=0.3)
        row1.next_to(title, DOWN, buff=0.55)

        lbl_ph = Text("跃迁光子能量：", font=CJK, color=WHITE).scale(0.46)
        f_ph = MathTex(r"h\nu = E_{n_i} - E_{n_f}", color=CYAN).scale(0.9)
        row2 = VGroup(lbl_ph, f_ph).arrange(RIGHT, buff=0.3)
        row2.next_to(row1, DOWN, buff=0.35)

        lbl_ryd = Text("里德伯公式：", font=CJK, color=WHITE).scale(0.46)
        f_ryd = MathTex(
            r"\frac{1}{\lambda}=R_{\infty}"
            r"\!\left(\frac{1}{k^2}-\frac{1}{n^2}\right)",
            color=GREEN
        ).scale(0.85)
        row3 = VGroup(lbl_ryd, f_ryd).arrange(RIGHT, buff=0.3)
        row3.next_to(row2, DOWN, buff=0.35)

        r_val = MathTex(r"R_{\infty}\approx1.097\times10^7\,\mathrm{m}^{-1}", color=GREEN).scale(0.7)
        r_val.next_to(row3, DOWN, buff=0.2)
        r_val.align_to(f_ryd, LEFT)

        self.play(FadeIn(row1))
        self.wait(0.9)
        self.play(FadeIn(row2))
        self.wait(0.9)
        self.play(FadeIn(row3), FadeIn(r_val))
        self.wait(1.5)
        self.play(FadeOut(VGroup(row1, row2, row3, r_val)))

        # ════════════════════════════════════════════════════════════
        # Step 4: 竖向能级图（n=1~6）
        # ════════════════════════════════════════════════════════════
        # 布局：能级图占左侧，右侧留给谱线图
        # y 坐标映射：E_n 范围 -13.6 eV (n=1) ~ -0.38 eV (n=6)
        # 映射到 y = -3.2 ~ +2.5

        Y_BOTTOM = -3.2
        Y_TOP = 2.5
        E_MIN = energy(1)   # -13.6
        E_MAX = energy(6)   # -0.378

        def e_to_y(e_val):
            # linear map [E_MIN, E_MAX] -> [Y_BOTTOM, Y_TOP]
            return Y_BOTTOM + (e_val - E_MIN) / (E_MAX - E_MIN) * (Y_TOP - Y_BOTTOM)

        LEVEL_X_LEFT  = -6.2
        LEVEL_X_RIGHT = -1.5
        LEVEL_MID_X   = (LEVEL_X_LEFT + LEVEL_X_RIGHT) / 2

        level_lines = VGroup()
        level_labels_n = VGroup()
        level_labels_e = VGroup()

        for n in range(1, 7):
            e_n = energy(n)
            y_n = e_to_y(e_n)
            line = Line(
                start=[LEVEL_X_LEFT, y_n, 0],
                end=[LEVEL_X_RIGHT, y_n, 0],
                color=WHITE, stroke_width=2.0
            )
            level_lines.add(line)

            # n 标签（左侧）
            lbl_n = MathTex(rf"n={n}", color=CYAN).scale(0.45)
            lbl_n.next_to(line, LEFT, buff=0.12)
            level_labels_n.add(lbl_n)

            # 能量数值（右侧）
            e_str = f"{e_n:.2f}"
            lbl_e = MathTex(rf"E_{{{n}}}={e_str}\,\mathrm{{eV}}", color=YELLOW).scale(0.38)
            lbl_e.next_to(line, RIGHT, buff=0.12)
            level_labels_e.add(lbl_e)

        # 电离能虚线
        e_inf = energy(100)   # ≈ 0
        y_inf = e_to_y(0.0)
        ionize_line = DashedLine(
            start=[LEVEL_X_LEFT, y_inf, 0],
            end=[LEVEL_X_RIGHT, y_inf, 0],
            color=GRAY, stroke_width=1.5, dash_length=0.12
        )
        lbl_inf = MathTex(r"E=0\ (\text{ionized})", color=GRAY).scale(0.35)
        lbl_inf.next_to(ionize_line, RIGHT, buff=0.12)

        energy_diagram = VGroup(level_lines, level_labels_n, level_labels_e,
                                ionize_line, lbl_inf)

        sec_title = Text("氢原子能级图", font=CJK, color=BLUE).scale(0.52)
        sec_title.next_to(title, DOWN, buff=0.4)

        self.play(FadeIn(sec_title))
        self.play(Create(level_lines), run_time=1.5)
        self.play(
            LaggedStart(*[FadeIn(l) for l in level_labels_n], lag_ratio=0.15),
            LaggedStart(*[FadeIn(l) for l in level_labels_e], lag_ratio=0.15),
            run_time=1.5
        )
        self.play(Create(ionize_line), FadeIn(lbl_inf))
        self.wait(1.2)

        # ════════════════════════════════════════════════════════════
        # 右侧谱线条形图区域预备
        # ════════════════════════════════════════════════════════════
        SPEC_X = 1.5    # 条形图左边界 x
        SPEC_W = 4.8    # 宽度（波长轴）
        SPEC_Y_LYM = 1.8   # 莱曼系 y
        SPEC_Y_BAL = 0.4   # 巴尔末系 y
        SPEC_Y_PAS = -0.9  # 帕邢系 y
        SPEC_BAR_H = 0.22  # 谱线高度

        # 波长范围（nm）
        LAM_MIN = 90
        LAM_MAX = 2000

        def lam_to_x(lam_nm):
            frac = (lam_nm - LAM_MIN) / (LAM_MAX - LAM_MIN)
            return SPEC_X + frac * SPEC_W

        # 波长轴背景
        spec_axis = Line(
            [SPEC_X, SPEC_Y_PAS - 0.5, 0],
            [SPEC_X + SPEC_W, SPEC_Y_PAS - 0.5, 0],
            color=GRAY, stroke_width=1.5
        )
        # 刻度标签
        tick_vals = [200, 400, 600, 800, 1000, 1500, 2000]
        tick_group = VGroup()
        for tv in tick_vals:
            tx = lam_to_x(tv)
            tick_line = Line([tx, SPEC_Y_PAS - 0.55, 0],
                             [tx, SPEC_Y_PAS - 0.45, 0], color=GRAY, stroke_width=1.0)
            tick_lbl = MathTex(rf"{tv}", color=GRAY).scale(0.28)
            tick_lbl.move_to([tx, SPEC_Y_PAS - 0.72, 0])
            tick_group.add(tick_line, tick_lbl)
        nm_label = VGroup(
            Text("nm", font=CJK, color=GRAY).scale(0.3)
        ).move_to([SPEC_X + SPEC_W + 0.35, SPEC_Y_PAS - 0.5, 0])

        # 谱系标签
        lbl_lyman  = Text("莱曼系 (UV)", font=CJK, color=PURPLE).scale(0.38)
        lbl_balmer = Text("巴尔末系 (可见光)", font=CJK, color=GREEN).scale(0.38)
        lbl_paschen = Text("帕邢系 (IR)", font=CJK, color=DARK_BROWN).scale(0.38)
        lbl_lyman.move_to([SPEC_X - 1.0, SPEC_Y_LYM, 0])
        lbl_balmer.move_to([SPEC_X - 1.0, SPEC_Y_BAL, 0])
        lbl_paschen.move_to([SPEC_X - 1.0, SPEC_Y_PAS, 0])

        spec_bg = VGroup(spec_axis, tick_group, nm_label,
                         lbl_lyman, lbl_balmer, lbl_paschen)

        self.play(FadeIn(spec_bg))
        self.wait(0.8)

        # ════════════════════════════════════════════════════════════
        # 辅助：在能级图上画跃迁箭头
        # ════════════════════════════════════════════════════════════
        def make_transition_arrow(n_i, n_f, color, x_offset=0):
            y_i = e_to_y(energy(n_i))
            y_f = e_to_y(energy(n_f))
            x = LEVEL_MID_X + x_offset
            arr = Arrow(
                start=[x, y_i, 0],
                end=[x, y_f, 0],
                buff=0.05,
                color=color,
                stroke_width=3,
                max_tip_length_to_length_ratio=0.18
            )
            return arr

        def make_spec_bar(lam_nm, color, y_center):
            x = lam_to_x(lam_nm)
            bar = Rectangle(
                width=0.06, height=SPEC_BAR_H,
                fill_color=color, fill_opacity=0.9,
                stroke_width=0
            ).move_to([x, y_center, 0])
            return bar

        # ════════════════════════════════════════════════════════════
        # Step 5: 莱曼系  n=2,3,4 → 1  (紫外，紫色)
        # ════════════════════════════════════════════════════════════
        lyman_note = Text("莱曼系：跃迁到 n=1，发射紫外光子", font=CJK, color=PURPLE).scale(0.42)
        lyman_note.next_to(title, DOWN, buff=0.4)
        lyman_note.align_to(sec_title, LEFT)

        # 替换 sec_title
        self.play(ReplacementTransform(sec_title, lyman_note))
        self.wait(0.5)

        lyman_transitions = [(2, 1), (3, 1), (4, 1)]
        lyman_x_offsets  = [-0.45, 0.0, 0.45]
        lyman_arrows = VGroup()
        lyman_bars   = VGroup()
        lyman_lam_labels = VGroup()

        PURPLE_COL = "#9933FF"

        for (n_i, n_f), xoff in zip(lyman_transitions, lyman_x_offsets):
            lam = wavelength_nm(n_i, n_f)
            arr = make_transition_arrow(n_i, n_f, PURPLE_COL, x_offset=xoff)
            bar = make_spec_bar(lam, PURPLE_COL, SPEC_Y_LYM)
            lam_lbl = MathTex(rf"{lam:.0f}\,\mathrm{{nm}}", color=PURPLE_COL).scale(0.32)
            lam_lbl.move_to([lam_to_x(lam), SPEC_Y_LYM + SPEC_BAR_H * 0.8, 0])

            self.play(GrowArrow(arr), run_time=0.8)
            self.play(FadeIn(bar), FadeIn(lam_lbl), run_time=0.5)
            lyman_arrows.add(arr)
            lyman_bars.add(bar)
            lyman_lam_labels.add(lam_lbl)
            self.wait(0.4)

        uv_note = VGroup(
            Text("波长 < 400 nm", font=CJK, color=PURPLE_COL).scale(0.38),
            Text("肉眼不可见（紫外）", font=CJK, color=PURPLE_COL).scale(0.38)
        ).arrange(RIGHT, buff=0.3)
        uv_note.next_to(lyman_note, DOWN, buff=0.22)
        self.play(FadeIn(uv_note))
        self.wait(1.5)

        # ════════════════════════════════════════════════════════════
        # Step 6: 巴尔末系  n=3,4,5 → 2  (可见光，彩色)
        # ════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(uv_note, lyman_note)))

        balmer_note = Text("巴尔末系：跃迁到 n=2，发射可见光", font=CJK, color=GREEN).scale(0.42)
        balmer_note.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(balmer_note))
        self.wait(0.5)

        balmer_transitions = [(3, 2), (4, 2), (5, 2)]
        balmer_colors      = [RED, GREEN, BLUE]      # H_alpha, H_beta, H_gamma
        balmer_line_names  = ["H_\\alpha", "H_\\beta", "H_\\gamma"]
        balmer_x_offsets   = [-0.45, 0.0, 0.45]

        balmer_arrows = VGroup()
        balmer_bars   = VGroup()
        balmer_lam_labels = VGroup()

        for (n_i, n_f), col, name, xoff in zip(
                balmer_transitions, balmer_colors, balmer_line_names, balmer_x_offsets):
            lam = wavelength_nm(n_i, n_f)
            arr = make_transition_arrow(n_i, n_f, col, x_offset=xoff)
            bar = make_spec_bar(lam, col, SPEC_Y_BAL)
            lam_lbl = MathTex(rf"{lam:.0f}\,\mathrm{{nm}}", color=col).scale(0.32)
            lam_lbl.move_to([lam_to_x(lam), SPEC_Y_BAL + SPEC_BAR_H * 0.8, 0])

            self.play(GrowArrow(arr), run_time=0.8)
            self.play(FadeIn(bar), FadeIn(lam_lbl), run_time=0.5)
            balmer_arrows.add(arr)
            balmer_bars.add(bar)
            balmer_lam_labels.add(lam_lbl)
            self.wait(0.4)

        vis_note = VGroup(
            Text("400~700 nm", font=CJK, color=GREEN).scale(0.38),
            Text("可见光：彩虹色谱线", font=CJK, color=GREEN).scale(0.38)
        ).arrange(RIGHT, buff=0.3)
        vis_note.next_to(balmer_note, DOWN, buff=0.22)
        self.play(FadeIn(vis_note))
        self.wait(1.5)

        # ════════════════════════════════════════════════════════════
        # Step 7: 帕邢系  n=4,5,6 → 3  (红外)
        # ════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(vis_note, balmer_note)))

        paschen_note = Text("帕邢系：跃迁到 n=3，发射红外光子", font=CJK, color=RED).scale(0.42)
        paschen_note.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(paschen_note))
        self.wait(0.5)

        DARK_RED = "#CC2200"
        paschen_transitions = [(4, 3), (5, 3), (6, 3)]
        paschen_x_offsets   = [-0.45, 0.0, 0.45]

        paschen_arrows = VGroup()
        paschen_bars   = VGroup()
        paschen_lam_labels = VGroup()

        for (n_i, n_f), xoff in zip(paschen_transitions, paschen_x_offsets):
            lam = wavelength_nm(n_i, n_f)
            arr = make_transition_arrow(n_i, n_f, DARK_RED, x_offset=xoff)
            bar = make_spec_bar(lam, DARK_RED, SPEC_Y_PAS)
            lam_lbl = MathTex(rf"{lam:.0f}\,\mathrm{{nm}}", color=DARK_RED).scale(0.32)
            lam_lbl.move_to([lam_to_x(lam), SPEC_Y_PAS + SPEC_BAR_H * 0.8, 0])

            self.play(GrowArrow(arr), run_time=0.8)
            self.play(FadeIn(bar), FadeIn(lam_lbl), run_time=0.5)
            paschen_arrows.add(arr)
            paschen_bars.add(bar)
            paschen_lam_labels.add(lam_lbl)
            self.wait(0.4)

        ir_note = VGroup(
            Text("> 820 nm", font=CJK, color=DARK_RED).scale(0.38),
            Text("红外，肉眼不可见", font=CJK, color=DARK_RED).scale(0.38)
        ).arrange(RIGHT, buff=0.3)
        ir_note.next_to(paschen_note, DOWN, buff=0.22)
        self.play(FadeIn(ir_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ir_note, paschen_note)))

        # ════════════════════════════════════════════════════════════
        # Step 8: ValueTracker — 交互式波长计算演示
        # ════════════════════════════════════════════════════════════
        tracker_title = Text("里德伯公式：动态计算波长", font=CJK, color=BLUE).scale(0.48)
        tracker_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(tracker_title))

        ni_tracker = ValueTracker(5)
        nf_tracker = ValueTracker(2)

        def make_readout():
            n_i = round(ni_tracker.get_value())
            n_f = round(nf_tracker.get_value())
            lam = wavelength_nm(n_i, n_f)
            return VGroup(
                VGroup(
                    Text("初态", font=CJK, color=WHITE).scale(0.4),
                    MathTex(rf"n_i = {n_i}", color=YELLOW).scale(0.6)
                ).arrange(RIGHT, buff=0.15),
                VGroup(
                    Text("末态", font=CJK, color=WHITE).scale(0.4),
                    MathTex(rf"n_f = {n_f}", color=CYAN).scale(0.6)
                ).arrange(RIGHT, buff=0.15),
                VGroup(
                    Text("波长", font=CJK, color=WHITE).scale(0.4),
                    MathTex(rf"\lambda = {lam:.1f}\,\mathrm{{nm}}", color=GREEN).scale(0.6)
                ).arrange(RIGHT, buff=0.15),
            ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).to_corner(UR, buff=0.5)

        readout = always_redraw(make_readout)
        self.add(readout)

        # 先演示 n=5→2（绿色，巴尔末 H_beta）
        hi_arrow = always_redraw(lambda: make_transition_arrow(
            round(ni_tracker.get_value()),
            round(nf_tracker.get_value()),
            YELLOW, x_offset=0.7
        ))
        self.add(hi_arrow)
        self.wait(1.0)

        # 扫过 n_i: 5→3→4
        self.play(ni_tracker.animate.set_value(3), run_time=1.8)
        self.wait(0.8)
        self.play(ni_tracker.animate.set_value(4), run_time=1.2)
        self.wait(0.8)
        # 切换到莱曼系
        self.play(nf_tracker.animate.set_value(1), run_time=1.0)
        self.play(ni_tracker.animate.set_value(3), run_time=1.2)
        self.wait(0.8)
        # 切换到帕邢系
        self.play(nf_tracker.animate.set_value(3), ni_tracker.animate.set_value(6), run_time=1.5)
        self.wait(1.2)

        self.remove(hi_arrow, readout)
        self.play(FadeOut(tracker_title))

        # ════════════════════════════════════════════════════════════
        # Step 9: 三组谱系全景汇总动画（高亮闪烁）
        # ════════════════════════════════════════════════════════════
        summary_title = Text("三大谱线系对比总览", font=CJK, color=BLUE).scale(0.5)
        summary_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(summary_title))
        self.wait(0.6)

        # 依次闪烁高亮三组
        self.play(
            *[arr.animate.set_color(PURPLE_COL) for arr in lyman_arrows],
            *[bar.animate.set_fill(PURPLE_COL, opacity=1.0) for bar in lyman_bars],
            run_time=0.7
        )
        lym_label = Text("莱曼系：紫外", font=CJK, color=PURPLE_COL).scale(0.4).to_corner(UR, buff=0.5)
        self.play(FadeIn(lym_label))
        self.wait(0.8)
        self.play(FadeOut(lym_label))

        self.play(
            *[arr.animate.set_color(c) for arr, c in zip(balmer_arrows, balmer_colors)],
            run_time=0.7
        )
        bal_label = Text("巴尔末系：可见光", font=CJK, color=GREEN).scale(0.4).to_corner(UR, buff=0.5)
        self.play(FadeIn(bal_label))
        self.wait(0.8)
        self.play(FadeOut(bal_label))

        self.play(
            *[arr.animate.set_color(DARK_RED) for arr in paschen_arrows],
            run_time=0.7
        )
        pas_label = Text("帕邢系：红外", font=CJK, color=DARK_RED).scale(0.4).to_corner(UR, buff=0.5)
        self.play(FadeIn(pas_label))
        self.wait(0.8)
        self.play(FadeOut(pas_label))

        self.wait(0.8)

        # ════════════════════════════════════════════════════════════
        # Step 10: 清场 → 小结卡
        # ════════════════════════════════════════════════════════════
        all_diagram = VGroup(
            level_lines, level_labels_n, level_labels_e, ionize_line, lbl_inf,
            spec_bg,
            lyman_arrows, lyman_bars, lyman_lam_labels,
            balmer_arrows, balmer_bars, balmer_lam_labels,
            paschen_arrows, paschen_bars, paschen_lam_labels,
            summary_title
        )
        self.play(FadeOut(all_diagram), run_time=1.0)
        self.wait(0.3)

        # ── 小结卡 ────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = VGroup(
            Text("能级公式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"E_n = -\dfrac{13.6\,\mathrm{eV}}{n^2}", color=YELLOW).scale(0.8)
        ).arrange(RIGHT, buff=0.25)

        s2 = VGroup(
            Text("里德伯公式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(
                r"\dfrac{1}{\lambda}=R_{\infty}"
                r"\!\left(\dfrac{1}{k^2}-\dfrac{1}{n^2}\right)",
                color=GREEN
            ).scale(0.78)
        ).arrange(RIGHT, buff=0.25)

        s3_lym = VGroup(
            Text("莱曼系 (→n=1)：", font=CJK, color=PURPLE_COL).scale(0.42),
            Text("紫外，<400 nm", font=CJK, color=PURPLE_COL).scale(0.42)
        ).arrange(RIGHT, buff=0.25)

        s3_bal = VGroup(
            Text("巴尔末系 (→n=2)：", font=CJK, color=GREEN).scale(0.42),
            Text("可见光，400~700 nm", font=CJK, color=GREEN).scale(0.42)
        ).arrange(RIGHT, buff=0.25)

        s3_pas = VGroup(
            Text("帕邢系 (→n=3)：", font=CJK, color=DARK_RED).scale(0.42),
            Text("红外，>820 nm", font=CJK, color=DARK_RED).scale(0.42)
        ).arrange(RIGHT, buff=0.25)

        summary_group = VGroup(s1, s2, s3_lym, s3_bal, s3_pas).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT
        )
        summary_group.next_to(s_title, DOWN, buff=0.4)
        summary_group.scale_to_fit_width(11.0)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.wait(0.7)
        self.play(FadeIn(s2))
        self.wait(0.7)
        self.play(FadeIn(s3_lym), FadeIn(s3_bal), FadeIn(s3_pas))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch12Kp2BohrEnergyLevelsTransitions",
        "id": "phys-ch12-12.2-kp2-bohr-energy-levels-transitions",
        "chapterId": "ch12",
        "sectionId": "12.2",
        "title": "玻尔能级图与谱线系跃迁",
        "description": "动画化演示氢原子玻尔能级图，展示莱曼(紫外)、巴尔末(可见光)、帕邢(红外)三大谱线系的跃迁过程，并用里德伯公式动态计算对应波长。",
    }
]
