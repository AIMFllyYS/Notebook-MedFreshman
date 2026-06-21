"""第 3.1 节 · 例题：浮木简谐振动的证明与周期

物理动画范式：受力分析（动态箭头 + ValueTracker 位移）→ 合力推导 → SHM 判定 → x-t 曲线。
全程 4 大步骤 12 个动画节拍，约 100–120s。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch03Ex1FloatingBlockShm(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("浮木简谐振动：证明与周期", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第三章 振动 · 3.1  例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("把一块木头按入水中再松手——", font=CJK).scale(0.48)
        ana2 = Text("它会上下反复振动，而不会停在某处。", font=CJK).scale(0.48)
        ana3 = Text("这种振动是简谐振动吗？周期有多长？", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 画浮木示意图（平衡位置）
        # ══════════════════════════════════════════════════════════════════
        # 布局：左侧画图，右侧留给公式
        diagram_x = -3.2   # 图形中心 x

        # 水面线
        water_surface_y = 0.4
        water_line = Line(
            start=np.array([diagram_x - 2.0, water_surface_y, 0]),
            end=np.array([diagram_x + 2.0, water_surface_y, 0]),
            color=BLUE,
            stroke_width=2,
        )
        water_label = Text("水面", font=CJK, color=BLUE).scale(0.35)
        water_label.next_to(water_line.get_end(), RIGHT, buff=0.15)

        # 水体（蓝色半透明矩形，在水面以下）
        water_body = Rectangle(
            width=4.0, height=2.0, color=BLUE, fill_opacity=0.18, stroke_width=0
        ).move_to(np.array([diagram_x, water_surface_y - 1.0, 0]))

        # 木块：宽 1.4，总高 1.5，平衡时入水深度 a=0.7，露出 0.8
        block_width = 1.4
        block_total_h = 1.5
        equil_submerge = 0.7   # 平衡时入水深度 a
        block_above_h = block_total_h - equil_submerge  # 露出水面高度

        block_rect = Rectangle(
            width=block_width,
            height=block_total_h,
            color=YELLOW,
            fill_color="#C8A020",
            fill_opacity=0.85,
            stroke_width=2,
        )
        # 木块底部 y = water_surface_y - equil_submerge
        block_rect.move_to(np.array([
            diagram_x,
            water_surface_y - equil_submerge + block_total_h / 2,
            0
        ]))

        # 水下浸没部分（蓝色遮罩，模拟水中部分颜色加深）
        submerged_rect = Rectangle(
            width=block_width,
            height=equil_submerge,
            color=BLUE,
            fill_color="#1060C0",
            fill_opacity=0.35,
            stroke_width=0,
        ).move_to(np.array([
            diagram_x,
            water_surface_y - equil_submerge / 2,
            0
        ]))

        # 标注 a（水面到木块底部的距离）
        brace_a = Brace(
            Line(
                start=np.array([diagram_x + block_width / 2 + 0.05, water_surface_y - equil_submerge, 0]),
                end=np.array([diagram_x + block_width / 2 + 0.05, water_surface_y, 0]),
            ),
            direction=RIGHT, color=GREEN
        )
        lbl_a = MathTex(r"a", color=GREEN).scale(0.7).next_to(brace_a, RIGHT, buff=0.1)

        # 标注 S（底面积）
        lbl_S_text = Text("底面积 S", font=CJK, color=ORANGE).scale(0.35)
        lbl_S_text.next_to(block_rect, DOWN, buff=0.25)

        # 说明文字
        note_equil = Text("平衡位置：浮力 = 重力", font=CJK, color=GREEN).scale(0.38)
        note_equil.next_to(lbl_S_text, DOWN, buff=0.2)

        # 平衡方程
        eq_equil = MathTex(r"mg = \rho g a S", color=GREEN).scale(0.65)
        eq_equil.next_to(note_equil, DOWN, buff=0.2)

        self.play(FadeIn(water_body), Create(water_line), FadeIn(water_label))
        self.play(Create(block_rect), FadeIn(submerged_rect))
        self.play(Create(brace_a), Write(lbl_a))
        self.play(FadeIn(lbl_S_text))
        self.wait(0.6)
        self.play(FadeIn(note_equil))
        self.play(Write(eq_equil))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 向下位移 x，动态浮力/重力箭头
        # ══════════════════════════════════════════════════════════════════
        step2_title = Text("向下偏移 x 后的受力", font=CJK, color=BLUE).scale(0.45)
        step2_title.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(step2_title))

        # ValueTracker 驱动位移 x
        x_tracker = ValueTracker(0.0)
        x_max = 0.45   # 最大下沉量（屏幕单位）

        # 木块随 x 下移（always_redraw）
        def make_block():
            xv = x_tracker.get_value()
            cy = water_surface_y - equil_submerge + block_total_h / 2 - xv
            return Rectangle(
                width=block_width, height=block_total_h,
                color=YELLOW, fill_color="#C8A020", fill_opacity=0.85, stroke_width=2,
            ).move_to(np.array([diagram_x, cy, 0]))

        def make_submerged():
            xv = x_tracker.get_value()
            sub_h = equil_submerge + xv
            cy = water_surface_y - sub_h / 2
            return Rectangle(
                width=block_width, height=sub_h,
                color=BLUE, fill_color="#1060C0", fill_opacity=0.45, stroke_width=0,
            ).move_to(np.array([diagram_x, cy, 0]))

        # 浮力箭头（向上，长度 ∝ (a+x)）
        F_scale = 1.4   # 箭头缩放比
        def make_buoy_arrow():
            xv = x_tracker.get_value()
            length = (equil_submerge + xv) * F_scale + 0.3
            block_bottom_y = water_surface_y - equil_submerge - xv
            start = np.array([diagram_x, block_bottom_y, 0])
            end = np.array([diagram_x, block_bottom_y + length, 0])
            return Arrow(start=start, end=end, color=CYAN, buff=0, stroke_width=4,
                         max_tip_length_to_length_ratio=0.18)

        # 重力箭头（向下，固定长度）
        def make_gravity_arrow():
            xv = x_tracker.get_value()
            block_top_y = water_surface_y - equil_submerge + block_total_h - xv
            length = equil_submerge * F_scale + 0.3
            start = np.array([diagram_x, block_top_y, 0])
            end = np.array([diagram_x, block_top_y - length, 0])
            return Arrow(start=start, end=end, color=RED, buff=0, stroke_width=4,
                         max_tip_length_to_length_ratio=0.18)

        dyn_block = always_redraw(make_block)
        dyn_sub = always_redraw(make_submerged)
        dyn_buoy = always_redraw(make_buoy_arrow)
        dyn_grav = always_redraw(make_gravity_arrow)

        # 箭头标签（右侧固定位置）
        lbl_buoy = VGroup(
            Text("浮力", font=CJK, color=CYAN).scale(0.38),
            MathTex(r"F_{\text{b}}=\rho g(a+x)S", color=CYAN).scale(0.52),
        ).arrange(RIGHT, buff=0.1).move_to(np.array([diagram_x + 2.4, 0.8, 0]))

        lbl_grav = VGroup(
            Text("重力", font=CJK, color=RED).scale(0.38),
            MathTex(r"mg=\rho g a S", color=RED).scale(0.52),
        ).arrange(RIGHT, buff=0.1).move_to(np.array([diagram_x + 2.4, 1.7, 0]))

        # 位移标注 x（brace，随动）
        def make_x_brace():
            xv = x_tracker.get_value()
            if xv < 0.01:
                return VGroup()
            p1 = np.array([diagram_x - block_width / 2 - 0.12, water_surface_y - equil_submerge - xv, 0])
            p2 = np.array([diagram_x - block_width / 2 - 0.12, water_surface_y - equil_submerge, 0])
            br = Brace(Line(p1, p2), direction=LEFT, color=ORANGE)
            lbl = MathTex(r"x", color=ORANGE).scale(0.65).next_to(br, LEFT, buff=0.1)
            return VGroup(br, lbl)

        dyn_x_brace = always_redraw(make_x_brace)

        # 替换静态木块为动态木块
        self.play(
            FadeOut(block_rect),
            FadeOut(submerged_rect),
            FadeOut(brace_a),
            FadeOut(lbl_a),
            FadeOut(lbl_S_text),
            FadeOut(note_equil),
            FadeOut(eq_equil),
        )
        self.add(dyn_block, dyn_sub)
        self.play(
            FadeIn(dyn_buoy),
            FadeIn(dyn_grav),
            FadeIn(lbl_buoy),
            FadeIn(lbl_grav),
        )
        self.add(dyn_x_brace)
        self.wait(0.5)

        # 动画：木块向下运动
        self.play(x_tracker.animate.set_value(x_max), run_time=2.2, rate_func=smooth)
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 受力分析推导 F = -kx（右侧面板）
        # ══════════════════════════════════════════════════════════════════
        panel_x = 2.5   # 右侧面板中心 x

        derive_title = Text("受力分析", font=CJK, color=YELLOW).scale(0.45)
        derive_title.move_to(np.array([panel_x, 1.9, 0]))

        # 推导各行
        d1 = MathTex(r"F = mg - F_{\text{b}}", color=WHITE).scale(0.62)
        d2 = MathTex(r"= \rho g a S - \rho g(a+x)S", color=WHITE).scale(0.62)
        d3 = MathTex(r"= -\rho g S \cdot x", color=YELLOW).scale(0.70)
        d4 = MathTex(r"= -kx", color=GREEN).scale(0.80)
        d5 = MathTex(r"k = \rho g S", color=GREEN).scale(0.65)

        derivation = VGroup(d1, d2, d3, d4, d5).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        derivation.move_to(np.array([panel_x, 0.3, 0]))

        self.play(Write(derive_title))
        self.play(Write(d1))
        self.wait(0.6)
        self.play(Write(d2))
        self.wait(0.7)
        self.play(Write(d3))
        self.wait(0.7)
        self.play(Write(d4))
        self.play(Write(d5))
        self.wait(1.2)

        # 框住 F = -kx 结论
        box_fkx = SurroundingRectangle(VGroup(d4, d5), color=GREEN, buff=0.18, corner_radius=0.1)
        shm_label = Text("这是简谐振动！", font=CJK, color=GREEN).scale(0.42)
        shm_label.next_to(box_fkx, DOWN, buff=0.22)
        self.play(Create(box_fkx), FadeIn(shm_label))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 推导 ω 和 T（清除推导，展示关键结果）
        # ══════════════════════════════════════════════════════════════════
        # 清除图形和受力分析
        self.play(
            FadeOut(VGroup(
                water_body, water_line, water_label,
                dyn_block, dyn_sub, dyn_buoy, dyn_grav,
                dyn_x_brace, lbl_buoy, lbl_grav,
                derive_title, derivation, box_fkx, shm_label,
                step2_title,
            ))
        )
        self.wait(0.4)

        # 重新展示推导过程（更大、居中）
        omega_title = Text("求角频率与周期", font=CJK, color=BLUE).scale(0.48)
        omega_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(omega_title))

        # 分步显示
        row1_lbl = Text("已知：", font=CJK, color=WHITE).scale(0.42)
        row1_eq = MathTex(r"k = \rho g S,\quad m = \rho_0 a S", color=WHITE).scale(0.68)
        row1 = VGroup(row1_lbl, row1_eq).arrange(RIGHT, buff=0.2)

        row2_lbl = Text("角频率：", font=CJK, color=WHITE).scale(0.42)
        row2_eq = MathTex(
            r"\omega = \sqrt{\frac{k}{m}} = \sqrt{\frac{\rho g S}{\rho_0 a S}}",
            color=YELLOW
        ).scale(0.68)
        row2 = VGroup(row2_lbl, row2_eq).arrange(RIGHT, buff=0.2)

        # 对于均匀浮木 ρ₀=ρ（浸没比例给出 m/S=ρa），简化
        row3_lbl = Text("（对均匀木块", font=CJK, color=WHITE).scale(0.40)
        row3_mid = MathTex(r"m = \rho a S", color=WHITE).scale(0.60)
        row3_end = Text("，密度约消：）", font=CJK, color=WHITE).scale(0.40)
        row3 = VGroup(row3_lbl, row3_mid, row3_end).arrange(RIGHT, buff=0.1)

        row4_lbl = Text("化简：", font=CJK, color=WHITE).scale(0.42)
        row4_eq = MathTex(r"\omega = \sqrt{\frac{g}{a}}", color=YELLOW).scale(0.85)
        row4 = VGroup(row4_lbl, row4_eq).arrange(RIGHT, buff=0.2)

        row5_lbl = Text("周期：", font=CJK, color=GREEN).scale(0.42)
        row5_eq = MathTex(r"T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{a}{g}}", color=GREEN).scale(0.85)
        row5 = VGroup(row5_lbl, row5_eq).arrange(RIGHT, buff=0.2)

        all_rows = VGroup(row1, row2, row3, row4, row5).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        all_rows.next_to(omega_title, DOWN, buff=0.4)
        all_rows.scale_to_fit_width(11.5)

        self.play(FadeIn(row1))
        self.wait(0.8)
        self.play(Write(row2))
        self.wait(0.7)
        self.play(FadeIn(row3))
        self.wait(0.5)
        self.play(Write(row4))
        self.wait(0.8)
        self.play(Write(row5))
        self.wait(1.0)

        # 高亮周期公式
        box_T = SurroundingRectangle(row5, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(box_T))
        self.wait(1.5)

        self.play(FadeOut(VGroup(omega_title, all_rows, box_T)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: x-t 简谐振动曲线（ValueTracker 扫动高亮）
        # ══════════════════════════════════════════════════════════════════
        curve_title = Text("位移-时间曲线（简谐振动）", font=CJK, color=BLUE).scale(0.48)
        curve_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(curve_title))

        # 假设 a = 0.5 m，g = 10，则 T = 2π√0.05 ≈ 1.40 s，ω = √20 ≈ 4.47
        a_val = 0.5
        g_val = 10.0
        omega_val = math.sqrt(g_val / a_val)
        T_val = 2 * math.pi / omega_val
        A_val = 0.3  # 振幅（可视化用）

        axes_xt = Axes(
            x_range=[0, 2 * T_val + 0.1, T_val / 2],
            y_range=[-A_val * 1.5, A_val * 1.5, A_val],
            x_length=10,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True},
        ).next_to(curve_title, DOWN, buff=0.35)

        x_lbl = MathTex(r"t\,/\mathrm{s}").scale(0.55).next_to(axes_xt.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"x\,/\mathrm{m}").scale(0.55).next_to(axes_xt.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes_xt), FadeIn(x_lbl), FadeIn(y_lbl))

        # 绘制 x(t) = A cos(ωt) 曲线（t 从 0 到 2T）
        shm_curve = axes_xt.plot(
            lambda t: A_val * math.cos(omega_val * t),
            x_range=[0, 2 * T_val],
            color=YELLOW,
        )
        self.play(Create(shm_curve), run_time=2.0)
        self.wait(0.5)

        # 标注振幅 A
        amp_dot = Dot(axes_xt.c2p(0, A_val), color=RED)
        amp_brace = Brace(
            Line(axes_xt.c2p(0, 0), axes_xt.c2p(0, A_val)), direction=LEFT, color=RED
        )
        amp_lbl = MathTex(r"A", color=RED).scale(0.6).next_to(amp_brace, LEFT, buff=0.1)
        self.play(FadeIn(amp_dot), Create(amp_brace), Write(amp_lbl))
        self.wait(0.5)

        # 标注周期 T（双箭头）
        T_x1 = axes_xt.c2p(0, -A_val * 1.3)
        T_x2 = axes_xt.c2p(T_val, -A_val * 1.3)
        T_arrow = DoubleArrow(start=T_x1, end=T_x2, color=GREEN, stroke_width=3,
                              tip_length=0.18)
        T_lbl = MathTex(r"T=2\pi\sqrt{\dfrac{a}{g}}", color=GREEN).scale(0.58)
        T_lbl.next_to(T_arrow, DOWN, buff=0.15)
        self.play(Create(T_arrow), Write(T_lbl))
        self.wait(1.8)

        # 运动轨迹点扫动
        t_tracker = ValueTracker(0.0)
        moving_dot = always_redraw(
            lambda: Dot(
                axes_xt.c2p(t_tracker.get_value(),
                            A_val * math.cos(omega_val * t_tracker.get_value())),
                color=RED, radius=0.10,
            )
        )
        self.add(moving_dot)
        self.play(t_tracker.animate.set_value(2 * T_val), run_time=4.0, rate_func=linear)
        self.wait(0.5)

        self.play(FadeOut(VGroup(
            axes_xt, x_lbl, y_lbl, shm_curve,
            amp_dot, amp_brace, amp_lbl,
            T_arrow, T_lbl, moving_dot, curve_title,
        )))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(s_title))

        s1_lbl = Text("合力：", font=CJK, color=WHITE).scale(0.42)
        s1_eq = MathTex(r"F = -\rho g S \cdot x = -kx", color=YELLOW).scale(0.75)
        s1 = VGroup(s1_lbl, s1_eq).arrange(RIGHT, buff=0.2)

        s2_lbl = Text("角频率：", font=CJK, color=WHITE).scale(0.42)
        s2_eq = MathTex(r"\omega = \sqrt{\dfrac{g}{a}}", color=YELLOW).scale(0.75)
        s2 = VGroup(s2_lbl, s2_eq).arrange(RIGHT, buff=0.2)

        s3_lbl = Text("周期：", font=CJK, color=GREEN).scale(0.42)
        s3_eq = MathTex(r"T = 2\pi\sqrt{\dfrac{a}{g}}", color=GREEN).scale(0.80)
        s3 = VGroup(s3_lbl, s3_eq).arrange(RIGHT, buff=0.2)

        s4 = Text("结论：合力与位移成正比反向 → 简谐振动", font=CJK, color=GREEN).scale(0.42)
        s5 = Text("周期只与平衡时入水深度 a 及 g 有关", font=CJK, color=CYAN).scale(0.40)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.35)
        summary.scale_to_fit_width(12.0)

        box_summary = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.wait(0.4)
        self.play(FadeIn(s5))
        self.play(Create(box_summary))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box_summary, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch03Ex1FloatingBlockShm",
        "id": "phys-ch03-3.1-ex1-floating-block-shm",
        "chapterId": "ch03",
        "sectionId": "3.1",
        "title": "浮木简谐振动的证明与周期",
        "description": "通过浮力与重力的动态受力分析，推导合力 F=-kx，证明浮木振动为简谐振动，并得出周期 T=2π√(a/g)。",
    },
]
