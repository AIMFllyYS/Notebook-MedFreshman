"""第 11.1 节 · 例题：薄膜干涉 —— 反射最强/最弱时的最小膜厚。

可视化方案：
  Step 1  标题 + 生活类比（肥皂泡彩色条纹）
  Step 2  绘制三层光路图（空气/薄膜 n=1.54/空气），标注两束反射光
  Step 3  推导光程差方程 δ = 2ne + λ/2（半波损失动画）
  Step 4  反射最强（加强）条件 → e_min = λ/(4n) = 97.4 nm
  Step 5  在光路图上标注 97.4 nm 膜厚
  Step 6  切换：反射最弱（相消）条件 → e_min = λ/(2n) = 195 nm
  Step 7  横向对比两个结果，强调半波损失的关键作用
  Step 8  小结卡（关键公式汇总 + 方框）

铁律：MathTex 内只有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ──────────────────────────────────────────────
N_FILM = 1.54          # 薄膜折射率
LAM = 600              # 入射光波长 nm
E_STRONG = LAM / (4 * N_FILM)   # ≈ 97.4 nm
E_WEAK   = LAM / (2 * N_FILM)   # ≈ 194.8 nm


def make_layer_rect(width, height, color, opacity=0.35):
    """创建一个代表薄膜层的矩形（带填充）。"""
    rect = Rectangle(width=width, height=height, color=color,
                     fill_color=color, fill_opacity=opacity,
                     stroke_width=1.5)
    return rect


class Ch11Ex1ThinFilmMinThickness(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════
        # Step 1：标题 + 生活类比
        # ══════════════════════════════════════════════════
        title = Text("例题：薄膜干涉最小膜厚", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第十一章 波动光学 · 11.1  薄膜干涉", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.0)
        self.play(FadeOut(subtitle))

        analogy1 = Text("生活中的彩色条纹——", font=CJK, color=CYAN).scale(0.48)
        analogy2 = Text("肥皂泡、水面油膜在白光下呈现彩虹，", font=CJK).scale(0.45)
        analogy3 = Text("根源是光在薄膜上下两面反射后叠加干涉。", font=CJK).scale(0.45)
        analogy = VGroup(analogy1, analogy2, analogy3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.5)
        for item in analogy:
            self.play(FadeIn(item, shift=RIGHT * 0.3))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════
        # Step 2：绘制三层光路图
        # ══════════════════════════════════════════════════
        W = 7.0    # 层宽
        H_AIR  = 0.9
        H_FILM = 1.3
        # 层：上空气 / 薄膜 / 下空气  ── 从上到下排列
        y_top_air   =  1.6
        y_film      =  y_top_air  - H_AIR  - H_FILM / 2   # 薄膜中心
        y_bot_air   =  y_film - H_FILM / 2 - H_AIR / 2

        rect_top_air  = make_layer_rect(W, H_AIR,  WHITE,  opacity=0.06).move_to([0, y_top_air - H_AIR/2, 0])
        rect_film     = make_layer_rect(W, H_FILM, "#4488FF", opacity=0.28).move_to([0, y_film, 0])
        rect_bot_air  = make_layer_rect(W, H_AIR,  WHITE,  opacity=0.06).move_to([0, y_bot_air, 0])

        # 标注文字
        lbl_top = Text("空气  n=1", font=CJK, color=WHITE).scale(0.38)
        lbl_top.move_to(rect_top_air.get_center())
        lbl_film = VGroup(
            Text("薄膜", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"n=1.54", color=CYAN).scale(0.55),
        ).arrange(RIGHT, buff=0.12).move_to(rect_film.get_center())
        lbl_bot = Text("空气  n=1", font=CJK, color=WHITE).scale(0.38)
        lbl_bot.move_to(rect_bot_air.get_center())

        # 上界面 / 下界面水平线
        y_upper = y_top_air - H_AIR        # 上界面 y
        y_lower = y_film - H_FILM / 2      # 下界面 y

        upper_line = Line([-W/2, y_upper, 0], [W/2, y_upper, 0], color=YELLOW, stroke_width=2)
        lower_line = Line([-W/2, y_lower, 0], [W/2, y_lower, 0], color=YELLOW, stroke_width=2)

        layers = VGroup(rect_top_air, rect_film, rect_bot_air,
                        lbl_top, lbl_film, lbl_bot,
                        upper_line, lower_line)
        layers.shift(LEFT * 1.5)   # 将光路图移到左侧留空给公式

        self.play(FadeIn(rect_top_air), FadeIn(rect_film), FadeIn(rect_bot_air))
        self.play(FadeIn(lbl_top), FadeIn(lbl_film), FadeIn(lbl_bot))
        self.play(Create(upper_line), Create(lower_line))
        self.wait(0.8)

        # ── 入射光束（垂直向下）──
        x_beam = -2.8 + (-1.5)   # 相对偏移后的实际 x（layers 整体 shift LEFT 1.5）
        x_beam = -3.0

        # 入射光
        inc_arrow = Arrow(
            start=[x_beam, y_upper + 1.1, 0],
            end=[x_beam, y_upper + 0.05, 0],
            color=WHITE, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.22,
        )
        inc_lbl = Text("入射光", font=CJK, color=WHITE).scale(0.36)
        inc_lbl.next_to(inc_arrow, LEFT, buff=0.1)

        # 反射光1（上界面，有半波损失，向上偏一点）
        x_r1 = x_beam + 0.4
        r1_arrow = Arrow(
            start=[x_r1, y_upper + 0.05, 0],
            end=[x_r1, y_upper + 1.0, 0],
            color=RED, buff=0, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.22,
        )
        r1_lbl = VGroup(
            Text("反射光1", font=CJK, color=RED).scale(0.33),
            Text("(有半波损失)", font=CJK, color=RED).scale(0.30),
        ).arrange(DOWN, buff=0.05).next_to(r1_arrow, RIGHT, buff=0.08)

        # 折射光（进入薄膜）
        frac_arrow = DashedLine(
            start=[x_beam, y_upper, 0],
            end=[x_beam, y_lower, 0],
            color=CYAN, stroke_width=1.5,
        )

        # 反射光2（下界面无半波损失，折回上来再出去）
        x_r2 = x_beam - 0.4
        bot_dot = Dot([x_beam, y_lower, 0], color=ORANGE, radius=0.07)
        r2_arrow = Arrow(
            start=[x_r2, y_lower, 0],
            end=[x_r2, y_upper + 0.9, 0],
            color=ORANGE, buff=0, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.22,
        )
        r2_lbl = VGroup(
            Text("反射光2", font=CJK, color=ORANGE).scale(0.33),
            Text("(无半波损失)", font=CJK, color=ORANGE).scale(0.30),
        ).arrange(DOWN, buff=0.05).next_to(r2_arrow, LEFT, buff=0.08)

        self.play(Create(inc_arrow), FadeIn(inc_lbl))
        self.wait(0.5)
        self.play(Create(frac_arrow))
        self.play(Create(r1_arrow), FadeIn(r1_lbl))
        self.wait(0.5)
        self.play(FadeIn(bot_dot), Create(r2_arrow), FadeIn(r2_lbl))
        self.wait(1.2)

        # ══════════════════════════════════════════════════
        # Step 3：推导光程差方程
        # ══════════════════════════════════════════════════
        eq_area = RIGHT * 2.3   # 公式区中心

        step3_title = Text("光程差分析", font=CJK, color=YELLOW).scale(0.44)
        step3_title.move_to(eq_area + UP * 2.4)

        # 两束光的路程差：光在薄膜中走 2e
        eq_path = MathTex(r"\text{路程差}=2e", color=WHITE).scale(0.6)
        eq_path.move_to(eq_area + UP * 1.7)

        # 但光1有半波损失 → 附加 λ/2
        half_wave_note = VGroup(
            Text("光1上界面反射：疏→密，有半波损失，", font=CJK, color=RED).scale(0.32),
            Text("等效附加光程", font=CJK, color=RED).scale(0.32),
            MathTex(r"\frac{\lambda}{2}", color=RED).scale(0.55),
        ).arrange(RIGHT, buff=0.08).move_to(eq_area + UP * 1.1)

        # 总光程差
        eq_delta = MathTex(r"\delta", r"=", r"2ne", r"+", r"\frac{\lambda}{2}", color=WHITE).scale(0.75)
        eq_delta[0].set_color(YELLOW)
        eq_delta[2].set_color(CYAN)
        eq_delta[4].set_color(RED)
        eq_delta.move_to(eq_area + UP * 0.35)

        self.play(FadeIn(step3_title))
        self.play(Write(eq_path))
        self.wait(0.8)
        self.play(FadeIn(half_wave_note))
        self.wait(1.0)
        self.play(Write(eq_delta))
        self.wait(1.5)
        self.play(FadeOut(eq_path), FadeOut(half_wave_note), FadeOut(step3_title))

        # ══════════════════════════════════════════════════
        # Step 4：反射加强（最强）条件 → e_min
        # ══════════════════════════════════════════════════
        cond_title = VGroup(
            Text("反射最强条件：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\delta = k\lambda \quad (k=1,2,3,\ldots)", color=GREEN).scale(0.58),
        ).arrange(RIGHT, buff=0.1).move_to(eq_area + DOWN * 0.3)

        self.play(FadeIn(cond_title))
        self.wait(0.8)

        # 代入 δ 表达式
        sub_step1 = MathTex(r"2ne+\frac{\lambda}{2}=k\lambda", color=WHITE).scale(0.65)
        sub_step1.move_to(eq_area + DOWN * 0.95)

        sub_step2 = MathTex(r"2ne=(k-\tfrac{1}{2})\lambda", color=WHITE).scale(0.65)
        sub_step2.move_to(eq_area + DOWN * 1.55)

        sub_step3 = MathTex(r"e_{\min}=\frac{\lambda}{4n}", color=YELLOW).scale(0.80)
        sub_step3.move_to(eq_area + DOWN * 2.1)

        # 取 k=1 → 数值
        val_strong = VGroup(
            Text("取 k=1，", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"e_{\min}=\frac{600\,\text{nm}}{4\times1.54}\approx97.4\,\text{nm}",
                    color=GREEN).scale(0.58),
        ).arrange(RIGHT, buff=0.12).move_to(eq_area + DOWN * 2.75)

        self.play(Write(sub_step1))
        self.wait(0.8)
        self.play(Write(sub_step2))
        self.wait(0.8)
        self.play(Write(sub_step3))
        self.wait(0.6)
        self.play(FadeIn(val_strong))
        self.wait(1.5)

        # ══════════════════════════════════════════════════
        # Step 5：在光路图上标注 97.4 nm
        # ══════════════════════════════════════════════════
        # 双向箭头标注膜厚
        x_annot = x_beam + 1.2
        thick_arrow = DoubleArrow(
            start=[x_annot, y_lower, 0],
            end=[x_annot, y_upper, 0],
            color=GREEN, buff=0, stroke_width=2.5,
            tip_length=0.18,
        )
        thick_lbl = VGroup(
            MathTex(r"e_{\min}", color=GREEN).scale(0.5),
            Text("=97.4 nm", font=CJK, color=GREEN).scale(0.35),
        ).arrange(DOWN, buff=0.05).next_to(thick_arrow, RIGHT, buff=0.1)

        self.play(Create(thick_arrow), FadeIn(thick_lbl))
        self.wait(1.8)

        # ══════════════════════════════════════════════════
        # Step 6：切换 → 反射最弱（透射最强）条件
        # ══════════════════════════════════════════════════
        # 先淡出加强部分的公式
        self.play(
            FadeOut(cond_title), FadeOut(sub_step1),
            FadeOut(sub_step2), FadeOut(sub_step3), FadeOut(val_strong),
            FadeOut(thick_arrow), FadeOut(thick_lbl),
        )
        self.wait(0.5)

        cond2_title = VGroup(
            Text("反射最弱条件：", font=CJK, color=RED).scale(0.42),
            MathTex(r"\delta=(2k+1)\frac{\lambda}{2}", color=RED).scale(0.58),
        ).arrange(RIGHT, buff=0.1).move_to(eq_area + DOWN * 0.3)

        self.play(FadeIn(cond2_title))
        self.wait(0.8)

        sub2_step1 = MathTex(r"2ne+\frac{\lambda}{2}=(2k+1)\frac{\lambda}{2}", color=WHITE).scale(0.58)
        sub2_step1.move_to(eq_area + DOWN * 0.95)

        sub2_step2 = MathTex(r"2ne=k\lambda", color=WHITE).scale(0.65)
        sub2_step2.move_to(eq_area + DOWN * 1.55)

        sub2_step3 = MathTex(r"e_{\min}=\frac{\lambda}{2n}", color=ORANGE).scale(0.80)
        sub2_step3.move_to(eq_area + DOWN * 2.1)

        val_weak = VGroup(
            Text("取 k=1，", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"e_{\min}=\frac{600\,\text{nm}}{2\times1.54}\approx195\,\text{nm}",
                    color=ORANGE).scale(0.58),
        ).arrange(RIGHT, buff=0.12).move_to(eq_area + DOWN * 2.75)

        self.play(Write(sub2_step1))
        self.wait(0.8)
        self.play(Write(sub2_step2))
        self.wait(0.8)
        self.play(Write(sub2_step3))
        self.wait(0.6)
        self.play(FadeIn(val_weak))
        self.wait(1.5)

        # 标注第二个膜厚
        thick2_arrow = DoubleArrow(
            start=[x_annot, y_lower, 0],
            end=[x_annot, y_upper, 0],
            color=ORANGE, buff=0, stroke_width=2.5,
            tip_length=0.18,
        )
        thick2_lbl = VGroup(
            MathTex(r"e_{\min}", color=ORANGE).scale(0.5),
            Text("=195 nm", font=CJK, color=ORANGE).scale(0.35),
        ).arrange(DOWN, buff=0.05).next_to(thick2_arrow, RIGHT, buff=0.1)

        self.play(Create(thick2_arrow), FadeIn(thick2_lbl))
        self.wait(1.5)

        # ══════════════════════════════════════════════════
        # Step 7：清场并横向对比两个结果
        # ══════════════════════════════════════════════════
        all_scene_objs = VGroup(
            layers, inc_arrow, inc_lbl, frac_arrow,
            r1_arrow, r1_lbl, bot_dot, r2_arrow, r2_lbl,
            eq_delta,
            cond2_title, sub2_step1, sub2_step2, sub2_step3, val_weak,
            thick2_arrow, thick2_lbl,
        )
        self.play(FadeOut(all_scene_objs))
        self.wait(0.4)

        compare_title = Text("两种情况对比", font=CJK, color=BLUE).scale(0.55)
        compare_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(compare_title))

        # 左列：加强
        col_left_header = Text("反射最强", font=CJK, color=GREEN).scale(0.50)
        cl1 = MathTex(r"\delta=k\lambda", color=GREEN).scale(0.60)
        cl2 = MathTex(r"2ne+\tfrac{\lambda}{2}=k\lambda", color=WHITE).scale(0.55)
        cl3 = MathTex(r"e_{\min}=\frac{\lambda}{4n}", color=GREEN).scale(0.70)
        cl4 = VGroup(
            Text("代入数值：", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"e_{\min}\approx 97.4\,\text{nm}", color=GREEN).scale(0.60),
        ).arrange(RIGHT, buff=0.1)
        col_left = VGroup(col_left_header, cl1, cl2, cl3, cl4).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        col_left.move_to(LEFT * 3.2 + DOWN * 0.5)

        # 右列：相消
        col_right_header = Text("反射最弱", font=CJK, color=ORANGE).scale(0.50)
        cr1 = MathTex(r"\delta=(2k+1)\tfrac{\lambda}{2}", color=ORANGE).scale(0.60)
        cr2 = MathTex(r"2ne+\tfrac{\lambda}{2}=(2k+1)\tfrac{\lambda}{2}", color=WHITE).scale(0.55)
        cr3 = MathTex(r"e_{\min}=\frac{\lambda}{2n}", color=ORANGE).scale(0.70)
        cr4 = VGroup(
            Text("代入数值：", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"e_{\min}\approx 195\,\text{nm}", color=ORANGE).scale(0.60),
        ).arrange(RIGHT, buff=0.1)
        col_right = VGroup(col_right_header, cr1, cr2, cr3, cr4).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        col_right.move_to(RIGHT * 2.8 + DOWN * 0.5)

        # 中间分隔线
        div_line = DashedLine(UP * 1.5 + ORIGIN, DOWN * 2.2 + ORIGIN, color=GRAY, stroke_width=1.5)

        # 半波损失提示（底部）
        hwl_note = VGroup(
            Text("关键：上界面", font=CJK, color=RED).scale(0.38),
            MathTex(r"\frac{\lambda}{2}", color=RED).scale(0.52),
            Text("半波损失使两种条件互换！", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.08).to_edge(DOWN, buff=0.5)

        self.play(FadeIn(col_left_header), FadeIn(col_right_header), Create(div_line))
        self.wait(0.5)
        for cl, cr in zip([cl1, cl2, cl3, cl4], [cr1, cr2, cr3, cr4]):
            self.play(Write(cl), Write(cr))
            self.wait(0.7)
        self.play(FadeIn(hwl_note))
        self.wait(2.0)

        self.play(FadeOut(VGroup(compare_title, col_left, col_right, div_line, hwl_note)))
        self.wait(0.4)

        # ══════════════════════════════════════════════════
        # Step 8：小结卡
        # ══════════════════════════════════════════════════
        sum_title = Text("小结", font=CJK, color=BLUE).scale(0.55)
        sum_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sum_title))

        # 条件：λ=600nm，n=1.54
        param_line = VGroup(
            Text("题目参数：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\lambda=600\,\text{nm},\quad n=1.54", color=WHITE).scale(0.60),
        ).arrange(RIGHT, buff=0.12).next_to(sum_title, DOWN, buff=0.45)

        # 光程差公式
        s_delta = VGroup(
            Text("光程差：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\delta=2ne+\frac{\lambda}{2}", color=YELLOW).scale(0.70),
        ).arrange(RIGHT, buff=0.12)

        # 加强
        s_strong = VGroup(
            Text("反射最强（", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"k{=}1", color=GREEN).scale(0.60),
            Text("）：", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"e_{\min}=\frac{\lambda}{4n}\approx97.4\,\text{nm}", color=GREEN).scale(0.65),
        ).arrange(RIGHT, buff=0.08)

        # 相消
        s_weak = VGroup(
            Text("反射最弱（", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"k{=}1", color=ORANGE).scale(0.60),
            Text("）：", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"e_{\min}=\frac{\lambda}{2n}\approx195\,\text{nm}", color=ORANGE).scale(0.65),
        ).arrange(RIGHT, buff=0.08)

        # 半波损失备注
        s_note = VGroup(
            Text("* 上界面疏→密，半波损失附加", font=CJK, color=RED).scale(0.37),
            MathTex(r"\lambda/2", color=RED).scale(0.52),
            Text("光程差，决定加强/减弱条件。", font=CJK, color=RED).scale(0.37),
        ).arrange(RIGHT, buff=0.08)

        summary_content = VGroup(param_line, s_delta, s_strong, s_weak, s_note)
        summary_content.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary_content.next_to(sum_title, DOWN, buff=0.45)
        summary_content.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_content, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(Write(param_line))
        self.wait(0.5)
        self.play(Write(s_delta))
        self.wait(0.8)
        self.play(Write(s_strong))
        self.wait(0.7)
        self.play(Write(s_weak))
        self.wait(0.7)
        self.play(FadeIn(s_note))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, summary_content, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch11Ex1ThinFilmMinThickness",
        "id": "phys-ch11-11.1-ex1-thin-film-min-thickness",
        "chapterId": "ch11",
        "sectionId": "11.1",
        "title": "例题：薄膜反射最强/最弱最小厚度",
        "description": "以 n=1.54 薄膜为例，动画化推导光程差 δ=2ne+λ/2，分别得出反射最强 e_min=λ/(4n)≈97.4nm 和反射最弱 e_min=λ/(2n)≈195nm，并强调上界面半波损失对条件的决定性影响。",
    },
]
