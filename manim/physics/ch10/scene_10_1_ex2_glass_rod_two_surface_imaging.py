"""第 10.1 节 · 例题 2：玻璃棒双球面逐次成像

用横向圆柱玻璃棒模型，展示平行光经两个折射球面依次成像的完整推导过程：
第一面（凸，r1=+4cm）折射后得中间像，第二面（凹对入射光，r2=-4cm）再次折射，
最终在棒左侧 16 cm 处成虚像。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 布局常量 ──────────────────────────────────────────────────────────────────
ROD_LEN = 5.0          # 屏幕上玻璃棒宽度（单位：Manim 单位）
ROD_H = 0.8            # 玻璃棒高度
ROD_LEFT = -3.0        # 棒左端 x 坐标
ROD_RIGHT = ROD_LEFT + ROD_LEN   # = 2.0
ROD_CY = -1.0          # 棒中心 y

# 物理比例：20 cm 对应 ROD_LEN Manim 单位 → 1 cm = ROD_LEN/20
SCALE = ROD_LEN / 20.0  # Manim units per cm


def cm(x):
    """将厘米转为 Manim 单位（相对于棒左端）。"""
    return ROD_LEFT + x * SCALE


class Ch10Ex2GlassRodTwoSurfaceImaging(Scene):
    def construct(self):

        # ═══════════════════════════════════════════════════════════════════════
        # Step 1：标题
        # ═══════════════════════════════════════════════════════════════════════
        title = Text("玻璃棒双球面逐次成像", font=CJK, color=BLUE).scale(0.65).to_edge(UP)
        sub = Text("第十章 几何光学 · 10.1 球面折射", font=CJK, color=WHITE).scale(0.38)
        sub.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 2：生活类比
        # ═══════════════════════════════════════════════════════════════════════
        ana1 = Text("光从空气射入玻璃棒，经两端球面各折射一次，", font=CJK).scale(0.44)
        ana2 = Text("就像接力赛：第一面的像变成第二面的「物」，", font=CJK).scale(0.44)
        ana3 = Text("两次折射叠加，才能算出最终的像的位置。", font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.4)
        self.play(FadeOut(ana))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 3：已知条件
        # ═══════════════════════════════════════════════════════════════════════
        cond_title = Text("已知条件", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)

        def make_cond_line(zh_str, math_str):
            t = Text(zh_str, font=CJK).scale(0.42)
            m = MathTex(math_str).scale(0.72)
            return VGroup(t, m).arrange(RIGHT, buff=0.18)

        c1 = make_cond_line("棒长", r"d = 20\,\mathrm{cm}")
        c2 = make_cond_line("折射率", r"n = 1.5")
        c3 = make_cond_line("两端曲率半径", r"r_1 = +4\,\mathrm{cm},\quad r_2 = -4\,\mathrm{cm}")
        c4 = make_cond_line("入射光", r"u_1 = \infty\ (\text{parallel light})")
        conds = VGroup(c1, c2, c3, c4).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        conds.next_to(cond_title, DOWN, buff=0.35)
        conds.scale_to_fit_width(11)

        note_r = Text("注：r2=-4 是因为第二球面对入射光方向而言为凹面（曲心在左）",
                      font=CJK, color=ORANGE).scale(0.36)
        note_r.next_to(conds, DOWN, buff=0.2)

        self.play(FadeIn(cond_title))
        for c in [c1, c2, c3, c4]:
            self.play(FadeIn(c))
            self.wait(0.4)
        self.play(FadeIn(note_r))
        self.wait(1.8)
        self.play(FadeOut(VGroup(cond_title, conds, note_r)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 4：绘制玻璃棒图示
        # ═══════════════════════════════════════════════════════════════════════
        diagram_label = Text("图示：横截面示意", font=CJK, color=BLUE).scale(0.42)
        diagram_label.next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(diagram_label))
        self.wait(0.4)

        # 玻璃棒矩形主体
        rod_rect = Rectangle(
            width=ROD_LEN, height=ROD_H,
            fill_color="#AADDFF", fill_opacity=0.35,
            stroke_color=CYAN, stroke_width=2
        ).move_to([ROD_LEFT + ROD_LEN / 2, ROD_CY, 0])

        # 左端凸弧（第一球面）
        arc_left = Arc(
            radius=0.55, start_angle=PI / 2 + 0.4, angle=-(PI - 0.8),
            color=YELLOW, stroke_width=3
        ).move_to([ROD_LEFT, ROD_CY, 0])

        # 右端凹弧（对入射光为凹，第二球面）
        arc_right = Arc(
            radius=0.55, start_angle=PI / 2 - 0.4, angle=(PI - 0.8),
            color=YELLOW, stroke_width=3
        ).move_to([ROD_RIGHT, ROD_CY, 0])

        # 光轴
        axis = DashedLine(
            start=[ROD_LEFT - 1.5, ROD_CY, 0],
            end=[ROD_RIGHT + 2.0, ROD_CY, 0],
            color=WHITE, stroke_width=1.2
        )

        # 标注：r1, r2, d
        lbl_d_brace = Brace(rod_rect, DOWN, buff=0.1, color=WHITE)
        lbl_d_text = VGroup(
            MathTex(r"d").scale(0.6),
            Text("=20 cm", font=CJK).scale(0.35)
        ).arrange(RIGHT, buff=0.05)
        lbl_d_text.next_to(lbl_d_brace, DOWN, buff=0.1)

        lbl_r1 = VGroup(
            MathTex(r"r_1=+4", color=YELLOW).scale(0.55)
        ).move_to([ROD_LEFT - 0.05, ROD_CY + 0.72, 0])

        lbl_r2 = VGroup(
            MathTex(r"r_2=-4", color=YELLOW).scale(0.55)
        ).move_to([ROD_RIGHT + 0.1, ROD_CY + 0.72, 0])

        lbl_n = VGroup(
            MathTex(r"n=1.5", color=CYAN).scale(0.52)
        ).move_to([ROD_LEFT + ROD_LEN / 2, ROD_CY, 0])

        self.play(Create(rod_rect))
        self.play(Create(arc_left), Create(arc_right))
        self.play(Create(axis))
        self.play(FadeIn(lbl_d_brace), FadeIn(lbl_d_text))
        self.play(FadeIn(lbl_r1), FadeIn(lbl_r2), FadeIn(lbl_n))
        self.wait(1.2)

        rod_group = VGroup(rod_rect, arc_left, arc_right, axis,
                           lbl_d_brace, lbl_d_text, lbl_r1, lbl_r2, lbl_n)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 5：三条平行入射光线
        # ═══════════════════════════════════════════════════════════════════════
        ray_y_offsets = [0.28, 0.0, -0.28]
        ray_color = "#FFE080"

        rays_in = VGroup(*[
            Arrow(
                start=[ROD_LEFT - 1.3, ROD_CY + dy, 0],
                end=[ROD_LEFT + 0.02, ROD_CY + dy, 0],
                buff=0, color=ray_color, stroke_width=2.5,
                max_tip_length_to_length_ratio=0.2
            )
            for dy in ray_y_offsets
        ])

        cap_rays = Text("三条平行光从左侧射入第一球面", font=CJK, color=WHITE).scale(0.38)
        cap_rays.to_edge(DOWN, buff=0.55)
        self.play(Create(rays_in), FadeIn(cap_rays))
        self.wait(1.0)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 6：第一面折射公式推导
        # ═══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(cap_rays))

        sec1_title = Text("第一面折射（空气 → 玻璃）", font=CJK, color=BLUE).scale(0.44)
        sec1_title.next_to(title, DOWN, buff=0.35)

        form_title = Text("球面折射公式", font=CJK, color=WHITE).scale(0.4)
        form_general = MathTex(
            r"\frac{n_1}{u}", r"+", r"\frac{n_2}{v}", r"=", r"\frac{n_2 - n_1}{r}"
        ).scale(0.75)
        form_row = VGroup(form_title, form_general).arrange(RIGHT, buff=0.25)
        form_row.next_to(sec1_title, DOWN, buff=0.32)

        sub1 = MathTex(
            r"\frac{1.0}{\infty}", r"+",
            r"\frac{1.5}{v_1}", r"=",
            r"\frac{1.5 - 1.0}{+4}"
        ).scale(0.78)
        sub1.next_to(form_row, DOWN, buff=0.3)

        result1_lhs = MathTex(r"v_1", color=GREEN).scale(0.85)
        result1_eq = MathTex(r"=").scale(0.85)
        result1_rhs = MathTex(r"12\,\mathrm{cm}", color=GREEN).scale(0.85)
        result1 = VGroup(result1_lhs, result1_eq, result1_rhs).arrange(RIGHT, buff=0.12)
        result1.next_to(sub1, DOWN, buff=0.28)

        note1 = Text("中间像落在棒内（距第一面 12 cm < 棒长 20 cm）", font=CJK, color=ORANGE).scale(0.37)
        note1.next_to(result1, DOWN, buff=0.22)

        self.play(FadeIn(sec1_title))
        self.play(Write(form_row))
        self.wait(0.8)
        self.play(Write(sub1))
        self.wait(0.8)
        self.play(Write(result1))
        self.play(FadeIn(note1))
        self.wait(1.5)

        # 在图上标记中间像 v1=12 cm
        v1_x = cm(12)
        dot_v1 = Dot([v1_x, ROD_CY, 0], color=GREEN, radius=0.10)
        lbl_v1 = VGroup(
            MathTex(r"v_1", color=GREEN).scale(0.5),
            Text("=12 cm", font=CJK, color=GREEN).scale(0.32)
        ).arrange(RIGHT, buff=0.06)
        lbl_v1.next_to(dot_v1, UP, buff=0.15)

        # 折射后光线汇聚到 v1 点（近似三条折线）
        rays_refracted = VGroup()
        for dy in ray_y_offsets:
            seg = Line(
                start=[ROD_LEFT + 0.02, ROD_CY + dy, 0],
                end=[v1_x, ROD_CY, 0],
                color=ray_color, stroke_width=2.0
            )
            rays_refracted.add(seg)

        self.play(Create(rays_refracted), FadeIn(dot_v1), FadeIn(lbl_v1))
        self.wait(1.0)
        self.play(FadeOut(VGroup(sec1_title, form_row, sub1, result1, note1)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 7：确定第二面的物距 u2
        # ═══════════════════════════════════════════════════════════════════════
        sec2_pre_title = Text("确定第二面的物距", font=CJK, color=BLUE).scale(0.44)
        sec2_pre_title.next_to(title, DOWN, buff=0.35)

        u2_line1 = Text("中间像距第一面 12 cm，棒长 20 cm，", font=CJK).scale(0.42)
        u2_line2 = VGroup(
            Text("故中间像距第二面：", font=CJK).scale(0.42),
            MathTex(r"u_2 = 20 - 12 = 8\,\mathrm{cm}", color=YELLOW).scale(0.75)
        ).arrange(RIGHT, buff=0.15)
        u2_line3 = Text("中间像在第二面左侧（真实光线收敛点），为实物。", font=CJK, color=GREEN).scale(0.38)

        u2_block = VGroup(u2_line1, u2_line2, u2_line3).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        u2_block.next_to(sec2_pre_title, DOWN, buff=0.38)

        self.play(FadeIn(sec2_pre_title))
        self.play(FadeIn(u2_line1))
        self.wait(0.6)
        self.play(FadeIn(u2_line2))
        self.wait(0.6)
        self.play(FadeIn(u2_line3))
        self.wait(1.4)

        # 在图上标记 u2
        u2_arrow = DoubleArrow(
            start=[v1_x, ROD_CY - 0.55, 0],
            end=[ROD_RIGHT, ROD_CY - 0.55, 0],
            buff=0, color=YELLOW, stroke_width=2.0,
            max_tip_length_to_length_ratio=0.15
        )
        lbl_u2 = VGroup(
            MathTex(r"u_2", color=YELLOW).scale(0.48),
            Text("=8 cm", font=CJK, color=YELLOW).scale(0.30)
        ).arrange(RIGHT, buff=0.05)
        lbl_u2.next_to(u2_arrow, DOWN, buff=0.1)
        self.play(Create(u2_arrow), FadeIn(lbl_u2))
        self.wait(1.0)
        self.play(FadeOut(VGroup(sec2_pre_title, u2_block)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 8：第二面折射公式推导
        # ═══════════════════════════════════════════════════════════════════════
        sec2_title = Text("第二面折射（玻璃 → 空气）", font=CJK, color=BLUE).scale(0.44)
        sec2_title.next_to(title, DOWN, buff=0.35)

        sub2_params = VGroup(
            MathTex(r"n_1=1.5,\quad n_2=1.0").scale(0.65),
            MathTex(r"u_2=8\,\mathrm{cm},\quad r_2=-4\,\mathrm{cm}").scale(0.65)
        ).arrange(DOWN, buff=0.18)
        sub2_params.next_to(sec2_title, DOWN, buff=0.3)

        sub2_eq = MathTex(
            r"\frac{1.5}{8}", r"+",
            r"\frac{1.0}{v_2}", r"=",
            r"\frac{1.0 - 1.5}{-4}"
        ).scale(0.82)
        sub2_eq.next_to(sub2_params, DOWN, buff=0.3)

        sub2_step2 = MathTex(
            r"\frac{1.0}{v_2}", r"=",
            r"\frac{0.5}{4}", r"-", r"\frac{1.5}{8}",
            r"=", r"0.125 - 0.1875", r"=", r"-0.0625"
        ).scale(0.62)
        sub2_step2.next_to(sub2_eq, DOWN, buff=0.25)
        sub2_step2[6].set_color(RED)
        sub2_step2[8].set_color(RED)

        result2_lhs = MathTex(r"v_2", color=GREEN).scale(0.9)
        result2_eq = MathTex(r"=").scale(0.9)
        result2_rhs = MathTex(r"-16\,\mathrm{cm}", color=GREEN).scale(0.9)
        result2 = VGroup(result2_lhs, result2_eq, result2_rhs).arrange(RIGHT, buff=0.12)
        result2.next_to(sub2_step2, DOWN, buff=0.28)

        neg_note = Text("负号 → 像在第二面左侧（棒内/棒外方向与折射光相反）→ 虚像！",
                        font=CJK, color=RED).scale(0.36)
        neg_note.next_to(result2, DOWN, buff=0.2)

        self.play(FadeIn(sec2_title))
        self.play(FadeIn(sub2_params))
        self.wait(0.7)
        self.play(Write(sub2_eq))
        self.wait(0.8)
        self.play(Write(sub2_step2))
        self.wait(0.8)
        self.play(Write(result2))
        self.play(FadeIn(neg_note))
        self.wait(1.6)
        self.play(FadeOut(VGroup(sec2_title, sub2_params, sub2_eq, sub2_step2, neg_note)))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 9：虚像位置标注 + 延长线
        # ═══════════════════════════════════════════════════════════════════════
        # v2=-16 cm 表示从第二面往左 16 cm
        # 第二面 x = ROD_RIGHT；虚像 x = ROD_RIGHT - 16*SCALE
        v2_x = ROD_RIGHT - 16 * SCALE   # = 2.0 - 16*0.25 = 2.0 - 4.0 = -2.0

        # 虚像标记（空心星形用 Star 代替）
        virtual_image = Star(n=5, outer_radius=0.18, inner_radius=0.09,
                             color=RED, fill_opacity=0.0, stroke_width=2.5)
        virtual_image.move_to([v2_x, ROD_CY, 0])

        lbl_v2 = VGroup(
            MathTex(r"v_2", color=RED).scale(0.52),
            Text("=-16 cm（虚像）", font=CJK, color=RED).scale(0.33)
        ).arrange(RIGHT, buff=0.06)
        lbl_v2.next_to(virtual_image, UP, buff=0.18)

        # 折射后光线（在棒右侧发散，延长线反向汇聚至虚像）
        # 出射光：从 v1 出发（中间像真实汇聚），被第二面折射后发散
        # 取三条出射线：从 ROD_RIGHT 出发向右发散
        exit_directions = [(0.5, 0.18), (0.5, 0.0), (0.5, -0.18)]
        rays_exit = VGroup(*[
            Arrow(
                start=[ROD_RIGHT, ROD_CY + dy * 0, 0],
                end=[ROD_RIGHT + dx * 1.6, ROD_CY + dy * 1.2, 0],
                buff=0, color=ray_color, stroke_width=2.0,
                max_tip_length_to_length_ratio=0.18
            )
            for dx, dy in exit_directions
        ])

        # 延长线（虚线，向左反向延长至虚像点）
        ext_lines = VGroup(*[
            DashedLine(
                start=[ROD_RIGHT, ROD_CY + dy * 0, 0],
                end=[v2_x, ROD_CY, 0],
                color=RED, stroke_width=1.8
            )
            for _, dy in exit_directions
        ])

        cap9 = Text("出射光（实线）发散，向左延长（虚线）汇聚于虚像", font=CJK, color=WHITE).scale(0.38)
        cap9.to_edge(DOWN, buff=0.5)

        self.play(FadeOut(result2))
        self.play(Create(rays_exit), Create(ext_lines))
        self.play(FadeIn(virtual_image), FadeIn(lbl_v2))
        self.play(FadeIn(cap9))
        self.wait(1.8)
        self.play(FadeOut(cap9))

        # ═══════════════════════════════════════════════════════════════════════
        # Step 10：公式汇总高亮
        # ═══════════════════════════════════════════════════════════════════════
        summary_title = Text("关键公式汇总", font=CJK, color=BLUE).scale(0.48)
        summary_title.next_to(title, DOWN, buff=0.35)

        eq_label1 = Text("第一面：", font=CJK, color=YELLOW).scale(0.4)
        eq1 = MathTex(
            r"\frac{1.0}{\infty}+\frac{1.5}{v_1}=\frac{0.5}{4}",
            r"\Rightarrow v_1=12\,\mathrm{cm}",
            color=YELLOW
        ).scale(0.65)
        row1 = VGroup(eq_label1, eq1).arrange(RIGHT, buff=0.18)

        eq_label2 = Text("第二面：", font=CJK, color=GREEN).scale(0.4)
        eq2 = MathTex(
            r"\frac{1.5}{8}+\frac{1.0}{v_2}=\frac{-0.5}{-4}",
            r"\Rightarrow v_2=-16\,\mathrm{cm}",
            color=GREEN
        ).scale(0.65)
        row2 = VGroup(eq_label2, eq2).arrange(RIGHT, buff=0.18)

        concl_zh = Text("结论：最终成虚像，在第二面左侧 16 cm（棒外左方）", font=CJK, color=RED).scale(0.4)

        summary_block = VGroup(row1, row2, concl_zh).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        summary_block.next_to(summary_title, DOWN, buff=0.38)
        summary_block.scale_to_fit_width(12.5)

        box = SurroundingRectangle(summary_block, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(summary_title))
        self.play(Write(row1))
        self.wait(0.7)
        self.play(Write(row2))
        self.wait(0.7)
        self.play(FadeIn(concl_zh), Create(box))
        self.wait(2.0)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 11：物理意义解读
        # ═══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(summary_title, summary_block, box)))

        phys_title = Text("物理意义", font=CJK, color=BLUE).scale(0.48)
        phys_title.next_to(title, DOWN, buff=0.35)

        p1 = Text("① 平行光（物在无穷远）经第一凸面折射：向内会聚，", font=CJK).scale(0.41)
        p2 = VGroup(
            Text("   中间像在棒内 12 cm 处（实像中间体）", font=CJK, color=GREEN).scale(0.41)
        )
        p3 = Text("② 中间像再次被第二面（对光线凹面）折射：光线发散，", font=CJK).scale(0.41)
        p4 = VGroup(
            Text("   负像距 v2=-16 cm 意味着虚像在棒的左侧", font=CJK, color=RED).scale(0.41)
        )
        p5 = Text("③ 虚像：出射光线本身不经过该点，仅延长线相交于此。", font=CJK, color=ORANGE).scale(0.41)

        phys_block = VGroup(p1, p2, p3, p4, p5).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        phys_block.next_to(phys_title, DOWN, buff=0.35)
        phys_block.scale_to_fit_width(13)

        self.play(FadeIn(phys_title))
        for item in [p1, p2, p3, p4, p5]:
            self.play(FadeIn(item))
            self.wait(0.7)
        self.wait(1.5)

        # ═══════════════════════════════════════════════════════════════════════
        # Step 12：小结卡
        # ═══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(phys_title, phys_block)))
        all_diagram = VGroup(
            rod_group, rays_in, rays_refracted,
            dot_v1, lbl_v1, u2_arrow, lbl_u2,
            rays_exit, ext_lines, virtual_image, lbl_v2
        )
        self.play(FadeOut(all_diagram), FadeOut(diagram_label))

        final_title = Text("本节小结：逐次成像法", font=CJK, color=BLUE).scale(0.54)
        final_title.next_to(title, DOWN, buff=0.4)

        s_formula = MathTex(
            r"\frac{n_1}{u}+\frac{n_2}{v}=\frac{n_2-n_1}{r}",
            color=YELLOW
        ).scale(0.85)

        s1_zh = Text("步骤一：对第一球面用折射公式求", font=CJK, color=WHITE).scale(0.42)
        s1_m = MathTex(r"v_1", color=GREEN).scale(0.72)
        s1 = VGroup(s1_zh, s1_m).arrange(RIGHT, buff=0.1)

        s2_zh = Text("步骤二：令", font=CJK, color=WHITE).scale(0.42)
        s2_m = MathTex(r"u_2 = d - v_1", color=YELLOW).scale(0.72)
        s2_zh2 = Text("，注意符号规则", font=CJK, color=WHITE).scale(0.42)
        s2 = VGroup(s2_zh, s2_m, s2_zh2).arrange(RIGHT, buff=0.1)

        s3_zh = Text("步骤三：对第二球面求", font=CJK, color=WHITE).scale(0.42)
        s3_m = MathTex(r"v_2", color=GREEN).scale(0.72)
        s3_zh2 = Text("，负值表示虚像", font=CJK, color=RED).scale(0.42)
        s3 = VGroup(s3_zh, s3_m, s3_zh2).arrange(RIGHT, buff=0.1)

        s_result = VGroup(
            MathTex(r"v_1=12\,\mathrm{cm}", color=GREEN).scale(0.75),
            MathTex(r"v_2=-16\,\mathrm{cm}", color=RED).scale(0.75)
        ).arrange(RIGHT, buff=0.6)

        summary_final = VGroup(s_formula, s1, s2, s3, s_result).arrange(DOWN, buff=0.3)
        summary_final.next_to(final_title, DOWN, buff=0.38)
        summary_final.scale_to_fit_width(12)

        box_final = SurroundingRectangle(summary_final, color=BLUE, buff=0.3, corner_radius=0.12)

        self.play(FadeIn(final_title))
        self.play(Write(s_formula))
        self.wait(0.6)
        for item in [s1, s2, s3]:
            self.play(FadeIn(item))
            self.wait(0.5)
        self.play(Write(s_result))
        self.play(Create(box_final))
        self.wait(2.2)

        self.play(FadeOut(VGroup(title, final_title, summary_final, box_final)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch10Ex2GlassRodTwoSurfaceImaging",
        "id": "phys-ch10-10.1-ex2-glass-rod-two-surface-imaging",
        "chapterId": "ch10",
        "sectionId": "10.1",
        "title": "玻璃棒双球面逐次成像",
        "description": "平行光经折射率1.5、棒长20cm玻璃棒的两个球面依次折射，逐步推导中间像v1=12cm及最终虚像v2=-16cm的位置。",
    }
]
