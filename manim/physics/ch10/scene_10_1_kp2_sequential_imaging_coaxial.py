"""第 10.1 节 · 共轴球面系统逐次成像法（单折射面公式 → 两面级联 → 虚物演示）。

可视化思路：
1. 横向排列两个折射球面 O1、O2，背景分三段（介质 n0 n1 n2）。
2. 物点 P 经第一面成中间像 P1，P1 自动成为第二面的物继续传播至最终像 P2。
3. ValueTracker 控制两面间距 d；d < v1 时 P1 跑到第二面右侧 → 虚物警告弹出，
   左上角实时计算链 u2 = d - v1 自动变色。
4. 顺序：标题 → 类比 → 单面折射公式 → 两面光路图 + 计算链 →
         ValueTracker 扫动 d → 虚物提示 → 数值例子 → 小结卡。

铁律：MathTex 内只含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数（固定折射率 + 折射半径，d 用 ValueTracker 控制）──────────────
N0, N1, N2 = 1.0, 1.5, 1.0   # 空气 → 玻璃 → 空气
R1, R2 = 2.0, -2.5            # 第一面半径（凸左），第二面半径（凸右）
U1 = -6.0                     # 物距（负号：物在左侧）

def single_surface_image(n_in, n_out, R, u):
    """单球面成像公式 n_out/v = (n_out-n_in)/R - n_in/u，返回像距 v。
    u 符号约定：物在左侧为负。"""
    lhs = (n_out - n_in) / R + n_in / u   # = n_out / v
    if abs(lhs) < 1e-9:
        return float('inf')
    return n_out / lhs


class Ch10Kp2SequentialImagingCoaxial(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("共轴球面系统：逐次成像法", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text("摄影镜头里有好几片玻璃——光每穿过一片，", font=CJK).scale(0.48)
        ana2 = Text("前一片的「出射像」就自动成为下一片的「入射物」。", font=CJK).scale(0.48)
        ana3 = Text("把这个接力过程一步步算下去，就是逐次成像法。", font=CJK, color=GREEN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 单折射球面公式（逐步出现 + 高亮）
        # ═══════════════════════════════════════════════════════════════
        step3_head = Text("单折射球面成像公式", font=CJK, color=BLUE).scale(0.52)
        step3_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(step3_head))

        # 公式拆分：逐项出现
        f1 = MathTex(r"\frac{n_1}{u}", "+", r"\frac{n_2}{v}", "=", r"\frac{n_2 - n_1}{R}").scale(0.9)
        f1.next_to(step3_head, DOWN, buff=0.45)
        f1[0].set_color(YELLOW)   # n1/u
        f1[2].set_color(GREEN)    # n2/v
        f1[4].set_color(CYAN)     # rhs
        self.play(Write(f1[0]))
        self.wait(0.4)
        self.play(Write(f1[1]), Write(f1[2]))
        self.wait(0.4)
        self.play(Write(f1[3]), Write(f1[4]))
        self.wait(0.6)

        note_u = VGroup(
            Text("u: 物距（物在顶点左侧取负）", font=CJK, color=YELLOW).scale(0.40),
            Text("v: 像距（像在顶点右侧取正）", font=CJK, color=GREEN).scale(0.40),
            Text("R: 球面半径（曲率中心在右取正）", font=CJK, color=CYAN).scale(0.40),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(f1, DOWN, buff=0.35)
        self.play(FadeIn(note_u))
        self.wait(1.6)
        self.play(FadeOut(VGroup(step3_head, f1, note_u)))

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 两面光路示意图（静态布局）
        # ═══════════════════════════════════════════════════════════════
        # 坐标系：光轴水平，屏幕中心偏下 0.5
        AXIS_Y = -0.5
        O1_X, O2_X_BASE = -2.5, 1.5   # 固定 O1，O2 初始位置
        P_X = -5.8    # 物点 x 坐标
        AXIS_HALF_H = 1.4   # 光轴上下范围

        # 光轴
        optical_axis = Line(
            LEFT * 6.8 + UP * AXIS_Y,
            RIGHT * 6.2 + UP * AXIS_Y,
            color=WHITE, stroke_width=1.5
        )
        ax_lbl = Text("光轴", font=CJK, color=WHITE).scale(0.35)
        ax_lbl.next_to(optical_axis.get_end(), RIGHT, buff=0.12)

        # 介质标签背景（三段，颜色区分）
        bg_n0 = Rectangle(
            width=3.8, height=2.9,
            fill_color="#0d1a2a", fill_opacity=0.7, stroke_opacity=0
        ).move_to(LEFT * 4.9 + UP * AXIS_Y)
        bg_n1 = Rectangle(
            width=4.2, height=2.9,
            fill_color="#1a2a0d", fill_opacity=0.7, stroke_opacity=0
        ).move_to(LEFT * 0.45 + UP * AXIS_Y)
        bg_n2 = Rectangle(
            width=3.0, height=2.9,
            fill_color="#2a1a0d", fill_opacity=0.7, stroke_opacity=0
        ).move_to(RIGHT * 4.7 + UP * AXIS_Y)

        lbl_n0 = VGroup(
            MathTex(r"n_0").scale(0.55),
            Text("=1.0", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.05).move_to(LEFT * 5.5 + UP * (AXIS_Y + 1.0)).set_color(WHITE)
        lbl_n1 = VGroup(
            MathTex(r"n_1").scale(0.55),
            Text("=1.5", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.05).move_to(LEFT * 0.45 + UP * (AXIS_Y + 1.0)).set_color(GREEN)
        lbl_n2 = VGroup(
            MathTex(r"n_2").scale(0.55),
            Text("=1.0", font=CJK).scale(0.38)
        ).arrange(RIGHT, buff=0.05).move_to(RIGHT * 4.6 + UP * (AXIS_Y + 1.0)).set_color(ORANGE)

        self.play(
            FadeIn(bg_n0), FadeIn(bg_n1), FadeIn(bg_n2),
            Create(optical_axis), FadeIn(ax_lbl)
        )
        self.play(FadeIn(lbl_n0), FadeIn(lbl_n1), FadeIn(lbl_n2))

        # 折射面：用竖直线 + 弧线拼成「球面」外观
        def make_surface(cx, color_):
            """在 x=cx 处画一条竖虚线作为折射面顶点标记。"""
            seg = DashedLine(
                np.array([cx, AXIS_Y - AXIS_HALF_H, 0]),
                np.array([cx, AXIS_Y + AXIS_HALF_H, 0]),
                color=color_, dash_length=0.12, stroke_width=2.5
            )
            return seg

        surf1 = make_surface(O1_X, CYAN)
        surf2 = make_surface(O2_X_BASE, ORANGE)
        lbl_O1 = MathTex(r"O_1").scale(0.55).next_to(
            np.array([O1_X, AXIS_Y - AXIS_HALF_H - 0.1, 0]), DOWN, buff=0.1
        ).set_color(CYAN)
        lbl_O2 = MathTex(r"O_2").scale(0.55).next_to(
            np.array([O2_X_BASE, AXIS_Y - AXIS_HALF_H - 0.1, 0]), DOWN, buff=0.1
        ).set_color(ORANGE)

        self.play(Create(surf1), Create(surf2), FadeIn(lbl_O1), FadeIn(lbl_O2))

        # 物点 P
        P_dot = Dot(np.array([P_X, AXIS_Y, 0]), color=YELLOW, radius=0.10)
        P_lbl = MathTex(r"P").scale(0.55).next_to(P_dot, LEFT, buff=0.12).set_color(YELLOW)
        self.play(FadeIn(P_dot), FadeIn(P_lbl))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 第一面成像 — 两条近轴光线 + 中间像点 P1
        # ═══════════════════════════════════════════════════════════════
        # 计算 v1
        v1_val = single_surface_image(N0, N1, R1, U1)
        P1_X = O1_X + v1_val   # 中间像 x 坐标

        ray_h = 0.75   # 平行入射光线高度

        # 光线 1：平行于光轴，从 P_X 高 ray_h 处入射，经 O1 折射后会聚 P1
        ray1_in = Line(
            np.array([P_X, AXIS_Y + ray_h, 0]),
            np.array([O1_X, AXIS_Y + ray_h, 0]),
            color=YELLOW, stroke_width=2
        )
        # 折射后朝 P1 下行
        ray1_out = Line(
            np.array([O1_X, AXIS_Y + ray_h, 0]),
            np.array([P1_X, AXIS_Y, 0]),
            color=YELLOW, stroke_width=2
        )

        # 光线 2：从物点 P 指向顶点 O1（中心光线），直通顶点后以不同角度出射
        # 简化：从 P 到 O1，再从 O1 到 P1
        ray2_in = Line(
            np.array([P_X, AXIS_Y, 0]),
            np.array([O1_X, AXIS_Y - ray_h * 0.5, 0]),
            color=ORANGE, stroke_width=2
        )
        ray2_out = Line(
            np.array([O1_X, AXIS_Y - ray_h * 0.5, 0]),
            np.array([P1_X, AXIS_Y, 0]),
            color=ORANGE, stroke_width=2
        )

        step5_lbl = Text("第一步：光经第一面折射，成中间像 P1", font=CJK, color=CYAN).scale(0.44)
        step5_lbl.next_to(title, DOWN, buff=0.38)

        self.play(FadeIn(step5_lbl))
        self.play(Create(ray1_in), run_time=0.8)
        self.play(Create(ray1_out), Create(ray2_in), Create(ray2_out), run_time=1.2)

        # 中间像点 P1（虚框标出）
        P1_dot = Dot(np.array([P1_X, AXIS_Y, 0]), color=GREEN, radius=0.10)
        P1_lbl = MathTex(r"P_1").scale(0.55).next_to(P1_dot, UP, buff=0.15).set_color(GREEN)
        P1_box_lbl = Text("第一面的像", font=CJK, color=GREEN).scale(0.36)
        P1_box_lbl.next_to(P1_lbl, UP, buff=0.12)
        P1_box = SurroundingRectangle(
            VGroup(P1_dot, P1_lbl, P1_box_lbl),
            color=GREEN, buff=0.12, corner_radius=0.08
        )
        self.play(FadeIn(P1_dot), FadeIn(P1_lbl), FadeIn(P1_box_lbl), Create(P1_box))
        self.wait(1.4)

        # ═══════════════════════════════════════════════════════════════
        # Step 6: 左上角实时计算链（静态初始值）
        # ═══════════════════════════════════════════════════════════════
        D_INIT = 4.0   # 两面间距初始值
        u2_init = D_INIT - v1_val
        v2_init = single_surface_image(N1, N2, R2, u2_init)

        def fmt(x, digits=2):
            if abs(x) > 1e6:
                return r"\infty"
            return f"{x:.{digits}f}"

        chain_title = Text("计算链", font=CJK, color=WHITE).scale(0.40)
        chain_u1 = VGroup(
            Text("u1 =", font=CJK, color=YELLOW).scale(0.38),
            MathTex(rf"{fmt(U1)}", color=YELLOW).scale(0.55)
        ).arrange(RIGHT, buff=0.08)
        chain_v1 = VGroup(
            Text("v1 =", font=CJK, color=GREEN).scale(0.38),
            MathTex(rf"{fmt(v1_val)}", color=GREEN).scale(0.55)
        ).arrange(RIGHT, buff=0.08)
        chain_u2 = VGroup(
            Text("u2=d-v1=", font=CJK, color=CYAN).scale(0.38),
            MathTex(rf"{fmt(u2_init)}", color=CYAN).scale(0.55)
        ).arrange(RIGHT, buff=0.08)
        chain_v2 = VGroup(
            Text("v2 =", font=CJK, color=ORANGE).scale(0.38),
            MathTex(rf"{fmt(v2_init)}", color=ORANGE).scale(0.55)
        ).arrange(RIGHT, buff=0.08)

        chain = VGroup(chain_title, chain_u1, chain_v1, chain_u2, chain_v2)
        chain.arrange(DOWN, buff=0.14, aligned_edge=LEFT)
        chain.scale(0.92).to_corner(UL, buff=0.55)

        self.play(FadeIn(chain))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 第二面成像 — P1 成为第二面的「物」，会聚到 P2
        # ═══════════════════════════════════════════════════════════════
        P2_X = O2_X_BASE + v2_init

        # 光线从 P1 出发，经 O2 折射到 P2
        ray3_in = Line(
            np.array([P1_X, AXIS_Y, 0]),
            np.array([O2_X_BASE, AXIS_Y + ray_h * 0.6, 0]),
            color=YELLOW, stroke_width=2
        )
        ray4_in = Line(
            np.array([P1_X, AXIS_Y, 0]),
            np.array([O2_X_BASE, AXIS_Y - ray_h * 0.4, 0]),
            color=ORANGE, stroke_width=2
        )
        ray3_out = Line(
            np.array([O2_X_BASE, AXIS_Y + ray_h * 0.6, 0]),
            np.array([P2_X, AXIS_Y, 0]),
            color=YELLOW, stroke_width=2
        )
        ray4_out = Line(
            np.array([O2_X_BASE, AXIS_Y - ray_h * 0.4, 0]),
            np.array([P2_X, AXIS_Y, 0]),
            color=ORANGE, stroke_width=2
        )

        step7_lbl = Text("第二步：P1 作为第二面的物，继续折射得最终像 P2", font=CJK, color=ORANGE).scale(0.42)
        step7_lbl.next_to(title, DOWN, buff=0.38)
        self.play(FadeOut(step5_lbl), FadeIn(step7_lbl))
        self.play(Create(ray3_in), Create(ray4_in), run_time=0.8)
        self.play(Create(ray3_out), Create(ray4_out), run_time=0.8)

        P2_dot = Dot(np.array([P2_X, AXIS_Y, 0]), color=RED, radius=0.12)
        P2_lbl = MathTex(r"P_2").scale(0.60).next_to(P2_dot, UP, buff=0.15).set_color(RED)
        final_lbl = Text("最终像", font=CJK, color=RED).scale(0.36).next_to(P2_lbl, UP, buff=0.1)
        self.play(FadeIn(P2_dot), FadeIn(P2_lbl), FadeIn(final_lbl))
        self.wait(1.6)

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 公式推导 — 逐次传递的核心方程
        # ═══════════════════════════════════════════════════════════════
        # 先清除光线图，保留背景与标题
        ray_group = VGroup(ray1_in, ray1_out, ray2_in, ray2_out,
                           ray3_in, ray4_in, ray3_out, ray4_out,
                           P_dot, P_lbl, P1_dot, P1_lbl, P1_box_lbl, P1_box,
                           P2_dot, P2_lbl, final_lbl, step7_lbl, chain)
        self.play(FadeOut(ray_group),
                  FadeOut(VGroup(surf1, surf2, lbl_O1, lbl_O2,
                                 optical_axis, ax_lbl,
                                 bg_n0, bg_n1, bg_n2,
                                 lbl_n0, lbl_n1, lbl_n2)))

        # 三条公式逐步出现
        eq_head = Text("逐次成像的三条核心方程", font=CJK, color=BLUE).scale(0.52)
        eq_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(eq_head))

        eq1 = MathTex(
            r"\frac{n_0}{u_1} + \frac{n_1}{v_1} = \frac{n_1 - n_0}{r_1}",
            color=YELLOW
        ).scale(0.82)
        eq2 = MathTex(
            r"u_2 = d - v_1",
            color=CYAN
        ).scale(0.82)
        eq3 = MathTex(
            r"\frac{n_1}{u_2} + \frac{n_2}{v_2} = \frac{n_2 - n_1}{r_2}",
            color=GREEN
        ).scale(0.82)

        eq_note1 = Text("第一面成像，求 v1", font=CJK, color=YELLOW).scale(0.40)
        eq_note2 = Text("像距传递：v1 换算成第二面物距 u2", font=CJK, color=CYAN).scale(0.40)
        eq_note3 = Text("第二面成像，求最终像距 v2", font=CJK, color=GREEN).scale(0.40)

        row1 = VGroup(eq1, eq_note1).arrange(RIGHT, buff=0.5)
        row2 = VGroup(eq2, eq_note2).arrange(RIGHT, buff=0.5)
        row3 = VGroup(eq3, eq_note3).arrange(RIGHT, buff=0.5)
        eq_stack = VGroup(row1, row2, row3).arrange(DOWN, buff=0.45).next_to(eq_head, DOWN, buff=0.45)
        eq_stack.scale_to_fit_width(12.5)

        self.play(Write(eq1), FadeIn(eq_note1))
        self.wait(0.8)
        self.play(Write(eq2), FadeIn(eq_note2))
        self.wait(0.8)
        self.play(Write(eq3), FadeIn(eq_note3))
        self.wait(1.8)

        # 高亮 u2 = d - v1 (传递关键)
        self.play(eq2.animate.set_color(WHITE).scale(1.15))
        hl_note = Text("关键！第一面的像距直接决定第二面的物距", font=CJK, color=RED).scale(0.42)
        hl_note.next_to(eq_stack, DOWN, buff=0.3)
        self.play(FadeIn(hl_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq_head, eq_stack, hl_note)))

        # ═══════════════════════════════════════════════════════════════
        # Step 9: ValueTracker 扫动两面间距 d —— 虚物演示
        # ═══════════════════════════════════════════════════════════════
        track_title = Text("改变两面间距 d：观察虚物现象", font=CJK, color=BLUE).scale(0.50)
        track_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(track_title))

        d_tracker = ValueTracker(D_INIT)

        # --- 重建简化光路场景（用 always_redraw）---

        # 背景介质条
        def bg_strip(left_x, right_x, color_, y_center=AXIS_Y):
            w = right_x - left_x
            return Rectangle(
                width=w, height=2.6,
                fill_color=color_, fill_opacity=0.55, stroke_opacity=0
            ).move_to(np.array([(left_x + right_x) / 2, y_center, 0]))

        AX = Axes(
            x_range=[-7, 7, 1], y_range=[-1.8, 1.8, 1],
            x_length=13, y_length=3.0,
            axis_config={"color": DARK_GREY, "include_tip": False, "stroke_width": 1},
        ).shift(DOWN * (0.8 - AXIS_Y))   # 对齐 AXIS_Y

        self.play(Create(AX))

        # 静态：光轴线
        oaxis2 = Line(
            np.array([-6.8, AXIS_Y, 0]), np.array([6.2, AXIS_Y, 0]),
            color=WHITE, stroke_width=1.2
        )
        self.play(Create(oaxis2))

        # 静态：O1 折射面
        surf1b = DashedLine(
            np.array([O1_X, AXIS_Y - AXIS_HALF_H, 0]),
            np.array([O1_X, AXIS_Y + AXIS_HALF_H, 0]),
            color=CYAN, dash_length=0.12, stroke_width=2.5
        )
        lbl_O1b = MathTex(r"O_1").scale(0.5).next_to(
            np.array([O1_X, AXIS_Y - AXIS_HALF_H, 0]), DOWN, buff=0.1
        ).set_color(CYAN)
        self.play(Create(surf1b), FadeIn(lbl_O1b))

        # 动态：O2 随 d 移动
        def make_surf2():
            d = d_tracker.get_value()
            cx = O1_X + d
            seg = DashedLine(
                np.array([cx, AXIS_Y - AXIS_HALF_H, 0]),
                np.array([cx, AXIS_Y + AXIS_HALF_H, 0]),
                color=ORANGE, dash_length=0.12, stroke_width=2.5
            )
            return seg

        def make_O2_label():
            d = d_tracker.get_value()
            cx = O1_X + d
            return MathTex(r"O_2").scale(0.50).next_to(
                np.array([cx, AXIS_Y - AXIS_HALF_H, 0]), DOWN, buff=0.1
            ).set_color(ORANGE)

        surf2b = always_redraw(make_surf2)
        lbl_O2b = always_redraw(make_O2_label)
        self.add(surf2b, lbl_O2b)

        # 物点 P（静态）
        P_dot2 = Dot(np.array([P_X, AXIS_Y, 0]), color=YELLOW, radius=0.10)
        P_lbl2 = MathTex(r"P").scale(0.50).next_to(P_dot2, LEFT, buff=0.10).set_color(YELLOW)
        self.play(FadeIn(P_dot2), FadeIn(P_lbl2))

        # 动态：中间像 P1（位置固定，只取决于第一面）
        P1_X_val = O1_X + v1_val

        P1_dot2 = Dot(np.array([P1_X_val, AXIS_Y, 0]), color=GREEN, radius=0.09)
        P1_lbl2 = MathTex(r"P_1").scale(0.48).next_to(P1_dot2, UP, buff=0.12).set_color(GREEN)
        self.play(FadeIn(P1_dot2), FadeIn(P1_lbl2))

        # 动态：最终像 P2
        def make_P2():
            d = d_tracker.get_value()
            u2 = d - v1_val
            O2_x = O1_X + d
            try:
                v2 = single_surface_image(N1, N2, R2, u2)
                P2_x = O2_x + v2
                P2_x = max(min(P2_x, 6.5), -6.5)
            except Exception:
                P2_x = 6.5
            return Dot(np.array([P2_x, AXIS_Y, 0]), color=RED, radius=0.11)

        def make_P2_lbl():
            d = d_tracker.get_value()
            u2 = d - v1_val
            O2_x = O1_X + d
            try:
                v2 = single_surface_image(N1, N2, R2, u2)
                P2_x = O2_x + v2
                P2_x = max(min(P2_x, 6.5), -6.5)
            except Exception:
                P2_x = 6.5
            return MathTex(r"P_2").scale(0.50).next_to(
                np.array([P2_x, AXIS_Y, 0]), UP, buff=0.12
            ).set_color(RED)

        P2_dyn = always_redraw(make_P2)
        P2_lbl_dyn = always_redraw(make_P2_lbl)
        self.add(P2_dyn, P2_lbl_dyn)

        # 动态计算链（左上角）
        def make_chain_text():
            d = d_tracker.get_value()
            u2 = d - v1_val
            try:
                v2 = single_surface_image(N1, N2, R2, u2)
            except Exception:
                v2 = float('inf')
            is_virtual = u2 > 0
            u2_color = RED if is_virtual else CYAN
            lines = [
                VGroup(
                    Text("d =", font=CJK, color=WHITE).scale(0.37),
                    MathTex(rf"{d:.2f}", color=WHITE).scale(0.52)
                ).arrange(RIGHT, buff=0.06),
                VGroup(
                    Text("u1 =", font=CJK, color=YELLOW).scale(0.37),
                    MathTex(rf"{U1:.2f}", color=YELLOW).scale(0.52)
                ).arrange(RIGHT, buff=0.06),
                VGroup(
                    Text("v1 =", font=CJK, color=GREEN).scale(0.37),
                    MathTex(rf"{v1_val:.2f}", color=GREEN).scale(0.52)
                ).arrange(RIGHT, buff=0.06),
                VGroup(
                    Text("u2=d-v1=", font=CJK, color=u2_color).scale(0.37),
                    MathTex(rf"{u2:.2f}", color=u2_color).scale(0.52)
                ).arrange(RIGHT, buff=0.06),
                VGroup(
                    Text("v2 =", font=CJK, color=ORANGE).scale(0.37),
                    MathTex(rf"{v2:.2f}" if abs(v2) < 1e5 else r"\infty", color=ORANGE).scale(0.52)
                ).arrange(RIGHT, buff=0.06),
            ]
            grp = VGroup(*lines).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
            grp.to_corner(UL, buff=0.42)
            return grp

        chain_dyn = always_redraw(make_chain_text)
        self.add(chain_dyn)
        self.wait(0.8)

        # d 标注
        d_label = always_redraw(lambda: VGroup(
            Line(
                np.array([O1_X, AXIS_Y - AXIS_HALF_H - 0.45, 0]),
                np.array([O1_X + d_tracker.get_value(), AXIS_Y - AXIS_HALF_H - 0.45, 0]),
                color=WHITE, stroke_width=1.5
            ),
            MathTex(r"d").scale(0.50).move_to(
                np.array([O1_X + d_tracker.get_value() / 2,
                          AXIS_Y - AXIS_HALF_H - 0.65, 0])
            ).set_color(WHITE)
        ))
        self.add(d_label)

        # 扫动 d：从 4.0 缩小到 1.0（经过虚物区域 d < v1）
        scan_note = Text("缩小间距 d，观察 u2 = d - v1 的符号变化", font=CJK, color=WHITE).scale(0.42)
        scan_note.next_to(track_title, DOWN, buff=0.25)
        self.play(FadeIn(scan_note))
        self.play(d_tracker.animate.set_value(1.0), run_time=4.0, rate_func=linear)
        self.wait(0.5)

        # ── 虚物警告弹出（d < v1 时 P1 跑到 O2 右侧）─────────────────────
        virtual_box_content = VGroup(
            Text("虚物！", font=CJK, color=RED).scale(0.55),
            VGroup(
                Text("u2 > 0，P1 在第二面右侧，", font=CJK, color=RED).scale(0.40),
            ),
            VGroup(
                Text("光线尚未会聚就遇到第二面，", font=CJK, color=RED).scale(0.40),
            ),
            VGroup(
                Text("公式中 u2 取正值继续计算即可", font=CJK, color=YELLOW).scale(0.40),
            ),
        ).arrange(DOWN, buff=0.14)
        virtual_box = SurroundingRectangle(virtual_box_content, color=RED, buff=0.25, corner_radius=0.12)
        virt_group = VGroup(virtual_box, virtual_box_content)
        virt_group.next_to(track_title, DOWN, buff=0.55)

        self.play(FadeOut(scan_note), Create(virtual_box), FadeIn(virtual_box_content))
        self.wait(2.0)

        # 恢复 d
        self.play(FadeOut(virt_group))
        self.play(d_tracker.animate.set_value(D_INIT), run_time=2.5, rate_func=smooth)
        self.wait(1.0)

        # 清场动态元素
        self.remove(chain_dyn, P2_dyn, P2_lbl_dyn, surf2b, lbl_O2b, d_label)
        self.play(FadeOut(VGroup(
            AX, oaxis2, surf1b, lbl_O1b,
            P_dot2, P_lbl2, P1_dot2, P1_lbl2,
            track_title
        )))

        # ═══════════════════════════════════════════════════════════════
        # Step 10: 数值例子
        # ═══════════════════════════════════════════════════════════════
        ex_head = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ex_head))

        # 给定参数
        ex_params = VGroup(
            VGroup(
                Text("n0=1.0, n1=1.5, n2=1.0", font=CJK).scale(0.42),
            ),
            VGroup(
                Text("r1=2.0 cm, r2=-2.5 cm, d=4.0 cm", font=CJK).scale(0.42),
            ),
            VGroup(
                Text("u1=-6.0 cm", font=CJK).scale(0.42),
            ),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(ex_head, DOWN, buff=0.35)
        self.play(FadeIn(ex_params))
        self.wait(0.8)

        # 计算步骤
        ex_v1 = MathTex(
            r"\frac{1.5}{v_1} = \frac{1.5-1.0}{2.0} - \frac{1.0}{-6.0}"
            r"\;\Rightarrow\; v_1 \approx " + f"{v1_val:.2f}" + r"\,\text{cm}",
            color=GREEN
        ).scale(0.68)
        ex_u2 = MathTex(
            r"u_2 = d - v_1 = 4.0 - " + f"{v1_val:.2f}" + r" \approx " + f"{D_INIT - v1_val:.2f}" + r"\,\text{cm}",
            color=CYAN
        ).scale(0.68)
        ex_v2 = MathTex(
            r"\frac{1.0}{v_2} = \frac{1.0-1.5}{-2.5} - \frac{1.5}{" + f"{D_INIT - v1_val:.2f}" + r"}"
            r"\;\Rightarrow\; v_2 \approx " + f"{v2_init:.2f}" + r"\,\text{cm}",
            color=ORANGE
        ).scale(0.68)
        ex_steps = VGroup(ex_v1, ex_u2, ex_v2).arrange(DOWN, buff=0.32).next_to(ex_params, DOWN, buff=0.35)
        ex_steps.scale_to_fit_width(12.5)

        self.play(Write(ex_v1))
        self.wait(0.7)
        self.play(Write(ex_u2))
        self.wait(0.7)
        self.play(Write(ex_v2))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_head, ex_params, ex_steps)))

        # ═══════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ═══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"\frac{n_0}{u_1}+\frac{n_1}{v_1}=\frac{n_1-n_0}{r_1}",
            color=YELLOW
        ).scale(0.78)
        s2 = MathTex(r"u_2 = d - v_1", color=CYAN).scale(0.78)
        s3 = MathTex(
            r"\frac{n_1}{u_2}+\frac{n_2}{v_2}=\frac{n_2-n_1}{r_2}",
            color=GREEN
        ).scale(0.78)

        s_zh1 = Text("逐次代入：前一面的像距 → 后一面的物距", font=CJK, color=WHITE).scale(0.40)
        s_zh2 = Text("虚物（u>0）：P1 超越第二面，u2 取正值直接代入公式即可",
                     font=CJK, color=RED).scale(0.38)

        s_group = VGroup(s1, s2, s3, s_zh1, s_zh2).arrange(DOWN, buff=0.30).next_to(s_title, DOWN, buff=0.40)
        s_group.scale_to_fit_width(12.0)
        box = SurroundingRectangle(s_group, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(Write(s1))
        self.wait(0.4)
        self.play(Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(FadeIn(s_zh1))
        self.play(FadeIn(s_zh2))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp2SequentialImagingCoaxial",
        "id": "phys-ch10-10.1-kp2-sequential-imaging-coaxial",
        "chapterId": "ch10",
        "sectionId": "10.1",
        "title": "共轴球面系统逐次成像法",
        "description": "用两面折射球面光路图演示逐次成像：第一面像距自动成为第二面物距，ValueTracker 扫动间距 d 展示虚物现象与 u2 符号变化。",
    },
]
