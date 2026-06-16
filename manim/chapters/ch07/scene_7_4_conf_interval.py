"""第 7.4 节 · 区间估计 —— 100 次重复抽样，观察置信区间覆盖真实参数的频率。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""

import random

from manim import (
    BOLD,
    DOWN,
    GREEN,
    LEFT,
    RIGHT,
    RED,
    UP,
    YELLOW,
    DashedLine,
    FadeIn,
    FadeOut,
    Line,
    MathTex,
    Scene,
    Text,
    VGroup,
    Write,
    AnimationGroup,
)

CJK = "Microsoft YaHei"

# 真实均值
TRUE_MU = 2.0

# 布局常量
AXIS_X_LEFT = -5.5
AXIS_X_RIGHT = 5.5
MU_X = 0.0          # μ 所在的 x 坐标（归一化后）
Y_TOP = 3.2          # 第一条区间的 y 坐标
Y_STEP = -0.062      # 每条区间向下偏移
INTERVAL_SCALE = 1.8 # 将区间宽度映射到屏幕单位


REGISTER = [
    {
        "scene": "ConfIntervalScene",
        "id": "ch07-7.4-conf-interval",
        "chapterId": "ch07",
        "sectionId": "7.4",
        "title": "置信区间：捕获真实参数的随机区间",
        "description": "模拟 100 次重复抽样，展示约 95 条置信区间覆盖真实均值 μ（绿色），约 5 条不覆盖（红色），直观说明置信度是频率概念而非概率。",
    },
]


def _generate_intervals(n: int = 100, mu: float = TRUE_MU, half_width_base: float = 0.7):
    """生成 n 条置信区间，模拟 95% 置信水平。

    每条区间：中心 = mu + 小扰动，半宽 = half_width_base + 微小随机量。
    大约 5% 的区间不包含 mu。
    """
    random.seed(42)
    intervals = []
    forced_miss_indices = {12, 35, 57, 73, 91}  # 固定 5 条红色
    for i in range(n):
        hw = half_width_base + random.uniform(-0.15, 0.15)
        if i in forced_miss_indices:
            # 强制不覆盖：把中心偏移到区间外
            shift = (hw + random.uniform(0.05, 0.25)) * random.choice([-1, 1])
            center = mu + shift
        else:
            center = mu + random.uniform(-hw * 0.6, hw * 0.6)
        lo = center - hw
        hi = center + hw
        covers = lo <= mu <= hi
        intervals.append((lo, hi, covers))
    return intervals


class ConfIntervalScene(Scene):
    def construct(self):
        # ── 第一幕：标题 ──────────────────────────────────────────────
        title = Text("区间估计与置信区间", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        subtitle = Text("重复抽样 100 次，每次构造一个 95% 置信区间", font=CJK).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(0.8)
        self.play(FadeOut(subtitle))

        # ── 第二幕：公式说明 ──────────────────────────────────────────
        formula_label = Text("置信区间公式：", font=CJK).scale(0.48)
        formula = MathTex(
            r"\bar{X} \pm z_{\alpha/2} \frac{\sigma}{\sqrt{n}}"
        ).scale(0.9)
        formula_group = VGroup(formula_label, formula).arrange(RIGHT, buff=0.25)
        formula_group.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(formula_group))
        self.wait(1.0)
        self.play(FadeOut(formula_group))

        # ── 第三幕：竖直 μ 线 + 坐标轴说明 ──────────────────────────
        mu_line = DashedLine(
            start=[MU_X, Y_TOP + 0.3, 0],
            end=[MU_X, Y_TOP + 100 * Y_STEP - 0.3, 0],
            color=YELLOW,
            stroke_width=2,
            dash_length=0.12,
        )
        mu_label = MathTex(r"\mu = 2", color=YELLOW).scale(0.65)
        mu_label.next_to([MU_X, Y_TOP + 0.3, 0], UP, buff=0.1)

        self.play(FadeIn(mu_line), FadeIn(mu_label))
        self.wait(0.4)

        # ── 第四幕：逐批显示 100 条置信区间 ──────────────────────────
        intervals = _generate_intervals(100)

        green_count = 0
        red_count = 0

        # 右上角计数器
        counter_label = Text("已覆盖：", font=CJK).scale(0.42).to_corner(RIGHT + UP, buff=0.55)
        counter_num = Text("0 / 0", font=CJK, color=GREEN).scale(0.42)
        counter_num.next_to(counter_label, RIGHT, buff=0.1)
        counter_group = VGroup(counter_label, counter_num)
        self.play(FadeIn(counter_group))

        all_segs: list = []

        BATCH = 10  # 每批显示 10 条

        for batch_start in range(0, 100, BATCH):
            batch_segs = VGroup()
            for k in range(batch_start, min(batch_start + BATCH, 100)):
                lo, hi, covers = intervals[k]
                y = Y_TOP + k * Y_STEP
                x_lo = MU_X + (lo - TRUE_MU) * INTERVAL_SCALE
                x_hi = MU_X + (hi - TRUE_MU) * INTERVAL_SCALE
                # 裁剪到屏幕范围
                x_lo = max(AXIS_X_LEFT, x_lo)
                x_hi = min(AXIS_X_RIGHT, x_hi)
                color = GREEN if covers else RED
                seg = Line(
                    start=[x_lo, y, 0],
                    end=[x_hi, y, 0],
                    color=color,
                    stroke_width=1.8,
                )
                batch_segs.add(seg)
                all_segs.append(seg)
                if covers:
                    green_count += 1
                else:
                    red_count += 1

            total_so_far = batch_start + BATCH
            self.play(AnimationGroup(*[FadeIn(s) for s in batch_segs], lag_ratio=0.05), run_time=0.6)

            # 更新计数器
            new_num = Text(
                f"{green_count} / {total_so_far}",
                font=CJK,
                color=GREEN,
            ).scale(0.42)
            new_num.next_to(counter_label, RIGHT, buff=0.1)
            self.remove(counter_num)
            counter_num = new_num
            self.add(counter_num)
            self.wait(0.1)

        self.wait(0.6)

        # ── 第五幕：高亮红色区间 + 最终统计 ──────────────────────────
        red_segs = VGroup(*[s for (_, _, covers), s in zip(intervals, all_segs) if not covers])
        self.play(red_segs.animate.set_stroke(width=3.5), run_time=0.5)
        self.wait(0.4)

        # 最终统计文字
        stat_line1 = Text(
            f"{green_count} / 100  条区间覆盖了真实均值 ",
            font=CJK,
            color=GREEN,
        ).scale(0.46)
        stat_mu = MathTex(r"\mu", color=YELLOW).scale(0.7)
        stat_row1 = VGroup(stat_line1, stat_mu).arrange(RIGHT, buff=0.08)

        stat_line2 = Text(
            f"{red_count} / 100  条未覆盖（红色）",
            font=CJK,
            color=RED,
        ).scale(0.46)

        stat_group = VGroup(stat_row1, stat_line2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        stat_group.to_edge(DOWN, buff=0.55)

        self.play(FadeIn(stat_group))
        self.wait(1.2)

        # ── 第六幕：核心结论 ─────────────────────────────────────────
        insight_text = Text(
            "95% 置信度 = 长期频率，不是单次区间含 μ 的概率",
            font=CJK,
            color=YELLOW,
        ).scale(0.44)
        insight_text.to_edge(DOWN, buff=0.18)

        self.play(FadeOut(stat_group), FadeIn(insight_text))
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, mu_line, mu_label, counter_label, counter_num, insight_text)))
        self.wait(0.3)
