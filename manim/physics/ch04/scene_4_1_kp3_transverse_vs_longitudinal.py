"""第 4.1 节 · 横波与纵波：振动方向可视化

可视化方案：
  左侧 — 横波：质点沿 y 方向 SHM，彩色箭头指示振动方向，波形向右推进。
  右侧 — 纵波：质点沿 x 方向疏密振动，颜色深浅表示密度，疏密图案向右推进。
  最终 — 判断框：振动⊥传播=横波，振动∥传播=纵波。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 波参数
A_T = 0.55        # 横波振幅（y 方向）
A_L = 0.40        # 纵波振幅（x 方向）
K   = 1.0         # 波数
OMEGA = 1.4       # 角频率
N_PARTICLES = 14  # 每侧质点数
SPACING = 0.52    # 质点间距


def transverse_y(x0: float, t: float) -> float:
    """横波：质点 x0 处的 y 偏移"""
    return A_T * math.sin(K * x0 - OMEGA * t)


def longitudinal_dx(x0: float, t: float) -> float:
    """纵波：质点 x0 处的 x 偏移"""
    return A_L * math.sin(K * x0 - OMEGA * t)


class Ch04Kp3TransverseVsLongitudinal(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("横波与纵波：振动方向可视化", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("抖绳子：波沿绳子跑，绳上每点却只是上下振动——这是横波。",
                    font=CJK).scale(0.44)
        ana2 = Text("推弹簧：波沿弹簧传播，每圈却只是前后压缩——这是纵波。",
                    font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 定义（逐行出现）────────────────────────────────────
        def_label = Text("定义", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.42)
        d1 = VGroup(
            Text("横波：", font=CJK, color=YELLOW).scale(0.46),
            Text("质点振动方向", font=CJK, color=YELLOW).scale(0.46),
            Text("垂直于", font=CJK).scale(0.46),
            Text("波的传播方向", font=CJK, color=CYAN).scale(0.46),
        ).arrange(RIGHT, buff=0.12)
        d2 = VGroup(
            Text("纵波：", font=CJK, color=ORANGE).scale(0.46),
            Text("质点振动方向", font=CJK, color=ORANGE).scale(0.46),
            Text("平行于", font=CJK).scale(0.46),
            Text("波的传播方向", font=CJK, color=CYAN).scale(0.46),
        ).arrange(RIGHT, buff=0.12)
        defs = VGroup(d1, d2).arrange(DOWN, buff=0.35).next_to(def_label, DOWN, buff=0.35)
        self.play(FadeIn(def_label))
        self.play(FadeIn(d1))
        self.wait(0.8)
        self.play(FadeIn(d2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_label, defs)))

        # ── Step 4: 双侧演示框架 ────────────────────────────────────────
        # 左侧标签（横波）
        lbl_t = Text("横波", font=CJK, color=YELLOW).scale(0.5).move_to([-4.2, 2.5, 0])
        # 右侧标签（纵波）
        lbl_l = Text("纵波", font=CJK, color=ORANGE).scale(0.5).move_to([2.0, 2.5, 0])
        # 中间分隔线
        divider = DashedLine(
            start=[0.0, 2.8, 0], end=[0.0, -3.2, 0],
            color=GRAY, stroke_width=1.5
        )
        self.play(FadeIn(lbl_t), FadeIn(lbl_l), Create(divider))

        # ── Step 5: 横波质点动画 ────────────────────────────────────────
        # 质点 x 坐标（屏幕左侧居中）
        t_x0 = [-3.8 + i * SPACING for i in range(N_PARTICLES)]
        t_y_base = 0.2   # 质点平衡位置 y

        time_tracker = ValueTracker(0.0)

        # 横波质点（用 always_redraw 驱动）
        def make_transverse_dot(x0):
            return always_redraw(
                lambda: Dot(
                    point=np.array([x0, t_y_base + transverse_y(x0, time_tracker.get_value()), 0]),
                    radius=0.10,
                    color=YELLOW,
                )
            )

        t_dots = VGroup(*[make_transverse_dot(x0) for x0 in t_x0])

        # 横波振动箭头（指示每个质点速度方向：速度 = dA*sin/dt）
        def make_transverse_arrow(x0):
            def _arr():
                t_val = time_tracker.get_value()
                vy = A_T * OMEGA * math.cos(K * x0 - OMEGA * t_val)  # 速度
                base_y = t_y_base + transverse_y(x0, t_val)
                tip_y = base_y + 0.32 * (1 if vy >= 0 else -1)
                c = GREEN if vy >= 0 else RED
                length = min(abs(vy) / (A_T * OMEGA) * 0.35 + 0.04, 0.38)
                if abs(vy) < 0.03:
                    return VGroup()
                return Arrow(
                    start=[x0, base_y, 0],
                    end=[x0, base_y + length * (1 if vy >= 0 else -1), 0],
                    color=c, stroke_width=2.5, max_tip_length_to_length_ratio=0.5, buff=0,
                )
            return always_redraw(_arr)

        t_arrows = VGroup(*[make_transverse_arrow(x0) for x0 in t_x0])

        # 横波传播方向箭头（固定，底部）
        t_prop_arrow = Arrow(
            start=[-4.0, -0.85, 0], end=[-1.8, -0.85, 0],
            color=CYAN, stroke_width=2.5, buff=0
        )
        t_prop_lbl = Text("传播方向", font=CJK, color=CYAN).scale(0.37).next_to(t_prop_arrow, DOWN, buff=0.1)

        # 横波振动方向示意（静态双向箭头）
        t_vib_arrow = DoubleArrow(
            start=[-4.6, -0.1, 0], end=[-4.6, 0.5, 0],
            color=YELLOW, stroke_width=2.5, buff=0
        )
        t_vib_lbl = Text("振动\n方向", font=CJK, color=YELLOW).scale(0.3).next_to(t_vib_arrow, LEFT, buff=0.08)

        self.play(
            Create(t_dots),
            FadeIn(t_prop_arrow), FadeIn(t_prop_lbl),
            FadeIn(t_vib_arrow), FadeIn(t_vib_lbl),
        )
        self.play(Create(t_arrows))

        # ── Step 6: 纵波质点动画 ────────────────────────────────────────
        l_x_base = [1.5 + i * SPACING for i in range(N_PARTICLES)]
        l_y_base = 0.2  # 质点平衡 y 位置

        def make_longitudinal_dot(i, x0):
            def _dot():
                t_val = time_tracker.get_value()
                dx = longitudinal_dx(x0, t_val)
                # 颜色：根据局部压缩程度
                # 局部密度 ∝ -∂(dx)/∂x = A_L * K * cos(K*x0 - ω*t)
                compress = A_L * K * math.cos(K * x0 - OMEGA * t_val)
                # compress > 0 → 密（深色），compress < 0 → 疏（浅色）
                frac = max(0.0, min(1.0, (compress + A_L * K) / (2 * A_L * K)))
                # 从浅蓝→深橙渐变
                r = int(255 * frac)
                g = int(140 * frac)
                b = int(255 * (1 - frac))
                col = f"#{r:02x}{g:02x}{b:02x}"
                return Dot(
                    point=np.array([x0 + dx, l_y_base, 0]),
                    radius=0.10,
                    color=col,
                )
            return always_redraw(_dot)

        l_dots = VGroup(*[make_longitudinal_dot(i, x0) for i, x0 in enumerate(l_x_base)])

        # 纵波传播方向箭头
        l_prop_arrow = Arrow(
            start=[1.5, -0.85, 0], end=[3.7, -0.85, 0],
            color=CYAN, stroke_width=2.5, buff=0
        )
        l_prop_lbl = Text("传播方向", font=CJK, color=CYAN).scale(0.37).next_to(l_prop_arrow, DOWN, buff=0.1)

        # 纵波振动方向示意
        l_vib_arrow = DoubleArrow(
            start=[4.4, 0.1, 0], end=[5.2, 0.1, 0],
            color=ORANGE, stroke_width=2.5, buff=0
        )
        l_vib_lbl = Text("振动\n方向", font=CJK, color=ORANGE).scale(0.3).next_to(l_vib_arrow, UP, buff=0.06)

        # 疏密图例
        dense_lbl = VGroup(
            Dot(color=ORANGE, radius=0.10).scale(1.2),
            Text("密部", font=CJK, color=ORANGE).scale(0.35),
        ).arrange(RIGHT, buff=0.12)
        sparse_lbl = VGroup(
            Dot(color="#3030ff", radius=0.10).scale(1.2),
            Text("疏部", font=CJK, color="#6060ff").scale(0.35),
        ).arrange(RIGHT, buff=0.12)
        legend = VGroup(dense_lbl, sparse_lbl).arrange(DOWN, buff=0.18).move_to([4.8, 1.5, 0])

        self.play(
            Create(l_dots),
            FadeIn(l_prop_arrow), FadeIn(l_prop_lbl),
            FadeIn(l_vib_arrow), FadeIn(l_vib_lbl),
            FadeIn(legend),
        )
        self.wait(0.5)

        # ── Step 7: 时间推进（2 个周期）────────────────────────────────
        T = 2 * math.pi / OMEGA
        cap = Text("波形向右传播，各质点各自原地振动", font=CJK, color=GREEN).scale(0.42)
        cap.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(cap))
        self.play(
            time_tracker.animate.set_value(2 * T),
            run_time=7,
            rate_func=linear,
        )
        self.wait(0.5)
        self.play(FadeOut(cap))

        # ── Step 8: 波速公式引入 ────────────────────────────────────────
        # 清除双侧箭头/标签，保留质点动画继续跑
        self.play(
            FadeOut(VGroup(t_prop_arrow, t_prop_lbl, t_vib_arrow, t_vib_lbl,
                           l_prop_arrow, l_prop_lbl, l_vib_arrow, l_vib_lbl,
                           legend, divider, lbl_t, lbl_l))
        )
        self.play(
            time_tracker.animate.set_value(4 * T),
            run_time=2,
            rate_func=linear,
        )

        # 波速公式区域（底部）
        spd_label = Text("波速公式", font=CJK, color=BLUE).scale(0.48).move_to([0, -1.5, 0])
        spd_t = VGroup(
            Text("横波（固体中）：", font=CJK, color=YELLOW).scale(0.42),
            MathTex(r"u=\sqrt{\dfrac{G}{\rho}}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.2)
        spd_l = VGroup(
            Text("纵波（流体/固体）：", font=CJK, color=ORANGE).scale(0.42),
            MathTex(r"u=\sqrt{\dfrac{B}{\rho}}", color=ORANGE).scale(0.75),
        ).arrange(RIGHT, buff=0.2)
        spd = VGroup(spd_t, spd_l).arrange(DOWN, buff=0.32).move_to([0, -2.1, 0])
        spd.scale_to_fit_width(11.5)
        self.play(FadeIn(spd_label))
        self.play(Write(spd_t[1]), FadeIn(spd_t[0]))
        self.wait(0.6)
        self.play(Write(spd_l[1]), FadeIn(spd_l[0]))
        self.wait(1.2)

        note_G = VGroup(
            Text("G=", font=CJK).scale(0.36),
            Text("切变模量（横波专有）", font=CJK, color=YELLOW).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        note_B = VGroup(
            Text("B=", font=CJK).scale(0.36),
            Text("体积弹性模量", font=CJK, color=ORANGE).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        note_rho = VGroup(
            MathTex(r"\rho=").scale(0.5),
            Text("介质密度", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.1)
        notes = VGroup(note_G, note_B, note_rho).arrange(RIGHT, buff=0.5).move_to([0, -3.2, 0])
        notes.scale_to_fit_width(11.5)
        self.play(FadeIn(notes))
        self.wait(1.5)

        # 全清
        self.play(FadeOut(VGroup(
            t_dots, t_arrows, l_dots,
            spd_label, spd, notes, title
        )))
        self.wait(0.3)

        # ── Step 9: 小结判断框 ─────────────────────────────────────────
        sum_title = Text("核心判断口诀", font=CJK, color=BLUE).scale(0.55).to_edge(UP)
        self.play(Write(sum_title))

        # 横波判断框
        card_t_line1 = Text("振动方向", font=CJK, color=YELLOW).scale(0.52)
        card_t_op    = MathTex(r"\perp").scale(1.0).set_color(WHITE)
        card_t_line2 = Text("传播方向", font=CJK, color=CYAN).scale(0.52)
        card_t_eq    = VGroup(card_t_line1, card_t_op, card_t_line2).arrange(RIGHT, buff=0.2)
        card_t_result = Text("= 横波", font=CJK, color=YELLOW).scale(0.52)
        card_t_full = VGroup(card_t_eq, card_t_result).arrange(RIGHT, buff=0.25)
        box_t = SurroundingRectangle(card_t_full, color=YELLOW, buff=0.28, corner_radius=0.12)
        grp_t = VGroup(card_t_full, box_t)

        # 纵波判断框
        card_l_line1 = Text("振动方向", font=CJK, color=ORANGE).scale(0.52)
        card_l_op    = MathTex(r"\parallel").scale(1.0).set_color(WHITE)
        card_l_line2 = Text("传播方向", font=CJK, color=CYAN).scale(0.52)
        card_l_eq    = VGroup(card_l_line1, card_l_op, card_l_line2).arrange(RIGHT, buff=0.2)
        card_l_result = Text("= 纵波", font=CJK, color=ORANGE).scale(0.52)
        card_l_full = VGroup(card_l_eq, card_l_result).arrange(RIGHT, buff=0.25)
        box_l = SurroundingRectangle(card_l_full, color=ORANGE, buff=0.28, corner_radius=0.12)
        grp_l = VGroup(card_l_full, box_l)

        cards = VGroup(grp_t, grp_l).arrange(DOWN, buff=0.55).next_to(sum_title, DOWN, buff=0.6)
        cards.scale_to_fit_width(10)

        self.play(FadeIn(grp_t))
        self.wait(0.8)
        self.play(FadeIn(grp_l))
        self.wait(1.0)

        # ── Step 10: 补充速度公式小结 ──────────────────────────────────
        sum_spd = VGroup(
            MathTex(r"u_{\text{transverse}}=\sqrt{G/\rho}", color=YELLOW).scale(0.72),
            MathTex(r"u_{\text{longitudinal}}=\sqrt{B/\rho}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.6).next_to(cards, DOWN, buff=0.5)
        sum_spd.scale_to_fit_width(10.5)
        box_spd = SurroundingRectangle(sum_spd, color=BLUE, buff=0.22, corner_radius=0.10)
        self.play(Write(sum_spd), Create(box_spd))
        self.wait(0.6)

        # 结论文字
        conclusion = Text(
            "横波只能在固体中传播；纵波可在固、液、气三态中传播",
            font=CJK, color=GREEN
        ).scale(0.42).next_to(box_spd, DOWN, buff=0.35)
        conclusion.scale_to_fit_width(11.5)
        self.play(FadeIn(conclusion))
        self.wait(2.5)

        self.play(FadeOut(VGroup(sum_title, cards, sum_spd, box_spd, conclusion)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch04Kp3TransverseVsLongitudinal",
        "id": "phys-ch04-4.1-kp3-transverse-vs-longitudinal",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "横波与纵波：振动方向可视化",
        "description": "左侧演示横波质点上下振动、右侧演示纵波疏密前进，最终定格横波/纵波判断口诀与波速公式。",
    },
]
