"""第 13.1 节 · 核自旋量子化与核磁共振（知识点 kp4）

展示核自旋角动量量子化、磁量子数 m_I 的离散取向、核磁共振条件及核磁子。
参考金标准：ch07/scene_7_1_kp1_electric_field.py（矢量/场线范式）

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch13Kp4NuclearSpinNmr",
        "id": "phys-ch13-13.1-kp4-nuclear-spin-nmr",
        "chapterId": "ch13",
        "sectionId": "13.1",
        "title": "核自旋量子化与核磁共振",
        "description": "用 2D 能级图和 ValueTracker 展示核自旋量子化：m_I 取值、能级分裂、共振条件与核磁子。",
    }
]


class Ch13Kp4NuclearSpinNmr(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("核自旋量子化与核磁共振", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第十三章 原子核和放射性 · 13.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        ana1 = Text("陀螺在重力场中只能沿固定轴旋转——", font=CJK).scale(0.5)
        ana2 = Text("原子核的「自旋磁矩」在外磁场中也只能取离散方向，", font=CJK).scale(0.5)
        ana3 = Text("这就是「空间量子化」，MRI 的物理基础。", font=CJK, color=CYAN).scale(0.5)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ── Step 3: 核自旋角动量公式 ────────────────────────────────────
        def_label = Text("核自旋角动量大小：", font=CJK).scale(0.48).next_to(title, DOWN, buff=0.5)
        p_formula = MathTex(r"P_I = \sqrt{I(I+1)}\,\hbar").scale(0.95)
        p_formula.next_to(def_label, DOWN, buff=0.38)
        p_formula[0][0].set_color(YELLOW)   # P_I 高亮

        mI_label = Text("z 分量（空间量子化）：", font=CJK).scale(0.48)
        mI_label.next_to(p_formula, DOWN, buff=0.45)
        mI_formula = MathTex(
            r"p_{Iz} = m_I\,\hbar,\quad m_I = -I,\,-I+1,\,\ldots,\,+I"
        ).scale(0.82)
        mI_formula.next_to(mI_label, DOWN, buff=0.28)
        mI_formula[0][0:4].set_color(YELLOW)

        count_label = Text("共 2I+1 个取向", font=CJK, color=GREEN).scale(0.46)
        count_label.next_to(mI_formula, DOWN, buff=0.32)

        self.play(FadeIn(def_label))
        self.play(Write(p_formula))
        self.wait(1.0)
        self.play(FadeIn(mI_label))
        self.play(Write(mI_formula))
        self.wait(0.8)
        self.play(FadeIn(count_label))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_label, p_formula, mI_label, mI_formula, count_label)))

        # ── Step 4: 质子 I=1/2 在 B₀ 中的两能级图（2D） ─────────────────
        field_label = Text("外磁场", font=CJK, color=CYAN).scale(0.44)
        b0_label = MathTex(r"B_0", color=CYAN).scale(0.7)
        field_grp = VGroup(field_label, b0_label).arrange(RIGHT, buff=0.15)
        field_grp.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(field_grp))

        # z 轴箭头（代表 B₀ 方向）
        z_arrow = Arrow(start=DOWN * 1.6, end=UP * 1.6, color=CYAN, buff=0)
        z_arrow.shift(LEFT * 4.5 + UP * 0.1)
        z_text = MathTex(r"z\,(B_0)", color=CYAN).scale(0.55)
        z_text.next_to(z_arrow.get_end(), UP, buff=0.12)
        self.play(Create(z_arrow), FadeIn(z_text))

        # 两条能级线
        e_up_y = 1.2    # 高能级（反平行，m_I = -1/2）
        e_dn_y = -1.0   # 低能级（平行，   m_I = +1/2）
        lw = 2.8        # 能级线半宽

        line_up = Line(LEFT * lw + UP * e_up_y, RIGHT * lw + UP * e_up_y, color=RED, stroke_width=3)
        line_dn = Line(LEFT * lw + UP * e_dn_y, RIGHT * lw + UP * e_dn_y, color=GREEN, stroke_width=3)

        label_up = VGroup(
            MathTex(r"m_I = -\tfrac{1}{2}", color=RED).scale(0.6),
            Text("（反平行，高能）", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.15).next_to(line_up, RIGHT, buff=0.18)

        label_dn = VGroup(
            MathTex(r"m_I = +\tfrac{1}{2}", color=GREEN).scale(0.6),
            Text("（平行，低能）", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.15).next_to(line_dn, RIGHT, buff=0.18)

        self.play(Create(line_dn), FadeIn(label_dn))
        self.wait(0.5)
        self.play(Create(line_up), FadeIn(label_up))
        self.wait(0.8)

        # 能级间距标注
        brace = Brace(VGroup(line_up, line_dn), direction=LEFT, color=YELLOW)
        delta_e_line = VGroup(
            MathTex(r"\Delta E", color=YELLOW).scale(0.65),
            MathTex(r"= 2\mu_N g B_0", color=YELLOW).scale(0.65),
        ).arrange(DOWN, buff=0.1)
        brace.put_at_tip(delta_e_line, buff=0.12)
        self.play(Create(brace), Write(delta_e_line))
        self.wait(1.2)

        step4_grp = VGroup(
            field_grp, z_arrow, z_text,
            line_up, line_dn, label_up, label_dn,
            brace, delta_e_line,
        )

        # ── Step 5: 核磁矩矢量取向示意（两个箭头） ──────────────────────
        mu_up = Arrow(start=ORIGIN, end=UP * 1.0, color=RED, buff=0)
        mu_up.shift(LEFT * 4.5 + UP * (e_up_y - 0.5))
        mu_dn = Arrow(start=ORIGIN, end=DOWN * 1.0, color=GREEN, buff=0)
        mu_dn.shift(LEFT * 4.5 + UP * (e_dn_y + 0.5))

        mu_up_label = MathTex(r"\vec{\mu}", color=RED).scale(0.55).next_to(mu_up, RIGHT, buff=0.08)
        mu_dn_label = MathTex(r"\vec{\mu}", color=GREEN).scale(0.55).next_to(mu_dn, RIGHT, buff=0.08)
        explain = Text("核磁矩只能「平行」或「反平行」外场", font=CJK, color=WHITE).scale(0.43)
        explain.to_edge(DOWN, buff=0.65)

        self.play(Create(mu_up), FadeIn(mu_up_label))
        self.play(Create(mu_dn), FadeIn(mu_dn_label))
        self.play(FadeIn(explain))
        self.wait(1.4)
        self.play(FadeOut(VGroup(step4_grp, mu_up, mu_up_label, mu_dn, mu_dn_label, explain)))

        # ── Step 6: ValueTracker 扫动 I，展示 2I+1 条能级 ───────────────
        vt_label = Text("改变自旋量子数 I，能级数 = 2I+1", font=CJK, color=BLUE).scale(0.5)
        vt_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(vt_label))

        I_tracker = ValueTracker(0.5)   # 初始 I = 1/2

        I_choices = [0.0, 0.5, 1.0, 1.5]   # 离散值，用动画切换

        def make_levels(I_val):
            n = round(2 * I_val + 1)   # 2I+1 条线
            lines = VGroup()
            labels = VGroup()
            if n == 0:
                return VGroup()
            colors = color_gradient([GREEN, RED], max(n, 2))
            for k in range(n):
                m_I = -I_val + k         # 从 -I 到 +I
                y = m_I * 1.5            # y 坐标按 m_I 等比
                c = colors[k] if n > 1 else GREEN
                ln = Line(LEFT * 2.8 + UP * y, RIGHT * 0.2 + UP * y, color=c, stroke_width=3)
                lines.add(ln)
                # 标签仅显示 m_I 分数
                if abs(m_I - round(m_I)) < 0.01:
                    m_str = rf"m_I={int(round(m_I))}"
                else:
                    # 半整数：显示 ±1/2, ±3/2 …
                    num = int(round(2 * m_I))
                    m_str = rf"m_I=\tfrac{{{num}}}{{2}}"
                lbl = MathTex(m_str, color=c).scale(0.5)
                lbl.next_to(ln, RIGHT, buff=0.15)
                labels.add(lbl)
            grp = VGroup(lines, labels)
            grp.move_to(DOWN * 0.3)
            return grp

        # I 显示计数器
        I_readout = always_redraw(lambda: VGroup(
            Text("I = ", font=CJK, color=ORANGE).scale(0.5),
            MathTex(
                {0.0: "0", 0.5: r"\tfrac{1}{2}", 1.0: "1", 1.5: r"\tfrac{3}{2}"}.get(
                    round(I_tracker.get_value() * 2) / 2, r"\tfrac{1}{2}"
                ),
                color=ORANGE,
            ).scale(0.6),
        ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.6))

        current_levels = make_levels(0.5)
        self.play(Create(current_levels))
        self.add(I_readout)
        self.wait(0.6)

        for I_val in [1.0, 1.5, 0.0, 0.5]:
            new_levels = make_levels(I_val)
            # 离散切换，不 always_redraw（避免非整数 m 值中间态）
            self.play(
                FadeOut(current_levels),
                I_tracker.animate.set_value(I_val),
                run_time=0.7,
            )
            self.play(FadeIn(new_levels), run_time=0.5)
            current_levels = new_levels
            self.wait(0.9)

        self.play(FadeOut(VGroup(current_levels, I_readout, vt_label)))

        # ── Step 7: 共振吸收动画 ─────────────────────────────────────────
        res_head = Text("射频共振吸收：当 ν = ΔE/h 时", font=CJK, color=YELLOW).scale(0.52)
        res_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(res_head))

        # 重绘两条能级（质子 I=1/2）
        lv_dn2 = Line(LEFT * 2.5 + DOWN * 0.9, RIGHT * 2.5 + DOWN * 0.9, color=GREEN, stroke_width=3)
        lv_up2 = Line(LEFT * 2.5 + UP * 0.9, RIGHT * 2.5 + UP * 0.9, color=RED, stroke_width=3)
        lbl_dn2 = VGroup(
            MathTex(r"m_I=+\tfrac{1}{2}", color=GREEN).scale(0.55),
            Text("低能", font=CJK, color=GREEN).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(lv_dn2, LEFT, buff=0.2)
        lbl_up2 = VGroup(
            MathTex(r"m_I=-\tfrac{1}{2}", color=RED).scale(0.55),
            Text("高能", font=CJK, color=RED).scale(0.38),
        ).arrange(RIGHT, buff=0.1).next_to(lv_up2, LEFT, buff=0.2)

        self.play(Create(lv_dn2), FadeIn(lbl_dn2))
        self.play(Create(lv_up2), FadeIn(lbl_up2))

        # 射频光子箭头：从低能级射向高能级
        rf_arrow = Arrow(
            start=ORIGIN + DOWN * 0.9 + RIGHT * 0.3,
            end=ORIGIN + UP * 0.9 + RIGHT * 0.3,
            color=YELLOW, buff=0, stroke_width=4,
        )
        rf_label = VGroup(
            Text("射频光子", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"\nu_{RF}", color=YELLOW).scale(0.55),
        ).arrange(DOWN, buff=0.1).next_to(rf_arrow, RIGHT, buff=0.2)

        self.play(GrowArrow(rf_arrow), FadeIn(rf_label))
        self.wait(0.8)

        # 跳跃效果：低能级粒子 → 高能级
        dot = Dot(color=GREEN, radius=0.18).move_to(lv_dn2.get_center() + UP * 0.22)
        self.play(FadeIn(dot))
        self.play(dot.animate.move_to(lv_up2.get_center() + UP * 0.22), run_time=1.0)
        self.play(dot.animate.set_color(RED), run_time=0.3)
        absorbed = Text("吸收！", font=CJK, color=YELLOW).scale(0.55)
        absorbed.next_to(lv_up2, UP, buff=0.22)
        self.play(FadeIn(absorbed))
        self.wait(0.8)

        # NMR 频率公式
        nmr_eq = MathTex(r"\nu_0 = \frac{\Delta E}{h} = \frac{2\mu_N g B_0}{h}").scale(0.85)
        nmr_eq.to_edge(DOWN, buff=0.7)
        nmr_eq.set_color(YELLOW)
        self.play(Write(nmr_eq))
        self.wait(1.2)

        step7_grp = VGroup(
            res_head, lv_dn2, lv_up2, lbl_dn2, lbl_up2,
            rf_arrow, rf_label, dot, absorbed, nmr_eq,
        )
        self.play(FadeOut(step7_grp))

        # ── Step 8: MRI 设备示意 ─────────────────────────────────────────
        mri_head = Text("核磁共振的应用：MRI 成像", font=CJK, color=BLUE).scale(0.52)
        mri_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(mri_head))

        # 简化 MRI 圆筒示意
        magnet = Ellipse(width=4.0, height=2.2, color=BLUE_D, stroke_width=3)
        magnet.shift(DOWN * 0.3)
        magnet_label = Text("超导磁体", font=CJK, color=BLUE_D).scale(0.42)
        magnet_label.next_to(magnet, UP, buff=0.15)

        bore = Ellipse(width=2.0, height=1.0, color=CYAN, stroke_width=2)
        bore.move_to(magnet.get_center())

        patient = Rectangle(width=1.4, height=0.55, color=WHITE, fill_color=LIGHT_GRAY,
                             fill_opacity=0.5, stroke_width=2)
        patient.move_to(bore.get_center())
        patient_label = Text("人体", font=CJK).scale(0.38).next_to(patient, DOWN, buff=0.15)

        b0_arrow_mri = Arrow(LEFT * 3.0 + DOWN * 0.3, RIGHT * 3.0 + DOWN * 0.3,
                             color=CYAN, buff=0, stroke_width=3)
        b0_mri_label = MathTex(r"B_0", color=CYAN).scale(0.55).next_to(b0_arrow_mri, DOWN, buff=0.1)

        caption = Text("氢核在强磁场中共振，梯度场编码位置 → 图像", font=CJK, color=GREEN).scale(0.42)
        caption.to_edge(DOWN, buff=0.55)

        self.play(Create(magnet), FadeIn(magnet_label))
        self.play(Create(bore))
        self.play(FadeIn(patient), FadeIn(patient_label))
        self.play(GrowArrow(b0_arrow_mri), FadeIn(b0_mri_label))
        self.play(FadeIn(caption))
        self.wait(1.6)
        self.play(FadeOut(VGroup(
            mri_head, magnet, magnet_label, bore, patient, patient_label,
            b0_arrow_mri, b0_mri_label, caption,
        )))

        # ── Step 9: 核磁子定义 + 与玻尔磁子对比 ────────────────────────
        mn_head = Text("核磁子与玻尔磁子", font=CJK, color=BLUE).scale(0.52)
        mn_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(mn_head))

        mu_N_def = MathTex(r"\mu_N = \frac{e\hbar}{2m_p}").scale(0.9)
        mu_N_def.next_to(mn_head, DOWN, buff=0.5)
        mu_N_def[0][0:3].set_color(YELLOW)

        mu_B_def = MathTex(r"\mu_B = \frac{e\hbar}{2m_e}").scale(0.9)
        mu_B_def.next_to(mu_N_def, DOWN, buff=0.45)
        mu_B_def[0][0:3].set_color(ORANGE)

        ratio_label = Text("比较两者：", font=CJK).scale(0.46)
        ratio_label.next_to(mu_B_def, DOWN, buff=0.4)
        ratio_eq = MathTex(r"\frac{\mu_N}{\mu_B} = \frac{m_e}{m_p} \approx \frac{1}{1836}").scale(0.85)
        ratio_eq.next_to(ratio_label, DOWN, buff=0.28)
        ratio_eq.set_color(GREEN)

        note_ratio = Text("核磁子比玻尔磁子小约 1836 倍（核质子质量比）", font=CJK, color=GREEN).scale(0.42)
        note_ratio.next_to(ratio_eq, DOWN, buff=0.38)

        self.play(Write(mu_N_def))
        self.wait(0.8)
        self.play(Write(mu_B_def))
        self.wait(0.8)
        self.play(FadeIn(ratio_label))
        self.play(Write(ratio_eq))
        self.wait(0.8)
        self.play(FadeIn(note_ratio))
        self.wait(1.4)
        self.play(FadeOut(VGroup(mn_head, mu_N_def, mu_B_def, ratio_label, ratio_eq, note_ratio)))

        # ── Step 10: 核磁矩公式 ──────────────────────────────────────────
        mu_head = Text("核磁矩 z 分量", font=CJK, color=BLUE).scale(0.52)
        mu_head.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(mu_head))

        mu_z_eq = MathTex(r"\mu_{Iz} = g m_I \mu_N").scale(1.0)
        mu_z_eq.next_to(mu_head, DOWN, buff=0.5)
        mu_z_eq[0][0:4].set_color(YELLOW)   # μ_Iz
        mu_z_eq[0][5].set_color(ORANGE)     # g
        mu_z_eq[0][6:8].set_color(CYAN)     # m_I

        g_note = Text("g : 核 g 因子（各核不同，质子 g = 5.586）", font=CJK, color=ORANGE).scale(0.42)
        g_note.next_to(mu_z_eq, DOWN, buff=0.4)

        mI_note = Text("m_I : 磁量子数，决定磁矩在外场方向的分量", font=CJK, color=CYAN).scale(0.42)
        mI_note.next_to(g_note, DOWN, buff=0.25)

        self.play(Write(mu_z_eq))
        self.wait(0.8)
        self.play(FadeIn(g_note))
        self.wait(0.6)
        self.play(FadeIn(mI_note))
        self.wait(1.2)
        self.play(FadeOut(VGroup(mu_head, mu_z_eq, g_note, mI_note)))

        # ── Step 11: 小结卡 ───────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"P_I = \sqrt{I(I+1)}\,\hbar", color=YELLOW).scale(0.78)
        s2 = MathTex(r"p_{Iz} = m_I\hbar,\quad m_I=-I,\ldots,+I", color=YELLOW).scale(0.72)
        s3 = MathTex(r"\mu_{Iz} = g m_I \mu_N,\quad \mu_N=\frac{e\hbar}{2m_p}", color=YELLOW).scale(0.72)
        s4 = MathTex(r"\nu_0 = \frac{2\mu_N g B_0}{h}", color=GREEN).scale(0.78)
        s5 = VGroup(
            Text("核磁子", font=CJK, color=ORANGE).scale(0.44),
            MathTex(r"\approx \frac{\mu_B}{1836}", color=ORANGE).scale(0.65),
            Text("——核磁效应弱于电子磁效应", font=CJK, color=ORANGE).scale(0.44),
        ).arrange(RIGHT, buff=0.12)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.32).next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.4)
        self.play(Write(s2))
        self.wait(0.4)
        self.play(Write(s3))
        self.wait(0.4)
        self.play(Write(s4))
        self.wait(0.4)
        self.play(FadeIn(s5))
        self.play(Create(box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)
