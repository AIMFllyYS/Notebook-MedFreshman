"""第 5.1 节 · 分子力与分子势能曲线（知识点 KP2）。

两图联动：上方 F(r) 分子力曲线（红色），下方 Ep(r) 势能曲线（绿色），
ValueTracker 扫动 r 值，实时标注斥力/引力/平衡态，演示势能阱底概念。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ─────────────────────────────────────────────────────────────────
# 使用 Lennard-Jones 形式的简化模型
# F(r) = -dEp/dr，势能 Ep(r) = a/r^12 - b/r^6（m=12,n=6）
# 取 a=1, b=2, r0=(2a/b)^(1/6)=1 (归一化)
# 则 Ep(r) = 1/r^12 - 2/r^6，F(r) = 12/r^13 - 12/r^7
A_COEFF = 1.0
B_COEFF = 2.0
R0 = 1.0  # 平衡距离，单位化

def ep_func(r):
    """势能 Ep(r) = a/r^12 - b/r^6，已归一化使 r0=1"""
    if r < 0.70:
        return 4.0  # 截断防止爆炸
    val = A_COEFF / r**12 - B_COEFF / r**6
    return max(min(val, 4.0), -1.5)

def force_func(r):
    """分子力 F(r) = -dEp/dr = 12a/r^13 - 6b/r^7
    F>0 为斥力（粒子间排斥，方向向外），F<0 为引力"""
    if r < 0.72:
        return 4.0
    val = 12 * A_COEFF / r**13 - 12 * B_COEFF / r**7
    # 注意符号：F = -dEp/dr = -(−12a/r^13 + 6b/r^7) = 12a/r^13 - 6b/r^7
    # 但为了让 F>0 表示斥力，此处：
    # dEp/dr = -12a/r^13 + 6b/r^7，F = -dEp/dr = 12a/r^13 - 6b/r^7
    return max(min(val, 4.0), -2.5)


class Ch05Kp2MolecularForcePotentialWell(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────────
        title = Text("分子力与分子势能曲线", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────────
        ana1 = Text("磁铁靠近时感到排斥，离开时感到吸引——", font=CJK).scale(0.5)
        ana2 = Text("分子之间的力也有同样的行为：太近则斥，太远则引。", font=CJK).scale(0.5)
        ana3 = Text("分子恰好在某个距离 r₀ 处受力为零，像被「弹簧锁住」。",
                    font=CJK, color=YELLOW).scale(0.5)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana_grp))

        # ── Step 3: 关键公式定义（逐步出现）────────────────────────────────
        formula_title = Text("分子势能模型", font=CJK, color=BLUE).scale(0.5)
        formula_title.next_to(title, DOWN, buff=0.45)

        f_ep = MathTex(
            r"E_p(r)", r"=", r"\frac{a}{r^m}", r"-", r"\frac{b}{r^n}",
            r"\quad (m > n)"
        ).scale(0.82)
        f_ep.next_to(formula_title, DOWN, buff=0.35)
        f_ep[2].set_color(RED)      # 斥力项
        f_ep[4].set_color(BLUE)     # 引力项

        label_rep = VGroup(
            Text("斥力项（短程，m 大）", font=CJK, color=RED).scale(0.38)
        ).next_to(f_ep[2], DOWN, buff=0.2)
        label_att = VGroup(
            Text("引力项（长程，n 小）", font=CJK, color=BLUE).scale(0.38)
        ).next_to(f_ep[4], DOWN, buff=0.2)

        self.play(FadeIn(formula_title))
        self.play(Write(f_ep[:2]))
        self.wait(0.5)
        self.play(Write(f_ep[2:4]), FadeIn(label_rep))
        self.wait(0.7)
        self.play(Write(f_ep[4:]), FadeIn(label_att))
        self.wait(0.8)

        f_force = MathTex(
            r"F(r)", r"=", r"-\frac{dE_p}{dr}"
        ).scale(0.82)
        f_force.next_to(f_ep, DOWN, buff=0.45)
        f_force[0].set_color(YELLOW)
        f_force[2].set_color(YELLOW)

        note_force = Text("分子力 = 势能对距离的负导数", font=CJK, color=GREEN).scale(0.42)
        note_force.next_to(f_force, DOWN, buff=0.2)

        self.play(Write(f_force))
        self.play(FadeIn(note_force))
        self.wait(1.6)
        self.play(FadeOut(VGroup(formula_title, f_ep, label_rep, label_att,
                                 f_force, note_force)))

        # ── Step 4: 建立双坐标系 ────────────────────────────────────────────
        # 上方：F(r) 曲线；下方：Ep(r) 曲线
        # 布局：两个坐标系垂直排列，r 轴对齐
        ax_F = Axes(
            x_range=[0.65, 3.2, 0.5],
            y_range=[-2.6, 4.2, 1],
            x_length=8.0,
            y_length=2.6,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(UP * 1.35)

        ax_Ep = Axes(
            x_range=[0.65, 3.2, 0.5],
            y_range=[-1.6, 4.2, 1],
            x_length=8.0,
            y_length=2.6,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 1.55)

        # 轴标签
        lbl_r_F = MathTex(r"r").scale(0.55).next_to(ax_F.x_axis.get_end(), DOWN, buff=0.12)
        lbl_F   = MathTex(r"F(r)").scale(0.55).next_to(ax_F.y_axis.get_end(), LEFT, buff=0.12)
        lbl_r_Ep= MathTex(r"r").scale(0.55).next_to(ax_Ep.x_axis.get_end(), DOWN, buff=0.12)
        lbl_Ep  = MathTex(r"E_p(r)").scale(0.55).next_to(ax_Ep.y_axis.get_end(), LEFT, buff=0.12)

        # 子图标题
        title_F  = Text("分子力 F(r)", font=CJK, color=RED).scale(0.42)
        title_F.next_to(ax_F, UP, buff=0.08)
        title_Ep = Text("分子势能 Ep(r)", font=CJK, color=GREEN).scale(0.42)
        title_Ep.next_to(ax_Ep, UP, buff=0.06)

        self.play(
            Create(ax_F), Create(ax_Ep),
            FadeIn(lbl_r_F), FadeIn(lbl_F),
            FadeIn(lbl_r_Ep), FadeIn(lbl_Ep),
            FadeIn(title_F), FadeIn(title_Ep),
        )
        self.wait(0.8)

        # ── Step 5: 绘制 F(r) 和 Ep(r) 曲线 ─────────────────────────────────
        curve_F = ax_F.plot(
            lambda r: force_func(r),
            x_range=[0.73, 3.15, 0.01],
            color=RED,
            stroke_width=3,
        )
        curve_Ep = ax_Ep.plot(
            lambda r: ep_func(r),
            x_range=[0.73, 3.15, 0.01],
            color=GREEN,
            stroke_width=3,
        )

        self.play(Create(curve_F), run_time=1.8)
        self.wait(0.4)
        self.play(Create(curve_Ep), run_time=1.8)
        self.wait(0.8)

        # ── Step 6: 标注平衡点 r0 ─────────────────────────────────────────
        # r0 处 F=0，Ep 最小
        r0_val = R0  # =1.0

        # 上图竖虚线与标注
        r0_top = ax_F.c2p(r0_val, 0)
        r0_top_bot = ax_F.c2p(r0_val, -2.5)
        r0_top_top = ax_F.c2p(r0_val, 4.0)
        dash_F = DashedLine(r0_top_bot, r0_top_top, color=CYAN, stroke_width=2)

        dot_F = Dot(ax_F.c2p(r0_val, 0), color=YELLOW, radius=0.09)
        lbl_r0_F = MathTex(r"r_0", color=YELLOW).scale(0.55)
        lbl_r0_F.next_to(ax_F.c2p(r0_val, 0), DOWN + RIGHT * 0.5, buff=0.12)

        # 下图竖虚线与标注
        ep_min = ep_func(r0_val)
        r0_bot_bot = ax_Ep.c2p(r0_val, -1.55)
        r0_bot_top = ax_Ep.c2p(r0_val, 4.0)
        dash_Ep = DashedLine(r0_bot_bot, r0_bot_top, color=CYAN, stroke_width=2)

        dot_Ep = Dot(ax_Ep.c2p(r0_val, ep_min), color=YELLOW, radius=0.09)
        lbl_r0_Ep = MathTex(r"r_0", color=YELLOW).scale(0.55)
        lbl_r0_Ep.next_to(ax_Ep.c2p(r0_val, ep_min), DOWN + RIGHT * 0.4, buff=0.12)
        lbl_Epmin = MathTex(r"E_{p,\min}", color=YELLOW).scale(0.48)
        lbl_Epmin.next_to(dot_Ep, LEFT, buff=0.15)

        self.play(
            Create(dash_F), Create(dash_Ep),
            FadeIn(dot_F), FadeIn(dot_Ep),
            FadeIn(lbl_r0_F), FadeIn(lbl_r0_Ep), FadeIn(lbl_Epmin),
        )
        self.wait(1.2)

        # 连接两图对应 r0 位置的水平辅助线（从上图零穿越到下图极小值）
        link_line = DashedLine(
            ax_F.c2p(r0_val, force_func(r0_val)),
            ax_Ep.c2p(r0_val, ep_func(r0_val)),
            color=CYAN, stroke_width=1.5, dash_length=0.08
        )
        self.play(Create(link_line))
        self.wait(0.8)

        # ── Step 7: ValueTracker 扫动 r，实时标注斥力/引力/平衡 ──────────────
        r_tracker = ValueTracker(1.8)

        # 上图：扫动点 + 力箭头
        dot_r_F = always_redraw(lambda: Dot(
            ax_F.c2p(r_tracker.get_value(), force_func(r_tracker.get_value())),
            color=ORANGE, radius=0.10
        ))
        # 竖向指示线（从 x 轴到当前点）
        vline_F = always_redraw(lambda: DashedLine(
            ax_F.c2p(r_tracker.get_value(), 0),
            ax_F.c2p(r_tracker.get_value(), force_func(r_tracker.get_value())),
            color=ORANGE, stroke_width=1.5
        ))

        # 下图：扫动点
        dot_r_Ep = always_redraw(lambda: Dot(
            ax_Ep.c2p(r_tracker.get_value(), ep_func(r_tracker.get_value())),
            color=ORANGE, radius=0.10
        ))
        vline_Ep = always_redraw(lambda: DashedLine(
            ax_Ep.c2p(r_tracker.get_value(), -1.55),
            ax_Ep.c2p(r_tracker.get_value(), ep_func(r_tracker.get_value())),
            color=ORANGE, stroke_width=1.5
        ))

        # 力方向箭头（在 F 图中，从当前点出发向上/下示意）
        def make_force_arrow():
            r_val = r_tracker.get_value()
            f_val = force_func(r_val)
            base = ax_F.c2p(r_val, f_val)
            if abs(f_val) < 0.08:
                # 平衡：画水平双向小箭头
                return DoubleArrow(
                    base + LEFT * 0.4, base + RIGHT * 0.4,
                    color=YELLOW, buff=0, stroke_width=2,
                    max_tip_length_to_length_ratio=0.25
                )
            direction = UP if f_val > 0 else DOWN
            length = min(abs(f_val) * 0.25, 0.8)
            return Arrow(
                base, base + direction * length,
                buff=0, color=(RED if f_val > 0 else BLUE),
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.30
            )

        force_arrow = always_redraw(make_force_arrow)

        # 文字标注（右侧固定区域，随 r 变化）
        def make_state_label():
            r_val = r_tracker.get_value()
            f_val = force_func(r_val)
            if abs(f_val) < 0.08:
                txt = Text("平衡态", font=CJK, color=YELLOW).scale(0.44)
            elif f_val > 0:
                txt = Text("斥力", font=CJK, color=RED).scale(0.44)
            else:
                txt = Text("引力", font=CJK, color=BLUE).scale(0.44)
            txt.to_corner(UR, buff=0.55).shift(DOWN * 0.5)
            return txt

        state_label = always_redraw(make_state_label)

        r_readout = always_redraw(lambda: MathTex(
            rf"r = {r_tracker.get_value():.2f}\,r_0", color=ORANGE
        ).scale(0.52).to_corner(UR, buff=0.55))

        self.play(FadeIn(dot_r_F), FadeIn(dot_r_Ep),
                  FadeIn(vline_F), FadeIn(vline_Ep),
                  FadeIn(force_arrow), FadeIn(state_label), FadeIn(r_readout))
        self.wait(0.5)

        # 从 r=1.8（引力区）→ r=1.0（平衡）→ r=0.85（斥力区）→ 回到引力区
        self.play(r_tracker.animate.set_value(1.0), run_time=2.5, rate_func=smooth)
        self.wait(1.0)
        self.play(r_tracker.animate.set_value(0.82), run_time=1.8, rate_func=smooth)
        self.wait(1.0)
        self.play(r_tracker.animate.set_value(2.4), run_time=3.0, rate_func=smooth)
        self.wait(1.2)
        self.play(r_tracker.animate.set_value(1.0), run_time=1.5, rate_func=smooth)
        self.wait(0.8)

        self.play(FadeOut(VGroup(dot_r_F, dot_r_Ep, vline_F, vline_Ep,
                                 force_arrow, state_label, r_readout)))

        # ── Step 8: 分区物理含义标注 ────────────────────────────────────────
        # 在 F(r) 图上标注三个区域
        # 区域1：r < r0 斥力区（红色背景）
        rect_rep = ax_F.get_area(
            curve_F,
            x_range=[0.73, r0_val],
            color=RED,
            opacity=0.15,
            bounded_graph=ax_F.plot(lambda r: 0, x_range=[0.73, r0_val], color=WHITE),
        )
        # 区域2：r > r0 引力区（蓝色背景）
        rect_att = ax_F.get_area(
            ax_F.plot(lambda r: 0, x_range=[r0_val, 3.15], color=WHITE),
            x_range=[r0_val, 3.15],
            color=BLUE,
            opacity=0.15,
            bounded_graph=curve_F,
        )

        self.play(FadeIn(rect_rep), FadeIn(rect_att))
        self.wait(0.6)

        lbl_rep_zone = Text("r<r₀: 斥力主导", font=CJK, color=RED).scale(0.38)
        lbl_rep_zone.next_to(ax_F.c2p(0.85, 3.5), RIGHT, buff=0.05)

        lbl_att_zone = Text("r>r₀: 引力主导", font=CJK, color=BLUE).scale(0.38)
        lbl_att_zone.next_to(ax_F.c2p(1.6, -2.0), RIGHT, buff=0.05)

        lbl_inf_zone = Text("r≫r₀: F→0", font=CJK, color=CYAN).scale(0.38)
        lbl_inf_zone.next_to(ax_F.c2p(2.5, -0.6), UP, buff=0.1)

        self.play(FadeIn(lbl_rep_zone), FadeIn(lbl_att_zone), FadeIn(lbl_inf_zone))
        self.wait(2.0)

        # ── Step 9: 势能阱（势阱）特写 ─────────────────────────────────────
        well_note = Text("势能阱底 = 分子最稳定位置（键长 r₀）",
                         font=CJK, color=YELLOW).scale(0.44)
        well_note.next_to(ax_Ep, DOWN, buff=0.2)
        well_note.scale_to_fit_width(9.0)

        # 画势阱区域
        ep_well_area = ax_Ep.get_area(
            curve_Ep,
            x_range=[0.80, 2.0],
            color=GREEN,
            opacity=0.12,
            bounded_graph=ax_Ep.plot(lambda r: ep_func(r0_val), x_range=[0.80, 2.0])
        )
        self.play(FadeIn(ep_well_area), FadeIn(well_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(rect_rep, rect_att, lbl_rep_zone, lbl_att_zone,
                                 lbl_inf_zone, ep_well_area, well_note)))

        # ── Step 10: 两粒子靠近/远离示意（简化）────────────────────────────
        # 在右侧画两个圆形粒子，演示靠近→斥力、远→引力
        self.play(FadeOut(VGroup(
            ax_F, ax_Ep, curve_F, curve_Ep,
            lbl_r_F, lbl_F, lbl_r_Ep, lbl_Ep,
            title_F, title_Ep,
            dash_F, dash_Ep, link_line,
            dot_F, dot_Ep,
            lbl_r0_F, lbl_r0_Ep, lbl_Epmin,
        )))

        demo_title = Text("微观粒子相互作用示意", font=CJK, color=BLUE).scale(0.52)
        demo_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(demo_title))
        self.wait(0.5)

        # 粒子 A（固定）和粒子 B（可移动）
        pA = Dot(point=ORIGIN, radius=0.22, color=WHITE)
        lbl_A = Text("A", font=CJK).scale(0.4).next_to(pA, DOWN, buff=0.1)

        sep = ValueTracker(2.8)  # 粒子间距（屏幕单位）

        pB = always_redraw(lambda: Dot(
            point=RIGHT * sep.get_value(),
            radius=0.22,
            color=interpolate_color(RED, BLUE,
                                    (sep.get_value() - 0.6) / 2.4)
        ))
        lbl_B = always_redraw(lambda: Text("B", font=CJK).scale(0.4).next_to(
            RIGHT * sep.get_value(), DOWN, buff=0.1
        ))

        # 受力箭头
        def make_demo_arrow():
            s = sep.get_value()
            # r0_val 对应屏幕上约 1.5 单位
            r_eff = s / 1.5  # 映射到物理 r
            f = force_func(r_eff)
            if abs(f) < 0.1:
                return VGroup()
            # B 受到 A 的力
            center_B = RIGHT * s
            if f > 0:  # 斥力：B 向右推
                arr_B = Arrow(center_B, center_B + RIGHT * min(f * 0.18, 0.9),
                              color=RED, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
                arr_A = Arrow(ORIGIN, LEFT * min(f * 0.18, 0.9),
                              color=RED, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
            else:  # 引力：B 向左拉
                arr_B = Arrow(center_B, center_B + LEFT * min(abs(f) * 0.18, 0.9),
                              color=BLUE, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
                arr_A = Arrow(ORIGIN, RIGHT * min(abs(f) * 0.18, 0.9),
                              color=BLUE, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
            return VGroup(arr_A, arr_B)

        demo_arrow = always_redraw(make_demo_arrow)

        def make_state_text():
            s = sep.get_value()
            r_eff = s / 1.5
            f = force_func(r_eff)
            if abs(f) < 0.1:
                t = Text("平衡：F = 0", font=CJK, color=YELLOW).scale(0.46)
            elif f > 0:
                t = Text("斥力：太近了！", font=CJK, color=RED).scale(0.46)
            else:
                t = Text("引力：相互吸引", font=CJK, color=BLUE).scale(0.46)
            t.to_edge(DOWN, buff=0.6)
            return t

        state_txt = always_redraw(make_state_text)

        particle_grp = VGroup(pA, lbl_A).shift(LEFT * 1.4).shift(DOWN * 0.3)
        pA.shift(LEFT * 1.4 + DOWN * 0.3)
        lbl_A = Text("A", font=CJK).scale(0.4).next_to(pA, DOWN, buff=0.1)
        # 重新整合布局
        pA2 = Dot(point=LEFT * 1.4 + DOWN * 0.3, radius=0.22, color=WHITE)
        lbl_A2 = Text("A", font=CJK).scale(0.4).next_to(pA2, DOWN, buff=0.1)

        pB2 = always_redraw(lambda: Dot(
            point=LEFT * 1.4 + RIGHT * sep.get_value() + DOWN * 0.3,
            radius=0.22,
            color=interpolate_color(RED, BLUE,
                                    min(max((sep.get_value() - 0.6) / 2.4, 0), 1))
        ))
        lbl_B2 = always_redraw(lambda: Text("B", font=CJK).scale(0.4).next_to(
            LEFT * 1.4 + RIGHT * sep.get_value() + DOWN * 0.3, DOWN, buff=0.1
        ))

        def make_demo_arrow2():
            s = sep.get_value()
            r_eff = s / 1.5
            f = force_func(r_eff)
            origin = LEFT * 1.4 + DOWN * 0.3
            center_B = origin + RIGHT * s
            if abs(f) < 0.08:
                return VGroup()
            arrow_len = min(abs(f) * 0.2, 1.0)
            if f > 0:
                arr_B = Arrow(center_B, center_B + RIGHT * arrow_len,
                              color=RED, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
                arr_A = Arrow(origin, origin + LEFT * arrow_len,
                              color=RED, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
            else:
                arr_B = Arrow(center_B, center_B + LEFT * arrow_len,
                              color=BLUE_C, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
                arr_A = Arrow(origin, origin + RIGHT * arrow_len,
                              color=BLUE_C, buff=0, stroke_width=2.5,
                              max_tip_length_to_length_ratio=0.28)
            return VGroup(arr_A, arr_B)

        demo_arrow2 = always_redraw(make_demo_arrow2)

        def make_state_text2():
            s = sep.get_value()
            r_eff = s / 1.5
            f = force_func(r_eff)
            if abs(f) < 0.08:
                t = Text("r = r₀ : 平衡，受力为零", font=CJK, color=YELLOW).scale(0.46)
            elif f > 0:
                t = Text("r < r₀ : 斥力，固液态不可压缩的微观原因", font=CJK, color=RED).scale(0.44)
            else:
                t = Text("r > r₀ : 引力，凝聚态（固液）稳定存在的原因", font=CJK, color=BLUE_C).scale(0.44)
            t.to_edge(DOWN, buff=0.5)
            return t

        state_txt2 = always_redraw(make_state_text2)

        self.play(
            FadeIn(pA2), FadeIn(lbl_A2),
            FadeIn(pB2), FadeIn(lbl_B2),
            FadeIn(demo_arrow2), FadeIn(state_txt2),
        )
        self.wait(0.5)

        # 从远处（引力区）→ 平衡 → 近处（斥力区）
        cap_far = Text("r >> r₀ : 引力趋于零（气态分子几乎自由）",
                       font=CJK, color=CYAN).scale(0.42)
        cap_far.next_to(demo_title, DOWN, buff=0.25)
        self.play(FadeIn(cap_far))
        self.wait(0.8)

        # 靠近过程
        self.play(sep.animate.set_value(1.5), run_time=2.2, rate_func=smooth)
        self.wait(1.2)
        self.play(FadeOut(cap_far))

        # 继续靠近到斥力区
        self.play(sep.animate.set_value(0.85), run_time=1.6, rate_func=smooth)
        self.wait(1.2)
        # 回到平衡
        self.play(sep.animate.set_value(1.5), run_time=1.5, rate_func=smooth)
        self.wait(0.8)
        # 拉远
        self.play(sep.animate.set_value(3.2), run_time=2.0, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(pA2, lbl_A2, pB2, lbl_B2,
                                 demo_arrow2, state_txt2, demo_title)))

        # ── Step 11: 小结卡 ─────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1 = MathTex(r"E_p(r)=\frac{a}{r^m}-\frac{b}{r^n}", color=YELLOW).scale(0.78)
        s2 = MathTex(r"F(r)=-\frac{dE_p}{dr}", color=YELLOW).scale(0.78)

        s3 = VGroup(
            MathTex(r"r < r_0", color=RED).scale(0.64),
            Text(": 斥力主导，固液不可压缩", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        s4 = VGroup(
            MathTex(r"r > r_0", color=BLUE_C).scale(0.64),
            Text(": 引力主导，凝聚态成因", font=CJK, color=BLUE_C).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        s5 = VGroup(
            MathTex(r"r \gg r_0", color=CYAN).scale(0.64),
            Text(": 力趋于零，气态自由运动", font=CJK, color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)
        s6 = VGroup(
            MathTex(r"r = r_0", color=YELLOW).scale(0.64),
            Text(": 平衡点，势能最低（势阱底）", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        summary = VGroup(s1, s2, s3, s4, s5, s6).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3), FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5), FadeIn(s6))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch05Kp2MolecularForcePotentialWell",
        "id": "phys-ch05-5.1-kp2-molecular-force-potential-well",
        "chapterId": "ch05",
        "sectionId": "5.1",
        "title": "分子力与分子势能曲线",
        "description": "双坐标系联动演示 F(r) 分子力曲线与 Ep(r) 势能阱，ValueTracker 扫动 r 值实时标注斥力/引力/平衡态，揭示凝聚态与不可压缩性的微观本质。",
    },
]
