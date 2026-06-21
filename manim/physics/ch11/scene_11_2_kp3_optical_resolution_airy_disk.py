"""第 11.2 节 · 圆孔衍射与瑞利判据（艾里斑 + 分辨本领）

可视化流程：
  1. 标题
  2. 生活类比（用望远镜能否分辨双星引入）
  3. 圆孔衍射装置示意图 + 艾里斑公式推导
  4. 三态对比：完全可分辨 → 恰好可分辨（瑞利判据）→ 不可分辨
  5. ValueTracker 改变孔径 D，演示艾里斑半径随 1/D 缩小
  6. 分辨本领公式 R = D/(1.22λ)
  7. 小结卡

铁律：MathTex 内仅 ASCII LaTeX；中文一律 Text(font=CJK)；
      顶部定义 CYAN 与 CJK；禁止 config.font / np.math / ThreeDScene。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 衍射强度分布 I(r) ∝ [2J1(x)/x]² （艾里图样近似用高斯包络替代，避免 scipy 依赖）
# 我们用多个同心椭圆 + 颜色渐变来绘制艾里斑视觉效果

def airy_intensity(r, r0):
    """Near-exact Airy pattern using sinc approximation for animation.
    r0 = radius of first dark ring (Airy disk radius)."""
    if r0 <= 0:
        return 1.0
    x = 1.2196698912 * math.pi * r / r0  # first zero of J1 at ~3.8317
    if abs(x) < 1e-9:
        return 1.0
    # Approximate with Gaussian for smoothness in animation
    return math.exp(-2.77 * (r / r0) ** 2)


def make_airy_disk(center, r0_screen, color_bright=YELLOW, n_rings=14):
    """Draw concentric filled circles simulating Airy intensity pattern.
    r0_screen: radius of first dark ring in Manim units."""
    circles = VGroup()
    for i in range(n_rings, 0, -1):
        r = r0_screen * i / n_rings
        intensity = airy_intensity(r, r0_screen)
        alpha = max(0.0, min(1.0, intensity))
        c = Circle(radius=r, fill_opacity=alpha * 0.92, stroke_opacity=0)
        c.set_fill(color_bright)
        c.move_to(center)
        circles.add(c)
    # Dark ring hint
    dark = Circle(radius=r0_screen, color=WHITE, stroke_width=1.2, stroke_opacity=0.5,
                  fill_opacity=0)
    dark.move_to(center)
    circles.add(dark)
    return circles


def make_airy_disk_tracker(center_func, r0_func, color_bright=YELLOW, n_rings=14):
    """always_redraw-compatible airy disk factory."""
    def _build():
        return make_airy_disk(center_func(), r0_func(), color_bright, n_rings)
    return always_redraw(_build)


class Ch11Kp3OpticalResolutionAiryDisk(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("圆孔衍射与瑞利判据", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第 11 章  波动光学 · 11.2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("夜晚仰望双星——肉眼看成一颗，", font=CJK).scale(0.46)
        ana2 = Text("换上大口径望远镜才能看出是两颗。", font=CJK).scale(0.46)
        ana3 = Text("决定这件事的，是圆孔衍射产生的「艾里斑」大小。", font=CJK, color=CYAN).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 圆孔衍射装置示意图 + 艾里斑公式
        # ══════════════════════════════════════════════════════════════════
        # 装置：平行光 → 圆形孔径 → 透镜 → 焦平面（艾里斑）
        scene_grp = VGroup()

        # 平行光（几条水平线）
        rays = VGroup(*[
            Line(LEFT * 5.5 + UP * (0.25 * k), LEFT * 3.2 + UP * (0.25 * k),
                 color=YELLOW, stroke_width=2)
            for k in range(-2, 3)
        ])
        scene_grp.add(rays)

        # 圆孔光阑
        aperture_top = Line(LEFT * 3.2 + UP * 0.5, LEFT * 3.2 + UP * 1.5, color=WHITE, stroke_width=4)
        aperture_bot = Line(LEFT * 3.2 + DOWN * 0.5, LEFT * 3.2 + DOWN * 1.5, color=WHITE, stroke_width=4)
        ap_label = Text("D", font=CJK, color=WHITE).scale(0.42).next_to(aperture_top, RIGHT, buff=0.08)
        scene_grp.add(aperture_top, aperture_bot, ap_label)

        # 折射光（会聚到焦点）
        lens_x = -1.2
        focal_x = 1.4
        conv_rays = VGroup(*[
            Line(LEFT * 3.2 + UP * (0.25 * k), np.array([focal_x, 0, 0]),
                 color=YELLOW, stroke_width=1.5)
            for k in range(-2, 3)
        ])
        scene_grp.add(conv_rays)

        # 透镜（椭圆轮廓）
        lens = Ellipse(width=0.25, height=2.2, color=BLUE, stroke_width=3).move_to([lens_x, 0, 0])
        lens_label = Text("焦距 f", font=CJK, color=BLUE).scale(0.38).next_to(lens, UP, buff=0.15)
        scene_grp.add(lens, lens_label)

        # 焦平面竖线
        focal_plane = DashedLine([focal_x, -1.6, 0], [focal_x, 1.6, 0], color=GREEN, stroke_width=1.5)
        focal_label = Text("焦平面", font=CJK, color=GREEN).scale(0.35).next_to(focal_plane, DOWN, buff=0.1)
        scene_grp.add(focal_plane, focal_label)

        # 艾里斑（右侧中央亮斑 + 次级环）
        airy_center = np.array([focal_x, 0, 0])
        airy_vis = make_airy_disk(airy_center, r0_screen=0.55, color_bright=YELLOW, n_rings=16)
        # 次级亮环（暗淡）
        ring2 = Circle(radius=0.95, color=YELLOW, stroke_width=1.2, stroke_opacity=0.35, fill_opacity=0)
        ring2.move_to(airy_center)
        scene_grp.add(airy_vis, ring2)

        # 艾里斑半径标注
        r_line = Line(airy_center, airy_center + RIGHT * 0.55, color=RED, stroke_width=2.5)
        r_label = MathTex(r"r", color=RED).scale(0.55).next_to(r_line, UP, buff=0.08)
        scene_grp.add(r_line, r_label)

        scene_grp.shift(DOWN * 0.35)
        self.play(Create(rays), run_time=0.8)
        self.play(FadeIn(aperture_top), FadeIn(aperture_bot), FadeIn(ap_label))
        self.play(Create(conv_rays), FadeIn(lens), FadeIn(lens_label), run_time=1.0)
        self.play(Create(focal_plane), FadeIn(focal_label))
        self.play(FadeIn(airy_vis), FadeIn(ring2))
        self.play(Create(r_line), FadeIn(r_label))
        self.wait(0.8)

        # 公式推导（逐步）
        eq1 = MathTex(r"\theta_R = 1.22\,\frac{\lambda}{D}", color=YELLOW).scale(0.82)
        eq1.to_edge(RIGHT, buff=0.5).shift(UP * 1.1)
        eq1_zh = VGroup(
            Text("最小分辨角（弧度）", font=CJK, color=WHITE).scale(0.36),
        ).next_to(eq1, DOWN, buff=0.18)

        eq2 = MathTex(r"r = 1.22\,\frac{f\lambda}{D}", color=GREEN).scale(0.82)
        eq2.next_to(eq1_zh, DOWN, buff=0.35)
        eq2_zh = Text("焦平面艾里斑半径", font=CJK, color=WHITE).scale(0.36)
        eq2_zh.next_to(eq2, DOWN, buff=0.18)

        self.play(Write(eq1))
        self.play(FadeIn(eq1_zh))
        self.wait(0.8)
        self.play(Write(eq2))
        self.play(FadeIn(eq2_zh))
        self.wait(1.5)

        # 高亮 λ/D 反比关系
        highlight_box = SurroundingRectangle(eq2, color=RED, buff=0.12, stroke_width=2.5)
        note = Text("孔径越大，斑越小！", font=CJK, color=RED).scale(0.38)
        note.next_to(highlight_box, DOWN, buff=0.18)
        self.play(Create(highlight_box), FadeIn(note))
        self.wait(1.4)

        fadeout1 = VGroup(scene_grp, eq1, eq1_zh, eq2, eq2_zh, highlight_box, note,
                          r_line, r_label)
        self.play(FadeOut(fadeout1))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 三态对比动画（A→B→C）
        # ══════════════════════════════════════════════════════════════════
        state_title = Text("两点光源的分辨情况", font=CJK, color=BLUE).scale(0.52)
        state_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(state_title))

        # 三列布局: 左=A(完全可分), 中=B(瑞利判据), 右=C(不可分)
        col_xs = [-3.8, 0.0, 3.8]
        row_y = -0.3
        r0_A = 0.55   # large separation
        r0_B = 0.55   # Rayleigh: separation = r0
        r0_C = 0.55   # overlapping

        sep_A = 1.8   # center-to-center
        sep_B = r0_B * 2.0  # Rayleigh: one max on other's first min → sep = r0
        sep_C = 0.45  # heavily overlapping

        # Labels
        lbl_A = Text("(A) 完全可分辨", font=CJK, color=GREEN).scale(0.38)
        lbl_B = Text("(B) 恰好可分辨", font=CJK, color=YELLOW).scale(0.38)
        lbl_C = Text("(C) 不可分辨", font=CJK, color=RED).scale(0.38)
        lbl_A.move_to([col_xs[0], row_y + 1.55, 0])
        lbl_B.move_to([col_xs[1], row_y + 1.55, 0])
        lbl_C.move_to([col_xs[2], row_y + 1.55, 0])

        # Build Airy disks for each column (2 sources each)
        def two_disks(col_x, sep, r0, c1=YELLOW, c2=CYAN):
            cx1 = np.array([col_x - sep / 2, row_y, 0])
            cx2 = np.array([col_x + sep / 2, row_y, 0])
            d1 = make_airy_disk(cx1, r0, color_bright=c1, n_rings=14)
            d2 = make_airy_disk(cx2, r0, color_bright=c2, n_rings=14)
            return VGroup(d1, d2)

        disks_A = two_disks(col_xs[0], sep_A, r0_A)
        disks_B = two_disks(col_xs[1], sep_B, r0_B)
        disks_C = two_disks(col_xs[2], sep_C, r0_C)

        # Dashed line for Rayleigh criterion in column B
        # Arrow showing "center of source 1 falls on 1st dark ring of source 2"
        c_B1 = np.array([col_xs[1] - sep_B / 2, row_y, 0])
        c_B2 = np.array([col_xs[1] + sep_B / 2, row_y, 0])
        rayleigh_line = DashedLine(c_B1, c_B2, color=RED, stroke_width=2.0)
        rayleigh_note = VGroup(
            Text("间距 = 艾里斑半径", font=CJK, color=RED).scale(0.32),
        ).next_to(rayleigh_line, DOWN, buff=0.08)

        # Animate: show A first, then B, then C
        self.play(FadeIn(lbl_A), FadeIn(disks_A))
        self.wait(1.2)
        self.play(FadeIn(lbl_B), FadeIn(disks_B))
        self.play(Create(rayleigh_line), FadeIn(rayleigh_note))
        self.wait(1.2)
        self.play(FadeIn(lbl_C), FadeIn(disks_C))
        self.wait(1.5)

        # Rayleigh criterion formula box
        rayleigh_eq = MathTex(
            r"\text{Rayleigh:}\quad \delta\theta_{\min} = 1.22\,\frac{\lambda}{D}",
            color=YELLOW
        ).scale(0.72)
        rayleigh_eq.to_edge(DOWN, buff=0.55)
        rayleigh_box = SurroundingRectangle(rayleigh_eq, color=YELLOW, buff=0.18, corner_radius=0.12)
        self.play(Write(rayleigh_eq), Create(rayleigh_box))
        self.wait(2.0)

        fadeout2 = VGroup(lbl_A, lbl_B, lbl_C, disks_A, disks_B, disks_C,
                          rayleigh_line, rayleigh_note, rayleigh_eq, rayleigh_box, state_title)
        self.play(FadeOut(fadeout2))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker — 孔径 D 变化演示
        # ══════════════════════════════════════════════════════════════════
        vt_title = Text("孔径 D 越大，艾里斑越小，分辨本领越强", font=CJK, color=BLUE).scale(0.50)
        vt_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vt_title))

        # Parameters: λ fixed, f fixed, D varies
        lam_val = 0.55e-6   # 550 nm
        f_val = 1.0         # normalized focal length
        D_tracker = ValueTracker(1.0)   # normalized D (1 = small aperture)

        # r0 in Manim units: r0 = 1.22 * f * lam / D  →  scale by display_scale
        display_scale = 2.5  # map physical r0 to screen units
        def get_r0():
            D = D_tracker.get_value()
            # r0_phys = 1.22 * f_val * lam_val / D  →  normalized to [0.2, 1.0]
            # D in [0.5, 3.0] maps r0_phys inversely → just use 1/D directly
            return display_scale / D

        center_pos = np.array([0.0, -0.5, 0])

        # Two-source Airy disk (fixed separation, varying r0)
        fixed_sep = 1.0  # fixed source separation in screen units
        c_left = center_pos + LEFT * fixed_sep / 2
        c_right = center_pos + RIGHT * fixed_sep / 2

        disk_left = make_airy_disk_tracker(lambda: c_left, get_r0, color_bright=YELLOW, n_rings=14)
        disk_right = make_airy_disk_tracker(lambda: c_right, get_r0, color_bright=CYAN, n_rings=14)

        # D value display
        d_display = always_redraw(lambda: VGroup(
            Text("孔径", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"D =", color=WHITE).scale(0.55),
            MathTex(
                r"{:.1f}".format(D_tracker.get_value()) + r"\,D_0",
                color=ORANGE
            ).scale(0.55),
        ).arrange(RIGHT, buff=0.15).to_edge(RIGHT, buff=0.6).shift(UP * 1.2))

        r0_display = always_redraw(lambda: VGroup(
            Text("艾里斑半径", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"r_0 \propto", color=WHITE).scale(0.55),
            MathTex(r"\frac{1}{D}", color=GREEN).scale(0.55),
        ).arrange(RIGHT, buff=0.15).to_edge(RIGHT, buff=0.6).shift(UP * 0.35))

        # Rayleigh line (fixed separation)
        sep_line = DashedLine(c_left, c_right, color=RED, stroke_width=1.5)
        sep_lbl = Text("固定角间距", font=CJK, color=RED).scale(0.33).next_to(sep_line, DOWN, buff=0.1)

        self.add(disk_left, disk_right)
        self.play(FadeIn(d_display), FadeIn(r0_display), Create(sep_line), FadeIn(sep_lbl))
        self.wait(0.8)

        # Small D → large blobs (unresolved)
        self.play(D_tracker.animate.set_value(0.5), run_time=2.0, rate_func=smooth)
        unresolved_note = Text("D 小  →  斑大  →  不可分辨", font=CJK, color=RED).scale(0.42)
        unresolved_note.to_edge(DOWN, buff=0.65)
        self.play(FadeIn(unresolved_note))
        self.wait(1.2)
        self.play(FadeOut(unresolved_note))

        # Large D → small blobs (resolved)
        self.play(D_tracker.animate.set_value(3.0), run_time=3.0, rate_func=smooth)
        resolved_note = Text("D 大  →  斑小  →  清晰分辨", font=CJK, color=GREEN).scale(0.42)
        resolved_note.to_edge(DOWN, buff=0.65)
        self.play(FadeIn(resolved_note))
        self.wait(1.5)
        self.play(FadeOut(resolved_note))

        # Return to D=1 (Rayleigh limit approximately)
        self.play(D_tracker.animate.set_value(1.0), run_time=2.0, rate_func=smooth)
        self.wait(0.8)

        self.play(FadeOut(VGroup(disk_left, disk_right, d_display, r0_display,
                                  sep_line, sep_lbl, vt_title)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 分辨本领公式 R
        # ══════════════════════════════════════════════════════════════════
        res_title = Text("分辨本领", font=CJK, color=BLUE).scale(0.54)
        res_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(res_title))

        # Step-by-step derivation
        eq_theta = MathTex(r"\theta_R = 1.22\,\frac{\lambda}{D}", color=YELLOW).scale(0.85)
        eq_theta.next_to(res_title, DOWN, buff=0.5)
        self.play(Write(eq_theta))
        self.wait(0.9)

        arrow1 = MathTex(r"\Downarrow", color=WHITE).scale(0.7).next_to(eq_theta, DOWN, buff=0.2)
        self.play(FadeIn(arrow1))

        eq_R = MathTex(r"R = \frac{1}{\theta_R} = \frac{D}{1.22\,\lambda}", color=GREEN).scale(0.85)
        eq_R.next_to(arrow1, DOWN, buff=0.2)
        self.play(Write(eq_R))
        self.wait(0.8)

        # Annotation
        r_zh1 = Text("R 越大，仪器分辨率越高", font=CJK, color=GREEN).scale(0.42)
        r_zh2 = Text("大口径 D 或短波长 λ 均可提升分辨本领", font=CJK, color=CYAN).scale(0.42)
        r_zh = VGroup(r_zh1, r_zh2).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        r_zh.next_to(eq_R, DOWN, buff=0.45)
        self.play(FadeIn(r_zh1))
        self.wait(0.6)
        self.play(FadeIn(r_zh2))
        self.wait(1.5)

        # Numerical example
        ex_title = Text("数值示例", font=CJK, color=ORANGE).scale(0.44)
        ex_title.next_to(r_zh, DOWN, buff=0.45)
        ex_line = VGroup(
            Text("望远镜：", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"D = 1\,\text{m},\;\lambda = 550\,\text{nm}", color=WHITE).scale(0.55),
        ).arrange(RIGHT, buff=0.15).next_to(ex_title, DOWN, buff=0.2)
        ex_ans = VGroup(
            MathTex(r"\theta_R = 1.22 \times \frac{550\times10^{-9}}{1}",
                    r"\approx 6.7\times10^{-7}\,\text{rad}", color=YELLOW).scale(0.58),
        ).next_to(ex_line, DOWN, buff=0.18)
        self.play(FadeIn(ex_title), FadeIn(ex_line))
        self.play(Write(ex_ans))
        self.wait(1.6)

        self.play(FadeOut(VGroup(res_title, eq_theta, arrow1, eq_R, r_zh,
                                  ex_title, ex_line, ex_ans)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56)
        sum_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(r"\theta_R = 1.22\,\dfrac{\lambda}{D}", color=YELLOW).scale(0.78)
        s1_zh = Text("最小分辨角（瑞利判据）", font=CJK, color=WHITE).scale(0.38)

        s2 = MathTex(r"r = 1.22\,\dfrac{f\lambda}{D}", color=GREEN).scale(0.78)
        s2_zh = Text("焦平面艾里斑半径", font=CJK, color=WHITE).scale(0.38)

        s3 = MathTex(r"R = \dfrac{D}{1.22\,\lambda}", color=CYAN).scale(0.78)
        s3_zh = Text("分辨本领（与 D 成正比，与 λ 成反比）", font=CJK, color=WHITE).scale(0.38)

        s4 = Text("孔径越大分辨率越高  |  波长越短分辨率越高", font=CJK, color=ORANGE).scale(0.40)

        rows = VGroup(
            VGroup(s1, s1_zh).arrange(RIGHT, buff=0.4),
            VGroup(s2, s2_zh).arrange(RIGHT, buff=0.4),
            VGroup(s3, s3_zh).arrange(RIGHT, buff=0.4),
            s4,
        ).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        rows.next_to(sum_title, DOWN, buff=0.45)
        rows.scale_to_fit_width(11.5)

        box = SurroundingRectangle(rows, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        self.play(Write(s1), FadeIn(s1_zh))
        self.wait(0.6)
        self.play(Write(s2), FadeIn(s2_zh))
        self.wait(0.6)
        self.play(Write(s3), FadeIn(s3_zh))
        self.wait(0.6)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, rows, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp3OpticalResolutionAiryDisk",
        "id": "phys-ch11-11.2-kp3-optical-resolution-airy-disk",
        "chapterId": "ch11",
        "sectionId": "11.2",
        "title": "圆孔衍射与瑞利判据",
        "description": "演示圆孔衍射产生的艾里斑图样，通过三态对比（可分/瑞利临界/不可分）和孔径 ValueTracker 动画，直观讲解光学分辨本领 R = D/(1.22λ)。",
    },
]
