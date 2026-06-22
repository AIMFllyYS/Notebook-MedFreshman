"""第 5.2 节 · 平均自由程与平均碰撞频率（知识点 KP3）。

可视化三步走：
1. 碰撞管模型 —— 半径 d 圆柱扫过分子数 → 碰撞频率 z
2. ValueTracker 扫描分子数密度 n → 平均自由程 λ 随 n 变化
3. 代入 n = p/(kT) 的两侧对比：p 增大 λ 减小 / T 升高 λ 不变

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch05Kp3MeanFreePathCollisionFrequency(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("平均自由程与平均碰撞频率", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.16)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("想象在拥挤的人群中穿行：", font=CJK).scale(0.48)
        ana2 = Text("人越多、每个人越胖，你走多远就会撞到人（碰撞越频繁）；", font=CJK).scale(0.44)
        ana3 = Text("两次碰撞之间走过的平均距离，就是「平均自由程」。", font=CJK, color=YELLOW).scale(0.44)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        ana_grp.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_grp))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 碰撞管模型 —— 几何动画
        # ══════════════════════════════════════════════════════════════════
        model_label = Text("碰撞管模型", font=CJK, color=BLUE).scale(0.52)
        model_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(model_label))

        # 画布区域：居中偏下
        center_y = -0.6

        # 靶分子（红色，半径 d/2 ≈ 0.25）
        d_vis = 0.25          # 可视半径 d/2
        d_eff = 0.50          # 有效碰撞半径 d（=2×d/2）

        target_pos = np.array([-4.0, center_y, 0.0])
        target = Circle(radius=d_vis, color=RED, fill_color=RED, fill_opacity=0.85)
        target.move_to(target_pos)
        target_lbl = Text("靶分子", font=CJK, color=RED).scale(0.38)
        target_lbl.next_to(target, DOWN, buff=0.12)

        # 有效碰撞圆（虚线，半径 d）
        eff_circle = DashedVMobject(
            Circle(radius=d_eff, color=YELLOW).move_to(target_pos),
            num_dashes=20, dashed_ratio=0.6
        )
        eff_lbl = VGroup(
            Text("有效碰撞半径", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"d", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.08)
        eff_lbl.next_to(eff_circle, UP, buff=0.15)

        self.play(Create(target), FadeIn(target_lbl))
        self.wait(0.5)
        self.play(Create(eff_circle), FadeIn(eff_lbl))
        self.wait(0.8)

        # 场分子（蓝色，散布在右侧区域）
        rng = np.random.default_rng(42)
        field_positions = [
            np.array([-1.8 + rng.uniform(-0.2, 0.2), center_y + rng.uniform(-0.35, 0.35), 0.0]),
            np.array([-0.6 + rng.uniform(-0.2, 0.2), center_y + rng.uniform(-0.35, 0.35), 0.0]),
            np.array([ 0.4 + rng.uniform(-0.2, 0.2), center_y + rng.uniform(-0.35, 0.35), 0.0]),
            np.array([ 1.5 + rng.uniform(-0.2, 0.2), center_y + rng.uniform(-0.35, 0.35), 0.0]),
            np.array([ 2.6 + rng.uniform(-0.2, 0.2), center_y + rng.uniform(-0.35, 0.35), 0.0]),
            # 几个在管外
            np.array([-1.2, center_y + 0.85, 0.0]),
            np.array([ 0.8, center_y - 0.78, 0.0]),
            np.array([ 2.0, center_y + 0.80, 0.0]),
        ]
        field_mols = VGroup(*[
            Circle(radius=d_vis, color=BLUE, fill_color=BLUE, fill_opacity=0.75).move_to(p)
            for p in field_positions
        ])
        self.play(FadeIn(field_mols))
        self.wait(0.6)

        # 碰撞管：矩形近似（高度 2d，宽度 v_bar·dt）
        tube_left  = target_pos[0] + d_vis
        tube_right = 3.4
        tube_width = tube_right - tube_left
        tube_height = 2 * d_eff
        tube_rect = Rectangle(
            width=tube_width, height=tube_height,
            color=GREEN, fill_color=GREEN, fill_opacity=0.18
        )
        tube_rect.move_to(np.array([(tube_left + tube_right) / 2, center_y, 0.0]))

        tube_lbl1 = Text("碰撞管（半径", font=CJK, color=GREEN).scale(0.38)
        tube_lbl2 = MathTex(r"d", color=GREEN).scale(0.65)
        tube_lbl3 = Text("，轴长", font=CJK, color=GREEN).scale(0.38)
        tube_lbl4 = MathTex(r"\bar{v}\,\Delta t", color=GREEN).scale(0.65)
        tube_lbl5 = Text("）", font=CJK, color=GREEN).scale(0.38)
        tube_lbl = VGroup(tube_lbl1, tube_lbl2, tube_lbl3, tube_lbl4, tube_lbl5).arrange(RIGHT, buff=0.06)
        tube_lbl.next_to(tube_rect, DOWN, buff=0.22)
        tube_lbl.scale_to_fit_width(6.0)

        self.play(Create(tube_rect), FadeIn(tube_lbl))
        self.wait(0.8)

        # 高亮管内分子（前5个在管内）
        inside_mols = field_mols[:5]
        highlights = VGroup(*[
            Circle(radius=d_vis + 0.08, color=YELLOW, stroke_width=3).move_to(m.get_center())
            for m in inside_mols
        ])
        count_txt = VGroup(
            Text("管内分子数", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"= n \cdot \pi d^{2} \cdot \bar{v}\,\Delta t \cdot \sqrt{2}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        count_txt.next_to(title, DOWN, buff=0.45)
        count_txt.scale_to_fit_width(11.0)

        self.play(Create(highlights))
        self.wait(0.5)
        self.play(FadeIn(count_txt))
        self.wait(1.0)

        # 相对速度修正：动画展示对向运动 → 乘以 sqrt(2)
        sqrt2_note = VGroup(
            Text("引入相对速度修正：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"\bar{v}_{\rm rel} = \sqrt{2}\,\bar{v}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        sqrt2_note.next_to(count_txt, DOWN, buff=0.25)

        # 对向箭头动画
        arr_right = Arrow(LEFT * 1.2 + DOWN * 1.7, RIGHT * 1.0 + DOWN * 1.7,
                          color=RED, buff=0, stroke_width=3)
        arr_left  = Arrow(RIGHT * 1.0 + DOWN * 2.0, LEFT * 1.2 + DOWN * 2.0,
                          color=BLUE, buff=0, stroke_width=3)
        arr_note = VGroup(
            Text("靶", font=CJK, color=RED).scale(0.35).next_to(arr_right, UP, buff=0.05),
            Text("场", font=CJK, color=BLUE).scale(0.35).next_to(arr_left, DOWN, buff=0.05),
        )
        self.play(FadeIn(sqrt2_note))
        self.play(GrowArrow(arr_right), GrowArrow(arr_left), FadeIn(arr_note))
        self.wait(1.2)

        # 清场
        self.play(FadeOut(VGroup(
            target, target_lbl, eff_circle, eff_lbl,
            field_mols, tube_rect, tube_lbl,
            highlights, count_txt, sqrt2_note,
            arr_right, arr_left, arr_note,
            model_label,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 推导碰撞频率 z 和平均自由程 λ（逐步、颜色高亮）
        # ══════════════════════════════════════════════════════════════════
        deriv_label = Text("推导碰撞频率与平均自由程", font=CJK, color=BLUE).scale(0.50)
        deriv_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(deriv_label))

        # 碰撞频率 z
        z_intro = VGroup(
            Text("单位时间碰撞次数", font=CJK).scale(0.44),
            MathTex(r"=", color=WHITE).scale(0.72),
            Text("管内分子数", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\div \Delta t", color=WHITE).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        z_intro.next_to(deriv_label, DOWN, buff=0.45)
        z_intro.scale_to_fit_width(11.0)
        self.play(FadeIn(z_intro))
        self.wait(1.0)

        z_eq1 = MathTex(
            r"\bar{z}", r"=",
            r"\sqrt{2}\,\pi\,d^{2}\,n\,\bar{v}"
        ).scale(0.88)
        z_eq1[0].set_color(GREEN)
        z_eq1[2].set_color(YELLOW)
        z_eq1.next_to(z_intro, DOWN, buff=0.38)
        self.play(Write(z_eq1))
        self.wait(1.0)

        # 平均自由程 λ = v_bar / z
        lambda_step1 = VGroup(
            Text("平均自由程", font=CJK).scale(0.44),
            MathTex(r"\bar{\lambda} = \frac{\bar{v}}{\bar{z}}", color=CYAN).scale(0.88),
        ).arrange(RIGHT, buff=0.18)
        lambda_step1.next_to(z_eq1, DOWN, buff=0.38)
        self.play(FadeIn(lambda_step1))
        self.wait(0.8)

        lambda_eq = MathTex(
            r"\bar{\lambda}",
            r"=",
            r"\frac{1}{\sqrt{2}\,\pi\,d^{2}\,n}"
        ).scale(0.92)
        lambda_eq[0].set_color(CYAN)
        lambda_eq[2].set_color(YELLOW)
        lambda_eq.next_to(lambda_step1, DOWN, buff=0.30)
        self.play(Write(lambda_eq))
        self.wait(1.2)

        sym_note_items = [
            (r"d", "分子有效直径"),
            (r"n", "分子数密度（单位体积分子数）"),
            (r"\bar{v}", "分子平均速率"),
        ]
        sym_rows = VGroup()
        for sym, zh in sym_note_items:
            row = VGroup(
                MathTex(sym, color=YELLOW).scale(0.65),
                Text(":", font=CJK).scale(0.40),
                Text(zh, font=CJK).scale(0.40),
            ).arrange(RIGHT, buff=0.12)
            sym_rows.add(row)
        sym_rows.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        sym_rows.next_to(lambda_eq, DOWN, buff=0.30)
        sym_rows.scale_to_fit_width(8.0)
        self.play(FadeIn(sym_rows))
        self.wait(1.6)

        self.play(FadeOut(VGroup(deriv_label, z_intro, z_eq1, lambda_step1, sym_rows)))
        # lambda_eq 保留，用于下一步 ValueTracker 对照

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker —— n 增大，λ 减小
        # ══════════════════════════════════════════════════════════════════
        vt_label = Text("分子数密度 n 增大 → 平均自由程 λ 减小", font=CJK, color=ORANGE).scale(0.46)
        vt_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(vt_label))

        # λ = 1/(sqrt2 * pi * d^2 * n)，以相对单位显示
        # 令 A = 1/(sqrt2 * pi * d^2)，选 d = 0.3 nm（示意），A 归一化
        A_const = 1.0 / (math.sqrt(2) * math.pi * 0.09)  # d=0.3 unit
        n_tracker = ValueTracker(1.0)   # n in units of 1/A

        # 坐标轴
        axes = Axes(
            x_range=[0.5, 5.5, 1],
            y_range=[0, 2.8, 0.5],
            x_length=7.0,
            y_length=3.2,
            axis_config={"color": WHITE, "stroke_width": 2},
        )
        axes.shift(DOWN * 0.8 + RIGHT * 0.3)

        x_lbl = VGroup(
            Text("分子数密度", font=CJK).scale(0.38),
            MathTex(r"n", color=YELLOW).scale(0.60),
            Text("（相对单位）", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        x_lbl.next_to(axes, DOWN, buff=0.15)

        y_lbl = VGroup(
            MathTex(r"\bar{\lambda}", color=CYAN).scale(0.65),
        )
        y_lbl.next_to(axes, LEFT, buff=0.18)

        # 绘制 λ(n) 曲线
        lambda_curve = always_redraw(lambda: axes.plot(
            lambda x: A_const / x if x > 0.01 else 2.5,
            x_range=[0.5, 5.4, 0.05],
            color=CYAN,
            stroke_width=3,
        ))

        # 追踪点
        tracker_dot = always_redraw(lambda: Dot(
            axes.c2p(n_tracker.get_value(),
                     min(A_const / n_tracker.get_value(), 2.7)),
            color=YELLOW, radius=0.12,
        ))

        # 数值显示
        n_readout = always_redraw(lambda: VGroup(
            Text("n =", font=CJK, color=YELLOW).scale(0.44),
            MathTex(rf"{n_tracker.get_value():.1f}", color=YELLOW).scale(0.70),
        ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.7))

        lambda_readout = always_redraw(lambda: VGroup(
            MathTex(r"\bar{\lambda} =", color=CYAN).scale(0.62),
            MathTex(rf"{A_const / n_tracker.get_value():.2f}", color=CYAN).scale(0.70),
        ).arrange(RIGHT, buff=0.1).next_to(n_readout.get_center() + DOWN * 0.55, DOWN, buff=0.0))

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(lambda_curve))
        self.play(FadeIn(tracker_dot))
        self.add(n_readout, lambda_readout)
        self.wait(0.6)
        self.play(n_tracker.animate.set_value(4.5), run_time=3.0)
        self.wait(0.8)
        self.play(n_tracker.animate.set_value(1.0), run_time=2.5)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            vt_label, axes, x_lbl, y_lbl,
            lambda_curve, tracker_dot,
            n_readout, lambda_readout,
            lambda_eq,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 代入 n = p/(kT)，改写公式
        # ══════════════════════════════════════════════════════════════════
        sub_label = Text("代入理想气体关系", font=CJK, color=BLUE).scale(0.50)
        sub_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sub_label))

        ideal_gas = VGroup(
            Text("由理想气体状态方程：", font=CJK).scale(0.44),
            MathTex(r"p = nkT \;\Rightarrow\; n = \frac{p}{kT}", color=WHITE).scale(0.80),
        ).arrange(RIGHT, buff=0.15)
        ideal_gas.next_to(sub_label, DOWN, buff=0.50)
        ideal_gas.scale_to_fit_width(11.0)
        self.play(FadeIn(ideal_gas))
        self.wait(1.0)

        lambda_pT = MathTex(
            r"\bar{\lambda}",
            r"=",
            r"\frac{kT}{\sqrt{2}\,\pi\,d^{2}\,p}"
        ).scale(0.92)
        lambda_pT[0].set_color(CYAN)
        lambda_pT[2].set_color(GREEN)
        lambda_pT.next_to(ideal_gas, DOWN, buff=0.42)
        self.play(Write(lambda_pT))
        self.wait(1.2)

        insight = VGroup(
            Text("注意：", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\bar{\lambda}", color=CYAN).scale(0.65),
            Text("只依赖数密度", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"n", color=YELLOW).scale(0.65),
            Text("，而非独立地依赖", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"T", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.08)
        insight.next_to(lambda_pT, DOWN, buff=0.32)
        insight.scale_to_fit_width(11.5)
        self.play(FadeIn(insight))
        self.wait(1.4)

        self.play(FadeOut(VGroup(sub_label, ideal_gas, lambda_pT, insight)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 左右分屏对比 —— p 增大 vs T 升高
        # ══════════════════════════════════════════════════════════════════
        compare_label = Text("温度与压强对 λ 的影响", font=CJK, color=BLUE).scale(0.50)
        compare_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(compare_label))

        # 左侧：p 增大 → λ 减小
        left_title = Text("压强 p 增大", font=CJK, color=RED).scale(0.48)
        left_eq1 = VGroup(
            MathTex(r"p \uparrow", color=RED).scale(0.72),
            MathTex(r"\Rightarrow n \uparrow", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        left_eq2 = VGroup(
            MathTex(r"\Rightarrow", color=WHITE).scale(0.72),
            MathTex(r"\bar{\lambda} \downarrow", color=CYAN).scale(0.80),
        ).arrange(RIGHT, buff=0.1)
        left_note = Text("（分子更拥挤，走不远）", font=CJK, color=WHITE).scale(0.38)
        left_grp = VGroup(left_title, left_eq1, left_eq2, left_note).arrange(DOWN, buff=0.28)
        left_grp.shift(LEFT * 3.2 + DOWN * 0.5)

        # 右侧：T 升高 且 n 不变 → λ 不变；v_bar 增大 → z 增大
        right_title = Text("温度 T 升高（n 不变）", font=CJK, color=YELLOW).scale(0.48)
        right_eq1 = VGroup(
            MathTex(r"T \uparrow,\; n \text{ const}", color=YELLOW).scale(0.68),
        )
        right_eq2 = VGroup(
            MathTex(r"\Rightarrow", color=WHITE).scale(0.72),
            MathTex(r"\bar{\lambda}", color=CYAN).scale(0.80),
            Text("不变", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.1)
        right_eq3 = VGroup(
            Text("但", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"\bar{v} \uparrow \Rightarrow \bar{z} \uparrow", color=ORANGE).scale(0.68),
            Text("（碰撞更频繁）", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        right_grp = VGroup(right_title, right_eq1, right_eq2, right_eq3).arrange(DOWN, buff=0.28)
        right_grp.shift(RIGHT * 3.0 + DOWN * 0.5)

        # 分隔线
        divider = DashedLine(UP * 2.0 + DOWN * 0.0, DOWN * 2.5, color=GREY, stroke_width=1.5)

        self.play(FadeIn(left_grp), FadeIn(divider), FadeIn(right_grp))
        self.wait(2.0)

        # 小结一句话
        takeaway = Text(
            "λ 只由数密度 n（或 p/T）决定；z 随速率增大而增大。",
            font=CJK, color=GREEN,
        ).scale(0.44).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(takeaway))
        self.wait(1.6)

        self.play(FadeOut(VGroup(compare_label, left_grp, divider, right_grp, takeaway)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_label = Text("数值例子", font=CJK, color=BLUE).scale(0.52)
        ex_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(ex_label))

        ex_cond = VGroup(
            Text("氮气（N₂），标准状态", font=CJK).scale(0.44),
            MathTex(r"T=273\ \mathrm{K},\quad p=1.013\times10^{5}\ \mathrm{Pa}", color=WHITE).scale(0.72),
        ).arrange(DOWN, buff=0.18)
        ex_cond.next_to(ex_label, DOWN, buff=0.40)
        ex_cond.scale_to_fit_width(11.0)
        self.play(FadeIn(ex_cond))
        self.wait(0.8)

        ex_params = VGroup(
            Text("取分子有效直径", font=CJK).scale(0.42),
            MathTex(r"d\approx 3.7\times10^{-10}\ \mathrm{m}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        ex_params.next_to(ex_cond, DOWN, buff=0.30)
        ex_params.scale_to_fit_width(11.0)
        self.play(FadeIn(ex_params))
        self.wait(0.6)

        ex_calc = MathTex(
            r"\bar{\lambda} = \frac{kT}{\sqrt{2}\pi d^{2}p}"
            r"\approx \frac{1.38\times10^{-23}\times273}"
            r"{\sqrt{2}\,\pi\,(3.7\times10^{-10})^{2}\times1.013\times10^{5}}"
            r"\approx 6.0\times10^{-8}\ \mathrm{m}",
            color=GREEN,
        ).scale(0.58)
        ex_calc.next_to(ex_params, DOWN, buff=0.32)
        ex_calc.scale_to_fit_width(12.0)
        self.play(Write(ex_calc))
        self.wait(1.6)

        ex_z = VGroup(
            Text("对应碰撞频率", font=CJK).scale(0.42),
            MathTex(
                r"\bar{z} = \sqrt{2}\,\pi\,d^{2}\,n\,\bar{v} \approx 7\times10^{9}\ \mathrm{s^{-1}}",
                color=ORANGE,
            ).scale(0.70),
        ).arrange(RIGHT, buff=0.12)
        ex_z.next_to(ex_calc, DOWN, buff=0.28)
        ex_z.scale_to_fit_width(11.0)
        self.play(FadeIn(ex_z))
        self.wait(1.6)

        self.play(FadeOut(VGroup(ex_label, ex_cond, ex_params, ex_calc, ex_z)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_label = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        sum_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sum_label))

        s_lam = MathTex(
            r"\bar{\lambda} = \frac{1}{\sqrt{2}\,\pi\,d^{2}\,n}"
            r"= \frac{kT}{\sqrt{2}\,\pi\,d^{2}\,p}",
            color=CYAN,
        ).scale(0.80)

        s_z = MathTex(
            r"\bar{z} = \sqrt{2}\,\pi\,d^{2}\,n\,\bar{v} = \frac{\bar{v}}{\bar{\lambda}}",
            color=GREEN,
        ).scale(0.80)

        s_note1 = VGroup(
            MathTex(r"\bar{\lambda}", color=CYAN).scale(0.68),
            Text("越大 = 碰撞越少 = 气体越稀薄", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.1)

        s_note2 = VGroup(
            MathTex(r"\bar{z}", color=GREEN).scale(0.68),
            Text("越大 = 碰撞越频繁 = 速率或密度越大", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.1)

        s_grp = VGroup(s_lam, s_z, s_note1, s_note2).arrange(DOWN, buff=0.38)
        s_grp.next_to(sum_label, DOWN, buff=0.45)
        s_grp.scale_to_fit_width(12.0)
        box = SurroundingRectangle(s_grp, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s_lam))
        self.wait(0.5)
        self.play(Write(s_z))
        self.wait(0.5)
        self.play(FadeIn(s_note1), FadeIn(s_note2))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_label, s_grp, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch05Kp3MeanFreePathCollisionFrequency",
        "id": "phys-ch05-5.2-kp3-mean-free-path-collision-frequency",
        "chapterId": "ch05",
        "sectionId": "5.2",
        "title": "平均自由程与平均碰撞频率",
        "description": "通过碰撞管几何模型推导平均自由程 λ 和碰撞频率 z，用 ValueTracker 展示 λ 随分子数密度 n 减小，并对比压强与温度对 λ 的不同影响。",
    }
]
