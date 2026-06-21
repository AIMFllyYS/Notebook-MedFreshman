"""第 11.2 节 · 光栅衍射方程与缺级现象

可视化方案：
  Step 1  光栅截面示意图（5条缝，标注 a、b、d=a+b，平行光入射，θ 方向光程差 δ=dsinθ）
  Step 2  光栅方程推导（dsinθ=kλ 逐步出现，关键项变色）
  Step 3  N=5 相量叠加动画（主极大 vs 其他角度）
  Step 4  单缝衍射包络曲线叠加，高亮缺级
  Step 5  缺级条件推导（d/a = k/k'）
  Step 6  ValueTracker 改变 d/a 比值，实时展示缺级级次变化
  Step 7  小结卡（关键公式汇总）

铁律：MathTex 内只含纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch11Kp4GratingDiffractionMissingOrders(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("光栅衍射方程与缺级现象", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第十一章 波动光学 · 11.2", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("CD 盘片在阳光下呈现彩虹色——", font=CJK).scale(0.48)
        ana2 = Text("这正是光栅衍射：成千上万条细缝把不同颜色的光", font=CJK).scale(0.48)
        ana3 = Text("分别偏折到不同角度，主极大明纹锐利而清晰。", font=CJK).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.6)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.6)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 光栅截面示意图
        # ══════════════════════════════════════════════════════════════════
        sec_label = Text("一、光栅截面与光程差", font=CJK, color=CYAN).scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec_label))
        self.wait(0.5)

        # 5条缝：每缝宽 a=0.6，不透明部分宽 b=0.9，光栅常数 d=a+b=1.5（显示单位）
        # 在屏幕坐标系中缩放：用 0.9 倍
        a_phys, b_phys = 0.6, 0.9          # 物理单位（比例）
        d_phys = a_phys + b_phys            # 1.5
        scale_x = 0.9                       # 屏幕缩放
        n_slits = 5
        slit_w = a_phys * scale_x           # 缝宽 (屏幕)
        opaque_w = b_phys * scale_x         # 不透明宽 (屏幕)
        d_screen = d_phys * scale_x         # 光栅常数 (屏幕)
        grating_h = 2.2                     # 光栅高度
        total_w = n_slits * d_screen        # 总宽

        grating_objs = VGroup()
        # 绘制不透明区域（灰色矩形）和缝（透明，蓝色细线边框）
        left_x = -total_w / 2
        grating_y = -0.5
        for i in range(n_slits):
            # 不透明区在缝左侧
            opaque_rect = Rectangle(
                width=opaque_w, height=grating_h,
                fill_color="#444444", fill_opacity=0.85,
                stroke_color=WHITE, stroke_width=1
            )
            opaque_rect.move_to([left_x + i * d_screen + opaque_w / 2, grating_y, 0])
            slit_rect = Rectangle(
                width=slit_w, height=grating_h,
                fill_color="#000022", fill_opacity=0.5,
                stroke_color=BLUE, stroke_width=1.5
            )
            slit_rect.move_to([left_x + i * d_screen + opaque_w + slit_w / 2, grating_y, 0])
            grating_objs.add(opaque_rect, slit_rect)

        # 最右边再加一条不透明
        last_opaque = Rectangle(
            width=opaque_w, height=grating_h,
            fill_color="#444444", fill_opacity=0.85,
            stroke_color=WHITE, stroke_width=1
        )
        last_opaque.move_to([left_x + n_slits * d_screen + opaque_w / 2, grating_y, 0])
        grating_objs.add(last_opaque)
        grating_objs.scale_to_fit_width(11.5)
        grating_objs.next_to(sec_label, DOWN, buff=0.3)

        self.play(FadeIn(grating_objs))
        self.wait(0.6)

        # 标注 a（缝宽）：取第一条缝
        # 重新计算缩放后的坐标：用 grating_objs 的 bounding box 估算
        # 简化：在图下方用 Brace + 文字标注 a, b, d
        brace_group = VGroup()
        # 用单个示意 brace 标注整个 d=a+b（取第一个周期）
        # 近似取最左边两个矩形的 x 范围
        sample_d_start = grating_objs.get_left()[0]
        sample_d_end = sample_d_start + grating_objs.width / n_slits

        ann_a = VGroup(
            Text("a", font=CJK, color=GREEN).scale(0.42),
            Text("（缝宽）", font=CJK, color=GREEN).scale(0.38)
        ).arrange(RIGHT, buff=0.08)
        ann_b = VGroup(
            Text("b", font=CJK, color=ORANGE).scale(0.42),
            Text("（不透明宽）", font=CJK, color=ORANGE).scale(0.38)
        ).arrange(RIGHT, buff=0.08)
        ann_d = VGroup(
            MathTex(r"d=a+b", color=YELLOW).scale(0.55),
            Text("光栅常数", font=CJK, color=YELLOW).scale(0.38)
        ).arrange(RIGHT, buff=0.08)

        ann_group = VGroup(ann_a, ann_b, ann_d).arrange(RIGHT, buff=0.7)
        ann_group.next_to(grating_objs, DOWN, buff=0.22)
        self.play(FadeIn(ann_group))
        self.wait(0.6)

        # 平行光入射箭头（从左上向右，垂直入射）
        arrows_in = VGroup()
        for i in range(5):
            arr = Arrow(
                start=[-5.5, grating_objs.get_top()[1] + 0.8 - i * 0.35, 0],
                end=[-5.5, grating_objs.get_bottom()[1] - 0.15, 0],
                color=YELLOW, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.15
            )
            arrows_in.add(arr)
        arrows_in.arrange(RIGHT, buff=0.45).move_to(
            [grating_objs.get_center()[0], grating_objs.get_top()[1] + 0.55, 0]
        )
        # 简化：直接在光栅上方画几条向下箭头
        arrows_in = VGroup()
        top_y = grating_objs.get_top()[1] + 0.7
        bot_y = grating_objs.get_top()[1] + 0.1
        for xi in np.linspace(grating_objs.get_left()[0] + 0.3,
                               grating_objs.get_right()[0] - 0.3, 6):
            arr = Arrow(
                start=[xi, top_y, 0], end=[xi, bot_y, 0],
                color=YELLOW, buff=0, stroke_width=2,
                max_tip_length_to_length_ratio=0.2
            )
            arrows_in.add(arr)

        inc_label = Text("平行光垂直入射", font=CJK, color=YELLOW).scale(0.4)
        inc_label.next_to(arrows_in, LEFT, buff=0.25)
        self.play(FadeIn(arrows_in), FadeIn(inc_label))
        self.wait(0.5)

        # θ 方向：从第0条缝和第1条缝画一条衍射线，标注光程差
        slit0_x = grating_objs.get_left()[0] + grating_objs.width / (2 * n_slits) * 0.8
        slit1_x = slit0_x + grating_objs.width / n_slits
        slit_bot_y = grating_objs.get_bottom()[1]
        theta_angle = 30  # degrees
        ray_len = 1.8
        theta_rad = math.radians(theta_angle)
        dx = ray_len * math.sin(theta_rad)
        dy = -ray_len * math.cos(theta_rad)

        ray0 = Arrow(
            start=[slit0_x, slit_bot_y, 0],
            end=[slit0_x + dx, slit_bot_y + dy, 0],
            color=CYAN, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.15
        )
        ray1 = Arrow(
            start=[slit1_x, slit_bot_y, 0],
            end=[slit1_x + dx, slit_bot_y + dy, 0],
            color=CYAN, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.15
        )
        # 光程差辅助线（从 slit1 向 ray0 方向作垂线脚）
        foot_x = slit0_x + dx
        foot_y = slit_bot_y + dy
        perp_end_x = slit1_x
        perp_end_y = slit_bot_y + (slit1_x - slit0_x) * math.tan(math.radians(90 - theta_angle)) * 0 \
                     + slit_bot_y
        # 直接标注 δ = d sinθ
        delta_label = VGroup(
            MathTex(r"\delta", r"=", r"d\sin\theta", color=YELLOW).scale(0.52)
        )
        delta_label.next_to(ray0, RIGHT, buff=0.1).shift(DOWN * 0.5)

        theta_label = MathTex(r"\theta", color=CYAN).scale(0.52)
        theta_label.next_to(ray0, DOWN, buff=0.1).shift(LEFT * 0.1)

        self.play(Create(ray0), Create(ray1))
        self.play(FadeIn(delta_label), FadeIn(theta_label))
        self.wait(1.5)

        # 清场
        self.play(FadeOut(VGroup(
            grating_objs, ann_group, arrows_in, inc_label,
            ray0, ray1, delta_label, theta_label, sec_label
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 光栅方程推导
        # ══════════════════════════════════════════════════════════════════
        sec2 = Text("二、光栅方程", font=CJK, color=CYAN).scale(0.48).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec2))
        self.wait(0.3)

        eq1_label = VGroup(
            Text("相邻缝光程差：", font=CJK).scale(0.44),
            MathTex(r"\delta = d\sin\theta", color=YELLOW).scale(0.75)
        ).arrange(RIGHT, buff=0.2)
        eq1_label.next_to(sec2, DOWN, buff=0.5)
        self.play(Write(eq1_label))
        self.wait(1.0)

        eq2_label = VGroup(
            Text("主极大条件：", font=CJK).scale(0.44),
            MathTex(r"d\sin\theta = k\lambda", color=GREEN).scale(0.75)
        ).arrange(RIGHT, buff=0.2)
        eq2_label.next_to(eq1_label, DOWN, buff=0.4)
        self.play(Write(eq2_label))
        self.wait(0.8)

        eq3_label = VGroup(
            Text("级次：", font=CJK).scale(0.44),
            MathTex(r"k = 0,\,\pm 1,\,\pm 2,\,\ldots", color=WHITE).scale(0.7)
        ).arrange(RIGHT, buff=0.2)
        eq3_label.next_to(eq2_label, DOWN, buff=0.35)
        self.play(Write(eq3_label))
        self.wait(0.8)

        highlight_box = SurroundingRectangle(eq2_label, color=GREEN, buff=0.18, corner_radius=0.1)
        self.play(Create(highlight_box))
        self.wait(1.5)
        self.play(FadeOut(VGroup(eq1_label, eq2_label, eq3_label, highlight_box, sec2)))

        # ══════════════════════════════════════════════════════════════════
        # Step 5: N=5 相量叠加动画
        # ══════════════════════════════════════════════════════════════════
        sec3 = Text("三、相量叠加：主极大 vs 弱背景", font=CJK, color=CYAN).scale(0.46).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec3))
        self.wait(0.4)

        N = 5
        phasor_len = 0.7   # 每个相量的长度

        def draw_phasors(delta_phi: float, center, color_arrow=BLUE) -> VGroup:
            """绘制 N 个相量首尾相接；delta_phi 为相邻相量之间的相位差。"""
            group = VGroup()
            cur_pos = np.array(center, dtype=float)
            cur_angle = 0.0
            for _ in range(N):
                end_pos = cur_pos + phasor_len * np.array([
                    math.cos(cur_angle), math.sin(cur_angle), 0
                ])
                arr = Arrow(
                    start=cur_pos, end=end_pos,
                    buff=0, stroke_width=2.5, color=color_arrow,
                    max_tip_length_to_length_ratio=0.18
                )
                group.add(arr)
                cur_pos = end_pos
                cur_angle += delta_phi
            # 合振幅箭头
            total_end = cur_pos
            result_arr = Arrow(
                start=np.array(center, dtype=float), end=total_end,
                buff=0, stroke_width=4, color=RED,
                max_tip_length_to_length_ratio=0.15
            )
            group.add(result_arr)
            return group

        # 主极大：delta_phi = 0（所有相量同向）
        phasor_center_l = np.array([-3.0, -0.8, 0])
        phasors_max = draw_phasors(0.0, phasor_center_l, color_arrow=BLUE)

        lbl_max_title = Text("主极大（dsinθ=kλ）", font=CJK, color=GREEN).scale(0.42)
        lbl_max_title.move_to([-3.0, 1.2, 0])
        lbl_max_sub = VGroup(
            Text("所有相量同向，", font=CJK).scale(0.38),
            Text("合振幅最大", font=CJK, color=RED).scale(0.38)
        ).arrange(RIGHT, buff=0.08)
        lbl_max_sub.next_to(lbl_max_title, DOWN, buff=0.18)

        # 随机背景：delta_phi = 2π/N + 0.3 rad（相量分散）
        phasor_center_r = np.array([3.0, -0.8, 0])
        phasors_weak = draw_phasors(2 * math.pi / N + 0.3, phasor_center_r, color_arrow=BLUE)

        lbl_weak_title = Text("弱背景（其他角度）", font=CJK, color=ORANGE).scale(0.42)
        lbl_weak_title.move_to([3.0, 1.2, 0])
        lbl_weak_sub = VGroup(
            Text("相量分散，", font=CJK).scale(0.38),
            Text("合振幅接近零", font=CJK, color=RED).scale(0.38)
        ).arrange(RIGHT, buff=0.08)
        lbl_weak_sub.next_to(lbl_weak_title, DOWN, buff=0.18)

        self.play(
            FadeIn(lbl_max_title), FadeIn(lbl_max_sub),
            FadeIn(lbl_weak_title), FadeIn(lbl_weak_sub)
        )
        self.play(Create(phasors_max), Create(phasors_weak))
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            phasors_max, phasors_weak,
            lbl_max_title, lbl_max_sub, lbl_weak_title, lbl_weak_sub, sec3
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 光栅衍射强度曲线 + 单缝包络，高亮缺级
        # ══════════════════════════════════════════════════════════════════
        sec4 = Text("四、衍射强度分布与缺级", font=CJK, color=CYAN).scale(0.46).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec4))
        self.wait(0.3)

        # 参数: d/a = 3，则第3、6、9...级缺级
        d_over_a_fixed = 3.0

        axes_i = Axes(
            x_range=[-5.5, 5.5, 1],
            y_range=[-0.15, 1.25, 0.5],
            x_length=11,
            y_length=3.5,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
        ).shift(DOWN * 0.7)
        x_lbl_i = MathTex(r"k").scale(0.55).next_to(axes_i.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl_i = MathTex(r"I/I_0").scale(0.5).next_to(axes_i.y_axis.get_end(), LEFT, buff=0.12)
        self.play(Create(axes_i), FadeIn(x_lbl_i), FadeIn(y_lbl_i))
        self.wait(0.5)

        def intensity_func(u, d_a=d_over_a_fixed):
            """归一化光栅衍射强度，含单缝包络。
            u = π a sinθ / λ = π (k / d_a) for grating maxima.
            对连续变量: sinθ = u*λ/(π*a), k_cont = d*sinθ/λ = d_a * u / π
            We parametrize by x = k_continuous ∈ [-5.5, 5.5]
            """
            # 单缝衍射因子
            alpha = math.pi * x / d_a  # = π a sinθ/λ, since a sinθ = x*λ/d * a = x*λ*(a/d)
            if abs(alpha) < 1e-9:
                sinc2 = 1.0
            else:
                sinc2 = (math.sin(alpha) / alpha) ** 2
            return sinc2

        # 光栅主极大：在整数 k 处绘制 delta 峰（用 Line）
        # 单缝包络
        envelope = axes_i.plot(
            lambda x: (1.0 if abs(math.pi * x / d_over_a_fixed) < 1e-9
                       else (math.sin(math.pi * x / d_over_a_fixed) /
                             (math.pi * x / d_over_a_fixed)) ** 2),
            x_range=[-5.4, 5.4, 0.05],
            color=ORANGE, stroke_width=2.5
        )
        env_label = VGroup(
            Text("单缝包络", font=CJK, color=ORANGE).scale(0.4),
            MathTex(r"\left(\frac{\sin\alpha}{\alpha}\right)^2", color=ORANGE).scale(0.5)
        ).arrange(RIGHT, buff=0.12)
        env_label.to_corner(UR, buff=0.6).shift(DOWN * 1.2)

        self.play(Create(envelope), FadeIn(env_label))
        self.wait(0.8)

        # 光栅主极大 line peaks
        peak_lines = VGroup()
        missing_dots = VGroup()
        missing_labels = VGroup()
        for k_int in range(-5, 6):
            # 单缝包络值
            alpha_k = math.pi * k_int / d_over_a_fixed
            if abs(alpha_k) < 1e-9:
                h = 1.0
            else:
                h = (math.sin(alpha_k) / alpha_k) ** 2

            is_missing = (k_int != 0) and (k_int % int(round(d_over_a_fixed)) == 0)
            # d/a=3 时缺级在 k=±3,±6...
            bot = axes_i.c2p(k_int, 0)
            top = axes_i.c2p(k_int, h)
            col = RED if is_missing else YELLOW
            line = Line(bot, top, color=col, stroke_width=4)
            peak_lines.add(line)

            if is_missing:
                dot = Dot(axes_i.c2p(k_int, h + 0.08), color=RED, radius=0.08)
                lbl = Text("缺级", font=CJK, color=RED).scale(0.32)
                lbl.next_to(dot, UP, buff=0.05)
                missing_dots.add(dot)
                missing_labels.add(lbl)

        self.play(Create(peak_lines))
        self.wait(0.5)
        self.play(FadeIn(missing_dots), FadeIn(missing_labels))

        da_text = VGroup(
            Text("d/a =", font=CJK, color=WHITE).scale(0.44),
            MathTex(r"3", color=YELLOW).scale(0.6)
        ).arrange(RIGHT, buff=0.1)
        da_text.to_corner(UL, buff=0.5).shift(DOWN * 1.3)
        self.play(FadeIn(da_text))
        self.wait(2.0)

        self.play(FadeOut(VGroup(
            axes_i, x_lbl_i, y_lbl_i, envelope, env_label,
            peak_lines, missing_dots, missing_labels, da_text, sec4
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 缺级条件推导
        # ══════════════════════════════════════════════════════════════════
        sec5 = Text("五、缺级条件推导", font=CJK, color=CYAN).scale(0.46).next_to(title, DOWN, buff=0.4)
        self.play(FadeIn(sec5))
        self.wait(0.3)

        deriv1 = VGroup(
            Text("光栅方程（主极大）：", font=CJK).scale(0.44),
            MathTex(r"d\sin\theta = k\lambda", color=YELLOW).scale(0.72)
        ).arrange(RIGHT, buff=0.2)
        deriv1.next_to(sec5, DOWN, buff=0.5)
        self.play(Write(deriv1))
        self.wait(0.9)

        deriv2 = VGroup(
            Text("单缝衍射极小条件：", font=CJK).scale(0.44),
            MathTex(r"a\sin\theta = k'\lambda,\quad k'=\pm1,\pm2,\ldots", color=ORANGE).scale(0.68)
        ).arrange(RIGHT, buff=0.2)
        deriv2.next_to(deriv1, DOWN, buff=0.42)
        self.play(Write(deriv2))
        self.wait(0.9)

        deriv3_lbl = Text("两式相除得缺级条件：", font=CJK, color=WHITE).scale(0.44)
        deriv3_eq = MathTex(
            r"\frac{d}{a} = \frac{k}{k'}",
            r"\quad\Rightarrow\quad",
            r"k = \pm\frac{d}{a},\,\pm\frac{2d}{a},\,\ldots",
            color=RED
        ).scale(0.72)
        deriv3_lbl.next_to(deriv2, DOWN, buff=0.42)
        deriv3_eq.next_to(deriv3_lbl, DOWN, buff=0.28)
        self.play(Write(deriv3_lbl))
        self.play(Write(deriv3_eq))
        self.wait(1.0)

        box3 = SurroundingRectangle(deriv3_eq, color=RED, buff=0.2, corner_radius=0.12)
        self.play(Create(box3))
        self.wait(1.5)

        example_line = VGroup(
            Text("例：d/a=3，缺级在 k=", font=CJK, color=GREEN).scale(0.44),
            MathTex(r"\pm 3,\,\pm 6,\,\pm 9,\,\ldots", color=GREEN).scale(0.65)
        ).arrange(RIGHT, buff=0.1)
        example_line.next_to(deriv3_eq, DOWN, buff=0.38)
        self.play(FadeIn(example_line))
        self.wait(1.8)

        self.play(FadeOut(VGroup(
            deriv1, deriv2, deriv3_lbl, deriv3_eq, box3, example_line, sec5
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 8: ValueTracker 改变 d/a，实时展示缺级变化
        # ══════════════════════════════════════════════════════════════════
        sec6 = Text("六、动态演示：d/a 变化时缺级移动", font=CJK, color=CYAN).scale(0.44).next_to(title, DOWN, buff=0.35)
        self.play(FadeIn(sec6))
        self.wait(0.4)

        da_tracker = ValueTracker(2.0)

        axes2 = Axes(
            x_range=[-6.5, 6.5, 1],
            y_range=[-0.15, 1.25, 0.5],
            x_length=11,
            y_length=3.2,
            axis_config={"color": BLUE, "include_tip": True, "include_numbers": True},
        ).shift(DOWN * 0.9)
        x_lbl2 = MathTex(r"k").scale(0.55).next_to(axes2.x_axis.get_end(), DOWN, buff=0.12)
        y_lbl2 = MathTex(r"I/I_0").scale(0.48).next_to(axes2.y_axis.get_end(), LEFT, buff=0.1)
        self.play(Create(axes2), FadeIn(x_lbl2), FadeIn(y_lbl2))

        # 动态包络曲线
        dyn_envelope = always_redraw(lambda: axes2.plot(
            lambda x: (1.0 if abs(math.pi * x / da_tracker.get_value()) < 1e-9
                       else (math.sin(math.pi * x / da_tracker.get_value()) /
                             (math.pi * x / da_tracker.get_value())) ** 2),
            x_range=[-6.4, 6.4, 0.05],
            color=ORANGE, stroke_width=2.5
        ))

        # 动态主极大线（静态绘制，每次 tracker 变化后更新）
        # 用 always_redraw 绘制峰值线 VGroup
        def make_peak_group():
            da_val = da_tracker.get_value()
            vg = VGroup()
            for k_int in range(-6, 7):
                alpha_k = math.pi * k_int / da_val if da_val > 1e-6 else 1e9
                if abs(alpha_k) < 1e-9:
                    h = 1.0
                else:
                    h = (math.sin(alpha_k) / alpha_k) ** 2
                # 缺级判断：d/a 接近整数且 k 是其倍数
                da_round = round(da_val)
                is_missing = (k_int != 0 and abs(da_val - round(da_val)) < 0.15
                              and k_int % da_round == 0)
                col = RED if is_missing else YELLOW
                bot = axes2.c2p(k_int, 0)
                top = axes2.c2p(k_int, max(h, 0.0))
                line = Line(bot, top, color=col, stroke_width=4.5)
                vg.add(line)
            return vg

        dyn_peaks = always_redraw(make_peak_group)

        # d/a 数值标签
        da_num_label = always_redraw(lambda: VGroup(
            Text("d/a =", font=CJK, color=WHITE).scale(0.44),
            MathTex(
                rf"{da_tracker.get_value():.1f}",
                color=YELLOW
            ).scale(0.62)
        ).arrange(RIGHT, buff=0.12).to_corner(UL, buff=0.5).shift(DOWN * 1.3))

        hint = Text("红色竖线 = 被单缝包络压零的缺级", font=CJK, color=RED).scale(0.38)
        hint.to_corner(UR, buff=0.35).shift(DOWN * 1.3)

        self.play(Create(dyn_envelope), Create(dyn_peaks), FadeIn(da_num_label), FadeIn(hint))
        self.wait(0.8)

        # d/a 从 2 → 3 → 4 → 5
        self.play(da_tracker.animate.set_value(3.0), run_time=2.5, rate_func=smooth)
        self.wait(1.0)
        self.play(da_tracker.animate.set_value(4.0), run_time=2.5, rate_func=smooth)
        self.wait(1.0)
        self.play(da_tracker.animate.set_value(5.0), run_time=2.5, rate_func=smooth)
        self.wait(1.2)
        self.play(da_tracker.animate.set_value(2.0), run_time=2.0, rate_func=smooth)
        self.wait(1.0)

        self.play(FadeOut(VGroup(
            axes2, x_lbl2, y_lbl2, dyn_envelope, dyn_peaks, da_num_label, hint, sec6
        )))

        # ══════════════════════════════════════════════════════════════════
        # Step 9: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))
        self.wait(0.3)

        s1 = VGroup(
            Text("光栅方程（主极大）：", font=CJK).scale(0.42),
            MathTex(r"d\sin\theta = k\lambda", color=YELLOW).scale(0.75)
        ).arrange(RIGHT, buff=0.2)

        s2 = VGroup(
            Text("单缝极小：", font=CJK).scale(0.42),
            MathTex(r"a\sin\theta = k'\lambda", color=ORANGE).scale(0.72)
        ).arrange(RIGHT, buff=0.2)

        s3 = VGroup(
            Text("缺级条件：", font=CJK).scale(0.42),
            MathTex(r"k = n\cdot\frac{d}{a},\quad n=\pm1,\pm2,\ldots", color=RED).scale(0.68)
        ).arrange(RIGHT, buff=0.2)

        s4 = Text("d/a=整数时，第 d/a 的整数倍级次被单缝包络\"消灭\"",
                  font=CJK, color=GREEN).scale(0.4)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(12)

        box_s = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(Write(s3))
        self.wait(0.5)
        self.play(FadeIn(s4), Create(box_s))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box_s, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch11Kp4GratingDiffractionMissingOrders",
        "id": "phys-ch11-11.2-kp4-grating-diffraction-missing-orders",
        "chapterId": "ch11",
        "sectionId": "11.2",
        "title": "光栅衍射方程与缺级现象",
        "description": "从光栅截面光程差出发推导光栅方程，相量叠加展示主极大形成，单缝衍射包络压零缺级，ValueTracker动态演示d/a变化时缺级级次移动。",
    }
]
