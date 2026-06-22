"""第 13.2 节 · α、β、γ 三种衰变类型（知识点讲解）。

可视化方案：核素图（Z-N 平面）+ 粒子飞出动画 + 衰变方程逐步出现 + 射线穿透力对比。
场景顺序：标题 → 类比引入 → α衰变（核素图+方程） → β⁻衰变 → β⁺/EC → γ衰变 → 穿透力对比 → 小结卡。

铁律：MathTex 内只能有纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 颜色语义 ────────────────────────────────────────────────────────────────
ALPHA_COLOR   = "#FF6600"   # α粒子 橙红
BETA_COLOR    = "#00CCFF"   # β粒子 天蓝
GAMMA_COLOR   = "#FF44FF"   # γ射线 紫
NUCLEUS_COLOR = "#FFD700"   # 母核 金黄
DAUGHTER_COLOR = "#66FF66"  # 子核 绿


# ── 辅助：在核素图上画一个核素方块 ──────────────────────────────────────────
def nuclide_box(z, n, color=WHITE, size=0.40, origin=ORIGIN):
    """返回以 (n, z) 为格点坐标的方块 VGroup（中心对齐到 origin + offset）。"""
    x = n * size + origin[0]
    y = z * size + origin[1]
    box = Square(side_length=size * 0.85, color=color, fill_opacity=0.35,
                 fill_color=color, stroke_width=1.6)
    box.move_to([x, y, 0])
    return box


class Ch13Kp2ThreeDecayTypes(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("α、β、γ 三种衰变类型", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第13章 原子核和放射性 · 13.2", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.0)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("不稳定的原子核就像「超重的石头」——", font=CJK).scale(0.50)
        ana2 = Text("为了回到更稳定的状态，它会自动抛出粒子或释放能量，", font=CJK).scale(0.50)
        ana3 = Text("这个过程叫做放射性衰变，共有三种类型：α、β、γ 衰变。", font=CJK, color=YELLOW).scale(0.50)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.4)
        self.play(FadeIn(ana2))
        self.wait(0.4)
        self.play(FadeIn(ana3))
        self.wait(1.2)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 核素图（Z-N 平面）——建立坐标系，高亮初始核素
        # ══════════════════════════════════════════════════════════════════════
        chart_label = Text("核素图（Z-N 平面）", font=CJK, color=BLUE).scale(0.44).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(chart_label))

        # 坐标轴：X = N（中子数），Y = Z（质子数）
        # 我们在屏幕左侧画一个 7×7 局部核素图，格点大小 0.42
        SIZE = 0.42
        ORIG = np.array([-5.2, -1.2, 0.0])  # 格点 (0,0) 对应的屏幕坐标

        # 画轴标
        ax_n = Text("N（中子数）", font=CJK, color=GRAY).scale(0.34)
        ax_z = Text("Z（质子数）", font=CJK, color=GRAY).scale(0.34)
        ax_n.move_to(ORIG + np.array([3 * SIZE, -0.55, 0]))
        ax_z.move_to(ORIG + np.array([-0.65, 3 * SIZE, 0]))
        ax_z.rotate(PI / 2)

        # 画 6×6 背景格点（浅灰，模拟核素图）
        bg_boxes = VGroup()
        for zz in range(6):
            for nn in range(6):
                b = nuclide_box(zz, nn, color=GRAY, size=SIZE, origin=ORIG)
                b.set_fill(opacity=0.06).set_stroke(color=GRAY, width=0.7)
                bg_boxes.add(b)

        # 母核位置：Z=4, N=5（示例：铍-9附近，可观看清楚）
        Z0, N0 = 4, 5
        parent_box = nuclide_box(Z0, N0, color=NUCLEUS_COLOR, size=SIZE, origin=ORIG)
        parent_label = VGroup(
            MathTex(r"{}^{A}_{Z}X", color=NUCLEUS_COLOR).scale(0.55)
        )
        parent_label.move_to(parent_box.get_center())

        self.play(Create(bg_boxes), FadeIn(ax_n), FadeIn(ax_z),
                  Create(parent_box), Write(parent_label))
        self.wait(0.6)

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: α 衰变
        # ══════════════════════════════════════════════════════════════════════
        alpha_title = Text("α 衰变：放出氦-4核（α粒子）", font=CJK, color=ALPHA_COLOR).scale(0.46)
        alpha_title.to_edge(RIGHT).shift(UP * 2.2)
        self.play(FadeIn(alpha_title))

        # α粒子从母核飞出（向右上方飞离屏幕）
        alpha_dot = Dot(color=ALPHA_COLOR, radius=0.13).move_to(parent_box.get_center())
        alpha_text = MathTex(r"{}^4_2\mathrm{He}", color=ALPHA_COLOR).scale(0.55)
        alpha_text.next_to(alpha_dot, UP + RIGHT, buff=0.05)
        self.play(FadeIn(alpha_dot), FadeIn(alpha_text))

        # 子核位置：Z-2, N-2 → Z=2, N=3
        Zd_a, Nd_a = Z0 - 2, N0 - 2
        daughter_a_box = nuclide_box(Zd_a, Nd_a, color=DAUGHTER_COLOR, size=SIZE, origin=ORIG)
        daughter_a_label = MathTex(r"{}^{A-4}_{Z-2}Y", color=DAUGHTER_COLOR).scale(0.48)
        daughter_a_label.move_to(daughter_a_box.get_center())

        # 动画：α粒子飞向右侧，同时子核方块出现在新位置
        alpha_fly_target = parent_box.get_center() + np.array([2.4, 1.6, 0])
        self.play(
            alpha_dot.animate.move_to(alpha_fly_target),
            alpha_text.animate.move_to(alpha_fly_target + np.array([0.3, 0.25, 0])),
            Create(daughter_a_box),
            Write(daughter_a_label),
            run_time=1.3
        )
        self.wait(0.3)

        # 衰变方程（右侧显示）
        eq_alpha = MathTex(
            r"{}^A_Z X",
            r"\to",
            r"{}^{A-4}_{Z-2} Y",
            r"+",
            r"{}^4_2\mathrm{He}",
            r"+ Q"
        ).scale(0.60)
        eq_alpha[0].set_color(NUCLEUS_COLOR)
        eq_alpha[2].set_color(DAUGHTER_COLOR)
        eq_alpha[4].set_color(ALPHA_COLOR)
        eq_alpha.to_edge(RIGHT).next_to(alpha_title, DOWN, buff=0.35)
        eq_alpha.shift(LEFT * 0.3)

        note_a = Text("子核在核素图中向左下移动（Z-2, A-4）", font=CJK, color=ALPHA_COLOR).scale(0.38)
        note_a.next_to(eq_alpha, DOWN, buff=0.25)
        self.play(Write(eq_alpha), FadeIn(note_a))
        self.wait(1.3)

        # 清除 α 相关（保留核素图背景）
        self.play(FadeOut(VGroup(alpha_dot, alpha_text, daughter_a_box, daughter_a_label,
                                 eq_alpha, note_a, alpha_title)))
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: β⁻ 衰变
        # ══════════════════════════════════════════════════════════════════════
        betam_title = Text("β⁻ 衰变：中子 → 质子，放出电子和反中微子", font=CJK, color=BETA_COLOR).scale(0.42)
        betam_title.to_edge(RIGHT).shift(UP * 2.2).shift(LEFT * 0.2)
        self.play(FadeIn(betam_title))

        # 核内微观：用小圆表示中子变质子
        micro_center = np.array([1.8, -0.2, 0])
        neutron = Dot(color=GRAY, radius=0.15).move_to(micro_center + LEFT * 0.3)
        proton  = Dot(color=RED,  radius=0.15).move_to(micro_center + RIGHT * 0.3)
        n_label = Text("n", font=CJK, color=GRAY).scale(0.38).next_to(neutron, UP, buff=0.1)
        p_label = Text("p", font=CJK, color=RED).scale(0.38).next_to(proton, UP, buff=0.1)
        arrow_np = Arrow(neutron.get_center(), proton.get_center(), buff=0.16,
                         color=YELLOW, stroke_width=2.5, max_tip_length_to_length_ratio=0.35)

        self.play(FadeIn(neutron), FadeIn(n_label))
        self.wait(0.3)
        self.play(GrowArrow(arrow_np), FadeIn(proton), FadeIn(p_label))
        self.wait(0.3)

        # β⁻粒子和反中微子飞出
        electron = Dot(color=BETA_COLOR, radius=0.10).move_to(micro_center)
        antinu   = Dot(color=ORANGE,     radius=0.07).move_to(micro_center)
        e_label  = MathTex(r"e^-", color=BETA_COLOR).scale(0.50).next_to(electron, DOWN + RIGHT, buff=0.05)
        nu_label = MathTex(r"\bar{\nu}_e", color=ORANGE).scale(0.50).next_to(antinu, UP + RIGHT, buff=0.05)

        self.play(FadeIn(electron), FadeIn(antinu), FadeIn(e_label), FadeIn(nu_label))
        self.play(
            electron.animate.move_to(micro_center + np.array([1.8, -1.0, 0])),
            e_label.animate.shift(np.array([1.8, -1.0, 0])),
            antinu.animate.move_to(micro_center + np.array([1.5, 1.2, 0])),
            nu_label.animate.shift(np.array([1.5, 1.2, 0])),
            run_time=1.2
        )

        # 子核：Z+1, N-1（A不变）
        Zd_bm, Nd_bm = Z0 + 1, N0 - 1
        daughter_bm_box = nuclide_box(Zd_bm, Nd_bm, color=DAUGHTER_COLOR, size=SIZE, origin=ORIG)
        daughter_bm_label = MathTex(r"{}^A_{Z+1}Y", color=DAUGHTER_COLOR).scale(0.48)
        daughter_bm_label.move_to(daughter_bm_box.get_center())
        self.play(Create(daughter_bm_box), Write(daughter_bm_label))

        # 衰变方程
        eq_betam = MathTex(
            r"{}^A_Z X",
            r"\to",
            r"{}^A_{Z+1} Y",
            r"+ e^-",
            r"+ \bar{\nu}_e + Q"
        ).scale(0.58)
        eq_betam[0].set_color(NUCLEUS_COLOR)
        eq_betam[2].set_color(DAUGHTER_COLOR)
        eq_betam[3].set_color(BETA_COLOR)
        eq_betam.to_edge(RIGHT).next_to(betam_title, DOWN, buff=0.35).shift(LEFT * 0.2)
        note_bm = Text("子核在核素图中向左上方移动（Z+1, N-1, A不变）", font=CJK, color=BETA_COLOR).scale(0.38)
        note_bm.next_to(eq_betam, DOWN, buff=0.22)
        self.play(Write(eq_betam), FadeIn(note_bm))
        self.wait(1.3)

        self.play(FadeOut(VGroup(neutron, proton, n_label, p_label, arrow_np,
                                  electron, antinu, e_label, nu_label,
                                  daughter_bm_box, daughter_bm_label,
                                  eq_betam, note_bm, betam_title)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: β⁺ 衰变与电子俘获（对比展示）
        # ══════════════════════════════════════════════════════════════════════
        betap_title = Text("β⁺ 衰变与电子俘获（EC）：质子 → 中子", font=CJK, color=YELLOW).scale(0.42)
        betap_title.to_edge(RIGHT).shift(UP * 2.2).shift(LEFT * 0.2)
        self.play(FadeIn(betap_title))

        # β⁺ 衰变方程
        eq_betap = MathTex(
            r"{}^A_Z X",
            r"\to",
            r"{}^A_{Z-1} Y",
            r"+ e^+",
            r"+ \nu_e + Q"
        ).scale(0.58)
        eq_betap[0].set_color(NUCLEUS_COLOR)
        eq_betap[2].set_color(DAUGHTER_COLOR)
        eq_betap[3].set_color(YELLOW)
        eq_betap.to_edge(RIGHT).next_to(betap_title, DOWN, buff=0.35).shift(LEFT * 0.2)

        betap_label = Text("β⁺ 衰变", font=CJK, color=YELLOW).scale(0.42)
        betap_label.next_to(eq_betap, LEFT, buff=0.25)

        # 电子俘获方程
        eq_ec = MathTex(
            r"{}^A_Z X + e^-",
            r"\to",
            r"{}^A_{Z-1} Y",
            r"+ \nu_e"
        ).scale(0.58)
        eq_ec[0].set_color(NUCLEUS_COLOR)
        eq_ec[2].set_color(DAUGHTER_COLOR)
        eq_ec.next_to(eq_betap, DOWN, buff=0.38)

        ec_label = Text("电子俘获", font=CJK, color=CYAN).scale(0.42)
        ec_label.next_to(eq_ec, LEFT, buff=0.25)

        self.play(Write(eq_betap), FadeIn(betap_label))
        self.wait(0.5)
        self.play(Write(eq_ec), FadeIn(ec_label))
        self.wait(0.4)

        # 子核位置（Z-1, N+1，在核素图向右下方移动）
        Zd_bp, Nd_bp = Z0 - 1, N0 + 1
        daughter_bp_box = nuclide_box(Zd_bp, Nd_bp, color=DAUGHTER_COLOR, size=SIZE, origin=ORIG)
        daughter_bp_label = MathTex(r"{}^A_{Z-1}Y", color=DAUGHTER_COLOR).scale(0.48)
        daughter_bp_label.move_to(daughter_bp_box.get_center())
        note_bp = Text("子核在核素图中向右下方移动（Z-1, N+1, A不变）", font=CJK, color=YELLOW).scale(0.38)
        note_bp.next_to(eq_ec, DOWN, buff=0.28)
        self.play(Create(daughter_bp_box), Write(daughter_bp_label), FadeIn(note_bp))
        self.wait(1.3)

        self.play(FadeOut(VGroup(eq_betap, betap_label, eq_ec, ec_label,
                                  daughter_bp_box, daughter_bp_label,
                                  note_bp, betap_title)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: γ 衰变（激发态 → 基态 + 能级图）
        # ══════════════════════════════════════════════════════════════════════
        gamma_title = Text("γ 衰变：激发态核素放出 γ 光子，Z 和 A 均不变", font=CJK, color=GAMMA_COLOR).scale(0.40)
        gamma_title.to_edge(RIGHT).shift(UP * 2.2).shift(LEFT * 0.2)
        self.play(FadeIn(gamma_title))

        # 核素图上：激发态用虚线框，基态用实线框（同一位置）
        excited_box = nuclide_box(Z0, N0, color=GAMMA_COLOR, size=SIZE, origin=ORIG)
        excited_box.set_stroke(width=2.5)
        excited_dashed = DashedVMobject(excited_box.copy().scale(1.15), num_dashes=18)
        excited_dashed.set_color(GAMMA_COLOR)
        star_label = MathTex(r"{}^A_Z X^*", color=GAMMA_COLOR).scale(0.48)
        star_label.next_to(excited_dashed, UP, buff=0.08)
        self.play(Create(excited_dashed), FadeIn(star_label))
        self.wait(0.3)

        # 能级图（右侧）
        level_center = np.array([2.0, -0.5, 0])
        e_high = Line(level_center + LEFT * 0.6 + UP * 0.8,
                      level_center + RIGHT * 0.6 + UP * 0.8, color=GAMMA_COLOR, stroke_width=2.5)
        e_low  = Line(level_center + LEFT * 0.6 + DOWN * 0.6,
                      level_center + RIGHT * 0.6 + DOWN * 0.6, color=GREEN, stroke_width=2.5)
        excited_lbl = MathTex(r"E^*", color=GAMMA_COLOR).scale(0.50).next_to(e_high, RIGHT, buff=0.15)
        ground_lbl  = MathTex(r"E_0", color=GREEN).scale(0.50).next_to(e_low, RIGHT, buff=0.15)

        # 跃迁箭头 + γ标注
        trans_arrow = Arrow(e_high.get_center() + DOWN * 0.05,
                            e_low.get_center() + UP * 0.05,
                            buff=0, color=GAMMA_COLOR, stroke_width=2.5,
                            max_tip_length_to_length_ratio=0.30)
        gamma_photon_label = MathTex(r"\gamma", color=GAMMA_COLOR).scale(0.7)
        gamma_photon_label.next_to(trans_arrow, LEFT, buff=0.15)

        energy_grp = VGroup(e_high, e_low, excited_lbl, ground_lbl, trans_arrow, gamma_photon_label)
        self.play(Create(e_high), FadeIn(excited_lbl), Create(e_low), FadeIn(ground_lbl))
        self.play(GrowArrow(trans_arrow), FadeIn(gamma_photon_label))

        # γ光子从核素位置射出
        gamma_ray = Arrow(
            parent_box.get_center(),
            parent_box.get_center() + np.array([1.4, 1.0, 0]),
            buff=0, color=GAMMA_COLOR, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.30
        )
        gamma_ray_lbl = MathTex(r"\gamma", color=GAMMA_COLOR).scale(0.60)
        gamma_ray_lbl.next_to(gamma_ray.get_end(), UP + RIGHT, buff=0.08)
        self.play(GrowArrow(gamma_ray), FadeIn(gamma_ray_lbl))
        self.wait(0.3)

        # 衰变方程
        eq_gamma = MathTex(
            r"{}^A_Z X^*",
            r"\to",
            r"{}^A_Z X",
            r"+ \gamma"
        ).scale(0.60)
        eq_gamma[0].set_color(GAMMA_COLOR)
        eq_gamma[2].set_color(DAUGHTER_COLOR)
        eq_gamma[3].set_color(GAMMA_COLOR)
        eq_gamma.to_edge(RIGHT).next_to(gamma_title, DOWN, buff=0.35).shift(LEFT * 0.2)
        note_g = Text("Z 和 A 均不变，只是核从激发态跃迁到基态", font=CJK, color=GAMMA_COLOR).scale(0.38)
        note_g.next_to(eq_gamma, DOWN, buff=0.22)
        self.play(Write(eq_gamma), FadeIn(note_g))
        self.wait(1.3)

        self.play(FadeOut(VGroup(excited_dashed, star_label, energy_grp,
                                  gamma_ray, gamma_ray_lbl, eq_gamma, note_g, gamma_title)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 三种射线穿透力与电荷偏转对比
        # ══════════════════════════════════════════════════════════════════════
        # 清除核素图背景
        self.play(FadeOut(VGroup(bg_boxes, ax_n, ax_z, parent_box, parent_label, chart_label)))
        self.wait(0.3)

        pen_title = Text("三种射线的穿透力与偏转", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(pen_title))

        # 源点
        source = Dot(color=WHITE, radius=0.12).move_to(LEFT * 5.2 + DOWN * 0.0)
        source_label = Text("放射源", font=CJK, color=GRAY).scale(0.36).next_to(source, DOWN, buff=0.10)
        self.play(FadeIn(source), FadeIn(source_label))

        # α射线（偏转大，穿透弱）——短箭头，向上弯曲
        alpha_ray = CurvedArrow(source.get_center(),
                                source.get_center() + np.array([2.0, 0.4, 0]),
                                color=ALPHA_COLOR, angle=-PI/6, stroke_width=3)
        alpha_pen = Text("α：穿透力最弱（纸张可阻挡），带 +2e 电荷，偏转大", font=CJK, color=ALPHA_COLOR).scale(0.38)
        alpha_pen.to_edge(RIGHT).shift(UP * 2.0 + LEFT * 0.2)

        # β射线（偏转中等，穿透中）
        beta_ray = CurvedArrow(source.get_center(),
                               source.get_center() + np.array([3.8, -0.3, 0]),
                               color=BETA_COLOR, angle=PI/8, stroke_width=3)
        beta_pen = Text("β：穿透力中等（铝板可阻挡），带 -e 电荷，偏转反向", font=CJK, color=BETA_COLOR).scale(0.38)
        beta_pen.to_edge(RIGHT).next_to(alpha_pen, DOWN, buff=0.30)

        # γ射线（不偏转，穿透最强）——直线
        gamma_ray2 = Arrow(source.get_center(),
                           source.get_center() + np.array([5.5, 0.0, 0]),
                           buff=0, color=GAMMA_COLOR, stroke_width=3,
                           max_tip_length_to_length_ratio=0.20)
        gamma_pen = Text("γ：穿透力最强（铅板才能阻挡），无电荷，不偏转", font=CJK, color=GAMMA_COLOR).scale(0.38)
        gamma_pen.to_edge(RIGHT).next_to(beta_pen, DOWN, buff=0.30)

        # 偏转力标注
        field_label = VGroup(
            MathTex(r"\uparrow", color=WHITE).scale(0.7),
            Text("磁场 B 向纸面外", font=CJK, color=GRAY).scale(0.35)
        ).arrange(RIGHT, buff=0.12).move_to(LEFT * 2.0 + DOWN * 1.6)

        # 注意：CurvedArrow 是 VMobject，GrowArrow 在 manim 0.20.1 下会因 scale_tips 报错，改用 Create
        self.play(Create(alpha_ray), FadeIn(alpha_pen))
        self.wait(0.3)
        self.play(Create(beta_ray), FadeIn(beta_pen))
        self.wait(0.3)
        self.play(GrowArrow(gamma_ray2), FadeIn(gamma_pen), FadeIn(field_label))
        self.wait(1.2)

        # 穿透力比较标尺
        comparison_grp = VGroup(
            Text("穿透力：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\alpha", color=ALPHA_COLOR).scale(0.80),
            Text("<", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\beta", color=BETA_COLOR).scale(0.80),
            Text("<", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\gamma", color=GAMMA_COLOR).scale(0.80),
        ).arrange(RIGHT, buff=0.20).move_to(DOWN * 2.6)
        self.play(FadeIn(comparison_grp))
        self.wait(1.3)

        self.play(FadeOut(VGroup(source, source_label,
                                  alpha_ray, beta_ray, gamma_ray2,
                                  alpha_pen, beta_pen, gamma_pen,
                                  field_label, comparison_grp, pen_title)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 小结卡（关键公式汇总 + 方框）
        # ══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结：三种衰变方程", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s_alpha = VGroup(
            Text("α 衰变", font=CJK, color=ALPHA_COLOR).scale(0.44),
            MathTex(r"{}^A_Z X \to {}^{A-4}_{Z-2} Y + {}^4_2\mathrm{He} + Q",
                    color=YELLOW).scale(0.62)
        ).arrange(RIGHT, buff=0.3)

        s_betam = VGroup(
            Text("β⁻ 衰变", font=CJK, color=BETA_COLOR).scale(0.44),
            MathTex(r"{}^A_Z X \to {}^A_{Z+1} Y + e^- + \bar{\nu}_e + Q",
                    color=YELLOW).scale(0.62)
        ).arrange(RIGHT, buff=0.3)

        s_betap = VGroup(
            Text("β⁺ 衰变", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"{}^A_Z X \to {}^A_{Z-1} Y + e^+ + \nu_e + Q",
                    color=YELLOW).scale(0.62)
        ).arrange(RIGHT, buff=0.3)

        s_gamma = VGroup(
            Text("γ 衰变", font=CJK, color=GAMMA_COLOR).scale(0.44),
            MathTex(r"{}^A_Z X^* \to {}^A_Z X + \gamma",
                    color=YELLOW).scale(0.62)
        ).arrange(RIGHT, buff=0.3)

        s_pen = VGroup(
            Text("穿透力", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"\alpha < \beta < \gamma", color=CYAN).scale(0.75)
        ).arrange(RIGHT, buff=0.3)

        summary = VGroup(s_alpha, s_betam, s_betap, s_gamma, s_pen).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(12.2)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.28, corner_radius=0.14)

        self.play(Write(s_alpha), run_time=1.0)
        self.play(Write(s_betam), run_time=1.0)
        self.play(Write(s_betap), run_time=1.0)
        self.play(Write(s_gamma), run_time=1.0)
        self.play(FadeIn(s_pen), Create(box))
        self.wait(2.0)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch13Kp2ThreeDecayTypes",
        "id": "phys-ch13-13.2-kp2-three-decay-types",
        "chapterId": "ch13",
        "sectionId": "13.2",
        "title": "α、β、γ 三种衰变类型",
        "description": "通过核素图（Z-N平面）动画展示α、β⁻、β⁺/EC、γ四种衰变的子核位置移动规律、衰变方程与三种射线穿透力对比。",
    },
]
