"""第 5.1 节 · 能量均分定理与分子自由度（知识点 KP4）

三段式教学动画：
  场景一：单原子分子（He），3 个平动自由度，总能 (3/2)kT
  场景二：刚性双原子分子（N2），5 个自由度（3平+2转），总能 (5/2)kT
  场景三：刚性三原子分子（CO2），6 个自由度，ValueTracker 扫 i 演示 U=(i/2)RT
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ─────────────────────────────────────────────────────────────────────────────
# 辅助函数
# ─────────────────────────────────────────────────────────────────────────────

def make_dof_label(text_cn, formula_str, color=WHITE, font_size=22):
    """返回「中文标签 + 公式」横排 VGroup。"""
    zh = Text(text_cn, font=CJK, font_size=font_size, color=color)
    tex = MathTex(formula_str, color=color).scale(0.65)
    return VGroup(zh, tex).arrange(RIGHT, buff=0.15)


def energy_row(label_cn, formula_str, color=WHITE):
    """单行：中文说明 + 能量公式。"""
    zh = Text(label_cn, font=CJK, font_size=20, color=color)
    tex = MathTex(formula_str, color=color).scale(0.6)
    return VGroup(zh, tex).arrange(RIGHT, buff=0.2)


# ─────────────────────────────────────────────────────────────────────────────
class Ch05Kp4EnergyEquipartitionDegreesOfFreedom(Scene):
    def construct(self):
        # ── Step 1 · 标题 ────────────────────────────────────────────────────
        title = Text("能量均分定理与分子自由度", font=CJK, color=BLUE).scale(0.68).to_edge(UP)
        subtitle = Text("第五章 分子动理论 · 5.1", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2 · 生活类比引入 ────────────────────────────────────────────
        a1 = Text("温度升高时，气体分子运动更剧烈——", font=CJK).scale(0.48)
        a2 = Text("每种「运动方式」平均分得相同的能量：", font=CJK).scale(0.48)
        a3 = Text("这就是能量均分定理。", font=CJK, color=YELLOW).scale(0.5)
        analogy = VGroup(a1, a2, a3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(a1))
        self.wait(0.6)
        self.play(FadeIn(a2))
        self.wait(0.6)
        self.play(FadeIn(a3))
        self.wait(1.5)
        self.play(FadeOut(analogy))

        # ── Step 3 · 能量均分定理定义 ────────────────────────────────────────
        def_title = Text("能量均分定理", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.5)
        d1 = Text("每个自由度的平均动能 =", font=CJK, font_size=22)
        d1_tex = MathTex(r"\frac{1}{2}kT", color=YELLOW).scale(0.9)
        d1_row = VGroup(d1, d1_tex).arrange(RIGHT, buff=0.2)

        d2_tex = MathTex(r"\overline{E} = \frac{i}{2}kT", color=YELLOW).scale(1.0)
        d2_note = Text("（i = 分子自由度数）", font=CJK, font_size=20, color=WHITE)
        d2_row = VGroup(d2_tex, d2_note).arrange(RIGHT, buff=0.25)

        defs = VGroup(d1_row, d2_row).arrange(DOWN, buff=0.45).next_to(def_title, DOWN, buff=0.4)

        self.play(FadeIn(def_title))
        self.play(Write(d1_row))
        self.wait(1.0)
        self.play(TransformMatchingTex(d1_tex.copy(), d2_tex), FadeIn(d2_note))
        self.wait(1.5)
        self.play(FadeOut(VGroup(def_title, defs)))

        # ═══════════════════════════════════════════════════════════════════
        # ── Step 4 · 场景一：单原子分子 He ──────────────────────────────────
        # ═══════════════════════════════════════════════════════════════════
        sec1 = Text("场景一：单原子分子（He）", font=CJK, color=ORANGE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec1))
        self.wait(0.6)

        # 绘制 He 原子球
        he_ball = Circle(radius=0.42, color=CYAN, fill_opacity=0.85, fill_color=CYAN)
        he_label = Text("He", font=CJK, font_size=20, color=WHITE).move_to(he_ball)
        he_atom = VGroup(he_ball, he_label).move_to(LEFT * 3.2 + DOWN * 0.5)
        self.play(GrowFromCenter(he_ball), FadeIn(he_label))
        self.wait(0.5)

        center = he_atom.get_center()

        # 三个平动方向箭头
        ax_x = Arrow(center, center + RIGHT * 1.4, color=RED, buff=0, stroke_width=4)
        ax_y = Arrow(center, center + UP * 1.4, color=GREEN, buff=0, stroke_width=4)
        # 用斜向箭头模拟 z 轴（2D 场景）
        ax_z = Arrow(center, center + (LEFT * 0.8 + DOWN * 0.8), color=BLUE, buff=0, stroke_width=4)

        lx = Text("x", font=CJK, font_size=18, color=RED)
        ly = Text("y", font=CJK, font_size=18, color=GREEN)
        lz = Text("z", font=CJK, font_size=18, color=BLUE)
        lx.next_to(ax_x.get_end(), RIGHT, buff=0.1)
        ly.next_to(ax_y.get_end(), UP, buff=0.1)
        lz.next_to(ax_z.get_end(), LEFT, buff=0.1)

        ex = MathTex(r"\frac{1}{2}kT", color=RED).scale(0.55).next_to(lx, RIGHT, buff=0.08)
        ey = MathTex(r"\frac{1}{2}kT", color=GREEN).scale(0.55).next_to(ly, RIGHT, buff=0.08)
        ez = MathTex(r"\frac{1}{2}kT", color=BLUE).scale(0.55).next_to(lz, DOWN, buff=0.08)

        self.play(GrowArrow(ax_x), FadeIn(lx, ex))
        self.wait(0.5)
        self.play(GrowArrow(ax_y), FadeIn(ly, ey))
        self.wait(0.5)
        self.play(GrowArrow(ax_z), FadeIn(lz, ez))
        self.wait(0.8)

        # 右侧累计框
        box_zh = Text("平动自由度", font=CJK, font_size=20, color=WHITE)
        box_i = MathTex(r"i = 3", color=YELLOW).scale(0.75)
        box_e = MathTex(r"\overline{E} = \frac{3}{2}kT", color=YELLOW).scale(0.8)
        box_u = Text("1 mol 内能：", font=CJK, font_size=18, color=WHITE)
        box_u_tex = MathTex(r"U = \frac{3}{2}RT", color=GREEN).scale(0.8)
        box_u_row = VGroup(box_u, box_u_tex).arrange(RIGHT, buff=0.15)

        info1 = VGroup(box_zh, box_i, box_e, box_u_row).arrange(DOWN, buff=0.28).move_to(RIGHT * 2.5 + DOWN * 0.5)
        rect1 = SurroundingRectangle(info1, color=CYAN, buff=0.25, corner_radius=0.12)

        self.play(FadeIn(info1), Create(rect1))
        self.wait(1.8)

        self.play(FadeOut(VGroup(he_atom, ax_x, ax_y, ax_z,
                                  lx, ly, lz, ex, ey, ez,
                                  info1, rect1, sec1)))

        # ═══════════════════════════════════════════════════════════════════
        # ── Step 5 · 场景二：刚性双原子分子 N2 ──────────────────────────────
        # ═══════════════════════════════════════════════════════════════════
        sec2 = Text("场景二：刚性双原子分子（N2）", font=CJK, color=ORANGE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec2))
        self.wait(0.5)

        # 哑铃形：两个球 + 连杆，水平摆放
        n_left = Circle(radius=0.32, color=BLUE_C, fill_opacity=0.85, fill_color=BLUE_C).move_to(LEFT * 3.8 + DOWN * 0.6)
        n_right = Circle(radius=0.32, color=BLUE_C, fill_opacity=0.85, fill_color=BLUE_C).move_to(LEFT * 2.5 + DOWN * 0.6)
        bond = Line(n_left.get_right(), n_right.get_left(), color=WHITE, stroke_width=4)
        nl = Text("N", font=CJK, font_size=16, color=WHITE).move_to(n_left)
        nr = Text("N", font=CJK, font_size=16, color=WHITE).move_to(n_right)
        n2_mol = VGroup(n_left, n_right, bond, nl, nr)

        self.play(GrowFromCenter(n_left), GrowFromCenter(n_right), Create(bond), FadeIn(nl, nr))
        self.wait(0.5)

        mol_center = VGroup(n_left, n_right).get_center()

        # 三个平动箭头（与 He 相同方向，从质心出发）
        p1 = Arrow(mol_center, mol_center + RIGHT * 1.3, color=RED, buff=0, stroke_width=3)
        p2 = Arrow(mol_center, mol_center + UP * 1.3, color=GREEN, buff=0, stroke_width=3)
        p3 = Arrow(mol_center, mol_center + (LEFT * 0.7 + DOWN * 0.7), color=BLUE, buff=0, stroke_width=3)
        px = Text("x", font=CJK, font_size=16, color=RED).next_to(p1.get_end(), RIGHT, buff=0.08)
        py = Text("y", font=CJK, font_size=16, color=GREEN).next_to(p2.get_end(), UP, buff=0.08)
        pz = Text("z", font=CJK, font_size=16, color=BLUE).next_to(p3.get_end(), LEFT, buff=0.08)

        self.play(GrowArrow(p1), GrowArrow(p2), GrowArrow(p3), FadeIn(px, py, pz))
        self.wait(0.6)

        # 两个转动弧形箭头（绕垂直于分子轴的轴）
        arc1 = Arc(radius=0.70, start_angle=PI / 2, angle=PI, arc_center=mol_center, color=YELLOW, stroke_width=3)
        arc1_tip = Arrow(arc1.get_end(), arc1.get_end() + RIGHT * 0.001,
                         buff=0, color=YELLOW, stroke_width=0, max_tip_length_to_length_ratio=0)
        # 用更简单的方式标注转动：两个弧形 VGroup
        arc_rot1 = ArcBetweenPoints(
            mol_center + UP * 0.75 + LEFT * 0.05,
            mol_center + DOWN * 0.75 + LEFT * 0.05,
            angle=-PI * 0.7, color=YELLOW, stroke_width=3
        )
        tip1 = Arrow(arc_rot1.get_end(), arc_rot1.get_end() + normalize(
            arc_rot1.get_end() - arc_rot1.point_from_proportion(0.9)) * 0.25,
                     buff=0, color=YELLOW, stroke_width=2, max_tip_length_to_length_ratio=0.5)

        arc_rot2 = ArcBetweenPoints(
            mol_center + UP * 0.75 + RIGHT * 0.05,
            mol_center + DOWN * 0.75 + RIGHT * 0.05,
            angle=PI * 0.7, color=YELLOW, stroke_width=3
        )
        tip2 = Arrow(arc_rot2.get_end(), arc_rot2.get_end() + normalize(
            arc_rot2.get_end() - arc_rot2.point_from_proportion(0.9)) * 0.25,
                     buff=0, color=YELLOW, stroke_width=2, max_tip_length_to_length_ratio=0.5)

        rot_label1 = Text("转动1", font=CJK, font_size=14, color=YELLOW).next_to(arc_rot1, LEFT, buff=0.1)
        rot_label2 = Text("转动2", font=CJK, font_size=14, color=YELLOW).next_to(arc_rot2, RIGHT, buff=0.1)

        self.play(Create(arc_rot1), Create(arc_rot2), FadeIn(tip1, tip2, rot_label1, rot_label2))
        self.wait(0.6)

        # 分子轴方向转动：红叉标注「不计」
        cross_h = Line(mol_center + LEFT * 0.18 + UP * 0.18,
                       mol_center + RIGHT * 0.18 + DOWN * 0.18, color=RED, stroke_width=4)
        cross_v = Line(mol_center + LEFT * 0.18 + DOWN * 0.18,
                       mol_center + RIGHT * 0.18 + UP * 0.18, color=RED, stroke_width=4)
        cross = VGroup(cross_h, cross_v).shift(DOWN * 0.05)
        no_label = Text("沿轴转动线度≈0，不计", font=CJK, font_size=14, color=RED)
        no_label.next_to(cross, DOWN, buff=0.15)

        self.play(Create(cross_h), Create(cross_v))
        self.play(FadeIn(no_label))
        self.wait(0.8)

        # 右侧信息框
        i5_zh = Text("平动 3 + 转动 2", font=CJK, font_size=18)
        i5_eq = MathTex(r"i = 5", color=YELLOW).scale(0.75)
        e5 = MathTex(r"\overline{E} = \frac{5}{2}kT", color=YELLOW).scale(0.8)
        u5_zh = Text("1 mol 内能：", font=CJK, font_size=16)
        u5_tex = MathTex(r"U = \frac{5}{2}RT", color=GREEN).scale(0.8)
        u5_row = VGroup(u5_zh, u5_tex).arrange(RIGHT, buff=0.12)
        info2 = VGroup(i5_zh, i5_eq, e5, u5_row).arrange(DOWN, buff=0.25).move_to(RIGHT * 2.5 + DOWN * 0.55)
        rect2 = SurroundingRectangle(info2, color=YELLOW, buff=0.22, corner_radius=0.12)

        self.play(FadeIn(info2), Create(rect2))
        self.wait(2.0)

        self.play(FadeOut(VGroup(n2_mol, p1, p2, p3, px, py, pz,
                                  arc_rot1, arc_rot2, tip1, tip2, rot_label1, rot_label2,
                                  cross, no_label, info2, rect2, sec2)))

        # ═══════════════════════════════════════════════════════════════════
        # ── Step 6 · 场景三：刚性三原子 CO2，i=7 → 线型取 i=5，非线型 i=6
        #   本片按直线型 CO2 展示 i=5（非线型取 i=6 亦写出），最终用 i=6 示例
        # ═══════════════════════════════════════════════════════════════════
        sec3 = Text("场景三：刚性三原子分子（CO2，i=5）", font=CJK, color=ORANGE).scale(0.46).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(sec3))
        self.wait(0.5)

        # CO2 结构：O=C=O，直线形，3 球 + 2 键
        o1 = Circle(radius=0.28, color=RED_B, fill_opacity=0.85, fill_color=RED_B).move_to(LEFT * 4.0 + DOWN * 0.7)
        c_center_ball = Circle(radius=0.24, color=GREY, fill_opacity=0.95, fill_color=GREY).move_to(LEFT * 3.0 + DOWN * 0.7)
        o2 = Circle(radius=0.28, color=RED_B, fill_opacity=0.85, fill_color=RED_B).move_to(LEFT * 2.0 + DOWN * 0.7)
        b1 = Line(o1.get_right(), c_center_ball.get_left(), color=WHITE, stroke_width=4)
        b2 = Line(c_center_ball.get_right(), o2.get_left(), color=WHITE, stroke_width=4)
        ol1 = Text("O", font=CJK, font_size=14, color=WHITE).move_to(o1)
        cl = Text("C", font=CJK, font_size=14, color=WHITE).move_to(c_center_ball)
        ol2 = Text("O", font=CJK, font_size=14, color=WHITE).move_to(o2)
        co2_mol = VGroup(o1, c_center_ball, o2, b1, b2, ol1, cl, ol2)

        self.play(GrowFromCenter(o1), GrowFromCenter(c_center_ball), GrowFromCenter(o2),
                  Create(b1), Create(b2), FadeIn(ol1, cl, ol2))
        self.wait(0.5)

        co2_center = VGroup(o1, c_center_ball, o2).get_center()

        # 逐一累加 (1/2)kT × i
        rows = VGroup()
        labels_data = [
            ("平动 x", RED),
            ("平动 y", GREEN),
            ("平动 z", BLUE),
            ("转动 1", YELLOW),
            ("转动 2", YELLOW),
        ]
        for k, (lbl, clr) in enumerate(labels_data):
            zh = Text(lbl, font=CJK, font_size=18, color=clr)
            tex = MathTex(r"\frac{1}{2}kT", color=clr).scale(0.6)
            row = VGroup(zh, tex).arrange(RIGHT, buff=0.2)
            rows.add(row)
        rows.arrange(DOWN, buff=0.18).move_to(RIGHT * 2.8 + DOWN * 0.4)

        for k, row in enumerate(rows):
            self.play(FadeIn(row))
            self.wait(0.4)

        # 总计
        total_zh = Text("合计（i=5）：", font=CJK, font_size=18, color=WHITE)
        total_tex = MathTex(r"\overline{E} = \frac{5}{2}kT", color=GREEN).scale(0.75)
        total_row = VGroup(total_zh, total_tex).arrange(RIGHT, buff=0.15)
        total_row.next_to(rows, DOWN, buff=0.28)
        self.play(Write(total_tex), FadeIn(total_zh))
        self.wait(1.0)

        # 同时展示一般公式
        gen_tex = MathTex(r"\overline{E} = \frac{i}{2}kT", color=YELLOW).scale(0.85)
        gen_tex.next_to(total_row, DOWN, buff=0.32)
        self.play(Write(gen_tex))
        self.wait(1.2)

        self.play(FadeOut(VGroup(co2_mol, rows, total_row, gen_tex, sec3)))

        # ═══════════════════════════════════════════════════════════════════
        # ── Step 7 · ValueTracker：扫动 i，动态显示 U=(i/2)RT ─────────────
        # ═══════════════════════════════════════════════════════════════════
        dyn_title = Text("内能随自由度 i 的变化", font=CJK, color=BLUE).scale(0.5).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(dyn_title))

        # 坐标轴
        axes = Axes(
            x_range=[2.5, 7, 1], y_range=[0, 4.5, 1],
            x_length=6.5, y_length=3.2,
            axis_config={"color": WHITE, "include_tip": True, "include_numbers": True},
        ).shift(DOWN * 0.8)

        x_lbl = MathTex(r"i", color=WHITE).scale(0.7).next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)
        y_lbl = MathTex(r"\frac{U}{RT}", color=WHITE).scale(0.65).next_to(axes.y_axis.get_end(), UP, buff=0.12)
        self.play(Create(axes), FadeIn(x_lbl, y_lbl))
        self.wait(0.5)

        # ValueTracker
        i_tracker = ValueTracker(3.0)

        # 动态曲线（直线 U/RT = i/2）
        line_curve = always_redraw(lambda: axes.plot(
            lambda x: x / 2,
            x_range=[2.5, i_tracker.get_value()],
            color=YELLOW,
            stroke_width=3,
        ))

        # 动态点
        dyn_dot = always_redraw(lambda: Dot(
            axes.c2p(i_tracker.get_value(), i_tracker.get_value() / 2),
            color=GREEN, radius=0.1
        ))

        # 动态读数
        readout = always_redraw(lambda: MathTex(
            rf"i={i_tracker.get_value():.1f},\quad U = \frac{{{i_tracker.get_value():.1f}}}{{2}}RT",
            color=CYAN
        ).scale(0.55).to_corner(UR, buff=0.55))

        # 标注三类分子
        marker_he = always_redraw(lambda: VGroup(
            Dot(axes.c2p(3, 1.5), color=CYAN, radius=0.07),
            MathTex(r"\text{He}", color=CYAN).scale(0.5).next_to(axes.c2p(3, 1.5), UP, buff=0.1)
        ))
        marker_n2 = always_redraw(lambda: VGroup(
            Dot(axes.c2p(5, 2.5), color=RED, radius=0.07),
            MathTex(r"\text{N}_2", color=RED).scale(0.5).next_to(axes.c2p(5, 2.5), UP, buff=0.1)
        ))
        marker_co2 = always_redraw(lambda: VGroup(
            Dot(axes.c2p(5, 2.5), color=ORANGE, radius=0.07),
        ))

        self.add(line_curve, dyn_dot, readout, marker_he)
        self.wait(0.5)
        self.play(i_tracker.animate.set_value(3.0), run_time=0.5)
        self.play(i_tracker.animate.set_value(6.0), run_time=3.5)
        self.wait(0.5)
        self.add(marker_n2)
        self.play(i_tracker.animate.set_value(5.0), run_time=1.2)
        self.wait(0.5)
        self.play(i_tracker.animate.set_value(6.0), run_time=1.2)
        self.wait(1.0)

        self.play(FadeOut(VGroup(axes, x_lbl, y_lbl, line_curve, dyn_dot,
                                  readout, marker_he, marker_n2, dyn_title)))

        # ═══════════════════════════════════════════════════════════════════
        # ── Step 8 · 小结卡 ───────────────────────────────────────────────
        # ═══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(s_title))

        row1_zh = Text("每自由度平均能量：", font=CJK, font_size=22)
        row1_tex = MathTex(r"\frac{1}{2}kT", color=YELLOW).scale(0.9)
        row1 = VGroup(row1_zh, row1_tex).arrange(RIGHT, buff=0.2)

        row2_tex = MathTex(r"\overline{E} = \frac{i}{2}kT", color=YELLOW).scale(0.9)

        row3_tex = MathTex(r"U = \frac{M}{\mu}\cdot\frac{i}{2}RT", color=GREEN).scale(0.88)

        table_data = [
            ("单原子（He）",  "3", "0", "3"),
            ("双原子（N2）",  "3", "2", "5"),
            ("直线三原子",    "3", "2", "5"),
            ("非直线三原子",  "3", "3", "6"),
        ]
        col_headers = [
            Text("分子类型", font=CJK, font_size=17, color=CYAN),
            Text("平动", font=CJK, font_size=17, color=CYAN),
            Text("转动", font=CJK, font_size=17, color=CYAN),
            Text("i", font=CJK, font_size=17, color=CYAN),
        ]
        hdr_row = VGroup(*col_headers).arrange(RIGHT, buff=0.55)
        table_rows = [hdr_row]
        for row_data in table_data:
            cells = [Text(cell, font=CJK, font_size=15, color=WHITE) for cell in row_data]
            table_rows.append(VGroup(*cells).arrange(RIGHT, buff=0.55))
        tbl = VGroup(*table_rows).arrange(DOWN, buff=0.18, aligned_edge=LEFT)

        summary = VGroup(row1, row2_tex, row3_tex, tbl).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.4).scale_to_fit_width(12.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(row1), run_time=0.8)
        self.wait(0.4)
        self.play(Write(row2_tex), run_time=0.8)
        self.wait(0.4)
        self.play(Write(row3_tex), run_time=0.8)
        self.wait(0.4)
        self.play(FadeIn(tbl), Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box)))
        self.wait(0.3)


# ─────────────────────────────────────────────────────────────────────────────
REGISTER = [
    {
        "scene": "Ch05Kp4EnergyEquipartitionDegreesOfFreedom",
        "id": "phys-ch05-5.1-kp4-energy-equipartition-degrees-of-freedom",
        "chapterId": "ch05",
        "sectionId": "5.1",
        "title": "能量均分定理与分子自由度",
        "description": "通过单原子、双原子、三原子分子三段式动画，演示各类分子自由度划分与能量均分定理，并用 ValueTracker 动态展示 U=(i/2)RT 随 i 变化的曲线。",
    }
]
