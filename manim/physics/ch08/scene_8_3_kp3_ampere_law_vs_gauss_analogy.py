"""第 8.3 节 · 安培环路定理与高斯定理类比（知识点 KP3）。

左右分屏对比：电场高斯定理（面积分，有源）vs 安培环路定理（线积分，有旋）。
重点纠正「安培回路积分为零 ≠ 回路上各点 B=0」的常见误区。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch08Kp3AmpereLawVsGaussAnalogy",
        "id": "phys-ch08-8.3-kp3-ampere-law-vs-gauss-analogy",
        "chapterId": "ch08",
        "sectionId": "8.3",
        "title": "安培环路定理与高斯定理类比",
        "description": "左右分屏对比电场高斯定理（有源）与安培环路定理（有旋），并演示「积分为零不等于B为零」的关键误区。",
    },
]


class Ch08Kp3AmpereLawVsGaussAnalogy(Scene):
    def construct(self):

        # ─────────────────────────────────────────────────────────────────
        # Step 1: 标题
        # ─────────────────────────────────────────────────────────────────
        title = Text("安培环路定理与高斯定理类比", font=CJK, color=BLUE).scale(0.66)
        title.to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ─────────────────────────────────────────────────────────────────
        # Step 2: 生活类比引入
        # ─────────────────────────────────────────────────────────────────
        ana1 = Text("想象站在一个房间里感受「风」：", font=CJK).scale(0.48)
        ana2 = Text("如果空气从风扇「吹出」，每个方向都有风 → 类似电荷产生电场（有源）；", font=CJK).scale(0.44)
        ana3 = Text("如果风绕着柱子「旋转」，沿圆圈一圈风力不断累加 → 类似电流产生磁场（有旋）。", font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ─────────────────────────────────────────────────────────────────
        # Step 3: 左右分屏标题
        # ─────────────────────────────────────────────────────────────────
        divider = Line(UP * 3.0, DOWN * 3.5, color=GRAY, stroke_width=1.5)

        lbl_gauss = Text("高斯定理（静电场）", font=CJK, color=YELLOW).scale(0.50)
        lbl_gauss.move_to(LEFT * 3.3 + UP * 2.8)

        lbl_ampere = Text("安培环路定理（稳恒磁场）", font=CJK, color=CYAN).scale(0.50)
        lbl_ampere.move_to(RIGHT * 3.0 + UP * 2.8)

        self.play(Create(divider), FadeIn(lbl_gauss), FadeIn(lbl_ampere))
        self.wait(0.8)

        # ─────────────────────────────────────────────────────────────────
        # Step 4: 左侧 — 点电荷 + 放射状电场线 + 球面高斯面
        # ─────────────────────────────────────────────────────────────────
        LEFT_ORIGIN = LEFT * 3.3 + DOWN * 0.2

        # 点电荷
        charge_dot = Dot(LEFT_ORIGIN, radius=0.18, color=RED)
        charge_label = MathTex(r"+q", color=RED).scale(0.65)
        charge_label.next_to(charge_dot, UR, buff=0.08)

        # 放射状 E 场线箭头
        e_arrows = VGroup()
        for k in range(12):
            ang = k * TAU / 12
            d = np.array([math.cos(ang), math.sin(ang), 0.0])
            start = LEFT_ORIGIN + d * 0.22
            end = LEFT_ORIGIN + d * 1.05
            e_arrows.add(Arrow(start, end, buff=0, color=YELLOW,
                               stroke_width=2.5, max_tip_length_to_length_ratio=0.32))

        # 球形高斯面（用圆圈表示截面）
        gauss_circle = Circle(radius=1.10, color=YELLOW, stroke_width=2.0)
        gauss_circle.move_to(LEFT_ORIGIN)

        gauss_lbl = Text("球形高斯面 S", font=CJK, color=YELLOW).scale(0.38)
        gauss_lbl.next_to(gauss_circle, DOWN, buff=0.12)

        # dS 面积元方向示意
        ds_arrow = Arrow(LEFT_ORIGIN + RIGHT * 1.10, LEFT_ORIGIN + RIGHT * 1.55,
                         buff=0, color=GREEN, stroke_width=3,
                         max_tip_length_to_length_ratio=0.36)
        ds_label = MathTex(r"d\mathbf{S}", color=GREEN).scale(0.55)
        ds_label.next_to(ds_arrow, RIGHT, buff=0.06)

        self.play(FadeIn(charge_dot), FadeIn(charge_label))
        self.play(Create(e_arrows))
        self.wait(0.5)
        self.play(Create(gauss_circle), FadeIn(gauss_lbl))
        self.play(GrowArrow(ds_arrow), FadeIn(ds_label))
        self.wait(1.0)

        # ─────────────────────────────────────────────────────────────────
        # Step 5: 右侧 — 长直电流 + 同心圆磁场线 + 安培回路
        # ─────────────────────────────────────────────────────────────────
        RIGHT_ORIGIN = RIGHT * 3.0 + DOWN * 0.2

        # 电流方向（圆点表示向外）
        wire_dot = Dot(RIGHT_ORIGIN, radius=0.18, color=ORANGE)
        wire_inner = Dot(RIGHT_ORIGIN, radius=0.06, color=WHITE)
        wire_label = Text("电流 I（向外）", font=CJK, color=ORANGE).scale(0.36)
        wire_label.next_to(wire_dot, UP, buff=0.14)

        # 同心圆 B 场线（逆时针方向）
        b_circles = VGroup()
        for r in [0.55, 0.85, 1.10]:
            circ = Circle(radius=r, color=CYAN, stroke_width=1.8 if r < 1.0 else 2.2)
            circ.move_to(RIGHT_ORIGIN)
            b_circles.add(circ)

        # 在外圈加小箭头表示逆时针方向
        b_dir_arrows = VGroup()
        for ang_deg in [80, 200, 320]:
            ang = math.radians(ang_deg)
            r = 1.10
            pt = RIGHT_ORIGIN + np.array([math.cos(ang) * r, math.sin(ang) * r, 0])
            tang = np.array([-math.sin(ang), math.cos(ang), 0]) * 0.28
            b_dir_arrows.add(Arrow(pt - tang * 0.5, pt + tang * 0.5,
                                   buff=0, color=CYAN, stroke_width=2.5,
                                   max_tip_length_to_length_ratio=0.50))

        # 安培回路（与外圈重合，用不同颜色强调）
        ampere_loop = Circle(radius=1.10, color=GREEN, stroke_width=3.0)
        ampere_loop.move_to(RIGHT_ORIGIN)
        loop_lbl = Text("安培回路 L", font=CJK, color=GREEN).scale(0.38)
        loop_lbl.next_to(ampere_loop, DOWN, buff=0.12)

        # dl 线元方向示意
        dl_ang = math.radians(10)
        dl_pt = RIGHT_ORIGIN + np.array([math.cos(dl_ang) * 1.10, math.sin(dl_ang) * 1.10, 0])
        dl_tang = np.array([-math.sin(dl_ang), math.cos(dl_ang), 0]) * 0.40
        dl_arrow = Arrow(dl_pt - dl_tang * 0.3, dl_pt + dl_tang * 0.7,
                         buff=0, color=GREEN, stroke_width=3,
                         max_tip_length_to_length_ratio=0.45)
        dl_label = MathTex(r"d\mathbf{l}", color=GREEN).scale(0.55)
        dl_label.next_to(dl_arrow, RIGHT, buff=0.06)

        self.play(FadeIn(wire_dot), FadeIn(wire_inner), FadeIn(wire_label))
        self.play(Create(b_circles), Create(b_dir_arrows))
        self.wait(0.5)
        self.play(Create(ampere_loop), FadeIn(loop_lbl))
        self.play(GrowArrow(dl_arrow), FadeIn(dl_label))
        self.wait(1.2)

        # ─────────────────────────────────────────────────────────────────
        # Step 6: 公式逐步出现，左侧高斯，右侧安培
        # ─────────────────────────────────────────────────────────────────
        gauss_eq = MathTex(
            r"\oiint_S", r"\mathbf{E}", r"\cdot", r"d\mathbf{S}",
            r"=", r"\frac{Q_{\mathrm{enc}}}{\varepsilon_0}"
        ).scale(0.72)
        gauss_eq.move_to(LEFT * 3.3 + DOWN * 2.55)
        gauss_eq.set_color(YELLOW)

        ampere_eq = MathTex(
            r"\oint_L", r"\mathbf{B}", r"\cdot", r"d\mathbf{l}",
            r"=", r"\mu_0 I_{\mathrm{enc}}"
        ).scale(0.72)
        ampere_eq.move_to(RIGHT * 3.0 + DOWN * 2.55)
        ampere_eq.set_color(CYAN)

        self.play(Write(gauss_eq))
        self.wait(0.5)
        self.play(Write(ampere_eq))
        self.wait(1.6)

        # ─────────────────────────────────────────────────────────────────
        # Step 7: 高亮「源」与「旋」的本质区别
        # ─────────────────────────────────────────────────────────────────
        # 左侧：高亮源项（Q_enc/ε₀）
        src_box = SurroundingRectangle(gauss_eq[5], color=RED, buff=0.08)
        src_note = Text("有源：电荷是源", font=CJK, color=RED).scale(0.40)
        src_note.next_to(src_box, DOWN, buff=0.10)

        # 右侧：高亮旋项（μ₀ I_enc）
        rot_box = SurroundingRectangle(ampere_eq[5], color=ORANGE, buff=0.08)
        rot_note = Text("有旋：电流是源", font=CJK, color=ORANGE).scale(0.40)
        rot_note.next_to(rot_box, DOWN, buff=0.10)

        key_left = Text("面积分  E//dS  积分不为零", font=CJK, color=YELLOW).scale(0.38)
        key_left.next_to(gauss_eq, UP, buff=0.18)
        key_right = Text("线积分  B//dl  积分不为零", font=CJK, color=CYAN).scale(0.38)
        key_right.next_to(ampere_eq, UP, buff=0.18)

        self.play(Create(src_box), FadeIn(src_note), FadeIn(key_left))
        self.wait(0.8)
        self.play(Create(rot_box), FadeIn(rot_note), FadeIn(key_right))
        self.wait(1.8)

        # 清除分屏场景
        left_group = VGroup(charge_dot, charge_label, e_arrows, gauss_circle,
                            gauss_lbl, ds_arrow, ds_label, gauss_eq,
                            src_box, src_note, key_left)
        right_group = VGroup(wire_dot, wire_inner, wire_label, b_circles, b_dir_arrows,
                             ampere_loop, loop_lbl, dl_arrow, dl_label, ampere_eq,
                             rot_box, rot_note, key_right)
        self.play(FadeOut(left_group), FadeOut(right_group),
                  FadeOut(divider), FadeOut(lbl_gauss), FadeOut(lbl_ampere))
        self.wait(0.3)

        # ─────────────────────────────────────────────────────────────────
        # Step 8: 关键对比表（文字总结）
        # ─────────────────────────────────────────────────────────────────
        cmp_title = Text("两大定理对比", font=CJK, color=BLUE).scale(0.55)
        cmp_title.next_to(title, DOWN, buff=0.45)

        row1_lbl = Text("积分类型", font=CJK, color=WHITE).scale(0.44)
        row1_g = Text("面积分（曲面）", font=CJK, color=YELLOW).scale(0.44)
        row1_a = Text("线积分（回路）", font=CJK, color=CYAN).scale(0.44)

        row2_lbl = Text("场的性质", font=CJK, color=WHITE).scale(0.44)
        row2_g = Text("有源场（电通量 ≠ 0）", font=CJK, color=YELLOW).scale(0.44)
        row2_a = Text("有旋场（环流 ≠ 0）", font=CJK, color=CYAN).scale(0.44)

        row3_lbl = Text("积分结果", font=CJK, color=WHITE).scale(0.44)
        row3_g = VGroup(Text("正比于内部", font=CJK, color=YELLOW).scale(0.44),
                        Text("电荷量", font=CJK, color=YELLOW).scale(0.44)).arrange(RIGHT, buff=0.1)
        row3_a = VGroup(Text("正比于穿过", font=CJK, color=CYAN).scale(0.44),
                        Text("电流量", font=CJK, color=CYAN).scale(0.44)).arrange(RIGHT, buff=0.1)

        # 手动布局三行
        col_x = [-3.8, -0.5, 3.5]
        row_y = [1.4, 0.7, 0.0]

        for items, y in zip(
            [(row1_lbl, row1_g, row1_a),
             (row2_lbl, row2_g, row2_a),
             (row3_lbl, row3_g, row3_a)],
            row_y
        ):
            for item, x in zip(items, col_x):
                item.move_to([x, y, 0])

        cmp_group = VGroup(row1_lbl, row1_g, row1_a,
                           row2_lbl, row2_g, row2_a,
                           row3_lbl, row3_g, row3_a)

        # 表格分隔线
        sep_v = DashedLine(UP * 1.75 + LEFT * 1.8, DOWN * 0.4 + LEFT * 1.8,
                           color=GRAY, stroke_width=1.0)
        sep_v2 = DashedLine(UP * 1.75 + RIGHT * 1.8, DOWN * 0.4 + RIGHT * 1.8,
                            color=GRAY, stroke_width=1.0)

        header_g = Text("高斯定理", font=CJK, color=YELLOW).scale(0.46)
        header_g.move_to([-0.5, 1.9, 0])
        header_a = Text("安培环路定理", font=CJK, color=CYAN).scale(0.46)
        header_a.move_to([3.5, 1.9, 0])

        self.play(FadeIn(cmp_title))
        self.play(FadeIn(header_g), FadeIn(header_a), Create(sep_v), Create(sep_v2))
        self.wait(0.4)
        self.play(FadeIn(row1_lbl), FadeIn(row1_g), FadeIn(row1_a))
        self.wait(0.6)
        self.play(FadeIn(row2_lbl), FadeIn(row2_g), FadeIn(row2_a))
        self.wait(0.6)
        self.play(FadeIn(row3_lbl), FadeIn(row3_g), FadeIn(row3_a))
        self.wait(1.6)
        self.play(FadeOut(VGroup(cmp_title, cmp_group, header_g, header_a, sep_v, sep_v2)))
        self.wait(0.3)

        # ─────────────────────────────────────────────────────────────────
        # Step 9: 反例动画 — 安培回路不包围电流，积分为零但 B ≠ 0
        # ─────────────────────────────────────────────────────────────────
        counter_title = Text("常见误区：安培环路积分为零，是否意味着回路上各点 B=0？", font=CJK, color=RED).scale(0.44)
        counter_title.next_to(title, DOWN, buff=0.42)
        counter_title.scale_to_fit_width(13.0)
        self.play(FadeIn(counter_title))
        self.wait(0.8)

        # 场景：一根直导线（在左侧），安培回路圈在右侧（不包围电流）
        WIRE_POS = LEFT * 2.5 + DOWN * 0.3

        # 画导线（垂直线）
        wire_line = Line(WIRE_POS + UP * 2.2, WIRE_POS + DOWN * 2.2,
                         color=ORANGE, stroke_width=4)
        wire_icon = Dot(WIRE_POS, radius=0.15, color=ORANGE)
        wire_icon_inner = Dot(WIRE_POS, radius=0.05, color=WHITE)
        wire_curr_lbl = Text("I", font=CJK, color=ORANGE).scale(0.55)
        wire_curr_lbl.next_to(wire_icon, LEFT, buff=0.18)

        # 同心圆 B 场线（圆心在导线处）
        b_outer1 = Circle(radius=1.2, color=CYAN, stroke_width=1.5)
        b_outer1.move_to(WIRE_POS)
        b_outer2 = Circle(radius=2.0, color=CYAN, stroke_width=1.2)
        b_outer2.move_to(WIRE_POS)
        b_outer3 = Circle(radius=2.8, color=CYAN, stroke_width=1.0)
        b_outer3.move_to(WIRE_POS)

        # 小箭头表示 B 方向（逆时针）
        b_sm_arrows = VGroup()
        for ang_deg in [60, 180, 300]:
            ang = math.radians(ang_deg)
            r = 1.2
            pt = WIRE_POS + np.array([math.cos(ang) * r, math.sin(ang) * r, 0])
            tang = np.array([-math.sin(ang), math.cos(ang), 0]) * 0.30
            b_sm_arrows.add(Arrow(pt - tang * 0.5, pt + tang * 0.5,
                                  buff=0, color=CYAN, stroke_width=2.2,
                                  max_tip_length_to_length_ratio=0.55))

        # 安培回路（圆心偏右，不包围电流）
        LOOP_CENTER = RIGHT * 1.8 + DOWN * 0.3
        counter_loop = Circle(radius=1.0, color=GREEN, stroke_width=3.0)
        counter_loop.move_to(LOOP_CENTER)
        counter_loop_lbl = Text("安培回路 L", font=CJK, color=GREEN).scale(0.38)
        counter_loop_lbl.next_to(counter_loop, DOWN, buff=0.12)

        # 标注：回路不包围电流
        no_enc = Text("不包围电流", font=CJK, color=RED).scale(0.40)
        no_enc.next_to(counter_loop, UP, buff=0.20)

        self.play(Create(wire_line), FadeIn(wire_icon), FadeIn(wire_icon_inner), FadeIn(wire_curr_lbl))
        self.play(Create(b_outer1), Create(b_outer2), Create(b_outer3), Create(b_sm_arrows))
        self.wait(0.6)
        self.play(Create(counter_loop), FadeIn(counter_loop_lbl), FadeIn(no_enc))
        self.wait(1.0)

        # ─────────────────────────────────────────────────────────────────
        # Step 10: 演示积分为零 vs 各点 B ≠ 0
        # ─────────────────────────────────────────────────────────────────
        # 在回路上显示 B 场箭头（大小由距导线决定）
        b_on_loop = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            # 回路上的点
            pt = LOOP_CENTER + np.array([math.cos(ang) * 1.0, math.sin(ang) * 1.0, 0])
            # 到导线的向量，决定 B 方向（切向，逆时针）
            to_wire = pt - WIRE_POS
            r = np.linalg.norm(to_wire)
            # B 方向：垂直于 to_wire，逆时针
            b_dir = np.array([-to_wire[1] / r, to_wire[0] / r, 0])
            # B 大小与 1/r 成正比（示意）
            b_len = 0.4 / r * 1.5
            b_end = pt + b_dir * b_len
            b_on_loop.add(Arrow(pt, b_end, buff=0, color=YELLOW,
                                stroke_width=2.5, max_tip_length_to_length_ratio=0.42))

        b_on_note = Text("回路各点：B 不为零！", font=CJK, color=YELLOW).scale(0.42)
        b_on_note.move_to(RIGHT * 1.8 + UP * 1.8)

        self.play(Create(b_on_loop))
        self.wait(0.5)
        self.play(FadeIn(b_on_note))
        self.wait(0.8)

        # 显示积分公式 = 0
        enc_zero_line = VGroup(
            MathTex(r"I_{\mathrm{enc}} = 0", color=RED).scale(0.75),
        )
        enc_zero_line[0].move_to(RIGHT * 1.8 + DOWN * 1.8)

        result_line = VGroup(
            MathTex(r"\oint_L \mathbf{B} \cdot d\mathbf{l} = \mu_0 \cdot 0 = 0", color=GREEN).scale(0.68),
        )
        result_line[0].move_to(RIGHT * 1.8 + DOWN * 2.35)
        result_line[0].scale_to_fit_width(5.5)

        self.play(Write(enc_zero_line[0]))
        self.wait(0.5)
        self.play(Write(result_line[0]))
        self.wait(1.2)

        # 关键纠错框
        correct_note = Text("「积分为零」只说明穿过回路的净电流为零，", font=CJK, color=RED).scale(0.40)
        correct_note2 = Text("不能说明回路上各点 B=0！", font=CJK, color=RED).scale(0.42)
        correct_grp = VGroup(correct_note, correct_note2).arrange(DOWN, buff=0.18)
        correct_grp.move_to(RIGHT * 1.8 + DOWN * 2.9)
        correct_grp.scale_to_fit_width(6.2)

        corr_box = SurroundingRectangle(correct_grp, color=RED, buff=0.18, corner_radius=0.12)

        self.play(FadeIn(correct_grp), Create(corr_box))
        self.wait(2.0)

        # 清场
        scene9_group = VGroup(wire_line, wire_icon, wire_icon_inner, wire_curr_lbl,
                              b_outer1, b_outer2, b_outer3, b_sm_arrows,
                              counter_loop, counter_loop_lbl, no_enc,
                              b_on_loop, b_on_note,
                              enc_zero_line[0], result_line[0],
                              correct_grp, corr_box, counter_title)
        self.play(FadeOut(scene9_group))
        self.wait(0.3)

        # ─────────────────────────────────────────────────────────────────
        # Step 11: 两定理对称性总结（公式并排）
        # ─────────────────────────────────────────────────────────────────
        sym_title = Text("数学结构的对称之美", font=CJK, color=BLUE).scale(0.55)
        sym_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sym_title))
        self.wait(0.5)

        gauss_full = MathTex(
            r"\oiint_S \mathbf{E}\cdot d\mathbf{S}",
            r"=",
            r"\frac{Q_{\mathrm{enc}}}{\varepsilon_0}"
        ).scale(0.90)
        gauss_full.set_color_by_tex(r"\oiint", YELLOW)
        gauss_full[0].set_color(YELLOW)
        gauss_full[2].set_color(YELLOW)

        ampere_full = MathTex(
            r"\oint_L \mathbf{B}\cdot d\mathbf{l}",
            r"=",
            r"\mu_0 I_{\mathrm{enc}}"
        ).scale(0.90)
        ampere_full[0].set_color(CYAN)
        ampere_full[2].set_color(CYAN)

        ann_gauss = Text("面积分 → 有源（电荷）", font=CJK, color=YELLOW).scale(0.42)
        ann_ampere = Text("线积分 → 有旋（电流）", font=CJK, color=CYAN).scale(0.42)

        pair = VGroup(gauss_full, ampere_full).arrange(DOWN, buff=0.7)
        pair.next_to(sym_title, DOWN, buff=0.6)
        ann_gauss.next_to(gauss_full, RIGHT, buff=0.5)
        ann_ampere.next_to(ampere_full, RIGHT, buff=0.5)

        self.play(Write(gauss_full), FadeIn(ann_gauss))
        self.wait(0.7)
        self.play(Write(ampere_full), FadeIn(ann_ampere))
        self.wait(1.4)

        # ─────────────────────────────────────────────────────────────────
        # Step 12: 小结卡
        # ─────────────────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(sym_title, gauss_full, ampere_full, ann_gauss, ann_ampere)))
        self.wait(0.2)

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = VGroup(
            Text("高斯定理（面积分）：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\oiint_S \mathbf{E}\cdot d\mathbf{S}=\dfrac{Q_{\mathrm{enc}}}{\varepsilon_0}",
                    color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("安培定理（线积分）：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"\oint_L \mathbf{B}\cdot d\mathbf{l}=\mu_0 I_{\mathrm{enc}}",
                    color=CYAN).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        s3 = Text("「积分为零 ≠ 各点场为零」——安培定理只反映穿过回路的净电流。",
                  font=CJK, color=GREEN).scale(0.41)

        summary = VGroup(s1, s2, s3).arrange(DOWN, buff=0.50)
        summary.next_to(s_title, DOWN, buff=0.5)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
