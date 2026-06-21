"""第 12.4 节 · 例题：无限深势阱基态粒子在中间半区的出现概率

可视化流程：
  1. 标题 + 副标题
  2. 生活类比引入（盒子里的粒子不均匀分布）
  3. 势阱示意 + 波函数 psi1(x) 图形
  4. 写出积分表达式 P = ∫ |psi1|^2 dx（逐行）
  5. 代入 sin^2 公式展开（逐步高亮）
  6. 面积动画：|psi1|^2 曲线，橙色填充中间 50% 区间，标注 82%
  7. 经典对比：均匀分布虚线，标注 50%
  8. 量子直觉说明：驻波峰在中部
  9. 小结卡

铁律：MathTex 内只能含纯 ASCII LaTeX，中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"
ORANGE_FILL = "#FF8C00"


class Ch12Ex1SquareWellProbabilityIntegral(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────────
        title = Text(
            "例：势阱基态粒子在中间半区的出现概率",
            font=CJK, color=BLUE
        ).scale(0.58).to_edge(UP)
        subtitle = Text("第12章 量子力学初步 · 12.4", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────────
        ana1 = Text("设想把一个粒子关在宽度为 a 的盒子里——", font=CJK).scale(0.48)
        ana2 = Text("经典力学预测：粒子在盒子任意位置出现概率相同，", font=CJK).scale(0.48)
        ana3 = Text("中间一半区域的概率恰好是 50%。", font=CJK).scale(0.48)
        ana4 = Text("但量子力学给出完全不同的答案！", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55)
        ana_group.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(0.5)
        self.play(FadeIn(ana4))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ── Step 3: 势阱示意 + 基态波函数图像 ─────────────────────────────
        axes = Axes(
            x_range=[0, 1.0, 0.25],
            y_range=[-0.1, 1.65, 0.5],
            x_length=7.0,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.9 + LEFT * 1.0)

        x_label = MathTex(r"x").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)
        y_label = MathTex(r"\psi_1(x)").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.18)

        # 刻度标注 0, a/4, a/2, 3a/4, a
        tick_labels = VGroup(
            MathTex(r"0").scale(0.45).next_to(axes.c2p(0, 0), DOWN, buff=0.12),
            MathTex(r"\tfrac{a}{4}").scale(0.42).next_to(axes.c2p(0.25, 0), DOWN, buff=0.12),
            MathTex(r"\tfrac{a}{2}").scale(0.42).next_to(axes.c2p(0.5, 0), DOWN, buff=0.12),
            MathTex(r"\tfrac{3a}{4}").scale(0.42).next_to(axes.c2p(0.75, 0), DOWN, buff=0.12),
            MathTex(r"a").scale(0.45).next_to(axes.c2p(1.0, 0), DOWN, buff=0.12),
        )

        # 波函数 psi1(x) = sqrt(2/a)*sin(pi*x/a)，令 a=1 归一化到合理振幅
        # sqrt(2/1)*sin(pi*x) 峰值约 1.414，缩放至 1.2 显示
        def psi1(x):
            return math.sqrt(2.0) * math.sin(math.pi * x)

        wave_curve = axes.plot(psi1, x_range=[0.0, 1.0, 0.005], color=YELLOW)

        # 波函数标注
        psi_label = MathTex(
            r"\psi_1(x)=\sqrt{\frac{2}{a}}\sin\frac{\pi x}{a}"
        ).scale(0.52).set_color(YELLOW)
        psi_label.next_to(axes, RIGHT, buff=0.35).shift(UP * 0.8)
        psi_label.scale_to_fit_width(3.5)

        # 势阱左右壁（竖线）
        wall_left = Line(axes.c2p(0, 0), axes.c2p(0, 1.6), color=WHITE, stroke_width=3)
        wall_right = Line(axes.c2p(1.0, 0), axes.c2p(1.0, 1.6), color=WHITE, stroke_width=3)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(wall_left), Create(wall_right))
        self.play(FadeIn(tick_labels))
        self.play(Create(wave_curve), FadeIn(psi_label))
        self.wait(1.5)

        # 橙色阴影：a/4 到 3a/4 区间下波函数
        orange_fill = axes.get_area(wave_curve, x_range=[0.25, 0.75], color=ORANGE_FILL, opacity=0.35)
        shade_label = Text("中间 1/2 区间", font=CJK, color=ORANGE_FILL).scale(0.42)
        shade_label.next_to(axes.c2p(0.5, 1.6), UP, buff=0.12)
        self.play(FadeIn(orange_fill), FadeIn(shade_label))
        self.wait(1.5)

        # 清场（保留 axes 框架供后续面积动画使用，先淡出波函数相关）
        self.play(
            FadeOut(VGroup(wave_curve, orange_fill, shade_label, psi_label,
                           wall_left, wall_right, tick_labels,
                           axes, x_label, y_label))
        )

        # ── Step 4: 写出积分表达式（逐行）──────────────────────────────────
        step_title = Text("建立积分", font=CJK, color=CYAN).scale(0.5)
        step_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(step_title))

        eq1_zh = Text("中间半区的概率为：", font=CJK).scale(0.45)
        eq1 = MathTex(
            r"P = \int_{a/4}^{3a/4} |\psi_1(x)|^2 \, \mathrm{d}x"
        ).scale(0.82)
        row1 = VGroup(eq1_zh, eq1).arrange(RIGHT, buff=0.3)
        row1.next_to(step_title, DOWN, buff=0.5)

        eq2_zh = Text("代入基态波函数：", font=CJK).scale(0.45)
        eq2 = MathTex(
            r"P = \int_{a/4}^{3a/4} \frac{2}{a} \sin^2\!\frac{\pi x}{a} \, \mathrm{d}x"
        ).scale(0.78)
        row2 = VGroup(eq2_zh, eq2).arrange(RIGHT, buff=0.3)
        row2.next_to(row1, DOWN, buff=0.45)

        self.play(FadeIn(eq1_zh), Write(eq1))
        self.wait(1.2)
        self.play(FadeIn(eq2_zh), Write(eq2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(step_title, row1, row2)))

        # ── Step 5: 逐步展开积分（sin²公式）──────────────────────────────────
        step_title2 = Text("展开计算", font=CJK, color=CYAN).scale(0.5)
        step_title2.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(step_title2))

        # 换元 u = pi*x/a
        s1_zh = Text("令", font=CJK).scale(0.44)
        s1 = MathTex(r"u = \frac{\pi x}{a}", r"\quad\Rightarrow\quad",
                     r"\mathrm{d}x = \frac{a}{\pi}\mathrm{d}u").scale(0.72)
        s1[0].set_color(YELLOW)
        row_s1 = VGroup(s1_zh, s1).arrange(RIGHT, buff=0.2)
        row_s1.next_to(step_title2, DOWN, buff=0.45)

        self.play(FadeIn(s1_zh), Write(s1))
        self.wait(1.0)

        # 利用 sin^2 公式
        s2_hint = Text("利用半角公式：", font=CJK).scale(0.44)
        s2 = MathTex(
            r"\sin^2 u = \frac{1}{2} - \frac{1}{2}\cos 2u"
        ).scale(0.75).set_color(GREEN)
        row_s2 = VGroup(s2_hint, s2).arrange(RIGHT, buff=0.25)
        row_s2.next_to(row_s1, DOWN, buff=0.38)

        self.play(FadeIn(s2_hint), Write(s2))
        self.wait(1.0)

        # 积分结果
        s3_zh = Text("积分展开后得：", font=CJK).scale(0.44)
        s3 = MathTex(
            r"P = \frac{2}{\pi}\!\int_{\pi/4}^{3\pi/4}\!\left(\frac{1}{2}-\frac{1}{2}\cos 2u\right)\!\mathrm{d}u"
        ).scale(0.70).set_color(WHITE)
        row_s3 = VGroup(s3_zh, s3).arrange(RIGHT, buff=0.2)
        row_s3.next_to(row_s2, DOWN, buff=0.38)
        row_s3.scale_to_fit_width(13.0)

        self.play(FadeIn(s3_zh), Write(s3))
        self.wait(1.0)

        # 最终数值
        s4_zh = Text("计算得：", font=CJK).scale(0.44)
        s4 = MathTex(
            r"P = \frac{1}{2} + \frac{1}{\pi} \approx 0.818"
        ).scale(0.88).set_color(ORANGE_FILL)
        s4_big = VGroup(s4_zh, s4).arrange(RIGHT, buff=0.25)
        s4_big.next_to(row_s3, DOWN, buff=0.42)

        self.play(FadeIn(s4_zh), Write(s4))
        self.wait(2.0)
        self.play(FadeOut(VGroup(step_title2, row_s1, row_s2, row_s3, s4_big)))

        # ── Step 6: 面积动画—— |ψ₁|² 归一化 + 橙色82%面积 ───────────────────
        step_title3 = Text("几何直觉：概率密度面积", font=CJK, color=CYAN).scale(0.5)
        step_title3.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step_title3))

        axes2 = Axes(
            x_range=[0, 1.0, 0.25],
            y_range=[0, 2.2, 0.5],
            x_length=7.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 1.0 + LEFT * 1.2)

        x_lbl2 = MathTex(r"x").scale(0.52).next_to(axes2.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl2 = MathTex(r"|\psi_1|^2").scale(0.52).next_to(axes2.y_axis.get_end(), LEFT, buff=0.18)

        tick_lbl2 = VGroup(
            MathTex(r"0").scale(0.42).next_to(axes2.c2p(0, 0), DOWN, buff=0.1),
            MathTex(r"\frac{a}{4}").scale(0.40).next_to(axes2.c2p(0.25, 0), DOWN, buff=0.1),
            MathTex(r"\frac{3a}{4}").scale(0.40).next_to(axes2.c2p(0.75, 0), DOWN, buff=0.1),
            MathTex(r"a").scale(0.42).next_to(axes2.c2p(1.0, 0), DOWN, buff=0.1),
        )

        def psi1_sq(x):
            return 2.0 * (math.sin(math.pi * x) ** 2)

        prob_curve = axes2.plot(psi1_sq, x_range=[0.0, 1.0, 0.005], color=YELLOW)

        # 归一化整体灰色面积
        full_area = axes2.get_area(prob_curve, x_range=[0.0, 1.0], color=GREY, opacity=0.25)

        # 橙色中间区间
        orange_area = axes2.get_area(
            prob_curve, x_range=[0.25, 0.75], color=ORANGE_FILL, opacity=0.50
        )
        # 灰色两侧残余
        grey_left = axes2.get_area(prob_curve, x_range=[0.0, 0.25], color=GREY, opacity=0.45)
        grey_right = axes2.get_area(prob_curve, x_range=[0.75, 1.0], color=GREY, opacity=0.45)

        wall2_l = Line(axes2.c2p(0, 0), axes2.c2p(0, 2.1), color=WHITE, stroke_width=2.5)
        wall2_r = Line(axes2.c2p(1.0, 0), axes2.c2p(1.0, 2.1), color=WHITE, stroke_width=2.5)

        # 百分比标注
        pct_orange = Text("82%", font=CJK, color=ORANGE_FILL).scale(0.65)
        pct_orange.move_to(axes2.c2p(0.5, 1.2))

        pct_grey_l = Text("9%", font=CJK, color=GREY).scale(0.50)
        pct_grey_l.move_to(axes2.c2p(0.125, 0.55))
        pct_grey_r = Text("9%", font=CJK, color=GREY).scale(0.50)
        pct_grey_r.move_to(axes2.c2p(0.875, 0.55))

        self.play(Create(axes2), FadeIn(x_lbl2), FadeIn(y_lbl2), FadeIn(tick_lbl2))
        self.play(Create(wall2_l), Create(wall2_r))
        self.play(Create(prob_curve))
        self.play(FadeIn(full_area))
        self.wait(0.8)

        # 先展示两侧灰色（18%）
        self.play(FadeOut(full_area), FadeIn(grey_left), FadeIn(grey_right))
        self.play(FadeIn(pct_grey_l), FadeIn(pct_grey_r))
        self.wait(0.8)

        # 再填充橙色中部（82%）
        self.play(FadeIn(orange_area), FadeIn(pct_orange))
        self.wait(1.8)

        # 文字说明
        note_norm = Text("归一化保证总面积 = 1（总概率100%）", font=CJK, color=GREEN).scale(0.42)
        note_norm.next_to(axes2, RIGHT, buff=0.3).shift(UP * 0.5)
        note_norm.scale_to_fit_width(3.8)
        self.play(FadeIn(note_norm))
        self.wait(1.5)

        self.play(
            FadeOut(VGroup(
                axes2, x_lbl2, y_lbl2, tick_lbl2,
                prob_curve, full_area, orange_area, grey_left, grey_right,
                pct_orange, pct_grey_l, pct_grey_r,
                wall2_l, wall2_r, note_norm, step_title3
            ))
        )

        # ── Step 7: 经典对比——均匀分布虚线 ────────────────────────────────
        step_title4 = Text("量子 vs 经典对比", font=CJK, color=CYAN).scale(0.50)
        step_title4.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step_title4))

        axes3 = Axes(
            x_range=[0, 1.0, 0.25],
            y_range=[0, 2.4, 0.5],
            x_length=7.5,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 1.05 + LEFT * 1.2)

        x_lbl3 = MathTex(r"x").scale(0.52).next_to(axes3.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl3 = MathTex(r"\rho(x)").scale(0.52).next_to(axes3.y_axis.get_end(), LEFT, buff=0.18)

        # 量子概率密度曲线（黄色）
        qm_curve = axes3.plot(psi1_sq, x_range=[0.0, 1.0, 0.005], color=YELLOW)

        # 经典均匀分布虚线（常数=1）
        classical_line = DashedLine(
            axes3.c2p(0.0, 1.0), axes3.c2p(1.0, 1.0),
            color=CYAN, dash_length=0.18, stroke_width=2.5
        )

        # 橙色量子区间
        qm_orange = axes3.get_area(qm_curve, x_range=[0.25, 0.75], color=ORANGE_FILL, opacity=0.40)

        # 经典区间面积（矩形，从0.25到0.75，高度1）— 用 Polygon 绘制
        classical_rect = Polygon(
            axes3.c2p(0.25, 0.0),
            axes3.c2p(0.75, 0.0),
            axes3.c2p(0.75, 1.0),
            axes3.c2p(0.25, 1.0),
            color=CYAN, fill_color=CYAN, fill_opacity=0.25, stroke_width=0
        )

        # 标注
        lbl_qm = VGroup(
            Text("量子：", font=CJK, color=ORANGE_FILL).scale(0.46),
            MathTex(r"P \approx 82\%").scale(0.60).set_color(ORANGE_FILL),
        ).arrange(RIGHT, buff=0.1)

        lbl_cl = VGroup(
            Text("经典：", font=CJK, color=CYAN).scale(0.46),
            MathTex(r"P = 50\%").scale(0.60).set_color(CYAN),
        ).arrange(RIGHT, buff=0.1)

        lbl_group = VGroup(lbl_qm, lbl_cl).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        lbl_group.next_to(axes3, RIGHT, buff=0.35).shift(UP * 0.6)
        lbl_group.scale_to_fit_width(3.6)

        wall3_l = Line(axes3.c2p(0, 0), axes3.c2p(0, 2.2), color=WHITE, stroke_width=2.5)
        wall3_r = Line(axes3.c2p(1.0, 0), axes3.c2p(1.0, 2.2), color=WHITE, stroke_width=2.5)

        self.play(Create(axes3), FadeIn(x_lbl3), FadeIn(y_lbl3))
        self.play(Create(wall3_l), Create(wall3_r))

        # 先显示经典均匀（虚线 + 矩形）
        self.play(Create(classical_line), FadeIn(classical_rect), FadeIn(lbl_cl))
        self.wait(1.0)

        # 再叠加量子曲线
        self.play(Create(qm_curve), FadeIn(qm_orange), FadeIn(lbl_qm))
        self.wait(2.0)

        # 量子峰在中间的说明文字
        peak_note = Text("量子驻波概率密度峰在势阱中部，边缘趋向零", font=CJK, color=GREEN).scale(0.42)
        peak_note.next_to(axes3, DOWN, buff=0.3)
        peak_note.scale_to_fit_width(11.0)
        self.play(FadeIn(peak_note))
        self.wait(2.0)

        self.play(
            FadeOut(VGroup(
                axes3, x_lbl3, y_lbl3,
                qm_curve, qm_orange, classical_line, classical_rect,
                lbl_group, wall3_l, wall3_r, peak_note, step_title4
            ))
        )

        # ── Step 8: 量子直觉说明 ─────────────────────────────────────────
        step_title5 = Text("物理直觉：为什么是 82%？", font=CJK, color=CYAN).scale(0.50)
        step_title5.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(step_title5))

        insight_lines = [
            Text("基态驻波 sin(πx/a) 在 x=a/2 处取极大值，", font=CJK).scale(0.46),
            Text("概率密度 |ψ₁|² 的峰值也在势阱正中央。", font=CJK).scale(0.46),
            Text("粒子「偏爱」在中部停留——这不是巧合，", font=CJK).scale(0.46),
            Text("而是量子驻波节点和峰值的必然结构。", font=CJK, color=YELLOW).scale(0.46),
            Text("边界条件 ψ(0)=ψ(a)=0 迫使波函数在两端为零，", font=CJK).scale(0.46),
            Text("所以粒子在边缘出现的概率极小。", font=CJK, color=GREEN).scale(0.46),
        ]
        insight = VGroup(*insight_lines).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        insight.next_to(step_title5, DOWN, buff=0.45)
        insight.scale_to_fit_width(13.0)

        for line in insight_lines:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.5)
        self.play(FadeOut(VGroup(step_title5, insight)))

        # ── Step 9: 小结卡 ────────────────────────────────────────────────
        s_title = Text("小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.48)
        self.play(FadeIn(s_title))

        # 关键公式
        sf1 = MathTex(
            r"P = \int_{a/4}^{3a/4}\frac{2}{a}\sin^2\!\frac{\pi x}{a}\,\mathrm{d}x"
        ).scale(0.75).set_color(YELLOW)

        sf2 = MathTex(
            r"P = \frac{1}{2} + \frac{1}{\pi} \approx 0.818"
        ).scale(0.80).set_color(ORANGE_FILL)

        # 文字结论列表
        sc1 = VGroup(
            Text("量子预测：82%（", font=CJK, color=ORANGE_FILL).scale(0.45),
            MathTex(r"\gg").scale(0.55),
            Text("经典 50%）", font=CJK, color=CYAN).scale(0.45),
        ).arrange(RIGHT, buff=0.1)

        sc2 = Text("原因：驻波概率密度峰值集中在势阱中部", font=CJK, color=GREEN).scale(0.44)
        sc3 = Text("边界条件 ψ=0 保证粒子在两端出现概率为零", font=CJK, color=WHITE).scale(0.42)

        summary_content = VGroup(sf1, sf2, sc1, sc2, sc3).arrange(DOWN, buff=0.35)
        summary_content.next_to(s_title, DOWN, buff=0.40)
        summary_content.scale_to_fit_width(12.8)

        box = SurroundingRectangle(summary_content, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(sf1))
        self.wait(0.8)
        self.play(Write(sf2))
        self.wait(0.8)
        self.play(FadeIn(sc1))
        self.wait(0.6)
        self.play(FadeIn(sc2))
        self.wait(0.6)
        self.play(FadeIn(sc3))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary_content, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch12Ex1SquareWellProbabilityIntegral",
        "id": "phys-ch12-12.4-ex1-square-well-probability-integral",
        "chapterId": "ch12",
        "sectionId": "12.4",
        "title": "例：势阱基态粒子在中间半区的出现概率",
        "description": "无限深势阱基态驻波 sin(πx/a) 的概率密度积分：量子给出82%，对比经典50%，揭示驻波峰在势阱中部的物理直觉。",
    }
]
