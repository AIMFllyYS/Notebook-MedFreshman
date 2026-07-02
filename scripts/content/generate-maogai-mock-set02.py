# -*- coding: utf-8 -*-
"""Generate cardified maogai mock papers 04-06 from raw split md files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "content" / "_raw" / "maogai" / "exam"
OUT = ROOT / "content" / "maogai" / "kaoqian-moni"

PAPERS = [
    {
        "num": 4,
        "id": "maogai-mock-final-paper-04",
        "title": "毛概2026期末押题模拟卷·基础巩固（第一套）",
    },
    {
        "num": 5,
        "id": "maogai-mock-final-paper-05",
        "title": "毛概2026期末押题模拟卷·中等难度（第二套）",
    },
    {
        "num": 6,
        "id": "maogai-mock-final-paper-06",
        "title": "毛概2026期末押题模拟卷·提高冲刺（第三套）",
    },
]

OPTION_RE = re.compile(r"([A-D])[\.．、]\s*")


def split_options(stem_line: str) -> tuple[str, list[str]]:
    parts = OPTION_RE.split(stem_line)
    if len(parts) < 3:
        return stem_line, []
    q = parts[0].strip()
    opts: list[str] = []
    for i in range(1, len(parts), 2):
        if i + 1 < len(parts):
            opts.append(f"{parts[i]}. {parts[i + 1].strip()}")
    return q, opts


def parse_choice_block(lines: list[str]) -> list[dict]:
    items: list[dict] = []
    i = 0
    while i < len(lines):
        m = re.match(r"^(\d+)\.\s*(.+)$", lines[i])
        if not m:
            i += 1
            continue
        num = int(m.group(1))
        rest = m.group(2)
        opts: list[str] = []
        if OPTION_RE.search(rest):
            stem, opts = split_options(rest)
        else:
            stem = rest
            j = i + 1
            while j < len(lines) and re.match(r"^[A-D][\.．、]", lines[j]):
                opts.append(lines[j].strip())
                j += 1
            i = j - 1
        items.append({"num": num, "stem": stem.strip(), "options": opts})
        i += 1
    return items


def parse_questions(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    # drop header
    while lines and not lines[0].startswith("一、"):
        lines.pop(0)
    single_end = next(i for i, ln in enumerate(lines) if "多项选择" in ln)
    multi_end = next(i for i, ln in enumerate(lines) if "材料分析" in ln)
    singles = parse_choice_block(lines[1:single_end])
    multis = parse_choice_block(lines[single_end + 1 : multi_end])
    mat_lines = lines[multi_end + 1 :]
    materials: list[dict] = []
    cur: dict | None = None
    for ln in mat_lines:
        if ln.startswith("材料分析题"):
            if cur:
                materials.append(cur)
            cur = {"header": ln, "material": [], "questions": []}
        elif ln.startswith("【材料】"):
            if cur is not None:
                cur["material"].append(ln.replace("【材料】", "").strip())
        elif ln.startswith("请回答"):
            continue
        elif re.match(r"^（\d+）", ln):
            if cur is not None:
                cur["questions"].append(ln)
        elif cur is not None and not ln.startswith("【"):
            if cur["questions"]:
                continue
            if ln != "请回答：":
                cur["material"].append(ln)
    if cur:
        materials.append(cur)
    return {"singles": singles, "multis": multis, "materials": materials}


def parse_answers(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    while lines and not lines[0].startswith("一、"):
        lines.pop(0)
    single_end = next(i for i, ln in enumerate(lines) if "多项选择" in ln)
    multi_end = next(i for i, ln in enumerate(lines) if "材料分析" in ln)
    mat_lines = lines[multi_end + 1 :]

    def parse_choice_section(section_lines: list[str]) -> dict[int, dict]:
        choices: dict[int, dict] = {}
        i = 0
        while i < len(section_lines):
            if section_lines[i].startswith("一、") or section_lines[i].startswith("二、"):
                i += 1
                continue
            m = re.match(r"^(\d+)\.\s*(.+)$", section_lines[i])
            if not m:
                i += 1
                continue
            num = int(m.group(1))
            j = i + 1
            while j < len(section_lines) and re.match(r"^[A-D][\.．、]", section_lines[j]):
                j += 1
            answer = ""
            source = ""
            while j < len(section_lines):
                if section_lines[j].startswith("答案"):
                    answer = re.sub(r"^答案[：:]\s*", "", section_lines[j])
                elif section_lines[j].startswith("解析来源"):
                    source = section_lines[j].replace("解析来源：", "").replace("解析来源:", "")
                    j += 1
                    break
                elif re.match(r"^\d+\.", section_lines[j]):
                    break
                j += 1
            choices[num] = {"answer": answer.strip(), "source": source.strip()}
            i = j if j > i else i + 1
        return choices

    single_choices = parse_choice_section(lines[1:single_end])
    multi_choices = parse_choice_section(lines[single_end + 1 : multi_end])

    materials: list[dict] = []
    cur: dict | None = None
    sub_idx = 0
    for ln in mat_lines:
        if ln.startswith("材料分析题"):
            if cur:
                materials.append(cur)
            cur = {"header": ln, "subs": []}
            sub_idx = 0
        elif re.match(r"^（\d+）", ln) and "分）" in ln:
            if cur is not None:
                sub_idx += 1
                cur["subs"].append({"q": ln, "points": []})
        elif ln.startswith("命题来源"):
            if cur is not None:
                cur["source"] = ln.replace("命题来源：", "").replace("命题来源:", "")
        elif cur and cur["subs"] and re.match(r"^\d+\.", ln):
            cur["subs"][-1]["points"].append(ln)
    if cur:
        materials.append(cur)
    return {"singles": single_choices, "multis": multi_choices, "materials": materials}


def fmt_options(opts: list[str]) -> str:
    if not opts:
        return ""
    if len(opts) <= 2:
        return "\n\n".join(opts)
    return "\n\n".join(opts)


def explain_choice(item: dict, ans: dict) -> str:
    answer = ans["answer"]
    source = ans.get("source", "")
    stem = item["stem"]
    lines = [f"**【答案】{answer}**", ""]
    if source:
        lines.append(f"题目来源：{source}")
        lines.append("")
    notes: list[str] = []
    if "六届六中全会" in stem or "论新阶段" in stem:
        notes.append("1938年六届六中全会《论新阶段》首次正式提出「马克思主义中国化」命题，强调按中国特点应用马克思主义。")
    elif "两个结合" in stem or "第二个结合" in stem:
        notes.append("「第一个结合」是马克思主义基本原理同中国具体实际相结合；「第二个结合」是同中华优秀传统文化相结合。")
    elif "萌芽" in stem:
        notes.append("《中国社会各阶级的分析》《湖南农民运动考察报告》标志着毛泽东思想开始萌芽；《实践论》《矛盾论》属成熟时期著作。")
    elif "成熟" in stem and "不包括" in stem:
        notes.append("《反对本本主义》写于土地革命战争时期，属萌芽/形成阶段；A、B、C 均为抗日战争时期走向成熟的代表作。")
    elif "活的灵魂" in stem and "精髓" in stem:
        notes.append("实事求是是马克思主义中国化理论成果精髓，也是毛泽东思想活的灵魂之一。")
    elif "根本工作路线" in stem:
        notes.append("群众路线是党的根本工作路线；独立自主是活的灵魂之一，思想路线核心是实事求是。")
    elif "历史问题的决议" in stem or "功过" in stem:
        notes.append("1981年《决议》评价毛泽东功绩第一位、错误第二位，不能因晚年错误全盘否定其历史功绩。")
    elif "首要对象" in stem:
        notes.append("新民主主义革命首要对象是帝国主义；封建主义、官僚资本主义也是革命对象。")
    elif "自耕农" in stem:
        notes.append("自耕农拥有少量生产资料、自己劳动、少受剥削，属小资产阶级，不是半无产阶级。")
    elif "三大法宝" in stem and "不包括" in stem:
        notes.append("三大法宝是统一战线、武装斗争、党的建设；土地革命是革命内容/手段，不属于「三大法宝」。")
    elif "社会性质" in stem and "1956" in stem:
        notes.append("1949—1956年三大改造完成前，我国处于新民主主义社会，尚未进入社会主义社会。")
    elif "四马分肥" in stem:
        notes.append("初级形式国家资本主义阶段利润分配：国家所得税、企业公积金、工人福利费、资方红利，称「四马分肥」。")
    elif "一化三改" in stem or ("过渡时期总路线" in stem and "概括" in stem):
        notes.append("过渡时期总路线主体是社会主义工业化（一化），两翼是对农业、手工业和资本主义工商业的社会主义改造（三改）。")
    elif "论十大关系" in stem:
        notes.append("1956年《论十大关系》标志着党探索社会主义建设道路的良好开端。")
    elif "科学文化" in stem or "百花齐放" in stem:
        notes.append("处理科学文化领域人民内部矛盾，实行「百花齐放、百家争鸣」方针。")
    elif "十七大" in stem and "理论体系" in stem:
        notes.append("十七大将邓小平理论、三个代表、科学发展观统一概括为中国特色社会主义理论体系。")
    elif "社会主义本质" in stem and "落脚" in stem:
        notes.append("1992年南方谈话：解放生产力、发展生产力，消灭剥削、消除两极分化，最终达到共同富裕；最终落脚点是共同富裕。")
    elif "精髓" in stem and "解放思想" in stem:
        notes.append("邓小平理论精髓是解放思想、实事求是，是改革开放和现代化建设的思想武器。")
    elif "基本路线" in stem or "一个中心" in stem:
        notes.append("十三大基本路线核心：「一个中心、两个基本点」——以经济建设为中心，坚持四项基本原则，坚持改革开放。")
    elif "七大" in stem and "指导思想" in stem:
        notes.append("1945年党的七大把毛泽东思想确立为党的指导思想并写入党章。")
    elif "半封建" in stem:
        notes.append("半封建指出现资本主义生产关系，但封建剥削制度根基依然存在；半殖民地指丧失完全独立地位。")
    elif "农村包围城市" in stem and "最根本" in stem:
        notes.append("中国政治经济发展极不平衡的半殖民地半封建大国国情，决定了必须走农村包围城市、武装夺取政权道路。")
    elif "晋绥干部会议" in stem or ("总路线" in stem and "完整" in stem):
        notes.append("1948年《在晋绥干部会议上的讲话》完整概括新民主主义革命总路线。")
    elif "国体" in stem:
        notes.append("新民主主义共和国国体是各革命阶级联合专政，政体是人民代表大会制度。")
    elif "八大" in stem and "主要矛盾" in stem:
        notes.append("八大指出主要矛盾是人民对于经济文化迅速发展的需要同当前经济文化不能满足人民需要的状况之间的矛盾。")
    elif "手工业" in stem and "改造" in stem:
        notes.append("手工业改造步骤：供销小组→供销合作社→生产合作社（由低级到高级）。")
    elif "人民内部矛盾" in stem:
        notes.append("人民内部矛盾用民主方法，即团结—批评—团结；敌我矛盾用专政方法。")
    elif "两参一改三结合" in stem:
        notes.append("「一改」指改革企业内部不合理的规章制度。")
    elif "两个30年" in stem:
        notes.append("改革开放前后两个时期不能相互否定，前者为后者积累经验，后者是对前者的坚持、改革和发展。")
    elif "时代主题" in stem:
        notes.append("20世纪70年代起时代主题转变为和平与发展。")
    elif "十五大" in stem and "邓小平理论" in stem:
        notes.append("1997年党的十五大把邓小平理论确立为党的指导思想并写入党章。")
    elif "三个有利于" in stem:
        notes.append("「三个有利于」是判断改革和各项工作是非得失的根本标准。")
    elif "一国两制" in stem and "基本国策" in stem:
        notes.append("1985年六届全国人大三次会议将「一国两制」确定为一项基本国策。")
    elif "江八条" in stem:
        notes.append("1995年江泽民对台「八项主张」首要内容是坚持一个中国原则。")
    elif "建党80周年" in stem:
        notes.append("2001年庆祝建党80周年大会上，江泽民全面阐述「三个代表」重要思想科学内涵。")
    elif "科学发展观" in stem and "核心" in stem:
        notes.append("科学发展观：第一要义发展，核心立场以人为本，基本要求全面协调可持续，根本方法统筹兼顾。")
    elif "五个统筹" in stem:
        notes.append("五个统筹不含「统筹党的建设各项工作」；包括城乡、区域、经济社会、人与自然、国内发展和对外开放。")
    elif len(answer) == 1:
        wrong = []
        for opt in item["options"]:
            m = re.match(r"^([A-D])", opt)
            if m and m.group(1) != answer:
                wrong.append(m.group(1))
        notes.append(f"依据教材与课堂重点，{answer} 为正确选项。" + (f" {', '.join(wrong)} 项不符合题意。" if wrong else ""))
    elif len(answer) > 1:
        correct = set(answer)
        wrong = []
        for opt in item["options"]:
            m = re.match(r"^([A-D])", opt)
            if m and m.group(1) not in correct:
                wrong.append(m.group(1))
        notes.append(f"正确选项为 {', '.join(sorted(correct))}。" + (f" {', '.join(wrong)} 项不符合题意。" if wrong else ""))
    lines.extend(notes)
    return "\n".join(lines)


def card_title(stem: str) -> str:
    for kw, title in [
        ("马克思主义中国化", "马克思主义中国化"),
        ("两个结合", "两个结合"),
        ("毛泽东思想", "毛泽东思想"),
        ("新民主主义", "新民主主义革命"),
        ("过渡时期", "过渡时期总路线"),
        ("社会主义改造", "社会主义改造"),
        ("社会主义本质", "社会主义本质论"),
        ("邓小平理论", "邓小平理论"),
        ("三个代表", "三个代表"),
        ("科学发展观", "科学发展观"),
        ("一国两制", "一国两制"),
        ("三大法宝", "三大法宝"),
    ]:
        if kw in stem:
            return title
    return "考点回顾"


def tip_line(stem: str, answer: str) -> str:
    if "六届六中全会" in stem:
        return "1938 · 六届六中全会 · 《论新阶段》= 马克思主义中国化命题正式提出。"
    if "第二个结合" in stem:
        return "两个结合：中国具体实际 + 中华优秀传统文化；第二结合 = 又一次思想解放。"
    if "活的灵魂" in stem and "精髓" in stem:
        return "精髓 = 实事求是；活的灵魂 = 实事求是 + 群众路线 + 独立自主。"
    if "三大法宝" in stem and "不包括" in stem:
        return "三大法宝 = 统一战线 + 武装斗争 + 党的建设（土地革命不在其中）。"
    if "四马分肥" in stem:
        return "初级国家资本主义利润分配 = 四马分肥（国税/公积金/福利/红利）。"
    if "一化三改" in stem:
        return "过渡时期总路线 = 一化（工业化）+ 三改（农业/手工业/工商业）。"
    if "社会主义本质" in stem and "落脚" in stem:
        return "社会主义本质最终落脚点 = 最终达到共同富裕。"
    if "基本路线" in stem:
        return "初级阶段基本路线 = 一个中心 + 两个基本点。"
    if "三个代表" in stem and "核心观点" in stem:
        return "三个代表核心观点 = BCD（先进生产力发展要求/先进文化/人民根本利益）。"
    return f"本题答案：**{answer}**；结合题目来源对照教材原文记忆。"


def render_choice(qnum: int, item: dict, ans: dict, section: str) -> str:
    opts = fmt_options(item["options"])
    body = item["stem"]
    if opts:
        body += "\n\n" + opts
    explain = explain_choice(item, ans)
    title = card_title(item["stem"])
    tip = tip_line(item["stem"], ans["answer"])
    return f"""### 第{qnum}题

:::callout{{kind=note label="题目"}}
{body}
:::

:::callout{{kind=insight label="解析"}}
{explain}
:::

:::callout{{kind=note label="知识卡片：{title}"}}
| 要点 | 内容 |
|------|------|
| **答案** | {ans['answer']} |
| **题目来源** | {ans.get('source') or '教材与课堂重点'} |
| **考查方向** | {section} |
:::

:::callout{{kind=tip label="结论速记"}}
{tip}
:::

---
"""


def render_material(qnum: int, mat: dict, ans_mat: dict) -> str:
    material = "\n> ".join(["> **材料**"] + [f"> {p}" for p in mat["material"]])
    subs = "\n\n".join(mat["questions"])
    body = f"{material}\n\n{subs}"
    points_blocks: list[str] = []
    for sub in ans_mat.get("subs", []):
        points_blocks.append(f"**{sub['q']}**")
        for p in sub["points"]:
            # strip leading number
            pt = re.sub(r"^\d+\.\s*", "", p)
            points_blocks.append(f"- {pt}")
    explain = "**【答案要点】**\n\n" + "\n\n".join(points_blocks)
    if ans_mat.get("source"):
        explain += f"\n\n题目来源：{ans_mat['source']}"
    title = "材料分析"
    if "马克思主义" in " ".join(mat["material"]):
        title = "马克思主义中国化"
    elif "三大法宝" in " ".join(mat["material"]) or "统一战线" in " ".join(mat["material"]):
        title = "三大法宝与革命道路"
    elif "过渡时期" in " ".join(mat["material"]) or "改造" in " ".join(mat["material"]):
        title = "社会主义改造"
    elif "社会主义本质" in " ".join(mat["material"]) or "计划" in " ".join(mat["material"]):
        title = "社会主义本质与市场经济"
    elif "三个代表" in " ".join(mat["material"]):
        title = "三个代表重要思想"
    elif "中华优秀传统文化" in " ".join(mat["material"]):
        title = "第二个结合"
    return f"""### 第{qnum}题

:::callout{{kind=note label="题目"}}
{body}
:::

:::callout{{kind=insight label="解析"}}
{explain}
:::

:::callout{{kind=note label="知识卡片：{title}"}}
| 维度 | 要点 |
|------|------|
| **设问** | {len(mat['questions'])} 个小问，按得分点分条作答 |
| **材料线索** | 紧扣材料关键词联系教材原文 |
| **答题策略** | 先亮观点/概念，再分点展开，最后回扣材料 |
:::

:::callout{{kind=tip label="结论速记"}}
材料题 = 材料关键词 + 教材核心表述 + 分点得分；勿脱离材料空泛作答。
:::

---
"""


def generate(paper: dict) -> str:
    num = paper["num"]
    qpath = RAW / f"mock-paper-{num:02d}-questions.md"
    apath = RAW / f"mock-paper-{num:02d}-answers.md"
    q = parse_questions(qpath)
    a = parse_answers(apath)

    parts = [
        f"# {paper['title']}",
        "",
        "> 考试时间：120 分钟　满分：100 分（单选 20 题 40 分 + 多选 5 题 10 分 + 材料分析 3 题 50 分）",
        "> 考查范围：导论 + 第一至八章（含科学发展观）",
        "",
        "---",
        "",
        "## 一、单项选择题（每题 2 分，共 40 分）",
        "",
    ]
    global_num = 1
    for item in q["singles"]:
        ans = a["singles"].get(item["num"], {"answer": "?", "source": ""})
        parts.append(render_choice(global_num, item, ans, "单项选择"))
        global_num += 1

    parts.extend(["## 二、多项选择题（每题 2 分，共 10 分）", ""])
    for item in q["multis"]:
        ans = a["multis"].get(item["num"], {"answer": "?", "source": ""})
        parts.append(render_choice(global_num, item, ans, "多项选择"))
        global_num += 1

    parts.extend(["## 三、材料分析题（共 50 分）", ""])
    for i, mat in enumerate(q["materials"]):
        ans_mat = a["materials"][i] if i < len(a["materials"]) else {"subs": [], "source": ""}
        parts.append(render_material(global_num, mat, ans_mat))
        global_num += 1

    return "\n".join(parts)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for paper in PAPERS:
        content = generate(paper)
        out_path = OUT / f"{paper['id']}.md"
        out_path.write_text(content, encoding="utf-8")
        count = content.count("### 第")
        print(f"Wrote {out_path.name}: {count} questions")


if __name__ == "__main__":
    main()
