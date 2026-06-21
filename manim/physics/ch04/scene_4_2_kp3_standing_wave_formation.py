"""第 4.2 节 · 驻波的形成与波节波腹分布（知识点 KP3）。

两列振幅相同、频率相同的行波沿相反方向叠加形成驻波。
三行坐标轴同步动画展示叠加过程，标注波节/波腹位置及间距，
最后以能量柱图展示动能↔势能的交替转化无净传播。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理参数
A = 0.55        # 振幅（坐标系单位）
K = 1.0         # 波数
OMEGA = 2.0     # 角频率
X_MAX = 3 * math.pi   # 显示范围 [0, 3π]
LAMBDA = 2 * math.pi / K   # 波长 = 2π


class Ch04Kp3StandingWaveFormation(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("驻波的形成与波节波腹分布", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("吉他弦两端固定，拨动后弦上形成「驻波」——", font=CJK).scale(0.46)
        ana2 = Text("某些点始终静止（波节），某些点振动最剧烈（波腹）。", font=CJK).scale(0.46)
        ana3 = Text("本质：两列行波相向传播叠加，能量就地交替而非向前净传播。",
                    font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 公式定义（逐步出现）───────────────────────────────
        eq_y1 = MathTex(
            r"y_1", r"=", r"A\cos(\omega t - kx)",
            r"\quad\text{(rightward)}"
        ).scale(0.72)
        eq_y1[0].set_color(RED)
        eq_y1[2].set_color(RED)

        eq_y2 = MathTex(
            r"y_2", r"=", r"A\cos(\omega t + kx)",
            r"\quad\text{(leftward)}"
        ).scale(0.72)
        eq_y2[0].set_color(BLUE)
        eq_y2[2].set_color(BLUE)

        eq_sum = MathTex(
            r"y", r"=", r"y_1 + y_2", r"=", r"2A\cos(kx)", r"\cos(\omega t)"
        ).scale(0.72)
        eq_sum[4].set_color(GREEN)
        eq_sum[5].set_color(YELLOW)

        eqs = VGroup(eq_y1, eq_y2, eq_sum).arrange(DOWN, buff=0.32).next_to(title, DOWN, buff=0.52)
        self.play(Write(eq_y1))
        self.wait(0.7)
        self.play(Write(eq_y2))
        self.wait(0.7)
        self.play(Write(eq_sum))
        self.wait(1.5)

        # 关键说明：空间振幅因子 vs 时间因子
        note_space = VGroup(
            Text("空间振幅因子：", font=CJK, color=GREEN).scale(0.4),
            MathTex(r"2A\cos(kx)", color=GREEN).scale(0.7),
        ).arrange(RIGHT, buff=0.15)
        note_time = VGroup(
            Text("时间因子：", font=CJK, color=YELLOW).scale(0.4),
            MathTex(r"\cos(\omega t)", color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.15)
        notes = VGroup(note_space, note_time).arrange(RIGHT, buff=0.8).next_to(eqs, DOWN, buff=0.3)
        self.play(FadeIn(notes))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eqs, notes)))

        # ── Step 4: 三行坐标系布局 ──────────────────────────────────
        row_h = 1.8   # 每行坐标系高度
        row_gap = 0.18
        # 三行中心 y 坐标（从上到下）
        y_centers = [1.2, -0.45, -2.1]

        def make_axes(yc):
            ax = Axes(
                x_range=[0, X_MAX, math.pi],
                y_range=[-1.3, 1.3, 1],
                x_length=9.5,
                y_length=row_h,
                axis_config={"color": GREY, "include_tip": False, "stroke_width": 1.5},
                x_axis_config={"include_numbers": False},
                y_axis_config={"include_numbers": False},
            ).shift(UP * yc)
            return ax

        ax1 = make_axes(y_centers[0])
        ax2 = make_axes(y_centers[1])
        ax3 = make_axes(y_centers[2])

        # 行标签
        lbl1 = VGroup(
            Text("向右行波", font=CJK, color=RED).scale(0.38),
            MathTex(r"y_1=A\cos(\omega t-kx)", color=RED).scale(0.52),
        ).arrange(DOWN, buff=0.08)
        lbl1.next_to(ax1, LEFT, buff=0.12)

        lbl2 = VGroup(
            Text("向左行波", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"y_2=A\cos(\omega t+kx)", color=BLUE).scale(0.52),
        ).arrange(DOWN, buff=0.08)
        lbl2.next_to(ax2, LEFT, buff=0.12)

        lbl3 = VGroup(
            Text("合成驻波", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"y=2A\cos(kx)\cos(\omega t)", color=GREEN).scale(0.52),
        ).arrange(DOWN, buff=0.08)
        lbl3.next_to(ax3, LEFT, buff=0.12)

        self.play(
            Create(ax1), Create(ax2), Create(ax3),
            FadeIn(lbl1), FadeIn(lbl2), FadeIn(lbl3),
        )

        # ── Step 5: ValueTracker 时间扫动，三行同步波形 ─────────────
        t_val = ValueTracker(0.0)

        wave1 = always_redraw(lambda: ax1.plot(
            lambda x: A * math.cos(OMEGA * t_val.get_value() - K * x),
            x_range=[0, X_MAX, 0.05],
            color=RED, stroke_width=2.5,
        ))
        wave2 = always_redraw(lambda: ax2.plot(
            lambda x: A * math.cos(OMEGA * t_val.get_value() + K * x),
            x_range=[0, X_MAX, 0.05],
            color=BLUE, stroke_width=2.5,
        ))
        wave3 = always_redraw(lambda: ax3.plot(
            lambda x: 2 * A * math.cos(K * x) * math.cos(OMEGA * t_val.get_value()),
            x_range=[0, X_MAX, 0.05],
            color=GREEN, stroke_width=2.8,
        ))

        self.play(Create(wave1), Create(wave2), Create(wave3))
        self.wait(0.5)

        # 动画：两个完整周期
        self.play(t_val.animate.set_value(2 * math.pi / OMEGA * 2.5),
                  run_time=6, rate_func=linear)
        # 暂停在 t=π/2，此时 cos(ωt)=0，驻波为零（所有点静止）
        pause_t = math.pi / (2 * OMEGA)
        self.play(t_val.animate.set_value(pause_t), run_time=0.8, rate_func=smooth)
        self.wait(0.8)

        cap_pause = Text("此刻所有点瞬间静止，能量全部为势能", font=CJK, color=YELLOW).scale(0.4)
        cap_pause.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(cap_pause))
        self.wait(1.2)
        self.play(FadeOut(cap_pause))

        # ── Step 6: 波节/波腹标注 ──────────────────────────────────
        # 重置时间到 t=0，cos(ωt)=1，驻波振幅完全显示
        self.play(t_val.animate.set_value(0.0), run_time=0.5, rate_func=smooth)
        self.wait(0.4)

        # 波节：kx = (n+1/2)π → x = (n+1/2)π/K = (n+1/2)π
        # 在 [0, 3π]：n=0→x=π/2, n=1→x=3π/2, n=2→x=5π/2
        node_xs = [math.pi / 2, 3 * math.pi / 2, 5 * math.pi / 2]
        # 波腹：kx = nπ → x = nπ
        # 在 [0, 3π]：n=0→x=0, n=1→x=π, n=2→x=2π, n=3→x=3π
        antinode_xs = [0, math.pi, 2 * math.pi, 3 * math.pi]

        node_dots = VGroup()
        for xn in node_xs:
            pt = ax3.c2p(xn, 0)
            d = Dot(pt, radius=0.12, color=RED)
            node_dots.add(d)

        antinode_dots = VGroup()
        for xa in antinode_xs:
            yval = 2 * A * math.cos(K * xa) * math.cos(OMEGA * 0.0)
            pt = ax3.c2p(xa, yval)
            d = Dot(pt, radius=0.12, color=YELLOW)
            antinode_dots.add(d)

        self.play(FadeIn(node_dots), FadeIn(antinode_dots))

        node_lbl = VGroup(
            Text("波节（始终静止）", font=CJK, color=RED).scale(0.38),
        ).next_to(node_dots[1], UP, buff=0.18)
        anti_lbl = VGroup(
            Text("波腹（振动最大）", font=CJK, color=YELLOW).scale(0.38),
        ).next_to(antinode_dots[1], DOWN, buff=0.18)
        self.play(FadeIn(node_lbl), FadeIn(anti_lbl))
        self.wait(1.2)

        # 双向箭头：相邻两波节间距 λ/2
        # 从 x=π/2 到 x=3π/2，距离 = π = λ/2
        arr_start = ax3.c2p(node_xs[0], -0.85)
        arr_end = ax3.c2p(node_xs[1], -0.85)
        spacing_arr = DoubleArrow(arr_start, arr_end, color=CYAN, buff=0, stroke_width=2.5,
                                   tip_length=0.18)
        spacing_lbl = VGroup(
            Text("相邻波节间距", font=CJK, color=CYAN).scale(0.35),
            MathTex(r"=\tfrac{\lambda}{2}", color=CYAN).scale(0.6),
        ).arrange(RIGHT, buff=0.1)
        spacing_lbl.next_to(spacing_arr, DOWN, buff=0.12)
        self.play(GrowArrow(spacing_arr), FadeIn(spacing_lbl))
        self.wait(1.5)

        # ── Step 7: 相位标注（反相 / 同相）──────────────────────────
        # 在波节两侧标注振动方向箭头（反相）
        x_left_anti = antinode_xs[1]   # x=π，左侧波腹
        x_right_anti = antinode_xs[2]  # x=2π，右侧波腹
        xn_mid = node_xs[1]            # x=3π/2，中间波节

        # 在 t 接近 0 时：左侧波腹向上振动，右侧波腹向下振动（反相）
        pt_left = ax3.c2p(x_left_anti, 0)
        pt_right = ax3.c2p(x_right_anti, 0)
        arr_up = Arrow(pt_left + DOWN * 0.3, pt_left + UP * 0.55, color=ORANGE,
                       stroke_width=2.5, buff=0, tip_length=0.18)
        arr_down = Arrow(pt_right + UP * 0.3, pt_right + DOWN * 0.55, color=ORANGE,
                         stroke_width=2.5, buff=0, tip_length=0.18)
        phase_lbl = Text("波节两侧：反相振动", font=CJK, color=ORANGE).scale(0.38)
        phase_lbl.next_to(ax3, RIGHT, buff=0.12).shift(UP * 0.4)
        self.play(GrowArrow(arr_up), GrowArrow(arr_down), FadeIn(phase_lbl))
        self.wait(1.5)

        # 波腹两侧同相：同一波腹左右两点振动方向相同
        x_left_of_anti = x_left_anti - 0.6
        x_right_of_anti = x_left_anti + 0.6
        pt_la = ax3.c2p(x_left_of_anti, 0)
        pt_ra = ax3.c2p(x_right_of_anti, 0)
        arr_up2 = Arrow(pt_la + DOWN * 0.15, pt_la + UP * 0.4, color=CYAN,
                        stroke_width=2.5, buff=0, tip_length=0.16)
        arr_up3 = Arrow(pt_ra + DOWN * 0.15, pt_ra + UP * 0.4, color=CYAN,
                        stroke_width=2.5, buff=0, tip_length=0.16)
        same_lbl = Text("波腹两侧：同相振动", font=CJK, color=CYAN).scale(0.38)
        same_lbl.next_to(phase_lbl, DOWN, buff=0.2)
        self.play(GrowArrow(arr_up2), GrowArrow(arr_up3), FadeIn(same_lbl))
        self.wait(1.5)

        # 清场：保留坐标系与波形，清除标注
        self.play(FadeOut(VGroup(
            node_dots, antinode_dots, node_lbl, anti_lbl,
            spacing_arr, spacing_lbl,
            arr_up, arr_down, phase_lbl,
            arr_up2, arr_up3, same_lbl,
        )))

        # ── Step 8: 恢复动画，再运行一轮让学生再感受叠加 ─────────
        self.play(t_val.animate.set_value(0.0), run_time=0.3)
        self.play(t_val.animate.set_value(2 * math.pi / OMEGA * 1.5),
                  run_time=4, rate_func=linear)
        self.wait(0.5)

        # 清场三行坐标系
        self.play(FadeOut(VGroup(
            ax1, ax2, ax3,
            lbl1, lbl2, lbl3,
            wave1, wave2, wave3,
        )))
        self.wait(0.3)

        # ── Step 9: 能量动画（动能↔势能交替）─────────────────────
        energy_title = Text("能量分布：动能与势能交替，无净传播", font=CJK, color=BLUE).scale(0.5)
        energy_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(energy_title))

        # 用 ValueTracker 驱动柱状图
        t_e = ValueTracker(0.0)

        # 波节处势能（振动速度=0，势能最大），用橙色柱
        # 波腹处动能（位移=0，速度最大），用蓝色柱
        # 简化示意：
        #   波腹动能 ~ cos²(ωt)（速度最大时动能最大）
        #   波节势能 ~ sin²(ωt)（位移最大时势能最大，但波节处位移=0……
        #   正确物理：
        #     驻波总能量 E ~ (2A)² * (  sin²(kx)sin²(ωt)  +  cos²(kx)sin²(ωt)  ) 简化后
        #   用简化示意：波腹 KE ~ cos²(ωt), 节间 PE ~ sin²(ωt)

        bar_w = 1.2
        bar_max_h = 2.8
        base_y = -1.8

        # 蓝柱：波腹动能
        ke_bar = always_redraw(lambda: Rectangle(
            width=bar_w,
            height=max(0.02, bar_max_h * math.cos(OMEGA * t_e.get_value()) ** 2),
            color=BLUE,
            fill_color=BLUE,
            fill_opacity=0.75,
        ).move_to(LEFT * 2 + UP * (base_y + bar_max_h * math.cos(OMEGA * t_e.get_value()) ** 2 / 2)))

        # 橙柱：波节势能
        pe_bar = always_redraw(lambda: Rectangle(
            width=bar_w,
            height=max(0.02, bar_max_h * math.sin(OMEGA * t_e.get_value()) ** 2),
            color=ORANGE,
            fill_color=ORANGE,
            fill_opacity=0.75,
        ).move_to(RIGHT * 2 + UP * (base_y + bar_max_h * math.sin(OMEGA * t_e.get_value()) ** 2 / 2)))

        ke_lbl = VGroup(
            Text("波腹", font=CJK, color=BLUE).scale(0.42),
            Text("动能", font=CJK, color=BLUE).scale(0.42),
        ).arrange(DOWN, buff=0.06).move_to(LEFT * 2 + UP * (base_y - 0.45))

        pe_lbl = VGroup(
            Text("波节间", font=CJK, color=ORANGE).scale(0.42),
            Text("势能", font=CJK, color=ORANGE).scale(0.42),
        ).arrange(DOWN, buff=0.06).move_to(RIGHT * 2 + UP * (base_y - 0.45))

        # 基准线
        base_line = Line(LEFT * 4.5 + UP * base_y, RIGHT * 4.5 + UP * base_y,
                         color=GREY, stroke_width=1.5)

        # 总能量守恒标注
        total_e_lbl = VGroup(
            Text("总能量守恒", font=CJK, color=WHITE).scale(0.4),
            MathTex(r"E_K + E_P = \text{const}", color=WHITE).scale(0.6),
        ).arrange(DOWN, buff=0.12).move_to(DOWN * 0.2)

        self.play(
            FadeIn(base_line),
            FadeIn(ke_lbl), FadeIn(pe_lbl),
            Create(ke_bar), Create(pe_bar),
            FadeIn(total_e_lbl),
        )
        self.wait(0.5)
        self.play(t_e.animate.set_value(2 * math.pi / OMEGA * 2.0),
                  run_time=5.5, rate_func=linear)
        self.wait(0.8)

        no_prop = Text("能量在两节之间来回转化，无净传播方向——这就是「驻波」！",
                       font=CJK, color=YELLOW).scale(0.44)
        no_prop.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(no_prop))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            energy_title, base_line,
            ke_bar, pe_bar, ke_lbl, pe_lbl,
            total_e_lbl, no_prop,
        )))

        # ── Step 10: 波节公式推导 ──────────────────────────────────
        deriv_title = Text("波节与波腹位置推导", font=CJK, color=BLUE).scale(0.5)
        deriv_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(deriv_title))

        d1 = MathTex(r"y = 2A\underbrace{\cos(kx)}_{\text{amplitude}}\cos(\omega t)").scale(0.78)
        d1.next_to(deriv_title, DOWN, buff=0.45)
        self.play(Write(d1))
        self.wait(0.8)

        d2 = VGroup(
            Text("波节（振幅=0）：", font=CJK, color=RED).scale(0.44),
            MathTex(r"\cos(kx)=0\;\Rightarrow\;kx=\left(n+\tfrac{1}{2}\right)\pi",
                    color=RED).scale(0.72),
        ).arrange(RIGHT, buff=0.18)
        d2.next_to(d1, DOWN, buff=0.42)
        self.play(Write(d2))
        self.wait(0.7)

        d3 = VGroup(
            Text("波腹（振幅最大）：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\cos(kx)=\pm 1\;\Rightarrow\;kx=n\pi",
                    color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.18)
        d3.next_to(d2, DOWN, buff=0.35)
        self.play(Write(d3))
        self.wait(0.7)

        d4 = VGroup(
            Text("相邻波节间距：", font=CJK, color=CYAN).scale(0.44),
            MathTex(r"\Delta x = \frac{\lambda}{2}", color=CYAN).scale(0.82),
        ).arrange(RIGHT, buff=0.18)
        d4.next_to(d3, DOWN, buff=0.35)
        self.play(Write(d4))
        self.wait(1.5)
        self.play(FadeOut(VGroup(deriv_title, d1, d2, d3, d4)))

        # ── Step 11: 小结卡 ────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("合成式：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"y=2A\cos(kx)\cos(\omega t)", color=GREEN).scale(0.74),
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("波节：", font=CJK, color=RED).scale(0.42),
            MathTex(r"kx=\left(n+\tfrac{1}{2}\right)\pi", color=RED).scale(0.74),
        ).arrange(RIGHT, buff=0.15)

        s3 = VGroup(
            Text("波腹：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"kx=n\pi", color=YELLOW).scale(0.74),
        ).arrange(RIGHT, buff=0.15)

        s4 = VGroup(
            Text("相邻波节间距：", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"\Delta x=\tfrac{\lambda}{2}", color=CYAN).scale(0.74),
        ).arrange(RIGHT, buff=0.15)

        s5 = Text("驻波无净能量传播；能量在波腹(动能)与波节间(势能)交替转化",
                  font=CJK, color=ORANGE).scale(0.4)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)
        self.play(
            Write(s1), Write(s2), Write(s3), Write(s4),
        )
        self.play(FadeIn(s5), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Kp3StandingWaveFormation",
        "id": "phys-ch04-4.2-kp3-standing-wave-formation",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "驻波的形成与波节波腹分布",
        "description": "三行坐标轴同步展示两列行波叠加为驻波，标注波节/波腹位置与间距λ/2，能量柱图演示动能↔势能交替转化而无净传播。",
    },
]
