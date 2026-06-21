"""第 13.2 节 · 放射性衰变指数定律

可视化方案：
  Step 1  粒子模拟 — 100 个发光点随时间随机消失（衰变）
  Step 2  坐标系 + 指数曲线 N = N₀e^{-λt}，ValueTracker 控制 λ，
          半衰期竖线实时跟随
  Step 3  三条曲线对比（快 / 中 / 慢衰变），不同颜色
  Step 4  半对数坐标：指数曲线变直线，斜率 = -λ
  Step 5  小结卡

铁律：MathTex 内只有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch13Kp3RadioactiveDecayLaw",
        "id": "phys-ch13-13.2-kp3-radioactive-decay-law",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "放射性衰变指数定律",
        "description": "粒子模拟 + Axes 绘制 N=N₀e^{-λt}，ValueTracker 扫动 λ 演示半衰期变化，三曲线对比，半对数坐标变直线。",
    },
]


class Ch13Kp3RadioactiveDecayLaw(Scene):
    def construct(self):
        # ────────────────────────────────────────────────────────────────
        # Step 1  标题
        # ────────────────────────────────────────────────────────────────
        title = Text("放射性衰变指数定律", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第十三章 原子核和放射性 · 13.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ────────────────────────────────────────────────────────────────
        # Step 2  生活类比
        # ────────────────────────────────────────────────────────────────
        ana1 = Text("想象桌上有一大把骰子，每次掷出 6 点的就「死亡」被拿走——", font=CJK).scale(0.46)
        ana2 = Text("剩下的骰子越来越少，但每颗骰子的死亡概率始终不变。", font=CJK).scale(0.46)
        ana3 = Text("放射性原子核的衰变正是如此：每个核独立、随机衰变，", font=CJK).scale(0.46)
        ana4 = Text("整体数量随时间按指数规律减少。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3, ana4]:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ────────────────────────────────────────────────────────────────
        # Step 3  粒子模拟场景
        # ────────────────────────────────────────────────────────────────
        sim_title = Text("粒子衰变模拟", font=CJK, color=CYAN).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sim_title))

        # 在左半区域布置 100 个粒子
        np.random.seed(42)
        N_total = 100
        # 粒子坐标在 [-5.5, -0.3] x [-2.5, 2.5] 区域
        xs = np.random.uniform(-5.5, -0.5, N_total)
        ys = np.random.uniform(-2.5, 2.5, N_total)
        lam_sim = 0.4  # 模拟衰变常数（用于控制批次消失）

        dots = VGroup(*[
            Dot(point=[xs[i], ys[i], 0], radius=0.07, color=YELLOW).set_opacity(0.85)
            for i in range(N_total)
        ])
        self.play(FadeIn(dots, lag_ratio=0.015), run_time=1.5)
        self.wait(0.5)

        # 粒子计数标签
        count_label_zh = Text("剩余核数：", font=CJK, color=WHITE).scale(0.42)
        count_num = Text("100", font=CJK, color=YELLOW).scale(0.42)
        count_group = VGroup(count_label_zh, count_num).arrange(RIGHT, buff=0.1)
        count_group.to_edge(RIGHT, buff=0.6).shift(DOWN * 0.5)
        self.play(FadeIn(count_group))

        # 分 5 批消失，模拟 λ≈0.4 s⁻¹ 的衰变
        remaining = list(range(N_total))
        np.random.shuffle(remaining)
        # 每批消失比例：~33%, 25%, 20%, 17%, 14%（近似指数）
        batch_sizes = [33, 20, 15, 12, 10]
        counts = [N_total]
        idx = 0
        for b_size in batch_sizes:
            b_size = min(b_size, len(remaining))
            if b_size == 0:
                break
            batch_indices = remaining[idx: idx + b_size]
            idx += b_size
            fade_anims = [FadeOut(dots[i], shift=np.array([
                np.random.choice([-1, 1]) * np.random.uniform(0.5, 2.0),
                np.random.uniform(-1.5, 1.5),
                0,
            ])) for i in batch_indices]
            self.play(*fade_anims, run_time=0.8)
            new_count = counts[-1] - b_size
            counts.append(new_count)
            new_num = Text(str(new_count), font=CJK, color=YELLOW).scale(0.42)
            new_num.move_to(count_num.get_center())
            self.play(Transform(count_num, new_num), run_time=0.3)
            self.wait(0.4)

        sim_note = Text("每个原子核独立衰变，整体数量呈指数下降", font=CJK, color=GREEN).scale(0.42)
        sim_note.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(sim_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(dots, count_group, sim_note, sim_title)))

        # ────────────────────────────────────────────────────────────────
        # Step 4  公式定义（逐步出现）
        # ────────────────────────────────────────────────────────────────
        def_title = Text("衰变定律：公式推导", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_title))

        eq1 = MathTex(r"\frac{dN}{dt}", r"=", r"-\lambda N").scale(0.85)
        eq1[0].set_color(CYAN)
        eq1[2].set_color(RED)
        label_eq1 = Text("（核数减少速率 ∝ 现有核数，λ 是衰变常数）", font=CJK, color=WHITE).scale(0.38)
        g1 = VGroup(eq1, label_eq1).arrange(DOWN, buff=0.18).next_to(def_title, DOWN, buff=0.45)
        self.play(Write(eq1))
        self.play(FadeIn(label_eq1))
        self.wait(1.5)

        eq2 = MathTex(r"N(t)", r"=", r"N_0\,e^{-\lambda t}").scale(0.85)
        eq2[0].set_color(YELLOW)
        eq2[2].set_color(YELLOW)
        label_eq2 = Text("（分离变量积分得指数衰减律）", font=CJK, color=WHITE).scale(0.38)
        g2 = VGroup(eq2, label_eq2).arrange(DOWN, buff=0.18).next_to(g1, DOWN, buff=0.35)
        self.play(Write(eq2))
        self.play(FadeIn(label_eq2))
        self.wait(1.2)

        eq3 = MathTex(r"T_{1/2}", r"=", r"\frac{\ln 2}{\lambda}", r"=", r"\frac{0.693}{\lambda}").scale(0.85)
        eq3[0].set_color(GREEN)
        eq3[2].set_color(GREEN)
        eq3[4].set_color(GREEN)
        label_eq3 = Text("（半衰期：核数减少到一半所需时间）", font=CJK, color=WHITE).scale(0.38)
        g3 = VGroup(eq3, label_eq3).arrange(DOWN, buff=0.18).next_to(g2, DOWN, buff=0.35)
        self.play(Write(eq3))
        self.play(FadeIn(label_eq3))
        self.wait(2.0)
        self.play(FadeOut(VGroup(def_title, g1, g2, g3)))

        # ────────────────────────────────────────────────────────────────
        # Step 5  指数曲线 + ValueTracker（λ 从 0.1 → 1.0）
        # ────────────────────────────────────────────────────────────────
        curve_title = Text("调节 λ，观察曲线与半衰期的变化", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(curve_title))

        axes = Axes(
            x_range=[0, 8, 1],
            y_range=[0, 1.1, 0.2],
            x_length=7.5,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0, 2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [0.2, 0.4, 0.6, 0.8, 1.0]},
        ).shift(DOWN * 0.6 + LEFT * 0.5)

        x_lbl = MathTex(r"t\ \mathrm{(s)}").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl_zh = Text("N/N", font=CJK).scale(0.35)
        y_lbl_sub = MathTex(r"_0").scale(0.35)
        y_lbl = VGroup(y_lbl_zh, y_lbl_sub).arrange(RIGHT, buff=0.02)
        y_lbl.next_to(axes.y_axis.get_end(), LEFT, buff=0.15)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        lam = ValueTracker(0.3)

        curve = always_redraw(
            lambda: axes.plot(
                lambda x: math.exp(-lam.get_value() * x),
                x_range=[0, 8],
                color=YELLOW,
                stroke_width=3,
            )
        )

        # 半衰期竖线
        half_line = always_redraw(
            lambda: DashedLine(
                start=axes.c2p(math.log(2) / lam.get_value(), 0),
                end=axes.c2p(math.log(2) / lam.get_value(), 0.5),
                color=GREEN,
                stroke_width=2,
            )
        )
        half_dot = always_redraw(
            lambda: Dot(
                axes.c2p(math.log(2) / lam.get_value(), 0.5),
                color=GREEN,
                radius=0.09,
            )
        )

        # λ 数值标签
        lam_label_zh = Text("λ = ", font=CJK, color=ORANGE).scale(0.44)
        lam_val_tex = always_redraw(
            lambda: MathTex(
                rf"{lam.get_value():.2f}\ \mathrm{{s}}^{{-1}}",
                color=ORANGE,
            ).scale(0.50).next_to(lam_label_zh, RIGHT, buff=0.08)
        )
        lam_display = VGroup(lam_label_zh).to_edge(RIGHT, buff=1.0).shift(UP * 1.5)
        lam_val_tex_static = always_redraw(
            lambda: MathTex(
                rf"{lam.get_value():.2f}\ \mathrm{{s}}^{{-1}}",
                color=ORANGE,
            ).scale(0.50).next_to(lam_display, RIGHT, buff=0.08)
        )

        # 半衰期数值标签
        T_label_zh = Text("T = ", font=CJK, color=GREEN).scale(0.44)
        T_val_tex = always_redraw(
            lambda: MathTex(
                rf"{math.log(2)/lam.get_value():.2f}\ \mathrm{{s}}",
                color=GREEN,
            ).scale(0.50).next_to(T_label_zh, RIGHT, buff=0.08)
        )
        T_display = VGroup(T_label_zh).next_to(lam_display, DOWN, buff=0.4)
        T_val_tex_static = always_redraw(
            lambda: MathTex(
                rf"{math.log(2)/lam.get_value():.2f}\ \mathrm{{s}}",
                color=GREEN,
            ).scale(0.50).next_to(T_display, RIGHT, buff=0.08)
        )

        self.add(lam_display, lam_val_tex_static, T_display, T_val_tex_static)
        self.play(Create(curve), Create(half_line), FadeIn(half_dot))
        self.wait(0.8)

        # 扫动 λ 从 0.3 → 1.0（曲线变陡，半衰期变短）
        note_fast = Text("λ 增大 → 衰变更快 → 半衰期更短", font=CJK, color=ORANGE).scale(0.42).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(note_fast))
        self.play(lam.animate.set_value(1.0), run_time=3.5, rate_func=smooth)
        self.wait(1.0)

        # 扫动 λ 回到 0.1（曲线平缓，半衰期极长）
        note_slow = Text("λ 减小 → 衰变更慢 → 半衰期更长", font=CJK, color=CYAN).scale(0.42).to_edge(DOWN, buff=0.45)
        self.play(Transform(note_fast, note_slow))
        self.play(lam.animate.set_value(0.15), run_time=3.0, rate_func=smooth)
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            axes, x_lbl, y_lbl, curve, half_line, half_dot,
            lam_display, lam_val_tex_static, T_display, T_val_tex_static,
            note_fast, curve_title,
        )))

        # ────────────────────────────────────────────────────────────────
        # Step 6  三条曲线对比（快 / 中 / 慢）
        # ────────────────────────────────────────────────────────────────
        cmp_title = Text("三种衰变速率对比", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(cmp_title))

        axes2 = Axes(
            x_range=[0, 8, 1],
            y_range=[0, 1.1, 0.2],
            x_length=7.5,
            y_length=4.0,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0, 2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [0.2, 0.5, 1.0]},
        ).shift(DOWN * 0.65 + LEFT * 0.5)
        x_lbl2 = MathTex(r"t\ \mathrm{(s)}").scale(0.48).next_to(axes2.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl2 = MathTex(r"N/N_0").scale(0.48).next_to(axes2.y_axis.get_end(), LEFT, buff=0.15)
        self.play(Create(axes2), FadeIn(x_lbl2), FadeIn(y_lbl2))

        params = [
            (0.8, RED, "快衰变"),
            (0.35, YELLOW, "中等衰变"),
            (0.12, GREEN, "慢衰变"),
        ]
        curves2 = []
        legend_items = []
        for lam_val, clr, label_zh in params:
            c = axes2.plot(
                lambda x, l=lam_val: math.exp(-l * x),
                x_range=[0, 8],
                color=clr,
                stroke_width=2.8,
            )
            curves2.append(c)
            # 图例：色线 + 中文标注
            line_seg = Line(LEFT * 0.3, RIGHT * 0.3, color=clr, stroke_width=3)
            lam_tex = MathTex(rf"\lambda={lam_val}", color=clr).scale(0.42)
            zh_text = Text(label_zh, font=CJK, color=clr).scale(0.38)
            item = VGroup(line_seg, lam_tex, zh_text).arrange(RIGHT, buff=0.12)
            legend_items.append(item)

        legend = VGroup(*legend_items).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        legend.to_edge(RIGHT, buff=0.5).shift(UP * 0.5)

        for c, item in zip(curves2, legend_items):
            self.play(Create(c), FadeIn(item), run_time=0.9)
            self.wait(0.4)

        rule_text = Text("λ 越大，衰变越快，半衰期越短", font=CJK, color=YELLOW).scale(0.44)
        rule_text.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(rule_text))
        self.wait(2.0)

        self.play(FadeOut(VGroup(axes2, x_lbl2, y_lbl2, *curves2, legend, rule_text, cmp_title)))

        # ────────────────────────────────────────────────────────────────
        # Step 7  半对数坐标：指数 → 直线
        # ────────────────────────────────────────────────────────────────
        log_title = Text("半对数坐标：指数衰减变为直线", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(log_title))

        # 用普通坐标轴模拟对数 y 轴（显示 ln(N/N₀) = -λt）
        axes3 = Axes(
            x_range=[0, 8, 1],
            y_range=[-3.5, 0.3, 1],
            x_length=7.5,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0, 2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [-3, -2, -1, 0]},
        ).shift(DOWN * 0.65 + LEFT * 0.5)
        x_lbl3 = MathTex(r"t\ \mathrm{(s)}").scale(0.48).next_to(axes3.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl3 = MathTex(r"\ln(N/N_0)").scale(0.48).next_to(axes3.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes3), FadeIn(x_lbl3), FadeIn(y_lbl3))

        log_params = [
            (0.8, RED),
            (0.35, YELLOW),
            (0.12, GREEN),
        ]
        log_curves = []
        for lam_val, clr in log_params:
            lc = axes3.plot(
                lambda x, l=lam_val: -l * x,
                x_range=[0, 8],
                color=clr,
                stroke_width=2.8,
            )
            log_curves.append(lc)
        self.play(*[Create(lc) for lc in log_curves], run_time=1.5)

        # 斜率标注
        slope_eq = MathTex(r"\ln\!\left(\frac{N}{N_0}\right) = -\lambda t").scale(0.72)
        slope_note_zh = Text("斜率 = −λ（直线斜率绝对值即衰变常数）", font=CJK, color=CYAN).scale(0.40)
        slope_box_content = VGroup(slope_eq, slope_note_zh).arrange(DOWN, buff=0.25)
        slope_box_content.to_edge(RIGHT, buff=0.45).shift(UP * 0.8)
        slope_box = SurroundingRectangle(slope_box_content, color=CYAN, buff=0.2, corner_radius=0.1)
        self.play(Write(slope_eq), FadeIn(slope_note_zh), Create(slope_box))
        self.wait(2.0)

        practical_zh = Text("实验中可由此直线斜率直接测量 λ 和 T₁/₂", font=CJK, color=GREEN).scale(0.40)
        practical_zh.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(practical_zh))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            axes3, x_lbl3, y_lbl3, *log_curves,
            slope_eq, slope_note_zh, slope_box, practical_zh, log_title,
        )))

        # ────────────────────────────────────────────────────────────────
        # Step 8  数值例子
        # ────────────────────────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_title))

        ex_q = Text("已知 ²²⁶Ra 的半衰期 T₁/₂ = 1600 年，求衰变常数 λ 和", font=CJK).scale(0.43)
        ex_q2 = Text("经过 3200 年后剩余核数的比例 N/N₀。", font=CJK).scale(0.43)
        eq_group = VGroup(ex_q, ex_q2).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(ex_title, DOWN, buff=0.40)
        self.play(FadeIn(eq_group))
        self.wait(1.0)

        step_a1 = MathTex(r"\lambda = \frac{\ln 2}{T_{1/2}} = \frac{0.693}{1600\ \mathrm{yr}}").scale(0.72)
        step_a1.set_color(YELLOW)
        step_a2 = MathTex(r"\approx 4.33\times10^{-4}\ \mathrm{yr}^{-1}").scale(0.72).set_color(YELLOW)
        step_b = MathTex(r"\frac{N}{N_0} = e^{-\lambda \cdot 3200}").scale(0.72)
        step_b2 = MathTex(r"= e^{-0.693 \times 2} = \frac{1}{4} = 0.25").scale(0.72).set_color(GREEN)
        sol = VGroup(step_a1, step_a2, step_b, step_b2).arrange(DOWN, buff=0.30).next_to(eq_group, DOWN, buff=0.35)
        for s in [step_a1, step_a2, step_b, step_b2]:
            self.play(Write(s))
            self.wait(0.8)

        ex_conclude = Text("经过 2 个半衰期后，剩余 1/4 的原子核。", font=CJK, color=GREEN).scale(0.42)
        ex_conclude.next_to(sol, DOWN, buff=0.28)
        self.play(FadeIn(ex_conclude))
        self.wait(2.0)

        self.play(FadeOut(VGroup(ex_title, eq_group, sol, ex_conclude)))

        # ────────────────────────────────────────────────────────────────
        # Step 9  小结卡
        # ────────────────────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        f1 = MathTex(r"N(t) = N_0\,e^{-\lambda t}", color=YELLOW).scale(0.80)
        f1_zh = Text("指数衰减律", font=CJK, color=YELLOW).scale(0.40)
        row1 = VGroup(f1, f1_zh).arrange(RIGHT, buff=0.5)

        f2 = MathTex(r"N(t) = N_0\!\left(\tfrac{1}{2}\right)^{t/T_{1/2}}", color=YELLOW).scale(0.80)
        f2_zh = Text("半衰期等效形式", font=CJK, color=YELLOW).scale(0.40)
        row2 = VGroup(f2, f2_zh).arrange(RIGHT, buff=0.5)

        f3 = MathTex(r"T_{1/2} = \frac{\ln 2}{\lambda} = \frac{0.693}{\lambda}", color=GREEN).scale(0.80)
        f3_zh = Text("半衰期与λ的关系", font=CJK, color=GREEN).scale(0.40)
        row3 = VGroup(f3, f3_zh).arrange(RIGHT, buff=0.5)

        f4 = MathTex(r"\ln(N/N_0) = -\lambda t", color=CYAN).scale(0.80)
        f4_zh = Text("半对数坐标下为直线", font=CJK, color=CYAN).scale(0.40)
        row4 = VGroup(f4, f4_zh).arrange(RIGHT, buff=0.5)

        summary = VGroup(row1, row2, row3, row4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        for row in [row1, row2, row3, row4]:
            self.play(FadeIn(row))
            self.wait(0.5)
        self.play(Create(box))
        self.wait(2.5)

        final_note = Text("λ 越大，衰变越快，半衰期越短；半对数图斜率绝对值等于 λ。",
                          font=CJK, color=GREEN).scale(0.40)
        final_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(final_note))
        self.wait(2.0)

        self.play(FadeOut(VGroup(title, s_title, summary, box, final_note)))
        self.wait(0.5)
