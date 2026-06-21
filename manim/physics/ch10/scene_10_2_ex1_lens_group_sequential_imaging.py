"""第 10.2 节 · 例题：双透镜组逐次成像（实物与虚物）

教学目标：让零基础读者真正理解「虚物」的物理含义 ——
当会聚光束尚未汇聚就被第二枚透镜拦截时，对第二枚透镜而言物距为负（虚物）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 颜色常量 ────────────────────────────────────────────────────────────────
COL_L1 = BLUE
COL_L2 = GREEN
COL_OBJ = ORANGE
COL_IMG = YELLOW
COL_VIRT = RED
COL_RAY = CYAN
COL_RAY2 = "#FF88FF"


# ─── 辅助：绘制薄透镜（竖直双箭头符号）────────────────────────────────────
def make_lens(center, height=2.4, color=BLUE):
    """返回表示凸透镜的 VGroup（竖线 + 上下双箭头）。"""
    body = Line(center + UP * height / 2, center + DOWN * height / 2, color=color, stroke_width=3)
    tip_u = Arrow(center + UP * (height / 2 - 0.35), center + UP * height / 2,
                  buff=0, color=color, stroke_width=3,
                  max_tip_length_to_length_ratio=0.35)
    tip_d = Arrow(center + DOWN * (height / 2 - 0.35), center + DOWN * height / 2,
                  buff=0, color=color, stroke_width=3,
                  max_tip_length_to_length_ratio=0.35)
    return VGroup(body, tip_u, tip_d)


class Ch10Ex1LensGroupSequentialImaging(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("双透镜组逐次成像（实物与虚物）", font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.2 · 例题精讲", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2  生活类比：放大镜接力
        # ════════════════════════════════════════════════════════════════════
        ana1 = Text("想象用两片放大镜接力：第一片先成一个像，", font=CJK).scale(0.46)
        ana2 = Text("第二片再对那个像继续放大——两次都用同一公式，只需找好「物」在哪。",
                    font=CJK).scale(0.46)
        ana3 = Text("麻烦在于：若第二片抢在光汇聚前先拦住，「物」就跑到了透镜后面，",
                    font=CJK).scale(0.46)
        ana4 = Text("这就是「虚物」，物距带负号，仍然套同一公式即可。",
                    font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55).scale_to_fit_width(12.5)
        for line in ana:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3  公式定义（逐步出现 + 高亮）
        # ════════════════════════════════════════════════════════════════════
        def_title = Text("逐次成像公式", font=CJK, color=BLUE).scale(0.52)
        def_title.next_to(title, DOWN, buff=0.45)

        eq1_label = Text("第一枚透镜", font=CJK, color=COL_L1).scale(0.44)
        eq1 = MathTex(r"\frac{1}{u_1}+\frac{1}{v_1}=\frac{1}{f_1}").scale(0.88)
        row1 = VGroup(eq1_label, eq1).arrange(RIGHT, buff=0.3)

        eq2_label = Text("中间物距", font=CJK, color=WHITE).scale(0.44)
        eq2 = MathTex(r"u_2 = d - v_1").scale(0.88)
        row2 = VGroup(eq2_label, eq2).arrange(RIGHT, buff=0.3)

        eq3_label = Text("第二枚透镜", font=CJK, color=COL_L2).scale(0.44)
        eq3 = MathTex(r"\frac{1}{u_2}+\frac{1}{v_2}=\frac{1}{f_2}").scale(0.88)
        row3 = VGroup(eq3_label, eq3).arrange(RIGHT, buff=0.3)

        eqs = VGroup(row1, row2, row3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        eqs.next_to(def_title, DOWN, buff=0.40).scale_to_fit_width(12.0)

        eq1[0][6:8].set_color(YELLOW)   # v_1 高亮
        eq2[0][3:6].set_color(YELLOW)   # v_1 in u_2
        eq3[0].set_color(GREEN)

        self.play(FadeIn(def_title))
        self.play(Write(row1))
        self.wait(0.9)
        self.play(Write(row2))
        self.wait(0.9)
        self.play(Write(row3))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_title, eqs)))

        # ════════════════════════════════════════════════════════════════════
        # Step 4  情况 A：d = 70 cm，P1 在 L2 左侧 → 实物
        # ════════════════════════════════════════════════════════════════════
        case_a_banner = Text("情况 A：d = 70 cm，P1 为实物（在 L2 左侧）",
                             font=CJK, color=ORANGE).scale(0.50)
        case_a_banner.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(case_a_banner))
        self.wait(0.8)

        # ── 数值推导：情况 A ────────────────────────────────────────────────
        # u1=20, f1=15 → 1/v1 = 1/15 - 1/20 = 4/60-3/60 = 1/60 → v1=60
        # u2 = 70 - 60 = 10 > 0  实物
        # 1/v2 = 1/25 - 1/10 = 2/50-5/50 = -3/50 → v2 = -50/3 ≈ -16.7  虚像

        calc_a1 = MathTex(
            r"\frac{1}{u_1}+\frac{1}{v_1}=\frac{1}{f_1}",
            r"\Rightarrow",
            r"\frac{1}{v_1}=\frac{1}{15}-\frac{1}{20}=\frac{1}{60}",
            r"\Rightarrow v_1=60\ \mathrm{cm}"
        ).scale(0.70)
        calc_a1.next_to(case_a_banner, DOWN, buff=0.35).scale_to_fit_width(12.5)
        calc_a1[3].set_color(YELLOW)

        calc_a2 = MathTex(
            r"u_2 = d - v_1 = 70 - 60 = 10\ \mathrm{cm}",
            r"\ >0\ \text{(real object)}"
        ).scale(0.72)
        calc_a2.next_to(calc_a1, DOWN, buff=0.28).scale_to_fit_width(12.5)
        calc_a2[0].set_color(GREEN)

        calc_a3 = MathTex(
            r"\frac{1}{v_2}=\frac{1}{25}-\frac{1}{10}=-\frac{3}{50}",
            r"\Rightarrow v_2\approx -16.7\ \mathrm{cm}"
        ).scale(0.72)
        calc_a3.next_to(calc_a2, DOWN, buff=0.28).scale_to_fit_width(12.5)
        calc_a3[1].set_color(YELLOW)

        note_a = Text("v₂ < 0：像在 L2 左侧，为虚像（光线发散，不能在屏上呈现）",
                      font=CJK, color=RED).scale(0.43)
        note_a.next_to(calc_a3, DOWN, buff=0.25)

        self.play(Write(calc_a1))
        self.wait(1.0)
        self.play(Write(calc_a2))
        self.wait(0.9)
        self.play(Write(calc_a3))
        self.wait(0.9)
        self.play(FadeIn(note_a))
        self.wait(1.5)
        self.play(FadeOut(VGroup(case_a_banner, calc_a1, calc_a2, calc_a3, note_a)))

        # ════════════════════════════════════════════════════════════════════
        # Step 5  情况 A 光路图
        # ════════════════════════════════════════════════════════════════════
        diag_title_a = Text("光路图 · 情况 A（d = 70 cm）", font=CJK, color=ORANGE).scale(0.48)
        diag_title_a.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(diag_title_a))

        # 坐标：水平光轴，单位 0.1 cm/像素 → 放大：1 px = 3 cm
        # 物体在 L1 左 20 cm，L1 位于 x=0，L2 位于 x=+70cm
        # 屏幕宽约 14 单位 → 以 1单位=10cm 映射，缩放因子 s
        s = 0.09  # 单位映射：1 Manim unit = 1/s cm  =>  s=0.09 → 1 unit ≈ 11 cm
        # 位置（Manim units）
        x_L1 = 0.0
        x_L2 = 70 * s   # 6.3

        x_obj = -20 * s   # -1.8
        x_v1 = 60 * s     # 5.4  (L1右60)
        x_u2 = x_L2 - 10 * s  # = 60*s = 5.4   same as v1
        x_v2 = x_L2 - 16.7 * s  # L2 左侧 16.7 → x = 6.3 - 1.503 = 4.797

        y_axis = -1.0     # 光轴 y 坐标
        h_obj = 0.9       # 物体高度

        # 光轴
        axis_a = Line(LEFT * 3.0 + UP * y_axis, RIGHT * 3.8 + UP * y_axis,
                      color=GRAY, stroke_width=1.5)
        axis_a.shift(DOWN * 0.5)

        def xp(x_cm):  # x_cm → Manim x，以 L1 为原点，整体下移 0.5
            return x_cm * s - 3.0 + 0.0  # offset so L1 at x=-3+0=centered

        # 重新以屏幕居中布置：L1 在 x=-2.8, L2 在 x=3.5 (d=70cm, s=0.09)
        # 让 L1 在 x = -2.5, L2 在 x = -2.5 + 70*s
        ox = -3.2  # L1 x
        L2x = ox + 70 * s  # = -3.2 + 6.3 = 3.1
        ay = -0.8  # axis y

        axis_line = Line(np.array([ox - 1.0, ay, 0]), np.array([L2x + 1.2, ay, 0]),
                         color=GRAY, stroke_width=1.5)

        lens1 = make_lens(np.array([ox, ay, 0]), height=1.9, color=COL_L1)
        lens2 = make_lens(np.array([L2x, ay, 0]), height=1.9, color=COL_L2)

        lbl_L1 = VGroup(
            Text("L", font=CJK, color=COL_L1).scale(0.35),
            MathTex(r"_1", color=COL_L1).scale(0.45)
        ).arrange(RIGHT, buff=0.02)
        lbl_L1.next_to(np.array([ox, ay + 1.0, 0]), UP, buff=0.08)

        lbl_L2 = VGroup(
            Text("L", font=CJK, color=COL_L2).scale(0.35),
            MathTex(r"_2", color=COL_L2).scale(0.45)
        ).arrange(RIGHT, buff=0.02)
        lbl_L2.next_to(np.array([L2x, ay + 1.0, 0]), UP, buff=0.08)

        # f 标注
        lbl_f1 = VGroup(
            MathTex(r"f_1", color=COL_L1).scale(0.40),
            Text("=15cm", font=CJK, color=COL_L1).scale(0.32)
        ).arrange(RIGHT, buff=0.05)
        lbl_f1.move_to(np.array([ox, ay - 1.1, 0]))

        lbl_f2 = VGroup(
            MathTex(r"f_2", color=COL_L2).scale(0.40),
            Text("=25cm", font=CJK, color=COL_L2).scale(0.32)
        ).arrange(RIGHT, buff=0.05)
        lbl_f2.move_to(np.array([L2x, ay - 1.1, 0]))

        # 物体箭头
        obj_x = ox - 20 * s
        obj_arrow = Arrow(np.array([obj_x, ay, 0]), np.array([obj_x, ay + h_obj, 0]),
                          buff=0, color=COL_OBJ, stroke_width=3,
                          max_tip_length_to_length_ratio=0.3)
        lbl_obj = Text("物 u₁=20", font=CJK, color=COL_OBJ).scale(0.32)
        lbl_obj.next_to(obj_arrow, LEFT, buff=0.05)

        # P1 中间像（L1 右 60cm = L2 左 10cm）
        p1_x = ox + 60 * s
        p1_arrow = Arrow(np.array([p1_x, ay, 0]), np.array([p1_x, ay + h_obj * 1.3, 0]),
                         buff=0, color=YELLOW, stroke_width=2.5,
                         max_tip_length_to_length_ratio=0.28)
        lbl_p1 = Text("P₁  v₁=60", font=CJK, color=YELLOW).scale(0.30)
        lbl_p1.next_to(p1_arrow, RIGHT, buff=0.05)

        # 虚像 P2（L2 左侧 16.7 cm）
        vimg_x = L2x - 16.7 * s
        vimg_arrow = DashedLine(np.array([vimg_x, ay, 0]),
                                np.array([vimg_x, ay + h_obj * 0.8, 0]),
                                color=RED, stroke_width=2.5, dash_length=0.06)
        lbl_vimg = Text("虚像 v₂≈-16.7", font=CJK, color=RED).scale(0.29)
        lbl_vimg.next_to(np.array([vimg_x, ay + 0.85, 0]), LEFT, buff=0.05)

        # 光线：三条标准光线从物经 L1 汇聚到 P1
        tip_obj = np.array([obj_x, ay + h_obj, 0])
        tip_p1 = np.array([p1_x, ay + h_obj * 1.3, 0])
        # 平行轴光线 → 经 L1 焦点偏折
        f1_r = ox + 15 * s
        ray1_a = Line(tip_obj, np.array([ox, ay + h_obj, 0]), color=COL_RAY, stroke_width=1.5)
        ray1_b = Line(np.array([ox, ay + h_obj, 0]), tip_p1, color=COL_RAY, stroke_width=1.5)
        # 过光心不偏折
        ray2 = Line(tip_obj, tip_p1, color=COL_RAY2, stroke_width=1.5)

        # P1 到 L2 发散（因 P1 在 L2 左，为实物，会聚）
        # 从 P1 出发经 L2 后发散（虚像）
        tip_vimg = np.array([vimg_x, ay + h_obj * 0.8, 0])
        ray3_a = Line(tip_p1, np.array([L2x, ay + h_obj * 1.3 * (L2x - p1_x) / (p1_x - vimg_x + (L2x - p1_x)), 0]),
                      color=COL_RAY, stroke_width=1.5)

        # 简化光线：直接从 P1 画至 L2 再延伸至屏外（实线），虚线延伸到虚像
        # 入射光 P1→L2 顶端
        L2_hit_y = ay + h_obj * 0.6
        ray_in = Line(tip_p1, np.array([L2x, L2_hit_y, 0]),
                      color=COL_RAY, stroke_width=1.5)
        # 折射后发散出射（向右上延伸），实际成虚像
        ext_x = L2x + 0.9
        ext_slope = (L2_hit_y - ay) / (L2x - vimg_x)
        ext_y = L2_hit_y + ext_slope * 0.9
        ray_out = Line(np.array([L2x, L2_hit_y, 0]), np.array([ext_x, ext_y, 0]),
                       color=COL_RAY, stroke_width=1.5)
        # 虚线延长回 L2 左侧找虚像
        ray_virt = DashedLine(np.array([L2x, L2_hit_y, 0]),
                              tip_vimg,
                              color=RED, stroke_width=1.5, dash_length=0.08)

        note_real_obj = Text("实物 → 虚像（v₂<0，像在 L2 左侧）",
                             font=CJK, color=RED).scale(0.40)
        note_real_obj.to_edge(DOWN, buff=0.45)

        diag_a_grp = VGroup(
            axis_line, lens1, lens2, lbl_L1, lbl_L2, lbl_f1, lbl_f2,
            obj_arrow, lbl_obj, p1_arrow, lbl_p1,
            vimg_arrow, lbl_vimg,
            ray1_a, ray1_b, ray2, ray_in, ray_out, ray_virt
        )

        self.play(Create(axis_line), Create(lens1), Create(lens2))
        self.play(FadeIn(lbl_L1), FadeIn(lbl_L2), FadeIn(lbl_f1), FadeIn(lbl_f2))
        self.wait(0.5)
        self.play(GrowArrow(obj_arrow), FadeIn(lbl_obj))
        self.wait(0.6)
        self.play(Create(ray1_a), Create(ray1_b), Create(ray2))
        self.wait(0.5)
        self.play(GrowArrow(p1_arrow), FadeIn(lbl_p1))
        self.wait(0.7)
        self.play(Create(ray_in), Create(ray_out), Create(ray_virt))
        self.play(Create(vimg_arrow), FadeIn(lbl_vimg))
        self.wait(0.6)
        self.play(FadeIn(note_real_obj))
        self.wait(1.8)

        # 清场
        self.play(FadeOut(VGroup(diag_a_grp, diag_title_a, note_real_obj)))
        self.wait(0.3)

        # ════════════════════════════════════════════════════════════════════
        # Step 6  情况 B：d = 45 cm，P1 在 L2 右侧 → 虚物（核心难点）
        # ════════════════════════════════════════════════════════════════════
        case_b_banner = Text("情况 B：d = 45 cm，P1 跑到 L2 右侧 → 虚物！",
                             font=CJK, color=RED).scale(0.50)
        case_b_banner.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(case_b_banner))
        self.wait(0.9)

        # 虚物讲解
        vobj_exp1 = Text("v₁ = 60 cm 不变（L1 与物没动）", font=CJK, color=WHITE).scale(0.45)
        vobj_exp2 = Text("但 d = 45 cm < v₁ = 60 cm：L2 在会聚点之前把光拦住了！",
                         font=CJK, color=ORANGE).scale(0.45)
        vobj_exp3 = Text("会聚光束若继续传播才能聚焦在 L2 右侧 15 cm 处 ——",
                         font=CJK).scale(0.45)
        vobj_exp4 = Text("对 L2 来说，「物」在它右边，物距为负：u₂ = 45 - 60 = -15 cm",
                         font=CJK, color=RED).scale(0.45)
        vobj_exp = VGroup(vobj_exp1, vobj_exp2, vobj_exp3, vobj_exp4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        vobj_exp.next_to(case_b_banner, DOWN, buff=0.38).scale_to_fit_width(12.5)
        for line in vobj_exp:
            self.play(FadeIn(line))
            self.wait(0.75)
        self.wait(1.0)
        self.play(FadeOut(vobj_exp))

        # ── 数值推导：情况 B ────────────────────────────────────────────────
        # u2 = 45 - 60 = -15 < 0 虚物
        # 1/v2 = 1/25 - 1/(-15) = 1/25 + 1/15 = 3/75 + 5/75 = 8/75
        # v2 = 75/8 = 9.375 ≈ 9.4 cm  实像

        calc_b1 = MathTex(
            r"u_2 = d - v_1 = 45 - 60 = -15\ \mathrm{cm}",
            r"\quad (<0,\ \text{virtual object})"
        ).scale(0.72)
        calc_b1.next_to(case_b_banner, DOWN, buff=0.38).scale_to_fit_width(12.5)
        calc_b1[0].set_color(RED)

        calc_b2 = MathTex(
            r"\frac{1}{v_2}=\frac{1}{f_2}-\frac{1}{u_2}=\frac{1}{25}-\frac{1}{-15}=\frac{1}{25}+\frac{1}{15}=\frac{8}{75}"
        ).scale(0.72)
        calc_b2.next_to(calc_b1, DOWN, buff=0.30).scale_to_fit_width(12.5)

        calc_b3 = MathTex(
            r"v_2 = \frac{75}{8} \approx 9.4\ \mathrm{cm}",
            r"\quad (>0,\ \text{real image})"
        ).scale(0.72)
        calc_b3.next_to(calc_b2, DOWN, buff=0.30).scale_to_fit_width(12.5)
        calc_b3[0].set_color(GREEN)

        note_b = Text("虚物（u₂<0）经 L2 成实像（v₂>0），像在 L2 右侧 9.4 cm！",
                      font=CJK, color=GREEN).scale(0.43)
        note_b.next_to(calc_b3, DOWN, buff=0.25)

        self.play(Write(calc_b1))
        self.wait(1.0)
        self.play(Write(calc_b2))
        self.wait(1.0)
        self.play(Write(calc_b3))
        self.wait(0.9)
        self.play(FadeIn(note_b))
        self.wait(1.6)
        self.play(FadeOut(VGroup(case_b_banner, calc_b1, calc_b2, calc_b3, note_b)))

        # ════════════════════════════════════════════════════════════════════
        # Step 7  情况 B 光路图
        # ════════════════════════════════════════════════════════════════════
        diag_title_b = Text("光路图 · 情况 B（d = 45 cm）——「虚物」光路", font=CJK, color=RED).scale(0.46)
        diag_title_b.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(diag_title_b))

        # 布局：L1 在 ox_b，L2 在 ox_b + 45*s
        s2 = 0.095
        ox_b = -2.8
        L2x_b = ox_b + 45 * s2   # = -2.8 + 4.275 = 1.475
        ay_b = -0.85

        axis_b = Line(np.array([ox_b - 1.0, ay_b, 0]), np.array([L2x_b + 2.0, ay_b, 0]),
                      color=GRAY, stroke_width=1.5)

        lensA = make_lens(np.array([ox_b, ay_b, 0]), height=1.9, color=COL_L1)
        lensB = make_lens(np.array([L2x_b, ay_b, 0]), height=1.9, color=COL_L2)

        lbA = VGroup(
            Text("L", font=CJK, color=COL_L1).scale(0.35),
            MathTex(r"_1", color=COL_L1).scale(0.45)
        ).arrange(RIGHT, buff=0.02).next_to(np.array([ox_b, ay_b + 1.0, 0]), UP, buff=0.06)

        lbB = VGroup(
            Text("L", font=CJK, color=COL_L2).scale(0.35),
            MathTex(r"_2", color=COL_L2).scale(0.45)
        ).arrange(RIGHT, buff=0.02).next_to(np.array([L2x_b, ay_b + 1.0, 0]), UP, buff=0.06)

        # P1 若不被拦截，会在 L1 右 60 cm 汇聚
        p1_x_b = ox_b + 60 * s2   # 在 L2 右边 15cm
        # 虚物标记（在 L2 右侧）
        vobj_x = p1_x_b   # L2 右侧 15*s2
        vobj_dashed = DashedLine(np.array([vobj_x, ay_b, 0]),
                                 np.array([vobj_x, ay_b + 0.85, 0]),
                                 color=RED, stroke_width=2.0, dash_length=0.07)
        lbl_vobj = Text("虚物 P₁*  u₂=-15", font=CJK, color=RED).scale(0.30)
        lbl_vobj.next_to(np.array([vobj_x, ay_b + 0.9, 0]), RIGHT, buff=0.05)

        # 实像位置（L2 右侧 9.4cm）
        img_x_b = L2x_b + 9.4 * s2
        img_arrow_b = Arrow(np.array([img_x_b, ay_b, 0]),
                            np.array([img_x_b, ay_b + 0.75, 0]),
                            buff=0, color=GREEN, stroke_width=2.5,
                            max_tip_length_to_length_ratio=0.28)
        lbl_img_b = Text("实像 v₂≈9.4", font=CJK, color=GREEN).scale(0.30)
        lbl_img_b.next_to(img_arrow_b, RIGHT, buff=0.05)

        # 物体
        obj_x_b = ox_b - 20 * s2
        obj_arr_b = Arrow(np.array([obj_x_b, ay_b, 0]),
                          np.array([obj_x_b, ay_b + 0.85, 0]),
                          buff=0, color=COL_OBJ, stroke_width=2.5,
                          max_tip_length_to_length_ratio=0.28)
        lbl_obj_b = Text("物 u₁=20", font=CJK, color=COL_OBJ).scale(0.30)
        lbl_obj_b.next_to(obj_arr_b, LEFT, buff=0.04)

        # 光线从 L1 出会聚到虚物 P1*（红色虚线延伸表示"若不拦截"）
        L1_hit = np.array([ox_b, ay_b + 0.85, 0])
        vobj_tip = np.array([vobj_x, ay_b + 0.85, 0])

        ray_b1_in = Line(np.array([obj_x_b, ay_b + 0.85, 0]), L1_hit,
                         color=COL_RAY, stroke_width=1.5)
        # 折射后会聚光束（向 P1* 会聚）—— 被 L2 截断
        ray_b1_out = Line(L1_hit, np.array([L2x_b, ay_b + 0.85 * (L2x_b - ox_b) / (vobj_x - ox_b), 0]),
                          color=COL_RAY, stroke_width=1.5)
        # 虚线延伸到虚物（若无 L2）
        L2_hit_b = np.array([L2x_b, ay_b + 0.85 * (L2x_b - ox_b) / (vobj_x - ox_b), 0])
        ray_b1_ext = DashedLine(L2_hit_b, vobj_tip,
                                color=RED, stroke_width=1.5, dash_length=0.07)

        # 经 L2 折射后成实像
        slope_to_img = (ay_b - L2_hit_b[1]) / (img_x_b - L2x_b)
        # 简单画一条出射光线到实像
        ray_b2 = Line(L2_hit_b, np.array([img_x_b, ay_b + 0.75, 0]),
                      color=COL_RAY2, stroke_width=1.5)
        # 轴上光线
        ray_b3_in = Line(np.array([obj_x_b, ay_b + 0.85, 0]),
                         np.array([ox_b, ay_b, 0]), color=CYAN, stroke_width=1.5)
        ray_b3_out = Line(np.array([ox_b, ay_b, 0]),
                          np.array([img_x_b, ay_b + 0.75 * 0, 0]),
                          color=CYAN, stroke_width=1.5)

        # 红色圆弧标注「负号来源」
        neg_arc = Arc(radius=0.4, start_angle=PI / 2, angle=-PI * 0.9,
                      color=RED, stroke_width=3).move_to(np.array([vobj_x + 0.1, ay_b + 0.5, 0]))
        neg_lbl = Text("u₂ < 0", font=CJK, color=RED).scale(0.32)
        neg_lbl.next_to(neg_arc, RIGHT, buff=0.06)

        note_b_diag = Text("会聚光束被 L2 拦截 → 虚物（红色虚线为假想延长线）",
                           font=CJK, color=RED).scale(0.38)
        note_b_diag.to_edge(DOWN, buff=0.45)

        diag_b_grp = VGroup(
            axis_b, lensA, lensB, lbA, lbB,
            obj_arr_b, lbl_obj_b,
            vobj_dashed, lbl_vobj,
            img_arrow_b, lbl_img_b,
            ray_b1_in, ray_b1_out, ray_b1_ext,
            ray_b2, ray_b3_in, ray_b3_out,
            neg_arc, neg_lbl
        )

        self.play(Create(axis_b), Create(lensA), Create(lensB))
        self.play(FadeIn(lbA), FadeIn(lbB))
        self.wait(0.4)
        self.play(GrowArrow(obj_arr_b), FadeIn(lbl_obj_b))
        self.wait(0.5)
        self.play(Create(ray_b1_in), Create(ray_b1_out))
        self.play(Create(ray_b1_ext))
        self.wait(0.6)
        self.play(Create(vobj_dashed), FadeIn(lbl_vobj))
        self.play(Create(neg_arc), FadeIn(neg_lbl))
        self.wait(0.7)
        self.play(Create(ray_b2), Create(ray_b3_in), Create(ray_b3_out))
        self.play(GrowArrow(img_arrow_b), FadeIn(lbl_img_b))
        self.wait(0.6)
        self.play(FadeIn(note_b_diag))
        self.wait(1.8)
        self.play(FadeOut(VGroup(diag_b_grp, diag_title_b, note_b_diag)))
        self.wait(0.3)

        # ════════════════════════════════════════════════════════════════════
        # Step 8  对比总结（两种情况并排）
        # ════════════════════════════════════════════════════════════════════
        cmp_title = Text("两种情况对比", font=CJK, color=BLUE).scale(0.52)
        cmp_title.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(cmp_title))

        # 左栏：情况 A
        col_a_hdr = Text("A：d=70cm（实物）", font=CJK, color=ORANGE).scale(0.44)
        ca1 = VGroup(Text("u₂ = 70-60 = 10 cm", font=CJK).scale(0.40),
                     MathTex(r">0", color=GREEN).scale(0.55)).arrange(RIGHT, buff=0.1)
        ca2 = VGroup(Text("v₂ ≈ -16.7 cm", font=CJK).scale(0.40),
                     MathTex(r"<0", color=RED).scale(0.55)).arrange(RIGHT, buff=0.1)
        ca3 = Text("实物 → 虚像", font=CJK, color=RED).scale(0.42)
        col_a = VGroup(col_a_hdr, ca1, ca2, ca3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)

        # 右栏：情况 B
        col_b_hdr = Text("B：d=45cm（虚物）", font=CJK, color=RED).scale(0.44)
        cb1 = VGroup(Text("u₂ = 45-60 = -15 cm", font=CJK).scale(0.40),
                     MathTex(r"<0", color=RED).scale(0.55)).arrange(RIGHT, buff=0.1)
        cb2 = VGroup(Text("v₂ ≈ 9.4 cm", font=CJK).scale(0.40),
                     MathTex(r">0", color=GREEN).scale(0.55)).arrange(RIGHT, buff=0.1)
        cb3 = Text("虚物 → 实像", font=CJK, color=GREEN).scale(0.42)
        col_b = VGroup(col_b_hdr, cb1, cb2, cb3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)

        cmp_cols = VGroup(col_a, col_b).arrange(RIGHT, buff=1.4)
        cmp_cols.next_to(cmp_title, DOWN, buff=0.45).scale_to_fit_width(12.0)

        # 分隔线
        sep = Line(UP * 1.0, DOWN * 1.0, color=GRAY, stroke_width=1).move_to(cmp_cols.get_center())

        box_a = SurroundingRectangle(col_a, color=ORANGE, buff=0.18, corner_radius=0.1)
        box_b = SurroundingRectangle(col_b, color=RED, buff=0.18, corner_radius=0.1)

        self.play(FadeIn(col_a), FadeIn(col_b), Create(sep))
        self.play(Create(box_a), Create(box_b))
        self.wait(1.5)
        self.play(FadeOut(VGroup(cmp_cols, cmp_title, sep, box_a, box_b)))

        # ════════════════════════════════════════════════════════════════════
        # Step 9  小结卡（关键公式汇总 + 方框）
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52).next_to(title, DOWN, buff=0.45)

        s1 = MathTex(
            r"\frac{1}{u_1}+\frac{1}{v_1}=\frac{1}{f_1}",
            color=YELLOW
        ).scale(0.80)

        s2_txt = Text("中间物距：", font=CJK, color=WHITE).scale(0.44)
        s2_eq = MathTex(r"u_2 = d - v_1", color=YELLOW).scale(0.80)
        s2 = VGroup(s2_txt, s2_eq).arrange(RIGHT, buff=0.15)

        s3 = MathTex(
            r"\frac{1}{u_2}+\frac{1}{v_2}=\frac{1}{f_2}",
            color=YELLOW
        ).scale(0.80)

        s4_a = Text("若 u₂ > 0 → 实物；", font=CJK, color=GREEN).scale(0.42)
        s4_b = Text("若 u₂ < 0 → 虚物（会聚光被提前拦截）", font=CJK, color=RED).scale(0.42)
        s4 = VGroup(s4_a, s4_b).arrange(RIGHT, buff=0.25)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.35)
        summary.next_to(s_title, DOWN, buff=0.42).scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.7)
        self.play(Write(s2))
        self.wait(0.7)
        self.play(Write(s3))
        self.wait(0.7)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch10Ex1LensGroupSequentialImaging",
        "id": "phys-ch10-10.2-ex1-lens-group-sequential-imaging",
        "chapterId": "ch10",
        "sectionId": "10.2",
        "title": "双透镜组逐次成像（实物与虚物）",
        "description": "通过 d=70cm（实物→虚像）与 d=45cm（虚物→实像）两种情况对比，直观解释「虚物」的物理本质与逐次成像公式的应用。",
    },
]
