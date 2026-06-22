"""第 9.1 节 · 楞次定律与感应方向（金标准范本：矢量场 / 楞次定律 + ValueTracker 扫动）。

磁铁插入/拔出线圈的全过程动画：
  场景一  磁铁插入 + 实时显示磁通量 Φ 的变化
  场景二  三步判断法（磁通增大 → 感应 B' 反向 → 右手定则 → 顺时针电流）
  场景三  磁铁拔出，方向反转，ε_i < 0 对应关系
  场景四  能量守恒图示（外力做功 → 电能）

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


# ─── 辅助：画弯曲磁感线（用贝塞尔近似圆弧箭头） ────────────────────────────
def make_field_line(center, radius, color=BLUE_C, n_arrows=6):
    """围绕 center 画 n_arrows 段向外辐射的小弧形箭头（模拟磁感线）。"""
    arrows = VGroup()
    for k in range(n_arrows):
        ang = k * TAU / n_arrows
        # 每段弧从 radius-0.15 到 radius+0.15
        start = center + np.array([math.cos(ang), math.sin(ang), 0]) * (radius - 0.15)
        end   = center + np.array([math.cos(ang + 0.45), math.sin(ang + 0.45), 0]) * (radius + 0.15)
        arr = Arrow(start, end, buff=0, color=color,
                    stroke_width=2.5, max_tip_length_to_length_ratio=0.35)
        arrows.add(arr)
    return arrows


def make_coil(center=ORIGIN, radius=1.5, color=WHITE):
    """画一个圆形线圈（Circle），返回 VMobject。"""
    coil = Circle(radius=radius, color=color, stroke_width=4)
    coil.move_to(center)
    return coil


def make_magnet(pos=UP * 3, width=0.6, height=1.2):
    """画条形磁铁（矩形 N/S 两半）。"""
    n_rect = Rectangle(width=width, height=height / 2, fill_color=RED,
                        fill_opacity=0.9, stroke_color=WHITE, stroke_width=1.5)
    s_rect = Rectangle(width=width, height=height / 2, fill_color=BLUE,
                        fill_opacity=0.9, stroke_color=WHITE, stroke_width=1.5)
    n_rect.next_to(s_rect, UP, buff=0)
    magnet = VGroup(s_rect, n_rect)
    n_label = Text("N", font=CJK, color=WHITE).scale(0.5).move_to(n_rect.get_center())
    s_label = Text("S", font=CJK, color=WHITE).scale(0.5).move_to(s_rect.get_center())
    group = VGroup(magnet, n_label, s_label)
    group.move_to(pos)
    return group


class Ch09Kp2LenzLawDirection(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════
        # Step 1: 标题 + 副标题
        # ══════════════════════════════════════════════════════════
        title = Text("楞次定律与感应方向", font=CJK, color=BLUE).scale(0.72).to_edge(UP)
        subtitle = Text("第九章 电磁感应与电磁波 · 9.1", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════
        # Step 2: 生活类比
        # ══════════════════════════════════════════════════════════
        ana1 = Text("把磁铁插入一个闭合线圈——线圈里会出现电流吗？", font=CJK).scale(0.48)
        ana2 = Text("法拉第发现：有！而且电流方向遵循「楞次定律」：", font=CJK).scale(0.48)
        ana3 = Text("感应电流产生的磁场，总是反抗引起它的那个磁通量变化。",
                    font=CJK, color=YELLOW).scale(0.48)
        ana = VGroup(ana1, ana2, ana3).arrange(DOWN, buff=0.28).next_to(title, DOWN, buff=0.55)
        for line in [ana1, ana2, ana3]:
            self.play(FadeIn(line))
            self.wait(0.7)
        self.wait(1.0)
        self.play(FadeOut(ana))

        # ══════════════════════════════════════════════════════════
        # Step 3: 法拉第 / 楞次 公式定义
        # ══════════════════════════════════════════════════════════
        def_zh = Text("楞次定律（法拉第定律的方向体现）", font=CJK, color=BLUE).scale(0.5)
        def_zh.next_to(title, DOWN, buff=0.45)

        faraday = MathTex(r"\varepsilon_i", r"=", r"-\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}").scale(1.0)
        faraday.next_to(def_zh, DOWN, buff=0.4)
        faraday[0].set_color(ORANGE)
        faraday[2].set_color(YELLOW)

        note1 = VGroup(
            Text("负号 = 感应电动势反抗磁通变化", font=CJK, color=GREEN).scale(0.44),
        ).next_to(faraday, DOWN, buff=0.35)

        lenz_rule = MathTex(r"\Phi_{B'}", r"\text{ opposes }", r"\Delta\Phi_B").scale(0.85)
        lenz_rule.next_to(note1, DOWN, buff=0.35)
        lenz_rule[0].set_color(CYAN)
        lenz_rule[2].set_color(ORANGE)

        self.play(FadeIn(def_zh))
        self.play(Write(faraday))
        self.wait(1.0)
        self.play(FadeIn(note1))
        self.wait(0.8)
        self.play(Write(lenz_rule))
        self.wait(1.4)
        self.play(FadeOut(VGroup(def_zh, faraday, note1, lenz_rule)))

        # ══════════════════════════════════════════════════════════
        # Step 4: 场景一 — 磁铁插入 + 实时 Φ 读数
        # ══════════════════════════════════════════════════════════
        scene_cap = Text("场景一：磁铁从上方插入，观察磁通变化", font=CJK, color=BLUE).scale(0.46)
        scene_cap.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(scene_cap))

        # 线圈（俯视图，在画面下方中心）
        coil_center = DOWN * 1.0
        coil = make_coil(center=coil_center, radius=1.5, color=WHITE)
        coil_label = Text("闭合线圈（俯视）", font=CJK, color=WHITE).scale(0.38)
        coil_label.next_to(coil, DOWN, buff=0.25)
        self.play(Create(coil), FadeIn(coil_label))

        # 磁铁从高处开始
        mag_start_y = 3.2
        mag_end_y   = -0.2   # 插入线圈正上方
        mag_tracker = ValueTracker(mag_start_y)

        magnet_group = make_magnet(pos=UP * mag_start_y)
        self.play(FadeIn(magnet_group))

        # 磁感线（随磁铁位置动态生成）
        def make_b_lines():
            # 磁铁 N 上 S 下，S 极朝向下方线圈。外部磁感线指向 S 极，
            # 故磁铁下方(线圈处)的磁场竖直向上、进入 S 极 —— 用向上的箭头表示。
            cy = mag_tracker.get_value()
            mag_bottom = cy - 0.6          # 磁铁底部(S 极)面
            lines = VGroup()
            for dx in [-0.7, -0.35, 0.0, 0.35, 0.7]:
                start = np.array([dx, mag_bottom - 1.35, 0.0])
                end   = np.array([dx, mag_bottom - 0.08, 0.0])
                lines.add(Arrow(start, end, buff=0, color=BLUE_C,
                                stroke_width=1.8, max_tip_length_to_length_ratio=0.18))
            return lines

        b_lines = always_redraw(make_b_lines)

        # 磁铁跟随 tracker 移动
        def update_magnet(m):
            m.move_to(np.array([0.0, mag_tracker.get_value(), 0.0]))

        magnet_group.add_updater(update_magnet)
        self.add(b_lines)

        # Φ 实时读数（右侧）
        phi_label_zh = Text("磁通量", font=CJK, color=ORANGE).scale(0.46)
        phi_label_zh.to_corner(UR, buff=0.7).shift(DOWN * 1.2)

        def make_phi_readout():
            # 磁铁越靠近线圈，Φ 越大；用线性近似
            y = mag_tracker.get_value()
            # 距离线圈中心 = y - coil_center[1] = y - (-1.0) = y + 1.0
            dist = y - (-1.0)
            # Φ 从 0 增大到最大值（dist=2.4→0；dist=0.8→最大）
            phi_val = max(0.0, (2.4 - dist) / 1.6 * 3.0)
            phi_val = min(phi_val, 3.0)
            return MathTex(rf"\Phi_B = {phi_val:.1f}\ \mathrm{{T\cdot m^2}}",
                           color=ORANGE).scale(0.58).next_to(phi_label_zh, DOWN, buff=0.2)

        phi_readout = always_redraw(make_phi_readout)

        # 方向箭头（Φ 增大 → 向上箭头）
        phi_up_arrow = Arrow(DOWN * 0.3, UP * 0.3, buff=0, color=ORANGE, stroke_width=4)
        phi_up_arrow.next_to(phi_label_zh, LEFT, buff=0.25)
        phi_up_text = Text("增大", font=CJK, color=ORANGE).scale(0.38)
        phi_up_text.next_to(phi_up_arrow, DOWN, buff=0.1)

        self.play(FadeIn(phi_label_zh), FadeIn(phi_readout))
        self.play(FadeIn(phi_up_arrow), FadeIn(phi_up_text))

        # 磁铁缓慢插入
        self.play(mag_tracker.animate.set_value(mag_end_y), run_time=3.5)
        self.wait(1.0)

        self.play(FadeOut(VGroup(phi_up_arrow, phi_up_text, phi_label_zh, phi_readout,
                                 b_lines, scene_cap)))
        magnet_group.remove_updater(update_magnet)
        self.play(FadeOut(magnet_group))

        # ══════════════════════════════════════════════════════════
        # Step 5: 场景二 — 三步判断流程（插入情况）
        # ══════════════════════════════════════════════════════════
        scene2_cap = Text("场景二：三步判断感应电流方向（磁铁插入）", font=CJK, color=BLUE).scale(0.44)
        scene2_cap.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(scene2_cap))

        # 线圈仍在画面中（coil 还在）
        # 步骤一
        step1_zh = Text("①  穿过线圈的磁通量  ", font=CJK, color=WHITE).scale(0.46)
        step1_math = MathTex(r"\Phi_B", color=ORANGE).scale(0.72)
        step1_incr = Text("  增大", font=CJK, color=ORANGE).scale(0.46)
        step1 = VGroup(step1_zh, step1_math, step1_incr).arrange(RIGHT, buff=0.1)
        step1.next_to(title, DOWN, buff=1.0)

        step2_zh = Text("②  感应磁场", font=CJK, color=WHITE).scale(0.46)
        step2_dir = Text("  B' 向下（反抗增大）", font=CJK, color=CYAN).scale(0.46)
        step2 = VGroup(step2_zh, step2_dir).arrange(RIGHT, buff=0.1)
        step2.next_to(step1, DOWN, buff=0.32)

        step3_zh = Text("③  右手定则：四指弯向电流方向", font=CJK, color=WHITE).scale(0.46)
        step3 = step3_zh
        step3.next_to(step2, DOWN, buff=0.32)

        result_zh = Text("感应电流：", font=CJK, color=GREEN).scale(0.52)
        result_dir = Text("顺时针方向", font=CJK, color=GREEN).scale(0.52)
        result = VGroup(result_zh, result_dir).arrange(RIGHT, buff=0.1)
        result.next_to(step3, DOWN, buff=0.38)

        self.play(FadeIn(step1))
        self.wait(1.0)
        self.play(FadeIn(step2))
        self.wait(1.0)
        self.play(FadeIn(step3))
        self.wait(1.0)

        # 在线圈上画顺时针电流箭头
        cw_arrows = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            # 顺时针：箭头从 ang 到 ang - TAU/8
            start = coil_center + np.array([math.cos(ang), math.sin(ang), 0]) * 1.5
            end   = coil_center + np.array([math.cos(ang - TAU / 8), math.sin(ang - TAU / 8), 0]) * 1.5
            arr = Arrow(start, end, buff=0, color=GREEN, stroke_width=3.5,
                        max_tip_length_to_length_ratio=0.3)
            cw_arrows.add(arr)

        self.play(Create(cw_arrows))
        self.play(FadeIn(result))
        self.wait(1.5)

        # B' 向下箭头（线圈中心）
        b_prime_arrow = Arrow(coil_center + UP * 0.4, coil_center + DOWN * 0.4,
                              buff=0, color=CYAN, stroke_width=5)
        b_prime_label = VGroup(
            MathTex(r"B'", color=CYAN).scale(0.65),
            Text("向下", font=CJK, color=CYAN).scale(0.38),
        ).arrange(DOWN, buff=0.08).next_to(b_prime_arrow, RIGHT, buff=0.18)
        self.play(GrowArrow(b_prime_arrow), FadeIn(b_prime_label))
        self.wait(1.6)

        # 显示法拉第公式对应
        epsi_insert = MathTex(r"\varepsilon_i = -\frac{\mathrm{d}\Phi_B}{\mathrm{d}t} < 0",
                              color=ORANGE).scale(0.72)
        epsi_insert.next_to(result, DOWN, buff=0.38)
        self.play(Write(epsi_insert))
        self.wait(1.4)

        # 清场
        self.play(FadeOut(VGroup(step1, step2, step3, result, cw_arrows,
                                 b_prime_arrow, b_prime_label, epsi_insert, scene2_cap)))

        # ══════════════════════════════════════════════════════════
        # Step 6: 场景三 — 磁铁拔出，方向反转
        # ══════════════════════════════════════════════════════════
        scene3_cap = Text("场景三：磁铁拔出——方向反转", font=CJK, color=BLUE).scale(0.44)
        scene3_cap.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(scene3_cap))

        # 重新把磁铁放回插入状态（在线圈附近）
        mag_tracker.set_value(mag_end_y)
        magnet_group2 = make_magnet(pos=np.array([0.0, mag_end_y, 0.0]))

        def update_magnet2(m):
            m.move_to(np.array([0.0, mag_tracker.get_value(), 0.0]))

        magnet_group2.add_updater(update_magnet2)
        self.play(FadeIn(magnet_group2))

        # 磁铁缓慢拔出
        pull_label = Text("磁铁向上拔出……", font=CJK, color=WHITE).scale(0.44)
        pull_label.next_to(coil, DOWN, buff=0.55)
        self.play(FadeIn(pull_label))
        self.play(mag_tracker.animate.set_value(mag_start_y), run_time=3.0)
        self.wait(0.6)
        magnet_group2.remove_updater(update_magnet2)
        self.play(FadeOut(VGroup(magnet_group2, pull_label)))

        # 三步分析（拔出）
        s1_pull = Text("①  磁通量减小", font=CJK, color=ORANGE).scale(0.46)
        s1_pull.next_to(title, DOWN, buff=1.0)

        s2_pull_zh = Text("②  感应磁场", font=CJK, color=WHITE).scale(0.46)
        s2_pull_dir = Text("  B' 向上（维持磁通）", font=CJK, color=CYAN).scale(0.46)
        s2_pull = VGroup(s2_pull_zh, s2_pull_dir).arrange(RIGHT, buff=0.1)
        s2_pull.next_to(s1_pull, DOWN, buff=0.32)

        s3_pull = Text("③  右手定则 → 感应电流逆时针", font=CJK, color=WHITE).scale(0.46)
        s3_pull.next_to(s2_pull, DOWN, buff=0.32)

        res_pull_zh = Text("感应电流：", font=CJK, color=GREEN).scale(0.52)
        res_pull_dir = Text("逆时针方向", font=CJK, color=GREEN).scale(0.52)
        res_pull = VGroup(res_pull_zh, res_pull_dir).arrange(RIGHT, buff=0.1)
        res_pull.next_to(s3_pull, DOWN, buff=0.38)

        self.play(FadeIn(s1_pull))
        self.wait(1.0)
        self.play(FadeIn(s2_pull))
        self.wait(1.0)
        self.play(FadeIn(s3_pull))
        self.wait(1.0)

        # 逆时针电流箭头
        ccw_arrows = VGroup()
        for k in range(8):
            ang = k * TAU / 8
            start = coil_center + np.array([math.cos(ang), math.sin(ang), 0]) * 1.5
            end   = coil_center + np.array([math.cos(ang + TAU / 8), math.sin(ang + TAU / 8), 0]) * 1.5
            arr = Arrow(start, end, buff=0, color=GREEN, stroke_width=3.5,
                        max_tip_length_to_length_ratio=0.3)
            ccw_arrows.add(arr)

        self.play(Create(ccw_arrows))
        self.play(FadeIn(res_pull))
        self.wait(1.0)

        # ε_i > 0 对应
        epsi_pull = MathTex(r"\varepsilon_i = -\frac{\mathrm{d}\Phi_B}{\mathrm{d}t} > 0",
                             color=ORANGE).scale(0.72)
        epsi_pull.next_to(res_pull, DOWN, buff=0.35)
        self.play(Write(epsi_pull))
        self.wait(1.4)

        self.play(FadeOut(VGroup(s1_pull, s2_pull, s3_pull, res_pull, ccw_arrows,
                                 epsi_pull, scene3_cap)))

        # ══════════════════════════════════════════════════════════
        # Step 7: 场景四 — 能量守恒图示
        # ══════════════════════════════════════════════════════════
        energy_cap = Text("楞次定律的本质：能量守恒", font=CJK, color=BLUE).scale(0.5)
        energy_cap.next_to(title, DOWN, buff=0.4)
        self.play(FadeOut(coil), FadeOut(coil_label))
        self.play(FadeIn(energy_cap))

        # 能量转化框图
        box_w_zh = Text("外力克服\n反抗力做功", font=CJK, color=WHITE).scale(0.44)
        box_w = SurroundingRectangle(box_w_zh, color=RED, buff=0.2, corner_radius=0.12)
        grp_w = VGroup(box_w, box_w_zh).move_to(LEFT * 3.5 + DOWN * 0.5)

        arrow_wq = Arrow(LEFT * 1.9 + DOWN * 0.5, LEFT * 0.5 + DOWN * 0.5,
                         buff=0, color=YELLOW, stroke_width=3)
        convert_label = Text("转化", font=CJK, color=YELLOW).scale(0.38)
        convert_label.next_to(arrow_wq, UP, buff=0.1)

        box_e_zh = Text("感应电动势\n驱动电流", font=CJK, color=WHITE).scale(0.44)
        box_e = SurroundingRectangle(box_e_zh, color=ORANGE, buff=0.2, corner_radius=0.12)
        grp_e = VGroup(box_e, box_e_zh).move_to(DOWN * 0.5)

        arrow_eq = Arrow(RIGHT * 1.5 + DOWN * 0.5, RIGHT * 2.8 + DOWN * 0.5,
                         buff=0, color=YELLOW, stroke_width=3)
        heat_label_zh = Text("电能/热能", font=CJK, color=YELLOW).scale(0.38)
        heat_label_zh.next_to(arrow_eq, UP, buff=0.1)

        box_q_zh = Text("电能 → 热\n(电阻耗散)", font=CJK, color=WHITE).scale(0.44)
        box_q = SurroundingRectangle(box_q_zh, color=GREEN, buff=0.2, corner_radius=0.12)
        grp_q = VGroup(box_q, box_q_zh).move_to(RIGHT * 3.5 + DOWN * 0.5)

        energy_eq = MathTex(r"W_{\text{ext}} = \varepsilon_i \cdot q = \Delta E_{\text{elec}}",
                            color=YELLOW).scale(0.68)
        energy_eq.next_to(grp_e, DOWN, buff=0.55)

        self.play(FadeIn(grp_w))
        self.play(GrowArrow(arrow_wq), FadeIn(convert_label))
        self.play(FadeIn(grp_e))
        self.play(GrowArrow(arrow_eq), FadeIn(heat_label_zh))
        self.play(FadeIn(grp_q))
        self.wait(0.8)
        self.play(Write(energy_eq))
        self.wait(1.4)

        conservation_note = Text("楞次定律保证了感应电流方向使外力做正功——能量守恒！",
                                 font=CJK, color=GREEN).scale(0.42)
        conservation_note.next_to(energy_eq, DOWN, buff=0.35)
        self.play(FadeIn(conservation_note))
        self.wait(1.6)

        self.play(FadeOut(VGroup(grp_w, arrow_wq, convert_label, grp_e,
                                 arrow_eq, heat_label_zh, grp_q, energy_eq,
                                 conservation_note, energy_cap)))

        # ══════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════
        s_title = Text("本节小结：楞次定律", font=CJK, color=BLUE).scale(0.56)
        s_title.next_to(title, DOWN, buff=0.45)

        sum1 = MathTex(r"\varepsilon_i = -\frac{\mathrm{d}\Phi_B}{\mathrm{d}t}",
                       color=YELLOW).scale(0.82)
        sum2_zh = Text("负号 = 感应效应反抗磁通变化（楞次定律）", font=CJK, color=WHITE).scale(0.44)
        sum3_zh = Text("三步判断：磁通方向 → 感应 B' 方向 → 右手定则 → 电流方向",
                       font=CJK, color=CYAN).scale(0.42)
        sum4_zh = Text("本质：能量守恒，外力做功转化为电能", font=CJK, color=GREEN).scale(0.44)

        summary = VGroup(sum1, sum2_zh, sum3_zh, sum4_zh).arrange(DOWN, buff=0.38)
        summary.next_to(s_title, DOWN, buff=0.42)
        summary.scale_to_fit_width(11.5)
        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(FadeIn(s_title))
        self.play(Write(sum1))
        self.wait(0.5)
        self.play(FadeIn(sum2_zh))
        self.wait(0.5)
        self.play(FadeIn(sum3_zh))
        self.wait(0.5)
        self.play(FadeIn(sum4_zh))
        self.play(Create(box))
        self.wait(2.2)
        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch09Kp2LenzLawDirection",
        "id": "phys-ch09-9.1-kp2-lenz-law-direction",
        "chapterId": "ch09",
        "sectionId": "9.1",
        "title": "楞次定律与感应方向",
        "description": "动画演示磁铁插入/拔出线圈时楞次定律的三步判断流程，实时展示磁通变化与感应电流方向，最后揭示楞次定律的能量守恒本质。",
    },
]
