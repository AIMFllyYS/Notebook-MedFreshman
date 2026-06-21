"""第 9.4 节 · 平面电磁波的特性与传播（知识点 KP2）。

可视化方案：
  Step1 — 标题 + 生活类比（光/WiFi/X射线都是电磁波）
  Step2 — E⊥B⊥k 的定性展示：在伪 3D 坐标系用 2D 箭头演示三个方向互相垂直
  Step3 — 同相位驱动：ValueTracker 控制 E(t) 和 B(t) 的振幅，演示两者同步达到最大/零点
  Step4 — 完整 E(x) 和 B(x) 波形用 Axes.plot 画出，用 ValueTracker 让波形向右传播
  Step5 — 在图上标注 λ、E_max、B_max，以及振幅比 E/B = c
  Step6 — 关键公式逐步推导（c = 1/sqrt(μ₀ε₀)、E/B=c、c=λf）
  Step7 — 电磁波谱：从无线电到 γ 射线的频率/波长范围，可见光彩虹色块
  Step8 — 小结卡（所有关键公式汇总 + 方框）

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 电磁波谱颜色（可见光段）
VIOLET = "#8B00FF"
INDIGO = "#4B0082"
BLUE_VIS = "#0000FF"
GREEN_VIS = "#00FF00"
YELLOW_VIS = "#FFFF00"
ORANGE_VIS = "#FF7F00"
RED_VIS = "#FF0000"


class Ch09Kp2ElectromagneticWavePropagation(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("平面电磁波的特性与传播", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.4", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("手机 WiFi、医院 X 光、遥控器红外线、广播电台——", font=CJK).scale(0.48)
        ana2 = Text("它们本质上都是「电磁波」：相互激励的电场和磁场向前传播。", font=CJK).scale(0.48)
        ana3 = Text("光也是电磁波，真空中速度 c ≈ 3×10⁸ m/s。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: E⊥B⊥k 三维方向示意（伪3D，2D坐标系） ───────────────
        # 用三个方向的箭头在斜坐标系中示意
        sec3_title = Text("三个方向互相垂直", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec3_title))

        # 伪3D原点
        origin = np.array([0.0, -0.5, 0.0])

        # k 方向：水平向右（传播方向）
        arr_k = Arrow(origin, origin + np.array([2.8, 0, 0]), color=GREEN, buff=0, stroke_width=5)
        lbl_k = MathTex(r"\mathbf{k}\ (\text{传播方向})", color=GREEN).scale(0.52)
        lbl_k.next_to(arr_k.get_end(), RIGHT, buff=0.15)

        # E 方向：竖直向上（沿 y 轴）
        arr_E = Arrow(origin, origin + np.array([0, 2.2, 0]), color=RED, buff=0, stroke_width=5)
        lbl_E = MathTex(r"\mathbf{E}", color=RED).scale(0.7)
        lbl_E.next_to(arr_E.get_end(), UP, buff=0.12)

        # B 方向：斜向左下（模拟 z 轴"射出"纸面）
        arr_B = Arrow(origin, origin + np.array([-1.6, -1.2, 0]), color=BLUE, buff=0, stroke_width=5)
        lbl_B = MathTex(r"\mathbf{B}", color=BLUE).scale(0.7)
        lbl_B.next_to(arr_B.get_end(), LEFT, buff=0.12)

        # 直角标记
        perp_lbl = VGroup(
            Text("E ", font=CJK, color=RED).scale(0.45),
            MathTex(r"\perp", color=WHITE).scale(0.6),
            Text(" B ", font=CJK, color=BLUE).scale(0.45),
            MathTex(r"\perp", color=WHITE).scale(0.6),
            Text(" k", font=CJK, color=GREEN).scale(0.45),
        ).arrange(RIGHT, buff=0.08)
        perp_lbl.next_to(sec3_title, DOWN, buff=0.25)

        self.play(Create(arr_k), FadeIn(lbl_k))
        self.wait(0.4)
        self.play(Create(arr_E), FadeIn(lbl_E))
        self.wait(0.4)
        self.play(Create(arr_B), FadeIn(lbl_B))
        self.wait(0.6)
        self.play(FadeIn(perp_lbl))
        self.wait(1.5)

        perp_eq = MathTex(r"\mathbf{E}\perp\mathbf{B}\perp\mathbf{k}").scale(0.85)
        perp_eq.next_to(perp_lbl, DOWN, buff=0.3)
        self.play(Write(perp_eq))
        self.wait(1.2)
        self.play(FadeOut(VGroup(arr_k, lbl_k, arr_E, lbl_E, arr_B, lbl_B, perp_lbl, perp_eq, sec3_title)))

        # ── Step 4: 同相位演示：E(t) 和 B(t) 随时间同步振荡 ────────────
        sec4_title = Text("E 与 B 同相位：同时达到最大值和零点", font=CJK, color=BLUE).scale(0.48)
        sec4_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec4_title))

        # 两个小坐标轴，分别展示 E(t) 和 B(t)
        ax_E = Axes(
            x_range=[0, 2 * math.pi, math.pi / 2],
            y_range=[-1.4, 1.4, 1],
            x_length=6.5,
            y_length=1.8,
            axis_config={"color": GREY, "include_tip": False},
        ).shift(LEFT * 3 + DOWN * 0.5)
        ax_B = Axes(
            x_range=[0, 2 * math.pi, math.pi / 2],
            y_range=[-1.4, 1.4, 1],
            x_length=6.5,
            y_length=1.8,
            axis_config={"color": GREY, "include_tip": False},
        ).shift(RIGHT * 3 + DOWN * 0.5)

        lbl_E_ax = VGroup(
            Text("E(t)", font=CJK, color=RED).scale(0.45),
        ).next_to(ax_E, UP, buff=0.12)
        lbl_B_ax = VGroup(
            Text("B(t)", font=CJK, color=BLUE).scale(0.45),
        ).next_to(ax_B, UP, buff=0.12)

        self.play(Create(ax_E), Create(ax_B), FadeIn(lbl_E_ax), FadeIn(lbl_B_ax))

        phase = ValueTracker(0.0)
        wave_E_curve = always_redraw(
            lambda: ax_E.plot(
                lambda x: math.cos(x - phase.get_value()),
                x_range=[0, 2 * math.pi],
                color=RED,
                stroke_width=3,
            )
        )
        wave_B_curve = always_redraw(
            lambda: ax_B.plot(
                lambda x: math.cos(x - phase.get_value()),
                x_range=[0, 2 * math.pi],
                color=BLUE,
                stroke_width=3,
            )
        )
        self.play(Create(wave_E_curve), Create(wave_B_curve))
        sync_note = Text("同相位：E 和 B 步调一致", font=CJK, color=YELLOW).scale(0.44)
        sync_note.to_edge(DOWN, buff=0.6)
        self.play(FadeIn(sync_note))
        self.wait(0.4)
        self.play(phase.animate.set_value(2 * math.pi), run_time=3, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(VGroup(ax_E, ax_B, lbl_E_ax, lbl_B_ax, wave_E_curve, wave_B_curve, sync_note, sec4_title)))

        # ── Step 5: 完整波形 E(x) 和 B(x) + 波形向右传播 ────────────────
        sec5_title = Text("电磁波沿 x 方向以速度 c 传播", font=CJK, color=BLUE).scale(0.5)
        sec5_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec5_title))

        # 主坐标系（x 轴为传播方向，纵轴同时展示 E 和 B，区分颜色）
        axes = Axes(
            x_range=[0, 4 * math.pi, math.pi],
            y_range=[-1.6, 1.6, 1],
            x_length=11,
            y_length=3.2,
            axis_config={"color": GREY_B, "include_tip": True},
        ).shift(DOWN * 0.9)
        x_lbl = MathTex(r"x\ \text{(m)}").scale(0.52).next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)
        axes_lbl = VGroup(
            Text("红：E(x)", font=CJK, color=RED).scale(0.38),
            Text("蓝：B(x)", font=CJK, color=BLUE).scale(0.38),
        ).arrange(RIGHT, buff=0.5).next_to(axes, UP, buff=0.1)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(axes_lbl))

        A_E = 1.0
        A_B = 1.0
        k_wave = 1.0
        t_track = ValueTracker(0.0)

        wave_E = always_redraw(
            lambda: axes.plot(
                lambda x: A_E * math.cos(k_wave * x - t_track.get_value()),
                x_range=[0, 4 * math.pi],
                color=RED,
                stroke_width=3,
            )
        )
        wave_B = always_redraw(
            lambda: axes.plot(
                lambda x: A_B * math.cos(k_wave * x - t_track.get_value()),
                x_range=[0, 4 * math.pi],
                color=BLUE,
                stroke_width=2.5,
            )
        )
        self.play(Create(wave_E), Create(wave_B))
        self.wait(0.5)

        # 波长标注 λ
        x_start_lam = axes.c2p(0, 0)
        x_end_lam = axes.c2p(2 * math.pi, 0)
        lam_line = DashedLine(
            axes.c2p(0, -1.7), axes.c2p(2 * math.pi, -1.7), color=CYAN, stroke_width=2
        )
        lam_arrow = DoubleArrow(
            axes.c2p(0, -1.7), axes.c2p(2 * math.pi, -1.7),
            color=CYAN, buff=0, stroke_width=2, tip_length=0.18
        )
        lam_lbl = MathTex(r"\lambda", color=CYAN).scale(0.65)
        lam_lbl.next_to(lam_arrow, DOWN, buff=0.1)

        # E_max 和 B_max 标注
        Emax_dot = Dot(axes.c2p(0, 1.0), color=RED, radius=0.08)
        Emax_lbl = MathTex(r"E_{\max}", color=RED).scale(0.55)
        Emax_lbl.next_to(Emax_dot, LEFT, buff=0.12)

        Bmax_dot = Dot(axes.c2p(0, 1.0), color=BLUE, radius=0.06)
        Bmax_lbl = MathTex(r"B_{\max}", color=BLUE).scale(0.55)
        Bmax_lbl.next_to(Bmax_dot, LEFT + UP * 0.5, buff=0.1)

        self.play(Create(lam_arrow), FadeIn(lam_lbl))
        self.wait(0.5)
        self.play(FadeIn(Emax_dot), FadeIn(Emax_lbl))
        self.wait(0.4)

        # 振幅比公式
        ratio_lbl = VGroup(
            MathTex(r"\frac{E_{\max}}{B_{\max}}", color=YELLOW).scale(0.7),
            MathTex(r"=", color=WHITE).scale(0.7),
            MathTex(r"c", color=GREEN).scale(0.7),
        ).arrange(RIGHT, buff=0.12)
        ratio_lbl.to_edge(RIGHT, buff=0.5).shift(UP * 0.8)
        self.play(Write(ratio_lbl))
        self.wait(0.6)

        # 波形向右传播
        move_caption = Text("波形以速度 c 向右传播", font=CJK, color=GREEN).scale(0.44)
        move_caption.to_edge(DOWN, buff=0.35)
        self.play(FadeIn(move_caption))
        self.play(t_track.animate.set_value(4 * math.pi), run_time=5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(VGroup(
            axes, x_lbl, axes_lbl, wave_E, wave_B,
            lam_arrow, lam_lbl, Emax_dot, Emax_lbl, ratio_lbl,
            move_caption, sec5_title
        )))

        # ── Step 6: 关键公式推导 ─────────────────────────────────────────
        sec6_title = Text("关键公式推导", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec6_title))

        # 公式 1：真空光速
        f1_zh = Text("真空中电磁波速度（麦克斯韦推导）：", font=CJK).scale(0.44)
        f1_zh.next_to(sec6_title, DOWN, buff=0.4)
        f1 = MathTex(
            r"c", r"=", r"\frac{1}{\sqrt{\mu_0\varepsilon_0}}",
            r"\approx 3\times10^8\,\mathrm{m/s}"
        ).scale(0.85)
        f1[0].set_color(GREEN)
        f1[2].set_color(YELLOW)
        f1[3].set_color(CYAN)
        f1.next_to(f1_zh, DOWN, buff=0.3)
        self.play(FadeIn(f1_zh))
        self.play(Write(f1[0]), Write(f1[1]))
        self.wait(0.4)
        self.play(Write(f1[2]))
        self.wait(0.5)
        self.play(Write(f1[3]))
        self.wait(1.2)

        # 公式 2：振幅比
        f2_zh = Text("电场与磁场振幅之比等于光速：", font=CJK).scale(0.44)
        f2_zh.next_to(f1, DOWN, buff=0.35)
        f2 = MathTex(r"\frac{E}{B}", r"=", r"c").scale(0.85)
        f2[0].set_color(YELLOW)
        f2[2].set_color(GREEN)
        f2.next_to(f2_zh, DOWN, buff=0.28)
        self.play(FadeIn(f2_zh))
        self.play(Write(f2))
        self.wait(1.0)

        # 公式 3：色散关系
        f3_zh = Text("频率、波长与速度的关系：", font=CJK).scale(0.44)
        f3_zh.next_to(f2, DOWN, buff=0.35)
        f3 = MathTex(r"c", r"=", r"\lambda f").scale(0.85)
        f3[0].set_color(GREEN)
        f3[2].set_color(ORANGE)
        f3.next_to(f3_zh, DOWN, buff=0.28)
        self.play(FadeIn(f3_zh))
        self.play(Write(f3))
        self.wait(1.5)

        self.play(FadeOut(VGroup(sec6_title, f1_zh, f1, f2_zh, f2, f3_zh, f3)))

        # ── Step 7: 电磁波谱 ─────────────────────────────────────────────
        sec7_title = Text("电磁波谱：从无线电到 γ 射线", font=CJK, color=BLUE).scale(0.5)
        sec7_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sec7_title))

        # 波谱数据：[名称, 颜色, 相对宽度]
        spectrum_data = [
            ("无线电波", "#555599", 1.6),
            ("微波", "#7777CC", 1.0),
            ("红外线", "#CC4400", 1.0),
            ("可见光", None, 0.7),   # 特殊：彩虹渐变
            ("紫外线", "#9900CC", 1.0),
            ("X 射线", "#00CCCC", 1.0),
            ("γ 射线", "#00FF44", 1.2),
        ]
        # 可见光子段
        vis_colors = [RED_VIS, ORANGE_VIS, YELLOW_VIS, GREEN_VIS, BLUE_VIS, INDIGO, VIOLET]

        total_w = 12.0
        # 计算各段宽度
        widths = [d[2] for d in spectrum_data]
        total_raw = sum(widths)
        heights = 1.0

        x_start = -total_w / 2
        bar_y = -0.3
        spec_group = VGroup()

        # 频率标签（顶部）
        freq_labels_data = [
            (r"10^{4}", -total_w / 2),
            (r"10^{8}", -total_w / 2 + total_w * 2.6 / total_raw),
            (r"10^{12}", -total_w / 2 + total_w * 3.6 / total_raw),
            (r"4\times10^{14}", -total_w / 2 + total_w * 4.3 / total_raw),
            (r"10^{17}", -total_w / 2 + total_w * 5.0 / total_raw),
            (r"10^{19}", -total_w / 2 + total_w * 6.0 / total_raw),
            (r"10^{22}", total_w / 2),
        ]

        x_cur = x_start
        label_objs = VGroup()
        for i, (name, color, w_raw) in enumerate(spectrum_data):
            w = w_raw / total_raw * total_w
            rect_x = x_cur + w / 2
            if name == "可见光":
                # 彩虹子块
                vis_group = VGroup()
                n_vis = len(vis_colors)
                sub_w = w / n_vis
                for j, vc in enumerate(vis_colors):
                    sub_rect = Rectangle(
                        width=sub_w, height=heights,
                        fill_color=vc, fill_opacity=0.85,
                        stroke_width=0
                    ).move_to([x_cur + (j + 0.5) * sub_w, bar_y, 0])
                    vis_group.add(sub_rect)
                spec_group.add(vis_group)
            else:
                rect = Rectangle(
                    width=w, height=heights,
                    fill_color=color, fill_opacity=0.8,
                    stroke_color=WHITE, stroke_width=0.8
                ).move_to([rect_x, bar_y, 0])
                spec_group.add(rect)

            # 名称标签（下方）
            name_lbl = Text(name, font=CJK, color=WHITE).scale(0.30)
            name_lbl.move_to([rect_x, bar_y - heights / 2 - 0.45, 0])
            label_objs.add(name_lbl)
            x_cur += w

        # 频率轴标签
        freq_axis_lbl = VGroup(
            Text("频率 (Hz)", font=CJK, color=GREY_B).scale(0.36),
            MathTex(r"\longrightarrow", color=GREY_B).scale(0.6),
        ).arrange(RIGHT, buff=0.15).move_to([0, bar_y + heights / 2 + 0.5, 0])

        wavelength_note = Text("← 波长从 km 减小到 fm →", font=CJK, color=GREY_A).scale(0.35)
        wavelength_note.move_to([0, bar_y - heights / 2 - 1.05, 0])

        # 可见光标注
        vis_marker = VGroup(
            Text("可见光", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"380\text{-}780\,\mathrm{nm}", color=YELLOW).scale(0.5),
        ).arrange(DOWN, buff=0.1)
        vis_x = x_start + sum(
            w / total_raw * total_w for _, _, w in spectrum_data[:3]
        ) + (spectrum_data[3][2] / total_raw * total_w) / 2
        vis_marker.move_to([vis_x, bar_y + heights / 2 + 0.85, 0])

        self.play(FadeIn(spec_group), FadeIn(label_objs))
        self.wait(0.5)
        self.play(FadeIn(freq_axis_lbl), FadeIn(wavelength_note))
        self.wait(0.5)
        self.play(FadeIn(vis_marker))
        self.wait(2.0)
        self.play(FadeOut(VGroup(spec_group, label_objs, freq_axis_lbl, wavelength_note, vis_marker, sec7_title)))

        # ── Step 8: 小结卡 ────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("①  E⊥B⊥k  三者两两垂直，横波", font=CJK, color=WHITE).scale(0.45),
        )
        s2 = MathTex(
            r"c=\frac{1}{\sqrt{\mu_0\varepsilon_0}}\approx 3\times10^8\,\mathrm{m/s}",
            color=YELLOW
        ).scale(0.78)
        s3 = MathTex(r"\frac{E}{B}=c,\quad c=\lambda f", color=YELLOW).scale(0.78)
        s4 = VGroup(
            Text("④  E 与 B 同相位，在同一位置同时达到最大值", font=CJK, color=WHITE).scale(0.44),
        )
        s5 = VGroup(
            Text("⑤  电磁波谱：无线电 → 微波 → 红外 → 可见光 → 紫外 → X → γ", font=CJK, color=GREEN).scale(0.42),
        )
        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(FadeIn(s5))
        self.wait(0.4)
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp2ElectromagneticWavePropagation",
        "id": "phys-ch09-9.4-kp2-electromagnetic-wave-propagation",
        "chapterId": "ch09",
        "sectionId": "9.4",
        "title": "平面电磁波的特性与传播",
        "description": "用 ValueTracker 演示 E⊥B⊥k 互相垂直、同相位传播；Axes 画出完整 E(x)/B(x) 波形向右传播；推导 c=1/√(μ₀ε₀)、E/B=c；彩虹色块展示电磁波谱从无线电到 γ 射线。",
    }
]
