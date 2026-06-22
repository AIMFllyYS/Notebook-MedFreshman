"""第 12.3 节 · 德布罗意波长的质量与速度依赖

双栏宏观/微观对比 + ValueTracker 速度扫动 + 双对数 λ-m 曲线，
直觉演示量子波动性在宏观世界消失的原因。

铁律：MathTex 内只能是纯 ASCII LaTeX；中文一律 Text(font=CJK)。
"""
from manim import *
import math
import numpy as np

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"

# 普朗克常数
H = 6.626e-34
# 电子质量
M_ELECTRON = 9.109e-31
# 子弹质量
M_BULLET = 0.01  # kg


def fmt_wavelength(lam: float) -> str:
    """将波长格式化为科学计数法字符串（纯 ASCII，用于 MathTex）。"""
    if lam == 0:
        return r"0"
    exp = math.floor(math.log10(abs(lam)))
    coeff = lam / (10 ** exp)
    return rf"{coeff:.2f}\times10^{{{int(exp)}}}\,\text{{m}}"


class Ch12Kp2DeBroglieWavelengthDependence(Scene):
    def construct(self):

        # ══════════════════════════════════════════════════════════════════
        # Step 1: 标题
        # ══════════════════════════════════════════════════════════════════
        title = Text("德布罗意波长：质量与速度依赖", font=CJK, color=BLUE).scale(0.62)
        title.to_edge(UP, buff=0.3)
        subtitle = Text("第十二章 量子力学初步 · 12.3", font=CJK, color=WHITE).scale(0.38)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ══════════════════════════════════════════════════════════════════
        # Step 2: 生活类比引入
        # ══════════════════════════════════════════════════════════════════
        ana1 = Text("子弹飞行时有波长吗？", font=CJK, color=YELLOW).scale(0.5)
        ana2 = Text("理论上有——但比原子核还小 10 亿亿倍，", font=CJK).scale(0.44)
        ana3 = Text("所以我们完全感知不到它的波动性。", font=CJK).scale(0.44)
        ana4 = Text("电子就不同了：它的德布罗意波长恰在原子尺度，", font=CJK).scale(0.44)
        ana5 = Text("可以产生真实可测的干涉条纹。", font=CJK, color=GREEN).scale(0.44)
        ana_group = VGroup(ana1, ana2, ana3, ana4, ana5).arrange(DOWN, buff=0.22)
        ana_group.next_to(title, DOWN, buff=0.55)
        for mob in [ana1, ana2, ana3, ana4, ana5]:
            self.play(FadeIn(mob), run_time=0.6)
        self.wait(1.5)
        self.play(FadeOut(ana_group))

        # ══════════════════════════════════════════════════════════════════
        # Step 3: 公式定义（逐步出现）
        # ══════════════════════════════════════════════════════════════════
        eq_label = Text("德布罗意关系式", font=CJK, color=BLUE).scale(0.46)
        eq_label.next_to(title, DOWN, buff=0.45)

        eq1 = MathTex(r"\lambda", r"=", r"\frac{h}{p}", r"=", r"\frac{h}{mv}").scale(0.88)
        eq1[2].set_color(YELLOW)
        eq1[4].set_color(ORANGE)
        eq1.next_to(eq_label, DOWN, buff=0.3)

        leg_h = VGroup(
            Text("h", font=CJK).scale(0.38),
            Text("= 6.626", font=CJK).scale(0.38),
            MathTex(r"\times 10^{-34}").scale(0.55),
            Text("J·s  (普朗克常数)", font=CJK).scale(0.38),
        ).arrange(RIGHT, buff=0.08)
        leg_p = VGroup(
            Text("p = mv  (动量)", font=CJK, color=YELLOW).scale(0.38),
        )
        leg_ek = MathTex(r"\lambda = \frac{h}{\sqrt{2mE_k}}").scale(0.72)
        leg_ek.set_color(CYAN)
        leg_ek_label = Text("（已知动能时）", font=CJK, color=CYAN).scale(0.38)
        leg_ek_row = VGroup(leg_ek_label, leg_ek).arrange(RIGHT, buff=0.2)

        legend = VGroup(leg_h, leg_p, leg_ek_row).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        legend.next_to(eq1, DOWN, buff=0.35)

        self.play(FadeIn(eq_label))
        self.play(Write(eq1))
        self.wait(0.8)
        self.play(FadeIn(legend))
        self.wait(2.0)
        self.play(FadeOut(VGroup(eq_label, legend)))

        # eq1 滑到左上，腾出空间
        self.play(eq1.animate.scale(0.75).next_to(title, DOWN, buff=0.35).to_edge(LEFT, buff=0.5))
        self.wait(0.5)

        # ══════════════════════════════════════════════════════════════════
        # Step 4: 双栏对比布局（宏观 vs 微观）+ ValueTracker 速度扫动
        # ══════════════════════════════════════════════════════════════════
        # ── 分割线 ──
        divider = Line(UP * 2.8, DOWN * 2.8, color=BLUE, stroke_width=1.5)
        divider.move_to(ORIGIN)

        # ── 左栏：宏观（子弹）──
        L_label = Text("宏观：子弹", font=CJK, color=ORANGE).scale(0.46)
        L_label.move_to(LEFT * 3.3 + UP * 2.6)
        L_m = VGroup(
            Text("m =", font=CJK).scale(0.38),
            MathTex(r"0.01\,\text{kg}").scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        L_m.next_to(L_label, DOWN, buff=0.22)

        # ── 右栏：微观（电子）──
        R_label = Text("微观：电子", font=CJK, color=GREEN).scale(0.46)
        R_label.move_to(RIGHT * 3.3 + UP * 2.6)
        R_m = VGroup(
            Text("m =", font=CJK).scale(0.38),
            MathTex(r"9.1\times10^{-31}\,\text{kg}").scale(0.52),
        ).arrange(RIGHT, buff=0.1)
        R_m.next_to(R_label, DOWN, buff=0.22)

        self.play(
            Create(divider),
            FadeIn(L_label), FadeIn(L_m),
            FadeIn(R_label), FadeIn(R_m),
        )
        self.wait(0.8)

        # ── 速度标签（固定文字，静态） ──
        v_label_left = Text("v =", font=CJK).scale(0.38)
        v_label_right = Text("v =", font=CJK).scale(0.38)
        v_label_left.move_to(LEFT * 3.8 + UP * 1.55)
        v_label_right.move_to(RIGHT * 2.8 + UP * 1.55)

        # 速度滑块提示
        v_hint = Text("速度 v 从低速逐步增大到高速", font=CJK, color=CYAN).scale(0.38)
        v_hint.to_edge(DOWN, buff=0.55)

        # 帮助函数：科学计数法字符串（纯 ASCII，用于 MathTex）
        def sci(val):
            if val == 0:
                return r"0"
            exp = math.floor(math.log10(abs(val)))
            coeff = val / (10 ** exp)
            return rf"{coeff:.2f}\times10^{{{int(exp)}}}"

        def make_v_num(v, anchor):
            return MathTex(rf"{sci(v)}\,\mathrm{{m/s}}").scale(0.48).next_to(
                anchor, RIGHT, buff=0.12
            )

        def make_lam_L(v):
            lam = H / (M_BULLET * v)
            return MathTex(
                rf"\lambda_{{bullet}} = {sci(lam)}\,\mathrm{{m}}"
            ).scale(0.46).set_color(ORANGE).move_to(LEFT * 3.2 + UP * 0.85)

        def make_lam_R(v):
            lam = H / (M_ELECTRON * v)
            return MathTex(
                rf"\lambda_{{e}} = {sci(lam)}\,\mathrm{{m}}"
            ).scale(0.46).set_color(GREEN).move_to(RIGHT * 3.2 + UP * 0.85)

        def make_ann_L(v):
            # 子弹波长始终极小：恒为不可观测
            return Text("波动性不可观测", font=CJK, color=RED).scale(0.36).move_to(
                LEFT * 3.2 + UP * 0.2
            )

        def make_ann_R(v):
            lam = H / (M_ELECTRON * v)
            if 5e-11 < lam < 5e-9:
                t = ("原子尺度，干涉可观测！", GREEN)
            elif lam >= 5e-9:
                t = ("波长较长，衍射显著", CYAN)
            else:
                t = ("波动性减弱", YELLOW)
            return Text(t[0], font=CJK, color=t[1]).scale(0.36).move_to(
                RIGHT * 3.2 + UP * 0.2
            )

        # 离散速度步进（替代 always_redraw 逐帧重编译 LaTeX）
        v_steps = [1.0, 1e2, 1e4, 1e6, 1e8]

        v0 = v_steps[0]
        v_num_L = make_v_num(v0, v_label_left)
        v_num_R = make_v_num(v0, v_label_right)
        lam_L = make_lam_L(v0)
        lam_R = make_lam_R(v0)
        ann_L = make_ann_L(v0)
        ann_R = make_ann_R(v0)

        self.play(
            FadeIn(v_label_left), FadeIn(v_label_right),
            FadeIn(v_num_L), FadeIn(v_num_R),
            FadeIn(lam_L), FadeIn(lam_R),
            FadeIn(ann_L), FadeIn(ann_R),
            FadeIn(v_hint),
        )
        self.wait(1.0)

        # 逐步增大速度，每步只重建一次标签（无逐帧 LaTeX）
        for v in v_steps[1:]:
            new_v_L = make_v_num(v, v_label_left)
            new_v_R = make_v_num(v, v_label_right)
            new_lam_L = make_lam_L(v)
            new_lam_R = make_lam_R(v)
            new_ann_L = make_ann_L(v)
            new_ann_R = make_ann_R(v)
            self.play(
                Transform(v_num_L, new_v_L),
                Transform(v_num_R, new_v_R),
                Transform(lam_L, new_lam_L),
                Transform(lam_R, new_lam_R),
                Transform(ann_L, new_ann_L),
                Transform(ann_R, new_ann_R),
                run_time=0.9,
            )
            self.wait(0.7)

        # 回到电子可观测区间（v≈8e5）作为定格
        v_obs = 8e5
        self.play(
            Transform(v_num_L, make_v_num(v_obs, v_label_left)),
            Transform(v_num_R, make_v_num(v_obs, v_label_right)),
            Transform(lam_L, make_lam_L(v_obs)),
            Transform(lam_R, make_lam_R(v_obs)),
            Transform(ann_L, make_ann_L(v_obs)),
            Transform(ann_R, make_ann_R(v_obs)),
            run_time=1.0,
        )
        self.wait(1.2)

        # 清场
        self.play(
            FadeOut(VGroup(
                divider, L_label, L_m, R_label, R_m,
                v_label_left, v_label_right,
                v_num_L, v_num_R,
                lam_L, lam_R,
                ann_L, ann_R,
                v_hint,
            ))
        )
        self.wait(0.4)

        # ══════════════════════════════════════════════════════════════════
        # Step 5: 第二幕——双对数坐标  λ vs m 曲线
        # ══════════════════════════════════════════════════════════════════
        act2_title = Text("双对数坐标：波长随质量的变化", font=CJK, color=BLUE).scale(0.46)
        act2_title.next_to(title, DOWN, buff=0.38)
        self.play(FadeIn(act2_title))
        self.wait(0.6)

        # 坐标轴（log10 m 横轴，log10 λ 纵轴）
        # m 范围：1e-30（电子附近） → 1 kg（宏观）  →  log10 m: -30 ~ 0
        # v 固定 = 1e4 m/s，λ = h/(mv)
        V_FIXED = 1e4  # m/s

        axes = Axes(
            x_range=[-31, 1, 5],
            y_range=[-38, 5, 5],
            x_length=10.0,
            y_length=5.2,
            axis_config={"color": BLUE, "include_tip": True, "stroke_width": 1.8},
        ).shift(DOWN * 0.85)

        x_label = VGroup(
            Text("lg(m / kg)", font=CJK).scale(0.38),
        ).next_to(axes.x_axis.get_end(), DOWN, buff=0.18)

        y_label = VGroup(
            Text("lg(", font=CJK).scale(0.36),
            MathTex(r"\lambda").scale(0.5),
            Text("/ m)", font=CJK).scale(0.36),
        ).arrange(RIGHT, buff=0.05)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.12)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))

        # 绘制 λ = h/(mv) 曲线（双对数下为直线，斜率 -1）
        # log10(λ) = log10(h/V_FIXED) - log10(m)
        log_hv = math.log10(H / V_FIXED)  # ≈ -37.18

        curve = axes.plot(
            lambda log_m: log_hv - log_m,
            x_range=[-30, 0],
            color=YELLOW,
            stroke_width=2.5,
        )
        curve_label = VGroup(
            MathTex(r"\lambda = h/(mv)").scale(0.5).set_color(YELLOW),
            Text(f"v = {V_FIXED:.0e} m/s 固定", font=CJK).scale(0.34),
        ).arrange(RIGHT, buff=0.25)
        curve_label.next_to(axes, UP, buff=0.05).shift(RIGHT * 1.5)

        self.play(Create(curve), run_time=1.8)
        self.play(FadeIn(curve_label))
        self.wait(0.8)

        # ── 参照点标注 ──
        ref_objects = {}

        def add_ref(log_m: float, name_zh: str, color_: str):
            log_lam = log_hv - log_m
            dot = Dot(axes.c2p(log_m, log_lam), color=color_, radius=0.09)
            label = Text(name_zh, font=CJK, color=color_).scale(0.34)
            label.next_to(dot, UP, buff=0.12)
            ref_objects[name_zh] = VGroup(dot, label)
            return VGroup(dot, label)

        refs = [
            (-30.0, "电子", GREEN),
            (-27.3, "质子", CYAN),
            (-26.7, "α粒子", ORANGE),
            (-3.0,  "棒球", RED),
            (24.8,  "地球", YELLOW),  # 地球质量 ~6e24 kg，超出坐标范围但演示用
        ]

        # 地球超出 x_range，跳过绘制坐标点，只展示文字说明
        anim_list = []
        visible_refs = []
        for log_m, name, col in refs:
            if -31 <= log_m <= 1:
                grp = add_ref(log_m, name, col)
                anim_list.append(FadeIn(grp))
                visible_refs.append(grp)

        self.play(*anim_list)
        self.wait(1.0)

        # 地球注释（超出坐标范围）
        earth_note = Text("地球(6×10²⁴ kg)：λ 远远小于普朗克尺度", font=CJK, color=YELLOW).scale(0.36)
        earth_note.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(earth_note))
        self.wait(1.2)

        # ── 可观测区间标注 ──
        # 原子尺度 λ ~ 1e-10 m → log10 λ = -10
        obs_y = -10
        obs_line = DashedLine(
            axes.c2p(-31, obs_y), axes.c2p(1, obs_y),
            color=GREEN, stroke_width=1.5, dash_length=0.15,
        )
        obs_label = Text("原子尺度 λ ≈ 10⁻¹⁰ m（可观测区）", font=CJK, color=GREEN).scale(0.35)
        obs_label.next_to(axes.c2p(-31, obs_y), RIGHT, buff=0.15).shift(UP * 0.18)

        # 普朗克长度 λ ~ 1.6e-35 → log10 ≈ -34.8
        pl_y = -34.8
        pl_line = DashedLine(
            axes.c2p(-31, pl_y), axes.c2p(1, pl_y),
            color=RED, stroke_width=1.5, dash_length=0.15,
        )
        pl_label = Text("普朗克尺度 λ ≈ 10⁻³⁵ m（波动性彻底不可测）", font=CJK, color=RED).scale(0.33)
        pl_label.next_to(axes.c2p(-31, pl_y), RIGHT, buff=0.12).shift(DOWN * 0.22)

        self.play(Create(obs_line), FadeIn(obs_label))
        self.wait(0.8)
        self.play(Create(pl_line), FadeIn(pl_label))
        self.wait(1.5)

        # 清场
        fadeout_all = VGroup(
            axes, x_label, y_label, curve, curve_label,
            obs_line, obs_label, pl_line, pl_label,
            earth_note, act2_title,
            *visible_refs,
        )
        self.play(FadeOut(fadeout_all))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 6: 数值例子——两步对比计算
        # ══════════════════════════════════════════════════════════════════
        eg_title = Text("数值对比", font=CJK, color=BLUE).scale(0.48)
        eg_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(eg_title))

        # 子弹
        b_head = Text("子弹 (m = 0.01 kg,  v = 200 m/s)", font=CJK, color=ORANGE).scale(0.42)
        lam_b = H / (M_BULLET * 200)
        b_eq = MathTex(
            rf"\lambda = \frac{{6.626\times10^{{-34}}}}{{0.01\times200}}"
            rf"= {lam_b:.2e}\,\text{{m}}"
        ).scale(0.6).set_color(ORANGE)
        b_remark = Text("远小于原子核 → 波动性完全不可观测", font=CJK, color=RED).scale(0.38)
        b_group = VGroup(b_head, b_eq, b_remark).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        b_group.next_to(eg_title, DOWN, buff=0.38).to_edge(LEFT, buff=0.7)

        self.play(FadeIn(b_head))
        self.play(Write(b_eq))
        self.play(FadeIn(b_remark))
        self.wait(1.4)

        # 电子（v = 1e6 m/s）
        e_head = Text("电子 (m = 9.1×10⁻³¹ kg,  v = 10⁶ m/s)", font=CJK, color=GREEN).scale(0.42)
        lam_e = H / (M_ELECTRON * 1e6)
        e_eq = MathTex(
            rf"\lambda = \frac{{6.626\times10^{{-34}}}}{{9.1\times10^{{-31}}\times10^6}}"
            rf"\approx {lam_e:.2e}\,\text{{m}}"
        ).scale(0.6).set_color(GREEN)
        e_remark = Text("~原子直径量级 → 干涉、衍射可直接观测！", font=CJK, color=GREEN).scale(0.38)
        e_group = VGroup(e_head, e_eq, e_remark).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        e_group.next_to(b_group, DOWN, buff=0.38)

        self.play(FadeIn(e_head))
        self.play(Write(e_eq))
        self.play(FadeIn(e_remark))
        self.wait(2.0)

        self.play(FadeOut(VGroup(eg_title, b_group, e_group)))
        self.wait(0.3)

        # ══════════════════════════════════════════════════════════════════
        # Step 7: 小结卡
        # ══════════════════════════════════════════════════════════════════
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.52)
        s_title.next_to(title, DOWN, buff=0.42)
        self.play(FadeIn(s_title))

        s1 = MathTex(
            r"\lambda = \frac{h}{p} = \frac{h}{mv}",
            color=YELLOW,
        ).scale(0.82)
        s2 = MathTex(
            r"\lambda = \frac{h}{\sqrt{2mE_k}}",
            color=CYAN,
        ).scale(0.82)

        s3_txt = Text("m 越大，λ 越小；v 越大，λ 越小", font=CJK, color=WHITE).scale(0.42)
        s4_txt = Text("宏观物体 λ 极小 → 波动性彻底不可观测", font=CJK, color=RED).scale(0.42)
        s5_txt = Text("微观粒子 λ 在原子尺度 → 量子波动性显著", font=CJK, color=GREEN).scale(0.42)

        summary = VGroup(s1, s2, s3_txt, s4_txt, s5_txt).arrange(DOWN, buff=0.30)
        summary.next_to(s_title, DOWN, buff=0.38)
        summary.scale_to_fit_width(12.0)

        box = SurroundingRectangle(summary, color=BLUE, buff=0.3, corner_radius=0.15)

        self.play(Write(s1))
        self.wait(0.5)
        self.play(Write(s2))
        self.wait(0.5)
        self.play(FadeIn(s3_txt))
        self.play(FadeIn(s4_txt))
        self.play(FadeIn(s5_txt))
        self.play(Create(box))
        self.wait(2.5)

        self.play(FadeOut(VGroup(s_title, summary, box, title, eq1)))
        self.wait(0.4)


REGISTER = [
    {
        "scene": "Ch12Kp2DeBroglieWavelengthDependence",
        "id": "phys-ch12-12.3-kp2-de-broglie-wavelength-dependence",
        "chapterId": "ch12",
        "sectionId": "12.3",
        "title": "德布罗意波长的质量与速度依赖",
        "description": "双栏宏观/微观对比+ValueTracker速度扫动演示λ=h/mv随m和v的变化，双对数λ-m曲线直观呈现量子波动性在宏观极限的消失。",
    },
]
