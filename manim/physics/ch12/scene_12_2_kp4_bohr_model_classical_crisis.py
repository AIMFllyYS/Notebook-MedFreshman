"""第 12.2 节 · 卢瑟福模型的经典危机与玻尔假设的破局。

经典物理预言氢原子应在 ~10⁻¹¹s 内坍缩（螺旋轨道动画），
而玻尔量子化轨道假设给出正确的离散光谱（跃迁光子动画 + 巴尔末系）。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

REGISTER = [
    {
        "scene": "Ch12Kp4BohrModelClassicalCrisis",
        "id": "phys-ch12-12.2-kp4-bohr-model-classical-crisis",
        "chapterId": "ch12",
        "sectionId": "12.2",
        "title": "卢瑟福模型的经典危机与玻尔假设的破局",
        "description": (
            "用螺旋坍缩动画展示经典理论的致命困境，"
            "再以玻尔量子化轨道与跃迁光子动画说明离散谱线的来源。"
        ),
    }
]


class Ch12Kp4BohrModelClassicalCrisis(Scene):
    def construct(self):
        # ── Step 1: 标题 ─────────────────────────────────────────────────
        title = Text(
            "卢瑟福模型的经典危机与玻尔假设的破局",
            font=CJK, color=BLUE
        ).scale(0.55).to_edge(UP)
        subtitle = Text(
            "第十二章 量子力学初步 · 12.2",
            font=CJK, color=WHITE
        ).scale(0.38).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比引入 ─────────────────────────────────────────
        ana1 = Text(
            "经典物理：带电体做加速运动 → 持续辐射电磁波 → 能量不断损失",
            font=CJK
        ).scale(0.42)
        ana2 = Text(
            "这意味着绕核电子会越转越慢、越转越近，最终「坠入」原子核！",
            font=CJK, color=RED
        ).scale(0.42)
        ana3 = Text(
            "然而现实中原子是稳定的 —— 经典理论与实验之间出现了根本性矛盾。",
            font=CJK, color=GREEN
        ).scale(0.42)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.3)
        ana_group.next_to(title, DOWN, buff=0.5)
        for line in (ana1, ana2, ana3):
            self.play(FadeIn(line))
            self.wait(0.9)
        self.wait(1.2)
        self.play(FadeOut(ana_group))

        # ── Step 3: 两幕标题栏（始终保留） ──────────────────────────────
        left_header = Text("经典图像：螺旋坍缩", font=CJK, color=RED).scale(0.42)
        right_header = Text("玻尔图像：量子化轨道", font=CJK, color=GREEN).scale(0.42)
        left_header.move_to(LEFT * 3.4 + UP * 2.6)
        right_header.move_to(RIGHT * 3.4 + UP * 2.6)
        divider = DashedLine(UP * 2.8, DOWN * 3.2, color=GREY, dash_length=0.15)
        self.play(FadeIn(left_header), FadeIn(right_header), Create(divider))
        self.wait(0.5)

        # ── Step 4: 左侧——经典螺旋坍缩动画 ─────────────────────────────
        nucleus_l = Dot(point=LEFT * 3.4 + UP * 0.4, radius=0.15, color=YELLOW)
        nucleus_l_label = Text("+Ze", font=CJK, color=YELLOW).scale(0.35)
        nucleus_l_label.next_to(nucleus_l, DOWN, buff=0.1)

        self.play(FadeIn(nucleus_l), FadeIn(nucleus_l_label))

        # 螺旋线：参数 t 从 0 到 6π，半径从 1.2 → 0.05（对数收缩）
        center_l = nucleus_l.get_center()

        def spiral_points(n_turns=3.0, r_start=1.2, r_end=0.05, n_pts=320):
            pts = []
            for i in range(n_pts + 1):
                t = i / n_pts
                ang = t * n_turns * TAU
                r = r_start * (r_end / r_start) ** t
                pts.append(center_l + np.array([r * math.cos(ang), r * math.sin(ang), 0]))
            return pts

        spiral_pts = spiral_points()
        # 分段颜色：外圈蓝→内圈红（体现能量损失加热）
        spiral_path = VMobject(color=ORANGE)
        spiral_path.set_points_as_corners(spiral_pts)
        spiral_path.make_smooth()

        electron_l = Dot(radius=0.09, color=CYAN)
        electron_l.move_to(spiral_pts[0])

        self.play(Create(electron_l))
        # 电子沿螺旋坍缩，同步绘制轨迹
        self.play(
            MoveAlongPath(electron_l, spiral_path),
            Create(spiral_path),
            run_time=3.5,
            rate_func=linear,
        )
        self.wait(0.5)

        # 坍缩注释
        collapse_note = VGroup(
            Text("经典预测：", font=CJK, color=RED).scale(0.38),
            MathTex(r"\tau \approx 10^{-11}\ \mathrm{s}", color=RED).scale(0.65),
        ).arrange(RIGHT, buff=0.15)
        collapse_note.move_to(LEFT * 3.4 + DOWN * 1.9)
        collapse_note2 = Text("原子瞬间坍缩！", font=CJK, color=RED).scale(0.38)
        collapse_note2.next_to(collapse_note, DOWN, buff=0.18)
        self.play(FadeIn(collapse_note), FadeIn(collapse_note2))
        self.wait(1.5)

        # ── Step 5: 右侧——玻尔量子化轨道（n=1,2,3） ────────────────────
        center_r = RIGHT * 3.4 + UP * 0.4
        nucleus_r = Dot(point=center_r, radius=0.15, color=YELLOW)
        nucleus_r_label = Text("+Ze", font=CJK, color=YELLOW).scale(0.35)
        nucleus_r_label.next_to(nucleus_r, DOWN, buff=0.1)
        self.play(FadeIn(nucleus_r), FadeIn(nucleus_r_label))

        orbit_radii = [0.42, 0.78, 1.12]
        orbit_colors = [GREEN, BLUE, PURPLE]
        orbit_labels_text = ["n=1", "n=2", "n=3"]
        orbits = VGroup()
        orbit_label_mobs = VGroup()
        for i, (r, col, lbl) in enumerate(zip(orbit_radii, orbit_colors, orbit_labels_text)):
            circ = Circle(radius=r, color=col, stroke_width=2.5).move_to(center_r)
            orbits.add(circ)
            lbl_mob = Text(lbl, font=CJK, color=col).scale(0.30)
            lbl_mob.move_to(center_r + RIGHT * (r + 0.22))
            orbit_label_mobs.add(lbl_mob)

        self.play(Create(orbits), FadeIn(orbit_label_mobs), run_time=1.8)
        self.wait(0.8)

        # 量子化条件注释
        quant_label = VGroup(
            Text("定态条件：", font=CJK, color=YELLOW).scale(0.36),
            MathTex(r"L = n\hbar", color=YELLOW).scale(0.62),
        ).arrange(RIGHT, buff=0.12)
        quant_label.move_to(RIGHT * 3.4 + DOWN * 1.7)
        self.play(FadeIn(quant_label))
        self.wait(1.0)

        # ── Step 6: 玻尔跃迁——光子飞出动画 ─────────────────────────────
        photon_colors = [RED, ORANGE_RED, BLUE]
        photon_label_texts = [
            r"h\nu_{32}",
            r"h\nu_{31}",
            r"h\nu_{21}",
        ]
        transition_pairs = [(2, 1), (2, 0), (1, 0)]  # (from_orbit_idx, to_orbit_idx)

        photon_mobs = []
        for (fi, ti), ph_col, ph_tex in zip(
            transition_pairs, photon_colors, photon_label_texts
        ):
            r_from = orbit_radii[fi]
            # 电子从外轨道向内跃迁，光子从轨道向右飞出
            angle = math.pi / 4  # 斜上方飞出
            start_pt = center_r + np.array([r_from * math.cos(angle),
                                            r_from * math.sin(angle), 0])
            end_pt = start_pt + np.array([0.9, 0.5, 0])

            photon = Dot(radius=0.10, color=ph_col).move_to(start_pt)
            ph_label = MathTex(ph_tex, color=ph_col).scale(0.5)
            ph_label.next_to(end_pt, RIGHT, buff=0.05)

            self.play(
                photon.animate.move_to(end_pt),
                FadeIn(ph_label),
                run_time=0.8,
            )
            photon_mobs.append(photon)
            self.wait(0.3)

        self.wait(1.0)

        # ── Step 7: 关键公式逐步出现（中央空间） ────────────────────────
        # 先清除左侧螺旋，腾出空间
        self.play(
            FadeOut(spiral_path),
            FadeOut(electron_l),
            FadeOut(collapse_note),
            FadeOut(collapse_note2),
            FadeOut(nucleus_l_label),
        )
        self.wait(0.5)

        formula_title = Text("玻尔假设的三条核心公式", font=CJK, color=BLUE).scale(0.44)
        formula_title.move_to(LEFT * 3.4 + UP * 1.5)

        f1_zh = Text("能量跃迁：", font=CJK, color=WHITE).scale(0.35)
        f1_eq = MathTex(r"h\nu = E_n - E_k", color=YELLOW).scale(0.65)
        f1 = VGroup(f1_zh, f1_eq).arrange(RIGHT, buff=0.1)

        f2_zh = Text("角动量量子化：", font=CJK, color=WHITE).scale(0.35)
        f2_eq = MathTex(r"L = n\hbar,\quad n=1,2,3,\ldots", color=CYAN).scale(0.65)
        f2 = VGroup(f2_zh, f2_eq).arrange(RIGHT, buff=0.1)

        f3_zh = Text("轨道能级：", font=CJK, color=WHITE).scale(0.35)
        f3_eq = MathTex(
            r"E_n = -\frac{13.6\,\mathrm{eV}}{n^2}", color=GREEN
        ).scale(0.65)
        f3 = VGroup(f3_zh, f3_eq).arrange(RIGHT, buff=0.1)

        formulas = VGroup(f1, f2, f3).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        formulas.move_to(LEFT * 3.4 + DOWN * 0.1)
        formulas.scale_to_fit_width(5.2)

        self.play(FadeIn(formula_title))
        for fi in (f1, f2, f3):
            self.play(FadeIn(fi))
            self.wait(0.8)
        self.wait(1.2)

        # ── Step 8: 底部——氢原子发射光谱（巴尔末系彩色条纹） ─────────────
        spec_title = Text("氢原子发射光谱（巴尔末系）", font=CJK, color=WHITE).scale(0.38)
        spec_title.to_edge(DOWN, buff=2.0).set_x(0)

        # 巴尔末系可见光谱线 (n→2): H_α 656nm红, H_β 486nm青, H_γ 434nm蓝, H_δ 410nm紫
        spec_data = [
            (656, RED,    r"H_\alpha\ 656\,\mathrm{nm}"),
            (486, CYAN,   r"H_\beta\ 486\,\mathrm{nm}"),
            (434, BLUE,   r"H_\gamma\ 434\,\mathrm{nm}"),
            (410, PURPLE, r"H_\delta\ 410\,\mathrm{nm}"),
        ]
        # 把 nm 值映射到屏幕 x 坐标 [−2.5, 2.5]
        nm_min, nm_max = 400, 680
        def nm_to_x(nm):
            return -2.5 + 5.0 * (nm - nm_min) / (nm_max - nm_min)

        spec_lines = VGroup()
        spec_line_labels = VGroup()
        for nm, col, tex in spec_data:
            x = nm_to_x(nm)
            line = Line(
                start=np.array([x, -2.85, 0]),
                end=np.array([x, -2.3, 0]),
                color=col, stroke_width=5
            )
            lbl = MathTex(tex, color=col).scale(0.28)
            lbl.move_to(np.array([x, -3.05, 0]))
            spec_lines.add(line)
            spec_line_labels.add(lbl)

        # 光谱背景条
        spec_bg = Rectangle(
            width=5.2, height=0.55,
            fill_color=BLACK, fill_opacity=0.7,
            stroke_color=GREY, stroke_width=1
        ).move_to(np.array([0, -2.575, 0]))

        self.play(FadeIn(spec_title), FadeIn(spec_bg))
        self.play(Create(spec_lines), FadeIn(spec_line_labels))

        # 箭头：从玻尔图像指向光谱
        arrow_spec = Arrow(
            start=RIGHT * 2.3 + DOWN * 1.6,
            end=RIGHT * 0.5 + DOWN * 2.28,
            color=GREEN, buff=0.05
        )
        arrow_note = Text("仅玻尔模型预测离散谱线 ✓", font=CJK, color=GREEN).scale(0.36)
        arrow_note.next_to(arrow_spec, RIGHT, buff=0.1)
        self.play(GrowArrow(arrow_spec), FadeIn(arrow_note))
        self.wait(1.8)

        # ── Step 9: 对比高亮——经典连续 vs 玻尔离散 ─────────────────────
        contrast_l = Text("经典：连续辐射频率，无离散谱线", font=CJK, color=RED).scale(0.37)
        contrast_r = Text("玻尔：离散频率，完美对应实验", font=CJK, color=GREEN).scale(0.37)
        contrast_l.move_to(LEFT * 3.4 + DOWN * 2.0)
        contrast_r.move_to(RIGHT * 3.4 + DOWN * 2.2)
        self.play(FadeIn(contrast_l))
        self.wait(0.6)
        self.play(FadeIn(contrast_r))
        self.wait(1.5)

        # ── Step 10: 小结卡 ──────────────────────────────────────────────
        # 清场保留 title
        to_clear = VGroup(
            nucleus_l, left_header, right_header, divider,
            nucleus_r, nucleus_r_label, orbits, orbit_label_mobs, quant_label,
            *photon_mobs,
            formula_title, formulas,
            spec_title, spec_bg, spec_lines, spec_line_labels,
            arrow_spec, arrow_note,
            contrast_l, contrast_r,
        )
        self.play(FadeOut(to_clear))
        self.wait(0.3)

        sum_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        sum_title.next_to(title, DOWN, buff=0.45)

        s1_zh = Text("能量跃迁（光子条件）：", font=CJK, color=WHITE).scale(0.38)
        s1_eq = MathTex(r"h\nu = E_n - E_k", color=YELLOW).scale(0.75)
        s1 = VGroup(s1_zh, s1_eq).arrange(RIGHT, buff=0.15)

        s2_zh = Text("角动量量子化：", font=CJK, color=WHITE).scale(0.38)
        s2_eq = MathTex(r"L = n\hbar,\quad n = 1,2,3,\ldots", color=CYAN).scale(0.75)
        s2 = VGroup(s2_zh, s2_eq).arrange(RIGHT, buff=0.15)

        s3_zh = Text("氢原子能级：", font=CJK, color=WHITE).scale(0.38)
        s3_eq = MathTex(r"E_n = -\frac{13.6\,\mathrm{eV}}{n^2}", color=GREEN).scale(0.75)
        s3 = VGroup(s3_zh, s3_eq).arrange(RIGHT, buff=0.15)

        s4 = Text(
            "玻尔假设打破经典连续辐射困境，首次给出正确的氢原子离散谱线。",
            font=CJK, color=WHITE
        ).scale(0.38)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(sum_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(sum_title))
        for item in (s1, s2, s3, s4):
            self.play(FadeIn(item))
            self.wait(0.7)
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(sum_title, summary, box, title)))
        self.wait(0.4)
