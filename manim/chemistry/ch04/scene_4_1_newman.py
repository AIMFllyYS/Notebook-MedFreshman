import numpy as np
from manim import *


class EthaneNewmanScene(Scene):
    def construct(self):
        # ---------------------------------------------------------------
        # Title
        # ---------------------------------------------------------------
        title = Text(
            "乙烷构象与纽曼投影能量",
            font="Microsoft YaHei",
            font_size=34,
        ).to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.5)

        # ---------------------------------------------------------------
        # Energy curve (right side)
        #   V(theta) = (E_barrier / 2) * (1 + cos(3 * theta))
        #   maxima (eclipsed) at 0, 120, 240, 360 ; minima (staggered) at 60,180,300
        # ---------------------------------------------------------------
        E_barrier = 12.0  # kJ/mol

        axes = Axes(
            x_range=[0, 360, 60],
            y_range=[0, 14, 4],
            x_length=5.2,
            y_length=3.0,
            axis_config={"include_tip": True, "stroke_width": 2},
            x_axis_config={"numbers_to_include": [0, 60, 120, 180, 240, 300, 360]},
            y_axis_config={"numbers_to_include": [0, 4, 8, 12]},
        )
        axes.to_edge(RIGHT, buff=0.6).shift(DOWN * 0.4)

        def energy(theta_deg):
            # theta in degrees -> relative energy in kJ/mol
            return (E_barrier / 2.0) * (1.0 + np.cos(3.0 * theta_deg * DEGREES))

        curve = axes.plot(energy, x_range=[0, 360], color=YELLOW, stroke_width=3)

        x_label = Text(
            "二面角",
            font="Microsoft YaHei",
            font_size=20,
        ).next_to(axes.x_axis, DOWN, buff=0.15).shift(RIGHT * 1.6)
        x_unit = MathTex(r"(^\circ)", font_size=24).next_to(x_label, RIGHT, buff=0.1)

        y_label = Text(
            "相对能量",
            font="Microsoft YaHei",
            font_size=20,
        ).next_to(axes.y_axis, UP, buff=0.15)
        y_unit = Text(
            "kJ/mol",
            font="Microsoft YaHei",
            font_size=16,
        ).next_to(y_label, DOWN, buff=0.05)

        self.play(Create(axes), run_time=1.2)
        self.play(
            Write(x_label),
            Write(x_unit),
            Write(y_label),
            FadeIn(y_unit),
        )
        self.play(Create(curve), run_time=1.5)

        # barrier annotation on the curve
        barrier_label = MathTex(
            r"E_{\text{barrier}} \approx 12\ \text{kJ/mol}",
            font_size=22,
        )
        # (use ASCII-safe TeX: avoid \text with cjk; this is pure ascii so OK)
        barrier_label.next_to(axes.c2p(120, 12), UP, buff=0.1).scale(0.9)
        self.play(FadeIn(barrier_label, shift=UP * 0.2))
        self.wait(0.5)

        # ---------------------------------------------------------------
        # Newman projection (left side)
        # ---------------------------------------------------------------
        newman_center = LEFT * 3.6 + DOWN * 0.4
        radius = 1.4

        # back atom: big circle (the rear carbon, seen as a disk)
        back_circle = Circle(
            radius=radius,
            color=BLUE_D,
            fill_color=BLUE_E,
            fill_opacity=0.25,
            stroke_width=3,
        ).move_to(newman_center)

        # front atom: a small dot at the center (front carbon)
        front_dot = Dot(point=newman_center, radius=0.10, color=WHITE)

        # ---- Front bonds: a Y shape (three lines from the center, length = radius) ----
        # angles for front bonds: 90, 210, 330 degrees
        front_angles = [90, 210, 330]
        front_bonds = VGroup()
        for ang in front_angles:
            end = newman_center + radius * np.array(
                [np.cos(ang * DEGREES), np.sin(ang * DEGREES), 0.0]
            )
            line = Line(newman_center, end, color=WHITE, stroke_width=6)
            front_bonds.add(line)

        # ---- Back bonds: inverted-Y, drawn from the rim inward; rotatable group ----
        # Start eclipsed-offset: place back bonds initially staggered (offset 60 deg)
        # We'll rotate this group with a ValueTracker.
        back_base_angles = [30, 150, 270]  # staggered relative to front (60 apart)

        rot_tracker = ValueTracker(0.0)  # extra rotation in degrees applied to back

        def make_back_bonds():
            phi = rot_tracker.get_value()
            grp = VGroup()
            for ang in back_base_angles:
                a = (ang + phi) * DEGREES
                outer = newman_center + radius * np.array(
                    [np.cos(a), np.sin(a), 0.0]
                )
                # back bonds go from rim toward center but stop a bit short
                inner = newman_center + 0.30 * np.array(
                    [np.cos(a), np.sin(a), 0.0]
                )
                line = Line(inner, outer, color=GREEN_C, stroke_width=6)
                grp.add(line)
            return grp

        back_bonds = always_redraw(make_back_bonds)

        # legend for front/back
        front_legend = Text(
            "前碳(白)",
            font="Microsoft YaHei",
            font_size=18,
            color=WHITE,
        )
        back_legend = Text(
            "后碳(绿)",
            font="Microsoft YaHei",
            font_size=18,
            color=GREEN_C,
        )
        legend = VGroup(front_legend, back_legend).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        legend.next_to(back_circle, DOWN, buff=0.35)

        self.play(
            Create(back_circle),
            FadeIn(front_dot),
        )
        self.play(Create(front_bonds), run_time=1.0)
        self.play(Create(back_bonds), run_time=1.0)
        self.play(FadeIn(legend))
        self.wait(0.5)

        # ---------------------------------------------------------------
        # Moving marker dot on the energy curve, tracking the dihedral angle.
        # When back bonds are staggered (offset 60 from front), the dihedral
        # angle between bonds is 60 deg -> staggered = energy minimum.
        # Define dihedral = 60 - phi initially? Simpler: map the marker x to
        # the current relative dihedral so that staggered sits in a valley.
        # We sweep phi from 0 -> 360. The instantaneous dihedral that controls
        # energy is theta = (60 + phi) so staggered(phi=0)->theta=60 (valley).
        # ---------------------------------------------------------------
        def marker_theta():
            return (60.0 + rot_tracker.get_value()) % 360.0

        marker = always_redraw(
            lambda: Dot(
                axes.c2p(marker_theta(), energy(marker_theta())),
                color=RED,
                radius=0.09,
            )
        )

        # vertical guide line from x-axis to marker
        marker_guide = always_redraw(
            lambda: axes.get_vertical_line(
                axes.c2p(marker_theta(), energy(marker_theta())),
                color=RED,
                stroke_width=2,
            )
        )

        self.play(FadeIn(marker), FadeIn(marker_guide))

        # ---------------------------------------------------------------
        # State labels (staggered / eclipsed)
        # ---------------------------------------------------------------
        state_label = Text(
            "交叉式(稳定)",
            font="Microsoft YaHei",
            font_size=26,
            color=GREEN_B,
        ).next_to(title, DOWN, buff=0.2).shift(LEFT * 3.4)

        self.play(FadeIn(state_label, shift=DOWN * 0.2))
        self.wait(0.8)

        # ---------------------------------------------------------------
        # Animation 1: rotate from staggered (phi=0, theta=60 valley)
        # to eclipsed (phi=60, theta=120 peak)
        # ---------------------------------------------------------------
        eclipsed_label = Text(
            "重叠式(高能)",
            font="Microsoft YaHei",
            font_size=26,
            color=RED_B,
        ).move_to(state_label)

        self.play(
            rot_tracker.animate.set_value(60.0),
            run_time=3.0,
            rate_func=smooth,
        )
        self.play(
            FadeOut(state_label, shift=UP * 0.2),
            FadeIn(eclipsed_label, shift=UP * 0.2),
        )
        self.wait(0.8)

        # ---------------------------------------------------------------
        # Animation 2: continue rotating to next staggered (phi=120, theta=180 valley)
        # ---------------------------------------------------------------
        staggered_label2 = Text(
            "交叉式(稳定)",
            font="Microsoft YaHei",
            font_size=26,
            color=GREEN_B,
        ).move_to(state_label)

        self.play(
            rot_tracker.animate.set_value(120.0),
            run_time=3.0,
            rate_func=smooth,
        )
        self.play(
            FadeOut(eclipsed_label, shift=UP * 0.2),
            FadeIn(staggered_label2, shift=UP * 0.2),
        )
        self.wait(0.8)

        # ---------------------------------------------------------------
        # Animation 3: full continued rotation through the rest of the cycle
        # (phi 120 -> 300) showing repeating peaks and valleys.
        # ---------------------------------------------------------------
        cycling_label = Text(
            "绕 C-C 键持续旋转",
            font="Microsoft YaHei",
            font_size=24,
            color=YELLOW,
        ).move_to(state_label)

        self.play(
            FadeOut(staggered_label2, shift=UP * 0.2),
            FadeIn(cycling_label, shift=UP * 0.2),
        )
        self.play(
            rot_tracker.animate.set_value(300.0),
            run_time=4.0,
            rate_func=linear,
        )
        self.wait(0.5)

        # settle back to a staggered minimum for a clean ending
        self.play(
            rot_tracker.animate.set_value(360.0),
            run_time=1.5,
            rate_func=smooth,
        )

        final_label = Text(
            "交叉式能量最低,最稳定",
            font="Microsoft YaHei",
            font_size=24,
            color=GREEN_B,
        ).move_to(state_label)
        self.play(
            FadeOut(cycling_label, shift=UP * 0.2),
            FadeIn(final_label, shift=UP * 0.2),
        )
        self.wait(2.0)


REGISTER = [{
    "scene": "EthaneNewmanScene",
    "id": "ch04-4.1-newman",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "乙烷构象与纽曼投影能量",
    "description": "旋转乙烷观察纽曼投影从交叉式到重叠式，对照势能曲线。",
}]
