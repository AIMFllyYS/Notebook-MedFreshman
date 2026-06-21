"""第 2.3 节 · 血液循环中的血流速度与血压分布

可视化方案（三幕）：
    幕一 ── 血液循环流程条（左心室→主动脉→细动脉→毛细血管→细静脉→大静脉→右心房）；
            流程条上方绘制总截面积 S(x) 曲线（毛细血管处峰值），
            下方绘制平均流速 v(x) 曲线（毛细血管处谷值），二者呈镜像对称。
    幕二 ── 在流程条下方叠加血压 p(x) 曲线：120 mmHg → 30 mmHg → 10 mmHg；
            动脉段红色，静脉段蓝色。
    幕三 ── ValueTracker 模拟心跳脉动，让收缩压/舒张压曲线动态波动，
            标注收缩压（峰值）与舒张压（谷值）的定义。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 血管段标签与示意坐标 ─────────────────────────────────────────────────────
# x 从 0 到 1 对应：左心室→主动脉→细动脉→毛细血管→细静脉→大静脉→右心房
SEGMENTS = [
    (0.00, 0.10),   # 左心室 / 主动脉起始
    (0.10, 0.28),   # 主动脉
    (0.28, 0.42),   # 细动脉
    (0.42, 0.58),   # 毛细血管
    (0.58, 0.72),   # 细静脉
    (0.72, 0.90),   # 大静脉
    (0.90, 1.00),   # 右心房
]
SEG_LABELS = ["左心室", "主动脉", "细动脉", "毛细血管", "细静脉", "大静脉", "右心房"]


def _smooth_clamp(x: float, x0: float, x1: float, v0: float, v1: float) -> float:
    """在 [x0, x1] 上用余弦插值将值从 v0 平滑过渡到 v1；区间外取端点值。"""
    if x <= x0:
        return v0
    if x >= x1:
        return v1
    t = (x - x0) / (x1 - x0)
    t_smooth = 0.5 - 0.5 * math.cos(math.pi * t)
    return v0 + (v1 - v0) * t_smooth


def cross_section(x: float) -> float:
    """总截面积 S(x)，归一化到 [0, 1]（峰值在毛细血管段中央 x≈0.50）。
    左心室端≈0.1，毛细血管峰≈1.0，静脉端≈0.4。
    """
    # 上升段：左心室→毛细血管
    if x <= 0.50:
        return _smooth_clamp(x, 0.05, 0.50, 0.10, 1.00)
    # 下降段：毛细血管→右心房
    else:
        return _smooth_clamp(x, 0.50, 0.95, 1.00, 0.40)


def mean_velocity(x: float) -> float:
    """平均血流速度 v(x)，与截面积成反比（连续性方程 Q = S·v ≈ const）。
    归一化到 [0, 1]，毛细血管处最小（≈0.05），主动脉处最大（≈1.0）。
    """
    s = cross_section(x)
    # v ∝ 1/S，归一化使主动脉端 (x=0.20, S≈0.20) → v = 1.0
    s_ref = cross_section(0.20)   # 主动脉中段参考截面积
    return s_ref / max(s, 0.005)


def blood_pressure(x: float, systolic_boost: float = 0.0) -> float:
    """血压 p(x) (单位 mmHg)，从左心室收缩压约 120 mmHg 逐段下降到静脉端约 8 mmHg。
    systolic_boost 用于模拟心跳脉动（额外偏移主动脉段的收缩压峰值）。
    """
    # 基础血压曲线（多段平滑衰减）
    if x <= 0.10:
        # 左心室内：压力最高
        base = 120.0 + systolic_boost
    elif x <= 0.42:
        # 动脉段：120 → 35 mmHg
        base = _smooth_clamp(x, 0.10, 0.42, 120.0 + systolic_boost, 35.0 + systolic_boost * 0.2)
    elif x <= 0.58:
        # 毛细血管：35 → 15 mmHg
        base = _smooth_clamp(x, 0.42, 0.58, 35.0, 15.0)
    elif x <= 0.90:
        # 静脉段：15 → 8 mmHg
        base = _smooth_clamp(x, 0.58, 0.90, 15.0, 8.0)
    else:
        # 右心房：约 5 mmHg
        base = _smooth_clamp(x, 0.90, 1.00, 8.0, 5.0)
    return base


class Ch02Kp4BloodCirculationVelocityPressure(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("血液循环中的血流速度与血压分布",
                     font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第二章 流体运动  ·  2.3 血液循环中的流动规律",
                        font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("消防水管：细口处水流速度快，粗口处速度慢。", font=CJK).scale(0.48)
        ana2 = Text("血液循环同理——心脏收缩推动血液，经大动脉→细动脉→毛细血管→静脉回心。", font=CJK).scale(0.44)
        ana3 = Text("毛细血管总截面积最大，血流在这里反而最慢，以保证充分物质交换！", font=CJK, color=GREEN).scale(0.44)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55).scale_to_fit_width(12.8)
        for line in ana_group:
            self.play(FadeIn(line))
            self.wait(0.8)
        self.wait(1.2)
        self.play(FadeOut(ana_group))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 核心方程定义（逐行出现）
        # ═══════════════════════════════════════════════════════════════════
        eq_title = Text("连续性方程——流速与截面积的关系",
                        font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)

        eq1_zh = Text("不可压缩流：流管内体积流量守恒", font=CJK).scale(0.46)
        eq1 = MathTex(r"Q = S \cdot v = \text{const}", color=YELLOW).scale(0.95)
        row1 = VGroup(eq1_zh, eq1).arrange(RIGHT, buff=0.3)

        eq2_zh = Text("截面积大时流速小，截面积小时流速大：", font=CJK).scale(0.46)
        eq2 = MathTex(r"S_1 v_1 = S_2 v_2", color=YELLOW).scale(0.95)
        row2 = VGroup(eq2_zh, eq2).arrange(RIGHT, buff=0.3)

        eq3_zh = Text("血压沿血管流向逐步降低（克服粘性阻力耗能）：", font=CJK).scale(0.46)
        eq3 = MathTex(r"p_{\rm artery} \gg p_{\rm cap} > p_{\rm vein}", color=ORANGE).scale(0.85)
        row3 = VGroup(eq3_zh, eq3).arrange(RIGHT, buff=0.3)

        def_group = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        def_group.next_to(eq_title, DOWN, buff=0.40).scale_to_fit_width(12.8)

        self.play(FadeIn(eq_title))
        self.play(FadeIn(row1[0]))
        self.play(Write(eq1))
        self.wait(1.0)
        self.play(FadeIn(row2[0]))
        self.play(Write(eq2))
        self.wait(1.0)
        self.play(FadeIn(row3[0]))
        self.play(Write(eq3))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq_title, def_group)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 绘制血液循环流程条（一维流程）
        # ═══════════════════════════════════════════════════════════════════
        # 流程条位置（水平方向），y 轴中间偏上
        FLOW_Y = 0.8          # 流程条所在 y
        FLOW_LEFT = -6.2
        FLOW_RIGHT = 6.2
        FLOW_WIDTH = FLOW_RIGHT - FLOW_LEFT   # 12.4

        def x_to_screen(t: float) -> float:
            """将参数 t ∈ [0,1] 映射到屏幕 x 坐标"""
            return FLOW_LEFT + t * FLOW_WIDTH

        # 颜色分段：动脉段红，毛细血管粉，静脉段蓝
        SEG_COLORS = [RED, RED, RED, PINK, BLUE_C, BLUE_C, BLUE_D]

        # 绘制分段流程条（矩形段）
        FLOW_H = 0.28   # 流程条高度（在屏幕上）
        flow_segs = VGroup()
        for i, ((t0, t1), col) in enumerate(zip(SEGMENTS, SEG_COLORS)):
            x0 = x_to_screen(t0)
            x1 = x_to_screen(t1)
            w = x1 - x0
            rect = Rectangle(
                width=w, height=FLOW_H,
                fill_color=col, fill_opacity=0.80,
                stroke_color=WHITE, stroke_width=1.2,
            )
            rect.move_to(np.array([x0 + w / 2, FLOW_Y, 0]))
            flow_segs.add(rect)

        # 流程条段标签
        seg_label_group = VGroup()
        for i, ((t0, t1), lbl) in enumerate(zip(SEGMENTS, SEG_LABELS)):
            x_mid = x_to_screen((t0 + t1) / 2)
            label = Text(lbl, font=CJK).scale(0.28)
            label.move_to(np.array([x_mid, FLOW_Y - 0.55, 0]))
            seg_label_group.add(label)

        # 箭头（表示血流方向）
        flow_arrow = Arrow(
            np.array([FLOW_LEFT, FLOW_Y + 0.55, 0]),
            np.array([FLOW_RIGHT, FLOW_Y + 0.55, 0]),
            buff=0, color=CYAN, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.04,
        )
        flow_dir_label = Text("血流方向", font=CJK, color=CYAN).scale(0.36)
        flow_dir_label.next_to(flow_arrow, UP, buff=0.08)

        act1_cap = Text("幕一：总截面积 S(x) 与平均血流速度 v(x) 的镜像关系",
                        font=CJK, color=CYAN).scale(0.38).to_edge(DOWN, buff=0.50)

        self.play(Create(flow_segs), run_time=1.2)
        self.play(FadeIn(seg_label_group))
        self.play(GrowArrow(flow_arrow), FadeIn(flow_dir_label))
        self.play(FadeIn(act1_cap))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 绘制 S(x) 曲线（流程条上方）
        # ═══════════════════════════════════════════════════════════════════
        # S(x) 轴：y 范围 [FLOW_Y + 0.55, FLOW_Y + 2.2]，顶部对应峰值
        S_Y_BASE = FLOW_Y + 0.75    # 基线（S=0 对应的屏幕 y）
        S_Y_MAX = 1.5               # S=1 对应的屏幕高度
        S_COLOR = GREEN

        N_CURVE = 120
        xs_param = np.linspace(0.0, 1.0, N_CURVE)

        def s_point(t: float) -> np.ndarray:
            s = cross_section(t)
            return np.array([x_to_screen(t), S_Y_BASE + s * S_Y_MAX, 0.0])

        s_curve = VMobject(color=S_COLOR, stroke_width=2.8)
        s_curve.set_points_smoothly([s_point(t) for t in xs_param])

        # S 轴标注
        s_lbl = VGroup(
            Text("S(x)", font=CJK, color=S_COLOR).scale(0.38),
            Text("总截面积", font=CJK, color=S_COLOR).scale(0.32),
        ).arrange(DOWN, buff=0.08)
        s_lbl.move_to(np.array([FLOW_LEFT - 0.6, S_Y_BASE + S_Y_MAX * 0.5, 0]))

        # 峰值标注（毛细血管）
        s_peak_dot = Dot(s_point(0.50), color=S_COLOR, radius=0.09)
        s_peak_lbl = VGroup(
            Text("毛细血管段", font=CJK).scale(0.30),
            Text("S 最大", font=CJK, color=S_COLOR).scale(0.30),
        ).arrange(DOWN, buff=0.06).next_to(s_peak_dot, UP, buff=0.12)

        self.play(Create(s_curve), run_time=1.5)
        self.play(FadeIn(s_lbl), FadeIn(s_peak_dot), FadeIn(s_peak_lbl))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: 绘制 v(x) 曲线（流程条下方），与 S 镜像
        # ═══════════════════════════════════════════════════════════════════
        V_Y_BASE = FLOW_Y - 0.75    # 基线（v=0 对应的屏幕 y）
        V_Y_MAX = -1.4              # v 方向向下（镜像）
        V_COLOR = YELLOW

        # 归一化 v 最大值
        v_max = mean_velocity(0.20)   # 主动脉中段，流速最大

        def v_point(t: float) -> np.ndarray:
            v = mean_velocity(t) / v_max
            v = min(v, 1.0)
            return np.array([x_to_screen(t), V_Y_BASE + v * V_Y_MAX, 0.0])

        v_curve = VMobject(color=V_COLOR, stroke_width=2.8)
        v_curve.set_points_smoothly([v_point(t) for t in xs_param])

        # v 轴标注
        v_lbl = VGroup(
            Text("v(x)", font=CJK, color=V_COLOR).scale(0.38),
            Text("平均流速", font=CJK, color=V_COLOR).scale(0.32),
        ).arrange(DOWN, buff=0.08)
        v_lbl.move_to(np.array([FLOW_LEFT - 0.6, V_Y_BASE + V_Y_MAX * 0.45, 0]))

        # 谷值标注（毛细血管，流速最小）
        v_min_dot = Dot(v_point(0.50), color=V_COLOR, radius=0.09)
        v_min_lbl = VGroup(
            Text("S 最大 →", font=CJK).scale(0.28),
            Text("v 最小", font=CJK, color=V_COLOR).scale(0.30),
        ).arrange(DOWN, buff=0.06).next_to(v_min_dot, DOWN, buff=0.12)

        self.play(Create(v_curve), run_time=1.5)
        self.play(FadeIn(v_lbl), FadeIn(v_min_dot), FadeIn(v_min_lbl))
        self.wait(0.6)

        # 镜像关系说明
        mirror_lbl = VGroup(
            Text("二者镜像：", font=CJK).scale(0.42),
            MathTex(r"S(x)\cdot v(x)=Q\approx\text{const}", color=CYAN).scale(0.82),
        ).arrange(RIGHT, buff=0.2)
        mirror_lbl.next_to(title, DOWN, buff=0.45)
        self.play(Write(mirror_lbl))
        self.wait(2.0)

        # 清场幕一
        self.play(FadeOut(VGroup(
            flow_segs, seg_label_group, flow_arrow, flow_dir_label,
            s_curve, s_lbl, s_peak_dot, s_peak_lbl,
            v_curve, v_lbl, v_min_dot, v_min_lbl,
            mirror_lbl, act1_cap,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 幕二 ── 血压 p(x) 曲线叠加
        # ═══════════════════════════════════════════════════════════════════
        act2_cap = Text("幕二：血压 p(x) 沿血管流向的分布",
                        font=CJK, color=CYAN).scale(0.38).to_edge(DOWN, buff=0.50)
        self.play(FadeIn(act2_cap))

        # 重新绘制流程条（稍微靠上）
        FLOW_Y2 = 0.5
        S_Y_BASE2 = FLOW_Y2 + 0.75
        V_Y_BASE2 = FLOW_Y2 - 0.75
        V_Y_MAX2 = -1.3

        flow_segs2 = VGroup()
        for i, ((t0, t1), col) in enumerate(zip(SEGMENTS, SEG_COLORS)):
            x0 = x_to_screen(t0)
            x1 = x_to_screen(t1)
            w = x1 - x0
            rect = Rectangle(
                width=w, height=FLOW_H,
                fill_color=col, fill_opacity=0.70,
                stroke_color=WHITE, stroke_width=1.0,
            )
            rect.move_to(np.array([x0 + w / 2, FLOW_Y2, 0]))
            flow_segs2.add(rect)

        seg_lbl2 = VGroup()
        for i, ((t0, t1), lbl) in enumerate(zip(SEGMENTS, SEG_LABELS)):
            x_mid = x_to_screen((t0 + t1) / 2)
            label = Text(lbl, font=CJK).scale(0.26)
            label.move_to(np.array([x_mid, FLOW_Y2 + 0.45, 0]))
            seg_lbl2.add(label)

        self.play(Create(flow_segs2), FadeIn(seg_lbl2), run_time=1.0)
        self.wait(0.5)

        # 血压坐标轴（纵轴：0~130 mmHg，映射到屏幕 y：V_Y_BASE2 → V_Y_BASE2+V_Y_MAX2）
        P_MIN, P_MAX = 0.0, 130.0
        P_Y_BASE = FLOW_Y2 - 0.65
        P_Y_RANGE = -2.2          # 向下延伸 2.2 单位

        def p_to_y(p: float) -> float:
            return P_Y_BASE + (p - P_MIN) / (P_MAX - P_MIN) * P_Y_RANGE

        def p_point(t: float, boost: float = 0.0) -> np.ndarray:
            p = blood_pressure(t, systolic_boost=boost)
            return np.array([x_to_screen(t), p_to_y(p), 0.0])

        # 分段绘制：动脉段（红）和静脉段（蓝）
        xs_artery = np.linspace(0.0, 0.58, 80)
        xs_vein = np.linspace(0.58, 1.0, 40)

        p_artery = VMobject(color=RED, stroke_width=3.0)
        p_artery.set_points_smoothly([p_point(t) for t in xs_artery])

        p_vein = VMobject(color=BLUE_C, stroke_width=3.0)
        p_vein.set_points_smoothly([p_point(t) for t in xs_vein])

        # 压力纵轴
        p_axis_line = Line(
            np.array([FLOW_LEFT - 0.2, p_to_y(0), 0]),
            np.array([FLOW_LEFT - 0.2, p_to_y(130), 0]),
            color=WHITE, stroke_width=1.5,
        )
        p_axis_ticks_labels = VGroup()
        for p_val, lbl_str in [(0, "0"), (30, "30"), (60, "60"), (90, "90"), (120, "120")]:
            tick = Line(
                np.array([FLOW_LEFT - 0.35, p_to_y(p_val), 0]),
                np.array([FLOW_LEFT - 0.05, p_to_y(p_val), 0]),
                color=WHITE, stroke_width=1.2,
            )
            lbl = Text(lbl_str, font=CJK).scale(0.26).next_to(tick, LEFT, buff=0.08)
            p_axis_ticks_labels.add(tick, lbl)

        p_axis_lbl = VGroup(
            Text("p", font=CJK, color=WHITE).scale(0.36),
            Text("(mmHg)", font=CJK, color=WHITE).scale(0.28),
        ).arrange(DOWN, buff=0.06)
        p_axis_lbl.next_to(p_axis_line, LEFT, buff=0.35)

        self.play(Create(p_axis_line), FadeIn(p_axis_ticks_labels), FadeIn(p_axis_lbl))
        self.wait(0.4)
        self.play(Create(p_artery), run_time=1.4)
        self.play(Create(p_vein), run_time=0.7)
        self.wait(0.8)

        # 关键标注：主动脉压 120 mmHg，毛细血管 ~30 mmHg，静脉 ~8 mmHg
        dot_aorta = Dot(p_point(0.18), color=RED, radius=0.09)
        lbl_aorta = VGroup(
            Text("主动脉", font=CJK, color=RED).scale(0.30),
            Text("~120 mmHg", font=CJK, color=RED).scale(0.28),
        ).arrange(DOWN, buff=0.05).next_to(dot_aorta, UP, buff=0.12)

        dot_cap = Dot(p_point(0.50), color=PINK, radius=0.09)
        lbl_cap = VGroup(
            Text("毛细血管", font=CJK, color=PINK).scale(0.30),
            Text("~25 mmHg", font=CJK, color=PINK).scale(0.28),
        ).arrange(DOWN, buff=0.05).next_to(dot_cap, DOWN, buff=0.12)

        dot_vein = Dot(p_point(0.80), color=BLUE_C, radius=0.09)
        lbl_vein = VGroup(
            Text("大静脉", font=CJK, color=BLUE_C).scale(0.30),
            Text("~10 mmHg", font=CJK, color=BLUE_C).scale(0.28),
        ).arrange(DOWN, buff=0.05).next_to(dot_vein, DOWN, buff=0.12)

        self.play(
            FadeIn(dot_aorta), FadeIn(lbl_aorta),
            FadeIn(dot_cap), FadeIn(lbl_cap),
            FadeIn(dot_vein), FadeIn(lbl_vein),
        )
        self.wait(1.5)

        # 颜色图例：动脉 / 静脉
        legend_artery = VGroup(
            Line(LEFT * 0.3, RIGHT * 0.3, color=RED, stroke_width=4),
            Text("动脉段（高压）", font=CJK, color=RED).scale(0.34),
        ).arrange(RIGHT, buff=0.14)
        legend_vein = VGroup(
            Line(LEFT * 0.3, RIGHT * 0.3, color=BLUE_C, stroke_width=4),
            Text("静脉段（低压）", font=CJK, color=BLUE_C).scale(0.34),
        ).arrange(RIGHT, buff=0.14)
        legend_grp = VGroup(legend_artery, legend_vein).arrange(RIGHT, buff=0.5)
        legend_grp.to_corner(DR, buff=0.6)
        self.play(FadeIn(legend_grp))
        self.wait(1.8)

        # 清场幕二
        self.play(FadeOut(VGroup(
            flow_segs2, seg_lbl2,
            p_axis_line, p_axis_ticks_labels, p_axis_lbl,
            p_artery, p_vein,
            dot_aorta, lbl_aorta, dot_cap, lbl_cap, dot_vein, lbl_vein,
            legend_grp, act2_cap,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: 幕三 ── 心跳脉动模拟（ValueTracker + always_redraw）
        # ═══════════════════════════════════════════════════════════════════
        act3_cap = Text("幕三：心跳脉动——收缩压与舒张压的动态波动",
                        font=CJK, color=CYAN).scale(0.38).to_edge(DOWN, buff=0.50)
        self.play(FadeIn(act3_cap))

        # 重新绘制流程条（只画动脉段，突出脉动区域）
        FLOW_Y3 = 1.2
        P_Y_BASE3 = FLOW_Y3 - 0.55
        P_Y_RANGE3 = -2.5

        def p_to_y3(p: float) -> float:
            return P_Y_BASE3 + (p - P_MIN) / (P_MAX - P_MIN) * P_Y_RANGE3

        flow_segs3 = VGroup()
        seg_lbl3 = VGroup()
        for i, ((t0, t1), col) in enumerate(zip(SEGMENTS[:4], SEG_COLORS[:4])):
            x0 = x_to_screen(t0)
            x1 = x_to_screen(t1)
            w = x1 - x0
            rect = Rectangle(
                width=w, height=FLOW_H * 0.85,
                fill_color=col, fill_opacity=0.70,
                stroke_color=WHITE, stroke_width=1.0,
            )
            rect.move_to(np.array([x0 + w / 2, FLOW_Y3, 0]))
            flow_segs3.add(rect)
        for i, ((t0, t1), lbl) in enumerate(zip(SEGMENTS[:4], SEG_LABELS[:4])):
            x_mid = x_to_screen((t0 + t1) / 2)
            label = Text(lbl, font=CJK).scale(0.26)
            label.move_to(np.array([x_mid, FLOW_Y3 + 0.38, 0]))
            seg_lbl3.add(label)

        self.play(Create(flow_segs3), FadeIn(seg_lbl3), run_time=0.8)

        # 压力纵轴
        p_axis3 = Line(
            np.array([FLOW_LEFT - 0.2, p_to_y3(0), 0]),
            np.array([FLOW_LEFT - 0.2, p_to_y3(130), 0]),
            color=WHITE, stroke_width=1.5,
        )
        p_ticks3 = VGroup()
        for p_val, lbl_str in [(0, "0"), (80, "80"), (120, "120")]:
            tick = Line(
                np.array([FLOW_LEFT - 0.35, p_to_y3(p_val), 0]),
                np.array([FLOW_LEFT - 0.05, p_to_y3(p_val), 0]),
                color=WHITE, stroke_width=1.2,
            )
            lbl = Text(lbl_str, font=CJK).scale(0.26).next_to(tick, LEFT, buff=0.08)
            p_ticks3.add(tick, lbl)
        p_lbl3 = VGroup(
            Text("p", font=CJK).scale(0.36),
            Text("(mmHg)", font=CJK).scale(0.28),
        ).arrange(DOWN, buff=0.06).next_to(p_axis3, LEFT, buff=0.35)

        self.play(Create(p_axis3), FadeIn(p_ticks3), FadeIn(p_lbl3))

        # ValueTracker：控制心跳相位（0~2π 为一个心跳周期）
        heartbeat_phase = ValueTracker(0.0)

        xs_artery3 = np.linspace(0.0, 0.58, 80)

        def make_p_artery():
            """随心跳相位重绘动脉血压曲线（主动脉段叠加脉动）"""
            phi = heartbeat_phase.get_value()
            # 心跳脉动：主动脉段收缩压在 120±22 mmHg 之间波动
            boost = 22.0 * math.sin(phi)
            pts = [p_point(t, boost) for t in xs_artery3]
            # 需要将 p_point 使用 P_Y_BASE3 映射
            new_pts = []
            for t in xs_artery3:
                p = blood_pressure(t, systolic_boost=boost)
                y_screen = p_to_y3(p)
                new_pts.append(np.array([x_to_screen(t), y_screen, 0.0]))
            curve = VMobject(color=RED, stroke_width=3.0)
            curve.set_points_smoothly(new_pts)
            return curve

        p_artery3 = always_redraw(make_p_artery)
        self.add(p_artery3)
        self.wait(0.4)

        # 动态标注：收缩压（最高点）和舒张压（最低点）——用 always_redraw 跟踪
        def make_systolic_dot():
            phi = heartbeat_phase.get_value()
            boost = 22.0 * math.sin(phi)
            p_sys = blood_pressure(0.18, systolic_boost=boost)
            return Dot(np.array([x_to_screen(0.18), p_to_y3(p_sys), 0.0]),
                       color=YELLOW, radius=0.10)

        def make_diastolic_dot():
            # 舒张压：phi 处于波谷时（boost 最小 -22）
            phi = heartbeat_phase.get_value()
            boost = 22.0 * math.sin(phi)
            # 舒张压对应 phi = π（boost 最小）
            p_dia = blood_pressure(0.18, systolic_boost=-22.0)
            return Dot(np.array([x_to_screen(0.18), p_to_y3(p_dia), 0.0]),
                       color=CYAN, radius=0.08)

        sys_dot = always_redraw(make_systolic_dot)
        self.add(sys_dot)

        # 收缩压 / 舒张压定义标签（静态）
        sys_line_y = p_to_y3(120 + 22)    # 最高收缩压
        dia_line_y = p_to_y3(120 - 22)    # 最低（对应舒张参考）

        sys_dash = DashedLine(
            np.array([FLOW_LEFT, sys_line_y, 0]),
            np.array([FLOW_RIGHT * 0.45, sys_line_y, 0]),
            color=YELLOW, stroke_width=1.5, dash_length=0.15,
        )
        dia_dash = DashedLine(
            np.array([FLOW_LEFT, dia_line_y, 0]),
            np.array([FLOW_RIGHT * 0.45, dia_line_y, 0]),
            color=CYAN, stroke_width=1.5, dash_length=0.15,
        )
        sys_lbl = VGroup(
            Text("收缩压", font=CJK, color=YELLOW).scale(0.34),
            Text("~142 mmHg", font=CJK, color=YELLOW).scale(0.30),
        ).arrange(RIGHT, buff=0.1).next_to(sys_dash, RIGHT, buff=0.1)
        dia_lbl = VGroup(
            Text("舒张压", font=CJK, color=CYAN).scale(0.34),
            Text("~98 mmHg", font=CJK, color=CYAN).scale(0.30),
        ).arrange(RIGHT, buff=0.1).next_to(dia_dash, RIGHT, buff=0.1)

        brace_note = Text("脉压差 = 收缩压 - 舒张压（正常约 40 mmHg）",
                          font=CJK, color=GREEN).scale(0.36)
        brace_note.next_to(act3_cap, UP, buff=0.12)

        self.play(Create(sys_dash), Create(dia_dash), FadeIn(sys_lbl), FadeIn(dia_lbl))
        self.play(FadeIn(brace_note))
        self.wait(0.5)

        # 心跳动画：两个完整周期（2*2π）
        self.play(
            heartbeat_phase.animate.set_value(4 * math.pi),
            run_time=5.0,
            rate_func=linear,
        )
        self.wait(0.8)

        # 清场幕三
        self.play(FadeOut(VGroup(
            flow_segs3, seg_lbl3,
            p_axis3, p_ticks3, p_lbl3,
            sys_dash, dia_dash, sys_lbl, dia_lbl,
            brace_note, sys_dot, act3_cap,
        )))
        self.remove(p_artery3)
        self.wait(0.3)

        # ═══════════════════════════════════════════════════════════════════
        # Step 9: 伯努利方程与能量守恒简述
        # ═══════════════════════════════════════════════════════════════════
        bern_title = Text("伯努利方程：沿流线能量守恒", font=CJK, color=BLUE).scale(0.52)
        bern_title.next_to(title, DOWN, buff=0.48)

        bern_eq = MathTex(
            r"p + \tfrac{1}{2}\rho v^2 + \rho g h = \text{const}",
            color=YELLOW,
        ).scale(0.95)
        bern_eq.next_to(bern_title, DOWN, buff=0.42)

        explain1 = VGroup(
            Text("动脉（v 大，p 相对低）", font=CJK, color=RED).scale(0.44),
            MathTex(r"\Rightarrow", color=WHITE).scale(0.9),
            Text("静脉（v 小，p 也低——粘性损耗主导）", font=CJK, color=BLUE_C).scale(0.44),
        ).arrange(RIGHT, buff=0.2)
        explain1.next_to(bern_eq, DOWN, buff=0.38).scale_to_fit_width(12.5)

        explain2 = Text("注：实际血流有粘性耗能，血压下降主要来自粘性阻力，非伯努利效应。",
                        font=CJK, color=ORANGE).scale(0.38)
        explain2.next_to(explain1, DOWN, buff=0.28).scale_to_fit_width(12.5)

        self.play(FadeIn(bern_title))
        self.play(Write(bern_eq))
        self.play(FadeIn(explain1))
        self.play(FadeIn(explain2))
        self.wait(2.0)
        self.play(FadeOut(VGroup(bern_title, bern_eq, explain1, explain2)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 10: 数值例子
        # ═══════════════════════════════════════════════════════════════════
        num_title = Text("数值示例：主动脉 vs 毛细血管", font=CJK, color=BLUE).scale(0.52)
        num_title.next_to(title, DOWN, buff=0.48)

        num_row1 = VGroup(
            Text("主动脉：", font=CJK).scale(0.46),
            MathTex(r"S_a \approx 3\,\text{cm}^2,\quad v_a \approx 20\,\text{cm/s},\quad p_a \approx 120\,\text{mmHg}", color=RED).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        num_row2 = VGroup(
            Text("毛细血管总：", font=CJK).scale(0.46),
            MathTex(r"S_c \approx 600\,\text{cm}^2,\quad v_c \approx 0.1\,\text{cm/s},\quad p_c \approx 25\,\text{mmHg}", color=PINK).scale(0.78),
        ).arrange(RIGHT, buff=0.2)

        num_row3 = VGroup(
            Text("验证连续性：", font=CJK, color=GREEN).scale(0.46),
            MathTex(r"S_a v_a = 3\times 20 = 60\,\text{mL/s}", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.2)
        num_row4 = VGroup(
            MathTex(r"S_c v_c = 600\times 0.1 = 60\,\text{mL/s}", color=YELLOW).scale(0.82),
            MathTex(r"\checkmark", color=GREEN).scale(1.2),
        ).arrange(RIGHT, buff=0.3)

        num_group = VGroup(num_row1, num_row2, num_row3, num_row4).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        num_group.next_to(num_title, DOWN, buff=0.40).scale_to_fit_width(12.5)

        self.play(FadeIn(num_title))
        self.play(FadeIn(num_row1))
        self.wait(0.8)
        self.play(FadeIn(num_row2))
        self.wait(0.8)
        self.play(FadeIn(num_row3))
        self.play(FadeIn(num_row4))
        self.wait(2.0)
        self.play(FadeOut(VGroup(num_title, num_group)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.42)

        s1 = VGroup(
            Text("连续性方程：", font=CJK).scale(0.44),
            MathTex(r"S\cdot v = Q \approx \text{const}", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.2)

        s2 = Text("毛细血管总截面积最大 → 血流速度最慢 → 保证物质交换",
                  font=CJK, color=GREEN).scale(0.42)

        s3 = VGroup(
            Text("血压沿程下降：", font=CJK).scale(0.44),
            MathTex(r"p_{\rm art}\,120\,\to\,p_{\rm cap}\,25\,\to\,p_{\rm vein}\,8\;\text{mmHg}", color=ORANGE).scale(0.75),
        ).arrange(RIGHT, buff=0.2)

        s4 = VGroup(
            Text("心跳脉压：", font=CJK).scale(0.44),
            MathTex(r"\Delta p = p_{\text{systolic}} - p_{\text{diastolic}} \approx 40\;\text{mmHg}", color=CYAN).scale(0.80),
        ).arrange(RIGHT, buff=0.2)

        s5 = VGroup(
            Text("伯努利（理想流体）：", font=CJK).scale(0.44),
            MathTex(r"p+\tfrac{1}{2}\rho v^2+\rho g h=\text{const}", color=YELLOW).scale(0.80),
        ).arrange(RIGHT, buff=0.2)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38).scale_to_fit_width(12.8)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.play(FadeIn(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(Write(s4))
        self.wait(0.5)
        self.play(Write(s5))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch02Kp4BloodCirculationVelocityPressure",
        "id": "phys-ch02-2.3-kp4-blood-circulation-velocity-pressure",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "血液循环中的血流速度与血压分布",
        "description": "用一维流程条展示血管总截面积S(x)与平均流速v(x)的镜像关系（连续性方程），叠加血压p(x)分布曲线（动脉红、静脉蓝），并以ValueTracker模拟心跳脉动演示收缩压与舒张压的动态波动。",
    },
]
