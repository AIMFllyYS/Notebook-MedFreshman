"""第 4.1 节 · 平面简谐波（金标准范本：函数图像 Axes.plot + ValueTracker 时间扫动）。

物理动画两大范式之二：用坐标系绘制 y(x,t)=A cos(kx-ωt)，
用 ValueTracker(t) + always_redraw 让波形随时间向右传播，
并用一个质点 Dot 展示「介质质点只上下振动、波形向前传播」的核心直觉。

铁律：MathTex 内只能是纯 ASCII LaTeX（无中文/全角标点）；中文一律 Text(font=CJK)。
"""
from manim import *
import math

CYAN = "#00FFFF"
CJK = "Microsoft YaHei"


class Ch04Kp1PlaneWave(Scene):
    def construct(self):
        # ── Step 1: 标题 ────────────────────────────────────────────────
        title = Text("平面简谐波：振动在空间的传播", font=CJK, color=BLUE).scale(0.64).to_edge(UP)
        subtitle = Text("第四章 机械波 · 4.1", font=CJK, color=WHITE).scale(0.4)
        subtitle.next_to(title, DOWN, buff=0.18)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.2)
        self.play(FadeOut(subtitle))

        # ── Step 2: 生活类比 ────────────────────────────────────────────
        analogy = Text("抖动绳子一端，凸起会沿绳子向前跑——", font=CJK).scale(0.5)
        analogy2 = Text("但绳上每一点其实只在原地上下振动，向前跑的是「波形」。",
                        font=CJK).scale(0.5)
        ana = VGroup(analogy, analogy2).arrange(DOWN, buff=0.25).next_to(title, DOWN, buff=0.7)
        self.play(FadeIn(analogy))
        self.wait(0.8)
        self.play(FadeIn(analogy2))
        self.wait(1.5)
        self.play(FadeOut(ana))

        # ── Step 3: 波函数定义（逐步）──────────────────────────────────
        wave_eq = MathTex(r"y(x,t)", r"=", r"A\cos(", r"kx", r"-", r"\omega t", r")").scale(0.9)
        wave_eq.next_to(title, DOWN, buff=0.55)
        wave_eq[3].set_color(YELLOW)
        wave_eq[5].set_color(ORANGE)
        self.play(Write(wave_eq))
        self.wait(0.6)
        legend = VGroup(
            Text("A 振幅", font=CJK).scale(0.4),
            Text("k 波数 = 2π/λ", font=CJK, color=YELLOW).scale(0.4),
            Text("ω 角频率 = 2π/T", font=CJK, color=ORANGE).scale(0.4),
        ).arrange(RIGHT, buff=0.6).next_to(wave_eq, DOWN, buff=0.3)
        self.play(FadeIn(legend))
        self.wait(1.4)
        self.play(FadeOut(legend))

        # ── Step 4: 坐标系 + 波形 + 时间扫动 ────────────────────────────
        A, k, omega = 1.0, 1.0, 1.6
        axes = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.6, 1.6, 1],
            x_length=11,
            y_length=2.8,
            axis_config={"color": BLUE, "include_tip": True},
        ).shift(DOWN * 0.6)
        x_lbl = MathTex(r"x").scale(0.6).next_to(axes.x_axis.get_end(), DOWN, buff=0.15)
        y_lbl = MathTex(r"y").scale(0.6).next_to(axes.y_axis.get_end(), LEFT, buff=0.15)
        self.play(Create(axes), FadeIn(x_lbl), FadeIn(y_lbl))

        t = ValueTracker(0.0)
        wave = always_redraw(
            lambda: axes.plot(
                lambda x: A * math.cos(k * x - omega * t.get_value()),
                x_range=[0, 4 * PI],
                color=YELLOW,
            )
        )
        self.play(Create(wave))

        # 固定位置的质点：只上下振动
        x0 = PI
        particle = always_redraw(
            lambda: Dot(
                axes.c2p(x0, A * math.cos(k * x0 - omega * t.get_value())),
                color=RED,
                radius=0.10,
            )
        )
        track = DashedLine(axes.c2p(x0, -1.5), axes.c2p(x0, 1.5), color=CYAN, stroke_width=2)
        cap = Text("红点只上下振动，黄色波形向右传播", font=CJK, color=GREEN).scale(0.45)
        cap.to_edge(DOWN, buff=0.55)
        self.play(Create(track), FadeIn(particle), FadeIn(cap))
        self.wait(0.5)
        self.play(t.animate.set_value(2 * PI / omega * 2.0), run_time=5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(VGroup(track, particle, cap)))

        # ── Step 5: 关键关系（波速）──────────────────────────────────────
        rel = MathTex(r"v", r"=", r"\frac{\omega}{k}", r"=", r"\lambda f").scale(0.95)
        rel.next_to(axes, DOWN, buff=0.5)
        rel[2].set_color(YELLOW)
        rel[4].set_color(GREEN)
        rel_zh = Text("波速 = 波形前进的速度（与质点振动速度不同！）",
                      font=CJK, color=GREEN).scale(0.42).next_to(rel, DOWN, buff=0.25)
        self.play(Write(rel))
        self.play(FadeIn(rel_zh))
        self.wait(1.8)
        self.play(FadeOut(VGroup(rel, rel_zh, wave, axes, x_lbl, y_lbl)))

        # ── Step 6: 小结卡 ─────────────────────────────────────────────
        s_title = Text("本节小结", font=CJK, color=BLUE).scale(0.55).next_to(title, DOWN, buff=0.5)
        s1 = MathTex(r"y(x,t)=A\cos(kx-\omega t)", color=YELLOW).scale(0.8)
        s2 = MathTex(r"v=\frac{\omega}{k}=\lambda f", color=YELLOW).scale(0.8)
        s3 = Text("波传播的是能量与相位，介质质点只在平衡位置附近振动",
                  font=CJK, color=GREEN).scale(0.42)
        s = VGroup(s1, s2, s3).arrange(DOWN, buff=0.4).next_to(s_title, DOWN, buff=0.45)
        box = SurroundingRectangle(s, color=BLUE, buff=0.35, corner_radius=0.15)
        self.play(FadeIn(s_title))
        self.play(Write(s1), Write(s2))
        self.play(FadeIn(s3), Create(box))
        self.wait(2.0)
        self.play(FadeOut(VGroup(s_title, s, box, title)))
        self.wait(0.3)


REGISTER = [
    {
        "scene": "Ch04Kp1PlaneWave",
        "id": "phys-ch04-4.1-kp1-plane-wave",
        "chapterId": "ch04",
        "sectionId": "4.1",
        "title": "平面简谐波：振动在空间的传播",
        "description": "Axes 绘制 y=Acos(kx-ωt)，ValueTracker 时间扫动让波形传播，红点演示质点只上下振动。",
    },
]
