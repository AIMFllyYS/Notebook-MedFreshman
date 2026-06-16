"""第 4.3 节 · 协方差与相关系数 —— 散点云动画直观展示相关性方向与强度。

中文文字用 Text（依赖系统 CJK 字体，如 Microsoft YaHei）；
数学符号用 MathTex（依赖 LaTeX，如 MiKTeX）。
"""
import random
import math

from manim import (
    BLUE,
    BLUE_D,
    BOLD,
    DOWN,
    GREEN,
    LEFT,
    ORANGE,
    ORIGIN,
    RED,
    RIGHT,
    UP,
    WHITE,
    YELLOW,
    Axes,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    AnimationGroup,
    ReplacementTransform,
    Line,
    DashedLine,
)

CJK = "Microsoft YaHei"

# ── 生成二维正态散点 (rho 控制相关系数) ──────────────────────────────────
def bivariate_normal_dots(rho: float, n: int = 80, seed: int = 42):
    """返回 [(x, y), ...] 服从相关系数 rho 的标准二维正态分布。"""
    rng = random.Random(seed)
    pts = []
    for _ in range(n):
        # Box-Muller 生成独立标准正态
        u1 = rng.random() or 1e-12
        u2 = rng.random() or 1e-12
        z1 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        z2 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)
        # 线性组合得到相关系数 rho
        x = z1
        y = rho * z1 + math.sqrt(max(1 - rho * rho, 0)) * z2
        pts.append((x, y))
    return pts


def bivariate_to_screen(pts, cx, cy, scale=0.55):
    """将数据坐标转为屏幕坐标（以 cx, cy 为中心）。"""
    return [(cx + x * scale, cy + y * scale, 0) for x, y in pts]


# ── 主场景 ───────────────────────────────────────────────────────────────
class CovScene(Scene):
    def construct(self):
        # ── 预编译所有 MathTex（避免中途 DVI 文件锁导致 dvisvgm 读取失败）──
        _pre_cov_summary1 = MathTex(r"\mathrm{Cov}(X,Y)=E[(X-\mu_X)(Y-\mu_Y)]")
        _pre_cov_summary2 = MathTex(r"\rho_{XY} = \mathrm{Cov}(X,Y)/(\sigma_X \sigma_Y) \in [-1,1]")
        # 上面两行在 construct() 开头运行，触发 latex→dvi→svg 编译并缓存，
        # 后续场景中使用这些公式时直接从缓存读取，不再重新编译。

        # ── 0. 标题 ─────────────────────────────────────────────────────
        title = Text("协方差与相关系数", font=CJK, weight=BOLD).scale(0.65).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # ── 1. 定义展示 ──────────────────────────────────────────────────
        def_label = Text("定义：", font=CJK).scale(0.5).to_edge(LEFT).shift(UP * 1.8)
        cov_tex = MathTex(
            r"\mathrm{Cov}(X,Y) = E[(X - \mu_X)(Y - \mu_Y)]"
        ).scale(0.7).next_to(def_label, RIGHT, buff=0.15)

        rho_label = Text("相关系数：", font=CJK).scale(0.5).next_to(def_label, DOWN, buff=0.35).align_to(def_label, LEFT)
        rho_tex = MathTex(
            r"\rho_{XY} = \frac{\mathrm{Cov}(X,Y)}{\sigma_X \sigma_Y} \in [-1,1]"
        ).scale(0.7).next_to(rho_label, RIGHT, buff=0.15)

        self.play(FadeIn(def_label), Write(cov_tex))
        self.wait(0.4)
        self.play(FadeIn(rho_label), Write(rho_tex))
        self.wait(0.8)
        self.play(FadeOut(VGroup(def_label, cov_tex, rho_label, rho_tex)))

        # ── 2. 散点云随 ρ 变化 ──────────────────────────────────────────
        section_title = Text("散点云与相关系数 rho 的关系", font=CJK).scale(0.5)
        section_title.next_to(title, DOWN, buff=0.18)
        self.play(FadeIn(section_title))

        # 坐标轴（左侧）
        ax_left = Axes(
            x_range=[-3.2, 3.2, 1],
            y_range=[-3.2, 3.2, 1],
            x_length=4.5,
            y_length=4.5,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": False,
                         "include_numbers": False},
        ).shift(LEFT * 0.2 + DOWN * 0.3)

        x_lbl = Text("X", font=CJK).scale(0.4).next_to(ax_left.x_axis.get_right(), RIGHT, buff=0.08)
        y_lbl = Text("Y", font=CJK).scale(0.4).next_to(ax_left.y_axis.get_top(), UP, buff=0.08)
        self.play(Create(ax_left), FadeIn(x_lbl), FadeIn(y_lbl))

        # ρ 数值显示（用 Text 避免 DecimalNumber 内部调用 MathTex/LaTeX）
        rho_label = Text("rho = -0.90", font=CJK, color=YELLOW).scale(0.55)
        rho_label.to_edge(RIGHT).shift(UP * 1.5 + LEFT * 0.5)
        self.play(FadeIn(rho_label))

        # 文字提示区域（右侧）
        hint_neg = Text("负相关\n一增一减", font=CJK).scale(0.42).to_edge(RIGHT).shift(UP * 0.3 + LEFT * 0.3)
        hint_zero = Text("不相关\n椭圆变圆", font=CJK).scale(0.42).to_edge(RIGHT).shift(UP * 0.3 + LEFT * 0.3)
        hint_pos = Text("正相关\n同向变化", font=CJK).scale(0.42).to_edge(RIGHT).shift(UP * 0.3 + LEFT * 0.3)

        # 辅助：在坐标轴上绘制散点
        def make_dots(rho_val_num: float, color=BLUE, alpha=0.75):
            pts = bivariate_normal_dots(rho_val_num, n=80, seed=7)
            origin = ax_left.get_center()
            dots = VGroup()
            for x, y in pts:
                sx = origin[0] + x * 0.65
                sy = origin[1] + y * 0.65
                d = Dot(point=[sx, sy, 0], radius=0.05, color=color)
                d.set_opacity(alpha)
                dots.add(d)
            return dots

        # 初始散点 rho = -0.9
        dots_cur = make_dots(-0.9, color=BLUE)
        hint_cur = hint_neg.copy()
        self.play(FadeIn(dots_cur, lag_ratio=0.02), FadeIn(hint_cur))
        self.wait(0.8)

        # 动画：-0.9 → 0 → 0.9（三个快照，逐一切换）
        rho_steps = [(-0.9, "rho = -0.90", hint_neg, BLUE),
                     (0.0,  "rho =  0.00", hint_zero, GREEN),
                     (0.9,  "rho = +0.90", hint_pos, RED)]

        for i, (rho_num, rho_str, hint_obj, col) in enumerate(rho_steps[1:], start=1):
            dots_new = make_dots(rho_num, color=col)
            hint_new = hint_obj.copy()
            rho_new = Text(rho_str, font=CJK, color=YELLOW).scale(0.55)
            rho_new.to_edge(RIGHT).shift(UP * 1.5 + LEFT * 0.5)
            self.play(
                ReplacementTransform(dots_cur, dots_new),
                ReplacementTransform(hint_cur, hint_new),
                ReplacementTransform(rho_label, rho_new),
                run_time=1.1,
            )
            rho_label = rho_new
            dots_cur = dots_new
            hint_cur = hint_new
            self.wait(0.7)

        self.play(FadeOut(VGroup(dots_cur, hint_cur, ax_left, x_lbl, y_lbl,
                                 rho_label, section_title)))
        self.wait(0.2)

        # ── 3. 高亮：三个典型 ρ 横排对比 ──────────────────────────────
        compare_title = Text("三种相关性对比", font=CJK).scale(0.5).next_to(title, DOWN, buff=0.18)
        self.play(FadeIn(compare_title))

        positions_3 = [LEFT * 4.2, ORIGIN, RIGHT * 4.2]
        rho_vals_3 = [-0.9, 0.0, 0.9]
        colors_3 = [RED, GREEN, BLUE]
        labels_3 = [
            Text("rho = -0.9", font=CJK).scale(0.38),
            Text("rho = 0", font=CJK).scale(0.38),
            Text("rho = +0.9", font=CJK).scale(0.38),
        ]

        all_panels = VGroup()
        for pos, rv, col, lbl in zip(positions_3, rho_vals_3, colors_3, labels_3):
            pts = bivariate_normal_dots(rv, n=60, seed=17)
            panel = VGroup()
            for x, y in pts:
                sx = pos[0] + x * 0.38
                sy = pos[1] + y * 0.38 - 0.2
                panel.add(Dot(point=[sx, sy, 0], radius=0.04, color=col).set_opacity(0.8))
            lbl.move_to(pos + DOWN * 1.8)
            all_panels.add(panel, lbl)

        self.play(FadeIn(all_panels, lag_ratio=0.05))
        self.wait(1.2)
        self.play(FadeOut(VGroup(all_panels, compare_title)))
        self.wait(0.2)

        # ── 4. 不相关 ≠ 独立（X~U(-1,1), Y=X²） ────────────────────────
        indep_title = Text("注意：不相关不等于独立", font=CJK, color=YELLOW).scale(0.5)
        indep_title.next_to(title, DOWN, buff=0.18)
        self.play(FadeIn(indep_title))

        # 展示公式
        formula_x = MathTex(r"X \sim U(-1,1),\quad Y = X^2").scale(0.65).shift(UP * 1.5)
        formula_cov = MathTex(r"\mathrm{Cov}(X,Y) = E[X \cdot X^2] - E[X]E[X^2] = 0").scale(0.6).shift(UP * 0.7)
        self.play(Write(formula_x))
        self.wait(0.4)
        self.play(Write(formula_cov))
        self.wait(0.5)

        cov_zero_label = Text("Cov = 0，但 Y 完全由 X 决定！", font=CJK, color=ORANGE).scale(0.48)
        cov_zero_label.shift(UP * 0.0)
        self.play(FadeIn(cov_zero_label))
        self.wait(0.5)

        # 绘制抛物线散点云
        ax2 = Axes(
            x_range=[-1.2, 1.2, 0.5],
            y_range=[-0.1, 1.3, 0.5],
            x_length=3.8,
            y_length=2.5,
            axis_config={"color": WHITE, "stroke_width": 1.5, "include_tip": False,
                         "include_numbers": False},
        ).shift(DOWN * 1.6)

        x_lbl2 = Text("X", font=CJK).scale(0.38).next_to(ax2.x_axis.get_right(), RIGHT, buff=0.08)
        y_lbl2 = MathTex(r"Y=X^2").scale(0.45).next_to(ax2.y_axis.get_top(), RIGHT, buff=0.08)

        # 散点：均匀采样 x in [-1,1], y = x^2
        rng2 = random.Random(99)
        parab_dots = VGroup()
        for _ in range(70):
            xi = rng2.uniform(-1.0, 1.0)
            yi = xi ** 2
            sp = ax2.coords_to_point(xi, yi)
            parab_dots.add(Dot(point=sp, radius=0.045, color=ORANGE).set_opacity(0.85))

        self.play(Create(ax2), FadeIn(x_lbl2), FadeIn(y_lbl2))
        self.play(FadeIn(parab_dots, lag_ratio=0.03))

        not_indep_label = Text("Cov=0，散点却是抛物线，X 与 Y 并非独立", font=CJK, color=YELLOW).scale(0.4)
        not_indep_label.next_to(ax2, DOWN, buff=0.25)
        self.play(Write(not_indep_label))
        self.wait(1.5)

        # ── 5. 小结 ──────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(
            formula_x, formula_cov, cov_zero_label,
            ax2, x_lbl2, y_lbl2, parab_dots, not_indep_label, indep_title
        )))

        summary_title = Text("本节小结", font=CJK, weight=BOLD).scale(0.55).next_to(title, DOWN, buff=0.25)
        self.play(FadeIn(summary_title))

        items = [
            r"\mathrm{Cov}(X,Y)=E[(X-\mu_X)(Y-\mu_Y)]",
            r"\rho_{XY} = \mathrm{Cov}(X,Y)/(\sigma_X \sigma_Y) \in [-1,1]",
        ]
        item_texts = [
            Text("衡量两变量线性相关的方向与强度", font=CJK).scale(0.44),
            Text("rho=+-1 完全线性相关，rho=0 线性不相关", font=CJK).scale(0.44),
            Text("不相关（Cov=0）并不意味着独立", font=CJK, color=YELLOW).scale(0.44),
        ]
        formula_lines = [MathTex(r).scale(0.6) for r in items]

        group_lines = VGroup()
        y_start = 1.0
        for idx, (fml, txt) in enumerate(zip(formula_lines, item_texts)):
            fml.move_to([0, y_start - idx * 0.85, 0])
            txt.next_to(fml, DOWN, buff=0.1)
            group_lines.add(fml, txt)

        extra_note = item_texts[2].copy().move_to([0, y_start - 2 * 0.85, 0])
        group_lines.add(extra_note)

        self.play(FadeIn(group_lines, lag_ratio=0.12))
        self.wait(2.0)

        self.play(FadeOut(VGroup(summary_title, group_lines, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "CovScene",
        "id": "ch04-4.3-covariance",
        "chapterId": "ch04",
        "sectionId": "4.3",
        "title": "协方差与相关系数",
        "description": "通过散点云动画展示相关系数 rho 从 -0.9 到 +0.9 的变化，并以 Y=X^2 反例说明不相关不等于独立。",
    },
]
