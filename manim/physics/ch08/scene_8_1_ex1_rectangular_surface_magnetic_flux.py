"""第 8.1 节 · 例题：矩形平面磁通量（长直导线）

物理动画：用颜色渐变表现长直导线旁非均匀磁场的空间分布，
ValueTracker 扫动积分变量 x，演示磁通量积分过程与最终结果。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 颜色常量 ──────────────────────────────────────────────────────────────────
DEEP_BLUE = "#0033CC"
MID_BLUE = "#3399FF"
LIGHT_BLUE = "#AADDFF"
BAR_COLOR = "#4488FF"


class Ch08Ex1RectangularSurfaceMagneticFlux(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("矩形平面的磁通量", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第八章 稳恒磁场 · 8.1  例题精讲", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("把一块矩形纸片放在通电导线旁边，", font=CJK).scale(0.48)
        ana2 = Text("导线产生的磁场会穿过这块纸片。", font=CJK).scale(0.48)
        ana3 = Text("穿过纸片的总磁场量，就叫做「磁通量」。", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 题目条件展示 + 物理图像
        # ══════════════════════════════════════════════════════════════════
        cond_title = Text("题目条件", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        cond1 = Text("长直导线，电流向上（+y 方向）", font=CJK).scale(0.43)
        cond2 = Text("矩形平面：宽 l，距导线 d1 到 d2", font=CJK).scale(0.43)
        cond3 = Text("矩形平面与导线共面", font=CJK).scale(0.43)
        conds = VGroup(cond1, cond2, cond3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.32)
        self.play(FadeIn(cond_title))
        self.play(FadeIn(cond1))
        self.wait(0.5)
        self.play(FadeIn(cond2))
        self.wait(0.5)
        self.play(FadeIn(cond3))
        self.wait(1.2)
        self.play(FadeOut(VGroup(cond_title, conds)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 几何图像 —— 导线 + 矩形 + 磁场渐变着色
        # ══════════════════════════════════════════════════════════════════
        scene_label = Text("几何示意图", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(scene_label))

        # 坐标原点在画面左侧，导线竖直
        WIRE_X = -4.2   # 导线 x 坐标
        RECT_LEFT = -3.0  # 矩形左边（近端，对应 d1）
        RECT_RIGHT = 0.6  # 矩形右边（远端，对应 d2）
        RECT_BOT = -1.8
        RECT_TOP = 1.0
        RECT_H = RECT_TOP - RECT_BOT   # l = 2.8 单位

        # 导线（竖直线 + 电流箭头）
        wire = Line(
            start=np.array([WIRE_X, -2.5, 0]),
            end=np.array([WIRE_X, 2.5, 0]),
            color=ORANGE, stroke_width=5
        )
        curr_arrow = Arrow(
            start=np.array([WIRE_X, -0.4, 0]),
            end=np.array([WIRE_X, 0.8, 0]),
            color=ORANGE, buff=0, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        wire_label = VGroup(
            Text("I", font=CJK, color=ORANGE).scale(0.55),
        )
        wire_label[0].next_to(wire, LEFT, buff=0.18)

        self.play(Create(wire), GrowArrow(curr_arrow), FadeIn(wire_label))
        self.wait(0.6)

        # 矩形平面：用若干竖条填充，颜色从深蓝（近处）到浅蓝（远处）表示 B 衰减
        N_STRIPS = 18
        strips = VGroup()
        for i in range(N_STRIPS):
            t = i / (N_STRIPS - 1)  # 0 = 近端（深），1 = 远端（浅）
            x_left = RECT_LEFT + t * (RECT_RIGHT - RECT_LEFT)
            x_right = RECT_LEFT + (t + 1 / (N_STRIPS - 1)) * (RECT_RIGHT - RECT_LEFT)
            # 颜色插值：深蓝 → 浅蓝
            r = int(0x00 + t * (0xAA - 0x00))
            g = int(0x33 + t * (0xDD - 0x33))
            b = int(0xCC + t * (0xFF - 0xCC))
            col = "#{:02X}{:02X}{:02X}".format(r, g, b)
            strip = Rectangle(
                width=max(x_right - x_left, 0.001),
                height=RECT_H,
                fill_color=col,
                fill_opacity=0.72,
                stroke_width=0
            ).move_to(np.array([(x_left + x_right) / 2, (RECT_BOT + RECT_TOP) / 2, 0]))
            strips.add(strip)

        rect_border = Rectangle(
            width=RECT_RIGHT - RECT_LEFT,
            height=RECT_H,
            color=WHITE, stroke_width=2, fill_opacity=0
        ).move_to(np.array([(RECT_LEFT + RECT_RIGHT) / 2, (RECT_BOT + RECT_TOP) / 2, 0]))

        self.play(FadeIn(strips), Create(rect_border))
        self.wait(0.5)

        # 标注 d1, d2, l
        d1_dist = RECT_LEFT - WIRE_X   # 近端距离
        d2_dist = RECT_RIGHT - WIRE_X  # 远端距离

        d1_brace_line = DashedLine(
            start=np.array([WIRE_X, RECT_BOT - 0.55, 0]),
            end=np.array([RECT_LEFT, RECT_BOT - 0.55, 0]),
            color=CYAN, dash_length=0.12
        )
        d1_label = MathTex(r"d_1", color=CYAN).scale(0.55)
        d1_label.next_to(d1_brace_line, DOWN, buff=0.12)

        d2_brace_line = DashedLine(
            start=np.array([WIRE_X, RECT_BOT - 0.95, 0]),
            end=np.array([RECT_RIGHT, RECT_BOT - 0.95, 0]),
            color=GREEN, dash_length=0.12
        )
        d2_label = MathTex(r"d_2", color=GREEN).scale(0.55)
        d2_label.next_to(d2_brace_line, DOWN, buff=0.12)

        l_brace_line = DashedLine(
            start=np.array([RECT_RIGHT + 0.45, RECT_BOT, 0]),
            end=np.array([RECT_RIGHT + 0.45, RECT_TOP, 0]),
            color=YELLOW, dash_length=0.12
        )
        l_label = MathTex(r"l", color=YELLOW).scale(0.65)
        l_label.next_to(l_brace_line, RIGHT, buff=0.12)

        self.play(
            Create(d1_brace_line), FadeIn(d1_label),
            Create(d2_brace_line), FadeIn(d2_label),
            Create(l_brace_line), FadeIn(l_label),
        )
        self.wait(1.0)

        # 磁场圆形示意（由右手定则，在矩形区域内磁场垂直纸面向里）
        b_dir_note = VGroup(
            Text("矩形内磁场方向：垂直纸面向里", font=CJK, color=MID_BLUE).scale(0.40),
            Text("（由右手定则）", font=CJK, color=MID_BLUE).scale(0.38),
        ).arrange(DOWN, buff=0.08)
        b_dir_note.move_to(np.array([3.0, 1.5, 0]))
        self.play(FadeIn(b_dir_note))
        self.wait(1.0)

        # 场强说明：近处强（颜色深），远处弱（颜色浅）
        legend_near = VGroup(
            Rectangle(width=0.5, height=0.25, fill_color=DEEP_BLUE,
                      fill_opacity=0.85, stroke_width=0),
            Text("近导线  B 强", font=CJK).scale(0.36)
        ).arrange(RIGHT, buff=0.12)
        legend_far = VGroup(
            Rectangle(width=0.5, height=0.25, fill_color=LIGHT_BLUE,
                      fill_opacity=0.85, stroke_width=0),
            Text("远导线  B 弱", font=CJK).scale(0.36)
        ).arrange(RIGHT, buff=0.12)
        legend = VGroup(legend_near, legend_far).arrange(DOWN, buff=0.18).move_to(np.array([3.0, 0.3, 0]))
        self.play(FadeIn(legend))
        self.wait(1.2)

        # 清场（保留 title）
        geo_group = VGroup(
            wire, curr_arrow, wire_label, strips, rect_border,
            d1_brace_line, d1_label, d2_brace_line, d2_label,
            l_brace_line, l_label, b_dir_note, legend, scene_label
        )
        self.play(FadeOut(geo_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 面积元 dΦ 的定义与推导
        # ══════════════════════════════════════════════════════════════════
        deriv_title = Text("建立积分：取面积元", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(deriv_title))

        # 安培定律：长直导线磁场
        step_b = VGroup(
            Text("长直导线在距离 x 处的磁感应强度：", font=CJK).scale(0.43),
            MathTex(r"B(x) = \frac{\mu_0 I}{2\pi x}", color=YELLOW).scale(0.85),
        ).arrange(DOWN, buff=0.22)
        step_b.next_to(deriv_title, DOWN, buff=0.38)
        self.play(FadeIn(step_b[0]))
        self.wait(0.5)
        self.play(Write(step_b[1]))
        self.wait(1.2)

        # 面积元 dA
        step_da = VGroup(
            Text("取宽度为 dx 的竖条，面积元：", font=CJK).scale(0.43),
            MathTex(r"\mathrm{d}A = l \,\mathrm{d}x", color=CYAN).scale(0.85),
        ).arrange(DOWN, buff=0.22)
        step_da.next_to(step_b, DOWN, buff=0.35)
        self.play(FadeIn(step_da[0]))
        self.wait(0.4)
        self.play(Write(step_da[1]))
        self.wait(1.0)

        # dΦ 公式
        step_dphi = VGroup(
            Text("该面积元的磁通量：", font=CJK).scale(0.43),
            MathTex(
                r"\mathrm{d}\Phi = B(x)\,\mathrm{d}A"
                r"= \frac{\mu_0 I}{2\pi x}\,l\,\mathrm{d}x",
                color=YELLOW
            ).scale(0.78),
        ).arrange(DOWN, buff=0.22)
        step_dphi.next_to(step_da, DOWN, buff=0.35)
        self.play(FadeIn(step_dphi[0]))
        self.wait(0.4)
        self.play(Write(step_dphi[1]))
        self.wait(1.3)

        self.play(FadeOut(VGroup(deriv_title, step_b, step_da, step_dphi)))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: ValueTracker 扫动积分变量 x
        # ══════════════════════════════════════════════════════════════════
        scan_title = Text("面积元扫动：可视化积分过程", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(scan_title))

        # ── 重建几何图（简化版，用于扫动演示）────────────────────────────
        # 参数
        D1 = 1.0   # d1 单位（归一化）
        D2 = 3.5   # d2 单位
        L_RECT = 2.2  # 矩形高度 l（单位）

        # 坐标映射：x_world = X0 + (x_phys - 0) * SCALE
        X0 = -3.8  # 导线 world x
        SCALE = 1.0  # phys 单位 → world 单位

        def to_world(x_phys):
            return X0 + x_phys * SCALE

        RECT_Y_BOT = -1.3
        RECT_Y_TOP = RECT_Y_BOT + L_RECT

        # 导线
        w2 = Line(np.array([X0, -2.3, 0]), np.array([X0, 2.3, 0]), color=ORANGE, stroke_width=5)
        ca2 = Arrow(
            np.array([X0, -0.3, 0]), np.array([X0, 0.7, 0]),
            color=ORANGE, buff=0, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        wl2 = Text("I", font=CJK, color=ORANGE).scale(0.55).next_to(w2, LEFT, buff=0.18)

        # 矩形边框
        W_RECT = (D2 - D1) * SCALE
        rect_cx = (to_world(D1) + to_world(D2)) / 2
        rect_cy = (RECT_Y_BOT + RECT_Y_TOP) / 2
        rect2 = Rectangle(
            width=W_RECT, height=L_RECT,
            color=WHITE, stroke_width=2, fill_opacity=0
        ).move_to(np.array([rect_cx, rect_cy, 0]))

        # d1, d2 标注
        ann_d1 = MathTex(r"d_1", color=CYAN).scale(0.52).move_to(
            np.array([(X0 + to_world(D1)) / 2, RECT_Y_BOT - 0.5, 0])
        )
        ann_d2 = MathTex(r"d_2", color=GREEN).scale(0.52).move_to(
            np.array([(X0 + to_world(D2)) / 2, RECT_Y_BOT - 0.72, 0])
        )
        d1_tick = DashedLine(
            np.array([X0, RECT_Y_BOT - 0.38, 0]),
            np.array([to_world(D1), RECT_Y_BOT - 0.38, 0]),
            color=CYAN, dash_length=0.10
        )
        d2_tick = DashedLine(
            np.array([X0, RECT_Y_BOT - 0.60, 0]),
            np.array([to_world(D2), RECT_Y_BOT - 0.60, 0]),
            color=GREEN, dash_length=0.10
        )

        self.play(Create(w2), GrowArrow(ca2), FadeIn(wl2))
        self.play(Create(rect2))
        self.play(
            Create(d1_tick), FadeIn(ann_d1),
            Create(d2_tick), FadeIn(ann_d2),
        )
        self.wait(0.6)

        # ── ValueTracker ─────────────────────────────────────────────────
        x_tracker = ValueTracker(D1)

        # 高亮面积元（随 x_tracker 实时更新）
        DX = 0.12  # 面积元宽度（物理单位）

        def make_dx_strip():
            xv = x_tracker.get_value()
            xw = to_world(xv)
            strip_w = DX * SCALE
            return Rectangle(
                width=strip_w, height=L_RECT,
                fill_color=RED, fill_opacity=0.75,
                stroke_color=RED, stroke_width=1.5
            ).move_to(np.array([xw + strip_w / 2, rect_cy, 0]))

        dx_strip = always_redraw(make_dx_strip)
        self.add(dx_strip)

        # x 标注：水平箭头 + 标签
        def make_x_label():
            xv = x_tracker.get_value()
            xw = to_world(xv)
            return VGroup(
                DashedLine(
                    np.array([X0, RECT_Y_BOT - 0.18, 0]),
                    np.array([xw, RECT_Y_BOT - 0.18, 0]),
                    color=RED, dash_length=0.08
                ),
                MathTex(rf"x={xv:.2f}", color=RED).scale(0.45).next_to(
                    np.array([xw, RECT_Y_BOT - 0.18, 0]), DOWN, buff=0.12
                )
            )

        x_label = always_redraw(make_x_label)
        self.add(x_label)

        # dΦ 实时公式（右侧显示）
        # 使用 mu0*I / (2*pi*x) * l * dx 近似数值（归一化，mu0*I*l = 1）
        def make_dphi_formula():
            xv = x_tracker.get_value()
            dphi = 1.0 / (2 * math.pi * xv) * DX  # 归一化
            return VGroup(
                Text("当前面积元磁通量：", font=CJK, color=WHITE).scale(0.38),
                MathTex(
                    r"\mathrm{d}\Phi = \frac{\mu_0 I l}{2\pi x}\,\mathrm{d}x",
                    color=YELLOW
                ).scale(0.68),
                VGroup(
                    Text("x = ", font=CJK, color=RED).scale(0.38),
                    MathTex(rf"{xv:.2f}", color=RED).scale(0.55),
                    Text("  归一化值 = ", font=CJK, color=GREEN).scale(0.38),
                    MathTex(rf"{dphi:.4f}", color=GREEN).scale(0.55),
                ).arrange(RIGHT, buff=0.08)
            ).arrange(DOWN, buff=0.18).move_to(np.array([3.0, 0.5, 0]))

        dphi_formula = always_redraw(make_dphi_formula)
        self.add(dphi_formula)
        self.wait(0.8)

        # 扫动 x 从 d1 到 d2
        self.play(
            x_tracker.animate.set_value(D2 - DX),
            run_time=4.0,
            rate_func=linear
        )
        self.wait(0.8)
        self.remove(dx_strip, x_label, dphi_formula)

        # 清场扫动辅助元素
        self.play(FadeOut(VGroup(w2, ca2, wl2, rect2, d1_tick, ann_d1, d2_tick, ann_d2, scan_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 柱状图堆叠 —— 积分累积可视化
        # ══════════════════════════════════════════════════════════════════
        accum_title = Text("积分累积：各面积元贡献叠加", font=CJK, color=BLUE).scale(0.48).next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(accum_title))

        # 建立坐标轴
        axes = Axes(
            x_range=[0.8, 4.0, 0.5],
            y_range=[0.0, 0.28, 0.05],
            x_length=7.5,
            y_length=3.5,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=True,
        ).shift(DOWN * 0.6)

        ax_x_label = MathTex(r"x", color=WHITE).scale(0.55).next_to(axes.x_axis, RIGHT, buff=0.18)
        ax_y_label = VGroup(
            MathTex(r"\mathrm{d}\Phi", color=WHITE).scale(0.50),
        ).next_to(axes.y_axis, UP, buff=0.12)

        self.play(Create(axes), FadeIn(ax_x_label), FadeIn(ax_y_label))

        # 画 dΦ/dx 曲线（1/(2πx) 形状）
        # 归一化：令 μ₀Il/(2π) = 1，则 dΦ/dx = 1/x，柱高 = dx/x
        DX_BAR = 0.18
        N_BARS = int((D2 - D1) / DX_BAR) + 1
        xs = [D1 + i * DX_BAR for i in range(N_BARS) if D1 + i * DX_BAR <= D2]

        bars = VGroup()
        for xv in xs:
            bar_h = (1.0 / xv) * DX_BAR  # ΔΦ 归一化
            bar = axes.get_riemann_rectangles(
                axes.plot(lambda xx: 1.0 / xx, x_range=[xv, min(xv + DX_BAR, D2)],
                          color=BLUE),
                x_range=[xv, min(xv + DX_BAR, D2)],
                dx=DX_BAR,
                color=BAR_COLOR,
                fill_opacity=0.75,
                stroke_width=0.8,
                stroke_color=WHITE,
            )
            bars.add(bar)

        # 逐条出现动画
        self.play(LaggedStart(*[FadeIn(b) for b in bars], lag_ratio=0.08), run_time=2.8)
        self.wait(0.7)

        # 画积分曲线（1/x 函数）覆盖
        curve = axes.plot(lambda x: 1.0 / x, x_range=[D1, D2], color=YELLOW, stroke_width=2.5)
        self.play(Create(curve))

        curve_label = VGroup(
            MathTex(r"\frac{1}{x}", color=YELLOW).scale(0.55),
        ).next_to(curve.get_end(), RIGHT, buff=0.15)
        self.play(FadeIn(curve_label))
        self.wait(0.8)

        # 柱子高亮成绿色 → 表示汇聚
        self.play(bars.animate.set_fill(GREEN, opacity=0.70), run_time=1.2)
        total_note = Text("所有柱子面积之和 = 总磁通量 Φ", font=CJK, color=GREEN).scale(0.42)
        total_note.next_to(accum_title, DOWN, buff=0.22)
        self.play(FadeIn(total_note))
        self.wait(1.2)

        self.play(FadeOut(VGroup(axes, bars, curve, curve_label, ax_x_label, ax_y_label,
                                 accum_title, total_note)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 推导积分，逐步动画
        # ══════════════════════════════════════════════════════════════════
        integ_title = Text("推导积分结果", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(integ_title))

        # 行 1：积分式
        row1_text = Text("对 x 从 d1 到 d2 积分：", font=CJK).scale(0.44)
        row1_text.next_to(integ_title, DOWN, buff=0.35)
        row1 = MathTex(
            r"\Phi = \int_{d_1}^{d_2} \frac{\mu_0 I}{2\pi x}\,l\,\mathrm{d}x"
        ).scale(0.85)
        row1.next_to(row1_text, DOWN, buff=0.28)
        row1[0].set_color(WHITE)
        self.play(FadeIn(row1_text))
        self.wait(0.4)
        self.play(Write(row1))
        self.wait(1.0)

        # 行 2：提出常数
        row2 = MathTex(
            r"= \frac{\mu_0 I l}{2\pi} \int_{d_1}^{d_2} \frac{\mathrm{d}x}{x}"
        ).scale(0.85)
        row2.next_to(row1, DOWN, buff=0.35)
        note_const = Text("（常数提到积分号外）", font=CJK, color=CYAN).scale(0.38)
        note_const.next_to(row2, RIGHT, buff=0.25)
        self.play(TransformMatchingTex(row1.copy(), row2))
        self.play(FadeIn(note_const))
        self.wait(1.0)

        # 行 3：ln 结果
        row3 = MathTex(
            r"= \frac{\mu_0 I l}{2\pi} \left[\ln x\right]_{d_1}^{d_2}"
        ).scale(0.85)
        row3.next_to(row2, DOWN, buff=0.35)
        note_ln = Text("(ln x 是 1/x 的原函数)", font=CJK, color=CYAN).scale(0.38)
        note_ln.next_to(row3, RIGHT, buff=0.25)
        self.play(TransformMatchingTex(row2.copy(), row3))
        self.play(FadeIn(note_ln))
        self.wait(1.0)

        # 行 4：最终结果（高亮）
        row4 = MathTex(
            r"\Phi = \frac{\mu_0 I l}{2\pi} \ln\frac{d_2}{d_1}",
            color=YELLOW
        ).scale(0.95)
        row4.next_to(row3, DOWN, buff=0.42)
        box4 = SurroundingRectangle(row4, color=YELLOW, buff=0.2, corner_radius=0.12)
        self.play(Write(row4), Create(box4))
        self.wait(1.5)

        self.play(FadeOut(VGroup(integ_title, row1_text, row1, row2, note_const,
                                  row3, note_ln, row4, box4)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 物理意义讲解
        # ══════════════════════════════════════════════════════════════════
        meaning_title = Text("公式的物理意义", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(meaning_title))

        m1 = Text("ln(d2/d1)：仅取决于矩形与导线的相对位置比", font=CJK).scale(0.43)
        m2 = Text("若 d2/d1 越大（矩形越宽 or 近端越靠近导线），Φ 越大", font=CJK).scale(0.42)
        m3 = Text("若 d2 = e·d1，则 ln(d2/d1) = 1，Φ = μ₀Il/(2π)", font=CJK, color=GREEN).scale(0.42)
        m_group = VGroup(m1, m2, m3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        m_group.next_to(meaning_title, DOWN, buff=0.40)
        m_group.scale_to_fit_width(11.5)
        self.play(FadeIn(m1))
        self.wait(0.7)
        self.play(FadeIn(m2))
        self.wait(0.7)
        self.play(FadeIn(m3))
        self.wait(1.3)
        self.play(FadeOut(VGroup(meaning_title, m_group)))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 数值例子
        # ══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(ex_title))

        ex_cond = VGroup(
            Text("I = 10 A,  l = 0.20 m,  d1 = 0.05 m,  d2 = 0.15 m", font=CJK).scale(0.43),
        )
        ex_cond.next_to(ex_title, DOWN, buff=0.35)

        # 代入公式
        ex_formula = MathTex(
            r"\Phi = \frac{4\pi\times10^{-7}\times10\times0.20}{2\pi}"
            r"\ln\frac{0.15}{0.05}"
        ).scale(0.72)
        ex_formula.next_to(ex_cond, DOWN, buff=0.30)

        # 计算结果
        val = (4e-7 * 10 * 0.20) / 2 * math.log(0.15 / 0.05)
        ex_result = MathTex(
            rf"= {val:.4e}\ \mathrm{{Wb}}", color=GREEN
        ).scale(0.82)
        ex_result.next_to(ex_formula, DOWN, buff=0.30)

        self.play(FadeIn(ex_cond))
        self.wait(0.6)
        self.play(Write(ex_formula))
        self.wait(0.8)
        self.play(Write(ex_result))
        self.wait(1.4)
        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_formula, ex_result)))

        # ══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sum_title))

        s_key_label = Text("关键思路：", font=CJK, color=WHITE).scale(0.44)
        s_key1 = Text("1. 非均匀磁场 → 取面积元 dA = l dx", font=CJK).scale(0.42)
        s_key2 = Text("2. dΦ = B(x) dA，再对 x 积分", font=CJK).scale(0.42)
        s_key3 = Text("3. 结果含自然对数，反映磁场的 1/x 衰减规律", font=CJK).scale(0.42)

        s_formula1 = MathTex(
            r"\mathrm{d}\Phi = \frac{\mu_0 I}{2\pi x}\,l\,\mathrm{d}x",
            color=YELLOW
        ).scale(0.80)
        s_formula2 = MathTex(
            r"\Phi = \frac{\mu_0 I l}{2\pi}\ln\frac{d_2}{d_1}",
            color=YELLOW
        ).scale(0.90)

        keys = VGroup(s_key_label, s_key1, s_key2, s_key3).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        formulas = VGroup(s_formula1, s_formula2).arrange(DOWN, buff=0.30)
        summary_body = VGroup(keys, formulas).arrange(RIGHT, buff=0.55)
        summary_body.next_to(sum_title, DOWN, buff=0.38)
        summary_body.scale_to_fit_width(12.5)

        box_s = SurroundingRectangle(summary_body, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(keys))
        self.wait(0.6)
        self.play(Write(s_formula1), Write(s_formula2))
        self.play(Create(box_s))
        self.wait(2.0)

        self.play(FadeOut(VGroup(sum_title, summary_body, box_s, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch08Ex1RectangularSurfaceMagneticFlux",
        "id": "phys-ch08-8.1-ex1-rectangular-surface-magnetic-flux",
        "chapterId": "ch08",
        "sectionId": "8.1",
        "title": "矩形平面磁通量（长直导线）",
        "description": "通过颜色渐变、ValueTracker扫动积分变量、柱状图堆叠三步动画，演示长直导线旁矩形面的磁通量积分推导，最终得到 Φ=(μ₀Il/2π)ln(d2/d1)。",
    },
]
