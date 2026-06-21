"""第 14.1 节 · X 射线谱与短波极限（连续谱 + 标识谱 + 短波极限公式）。

连续 X 射线谱曲线 Axes.plot + ValueTracker 管电压扫动（λ_min 左移），
叠加 Kα/Kβ 特征峰，对比 mA（强度）与 kV（硬度）控制两个独立参数。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# ── 物理辅助函数 ─────────────────────────────────────────────────────────────
def xray_intensity(lam, lam_min, I_scale=1.0):
    """连续 X 射线谱强度模型（λ > λ_min 时才有值）。
    近似：I ∝ Z·i·(λ/λ_min - 1) / λ^2  (Kramers 公式近似)
    """
    if lam <= lam_min:
        return 0.0
    val = I_scale * (lam / lam_min - 1.0) / (lam ** 2)
    return min(val, 4.0)  # 截断峰值避免溢出屏幕


def lambda_min_from_kV(U_kV):
    """短波极限 λ_min = 1.242 / U(kV)  单位 nm，返回单位化 x 轴值。"""
    return 1.242 / U_kV


class Ch14Kp2XraySpectrumShortWaveLimit(Scene):
    def construct(self):
        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("X 射线谱与短波极限", font=CJK, color=BLUE).scale(0.7).to_edge(UP)
        subtitle = Text("第十四章 X 射线与激光 · 14.1", font=CJK, color=WHITE).scale(0.42)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("医院拍骨骼用 X 射线——", font=CJK, color=WHITE).scale(0.48)
        ana2 = Text("电子撞击金属靶后急刹车，动能转化为 X 光子，", font=CJK, color=WHITE).scale(0.48)
        ana3 = Text("但光子能量不能超过电子的全部动能，", font=CJK, color=WHITE).scale(0.48)
        ana4 = Text("因此 X 射线的波长存在一个最短极限。", font=CJK, color=YELLOW).scale(0.48)
        ana_group = VGroup(ana1, ana2, ana3, ana4).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        ana_group.next_to(title, DOWN, buff=0.55)
        ana_group.scale_to_fit_width(12)
        self.play(FadeIn(ana1))
        self.wait(0.5)
        self.play(FadeIn(ana2))
        self.wait(0.5)
        self.play(FadeIn(ana3))
        self.wait(0.5)
        self.play(FadeIn(ana4))
        self.wait(1.8)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 短波极限公式推导（逐步）
        # ══════════════════════════════════════════════════════════════════
        deriv_title = Text("短波极限推导", font=CJK, color=BLUE).scale(0.52)
        deriv_title.next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(deriv_title))

        # 步骤 3a：能量守恒
        eq_energy = MathTex(r"eU = h\nu_{\max} = \frac{hc}{\lambda_{\min}}").scale(0.82)
        eq_energy.next_to(deriv_title, DOWN, buff=0.42)
        eq_energy[0][0:2].set_color(YELLOW)   # eU
        eq_energy[0][5:12].set_color(ORANGE)  # hν_max
        label_energy = VGroup(
            Text("电子动能", font=CJK, color=YELLOW).scale(0.4),
            Text("=", font=CJK).scale(0.4),
            Text("最高频率光子能量", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.25).next_to(eq_energy, DOWN, buff=0.22)
        self.play(Write(eq_energy))
        self.play(FadeIn(label_energy))
        self.wait(1.5)

        # 步骤 3b：解出 λ_min
        eq_result = MathTex(
            r"\lambda_{\min} = \frac{hc}{eU} = \frac{1.242}{U(\mathrm{kV})}\,\mathrm{nm}"
        ).scale(0.82)
        eq_result.set_color(GREEN)
        eq_result.next_to(label_energy, DOWN, buff=0.38)
        self.play(Write(eq_result))
        self.wait(1.2)

        # 步骤 3c：数值验证（80 kV 示例）
        example_line = VGroup(
            Text("例：U = 80 kV,", font=CJK, color=WHITE).scale(0.42),
            MathTex(r"\lambda_{\min}=\frac{1.242}{80}\approx 0.0155\,\mathrm{nm}").scale(0.42),
        ).arrange(RIGHT, buff=0.2)
        example_line.next_to(eq_result, DOWN, buff=0.32)
        self.play(FadeIn(example_line))
        self.wait(1.8)
        self.play(FadeOut(VGroup(deriv_title, eq_energy, label_energy, eq_result, example_line)))

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 建立坐标系 + 绘制连续谱（固定管电压 80 kV）
        # ══════════════════════════════════════════════════════════════════
        axes = Axes(
            x_range=[0, 0.12, 0.02],
            y_range=[0, 3.5, 1.0],
            x_length=9.5,
            y_length=3.8,
            axis_config={"color": BLUE, "include_tip": True},
            x_axis_config={"numbers_to_include": [0.02, 0.04, 0.06, 0.08, 0.10]},
        ).shift(DOWN * 0.55)

        x_label = VGroup(
            MathTex(r"\lambda").scale(0.55),
            Text("(nm)", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.08).next_to(axes.x_axis.get_end(), RIGHT, buff=0.12)
        y_label = VGroup(
            MathTex(r"I").scale(0.55),
            Text("(相对强度)", font=CJK).scale(0.35),
        ).arrange(DOWN, buff=0.06).next_to(axes.y_axis.get_end(), UP, buff=0.08)

        axes_label = Text("X 射线强度谱", font=CJK, color=BLUE).scale(0.45)
        axes_label.next_to(axes, UP, buff=0.05)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), FadeIn(axes_label))
        self.wait(0.5)

        # 初始管电压 80 kV
        U_kV_init = 80.0
        lam_min_init = lambda_min_from_kV(U_kV_init)  # ≈ 0.01553 nm
        I_scale_init = 1.0

        def make_continuous_curve(lam_min, I_scale, color=YELLOW):
            """绘制连续 X 射线谱曲线。"""
            return axes.plot(
                lambda x: xray_intensity(x, lam_min, I_scale),
                x_range=[lam_min + 1e-4, 0.115, 0.0005],
                color=color,
                stroke_width=2.5,
            )

        cont_curve = make_continuous_curve(lam_min_init, I_scale_init)
        self.play(Create(cont_curve), run_time=1.5)
        self.wait(0.8)

        # 短波极限竖线 + 标注
        lam_min_x = axes.c2p(lam_min_init, 0)
        lam_min_top = axes.c2p(lam_min_init, 3.4)
        lmin_vline = DashedLine(lam_min_x, lam_min_top, color=RED, stroke_width=2)
        lmin_label = VGroup(
            MathTex(r"\lambda_{\min}").scale(0.52),
            Text("(短波极限)", font=CJK, color=RED).scale(0.38),
        ).arrange(DOWN, buff=0.06)
        lmin_label.set_color(RED)
        lmin_label.next_to(lam_min_top, UP, buff=0.1)

        self.play(Create(lmin_vline), FadeIn(lmin_label))
        self.wait(1.0)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: ValueTracker 扫动管电压 40→120 kV
        # ══════════════════════════════════════════════════════════════════
        U_tracker = ValueTracker(U_kV_init)

        # 动态曲线（always_redraw）
        dyn_curve = always_redraw(
            lambda: axes.plot(
                lambda x: xray_intensity(
                    x,
                    lambda_min_from_kV(U_tracker.get_value()),
                    1.0,
                ),
                x_range=[lambda_min_from_kV(U_tracker.get_value()) + 5e-5, 0.115, 0.0004],
                color=YELLOW,
                stroke_width=2.5,
            )
        )

        # 动态短波极限线
        dyn_vline = always_redraw(
            lambda: DashedLine(
                axes.c2p(lambda_min_from_kV(U_tracker.get_value()), 0),
                axes.c2p(lambda_min_from_kV(U_tracker.get_value()), 3.4),
                color=RED,
                stroke_width=2,
            )
        )

        # 动态 λ_min 数值显示
        dyn_lmin_val = always_redraw(
            lambda: VGroup(
                Text("U =", font=CJK, color=WHITE).scale(0.4),
                MathTex(
                    r"{:.0f}\,\mathrm{{kV}}".format(U_tracker.get_value())
                ).scale(0.4),
                Text("  ->  ", font=CJK, color=WHITE).scale(0.4),
                MathTex(
                    r"\lambda_{{\min}}={:.4f}\,\mathrm{{nm}}".format(
                        lambda_min_from_kV(U_tracker.get_value())
                    )
                ).scale(0.4),
            ).arrange(RIGHT, buff=0.12).to_edge(DOWN, buff=0.45)
        )

        # 用电压显示框替换静态曲线
        self.play(
            FadeOut(cont_curve),
            FadeOut(lmin_vline),
            FadeOut(lmin_label),
        )
        self.add(dyn_curve, dyn_vline)
        self.play(FadeIn(dyn_lmin_val))

        # 管电压升高：曲线上升，λ_min 左移
        sweep_label = Text("管电压升高 -> 曲线上升，短波极限左移", font=CJK, color=CYAN).scale(0.42)
        sweep_label.to_edge(DOWN, buff=1.1)
        self.play(FadeIn(sweep_label))
        self.wait(0.5)
        self.play(U_tracker.animate.set_value(120), run_time=3.5, rate_func=smooth)
        self.wait(0.8)

        # 管电压降低
        self.play(U_tracker.animate.set_value(40), run_time=3.0, rate_func=smooth)
        self.wait(0.8)
        # 回到 80 kV
        self.play(U_tracker.animate.set_value(80), run_time=1.5, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(sweep_label), FadeOut(dyn_lmin_val))

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 叠加特征谱峰 Kα、Kβ + 原子跃迁示意
        # ══════════════════════════════════════════════════════════════════
        # 特征峰位置（铜靶近似，已单位化到坐标轴 nm 量纲）
        kbeta_lam = 0.039   # Kβ 峰
        kalpha_lam = 0.046  # Kα 峰
        peak_height = 3.0

        # Kβ 竖线（蓝色）
        kbeta_line = Line(
            axes.c2p(kbeta_lam, 0.0),
            axes.c2p(kbeta_lam, peak_height),
            color=CYAN,
            stroke_width=4,
        )
        kbeta_dot = Dot(axes.c2p(kbeta_lam, peak_height), color=CYAN, radius=0.09)
        kbeta_label = VGroup(
            MathTex(r"K_\beta").scale(0.55).set_color(CYAN),
        )
        kbeta_label.next_to(kbeta_dot, UP, buff=0.08)

        # Kα 竖线（绿色）
        kalpha_line = Line(
            axes.c2p(kalpha_lam, 0.0),
            axes.c2p(kalpha_lam, peak_height * 1.25),
            color=GREEN,
            stroke_width=4,
        )
        kalpha_dot = Dot(axes.c2p(kalpha_lam, peak_height * 1.25), color=GREEN, radius=0.09)
        kalpha_label = VGroup(
            MathTex(r"K_\alpha").scale(0.55).set_color(GREEN),
        )
        kalpha_label.next_to(kalpha_dot, UP, buff=0.08)

        char_caption = Text("特征谱（标识谱）：内层电子跃迁产生", font=CJK, color=WHITE).scale(0.42)
        char_caption.to_edge(DOWN, buff=0.45)

        self.play(
            Create(kbeta_line), FadeIn(kbeta_dot), FadeIn(kbeta_label),
            Create(kalpha_line), FadeIn(kalpha_dot), FadeIn(kalpha_label),
            FadeIn(char_caption),
        )
        self.wait(1.5)

        # 原子能级跃迁示意图（右侧小图）
        # K、L、M 壳层三条水平线
        atom_x = 4.2   # 世界坐标，配合 axes shift

        K_line = Line(LEFT * 0.55 + DOWN * 0.2, RIGHT * 0.55 + DOWN * 0.2, color=WHITE, stroke_width=2)
        L_line = Line(LEFT * 0.55 + UP * 0.55, RIGHT * 0.55 + UP * 0.55, color=WHITE, stroke_width=2)
        M_line = Line(LEFT * 0.55 + UP * 1.15, RIGHT * 0.55 + UP * 1.15, color=WHITE, stroke_width=2)

        K_lbl = Text("K", font=CJK, color=WHITE).scale(0.32).next_to(K_line, LEFT, buff=0.08)
        L_lbl = Text("L", font=CJK, color=WHITE).scale(0.32).next_to(L_line, LEFT, buff=0.08)
        M_lbl = Text("M", font=CJK, color=WHITE).scale(0.32).next_to(M_line, LEFT, buff=0.08)

        # L->K 箭头（Kα）
        arr_LK = Arrow(
            L_line.get_center() + RIGHT * 0.15,
            K_line.get_center() + RIGHT * 0.15,
            buff=0.05, color=GREEN, stroke_width=2.5, max_tip_length_to_length_ratio=0.25,
        )
        lk_label = MathTex(r"K_\alpha").scale(0.38).set_color(GREEN).next_to(arr_LK, RIGHT, buff=0.06)

        # M->K 箭头（Kβ）
        arr_MK = Arrow(
            M_line.get_center() - RIGHT * 0.15,
            K_line.get_center() - RIGHT * 0.15,
            buff=0.05, color=CYAN, stroke_width=2.5, max_tip_length_to_length_ratio=0.25,
        )
        mk_label = MathTex(r"K_\beta").scale(0.38).set_color(CYAN).next_to(arr_MK, LEFT, buff=0.06)

        atom_box_group = VGroup(K_line, L_line, M_line, K_lbl, L_lbl, M_lbl,
                                arr_LK, lk_label, arr_MK, mk_label)
        atom_box_group.move_to(np.array([5.0, 0.6, 0]))

        atom_frame = SurroundingRectangle(atom_box_group, color=BLUE, buff=0.18, corner_radius=0.12)
        atom_title = Text("能级跃迁", font=CJK, color=BLUE).scale(0.38).next_to(atom_frame, UP, buff=0.05)

        self.play(FadeIn(atom_box_group), Create(atom_frame), FadeIn(atom_title))
        self.wait(2.0)
        self.play(
            FadeOut(char_caption),
            FadeOut(atom_box_group), FadeOut(atom_frame), FadeOut(atom_title),
        )

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 对比框 — mA 控强度 vs kV 控硬度
        # ══════════════════════════════════════════════════════════════════
        # 先清除特征峰（保留动态连续谱）
        self.play(
            FadeOut(kbeta_line), FadeOut(kbeta_dot), FadeOut(kbeta_label),
            FadeOut(kalpha_line), FadeOut(kalpha_dot), FadeOut(kalpha_label),
        )
        self.wait(0.3)

        # mA 滑块（控制曲线整体高低）
        mA_tracker = ValueTracker(1.0)   # 1.0 = 100% 强度

        # 用 mA_tracker 重定义动态曲线
        dyn_curve_ma = always_redraw(
            lambda: axes.plot(
                lambda x: xray_intensity(
                    x,
                    lambda_min_from_kV(80.0),   # 固定 kV
                    mA_tracker.get_value(),
                ),
                x_range=[lambda_min_from_kV(80.0) + 5e-5, 0.115, 0.0004],
                color=YELLOW,
                stroke_width=2.5,
            )
        )
        # 先移除旧动态曲线（U_tracker 仍然固定在 80 kV）
        self.remove(dyn_curve, dyn_vline)
        self.add(dyn_curve_ma)

        # 固定 λ_min 线（80 kV）
        fixed_vline = DashedLine(
            axes.c2p(lambda_min_from_kV(80.0), 0),
            axes.c2p(lambda_min_from_kV(80.0), 3.4),
            color=RED, stroke_width=2,
        )
        fixed_lmin_lbl = MathTex(r"\lambda_{\min}").scale(0.45).set_color(RED)
        fixed_lmin_lbl.next_to(axes.c2p(lambda_min_from_kV(80.0), 3.4), UP, buff=0.08)
        self.play(Create(fixed_vline), FadeIn(fixed_lmin_lbl))

        # 说明文字
        ma_title = Text("管电流 mA 控制「强度」（曲线整体升降）", font=CJK, color=ORANGE).scale(0.42)
        ma_title.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(ma_title))
        self.wait(0.5)

        # mA 增大：曲线升高，λ_min 不变
        self.play(mA_tracker.animate.set_value(2.5), run_time=2.5, rate_func=smooth)
        self.wait(0.6)
        self.play(mA_tracker.animate.set_value(0.5), run_time=2.0, rate_func=smooth)
        self.wait(0.6)
        self.play(mA_tracker.animate.set_value(1.0), run_time=1.2, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(ma_title))

        # kV 控制硬度：切换回 U_tracker 动态曲线
        kv_title = Text("管电压 kV 控制「硬度」（λ_min 左右移动）", font=CJK, color=CYAN).scale(0.42)
        kv_title.to_edge(DOWN, buff=0.45)

        self.remove(dyn_curve_ma)
        self.add(dyn_curve)    # 恢复 U_tracker 控制的动态曲线
        U_tracker.set_value(80.0)

        self.play(FadeOut(fixed_vline), FadeOut(fixed_lmin_lbl))
        self.add(dyn_vline)
        self.play(FadeIn(kv_title))
        self.wait(0.4)
        self.play(U_tracker.animate.set_value(120), run_time=2.5, rate_func=smooth)
        self.wait(0.5)
        self.play(U_tracker.animate.set_value(50), run_time=2.5, rate_func=smooth)
        self.wait(0.5)
        self.play(U_tracker.animate.set_value(80), run_time=1.2, rate_func=smooth)
        self.wait(0.5)
        self.play(FadeOut(kv_title))

        # 清场主图
        self.play(
            FadeOut(axes), FadeOut(x_label), FadeOut(y_label),
            FadeOut(axes_label),
            FadeOut(dyn_curve), FadeOut(dyn_vline),
        )
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 8: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.58).next_to(title, DOWN, buff=0.45)
        self.play(FadeIn(s_title))

        # 公式 1
        f1 = MathTex(
            r"\lambda_{\min} = \frac{hc}{eU} = \frac{1.242}{U(\mathrm{kV})}\,\mathrm{nm}",
            color=YELLOW,
        ).scale(0.78)

        # 文字注释行（中文 + 公式混排）
        note1 = VGroup(
            Text("连续谱（韧致辐射）：电子急刹车减速辐射", font=CJK, color=WHITE).scale(0.42),
        )
        note2 = VGroup(
            Text("特征谱（标识谱）：靶材内层电子跃迁", font=CJK, color=WHITE).scale(0.42),
        )
        note3_left = Text("mA", font=CJK, color=ORANGE).scale(0.42)
        note3_mid = Text("控强度（曲线高低），", font=CJK, color=WHITE).scale(0.42)
        note3_right = Text("kV", font=CJK, color=CYAN).scale(0.42)
        note3_end = Text("控硬度（λ_min 位置）", font=CJK, color=WHITE).scale(0.42)
        note3 = VGroup(note3_left, note3_mid, note3_right, note3_end).arrange(RIGHT, buff=0.08)

        summary = VGroup(f1, note1, note2, note3).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        summary.next_to(s_title, DOWN, buff=0.4)
        summary.scale_to_fit_width(11.5)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.35, corner_radius=0.15)

        self.play(Write(f1))
        self.wait(0.8)
        self.play(FadeIn(note1))
        self.wait(0.5)
        self.play(FadeIn(note2))
        self.wait(0.5)
        self.play(FadeIn(note3))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch14Kp2XraySpectrumShortWaveLimit",
        "id": "phys-ch14-14.1-kp2-xray-spectrum-short-wave-limit",
        "chapterId": "ch14",
        "sectionId": "14.1",
        "title": "X 射线谱与短波极限",
        "description": "连续 X 射线谱 Axes.plot + ValueTracker 管电压扫动演示 λ_min 左移，叠加 Kα/Kβ 特征峰及原子能级跃迁示意，对比 mA/kV 分别控制强度与硬度。",
    },
]
