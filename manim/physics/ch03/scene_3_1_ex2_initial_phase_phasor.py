"""第 3.1 节 · 例题精讲：用旋转矢量法确定初相位（例3-1）

施工图：
  Step1: 单位圆 + x=A/2 水平虚线，标出两个交点
  Step2: 速度条件 v₀>0 筛选交点，消去上方交点，突出下方（第四象限）
  Step3: 在圆弧上标注角度：cos φ=1/2，φ=-π/3
  Step4: 写出最终方程 x=Acos(2πt/T - π/3)
  汇总小结卡

铁律：MathTex 内只有 ASCII LaTeX；中文用 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 颜色常量
C_TITLE   = BLUE
C_FORMULA = YELLOW
C_RESULT  = GREEN
C_WARN    = RED
C_AUX     = CYAN
C_ORANGE  = ORANGE


class Ch03Ex2InitialPhasePhasor(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("用旋转矢量法确定初相位", font=CJK, color=C_TITLE).scale(0.65)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第三章 振动 · 3.1 · 例3-1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 题意引入（生活类比式的物理背景说明）
        # ══════════════════════════════════════════════════════════════════
        intro_a = Text("已知一简谐振动：振幅 A，角频率 ω=2π/T", font=CJK).scale(0.46)
        intro_b = Text("初始条件：位移 x₀=A/2，速度 v₀>0（向正方向运动）", font=CJK).scale(0.46)
        intro_c = Text("问：初相位 φ 是多少？", font=CJK, color=C_FORMULA).scale(0.46)
        intro = VGroup(intro_a, intro_b, intro_c).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        intro.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(intro_a))
        self.wait(0.6)
        self.play(FadeIn(intro_b))
        self.wait(0.6)
        self.play(FadeIn(intro_c))
        self.wait(1.5)
        self.play(FadeOut(intro))

        # ══════════════════════════════════════════════════════════════════
        # 构建旋转矢量圆图（整个视频共用，只构建一次）
        # ══════════════════════════════════════════════════════════════════
        R = 1.8  # 圆半径（视觉单位）

        # 圆心放左半屏
        circle_center = LEFT * 3.2 + DOWN * 0.5

        circle = Circle(radius=R, color=WHITE, stroke_width=2)
        circle.move_to(circle_center)

        # 坐标轴
        x_axis = Arrow(
            circle_center + LEFT * (R + 0.3),
            circle_center + RIGHT * (R + 0.5),
            buff=0, color=BLUE, stroke_width=2, tip_length=0.18,
        )
        y_axis = Arrow(
            circle_center + DOWN * (R + 0.3),
            circle_center + UP * (R + 0.5),
            buff=0, color=BLUE, stroke_width=2, tip_length=0.18,
        )
        x_label = MathTex(r"x").scale(0.55).next_to(x_axis.get_end(), RIGHT, buff=0.08)
        y_label = MathTex(r"y").scale(0.55).next_to(y_axis.get_end(), UP, buff=0.08)
        origin_dot = Dot(circle_center, color=WHITE, radius=0.05)

        # x=A/2 水平虚线（在单位圆上，x轴坐标 A/2 对应投影 R/2）
        x_half_screen = circle_center[0] + R / 2  # 屏幕 x 坐标
        dash_y_range_top    = circle_center[1] + R * math.sin(math.pi / 3)
        dash_y_range_bottom = circle_center[1] - R * math.sin(math.pi / 3)

        dashed_line = DashedLine(
            np.array([circle_center[0] - R - 0.2, circle_center[1] + R / 2 * math.tan(0), 0]),
            np.array([x_half_screen + 0.15, circle_center[1] + R / 2 * math.tan(0), 0]),
            color=C_AUX, stroke_width=2, dash_length=0.12,
        )
        # 竖向辅助线 x=A/2
        vert_dash = DashedLine(
            np.array([x_half_screen, circle_center[1] - R - 0.1, 0]),
            np.array([x_half_screen, circle_center[1] + R + 0.1, 0]),
            color=C_AUX, stroke_width=1.5, dash_length=0.1,
        )

        # 两个交点
        # 上方（第一象限）：角度 +π/3
        angle_top    =  math.pi / 3   # 60°
        angle_bottom = -math.pi / 3   # -60°（第四象限）
        pt_top    = circle_center + np.array([R * math.cos(angle_top),    R * math.sin(angle_top),    0])
        pt_bottom = circle_center + np.array([R * math.cos(angle_bottom), R * math.sin(angle_bottom), 0])

        dot_top    = Dot(pt_top,    color=C_WARN,   radius=0.13)
        dot_bottom = Dot(pt_bottom, color=C_RESULT, radius=0.13)

        # 矢量（从圆心到交点）
        vec_top    = Arrow(circle_center, pt_top,    buff=0, color=C_WARN,   stroke_width=3, tip_length=0.20)
        vec_bottom = Arrow(circle_center, pt_bottom, buff=0, color=C_RESULT, stroke_width=3, tip_length=0.20)

        # 标注
        label_phi_top = VGroup(
            MathTex(r"\varphi=+\frac{\pi}{3}").scale(0.52),
        ).next_to(dot_top, UP + RIGHT, buff=0.08)
        label_phi_top[0].set_color(C_WARN)

        label_phi_bot = VGroup(
            MathTex(r"\varphi=-\frac{\pi}{3}").scale(0.52),
        ).next_to(dot_bottom, DOWN + RIGHT, buff=0.08)
        label_phi_bot[0].set_color(C_RESULT)

        # x₀ = A/2 标注
        x0_label = VGroup(
            Text("x", font=CJK).scale(0.38),
            MathTex(r"_{0}=\frac{A}{2}").scale(0.42),
        ).arrange(RIGHT, buff=0.03)
        x0_label.next_to(np.array([x_half_screen, circle_center[1], 0]), DOWN, buff=0.18)

        circle_group = VGroup(circle, x_axis, y_axis, x_label, y_label, origin_dot)

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 画圆 + 水平虚线 + 标两个交点
        # ══════════════════════════════════════════════════════════════════
        step_title_3 = Text("第一步：由位移条件找矢量可能位置", font=CJK, color=C_TITLE).scale(0.48)
        step_title_3.next_to(title, DOWN, buff=0.4)

        # 右侧推导区
        eq_cos = MathTex(
            r"\cos\varphi = \frac{x_{0}}{A} = \frac{1}{2}"
        ).scale(0.72)
        eq_two_sol = MathTex(
            r"\Rightarrow \varphi = \pm\frac{\pi}{3}"
        ).scale(0.72)
        eq_cos.set_color(C_FORMULA)
        eq_two_sol.set_color(C_FORMULA)

        right_block = VGroup(eq_cos, eq_two_sol).arrange(DOWN, buff=0.45, aligned_edge=LEFT)
        right_block.next_to(title, DOWN, buff=1.2)
        right_block.to_edge(RIGHT, buff=0.8)

        self.play(FadeIn(step_title_3))
        self.play(Create(circle_group))
        self.wait(0.5)

        # 画水平虚线 + 竖向虚线
        self.play(Create(vert_dash))
        self.wait(0.4)

        # 显示 cos φ = 1/2 的推导
        self.play(Write(eq_cos))
        self.wait(0.8)
        self.play(Write(eq_two_sol))
        self.wait(0.8)

        # 标出两个交点和矢量
        self.play(
            FadeIn(dot_top), Create(vec_top),
            FadeIn(dot_bottom), Create(vec_bottom),
        )
        self.play(FadeIn(label_phi_top), FadeIn(label_phi_bot))
        self.play(FadeIn(x0_label))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 速度条件筛选交点
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(step_title_3))
        step_title_4 = Text("第二步：速度条件 v₀>0 筛选正确交点", font=CJK, color=C_TITLE).scale(0.48)
        step_title_4.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step_title_4))
        self.wait(0.5)

        # 右侧：速度条件推导
        self.play(FadeOut(right_block))
        eq_v1 = MathTex(r"v = -\omega A\sin\varphi").scale(0.68)
        eq_v2 = MathTex(r"v_{0} > 0 \Rightarrow \sin\varphi < 0").scale(0.68)
        eq_v3 = MathTex(r"\Rightarrow \varphi \in (-\pi, 0)").scale(0.68)
        eq_v4 = Text("第四象限矢量满足条件", font=CJK, color=C_RESULT).scale(0.44)
        eq_v1.set_color(WHITE)
        eq_v2.set_color(C_FORMULA)
        eq_v3.set_color(C_FORMULA)

        right_v = VGroup(eq_v1, eq_v2, eq_v3, eq_v4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        right_v.next_to(title, DOWN, buff=1.1)
        right_v.to_edge(RIGHT, buff=0.7)
        right_v.scale_to_fit_width(min(right_v.width, 5.0))

        self.play(Write(eq_v1))
        self.wait(0.6)
        self.play(Write(eq_v2))
        self.wait(0.6)
        self.play(Write(eq_v3))
        self.wait(0.8)
        self.play(FadeIn(eq_v4))
        self.wait(0.8)

        # 旋转方向说明（顺时针 = 角度减小）
        rot_hint = Text("旋转矢量顺时针转：角度随时间减小", font=CJK, color=C_AUX).scale(0.4)
        rot_hint.next_to(circle, DOWN, buff=0.25)
        self.play(FadeIn(rot_hint))
        self.wait(0.8)

        # 消去上方交点（闪亮消失）
        self.play(
            Flash(dot_top, color=C_WARN, flash_radius=0.35, line_length=0.18),
            run_time=0.7,
        )
        self.play(
            FadeOut(dot_top),
            FadeOut(vec_top),
            FadeOut(label_phi_top),
            run_time=0.8,
        )
        # 突出下方交点
        self.play(
            dot_bottom.animate.scale(1.4).set_color(C_RESULT),
            run_time=0.6,
        )
        self.wait(1.5)
        self.play(FadeOut(rot_hint))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 在圆弧上标注角度 φ=-π/3
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(step_title_4))
        step_title_5 = Text("第三步：圆弧标注 φ = -π/3", font=CJK, color=C_TITLE).scale(0.48)
        step_title_5.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step_title_5))
        self.wait(0.4)

        # 弧线：从 x 正半轴（角度 0）顺时针到 -π/3（即弧从 0 到 -60°）
        arc_angle = Arc(
            radius=R * 0.45,
            start_angle=0,
            angle=-math.pi / 3,   # 顺时针，负值
            color=C_ORANGE,
            stroke_width=2.5,
        ).move_arc_center_to(circle_center)

        arc_arrow = Arrow(
            arc_angle.get_start(),
            arc_angle.point_from_proportion(0.85),
            buff=0, color=C_ORANGE, stroke_width=2, tip_length=0.14,
        )

        angle_label = MathTex(r"-\frac{\pi}{3}").scale(0.55).set_color(C_ORANGE)
        angle_label.move_to(
            circle_center + np.array([R * 0.55, -R * 0.22, 0])
        )

        # x 轴正方向上标一个小箭头提示
        x_pos_hint = MathTex(r"0").scale(0.42).set_color(WHITE)
        x_pos_hint.next_to(circle_center + RIGHT * R * 0.45, UP, buff=0.1)

        self.play(Create(arc_angle))
        self.play(FadeIn(angle_label))
        self.play(FadeIn(x_pos_hint))
        self.wait(0.6)

        # 右侧：最终得出结论
        self.play(FadeOut(right_v))
        eq_result_phi = MathTex(r"\varphi = -\frac{\pi}{3}").scale(0.88)
        eq_result_phi.set_color(C_RESULT)
        box_phi = SurroundingRectangle(eq_result_phi, color=C_RESULT, buff=0.2, corner_radius=0.1)
        res_group = VGroup(eq_result_phi, box_phi)
        res_group.next_to(title, DOWN, buff=1.6)
        res_group.to_edge(RIGHT, buff=1.2)

        confirm_text = Text("初相位确定！", font=CJK, color=C_RESULT).scale(0.46)
        confirm_text.next_to(res_group, DOWN, buff=0.35)

        self.play(Write(eq_result_phi), Create(box_phi))
        self.play(FadeIn(confirm_text))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 代入方程写出最终结果
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(step_title_5), FadeOut(confirm_text))
        step_title_6 = Text("第四步：代入方程，写出完整解", font=CJK, color=C_TITLE).scale(0.48)
        step_title_6.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(step_title_6))
        self.wait(0.4)

        eq_general = MathTex(r"x = A\cos\!\left(\frac{2\pi}{T}t + \varphi\right)").scale(0.72)
        eq_general.set_color(WHITE)
        eq_general.next_to(title, DOWN, buff=1.15)
        eq_general.to_edge(RIGHT, buff=0.85)

        eq_sub = MathTex(
            r"x = A\cos\!\left(\frac{2\pi}{T}t - \frac{\pi}{3}\right)"
        ).scale(0.82)
        eq_sub.set_color(C_FORMULA)
        eq_sub.next_to(eq_general, DOWN, buff=0.55)

        box_final = SurroundingRectangle(eq_sub, color=C_RESULT, buff=0.22, corner_radius=0.12)

        self.play(Write(eq_general))
        self.wait(0.8)

        # 高亮替换 φ → -π/3
        self.play(
            TransformFromCopy(eq_result_phi, eq_sub.copy()),
            Write(eq_sub),
            run_time=1.2,
        )
        self.play(Create(box_final))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════
        # 清场，准备小结
        # ══════════════════════════════════════════════════════════════════
        all_mid = VGroup(
            circle_group, vert_dash, dot_bottom, vec_bottom,
            label_phi_bot, x0_label, arc_angle, arc_arrow,
            angle_label, x_pos_hint, res_group,
            eq_general, eq_sub, box_final,
            step_title_6,
        )
        self.play(FadeOut(all_mid))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本题小结", font=CJK, color=C_TITLE).scale(0.58)
        sum_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sum_title))

        s_line1 = VGroup(
            Text("位移条件", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Rightarrow \cos\varphi = \frac{x_0}{A}").scale(0.66).set_color(C_FORMULA),
            Text("→ 两个候选值", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.2)

        s_line2 = VGroup(
            Text("速度条件", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Rightarrow v_0=-\omega A\sin\varphi > 0").scale(0.66).set_color(C_FORMULA),
            Text("→ 确定象限", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.2)

        s_line3 = VGroup(
            Text("结论", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\varphi = -\frac{\pi}{3}").scale(0.72).set_color(C_RESULT),
        ).arrange(RIGHT, buff=0.35)

        s_line4 = MathTex(
            r"x = A\cos\!\left(\frac{2\pi}{T}t - \frac{\pi}{3}\right)"
        ).scale(0.82).set_color(C_RESULT)

        sum_body = VGroup(s_line1, s_line2, s_line3, s_line4).arrange(DOWN, buff=0.45, aligned_edge=LEFT)
        sum_body.next_to(sum_title, DOWN, buff=0.45)
        sum_body.scale_to_fit_width(min(sum_body.width, 11.5))

        box_sum = SurroundingRectangle(sum_body, color=BLUE, buff=0.4, corner_radius=0.18)

        self.play(FadeIn(s_line1))
        self.wait(0.7)
        self.play(FadeIn(s_line2))
        self.wait(0.7)
        self.play(FadeIn(s_line3))
        self.wait(0.7)
        self.play(Write(s_line4))
        self.wait(0.5)
        self.play(Create(box_sum))
        self.wait(2.5)

        # 淡出全部
        self.play(FadeOut(VGroup(title, sum_title, sum_body, box_sum)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch03Ex2InitialPhasePhasor",
        "id": "phys-ch03-3.1-ex2-initial-phase-phasor",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "用旋转矢量法确定初相位（例3-1）",
        "description": "旋转矢量圆图上，由 x₀=A/2 找两候选交点，再用 v₀>0 淘汰第一象限点，确定初相位 φ=-π/3，最终写出完整振动方程。",
    }
]
