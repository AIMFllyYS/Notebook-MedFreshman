"""第 11.1 节 · 等厚干涉：劈尖与牛顿环

波动光学 · 知识点 4：同一薄膜厚度处的两列反射光发生干涉，
形成等厚条纹。本视频分四步演示：
  1) 劈尖侧视图：几何光路 + 半波损失 + 等厚线
  2) ValueTracker 扫动劈尖角 θ，条纹间距 L = λ/(2nθ) 随θ变化
  3) 牛顿环俯视图：同心暗环逐步出现，r_k = sqrt(kRλ)
  4) ValueTracker 改变曲率半径 R，环扩张/收缩

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常量（可视化用） ──────────────────────────────────────────────
LAM = 0.55e-6   # 波长 (m)，仅用于符号，动画单位另算
N_GLASS = 1.5   # 玻璃折射率（展示用）


class Ch11Kp4ThinFilmEqualThickness(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("等厚干涉：劈尖与牛顿环", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("肥皂泡在阳光下呈现彩色条纹——", font=CJK, color=WHITE).scale(0.5)
        ana2 = Text("这是薄膜上下两面的反射光叠加干涉的结果。", font=CJK, color=WHITE).scale(0.5)
        ana3 = Text("厚度相同的地方，光程差相同，形成同一级亮暗纹：", font=CJK, color=GREEN).scale(0.5)
        ana4 = Text("这就是「等厚干涉」。", font=CJK, color=YELLOW).scale(0.5)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        for mob in ana:
            self.play(FadeIn(mob), run_time=0.7)
            self.wait(0.5)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 劈尖侧视图 — 几何光路（固定 θ 版）
        # ══════════════════════════════════════════════════════════════
        sec_label = Text("一、劈尖（Air Wedge）侧视图", font=CJK, color=BLUE).scale(0.48)
        sec_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec_label))
        self.wait(0.6)

        # 劈尖几何：上玻璃板水平，下玻璃板向右倾斜
        # 屏幕中部偏下，X 从 -4.5 到 4.5，Y 从 -2.8 到 -0.2
        wedge_left_x = -4.2
        wedge_right_x = 4.2
        top_y = -0.5        # 上玻璃板底面 y
        bot_slope = 0.18    # 下玻璃板斜率（模拟夹角 θ）
        bot_left_y = -2.2   # 下玻璃板左端 y（靠近接触线）
        bot_right_y = bot_left_y + bot_slope * (wedge_right_x - wedge_left_x)

        # 上玻璃板（厚度 0.25）
        upper_glass = Polygon(
            [wedge_left_x, top_y + 0.25, 0],
            [wedge_right_x, top_y + 0.25, 0],
            [wedge_right_x, top_y, 0],
            [wedge_left_x, top_y, 0],
            color=CYAN, fill_color="#a0d8ef", fill_opacity=0.35, stroke_width=1.8
        )
        # 下玻璃板（倾斜，厚度 0.22）
        def bx_to_y(x):
            return bot_left_y + bot_slope * (x - wedge_left_x)

        lower_glass = Polygon(
            [wedge_left_x, bx_to_y(wedge_left_x), 0],
            [wedge_right_x, bx_to_y(wedge_right_x), 0],
            [wedge_right_x, bx_to_y(wedge_right_x) - 0.22, 0],
            [wedge_left_x, bx_to_y(wedge_left_x) - 0.22, 0],
            color=CYAN, fill_color="#a0d8ef", fill_opacity=0.35, stroke_width=1.8
        )

        # 空气层着色（两板之间）
        air_wedge = Polygon(
            [wedge_left_x, top_y, 0],
            [wedge_right_x, top_y, 0],
            [wedge_right_x, bx_to_y(wedge_right_x), 0],
            [wedge_left_x, bx_to_y(wedge_left_x), 0],
            fill_color=YELLOW, fill_opacity=0.12, stroke_width=0
        )

        # 夹角 θ 标注（左侧）
        theta_arc = Arc(
            radius=0.55,
            start_angle=PI,
            angle=-math.atan(bot_slope),
            arc_center=[wedge_left_x + 0.05, top_y, 0],
            color=ORANGE, stroke_width=2
        )
        theta_label = MathTex(r"\theta", color=ORANGE).scale(0.5)
        theta_label.move_to([wedge_left_x + 0.72, top_y - 0.28, 0])

        wedge_group = VGroup(upper_glass, air_wedge, lower_glass, theta_arc, theta_label)
        self.play(Create(upper_glass), Create(lower_glass), FadeIn(air_wedge),
                  Create(theta_arc), FadeIn(theta_label))
        self.wait(0.8)

        # ── 在 x=-1.5 处演示光路（垂直入射） ──
        px = -1.5
        py_top = top_y + 0.25 + 1.5    # 入射光起点（从上方）
        py_surf1 = top_y                # 上玻璃板底面（第1反射）
        py_surf2 = bx_to_y(px)         # 下玻璃板顶面（第2反射）

        # 入射光（向下）
        inc_arrow = Arrow(
            [px, py_top, 0], [px, py_surf1, 0],
            buff=0, color=YELLOW, stroke_width=2.5, tip_length=0.18
        )
        # 第1反射光（向上，较弱，有半波损失）
        ref1_arrow = Arrow(
            [px, py_surf1, 0], [px + 0.25, py_top, 0],
            buff=0, color=RED, stroke_width=2, tip_length=0.15
        )
        # 透射到空气层（继续向下）
        trans_arrow = DashedLine(
            [px, py_surf1, 0], [px, py_surf2, 0],
            color=YELLOW, stroke_width=2
        )
        # 第2反射光（向上，无半波损失）
        ref2_arrow = Arrow(
            [px, py_surf2, 0], [px - 0.25, py_top, 0],
            buff=0, color=GREEN, stroke_width=2, tip_length=0.15
        )

        # 标注 e（空气层厚度）
        e_line_l = DashedLine([px - 0.5, py_surf1, 0], [px - 0.5, py_surf2, 0],
                               color=WHITE, stroke_width=1.2)
        brace_e = Brace(e_line_l, direction=LEFT, color=WHITE)
        e_label = MathTex(r"e", color=WHITE).scale(0.5).next_to(brace_e, LEFT, buff=0.1)

        self.play(Create(inc_arrow))
        self.wait(0.3)
        self.play(Create(ref1_arrow), Create(trans_arrow))
        self.wait(0.3)
        self.play(Create(ref2_arrow))
        self.wait(0.4)
        self.play(Create(e_line_l), Create(brace_e), FadeIn(e_label))
        self.wait(0.5)

        # 半波损失说明
        hw_loss = VGroup(
            Text("上表面（光疏→光密）：有半波损失", font=CJK, color=RED).scale(0.38),
            Text("下表面（光密→光疏）：无半波损失", font=CJK, color=GREEN).scale(0.38),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        hw_loss.to_edge(RIGHT, buff=0.3).shift(DOWN * 0.2)
        self.play(FadeIn(hw_loss))
        self.wait(1.2)

        # 光程差公式
        delta_eq = MathTex(r"\delta", r"=", r"2n_{\text{air}}e", r"+",
                           r"\frac{\lambda}{2}").scale(0.78)
        delta_eq.next_to(sec_label, DOWN, buff=0.25)
        delta_eq[2].set_color(YELLOW)
        delta_eq[4].set_color(RED)
        self.play(Write(delta_eq))
        delta_note = VGroup(
            Text("暗纹条件：", font=CJK, color=WHITE).scale(0.4),
            MathTex(r"\delta = (2k+1)\frac{\lambda}{2}", color=YELLOW).scale(0.62),
        ).arrange(RIGHT, buff=0.12).next_to(delta_eq, DOWN, buff=0.2)
        self.play(FadeIn(delta_note))
        self.wait(1.5)

        # 高亮等厚线
        # 在 x = -2, 0, 2 处画虚线表示等厚线（暗纹位置）
        fringe_lines = VGroup()
        for fx in [-2.8, -0.8, 1.2, 3.2]:
            fy_top = top_y
            fy_bot = bx_to_y(fx)
            fl = DashedLine([fx, fy_top, 0], [fx, fy_bot, 0],
                            color=ORANGE, stroke_width=2)
            fringe_lines.add(fl)
        fringe_note = Text("等厚暗纹（同 e 处）", font=CJK, color=ORANGE).scale(0.4)
        fringe_note.to_edge(LEFT, buff=0.3).shift(DOWN * 1.6)
        self.play(Create(fringe_lines), FadeIn(fringe_note))
        self.wait(1.4)

        # 间距公式
        L_formula = VGroup(
            Text("条纹间距", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"L = \frac{\lambda}{2n\theta}", color=GREEN).scale(0.75),
        ).arrange(RIGHT, buff=0.15)
        L_formula.next_to(delta_note, DOWN, buff=0.25)
        self.play(FadeIn(L_formula))
        self.wait(1.2)

        # 清场（保留 title + sec_label，清掉几何图）
        geom_group = VGroup(
            upper_glass, air_wedge, lower_glass, theta_arc, theta_label,
            inc_arrow, ref1_arrow, trans_arrow, ref2_arrow,
            e_line_l, brace_e, e_label, hw_loss,
            delta_eq, delta_note, L_formula,
            fringe_lines, fringe_note
        )
        self.play(FadeOut(geom_group))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # Step 4: ValueTracker — 扫动 θ，展示条纹间距变化
        # ══════════════════════════════════════════════════════════════
        sec2_label = Text("θ 增大 → 条纹变密（间距 L=λ/2nθ）", font=CJK, color=BLUE).scale(0.46)
        sec2_label.next_to(title, DOWN, buff=0.35)
        self.play(Transform(sec_label, sec2_label))
        self.wait(0.5)

        # 用示意图：底部画一排条纹（竖线），间距用 ValueTracker 控制
        theta_tracker = ValueTracker(0.04)   # 初始小角度（弧度，夸大用）

        # 示意带——横向条纹带
        band_rect = Rectangle(width=9.0, height=0.6, color=BLUE, fill_opacity=0.08)
        band_rect.move_to([0, -1.6, 0])
        band_label = Text("空气劈尖（俯视示意：垂直于棱的方向）",
                          font=CJK, color=WHITE).scale(0.38)
        band_label.next_to(band_rect, DOWN, buff=0.18)

        # L（屏幕单位）= c / θ   其中 c 为比例系数
        C_coeff = 0.25   # 使得 θ=0.04 时 L≈6.25 (会被 clamp)

        def make_fringes(theta_val):
            grp = VGroup()
            L_screen = min(C_coeff / theta_val, 4.5)  # 最大间距限制
            x = -4.4
            while x <= 4.4:
                ln = Line([x, -1.6 - 0.28, 0], [x, -1.6 + 0.28, 0],
                          color=ORANGE, stroke_width=2.2)
                grp.add(ln)
                x += L_screen
            return grp

        fringes_dyn = always_redraw(lambda: make_fringes(theta_tracker.get_value()))

        L_display = always_redraw(
            lambda: VGroup(
                Text("间距 L =", font=CJK, color=WHITE).scale(0.45),
                MathTex(
                    r"\frac{\lambda}{2n\theta}",
                    color=GREEN
                ).scale(0.65),
                Text(
                    f"  (θ={theta_tracker.get_value():.3f} rad)",
                    font=CJK, color=ORANGE
                ).scale(0.38),
            ).arrange(RIGHT, buff=0.1).next_to(band_rect, UP, buff=0.35)
        )

        self.play(Create(band_rect), FadeIn(band_label), FadeIn(fringes_dyn), FadeIn(L_display))
        self.wait(0.8)

        # θ 从小变大：条纹变密
        self.play(theta_tracker.animate.set_value(0.20), run_time=3.5, rate_func=linear)
        self.wait(0.8)
        # θ 从大变小：条纹变稀
        self.play(theta_tracker.animate.set_value(0.04), run_time=2.5, rate_func=linear)
        self.wait(1.0)

        clear1 = VGroup(sec_label, band_rect, band_label, fringes_dyn, L_display)
        self.play(FadeOut(clear1))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # Step 5: 牛顿环（Newton's Rings）俯视图 — 同心暗环逐步出现
        # ══════════════════════════════════════════════════════════════
        sec3_label = Text("二、牛顿环（Newton's Rings）俯视图", font=CJK, color=BLUE).scale(0.48)
        sec3_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec3_label))
        self.wait(0.5)

        # 坐标中心
        center = np.array([0.0, -0.8, 0])
        # R_display（曲率半径，屏幕单位）
        R_tracker = ValueTracker(2.0)

        # 比例：r_k = sqrt(k * R * lambda)，但 R、λ 都归一化
        # 令 scale = 1.4（屏幕单位），使第1圈半径约 1.4
        SCALE = 1.4

        def ring_radius(k, R_val):
            return SCALE * math.sqrt(k * R_val / 2.0)

        # 先静态出现 6 个暗环 + 标注（用动画逐一 Create）
        R_fixed = 2.0
        num_rings = 6
        ring_mobs = []
        for k in range(1, num_rings + 1):
            r = ring_radius(k, R_fixed)
            circ = Circle(radius=r, color=ORANGE, stroke_width=2.2)
            circ.move_to(center)
            ring_mobs.append(circ)

        # 中心暗点
        center_dot = Dot(center, color=ORANGE, radius=0.06)

        # 逐步画环
        self.play(FadeIn(center_dot))
        self.wait(0.4)
        for i, ring in enumerate(ring_mobs):
            self.play(Create(ring), run_time=0.4)
        self.wait(0.6)

        # 标注 r_k（第3环）
        k_ann = 3
        r_ann = ring_radius(k_ann, R_fixed)
        ann_start = center + np.array([0, 0, 0])
        ann_end = center + np.array([r_ann, 0, 0])
        r_arrow = Arrow(ann_start, ann_end, buff=0, color=CYAN,
                        stroke_width=2, tip_length=0.18)
        r_label = VGroup(
            MathTex(r"r_3", color=CYAN).scale(0.55),
        ).next_to(ann_end, RIGHT, buff=0.08)

        formula_rk = MathTex(r"r_k = \sqrt{k R \lambda}", color=YELLOW).scale(0.8)
        formula_rk.to_edge(RIGHT, buff=0.6).shift(UP * 0.5)
        dark_note = VGroup(
            Text("（暗环，k=0,1,2,...）", font=CJK, color=WHITE).scale(0.38),
        ).next_to(formula_rk, DOWN, buff=0.18)

        self.play(Create(r_arrow), FadeIn(r_label))
        self.play(Write(formula_rk), FadeIn(dark_note))
        self.wait(1.2)

        # 中心为暗点的说明
        center_note = Text("中心（e≈0）→ 光程差=λ/2 → 暗点", font=CJK, color=RED).scale(0.4)
        center_note.to_edge(LEFT, buff=0.5).shift(DOWN * 2.2)
        self.play(FadeIn(center_note))
        self.wait(1.0)

        # 清掉静态环，准备 ValueTracker 动态版
        static_rings = VGroup(*ring_mobs, center_dot, r_arrow, r_label)
        self.play(FadeOut(static_rings), FadeOut(formula_rk),
                  FadeOut(dark_note), FadeOut(center_note))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # Step 6: ValueTracker — 改变 R，展示环扩张/收缩
        # ══════════════════════════════════════════════════════════════
        sec4_label = Text("R 增大 → 环半径 r_k ∝ √R 扩大", font=CJK, color=BLUE).scale(0.46)
        sec4_label.next_to(title, DOWN, buff=0.35)
        self.play(Transform(sec3_label, sec4_label))
        self.wait(0.4)

        # 动态牛顿环（始终重绘）
        def make_newton_rings(R_val):
            grp = VGroup()
            # 中心暗点
            grp.add(Dot(center, color=ORANGE, radius=0.07))
            for k in range(1, 7):
                r = ring_radius(k, R_val)
                if r > 4.0:
                    break
                circ = Circle(radius=r, color=ORANGE, stroke_width=2.0)
                circ.move_to(center)
                grp.add(circ)
            return grp

        newton_dyn = always_redraw(lambda: make_newton_rings(R_tracker.get_value()))

        R_text = always_redraw(
            lambda: VGroup(
                Text("曲率半径 R =", font=CJK, color=WHITE).scale(0.42),
                Text(f"{R_tracker.get_value():.1f} (相对单位)",
                     font=CJK, color=ORANGE).scale(0.42),
            ).arrange(RIGHT, buff=0.1).to_edge(RIGHT, buff=0.5).shift(UP * 0.8)
        )
        r_formula_dyn = VGroup(
            MathTex(r"r_k \propto \sqrt{R}", color=GREEN).scale(0.72),
        ).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.1)

        self.play(FadeIn(newton_dyn), FadeIn(R_text), FadeIn(r_formula_dyn))
        self.wait(0.8)

        # R 从 2 → 5：环半径扩大
        self.play(R_tracker.animate.set_value(5.0), run_time=3.5, rate_func=smooth)
        self.wait(0.8)
        # R 从 5 → 1：环半径缩小
        self.play(R_tracker.animate.set_value(1.0), run_time=2.5, rate_func=smooth)
        self.wait(1.0)

        clear2 = VGroup(sec3_label, newton_dyn, R_text, r_formula_dyn)
        self.play(FadeOut(clear2))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # Step 7: 两者对比简表
        # ══════════════════════════════════════════════════════════════
        cmp_label = Text("劈尖 vs 牛顿环 对比", font=CJK, color=BLUE).scale(0.5)
        cmp_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(cmp_label))
        self.wait(0.4)

        rows = [
            (Text("", font=CJK, color=YELLOW).scale(0.42),
             Text("劈尖", font=CJK, color=CYAN).scale(0.42),
             Text("牛顿环", font=CJK, color=ORANGE).scale(0.42)),

            (Text("薄膜形状", font=CJK).scale(0.42),
             Text("楔形（线性增厚）", font=CJK).scale(0.38),
             Text("球面与平板之间（抛物线增厚）", font=CJK).scale(0.35)),

            (Text("条纹形状", font=CJK).scale(0.42),
             Text("平行直线", font=CJK).scale(0.38),
             Text("同心圆环", font=CJK).scale(0.38)),

            (Text("关键公式", font=CJK).scale(0.42),
             MathTex(r"L=\frac{\lambda}{2n\theta}", color=GREEN).scale(0.6),
             MathTex(r"r_k=\sqrt{kR\lambda}", color=GREEN).scale(0.6)),

            (Text("中心处", font=CJK).scale(0.42),
             Text("接触线为暗纹", font=CJK, color=RED).scale(0.38),
             Text("中心为暗点", font=CJK, color=RED).scale(0.38)),
        ]

        table_rows = VGroup()
        for row in rows:
            r_grp = VGroup(*row).arrange(RIGHT, buff=0.55)
            table_rows.add(r_grp)
        table_rows.arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        table_rows.next_to(cmp_label, DOWN, buff=0.35)
        table_rows.scale_to_fit_width(12.5)

        box_table = SurroundingRectangle(table_rows, color=BLUE, buff=0.22, corner_radius=0.1)
        self.play(FadeIn(table_rows), Create(box_table))
        self.wait(2.0)
        self.play(FadeOut(VGroup(cmp_label, table_rows, box_table)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        f1 = VGroup(
            Text("光程差：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\delta = 2ne + \dfrac{\lambda}{2}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        f2 = VGroup(
            Text("相邻暗纹厚度差：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Delta e = \dfrac{\lambda}{2n}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        f3 = VGroup(
            Text("劈尖条纹间距：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"L = \dfrac{\lambda}{2n\theta}", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        f4 = VGroup(
            Text("牛顿环暗环半径：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"r_k = \sqrt{k R \lambda}", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.15)

        key_note = Text("上表面有半波损失（λ/2），导致 δ 中多出 λ/2 项，中心处为暗点/暗线。",
                        font=CJK, color=RED).scale(0.4)

        summary = VGroup(f1, f2, f3, f4, key_note).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(f1), Write(f2))
        self.wait(0.6)
        self.play(Write(f3), Write(f4))
        self.wait(0.6)
        self.play(FadeIn(key_note), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp4ThinFilmEqualThickness",
        "id": "phys-ch11-11.1-kp4-thin-film-equal-thickness",
        "chapterId": "ch11",
        "sectionId": "11.1",
        "title": "等厚干涉：劈尖与牛顿环",
        "description": "侧视图演示劈尖光路与半波损失，ValueTracker 扫动夹角θ展示条纹间距变化，再切换至牛顿环俯视图动画出同心暗环并展示环半径随曲率半径R的平方根关系。",
    },
]
