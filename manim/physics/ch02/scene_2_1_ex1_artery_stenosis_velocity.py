"""第 2.1 节 · 例题：动脉狭窄处血流速度（连续性方程应用）

可视化方案：
  第一幕 — 动脉侧视截面 + 椭圆斑块缩窄至 r2=0.6cm，标注面积之比
  第二幕 — 双管道内速度箭头对比 + 截面俯视圆形渐变对比
  第三幕 — MathTex 逐步推导，高亮 v1=0.18 m/s，v2=0.5 m/s

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch02Ex1ArteryStenosisVelocity",
        "id": "phys-ch02-2.1-ex1-artery-stenosis-velocity",
        "chapterId": "ch02",
        "sectionId": "2.1",
        "title": "动脉狭窄处血流速度",
        "description": "用连续性方程 S1v1=S2v2 分析动脉粥样硬化斑块导致狭窄处血流加速，求解正常段与狭窄段流速。",
    },
]


class Ch02Ex1ArteryStenosisVelocity(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("动脉狭窄处血流速度", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.1  连续性方程例题", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.20)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════
        ana1 = Text("想象你用手指半堵住花园水管的出口——", font=CJK).scale(0.50)
        ana2 = Text("截面积变小，水却喷得更远、更快。", font=CJK, color=YELLOW).scale(0.50)
        ana3 = Text("动脉里斑块堆积时，血流同样会在狭窄处急剧加速。", font=CJK).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.30)
        ana_grp.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_grp))

        # ═══════════════════════════════════════════════════════════════
        # Step 3: 连续性方程定义（逐步出现）
        # ═══════════════════════════════════════════════════════════════
        defi_label = Text("连续性方程（不可压缩定常流）", font=CJK, color=CYAN).scale(0.48)
        defi_label.next_to(title, DOWN, buff=0.50)

        eq_continuity = MathTex(r"S_1 v_1 = S_2 v_2").scale(1.10)
        eq_continuity.next_to(defi_label, DOWN, buff=0.40)
        eq_continuity[0][0:2].set_color(YELLOW)   # S_1
        eq_continuity[0][2:4].set_color(ORANGE)   # v_1

        note_cont = Text("流量守恒：单位时间流过任意截面的体积相同", font=CJK, color=GREEN).scale(0.42)
        note_cont.next_to(eq_continuity, DOWN, buff=0.35)

        self.play(FadeIn(defi_label))
        self.play(Write(eq_continuity))
        self.wait(1.0)
        self.play(FadeIn(note_cont))
        self.wait(1.6)
        self.play(FadeOut(VGroup(defi_label, eq_continuity, note_cont)))

        # ═══════════════════════════════════════════════════════════════
        # Step 4: 第一幕 — 动脉侧视图 + 斑块缩窄
        # ═══════════════════════════════════════════════════════════════
        scene_label = Text("动脉截面示意图（侧视）", font=CJK, color=CYAN).scale(0.46)
        scene_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scene_label))

        # 坐标参考：管道居中，y=0 为轴线
        # 正常段：左侧，半径 r1 对应高度 1.0（视觉单位）
        # 狭窄段：中段，半径 r2 对应高度 0.6

        R1 = 0.90   # 屏幕单位，代表 r1=1.0 cm
        R2 = 0.54   # 屏幕单位，代表 r2=0.6 cm
        PIPE_COLOR = "#4488FF"
        LUMEN_COLOR = "#CC2222"   # 血液红色
        PLAQUE_COLOR = "#F5DEB3"  # 斑块米黄色

        # 管道壁（上下两条线）
        wall_top_L  = Line(LEFT*3.5 + UP*R1,    LEFT*0.8 + UP*R1,    color=PIPE_COLOR, stroke_width=4)
        wall_bot_L  = Line(LEFT*3.5 + DOWN*R1,  LEFT*0.8 + DOWN*R1,  color=PIPE_COLOR, stroke_width=4)
        wall_top_R  = Line(RIGHT*0.8 + UP*R1,   RIGHT*3.5 + UP*R1,   color=PIPE_COLOR, stroke_width=4)
        wall_bot_R  = Line(RIGHT*0.8 + DOWN*R1, RIGHT*3.5 + DOWN*R1, color=PIPE_COLOR, stroke_width=4)

        # 左段血液填充（半透明）
        lumen_L = Rectangle(width=2.7, height=2*R1, color=LUMEN_COLOR, fill_opacity=0.25, stroke_width=0)
        lumen_L.move_to(LEFT*2.15)

        # 右段血液填充
        lumen_R = Rectangle(width=2.7, height=2*R1, color=LUMEN_COLOR, fill_opacity=0.25, stroke_width=0)
        lumen_R.move_to(RIGHT*2.15)

        # 管道左右端封口（模拟无限延伸用渐隐，此处留端线）
        end_L = DashedLine(LEFT*3.5+UP*R1, LEFT*3.5+DOWN*R1, color=WHITE, dash_length=0.12)
        end_R = DashedLine(RIGHT*3.5+UP*R1, RIGHT*3.5+DOWN*R1, color=WHITE, dash_length=0.12)

        artery_normal = VGroup(lumen_L, lumen_R, wall_top_L, wall_bot_L, wall_top_R, wall_bot_R, end_L, end_R)
        artery_normal.shift(DOWN*0.5)

        self.play(Create(VGroup(wall_top_L, wall_bot_L, wall_top_R, wall_bot_R)))
        self.play(FadeIn(lumen_L), FadeIn(lumen_R))
        self.play(FadeIn(end_L), FadeIn(end_R))

        # r1 标注（左侧）
        r1_line = DashedLine(LEFT*3.1 + DOWN*0.5 + DOWN*R1, LEFT*3.1 + DOWN*0.5 + UP*R1,
                              color=YELLOW, dash_length=0.10)
        r1_brace = Brace(r1_line, direction=LEFT, color=YELLOW)
        r1_txt_label = VGroup(
            MathTex(r"r_1", color=YELLOW).scale(0.65),
            Text("=1.0 cm", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        r1_brace.put_at_tip(r1_txt_label, buff=0.10)

        self.play(Create(r1_line), Create(r1_brace), FadeIn(r1_txt_label))
        self.wait(1.2)

        # ── 斑块出现 ────────────────────────────────────────────────────
        plaque_label = Text("动脉粥样硬化斑块", font=CJK, color=PLAQUE_COLOR).scale(0.40)
        plaque_label.next_to(title, DOWN, buff=0.45).to_edge(RIGHT, buff=0.5)

        # 斑块：上下各一个半椭圆形，向内侵占管腔
        plaque_top = Ellipse(width=1.80, height=2*(R1 - R2), color=PLAQUE_COLOR,
                             fill_color=PLAQUE_COLOR, fill_opacity=0.85, stroke_width=2)
        plaque_top.move_to(DOWN*0.5 + UP*(R1 - (R1-R2)))   # 顶部斑块下表面齐 r2
        plaque_bot = Ellipse(width=1.80, height=2*(R1 - R2), color=PLAQUE_COLOR,
                             fill_color=PLAQUE_COLOR, fill_opacity=0.85, stroke_width=2)
        plaque_bot.move_to(DOWN*0.5 + DOWN*(R1 - (R1-R2)))  # 底部斑块上表面齐 r2

        # 重新定位让两个斑块贴在管壁内侧中央
        plaque_top.move_to(np.array([0, -0.5 + R1 - (R1-R2)/2, 0]))
        plaque_bot.move_to(np.array([0, -0.5 - R1 + (R1-R2)/2, 0]))

        self.play(FadeIn(scene_label.set_text("斑块导致管腔缩窄").set_color(YELLOW)))
        self.play(GrowFromCenter(plaque_top), GrowFromCenter(plaque_bot))
        self.wait(0.8)

        # r2 标注（中央狭窄段）
        r2_line = DashedLine(RIGHT*0.5 + DOWN*0.5 + DOWN*R2, RIGHT*0.5 + DOWN*0.5 + UP*R2,
                              color=GREEN, dash_length=0.10)
        r2_brace = Brace(r2_line, direction=RIGHT, color=GREEN)
        r2_txt_label = VGroup(
            MathTex(r"r_2", color=GREEN).scale(0.65),
            Text("=0.6 cm", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        r2_brace.put_at_tip(r2_txt_label, buff=0.10)

        self.play(Create(r2_line), Create(r2_brace), FadeIn(r2_txt_label))

        # 面积之比标注
        ratio_eq = MathTex(
            r"\frac{S_2}{S_1} = \frac{\pi r_2^2}{\pi r_1^2} = \left(\frac{0.6}{1.0}\right)^2 = 0.36"
        ).scale(0.65).set_color(YELLOW)
        ratio_eq.to_corner(DR, buff=0.5)
        ratio_box = SurroundingRectangle(ratio_eq, color=YELLOW, buff=0.18, corner_radius=0.10)
        self.play(Write(ratio_eq), Create(ratio_box))
        self.wait(1.8)

        # 清场（保留管道以备下一幕）
        plaque_grp = VGroup(plaque_top, plaque_bot)
        anno_grp = VGroup(r1_line, r1_brace, r1_txt_label,
                          r2_line, r2_brace, r2_txt_label,
                          ratio_eq, ratio_box, scene_label)
        self.play(FadeOut(anno_grp))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 5: 第二幕 — 速度箭头对比
        # ═══════════════════════════════════════════════════════════════
        vel_label = Text("流速可视化：截面积↓ → 流速↑", font=CJK, color=CYAN).scale(0.46)
        vel_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vel_label))

        # 左段（正常）：多条水平箭头，长度代表 v1
        v1_arrows = VGroup(*[
            Arrow(
                start=LEFT*2.60 + UP*(y - 0.5),
                end=LEFT*1.20 + UP*(y - 0.5),
                buff=0, color=ORANGE, stroke_width=3.5,
                max_tip_length_to_length_ratio=0.25
            )
            for y in np.linspace(-R1*0.65, R1*0.65, 5)
        ])

        # 右段（正常）：短箭头，右侧
        v1_arrows_R = VGroup(*[
            Arrow(
                start=RIGHT*1.40 + UP*(y - 0.5),
                end=RIGHT*2.80 + UP*(y - 0.5),
                buff=0, color=ORANGE, stroke_width=3.5,
                max_tip_length_to_length_ratio=0.25
            )
            for y in np.linspace(-R1*0.65, R1*0.65, 5)
        ])

        # 狭窄处（中央）：长箭头（速度更大）
        v2_arrows = VGroup(*[
            Arrow(
                start=LEFT*0.55 + UP*(y - 0.5),
                end=RIGHT*0.55 + UP*(y - 0.5),
                buff=0, color=RED, stroke_width=4.5,
                max_tip_length_to_length_ratio=0.22
            )
            for y in np.linspace(-R2*0.60, R2*0.60, 3)
        ])

        # 标签
        v1_tag = VGroup(
            MathTex(r"v_1", color=ORANGE).scale(0.70),
            Text("(慢)", font=CJK, color=ORANGE).scale(0.40),
        ).arrange(RIGHT, buff=0.10)
        v1_tag.move_to(LEFT*2.0 + UP*(R1 + 0.40) + DOWN*0.5)

        v2_tag = VGroup(
            MathTex(r"v_2", color=RED).scale(0.70),
            Text("(快)", font=CJK, color=RED).scale(0.40),
        ).arrange(RIGHT, buff=0.10)
        v2_tag.move_to(UP*(R1 + 0.40) + DOWN*0.5)

        self.play(Create(v1_arrows), Create(v1_arrows_R))
        self.play(Create(v2_arrows))
        self.play(FadeIn(v1_tag), FadeIn(v2_tag))
        self.wait(1.8)

        # ── 俯视截面圆形对比（左下角插图）──────────────────────────
        circle_label = Text("截面俯视对比", font=CJK, color=WHITE).scale(0.38)
        circle_label.to_corner(DL, buff=0.40)

        circ1 = Circle(radius=0.55, color=BLUE, fill_color=BLUE, fill_opacity=0.30, stroke_width=2.5)
        circ1.next_to(circle_label, RIGHT, buff=0.25).shift(UP*0.02)
        c1_txt = VGroup(
            MathTex(r"S_1", color=BLUE).scale(0.52),
        ).next_to(circ1, DOWN, buff=0.10)

        circ2 = Circle(radius=0.33, color=RED, fill_color=RED, fill_opacity=0.45, stroke_width=2.5)
        circ2.next_to(circ1, RIGHT, buff=0.40)
        c2_txt = VGroup(
            MathTex(r"S_2", color=RED).scale(0.52),
        ).next_to(circ2, DOWN, buff=0.10)

        # 渐变填色：用 FadeIn + GrowFromCenter 演示大小差异
        self.play(FadeIn(circle_label))
        self.play(GrowFromCenter(circ1), FadeIn(c1_txt))
        self.play(GrowFromCenter(circ2), FadeIn(c2_txt))
        self.wait(1.6)

        # 清场第二幕
        self.play(FadeOut(VGroup(
            artery_normal, plaque_grp,
            v1_arrows, v1_arrows_R, v2_arrows, v1_tag, v2_tag,
            vel_label, circle_label, circ1, c1_txt, circ2, c2_txt
        )))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 6: 第三幕 — 题目已知条件
        # ═══════════════════════════════════════════════════════════════
        solve_label = Text("例题求解", font=CJK, color=CYAN).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(solve_label))

        known_title = Text("已知条件", font=CJK, color=WHITE).scale(0.46)
        known_title.next_to(solve_label, DOWN, buff=0.40)

        k1 = VGroup(
            Text("正常段半径  ", font=CJK).scale(0.44),
            MathTex(r"r_1 = 1.0\ \mathrm{cm}").scale(0.70),
        ).arrange(RIGHT, buff=0.10)
        k2 = VGroup(
            Text("狭窄段半径  ", font=CJK).scale(0.44),
            MathTex(r"r_2 = 0.6\ \mathrm{cm}").scale(0.70),
        ).arrange(RIGHT, buff=0.10)
        k3 = VGroup(
            Text("狭窄处流速  ", font=CJK).scale(0.44),
            MathTex(r"v_2 = 0.5\ \mathrm{m/s}").scale(0.70),
        ).arrange(RIGHT, buff=0.10)
        k3[1].set_color(YELLOW)

        known_grp = VGroup(k1, k2, k3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        known_grp.next_to(known_title, DOWN, buff=0.30)
        known_grp.to_edge(LEFT, buff=1.2)

        self.play(FadeIn(known_title))
        self.play(FadeIn(k1))
        self.play(FadeIn(k2))
        self.play(FadeIn(k3))
        self.wait(1.4)

        ask = VGroup(
            Text("求：正常段流速  ", font=CJK, color=ORANGE).scale(0.46),
            MathTex(r"v_1 = \,?", color=ORANGE).scale(0.80),
        ).arrange(RIGHT, buff=0.10)
        ask.next_to(known_grp, DOWN, buff=0.40).to_edge(LEFT, buff=1.2)
        self.play(FadeIn(ask))
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════
        # Step 7: 逐步推导（右侧列）
        # ═══════════════════════════════════════════════════════════════
        step_label = Text("推导步骤", font=CJK, color=WHITE).scale(0.46)
        step_label.next_to(solve_label, DOWN, buff=0.40).to_edge(RIGHT, buff=2.0)

        # 步骤 A：写出连续性方程
        stA = MathTex(r"S_1 v_1 = S_2 v_2").scale(0.80).set_color(WHITE)
        stA.next_to(step_label, DOWN, buff=0.32)

        # 步骤 B：代入 S=πr²
        stB = MathTex(r"\pi r_1^2 \, v_1 = \pi r_2^2 \, v_2").scale(0.80).set_color(WHITE)
        stB.next_to(stA, DOWN, buff=0.30)

        # 步骤 C：解出 v1
        stC = MathTex(
            r"v_1 = \frac{r_2^2}{r_1^2} \, v_2"
        ).scale(0.80)
        stC.next_to(stB, DOWN, buff=0.30)
        stC.set_color(YELLOW)

        # 步骤 D：代入数值
        stD = MathTex(
            r"v_1 = \frac{(0.6)^2}{(1.0)^2} \times 0.5"
        ).scale(0.78)
        stD.next_to(stC, DOWN, buff=0.30)

        # 步骤 E：最终结果
        stE = MathTex(r"v_1 = 0.36 \times 0.5 = 0.18\ \mathrm{m/s}").scale(0.80)
        stE.next_to(stD, DOWN, buff=0.30)
        stE.set_color(GREEN)

        self.play(FadeIn(step_label))
        self.play(Write(stA))
        self.wait(1.0)
        self.play(TransformMatchingTex(stA.copy(), stB))
        self.wait(1.0)
        self.play(Write(stC))
        self.wait(1.0)
        self.play(Write(stD))
        self.wait(0.8)
        self.play(Write(stE))
        self.wait(0.5)

        # 高亮框住结果
        box_result = SurroundingRectangle(stE, color=GREEN, buff=0.18, corner_radius=0.12)
        self.play(Create(box_result))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            solve_label, known_title, known_grp, ask,
            step_label, stA, stB, stC, stD, stE, box_result
        )))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 8: 结果对比可视化（速度箭头长短对比 + 数值标注）
        # ═══════════════════════════════════════════════════════════════
        compare_label = Text("流速直观对比", font=CJK, color=CYAN).scale(0.50)
        compare_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(compare_label))

        # 正常段：短箭头
        arr_v1 = Arrow(
            start=LEFT*2.8 + DOWN*0.5,
            end=LEFT*0.60 + DOWN*0.5,
            buff=0, color=ORANGE, stroke_width=6,
            max_tip_length_to_length_ratio=0.20
        )
        v1_val = VGroup(
            MathTex(r"v_1 = 0.18\ \mathrm{m/s}", color=ORANGE).scale(0.72),
        )
        v1_val.next_to(arr_v1, UP, buff=0.25)
        v1_region_lbl = Text("正常段", font=CJK, color=ORANGE).scale(0.42)
        v1_region_lbl.next_to(arr_v1, DOWN, buff=0.25)

        # 狭窄段：长箭头（速度为正常段 2.78×）
        arr_v2 = Arrow(
            start=RIGHT*0.40 + DOWN*0.5,
            end=RIGHT*3.50 + DOWN*0.5,
            buff=0, color=RED, stroke_width=6,
            max_tip_length_to_length_ratio=0.15
        )
        v2_val = VGroup(
            MathTex(r"v_2 = 0.50\ \mathrm{m/s}", color=RED).scale(0.72),
        )
        v2_val.next_to(arr_v2, UP, buff=0.25)
        v2_region_lbl = Text("狭窄段", font=CJK, color=RED).scale(0.42)
        v2_region_lbl.next_to(arr_v2, DOWN, buff=0.25)

        # 竖线分隔两段
        divider = DashedLine(DOWN*0.5+UP*0.7, DOWN*0.5+DOWN*1.3, color=WHITE, dash_length=0.15)

        self.play(Create(arr_v1), FadeIn(v1_val), FadeIn(v1_region_lbl))
        self.play(Create(divider))
        self.play(Create(arr_v2), FadeIn(v2_val), FadeIn(v2_region_lbl))
        self.wait(1.0)

        # 增速倍率标注
        ratio_note = VGroup(
            Text("速度之比：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\frac{v_2}{v_1} = \frac{0.50}{0.18} \approx 2.78", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.12)
        ratio_note.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(ratio_note))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            compare_label, arr_v1, v1_val, v1_region_lbl,
            arr_v2, v2_val, v2_region_lbl, divider, ratio_note
        )))
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════════
        # Step 9: 小结卡（关键公式汇总 + 方框）
        # ═══════════════════════════════════════════════════════════════
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.56).next_to(title, DOWN, buff=0.45)

        s1_row = VGroup(
            Text("连续性方程  ", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"S_1 v_1 = S_2 v_2", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        s2_row = VGroup(
            Text("代入圆截面  ", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"v_1 = \frac{r_2^2}{r_1^2}\,v_2", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        s3_row = VGroup(
            Text("正常段流速  ", font=CJK, color=GREEN).scale(0.50),
            MathTex(r"v_1 = 0.18\ \mathrm{m/s}", color=GREEN).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        s4_row = VGroup(
            Text("狭窄段流速  ", font=CJK, color=RED).scale(0.50),
            MathTex(r"v_2 = 0.50\ \mathrm{m/s}", color=RED).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        s5_row = Text(
            "截面积越小 → 流速越大  （面积比 0.36 → 流速比 1/0.36 ≈ 2.78）",
            font=CJK, color=CYAN
        ).scale(0.40)

        summary_grp = VGroup(s1_row, s2_row, s3_row, s4_row, s5_row).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary_grp.next_to(s_title, DOWN, buff=0.40)
        summary_grp.scale_to_fit_width(11.5)
        summary_grp.center().next_to(s_title, DOWN, buff=0.40)

        box_summary = SurroundingRectangle(summary_grp, color=BLUE, buff=0.30, corner_radius=0.18)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1_row))
        self.play(FadeIn(s2_row))
        self.play(FadeIn(s3_row), FadeIn(s4_row))
        self.play(FadeIn(s5_row))
        self.play(Create(box_summary))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary_grp, box_summary, title)))
        self.wait(0.4)
