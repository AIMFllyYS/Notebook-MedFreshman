"""第 14.2 节 · 三种辐射过程：自发辐射、受激吸收、受激辐射

可视化：两条能级线（E₁、E₂）三列并排，依次演示三种过程；
最后汇总对比表格（频率/相位/方向/是否需要外来光子）逐行淡入。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 颜色常量 ──────────────────────────────────────────────────────────────
PHOTON_IN  = "#FF6B35"   # 入射光子（橙红）
PHOTON_OUT = "#FF2222"   # 出射/受激光子（红色）
SPONT_COL  = "#AAAAFF"   # 自发辐射光子（蓝紫）
LEVEL_COL  = BLUE_B      # 能级线颜色
PARTICLE   = YELLOW      # 粒子颜色


# ── 工具函数 ───────────────────────────────────────────────────────────────

def make_energy_levels(center_x, y_low=-0.6, y_high=0.6, width=2.0, color=LEVEL_COL):
    """在给定 center_x 处画两条能级线，返回 (e1_line, e2_line, e1_lbl, e2_lbl, group)"""
    x0, x1 = center_x - width / 2, center_x + width / 2
    e1 = Line([x0, y_low, 0], [x1, y_low, 0], color=color, stroke_width=3)
    e2 = Line([x0, y_high, 0], [x1, y_high, 0], color=color, stroke_width=3)
    lbl1 = MathTex(r"E_1", color=color).scale(0.45).next_to(e1, LEFT, buff=0.12)
    lbl2 = MathTex(r"E_2", color=color).scale(0.45).next_to(e2, LEFT, buff=0.12)
    return e1, e2, lbl1, lbl2


def make_particle(x, y, color=PARTICLE):
    return Dot([x, y, 0], radius=0.16, color=color)


def wavy_arrow(start, end, color=YELLOW, amplitude=0.12, n_cycles=2.5, n_points=60):
    """从 start 到 end 画一条正弦波线（近似光子）."""
    sx, sy, _ = start
    ex, ey, _ = end
    dx, dy = ex - sx, ey - sy
    length = math.sqrt(dx * dx + dy * dy)
    if length < 1e-6:
        return VGroup()
    # 单位法向量（垂直于运动方向）
    ux, uy = dx / length, dy / length
    nx, ny = -uy, ux
    ts = np.linspace(0, 1, n_points)
    pts = []
    for t_val in ts:
        wave_offset = amplitude * math.sin(2 * math.pi * n_cycles * t_val)
        px = sx + t_val * dx + wave_offset * nx
        py = sy + t_val * dy + wave_offset * ny
        pts.append([px, py, 0])
    path = VMobject(color=color, stroke_width=2.5)
    path.set_points_smoothly(pts)
    # 箭头头部
    tip = Arrow(
        start=np.array(pts[-4]),
        end=np.array(pts[-1]),
        buff=0,
        max_tip_length_to_length_ratio=0.4,
        stroke_width=2.5,
        color=color,
    )
    return VGroup(path, tip)


class Ch14Kp1ThreeRadiativeProcesses(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("三种辐射过程", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        sub = VGroup(
            Text("第十四章  X射线与激光", font=CJK, color=WHITE).scale(0.38),
            Text("· 14.2 激光原理", font=CJK, color=WHITE).scale(0.38),
        ).arrange(RIGHT, buff=0.3).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("想象一个弹球在高台上——", font=CJK).scale(0.48)
        ana2 = Text("它可以自己滚落（自发辐射），被推一下才上去（受激吸收），", font=CJK).scale(0.44)
        ana3 = Text("也可以被另一个球碰一下，两个球同时滚落（受激辐射）。", font=CJK).scale(0.44)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.55)
        ana.scale_to_fit_width(12.5)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.8)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 核心公式
        # ══════════════════════════════════════════════════════════════════════
        eq_label = Text("三种过程的光子频率均满足：", font=CJK, color=GREEN).scale(0.46)
        eq = MathTex(r"h\nu = E_2 - E_1", color=YELLOW).scale(1.0)
        eq_group = VGroup(eq_label, eq).arrange(RIGHT, buff=0.35)
        eq_group.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(eq_label), Write(eq))
        self.wait(2.0)
        self.play(FadeOut(eq_group))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 三列能级图框架
        # ══════════════════════════════════════════════════════════════════════
        # 三列中心 x 坐标
        CX = [-4.2, 0.0, 4.2]
        Y_LOW, Y_HIGH = -1.0, 0.5
        W = 2.6

        col_titles = [
            Text("自发辐射", font=CJK, color=SPONT_COL).scale(0.52),
            Text("受激吸收", font=CJK, color=PHOTON_IN).scale(0.52),
            Text("受激辐射", font=CJK, color=PHOTON_OUT).scale(0.52),
        ]
        # 列标题放在能级图上方
        col_title_y = Y_HIGH + 0.9
        for i, ct in enumerate(col_titles):
            ct.move_to([CX[i], col_title_y, 0])

        # 能级组
        levels = []
        for cx in CX:
            e1, e2, l1, l2 = make_energy_levels(cx, y_low=Y_LOW, y_high=Y_HIGH, width=W)
            levels.append((e1, e2, l1, l2))

        # 先显示列标题
        self.play(*[FadeIn(ct) for ct in col_titles])
        self.wait(0.4)

        # 画三列能级线
        for e1, e2, l1, l2 in levels:
            self.play(Create(e1), Create(e2), FadeIn(l1), FadeIn(l2), run_time=0.5)
        self.wait(0.8)

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 自发辐射（左列）
        # ══════════════════════════════════════════════════════════════════════
        cx0 = CX[0]
        # 粒子初始在 E₂
        p_spont = make_particle(cx0, Y_HIGH, color=PARTICLE)
        self.play(FadeIn(p_spont))
        self.wait(0.5)

        # 粒子向下跳
        arrow_down_s = Arrow(
            start=[cx0, Y_HIGH - 0.05, 0],
            end=[cx0, Y_LOW + 0.05, 0],
            buff=0.18,
            color=WHITE,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        self.play(GrowArrow(arrow_down_s), p_spont.animate.move_to([cx0, Y_LOW, 0]), run_time=0.8)
        self.wait(0.3)

        # 多个朝向不同的随机相位光子（自发）
        spont_photons = VGroup()
        directions = [
            ([cx0, Y_LOW + 0.4, 0], [cx0 - 1.2, Y_LOW - 0.3, 0]),  # 左下
            ([cx0, Y_LOW + 0.4, 0], [cx0 + 1.3, Y_LOW - 0.1, 0]),  # 右
            ([cx0, Y_LOW + 0.4, 0], [cx0 - 0.4, Y_LOW - 1.1, 0]),  # 下
            ([cx0, Y_LOW + 0.4, 0], [cx0 + 0.5, Y_LOW + 1.3, 0]),  # 上右
        ]
        for s, e in directions:
            w = wavy_arrow(s, e, color=SPONT_COL, amplitude=0.10, n_cycles=2.0)
            spont_photons.add(w)

        self.play(*[Create(ph) for ph in spont_photons], run_time=1.2)

        spont_note = Text("随机方向、随机相位", font=CJK, color=SPONT_COL).scale(0.38)
        spont_note.move_to([cx0, Y_LOW - 1.5, 0])
        self.play(FadeIn(spont_note))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: 受激吸收（中列）
        # ══════════════════════════════════════════════════════════════════════
        cx1 = CX[1]
        # 粒子初始在 E₁
        p_abs = make_particle(cx1, Y_LOW, color=PARTICLE)
        self.play(FadeIn(p_abs))

        # 入射光子从左射入
        photon_in_abs = wavy_arrow(
            [cx1 - 2.0, (Y_LOW + Y_HIGH) / 2, 0],
            [cx1 - 0.18, (Y_LOW + Y_HIGH) / 2, 0],
            color=PHOTON_IN, amplitude=0.12, n_cycles=2.5,
        )
        self.play(Create(photon_in_abs), run_time=0.8)
        self.wait(0.2)

        # 光子消失，粒子跳上 E₂
        arrow_up_abs = Arrow(
            start=[cx1, Y_LOW + 0.05, 0],
            end=[cx1, Y_HIGH - 0.05, 0],
            buff=0.18,
            color=WHITE,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        self.play(
            FadeOut(photon_in_abs),
            GrowArrow(arrow_up_abs),
            p_abs.animate.move_to([cx1, Y_HIGH, 0]),
            run_time=0.9,
        )
        abs_note = Text("光子消失，粒子跃迁至高能级", font=CJK, color=PHOTON_IN).scale(0.36)
        abs_note.move_to([cx1, Y_LOW - 1.5, 0])
        self.play(FadeIn(abs_note))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: 受激辐射（右列，重点）
        # ══════════════════════════════════════════════════════════════════════
        cx2 = CX[2]
        # 粒子初始在 E₂
        p_stim = make_particle(cx2, Y_HIGH, color=PARTICLE)
        self.play(FadeIn(p_stim))

        # 入射光子从左射入（红色）
        photon_in_stim = wavy_arrow(
            [cx2 - 2.1, Y_HIGH, 0],
            [cx2 - 0.2, Y_HIGH, 0],
            color=PHOTON_OUT, amplitude=0.11, n_cycles=2.5,
        )
        self.play(Create(photon_in_stim), run_time=0.8)
        self.wait(0.3)

        # 闪光效果：粒子触发
        flash = Flash(p_stim, color=PHOTON_OUT, flash_radius=0.35, line_length=0.2)
        self.play(flash, run_time=0.5)

        # 粒子向下跳
        arrow_down_stim = Arrow(
            start=[cx2, Y_HIGH - 0.05, 0],
            end=[cx2, Y_LOW + 0.05, 0],
            buff=0.18,
            color=WHITE,
            stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        self.play(
            GrowArrow(arrow_down_stim),
            p_stim.animate.move_to([cx2, Y_LOW, 0]),
            run_time=0.8,
        )

        # 两个完全相同的红色光子（平行波线，相位同步）
        # 将入射光子"克隆"为两条平行向右的波线
        offset = 0.18
        photon_clone1 = wavy_arrow(
            [cx2 + 0.1, Y_HIGH + offset, 0],
            [cx2 + 1.5, Y_HIGH + offset, 0],
            color=PHOTON_OUT, amplitude=0.10, n_cycles=2.0,
        )
        photon_clone2 = wavy_arrow(
            [cx2 + 0.1, Y_HIGH - offset, 0],
            [cx2 + 1.5, Y_HIGH - offset, 0],
            color=PHOTON_OUT, amplitude=0.10, n_cycles=2.0,
        )
        # 入射光子也顺势向右延伸（克隆感）
        photon_pass = wavy_arrow(
            [cx2 - 0.1, Y_HIGH, 0],
            [cx2 + 1.5, Y_HIGH, 0],
            color=PHOTON_OUT, amplitude=0.10, n_cycles=2.0,
        )
        self.play(
            Create(photon_clone1),
            Create(photon_clone2),
            Create(photon_pass),
            run_time=1.0,
        )

        # 强调"克隆"同步波纹
        ripple1 = Circle(radius=0.1, color=PHOTON_OUT, stroke_opacity=0.8).move_to([cx2 + 0.15, Y_HIGH, 0])
        ripple2 = Circle(radius=0.1, color=PHOTON_OUT, stroke_opacity=0.6).move_to([cx2 + 0.15, Y_HIGH, 0])
        self.play(
            ripple1.animate.scale(4).set_opacity(0),
            ripple2.animate.scale(6).set_opacity(0),
            run_time=0.8,
        )

        stim_note1 = Text("触发产生两个完全相同的光子", font=CJK, color=PHOTON_OUT).scale(0.36)
        stim_note2 = Text("频率、相位、方向完全一致", font=CJK, color=PHOTON_OUT).scale(0.36)
        stim_notes = VGroup(stim_note1, stim_note2).arrange(DOWN, buff=0.2)
        stim_notes.move_to([cx2, Y_LOW - 1.35, 0])
        self.play(FadeIn(stim_notes))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 清场，进入对比表
        # ══════════════════════════════════════════════════════════════════════
        all_diagram = VGroup(
            *[item for group in levels for item in group],
            *col_titles,
            p_spont, arrow_down_s, spont_photons, spont_note,
            p_abs, arrow_up_abs, abs_note,
            p_stim, arrow_down_stim,
            photon_clone1, photon_clone2, photon_pass,
            photon_in_abs, stim_notes,
            ripple1, ripple2,
        )
        self.play(FadeOut(all_diagram), run_time=1.0)
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 对比表格（逐行淡入）
        # ══════════════════════════════════════════════════════════════════════
        tbl_title = Text("三种辐射过程对比", font=CJK, color=BLUE).scale(0.6)
        tbl_title.next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(tbl_title))

        # 表头
        headers = ["属性", "自发辐射", "受激吸收", "受激辐射"]
        header_colors = [WHITE, SPONT_COL, PHOTON_IN, PHOTON_OUT]

        # 表格数据（属性 | 自发 | 受激吸收 | 受激辐射）
        rows_data = [
            ["频率", r"h\nu=E_2-E_1", r"h\nu=E_2-E_1", r"h\nu=E_2-E_1"],
            ["相位",    "随机",         "—",              "与入射光同相位"],
            ["方向",    "随机",         "—",              "与入射光同方向"],
            ["需要外来光子", "否",       "是",             "是"],
            ["光子数变化",  "-1",        "+1  (E1→E2)",   "+1  (E2→E1)"],
        ]

        COL_X = [-3.0, -0.5, 1.7, 3.9]
        ROW_Y_START = 0.9
        ROW_DY = 0.62

        # 表头行
        header_objs = VGroup()
        for j, (h, hc) in enumerate(zip(headers, header_colors)):
            ht = Text(h, font=CJK, color=hc).scale(0.42)
            ht.move_to([COL_X[j], ROW_Y_START, 0])
            header_objs.add(ht)
        # 横线
        hline = Line(
            [COL_X[0] - 0.5, ROW_Y_START - 0.28, 0],
            [COL_X[3] + 1.2, ROW_Y_START - 0.28, 0],
            color=BLUE_B, stroke_width=1.5,
        )
        self.play(FadeIn(header_objs), Create(hline))
        self.wait(0.5)

        row_colors_data = [WHITE, SPONT_COL, PHOTON_IN, PHOTON_OUT]

        for i, row in enumerate(rows_data):
            row_y = ROW_Y_START - (i + 1) * ROW_DY
            row_objs = VGroup()
            for j, cell in enumerate(row):
                col_color = row_colors_data[j] if j > 0 else GRAY_A
                # 第一列用中文 Text，其余列：纯数学用 MathTex，否则用 Text
                if j == 0:
                    obj = Text(cell, font=CJK, color=GRAY_A).scale(0.40)
                elif cell.startswith("h\\"):
                    obj = MathTex(cell, color=col_color).scale(0.45)
                else:
                    obj = Text(cell, font=CJK, color=col_color).scale(0.40)
                obj.move_to([COL_X[j], row_y, 0])
                row_objs.add(obj)
            self.play(FadeIn(row_objs), run_time=0.55)
            self.wait(0.7)

        self.wait(1.5)

        # ══════════════════════════════════════════════════════════════════════
        # Step 10: 受激辐射特别强调（粒子数反转是激光核心）
        # ══════════════════════════════════════════════════════════════════════
        emphasis = VGroup(
            Text("受激辐射 → 光放大 → 激光（LASER）", font=CJK, color=PHOTON_OUT).scale(0.50),
            Text("关键条件：粒子数反转（N₂ > N₁）", font=CJK, color=YELLOW).scale(0.46),
        ).arrange(DOWN, buff=0.3)
        emphasis.to_edge(DOWN, buff=0.6)
        box_em = SurroundingRectangle(emphasis, color=PHOTON_OUT, buff=0.22, corner_radius=0.12)
        self.play(FadeIn(emphasis), Create(box_em))
        self.wait(2.0)

        # ══════════════════════════════════════════════════════════════════════
        # Step 11: 小结卡
        # ══════════════════════════════════════════════════════════════════════
        self.play(FadeOut(emphasis), FadeOut(box_em))
        self.wait(0.3)

        # 清掉表格
        self.play(
            *[FadeOut(m) for m in self.mobjects if m is not title and m is not tbl_title],
            run_time=0.8,
        )
        self.wait(0.2)

        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        s1 = VGroup(
            Text("三种过程光子频率相同：", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"h\nu = E_2 - E_1", color=YELLOW).scale(0.8),
        ).arrange(RIGHT, buff=0.25)

        s2 = Text("自发辐射：随机方向/相位，非相干光", font=CJK, color=SPONT_COL).scale(0.44)
        s3 = Text("受激吸收：光子被粒子吸收，粒子跃迁到高能级", font=CJK, color=PHOTON_IN).scale(0.44)
        s4 = VGroup(
            Text("受激辐射：一变二，输出光与入射光", font=CJK, color=PHOTON_OUT).scale(0.44),
            Text("频率/相位/方向完全相同", font=CJK, color=PHOTON_OUT).scale(0.44),
        ).arrange(RIGHT, buff=0.2)
        s5 = Text("受激辐射是激光产生的物理基础", font=CJK, color=GREEN).scale(0.46)

        summary = VGroup(s1, s2, s3, s4, s5).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.5)

        box_sum = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1), run_time=0.7)
        self.play(FadeIn(s2), run_time=0.5)
        self.play(FadeIn(s3), run_time=0.5)
        self.play(FadeIn(s4), run_time=0.5)
        self.play(FadeIn(s5), Create(box_sum), run_time=0.7)
        self.wait(2.5)

        self.play(FadeOut(VGroup(title, s_title, summary, box_sum)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch14Kp1ThreeRadiativeProcesses",
        "id": "phys-ch14-14.2-kp1-three-radiative-processes",
        "chapterId": "ch14",
        "sectionId": "14.2",
        "title": "三种辐射过程：自发辐射、受激吸收、受激辐射",
        "description": "三列并排能级图演示自发辐射（随机方向光子）、受激吸收（光子消失粒子跃迁）、受激辐射（一变二完全相干），并以逐行淡入对比表格汇总四项属性差异。",
    }
]
