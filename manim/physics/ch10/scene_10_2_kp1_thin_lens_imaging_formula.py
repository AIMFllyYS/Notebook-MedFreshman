"""第 10.2 节 · 薄透镜成像公式与三条特殊光线

可视化思路：
  1. 绘制凸透镜（主光轴 + 双凸外轮廓）、焦点 F1/F2、物点 P（红色箭头）。
  2. 分三步依次动画三条特殊光线（红/蓝/绿），交点即像点 P'，注明「两条即可定像」。
  3. ValueTracker 控制物距 u，像点实时跟随；高亮 u=2f（等大实像），u→f+（像→∞），u<f（虚像）。
  4. 右侧面板实时显示 1/u + 1/v = 1/f、放大倍率 m 的数值。
  5. 对比凸/凹透镜：改变 f 符号展示凹透镜永远成缩小虚像。

铁律：MathTex 内只含 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 全局光学参数 ────────────────────────────────────────────────────────────────
F = 1.8          # 焦距（屏幕单位）
LENS_H = 2.4     # 透镜图形高度
AXIS_X = 6.5     # 主光轴半长


def lens_curve_points(height=LENS_H, bulge=0.4, n=60):
    """生成一片凸透镜的右半弧点列（闭合）。"""
    pts_right = []
    for i in range(n + 1):
        t = -1 + 2 * i / n
        y = t * height / 2
        x = bulge * (1 - t ** 2)
        pts_right.append([x, y, 0])
    pts_left = [[-p[0], p[1], 0] for p in reversed(pts_right)]
    return pts_right + pts_left


class Ch10Kp1ThinLensImagingFormula(Scene):
    def construct(self):
        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 1 · 标题                                       ║
        # ╚══════════════════════════════════════════════════════╝
        title = Text("薄透镜成像公式与三条特殊光线", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 2 · 生活类比                                   ║
        # ╚══════════════════════════════════════════════════════╝
        ana1 = Text("放大镜、照相机镜头、近视眼镜——", font=CJK).scale(0.48)
        ana2 = Text("它们都靠「薄透镜」来折射光线，把光汇聚到像点上。", font=CJK).scale(0.48)
        ana3 = Text("只需掌握三条特殊光线，就能作图求像。", font=CJK, color=GREEN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 3 · 成像公式定义（逐步出现）                   ║
        # ╚══════════════════════════════════════════════════════╝
        def_title = Text("薄透镜基本公式", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        eq_lens = MathTex(
            r"\frac{1}{u}", r"+", r"\frac{1}{v}", r"=", r"\frac{1}{f}"
        ).scale(1.05)
        eq_lens.next_to(def_title, DOWN, buff=0.5)
        eq_lens[0].set_color(YELLOW)
        eq_lens[2].set_color(GREEN)
        eq_lens[4].set_color(CYAN)
        self.play(FadeIn(def_title))
        self.play(Write(eq_lens))
        self.wait(0.6)

        legend = VGroup(
            VGroup(Text("u", font=CJK, color=YELLOW).scale(0.44),
                   Text("物距（物到透镜）", font=CJK).scale(0.44)).arrange(RIGHT, buff=0.15),
            VGroup(Text("v", font=CJK, color=GREEN).scale(0.44),
                   Text("像距（像到透镜）", font=CJK).scale(0.44)).arrange(RIGHT, buff=0.15),
            VGroup(Text("f", font=CJK, color=CYAN).scale(0.44),
                   Text("焦距（凸透镜 f>0）", font=CJK).scale(0.44)).arrange(RIGHT, buff=0.15),
        ).arrange(DOWN, buff=0.22, aligned_edge=LEFT).next_to(eq_lens, DOWN, buff=0.4)

        eq_maker = MathTex(
            r"\frac{1}{f}", r"=", r"(n-1)\!\left(\frac{1}{r_1}-\frac{1}{r_2}\right)"
        ).scale(0.72).next_to(legend, DOWN, buff=0.35)
        eq_maker[0].set_color(CYAN)
        maker_zh = Text("磨镜者公式：透镜曲率决定焦距", font=CJK, color=ORANGE).scale(0.40)
        maker_zh.next_to(eq_maker, DOWN, buff=0.2)

        self.play(FadeIn(legend))
        self.wait(1.0)
        self.play(Write(eq_maker), FadeIn(maker_zh))
        self.wait(1.6)
        self.play(FadeOut(VGroup(def_title, eq_lens, legend, eq_maker, maker_zh)))

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 4 · 绘制透镜场景（静态基础）                   ║
        # ╚══════════════════════════════════════════════════════╝
        # 主光轴
        optic_axis = Line(LEFT * AXIS_X, RIGHT * AXIS_X,
                          color=WHITE, stroke_width=1.5).shift(DOWN * 0.2)
        axis_lbl = Text("主光轴", font=CJK, color=WHITE).scale(0.35).next_to(
            optic_axis.get_end(), DOWN, buff=0.12)

        # 透镜（双凸，用 Polygon 近似）
        lens_pts = lens_curve_points(height=LENS_H, bulge=0.38, n=48)
        lens_shape = Polygon(*lens_pts, color=CYAN, fill_color=CYAN,
                             fill_opacity=0.18, stroke_width=2.5)
        lens_shape.shift(DOWN * 0.2)

        # 焦点 F1（左）、F2（右）
        f1_pos = np.array([-F, -0.2, 0])
        f2_pos = np.array([F, -0.2, 0])
        f1_dot = Dot(f1_pos, color=YELLOW, radius=0.09)
        f2_dot = Dot(f2_pos, color=YELLOW, radius=0.09)
        f1_lbl = MathTex(r"F_1", color=YELLOW).scale(0.55).next_to(f1_dot, DOWN, buff=0.12)
        f2_lbl = MathTex(r"F_2", color=YELLOW).scale(0.55).next_to(f2_dot, DOWN, buff=0.12)

        base_scene = VGroup(optic_axis, lens_shape, axis_lbl,
                            f1_dot, f2_dot, f1_lbl, f2_lbl)
        self.play(Create(optic_axis), Create(lens_shape))
        self.play(FadeIn(axis_lbl), FadeIn(f1_dot), FadeIn(f1_lbl),
                  FadeIn(f2_dot), FadeIn(f2_lbl))
        self.wait(0.8)

        # 物点 P（在 F1 左侧，u = 3f）
        u0 = 3 * F
        obj_base = np.array([-u0, -0.2, 0])   # 物点在主光轴上的脚
        obj_tip = np.array([-u0, -0.2 + 1.0, 0])  # 物点顶端（高 1 单位）
        obj_arrow = Arrow(obj_base, obj_tip, color=RED,
                          buff=0, stroke_width=3,
                          max_tip_length_to_length_ratio=0.22)
        p_lbl = Text("P", font=CJK, color=RED).scale(0.45).next_to(obj_tip, LEFT, buff=0.1)
        self.play(GrowArrow(obj_arrow), FadeIn(p_lbl))
        self.wait(0.8)

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 5 · 三条特殊光线（逐步绘制）                   ║
        # ╚══════════════════════════════════════════════════════╝
        ray_title = Text("三条特殊光线确定像点", font=CJK, color=BLUE).scale(0.46)
        ray_title.to_corner(UL, buff=0.55).shift(DOWN * 0.7)

        # 物点顶端坐标
        P = obj_tip
        axis_y = -0.2  # 主光轴 y 坐标
        lens_x = 0.0   # 透镜 x 坐标

        # 由公式算像点（u = u0）
        def calc_image(u, f=F):
            if abs(u - f) < 1e-6:
                return None
            v = 1.0 / (1.0 / f - 1.0 / u)
            return v

        v0 = calc_image(u0)
        img_tip = np.array([v0, axis_y + 1.0 * (-v0 / u0), 0])  # 放大 m = -v/u

        # ── 光线 1：平行于主轴 → 经 F2 折射 ──────────────────
        r1_seg1 = Line(P, np.array([lens_x, P[1], 0]), color=RED, stroke_width=2.5)
        r1_seg2 = Line(np.array([lens_x, P[1], 0]), img_tip, color=RED, stroke_width=2.5)

        ray1_zh = Text("平行主轴 → 经 F₂（折射后过焦点）", font=CJK, color=RED).scale(0.40)
        ray1_zh.to_corner(UR, buff=0.45).shift(DOWN * 0.8)

        self.play(FadeIn(ray_title))
        self.play(Create(r1_seg1))
        self.wait(0.5)
        self.play(Create(r1_seg2), FadeIn(ray1_zh))
        self.wait(1.0)

        # ── 光线 2：过 F1 → 折射后平行于主轴 ────────────────
        r2_seg1 = Line(P, np.array([lens_x, P[1], 0]), color=BLUE, stroke_width=2.5)
        # 折射后平行射向像侧
        r2_seg2 = Line(np.array([lens_x, P[1], 0]),
                       np.array([img_tip[0], P[1], 0]), color=BLUE, stroke_width=2.5)

        ray2_zh = Text("过 F₁ → 折射后平行主轴射出", font=CJK, color=BLUE).scale(0.40)
        ray2_zh.next_to(ray1_zh, DOWN, buff=0.18)

        self.play(Create(r2_seg1))
        self.wait(0.4)
        self.play(Create(r2_seg2), FadeIn(ray2_zh))
        self.wait(1.0)

        # ── 光线 3：过光心 → 不偏折 ──────────────────────────
        r3_line = Line(P, img_tip, color=GREEN, stroke_width=2.5)
        ray3_zh = Text("过光心 → 方向不变（直线穿过）", font=CJK, color=GREEN).scale(0.40)
        ray3_zh.next_to(ray2_zh, DOWN, buff=0.18)

        self.play(Create(r3_line), FadeIn(ray3_zh))
        self.wait(0.8)

        # 像点 P' 与说明
        img_dot = Dot(img_tip, color=WHITE, radius=0.10)
        pp_lbl = Text("P'", font=CJK, color=WHITE).scale(0.45).next_to(img_tip, RIGHT, buff=0.1)
        note_2rays = Text("任意两条即可定像", font=CJK, color=YELLOW).scale(0.42)
        note_2rays.next_to(img_dot, DOWN, buff=0.5)

        self.play(FadeIn(img_dot), FadeIn(pp_lbl))
        self.play(FadeIn(note_2rays))
        self.wait(1.2)

        # 清除光线说明，保留基础场景
        self.play(FadeOut(VGroup(r1_seg1, r1_seg2, r2_seg1, r2_seg2, r3_line,
                                 ray1_zh, ray2_zh, ray3_zh,
                                 img_dot, pp_lbl, note_2rays, ray_title,
                                 obj_arrow, p_lbl)))
        self.wait(0.5)

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 6 · ValueTracker 动态成像 + 右侧实时面板        ║
        # ╚══════════════════════════════════════════════════════╝
        u_tracker = ValueTracker(3.0 * F)

        # ── 物点（跟随 u_tracker）──────────────────────────────
        def make_obj_arrow():
            u = u_tracker.get_value()
            base = np.array([-u, axis_y, 0])
            tip = np.array([-u, axis_y + 1.0, 0])
            return Arrow(base, tip, color=RED, buff=0,
                         stroke_width=3, max_tip_length_to_length_ratio=0.22)

        def make_obj_lbl():
            u = u_tracker.get_value()
            tip = np.array([-u, axis_y + 1.0, 0])
            return Text("P", font=CJK, color=RED).scale(0.42).next_to(tip, LEFT, buff=0.08)

        dyn_obj = always_redraw(make_obj_arrow)
        dyn_obj_lbl = always_redraw(make_obj_lbl)

        # ── 像点（实时计算）──────────────────────────────────
        def get_v(f_val=F):
            u = u_tracker.get_value()
            if abs(u - f_val) < 0.05:
                return None
            v = 1.0 / (1.0 / f_val - 1.0 / u)
            return v

        def make_img_arrow():
            v = get_v()
            if v is None or abs(v) > AXIS_X * 1.5:
                return VGroup()  # 像点超出范围
            u = u_tracker.get_value()
            h_img = -1.0 * v / u   # m = -v/u
            # 虚像用虚线样式（但 Arrow 不支持虚线，用颜色区分）
            c = ORANGE if v > 0 else PURPLE
            base = np.array([v, axis_y, 0])
            tip = np.array([v, axis_y + h_img, 0])
            if abs(tip[1] - base[1]) < 0.05:
                return VGroup()
            return Arrow(base, tip, color=c, buff=0,
                         stroke_width=3, max_tip_length_to_length_ratio=0.22)

        def make_img_lbl():
            v = get_v()
            if v is None or abs(v) > AXIS_X * 1.5:
                return VGroup()
            u = u_tracker.get_value()
            h_img = -1.0 * v / u
            tip = np.array([v, axis_y + h_img, 0])
            label_text = "P'" if v > 0 else "P'(虚)"
            return Text(label_text, font=CJK, color=ORANGE if v > 0 else PURPLE
                        ).scale(0.40).next_to(tip, RIGHT, buff=0.08)

        # ── 光线 1（平行→F2）实时 ──────────────────────────
        def make_ray1():
            u = u_tracker.get_value()
            v = get_v()
            P_top = np.array([-u, axis_y + 1.0, 0])
            lens_pt = np.array([lens_x, axis_y + 1.0, 0])
            segs = VGroup()
            segs.add(Line(P_top, lens_pt, color=RED, stroke_width=2))
            if v is not None and abs(v) < AXIS_X * 1.2:
                h_img = -1.0 * v / u
                img_t = np.array([v, axis_y + h_img, 0])
                segs.add(Line(lens_pt, img_t, color=RED, stroke_width=2))
            else:
                # 延伸到屏幕边缘
                target = np.array([AXIS_X, axis_y - 2.0, 0])
                segs.add(Line(lens_pt, target, color=RED, stroke_width=2))
            return segs

        # ── 光线 3（过光心）实时 ──────────────────────────
        def make_ray3():
            u = u_tracker.get_value()
            v = get_v()
            P_top = np.array([-u, axis_y + 1.0, 0])
            if v is not None and abs(v) < AXIS_X * 1.2:
                h_img = -1.0 * v / u
                img_t = np.array([v, axis_y + h_img, 0])
                return Line(P_top, img_t, color=GREEN, stroke_width=2)
            else:
                slope = (axis_y + 1.0 - axis_y) / (-u - 0)
                end_x = AXIS_X if v is None or v > 0 else -AXIS_X
                end_y = (axis_y + 1.0) + slope * (end_x - (-u))
                return Line(P_top, np.array([end_x, end_y, 0]), color=GREEN, stroke_width=2)

        dyn_ray1 = always_redraw(make_ray1)
        dyn_ray3 = always_redraw(make_ray3)
        dyn_img = always_redraw(make_img_arrow)
        dyn_img_lbl = always_redraw(make_img_lbl)

        # ── 右侧实时数值面板 ──────────────────────────────
        panel_bg = Rectangle(width=3.2, height=3.6, color=BLUE,
                             fill_color=BLACK, fill_opacity=0.75,
                             stroke_width=1.5).to_edge(RIGHT, buff=0.15).shift(UP * 0.1)

        def make_panel_text():
            u = u_tracker.get_value()
            v = get_v()
            f_val = F
            if v is None:
                v_str = r"\infty"
                m_str = r"\infty"
            else:
                v_str = f"{v:.2f}"
                m_val = -v / u
                m_str = f"{m_val:.2f}"

            lines = VGroup(
                MathTex(r"\frac{1}{u}+\frac{1}{v}=\frac{1}{f}", color=YELLOW).scale(0.52),
                VGroup(Text("f =", font=CJK, color=CYAN).scale(0.40),
                       MathTex(f"{f_val:.2f}", color=CYAN).scale(0.52)).arrange(RIGHT, buff=0.1),
                VGroup(Text("u =", font=CJK, color=RED).scale(0.40),
                       MathTex(f"{u:.2f}", color=RED).scale(0.52)).arrange(RIGHT, buff=0.1),
                VGroup(Text("v =", font=CJK, color=GREEN).scale(0.40),
                       MathTex(v_str, color=GREEN).scale(0.52)).arrange(RIGHT, buff=0.1),
                VGroup(Text("m =", font=CJK, color=ORANGE).scale(0.40),
                       MathTex(m_str, color=ORANGE).scale(0.52)).arrange(RIGHT, buff=0.1),
            ).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
            lines.move_to(panel_bg.get_center())
            return lines

        dyn_panel = always_redraw(make_panel_text)

        # ── 物距标注 ──────────────────────────────────────
        def make_u_label():
            u = u_tracker.get_value()
            return VGroup(
                Text("u", font=CJK, color=RED).scale(0.38),
                MathTex(f"= {u:.1f}", color=RED).scale(0.45),
            ).arrange(RIGHT, buff=0.08).next_to(
                np.array([-u / 2 - 0.5, axis_y - 0.5, 0]), DOWN, buff=0.05)

        dyn_u_lbl = always_redraw(make_u_label)

        self.play(FadeIn(panel_bg))
        self.add(dyn_panel, dyn_obj, dyn_obj_lbl,
                 dyn_ray1, dyn_ray3,
                 dyn_img, dyn_img_lbl, dyn_u_lbl)

        # 状态提示
        status_text = always_redraw(lambda: (
            Text("实像（v>0）", font=CJK, color=ORANGE).scale(0.42)
            if get_v() is not None and get_v() > 0
            else (Text("虚像（v<0）", font=CJK, color=PURPLE).scale(0.42)
                  if get_v() is not None and get_v() < 0
                  else Text("像在无穷远", font=CJK, color=YELLOW).scale(0.42))
        ).to_edge(DOWN, buff=0.45))
        self.add(status_text)

        self.wait(0.8)

        # ── 扫动 1：u 从 3f 缩短到 2f（等大实像高亮）──────
        u2f_hl = Text("u = 2f : 等大实像", font=CJK, color=YELLOW).scale(0.48)
        u2f_hl.to_edge(DOWN, buff=1.1)
        self.play(u_tracker.animate.set_value(2 * F), run_time=2.5, rate_func=smooth)
        self.play(FadeIn(u2f_hl))
        self.wait(1.2)
        self.play(FadeOut(u2f_hl))

        # ── 扫动 2：u 继续缩短到 1.1f（像飞远）──────────
        hl_inf = Text("u -> f : 像距趋于无穷大", font=CJK, color=RED).scale(0.46)
        hl_inf.to_edge(DOWN, buff=1.1)
        self.play(u_tracker.animate.set_value(1.1 * F), run_time=3.5, rate_func=smooth)
        self.play(FadeIn(hl_inf))
        self.wait(1.0)
        self.play(FadeOut(hl_inf))

        # ── 扫动 3：u < f（虚像模式）──────────────────────
        hl_virt = Text("u < f : 成放大虚像（正立，不可在屏上显示）",
                       font=CJK, color=PURPLE).scale(0.42)
        hl_virt.to_edge(DOWN, buff=1.1)
        self.play(u_tracker.animate.set_value(0.7 * F), run_time=2.0, rate_func=smooth)
        self.play(FadeIn(hl_virt))
        self.wait(1.4)
        self.play(FadeOut(hl_virt))

        # ── 扫动 4：恢复 u = 3f ───────────────────────────
        self.play(u_tracker.animate.set_value(3.0 * F), run_time=2.0, rate_func=smooth)
        self.wait(0.8)

        # 清场
        self.play(FadeOut(VGroup(panel_bg, dyn_panel, dyn_obj, dyn_obj_lbl,
                                 dyn_ray1, dyn_ray3, dyn_img, dyn_img_lbl,
                                 dyn_u_lbl, status_text,
                                 base_scene)))
        self.wait(0.4)

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 7 · 凸透镜 vs 凹透镜对比                       ║
        # ╚══════════════════════════════════════════════════════╝
        cmp_title = Text("凸透镜 vs 凹透镜", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(cmp_title))

        # 凸透镜（f > 0）示意图
        conv_axis = Line(LEFT * 4, RIGHT * 4, color=WHITE, stroke_width=1.2).shift(DOWN * 1.0 + LEFT * 2.0)
        conv_pts = lens_curve_points(height=1.8, bulge=0.3, n=40)
        conv_lens = Polygon(*conv_pts, color=CYAN, fill_color=CYAN,
                            fill_opacity=0.18, stroke_width=2).shift(DOWN * 1.0 + LEFT * 2.0)
        conv_f2 = Dot(np.array([-2.0 + F * 0.65, -1.0, 0]), color=YELLOW, radius=0.08)
        conv_f2_lbl = MathTex(r"F_2", color=YELLOW).scale(0.48).next_to(conv_f2, DOWN, buff=0.1)
        # 平行光射入 → 汇聚
        rays_conv = VGroup(
            Line(np.array([-5.5, -0.7, 0]), np.array([-2.0, -0.7, 0]), color=RED, stroke_width=2),
            Line(np.array([-5.5, -1.0, 0]), np.array([-2.0, -1.0, 0]), color=RED, stroke_width=2),
            Line(np.array([-5.5, -1.3, 0]), np.array([-2.0, -1.3, 0]), color=RED, stroke_width=2),
        )
        rays_conv_out = VGroup(
            Line(np.array([-2.0, -0.7, 0]), conv_f2.get_center(), color=RED, stroke_width=2),
            Line(np.array([-2.0, -1.0, 0]), conv_f2.get_center(), color=RED, stroke_width=2),
            Line(np.array([-2.0, -1.3, 0]), conv_f2.get_center(), color=RED, stroke_width=2),
        )
        conv_lbl = Text("凸透镜（f>0）：会聚光线，可成实像", font=CJK, color=CYAN).scale(0.42)
        conv_lbl.next_to(conv_axis, UP, buff=0.15).shift(LEFT * 2.0)

        # 凹透镜（f < 0）示意图
        div_axis = Line(LEFT * 4, RIGHT * 4, color=WHITE, stroke_width=1.2).shift(DOWN * 1.0 + RIGHT * 2.5)

        def concave_pts(height=1.8, indent=0.3, n=40):
            """凹透镜：中间比边缘薄。"""
            pts_r = []
            for i in range(n + 1):
                t = -1 + 2 * i / n
                y = t * height / 2
                x = -indent * (1 - t ** 2)  # 向内凹
                pts_r.append([x, y, 0])
            pts_l = [[-p[0], p[1], 0] for p in reversed(pts_r)]
            return pts_r + pts_l

        div_pts = concave_pts(height=1.8, indent=0.3, n=40)
        div_lens = Polygon(*div_pts, color=PURPLE, fill_color=PURPLE,
                           fill_opacity=0.18, stroke_width=2).shift(DOWN * 1.0 + RIGHT * 2.5)
        # 虚焦点
        div_f = Dot(np.array([2.5 - F * 0.65, -1.0, 0]), color=YELLOW, radius=0.08)
        div_f_lbl = MathTex(r"F", color=YELLOW).scale(0.48).next_to(div_f, DOWN, buff=0.1)
        div_f_dash = DashedLine(div_f.get_center() + LEFT * 0.5,
                                div_f.get_center() + RIGHT * 0.5,
                                color=YELLOW, stroke_width=1.5)
        # 平行光射入 → 发散（延长线过虚焦点）
        div_cx = 2.5
        f_pt = div_f.get_center()
        rays_div = VGroup(
            Line(np.array([div_cx - 3.5, -0.7, 0]), np.array([div_cx, -0.7, 0]), color=ORANGE, stroke_width=2),
            Line(np.array([div_cx - 3.5, -1.0, 0]), np.array([div_cx, -1.0, 0]), color=ORANGE, stroke_width=2),
            Line(np.array([div_cx - 3.5, -1.3, 0]), np.array([div_cx, -1.3, 0]), color=ORANGE, stroke_width=2),
        )

        def div_ray_out(y_in, cx, f_pt):
            """折射后发散方向（延长线交虚焦点）。"""
            dx = cx - f_pt[0]
            dy = y_in - f_pt[1]
            length = 2.5
            norm = math.sqrt(dx ** 2 + dy ** 2)
            return Line(np.array([cx, y_in, 0]),
                        np.array([cx + dx / norm * length, y_in + dy / norm * length, 0]),
                        color=ORANGE, stroke_width=2)

        rays_div_out = VGroup(
            div_ray_out(-0.7, div_cx, f_pt),
            div_ray_out(-1.0, div_cx, f_pt),
            div_ray_out(-1.3, div_cx, f_pt),
        )
        # 延长线（虚线）指向虚焦点
        rays_div_back = VGroup(
            DashedLine(np.array([div_cx, -0.7, 0]), f_pt, color=YELLOW, stroke_width=1.2),
            DashedLine(np.array([div_cx, -1.0, 0]), f_pt, color=YELLOW, stroke_width=1.2),
            DashedLine(np.array([div_cx, -1.3, 0]), f_pt, color=YELLOW, stroke_width=1.2),
        )
        div_lbl = Text("凹透镜（f<0）：发散光线，永远成缩小虚像", font=CJK, color=PURPLE).scale(0.42)
        div_lbl.next_to(div_axis, UP, buff=0.15).shift(RIGHT * 2.5)

        # 播放对比
        self.play(Create(conv_axis), Create(conv_lens),
                  Create(div_axis), Create(div_lens))
        self.play(FadeIn(conv_f2), FadeIn(conv_f2_lbl),
                  FadeIn(div_f), FadeIn(div_f_lbl), FadeIn(div_f_dash))
        self.play(Create(rays_conv), Create(rays_div))
        self.wait(0.6)
        self.play(Create(rays_conv_out), Create(rays_div_out), Create(rays_div_back))
        self.play(FadeIn(conv_lbl), FadeIn(div_lbl))
        self.wait(1.8)
        self.play(FadeOut(VGroup(conv_axis, conv_lens, conv_f2, conv_f2_lbl,
                                 rays_conv, rays_conv_out,
                                 div_axis, div_lens, div_f, div_f_lbl, div_f_dash,
                                 rays_div, rays_div_out, rays_div_back,
                                 conv_lbl, div_lbl, cmp_title)))
        self.wait(0.4)

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 8 · 数值例子                                    ║
        # ╚══════════════════════════════════════════════════════╝
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        ex_q = Text("凸透镜 f = 20 cm，物距 u = 30 cm，求像距和放大倍率？", font=CJK).scale(0.44)
        ex_q.next_to(ex_title, DOWN, buff=0.35)
        ex_step1 = MathTex(r"\frac{1}{v} = \frac{1}{f} - \frac{1}{u}"
                           r"= \frac{1}{20} - \frac{1}{30} = \frac{1}{60}").scale(0.75)
        ex_step1.next_to(ex_q, DOWN, buff=0.35)
        ex_step1.set_color(YELLOW)
        ex_step2 = MathTex(r"\Rightarrow v = 60\ \mathrm{cm}").scale(0.85)
        ex_step2.next_to(ex_step1, DOWN, buff=0.3)
        ex_step2.set_color(GREEN)
        ex_step3 = MathTex(r"m = -\frac{v}{u} = -\frac{60}{30} = -2").scale(0.85)
        ex_step3.next_to(ex_step2, DOWN, buff=0.3)
        ex_step3.set_color(ORANGE)
        ex_note = Text("放大率 |m|=2，倒立实像，像距大于物距", font=CJK, color=GREEN).scale(0.44)
        ex_note.next_to(ex_step3, DOWN, buff=0.3)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_q))
        self.wait(0.8)
        self.play(Write(ex_step1))
        self.wait(0.7)
        self.play(Write(ex_step2))
        self.wait(0.7)
        self.play(Write(ex_step3))
        self.play(FadeIn(ex_note))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_title, ex_q, ex_step1, ex_step2, ex_step3, ex_note)))
        self.wait(0.4)

        # ╔══════════════════════════════════════════════════════╗
        # ║  Step 9 · 小结卡                                      ║
        # ╚══════════════════════════════════════════════════════╝
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"\frac{1}{u}+\frac{1}{v}=\frac{1}{f}", color=YELLOW).scale(0.9)
        s2 = MathTex(r"m=-\frac{v}{u}", color=YELLOW).scale(0.9)
        s3 = VGroup(
            Text("三条特殊光线：平行轴→F2 ·  过F1→平行 ·  过光心不偏折",
                 font=CJK, color=GREEN).scale(0.40),
        )
        s4 = VGroup(
            Text("凸透镜 f>0：u>2f 倒立缩小实像；f<u<2f 倒立放大实像；u<f 正立放大虚像",
                 font=CJK, color=ORANGE).scale(0.36),
        )
        s5 = VGroup(
            Text("凹透镜 f<0：任何物距均成正立缩小虚像", font=CJK, color=PURPLE).scale(0.38),
        )
        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.35).next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp1ThinLensImagingFormula",
        "id": "phys-ch10-10.2-kp1-thin-lens-imaging-formula",
        "chapterId": "ch10",
        "sectionId": "10.2",
        "title": "薄透镜成像公式与三条特殊光线",
        "description": (
            "动画演示凸透镜三条特殊光线作图成像，"
            "ValueTracker 实时展示物距变化时像点位移、实虚像切换及像距公式 1/u+1/v=1/f 数值，"
            "末尾对比凸/凹透镜成像差异。"
        ),
    },
]
