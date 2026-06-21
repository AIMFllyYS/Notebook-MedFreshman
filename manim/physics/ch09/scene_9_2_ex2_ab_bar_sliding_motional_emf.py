"""第 9.2 节 · 例题2：导体棒 ab 在匀强磁场中滑动的动生电动势

俯视图布局：水平导轨 + 导体棒 ab（绿色）+ 外电阻 R（右端）+ 竖直向上 B（蓝色点阵）。
分四步完整演示：非静电场方向 → 电荷积累/电流 → 定量计算 → 安培力/能量守恒。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 布局常数（俯视图坐标，中心原点） ──────────────────────────────────────
RAIL_Y_TOP = 1.4      # 上导轨 y 坐标
RAIL_Y_BOT = -1.4     # 下导轨 y 坐标
RAIL_X_LEFT = -3.8    # 导轨左端
RAIL_X_RIGHT = 3.2    # 导轨右端
BAR_X = 0.0           # 导体棒 ab 的 x 位置（初始）
R_X = 2.8             # 外电阻 x 位置


def make_rail_and_bar(bar_x=BAR_X):
    """返回 (rails_group, bar_line, label_a, label_b)"""
    top_rail = Line(
        start=[RAIL_X_LEFT, RAIL_Y_TOP, 0],
        end=[R_X, RAIL_Y_TOP, 0],
        color=GREY, stroke_width=5
    )
    bot_rail = Line(
        start=[RAIL_X_LEFT, RAIL_Y_BOT, 0],
        end=[R_X, RAIL_Y_BOT, 0],
        color=GREY, stroke_width=5
    )
    # 外电阻 R（右端竖线代替）
    res = Line(
        start=[R_X, RAIL_Y_TOP, 0],
        end=[R_X, RAIL_Y_BOT, 0],
        color=ORANGE, stroke_width=6
    )
    r_label = VGroup(
        Text("R", font=CJK, color=ORANGE).scale(0.5),
        MathTex(r"= 0.5\,\Omega", color=ORANGE).scale(0.55)
    ).arrange(RIGHT, buff=0.08).next_to(res, RIGHT, buff=0.12)

    # 导体棒 ab
    bar = Line(
        start=[bar_x, RAIL_Y_BOT, 0],
        end=[bar_x, RAIL_Y_TOP, 0],
        color=GREEN, stroke_width=7
    )
    label_a = Text("a", font=CJK, color=GREEN).scale(0.55).next_to(
        np.array([bar_x, RAIL_Y_TOP, 0]), UP, buff=0.12
    )
    label_b = Text("b", font=CJK, color=GREEN).scale(0.55).next_to(
        np.array([bar_x, RAIL_Y_BOT, 0]), DOWN, buff=0.12
    )
    rails = VGroup(top_rail, bot_rail, res, r_label)
    return rails, bar, label_a, label_b


def make_b_dots(x_min=-3.6, x_max=2.6, y_min=-1.2, y_max=1.2, spacing=0.65):
    """竖直向上的 B 场用蓝色点阵表示（俯视图中点表示场向屏幕外）"""
    dots = VGroup()
    xs = np.arange(x_min, x_max + 0.01, spacing)
    ys = np.arange(y_min, y_max + 0.01, spacing)
    for x in xs:
        for y in ys:
            d = Dot(point=[x, y, 0], radius=0.055, color=BLUE)
            dots.add(d)
    return dots


class Ch09Ex2AbBarSlidingMotionalEmf(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("导体棒在匀强磁场中滑动的动生电动势",
                     font=CJK, color=BLUE).scale(0.58).to_edge(UP, buff=0.28)
        sub = VGroup(
            Text("第9章 电磁感应与电磁波", font=CJK, color=WHITE).scale(0.38),
            Text("· 9.2 例题精讲", font=CJK, color=GREY).scale(0.38)
        ).arrange(RIGHT, buff=0.2).next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(sub))
        self.wait(1.5)
        self.play(FadeOut(sub))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("想象你用手推一根铜棒在两根轨道上滑动，", font=CJK).scale(0.46)
        ana2 = Text("铜棒里的自由电子随着棒一起运动，", font=CJK).scale(0.46)
        ana3 = Text("磁场对运动电子施力 → 电子向一端堆积 → 产生电动势！", font=CJK, color=YELLOW).scale(0.46)
        ana_grp = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_grp.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_grp))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 搭建俯视图：导轨 + B 点阵 + 导体棒
        # ══════════════════════════════════════════════════════════════════
        scene_grp = VGroup()  # 汇总，方便最后 FadeOut

        rails, bar, lbl_a, lbl_b = make_rail_and_bar(BAR_X)
        b_dots = make_b_dots()

        # B 标注
        b_label = VGroup(
            MathTex(r"\vec{B}", color=BLUE).scale(0.65),
            Text("（垂直纸面向上）", font=CJK, color=BLUE).scale(0.38)
        ).arrange(RIGHT, buff=0.1).to_corner(UL, buff=0.55).shift(DOWN * 0.9)

        # 题目参数
        param_b = VGroup(
            Text("已知：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"B=1\,\mathrm{T},\;l=1\,\mathrm{m},\;v=1\,\mathrm{m/s},\;R=0.5\,\Omega",
                    color=CYAN).scale(0.5)
        ).arrange(RIGHT, buff=0.1).to_edge(DOWN, buff=0.38)

        self.play(Create(b_dots), run_time=1.0)
        self.play(FadeIn(b_label))
        self.play(Create(rails), run_time=0.8)
        self.play(Create(bar), FadeIn(lbl_a), FadeIn(lbl_b))
        self.play(FadeIn(param_b))
        self.wait(1.2)

        scene_grp.add(b_dots, b_label, rails, bar, lbl_a, lbl_b, param_b)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 矢量分解 — v、B、v×B（非静电场方向）
        # ══════════════════════════════════════════════════════════════════
        bar_mid = np.array([BAR_X, 0.0, 0])

        # 速度箭头 v（向右）
        arr_v = Arrow(
            start=bar_mid + LEFT * 0.1,
            end=bar_mid + RIGHT * 1.15,
            buff=0, color=GREEN, stroke_width=5,
            max_tip_length_to_length_ratio=0.25
        )
        lbl_v = VGroup(
            MathTex(r"\vec{v}", color=GREEN).scale(0.6),
            Text("（向右）", font=CJK, color=GREEN).scale(0.38)
        ).arrange(RIGHT, buff=0.06).next_to(arr_v, UP, buff=0.1)

        # B 方向提示箭头（向上，小）
        arr_b_small = Arrow(
            start=bar_mid + DOWN * 0.05,
            end=bar_mid + UP * 0.9,
            buff=0, color=BLUE, stroke_width=4,
            max_tip_length_to_length_ratio=0.25
        )
        lbl_b_small = VGroup(
            MathTex(r"\vec{B}", color=BLUE).scale(0.55),
            Text("（向上）", font=CJK, color=BLUE).scale(0.35)
        ).arrange(RIGHT, buff=0.05).next_to(arr_b_small, LEFT, buff=0.1)

        # v×B 方向（v 向右 × B 向上 = 向 a 端，即棒内向 a 即向上方向——
        # 注意：俯视图里 B 向屏幕外，v 向右；v×B = right × out-of-screen = UP_SCREEN 即 a 端）
        # 但在俯视图中 a 在上端，b 在下端
        arr_fk = Arrow(
            start=bar_mid + DOWN * 0.05,
            end=bar_mid + UP * 1.1,
            buff=0, color=RED, stroke_width=5,
            max_tip_length_to_length_ratio=0.25
        )
        lbl_fk = VGroup(
            MathTex(r"q\vec{v}\times\vec{B}", color=RED).scale(0.52),
            Text("（非静电力，向a端）", font=CJK, color=RED).scale(0.36)
        ).arrange(DOWN, buff=0.06).next_to(arr_fk, RIGHT, buff=0.1)

        # Ek 公式
        ek_formula = VGroup(
            Text("非静电场强：", font=CJK, color=YELLOW).scale(0.44),
            MathTex(r"E_K = vB", color=YELLOW).scale(0.65)
        ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.5).shift(DOWN * 0.8)

        caption_step3 = Text("自由电子受洛伦兹力从 b 端被推向 a 端", font=CJK, color=ORANGE).scale(0.42)
        caption_step3.to_edge(DOWN, buff=1.1)

        self.play(GrowArrow(arr_v), FadeIn(lbl_v))
        self.wait(0.7)
        self.play(GrowArrow(arr_b_small), FadeIn(lbl_b_small))
        self.wait(0.7)
        self.play(GrowArrow(arr_fk), FadeIn(lbl_fk))
        self.wait(0.8)
        self.play(FadeIn(ek_formula), FadeIn(caption_step3))
        self.wait(1.5)

        scene_grp.add(arr_v, lbl_v, arr_b_small, lbl_b_small, arr_fk, lbl_fk, ek_formula, caption_step3)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 电荷积累 + 流动粒子动画示意电流方向
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(arr_b_small), FadeOut(lbl_b_small),
                  FadeOut(arr_fk), FadeOut(lbl_fk),
                  FadeOut(arr_v), FadeOut(lbl_v),
                  FadeOut(ek_formula), FadeOut(caption_step3))

        # a 端正极标记，b 端负极标记
        pos_mark = Text("+", font=CJK, color=RED, font_size=40).next_to(
            np.array([BAR_X, RAIL_Y_TOP, 0]), LEFT, buff=0.25
        )
        neg_mark = Text("-", font=CJK, color=BLUE, font_size=40).next_to(
            np.array([BAR_X, RAIL_Y_BOT, 0]), LEFT, buff=0.25
        )
        charge_caption = VGroup(
            Text("a 端积累正电荷（电势高）", font=CJK, color=RED).scale(0.42),
            Text("b 端积累负电荷（电势低）", font=CJK, color=BLUE_B).scale(0.42)
        ).arrange(DOWN, buff=0.12).to_corner(UR, buff=0.45).shift(DOWN * 0.7)

        self.play(FadeIn(pos_mark), FadeIn(neg_mark), FadeIn(charge_caption))
        self.wait(1.0)

        # 流动粒子动画：外电路 a→R→b，棒内 b→a
        # 用若干 Dot 沿路径运动模拟电流
        def particle_along_path(path_points, color=YELLOW, n=4, run_time=2.0):
            """在给定折线路径上创建流动粒子动画列表"""
            anims = []
            total_len = sum(
                np.linalg.norm(np.array(path_points[i+1]) - np.array(path_points[i]))
                for i in range(len(path_points)-1)
            )
            for k in range(n):
                dot = Dot(radius=0.10, color=color)
                dot.move_to(path_points[0])
                delay = k / n * run_time

                def make_anim(d=dot, pts=path_points):
                    mobj_anims = []
                    for i in range(len(pts)-1):
                        seg_len = np.linalg.norm(np.array(pts[i+1]) - np.array(pts[i]))
                        t = seg_len / total_len
                        mobj_anims.append(d.animate.move_to(pts[i+1]).set_run_time(t * run_time))
                    return Succession(*mobj_anims)
                anims.append(make_anim())
            return anims

        # 外电路路径（a端上 → 右 → R → 右下 → b端下）：电流从 a→外→b
        ext_path = [
            [BAR_X, RAIL_Y_TOP, 0],
            [R_X, RAIL_Y_TOP, 0],
            [R_X, RAIL_Y_BOT, 0],
            [BAR_X, RAIL_Y_BOT, 0],
        ]
        # 棒内路径 b→a
        bar_path = [
            [BAR_X, RAIL_Y_BOT, 0],
            [BAR_X, RAIL_Y_TOP, 0],
        ]

        # 外电路粒子
        ext_dots = [Dot(radius=0.10, color=YELLOW) for _ in range(4)]
        for i, d in enumerate(ext_dots):
            d.move_to(ext_path[0])

        bar_dots = [Dot(radius=0.10, color=ORANGE) for _ in range(3)]
        for d in bar_dots:
            d.move_to(bar_path[0])

        current_label = VGroup(
            Text("外电路电流方向：a", font=CJK, color=YELLOW).scale(0.40),
            MathTex(r"\rightarrow", color=YELLOW).scale(0.6),
            Text("R", font=CJK, color=YELLOW).scale(0.40),
            MathTex(r"\rightarrow", color=YELLOW).scale(0.6),
            Text("b", font=CJK, color=YELLOW).scale(0.40),
        ).arrange(RIGHT, buff=0.05).to_edge(DOWN, buff=1.15)
        bar_current_label = VGroup(
            Text("棒内：b", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"\rightarrow", color=ORANGE).scale(0.6),
            Text("a（非静电力做功）", font=CJK, color=ORANGE).scale(0.40)
        ).arrange(RIGHT, buff=0.05).next_to(current_label, DOWN, buff=0.12)

        self.play(FadeIn(current_label), FadeIn(bar_current_label))

        # 添加粒子并做动画（Succession 套 LaggedStart）
        for d in ext_dots + bar_dots:
            self.add(d)

        # 外路粒子
        ext_anims = []
        total_ext = sum(np.linalg.norm(np.array(ext_path[i+1])-np.array(ext_path[i]))
                        for i in range(len(ext_path)-1))
        for k, dot in enumerate(ext_dots):
            segs = []
            for i in range(len(ext_path)-1):
                seg = np.linalg.norm(np.array(ext_path[i+1])-np.array(ext_path[i]))
                segs.append(MoveAlongPath(dot, VMobject().set_points_as_corners(
                    [ext_path[i], ext_path[i+1]]), run_time=seg/total_ext*2.5))
            ext_anims.append(Succession(*segs))

        # 棒内粒子
        bar_anims = []
        for k, dot in enumerate(bar_dots):
            bar_anims.append(
                MoveAlongPath(dot, VMobject().set_points_as_corners(bar_path), run_time=1.0)
            )

        self.play(LaggedStart(*ext_anims, lag_ratio=0.25), run_time=2.8)
        self.play(LaggedStart(*bar_anims, lag_ratio=0.3), run_time=1.2)
        self.wait(0.8)

        # 清理粒子
        self.play(*[FadeOut(d) for d in ext_dots + bar_dots])
        scene_grp.add(pos_mark, neg_mark, charge_caption, current_label, bar_current_label)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 定量计算（左侧栏逐步淡入）
        # ══════════════════════════════════════════════════════════════════
        self.play(FadeOut(charge_caption), FadeOut(current_label), FadeOut(bar_current_label))

        calc_title = Text("定量计算", font=CJK, color=BLUE).scale(0.5).to_corner(UL, buff=0.5).shift(DOWN * 0.9)

        # ε = Blv
        row1_zh = Text("动生电动势：", font=CJK, color=WHITE).scale(0.43)
        row1_f = MathTex(r"\varepsilon = Blv = 1\times1\times1 = 1.0\,\mathrm{V}", color=YELLOW).scale(0.55)
        row1 = VGroup(row1_zh, row1_f).arrange(RIGHT, buff=0.1)

        # I = ε/R
        row2_zh = Text("电路电流：", font=CJK, color=WHITE).scale(0.43)
        row2_f = MathTex(r"I = \frac{\varepsilon}{R} = \frac{1.0}{0.5} = 2.0\,\mathrm{A}", color=GREEN).scale(0.55)
        row2 = VGroup(row2_zh, row2_f).arrange(RIGHT, buff=0.1)

        # P = ε²/R
        row3_zh = Text("电功率：", font=CJK, color=WHITE).scale(0.43)
        row3_f = MathTex(r"P = \frac{\varepsilon^2}{R} = \frac{1.0^2}{0.5} = 2.0\,\mathrm{W}", color=GREEN).scale(0.55)
        row3 = VGroup(row3_zh, row3_f).arrange(RIGHT, buff=0.1)

        calc_grp = VGroup(row1, row2, row3).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        calc_grp.next_to(calc_title, DOWN, buff=0.3)
        # 防止超出左边界
        calc_grp.to_edge(LEFT, buff=0.35).shift(DOWN * 1.0)

        self.play(FadeIn(calc_title))
        self.wait(0.3)
        self.play(FadeIn(row1))
        self.wait(1.0)
        self.play(FadeIn(row2))
        self.wait(1.0)
        self.play(FadeIn(row3))
        self.wait(1.4)

        scene_grp.add(calc_title, calc_grp)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 安培力 & 外拉力（力平衡示意）
        # ══════════════════════════════════════════════════════════════════
        bar_center = np.array([BAR_X, 0.0, 0])

        # 安培力 F_安（向左，阻碍运动）
        arr_fa = Arrow(
            start=bar_center + RIGHT * 0.05,
            end=bar_center + LEFT * 1.2,
            buff=0, color=RED, stroke_width=5,
            max_tip_length_to_length_ratio=0.22
        )
        lbl_fa = VGroup(
            MathTex(r"F_{\text{A}}", color=RED).scale(0.55),
            Text("安培力（向左）", font=CJK, color=RED).scale(0.38)
        ).arrange(DOWN, buff=0.06).next_to(arr_fa, DOWN, buff=0.1)

        # 外拉力（向右，维持匀速）
        arr_fp = Arrow(
            start=bar_center + LEFT * 0.05,
            end=bar_center + RIGHT * 1.2,
            buff=0, color=GREEN, stroke_width=5,
            max_tip_length_to_length_ratio=0.22
        )
        lbl_fp = VGroup(
            MathTex(r"F_{\text{pull}}", color=GREEN).scale(0.55),
            Text("外拉力（向右）", font=CJK, color=GREEN).scale(0.38)
        ).arrange(DOWN, buff=0.06).next_to(arr_fp, UP, buff=0.08)

        fa_formula = VGroup(
            Text("安培力大小：", font=CJK, color=RED).scale(0.42),
            MathTex(r"F_A = BIl = 1\times2\times1 = 2\,\mathrm{N}", color=RED).scale(0.52)
        ).arrange(RIGHT, buff=0.08).to_corner(UR, buff=0.4).shift(DOWN * 0.85)

        pull_eq = VGroup(
            Text("匀速 → 合力为零：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"F_{\text{pull}} = F_A = 2\,\mathrm{N}", color=GREEN).scale(0.52)
        ).arrange(RIGHT, buff=0.08).next_to(fa_formula, DOWN, buff=0.22)

        self.play(GrowArrow(arr_fa), FadeIn(lbl_fa))
        self.wait(0.6)
        self.play(GrowArrow(arr_fp), FadeIn(lbl_fp))
        self.wait(0.6)
        self.play(FadeIn(fa_formula))
        self.wait(0.7)
        self.play(FadeIn(pull_eq))
        self.wait(1.4)

        scene_grp.add(arr_fa, lbl_fa, arr_fp, lbl_fp, fa_formula, pull_eq)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 能量流向图
        # ══════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(arr_fa), FadeOut(lbl_fa),
            FadeOut(arr_fp), FadeOut(lbl_fp),
            FadeOut(fa_formula), FadeOut(pull_eq),
            FadeOut(calc_title), FadeOut(calc_grp),
            FadeOut(pos_mark), FadeOut(neg_mark),
        )

        energy_title = Text("能量守恒：机械能 → 电能 → 热能", font=CJK, color=BLUE).scale(0.48)
        energy_title.next_to(title, DOWN, buff=0.5)

        box_mech = SurroundingRectangle(
            Text("外力做功\n(机械能)", font=CJK, color=WHITE).scale(0.45),
            color=GREEN, buff=0.18, corner_radius=0.1
        )
        txt_mech = Text("外力做功\n(机械能)", font=CJK, color=WHITE).scale(0.45)
        g_mech = VGroup(txt_mech, box_mech)
        box_mech.surround(txt_mech, buff=0.18)

        arr_e1 = Arrow(LEFT * 0.2, RIGHT * 0.2, buff=0, color=YELLOW, stroke_width=4,
                       max_tip_length_to_length_ratio=0.35)

        txt_elec = Text("电能\n(EMF)", font=CJK, color=YELLOW).scale(0.45)
        box_elec = SurroundingRectangle(txt_elec, color=YELLOW, buff=0.18, corner_radius=0.1)
        g_elec = VGroup(txt_elec, box_elec)
        box_elec.surround(txt_elec, buff=0.18)

        arr_e2 = Arrow(LEFT * 0.2, RIGHT * 0.2, buff=0, color=RED, stroke_width=4,
                       max_tip_length_to_length_ratio=0.35)

        txt_heat = Text("热能\n(焦耳热)", font=CJK, color=RED).scale(0.45)
        box_heat = SurroundingRectangle(txt_heat, color=RED, buff=0.18, corner_radius=0.1)
        g_heat = VGroup(txt_heat, box_heat)
        box_heat.surround(txt_heat, buff=0.18)

        energy_chain = VGroup(g_mech, arr_e1, g_elec, arr_e2, g_heat).arrange(RIGHT, buff=0.22)
        energy_chain.next_to(energy_title, DOWN, buff=0.45)
        energy_chain.scale_to_fit_width(11.5)

        pwr_note = VGroup(
            Text("功率守恒：", font=CJK, color=WHITE).scale(0.43),
            MathTex(r"P_{\text{pull}} = F_A \cdot v = 2\times1 = 2\,\mathrm{W} = P_{\text{elec}}", color=CYAN).scale(0.52)
        ).arrange(RIGHT, buff=0.1).next_to(energy_chain, DOWN, buff=0.38)

        self.play(FadeIn(energy_title))
        self.play(FadeIn(g_mech))
        self.wait(0.4)
        self.play(GrowArrow(arr_e1), FadeIn(g_elec))
        self.wait(0.4)
        self.play(GrowArrow(arr_e2), FadeIn(g_heat))
        self.wait(0.8)
        self.play(FadeIn(pwr_note))
        self.wait(1.6)

        self.play(FadeOut(energy_title), FadeOut(energy_chain), FadeOut(pwr_note))
        self.play(FadeOut(scene_grp))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡（关键公式汇总）
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1_zh = Text("动生电动势：", font=CJK, color=WHITE).scale(0.44)
        s1_f = MathTex(r"\varepsilon = Blv", color=YELLOW).scale(0.75)
        s1 = VGroup(s1_zh, s1_f).arrange(RIGHT, buff=0.12)

        s2_zh = Text("功率公式：", font=CJK, color=WHITE).scale(0.44)
        s2_f = MathTex(r"P = \frac{\varepsilon^2}{R} = \frac{B^2 l^2 v^2}{R}", color=YELLOW).scale(0.75)
        s2 = VGroup(s2_zh, s2_f).arrange(RIGHT, buff=0.12)

        s3_zh = Text("安培阻力：", font=CJK, color=WHITE).scale(0.44)
        s3_f = MathTex(r"F_{\text{pull}} = BIl = \frac{B^2 l^2 v}{R}", color=GREEN).scale(0.75)
        s3 = VGroup(s3_zh, s3_f).arrange(RIGHT, buff=0.12)

        s4 = Text("三者等价：外力做功全部转化为电热", font=CJK, color=CYAN).scale(0.44)

        s_grp = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s_grp.next_to(s_title, DOWN, buff=0.38)
        s_grp.scale_to_fit_width(11.5)

        box = SurroundingRectangle(s_grp, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.wait(0.6)
        self.play(FadeIn(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4), Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s_grp, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch09Ex2AbBarSlidingMotionalEmf",
        "id": "phys-ch09-9.2-ex2-ab-bar-sliding-motional-emf",
        "chapterId": "ch09",
        "sectionId": "9.2",
        "title": "导体棒在匀强磁场中滑动的动生电动势",
        "description": "俯视图演示导体棒 ab 在匀强磁场中匀速滑动：从洛伦兹力分析到 ε=Blv、I、P 的逐步计算，再到安培阻力与能量守恒的完整闭环。",
    },
]
