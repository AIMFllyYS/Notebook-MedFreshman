"""Build textbook.toc.json from OCR page texts for 季一兵《仪器分析》."""
from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
RAW = REPO / "content" / "_raw" / "instrumental-analysis"
PAGES = RAW / "ocr-pages"

CHAPTER_TITLES = {
    1: "第1章　绪论",
    2: "第2章　电位分析法和永停滴定法",
    3: "第3章　光学分析法概论",
    4: "第4章　紫外-可见分光光度法",
    5: "第5章　分子荧光分析法",
    6: "第6章　红外吸收光谱法",
    7: "第7章　原子吸收分光光度法",
    8: "第8章　核磁共振波谱法",
    9: "第9章　其他光学分析法简介",
    10: "第10章　质谱分析法",
    11: "第11章　色谱分析导论",
    12: "第12章　经典液相色谱法",
    13: "第13章　气相色谱法",
    14: "第14章　高效液相色谱法",
    15: "第15章　高效毛细管电泳法",
}

SECTION_TITLES: dict[tuple[int, int], str] = {
    (1, 1): "化学分析与仪器分析",
    (1, 2): "仪器分析法的类型",
    (1, 3): "仪器分析的发展沿革",
    (2, 1): "电化学分析法概述",
    (2, 2): "电位分析法的基本原理",
    (2, 3): "直接电位法",
    (2, 4): "电位滴定法",
    (2, 5): "永停滴定法",
    (2, 6): "电化学分析新方法简介",
    (3, 1): "概述",
    (3, 2): "电磁辐射的性质",
    (3, 3): "光学分析法的分类",
    (3, 4): "光谱分析仪器",
    (3, 5): "光学分析法的进展简介",
    (4, 1): "紫外-可见分光光度法的基本原理",
    (4, 2): "紫外-可见分光光度计",
    (4, 3): "定性与定量分析方法",
    (5, 1): "概述",
    (5, 2): "分子荧光分析法的基本原理",
    (5, 3): "荧光定量分析方法",
    (5, 4): "荧光分光光度计和荧光分析技术",
    (5, 5): "荧光分析法的应用",
    (6, 1): "概述",
    (6, 2): "基本原理",
    (6, 3): "典型光谱",
    (6, 4): "红外光谱仪及制样",
    (6, 5): "红外吸收光谱解析",
    (7, 1): "概述",
    (7, 2): "基本原理",
    (7, 3): "原子吸收分光光度计",
    (7, 4): "定量分析方法",
    (7, 5): "实验技术",
    (7, 6): "应用与示例",
    (8, 1): "概述",
    (8, 2): "基本原理",
    (8, 3): "化学位移",
    (8, 4): "自旋-自旋耦合",
    (8, 5): "核磁共振波谱仪",
    (8, 6): "核磁共振氢谱的解析方法及其应用",
    (8, 7): "碳-13核磁共振波谱法",
    (9, 1): "电感耦合等离子体质谱法",
    (9, 2): "X射线衍射法",
    (9, 3): "拉曼光谱法",
    (10, 1): "概述",
    (10, 2): "质谱仪",
    (10, 3): "离子类型和裂解规律",
    (10, 4): "典型有机化合物的质谱特点",
    (10, 5): "质谱分析法在有机分子结构解析中的应用",
    (10, 6): "光谱综合解析",
    (11, 1): "概述",
    (11, 2): "色谱过程及基本术语",
    (11, 3): "色谱法基本理论",
    (11, 4): "色谱分析法研究新进展",
    (12, 1): "概述",
    (12, 2): "经典柱色谱法",
    (12, 3): "平面色谱法",
    (13, 1): "概述",
    (13, 2): "气相色谱固定相和流动相",
    (13, 3): "气相色谱检测器",
    (13, 4): "气相色谱分离条件的选择",
    (13, 5): "定性与定量分析",
    (13, 6): "毛细管气相色谱法",
    (13, 7): "气相色谱法应用与示例",
    (14, 1): "概述",
    (14, 2): "高效液相色谱的速率理论和分离条件",
    (14, 3): "高效液相色谱法的主要类型",
    (14, 4): "高效液相色谱法的固定相和流动相",
    (14, 5): "高效液相色谱仪",
    (14, 6): "定性与定量分析方法与应用",
    (14, 7): "高效液相色谱法新技术简介",
    (15, 1): "概述",
    (15, 2): "基本原理",
    (15, 3): "高效毛细管电泳的分离模式",
    (15, 4): "高效毛细管电泳仪",
    (15, 5): "定性和定量分析方法",
    (15, 6): "应用与示例",
}

CH_HEAD = re.compile(r"^第\s*(\d+)\s*章")
APPENDIX = re.compile(r"^附录|^主要参考|^索引")


def section_line_ok(ch: int, sec: int, line: str) -> bool:
    """Match '8.7 碳谱' and glued OCR like '8.713C核磁共振波谱法'."""
    prefix = f"{ch}.{sec}"
    if not line.startswith(prefix):
        return False
    rest = line[len(prefix) :]
    if rest.startswith(".") and rest[1:2].isdigit():
        return False
    if rest[:1].isdigit() and not rest.startswith("13"):
        return False
    title = SECTION_TITLES[(ch, sec)]
    if not rest.strip():
        return True
    if rest.startswith("13"):
        return True
    return title[:2] in rest or rest[:2] in title


def load_pages() -> dict[int, str]:
    out: dict[int, str] = {}
    for path in sorted(PAGES.glob("p*.txt")):
        n = int(path.stem[1:])
        out[n] = path.read_text(encoding="utf-8")
    return out


def first_hits(pages: dict[int, str]) -> tuple[dict[int, int], dict[tuple[int, int], int], int]:
    ch_page: dict[int, int] = {}
    stop_page = max(pages) if pages else 435
    for i in sorted(p for p in pages if p >= 11):
        hit_appendix = False
        for raw in (pages[i] or "").splitlines():
            line = raw.strip().replace("　", "")
            if APPENDIX.match(line) and i > 200 and 15 in ch_page:
                stop_page = min(stop_page, i)
                hit_appendix = True
                break
            m = CH_HEAD.match(line)
            if m:
                n = int(m.group(1))
                if 1 <= n <= 15 and n not in ch_page:
                    ch_page[n] = i
        if hit_appendix:
            break

    sec_page: dict[tuple[int, int], int] = {}
    for n in range(1, 16):
        start = ch_page.get(n)
        if not start:
            continue
        end = ch_page.get(n + 1, stop_page)
        keys = [(ch, sec) for (ch, sec) in SECTION_TITLES if ch == n]
        for i in range(start, end):
            if i not in pages:
                continue
            for raw in pages[i].splitlines():
                line = raw.strip().replace("　", "")
                for ch, sec in keys:
                    if (ch, sec) in sec_page:
                        continue
                    if section_line_ok(ch, sec, line):
                        sec_page[(ch, sec)] = i
    return ch_page, sec_page, stop_page


def build() -> dict:
    pages = load_pages()
    ch_page, sec_page, stop_page = first_hits(pages)
    toc: list[dict] = []
    for n in range(1, 16):
        page = ch_page.get(n)
        if not page:
            continue
        toc.append({"level": 1, "title": CHAPTER_TITLES[n], "page": page})
        secs = [(ch, sec) for (ch, sec) in SECTION_TITLES if ch == n]
        secs.sort()
        prev = page
        for key in secs:
            sp = sec_page.get(key, prev)
            if sp < prev:
                sp = prev
            prev = sp
            title = f"第{key[1]}节　{SECTION_TITLES[key]}"
            toc.append({"level": 2, "title": title, "page": sp})
    return {
        "pages": stop_page - 1 if stop_page > 1 else max(pages),
        "toc": toc,
        "source": "ocr-first-hit+manual-titles",
        "chapter_pages": ch_page,
        "section_pages": {f"{a}.{b}": p for (a, b), p in sorted(sec_page.items())},
        "stop_page": stop_page,
        "ocr_pages_ready": len(pages),
    }


def main() -> None:
    data = build()
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / "textbook.toc.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {path} chapters={sum(1 for e in data['toc'] if e['level']==1)} entries={len(data['toc'])} ocr={data['ocr_pages_ready']}")
    for e in data["toc"]:
        if e["level"] == 1:
            print(f"  {e['page']:4d} {e['title']}")


if __name__ == "__main__":
    main()
