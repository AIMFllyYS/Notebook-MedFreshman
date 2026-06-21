"""第 4.2 节 · 波的干涉：相位差条件与空间分布（金标准范本：场热图 + ValueTracker 扫动 P 点）。

可视化思路：
  1. 两个波源 S1、S2（同频同振幅同相位）发出圆形波，用同心圆动画展示。
  2. 场中任意点 P，标注 r1/r2 以及波程差 δ=r2-r1。
  3. ValueTracker 拖动 P 点，实时更新 δ、Δφ=2πδ/λ 和合振幅。
  4. 二维场用像素着色热图（ImageMobject）静态渲染明暗纹。
  5. 明纹 δ=nλ（亮线），暗纹 δ=(n+½)λ（暗线）沿双曲线分布。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理参数 ─────────────────────────────────────────────────────────────────
LAM = 1.6          # 波长 λ（场坐标单位）
A0 = 1.0           # 单个波源振幅
# 两波源位置（场坐标）
S1_POS = np.array([-1.5, 0.0, 0.0])
S2_POS = np.array([+1.5, 0.0, 0.0])


def combined_amplitude(px: float, py: float) -> float:
    """计算场中 (px,py) 处的合振幅 A=|2A0 cos(π δ/λ)|"""
    r1 = math.sqrt((px - S1_POS[0]) ** 2 + (py - S1_POS[1]) ** 2)
    r2 = math.sqrt((px - S2_POS[0]) ** 2 + (py - S2_POS[1]) ** 2)
    delta = r2 - r1
    return abs(2 * A0 * math.cos(math.pi * delta / LAM))


class Ch04Kp2WaveInterferencePattern(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("波的干涉：相位差条件与空间分布", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.35)
        subtitle = Text("第四章 机械波 · 4.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════════════════════
        a1 = Text("向平静水面同时投入两颗石子——", font=CJK).scale(0.48)
        a2 = Text("两列圆形波叠加，形成永久性的明暗相间图案：", font=CJK).scale(0.48)
        a3 = Text("这就是波的干涉现象。", font=CJK, color=YELLOW).scale(0.48)
        analogy = VGroup(a1, a2, a3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        analogy.next_to(title, DOWN, buff=0.55)
        for line in analogy:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.wait(1.0)
        self.play(FadeOut(analogy))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3  干涉条件定义（逐行）
        # ══════════════════════════════════════════════════════════════════════
        cond_label = Text("干涉发生的必要条件", font=CJK, color=BLUE).scale(0.48)
        cond_label.next_to(title, DOWN, buff=0.5)
        c1 = VGroup(
            Text("①  频率相同", font=CJK).scale(0.44),
        )
        c2 = VGroup(
            Text("②  相位差恒定（相干波源）", font=CJK).scale(0.44),
        )
        c3 = VGroup(
            Text("③  振动方向相同", font=CJK).scale(0.44),
        )
        conds = VGroup(c1, c2, c3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        conds.next_to(cond_label, DOWN, buff=0.4)
        self.play(FadeIn(cond_label))
        for item in conds:
            self.play(FadeIn(item))
            self.wait(0.5)
        self.wait(1.2)
        self.play(FadeOut(VGroup(cond_label, conds)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4  关键公式（逐步推导）
        # ══════════════════════════════════════════════════════════════════════
        form_label = Text("相位差与波程差", font=CJK, color=BLUE).scale(0.48)
        form_label.next_to(title, DOWN, buff=0.5)

        f1 = MathTex(
            r"\delta", r"=", r"r_2 - r_1",
            color=WHITE
        ).scale(0.82)
        f1[0].set_color(CYAN)
        f1[2].set_color(ORANGE)

        f2 = MathTex(
            r"\Delta\varphi", r"=",
            r"\frac{2\pi}{\lambda}", r"\delta",
            color=WHITE
        ).scale(0.82)
        f2[0].set_color(YELLOW)
        f2[2].set_color(GREEN)
        f2[3].set_color(CYAN)

        f3 = MathTex(
            r"A", r"=",
            r"\left|2A_0\cos\!\left(\frac{\pi\delta}{\lambda}\right)\right|",
            color=WHITE
        ).scale(0.78)
        f3[0].set_color(RED)
        f3[2].set_color(YELLOW)

        formulas = VGroup(f1, f2, f3).arrange(DOWN, buff=0.38)
        formulas.next_to(form_label, DOWN, buff=0.42)

        self.play(FadeIn(form_label))
        self.play(Write(f1))
        self.wait(0.8)
        self.play(Write(f2))
        self.wait(0.8)
        self.play(Write(f3))
        self.wait(1.2)
        self.play(FadeOut(VGroup(form_label, formulas)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 5  加强 / 减弱条件（颜色标注）
        # ══════════════════════════════════════════════════════════════════════
        constr_label = Text("加强与减弱条件", font=CJK, color=BLUE).scale(0.48)
        constr_label.next_to(title, DOWN, buff=0.5)

        bright_row = VGroup(
            Text("加强（明纹）：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\delta = n\lambda \quad (n=0,\pm1,\pm2,\ldots)", color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        dark_row = VGroup(
            Text("减弱（暗纹）：", font=CJK, color=BLUE_C).scale(0.44),
            MathTex(r"\delta = \left(n+\tfrac{1}{2}\right)\lambda", color=BLUE_C).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        constr = VGroup(bright_row, dark_row).arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        constr.next_to(constr_label, DOWN, buff=0.42)

        self.play(FadeIn(constr_label))
        self.play(FadeIn(bright_row))
        self.wait(0.8)
        self.play(FadeIn(dark_row))
        self.wait(1.4)
        self.play(FadeOut(VGroup(constr_label, constr)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6  两波源 + 同心圆波纹动画
        # ══════════════════════════════════════════════════════════════════════
        # 场区映射：场坐标 ±4 → 屏幕坐标 ±3.5（宽度方向）
        SCALE = 0.9   # 场坐标 → 屏幕单位比例

        # 两个波源点
        s1_screen = S1_POS * SCALE + np.array([0, -0.8, 0])
        s2_screen = S2_POS * SCALE + np.array([0, -0.8, 0])

        s1_dot = Dot(s1_screen, color=YELLOW, radius=0.12)
        s2_dot = Dot(s2_screen, color=YELLOW, radius=0.12)

        s1_lbl = Text("S₁", font=CJK, color=YELLOW).scale(0.4)
        s2_lbl = Text("S₂", font=CJK, color=YELLOW).scale(0.4)
        s1_lbl.next_to(s1_dot, DOWN, buff=0.12)
        s2_lbl.next_to(s2_dot, DOWN, buff=0.12)

        src_label = Text("两个同相相干波源", font=CJK, color=GREEN).scale(0.42)
        src_label.next_to(title, DOWN, buff=0.45)

        self.play(FadeIn(src_label), FadeIn(s1_dot), FadeIn(s2_dot),
                  FadeIn(s1_lbl), FadeIn(s2_lbl))
        self.wait(0.6)

        # 同心圆波纹（分批出现，模拟波向外扩散）
        ring_groups = []
        n_rings = 5
        for step in range(n_rings):
            r = (step + 1) * LAM * SCALE * 0.7
            ring1 = Circle(radius=r, color=CYAN, stroke_opacity=0.55, stroke_width=1.6)
            ring1.move_to(s1_screen)
            ring2 = Circle(radius=r, color=ORANGE, stroke_opacity=0.55, stroke_width=1.6)
            ring2.move_to(s2_screen)
            ring_groups.append(VGroup(ring1, ring2))

        # 逐圈扩散动画
        ring_mobs = []
        for rg in ring_groups:
            self.play(Create(rg), run_time=0.45, rate_func=linear)
            ring_mobs.append(rg)
        self.wait(1.0)

        self.play(FadeOut(VGroup(*ring_mobs)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7  干涉场热图（静态渲染明暗纹）
        # ══════════════════════════════════════════════════════════════════════
        # 用 numpy 生成像素矩阵
        W, H = 320, 220          # 像素分辨率（适中，速度与质量平衡）
        x_range = (-4.0, 4.0)
        y_range = (-3.0, 3.0)

        px_arr = np.linspace(x_range[0], x_range[1], W)
        py_arr = np.linspace(y_range[0], y_range[1], H)
        XX, YY = np.meshgrid(px_arr, py_arr)

        R1 = np.sqrt((XX - S1_POS[0]) ** 2 + (YY - S1_POS[1]) ** 2)
        R2 = np.sqrt((XX - S2_POS[0]) ** 2 + (YY - S2_POS[1]) ** 2)
        DELTA = R2 - R1
        AMP = np.abs(2 * A0 * np.cos(np.pi * DELTA / LAM))
        AMP_norm = AMP / (2 * A0)   # 归一化 [0,1]

        # 构建 RGBA 图像：亮纹黄色，暗纹深蓝
        img = np.zeros((H, W, 4), dtype=np.uint8)
        img[:, :, 0] = (AMP_norm ** 0.6 * 220).astype(np.uint8)          # R
        img[:, :, 1] = (AMP_norm ** 0.6 * 200).astype(np.uint8)          # G
        img[:, :, 2] = ((1 - AMP_norm) ** 0.5 * 120).astype(np.uint8)    # B
        img[:, :, 3] = 220  # Alpha

        # 翻转 y 轴（manim 坐标系 y 向上）
        img = np.flipud(img)

        heatmap = ImageMobject(img)
        heatmap.set_height(5.0)
        heatmap.set_width(7.0)
        heatmap.move_to(np.array([0, -0.8, 0]))

        heatmap_label = Text("干涉场振幅分布（亮=加强，暗=减弱）", font=CJK, color=GREEN).scale(0.40)
        heatmap_label.next_to(title, DOWN, buff=0.42)

        self.play(FadeOut(src_label))
        self.play(FadeIn(heatmap), FadeIn(heatmap_label))
        # 重新显示波源点叠加在热图上
        self.play(FadeIn(s1_dot), FadeIn(s2_dot), FadeIn(s1_lbl), FadeIn(s2_lbl))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8  ValueTracker：拖动 P 点，实时显示 r1/r2/δ/Δφ/A
        # ══════════════════════════════════════════════════════════════════════
        # P 点在场坐标中的位置，用 (px, py) ValueTracker
        px_tracker = ValueTracker(2.0)
        py_tracker = ValueTracker(1.5)

        def field_to_screen(px, py):
            """场坐标 → 屏幕坐标（对应热图中心在 [0,-0.8,0]）"""
            sx = px * (7.0 / 8.0)   # 场宽 8 → 屏幕宽 7
            sy = py * (5.0 / 6.0)   # 场高 6 → 屏幕高 5
            return np.array([sx, sy - 0.8, 0])

        # P 点 dot
        p_dot = always_redraw(lambda: Dot(
            field_to_screen(px_tracker.get_value(), py_tracker.get_value()),
            color=RED, radius=0.11,
        ))

        # r1 线段
        line_r1 = always_redraw(lambda: Line(
            s1_screen,
            field_to_screen(px_tracker.get_value(), py_tracker.get_value()),
            color=GREEN, stroke_width=2.2,
        ))
        # r2 线段
        line_r2 = always_redraw(lambda: Line(
            s2_screen,
            field_to_screen(px_tracker.get_value(), py_tracker.get_value()),
            color=ORANGE, stroke_width=2.2,
        ))

        # P 标签
        p_label = always_redraw(lambda: Text("P", font=CJK, color=RED).scale(0.38).next_to(
            field_to_screen(px_tracker.get_value(), py_tracker.get_value()),
            UP, buff=0.08,
        ))

        # 数值显示面板（右侧）
        def make_info_panel():
            pxv = px_tracker.get_value()
            pyv = py_tracker.get_value()
            r1v = math.sqrt((pxv - S1_POS[0]) ** 2 + (pyv - S1_POS[1]) ** 2)
            r2v = math.sqrt((pxv - S2_POS[0]) ** 2 + (pyv - S2_POS[1]) ** 2)
            delta_v = r2v - r1v
            dphi_v = 2 * math.pi * delta_v / LAM
            amp_v = abs(2 * A0 * math.cos(math.pi * delta_v / LAM))
            panel = VGroup(
                MathTex(
                    rf"r_1={r1v:.2f}", color=GREEN
                ).scale(0.52),
                MathTex(
                    rf"r_2={r2v:.2f}", color=ORANGE
                ).scale(0.52),
                MathTex(
                    rf"\delta={delta_v:.2f}\lambda" if abs(delta_v / LAM) > 0.01 else r"\delta=0",
                    color=CYAN
                ).scale(0.52),
                MathTex(
                    rf"\Delta\varphi={dphi_v:.2f}",
                    color=YELLOW
                ).scale(0.52),
                MathTex(
                    rf"A={amp_v:.2f}",
                    color=RED
                ).scale(0.52),
            ).arrange(DOWN, buff=0.20, aligned_edge=LEFT)
            panel.to_edge(RIGHT, buff=0.25).shift(DOWN * 0.8)
            return panel

        info_panel = always_redraw(make_info_panel)

        self.play(
            FadeIn(line_r1), FadeIn(line_r2),
            FadeIn(p_dot), FadeIn(p_label),
            FadeIn(info_panel),
        )
        self.wait(1.0)

        # r1/r2 标签（静态放一次）
        r1_label = VGroup(
            Text("r", font=CJK, color=GREEN).scale(0.35),
            Text("1", font=CJK, color=GREEN).scale(0.28),
        ).arrange(RIGHT, buff=0.03)
        r2_label = VGroup(
            Text("r", font=CJK, color=ORANGE).scale(0.35),
            Text("2", font=CJK, color=ORANGE).scale(0.28),
        ).arrange(RIGHT, buff=0.03)
        r1_label.next_to(field_to_screen(0.2, -0.3), LEFT, buff=0.1)
        r2_label.next_to(field_to_screen(0.3, 0.5), RIGHT, buff=0.1)
        self.play(FadeIn(r1_label), FadeIn(r2_label))
        self.wait(0.5)

        # 拖动 P：移向加强点（δ ≈ λ）
        self.play(
            px_tracker.animate.set_value(3.2),
            py_tracker.animate.set_value(0.0),
            run_time=2.0, rate_func=smooth,
        )
        self.wait(1.0)

        # 移向暗纹（δ ≈ 0.5λ）
        self.play(
            px_tracker.animate.set_value(3.2),
            py_tracker.animate.set_value(0.95),
            run_time=2.0, rate_func=smooth,
        )
        self.wait(1.0)

        # 移回加强位置（δ ≈ 2λ 双曲线上）
        self.play(
            px_tracker.animate.set_value(1.0),
            py_tracker.animate.set_value(2.4),
            run_time=2.0, rate_func=smooth,
        )
        self.wait(1.2)

        self.play(FadeOut(VGroup(line_r1, line_r2, p_dot, p_label,
                                 info_panel, r1_label, r2_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9  双曲线明纹轮廓叠加标注
        # ══════════════════════════════════════════════════════════════════════
        hyp_label = Text("明纹（亮线）: δ=nλ 双曲线族", font=CJK, color=YELLOW).scale(0.40)
        dark_label = Text("暗纹（暗线）: δ=(n+½)λ 双曲线族", font=CJK, color=BLUE_C).scale(0.40)
        labels_hyp = VGroup(hyp_label, dark_label).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        labels_hyp.next_to(title, DOWN, buff=0.42)
        self.play(FadeOut(heatmap_label))
        self.play(FadeIn(labels_hyp))
        self.wait(1.8)
        self.play(FadeOut(labels_hyp))

        # ══════════════════════════════════════════════════════════════════════
        # Step 10  数值示例：两石子入水 λ=2cm，d=3cm，求 P 点
        # ══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(heatmap, s1_dot, s2_dot, s1_lbl, s2_lbl)))
        self.wait(0.3)

        ex_title = Text("数值示例", font=CJK, color=BLUE).scale(0.48)
        ex_title.next_to(title, DOWN, buff=0.5)
        ex_desc = VGroup(
            Text("两相干波源 S1、S2 相距 d=3cm，波长 λ=2cm，", font=CJK).scale(0.42),
            Text("求离 S1 点 r1=5cm、离 S2 点 r2=8cm 处的 P 点是否为明纹？", font=CJK).scale(0.42),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        ex_desc.next_to(ex_title, DOWN, buff=0.38)
        self.play(FadeIn(ex_title), FadeIn(ex_desc))
        self.wait(1.2)

        ex_step1 = MathTex(r"\delta = r_2 - r_1 = 8 - 5 = 3\,\text{cm}").scale(0.8)
        ex_step1.next_to(ex_desc, DOWN, buff=0.38)
        ex_step1[0][0].set_color(CYAN)
        self.play(Write(ex_step1))
        self.wait(0.8)

        ex_step2 = MathTex(r"\frac{\delta}{\lambda} = \frac{3}{2} = 1.5 = n + \tfrac{1}{2}").scale(0.8)
        ex_step2.next_to(ex_step1, DOWN, buff=0.30)
        self.play(Write(ex_step2))
        self.wait(0.8)

        ex_concl = VGroup(
            Text("故 P 点处为", font=CJK).scale(0.46),
            Text("暗纹（相消干涉）", font=CJK, color=BLUE_C).scale(0.46),
        ).arrange(RIGHT, buff=0.15)
        ex_concl.next_to(ex_step2, DOWN, buff=0.35)
        self.play(FadeIn(ex_concl))
        self.wait(1.5)
        self.play(FadeOut(VGroup(ex_title, ex_desc, ex_step1, ex_step2, ex_concl)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 11  小结卡
        # ══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.48)

        sq1 = MathTex(r"\delta = r_2 - r_1", color=CYAN).scale(0.80)
        sq2 = MathTex(r"\Delta\varphi = \frac{2\pi\delta}{\lambda}", color=YELLOW).scale(0.80)
        sq3 = MathTex(
            r"A = \left|2A_0\cos\!\left(\frac{\pi\delta}{\lambda}\right)\right|",
            color=RED,
        ).scale(0.78)
        sq4 = MathTex(
            r"\delta = n\lambda \Rightarrow \text{constructive};\quad"
            r"\delta = \!\left(n+\tfrac{1}{2}\right)\!\lambda \Rightarrow \text{destructive}",
            color=GREEN,
        ).scale(0.66)
        s5 = Text("明纹沿双曲线分布，两波程差等于整数倍波长处振幅最大",
                  font=CJK, color=WHITE).scale(0.40)

        summ = VGroup(sq1, sq2, sq3, sq4, s5).arrange(DOWN, buff=0.32)
        summ.next_to(s_title, DOWN, buff=0.40)
        summ.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summ, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(sq1))
        self.wait(0.5)
        self.play(Write(sq2))
        self.wait(0.5)
        self.play(Write(sq3))
        self.wait(0.5)
        self.play(Write(sq4))
        self.wait(0.5)
        self.play(FadeIn(s5), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, s_title, summ, box)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch04Kp2WaveInterferencePattern",
        "id": "phys-ch04-4.2-kp2-wave-interference-pattern",
        "chapterId": "ch04",
        "sectionId": "4.2",
        "title": "波的干涉：相位差条件与空间分布",
        "description": "用同心圆波纹动画 + 二维热图展示两相干波源的干涉场，ValueTracker 拖动 P 点实时显示波程差 δ、相位差 Δφ 与合振幅，揭示明暗纹沿双曲线族分布的规律。",
    },
]
