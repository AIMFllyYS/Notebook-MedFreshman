"""第 2.1 节 · 连续性方程（金标准范本：流管截面 + ValueTracker + 双曲线曲线）。

两幕结构：
  幕 1 — 流管侧视图；用 ValueTracker 驱动右截面积从 S1 连续缩小到 0.3·S1，
          右侧流速箭头 v2 自动变长（Sv=const），顶部实时显示 S1·v1 == S2·v2。
  幕 2 — 在坐标系中绘制 v = Q/S 双曲线，高亮点随 ValueTracker 滑动。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常数（无量纲演示）
Q_FLOW = 1.0    # 体积流量，固定
S1_VAL = 1.0    # 左截面积（固定参考值）
V1_VAL = Q_FLOW / S1_VAL  # = 1.0


def tube_polygon(s1_half: float, s2_half: float,
                 x_left: float = -3.5, x_right: float = 0.5) -> Polygon:
    """构造流管侧视轮廓（梯形管道），s1_half / s2_half 为半高。"""
    pts = [
        np.array([x_left,  s1_half, 0]),
        np.array([x_right, s2_half, 0]),
        np.array([x_right, -s2_half, 0]),
        np.array([x_left, -s1_half, 0]),
    ]
    return Polygon(*pts, color=BLUE, fill_color=BLUE, fill_opacity=0.12, stroke_width=2.5)


class Ch02Kp3ContinuityEquation(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════
        # Step 1 · 标题
        # ═══════════════════════════════════════════════════════════════
        title = Text("连续性方程：流量守恒", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第二章 流体力学 · 2.1", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════
        # Step 2 · 生活类比
        # ═══════════════════════════════════════════════════════════════
        a1 = Text("水管变细，水流变快——这不是巧合，而是守恒定律。", font=CJK).scale(0.48)
        a2 = Text("只要流体不可压缩，单位时间流过每个截面的体积必须相等。", font=CJK).scale(0.48)
        ana = VGroup(a1, a2).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(a1))
        self.wait(0.8)
        self.play(FadeIn(a2))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════
        # Step 3 · 物理量定义
        # ═══════════════════════════════════════════════════════════════
        def_title = Text("基本物理量", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        row1 = VGroup(
            Text("S", font=CJK, color=YELLOW).scale(0.5),
            Text("—— 截面积", font=CJK).scale(0.5),
        ).arrange(RIGHT, buff=0.2)
        row2 = VGroup(
            Text("v", font=CJK, color=YELLOW).scale(0.5),
            Text("—— 截面处流速", font=CJK).scale(0.5),
        ).arrange(RIGHT, buff=0.2)
        row3 = VGroup(
            Text("Q = Sv", font=CJK, color=CYAN).scale(0.5),
            Text("—— 体积流量（单位时间流过截面的体积）", font=CJK).scale(0.5),
        ).arrange(RIGHT, buff=0.2)
        defs = VGroup(row1, row2, row3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        defs.next_to(def_title, DOWN, buff=0.4)
        self.play(FadeIn(def_title))
        for row in [row1, row2, row3]:
            self.play(FadeIn(row))
            self.wait(0.8)
        self.wait(1.2)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ═══════════════════════════════════════════════════════════════
        # Step 4 · 连续性方程推导（逐步）
        # ═══════════════════════════════════════════════════════════════
        eq_title = Text("连续性方程推导", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(eq_title))

        # 守恒条件
        cond = Text("不可压缩稳定流：质量既不创生也不消失", font=CJK).scale(0.46)
        cond.next_to(eq_title, DOWN, buff=0.4)
        self.play(FadeIn(cond))
        self.wait(1.0)

        # 等式逐步
        eq1 = MathTex(r"Q_1 = Q_2").scale(0.9)
        eq1.next_to(cond, DOWN, buff=0.4)
        self.play(Write(eq1))
        self.wait(0.8)

        eq2 = MathTex(r"S_1 v_1 = S_2 v_2").scale(0.9)
        eq2.next_to(eq1, DOWN, buff=0.35)
        eq2.set_color(YELLOW)
        self.play(TransformMatchingTex(eq1.copy(), eq2))
        self.wait(0.8)

        eq3 = MathTex(r"\rho S v = \mathrm{const}").scale(0.9)
        eq3.next_to(eq2, DOWN, buff=0.35)
        eq3.set_color(GREEN)
        note3 = Text("（密度 ρ 不变时简化为 Sv = const）", font=CJK, color=GREEN).scale(0.42)
        note3.next_to(eq3, DOWN, buff=0.25)
        self.play(Write(eq3))
        self.play(FadeIn(note3))
        self.wait(1.6)
        self.play(FadeOut(VGroup(eq_title, cond, eq1, eq2, eq3, note3)))

        # ═══════════════════════════════════════════════════════════════
        # Step 5 · 幕 1：流管截面图 + ValueTracker 动画
        # ═══════════════════════════════════════════════════════════════
        sect_title = Text("可视化：截面缩小 → 流速增大", font=CJK, color=BLUE).scale(0.50)
        sect_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sect_title))

        # --- 参数 ---
        ratio = ValueTracker(1.0)   # S2/S1 比值；从 1 变到 0.3
        S1_HALF = 0.85              # 左管半高（固定）
        X_L, X_R = -3.5, 0.5       # 流管 x 范围
        TUBE_Y = -0.3               # 流管整体竖直偏移
        V1_ARROW_LEN = 0.9          # v1 固定箭头长度
        Q_NORM = 1.0                # 归一化流量

        # 流管轮廓（always_redraw）
        def make_tube():
            r = ratio.get_value()
            s2_half = S1_HALF * r
            pts = [
                np.array([X_L,  S1_HALF, 0]) + np.array([0, TUBE_Y, 0]),
                np.array([X_R,  s2_half, 0]) + np.array([0, TUBE_Y, 0]),
                np.array([X_R, -s2_half, 0]) + np.array([0, TUBE_Y, 0]),
                np.array([X_L, -S1_HALF, 0]) + np.array([0, TUBE_Y, 0]),
            ]
            return Polygon(*pts, color=BLUE, fill_color=BLUE, fill_opacity=0.12, stroke_width=2.5)

        tube = always_redraw(make_tube)

        # 左截面线（固定）
        left_line = always_redraw(lambda: Line(
            np.array([X_L,  S1_HALF, 0]) + np.array([0, TUBE_Y, 0]),
            np.array([X_L, -S1_HALF, 0]) + np.array([0, TUBE_Y, 0]),
            color=ORANGE, stroke_width=3
        ))
        # 右截面线（随 ratio 变化）
        right_line = always_redraw(lambda: Line(
            np.array([X_R,  S1_HALF * ratio.get_value(), 0]) + np.array([0, TUBE_Y, 0]),
            np.array([X_R, -S1_HALF * ratio.get_value(), 0]) + np.array([0, TUBE_Y, 0]),
            color=RED, stroke_width=3
        ))

        # S1 标注（固定）
        s1_label = always_redraw(lambda: VGroup(
            Text("S", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"_1", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.04)
         .move_to(np.array([X_L - 0.45, TUBE_Y, 0])))

        # S2 标注（随 ratio 变化位置）
        s2_label = always_redraw(lambda: VGroup(
            Text("S", font=CJK, color=RED).scale(0.42),
            MathTex(r"_2", color=RED).scale(0.55),
        ).arrange(RIGHT, buff=0.04)
         .move_to(np.array([X_R + 0.45, TUBE_Y, 0])))

        # v1 箭头（固定在管中轴，左侧，朝右）
        v1_arrow = Arrow(
            start=np.array([X_L + 0.3, TUBE_Y, 0]),
            end=np.array([X_L + 0.3 + V1_ARROW_LEN, TUBE_Y, 0]),
            color=ORANGE, buff=0, stroke_width=4,
            max_tip_length_to_length_ratio=0.22,
        )
        v1_lbl = VGroup(
            MathTex(r"v_1", color=ORANGE).scale(0.7),
        ).next_to(v1_arrow, UP, buff=0.12)

        # v2 箭头（长度随 ratio 变化：v2 = v1/ratio）
        def make_v2_arrow():
            r = ratio.get_value()
            v2_len = V1_ARROW_LEN / r          # v2 ∝ 1/S2 ∝ 1/ratio
            v2_len = min(v2_len, 2.5)          # 防止超出屏幕
            x_start = X_R + 0.25
            return Arrow(
                start=np.array([x_start, TUBE_Y, 0]),
                end=np.array([x_start + v2_len, TUBE_Y, 0]),
                color=RED, buff=0, stroke_width=4,
                max_tip_length_to_length_ratio=0.22,
            )

        v2_arrow = always_redraw(make_v2_arrow)

        def make_v2_lbl():
            r = ratio.get_value()
            v2_val = Q_NORM / r
            return VGroup(
                MathTex(r"v_2", color=RED).scale(0.7),
            ).next_to(make_v2_arrow(), UP, buff=0.12)

        v2_lbl = always_redraw(make_v2_lbl)

        # 顶部守恒数字实时显示
        def make_conserve_readout():
            r = ratio.get_value()
            s2_v = r              # S2/S1
            v2_v = 1.0 / r        # v2/v1
            product1 = S1_VAL * V1_VAL
            product2 = s2_v * v2_v
            return VGroup(
                VGroup(
                    Text("S1 v1 =", font=CJK, color=ORANGE).scale(0.42),
                    MathTex(rf"{product1:.2f}", color=ORANGE).scale(0.65),
                ).arrange(RIGHT, buff=0.15),
                VGroup(
                    Text("S2 v2 =", font=CJK, color=RED).scale(0.42),
                    MathTex(rf"{product2:.2f}", color=RED).scale(0.65),
                ).arrange(RIGHT, buff=0.15),
            ).arrange(RIGHT, buff=0.7).to_edge(RIGHT, buff=0.5).shift(UP * 0.5)

        conserve_readout = always_redraw(make_conserve_readout)

        # 比值标注
        ratio_lbl = always_redraw(lambda: VGroup(
            Text("S2/S1 =", font=CJK, color=CYAN).scale(0.42),
            MathTex(rf"{ratio.get_value():.2f}", color=CYAN).scale(0.65),
        ).arrange(RIGHT, buff=0.15).to_edge(LEFT, buff=0.5).shift(UP * 0.5))

        # 守恒高亮提示
        const_eq = MathTex(r"S_1 v_1 = S_2 v_2 = \mathrm{const}", color=YELLOW).scale(0.75)
        const_eq.to_edge(DOWN, buff=0.55)

        # 出场
        self.play(Create(tube), Create(left_line), Create(right_line))
        self.play(
            FadeIn(v1_arrow), FadeIn(v1_lbl),
            Create(v2_arrow), FadeIn(v2_lbl),
            FadeIn(s1_label), FadeIn(s2_label),
        )
        self.play(FadeIn(ratio_lbl), FadeIn(conserve_readout))
        self.wait(0.8)
        self.play(Write(const_eq))
        self.wait(1.0)

        # 说明文字
        explain1 = Text("截面 S2 逐渐变小……", font=CJK, color=WHITE).scale(0.44)
        explain1.next_to(sect_title, DOWN, buff=0.2)
        explain2 = Text("……流速 v2 相应增大，乘积始终守恒", font=CJK, color=GREEN).scale(0.44)
        explain2.next_to(explain1, DOWN, buff=0.2)
        self.play(FadeIn(explain1))
        self.wait(0.5)
        self.play(FadeIn(explain2))

        # ValueTracker 动画主体
        self.play(ratio.animate.set_value(0.3), run_time=4.0, rate_func=smooth)
        self.wait(1.5)
        self.play(ratio.animate.set_value(1.0), run_time=2.5, rate_func=smooth)
        self.wait(0.8)
        self.play(ratio.animate.set_value(0.5), run_time=2.5, rate_func=smooth)
        self.wait(1.2)

        # 清场幕 1
        objs_act1 = VGroup(
            tube, left_line, right_line,
            v1_arrow, v1_lbl, v2_arrow, v2_lbl,
            s1_label, s2_label,
            ratio_lbl, conserve_readout,
            const_eq, explain1, explain2,
        )
        self.play(FadeOut(objs_act1), FadeOut(sect_title))

        # ═══════════════════════════════════════════════════════════════
        # Step 6 · 幕 2：v = Q/S 双曲线 + 高亮点随 ValueTracker 滑动
        # ═══════════════════════════════════════════════════════════════
        curve_title = Text("量化关系：v 与 S 的双曲线", font=CJK, color=BLUE).scale(0.50)
        curve_title.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(curve_title))

        # 重置 ratio 到 1
        ratio.set_value(1.0)

        # 坐标系
        ax = Axes(
            x_range=[0.2, 1.8, 0.4],
            y_range=[0.0, 4.0, 1.0],
            x_length=6.5,
            y_length=4.2,
            axis_config={"color": WHITE, "include_tip": True, "tip_length": 0.2},
        ).shift(DOWN * 0.5)

        x_label = VGroup(
            MathTex(r"S", color=ORANGE).scale(0.65),
            Text("（截面积）", font=CJK, color=WHITE).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)

        y_label = VGroup(
            MathTex(r"v", color=RED).scale(0.65),
            Text("（流速）", font=CJK, color=WHITE).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(ax.y_axis.get_end(), UP, buff=0.1)

        # 双曲线 v = Q/S（Q=1）
        hyperbola = ax.plot(
            lambda s: Q_FLOW / s,
            x_range=[0.25, 1.75],
            color=CYAN,
            stroke_width=3,
        )
        hyp_label = MathTex(r"v = \frac{Q}{S}", color=CYAN).scale(0.7)
        hyp_label.next_to(ax.c2p(0.4, 3.2), RIGHT, buff=0.12)

        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))
        self.play(Create(hyperbola), Write(hyp_label))
        self.wait(1.0)

        # 高亮点（随 ratio 移动：S = ratio * S1_VAL, v = Q/S = 1/ratio）
        highlight_dot = always_redraw(lambda: Dot(
            point=ax.c2p(ratio.get_value() * S1_VAL, Q_FLOW / (ratio.get_value() * S1_VAL)),
            color=YELLOW, radius=0.13
        ))
        dot_s_line = always_redraw(lambda: DashedLine(
            start=ax.c2p(ratio.get_value(), 0),
            end=ax.c2p(ratio.get_value(), Q_FLOW / ratio.get_value()),
            color=YELLOW, stroke_width=1.5
        ))
        dot_v_line = always_redraw(lambda: DashedLine(
            start=ax.c2p(0.2, Q_FLOW / ratio.get_value()),
            end=ax.c2p(ratio.get_value(), Q_FLOW / ratio.get_value()),
            color=YELLOW, stroke_width=1.5
        ))

        # 数字标注
        dot_readout = always_redraw(lambda: VGroup(
            VGroup(
                MathTex(r"S/S_1=", color=ORANGE).scale(0.55),
                MathTex(rf"{ratio.get_value():.2f}", color=ORANGE).scale(0.65),
            ).arrange(RIGHT, buff=0.1),
            VGroup(
                MathTex(r"v/v_1=", color=RED).scale(0.55),
                MathTex(rf"{1.0/ratio.get_value():.2f}", color=RED).scale(0.65),
            ).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).to_corner(UR, buff=0.55))

        self.play(FadeIn(highlight_dot), Create(dot_s_line), Create(dot_v_line), FadeIn(dot_readout))
        self.wait(0.8)

        note_hyp = Text("截面积减半 → 流速翻倍（双曲线关系）", font=CJK, color=GREEN).scale(0.43)
        note_hyp.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(note_hyp))

        # 滑动高亮点：ratio 从 1.0 → 0.3 → 1.0
        self.play(ratio.animate.set_value(0.3), run_time=3.5, rate_func=smooth)
        self.wait(1.2)
        self.play(ratio.animate.set_value(1.0), run_time=2.5, rate_func=smooth)
        self.wait(1.0)

        objs_act2 = VGroup(
            ax, x_label, y_label, hyperbola, hyp_label,
            highlight_dot, dot_s_line, dot_v_line, dot_readout,
            note_hyp, curve_title,
        )
        self.play(FadeOut(objs_act2))

        # ═══════════════════════════════════════════════════════════════
        # Step 7 · 数值例子
        # ═══════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        ex_q = Text("水管截面积 S1 = 4 cm², 水速 v1 = 2 m/s；变细处 S2 = 1 cm²，v2 = ?",
                    font=CJK).scale(0.42)
        ex_q.next_to(ex_title, DOWN, buff=0.4)
        ex_q.scale_to_fit_width(12.5)

        ex_calc1 = MathTex(r"S_1 v_1 = S_2 v_2").scale(0.85)
        ex_calc2 = MathTex(
            r"v_2 = \frac{S_1 v_1}{S_2} = \frac{4 \times 2}{1} = 8\ \mathrm{m/s}"
        ).scale(0.85).set_color(GREEN)
        ex_calc1.next_to(ex_q, DOWN, buff=0.38)
        ex_calc2.next_to(ex_calc1, DOWN, buff=0.3)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_q))
        self.wait(0.8)
        self.play(Write(ex_calc1))
        self.wait(0.7)
        self.play(Write(ex_calc2))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex_q, ex_calc1, ex_calc2)))

        # ═══════════════════════════════════════════════════════════════
        # Step 8 · 小结卡
        # ═══════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        f1 = MathTex(r"S_1 v_1 = S_2 v_2", color=YELLOW).scale(0.85)
        f2 = MathTex(r"\rho S v = \mathrm{const}", color=YELLOW).scale(0.85)
        c1 = Text("截面积 S 越小，流速 v 越大（成反比）", font=CJK, color=GREEN).scale(0.44)
        c2 = Text("本质是质量守恒：流进多少 = 流出多少", font=CJK, color=GREEN).scale(0.44)
        summary = VGroup(f1, f2, c1, c2).arrange(DOWN, buff=0.4).next_to(s_title, DOWN, buff=0.4)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)
        self.play(FadeIn(s_title))
        self.play(Write(f1), Write(f2))
        self.wait(0.5)
        self.play(FadeIn(c1), FadeIn(c2))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch02Kp3ContinuityEquation",
        "id": "phys-ch02-2.1-kp3-continuity-equation",
        "chapterId": "ch02",
        "sectionId": "2.1",
        "title": "连续性方程：流量守恒",
        "description": "用流管截面缩放动画与 v=Q/S 双曲线，直观演示不可压缩稳定流中 S1v1=S2v2 守恒规律。",
    },
]
