"""第 4.3 节 · 多普勒效应：波源运动与观测者运动的机制

分上下两幅可视化演示：
  上幅 —— 观测者运动：固定波源，观测者靠近/远离，接收频率随相对速度变化。
  下幅 —— 波源运动：波源向右运动，前方波面压缩、后方拉伸，频率变化直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch04Kp1DopplerEffectMechanism(Scene):
    def construct(self):
        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("多普勒效应：波源运动与观测者运动", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ─────────────────────────────────────────────
        ana1 = Text("救护车驶来时鸣笛声变高，离去时变低——", font=CJK, color=WHITE).scale(0.48)
        ana2 = Text("这就是多普勒效应：接收频率随相对运动改变。", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2).arrange(DOWN, buff=0.25).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ── Step 3: 参数定义 ─────────────────────────────────────────────
        def_title = Text("符号定义", font=CJK, color=CYAN).scale(0.48).next_to(title, DOWN, buff=0.5)
        d1 = VGroup(Text("u :", font=CJK, color=WHITE).scale(0.42),
                    MathTex(r"u").scale(0.55),
                    Text("— 波速（介质中传播速度）", font=CJK, color=WHITE).scale(0.42)).arrange(RIGHT, buff=0.1)
        d2 = VGroup(Text("vR :", font=CJK, color=GREEN).scale(0.42),
                    MathTex(r"v_R").scale(0.55),
                    Text("— 观测者速度", font=CJK, color=GREEN).scale(0.42)).arrange(RIGHT, buff=0.1)
        d3 = VGroup(Text("vS :", font=CJK, color=RED).scale(0.42),
                    MathTex(r"v_S").scale(0.55),
                    Text("— 波源速度", font=CJK, color=RED).scale(0.42)).arrange(RIGHT, buff=0.1)
        d4 = VGroup(Text("nu :", font=CJK, color=WHITE).scale(0.42),
                    MathTex(r"\nu").scale(0.55),
                    Text("— 波源发射频率", font=CJK, color=WHITE).scale(0.42)).arrange(RIGHT, buff=0.1)
        defs = VGroup(d1, d2, d3, d4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        defs.next_to(def_title, DOWN, buff=0.3).shift(LEFT * 0.5)
        self.play(FadeIn(def_title))
        for d in defs:
            self.play(FadeIn(d), run_time=0.5)
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ── Step 4: 上幅 —— 观测者运动（固定波源）────────────────────────
        panel_title_top = Text("情形一：波源静止，观测者运动", font=CJK, color=GREEN).scale(0.5)
        panel_title_top.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(panel_title_top))

        # 波源：固定在左侧
        src_pos = np.array([-5.0, -0.3, 0.0])
        src_dot = Dot(src_pos, color=YELLOW, radius=0.15)
        src_label = Text("波源", font=CJK, color=YELLOW).scale(0.38).next_to(src_dot, DOWN, buff=0.15)

        # 静止观测者开始位置在右侧
        obs_tracker = ValueTracker(3.5)   # x 坐标，负值表示向左移动
        wave_u = 2.0      # 波速（单位/秒，用于动画）
        nu0 = 1.0         # 波源频率（每单位时间 1 个波）
        lam0 = wave_u / nu0  # 波长 = 2.0

        # 绘制固定波源发出的等间距同心圆
        n_waves = 5
        wave_circles_top = VGroup()
        for i in range(1, n_waves + 1):
            r = i * lam0 * 0.6  # 缩放让画面合适
            c = Circle(radius=r, color=BLUE, stroke_opacity=0.7 - i * 0.1, stroke_width=2)
            c.move_to(src_pos)
            wave_circles_top.add(c)

        # 观测者点（always_redraw 根据 tracker 移动）
        obs_dot_top = always_redraw(
            lambda: Dot(
                np.array([obs_tracker.get_value(), -0.3, 0.0]),
                color=GREEN,
                radius=0.13,
            )
        )
        obs_label_top = always_redraw(
            lambda: Text("观测者", font=CJK, color=GREEN).scale(0.36).next_to(
                np.array([obs_tracker.get_value(), -0.3, 0.0]), UP, buff=0.18
            )
        )

        # 速度箭头（靠近波源：向左）
        vR_arrow = always_redraw(
            lambda: Arrow(
                start=np.array([obs_tracker.get_value(), -0.3, 0.0]),
                end=np.array([obs_tracker.get_value() - 1.0, -0.3, 0.0]),
                color=GREEN,
                buff=0,
                stroke_width=4,
                max_tip_length_to_length_ratio=0.3,
            )
        )
        vR_label = always_redraw(
            lambda: VGroup(
                MathTex(r"v_R", color=GREEN).scale(0.5),
                Text("靠近", font=CJK, color=GREEN).scale(0.36),
            ).arrange(RIGHT, buff=0.1).next_to(
                np.array([obs_tracker.get_value() - 0.5, -0.3, 0.0]), DOWN, buff=0.22
            )
        )

        # 接收频率公式标注（观测者靠近，vR 取 +）
        freq_label_top = VGroup(
            Text("接收频率：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\nu'=\frac{u+v_R}{u}\,\nu", color=YELLOW).scale(0.7),
        ).arrange(RIGHT, buff=0.15)
        freq_label_top.next_to(panel_title_top, DOWN, buff=0.22).shift(RIGHT * 1.5)

        self.play(Create(wave_circles_top), FadeIn(src_dot), FadeIn(src_label))
        self.play(FadeIn(obs_dot_top), FadeIn(obs_label_top))
        self.play(GrowArrow(vR_arrow), FadeIn(vR_label))
        self.play(FadeIn(freq_label_top))
        self.wait(0.6)

        # 向左靠近：频率升高动画（观测者 x 从 3.5 → 1.2）
        up_note = Text("靠近波源 → 单位时间遇到更多波 → 频率升高", font=CJK, color=YELLOW).scale(0.4)
        up_note.next_to(wave_circles_top, DOWN, buff=0.6)
        self.play(FadeIn(up_note))
        self.play(obs_tracker.animate.set_value(1.2), run_time=3.0, rate_func=linear)
        self.wait(0.8)

        # 向右远离：频率降低
        away_note = Text("远离波源 → 单位时间遇到更少波 → 频率降低", font=CJK, color=RED).scale(0.4)
        away_note.next_to(wave_circles_top, DOWN, buff=0.6)
        freq_label_away = VGroup(
            Text("远离时：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\nu'=\frac{u-v_R}{u}\,\nu", color=RED).scale(0.7),
        ).arrange(RIGHT, buff=0.15).next_to(panel_title_top, DOWN, buff=0.22).shift(RIGHT * 1.5)

        self.play(FadeOut(up_note), FadeOut(freq_label_top))
        self.play(FadeIn(away_note), FadeIn(freq_label_away))
        # 箭头反向（向右）
        vR_arrow_away = always_redraw(
            lambda: Arrow(
                start=np.array([obs_tracker.get_value(), -0.3, 0.0]),
                end=np.array([obs_tracker.get_value() + 1.0, -0.3, 0.0]),
                color=RED,
                buff=0,
                stroke_width=4,
                max_tip_length_to_length_ratio=0.3,
            )
        )
        self.play(FadeOut(vR_arrow), FadeOut(vR_label), FadeIn(vR_arrow_away))
        self.play(obs_tracker.animate.set_value(4.2), run_time=3.0, rate_func=linear)
        self.wait(0.8)

        # 清场上幅
        self.play(FadeOut(VGroup(
            panel_title_top, wave_circles_top, src_dot, src_label,
            obs_dot_top, obs_label_top, vR_arrow_away,
            freq_label_away, away_note,
        )))
        self.wait(0.4)

        # ── Step 5: 下幅 —— 波源运动（观测者静止）────────────────────────
        panel_title_bot = Text("情形二：观测者静止，波源向右运动", font=CJK, color=RED).scale(0.5)
        panel_title_bot.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(panel_title_bot))

        # 波源向右移动，ValueTracker 控制波源 x 位置
        src_tracker = ValueTracker(-2.5)
        nu_src = 1.0
        u_wave = 3.0
        vS_val = 1.2
        lam_front = (u_wave - vS_val) / nu_src   # 前方压缩波长
        lam_back = (u_wave + vS_val) / nu_src    # 后方拉伸波长

        # 绘制波源运动产生的压缩/拉伸同心圆（预先画好快照式）
        # 波源在 t=0,-1,-2,-3,-4 时发出的圆（波源每单位时间发一个波）
        # 波源向右以 vS 运动，t 秒前发出的波圆心在 src_x - vS*t，半径 u*t
        def make_moving_source_waves(src_x, n=5, scale=1.0):
            circles = VGroup()
            for i in range(1, n + 1):
                t_past = i * 1.0          # i 秒前发出
                center_x = src_x - vS_val * t_past * scale
                radius = u_wave * t_past * scale
                # 前方颜色偏红（压缩），后方颜色偏蓝（拉伸）
                # 简化：用单一圆，颜色按左右分
                c = Circle(radius=radius * 0.55, color=BLUE, stroke_width=2.5,
                           stroke_opacity=max(0.2, 0.85 - i * 0.12))
                c.move_to(np.array([center_x * 0.55, -0.5, 0.0]))
                circles.add(c)
            return circles

        # 静态快照：波源在 x=-1 时（已向右运动过一段）
        snap_circles = make_moving_source_waves(-1.0)

        # 波源移动点
        src_moving = always_redraw(
            lambda: Dot(np.array([src_tracker.get_value(), -0.5, 0.0]),
                        color=ORANGE, radius=0.16)
        )
        src_moving_label = always_redraw(
            lambda: VGroup(
                Text("波源", font=CJK, color=ORANGE).scale(0.38),
                Arrow(ORIGIN, RIGHT * 0.6, color=ORANGE, buff=0,
                      stroke_width=3, max_tip_length_to_length_ratio=0.35),
            ).arrange(RIGHT, buff=0.1).next_to(
                np.array([src_tracker.get_value(), -0.5, 0.0]), UP, buff=0.2
            )
        )

        # 观测者静止在右侧
        obs_right = Dot(np.array([5.2, -0.5, 0.0]), color=GREEN, radius=0.13)
        obs_right_label = Text("观测者（静止）", font=CJK, color=GREEN).scale(0.36).next_to(obs_right, UP, buff=0.18)

        # 观测者静止在左侧
        obs_left = Dot(np.array([-5.5, -0.5, 0.0]), color=CYAN, radius=0.13)
        obs_left_label = Text("观测者（静止）", font=CJK, color=CYAN).scale(0.36).next_to(obs_left, UP, buff=0.18)

        self.play(FadeIn(snap_circles), FadeIn(src_moving), FadeIn(src_moving_label))
        self.play(FadeIn(obs_right), FadeIn(obs_right_label),
                  FadeIn(obs_left), FadeIn(obs_left_label))
        self.wait(0.6)

        # 波源向右运动动画
        self.play(src_tracker.animate.set_value(1.5), run_time=2.5, rate_func=linear)
        self.wait(0.8)

        # 波长标注
        lam_front_label = VGroup(
            Text("前方波长压缩：", font=CJK, color=RED).scale(0.4),
            MathTex(r"\lambda_{\text{front}}=\frac{u-v_S}{\nu}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.12)
        lam_front_label.next_to(panel_title_bot, DOWN, buff=0.25).shift(RIGHT * 0.8)

        lam_back_label = VGroup(
            Text("后方波长拉伸：", font=CJK, color=BLUE).scale(0.4),
            MathTex(r"\lambda_{\text{back}}=\frac{u+v_S}{\nu}", color=BLUE).scale(0.65),
        ).arrange(RIGHT, buff=0.12)
        lam_back_label.next_to(lam_front_label, DOWN, buff=0.28)

        self.play(FadeIn(lam_front_label))
        self.wait(0.5)
        self.play(FadeIn(lam_back_label))
        self.wait(0.8)

        # 接收频率说明（前方观测者 vs 后方观测者）
        freq_front = VGroup(
            Text("右侧（迎面）接收频率升高：", font=CJK, color=RED).scale(0.4),
            MathTex(r"\nu'=\frac{u}{u-v_S}\,\nu", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.12)
        freq_front.next_to(lam_back_label, DOWN, buff=0.3)

        freq_back = VGroup(
            Text("左侧（背离）接收频率降低：", font=CJK, color=BLUE).scale(0.4),
            MathTex(r"\nu'=\frac{u}{u+v_S}\,\nu", color=BLUE).scale(0.65),
        ).arrange(RIGHT, buff=0.12)
        freq_back.next_to(freq_front, DOWN, buff=0.28)

        self.play(FadeIn(freq_front))
        self.wait(0.5)
        self.play(FadeIn(freq_back))
        self.wait(1.5)

        # 清场下幅
        self.play(FadeOut(VGroup(
            panel_title_bot, snap_circles, src_moving, src_moving_label,
            obs_right, obs_right_label, obs_left, obs_left_label,
            lam_front_label, lam_back_label, freq_front, freq_back,
        )))
        self.wait(0.4)

        # ── Step 6: 统一公式推导 ─────────────────────────────────────────
        derive_title = Text("统一推导：观测者 + 波源同时运动", font=CJK, color=CYAN).scale(0.5)
        derive_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(derive_title))

        # 推导步骤 1：观测者运动时，单位时间内相对波的速度 = u + vR
        step1_zh = Text("单位时间内，观测者相对波面的速度 = u + vR", font=CJK, color=WHITE).scale(0.43)
        step1_zh.next_to(derive_title, DOWN, buff=0.35)
        step1_eq = MathTex(r"\nu'=\frac{u+v_R}{\lambda}=\frac{u+v_R}{u/\nu}=\frac{u+v_R}{u}\,\nu",
                           color=YELLOW).scale(0.72)
        step1_eq.next_to(step1_zh, DOWN, buff=0.25)
        self.play(FadeIn(step1_zh))
        self.play(Write(step1_eq))
        self.wait(1.2)

        # 推导步骤 2：波源运动时，前方波长 λ' = (u-vS)/ν
        step2_zh = Text("波源运动时，前方等效波长 λ' = (u - vS) / ν", font=CJK, color=WHITE).scale(0.43)
        step2_zh.next_to(step1_eq, DOWN, buff=0.35)
        step2_eq = MathTex(r"\nu'=\frac{u}{\lambda'}=\frac{u}{(u-v_S)/\nu}=\frac{u}{u-v_S}\,\nu",
                           color=ORANGE).scale(0.72)
        step2_eq.next_to(step2_zh, DOWN, buff=0.25)
        self.play(FadeIn(step2_zh))
        self.play(Write(step2_eq))
        self.wait(1.2)

        # 合并公式
        combined_zh = Text("两者同时运动时，合并得统一公式：", font=CJK, color=GREEN).scale(0.44)
        combined_zh.next_to(step2_eq, DOWN, buff=0.32)
        self.play(FadeIn(combined_zh))
        self.wait(0.5)

        self.play(FadeOut(VGroup(step1_zh, step1_eq, step2_zh, step2_eq, combined_zh, derive_title)))

        # ── Step 7: 统一公式 + 符号说明（颜色标注靠近/远离）────────────────
        unified_title = Text("统一公式（多普勒效应）", font=CJK, color=BLUE).scale(0.5)
        unified_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(unified_title))

        big_formula = MathTex(
            r"\nu'", r"=",
            r"\frac{u \pm v_R}{u \mp v_S}",
            r"\nu",
            substrings_to_isolate=[r"\pm", r"\mp"],
        ).scale(1.1)
        big_formula.next_to(unified_title, DOWN, buff=0.5)
        # 高亮 ± / ∓ 符号与 nu'
        big_formula.set_color_by_tex(r"\pm", GREEN)
        big_formula.set_color_by_tex(r"\mp", RED)
        big_formula.set_color_by_tex(r"\nu'", YELLOW)

        self.play(Write(big_formula))
        self.wait(0.8)

        # 符号规则说明
        rule_plus = VGroup(
            Text("分子", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\pm", color=GREEN).scale(0.65),
            Text("：观测者靠近取 +，远离取 −", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.1)

        rule_minus = VGroup(
            Text("分母", font=CJK, color=RED).scale(0.42),
            MathTex(r"\mp", color=RED).scale(0.65),
            Text("：波源靠近取 −，远离取 +", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.1)

        rules = VGroup(rule_plus, rule_minus).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        rules.next_to(big_formula, DOWN, buff=0.45)
        self.play(FadeIn(rule_plus))
        self.wait(0.6)
        self.play(FadeIn(rule_minus))
        self.wait(1.0)

        # 波长补充公式
        lam_supp = MathTex(
            r"\lambda_{\text{front}}=\frac{u-v_S}{\nu},\quad"
            r"\lambda_{\text{back}}=\frac{u+v_S}{\nu}",
            color=ORANGE
        ).scale(0.72)
        lam_supp.next_to(rules, DOWN, buff=0.35)
        self.play(Write(lam_supp))
        self.wait(1.0)

        box = SurroundingRectangle(
            VGroup(big_formula, rules, lam_supp),
            color=BLUE, buff=0.3, corner_radius=0.12
        )
        self.play(Create(box))
        self.wait(1.2)
        self.play(FadeOut(VGroup(unified_title, big_formula, rules, lam_supp, box)))

        # ── Step 8: 数值示例 ─────────────────────────────────────────────
        ex_title = Text("数值例子：救护车鸣笛", font=CJK, color=CYAN).scale(0.5)
        ex_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_title))

        ex_cond = VGroup(
            Text("已知：声速 u = 340 m/s，", font=CJK, color=WHITE).scale(0.44),
            Text("波源频率 ν = 500 Hz，救护车速度 vS = 30 m/s", font=CJK, color=WHITE).scale(0.44),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        ex_cond.next_to(ex_title, DOWN, buff=0.35)
        self.play(FadeIn(ex_cond))
        self.wait(0.8)

        ex_approach = VGroup(
            Text("驶来时（靠近，取 −）：", font=CJK, color=RED).scale(0.44),
            MathTex(r"\nu'=\frac{340}{340-30}\times 500\approx 548\,\text{Hz}", color=RED).scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        ex_approach.next_to(ex_cond, DOWN, buff=0.35)

        ex_away = VGroup(
            Text("驶去时（远离，取 +）：", font=CJK, color=BLUE).scale(0.44),
            MathTex(r"\nu'=\frac{340}{340+30}\times 500\approx 459\,\text{Hz}", color=BLUE).scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        ex_away.next_to(ex_approach, DOWN, buff=0.28)

        self.play(FadeIn(ex_approach))
        self.wait(0.6)
        self.play(FadeIn(ex_away))
        self.wait(1.4)
        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_approach, ex_away)))

        # ── Step 9: 小结卡 ───────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("统一公式：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\nu'=\frac{u\pm v_R}{u\mp v_S}\nu", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("观测者运动——分子变化：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"u+v_R\;\text{(approach)},\;u-v_R\;\text{(recede)}", color=GREEN).scale(0.65),
        ).arrange(RIGHT, buff=0.1)

        s3 = VGroup(
            Text("波源运动——分母变化：", font=CJK, color=RED).scale(0.44),
            MathTex(r"u-v_S\;\text{(approach)},\;u+v_S\;\text{(recede)}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.1)

        s4 = VGroup(
            Text("波长变化：", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\lambda_{\text{front}}{<}\lambda_0{<}\lambda_{\text{back}}", color=ORANGE).scale(0.75),
        ).arrange(RIGHT, buff=0.15)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.5)

        s_box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        for item in summary:
            self.play(FadeIn(item), run_time=0.6)
        self.play(Create(s_box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, s_box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Kp1DopplerEffectMechanism",
        "id": "phys-ch04-4.3-kp1-doppler-effect-mechanism",
        "chapterId": "ch04",
        "sectionId": "4.3",
        "title": "多普勒效应：波源运动与观测者运动的机制",
        "description": "分上下两幅分别演示观测者运动和波源运动导致的频率变化，结合 ValueTracker 动态扫动，汇总统一多普勒公式并以救护车数值示例收尾。",
    },
]
