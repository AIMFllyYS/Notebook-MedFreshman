"""第 14.1 节 · 布喇格衍射定律（金标准范本：几何光学 + ValueTracker 角度扫动）。

X 射线以掠射角 theta 入射到晶体平行晶面，来自相邻晶面的两束反射波
产生路程差 2d*sin(theta)，满足 2d*sin(theta)=k*lambda 时相长干涉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理常数（动画用，无量纲化）──────────────────────────────────────────────
D_SPACING = 1.2   # 晶面间距（动画单位）
LAM = 0.6         # 波长（动画单位），使得 2d/lambda = 4，k=1,2,3 均可满足


def _ray_color(theta_deg: float) -> str:
    """根据当前 theta 是否满足布喇格条件返回颜色。"""
    theta = math.radians(theta_deg)
    path_diff = 2 * D_SPACING * math.sin(theta)
    for k in range(1, 6):
        if abs(path_diff - k * LAM) < 0.06:
            return GREEN
    return ORANGE


class Ch14Kp4BraggDiffractionCrystal(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("布喇格衍射定律", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第14章 X射线与激光 · 14.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("镜子能反射可见光，但 X 射线波长极短（0.01~10 nm），", font=CJK).scale(0.46)
        a2 = Text("普通镜面对它几乎透明——晶体内部原子层却天然充当「光栅」。", font=CJK).scale(0.46)
        a3 = Text("相邻晶面反射的两束 X 射线叠加，只有路程差恰好为波长整数倍时才增强。", font=CJK).scale(0.44)
        analogy = VGroup(a1, a2, a3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        analogy.scale_to_fit_width(13)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.8)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 两层晶面几何图（静态底图）
        # ══════════════════════════════════════════════════════════════════
        # 晶面：两条水平线，上层 y=0.8，下层 y=-0.5
        y_top = 0.6
        y_bot = y_top - D_SPACING   # = -0.6
        x_left, x_right = -5.5, 5.5

        plane_top = Line([x_left, y_top, 0], [x_right, y_top, 0],
                         color=BLUE, stroke_width=3)
        plane_bot = Line([x_left, y_bot, 0], [x_right, y_bot, 0],
                         color=BLUE, stroke_width=3)

        # 原子点（上层）
        atoms_top = VGroup(*[
            Dot([x, y_top, 0], radius=0.10, color=BLUE_C)
            for x in np.linspace(x_left + 0.6, x_right - 0.6, 10)
        ])
        # 原子点（下层）
        atoms_bot = VGroup(*[
            Dot([x, y_bot, 0], radius=0.10, color=BLUE_C)
            for x in np.linspace(x_left + 0.6, x_right - 0.6, 10)
        ])

        crystal_group = VGroup(plane_top, plane_bot, atoms_top, atoms_bot)
        crystal_group.shift(DOWN * 0.3)

        self.play(Create(plane_top), Create(plane_bot))
        self.play(FadeIn(atoms_top), FadeIn(atoms_bot))

        # 标注晶面间距 d
        d_brace = Brace(
            Line([x_right - 0.4, y_top - 0.3, 0], [x_right - 0.4, y_bot + 0.3, 0]),
            direction=RIGHT, color=CYAN
        ).shift(DOWN * 0.3)
        d_label_text = Text("d", font=CJK, color=CYAN).scale(0.55)
        d_label_eq = MathTex(r"\approx 0.1{-}1\,\mathrm{nm}", color=CYAN).scale(0.5)
        d_label = VGroup(d_label_text, d_label_eq).arrange(RIGHT, buff=0.08)
        d_label.next_to(d_brace, RIGHT, buff=0.12)

        self.play(Create(d_brace), FadeIn(d_label))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 画出两束射线（动态，ValueTracker 控制掠射角 theta）
        # ══════════════════════════════════════════════════════════════════
        # 入射点：上层晶面中偏左处 A；穿透点：下层晶面 B
        # 反射角等于入射角（镜面反射）

        theta_tracker = ValueTracker(30.0)   # 初始掠射角 30°

        # 上层入射/反射点 A（固定水平位置）
        A_x = -1.2
        A_y = y_top - 0.3   # 经 crystal_group 整体下移 0.3
        B_x_offset = 0.0     # 下层反射点 B 水平偏移（相对 A）

        def get_A():
            return np.array([A_x, A_y, 0])

        def get_B(theta_deg):
            theta = math.radians(theta_deg)
            # 下层到上层的垂直距离
            dx = D_SPACING / math.tan(theta) if math.tan(theta) > 1e-6 else 999
            return np.array([A_x + dx, A_y - D_SPACING, 0])

        def get_C(theta_deg):
            """第二束射线在上层的出射点（B 正上方偏移后的镜像）。"""
            B = get_B(theta_deg)
            theta = math.radians(theta_deg)
            dx = D_SPACING / math.tan(theta) if math.tan(theta) > 1e-6 else 999
            return np.array([B[0] + dx, A_y, 0])

        # ── 入射光源点（左上角，固定）──────────────────────────────────────
        def get_src(theta_deg):
            A = get_A()
            theta = math.radians(theta_deg)
            length = 2.8
            return A + np.array([-length * math.cos(theta), length * math.sin(theta), 0])

        # ── 射线 1：入射 → A → 反射（到右上角）──────────────────────────
        ray_in1 = always_redraw(lambda: Line(
            get_src(theta_tracker.get_value()),
            get_A(),
            color=YELLOW, stroke_width=2.5
        ))
        ray_ref1 = always_redraw(lambda: Arrow(
            get_A(),
            get_A() + np.array([2.8 * math.cos(math.radians(theta_tracker.get_value())),
                                  2.8 * math.sin(math.radians(theta_tracker.get_value())), 0]),
            color=YELLOW, stroke_width=2.5, buff=0, tip_length=0.18
        ))

        # ── 射线 2：从同方向入射 → A 上方虚延长 → B → C 出射 ──────────────
        def get_src2(theta_deg):
            C = get_C(theta_deg)
            theta = math.radians(theta_deg)
            # 源在 C 的上方延长线（入射方向的反向延伸）
            length = 2.8 + D_SPACING / math.tan(theta) if math.tan(theta) > 1e-6 else 5.0
            return C + np.array([-(length + 0.6) * math.cos(theta),
                                   (length + 0.6) * math.sin(theta), 0])

        ray_in2 = always_redraw(lambda: Line(
            get_src2(theta_tracker.get_value()),
            get_B(theta_tracker.get_value()),
            color=YELLOW, stroke_width=2.5
        ))
        ray_ref2 = always_redraw(lambda: Arrow(
            get_B(theta_tracker.get_value()),
            get_C(theta_tracker.get_value()),
            color=YELLOW, stroke_width=2.5, buff=0, tip_length=0.18
        ))
        ray_ref2b = always_redraw(lambda: Arrow(
            get_C(theta_tracker.get_value()),
            get_C(theta_tracker.get_value()) + np.array([
                2.0 * math.cos(math.radians(theta_tracker.get_value())),
                2.0 * math.sin(math.radians(theta_tracker.get_value())), 0]),
            color=YELLOW, stroke_width=2.5, buff=0, tip_length=0.18
        ))

        self.play(Create(ray_in1), Create(ray_ref1))
        self.wait(0.5)
        self.play(Create(ray_in2), Create(ray_ref2), Create(ray_ref2b))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 红色高亮「多余路程」2d sinθ 的两段折线
        # ══════════════════════════════════════════════════════════════════
        # 两段：从 A 向下到 B 的垂足 F1，以及从 C 向下到 B 的垂足 F2
        # 实际上「多余路程」= |入射到B| + |B到C| - |A到C的等相面|
        # 几何上就是：从 A 投影到 射线2入射方向的两段额外路程
        # 简化：红色折线 = A -> B -> C（下层走的路），与标准做法相符

        extra_path = always_redraw(lambda: VGroup(
            Line(get_A(), get_B(theta_tracker.get_value()),
                 color=RED, stroke_width=4),
            Line(get_B(theta_tracker.get_value()), get_C(theta_tracker.get_value()),
                 color=RED, stroke_width=4)
        ))

        self.play(Create(extra_path))
        self.wait(0.8)

        # 路程差数值标注（动态）
        path_diff_label_zh = Text("路程差", font=CJK, color=RED).scale(0.48)
        path_diff_label_eq = always_redraw(lambda: MathTex(
            r"2d\sin\theta = " +
            f"{2 * D_SPACING * math.sin(math.radians(theta_tracker.get_value())):.2f}",
            color=_ray_color(theta_tracker.get_value())
        ).scale(0.58))
        path_diff_group = VGroup(path_diff_label_zh)
        path_diff_group.next_to(plane_bot, DOWN, buff=0.32)
        path_diff_label_eq.next_to(path_diff_group, RIGHT, buff=0.15)

        self.play(FadeIn(path_diff_label_zh), FadeIn(path_diff_label_eq))

        # 标注掠射角 theta
        theta_arc = always_redraw(lambda: Arc(
            radius=0.45,
            start_angle=PI,
            angle=math.radians(theta_tracker.get_value()),
            color=GREEN_B
        ).move_arc_center_to(get_A()))

        theta_label = always_redraw(lambda: MathTex(r"\theta", color=GREEN_B).scale(0.55).move_to(
            get_A() + np.array([
                -0.7 * math.cos(math.radians(theta_tracker.get_value() / 2)),
                0.55 * math.sin(math.radians(theta_tracker.get_value() / 2)),
                0
            ])
        ))

        self.play(Create(theta_arc), FadeIn(theta_label))
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 展示布喇格公式（逐步）
        # ══════════════════════════════════════════════════════════════════
        eq_title = Text("布喇格条件：", font=CJK, color=YELLOW).scale(0.52)
        bragg_eq = MathTex(r"2d\sin\theta = k\lambda,\quad k = 1,2,3,\ldots",
                           color=YELLOW).scale(0.75)
        eq_row = VGroup(eq_title, bragg_eq).arrange(RIGHT, buff=0.2)
        eq_row.to_edge(DOWN, buff=0.28)
        eq_row.scale_to_fit_width(13)
        box_eq = SurroundingRectangle(eq_row, color=YELLOW, buff=0.18, corner_radius=0.1)

        self.play(FadeIn(eq_title), Write(bragg_eq), Create(box_eq))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: ValueTracker 扫动 theta（0→80°）同步变色
        # ══════════════════════════════════════════════════════════════════
        scan_hint = Text("掠射角 θ 从小变大，观察路程差变化与颜色指示（绿=相长，橙=相消）",
                         font=CJK, color=WHITE).scale(0.40)
        scan_hint.next_to(box_eq, UP, buff=0.18)
        self.play(FadeIn(scan_hint))
        self.play(theta_tracker.animate.set_value(80.0), run_time=7, rate_func=linear)
        self.wait(0.5)
        self.play(theta_tracker.animate.set_value(30.0), run_time=2, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(scan_hint))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 清场，展示 k=1,2,3 三个满足条件的角度（静态）
        # ══════════════════════════════════════════════════════════════════
        # 清除动态元素
        self.play(
            FadeOut(VGroup(ray_in1, ray_ref1, ray_in2, ray_ref2, ray_ref2b,
                           extra_path, theta_arc, theta_label,
                           path_diff_label_zh, path_diff_label_eq,
                           eq_row, box_eq, d_brace, d_label,
                           crystal_group))
        )

        # 重新建立晶面（偏上，留下方给衍射谱）
        y_top2 = 1.5
        y_bot2 = y_top2 - D_SPACING
        pln_top = Line([-5.5, y_top2, 0], [5.5, y_top2, 0], color=BLUE, stroke_width=2.5)
        pln_bot = Line([-5.5, y_bot2, 0], [5.5, y_bot2, 0], color=BLUE, stroke_width=2.5)
        atm_t = VGroup(*[Dot([x, y_top2, 0], radius=0.08, color=BLUE_C)
                         for x in np.linspace(-4.8, 4.8, 10)])
        atm_b = VGroup(*[Dot([x, y_bot2, 0], radius=0.08, color=BLUE_C)
                         for x in np.linspace(-4.8, 4.8, 10)])
        d_br = Brace(Line([4.8, y_top2, 0], [4.8, y_bot2, 0]), direction=RIGHT, color=CYAN)
        d_lbl = VGroup(
            Text("d", font=CJK, color=CYAN).scale(0.50),
            MathTex(r"= 1.2\,\mathrm{u}", color=CYAN).scale(0.46)
        ).arrange(RIGHT, buff=0.08).next_to(d_br, RIGHT, buff=0.12)

        self.play(Create(pln_top), Create(pln_bot), FadeIn(atm_t), FadeIn(atm_b))
        self.play(Create(d_br), FadeIn(d_lbl))

        # 计算满足 2d sinθ = k λ 的三个 θ（k=1,2,3）
        # D=1.2, LAM=0.6 => sinθ = k*0.6/(2*1.2) = k*0.25
        # k=1: sinθ=0.25, θ≈14.5°; k=2: sinθ=0.5, θ=30°; k=3: sinθ=0.75, θ≈48.6°
        k_angles = []
        for k in range(1, 4):
            sin_val = k * LAM / (2 * D_SPACING)
            if sin_val <= 1.0:
                k_angles.append((k, math.degrees(math.asin(sin_val))))

        colors_k = [GREEN, GOLD, PINK]
        A_x2 = -0.5
        A_y2 = y_top2

        ray_groups = []
        for i, (k, theta_deg) in enumerate(k_angles):
            theta = math.radians(theta_deg)
            col = colors_k[i]
            dx = D_SPACING / math.tan(theta)
            B2 = np.array([A_x2 + dx, y_bot2, 0])
            C2 = np.array([B2[0] + dx, y_top2, 0])
            src = np.array([A_x2 - 2.5 * math.cos(theta), A_y2 + 2.5 * math.sin(theta), 0])

            r_in = Line(src, [A_x2, A_y2, 0], color=col, stroke_width=2.0)
            r_ref1 = Arrow([A_x2, A_y2, 0],
                           [A_x2 + 2.5 * math.cos(theta), A_y2 + 2.5 * math.sin(theta), 0],
                           color=col, stroke_width=2.0, buff=0, tip_length=0.14)
            r_in2 = Line(
                np.array([C2[0] - 4.0 * math.cos(theta), A_y2 + 4.0 * math.sin(theta), 0]),
                B2, color=col, stroke_width=2.0)
            r_ref2 = Arrow(B2, C2, color=col, stroke_width=2.0, buff=0, tip_length=0.14)
            r_ref2b = Arrow(C2,
                            C2 + np.array([2.0 * math.cos(theta), 2.0 * math.sin(theta), 0]),
                            color=col, stroke_width=2.0, buff=0, tip_length=0.14)

            k_label = VGroup(
                MathTex(r"k=" + str(k), color=col).scale(0.52),
                MathTex(r"\theta\approx" + f"{theta_deg:.1f}" + r"^\circ", color=col).scale(0.48)
            ).arrange(DOWN, buff=0.05)
            k_label.next_to(r_ref1.get_end(), UP, buff=0.1)

            rg = VGroup(r_in, r_ref1, r_in2, r_ref2, r_ref2b, k_label)
            ray_groups.append(rg)
            self.play(Create(r_in), Create(r_in2))
            self.play(Create(r_ref1), Create(r_ref2), Create(r_ref2b), FadeIn(k_label))
            self.wait(0.6)

        multi_hint = Text("k=1,2,3 时各有一个满足条件的掠射角，均产生强烈反射峰", font=CJK, color=GREEN).scale(0.42)
        multi_hint.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(multi_hint))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 右侧衍射图谱（示意强度峰）
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(*ray_groups, multi_hint, pln_top, pln_bot,
                                  atm_t, atm_b, d_br, d_lbl)))

        spectrum_title = Text("衍射强度谱（示意）", font=CJK, color=BLUE).scale(0.52)
        spectrum_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(spectrum_title))

        # 用 Axes 画 I(theta) 谱
        ax = Axes(
            x_range=[0, 90, 15],
            y_range=[0, 1.2, 0.5],
            x_length=10,
            y_length=4.0,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"include_numbers": True},
            y_axis_config={"include_numbers": False},
        ).next_to(spectrum_title, DOWN, buff=0.3)

        x_lbl_sp = VGroup(
            Text("掠射角", font=CJK, color=BLUE).scale(0.44),
            MathTex(r"\theta\,(^{\circ})", color=BLUE).scale(0.50)
        ).arrange(RIGHT, buff=0.08).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        y_lbl_sp = Text("相对强度 I", font=CJK, color=BLUE).scale(0.42)
        y_lbl_sp.next_to(ax.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(ax), FadeIn(x_lbl_sp), FadeIn(y_lbl_sp))

        # 画出三个峰（高斯包络，中心在各布喇格角）
        sigma = 1.5   # 峰宽（度）
        peak_colors_sp = [GREEN, GOLD, PINK]

        def intensity(theta_deg_val):
            total = 0.0
            for k_val, theta_k in k_angles:
                total += math.exp(-0.5 * ((theta_deg_val - theta_k) / sigma) ** 2)
            return min(total, 1.15)

        spectrum_curve = ax.plot(intensity, x_range=[1, 89, 0.2], color=WHITE)
        self.play(Create(spectrum_curve), run_time=2)
        self.wait(0.5)

        # 标注峰位
        peak_labels = VGroup()
        for i, (k_val, theta_k) in enumerate(k_angles):
            peak_pt = ax.c2p(theta_k, 1.05)
            pk_lbl = VGroup(
                MathTex(r"k=" + str(k_val), color=peak_colors_sp[i]).scale(0.50),
                MathTex(r"\theta=" + f"{theta_k:.0f}" + r"^\circ",
                        color=peak_colors_sp[i]).scale(0.44)
            ).arrange(DOWN, buff=0.04).move_to(peak_pt + UP * 0.35)
            vline = DashedLine(ax.c2p(theta_k, 0), peak_pt,
                               color=peak_colors_sp[i], stroke_width=1.5)
            self.play(Create(vline), FadeIn(pk_lbl))
            peak_labels.add(pk_lbl, vline)
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 放大示意图 —— 说明 d 与原子间距同量级才能衍射
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(ax, spectrum_curve, peak_labels,
                                  x_lbl_sp, y_lbl_sp, spectrum_title)))

        cond_title = Text("为何 X 射线才能发生晶体衍射？", font=CJK, color=BLUE).scale(0.52)
        cond_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(cond_title))

        cond1 = Text("衍射条件：波长 λ 与障碍物间距 d 可比（λ ≈ d）", font=CJK).scale(0.47)
        cond2 = Text("晶面间距 d ≈ 0.1~1 nm，恰与 X 射线波长相当", font=CJK, color=GREEN).scale(0.47)
        cond3 = Text("可见光 λ ≈ 400~700 nm >> d，不满足衍射条件", font=CJK, color=RED).scale(0.47)
        cond_block = VGroup(cond1, cond2, cond3).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        cond_block.next_to(cond_title, DOWN, buff=0.5)
        cond_block.scale_to_fit_width(12)

        self.play(FadeIn(cond1))
        self.wait(0.8)
        self.play(FadeIn(cond2))
        self.wait(0.8)
        self.play(FadeIn(cond3))
        self.wait(1.5)

        # 比较尺度图示（简易水平尺）
        scale_bar_x = MathTex(r"\lambda_{\mathrm{visible}} \approx 500\,\mathrm{nm}",
                               color=RED).scale(0.56)
        scale_bar_x2 = MathTex(r"\lambda_{\mathrm{X-ray}} \approx 0.1\,\mathrm{nm} \approx d",
                                color=GREEN).scale(0.56)
        scale_row = VGroup(scale_bar_x, scale_bar_x2).arrange(RIGHT, buff=1.2)
        scale_row.next_to(cond_block, DOWN, buff=0.45)
        self.play(FadeIn(scale_bar_x), FadeIn(scale_bar_x2))
        self.wait(1.5)

        self.play(FadeOut(VGroup(cond_title, cond_block, scale_row)))

        # ══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)

        s1_zh = Text("布喇格定律（相长干涉条件）：", font=CJK, color=WHITE).scale(0.46)
        s1_eq = MathTex(r"2d\sin\theta = k\lambda,\quad k=1,2,3,\ldots",
                        color=YELLOW).scale(0.80)
        s1 = VGroup(s1_zh, s1_eq).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

        s2_zh = Text("d 为晶面间距，θ 为掠射角（非入射角）", font=CJK, color=WHITE).scale(0.44)
        s2_eq = MathTex(r"d\sim 0.1\text{--}1\,\mathrm{nm},\quad\lambda_{\mathrm{X}}\sim 0.01\text{--}10\,\mathrm{nm}",
                        color=CYAN).scale(0.60)
        s2 = VGroup(s2_zh, s2_eq).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

        s3 = Text("晶体可用于 X 射线分光，也可反推晶体结构（X 射线晶体学）",
                  font=CJK, color=GREEN).scale(0.43)

        summary = VGroup(s1, s2, s3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1_eq), FadeIn(s1_zh))
        self.wait(0.6)
        self.play(FadeIn(s2_zh), Write(s2_eq))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Kp4BraggDiffractionCrystal",
        "id": "phys-ch14-14.1-kp4-bragg-diffraction-crystal",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "布喇格衍射定律",
        "description": "用两层晶面几何图演示 X 射线布喇格衍射，ValueTracker 扫动掠射角并实时显示路程差 2d sinθ，颜色指示相长/相消，最终展示 k=1,2,3 三个衍射峰与衍射条件 2d sinθ=kλ。",
    },
]
