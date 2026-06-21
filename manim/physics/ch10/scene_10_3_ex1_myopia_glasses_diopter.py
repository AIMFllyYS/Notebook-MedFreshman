"""第 10.3 节 · 例题 · 近视眼镜度数计算

教学目标：零基础读者通过「无矫正光路 → 凹透镜矫正 → 焦度公式推导 → 数值计算」
四步理解近视眼镜度数的物理含义与计算方法。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch10Ex1MyopiaGlassesDiopter",
        "id": "phys-ch10-10.3-ex1-myopia-glasses-diopter",
        "chapterId": "ch10",
        "sectionId": "10.3",
        "title": "近视眼镜度数计算",
        "description": "以远点 0.1 m 的近视眼为例，推导凹透镜焦度 Φ = -10 D，即眼镜度数 -1000 度。",
    }
]


# ──────────────────────────────────────────────────────────────────
# 辅助函数：绘制简化眼球截面
# ──────────────────────────────────────────────────────────────────
def make_eye(center=ORIGIN, radius=0.55, color=WHITE):
    """返回一个简化眼球：椭圆轮廓 + 视网膜弧线标记。"""
    eye_body = Ellipse(width=radius * 2, height=radius * 1.6, color=color, stroke_width=2)
    eye_body.move_to(center)
    # 视网膜：右侧内弧
    retina_arc = Arc(
        radius=radius * 0.55,
        start_angle=-0.6,
        angle=1.2,
        color=YELLOW,
        stroke_width=3,
    )
    retina_arc.move_to(center + RIGHT * radius * 0.55)
    label = Text("视网膜", font=CJK, color=YELLOW).scale(0.28)
    label.next_to(retina_arc, RIGHT, buff=0.08)
    return VGroup(eye_body, retina_arc, label)


# ──────────────────────────────────────────────────────────────────
# 场景类
# ──────────────────────────────────────────────────────────────────
class Ch10Ex1MyopiaGlassesDiopter(Scene):
    def construct(self):

        # ══ Step 1: 标题 ═══════════════════════════════════════════
        title = Text("近视眼镜度数计算", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.3  薄透镜焦度", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ══ Step 2: 生活类比引入 ════════════════════════════════════
        ana1 = Text("近视眼：眼球太长，平行光汇聚在视网膜前方，", font=CJK).scale(0.46)
        ana2 = Text("看远处一片模糊。需要凹透镜把光「先发散」，", font=CJK).scale(0.46)
        ana3 = Text("让光线再次落在视网膜上。", font=CJK).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══ Step 3: 无矫正情况——平行光汇聚在视网膜前 ═══════════════
        scene_label = Text("情况 A：无矫正（近视眼）", font=CJK, color=ORANGE).scale(0.48)
        scene_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scene_label))

        # 眼球
        eye_center = RIGHT * 2.5
        eye = make_eye(center=eye_center, radius=0.55)
        self.play(Create(eye), run_time=1.0)
        self.wait(0.5)

        # 平行光（3 条水平光线，从左侧进入）
        ray_ys = [-0.35, 0.0, 0.35]
        ray_color = CYAN
        parallel_rays = VGroup(*[
            Arrow(
                start=LEFT * 5.5 + UP * y,
                end=LEFT * 1.0 + UP * y,
                buff=0,
                color=ray_color,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.12,
            )
            for y in ray_ys
        ])
        label_parallel = Text("平行光（无穷远处物体）", font=CJK, color=CYAN).scale(0.36)
        label_parallel.next_to(parallel_rays, UP, buff=0.15)
        self.play(Create(parallel_rays), FadeIn(label_parallel), run_time=1.2)
        self.wait(0.6)

        # 焦点落在视网膜前 5 mm 处（近视）
        # 视网膜位置 x ≈ eye_center[0] + 0.30；提前汇聚在 x ≈ eye_center[0] - 0.28
        focus_wrong = eye_center + LEFT * 0.28 + DOWN * 0.0
        # 光线在眼内折射，汇聚到 focus_wrong
        refracted_rays_wrong = VGroup(*[
            Line(
                start=LEFT * 1.0 + UP * y,
                end=focus_wrong,
                color=ray_color,
                stroke_width=2,
            )
            for y in ray_ys
        ])
        focus_dot_wrong = Dot(focus_wrong, color=RED, radius=0.09)
        label_focus_wrong = Text("汇聚在视网膜前", font=CJK, color=RED).scale(0.34)
        label_focus_wrong.next_to(focus_dot_wrong, DOWN, buff=0.15)

        # 虚线：焦点到视网膜
        retina_x = eye_center[0] + 0.30
        defocus_line = DashedLine(
            start=focus_wrong,
            end=np.array([retina_x, 0.0, 0.0]),
            color=RED,
            stroke_width=1.5,
        )
        defocus_label = Text("离焦 ~5 mm", font=CJK, color=RED).scale(0.32)
        defocus_label.next_to(defocus_line, UP, buff=0.1)

        self.play(Create(refracted_rays_wrong), run_time=0.8)
        self.play(FadeIn(focus_dot_wrong), FadeIn(label_focus_wrong))
        self.play(Create(defocus_line), FadeIn(defocus_label))
        self.wait(1.5)

        # 清场（保留眼球、标题、场景标签）
        self.play(
            FadeOut(VGroup(
                parallel_rays, label_parallel,
                refracted_rays_wrong, focus_dot_wrong,
                label_focus_wrong, defocus_line, defocus_label,
            ))
        )
        self.wait(0.5)

        # ══ Step 4: 近视眼远点概念 ═════════════════════════════════
        far_point_note = VGroup(
            Text("近视眼的「远点」d", font=CJK).scale(0.44),
            MathTex(r"d_{\text{far}}").scale(0.6),
            Text("：能看清的最远距离", font=CJK).scale(0.44),
        ).arrange(RIGHT, buff=0.1)
        far_point_note.next_to(scene_label, DOWN, buff=0.3)

        far_val = VGroup(
            Text("本题：", font=CJK).scale(0.44),
            MathTex(r"d_{\text{far}} = 0.1\,\mathrm{m}").scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        far_val.next_to(far_point_note, DOWN, buff=0.28)

        self.play(FadeIn(far_point_note))
        self.wait(0.8)
        self.play(Write(far_val))
        self.wait(1.5)

        # 在眼球图左侧标注远点位置
        far_point_pos = LEFT * 2.5 + DOWN * 0.9
        far_dot = Dot(far_point_pos, color=GREEN, radius=0.10)
        far_arrow = DashedLine(
            start=far_point_pos + UP * 0.2,
            end=eye_center + LEFT * 1.1 + DOWN * 0.1,
            color=GREEN,
            stroke_width=1.5,
        )
        far_dot_label = VGroup(
            Text("远点", font=CJK, color=GREEN).scale(0.34),
            MathTex(r"0.1\,\mathrm{m}", color=GREEN).scale(0.5),
        ).arrange(DOWN, buff=0.05)
        far_dot_label.next_to(far_dot, DOWN, buff=0.1)

        self.play(FadeIn(far_dot), Create(far_arrow), FadeIn(far_dot_label))
        self.wait(1.2)
        self.play(
            FadeOut(VGroup(
                eye, scene_label, far_point_note, far_val,
                far_dot, far_arrow, far_dot_label,
            ))
        )
        self.wait(0.4)

        # ══ Step 5: 矫正原理——凹透镜作用 ══════════════════════════
        scene_label2 = Text("情况 B：加入凹透镜矫正", font=CJK, color=GREEN).scale(0.48)
        scene_label2.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(scene_label2))

        # 重绘眼球
        eye2 = make_eye(center=eye_center, radius=0.55)
        self.play(Create(eye2), run_time=0.8)

        # 凹透镜（用两条弧线象征）
        lens_x = -1.0
        lens_left = Arc(
            radius=0.6, start_angle=PI / 2 + 0.4, angle=-(PI - 0.8),
            color=WHITE, stroke_width=2,
        ).shift(RIGHT * (lens_x - 0.18))
        lens_right = Arc(
            radius=0.6, start_angle=-PI / 2 + 0.4, angle=-(PI - 0.8),
            color=WHITE, stroke_width=2,
        ).shift(RIGHT * (lens_x + 0.18))
        lens_label = Text("凹透镜", font=CJK, color=WHITE).scale(0.36)
        lens_label.next_to(VGroup(lens_left, lens_right), DOWN, buff=0.15)
        lens_group = VGroup(lens_left, lens_right, lens_label)
        self.play(Create(lens_left), Create(lens_right), FadeIn(lens_label), run_time=0.9)
        self.wait(0.5)

        # 平行光输入
        parallel_rays2 = VGroup(*[
            Arrow(
                start=LEFT * 5.5 + UP * y,
                end=LEFT * 1.35 + UP * y,
                buff=0,
                color=CYAN,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.12,
            )
            for y in ray_ys
        ])
        label_parallel2 = Text("平行光", font=CJK, color=CYAN).scale(0.34)
        label_parallel2.next_to(parallel_rays2, UP, buff=0.12)
        self.play(Create(parallel_rays2), FadeIn(label_parallel2), run_time=1.0)
        self.wait(0.5)

        # 经凹透镜后发散（模拟来自远点）
        virtual_src = LEFT * 5.5  # 虚物源位置（无穷远相当于远点处）
        diverge_target = LEFT * 2.4  # 发散后延长线会聚处（即远点 -0.1 m 处约在此位置）
        # 实际光线方向：从 lens_x 处出发，方向朝 eye 方向但略发散
        diverge_rays = VGroup(*[
            Arrow(
                start=np.array([lens_x, y, 0.0]),
                end=np.array([lens_x + 1.35, y + (y - 0.0) * 0.38, 0.0]),
                buff=0,
                color=CYAN,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.15,
            )
            for y in ray_ys
        ])
        # 延长线虚线（虚焦点）
        diverge_dashes = VGroup(*[
            DashedLine(
                start=np.array([lens_x, y, 0.0]),
                end=np.array([lens_x - 1.3, y - (y - 0.0) * 0.38, 0.0]),
                color=ORANGE,
                stroke_width=1.2,
            )
            for y in ray_ys
        ])
        virtual_focus_label = VGroup(
            Text("虚焦（远点）", font=CJK, color=ORANGE).scale(0.32),
            MathTex(r"0.1\,\mathrm{m}", color=ORANGE).scale(0.48),
        ).arrange(DOWN, buff=0.05)
        virtual_focus_label.move_to(LEFT * 2.3 + DOWN * 0.85)

        self.play(Create(diverge_rays), Create(diverge_dashes), run_time=0.9)
        self.play(FadeIn(virtual_focus_label))
        self.wait(0.8)

        # 光进入眼内后矫正落在视网膜上
        retina_pt = eye_center + RIGHT * 0.28
        corrected_rays = VGroup(*[
            Line(
                start=np.array([lens_x + 1.35, y + (y - 0.0) * 0.38, 0.0]),
                end=retina_pt,
                color=CYAN,
                stroke_width=2,
            )
            for y in ray_ys
        ])
        focus_correct_dot = Dot(retina_pt, color=GREEN, radius=0.09)
        label_correct = Text("精准落在视网膜", font=CJK, color=GREEN).scale(0.34)
        label_correct.next_to(focus_correct_dot, RIGHT, buff=0.1)

        self.play(Create(corrected_rays), run_time=0.7)
        self.play(FadeIn(focus_correct_dot), FadeIn(label_correct))
        self.wait(1.5)

        # 清场
        self.play(
            FadeOut(VGroup(
                eye2, lens_group, scene_label2,
                parallel_rays2, label_parallel2,
                diverge_rays, diverge_dashes, virtual_focus_label,
                corrected_rays, focus_correct_dot, label_correct,
            ))
        )
        self.wait(0.4)

        # ══ Step 6: 薄透镜焦度公式定义 ════════════════════════════
        def_label = Text("薄透镜焦度（光焦度）", font=CJK, color=BLUE).scale(0.52)
        def_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(def_label))

        phi_def = MathTex(
            r"\Phi = \frac{1}{v} - \frac{1}{u}"
        ).scale(1.05)
        phi_def.next_to(def_label, DOWN, buff=0.45)

        note_uv = VGroup(
            Text("u = 物距，", font=CJK).scale(0.40),
            Text("v = 像距", font=CJK).scale(0.40),
            Text("（实像为正，虚像为负）", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.15)
        note_uv.next_to(phi_def, DOWN, buff=0.3)

        self.play(Write(phi_def))
        self.wait(0.8)
        self.play(FadeIn(note_uv))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_label, phi_def, note_uv)))

        # ══ Step 7: 逐步代入推导 ═══════════════════════════════════
        deriv_title = Text("公式推导（逐步替换）", font=CJK, color=BLUE).scale(0.50)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        # 7a: 原始公式
        step_a = MathTex(
            r"\Phi",
            r"=",
            r"\frac{1}{v}",
            r"-",
            r"\frac{1}{u}",
        ).scale(0.95)
        step_a.next_to(deriv_title, DOWN, buff=0.5)
        self.play(Write(step_a))
        self.wait(1.0)

        # 7b: 代入 u → ∞
        cond_u = VGroup(
            Text("物体在无穷远：", font=CJK).scale(0.42),
            MathTex(r"u \to \infty \Rightarrow \frac{1}{u} = 0").scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        cond_u.next_to(step_a, DOWN, buff=0.4)
        self.play(FadeIn(cond_u))
        self.wait(0.9)
        step_b = MathTex(
            r"\Phi",
            r"=",
            r"\frac{1}{v}",
            r"-",
            r"0",
            r"=",
            r"\frac{1}{v}",
        ).scale(0.95)
        step_b.next_to(cond_u, DOWN, buff=0.35)
        step_b[4].set_color(YELLOW)
        self.play(Write(step_b))
        self.wait(1.0)

        # 7c: 要求像成在远点（虚像，v = -d_far）
        cond_v = VGroup(
            Text("像需落在远点（虚像）：", font=CJK).scale(0.42),
            MathTex(r"v = -d_{\text{far}} = -0.1\,\mathrm{m}").scale(0.72),
        ).arrange(RIGHT, buff=0.15)
        cond_v.next_to(step_b, DOWN, buff=0.35)
        cond_v[1].set_color(GREEN)
        self.play(FadeIn(cond_v))
        self.wait(1.0)

        step_c = MathTex(
            r"\Phi",
            r"=",
            r"\frac{1}{-d_{\text{far}}}",
            r"=",
            r"-\frac{1}{d_{\text{far}}}",
        ).scale(0.95)
        step_c.next_to(cond_v, DOWN, buff=0.35)
        step_c[4].set_color(YELLOW)
        self.play(Write(step_c))
        self.wait(1.5)

        self.play(FadeOut(VGroup(deriv_title, step_a, cond_u, step_b, cond_v, step_c)))

        # ══ Step 8: 代入数值，高亮结果 ════════════════════════════
        num_title = Text("代入数值", font=CJK, color=BLUE).scale(0.52)
        num_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(num_title))

        # 公式框：逐步出现，最终高亮 Φ
        eq1 = MathTex(
            r"\Phi",
            r"=",
            r"-\frac{1}{d_{\text{far}}}",
        ).scale(1.0)
        eq1.next_to(num_title, DOWN, buff=0.5)
        self.play(Write(eq1))
        self.wait(0.8)

        eq2 = MathTex(
            r"\Phi",
            r"=",
            r"-\frac{1}{0.1\,\mathrm{m}}",
        ).scale(1.0)
        eq2.next_to(eq1, DOWN, buff=0.4)
        self.play(TransformMatchingTex(eq1.copy(), eq2))
        self.wait(0.8)

        eq3 = MathTex(
            r"\Phi",
            r"=",
            r"-10\,\mathrm{D}",
        ).scale(1.1)
        eq3[2].set_color(YELLOW)
        eq3.next_to(eq2, DOWN, buff=0.4)
        box_eq3 = SurroundingRectangle(eq3, color=YELLOW, buff=0.22, corner_radius=0.12)
        self.play(Write(eq3))
        self.play(Create(box_eq3))
        self.wait(1.5)

        # 单位换算角落
        unit_conv = VGroup(
            Text("单位换算：", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"-10\,\mathrm{D}\ =\ -1000\ \text{degree}", color=ORANGE).scale(0.60),
        ).arrange(RIGHT, buff=0.12)
        unit_conv.to_corner(DR, buff=0.45)
        unit_box = SurroundingRectangle(unit_conv, color=ORANGE, buff=0.18, corner_radius=0.10)
        self.play(FadeIn(unit_conv), Create(unit_box))
        self.wait(1.8)
        self.play(FadeOut(VGroup(num_title, eq1, eq2, eq3, box_eq3, unit_conv, unit_box)))

        # ══ Step 9: 矫正后光路全景（最终光路图） ══════════════════
        final_label = Text("矫正后完整光路", font=CJK, color=GREEN).scale(0.48)
        final_label.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(final_label))

        eye3 = make_eye(center=eye_center, radius=0.55)
        self.play(Create(eye3), run_time=0.7)

        # 凹透镜（更紧凑）
        l3_left = Arc(
            radius=0.55, start_angle=PI / 2 + 0.45, angle=-(PI - 0.9),
            color=WHITE, stroke_width=2,
        ).shift(RIGHT * (lens_x - 0.16))
        l3_right = Arc(
            radius=0.55, start_angle=-PI / 2 + 0.45, angle=-(PI - 0.9),
            color=WHITE, stroke_width=2,
        ).shift(RIGHT * (lens_x + 0.16))
        l3_label = Text("凹透镜  f < 0", font=CJK, color=WHITE).scale(0.34)
        l3_label.next_to(VGroup(l3_left, l3_right), DOWN, buff=0.12)
        self.play(Create(l3_left), Create(l3_right), FadeIn(l3_label), run_time=0.7)

        # 平行光
        par3 = VGroup(*[
            Arrow(
                start=LEFT * 5.5 + UP * y,
                end=np.array([lens_x - 0.02, y, 0.0]),
                buff=0,
                color=CYAN,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.10,
            )
            for y in ray_ys
        ])
        self.play(Create(par3), run_time=0.8)

        # 经凹透镜发散
        div3 = VGroup(*[
            Arrow(
                start=np.array([lens_x + 0.02, y, 0.0]),
                end=np.array([lens_x + 1.30, y + y * 0.40, 0.0]),
                buff=0,
                color=CYAN,
                stroke_width=2,
                max_tip_length_to_length_ratio=0.13,
            )
            for y in ray_ys
        ])
        self.play(Create(div3), run_time=0.7)

        # 进入眼球汇聚到视网膜
        ret3 = eye_center + RIGHT * 0.28
        conv3 = VGroup(*[
            Line(
                start=np.array([lens_x + 1.30, y + y * 0.40, 0.0]),
                end=ret3,
                color=CYAN,
                stroke_width=2,
            )
            for y in ray_ys
        ])
        focus3 = Dot(ret3, color=GREEN, radius=0.10)
        ok_label = Text("视网膜精准成像", font=CJK, color=GREEN).scale(0.36)
        ok_label.next_to(focus3, RIGHT, buff=0.12)
        self.play(Create(conv3), run_time=0.7)
        self.play(FadeIn(focus3), FadeIn(ok_label))
        self.wait(1.5)

        # 标注关键量
        phi_annot = VGroup(
            MathTex(r"\Phi = -10\,\mathrm{D}", color=YELLOW).scale(0.68),
            Text("（即 -1000 度）", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(RIGHT, buff=0.12)
        phi_annot.to_corner(UL, buff=0.55)
        phi_annot.shift(DOWN * 1.1)
        self.play(FadeIn(phi_annot))
        self.wait(1.5)

        self.play(
            FadeOut(VGroup(
                eye3, l3_left, l3_right, l3_label,
                par3, div3, conv3, focus3, ok_label,
                final_label, phi_annot,
            ))
        )
        self.wait(0.3)

        # ══ Step 10: 小结卡 ════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("近视眼矫正：凹透镜将平行光虚焦于远点", font=CJK, color=WHITE).scale(0.44),
        )
        s2_eq = MathTex(
            r"\Phi = \frac{1}{v} - \frac{1}{u}"
            r"\quad (u\to\infty) \Rightarrow"
            r"\Phi = -\frac{1}{d_{\text{far}}}",
            color=YELLOW,
        ).scale(0.72)
        s3_eq = MathTex(
            r"\Phi = -\frac{1}{0.1\,\mathrm{m}} = -10\,\mathrm{D}",
            color=GREEN,
        ).scale(0.82)
        s4 = VGroup(
            Text("眼镜度数 = 焦度", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\times\,100", color=ORANGE).scale(0.65),
            Text("，负号表示凹透镜", font=CJK, color=WHITE).scale(0.40),
        ).arrange(RIGHT, buff=0.12)
        s5_unit = MathTex(
            r"-10\,\mathrm{D} \;\longleftrightarrow\; -1000\text{ degree}",
            color=ORANGE,
        ).scale(0.70)

        summary = VGroup(s1, s2_eq, s3_eq, s4, s5_unit).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s1))
        self.wait(0.5)
        self.play(Write(s2_eq))
        self.wait(0.6)
        self.play(Write(s3_eq))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Write(s5_unit))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.5)
