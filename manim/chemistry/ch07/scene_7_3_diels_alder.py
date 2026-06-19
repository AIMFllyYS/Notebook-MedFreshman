import numpy as np
from manim import *


class DielsAlderScene(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = Text("Diels-Alder 环加成", font="Microsoft YaHei", font_size=34)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title))
        self.wait(0.5)

        # ============================================================
        # ① 左侧：s-顺式 1,3-丁二烯（两个双键的折线）
        #    右侧：乙烯（亲双烯体）
        # ============================================================

        # ---- 1,3-丁二烯骨架（s-顺式，U 形折线，4 个碳）----
        # 用顶点坐标构造一个开口向右的 U 形
        b1 = np.array([-5.2, 0.9, 0.0])   # C1
        b2 = np.array([-5.8, -0.2, 0.0])  # C2
        b3 = np.array([-5.0, -1.1, 0.0])  # C3 (这里改为对称布局)
        # 重新用更规整的对称 s-顺式布局
        b1 = np.array([-4.0, 1.1, 0.0])   # C1 (上端，含双键端)
        b2 = np.array([-5.0, 0.4, 0.0])   # C2
        b3 = np.array([-5.0, -0.8, 0.0])  # C3
        b4 = np.array([-4.0, -1.5, 0.0])  # C4 (下端，含双键端)

        # 主骨架单键线
        diene_bond_12 = Line(b1, b2, color=WHITE, stroke_width=4)
        diene_bond_23 = Line(b2, b3, color=WHITE, stroke_width=4)   # 中间单键
        diene_bond_34 = Line(b3, b4, color=WHITE, stroke_width=4)

        # 双键的第二条平行线（C1=C2 和 C3=C4）
        def parallel_line(p, q, shift, color, sw=4):
            d = q - p
            n = np.array([-d[1], d[0], 0.0])
            norm = np.linalg.norm(n)
            n = n / norm * shift
            return Line(p + n, q + n, color=color, stroke_width=sw)

        diene_double_12 = parallel_line(b1, b2, 0.16, YELLOW)   # C1=C2 π键
        diene_double_34 = parallel_line(b3, b4, -0.16, YELLOW)  # C3=C4 π键

        # 碳原子点
        diene_dots = VGroup(
            Dot(b1, color=BLUE_B, radius=0.07),
            Dot(b2, color=BLUE_B, radius=0.07),
            Dot(b3, color=BLUE_B, radius=0.07),
            Dot(b4, color=BLUE_B, radius=0.07),
        )

        diene = VGroup(
            diene_bond_12, diene_bond_23, diene_bond_34,
            diene_double_12, diene_double_34, diene_dots,
        )

        diene_label = Text("1,3-丁二烯（双烯）", font="Microsoft YaHei", font_size=24)
        diene_label.next_to(diene, DOWN, buff=0.35)

        # ---- 乙烯（亲双烯体）C=C ----
        e1 = np.array([4.6, 0.7, 0.0])    # C5
        e2 = np.array([4.6, -1.1, 0.0])   # C6
        ethene_bond = Line(e1, e2, color=WHITE, stroke_width=4)
        ethene_double = parallel_line(e1, e2, 0.16, YELLOW)
        ethene_dots = VGroup(
            Dot(e1, color=GREEN_B, radius=0.07),
            Dot(e2, color=GREEN_B, radius=0.07),
        )
        ethene = VGroup(ethene_bond, ethene_double, ethene_dots)

        ethene_label = Text("乙烯（亲双烯体）", font="Microsoft YaHei", font_size=24)
        ethene_label.next_to(ethene, DOWN, buff=0.35)

        self.play(
            Create(diene_bond_12), Create(diene_bond_23), Create(diene_bond_34),
            Create(diene_double_12), Create(diene_double_34),
            FadeIn(diene_dots),
        )
        self.play(Write(diene_label))
        self.wait(0.3)

        self.play(
            Create(ethene_bond), Create(ethene_double), FadeIn(ethene_dots),
        )
        self.play(Write(ethene_label))
        self.wait(0.6)

        # ============================================================
        # ② 三个 CurvedArrow 表示电子重排
        #    - C1 端 π → 与乙烯 C5 成新 σ 键
        #    - 乙烯 π → 中间成新双键
        #    - C4 端 π → 与乙烯 C6 成新 σ 键
        # ============================================================
        arrow1 = CurvedArrow(
            start_point=b1 + np.array([0.25, 0.15, 0.0]),
            end_point=e1 + np.array([-0.25, 0.15, 0.0]),
            angle=-0.9, color=RED, tip_length=0.2, stroke_width=4,
        )
        arrow2 = CurvedArrow(
            start_point=e1 + np.array([0.0, -0.25, 0.0]),
            end_point=e2 + np.array([0.0, 0.25, 0.0]),
            angle=-1.2, color=ORANGE, tip_length=0.2, stroke_width=4,
        )
        arrow3 = CurvedArrow(
            start_point=b4 + np.array([0.25, -0.15, 0.0]),
            end_point=e2 + np.array([-0.25, -0.15, 0.0]),
            angle=0.9, color=RED, tip_length=0.2, stroke_width=4,
        )

        rearr_label = Text("电子环状重排", font="Microsoft YaHei", font_size=24, color=RED)
        rearr_label.to_edge(DOWN, buff=0.5)

        self.play(Create(arrow1), Create(arrow3))
        self.play(Create(arrow2))
        self.play(FadeIn(rearr_label))
        self.wait(0.8)

        # ============================================================
        # ③ 两分子合拢形成六元环（环己烯）
        # ============================================================
        # 目标六元环：正六边形
        ring_center = np.array([0.0, -0.3, 0.0])
        hexagon = RegularPolygon(n=6, color=WHITE, stroke_width=4)
        hexagon.scale(1.3)
        hexagon.move_to(ring_center)
        # 旋转使其有一条上边水平（便于标双键）
        hexagon.rotate(PI / 6)

        # 把现有所有结构折叠并淡出，Transform 到六元环
        molecules = VGroup(diene, ethene)

        self.play(
            FadeOut(arrow1), FadeOut(arrow2), FadeOut(arrow3),
            FadeOut(rearr_label),
            FadeOut(diene_label), FadeOut(ethene_label),
        )
        self.play(
            Transform(molecules, hexagon, run_time=2.0),
        )
        self.wait(0.4)

        # 取六边形顶点用于标注新键
        verts = hexagon.get_vertices()  # 6 个顶点 (ndarray)

        # 顶点排序：RegularPolygon(n=6) 旋转 PI/6 后，顶点大致分布。
        # 取最上面两顶点之间作为环内双键；最下面两顶点连线为底（两新 σ 键之一）。
        verts_list = [v for v in verts]
        verts_sorted_by_y = sorted(verts_list, key=lambda p: p[1])

        bottom2 = verts_sorted_by_y[:2]   # y 最小的两点
        top2 = verts_sorted_by_y[-2:]     # y 最大的两点

        # ---- 环内双键（顶部一条边）----
        tp, tq = top2[0], top2[1]
        inner_double = parallel_line(tp, tq, -0.18, YELLOW)
        # 防止零长度：若两点过近则跳过，但正六边形不会
        ring_double_dot = VGroup()  # 占位（始终非空内容由下方文字保证，不直接用）

        self.play(Create(inner_double))

        double_label = Text("环内双键", font="Microsoft YaHei", font_size=22, color=YELLOW)
        double_label.next_to(VGroup(*[Dot(tp), Dot(tq)]), UP, buff=0.25)
        self.play(Write(double_label))
        self.wait(0.3)

        # ---- 两条新生成的 σ 键 ----
        # 新 σ 键为连接双烯端碳与亲双烯体碳的两条边，
        # 取底部边以及一条侧边作为示意（高亮为绿色）。
        bp, bq = bottom2[0], bottom2[1]
        new_sigma_1 = Line(bp, bq, color=GREEN, stroke_width=7)

        # 另一条新 σ 键：连接底部某点到其相邻的侧顶点
        # 找到与 bp 在六边形上相邻、且不是 bq 的顶点
        def nearest_other(point, candidates, exclude):
            best = None
            best_d = 1e9
            for c in candidates:
                if any(np.allclose(c, ex) for ex in exclude):
                    continue
                d = np.linalg.norm(c - point)
                if d < best_d:
                    best_d = d
                    best = c
            return best

        side_vertex = nearest_other(bp, verts_list, exclude=[bp, bq])
        new_sigma_2 = Line(bp, side_vertex, color=GREEN, stroke_width=7)

        sigma_label = Text("两条新 σ 键", font="Microsoft YaHei", font_size=22, color=GREEN)
        sigma_label.next_to(new_sigma_1, DOWN, buff=0.3)

        self.play(Create(new_sigma_1), Create(new_sigma_2))
        self.play(Write(sigma_label))
        self.wait(0.3)

        ring_name = Text("环己烯", font="Microsoft YaHei", font_size=26)
        ring_name.move_to(ring_center)
        self.play(FadeIn(ring_name))
        self.wait(0.6)

        # ============================================================
        # ④ 文字总结："[4+2] 环加成" "一步协同"
        # ============================================================
        # 清理标签，集中展示结论
        self.play(
            FadeOut(double_label), FadeOut(sigma_label),
        )

        tag_42 = MathTex(r"[4+2]", font_size=44, color=BLUE_B)
        text_cyclo = Text("环加成", font="Microsoft YaHei", font_size=28)
        line1 = VGroup(tag_42, text_cyclo).arrange(RIGHT, buff=0.3)

        line2 = Text("一步协同", font="Microsoft YaHei", font_size=28, color=ORANGE)

        summary = VGroup(line1, line2).arrange(DOWN, buff=0.35)
        summary.to_edge(DOWN, buff=0.5)

        self.play(Write(line1))
        self.wait(0.3)
        self.play(FadeIn(line2))
        self.wait(2.0)


REGISTER = [{
    "scene": "DielsAlderScene", "id": "ch07-7.3-diels-alder",
    "chapterId": "ch07", "sectionId": "7.3",
    "title": "Diels-Alder 环加成",
    "description": "1,3-丁二烯与乙烯经 [4+2] 协同环加成生成环己烯。",
}]
