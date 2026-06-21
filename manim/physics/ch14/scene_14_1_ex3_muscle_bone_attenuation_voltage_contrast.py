"""第 14.1 节 · 例题3：肌肉与骨骼的衰减系数对比——选管电压。

物理直觉：X 射线穿过人体时，骨骼与肌肉对射线的衰减能力（线衰减系数 μ）之比
随管电压升高而下降。低压（软射线）时骨/肉对比度大 → 适合成像诊断；
高压（硬射线）时穿透力强但对比度弱 → 适合放疗穿透。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch14Ex3MuscleBoneAttenuationVoltageContrast",
        "id": "phys-ch14-14.1-ex3-muscle-bone-attenuation-voltage-contrast",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "肌肉与骨骼的衰减系数对比选管电压",
        "description": "通过柱形图与透过强度分布对比，直观说明低管电压（40 kV）时骨/肉衰减比达 6.09 → 成像对比度高，高管电压（150 kV）时比值降至 2.13 → 穿透力强但图像模糊，从而给出选管电压的临床原则。",
    }
]


class Ch14Ex3MuscleBoneAttenuationVoltageContrast(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text(
            "例题3：肌肉与骨骼衰减系数对比 · 选管电压",
            font=CJK, color=BLUE
        ).scale(0.58).to_edge(UP)
        subtitle = Text("第十四章 X射线与激光 · 14.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2 · 生活类比引入
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text(
            "拍骨折 X 光时，骨骼要看得清楚；",
            font=CJK
        ).scale(0.46)
        ana2 = Text(
            "放疗时射线却要穿透全身深处。",
            font=CJK
        ).scale(0.46)
        ana3 = Text(
            "管电压高低决定了射线「软硬」，从而决定对比度与穿透力。",
            font=CJK, color=YELLOW
        ).scale(0.46)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3 · 衰减定律公式
        # ═══════════════════════════════════════════════════════════════════
        law_label = Text("X 射线衰减定律", font=CJK, color=BLUE).scale(0.52)
        law_label.next_to(title, DOWN, buff=0.5)
        law_eq = MathTex(r"I = I_0\,e^{-\mu x}", color=YELLOW).scale(1.0)
        law_eq.next_to(law_label, DOWN, buff=0.4)

        mu_note = VGroup(
            Text("其中 ", font=CJK).scale(0.44),
            MathTex(r"\mu").scale(0.8),
            Text(" 为线衰减系数，", font=CJK).scale(0.44),
            MathTex(r"x").scale(0.8),
            Text(" 为穿透厚度", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.08)
        mu_note.next_to(law_eq, DOWN, buff=0.35)

        key_note = Text(
            "骨骼 μ 大 → 衰减强 → 透过光子少 → 成像亮区少（对比度高）",
            font=CJK, color=GREEN
        ).scale(0.42)
        key_note.next_to(mu_note, DOWN, buff=0.3)

        self.play(FadeIn(law_label))
        self.play(Write(law_eq))
        self.wait(1.0)
        self.play(FadeIn(mu_note))
        self.wait(0.8)
        self.play(FadeIn(key_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(law_label, law_eq, mu_note, key_note)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4 · 手部横截面示意图 + X 射线束
        # ═══════════════════════════════════════════════════════════════════
        cross_title = Text("手部横截面：X 射线穿透示意", font=CJK, color=BLUE).scale(0.50)
        cross_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(cross_title))

        # 外层肌肉椭圆（浅色）
        muscle_ellipse = Ellipse(width=2.6, height=1.6, color=ORANGE, fill_color=ORANGE,
                                 fill_opacity=0.25, stroke_width=2)
        muscle_ellipse.move_to(LEFT * 3.2 + DOWN * 0.6)

        # 内层骨骼椭圆（深色）
        bone_ellipse = Ellipse(width=1.1, height=0.7, color=WHITE, fill_color=GREY,
                               fill_opacity=0.75, stroke_width=2)
        bone_ellipse.move_to(muscle_ellipse.get_center())

        muscle_lbl = Text("肌肉", font=CJK, color=ORANGE).scale(0.38)
        muscle_lbl.next_to(muscle_ellipse, RIGHT, buff=0.12)
        bone_lbl = Text("骨骼", font=CJK, color=WHITE).scale(0.38)
        bone_lbl.move_to(bone_ellipse.get_center() + UP * 0.55)

        # X 射线束（从上向下竖直箭头群）
        ray_color = CYAN
        ray_arrows = VGroup()
        cx = muscle_ellipse.get_center()[0]
        top_y = muscle_ellipse.get_center()[1] + 1.55
        bot_y = muscle_ellipse.get_center()[1] - 1.55
        for dx in [-0.55, 0.0, 0.55]:
            arr = Arrow(
                start=np.array([cx + dx, top_y, 0]),
                end=np.array([cx + dx, bot_y, 0]),
                buff=0, color=ray_color, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.18
            )
            ray_arrows.add(arr)

        ray_label = VGroup(
            MathTex(r"I_0", color=CYAN).scale(0.55),
            Text("（入射强度）", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.06)
        ray_label.next_to(ray_arrows, UP, buff=0.12)

        xray_label = Text("X 射线束", font=CJK, color=CYAN).scale(0.40)
        xray_label.next_to(ray_arrows, RIGHT, buff=0.12)

        cross_group = VGroup(muscle_ellipse, bone_ellipse, muscle_lbl,
                             bone_lbl, ray_arrows, ray_label, xray_label)

        self.play(Create(muscle_ellipse), Create(bone_ellipse))
        self.play(FadeIn(muscle_lbl), FadeIn(bone_lbl))
        self.play(Create(ray_arrows), FadeIn(ray_label), FadeIn(xray_label))
        self.wait(1.5)

        # ═══════════════════════════════════════════════════════════════════
        # Step 5 · 衰减系数数值（逐步显示）
        # ═══════════════════════════════════════════════════════════════════
        data_title = Text("线衰减系数 μ 数值对比", font=CJK, color=BLUE).scale(0.48)
        data_title.next_to(title, DOWN, buff=0.45).shift(RIGHT * 2.5)

        row_40kv = VGroup(
            Text("40 kV :", font=CJK).scale(0.42),
            MathTex(r"\mu_b = 2.4434\times10^2\ \mathrm{m^{-1}}", color=WHITE).scale(0.56),
        ).arrange(RIGHT, buff=0.15)
        row_40kv_2 = VGroup(
            Text("      ", font=CJK).scale(0.42),
            MathTex(r"\mu_t = 0.4012\times10^2\ \mathrm{m^{-1}}", color=ORANGE).scale(0.56),
        ).arrange(RIGHT, buff=0.15)
        ratio_40 = VGroup(
            MathTex(r"\frac{\mu_b}{\mu_t}\bigg|_{40\,\mathrm{kV}}", color=YELLOW).scale(0.72),
            MathTex(r"=\frac{2.4434\times10^2}{0.4012\times10^2}\approx 6.09", color=YELLOW).scale(0.65),
        ).arrange(RIGHT, buff=0.12)

        row_150kv = VGroup(
            Text("150 kV :", font=CJK).scale(0.42),
            MathTex(r"\mu_b / \mu_t \approx 2.13", color=WHITE).scale(0.56),
        ).arrange(RIGHT, buff=0.15)

        data_block = VGroup(row_40kv, row_40kv_2, ratio_40, row_150kv).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        data_block.next_to(data_title, DOWN, buff=0.35)
        data_block.shift(RIGHT * 2.5)
        # Keep data block on right side of screen
        data_block.scale_to_fit_width(min(data_block.get_width(), 5.5))

        self.play(FadeIn(data_title))
        self.play(FadeIn(row_40kv))
        self.wait(0.5)
        self.play(FadeIn(row_40kv_2))
        self.wait(0.5)
        self.play(Write(ratio_40))
        self.wait(0.8)
        self.play(FadeIn(row_150kv))
        self.wait(1.8)

        # 清场（保留 title）
        self.play(FadeOut(cross_group), FadeOut(data_title),
                  FadeOut(data_block), FadeOut(cross_title))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6 · 柱形图：40 kV vs 150 kV 的 μ_骨/μ_肉
        # ═══════════════════════════════════════════════════════════════════
        bar_title = Text("骨/肉衰减系数比：管电压越高，对比度越低", font=CJK, color=BLUE).scale(0.48)
        bar_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(bar_title))

        # 手动绘制柱形图
        # 坐标系 baseline
        base_y = -1.8
        max_ratio = 6.5
        bar_height_scale = 2.2  # pixels per ratio unit
        bar_width = 0.9

        def make_bar(x_center, ratio, color_fill, label_ratio, label_voltage):
            h = ratio / max_ratio * bar_height_scale * max_ratio / max_ratio * 3.0
            # h proportional to ratio, max bar height = 3.0
            h = (ratio / max_ratio) * 3.0
            bar = Rectangle(width=bar_width, height=h, color=color_fill,
                             fill_color=color_fill, fill_opacity=0.75, stroke_width=1.5)
            bar.move_to(np.array([x_center, base_y + h / 2, 0]))
            # ratio label on top
            r_lbl = MathTex(str(label_ratio), color=color_fill).scale(0.65)
            r_lbl.next_to(bar, UP, buff=0.12)
            # voltage label below
            v_lbl = Text(label_voltage, font=CJK).scale(0.40)
            v_lbl.next_to(bar, DOWN, buff=0.18)
            return VGroup(bar, r_lbl, v_lbl)

        bar_40 = make_bar(-2.0, 6.09, YELLOW, "6.09", "40 kV")
        bar_150 = make_bar(2.0, 2.13, RED, "2.13", "150 kV")

        # Y axis
        y_axis = Arrow(
            start=np.array([-4.0, base_y, 0]),
            end=np.array([-4.0, base_y + 3.4, 0]),
            buff=0, color=WHITE, stroke_width=2,
            max_tip_length_to_length_ratio=0.10
        )
        y_label = VGroup(
            MathTex(r"\mu_b/\mu_t", color=WHITE).scale(0.55),
        )
        y_label.next_to(y_axis, UP, buff=0.08)

        # Baseline
        x_baseline = Line(
            start=np.array([-4.2, base_y, 0]),
            end=np.array([4.2, base_y, 0]),
            color=WHITE, stroke_width=1.5
        )

        # Annotation arrows
        arrow_diff = Arrow(
            start=np.array([0.2, base_y + 3.2, 0]),
            end=np.array([-0.8, base_y + 3.0, 0]),
            buff=0.05, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.25
        )
        ann_high = Text("对比度高！", font=CJK, color=GREEN).scale(0.42)
        ann_high.move_to(np.array([0.9, base_y + 3.3, 0]))

        arrow_low = Arrow(
            start=np.array([3.3, base_y + 1.5, 0]),
            end=np.array([2.7, base_y + 1.1, 0]),
            buff=0.05, color=RED, stroke_width=2,
            max_tip_length_to_length_ratio=0.25
        )
        ann_low = Text("对比度低", font=CJK, color=RED).scale(0.42)
        ann_low.move_to(np.array([3.8, base_y + 1.7, 0]))

        self.play(Create(x_baseline), Create(y_axis), FadeIn(y_label))
        self.play(FadeIn(bar_40))
        self.wait(0.8)
        self.play(FadeIn(bar_150))
        self.wait(0.8)
        self.play(FadeIn(ann_high), Create(arrow_diff))
        self.play(FadeIn(ann_low), Create(arrow_low))
        self.wait(2.0)

        bar_all = VGroup(bar_40, bar_150, y_axis, y_label, x_baseline,
                         arrow_diff, ann_high, arrow_low, ann_low)
        self.play(FadeOut(bar_all), FadeOut(bar_title))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7 · 透过强度分布对比（I vs x 曲线）
        # ═══════════════════════════════════════════════════════════════════
        int_title = Text("透过强度分布：骨/肌肉宽度 x 轴", font=CJK, color=BLUE).scale(0.48)
        int_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(int_title))

        # 用两组 Axes 并排展示 40kV 和 150kV
        ax_left = Axes(
            x_range=[0, 4, 1], y_range=[0, 1.1, 0.5],
            x_length=3.6, y_length=2.4,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False
        ).shift(LEFT * 3.0 + DOWN * 0.6)

        ax_right = Axes(
            x_range=[0, 4, 1], y_range=[0, 1.1, 0.5],
            x_length=3.6, y_length=2.4,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            tips=False
        ).shift(RIGHT * 3.0 + DOWN * 0.6)

        lbl_left = Text("40 kV（低压·软射线）", font=CJK, color=YELLOW).scale(0.40)
        lbl_left.next_to(ax_left, UP, buff=0.15)
        lbl_right = Text("150 kV（高压·硬射线）", font=CJK, color=RED).scale(0.40)
        lbl_right.next_to(ax_right, UP, buff=0.15)

        x_ax_lbl_l = Text("穿透厚度 x", font=CJK).scale(0.32)
        x_ax_lbl_l.next_to(ax_left, DOWN, buff=0.08)
        x_ax_lbl_r = Text("穿透厚度 x", font=CJK).scale(0.32)
        x_ax_lbl_r.next_to(ax_right, DOWN, buff=0.08)

        y_ax_lbl_l = VGroup(MathTex(r"I/I_0", color=WHITE).scale(0.45))
        y_ax_lbl_l.next_to(ax_left, LEFT, buff=0.10)
        y_ax_lbl_r = VGroup(MathTex(r"I/I_0", color=WHITE).scale(0.45))
        y_ax_lbl_r.next_to(ax_right, LEFT, buff=0.10)

        # 40 kV: μ_bone large → steep drop (μ_b~244, μ_t~40, normalised to visible range)
        # Use scaled μ values for visual demonstration: bone_40 drops steeply, tissue_40 moderate
        mu_b_40_vis = 1.4   # scaled for visibility
        mu_t_40_vis = 0.23  # scaled so ratio ~6.09

        mu_b_150_vis = 0.60  # scaled
        mu_t_150_vis = 0.28  # scaled, ratio ~2.13

        curve_bone_40 = ax_left.plot(
            lambda x: math.exp(-mu_b_40_vis * x),
            x_range=[0, 4], color=GREY_A, stroke_width=2.5
        )
        curve_tissue_40 = ax_left.plot(
            lambda x: math.exp(-mu_t_40_vis * x),
            x_range=[0, 4], color=ORANGE, stroke_width=2.5
        )
        curve_bone_150 = ax_right.plot(
            lambda x: math.exp(-mu_b_150_vis * x),
            x_range=[0, 4], color=GREY_A, stroke_width=2.5
        )
        curve_tissue_150 = ax_right.plot(
            lambda x: math.exp(-mu_t_150_vis * x),
            x_range=[0, 4], color=ORANGE, stroke_width=2.5
        )

        legend_bone_l = VGroup(
            Line(ORIGIN, RIGHT * 0.35, color=GREY_A, stroke_width=2.5),
            Text("骨骼", font=CJK).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        legend_tissue_l = VGroup(
            Line(ORIGIN, RIGHT * 0.35, color=ORANGE, stroke_width=2.5),
            Text("肌肉", font=CJK).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        legend_l = VGroup(legend_bone_l, legend_tissue_l).arrange(DOWN, buff=0.12)
        legend_l.next_to(ax_left, RIGHT, buff=0.08).shift(UP * 0.2)

        legend_bone_r = VGroup(
            Line(ORIGIN, RIGHT * 0.35, color=GREY_A, stroke_width=2.5),
            Text("骨骼", font=CJK).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        legend_tissue_r = VGroup(
            Line(ORIGIN, RIGHT * 0.35, color=ORANGE, stroke_width=2.5),
            Text("肌肉", font=CJK).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        legend_r = VGroup(legend_bone_r, legend_tissue_r).arrange(DOWN, buff=0.12)
        legend_r.next_to(ax_right, RIGHT, buff=0.08).shift(UP * 0.2)

        # Contrast annotation
        ann_contrast_high = Text("曲线差距大\n→ 成像对比度高", font=CJK, color=YELLOW).scale(0.36)
        ann_contrast_high.next_to(ax_left, DOWN, buff=0.55)
        ann_contrast_low = Text("曲线差距小\n→ 成像对比度低", font=CJK, color=RED).scale(0.36)
        ann_contrast_low.next_to(ax_right, DOWN, buff=0.55)

        self.play(Create(ax_left), Create(ax_right))
        self.play(FadeIn(lbl_left), FadeIn(lbl_right),
                  FadeIn(x_ax_lbl_l), FadeIn(x_ax_lbl_r),
                  FadeIn(y_ax_lbl_l), FadeIn(y_ax_lbl_r))
        self.wait(0.5)
        self.play(Create(curve_bone_40), Create(curve_tissue_40),
                  Create(curve_bone_150), Create(curve_tissue_150))
        self.play(FadeIn(legend_l), FadeIn(legend_r))
        self.wait(1.0)
        self.play(FadeIn(ann_contrast_high), FadeIn(ann_contrast_low))
        self.wait(2.0)

        intensity_all = VGroup(
            ax_left, ax_right, lbl_left, lbl_right,
            x_ax_lbl_l, x_ax_lbl_r, y_ax_lbl_l, y_ax_lbl_r,
            curve_bone_40, curve_tissue_40, curve_bone_150, curve_tissue_150,
            legend_l, legend_r, ann_contrast_high, ann_contrast_low
        )
        self.play(FadeOut(intensity_all), FadeOut(int_title))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8 · 关键公式推导回顾（分步高亮）
        # ═══════════════════════════════════════════════════════════════════
        deriv_title = Text("关键公式推导", font=CJK, color=BLUE).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        eq1 = MathTex(r"I = I_0\,e^{-\mu x}", color=WHITE).scale(0.85)
        eq1.next_to(deriv_title, DOWN, buff=0.5)

        note_eq1 = VGroup(
            Text("衰减定律：骨骼 μ 大 → ", font=CJK).scale(0.44),
            MathTex(r"e^{-\mu x}", color=YELLOW).scale(0.75),
            Text(" 更小 → 穿透强度极弱", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.08)
        note_eq1.next_to(eq1, DOWN, buff=0.3)

        eq2 = MathTex(
            r"\frac{\mu_b}{\mu_t}\bigg|_{40\,\mathrm{kV}}",
            r"= \frac{2.4434\times10^2}{0.4012\times10^2}",
            r"\approx 6.09"
        ).scale(0.78)
        eq2.next_to(note_eq1, DOWN, buff=0.4)
        eq2[0].set_color(YELLOW)
        eq2[2].set_color(GREEN)

        eq3 = MathTex(
            r"\frac{\mu_b}{\mu_t}\bigg|_{150\,\mathrm{kV}}",
            r"\approx 2.13"
        ).scale(0.78)
        eq3.next_to(eq2, DOWN, buff=0.3)
        eq3[0].set_color(RED)
        eq3[1].set_color(ORANGE)

        compare_note = VGroup(
            MathTex(r"6.09 \gg 2.13", color=YELLOW).scale(0.75),
            Text("  →  低压对比度远优于高压", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.12)
        compare_note.next_to(eq3, DOWN, buff=0.35)

        self.play(Write(eq1))
        self.wait(0.8)
        self.play(FadeIn(note_eq1))
        self.wait(1.0)
        self.play(Write(eq2))
        self.wait(1.0)
        self.play(Write(eq3))
        self.wait(0.8)
        self.play(FadeIn(compare_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(deriv_title, eq1, note_eq1, eq2, eq3, compare_note)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 9 · ValueTracker 演示：μ 比随管电压变化趋势
        # ═══════════════════════════════════════════════════════════════════
        trend_title = Text("管电压升高 → μ 比下降 → 对比度下降", font=CJK, color=BLUE).scale(0.48)
        trend_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(trend_title))

        # 简单折线图：两点已知 (40, 6.09) 和 (150, 2.13)
        # 用 Axes 绘制，并用一个移动点 + ValueTracker 演示
        ax_trend = Axes(
            x_range=[30, 160, 20],
            y_range=[1.5, 7.0, 1],
            x_length=5.5,
            y_length=3.0,
            axis_config={"color": WHITE, "stroke_width": 1.5},
            x_axis_config={"numbers_to_include": [40, 80, 120, 150]},
            y_axis_config={"numbers_to_include": [2, 4, 6]},
            tips=False,
        ).next_to(trend_title, DOWN, buff=0.45)

        x_ax_lbl_trend = Text("管电压 (kV)", font=CJK).scale(0.36)
        x_ax_lbl_trend.next_to(ax_trend, DOWN, buff=0.08)
        y_ax_lbl_trend = VGroup(
            MathTex(r"\mu_b/\mu_t", color=WHITE).scale(0.48),
        )
        y_ax_lbl_trend.next_to(ax_trend, LEFT, buff=0.12)

        # Interpolate linearly between (40, 6.09) and (150, 2.13)
        def ratio_func(kv):
            return 6.09 + (2.13 - 6.09) / (150 - 40) * (kv - 40)

        trend_line = ax_trend.plot(
            ratio_func, x_range=[40, 150], color=CYAN, stroke_width=2.5
        )

        dot_40 = Dot(ax_trend.c2p(40, 6.09), color=YELLOW, radius=0.12)
        dot_150 = Dot(ax_trend.c2p(150, 2.13), color=RED, radius=0.12)
        lbl_dot_40 = VGroup(
            Text("40 kV, ", font=CJK).scale(0.36),
            MathTex(r"ratio=6.09", color=YELLOW).scale(0.48),
        ).arrange(RIGHT, buff=0.05)
        lbl_dot_40.next_to(dot_40, UP, buff=0.12)
        lbl_dot_150 = VGroup(
            Text("150 kV, ", font=CJK).scale(0.36),
            MathTex(r"ratio=2.13", color=RED).scale(0.48),
        ).arrange(RIGHT, buff=0.05)
        lbl_dot_150.next_to(dot_150, DOWN, buff=0.12)

        kv_tracker = ValueTracker(40)
        moving_dot = always_redraw(
            lambda: Dot(
                ax_trend.c2p(kv_tracker.get_value(), ratio_func(kv_tracker.get_value())),
                color=ORANGE, radius=0.10
            )
        )
        kv_readout = always_redraw(
            lambda: VGroup(
                Text("电压 = ", font=CJK).scale(0.40),
                MathTex(rf"{kv_tracker.get_value():.0f}\ \mathrm{{kV}}", color=ORANGE).scale(0.55),
                Text("  比值 = ", font=CJK).scale(0.40),
                MathTex(rf"{ratio_func(kv_tracker.get_value()):.2f}", color=ORANGE).scale(0.55),
            ).arrange(RIGHT, buff=0.08).to_corner(DR, buff=0.5)
        )

        self.play(Create(ax_trend), FadeIn(x_ax_lbl_trend), FadeIn(y_ax_lbl_trend))
        self.play(Create(trend_line))
        self.play(FadeIn(dot_40), FadeIn(dot_150), FadeIn(lbl_dot_40), FadeIn(lbl_dot_150))
        self.add(moving_dot, kv_readout)
        self.wait(0.5)
        self.play(kv_tracker.animate.set_value(150), run_time=3.5)
        self.wait(0.8)
        self.play(kv_tracker.animate.set_value(40), run_time=2.0)
        self.wait(1.2)

        trend_all = VGroup(
            ax_trend, x_ax_lbl_trend, y_ax_lbl_trend,
            trend_line, dot_40, dot_150, lbl_dot_40, lbl_dot_150,
            moving_dot, kv_readout
        )
        self.play(FadeOut(trend_all), FadeOut(trend_title))

        # ═══════════════════════════════════════════════════════════════════
        # Step 10 · 临床选管电压原则
        # ═══════════════════════════════════════════════════════════════════
        clinic_title = Text("临床选管电压原则", font=CJK, color=BLUE).scale(0.52)
        clinic_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(clinic_title))

        rule1_icon = Text("[诊断]", font=CJK, color=YELLOW).scale(0.48)
        rule1_text = Text(
            "选低管电压（软射线）：骨/肉对比度高，骨折/病灶清晰可见",
            font=CJK
        ).scale(0.44)
        rule1 = VGroup(rule1_icon, rule1_text).arrange(RIGHT, buff=0.18)

        rule2_icon = Text("[治疗]", font=CJK, color=RED).scale(0.48)
        rule2_text = Text(
            "选高管电压（硬射线）：穿透力强，可到达深部肿瘤组织",
            font=CJK
        ).scale(0.44)
        rule2 = VGroup(rule2_icon, rule2_text).arrange(RIGHT, buff=0.18)

        rule3 = VGroup(
            MathTex(r"\mu \uparrow \Rightarrow", color=YELLOW).scale(0.70),
            Text(" 衰减大，对比度高，但穿透弱", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.10)
        rule4 = VGroup(
            MathTex(r"\mu \downarrow \Rightarrow", color=RED).scale(0.70),
            Text(" 衰减小，穿透强，但图像模糊", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.10)

        rules = VGroup(rule1, rule2, rule3, rule4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        rules.next_to(clinic_title, DOWN, buff=0.45)
        rules.scale_to_fit_width(min(rules.get_width(), 11.5))

        self.play(FadeIn(rule1))
        self.wait(1.0)
        self.play(FadeIn(rule2))
        self.wait(1.0)
        self.play(FadeIn(rule3), FadeIn(rule4))
        self.wait(1.8)
        self.play(FadeOut(rules), FadeOut(clinic_title))

        # ═══════════════════════════════════════════════════════════════════
        # Step 11 · 小结卡（关键公式 + 结论框）
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s_eq1 = MathTex(r"I = I_0\,e^{-\mu x}", color=YELLOW).scale(0.85)
        s_eq2 = VGroup(
            MathTex(r"\left.\frac{\mu_b}{\mu_t}\right|_{40\,\mathrm{kV}}", color=YELLOW).scale(0.78),
            MathTex(r"\approx 6.09", color=GREEN).scale(0.78),
            Text("  （对比度高）", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.10)
        s_eq3 = VGroup(
            MathTex(r"\left.\frac{\mu_b}{\mu_t}\right|_{150\,\mathrm{kV}}", color=RED).scale(0.78),
            MathTex(r"\approx 2.13", color=ORANGE).scale(0.78),
            Text("  （对比度低）", font=CJK, color=ORANGE).scale(0.44),
        ).arrange(RIGHT, buff=0.10)
        s_conc = Text(
            "诊断应选低管电压（软射线）；治疗穿透要求高时才用高管电压",
            font=CJK, color=GREEN
        ).scale(0.44)

        s_group = VGroup(s_eq1, s_eq2, s_eq3, s_conc).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s_group.next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(min(s_group.get_width(), 11.5))

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s_eq1))
        self.wait(0.6)
        self.play(FadeIn(s_eq2))
        self.wait(0.6)
        self.play(FadeIn(s_eq3))
        self.wait(0.6)
        self.play(FadeIn(s_conc))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.3)
