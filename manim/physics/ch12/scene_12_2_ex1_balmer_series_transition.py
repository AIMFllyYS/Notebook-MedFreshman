"""第 12.2 节 · 例题：巴尔末系谱线计算与能级跃迁识别

三步动画：
  (1) 能级图 + 巴尔末系 n→2 公式逐步代入，解出 n=5；
  (2) 能级图上高亮 n=5→2 跃迁箭头，标注光子能量 2.89 eV；
  (3) 可见光谱条，430 nm（紫蓝色）位置标出，与 H_α、H_β 对比。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数与颜色 ──────────────────────────────────────────────────────
# 里德伯常数 R = 1.097e7 m^-1，用于计算谱线
R_H = 1.097e7  # m^-1

# 可见光谱代表色（近似）
COLOR_656 = "#FF4444"   # H_alpha  656 nm  红
COLOR_486 = "#44AAFF"   # H_beta   486 nm  青蓝
COLOR_430 = "#7744FF"   # 本题     430 nm  紫蓝


class Ch12Ex1BalmerSeriesTransition(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("例：巴尔末系谱线计算与能级跃迁识别",
                     font=CJK, color=BLUE).scale(0.58).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.2",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比 —— 氢灯发光
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("霓虹灯里充的若是氢气，灯亮时会发出几条彩色谱线。", font=CJK).scale(0.46)
        a2 = Text("巴尔末（Balmer）发现：这些谱线波长满足一个简洁的规律，",
                  font=CJK).scale(0.46)
        a3 = Text("现在我们就用它来算一条波长 430 nm 的谱线来自哪个能级。",
                  font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 巴尔末公式引入（逐部分出现 + 高亮）
        # ══════════════════════════════════════════════════════════════════
        form_label = Text("巴尔末系公式", font=CJK, color=BLUE).scale(0.5)
        form_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(form_label))
        self.wait(0.4)

        # 公式分三段逐步出现
        f1 = MathTex(r"\frac{1}{\lambda}", color=WHITE).scale(0.95)
        f2 = MathTex(r"=\,R\!\left(\frac{1}{2^2} - \frac{1}{n^2}\right)",
                     color=YELLOW).scale(0.95)
        f3 = VGroup(
            Text("其中", font=CJK, color=WHITE).scale(0.4),
            MathTex(r"R = 1.097 \times 10^7\ \mathrm{m}^{-1}",
                    color=CYAN).scale(0.7),
        ).arrange(RIGHT, buff=0.18)

        formula_row = VGroup(f1, f2).arrange(RIGHT, buff=0.12)
        formula_row.next_to(form_label, DOWN, buff=0.45)
        f3.next_to(formula_row, DOWN, buff=0.35)

        self.play(Write(f1))
        self.wait(0.5)
        self.play(Write(f2))
        self.wait(0.8)
        self.play(FadeIn(f3))
        self.wait(1.4)

        note_balmer = Text("下标 2² = 4 → 终态 n=2；n=3,4,5,... 为初态",
                           font=CJK, color=GREEN).scale(0.42)
        note_balmer.next_to(f3, DOWN, buff=0.3)
        self.play(FadeIn(note_balmer))
        self.wait(1.4)
        self.play(FadeOut(VGroup(form_label, formula_row, f3, note_balmer)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 逐步代入 λ = 430 nm → 解 n
        # ══════════════════════════════════════════════════════════════════
        step_title = Text("代入已知量，逐步求解", font=CJK, color=BLUE).scale(0.5)
        step_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(step_title))
        self.wait(0.4)

        # 代入 λ = 430 nm = 4.30e-7 m
        s4a = MathTex(
            r"\frac{1}{\lambda}",
            r"=",
            r"R\!\left(\frac{1}{4} - \frac{1}{n^2}\right)"
        ).scale(0.82)
        s4a[0].set_color(YELLOW)
        s4a.next_to(step_title, DOWN, buff=0.45)
        self.play(Write(s4a))
        self.wait(0.9)

        # 代入 λ 数值（高亮）
        s4b = MathTex(
            r"\frac{1}{430 \times 10^{-9}}",
            r"=",
            r"1.097 \times 10^7\!\left(\frac{1}{4} - \frac{1}{n^2}\right)"
        ).scale(0.72)
        s4b[0].set_color(ORANGE)
        s4b[2].set_color(CYAN)
        s4b.next_to(s4a, DOWN, buff=0.38)
        self.play(Write(s4b))
        self.wait(1.0)

        # 化简左侧
        s4c = MathTex(
            r"2.326 \times 10^6",
            r"=",
            r"1.097 \times 10^7\!\left(\frac{1}{4} - \frac{1}{n^2}\right)"
        ).scale(0.72)
        s4c[0].set_color(ORANGE)
        s4c.next_to(s4b, DOWN, buff=0.35)
        self.play(TransformMatchingTex(s4b.copy(), s4c))
        self.wait(0.9)

        # 整理出 1/n²
        s4d = MathTex(
            r"\frac{1}{4} - \frac{1}{n^2}",
            r"=",
            r"0.2120",
            r"\implies",
            r"\frac{1}{n^2} = 0.04"
        ).scale(0.78)
        s4d[2].set_color(GREEN)
        s4d[4].set_color(YELLOW)
        s4d.next_to(s4c, DOWN, buff=0.35)
        self.play(Write(s4d))
        self.wait(1.0)

        # 得出 n = 5（大字高亮）
        s4e = MathTex(r"n = 5", color=YELLOW).scale(1.4)
        s4e_box = SurroundingRectangle(s4e, color=YELLOW, buff=0.25, corner_radius=0.12)
        s4e.next_to(s4d, DOWN, buff=0.4)
        s4e_box.move_to(s4e)
        self.play(Write(s4e))
        self.play(Create(s4e_box))
        self.wait(1.5)
        self.play(FadeOut(VGroup(step_title, s4a, s4b, s4c, s4d, s4e, s4e_box)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 能级图（n=1 到 n=6）
        # ══════════════════════════════════════════════════════════════════
        level_title = Text("氢原子能级图", font=CJK, color=BLUE).scale(0.5)
        level_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(level_title))
        self.wait(0.3)

        # 能级能量 En = -13.6 / n^2  (eV)
        def energy(n):
            return -13.6 / (n * n)

        # 坐标轴：y 轴为能量（eV），x 轴仅作支撑
        ax_x0 = -5.5   # 能级线左端（scene 坐标）
        ax_x1 = 2.0    # 能级线右端
        y_base = -2.8  # n=1 的 y 位置（scene 坐标）
        y_scale = 0.38  # eV → scene 单位（对数拉伸在下面做）

        # 为了让低能级（n=1,2）可见，用对数映射
        def e_to_y(n):
            """将 n 能级映射到 scene y 坐标（非线性，使得各能级可辨）。"""
            frac = (n - 1) / 6.0     # 0..1
            return y_base + frac * 4.2 + (n - 1) * 0.12

        levels = {}
        level_lines = VGroup()
        level_labels_n = VGroup()
        level_labels_e = VGroup()

        for n in range(1, 7):
            y = e_to_y(n)
            line = Line(
                [ax_x0, y, 0], [ax_x1 - 0.5, y, 0],
                color=WHITE, stroke_width=1.5
            )
            # n 标注（左侧）
            lbl_n = VGroup(
                Text("n=", font=CJK, color=WHITE).scale(0.35),
                MathTex(str(n), color=WHITE).scale(0.45),
            ).arrange(RIGHT, buff=0.05)
            lbl_n.next_to(line, LEFT, buff=0.08)
            # 能量标注（右侧）
            ev_val = energy(n)
            lbl_e = MathTex(
                rf"{ev_val:.2f}\ \mathrm{{eV}}",
                color=CYAN
            ).scale(0.38)
            lbl_e.next_to(line, RIGHT, buff=0.08)

            levels[n] = {"y": y, "line": line}
            level_lines.add(line)
            level_labels_n.add(lbl_n)
            level_labels_e.add(lbl_e)

        # 电离能标注
        ionize_lbl = VGroup(
            Text("0 eV（电离能界）", font=CJK, color=CYAN).scale(0.36)
        )
        ionize_lbl.next_to(level_lines[-1], UP, buff=0.12)

        self.play(Create(level_lines), run_time=1.2)
        self.play(FadeIn(level_labels_n), FadeIn(level_labels_e), FadeIn(ionize_lbl))
        self.wait(1.0)

        # ── 高亮巴尔末系（n=3,4,5,6 → n=2）虚线箭头，颜色渐变
        balmer_colors = [RED, ORANGE, COLOR_430, BLUE]
        balmer_arrows = VGroup()
        balmer_labels = VGroup()

        for idx, n_up in enumerate([3, 4, 5, 6]):
            y_up = levels[n_up]["y"]
            y_dn = levels[2]["y"]
            x_pos = ax_x0 + 1.0 + idx * 0.55
            arr = Arrow(
                [x_pos, y_up, 0], [x_pos, y_dn + 0.08, 0],
                buff=0,
                color=balmer_colors[idx],
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.18,
            )
            lbl = VGroup(
                MathTex(rf"n={n_up}", color=balmer_colors[idx]).scale(0.38)
            )
            lbl.next_to(arr, LEFT, buff=0.06)
            balmer_arrows.add(arr)
            balmer_labels.add(lbl)

        balmer_caption = Text("巴尔末系：所有向 n=2 跃迁（可见光区）",
                              font=CJK, color=YELLOW).scale(0.42)
        balmer_caption.to_edge(DOWN, buff=0.45)

        self.play(Create(balmer_arrows), FadeIn(balmer_labels), run_time=1.2)
        self.play(FadeIn(balmer_caption))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 高亮 n=5→2 跃迁（闪烁 + 能量标注）
        # ══════════════════════════════════════════════════════════════════
        # n=5→2 是 balmer_arrows[2]（idx=2）
        highlight_arr = balmer_arrows[2]
        # 构造加粗高亮版
        y5 = levels[5]["y"]
        y2 = levels[2]["y"]
        x_hl = ax_x0 + 1.0 + 2 * 0.55  # 与上面对齐

        big_arr = Arrow(
            [x_hl, y5, 0], [x_hl, y2 + 0.08, 0],
            buff=0,
            color=PURPLE,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.18,
        )
        self.play(FadeIn(big_arr))
        # 闪烁三次
        for _ in range(3):
            self.play(big_arr.animate.set_color(YELLOW), run_time=0.25)
            self.play(big_arr.animate.set_color(PURPLE), run_time=0.25)
        self.wait(0.4)

        # 光子能量标注 2.89 eV（能级差 E5-E2）
        e5 = energy(5)   # -0.544 eV
        e2 = energy(2)   # -3.40  eV
        delta_e = e5 - e2   # 2.856 ≈ 2.86 eV（精确计算）

        energy_label = VGroup(
            Text("光子能量：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(
                rf"E = E_5 - E_2 = {delta_e:.2f}\ \mathrm{{eV}}",
                color=YELLOW
            ).scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        energy_label.next_to(big_arr, RIGHT, buff=0.4)
        energy_label.scale_to_fit_width(5.5)
        self.play(FadeIn(energy_label))
        self.wait(1.5)

        # 保留能级图，清除右侧标注，准备进入光谱步骤
        keep_group = VGroup(
            level_lines, level_labels_n, level_labels_e, ionize_lbl,
            balmer_arrows, balmer_labels, big_arr
        )
        self.play(
            FadeOut(VGroup(balmer_caption, energy_label)),
            keep_group.animate.scale(0.62).to_edge(LEFT, buff=0.3).shift(DOWN * 0.3),
            run_time=1.4
        )
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 可见光谱条（右侧）
        # ══════════════════════════════════════════════════════════════════
        spec_title = Text("可见光谱对比", font=CJK, color=BLUE).scale(0.46)
        spec_title.to_corner(UR, buff=0.5).shift(DOWN * 0.8)
        self.play(FadeIn(spec_title))
        self.wait(0.3)

        # 光谱条：380 nm（左）到 700 nm（右），用渐变矩形近似
        SPEC_LEFT = 2.8
        SPEC_RIGHT = 6.8
        SPEC_Y = 0.5   # 中心 y
        SPEC_H = 0.55
        SPEC_W = SPEC_RIGHT - SPEC_LEFT   # 4.0

        # 用多段矩形拼出彩虹渐变
        spec_colors = [
            ("#380080", 380), ("#6600CC", 420), ("#0000FF", 450),
            ("#0088FF", 480), ("#00FFCC", 510), ("#00FF00", 550),
            ("#AAFF00", 580), ("#FFFF00", 590), ("#FF8800", 620),
            ("#FF0000", 700),
        ]
        spec_rects = VGroup()
        for i in range(len(spec_colors) - 1):
            col_l, wl_l = spec_colors[i]
            col_r, wl_r = spec_colors[i + 1]
            x_l = SPEC_LEFT + (wl_l - 380) / (700 - 380) * SPEC_W
            x_r = SPEC_LEFT + (wl_r - 380) / (700 - 380) * SPEC_W
            rect = Rectangle(
                width=x_r - x_l, height=SPEC_H,
                fill_color=[col_l, col_r],
                fill_opacity=0.85,
                stroke_width=0,
            )
            rect.move_to([(x_l + x_r) / 2, SPEC_Y, 0])
            spec_rects.add(rect)

        spec_border = Rectangle(
            width=SPEC_W + 0.05, height=SPEC_H + 0.05,
            color=WHITE, stroke_width=1.5, fill_opacity=0
        ).move_to([SPEC_LEFT + SPEC_W / 2, SPEC_Y, 0])

        # nm 刻度标注
        nm_labels = VGroup()
        for wl in [400, 450, 500, 550, 600, 650, 700]:
            x_pos = SPEC_LEFT + (wl - 380) / (700 - 380) * SPEC_W
            tick = Line([x_pos, SPEC_Y - SPEC_H / 2, 0],
                        [x_pos, SPEC_Y - SPEC_H / 2 - 0.12, 0],
                        color=WHITE, stroke_width=1)
            lbl = MathTex(str(wl), color=WHITE).scale(0.3)
            lbl.next_to(tick, DOWN, buff=0.04)
            nm_labels.add(tick, lbl)

        nm_unit = MathTex(r"\lambda\ (\mathrm{nm})", color=WHITE).scale(0.36)
        nm_unit.next_to(spec_border, DOWN, buff=0.5)

        self.play(Create(spec_rects), Create(spec_border), run_time=1.0)
        self.play(FadeIn(nm_labels), FadeIn(nm_unit))
        self.wait(0.6)

        # ── 标出三条谱线 ─────────────────────────────────────────────────
        def wl_to_x(wl):
            return SPEC_LEFT + (wl - 380) / (700 - 380) * SPEC_W

        # H_alpha 656 nm
        x_alpha = wl_to_x(656)
        line_alpha = DashedLine(
            [x_alpha, SPEC_Y + SPEC_H / 2, 0],
            [x_alpha, SPEC_Y + SPEC_H / 2 + 0.55, 0],
            color=COLOR_656, stroke_width=2
        )
        lbl_alpha = VGroup(
            MathTex(r"H_\alpha", color=COLOR_656).scale(0.5),
            Text("656 nm", font=CJK, color=COLOR_656).scale(0.32),
        ).arrange(DOWN, buff=0.05)
        lbl_alpha.next_to(line_alpha, UP, buff=0.05)

        # H_beta 486 nm
        x_beta = wl_to_x(486)
        line_beta = DashedLine(
            [x_beta, SPEC_Y + SPEC_H / 2, 0],
            [x_beta, SPEC_Y + SPEC_H / 2 + 0.55, 0],
            color=COLOR_486, stroke_width=2
        )
        lbl_beta = VGroup(
            MathTex(r"H_\beta", color=COLOR_486).scale(0.5),
            Text("486 nm", font=CJK, color=COLOR_486).scale(0.32),
        ).arrange(DOWN, buff=0.05)
        lbl_beta.next_to(line_beta, UP, buff=0.05)

        # 本题 430 nm
        x_430 = wl_to_x(430)
        line_430 = DashedLine(
            [x_430, SPEC_Y + SPEC_H / 2, 0],
            [x_430, SPEC_Y + SPEC_H / 2 + 0.9, 0],
            color=COLOR_430, stroke_width=2.5
        )
        lbl_430 = VGroup(
            MathTex(r"n=5{\to}2", color=COLOR_430).scale(0.48),
            Text("430 nm", font=CJK, color=COLOR_430).scale(0.36),
        ).arrange(DOWN, buff=0.05)
        lbl_430.next_to(line_430, UP, buff=0.05)

        # 依次出现，先常见谱线再本题
        self.play(Create(line_alpha), FadeIn(lbl_alpha))
        self.wait(0.5)
        self.play(Create(line_beta), FadeIn(lbl_beta))
        self.wait(0.5)
        self.play(Create(line_430), FadeIn(lbl_430))
        # 闪烁两次强调本题谱线
        for _ in range(2):
            self.play(line_430.animate.set_color(YELLOW), run_time=0.3)
            self.play(line_430.animate.set_color(COLOR_430), run_time=0.3)
        self.wait(1.2)

        # 添加光谱比较说明
        spec_note = Text("可见：430 nm（紫蓝色）位于 H_β 蓝侧，靠近紫色端",
                         font=CJK, color=GREEN).scale(0.4)
        spec_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(spec_note))
        self.wait(1.6)

        # 清场
        all_spec = VGroup(
            spec_rects, spec_border, nm_labels, nm_unit,
            line_alpha, lbl_alpha, line_beta, lbl_beta,
            line_430, lbl_430, spec_title, spec_note
        )
        self.play(FadeOut(all_spec), FadeOut(keep_group))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本例小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))
        self.wait(0.3)

        s1 = VGroup(
            Text("巴尔末系公式：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\frac{1}{\lambda} = R\!\left(\frac{1}{4}-\frac{1}{n^2}\right)",
                    color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("代入 430 nm 解出：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"n = 5", color=YELLOW).scale(0.9),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("光子能量：", font=CJK, color=WHITE).scale(0.42),
            MathTex(rf"E = E_5 - E_2 = {delta_e:.2f}\ \mathrm{{eV}}",
                    color=GREEN).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s4 = Text("谱线 430 nm 位于可见光紫蓝端，对应 n=5→2 跃迁",
                  font=CJK, color=CYAN).scale(0.42)

        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(12.0)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s1))
        self.wait(0.6)
        self.play(FadeIn(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch12Ex1BalmerSeriesTransition",
        "id": "phys-ch12-12.2-ex1-balmer-series-transition",
        "chapterId": "ch12",
        "sectionId": "12.2",
        "title": "例：巴尔末系谱线计算与能级跃迁识别",
        "description": "用巴尔末公式逐步代入 430 nm 解出 n=5，在能级图上高亮 n=5→2 跃迁并标注光子能量，最后在可见光谱条上定位该谱线并与 H_α、H_β 对比。",
    }
]
