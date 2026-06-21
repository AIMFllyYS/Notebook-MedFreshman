"""第 2.3 节 · 例题精讲：小动脉层流最大流速（雷诺数约束）

通过雷诺数判据 Re = ρvr/η < 1000，推导小动脉（r = 3 mm）维持层流所允许的
最大流速，并用动态仪表盘直观展示临界条件。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 常量（与题目对应） ──────────────────────────────────────────────────────
RHO = 1.05e3          # kg/m³  血液密度
ETA = 3.0e-3          # Pa·s   血液粘度
R_MM = 3.0            # mm     小动脉半径
R_M = R_MM * 1e-3     # m
RE_CRIT = 1000.0
V_MAX = ETA * RE_CRIT / (RHO * R_M)   # ≈ 0.952 m/s


class Ch02Ex2MaxVelocityArteryReynolds(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("小动脉层流最大流速", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        sub = Text("第二章 流体运动 · 2.3  例题精讲", font=CJK, color=WHITE).scale(0.42)
        sub.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2  生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("血液在小动脉中流动，若流速过快，", font=CJK).scale(0.48)
        ana2 = Text("层流就会破裂为混乱的湍流——", font=CJK).scale(0.48)
        ana3 = Text("雷诺数正是判断「层流 / 湍流」的临界指标。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.2)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3  已知量列表
        # ══════════════════════════════════════════════════════════════════════
        known_title = Text("已知条件", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        k1 = VGroup(Text("血液密度  ", font=CJK).scale(0.45),
                    MathTex(r"\rho = 1.05\times10^{3}\ \mathrm{kg/m^3}", color=YELLOW).scale(0.72)
                    ).arrange(RIGHT, buff=0.12)
        k2 = VGroup(Text("血液粘度  ", font=CJK).scale(0.45),
                    MathTex(r"\eta = 3.0\times10^{-3}\ \mathrm{Pa\cdot s}", color=YELLOW).scale(0.72)
                    ).arrange(RIGHT, buff=0.12)
        k3 = VGroup(Text("小动脉半径  ", font=CJK).scale(0.45),
                    MathTex(r"r = 3\times10^{-3}\ \mathrm{m}", color=YELLOW).scale(0.72)
                    ).arrange(RIGHT, buff=0.12)
        k4 = VGroup(Text("层流判据  ", font=CJK).scale(0.45),
                    MathTex(r"Re < 1000", color=GREEN).scale(0.72)
                    ).arrange(RIGHT, buff=0.12)
        known = VGroup(k1, k2, k3, k4).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        known.next_to(known_title, DOWN, buff=0.35)
        self.play(FadeIn(known_title))
        for item in [k1, k2, k3, k4]:
            self.play(FadeIn(item))
            self.wait(0.6)
        self.wait(1.4)
        self.play(FadeOut(VGroup(known_title, known)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4  雷诺数公式定义
        # ══════════════════════════════════════════════════════════════════════
        re_title = Text("雷诺数公式", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        re_def = MathTex(r"Re = \frac{\rho\, v\, r}{\eta}", color=WHITE).scale(1.15)
        re_def.next_to(re_title, DOWN, buff=0.45)
        # 高亮各物理量
        re_def[0][0].set_color(CYAN)    # Re
        re_def[0][3].set_color(YELLOW)  # ρ
        re_def[0][4].set_color(ORANGE)  # v
        re_def[0][5].set_color(GREEN)   # r
        re_def[0][7].set_color(RED)     # η

        legend = VGroup(
            VGroup(Text("Re ", font=CJK, color=CYAN).scale(0.42),
                   Text("雷诺数（无量纲）", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\rho", color=YELLOW).scale(0.7),
                   Text(" 密度", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"v", color=ORANGE).scale(0.7),
                   Text(" 流速", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"r", color=GREEN).scale(0.7),
                   Text(" 管半径", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
            VGroup(MathTex(r"\eta", color=RED).scale(0.7),
                   Text(" 粘度", font=CJK).scale(0.42)).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        legend.next_to(re_def, DOWN, buff=0.45)

        self.play(FadeIn(re_title))
        self.play(Write(re_def))
        self.wait(0.8)
        self.play(FadeIn(legend))
        self.wait(1.8)
        self.play(FadeOut(VGroup(re_title, legend)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 5  推导：由 Re < 1000 → v_max（逐步代入）
        # ══════════════════════════════════════════════════════════════════════
        deriv_title = Text("推导最大流速", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(re_def.animate.scale(0.85).next_to(deriv_title, DOWN, buff=0.4),
                  FadeIn(deriv_title))
        self.wait(0.8)

        # 步骤①
        step1 = MathTex(r"Re < 1000 \quad \Rightarrow \quad \frac{\rho\, v\, r}{\eta} < 1000",
                        color=WHITE).scale(0.82)
        step1.next_to(re_def, DOWN, buff=0.35)
        self.play(Write(step1))
        self.wait(1.2)

        # 步骤②
        step2 = MathTex(r"v < \frac{1000\,\eta}{\rho\, r}", color=YELLOW).scale(0.92)
        step2.next_to(step1, DOWN, buff=0.35)
        self.play(TransformMatchingTex(step1.copy(), step2))
        self.wait(1.2)

        # 步骤③ 代入数值
        step3_label = Text("代入数值：", font=CJK).scale(0.44)
        step3 = MathTex(
            r"v_{\max} = \frac{1000\times 3.0\times10^{-3}}{1.05\times10^{3}\times 3\times10^{-3}}",
            color=WHITE).scale(0.78)
        step3_row = VGroup(step3_label, step3).arrange(RIGHT, buff=0.18)
        step3_row.next_to(step2, DOWN, buff=0.35)
        self.play(FadeIn(step3_label), Write(step3))
        self.wait(1.4)

        # 步骤④ 结果
        step4 = MathTex(r"v_{\max} \approx 0.95\ \mathrm{m/s}", color=GREEN).scale(1.05)
        step4.next_to(step3_row, DOWN, buff=0.38)
        box4 = SurroundingRectangle(step4, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Write(step4), Create(box4))
        self.wait(2.0)

        # 清场（保留 title）
        self.play(FadeOut(VGroup(deriv_title, re_def, step1, step2, step3_row, step4, box4)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6  动脉截面 + 抛物面速度剖面
        # ══════════════════════════════════════════════════════════════════════
        cross_title = Text("小动脉截面：层流速度剖面", font=CJK, color=BLUE).scale(0.50)
        cross_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(cross_title))

        # 动脉圆形截面（半径 = 1.5 绘图单位 → 对应 3 mm）
        artery_circle = Circle(radius=1.5, color=WHITE, stroke_width=3)
        artery_circle.shift(LEFT * 3.0 + DOWN * 0.5)
        artery_fill = Circle(radius=1.5, color="#330011", fill_opacity=0.35)
        artery_fill.move_to(artery_circle.get_center())

        # 管壁标注
        wall_label = Text("管壁", font=CJK, color=WHITE).scale(0.38)
        wall_label.next_to(artery_circle, RIGHT, buff=0.12)

        # 抛物面速度剖面：轴向箭头，长度 ∝ (R²-y²)/R²
        cx, cy = artery_circle.get_center()[0], artery_circle.get_center()[1]
        R_draw = 1.5
        n_arrows = 9
        profile_arrows = VGroup()
        ys = np.linspace(-R_draw * 0.85, R_draw * 0.85, n_arrows)
        for y_off in ys:
            frac = 1.0 - (y_off / R_draw) ** 2
            length = 1.2 * frac + 0.05
            arr = Arrow(
                start=np.array([cx, cy + y_off, 0]),
                end=np.array([cx + length, cy + y_off, 0]),
                buff=0,
                color=CYAN,
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.22,
            )
            profile_arrows.add(arr)

        # 标注最大速度箭头（中央）
        center_arrow = Arrow(
            start=np.array([cx, cy, 0]),
            end=np.array([cx + 1.26, cy, 0]),
            buff=0,
            color=YELLOW,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.22,
        )
        vmax_label = VGroup(
            MathTex(r"v_{\max}", color=YELLOW).scale(0.62),
            Text("（中心最大）", font=CJK, color=YELLOW).scale(0.36),
        ).arrange(RIGHT, buff=0.08)
        vmax_label.next_to(center_arrow, UP, buff=0.08)

        self.play(Create(artery_fill), Create(artery_circle), FadeIn(wall_label))
        self.play(Create(profile_arrows))
        self.play(Create(center_arrow), FadeIn(vmax_label))
        self.wait(1.8)

        # 文字说明
        parab_note = Text("流速从管壁(=0)到中心呈抛物线分布", font=CJK, color=WHITE).scale(0.40)
        parab_note.next_to(artery_circle, DOWN, buff=0.35)
        self.play(FadeIn(parab_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(cross_title, artery_fill, artery_circle, wall_label,
                                 profile_arrows, center_arrow, vmax_label, parab_note)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7  动态雷诺数仪表盘：ValueTracker 扫动 v
        # ══════════════════════════════════════════════════════════════════════
        dash_title = Text("雷诺数仪表盘：拖动流速观察层流/湍流临界", font=CJK, color=BLUE).scale(0.46)
        dash_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(dash_title))

        v_tracker = ValueTracker(0.0)

        # ── 水平速度刻度轴 ──────────────────────────────────────────────────
        ax = NumberLine(
            x_range=[0, 1.6, 0.2],
            length=9.0,
            color=WHITE,
            include_numbers=True,
            numbers_to_include=[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6],
            decimal_number_config={"num_decimal_places": 1, "font_size": 22},
        )
        ax.shift(DOWN * 1.0)
        ax_label = VGroup(
            MathTex(r"v\,/", color=WHITE).scale(0.52),
            Text("(m/s)", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.05)
        ax_label.next_to(ax, RIGHT, buff=0.25)

        # 临界速度竖线
        v_crit_x = ax.n2p(V_MAX)[0]
        v_crit_line = DashedLine(
            start=np.array([v_crit_x, ax.get_center()[1] - 0.5, 0]),
            end=np.array([v_crit_x, ax.get_center()[1] + 1.4, 0]),
            color=RED,
            stroke_width=2,
        )
        crit_label = VGroup(
            MathTex(r"v_{\max}", color=RED).scale(0.55),
            Text("≈ 0.95 m/s", font=CJK, color=RED).scale(0.38),
        ).arrange(DOWN, buff=0.05)
        crit_label.next_to(v_crit_line, UP, buff=0.08)

        # ── 层流区（绿）/湍流区（红）填充 ─────────────────────────────────
        y_bar = ax.get_center()[1] + 0.82
        bar_height = 0.38

        # 绿色层流区（静态，始终显示）
        green_rect = Rectangle(
            width=ax.n2p(V_MAX)[0] - ax.n2p(0)[0],
            height=bar_height,
            fill_color=GREEN,
            fill_opacity=0.40,
            stroke_width=0,
        ).move_to(
            np.array([(ax.n2p(0)[0] + ax.n2p(V_MAX)[0]) / 2, y_bar, 0])
        )
        # 红色湍流区（静态，始终显示）
        red_rect = Rectangle(
            width=ax.n2p(1.6)[0] - ax.n2p(V_MAX)[0],
            height=bar_height,
            fill_color=RED,
            fill_opacity=0.35,
            stroke_width=0,
        ).move_to(
            np.array([(ax.n2p(V_MAX)[0] + ax.n2p(1.6)[0]) / 2, y_bar, 0])
        )
        layer_tag = Text("层流区", font=CJK, color=GREEN).scale(0.38)
        layer_tag.move_to(np.array([(ax.n2p(0)[0] + ax.n2p(V_MAX)[0]) / 2, y_bar, 0]))
        turb_tag = Text("湍流区", font=CJK, color=RED).scale(0.38)
        turb_tag.move_to(np.array([(ax.n2p(V_MAX)[0] + ax.n2p(1.6)[0]) / 2, y_bar, 0]))

        # ── 动态指针（v 的位置）─────────────────────────────────────────────
        pointer = always_redraw(lambda: Triangle(fill_opacity=1, fill_color=WHITE,
                                                  stroke_width=0).scale(0.14).rotate(PI).move_to(
            np.array([ax.n2p(min(v_tracker.get_value(), 1.6))[0],
                      ax.get_center()[1] - 0.28, 0])
        ))

        # ── Re 数值读出 ──────────────────────────────────────────────────────
        def re_color():
            v = v_tracker.get_value()
            re_val = RHO * v * R_M / ETA
            return GREEN if re_val < RE_CRIT else RED

        re_readout = always_redraw(lambda: VGroup(
            Text("Re = ", font=CJK, color=re_color()).scale(0.52),
            MathTex(rf"{RHO * v_tracker.get_value() * R_M / ETA:.0f}", color=re_color()).scale(0.75),
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.55))

        v_readout = always_redraw(lambda: VGroup(
            MathTex(r"v=", color=WHITE).scale(0.55),
            MathTex(rf"{v_tracker.get_value():.2f}\ \mathrm{{m/s}}", color=ORANGE).scale(0.72),
        ).arrange(RIGHT, buff=0.08).next_to(re_readout, DOWN, buff=0.22).align_to(
            re_readout, RIGHT))

        # 显示仪表盘基底
        self.play(Create(ax), FadeIn(ax_label))
        self.play(FadeIn(green_rect), FadeIn(red_rect),
                  FadeIn(layer_tag), FadeIn(turb_tag))
        self.play(Create(v_crit_line), FadeIn(crit_label))
        self.add(pointer, re_readout, v_readout)

        note_sweep = Text("流速从 0 缓慢增大 → Re 穿越 1000 进入湍流区", font=CJK, color=WHITE).scale(0.40)
        note_sweep.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(note_sweep))
        self.wait(0.5)

        # 扫动：0 → 0.60（完全层流）
        self.play(v_tracker.animate.set_value(0.60), run_time=2.0)
        self.wait(0.8)

        # 穿越临界（0.60 → 1.20）
        self.play(v_tracker.animate.set_value(1.20), run_time=2.5)
        self.wait(0.8)

        # 回到临界附近（1.20 → 0.95）
        self.play(v_tracker.animate.set_value(V_MAX), run_time=1.5)
        self.wait(1.4)

        self.play(FadeOut(VGroup(ax, ax_label, green_rect, red_rect, layer_tag, turb_tag,
                                  v_crit_line, crit_label, note_sweep)))
        self.remove(pointer, re_readout, v_readout)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8  完整推导总结（集中展示）
        # ══════════════════════════════════════════════════════════════════════
        sum_title = Text("完整求解过程", font=CJK, color=BLUE).scale(0.52)
        sum_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(sum_title))

        s_re = MathTex(r"Re = \frac{\rho\, v\, r}{\eta} < 1000", color=WHITE).scale(0.82)
        s_solve = MathTex(
            r"v_{\max} = \frac{1000\,\eta}{\rho\, r} = \frac{1000\times3.0\times10^{-3}}{"
            r"1.05\times10^{3}\times3\times10^{-3}}",
            color=WHITE).scale(0.72)
        s_ans = MathTex(r"v_{\max} \approx 0.952\ \mathrm{m/s}", color=GREEN).scale(1.0)
        s_cond = Text("（小动脉中血液保持层流的最大流速约为 0.95 m/s）",
                      font=CJK, color=GREEN).scale(0.40)

        deriv_group = VGroup(s_re, s_solve, s_ans, s_cond).arrange(DOWN, buff=0.38)
        deriv_group.next_to(sum_title, DOWN, buff=0.42)
        deriv_group.scale_to_fit_width(13.0)

        box_ans = SurroundingRectangle(s_ans, color=GREEN, buff=0.18, corner_radius=0.10)

        self.play(Write(s_re))
        self.wait(1.0)
        self.play(Write(s_solve))
        self.wait(1.2)
        self.play(Write(s_ans), Create(box_ans))
        self.wait(0.8)
        self.play(FadeIn(s_cond))
        self.wait(2.0)
        self.play(FadeOut(VGroup(sum_title, deriv_group, box_ans)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9  小结卡
        # ══════════════════════════════════════════════════════════════════════
        fin_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55)
        fin_title.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(fin_title))

        c1_eq = MathTex(r"Re = \frac{\rho v r}{\eta}", color=YELLOW).scale(0.88)
        c2_eq = MathTex(r"v_{\max} = \frac{1000\,\eta}{\rho r} \approx 0.95\ \mathrm{m/s}",
                        color=YELLOW).scale(0.88)
        c3_tx = Text("Re < 1000  →  层流（有序、低阻）", font=CJK, color=GREEN).scale(0.44)
        c4_tx = Text("Re > 1000  →  湍流（混乱、高阻）", font=CJK, color=RED).scale(0.44)
        c5_tx = Text("临床意义：小动脉血流正常处于层流状态，", font=CJK, color=WHITE).scale(0.42)
        c6_tx = Text("流速过高（如动脉狭窄处）可诱发湍流与血管杂音。",
                     font=CJK, color=WHITE).scale(0.42)

        card = VGroup(c1_eq, c2_eq, c3_tx, c4_tx, c5_tx, c6_tx).arrange(DOWN, buff=0.30)
        card.next_to(fin_title, DOWN, buff=0.42)
        card.scale_to_fit_width(13.0)
        box_card = SurroundingRectangle(card, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(Write(c1_eq), Write(c2_eq))
        self.wait(0.8)
        self.play(FadeIn(c3_tx), FadeIn(c4_tx))
        self.wait(0.8)
        self.play(FadeIn(c5_tx), FadeIn(c6_tx))
        self.play(Create(box_card))
        self.wait(2.5)

        self.play(FadeOut(VGroup(fin_title, card, box_card, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch02Ex2MaxVelocityArteryReynolds",
        "id": "phys-ch02-2.3-ex2-max-velocity-artery-reynolds",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "小动脉层流最大流速（雷诺数约束）",
        "description": "由雷诺数判据 Re<1000 推导小动脉（r=3mm）维持层流的最大流速约 0.95 m/s，并用动态仪表盘展示临界条件。",
    },
]
