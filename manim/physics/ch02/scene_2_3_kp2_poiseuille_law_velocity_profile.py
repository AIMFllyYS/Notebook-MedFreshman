"""第 2.3 节 · 泊肃叶定律与抛物面流速分布（知识点 KP2）。

可视化方案：
    幕一 ── 管截面上渲染抛物线速度分布剖面（颜色映射 蓝→红），
            右侧画出 v(r)=v_max*(1-(r/R)^2) 曲线；
    幕二 ── ValueTracker 改变管半径 R，抛物面峰值随 R^4 变化，
            下方绘制 Q vs R 四次曲线，高亮 Q∝R^4 的灵敏性；
    幕三 ── 泊肃叶公式拆解为 Q=Δp/Rf，动画展示各参数物理含义。

铁律：MathTex 内只含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


def velocity_profile_color(r_frac):
    """r_frac ∈ [0,1]：0=轴心(红/最快), 1=管壁(蓝/零速)。"""
    return interpolate_color(RED, BLUE, r_frac)


class Ch02Kp2PoiseuilleLawVelocityProfile(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ═══════════════════════════════════════════════════════════════════
        title = Text("泊肃叶定律与抛物面流速分布", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第二章 流体运动  ·  2.3 粘性流体的流动", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.16)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.4)
        self.play(FadeOut(subtitle))

        # ═══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ═══════════════════════════════════════════════════════════════════
        ana1 = Text("打点滴时，护士为什么要将针头刺入更粗的血管？", font=CJK).scale(0.47)
        ana2 = Text("因为流量与管半径的四次方成正比——", font=CJK).scale(0.47)
        ana3 = Text("管径只要加倍，流量就增大 16 倍！这就是泊肃叶定律的惊人之处。", font=CJK).scale(0.47)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.26, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.52).scale_to_fit_width(12.5)
        for line in ana_group:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.2)
        self.play(FadeOut(ana_group))

        # ═══════════════════════════════════════════════════════════════════
        # Step 3: 核心公式定义（逐行）
        # ═══════════════════════════════════════════════════════════════════
        def_cap = Text("泊肃叶定律（层流·圆管）", font=CJK, color=BLUE).scale(0.50)
        def_cap.next_to(title, DOWN, buff=0.45)

        # 流速剖面
        eq_v_lhs = VGroup(
            Text("速度分布：", font=CJK).scale(0.44),
            MathTex(r"v(r) = \frac{\Delta p}{4\eta L}(R^2 - r^2)", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.18)

        # 流量
        eq_Q_lhs = VGroup(
            Text("流量：", font=CJK).scale(0.44),
            MathTex(r"Q = \frac{\pi R^4 \Delta p}{8 \eta L}", color=YELLOW).scale(0.82),
        ).arrange(RIGHT, buff=0.18)

        # 流阻
        eq_Rf_lhs = VGroup(
            Text("流阻：", font=CJK).scale(0.44),
            MathTex(r"R_f = \frac{8\eta L}{\pi R^4}", color=ORANGE).scale(0.82),
        ).arrange(RIGHT, buff=0.18)

        defs = VGroup(eq_v_lhs, eq_Q_lhs, eq_Rf_lhs).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        defs.next_to(def_cap, DOWN, buff=0.38).scale_to_fit_width(12.0)

        self.play(FadeIn(def_cap))
        self.play(FadeIn(eq_v_lhs))
        self.wait(0.9)
        self.play(FadeIn(eq_Q_lhs))
        self.wait(0.9)
        self.play(FadeIn(eq_Rf_lhs))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_cap, defs)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 4: 幕一 ── 管截面抛物线速度剖面（2D 示意）
        # ═══════════════════════════════════════════════════════════════════
        act1_cap = Text("幕一：圆管截面上的速度分布——抛物面",
                        font=CJK, color=CYAN).scale(0.40).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(act1_cap))

        # 左侧：管截面颜色分布（用水平色带模拟）
        # 画圆管横截面（竖直），半径 R_display = 1.6
        R_disp = 1.6
        cx, cy = -3.2, -0.3   # 圆心位置

        # 圆管管壁（外圆）
        pipe_circle = Circle(radius=R_disp, color=WHITE, stroke_width=2.5)
        pipe_circle.move_to([cx, cy, 0])

        # 用多条水平矩形色带填充截面，颜色从轴心红→管壁蓝
        N_bands = 40
        band_group = VGroup()
        for i in range(N_bands):
            # r_frac: 0=轴心, 1=管壁
            r_frac = (i + 0.5) / N_bands
            r = r_frac * R_disp
            # 每条带的半高
            if i < N_bands - 1:
                r_next = ((i + 1.5) / N_bands) * R_disp
                h = r_next - r
            else:
                h = R_disp / N_bands
            # 弦长（弦宽）
            chord = 2 * math.sqrt(max(0, R_disp**2 - r**2))
            if chord < 0.01:
                continue
            col = velocity_profile_color(r_frac)
            # 上半带
            rect_up = Rectangle(width=chord, height=h + 0.02,
                                 fill_color=col, fill_opacity=0.90,
                                 stroke_width=0)
            rect_up.move_to([cx, cy + r, 0])
            # 下半带（对称）
            rect_dn = Rectangle(width=chord, height=h + 0.02,
                                 fill_color=col, fill_opacity=0.90,
                                 stroke_width=0)
            rect_dn.move_to([cx, cy - r, 0])
            band_group.add(rect_up, rect_dn)
        # 轴心（r=0）处也填一条
        center_band = Rectangle(width=2 * R_disp, height=R_disp / N_bands,
                                 fill_color=RED, fill_opacity=0.90, stroke_width=0)
        center_band.move_to([cx, cy, 0])
        band_group.add(center_band)

        # 裁剪：用 Intersection 思路太复杂，改用遮罩圆剪裁
        # 简单方案：先画填充圆，再叠色带
        bg_circle = Circle(radius=R_disp, fill_color=BLUE, fill_opacity=0.85, stroke_width=0)
        bg_circle.move_to([cx, cy, 0])

        # 画圆形填充（从外到内，颜色从蓝到红）
        colored_disc = VGroup()
        for i in range(N_bands, 0, -1):
            r_frac = i / N_bands
            r_val = r_frac * R_disp
            col = velocity_profile_color(r_frac)
            disc = Circle(radius=r_val,
                          fill_color=col, fill_opacity=1.0,
                          stroke_width=0)
            disc.move_to([cx, cy, 0])
            colored_disc.add(disc)

        self.play(FadeIn(colored_disc), Create(pipe_circle), run_time=1.5)

        # 标注轴心和管壁
        axis_dot = Dot([cx, cy, 0], color=WHITE, radius=0.08)
        axis_label = VGroup(
            Text("轴心", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"v_{max}", color=RED).scale(0.65),
        ).arrange(DOWN, buff=0.08).next_to([cx, cy, 0], UP, buff=0.12)

        wall_dot_top = Dot([cx, cy + R_disp, 0], color=WHITE, radius=0.07)
        wall_label = VGroup(
            Text("管壁", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"v=0", color=BLUE).scale(0.65),
        ).arrange(DOWN, buff=0.08).next_to([cx, cy + R_disp, 0], RIGHT, buff=0.12)

        self.play(FadeIn(axis_dot), FadeIn(axis_label))
        self.play(FadeIn(wall_dot_top), FadeIn(wall_label))
        self.wait(0.8)

        # 右侧：v(r) 抛物线坐标轴
        axes = Axes(
            x_range=[0, 1.05, 0.5],
            y_range=[-1.05, 1.05, 0.5],
            x_length=3.6,
            y_length=3.4,
            axis_config={"color": BLUE, "include_tip": True, "tip_length": 0.18},
        ).shift([2.8, cy, 0])

        x_lbl = MathTex(r"v").scale(0.55).next_to(axes.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl = MathTex(r"r").scale(0.55).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        # 正半轴抛物线（r: 0→R）
        def v_of_r_norm(r_norm):
            """r_norm ∈ [0,1]，返回 v/v_max = 1 - r_norm^2"""
            return 1.0 - r_norm ** 2

        # 上半（r > 0）
        curve_up = axes.plot_parametric_curve(
            lambda t: [v_of_r_norm(t), t, 0],
            t_range=[0, 1.0],
            color=YELLOW,
            stroke_width=2.5,
        )
        # 下半（r < 0，对称）
        curve_dn = axes.plot_parametric_curve(
            lambda t: [v_of_r_norm(t), -t, 0],
            t_range=[0, 1.0],
            color=YELLOW,
            stroke_width=2.5,
        )

        v_label = VGroup(
            MathTex(r"v(r)=v_{max}", color=YELLOW).scale(0.55),
            MathTex(r"\!\left(1-\tfrac{r^2}{R^2}\right)", color=YELLOW).scale(0.55),
        ).arrange(DOWN, buff=0.05).next_to(axes, UP, buff=0.18).shift(LEFT * 0.3)

        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(curve_up), Create(curve_dn))
        self.play(FadeIn(v_label))
        self.wait(1.8)

        # 清场幕一
        self.play(FadeOut(VGroup(
            colored_disc, pipe_circle, axis_dot, axis_label,
            wall_dot_top, wall_label,
            axes, x_lbl, y_lbl, curve_up, curve_dn, v_label,
            act1_cap,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 5: 幕二 ── ValueTracker 改变管半径 R，演示 Q∝R⁴
        # ═══════════════════════════════════════════════════════════════════
        act2_cap = Text("幕二：管半径 R 增大，流量 Q 按 R^4 激增",
                        font=CJK, color=CYAN).scale(0.40).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(act2_cap))

        R_tracker = ValueTracker(0.5)    # 用归一化半径，0.5→1.0 表示 0.5R_ref→R_ref

        # 左侧：动态圆管截面
        pipe_cx, pipe_cy = -3.5, 0.2

        # 固定基准圆（表示最大管壁位置参考）
        ref_circle = Circle(radius=1.8, color=DARK_GRAY, stroke_width=1.5,
                            stroke_opacity=0.5)
        ref_circle.move_to([pipe_cx, pipe_cy, 0])
        self.play(FadeIn(ref_circle))

        def make_pipe_cross_section():
            r = R_tracker.get_value() * 1.8   # 实际显示半径
            grp = VGroup()
            N = 30
            for i in range(N, 0, -1):
                r_frac = i / N
                r_val = r_frac * r
                col = velocity_profile_color(r_frac)
                disc = Circle(radius=r_val,
                              fill_color=col, fill_opacity=1.0,
                              stroke_width=0)
                disc.move_to([pipe_cx, pipe_cy, 0])
                grp.add(disc)
            wall = Circle(radius=r, color=WHITE, stroke_width=2.0)
            wall.move_to([pipe_cx, pipe_cy, 0])
            grp.add(wall)
            return grp

        dynamic_cross = always_redraw(make_pipe_cross_section)
        self.add(dynamic_cross)

        # v_max 读数（v_max ∝ R²，Δp/η/L固定）
        def make_vmax_label():
            r_norm = R_tracker.get_value()
            vmax_rel = r_norm ** 2   # v_max ∝ R²
            return VGroup(
                Text("轴心速度：", font=CJK).scale(0.38),
                MathTex(rf"v_{{max}} \propto R^2 = {vmax_rel:.2f}", color=RED).scale(0.62),
            ).arrange(RIGHT, buff=0.1).next_to([pipe_cx, pipe_cy, 0], DOWN, buff=1.9 + 0.1)

        vmax_label = always_redraw(make_vmax_label)
        self.add(vmax_label)

        # 右侧：Q vs R 四次曲线坐标轴
        q_axes = Axes(
            x_range=[0, 1.05, 0.5],
            y_range=[0, 1.05, 0.5],
            x_length=4.2,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True, "tip_length": 0.18},
        ).shift([2.5, 0.0, 0])

        q_x_lbl = VGroup(
            MathTex(r"R", color=WHITE).scale(0.55),
        ).next_to(q_axes.x_axis.get_end(), DOWN, buff=0.14)
        q_y_lbl = VGroup(
            MathTex(r"Q", color=WHITE).scale(0.55),
        ).next_to(q_axes.y_axis.get_end(), LEFT, buff=0.14)

        # Q ∝ R^4 曲线
        q_curve = q_axes.plot(
            lambda r: r ** 4,
            x_range=[0, 1.0],
            color=GREEN,
            stroke_width=2.5,
        )
        q_title = VGroup(
            MathTex(r"Q \propto R^4", color=GREEN).scale(0.72),
        ).next_to(q_axes, UP, buff=0.18)

        self.play(Create(q_axes), FadeIn(q_x_lbl), FadeIn(q_y_lbl))
        self.play(Create(q_curve), FadeIn(q_title))
        self.wait(0.5)

        # 动态竖直指示线（显示当前 R 对应的 Q）
        def make_q_indicator():
            r_norm = R_tracker.get_value()
            q_norm = r_norm ** 4
            pt_x = q_axes.c2p(r_norm, 0)
            pt_y = q_axes.c2p(r_norm, q_norm)
            pt_curve = q_axes.c2p(r_norm, q_norm)
            pt_origin = q_axes.c2p(0, q_norm)
            v_line = DashedLine(pt_x, pt_y, color=YELLOW, stroke_width=1.8)
            h_line = DashedLine(pt_origin, pt_curve, color=YELLOW, stroke_width=1.8)
            dot = Dot(pt_curve, color=YELLOW, radius=0.09)
            return VGroup(v_line, h_line, dot)

        q_indicator = always_redraw(make_q_indicator)
        self.add(q_indicator)

        # R 读数标签
        def make_r_label():
            r_norm = R_tracker.get_value()
            return VGroup(
                Text("管半径：", font=CJK).scale(0.38),
                MathTex(rf"R = {r_norm:.2f} R_0", color=ORANGE).scale(0.62),
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.5)

        r_label = always_redraw(make_r_label)
        self.add(r_label)

        self.wait(0.5)
        # 从 R=0.5 增大到 R=1.0
        self.play(R_tracker.animate.set_value(1.0), run_time=3.5, rate_func=smooth)
        self.wait(0.8)

        # 高亮 R×2 → Q×16
        highlight_note = Text("R 增大 2 倍  →  Q 增大 16 倍！", font=CJK, color=RED).scale(0.46)
        highlight_note.next_to(q_title, DOWN, buff=0.22)
        self.play(FadeIn(highlight_note))
        self.wait(1.2)

        # 再演示从 R=1 降回 R=0.5 →感受灵敏度
        self.play(R_tracker.animate.set_value(0.5), run_time=2.5, rate_func=smooth)
        self.wait(0.6)

        q_sens = VGroup(
            Text("流量从 Q 降至", font=CJK).scale(0.40),
            MathTex(r"Q \times (0.5)^4 = Q/16", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.10).next_to(highlight_note, DOWN, buff=0.20)
        self.play(FadeIn(q_sens))
        self.wait(1.5)

        # 清场幕二
        self.play(FadeOut(VGroup(
            ref_circle, dynamic_cross, vmax_label,
            q_axes, q_x_lbl, q_y_lbl, q_curve, q_title,
            q_indicator, r_label, highlight_note, q_sens,
            act2_cap,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 6: 幕三 ── 公式拆解：Q = Δp / R_f，各参数物理意义
        # ═══════════════════════════════════════════════════════════════════
        act3_cap = Text("幕三：泊肃叶公式拆解——流量 = 压差 / 流阻",
                        font=CJK, color=CYAN).scale(0.40).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(act3_cap))

        # 类比电路：I = V / R
        analogy_elec = VGroup(
            Text("类比电路欧姆定律：", font=CJK).scale(0.46),
            MathTex(r"I = \frac{V}{R_{elec}}", color=CYAN).scale(0.85),
        ).arrange(RIGHT, buff=0.18)
        analogy_elec.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(analogy_elec))
        self.wait(1.0)

        # 流体类比
        analogy_fluid = VGroup(
            Text("流体类比：", font=CJK).scale(0.46),
            MathTex(r"Q = \frac{\Delta p}{R_f}", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.18)
        analogy_fluid.next_to(analogy_elec, DOWN, buff=0.35)
        self.play(FadeIn(analogy_fluid))
        self.wait(0.9)

        # 展开 R_f
        expand_rf = VGroup(
            Text("流阻展开：", font=CJK).scale(0.46),
            MathTex(r"R_f = \frac{8 \eta L}{\pi R^4}", color=ORANGE).scale(0.85),
        ).arrange(RIGHT, buff=0.18)
        expand_rf.next_to(analogy_fluid, DOWN, buff=0.35)
        self.play(Write(expand_rf))
        self.wait(0.8)

        # 逐一高亮参数含义
        param_grp = VGroup()

        p1 = VGroup(
            MathTex(r"\eta", color=GREEN).scale(0.75),
            Text("：流体粘度（越粘越难流动）", font=CJK, color=GREEN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        p2 = VGroup(
            MathTex(r"L", color=YELLOW).scale(0.75),
            Text("：管长（越长阻力越大）", font=CJK, color=YELLOW).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        p3 = VGroup(
            MathTex(r"R^4", color=RED).scale(0.75),
            Text("：半径四次方（最灵敏因素！）", font=CJK, color=RED).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        p4 = VGroup(
            MathTex(r"\Delta p", color=CYAN).scale(0.75),
            Text("：两端压差（驱动力）", font=CJK, color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.12)

        param_grp = VGroup(p1, p2, p3, p4).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        param_grp.next_to(expand_rf, DOWN, buff=0.40).scale_to_fit_width(12.0)

        for param in param_grp:
            self.play(FadeIn(param))
            self.wait(0.65)
        self.wait(1.2)

        # 完整泊肃叶公式高亮
        full_eq = VGroup(
            Text("完整形式：", font=CJK).scale(0.46),
            MathTex(r"Q = \frac{\pi R^4 \Delta p}{8 \eta L}", color=YELLOW).scale(0.90),
        ).arrange(RIGHT, buff=0.18)
        full_eq.next_to(param_grp, DOWN, buff=0.38)
        self.play(Write(full_eq))
        self.wait(1.5)

        self.play(FadeOut(VGroup(
            analogy_elec, analogy_fluid, expand_rf, param_grp, full_eq, act3_cap,
        )))

        # ═══════════════════════════════════════════════════════════════════
        # Step 7: 数值示例
        # ═══════════════════════════════════════════════════════════════════
        num_cap = Text("数值例题：血管狭窄对血流量的影响", font=CJK, color=BLUE).scale(0.50)
        num_cap.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(num_cap))

        cond_zh = Text("设正常血管半径 R，狭窄后变为 0.8R（截面积减少 36%）",
                       font=CJK).scale(0.44)
        cond_zh.next_to(num_cap, DOWN, buff=0.35)
        self.play(FadeIn(cond_zh))
        self.wait(0.8)

        calc1 = VGroup(
            Text("流量比：", font=CJK).scale(0.44),
            MathTex(r"\frac{Q'}{Q} = \left(\frac{0.8R}{R}\right)^4 = 0.8^4 \approx 0.41",
                    color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.16)
        calc1.next_to(cond_zh, DOWN, buff=0.32)
        self.play(Write(calc1))
        self.wait(0.8)

        result_zh = Text("血流量骤降至正常值的 41%！—— 半径减小 20%，流量减半还不止。",
                         font=CJK, color=RED).scale(0.43)
        result_zh.next_to(calc1, DOWN, buff=0.28).scale_to_fit_width(12.5)
        self.play(FadeIn(result_zh))
        self.wait(1.8)

        self.play(FadeOut(VGroup(num_cap, cond_zh, calc1, result_zh)))

        # ═══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.54).next_to(title, DOWN, buff=0.42)

        s1 = VGroup(
            Text("速度分布：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"v(r)=\frac{\Delta p}{4\eta L}(R^2-r^2)", color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.18)

        s2 = VGroup(
            Text("流量公式：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"Q = \frac{\pi R^4 \Delta p}{8\eta L}", color=YELLOW).scale(0.78),
        ).arrange(RIGHT, buff=0.18)

        s3 = VGroup(
            Text("流阻定义：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"R_f = \frac{8\eta L}{\pi R^4}", color=ORANGE).scale(0.78),
        ).arrange(RIGHT, buff=0.18)

        s4 = Text("Q 与 R 的四次方成正比——半径微小变化导致流量剧烈改变",
                  font=CJK, color=GREEN).scale(0.42)

        s5 = VGroup(
            Text("类比电路：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"Q = \Delta p / R_f \quad \longleftrightarrow \quad I = V / R",
                    color=CYAN).scale(0.70),
        ).arrange(RIGHT, buff=0.18)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.30, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38).scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.wait(0.5)
        self.play(Write(s5), Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch02Kp2PoiseuilleLawVelocityProfile",
        "id": "phys-ch02-2.3-kp2-poiseuille-law-velocity-profile",
        "chapterId": "ch02",
        "sectionId": "2.3",
        "title": "泊肃叶定律与抛物面流速分布",
        "description": "用圆截面颜色映射展示抛物线速度剖面，ValueTracker 演示 Q∝R^4 的灵敏性，并将流量公式拆解为压差/流阻类比电路，配合数值例题揭示血管狭窄的危险性。",
    },
]
