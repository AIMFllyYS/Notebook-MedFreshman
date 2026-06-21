"""第 14.1 节 · X 射线管结构与轫致辐射机制。

三段结构：
① 剖面示意图展示 X 射线管各部件（阴极灯丝、聚焦杯、高压、钨靶、真空玻璃壳）；
② 追踪单个电子从阴极飞向阳极，进入核电场后轨迹偏转并辐射光子（波纹扩散）；
③ 能量条形图：99% → 热，1% → X 射线；ValueTracker 控制管电压 U，同步末速 v。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch14Kp1XrayTubeBremsstrahlung(Scene):
    def construct(self):
        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text("X 射线管结构与轫致辐射机制", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        subtitle = Text("第十四章 X 射线与激光 · 14.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text("医院里的 X 光机是如何产生 X 射线的？", font=CJK, color=WHITE).scale(0.5)
        ana2 = Text("答案藏在一根叫「X 射线管」的真空玻璃管里：", font=CJK, color=WHITE).scale(0.5)
        ana3 = Text("让高速电子撞上金属靶，急剧减速时就会释放出 X 射线。", font=CJK, color=GREEN).scale(0.5)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.8)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana_group))

        # ── Step 3: X 射线管剖面结构图 ──────────────────────────────────
        struct_title = Text("X 射线管剖面结构", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(struct_title))

        # 真空玻璃壳（椭圆轮廓）
        shell = Ellipse(width=8.5, height=3.4, color=CYAN, stroke_width=2.5).shift(DOWN * 0.5)
        shell_label = Text("真空玻璃壳", font=CJK, color=CYAN).scale(0.36).next_to(shell, DOWN, buff=0.2)
        self.play(Create(shell), FadeIn(shell_label))
        self.wait(0.6)

        # 阴极灯丝（左侧）
        cathode_rect = Rectangle(width=0.55, height=1.1, color=ORANGE, stroke_width=3)
        cathode_rect.move_to(LEFT * 3.2 + DOWN * 0.5)
        cathode_label_zh = Text("阴极灯丝", font=CJK, color=ORANGE).scale(0.36)
        cathode_label_zh.next_to(cathode_rect, LEFT, buff=0.18)
        self.play(FadeIn(cathode_rect), FadeIn(cathode_label_zh))
        self.wait(0.5)

        # 聚焦杯（包围灯丝的 U 形轮廓，用两条 Line 模拟）
        cup_left = Line(LEFT * 3.6 + DOWN * 0.05, LEFT * 3.6 + DOWN * 0.95, color=YELLOW, stroke_width=2.5)
        cup_right = Line(LEFT * 2.8 + DOWN * 0.05, LEFT * 2.8 + DOWN * 0.95, color=YELLOW, stroke_width=2.5)
        cup_bottom = Line(LEFT * 3.6 + DOWN * 0.95, LEFT * 2.8 + DOWN * 0.95, color=YELLOW, stroke_width=2.5)
        focus_cup = VGroup(cup_left, cup_right, cup_bottom)
        cup_label = Text("聚焦杯", font=CJK, color=YELLOW).scale(0.36)
        cup_label.next_to(focus_cup, UP, buff=0.18)
        self.play(Create(focus_cup), FadeIn(cup_label))
        self.wait(0.5)

        # 钨靶（右侧，倾斜矩形用 Polygon 近似）
        target = Polygon(
            RIGHT * 2.5 + DOWN * 0.0,
            RIGHT * 2.9 + DOWN * 0.0,
            RIGHT * 2.9 + DOWN * 1.1,
            RIGHT * 2.5 + DOWN * 1.1,
            color=WHITE, fill_color="#888888", fill_opacity=0.6, stroke_width=2.5
        ).shift(DOWN * 0.05)
        target_label = Text("钨靶（阳极）", font=CJK, color=WHITE).scale(0.36)
        target_label.next_to(target, RIGHT, buff=0.18)
        self.play(FadeIn(target), FadeIn(target_label))
        self.wait(0.5)

        # 高压标注（+/- 符号与箭头）
        hv_label_plus = Text("+  高压  -", font=CJK, color=RED).scale(0.42)
        hv_label_plus.move_to(UP * 0.6 + DOWN * 0.1)
        hv_arrow = Arrow(LEFT * 2.5 + DOWN * 0.5, RIGHT * 2.3 + DOWN * 0.5,
                         buff=0.05, color=RED, stroke_width=2.5,
                         max_tip_length_to_length_ratio=0.1)
        self.play(FadeIn(hv_label_plus), Create(hv_arrow))
        self.wait(0.8)

        # X 射线出射窗口（右上角缺口 + 标注）
        xray_window = Line(RIGHT * 2.7 + UP * 0.45, RIGHT * 3.5 + UP * 0.45,
                           color=BLUE, stroke_width=3)
        xray_label = Text("X 射线出射方向", font=CJK, color=BLUE).scale(0.34)
        xray_label.next_to(xray_window, UP, buff=0.12)
        self.play(Create(xray_window), FadeIn(xray_label))
        self.wait(1.2)

        # 收集所有结构图元素，准备清场
        struct_group = VGroup(
            shell, shell_label,
            cathode_rect, cathode_label_zh,
            focus_cup, cup_label,
            target, target_label,
            hv_label_plus, hv_arrow,
            xray_window, xray_label,
            struct_title
        )
        self.play(FadeOut(struct_group))
        self.wait(0.3)

        # ── Step 4: 公式——电子获得的动能 ────────────────────────────────
        eq_title = Text("关键公式：电子加速与最高频率", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(eq_title))

        def_line1 = VGroup(
            Text("管电压对电子做功：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"eU = \frac{1}{2}m_e v^2", color=YELLOW).scale(0.9)
        ).arrange(RIGHT, buff=0.25)
        def_line1.next_to(eq_title, DOWN, buff=0.45)

        def_line2 = VGroup(
            Text("最高光子能量（最短波长）：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"h\nu_{\max} = eU", color=GREEN).scale(0.9)
        ).arrange(RIGHT, buff=0.25)
        def_line2.next_to(def_line1, DOWN, buff=0.4)

        note_limit = Text("这意味着 X 射线有截止波长，由管电压唯一决定。",
                          font=CJK, color=CYAN).scale(0.42)
        note_limit.next_to(def_line2, DOWN, buff=0.35)

        self.play(FadeIn(def_line1[0]), Write(def_line1[1]))
        self.wait(1.2)
        self.play(FadeIn(def_line2[0]), Write(def_line2[1]))
        self.wait(1.0)
        self.play(FadeIn(note_limit))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq_title, def_line1, def_line2, note_limit)))

        # ── Step 5: 单电子轨迹动画（轫致辐射过程）────────────────────────
        traj_title = Text("轫致辐射：电子偏转 → 光子辐射", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(traj_title))

        # 背景：简化的阴极/阳极符号
        cathode_dot = Dot(LEFT * 4.2 + DOWN * 0.6, color=ORANGE, radius=0.12)
        cathode_zh = Text("阴极", font=CJK, color=ORANGE).scale(0.38).next_to(cathode_dot, DOWN, buff=0.15)
        nucleus_dot = Dot(RIGHT * 1.2 + DOWN * 0.4, color=WHITE, radius=0.22)
        nucleus_label_math = MathTex(r"+Ze", color=WHITE).scale(0.55).next_to(nucleus_dot, UP, buff=0.1)
        target_line = Line(RIGHT * 2.3 + UP * 0.5, RIGHT * 2.3 + DOWN * 1.5,
                           color="#888888", stroke_width=4)
        anode_zh = Text("钨靶", font=CJK, color="#AAAAAA").scale(0.38).next_to(target_line, RIGHT, buff=0.1)
        self.play(FadeIn(cathode_dot), FadeIn(cathode_zh))
        self.play(FadeIn(nucleus_dot), FadeIn(nucleus_label_math))
        self.play(Create(target_line), FadeIn(anode_zh))
        self.wait(0.5)

        # 电子：从阴极水平飞向核旁边
        electron = Dot(LEFT * 4.2 + DOWN * 0.6, color=BLUE, radius=0.14)
        e_label = MathTex(r"e^-", color=BLUE).scale(0.55)
        e_label.add_updater(lambda m: m.next_to(electron, UP, buff=0.06))
        self.add(electron, e_label)

        # 速度箭头（匀速阶段）
        vel_arrow = Arrow(ORIGIN, RIGHT * 0.9, buff=0, color=GREEN,
                          stroke_width=3, max_tip_length_to_length_ratio=0.25)
        vel_arrow.add_updater(lambda m: m.put_start_and_end_on(
            electron.get_center(), electron.get_center() + RIGHT * 0.9
        ))
        vel_label = MathTex(r"v_0", color=GREEN).scale(0.5)
        vel_label.add_updater(lambda m: m.next_to(vel_arrow, DOWN, buff=0.08))
        self.add(vel_arrow, vel_label)

        accel_zh = Text("高压加速阶段：电子获得动能 eU", font=CJK, color=GREEN).scale(0.4).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(accel_zh))
        # 直线飞向核左侧
        self.play(
            electron.animate.move_to(LEFT * 0.8 + DOWN * 0.6),
            run_time=1.8, rate_func=linear
        )
        self.wait(0.3)
        self.play(FadeOut(accel_zh))

        # 偏转阶段：沿曲线绕过核（用参数路径 + MoveAlongPath）
        deflect_path = ArcBetweenPoints(
            LEFT * 0.8 + DOWN * 0.6,
            RIGHT * 1.8 + DOWN * 1.3,
            angle=PI / 2.8
        )

        # 移除速度箭头 updater，改为减速显示
        vel_arrow.clear_updaters()
        vel_label.clear_updaters()
        e_label.clear_updaters()

        defl_zh = Text("进入核电场：电子急剧偏转 + 减速", font=CJK, color=RED).scale(0.4).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(defl_zh))
        self.play(
            MoveAlongPath(electron, deflect_path),
            e_label.animate.shift(RIGHT * 2.6 + DOWN * 0.7),
            vel_arrow.animate.put_start_and_end_on(
                RIGHT * 1.8 + DOWN * 1.3, RIGHT * 1.8 + DOWN * 1.3 + (DOWN + RIGHT * 0.5) * 0.5
            ).set_color(RED),
            run_time=2.0, rate_func=smooth
        )
        self.wait(0.4)
        self.play(FadeOut(defl_zh))

        # 光子辐射：从偏转点向左上方扩散的波纹
        photon_src = RIGHT * 1.8 + DOWN * 1.3
        photon_zh = Text("辐射 X 射线光子：波纹向外扩散", font=CJK, color=BLUE).scale(0.4).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(photon_zh))
        ripples = []
        for r_scale in [0.3, 0.65, 1.05]:
            circle = Circle(radius=r_scale, color=BLUE, stroke_width=2.5, stroke_opacity=0.75)
            circle.move_to(photon_src)
            ripples.append(circle)
        for rip in ripples:
            self.play(
                Create(rip),
                rip.animate.scale(2.5).set_stroke(opacity=0.1),
                run_time=0.9, rate_func=smooth
            )
        self.wait(0.6)
        self.play(FadeOut(photon_zh))

        traj_clearout = VGroup(
            traj_title, cathode_dot, cathode_zh,
            nucleus_dot, nucleus_label_math, target_line, anode_zh,
            electron, e_label, vel_arrow, vel_label,
            *ripples
        )
        self.play(FadeOut(traj_clearout))
        self.wait(0.3)

        # ── Step 6: ValueTracker 演示——管电压与末速的关系 ────────────────
        vt_title = Text("管电压 U 越高 → 电子末速越大", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(vt_title))

        U_tracker = ValueTracker(30.0)   # 单位：kV

        # 常数（SI 量级已缩放，方便显示）
        # v = sqrt(2eU/m_e); 以 kV 为单位，结果约 10^8 m/s 量级
        # 这里用归一化演示：v_display = sqrt(U_kV / 30) * 0.95c 用比例显示
        def get_v():
            return math.sqrt(U_tracker.get_value() / 30.0) * 0.95

        # 管电压数字
        u_display = always_redraw(lambda: VGroup(
            Text("U =", font=CJK, color=WHITE).scale(0.5),
            MathTex(rf"{U_tracker.get_value():.0f}\ \mathrm{{kV}}", color=YELLOW).scale(0.75)
        ).arrange(RIGHT, buff=0.2).to_corner(UL, buff=0.9).shift(DOWN * 1.6))

        # 末速数字（归一化 v/c）
        v_display = always_redraw(lambda: VGroup(
            Text("v/c =", font=CJK, color=WHITE).scale(0.5),
            MathTex(rf"{get_v():.2f}", color=GREEN).scale(0.75)
        ).arrange(RIGHT, buff=0.2).to_corner(UL, buff=0.9).shift(DOWN * 2.4))

        # 速度横条
        bar_bg = Rectangle(width=6.0, height=0.45, color=DARK_GREY, fill_opacity=0.6)
        bar_bg.move_to(RIGHT * 0.8 + DOWN * 0.5)
        bar = always_redraw(lambda: Rectangle(
            width=6.0 * get_v() / 0.95,
            height=0.45,
            color=GREEN, fill_opacity=0.85
        ).align_to(bar_bg, LEFT).align_to(bar_bg, UP))
        bar_label = Text("电子末速（相对 c）", font=CJK, color=GREEN).scale(0.38).next_to(bar_bg, DOWN, buff=0.12)

        # 公式提示
        formula_vt = MathTex(r"v = \sqrt{\frac{2eU}{m_e}}", color=YELLOW).scale(0.8)
        formula_vt.next_to(bar_bg, UP, buff=0.4)

        self.add(u_display, v_display)
        self.play(FadeIn(bar_bg), FadeIn(bar_label), Write(formula_vt))
        self.add(bar)
        self.wait(0.8)

        vt_note1 = Text("升高电压 → 末速增大", font=CJK, color=ORANGE).scale(0.42).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(vt_note1))
        self.play(U_tracker.animate.set_value(80.0), run_time=2.5)
        self.wait(0.6)
        vt_note2 = Text("降低电压 → 末速减小（X 射线光子能量降低）",
                        font=CJK, color=ORANGE).scale(0.4).to_edge(DOWN, buff=0.6)
        self.play(Transform(vt_note1, vt_note2))
        self.play(U_tracker.animate.set_value(15.0), run_time=2.0)
        self.wait(0.6)
        self.play(U_tracker.animate.set_value(50.0), run_time=1.5)
        self.wait(0.8)

        vt_clearout = VGroup(vt_title, bar_bg, bar_label, formula_vt, vt_note1, bar)
        self.play(FadeOut(vt_clearout), FadeOut(u_display), FadeOut(v_display))
        self.wait(0.3)

        # ── Step 7: 能量分配条形图（99% 热 / 1% X 射线）────────────────
        energy_title = Text("能量分配：X 射线管效率极低！", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(energy_title))

        # 背景总条
        total_bar = Rectangle(width=8.0, height=0.85, color=WHITE, stroke_width=1.5, fill_opacity=0.08)
        total_bar.move_to(DOWN * 0.3)

        # 热量（99%）
        heat_bar = Rectangle(width=7.92, height=0.85, color=RED, fill_opacity=0.80)
        heat_bar.align_to(total_bar, LEFT)
        heat_bar.align_to(total_bar, UP)

        # X 射线（1%）— 叠在右侧
        xray_bar_width = 0.08
        xray_bar = Rectangle(width=xray_bar_width, height=0.85, color=BLUE, fill_opacity=1.0)
        xray_bar.align_to(total_bar, RIGHT)
        xray_bar.align_to(total_bar, UP)

        heat_label_zh = Text("热量（约 99%）", font=CJK, color=RED).scale(0.44)
        heat_label_zh.next_to(total_bar, UP, buff=0.25)
        xray_bar_label_zh = Text("X 射线（~1%）", font=CJK, color=BLUE).scale(0.4)
        xray_bar_label_zh.next_to(total_bar, DOWN, buff=0.28)

        percent_heat = MathTex(r"\approx 99\%", color=RED).scale(0.7)
        percent_heat.move_to(heat_bar.get_center())
        percent_xray = MathTex(r"\approx 1\%", color=CYAN).scale(0.55)
        percent_xray.next_to(xray_bar, DOWN, buff=0.15)

        self.play(Create(total_bar))
        self.play(FadeIn(heat_bar), FadeIn(heat_label_zh))
        self.play(Write(percent_heat))
        self.wait(0.6)
        self.play(FadeIn(xray_bar), FadeIn(xray_bar_label_zh))
        self.play(Write(percent_xray))
        self.wait(0.6)

        remark_zh = Text("绝大部分能量变成热——这就是钨靶需要散热的原因！",
                         font=CJK, color=ORANGE).scale(0.42)
        remark_zh.next_to(total_bar, DOWN, buff=0.85)
        self.play(FadeIn(remark_zh))
        self.wait(2.0)

        energy_grp = VGroup(
            energy_title, total_bar, heat_bar, xray_bar,
            heat_label_zh, xray_bar_label_zh,
            percent_heat, percent_xray, remark_zh
        )
        self.play(FadeOut(energy_grp))
        self.wait(0.3)

        # ── Step 8: 数值例子 ─────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ex_title))

        ex_cond = Text("已知管电压 U = 100 kV，求电子末速 v 与 X 射线最高频率", font=CJK).scale(0.44)
        ex_cond.next_to(ex_title, DOWN, buff=0.35)
        self.play(FadeIn(ex_cond))
        self.wait(0.8)

        ex_v = MathTex(
            r"v = \sqrt{\frac{2eU}{m_e}} = \sqrt{\frac{2\times1.6\times10^{-19}\times10^5}{9.11\times10^{-31}}}",
            color=YELLOW
        ).scale(0.62)
        ex_v.next_to(ex_cond, DOWN, buff=0.35)
        self.play(Write(ex_v))
        self.wait(1.0)

        ex_v2 = MathTex(r"\approx 1.88\times10^{8}\ \mathrm{m/s}\ (0.63c)", color=GREEN).scale(0.75)
        ex_v2.next_to(ex_v, DOWN, buff=0.3)
        self.play(FadeIn(ex_v2))
        self.wait(0.8)

        ex_nu = MathTex(r"\nu_{\max}=\frac{eU}{h}=\frac{1.6\times10^{-19}\times10^5}{6.626\times10^{-34}}\approx2.42\times10^{19}\ \mathrm{Hz}",
                        color=CYAN).scale(0.60)
        ex_nu.next_to(ex_v2, DOWN, buff=0.3)
        self.play(Write(ex_nu))
        self.wait(1.8)

        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_v, ex_v2, ex_nu)))
        self.wait(0.3)

        # ── Step 9: 小结卡 ───────────────────────────────────────────────
        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sum_title))

        s1 = VGroup(
            Text("加速公式：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"eU = \tfrac{1}{2}m_e v^2", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("最高频率：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"h\nu_{\max} = eU", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.2)

        s3 = Text("轫致辐射：高速电子进入核电场 → 偏转减速 → 释放光子", font=CJK, color=GREEN).scale(0.43)
        s4 = Text("效率极低：约 99% 变热，仅约 1% 成为 X 射线", font=CJK, color=RED).scale(0.43)
        s5 = Text("控制变量：提高管电压 U → 更高能量、更短波长的 X 射线", font=CJK, color=CYAN).scale(0.42)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.12)

        self.play(FadeIn(s1), FadeIn(s2))
        self.play(FadeIn(s3))
        self.play(FadeIn(s4))
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Kp1XrayTubeBremsstrahlung",
        "id": "phys-ch14-14.1-kp1-xray-tube-bremsstrahlung",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "X 射线管结构与轫致辐射机制",
        "description": "从剖面结构图到单电子偏转辐射动画，再到能量分配条形图，三步讲清 X 射线管工作原理与轫致辐射机制。",
    },
]
