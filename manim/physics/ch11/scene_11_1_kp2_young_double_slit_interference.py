"""第 11.1 节 · 杨氏双缝干涉（金标准范本：波动/光学几何图示 + ValueTracker 条纹扫动）。

可视化方案：
  1. 绘制双缝装置：光源 S → 双缝 S1/S2（间距 d）→ 屏（距离 D）
  2. 从 S1、S2 发出圆弧波阵面，叠加区高亮相长/相消
  3. 屏上实时渲染明暗条纹；ValueTracker 控制 λ/d，条纹间距 Δx=Dλ/d 实时更新
  4. 标注 k=0 中央明纹，k=±1,±2 对称分布

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 装置几何常量（场景坐标，单位 Manim units）──────────────────────────────
SOURCE_X = -5.5   # 单色光源 x
SLIT_X   = -1.5   # 双缝平面 x
SCREEN_X =  4.5   # 观察屏 x
SLIT_D   =  1.0   # 双缝间距（Manim 单位，视觉上的 d）
SCREEN_H =  3.8   # 屏高一半

# 物理参数（用于公式演示）
D_phys   = 1.0    # 双缝到屏距离 D (m)，规范化
LAM0     = 0.55   # 默认波长 λ（μm）


class Ch11Kp2YoungDoubleSlitInterference(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text(
            "杨氏双缝干涉：光路与条纹分布",
            font=CJK, color=BLUE
        ).scale(0.62).to_edge(UP)
        subtitle = Text(
            "第十一章  波动光学  ·  11.1",
            font=CJK, color=WHITE
        ).scale(0.38).next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text(
            "水面上两个振动源激起涟漪——",
            font=CJK
        ).scale(0.48)
        ana2 = Text(
            "两列波叠加，有的地方互相加强，有的地方互相抵消，",
            font=CJK
        ).scale(0.48)
        ana3 = Text(
            "光也是波，双缝就是两个相干光源，屏上就会出现明暗相间的条纹。",
            font=CJK, color=YELLOW
        ).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 绘制双缝装置（静态几何图）
        # ═══════════════════════════════════════════════════════════════
        # --- 光源 ---
        source_dot = Dot(point=[SOURCE_X, 0, 0], color=YELLOW, radius=0.13)
        source_label = Text("S", font=CJK, color=YELLOW).scale(0.42).next_to(
            source_dot, LEFT, buff=0.18
        )
        source_glow = Circle(radius=0.3, color=YELLOW, fill_opacity=0.15).move_to(
            [SOURCE_X, 0, 0]
        )

        # --- 双缝板 ---
        slit_gap = SLIT_D
        slit_top_gap    = 0.18
        slit_wall_thick = 0.08
        # 上板块：从屏顶到 S1 上边缘
        wall_top = Rectangle(
            width=slit_wall_thick, height=SCREEN_H - slit_gap / 2 - slit_top_gap,
            fill_color=BLUE_E, fill_opacity=0.9, stroke_color=BLUE
        ).move_to([SLIT_X, (SCREEN_H + slit_gap / 2 + slit_top_gap) / 2, 0])
        # 中间板块（S1 与 S2 之间）
        wall_mid = Rectangle(
            width=slit_wall_thick, height=slit_gap - 2 * slit_top_gap,
            fill_color=BLUE_E, fill_opacity=0.9, stroke_color=BLUE
        ).move_to([SLIT_X, 0, 0])
        # 下板块
        wall_bot = Rectangle(
            width=slit_wall_thick, height=SCREEN_H - slit_gap / 2 - slit_top_gap,
            fill_color=BLUE_E, fill_opacity=0.9, stroke_color=BLUE
        ).move_to([SLIT_X, -(SCREEN_H + slit_gap / 2 + slit_top_gap) / 2, 0])

        s1_y =  slit_gap / 2
        s2_y = -slit_gap / 2
        s1_dot = Dot(point=[SLIT_X, s1_y, 0], color=CYAN, radius=0.08)
        s2_dot = Dot(point=[SLIT_X, s2_y, 0], color=CYAN, radius=0.08)
        s1_label = Text("S1", font=CJK, color=CYAN).scale(0.38).next_to(s1_dot, LEFT, buff=0.1)
        s2_label = Text("S2", font=CJK, color=CYAN).scale(0.38).next_to(s2_dot, LEFT, buff=0.1)

        # d 的标注
        d_brace = Brace(Line([SLIT_X, s2_y, 0], [SLIT_X, s1_y, 0]), direction=LEFT, color=WHITE)
        d_label = MathTex(r"d").scale(0.55).next_to(d_brace, LEFT, buff=0.1)

        # --- 观察屏 ---
        screen_line = Line([SCREEN_X, -SCREEN_H, 0], [SCREEN_X, SCREEN_H, 0],
                           color=WHITE, stroke_width=4)
        screen_label = Text("屏", font=CJK, color=WHITE).scale(0.42).next_to(
            screen_line.get_top(), UP, buff=0.1
        )

        # D 的标注（水平 Brace 在底部）
        d_horiz_line = Line([SLIT_X, -SCREEN_H - 0.3, 0], [SCREEN_X, -SCREEN_H - 0.3, 0])
        D_brace = Brace(d_horiz_line, direction=DOWN, color=WHITE)
        D_label = MathTex(r"D").scale(0.55).next_to(D_brace, DOWN, buff=0.1)

        # --- 入射光线（平行光束）---
        ray_ys = [s1_y, 0, s2_y]
        rays = VGroup(*[
            Arrow(
                [SOURCE_X + 0.35, y, 0], [SLIT_X - slit_wall_thick / 2 - 0.05, y, 0],
                buff=0, color=YELLOW, stroke_width=2,
                max_tip_length_to_length_ratio=0.12
            )
            for y in ray_ys
        ])

        apparatus = VGroup(
            source_glow, source_dot, source_label,
            wall_top, wall_mid, wall_bot,
            s1_dot, s2_dot, s1_label, s2_label,
            d_brace, d_label,
            screen_line, screen_label,
            d_horiz_line, D_brace, D_label,
            rays,
        )

        self.play(FadeIn(VGroup(source_glow, source_dot, source_label)))
        self.wait(0.4)
        self.play(Create(rays), run_time=1.0)
        self.wait(0.3)
        self.play(FadeIn(VGroup(wall_top, wall_mid, wall_bot)))
        self.play(FadeIn(VGroup(s1_dot, s2_dot, s1_label, s2_label)))
        self.play(GrowFromCenter(d_brace), FadeIn(d_label))
        self.wait(0.3)
        self.play(Create(screen_line), FadeIn(screen_label))
        self.play(GrowFromCenter(D_brace), FadeIn(D_label))
        self.wait(1.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 从 S1、S2 发出圆弧波阵面（动画）
        # ═══════════════════════════════════════════════════════════════
        wave_caption = Text(
            "S1、S2 是两个同步相干光源，各自发出球面波（圆弧表示波峰）",
            font=CJK, color=GREEN
        ).scale(0.38).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(wave_caption))

        def make_arc_wave(cx, cy, r, color, angle_start=-PI/2.2, angle_end=PI/2.2):
            """在 (cx,cy) 处画一段圆弧，表示半径 r 处的波峰"""
            arc = Arc(
                radius=r,
                start_angle=angle_start,
                angle=angle_end - angle_start,
                color=color,
                stroke_width=2.0
            ).move_arc_center_to([cx, cy, 0])
            return arc

        # 分阶段展示从 S1 扩散的圆弧
        s1_arcs = VGroup()
        s2_arcs = VGroup()
        max_r = SCREEN_X - SLIT_X - 0.1
        num_waves = 5
        radii = [0.35 + i * (max_r - 0.35) / (num_waves - 1) for i in range(num_waves)]

        for r in radii:
            a1 = make_arc_wave(SLIT_X, s1_y, r, color=CYAN)
            a2 = make_arc_wave(SLIT_X, s2_y, r, color=ORANGE)
            s1_arcs.add(a1)
            s2_arcs.add(a2)

        self.play(
            LaggedStart(*[Create(a) for a in s1_arcs], lag_ratio=0.3),
            run_time=2.0
        )
        self.play(
            LaggedStart(*[Create(a) for a in s2_arcs], lag_ratio=0.3),
            run_time=2.0
        )
        self.wait(1.0)
        self.play(FadeOut(wave_caption))

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 相长/相消示意——高亮到屏幕上的典型路径
        # ═══════════════════════════════════════════════════════════════
        # 中央明纹（k=0）：两列波路程相等，δ=0
        # k=+1 明纹：y_1 = Dλ/d，这里用 Manim 坐标近似给一个位置
        #   屏宽 SCREEN_X - SLIT_X = 6，设 Δx_vis = 0.9 (视觉间距)
        delta_x_vis = 0.90   # 视觉条纹间距（Manim 单位）

        # 从 S1→P 和 S2→P 画路径
        def make_path_lines(py, col1, col2):
            p = [SCREEN_X, py, 0]
            l1 = DashedLine([SLIT_X, s1_y, 0], p, color=col1, stroke_width=1.8, dash_length=0.12)
            l2 = DashedLine([SLIT_X, s2_y, 0], p, color=col2, stroke_width=1.8, dash_length=0.12)
            return l1, l2

        # 中央明纹 k=0
        l1_c, l2_c = make_path_lines(0, CYAN, ORANGE)
        dot_c = Dot([SCREEN_X, 0, 0], color=YELLOW, radius=0.10)
        lbl_k0 = Text("k=0 中央明纹", font=CJK, color=YELLOW).scale(0.35).next_to(
            dot_c, RIGHT, buff=0.12
        )

        self.play(Create(l1_c), Create(l2_c))
        self.play(FadeIn(dot_c), FadeIn(lbl_k0))
        self.wait(0.8)

        # k=+1 明纹
        l1_p1, l2_p1 = make_path_lines(delta_x_vis, CYAN, ORANGE)
        dot_p1 = Dot([SCREEN_X, delta_x_vis, 0], color=YELLOW, radius=0.10)
        lbl_p1 = Text("k=+1", font=CJK, color=YELLOW).scale(0.32).next_to(dot_p1, RIGHT, buff=0.1)

        # k=-1 明纹
        l1_m1, l2_m1 = make_path_lines(-delta_x_vis, CYAN, ORANGE)
        dot_m1 = Dot([SCREEN_X, -delta_x_vis, 0], color=YELLOW, radius=0.10)
        lbl_m1 = Text("k=-1", font=CJK, color=YELLOW).scale(0.32).next_to(dot_m1, RIGHT, buff=0.1)

        self.play(Create(l1_p1), Create(l2_p1), Create(l1_m1), Create(l2_m1))
        self.play(FadeIn(dot_p1), FadeIn(lbl_p1), FadeIn(dot_m1), FadeIn(lbl_m1))
        self.wait(0.8)

        # k=+2 / k=-2
        l1_p2, l2_p2 = make_path_lines(2 * delta_x_vis, CYAN, ORANGE)
        dot_p2 = Dot([SCREEN_X, 2 * delta_x_vis, 0], color=YELLOW, radius=0.08)
        lbl_p2 = Text("k=+2", font=CJK, color=YELLOW).scale(0.30).next_to(dot_p2, RIGHT, buff=0.1)

        l1_m2, l2_m2 = make_path_lines(-2 * delta_x_vis, CYAN, ORANGE)
        dot_m2 = Dot([SCREEN_X, -2 * delta_x_vis, 0], color=YELLOW, radius=0.08)
        lbl_m2 = Text("k=-2", font=CJK, color=YELLOW).scale(0.30).next_to(dot_m2, RIGHT, buff=0.1)

        self.play(Create(l1_p2), Create(l2_p2), Create(l1_m2), Create(l2_m2))
        self.play(FadeIn(dot_p2), FadeIn(lbl_p2), FadeIn(dot_m2), FadeIn(lbl_m2))
        self.wait(1.2)

        # 清场路径与弧线（保留装置 + 明纹点）
        path_group = VGroup(
            l1_c, l2_c, l1_p1, l2_p1, l1_m1, l2_m1,
            l1_p2, l2_p2, l1_m2, l2_m2,
            s1_arcs, s2_arcs
        )
        self.play(FadeOut(path_group))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 6: 光程差条件公式（逐步推导）
        # ═══════════════════════════════════════════════════════════════
        # 清场多余标注，只留装置骨架
        dots_labels = VGroup(
            dot_c, lbl_k0,
            dot_p1, lbl_p1, dot_m1, lbl_m1,
            dot_p2, lbl_p2, dot_m2, lbl_m2,
        )

        # 公式区域放在屏左上
        eq_title = Text("干涉条件推导", font=CJK, color=BLUE).scale(0.45)
        eq_title.to_corner(UL, buff=0.6).shift(RIGHT * 0.2)

        eq1 = MathTex(r"\delta = r_2 - r_1 \approx \frac{d \cdot x}{D}").scale(0.70)
        eq1_zh = Text("光程差：屏上 x 处", font=CJK, color=WHITE).scale(0.36)
        line1 = VGroup(eq1_zh, eq1).arrange(RIGHT, buff=0.25)

        eq2 = MathTex(r"\delta = k\lambda \Rightarrow x_k = k\frac{D\lambda}{d}").scale(0.70)
        eq2_zh = Text("明纹条件（k=0,±1,±2,...）", font=CJK, color=YELLOW).scale(0.36)
        line2 = VGroup(eq2_zh, eq2).arrange(RIGHT, buff=0.25)
        eq2.set_color(YELLOW)

        eq3 = MathTex(
            r"\delta = \left(k+\tfrac{1}{2}\right)\lambda \Rightarrow \text{dark}"
        ).scale(0.65)
        eq3_real = MathTex(
            r"\delta = \left(k+\tfrac{1}{2}\right)\lambda"
        ).scale(0.70)
        eq3_zh = Text("暗纹条件", font=CJK, color=RED).scale(0.36)
        line3 = VGroup(eq3_zh, eq3_real).arrange(RIGHT, buff=0.25)
        eq3_real.set_color(RED)

        eq4 = MathTex(r"\Delta x = \frac{D\lambda}{d}").scale(0.78)
        eq4_zh = Text("条纹间距", font=CJK, color=GREEN).scale(0.36)
        line4 = VGroup(eq4_zh, eq4).arrange(RIGHT, buff=0.25)
        eq4.set_color(GREEN)

        eqs = VGroup(line1, line2, line3, line4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        eqs.next_to(title, DOWN, buff=0.55).to_edge(LEFT, buff=0.5)
        eqs.scale_to_fit_width(6.5)

        self.play(FadeIn(eq_title))
        self.wait(0.3)
        self.play(Write(line1))
        self.wait(1.2)
        self.play(Write(line2))
        self.wait(1.2)
        self.play(Write(line3))
        self.wait(1.2)
        self.play(Write(line4))
        self.wait(1.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 屏上条纹渲染（ValueTracker：λ 和 d）
        # ═══════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(eqs, eq_title, dots_labels, apparatus)))
        self.wait(0.5)

        # 重画简化装置（只保留缝和屏的符号）
        slit_line = DashedLine(
            [SLIT_X, -SCREEN_H * 0.6, 0], [SLIT_X, SCREEN_H * 0.6, 0],
            color=BLUE_B, stroke_width=2
        )
        slit_tag = Text("双缝", font=CJK, color=BLUE_B).scale(0.36).next_to(
            slit_line, UP, buff=0.12
        )
        screen_line2 = Line(
            [SCREEN_X, -SCREEN_H, 0], [SCREEN_X, SCREEN_H, 0],
            color=WHITE, stroke_width=3
        )
        screen_tag = Text("屏", font=CJK, color=WHITE).scale(0.38).next_to(
            screen_line2.get_top(), UP, buff=0.1
        )

        # ValueTracker：λ 归一化（0.0 ~ 1.0 对应条纹间距 0.5 ~ 1.5 Manim units）
        lam_tracker = ValueTracker(0.55)   # 代表 λ 从 0.4 到 0.7 μm
        d_tracker   = ValueTracker(1.0)    # 代表 d 从 0.5 到 1.5 mm

        # 条纹间距（Manim 单位）：Δx_vis = base * (λ/λ0) / (d/d0)
        BASE_FRINGE = 0.90   # λ=0.55μm, d=1.0mm 时的视觉条纹间距
        D_SCREEN = 6.0       # Manim 坐标系中双缝到屏的距离

        def get_delta_x():
            lam = lam_tracker.get_value()
            d   = d_tracker.get_value()
            return BASE_FRINGE * (lam / 0.55) / (d / 1.0)

        # --- 屏上明暗条纹（用矩形色块表示）---
        FRINGE_W = 0.30  # 条纹宽度（Manim 单位）
        N_FRINGES = 9    # 显示条纹数（±4 + 中央）

        def make_fringe_pattern():
            dx = get_delta_x()
            strips = VGroup()
            for k in range(-N_FRINGES, N_FRINGES + 1):
                y_center = k * dx / 2   # 明纹和暗纹各半周期交替
                # 奇数 k 为暗纹，偶数为明纹
                is_bright = (k % 2 == 0)
                col = YELLOW if is_bright else BLACK
                opacity = 0.85 if is_bright else 0.9
                strip = Rectangle(
                    width=FRINGE_W, height=dx / 2,
                    fill_color=col, fill_opacity=opacity,
                    stroke_width=0
                ).move_to([SCREEN_X - FRINGE_W / 2, y_center, 0])
                strips.add(strip)
            return strips

        fringes = always_redraw(make_fringe_pattern)

        # 当前 Δx 数值显示
        def make_dx_label():
            dx = get_delta_x()
            lam = lam_tracker.get_value()
            d   = d_tracker.get_value()
            # 公式显示
            formula_lhs = MathTex(r"\Delta x = \frac{D\lambda}{d}").scale(0.58)
            val_txt = Text(
                f"= {dx:.2f} (Manim)",
                font=CJK
            ).scale(0.38)
            row = VGroup(formula_lhs, val_txt).arrange(RIGHT, buff=0.2)
            row.to_corner(DR, buff=0.5)
            return row

        dx_label = always_redraw(make_dx_label)

        # 参数条
        def make_param_bar():
            lam = lam_tracker.get_value()
            d   = d_tracker.get_value()
            lam_line = VGroup(
                Text("λ =", font=CJK, color=CYAN).scale(0.36),
                Text(f"{lam:.3f} μm", font=CJK, color=YELLOW).scale(0.36),
            ).arrange(RIGHT, buff=0.12)
            d_line = VGroup(
                Text("d =", font=CJK, color=CYAN).scale(0.36),
                Text(f"{d:.2f} mm", font=CJK, color=ORANGE).scale(0.36),
            ).arrange(RIGHT, buff=0.12)
            bar = VGroup(lam_line, d_line).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
            bar.to_corner(DL, buff=0.55)
            return bar

        param_bar = always_redraw(make_param_bar)

        self.play(
            FadeIn(slit_line), FadeIn(slit_tag),
            FadeIn(screen_line2), FadeIn(screen_tag),
        )
        self.play(FadeIn(fringes), FadeIn(dx_label), FadeIn(param_bar))
        self.wait(1.0)

        # 演示 1：增大 λ → 条纹变宽
        lam_tip = Text("增大 λ（红光），条纹间距增大", font=CJK, color=GREEN).scale(0.40)
        lam_tip.to_edge(UP, buff=0.55).shift(DOWN * 0.45)
        self.play(FadeIn(lam_tip))
        self.play(lam_tracker.animate.set_value(0.70), run_time=2.5, rate_func=smooth)
        self.wait(1.0)
        self.play(lam_tracker.animate.set_value(0.40), run_time=2.5, rate_func=smooth)
        self.wait(0.8)
        self.play(lam_tracker.animate.set_value(0.55), run_time=1.2)
        self.play(FadeOut(lam_tip))

        # 演示 2：增大 d → 条纹变窄
        d_tip = Text("增大双缝间距 d，条纹间距减小", font=CJK, color=GREEN).scale(0.40)
        d_tip.to_edge(UP, buff=0.55).shift(DOWN * 0.45)
        self.play(FadeIn(d_tip))
        self.play(d_tracker.animate.set_value(1.8), run_time=2.5, rate_func=smooth)
        self.wait(1.0)
        self.play(d_tracker.animate.set_value(0.5), run_time=2.5, rate_func=smooth)
        self.wait(0.8)
        self.play(d_tracker.animate.set_value(1.0), run_time=1.2)
        self.play(FadeOut(d_tip))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 标注中央明纹与对称分布
        # ═══════════════════════════════════════════════════════════════
        dx_now = get_delta_x()
        sym_caption = Text(
            "k=0 中央明纹最亮；k=±1,±2,... 对称分布，间距均匀",
            font=CJK, color=YELLOW
        ).scale(0.40).to_edge(UP, buff=0.55).shift(DOWN * 0.45)
        self.play(FadeIn(sym_caption))

        # 用箭头标注各级次
        arrow_labels = VGroup()
        for k, label_str, col in [
            (0,  "k=0",  YELLOW),
            (1,  "k=+1", ORANGE),
            (-1, "k=-1", ORANGE),
            (2,  "k=+2", RED),
            (-2, "k=-2", RED),
        ]:
            y_pos = k * dx_now
            if abs(y_pos) > SCREEN_H - 0.5:
                continue
            arrow = Arrow(
                [SCREEN_X + 0.15, y_pos, 0],
                [SCREEN_X + 0.65, y_pos, 0],
                buff=0, color=col,
                max_tip_length_to_length_ratio=0.35,
                stroke_width=2
            )
            lbl = Text(label_str, font=CJK, color=col).scale(0.32).next_to(arrow, RIGHT, buff=0.05)
            arrow_labels.add(VGroup(arrow, lbl))

        self.play(LaggedStart(*[FadeIn(al) for al in arrow_labels], lag_ratio=0.3), run_time=1.5)
        self.wait(2.0)

        # 清场动态元素
        self.play(
            FadeOut(VGroup(
                fringes, dx_label, param_bar,
                sym_caption, arrow_labels,
                slit_line, slit_tag, screen_line2, screen_tag,
            ))
        )
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 9: 数值例题
        # ═══════════════════════════════════════════════════════════════
        ex_title = Text("数值例题", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.55)
        cond1 = Text("已知：D = 1.0 m，d = 0.5 mm，λ = 550 nm（绿光）", font=CJK).scale(0.42)
        cond2_lhs = Text("求：条纹间距  ", font=CJK).scale(0.42)
        cond2_rhs = MathTex(r"\Delta x = ?").scale(0.6)
        cond2 = VGroup(cond2_lhs, cond2_rhs).arrange(RIGHT, buff=0.1)
        conds = VGroup(cond1, cond2).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        conds.next_to(ex_title, DOWN, buff=0.45)

        self.play(FadeIn(ex_title), FadeIn(cond1))
        self.wait(0.8)
        self.play(FadeIn(cond2))
        self.wait(0.8)

        # 计算步骤
        step_eq1 = MathTex(
            r"\Delta x = \frac{D\lambda}{d}"
        ).scale(0.75)
        step_eq2 = MathTex(
            r"= \frac{1.0 \times 550\times10^{-9}}{0.5\times10^{-3}}"
        ).scale(0.72)
        step_eq3 = MathTex(
            r"= 1.1 \times 10^{-3}\ \mathrm{m} = 1.1\ \mathrm{mm}"
        ).scale(0.72).set_color(GREEN)

        steps = VGroup(step_eq1, step_eq2, step_eq3).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        steps.next_to(conds, DOWN, buff=0.45).shift(RIGHT * 0.8)

        self.play(Write(step_eq1))
        self.wait(0.6)
        self.play(Write(step_eq2))
        self.wait(0.6)
        self.play(Write(step_eq3))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, conds, steps)))

        # ═══════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ═══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(s_title))

        row_a = VGroup(
            Text("光程差：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\delta = \frac{d \cdot x}{D}").scale(0.75),
        ).arrange(RIGHT, buff=0.2)

        row_b = VGroup(
            Text("明纹位置：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"x_k = k\frac{D\lambda}{d},\quad k=0,\pm1,\pm2,\ldots").scale(0.68),
        ).arrange(RIGHT, buff=0.2)
        row_b[1].set_color(YELLOW)

        row_c = VGroup(
            Text("暗纹位置：", font=CJK, color=RED).scale(0.42),
            MathTex(r"x_k = \left(k+\tfrac{1}{2}\right)\frac{D\lambda}{d}").scale(0.68),
        ).arrange(RIGHT, buff=0.2)
        row_c[1].set_color(RED)

        row_d = VGroup(
            Text("条纹间距：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\Delta x = \frac{D\lambda}{d}").scale(0.78),
        ).arrange(RIGHT, buff=0.2)
        row_d[1].set_color(GREEN)

        row_e = Text(
            "λ↑ 或 d↓ → 条纹变宽；D↑ → 条纹变宽",
            font=CJK, color=CYAN
        ).scale(0.40)

        summary = VGroup(row_a, row_b, row_c, row_d, row_e).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT
        ).next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(row_a))
        self.wait(0.6)
        self.play(Write(row_b))
        self.wait(0.6)
        self.play(Write(row_c))
        self.wait(0.6)
        self.play(Write(row_d))
        self.wait(0.6)
        self.play(FadeIn(row_e), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch11Kp2YoungDoubleSlitInterference",
        "id": "phys-ch11-11.1-kp2-young-double-slit-interference",
        "chapterId": "ch11",
        "sectionId": "11.1",
        "title": "杨氏双缝干涉光路与条纹分布",
        "description": "绘制双缝装置几何图示，演示S1/S2圆弧波阵面叠加，用ValueTracker实时控制λ和d展示屏上明暗条纹与间距公式Δx=Dλ/d。",
    },
]
