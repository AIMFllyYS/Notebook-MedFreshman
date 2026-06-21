"""第 4.2 节 · 例题：由驻波方程求波节波腹位置。

已知驻波方程 y = 0.12 cos(πx) cos(4πt) [m]，
依次求：波节位置、波腹位置、x=1.2 m 处振幅。
最后播放驻波整体振动动画。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch04Ex2StandingWaveNodesAntinodes",
        "id": "phys-ch04-4.2-ex2-standing-wave-nodes-antinodes",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "例题：由驻波方程求波节波腹位置",
        "description": "由驻波方程 y=0.12cos(πx)cos(4πt) 逐步推导波节、波腹位置及任意点振幅，最终动画展示驻波整体振动形态。",
    }
]


class Ch04Ex2StandingWaveNodesAntinodes(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("例题：由驻波方程求波节波腹位置", font=CJK, color=BLUE).scale(0.58)
        title.to_edge(UP, buff=0.25)
        subtitle = Text("第四章 机械波 · 4.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("吉他弦拨动后，弦上出现几个固定不动的点——", font=CJK).scale(0.46)
        ana2 = Text("这些「不动的点」叫波节，振动最剧烈的点叫波腹。", font=CJK).scale(0.46)
        ana3 = Text("驻波方程能直接告诉我们它们在哪里！", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 给出驻波方程，拆解结构 ────────────────────────────
        eq_main = MathTex(
            r"y", r"=", r"0.12", r"\cos(\pi x)", r"\cos(4\pi t)",
            r"\quad (\mathrm{m})"
        ).scale(0.82)
        eq_main[2].set_color(ORANGE)
        eq_main[3].set_color(YELLOW)
        eq_main[4].set_color(CYAN)
        eq_main.next_to(title, DOWN, buff=0.5)
        self.play(Write(eq_main))
        self.wait(0.5)

        lbl_A = VGroup(
            Text("振幅因子", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"A(x)=|0.12\cos(\pi x)|", color=ORANGE).scale(0.55),
        ).arrange(DOWN, buff=0.1)
        lbl_t = VGroup(
            Text("时间振动因子", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"\cos(4\pi t)", color=CYAN).scale(0.55),
        ).arrange(DOWN, buff=0.1)
        lbl_A.next_to(eq_main, DOWN, buff=0.35).shift(LEFT * 2.2)
        lbl_t.next_to(eq_main, DOWN, buff=0.35).shift(RIGHT * 2.2)
        self.play(FadeIn(lbl_A), FadeIn(lbl_t))
        self.wait(1.6)
        self.play(FadeOut(lbl_A), FadeOut(lbl_t))

        # ── Step 4: 建立坐标系，绘制振幅包络 |A(x)| ───────────────────
        axes = Axes(
            x_range=[-3.2, 3.2, 0.5],
            y_range=[-0.02, 0.16, 0.04],
            x_length=10.5,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [-3, -2, -1, 0, 1, 2, 3]},
            y_axis_config={"numbers_to_include": [0.04, 0.08, 0.12]},
        ).shift(DOWN * 1.2)

        x_lbl = MathTex(r"x\;(\mathrm{m})").scale(0.5).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = MathTex(r"A\;(\mathrm{m})").scale(0.5).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        envelope = axes.plot(
            lambda x: abs(0.12 * math.cos(math.pi * x)),
            x_range=[-3.2, 3.2, 0.02],
            color=RED,
            stroke_width=2.5,
        )
        env_lbl = VGroup(
            Text("振幅包络", font=CJK, color=RED).scale(0.38),
            MathTex(r"A(x)=|0.12\cos(\pi x)|", color=RED).scale(0.5),
        ).arrange(RIGHT, buff=0.15)
        env_lbl.next_to(axes, DOWN, buff=0.28)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(envelope), run_time=1.5)
        self.play(FadeIn(env_lbl))
        self.wait(1.2)

        # ── Step 5: 高亮波节 (green 垂线) ──────────────────────────────
        node_xs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]
        node_lines = VGroup()
        node_dots = VGroup()
        for xv in node_xs:
            top = axes.c2p(xv, 0.0)
            bot = axes.c2p(xv, 0.0)
            # 垂线从 x 轴往上到 0.01（波节处包络为 0，仅画短标记线）
            vl = DashedLine(
                axes.c2p(xv, -0.005),
                axes.c2p(xv, 0.025),
                color=GREEN,
                stroke_width=2,
            )
            node_lines.add(vl)
            node_dots.add(Dot(axes.c2p(xv, 0.0), color=GREEN, radius=0.07))

        node_cond_lbl = VGroup(
            Text("波节条件：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\cos(\pi x)=0", color=GREEN).scale(0.6),
        ).arrange(RIGHT, buff=0.12)
        node_pos_lbl = VGroup(
            Text("波节位置：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"x=\pm0.5,\;\pm1.5,\;\pm2.5,\;\ldots\;\mathrm{m}", color=GREEN).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        node_formula = VGroup(
            Text("即", font=CJK, color=GREEN).scale(0.38),
            MathTex(r"\pi x=\left(n+\tfrac{1}{2}\right)\pi,\quad n=0,\pm1,\pm2,\ldots", color=GREEN).scale(0.52),
        ).arrange(RIGHT, buff=0.12)

        node_block = VGroup(node_cond_lbl, node_pos_lbl, node_formula).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        node_block.next_to(axes, DOWN, buff=0.28)

        self.play(FadeOut(env_lbl))
        self.play(Create(node_lines), FadeIn(node_dots))
        self.play(FadeIn(node_cond_lbl))
        self.wait(0.6)
        self.play(FadeIn(node_pos_lbl))
        self.wait(0.6)
        self.play(FadeIn(node_formula))
        self.wait(1.8)
        self.play(FadeOut(VGroup(node_block, node_lines, node_dots)))

        # ── Step 6: 高亮波腹 (orange 垂线) ─────────────────────────────
        antinode_xs = [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0]
        anti_lines = VGroup()
        anti_dots = VGroup()
        for xv in antinode_xs:
            if abs(xv) <= 3.1:
                vl = DashedLine(
                    axes.c2p(xv, 0.0),
                    axes.c2p(xv, 0.12),
                    color=ORANGE,
                    stroke_width=2,
                )
                anti_lines.add(vl)
                anti_dots.add(Dot(axes.c2p(xv, 0.12), color=ORANGE, radius=0.07))

        anti_cond_lbl = VGroup(
            Text("波腹条件：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"|\cos(\pi x)|=1", color=ORANGE).scale(0.6),
        ).arrange(RIGHT, buff=0.12)
        anti_pos_lbl = VGroup(
            Text("波腹位置：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"x=0,\;\pm1,\;\pm2,\;\ldots\;\mathrm{m}", color=ORANGE).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        anti_amp_lbl = VGroup(
            Text("波腹振幅：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"A_{\max}=0.12\;\mathrm{m}", color=ORANGE).scale(0.6),
        ).arrange(RIGHT, buff=0.12)
        anti_formula = VGroup(
            Text("即", font=CJK, color=ORANGE).scale(0.38),
            MathTex(r"\pi x=n\pi,\quad n=0,\pm1,\pm2,\ldots", color=ORANGE).scale(0.52),
        ).arrange(RIGHT, buff=0.12)

        anti_block = VGroup(anti_cond_lbl, anti_pos_lbl, anti_amp_lbl, anti_formula).arrange(DOWN, buff=0.16, aligned_edge=LEFT)
        anti_block.next_to(axes, DOWN, buff=0.28)

        self.play(Create(anti_lines), FadeIn(anti_dots))
        self.play(FadeIn(anti_cond_lbl))
        self.wait(0.5)
        self.play(FadeIn(anti_pos_lbl))
        self.wait(0.5)
        self.play(FadeIn(anti_amp_lbl))
        self.wait(0.5)
        self.play(FadeIn(anti_formula))
        self.wait(1.8)
        self.play(FadeOut(VGroup(anti_block, anti_lines, anti_dots)))

        # ── Step 7: 计算 x=1.2 m 处振幅 ───────────────────────────────
        x_spec = 1.2
        amp_spec = abs(0.12 * math.cos(math.pi * x_spec))  # ≈0.09708

        spec_line = DashedLine(
            axes.c2p(x_spec, 0.0),
            axes.c2p(x_spec, amp_spec),
            color=BLUE,
            stroke_width=3,
        )
        spec_dot = Dot(axes.c2p(x_spec, amp_spec), color=BLUE, radius=0.09)
        spec_x_lbl = MathTex(r"x=1.2", color=BLUE).scale(0.48)
        spec_x_lbl.next_to(axes.c2p(x_spec, 0.0), DOWN, buff=0.12)

        calc_step1 = VGroup(
            Text("代入 x=1.2 m：", font=CJK, color=BLUE).scale(0.42),
            MathTex(r"A=|0.12\cos(1.2\pi)|", color=BLUE).scale(0.6),
        ).arrange(RIGHT, buff=0.12)
        calc_step2 = VGroup(
            Text("其中", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"\cos(1.2\pi)=\cos(216^{\circ})\approx -0.809", color=WHITE).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        calc_step3 = VGroup(
            Text("所以", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"A\approx 0.12\times0.809\approx\mathbf{0.097}\;\mathrm{m}", color=GREEN).scale(0.6),
        ).arrange(RIGHT, buff=0.12)

        calc_block = VGroup(calc_step1, calc_step2, calc_step3).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        calc_block.next_to(axes, DOWN, buff=0.28)

        self.play(Create(spec_line), FadeIn(spec_dot), FadeIn(spec_x_lbl))
        self.play(FadeIn(calc_step1))
        self.wait(0.8)
        self.play(FadeIn(calc_step2))
        self.wait(0.8)
        self.play(FadeIn(calc_step3))
        self.wait(2.0)

        # 高亮结果数字
        result_box = SurroundingRectangle(calc_step3, color=GREEN, buff=0.12, corner_radius=0.08)
        self.play(Create(result_box))
        self.wait(1.5)
        self.play(FadeOut(VGroup(calc_block, result_box, spec_line, spec_dot, spec_x_lbl)))

        # ── Step 8: 播放驻波整体振动动画 ───────────────────────────────
        wave_anim_lbl = Text("驻波随时间振动：各点振幅受包络约束，波节始终静止", font=CJK, color=YELLOW).scale(0.40)
        wave_anim_lbl.next_to(axes, DOWN, buff=0.28)
        self.play(FadeIn(wave_anim_lbl))

        t_tracker = ValueTracker(0.0)
        standing = always_redraw(
            lambda: axes.plot(
                lambda x: 0.12 * math.cos(math.pi * x) * math.cos(4 * math.pi * t_tracker.get_value()),
                x_range=[-3.2, 3.2, 0.02],
                color=YELLOW,
                stroke_width=2.5,
            )
        )
        self.play(Create(standing))
        self.play(t_tracker.animate.set_value(1.5), run_time=6, rate_func=linear)
        self.wait(0.5)

        # 节点标记叠加展示（驻波节点始终为 0）
        node_marks_final = VGroup()
        for xv in [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]:
            node_marks_final.add(Dot(axes.c2p(xv, 0.0), color=GREEN, radius=0.07))
        anti_marks_final = VGroup()
        for xv in [-2.0, -1.0, 0.0, 1.0, 2.0]:
            anti_marks_final.add(Dot(axes.c2p(xv, 0.0), color=ORANGE, radius=0.07))

        node_legend = VGroup(
            Dot(color=GREEN, radius=0.08),
            Text("波节（始终静止）", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.15)
        anti_legend = VGroup(
            Dot(color=ORANGE, radius=0.08),
            Text("波腹（振幅最大）", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.15)
        legend_group = VGroup(node_legend, anti_legend).arrange(RIGHT, buff=0.6)
        legend_group.next_to(wave_anim_lbl, DOWN, buff=0.2)

        self.play(FadeIn(node_marks_final), FadeIn(anti_marks_final), FadeIn(legend_group))
        self.play(t_tracker.animate.set_value(3.0), run_time=4.5, rate_func=linear)
        self.wait(0.8)

        self.play(
            FadeOut(VGroup(
                standing, envelope, wave_anim_lbl,
                node_marks_final, anti_marks_final, legend_group,
                axes, x_lbl, y_lbl,
            ))
        )

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        given_lbl = Text("已知驻波方程：", font=CJK, color=WHITE).scale(0.40)
        given_eq = MathTex(r"y=0.12\cos(\pi x)\cos(4\pi t)\;\mathrm{m}", color=YELLOW).scale(0.62)
        given = VGroup(given_lbl, given_eq).arrange(RIGHT, buff=0.12)

        node_sum_lbl = Text("波节：", font=CJK, color=GREEN).scale(0.40)
        node_sum_eq = MathTex(
            r"x=\left(n+\tfrac{1}{2}\right)\;\mathrm{m},\quad n=0,\pm1,\pm2,\ldots",
            color=GREEN
        ).scale(0.56)
        node_sum = VGroup(node_sum_lbl, node_sum_eq).arrange(RIGHT, buff=0.12)

        anti_sum_lbl = Text("波腹：", font=CJK, color=ORANGE).scale(0.40)
        anti_sum_eq = MathTex(
            r"x=n\;\mathrm{m},\quad n=0,\pm1,\pm2,\ldots;\quad A_{\max}=0.12\;\mathrm{m}",
            color=ORANGE
        ).scale(0.56)
        anti_sum = VGroup(anti_sum_lbl, anti_sum_eq).arrange(RIGHT, buff=0.12)

        spec_sum_lbl = Text("x=1.2 m 处振幅：", font=CJK, color=BLUE).scale(0.40)
        spec_sum_eq = MathTex(r"A\approx0.097\;\mathrm{m}", color=BLUE).scale(0.65)
        spec_sum = VGroup(spec_sum_lbl, spec_sum_eq).arrange(RIGHT, buff=0.12)

        summary = VGroup(given, node_sum, anti_sum, spec_sum).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)
        self.play(Write(given))
        self.wait(0.5)
        self.play(Write(node_sum))
        self.wait(0.5)
        self.play(Write(anti_sum))
        self.wait(0.5)
        self.play(Write(spec_sum))
        self.play(Create(box))
        self.wait(2.5)

        # ── 收尾 ───────────────────────────────────────────────────────
        self.play(FadeOut(VGroup(s_title, summary, box, title, eq_main)))
        self.wait(0.4)
