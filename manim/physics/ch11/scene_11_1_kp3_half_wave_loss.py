"""第 11.1 节 · 半波损失与光程差修正（知识点 kp3）

可视化流程：
  Step 1  标题
  Step 2  生活类比（玻璃表面的绿色反射光——反射率只有 4%，却看得见，正是半波损失让相位翻转）
  Step 3  光疏→光密界面：反射光相位翻转 180°（ = 多走 λ/2）
  Step 4  光密→光疏界面：反射光无翻转
  Step 5  两种情形动态对比——ValueTracker 扫动入射、反射波形
  Step 6  劳埃德镜几何：直射光 + 镜面反射光→暗纹（接触点相消）
  Step 7  ValueTracker 移动观察点，展示条纹分布
  Step 8  总结：光程差判断树（逐步出现）
  Step 9  关键公式小结卡

铁律：MathTex 内只用 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 辅助：绘制正弦波段 ───────────────────────────────────────────────────────
def make_wave_path(axes, x_start, x_end, amplitude, phase_offset=0,
                   color=YELLOW, n_points=200):
    """返回在 axes 坐标系中绘制的正弦波 VMobject。"""
    points = []
    xs = np.linspace(x_start, x_end, n_points)
    for x in xs:
        y = amplitude * math.sin(2 * math.pi * x / (x_end - x_start) * 2 + phase_offset)
        points.append(axes.c2p(x, y))
    curve = VMobject(color=color)
    curve.set_points_as_corners(points)
    curve.make_smooth()
    return curve


class Ch11Kp3HalfWaveLoss(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("半波损失与光程差修正", font=CJK, color=BLUE).scale(0.72)
        title.to_edge(UP)
        subtitle = Text("第十一章 波动光学  ·  11.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("日常生活中，玻璃表面会反射约 4% 的光——", font=CJK).scale(0.48)
        ana2 = Text("这束微弱反射光的相位，比透射光恰好翻转了半个波长。", font=CJK).scale(0.48)
        ana3 = Text("这就是「半波损失」，它让薄膜干涉的光程差计算出现修正项。",
                    font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3  光疏→光密：反射光翻转 180°
        # ══════════════════════════════════════════════════════════════════
        sec3_lbl = Text("情形 A：光疏 → 光密（如空气→玻璃）", font=CJK, color=CYAN).scale(0.48)
        sec3_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec3_lbl))

        # 界面：水平线
        interface = Line(LEFT * 5.5, RIGHT * 5.5, color=BLUE, stroke_width=3).shift(DOWN * 0.3)
        lbl_air   = Text("空气（光疏）", font=CJK, color=WHITE).scale(0.38).move_to(LEFT * 4.2 + UP * 1.0)
        lbl_glass = Text("玻璃（光密）", font=CJK, color=BLUE).scale(0.38).move_to(LEFT * 4.2 + DOWN * 1.1)
        self.play(Create(interface), FadeIn(lbl_air), FadeIn(lbl_glass))
        self.wait(0.5)

        # 入射光（从左上射入）
        inc_start = np.array([-3.0, 1.8, 0])
        inc_end   = np.array([-0.5, -0.3, 0])
        inc_arr = Arrow(inc_start, inc_end, color=WHITE, buff=0)
        inc_txt = Text("入射光", font=CJK, color=WHITE).scale(0.38).next_to(inc_arr, UL, buff=0.1)

        # 反射光（向右上，相位翻转）
        ref_end = np.array([2.0, 1.8, 0])
        ref_arr = Arrow(inc_end, ref_end, color=RED, buff=0)
        ref_txt = VGroup(
            Text("反射光", font=CJK, color=RED).scale(0.38),
            Text("（相位 +", font=CJK, color=RED).scale(0.38),
            MathTex(r"\pi", color=RED).scale(0.55),
            Text("）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.05).next_to(ref_arr, UR, buff=0.1)

        # 透射光（向下）
        tra_end = np.array([-0.5, -1.8, 0])
        tra_arr = Arrow(inc_end, tra_end, color=GREEN, buff=0)
        tra_txt = Text("透射光（相位不变）", font=CJK, color=GREEN).scale(0.38).next_to(tra_arr, RIGHT, buff=0.1)

        self.play(GrowArrow(inc_arr), FadeIn(inc_txt))
        self.wait(0.4)
        self.play(GrowArrow(ref_arr), FadeIn(ref_txt))
        self.wait(0.4)
        self.play(GrowArrow(tra_arr), FadeIn(tra_txt))
        self.wait(0.8)

        # 相位翻转标注（波形图简示）
        phase_note = VGroup(
            Text("等效于光程差额外增加", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"\frac{\lambda}{2}", color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.1).to_edge(RIGHT).shift(UP * 0.4)
        box_note = SurroundingRectangle(phase_note, color=YELLOW, buff=0.15, corner_radius=0.1)
        self.play(FadeIn(phase_note), Create(box_note))
        self.wait(1.5)

        grp3 = VGroup(interface, lbl_air, lbl_glass,
                      inc_arr, inc_txt, ref_arr, ref_txt, tra_arr, tra_txt,
                      phase_note, box_note, sec3_lbl)
        self.play(FadeOut(grp3))

        # ══════════════════════════════════════════════════════════════════
        # Step 4  光密→光疏：无翻转
        # ══════════════════════════════════════════════════════════════════
        sec4_lbl = Text("情形 B：光密 → 光疏（如玻璃→空气）", font=CJK, color=ORANGE).scale(0.48)
        sec4_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec4_lbl))

        interface2 = Line(LEFT * 5.5, RIGHT * 5.5, color=BLUE, stroke_width=3).shift(DOWN * 0.3)
        lbl_glass2 = Text("玻璃（光密）", font=CJK, color=BLUE).scale(0.38).move_to(LEFT * 4.2 + UP * 1.0)
        lbl_air2   = Text("空气（光疏）", font=CJK, color=WHITE).scale(0.38).move_to(LEFT * 4.2 + DOWN * 1.1)
        self.play(Create(interface2), FadeIn(lbl_glass2), FadeIn(lbl_air2))
        self.wait(0.4)

        inc2_start = np.array([-3.0, 1.8, 0])
        inc2_end   = np.array([-0.5, -0.3, 0])
        inc2_arr = Arrow(inc2_start, inc2_end, color=WHITE, buff=0)

        ref2_end = np.array([2.0, 1.8, 0])
        ref2_arr = Arrow(inc2_end, ref2_end, color=ORANGE, buff=0)
        ref2_txt = VGroup(
            Text("反射光", font=CJK, color=ORANGE).scale(0.38),
            Text("（相位", font=CJK, color=ORANGE).scale(0.38),
            Text("不变", font=CJK, color=GREEN).scale(0.38),
            Text("）", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.05).next_to(ref2_arr, UR, buff=0.1)

        no_loss_note = VGroup(
            Text("无半波损失，光程差", font=CJK, color=GREEN).scale(0.42),
            Text("不需加", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\frac{\lambda}{2}", color=GREEN).scale(0.7),
        ).arrange(RIGHT, buff=0.1).to_edge(RIGHT).shift(UP * 0.4)
        box_no = SurroundingRectangle(no_loss_note, color=GREEN, buff=0.15, corner_radius=0.1)

        self.play(GrowArrow(inc2_arr))
        self.play(GrowArrow(ref2_arr), FadeIn(ref2_txt))
        self.play(FadeIn(no_loss_note), Create(box_no))
        self.wait(1.6)

        grp4 = VGroup(interface2, lbl_glass2, lbl_air2,
                      inc2_arr, ref2_arr, ref2_txt,
                      no_loss_note, box_no, sec4_lbl)
        self.play(FadeOut(grp4))

        # ══════════════════════════════════════════════════════════════════
        # Step 5  动态波形对比：翻转 vs 不翻转
        # ══════════════════════════════════════════════════════════════════
        wave_lbl = Text("波形对比：半波损失 = 相位翻转 180°", font=CJK, color=CYAN).scale(0.48)
        wave_lbl.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(wave_lbl))

        ax_top = Axes(
            x_range=[0, 4, 1], y_range=[-1.4, 1.4, 1],
            x_length=9, y_length=1.6,
            axis_config={"color": BLUE, "include_tip": False},
        ).shift(UP * 0.7)
        ax_bot = Axes(
            x_range=[0, 4, 1], y_range=[-1.4, 1.4, 1],
            x_length=9, y_length=1.6,
            axis_config={"color": BLUE, "include_tip": False},
        ).shift(DOWN * 1.2)

        lbl_top = Text("入射光 / 无损失反射", font=CJK, color=WHITE).scale(0.36).next_to(ax_top, LEFT, buff=0.15)
        lbl_bot = Text("有半波损失反射", font=CJK, color=RED).scale(0.36).next_to(ax_bot, LEFT, buff=0.15)

        t_track = ValueTracker(0.0)

        wave_top = always_redraw(lambda: ax_top.plot(
            lambda x: math.sin(2 * math.pi * x - t_track.get_value()),
            x_range=[0, 4], color=WHITE,
        ))
        wave_bot = always_redraw(lambda: ax_bot.plot(
            lambda x: math.sin(2 * math.pi * x - t_track.get_value() + math.pi),
            x_range=[0, 4], color=RED,
        ))

        self.play(Create(ax_top), Create(ax_bot),
                  FadeIn(lbl_top), FadeIn(lbl_bot))
        self.play(Create(wave_top), Create(wave_bot))
        self.wait(0.5)
        self.play(t_track.animate.set_value(4 * math.pi), run_time=4, rate_func=linear)
        self.wait(0.5)

        flip_note = Text("两者相位恰好相反 → 相消干涉", font=CJK, color=YELLOW).scale(0.44)
        flip_note.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(flip_note))
        self.wait(1.5)

        grp5 = VGroup(ax_top, ax_bot, lbl_top, lbl_bot, wave_top, wave_bot, flip_note, wave_lbl)
        self.play(FadeOut(grp5))

        # ══════════════════════════════════════════════════════════════════
        # Step 6  劳埃德镜几何
        # ══════════════════════════════════════════════════════════════════
        lloyd_lbl = Text("劳埃德镜：验证半波损失的经典实验", font=CJK, color=CYAN).scale(0.48)
        lloyd_lbl.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(lloyd_lbl))

        # 光源 S
        S_pos = np.array([-5.2, 0.8, 0])
        S_dot = Dot(S_pos, color=YELLOW, radius=0.13)
        S_txt = Text("S", font=CJK, color=YELLOW).scale(0.42).next_to(S_dot, UP, buff=0.08)

        # 平面镜（水平，y=0）
        mirror = Line(np.array([-1.0, 0, 0]), np.array([4.0, 0, 0]),
                      color=BLUE, stroke_width=5)
        mirror_txt = Text("平面镜", font=CJK, color=BLUE).scale(0.38).next_to(mirror, DOWN, buff=0.15)

        # 观察屏（右侧竖线）
        screen = Line(np.array([4.0, -1.8, 0]), np.array([4.0, 2.5, 0]),
                      color=WHITE, stroke_width=3)
        screen_txt = Text("观察屏", font=CJK, color=WHITE).scale(0.38).next_to(screen, RIGHT, buff=0.1)

        # 观察点 P（屏上）
        P_pos = np.array([4.0, 1.2, 0])
        P_dot = Dot(P_pos, color=GREEN, radius=0.10)
        P_txt = Text("P", font=CJK, color=GREEN).scale(0.40).next_to(P_dot, RIGHT, buff=0.08)

        # 直射光线 S→P
        direct_ray = DashedLine(S_pos, P_pos, color=WHITE, stroke_width=2.5)
        direct_lbl = Text("直射", font=CJK, color=WHITE).scale(0.35).move_to(
            (S_pos + P_pos) / 2 + np.array([0, 0.28, 0])
        )

        # 像源 S'（S 关于镜面的像）
        Sp_pos = np.array([-5.2, -0.8, 0])
        Sp_dot = Dot(Sp_pos, color=ORANGE, radius=0.10)
        Sp_txt = Text("S'（虚像）", font=CJK, color=ORANGE).scale(0.36).next_to(Sp_dot, DOWN, buff=0.1)

        # 镜面反射光线（S→镜→P），转折点 M
        Mx = (Sp_pos[0] * P_pos[1] - P_pos[0] * Sp_pos[1]) / (P_pos[1] - Sp_pos[1])
        M_pos = np.array([Mx, 0.0, 0])
        refl_1 = Line(S_pos, M_pos, color=RED, stroke_width=2.5)
        refl_2 = Line(M_pos, P_pos, color=RED, stroke_width=2.5)
        refl_lbl = Text("反射（半波损失）", font=CJK, color=RED).scale(0.34).move_to(
            (M_pos + P_pos) / 2 + np.array([0, -0.32, 0])
        )

        self.play(Create(mirror), FadeIn(mirror_txt))
        self.play(Create(screen), FadeIn(screen_txt))
        self.play(FadeIn(S_dot), FadeIn(S_txt))
        self.wait(0.3)
        self.play(Create(direct_ray), FadeIn(direct_lbl))
        self.wait(0.4)
        self.play(FadeIn(Sp_dot), FadeIn(Sp_txt))
        self.play(Create(refl_1), Create(refl_2), FadeIn(refl_lbl))
        self.play(FadeIn(P_dot), FadeIn(P_txt))
        self.wait(1.0)

        # 接触点（镜边缘）显示暗纹
        contact_pos = np.array([4.0, 0.0, 0])
        contact_lbl = Text("接触点 → 暗纹（相消）", font=CJK, color=RED).scale(0.40)
        contact_lbl.move_to(np.array([1.6, -1.3, 0]))
        arr_to_contact = Arrow(contact_lbl.get_top(),
                               contact_pos + np.array([0, 0.1, 0]),
                               color=RED, buff=0.05)
        self.play(FadeIn(contact_lbl), GrowArrow(arr_to_contact))
        self.wait(1.5)

        grp6 = VGroup(mirror, mirror_txt, screen, screen_txt,
                      S_dot, S_txt, Sp_dot, Sp_txt,
                      direct_ray, direct_lbl, refl_1, refl_2, refl_lbl,
                      P_dot, P_txt, contact_lbl, arr_to_contact, lloyd_lbl)
        self.play(FadeOut(grp6))

        # ══════════════════════════════════════════════════════════════════
        # Step 7  ValueTracker 移动 P：条纹分布
        # ══════════════════════════════════════════════════════════════════
        fringe_lbl = Text("移动观察点 P：明暗条纹交替", font=CJK, color=CYAN).scale(0.48)
        fringe_lbl.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(fringe_lbl))

        # 重建简化几何
        mirror2 = Line(np.array([-1.5, 0, 0]), np.array([3.5, 0, 0]),
                       color=BLUE, stroke_width=4)
        screen2 = Line(np.array([3.5, -2.2, 0]), np.array([3.5, 2.5, 0]),
                       color=WHITE, stroke_width=3)
        S2_pos  = np.array([-4.8, 0.6, 0])
        Sp2_pos = np.array([-4.8, -0.6, 0])
        S2_dot  = Dot(S2_pos,  color=YELLOW, radius=0.12)
        Sp2_dot = Dot(Sp2_pos, color=ORANGE, radius=0.10)
        S2_txt  = Text("S",  font=CJK, color=YELLOW).scale(0.40).next_to(S2_dot,  UP, buff=0.06)
        Sp2_txt = Text("S'", font=CJK, color=ORANGE).scale(0.40).next_to(Sp2_dot, DOWN, buff=0.06)

        self.play(Create(mirror2), Create(screen2),
                  FadeIn(S2_dot), FadeIn(S2_txt),
                  FadeIn(Sp2_dot), FadeIn(Sp2_txt))

        # 条纹亮度标尺（用 always_redraw 色块列表近似 → 改用 ValueTracker 画条纹图案）
        # 直接画 5 条明/暗纹位置指示
        d = 1.2      # 光源到镜面距离（示意值）
        lam = 0.3    # 波长（示意值）
        L = 8.4      # 光源到屏距离（示意值）

        y_tracker = ValueTracker(1.2)

        def make_fringe_scene():
            y = y_tracker.get_value()
            P2_pos = np.array([3.5, y, 0])
            P2_d = Dot(P2_pos, color=GREEN, radius=0.10)
            P2_t = Text("P", font=CJK, color=GREEN).scale(0.38).next_to(P2_d, RIGHT, buff=0.06)

            r1 = math.sqrt((3.5 - S2_pos[0])**2 + (y - S2_pos[1])**2)
            r2 = math.sqrt((3.5 - Sp2_pos[0])**2 + (y - Sp2_pos[1])**2)
            delta = r2 - r1   # 光程差（虚像距离差）+ λ/2（半波损失）
            delta_total = delta + lam / 2

            # 明/暗判断
            k_bright = delta_total / lam
            is_bright = abs(k_bright - round(k_bright)) < 0.12
            is_dark   = abs(delta_total / lam - (round(delta_total / lam - 0.5) + 0.5)) < 0.12

            ray1 = DashedLine(S2_pos, P2_pos, color=WHITE, stroke_width=1.8)
            ray2 = Line(Sp2_pos, P2_pos, color=RED, stroke_width=1.8)

            color_p = YELLOW if is_bright else (RED if is_dark else GREEN)
            P2_d.set_color(color_p)

            return VGroup(P2_d, P2_t, ray1, ray2)

        fringe_group = always_redraw(make_fringe_scene)
        self.add(fringe_group)
        self.wait(0.3)

        # 移动 P，扫过明暗条纹
        self.play(y_tracker.animate.set_value(-1.6), run_time=5, rate_func=linear)
        self.wait(0.5)
        self.play(y_tracker.animate.set_value(1.8), run_time=5, rate_func=linear)
        self.wait(0.8)

        fringe_cap = Text("接触点（y=0）为暗纹，向上依次出现明纹", font=CJK, color=YELLOW).scale(0.42)
        fringe_cap.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(fringe_cap))
        self.wait(1.5)

        self.remove(fringe_group)
        grp7 = VGroup(mirror2, screen2, S2_dot, S2_txt, Sp2_dot, Sp2_txt,
                      fringe_cap, fringe_lbl)
        self.play(FadeOut(grp7))

        # ══════════════════════════════════════════════════════════════════
        # Step 8  判断树：何时加 λ/2
        # ══════════════════════════════════════════════════════════════════
        tree_lbl = Text("光程差修正判断树", font=CJK, color=CYAN).scale(0.52)
        tree_lbl.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(tree_lbl))

        q1 = Text("反射光是否经历「光疏→光密」界面？", font=CJK, color=WHITE).scale(0.45)
        q1.next_to(tree_lbl, DOWN, buff=0.55)

        yes_lbl = Text("是", font=CJK, color=GREEN).scale(0.44)
        no_lbl  = Text("否", font=CJK, color=RED).scale(0.44)

        # 箭头 Yes 和 No
        arr_yes = Arrow(q1.get_bottom() + LEFT * 1.5 + DOWN * 0.1,
                        q1.get_bottom() + LEFT * 1.5 + DOWN * 1.0,
                        color=GREEN, buff=0)
        arr_no  = Arrow(q1.get_bottom() + RIGHT * 1.5 + DOWN * 0.1,
                        q1.get_bottom() + RIGHT * 1.5 + DOWN * 1.0,
                        color=RED, buff=0)
        yes_lbl.next_to(arr_yes, LEFT, buff=0.1)
        no_lbl.next_to(arr_no,  RIGHT, buff=0.1)

        yes_res = VGroup(
            Text("总光程差 =", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\delta_0 + \frac{\lambda}{2}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        yes_res.next_to(arr_yes, DOWN, buff=0.1)

        no_res = VGroup(
            Text("总光程差 =", font=CJK, color=RED).scale(0.42),
            MathTex(r"\delta_0", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.1)
        no_res.next_to(arr_no, DOWN, buff=0.1)

        self.play(FadeIn(q1))
        self.wait(0.8)
        self.play(GrowArrow(arr_yes), FadeIn(yes_lbl), GrowArrow(arr_no), FadeIn(no_lbl))
        self.play(FadeIn(yes_res), FadeIn(no_res))
        self.wait(1.0)

        # 明暗条纹条件
        bright_cond = VGroup(
            Text("明纹：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"\delta_{\text{total}} = k\lambda \quad (k=1,2,3,\ldots)", color=YELLOW).scale(0.62),
        ).arrange(RIGHT, buff=0.12)
        dark_cond = VGroup(
            Text("暗纹：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\delta_{\text{total}} = \left(2k+1\right)\frac{\lambda}{2}", color=WHITE).scale(0.62),
        ).arrange(RIGHT, buff=0.12)
        cond_grp = VGroup(bright_cond, dark_cond).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        cond_grp.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(bright_cond))
        self.wait(0.6)
        self.play(FadeIn(dark_cond))
        self.wait(1.8)

        grp8 = VGroup(tree_lbl, q1, arr_yes, arr_no, yes_lbl, no_lbl,
                      yes_res, no_res, cond_grp)
        self.play(FadeOut(grp8))

        # ══════════════════════════════════════════════════════════════════
        # Step 9  小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        f1 = VGroup(
            Text("总光程差（有半波损失时）：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\delta_{\text{total}} = \delta_0 + \frac{\lambda}{2}", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.15)

        f2 = VGroup(
            Text("相位差与光程差关系：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\Delta\varphi = \frac{2\pi}{\lambda}\,\delta", color=CYAN).scale(0.82),
        ).arrange(RIGHT, buff=0.15)

        f3 = VGroup(
            Text("明纹：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"\delta = k\lambda", color=YELLOW).scale(0.80),
            Text("    暗纹：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\delta = (2k+1)\frac{\lambda}{2}", color=WHITE).scale(0.80),
        ).arrange(RIGHT, buff=0.12)

        rule1 = Text("光疏→光密 反射：有半波损失（相位翻转 180°）",
                     font=CJK, color=RED).scale(0.40)
        rule2 = Text("光密→光疏 反射：无半波损失",
                     font=CJK, color=GREEN).scale(0.40)

        summary = VGroup(f1, f2, f3, rule1, rule2).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(13)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(Write(f1))
        self.wait(0.5)
        self.play(Write(f2))
        self.wait(0.5)
        self.play(Write(f3))
        self.wait(0.5)
        self.play(FadeIn(rule1), FadeIn(rule2))
        self.play(Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp3HalfWaveLoss",
        "id": "phys-ch11-11.1-kp3-half-wave-loss",
        "chapterId": "ch11",
        "sectionId": "11.1",
        "title": "半波损失与光程差修正",
        "description": "通过界面反射相位翻转动画、波形对比、劳埃德镜几何与条纹扫动，直观讲解半波损失的物理本质及光程差修正规则。",
    }
]
