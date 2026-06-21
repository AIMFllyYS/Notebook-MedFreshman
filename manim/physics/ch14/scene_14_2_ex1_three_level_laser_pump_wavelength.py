"""第 14.2 节 · 例题精讲：三能级激光器泵浦波长与激光波长计算。

通过四条能级线、跃迁路径分析和波长计算，展示三能级激光系统的工作原理。
铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 能级对应的 y 坐标（左侧图）
LEVEL_Y = {
    "E0": -2.8,
    "E1": -0.6,
    "E2":  0.3,
    "E3":  1.5,
}
LEVEL_X_LEFT  = -2.2
LEVEL_X_RIGHT =  0.8
LEVEL_COLOR = WHITE


def make_energy_level(y, label_tex, label_zh=None, x_left=LEVEL_X_LEFT, x_right=LEVEL_X_RIGHT):
    """画一条水平能级线并标注数学标签（及可选中文附注）。"""
    line = Line(
        start=[x_left, y, 0],
        end=[x_right, y, 0],
        color=LEVEL_COLOR,
        stroke_width=2,
    )
    math_lbl = MathTex(label_tex, color=YELLOW).scale(0.55)
    math_lbl.next_to(line, RIGHT, buff=0.18)
    group = VGroup(line, math_lbl)
    if label_zh:
        zh_lbl = Text(label_zh, font=CJK, color=GREEN).scale(0.38)
        zh_lbl.next_to(math_lbl, RIGHT, buff=0.15)
        group.add(zh_lbl)
    return group, line


def make_spectrum_bar(x_center=-0.5, y_bottom=-3.6, width=6.5, height=0.45):
    """在底部画一条可见光彩虹色谱条（400–700 nm）。"""
    colors = [
        "#8B00FF", "#4B0082", "#0000FF",
        "#00BFFF", "#00FF00", "#FFFF00",
        "#FF7F00", "#FF0000",
    ]
    n = len(colors)
    bar_width = width / n
    bars = VGroup()
    for i, c in enumerate(colors):
        rect = Rectangle(
            width=bar_width,
            height=height,
            fill_color=c,
            fill_opacity=0.85,
            stroke_width=0,
        )
        rect.move_to([x_center - width / 2 + bar_width * (i + 0.5), y_bottom + height / 2, 0])
        bars.add(rect)
    border = Rectangle(
        width=width, height=height,
        fill_opacity=0,
        stroke_color=WHITE,
        stroke_width=1.2,
    ).move_to([x_center, y_bottom + height / 2, 0])
    return VGroup(bars, border), x_center - width / 2, x_center + width / 2


class Ch14Ex1ThreeLevelLaserPumpWavelength(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text(
            "三能级激光器：泵浦波长与激光波长计算",
            font=CJK, color=BLUE,
        ).scale(0.58).to_edge(UP, buff=0.25)

        subtitle_a = Text("第14章  X射线与激光", font=CJK, color=WHITE).scale(0.38)
        subtitle_b = Text("14.2", font=CJK, color=WHITE).scale(0.38)
        subtitle = VGroup(subtitle_a, subtitle_b).arrange(RIGHT, buff=0.4)
        subtitle.next_to(title, DOWN, buff=0.15)

        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 引入 ────────────────────────────────────────
        ana1 = Text(
            "激光器需要让上能级粒子数多于下能级——即「粒子数反转」。",
            font=CJK,
        ).scale(0.46)
        ana2 = Text(
            "三能级系统：用外光源（泵浦光）把电子从基态打到高激发态，",
            font=CJK,
        ).scale(0.46)
        ana3 = Text(
            "再让它快速落到亚稳态积累，最终在亚稳态→基态发射激光。",
            font=CJK,
        ).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)

        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 画四条能级线 ─────────────────────────────────────────
        sec_title = Text("能级结构", font=CJK, color=BLUE).scale(0.52)
        sec_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec_title))

        # 能级数据
        level_data = [
            ("E0", r"E_0 = -13.2\,\mathrm{eV}", None),
            ("E1", r"E_1 = -11.1\,\mathrm{eV}", "亚稳态"),
            ("E2", r"E_2 = -10.6\,\mathrm{eV}", None),
            ("E3", r"E_3 = -9.8\,\mathrm{eV}", None),
        ]

        level_groups = {}
        level_lines  = {}
        for key, tex, zh in level_data:
            g, l = make_energy_level(LEVEL_Y[key], tex, zh)
            level_groups[key] = g
            level_lines[key]  = l

        all_levels = VGroup(*[level_groups[k] for k in ["E0", "E1", "E2", "E3"]])
        all_levels.shift(LEFT * 3.2 + DOWN * 0.15)

        for key in ["E0", "E1", "E2", "E3"]:
            self.play(Create(level_groups[key]), run_time=0.55)
        self.wait(1.2)

        # ── Step 4: E₃ 向基态跃迁 → 红叉排除 ───────────────────────────
        note_e3 = Text("E₃ 主要直接跃回基态（辐射宽，不积累）", font=CJK, color=RED).scale(0.40)
        note_e3.next_to(title, DOWN, buff=0.4)
        self.play(Transform(sec_title, note_e3))

        # 红色×叉标记 E₃→E₀ 跃迁
        mid_x = (level_lines["E3"].get_center()[0] + level_lines["E0"].get_center()[0]) / 2 - 0.15
        arr_bad = Arrow(
            start=[mid_x + 0.05, LEVEL_Y["E3"] + all_levels.get_y() - all_levels.get_bottom()[1] - 0.05, 0],
            end=[mid_x + 0.05, LEVEL_Y["E0"] + all_levels.get_y() - all_levels.get_bottom()[1] + 0.15, 0],
            buff=0,
            color=RED,
            stroke_width=2.5,
            max_tip_length_to_length_ratio=0.18,
        )
        # 用相对于 all_levels 的局部坐标定义箭头
        e3_center = level_lines["E3"].get_center()
        e0_center = level_lines["E0"].get_center()
        cross_x = (e3_center[0] + e0_center[0]) / 2 - 0.6

        arr_bad = Arrow(
            start=[cross_x, e3_center[1] - 0.12, 0],
            end=[cross_x, e0_center[1] + 0.12, 0],
            buff=0,
            color=RED,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        # 画×符号
        cross_size = 0.18
        cross1 = Line(
            [cross_x - cross_size, (e3_center[1] + e0_center[1]) / 2 + cross_size, 0],
            [cross_x + cross_size, (e3_center[1] + e0_center[1]) / 2 - cross_size, 0],
            color=RED, stroke_width=3,
        )
        cross2 = Line(
            [cross_x - cross_size, (e3_center[1] + e0_center[1]) / 2 - cross_size, 0],
            [cross_x + cross_size, (e3_center[1] + e0_center[1]) / 2 + cross_size, 0],
            color=RED, stroke_width=3,
        )
        self.play(Create(arr_bad), run_time=0.6)
        self.play(Create(cross1), Create(cross2), run_time=0.5)
        self.wait(1.2)

        # ── Step 5: E₂→E₁ 快速无辐射跃迁 + E₁亚稳积累 ──────────────────
        note_e2 = Text("E₂→E₁ 无辐射跃迁（快速），E₁亚稳态粒子积累", font=CJK, color=ORANGE).scale(0.40)
        self.play(Transform(sec_title, note_e2))

        # 橙色箭头 E₂→E₁
        e2_center = level_lines["E2"].get_center()
        e1_center = level_lines["E1"].get_center()
        arr_nr = Arrow(
            start=[e2_center[0] - 0.5, e2_center[1] - 0.08, 0],
            end=[e1_center[0] - 0.5, e1_center[1] + 0.08, 0],
            buff=0,
            color=ORANGE,
            stroke_width=2.5,
            max_tip_length_to_length_ratio=0.22,
        )
        lbl_nr = Text("快速（无辐射）", font=CJK, color=ORANGE).scale(0.34)
        lbl_nr.next_to(arr_nr, LEFT, buff=0.12)

        # E₁ 闪烁高亮
        e1_hl = level_lines["E1"].copy().set_color(GREEN).set_stroke(width=5)
        self.play(Create(arr_nr), FadeIn(lbl_nr))
        self.play(Flash(e1_center, color=GREEN, flash_radius=0.4, line_length=0.2))
        self.play(Create(e1_hl))
        self.wait(1.4)

        # ── Step 6: 推断泵浦路径 E₀→E₂ + 激光路径 E₁→E₀ ─────────────────
        note_path = Text(
            "泵浦：E₀→E₂（绿色）  |  激光：E₁→E₀（蓝色）",
            font=CJK, color=WHITE,
        ).scale(0.40)
        self.play(Transform(sec_title, note_path))

        # 绿色泵浦箭头 E₀→E₂
        arr_pump = Arrow(
            start=[e0_center[0] - 0.85, e0_center[1] + 0.1, 0],
            end=[e2_center[0] - 0.85, e2_center[1] - 0.1, 0],
            buff=0,
            color=GREEN,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.2,
        )
        lbl_pump = VGroup(
            Text("泵浦", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"\lambda_1", color=GREEN).scale(0.55),
        ).arrange(DOWN, buff=0.05)
        lbl_pump.next_to(arr_pump, LEFT, buff=0.12)

        # 蓝色激光箭头 E₁→E₀
        arr_laser = Arrow(
            start=[e1_center[0] - 1.25, e1_center[1] - 0.1, 0],
            end=[e0_center[0] - 1.25, e0_center[1] + 0.1, 0],
            buff=0,
            color=BLUE,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.2,
        )
        lbl_laser = VGroup(
            Text("激光", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"\lambda_2", color=BLUE).scale(0.55),
        ).arrange(DOWN, buff=0.05)
        lbl_laser.next_to(arr_laser, LEFT, buff=0.12)

        self.play(GrowArrow(arr_pump), FadeIn(lbl_pump))
        self.wait(0.7)
        self.play(GrowArrow(arr_laser), FadeIn(lbl_laser))
        self.wait(1.5)

        # 清场能级图，保留标题
        self.play(
            FadeOut(VGroup(
                all_levels, arr_bad, cross1, cross2,
                arr_nr, lbl_nr, e1_hl,
                arr_pump, lbl_pump, arr_laser, lbl_laser,
                sec_title,
            ))
        )

        # ── Step 7: 计算泵浦波长 λ₁ ─────────────────────────────────────
        calc_title = Text("计算泵浦波长", font=CJK, color=BLUE).scale(0.52)
        calc_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(calc_title))

        # 公式逐步出现
        f1 = MathTex(
            r"\lambda_1 = \frac{hc}{E_2 - E_0}",
            color=WHITE,
        ).scale(0.8)
        f1.next_to(calc_title, DOWN, buff=0.45)

        f2 = MathTex(
            r"E_2 - E_0 = -10.6 - (-13.2) = 2.6\,\mathrm{eV}",
            color=YELLOW,
        ).scale(0.72)
        f2.next_to(f1, DOWN, buff=0.38)
        f2[0][5:16].set_color(CYAN)   # 高亮数值部分

        f3 = MathTex(
            r"\lambda_1 = \frac{6.626\times10^{-34}\times3\times10^8}"
            r"{2.6\times1.6\times10^{-19}}\,\mathrm{m}",
            color=WHITE,
        ).scale(0.70)
        f3.next_to(f2, DOWN, buff=0.38)

        f4 = MathTex(
            r"\lambda_1 \approx 477.8\,\mathrm{nm}",
            color=GREEN,
        ).scale(0.90)
        f4.next_to(f3, DOWN, buff=0.38)

        self.play(Write(f1))
        self.wait(1.0)
        self.play(FadeIn(f2))
        self.wait(1.0)
        self.play(Write(f3))
        self.wait(1.2)
        self.play(Write(f4))
        self.wait(1.8)

        # 注释：紫色/蓝色
        note1 = Text("477.8 nm  →  紫蓝色可见光（泵浦光）", font=CJK, color="#6A5ACD").scale(0.42)
        note1.next_to(f4, DOWN, buff=0.3)
        self.play(FadeIn(note1))
        self.wait(1.5)
        self.play(FadeOut(VGroup(calc_title, f1, f2, f3, f4, note1)))

        # ── Step 8: 计算激光波长 λ₂ ─────────────────────────────────────
        calc_title2 = Text("计算激光波长", font=CJK, color=BLUE).scale(0.52)
        calc_title2.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(calc_title2))

        g1 = MathTex(
            r"\lambda_2 = \frac{hc}{E_1 - E_0}",
            color=WHITE,
        ).scale(0.8)
        g1.next_to(calc_title2, DOWN, buff=0.45)

        g2 = MathTex(
            r"E_1 - E_0 = -11.1 - (-13.2) = 2.1\,\mathrm{eV}",
            color=YELLOW,
        ).scale(0.72)
        g2.next_to(g1, DOWN, buff=0.38)

        g3 = MathTex(
            r"\lambda_2 = \frac{6.626\times10^{-34}\times3\times10^8}"
            r"{2.1\times1.6\times10^{-19}}\,\mathrm{m}",
            color=WHITE,
        ).scale(0.70)
        g3.next_to(g2, DOWN, buff=0.38)

        g4 = MathTex(
            r"\lambda_2 \approx 591.6\,\mathrm{nm}",
            color=ORANGE,
        ).scale(0.90)
        g4.next_to(g3, DOWN, buff=0.38)

        self.play(Write(g1))
        self.wait(1.0)
        self.play(FadeIn(g2))
        self.wait(1.0)
        self.play(Write(g3))
        self.wait(1.2)
        self.play(Write(g4))
        self.wait(1.8)

        note2 = Text("591.6 nm  →  橙黄色可见光（激光输出）", font=CJK, color=ORANGE).scale(0.42)
        note2.next_to(g4, DOWN, buff=0.3)
        self.play(FadeIn(note2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(calc_title2, g1, g2, g3, g4, note2)))

        # ── Step 9: 可见光谱条 + 双波长标线 ─────────────────────────────
        spec_title = Text("可见光谱定位", font=CJK, color=BLUE).scale(0.52)
        spec_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(spec_title))

        # 谱条参数
        SPEC_X_CENTER = 0.0
        SPEC_Y_BOTTOM = -2.0
        SPEC_WIDTH    = 10.0
        SPEC_HEIGHT   = 0.55
        WAVE_MIN      = 380.0   # nm
        WAVE_MAX      = 750.0   # nm

        spectrum, x_left_edge, x_right_edge = make_spectrum_bar(
            x_center=SPEC_X_CENTER,
            y_bottom=SPEC_Y_BOTTOM,
            width=SPEC_WIDTH,
            height=SPEC_HEIGHT,
        )

        # 波长刻度标注
        def wave_to_x(lam_nm):
            frac = (lam_nm - WAVE_MIN) / (WAVE_MAX - WAVE_MIN)
            return x_left_edge + frac * SPEC_WIDTH

        tick_waves = [400, 450, 500, 550, 600, 650, 700]
        tick_grp = VGroup()
        for w in tick_waves:
            xp = wave_to_x(w)
            tick = Line(
                [xp, SPEC_Y_BOTTOM, 0],
                [xp, SPEC_Y_BOTTOM - 0.18, 0],
                color=WHITE, stroke_width=1,
            )
            lbl = MathTex(str(w), color=WHITE).scale(0.30)
            lbl.next_to(tick, DOWN, buff=0.06)
            tick_grp.add(VGroup(tick, lbl))

        unit_lbl = Text("nm", font=CJK, color=WHITE).scale(0.32)
        unit_lbl.next_to(tick_grp, RIGHT, buff=0.2)

        self.play(FadeIn(spectrum), FadeIn(tick_grp), FadeIn(unit_lbl))
        self.wait(0.8)

        # 泵浦光竖线 477.8 nm  紫蓝色
        x_pump = wave_to_x(477.8)
        pump_line = DashedLine(
            start=[x_pump, SPEC_Y_BOTTOM + SPEC_HEIGHT + 0.05, 0],
            end=[x_pump, SPEC_Y_BOTTOM + SPEC_HEIGHT + 1.55, 0],
            color="#5555FF",
            stroke_width=2.5,
            dash_length=0.12,
        )
        pump_lbl_math = MathTex(r"\lambda_1=477.8\,\mathrm{nm}", color="#5555FF").scale(0.52)
        pump_lbl_zh   = Text("泵浦光", font=CJK, color="#5555FF").scale(0.38)
        pump_lbl = VGroup(pump_lbl_math, pump_lbl_zh).arrange(DOWN, buff=0.08)
        pump_lbl.next_to(pump_line, UP, buff=0.1)

        # 激光竖线 591.6 nm  橙色
        x_laser = wave_to_x(591.6)
        laser_line = DashedLine(
            start=[x_laser, SPEC_Y_BOTTOM + SPEC_HEIGHT + 0.05, 0],
            end=[x_laser, SPEC_Y_BOTTOM + SPEC_HEIGHT + 1.55, 0],
            color=ORANGE,
            stroke_width=2.5,
            dash_length=0.12,
        )
        laser_lbl_math = MathTex(r"\lambda_2=591.6\,\mathrm{nm}", color=ORANGE).scale(0.52)
        laser_lbl_zh   = Text("激光输出", font=CJK, color=ORANGE).scale(0.38)
        laser_lbl = VGroup(laser_lbl_math, laser_lbl_zh).arrange(DOWN, buff=0.08)
        laser_lbl.next_to(laser_line, UP, buff=0.1)

        self.play(Create(pump_line), FadeIn(pump_lbl))
        self.wait(0.6)
        self.play(Create(laser_line), FadeIn(laser_lbl))
        self.wait(1.8)
        self.play(
            FadeOut(VGroup(
                spec_title, spectrum, tick_grp, unit_lbl,
                pump_line, pump_lbl, laser_line, laser_lbl,
            ))
        )

        # ── Step 10: 能级图回顾（简化版） ───────────────────────────────
        recap_title = Text("三能级系统能量图回顾", font=CJK, color=BLUE).scale(0.52)
        recap_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(recap_title))

        # 重绘简化能级图（居中）
        RECAP_X_L = -1.6
        RECAP_X_R =  1.6
        recap_ys = {
            "E0": -2.5,
            "E1": -0.8,
            "E2":  0.0,
            "E3":  1.0,
        }
        recap_shift = DOWN * 0.3 + LEFT * 0.0

        recap_levels = VGroup()
        for key, y in recap_ys.items():
            line = Line(
                [RECAP_X_L, y, 0],
                [RECAP_X_R, y, 0],
                color=WHITE, stroke_width=2,
            )
            tex_map = {
                "E0": r"E_0\ (-13.2\,\mathrm{eV})",
                "E1": r"E_1\ (-11.1\,\mathrm{eV})",
                "E2": r"E_2\ (-10.6\,\mathrm{eV})",
                "E3": r"E_3\ (-9.8\,\mathrm{eV})",
            }
            lbl = MathTex(tex_map[key], color=YELLOW).scale(0.42)
            lbl.next_to(line, RIGHT, buff=0.15)
            recap_levels.add(VGroup(line, lbl))

        recap_levels.shift(recap_shift)
        self.play(Create(recap_levels), run_time=1.2)

        # 再次画泵浦与激光箭头
        def rY(key):
            return recap_ys[key] + recap_shift[1]

        ax = RECAP_X_L - 0.35
        r_pump = Arrow(
            [ax, rY("E0") + 0.08, 0],
            [ax, rY("E2") - 0.08, 0],
            buff=0, color=GREEN, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.2,
        )
        r_pump_lbl = VGroup(
            Text("泵浦", font=CJK, color=GREEN).scale(0.34),
            MathTex(r"\lambda_1", color=GREEN).scale(0.48),
        ).arrange(DOWN, buff=0.05).next_to(r_pump, LEFT, buff=0.1)

        ax2 = RECAP_X_L - 0.82
        r_laser = Arrow(
            [ax2, rY("E1") - 0.08, 0],
            [ax2, rY("E0") + 0.08, 0],
            buff=0, color="#5599FF", stroke_width=2.5,
            max_tip_length_to_length_ratio=0.2,
        )
        r_laser_lbl = VGroup(
            Text("激光", font=CJK, color="#5599FF").scale(0.34),
            MathTex(r"\lambda_2", color="#5599FF").scale(0.48),
        ).arrange(DOWN, buff=0.05).next_to(r_laser, LEFT, buff=0.1)

        # E₂→E₁ 无辐射
        ax3 = RECAP_X_R + 0.35
        r_nr = Arrow(
            [ax3, rY("E2") - 0.08, 0],
            [ax3, rY("E1") + 0.08, 0],
            buff=0, color=ORANGE, stroke_width=2,
            max_tip_length_to_length_ratio=0.22,
        )
        r_nr_lbl = Text("无辐射", font=CJK, color=ORANGE).scale(0.32)
        r_nr_lbl.next_to(r_nr, RIGHT, buff=0.1)

        self.play(GrowArrow(r_pump), FadeIn(r_pump_lbl))
        self.wait(0.5)
        self.play(GrowArrow(r_nr), FadeIn(r_nr_lbl))
        self.wait(0.5)
        self.play(GrowArrow(r_laser), FadeIn(r_laser_lbl))
        self.wait(1.5)
        self.play(
            FadeOut(VGroup(
                recap_title, recap_levels,
                r_pump, r_pump_lbl, r_nr, r_nr_lbl, r_laser, r_laser_lbl,
            ))
        )

        # ── Step 11: 底部说明文字 ────────────────────────────────────────
        note_sys = Text(
            "此为三能级系统：E₃ 与基态形成泵浦对，E₁ 为激光上能级",
            font=CJK, color=CYAN,
        ).scale(0.45)
        note_sys.next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(note_sys))
        self.wait(1.5)
        self.play(FadeOut(note_sys))

        # ── Step 12: 小结卡 ───────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(s_title))

        s1_row = VGroup(
            Text("泵浦波长：", font=CJK, color=WHITE).scale(0.50),
            MathTex(
                r"\lambda_1 = \frac{hc}{E_2-E_0} = \frac{hc}{2.6\,\mathrm{eV}} \approx 477.8\,\mathrm{nm}",
                color=GREEN,
            ).scale(0.58),
        ).arrange(RIGHT, buff=0.18)

        s2_row = VGroup(
            Text("激光波长：", font=CJK, color=WHITE).scale(0.50),
            MathTex(
                r"\lambda_2 = \frac{hc}{E_1-E_0} = \frac{hc}{2.1\,\mathrm{eV}} \approx 591.6\,\mathrm{nm}",
                color=ORANGE,
            ).scale(0.58),
        ).arrange(RIGHT, buff=0.18)

        s3 = Text(
            "激光波长（橙黄）>泵浦波长（紫蓝）：激光光子能量更低",
            font=CJK, color=CYAN,
        ).scale(0.42)

        summary = VGroup(s1_row, s2_row, s3).arrange(DOWN, buff=0.45, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(12.8)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(Write(s1_row))
        self.wait(0.8)
        self.play(Write(s2_row))
        self.wait(0.8)
        self.play(FadeIn(s3))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch14Ex1ThreeLevelLaserPumpWavelength",
        "id": "phys-ch14-14.2-ex1-three-level-laser-pump-wavelength",
        "chapterId": "ch14",
        "sectionId": "14.2",
        "title": "三能级激光器泵浦波长与激光波长计算",
        "description": "通过四条能级线、跃迁路径分析和逐步公式推导，计算三能级激光器的泵浦波长（477.8 nm）与激光波长（591.6 nm），并在可见光谱条上直观定位两种光的颜色差异。",
    },
]
