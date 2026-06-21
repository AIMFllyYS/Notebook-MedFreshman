"""第 10.2 节 · 透镜浸入液体后焦距变化（知识点讲解）。

核心思路：
  - 左右并排呈现「空气中」vs「液体中」两个子场景
  - 用 ValueTracker 拖动液体折射率 n0，实时更新焦距、光线与焦点位置
  - 用 Axes 绘制焦度 Φ(n0) 曲线，颜色区分会聚/发散区域
  - 三种物理极限（n0<n 会聚、n0=n 焦距→∞、n0>n 发散）均可视化

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理参数（固定值）
N_GLASS = 1.5          # 玻璃折射率
R1 = 2.0               # 第一面曲率半径（cm，归一化单位）
R2 = -2.0              # 第二面曲率半径（符号规定）
LENSMAKER = (1.0 / R1 - 1.0 / R2)   # = 1/R1 - 1/R2 = 1/2 - 1/(-2) = 1


def focal_length(n0):
    """计算浸入折射率为 n0 的介质时的焦距 f（单位：cm）。
    公式：1/f = (n-n0)/n0 * (1/R1 - 1/R2)
    n0 非常接近 n 时焦距趋于无穷（用夹位避免除零）。
    """
    phi = (N_GLASS - n0) / n0 * LENSMAKER
    if abs(phi) < 1e-6:
        return math.copysign(1e6, phi) if phi != 0 else 1e6
    return 1.0 / phi


def focal_power(n0):
    """焦度 Φ = (n-n0)/n0 * (1/R1-1/R2)"""
    return (N_GLASS - n0) / n0 * LENSMAKER


# ─────────────────────────────────────────────────────────────
# 辅助：画双凸透镜（用两段弧近似，返回 VGroup）
# ─────────────────────────────────────────────────────────────
def make_lens(center=ORIGIN, h=1.2, color=BLUE_C):
    """返回一个双凸透镜形状的 VGroup（两段弧）。"""
    def arc_points(cx, cy, r, y_min, y_max, n=30, flip_x=False):
        pts = []
        for i in range(n + 1):
            y = y_min + (y_max - y_min) * i / n
            dx = math.sqrt(max(r * r - y * y, 0))
            x = cx + (-dx if flip_x else dx)
            pts.append([x, y, 0])
        return pts

    # 左弧（向左凸）：圆心在右侧
    pts_L = arc_points(0.9, 0, 1.0, -h / 2, h / 2, flip_x=True)
    # 右弧（向右凸）：圆心在左侧
    pts_R = arc_points(-0.9, 0, 1.0, h / 2, -h / 2, flip_x=False)

    all_pts = pts_L + pts_R + [pts_L[0]]  # 闭合
    path = VMobject(color=color, fill_color=BLUE_E, fill_opacity=0.25, stroke_width=2.5)
    path.set_points_as_corners(all_pts)

    # 移至目标位置
    path.shift(np.array(center))
    return path


# ─────────────────────────────────────────────────────────────
# 主场景
# ─────────────────────────────────────────────────────────────
class Ch10Kp2LensInMediumFocalLength(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("透镜浸入液体后焦距变化", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        a1 = Text("同一块放大镜放在水中，汇聚光的能力会减弱，", font=CJK).scale(0.48)
        a2 = Text("甚至完全失去聚焦能力——这是因为折射率之差变小了。", font=CJK).scale(0.48)
        a3 = Text("液体折射率越接近玻璃，透镜越「看不出来」。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 透镜制造者方程（逐步展开）──────────────────────────────
        sec_t = Text("核心公式（透镜制造者方程）", font=CJK, color=BLUE).scale(0.52)
        sec_t.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_t))

        # 第一行：空气中
        f_air_label = VGroup(
            Text("空气中：", font=CJK).scale(0.45),
            MathTex(r"\frac{1}{f_0} = (n-1)\left(\frac{1}{r_1}-\frac{1}{r_2}\right)",
                    color=WHITE).scale(0.72),
        ).arrange(RIGHT, buff=0.18).next_to(sec_t, DOWN, buff=0.4)
        self.play(Write(f_air_label))
        self.wait(1.0)

        # 第二行：液体中（关键公式，高亮）
        f_liq_label = VGroup(
            Text("液体中：", font=CJK).scale(0.45),
            MathTex(r"\frac{1}{f} = \frac{n-n_0}{n_0}\left(\frac{1}{r_1}-\frac{1}{r_2}\right)",
                    color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.18).next_to(f_air_label, DOWN, buff=0.38)
        self.play(Write(f_liq_label))
        self.wait(0.8)

        # 第三行：焦度
        phi_label = VGroup(
            Text("焦度：", font=CJK).scale(0.45),
            MathTex(r"\Phi = \frac{1}{f} = \frac{n-n_0}{n_0}\left(\frac{1}{r_1}-\frac{1}{r_2}\right)",
                    color=CYAN).scale(0.72),
        ).arrange(RIGHT, buff=0.18).next_to(f_liq_label, DOWN, buff=0.38)
        self.play(Write(phi_label))
        self.wait(0.6)

        # 关键结论注释
        note1 = VGroup(
            Text("n0 <  n:", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\Phi > 0", color=GREEN).scale(0.65),
            Text("  会聚", font=CJK, color=GREEN).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        note2 = VGroup(
            Text("n0 =  n:", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\Phi = 0", color=WHITE).scale(0.65),
            Text("  平行（焦距→∞）", font=CJK, color=WHITE).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        note3 = VGroup(
            Text("n0 >  n:", font=CJK, color=RED).scale(0.40),
            MathTex(r"\Phi < 0", color=RED).scale(0.65),
            Text("  发散", font=CJK, color=RED).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        notes = VGroup(note1, note2, note3).arrange(DOWN, buff=0.22).next_to(phi_label, DOWN, buff=0.3)
        self.play(FadeIn(note1))
        self.wait(0.5)
        self.play(FadeIn(note2))
        self.wait(0.5)
        self.play(FadeIn(note3))
        self.wait(1.5)

        formula_group = VGroup(sec_t, f_air_label, f_liq_label, phi_label, notes)
        self.play(FadeOut(formula_group))

        # ── Step 4: 左右对比场景 ─────────────────────────────────────────
        # 分隔线
        divider = DashedLine(UP * 3.2, DOWN * 2.8, color=GRAY, stroke_width=1.5)

        # 左标签（空气中）
        left_label = Text("空气中 (n0 = 1.0)", font=CJK, color=WHITE).scale(0.42)
        left_label.move_to(LEFT * 3.3 + UP * 2.8)
        # 右标签（液体中）
        right_label = Text("液体中（拖动 n0）", font=CJK, color=CYAN).scale(0.42)
        right_label.move_to(RIGHT * 3.3 + UP * 2.8)

        self.play(Create(divider), FadeIn(left_label), FadeIn(right_label))
        self.wait(0.4)

        # ── 左侧：空气中（静态） ─────────────────────────────────────────
        LX = -3.5   # 左侧中心 x
        RX = 3.5    # 右侧中心 x

        # 左侧透镜
        lens_L = make_lens(center=[LX, -0.3, 0], h=1.1, color=BLUE_C)
        self.play(Create(lens_L))

        # 左侧：3条平行光线从左射向透镜，汇聚于焦点
        f_air = focal_length(1.0)   # ≈ 2.0（单位）
        f_air_disp = 2.0            # 画面显示单位（缩放后）

        def make_air_rays():
            rays = VGroup()
            lens_cx = LX
            y_offsets = [-0.7, 0.0, 0.7]
            focal_x = lens_cx + f_air_disp
            for y_off in y_offsets:
                start = np.array([LX - 2.5, y_off + (-0.3), 0])
                hit = np.array([LX, y_off + (-0.3), 0])
                end = np.array([focal_x, -0.3, 0])
                ray1 = Line(start, hit, color=YELLOW, stroke_width=2)
                ray2 = Line(hit, end, color=YELLOW, stroke_width=2)
                rays.add(ray1, ray2)
            return rays

        air_rays = make_air_rays()
        # 焦点 F_air
        F_air_dot = Dot(point=[LX + f_air_disp, -0.3, 0], color=RED, radius=0.10)
        F_air_text = VGroup(
            MathTex(r"F", color=RED).scale(0.55),
            Text("（空气）", font=CJK, color=RED).scale(0.36),
        ).arrange(RIGHT, buff=0.05).next_to(F_air_dot, DOWN, buff=0.12)

        # 空气中焦距标注
        f_brace_start = np.array([LX, -1.55, 0])
        f_brace_end = np.array([LX + f_air_disp, -1.55, 0])
        f_line = DashedLine(f_brace_start, f_brace_end, color=GREEN, stroke_width=1.8)
        f_arrow = Arrow(f_brace_start, f_brace_end, buff=0,
                        color=GREEN, stroke_width=2, max_tip_length_to_length_ratio=0.15)
        f_air_val = VGroup(
            MathTex(r"f_0 \approx 2.0", color=GREEN).scale(0.55),
        ).next_to(f_line, DOWN, buff=0.08)

        self.play(
            Create(air_rays),
            Create(F_air_dot),
            FadeIn(F_air_text),
            Create(f_arrow),
            FadeIn(f_air_val),
        )
        self.wait(1.0)

        # ── 右侧：液体中（ValueTracker 动态） ─────────────────────────────
        n0_tracker = ValueTracker(1.0)   # 液体折射率，从 1.0 拖到 1.5

        # 右侧液体背景（蓝色半透明矩形）
        water_bg = Rectangle(
            width=7.0, height=6.2,
            fill_color=BLUE_E, fill_opacity=0.18,
            stroke_width=0,
        ).move_to([RX - 0.15, -0.3, 0])
        self.play(FadeIn(water_bg))

        # 右侧透镜
        lens_R = make_lens(center=[RX, -0.3, 0], h=1.1, color=BLUE_C)
        self.play(Create(lens_R))

        # 最大显示焦距（超过这个就画平行/发散）
        MAX_F_DISP = 2.8
        SCREEN_RIGHT = 6.9  # 画面最右边（安全边界）

        def get_right_rays():
            """根据 n0_tracker 实时生成右侧光线。"""
            n0 = n0_tracker.get_value()
            phi = focal_power(n0)
            y_offsets = [-0.7, 0.0, 0.7]
            group = VGroup()

            if abs(phi) < 0.05:
                # 焦距极大 → 输出近平行光
                for y_off in y_offsets:
                    start = np.array([RX - 2.5, y_off + (-0.3), 0])
                    hit = np.array([RX, y_off + (-0.3), 0])
                    end = np.array([RX + 2.8, y_off + (-0.3), 0])
                    group.add(
                        Line(start, hit, color=YELLOW, stroke_width=2),
                        Line(hit, end, color=YELLOW, stroke_width=2),
                    )
            elif phi > 0:
                # 会聚：光线汇聚到右侧焦点
                f_disp = min(1.0 / phi, MAX_F_DISP)
                focal_pt = np.array([RX + f_disp, -0.3, 0])
                for y_off in y_offsets:
                    start = np.array([RX - 2.5, y_off + (-0.3), 0])
                    hit = np.array([RX, y_off + (-0.3), 0])
                    group.add(
                        Line(start, hit, color=YELLOW, stroke_width=2),
                        Line(hit, focal_pt, color=YELLOW, stroke_width=2),
                    )
            else:
                # 发散：折射后背向延长线交于入射侧虚焦点
                f_disp = min(-1.0 / phi, MAX_F_DISP)
                virtual_focal = np.array([RX - f_disp, -0.3, 0])
                for y_off in y_offsets:
                    start = np.array([RX - 2.5, y_off + (-0.3), 0])
                    hit = np.array([RX, y_off + (-0.3), 0])
                    # 折射后光线向右散开（方向：从 virtual_focal 经 hit 延伸）
                    direction = hit - virtual_focal
                    direction = direction / np.linalg.norm(direction)
                    end = hit + direction * 2.5
                    end[0] = min(end[0], SCREEN_RIGHT)
                    group.add(
                        Line(start, hit, color=YELLOW, stroke_width=2),
                        Line(hit, end, color=ORANGE, stroke_width=2),
                    )
                    # 虚线延长线（向入射侧）
                    group.add(
                        DashedLine(hit, virtual_focal, color=ORANGE,
                                   stroke_width=1.5, dash_length=0.1),
                    )
            return group

        def get_focal_dot_R():
            """右侧焦点（会聚：实线红点；发散：橙色虚焦点）。"""
            n0 = n0_tracker.get_value()
            phi = focal_power(n0)
            if abs(phi) < 0.05:
                return VGroup()
            if phi > 0:
                f_disp = min(1.0 / phi, MAX_F_DISP)
                return Dot([RX + f_disp, -0.3, 0], color=RED, radius=0.09)
            else:
                f_disp = min(-1.0 / phi, MAX_F_DISP)
                return Dot([RX - f_disp, -0.3, 0], color=ORANGE, radius=0.09)

        def get_focal_label_R():
            n0 = n0_tracker.get_value()
            phi = focal_power(n0)
            if abs(phi) < 0.05:
                t = Text("焦距→∞", font=CJK, color=WHITE).scale(0.38)
                t.move_to([RX + 2.0, -0.9, 0])
                return t
            if phi > 0:
                f_disp = min(1.0 / phi, MAX_F_DISP)
                t = VGroup(
                    MathTex(r"F", color=RED).scale(0.5),
                    Text("（实焦点）", font=CJK, color=RED).scale(0.34),
                ).arrange(RIGHT, buff=0.05)
                t.next_to([RX + f_disp, -0.3, 0], DOWN, buff=0.14)
                return t
            else:
                f_disp = min(-1.0 / phi, MAX_F_DISP)
                t = VGroup(
                    MathTex(r"F'", color=ORANGE).scale(0.5),
                    Text("（虚焦点）", font=CJK, color=ORANGE).scale(0.34),
                ).arrange(RIGHT, buff=0.05)
                t.next_to([RX - f_disp, -0.3, 0], DOWN, buff=0.14)
                return t

        def get_n0_readout():
            n0 = n0_tracker.get_value()
            phi = focal_power(n0)
            color = GREEN if phi > 0.05 else (RED if phi < -0.05 else WHITE)
            return VGroup(
                Text("n0 = ", font=CJK, color=CYAN).scale(0.42),
                MathTex(rf"{n0:.2f}", color=CYAN).scale(0.52),
                Text("   Phi = ", font=CJK, color=color).scale(0.42),
                MathTex(rf"{phi:.2f}", color=color).scale(0.52),
            ).arrange(RIGHT, buff=0.08).move_to([RX, -1.85, 0])

        right_rays = always_redraw(get_right_rays)
        focal_dot_R = always_redraw(get_focal_dot_R)
        focal_label_R = always_redraw(get_focal_label_R)
        n0_readout = always_redraw(get_n0_readout)

        self.play(
            Create(right_rays),
            FadeIn(focal_dot_R),
            FadeIn(focal_label_R),
            FadeIn(n0_readout),
        )
        self.wait(1.0)

        # 说明文字
        drag_tip = Text("液体折射率 n0 从 1.0 增大到 1.5（等于玻璃折射率 n = 1.5）",
                        font=CJK, color=WHITE).scale(0.38).to_edge(DOWN, buff=1.0)
        self.play(FadeIn(drag_tip))
        self.wait(0.5)

        # 动画：n0 从 1.0 → 1.5（经过临界点 n0=n=1.5）
        self.play(n0_tracker.animate.set_value(1.35), run_time=2.5, rate_func=linear)
        self.wait(0.5)

        # 临界点提示
        crit_note = Text("n0 → n = 1.5 时，Phi→0，焦距趋于无穷！", font=CJK, color=WHITE).scale(0.40)
        crit_note.next_to(drag_tip, UP, buff=0.18)
        self.play(FadeIn(crit_note))
        self.play(n0_tracker.animate.set_value(1.50), run_time=1.5, rate_func=linear)
        self.wait(0.8)

        # 超过临界点 → 变为发散镜
        div_note = Text("n0 > n 时，透镜变为发散镜！焦点出现在入射侧（虚焦点）",
                        font=CJK, color=ORANGE).scale(0.38)
        div_note.next_to(crit_note, UP, buff=0.18)
        self.play(FadeIn(div_note))
        self.play(n0_tracker.animate.set_value(1.60), run_time=1.5, rate_func=linear)
        self.wait(1.0)

        # 拉回到 1.3 演示一次会聚
        self.play(n0_tracker.animate.set_value(1.2), run_time=2.0, rate_func=linear)
        self.wait(0.8)

        scene_group = VGroup(
            divider, left_label, right_label,
            lens_L, air_rays, F_air_dot, F_air_text, f_arrow, f_air_val,
            water_bg, lens_R,
            drag_tip, crit_note, div_note,
        )
        self.play(
            FadeOut(scene_group),
            FadeOut(right_rays),
            FadeOut(focal_dot_R),
            FadeOut(focal_label_R),
            FadeOut(n0_readout),
        )
        self.wait(0.3)

        # ── Step 5: Φ(n0) 实时曲线 ──────────────────────────────────────
        curve_title = Text("焦度随液体折射率的变化曲线", font=CJK, color=BLUE).scale(0.50)
        curve_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(curve_title))

        axes = Axes(
            x_range=[1.0, 1.65, 0.1],
            y_range=[-3.5, 3.5, 1],
            x_length=8.5,
            y_length=4.5,
            axis_config={"color": GRAY, "include_tip": True, "include_numbers": True},
            x_axis_config={"numbers_to_include": [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]},
            y_axis_config={"numbers_to_include": [-3, -2, -1, 0, 1, 2, 3]},
        ).shift(DOWN * 0.6)
        axes.scale(0.88)

        x_lbl = VGroup(
            MathTex(r"n_0", color=CYAN).scale(0.55),
            Text("（液体折射率）", font=CJK, color=CYAN).scale(0.36),
        ).arrange(RIGHT, buff=0.06).next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_lbl = VGroup(
            MathTex(r"\Phi", color=YELLOW).scale(0.55),
            Text("（焦度）", font=CJK, color=YELLOW).scale(0.36),
        ).arrange(RIGHT, buff=0.06).next_to(axes.y_axis.get_end(), RIGHT, buff=0.1)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        # 会聚区域（n0 < 1.5，Φ > 0）
        curve_converge = axes.plot(
            lambda n0: focal_power(n0),
            x_range=[1.0, 1.495],
            color=GREEN,
            stroke_width=3,
        )
        # 发散区域（n0 > 1.5，Φ < 0）
        curve_diverge = axes.plot(
            lambda n0: focal_power(n0),
            x_range=[1.505, 1.60],
            color=RED,
            stroke_width=3,
        )

        # 渐近线（n0 = n = 1.5）
        asymptote_x = axes.c2p(1.5, 0)[0]
        asym_line = DashedLine(
            [asymptote_x, axes.c2p(1.5, -3.5)[1], 0],
            [asymptote_x, axes.c2p(1.5, 3.5)[1], 0],
            color=WHITE, stroke_width=1.5, dash_length=0.12,
        )
        asym_label = VGroup(
            MathTex(r"n_0 = n", color=WHITE).scale(0.50),
            Text("（临界）", font=CJK, color=WHITE).scale(0.36),
        ).arrange(DOWN, buff=0.06).next_to([asymptote_x, axes.c2p(1.5, 3.3)[1], 0], RIGHT, buff=0.08)

        # 区域着色
        area_conv = axes.get_area(curve_converge, x_range=[1.0, 1.495], color=GREEN, opacity=0.15)
        area_div = axes.get_area(curve_diverge, x_range=[1.505, 1.60], color=RED, opacity=0.15)

        self.play(Create(curve_converge), FadeIn(area_conv))
        self.wait(0.5)
        self.play(Create(asym_line), FadeIn(asym_label))
        self.wait(0.5)
        self.play(Create(curve_diverge), FadeIn(area_div))
        self.wait(0.8)

        # 标注三个关键点
        pt_conv = Dot(axes.c2p(1.0, focal_power(1.0)), color=GREEN, radius=0.09)
        pt_conv_lbl = VGroup(
            Text("n0=1.0,", font=CJK, color=GREEN).scale(0.36),
            MathTex(r"\Phi>0", color=GREEN).scale(0.48),
        ).arrange(RIGHT, buff=0.04).next_to(pt_conv, UP, buff=0.12)

        pt_div = Dot(axes.c2p(1.6, focal_power(1.6)), color=RED, radius=0.09)
        pt_div_lbl = VGroup(
            Text("n0=1.6,", font=CJK, color=RED).scale(0.36),
            MathTex(r"\Phi<0", color=RED).scale(0.48),
        ).arrange(RIGHT, buff=0.04).next_to(pt_div, DOWN, buff=0.12)

        self.play(FadeIn(pt_conv), FadeIn(pt_conv_lbl))
        self.wait(0.5)
        self.play(FadeIn(pt_div), FadeIn(pt_div_lbl))
        self.wait(1.2)

        # ValueTracker 在曲线上移动的点
        n0_scan = ValueTracker(1.0)
        scan_dot = always_redraw(lambda: Dot(
            axes.c2p(n0_scan.get_value(), focal_power(n0_scan.get_value())),
            color=CYAN, radius=0.12,
        ))
        scan_line = always_redraw(lambda: DashedLine(
            axes.c2p(n0_scan.get_value(), 0),
            axes.c2p(n0_scan.get_value(), focal_power(n0_scan.get_value())),
            color=CYAN, stroke_width=1.5,
        ))
        self.play(FadeIn(scan_dot), FadeIn(scan_line))
        self.play(n0_scan.animate.set_value(1.495), run_time=3.0, rate_func=linear)
        self.wait(0.3)
        self.play(n0_scan.animate.set_value(1.505), run_time=0.5, rate_func=linear)
        self.play(n0_scan.animate.set_value(1.60), run_time=2.0, rate_func=linear)
        self.wait(1.0)

        curve_scene = VGroup(
            axes, x_lbl, y_lbl,
            curve_converge, curve_diverge,
            area_conv, area_div,
            asym_line, asym_label,
            pt_conv, pt_conv_lbl,
            pt_div, pt_div_lbl,
            curve_title,
        )
        self.play(
            FadeOut(curve_scene),
            FadeOut(scan_dot),
            FadeOut(scan_line),
        )
        self.wait(0.3)

        # ── Step 6: 数值例子 ─────────────────────────────────────────────
        ex_t = Text("数值例子", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.45)
        ex_cond = VGroup(
            Text("玻璃折射率 n = 1.5，r1 = +10 cm，r2 = -10 cm", font=CJK).scale(0.44),
        ).next_to(ex_t, DOWN, buff=0.3)
        self.play(FadeIn(ex_t), FadeIn(ex_cond))
        self.wait(0.5)

        # 空气中
        ex_air = VGroup(
            Text("空气（n0=1.0）：", font=CJK).scale(0.44),
            MathTex(r"\frac{1}{f_0}=(1.5-1)\left(\frac{1}{10}+\frac{1}{10}\right)"
                    r"=0.1\Rightarrow f_0=10\ \mathrm{cm}", color=GREEN).scale(0.60),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(ex_cond, DOWN, buff=0.3)
        self.play(Write(ex_air))
        self.wait(1.0)

        # 水中（n0 = 1.33）
        ex_water = VGroup(
            Text("水中（n0=1.33）：", font=CJK).scale(0.44),
            MathTex(r"\frac{1}{f}=\frac{1.5-1.33}{1.33}\times 0.2"
                    r"\approx 0.0256\Rightarrow f\approx 39\ \mathrm{cm}", color=YELLOW).scale(0.60),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).next_to(ex_air, DOWN, buff=0.28)
        self.play(Write(ex_water))
        self.wait(0.8)

        ex_note = Text("焦距从10 cm延长到39 cm——在水中聚光能力大幅减弱",
                       font=CJK, color=ORANGE).scale(0.42).next_to(ex_water, DOWN, buff=0.22)
        self.play(FadeIn(ex_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_t, ex_cond, ex_air, ex_water, ex_note)))

        # ── Step 7: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(
            r"\frac{1}{f}=\frac{n-n_0}{n_0}\left(\frac{1}{r_1}-\frac{1}{r_2}\right)",
            color=YELLOW,
        ).scale(0.78)
        s2 = MathTex(r"\Phi=\frac{1}{f}", color=CYAN).scale(0.78)

        kp1 = VGroup(
            Text("n0 < n：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\Phi>0", color=GREEN).scale(0.60),
            Text("  会聚透镜；n0 越大焦距越长", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        kp2 = VGroup(
            Text("n0 = n：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Phi=0", color=WHITE).scale(0.60),
            Text("  焦距趋于无穷，光线不偏折", font=CJK, color=WHITE).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        kp3 = VGroup(
            Text("n0 > n：", font=CJK, color=RED).scale(0.44),
            MathTex(r"\Phi<0", color=RED).scale(0.60),
            Text("  变为发散透镜，出现虚焦点", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        s = VGroup(s1, s2, kp1, kp2, kp3).arrange(DOWN, buff=0.32).next_to(s_title, DOWN, buff=0.4)
        s.scale_to_fit_width(12.5)
        box = SurroundingRectangle(s, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(kp1))
        self.wait(0.4)
        self.play(FadeIn(kp2))
        self.wait(0.4)
        self.play(FadeIn(kp3))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp2LensInMediumFocalLength",
        "id": "phys-ch10-10.2-kp2-lens-in-medium-focal-length",
        "chapterId": "ch10",
        "sectionId": "10.2",
        "title": "透镜浸入液体后焦距变化",
        "description": "用左右对比场景演示透镜在不同折射率介质中的焦距变化：ValueTracker 拖动 n0，实时更新光线汇聚/发散状态和焦度 Φ(n0) 曲线。",
    },
]
