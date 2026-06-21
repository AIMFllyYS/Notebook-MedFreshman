"""第 12.4 节 · 波函数与概率密度的统计解释

三层叠加可视化：
1. 上层：平面波 Re[psi] = cos(kx - omega*t) 时间振荡
2. 中层：自由粒子 |psi|^2 均匀分布（常数）
3. 下层：高斯波包 psi = exp(-(x-x0)^2/(2 sigma^2)) * exp(ikx)
   ValueTracker 控制 sigma；归一化填色演示区间概率。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ---------- 辅助：高斯波包 |psi|^2 ----------
def gauss_pdf(x, x0, sigma):
    """归一化高斯概率密度 (1/(sigma*sqrt(2pi))) * exp(-(x-x0)^2/(2 sigma^2))"""
    return (1.0 / (sigma * math.sqrt(2 * math.pi))) * math.exp(
        -((x - x0) ** 2) / (2 * sigma ** 2)
    )


class Ch12Kp2WaveFunctionProbabilityDensity(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════
        title = Text("波函数与概率密度的统计解释", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP)
        subtitle = Text("第12章 量子力学初步 · 12.4", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════
        # Step 2: 生活类比（天气预报 → 概率）
        # ═══════════════════════════════════════════════════════════
        a1 = Text("天气预报说"明天降雨概率 70%"——", font=CJK).scale(0.48)
        a2 = Text("量子力学对粒子位置的描述也是概率性的：", font=CJK).scale(0.48)
        a3 = Text("波函数 ψ(x) 本身不是位置，", font=CJK, color=YELLOW).scale(0.48)
        a4 = Text("|ψ(x)|² 才是在 x 处找到粒子的概率密度。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(a1, a2, a3, a4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3), FadeIn(a4))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════
        # Step 3: 核心公式逐步出现
        # ═══════════════════════════════════════════════════════════
        def_title = Text("波恩统计解释", font=CJK, color=BLUE).scale(0.5)
        def_title.next_to(title, DOWN, buff=0.45)

        eq1 = MathTex(r"\rho(x)", r"=", r"|\psi(x)|^2").scale(0.88)
        eq1[0].set_color(ORANGE)
        eq1[2].set_color(YELLOW)

        lbl1_l = Text("概率密度", font=CJK, color=ORANGE).scale(0.38)
        lbl1_r = Text("波函数模的平方", font=CJK, color=YELLOW).scale(0.38)
        lbl1 = VGroup(lbl1_l, lbl1_r).arrange(RIGHT, buff=1.6)

        eq2 = MathTex(
            r"\int_{-\infty}^{+\infty}|\psi(x)|^2\,\mathrm{d}x", r"=", r"1"
        ).scale(0.88)
        eq2[0].set_color(CYAN)
        eq2[2].set_color(GREEN)

        lbl2 = Text("归一化条件：全空间找到粒子的总概率为 1", font=CJK, color=GREEN).scale(0.38)

        eq3 = MathTex(
            r"P(a<x<b)", r"=", r"\int_a^b |\psi(x)|^2\,\mathrm{d}x"
        ).scale(0.88)
        eq3[0].set_color(YELLOW)
        eq3[2].set_color(ORANGE)

        defs = VGroup(eq1, lbl1, eq2, lbl2, eq3).arrange(DOWN, buff=0.32)
        defs.next_to(def_title, DOWN, buff=0.38)
        defs.scale_to_fit_width(12.0)

        self.play(FadeIn(def_title))
        self.play(Write(eq1))
        self.play(FadeIn(lbl1))
        self.wait(1.0)
        self.play(Write(eq2))
        self.play(FadeIn(lbl2))
        self.wait(1.0)
        self.play(Write(eq3))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ═══════════════════════════════════════════════════════════
        # Step 4: 上层 — 平面波 Re[psi] = cos(kx - omega*t) 振荡
        # ═══════════════════════════════════════════════════════════
        sec_label = Text("自由粒子：平面波", font=CJK, color=BLUE).scale(0.48)
        sec_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec_label))

        # 坐标系（上方）
        ax_pw = Axes(
            x_range=[-4, 4, 1],
            y_range=[-1.5, 1.5, 1],
            x_length=10,
            y_length=2.0,
            axis_config={"color": BLUE, "include_tip": True, "tip_length": 0.18},
        )
        ax_pw.next_to(sec_label, DOWN, buff=0.3)
        xlbl_pw = MathTex(r"x").scale(0.55).next_to(ax_pw.x_axis.get_end(), RIGHT, buff=0.1)
        ylbl_pw = MathTex(r"\mathrm{Re}[\psi]").scale(0.55).next_to(
            ax_pw.y_axis.get_end(), UP, buff=0.08
        )

        k_pw, omega_pw, A_pw = 1.5, 2.0, 1.0
        t_pw = ValueTracker(0.0)
        pw_curve = always_redraw(
            lambda: ax_pw.plot(
                lambda x: A_pw * math.cos(k_pw * x - omega_pw * t_pw.get_value()),
                x_range=[-4, 4],
                color=YELLOW,
                stroke_width=2.5,
            )
        )
        pw_label = MathTex(r"\mathrm{Re}[\psi]=\cos(kx-\omega t)", color=YELLOW).scale(0.55)
        pw_label.to_corner(DL, buff=0.3)

        self.play(Create(ax_pw), FadeIn(xlbl_pw), FadeIn(ylbl_pw))
        self.play(Create(pw_curve), FadeIn(pw_label))
        self.play(
            t_pw.animate.set_value(2 * math.pi / omega_pw * 2.5),
            run_time=4,
            rate_func=linear,
        )
        self.wait(0.5)

        # 中层注解：|psi|^2 均匀
        uniform_note_zh = Text("自由粒子：", font=CJK, color=CYAN).scale(0.42)
        uniform_note_eq = MathTex(r"|\psi|^2 = \text{const}", color=CYAN).scale(0.55)
        uniform_note = VGroup(uniform_note_zh, uniform_note_eq).arrange(RIGHT, buff=0.15)
        uniform_note2 = Text("在全空间等概率分布", font=CJK, color=CYAN).scale(0.42)
        un_grp = VGroup(uniform_note, uniform_note2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        un_grp.to_edge(RIGHT, buff=0.4).shift(DOWN * 0.3)
        self.play(FadeIn(un_grp))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ax_pw, xlbl_pw, ylbl_pw, pw_curve, pw_label, un_grp, sec_label)))

        # ═══════════════════════════════════════════════════════════
        # Step 5: 下层 — 高斯波包 + |psi|^2 峰值展示
        # ═══════════════════════════════════════════════════════════
        sec2 = Text("高斯波包：位置集中 → |ψ|² 有峰", font=CJK, color=BLUE).scale(0.48)
        sec2.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec2))

        ax_wp = Axes(
            x_range=[-5, 5, 1],
            y_range=[-0.05, 1.1, 0.5],
            x_length=10,
            y_length=3.0,
            axis_config={"color": BLUE, "include_tip": True, "tip_length": 0.18},
        )
        ax_wp.next_to(sec2, DOWN, buff=0.35)
        xlbl_wp = MathTex(r"x").scale(0.55).next_to(ax_wp.x_axis.get_end(), RIGHT, buff=0.1)
        ylbl_wp = MathTex(r"|\psi|^2").scale(0.55).next_to(ax_wp.y_axis.get_end(), UP, buff=0.08)

        sigma_vt = ValueTracker(1.2)
        x0_wp = 0.0

        pdf_curve = always_redraw(
            lambda: ax_wp.plot(
                lambda x: gauss_pdf(x, x0_wp, sigma_vt.get_value()),
                x_range=[-5, 5],
                color=ORANGE,
                stroke_width=2.5,
            )
        )

        # sigma 动态标注
        sigma_label_prefix = Text("σ =", font=CJK, color=GREEN).scale(0.46)
        sigma_label_val = always_redraw(
            lambda: MathTex(
                f"{sigma_vt.get_value():.2f}", color=GREEN
            ).scale(0.55).next_to(sigma_label_prefix, RIGHT, buff=0.12)
        )
        sigma_row = VGroup(sigma_label_prefix).to_corner(DR, buff=0.55)
        sigma_label_val.clear_updaters()
        sigma_label_val = always_redraw(
            lambda: MathTex(f"{sigma_vt.get_value():.2f}", color=GREEN)
            .scale(0.55)
            .next_to(sigma_label_prefix, RIGHT, buff=0.12)
        )

        self.play(Create(ax_wp), FadeIn(xlbl_wp), FadeIn(ylbl_wp))
        self.play(Create(pdf_curve))
        self.add(sigma_label_prefix, sigma_label_val)
        self.wait(1.0)

        # σ 缩小 → 峰更尖
        narrow_note = Text("σ 缩小：位置更确定，峰更集中", font=CJK, color=YELLOW).scale(0.42)
        narrow_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(narrow_note))
        self.play(sigma_vt.animate.set_value(0.45), run_time=3, rate_func=smooth)
        self.wait(0.8)

        # σ 变大 → 峰展宽
        wide_note = Text("σ 增大：位置分散，峰展宽", font=CJK, color=CYAN).scale(0.42)
        wide_note.to_edge(DOWN, buff=0.45)
        self.play(FadeOut(narrow_note), FadeIn(wide_note))
        self.play(sigma_vt.animate.set_value(2.0), run_time=3, rate_func=smooth)
        self.wait(0.8)
        self.play(FadeOut(wide_note))

        # 恢复到 sigma=1.0 用于后续演示
        self.play(sigma_vt.animate.set_value(1.0), run_time=1.5, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(sigma_label_prefix), FadeOut(sigma_label_val))

        # ═══════════════════════════════════════════════════════════
        # Step 6: 不确定关系提示
        # ═══════════════════════════════════════════════════════════
        hup_zh = Text("不确定性关系：", font=CJK, color=YELLOW).scale(0.48)
        hup_eq = MathTex(r"\Delta x \cdot \Delta p \geq \frac{\hbar}{2}", color=YELLOW).scale(0.72)
        hup_row = VGroup(hup_zh, hup_eq).arrange(RIGHT, buff=0.2)
        hup_row.to_edge(DOWN, buff=0.55)
        hup_note = Text("σ 越小 → Δx 越小 → Δp 越大（动量越不确定）", font=CJK, color=ORANGE).scale(0.40)
        hup_note.next_to(hup_row, UP, buff=0.18)
        self.play(FadeIn(hup_note), Write(hup_row))
        self.wait(1.8)
        self.play(FadeOut(hup_note), FadeOut(hup_row))

        # ═══════════════════════════════════════════════════════════
        # Step 7: 填色显示区间概率 P(a < x < b)
        # ═══════════════════════════════════════════════════════════
        area_title = Text("区间概率 = 面积", font=CJK, color=BLUE).scale(0.46)
        area_title.to_edge(DOWN, buff=0.8)
        self.play(FadeIn(area_title))

        # 固定区间 [-1, 1]
        a_val, b_val = -1.0, 1.0
        sigma_now = sigma_vt.get_value()  # 1.0

        # 计算该区间下的概率（数值积分）
        n_pts = 400
        xs_area = [a_val + (b_val - a_val) * i / n_pts for i in range(n_pts + 1)]
        prob_val = sum(
            gauss_pdf(xs_area[i], x0_wp, sigma_now) * (b_val - a_val) / n_pts
            for i in range(n_pts + 1)
        )

        filled_area = ax_wp.get_area(
            ax_wp.plot(
                lambda x: gauss_pdf(x, x0_wp, sigma_now),
                x_range=[a_val, b_val],
                color=YELLOW,
            ),
            x_range=[a_val, b_val],
            color=YELLOW,
            opacity=0.45,
        )

        # 区间标注
        a_line = DashedLine(
            ax_wp.c2p(a_val, 0), ax_wp.c2p(a_val, gauss_pdf(a_val, x0_wp, sigma_now) + 0.06),
            color=CYAN, stroke_width=2
        )
        b_line = DashedLine(
            ax_wp.c2p(b_val, 0), ax_wp.c2p(b_val, gauss_pdf(b_val, x0_wp, sigma_now) + 0.06),
            color=CYAN, stroke_width=2
        )
        a_lbl = MathTex(r"a{=}{-}1").scale(0.48).next_to(ax_wp.c2p(a_val, 0), DOWN, buff=0.15)
        b_lbl = MathTex(r"b{=}1").scale(0.48).next_to(ax_wp.c2p(b_val, 0), DOWN, buff=0.15)

        prob_label_prefix = Text("P(-1<x<1)=", font=CJK, color=YELLOW).scale(0.44)
        prob_label_val = MathTex(f"{prob_val:.3f}", color=YELLOW).scale(0.64)
        prob_row = VGroup(prob_label_prefix, prob_label_val).arrange(RIGHT, buff=0.1)
        prob_row.next_to(area_title, UP, buff=0.2)

        self.play(Create(a_line), Create(b_line), FadeIn(a_lbl), FadeIn(b_lbl))
        self.play(FadeIn(filled_area))
        self.play(FadeIn(prob_row))
        self.wait(2.0)

        # ═══════════════════════════════════════════════════════════
        # Step 8: 动态积分 — 区间宽度从 0 扩展到全域
        # ═══════════════════════════════════════════════════════════
        half_w = ValueTracker(0.05)

        dynamic_area = always_redraw(
            lambda: ax_wp.get_area(
                ax_wp.plot(
                    lambda x: gauss_pdf(x, x0_wp, sigma_vt.get_value()),
                    x_range=[-half_w.get_value(), half_w.get_value()],
                    color=GREEN,
                ),
                x_range=[-half_w.get_value(), half_w.get_value()],
                color=GREEN,
                opacity=0.5,
            )
        )

        # 先清掉旧的黄色区间填色
        self.play(FadeOut(filled_area), FadeOut(a_line), FadeOut(b_line),
                  FadeOut(a_lbl), FadeOut(b_lbl), FadeOut(prob_row))
        self.play(FadeOut(area_title))

        grow_note = Text("绿色面积 = 在该区间找到粒子的概率，区间扩大 → 概率趋近 1", font=CJK, color=GREEN).scale(0.38)
        grow_note.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(dynamic_area), FadeIn(grow_note))
        self.play(half_w.animate.set_value(4.8), run_time=4, rate_func=smooth)
        self.wait(1.0)

        # 动态显示归一化条件到达
        norm_eq = MathTex(
            r"\int_{-\infty}^{+\infty}|\psi|^2\,\mathrm{d}x = 1",
            color=GREEN,
        ).scale(0.78)
        norm_eq.next_to(grow_note, UP, buff=0.25)
        self.play(Write(norm_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(dynamic_area, grow_note, norm_eq)))

        # ═══════════════════════════════════════════════════════════
        # Step 9: 清场 + 归一化条件单独推导步骤
        # ═══════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(ax_wp, xlbl_wp, ylbl_wp, pdf_curve, sec2)))

        norm_title = Text("为什么必须归一化？", font=CJK, color=BLUE).scale(0.52)
        norm_title.next_to(title, DOWN, buff=0.5)

        step_a_zh = Text("粒子必然存在于宇宙某处，总概率 = 1", font=CJK).scale(0.46)
        step_a_eq = MathTex(
            r"\int_{-\infty}^{+\infty} \rho(x)\,\mathrm{d}x = 1", color=CYAN
        ).scale(0.78)
        step_a = VGroup(step_a_zh, step_a_eq).arrange(DOWN, buff=0.25)

        step_b_zh = Text("代入", font=CJK).scale(0.46)
        step_b_eq = MathTex(r"\rho(x)=|\psi(x)|^2", color=YELLOW).scale(0.78)
        step_b = VGroup(step_b_zh, step_b_eq).arrange(RIGHT, buff=0.2)

        step_c_eq = MathTex(
            r"\Rightarrow\quad\int_{-\infty}^{+\infty}|\psi(x)|^2\,\mathrm{d}x = 1",
            color=GREEN,
        ).scale(0.78)

        chain = VGroup(step_a, step_b, step_c_eq).arrange(DOWN, buff=0.42)
        chain.next_to(norm_title, DOWN, buff=0.4)
        chain.scale_to_fit_width(12.0)

        self.play(FadeIn(norm_title))
        self.play(Write(step_a_zh), Write(step_a_eq))
        self.wait(1.0)
        self.play(FadeIn(step_b_zh), Write(step_b_eq))
        self.wait(0.8)
        self.play(Write(step_c_eq))
        self.wait(1.8)
        self.play(FadeOut(VGroup(norm_title, chain)))

        # ═══════════════════════════════════════════════════════════
        # Step 10: 对比：经典轨迹 vs 量子概率云
        # ═══════════════════════════════════════════════════════════
        cmp_title = Text("经典粒子 vs 量子粒子", font=CJK, color=BLUE).scale(0.52)
        cmp_title.next_to(title, DOWN, buff=0.45)

        classical_zh = Text("经典粒子：", font=CJK, color=ORANGE).scale(0.46)
        classical_desc = Text("位置 x(t) 精确确定，轨迹清晰", font=CJK).scale(0.46)
        classical = VGroup(classical_zh, classical_desc).arrange(RIGHT, buff=0.12)

        quantum_zh = Text("量子粒子：", font=CJK, color=YELLOW).scale(0.46)
        quantum_desc = Text("位置服从概率分布 |ψ(x)|²，测量前无确定位置", font=CJK).scale(0.46)
        quantum = VGroup(quantum_zh, quantum_desc).arrange(RIGHT, buff=0.12)

        sep_line = Line(LEFT * 5.5, RIGHT * 5.5, color=BLUE_D, stroke_width=1.5)

        # 经典点轨迹
        traj_ax = Axes(
            x_range=[0, 5, 1], y_range=[-0.5, 0.5, 1],
            x_length=4.5, y_length=0.9,
            axis_config={"color": GRAY, "include_tip": False},
        )
        traj_dot_t = ValueTracker(0.0)
        traj_dot = always_redraw(
            lambda: Dot(
                traj_ax.c2p(traj_dot_t.get_value(), 0),
                color=ORANGE, radius=0.12
            )
        )
        traj_label = Text("精确位置", font=CJK, color=ORANGE).scale(0.36)

        # 量子波包（右侧）
        q_ax = Axes(
            x_range=[-3, 3, 1], y_range=[-0.05, 0.55, 0.5],
            x_length=4.5, y_length=1.4,
            axis_config={"color": GRAY, "include_tip": False},
        )
        q_curve = q_ax.plot(
            lambda x: gauss_pdf(x, 0.0, 1.0),
            x_range=[-3, 3],
            color=YELLOW,
            stroke_width=2.5,
        )
        q_area = q_ax.get_area(q_curve, x_range=[-3, 3], color=YELLOW, opacity=0.3)
        q_label = Text("概率密度云", font=CJK, color=YELLOW).scale(0.36)

        # 布局
        traj_grp = VGroup(traj_ax, traj_dot, traj_label)
        q_grp = VGroup(q_ax, q_curve, q_area, q_label)
        traj_label.next_to(traj_ax, DOWN, buff=0.15)
        q_label.next_to(q_ax, DOWN, buff=0.15)

        cmp_pair = VGroup(traj_grp, q_grp).arrange(RIGHT, buff=1.0)
        cmp_pair.next_to(cmp_title, DOWN, buff=0.4)

        classical.next_to(cmp_pair, DOWN, buff=0.35)
        classical.scale_to_fit_width(6.0)
        quantum.next_to(classical, DOWN, buff=0.2)
        quantum.scale_to_fit_width(12.0)

        self.play(FadeIn(cmp_title))
        self.play(Create(traj_ax), Create(q_ax))
        self.add(traj_dot)
        self.play(
            traj_dot_t.animate.set_value(5.0),
            FadeIn(q_curve), FadeIn(q_area),
            run_time=2.5, rate_func=linear,
        )
        self.play(FadeIn(traj_label), FadeIn(q_label))
        self.play(FadeIn(classical))
        self.play(FadeIn(quantum))
        self.wait(2.0)
        self.play(FadeOut(VGroup(cmp_title, traj_ax, q_ax, q_curve, q_area,
                                 traj_label, q_label, classical, quantum)))

        # ═══════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ═══════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)

        s1_zh = Text("概率密度：", font=CJK, color=ORANGE).scale(0.44)
        s1_eq = MathTex(r"\rho(x)=|\psi(x)|^2", color=YELLOW).scale(0.78)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.2)

        s2_zh = Text("归一化：", font=CJK, color=CYAN).scale(0.44)
        s2_eq = MathTex(
            r"\int_{-\infty}^{+\infty}|\psi|^2\,\mathrm{d}x=1", color=CYAN
        ).scale(0.78)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.2)

        s3_zh = Text("区间概率：", font=CJK, color=GREEN).scale(0.44)
        s3_eq = MathTex(
            r"P(a<x<b)=\int_a^b|\psi|^2\,\mathrm{d}x", color=GREEN
        ).scale(0.78)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.2)

        s4 = Text("波函数本身无直接物理意义，|ψ|² 才是概率密度——波恩统计解释",
                  font=CJK, color=WHITE).scale(0.40)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_eq), FadeIn(s1_zh))
        self.wait(0.5)
        self.play(Write(s2_eq), FadeIn(s2_zh))
        self.wait(0.5)
        self.play(Write(s3_eq), FadeIn(s3_zh))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp2WaveFunctionProbabilityDensity",
        "id": "phys-ch12-12.4-kp2-wave-function-probability-density",
        "chapterId": "ch12",
        "sectionId": "12.4",
        "title": "波函数与概率密度的统计解释",
        "description": "通过平面波振荡、高斯波包收缩/扩展与颜色填充面积，直观展示 |ψ|² 作为概率密度的统计诠释，及归一化条件与区间概率的动态积分。",
    }
]
