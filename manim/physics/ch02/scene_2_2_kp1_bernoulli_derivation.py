"""第 2.2 节 · 伯努利方程的推导（金标准范本：受力/功-能定理 推导路径）。

物理动画范式：先用流管侧视图建立几何直觉，再逐步展示外力做功、
动能/势能变化，最后用颜色框高亮伯努利方程三项，配合管截面动态演示
「此消彼长」——让零基础读者真正理解方程背后的能量守恒本质。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch02Kp1BernoulliDerivation(Scene):
    def construct(self):

        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("伯努利方程的推导", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第二章 流体运动 · 2.2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ────────────────────────────────────────
        ana1 = Text("生活直觉：花园水管捏紧一段，那里水流得更快——压力却更小。", font=CJK).scale(0.46)
        ana2 = Text("伯努利方程正是对这一现象的精确数学描述：", font=CJK).scale(0.46)
        ana3 = Text("流速越大、压强越小；位置越高、压强越小。", font=CJK, color=YELLOW).scale(0.46)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.8)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ── Step 3: 绘制倾斜流管侧视图 ──────────────────────────────────
        # 流管：左低右高，左粗右细（左截面 S1 大，右截面 S2 小）
        # 用四边形（Polygon）近似梯形流管
        tube_color = BLUE_E

        # 流管轮廓坐标（屏幕坐标，Y 正向上）
        # 左截面中心 (-4.2, -1.4)，右截面中心 (4.0, 0.8)
        # 左半宽 0.70，右半宽 0.35
        lc = np.array([-4.2, -1.4, 0])   # 左截面中心
        rc = np.array([ 4.0,  0.8, 0])   # 右截面中心

        # 管轴方向单位法向量（垂直于轴）
        axis_vec = rc - lc
        axis_len = np.linalg.norm(axis_vec)
        axis_dir = axis_vec / axis_len
        perp = np.array([-axis_dir[1], axis_dir[0], 0])  # 顺时针旋转 90°

        lhw = 0.72   # 左半宽
        rhw = 0.38   # 右半宽

        # 四个顶点（逆时针）
        p_lb = lc - perp * lhw
        p_lt = lc + perp * lhw
        p_rt = rc + perp * rhw
        p_rb = rc - perp * rhw

        tube = Polygon(p_lb, p_lt, p_rt, p_rb,
                       stroke_color=tube_color, stroke_width=3, fill_opacity=0.0)

        # 左截面 S1（蓝色短竖线）
        s1_top = lc + perp * lhw
        s1_bot = lc - perp * lhw
        s1_line = Line(s1_bot, s1_top, color=BLUE, stroke_width=4)

        # 右截面 S2（红色短竖线）
        s2_top = rc + perp * rhw
        s2_bot = rc - perp * rhw
        s2_line = Line(s2_bot, s2_top, color=RED, stroke_width=4)

        # 标注 S1、S2
        s1_label = VGroup(Text("S", font=CJK, color=BLUE).scale(0.40),
                          MathTex(r"_1", color=BLUE).scale(0.55)).arrange(RIGHT, buff=0.02)
        s1_label.next_to(s1_line, LEFT, buff=0.15)

        s2_label = VGroup(Text("S", font=CJK, color=RED).scale(0.40),
                          MathTex(r"_2", color=RED).scale(0.55)).arrange(RIGHT, buff=0.02)
        s2_label.next_to(s2_line, RIGHT, buff=0.15)

        # 高度标注 h1, h2（水平虚线 + 标签）
        h_ref_y = -2.5  # 参考基准线 y
        h1_y = lc[1]
        h2_y = rc[1]

        h1_line = DashedLine(np.array([-5.5, h1_y, 0]), np.array([lc[0], h1_y, 0]),
                             color=GREY, stroke_width=1.5)
        h2_line = DashedLine(np.array([-5.5, h2_y, 0]), np.array([rc[0], h2_y, 0]),
                             color=GREY, stroke_width=1.5)
        h1_label = MathTex(r"h_1", color=GREEN).scale(0.50).next_to(h1_line, LEFT, buff=0.08)
        h2_label = MathTex(r"h_2", color=GREEN).scale(0.50).next_to(h2_line, LEFT, buff=0.08)

        # 流速箭头（在管内）
        v1_arrow = Arrow(lc + axis_dir * 0.3, lc + axis_dir * 1.0,
                         buff=0, color=CYAN, stroke_width=4, max_tip_length_to_length_ratio=0.3)
        v1_label = MathTex(r"v_1", color=CYAN).scale(0.55).next_to(v1_arrow, DOWN, buff=0.15)

        mid_r = lc + axis_dir * (axis_len * 0.75)
        v2_arrow = Arrow(mid_r, mid_r + axis_dir * 1.1,
                         buff=0, color=ORANGE, stroke_width=4, max_tip_length_to_length_ratio=0.3)
        v2_label = MathTex(r"v_2", color=ORANGE).scale(0.55).next_to(v2_arrow, UP, buff=0.12)

        tube_group = VGroup(tube, s1_line, s2_line, s1_label, s2_label,
                            h1_line, h2_line, h1_label, h2_label,
                            v1_arrow, v1_label, v2_arrow, v2_label)

        # 缩放整组确保不超出屏幕
        tube_group.scale(0.88).shift(DOWN * 0.5)

        caption_tube = Text("倾斜流管侧视图：左截面大（低速高压），右截面小（高速低压）",
                            font=CJK, color=GREY).scale(0.38).to_edge(DOWN, buff=0.30)

        self.play(Create(tube), Create(s1_line), Create(s2_line))
        self.play(FadeIn(s1_label), FadeIn(s2_label))
        self.play(FadeIn(h1_line), FadeIn(h2_line), FadeIn(h1_label), FadeIn(h2_label))
        self.play(GrowArrow(v1_arrow), FadeIn(v1_label),
                  GrowArrow(v2_arrow), FadeIn(v2_label))
        self.play(FadeIn(caption_tube))
        self.wait(1.8)

        # ── Step 4: 幕一——压力箭头与位移，标注做功 ─────────────────────
        self.play(FadeOut(caption_tube))
        act1_title = Text("第一幕：压力做功", font=CJK, color=BLUE).scale(0.48)
        act1_title.to_edge(UP).shift(DOWN * 0.52)  # 挂在 title 下方
        act1_title.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(act1_title))

        # 压力 F1 箭头（蓝色，向管内 = 沿 axis_dir 向右）
        # 箭头从截面向右延伸
        s1_mid = tube_group[1].get_center()  # s1_line center after scaling
        s2_mid = tube_group[2].get_center()  # s2_line center after scaling

        f1_start = s1_mid - axis_dir * 0.55
        f1_end   = s1_mid + axis_dir * 0.12
        f1_arrow = Arrow(f1_start, f1_end, buff=0, color=BLUE,
                         stroke_width=5, max_tip_length_to_length_ratio=0.35)
        f1_label_tex = MathTex(r"F_1=p_1 S_1", color=BLUE).scale(0.50)
        f1_label_tex.next_to(f1_arrow, DOWN + LEFT * 0.3, buff=0.14)

        # 压力 F2 箭头（红色，向管内 = 沿 -axis_dir 向左，做负功）
        f2_start = s2_mid + axis_dir * 0.55
        f2_end   = s2_mid - axis_dir * 0.12
        f2_arrow = Arrow(f2_start, f2_end, buff=0, color=RED,
                         stroke_width=5, max_tip_length_to_length_ratio=0.35)
        f2_label_tex = MathTex(r"F_2=p_2 S_2", color=RED).scale(0.50)
        f2_label_tex.next_to(f2_arrow, UP + RIGHT * 0.3, buff=0.14)

        self.play(GrowArrow(f1_arrow), FadeIn(f1_label_tex))
        self.wait(0.6)
        self.play(GrowArrow(f2_arrow), FadeIn(f2_label_tex))
        self.wait(1.0)

        # dx1, dx2 位移 Brace
        dx1_start = s1_mid
        dx1_end   = s1_mid + axis_dir * 0.6
        dx1_line  = Line(dx1_start, dx1_end, color=BLUE, stroke_width=2)
        brace_dx1 = Brace(dx1_line, direction=perp, color=BLUE, buff=0.08)
        brace_dx1_label = MathTex(r"dx_1", color=BLUE).scale(0.46)
        brace_dx1.put_at_tip(brace_dx1_label, buff=0.08)

        dx2_end   = s2_mid
        dx2_start = s2_mid - axis_dir * 0.38
        dx2_line  = Line(dx2_start, dx2_end, color=RED, stroke_width=2)
        brace_dx2 = Brace(dx2_line, direction=-perp, color=RED, buff=0.08)
        brace_dx2_label = MathTex(r"dx_2", color=RED).scale(0.46)
        brace_dx2.put_at_tip(brace_dx2_label, buff=0.08)

        self.play(Create(dx1_line), Create(brace_dx1), FadeIn(brace_dx1_label))
        self.wait(0.5)
        self.play(Create(dx2_line), Create(brace_dx2), FadeIn(brace_dx2_label))
        self.wait(1.2)

        note_dv = Text("两端传入/排出相同体积元 dV = S1·dx1 = S2·dx2（不可压缩）",
                       font=CJK, color=GREY).scale(0.38).to_edge(DOWN, buff=0.30)
        self.play(FadeIn(note_dv))
        self.wait(1.5)

        # 清场幕一辅助元素
        self.play(FadeOut(VGroup(act1_title, f1_arrow, f1_label_tex,
                                 f2_arrow, f2_label_tex,
                                 dx1_line, brace_dx1, brace_dx1_label,
                                 dx2_line, brace_dx2, brace_dx2_label,
                                 note_dv)))

        # ── Step 5: 幕二——逐步书写外力总功 ─────────────────────────────
        act2_title = Text("第二幕：外力总功", font=CJK, color=BLUE).scale(0.48)
        act2_title.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(act2_title))

        # 推导区域（屏幕右侧，不与流管重叠）
        work_zone = VGroup()

        w_intro = VGroup(
            Text("左端压力做正功", font=CJK, color=BLUE).scale(0.42),
            MathTex(r"A_1 = p_1 S_1 \, dx_1 = p_1 \Delta V", color=BLUE).scale(0.72)
        ).arrange(DOWN, buff=0.18)

        w_intro2 = VGroup(
            Text("右端压力做负功", font=CJK, color=RED).scale(0.42),
            MathTex(r"A_2 = -p_2 S_2 \, dx_2 = -p_2 \Delta V", color=RED).scale(0.72)
        ).arrange(DOWN, buff=0.18)

        w_total_lbl = Text("合外力总功", font=CJK, color=YELLOW).scale(0.42)
        w_total_eq  = MathTex(r"A = p_1 \Delta V - p_2 \Delta V", color=YELLOW).scale(0.80)
        w_total_eq2 = MathTex(r"A = (p_1 - p_2)\,\Delta V", color=YELLOW).scale(0.80)

        derive_group = VGroup(w_intro, w_intro2,
                              VGroup(w_total_lbl, w_total_eq).arrange(DOWN, buff=0.14),
                              w_total_eq2).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        derive_group.scale(0.88).next_to(title, DOWN, buff=0.70).shift(RIGHT * 1.0)
        derive_group.scale_to_fit_width(6.5)

        self.play(FadeIn(w_intro))
        self.wait(1.0)
        self.play(FadeIn(w_intro2))
        self.wait(1.0)
        self.play(Write(w_total_lbl), Write(w_total_eq))
        self.wait(1.0)
        self.play(TransformMatchingTex(w_total_eq.copy(), w_total_eq2))
        self.wait(1.5)
        self.play(FadeOut(VGroup(act2_title, derive_group)))

        # ── Step 6: 幕三——动能变化与势能变化，逐步合并 ─────────────────
        act3_title = Text("第三幕：动能与势能变化", font=CJK, color=BLUE).scale(0.48)
        act3_title.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(act3_title))

        # 动能变化
        ek_lbl   = Text("动能变化", font=CJK, color=CYAN).scale(0.42)
        ek_eq    = MathTex(
            r"\Delta E_k = \frac{1}{2}(\rho\Delta V)v_2^2 - \frac{1}{2}(\rho\Delta V)v_1^2",
            color=CYAN).scale(0.68)
        ek_group = VGroup(ek_lbl, ek_eq).arrange(DOWN, buff=0.15)

        # 势能变化
        ep_lbl   = Text("势能变化", font=CJK, color=GREEN).scale(0.42)
        ep_eq    = MathTex(
            r"\Delta E_p = \rho\Delta V\,g\,h_2 - \rho\Delta V\,g\,h_1",
            color=GREEN).scale(0.68)
        ep_group = VGroup(ep_lbl, ep_eq).arrange(DOWN, buff=0.15)

        # 功能定理
        wt_lbl  = Text("功能定理", font=CJK, color=YELLOW).scale(0.42)
        wt_eq   = MathTex(r"A = \Delta E_k + \Delta E_p", color=YELLOW).scale(0.75)
        wt_group = VGroup(wt_lbl, wt_eq).arrange(DOWN, buff=0.15)

        energy_derive = VGroup(ek_group, ep_group, wt_group).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        energy_derive.next_to(title, DOWN, buff=0.68).shift(RIGHT * 0.5)
        energy_derive.scale_to_fit_width(8.0)

        self.play(FadeIn(ek_group))
        self.wait(1.2)
        self.play(FadeIn(ep_group))
        self.wait(1.0)
        self.play(Write(wt_lbl), Write(wt_eq))
        self.wait(1.5)

        # 展开代入：合并
        expand_lbl = Text("代入展开并除以 dV", font=CJK, color=GREY).scale(0.42)
        expand_eq  = MathTex(
            r"p_1 - p_2 = \frac{1}{2}\rho v_2^2 - \frac{1}{2}\rho v_1^2"
            r"+ \rho g h_2 - \rho g h_1",
            color=WHITE).scale(0.62)
        expand_group = VGroup(expand_lbl, expand_eq).arrange(DOWN, buff=0.14)
        expand_group.next_to(energy_derive, DOWN, buff=0.40)
        expand_group.scale_to_fit_width(9.5)

        self.play(FadeIn(expand_lbl))
        self.play(Write(expand_eq))
        self.wait(1.8)
        self.play(FadeOut(VGroup(act3_title, energy_derive, expand_group)))

        # ── Step 7: 幕四——推出伯努利方程 ────────────────────────────────
        act4_title = Text("第四幕：伯努利方程", font=CJK, color=BLUE).scale(0.48)
        act4_title.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(act4_title))

        rearrange_lbl = Text("移项整理，左右两侧各自是同一常数：", font=CJK, color=GREY).scale(0.42)
        rearrange_lbl.next_to(act4_title, DOWN, buff=0.38)

        # 整理后的形式
        bern_lhs = MathTex(
            r"p_1 + \rho g h_1 + \frac{1}{2}\rho v_1^2",
            r"=",
            r"p_2 + \rho g h_2 + \frac{1}{2}\rho v_2^2",
            color=WHITE).scale(0.80)
        bern_lhs.next_to(rearrange_lbl, DOWN, buff=0.42)

        # 最终形式
        bern_final = MathTex(
            r"p",
            r"+",
            r"\rho g h",
            r"+",
            r"\frac{1}{2}\rho v^2",
            r"=",
            r"\mathrm{const}",
            color=WHITE).scale(0.95)
        bern_final.next_to(bern_lhs, DOWN, buff=0.52)

        self.play(FadeIn(rearrange_lbl))
        self.wait(0.6)
        self.play(Write(bern_lhs))
        self.wait(1.2)
        self.play(TransformMatchingTex(bern_lhs.copy(), bern_final))
        self.wait(1.0)

        # 三项着色
        # p -> BLUE(静压), ρgh -> GREEN(势能项), ½ρv² -> ORANGE(动压)
        self.play(
            bern_final[0].animate.set_color(BLUE),
            bern_final[2].animate.set_color(GREEN),
            bern_final[4].animate.set_color(ORANGE),
        )
        self.wait(0.8)

        # 三项矩形框高亮
        box_p   = SurroundingRectangle(bern_final[0], color=BLUE,   buff=0.12, corner_radius=0.08)
        box_gh  = SurroundingRectangle(bern_final[2], color=GREEN,  buff=0.12, corner_radius=0.08)
        box_v2  = SurroundingRectangle(bern_final[4], color=ORANGE, buff=0.12, corner_radius=0.08)

        self.play(Create(box_p), Create(box_gh), Create(box_v2))
        self.wait(0.8)

        # 三项标注说明
        lbl_p  = VGroup(Text("静压", font=CJK, color=BLUE).scale(0.40),
                        MathTex(r"p", color=BLUE).scale(0.50)).arrange(RIGHT, buff=0.06)
        lbl_gh = VGroup(Text("重力势能压", font=CJK, color=GREEN).scale(0.40),
                        MathTex(r"\rho g h", color=GREEN).scale(0.50)).arrange(RIGHT, buff=0.06)
        lbl_v2 = VGroup(Text("动压", font=CJK, color=ORANGE).scale(0.40),
                        MathTex(r"\tfrac{1}{2}\rho v^2", color=ORANGE).scale(0.50)).arrange(RIGHT, buff=0.06)

        labels_group = VGroup(lbl_p, lbl_gh, lbl_v2).arrange(RIGHT, buff=0.55)
        labels_group.next_to(bern_final, DOWN, buff=0.45)

        self.play(FadeIn(labels_group))
        self.wait(1.5)

        # 清场，保留流管
        self.play(FadeOut(VGroup(act4_title, rearrange_lbl, bern_lhs,
                                 box_p, box_gh, box_v2, labels_group)))

        # ── Step 8: 流管动态演示——三项此消彼长（ValueTracker）────────────
        # 用 ValueTracker 控制右截面缩放比例，演示 S2 变化时 v2 变化
        # 同时在右侧用三根长度变化的色条表示三项大小

        dyn_title = Text("动态演示：截面缩小时速度升高、压强下降", font=CJK, color=YELLOW).scale(0.44)
        dyn_title.next_to(title, DOWN, buff=0.22)
        self.play(FadeIn(dyn_title), FadeOut(bern_final))

        # ---- 参数 ----
        # 流量守恒：S1*v1 = S2(t)*v2(t) => v2 = S1*v1/S2
        # 基准：S2/S1 = 0.53（对应右半宽 / 左半宽 ≈ 0.38/0.72）
        # 伯努利：p2 = p1 + 0.5*rho*(v1^2 - v2^2) - rho*g*(h2-h1)
        # 归一化：只显示比例条

        # 使用 ValueTracker 控制 S2/S1 比例
        ratio = ValueTracker(0.53)  # 初始值

        # 创建动态右截面线
        def get_s2_line():
            r = ratio.get_value()
            new_rhw = 0.72 * r  # 右半宽 = 左半宽 * r
            s2c = tube_group[2].get_center()  # 基于流管缩放后的 s2 位置
            # 重新计算截面端点（用原始 perp 方向）
            t_bot = s2c - perp * new_rhw * 0.88
            t_top = s2c + perp * new_rhw * 0.88
            return Line(t_bot, t_top, color=RED, stroke_width=4)

        s2_dyn = always_redraw(get_s2_line)
        self.remove(tube_group[2])  # 移除原静态 s2_line
        self.add(s2_dyn)
        self.wait(0.2)

        # 右侧仪表：三根竖直色条（固定底部，高度 = 值）
        bar_x_base = 4.8
        bar_y_base = -2.2
        bar_width  = 0.30
        bar_max_h  = 3.0

        # 参数基准
        S1 = 1.0
        v1 = 1.0
        p1_val = 2.0
        rho = 1.0
        g_acc = 1.0
        h1_val = 0.0
        h2_val = 0.8  # 右截面高于左截面（归一化）

        def bar_rect(x, value, max_val, color):
            h = bar_max_h * max(0.05, min(1.0, value / max_val))
            return Rectangle(width=bar_width, height=h, color=color,
                             fill_color=color, fill_opacity=0.75, stroke_width=1.5) \
                .move_to(np.array([x, bar_y_base + h / 2, 0]))

        max_p  = p1_val + 1.0   # 允许 p 最大值
        max_gh = rho * g_acc * h2_val * 2.0
        max_v2 = 2.5

        def get_p2(r):
            v2 = v1 / r
            return p1_val + 0.5 * rho * (v1**2 - v2**2) - rho * g_acc * (h2_val - h1_val)

        def get_v2(r):
            return v1 / r

        bar_p_dyn  = always_redraw(lambda: bar_rect(
            bar_x_base - 0.7,
            max(0.01, get_p2(ratio.get_value())),
            max_p, BLUE))
        bar_gh_dyn = always_redraw(lambda: bar_rect(
            bar_x_base,
            rho * g_acc * h2_val,
            max_p, GREEN))
        bar_v2_dyn = always_redraw(lambda: bar_rect(
            bar_x_base + 0.7,
            0.5 * rho * get_v2(ratio.get_value())**2,
            max_p, ORANGE))

        # 条形图标签（固定位置）
        lbl_bar_p  = Text("p", font=CJK, color=BLUE).scale(0.38).move_to(np.array([bar_x_base - 0.7, bar_y_base - 0.30, 0]))
        lbl_bar_gh = VGroup(MathTex(r"\rho gh", color=GREEN).scale(0.42)).move_to(np.array([bar_x_base,      bar_y_base - 0.38, 0]))
        lbl_bar_v2 = VGroup(MathTex(r"\tfrac{1}{2}\rho v^2", color=ORANGE).scale(0.42)).move_to(np.array([bar_x_base + 0.7, bar_y_base - 0.38, 0]))

        lbl_bars_title = Text("各项大小", font=CJK, color=WHITE).scale(0.38)
        lbl_bars_title.move_to(np.array([bar_x_base, bar_y_base + bar_max_h + 0.45, 0]))

        self.add(bar_p_dyn, bar_gh_dyn, bar_v2_dyn)
        self.play(FadeIn(VGroup(lbl_bar_p, lbl_bar_gh, lbl_bar_v2, lbl_bars_title)))

        # 动态标注 v2 值
        v2_readout = always_redraw(lambda: VGroup(
            Text("v2=", font=CJK, color=ORANGE).scale(0.40),
            MathTex(rf"{get_v2(ratio.get_value()):.2f}\,v_1", color=ORANGE).scale(0.50)
        ).arrange(RIGHT, buff=0.06).next_to(dyn_title, DOWN, buff=0.35))
        self.add(v2_readout)
        self.wait(0.6)

        # 截面缩小：右截面变细，v2 升高，p2 降低
        thin_note = Text("截面缩小 → 流速增大 → 动压升高 → 静压下降", font=CJK, color=YELLOW).scale(0.42)
        thin_note.to_edge(DOWN, buff=0.38)
        self.play(FadeIn(thin_note))
        self.play(ratio.animate.set_value(0.28), run_time=2.8)
        self.wait(1.0)

        fat_note = Text("截面变大 → 流速减小 → 动压降低 → 静压回升", font=CJK, color=CYAN).scale(0.42)
        fat_note.to_edge(DOWN, buff=0.38)
        self.play(FadeOut(thin_note))
        self.play(FadeIn(fat_note))
        self.play(ratio.animate.set_value(0.72), run_time=2.5)
        self.wait(1.0)
        self.play(ratio.animate.set_value(0.53), run_time=1.5)
        self.wait(0.6)

        # 清场动态演示
        self.play(FadeOut(VGroup(dyn_title, fat_note, v2_readout,
                                 lbl_bar_p, lbl_bar_gh, lbl_bar_v2, lbl_bars_title,
                                 bar_p_dyn, bar_gh_dyn, bar_v2_dyn,
                                 tube_group, s2_dyn)))

        # ── Step 9: 数值例子 ─────────────────────────────────────────────
        ex_title = Text("数值例子", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        ex_cond = VGroup(
            Text("水平管（h1=h2），截面比 S1/S2=2，v1=1 m/s，p1=200 kPa", font=CJK).scale(0.43),
        ).next_to(ex_title, DOWN, buff=0.30)
        ex_v2 = MathTex(r"v_2 = v_1\cdot\frac{S_1}{S_2} = 1\times 2 = 2\ \mathrm{m/s}",
                        color=CYAN).scale(0.72)
        ex_v2.next_to(ex_cond, DOWN, buff=0.35)
        ex_p2 = MathTex(
            r"p_2 = p_1 + \tfrac{1}{2}\rho(v_1^2-v_2^2)"
            r"= 200000 + \tfrac{1}{2}(1000)(1-4)"
            r"\approx 198500\ \mathrm{Pa}",
            color=GREEN).scale(0.60)
        ex_p2.next_to(ex_v2, DOWN, buff=0.38)
        ex_p2.scale_to_fit_width(10.5)

        ex_concl = Text("速度翻倍，静压下降约 1.5 kPa——符合伯努利预测。",
                        font=CJK, color=YELLOW).scale(0.43)
        ex_concl.next_to(ex_p2, DOWN, buff=0.35)

        self.play(FadeIn(ex_title))
        self.play(FadeIn(ex_cond))
        self.wait(0.8)
        self.play(Write(ex_v2))
        self.wait(0.8)
        self.play(Write(ex_p2))
        self.wait(0.8)
        self.play(FadeIn(ex_concl))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_v2, ex_p2, ex_concl)))

        # ── Step 10: 小结卡 ──────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.40)

        sum_eq = MathTex(
            r"p",
            r"+",
            r"\rho g h",
            r"+",
            r"\frac{1}{2}\rho v^2",
            r"=",
            r"\mathrm{const}",
            color=WHITE).scale(1.0)
        sum_eq[0].set_color(BLUE)
        sum_eq[2].set_color(GREEN)
        sum_eq[4].set_color(ORANGE)
        sum_eq.next_to(s_title, DOWN, buff=0.50)

        sum_box = SurroundingRectangle(sum_eq, color=YELLOW, buff=0.25, corner_radius=0.12)

        s2_lbl = VGroup(
            Text("静压", font=CJK, color=BLUE).scale(0.40),
            Text("＋", font=CJK, color=WHITE).scale(0.40),
            Text("重力势压", font=CJK, color=GREEN).scale(0.40),
            Text("＋", font=CJK, color=WHITE).scale(0.40),
            Text("动压", font=CJK, color=ORANGE).scale(0.40),
            Text("= 常数", font=CJK, color=YELLOW).scale(0.40),
        ).arrange(RIGHT, buff=0.20)
        s2_lbl.next_to(sum_eq, DOWN, buff=0.32)

        cond_text = VGroup(
            Text("适用条件：定常、不可压缩、无粘性、沿同一流线", font=CJK, color=GREY).scale(0.40),
        ).next_to(s2_lbl, DOWN, buff=0.35)

        work_eq_sum = MathTex(r"A = (p_1-p_2)\Delta V = \Delta E_k + \Delta E_p",
                              color=CYAN).scale(0.65)
        work_eq_sum.next_to(cond_text, DOWN, buff=0.30)
        work_box = SurroundingRectangle(work_eq_sum, color=CYAN, buff=0.14, corner_radius=0.08)

        self.play(FadeIn(s_title))
        self.play(Write(sum_eq))
        self.play(Create(sum_box))
        self.wait(0.8)
        self.play(FadeIn(s2_lbl))
        self.wait(0.8)
        self.play(FadeIn(cond_text))
        self.wait(0.6)
        self.play(Write(work_eq_sum), Create(work_box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, sum_eq, sum_box, s2_lbl,
                                 cond_text, work_eq_sum, work_box, title)))
        self.wait(0.5)


REGISTER = [
    {
        "scene": "Ch02Kp1BernoulliDerivation",
        "id": "phys-ch02-2.2-kp1-bernoulli-derivation",
        "chapterId": "ch02",
        "sectionId": "2.2",
        "title": "伯努利方程的推导",
        "description": "从倾斜流管的压力做功出发，用功能定理逐步推导伯努利方程，并动态演示三项此消彼长。",
    },
]
