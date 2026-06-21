"""第 14.2 节 · 光学谐振腔与激光输出（知识点 KP3）

可视化方案：
  1. 谐振腔结构（全反射镜 / 部分反射镜 / 激活介质）
  2. 光子往返过程动画（受激辐射 → 光子倍增）
  3. 实时光子数增长曲线（指数增长 → 阈值饱和）
  4. 激光输出方向性 vs 普通光源对比
  5. 腔内驻波波节 → 选频 / 单色性

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ─── 颜色常量 ──────────────────────────────────────────────────────────────
LASER_COLOR  = "#FFD700"   # 激光束 / 光子
MEDIUM_COLOR = "#1A3A5C"   # 激活介质填充
MIRROR_COLOR = "#B0B0B0"   # 全反射镜
OUTPUT_COLOR = "#FF6F00"   # 输出激光


class Ch14Kp3OpticalResonatorLaserOutput(Scene):
    def construct(self):
        # ════════════════════════════════════════════════════════════════════
        # Step 1  标题
        # ════════════════════════════════════════════════════════════════════
        title = Text("光学谐振腔与激光输出", font=CJK, color=BLUE).scale(0.66).to_edge(UP)
        subtitle = Text("第十四章 X射线与激光 · 14.2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ════════════════════════════════════════════════════════════════════
        # Step 2  生活类比
        # ════════════════════════════════════════════════════════════════════
        ana1 = Text("想象两面镜子相对而放，一面完全不透光，另一面只透出一点点：", font=CJK).scale(0.48)
        ana2 = Text("光在里面来回反射，每次经过发光材料都被\"放大\"，", font=CJK).scale(0.48)
        ana3 = Text("最终从那面\"只透一点\"的镜子射出高度平行、极纯的激光！", font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(ana1))
        self.wait(0.7)
        self.play(FadeIn(ana2))
        self.wait(0.7)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana))

        # ════════════════════════════════════════════════════════════════════
        # Step 3  谐振腔结构图
        # ════════════════════════════════════════════════════════════════════
        # 坐标参考：腔体居中，x 从 -4.5 到 4.5
        cav_left   = -4.2
        cav_right  =  4.2
        cav_y      = -0.8   # 腔体纵向中心
        cav_h      =  1.4   # 腔体高度
        mirror_w   =  0.28  # 镜子宽度

        # 激活介质（填充矩形）
        medium = Rectangle(
            width  = cav_right - cav_left - 2 * mirror_w,
            height = cav_h,
            fill_color   = MEDIUM_COLOR,
            fill_opacity = 0.85,
            stroke_color = BLUE,
            stroke_width = 1.5,
        ).move_to([0, cav_y, 0])

        # 全反射镜（左，实心）
        mirror_full = Rectangle(
            width  = mirror_w,
            height = cav_h + 0.25,
            fill_color   = MIRROR_COLOR,
            fill_opacity = 1.0,
            stroke_color = WHITE,
            stroke_width = 1.5,
        ).move_to([cav_left + mirror_w / 2, cav_y, 0])

        # 部分反射镜（右，虚线矩形）
        mirror_partial = DashedVMobject(
            Rectangle(
                width  = mirror_w,
                height = cav_h + 0.25,
                stroke_color = WHITE,
                stroke_width = 1.8,
            ).move_to([cav_right - mirror_w / 2, cav_y, 0]),
            num_dashes = 16,
        )

        # 标注文字
        lbl_full = Text("全反射镜", font=CJK, color=WHITE).scale(0.36)
        lbl_full.next_to(mirror_full, DOWN, buff=0.25)
        lbl_partial = Text("部分反射镜", font=CJK, color=WHITE).scale(0.36)
        lbl_partial.next_to(mirror_partial, DOWN, buff=0.25)
        lbl_medium = Text("激活介质（粒子数反转）", font=CJK, color=CYAN).scale(0.36)
        lbl_medium.next_to(medium, DOWN, buff=0.25)

        self.play(
            FadeIn(medium),
            Create(mirror_full),
            Create(mirror_partial),
        )
        self.play(FadeIn(lbl_full), FadeIn(lbl_partial), FadeIn(lbl_medium))
        self.wait(1.5)

        # ════════════════════════════════════════════════════════════════════
        # Step 4  光子往返 + 受激辐射（光子倍增）动画
        # ════════════════════════════════════════════════════════════════════
        intro_stim = VGroup(
            Text("受激辐射：一个光子经过激活介质", font=CJK).scale(0.44),
            Text("触发另一个同频、同相光子释放 → 光子数翻倍", font=CJK, color=YELLOW).scale(0.44),
        ).arrange(DOWN, buff=0.18).to_edge(UP, buff=2.6)
        self.play(FadeIn(intro_stim))
        self.wait(1.2)
        self.play(FadeOut(intro_stim))

        # 光子往返循环：3次，每次光子数用颜色深浅/数量示意
        photon_y    = cav_y
        ph_start_x  = cav_left  + mirror_w + 0.15
        ph_end_x    = cav_right - mirror_w - 0.15
        ph_center_y = photon_y

        # 颜色序列：随循环次数亮度增加
        round_colors = [
            "#FFAA00",  # 第1次
            "#FFD000",  # 第2次
            "#FFE860",  # 第3次
        ]

        # 标注「激光输出」箭头（右侧，第2次起就有一小部分透射）
        output_arrow = Arrow(
            start = [cav_right - mirror_w, ph_center_y, 0],
            end   = [cav_right + 1.4, ph_center_y, 0],
            color = OUTPUT_COLOR,
            buff  = 0,
            stroke_width = 4,
        )
        output_lbl = Text("激光输出", font=CJK, color=OUTPUT_COLOR).scale(0.40)
        output_lbl.next_to(output_arrow, UP, buff=0.15)

        caption_travel = Text("光子在腔内来回传播并被不断放大", font=CJK, color=GREEN).scale(0.42)
        caption_travel.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(caption_travel))

        for rnd, col in enumerate(round_colors):
            # 向右走（穿过激活介质 → 触发受激辐射）
            ph_right = Dot(point=[ph_start_x, ph_center_y, 0], color=col, radius=0.14)
            trail_right = Line(
                [ph_start_x, ph_center_y, 0],
                [ph_start_x, ph_center_y, 0],
                color=col, stroke_width=3,
            )
            self.add(ph_right, trail_right)

            # 光子向右移动（穿过激活介质）
            def update_trail_r(mob, alpha, start_x=ph_start_x, end_x=ph_end_x, y=ph_center_y, c=col):
                cur_x = start_x + (end_x - start_x) * alpha
                mob.become(Line([start_x, y, 0], [cur_x, y, 0], color=c, stroke_width=3))
            self.play(
                ph_right.animate.move_to([ph_end_x, ph_center_y, 0]),
                UpdateFromAlphaFunc(trail_right, update_trail_r),
                run_time=0.9,
            )
            self.remove(trail_right)

            # 受激辐射闪光
            stim_flash = Dot(point=[ph_end_x - 0.5, ph_center_y, 0], color=YELLOW, radius=0.22)
            self.play(FadeIn(stim_flash, scale=1.8), run_time=0.25)
            self.play(FadeOut(stim_flash), run_time=0.2)

            # 第2轮起：显示输出箭头（部分透射）
            if rnd >= 1:
                self.play(GrowArrow(output_arrow), FadeIn(output_lbl), run_time=0.5)
                self.wait(0.3)
                self.play(FadeOut(output_arrow), FadeOut(output_lbl), run_time=0.3)

            # 部分反射镜反射 → 向左返回
            ph_back = Dot(point=[ph_end_x, ph_center_y + 0.18, 0], color=col, radius=0.14)
            self.add(ph_back)
            self.play(
                ph_right.animate.move_to([ph_start_x, ph_center_y + 0.18, 0]),
                ph_back.animate.move_to([ph_start_x, ph_center_y + 0.18, 0]),
                run_time=0.7,
            )

            # 全反射 → 再出发
            reflect_flash = Dot(point=[ph_start_x, ph_center_y + 0.18, 0], color=CYAN, radius=0.20)
            self.play(FadeIn(reflect_flash, scale=1.6), run_time=0.2)
            self.play(FadeOut(reflect_flash), run_time=0.18)

            self.remove(ph_right, ph_back)

        self.play(FadeOut(caption_travel))

        # 永久显示输出箭头
        self.play(GrowArrow(output_arrow), FadeIn(output_lbl))
        self.wait(0.8)

        # ════════════════════════════════════════════════════════════════════
        # Step 5  光子数增长曲线（指数增长 → 阈值饱和）
        # ════════════════════════════════════════════════════════════════════
        # 腔体图上移一点，腾出空间画曲线
        cav_group = VGroup(medium, mirror_full, mirror_partial,
                           lbl_full, lbl_partial, lbl_medium,
                           output_arrow, output_lbl)
        self.play(cav_group.animate.shift(DOWN * 0.5).scale(0.82), run_time=0.6)

        # 坐标系
        axes = Axes(
            x_range=[0, 8, 2],
            y_range=[0, 5, 1],
            x_length=5.5,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": False},
        ).to_corner(UR, buff=0.55).shift(DOWN * 0.3)

        x_lbl_ax = VGroup(
            Text("往返次数", font=CJK).scale(0.36),
        ).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl_ax = VGroup(
            Text("光子数", font=CJK).scale(0.36),
        ).next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_lbl_ax), FadeIn(y_lbl_ax))

        # 阈值线
        threshold_n = 3.5
        thresh_line = DashedLine(
            axes.c2p(0, threshold_n),
            axes.c2p(8, threshold_n),
            color=RED,
            stroke_width=2,
        )
        thresh_lbl = VGroup(
            Text("阈值", font=CJK, color=RED).scale(0.34),
            Text("增益=损耗", font=CJK, color=RED).scale(0.30),
        ).arrange(DOWN, buff=0.08).next_to(axes.c2p(6.8, threshold_n), UP, buff=0.08)
        self.play(Create(thresh_line), FadeIn(thresh_lbl))

        # 增长曲线（分段：指数段 + 饱和段）
        def photon_curve(x):
            if x <= 5.0:
                return min(0.18 * math.exp(0.62 * x), threshold_n)
            else:
                return threshold_n

        t_tracker = ValueTracker(0.001)
        growth_curve = always_redraw(
            lambda: axes.plot(
                photon_curve,
                x_range=[0, t_tracker.get_value()],
                color=LASER_COLOR,
                stroke_width=3,
            )
        )
        self.add(growth_curve)
        self.play(t_tracker.animate.set_value(8.0), run_time=3.5, rate_func=linear)
        self.wait(0.8)

        # 饱和说明
        sat_note = Text("达到阈值后：增益=损耗，光子数稳定 → 持续激光输出",
                        font=CJK, color=GREEN).scale(0.38)
        sat_note.next_to(axes, DOWN, buff=0.22)
        self.play(FadeIn(sat_note))
        self.wait(1.4)

        self.play(FadeOut(VGroup(axes, x_lbl_ax, y_lbl_ax, thresh_line,
                                 thresh_lbl, growth_curve, sat_note)))

        # ════════════════════════════════════════════════════════════════════
        # Step 6  方向性对比：激光 vs 普通光源
        # ════════════════════════════════════════════════════════════════════
        self.play(FadeOut(cav_group))

        dir_title = Text("方向性：激光 vs 普通光源", font=CJK, color=BLUE).scale(0.52)
        dir_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(dir_title))

        # 普通光源（球面辐射）
        src_common = Dot(point=[-4.5, -0.6, 0], color=YELLOW, radius=0.18)
        common_rays = VGroup()
        for i in range(9):
            ang = -PI / 2 + (i / 8) * PI
            end = src_common.get_center() + 1.6 * np.array([math.cos(ang), math.sin(ang), 0])
            common_rays.add(
                Arrow(src_common.get_center(), end, buff=0.18,
                      color=YELLOW, stroke_width=2.5,
                      max_tip_length_to_length_ratio=0.25)
            )
        common_lbl = Text("普通光源：球面辐射", font=CJK, color=YELLOW).scale(0.38)
        common_lbl.next_to(src_common, DOWN, buff=1.8)

        # 激光源（高度平行）
        src_laser = Dot(point=[1.2, -0.6, 0], color=OUTPUT_COLOR, radius=0.18)
        laser_rays = VGroup()
        offsets = [-0.3, -0.15, 0.0, 0.15, 0.3]
        for dy in offsets:
            laser_rays.add(
                Arrow(
                    src_laser.get_center() + np.array([0, dy, 0]),
                    src_laser.get_center() + np.array([2.8, dy * 1.08, 0]),
                    buff=0, color=OUTPUT_COLOR, stroke_width=3,
                    max_tip_length_to_length_ratio=0.18,
                )
            )
        laser_lbl = Text("激光：高度平行，方向集中", font=CJK, color=OUTPUT_COLOR).scale(0.38)
        laser_lbl.next_to(src_laser, DOWN, buff=1.8)

        self.play(FadeIn(src_common), Create(common_rays), FadeIn(common_lbl))
        self.wait(0.7)
        self.play(FadeIn(src_laser), Create(laser_rays), FadeIn(laser_lbl))
        self.wait(1.6)
        self.play(FadeOut(VGroup(src_common, common_rays, common_lbl,
                                  src_laser, laser_rays, laser_lbl, dir_title)))

        # ════════════════════════════════════════════════════════════════════
        # Step 7  腔内驻波 → 选频 / 单色性
        # ════════════════════════════════════════════════════════════════════
        mono_title = Text("选频机制：腔内驻波决定单色性", font=CJK, color=BLUE).scale(0.52)
        mono_title.next_to(title, DOWN, buff=0.55)
        self.play(FadeIn(mono_title))

        # 重绘腔体（简化）
        cav2_left  = -4.0
        cav2_right =  4.0
        cav2_y     = -0.5

        cav2_medium = Rectangle(
            width  = cav2_right - cav2_left - 0.5,
            height = 0.9,
            fill_color   = MEDIUM_COLOR,
            fill_opacity = 0.6,
            stroke_color = BLUE,
            stroke_width = 1.5,
        ).move_to([0, cav2_y, 0])
        cav2_m_full = Rectangle(
            width=0.22, height=1.1,
            fill_color=MIRROR_COLOR, fill_opacity=1,
            stroke_color=WHITE, stroke_width=1.5,
        ).move_to([cav2_left + 0.11, cav2_y, 0])
        cav2_m_part = DashedVMobject(
            Rectangle(
                width=0.22, height=1.1,
                stroke_color=WHITE, stroke_width=1.8,
            ).move_to([cav2_right - 0.11, cav2_y, 0]),
            num_dashes=12,
        )
        self.play(FadeIn(cav2_medium), Create(cav2_m_full), Create(cav2_m_part))

        # 驻波（两个模式）
        L = cav2_right - cav2_left - 0.5   # 腔长 ≈ 7.5
        axes_sw = Axes(
            x_range=[cav2_left + 0.25, cav2_right - 0.25, 1],
            y_range=[-1.2, 1.2, 1],
            x_length=L,
            y_length=0.85,
            axis_config={"color": GREY, "stroke_width": 1, "include_tip": False},
        ).move_to([0, cav2_y, 0])

        # n=3 驻波
        n_val = ValueTracker(3)

        def standing_wave():
            n = int(round(n_val.get_value()))
            x0 = cav2_left + 0.25
            x1 = cav2_right - 0.25
            length = x1 - x0
            points = []
            for i in range(200):
                frac = i / 199
                xi = x0 + frac * length
                yi = 0.55 * math.sin(n * math.pi * (xi - x0) / length)
                points.append(axes_sw.c2p(xi, yi))
            return VMobject(color=LASER_COLOR, stroke_width=3).set_points_smoothly(points)

        sw_curve = always_redraw(standing_wave)

        sw_formula = VGroup(
            Text("选频条件：", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"L = n\frac{\lambda}{2},\quad n=1,2,3,\ldots", color=YELLOW).scale(0.72),
        ).arrange(RIGHT, buff=0.25).next_to(cav2_medium, DOWN, buff=0.55)

        n_readout = always_redraw(
            lambda: VGroup(
                Text("n = ", font=CJK, color=CYAN).scale(0.40),
                MathTex(str(int(round(n_val.get_value()))), color=CYAN).scale(0.55),
            ).arrange(RIGHT, buff=0.1).to_corner(UR, buff=0.8)
        )

        self.play(Create(sw_curve), FadeIn(sw_formula), FadeIn(n_readout))
        self.wait(0.8)

        sw_explain = Text("只有满足此条件的波长能在腔内形成驻波并被放大，\n"
                          "因此激光具有极高单色性",
                          font=CJK, color=GREEN).scale(0.40)
        sw_explain.to_edge(UP, buff=1.5)
        # 让标题往下让位
        self.play(FadeIn(sw_explain))

        # 切换 n = 4 演示不同模式
        self.play(n_val.animate.set_value(4), run_time=1.5)
        self.wait(0.8)
        self.play(n_val.animate.set_value(5), run_time=1.5)
        self.wait(0.8)
        self.play(n_val.animate.set_value(3), run_time=1.2)
        self.wait(0.8)

        self.play(FadeOut(VGroup(cav2_medium, cav2_m_full, cav2_m_part,
                                  axes_sw, sw_curve, sw_formula, n_readout,
                                  sw_explain, mono_title)))

        # ════════════════════════════════════════════════════════════════════
        # Step 8  小结卡
        # ════════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)

        s1 = VGroup(
            Text("谐振腔：", font=CJK, color=WHITE).scale(0.44),
            Text("全反射镜 + 部分反射镜 + 激活介质", font=CJK, color=CYAN).scale(0.44),
        ).arrange(RIGHT, buff=0.15)

        s2 = VGroup(
            Text("受激辐射放大：", font=CJK, color=WHITE).scale(0.44),
            Text("光子往返循环 → 指数增长 → 阈值饱和", font=CJK, color=YELLOW).scale(0.44),
        ).arrange(RIGHT, buff=0.15)

        s3_formula = MathTex(r"L = n\frac{\lambda}{2},\quad n=1,2,3,\ldots", color=YELLOW).scale(0.78)

        s4 = Text("激光三特性：方向性好、单色性高、相干性强", font=CJK, color=GREEN).scale(0.44)

        s = VGroup(s1, s2, s3_formula, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        s.next_to(s_title, DOWN, buff=0.45)
        s.scale_to_fit_width(12.5)

        box = SurroundingRectangle(s, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(FadeIn(s1))
        self.wait(0.5)
        self.play(FadeIn(s2))
        self.wait(0.5)
        self.play(Write(s3_formula))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(box))
        self.wait(2.2)

        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch14Kp3OpticalResonatorLaserOutput",
        "id": "phys-ch14-14.2-kp3-optical-resonator-laser-output",
        "chapterId": "ch14",
        "sectionId": "14.2",
        "title": "光学谐振腔与激光输出",
        "description": "动画演示谐振腔结构、光子受激辐射往返放大、光子数指数增长至阈值、激光方向性与驻波选频机制。",
    },
]
