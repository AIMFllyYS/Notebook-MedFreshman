"""第 2.3 节 · 牛顿黏滞定律与速度梯度（金标准：两平行板 + ValueTracker 扫动）

物理动画范式：用「平行板 + 颜色渐变速度剖面」呈现黏性流动，
ValueTracker 扫动 dv/dx 和面积 S 演示 F = η·S·(dv/dx) 的直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch02Kp1NewtonViscosityLaw(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("牛顿黏滞定律与速度梯度", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.3", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("蜂蜜比水难倒，因为蜂蜜更\"粘\"——", font=CJK).scale(0.50)
        ana2 = Text("相邻流层之间存在阻碍相对运动的内摩擦力，", font=CJK).scale(0.50)
        ana3 = Text("这就是流体的黏性（viscosity）。", font=CJK).scale(0.50)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ── Step 3: 两平行板示意图 + 线性速度剖面 ───────────────────────
        # 绘制上下两块板
        plate_top = Rectangle(width=7.0, height=0.25, color=ORANGE, fill_color=ORANGE, fill_opacity=0.85)
        plate_bot = Rectangle(width=7.0, height=0.25, color=GRAY, fill_color=GRAY, fill_opacity=0.85)
        plate_top.move_to(UP * 1.55)
        plate_bot.move_to(DOWN * 1.55)

        label_top = Text("上板（运动，速度 V）", font=CJK, color=ORANGE).scale(0.38)
        label_top.next_to(plate_top, RIGHT, buff=0.18)
        label_bot = Text("下板（静止，v = 0）", font=CJK, color=GRAY).scale(0.38)
        label_bot.next_to(plate_bot, RIGHT, buff=0.18)

        # 速度箭头：从下到上，颜色从蓝(慢)到红(快)，长度线性变化
        N_ARROWS = 9
        y_bottom = -1.42   # 紧贴下板
        y_top    =  1.42   # 紧贴上板
        H = y_top - y_bottom

        def make_velocity_arrows():
            arrows = VGroup()
            for i in range(N_ARROWS):
                frac = i / (N_ARROWS - 1)          # 0 (下板) → 1 (上板)
                y = y_bottom + frac * H
                length = 0.25 + frac * 2.2          # 最短 0.25，最长 2.45
                r = frac
                b = 1.0 - frac
                color = rgb_to_color([r, 0.25, b])
                x_start = -3.2
                arr = Arrow(
                    start=np.array([x_start, y, 0]),
                    end=np.array([x_start + length, y, 0]),
                    buff=0,
                    color=color,
                    stroke_width=3,
                    max_tip_length_to_length_ratio=0.25,
                )
                arrows.add(arr)
            return arrows

        vel_arrows = make_velocity_arrows()

        # 速度剖面连线（用折线连各箭头尖端）
        tip_points = [arr.get_end() for arr in vel_arrows]
        profile_line = VMobject(color=YELLOW, stroke_width=2)
        profile_line.set_points_as_corners(tip_points)

        cap_profile = Text("线性速度剖面：越靠近上板，流速越大", font=CJK, color=YELLOW).scale(0.38)
        cap_profile.to_edge(DOWN, buff=0.55)

        self.play(Create(plate_top), Create(plate_bot))
        self.play(FadeIn(label_top), FadeIn(label_bot))
        self.wait(0.6)
        self.play(LaggedStart(*[GrowArrow(a) for a in vel_arrows], lag_ratio=0.08), run_time=1.8)
        self.play(Create(profile_line))
        self.play(FadeIn(cap_profile))
        self.wait(1.6)

        # ── Step 4: 标注剪切层、速度差 dv、法向距离 dx ─────────────────
        # 选中间两个箭头的层面做标注
        mid_idx = N_ARROWS // 2        # 第 4 号（从 0 数）
        arr_low = vel_arrows[mid_idx]
        arr_high = vel_arrows[mid_idx + 1]

        y_low  = arr_low.get_start()[1]
        y_high = arr_high.get_start()[1]
        x_ref  = -3.2

        # 剪切面（两层之间的虚线）
        shear_line = DashedLine(
            start=np.array([-3.8, (y_low + y_high) / 2, 0]),
            end=np.array([1.2,  (y_low + y_high) / 2, 0]),
            color=CYAN, stroke_width=1.5,
        )

        # dx 标注（垂直双向箭头）
        dx_arrow = DoubleArrow(
            start=np.array([-3.85, y_low, 0]),
            end=np.array([-3.85, y_high, 0]),
            buff=0, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.3,
        )
        dx_label = MathTex(r"dx", color=GREEN).scale(0.55)
        dx_label.next_to(dx_arrow, LEFT, buff=0.1)

        # v 与 v+dv 标注（沿箭头尖端右侧）
        v_label = MathTex(r"v", color=RED).scale(0.55)
        v_label.next_to(arr_low.get_end(), RIGHT, buff=0.12)
        vdv_label = MathTex(r"v + dv", color=ORANGE).scale(0.55)
        vdv_label.next_to(arr_high.get_end(), RIGHT, buff=0.12)

        # dv 的 Brace
        brace_dv = Brace(
            VGroup(arr_low.get_end_anchors()[0] * RIGHT + arr_low.get_end()[1] * UP,
                   arr_high.get_end_anchors()[0] * RIGHT + arr_high.get_end()[1] * UP),
            direction=RIGHT,
            color=ORANGE,
        )
        # 用两个点构造 Brace 的目标对象
        p_low  = Dot(arr_low.get_end(),  radius=0)
        p_high = Dot(arr_high.get_end(), radius=0)
        brace_dv2 = Brace(VGroup(p_low, p_high), direction=RIGHT, color=ORANGE)
        dv_label = MathTex(r"dv", color=ORANGE).scale(0.55)
        brace_dv2.put_at_tip(dv_label, buff=0.08)

        grad_label_group = VGroup(
            Text("速度梯度：", font=CJK, color=CYAN).scale(0.46),
            MathTex(r"\frac{dv}{dx}", color=YELLOW).scale(0.75),
            Text("(单位 s", font=CJK, color=CYAN).scale(0.46),
            MathTex(r"^{-1}", color=YELLOW).scale(0.65),
            Text(")", font=CJK, color=CYAN).scale(0.46),
        )
        grad_label_group.arrange(RIGHT, buff=0.08)
        grad_label_group.next_to(title, DOWN, buff=0.35)

        self.play(Create(shear_line))
        self.play(Create(dx_arrow), Write(dx_label))
        self.play(Write(v_label), Write(vdv_label))
        self.play(Create(brace_dv2), Write(dv_label))
        self.play(FadeIn(grad_label_group))
        self.wait(1.6)

        # 清理标注层（保留平行板和速度箭头）
        self.play(FadeOut(VGroup(
            shear_line, dx_arrow, dx_label,
            v_label, vdv_label, brace_dv2, dv_label,
            grad_label_group, cap_profile, profile_line,
            label_top, label_bot,
        )))
        self.wait(0.4)

        # ── Step 5: 牛顿黏滞定律公式逐步推导 ───────────────────────────
        law_title = Text("牛顿黏滞定律", font=CJK, color=BLUE).scale(0.52)
        law_title.next_to(title, DOWN, buff=0.35)

        step_f = MathTex(r"F", r"\propto", r"S \cdot \frac{dv}{dx}").scale(0.9)
        step_f[0].set_color(YELLOW)
        step_f[2].set_color(CYAN)
        step_f.next_to(law_title, DOWN, buff=0.40)

        step_eta = MathTex(r"F", r"=", r"\eta", r"S", r"\frac{dv}{dx}").scale(0.95)
        step_eta[0].set_color(YELLOW)
        step_eta[2].set_color(RED)
        step_eta[3].set_color(CYAN)
        step_eta.next_to(law_title, DOWN, buff=0.40)

        note_eta = VGroup(
            Text("η：动力黏度系数，单位", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\mathrm{Pa \cdot s}", color=GREEN).scale(0.68),
        ).arrange(RIGHT, buff=0.10)
        note_eta.next_to(step_eta, DOWN, buff=0.35)

        note_s = VGroup(
            Text("S：两流层接触面积，", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\frac{dv}{dx}", color=CYAN).scale(0.65),
            Text("：速度梯度", font=CJK, color=WHITE).scale(0.42),
        ).arrange(RIGHT, buff=0.10)
        note_s.next_to(note_eta, DOWN, buff=0.22)

        self.play(FadeIn(law_title))
        self.play(Write(step_f))
        self.wait(1.2)
        self.play(TransformMatchingTex(step_f, step_eta))
        self.wait(0.8)
        self.play(FadeIn(note_eta))
        self.wait(0.6)
        self.play(FadeIn(note_s))
        self.wait(1.6)
        self.play(FadeOut(VGroup(law_title, step_eta, note_eta, note_s)))

        # ── Step 6: ValueTracker – 改变 dv/dx 观察 F 箭头 ──────────────
        # 清除平行板和速度箭头，准备新场景
        self.play(FadeOut(VGroup(plate_top, plate_bot, vel_arrows)))
        self.wait(0.3)

        # 重新绘制简化的双板（小一点，留出右侧空间）
        p_top = Rectangle(width=4.5, height=0.22, color=ORANGE, fill_color=ORANGE, fill_opacity=0.8)
        p_bot = Rectangle(width=4.5, height=0.22, color=GRAY,   fill_color=GRAY,   fill_opacity=0.8)
        p_top.move_to(LEFT * 1.5 + UP * 1.4)
        p_bot.move_to(LEFT * 1.5 + DOWN * 1.4)

        dvdx = ValueTracker(1.0)   # 速度梯度（相对值，0.5 ~ 2.5）
        S_val = ValueTracker(1.0)  # 接触面积（相对值，0.5 ~ 2.0）
        ETA   = 1.0                # 固定黏度

        def make_flow_arrows_dyn():
            arrows = VGroup()
            grad = dvdx.get_value()
            for i in range(8):
                frac = i / 7
                y = -1.31 + frac * 2.62
                length = 0.15 + frac * grad * 1.5
                r = frac
                b = 1.0 - frac
                color = rgb_to_color([r, 0.2, b])
                arr = Arrow(
                    start=np.array([-3.6, y, 0]),
                    end=np.array([-3.6 + length, y, 0]),
                    buff=0, color=color, stroke_width=2.5,
                    max_tip_length_to_length_ratio=0.28,
                )
                arrows.add(arr)
            return arrows

        flow_dyn = always_redraw(make_flow_arrows_dyn)

        # 黏性力箭头（作用在上板，向左，即阻力）
        def make_F_arrow():
            F_mag = ETA * S_val.get_value() * dvdx.get_value()
            length = 0.3 + F_mag * 0.7
            length = min(length, 3.0)
            arr = Arrow(
                start=np.array([-1.0 + length * 0.5, 1.4, 0]),
                end=np.array([-1.0 - length * 0.5, 1.4, 0]),
                buff=0, color=YELLOW, stroke_width=5,
                max_tip_length_to_length_ratio=0.25,
            )
            return arr

        F_arrow = always_redraw(make_F_arrow)

        # 实时读数标签（右侧面板）
        def make_readout():
            F_val = ETA * S_val.get_value() * dvdx.get_value()
            grad_str = f"{dvdx.get_value():.1f}"
            s_str    = f"{S_val.get_value():.1f}"
            f_str    = f"{F_val:.2f}"
            t1 = Text(f"dv/dx = {grad_str} s", font=CJK, color=CYAN).scale(0.40)
            t1m = MathTex(r"^{-1}", color=CYAN).scale(0.50)
            row1 = VGroup(t1, t1m).arrange(RIGHT, buff=0.04)
            t2 = Text(f"S = {s_str} m", font=CJK, color=GREEN).scale(0.40)
            t2m = MathTex(r"^{2}", color=GREEN).scale(0.50)
            row2 = VGroup(t2, t2m).arrange(RIGHT, buff=0.04)
            t3 = Text(f"F = {f_str} N", font=CJK, color=YELLOW).scale(0.40)
            panel = VGroup(row1, row2, t3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
            panel.to_corner(UR, buff=0.55)
            return panel

        readout = always_redraw(make_readout)

        F_label = MathTex(r"F = \eta S \frac{dv}{dx}", color=YELLOW).scale(0.70)
        F_label.to_corner(DR, buff=0.6)

        F_text = Text("黏性力（阻力）", font=CJK, color=YELLOW).scale(0.40)
        F_text.move_to(LEFT * 1.0 + UP * 1.9)

        self.play(Create(p_top), Create(p_bot))
        self.add(flow_dyn, F_arrow, readout)
        self.play(FadeIn(F_text), Write(F_label))
        self.wait(0.8)

        # 增大速度梯度 → F 变大
        cap1 = Text("增大速度梯度 dv/dx → 黏性力增大", font=CJK, color=ORANGE).scale(0.42)
        cap1.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(cap1))
        self.play(dvdx.animate.set_value(2.4), run_time=2.5)
        self.wait(0.8)
        self.play(dvdx.animate.set_value(0.5), run_time=2.0)
        self.wait(0.8)
        self.play(dvdx.animate.set_value(1.0), run_time=1.2)
        self.play(FadeOut(cap1))

        # 增大面积 S → F 变大
        cap2 = Text("增大接触面积 S → 黏性力增大", font=CJK, color=GREEN).scale(0.42)
        cap2.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(cap2))
        self.play(S_val.animate.set_value(2.0), run_time=2.0)
        self.wait(0.8)
        self.play(S_val.animate.set_value(1.0), run_time=1.5)
        self.play(FadeOut(cap2))
        self.wait(0.5)

        # 清场
        self.remove(flow_dyn, F_arrow, readout)
        self.play(FadeOut(VGroup(p_top, p_bot, F_text, F_label)))

        # ── Step 7: 高黏度 vs 低黏度对比 ───────────────────────────────
        compare_title = Text("不同流体的黏性力比较（相同速度梯度）", font=CJK, color=BLUE).scale(0.48)
        compare_title.next_to(title, DOWN, buff=0.38)

        ETA_glyc = 1.49    # 甘油 (Pa·s)，近似常温值
        ETA_water = 0.001  # 水  (Pa·s)
        DVDX_ref  = 1.0
        S_ref     = 1.0

        F_glyc  = ETA_glyc  * S_ref * DVDX_ref
        F_water = ETA_water * S_ref * DVDX_ref
        scale   = 2.5 / F_glyc   # 甘油的箭头长度归一到 2.5

        # 甘油标签组
        glyc_name = Text("甘油", font=CJK, color=ORANGE).scale(0.52)
        glyc_eta  = MathTex(r"\eta \approx 1.49\ \mathrm{Pa\cdot s}", color=ORANGE).scale(0.58)
        glyc_row  = VGroup(glyc_name, glyc_eta).arrange(RIGHT, buff=0.15)
        glyc_row.move_to(LEFT * 2.0 + UP * 0.5)

        glyc_arr = Arrow(
            start=np.array([-3.5, -0.3, 0]),
            end=np.array([-3.5 + F_glyc * scale, -0.3, 0]),
            buff=0, color=ORANGE, stroke_width=6,
            max_tip_length_to_length_ratio=0.22,
        )
        glyc_f_label = MathTex(rf"F_{{glyc}} = {F_glyc:.2f}\ \mathrm{{N}}", color=ORANGE).scale(0.52)
        glyc_f_label.next_to(glyc_arr, DOWN, buff=0.15)

        # 水标签组
        water_name = Text("水", font=CJK, color=CYAN).scale(0.52)
        water_eta  = MathTex(r"\eta \approx 0.001\ \mathrm{Pa\cdot s}", color=CYAN).scale(0.58)
        water_row  = VGroup(water_name, water_eta).arrange(RIGHT, buff=0.15)
        water_row.move_to(LEFT * 2.0 + DOWN * 1.1)

        water_len = max(F_water * scale, 0.08)
        water_arr = Arrow(
            start=np.array([-3.5, -1.5, 0]),
            end=np.array([-3.5 + water_len, -1.5, 0]),
            buff=0, color=CYAN, stroke_width=6,
            max_tip_length_to_length_ratio=0.22,
        )
        water_f_label = MathTex(rf"F_{{water}} = {F_water:.4f}\ \mathrm{{N}}", color=CYAN).scale(0.52)
        water_f_label.next_to(water_arr, DOWN, buff=0.15)

        ratio_label = VGroup(
            Text("比值：", font=CJK, color=WHITE).scale(0.46),
            MathTex(rf"\frac{{F_{{glyc}}}}{{F_{{water}}}} = \frac{{{F_glyc:.2f}}}{{{F_water:.4f}}} \approx 1490", color=YELLOW).scale(0.66),
        ).arrange(RIGHT, buff=0.12)
        ratio_label.move_to(RIGHT * 1.8 + UP * 0.0)

        note_ratio = Text("甘油约为水的 1490 倍！", font=CJK, color=GREEN).scale(0.46)
        note_ratio.next_to(ratio_label, DOWN, buff=0.30)

        self.play(FadeIn(compare_title))
        self.play(FadeIn(glyc_row), GrowArrow(glyc_arr))
        self.play(FadeIn(glyc_f_label))
        self.wait(0.6)
        self.play(FadeIn(water_row), GrowArrow(water_arr))
        self.play(FadeIn(water_f_label))
        self.wait(0.8)
        self.play(FadeIn(ratio_label))
        self.play(FadeIn(note_ratio))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            compare_title,
            glyc_row, glyc_arr, glyc_f_label,
            water_row, water_arr, water_f_label,
            ratio_label, note_ratio,
        )))

        # ── Step 8: 数值例子 ────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.40)

        ex_q = VGroup(
            Text("已知：平行板间距 dx = 0.01 m，上板速度 V = 0.5 m/s，", font=CJK).scale(0.42),
            VGroup(
                Text("接触面积 S = 0.2 m", font=CJK).scale(0.42),
                MathTex(r"^{2}", color=WHITE).scale(0.52),
                Text("，水的黏度 η = 0.001 Pa·s", font=CJK).scale(0.42),
            ).arrange(RIGHT, buff=0.05),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        ex_q.next_to(ex_title, DOWN, buff=0.32)

        ex_calc1 = MathTex(r"\frac{dv}{dx} = \frac{0.5}{0.01} = 50\ \mathrm{s^{-1}}").scale(0.72)
        ex_calc2 = MathTex(r"F = 0.001 \times 0.2 \times 50 = 0.01\ \mathrm{N}",
                           color=GREEN).scale(0.72)
        ex_calc1.next_to(ex_q, DOWN, buff=0.36)
        ex_calc2.next_to(ex_calc1, DOWN, buff=0.30)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_q))
        self.wait(0.8)
        self.play(Write(ex_calc1))
        self.wait(0.8)
        self.play(Write(ex_calc2))
        self.wait(1.6)
        self.play(FadeOut(VGroup(ex_title, ex_q, ex_calc1, ex_calc2)))

        # ── Step 9: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.40)

        s1_row = VGroup(
            Text("牛顿黏滞定律：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"F = \eta S \frac{dv}{dx}", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        s2_row = VGroup(
            Text("动力黏度单位：", font=CJK, color=WHITE).scale(0.46),
            MathTex(r"\eta \in \mathrm{Pa \cdot s}", color=GREEN).scale(0.78),
        ).arrange(RIGHT, buff=0.12)

        s3 = Text("速度梯度越大 / 面积越大 / η 越大 → 黏性力越大",
                  font=CJK, color=CYAN).scale(0.44)

        s4 = Text("牛顿流体：η 为常数（水、空气）；非牛顿流体：η 随剪切率变化",
                  font=CJK, color=WHITE).scale(0.40)

        summary = VGroup(s1_row, s2_row, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1_row[1]), FadeIn(s1_row[0]))
        self.wait(0.5)
        self.play(FadeIn(s2_row))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch02Kp1NewtonViscosityLaw",
        "id": "phys-ch02-2.3-kp1-newton-viscosity-law",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "牛顿黏滞定律与速度梯度",
        "description": "用双平行板线性速度剖面演示黏性流动，ValueTracker 扫动 dv/dx 和面积 S 展示 F=ηS(dv/dx)，并对比甘油与水的黏性力之比。",
    },
]
