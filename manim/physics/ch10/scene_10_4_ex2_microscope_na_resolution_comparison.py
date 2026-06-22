"""第 10.4 节 · 例题 2：数值孔径与分辨细节的判断

左右并排两台显微镜（N.A.=0.75 vs N.A.=1.5 油浸），演示最小分辨距离公式
Z = 0.61λ/N.A. 以及 N.A. 如何决定能否分辨 0.3μm 间隔的两个发光点。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

AMBER = "#FFA500"


# ────────────────────────────────────────────────────────────────────────────
# 辅助：绘制单侧显微镜剖面（物镜 + 入射光锥 + 两个发光点 + 像平面亮斑）
# ────────────────────────────────────────────────────────────────────────────

def make_microscope_side(na: float, center_x: float, color: str, can_resolve: bool):
    """返回一个 VGroup，包含单侧显微镜的所有静态元素。

    na            : 数值孔径
    center_x      : 水平中心位置
    color         : 主色调（光锥颜色）
    can_resolve   : True → 像平面显示两个独立亮斑，False → 叠成一个模糊斑
    """
    group = VGroup()

    # 参数
    obj_y = 1.6          # 物镜底部 y 坐标
    src_y = -0.6         # 发光点 y 坐标
    img_y = -1.8         # 像平面 y 坐标
    half_sep = 0.12      # 两发光点的半间距（屏幕单位，代表 0.15μm）

    # 半角由 N.A. 决定（纯示意，乘以 0.9 防止锥角过大撑出边框）
    half_angle = math.asin(min(na / 1.6, 0.98)) * 0.9
    cone_half_w = (obj_y - src_y) * math.tan(half_angle)

    # ── 物镜（矩形）───────────────────────────────────────────────────────
    lens = Rectangle(width=cone_half_w * 2 + 0.3, height=0.22,
                     color=WHITE, fill_color="#1a2a3a", fill_opacity=0.8)
    lens.move_to([center_x, obj_y, 0])
    group.add(lens)

    # ── 入射光锥（两侧斜线）──────────────────────────────────────────────
    apex_l = np.array([center_x - half_sep, src_y, 0])
    apex_r = np.array([center_x + half_sep, src_y, 0])
    top_l = np.array([center_x - cone_half_w, obj_y, 0])
    top_r = np.array([center_x + cone_half_w, obj_y, 0])

    cone_ll = Line(apex_l, top_l, color=color, stroke_width=1.5, stroke_opacity=0.7)
    cone_lr = Line(apex_l, top_r, color=color, stroke_width=1.5, stroke_opacity=0.7)
    cone_rl = Line(apex_r, top_l, color=color, stroke_width=1.5, stroke_opacity=0.7)
    cone_rr = Line(apex_r, top_r, color=color, stroke_width=1.5, stroke_opacity=0.7)
    group.add(cone_ll, cone_lr, cone_rl, cone_rr)

    # ── 两个发光点（红色圆点）────────────────────────────────────────────
    pt_l = Dot(point=[center_x - half_sep, src_y, 0], radius=0.08, color=RED)
    pt_r = Dot(point=[center_x + half_sep, src_y, 0], radius=0.08, color=RED)
    group.add(pt_l, pt_r)

    # ── 像平面──────────────────────────────────────────────────────────
    img_line = Line([center_x - 1.0, img_y, 0], [center_x + 1.0, img_y, 0],
                    color=WHITE, stroke_width=1.5)
    group.add(img_line)

    # ── 像平面上的亮斑示意（高斯斑）─────────────────────────────────────
    if can_resolve:
        # 两个可区分亮斑
        blob_l = Dot(point=[center_x - half_sep * 2.2, img_y, 0],
                     radius=0.10, color=YELLOW)
        blob_r = Dot(point=[center_x + half_sep * 2.2, img_y, 0],
                     radius=0.10, color=YELLOW)
        glow_l = blob_l.copy().set_opacity(0.3).scale(2.5)
        glow_r = blob_r.copy().set_opacity(0.3).scale(2.5)
        group.add(glow_l, glow_r, blob_l, blob_r)
    else:
        # 叠成一个模糊斑
        blob = Dot(point=[center_x, img_y, 0], radius=0.20, color=YELLOW)
        glow = blob.copy().set_opacity(0.25).scale(3.0)
        group.add(glow, blob)

    return group


class Ch10Ex2MicroscopeNaResolutionComparison(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("数值孔径与分辨细节的判断", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第十章 几何光学 · 10.4 显微镜的分辨本领", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比
        # ════════════════════════════════════════════════════════════════════
        ana1 = Text("显微镜能看清多细微的结构？", font=CJK).scale(0.50)
        ana2 = Text("关键不在放大倍率，而在能否「分辨」两个相邻的点——", font=CJK).scale(0.47)
        ana3 = Text("这由物镜收光能力（数值孔径 N.A.）决定。", font=CJK, color=CYAN).scale(0.47)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3 · 最小分辨距离公式（逐行出现 + 高亮）
        # ════════════════════════════════════════════════════════════════════
        def_label = Text("最小分辨距离公式", font=CJK, color=BLUE).scale(0.50)
        def_label.next_to(title, DOWN, buff=0.45)

        row_na = VGroup(
            Text("N.A. = n sin u", font=CJK, color=WHITE).scale(0.45),
        )
        eq_na = MathTex(r"\mathrm{N.A.} = n \sin u").scale(0.85)
        eq_na[0][3:].set_color(YELLOW)

        eq_z = MathTex(r"Z = \frac{0.61\,\lambda}{\mathrm{N.A.}}").scale(1.0)
        eq_z[0][0].set_color(GREEN)
        eq_z[0][4:].set_color(YELLOW)

        note_z = Text("Z 越小 → 能分辨更近的两点 → 分辨本领越强", font=CJK, color=CYAN).scale(0.42)

        defs = VGroup(eq_na, eq_z, note_z).arrange(DOWN, buff=0.45).next_to(def_label, DOWN, buff=0.4)

        self.play(FadeIn(def_label))
        self.play(Write(eq_na))
        self.wait(1.0)
        self.play(Write(eq_z))
        self.wait(1.0)
        self.play(FadeIn(note_z))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_label, eq_na, eq_z, note_z)))

        # ════════════════════════════════════════════════════════════════════
        # Step 4 · 题目条件
        # ════════════════════════════════════════════════════════════════════
        cond_title = Text("例题条件", font=CJK, color=BLUE).scale(0.50)
        cond_title.next_to(title, DOWN, buff=0.45)

        cond1 = Text("光源波长  λ = 600 nm", font=CJK).scale(0.46)
        cond2 = Text("两发光点间距  d = 0.3 μm = 300 nm", font=CJK).scale(0.46)
        cond3 = Text("镜 A：N.A. = 0.75（干燥物镜）", font=CJK, color=AMBER).scale(0.46)
        cond4 = Text("镜 B：N.A. = 1.5（油浸物镜，n = 1.5）", font=CJK, color=GREEN).scale(0.46)
        conds = VGroup(cond1, cond2, cond3, cond4).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.4)
        conds.scale_to_fit_width(10)

        self.play(FadeIn(cond_title))
        for c in [cond1, cond2, cond3, cond4]:
            self.play(FadeIn(c))
            self.wait(0.5)
        self.wait(1.5)
        self.play(FadeOut(VGroup(cond_title, conds)))

        # ════════════════════════════════════════════════════════════════════
        # Step 5 · 并排显微镜剖面图
        # ════════════════════════════════════════════════════════════════════
        scope_a = make_microscope_side(na=0.75, center_x=-3.0, color=AMBER, can_resolve=False)
        scope_b = make_microscope_side(na=1.5,  center_x=3.0,  color=GREEN, can_resolve=True)

        label_a = Text("镜 A   N.A. = 0.75", font=CJK, color=AMBER).scale(0.42)
        label_a.move_to([-3.0, 2.25, 0])
        label_b = Text("镜 B   N.A. = 1.5（油浸）", font=CJK, color=GREEN).scale(0.42)
        label_b.move_to([3.0, 2.25, 0])

        sep_line = DashedLine([0, 2.5, 0], [0, -2.4, 0], color=WHITE, stroke_opacity=0.4)

        src_label_a = Text("d = 0.3 μm", font=CJK, color=RED).scale(0.32)
        src_label_a.move_to([-3.0, -0.95, 0])
        src_label_b = Text("d = 0.3 μm", font=CJK, color=RED).scale(0.32)
        src_label_b.move_to([3.0, -0.95, 0])

        img_label_a = Text("模糊（叠加）", font=CJK, color=RED).scale(0.32)
        img_label_a.move_to([-3.0, -2.15, 0])
        img_label_b = Text("可分辨（两斑）", font=CJK, color=GREEN).scale(0.32)
        img_label_b.move_to([3.0, -2.15, 0])

        scope_group = VGroup(scope_a, scope_b, label_a, label_b, sep_line,
                             src_label_a, src_label_b, img_label_a, img_label_b)
        scope_group.shift(DOWN * 0.15)

        self.play(Create(sep_line))
        self.play(FadeIn(label_a), FadeIn(label_b))
        self.play(Create(scope_a), Create(scope_b))
        self.play(FadeIn(src_label_a), FadeIn(src_label_b))
        self.wait(1.0)
        self.play(FadeIn(img_label_a), FadeIn(img_label_b))
        self.wait(2.0)
        self.play(FadeOut(scope_group))

        # ════════════════════════════════════════════════════════════════════
        # Step 6 · 计算过程（逐步推导，左右对比）
        # ════════════════════════════════════════════════════════════════════
        calc_title = Text("逐步计算对比", font=CJK, color=BLUE).scale(0.50)
        calc_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(calc_title))

        # 镜 A
        label_ca = Text("镜 A（N.A.=0.75）", font=CJK, color=AMBER).scale(0.44)
        label_ca.next_to(calc_title, DOWN, buff=0.4).shift(LEFT * 3.2)

        eq_ca1 = MathTex(
            r"Z_1 = \frac{0.61 \times 600\,\mathrm{nm}}{0.75}"
        ).scale(0.72)
        eq_ca2 = MathTex(r"= 488\,\mathrm{nm}").scale(0.72).set_color(RED)
        eq_ca3 = MathTex(r"488\,\mathrm{nm} > 300\,\mathrm{nm}").scale(0.72).set_color(RED)
        result_a = Text("无法分辨", font=CJK, color=RED).scale(0.50)

        col_a = VGroup(label_ca, eq_ca1, eq_ca2, eq_ca3, result_a).arrange(DOWN, buff=0.28)
        col_a.next_to(calc_title, DOWN, buff=0.4).shift(LEFT * 3.0)

        # 镜 B
        label_cb = Text("镜 B（N.A.=1.5，油浸）", font=CJK, color=GREEN).scale(0.44)

        eq_cb1 = MathTex(
            r"Z_2 = \frac{0.61 \times 600\,\mathrm{nm}}{1.5}"
        ).scale(0.72)
        eq_cb2 = MathTex(r"= 244\,\mathrm{nm}").scale(0.72).set_color(GREEN)
        eq_cb3 = MathTex(r"244\,\mathrm{nm} < 300\,\mathrm{nm}").scale(0.72).set_color(GREEN)
        result_b = Text("可以分辨", font=CJK, color=GREEN).scale(0.50)

        col_b = VGroup(label_cb, eq_cb1, eq_cb2, eq_cb3, result_b).arrange(DOWN, buff=0.28)
        col_b.next_to(calc_title, DOWN, buff=0.4).shift(RIGHT * 3.0)

        vsep = DashedLine([0, 0.2, 0], [0, -3.0, 0], color=WHITE, stroke_opacity=0.35)

        self.play(FadeIn(label_ca), FadeIn(label_cb))
        self.wait(0.4)
        self.play(Write(eq_ca1), Write(eq_cb1))
        self.wait(1.0)
        self.play(Write(eq_ca2), Write(eq_cb2))
        self.wait(0.8)
        self.play(Write(eq_ca3), Write(eq_cb3))
        self.wait(0.8)
        self.play(FadeIn(result_a), FadeIn(result_b), Create(vsep))
        self.wait(2.0)
        self.play(FadeOut(VGroup(calc_title, col_a, col_b, vsep)))

        # ════════════════════════════════════════════════════════════════════
        # Step 7 · ValueTracker：N.A. 从 0.5 → 1.5 拖动，Z 实时变化
        # ════════════════════════════════════════════════════════════════════
        vt_title = Text("动态演示：拖动 N.A.，观察最小分辨距离 Z", font=CJK, color=BLUE).scale(0.48)
        vt_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(vt_title))

        na_tracker = ValueTracker(0.5)
        lam_nm = 600.0
        d_nm = 300.0

        # ── 坐标轴（横轴 N.A.，纵轴 Z/nm）──
        axes = Axes(
            x_range=[0.4, 1.6, 0.2],
            y_range=[0, 800, 200],
            x_length=7.5,
            y_length=3.5,
            axis_config={"color": WHITE, "include_numbers": True,
                         "decimal_number_config": {"num_decimal_places": 1}},
            tips=False,
        ).next_to(vt_title, DOWN, buff=0.35).shift(LEFT * 0.3)

        ax_label_x = VGroup(
            Text("N.A.", font=CJK).scale(0.38)
        ).next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)

        ax_label_y = VGroup(
            Text("Z / nm", font=CJK).scale(0.38)
        ).next_to(axes.y_axis.get_top(), UP, buff=0.12)

        # Z(N.A.) 曲线（不随 tracker 变化 → 静态绘制一次，降采样减少点数）
        curve = axes.plot(
            lambda x: 0.61 * lam_nm / x,
            x_range=[0.41, 1.59, 0.03],
            color=CYAN,
            stroke_width=2.5,
        )

        # 阈值横线 d=300nm
        thresh_line = DashedVMobject(
            axes.plot(lambda x: d_nm, x_range=[0.41, 1.59], color=WHITE,
                      stroke_width=1.5),
            num_dashes=30,
        )

        thresh_label = VGroup(
            Text("d = 300 nm（两点间距）", font=CJK, color=WHITE).scale(0.35)
        ).next_to(axes.c2p(0.42, d_nm), RIGHT, buff=0.1)

        # 动态点（NA, Z）：单个 Dot + updater（不重建）
        moving_dot = Dot(radius=0.12, color=RED)

        def update_moving_dot(m):
            na_val = na_tracker.get_value()
            z_val = 0.61 * lam_nm / na_val
            m.move_to(axes.c2p(na_val, min(z_val, 799)))
            m.set_color(RED if z_val > d_nm else GREEN)

        moving_dot.add_updater(update_moving_dot)

        # 动态竖线（NA 位置）：单个 Line + updater（不用 always_redraw 重建）
        moving_vline = Line(color=AMBER, stroke_width=1.5)

        def update_vline(m):
            na_val = na_tracker.get_value()
            z_val = min(0.61 * lam_nm / na_val, 799)
            m.put_start_and_end_on(axes.c2p(na_val, 0), axes.c2p(na_val, z_val))

        moving_vline.add_updater(update_vline)

        # 动态文本读数：静态文字 + DecimalNumber（数值刷新不编译 LaTeX，避免 dvisvgm 反复调用）
        na_caption = Text("N.A. =", font=CJK).scale(0.5)
        na_num = DecimalNumber(0.5, num_decimal_places=2).scale(0.6)
        na_row = VGroup(na_caption, na_num).arrange(RIGHT, buff=0.12)

        z_caption = Text("Z =", font=CJK).scale(0.5)
        z_num = DecimalNumber(0, num_decimal_places=0, unit=r"\,\mathrm{nm}").scale(0.6)
        z_row = VGroup(z_caption, z_num).arrange(RIGHT, buff=0.12)

        # 预创建两条判定文字（绿/红），用透明度切换，避免每帧重建 Text
        verdict_cannot = Text("Z > d：无法分辨", font=CJK, color=RED).scale(0.42)
        verdict_can = Text("Z < d：可分辨", font=CJK, color=GREEN).scale(0.42)
        verdict_group = VGroup(verdict_cannot, verdict_can)
        # 两条文字叠放在同一位置
        verdict_can.move_to(verdict_cannot)

        na_readout_mob = VGroup(na_row, z_row, verdict_group).arrange(
            DOWN, buff=0.2, aligned_edge=LEFT).to_corner(UR, buff=0.5)
        verdict_can.move_to(verdict_cannot)

        def update_readout(grp):
            na_v = na_tracker.get_value()
            z_v = 0.61 * lam_nm / na_v
            col = RED if z_v > d_nm else GREEN
            na_num.set_value(na_v)
            na_num.set_color(col)
            na_caption.set_color(col)
            z_num.set_value(z_v)
            z_num.set_color(col)
            z_caption.set_color(col)
            # 切换判定文字（透明度）
            if z_v > d_nm:
                verdict_cannot.set_opacity(1.0)
                verdict_can.set_opacity(0.0)
            else:
                verdict_cannot.set_opacity(0.0)
                verdict_can.set_opacity(1.0)

        na_readout_mob.add_updater(update_readout)

        self.play(Create(axes), FadeIn(ax_label_x), FadeIn(ax_label_y))
        self.play(Create(curve), Create(thresh_line), FadeIn(thresh_label))
        self.add(moving_dot, moving_vline, na_readout_mob)
        self.wait(0.5)

        # 扫动：从 0.5 到 1.5
        sweep_label = Text("N.A. 从 0.5 增大到 1.5：Z 穿越 300nm 时颜色变绿", font=CJK, color=AMBER).scale(0.38)
        sweep_label.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(sweep_label))
        self.play(na_tracker.animate.set_value(1.5), run_time=2.0, rate_func=linear)
        self.wait(0.8)
        # 再扫回
        self.play(na_tracker.animate.set_value(0.5), run_time=2.0, rate_func=linear)
        self.wait(0.5)
        # 定格到临界值
        na_crit = 0.61 * lam_nm / d_nm   # ≈ 1.22
        self.play(na_tracker.animate.set_value(na_crit), run_time=1.5)
        # 移除 updater，便于干净 FadeOut
        moving_dot.clear_updaters()
        moving_vline.clear_updaters()
        na_readout_mob.clear_updaters()
        crit_note = VGroup(
            Text("临界 N.A. =", font=CJK, color=CYAN).scale(0.40),
            MathTex(rf"\frac{{0.61 \times 600}}{{300}} \approx 1.22", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.15).to_edge(DOWN, buff=0.7)
        self.play(FadeIn(crit_note))
        self.wait(2.0)

        # 清场
        self.play(FadeOut(VGroup(
            vt_title, axes, ax_label_x, ax_label_y,
            curve, thresh_line, thresh_label,
            moving_dot, moving_vline, na_readout_mob,
            sweep_label, crit_note,
        )))

        # ════════════════════════════════════════════════════════════════════
        # Step 8 · 油浸物镜原理
        # ════════════════════════════════════════════════════════════════════
        oil_title = Text("油浸物镜原理：为何 N.A. 能超过 1？", font=CJK, color=BLUE).scale(0.50)
        oil_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(oil_title))

        # 干燥 vs 油浸示意
        def make_cone_sketch(cx, half_ang, label_str, color, bottom_y=-1.0, top_y=0.6):
            g = VGroup()
            hw = (top_y - bottom_y) * math.tan(half_ang)
            apex = np.array([cx, bottom_y, 0])
            tl = np.array([cx - hw, top_y, 0])
            tr = np.array([cx + hw, top_y, 0])
            l_line = Line(apex, tl, color=color, stroke_width=2)
            r_line = Line(apex, tr, color=color, stroke_width=2)
            lens_rect = Rectangle(width=hw * 2 + 0.25, height=0.18,
                                  color=WHITE, fill_color="#1a2a3a", fill_opacity=0.7)
            lens_rect.move_to([cx, top_y, 0])
            dot_src = Dot([cx, bottom_y, 0], radius=0.09, color=RED)
            txt = Text(label_str, font=CJK, color=color).scale(0.38)
            txt.move_to([cx, top_y + 0.28, 0])
            ang_label = MathTex(r"u", color=color).scale(0.45).move_to([cx + hw * 0.55, (bottom_y + top_y) / 2, 0])
            g.add(l_line, r_line, lens_rect, dot_src, txt, ang_label)
            return g

        dry_ang = math.asin(0.75)
        oil_ang = math.asin(1.5 / 1.5)   # sin u = N.A./n => u→90° with n=1.5, N.A.=1.5
        oil_ang_draw = math.radians(62)   # 示意用 62° 防止图形畸变

        dry_sketch = make_cone_sketch(-3.0, dry_ang, "干燥  n=1, N.A.=0.75", AMBER)
        oil_sketch = make_cone_sketch(3.0,  oil_ang_draw, "油浸  n=1.5, N.A.=1.5", GREEN)

        oil_sep = DashedLine([0, 1.0, 0], [0, -1.2, 0], color=WHITE, stroke_opacity=0.35)

        oil_eq_a = VGroup(
            Text("N.A. = n sin u,  n=1", font=CJK, color=AMBER).scale(0.38),
        ).move_to([-3.0, -1.45, 0])
        oil_eq_b = VGroup(
            Text("N.A. = n sin u,  n=1.5", font=CJK, color=GREEN).scale(0.38),
        ).move_to([3.0, -1.45, 0])

        oil_explain = Text(
            "在物和物镜间充油（n=1.5）：同样张角 u 下 N.A. 增大 1.5 倍，分辨本领翻倍。",
            font=CJK, color=CYAN
        ).scale(0.40).to_edge(DOWN, buff=0.35)

        sketches_group = VGroup(dry_sketch, oil_sketch, oil_sep, oil_eq_a, oil_eq_b)
        sketches_group.shift(DOWN * 0.2)

        self.play(Create(oil_sep))
        self.play(FadeIn(dry_sketch), FadeIn(oil_sketch))
        self.play(FadeIn(oil_eq_a), FadeIn(oil_eq_b))
        self.wait(0.8)
        self.play(FadeIn(oil_explain))
        self.wait(2.0)
        self.play(FadeOut(VGroup(oil_title, sketches_group, oil_explain)))

        # ════════════════════════════════════════════════════════════════════
        # Step 9 · 小结卡
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本例小结", font=CJK, color=BLUE).scale(0.54)
        s_title.next_to(title, DOWN, buff=0.42)

        s_formula = MathTex(
            r"Z = \frac{0.61\,\lambda}{\mathrm{N.A.}}", color=YELLOW
        ).scale(1.0)

        line_a = VGroup(
            MathTex(r"Z_1 = 488\,\mathrm{nm} > 300\,\mathrm{nm}", color=RED).scale(0.75),
            Text("镜 A 无法分辨", font=CJK, color=RED).scale(0.45),
        ).arrange(RIGHT, buff=0.4)

        line_b = VGroup(
            MathTex(r"Z_2 = 244\,\mathrm{nm} < 300\,\mathrm{nm}", color=GREEN).scale(0.75),
            Text("镜 B 可以分辨", font=CJK, color=GREEN).scale(0.45),
        ).arrange(RIGHT, buff=0.4)

        s_key = Text("增大 N.A.（油浸）→ Z 减小 → 分辨本领增强", font=CJK, color=CYAN).scale(0.44)

        summary = VGroup(s_formula, line_a, line_b, s_key).arrange(DOWN, buff=0.42)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_formula))
        self.wait(0.6)
        self.play(FadeIn(line_a))
        self.wait(0.5)
        self.play(FadeIn(line_b))
        self.wait(0.5)
        self.play(FadeIn(s_key))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch10Ex2MicroscopeNaResolutionComparison",
        "id": "phys-ch10-10.4-ex2-microscope-na-resolution-comparison",
        "chapterId": "ch10",
        "sectionId": "10.4",
        "title": "数值孔径与分辨细节的判断",
        "description": "通过左右对比两台显微镜（N.A.=0.75 干燥 vs N.A.=1.5 油浸），演示最小分辨距离公式 Z=0.61λ/N.A. 及 ValueTracker 动态扫动，揭示油浸物镜提升分辨本领的原理。",
    },
]
