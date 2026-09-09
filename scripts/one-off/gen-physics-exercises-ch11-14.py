#!/usr/bin/env python3
"""Parse physics study-guide markdown (ch11-14) and emit example files."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "content" / "_raw" / "physics" / "study-guide"

FILES = {
    11: "11-大学物理学习指导-第十一章-波动光学.md",
    12: "12-大学物理学习指导-第十二章-量子物理基础.md",
    13: "13-大学物理学习指导-第十三章-原子核和放射性.md",
    14: "14-大学物理学习指导-第十四章-X射线激光及医学应用.md",
}

# Override section by problem id when keyword rules fail
SECTION_OVERRIDE: dict[str, str] = {
    "12-2": "12.1", "12-3": "12.1", "12-4": "12.1", "12-5": "12.1",
    "12-3-ex": "12.3",  # harmonic oscillator example 12-3
    "13-1": "13.1",
}

# (section, slug, label) for 典型例题
EXAMPLE_META: dict[str, tuple[str, str, str]] = {
    "11-1": ("11.1", "双缝明暗纹距离", "双缝明暗纹距离"),
    "11-2": ("11.1", "薄膜最小厚度", "薄膜最小厚度"),
    "11-3": ("11.2", "光栅常数缺级", "光栅常数缺级"),
    "11-4": ("11.3", "偏振片透射光强", "偏振片透射光强"),
    "12-1": ("12.2", "氢原子电离能", "氢原子电离能"),
    "12-2": ("12.1", "康普顿散射", "康普顿散射"),
    "12-3": ("12.3", "谐振子量子数", "谐振子量子数"),
    "12-4": ("12.1", "推导斯特藩定律", "推导斯特藩定律"),
    "12-5": ("12.1", "推导维恩定律", "推导维恩定律"),
    "12-6": ("12.1", "估算恒星半径", "估算恒星半径"),
    "12-7": ("12.3", "光子位置不确定", "光子位置不确定"),
    "13-1": ("13.1", "O16衰变讨论", "O16衰变讨论"),
    "13-2": ("13.2", "Fe59有效半衰期", "Fe59有效半衰期"),
    "13-3": ("13.2", "Na24血容量", "Na24血容量"),
    "13-4": ("13.2", "碳14测年", "碳14测年"),
    "13-5": ("13.2", "Co60吸收剂量", "Co60吸收剂量"),
    "14-1": ("14.1", "X射线最高频率", "X射线最高频率"),
    "14-2": ("14.1", "X射线衰减厚度", "X射线衰减厚度"),
    "14-3": ("14.1", "质量衰减透射", "质量衰减透射"),
    "14-4": ("14.1", "布拉格反射波长", "布拉格反射波长"),
    "14-5": ("14.1", "手部拍片管电压", "手部拍片管电压"),
    "14-6": ("14.2", "三能级激光器", "三能级激光器"),
}

SECTION_RULES: dict[int, list[tuple[str, str]]] = {
    11: [
        ("11.3", r"偏振|马吕斯|布儒斯特|旋光|检偏|起偏|二向色"),
        ("11.2", r"衍射|光栅|单缝|艾里|缺级|半波带|夫琅禾费|圆孔|分辨"),
        ("11.1", r"干涉|双缝|薄膜|劈尖|牛顿环|光程|相干|杨氏"),
    ],
    12: [
        ("12.4", r"波函数|量子数|泡利|薛定谔|归一化|概率密度|电子壳层|磁量子|自旋|振幅同时增加"),
        ("12.3", r"德布罗意|不确定|物质波|谐振子|显像管|α粒子.*波长|动量之比"),
        ("12.2", r"氢原子|玻尔|巴尔末|巴耳末|电离能|谱线|里德伯|能级|角动量.*轨道|三条谱线"),
        ("12.1", r"黑体|普朗克|光电|康普顿|维恩|斯特藩|光子|辐出|恒星|太阳.*辐射|北极星|天狼星|视网膜|蓝绿|铯|红限"),
    ],
    13: [
        ("13.2", r"β|衰变.*位移|Ra|放射性同位素|平均寿命|PET|吸收剂量|计数率|半衰期|活度|居里|Bq|示踪|血液|甲状腺|Co|防护|半价层|有效半衰|生物半衰|扫描|注射|射线数|闪烁|Ci\b"),
        ("13.1", r"结合能|质量亏损|核反应|同位素|比结合|氘|氦核|聚变|氢分子|两个.*氢|O.*C.*He"),
    ],
    14: [
        ("14.2", r"激光|受激|自发辐射|粒子数反转|谐振腔|三能级|亚稳|激活介质|光泵|激励过程|光学谐振"),
        ("14.1", r"X射线|X 射线|韧致|标识|管电压|管电流|衰减|半价层|布拉格|晶体|铅|铝.*防护|CT|透视|摄影|硬化|毫安|千伏"),
    ],
}

DEFAULT_SECTION = {11: "11.1", 12: "12.1", 13: "13.1", 14: "14.1"}

# Manual answers for typical examples
ANSWER_OVERRIDE: dict[str, str] = {
    "11-1": "第三级明纹 $3.0\\,\\mathrm{mm}$，第三级暗纹 $2.5\\,\\mathrm{mm}$",
    "11-2": "(1) $97.4\\,\\mathrm{nm}$；(2) $195\\,\\mathrm{nm}$",
    "11-3": "(1) $d=3\\,\\mu\\mathrm{m}$；(2) $a=0.75\\,\\mu\\mathrm{m}$；(3) 9 条谱线",
    "11-4": "$I = I_0/16$",
    "12-1": "$A = 13.6\\,\\mathrm{eV}$",
    "12-2": "(1) $\\Delta\\lambda = 2.42\\times10^{-3}\\,\\mathrm{nm}$；(2) $E_k = 74.2\\,\\mathrm{eV}$",
    "12-3": "$n \\approx 1.5\\times10^{30}$；能量变化 $\\Delta\\varepsilon = h\\nu$，相对变化率 $\\approx 6.7\\times10^{-31}$",
    "12-7": "$\\Delta x \\geq 0.40\\,\\mathrm{m}$",
    "13-1": "不可能发生（$\\Delta m = -0.007688\\,\\mathrm{u} < 0$）",
    "13-2": "$N/N_0 = 70.7\\%$",
    "13-3": "$V = 6.26\\,\\mathrm{L}$",
    "13-4": "约 9090 年",
    "13-5": "$D = 26.8\\,\\mathrm{rad}$",
    "14-1": "$\\nu_{\\max} = 1.208\\times10^{19}\\,\\mathrm{Hz}$",
    "14-2": "$x = 1.15\\times10^{-2}\\,\\mathrm{cm}$",
    "14-6": "光泵 477.8 nm；激光 591.6 nm；三能级系统",
}

# (section, slug, label) keyed by "hw:11-1" or "quiz:11-1"
EXERCISE_LABELS: dict[str, tuple[str, str, str]] = {
    "hw:11-1": ("11.1", "光源距离不等", "光源距离不等"),
    "hw:11-2": ("11.2", "挡光挡声", "挡光挡声"),
    "hw:11-3": ("11.2", "单缝移动图样", "单缝移动图样"),
    "hw:11-4": ("11.1", "求光波波长", "求光波波长"),
    "hw:11-5": ("11.1", "求屏距", "求屏距"),
    "hw:11-6": ("11.1", "薄膜相位差", "薄膜相位差"),
    "hw:11-7": ("11.1", "增透膜厚度", "增透膜厚度"),
    "hw:11-8": ("11.1", "劈尖夹角", "劈尖夹角"),
    "hw:11-9": ("11.1", "牛顿环波长", "牛顿环波长"),
    "hw:11-10": ("11.2", "单缝波长重合", "单缝波长重合"),
    "hw:11-11": ("11.2", "单缝明纹宽度", "单缝明纹宽度"),
    "hw:11-12": ("11.2", "光栅求波长", "光栅求波长"),
    "hw:11-13": ("11.2", "谱线重合波长", "谱线重合波长"),
    "hw:11-14": ("11.2", "光栅最高级次", "光栅最高级次"),
    "hw:11-15": ("11.3", "三块偏振片", "三块偏振片"),
    "hw:11-16": ("11.3", "四块偏振片", "四块偏振片"),
    "hw:11-17": ("11.3", "布儒斯特玻璃板", "布儒斯特玻璃板"),
    "quiz:11-1": ("11.1", "相干加强条件", "相干加强条件"),
    "quiz:11-2": ("11.2", "半波带数目", "半波带数目"),
    "quiz:11-3": ("11.2", "增大缝宽中央纹", "增大缝宽中央纹"),
    "quiz:11-4": ("11.3", "布儒斯特折射光", "布儒斯特折射光"),
    "quiz:11-5": ("11.3", "旋光溶液浓度", "旋光溶液浓度"),
    "quiz:11-6": ("11.2", "光栅最长波长", "光栅最长波长"),
    "quiz:11-7": ("11.1", "第一级暗纹光程差", "第一级暗纹光程差"),
    "quiz:11-8": ("11.2", "光栅刻痕总数", "光栅刻痕总数"),
    "quiz:11-9": ("11.1", "双缝屏距", "双缝屏距"),
    "quiz:11-10": ("11.2", "单缝明纹波长级次", "单缝明纹波长级次"),
    "quiz:11-11": ("11.2", "单缝中央二级明纹", "单缝中央二级明纹"),
    "quiz:11-12": ("11.2", "氦氖激光光栅", "氦氖激光光栅"),
    "quiz:11-13": ("11.2", "光栅三级波长", "光栅三级波长"),
    "quiz:11-14": ("11.2", "复色光栅重合", "复色光栅重合"),
    "quiz:11-15": ("11.3", "偏振片转动光强", "偏振片转动光强"),
    "hw:13-1": ("13.1", "氘氦聚变能量", "氘氦聚变能量"),
    "hw:13-2": ("13.1", "氢分子质量亏损", "氢分子质量亏损"),
    "hw:13-3": ("13.1", "氘氦比结合能", "氘氦比结合能"),
    "quiz:13-1": ("13.1", "比结合能意义", "比结合能意义"),
}


def classify(ch: int, pid: str, text: str, is_example: bool, src: str) -> tuple[str, str, str]:
    key = f"{src}:{pid}"
    if is_example and pid in EXAMPLE_META:
        sec, slug, label = EXAMPLE_META[pid]
        return sec, slug, label
    if key in EXERCISE_LABELS:
        return EXERCISE_LABELS[key]
    if not is_example and pid in EXERCISE_LABELS:
        return EXERCISE_LABELS[pid]
    if pid in SECTION_OVERRIDE:
        sec = SECTION_OVERRIDE[pid]
    else:
        sec = DEFAULT_SECTION[ch]
        for s, pat in SECTION_RULES.get(ch, []):
            if re.search(pat, text, re.I):
                sec = s
                break
    label = label_from(text)
    slug = slug_from(label)
    return sec, slug, label


def label_from(text: str, max_len: int = 15) -> str:
    text = re.sub(r"\$[^$]+\$", "", text)
    text = re.sub(r"[A-E]\.\s*", "", text)
    text = re.sub(r"\s+", "", text)
    chars = re.findall(r"[\u4e00-\u9fff]+", text)
    s = chars[0] if chars else "题目"
    return s[:max_len]


def slug_from(label: str) -> str:
    return label[:20] if label else "题目"


def clean_ocr(text: str) -> str:
    text = re.sub(r"\(\s*王勇\s*\)|\(\s*黄浩\s*\)|\(\s*幸浩洋\s*\)|\(\s*盖立平\s*\)", "", text)
    text = re.sub(r"\\mathrm\{d\}", "d", text)
    text = re.sub(r"小中文[^\n]*", "", text)
    text = re.sub(r"Io\s*=\s*0[^\n]*", "", text)
    text = re.sub(r"单财数[^\n]*", "", text)
    # fix spaced digits in math: 6 0 0 -> 600 inside $...$
    def fix_math(m: re.Match) -> str:
        s = m.group(0)
        s = re.sub(r"(?<=\d) (?=\d)", "", s)
        s = re.sub(r"\s+(\)|\}|\\)", r"\1", s)
        return s

    text = re.sub(r"\$\$[\s\S]*?\$\$|\$[^$]+\$", fix_math, text)
    return text.strip()


def extract_answer_tail(block: str) -> tuple[str, str]:
    m = re.search(r"\n\s*答[：:]\s*(.+)$", block, re.S)
    if m:
        return block[: m.start()].strip(), m.group(1).strip()
    m = re.search(r"\n\s*[（(]\s*([A-E])\s*[）)]\s*$", block)
    if m:
        return block[: m.start()].strip(), m.group(1)
    m = re.search(r"\n\s*[（(]\s*([^）)\n]{1,100})\s*[）)]\s*$", block)
    if m:
        ans = m.group(1).strip()
        if not re.match(r"^(见|提示)", ans):
            return block[: m.start()].strip(), ans
    return block.strip(), ""


def infer_answer(sol: str, existing: str, pid: str, is_example: bool) -> str:
    if is_example and pid in ANSWER_OVERRIDE:
        return ANSWER_OVERRIDE[pid]
    if existing and existing not in ("见解答过程。", "见答案。"):
        if not existing.startswith("$$") and len(existing) < 150:
            return existing
    lines = [ln.strip() for ln in sol.splitlines() if ln.strip()]
    for ln in reversed(lines):
        if ln.startswith("$$"):
            continue
        if re.search(r"(=|\\approx|约为|最多|分别是|不可能|仍能|不改变)", ln) and len(ln) < 120:
            return ln.lstrip("则故即 ∴")
    return existing or "见解答过程。"


def extract_mcq_answer(q: str) -> tuple[str, str]:
    m = re.search(r"\n\s*[（(]\s*([A-E])\s*[）)]\s*$", q)
    if m:
        return q[: m.start()].strip(), m.group(1)
    return q, ""


def split_question_solution(body: str) -> tuple[str, str, str]:
    body = body.strip()
    m_sol = re.search(r"\n解[：:]\s*", body)
    m_pf = re.search(r"\n证明[：:]\s*", body)
    m_ana = re.search(r"\n分析[：:]\s*", body)

    if m_sol:
        q = body[: m_sol.start()].strip()
        sol = body[m_sol.end() :].strip()
        if m_ana and m_ana.start() < m_sol.start():
            q = body[: m_ana.start()].strip()
            ana = body[m_ana.end() : m_sol.start()].strip()
            sol = f"分析：{ana}\n\n{sol}"
    elif m_pf:
        q = body[: m_pf.start()].strip()
        sol = body[m_pf.start() :].strip()
    elif re.match(r"^答[：:]", body):
        return body.split("\n")[0] if "\n" in body else "见题目", body, re.sub(r"^答[：:]\s*", "", body)
    else:
        q, sol = body, ""

    q, mcq_ans = extract_mcq_answer(q)
    sol, ans = extract_answer_tail(sol)
    if mcq_ans and not ans:
        ans = mcq_ans
        if not sol or sol == body:
            sol = f"选 {mcq_ans}。"
    if re.match(r"^答[：:]", sol):
        ans = re.sub(r"^答[：:]\s*", "", sol)
        sol = ans
    return q, sol, ans


def parse_chapter(ch: int, content: str) -> list[dict]:
    content = clean_ocr(content)
    items: list[dict] = []

    sections = [
        ("ex", r"## 二、解题指导——典型例题([\s\S]*?)(?=## 三、|$)"),
        ("hw", r"## 三、思考题与习题解答([\s\S]*?)(?=## 四、|$)"),
        ("quiz", r"## 四、自我评估题([\s\S]*?)$"),
    ]
    for src, pat in sections:
        m = re.search(pat, content)
        if not m:
            continue
        prob_text = m.group(1)
        split_re = re.compile(rf"(?=\[例\s*{ch}-\d+\]|\n{ch}-\d+\s)")
        chunks = split_re.split(prob_text)
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue
            hdr = re.match(rf"(?:\[例\s*({ch}-\d+)\]|({ch}-\d+))\s*(.*)", chunk, re.S)
            if not hdr:
                continue
            pid = hdr.group(1) or hdr.group(2)
            body = hdr.group(3).strip()
            is_example = src == "ex" and chunk.startswith("[例")
            q, sol, ans = split_question_solution(body)
            ans = infer_answer(sol, ans, pid, is_example)
            full = (q or "") + sol
            sec, slug, label = classify(ch, pid, full, is_example, src)
            items.append({
                "ch": ch, "sec": sec, "slug": slug, "label": label,
                "q": q or body.split("\n")[0], "sol": sol or "见答案。", "ans": ans, "pid": pid,
            })
    return items


def dedupe_slug(items: list[dict]) -> None:
    seen: dict[str, int] = {}
    for it in items:
        k = f"{it['ch']}/{it['sec']}/{it['slug']}"
        if k not in seen:
            seen[k] = 0
        else:
            seen[k] += 1
            it["slug"] = f"{it['slug']}{seen[k]}"


def render(item: dict) -> str:
    return f""":::example{{label={item['label']}}}
**题目**：{item['q']}

**解**：
{item['sol']}

**答案**：{item['ans']}
:::"""


def main() -> None:
    all_paths: list[str] = []
    stats: dict[int, int] = {11: 0, 12: 0, 13: 0, 14: 0}
    sec_stats: dict[str, int] = {}

    for ch, fname in FILES.items():
        raw = (RAW_DIR / fname).read_text(encoding="utf-8")
        items = parse_chapter(ch, raw)
        dedupe_slug(items)
        counters: dict[str, int] = {}
        for it in items:
            sec = it["sec"]
            counters[sec] = counters.get(sec, 0) + 1
            nn = counters[sec]
            rel = f"content/examples/physics/ch{ch:02d}/{sec}/EX{nn:02d}_{it['slug']}.md"
            path = ROOT / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(render(it) + "\n", encoding="utf-8")
            all_paths.append(rel)
            stats[ch] += 1
            sec_stats[f"ch{ch}/{sec}"] = sec_stats.get(f"ch{ch}/{sec}", 0) + 1

    print("=== Chapter totals ===")
    for ch in sorted(stats):
        print(f"Chapter {ch}: {stats[ch]}")
    print("\n=== Section totals ===")
    for k in sorted(sec_stats):
        print(f"{k}: {sec_stats[k]}")
    print(f"\nTotal: {sum(stats.values())} files")
    print("\n=== All paths ===")
    for p in sorted(all_paths):
        print(p)


if __name__ == "__main__":
    main()
