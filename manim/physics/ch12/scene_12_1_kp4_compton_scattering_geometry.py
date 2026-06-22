"""第 12.1 节 · 康普顿散射：几何与波长偏移
（金标准范本：矢量图 + ValueTracker 扫动散射角）

物理核心：入射 X 射线光子与静止电子弹性碰撞，散射光子波长红移
  Delta_lambda = lambda_C * (1 - cos(phi))  ;  lambda_C = h/(m0 c) = 2.43e-12 m

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch12Kp4ComptonScatteringGeometry",
        "id": "phys-ch12-12.1-kp4-compton-scattering-geometry",
        "chapterId": "ch12",
        "sectionId": "12.1",
        "title": "康普顿散射：几何与波长偏移",
        "description": "用矢量图和 ValueTracker 扫动散射角，演示康普顿散射几何与 Δλ=λ_C(1-cosφ) 公式的物理含义。",
    },
]


class Ch12Kp4ComptonScatteringGeometry(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("康普顿散射：几何与波长偏移", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第十二章 量子力学初步 · 12.1", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("想象台球：母球（光子）撞击静止白球（电子），", font=CJK).scale(0.48)
        ana2 = Text("母球被弹偏、损失能量——散射光子波长因此变长。", font=CJK).scale(0.48)
        ana3 = Text("这种「X 射线碰撞后波长红移」就是康普顿效应。", font=CJK, color=CYAN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ── Step 3: 康普顿公式逐步出现 ──────────────────────────────────
        eq_label = Text("康普顿公式", font=CJK, color=YELLOW).scale(0.52).next_to(title, DOWN, buff=0.45)
        eq1 = MathTex(
            r"\Delta\lambda",
            r"=",
            r"\frac{h}{m_0 c}",
            r"(1-\cos\varphi)",
        ).scale(0.90)
        eq1.next_to(eq_label, DOWN, buff=0.38)
        eq1[0].set_color(YELLOW)
        eq1[2].set_color(CYAN)
        eq1[3].set_color(GREEN)

        eq2 = MathTex(
            r"=",
            r"\lambda_C",
            r"(1-\cos\varphi)",
            r"\quad",
            r"\lambda_C=\frac{h}{m_0 c}=2.43\times10^{-12}\,\mathrm{m}",
        ).scale(0.75)
        eq2.next_to(eq1, DOWN, buff=0.32)
        eq2[1].set_color(CYAN)
        eq2[2].set_color(GREEN)
        eq2[4].set_color(CYAN)

        note_compton = Text(
            "λ_C 称为「电子的康普顿波长」，是量子力学的基本常数",
            font=CJK, color=WHITE,
        ).scale(0.41).next_to(eq2, DOWN, buff=0.30)

        self.play(FadeIn(eq_label))
        self.play(Write(eq1))
        self.wait(1.2)
        self.play(FadeIn(eq2))
        self.wait(0.8)
        self.play(FadeIn(note_compton))
        self.wait(1.4)
        self.play(FadeOut(VGroup(eq_label, eq1, eq2, note_compton)))

        # ── Step 4: 散射几何示意图（静态建立） ───────────────────────────
        # 场景坐标：碰撞点在原点偏左，给右侧留面板区
        origin = LEFT * 2.0 + DOWN * 0.4

        geo_label = Text("散射几何示意", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(geo_label))

        # 碰撞点（电子）
        electron = Dot(point=origin, radius=0.18, color=YELLOW)
        e_label = Text("e", font=CJK, color=YELLOW).scale(0.42).next_to(electron, DOWN, buff=0.12)

        # 入射光子箭头（从左水平射入）
        inc_start = origin + LEFT * 2.8
        inc_arrow = Arrow(
            inc_start, origin,
            buff=0.18, color=RED, stroke_width=4,
            max_tip_length_to_length_ratio=0.22,
        )
        lam0_label = VGroup(
            MathTex(r"\lambda_0", color=RED).scale(0.62),
            Text("(入射光子)", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.10)
        lam0_label.next_to(inc_arrow, UP, buff=0.14)

        p0_label = MathTex(r"\vec{p}_0", color=RED).scale(0.55)
        p0_label.next_to(inc_arrow, DOWN, buff=0.14)

        self.play(Create(electron), FadeIn(e_label))
        self.play(Create(inc_arrow), FadeIn(lam0_label), FadeIn(p0_label))
        self.wait(1.2)

        # ── Step 5: ValueTracker 控制散射角 φ，实时更新散射光子箭头 ────────
        phi_tracker = ValueTracker(30.0)  # 单位：度

        # 散射光子箭头（长度随能量变化，能量 E=hc/λ，λ 变大→箭头变短）
        # 最大长度对应 φ=0（Δλ=0，λ 不变），最短对应 φ=180
        SCATTER_MAX_LEN = 2.2
        LAMBDA_C_NORM = 0.40   # 归一化：φ=90 时缩短 0.40 个单位

        def scatter_end(phi_deg):
            phi = math.radians(phi_deg)
            direction = np.array([math.cos(phi), math.sin(phi), 0.0])
            # 波长变长→能量减小→箭头变短
            delta_norm = LAMBDA_C_NORM * (1.0 - math.cos(phi))
            length = max(SCATTER_MAX_LEN - delta_norm, 0.55)
            return origin + direction * length

        scatter_arrow = always_redraw(lambda: Arrow(
            origin,
            scatter_end(phi_tracker.get_value()),
            buff=0.18, color=ORANGE, stroke_width=4,
            max_tip_length_to_length_ratio=0.22,
        ))

        phi_angle_arc = always_redraw(lambda: Arc(
            radius=0.55,
            start_angle=0,
            angle=math.radians(phi_tracker.get_value()),
            arc_center=origin,
            color=GREEN, stroke_width=2,
        ))

        # φ 角标注：静态前缀 + Integer 数值（避免逐帧重编译 MathTex）
        phi_prefix = MathTex(r"\varphi=", color=GREEN).scale(0.55)
        phi_value = Integer(30, unit=r"^\circ", color=GREEN).scale(0.55)
        phi_text = VGroup(phi_prefix, phi_value).arrange(RIGHT, buff=0.05)

        def _phi_text_pos(g):
            phi = phi_tracker.get_value()
            g.move_to(origin + np.array([
                0.95 * math.cos(math.radians(phi / 2.0)),
                0.95 * math.sin(math.radians(phi / 2.0)),
                0.0,
            ]))

        # 散射光子标签：静态文字 + 位置 updater（无 LaTeX 重建）
        scatter_lam_label = MathTex(r"\lambda>\lambda_0", color=ORANGE).scale(0.55)

        def _scatter_lam_pos(m):
            m.next_to(
                origin + scatter_end(phi_tracker.get_value()) * 0.55 +
                np.array([0.25, 0.20, 0.0]),
                RIGHT, buff=0.05,
            )

        _phi_text_pos(phi_text)
        _scatter_lam_pos(scatter_lam_label)

        # 反冲电子箭头（动量守恒）
        # 使用固定的 theta = 30 度（简化示意，侧重于散射光子的动态）
        recoil_end = origin + np.array([math.cos(-math.radians(35)), math.sin(-math.radians(35)), 0.0]) * 1.5
        recoil_arrow = Arrow(
            origin, recoil_end,
            buff=0.18, color=BLUE_C, stroke_width=3,
            max_tip_length_to_length_ratio=0.20,
        )
        theta_label = VGroup(
            MathTex(r"\theta", color=BLUE_C).scale(0.55),
            Text("(反冲电子)", font=CJK, color=BLUE_C).scale(0.36),
        ).arrange(RIGHT, buff=0.08).next_to(recoil_arrow, DOWN + RIGHT * 0.2, buff=0.12)

        self.play(Create(scatter_arrow), Create(phi_angle_arc), FadeIn(phi_text))
        self.play(FadeIn(scatter_lam_label))
        self.play(Create(recoil_arrow), FadeIn(theta_label))
        self.wait(0.8)

        # ── Step 6: 右侧数值面板 ─────────────────────────────────────────
        panel_bg = RoundedRectangle(
            width=3.2, height=2.6, corner_radius=0.20,
            color=BLUE_E, fill_color="#0a0a2e", fill_opacity=0.85,
        ).to_edge(RIGHT, buff=0.25).shift(DOWN * 0.2)

        panel_title = Text("实时数值", font=CJK, color=CYAN).scale(0.46)
        panel_title.move_to(panel_bg.get_top() + DOWN * 0.35)

        # Δλ 行：静态前缀/单位 + DecimalNumber
        delta_prefix = MathTex(r"\Delta\lambda=", color=YELLOW).scale(0.58)
        delta_num = DecimalNumber(0.0, num_decimal_places=2, color=YELLOW).scale(0.58)
        delta_unit = MathTex(r"\mathrm{pm}", color=YELLOW).scale(0.58)
        delta_row = VGroup(delta_prefix, delta_num, delta_unit).arrange(RIGHT, buff=0.10)
        delta_row.next_to(panel_title, DOWN, buff=0.30)

        # φ 行：静态前缀 + Integer
        phi_pre2 = MathTex(r"\varphi=", color=GREEN).scale(0.58)
        phi_num2 = Integer(30, unit=r"^\circ", color=GREEN).scale(0.58)
        phi_row = VGroup(phi_pre2, phi_num2).arrange(RIGHT, buff=0.05)
        phi_row.next_to(panel_bg.get_center(), DOWN, buff=0.25)

        self.play(FadeIn(panel_bg), FadeIn(panel_title))
        self.play(FadeIn(delta_row), FadeIn(phi_row))
        self.wait(0.4)

        # add_updater 放在 FadeIn 之后（Python 3.14 zip 严格）
        phi_text.add_updater(_phi_text_pos)
        phi_value.add_updater(lambda m: m.set_value(round(phi_tracker.get_value())))
        scatter_lam_label.add_updater(_scatter_lam_pos)
        delta_num.add_updater(
            lambda m: m.set_value(2.43 * (1.0 - math.cos(math.radians(phi_tracker.get_value()))))
        )
        phi_num2.add_updater(lambda m: m.set_value(round(phi_tracker.get_value())))

        # ── Step 7: 扫动 φ 从 0° → 180° ────────────────────────────────
        sweep_tip = Text("扫动散射角 φ，观察波长偏移变化", font=CJK, color=WHITE).scale(0.44)
        sweep_tip.to_edge(DOWN, buff=0.55)
        self.play(FadeIn(sweep_tip))

        self.play(phi_tracker.animate.set_value(0.5), run_time=0.6)
        self.wait(0.2)
        self.play(phi_tracker.animate.set_value(90.0), run_time=1.8)
        self.wait(0.5)

        # φ=90° 高亮：Δλ = λ_C
        highlight_90 = Text("φ=90°: Δλ = λ_C = 2.43 pm", font=CJK, color=CYAN).scale(0.46)
        highlight_90.next_to(sweep_tip, UP, buff=0.15)
        box_90 = SurroundingRectangle(highlight_90, color=CYAN, buff=0.12, corner_radius=0.08)
        self.play(FadeIn(highlight_90), Create(box_90))
        self.wait(1.0)
        self.play(FadeOut(highlight_90), FadeOut(box_90))

        self.play(phi_tracker.animate.set_value(180.0), run_time=1.8)
        self.wait(0.5)

        # φ=180° 高亮：最大偏移
        highlight_180 = Text("φ=180°: Δλ_max = 2λ_C = 4.86 pm (最大偏移)", font=CJK, color=RED).scale(0.44)
        highlight_180.next_to(sweep_tip, UP, buff=0.15)
        box_180 = SurroundingRectangle(highlight_180, color=RED, buff=0.12, corner_radius=0.08)
        self.play(FadeIn(highlight_180), Create(box_180))
        self.wait(1.2)
        self.play(FadeOut(highlight_180), FadeOut(box_180))

        # 回到 60° 作为稳定示例
        self.play(phi_tracker.animate.set_value(60.0), run_time=1.2)
        self.wait(0.5)

        # FadeOut 前 clear_updaters()
        for m in (phi_text, phi_value, scatter_lam_label, delta_num, phi_num2):
            m.clear_updaters()

        # 清场第一幕
        geo_group = VGroup(
            electron, e_label, inc_arrow, lam0_label, p0_label,
            recoil_arrow, theta_label,
            panel_bg, panel_title, sweep_tip,
            delta_row, phi_row,
        )
        self.play(FadeOut(geo_group), FadeOut(scatter_arrow),
                  FadeOut(phi_angle_arc), FadeOut(scatter_lam_label),
                  FadeOut(phi_text), FadeOut(geo_label))
        self.wait(0.4)

        # ── Step 8: 第二幕——动量矢量三角形 ─────────────────────────────
        mom_label = Text("动量守恒：矢量三角形", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.35)
        mom_note = Text("碰撞过程满足能量和动量守恒，三个动量构成封闭三角形。",
                        font=CJK).scale(0.44).next_to(mom_label, DOWN, buff=0.28)
        self.play(FadeIn(mom_label), FadeIn(mom_note))
        self.wait(1.0)
        self.play(FadeOut(mom_note))

        phi2 = ValueTracker(60.0)
        tri_origin = np.array([-2.5, -0.5, 0.0])

        # p0：水平向右（固定长度）
        P0_LEN = 3.2

        def get_p_scatter_vec(phi_deg):
            """散射光子动量方向，长度随 Δλ 变化（能量降低）"""
            phi = math.radians(phi_deg)
            delta_norm = 0.40 * (1.0 - math.cos(phi))
            length = max(P0_LEN - delta_norm, 1.0)
            return np.array([length * math.cos(phi), length * math.sin(phi), 0.0])

        def get_p_electron_vec(phi_deg):
            """电子反冲动量 = p0_vec - p_scatter_vec（矢量差）"""
            p_scatter = get_p_scatter_vec(phi_deg)
            p0_vec = np.array([P0_LEN, 0.0, 0.0])
            return p0_vec - p_scatter

        # 三角形三条边（always_redraw）
        arrow_p0 = always_redraw(lambda: Arrow(
            tri_origin,
            tri_origin + np.array([P0_LEN, 0.0, 0.0]),
            buff=0, color=RED, stroke_width=5,
            max_tip_length_to_length_ratio=0.18,
        ))

        arrow_p_scatter = always_redraw(lambda: Arrow(
            tri_origin,
            tri_origin + get_p_scatter_vec(phi2.get_value()),
            buff=0, color=ORANGE, stroke_width=4,
            max_tip_length_to_length_ratio=0.18,
        ))

        arrow_p_electron = always_redraw(lambda: Arrow(
            tri_origin + get_p_scatter_vec(phi2.get_value()),
            tri_origin + np.array([P0_LEN, 0.0, 0.0]),
            buff=0, color=BLUE_C, stroke_width=4,
            max_tip_length_to_length_ratio=0.18,
        ))

        # 标签（静态 MathTex，只创建一次；用位置 updater 跟随，避免逐帧重编译）
        p0_mom = MathTex(r"\vec{p}_0", color=RED).scale(0.60).next_to(
            tri_origin + np.array([P0_LEN / 2, 0.0, 0.0]), DOWN, buff=0.18
        )
        p_sc_mid = MathTex(r"\vec{p}_{\gamma}", color=ORANGE).scale(0.60)
        p_el_mid = MathTex(r"\vec{p}_{e}", color=BLUE_C).scale(0.60)

        def _p_sc_pos(m):
            mid = tri_origin + get_p_scatter_vec(phi2.get_value()) / 2.0
            m.next_to(mid, LEFT + UP * 0.3, buff=0.12)

        def _p_el_pos(m):
            mid = (tri_origin + get_p_scatter_vec(phi2.get_value())
                   + get_p_electron_vec(phi2.get_value()) / 2.0)
            m.next_to(mid, RIGHT, buff=0.12)

        _p_sc_pos(p_sc_mid)
        _p_el_pos(p_el_mid)

        phi2_arc = always_redraw(lambda: Arc(
            radius=0.50,
            start_angle=0,
            angle=math.radians(phi2.get_value()),
            arc_center=tri_origin,
            color=GREEN, stroke_width=2,
        ))

        # φ 角标注：静态前缀 + Integer 数值
        phi2_pre = MathTex(r"\varphi=", color=GREEN).scale(0.52)
        phi2_val = Integer(60, unit=r"^\circ", color=GREEN).scale(0.52)
        phi2_text = VGroup(phi2_pre, phi2_val).arrange(RIGHT, buff=0.05)

        def _phi2_text_pos(g):
            phi = phi2.get_value()
            g.move_to(tri_origin + np.array([
                0.85 * math.cos(math.radians(phi / 2.0)),
                0.85 * math.sin(math.radians(phi / 2.0)),
                0.0,
            ]))

        _phi2_text_pos(phi2_text)

        conserv_eq = MathTex(r"\vec{p}_0 = \vec{p}_{\gamma} + \vec{p}_{e}", color=YELLOW).scale(0.78)
        conserv_eq.to_edge(RIGHT, buff=0.6).shift(UP * 0.5)

        self.play(Create(arrow_p0), FadeIn(p0_mom))
        self.play(Create(arrow_p_scatter), FadeIn(p_sc_mid))
        self.play(Create(arrow_p_electron), FadeIn(p_el_mid))
        self.play(Create(phi2_arc), FadeIn(phi2_text))
        self.play(Write(conserv_eq))
        self.wait(0.8)

        # add_updater 放在 FadeIn 之后（Python 3.14 zip 严格）
        p_sc_mid.add_updater(_p_sc_pos)
        p_el_mid.add_updater(_p_el_pos)
        phi2_text.add_updater(_phi2_text_pos)
        phi2_val.add_updater(lambda m: m.set_value(round(phi2.get_value())))

        # 扫动 φ 演示三角形变化
        self.play(phi2.animate.set_value(15.0), run_time=1.2)
        self.wait(0.4)
        self.play(phi2.animate.set_value(90.0), run_time=1.6)
        self.wait(0.5)
        self.play(phi2.animate.set_value(150.0), run_time=1.6)
        self.wait(0.5)
        self.play(phi2.animate.set_value(60.0), run_time=1.0)
        self.wait(0.5)

        # FadeOut 前 clear_updaters()
        for m in (p_sc_mid, p_el_mid, phi2_text, phi2_val):
            m.clear_updaters()

        # 清场第二幕
        self.play(FadeOut(VGroup(
            arrow_p0, arrow_p_scatter, arrow_p_electron,
            p0_mom, p_sc_mid, p_el_mid,
            phi2_arc, phi2_text, conserv_eq, mom_label,
        )))
        self.wait(0.3)

        # ── Step 9: 数值例子 ─────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.4)
        ex_cond = Text("X 射线 λ₀ = 71 pm，散射角 φ = 90°，求散射波长 λ。",
                       font=CJK).scale(0.44).next_to(ex_title, DOWN, buff=0.30)

        ex_step1 = MathTex(
            r"\Delta\lambda = \lambda_C(1-\cos 90^\circ) = 2.43\times1 = 2.43\,\mathrm{pm}",
            color=YELLOW,
        ).scale(0.70).next_to(ex_cond, DOWN, buff=0.30)

        ex_step2 = MathTex(
            r"\lambda = \lambda_0 + \Delta\lambda = 71 + 2.43 = 73.43\,\mathrm{pm}",
            color=GREEN,
        ).scale(0.70).next_to(ex_step1, DOWN, buff=0.28)

        ex_hint = Text("波长增大 ≈ 3.4%，光子能量减小。", font=CJK, color=WHITE).scale(0.42)
        ex_hint.next_to(ex_step2, DOWN, buff=0.28)

        self.play(FadeIn(ex_title), FadeIn(ex_cond))
        self.wait(0.8)
        self.play(Write(ex_step1))
        self.wait(1.0)
        self.play(Write(ex_step2))
        self.wait(0.8)
        self.play(FadeIn(ex_hint))
        self.wait(1.4)
        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_step1, ex_step2, ex_hint)))

        # ── Step 10: 特殊角度总结表 ─────────────────────────────────────
        tbl_title = Text("不同散射角的波长偏移", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(tbl_title))

        rows_data = [
            (r"\varphi=0^\circ",    r"\Delta\lambda=0",                    "无偏移"),
            (r"\varphi=90^\circ",   r"\Delta\lambda=\lambda_C=2.43\,\mathrm{pm}", "康普顿波长"),
            (r"\varphi=180^\circ",  r"\Delta\lambda=2\lambda_C=4.86\,\mathrm{pm}", "最大偏移"),
        ]
        row_colors = [WHITE, CYAN, RED]

        row_groups = VGroup()
        for i, (phi_expr, delta_expr, zh_note) in enumerate(rows_data):
            phi_tex = MathTex(phi_expr, color=row_colors[i]).scale(0.65)
            delta_tex = MathTex(delta_expr, color=row_colors[i]).scale(0.65)
            zh_txt = Text(zh_note, font=CJK, color=row_colors[i]).scale(0.42)
            row = VGroup(phi_tex, delta_tex, zh_txt).arrange(RIGHT, buff=0.55)
            row_groups.add(row)

        row_groups.arrange(DOWN, buff=0.42).next_to(tbl_title, DOWN, buff=0.40)
        row_groups.scale_to_fit_width(11.5)

        for row in row_groups:
            self.play(FadeIn(row))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(VGroup(tbl_title, row_groups)))

        # ── Step 11: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        s1 = MathTex(
            r"\Delta\lambda = \frac{h}{m_0 c}(1-\cos\varphi) = \lambda_C(1-\cos\varphi)",
            color=YELLOW,
        ).scale(0.72)
        s2 = MathTex(
            r"\lambda_C = \frac{h}{m_0 c} = 2.43\times10^{-12}\,\mathrm{m}",
            color=CYAN,
        ).scale(0.72)

        s_zh1 = Text("· 光子动量 p=h/λ，碰撞遵守能量与动量守恒。", font=CJK, color=WHITE).scale(0.42)
        s_zh2 = Text("· φ 越大，波长偏移越大；φ=180° 时偏移最大。", font=CJK, color=WHITE).scale(0.42)
        s_zh3 = Text("· 偏移量只与物理常数和散射角有关，与入射波长无关。", font=CJK, color=GREEN).scale(0.42)

        summary = VGroup(s1, s2, s_zh1, s_zh2, s_zh3).arrange(DOWN, buff=0.32).next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.0)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s_zh1))
        self.play(FadeIn(s_zh2))
        self.play(FadeIn(s_zh3))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
