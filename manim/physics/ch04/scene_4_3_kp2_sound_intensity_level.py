"""第 4.3 节 · 声强级与对数标度（知识点 2）

可视化方案：
  Step1  标题
  Step2  生活类比：人耳动态范围
  Step3  声强定义 + I0 参考值
  Step4  声强级公式（逐行高亮）
  Step5  线性轴演示——12 量级根本塞不下
  Step6  对数轴登场——所有典型声音一目了然
  Step7  典型声音标注（低语→正常谈话→摩托→飞机发动机）
  Step8  ValueTracker：拖动 L1/L2 滑块，实时显示 ΔL 与 I1/I2 比值
  Step9  特例冲击：ΔL=10 dB→10倍，20 dB→100倍，60 dB→10⁶倍
  Step10 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 常量：典型声音 (label_zh, I in W/m², dB) ──────────────────────────────
SOUNDS = [
    ("听觉阈值", 1e-12, 0),
    ("低语", 1e-10, 20),
    ("图书馆", 1e-9, 30),
    ("正常谈话", 1e-6, 60),
    ("摩托车", 1e-3, 90),
    ("摇滚演唱会", 1e-1, 110),
    ("飞机发动机", 1e0, 120),
]

# 对数轴映射：I (W/m²) → x 位置（0~1 对应 10^-12 ~ 10^0）
LOG_MIN = -12   # 10^-12
LOG_MAX = 0     # 10^0


def log_pos(I_val, x_left=-5.5, x_right=5.5):
    """把 I 映射到画面 x 坐标（对数轴）"""
    frac = (math.log10(I_val) - LOG_MIN) / (LOG_MAX - LOG_MIN)
    return x_left + frac * (x_right - x_left)


class Ch04Kp2SoundIntensityLevel(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("声强级与对数标度", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        sub1 = Text("第四章 机械波 · 4.3  声强与声强级", font=CJK, color=WHITE).scale(0.4)
        sub2 = Text("人耳感知范围横跨 12 个量级——对数刻度是唯一出路", font=CJK, color=CYAN).scale(0.38)
        subs = VGroup(sub1, sub2).arrange(DOWN, buff=0.15).next_to(title, DOWN, buff=0.2)
        self.play(Write(title), FadeIn(subs))
        self.wait(1.8)
        self.play(FadeOut(subs))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("人耳能听到的最轻声音（听觉阈值）：", font=CJK, color=WHITE).scale(0.46)
        a1_math = MathTex(r"I_0 = 10^{-12}\;\mathrm{W/m^2}").scale(0.7).set_color(YELLOW)
        a2 = Text("飞机发动机旁边的声强：", font=CJK, color=WHITE).scale(0.46)
        a2_math = MathTex(r"I \approx 1\;\mathrm{W/m^2}").scale(0.7).set_color(ORANGE)
        a3 = Text("两者相差整整 1,000,000,000,000 倍（一万亿倍）！", font=CJK, color=RED).scale(0.46)
        a4 = Text("线性刻度根本无法同屏显示——必须用对数。", font=CJK, color=GREEN).scale(0.46)

        ana = VGroup(
            VGroup(a1, a1_math).arrange(RIGHT, buff=0.2),
            VGroup(a2, a2_math).arrange(RIGHT, buff=0.2),
            a3,
            a4,
        ).arrange(DOWN, buff=0.35).next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)

        self.play(FadeIn(ana[0]))
        self.wait(0.8)
        self.play(FadeIn(ana[1]))
        self.wait(0.8)
        self.play(FadeIn(ana[2]))
        self.wait(0.8)
        self.play(FadeIn(ana[3]))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 声强级公式定义（逐步）
        # ══════════════════════════════════════════════════════════════════
        def_title = Text("声强级定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_title))

        eq1 = MathTex(
            r"L_I", r"=", r"10", r"\lg", r"\frac{I}{I_0}", r"\;\mathrm{dB}"
        ).scale(1.0).next_to(def_title, DOWN, buff=0.45)
        eq1[0].set_color(GREEN)
        eq1[2].set_color(YELLOW)
        eq1[3].set_color(YELLOW)
        eq1[4].set_color(ORANGE)

        self.play(Write(eq1))
        self.wait(0.8)

        note_i0 = VGroup(
            Text("其中参考声强", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"I_0 = 10^{-12}\;\mathrm{W\cdot m^{-2}}").scale(0.7).set_color(YELLOW),
            Text("（人耳听觉阈值）", font=CJK, color=WHITE).scale(0.44),
        ).arrange(RIGHT, buff=0.2).next_to(eq1, DOWN, buff=0.35)

        self.play(FadeIn(note_i0))
        self.wait(1.0)

        # 衍生关系
        eq2 = MathTex(
            r"\frac{I_1}{I_2}", r"=", r"10^{(L_1 - L_2)/10}"
        ).scale(0.9).next_to(note_i0, DOWN, buff=0.4)
        eq2[0].set_color(CYAN)
        eq2[2].set_color(ORANGE)
        label_eq2 = Text("两声强之比与声强级差的关系", font=CJK, color=GREEN).scale(0.42)
        label_eq2.next_to(eq2, DOWN, buff=0.22)

        self.play(Write(eq2))
        self.play(FadeIn(label_eq2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_title, eq1, note_i0, eq2, label_eq2)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 线性轴——为什么不行
        # ══════════════════════════════════════════════════════════════════
        fail_title = Text("用线性刻度试试看……", font=CJK, color=RED).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(fail_title))

        # 画一条简单的线性轴（范围 0~1 W/m²）
        lin_ax = NumberLine(
            x_range=[0, 1, 0.5],
            length=11,
            include_tip=True,
            include_numbers=True,
            color=RED,
        ).shift(DOWN * 0.4)
        lin_label = MathTex(r"I\;(\mathrm{W/m^2})").scale(0.55).set_color(RED)
        lin_label.next_to(lin_ax, DOWN, buff=0.25)

        self.play(Create(lin_ax), FadeIn(lin_label))
        self.wait(0.5)

        # 飞机 dot 在最右端
        plane_dot = Dot(lin_ax.n2p(1.0), color=ORANGE, radius=0.10)
        plane_txt = Text("飞机", font=CJK, color=ORANGE).scale(0.38).next_to(plane_dot, UP, buff=0.15)
        self.play(FadeIn(plane_dot), FadeIn(plane_txt))
        self.wait(0.5)

        # 低语 dot：几乎在最左端，肉眼根本看不到差别
        whisper_dot = Dot(lin_ax.n2p(1e-10), color=GREEN, radius=0.08)
        whisper_txt = Text("低语 (10⁻¹⁰)", font=CJK, color=GREEN).scale(0.34).next_to(lin_ax, UP, buff=0.25).shift(LEFT * 4.5)
        self.play(FadeIn(whisper_dot), FadeIn(whisper_txt))
        self.wait(0.5)

        fail_note = Text("低语与阈值完全压缩在 0 刻度处，无法区分！", font=CJK, color=RED).scale(0.44)
        fail_note.next_to(lin_ax, DOWN, buff=0.55)
        self.play(FadeIn(fail_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(fail_title, lin_ax, lin_label,
                                  plane_dot, plane_txt,
                                  whisper_dot, whisper_txt, fail_note)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 对数轴登场——12 个量级全部清晰可辨
        # ══════════════════════════════════════════════════════════════════
        log_title = Text("改用对数轴：12 个量级轻松入画", font=CJK, color=GREEN).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(log_title))

        # ── 手动绘制对数轴 ──────────────────────────────────────────────
        AX_LEFT = -5.5
        AX_RIGHT = 5.5
        AX_Y = -0.2   # 轴的 y 坐标

        log_axis_line = Line(
            start=[AX_LEFT, AX_Y, 0],
            end=[AX_RIGHT, AX_Y, 0],
            color=WHITE,
            stroke_width=3,
        )
        arrow_tip = Arrow(
            start=[AX_RIGHT - 0.3, AX_Y, 0],
            end=[AX_RIGHT + 0.1, AX_Y, 0],
            buff=0,
            color=WHITE,
            stroke_width=2,
            tip_length=0.18,
        )
        ax_label = MathTex(r"I\;(\mathrm{W/m^2})").scale(0.5).set_color(WHITE)
        ax_label.move_to([AX_RIGHT + 0.8, AX_Y, 0])

        # dB 轴（顶部）
        db_label = MathTex(r"L_I\;(\mathrm{dB})").scale(0.5).set_color(GREEN)
        db_label.move_to([AX_RIGHT + 0.8, AX_Y + 1.0, 0])

        tick_group = VGroup()
        power_labels = VGroup()
        db_labels_grp = VGroup()

        for exp in range(LOG_MIN, LOG_MAX + 1):  # -12 … 0
            I_val = 10.0 ** exp
            xp = log_pos(I_val, AX_LEFT, AX_RIGHT)
            # 刻度线
            tick = Line([xp, AX_Y - 0.12, 0], [xp, AX_Y + 0.12, 0], color=WHITE, stroke_width=1.5)
            tick_group.add(tick)
            # I 标注（10^exp，每隔3格才显示，避免拥挤）
            if exp % 3 == 0:
                lbl = MathTex(r"10^{" + str(exp) + r"}").scale(0.28).set_color(CYAN)
                lbl.move_to([xp, AX_Y - 0.45, 0])
                power_labels.add(lbl)
            # dB 标注：L = 10*(exp - (-12)) = 10*(exp+12)
            db_val = 10 * (exp - LOG_MIN)
            if db_val % 30 == 0:
                dbl = MathTex(r"\mathbf{" + str(db_val) + r"}").scale(0.28).set_color(GREEN)
                dbl.move_to([xp, AX_Y + 0.55, 0])
                db_labels_grp.add(dbl)

        self.play(
            Create(log_axis_line),
            Create(arrow_tip),
            FadeIn(ax_label),
            FadeIn(db_label),
        )
        self.play(Create(tick_group), FadeIn(power_labels), FadeIn(db_labels_grp))
        self.wait(1.0)

        # ── Step 6: 典型声音标注 ──────────────────────────────────────────
        sound_dots = VGroup()
        sound_labels = VGroup()
        color_list = [WHITE, CYAN, CYAN, YELLOW, ORANGE, RED, RED]

        for i, (name_zh, I_val, db_val) in enumerate(SOUNDS):
            xp = log_pos(I_val, AX_LEFT, AX_RIGHT)
            col = color_list[i]
            dot = Dot([xp, AX_Y, 0], radius=0.09, color=col)
            # 交替上下放置，防止标签重叠
            offset_y = 0.95 if i % 2 == 0 else -0.95
            # 中文 + dB 混排
            zh_lbl = Text(name_zh, font=CJK, color=col).scale(0.3)
            db_lbl = MathTex(r"(" + str(db_val) + r"\,\mathrm{dB})").scale(0.28).set_color(col)
            combo = VGroup(zh_lbl, db_lbl).arrange(RIGHT, buff=0.08)
            combo.move_to([xp, AX_Y + offset_y, 0])
            # 连线
            connector = DashedLine(
                [xp, AX_Y + (0.12 if offset_y > 0 else -0.12), 0],
                [xp, AX_Y + (offset_y - 0.35 if offset_y > 0 else offset_y + 0.35), 0],
                color=col,
                stroke_width=1.2,
            )
            sound_dots.add(dot)
            sound_labels.add(VGroup(combo, connector))

        self.play(
            LaggedStart(*[FadeIn(d) for d in sound_dots], lag_ratio=0.18),
        )
        self.play(
            LaggedStart(*[FadeIn(sl) for sl in sound_labels], lag_ratio=0.18),
        )
        self.wait(2.0)

        # 清场（保留轴供下一步复用）
        axis_group = VGroup(log_axis_line, arrow_tip, ax_label, db_label,
                             tick_group, power_labels, db_labels_grp)
        self.play(FadeOut(VGroup(sound_dots, sound_labels, log_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: ValueTracker — 拖动 L1、L2，实时显示 ΔL 与 I1/I2
        # ══════════════════════════════════════════════════════════════════
        delta_title = Text("拖动两条声强级游标，看比值如何变化", font=CJK, color=BLUE).scale(0.45)
        delta_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(delta_title))

        L1_tracker = ValueTracker(90)    # dB，初始：摩托车
        L2_tracker = ValueTracker(60)    # dB，初始：正常谈话

        def db_to_x(db):
            # dB = 10*(exp+12)  =>  exp = db/10 - 12  =>  fraction = (db/10)/12
            frac = (db / 10.0) / (LOG_MAX - LOG_MIN)
            return AX_LEFT + frac * (AX_RIGHT - AX_LEFT)

        # 游标 1（橙色）
        cursor1 = always_redraw(lambda: Line(
            [db_to_x(L1_tracker.get_value()), AX_Y - 0.5, 0],
            [db_to_x(L1_tracker.get_value()), AX_Y + 0.5, 0],
            color=ORANGE, stroke_width=3,
        ))
        label1 = always_redraw(lambda: VGroup(
            MathTex(r"L_1=").scale(0.42).set_color(ORANGE),
            MathTex(r"{:.0f}".format(L1_tracker.get_value()) + r"\,\mathrm{dB}").scale(0.42).set_color(ORANGE),
        ).arrange(RIGHT, buff=0.05).move_to([db_to_x(L1_tracker.get_value()), AX_Y + 1.05, 0]))

        # 游标 2（黄色）
        cursor2 = always_redraw(lambda: Line(
            [db_to_x(L2_tracker.get_value()), AX_Y - 0.5, 0],
            [db_to_x(L2_tracker.get_value()), AX_Y + 0.5, 0],
            color=YELLOW, stroke_width=3,
        ))
        label2 = always_redraw(lambda: VGroup(
            MathTex(r"L_2=").scale(0.42).set_color(YELLOW),
            MathTex(r"{:.0f}".format(L2_tracker.get_value()) + r"\,\mathrm{dB}").scale(0.42).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.05).move_to([db_to_x(L2_tracker.get_value()), AX_Y - 1.1, 0]))

        # 双向箭头（游标之间）
        delta_arrow = always_redraw(lambda: DoubleArrow(
            start=[db_to_x(L2_tracker.get_value()), AX_Y + 0.3, 0],
            end=[db_to_x(L1_tracker.get_value()), AX_Y + 0.3, 0],
            buff=0,
            color=CYAN,
            stroke_width=2,
            tip_length=0.15,
        ))

        # 右侧信息面板
        panel_bg = Rectangle(width=4.2, height=2.2, fill_color="#111122",
                              fill_opacity=0.92, stroke_color=CYAN, stroke_width=1.5)
        panel_bg.move_to([4.2, AX_Y - 2.2, 0])

        delta_display = always_redraw(lambda: VGroup(
            VGroup(
                Text("声强级差", font=CJK, color=WHITE).scale(0.38),
                MathTex(r"\Delta L=").scale(0.5).set_color(CYAN),
                MathTex(r"{:.0f}".format(L1_tracker.get_value() - L2_tracker.get_value()) + r"\,\mathrm{dB}").scale(0.5).set_color(CYAN),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                Text("声强之比", font=CJK, color=WHITE).scale(0.38),
                MathTex(r"\frac{I_1}{I_2}=").scale(0.5).set_color(ORANGE),
                MathTex(
                    r"10^{" + r"{:.1f}".format((L1_tracker.get_value() - L2_tracker.get_value()) / 10.0) + r"}"
                ).scale(0.5).set_color(ORANGE),
            ).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, buff=0.3).move_to(panel_bg.get_center()))

        self.add(cursor1, cursor2, label1, label2, delta_arrow, panel_bg, delta_display)
        self.wait(1.0)

        # 动画：L1 从 90 升到 120，演示 ΔL 变化
        self.play(L1_tracker.animate.set_value(120), run_time=2.5, rate_func=smooth)
        self.wait(0.8)
        self.play(L2_tracker.animate.set_value(0), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(L1_tracker.animate.set_value(60), L2_tracker.animate.set_value(30), run_time=1.8, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(cursor1, cursor2, label1, label2,
                                  delta_arrow, panel_bg, delta_display,
                                  delta_title, axis_group)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 特例冲击动画：ΔL = 10 / 20 / 60 dB 对应的倍数
        # ══════════════════════════════════════════════════════════════════
        impact_title = Text("特例：声强级差 → 声强倍数", font=CJK, color=BLUE).scale(0.52)
        impact_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(impact_title))

        cases = [
            (r"\Delta L = 10\,\mathrm{dB}", r"\Rightarrow \frac{I_1}{I_2} = 10^1 = 10\text{ }(\times 10)", YELLOW),
            (r"\Delta L = 20\,\mathrm{dB}", r"\Rightarrow \frac{I_1}{I_2} = 10^2 = 100\text{ }(\times 100)", ORANGE),
            (r"\Delta L = 60\,\mathrm{dB}", r"\Rightarrow \frac{I_1}{I_2} = 10^6 = 1{,}000{,}000\text{ }(\times 10^6)", RED),
        ]

        prev_objs = []
        for i, (lhs, rhs, col) in enumerate(cases):
            lhs_m = MathTex(lhs).scale(0.85).set_color(col)
            rhs_m = MathTex(rhs).scale(0.85).set_color(col)
            pair = VGroup(lhs_m, rhs_m).arrange(RIGHT, buff=0.3)
            pair.next_to(impact_title, DOWN, buff=0.5 + i * 1.1)
            pair.scale_to_fit_width(11)
            # 飞入效果
            self.play(FadeIn(pair, shift=RIGHT * 0.6), run_time=0.9)
            self.wait(1.2)
            prev_objs.append(pair)

        self.wait(1.0)

        # 强调：每增加 10 dB 声强翻 10 倍
        emph = Text("每增加 10 dB，声强翻 10 倍——这正是对数的威力！",
                    font=CJK, color=GREEN).scale(0.46)
        emph.next_to(prev_objs[-1], DOWN, buff=0.45)
        self.play(FadeIn(emph))
        self.wait(1.8)
        self.play(FadeOut(VGroup(impact_title, *prev_objs, emph)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.56).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"L_I = 10\lg\frac{I}{I_0}\;\mathrm{dB},\quad I_0=10^{-12}\;\mathrm{W\cdot m^{-2}}"
        ).scale(0.72).set_color(YELLOW)

        s2 = MathTex(
            r"\frac{I_1}{I_2} = 10^{(L_1 - L_2)/10}"
        ).scale(0.78).set_color(ORANGE)

        s3_row = VGroup(
            Text("每", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\Delta L = 10\,\mathrm{dB}").scale(0.6).set_color(CYAN),
            Text("，声强倍数", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\times 10").scale(0.6).set_color(GREEN),
        ).arrange(RIGHT, buff=0.1)

        s4 = Text("对数轴：将 10⁻¹² ~ 1 W/m² 的 12 个量级压入一幅画面",
                  font=CJK, color=GREEN).scale(0.42)

        s_group = VGroup(s1, s2, s3_row, s4).arrange(DOWN, buff=0.42)
        s_group.next_to(s_title, DOWN, buff=0.45)
        s_group.scale_to_fit_width(12)

        box = SurroundingRectangle(s_group, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3_row))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, s_group, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch04Kp2SoundIntensityLevel",
        "id": "phys-ch04-4.3-kp2-sound-intensity-level",
        "chapterId": "ch04",
        "sectionId": "4.3",
        "title": "声强级与对数标度：人耳感知范围",
        "description": "通过线性轴 vs 对数轴对比、ValueTracker 游标拖动与特例冲击动画，直观理解 L_I=10lg(I/I0) 及声强比公式。",
    }
]
