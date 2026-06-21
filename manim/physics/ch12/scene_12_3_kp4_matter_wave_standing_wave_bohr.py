"""第 12.3 节 · 德布罗意驻波解释玻尔量子化条件（金标准范本：圆形轨道 + 驻波 + ValueTracker）。

物理核心：de Broglie 物质波绕圆形轨道传播，当 2πr = nλ 时首尾衔接成驻波，轨道稳定；
否则波形在圆周上首尾相消，轨道不稳定。由此推出角动量量子化 L = nℏ 及玻尔半径 r_n = n²a₀。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch12Kp4MatterWaveStandingWaveBohr(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("德布罗意驻波解释玻尔量子化条件", font=CJK, color=BLUE).scale(0.60).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        line1 = Text("吉他弦拨动后，只有特定长度能形成驻波（两端固定的整数个半波长）。", font=CJK).scale(0.44)
        line2 = Text("玻尔的轨道量子化也有类似道理：", font=CJK).scale(0.44)
        line3 = Text("电子绕核运动的物质波，必须在圆周上首尾衔接，才能形成稳定驻波！", font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(line1, line2, line3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(line1))
        self.wait(0.9)
        self.play(FadeIn(line2))
        self.wait(0.6)
        self.play(FadeIn(line3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 德布罗意关系回顾 ────────────────────────────────────
        review_lbl = Text("德布罗意关系（物质波波长）", font=CJK).scale(0.46).next_to(title, DOWN, buff=0.5)
        de_broglie = MathTex(r"\lambda", r"=", r"\frac{h}{p}", r"=", r"\frac{h}{mv}").scale(1.05)
        de_broglie.next_to(review_lbl, DOWN, buff=0.4)
        de_broglie[0].set_color(YELLOW)
        de_broglie[2].set_color(CYAN)
        self.play(FadeIn(review_lbl))
        self.play(Write(de_broglie))
        self.wait(1.0)
        note_lbl = Text("电子的质量×速度确定了波长，波长越短动量越大", font=CJK, color=GREEN).scale(0.40)
        note_lbl.next_to(de_broglie, DOWN, buff=0.35)
        self.play(FadeIn(note_lbl))
        self.wait(1.6)
        self.play(FadeOut(VGroup(review_lbl, de_broglie, note_lbl)))

        # ── Step 4: 圆形轨道驻波条件 —— 动画演示 ────────────────────────
        # 副标题保留，内容区画圆
        sec_lbl = Text("驻波条件：圆周必须容纳整数个波长", font=CJK, color=CYAN).scale(0.44)
        sec_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec_lbl))
        self.wait(0.5)

        # 中心稍下移给公式留空间
        center = DOWN * 0.55
        R = 1.8  # 固定显示半径

        # 绘制圆形轨道辅助圆（灰色）
        orbit_base = Circle(radius=R, color=GREY, stroke_width=1.5).move_to(center)
        self.play(Create(orbit_base))
        self.wait(0.3)

        def make_wave_on_circle(n_val, r_val, stable):
            """在圆周上叠加 n 个完整波，返回 VMobject 列表（波形折线 + 轨道圆）"""
            pts = []
            N_pts = 300
            for i in range(N_pts + 1):
                theta = 2 * math.pi * i / N_pts
                # 波形振幅（相对半径的小扰动）
                amp = 0.22
                wave_r = r_val + amp * math.sin(n_val * theta)
                x = wave_r * math.cos(theta)
                y = wave_r * math.sin(theta)
                pts.append(center + np.array([x, y, 0]))
            wave_color = BLUE if stable else RED
            wave_curve = VMobject(color=wave_color, stroke_width=2.5)
            wave_curve.set_points_as_corners(pts)
            wave_curve.make_smooth()
            orbit_circle = Circle(radius=r_val, color=wave_color, stroke_width=1.0,
                                  stroke_opacity=0.4).move_to(center)
            return wave_curve, orbit_circle

        # --- n=1 稳定 ---
        n_lbl_1 = VGroup(
            Text("n = 1", font=CJK, color=BLUE).scale(0.50),
            Text("（圆周 = 1 个波长，驻波稳定）", font=CJK, color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.25)
        n_lbl_1.next_to(sec_lbl, DOWN, buff=0.28)
        wave1, orb1 = make_wave_on_circle(1, R, True)
        stable_lbl1 = Text("稳定", font=CJK, color=BLUE).scale(0.55)
        stable_lbl1.move_to(center + RIGHT * (R + 0.55))
        self.play(FadeIn(n_lbl_1))
        self.play(Create(wave1), run_time=1.6)
        self.play(FadeIn(stable_lbl1))
        self.wait(1.5)
        self.play(FadeOut(VGroup(wave1, stable_lbl1, n_lbl_1)))

        # --- n=0.7 不稳定（非整数示意）---
        n_lbl_bad = VGroup(
            Text("n = 0.7", font=CJK, color=RED).scale(0.50),
            Text("（非整数，首尾不连续，轨道不稳定）", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.25)
        n_lbl_bad.next_to(sec_lbl, DOWN, buff=0.28)
        # 非整数 n 的波形（首尾断裂用不同颜色起点标记）
        pts_bad = []
        N_pts = 300
        for i in range(N_pts + 1):
            theta = 2 * math.pi * i / N_pts
            amp = 0.22
            wave_r = R + amp * math.sin(0.7 * theta)
            x = wave_r * math.cos(theta)
            y = wave_r * math.sin(theta)
            pts_bad.append(center + np.array([x, y, 0]))
        wave_bad = VMobject(color=RED, stroke_width=2.5)
        wave_bad.set_points_as_corners(pts_bad)
        wave_bad.make_smooth()
        # 标记首尾断点
        p_start = center + np.array([R + 0.22, 0, 0])
        p_end_angle = 2 * math.pi
        p_end_r = R + 0.22 * math.sin(0.7 * p_end_angle)
        p_end = center + np.array([p_end_r * math.cos(p_end_angle), p_end_r * math.sin(p_end_angle), 0])
        dot_start = Dot(p_start, color=YELLOW, radius=0.10)
        dot_end = Dot(p_end, color=ORANGE, radius=0.10)
        gap_lbl = Text("首尾不连续！", font=CJK, color=RED).scale(0.40)
        gap_lbl.next_to(dot_start, RIGHT, buff=0.15)
        unstable_lbl = Text("不稳定", font=CJK, color=RED).scale(0.55)
        unstable_lbl.move_to(center + RIGHT * (R + 0.65))
        self.play(FadeIn(n_lbl_bad))
        self.play(Create(wave_bad), run_time=1.6)
        self.play(FadeIn(dot_start), FadeIn(dot_end), FadeIn(gap_lbl), FadeIn(unstable_lbl))
        self.wait(1.5)
        self.play(FadeOut(VGroup(wave_bad, dot_start, dot_end, gap_lbl, unstable_lbl, n_lbl_bad)))

        # --- n=2 稳定 ---
        n_lbl_2 = VGroup(
            Text("n = 2", font=CJK, color=BLUE).scale(0.50),
            Text("（圆周 = 2 个波长，驻波稳定）", font=CJK, color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.25)
        n_lbl_2.next_to(sec_lbl, DOWN, buff=0.28)
        wave2, orb2 = make_wave_on_circle(2, R, True)
        stable_lbl2 = Text("稳定", font=CJK, color=BLUE).scale(0.55)
        stable_lbl2.move_to(center + RIGHT * (R + 0.55))
        self.play(FadeIn(n_lbl_2))
        self.play(Create(wave2), run_time=1.6)
        self.play(FadeIn(stable_lbl2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(wave2, stable_lbl2, n_lbl_2)))

        # --- n=3 稳定 ---
        n_lbl_3 = VGroup(
            Text("n = 3", font=CJK, color=BLUE).scale(0.50),
            Text("（圆周 = 3 个波长，驻波稳定）", font=CJK, color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.25)
        n_lbl_3.next_to(sec_lbl, DOWN, buff=0.28)
        wave3, orb3 = make_wave_on_circle(3, R, True)
        stable_lbl3 = Text("稳定", font=CJK, color=BLUE).scale(0.55)
        stable_lbl3.move_to(center + RIGHT * (R + 0.55))
        self.play(FadeIn(n_lbl_3))
        self.play(Create(wave3), run_time=1.6)
        self.play(FadeIn(stable_lbl3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(wave3, stable_lbl3, n_lbl_3, orbit_base, sec_lbl)))

        # ── Step 5: 驻波条件公式 ─────────────────────────────────────────
        cond_lbl = Text("驻波条件（整数个波长）", font=CJK).scale(0.46).next_to(title, DOWN, buff=0.5)
        cond_eq = MathTex(r"2\pi r_n", r"=", r"n\lambda", r"=", r"\frac{nh}{mv}",
                          r"\quad (n=1,2,3,\ldots)").scale(0.92)
        cond_eq.next_to(cond_lbl, DOWN, buff=0.4)
        cond_eq[0].set_color(YELLOW)
        cond_eq[2].set_color(CYAN)
        cond_eq[4].set_color(GREEN)
        self.play(FadeIn(cond_lbl))
        self.play(Write(cond_eq))
        self.wait(1.8)
        self.play(FadeOut(VGroup(cond_lbl, cond_eq)))

        # ── Step 6: 推导角动量量子化 L = nℏ ─────────────────────────────
        derive_lbl = Text("逐步推导：角动量量子化", font=CJK, color=CYAN).scale(0.46).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(derive_lbl))

        d1 = MathTex(r"2\pi r_n = \frac{nh}{mv}").scale(0.90)
        d1.next_to(derive_lbl, DOWN, buff=0.45)
        self.play(Write(d1))
        self.wait(1.0)

        d2 = MathTex(r"\Rightarrow\quad r_n \cdot mv = \frac{nh}{2\pi}").scale(0.90)
        d2.next_to(d1, DOWN, buff=0.4)
        d2[0].set_color(YELLOW)
        self.play(Write(d2))
        self.wait(1.0)

        d3 = MathTex(r"\Rightarrow\quad L = r_n p = n\hbar").scale(0.95)
        d3.next_to(d2, DOWN, buff=0.4)
        d3[0].set_color(GREEN)
        d3[-1].set_color(GREEN)
        self.play(Write(d3))

        box_derive = SurroundingRectangle(d3, color=GREEN, buff=0.18, corner_radius=0.10)
        self.play(Create(box_derive))
        note_ang = Text("角动量只能取 ℏ 的整数倍，这就是玻尔量子化条件的物理根源！",
                        font=CJK, color=GREEN).scale(0.40)
        note_ang.next_to(box_derive, DOWN, buff=0.35)
        self.play(FadeIn(note_ang))
        self.wait(2.0)
        self.play(FadeOut(VGroup(derive_lbl, d1, d2, d3, box_derive, note_ang)))

        # ── Step 7: 量子化半径 r_n = n²a₀ 推导 ──────────────────────────
        radius_lbl = Text("量子化轨道半径的推导", font=CJK, color=CYAN).scale(0.46).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(radius_lbl))

        r1 = MathTex(r"L = n\hbar \;\Rightarrow\; mv = \frac{n\hbar}{r_n}").scale(0.85)
        r1.next_to(radius_lbl, DOWN, buff=0.45)
        self.play(Write(r1))
        self.wait(0.9)

        r2 = MathTex(r"\text{Coulomb balance:}\quad \frac{mv^2}{r_n} = \frac{e^2}{4\pi\varepsilon_0 r_n^2}").scale(0.80)
        r2.next_to(r1, DOWN, buff=0.38)
        self.play(Write(r2))
        self.wait(0.9)

        r3 = MathTex(r"\Rightarrow\quad r_n = n^2 a_0, \quad a_0 = \frac{4\pi\varepsilon_0\hbar^2}{me^2}").scale(0.85)
        r3.next_to(r2, DOWN, buff=0.38)
        r3[0].set_color(YELLOW)
        self.play(Write(r3))
        box_r = SurroundingRectangle(r3, color=YELLOW, buff=0.16, corner_radius=0.10)
        self.play(Create(box_r))

        a0_note = Text("a₀ ≈ 0.053 nm  玻尔半径（氢原子基态轨道半径）", font=CJK, color=GREEN).scale(0.40)
        a0_note.next_to(box_r, DOWN, buff=0.3)
        self.play(FadeIn(a0_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(radius_lbl, r1, r2, r3, box_r, a0_note)))

        # ── Step 8: 同心圆可视化 r_n = n²a₀ ─────────────────────────────
        vis_lbl = Text("量子化离散轨道（同心圆，半径按 n² 增大）", font=CJK, color=CYAN).scale(0.44)
        vis_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(vis_lbl))

        orb_center = DOWN * 0.6
        a0_px = 0.62  # a₀ 映射的显示像素尺度
        orbit_circles = VGroup()
        orbit_labels = VGroup()
        nucleus = Dot(orb_center, radius=0.14, color=YELLOW)
        nucleus_lbl = Text("+", font=CJK, color=YELLOW).scale(0.55).move_to(orb_center)
        self.play(FadeIn(nucleus), FadeIn(nucleus_lbl))

        colors_n = [GREEN, CYAN, BLUE, ORANGE]
        for n in range(1, 5):
            r_display = n * n * a0_px
            circ = Circle(radius=r_display, color=colors_n[n - 1],
                          stroke_width=2.2).move_to(orb_center)
            lbl_text = f"n={n}"
            lbl = Text(lbl_text, font=CJK, color=colors_n[n - 1]).scale(0.38)
            lbl.move_to(orb_center + UP * r_display + UP * 0.22)
            orbit_circles.add(circ)
            orbit_labels.add(lbl)
            self.play(Create(circ), FadeIn(lbl), run_time=0.6)
            self.wait(0.4)

        r_formula = MathTex(r"r_n = n^2 a_0").scale(0.80).set_color(YELLOW)
        r_formula.to_edge(RIGHT, buff=0.7).shift(DOWN * 0.5)
        self.play(Write(r_formula))
        self.wait(2.0)
        self.play(FadeOut(VGroup(orbit_circles, orbit_labels, nucleus, nucleus_lbl,
                                 r_formula, vis_lbl)))

        # ── Step 9: 能量量子化简述 ───────────────────────────────────────
        en_lbl = Text("轨道半径量子化 → 能量也量子化", font=CJK, color=CYAN).scale(0.46)
        en_lbl.next_to(title, DOWN, buff=0.5)
        en_eq = MathTex(r"E_n = -\frac{13.6\,\text{eV}}{n^2}").scale(0.95)
        en_eq.next_to(en_lbl, DOWN, buff=0.45)
        en_eq[0].set_color(YELLOW)
        self.play(FadeIn(en_lbl), Write(en_eq))
        en_note1 = Text("n=1：基态，能量最低，最稳定", font=CJK, color=GREEN).scale(0.42)
        en_note2 = Text("n=2,3,...：激发态，能量较高", font=CJK, color=GREEN).scale(0.42)
        en_notes = VGroup(en_note1, en_note2).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        en_notes.next_to(en_eq, DOWN, buff=0.4)
        self.play(FadeIn(en_note1))
        self.wait(0.6)
        self.play(FadeIn(en_note2))
        self.wait(1.6)
        self.play(FadeOut(VGroup(en_lbl, en_eq, en_notes)))

        # ── Step 10: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)

        s_row1 = VGroup(
            Text("驻波条件：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"2\pi r_n = n\lambda = \dfrac{nh}{mv}").scale(0.78).set_color(YELLOW),
        ).arrange(RIGHT, buff=0.2)

        s_row2 = VGroup(
            Text("角动量量子化：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"L = r_n\cdot mv = n\hbar").scale(0.78).set_color(CYAN),
        ).arrange(RIGHT, buff=0.2)

        s_row3 = VGroup(
            Text("轨道半径：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"r_n = n^2 a_0").scale(0.78).set_color(GREEN),
        ).arrange(RIGHT, buff=0.2)

        s_row4 = VGroup(
            Text("能级公式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"E_n = -\dfrac{13.6\,\text{eV}}{n^2}").scale(0.78).set_color(ORANGE),
        ).arrange(RIGHT, buff=0.2)

        s_body = VGroup(s_row1, s_row2, s_row3, s_row4).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        s_body.next_to(s_title, DOWN, buff=0.4)
        s_body.scale_to_fit_width(12.0)

        box = SurroundingRectangle(s_body, color=BLUE, buff=0.3, corner_radius=0.15)
        key_msg = Text("「驻波→量子化」：波动性是量子化条件的物理根源", font=CJK, color=GREEN).scale(0.40)
        key_msg.next_to(box, DOWN, buff=0.28)

        self.play(FadeIn(s_title))
        self.play(Write(s_row1))
        self.wait(0.6)
        self.play(Write(s_row2))
        self.wait(0.6)
        self.play(Write(s_row3))
        self.wait(0.6)
        self.play(Write(s_row4))
        self.wait(0.4)
        self.play(Create(box))
        self.play(FadeIn(key_msg))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, s_body, box, key_msg, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp4MatterWaveStandingWaveBohr",
        "id": "phys-ch12-12.3-kp4-matter-wave-standing-wave-bohr",
        "chapterId": "ch12",
        "sectionId": "12.3",
        "title": "德布罗意驻波解释玻尔量子化条件",
        "description": "圆形轨道上叠加物质波，演示 n=1/2/3 稳定驻波与非整数不稳定对比，逐步推导 L=nℏ 及 r_n=n²a₀，同心圆展示量子化离散轨道。",
    },
]
