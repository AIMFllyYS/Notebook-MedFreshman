"""第 12.4 节 · 一维无限深势阱：能量量子化与驻波

波动/函数曲线类动画：
- 势阱示意图 + 驻波 n=1..5（ValueTracker 控制量子数）
- 右侧能级棒状图随 n 实时更新（间距 ~ n²）
- |ψ_n|² 概率密度分布（含 n=2 节点演示）
- 对应原理：n=50 时概率密度趋于均匀（经典极限）
- 零点能 E₁ ≠ 0 的量子-经典对比

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch12Kp3InfiniteSquareWellQuantization",
        "id": "phys-ch12-12.4-kp3-infinite-square-well-quantization",
        "chapterId": "ch12",
        "sectionId": "12.4",
        "title": "一维无限深势阱：能量量子化与驻波",
        "description": "用 ValueTracker 动态演示 n=1~5 驻波、n²能级棒状图、概率密度分布以及 n=50 经典极限，直观呈现量子数如何导致能量量子化。",
    }
]


class Ch12Kp3InfiniteSquareWellQuantization(Scene):
    def construct(self):
        # ─── 共用常量 ───────────────────────────────────────────────────
        a = 5.0  # 势阱宽度（画面单位，下同）

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("一维无限深势阱：能量量子化与驻波", font=CJK, color=BLUE).scale(0.6)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第12章 量子力学初步 · 12.4", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("把电子关进一个「盒子」——两侧是无法穿越的无限高墙。", font=CJK).scale(0.46)
        ana2 = Text("就像吉他弦两端固定，只有特定波长才能形成驻波——", font=CJK).scale(0.46)
        ana3 = Text("能量因此只能取一些「跳跃式」的离散值，这就是量子化。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 势阱定义公式（逐步出现）───────────────────────────
        eq_V = MathTex(
            r"V(x) = \begin{cases} 0, & 0 < x < a \\ \infty, & \text{otherwise} \end{cases}"
        ).scale(0.72)
        eq_V.next_to(title, DOWN, buff=0.55)
        label_V = Text("势能函数定义", font=CJK, color=GREEN).scale(0.42)
        label_V.next_to(eq_V, DOWN, buff=0.22)
        self.play(Write(eq_V))
        self.play(FadeIn(label_V))
        self.wait(1.2)

        eq_psi = MathTex(
            r"\psi_n(x) = \sqrt{\frac{2}{a}}\sin\!\frac{n\pi x}{a},\quad n=1,2,3,\ldots"
        ).scale(0.72)
        eq_psi.next_to(label_V, DOWN, buff=0.3)
        eq_psi[0][0:3].set_color(YELLOW)   # ψ_n
        self.play(Write(eq_psi))
        self.wait(0.8)

        eq_En = MathTex(
            r"E_n = \frac{n^2\pi^2\hbar^2}{2ma^2} = n^2 E_1"
        ).scale(0.78)
        eq_En.next_to(eq_psi, DOWN, buff=0.28)
        eq_En[0][0:2].set_color(ORANGE)    # E_n
        self.play(Write(eq_En))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq_V, label_V, eq_psi, eq_En)))

        # ── Step 4: 势阱图 + ValueTracker 控制驻波 n=1..5 ─────────────
        # 左侧：势阱 + 波函数；右侧：能级棒状图
        n_tracker = ValueTracker(1)

        # --- 势阱轮廓 ---
        well_left = 0.8
        well_right = well_left + a * 0.9   # 映射到画面坐标
        well_scale = 0.9                   # x 轴缩放因子（势阱宽→画面宽）

        wall_h = 2.4
        # 左墙
        left_wall = Line(
            [-5.0, -wall_h, 0], [-5.0, wall_h, 0], color=WHITE, stroke_width=4
        ).shift(LEFT * 0.2)
        # 底部
        bottom = Line(
            [-5.0, -wall_h, 0], [0.6, -wall_h, 0], color=WHITE, stroke_width=4
        ).shift(LEFT * 0.2)
        # 右墙
        right_wall = Line(
            [0.6, -wall_h, 0], [0.6, wall_h, 0], color=WHITE, stroke_width=4
        ).shift(LEFT * 0.2)
        # 左侧「∞」标注
        inf_L = MathTex(r"\infty").scale(0.6).next_to(left_wall, LEFT, buff=0.1).shift(LEFT * 0.2)
        inf_R = MathTex(r"\infty").scale(0.6).next_to(right_wall, RIGHT, buff=0.1).shift(LEFT * 0.2)
        # x=0, x=a 标注
        lbl_0 = MathTex(r"0").scale(0.5).next_to(bottom.get_start(), DOWN, buff=0.15)
        lbl_a = MathTex(r"a").scale(0.5).next_to(bottom.get_end(), DOWN, buff=0.15)
        well_group = VGroup(left_wall, bottom, right_wall)

        # 势阱内坐标映射（x ∈ [0,a] → 画面 x ∈ [-5.2+0.05, 0.55]，需与墙对齐）
        x_left = -5.0 - 0.2       # left wall x in scene coords
        x_right = 0.6 - 0.2       # right wall x in scene coords
        scene_width = x_right - x_left

        def x_to_scene(x_norm):
            """x_norm ∈ [0,1] → scene x coordinate inside well"""
            return x_left + x_norm * scene_width

        def psi_y(x_norm, n):
            return math.sqrt(2) * math.sin(n * math.pi * x_norm) * 0.8

        wave_curve = always_redraw(lambda: ParametricFunction(
            lambda t: np.array([x_to_scene(t), psi_y(t, int(round(n_tracker.get_value()))), 0]),
            t_range=[0.001, 0.999, 0.005],
            color=YELLOW,
            stroke_width=3,
        ))

        # n 标签
        n_label = always_redraw(lambda: VGroup(
            Text("n = ", font=CJK, color=WHITE).scale(0.5),
            MathTex(str(int(round(n_tracker.get_value()))), color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.1).move_to([-3.0, 1.8, 0]))

        # --- 右侧能级棒状图 (n=1..5) ---
        E_scale = 0.18   # E₁ 对应高度
        bar_x = 3.8
        bars_group = always_redraw(lambda: self._draw_energy_bars(
            n_tracker.get_value(), bar_x, E_scale
        ))

        # --- 显示势阱 + 波函数 ---
        self.play(
            Create(well_group),
            FadeIn(inf_L), FadeIn(inf_R),
            FadeIn(lbl_0), FadeIn(lbl_a),
        )
        self.play(Create(wave_curve), FadeIn(n_label))
        self.play(FadeIn(bars_group))
        self.wait(1.2)

        # n=1 标注：只有半个弦
        half_label = Text("半波驻波（半弦）", font=CJK, color=CYAN).scale(0.4)
        half_label.move_to([-3.0, -1.9, 0])
        self.play(FadeIn(half_label))
        self.wait(1.0)
        self.play(FadeOut(half_label))

        # ValueTracker 动态从 n=1 → n=5
        for n_val in [2, 3, 4, 5]:
            self.play(n_tracker.animate.set_value(n_val), run_time=1.4)
            self.wait(0.8)

        self.wait(0.8)

        # 强调 E_n ~ n² 关系
        en_note = VGroup(
            Text("能级间距", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"E_n = n^2 E_1", color=ORANGE).scale(0.7),
        ).arrange(RIGHT, buff=0.2).move_to([3.8, 1.0, 0])
        # shift n² 文字放在能级图上方
        en_note.move_to([3.8, 2.6, 0])
        self.play(FadeIn(en_note))
        self.wait(1.5)

        # 回到 n=1 再过一遍
        self.play(n_tracker.animate.set_value(1), run_time=1.0)
        self.wait(0.5)

        self.play(FadeOut(VGroup(wave_curve, n_label, bars_group, en_note,
                                  well_group, inf_L, inf_R, lbl_0, lbl_a)))

        # ── Step 5: 概率密度 |ψ_n|² 演示 ──────────────────────────────
        prob_title = Text("概率密度分布", font=CJK, color=BLUE).scale(0.5)
        prob_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(prob_title))

        prob_axes = Axes(
            x_range=[0, 1, 0.25],
            y_range=[0, 2.5, 0.5],
            x_length=5.5,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": False},
        ).move_to([-2.5, -0.5, 0])
        x_lbl2 = MathTex(r"x/a").scale(0.5).next_to(prob_axes.x_axis.get_end(), RIGHT, buff=0.1)
        y_lbl2 = MathTex(r"|\psi_n|^2").scale(0.5).next_to(prob_axes.y_axis.get_end(), UP, buff=0.1)
        self.play(Create(prob_axes), FadeIn(x_lbl2), FadeIn(y_lbl2))

        # n=1
        n2_tracker = ValueTracker(1)
        prob_curve = always_redraw(lambda: prob_axes.plot(
            lambda x: 2 * (math.sin(int(round(n2_tracker.get_value())) * math.pi * x)) ** 2,
            x_range=[0.001, 0.999, 0.005],
            color=YELLOW,
            stroke_width=3,
        ))
        prob_area = always_redraw(lambda: prob_axes.get_area(
            prob_axes.plot(
                lambda x: 2 * (math.sin(int(round(n2_tracker.get_value())) * math.pi * x)) ** 2,
                x_range=[0.001, 0.999, 0.005],
            ),
            x_range=[0.001, 0.999],
            color=YELLOW,
            opacity=0.25,
        ))
        n2_label = always_redraw(lambda: VGroup(
            Text("n = ", font=CJK).scale(0.42),
            MathTex(str(int(round(n2_tracker.get_value()))), color=YELLOW).scale(0.6),
        ).arrange(RIGHT, buff=0.1).next_to(prob_axes, RIGHT, buff=0.3).shift(UP * 0.5))

        self.play(Create(prob_curve), FadeIn(prob_area), FadeIn(n2_label))
        self.wait(0.8)

        note_n1 = Text("n=1：中间概率最大", font=CJK, color=GREEN).scale(0.42)
        note_n1.next_to(prob_axes, DOWN, buff=0.25)
        self.play(FadeIn(note_n1))
        self.wait(1.2)
        self.play(FadeOut(note_n1))

        # n=2
        self.play(n2_tracker.animate.set_value(2), run_time=1.2)
        note_n2 = Text("n=2：中心出现节点，概率为零！", font=CJK, color=RED).scale(0.42)
        note_n2.next_to(prob_axes, DOWN, buff=0.25)
        node_dot = Dot(prob_axes.c2p(0.5, 0), color=RED, radius=0.1)
        self.play(FadeIn(note_n2), FadeIn(node_dot))
        self.wait(1.5)
        self.play(FadeOut(note_n2), FadeOut(node_dot))

        # n=3, 4, 5
        for n_val in [3, 4, 5]:
            self.play(n2_tracker.animate.set_value(n_val), run_time=1.0)
            self.wait(0.7)
        self.wait(0.8)

        # 右侧说明文字
        explain_lines = VGroup(
            Text("节点数 = n-1", font=CJK, color=CYAN).scale(0.4),
            Text("n 越大，节点越多", font=CJK, color=WHITE).scale(0.4),
            Text("概率分布越来越「碎」", font=CJK, color=WHITE).scale(0.4),
        ).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        explain_lines.next_to(prob_axes, RIGHT, buff=0.35).shift(DOWN * 0.3)
        self.play(FadeIn(explain_lines))
        self.wait(1.5)

        self.play(FadeOut(VGroup(prob_axes, x_lbl2, y_lbl2, prob_curve,
                                  prob_area, n2_label, explain_lines, prob_title)))

        # ── Step 6: 对应原理——n=50 趋于经典均匀分布 ───────────────────
        corr_title = Text("对应原理：n 很大时趋近经典结果", font=CJK, color=BLUE).scale(0.48)
        corr_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(corr_title))

        corr_axes = Axes(
            x_range=[0, 1, 0.25],
            y_range=[0, 3.0, 0.5],
            x_length=7.0,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": False},
        ).move_to([0, -0.6, 0])
        cx_lbl = MathTex(r"x/a").scale(0.5).next_to(corr_axes.x_axis.get_end(), RIGHT, buff=0.1)
        cy_lbl = MathTex(r"|\psi_{50}|^2").scale(0.5).next_to(corr_axes.y_axis.get_end(), UP, buff=0.1)
        self.play(Create(corr_axes), FadeIn(cx_lbl), FadeIn(cy_lbl))

        # n=50 的 |ψ|²
        n50_curve = corr_axes.plot(
            lambda x: 2 * (math.sin(50 * math.pi * x)) ** 2,
            x_range=[0.001, 0.999, 0.0005],
            color=YELLOW,
            stroke_width=2,
        )
        # 经典均匀分布（1/a 归一化后 = 1.0 in units 2/a*sin²→均值1）
        classical_line = DashedLine(
            corr_axes.c2p(0, 1.0), corr_axes.c2p(1.0, 1.0),
            color=CYAN, stroke_width=3,
        )
        classical_lbl = VGroup(
            Text("经典均匀", font=CJK, color=CYAN).scale(0.4),
            MathTex(r"\langle|\psi|^2\rangle = \frac{1}{a}", color=CYAN).scale(0.55),
        ).arrange(DOWN, buff=0.1).next_to(classical_line, RIGHT, buff=0.15)

        self.play(Create(n50_curve))
        self.wait(0.5)
        self.play(Create(classical_line), FadeIn(classical_lbl))
        self.wait(0.8)

        corr_note = Text("n=50 时快速振荡，宏观上看几乎均匀——对应原理成立！",
                          font=CJK, color=GREEN).scale(0.42)
        corr_note.next_to(corr_axes, DOWN, buff=0.25)
        self.play(FadeIn(corr_note))
        self.wait(2.0)

        # 零点能说明
        zero_energy = VGroup(
            Text("零点能：", font=CJK, color=RED).scale(0.44),
            MathTex(r"E_1 = \frac{\pi^2\hbar^2}{2ma^2} \neq 0", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.15)
        zero_energy.next_to(corr_note, DOWN, buff=0.3)
        zero_extra = Text("（经典粒子可以静止在阱底，量子粒子不可以！）",
                          font=CJK, color=WHITE).scale(0.4)
        zero_extra.next_to(zero_energy, DOWN, buff=0.2)
        self.play(FadeIn(zero_energy))
        self.play(FadeIn(zero_extra))
        self.wait(2.0)

        self.play(FadeOut(VGroup(corr_axes, cx_lbl, cy_lbl, n50_curve,
                                  classical_line, classical_lbl, corr_note,
                                  zero_energy, zero_extra, corr_title)))

        # ── Step 7: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(
            r"\psi_n(x) = \sqrt{\tfrac{2}{a}}\sin\!\frac{n\pi x}{a}",
            color=YELLOW
        ).scale(0.72)
        s2 = MathTex(
            r"E_n = \frac{n^2\pi^2\hbar^2}{2ma^2} = n^2 E_1",
            color=ORANGE
        ).scale(0.72)
        s3 = MathTex(
            r"\Delta E_n = (2n+1)\frac{\pi^2\hbar^2}{2ma^2}",
            color=GREEN
        ).scale(0.72)
        s4 = VGroup(
            Text("零点能", font=CJK, color=RED).scale(0.44),
            MathTex(r"E_1 \neq 0", color=RED).scale(0.65),
            Text("（不确定性原理的体现）", font=CJK, color=WHITE).scale(0.4),
        ).arrange(RIGHT, buff=0.18)
        s5 = Text("n→大：概率均匀→经典对应原理", font=CJK, color=CYAN).scale(0.42)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.0)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)

    # ── 辅助方法：绘制能级棒状图 ────────────────────────────────────────
    def _draw_energy_bars(self, n_current: float, bar_x: float, E_scale: float) -> VGroup:
        """绘制 n=1..5 的能级横线，当前 n 高亮为黄色。"""
        n_cur = int(round(n_current))
        vg = VGroup()
        bar_y_base = -2.5
        for ni in range(1, 6):
            y_pos = bar_y_base + ni * ni * E_scale
            color = YELLOW if ni == n_cur else GRAY
            bar = Line(
                [bar_x - 0.6, y_pos, 0],
                [bar_x + 0.6, y_pos, 0],
                color=color,
                stroke_width=3 if ni == n_cur else 2,
            )
            lbl = MathTex(f"n={ni}", color=color).scale(0.38)
            lbl.next_to(bar, RIGHT, buff=0.12)
            E_lbl = MathTex(f"E_{{{ni}}}={ni}^2 E_1", color=color).scale(0.33)
            E_lbl.next_to(bar, LEFT, buff=0.12)
            vg.add(bar, lbl, E_lbl)
        # 纵轴箭头
        axis_arrow = Arrow(
            [bar_x, bar_y_base - 0.1, 0],
            [bar_x, bar_y_base + 6.0 * E_scale + 0.3, 0],
            buff=0,
            color=BLUE,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.08,
        )
        axis_lbl = MathTex(r"E").scale(0.5).next_to(axis_arrow.get_end(), UP, buff=0.05)
        vg.add(axis_arrow, axis_lbl)
        return vg
