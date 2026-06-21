"""第 10.4 节 · 例题精讲：显微镜标本位置计算

光路反推法：已知镜筒总长 22.1 cm，物镜焦距 f1=1.6 cm，目镜焦距 f2=2.5 cm，
求标本（物体）应放在物镜下方多远处，使最终像成在无穷远（正常观察状态）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─────────────────── 颜色语义 ───────────────────
# BLUE     → 标题、镜筒结构线
# YELLOW   → 关键公式、高亮结果
# GREEN    → 目镜侧（u2、f2）
# ORANGE   → 物镜侧（v1、s）
# RED      → 标本位置 P
# CYAN     → 辅助虚线、参考距离


class Ch10Ex1MicroscopeSpecimenPlacement(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════
        # Step 1: 标题 + 副标题
        # ══════════════════════════════════════════════════
        title = Text("显微镜标本位置计算", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.4  例题精讲", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════
        ana1 = Text("显微镜由两组透镜组成：", font=CJK).scale(0.5)
        ana2 = Text("物镜把细小标本放大成中间像，目镜再把中间像放大给眼睛看。", font=CJK).scale(0.46)
        ana3 = Text("要看得最清晰，需要把标本放在物镜下方的精确位置。", font=CJK, color=YELLOW).scale(0.46)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════
        # Step 3: 给出已知量
        # ══════════════════════════════════════════════════
        known_title = Text("已知条件", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.45)
        k1 = VGroup(
            Text("镜筒总长 L = 22.1 cm", font=CJK).scale(0.46),
        )
        k2 = VGroup(
            Text("物镜焦距", font=CJK).scale(0.46),
            MathTex(r"f_1 = 1.6\,\mathrm{cm}").scale(0.7),
        ).arrange(RIGHT, buff=0.18)
        k3 = VGroup(
            Text("目镜焦距", font=CJK).scale(0.46),
            MathTex(r"f_2 = 2.5\,\mathrm{cm}").scale(0.7),
        ).arrange(RIGHT, buff=0.18)
        k4 = VGroup(
            Text("目标：最终像成在无穷远（正常目视）", font=CJK, color=GREEN).scale(0.46),
        )
        known_list = VGroup(k1, k2, k3, k4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        known_list.next_to(known_title, DOWN, buff=0.38)
        known_list.to_edge(LEFT, buff=0.9)

        self.play(FadeIn(known_title))
        for item in known_list:
            self.play(FadeIn(item))
            self.wait(0.6)
        self.wait(1.2)
        self.play(FadeOut(VGroup(known_title, known_list)))

        # ══════════════════════════════════════════════════
        # Step 4: 光路示意图（纵向显微镜光路）
        # ══════════════════════════════════════════════════
        # 坐标约定：x 轴向右，y 轴向上
        # 光轴竖直，底部为标本 P，向上光线传播
        # 在屏幕上用竖直光路图：P 在下，L1 居中偏下，L2 居中偏上

        # 光轴
        axis_x = 0.0
        y_bottom = -3.0   # 标本附近底部
        y_top = 3.0       # 目镜上方

        # 图中各元素的 y 坐标（示意比例，非真实 cm 比例）
        y_P = -2.8        # 标本
        y_L1 = -1.0       # 物镜
        y_mid = 1.3       # 中间像平面（v1 位置）
        y_L2 = 2.3        # 目镜（u2 = f2 = 2.5 → 物在目镜焦面）
        y_foc = 2.3       # 目镜焦平面（与 y_L2 重合，因 u2 = f2）

        # 光轴线
        optical_axis = DashedLine(
            start=np.array([axis_x, y_bottom, 0]),
            end=np.array([axis_x, y_top, 0]),
            color=BLUE, dash_length=0.15, dashed_ratio=0.5
        )

        # 物镜 L1（水平线表示薄透镜）
        L1_line = Line(np.array([-1.4, y_L1, 0]), np.array([1.4, y_L1, 0]),
                       color=WHITE, stroke_width=3)
        L1_label = VGroup(Text("物镜", font=CJK).scale(0.38), MathTex(r"L_1").scale(0.55)).arrange(RIGHT, buff=0.1)
        L1_label.next_to(L1_line, RIGHT, buff=0.15)

        # 目镜 L2
        L2_line = Line(np.array([-1.4, y_L2, 0]), np.array([1.4, y_L2, 0]),
                       color=WHITE, stroke_width=3)
        L2_label = VGroup(Text("目镜", font=CJK).scale(0.38), MathTex(r"L_2").scale(0.55)).arrange(RIGHT, buff=0.1)
        L2_label.next_to(L2_line, RIGHT, buff=0.15)

        # 标本 P（红点）
        P_dot = Dot(np.array([axis_x, y_P, 0]), radius=0.1, color=RED)
        P_label = VGroup(
            Text("标本", font=CJK, color=RED).scale(0.38),
            MathTex(r"P", color=RED).scale(0.6),
        ).arrange(RIGHT, buff=0.1).next_to(P_dot, LEFT, buff=0.12)

        # 镜筒总长标注
        brace_tube = Brace(
            Line(np.array([-1.8, y_L1, 0]), np.array([-1.8, y_L2, 0])),
            direction=LEFT, color=BLUE
        )
        brace_tube_label = VGroup(
            MathTex(r"L=22.1\,\mathrm{cm}", color=BLUE).scale(0.52)
        ).next_to(brace_tube, LEFT, buff=0.1)

        self.play(
            Create(optical_axis),
            Create(L1_line), FadeIn(L1_label),
            Create(L2_line), FadeIn(L2_label),
        )
        self.play(Create(P_dot), FadeIn(P_label))
        self.play(GrowFromCenter(brace_tube), FadeIn(brace_tube_label))
        self.wait(1.5)

        # ══════════════════════════════════════════════════
        # Step 5: 反推第一步 — 目镜：最终像在无穷远 → u₂ = f₂
        # ══════════════════════════════════════════════════
        step5_txt = Text("反推第一步：目镜成像在无穷远", font=CJK, color=GREEN).scale(0.44)
        step5_txt.to_corner(UL, buff=0.35)

        # 目镜焦平面（绿色虚线）
        u2_line = DashedLine(
            np.array([-1.4, y_L2 - 0.55, 0]),
            np.array([1.4, y_L2 - 0.55, 0]),
            color=GREEN, dash_length=0.12
        )
        u2_text = VGroup(
            Text("目镜物平面", font=CJK, color=GREEN).scale(0.34),
            MathTex(r"u_2 = f_2 = 2.5\,\mathrm{cm}", color=GREEN).scale(0.52),
        ).arrange(RIGHT, buff=0.12).next_to(u2_line, RIGHT, buff=0.12)

        u2_formula = MathTex(
            r"u_2 = f_2 = 2.5\,\mathrm{cm}",
            r"\quad \Rightarrow \quad",
            r"\text{(final image at } \infty\text{)}",
            color=GREEN
        ).scale(0.62).to_corner(DR, buff=0.5)
        # 注意：括号内是 ASCII，没有中文
        # 用纯公式版本
        u2_formula2 = MathTex(
            r"u_2 = f_2 = 2.5\,\mathrm{cm}",
            color=GREEN
        ).scale(0.64).to_corner(DR, buff=0.55)

        self.play(FadeIn(step5_txt))
        self.play(Create(u2_line), FadeIn(u2_text))
        self.play(Write(u2_formula2))
        self.wait(1.8)

        # ══════════════════════════════════════════════════
        # Step 6: 反推第二步 — 物镜像距 v₁ = L - f₂ = 19.6 cm
        # ══════════════════════════════════════════════════
        step6_txt = Text("反推第二步：物镜的像距", font=CJK, color=ORANGE).scale(0.44)
        step6_txt.next_to(step5_txt, DOWN, buff=0.3)

        # 中间像平面（橙色虚线）
        v1_line = DashedLine(
            np.array([-1.4, y_mid, 0]),
            np.array([1.4, y_mid, 0]),
            color=ORANGE, dash_length=0.12
        )
        v1_text = VGroup(
            Text("中间像平面", font=CJK, color=ORANGE).scale(0.34),
            MathTex(r"v_1 = 19.6\,\mathrm{cm}", color=ORANGE).scale(0.52),
        ).arrange(RIGHT, buff=0.12).next_to(v1_line, RIGHT, buff=0.12)

        v1_formula_a = MathTex(
            r"v_1", r"=", r"L - f_2"
        ).scale(0.7).next_to(u2_formula2, UP, buff=0.35)
        v1_formula_b = MathTex(
            r"v_1", r"=", r"22.1 - 2.5 = 19.6\,\mathrm{cm}", color=ORANGE
        ).scale(0.7).next_to(v1_formula_a, DOWN, buff=0.25)
        v1_formula_b[0].set_color(ORANGE)
        v1_formula_b[2].set_color(ORANGE)

        self.play(FadeIn(step6_txt))
        self.play(Create(v1_line), FadeIn(v1_text))
        self.play(Write(v1_formula_a))
        self.wait(0.7)
        self.play(TransformMatchingTex(v1_formula_a.copy(), v1_formula_b))
        self.wait(1.6)

        # ══════════════════════════════════════════════════
        # Step 7: 薄透镜公式推导 u₁
        # ══════════════════════════════════════════════════
        step7_txt = Text("反推第三步：用薄透镜公式求物距", font=CJK, color=YELLOW).scale(0.44)
        step7_txt.next_to(step6_txt, DOWN, buff=0.3)

        self.play(FadeIn(step7_txt))

        # 薄透镜公式逐步推导（左侧区域）
        formula_x = -3.5
        formula_y_start = 0.4

        lens_eq = MathTex(
            r"\frac{1}{u_1}", r"+", r"\frac{1}{v_1}", r"=", r"\frac{1}{f_1}"
        ).scale(0.72).move_to(np.array([formula_x, formula_y_start, 0]))
        self.play(Write(lens_eq))
        self.wait(1.0)

        rearr = MathTex(
            r"\frac{1}{u_1}", r"=", r"\frac{1}{f_1}", r"-", r"\frac{1}{v_1}"
        ).scale(0.72).next_to(lens_eq, DOWN, buff=0.32)
        self.play(Write(rearr))
        self.wait(0.8)

        sub_vals = MathTex(
            r"\frac{1}{u_1}", r"=",
            r"\frac{1}{1.6}", r"-", r"\frac{1}{19.6}"
        ).scale(0.66).next_to(rearr, DOWN, buff=0.32)
        self.play(Write(sub_vals))
        self.wait(1.0)

        final_u1 = MathTex(
            r"u_1", r"=",
            r"\frac{v_1 f_1}{v_1 - f_1}",
            r"=",
            r"\frac{19.6 \times 1.6}{18.0}",
        ).scale(0.66).next_to(sub_vals, DOWN, buff=0.32)
        final_u1[0].set_color(YELLOW)
        self.play(Write(final_u1))
        self.wait(1.0)

        result_u1 = MathTex(
            r"u_1 \approx 1.74\,\mathrm{cm}",
            color=YELLOW
        ).scale(0.82).next_to(final_u1, DOWN, buff=0.35)
        box_result = SurroundingRectangle(result_u1, color=YELLOW, buff=0.18, corner_radius=0.1)
        self.play(Write(result_u1), Create(box_result))
        self.wait(1.6)

        # ══════════════════════════════════════════════════
        # Step 8: 标本 P 移动到正确位置（u1 = 1.74 cm 处）
        # ══════════════════════════════════════════════════
        step8_txt = Text("标本移动到物镜下方 1.74 cm 处", font=CJK, color=RED).scale(0.42)
        step8_txt.to_edge(DOWN, buff=0.55)

        # 目标位置（L1 下方；在示意图中 u1 对应 y_L1 - 0.42，仅示意）
        y_P_correct = y_L1 - 0.42
        P_dot_target = Dot(np.array([axis_x, y_P_correct, 0]), radius=0.1, color=RED)

        # u1 距离标注（Brace）
        brace_u1 = Brace(
            Line(np.array([1.6, y_P_correct, 0]), np.array([1.6, y_L1, 0])),
            direction=RIGHT, color=RED
        )
        brace_u1_label = VGroup(
            MathTex(r"u_1=1.74\,\mathrm{cm}", color=RED).scale(0.5)
        ).next_to(brace_u1, RIGHT, buff=0.08)

        self.play(FadeIn(step8_txt))
        self.play(P_dot.animate.move_to(np.array([axis_x, y_P_correct, 0])),
                  P_label.animate.next_to(np.array([axis_x, y_P_correct, 0]), LEFT, buff=0.12),
                  run_time=1.8)
        self.play(GrowFromCenter(brace_u1), FadeIn(brace_u1_label))
        self.wait(1.5)

        # ══════════════════════════════════════════════════
        # Step 9: 三段关键距离叠加展示
        # ══════════════════════════════════════════════════
        step9_txt = Text("三段关键距离汇总", font=CJK, color=CYAN).scale(0.44)
        step9_txt.to_edge(DOWN, buff=1.1)

        # 镜筒光学长度 s = v1 - f2 (即从 L1 到 L2 的光学距离中 v1 部分)
        # 此处在右侧用文字标注
        dist_labels = VGroup(
            VGroup(
                Text("标本到物镜：", font=CJK, color=RED).scale(0.38),
                MathTex(r"u_1 = 1.74\,\mathrm{cm}", color=RED).scale(0.55),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                Text("物镜到目镜：", font=CJK, color=BLUE).scale(0.38),
                MathTex(r"L = 22.1\,\mathrm{cm}", color=BLUE).scale(0.55),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                Text("光学镜筒长度：", font=CJK, color=ORANGE).scale(0.38),
                MathTex(r"\delta = v_1 = 19.6\,\mathrm{cm}", color=ORANGE).scale(0.55),
            ).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        dist_labels.to_corner(DR, buff=0.4)

        # 清理右下角旧内容，显示新汇总
        self.play(FadeOut(u2_formula2), FadeOut(v1_formula_a), FadeOut(v1_formula_b))
        self.play(FadeIn(step9_txt))
        for dl in dist_labels:
            self.play(FadeIn(dl))
            self.wait(0.5)
        self.wait(1.5)

        # ══════════════════════════════════════════════════
        # Step 10: 清场，进入小结卡
        # ══════════════════════════════════════════════════
        diagram_all = VGroup(
            optical_axis, L1_line, L1_label, L2_line, L2_label,
            P_dot, P_label,
            brace_tube, brace_tube_label,
            u2_line, u2_text, v1_line, v1_text,
            brace_u1, brace_u1_label,
            lens_eq, rearr, sub_vals, final_u1, result_u1, box_result,
            step5_txt, step6_txt, step7_txt, step8_txt, step9_txt,
            dist_labels,
        )
        self.play(FadeOut(diagram_all))
        self.wait(0.4)

        # ══════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════
        s_title = Text("小结：显微镜标本位置计算", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.5)

        line1 = VGroup(
            Text("最终像在无穷远：", font=CJK).scale(0.44),
            MathTex(r"u_2 = f_2 = 2.5\,\mathrm{cm}", color=GREEN).scale(0.68),
        ).arrange(RIGHT, buff=0.18)

        line2 = VGroup(
            Text("物镜像距：", font=CJK).scale(0.44),
            MathTex(r"v_1 = L - f_2 = 19.6\,\mathrm{cm}", color=ORANGE).scale(0.68),
        ).arrange(RIGHT, buff=0.18)

        line3 = VGroup(
            Text("薄透镜公式：", font=CJK).scale(0.44),
            MathTex(r"\frac{1}{u_1}+\frac{1}{v_1}=\frac{1}{f_1}").scale(0.68),
        ).arrange(RIGHT, buff=0.18)

        line4 = VGroup(
            Text("标本物距：", font=CJK, color=YELLOW).scale(0.48),
            MathTex(r"u_1 = \frac{v_1 f_1}{v_1 - f_1} = 1.74\,\mathrm{cm}", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.18)

        summary = VGroup(line1, line2, line3, line4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.to_edge(LEFT, buff=1.0)

        box_summary = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        tip = Text("反推法：从最终成像条件出发，逐步推导每组透镜的物像关系。",
                   font=CJK, color=GREEN).scale(0.42)
        tip.next_to(box_summary, DOWN, buff=0.4)

        self.play(FadeIn(s_title))
        for line in summary:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.play(Create(box_summary))
        self.wait(0.6)
        self.play(FadeIn(tip))
        self.wait(2.2)

        # 结尾淡出
        self.play(FadeOut(VGroup(s_title, summary, box_summary, tip, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Ex1MicroscopeSpecimenPlacement",
        "id": "phys-ch10-10.4-ex1-microscope-specimen-placement",
        "chapterId": "ch10",
        "sectionId": "10.4",
        "title": "显微镜标本位置计算",
        "description": "光路反推法：已知镜筒总长与两组透镜焦距，逐步求出标本应放置在物镜下方 1.74 cm 处，使最终像成在无穷远。",
    },
]
