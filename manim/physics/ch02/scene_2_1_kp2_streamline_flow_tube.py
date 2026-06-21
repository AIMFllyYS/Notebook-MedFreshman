"""第 2.1 节 · 流线与流管的几何图像（金标准范本：矢量场 / 流线 + ValueTracker 扫动）。

可视化方案：
    幕一 ── 速度场箭头网格展示；
    幕二 ── 逐条绘制流线，展示切线方向与速度方向对齐；
            高亮两条流线相交时的矛盾（一点两方向），红叉标注；
    幕三 ── 沿一束相邻流线绘制流管，半透明填充封闭区域；
            ValueTracker 改变流速大小，观察流线疏密变化。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ── 速度场函数：水平均匀流（可用 tracker 控制幅度） ──────────────────────────
def vel_field(x, y, speed=1.0):
    """简单抛物线剪切流：v_x = speed*(1 - y²/4)，v_y = 0。
    流线为水平直线；越靠近中轴线 (y=0) 速度越大。"""
    vx = speed * (1.0 - y * y / 4.0)
    vy = 0.0
    return np.array([vx, vy, 0.0])


def streamline_y(y_val, x_range, speed=1.0):
    """抛物线剪切流的流线就是水平直线 y = const，参数化为 x ∈ x_range。"""
    xs = np.linspace(x_range[0], x_range[1], 60)
    points = [np.array([x, y_val, 0.0]) for x in xs]
    return points


class Ch02Kp2StreamlineFlowTube(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("流线与流管的几何图像", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第二章 流体运动  ·  2.1 流线", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("把颜色墨水滴入流动的水中，墨迹会画出一条曲线。", font=CJK).scale(0.48)
        ana2 = Text("这条曲线上每一点的切线方向，", font=CJK).scale(0.48)
        ana3 = Text("恰好就是该点流体微团的速度方向——这就是「流线」。", font=CJK).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55).scale_to_fit_width(12.5)
        for line in ana_group:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.2)
        self.play(FadeOut(ana_group))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 定义（逐行）
        # ═══════════════════════════════════════════════════════════════════
        def_title = Text("流线的数学定义", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        d1 = VGroup(
            Text("稳定流场中，速度场：", font=CJK).scale(0.46),
            MathTex(r"\boldsymbol{v} = \boldsymbol{v}(x,\,y,\,z)", color=YELLOW).scale(0.9),
        ).arrange(RIGHT, buff=0.18)
        d2_zh = Text("流线方程（切线方向 = 速度方向）：", font=CJK).scale(0.46)
        d2_eq = MathTex(r"\frac{dx}{v_x}=\frac{dy}{v_y}=\frac{dz}{v_z}", color=YELLOW).scale(0.9)
        d3_zh = Text("流管：由一束流线围成的管状曲面。", font=CJK).scale(0.46)

        def_group = VGroup(d1, d2_zh, d2_eq, d3_zh).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        def_group.next_to(def_title, DOWN, buff=0.4).scale_to_fit_width(12.0)

        self.play(FadeIn(def_title))
        self.play(FadeIn(d1))
        self.wait(0.9)
        self.play(FadeIn(d2_zh))
        self.play(Write(d2_eq))
        self.wait(1.1)
        self.play(FadeIn(d3_zh))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_title, def_group)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 幕一 ── 速度场箭头网格
        # ═══════════════════════════════════════════════════════════════════
        act1_cap = Text("幕一：速度场箭头（每个箭头 = 该点的速度矢量）",
                        font=CJK, color=CYAN).scale(0.4).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(act1_cap))

        # 生成箭头网格
        arrow_group = VGroup()
        xs_grid = np.linspace(-5.5, 5.5, 12)
        ys_grid = np.linspace(-2.0, 2.0, 5)
        for x in xs_grid:
            for y in ys_grid:
                v = vel_field(x, y, speed=1.0)
                mag = np.linalg.norm(v[:2])
                if mag < 1e-6:
                    continue
                direction = v / mag
                length = 0.25 + 0.55 * mag
                start = np.array([x, y, 0.0])
                end = start + direction * length
                arrow = Arrow(
                    start, end, buff=0, color=YELLOW,
                    stroke_width=2.5,
                    max_tip_length_to_length_ratio=0.3,
                )
                arrow_group.add(arrow)

        self.play(Create(arrow_group), run_time=2.0)
        self.wait(1.2)

        # 说明：中轴线速度最快（箭头最长），靠边速度慢
        note_mid = Text("中轴线速度最大（箭头最长），越靠管壁越慢", font=CJK, color=GREEN).scale(0.40)
        note_mid.next_to(act1_cap, UP, buff=0.18)
        self.play(FadeIn(note_mid))
        self.wait(1.5)
        self.play(FadeOut(VGroup(arrow_group, note_mid, act1_cap)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 幕二 ── 逐条绘制流线
        # ═══════════════════════════════════════════════════════════════════
        act2_cap = Text("幕二：流线——切线方向处处与速度方向对齐",
                        font=CJK, color=CYAN).scale(0.4).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(act2_cap))

        y_vals = [-1.8, -1.2, -0.6, 0.0, 0.6, 1.2, 1.8]
        colors = [RED, ORANGE, YELLOW, GREEN, YELLOW, ORANGE, RED]
        streamlines = []
        x_range = (-5.8, 5.8)
        for y_val, col in zip(y_vals, colors):
            pts = streamline_y(y_val, x_range, speed=1.0)
            vm = VMobject(color=col, stroke_width=2.2)
            vm.set_points_as_corners(pts)
            streamlines.append(vm)

        sl_group = VGroup(*streamlines)

        # 逐条绘制，带切线箭头演示
        for i, sl in enumerate(streamlines):
            self.play(Create(sl), run_time=0.6)
        self.wait(0.8)

        # 在一条流线上展示切线箭头与速度对齐
        demo_sl = streamlines[3]  # y=0，速度最大的中轴线
        tan_arrows = VGroup()
        for x_demo in [-3.5, -1.0, 1.5, 4.0]:
            v = vel_field(x_demo, 0.0, speed=1.0)
            mag = np.linalg.norm(v[:2])
            d = v / mag * 0.6
            start = np.array([x_demo, 0.0, 0.0])
            end = start + d
            ta = Arrow(start, end, buff=0, color=CYAN, stroke_width=3,
                       max_tip_length_to_length_ratio=0.35)
            tan_arrows.add(ta)

        tan_note = Text("绿色流线上各点切线 = 速度方向", font=CJK, color=CYAN).scale(0.40)
        tan_note.next_to(act2_cap, UP, buff=0.18)
        self.play(Create(tan_arrows), FadeIn(tan_note))
        self.wait(1.8)
        self.play(FadeOut(tan_arrows), FadeOut(tan_note))

        # ─── Step 6: 流线不能相交的矛盾演示 ────────────────────────────────
        cross_note = Text("若两条流线相交，交点处流体速度方向将有两个——矛盾！",
                          font=CJK, color=RED).scale(0.40)
        cross_note.next_to(act2_cap, UP, buff=0.18)

        # 用两条倾斜曲线模拟"即将相交"的场景
        fake_sl1 = CubicBezier(
            np.array([-5.0, -0.5, 0]), np.array([-1.5, -0.3, 0]),
            np.array([1.5, 0.3, 0]), np.array([5.0, 0.5, 0]),
            color=ORANGE, stroke_width=2.5,
        )
        fake_sl2 = CubicBezier(
            np.array([-5.0, 0.5, 0]), np.array([-1.5, 0.3, 0]),
            np.array([1.5, -0.3, 0]), np.array([5.0, -0.5, 0]),
            color=RED, stroke_width=2.5,
        )
        cross_point = Dot(ORIGIN, color=WHITE, radius=0.12)

        # 相交处两个箭头指向不同方向
        arr_left = Arrow(
            ORIGIN, np.array([-0.6, 0.4, 0]), buff=0,
            color=ORANGE, stroke_width=3, max_tip_length_to_length_ratio=0.4,
        )
        arr_right = Arrow(
            ORIGIN, np.array([0.6, -0.4, 0]), buff=0,
            color=RED, stroke_width=3, max_tip_length_to_length_ratio=0.4,
        )
        cross_x = Cross(cross_point, color=RED, stroke_width=5).scale(0.4)
        cross_x.move_to(ORIGIN)

        # 淡出真实流线，显示假流线
        self.play(FadeOut(sl_group), FadeIn(cross_note))
        self.play(Create(fake_sl1), Create(fake_sl2))
        self.wait(0.6)
        self.play(FadeIn(cross_point))
        self.play(GrowArrow(arr_left), GrowArrow(arr_right))
        self.wait(0.8)
        self.play(Create(cross_x))
        self.wait(1.4)
        # 清场
        self.play(FadeOut(VGroup(fake_sl1, fake_sl2, cross_point,
                                 arr_left, arr_right, cross_x,
                                 cross_note, act2_cap)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 幕三 ── 流管高亮与封闭性
        # ═══════════════════════════════════════════════════════════════════
        act3_cap = Text("幕三：流管——由一束流线围成的管状曲面",
                        font=CJK, color=CYAN).scale(0.4).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(act3_cap))

        # 重新绘制全部流线（稀一点，只画 5 条）
        y_vals2 = [-1.5, -0.75, 0.0, 0.75, 1.5]
        colors2 = [ORANGE, YELLOW, GREEN, YELLOW, ORANGE]
        sl2_list = []
        for y_val, col in zip(y_vals2, colors2):
            pts = streamline_y(y_val, x_range, speed=1.0)
            vm = VMobject(color=col, stroke_width=1.8)
            vm.set_points_as_corners(pts)
            sl2_list.append(vm)
        sl2_group = VGroup(*sl2_list)
        self.play(Create(sl2_group), run_time=1.2)
        self.wait(0.6)

        # 高亮中间两条流线（y=-0.75 和 y=0.75）构成流管边界
        tube_upper = sl2_list[3]   # y = 0.75
        tube_lower = sl2_list[1]   # y = -0.75
        self.play(
            tube_upper.animate.set_color(CYAN).set_stroke(width=3.5),
            tube_lower.animate.set_color(CYAN).set_stroke(width=3.5),
        )
        self.wait(0.5)

        # 填充流管区域（用多边形覆盖上下流线之间的矩形区域）
        x_left, x_right = -5.8, 5.8
        y_top, y_bot = 0.75, -0.75
        tube_fill = Polygon(
            np.array([x_left, y_bot, 0]), np.array([x_right, y_bot, 0]),
            np.array([x_right, y_top, 0]), np.array([x_left, y_top, 0]),
            fill_color=BLUE, fill_opacity=0.22, stroke_opacity=0,
        )
        tube_label = Text("流管（管内流体沿流线运动，不穿越管壁）",
                          font=CJK, color=BLUE).scale(0.42)
        tube_label.next_to(act3_cap, UP, buff=0.18)
        self.play(FadeIn(tube_fill), FadeIn(tube_label))
        self.wait(1.5)

        # 左右端面（截面）标注
        left_cap_line = Line(np.array([x_left, y_bot, 0]), np.array([x_left, y_top, 0]),
                             color=WHITE, stroke_width=3)
        right_cap_line = Line(np.array([x_right, y_bot, 0]), np.array([x_right, y_top, 0]),
                              color=WHITE, stroke_width=3)
        s1_label = Text("S1", font=CJK, color=WHITE).scale(0.42).next_to(left_cap_line, LEFT, buff=0.12)
        s2_label = Text("S2", font=CJK, color=WHITE).scale(0.42).next_to(right_cap_line, RIGHT, buff=0.12)
        self.play(Create(left_cap_line), Create(right_cap_line),
                  FadeIn(s1_label), FadeIn(s2_label))
        self.wait(1.2)
        self.play(FadeOut(VGroup(s1_label, s2_label, left_cap_line, right_cap_line)))

        # ─── Step 8: ValueTracker 改变流速，观察流线疏密 ─────────────────
        speed_tracker = ValueTracker(1.0)

        density_note = Text("增大流速 → 流线变密；减小流速 → 流线变疏",
                            font=CJK, color=ORANGE).scale(0.40)
        density_note.next_to(tube_label, UP, buff=0.20)

        speed_readout = always_redraw(
            lambda: VGroup(
                Text("流速系数：", font=CJK).scale(0.4),
                MathTex(rf"k = {speed_tracker.get_value():.2f}", color=CYAN).scale(0.7),
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.55)
        )

        # 动态流线组（随 speed 变化重绘疏密）
        def make_dynamic_streamlines():
            k = speed_tracker.get_value()
            # 流速大 → 流线间距缩小（流管变窄），这里用间距表示
            # 流线数量随 k 变化：k 大 → 更多流线（更密）
            n_lines = max(3, int(4 + 4 * k))
            y_range = 1.9
            y_positions = np.linspace(-y_range, y_range, n_lines)
            grp = VGroup()
            for yp in y_positions:
                pts = streamline_y(yp, (-5.5, 5.5), speed=k)
                vx_mid = k * (1.0 - yp * yp / 4.0)
                # 越快越偏绿，越慢越偏橙
                interp = min(max((abs(vx_mid) - 0.05) / 1.5, 0.0), 1.0)
                col = interpolate_color(ORANGE, GREEN, interp)
                vm = VMobject(color=col, stroke_width=1.6, stroke_opacity=0.85)
                vm.set_points_as_corners(pts)
                grp.add(vm)
            return grp

        dynamic_sl = always_redraw(make_dynamic_streamlines)

        # 先淡出静态流线，加入动态流线
        self.play(FadeOut(sl2_group))
        self.add(dynamic_sl)
        self.play(FadeIn(density_note), FadeIn(speed_readout))
        self.wait(0.6)

        self.play(speed_tracker.animate.set_value(2.0), run_time=2.5)
        self.wait(1.0)
        self.play(speed_tracker.animate.set_value(0.4), run_time=2.5)
        self.wait(1.0)
        self.play(speed_tracker.animate.set_value(1.0), run_time=1.5)
        self.wait(0.8)

        self.play(FadeOut(VGroup(tube_fill, tube_label, density_note,
                                 speed_readout, dynamic_sl, act3_cap)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 9: 连续性方程预告（流速 × 截面积 = 常数）
        # ═══════════════════════════════════════════════════════════════════
        eq_note_zh = Text("流管封闭 → 流线不穿管壁 → 连续性方程：", font=CJK).scale(0.48)
        eq_cont = MathTex(r"v_1 S_1 = v_2 S_2 = \text{const}", color=YELLOW).scale(0.9)
        cont_sub = Text("（截面积小 → 速度大；截面积大 → 速度小）",
                        font=CJK, color=GREEN).scale(0.42)
        cont_group = VGroup(eq_note_zh, eq_cont, cont_sub).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        cont_group.next_to(title, DOWN, buff=0.6).scale_to_fit_width(12.0)
        self.play(FadeIn(eq_note_zh))
        self.play(Write(eq_cont))
        self.play(FadeIn(cont_sub))
        self.wait(2.0)
        self.play(FadeOut(cont_group))

        # ═══════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s1 = VGroup(
            Text("流线定义：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\frac{dx}{v_x}=\frac{dy}{v_y}=\frac{dz}{v_z}", color=YELLOW).scale(0.8),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("速度场：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\boldsymbol{v}=\boldsymbol{v}(x,y,z)", color=YELLOW).scale(0.8),
        ).arrange(RIGHT, buff=0.2)

        s3 = Text("流线不相交（稳定流）", font=CJK, color=GREEN).scale(0.44)
        s4 = Text("流管由一束流线围成，管壁不透过流体", font=CJK, color=GREEN).scale(0.44)
        s5 = VGroup(
            Text("连续性（不可压缩流）：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"v_1 S_1 = v_2 S_2", color=YELLOW).scale(0.8),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4).scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.play(FadeIn(s3), FadeIn(s4))
        self.play(Write(s5), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch02Kp2StreamlineFlowTube",
        "id": "phys-ch02-2.1-kp2-streamline-flow-tube",
        "chapterId": "ch02",
        "sectionId": "2.1",
        "title": "流线与流管的几何图像",
        "description": "用速度场箭头网格、逐条流线绘制与流管半透明填充，演示流线不相交特性和流管封闭性，ValueTracker 扫动流速展示流线疏密与速度的对应关系。",
    },
]
