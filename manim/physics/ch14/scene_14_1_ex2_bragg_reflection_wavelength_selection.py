"""第 14.1 节 · 例题2 布喇格衍射选波长

布喇格条件 2d sinθ = kλ，给定晶面间距 d=2.75Å、掠射角 θ=20°，
求落在 0.80Å–2.0Å 范围内的各级衍射波长。
动画依次展示：双晶面几何图 → 路程差推导 → 波长范围彩带 → 各级 k 验证 → 干涉波形 → 汇总表格。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch14Ex2BraggReflectionWavelengthSelection(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════
        # Step 1  标题
        # ══════════════════════════════════════════════════════
        title = Text("布喇格衍射选波长", font=CJK, color=BLUE).scale(0.70).to_edge(UP)
        subtitle = Text("第14章 X射线与激光 · 14.1  例题2", font=CJK, color=WHITE).scale(0.40)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════
        # Step 2  生活类比
        # ══════════════════════════════════════════════════════
        ana1 = Text("X 射线打到晶体表面时，相邻晶面各反射一束光；", font=CJK).scale(0.48)
        ana2 = Text("两束光的路程差恰好是波长整数倍时，才能发生相长干涉，", font=CJK).scale(0.48)
        ana3 = Text("就好像梳子的齿缝只让特定间距的波通过一样。", font=CJK, color=CYAN).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.22).next_to(title, DOWN, buff=0.65)
        self.play(FadeIn(ana1))
        self.wait(0.6)
        self.play(FadeIn(ana2))
        self.wait(0.6)
        self.play(FadeIn(ana3))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════
        # Step 3  已知量 + 布喇格条件公式
        # ══════════════════════════════════════════════════════
        cond_lbl = Text("已知条件", font=CJK, color=BLUE).scale(0.50).next_to(title, DOWN, buff=0.50)
        given = VGroup(
            VGroup(Text("晶面间距  ", font=CJK).scale(0.46),
                   MathTex(r"d = 2.75\,\text{\AA}", color=YELLOW).scale(0.70)).arrange(RIGHT, buff=0.08),
            VGroup(Text("掠射角  ", font=CJK).scale(0.46),
                   MathTex(r"\theta = 20^\circ", color=YELLOW).scale(0.70)).arrange(RIGHT, buff=0.08),
            VGroup(Text("波长范围  ", font=CJK).scale(0.46),
                   MathTex(r"0.80\,\text{\AA} \leq \lambda \leq 2.0\,\text{\AA}", color=GREEN).scale(0.70)).arrange(RIGHT, buff=0.08),
        ).arrange(DOWN, buff=0.30, aligned_edge=LEFT).next_to(cond_lbl, DOWN, buff=0.35)
        given.shift(LEFT * 1.0)

        bragg_lbl = Text("布喇格条件", font=CJK, color=BLUE).scale(0.46)
        bragg_eq = MathTex(r"2d\sin\theta = k\lambda, \quad k = 1,2,3,\ldots", color=WHITE).scale(0.80)
        bragg_group = VGroup(bragg_lbl, bragg_eq).arrange(RIGHT, buff=0.3)
        bragg_group.next_to(given, DOWN, buff=0.45)

        self.play(FadeIn(cond_lbl))
        for g in given:
            self.play(FadeIn(g))
            self.wait(0.4)
        self.wait(0.5)
        self.play(Write(bragg_lbl), Write(bragg_eq))
        self.wait(1.5)
        self.play(FadeOut(VGroup(cond_lbl, given, bragg_lbl, bragg_eq)))

        # ══════════════════════════════════════════════════════
        # Step 4  双晶面几何图 + 路程差推导
        # ══════════════════════════════════════════════════════
        geo_lbl = Text("双晶面反射几何", font=CJK, color=BLUE).scale(0.50)
        geo_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(geo_lbl))

        # 参数
        theta_deg = 20.0
        theta_rad = math.radians(theta_deg)
        d_val = 2.75   # Å（绘图中 1 Å = 0.5 屏幕单位）
        SCALE = 0.45   # Å → screen units

        # 两条晶面（水平线）
        plane_y1 = 0.0     # 上晶面 y
        plane_y2 = -d_val * SCALE  # 下晶面 y，约 -1.24

        # 图形区域中心偏左
        cx = -2.8

        plane1 = Line(
            start=np.array([cx - 2.6, plane_y1, 0]),
            end=np.array([cx + 2.6, plane_y1, 0]),
            color=WHITE, stroke_width=2,
        )
        plane2 = Line(
            start=np.array([cx - 2.6, plane_y2, 0]),
            end=np.array([cx + 2.6, plane_y2, 0]),
            color=WHITE, stroke_width=2,
        )
        lbl_p1 = Text("晶面1", font=CJK, color=WHITE).scale(0.38).next_to(plane1, RIGHT, buff=0.15)
        lbl_p2 = Text("晶面2", font=CJK, color=WHITE).scale(0.38).next_to(plane2, RIGHT, buff=0.15)

        # d 标注（花括号）
        d_brace = Brace(
            Line(np.array([cx - 2.3, plane_y2, 0]), np.array([cx - 2.3, plane_y1, 0])),
            direction=LEFT, color=CYAN,
        )
        d_brace_lbl = MathTex(r"d", color=CYAN).scale(0.65).next_to(d_brace, LEFT, buff=0.12)

        self.play(Create(plane1), Create(plane2), FadeIn(lbl_p1), FadeIn(lbl_p2))
        self.play(Create(d_brace), FadeIn(d_brace_lbl))
        self.wait(0.5)

        # 入射 / 反射光线 (上晶面：点 A)
        hit_x1 = cx - 0.8
        A = np.array([hit_x1, plane_y1, 0])
        ray_len = 2.0
        # 入射方向（从左上斜下，掠射角 theta）
        inc_dir = np.array([math.cos(math.pi - theta_rad), -math.sin(math.pi - theta_rad), 0])  # 向右下
        inc_start = A - inc_dir * ray_len   # 往反方向延伸到起点
        ref_dir = np.array([math.cos(theta_rad), -math.sin(theta_rad), 0])   # 向右下反射
        ref_end1 = A + ref_dir * ray_len

        ray_inc1 = Arrow(inc_start, A, buff=0, color=YELLOW, stroke_width=2,
                         max_tip_length_to_length_ratio=0.15)
        ray_ref1 = Arrow(A, ref_end1, buff=0, color=ORANGE, stroke_width=2,
                         max_tip_length_to_length_ratio=0.15)

        # 入射 / 反射光线 (下晶面：点 B)
        hit_x2 = cx + 0.0
        B = np.array([hit_x2, plane_y2, 0])
        inc_start2 = B - inc_dir * ray_len
        ref_end2 = B + ref_dir * ray_len

        ray_inc2 = Arrow(inc_start2, B, buff=0, color=YELLOW, stroke_width=2,
                         max_tip_length_to_length_ratio=0.15)
        ray_ref2 = Arrow(B, ref_end2, buff=0, color=ORANGE, stroke_width=2,
                         max_tip_length_to_length_ratio=0.15)

        # 辅助垂线 + 路程差段高亮（dashed）
        # 路程差段：B到上面的入射点垂足 (C)，和 B 到上面的反射点垂足 (D)
        # 实际上路程差 = BC + BD，BC = BD = d sinθ，所以 δ = 2d sinθ
        # 这里画两条虚线从 B 垂直到上晶面来示意
        C = np.array([hit_x2, plane_y1, 0])   # B 正上方
        D = np.array([hit_x2, plane_y1, 0])   # 简化：画从 B 的法线到晶面
        vert_dash = DashedLine(B, C, color=CYAN, stroke_width=2)

        theta_arc = Arc(
            radius=0.35,
            start_angle=math.pi - theta_rad,
            angle=theta_rad,
            arc_center=A,
            color=GREEN,
        )
        theta_lbl = MathTex(r"\theta", color=GREEN).scale(0.55)
        theta_lbl.move_to(A + np.array([-0.55, 0.22, 0]))

        self.play(
            Create(ray_inc1), Create(ray_ref1),
            Create(ray_inc2), Create(ray_ref2),
        )
        self.play(Create(vert_dash), Create(theta_arc), FadeIn(theta_lbl))
        self.wait(0.6)

        # 路程差公式（逐步）
        delta_step1 = MathTex(r"\delta = 2d\sin\theta").scale(0.80)
        delta_step1.set_color(YELLOW)

        d_num = MathTex(r"= 2 \times 2.75 \times \sin 20^\circ").scale(0.72)
        delta_step2 = MathTex(r"\approx 1.88\,\text{\AA}").scale(0.80)
        delta_step2.set_color(GREEN)

        right_col_x = 2.0
        delta_step1.move_to(np.array([right_col_x, 1.2, 0]))
        d_num.next_to(delta_step1, DOWN, buff=0.30)
        delta_step2.next_to(d_num, DOWN, buff=0.25)

        self.play(Write(delta_step1))
        self.wait(0.6)
        self.play(FadeIn(d_num))
        self.wait(0.5)
        self.play(Write(delta_step2))
        self.wait(1.2)

        # 在图上标注 δ
        delta_lbl_img = VGroup(
            Text("路程差  ", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"\delta=1.88\,\text{\AA}", color=GREEN).scale(0.62),
        ).arrange(RIGHT, buff=0.05)
        delta_lbl_img.move_to(np.array([cx, plane_y2 - 0.55, 0]))
        self.play(FadeIn(delta_lbl_img))
        self.wait(1.2)

        self.play(FadeOut(VGroup(
            plane1, plane2, lbl_p1, lbl_p2,
            d_brace, d_brace_lbl,
            ray_inc1, ray_ref1, ray_inc2, ray_ref2,
            vert_dash, theta_arc, theta_lbl,
            delta_step1, d_num, delta_step2, delta_lbl_img, geo_lbl,
        )))

        # ══════════════════════════════════════════════════════
        # Step 5  波长范围彩带 + 各 k 的竖线标注
        # ══════════════════════════════════════════════════════
        band_lbl = Text("波长筛选：哪些 k 值落在探测范围内？", font=CJK, color=BLUE).scale(0.48)
        band_lbl.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(band_lbl))

        # 彩带参数
        lam_min_screen = 0.60   # 屏幕左边缘（对应略小于 0.80Å，留边距）
        lam_max_screen = 2.20   # 屏幕右边缘
        bar_left = -5.0
        bar_right = 5.0
        bar_y = 0.5
        bar_h = 0.55

        # 将波长值映射到屏幕 x 坐标
        def lam_to_x(lam):
            frac = (lam - lam_min_screen) / (lam_max_screen - lam_min_screen)
            return bar_left + frac * (bar_right - bar_left)

        # 有效范围 0.80–2.0 Å
        valid_left_x = lam_to_x(0.80)
        valid_right_x = lam_to_x(2.00)

        # 全段（灰色背景条）
        full_bar = Rectangle(
            width=bar_right - bar_left, height=bar_h, color=DARK_GRAY, fill_opacity=0.5,
        ).move_to(np.array([(bar_left + bar_right) / 2, bar_y, 0]))

        # 有效范围（绿色高亮条）
        valid_width = valid_right_x - valid_left_x
        valid_bar = Rectangle(
            width=valid_width, height=bar_h, fill_color=GREEN, fill_opacity=0.35, color=GREEN,
        ).move_to(np.array([(valid_left_x + valid_right_x) / 2, bar_y, 0]))

        # x 轴刻度标签
        tick_lams = [0.80, 1.00, 1.20, 1.40, 1.60, 1.80, 2.00]
        tick_objs = VGroup()
        for lv in tick_lams:
            tx = lam_to_x(lv)
            tick_line = Line(
                np.array([tx, bar_y - bar_h / 2, 0]),
                np.array([tx, bar_y - bar_h / 2 - 0.15, 0]),
                color=WHITE, stroke_width=1.5,
            )
            tick_txt = MathTex(rf"{lv:.2f}", color=WHITE).scale(0.38)
            tick_txt.move_to(np.array([tx, bar_y - bar_h / 2 - 0.42, 0]))
            tick_objs.add(tick_line, tick_txt)

        bar_axis_lbl = VGroup(
            Text("波长 ", font=CJK, color=WHITE).scale(0.40),
            MathTex(r"\lambda\;(\text{\AA})", color=WHITE).scale(0.55),
        ).arrange(RIGHT, buff=0.05)
        bar_axis_lbl.move_to(np.array([bar_right + 0.15, bar_y - bar_h / 2 - 0.40, 0]))
        bar_axis_lbl.to_edge(RIGHT, buff=0.15)

        range_txt = VGroup(
            Text("有效范围：", font=CJK, color=GREEN).scale(0.42),
            MathTex(r"0.80\,\text{\AA}\leq\lambda\leq 2.0\,\text{\AA}", color=GREEN).scale(0.60),
        ).arrange(RIGHT, buff=0.08)
        range_txt.next_to(full_bar, DOWN, buff=0.85)

        self.play(Create(full_bar), Create(valid_bar))
        self.play(FadeIn(tick_objs), FadeIn(bar_axis_lbl))
        self.play(FadeIn(range_txt))
        self.wait(0.8)

        # 各 k 的竖线
        delta_A = 2 * 2.75 * math.sin(math.radians(20))  # ≈ 1.882 Å

        k_data = []
        for k in [1, 2, 3]:
            lam_k = delta_A / k
            in_range = 0.80 <= lam_k <= 2.00
            color_k = GREEN if in_range else RED
            x_k = lam_to_x(lam_k)
            k_data.append((k, lam_k, in_range, color_k, x_k))

        k_markers = VGroup()
        for k, lam_k, in_range, color_k, x_k in k_data:
            vline = Line(
                np.array([x_k, bar_y - bar_h / 2, 0]),
                np.array([x_k, bar_y + bar_h / 2, 0]),
                color=color_k, stroke_width=3,
            )
            lbl_up = MathTex(rf"k={k}", color=color_k).scale(0.55)
            lbl_up.move_to(np.array([x_k, bar_y + bar_h / 2 + 0.35, 0]))
            lam_str = f"{lam_k:.2f}"
            lbl_dn = MathTex(rf"\lambda={lam_str}\,\text{{\AA}}", color=color_k).scale(0.50)
            lbl_dn.move_to(np.array([x_k, bar_y - bar_h / 2 - 0.90, 0]))
            k_markers.add(vline, lbl_up, lbl_dn)

            # 计算过程显示（右侧角落）
            calc_txt = MathTex(
                rf"\lambda_{k} = \frac{{1.88}}{{{k}}} \approx {lam_k:.2f}\,\text{{\AA}}",
                color=color_k,
            ).scale(0.68)
            calc_txt.to_corner(UR, buff=0.55)
            status_zh = Text("在范围内" if in_range else "超出范围", font=CJK, color=color_k).scale(0.46)
            status_zh.next_to(calc_txt, DOWN, buff=0.22)

            self.play(Create(vline), FadeIn(lbl_up), Write(calc_txt))
            self.wait(0.4)
            self.play(FadeIn(lbl_dn), FadeIn(status_zh))
            self.wait(1.2)
            self.play(FadeOut(calc_txt), FadeOut(status_zh))

        self.wait(0.8)

        self.play(FadeOut(VGroup(
            full_bar, valid_bar, tick_objs, bar_axis_lbl,
            range_txt, k_markers, band_lbl,
        )))

        # ══════════════════════════════════════════════════════
        # Step 6  干涉波形直觉：整数倍波长填满路程差
        # ══════════════════════════════════════════════════════
        wave_lbl = Text("干涉直觉：路程差恰好是波长整数倍时亮纹出现", font=CJK, color=BLUE).scale(0.46)
        wave_lbl.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(wave_lbl))

        # 公共参数
        DELTA = delta_A   # 1.882 Å （路程差，映射到绘图单位）
        W_SCALE = 2.8     # Å → screen  （让路程差长度 = 2.8 * (1/DELTA) * DELTA screen）
        PATH_LEN = 5.2    # screen units: 固定的「路程长条」宽度

        axes_y_start = 0.8   # 顶部波形图 y 中心（相对场景中心）

        for step_idx, (k, lam_k, in_range, color_k, _) in enumerate(k_data):
            row_y = axes_y_start - step_idx * 1.55

            # 画一个窄 Axes 用于波形
            ax = Axes(
                x_range=[0, PATH_LEN, PATH_LEN],
                y_range=[-1.3, 1.3, 1],
                x_length=PATH_LEN,
                y_length=1.1,
                axis_config={"color": DARK_GRAY, "include_tip": False},
                tips=False,
            )
            ax.move_to(np.array([0.5, row_y, 0]))

            # 路程差段的高亮矩形
            delta_screen = (DELTA / PATH_LEN) * PATH_LEN * W_SCALE / W_SCALE  # 保持直觉
            # 实际：在 x_range=[0, PATH_LEN] 对应 x_length=PATH_LEN 的坐标轴里
            # DELTA Å 对应多少 screen？ screen_per_ang = PATH_LEN / PATH_LEN = 1 screen/Å
            # 但 PATH_LEN screen = PATH_LEN Å（我们直接用 Å 作 x 轴单位）
            # 于是路程差 DELTA Å 就对应 DELTA screen 单位 → 需要换算到 ax 坐标
            delta_x_pt = ax.c2p(DELTA, 0) - ax.c2p(0, 0)  # 向量
            delta_screen_len = np.linalg.norm(delta_x_pt)

            # 绘制波形
            k_waves = k   # k 个完整波填满 DELTA
            lam_screen = PATH_LEN / k_waves  # 每个波长在 x_range 里的长度
            wave_color = color_k

            wave_plot = ax.plot(
                lambda x, kw=k_waves: math.sin(2 * math.pi * kw / PATH_LEN * x),
                x_range=[0, DELTA, 0.02],
                color=wave_color,
                stroke_width=2.5,
            )

            # 路程差区间标记
            left_pt = ax.c2p(0, 0)
            right_pt = ax.c2p(DELTA, 0)
            delta_marker = DashedLine(
                np.array([right_pt[0], row_y - 0.62, 0]),
                np.array([right_pt[0], row_y + 0.62, 0]),
                color=CYAN, stroke_width=1.5,
            )
            delta_brace = Line(
                np.array([left_pt[0], row_y - 0.68, 0]),
                np.array([right_pt[0], row_y - 0.68, 0]),
                color=CYAN, stroke_width=1.5,
            )

            # 标签
            k_label = VGroup(
                MathTex(rf"k={k}", color=color_k).scale(0.55),
            ).next_to(ax, LEFT, buff=0.25)

            lam_label = VGroup(
                MathTex(rf"\lambda={lam_k:.2f}\,\text{{\AA}}", color=color_k).scale(0.52),
            )
            lam_label.move_to(np.array([
                (left_pt[0] + right_pt[0]) / 2,
                row_y - 0.92,
                0
            ]))

            result_zh = Text(
                f"{'相长干涉' if in_range else '超出探测范围'}",
                font=CJK, color=color_k,
            ).scale(0.42)
            result_zh.next_to(ax, RIGHT, buff=0.30)

            self.play(Create(ax), FadeIn(k_label))
            self.play(Create(wave_plot), Create(delta_marker), Create(delta_brace))
            self.play(FadeIn(lam_label), FadeIn(result_zh))
            self.wait(1.0)

        self.wait(1.5)
        self.play(FadeOut(wave_lbl))
        # 清场所有波形步骤（用 FadeOut on everything in scene except title）
        self.play(*[FadeOut(mob) for mob in self.mobjects if mob is not title])

        # ══════════════════════════════════════════════════════
        # Step 7  汇总表格
        # ══════════════════════════════════════════════════════
        tbl_lbl = Text("满足条件的衍射波长汇总", font=CJK, color=BLUE).scale(0.52)
        tbl_lbl.next_to(title, DOWN, buff=0.50)
        self.play(FadeIn(tbl_lbl))

        # 手动表格（VGroup + Line，避免 MathTable 编码问题）
        col_w = [1.8, 2.6, 2.8, 2.4]
        row_h = 0.65
        headers = ["衍射级", "计算式", r"\lambda\;(\text{\AA})", "是否有效"]
        rows_data = [
            (r"k=1", r"\lambda=\delta/1=1.88", "1.88", "True"),
            (r"k=2", r"\lambda=\delta/2=0.94", "0.94", "True"),
            (r"k=3", r"\lambda=\delta/3=0.63", "0.63", "False"),
        ]

        tbl_top = tbl_lbl.get_bottom()[1] - 0.25  # y 坐标起始
        tbl_x_starts = []
        tx = -sum(col_w) / 2
        for cw in col_w:
            tbl_x_starts.append(tx + cw / 2)
            tx += cw

        tbl_group = VGroup()

        # 表头行
        header_row = VGroup()
        for i, h in enumerate(headers):
            c = MathTex(h, color=BLUE).scale(0.58) if i == 2 else \
                Text(h, font=CJK, color=BLUE).scale(0.48)
            c.move_to(np.array([tbl_x_starts[i], tbl_top - 0.32, 0]))
            header_row.add(c)
        tbl_group.add(header_row)

        # 分割线（表头下方）
        sep_y = tbl_top - row_h * 0.85
        sep = Line(
            np.array([-sum(col_w) / 2, sep_y, 0]),
            np.array([sum(col_w) / 2, sep_y, 0]),
            color=WHITE, stroke_width=1.5,
        )
        tbl_group.add(sep)

        # 数据行
        for ri, (k_str, calc_str, lam_str, valid_str) in enumerate(rows_data):
            row_y = tbl_top - row_h * (ri + 1) - 0.35
            in_range = (valid_str == "True")
            row_color = GREEN if in_range else RED
            cells = [
                MathTex(k_str, color=row_color).scale(0.65),
                MathTex(calc_str, color=WHITE).scale(0.58),
                MathTex(lam_str + r"\,\text{\AA}", color=row_color).scale(0.65),
                Text("有效" if in_range else "超出范围", font=CJK, color=row_color).scale(0.46),
            ]
            for i, cell in enumerate(cells):
                cell.move_to(np.array([tbl_x_starts[i], row_y, 0]))
            row_group = VGroup(*cells)
            tbl_group.add(row_group)
            self.play(FadeIn(row_group))
            self.wait(0.6)

        self.play(FadeIn(sep))
        self.wait(0.5)

        # 方框
        box = SurroundingRectangle(tbl_group, color=BLUE, buff=0.30, corner_radius=0.12)
        self.play(Create(box))
        self.wait(1.5)

        # ══════════════════════════════════════════════════════
        # Step 8  小结卡
        # ══════════════════════════════════════════════════════
        self.play(FadeOut(VGroup(tbl_group, sep, box, tbl_lbl)))

        s_title = Text("本题小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.50)
        s1 = MathTex(r"\delta = 2d\sin\theta = 2\times2.75\times\sin20^\circ \approx 1.88\,\text{\AA}",
                     color=YELLOW).scale(0.70)
        s2 = MathTex(r"\lambda_k = \frac{1.88}{k}\,\text{\AA},\quad k=1,2,3,\ldots",
                     color=YELLOW).scale(0.72)
        s3 = VGroup(
            Text("k=1: ", font=CJK, color=GREEN).scale(0.46),
            MathTex(r"\lambda=1.88\,\text{\AA}", color=GREEN).scale(0.65),
            Text("  k=2: ", font=CJK, color=GREEN).scale(0.46),
            MathTex(r"\lambda=0.94\,\text{\AA}", color=GREEN).scale(0.65),
            Text("  (均在范围内)", font=CJK, color=GREEN).scale(0.46),
        ).arrange(RIGHT, buff=0.05)
        s4 = VGroup(
            Text("k=3: ", font=CJK, color=RED).scale(0.46),
            MathTex(r"\lambda=0.63\,\text{\AA}", color=RED).scale(0.65),
            Text("  超出探测范围，不选", font=CJK, color=RED).scale(0.46),
        ).arrange(RIGHT, buff=0.05)

        summary = VGroup(s1, s2, s3, s4).arrange(DOWN, buff=0.38).next_to(s_title, DOWN, buff=0.40)
        summary.scale_to_fit_width(12.5)
        s_box = SurroundingRectangle(summary, color=BLUE, buff=0.32, corner_radius=0.14)

        self.play(FadeIn(s_title))
        self.play(Write(s1))
        self.wait(0.6)
        self.play(Write(s2))
        self.wait(0.6)
        self.play(FadeIn(s3))
        self.wait(0.5)
        self.play(FadeIn(s4))
        self.play(Create(s_box))
        self.wait(2.0)

        self.play(FadeOut(VGroup(s_title, summary, s_box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch14Ex2BraggReflectionWavelengthSelection",
        "id": "phys-ch14-14.1-ex2-bragg-reflection-wavelength-selection",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "布喇格衍射选波长",
        "description": "以 d=2.75Å、θ=20° 为例，动画推导路程差 δ=1.88Å，逐级筛选 k=1(1.88Å)和 k=2(0.94Å)在探测范围内、k=3(0.63Å)超出，配合波形干涉直觉与汇总表格。",
    },
]
