"""第 10.3 节 · 眼的调节：近点、远点与明视距离

可视化方案：
- 简约眼截面剖面图（角膜 + 眼内 n=1.33 介质 + 视网膜竖线）
- ValueTracker 控制物距 u，同步调整曲率半径 r，使像落在视网膜处
- 正视眼 → 近视眼 → 远视眼 依次演示，凹/凸透镜矫正

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 眼截面几何常数 ────────────────────────────────────────────────────────────
EYE_LEFT_X   = -4.5     # 角膜位置（世界坐标 x）
EYE_RIGHT_X  =  0.0     # 视网膜位置（x）
EYE_HALF_H   =  1.2     # 眼球半高
LENS_X       = -3.6     # 晶状体中心 x
RETINA_X     =  0.0     # 与 EYE_RIGHT_X 同
OBJ_X_25cm   = -8.0     # 物体在画面上的位置（25cm 物距对应）
OBJ_X_INF    = -12.0    # "无穷远"物体（屏幕外，用光线平行表示）

GREEN_LIGHT = "#22DD88"


def make_eye_cross_section(lens_r_scale=1.0):
    """
    返回 VGroup：角膜弧 + 眼壁（上/下直线）+ 视网膜竖线 + 晶状体椭圆
    lens_r_scale: 晶状体曲率调整因子（1.0 = 远点放松；0.0 = 近点最大调节）
    """
    eye = VGroup()

    # 上下眼壁（水平线）
    top_wall = Line([EYE_LEFT_X,  EYE_HALF_H, 0], [EYE_RIGHT_X,  EYE_HALF_H, 0], color=WHITE, stroke_width=2)
    bot_wall = Line([EYE_LEFT_X, -EYE_HALF_H, 0], [EYE_RIGHT_X, -EYE_HALF_H, 0], color=WHITE, stroke_width=2)

    # 角膜（左侧弧线，用椭弧近似）
    cornea = Arc(radius=0.45, start_angle=-PI/2.2, angle=PI/1.1,
                 color=CYAN, stroke_width=3)
    cornea.move_to([EYE_LEFT_X + 0.38, 0, 0])

    # 视网膜（竖直线）
    retina = Line([RETINA_X,  EYE_HALF_H, 0],
                  [RETINA_X, -EYE_HALF_H, 0],
                  color=YELLOW, stroke_width=3)

    # 晶状体（椭圆，曲率由 lens_r_scale 控制）
    # 近点时（lens_r_scale=0）更圆（半径小），远点时（1）更扁（半径大）
    lx = 0.12 + 0.08 * lens_r_scale   # 横轴
    ly = 0.55 - 0.10 * lens_r_scale   # 纵轴
    lens = Ellipse(width=lx * 2, height=ly * 2,
                   color=GREEN_LIGHT, stroke_width=2, fill_opacity=0.15,
                   fill_color=GREEN_LIGHT)
    lens.move_to([LENS_X, 0, 0])

    eye.add(top_wall, bot_wall, cornea, retina, lens)
    return eye


def make_ray_group(u_frac, focus_x, colors=None):
    """
    从物体（左侧）发出 3 条光线，经晶状体折射，汇聚到 focus_x（像点 x）。
    u_frac: 0=近 1=远，仅影响入射光线角度
    focus_x: 像点落在哪里（视网膜 = RETINA_X；视网膜前 < RETINA_X；后 > RETINA_X）
    """
    if colors is None:
        colors = [ORANGE, ORANGE, ORANGE]
    ray_group = VGroup()

    obj_x = EYE_LEFT_X - 2.5 - u_frac * 3.0
    # 3 条光线：中轴、偏上、偏下
    offsets = [0.0, EYE_HALF_H * 0.55, -EYE_HALF_H * 0.55]
    for i, oy in enumerate(offsets):
        start = [obj_x, oy, 0]
        mid   = [LENS_X, oy * 0.4, 0]  # 简化：光线在晶状体处汇聚方向转折
        end   = [focus_x, 0, 0]
        seg1 = Line(start, mid, color=colors[i], stroke_width=1.5)
        seg2 = Line(mid,  end, color=colors[i], stroke_width=1.5)
        ray_group.add(seg1, seg2)

    return ray_group


class Ch10Kp1EyeAccommodationMechanism(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════════
        title = Text("眼的调节：近点、远点与明视距离",
                     font=CJK, color=BLUE).scale(0.62).to_edge(UP)
        subtitle = Text("第十章 几何光学 · 10.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════════
        ana1 = Text("眼睛看近处和远处，感觉都很清晰——", font=CJK).scale(0.48)
        ana2 = Text("这是因为晶状体会自动改变曲率（\"调节\"），", font=CJK).scale(0.48)
        ana3 = Text("让来自不同距离的光线始终聚焦在视网膜上。", font=CJK).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        ana.next_to(title, DOWN, buff=0.5).shift(RIGHT * 0.5)
        for a in ana:
            self.play(FadeIn(a))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════════════════
        # Step 3: 折射定律公式（逐行出现 + 高亮）
        # ══════════════════════════════════════════════════════════════════════
        defi_label = Text("单折射球面公式（折射率 n₁→n₂，曲率半径 r）：",
                          font=CJK).scale(0.42).next_to(title, DOWN, buff=0.45)
        refr_eq = MathTex(
            r"\frac{n_1}{u}", r"+", r"\frac{n_2}{v}",
            r"=", r"\frac{n_2 - n_1}{r}"
        ).scale(0.90)
        refr_eq.next_to(defi_label, DOWN, buff=0.35)
        refr_eq[0].set_color(ORANGE)
        refr_eq[2].set_color(YELLOW)
        refr_eq[4].set_color(CYAN)

        explain_n1 = VGroup(
            Text("n1=1.0（空气）", font=CJK, color=ORANGE).scale(0.38),
            Text("u = 物距", font=CJK, color=ORANGE).scale(0.38),
        ).arrange(RIGHT, buff=0.3)
        explain_n2 = VGroup(
            Text("n2=1.33（眼内）", font=CJK, color=YELLOW).scale(0.38),
            Text("v = 像距（到视网膜）", font=CJK, color=YELLOW).scale(0.38),
        ).arrange(RIGHT, buff=0.3)
        explain_r  = Text("r = 晶状体曲率半径（调节的本质！）",
                          font=CJK, color=CYAN).scale(0.38)
        explains = VGroup(explain_n1, explain_n2, explain_r).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        explains.next_to(refr_eq, DOWN, buff=0.35)

        self.play(FadeIn(defi_label))
        self.play(Write(refr_eq))
        self.wait(0.8)
        self.play(FadeIn(explain_n1))
        self.wait(0.5)
        self.play(FadeIn(explain_n2))
        self.wait(0.5)
        self.play(FadeIn(explain_r))
        self.wait(1.6)
        self.play(FadeOut(VGroup(defi_label, refr_eq, explains)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 4: 眼截面 + ValueTracker 展示"调节就是改变 r"
        # ══════════════════════════════════════════════════════════════════════
        sec4_label = Text("正视眼调节演示：物距从 25cm → 无穷远",
                          font=CJK, color=BLUE).scale(0.42).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec4_label))

        # ValueTracker: 0 = 近点(25cm), 1 = 远点(∞)
        t = ValueTracker(0.0)

        # 眼截面（静态外壁 + 动态晶状体）
        # 先画静态部分
        # 上下眼壁
        top_wall = Line([EYE_LEFT_X,  EYE_HALF_H, 0],
                        [EYE_RIGHT_X,  EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        bot_wall = Line([EYE_LEFT_X, -EYE_HALF_H, 0],
                        [EYE_RIGHT_X, -EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        cornea   = Arc(radius=0.45, start_angle=-PI/2.2, angle=PI/1.1,
                       color=CYAN, stroke_width=3)
        cornea.move_to([EYE_LEFT_X + 0.38, 0, 0])
        retina   = Line([RETINA_X,  EYE_HALF_H, 0],
                        [RETINA_X, -EYE_HALF_H, 0], color=YELLOW, stroke_width=3)

        # 静态标签
        cornea_lbl = Text("角膜", font=CJK, color=CYAN).scale(0.35)
        cornea_lbl.next_to(cornea, LEFT, buff=0.1)
        retina_lbl = Text("视网膜", font=CJK, color=YELLOW).scale(0.35)
        retina_lbl.next_to(retina, RIGHT, buff=0.12)

        # "眼内"区域填充提示
        n_label = MathTex(r"n_2 = 1.33", color=WHITE).scale(0.42)
        n_label.move_to([-2.5, -0.7, 0])

        # 晶状体（动态）
        def make_lens():
            s = t.get_value()                          # 0=近, 1=远
            lx = 0.12 + 0.08 * s
            ly = 0.55 - 0.10 * s
            lens = Ellipse(width=lx * 2, height=ly * 2,
                           color=GREEN_LIGHT, stroke_width=2,
                           fill_opacity=0.20, fill_color=GREEN_LIGHT)
            lens.move_to([LENS_X, 0, 0])
            return lens

        dyn_lens = always_redraw(make_lens)

        # 曲率半径读数
        def r_from_t(s):
            # r 从 5.7mm（近点）→ 6.0mm（远点），线性插值
            return 5.7 + 0.3 * s

        r_readout = always_redraw(lambda: VGroup(
            Text("曲率半径 r =", font=CJK, color=CYAN).scale(0.38),
            MathTex(rf"{r_from_t(t.get_value()):.2f}\ \mathrm{{mm}}", color=CYAN).scale(0.42),
        ).arrange(RIGHT, buff=0.15).to_corner(UR, buff=0.5))

        # 物距读数
        def u_cm_from_t(s):
            # 0→25cm, 1→∞（显示为 INF）
            if s > 0.97:
                return "INF"
            u = 25.0 / max(1.0 - s, 0.03)
            return f"{u:.0f} cm"

        u_readout = always_redraw(lambda: VGroup(
            Text("物距 u =", font=CJK, color=ORANGE).scale(0.38),
            Text(u_cm_from_t(t.get_value()), font=CJK, color=ORANGE).scale(0.42),
        ).arrange(RIGHT, buff=0.15).to_corner(UL, buff=0.5))

        # 光线：3 条汇聚到视网膜（简化为始终汇聚在视网膜上）
        def make_rays_normal():
            s = t.get_value()
            obj_x = EYE_LEFT_X - 1.0 - s * 3.5
            offsets = [EYE_HALF_H * 0.6, 0.0, -EYE_HALF_H * 0.6]
            rg = VGroup()
            for oy in offsets:
                # 从物体→晶状体→视网膜
                start = np.array([obj_x, oy, 0])
                mid   = np.array([LENS_X, oy * 0.45, 0])
                end   = np.array([RETINA_X, 0, 0])
                rg.add(Line(start, mid, color=ORANGE, stroke_width=1.4))
                rg.add(Line(mid,   end, color=ORANGE, stroke_width=1.4))
            return rg

        dyn_rays = always_redraw(make_rays_normal)

        # 创建场景
        static_eye = VGroup(top_wall, bot_wall, cornea, retina)
        self.play(Create(static_eye), FadeIn(cornea_lbl), FadeIn(retina_lbl), FadeIn(n_label))
        self.play(Create(dyn_lens), Create(dyn_rays))
        self.add(r_readout, u_readout)
        self.wait(1.0)

        adj_note = Text("调节中：晶状体变扁（r↑）→ 折射力下降 → 远处成像",
                        font=CJK, color=GREEN).scale(0.37).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(adj_note))
        # 从近点扫到远点
        self.play(t.animate.set_value(1.0), run_time=3.5)
        self.wait(1.0)
        self.play(t.animate.set_value(0.0), run_time=3.0)
        self.wait(0.8)

        self.play(FadeOut(VGroup(static_eye, cornea_lbl, retina_lbl, n_label,
                                 dyn_lens, dyn_rays, r_readout, u_readout,
                                 adj_note, sec4_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 5: 远点超出调节范围 → 模糊区域（正视眼失调示例）
        # ══════════════════════════════════════════════════════════════════════
        sec5_label = Text("超出调节范围：像落到视网膜之后（正视眼看极近处）",
                          font=CJK, color=RED).scale(0.40).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec5_label))

        # 静态眼
        top2 = Line([EYE_LEFT_X,  EYE_HALF_H, 0], [EYE_RIGHT_X,  EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        bot2 = Line([EYE_LEFT_X, -EYE_HALF_H, 0], [EYE_RIGHT_X, -EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        cor2 = Arc(radius=0.45, start_angle=-PI/2.2, angle=PI/1.1, color=CYAN, stroke_width=3)
        cor2.move_to([EYE_LEFT_X + 0.38, 0, 0])
        ret2 = Line([RETINA_X,  EYE_HALF_H, 0], [RETINA_X, -EYE_HALF_H, 0], color=YELLOW, stroke_width=3)
        lens2 = Ellipse(width=0.26, height=1.10, color=GREEN_LIGHT,
                        stroke_width=2, fill_opacity=0.2, fill_color=GREEN_LIGHT)
        lens2.move_to([LENS_X, 0, 0])

        # 像落在视网膜后（focus_x > RETINA_X = 0）
        focus_behind_x = 0.55
        obj_x_near = EYE_LEFT_X - 0.6
        offsets = [EYE_HALF_H * 0.6, 0.0, -EYE_HALF_H * 0.6]
        rays_blur = VGroup()
        for oy in offsets:
            mid = np.array([LENS_X, oy * 0.45, 0])
            start = np.array([obj_x_near, oy, 0])
            # 实际汇聚点在视网膜后
            end_true = np.array([focus_behind_x, 0, 0])
            # 在视网膜处截断，显示发散（未汇聚）
            # 求视网膜(x=0)处的 y
            if abs(end_true[0] - mid[0]) > 1e-6:
                frac = (RETINA_X - mid[0]) / (end_true[0] - mid[0])
                y_at_ret = mid[1] + frac * (end_true[1] - mid[1])
            else:
                y_at_ret = mid[1]
            end_on_ret = np.array([RETINA_X, y_at_ret, 0])
            rays_blur.add(Line(start, mid, color=RED, stroke_width=1.5))
            rays_blur.add(Line(mid, end_true, color=RED, stroke_width=1.5, stroke_opacity=0.5))

        # 模糊区域（视网膜附近的散射圆）
        blur_zone = Circle(radius=0.35, color=RED, fill_opacity=0.18, fill_color=RED)
        blur_zone.move_to([RETINA_X - 0.05, 0, 0])
        blur_label = Text("模糊！像落在视网膜后", font=CJK, color=RED).scale(0.38)
        blur_label.next_to(blur_zone, DOWN, buff=0.25)

        # 真实像点标记
        dot_behind = Dot([focus_behind_x, 0, 0], color=RED, radius=0.08)
        focus_lbl = Text("真实像点（视网膜后）", font=CJK, color=RED).scale(0.35)
        focus_lbl.next_to(dot_behind, UP, buff=0.15)

        eye2 = VGroup(top2, bot2, cor2, ret2, lens2)
        self.play(Create(eye2))
        self.play(Create(rays_blur), FadeIn(dot_behind), FadeIn(focus_lbl))
        self.play(FadeIn(blur_zone), FadeIn(blur_label))
        self.wait(2.0)
        self.play(FadeOut(VGroup(eye2, rays_blur, dot_behind, focus_lbl,
                                  blur_zone, blur_label, sec5_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 6: 近视眼演示 + 凹透镜矫正
        # ══════════════════════════════════════════════════════════════════════
        sec6_label = Text("近视眼：远点缩短至 ~20cm，无穷远成像在视网膜前",
                          font=CJK, color=ORANGE).scale(0.40).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec6_label))

        # 近视眼：晶状体更圆（曲率半径小）→ 折射力强 → 像在视网膜前
        top3 = Line([EYE_LEFT_X,  EYE_HALF_H, 0], [EYE_RIGHT_X,  EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        bot3 = Line([EYE_LEFT_X, -EYE_HALF_H, 0], [EYE_RIGHT_X, -EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        cor3 = Arc(radius=0.45, start_angle=-PI/2.2, angle=PI/1.1, color=CYAN, stroke_width=3)
        cor3.move_to([EYE_LEFT_X + 0.38, 0, 0])
        ret3 = Line([RETINA_X,  EYE_HALF_H, 0], [RETINA_X, -EYE_HALF_H, 0], color=YELLOW, stroke_width=3)
        lens3 = Ellipse(width=0.18, height=1.20, color=GREEN_LIGHT,
                        stroke_width=2, fill_opacity=0.2, fill_color=GREEN_LIGHT)
        lens3.move_to([LENS_X, 0, 0])

        # 无穷远光线（平行入射）→ 汇聚在视网膜前
        focus_myopia_x = -0.50   # 视网膜前
        offsets = [EYE_HALF_H * 0.6, 0.0, -EYE_HALF_H * 0.6]
        rays_myopia = VGroup()
        for oy in offsets:
            start = np.array([EYE_LEFT_X - 2.5, oy, 0])   # 平行入射
            mid   = np.array([LENS_X, oy * 0.4, 0])
            end   = np.array([focus_myopia_x, 0, 0])
            rays_myopia.add(Line(start, mid, color=ORANGE, stroke_width=1.5))
            rays_myopia.add(Line(mid,   end, color=ORANGE, stroke_width=1.5))

        dot_myopia = Dot([focus_myopia_x, 0, 0], color=ORANGE, radius=0.08)
        myop_lbl = Text("像落在视网膜前", font=CJK, color=ORANGE).scale(0.36)
        myop_lbl.next_to(dot_myopia, UP, buff=0.15)

        eye3 = VGroup(top3, bot3, cor3, ret3, lens3)
        self.play(Create(eye3))
        self.play(Create(rays_myopia), FadeIn(dot_myopia), FadeIn(myop_lbl))
        self.wait(1.5)

        # 插入凹透镜
        concave_label = Text("插入凹透镜（发散）", font=CJK, color=GREEN).scale(0.40)
        concave_label.to_edge(DOWN, buff=1.0)
        self.play(FadeIn(concave_label))

        # 凹透镜用两段弧表示（双凹形）
        lens_x_corr = EYE_LEFT_X - 2.0  # 眼镜位置
        div_lens_L = Arc(radius=0.6, start_angle=-PI/3.5, angle=PI/1.75, color=GREEN, stroke_width=2.5)
        div_lens_L.move_to([lens_x_corr - 0.08, 0, 0])
        div_lens_R = Arc(radius=0.6, start_angle=-PI/3.5 + PI, angle=PI/1.75, color=GREEN, stroke_width=2.5)
        div_lens_R.move_to([lens_x_corr + 0.08, 0, 0])
        div_lens = VGroup(div_lens_L, div_lens_R)

        self.play(Create(div_lens))
        self.wait(0.5)

        # 矫正后：光线在凹透镜发散，重新汇聚到视网膜
        rays_corrected = VGroup()
        for oy in offsets:
            start = np.array([EYE_LEFT_X - 2.5, oy, 0])
            mid1  = np.array([lens_x_corr, oy, 0])          # 凹透镜处
            mid2  = np.array([LENS_X, oy * 0.40, 0])        # 晶状体处
            end   = np.array([RETINA_X, 0, 0])               # 视网膜
            rays_corrected.add(Line(start, mid1, color=GREEN, stroke_width=1.5))
            rays_corrected.add(Line(mid1,  mid2, color=GREEN, stroke_width=1.5))
            rays_corrected.add(Line(mid2,  end,  color=GREEN, stroke_width=1.5))

        self.play(FadeOut(rays_myopia), FadeOut(dot_myopia), FadeOut(myop_lbl))
        self.play(Create(rays_corrected))
        dot_corrected = Dot([RETINA_X, 0, 0], color=GREEN, radius=0.08)
        corr_lbl = Text("矫正后：像回到视网膜！", font=CJK, color=GREEN).scale(0.38)
        corr_lbl.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(dot_corrected), FadeIn(corr_lbl))
        self.wait(1.8)
        self.play(FadeOut(VGroup(eye3, rays_corrected, dot_corrected, div_lens,
                                  concave_label, corr_lbl, sec6_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 7: 远视眼 + 凸透镜矫正
        # ══════════════════════════════════════════════════════════════════════
        sec7_label = Text("远视眼：近处物体成像在视网膜后，需凸透镜矫正",
                          font=CJK, color=BLUE).scale(0.40).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec7_label))

        top4 = Line([EYE_LEFT_X,  EYE_HALF_H, 0], [EYE_RIGHT_X,  EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        bot4 = Line([EYE_LEFT_X, -EYE_HALF_H, 0], [EYE_RIGHT_X, -EYE_HALF_H, 0], color=WHITE, stroke_width=2)
        cor4 = Arc(radius=0.45, start_angle=-PI/2.2, angle=PI/1.1, color=CYAN, stroke_width=3)
        cor4.move_to([EYE_LEFT_X + 0.38, 0, 0])
        ret4 = Line([RETINA_X,  EYE_HALF_H, 0], [RETINA_X, -EYE_HALF_H, 0], color=YELLOW, stroke_width=3)
        lens4 = Ellipse(width=0.28, height=0.90, color=GREEN_LIGHT,
                        stroke_width=2, fill_opacity=0.2, fill_color=GREEN_LIGHT)
        lens4.move_to([LENS_X, 0, 0])

        # 远视眼：近处物体（25cm）→ 像落在视网膜后
        obj_x_hyp = EYE_LEFT_X - 0.8
        focus_hyp_x = 0.55
        offsets = [EYE_HALF_H * 0.6, 0.0, -EYE_HALF_H * 0.6]
        rays_hyp = VGroup()
        for oy in offsets:
            start = np.array([obj_x_hyp, oy, 0])
            mid   = np.array([LENS_X, oy * 0.42, 0])
            end   = np.array([focus_hyp_x, 0, 0])
            rays_hyp.add(Line(start, mid, color=RED, stroke_width=1.5))
            rays_hyp.add(Line(mid,   end, color=RED, stroke_width=1.5, stroke_opacity=0.5))

        dot_hyp = Dot([focus_hyp_x, 0, 0], color=RED, radius=0.08)
        hyp_lbl = Text("像落在视网膜后", font=CJK, color=RED).scale(0.36)
        hyp_lbl.next_to(dot_hyp, DOWN, buff=0.15)

        eye4 = VGroup(top4, bot4, cor4, ret4, lens4)
        self.play(Create(eye4))
        self.play(Create(rays_hyp), FadeIn(dot_hyp), FadeIn(hyp_lbl))
        self.wait(1.5)

        # 插入凸透镜
        conv_label = Text("插入凸透镜（会聚）", font=CJK, color=GREEN).scale(0.40)
        conv_label.to_edge(DOWN, buff=1.0)
        self.play(FadeIn(conv_label))

        # 凸透镜（双凸形）
        lens_x_conv = EYE_LEFT_X - 2.0
        conv_L = Arc(radius=0.55, start_angle=-PI/3.5 + PI, angle=PI/1.75, color=GREEN, stroke_width=2.5)
        conv_L.move_to([lens_x_conv - 0.06, 0, 0])
        conv_R = Arc(radius=0.55, start_angle=-PI/3.5, angle=PI/1.75, color=GREEN, stroke_width=2.5)
        conv_R.move_to([lens_x_conv + 0.06, 0, 0])
        conv_lens = VGroup(conv_L, conv_R)
        self.play(Create(conv_lens))
        self.wait(0.5)

        # 矫正后
        rays_conv_corr = VGroup()
        for oy in offsets:
            start = np.array([obj_x_hyp, oy, 0])
            mid1  = np.array([lens_x_conv, oy * 0.85, 0])
            mid2  = np.array([LENS_X, oy * 0.38, 0])
            end   = np.array([RETINA_X, 0, 0])
            rays_conv_corr.add(Line(start, mid1, color=GREEN, stroke_width=1.5))
            rays_conv_corr.add(Line(mid1,  mid2, color=GREEN, stroke_width=1.5))
            rays_conv_corr.add(Line(mid2,  end,  color=GREEN, stroke_width=1.5))

        self.play(FadeOut(rays_hyp), FadeOut(dot_hyp), FadeOut(hyp_lbl))
        self.play(Create(rays_conv_corr))
        dot_conv_ok = Dot([RETINA_X, 0, 0], color=GREEN, radius=0.08)
        conv_ok_lbl = Text("矫正后：像落回视网膜！", font=CJK, color=GREEN).scale(0.38)
        conv_ok_lbl.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(dot_conv_ok), FadeIn(conv_ok_lbl))
        self.wait(1.8)
        self.play(FadeOut(VGroup(eye4, rays_conv_corr, dot_conv_ok, conv_lens,
                                  conv_label, conv_ok_lbl, sec7_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 8: 眼镜焦度公式 + 明视距离
        # ══════════════════════════════════════════════════════════════════════
        sec8_label = Text("眼镜焦度与明视距离", font=CJK, color=BLUE).scale(0.50)
        sec8_label.next_to(title, DOWN, buff=0.40)
        self.play(FadeIn(sec8_label))

        phi_def = MathTex(
            r"\Phi_{\text{lens}}", r"=", r"\frac{1}{v}", r"-", r"\frac{1}{u}"
        ).scale(0.9)
        phi_def[0].set_color(YELLOW)
        phi_def.next_to(sec8_label, DOWN, buff=0.45)

        phi_note1 = VGroup(
            Text("近视矫正：u = 远点距离，v = 无穷远", font=CJK, color=ORANGE).scale(0.37),
        )
        phi_note2 = VGroup(
            Text("远视矫正：u = 25cm，v = 近点距离", font=CJK, color=GREEN).scale(0.37),
        )
        phi_notes = VGroup(phi_note1, phi_note2).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        phi_notes.next_to(phi_def, DOWN, buff=0.35)

        self.play(Write(phi_def))
        self.wait(0.8)
        self.play(FadeIn(phi_notes))
        self.wait(1.2)

        # 明视距离定义
        d_label = Text("明视距离 = 25cm（标准正常视力在此距离看物最舒适）",
                       font=CJK, color=CYAN).scale(0.37)
        d_label.next_to(phi_notes, DOWN, buff=0.45)
        self.play(FadeIn(d_label))
        self.wait(1.5)
        self.play(FadeOut(VGroup(sec8_label, phi_def, phi_notes, d_label)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 9: 数值例子 —— 近视眼焦度计算
        # ══════════════════════════════════════════════════════════════════════
        ex_title = Text("数值例子：近视眼矫正", font=CJK, color=BLUE).scale(0.48)
        ex_title.next_to(title, DOWN, buff=0.40)
        ex_cond = Text("远点 = 50cm，需配什么度数的眼镜？", font=CJK).scale(0.44)
        ex_cond.next_to(ex_title, DOWN, buff=0.35)

        ex_step1 = MathTex(
            r"u = -0.50\ \mathrm{m},\quad v = \infty"
        ).scale(0.80)
        ex_step1.next_to(ex_cond, DOWN, buff=0.30)

        ex_step2 = MathTex(
            r"\Phi = \frac{1}{\infty} - \frac{1}{-0.50} = 0 + 2.0 = -2.0\ \mathrm{D}"
        ).scale(0.72)
        ex_step2.next_to(ex_step1, DOWN, buff=0.28)
        ex_step2.set_color(GREEN)

        ex_note = Text("度数 = -200度（凹透镜）", font=CJK, color=GREEN).scale(0.42)
        ex_note.next_to(ex_step2, DOWN, buff=0.28)

        self.play(FadeIn(ex_title), FadeIn(ex_cond))
        self.play(Write(ex_step1))
        self.wait(0.7)
        self.play(Write(ex_step2))
        self.wait(0.7)
        self.play(FadeIn(ex_note))
        self.wait(1.8)
        self.play(FadeOut(VGroup(ex_title, ex_cond, ex_step1, ex_step2, ex_note)))

        # ══════════════════════════════════════════════════════════════════════
        # Step 10: 小结卡
        # ══════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55)
        s_title.next_to(title, DOWN, buff=0.40)

        s1 = VGroup(
            Text("调节本质：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\frac{n_1}{u}+\frac{n_2}{v}=\frac{n_2-n_1}{r}", color=YELLOW).scale(0.70),
            Text("改变 r 使像落在视网膜", font=CJK, color=YELLOW).scale(0.40),
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("眼镜焦度：", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\Phi=\frac{1}{v}-\frac{1}{u}", color=YELLOW).scale(0.70),
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("近视：远点近，配凹镜（", font=CJK, color=ORANGE).scale(0.40),
            MathTex(r"\Phi < 0", color=ORANGE).scale(0.65),
            Text("）；远视：近点远，配凸镜（", font=CJK, color=GREEN).scale(0.40),
            MathTex(r"\Phi > 0", color=GREEN).scale(0.65),
            Text("）", font=CJK, color=GREEN).scale(0.40),
        ).arrange(RIGHT, buff=0.12)

        s4 = Text("明视距离 = 25cm，是眼睛最舒适的工作距离",
                  font=CJK, color=CYAN).scale(0.40)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(13.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.30, corner_radius=0.12)

        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.6)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.5)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch10Kp1EyeAccommodationMechanism",
        "id": "phys-ch10-10.3-kp1-eye-accommodation-mechanism",
        "chapterId": "ch10",
        "sectionId": "10.3",
        "title": "眼的调节：近点、远点与明视距离",
        "description": "通过眼截面动画与 ValueTracker 演示晶状体曲率调节，逐步说明正视眼、近视眼、远视眼的成像差异与眼镜矫正原理。",
    },
]
