"""第 13.1 节 · 比结合能曲线与核稳定性（知识点 KP3）。

动画结构：
  Step 1  标题 + 副标题
  Step 2  生活类比（化学键 vs 核子结合）
  Step 3  结合能定义逐行出现（质量亏损公式）
  Step 4  坐标系建立 + 逐点描绘比结合能曲线
  Step 5  A≈56 (Fe) 峰值高亮 + 标注
  Step 6  左侧轻核区（聚变箭头）
  Step 7  右侧重核区（裂变箭头）
  Step 8  ValueTracker 点击核素 → 显示具体数值（⁴He）
  Step 9  核反应 vs 化学反应能量密度对比
  Step 10 小结卡（关键公式 + 方框）

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 比结合能数据（MeV/核子）：质量数 A → ε(A) ──────────────────────────────
# 基于实验数据的分段近似，用于绘制平滑曲线
def binding_energy_per_nucleon(A):
    """返回质量数 A 对应的比结合能（MeV/核子），分段近似。"""
    if A <= 0:
        return 0.0
    if A == 1:
        return 0.0
    if A == 2:
        return 1.11  # 氘核
    if A == 4:
        return 7.07  # He-4
    # 对大多数中重核用半经验公式近似
    # Bethe-Weizsäcker 简化：ε ≈ a_v - a_s/A^(1/3) - a_c*Z^2/A^(4/3) - a_a*(A-2Z)^2/A^2
    # 这里用更直观的多项式拟合（仅教学目的）
    a_v = 15.85
    a_s = 18.34
    a_c = 0.711
    a_a = 92.86
    # 用 Z ≈ A/2 稳定线近似
    Z = A / 2.0
    epsilon = (a_v
               - a_s / (A ** (1.0/3.0))
               - a_c * Z * Z / (A ** (4.0/3.0))
               - a_a * (A - 2*Z)**2 / A**2)
    # 偶偶核对力修正（简化：忽略奇偶修正，轻核手动修正）
    if A < 8:
        epsilon = max(epsilon, 0.0)
    return max(epsilon, 0.0)


class Ch13Kp3BindingEnergyCurve(Scene):
    def construct(self):

        # ── Step 1: 标题 ─────────────────────────────────────────────────────
        title = Text("比结合能曲线与核稳定性", font=CJK, color=BLUE).scale(0.65)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第 13 章 原子核和放射性  ·  13.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────────
        ana1 = Text("化学反应：打断原子间化学键，能量变化约 几 eV", font=CJK).scale(0.44)
        ana2 = Text("核反应：  打断核子间强力结合，能量变化约 几 MeV", font=CJK).scale(0.44)
        ana3 = Text("—— 相差约 100 万倍！这股能量来自哪里？", font=CJK, color=YELLOW).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 结合能定义（逐步）────────────────────────────────────────
        def_title = Text("结合能与比结合能的定义", font=CJK, color=CYAN).scale(0.48)
        def_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_title))
        self.wait(0.5)

        # 质量亏损公式
        eq1 = MathTex(
            r"\Delta m",
            r"=",
            r"Z m_p + (A-Z) m_n - m_d"
        ).scale(0.75)
        eq1[0].set_color(YELLOW)
        eq1[2].set_color(ORANGE)
        eq1.next_to(def_title, DOWN, buff=0.45)

        label1 = VGroup(
            Text("质量亏损", font=CJK, color=YELLOW).scale(0.38),
            Text("Z 质子数，A 质量数，", font=CJK).scale(0.38),
            Text("m_p 质子质量，m_n 中子质量，m_d 核素质量", font=CJK).scale(0.38),
        ).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        label1.next_to(eq1, DOWN, buff=0.28)
        label1.scale_to_fit_width(12)

        self.play(Write(eq1))
        self.play(FadeIn(label1))
        self.wait(1.2)

        # 结合能公式
        eq2 = MathTex(r"\Delta E = \Delta m \cdot c^2").scale(0.75)
        eq2.set_color(GREEN)
        eq2.next_to(label1, DOWN, buff=0.38)
        self.play(Write(eq2))
        self.wait(0.8)

        # 单位换算
        eq3 = MathTex(r"\Delta E(\mathrm{MeV}) = 931.5 \times \Delta m(\mathrm{u})").scale(0.72)
        eq3.set_color(CYAN)
        eq3.next_to(eq2, DOWN, buff=0.28)
        self.play(Write(eq3))
        self.wait(0.8)

        # 比结合能
        eq4 = MathTex(r"\varepsilon = \frac{\Delta E}{A}").scale(0.82)
        eq4.set_color(YELLOW)
        eq4_label = VGroup(
            Text("比结合能", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"(\mathrm{MeV/nucleon})").scale(0.55),
        ).arrange(RIGHT, buff=0.18)
        eq_row = VGroup(eq4, eq4_label).arrange(RIGHT, buff=0.5)
        eq_row.next_to(eq3, DOWN, buff=0.32)
        self.play(Write(eq4), FadeIn(eq4_label))
        self.wait(1.5)

        self.play(FadeOut(VGroup(def_title, eq1, label1, eq2, eq3, eq_row)))

        # ── Step 4: 坐标系建立 + 逐点描绘比结合能曲线 ───────────────────────
        axes = Axes(
            x_range=[0, 250, 50],
            y_range=[0, 10, 2],
            x_length=10.5,
            y_length=4.5,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 2},
            x_axis_config={"numbers_to_include": [50, 100, 150, 200]},
            y_axis_config={"numbers_to_include": [2, 4, 6, 8]},
        ).shift(DOWN * 0.8)

        x_label = VGroup(
            Text("质量数", font=CJK).scale(0.38),
            MathTex(r"A").scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        x_label.next_to(axes.x_axis.get_end(), DOWN + RIGHT, buff=0.1)

        y_label = VGroup(
            Text("比结合能", font=CJK).scale(0.38),
            MathTex(r"\varepsilon\,(\mathrm{MeV/nucleon})").scale(0.48),
        ).arrange(DOWN, buff=0.1)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))
        self.wait(0.8)

        # 绘制比结合能曲线（逐点描绘动画）
        # 生成平滑曲线数据点
        A_values = list(range(2, 241))

        # 特殊手动修正点，让曲线更符合物理事实
        manual = {
            2: 1.11,
            3: 2.57,
            4: 7.07,
            6: 5.33,
            7: 5.61,
            8: 7.06,
            12: 7.68,
            14: 7.52,
            16: 7.98,
            20: 8.03,
            40: 8.60,
            56: 8.79,
            60: 8.78,
            80: 8.71,
            100: 8.60,
            120: 8.50,
            140: 8.37,
            160: 8.21,
            180: 7.98,
            200: 7.87,
            208: 7.87,
            235: 7.59,
            238: 7.57,
        }

        def eps(A):
            if A in manual:
                return manual[A]
            if A < 2:
                return 0.0
            # 线性插值 manual 点之间
            keys = sorted(manual.keys())
            if A < keys[0]:
                return manual[keys[0]] * A / keys[0]
            if A > keys[-1]:
                return manual[keys[-1]]
            for i in range(len(keys)-1):
                if keys[i] <= A <= keys[i+1]:
                    t = (A - keys[i]) / (keys[i+1] - keys[i])
                    return manual[keys[i]] * (1-t) + manual[keys[i+1]] * t
            return 0.0

        # 用 axes.plot 生成曲线（连续函数近似）
        def eps_func(A):
            return eps(int(round(A)))

        curve = axes.plot(
            eps_func,
            x_range=[2, 240, 1],
            color=YELLOW,
            stroke_width=2.8,
        )
        self.play(Create(curve), run_time=3.5, rate_func=linear)
        self.wait(1.0)

        # ── Step 5: Fe-56 峰值高亮 ──────────────────────────────────────────
        fe_A = 56
        fe_eps = 8.79
        fe_point = Dot(axes.c2p(fe_A, fe_eps), color=RED, radius=0.12)
        fe_vline = DashedLine(
            axes.c2p(fe_A, 0),
            axes.c2p(fe_A, fe_eps),
            color=RED,
            stroke_width=1.8,
        )
        fe_hline = DashedLine(
            axes.c2p(0, fe_eps),
            axes.c2p(fe_A, fe_eps),
            color=RED,
            stroke_width=1.8,
        )

        fe_label_top = VGroup(
            MathTex(r"^{56}_{26}\mathrm{Fe}", color=RED).scale(0.65),
            MathTex(r"\varepsilon_{\max}\approx 8.8\,\mathrm{MeV}", color=RED).scale(0.58),
        ).arrange(DOWN, buff=0.15)
        fe_label_top.next_to(fe_point, UP + RIGHT, buff=0.18)

        self.play(Create(fe_vline), Create(fe_hline))
        self.play(FadeIn(fe_point), FadeIn(fe_label_top))
        self.wait(1.5)

        # ── Step 6: 轻核区（聚变箭头）──────────────────────────────────────
        fusion_start = axes.c2p(10, 6.2)
        fusion_end   = axes.c2p(44, 8.5)
        fusion_arrow = Arrow(
            fusion_start, fusion_end,
            color=GREEN, stroke_width=3,
            max_tip_length_to_length_ratio=0.18,
        )
        fusion_label = VGroup(
            Text("轻核区", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\mathrm{H,\ D,\ He}", color=GREEN).scale(0.50),
        ).arrange(DOWN, buff=0.08)
        fusion_label.move_to(axes.c2p(8, 7.3))

        fusion_action = Text("聚变 → 释放能量", font=CJK, color=GREEN).scale(0.40)
        fusion_action.next_to(fusion_label, DOWN, buff=0.15)

        self.play(GrowArrow(fusion_arrow))
        self.play(FadeIn(fusion_label), FadeIn(fusion_action))
        self.wait(1.5)

        # ── Step 7: 重核区（裂变箭头）──────────────────────────────────────
        fission_start = axes.c2p(225, 6.5)
        fission_end   = axes.c2p(170, 8.2)
        fission_arrow = Arrow(
            fission_start, fission_end,
            color=ORANGE, stroke_width=3,
            max_tip_length_to_length_ratio=0.18,
        )
        fission_label = VGroup(
            Text("重核区", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"\mathrm{U,\ Th}", color=ORANGE).scale(0.50),
        ).arrange(DOWN, buff=0.08)
        fission_label.move_to(axes.c2p(218, 7.5))

        fission_action = Text("裂变 → 释放能量", font=CJK, color=ORANGE).scale(0.40)
        fission_action.next_to(fission_label, DOWN, buff=0.15)

        self.play(GrowArrow(fission_arrow))
        self.play(FadeIn(fission_label), FadeIn(fission_action))
        self.wait(1.5)

        # ── Step 8: 具体核素数值（⁴He 为例）──────────────────────────────
        # 先淡出坐标系区域注释，保留曲线和轴
        self.play(
            FadeOut(VGroup(fusion_arrow, fusion_label, fusion_action,
                           fission_arrow, fission_label, fission_action,
                           fe_vline, fe_hline, fe_label_top))
        )

        # He-4 数据点
        he_A, he_eps = 4, 7.07
        he_point = Dot(axes.c2p(he_A, he_eps), color=CYAN, radius=0.13)
        he_tracker = ValueTracker(he_A)

        # 计算框显示在右上角
        calc_box_bg = Rectangle(width=5.2, height=3.2, color=BLUE, fill_opacity=0.12,
                                 stroke_width=1.5)
        calc_box_bg.to_corner(UR, buff=0.22)

        he_title = VGroup(
            Text("核素示例：", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"^{4}_{2}\mathrm{He}", color=CYAN).scale(0.65),
        ).arrange(RIGHT, buff=0.12)
        he_title.move_to(calc_box_bg.get_top() + DOWN * 0.38)

        dm_line = VGroup(
            Text("质量亏损：", font=CJK).scale(0.38),
            MathTex(r"\Delta m = 0.0304\,\mathrm{u}", color=YELLOW).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        dm_line.next_to(he_title, DOWN, buff=0.22)

        de_line = VGroup(
            Text("结合能：", font=CJK).scale(0.38),
            MathTex(r"\Delta E = 28.3\,\mathrm{MeV}", color=GREEN).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        de_line.next_to(dm_line, DOWN, buff=0.18)

        eps_line = VGroup(
            Text("比结合能：", font=CJK).scale(0.38),
            MathTex(r"\varepsilon = 28.3/4 = 7.07\,\mathrm{MeV}", color=ORANGE).scale(0.52),
        ).arrange(RIGHT, buff=0.12)
        eps_line.next_to(de_line, DOWN, buff=0.18)

        calc_group = VGroup(calc_box_bg, he_title, dm_line, de_line, eps_line)
        # 对齐到右上
        calc_group.to_corner(UR, buff=0.22)
        he_title.move_to(calc_box_bg.get_top() + DOWN * 0.42)
        dm_line.next_to(he_title, DOWN, buff=0.22)
        de_line.next_to(dm_line, DOWN, buff=0.18)
        eps_line.next_to(de_line, DOWN, buff=0.18)

        self.play(FadeIn(he_point))
        self.play(FadeIn(calc_box_bg), FadeIn(he_title))
        self.play(FadeIn(dm_line))
        self.wait(0.5)
        self.play(FadeIn(de_line))
        self.wait(0.5)
        self.play(FadeIn(eps_line))
        self.wait(1.8)

        # 再标 Fe-56 对比
        fe_calc_bg = Rectangle(width=5.2, height=2.6, color=RED, fill_opacity=0.10,
                                stroke_width=1.5)
        fe_calc_title = VGroup(
            Text("核素示例：", font=CJK, color=RED).scale(0.42),
            MathTex(r"^{56}_{26}\mathrm{Fe}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.12)

        fe_de_line = VGroup(
            Text("结合能：", font=CJK).scale(0.38),
            MathTex(r"\Delta E \approx 492\,\mathrm{MeV}", color=RED).scale(0.55),
        ).arrange(RIGHT, buff=0.12)
        fe_eps_line = VGroup(
            Text("比结合能：", font=CJK).scale(0.38),
            MathTex(r"\varepsilon \approx 8.79\,\mathrm{MeV}", color=RED).scale(0.52),
        ).arrange(RIGHT, buff=0.12)

        fe_calc_group = VGroup(fe_calc_bg, fe_calc_title, fe_de_line, fe_eps_line)
        fe_calc_group.arrange(DOWN, buff=0.22)
        fe_calc_group.to_corner(UR, buff=0.22)
        fe_calc_bg.stretch_to_fit_width(5.2)
        fe_calc_group.to_corner(UR, buff=0.22)

        self.play(FadeOut(calc_group), FadeOut(he_point))
        fe_point2 = Dot(axes.c2p(56, 8.79), color=RED, radius=0.13)
        self.play(FadeIn(fe_point2))
        self.play(FadeIn(fe_calc_bg), FadeIn(fe_calc_title))
        self.play(FadeIn(fe_de_line))
        self.play(FadeIn(fe_eps_line))
        self.wait(1.8)
        self.play(FadeOut(VGroup(fe_calc_bg, fe_calc_title, fe_de_line, fe_eps_line, fe_point2)))

        # ── Step 9: 核反应 vs 化学反应能量密度对比 ───────────────────────────
        self.play(FadeOut(VGroup(curve, axes, x_label, y_label, fe_point)))

        cmp_title = Text("核能 vs 化学能：数量级差异的根源", font=CJK, color=YELLOW).scale(0.52)
        cmp_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(cmp_title))
        self.wait(0.5)

        # 表格式对比
        row1 = VGroup(
            Text("化学反应（断化学键）：", font=CJK).scale(0.42),
            MathTex(r"\sim 1 \text{--} 10\,\mathrm{eV/molecule}", color=WHITE).scale(0.60),
        ).arrange(RIGHT, buff=0.3)

        row2 = VGroup(
            Text("核反应（核子结合能）：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\sim 1 \text{--} 10\,\mathrm{MeV/nucleon}", color=GREEN).scale(0.60),
        ).arrange(RIGHT, buff=0.3)

        ratio_line = VGroup(
            Text("能量密度之比：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\frac{1\,\mathrm{MeV}}{1\,\mathrm{eV}} = 10^6", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.3)

        source_line = Text(
            "根源：质量亏损 Δm 经 E = Δmc² 转化为能量，强力结合远比电磁力结合紧密",
            font=CJK, color=CYAN
        ).scale(0.40)

        cmp_group = VGroup(row1, row2, ratio_line, source_line).arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        cmp_group.next_to(cmp_title, DOWN, buff=0.52)
        cmp_group.scale_to_fit_width(12.5)

        self.play(FadeIn(row1))
        self.wait(0.8)
        self.play(FadeIn(row2))
        self.wait(0.8)
        self.play(Write(ratio_line))
        self.wait(1.0)
        self.play(FadeIn(source_line))
        self.wait(2.0)
        self.play(FadeOut(VGroup(cmp_title, cmp_group)))

        # ── Step 10: 小结卡 ──────────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("比结合能：", font=CJK, color=CYAN).scale(0.42),
            MathTex(r"\varepsilon = \Delta E / A = 931.5\,\Delta m / A\quad(\mathrm{MeV/nucleon})",
                    color=YELLOW).scale(0.60),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("峰值：", font=CJK, color=RED).scale(0.42),
            MathTex(r"^{56}\mathrm{Fe}\quad \varepsilon_{\max}\approx 8.8\,\mathrm{MeV}", color=RED).scale(0.65),
            Text("（最稳定）", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("轻核聚变 / 重核裂变", font=CJK, color=GREEN).scale(0.44),
            Text("→ 均向峰值靠拢 → 释放能量", font=CJK, color=GREEN).scale(0.44),
        ).arrange(RIGHT, buff=0.15)

        s4 = VGroup(
            Text("能量来源：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"\Delta E = \Delta m \cdot c^2", color=ORANGE).scale(0.68),
            Text("（质量亏损 × 光速²）", font=CJK, color=ORANGE).scale(0.42),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.8)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s1))
        self.wait(0.6)
        self.play(FadeIn(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch13Kp3BindingEnergyCurve",
        "id": "phys-ch13-13.1-kp3-binding-energy-curve",
        "chapterId": "ch13",
        "sectionId": "13.1",
        "title": "比结合能曲线与核稳定性",
        "description": "绘制比结合能 ε(A) 曲线，标注 Fe-56 峰值，用彩色箭头演示轻核聚变与重核裂变均向峰值靠拢从而释放能量，并对比核能与化学能的数量级差异。",
    },
]
