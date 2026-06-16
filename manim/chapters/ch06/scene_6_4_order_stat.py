"""第 6.4 节 · 样本分位数与顺序统计量

演示从无序样本到排序后的顺序统计量，展示最小值 X_(1) 和最大值 X_(n)
的分布随 n 变化的规律，以及样本中位数趋向正态的性质。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GOLD,
    GREEN,
    GREEN_D,
    LEFT,
    ORANGE,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    ReplacementTransform,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    Arrow,
    Line,
    DashedLine,
    DecimalNumber,
    AnimationGroup,
)
import numpy as np

CJK = "Microsoft YaHei"

# 固定随机种子确保可复现
np.random.seed(42)


class OrderStatScene(Scene):
    def construct(self):
        # ── 幕一：标题 ──────────────────────────────────────────
        title = Text("顺序统计量与样本分位数", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        subtitle = Text("第6.4节", font=CJK).scale(0.45).next_to(title, DOWN, buff=0.1)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)

        # ── 幕二：无序样本 → 排序动画 ───────────────────────────
        intro = Text("从总体中抽取 n=10 个样本观测值", font=CJK).scale(0.5)
        intro.next_to(subtitle, DOWN, buff=0.4)
        self.play(FadeIn(intro))

        # 生成 10 个随机点 (均匀分布 [0,1])
        raw_vals = np.sort(np.random.uniform(0.05, 0.95, 10))
        np.random.shuffle(raw_vals)  # 打乱顺序，模拟"无序"

        # 数轴
        ax = Axes(
            x_range=[0, 1, 0.25],
            y_range=[0, 1, 1],
            x_length=7,
            y_length=0,
            axis_config={"color": WHITE, "include_tip": True},
        )
        ax_group = ax.get_axes()[0]  # 只取 x 轴
        ax_group.move_to(DOWN * 0.4)

        ax_label_0 = MathTex(r"0").scale(0.5).next_to(ax_group.n2p(0), DOWN, buff=0.15)
        ax_label_1 = MathTex(r"1").scale(0.5).next_to(ax_group.n2p(1), DOWN, buff=0.15)
        self.play(Create(ax_group), FadeIn(ax_label_0, ax_label_1))

        # 画无序点
        unsorted_dots = VGroup()
        for v in raw_vals:
            d = Dot(point=ax_group.n2p(v), color=BLUE, radius=0.12)
            unsorted_dots.add(d)

        unsorted_label = Text("无序样本", font=CJK, color=BLUE).scale(0.45)
        unsorted_label.next_to(ax_group, UP, buff=0.55)
        self.play(FadeIn(unsorted_dots, lag_ratio=0.12), Write(unsorted_label))
        self.wait(0.5)

        # 排序 → 顺序统计量
        sorted_vals = np.sort(raw_vals)
        sorted_dots = VGroup()
        for v in sorted_vals:
            d = Dot(point=ax_group.n2p(v), color=GREEN, radius=0.12)
            sorted_dots.add(d)

        sorted_label = Text("排序后 = 顺序统计量", font=CJK, color=GREEN).scale(0.45)
        sorted_label.next_to(ax_group, UP, buff=0.55)

        self.play(
            ReplacementTransform(unsorted_dots, sorted_dots),
            ReplacementTransform(unsorted_label, sorted_label),
        )
        self.wait(0.4)

        # 高亮 X_(1) 最小值
        x1_dot = sorted_dots[0].copy().set_color(RED).scale(1.5)
        xn_dot = sorted_dots[-1].copy().set_color(GOLD).scale(1.5)

        x1_tex = MathTex(r"X_{(1)}", color=RED).scale(0.7)
        x1_tex.next_to(x1_dot, DOWN, buff=0.25)
        xn_tex = MathTex(r"X_{(n)}", color=GOLD).scale(0.7)
        xn_tex.next_to(xn_dot, DOWN, buff=0.25)

        x1_lbl = Text("最小值", font=CJK, color=RED).scale(0.4)
        x1_lbl.next_to(x1_tex, DOWN, buff=0.1)
        xn_lbl = Text("最大值", font=CJK, color=GOLD).scale(0.4)
        xn_lbl.next_to(xn_tex, DOWN, buff=0.1)

        self.play(
            FadeIn(x1_dot), Write(x1_tex), Write(x1_lbl),
            FadeIn(xn_dot), Write(xn_tex), Write(xn_lbl),
        )
        self.wait(0.8)

        # 写出顺序统计量记号
        order_formula = MathTex(
            r"X_{(1)} \le X_{(2)} \le \cdots \le X_{(n)}"
        ).scale(0.65)
        order_formula.to_edge(DOWN, buff=0.35)
        self.play(Write(order_formula))
        self.wait(1.0)

        # 清场
        self.play(FadeOut(VGroup(
            intro, ax_group, ax_label_0, ax_label_1,
            sorted_dots, sorted_label,
            x1_dot, xn_dot, x1_tex, xn_tex, x1_lbl, xn_lbl,
            order_formula,
        )))

        # ── 幕三：X_(1) 分布直方图（重复抽样） ─────────────────
        hist_title = Text("多次重复抽样：最小值 X(1) 的分布", font=CJK).scale(0.5)
        hist_title.next_to(subtitle, DOWN, buff=0.35)
        self.play(FadeIn(hist_title))

        # 模拟 500 次抽样，每次 n=10，记录最小值
        n_sim = 500
        n_sample = 10
        min_vals = [np.min(np.random.uniform(0, 1, n_sample)) for _ in range(n_sim)]

        # 建立直方图数轴
        hist_ax = Axes(
            x_range=[0, 1, 0.2],
            y_range=[0, 150, 50],
            x_length=6.5,
            y_length=3.2,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": True},
        ).shift(DOWN * 0.6)

        x_label = Text("X(1) 的值", font=CJK).scale(0.4).next_to(hist_ax, DOWN, buff=0.2)
        y_label = Text("频数", font=CJK).scale(0.4).rotate(90 * 3.14159 / 180)
        y_label.next_to(hist_ax, LEFT, buff=0.35)

        self.play(Create(hist_ax), Write(x_label), Write(y_label))

        # 绘制直方图条形
        n_bins = 10
        bin_width = 1.0 / n_bins
        counts, edges = np.histogram(min_vals, bins=n_bins, range=(0, 1))

        bars = VGroup()
        for i, cnt in enumerate(counts):
            left_x = edges[i]
            right_x = edges[i + 1]
            # 将数据坐标转为屏幕坐标
            p_left = hist_ax.c2p(left_x, 0)
            p_right = hist_ax.c2p(right_x, cnt)
            width = abs(p_right[0] - p_left[0]) - 0.03
            height = abs(p_right[1] - p_left[1])
            bar = Rectangle(
                width=width,
                height=height,
                fill_color=BLUE_D,
                fill_opacity=0.8,
                stroke_color=WHITE,
                stroke_width=0.8,
            )
            bar.move_to(
                [(p_left[0] + p_right[0]) / 2, p_left[1] + height / 2, 0]
            )
            bars.add(bar)

        self.play(FadeIn(bars, lag_ratio=0.07))

        # 理论密度曲线：n=10, f_{X_(1)}(x) = n*(1-x)^{n-1} => 10*(1-x)^9
        density_curve = hist_ax.plot(
            lambda x: n_sample * (1 - x) ** (n_sample - 1) * n_sim * bin_width,
            x_range=[0, 0.98],
            color=RED,
            stroke_width=3,
        )
        density_lbl = MathTex(
            r"f_{X_{(1)}}(x) = n(1-x)^{n-1}", color=RED
        ).scale(0.52)
        density_lbl.to_corner(UP + RIGHT).shift(DOWN * 1.8)
        self.play(Create(density_curve), Write(density_lbl))
        insight = Text("最小值倾向于左侧（小值区域）", font=CJK, color=YELLOW).scale(0.42)
        insight.next_to(hist_ax, DOWN, buff=0.55)
        self.play(Write(insight))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            hist_title, hist_ax, x_label, y_label,
            bars, density_curve, density_lbl, insight,
        )))

        # ── 幕四：n 增大 → X_(1) 向 0 收缩 ─────────────────────
        n_title = Text("n 增大时，X(1) 分布向总体最小值压缩", font=CJK).scale(0.5)
        n_title.next_to(subtitle, DOWN, buff=0.35)
        self.play(FadeIn(n_title))

        small_ax = Axes(
            x_range=[0, 1, 0.25],
            y_range=[0, 1, 0.5],
            x_length=6.5,
            y_length=3.0,
            axis_config={"color": WHITE, "include_tip": False},
        ).shift(DOWN * 0.55)
        self.play(Create(small_ax))

        n_values = [5, 10, 20, 50]
        colors = [GREEN, BLUE, ORANGE, RED]

        curves = VGroup()
        labels = VGroup()
        for ni, ci in zip(n_values, colors):
            curve = small_ax.plot(
                lambda x, n=ni: n * (1 - x) ** (n - 1),
                x_range=[0, 0.99],
                color=ci,
                stroke_width=2.5,
            )
            lbl = MathTex(r"n=" + str(ni), color=ci).scale(0.5)
            curves.add(curve)
            labels.add(lbl)

        # 排列图例
        legend = VGroup()
        for i, (lbl, ci) in enumerate(zip(labels, colors)):
            legend.add(lbl)
        legend.arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        legend.to_corner(UP + RIGHT).shift(DOWN * 1.5 + LEFT * 0.5)

        for curve, lbl in zip(curves, labels):
            self.play(Create(curve), FadeIn(lbl), run_time=0.6)

        x_lbl2 = MathTex(r"x").scale(0.5).next_to(small_ax, DOWN + RIGHT, buff=0.1)
        y_lbl2 = MathTex(r"f_{X_{(1)}}(x)").scale(0.45).next_to(small_ax, LEFT, buff=0.3)
        self.play(Write(x_lbl2), Write(y_lbl2))

        shrink_note = Text("n 越大，最小值越集中在 0 附近", font=CJK, color=YELLOW).scale(0.43)
        shrink_note.next_to(small_ax, DOWN, buff=0.3)
        self.play(Write(shrink_note))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            n_title, small_ax, curves, labels,
            x_lbl2, y_lbl2, shrink_note,
        )))

        # ── 幕五：样本中位数趋于正态 ────────────────────────────
        med_title = Text("样本中位数的分布趋于正态", font=CJK).scale(0.5)
        med_title.next_to(subtitle, DOWN, buff=0.35)
        self.play(FadeIn(med_title))

        # 模拟样本中位数
        n_med = 31  # 奇数 → 中位数为 X_((n+1)/2)
        med_vals = [np.median(np.random.uniform(0, 1, n_med)) for _ in range(600)]

        med_ax = Axes(
            x_range=[0.2, 0.8, 0.1],
            y_range=[0, 120, 40],
            x_length=6.5,
            y_length=3.0,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": True},
        ).shift(DOWN * 0.6)

        self.play(Create(med_ax))

        n_bins_m = 12
        counts_m, edges_m = np.histogram(med_vals, bins=n_bins_m, range=(0.2, 0.8))
        bw_m = 0.6 / n_bins_m

        med_bars = VGroup()
        for i, cnt in enumerate(counts_m):
            lx = edges_m[i]
            rx = edges_m[i + 1]
            pl = med_ax.c2p(lx, 0)
            pr = med_ax.c2p(rx, cnt)
            w = abs(pr[0] - pl[0]) - 0.03
            h = abs(pr[1] - pl[1])
            bar = Rectangle(
                width=w, height=h,
                fill_color=GREEN_D, fill_opacity=0.8,
                stroke_color=WHITE, stroke_width=0.8,
            )
            bar.move_to([(pl[0] + pr[0]) / 2, pl[1] + h / 2, 0])
            med_bars.add(bar)

        self.play(FadeIn(med_bars, lag_ratio=0.06))

        # 理论正态近似：均值 0.5，方差 1/(4*(n+2))
        mu_med = 0.5
        sigma_med = np.sqrt(1 / (4 * (n_med + 2)))
        norm_curve = med_ax.plot(
            lambda x: (600 * bw_m / (sigma_med * np.sqrt(2 * np.pi)))
                      * np.exp(-0.5 * ((x - mu_med) / sigma_med) ** 2),
            x_range=[0.25, 0.75],
            color=YELLOW,
            stroke_width=3,
        )
        norm_lbl = MathTex(
            r"\hat{m} \xrightarrow{d} N\!\left(\tfrac{1}{2},\,\tfrac{1}{4(n+2)}\right)",
            color=YELLOW
        ).scale(0.55)
        norm_lbl.to_corner(UP + RIGHT).shift(DOWN * 1.8 + LEFT * 0.3)
        self.play(Create(norm_curve), Write(norm_lbl))

        center_line = DashedLine(
            med_ax.c2p(0.5, 0), med_ax.c2p(0.5, 120),
            color=RED, stroke_width=2, dash_length=0.15,
        )
        mu_lbl = MathTex(r"\mu=0.5", color=RED).scale(0.5)
        mu_lbl.next_to(med_ax.c2p(0.5, 120), UP, buff=0.1)
        self.play(Create(center_line), Write(mu_lbl))

        med_note = Text("样本中位数以 0.5 为中心，近似正态分布", font=CJK, color=YELLOW).scale(0.42)
        med_note.next_to(med_ax, DOWN, buff=0.3)
        self.play(Write(med_note))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            med_title, med_ax, med_bars,
            norm_curve, norm_lbl, center_line, mu_lbl, med_note,
        )))

        # ── 幕六：小结 ──────────────────────────────────────────
        summary_title = Text("小结", font=CJK, weight=BOLD).scale(0.65).next_to(subtitle, DOWN, buff=0.5)
        self.play(Write(summary_title))

        points = [
            "1. 排序后得顺序统计量  X(1) ≤ X(2) ≤ ... ≤ X(n)",
            "2. X(1) 分布密度向左偏，n 越大越集中于总体下端",
            "3. 样本中位数 X((n+1)/2) 随 n 增大趋向正态分布",
        ]
        pt_group = VGroup()
        for p in points:
            t = Text(p, font=CJK).scale(0.42)
            pt_group.add(t)
        pt_group.arrange(DOWN, aligned_edge=LEFT, buff=0.35)
        pt_group.next_to(summary_title, DOWN, buff=0.4)

        for pt in pt_group:
            self.play(FadeIn(pt))
            self.wait(0.3)

        key_formula = MathTex(
            r"f_{X_{(k)}}(x) = \frac{n!}{(k-1)!(n-k)!} [F(x)]^{k-1}[1-F(x)]^{n-k} f(x)"
        ).scale(0.52)
        key_formula.next_to(pt_group, DOWN, buff=0.4)
        self.play(Write(key_formula))
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, subtitle, summary_title, pt_group, key_formula)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "OrderStatScene",
        "id": "ch06-6.4-order-stat",
        "chapterId": "ch06",
        "sectionId": "6.4",
        "title": "顺序统计量与样本分位数",
        "description": "演示无序样本排序为顺序统计量的过程，展示最小值 X(1) 和样本中位数的分布规律随样本量 n 变化的趋势。",
    },
]
