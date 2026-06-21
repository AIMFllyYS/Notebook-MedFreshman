"""第 7.4 节 · 例题：电偶极子场中沿圆弧路径做功。

物理要点：电势能与路径无关，仅取决于起点/终点的电势差。
电偶极子电势 V = kp cosθ / r²，对于关于 x 轴对称的 A、B 两点，
V_A = +kp/r²，V_B = −kp/r²，功 A = q(V_A − V_B) = 2kpq/r²。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

WARM = "#FF6B35"   # 暖色：V > 0 区域
COOL = "#3A86FF"   # 冷色：V < 0 区域


class Ch07Ex1DipoleCircularPathWork(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("电偶极子场中沿圆弧路径做功", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第七章 静电场 · 7.4 · 例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("山顶到山谷：无论走哪条路，", font=CJK).scale(0.48)
        ana2 = Text("重力做的功只看高度差——电场力也一样！", font=CJK, color=YELLOW).scale(0.48)
        ana3 = Text("这叫做「路径无关性」，是保守力的根本特征。", font=CJK).scale(0.45)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 电偶极子示意图 ──────────────────────────────────────
        # 构建偶极子 + 圆弧 + A、B 点
        dipole_grp = self._build_dipole_scene()
        dipole_grp.next_to(title, DOWN, buff=0.45).shift(LEFT * 2.2)

        setup_zh = Text("以电偶极子中心为原点，A 在正轴，B 在负轴，", font=CJK).scale(0.42)
        setup_zh2 = Text("两点距原点均为 r，关于 x 轴对称（θ_A=0, θ_B=π）", font=CJK).scale(0.42)
        setup_txt = VGroup(setup_zh, setup_zh2).arrange(DOWN, buff=0.2)
        setup_txt.next_to(dipole_grp, RIGHT, buff=0.45).align_to(dipole_grp, UP)

        self.play(FadeIn(dipole_grp))
        self.wait(0.6)
        self.play(FadeIn(setup_txt))
        self.wait(1.8)
        self.play(FadeOut(setup_txt))

        # ── Step 4: 电势公式展示 ─────────────────────────────────────────
        f_title = Text("电偶极子电势公式", font=CJK, color=BLUE).scale(0.5)
        f_title.next_to(title, DOWN, buff=0.4).shift(RIGHT * 2.0)

        v_gen = MathTex(
            r"V", r"=", r"\frac{kp\cos\theta}{r^2}"
        ).scale(0.82)
        v_gen[0].set_color(YELLOW)
        v_gen[2].set_color(CYAN)
        v_gen.next_to(f_title, DOWN, buff=0.35)

        v_a = MathTex(
            r"V_A", r"=", r"\frac{kp\cos 0}{r^2}", r"=", r"+\frac{kp}{r^2}"
        ).scale(0.78)
        v_a[0].set_color(WARM)
        v_a[4].set_color(WARM)

        v_b = MathTex(
            r"V_B", r"=", r"\frac{kp\cos\pi}{r^2}", r"=", r"-\frac{kp}{r^2}"
        ).scale(0.78)
        v_b[0].set_color(COOL)
        v_b[4].set_color(COOL)

        formulas = VGroup(v_gen, v_a, v_b).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        formulas.next_to(f_title, DOWN, buff=0.35)
        formulas.shift(RIGHT * 2.1)

        self.play(FadeIn(f_title))
        self.play(Write(v_gen))
        self.wait(1.0)
        self.play(Write(v_a))
        self.wait(0.7)
        self.play(Write(v_b))
        self.wait(1.6)

        # A 点高亮 + 颜色提示
        a_note = Text("A 点靠近正电荷端，V_A > 0（暖色）", font=CJK, color=WARM).scale(0.4)
        b_note = Text("B 点靠近负电荷端，V_B < 0（冷色）", font=CJK, color=COOL).scale(0.4)
        notes = VGroup(a_note, b_note).arrange(DOWN, buff=0.2)
        notes.next_to(formulas, DOWN, buff=0.3)
        self.play(FadeIn(a_note))
        self.wait(0.5)
        self.play(FadeIn(b_note))
        self.wait(1.4)
        self.play(FadeOut(VGroup(f_title, formulas, notes)))

        # ── Step 5: 电场力做功公式推导 ──────────────────────────────────
        work_title = Text("计算 A → B 电场力做功", font=CJK, color=BLUE).scale(0.5)
        work_title.next_to(title, DOWN, buff=0.4).shift(RIGHT * 1.8)

        step_a = MathTex(
            r"W", r"=", r"q\,(V_A - V_B)"
        ).scale(0.82)
        step_a[0].set_color(GREEN)

        step_b = MathTex(
            r"=", r"q\left(\frac{kp}{r^2} - \left(-\frac{kp}{r^2}\right)\right)"
        ).scale(0.78)

        step_c = MathTex(
            r"=", r"q \cdot \frac{2kp}{r^2}"
        ).scale(0.82)
        step_c[1].set_color(YELLOW)

        # 此时 θ_A = 0，cos θ_A = 1，代入普遍式得最终结论
        step_final = MathTex(
            r"W = -\frac{2kpq}{r^2}"
        ).scale(0.92)
        step_final.set_color(RED)

        work_steps = VGroup(step_a, step_b, step_c).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        work_steps.next_to(work_title, DOWN, buff=0.38).shift(RIGHT * 1.8)

        note_sign = Text("q > 0 时 W > 0，表示电场力做正功", font=CJK, color=GREEN).scale(0.42)
        note_sign.next_to(work_steps, DOWN, buff=0.3)

        self.play(FadeIn(work_title))
        self.play(Write(step_a))
        self.wait(0.9)
        self.play(Write(step_b))
        self.wait(0.9)
        self.play(Write(step_c))
        self.wait(1.0)
        self.play(FadeIn(note_sign))
        self.wait(1.4)
        self.play(FadeOut(VGroup(work_title, work_steps, note_sign)))

        # ── Step 6: 路径无关性演示 ──────────────────────────────────────
        path_title = Text("路径无关性验证：换三条路径，结果相同！", font=CJK, color=BLUE).scale(0.46)
        path_title.next_to(title, DOWN, buff=0.4)

        self.play(FadeIn(path_title))
        self.wait(0.5)

        # 重新绘制偶极子示意（小版本）
        mini_dipole = self._build_dipole_scene(scale=0.72)
        mini_dipole.move_to(DOWN * 1.0 + LEFT * 3.2)
        self.play(FadeIn(mini_dipole))

        # 三条路径（全部从 A 到 B）
        # 偶极子坐标系：中心在 mini_dipole 的参考点
        center = mini_dipole.get_center() + DOWN * 0.05  # 微调至圆心
        r_px = 1.08  # 像素中的半径（与 _build_dipole_scene 一致，scale=0.72 → 1.5*0.72=1.08）

        A_pt = center + RIGHT * r_px
        B_pt = center + LEFT * r_px

        # 路径 1：上方圆弧（已在示意图中显示）
        arc1 = Arc(
            radius=r_px, start_angle=0, angle=PI,
            arc_center=center, color=WARM, stroke_width=3
        )
        arc1_label = Text("路径①：上弧", font=CJK, color=WARM).scale(0.38)
        arc1_label.next_to(center, UP * 1.8)

        # 路径 2：下方圆弧
        arc2 = Arc(
            radius=r_px, start_angle=0, angle=-PI,
            arc_center=center, color=GREEN, stroke_width=3
        )
        arc2_label = Text("路径②：下弧", font=CJK, color=GREEN).scale(0.38)
        arc2_label.next_to(center, DOWN * 2.0)

        # 路径 3：折线（A→O→B）
        broken = VGroup(
            Line(A_pt, center, color=COOL, stroke_width=3),
            Line(center, B_pt, color=COOL, stroke_width=3),
        )
        broken_label = Text("路径③：折线", font=CJK, color=COOL).scale(0.38)
        broken_label.next_to(center, DOWN * 0.4).shift(UP * 0.3)

        # 同一结果显示
        result_box_content = MathTex(r"W = \frac{2kpq}{r^2} \quad \text{(same)}").scale(0.72)
        result_box_content.set_color(YELLOW)
        result_box = SurroundingRectangle(result_box_content, color=GREEN, buff=0.2)
        result_grp = VGroup(result_box_content, result_box)
        result_grp.next_to(mini_dipole, RIGHT, buff=0.7).shift(UP * 0.2)

        path_note = VGroup(
            Text("三条不同路径，", font=CJK).scale(0.43),
            Text("电场力做功完全相同——", font=CJK, color=YELLOW).scale(0.43),
            Text("这正是静电场保守性的体现。", font=CJK, color=GREEN).scale(0.43),
        ).arrange(DOWN, buff=0.22)
        path_note.next_to(result_grp, DOWN, buff=0.4)

        self.play(Create(arc1), FadeIn(arc1_label))
        self.wait(0.8)
        self.play(Create(arc2), FadeIn(arc2_label))
        self.wait(0.8)
        self.play(Create(broken), FadeIn(broken_label))
        self.wait(0.8)
        self.play(Write(result_box_content), Create(result_box))
        self.wait(0.6)
        self.play(FadeIn(path_note))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            path_title, mini_dipole, arc1, arc1_label,
            arc2, arc2_label, broken, broken_label,
            result_grp, path_note
        )))

        # ── Step 7: ValueTracker 动态做功演示 ───────────────────────────
        # 用 ValueTracker 模拟电荷从 A 沿圆弧滑到 B，显示累积功
        anim_title = Text("动画：正电荷沿上弧从 A 到 B，功逐渐累积", font=CJK, color=BLUE).scale(0.44)
        anim_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(anim_title))

        anim_dipole = self._build_dipole_scene(scale=0.9)
        anim_dipole.move_to(DOWN * 0.8 + LEFT * 2.5)
        self.play(FadeIn(anim_dipole))

        cx, cy = anim_dipole.get_center()[0], anim_dipole.get_center()[1]
        r_anim = 1.5 * 0.9  # 与 scale 对应

        angle_tracker = ValueTracker(0)   # 0 → π

        moving_dot = always_redraw(lambda: Dot(
            point=np.array([
                cx + r_anim * math.cos(angle_tracker.get_value()),
                cy + r_anim * math.sin(angle_tracker.get_value()),
                0
            ]),
            radius=0.14, color=WARM
        ))

        # 弧线轨迹（已走过的路）
        def make_trace():
            ang = angle_tracker.get_value()
            if ang < 0.01:
                return VMobject()
            return Arc(
                radius=r_anim,
                start_angle=0, angle=ang,
                arc_center=np.array([cx, cy, 0]),
                color=ORANGE, stroke_width=4
            )
        trace = always_redraw(make_trace)

        # 累积功读数（W = q*(V_A - V_θ) = q*kp/r²*(1 - cosθ)；令 2kpq/r²=1 归一化）
        def make_work_readout():
            ang = angle_tracker.get_value()
            # 归一化：W_frac = (1 - cos θ) / 2  （满量程 θ=π 时为 1）
            frac = (1 - math.cos(ang)) / 2
            w_val = frac * 2  # 显示为 0→1 的倍数（单位 2kpq/r²）
            return VGroup(
                Text("已做功", font=CJK, color=YELLOW).scale(0.4),
                MathTex(rf"W = {w_val:.2f} \cdot \frac{{2kpq}}{{r^2}}",
                        color=YELLOW).scale(0.7),
            ).arrange(DOWN, buff=0.15).to_edge(RIGHT, buff=0.5).shift(UP * 0.5)

        work_readout = always_redraw(make_work_readout)

        # 角度标注
        def make_angle_label():
            ang = angle_tracker.get_value()
            label_pos = np.array([
                cx + (r_anim + 0.35) * math.cos(ang),
                cy + (r_anim + 0.35) * math.sin(ang),
                0
            ])
            # 避免越界
            label_pos[0] = max(-6.5, min(6.5, label_pos[0]))
            label_pos[1] = max(-3.6, min(3.6, label_pos[1]))
            return MathTex(
                rf"\theta={math.degrees(ang):.0f}^\circ",
                color=CYAN
            ).scale(0.5).move_to(label_pos)

        angle_label = always_redraw(make_angle_label)

        self.add(trace, moving_dot, work_readout, angle_label)
        self.wait(0.5)
        self.play(
            angle_tracker.animate.set_value(PI),
            run_time=4.0,
            rate_func=linear
        )
        self.wait(1.5)
        self.play(FadeOut(VGroup(anim_title, anim_dipole, trace, moving_dot,
                                  work_readout, angle_label)))

        # ── Step 8: 完整推导汇总（含符号讨论）────────────────────────────
        derive_title = Text("完整推导与符号讨论", font=CJK, color=BLUE).scale(0.5)
        derive_title.next_to(title, DOWN, buff=0.4)

        d1 = MathTex(
            r"V_A = \frac{kp\cos 0}{r^2} = +\frac{kp}{r^2}"
        ).scale(0.72).set_color(WARM)

        d2 = MathTex(
            r"V_B = \frac{kp\cos\pi}{r^2} = -\frac{kp}{r^2}"
        ).scale(0.72).set_color(COOL)

        d3 = MathTex(
            r"W = q\left(V_A - V_B\right) = q \cdot \frac{2kp}{r^2}"
        ).scale(0.72).set_color(YELLOW)

        # 一般情形：A 在任意 θ_A
        d4 = MathTex(
            r"W = q\left(\frac{kp\cos\theta_A}{r^2} - \frac{kp\cos\theta_B}{r^2}\right)"
        ).scale(0.65).set_color(WHITE)

        sign_note_pos = Text("q > 0 且 V_A > V_B  →  W > 0，电场力做正功", font=CJK, color=GREEN).scale(0.42)
        sign_note_neg = Text("若 q < 0，则 W < 0，电场力做负功", font=CJK, color=RED).scale(0.42)

        derive_grp = VGroup(d1, d2, d3, d4, sign_note_pos, sign_note_neg).arrange(
            DOWN, buff=0.32, aligned_edge=LEFT
        )
        derive_grp.next_to(derive_title, DOWN, buff=0.38)
        derive_grp.scale_to_fit_width(12.5)

        self.play(FadeIn(derive_title))
        for mob in [d1, d2, d3, d4, sign_note_pos, sign_note_neg]:
            self.play(Write(mob))
            self.wait(0.8)
        self.wait(1.2)
        self.play(FadeOut(VGroup(derive_title, derive_grp)))

        # ── Step 9: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)

        s1_row = VGroup(
            Text("电偶极子电势：", font=CJK).scale(0.46),
            MathTex(r"V=\dfrac{kp\cos\theta}{r^2}", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.18)

        s2_row = VGroup(
            Text("电场力做功：", font=CJK).scale(0.46),
            MathTex(r"W=q(V_A-V_B)=\dfrac{2kpq}{r^2}", color=YELLOW).scale(0.82)
        ).arrange(RIGHT, buff=0.18)

        s3_row = VGroup(
            Text("路径无关性：", font=CJK).scale(0.46),
            MathTex(r"W \text{ depends only on endpoints}", color=CYAN).scale(0.72)
        ).arrange(RIGHT, buff=0.18)

        s4_txt = Text("静电场是保守力场，电场力做的功与路径无关", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(s1_row, s2_row, s3_row, s4_txt).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1_row))
        self.wait(0.6)
        self.play(Write(s2_row))
        self.wait(0.6)
        self.play(Write(s3_row))
        self.wait(0.6)
        self.play(FadeIn(s4_txt), Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)

    # ── 辅助函数：构建电偶极子示意图 ────────────────────────────────────
    def _build_dipole_scene(self, scale: float = 1.0) -> VGroup:
        """返回电偶极子（含圆弧、A/B 点、电荷标注）组合体，以局部原点为参考。"""
        r = 1.5 * scale
        d = 0.45 * scale  # 半偶极距

        # 圆弧（白色虚线，表示等 r 圆周）
        circle = DashedVMobject(
            Circle(radius=r, color=WHITE).set_stroke(width=2),
            num_dashes=30, dashed_ratio=0.5
        )

        # 正负电荷
        pos_dot = Dot(point=RIGHT * d, radius=0.13 * scale, color=RED)
        neg_dot = Dot(point=LEFT * d, radius=0.13 * scale, color=BLUE)
        pos_label = MathTex(r"+q_0", color=RED).scale(0.55 * scale).next_to(pos_dot, UP, buff=0.08)
        neg_label = MathTex(r"-q_0", color=BLUE).scale(0.55 * scale).next_to(neg_dot, UP, buff=0.08)

        # 偶极矩方向箭头（从 -q 到 +q）
        p_arrow = Arrow(
            LEFT * d, RIGHT * d, buff=0,
            color=ORANGE, stroke_width=2.5,
            max_tip_length_to_length_ratio=0.25
        ).scale(scale)
        p_label = MathTex(r"\vec{p}", color=ORANGE).scale(0.5 * scale)
        p_label.next_to(p_arrow, DOWN, buff=0.08)

        # A 点（θ=0，正 x 轴）
        A_pos = RIGHT * r
        A_dot = Dot(point=A_pos, radius=0.11 * scale, color=WARM)
        A_label = MathTex(r"A", color=WARM).scale(0.58 * scale).next_to(A_dot, RIGHT, buff=0.08)
        A_warm = Dot(point=A_pos, radius=0.22 * scale, color=WARM, fill_opacity=0.3)

        # B 点（θ=π，负 x 轴）
        B_pos = LEFT * r
        B_dot = Dot(point=B_pos, radius=0.11 * scale, color=COOL)
        B_label = MathTex(r"B", color=COOL).scale(0.58 * scale).next_to(B_dot, LEFT, buff=0.08)
        B_cool = Dot(point=B_pos, radius=0.22 * scale, color=COOL, fill_opacity=0.3)

        # r 标注
        r_line = DashedLine(ORIGIN, RIGHT * r, color=CYAN, stroke_width=1.5)
        r_label = MathTex(r"r", color=CYAN).scale(0.5 * scale)
        r_label.next_to(r_line, UP, buff=0.06)

        return VGroup(
            circle,
            r_line, r_label,
            pos_dot, neg_dot, pos_label, neg_label,
            p_arrow, p_label,
            A_warm, A_dot, A_label,
            B_cool, B_dot, B_label,
        )


REGISTER = [
    {
        "scene": "Ch07Ex1DipoleCircularPathWork",
        "id": "phys-ch07-7.4-ex1-dipole-circular-path-work",
        "chapterId": "ch07",
        "sectionId": "7.4",
        "title": "例题：电偶极子场中沿圆弧路径做功",
        "description": "以电偶极子为背景，可视化演示 A→B 三条路径电场力做功结果相同，"
                       "推导 W=2kpq/r² 并揭示静电场路径无关性。",
    },
]
