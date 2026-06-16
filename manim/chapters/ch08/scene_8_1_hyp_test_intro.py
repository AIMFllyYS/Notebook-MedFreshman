"""第 8.1 节 · 假设检验的基本思想 —— 类比法庭判决，展示小概率反证法与拒绝域逻辑。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GRAY,
    GREEN,
    LEFT,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Rectangle,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    Arrow,
    Line,
)
import numpy as np

CJK = "Microsoft YaHei"


def normal_pdf(x):
    return np.exp(-0.5 * x**2) / np.sqrt(2 * np.pi)


class HypTestIntroScene(Scene):
    def construct(self):
        # ── 幕 1：标题与法庭类比 ──────────────────────────────────────────
        title = Text("假设检验：小概率反证法", font=CJK, weight=BOLD).scale(0.72).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # 法庭类比说明
        analogy_lines = VGroup(
            Text("法庭原则：无罪推定", font=CJK, color=BLUE).scale(0.52),
            Text("统计原则：先假设 H0 成立", font=CJK, color=BLUE).scale(0.52),
        ).arrange(DOWN, buff=0.25).shift(UP * 1.2)

        arrow_mid = Arrow(
            analogy_lines[0].get_right() + RIGHT * 0.1,
            analogy_lines[0].get_right() + RIGHT * 0.1,
            buff=0,
        )

        h0_formula = MathTex(r"H_0: \mu = \mu_0").scale(0.85).shift(UP * 1.2 + RIGHT * 2.5)

        self.play(FadeIn(analogy_lines[0]))
        self.wait(0.4)
        self.play(FadeIn(analogy_lines[1]), FadeIn(h0_formula))
        self.wait(0.5)

        analogy2_lines = VGroup(
            Text("发现压倒性证据 → 推翻无罪推定", font=CJK, color=RED).scale(0.48),
            Text("观测到小概率事件 → 拒绝 H0", font=CJK, color=RED).scale(0.48),
        ).arrange(DOWN, buff=0.25).shift(DOWN * 0.1)

        self.play(FadeIn(analogy2_lines))
        self.wait(1.0)

        self.play(FadeOut(VGroup(analogy_lines, h0_formula, analogy2_lines)))
        self.wait(0.2)

        # ── 幕 2：标准正态分布 + 右侧拒绝域（α=0.05）──────────────────────
        axes = Axes(
            x_range=[-3.8, 3.8, 1],
            y_range=[0, 0.46, 0.1],
            x_length=9,
            y_length=3.5,
            axis_config={"color": GRAY, "include_tip": False, "stroke_width": 1.5},
        ).shift(DOWN * 0.8)

        # 正态曲线（用 axes.plot）
        curve = axes.plot(normal_pdf, x_range=[-3.8, 3.8], color=BLUE, stroke_width=2.5)

        axis_label_x = MathTex(r"z").scale(0.7).next_to(axes.x_axis, RIGHT, buff=0.15)
        axis_label_y = MathTex(r"f(z)").scale(0.6).next_to(axes.y_axis, UP, buff=0.1)

        dist_title = Text("标准正态分布 N(0,1)", font=CJK).scale(0.52).next_to(axes, UP, buff=0.15)

        self.play(Create(axes), Create(curve), FadeIn(axis_label_x), FadeIn(axis_label_y))
        self.play(Write(dist_title))
        self.wait(0.4)

        # 右侧拒绝域：z > 1.645（α=0.05 单侧）
        z_crit = 1.645
        reject_region = axes.get_area(
            curve,
            x_range=[z_crit, 3.8],
            color=RED,
            opacity=0.45,
        )

        crit_line = DashedLine(
            axes.c2p(z_crit, 0),
            axes.c2p(z_crit, normal_pdf(z_crit)),
            color=YELLOW,
            stroke_width=2,
        )
        crit_label = MathTex(r"z_{0.05}=1.645").scale(0.6).next_to(
            axes.c2p(z_crit, 0), DOWN, buff=0.15
        )

        alpha_label = MathTex(r"\alpha = 0.05").scale(0.65).set_color(RED)
        alpha_label.move_to(axes.c2p(2.6, 0.06))

        reject_text = Text("拒绝域", font=CJK, color=RED).scale(0.48).move_to(axes.c2p(2.6, 0.14))
        accept_text = Text("接受域", font=CJK, color=GREEN).scale(0.48).move_to(axes.c2p(-0.5, 0.25))

        self.play(Create(reject_region), Create(crit_line), FadeIn(crit_label))
        self.play(FadeIn(alpha_label), FadeIn(reject_text), FadeIn(accept_text))
        self.wait(0.5)

        # ── 幕 3：观测值 z=2.1 落入拒绝域 → 拒绝 H0 ──────────────────────
        z_obs1 = 2.1
        dot1 = Dot(point=axes.c2p(z_obs1, 0), color=RED, radius=0.12)
        z1_label = MathTex(r"z=2.1").scale(0.62).set_color(RED).next_to(dot1, UP, buff=0.18)

        decision1 = Text("落入拒绝域 → 拒绝 H0", font=CJK, color=RED).scale(0.52)
        decision1.to_edge(DOWN, buff=0.25)

        self.play(FadeIn(dot1), Write(z1_label))
        self.wait(0.3)
        self.play(Write(decision1))
        self.wait(1.0)

        # ── 幕 4：观测值 z=0.8 落在接受域 → 不拒绝 H0 ───────────────────
        z_obs2 = 0.8
        dot2 = Dot(point=axes.c2p(z_obs2, 0), color=GREEN, radius=0.12)
        z2_label = MathTex(r"z=0.8").scale(0.62).set_color(GREEN).next_to(dot2, UP, buff=0.18)

        decision2 = Text("落在接受域 → 不拒绝 H0", font=CJK, color=GREEN).scale(0.52)
        decision2.to_edge(DOWN, buff=0.25)

        self.play(FadeOut(dot1), FadeOut(z1_label), FadeOut(decision1))
        self.play(FadeIn(dot2), Write(z2_label))
        self.wait(0.3)
        self.play(Write(decision2))
        self.wait(0.8)

        # 强调：不拒绝 ≠ 接受
        note = Text("注意：不拒绝 H0  不等于  接受 H0", font=CJK, color=YELLOW).scale(0.5)
        note.next_to(decision2, UP, buff=0.2)
        self.play(FadeIn(note))
        self.wait(1.2)

        self.play(FadeOut(VGroup(dot2, z2_label, decision2, note)))
        self.wait(0.2)

        # ── 幕 5：三种拒绝域示意（左尾、右尾、双尾）──────────────────────
        self.play(
            FadeOut(VGroup(
                reject_region, crit_line, crit_label,
                alpha_label, reject_text, accept_text,
                dist_title, axes, curve, axis_label_x, axis_label_y,
            ))
        )

        tail_title = Text("三种拒绝域", font=CJK, weight=BOLD).scale(0.62).to_edge(UP).shift(DOWN * 0.1)
        self.play(Transform(title, tail_title))
        self.wait(0.2)

        def make_mini_plot(shift_vec, label_text, shade_ranges, crit_vals):
            """在 shift_vec 位置绘制小号分布 + 高亮拒绝域。"""
            ax = Axes(
                x_range=[-3.5, 3.5, 1],
                y_range=[0, 0.45, 0.2],
                x_length=3.8,
                y_length=2.0,
                axis_config={"color": GRAY, "include_tip": False, "stroke_width": 1},
            ).shift(shift_vec)
            c = ax.plot(normal_pdf, x_range=[-3.5, 3.5], color=BLUE, stroke_width=2)
            areas = VGroup()
            for xr in shade_ranges:
                a = ax.get_area(c, x_range=xr, color=RED, opacity=0.5)
                areas.add(a)
            dlines = VGroup()
            for cv in crit_vals:
                dl = DashedLine(
                    ax.c2p(cv, 0),
                    ax.c2p(cv, normal_pdf(cv) * 1.05),
                    color=YELLOW,
                    stroke_width=1.5,
                )
                dlines.add(dl)
            lbl = Text(label_text, font=CJK, color=WHITE).scale(0.42).next_to(ax, DOWN, buff=0.12)
            return VGroup(ax, c, areas, dlines, lbl)

        left_plot = make_mini_plot(
            LEFT * 4 + DOWN * 0.6,
            "左尾检验",
            [[-3.5, -1.645]],
            [-1.645],
        )
        right_plot = make_mini_plot(
            DOWN * 0.6,
            "右尾检验",
            [[1.645, 3.5]],
            [1.645],
        )
        two_plot = make_mini_plot(
            RIGHT * 4 + DOWN * 0.6,
            "双尾检验",
            [[-3.5, -1.96], [1.96, 3.5]],
            [-1.96, 1.96],
        )

        self.play(FadeIn(left_plot), FadeIn(right_plot), FadeIn(two_plot))
        self.wait(0.5)

        # 标注临界值
        lc = MathTex(r"z_{0.05}=-1.645").scale(0.38).set_color(YELLOW)
        lc.next_to(left_plot, UP, buff=0.05)
        rc = MathTex(r"z_{0.05}=1.645").scale(0.38).set_color(YELLOW)
        rc.next_to(right_plot, UP, buff=0.05)
        tc = MathTex(r"z_{0.025}=\pm1.96").scale(0.38).set_color(YELLOW)
        tc.next_to(two_plot, UP, buff=0.05)

        self.play(FadeIn(lc), FadeIn(rc), FadeIn(tc))
        self.wait(1.5)

        # ── 幕 6：核心口诀收尾 ──────────────────────────────────────────
        self.play(
            FadeOut(VGroup(left_plot, right_plot, two_plot, lc, rc, tc))
        )

        summary_lines = VGroup(
            Text("小概率事件在一次试验中不应发生", font=CJK, color=BLUE).scale(0.54),
            Text("若它发生了，则质疑原假设 H0", font=CJK, color=RED).scale(0.54),
            Text("这就是假设检验的反证思想", font=CJK, color=YELLOW).scale(0.54),
        ).arrange(DOWN, buff=0.4).shift(DOWN * 0.3)

        for line in summary_lines:
            self.play(FadeIn(line))
            self.wait(0.5)

        self.wait(1.5)
        self.play(FadeOut(VGroup(title, summary_lines)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "HypTestIntroScene",
        "id": "ch08-8.1-hyp-test-intro",
        "chapterId": "ch08",
        "sectionId": "8.1",
        "title": "假设检验：小概率反证法",
        "description": "通过法庭类比与标准正态分布拒绝域动画，直观展示假设检验的小概率反证思想及三种拒绝域形式。",
    },
]
