"""第 4.3 节 · 例题：声呐超声波测潜艇航速（多普勒效应应用）。

可视化方案：
  左侧驱逐舰（静止波源/接收者）向右发射超声波（蓝色波纹），
  右侧潜艇向左靠近（红色箭头标速度 v）；
  分三步演示双重多普勒频移，推导合并公式，
  最后 ValueTracker 代入数值演示求解 v≈9.4 m/s。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 物理参数（SI 单位）─────────────────────────────────────────────
U_SOUND = 1.54e3   # 水中声速 m/s
NU_S    = 1.8e4    # 发射频率 Hz
DELTA_NU = 220     # 频差 Hz


class Ch04Ex1SonarDopplerSubmarine(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════
        title = Text("例题：声呐超声波测潜艇航速", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.35)
        sub = Text("第四章 机械波 · 4.3  多普勒效应", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════
        ana1 = Text("救护车鸣笛靠近时音调变高，远离时变低——", font=CJK).scale(0.46)
        ana2 = Text("这就是多普勒效应：波源或观测者运动，", font=CJK).scale(0.46)
        ana3 = Text("接收到的频率与发射频率不同。", font=CJK).scale(0.46)
        ana4 = Text("声呐正是利用这个原理测出潜艇速度！", font=CJK, color=YELLOW).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.55)
        for line in ana_grp:
            self.play(FadeIn(line), run_time=0.6)
            self.wait(0.5)
        self.wait(1.2)
        self.play(FadeOut(ana_grp))

        # ══════════════════════════════════════════════════════════════
        # Step 3: 场景建立——驱逐舰 + 潜艇示意图
        # ══════════════════════════════════════════════════════════════
        scene_label = Text("场景示意", font=CJK, color=BLUE).scale(0.46)
        scene_label.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(scene_label))

        # 水平基线
        sea_line = Line(LEFT * 6.2, RIGHT * 6.2, color=BLUE_D, stroke_width=1.5)
        sea_line.shift(DOWN * 0.2)

        # 驱逐舰（左侧）—— 用矩形 + 小三角象征船体
        ship_body = Rectangle(width=1.2, height=0.45, color=BLUE_B, fill_opacity=0.7)
        ship_deck = Triangle(color=BLUE_B, fill_opacity=0.7).scale(0.28)
        ship_deck.next_to(ship_body, UP, buff=0)
        destroyer = VGroup(ship_body, ship_deck)
        destroyer.move_to(LEFT * 4.5 + DOWN * 0.0)
        ship_lbl = Text("驱逐舰", font=CJK, color=BLUE_B).scale(0.38)
        ship_lbl.next_to(destroyer, DOWN, buff=0.18)

        # 潜艇（右侧）—— 用椭圆 + 小矩形塔
        sub_body = Ellipse(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.75)
        sub_tower = Rectangle(width=0.25, height=0.28, color=ORANGE, fill_opacity=0.75)
        sub_tower.next_to(sub_body, UP, buff=0)
        submarine = VGroup(sub_body, sub_tower)
        submarine.move_to(RIGHT * 3.8 + DOWN * 0.0)
        sub_lbl = Text("潜艇", font=CJK, color=ORANGE).scale(0.38)
        sub_lbl.next_to(submarine, DOWN, buff=0.18)

        # 潜艇速度箭头（向左）
        v_arrow = Arrow(
            start=submarine.get_left() + LEFT * 0.1,
            end=submarine.get_left() + LEFT * 1.2,
            color=RED, buff=0, stroke_width=4,
        )
        v_label = VGroup(
            Text("v", font=CJK, color=RED).scale(0.42),
            Text("(向左)", font=CJK, color=RED).scale(0.35),
        ).arrange(RIGHT, buff=0.08)
        v_label.next_to(v_arrow, UP, buff=0.12)

        # 声速标注
        u_lbl = VGroup(
            Text("声速", font=CJK, color=CYAN).scale(0.36),
            MathTex(r"u=1.54\times10^3\,\mathrm{m/s}", color=CYAN).scale(0.44),
        ).arrange(RIGHT, buff=0.1)
        u_lbl.to_edge(DOWN, buff=0.55)

        self.play(
            Create(sea_line),
            FadeIn(destroyer), FadeIn(ship_lbl),
            FadeIn(submarine), FadeIn(sub_lbl),
        )
        self.play(GrowArrow(v_arrow), FadeIn(v_label))
        self.play(FadeIn(u_lbl))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════
        # Step 4: 第一步——驱逐舰发射，潜艇（运动观测者）接收 ν₁
        # ══════════════════════════════════════════════════════════════
        step1_lbl = Text("第一步：驱逐舰发射超声波，潜艇（向波源靠近）接收", font=CJK, color=YELLOW).scale(0.38)
        step1_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeOut(scene_label), FadeIn(step1_lbl))

        # 蓝色同心波纹（从驱逐舰向右扩散）
        waves_fwd = VGroup()
        ship_center = destroyer.get_center()
        for r in [0.5, 1.0, 1.5, 2.0, 2.5]:
            arc = Arc(
                radius=r, start_angle=-PI / 3, angle=2 * PI / 3,
                color=BLUE, stroke_width=2,
            )
            arc.move_to(ship_center)
            waves_fwd.add(arc)

        self.play(
            LaggedStart(*[Create(w) for w in waves_fwd], lag_ratio=0.22),
            run_time=2.0,
        )

        # 公式：多普勒效应——运动观测者靠近静止波源
        # ν₁ = (u + v)/u · νs
        eq1_intro = VGroup(
            Text("观测者靠近，接收频率升高：", font=CJK, color=WHITE).scale(0.40),
        )
        eq1_formula = MathTex(
            r"\nu_1 = \frac{u+v}{u}\,\nu_s",
            color=YELLOW
        ).scale(0.78)
        eq1_block = VGroup(eq1_intro, eq1_formula).arrange(DOWN, buff=0.2)
        eq1_block.next_to(submarine, UP, buff=0.55)
        self.play(FadeIn(eq1_intro))
        self.wait(0.5)
        self.play(Write(eq1_formula))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════
        # Step 5: 第二步——潜艇作为运动波源反射，驱逐舰接收 ν'
        # ══════════════════════════════════════════════════════════════
        step2_lbl = Text("第二步：潜艇作为运动波源反射超声波，驱逐舰接收 ν'", font=CJK, color=YELLOW).scale(0.38)
        step2_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeOut(step1_lbl), FadeIn(step2_lbl))
        self.play(FadeOut(waves_fwd))

        # 橙色同心波纹（从潜艇向左扩散）
        waves_back = VGroup()
        sub_center = submarine.get_center()
        for r in [0.5, 1.0, 1.5, 2.0, 2.5]:
            arc = Arc(
                radius=r, start_angle=2 * PI / 3, angle=2 * PI / 3,
                color=ORANGE, stroke_width=2,
            )
            arc.move_to(sub_center)
            waves_back.add(arc)

        self.play(
            LaggedStart(*[Create(w) for w in waves_back], lag_ratio=0.22),
            run_time=2.0,
        )

        # 公式：运动波源靠近静止接收者
        # ν' = u/(u-v) · ν₁
        eq2_intro = VGroup(
            Text("波源靠近，接收频率再次升高：", font=CJK, color=WHITE).scale(0.40),
        )
        eq2_formula = MathTex(
            r"\nu' = \frac{u}{u-v}\,\nu_1",
            color=ORANGE
        ).scale(0.78)
        eq2_block = VGroup(eq2_intro, eq2_formula).arrange(DOWN, buff=0.2)
        eq2_block.next_to(destroyer, UP, buff=0.55)
        self.play(FadeIn(eq2_intro))
        self.wait(0.5)
        self.play(Write(eq2_formula))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════
        # Step 6: 清场，进入公式推导区
        # ══════════════════════════════════════════════════════════════
        self.play(
            FadeOut(VGroup(
                sea_line, destroyer, ship_lbl, submarine, sub_lbl,
                v_arrow, v_label, u_lbl,
                waves_back, eq1_block, eq2_block, step2_lbl,
            ))
        )
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════
        # Step 7: 合并公式推导——三行逐步飞入
        # ══════════════════════════════════════════════════════════════
        derive_lbl = Text("合并两次多普勒频移", font=CJK, color=BLUE).scale(0.50)
        derive_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(derive_lbl))

        # 行 A：代入 ν₁
        rowA_head = Text("将", font=CJK, color=WHITE).scale(0.40)
        rowA_eq   = MathTex(r"\nu_1 = \frac{u+v}{u}\nu_s", color=YELLOW).scale(0.72)
        rowA_tail = Text("代入：", font=CJK, color=WHITE).scale(0.40)
        rowA = VGroup(rowA_head, rowA_eq, rowA_tail).arrange(RIGHT, buff=0.12)

        # 行 B：合并结果
        rowB_head = Text("得：", font=CJK, color=WHITE).scale(0.40)
        rowB_eq   = MathTex(
            r"\nu' = \frac{u}{u-v} \cdot \frac{u+v}{u}\nu_s",
            color=YELLOW
        ).scale(0.72)
        rowB = VGroup(rowB_head, rowB_eq).arrange(RIGHT, buff=0.12)

        # 行 C：化简
        rowC_head = Text("化简：", font=CJK, color=WHITE).scale(0.40)
        rowC_eq   = MathTex(
            r"\nu' = \frac{u+v}{u-v}\,\nu_s",
            color=GREEN
        ).scale(0.88)
        rowC = VGroup(rowC_head, rowC_eq).arrange(RIGHT, buff=0.12)

        deriv_grp = VGroup(rowA, rowB, rowC).arrange(DOWN, buff=0.5, aligned_edge=LEFT)
        deriv_grp.next_to(derive_lbl, DOWN, buff=0.55)
        deriv_grp.scale_to_fit_width(11.5)

        self.play(FadeIn(rowA), run_time=0.8)
        self.wait(1.0)
        self.play(FadeIn(rowB), run_time=0.8)
        self.wait(1.0)
        self.play(FadeIn(rowC), run_time=0.8)
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════
        # Step 8: Δν 近似推导 (u ≫ v)
        # ══════════════════════════════════════════════════════════════
        approx_lbl = Text("当声速远大于潜艇速度（u ≫ v），做近似：", font=CJK, color=WHITE).scale(0.40)
        approx_lbl.next_to(deriv_grp, DOWN, buff=0.45)

        # Δν = ν' - νs
        delta_step1 = MathTex(
            r"\Delta\nu = \nu' - \nu_s = \frac{u+v}{u-v}\nu_s - \nu_s",
            color=WHITE
        ).scale(0.68)

        # 展开
        delta_step2 = MathTex(
            r"= \frac{(u+v)-(u-v)}{u-v}\nu_s = \frac{2v}{u-v}\nu_s",
            color=WHITE
        ).scale(0.68)

        # 近似
        delta_step3 = MathTex(
            r"\approx \frac{2v}{u}\nu_s \quad (u \gg v)",
            color=YELLOW
        ).scale(0.78)

        approx_grp = VGroup(delta_step1, delta_step2, delta_step3).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        approx_grp.next_to(approx_lbl, DOWN, buff=0.28)
        approx_grp.scale_to_fit_width(11.0)

        self.play(FadeIn(approx_lbl))
        self.wait(0.5)
        self.play(Write(delta_step1), run_time=1.0)
        self.wait(1.0)
        self.play(Write(delta_step2), run_time=1.0)
        self.wait(1.0)
        self.play(Write(delta_step3), run_time=0.8)
        self.wait(1.5)

        self.play(FadeOut(VGroup(derive_lbl, deriv_grp, approx_lbl, approx_grp, delta_step3)))
        # 保留 delta_step3 被 FadeOut 一起带走，下面重新写反解公式
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════
        # Step 9: 反解 v 的公式
        # ══════════════════════════════════════════════════════════════
        solve_lbl = Text("由近似公式反解潜艇速度 v：", font=CJK, color=BLUE).scale(0.50)
        solve_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(solve_lbl))

        from_approx = MathTex(
            r"\Delta\nu \approx \frac{2v}{u}\nu_s",
            color=YELLOW
        ).scale(0.80)
        arrow_right = MathTex(r"\Rightarrow", color=WHITE).scale(0.80)
        solve_eq = MathTex(
            r"v = \frac{u\,\Delta\nu}{2\nu_s}",
            color=GREEN
        ).scale(0.90)
        solve_row = VGroup(from_approx, arrow_right, solve_eq).arrange(RIGHT, buff=0.35)
        solve_row.next_to(solve_lbl, DOWN, buff=0.55)

        self.play(Write(from_approx))
        self.wait(0.8)
        self.play(FadeIn(arrow_right), Write(solve_eq))
        self.wait(1.8)

        # ══════════════════════════════════════════════════════════════
        # Step 10: ValueTracker 数值代入演示
        # ══════════════════════════════════════════════════════════════
        num_lbl = Text("代入已知数值：", font=CJK, color=WHITE).scale(0.44)
        num_lbl.next_to(solve_row, DOWN, buff=0.50)
        self.play(FadeIn(num_lbl))

        # 已知量展示
        known_u  = MathTex(r"u = 1.54\times10^3\,\mathrm{m/s}", color=CYAN).scale(0.62)
        known_dn = MathTex(r"\Delta\nu = 220\,\mathrm{Hz}", color=CYAN).scale(0.62)
        known_ns = MathTex(r"\nu_s = 1.8\times10^4\,\mathrm{Hz}", color=CYAN).scale(0.62)
        known_grp = VGroup(known_u, known_dn, known_ns).arrange(RIGHT, buff=0.5)
        known_grp.next_to(num_lbl, DOWN, buff=0.28)
        known_grp.scale_to_fit_width(11.0)

        self.play(FadeIn(known_grp))
        self.wait(1.0)

        # ValueTracker 控制 Δν，动态显示计算值
        delta_nu_tracker = ValueTracker(0.0)

        def make_result_tex():
            dv = delta_nu_tracker.get_value()
            v_val = U_SOUND * dv / (2 * NU_S)
            # 格式化为小数两位
            return MathTex(
                r"v = \frac{1.54\times10^3 \times " + f"{dv:.0f}" + r"}{2\times1.8\times10^4}"
                + r"\approx" + f"{v_val:.1f}" + r"\,\mathrm{m\cdot s^{-1}}",
                color=GREEN,
            ).scale(0.70).next_to(known_grp, DOWN, buff=0.45)

        result_tex = always_redraw(make_result_tex)
        self.add(result_tex)
        self.play(delta_nu_tracker.animate.set_value(DELTA_NU), run_time=3.0, rate_func=linear)
        self.wait(2.0)

        # 高亮最终答案
        final_box_eq = MathTex(
            r"v \approx 9.4\,\mathrm{m\cdot s^{-1}}",
            color=GREEN
        ).scale(0.92)
        final_box_eq.next_to(known_grp, DOWN, buff=0.45)
        final_box = SurroundingRectangle(final_box_eq, color=GREEN, buff=0.20, corner_radius=0.12)

        self.remove(result_tex)
        self.play(Write(final_box_eq), Create(final_box))
        self.wait(2.0)

        self.play(
            FadeOut(VGroup(solve_lbl, solve_row, num_lbl, known_grp, final_box_eq, final_box))
        )
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════
        # Step 11: 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════════════
        sum_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52)
        sum_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sum_title))

        # 公式 1：接收频率（第一次）
        s_label1 = Text("潜艇接收频率：", font=CJK, color=WHITE).scale(0.40)
        s_eq1    = MathTex(r"\nu_1=\frac{u+v}{u}\nu_s", color=YELLOW).scale(0.72)
        s_row1   = VGroup(s_label1, s_eq1).arrange(RIGHT, buff=0.12)

        # 公式 2：驱逐舰接收频率
        s_label2 = Text("驱逐舰接收频率：", font=CJK, color=WHITE).scale(0.40)
        s_eq2    = MathTex(r"\nu'=\frac{u+v}{u-v}\nu_s", color=YELLOW).scale(0.72)
        s_row2   = VGroup(s_label2, s_eq2).arrange(RIGHT, buff=0.12)

        # 公式 3：近似
        s_label3 = Text("频差（u≫v 近似）：", font=CJK, color=WHITE).scale(0.40)
        s_eq3    = MathTex(r"\Delta\nu\approx\frac{2v}{u}\nu_s", color=YELLOW).scale(0.72)
        s_row3   = VGroup(s_label3, s_eq3).arrange(RIGHT, buff=0.12)

        # 公式 4：求速度
        s_label4 = Text("潜艇速度：", font=CJK, color=WHITE).scale(0.40)
        s_eq4    = MathTex(
            r"v=\frac{u\Delta\nu}{2\nu_s}\approx9.4\,\mathrm{m\cdot s^{-1}}",
            color=GREEN
        ).scale(0.72)
        s_row4   = VGroup(s_label4, s_eq4).arrange(RIGHT, buff=0.12)

        sum_grp = VGroup(s_row1, s_row2, s_row3, s_row4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        sum_grp.next_to(sum_title, DOWN, buff=0.48)
        sum_grp.scale_to_fit_width(11.5)

        box = SurroundingRectangle(sum_grp, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(Write(s_row1), run_time=0.8)
        self.wait(0.6)
        self.play(Write(s_row2), run_time=0.8)
        self.wait(0.6)
        self.play(Write(s_row3), run_time=0.8)
        self.wait(0.6)
        self.play(Write(s_row4), run_time=0.8)
        self.wait(0.5)
        self.play(Create(box))
        self.wait(2.5)

        # 物理意义补充
        phys_note = Text("多普勒效应：相向运动使频率升高；", font=CJK, color=CYAN).scale(0.40)
        phys_note2 = Text("声呐用双重频移放大效果，精确测速。", font=CJK, color=CYAN).scale(0.40)
        phys_note_grp = VGroup(phys_note, phys_note2).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        phys_note_grp.next_to(box, DOWN, buff=0.28)
        self.play(FadeIn(phys_note_grp))
        self.wait(2.0)

        # 最终淡出
        self.play(FadeOut(VGroup(title, sum_title, sum_grp, box, phys_note_grp)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch04Ex1SonarDopplerSubmarine",
        "id": "phys-ch04-4.3-ex1-sonar-doppler-submarine",
        "chapterId": "ch04",
        "sectionId": "4.3",
        "title": "例题：声呐超声波测潜艇航速",
        "description": "演示声呐双重多普勒效应：驱逐舰发射→潜艇（运动观测者）接收→反射回驱逐舰，分三步推导合并公式并用 ValueTracker 代入数值求解潜艇速度≈9.4 m/s。",
    },
]
