"""第 10.3 节 · 近视、远视与散光的矫正原理（知识点 kp2）。

可视化方案：三栏并排（近视/远视/散光）× 未矫正 / 矫正后两层；
ValueTracker 控制屈光度实时移动焦点位置；柱面透镜演示散光矫正。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 全局布局常数 ────────────────────────────────────────────────────────────
EYE_COLOR      = "#88CCFF"
RETINA_COLOR   = GREEN
LENS_COLOR_NEG = ORANGE
LENS_COLOR_POS = YELLOW
RAY_COLOR      = CYAN
FOCAL_COLOR    = RED

def eye_shape(center, radius=0.55, color=EYE_COLOR):
    """简化眼球：略压扁的椭圆。"""
    ellipse = Ellipse(width=radius * 2, height=radius * 1.6, color=color,
                      fill_color=color, fill_opacity=0.18, stroke_width=2)
    ellipse.move_to(center)
    return ellipse

def retina_line(center, radius=0.55, color=RETINA_COLOR):
    """视网膜：眼球右侧弧线（用小线段近似）。"""
    pts = [center + np.array([radius * math.cos(a), radius * 0.8 * math.sin(a), 0])
           for a in np.linspace(-0.5, 0.5, 8)]
    line = VMobject(color=color, stroke_width=3)
    line.set_points_as_corners(pts)
    return line

def make_rays_to_focus(eye_left_x, eye_right_x, focus_x, y_center,
                       n_rays=3, color=RAY_COLOR):
    """平行光从左侧进入眼球，在 focus_x 处汇聚。"""
    rays = VGroup()
    offsets = np.linspace(-0.28, 0.28, n_rays)
    for dy in offsets:
        start = np.array([eye_left_x - 1.2, y_center + dy, 0])
        mid   = np.array([eye_left_x,        y_center + dy, 0])
        end   = np.array([focus_x,            y_center,       0])
        seg1 = Line(start, mid, color=color, stroke_width=1.6)
        seg2 = Line(mid,   end, color=color, stroke_width=1.6)
        rays.add(seg1, seg2)
    return rays

def make_lens_symbol(cx, cy, height=0.7, positive=True, color=YELLOW):
    """用两段弧线画凸/凹透镜符号。"""
    if positive:
        # 凸透镜：两段向外鼓的弧
        left_arc  = Arc(radius=0.55, start_angle=PI/2 + 0.6, angle=-PI*0.55,
                        color=color, stroke_width=2.5).move_arc_center_to(np.array([cx - 0.38, cy, 0]))
        right_arc = Arc(radius=0.55, start_angle=PI/2 - 0.6 + PI, angle=-PI*0.55,
                        color=color, stroke_width=2.5).move_arc_center_to(np.array([cx + 0.38, cy, 0]))
    else:
        # 凹透镜：两段向内凹的弧（用直线+弧近似）
        left_arc  = Arc(radius=0.55, start_angle=PI/2 + 0.6 + PI, angle=-PI*0.55,
                        color=color, stroke_width=2.5).move_arc_center_to(np.array([cx + 0.38, cy, 0]))
        right_arc = Arc(radius=0.55, start_angle=PI/2 - 0.6, angle=-PI*0.55,
                        color=color, stroke_width=2.5).move_arc_center_to(np.array([cx - 0.38, cy, 0]))
    top_line = Line(np.array([cx, cy + height / 2, 0]),
                    np.array([cx, cy - height / 2, 0]), color=color, stroke_width=1.5)
    return VGroup(left_arc, right_arc, top_line)


class Ch10Kp2AmetropiaCorrection(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("近视、远视与散光的矫正原理", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十章  几何光学 · 10.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("戴眼镜的本质：用透镜改变光线的会聚点，", font=CJK).scale(0.48)
        ana2 = Text("使其恰好落在视网膜上，而不是在它前面或后面。", font=CJK).scale(0.48)
        ana3 = Text("屈光度 D（焦度）衡量透镜的折光能力：焦距越短，度数越高。", font=CJK,
                    color=CYAN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3  基础公式定义（逐行）
        # ══════════════════════════════════════════════════════════════════
        def_label = Text("透镜焦度基本公式", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        f_def = MathTex(r"\Phi = \frac{1}{f}", color=YELLOW).scale(1.0)
        f_def.next_to(def_label, DOWN, buff=0.35)

        phi_myopia_lbl = Text("近视矫正（凹透镜）：", font=CJK, color=ORANGE).scale(0.44)
        phi_myopia = MathTex(r"\Phi_{\text{myopia}} = -\frac{1}{d_{\text{far point}}}", color=ORANGE).scale(0.82)
        row_m = VGroup(phi_myopia_lbl, phi_myopia).arrange(RIGHT, buff=0.18)

        phi_hyper_lbl = Text("远视矫正（凸透镜）：", font=CJK, color=GREEN).scale(0.44)
        phi_hyper = MathTex(r"\Phi_{\text{hyperopia}} = \frac{1}{0.25} - \frac{1}{d_{\text{near point}}}", color=GREEN).scale(0.82)
        row_h = VGroup(phi_hyper_lbl, phi_hyper).arrange(RIGHT, buff=0.18)

        formulas = VGroup(f_def, row_m, row_h).arrange(DOWN, buff=0.38).next_to(def_label, DOWN, buff=0.35)
        formulas.scale_to_fit_width(12.5)

        self.play(FadeIn(def_label))
        self.play(Write(f_def))
        self.wait(0.8)
        self.play(FadeIn(row_m))
        self.wait(0.8)
        self.play(FadeIn(row_h))
        self.wait(1.6)
        self.play(FadeOut(VGroup(def_label, formulas)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4  三栏图示布局
        # 每栏 x 中心：左 -4.5, 中 0, 右 4.5
        # 每栏 y 上层（未矫正）+1.3, 下层（矫正后）-1.3
        # ══════════════════════════════════════════════════════════════════
        COL_X   = [-4.4, 0.0, 4.4]
        ROW_Y   = [1.55, -1.1]
        EYE_R   = 0.48
        COL_W   = 2.8

        # 三栏标题
        col_titles = VGroup(
            Text("近视 Myopia",   font=CJK, color=ORANGE).scale(0.42),
            Text("远视 Hyperopia", font=CJK, color=GREEN).scale(0.42),
            Text("散光 Astigmatism", font=CJK, color=YELLOW).scale(0.42),
        )
        for i, ct in enumerate(col_titles):
            ct.move_to(np.array([COL_X[i], 3.0, 0]))

        row_labels = VGroup(
            Text("未矫正", font=CJK, color=RED).scale(0.38),
            Text("矫正后", font=CJK, color=GREEN).scale(0.38),
        )
        row_labels[0].move_to(np.array([-6.8, ROW_Y[0], 0]))
        row_labels[1].move_to(np.array([-6.8, ROW_Y[1], 0]))

        # 分隔线
        h_sep = DashedLine(np.array([-7.1, 0.25, 0]), np.array([7.1, 0.25, 0]),
                           color=WHITE, stroke_width=0.8, dash_length=0.12)
        v_sep1 = DashedLine(np.array([-2.2, 3.3, 0]), np.array([-2.2, -2.9, 0]),
                            color=WHITE, stroke_width=0.8, dash_length=0.12)
        v_sep2 = DashedLine(np.array([2.2, 3.3, 0]),  np.array([2.2, -2.9, 0]),
                            color=WHITE, stroke_width=0.8, dash_length=0.12)

        self.play(
            FadeIn(col_titles), FadeIn(row_labels),
            Create(h_sep), Create(v_sep1), Create(v_sep2),
        )
        self.wait(0.6)

        # ── 近视 · 未矫正 ───────────────────────────────────────────────
        cx_m, cy_unc = COL_X[0], ROW_Y[0]
        eye_m_unc = eye_shape(np.array([cx_m, cy_unc, 0]), EYE_R, EYE_COLOR)
        ret_m_unc = retina_line(np.array([cx_m, cy_unc, 0]), EYE_R, RETINA_COLOR)
        # 焦点在视网膜前
        focus_m_unc = Dot(np.array([cx_m - 0.15, cy_unc, 0]), radius=0.07, color=FOCAL_COLOR)
        rays_m_unc  = make_rays_to_focus(cx_m - EYE_R, cx_m + EYE_R,
                                          cx_m - 0.15, cy_unc, color=RAY_COLOR)
        focus_m_label = Text("焦点偏前", font=CJK, color=RED).scale(0.32)
        focus_m_label.next_to(focus_m_unc, DOWN, buff=0.08)

        # ── 近视 · 矫正后 ───────────────────────────────────────────────
        cx_m, cy_cor = COL_X[0], ROW_Y[1]
        eye_m_cor = eye_shape(np.array([cx_m, cy_cor, 0]), EYE_R, EYE_COLOR)
        ret_m_cor = retina_line(np.array([cx_m, cy_cor, 0]), EYE_R, RETINA_COLOR)
        # 凹透镜在眼前
        lens_neg = make_lens_symbol(cx_m - EYE_R - 0.55, cy_cor,
                                    height=0.6, positive=False, color=ORANGE)
        focus_m_cor = Dot(np.array([cx_m + EYE_R - 0.08, cy_cor, 0]),
                          radius=0.09, color=GREEN)
        # 凹透镜使光线先发散
        rays_div = VGroup()
        for dy in [-0.22, 0, 0.22]:
            start = np.array([cx_m - EYE_R - 1.3, cy_cor + dy, 0])
            mid1  = np.array([cx_m - EYE_R - 0.55, cy_cor + dy * 0.85, 0])
            mid2  = np.array([cx_m - EYE_R, cy_cor + dy * 1.35, 0])
            end   = np.array([cx_m + EYE_R - 0.08, cy_cor, 0])
            rays_div.add(
                Line(start, mid1,  color=ORANGE, stroke_width=1.5),
                Line(mid1,  mid2,  color=ORANGE, stroke_width=1.5),
                Line(mid2,  end,   color=CYAN,   stroke_width=1.5),
            )
        on_ret_m = Text("落在视网膜", font=CJK, color=GREEN).scale(0.32)
        on_ret_m.next_to(focus_m_cor, DOWN, buff=0.08)

        phi_m_formula = VGroup(
            Text("凹透镜  ", font=CJK, color=ORANGE).scale(0.34),
            MathTex(r"\Phi = -\frac{1}{d_{\rm far}}", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.08)
        phi_m_formula.move_to(np.array([cx_m, cy_cor - 1.05, 0]))

        # ── 远视 · 未矫正 ───────────────────────────────────────────────
        cx_h, cy_unc2 = COL_X[1], ROW_Y[0]
        eye_h_unc = eye_shape(np.array([cx_h, cy_unc2, 0]), EYE_R, EYE_COLOR)
        ret_h_unc = retina_line(np.array([cx_h, cy_unc2, 0]), EYE_R, RETINA_COLOR)
        # 焦点在视网膜后
        focus_h_unc = Dot(np.array([cx_h + EYE_R + 0.25, cy_unc2, 0]),
                          radius=0.07, color=FOCAL_COLOR)
        rays_h_unc  = make_rays_to_focus(cx_h - EYE_R, cx_h + EYE_R + 0.25,
                                          cx_h + EYE_R + 0.25, cy_unc2, color=RAY_COLOR)
        focus_h_label = Text("焦点偏后", font=CJK, color=RED).scale(0.32)
        focus_h_label.next_to(focus_h_unc, DOWN, buff=0.08)

        # ── 远视 · 矫正后 ───────────────────────────────────────────────
        cx_h, cy_cor2 = COL_X[1], ROW_Y[1]
        eye_h_cor = eye_shape(np.array([cx_h, cy_cor2, 0]), EYE_R, EYE_COLOR)
        ret_h_cor = retina_line(np.array([cx_h, cy_cor2, 0]), EYE_R, RETINA_COLOR)
        lens_pos  = make_lens_symbol(cx_h - EYE_R - 0.55, cy_cor2,
                                     height=0.6, positive=True, color=YELLOW)
        focus_h_cor = Dot(np.array([cx_h + EYE_R - 0.08, cy_cor2, 0]),
                          radius=0.09, color=GREEN)
        rays_conv = VGroup()
        for dy in [-0.22, 0, 0.22]:
            start = np.array([cx_h - EYE_R - 1.3, cy_cor2 + dy, 0])
            mid1  = np.array([cx_h - EYE_R - 0.55, cy_cor2 + dy * 0.7, 0])
            mid2  = np.array([cx_h - EYE_R, cy_cor2 + dy * 0.4, 0])
            end   = np.array([cx_h + EYE_R - 0.08, cy_cor2, 0])
            rays_conv.add(
                Line(start, mid1, color=YELLOW, stroke_width=1.5),
                Line(mid1,  mid2, color=YELLOW, stroke_width=1.5),
                Line(mid2,  end,  color=CYAN,   stroke_width=1.5),
            )
        on_ret_h = Text("落在视网膜", font=CJK, color=GREEN).scale(0.32)
        on_ret_h.next_to(focus_h_cor, DOWN, buff=0.08)

        phi_h_formula = VGroup(
            Text("凸透镜  ", font=CJK, color=YELLOW).scale(0.34),
            MathTex(r"\Phi = \frac{1}{0.25} - \frac{1}{d_{\rm near}}", color=YELLOW).scale(0.55),
        ).arrange(RIGHT, buff=0.08)
        phi_h_formula.move_to(np.array([cx_h, cy_cor2 - 1.05, 0]))

        # ── 散光 · 未矫正 ───────────────────────────────────────────────
        cx_a, cy_unc3 = COL_X[2], ROW_Y[0]
        # 椭圆角膜截面（水平/竖直曲率不同）
        cornea_h = Ellipse(width=0.85, height=0.55, color=CYAN,
                            stroke_width=2.5, fill_opacity=0)
        cornea_h.move_to(np.array([cx_a - EYE_R - 0.45, cy_unc3, 0]))
        cornea_v = Ellipse(width=0.55, height=0.85, color=ORANGE,
                            stroke_width=2.5, fill_opacity=0)
        cornea_v.move_to(np.array([cx_a - EYE_R - 0.45, cy_unc3, 0]))

        eye_a_unc = eye_shape(np.array([cx_a, cy_unc3, 0]), EYE_R, EYE_COLOR)
        ret_a_unc = retina_line(np.array([cx_a, cy_unc3, 0]), EYE_R, RETINA_COLOR)

        # 两个焦点（焦线）：水平和竖直方向焦距不同
        focus_ah1 = Dot(np.array([cx_a + EYE_R * 0.3, cy_unc3, 0]),
                        radius=0.06, color=CYAN)
        focus_ah2 = Dot(np.array([cx_a + EYE_R * 0.65, cy_unc3, 0]),
                        radius=0.06, color=ORANGE)
        focal_line_h = DashedLine(
            np.array([cx_a + EYE_R * 0.3, cy_unc3 - 0.2, 0]),
            np.array([cx_a + EYE_R * 0.3, cy_unc3 + 0.2, 0]),
            color=CYAN, stroke_width=2,
        )
        focal_line_v = DashedLine(
            np.array([cx_a + EYE_R * 0.65, cy_unc3 - 0.2, 0]),
            np.array([cx_a + EYE_R * 0.65, cy_unc3 + 0.2, 0]),
            color=ORANGE, stroke_width=2,
        )
        astig_lbl1 = Text("焦线1", font=CJK, color=CYAN).scale(0.30)
        astig_lbl1.next_to(focal_line_h, DOWN, buff=0.06)
        astig_lbl2 = Text("焦线2", font=CJK, color=ORANGE).scale(0.30)
        astig_lbl2.next_to(focal_line_v, DOWN, buff=0.06)

        cornea_lbl_h = Text("H曲率大", font=CJK, color=CYAN).scale(0.28)
        cornea_lbl_h.next_to(cornea_h, DOWN, buff=0.04)
        cornea_lbl_v = Text("V曲率小", font=CJK, color=ORANGE).scale(0.28)
        cornea_lbl_v.next_to(cornea_h, UP, buff=0.04)

        # ── 散光 · 矫正后 ───────────────────────────────────────────────
        cx_a, cy_cor3 = COL_X[2], ROW_Y[1]
        eye_a_cor = eye_shape(np.array([cx_a, cy_cor3, 0]), EYE_R, EYE_COLOR)
        ret_a_cor = retina_line(np.array([cx_a, cy_cor3, 0]), EYE_R, RETINA_COLOR)

        # 柱面透镜：只在一个方向有光焦度（用矩形+线表示）
        cyl_lens = VGroup(
            Line(np.array([cx_a - EYE_R - 0.9, cy_cor3 - 0.35, 0]),
                 np.array([cx_a - EYE_R - 0.9, cy_cor3 + 0.35, 0]),
                 color=YELLOW, stroke_width=3),
            Line(np.array([cx_a - EYE_R - 0.55, cy_cor3 - 0.35, 0]),
                 np.array([cx_a - EYE_R - 0.55, cy_cor3 + 0.35, 0]),
                 color=YELLOW, stroke_width=3),
            # 水平轴表示柱面方向
            DashedLine(np.array([cx_a - EYE_R - 1.0, cy_cor3, 0]),
                       np.array([cx_a - EYE_R - 0.45, cy_cor3, 0]),
                       color=ORANGE, stroke_width=1.5),
        )
        focus_a_cor = Dot(np.array([cx_a + EYE_R - 0.08, cy_cor3, 0]),
                          radius=0.09, color=GREEN)
        rays_a_cor = VGroup()
        for dy in [-0.20, 0, 0.20]:
            start = np.array([cx_a - EYE_R - 1.3, cy_cor3 + dy, 0])
            mid   = np.array([cx_a - EYE_R,        cy_cor3 + dy * 0.5, 0])
            end   = np.array([cx_a + EYE_R - 0.08, cy_cor3, 0])
            rays_a_cor.add(
                Line(start, mid, color=YELLOW, stroke_width=1.5),
                Line(mid,   end, color=CYAN,   stroke_width=1.5),
            )
        on_ret_a = Text("单一焦点", font=CJK, color=GREEN).scale(0.32)
        on_ret_a.next_to(focus_a_cor, DOWN, buff=0.08)

        phi_a_formula = VGroup(
            Text("柱面镜  ", font=CJK, color=YELLOW).scale(0.34),
            MathTex(r"\Phi_{\rm cyl} = \frac{1}{f_{\rm cyl}}", color=YELLOW).scale(0.55),
        ).arrange(RIGHT, buff=0.08)
        phi_a_formula.move_to(np.array([cx_a, cy_cor3 - 1.05, 0]))

        # ── 全部一次性展示三栏图形 ───────────────────────────────────────
        # 未矫正行（上）
        uncorrected = VGroup(
            eye_m_unc, ret_m_unc, focus_m_unc, rays_m_unc, focus_m_label,
            eye_h_unc, ret_h_unc, focus_h_unc, rays_h_unc, focus_h_label,
            eye_a_unc, ret_a_unc, cornea_h, cornea_v,
            focus_ah1, focus_ah2, focal_line_h, focal_line_v,
            astig_lbl1, astig_lbl2, cornea_lbl_h, cornea_lbl_v,
        )
        self.play(FadeIn(uncorrected))
        self.wait(1.4)

        # 矫正后行（下）
        corrected = VGroup(
            eye_m_cor, ret_m_cor, lens_neg, rays_div, focus_m_cor, on_ret_m,
            eye_h_cor, ret_h_cor, lens_pos, rays_conv, focus_h_cor, on_ret_h,
            eye_a_cor, ret_a_cor, cyl_lens, rays_a_cor, focus_a_cor, on_ret_a,
        )
        self.play(FadeIn(corrected))
        self.wait(1.0)

        # 公式标注
        phi_formulas = VGroup(phi_m_formula, phi_h_formula, phi_a_formula)
        self.play(FadeIn(phi_formulas))
        self.wait(1.6)

        # ══════════════════════════════════════════════════════════════════
        # Step 5  ValueTracker：屈光度滑动 → 焦点移动
        # ══════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(uncorrected), FadeOut(corrected), FadeOut(phi_formulas),
            FadeOut(col_titles), FadeOut(row_labels),
            FadeOut(h_sep), FadeOut(v_sep1), FadeOut(v_sep2),
        )
        self.wait(0.5)

        phi_tracker = ValueTracker(-3.0)   # 单位 D，负=近视，正=远视

        dyn_title = Text("屈光度变化与焦点移动（ValueTracker 演示）",
                         font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.45)

        # 眼球（固定）
        eye_cx, eye_cy = 1.5, -0.3
        eye_dyn = eye_shape(np.array([eye_cx, eye_cy, 0]), 0.60, EYE_COLOR)
        ret_dyn = retina_line(np.array([eye_cx, eye_cy, 0]), 0.60, RETINA_COLOR)
        ret_pos_x = eye_cx + 0.60 - 0.05   # 视网膜大约位置

        # 坐标轴：x 轴表示光轴
        ax_line = Arrow(
            np.array([-1.0, eye_cy, 0]), np.array([3.5, eye_cy, 0]),
            color=WHITE, stroke_width=1.5, buff=0,
            max_tip_length_to_length_ratio=0.05,
        )
        ax_lbl = Text("光轴", font=CJK, color=WHITE).scale(0.38).next_to(ax_line.get_end(), RIGHT, buff=0.1)

        # 视网膜参考线
        ret_ref = DashedLine(
            np.array([ret_pos_x, eye_cy - 0.8, 0]),
            np.array([ret_pos_x, eye_cy + 0.8, 0]),
            color=GREEN, stroke_width=1.5,
        )
        ret_lbl = Text("视网膜", font=CJK, color=GREEN).scale(0.35)
        ret_lbl.next_to(ret_ref, UP, buff=0.1)

        # 动态透镜 + 焦点
        def get_focus_x():
            phi = phi_tracker.get_value()      # 屈光度 D
            # 矫正透镜将远点/近点映射到标准距离
            # 简化：焦点偏移量正比于 phi
            # phi=-10D：焦点比视网膜前 0.7；phi=0：恰好在视网膜；phi=+10D：后 0.7
            offset = phi * 0.07
            return ret_pos_x - offset          # phi<0 → 焦点在视网膜左（前），phi>0 → 右（后）

        def get_lens_color():
            phi = phi_tracker.get_value()
            if phi < -0.5:
                return ORANGE
            elif phi > 0.5:
                return YELLOW
            else:
                return GREEN

        dynamic_lens = always_redraw(lambda: make_lens_symbol(
            eye_cx - 0.60 - 0.55, eye_cy,
            height=0.65,
            positive=(phi_tracker.get_value() > 0),
            color=get_lens_color(),
        ))

        dynamic_focus = always_redraw(lambda: Dot(
            np.array([get_focus_x(), eye_cy, 0]),
            radius=0.10,
            color=(GREEN if abs(get_focus_x() - ret_pos_x) < 0.05 else FOCAL_COLOR),
        ))

        dynamic_phi_label = always_redraw(lambda: VGroup(
            Text("屈光度  ", font=CJK, color=CYAN).scale(0.45),
            MathTex(rf"\Phi = {phi_tracker.get_value():.1f}\,\mathrm{{D}}", color=CYAN).scale(0.72),
        ).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.55))

        # 焦点到视网膜的偏移指示线
        dynamic_offset_line = always_redraw(lambda: DashedLine(
            np.array([get_focus_x(), eye_cy, 0]),
            np.array([ret_pos_x, eye_cy, 0]),
            color=RED if abs(get_focus_x() - ret_pos_x) > 0.05 else GREEN,
            stroke_width=2,
        ) if abs(get_focus_x() - ret_pos_x) > 0.02 else VGroup())

        dynamic_state_label = always_redraw(lambda: Text(
            "近视（焦点偏前）" if phi_tracker.get_value() < -0.5
            else ("远视（焦点偏后）" if phi_tracker.get_value() > 0.5
                  else "正视（焦点在视网膜）"),
            font=CJK,
            color=(ORANGE if phi_tracker.get_value() < -0.5
                   else (YELLOW if phi_tracker.get_value() > 0.5 else GREEN)),
        ).scale(0.46).next_to(eye_dyn, DOWN, buff=0.8))

        # 近视时的平行光射线（动态）
        dynamic_rays = always_redraw(lambda: make_rays_to_focus(
            eye_cx - 0.60, eye_cx + 0.60,
            get_focus_x(), eye_cy, n_rays=3,
            color=CYAN,
        ))

        self.play(FadeIn(dyn_title))
        self.play(
            Create(eye_dyn), FadeIn(ret_dyn),
            Create(ax_line), FadeIn(ax_lbl),
            Create(ret_ref), FadeIn(ret_lbl),
        )
        self.add(dynamic_lens, dynamic_focus, dynamic_phi_label,
                 dynamic_offset_line, dynamic_state_label, dynamic_rays)
        self.wait(0.8)

        # 从近视扫到正视再到远视
        self.play(phi_tracker.animate.set_value(0.0), run_time=2.5, rate_func=linear)
        self.wait(0.5)
        self.play(phi_tracker.animate.set_value(5.0), run_time=2.0, rate_func=linear)
        self.wait(0.6)
        self.play(phi_tracker.animate.set_value(-6.0), run_time=3.0, rate_func=linear)
        self.wait(0.6)
        self.play(phi_tracker.animate.set_value(0.0), run_time=2.0, rate_func=linear)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            dyn_title, eye_dyn, ret_dyn, ax_line, ax_lbl,
            ret_ref, ret_lbl,
            dynamic_lens, dynamic_focus, dynamic_phi_label,
            dynamic_offset_line, dynamic_state_label, dynamic_rays,
        )))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 6  数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_t = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        ex1_lbl = Text("例1  近视眼远点 d = 0.25 m，所需矫正焦度：", font=CJK).scale(0.44)
        ex1_calc = MathTex(r"\Phi_{\rm myopia} = -\frac{1}{0.25} = -4\,\mathrm{D}",
                           color=ORANGE).scale(0.82)
        ex2_lbl = Text("例2  远视眼近点 d = 1.0 m，所需矫正焦度：", font=CJK).scale(0.44)
        ex2_calc = MathTex(r"\Phi_{\rm hyperopia} = \frac{1}{0.25} - \frac{1}{1.0} = 4 - 1 = +3\,\mathrm{D}",
                           color=GREEN).scale(0.82)
        ex3_lbl = Text("例3  散光仅竖直方向需矫正 f = 0.5 m：", font=CJK).scale(0.44)
        ex3_calc = MathTex(r"\Phi_{\rm cyl} = \frac{1}{0.5} = +2\,\mathrm{D}",
                           color=YELLOW).scale(0.82)

        ex_group = VGroup(ex1_lbl, ex1_calc, ex2_lbl, ex2_calc, ex3_lbl, ex3_calc)
        ex_group.arrange(DOWN, buff=0.28, aligned_edge=LEFT).next_to(ex_t, DOWN, buff=0.35)
        ex_group.scale_to_fit_width(13.0)

        self.play(FadeIn(ex_t))
        self.play(FadeIn(ex1_lbl))
        self.play(Write(ex1_calc))
        self.wait(0.8)
        self.play(FadeIn(ex2_lbl))
        self.play(Write(ex2_calc))
        self.wait(0.8)
        self.play(FadeIn(ex3_lbl))
        self.play(Write(ex3_calc))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_t, ex_group)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7  小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.42)

        s_phi = MathTex(r"\Phi = \frac{1}{f}", color=YELLOW).scale(0.85)
        s_myopia = VGroup(
            Text("近视  凹透镜  ", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\Phi = -\dfrac{1}{d_{\rm far}}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        s_hyper = VGroup(
            Text("远视  凸透镜  ", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\Phi = \dfrac{1}{0.25} - \dfrac{1}{d_{\rm near}}", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        s_astig = Text("散光  柱面透镜  只矫正一个方向的焦距差异",
                       font=CJK, color=YELLOW).scale(0.42)

        summary_items = VGroup(s_phi, s_myopia, s_hyper, s_astig).arrange(DOWN, buff=0.38)
        summary_items.next_to(s_title, DOWN, buff=0.35)
        summary_items.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_items, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s_phi))
        self.wait(0.5)
        self.play(FadeIn(s_myopia))
        self.wait(0.5)
        self.play(FadeIn(s_hyper))
        self.wait(0.5)
        self.play(FadeIn(s_astig))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary_items, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp2AmetropiaCorrection",
        "id": "phys-ch10-10.3-kp2-ametropia-correction",
        "chapterId": "ch10",
        "sectionId": "10.3",
        "title": "近视、远视与散光的矫正原理",
        "description": "三栏并排图示近视/远视/散光的未矫正与矫正状态，ValueTracker 扫动屈光度让焦点实时移动，配公式 Phi=-1/d_far、Phi=1/0.25-1/d_near 推导及数值例题。",
    },
]
