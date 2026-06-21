"""第 7.2 节 · 例题：均匀带电圆盘轴线场强（矢量场积分 + ValueTracker 扫动）。

物理类比范式：将圆盘拆成同心圆环，逐环积分，展示 dE_perp 对称消除、
dE_parallel 沿轴累加，最终得到 E = σ/(2ε₀)[1 - 1/√(1+R²/x²)]，
并演示点电荷极限（x≫R）与无限平面极限（R/x→∞）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch07Ex2ChargedDiskField",
        "id": "phys-ch07-7.2-ex2-charged-disk-field",
        "chapterId": "ch07",
        "sectionId": "7.2",
        "title": "例题：均匀带电圆盘轴线场强",
        "description": "将带电圆盘拆分为同心圆环逐步积分，动画演示 dE 垂直分量对称抵消、轴向分量累加，推导 E=σ/(2ε₀)[1-1/√(1+R²/x²)] 并展示两个物理极限。",
    },
]


class Ch07Ex2ChargedDiskField(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("例题：均匀带电圆盘轴线场强", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.2", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("圆盘上每一小块面元都带电，各自向轴线上的点 P 施加力。",
                    font=CJK).scale(0.46)
        ana2 = Text("关键对称性：垂直轴的分量成对抵消，只有沿轴方向合力。",
                    font=CJK, color=CYAN).scale(0.46)
        ana3 = Text("我们把圆盘切成一圈圈「圆环」，再把它们叠加起来。",
                    font=CJK).scale(0.46)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28)
        ana_group.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 建立几何图形 —— xz 平面中的圆盘与 P 点
        # ══════════════════════════════════════════════════════════════════
        # 坐标系：圆盘在左侧（圆心原点），P 在右侧，轴向为水平（x 方向）
        # 图形区占右半侧，公式区占左/上
        setup_label = Text("建立坐标：圆盘在 yz 平面，轴线为 x 轴", font=CJK, color=BLUE)
        setup_label.scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(setup_label))
        self.wait(0.8)
        self.play(FadeOut(setup_label))

        # 几何核心常量（屏幕坐标）
        DISK_CX = -2.5   # 圆盘圆心 x
        DISK_CY = -0.5   # 圆盘圆心 y（略低以留标注空间）
        R_SCR = 1.5      # 圆盘半径（屏幕单位）
        P_X = 2.2        # P 点 x
        P_Y = DISK_CY    # P 点与圆盘同高

        disk_center = np.array([DISK_CX, DISK_CY, 0])
        p_point = np.array([P_X, P_Y, 0])

        # 轴线（x 轴延伸线）
        axis_line = DashedLine(
            start=np.array([DISK_CX - 0.3, DISK_CY, 0]),
            end=np.array([P_X + 0.5, P_Y, 0]),
            color=GRAY, dash_length=0.12
        )

        # 圆盘用多个同心椭圆模拟（正视角：圆盘垂直于 x 轴，视为椭圆）
        def disk_ellipse(radius, color=BLUE, opacity=0.4):
            return Ellipse(
                width=radius * 0.55,   # 透视压缩（短轴）
                height=radius * 2,
                color=color
            ).move_to(disk_center).set_fill(color, opacity=opacity).set_stroke(color, width=1.5)

        # 绘制圆盘主体（多层同心椭圆渐变填充）
        n_rings = 6
        disk_rings_bg = VGroup()
        colors_bg = color_gradient([BLUE_E, BLUE_B, TEAL_B], n_rings)
        for i in range(n_rings, 0, -1):
            r = R_SCR * i / n_rings
            ring = disk_ellipse(r, color=colors_bg[i - 1], opacity=0.18)
            disk_rings_bg.add(ring)

        # 圆盘外轮廓
        disk_outline = Ellipse(
            width=R_SCR * 0.55,
            height=R_SCR * 2,
            color=BLUE_B
        ).move_to(disk_center).set_stroke(BLUE_B, width=2.5).set_fill(opacity=0)

        # P 点
        dot_P = Dot(p_point, radius=0.10, color=YELLOW)
        label_P = Text("P", font=CJK, color=YELLOW).scale(0.5).next_to(dot_P, RIGHT, buff=0.12)

        # 圆盘中心点
        dot_O = Dot(disk_center, radius=0.07, color=WHITE)
        label_O = Text("O", font=CJK, color=WHITE).scale(0.42).next_to(dot_O, DOWN, buff=0.1)

        # x 标注
        x_brace = BraceBetweenPoints(disk_center, p_point, direction=DOWN)
        x_label = MathTex(r"x", color=CYAN).scale(0.6).next_to(x_brace, DOWN, buff=0.1)

        # R 标注（圆盘半径水平标注）
        r_top = disk_center + np.array([0, R_SCR, 0])
        r_brace = BraceBetweenPoints(disk_center, r_top, direction=LEFT)
        r_label = MathTex(r"R", color=ORANGE).scale(0.6).next_to(r_brace, LEFT, buff=0.1)

        # 面密度标注
        sigma_label = VGroup(
            Text("面密度", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"\sigma", color=ORANGE).scale(0.6)
        ).arrange(RIGHT, buff=0.12).move_to(disk_center + np.array([-0.6, 0.6, 0]))

        geo_group = VGroup(axis_line, disk_rings_bg, disk_outline,
                           dot_O, label_O, dot_P, label_P,
                           x_brace, x_label, r_brace, r_label, sigma_label)

        self.play(Create(axis_line), run_time=0.8)
        self.play(FadeIn(disk_rings_bg), Create(disk_outline), run_time=1.0)
        self.play(FadeIn(dot_O), FadeIn(label_O), FadeIn(dot_P), FadeIn(label_P))
        self.play(FadeIn(x_brace), FadeIn(x_label), FadeIn(r_brace), FadeIn(r_label))
        self.play(FadeIn(sigma_label))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 高亮当前圆环（半径 a），标注 dq, dS
        # ══════════════════════════════════════════════════════════════════
        ring_intro = Text("取半径 a 处宽度 da 的圆环作为面元", font=CJK, color=GREEN)
        ring_intro.scale(0.46).to_edge(UP, buff=0.5).shift(DOWN * 0.7)
        # 用固定 a=0.6R_SCR 展示示意
        a_demo = 0.65 * R_SCR
        da_demo = 0.18 * R_SCR

        def make_ring_highlight(a_val, da_val, color=YELLOW, opacity=0.55):
            """用两个椭圆围成的 Annular 模拟圆环高亮。"""
            outer = Ellipse(
                width=(a_val + da_val) * 0.55,
                height=(a_val + da_val) * 2,
                color=color
            ).move_to(disk_center).set_fill(color, opacity=opacity).set_stroke(color, width=2)
            inner = Ellipse(
                width=a_val * 0.55,
                height=a_val * 2,
                color=BLACK
            ).move_to(disk_center).set_fill(BLACK, opacity=1.0).set_stroke(opacity=0)
            return VGroup(outer, inner)

        ring_hl = make_ring_highlight(a_demo, da_demo)

        # a, da 标注
        a_tip = disk_center + np.array([0, a_demo, 0])
        a_line = DashedLine(disk_center, a_tip, color=YELLOW, dash_length=0.1)
        a_label = MathTex(r"a", color=YELLOW).scale(0.55).next_to(a_tip, LEFT, buff=0.08)

        da_tip_inner = disk_center + np.array([0, a_demo, 0])
        da_tip_outer = disk_center + np.array([0, a_demo + da_demo, 0])
        da_brace = BraceBetweenPoints(da_tip_inner, da_tip_outer, direction=LEFT)
        da_label = MathTex(r"da", color=ORANGE).scale(0.5).next_to(da_brace, LEFT, buff=0.08)

        # dq 公式
        dq_expr = VGroup(
            Text("面元带电量：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"dq = \sigma \cdot 2\pi a\, da", color=YELLOW).scale(0.65)
        ).arrange(RIGHT, buff=0.12)
        dq_expr.to_corner(UL, buff=0.55).shift(DOWN * 0.4)

        self.play(FadeIn(ring_intro))
        self.play(FadeIn(ring_hl), Create(a_line), FadeIn(a_label),
                  FadeIn(da_brace), FadeIn(da_label))
        self.wait(0.8)
        self.play(FadeIn(dq_expr))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: dE 方向与分量分解，对称消除垂直分量
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(ring_intro), FadeOut(dq_expr))

        # 画圆环上一点的 dE 箭头，以及分量
        # 选圆环顶部（a_demo 处）一个微元位置
        elem_pos = disk_center + np.array([0, a_demo + da_demo / 2, 0])
        # dE 方向：从圆环微元 → P 点方向
        dE_vec = p_point - elem_pos
        dE_len = np.linalg.norm(dE_vec)
        dE_dir = dE_vec / dE_len
        dE_scale = 0.9
        dE_end = elem_pos + dE_dir * dE_scale

        arrow_dE = Arrow(elem_pos, dE_end, color=RED, buff=0,
                         stroke_width=3, max_tip_length_to_length_ratio=0.22)

        # 夹角 θ
        theta_val = math.atan2(a_demo + da_demo / 2, abs(P_X - DISK_CX))
        # dE_x = dE cos(θ)，dE_perp = dE sin(θ)
        dE_x_dir = np.array([1, 0, 0])
        dE_x_end = elem_pos + dE_x_dir * dE_scale * math.cos(theta_val)
        dE_perp_dir = np.array([0, -1, 0])   # 垂直分量向下（从顶部微元指向轴线方向）
        dE_perp_end = elem_pos + dE_perp_dir * dE_scale * math.sin(theta_val)

        arrow_dEx = Arrow(elem_pos, dE_x_end, color=GREEN, buff=0,
                          stroke_width=2.5, max_tip_length_to_length_ratio=0.22)
        arrow_dEperp = Arrow(elem_pos, dE_perp_end, color=ORANGE, buff=0,
                             stroke_width=2.5, max_tip_length_to_length_ratio=0.22)

        dE_label = MathTex(r"d\vec{E}", color=RED).scale(0.5).next_to(dE_end, UR, buff=0.08)
        dEx_label = MathTex(r"dE_x", color=GREEN).scale(0.48).next_to(dE_x_end, RIGHT, buff=0.08)
        dEp_label = MathTex(r"dE_{\perp}", color=ORANGE).scale(0.48).next_to(dE_perp_end, LEFT, buff=0.06)

        # 角度标注
        theta_arc = Arc(radius=0.28, start_angle=0, angle=theta_val,
                        color=CYAN).move_arc_center_to(elem_pos)
        theta_label = MathTex(r"\theta", color=CYAN).scale(0.48).next_to(theta_arc, RIGHT, buff=0.05)

        decomp_title = Text("矢量分解：垂直分量对称消除，轴向分量叠加", font=CJK, color=CYAN)
        decomp_title.scale(0.44).to_edge(DOWN, buff=0.55)

        sym_note1 = Text("对侧面元的垂直分量方向相反 → 相消", font=CJK, color=ORANGE)
        sym_note1.scale(0.42).to_edge(DOWN, buff=0.3)

        # cos θ 关系
        cos_expr = MathTex(r"\cos\theta = \frac{x}{\sqrt{x^2+a^2}}", color=GREEN).scale(0.65)
        cos_expr.to_corner(UL, buff=0.55).shift(DOWN * 0.4)

        self.play(Create(arrow_dE), FadeIn(dE_label))
        self.wait(0.5)
        self.play(Create(arrow_dEx), FadeIn(dEx_label),
                  Create(arrow_dEperp), FadeIn(dEp_label))
        self.play(FadeIn(theta_arc), FadeIn(theta_label))
        self.wait(0.5)
        self.play(FadeIn(decomp_title))
        self.wait(1.0)

        # 演示"对侧消除"：再画对侧一点的 dE_perp（方向向上，对消）
        elem_pos2 = disk_center + np.array([0, -(a_demo + da_demo / 2), 0])
        dE_perp2_end = elem_pos2 + np.array([0, 1, 0]) * dE_scale * math.sin(theta_val)
        arrow_dEperp2 = Arrow(elem_pos2, dE_perp2_end, color=ORANGE, buff=0,
                              stroke_width=2.5, max_tip_length_to_length_ratio=0.22)
        dEp2_label = MathTex(r"dE_{\perp}", color=ORANGE).scale(0.48).next_to(dE_perp2_end, LEFT, buff=0.06)

        self.play(Create(arrow_dEperp2), FadeIn(dEp2_label))
        self.play(FadeIn(sym_note1))
        self.wait(0.8)

        # 垂直分量交叉消失
        self.play(FadeOut(arrow_dEperp), FadeOut(dEp_label),
                  FadeOut(arrow_dEperp2), FadeOut(dEp2_label),
                  FadeOut(sym_note1))
        self.wait(0.5)
        self.play(FadeIn(cos_expr))
        self.wait(1.2)

        clean1 = VGroup(arrow_dE, dE_label, arrow_dEx, dEx_label,
                        theta_arc, theta_label, decomp_title, cos_expr,
                        a_line, a_label, da_brace, da_label, ring_hl)
        self.play(FadeOut(clean1))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: dE_x 表达式推导（逐步展示）
        # ══════════════════════════════════════════════════════════════════
        deriv_title = Text("推导圆环对 P 点的轴向场强 dE_x", font=CJK, color=BLUE)
        deriv_title.scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        step_ring = MathTex(
            r"dq", r"=", r"\sigma \cdot 2\pi a\, da"
        ).scale(0.78)
        step_ring[0].set_color(YELLOW)
        step_ring.next_to(deriv_title, DOWN, buff=0.45)

        step_dE = MathTex(
            r"dE", r"=", r"\frac{1}{4\pi\varepsilon_0}", r"\frac{dq}{a^2+x^2}"
        ).scale(0.78)
        step_dE[0].set_color(RED)
        step_dE[2].set_color(CYAN)
        step_dE.next_to(step_ring, DOWN, buff=0.35)

        step_dEx = MathTex(
            r"dE_x", r"=", r"dE\cos\theta", r"=",
            r"\frac{\sigma\, x\, a\, da}{2\varepsilon_0 (a^2+x^2)^{3/2}}"
        ).scale(0.72)
        step_dEx[0].set_color(GREEN)
        step_dEx[4].set_color(YELLOW)
        step_dEx.next_to(step_dE, DOWN, buff=0.35)

        note_cos = Text("（已代入 cos θ = x/√(a²+x²) 并化简）",
                        font=CJK, color=GRAY).scale(0.38)
        note_cos.next_to(step_dEx, DOWN, buff=0.2)

        self.play(Write(step_ring))
        self.wait(0.8)
        self.play(Write(step_dE))
        self.wait(0.8)
        self.play(Write(step_dEx))
        self.play(FadeIn(note_cos))
        self.wait(1.6)
        self.play(FadeOut(VGroup(deriv_title, step_ring, step_dE, step_dEx, note_cos)))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: ValueTracker 扫 a 从 0 到 R，积分曲线生长
        # ══════════════════════════════════════════════════════════════════
        integ_title = Text("对 a 从 0 到 R 积分：E_x = ∫dE_x", font=CJK, color=BLUE)
        integ_title.scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(integ_title))

        # 积分表达式
        integ_expr = MathTex(
            r"E_x = \int_0^R \frac{\sigma\, x\, a}{2\varepsilon_0 (a^2+x^2)^{3/2}}\,da"
        ).scale(0.72).next_to(integ_title, DOWN, buff=0.35)
        integ_expr.set_color(YELLOW)
        self.play(Write(integ_expr))
        self.wait(1.0)

        # 展示积分结果
        integ_result = MathTex(
            r"E_x = \frac{\sigma}{2\varepsilon_0}",
            r"\left[1 - \frac{x}{\sqrt{x^2+R^2}}\right]"
        ).scale(0.78)
        integ_result[0].set_color(GREEN)
        integ_result[1].set_color(YELLOW)
        integ_result.next_to(integ_expr, DOWN, buff=0.4)
        equal_note = VGroup(
            Text("化简：令", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"u = a^2+x^2", color=CYAN).scale(0.6)
        ).arrange(RIGHT, buff=0.1).next_to(integ_result, DOWN, buff=0.25)

        self.play(Write(integ_result))
        self.play(FadeIn(equal_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(integ_title, integ_expr, integ_result, equal_note)))

        # ── 圆盘拆分动画（ValueTracker 扫动圆环）──────────────────────────
        vt_a = ValueTracker(0.0)

        # 背景圆盘（已经存在的 disk_rings_bg, disk_outline）
        # 这里重新创建小一点的示意图
        DISK2_CX = -1.8
        DISK2_CY = -0.8
        R2 = 1.2
        dc2 = np.array([DISK2_CX, DISK2_CY, 0])

        disk2_bg = Ellipse(width=R2 * 0.55, height=R2 * 2,
                           color=BLUE_E).move_to(dc2).set_fill(BLUE_E, opacity=0.2).set_stroke(BLUE_B, 2)

        def make_swept_ring():
            a_now = vt_a.get_value()
            if a_now < 0.03:
                return VGroup()
            outer_r = min(a_now + 0.12, R2)
            outer = Ellipse(width=outer_r * 0.55, height=outer_r * 2,
                            color=YELLOW).move_to(dc2).set_fill(YELLOW, opacity=0.5).set_stroke(YELLOW, 1.5)
            inner_r = max(a_now - 0.05, 0)
            if inner_r < 0.02:
                return outer
            inner = Ellipse(width=inner_r * 0.55, height=inner_r * 2,
                            color=BLACK).move_to(dc2).set_fill(BLACK, opacity=1.0).set_stroke(opacity=0)
            return VGroup(outer, inner)

        swept_ring = always_redraw(make_swept_ring)

        # P 点（右侧）
        p2 = np.array([2.0, DISK2_CY, 0])
        dot_P2 = Dot(p2, radius=0.1, color=YELLOW)
        lP2 = Text("P", font=CJK, color=YELLOW).scale(0.45).next_to(dot_P2, RIGHT, buff=0.1)
        axis2 = DashedLine(np.array([DISK2_CX - 0.2, DISK2_CY, 0]),
                           np.array([2.3, DISK2_CY, 0]), color=GRAY, dash_length=0.1)

        # 积分曲线绘制（右侧小坐标轴）
        AX_X0 = 0.5
        AX_Y0 = -1.2
        AX_W = 3.0
        AX_H = 1.6
        ax_frame = VGroup(
            Line([AX_X0, AX_Y0, 0], [AX_X0 + AX_W, AX_Y0, 0], color=WHITE, stroke_width=1.5),
            Line([AX_X0, AX_Y0, 0], [AX_X0, AX_Y0 + AX_H, 0], color=WHITE, stroke_width=1.5),
        )
        ax_xlabel = MathTex(r"a/R", color=GRAY).scale(0.4).next_to(
            np.array([AX_X0 + AX_W, AX_Y0, 0]), RIGHT, buff=0.05)
        ax_ylabel = MathTex(r"E_x", color=GRAY).scale(0.4).next_to(
            np.array([AX_X0, AX_Y0 + AX_H, 0]), UP, buff=0.05)

        # E_x vs a 数值（x=1, R=1, σ=1, ε₀ taken as 1/(2) so E_max=1）
        # E_x(a) ∝ σ/(2ε₀) * [1 - x/√(x²+a²)]，归一化
        x_phys = 1.0
        R_phys = 1.0
        E_max = 1.0   # σ/(2ε₀)=1 for normalization

        def ex_func(a_val):
            return E_max * (1.0 - x_phys / math.sqrt(x_phys ** 2 + a_val ** 2)) if a_val > 1e-6 else 0.0

        E_at_R = ex_func(R_phys)

        def a_to_screen_x(a_val):
            return AX_X0 + (a_val / R_phys) * AX_W

        def e_to_screen_y(e_val):
            return AX_Y0 + (e_val / E_max) * AX_H

        def make_integ_curve():
            a_now = vt_a.get_value()
            if a_now < 0.02:
                return VGroup()
            pts = []
            n = max(2, int(a_now / R_phys * 60))
            for i in range(n + 1):
                a_i = a_now * i / n
                e_i = ex_func(a_i)
                pts.append([a_to_screen_x(a_i), e_to_screen_y(e_i), 0])
            return VMobject(color=GREEN, stroke_width=2.5).set_points_as_corners(pts)

        integ_curve = always_redraw(make_integ_curve)

        # 当前积分值指示点
        def make_dot_on_curve():
            a_now = vt_a.get_value()
            if a_now < 0.02:
                return Dot(radius=0.001, color=GREEN)
            e_now = ex_func(a_now)
            return Dot([a_to_screen_x(a_now), e_to_screen_y(e_now), 0],
                       radius=0.08, color=YELLOW)

        dot_curve = always_redraw(make_dot_on_curve)

        ax_group = VGroup(ax_frame, ax_xlabel, ax_ylabel)
        scan_label = Text("积分曲线实时生长（a 从 0 扫到 R）", font=CJK, color=GREEN)
        scan_label.scale(0.42).to_edge(UP, buff=0.55).shift(DOWN * 0.7)

        self.play(FadeIn(disk2_bg), Create(axis2), FadeIn(dot_P2), FadeIn(lP2))
        self.play(FadeIn(ax_group))
        self.add(swept_ring, integ_curve, dot_curve)
        self.play(FadeIn(scan_label))
        self.wait(0.5)

        # 扫动
        self.play(vt_a.animate.set_value(R2 * 0.98), run_time=3.5, rate_func=linear)
        self.wait(1.2)

        # 最终 E 值标注
        e_final_dot = Dot([a_to_screen_x(R_phys), e_to_screen_y(E_at_R), 0],
                          radius=0.09, color=YELLOW)
        e_final_label = MathTex(r"E(R)", color=YELLOW).scale(0.45)
        e_final_label.next_to(e_final_dot, UR, buff=0.08)
        self.play(FadeIn(e_final_dot), FadeIn(e_final_label))
        self.wait(1.0)

        clean2 = VGroup(disk2_bg, axis2, dot_P2, lP2, swept_ring,
                        ax_group, integ_curve, dot_curve, scan_label,
                        e_final_dot, e_final_label)
        self.play(FadeOut(clean2))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 最终公式（主结果 + 变形）
        # ══════════════════════════════════════════════════════════════════
        result_title = Text("均匀带电圆盘轴线场强：主结果", font=CJK, color=BLUE)
        result_title.scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(result_title))

        main_result = MathTex(
            r"E = \frac{\sigma}{2\varepsilon_0}",
            r"\left[1 - \frac{1}{\sqrt{1+R^2/x^2}}\right]"
        ).scale(0.88)
        main_result[0].set_color(GREEN)
        main_result[1].set_color(YELLOW)
        main_result.next_to(result_title, DOWN, buff=0.5)

        equiv_note = VGroup(
            Text("（等价写法：", font=CJK, color=GRAY).scale(0.4),
            MathTex(r"\frac{x}{\sqrt{x^2+R^2}} = \frac{1}{\sqrt{1+R^2/x^2}}", color=GRAY).scale(0.55),
            Text("）", font=CJK, color=GRAY).scale(0.4)
        ).arrange(RIGHT, buff=0.08).next_to(main_result, DOWN, buff=0.25)

        box_main = SurroundingRectangle(main_result, color=YELLOW, buff=0.25, corner_radius=0.12)

        self.play(Write(main_result))
        self.play(Create(box_main))
        self.play(FadeIn(equiv_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(result_title, main_result, box_main, equiv_note)))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 极限分析 —— E(x) 曲线 + 两个极限
        # ══════════════════════════════════════════════════════════════════
        lim_title = Text("物理极限分析", font=CJK, color=BLUE)
        lim_title.scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(lim_title))

        # E(x) 曲线坐标轴（以 σ/(2ε₀)=1, R=1 为参数）
        LAX_X0 = -3.5
        LAX_Y0 = -1.8
        LAX_W = 6.5
        LAX_H = 2.8
        lax_xaxis = Arrow([LAX_X0, LAX_Y0, 0], [LAX_X0 + LAX_W, LAX_Y0, 0],
                          color=WHITE, stroke_width=2, max_tip_length_to_length_ratio=0.04)
        lax_yaxis = Arrow([LAX_X0, LAX_Y0, 0], [LAX_X0, LAX_Y0 + LAX_H, 0],
                          color=WHITE, stroke_width=2, max_tip_length_to_length_ratio=0.05)
        lax_xlabel = MathTex(r"x/R", color=GRAY).scale(0.45).next_to(
            [LAX_X0 + LAX_W, LAX_Y0, 0], RIGHT, buff=0.08)
        lax_ylabel = MathTex(r"E\,/\,\frac{\sigma}{2\varepsilon_0}", color=GRAY).scale(0.42).next_to(
            [LAX_X0, LAX_Y0 + LAX_H, 0], UP, buff=0.06)

        # x/R 范围 0.05 ~ 5
        x_min_r = 0.05
        x_max_r = 5.0

        def x_to_sx(xr):
            return LAX_X0 + (math.log(xr) - math.log(x_min_r)) / (math.log(x_max_r) - math.log(x_min_r)) * LAX_W

        def E_to_sy(e_val):
            return LAX_Y0 + e_val * LAX_H  # E in [0,1]

        def Ex_of_xR(xr):
            return 1.0 - 1.0 / math.sqrt(1.0 + 1.0 / (xr ** 2))

        # 绘制 E(x) 曲线
        n_pts = 120
        curve_pts = []
        for i in range(n_pts + 1):
            xr = x_min_r * (x_max_r / x_min_r) ** (i / n_pts)
            e_v = Ex_of_xR(xr)
            curve_pts.append([x_to_sx(xr), E_to_sy(e_v), 0])

        Ex_curve = VMobject(color=BLUE, stroke_width=3).set_points_smoothly(curve_pts)

        # 渐近线 E=1（无限平面）
        asymptote_top = DashedLine(
            [LAX_X0, E_to_sy(1.0), 0], [LAX_X0 + LAX_W * 0.5, E_to_sy(1.0), 0],
            color=ORANGE, dash_length=0.15
        )
        lim_plane_label = VGroup(
            MathTex(r"E\to\frac{\sigma}{2\varepsilon_0}", color=ORANGE).scale(0.52),
            Text("（无限平面）", font=CJK, color=ORANGE).scale(0.38)
        ).arrange(RIGHT, buff=0.1)
        lim_plane_label.next_to([LAX_X0, E_to_sy(1.0), 0], RIGHT, buff=0.1)

        # 点电荷极限标注（x 大时）
        xr_large = 4.0
        e_large = Ex_of_xR(xr_large)
        dot_large = Dot([x_to_sx(xr_large), E_to_sy(e_large), 0], radius=0.09, color=GREEN)
        lim_point_label = VGroup(
            MathTex(r"E\approx k\frac{Q}{x^2}", color=GREEN).scale(0.5),
            Text("（点电荷极限）", font=CJK, color=GREEN).scale(0.36)
        ).arrange(DOWN, buff=0.1)
        lim_point_label.next_to(dot_large, UR, buff=0.12)

        # y 轴刻度
        tick1 = VGroup(
            Line([LAX_X0 - 0.08, E_to_sy(1.0), 0], [LAX_X0 + 0.08, E_to_sy(1.0), 0], color=GRAY),
            MathTex(r"1", color=GRAY).scale(0.4).next_to([LAX_X0, E_to_sy(1.0), 0], LEFT, buff=0.1)
        )
        tick05 = VGroup(
            Line([LAX_X0 - 0.08, E_to_sy(0.5), 0], [LAX_X0 + 0.08, E_to_sy(0.5), 0], color=GRAY),
            MathTex(r"0.5", color=GRAY).scale(0.38).next_to([LAX_X0, E_to_sy(0.5), 0], LEFT, buff=0.1)
        )

        lax_group = VGroup(lax_xaxis, lax_yaxis, lax_xlabel, lax_ylabel, tick1, tick05)
        self.play(FadeIn(lax_group))
        self.play(Create(Ex_curve), run_time=1.8)
        self.wait(0.5)

        # 极限1：无限平面（x << R，左侧趋近1）
        self.play(Create(asymptote_top), FadeIn(lim_plane_label))
        self.wait(1.0)

        # 极限2：点电荷（x >> R，右侧趋近0）
        self.play(FadeIn(dot_large), FadeIn(lim_point_label))
        self.wait(1.2)

        # 公式对比
        lim1_eq = MathTex(r"x\ll R:\;E\approx\frac{\sigma}{2\varepsilon_0}", color=ORANGE).scale(0.6)
        lim2_eq = MathTex(r"x\gg R:\;E\approx k\frac{Q}{x^2}", color=GREEN).scale(0.6)
        lim_eqs = VGroup(lim1_eq, lim2_eq).arrange(DOWN, buff=0.3)
        lim_eqs.to_corner(UR, buff=0.5).shift(DOWN * 0.5)
        self.play(FadeIn(lim_eqs))
        self.wait(1.5)

        clean3 = VGroup(lim_title, lax_group, Ex_curve,
                        asymptote_top, lim_plane_label,
                        dot_large, lim_point_label, lim_eqs)
        self.play(FadeOut(clean3))

        # ══════════════════════════════════════════════════════════════════
        # Step 10: 清除几何图，进入小结卡
        # ══════════════════════════════════════════════════════════════════
        # 清除仍在屏幕上的几何组
        remaining = VGroup(geo_group)
        self.play(FadeOut(remaining))

        # ══════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("主结果：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"E=\frac{\sigma}{2\varepsilon_0}\!\left[1-\frac{1}{\sqrt{1+R^2/x^2}}\right]",
                    color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("点电荷极限 ", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"(x\gg R):", color=GREEN).scale(0.6),
            MathTex(r"E\approx k\dfrac{Q}{x^2}", color=GREEN).scale(0.68)
        ).arrange(RIGHT, buff=0.12)

        s3 = VGroup(
            Text("无限平面极限 ", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"(x\ll R):", color=ORANGE).scale(0.6),
            MathTex(r"E\approx\dfrac{\sigma}{2\varepsilon_0}", color=ORANGE).scale(0.68)
        ).arrange(RIGHT, buff=0.12)

        s4 = Text("关键：垂直分量对称消除 → 只需积分轴向分量 dE·cosθ",
                  font=CJK, color=CYAN).scale(0.40)

        summary_group = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary_group.next_to(s_title, DOWN, buff=0.45)
        summary_group.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_group, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary_group, box, title)))
        self.wait(0.4)
