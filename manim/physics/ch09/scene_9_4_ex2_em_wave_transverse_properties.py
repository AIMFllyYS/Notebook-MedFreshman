"""第 9.4 节 · 例题2 平面电磁波性质综合辨析
（横波性 / 同相位 / 振幅比 / 光速推导 / 电磁波谱）

五格动画布局逐格演示电磁波的五条核心性质：
格①横波性（E×B 右手系）、格②同相位（波峰对齐）、
格③振幅比（E/B=c，能量密度相等）、格④真空光速推导、
格⑤电磁波谱（频率轴+七色可见光）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 电磁波谱各波段 (名称, 频率下界 Hz, 频率上界 Hz, 颜色) ─────────────────
SPECTRUM_BANDS = [
    ("无线电波", 3e3, 3e11, "#888888"),
    ("微波", 3e9, 3e11, "#AAAAAA"),
    ("红外线", 3e11, 4e14, "#FF6600"),
    ("可见光", 4e14, 7.5e14, None),   # 特殊处理（彩虹）
    ("紫外线", 7.5e14, 3e17, "#CC00FF"),
    ("X 射线", 3e17, 3e19, "#00CCFF"),
    ("伽马射线", 3e19, 3e23, "#FF3333"),
]

# 可见光七色（频率由低到高：红→紫）
RAINBOW_COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, "#4B0082", PURPLE]


class Ch09Ex2EmWaveTransverseProperties(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1 : 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("平面电磁波性质综合辨析", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.4 例题2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2 : 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        a1 = Text("光、无线电波、X 射线……都是电磁波。", font=CJK).scale(0.5)
        a2 = Text("它们共享五条核心性质：横波性、同相位、振幅比、光速、电磁波谱。",
                  font=CJK).scale(0.5)
        a3 = Text("接下来逐一拆解，让你彻底看清电磁波的真面目。",
                  font=CJK, color=YELLOW).scale(0.5)
        ana = VGroup(a1, a2, a3).arrange(DOWN, buff=0.30).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(a1))
        self.wait(0.7)
        self.play(FadeIn(a2))
        self.wait(0.7)
        self.play(FadeIn(a3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3 : 格① 横波性 —— E、B、k 三轴右手系
        # ══════════════════════════════════════════════════════════════════
        tag1 = Text("性质①：横波性", font=CJK, color=BLUE).scale(0.52)
        tag1.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tag1))

        # 原点偏左下，留空间给说明
        orig = np.array([-2.8, -0.8, 0.0])

        # k 方向（x）
        k_arrow = Arrow(orig, orig + np.array([2.4, 0, 0]), buff=0,
                        color=GREEN, stroke_width=4,
                        max_tip_length_to_length_ratio=0.18)
        k_lbl = MathTex(r"\mathbf{k}\ (x)", color=GREEN).scale(0.55)
        k_lbl.next_to(k_arrow.get_end(), RIGHT, buff=0.12)

        # E 方向（y）
        e_arrow = Arrow(orig, orig + np.array([0, 2.0, 0]), buff=0,
                        color=YELLOW, stroke_width=4,
                        max_tip_length_to_length_ratio=0.18)
        e_lbl = MathTex(r"\mathbf{E}\ (y)", color=YELLOW).scale(0.55)
        e_lbl.next_to(e_arrow.get_end(), UP, buff=0.12)

        # B 方向（z — 画成右上斜线，模拟 z 轴投影）
        b_arrow = Arrow(orig, orig + np.array([1.1, 1.1, 0]), buff=0,
                        color=CYAN, stroke_width=4,
                        max_tip_length_to_length_ratio=0.18)
        b_lbl = MathTex(r"\mathbf{B}\ (z)", color=CYAN).scale(0.55)
        b_lbl.next_to(b_arrow.get_end(), UR, buff=0.08)

        orig_dot = Dot(orig, color=WHITE, radius=0.08)

        self.play(GrowArrow(k_arrow), FadeIn(k_lbl))
        self.wait(0.4)
        self.play(GrowArrow(e_arrow), FadeIn(e_lbl))
        self.wait(0.4)
        self.play(GrowArrow(b_arrow), FadeIn(b_lbl))
        self.play(FadeIn(orig_dot))
        self.wait(0.6)

        # 右手系说明 + 叉积公式
        cross_eq = MathTex(r"\mathbf{E}\times\mathbf{B}",
                           r"\parallel",
                           r"\mathbf{k}").scale(0.80)
        cross_eq[0].set_color(YELLOW)
        cross_eq[2].set_color(GREEN)
        cross_eq.next_to(tag1, DOWN, buff=0.3).shift(RIGHT * 2.4)

        rhs = Text("右手四指 E 转向 B，拇指指 k（传播方向）",
                   font=CJK, color=GREEN).scale(0.40)
        rhs.next_to(cross_eq, DOWN, buff=0.28)

        self.play(Write(cross_eq))
        self.play(FadeIn(rhs))
        self.wait(1.6)

        g1_all = VGroup(k_arrow, k_lbl, e_arrow, e_lbl,
                        b_arrow, b_lbl, orig_dot, cross_eq, rhs)
        self.play(FadeOut(g1_all), FadeOut(tag1))

        # ══════════════════════════════════════════════════════════════════
        # Step 4 : 格② 同相位 —— E、B 快照波形叠加
        # ══════════════════════════════════════════════════════════════════
        tag2 = Text("性质②：E 与 B 同相位", font=CJK, color=BLUE).scale(0.52)
        tag2.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tag2))

        axes2 = Axes(
            x_range=[0, 2 * PI, PI / 2],
            y_range=[-1.4, 1.4, 1],
            x_length=10,
            y_length=2.6,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.6)

        x_lbl2 = MathTex(r"x").scale(0.55).next_to(axes2.x_axis.get_end(), DOWN, buff=0.14)
        self.play(Create(axes2), FadeIn(x_lbl2))

        # E(x) = cos(x) 黄色
        wave_E = axes2.plot(lambda x: math.cos(x), x_range=[0, 2 * PI], color=YELLOW)
        # B(x) = 0.8*cos(x) 青色（振幅略小以便区分，逻辑上同相）
        wave_B = axes2.plot(lambda x: 0.8 * math.cos(x), x_range=[0, 2 * PI], color=CYAN)

        e_wave_lbl = MathTex(r"E(x)", color=YELLOW).scale(0.55)
        e_wave_lbl.next_to(axes2.c2p(0.3, 1.05), UP, buff=0.10)
        b_wave_lbl = MathTex(r"B(x)", color=CYAN).scale(0.55)
        b_wave_lbl.next_to(axes2.c2p(0.3, 0.85), DOWN, buff=0.30)

        self.play(Create(wave_E), FadeIn(e_wave_lbl))
        self.wait(0.4)
        self.play(Create(wave_B), FadeIn(b_wave_lbl))
        self.wait(0.5)

        # 垂直虚线标出对齐位置（波峰 x=0 和波谷 x=π）
        v1 = DashedLine(axes2.c2p(0, -1.3), axes2.c2p(0, 1.3), color=WHITE, stroke_width=2)
        v2 = DashedLine(axes2.c2p(PI, -1.3), axes2.c2p(PI, 1.3), color=WHITE, stroke_width=2)
        align_note = Text("波峰 / 波谷完全对齐 → 同相位",
                          font=CJK, color=GREEN).scale(0.44).to_edge(DOWN, buff=0.55)
        self.play(Create(v1), Create(v2))
        self.play(FadeIn(align_note))
        self.wait(1.8)

        g2_all = VGroup(axes2, x_lbl2, wave_E, wave_B,
                        e_wave_lbl, b_wave_lbl, v1, v2, align_note)
        self.play(FadeOut(g2_all), FadeOut(tag2))

        # ══════════════════════════════════════════════════════════════════
        # Step 5 : 格③ 振幅比 E/B = c + 能量密度相等
        # ══════════════════════════════════════════════════════════════════
        tag3 = Text("性质③：振幅比与能量密度", font=CJK, color=BLUE).scale(0.52)
        tag3.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tag3))

        # 振幅比
        amp_eq = MathTex(r"\frac{E_0}{B_0}", r"=", r"c",
                         r"= 3\times10^{8}\ \mathrm{m/s}").scale(0.88)
        amp_eq[0].set_color(YELLOW)
        amp_eq[2].set_color(GREEN)
        amp_eq[3].set_color(GREEN)
        amp_eq.next_to(tag3, DOWN, buff=0.45).shift(LEFT * 0.5)
        self.play(Write(amp_eq))
        self.wait(1.0)

        # 能量密度
        we_label = Text("电场能量密度：", font=CJK).scale(0.46)
        we_eq = MathTex(r"w_E = \frac{1}{2}\varepsilon_0 E^2").scale(0.78)
        we_row = VGroup(we_label, we_eq).arrange(RIGHT, buff=0.15)

        wb_label = Text("磁场能量密度：", font=CJK).scale(0.46)
        wb_eq = MathTex(r"w_B = \frac{B^2}{2\mu_0}").scale(0.78)
        wb_row = VGroup(wb_label, wb_eq).arrange(RIGHT, buff=0.15)

        equal_note = Text("二者数值相等：", font=CJK, color=YELLOW).scale(0.46)
        equal_eq = MathTex(r"w_E = w_B").scale(0.80)
        equal_eq.set_color(YELLOW)
        equal_row = VGroup(equal_note, equal_eq).arrange(RIGHT, buff=0.15)

        energy_group = VGroup(we_row, wb_row, equal_row).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        energy_group.next_to(amp_eq, DOWN, buff=0.50)
        energy_group.scale_to_fit_width(11)

        self.play(FadeIn(we_row))
        self.wait(0.5)
        self.play(FadeIn(wb_row))
        self.wait(0.5)
        self.play(FadeIn(equal_row))
        self.wait(1.8)

        g3_all = VGroup(amp_eq, energy_group)
        self.play(FadeOut(g3_all), FadeOut(tag3))

        # ══════════════════════════════════════════════════════════════════
        # Step 6 : 格④ 真空光速推导 c = 1/√(μ₀ε₀)
        # ══════════════════════════════════════════════════════════════════
        tag4 = Text("性质④：真空光速由麦克斯韦方程推出", font=CJK, color=BLUE).scale(0.52)
        tag4.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tag4))

        # 推导路线（逐步展示）
        step4_a_zh = Text("取 E 的旋度，再代入 B 的旋度方程：",
                          font=CJK).scale(0.44)
        step4_a_zh.next_to(tag4, DOWN, buff=0.42)
        self.play(FadeIn(step4_a_zh))
        self.wait(0.6)

        step4_b = MathTex(r"\nabla\times(\nabla\times \mathbf{E})",
                          r"=",
                          r"-\mu_0\varepsilon_0\,\frac{\partial^2 \mathbf{E}}{\partial t^2}").scale(0.80)
        step4_b[0].set_color(CYAN)
        step4_b[2].set_color(ORANGE)
        step4_b.next_to(step4_a_zh, DOWN, buff=0.35)
        self.play(Write(step4_b))
        self.wait(0.8)

        step4_c_zh = Text("化简（矢量恒等式）得波动方程：",
                          font=CJK).scale(0.44)
        step4_c_zh.next_to(step4_b, DOWN, buff=0.32)
        step4_c = MathTex(r"\nabla^2\mathbf{E}",
                          r"=",
                          r"\mu_0\varepsilon_0\,\frac{\partial^2 \mathbf{E}}{\partial t^2}").scale(0.80)
        step4_c[0].set_color(CYAN)
        step4_c[2].set_color(ORANGE)
        step4_c.next_to(step4_c_zh, DOWN, buff=0.28)
        self.play(FadeIn(step4_c_zh))
        self.play(Write(step4_c))
        self.wait(0.8)

        step4_d_zh = Text("对比通用波动方程，波速平方 =（系数的倒数）：",
                          font=CJK).scale(0.44)
        step4_d_zh.next_to(step4_c, DOWN, buff=0.30)
        step4_d = MathTex(r"c",
                          r"=",
                          r"\frac{1}{\sqrt{\mu_0\varepsilon_0}}",
                          r"\approx 3\times10^{8}\ \mathrm{m/s}").scale(0.88)
        step4_d[0].set_color(GREEN)
        step4_d[2].set_color(YELLOW)
        step4_d[3].set_color(GREEN)
        step4_d.next_to(step4_d_zh, DOWN, buff=0.28)
        box4 = SurroundingRectangle(step4_d, color=GREEN, buff=0.18, corner_radius=0.10)
        self.play(FadeIn(step4_d_zh))
        self.play(Write(step4_d), Create(box4))
        self.wait(2.0)

        g4_all = VGroup(step4_a_zh, step4_b,
                        step4_c_zh, step4_c,
                        step4_d_zh, step4_d, box4)
        self.play(FadeOut(g4_all), FadeOut(tag4))

        # ══════════════════════════════════════════════════════════════════
        # Step 7 : 格⑤ 电磁波谱（频率轴 + 可见光彩虹渐变）
        # ══════════════════════════════════════════════════════════════════
        tag5 = Text("性质⑤：电磁波谱", font=CJK, color=BLUE).scale(0.52)
        tag5.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(tag5))

        # 频率轴（对数轴示意，用等宽矩形近似各波段）
        band_defs = [
            ("无线电波", "< 3\\times10^{9}", "#888888"),
            ("微波",     "\\sim10^{10}",      "#AAAAAA"),
            ("红外线",   "\\sim10^{12}",      "#FF6600"),
            ("可见光",   "4{-}7.5\\times10^{14}", None),
            ("紫外线",   "\\sim10^{16}",      "#CC00FF"),
            ("X 射线",   "\\sim10^{18}",      "#00CCFF"),
            (r"$\gamma$", "\\sim10^{20}",      "#FF3333"),
        ]

        n_bands = len(band_defs)
        total_w = 12.0
        band_h = 0.55
        band_w = total_w / n_bands
        start_x = -total_w / 2

        axis_y = -0.5        # 频率轴 y 坐标
        bar_y = axis_y + 0.05 + band_h / 2

        # 频率轴箭头
        freq_axis = Arrow(
            np.array([start_x - 0.2, axis_y, 0]),
            np.array([start_x + total_w + 0.3, axis_y, 0]),
            buff=0, color=WHITE, stroke_width=2,
            max_tip_length_to_length_ratio=0.05,
        )
        freq_lbl_zh = Text("频率", font=CJK, color=WHITE).scale(0.38)
        freq_lbl = MathTex(r"f\ \mathrm{(Hz)}").scale(0.38)
        freq_row = VGroup(freq_lbl_zh, freq_lbl).arrange(RIGHT, buff=0.06)
        freq_row.next_to(freq_axis.get_end(), RIGHT, buff=0.10)

        self.play(GrowArrow(freq_axis), FadeIn(freq_row))
        self.wait(0.3)

        bars = VGroup()
        name_labels = VGroup()
        freq_labels = VGroup()

        for i, (zh_name, freq_str, hex_color) in enumerate(band_defs):
            cx = start_x + (i + 0.5) * band_w
            bx = start_x + i * band_w

            if hex_color is None:
                # 可见光 — 彩虹渐变（用 7 个小色块）
                n_sub = len(RAINBOW_COLORS)
                sub_w = band_w / n_sub
                for j, rc in enumerate(RAINBOW_COLORS):
                    sx = bx + j * sub_w
                    rect = Rectangle(
                        width=sub_w - 0.02, height=band_h,
                        fill_color=rc, fill_opacity=0.85,
                        stroke_width=0,
                    ).move_to(np.array([sx + sub_w / 2, bar_y, 0]))
                    bars.add(rect)
            else:
                rect = Rectangle(
                    width=band_w - 0.04, height=band_h,
                    fill_color=hex_color, fill_opacity=0.70,
                    stroke_color=WHITE, stroke_width=0.8,
                ).move_to(np.array([cx, bar_y, 0]))
                bars.add(rect)

            # 名称
            nm = Text(zh_name, font=CJK, color=WHITE).scale(0.30)
            nm.move_to(np.array([cx, bar_y + band_h / 2 + 0.22, 0]))
            name_labels.add(nm)

            # 频率标注
            fq = MathTex(r"\sim " + freq_str if not freq_str.startswith("<") else freq_str,
                         color=CYAN).scale(0.26)
            fq.move_to(np.array([cx, bar_y - band_h / 2 - 0.22, 0]))
            freq_labels.add(fq)

        self.play(FadeIn(bars))
        self.play(FadeIn(name_labels))
        self.play(FadeIn(freq_labels))

        visible_note = Text("可见光（彩虹七色）只是电磁波谱中极窄的一段",
                            font=CJK, color=YELLOW).scale(0.42).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(visible_note))
        self.wait(2.0)

        g5_all = VGroup(freq_axis, freq_row, bars, name_labels, freq_labels, visible_note)
        self.play(FadeOut(g5_all), FadeOut(tag5))

        # ══════════════════════════════════════════════════════════════════
        # Step 8 : 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("核心公式小结", font=CJK, color=BLUE).scale(0.56)
        s_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        s1_zh = Text("横波性：", font=CJK).scale(0.44)
        s1_eq = MathTex(r"\mathbf{E}\times\mathbf{B}\parallel\mathbf{k}").scale(0.80)
        s1_eq.set_color(YELLOW)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.15)

        s2_zh = Text("振幅比：", font=CJK).scale(0.44)
        s2_eq = MathTex(r"\dfrac{E_0}{B_0}=c").scale(0.80)
        s2_eq.set_color(YELLOW)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.15)

        s3_zh = Text("光速推导：", font=CJK).scale(0.44)
        s3_eq = MathTex(r"c=\dfrac{1}{\sqrt{\mu_0\varepsilon_0}}\approx3\times10^{8}\ \mathrm{m/s}").scale(0.80)
        s3_eq.set_color(GREEN)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.15)

        s4_zh = Text("能量密度：", font=CJK).scale(0.44)
        s4_eq = MathTex(r"w_E=\tfrac{1}{2}\varepsilon_0 E^2=w_B=\tfrac{B^2}{2\mu_0}").scale(0.76)
        s4_eq.set_color(CYAN)
        s4 = VGroup(s4_zh, s4_eq).arrange(RIGHT, buff=0.15)

        s5 = Text("E 与 B 同相位；光速在所有惯性系中恒为 c", font=CJK, color=WHITE).scale(0.43)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(12)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(Write(s1))
        self.wait(0.4)
        self.play(Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(Write(s4))
        self.wait(0.4)
        self.play(FadeIn(s5), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Ex2EmWaveTransverseProperties",
        "id": "phys-ch09-9.4-ex2-em-wave-transverse-properties",
        "chapterId": "ch09",
        "sectionId": "9.4",
        "title": "平面电磁波性质综合辨析",
        "description": "五格动画逐步演示电磁波横波性（E×B右手系）、同相位波形叠加、振幅比E/B=c与能量密度相等、麦克斯韦方程推导光速c=1/√(μ₀ε₀)、以及电磁波谱彩虹七色可见光段。",
    },
]
