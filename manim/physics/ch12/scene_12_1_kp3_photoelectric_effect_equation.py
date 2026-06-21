"""第 12.1 节 · 光电效应：爱因斯坦方程与红限（知识点 KP3）

动画结构：
  1. 标题 + 生活类比（阳光打出电子）
  2. 经典理论的困境
  3. 爱因斯坦光量子假设 + 方程逐步推导
  4. 左侧能量柱：固定频率演示单光子过程
  5. ValueTracker 扫频率 → Ek 线性增加 / 低于红限时无电子
  6. 右侧 eUa-ν 坐标系：三种金属对比（斜率同为 h，截距各异）
  7. 小结卡

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常数（动画中用简化无量纲值，保留真实比例关系）
H_PLANCK = 1.0          # 普朗克常数（动画单位）
W_Cs = 0.70             # 铯 逸出功（动画单位）
W_K  = 1.00             # 钾 逸出功
W_Na = 1.30             # 钠 逸出功
NU0_Cs = W_Cs / H_PLANCK   # 各金属红限频率
NU0_K  = W_K  / H_PLANCK
NU0_Na = W_Na / H_PLANCK


class Ch12Kp3PhotoelectricEffectEquation(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("光电效应：爱因斯坦方程与红限",
                     font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.1",
                        font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        ana1 = Text("想象你用光照射金属板——有时会打出电子，有时却什么也没有。",
                    font=CJK).scale(0.44)
        ana2 = Text("弱光照射很久也没有电子？换成紫外线，瞬间就出来了！",
                    font=CJK, color=YELLOW).scale(0.44)
        ana3 = Text("经典波动理论完全无法解释这个现象。", font=CJK, color=RED).scale(0.44)
        analogy = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3)
        analogy.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ── Step 3: 爱因斯坦光量子方程（逐步推导）────────────────────────
        step_t = Text("爱因斯坦光量子方程", font=CJK, color=BLUE).scale(0.5)
        step_t.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(step_t))

        # 3a: 光子能量
        line1_zh = Text("一个光子的能量：", font=CJK).scale(0.44)
        line1_eq = MathTex(r"E_{\rm photon} = h\nu").scale(0.88)
        line1_eq[0][0].set_color(YELLOW)
        row1 = VGroup(line1_zh, line1_eq).arrange(RIGHT, buff=0.2)
        row1.next_to(step_t, DOWN, buff=0.4)
        self.play(FadeIn(line1_zh), Write(line1_eq))
        self.wait(1.2)

        # 3b: 能量守恒：整个方程
        line2_zh = Text("能量守恒（光子 → 逸出功 + 动能）：", font=CJK).scale(0.44)
        line2_eq = MathTex(r"h\nu", r"=", r"W", r"+", r"E_{k,\max}").scale(0.88)
        line2_eq[0].set_color(YELLOW)    # hν
        line2_eq[2].set_color(RED)       # W
        line2_eq[4].set_color(BLUE)      # Ek,max
        row2 = VGroup(line2_zh, line2_eq).arrange(RIGHT, buff=0.2)
        row2.next_to(row1, DOWN, buff=0.35)
        self.play(FadeIn(line2_zh), Write(line2_eq))
        self.wait(1.2)

        # 3c: Ek = eUa
        line3_zh = Text("用遏止电压测动能：", font=CJK).scale(0.44)
        line3_eq = MathTex(r"E_{k,\max} = eU_a").scale(0.88)
        line3_eq[0].set_color(BLUE)
        row3 = VGroup(line3_zh, line3_eq).arrange(RIGHT, buff=0.2)
        row3.next_to(row2, DOWN, buff=0.35)
        self.play(FadeIn(line3_zh), Write(line3_eq))
        self.wait(1.2)

        # 3d: 红限
        line4_zh = Text("红限频率（Ek=0 时）：", font=CJK).scale(0.44)
        line4_eq = MathTex(r"\nu_0 = \frac{W}{h},\quad \lambda_0 = \frac{hc}{W}").scale(0.82)
        line4_eq[0].set_color(GREEN)
        row4 = VGroup(line4_zh, line4_eq).arrange(RIGHT, buff=0.2)
        row4.next_to(row3, DOWN, buff=0.35)
        self.play(FadeIn(line4_zh), Write(line4_eq))
        self.wait(1.5)

        # 高亮整体方程框
        box_eq = SurroundingRectangle(row2, color=YELLOW, buff=0.15, corner_radius=0.1)
        self.play(Create(box_eq))
        self.wait(1.0)
        self.play(FadeOut(VGroup(step_t, row1, row2, row3, row4, box_eq)))

        # ── Step 4: 左侧能量柱 — 单光子过程（固定频率）─────────────────
        # 布局：能量柱在屏幕左侧，右侧留给坐标系（稍后分步使用）
        bar_label = Text("单光子能量分配示意", font=CJK, color=BLUE).scale(0.46)
        bar_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(bar_label))

        # 柱状图底部锚点
        bar_x = -4.2
        bar_bottom = -2.2
        bar_width = 1.2

        # 固定频率 ν = 1.5（大于所有红限，Ek > 0）
        nu_fixed = 1.5
        Ek_fixed = max(0.0, nu_fixed * H_PLANCK - W_K)   # 对钾
        W_height = W_K * 1.5       # 屏幕单位比例
        Ek_height = Ek_fixed * 1.5

        # 逸出功柱（红色）
        rect_W = Rectangle(width=bar_width, height=W_height,
                            fill_color=RED, fill_opacity=0.8, stroke_color=RED)
        rect_W.align_to(np.array([bar_x, bar_bottom, 0]), DL)

        # 动能柱（蓝色）
        rect_Ek = Rectangle(width=bar_width, height=Ek_height,
                             fill_color=BLUE, fill_opacity=0.8, stroke_color=BLUE)
        rect_Ek.next_to(rect_W, UP, buff=0)

        # 光子向下箭头（标注 hν）
        arrow_top = rect_Ek.get_top() + UP * 0.7
        arrow_bot = rect_Ek.get_top()
        photon_arrow = Arrow(arrow_top, arrow_bot, buff=0,
                             color=YELLOW, stroke_width=4,
                             max_tip_length_to_length_ratio=0.25)
        hnu_label = MathTex(r"h\nu", color=YELLOW).scale(0.75)
        hnu_label.next_to(photon_arrow, RIGHT, buff=0.15)

        # 逸出功标注
        brace_W = Brace(rect_W, direction=RIGHT, color=RED)
        W_text = MathTex(r"W", color=RED).scale(0.7)
        brace_W.put_at_tip(W_text)

        # 动能标注
        brace_Ek = Brace(rect_Ek, direction=RIGHT, color=BLUE)
        Ek_text = MathTex(r"E_{k,\max}", color=BLUE).scale(0.65)
        brace_Ek.put_at_tip(Ek_text)

        # 说明文字
        explain1 = Text("光子全部能量 = 逸出功（红）+ 电子动能（蓝）",
                        font=CJK).scale(0.38)
        explain1.to_edge(DOWN, buff=0.5)

        self.play(Create(rect_W), Create(brace_W), Write(W_text))
        self.wait(0.6)
        self.play(Create(rect_Ek), Create(brace_Ek), Write(Ek_text))
        self.wait(0.6)
        self.play(GrowArrow(photon_arrow), Write(hnu_label))
        self.play(FadeIn(explain1))
        self.wait(1.8)

        bar_group_fixed = VGroup(rect_W, rect_Ek, brace_W, W_text,
                                 brace_Ek, Ek_text, photon_arrow, hnu_label)
        self.play(FadeOut(bar_group_fixed), FadeOut(explain1), FadeOut(bar_label))

        # ── Step 5: ValueTracker 扫频率 → Ek 变化 / 低于红限无电子 ────────
        tracker_t = Text("扫描入射频率 ν，观察动能如何变化",
                         font=CJK, color=BLUE).scale(0.46)
        tracker_t.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tracker_t))

        nu_tracker = ValueTracker(0.5)   # 初始低于红限

        SCALE = 1.5   # 屏幕单位/物理单位

        # always_redraw：逸出功柱（始终固定高度，对应钾）
        rect_W2 = always_redraw(lambda: Rectangle(
            width=bar_width, height=W_K * SCALE,
            fill_color=RED, fill_opacity=0.8, stroke_color=RED
        ).align_to(np.array([bar_x, bar_bottom, 0]), DL))

        # always_redraw：动能柱（可能为零）
        def make_ek_rect():
            nu = nu_tracker.get_value()
            ek = max(0.0, nu * H_PLANCK - W_K)
            h = ek * SCALE if ek > 0 else 0.001  # 避免高度=0
            r = Rectangle(width=bar_width, height=h,
                          fill_color=BLUE, fill_opacity=0.8 if ek > 0 else 0.0,
                          stroke_color=BLUE, stroke_width=2 if ek > 0 else 0)
            # 放在逸出功柱正上方
            r.next_to(np.array([bar_x, bar_bottom + W_K * SCALE, 0]), UP + RIGHT * 0, buff=0)
            r.align_to(np.array([bar_x, bar_bottom + W_K * SCALE, 0]), DL)
            return r

        rect_Ek2 = always_redraw(make_ek_rect)

        # 光子箭头（hν 随频率变）
        def make_photon_arrow():
            nu = nu_tracker.get_value()
            ek = max(0.0, nu * H_PLANCK - W_K)
            top_y = bar_bottom + (W_K + ek) * SCALE + 0.7
            bot_y = bar_bottom + (W_K + ek) * SCALE
            return Arrow(
                np.array([bar_x + bar_width / 2, top_y, 0]),
                np.array([bar_x + bar_width / 2, bot_y, 0]),
                buff=0, color=YELLOW, stroke_width=4,
                max_tip_length_to_length_ratio=0.25
            )

        photon_arrow2 = always_redraw(make_photon_arrow)

        hnu_label2 = always_redraw(lambda: MathTex(r"h\nu", color=YELLOW).scale(0.7).next_to(
            make_photon_arrow(), RIGHT, buff=0.12
        ))

        # 频率读数
        nu_readout = always_redraw(lambda: VGroup(
            Text(r"nu = ", font=CJK, font_size=22, color=CYAN),
            MathTex(rf"{nu_tracker.get_value():.2f}\,\nu_0", color=CYAN).scale(0.65)
        ).arrange(RIGHT, buff=0.1).to_corner(UL, buff=1.4).shift(DOWN * 0.6))

        # 「无光电子」提示
        no_electron_text = always_redraw(lambda: Text(
            "无光电子！" if nu_tracker.get_value() < NU0_K else "",
            font=CJK, color=RED, font_size=28
        ).next_to(np.array([bar_x + bar_width / 2, bar_bottom - 0.1, 0]), DOWN, buff=0.15))

        # Ek 读数（右下角）
        ek_readout = always_redraw(lambda: VGroup(
            MathTex(r"E_{k,\max}=", color=BLUE).scale(0.6),
            MathTex(
                rf"{max(0.0, nu_tracker.get_value() * H_PLANCK - W_K):.2f}\,W_0",
                color=BLUE
            ).scale(0.6)
        ).arrange(RIGHT, buff=0.08).to_corner(DL, buff=0.55))

        self.add(rect_W2, rect_Ek2, photon_arrow2, hnu_label2,
                 nu_readout, no_electron_text, ek_readout)
        self.wait(1.0)

        # 扫上去：ν: 0.5 → 2.2
        self.play(nu_tracker.animate.set_value(2.2), run_time=4.0)
        self.wait(0.8)
        # 扫回来：跨红限时标注停顿
        self.play(nu_tracker.animate.set_value(NU0_K), run_time=1.5)
        self.wait(1.0)
        self.play(nu_tracker.animate.set_value(0.6), run_time=1.5)
        self.wait(1.0)
        self.play(nu_tracker.animate.set_value(1.8), run_time=2.0)
        self.wait(1.0)

        self.play(FadeOut(VGroup(rect_W2, rect_Ek2, photon_arrow2, hnu_label2,
                                 nu_readout, no_electron_text, ek_readout, tracker_t)))

        # ── Step 6: 右侧 eUa-ν 坐标系（三种金属对比）───────────────────
        metal_t = Text("三种金属：遏止电压 eUa 与频率 ν 的关系",
                       font=CJK, color=BLUE).scale(0.46)
        metal_t.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(metal_t))

        # 坐标轴
        axes = Axes(
            x_range=[0, 3.0, 0.5],
            y_range=[-0.5, 2.5, 0.5],
            x_length=7.5,
            y_length=4.2,
            axis_config={"color": WHITE, "include_ticks": True,
                         "tick_size": 0.06, "stroke_width": 2},
            tips=True,
        )
        axes.shift(RIGHT * 0.3 + DOWN * 0.5)

        x_label = MathTex(r"\nu\ /\ \nu_0", color=WHITE).scale(0.6)
        x_label.next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)
        y_label = MathTex(r"eU_a\ /\ W_0", color=WHITE).scale(0.6)
        y_label.next_to(axes.y_axis.get_end(), UP, buff=0.1)

        self.play(Create(axes), Write(x_label), Write(y_label))
        self.wait(0.6)

        # 三种金属数据（斜率=h=1，截距= -W）
        metals = [
            {"name": "Cs (铯)", "W": W_Cs, "color": GREEN},
            {"name": "K  (钾)", "W": W_K,  "color": YELLOW},
            {"name": "Na (钠)", "W": W_Na, "color": ORANGE},
        ]

        line_objects = VGroup()
        legend_items = []

        for metal in metals:
            nu0 = metal["W"] / H_PLANCK  # = W (归一化单位)
            # eUa = h*nu - W = nu - W (动画单位，斜率=1)
            line = axes.plot(
                lambda x, W=metal["W"]: x - W,
                x_range=[nu0, 2.8],
                color=metal["color"],
                stroke_width=3,
            )
            # 红限竖虚线
            nu0_x = axes.c2p(nu0, 0)
            nu0_top = axes.c2p(nu0, 0.08)
            nu0_bot = axes.c2p(nu0, -0.45)
            vline = DashedLine(nu0_bot, nu0_top, color=metal["color"],
                               dash_length=0.08, stroke_width=1.5)
            nu0_dot = Dot(axes.c2p(nu0, 0), radius=0.07, color=metal["color"])
            nu0_tex = MathTex(rf"\nu_{{0}}", color=metal["color"]).scale(0.5)
            nu0_tex.next_to(nu0_dot, DOWN, buff=0.18)

            line_objects.add(line, vline, nu0_dot, nu0_tex)

            # 图例（右侧）
            legend_dot = Dot(radius=0.1, color=metal["color"])
            legend_name = Text(metal["name"], font=CJK, font_size=22,
                               color=metal["color"])
            legend_row = VGroup(legend_dot, legend_name).arrange(RIGHT, buff=0.15)
            legend_items.append(legend_row)

        legend = VGroup(*legend_items).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        legend.to_corner(UR, buff=0.7).shift(DOWN * 1.8)

        self.play(Create(line_objects), run_time=1.8)
        self.play(FadeIn(legend))
        self.wait(0.8)

        # 标注斜率 = h
        slope_start = axes.c2p(1.6, 1.6 - W_K)
        slope_end   = axes.c2p(2.2, 2.2 - W_K)
        slope_arrow = Arrow(slope_start, slope_end, buff=0,
                            color=CYAN, stroke_width=3,
                            max_tip_length_to_length_ratio=0.2)
        slope_zh = Text("斜率 = h（三线相同）", font=CJK, color=CYAN).scale(0.4)
        slope_zh.next_to(slope_arrow, UP, buff=0.12)
        slope_label = MathTex(r"\Delta(eU_a)/\Delta\nu = h", color=CYAN).scale(0.62)
        slope_label.next_to(slope_zh, DOWN, buff=0.08)

        self.play(GrowArrow(slope_arrow), FadeIn(slope_zh), Write(slope_label))
        self.wait(1.5)

        note_redlimit = Text("红限 ν₀ 不同 → 逸出功 W 不同 → 三条平行线截距各异",
                             font=CJK, color=WHITE).scale(0.38)
        note_redlimit.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(note_redlimit))
        self.wait(1.8)

        self.play(FadeOut(VGroup(axes, x_label, y_label, line_objects,
                                 legend, slope_arrow, slope_zh, slope_label,
                                 note_redlimit, metal_t)))

        # ── Step 7: 小结卡 ───────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        eq_main = MathTex(r"h\nu = W + E_{k,\max}", color=YELLOW).scale(0.95)
        eq_main[0][0:2].set_color(YELLOW)   # hν
        eq_main[0][3].set_color(RED)         # W
        eq_main[0][5:].set_color(BLUE)       # Ek,max

        eq_ua = MathTex(r"E_{k,\max} = eU_a", color=BLUE).scale(0.85)

        eq_nu0 = MathTex(r"\nu_0 = \frac{W}{h},\quad \lambda_0 = \frac{hc}{W}",
                         color=GREEN).scale(0.85)

        sum_zh1 = Text("光子能量 = 逸出功 + 电子最大动能", font=CJK).scale(0.42)
        sum_zh2 = Text("遏止电压直接测量 Ek，eUa-ν 图斜率即普朗克常数 h",
                       font=CJK).scale(0.42)
        sum_zh3 = Text("频率低于红限 ν₀ → 无论光强多强，均无光电子逸出",
                       font=CJK, color=RED).scale(0.42)

        content = VGroup(eq_main, eq_ua, eq_nu0, sum_zh1, sum_zh2, sum_zh3)\
            .arrange(DOWN, buff=0.35)
        content.next_to(s_title, DOWN, buff=0.4)
        content.scale_to_fit_width(11.5)

        box = SurroundingRectangle(VGroup(eq_main, eq_ua, eq_nu0),
                                   color=YELLOW, buff=0.25, corner_radius=0.12)

        self.play(Write(eq_main))
        self.wait(0.6)
        self.play(Write(eq_ua))
        self.wait(0.6)
        self.play(Write(eq_nu0))
        self.play(Create(box))
        self.wait(0.6)
        self.play(FadeIn(sum_zh1))
        self.wait(0.5)
        self.play(FadeIn(sum_zh2))
        self.wait(0.5)
        self.play(FadeIn(sum_zh3))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, s_title, content, box)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp3PhotoelectricEffectEquation",
        "id": "phys-ch12-12.1-kp3-photoelectric-effect-equation",
        "chapterId": "ch12",
        "sectionId": "12.1",
        "title": "光电效应：爱因斯坦方程与红限",
        "description": "用能量柱状图和 eUa-ν 坐标系动态演示爱因斯坦光电方程，通过 ValueTracker 扫频率展示红限与动能的线性关系，并对比铯、钾、钠三种金属逸出功的差异。",
    },
]
