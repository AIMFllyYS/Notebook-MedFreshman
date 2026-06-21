"""第 10.2 节 · 薄透镜密接组合与焦度叠加

可视化方案：
1. 逐次成像：物点 P 经 L1（f1=+20cm）成中间像 P1，再经 L2（f2=-40cm）成最终虚像 P2。
2. 等效透镜：合并为 Phi=Phi1+Phi2=1/20-1/40=1/40 diopter^{-1} → f=40cm，直接验证。
3. ValueTracker 改变 f2，演示等效焦点位移；Phi1+Phi2=0 时光线不偏折。
4. 底部加法动画：Phi = Phi1 + Phi2 数值框相加。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数（屏幕单位：1 unit = 10 cm）──────────────────────────────────
# 使用缩放系数：1 cm → 0.04 screen units（屏幕宽 ~14 units）
SCALE = 0.04  # 1 cm = 0.04 screen units


def thin_lens_shape(f_sign, height=1.4, color=BLUE):
    """绘制薄透镜（凸或凹），返回 VGroup。f_sign>0 凸，f_sign<0 凹。"""
    if f_sign > 0:
        # 凸透镜：中间宽，两端细
        left_curve = ArcBetweenPoints(
            np.array([0, -height / 2, 0]),
            np.array([0,  height / 2, 0]),
            angle=-TAU / 6,
        ).set_color(color)
        right_curve = ArcBetweenPoints(
            np.array([0,  height / 2, 0]),
            np.array([0, -height / 2, 0]),
            angle=-TAU / 6,
        ).set_color(color)
        return VGroup(left_curve, right_curve)
    else:
        # 凹透镜：中间窄，两端宽
        left_curve = ArcBetweenPoints(
            np.array([0, -height / 2, 0]),
            np.array([0,  height / 2, 0]),
            angle=TAU / 6,
        ).set_color(color)
        right_curve = ArcBetweenPoints(
            np.array([0,  height / 2, 0]),
            np.array([0, -height / 2, 0]),
            angle=TAU / 6,
        ).set_color(color)
        return VGroup(left_curve, right_curve)


class Ch10Kp3LensCombinationPower(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("薄透镜密接组合与焦度叠加", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("眼镜片 + 放大镜叠在一起，等效焦距是多少？", font=CJK).scale(0.48)
        ana2 = Text("直接分开算两次成像太麻烦——焦度叠加给你一步到位的答案。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 定义焦度
        # ═══════════════════════════════════════════════════════════════════
        def_title = Text("焦度（屈光度）的定义", font=CJK, color=BLUE).scale(0.52)
        def_title.next_to(title, DOWN, buff=0.45)

        row1_zh = Text("单个薄透镜的焦度：", font=CJK).scale(0.44)
        row1_tex = MathTex(r"\Phi = \frac{1}{f}").scale(0.85)
        row1 = VGroup(row1_zh, row1_tex).arrange(RIGHT, buff=0.2)

        row2_zh = Text("单位：", font=CJK).scale(0.44)
        row2_tex = MathTex(r"\mathrm{D}\ (\text{diopter}) = \mathrm{m}^{-1}").scale(0.85)
        row2 = VGroup(row2_zh, row2_tex).arrange(RIGHT, buff=0.2)

        row3_zh = Text("密接组合的核心结论：", font=CJK, color=YELLOW).scale(0.44)
        row3_tex = MathTex(r"\Phi = \Phi_1 + \Phi_2", color=YELLOW).scale(0.95)
        row3 = VGroup(row3_zh, row3_tex).arrange(RIGHT, buff=0.2)

        defs = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        defs.next_to(def_title, DOWN, buff=0.4)

        self.play(FadeIn(def_title))
        self.play(FadeIn(row1))
        self.wait(0.8)
        self.play(FadeIn(row2))
        self.wait(0.8)
        self.play(FadeIn(row3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 搭建光学场景——两个紧密相邻的薄透镜
        # ═══════════════════════════════════════════════════════════════════
        # 光轴
        optical_axis = Line(LEFT * 6.2, RIGHT * 6.2, color=GREY, stroke_width=1.2)
        axis_label = Text("光轴", font=CJK).scale(0.32).set_color(GREY).next_to(optical_axis, DOWN, buff=0.08).to_edge(RIGHT, buff=0.5)

        # 两个透镜位置（屏幕坐标）
        lens1_x = -1.0
        lens2_x = -0.85  # 紧密相邻（间距 0.15 unit ≈ 3.75 cm）

        L1 = thin_lens_shape(+1, height=1.6, color=BLUE).move_to([lens1_x, 0, 0])
        L2 = thin_lens_shape(-1, height=1.6, color=RED).move_to([lens2_x, 0, 0])

        lab_L1 = VGroup(
            Text("L1", font=CJK, color=BLUE).scale(0.4),
            MathTex(r"f_1=+20\,\mathrm{cm}", color=BLUE).scale(0.55),
        ).arrange(DOWN, buff=0.1).next_to(L1, UP, buff=0.25)

        lab_L2 = VGroup(
            Text("L2", font=CJK, color=RED).scale(0.4),
            MathTex(r"f_2=-40\,\mathrm{cm}", color=RED).scale(0.55),
        ).arrange(DOWN, buff=0.1).next_to(L2, UP, buff=0.25)

        scene_group = VGroup(optical_axis, axis_label, L1, L2, lab_L1, lab_L2)
        self.play(Create(optical_axis), FadeIn(axis_label))
        self.play(Create(L1), FadeIn(lab_L1))
        self.play(Create(L2), FadeIn(lab_L2))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 逐次成像——物点 P 经 L1 成 P1，P1 再经 L2 成 P2
        #
        # 实际计算（以屏幕单位，1 unit = 25 cm）：
        #   物距 u1 = -30 cm = -1.2 unit（物在 L1 左侧 1.2 unit）
        #   L1: 1/v1 - 1/u1 = 1/f1  => 1/v1 = 1/20 - 1/30 => v1 = 60 cm = 2.4 unit
        #   P1 在 L1 右侧 2.4 unit = lens1_x + 2.4
        #
        #   对 L2（密接，忽略间距）：
        #   u2 = v1（相对 L2 的物距 ≈ 相对 L1）= 60 cm
        #   L2: 1/v2 = 1/u2 + 1/f2 = 1/60 + 1/(-40) = 2/120 - 3/120 = -1/120
        #   v2 = -120 cm = -4.8 unit（虚像，在 L2 左侧 4.8 unit）
        #
        # 屏幕坐标（lens_x ≈ -0.92 = 两镜中点）：
        #   P  位于 lens1_x - 1.2  = -2.2
        #   P1 位于 lens1_x + 2.4  = 1.4   (1 unit = 25 cm → 实际 1 screen unit = 25cm)
        #   P2 位于 lens_mid - 4.8 = -0.92 - 4.8 = -5.72  (超出屏幕，压缩处理)
        #
        # 为适配屏幕，改用 1 unit = 20 cm：
        #   u1 = -1.5 (30cm), v1 = 3.0 (60cm), v2 = -6.0 (120cm) → 压缩至 -5.0
        # ─────────────────────────────────────────────────────────────────
        UNIT = 0.05  # 1 cm = 0.05 screen unit → 1 unit = 20 cm

        lens_mid = (lens1_x + lens2_x) / 2  # ≈ -0.925

        P_x  = lens1_x - 30 * UNIT   # 物点 P: -1.0 - 1.5 = -2.5
        P1_x = lens1_x + 60 * UNIT   # 中间像 P1: -1.0 + 3.0 = 2.0
        P2_x = lens_mid - 120 * UNIT  # 最终虚像 P2: -0.925 - 6.0 = -6.925 → 夹到 -5.8

        P2_x_clamp = max(P2_x, -5.8)  # 防止超出屏幕

        P_pos  = np.array([P_x,  0, 0])
        P1_pos = np.array([P1_x, 0, 0])
        P2_pos = np.array([P2_x_clamp, 0, 0])

        # 物点 P
        dot_P = Dot(P_pos, color=WHITE, radius=0.1)
        lab_P = Text("P", font=CJK).scale(0.38).set_color(WHITE).next_to(dot_P, DOWN, buff=0.12)

        step_label = Text("第一步：逐次成像", font=CJK, color=ORANGE).scale(0.46).to_edge(DOWN, buff=1.1)
        self.play(FadeIn(dot_P, lab_P), FadeIn(step_label))
        self.wait(0.6)

        # 三条光线：从 P 经 L1 折向 P1（用颜色区分）
        ray_colors = [YELLOW, GREEN, CYAN]

        # 辅助光线方向（只画到 L1 处，再折射到 P1）
        ray_offsets = [-0.5, 0.0, 0.5]  # 通过 L1 不同高度的光线

        ray1_segs = VGroup()
        for i, (dy, rc) in enumerate(zip(ray_offsets, ray_colors)):
            hit1 = np.array([lens1_x, dy, 0])
            seg_in  = Line(P_pos, hit1, color=rc, stroke_width=2.2)
            seg_out = Line(hit1, P1_pos, color=rc, stroke_width=2.2)
            ray1_segs.add(seg_in, seg_out)

        dot_P1 = Dot(P1_pos, color=GREEN, radius=0.1)
        lab_P1 = VGroup(
            Text("P1", font=CJK, color=GREEN).scale(0.38),
            Text("(中间实像)", font=CJK, color=GREEN).scale(0.3),
        ).arrange(DOWN, buff=0.05).next_to(dot_P1, DOWN, buff=0.1)

        self.play(Create(ray1_segs), run_time=1.6)
        self.play(FadeIn(dot_P1, lab_P1))
        self.wait(0.8)

        # 第二段光线：从 P1 经 L2 折向 P2（虚像，延长线相交）
        ray2_segs = VGroup()
        dashed_segs = VGroup()
        for i, (dy, rc) in enumerate(zip(ray_offsets, ray_colors)):
            hit2 = np.array([lens2_x, dy * 0.55, 0])   # 通过 L2 不同高度
            seg_in2  = Line(P1_pos, hit2, color=rc, stroke_width=2.2)
            # 折射后光线发散（凹透镜），但延长线会汇聚到 P2（虚像）
            # 实际光线方向：从 hit2 出发，方向 = hit2 → P2 方向（延长线）
            dir_refr = P2_pos - hit2
            dir_refr = dir_refr / np.linalg.norm(dir_refr)
            seg_out2 = Line(hit2, hit2 + dir_refr * 1.8, color=rc, stroke_width=2.2)
            dashed_back = DashedLine(hit2, P2_pos, color=rc, stroke_width=1.5,
                                     dash_length=0.12).set_opacity(0.6)
            ray2_segs.add(seg_in2, seg_out2)
            dashed_segs.add(dashed_back)

        dot_P2 = Dot(P2_pos, color=ORANGE, radius=0.1)
        lab_P2 = VGroup(
            Text("P2", font=CJK, color=ORANGE).scale(0.38),
            Text("(最终虚像)", font=CJK, color=ORANGE).scale(0.3),
        ).arrange(DOWN, buff=0.05).next_to(dot_P2, DOWN, buff=0.1)

        self.play(Create(ray2_segs), run_time=1.6)
        self.play(Create(dashed_segs))
        self.play(FadeIn(dot_P2, lab_P2))
        self.wait(1.0)

        # 计算结果标注
        calc_box1 = VGroup(
            MathTex(r"\frac{1}{v_1}=\frac{1}{f_1}+\frac{1}{u_1}", color=BLUE).scale(0.52),
            MathTex(r"=\frac{1}{20}-\frac{1}{30}\ \Rightarrow\ v_1=60\,\mathrm{cm}", color=GREEN).scale(0.52),
        ).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.15).to_edge(LEFT, buff=0.5)
        self.play(FadeIn(calc_box1))
        self.wait(1.0)

        calc_box2 = VGroup(
            MathTex(r"\frac{1}{v_2}=\frac{1}{f_2}+\frac{1}{u_2}", color=RED).scale(0.52),
            MathTex(r"=\frac{1}{-40}+\frac{1}{60}\ \Rightarrow\ v_2=-120\,\mathrm{cm}", color=ORANGE).scale(0.52),
        ).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.15).to_edge(RIGHT, buff=0.5)
        self.play(FadeIn(calc_box2))
        self.wait(1.4)

        # 清场（保留光轴和透镜）
        self.play(FadeOut(VGroup(
            ray1_segs, ray2_segs, dashed_segs,
            dot_P, lab_P, dot_P1, lab_P1, dot_P2, lab_P2,
            step_label, calc_box1, calc_box2,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: 等效透镜——焦度叠加
        # ═══════════════════════════════════════════════════════════════════
        step2_label = Text("第二步：焦度叠加 → 等效透镜", font=CJK, color=YELLOW).scale(0.46)
        step2_label.to_edge(DOWN, buff=1.1)
        self.play(FadeIn(step2_label))
        self.wait(0.5)

        # 焦度加法动画（数值框）
        phi1_box = VGroup(
            Text("L1", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"\Phi_1 = +5\,\mathrm{D}", color=BLUE).scale(0.7),
        ).arrange(DOWN, buff=0.1)
        plus_sign = MathTex(r"+").scale(0.9).set_color(WHITE)
        phi2_box = VGroup(
            Text("L2", font=CJK, color=RED).scale(0.38),
            MathTex(r"\Phi_2 = -2.5\,\mathrm{D}", color=RED).scale(0.7),
        ).arrange(DOWN, buff=0.1)
        eq_sign = MathTex(r"=").scale(0.9).set_color(WHITE)
        phi_sum_box = VGroup(
            Text("等效", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"\Phi = +2.5\,\mathrm{D}", color=GREEN).scale(0.7),
        ).arrange(DOWN, buff=0.1)

        add_row = VGroup(phi1_box, plus_sign, phi2_box, eq_sign, phi_sum_box).arrange(RIGHT, buff=0.3)
        add_row.to_edge(DOWN, buff=0.18)

        rect1 = SurroundingRectangle(phi1_box, color=BLUE, buff=0.12, corner_radius=0.08)
        rect2 = SurroundingRectangle(phi2_box, color=RED,  buff=0.12, corner_radius=0.08)
        rect_sum = SurroundingRectangle(phi_sum_box, color=GREEN, buff=0.12, corner_radius=0.08)

        self.play(FadeIn(phi1_box), Create(rect1))
        self.wait(0.5)
        self.play(FadeIn(plus_sign), FadeIn(phi2_box), Create(rect2))
        self.wait(0.5)
        self.play(FadeIn(eq_sign), FadeIn(phi_sum_box), Create(rect_sum))
        self.wait(1.0)

        # 等效透镜图形（替换两个透镜）
        lens_equiv_x = (lens1_x + lens2_x) / 2
        L_equiv = thin_lens_shape(+1, height=1.8, color=GREEN)
        L_equiv.move_to([lens_equiv_x, 0, 0])
        lab_Leq = VGroup(
            Text("等效 L", font=CJK, color=GREEN).scale(0.4),
            MathTex(r"f_{eq}=+40\,\mathrm{cm}", color=GREEN).scale(0.55),
        ).arrange(DOWN, buff=0.1).next_to(L_equiv, UP, buff=0.25)

        self.play(
            Transform(VGroup(L1, L2), L_equiv),
            Transform(VGroup(lab_L1, lab_L2), lab_Leq),
        )
        self.wait(0.8)

        # 用等效透镜直接画光线 P → P2（与逐次结果一致）
        dot_P2  = Dot(P_pos,  color=WHITE, radius=0.1)
        lab_P2_in = Text("P", font=CJK).scale(0.38).set_color(WHITE).next_to(dot_P2, DOWN, buff=0.12)
        dot_P2_out = Dot(P2_pos, color=GREEN, radius=0.1)
        lab_P2_out = VGroup(
            Text("P2", font=CJK, color=GREEN).scale(0.38),
            Text("(与逐次结果一致)", font=CJK, color=GREEN).scale(0.28),
        ).arrange(DOWN, buff=0.05).next_to(dot_P2_out, DOWN, buff=0.1)

        confirm_ray = DashedLine(P_pos, P2_pos, color=GREEN, stroke_width=2.0, dash_length=0.15)
        self.play(FadeIn(dot_P2, lab_P2_in))
        self.play(Create(confirm_ray))
        self.play(FadeIn(dot_P2_out, lab_P2_out))
        self.wait(1.2)

        highlight_note = Text("焦度可直接叠加，一步算出等效焦距！", font=CJK, color=YELLOW).scale(0.46)
        highlight_note.next_to(step2_label, UP, buff=0.18)
        self.play(FadeIn(highlight_note))
        self.wait(1.4)

        # 清场
        self.play(FadeOut(VGroup(
            confirm_ray, dot_P2, lab_P2_in, dot_P2_out, lab_P2_out,
            highlight_note, step2_label,
            add_row, rect1, rect2, rect_sum,
            VGroup(L1, L2), VGroup(lab_L1, lab_L2),  # 已 Transform，需 FadeOut 残余
            L_equiv, lab_Leq,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: ValueTracker 改变 f2，演示等效焦点位移
        # ═══════════════════════════════════════════════════════════════════
        self.play(FadeOut(optical_axis), FadeOut(axis_label))

        track_title = Text("改变 L2 的焦距，观察等效焦点的位移", font=CJK, color=BLUE).scale(0.5)
        track_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(track_title))

        # 重新搭建简洁示意场景
        ax_line = Line(LEFT * 6.0, RIGHT * 6.0, color=GREY, stroke_width=1.0)
        self.play(Create(ax_line))

        f2_tracker = ValueTracker(-40.0)  # f2 单位：cm

        # 等效焦距公式：1/f = 1/f1 + 1/f2 = 1/20 + 1/f2
        # 等效焦距 f_eq (cm)
        # 焦点位置：lens_mid + f_eq * UNIT（正：右侧实焦点；负：左侧虚焦点）

        def get_f_eq():
            f2 = f2_tracker.get_value()
            f1 = 20.0
            if abs(1 / f1 + 1 / f2) < 1e-6:
                return float('inf')
            return 1.0 / (1.0 / f1 + 1.0 / f2)

        # 焦点标记（always_redraw）
        focal_dot = always_redraw(lambda: (
            Dot(
                [lens_equiv_x + get_f_eq() * UNIT, 0, 0],
                color=YELLOW, radius=0.14,
            ) if not math.isinf(get_f_eq()) and abs(get_f_eq() * UNIT + lens_equiv_x) < 5.5
            else VGroup()
        ))

        f_eq_label = always_redraw(lambda: (
            VGroup(
                Text("等效焦点", font=CJK, color=YELLOW).scale(0.35),
                MathTex(
                    rf"f_{{eq}}={get_f_eq():.0f}\,\mathrm{{cm}}" if not math.isinf(get_f_eq())
                    else r"f_{eq}\to\infty",
                    color=YELLOW
                ).scale(0.6),
            ).arrange(DOWN, buff=0.06).next_to(
                [
                    min(max(lens_equiv_x + get_f_eq() * UNIT, -5.2), 5.2)
                    if not math.isinf(get_f_eq()) else lens_equiv_x,
                    0, 0
                ],
                UP, buff=0.22,
            )
        ))

        f2_readout = always_redraw(lambda: VGroup(
            Text("当前 f2 =", font=CJK, color=RED).scale(0.42),
            MathTex(rf"{f2_tracker.get_value():.0f}\,\mathrm{{cm}}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.15).to_corner(UR, buff=0.5))

        phi_readout = always_redraw(lambda: VGroup(
            MathTex(
                rf"\Phi = \frac{{1}}{{20}} + \frac{{1}}{{{f2_tracker.get_value():.0f}}}",
                color=CYAN,
            ).scale(0.55),
        ).to_corner(DR, buff=0.5))

        # 静态透镜图（简单线段代表密接组合位置）
        lens_line = Line([lens_equiv_x, -0.9, 0], [lens_equiv_x, 0.9, 0], color=WHITE, stroke_width=3)

        self.play(Create(lens_line), FadeIn(focal_dot), FadeIn(f_eq_label),
                  FadeIn(f2_readout), FadeIn(phi_readout))
        self.wait(0.8)

        zh_sweep = Text("改变 f2：观察等效焦点向左/右移动", font=CJK, color=ORANGE).scale(0.42)
        zh_sweep.to_edge(DOWN, buff=0.6)
        self.play(FadeIn(zh_sweep))

        # 动画1：f2 从 -40 → -100（凹透镜弱化 → 接近平板）
        self.play(f2_tracker.animate.set_value(-100.0), run_time=2.5)
        self.wait(0.6)

        # 动画2：f2 → -20（凹透镜与凸透镜等强 → Phi=0，平板）
        flat_note = Text("当 Phi1 + Phi2 = 0：等效为平板（光线不偏折）", font=CJK, color=GREEN).scale(0.42)
        flat_note.to_edge(DOWN, buff=0.18)
        self.play(f2_tracker.animate.set_value(-20.0), run_time=2.0)
        self.play(FadeIn(flat_note))
        self.wait(0.8)

        # 闪光：透镜变成直线（平板效果）
        flat_flash = Line([lens_equiv_x, -0.9, 0], [lens_equiv_x, 0.9, 0],
                          color=GREEN, stroke_width=5)
        self.play(Create(flat_flash), run_time=0.4)
        self.play(FadeOut(flat_flash), run_time=0.4)
        self.wait(0.6)

        # 动画3：f2 → +40（凹变凸，正焦度）
        self.play(f2_tracker.animate.set_value(40.0), run_time=2.0)
        self.wait(0.5)

        # 动画4：回到原始 -40
        self.play(f2_tracker.animate.set_value(-40.0), run_time=1.5)
        self.wait(0.8)

        self.play(FadeOut(VGroup(
            ax_line, lens_line, focal_dot, f_eq_label,
            f2_readout, phi_readout, zh_sweep, flat_note, track_title,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: 焦度叠加公式的推导（逐步）
        # ═══════════════════════════════════════════════════════════════════
        deriv_title = Text("焦度叠加公式推导", font=CJK, color=BLUE).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(deriv_title))

        d1_zh = Text("L1 的高斯公式：", font=CJK).scale(0.42)
        d1_tex = MathTex(r"\frac{1}{v_1} - \frac{1}{u} = \frac{1}{f_1}").scale(0.82)
        d1 = VGroup(d1_zh, d1_tex).arrange(RIGHT, buff=0.2)

        d2_zh = Text("L2 的高斯公式（密接故 u2 = v1）：", font=CJK).scale(0.42)
        d2_tex = MathTex(r"\frac{1}{v} - \frac{1}{v_1} = \frac{1}{f_2}").scale(0.82)
        d2 = VGroup(d2_zh, d2_tex).arrange(RIGHT, buff=0.2)

        d3_zh = Text("两式相加（", font=CJK).scale(0.42)
        d3_mid = MathTex(r"\frac{1}{v_1}").scale(0.82)
        d3_zh2 = Text("消去）：", font=CJK).scale(0.42)
        d3_tex = MathTex(r"\frac{1}{v} - \frac{1}{u} = \frac{1}{f_1} + \frac{1}{f_2}").scale(0.82)
        d3_row1 = VGroup(d3_zh, d3_mid, d3_zh2).arrange(RIGHT, buff=0.1)
        d3 = VGroup(d3_row1, d3_tex).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

        d4_zh = Text("即等效透镜公式，焦距满足：", font=CJK).scale(0.42)
        d4_tex = MathTex(r"\frac{1}{f} = \frac{1}{f_1} + \frac{1}{f_2}", color=YELLOW).scale(0.9)
        d4 = VGroup(d4_zh, d4_tex).arrange(RIGHT, buff=0.2)

        d5_tex = MathTex(r"\Phi = \Phi_1 + \Phi_2", color=GREEN).scale(1.0)

        deriv_group = VGroup(d1, d2, d3, d4, d5_tex).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        deriv_group.next_to(deriv_title, DOWN, buff=0.38)
        deriv_group.scale_to_fit_width(12.5)

        self.play(FadeIn(d1))
        self.wait(0.8)
        self.play(FadeIn(d2))
        self.wait(0.8)
        self.play(FadeIn(d3))
        self.wait(0.8)
        self.play(FadeIn(d4))
        self.wait(0.8)
        self.play(Write(d5_tex))
        self.wait(1.4)
        self.play(FadeOut(VGroup(deriv_title, deriv_group)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 9: 数值例子（本题 f1=+20, f2=-40）
        # ═══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(ex_title))

        ex1_zh = Text("已知：", font=CJK).scale(0.44)
        ex1_tex = MathTex(r"f_1=+20\,\mathrm{cm},\quad f_2=-40\,\mathrm{cm}").scale(0.78)
        ex1 = VGroup(ex1_zh, ex1_tex).arrange(RIGHT, buff=0.2)

        ex2_zh = Text("等效焦度：", font=CJK).scale(0.44)
        ex2_tex = MathTex(r"\Phi = \frac{1}{0.20} + \frac{1}{-0.40} = 5 - 2.5 = 2.5\,\mathrm{D}",
                          color=YELLOW).scale(0.78)
        ex2 = VGroup(ex2_zh, ex2_tex).arrange(RIGHT, buff=0.2)

        ex3_zh = Text("等效焦距：", font=CJK).scale(0.44)
        ex3_tex = MathTex(r"f_{eq} = \frac{1}{\Phi} = \frac{1}{2.5} = 0.40\,\mathrm{m} = 40\,\mathrm{cm}",
                          color=GREEN).scale(0.78)
        ex3 = VGroup(ex3_zh, ex3_tex).arrange(RIGHT, buff=0.2)

        ex4_zh = Text("与逐次成像结果完全一致！", font=CJK, color=ORANGE).scale(0.46)

        ex_group = VGroup(ex1, ex2, ex3, ex4_zh).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        ex_group.next_to(ex_title, DOWN, buff=0.4)
        ex_group.scale_to_fit_width(13.0)

        self.play(FadeIn(ex1))
        self.wait(0.8)
        self.play(FadeIn(ex2))
        self.wait(0.8)
        self.play(FadeIn(ex3))
        self.wait(0.8)
        self.play(FadeIn(ex4_zh))
        self.wait(1.4)
        self.play(FadeOut(VGroup(ex_title, ex_group)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s1_zh = Text("薄透镜密接组合的焦度叠加：", font=CJK, color=WHITE).scale(0.44)
        s1_tex = MathTex(r"\Phi = \Phi_1 + \Phi_2", color=YELLOW).scale(0.95)
        s1 = VGroup(s1_zh, s1_tex).arrange(RIGHT, buff=0.25)

        s2_zh = Text("等效焦距：", font=CJK, color=WHITE).scale(0.44)
        s2_tex = MathTex(r"\frac{1}{f} = \frac{1}{f_1} + \frac{1}{f_2}", color=YELLOW).scale(0.95)
        s2 = VGroup(s2_zh, s2_tex).arrange(RIGHT, buff=0.25)

        s3 = Text("密接条件：两镜间距远小于焦距（d << f）", font=CJK, color=CYAN).scale(0.43)

        s4 = Text("Phi1 + Phi2 = 0  =>  等效平板，光线不偏折", font=CJK, color=GREEN).scale(0.43)

        s5_zh = Text("本例（f1=+20, f2=-40）：", font=CJK).scale(0.42)
        s5_tex = MathTex(r"\Phi=2.5\,\mathrm{D},\quad f_{eq}=40\,\mathrm{cm}", color=GREEN).scale(0.75)
        s5 = VGroup(s5_zh, s5_tex).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.33, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.wait(0.6)
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch10Kp3LensCombinationPower",
        "id": "phys-ch10-10.2-kp3-lens-combination-power",
        "chapterId": "ch10",
        "sectionId": "10.2",
        "title": "薄透镜密接组合与焦度叠加",
        "description": "用逐次成像与等效透镜两种方法处理密接薄透镜组合，ValueTracker 动态演示等效焦点随 f2 的变化，并推导焦度叠加公式 Phi=Phi1+Phi2。",
    },
]
