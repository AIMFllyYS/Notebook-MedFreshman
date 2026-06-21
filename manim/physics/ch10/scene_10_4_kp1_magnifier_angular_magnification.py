"""第 10.4 节 · 放大镜角放大率（矢量光路 + ValueTracker 扫动焦距）。

物理动画范式：绘制裸眼 vs 放大镜对比光路，用 ValueTracker 改变焦距实时演示
角放大率 α = 25/f 的几何来源，建立「焦距越短，角放大率越大」的直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 光学常数 ────────────────────────────────────────────────────────────────
D = 25.0          # 明视距离 (cm)，用于角放大率公式
LENS_X = 0.0      # 透镜 x 坐标（场景坐标单位）
SCALE = 0.12      # 1 cm → 0.12 scene units
H_OBJ = 0.6       # 物体高度（场景单位）


# ══════════════════════════════════════════════════════════════════════════════
#  辅助：绘制凸透镜符号
# ══════════════════════════════════════════════════════════════════════════════
def make_lens(cx=0.0, cy=0.0, half_h=1.0, color=WHITE):
    """用两段圆弧近似凸透镜轮廓，返回 VGroup。"""
    # 简化：用两条折线模拟双凸透镜轮廓
    top = np.array([cx, cy + half_h, 0])
    bot = np.array([cx, cy - half_h, 0])
    # 左弧控制点
    ctrl_l = np.array([cx - 0.32, cy, 0])
    # 右弧控制点
    ctrl_r = np.array([cx + 0.32, cy, 0])

    left_arc = CubicBezier(top, ctrl_l, ctrl_l, bot).set_color(color).set_stroke(width=2.5)
    right_arc = CubicBezier(top, ctrl_r, ctrl_r, bot).set_color(color).set_stroke(width=2.5)
    axis = DashedLine(np.array([cx - 2.5, cy, 0]), np.array([cx + 3.5, cy, 0]),
                      color=GRAY, stroke_width=1, dash_length=0.15)
    return VGroup(left_arc, right_arc, axis)


# ══════════════════════════════════════════════════════════════════════════════
#  主场景
# ══════════════════════════════════════════════════════════════════════════════
class Ch10Kp1MagnifierAngularMagnification(Scene):
    def construct(self):

        # ╔══ Step 1: 标题 ═════════════════════════════════════════════════╗
        title = Text("放大镜角放大率", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.4", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ╔══ Step 2: 生活类比 ═════════════════════════════════════════════╗
        ana1 = Text("为什么用放大镜看小字，字会变大？", font=CJK).scale(0.5)
        ana2 = Text("关键不在于像有多大，而在于像对眼睛张开的角度有多大——", font=CJK).scale(0.47)
        ana3 = Text("视角越大，感觉物体越大。放大镜的作用就是增大视角。", font=CJK, color=GREEN).scale(0.47)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ╔══ Step 3: 左右对比场景 — 裸眼 vs 放大镜（静态建立） ════════════╗
        # 分隔线
        divider = DashedLine(
            start=np.array([0, -3.5, 0]),
            end=np.array([0, 2.8, 0]),
            color=GRAY, stroke_width=1.5, dash_length=0.2
        )
        label_naked = Text("裸眼", font=CJK, color=ORANGE).scale(0.48).move_to(np.array([-3.2, 2.5, 0]))
        label_mag   = Text("放大镜", font=CJK, color=CYAN).scale(0.48).move_to(np.array([3.2, 2.5, 0]))
        self.play(Create(divider), FadeIn(label_naked), FadeIn(label_mag))
        self.wait(0.5)

        # ── 左侧：裸眼场景 ──────────────────────────────────────────────────
        # 明视距离 25 cm → 场景中 25*SCALE = 3.0 units
        eye_L = np.array([-5.5, -0.5, 0])         # 眼睛节点位置
        obj_L_base = np.array([-5.5 + 3.0, -0.5, 0])  # 物底端（明视距离处）
        obj_L_tip  = np.array([-5.5 + 3.0, -0.5 + H_OBJ, 0])  # 物顶端

        # 眼睛
        eye_dot_L = Dot(eye_L, color=ORANGE, radius=0.12)
        eye_label_L = Text("眼", font=CJK, color=ORANGE).scale(0.38).next_to(eye_dot_L, DOWN, buff=0.12)

        # 物体（竖直箭头）
        obj_arrow_L = Arrow(obj_L_base, obj_L_tip, buff=0, color=GREEN,
                            stroke_width=3, max_tip_length_to_length_ratio=0.25)
        obj_label_L = VGroup(
            Text("h", font=CJK, color=GREEN).scale(0.38)
        ).next_to(obj_arrow_L, RIGHT, buff=0.08)

        # 明视距离标注
        dist_brace_L = Brace(Line(eye_L, obj_L_base), direction=DOWN, color=WHITE)
        dist_label_L = VGroup(
            MathTex(r"25\,\mathrm{cm}", color=WHITE).scale(0.5)
        ).next_to(dist_brace_L, DOWN, buff=0.1)

        # 视角线（从眼到物顶端）
        angle_line_L1 = Line(eye_L, obj_L_base, color=ORANGE, stroke_width=1.5)
        angle_line_L2 = Line(eye_L, obj_L_tip,  color=ORANGE, stroke_width=1.5)

        # 弧标注 θ₀
        theta0_arc = Arc(
            radius=0.5, start_angle=0,
            angle=math.atan2(H_OBJ, 3.0),
            arc_center=eye_L, color=YELLOW
        )
        theta0_label = MathTex(r"\theta_0", color=YELLOW).scale(0.55)
        theta0_label.move_to(eye_L + np.array([0.8, 0.22, 0]))

        # tan θ₀ 公式
        tan0_formula = VGroup(
            MathTex(r"\tan\theta_0 = \frac{h}{25}", color=YELLOW).scale(0.55)
        ).move_to(np.array([-3.8, -2.2, 0]))

        self.play(
            Create(eye_dot_L), FadeIn(eye_label_L),
            Create(obj_arrow_L), FadeIn(obj_label_L)
        )
        self.wait(0.5)
        self.play(Create(angle_line_L1), Create(angle_line_L2))
        self.play(Create(theta0_arc), FadeIn(theta0_label))
        self.play(FadeIn(dist_brace_L), FadeIn(dist_label_L))
        self.play(Write(tan0_formula))
        self.wait(1.2)

        # ── 右侧：放大镜场景（静态，稍后 ValueTracker 接管） ──────────────
        # 初始焦距 f0 = 10 cm → 1.2 units
        f_init = 10.0  # cm

        # 透镜位置（右侧画面中央）
        lens_cx = 2.5
        lens = make_lens(cx=lens_cx, cy=-0.5, half_h=1.1, color=CYAN)

        # 眼睛（透镜右侧）
        eye_R = np.array([lens_cx + 2.2, -0.5, 0])
        eye_dot_R = Dot(eye_R, color=ORANGE, radius=0.12)
        eye_label_R = Text("眼", font=CJK, color=ORANGE).scale(0.38).next_to(eye_dot_R, DOWN, buff=0.12)

        self.play(Create(lens), Create(eye_dot_R), FadeIn(eye_label_R))
        self.wait(0.5)

        # ── 右侧动态部分：ValueTracker 控制焦距 ──────────────────────────
        f_tracker = ValueTracker(f_init)

        def get_f_scene():
            """焦距 cm → 场景单位。"""
            return f_tracker.get_value() * SCALE

        def get_obj_R():
            """物的顶端位置（u = 0.8f，位于焦距内左侧）。"""
            f_s = get_f_scene()
            u_s = 0.8 * f_s          # 物距（场景单位），在焦距内
            obj_x = lens_cx - u_s
            obj_base = np.array([obj_x, -0.5, 0])
            obj_tip  = np.array([obj_x, -0.5 + H_OBJ, 0])
            return obj_base, obj_tip

        def get_focus_R():
            """右焦点位置（F2）。"""
            return np.array([lens_cx + get_f_scene(), -0.5, 0])

        def get_focus_L():
            """左焦点位置（F1）。"""
            return np.array([lens_cx - get_f_scene(), -0.5, 0])

        def get_virtual_image():
            """
            虚像位置：凸透镜成正立放大虚像。
            透镜公式 1/v - 1/u = 1/f（实距离 u>0，虚像 v<0 在左侧）
            用 cm 算，映射回场景坐标。
            """
            f_cm = f_tracker.get_value()
            u_cm = 0.8 * f_cm          # 物距
            # 虚像：1/v = 1/f + 1/(-u) → v = fu/(u-f) < 0 当 u<f
            # 标准公式：1/v - 1/(-u) = 1/f → 1/v = 1/f - 1/u
            # 使用符号约定：物在左，u>0；虚像在左，v<0（用绝对值）
            denom = u_cm - f_cm   # u - f < 0 当 u < f
            if abs(denom) < 1e-6:
                v_cm = -300.0
            else:
                v_cm = f_cm * u_cm / denom  # 负值 → 虚像在左
            # 场景坐标
            img_x = lens_cx + v_cm * SCALE  # v_cm < 0，所以像在透镜左侧
            img_h = H_OBJ * abs(v_cm) / u_cm  # 放大倍数
            img_h = min(img_h, 2.8)   # 防止虚像过高溢出
            img_base = np.array([img_x, -0.5, 0])
            img_tip  = np.array([img_x, -0.5 + img_h, 0])
            return img_base, img_tip

        # ── 物体箭头（右侧，always_redraw）──────────────────────────────
        obj_arrow_R = always_redraw(lambda: Arrow(
            get_obj_R()[0], get_obj_R()[1],
            buff=0, color=GREEN, stroke_width=3,
            max_tip_length_to_length_ratio=0.25
        ))
        obj_label_R = always_redraw(lambda: Text("h", font=CJK, color=GREEN).scale(0.38)
                                    .next_to(obj_arrow_R, LEFT, buff=0.08))

        # ── 焦点标记 ──────────────────────────────────────────────────────
        focus_R_dot = always_redraw(lambda: Dot(get_focus_R(), color=YELLOW, radius=0.07))
        focus_L_dot = always_redraw(lambda: Dot(get_focus_L(), color=YELLOW, radius=0.07))
        focus_R_label = always_redraw(lambda: MathTex(r"F_2", color=YELLOW).scale(0.42)
                                      .next_to(focus_R_dot, DOWN, buff=0.12))
        focus_L_label = always_redraw(lambda: MathTex(r"F_1", color=YELLOW).scale(0.42)
                                      .next_to(focus_L_dot, DOWN, buff=0.12))

        self.play(
            FadeIn(obj_arrow_R), FadeIn(obj_label_R),
            FadeIn(focus_R_dot), FadeIn(focus_L_dot),
            FadeIn(focus_R_label), FadeIn(focus_L_label)
        )
        self.wait(0.8)

        # ── Step 4: 三条光线（always_redraw 动态） ──────────────────────
        # 射线 1：平行光轴入射，折射后过 F2（延长线）
        # 射线 2：过光心不偏折
        # 射线 3：朝向 F1 入射，折射后平行光轴

        def ray1():
            """平行光轴 → 折射后过 F2（延长线，虚线延伸到左侧虚像）。"""
            ob, ot = get_obj_R()
            f2 = get_focus_R()
            # 入射段：物顶端 → 透镜（水平）
            entry = Line(ot, np.array([lens_cx, ot[1], 0]), color=RED, stroke_width=2)
            # 透镜到 F2 折射段
            ref = Line(np.array([lens_cx, ot[1], 0]), f2, color=RED, stroke_width=2)
            # 反向延长（虚像方向，眼这侧看到的延长线）
            # 方向：从透镜出口 → F2，反向延长到虚像
            dir_vec = f2 - np.array([lens_cx, ot[1], 0])
            norm_d = np.linalg.norm(dir_vec)
            if norm_d < 1e-6:
                return VGroup(entry, ref)
            dir_unit = dir_vec / norm_d
            # 反向方向
            back_end = np.array([lens_cx, ot[1], 0]) - dir_unit * 3.5
            back = DashedLine(np.array([lens_cx, ot[1], 0]), back_end,
                              color=RED, stroke_width=1.5, dash_length=0.1)
            return VGroup(entry, ref, back)

        def ray2():
            """过光心不偏折。"""
            ob, ot = get_obj_R()
            # 从物顶端 → 透镜中心 → 延伸到眼睛
            center = np.array([lens_cx, -0.5, 0])
            dir_vec = center - ot
            norm_d = np.linalg.norm(dir_vec)
            if norm_d < 1e-6:
                return VGroup()
            dir_unit = dir_vec / norm_d
            end_pt = center + dir_unit * 2.5
            return VGroup(
                Line(ot, center, color=ORANGE, stroke_width=2),
                Line(center, end_pt, color=ORANGE, stroke_width=2),
                DashedLine(center, center - dir_unit * 3.5,
                           color=ORANGE, stroke_width=1.5, dash_length=0.1)
            )

        def ray3():
            """朝向 F1 方向入射，折射后平行光轴。"""
            ob, ot = get_obj_R()
            f1 = get_focus_L()
            # 入射方向：从物顶端 → F1（延长到透镜）
            dir_vec = f1 - ot
            norm_d = np.linalg.norm(dir_vec)
            if norm_d < 1e-6:
                return VGroup()
            dir_unit = dir_vec / norm_d
            # 找到与透镜平面 x=lens_cx 的交点
            t = (lens_cx - ot[0]) / (dir_unit[0] + 1e-10)
            lens_hit = ot + dir_unit * t
            # 折射后平行光轴向右（到眼睛方向）
            exit_pt = lens_hit + np.array([2.5, 0, 0])
            back_pt = lens_hit - np.array([3.5, 0, 0])
            return VGroup(
                Line(ot, lens_hit, color=BLUE, stroke_width=2),
                Line(lens_hit, exit_pt, color=BLUE, stroke_width=2),
                DashedLine(lens_hit, back_pt,
                           color=BLUE, stroke_width=1.5, dash_length=0.1)
            )

        rays1 = always_redraw(ray1)
        rays2 = always_redraw(ray2)
        rays3 = always_redraw(ray3)

        self.play(Create(rays1), Create(rays2), Create(rays3))
        self.wait(1.0)

        # ── 虚像箭头（右侧，always_redraw）──────────────────────────────
        vimg_arrow = always_redraw(lambda: Arrow(
            get_virtual_image()[0], get_virtual_image()[1],
            buff=0, color=GREEN, stroke_width=2, stroke_opacity=0.7,
            max_tip_length_to_length_ratio=0.2
        ).set_fill(color=GREEN, opacity=0.3))

        vimg_label = always_redraw(lambda: VGroup(
            Text("虚像", font=CJK, color=GREEN).scale(0.35)
        ).next_to(get_virtual_image()[1], UP, buff=0.08))

        self.play(FadeIn(vimg_arrow), FadeIn(vimg_label))
        self.wait(0.8)

        # ── 视角 θ（虚像对眼的张角，右侧）────────────────────────────────
        theta_arc_R = always_redraw(lambda: Arc(
            radius=0.5,
            start_angle=PI,
            angle=math.atan2(H_OBJ, f_tracker.get_value() * SCALE),
            arc_center=eye_R, color=YELLOW
        ))
        theta_label_R = always_redraw(lambda: MathTex(r"\theta", color=YELLOW).scale(0.55)
                                      .move_to(eye_R + np.array([-0.82, 0.25, 0])))

        tan_formula_R = always_redraw(lambda: MathTex(
            r"\tan\theta \approx \frac{h}{f}", color=YELLOW
        ).scale(0.55).move_to(np.array([4.0, -2.2, 0])))

        self.play(Create(theta_arc_R), FadeIn(theta_label_R))
        self.play(Write(tan_formula_R))
        self.wait(1.0)

        # ╔══ Step 5: 角放大率推导框 ═══════════════════════════════════════╗
        # 推导放在顶部，分步出现
        deriv_title = Text("角放大率推导", font=CJK, color=BLUE).scale(0.5)
        deriv_title.move_to(np.array([0, 2.0, 0]))

        step_a = VGroup(
            Text("定义：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\alpha = \frac{\tan\theta}{\tan\theta_0}", color=YELLOW).scale(0.65)
        ).arrange(RIGHT, buff=0.12).next_to(deriv_title, DOWN, buff=0.3)

        step_b = VGroup(
            Text("代入：", font=CJK, color=WHITE).scale(0.45),
            MathTex(r"\alpha = \frac{h/f}{h/25}", color=YELLOW).scale(0.65)
        ).arrange(RIGHT, buff=0.12).next_to(step_a, DOWN, buff=0.25)

        step_c = VGroup(
            MathTex(r"\alpha = \frac{25}{f}", color=GREEN).scale(0.8)
        ).next_to(step_b, DOWN, buff=0.3)

        box_deriv = SurroundingRectangle(step_c, color=GREEN, buff=0.2, corner_radius=0.1)

        self.play(FadeIn(deriv_title))
        self.wait(0.4)
        self.play(FadeIn(step_a))
        self.wait(0.8)
        step_a[1][0].set_color(YELLOW)  # tan θ 高亮
        self.play(FadeIn(step_b))
        self.wait(0.8)
        self.play(Write(step_c[0]), Create(box_deriv))
        step_c[0].set_color(GREEN)
        self.wait(1.2)

        # ╔══ Step 6: ValueTracker 动态演示 ════════════════════════════════╗
        # 实时角放大率读数
        alpha_readout = always_redraw(lambda: VGroup(
            Text("角放大率：", font=CJK, color=CYAN).scale(0.42),
            MathTex(rf"\alpha = {D / f_tracker.get_value():.1f}", color=CYAN).scale(0.65)
        ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.55))

        f_readout = always_redraw(lambda: VGroup(
            Text("焦距 f = ", font=CJK, color=ORANGE).scale(0.38),
            MathTex(rf"{f_tracker.get_value():.0f}\,\mathrm{{cm}}", color=ORANGE).scale(0.55)
        ).arrange(RIGHT, buff=0.08).next_to(alpha_readout, DOWN, buff=0.18).align_to(alpha_readout, RIGHT))

        hint_sweep = Text("焦距越小 → 视角越大 → 放大率越高", font=CJK, color=ORANGE).scale(0.42)
        hint_sweep.to_edge(DOWN, buff=0.45)

        self.play(FadeIn(alpha_readout), FadeIn(f_readout), FadeIn(hint_sweep))
        self.wait(0.5)

        # 缩小焦距：f 10cm → 5cm
        self.play(f_tracker.animate.set_value(5.0), run_time=2.5)
        self.wait(0.8)
        # 增大焦距：f 5cm → 50cm
        self.play(f_tracker.animate.set_value(50.0), run_time=3.0)
        self.wait(0.8)
        # 回到 10cm
        self.play(f_tracker.animate.set_value(10.0), run_time=2.0)
        self.wait(1.0)

        # ╔══ Step 7: 数值例子 ══════════════════════════════════════════════╗
        self.play(
            FadeOut(VGroup(
                divider, label_naked, label_mag,
                eye_dot_L, eye_label_L, obj_arrow_L, obj_label_L,
                dist_brace_L, dist_label_L,
                angle_line_L1, angle_line_L2,
                theta0_arc, theta0_label, tan0_formula,
                lens, eye_dot_R, eye_label_R,
                obj_arrow_R, obj_label_R,
                focus_R_dot, focus_L_dot, focus_R_label, focus_L_label,
                rays1, rays2, rays3,
                vimg_arrow, vimg_label,
                theta_arc_R, theta_label_R, tan_formula_R,
                deriv_title, step_a, step_b, step_c, box_deriv,
                alpha_readout, f_readout, hint_sweep
            ))
        )
        self.wait(0.3)

        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        ex1 = VGroup(
            Text("例1：f = 5 cm，明视距离 25 cm", font=CJK).scale(0.46)
        ).next_to(ex_title, DOWN, buff=0.35)
        ex1_ans = MathTex(r"\alpha = \frac{25}{5} = 5\times", color=YELLOW).scale(0.75)
        ex1_ans.next_to(ex1, DOWN, buff=0.3)

        ex2 = VGroup(
            Text("例2：f = 2.5 cm（高倍放大镜）", font=CJK).scale(0.46)
        ).next_to(ex1_ans, DOWN, buff=0.35)
        ex2_ans = MathTex(r"\alpha = \frac{25}{2.5} = 10\times", color=YELLOW).scale(0.75)
        ex2_ans.next_to(ex2, DOWN, buff=0.3)

        note_ex = Text("焦距越短，放大率越高；但焦距过短时景深极浅，不易使用。",
                       font=CJK, color=GREEN).scale(0.41)
        note_ex.next_to(ex2_ans, DOWN, buff=0.4)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex1))
        self.wait(0.5)
        self.play(Write(ex1_ans))
        self.wait(0.8)
        self.play(FadeIn(ex2))
        self.wait(0.5)
        self.play(Write(ex2_ans))
        self.wait(0.8)
        self.play(FadeIn(note_ex))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_title, ex1, ex1_ans, ex2, ex2_ans, note_ex)))

        # ╔══ Step 8: 小结卡 ════════════════════════════════════════════════╗
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1 = VGroup(
            Text("角放大率定义：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\alpha = \frac{\tan\theta}{\tan\theta_0}", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.15)

        s2 = MathTex(r"\alpha = \frac{25\,\mathrm{cm}}{f}", color=YELLOW).scale(0.85)

        s3 = VGroup(
            Text("放大镜使物体的视角从", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\theta_0", color=YELLOW).scale(0.6),
            Text("增大到", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\theta = \alpha\theta_0", color=GREEN).scale(0.6)
        ).arrange(RIGHT, buff=0.1)

        s4 = Text("焦距越短，角放大率越大", font=CJK, color=GREEN).scale(0.46)

        s_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.42).next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(11.5)
        box_s = SurroundingRectangle(s_group, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box_s))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, s_group, box_s, title)))
        self.wait(0.4)


# ══════════════════════════════════════════════════════════════════════════════
#  注册表
# ══════════════════════════════════════════════════════════════════════════════
REGISTER = [
    {
        "scene": "Ch10Kp1MagnifierAngularMagnification",
        "id": "phys-ch10-10.4-kp1-magnifier-angular-magnification",
        "chapterId": "ch10",
        "sectionId": "10.4",
        "title": "放大镜角放大率",
        "description": "通过裸眼与放大镜光路对比，推导角放大率 α=25/f，并用 ValueTracker 动态演示焦距变化对视角的影响。",
    }
]
