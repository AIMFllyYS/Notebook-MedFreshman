"""第 11.3 节 · 马吕斯定律与多片偏振片串联（知识点 kp3）

可视化流程：
  Step 1  标题
  Step 2  生活类比（太阳镜偏振片——转动镜片，反光会消失）
  Step 3  线偏振光定义 + 振动方向示意
  Step 4  马吕斯定律推导：I = I₀cos²θ（ValueTracker 扫θ 0→90°，极坐标玫瑰图同步）
  Step 5  θ=0° 全透，θ=90° 消光 两个极端动画
  Step 6  P1⊥P2 设置：θ=90° 无透光
  Step 7  插入 P3（与 P1 夹角 θ），三级公式推导
  Step 8  ValueTracker 扫 θ：θ=45° 有透光，θ=0/90° 消光
  Step 9  sin²(2θ)/8 化简 + θ=45° I_max 标注
  Step 10 小结卡（关键公式汇总+方框）

铁律：MathTex 内只用 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch11Kp3MalusLawAngleSweep(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("马吕斯定律与多片偏振片串联", font=CJK, color=BLUE).scale(0.72)
        title.to_edge(UP)
        subtitle = Text("第十一章 波动光学  ·  11.3", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("戴上偏光太阳镜，路面反光消失了——", font=CJK).scale(0.48)
        ana2 = Text("转动镜片，反光时隐时现。", font=CJK).scale(0.48)
        ana3 = Text("这正是偏振片对线偏振光的选择性透过：马吕斯定律。",
                    font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════
        # Step 3  线偏振光示意 + 偏振化方向定义
        # ══════════════════════════════════════════════════════════════════
        def_lbl = Text("线偏振光与偏振化方向", font=CJK, color=CYAN).scale(0.5)
        def_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(def_lbl))

        # 偏振片：蓝色虚线矩形框
        pol_rect = Rectangle(width=0.25, height=2.8, color=BLUE,
                             fill_color=BLUE, fill_opacity=0.12)
        pol_rect.move_to(ORIGIN + RIGHT * 0.5)
        pol_axis = DashedLine(pol_rect.get_top(), pol_rect.get_bottom(),
                              color=BLUE, stroke_width=2.5)
        pol_axis.move_to(pol_rect.get_center())
        pol_lbl = Text("偏振片", font=CJK, color=BLUE).scale(0.38).next_to(pol_rect, DOWN, buff=0.15)

        # 偏振化方向标注
        pol_dir_arr = Arrow(pol_rect.get_center() + DOWN * 0.9,
                            pol_rect.get_center() + UP * 0.9,
                            color=BLUE, buff=0, stroke_width=3)
        pol_dir_lbl = Text("偏振化方向", font=CJK, color=BLUE).scale(0.36)
        pol_dir_lbl.next_to(pol_rect, RIGHT, buff=0.2).shift(UP * 0.1)

        # 入射线偏振光（红色振动箭头）
        light_beam = Arrow(LEFT * 4.5 + ORIGIN, LEFT * 1.2 + ORIGIN,
                           color=WHITE, buff=0, stroke_width=3)
        light_lbl = Text("线偏振光", font=CJK, color=WHITE).scale(0.38)
        light_lbl.next_to(light_beam, UP, buff=0.12)

        # 振动方向（红色双箭头，垂直于传播方向）
        vib_arr = DoubleArrow(LEFT * 3.0 + UP * 0.6, LEFT * 3.0 + DOWN * 0.6,
                              color=RED, buff=0, stroke_width=3, tip_length=0.2)
        vib_lbl = Text("振动方向", font=CJK, color=RED).scale(0.36)
        vib_lbl.next_to(vib_arr, LEFT, buff=0.12)

        # I₀ 标注
        i0_label = VGroup(
            Text("强度", font=CJK, color=WHITE).scale(0.38),
            MathTex(r"I_0", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.08).next_to(light_beam, DOWN, buff=0.18)

        # 透射光（绿色）
        trans_arr = Arrow(RIGHT * 0.8 + ORIGIN, RIGHT * 3.5 + ORIGIN,
                          color=GREEN, buff=0, stroke_width=3)
        trans_lbl = Text("透射光", font=CJK, color=GREEN).scale(0.38)
        trans_lbl.next_to(trans_arr, UP, buff=0.12)

        grp_def = VGroup(pol_rect, pol_axis, pol_lbl, pol_dir_arr, pol_dir_lbl,
                         light_beam, light_lbl, vib_arr, vib_lbl, i0_label,
                         trans_arr, trans_lbl)
        grp_def.shift(DOWN * 0.6)

        self.play(Create(light_beam), FadeIn(light_lbl))
        self.play(GrowArrow(vib_arr), FadeIn(vib_lbl))
        self.play(FadeIn(i0_label))
        self.wait(0.4)
        self.play(FadeIn(pol_rect), Create(pol_axis), FadeIn(pol_lbl))
        self.play(GrowArrow(pol_dir_arr), FadeIn(pol_dir_lbl))
        self.wait(0.4)
        self.play(GrowArrow(trans_arr), FadeIn(trans_lbl))
        self.wait(1.5)
        self.play(FadeOut(grp_def), FadeOut(def_lbl))

        # ══════════════════════════════════════════════════════════════════
        # Step 4  马吕斯定律：ValueTracker 扫θ + 极坐标玫瑰图
        # ══════════════════════════════════════════════════════════════════
        malus_lbl = Text("马吕斯定律：ValueTracker 扫角度", font=CJK, color=CYAN).scale(0.48)
        malus_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(malus_lbl))

        # 公式
        malus_eq = MathTex(r"I = I_0 \cos^2\theta", color=YELLOW).scale(1.0)
        malus_eq.next_to(malus_lbl, DOWN, buff=0.35)
        self.play(Write(malus_eq))
        self.wait(0.6)

        # 左侧：偏振片示意（简化版）
        # 偏振片中心
        pc = LEFT * 3.2 + DOWN * 0.4

        # 偏振化方向（固定蓝色）
        pol_fixed = DashedLine(pc + DOWN * 1.1, pc + UP * 1.1,
                               color=BLUE, stroke_width=3)
        pol_fixed_box = Rectangle(width=0.2, height=2.2, color=BLUE,
                                  fill_color=BLUE, fill_opacity=0.1)
        pol_fixed_box.move_to(pc)
        pol_zh = Text("偏振化方向", font=CJK, color=BLUE).scale(0.32)
        pol_zh.next_to(pol_fixed_box, LEFT, buff=0.12)

        # ValueTracker for theta
        theta_tracker = ValueTracker(0.0)

        # 振动方向（红色箭头，随theta旋转）
        vib_len = 1.0

        def make_vib_arrow():
            th = theta_tracker.get_value()
            dx = vib_len * math.sin(th)
            dy = vib_len * math.cos(th)
            return DoubleArrow(
                pc + np.array([-dx, -dy, 0]),
                pc + np.array([dx, dy, 0]),
                color=RED, buff=0, stroke_width=3, tip_length=0.18,
            )

        vib_dynamic = always_redraw(make_vib_arrow)

        # 角度标注
        def make_theta_label():
            th = theta_tracker.get_value()
            deg = math.degrees(th)
            label = VGroup(
                MathTex(r"\theta=", color=WHITE).scale(0.55),
                Text(f"{deg:.0f}", font=CJK, color=ORANGE).scale(0.45),
                MathTex(r"^\circ", color=WHITE).scale(0.55),
            ).arrange(RIGHT, buff=0.04)
            label.move_to(pc + DOWN * 1.6)
            return label

        theta_label = always_redraw(make_theta_label)

        # 入射光（简箭头，固定）
        inc_fixed = Arrow(LEFT * 5.8 + DOWN * 0.4, LEFT * 4.0 + DOWN * 0.4,
                          color=WHITE, buff=0, stroke_width=2.5)

        # 右侧：极坐标玫瑰图 I=I₀cos²θ
        # 使用 Axes 绘制 x=cos³θ, y=sin·cos²θ 参数曲线（但用直角坐标极坐标模拟）
        # 直接画极坐标曲线：用 ParametricFunction
        polar_center = RIGHT * 2.8 + DOWN * 0.6
        polar_scale = 1.8  # 最大半径对应 I₀

        polar_axes_x = Arrow(polar_center + LEFT * 2.1, polar_center + RIGHT * 2.1,
                             color=BLUE_E, buff=0, stroke_width=1.8, tip_length=0.15)
        polar_axes_y = Arrow(polar_center + DOWN * 2.1, polar_center + UP * 2.1,
                             color=BLUE_E, buff=0, stroke_width=1.8, tip_length=0.15)
        polar_x_lbl = MathTex(r"I/I_0", color=BLUE_E).scale(0.42).next_to(
            polar_center + RIGHT * 2.1, RIGHT, buff=0.08)

        # 完整玫瑰图（固定淡色）
        full_rose = ParametricFunction(
            lambda t: polar_center + np.array([
                polar_scale * math.cos(t) ** 2 * math.cos(t),
                polar_scale * math.cos(t) ** 2 * math.sin(t),
                0,
            ]),
            t_range=[0, 2 * math.pi],
            color=YELLOW,
            stroke_opacity=0.25,
            stroke_width=2,
        )

        # 动态：当前角度对应的点（高亮点）
        def make_polar_dot():
            th = theta_tracker.get_value()
            r = math.cos(th) ** 2  # I/I₀ = cos²θ（normalized）
            x = r * math.cos(th)
            y = r * math.sin(th)
            return Dot(polar_center + np.array([polar_scale * x, polar_scale * y, 0]),
                       color=RED, radius=0.10)

        polar_dot = always_redraw(make_polar_dot)

        # 动态：从极坐标中心到当前点的线段
        def make_polar_line():
            th = theta_tracker.get_value()
            r = math.cos(th) ** 2
            x = r * math.cos(th)
            y = r * math.sin(th)
            end = polar_center + np.array([polar_scale * x, polar_scale * y, 0])
            return Line(polar_center, end, color=RED, stroke_width=2.5)

        polar_line = always_redraw(make_polar_line)

        # 动态：I 值标注
        def make_I_label():
            th = theta_tracker.get_value()
            val = math.cos(th) ** 2
            label = VGroup(
                MathTex(r"I/I_0 =", color=WHITE).scale(0.5),
                Text(f"{val:.2f}", font=CJK, color=ORANGE).scale(0.45),
            ).arrange(RIGHT, buff=0.06)
            label.move_to(polar_center + DOWN * 1.9)
            return label

        I_label = always_redraw(make_I_label)

        polar_title = Text("极坐标强度图", font=CJK, color=YELLOW).scale(0.38)
        polar_title.next_to(polar_center + UP * 2.1, UP, buff=0.05)

        # 组建偏振片侧
        self.play(
            FadeIn(pol_fixed_box), Create(pol_fixed), FadeIn(pol_zh),
            GrowArrow(inc_fixed),
        )
        self.play(Create(vib_dynamic))
        self.add(theta_label)

        # 组建极坐标侧
        self.play(
            Create(polar_axes_x), Create(polar_axes_y),
            FadeIn(polar_x_lbl), FadeIn(polar_title),
        )
        self.play(Create(full_rose))
        self.add(polar_line, polar_dot, I_label)
        self.wait(0.5)

        # 扫 θ：0 → 90°
        self.play(theta_tracker.animate.set_value(math.pi / 2),
                  run_time=4.5, rate_func=linear)
        self.wait(0.6)
        # 回到 0
        self.play(theta_tracker.animate.set_value(0.0),
                  run_time=2.5, rate_func=smooth)
        self.wait(0.8)

        grp4_extra = VGroup(polar_axes_x, polar_axes_y, polar_x_lbl,
                            polar_title, full_rose)
        # 清场（先移除 always_redraw 对象）
        self.remove(vib_dynamic, theta_label, polar_line, polar_dot, I_label)
        self.play(FadeOut(VGroup(
            pol_fixed_box, pol_fixed, pol_zh, inc_fixed,
            malus_eq, malus_lbl, grp4_extra,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 5  θ=0 全透，θ=90° 消光 极端演示
        # ══════════════════════════════════════════════════════════════════
        extreme_lbl = Text("两个极端情形", font=CJK, color=CYAN).scale(0.5)
        extreme_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(extreme_lbl))

        # 左侧：θ=0，全透
        left_ctr = LEFT * 3.0 + DOWN * 0.3
        r_pol_0 = Rectangle(width=0.2, height=2.4, color=BLUE,
                            fill_color=BLUE, fill_opacity=0.1).move_to(left_ctr)
        r_pol_dash_0 = DashedLine(left_ctr + DOWN * 1.1, left_ctr + UP * 1.1,
                                   color=BLUE, stroke_width=2.5)
        r_vib_0 = DoubleArrow(left_ctr + DOWN * 0.9, left_ctr + UP * 0.9,
                               color=RED, buff=0, stroke_width=3, tip_length=0.18)
        inc_0 = Arrow(left_ctr + LEFT * 2.2, left_ctr + LEFT * 0.4,
                      color=WHITE, buff=0, stroke_width=2.5)
        out_0 = Arrow(left_ctr + RIGHT * 0.4, left_ctr + RIGHT * 2.2,
                      color=GREEN, stroke_width=3, buff=0)
        lbl_0 = VGroup(
            MathTex(r"\theta=0^\circ", color=YELLOW).scale(0.72),
        ).next_to(left_ctr, DOWN, buff=1.2)
        lbl_full = VGroup(
            Text("全透：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"I=I_0", color=GREEN).scale(0.72),
        ).arrange(RIGHT, buff=0.1).next_to(lbl_0, DOWN, buff=0.2)

        # 右侧：θ=90°，消光
        right_ctr = RIGHT * 3.0 + DOWN * 0.3
        r_pol_90 = Rectangle(width=0.2, height=2.4, color=BLUE,
                             fill_color=BLUE, fill_opacity=0.1).move_to(right_ctr)
        r_pol_dash_90 = DashedLine(right_ctr + DOWN * 1.1, right_ctr + UP * 1.1,
                                    color=BLUE, stroke_width=2.5)
        r_vib_90 = DoubleArrow(right_ctr + LEFT * 0.9, right_ctr + RIGHT * 0.9,
                                color=RED, buff=0, stroke_width=3, tip_length=0.18)
        inc_90 = Arrow(right_ctr + LEFT * 2.2, right_ctr + LEFT * 0.4,
                       color=WHITE, buff=0, stroke_width=2.5)
        # 消光：输出极细/无箭头 → 用叉号表示
        cross_h = Line(right_ctr + RIGHT * 0.6 + UP * 0.25,
                       right_ctr + RIGHT * 1.4 + DOWN * 0.25,
                       color=RED, stroke_width=4)
        cross_v = Line(right_ctr + RIGHT * 0.6 + DOWN * 0.25,
                       right_ctr + RIGHT * 1.4 + UP * 0.25,
                       color=RED, stroke_width=4)

        lbl_90 = MathTex(r"\theta=90^\circ", color=YELLOW).scale(0.72)
        lbl_90.next_to(right_ctr, DOWN, buff=1.2)
        lbl_ext = VGroup(
            Text("消光：", font=CJK, color=RED).scale(0.42),
            MathTex(r"I=0", color=RED).scale(0.72),
        ).arrange(RIGHT, buff=0.1).next_to(lbl_90, DOWN, buff=0.2)

        self.play(
            FadeIn(r_pol_0), Create(r_pol_dash_0), GrowArrow(r_vib_0),
            GrowArrow(inc_0), GrowArrow(out_0),
        )
        self.play(FadeIn(lbl_0), FadeIn(lbl_full))
        self.wait(0.5)
        self.play(
            FadeIn(r_pol_90), Create(r_pol_dash_90), GrowArrow(r_vib_90),
            GrowArrow(inc_90),
        )
        self.play(Create(cross_h), Create(cross_v))
        self.play(FadeIn(lbl_90), FadeIn(lbl_ext))
        self.wait(1.8)

        grp5 = VGroup(r_pol_0, r_pol_dash_0, r_vib_0, inc_0, out_0, lbl_0, lbl_full,
                      r_pol_90, r_pol_dash_90, r_vib_90, inc_90, cross_h, cross_v,
                      lbl_90, lbl_ext, extreme_lbl)
        self.play(FadeOut(grp5))

        # ══════════════════════════════════════════════════════════════════
        # Step 6  P1⊥P2：90° 无透光
        # ══════════════════════════════════════════════════════════════════
        perp_lbl = Text("P1 与 P2 正交（夹角 90°）→ 无透光", font=CJK, color=CYAN).scale(0.48)
        perp_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(perp_lbl))

        # 光路：入射 → P1 → P2
        p1_ctr = LEFT * 2.2 + DOWN * 0.3
        p2_ctr = RIGHT * 1.8 + DOWN * 0.3

        # P1（偏振化方向：竖直）
        p1_box = Rectangle(width=0.2, height=2.4, color=BLUE,
                           fill_color=BLUE, fill_opacity=0.1).move_to(p1_ctr)
        p1_dash = DashedLine(p1_ctr + DOWN * 1.1, p1_ctr + UP * 1.1,
                             color=BLUE, stroke_width=2.5)
        p1_vib = DoubleArrow(p1_ctr + DOWN * 0.9, p1_ctr + UP * 0.9,
                             color=RED, buff=0, stroke_width=3, tip_length=0.18)
        p1_label = Text("P1", font=CJK, color=BLUE).scale(0.42).next_to(p1_ctr, UP, buff=1.3)

        # P2（偏振化方向：水平，⊥P1）
        p2_box = Rectangle(width=0.2, height=2.4, color=ORANGE,
                           fill_color=ORANGE, fill_opacity=0.1).move_to(p2_ctr)
        p2_dash = DashedLine(p2_ctr + LEFT * 1.1, p2_ctr + RIGHT * 1.1,
                             color=ORANGE, stroke_width=2.5)
        p2_vib = DoubleArrow(p2_ctr + LEFT * 0.9, p2_ctr + RIGHT * 0.9,
                             color=ORANGE, buff=0, stroke_width=3, tip_length=0.18)
        p2_label = Text("P2", font=CJK, color=ORANGE).scale(0.42).next_to(p2_ctr, UP, buff=1.3)

        # 光路箭头
        inc_p1 = Arrow(LEFT * 5.2 + DOWN * 0.3, p1_ctr + LEFT * 0.4,
                       color=WHITE, buff=0, stroke_width=2.5)
        mid_p1_p2 = Arrow(p1_ctr + RIGHT * 0.4, p2_ctr + LEFT * 0.4,
                           color=YELLOW, buff=0, stroke_width=2.5)
        mid_label = VGroup(
            Text("经P1后：", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"I_0/2", color=YELLOW).scale(0.6),
        ).arrange(RIGHT, buff=0.06).next_to(mid_p1_p2, UP, buff=0.18)

        # 消光叉
        cx1 = Line(p2_ctr + RIGHT * 0.5 + UP * 0.3,
                   p2_ctr + RIGHT * 1.3 + DOWN * 0.3, color=RED, stroke_width=4)
        cx2 = Line(p2_ctr + RIGHT * 0.5 + DOWN * 0.3,
                   p2_ctr + RIGHT * 1.3 + UP * 0.3, color=RED, stroke_width=4)

        # 标注：夹角90°
        angle_90 = MathTex(r"90^\circ", color=WHITE).scale(0.65)
        angle_90.move_to((p1_ctr + p2_ctr) / 2 + DOWN * 1.6)

        # 结论
        concl_0 = VGroup(
            Text("出射光强：", font=CJK, color=RED).scale(0.44),
            MathTex(r"I = 0", color=RED).scale(0.80),
        ).arrange(RIGHT, buff=0.1)
        concl_0.next_to(angle_90, DOWN, buff=0.3)

        self.play(
            FadeIn(p1_box), Create(p1_dash), GrowArrow(p1_vib), FadeIn(p1_label),
            GrowArrow(inc_p1),
        )
        self.wait(0.4)
        self.play(
            FadeIn(p2_box), Create(p2_dash), GrowArrow(p2_vib), FadeIn(p2_label),
        )
        self.play(GrowArrow(mid_p1_p2), FadeIn(mid_label))
        self.play(Create(cx1), Create(cx2))
        self.play(FadeIn(angle_90), FadeIn(concl_0))
        self.wait(1.8)

        grp6 = VGroup(p1_box, p1_dash, p1_vib, p1_label,
                      p2_box, p2_dash, p2_vib, p2_label,
                      inc_p1, mid_p1_p2, mid_label,
                      cx1, cx2, angle_90, concl_0, perp_lbl)
        self.play(FadeOut(grp6))

        # ══════════════════════════════════════════════════════════════════
        # Step 7  插入 P3：三级公式推导（逐步）
        # ══════════════════════════════════════════════════════════════════
        p3_lbl = Text("在 P1、P2 之间插入 P3（与 P1 夹角 θ）", font=CJK, color=CYAN).scale(0.46)
        p3_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(p3_lbl))

        # 推导步骤
        derive1 = VGroup(
            Text("经 P1 后（自然光→线偏振）：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"I_1 = \frac{I_0}{2}", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.12)

        derive2 = VGroup(
            Text("经 P3（与 P1 夹角 θ）：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"I_2 = I_1 \cos^2\theta = \frac{I_0}{2}\cos^2\theta", color=YELLOW).scale(0.75),
        ).arrange(RIGHT, buff=0.12)

        derive3 = VGroup(
            Text("经 P2（与 P3 夹角 90°-θ）：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"I_3 = I_2 \cos^2(90^\circ-\theta) = \frac{I_0}{2}\cos^2\theta\sin^2\theta", color=YELLOW).scale(0.68),
        ).arrange(RIGHT, buff=0.12)

        derive4 = VGroup(
            Text("倍角化简：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"I_3 = \frac{I_0}{8}\sin^2(2\theta)", color=GREEN).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        derive_grp = VGroup(derive1, derive2, derive3, derive4).arrange(
            DOWN, buff=0.38, aligned_edge=LEFT
        )
        derive_grp.next_to(p3_lbl, DOWN, buff=0.42)
        derive_grp.scale_to_fit_width(13.0)

        self.play(FadeIn(derive1))
        self.wait(1.0)
        self.play(FadeIn(derive2))
        self.wait(1.0)
        self.play(FadeIn(derive3))
        self.wait(1.0)
        derive3[1].set_color(YELLOW)
        self.play(FadeIn(derive4))
        derive4[1].set_color(GREEN)
        self.wait(1.8)
        self.play(FadeOut(VGroup(derive_grp, p3_lbl)))

        # ══════════════════════════════════════════════════════════════════
        # Step 8  ValueTracker 扫 θ：展示 P1P3P2 透光情况
        # ══════════════════════════════════════════════════════════════════
        sweep_lbl = Text("扫描角度 θ：观察 P1-P3-P2 出射光强", font=CJK, color=CYAN).scale(0.46)
        sweep_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(sweep_lbl))

        # 公式置顶
        formula_top = MathTex(
            r"I = \frac{I_0}{8}\sin^2(2\theta)", color=YELLOW
        ).scale(0.85)
        formula_top.next_to(sweep_lbl, DOWN, buff=0.28)
        self.play(Write(formula_top))
        self.wait(0.4)

        # 光路示意（简化三片）
        # 位置
        pa_ctr = LEFT * 4.2 + DOWN * 1.0
        pb_ctr = ORIGIN + DOWN * 1.0
        pc_ctr = RIGHT * 4.2 + DOWN * 1.0

        # P1（固定竖直）
        pa_box = Rectangle(width=0.18, height=2.0, color=BLUE,
                           fill_color=BLUE, fill_opacity=0.1).move_to(pa_ctr)
        pa_dash = DashedLine(pa_ctr + DOWN * 0.9, pa_ctr + UP * 0.9,
                             color=BLUE, stroke_width=2.2)
        pa_txt = Text("P1", font=CJK, color=BLUE).scale(0.38).next_to(pa_ctr, UP, buff=1.1)

        # P2（固定水平）
        pc_box = Rectangle(width=0.18, height=2.0, color=ORANGE,
                           fill_color=ORANGE, fill_opacity=0.1).move_to(pc_ctr)
        pc_dash = DashedLine(pc_ctr + LEFT * 0.9, pc_ctr + RIGHT * 0.9,
                             color=ORANGE, stroke_width=2.2)
        pc_txt = Text("P2", font=CJK, color=ORANGE).scale(0.38).next_to(pc_ctr, UP, buff=1.1)

        # P3（动态旋转）
        theta2 = ValueTracker(math.pi / 4)   # 从 45° 开始

        def make_p3():
            th = theta2.get_value()
            ctr = pb_ctr
            dx = 0.9 * math.sin(th)
            dy = 0.9 * math.cos(th)
            line = DashedLine(
                ctr + np.array([-dx, -dy, 0]),
                ctr + np.array([dx, dy, 0]),
                color=GREEN, stroke_width=2.5,
            )
            box = Rectangle(width=0.18, height=2.0, color=GREEN,
                            fill_color=GREEN, fill_opacity=0.1).move_to(ctr)
            return VGroup(box, line)

        p3_dynamic = always_redraw(make_p3)
        pb_txt = Text("P3（可转）", font=CJK, color=GREEN).scale(0.38).next_to(pb_ctr, UP, buff=1.1)

        # 角度标签
        def make_theta2_label():
            th = theta2.get_value()
            deg = math.degrees(th)
            label = VGroup(
                MathTex(r"\theta=", color=WHITE).scale(0.55),
                Text(f"{deg:.0f}", font=CJK, color=ORANGE).scale(0.48),
                MathTex(r"^\circ", color=WHITE).scale(0.55),
            ).arrange(RIGHT, buff=0.04)
            label.move_to(pb_ctr + DOWN * 1.5)
            return label

        theta2_label = always_redraw(make_theta2_label)

        # 入射光箭头
        inc2 = Arrow(LEFT * 6.2 + DOWN * 1.0, pa_ctr + LEFT * 0.35,
                     color=WHITE, buff=0, stroke_width=2.5)
        inc2_lbl = VGroup(
            Text("自然光", font=CJK, color=WHITE).scale(0.36),
            MathTex(r"I_0", color=WHITE).scale(0.55),
        ).arrange(DOWN, buff=0.05).next_to(inc2, UP, buff=0.1)

        # P1→P3 光线
        mid1 = Arrow(pa_ctr + RIGHT * 0.35, pb_ctr + LEFT * 0.35,
                     color=YELLOW, buff=0, stroke_width=2.2)

        # P3→P2 光线（亮度随 theta 变化，用颜色透明度模拟）
        def make_mid2():
            th = theta2.get_value()
            intensity = math.cos(th) ** 2  # I2/I1
            opacity = max(0.1, intensity)
            arr = Arrow(pb_ctr + RIGHT * 0.35, pc_ctr + LEFT * 0.35,
                        color=YELLOW, buff=0, stroke_width=2.2)
            arr.set_opacity(opacity)
            return arr

        mid2 = always_redraw(make_mid2)

        # P2 出射光（亮度随 sin²2θ）
        def make_out2():
            th = theta2.get_value()
            intensity = 0.125 * math.sin(2 * th) ** 2  # I3/I0
            opacity = max(0.05, intensity * 8)  # 放大显示
            arr = Arrow(pc_ctr + RIGHT * 0.35, pc_ctr + RIGHT * 1.8,
                        color=GREEN, buff=0, stroke_width=3)
            arr.set_opacity(opacity)
            return arr

        out2 = always_redraw(make_out2)

        # 出射强度数值
        def make_out_label():
            th = theta2.get_value()
            val = 0.125 * math.sin(2 * th) ** 2
            label = VGroup(
                MathTex(r"I/I_0 =", color=GREEN).scale(0.5),
                Text(f"{val:.3f}", font=CJK, color=GREEN).scale(0.44),
            ).arrange(RIGHT, buff=0.06)
            label.move_to(pc_ctr + RIGHT * 2.5 + DOWN * 0.4)
            return label

        out_label = always_redraw(make_out_label)

        # 绘制场景
        self.play(
            FadeIn(pa_box), Create(pa_dash), FadeIn(pa_txt),
            FadeIn(pc_box), Create(pc_dash), FadeIn(pc_txt),
            GrowArrow(inc2), FadeIn(inc2_lbl),
        )
        self.play(Create(p3_dynamic), FadeIn(pb_txt))
        self.play(GrowArrow(mid1))
        self.add(mid2, out2, theta2_label, out_label)
        self.wait(0.6)

        # 先展示 θ=45°（有透光）
        cap_45 = Text("θ=45° 时有最大透光", font=CJK, color=GREEN).scale(0.42)
        cap_45.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(cap_45))
        self.wait(1.2)

        # 扫到 θ=0°（消光）
        self.play(theta2.animate.set_value(0.001), run_time=2.5, rate_func=smooth)
        cap_0 = Text("θ→0°：P3 方向平行 P1，P3 不转光，P2 消光", font=CJK, color=RED).scale(0.38)
        cap_0.to_edge(DOWN, buff=0.4)
        self.play(FadeOut(cap_45), FadeIn(cap_0))
        self.wait(1.2)

        # 扫到 θ=90°（消光）
        self.play(theta2.animate.set_value(math.pi / 2 - 0.001), run_time=3.0, rate_func=smooth)
        cap_90 = Text("θ→90°：P3 方向平行 P2，经 P2 后消光", font=CJK, color=RED).scale(0.38)
        cap_90.to_edge(DOWN, buff=0.4)
        self.play(FadeOut(cap_0), FadeIn(cap_90))
        self.wait(1.2)

        # 扫回 θ=45°
        self.play(theta2.animate.set_value(math.pi / 4), run_time=2.5, rate_func=smooth)
        cap_back = Text("θ=45° 时 sin²(2θ)=1，出射光最强", font=CJK, color=GREEN).scale(0.40)
        cap_back.to_edge(DOWN, buff=0.4)
        self.play(FadeOut(cap_90), FadeIn(cap_back))
        self.wait(1.5)

        # 清场
        self.remove(p3_dynamic, mid2, out2, theta2_label, out_label)
        self.play(FadeOut(VGroup(
            pa_box, pa_dash, pa_txt,
            pc_box, pc_dash, pc_txt,
            inc2, inc2_lbl, mid1,
            pb_txt, cap_back,
            formula_top, sweep_lbl,
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 9  化简动画 + I_max 标注（函数曲线）
        # ══════════════════════════════════════════════════════════════════
        simp_lbl = Text("sin²(2θ) 图像与极大值", font=CJK, color=CYAN).scale(0.50)
        simp_lbl.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(simp_lbl))

        # 化简公式逐步出现
        simp1 = MathTex(
            r"I = \frac{I_0}{2}\cos^2\theta\sin^2\theta",
            color=YELLOW
        ).scale(0.80)
        simp2 = MathTex(
            r"= \frac{I_0}{8}(2\cos\theta\sin\theta)^2",
            color=YELLOW
        ).scale(0.80)
        simp3 = MathTex(
            r"= \frac{I_0}{8}\sin^2(2\theta)",
            color=GREEN
        ).scale(0.90)
        simp3_zh = Text("（倍角公式 sin 2θ = 2 sinθ cosθ）",
                        font=CJK, color=ORANGE).scale(0.38)

        simp_steps = VGroup(simp1, simp2, simp3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        simp_steps.next_to(simp_lbl, DOWN, buff=0.38)
        simp_steps.to_edge(LEFT, buff=1.0)
        simp3_zh.next_to(simp3, RIGHT, buff=0.2)

        self.play(Write(simp1))
        self.wait(0.8)
        self.play(Write(simp2))
        self.wait(0.8)
        self.play(Write(simp3), FadeIn(simp3_zh))
        self.wait(0.8)

        # 函数曲线 I/I₀ = sin²(2θ)/8，在 [0, π/2]
        ax_simp = Axes(
            x_range=[0, math.pi / 2, math.pi / 4],
            y_range=[0, 0.14, 0.05],
            x_length=5.5,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"include_numbers": False},
            y_axis_config={"include_numbers": False},
        )
        ax_simp.to_edge(RIGHT, buff=0.8).shift(DOWN * 0.5)

        # 轴标签
        x_lbl_simp = VGroup(
            MathTex(r"\theta", color=WHITE).scale(0.55),
        ).next_to(ax_simp.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl_simp = VGroup(
            MathTex(r"I/I_0", color=WHITE).scale(0.5),
        ).next_to(ax_simp.y_axis.get_end(), LEFT, buff=0.08)

        # 刻度标注 0, 45°, 90°
        lbl_0d = MathTex(r"0", color=WHITE).scale(0.45)
        lbl_45d = MathTex(r"45^\circ", color=YELLOW).scale(0.45)
        lbl_90d = MathTex(r"90^\circ", color=WHITE).scale(0.45)
        lbl_0d.next_to(ax_simp.c2p(0, 0), DOWN, buff=0.12)
        lbl_45d.next_to(ax_simp.c2p(math.pi / 4, 0), DOWN, buff=0.12)
        lbl_90d.next_to(ax_simp.c2p(math.pi / 2, 0), DOWN, buff=0.12)

        lbl_1over8 = MathTex(r"1/8", color=GREEN).scale(0.45)
        lbl_1over8.next_to(ax_simp.c2p(0, 0.125), LEFT, buff=0.08)

        curve_simp = ax_simp.plot(
            lambda x: 0.125 * math.sin(2 * x) ** 2,
            x_range=[0, math.pi / 2],
            color=GREEN,
            stroke_width=3,
        )

        # 极大值点
        max_dot = Dot(ax_simp.c2p(math.pi / 4, 0.125), color=RED, radius=0.10)
        max_v_line = DashedLine(
            ax_simp.c2p(math.pi / 4, 0),
            ax_simp.c2p(math.pi / 4, 0.125),
            color=RED, stroke_width=2,
        )
        max_h_line = DashedLine(
            ax_simp.c2p(0, 0.125),
            ax_simp.c2p(math.pi / 4, 0.125),
            color=RED, stroke_width=2,
        )
        max_label = VGroup(
            MathTex(r"I_{\max}=", color=RED).scale(0.55),
            MathTex(r"\frac{I_0}{8}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.05)
        max_label.next_to(ax_simp.c2p(math.pi / 4, 0.125), UR, buff=0.12)

        self.play(Create(ax_simp), FadeIn(x_lbl_simp), FadeIn(y_lbl_simp))
        self.play(FadeIn(lbl_0d), FadeIn(lbl_45d), FadeIn(lbl_90d), FadeIn(lbl_1over8))
        self.play(Create(curve_simp), run_time=2.0)
        self.wait(0.4)
        self.play(Create(max_v_line), Create(max_h_line))
        self.play(Create(max_dot), FadeIn(max_label))
        self.wait(1.8)

        grp9 = VGroup(simp_steps, simp3_zh,
                      ax_simp, x_lbl_simp, y_lbl_simp,
                      lbl_0d, lbl_45d, lbl_90d, lbl_1over8,
                      curve_simp, max_v_line, max_h_line, max_dot, max_label,
                      simp_lbl)
        self.play(FadeOut(grp9))

        # ══════════════════════════════════════════════════════════════════
        # Step 10  小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        f1 = VGroup(
            Text("马吕斯定律：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"I = I_0\cos^2\theta", color=YELLOW).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        f2 = VGroup(
            Text("三片偏振片（P1⊥P2，P3 居中夹角 θ）：", font=CJK, color=WHITE).scale(0.40),
        )
        f2b = VGroup(
            MathTex(
                r"I = \frac{I_0}{2}\cos^2\theta\sin^2\theta = \frac{I_0}{8}\sin^2(2\theta)",
                color=YELLOW,
            ).scale(0.78),
        )

        f3 = VGroup(
            Text("最大值（θ=45°）：", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"I_{\max} = \frac{I_0}{8}", color=GREEN).scale(0.85),
        ).arrange(RIGHT, buff=0.12)

        f4 = VGroup(
            Text("消光条件：θ=0° 或 θ=90°，出射光强为零",
                 font=CJK, color=RED).scale(0.40),
        )

        summary = VGroup(f1, f2, f2b, f3, f4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(13.0)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.15)

        self.play(Write(f1))
        self.wait(0.5)
        self.play(FadeIn(f2))
        self.play(Write(f2b))
        self.wait(0.6)
        self.play(Write(f3))
        self.wait(0.5)
        self.play(FadeIn(f4))
        self.play(Create(box_sum))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box_sum, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch11Kp3MalusLawAngleSweep",
        "id": "phys-ch11-11.3-kp3-malus-law-angle-sweep",
        "chapterId": "ch11",
        "sectionId": "11.3",
        "title": "马吕斯定律与多片偏振片串联",
        "description": "ValueTracker 扫角度展示 I=I₀cos²θ 极坐标玫瑰图，并推导 P1⊥P2 插入 P3 后的三级偏振公式 I=I₀sin²(2θ)/8，标注 θ=45° 极大值。",
    }
]
