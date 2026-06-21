"""第 7.3 节 · 例题 2 — 平行板电容器能量与极板间距变化。

物理动画范式：左右分屏对比（d vs 2d），ValueTracker 控制极板拉伸，
演示电量守恒时间距加倍 → 电场能量加倍；破除「用总场 E 计算单板受力」的常见错误。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch07Ex2ChargedSphereCapacitorEnergy",
        "id": "phys-ch07-7.3-ex2-charged-sphere-capacitor-energy",
        "chapterId": "ch07",
        "sectionId": "7.3",
        "title": "例题：平行板电容器能量与极板间距变化",
        "description": "电量不变时极板间距从 d 变为 2d，通过场能密度直观演示电场能量加倍，并澄清极板受力中单/双面场的常见错误。",
    },
]


# ── 辅助：画一个平行板电容器（极板 + E 场箭头）────────────────────────────
def make_capacitor(center, plate_width, plate_sep, n_arrows=5,
                   plate_color=GREEN, arrow_color=YELLOW, label_d=True):
    """
    center      : 电容器中心 np.array
    plate_width : 极板宽度（上下方向）
    plate_sep   : 极板间距（左右方向）
    返回 VGroup
    """
    half_sep = plate_sep / 2
    half_w = plate_width / 2

    left_plate = Line(
        start=center + np.array([-half_sep, -half_w, 0]),
        end=center + np.array([-half_sep, half_w, 0]),
        color=plate_color, stroke_width=6,
    )
    right_plate = Line(
        start=center + np.array([half_sep, -half_w, 0]),
        end=center + np.array([half_sep, half_w, 0]),
        color=plate_color, stroke_width=6,
    )

    # E 场箭头（从左板到右板，均匀分布）
    arrows = VGroup()
    ys = np.linspace(-half_w * 0.8, half_w * 0.8, n_arrows)
    for y in ys:
        arr = Arrow(
            start=center + np.array([-half_sep + 0.1, y, 0]),
            end=center + np.array([half_sep - 0.1, y, 0]),
            buff=0,
            color=arrow_color,
            stroke_width=2.5,
            max_tip_length_to_length_ratio=0.18,
        )
        arrows.add(arr)

    grp = VGroup(left_plate, right_plate, arrows)
    return grp


class Ch07Ex2ChargedSphereCapacitorEnergy(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1：标题
        # ══════════════════════════════════════════════════════════════════
        title = Text(
            "例题：平行板电容器能量与极板间距",
            font=CJK, color=BLUE,
        ).scale(0.60).to_edge(UP)
        subtitle = Text(
            "第七章 静电场  ·  7.3  静电场的能量",
            font=CJK, color=WHITE,
        ).scale(0.38).next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2：生活类比 / 题意背景
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text(
            "一个充好电的平行板电容器（与电源断开），",
            font=CJK,
        ).scale(0.46)
        ana2 = Text(
            "将两极板缓慢拉开，间距从 d 变为 2d。",
            font=CJK,
        ).scale(0.46)
        ana3 = Text(
            "电场能量如何变化？需要外力做多少功？",
            font=CJK, color=YELLOW,
        ).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3：关键公式推导——用场能密度计算总能量
        # ══════════════════════════════════════════════════════════════════
        sec_t = Text("核心公式推导", font=CJK, color=BLUE).scale(0.52)
        sec_t.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sec_t))

        # 场能密度
        f1_label = Text("场能密度：", font=CJK).scale(0.46)
        f1_math = MathTex(r"\omega_e = \frac{1}{2}\varepsilon_0 E^2", color=YELLOW).scale(0.85)
        f1 = VGroup(f1_label, f1_math).arrange(RIGHT, buff=0.18)

        # 体积
        f2_label = Text("体积（极板面积 S，间距 d）：", font=CJK).scale(0.46)
        f2_math = MathTex(r"V = S \cdot d", color=WHITE).scale(0.85)
        f2 = VGroup(f2_label, f2_math).arrange(RIGHT, buff=0.18)

        # 总能量
        f3_label = Text("总能量：", font=CJK).scale(0.46)
        f3_math = MathTex(
            r"W = \omega_e \cdot V = \frac{1}{2}\varepsilon_0 E^2 S d", color=GREEN
        ).scale(0.85)
        f3 = VGroup(f3_label, f3_math).arrange(RIGHT, buff=0.18)

        # 电容关系
        f4_label = Text("又因为：", font=CJK).scale(0.46)
        f4_math = MathTex(
            r"C = \frac{\varepsilon_0 S}{d},\quad W = \frac{q^2}{2C}", color=WHITE
        ).scale(0.85)
        f4 = VGroup(f4_label, f4_math).arrange(RIGHT, buff=0.18)

        steps = VGroup(f1, f2, f3, f4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        steps.next_to(sec_t, DOWN, buff=0.4)
        steps.scale_to_fit_width(12.5)

        for row in [f1, f2, f3, f4]:
            self.play(FadeIn(row))
            self.wait(1.0)
        self.wait(1.2)
        self.play(FadeOut(VGroup(sec_t, steps)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4：左右分屏可视化——静态对比（d vs 2d）
        # ══════════════════════════════════════════════════════════════════
        divider = DashedLine(
            start=np.array([0, -3.5, 0]),
            end=np.array([0, 2.8, 0]),
            color=GRAY, dash_length=0.15,
        )

        # ── 左侧：间距 d ────────────────────────────────────────────────
        left_center = np.array([-3.2, -0.2, 0])
        cap_left = make_capacitor(left_center, plate_width=2.2, plate_sep=1.6, n_arrows=5)
        lbl_left = Text("初始状态：间距 d", font=CJK, color=GREEN).scale(0.42)
        lbl_left.next_to(cap_left, UP, buff=0.3)

        # 标注 d
        d_brace = DashedLine(
            start=left_center + np.array([-0.8, -1.3, 0]),
            end=left_center + np.array([0.8, -1.3, 0]),
            color=CYAN, dash_length=0.1,
        )
        d_arr = DoubleArrow(
            start=left_center + np.array([-0.8, -1.3, 0]),
            end=left_center + np.array([0.8, -1.3, 0]),
            buff=0, color=CYAN, stroke_width=2,
        )
        d_label = MathTex(r"d", color=CYAN).scale(0.7)
        d_label.next_to(d_arr, DOWN, buff=0.12)

        # W₀ 显示框
        w0_box_text = VGroup(
            Text("能量：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"W = \frac{q^2}{2C}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        w0_box_text.next_to(cap_left, DOWN, buff=0.55)
        w0_rect = SurroundingRectangle(w0_box_text, color=YELLOW, buff=0.12, corner_radius=0.08)

        left_group = VGroup(cap_left, lbl_left, d_arr, d_label, w0_box_text, w0_rect)

        # ── 右侧：间距 2d ────────────────────────────────────────────────
        right_center = np.array([3.2, -0.2, 0])
        cap_right = make_capacitor(right_center, plate_width=2.2, plate_sep=3.0, n_arrows=5)
        lbl_right = Text("拉开后：间距 2d", font=CJK, color=ORANGE).scale(0.42)
        lbl_right.next_to(cap_right, UP, buff=0.3)

        d2_arr = DoubleArrow(
            start=right_center + np.array([-1.5, -1.3, 0]),
            end=right_center + np.array([1.5, -1.3, 0]),
            buff=0, color=CYAN, stroke_width=2,
        )
        d2_label = MathTex(r"2d", color=CYAN).scale(0.7)
        d2_label.next_to(d2_arr, DOWN, buff=0.12)

        # W' 显示框
        wp_box_text = VGroup(
            Text("能量：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"W' = \frac{q^2}{2C'} = \frac{q^2}{C}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        wp_box_text.next_to(cap_right, DOWN, buff=0.55)
        wp_rect = SurroundingRectangle(wp_box_text, color=ORANGE, buff=0.12, corner_radius=0.08)

        right_group = VGroup(cap_right, lbl_right, d2_arr, d2_label, wp_box_text, wp_rect)

        # 注释：E 不变（因 q 不变，σ 不变，E=σ/ε₀ 不变）
        e_note = VGroup(
            Text("电量 q 守恒", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\Rightarrow \sigma = q/S \text{ 不变}", color=GREEN).scale(0.68),
        ).arrange(RIGHT, buff=0.12)
        e_note2 = VGroup(
            MathTex(r"\Rightarrow E = \sigma/\varepsilon_0", color=GREEN).scale(0.68),
            Text("不变", font=CJK, color=GREEN).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        e_note_grp = VGroup(e_note, e_note2).arrange(DOWN, buff=0.18)
        e_note_grp.next_to(title, DOWN, buff=0.38)

        self.play(Create(divider))
        self.play(FadeIn(e_note_grp))
        self.wait(0.8)
        self.play(FadeIn(lbl_left), Create(cap_left))
        self.play(FadeIn(lbl_right), Create(cap_right))
        self.wait(0.8)
        self.play(Create(d_arr), FadeIn(d_label))
        self.play(Create(d2_arr), FadeIn(d2_label))
        self.wait(0.8)
        self.play(FadeIn(w0_box_text), Create(w0_rect))
        self.play(FadeIn(wp_box_text), Create(wp_rect))
        self.wait(1.5)
        self.play(FadeOut(VGroup(left_group, right_group, divider, e_note_grp)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5：ValueTracker 动画——极板拉伸过程
        # ══════════════════════════════════════════════════════════════════
        sep = ValueTracker(1.4)   # 极板半间距（从 0.7d 开始，d=2 单位→sep 在 [0.7,1.4])

        CAP_CENTER = np.array([0.0, -0.3, 0])
        PLATE_W = 2.4

        def make_left_plate():
            s = sep.get_value()
            return Line(
                start=CAP_CENTER + np.array([-s, -PLATE_W / 2, 0]),
                end=CAP_CENTER + np.array([-s, PLATE_W / 2, 0]),
                color=GREEN, stroke_width=8,
            )

        def make_right_plate():
            s = sep.get_value()
            return Line(
                start=CAP_CENTER + np.array([s, -PLATE_W / 2, 0]),
                end=CAP_CENTER + np.array([s, PLATE_W / 2, 0]),
                color=GREEN, stroke_width=8,
            )

        def make_e_arrows():
            s = sep.get_value()
            arrows = VGroup()
            ys = np.linspace(-PLATE_W / 2 * 0.85, PLATE_W / 2 * 0.85, 5)
            for y in ys:
                arr = Arrow(
                    start=CAP_CENTER + np.array([-s + 0.12, y, 0]),
                    end=CAP_CENTER + np.array([s - 0.12, y, 0]),
                    buff=0, color=YELLOW, stroke_width=2.5,
                    max_tip_length_to_length_ratio=0.15,
                )
                arrows.add(arr)
            return arrows

        def make_d_label():
            s = sep.get_value()
            val = s / 0.7   # 相对单位
            grp = VGroup(
                DoubleArrow(
                    start=CAP_CENTER + np.array([-s, -PLATE_W / 2 - 0.35, 0]),
                    end=CAP_CENTER + np.array([s, -PLATE_W / 2 - 0.35, 0]),
                    buff=0, color=CYAN, stroke_width=2,
                ),
                MathTex(rf"{val:.1f}d", color=CYAN).scale(0.65).next_to(
                    CAP_CENTER + np.array([0, -PLATE_W / 2 - 0.35, 0]), DOWN, buff=0.12
                ),
            )
            return grp

        def make_w_readout():
            s = sep.get_value()
            ratio = s / 0.7
            return VGroup(
                Text("场能：", font=CJK, color=WHITE).scale(0.42),
                MathTex(rf"W = {ratio:.2f} \cdot W_0", color=YELLOW).scale(0.75),
            ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.6)

        lp = always_redraw(make_left_plate)
        rp = always_redraw(make_right_plate)
        ea = always_redraw(make_e_arrows)
        dl = always_redraw(make_d_label)
        wr = always_redraw(make_w_readout)

        anim_title = Text(
            "动画：缓慢拉开极板，观察 E 场不变、体积增大",
            font=CJK, color=BLUE,
        ).scale(0.44).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(anim_title))
        self.add(lp, rp, ea, dl, wr)
        self.wait(1.0)

        # 拉伸动画：sep 从 0.7 → 1.4（间距 d → 2d）
        self.play(sep.animate.set_value(1.4), run_time=3.5)
        self.wait(1.5)
        self.play(FadeOut(VGroup(anim_title, wr)))
        # 保留极板画面，进行下一步
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 6：能量差 ΔW 的计算
        # ══════════════════════════════════════════════════════════════════
        delta_title = Text("计算能量变化 ΔW", font=CJK, color=BLUE).scale(0.50)
        delta_title.next_to(title, DOWN, buff=0.42)

        # 中间步骤：C' = C/2
        row1_label = Text("间距加倍，电容变半：", font=CJK).scale(0.44)
        row1_math = MathTex(r"C' = \frac{\varepsilon_0 S}{2d} = \frac{C}{2}", color=WHITE).scale(0.80)
        row1 = VGroup(row1_label, row1_math).arrange(RIGHT, buff=0.18)

        # W' = 2W
        row2_label = Text("新能量：", font=CJK).scale(0.44)
        row2_math = MathTex(
            r"W' = \frac{q^2}{2C'} = \frac{q^2}{C} = 2W", color=GREEN
        ).scale(0.80)
        row2 = VGroup(row2_label, row2_math).arrange(RIGHT, buff=0.18)

        # ΔW = 50 J（题目给定 W = 50 J）
        row3_label = Text("若初始能量 W = 50 J，则：", font=CJK).scale(0.44)
        row3_math = MathTex(
            r"\Delta W = W' - W = W = 50\,\mathrm{J}", color=YELLOW
        ).scale(0.80)
        row3 = VGroup(row3_label, row3_math).arrange(RIGHT, buff=0.18)
        delta_box = SurroundingRectangle(row3_math, color=YELLOW, buff=0.15, corner_radius=0.08)

        all_rows = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        all_rows.next_to(delta_title, DOWN, buff=0.45)
        all_rows.scale_to_fit_width(12.5)

        # 移除动态对象，进入静态推导
        self.remove(lp, rp, ea, dl)
        self.play(FadeIn(delta_title))
        for row in [row1, row2, row3]:
            self.play(FadeIn(row))
            self.wait(1.0)
        self.play(Create(delta_box))
        self.wait(1.5)
        self.play(FadeOut(VGroup(delta_title, all_rows, delta_box)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7：能量来自外力做功——受力分析（吸引力 vs 外力）
        # ══════════════════════════════════════════════════════════════════
        force_title = Text(
            "能量增加从哪里来？——外力做功",
            font=CJK, color=BLUE,
        ).scale(0.50).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(force_title))

        # 画简化电容器（静态）
        fc = np.array([0.0, -0.4, 0])
        fl_plate = Line(fc + np.array([-1.2, -1.0, 0]), fc + np.array([-1.2, 1.0, 0]),
                        color=GREEN, stroke_width=8)
        fr_plate = Line(fc + np.array([1.2, -1.0, 0]), fc + np.array([1.2, 1.0, 0]),
                        color=GREEN, stroke_width=8)

        # 内部吸引力（极板相互吸引）
        left_attract = Arrow(
            start=fc + np.array([-1.2, 0.4, 0]),
            end=fc + np.array([-0.55, 0.4, 0]),
            buff=0, color=RED, stroke_width=3,
            max_tip_length_to_length_ratio=0.22,
        )
        right_attract = Arrow(
            start=fc + np.array([1.2, 0.4, 0]),
            end=fc + np.array([0.55, 0.4, 0]),
            buff=0, color=RED, stroke_width=3,
            max_tip_length_to_length_ratio=0.22,
        )
        attract_label = VGroup(
            Text("吸引力", font=CJK, color=RED).scale(0.40),
            MathTex(r"F_{attr}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.1).move_to(fc + np.array([0, 0.72, 0]))

        # 外力（克服吸引力，向外）
        left_ext = Arrow(
            start=fc + np.array([-1.2, -0.4, 0]),
            end=fc + np.array([-1.85, -0.4, 0]),
            buff=0, color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.22,
        )
        right_ext = Arrow(
            start=fc + np.array([1.2, -0.4, 0]),
            end=fc + np.array([1.85, -0.4, 0]),
            buff=0, color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.22,
        )
        ext_label = VGroup(
            Text("外力", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"F_{ext}", color=ORANGE).scale(0.65),
        ).arrange(RIGHT, buff=0.1).move_to(fc + np.array([0, -0.8, 0]))

        cap_static = VGroup(fl_plate, fr_plate)
        self.play(Create(cap_static))
        self.play(
            Create(left_attract), Create(right_attract), FadeIn(attract_label),
        )
        self.wait(0.8)
        self.play(
            Create(left_ext), Create(right_ext), FadeIn(ext_label),
        )
        self.wait(0.8)

        # 功等于能量增量
        work_eq = VGroup(
            Text("外力做功：", font=CJK).scale(0.44),
            MathTex(r"W_{ext} = \Delta W = 50\,\mathrm{J}", color=GREEN).scale(0.82),
        ).arrange(RIGHT, buff=0.15)
        work_eq.next_to(cap_static, DOWN, buff=0.55)
        work_eq.scale_to_fit_width(8)
        self.play(FadeIn(work_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(
            force_title, cap_static,
            left_attract, right_attract, attract_label,
            left_ext, right_ext, ext_label, work_eq,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 8：常见错误澄清——单板场 vs 双板总场
        # ══════════════════════════════════════════════════════════════════
        err_title = Text(
            "常见错误澄清：极板受力中的「单面场」vs「总场」",
            font=CJK, color=RED,
        ).scale(0.46).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(err_title))

        # 错误写法
        wrong_label = Text("错误做法（用总场 E 直接乘以 q）：", font=CJK, color=RED).scale(0.44)
        wrong_math = MathTex(
            r"F \neq q E = q \cdot \frac{\sigma}{\varepsilon_0}",
            color=RED,
        ).scale(0.82)
        wrong_cross = Cross(wrong_math, color=RED, stroke_width=4)
        wrong_row = VGroup(wrong_label, wrong_math).arrange(RIGHT, buff=0.18)

        # 正确写法——单面场
        correct_label = Text("正确：只有另一板的场对该板施力：", font=CJK, color=GREEN).scale(0.44)
        correct_math = MathTex(
            r"E' = \frac{\sigma}{2\varepsilon_0},\quad F = qE' = \frac{q\sigma}{2\varepsilon_0}",
            color=GREEN,
        ).scale(0.82)
        correct_row = VGroup(correct_label, correct_math).arrange(RIGHT, buff=0.18)

        # 联系总场
        link_label = Text("总场 E = 两板叠加 =", font=CJK, color=WHITE).scale(0.44)
        link_math = MathTex(
            r"E = \frac{\sigma}{2\varepsilon_0} + \frac{\sigma}{2\varepsilon_0} = \frac{\sigma}{\varepsilon_0}",
            color=WHITE,
        ).scale(0.82)
        link_row = VGroup(link_label, link_math).arrange(RIGHT, buff=0.18)

        err_group = VGroup(wrong_row, correct_row, link_row).arrange(DOWN, buff=0.40, aligned_edge=LEFT)
        err_group.next_to(err_title, DOWN, buff=0.40)
        err_group.scale_to_fit_width(13.0)

        self.play(FadeIn(wrong_row))
        self.wait(0.7)
        self.play(Create(wrong_cross))
        self.wait(0.8)
        self.play(FadeIn(correct_row))
        self.wait(0.8)
        self.play(FadeIn(link_row))
        self.wait(1.5)
        self.play(FadeOut(VGroup(err_title, err_group, wrong_cross)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9：数值计算示例
        # ══════════════════════════════════════════════════════════════════
        num_title = Text("数值例子（题目已知 W₀ = 50 J）", font=CJK, color=BLUE).scale(0.50)
        num_title.next_to(title, DOWN, buff=0.45)

        n1_label = Text("初始电容：", font=CJK).scale(0.44)
        n1_math = MathTex(r"C = \frac{\varepsilon_0 S}{d}", color=WHITE).scale(0.80)
        n1 = VGroup(n1_label, n1_math).arrange(RIGHT, buff=0.18)

        n2_label = Text("拉开后电容：", font=CJK).scale(0.44)
        n2_math = MathTex(r"C' = \frac{C}{2}", color=WHITE).scale(0.80)
        n2 = VGroup(n2_label, n2_math).arrange(RIGHT, buff=0.18)

        n3_label = Text("能量变化：", font=CJK).scale(0.44)
        n3_math = MathTex(
            r"\Delta W = W_0 = 50\,\mathrm{J}", color=YELLOW
        ).scale(0.80)
        n3 = VGroup(n3_label, n3_math).arrange(RIGHT, buff=0.18)

        n4_label = Text("外力做功等于能量增量：", font=CJK).scale(0.44)
        n4_math = MathTex(
            r"W_{ext} = 50\,\mathrm{J}", color=GREEN
        ).scale(0.80)
        n4 = VGroup(n4_label, n4_math).arrange(RIGHT, buff=0.18)

        num_rows = VGroup(n1, n2, n3, n4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        num_rows.next_to(num_title, DOWN, buff=0.42)
        num_rows.scale_to_fit_width(12.5)

        self.play(FadeIn(num_title))
        for row in [n1, n2, n3, n4]:
            self.play(FadeIn(row))
            self.wait(0.9)
        self.wait(1.2)
        self.play(FadeOut(VGroup(num_title, num_rows)))

        # ══════════════════════════════════════════════════════════════════
        # Step 10：小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sum_title))

        s1 = MathTex(
            r"\omega_e = \frac{1}{2}\varepsilon_0 E^2,\quad W = \omega_e \cdot Sd",
            color=YELLOW,
        ).scale(0.80)

        s2_label = Text("电量守恒 → E 不变 → 间距加倍则能量加倍：", font=CJK, color=WHITE).scale(0.43)
        s2_math = MathTex(r"W' = 2W", color=GREEN).scale(0.80)
        s2 = VGroup(s2_label, s2_math).arrange(RIGHT, buff=0.15)

        s3_label = Text("外力做功 = 能量增量：", font=CJK, color=WHITE).scale(0.43)
        s3_math = MathTex(r"W_{ext} = \Delta W = 50\,\mathrm{J}", color=GREEN).scale(0.80)
        s3 = VGroup(s3_label, s3_math).arrange(RIGHT, buff=0.15)

        s4_label = Text("受力计算用单板场：", font=CJK, color=WHITE).scale(0.43)
        s4_math = MathTex(r"E' = \frac{\sigma}{2\varepsilon_0}", color=CYAN).scale(0.80)
        s4 = VGroup(s4_label, s4_math).arrange(RIGHT, buff=0.15)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.40, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(13.0)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        for item in [s1, s2, s3, s4]:
            self.play(FadeIn(item))
            self.wait(0.8)
        self.play(Create(box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.4)
