"""第 2.2 节 · 伯努利方程：截面变化引起的压强-流速互换。

可视化核心：
  - 水平变截面管（宽→窄→宽），三根竖直测压管液面实时反映各处静压强。
  - ValueTracker 控制流量 Q，随 Q 增大，窄段流速变快，测压管液面降低。
  - p vs S 反比曲线（h=const 时 p = p0 - ½ρ(Q/S)²）。
  - 空吸效应：窄段出现负压时管壁小孔外侧流体被吸入。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 物理常量（量纲化，仅用于演示比例）
RHO = 1.0          # 流体密度（归一化）
P0 = 4.0           # 参考总压（伯努利常数）
S_WIDE = 2.0       # 宽段截面积
S_NARROW = 0.6     # 窄段截面积


def pressure(Q, S):
    """伯努利 p + ½ρv² = P0，v = Q/S => p = P0 - ½ρ(Q/S)²"""
    v = Q / S
    return P0 - 0.5 * RHO * v ** 2


class Ch02Kp2BernoulliPressureVelocityTradeoff(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("截面变化引起的压强-流速互换", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.2 伯努利方程", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("花园浇水：用手指堵住水管口，水流得更快——", font=CJK).scale(0.48)
        ana2 = Text("这就是「截面变小 → 流速变大 → 压强变小」的伯努利效应。", font=CJK).scale(0.48)
        ana3 = Text("飞机翼、喷雾器、文丘里管……都藏着同一个秘密。", font=CJK, color=GREEN).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 公式定义（逐步出现，关键项变色）
        # ══════════════════════════════════════════════════════════════════
        def_label = Text("伯努利方程（水平管，不计粘性）：", font=CJK).scale(0.46)
        def_label.next_to(title, DOWN, buff=0.55)

        bern = MathTex(
            r"p", r"+", r"\frac{1}{2}\rho v^2", r"=", r"\text{const}"
        ).scale(0.95)
        bern[0].set_color(YELLOW)
        bern[2].set_color(ORANGE)
        bern.next_to(def_label, DOWN, buff=0.4)

        cont = MathTex(r"v = \frac{Q}{S}").scale(0.9)
        cont.next_to(bern, DOWN, buff=0.35)

        note_p = VGroup(
            Text("p  :", font=CJK, color=YELLOW).scale(0.42),
            Text("静压强", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.1)
        note_v = VGroup(
            MathTex(r"\tfrac{1}{2}\rho v^2", color=ORANGE).scale(0.55),
            Text(": 动压（动能密度）", font=CJK).scale(0.42),
        ).arrange(RIGHT, buff=0.1)
        note_cont = VGroup(
            Text("Q 流量，S 截面积", font=CJK).scale(0.42),
        )
        notes = VGroup(note_p, note_v, note_cont).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        notes.next_to(cont, DOWN, buff=0.3)

        self.play(FadeIn(def_label))
        self.play(Write(bern))
        self.wait(0.8)
        self.play(Write(cont))
        self.wait(0.5)
        self.play(FadeIn(notes))
        self.wait(1.8)
        self.play(FadeOut(VGroup(def_label, bern, cont, notes)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 变截面管图 + 三根测压管（固定几何，与 Q 无关的管壁）
        # ══════════════════════════════════════════════════════════════════
        # 管道布局（屏幕坐标，中心在 y ≈ -0.8）
        PIPE_Y = -1.8        # 管道中心线 y
        PIPE_H_WIDE = 1.0    # 宽段半高
        PIPE_H_NARROW = 0.3  # 窄段半高（比例 S_NARROW / S_WIDE）

        # x 分区（屏幕坐标）
        X_LEFT = -5.5      # 左端
        X_T1 = -2.8        # 第一测压管 x（左宽段）
        X_T1R = -1.8       # 宽→窄过渡右端
        X_T2 = 0.0         # 第二测压管 x（窄段中）
        X_T2L = -1.3       # 窄段左端
        X_T2R = 1.3        # 窄段右端
        X_T3L = 1.8        # 窄→宽过渡左端
        X_T3 = 2.8         # 第三测压管 x（右宽段）
        X_RIGHT = 5.5      # 右端

        def pipe_outline():
            """绘制变截面管轮廓（上下壁 + 过渡斜线）"""
            pts_top = [
                [X_LEFT, PIPE_Y + PIPE_H_WIDE, 0],
                [X_T1R,  PIPE_Y + PIPE_H_WIDE, 0],
                [X_T2L,  PIPE_Y + PIPE_H_NARROW, 0],
                [X_T2R,  PIPE_Y + PIPE_H_NARROW, 0],
                [X_T3L,  PIPE_Y + PIPE_H_WIDE, 0],
                [X_RIGHT, PIPE_Y + PIPE_H_WIDE, 0],
            ]
            pts_bot = [
                [X_LEFT, PIPE_Y - PIPE_H_WIDE, 0],
                [X_T1R,  PIPE_Y - PIPE_H_WIDE, 0],
                [X_T2L,  PIPE_Y - PIPE_H_NARROW, 0],
                [X_T2R,  PIPE_Y - PIPE_H_NARROW, 0],
                [X_T3L,  PIPE_Y - PIPE_H_WIDE, 0],
                [X_RIGHT, PIPE_Y - PIPE_H_WIDE, 0],
            ]
            top_wall = VMobject(color=WHITE, stroke_width=2.5)
            top_wall.set_points_as_corners([np.array(p) for p in pts_top])
            bot_wall = VMobject(color=WHITE, stroke_width=2.5)
            bot_wall.set_points_as_corners([np.array(p) for p in pts_bot])
            # 左右封口
            left_cap = Line(np.array([X_LEFT, PIPE_Y - PIPE_H_WIDE, 0]),
                            np.array([X_LEFT, PIPE_Y + PIPE_H_WIDE, 0]),
                            color=WHITE, stroke_width=2.5)
            right_cap = Line(np.array([X_RIGHT, PIPE_Y - PIPE_H_WIDE, 0]),
                             np.array([X_RIGHT, PIPE_Y + PIPE_H_WIDE, 0]),
                             color=WHITE, stroke_width=2.5)
            return VGroup(top_wall, bot_wall, left_cap, right_cap)

        pipe = pipe_outline()

        # 截面标签
        lbl_S1 = VGroup(
            Text("S", font=CJK).scale(0.38),
            MathTex(r"_1").scale(0.45),
        ).arrange(RIGHT, buff=0.02)
        lbl_S1.move_to(np.array([X_T1, PIPE_Y + PIPE_H_WIDE + 0.45, 0]))

        lbl_S2 = VGroup(
            Text("S", font=CJK).scale(0.38),
            MathTex(r"_2").scale(0.45),
        ).arrange(RIGHT, buff=0.02)
        lbl_S2.move_to(np.array([X_T2, PIPE_Y + PIPE_H_NARROW + 0.45, 0]))

        lbl_S3 = VGroup(
            Text("S", font=CJK).scale(0.38),
            MathTex(r"_3").scale(0.45),
        ).arrange(RIGHT, buff=0.02)
        lbl_S3.move_to(np.array([X_T3, PIPE_Y + PIPE_H_WIDE + 0.45, 0]))

        # 流向箭头（固定，用于视觉提示）
        flow_arrows = VGroup(
            Arrow(np.array([-4.8, PIPE_Y, 0]), np.array([-3.6, PIPE_Y, 0]),
                  color=CYAN, stroke_width=2, max_tip_length_to_length_ratio=0.3),
            Arrow(np.array([-0.5, PIPE_Y, 0]), np.array([0.5, PIPE_Y, 0]),
                  color=CYAN, stroke_width=2, max_tip_length_to_length_ratio=0.3),
            Arrow(np.array([3.6, PIPE_Y, 0]), np.array([4.8, PIPE_Y, 0]),
                  color=CYAN, stroke_width=2, max_tip_length_to_length_ratio=0.3),
        )

        self.play(Create(pipe))
        self.play(FadeIn(lbl_S1), FadeIn(lbl_S2), FadeIn(lbl_S3), FadeIn(flow_arrows))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker Q + 动态测压管 + 流速箭头 + 数值显示
        # ══════════════════════════════════════════════════════════════════
        Q = ValueTracker(0.8)   # 初始流量

        # 测压管参数
        MANOMETER_X = [X_T1, X_T2, X_T3]
        MANOMETER_S = [S_WIDE, S_NARROW, S_WIDE]
        MANOMETER_COLOR = [GREEN, RED, GREEN]
        TUBE_TOP_Y = 3.0     # 测压管顶端 y（屏幕坐标）
        P_ZERO_Y = PIPE_Y + PIPE_H_WIDE + 0.05  # 液面基准（管顶壁位置）
        P_SCALE = 1.2        # 压强 → 屏幕高度 比例

        def make_manometer(i):
            """绘制第 i 根测压管（外管 + 液柱）"""
            x = MANOMETER_X[i]
            s = MANOMETER_S[i]
            col = MANOMETER_COLOR[i]
            pipe_top_y = PIPE_Y + (PIPE_H_NARROW if i == 1 else PIPE_H_WIDE)
            p = pressure(Q.get_value(), s)
            liquid_h = max(p * P_SCALE, 0.0)   # 液柱高度（不为负）
            liquid_top_y = pipe_top_y + liquid_h
            liquid_top_y = min(liquid_top_y, TUBE_TOP_Y - 0.05)

            # 管壁（两条竖线）
            tube_left = Line(
                np.array([x - 0.12, pipe_top_y, 0]),
                np.array([x - 0.12, TUBE_TOP_Y, 0]),
                color=GREY, stroke_width=1.5,
            )
            tube_right = Line(
                np.array([x + 0.12, pipe_top_y, 0]),
                np.array([x + 0.12, TUBE_TOP_Y, 0]),
                color=GREY, stroke_width=1.5,
            )
            # 液柱
            if liquid_h > 0.02:
                liquid = Rectangle(
                    width=0.24,
                    height=min(liquid_h, TUBE_TOP_Y - pipe_top_y - 0.05),
                    color=col, fill_color=col, fill_opacity=0.6, stroke_width=0,
                )
                liquid.move_to(np.array([x, pipe_top_y + liquid_h / 2, 0]))
            else:
                liquid = VGroup()  # 空，液面低于管口

            # 液面水平线
            liq_line = Line(
                np.array([x - 0.12, pipe_top_y + liquid_h, 0]),
                np.array([x + 0.12, pipe_top_y + liquid_h, 0]),
                color=WHITE, stroke_width=2,
            ) if liquid_h > 0.02 else VGroup()

            return VGroup(tube_left, tube_right, liquid, liq_line)

        # 动态元素：用 always_redraw 更新
        mano_grp = always_redraw(lambda: VGroup(
            make_manometer(0),
            make_manometer(1),
            make_manometer(2),
        ))

        # 窄段流速箭头（随 Q 变长）
        def make_velocity_arrow():
            v2 = Q.get_value() / S_NARROW
            # 箭头长度与流速成比例，限制最大长度
            arr_len = min(v2 * 0.4, 1.8)
            start = np.array([X_T2 - arr_len / 2, PIPE_Y, 0])
            end = np.array([X_T2 + arr_len / 2, PIPE_Y, 0])
            return Arrow(start, end, color=ORANGE, stroke_width=4,
                         max_tip_length_to_length_ratio=0.25)

        vel_arrow = always_redraw(make_velocity_arrow)

        # 右侧数值显示面板
        def make_readout():
            Q_val = Q.get_value()
            v1 = Q_val / S_WIDE
            v2 = Q_val / S_NARROW
            v3 = Q_val / S_WIDE
            p1 = pressure(Q_val, S_WIDE)
            p2 = pressure(Q_val, S_NARROW)
            p3 = pressure(Q_val, S_WIDE)

            lines = VGroup(
                MathTex(rf"v_1={v1:.2f},\ p_1={p1:.2f}", color=GREEN).scale(0.45),
                MathTex(rf"v_2={v2:.2f},\ p_2={p2:.2f}", color=RED).scale(0.45),
                MathTex(rf"v_3={v3:.2f},\ p_3={p3:.2f}", color=GREEN).scale(0.45),
            ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
            lines.to_corner(UR, buff=0.45)
            return lines

        readout = always_redraw(make_readout)

        # Q 值标签
        q_label = always_redraw(
            lambda: VGroup(
                Text("Q = ", font=CJK, color=CYAN).scale(0.42),
                MathTex(rf"{Q.get_value():.2f}", color=CYAN).scale(0.45),
            ).arrange(RIGHT, buff=0.05).to_corner(UL, buff=0.5)
        )

        self.play(Create(mano_grp), Create(vel_arrow))
        self.add(readout, q_label)
        self.wait(1.0)

        # 说明文字
        cap_pipe = Text("测压管液面高度 = 该处静压强 / ρg", font=CJK, color=YELLOW).scale(0.42)
        cap_pipe.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(cap_pipe))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 增大 Q → 观察液面变化 + 核心规律
        # ══════════════════════════════════════════════════════════════════
        rule1 = Text("流量 Q 增大 → 窄段 v₂ 变大 → p₂ 变小", font=CJK, color=ORANGE).scale(0.43)
        rule1.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(cap_pipe), FadeIn(rule1))
        self.play(Q.animate.set_value(2.2), run_time=3.5, rate_func=smooth)
        self.wait(1.2)

        rule2 = Text("窄管液面明显低于宽管：截面小 → 压强低", font=CJK, color=GREEN).scale(0.43)
        rule2.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(rule1), FadeIn(rule2))
        self.wait(1.8)

        # 再降低 Q 来对比
        self.play(Q.animate.set_value(1.0), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(FadeOut(rule2))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: p vs S 反比趋势曲线
        # ══════════════════════════════════════════════════════════════════
        # 清场主图之前先移走动态元素
        self.play(FadeOut(VGroup(mano_grp, vel_arrow, readout, q_label,
                                 pipe, lbl_S1, lbl_S2, lbl_S3, flow_arrows)))

        curve_title = Text("p 与截面积 S 的关系（固定流量 Q）", font=CJK, color=BLUE).scale(0.48)
        curve_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(curve_title))

        axes = Axes(
            x_range=[0.3, 3.0, 0.5],
            y_range=[-1.0, 4.5, 1.0],
            x_length=8.5,
            y_length=4.2,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).shift(DOWN * 0.5)
        x_lbl = VGroup(
            MathTex(r"S").scale(0.55),
            Text("(截面积)", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.08).next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_lbl = VGroup(
            MathTex(r"p").scale(0.55),
            Text("(静压)", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.08).next_to(axes.y_axis.get_end(), LEFT, buff=0.2)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        Q_fixed = 1.5
        p_curve = axes.plot(
            lambda s: P0 - 0.5 * RHO * (Q_fixed / s) ** 2,
            x_range=[0.45, 2.8],
            color=YELLOW,
        )
        curve_eq = MathTex(
            r"p = P_0 - \frac{1}{2}\rho\left(\frac{Q}{S}\right)^2",
            color=YELLOW,
        ).scale(0.7).to_corner(UR, buff=0.5)

        # 标注三个工作点
        colors_pts = [GREEN, RED, GREEN]
        s_pts = [S_WIDE, S_NARROW, S_WIDE + 0.05]
        labels_pts = ["S_1", "S_2", "S_3"]
        dots_pts = VGroup()
        for s_v, c, lbl in zip(s_pts, colors_pts, labels_pts):
            p_v = P0 - 0.5 * RHO * (Q_fixed / s_v) ** 2
            dot = Dot(axes.c2p(s_v, p_v), color=c, radius=0.10)
            dot_lbl = MathTex(lbl, color=c).scale(0.5).next_to(dot, UR, buff=0.1)
            dots_pts.add(dot, dot_lbl)

        zero_line = DashedLine(
            axes.c2p(0.3, 0), axes.c2p(3.0, 0),
            color=GREY, stroke_width=1.5,
        )
        zero_lbl = MathTex(r"p=0").scale(0.45).next_to(axes.c2p(3.0, 0), RIGHT, buff=0.1)

        self.play(Create(p_curve), Write(curve_eq))
        self.play(Create(zero_line), FadeIn(zero_lbl))
        self.play(FadeIn(dots_pts))

        insight = Text("S 越小 → v 越大 → p 越低（反比关系）", font=CJK, color=GREEN).scale(0.43)
        insight.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(insight))
        self.wait(2.0)
        self.play(FadeOut(VGroup(axes, p_curve, curve_eq, x_lbl, y_lbl,
                                 zero_line, zero_lbl, dots_pts, insight, curve_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 空吸效应演示
        # ══════════════════════════════════════════════════════════════════
        suc_title = Text("应用：空吸效应（Venturi 效应）", font=CJK, color=BLUE).scale(0.5)
        suc_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(suc_title))

        # 简化管道（只画窄段）
        Y_PIPE = -0.5
        H_N = 0.4
        narrow_top = Line(np.array([-3.0, Y_PIPE + H_N, 0]),
                          np.array([3.0, Y_PIPE + H_N, 0]), color=WHITE, stroke_width=2.5)
        narrow_bot = Line(np.array([-3.0, Y_PIPE - H_N, 0]),
                          np.array([3.0, Y_PIPE - H_N, 0]), color=WHITE, stroke_width=2.5)
        main_flow = Arrow(np.array([-2.5, Y_PIPE, 0]), np.array([2.5, Y_PIPE, 0]),
                          color=CYAN, stroke_width=4, max_tip_length_to_length_ratio=0.18)
        fast_label = Text("高速流 → 低静压", font=CJK, color=ORANGE).scale(0.42)
        fast_label.next_to(narrow_top, UP, buff=0.2)

        # 管壁小孔 + 外部流体被吸入
        hole_x = 0.0
        hole_y_top = Y_PIPE + H_N
        # 外部液体（上方）
        ext_liquid = Rectangle(width=0.6, height=0.8, color=BLUE,
                               fill_color=BLUE, fill_opacity=0.35, stroke_width=0)
        ext_liquid.move_to(np.array([hole_x, hole_y_top + 0.9, 0]))
        ext_label = Text("外部高压流体", font=CJK, color=BLUE).scale(0.38)
        ext_label.next_to(ext_liquid, UP, buff=0.1)

        # 吸入箭头（向下进入管内）
        suck_arrow = Arrow(
            np.array([hole_x, hole_y_top + 0.5, 0]),
            np.array([hole_x, hole_y_top - 0.1, 0]),
            color=RED, stroke_width=3.5, max_tip_length_to_length_ratio=0.35,
        )
        neg_p_label = Text("窄段 p 低 → 外侧流体被吸入！", font=CJK, color=RED).scale(0.43)
        neg_p_label.to_edge(DOWN, buff=0.55)

        self.play(Create(narrow_top), Create(narrow_bot), Create(main_flow), FadeIn(fast_label))
        self.wait(0.8)
        self.play(FadeIn(ext_liquid), FadeIn(ext_label))
        self.wait(0.5)
        self.play(Create(suck_arrow))
        self.play(FadeIn(neg_p_label))
        self.wait(1.5)

        # 强调 Venturi 管原理
        venturi = Text("文丘里管 / 喷雾器 / 化油器——均基于此原理", font=CJK, color=YELLOW).scale(0.43)
        venturi.to_edge(DOWN, buff=0.25)
        self.play(FadeOut(neg_p_label), FadeIn(venturi))
        self.wait(1.8)
        self.play(FadeOut(VGroup(narrow_top, narrow_bot, main_flow, fast_label,
                                 ext_liquid, ext_label, suck_arrow, venturi, suc_title)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 重温完整伯努利方程（包含重力势能项）
        # ══════════════════════════════════════════════════════════════════
        full_title = Text("完整伯努利方程（含高度差）", font=CJK, color=BLUE).scale(0.5)
        full_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(full_title))

        bern_full = MathTex(
            r"p_1 + \frac{1}{2}\rho v_1^2 + \rho g h_1",
            r"=",
            r"p_2 + \frac{1}{2}\rho v_2^2 + \rho g h_2"
        ).scale(0.78)
        bern_full[0].set_color(YELLOW)
        bern_full[2].set_color(GREEN)
        bern_full.next_to(full_title, DOWN, buff=0.4)

        bern_simp = MathTex(
            r"p + \frac{1}{2}\rho v^2 + \rho g h = \text{const}"
        ).scale(0.85)
        bern_simp.set_color(YELLOW)
        bern_simp.next_to(bern_full, DOWN, buff=0.4)

        note_full = VGroup(
            Text("水平管 (h=const):", font=CJK).scale(0.42),
            MathTex(r"p + \frac{1}{2}\rho v^2 = \text{const}", color=ORANGE).scale(0.7),
        ).arrange(RIGHT, buff=0.2)
        note_full.next_to(bern_simp, DOWN, buff=0.3)

        self.play(Write(bern_full))
        self.wait(0.8)
        self.play(TransformMatchingTex(bern_full.copy(), bern_simp))
        self.wait(0.8)
        self.play(FadeIn(note_full))
        self.wait(1.8)
        self.play(FadeOut(VGroup(full_title, bern_full, bern_simp, note_full)))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 数值例题
        # ══════════════════════════════════════════════════════════════════
        ex_title = Text("数值例题", font=CJK, color=BLUE).scale(0.52)
        ex_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ex_title))

        ex_cond = VGroup(
            Text("宽管 S₁ = 80 cm²，窄管 S₂ = 20 cm²", font=CJK).scale(0.44),
            Text("宽段流速 v₁ = 0.5 m/s，水密度 ρ = 1000 kg/m³", font=CJK).scale(0.44),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        ex_cond.next_to(ex_title, DOWN, buff=0.35)
        self.play(FadeIn(ex_cond))
        self.wait(0.8)

        # 由连续性方程求 v₂
        cont_step = MathTex(
            r"v_2 = v_1 \cdot \frac{S_1}{S_2} = 0.5 \times \frac{80}{20} = 2.0\ \mathrm{m/s}"
        ).scale(0.72)
        cont_step.set_color(CYAN)
        cont_step.next_to(ex_cond, DOWN, buff=0.35)
        self.play(Write(cont_step))
        self.wait(0.8)

        # 由伯努利求压强差
        dp_step = MathTex(
            r"\Delta p = p_1 - p_2 = \frac{1}{2}\rho(v_2^2 - v_1^2)"
            r"= \frac{1}{2}\times1000\times(4-0.25) = 1875\ \mathrm{Pa}"
        ).scale(0.62)
        dp_step.set_color(GREEN)
        dp_step.next_to(cont_step, DOWN, buff=0.35)
        self.play(Write(dp_step))
        self.wait(2.0)
        self.play(FadeOut(VGroup(ex_title, ex_cond, cont_step, dp_step)))

        # ══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.5)

        s1 = MathTex(r"p + \tfrac{1}{2}\rho v^2 = \text{const}", color=YELLOW).scale(0.85)
        s2 = MathTex(r"v = Q/S \Rightarrow S\downarrow,\ v\uparrow,\ p\downarrow",
                     color=ORANGE).scale(0.75)
        s3 = Text("截面越小 → 流速越大 → 静压越低", font=CJK, color=GREEN).scale(0.44)
        s4 = Text("应用：文丘里管、喷雾器、机翼升力、空吸效应", font=CJK, color=CYAN).scale(0.4)

        s = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s.next_to(s_title, DOWN, buff=0.45)
        s.scale_to_fit_width(11.5)
        box = SurroundingRectangle(s, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch02Kp2BernoulliPressureVelocityTradeoff",
        "id": "phys-ch02-2.2-kp2-bernoulli-pressure-velocity-tradeoff",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "截面变化引起的压强-流速互换",
        "description": "变截面管+测压管液面+ValueTracker演示伯努利方程：截面越小流速越大压强越低，含p-S曲线与空吸效应。",
    }
]
