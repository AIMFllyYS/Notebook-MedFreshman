"""第 5.1 节 · 例题：湖底气泡上升至湖面的体积变化（理想气体状态方程）

用湖泊截面图 + 双仪表盘 + 状态方程逐步代入，帮助零基础读者直观理解
气泡上升时压强减小、温度升高、体积如何由理想气体定律决定。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 物理常数 ───────────────────────────────────────────────────────────────
P0 = 1.013e5          # 大气压 Pa
RHO = 1.0e3           # 水密度 kg/m³
G_GRAV = 9.8          # 重力加速度 m/s²
H_DEPTH = 50.0        # 水深 m
P1 = P0 + RHO * G_GRAV * H_DEPTH   # ≈ 5.913e5 Pa
T1 = 277.0            # K  湖底温度
T2 = 290.0            # K  湖面温度
V1 = 10.0             # cm³
V2 = V1 * (P1 / P0) * (T2 / T1)   # ≈ 61.6 cm³
R_RATIO = (V2 / V1) ** (1.0 / 3.0)  # 半径放大倍数 ≈ 1.84


class Ch05Ex1GasBubbleRisingVolume(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1 : 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("湖底气泡上升至湖面的体积变化", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        sub = Text("第五章  分子动理论  ·  5.1  例题精讲", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════
        # Step 2 : 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("想象你潜入 50 m 深的湖底，", font=CJK).scale(0.48)
        ana2 = Text("呼出的气泡从湖底缓缓上升到湖面——", font=CJK).scale(0.48)
        ana3 = Text("气泡会变大还是变小？大多少？", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.6)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3 : 绘制湖泊截面图
        # ══════════════════════════════════════════════════════════════════
        # 湖面水平线
        lake_top_y = 1.2
        lake_bot_y = -2.6
        lake_left = -6.2
        lake_right = 6.2

        # 蓝色水体矩形（模拟水的区域）
        water = Rectangle(
            width=lake_right - lake_left,
            height=lake_top_y - lake_bot_y,
            fill_color=BLUE_E,
            fill_opacity=0.35,
            stroke_color=BLUE,
            stroke_width=1.5,
        ).move_to([(lake_left + lake_right) / 2, (lake_top_y + lake_bot_y) / 2, 0])

        # 湖面线
        surface_line = Line(
            [lake_left, lake_top_y, 0], [lake_right, lake_top_y, 0],
            color=CYAN, stroke_width=3
        )
        surface_lbl = Text("湖面", font=CJK, color=CYAN).scale(0.4).next_to(
            surface_line, RIGHT, buff=0.15)

        # 湖底线
        bottom_line = Line(
            [lake_left, lake_bot_y, 0], [lake_right, lake_bot_y, 0],
            color=ORANGE, stroke_width=2.5
        )
        bottom_lbl = Text("湖底", font=CJK, color=ORANGE).scale(0.4).next_to(
            bottom_line, RIGHT, buff=0.15)

        # 水深标注箭头（左侧）
        depth_arrow = DoubleArrow(
            start=[lake_left + 0.35, lake_bot_y, 0],
            end=[lake_left + 0.35, lake_top_y, 0],
            color=WHITE, buff=0, stroke_width=2.5
        )
        depth_lbl = VGroup(
            Text("h", font=CJK).scale(0.38),
            MathTex(r"=50\,\mathrm{m}").scale(0.45)
        ).arrange(RIGHT, buff=0.05)
        depth_lbl.next_to(depth_arrow, LEFT, buff=0.15)

        self.play(FadeIn(water))
        self.play(Create(surface_line), FadeIn(surface_lbl))
        self.play(Create(bottom_line), FadeIn(bottom_lbl))
        self.play(Create(depth_arrow), FadeIn(depth_lbl))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 4 : 湖底气泡状态参数
        # ══════════════════════════════════════════════════════════════════
        bubble1_center = np.array([-1.0, lake_bot_y + 0.45, 0])
        r1_screen = 0.22      # 湖底气泡显示半径（屏幕单位）

        bubble1 = Circle(radius=r1_screen, color=CYAN, fill_color=CYAN,
                         fill_opacity=0.3, stroke_width=2)
        bubble1.move_to(bubble1_center)

        # 湖底状态参数文字块（右侧）
        st1_title = Text("湖底状态", font=CJK, color=ORANGE).scale(0.42)
        st1_p = VGroup(
            Text("p1 =", font=CJK, color=YELLOW).scale(0.38),
            MathTex(r"p_0+\rho g h", color=YELLOW).scale(0.45),
            MathTex(r"\approx 5.91\times10^5\,\mathrm{Pa}", color=YELLOW).scale(0.42),
        ).arrange(RIGHT, buff=0.08)
        st1_T = VGroup(
            Text("T1 = 277 K", font=CJK, color=GREEN).scale(0.38),
        )
        st1_V = VGroup(
            Text("V1 = 10 cm", font=CJK, color=BLUE).scale(0.38),
            MathTex(r"^3", color=BLUE).scale(0.42),
        ).arrange(RIGHT, buff=0.04)

        state1_block = VGroup(st1_title, st1_p, st1_T, st1_V).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        state1_block.move_to([2.2, lake_bot_y + 0.55, 0])

        # 连线：气泡 → 参数块
        pointer1 = DashedLine(
            bubble1_center + np.array([r1_screen, 0, 0]),
            state1_block.get_left() + np.array([-0.1, 0, 0]),
            color=WHITE, dash_length=0.12, dashed_ratio=0.5, stroke_width=1.5
        )

        self.play(Create(bubble1))
        self.wait(0.4)
        self.play(FadeIn(st1_title))
        self.play(FadeIn(st1_p))
        self.wait(0.5)
        self.play(FadeIn(st1_T))
        self.wait(0.4)
        self.play(FadeIn(st1_V))
        self.play(Create(pointer1))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 5 : 气泡上升动画 + 虚线轨迹
        # ══════════════════════════════════════════════════════════════════
        # 气泡上升路径：从湖底到湖面
        bubble2_center = np.array([-1.0, lake_top_y - 0.35, 0])

        # 虚线轨迹
        trail = DashedLine(
            bubble1_center + np.array([0, r1_screen, 0]),
            bubble2_center + np.array([0, -0.25, 0]),
            color=WHITE, dash_length=0.15, dashed_ratio=0.55, stroke_width=1.5
        )

        # 湖面气泡（半径放大 R_RATIO 倍）
        r2_screen = r1_screen * R_RATIO   # ≈ 0.405
        bubble2 = Circle(radius=r2_screen, color=YELLOW, fill_color=YELLOW,
                         fill_opacity=0.25, stroke_width=2.5)
        bubble2.move_to(bubble2_center)

        rise_text = Text("气泡上升，压强减小，温度升高，体积增大", font=CJK,
                         color=WHITE).scale(0.4).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(rise_text))

        # 气泡副本向上运动
        moving_bubble = bubble1.copy().set_color(CYAN)
        self.add(moving_bubble)
        self.play(
            moving_bubble.animate.move_to(bubble2_center).scale(R_RATIO),
            Create(trail),
            run_time=2.5
        )
        self.wait(0.5)
        # 替换为最终气泡
        self.play(FadeOut(moving_bubble), FadeIn(bubble2))
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════
        # Step 6 : 双仪表盘动态显示压强与温度变化
        # ══════════════════════════════════════════════════════════════════
        # 仪表盘区域（右下角）
        gauge_area_center = np.array([3.8, lake_bot_y + 1.6, 0])

        # 压强追踪器
        p_tracker = ValueTracker(P1)
        t_tracker = ValueTracker(T1)

        def make_p_gauge():
            p_val = p_tracker.get_value()
            frac = (p_val - P0) / (P1 - P0)   # 0=湖面, 1=湖底
            col = interpolate_color(GREEN, RED, frac)

            # 简单圆形仪表：扇形弧度表示压强
            arc_angle = frac * 200 * DEGREES
            gauge_circle = Circle(radius=0.6, color=DARK_GRAY, fill_color=DARK_GRAY,
                                  fill_opacity=0.5, stroke_width=1.5)
            gauge_circle.move_to(gauge_area_center + np.array([-1.5, 0, 0]))

            if arc_angle > 0:
                arc = Arc(
                    radius=0.52, angle=arc_angle,
                    start_angle=-200 * DEGREES / 2 - PI / 2,
                    color=col, stroke_width=8
                )
                arc.move_to(gauge_circle.get_center())
            else:
                arc = VGroup()

            p_num = MathTex(
                rf"{p_val/1e5:.2f}\times10^5\,\mathrm{{Pa}}",
                color=col
            ).scale(0.38).next_to(gauge_circle, DOWN, buff=0.12)

            p_lbl = Text("压强 p", font=CJK, color=WHITE).scale(0.35)
            p_lbl.next_to(gauge_circle, UP, buff=0.08)

            return VGroup(gauge_circle, arc, p_num, p_lbl)

        def make_t_gauge():
            t_val = t_tracker.get_value()
            frac = (t_val - T1) / (T2 - T1)
            col = interpolate_color(BLUE, ORANGE, frac)

            arc_angle = frac * 200 * DEGREES
            gauge_circle = Circle(radius=0.6, color=DARK_GRAY, fill_color=DARK_GRAY,
                                  fill_opacity=0.5, stroke_width=1.5)
            gauge_circle.move_to(gauge_area_center + np.array([1.5, 0, 0]))

            if arc_angle > 0:
                arc = Arc(
                    radius=0.52, angle=arc_angle,
                    start_angle=-200 * DEGREES / 2 - PI / 2,
                    color=col, stroke_width=8
                )
                arc.move_to(gauge_circle.get_center())
            else:
                arc = VGroup()

            t_num = MathTex(
                rf"{t_val:.0f}\,\mathrm{{K}}",
                color=col
            ).scale(0.42).next_to(gauge_circle, DOWN, buff=0.12)

            t_lbl = Text("温度 T", font=CJK, color=WHITE).scale(0.35)
            t_lbl.next_to(gauge_circle, UP, buff=0.08)

            return VGroup(gauge_circle, arc, t_num, t_lbl)

        p_gauge = always_redraw(make_p_gauge)
        t_gauge = always_redraw(make_t_gauge)

        gauge_title = Text("参数变化（湖底 → 湖面）", font=CJK, color=WHITE).scale(0.38)
        gauge_title.move_to(gauge_area_center + np.array([0, 1.1, 0]))

        self.play(FadeIn(gauge_title), FadeIn(p_gauge), FadeIn(t_gauge))
        self.wait(0.5)

        # 动态演示压强减小、温度升高
        self.play(
            p_tracker.animate.set_value(P0),
            t_tracker.animate.set_value(T2),
            run_time=3.0
        )
        self.wait(1.2)
        self.play(FadeOut(rise_text))

        # ══════════════════════════════════════════════════════════════════
        # Step 7 : 引出状态方程
        # ══════════════════════════════════════════════════════════════════
        # 清空仪表盘区域、湖底状态标签等，保留湖泊图
        self.play(
            FadeOut(VGroup(gauge_title, p_gauge, t_gauge)),
            FadeOut(VGroup(state1_block, pointer1)),
            FadeOut(VGroup(depth_arrow, depth_lbl)),
        )
        self.wait(0.5)

        eq_title = Text("理想气体过程方程", font=CJK, color=BLUE).scale(0.46)
        eq_title.to_edge(RIGHT, buff=0.5).shift(UP * 1.0)

        eq_main = MathTex(
            r"\frac{p_1 V_1}{T_1}", r"=", r"\frac{p_2 V_2}{T_2}",
            color=WHITE
        ).scale(0.8)
        eq_main.next_to(eq_title, DOWN, buff=0.35)

        note_eq = Text("（理想气体：两态之间，物质量不变）", font=CJK, color=GRAY).scale(0.36)
        note_eq.next_to(eq_main, DOWN, buff=0.22)

        self.play(FadeIn(eq_title))
        self.play(Write(eq_main))
        self.wait(0.6)
        self.play(FadeIn(note_eq))
        self.wait(1.2)

        # ══════════════════════════════════════════════════════════════════
        # Step 8 : 高亮 V2，解出 V2
        # ══════════════════════════════════════════════════════════════════
        # 高亮框圈出 V2
        box_v2 = SurroundingRectangle(eq_main[2], color=YELLOW, buff=0.12, corner_radius=0.08)
        lbl_v2 = Text("求此项", font=CJK, color=YELLOW).scale(0.36).next_to(box_v2, UP, buff=0.12)
        self.play(Create(box_v2), FadeIn(lbl_v2))
        self.wait(0.8)

        # 解 V2 公式
        eq_solve = MathTex(
            r"V_2 = V_1 \cdot \frac{p_1}{p_2} \cdot \frac{T_2}{T_1}",
            color=YELLOW
        ).scale(0.78)
        eq_solve.next_to(note_eq, DOWN, buff=0.35)
        self.play(FadeOut(VGroup(box_v2, lbl_v2)))
        self.play(Write(eq_solve))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 9 : 逐步代入数值
        # ══════════════════════════════════════════════════════════════════
        sub1 = MathTex(
            r"= 10 \cdot \frac{5.91\times10^5}{1.013\times10^5} \cdot \frac{290}{277}",
            color=GREEN
        ).scale(0.68)
        sub1.next_to(eq_solve, DOWN, buff=0.28)

        sub2 = MathTex(
            r"= 10 \times 5.835 \times 1.047",
            color=GREEN
        ).scale(0.68)
        sub2.next_to(sub1, DOWN, buff=0.22)

        sub3 = MathTex(
            r"\approx 61.1\ \mathrm{cm}^3",
            color=YELLOW
        ).scale(0.82)
        sub3.next_to(sub2, DOWN, buff=0.22)
        box_ans = SurroundingRectangle(sub3, color=YELLOW, buff=0.14, corner_radius=0.1)

        self.play(Write(sub1))
        self.wait(0.8)
        self.play(Write(sub2))
        self.wait(0.6)
        self.play(Write(sub3), Create(box_ans))
        self.wait(1.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 10 : 气泡半径放大动画
        # ══════════════════════════════════════════════════════════════════
        grow_text = Text("V2/V1 ≈ 6.1 倍  →  半径放大约 1.84 倍", font=CJK,
                         color=ORANGE).scale(0.4).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(grow_text))

        # 让湖面气泡视觉上"弹出"放大
        self.play(
            bubble2.animate.scale(1.18),
            run_time=1.0
        )
        self.play(
            bubble2.animate.scale(1.0 / 1.18),
            run_time=0.5
        )
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 11 : 最终并排对比两个气泡真实比例
        # ══════════════════════════════════════════════════════════════════
        # 清场——保留标题，移除湖泊图和公式推导
        self.play(
            FadeOut(VGroup(
                water, surface_line, surface_lbl,
                bottom_line, bottom_lbl,
                bubble1, bubble2, trail,
                eq_title, eq_main, note_eq,
                eq_solve, sub1, sub2, sub3, box_ans,
                grow_text,
            ))
        )
        self.wait(0.4)

        compare_title = Text("真实比例对比", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(compare_title))

        # 真实比例尺：r1 = 0.4 屏幕单位，r2 = r1 * R_RATIO
        r_base = 0.42
        r1_cmp = r_base
        r2_cmp = r_base * R_RATIO

        cmp_bubble1 = Circle(radius=r1_cmp, color=CYAN, fill_color=CYAN,
                             fill_opacity=0.30, stroke_width=2.5)
        cmp_bubble1.move_to([-2.5, -0.5, 0])

        cmp_bubble2 = Circle(radius=r2_cmp, color=YELLOW, fill_color=YELLOW,
                             fill_opacity=0.25, stroke_width=2.5)
        cmp_bubble2.move_to([1.8, -0.5, 0])

        lbl_b1_top = Text("湖底气泡", font=CJK, color=CYAN).scale(0.4)
        lbl_b1_top.next_to(cmp_bubble1, UP, buff=0.18)
        lbl_b1_v = VGroup(
            MathTex(r"V_1=10\,\mathrm{cm}^3", color=CYAN).scale(0.5)
        )
        lbl_b1_v.next_to(cmp_bubble1, DOWN, buff=0.18)

        lbl_b2_top = Text("湖面气泡", font=CJK, color=YELLOW).scale(0.4)
        lbl_b2_top.next_to(cmp_bubble2, UP, buff=0.18)
        lbl_b2_v = VGroup(
            MathTex(r"V_2\approx61.1\,\mathrm{cm}^3", color=YELLOW).scale(0.5)
        )
        lbl_b2_v.next_to(cmp_bubble2, DOWN, buff=0.18)

        ratio_lbl = VGroup(
            MathTex(r"\frac{V_2}{V_1}\approx6.1", color=GREEN).scale(0.7),
            Text("（体积变为约 6 倍）", font=CJK, color=GREEN).scale(0.42),
        ).arrange(DOWN, buff=0.12)
        ratio_lbl.move_to([5.0, -0.5, 0])

        self.play(
            Create(cmp_bubble1), FadeIn(lbl_b1_top), FadeIn(lbl_b1_v)
        )
        self.wait(0.4)
        self.play(
            Create(cmp_bubble2), FadeIn(lbl_b2_top), FadeIn(lbl_b2_v)
        )
        self.wait(0.6)
        self.play(FadeIn(ratio_lbl))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 12 : 小结卡
        # ══════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(VGroup(
                compare_title,
                cmp_bubble1, cmp_bubble2,
                lbl_b1_top, lbl_b1_v,
                lbl_b2_top, lbl_b2_v,
                ratio_lbl,
            ))
        )
        self.wait(0.3)

        sum_title = Text("本题小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"p_1 = p_0 + \rho g h \approx 5.91\times10^5\,\mathrm{Pa}",
                     color=YELLOW).scale(0.62)
        s2 = MathTex(r"\frac{p_1 V_1}{T_1} = \frac{p_2 V_2}{T_2}",
                     color=YELLOW).scale(0.75)
        s3 = MathTex(r"V_2 = V_1\cdot\frac{p_1}{p_2}\cdot\frac{T_2}{T_1}"
                     r"\approx 61.1\,\mathrm{cm}^3",
                     color=GREEN).scale(0.65)
        s4_txt = Text("压强减小 + 温度升高  →  气泡体积变为约 6 倍", font=CJK,
                      color=WHITE).scale(0.42)
        summary = VGroup(s1, s2, s3, s4_txt).arrange(DOWN, buff=0.35)
        summary.next_to(sum_title, DOWN, buff=0.45)
        summary.scale_to_fit_width(11.5)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4_txt), Create(box_sum))
        self.wait(2.2)

        self.play(FadeOut(VGroup(sum_title, summary, box_sum, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch05Ex1GasBubbleRisingVolume",
        "id": "phys-ch05-5.1-ex1-gas-bubble-rising-volume",
        "chapterId": "ch05",
        "sectionId": "5.1",
        "title": "湖底气泡上升至湖面的体积变化",
        "description": "用湖泊截面图与双仪表盘演示气泡从50m深处上升过程中压强、温度、体积的动态变化，逐步代入理想气体状态方程求解V2≈61cm³。",
    },
]
