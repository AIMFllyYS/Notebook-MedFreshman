import numpy as np
from manim import *


class ChiralityScene(Scene):
    def construct(self):
        # ---- 颜色与标签 ----
        bond_colors = [RED, GREEN, BLUE, YELLOW]
        labels_text = ["a", "b", "c", "d"]

        # ---- 标题 ----
        title = Text("手性分子与镜像", font="Microsoft YaHei", font_size=34)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ---- 构造一个分子的工具函数 ----
        def make_molecule(center, mirror=False):
            """以 center 为手性碳中心，画四个不同方向的键 + 彩色端点 + 标签。
            mirror=True 时左右镜像（x 方向取反，相对 center）。"""
            c_dot = Dot(center, radius=0.12, color=WHITE)
            c_label = Text("C", font="Microsoft YaHei", font_size=24)
            c_label.move_to(center + 0.28 * UP + 0.28 * RIGHT)

            # 四个基团相对中心的方向（四面体投影到平面的四个方向）
            base_dirs = [
                np.array([-0.9, 1.1, 0.0]),   # 左上
                np.array([0.9, 1.1, 0.0]),    # 右上
                np.array([-1.0, -1.0, 0.0]),  # 左下
                np.array([1.0, -1.0, 0.0]),   # 右下
            ]

            group_items = [c_dot, c_label]
            for i, d in enumerate(base_dirs):
                dir_vec = d.copy()
                if mirror:
                    dir_vec[0] = -dir_vec[0]  # 镜像：x 取反
                end = center + dir_vec
                bond = Line(center, end, color=bond_colors[i], stroke_width=6)
                end_dot = Dot(end, radius=0.16, color=bond_colors[i])
                lab = Text(labels_text[i], font="Microsoft YaHei",
                           font_size=26, color=bond_colors[i])
                lab.move_to(end + 0.30 * np.sign(dir_vec) * np.array([1, 1, 0]))
                group_items.extend([bond, end_dot, lab])

            return VGroup(*group_items)

        # ---- ① 左侧分子 ----
        left_center = np.array([-3.4, 0.2, 0.0])
        left_mol = make_molecule(left_center, mirror=False)

        left_caption = Text("原分子", font="Microsoft YaHei", font_size=24)
        left_caption.next_to(left_mol, DOWN, buff=0.3)

        self.play(Create(left_mol), run_time=2.5)
        self.play(FadeIn(left_caption, shift=UP * 0.2))
        self.wait(0.8)

        # ---- 镜面（中间竖直虚线）----
        mirror_line = DashedLine(
            np.array([0.0, 2.6, 0.0]),
            np.array([0.0, -2.6, 0.0]),
            color=GREY_B, stroke_width=3, dash_length=0.18,
        )
        mirror_label = Text("镜面", font="Microsoft YaHei", font_size=22, color=GREY_B)
        mirror_label.next_to(mirror_line, UP, buff=0.15)
        self.play(Create(mirror_line), FadeIn(mirror_label))
        self.wait(0.5)

        # ---- ② 镜像生成右侧分子（左右对称）----
        right_center = np.array([3.4, 0.2, 0.0])
        right_mol = make_molecule(right_center, mirror=True)

        # 从左分子的副本镜像过去，演示对称生成
        mirror_anim_src = left_mol.copy()
        self.play(
            Transform(mirror_anim_src, right_mol),
            run_time=2.5,
        )
        self.wait(0.3)
        # 用真正的 right_mol 接管（移除临时变换对象）
        self.add(right_mol)
        self.remove(mirror_anim_src)

        right_caption = Text("镜像分子", font="Microsoft YaHei", font_size=24)
        right_caption.next_to(right_mol, DOWN, buff=0.3)
        self.play(FadeIn(right_caption, shift=UP * 0.2))
        self.wait(0.8)

        # ---- 文字：对映异构体 ----
        enantiomer_txt = Text("对映异构体", font="Microsoft YaHei",
                              font_size=28, color=TEAL)
        enantiomer_txt.to_edge(DOWN, buff=0.5)
        self.play(Write(enantiomer_txt))
        self.wait(0.8)

        # ---- ③ 尝试旋转右侧分子去与左侧重叠 ----
        try_txt = Text("尝试旋转使其重叠……", font="Microsoft YaHei", font_size=24)
        try_txt.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(try_txt))

        # 取消镜像 caption 干扰，让 right_mol 单独旋转演示
        self.play(FadeOut(right_caption), FadeOut(enantiomer_txt))

        # 围绕自身中心连续旋转，展示无论怎么转都无法和左侧一致
        self.play(Rotate(right_mol, angle=PI, about_point=right_center),
                  run_time=2.0)
        self.wait(0.3)
        self.play(Rotate(right_mol, angle=PI / 2, about_point=right_center),
                  run_time=1.5)
        self.wait(0.3)
        self.play(Rotate(right_mol, angle=-PI / 2 - PI, about_point=right_center),
                  run_time=2.0)
        self.wait(0.3)

        # ---- 结论文字 ----
        fail_txt = Text("无论如何旋转都无法完全重叠", font="Microsoft YaHei",
                        font_size=26, color=RED)
        fail_txt.move_to(try_txt.get_center())
        self.play(Transform(try_txt, fail_txt))
        self.wait(1.0)

        # ---- ④ 核心结论 ----
        self.play(FadeOut(mirror_label))
        chiral_txt = Text("手性", font="Microsoft YaHei", font_size=40, color=ORANGE)
        chiral_txt.move_to(np.array([0.0, 0.6, 0.0]))

        nonsuper_txt = Text("与镜像不可重叠", font="Microsoft YaHei",
                            font_size=28, color=YELLOW)
        nonsuper_txt.move_to(np.array([0.0, -0.2, 0.0]))

        hands_txt = Text("如左右手", font="Microsoft YaHei", font_size=28, color=TEAL)
        hands_txt.move_to(np.array([0.0, -0.9, 0.0]))

        self.play(Write(chiral_txt))
        self.wait(0.4)
        self.play(FadeIn(nonsuper_txt, shift=UP * 0.2))
        self.wait(0.4)
        self.play(FadeIn(hands_txt, shift=UP * 0.2))
        self.wait(2.0)


REGISTER = [{
    "scene": "ChiralityScene", "id": "ch09-9.1-chirality",
    "chapterId": "ch09", "sectionId": "9.1",
    "title": "手性分子与镜像",
    "description": "手性碳与其镜像不可重叠，构成一对对映异构体。",
}]
