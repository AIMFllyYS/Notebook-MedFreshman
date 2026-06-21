"""第 9.4 节 · 位移电流与麦克斯韦方程组。

两幕结构：
  第一幕 —— 平行板电容器充电电路：传导电流（红色粒子）→ 极板间位移电流（绿色虚线箭头）
            → ValueTracker 让 E 增大 → 全电流封闭回路 → 极板边缘环形磁场（蓝色圆环）
  第二幕 —— 麦克斯韦四方程组：四彩色方框逐一淡入 + 文字说明 → E 与 B 互激引出电磁波

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch09Kp1DisplacementCurrentMaxwell(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("位移电流与麦克斯韦方程组", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.4", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("给电容器充电时，电流在导线里流动。", font=CJK).scale(0.48)
        ana2 = Text("但极板之间是绝缘的——电流怎么「穿过」去？", font=CJK).scale(0.48)
        ana3 = Text("麦克斯韦天才地补上了答案：变化的电场本身就等效于电流！", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 位移电流定义公式
        # ═══════════════════════════════════════════════════════════════════
        def_label = Text("位移电流定义", font=CJK, color=CYAN).scale(0.5).next_to(title, DOWN, buff=0.5)
        id_def = MathTex(r"I_d = \varepsilon_0 \frac{\mathrm{d}\Phi_E}{\mathrm{d}t}",
                         color=GREEN).scale(1.1)
        id_def.next_to(def_label, DOWN, buff=0.35)
        note1 = Text("其中", font=CJK).scale(0.44)
        note2 = MathTex(r"\Phi_E = \iint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S}",
                        color=YELLOW).scale(0.82)
        note_row = VGroup(note1, note2).arrange(RIGHT, buff=0.18)
        note_row.next_to(id_def, DOWN, buff=0.3)
        note3 = Text("电通量对时间的变化率，产生等效的「位移电流」", font=CJK, color=WHITE).scale(0.42)
        note3.next_to(note_row, DOWN, buff=0.28)

        self.play(FadeIn(def_label))
        self.play(Write(id_def))
        self.wait(1.0)
        self.play(FadeIn(note_row))
        self.wait(0.8)
        self.play(FadeIn(note3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_label, id_def, note_row, note3)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 平行板电容器电路图 — 画导线 + 电池 + 极板
        # ═══════════════════════════════════════════════════════════════════
        # 布局：电路图放在画面左半区，右侧留给说明文字
        circuit_origin = LEFT * 2.8 + DOWN * 0.3

        # 导线矩形回路（宽 3.2，高 2.6）
        w, h = 3.2, 2.6
        cx, cy = circuit_origin[0], circuit_origin[1]
        # 顶导线、左导线、底导线、右侧留给极板
        top_wire = Line(
            [cx - w / 2, cy + h / 2, 0], [cx + w / 2, cy + h / 2, 0],
            color=WHITE, stroke_width=2.5
        )
        left_wire = Line(
            [cx - w / 2, cy + h / 2, 0], [cx - w / 2, cy - h / 2, 0],
            color=WHITE, stroke_width=2.5
        )
        bot_wire = Line(
            [cx - w / 2, cy - h / 2, 0], [cx + w / 2, cy - h / 2, 0],
            color=WHITE, stroke_width=2.5
        )

        # 电池符号（左侧导线中间）
        batt_cx = cx - w / 2
        batt_cy = cy
        batt_long = Line([batt_cx - 0.18, batt_cy - 0.04, 0],
                         [batt_cx + 0.18, batt_cy - 0.04, 0], color=WHITE, stroke_width=3)
        batt_short = Line([batt_cx - 0.10, batt_cy + 0.04, 0],
                          [batt_cx + 0.10, batt_cy + 0.04, 0], color=WHITE, stroke_width=5)
        batt = VGroup(batt_long, batt_short)

        # 平行板（右侧，距中心 ±0.22 水平）
        plate_x = cx + w / 2
        plate_gap = 0.44  # 极板间距
        plate_h = 1.2
        left_plate = Line(
            [plate_x - plate_gap / 2, cy - plate_h / 2, 0],
            [plate_x - plate_gap / 2, cy + plate_h / 2, 0],
            color=ORANGE, stroke_width=5
        )
        right_plate = Line(
            [plate_x + plate_gap / 2, cy - plate_h / 2, 0],
            [plate_x + plate_gap / 2, cy + plate_h / 2, 0],
            color=ORANGE, stroke_width=5
        )
        # 极板连接到回路导线
        top_conn_L = Line([plate_x - plate_gap / 2, cy + plate_h / 2, 0],
                          [plate_x - plate_gap / 2, cy + h / 2, 0], color=WHITE, stroke_width=2.5)
        top_conn_R = Line([plate_x + plate_gap / 2, cy + plate_h / 2, 0],
                          [plate_x + plate_gap / 2, cy + h / 2, 0], color=WHITE, stroke_width=2.5)
        bot_conn_L = Line([plate_x - plate_gap / 2, cy - plate_h / 2, 0],
                          [plate_x - plate_gap / 2, cy - h / 2, 0], color=WHITE, stroke_width=2.5)
        bot_conn_R = Line([plate_x + plate_gap / 2, cy - plate_h / 2, 0],
                          [plate_x + plate_gap / 2, cy - h / 2, 0], color=WHITE, stroke_width=2.5)

        circuit_group = VGroup(top_wire, left_wire, bot_wire,
                               batt, left_plate, right_plate,
                               top_conn_L, top_conn_R, bot_conn_L, bot_conn_R)

        cap_label = Text("平行板电容器充电回路", font=CJK, color=ORANGE).scale(0.42)
        cap_label.next_to(circuit_group, DOWN, buff=0.3)

        self.play(Create(top_wire), Create(left_wire), Create(bot_wire))
        self.play(Create(left_plate), Create(right_plate),
                  Create(top_conn_L), Create(top_conn_R),
                  Create(bot_conn_L), Create(bot_conn_R))
        self.play(FadeIn(batt), FadeIn(cap_label))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 传导电流粒子（红色，沿导线流动）+ 说明
        # ═══════════════════════════════════════════════════════════════════
        # 在顶导线上画 3 个粒子，演示流向右侧
        num_particles = 4
        particles = VGroup()
        for i in range(num_particles):
            frac = (i + 1) / (num_particles + 1)
            px = (cx - w / 2) + frac * (plate_x - plate_gap / 2 - (cx - w / 2))
            dot = Dot(point=[px, cy + h / 2, 0], radius=0.09, color=RED)
            particles.add(dot)

        cond_label = VGroup(
            Text("传导电流", font=CJK, color=RED).scale(0.44),
            MathTex(r"I_0", color=RED).scale(0.7)
        ).arrange(RIGHT, buff=0.12)
        cond_label.next_to(title, DOWN, buff=0.55).to_edge(RIGHT, buff=0.5)

        self.play(FadeIn(particles), FadeIn(cond_label))
        # 让粒子沿顶导线向右平移
        target_x = plate_x - plate_gap / 2 - 0.05
        self.play(particles.animate.shift(RIGHT * 1.2), run_time=1.5)
        self.wait(0.5)
        self.play(FadeOut(particles))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker 让 E 场增大，极板间黄色 E 箭头
        # ═══════════════════════════════════════════════════════════════════
        E_tracker = ValueTracker(0.3)

        gap_cx = plate_x  # 极板间中心 x（极板对称中心）
        gap_cy = cy

        def make_E_arrows():
            arrows = VGroup()
            scale = E_tracker.get_value()
            num = 5
            for i in range(num):
                frac = (i + 1) / (num + 1)
                ay = (cy - plate_h / 2) + frac * plate_h
                length = 0.28 * scale
                arr = Arrow(
                    [gap_cx - plate_gap / 2 + 0.05, ay, 0],
                    [gap_cx + plate_gap / 2 - 0.05, ay, 0],
                    buff=0,
                    color=YELLOW,
                    stroke_width=2.5,
                    max_tip_length_to_length_ratio=0.35
                )
                # Arrow 已满极板间距，通过透明度表现强弱
                arr.set_opacity(min(1.0, 0.3 + 0.7 * scale))
                arrows.add(arr)
            return arrows

        E_arrows = always_redraw(make_E_arrows)
        self.add(E_arrows)

        E_readout = always_redraw(lambda: VGroup(
            Text("E 场强度：", font=CJK, color=YELLOW).scale(0.38),
            MathTex(rf"{E_tracker.get_value():.1f}\,E_0", color=YELLOW).scale(0.6)
        ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.55))
        self.add(E_readout)

        e_grow_note = Text("充电中：极板间 E 场随时间增大", font=CJK, color=YELLOW).scale(0.42)
        e_grow_note.next_to(cap_label, DOWN, buff=0.2)
        self.play(FadeIn(e_grow_note))
        self.play(E_tracker.animate.set_value(1.5), run_time=2.5)
        self.wait(0.8)

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 极板间位移电流（绿色虚线箭头，连续穿过间隙）
        # ═══════════════════════════════════════════════════════════════════
        # 竖直方向位移电流：从下极板到上极板穿过（表示 dΦ_E/dt > 0 → I_d 向右）
        # 这里用水平箭头穿越间隙（与 E 方向一致，表示位移电流方向）
        # 用 DashedLine + Arrow tip 模拟虚线箭头
        disp_arrows = VGroup()
        for i in range(3):
            frac = (i + 1) / 4
            ay = (cy - plate_h / 2 + 0.15) + frac * (plate_h - 0.3)
            d_line = DashedLine(
                [gap_cx - plate_gap / 2 - 0.02, ay, 0],
                [gap_cx + plate_gap / 2 + 0.02, ay, 0],
                color=GREEN, stroke_width=2.5, dash_length=0.07
            )
            tip = Arrow(
                [gap_cx + plate_gap / 2 - 0.12, ay, 0],
                [gap_cx + plate_gap / 2 + 0.08, ay, 0],
                buff=0, color=GREEN,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.6
            )
            disp_arrows.add(d_line, tip)

        disp_label = VGroup(
            Text("位移电流", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"I_d", color=GREEN).scale(0.7)
        ).arrange(RIGHT, buff=0.12)
        disp_label.next_to(cond_label, DOWN, buff=0.3)

        self.play(Create(disp_arrows), FadeIn(disp_label))
        self.wait(0.6)

        # 公式 I_d = ε₀ dΦ_E/dt 显示在右侧
        id_formula = MathTex(r"I_d = \varepsilon_0\frac{\mathrm{d}\Phi_E}{\mathrm{d}t}",
                             color=GREEN).scale(0.72)
        id_formula.next_to(disp_label, DOWN, buff=0.3)
        self.play(Write(id_formula))
        self.wait(1.2)

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: 全电流封闭回路 + 极板边缘环形磁场
        # ═══════════════════════════════════════════════════════════════════
        full_note = Text("传导电流 + 位移电流 = 全电流，形成封闭回路", font=CJK, color=CYAN).scale(0.41)
        full_note.next_to(id_formula, DOWN, buff=0.25)
        self.play(FadeIn(full_note))
        self.wait(0.8)

        # 在极板上下边缘各画一个蓝色椭圆（环形磁场截面）
        mag_ring_top = Ellipse(width=1.0, height=0.35, color=BLUE, stroke_width=2.5)
        mag_ring_top.move_to([gap_cx, cy + plate_h / 2 + 0.22, 0])
        mag_ring_bot = Ellipse(width=1.0, height=0.35, color=BLUE, stroke_width=2.5)
        mag_ring_bot.move_to([gap_cx, cy - plate_h / 2 - 0.22, 0])

        # 小箭头表示环绕方向（右手定则）
        def ring_arrow(center, y_offset):
            return Arrow(
                [center[0] - 0.3, center[1] + y_offset, 0],
                [center[0] + 0.3, center[1] + y_offset, 0],
                buff=0, color=BLUE, stroke_width=2,
                max_tip_length_to_length_ratio=0.4
            )

        top_c = mag_ring_top.get_center()
        bot_c = mag_ring_bot.get_center()
        arr_top = ring_arrow(top_c, 0.12)
        arr_bot = ring_arrow(bot_c, 0.12)

        B_ring_label = Text("环形磁场（全电流产生）", font=CJK, color=BLUE).scale(0.41)
        B_ring_label.next_to(full_note, DOWN, buff=0.22)

        self.play(Create(mag_ring_top), Create(mag_ring_bot))
        self.play(GrowArrow(arr_top), GrowArrow(arr_bot))
        self.play(FadeIn(B_ring_label))
        self.wait(1.5)

        # 清场第一幕
        act1_all = VGroup(
            circuit_group, cap_label, cond_label,
            E_arrows, E_readout, e_grow_note,
            disp_arrows, disp_label, id_formula,
            full_note, mag_ring_top, mag_ring_bot,
            arr_top, arr_bot, B_ring_label
        )
        self.play(FadeOut(act1_all))
        self.wait(0.4)

        # ═══════════════════════════════════════════════════════════════════
        # Step 9: 第二幕 —— 麦克斯韦方程组（四方框逐一淡入）
        # ═══════════════════════════════════════════════════════════════════
        act2_title = Text("麦克斯韦方程组", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(act2_title))
        self.wait(0.6)

        # 四个方程的内容（公式 + 中文说明）
        eq_data = [
            {
                "formula": r"\oint_S \mathbf{E}\cdot\mathrm{d}\mathbf{S} = \frac{Q}{\varepsilon_0}",
                "label": "电场高斯定理",
                "meaning": "电荷产生 E 场（有源）",
                "color": YELLOW,
            },
            {
                "formula": r"\oint_S \mathbf{B}\cdot\mathrm{d}\mathbf{S} = 0",
                "label": "磁场高斯定理",
                "meaning": "无磁单极（无源）",
                "color": ORANGE,
            },
            {
                "formula": r"\oint_L \mathbf{E}\cdot\mathrm{d}\mathbf{l} = -\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}",
                "label": "法拉第定律",
                "meaning": "变化 B 产生涡旋 E",
                "color": GREEN,
            },
            {
                "formula": r"\oint_L \mathbf{B}\cdot\mathrm{d}\mathbf{l} = \mu_0 I_0 + \mu_0\varepsilon_0\frac{\mathrm{d}\Phi_E}{\mathrm{d}t}",
                "label": "安培-麦克斯韦定律",
                "meaning": "电流和变化 E 产生涡旋 B",
                "color": CYAN,
            },
        ]

        # 四个方框排成 2×2
        boxes = VGroup()
        box_items = []  # store (box, content) for later use
        for idx, ed in enumerate(eq_data):
            row = idx // 2
            col = idx % 2

            eq_label = Text(ed["label"], font=CJK, color=ed["color"]).scale(0.42)
            eq_formula = MathTex(ed["formula"], color=WHITE).scale(0.58)
            eq_meaning = Text(ed["meaning"], font=CJK, color=WHITE).scale(0.37)
            eq_meaning.set_opacity(0.85)

            content = VGroup(eq_label, eq_formula, eq_meaning).arrange(DOWN, buff=0.18)
            content.scale_to_fit_width(3.0)
            rect = SurroundingRectangle(content, color=ed["color"], buff=0.18, corner_radius=0.1)
            grp = VGroup(rect, content)
            box_items.append(grp)

        # 手动排布 2×2
        box_items[0].move_to(LEFT * 3.2 + UP * 1.2)
        box_items[1].move_to(RIGHT * 0.3 + UP * 1.2)
        box_items[2].move_to(LEFT * 3.2 + DOWN * 1.4)
        box_items[3].move_to(RIGHT * 0.3 + DOWN * 1.4)

        for grp in box_items:
            boxes.add(grp)

        # 依次淡入四个方框
        for i, grp in enumerate(box_items):
            self.play(FadeIn(grp), run_time=0.9)
            self.wait(0.9)

        self.wait(0.8)

        # ═══════════════════════════════════════════════════════════════════
        # Step 10: E 与 B 互相激发 → 引出电磁波
        # ═══════════════════════════════════════════════════════════════════
        # 在第③（法拉第）和第④（安培麦克斯韦）之间画双向箭头
        # 位于画面右侧区域
        arrow_right = RIGHT * 3.8
        em_wave_label = Text("E 与 B 互相激发", font=CJK, color=YELLOW).scale(0.46)
        em_wave_label.to_edge(RIGHT, buff=0.35).shift(UP * 0.2)

        # 双向箭头（竖直，连接 ③ 和 ④ 的右侧区域）
        dbl_arrow = DoubleArrow(
            start=em_wave_label.get_bottom() + DOWN * 0.15,
            end=em_wave_label.get_bottom() + DOWN * 1.1,
            color=YELLOW, buff=0, stroke_width=3,
            max_tip_length_to_length_ratio=0.3
        )
        em_conclusion = Text("电磁波！", font=CJK, color=RED).scale(0.55)
        em_conclusion.next_to(dbl_arrow, DOWN, buff=0.15)

        self.play(FadeIn(em_wave_label), GrowArrow(dbl_arrow))
        self.wait(0.6)
        self.play(Write(em_conclusion))
        self.wait(1.5)

        # ═══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(boxes, em_wave_label, dbl_arrow, em_conclusion, act2_title)))
        self.wait(0.3)

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1_row = VGroup(
            Text("位移电流：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"I_d = \varepsilon_0\frac{\mathrm{d}\Phi_E}{\mathrm{d}t}", color=GREEN).scale(0.75)
        ).arrange(RIGHT, buff=0.12)

        s2_row = VGroup(
            Text("安培-麦克斯韦：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"\oint_L \mathbf{B}\cdot\mathrm{d}\mathbf{l} = \mu_0 I_0 + \mu_0\varepsilon_0\frac{\mathrm{d}\Phi_E}{\mathrm{d}t}",
                    color=CYAN).scale(0.62)
        ).arrange(RIGHT, buff=0.12)

        s3_row = VGroup(
            Text("全电流连续：传导电流 + 位移电流 → 封闭回路", font=CJK, color=YELLOW).scale(0.43),
        )

        s4_row = VGroup(
            Text("四大方程 → 变化 E 激发 B，变化 B 激发 E → 电磁波", font=CJK, color=RED).scale(0.43),
        )

        summary = VGroup(s1_row, s2_row, s3_row, s4_row).arrange(DOWN, buff=0.35)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)
        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1_row), run_time=0.9)
        self.wait(0.6)
        self.play(Write(s2_row), run_time=0.9)
        self.wait(0.6)
        self.play(FadeIn(s3_row))
        self.wait(0.6)
        self.play(FadeIn(s4_row))
        self.play(Create(box_s))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, s_title, summary, box_s)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp1DisplacementCurrentMaxwell",
        "id": "phys-ch09-9.4-kp1-displacement-current-maxwell",
        "chapterId": "ch09",
        "sectionId": "9.4",
        "title": "位移电流与麦克斯韦方程组",
        "description": "用平行板电容器充电动画展示位移电流与全电流连续性，再用四彩框逐步呈现麦克斯韦方程组，引出 E 与 B 互激产生电磁波。",
    },
]
