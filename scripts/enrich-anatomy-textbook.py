"""Enrich anatomy textbook markdown with platform callouts.

Keeps every existing paragraph and image. Wraps definitions / clinical notes /
pitfalls in place and appends a memory card built only from text already in
the file.
"""
from __future__ import annotations

import re
from collections import OrderedDict
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
FOLDER = REPO / "content" / "anatomy" / "textbook"

SKIP_NAMES = {"toc.md"}

HEADING_RE = re.compile(
    r"^(?:"
    r"#{1,6}\s"
    r"|[一二三四五六七八九十]+、"
    r"|[（(][一二三四五六七八九十0-9]+[）)]"
    r"|第[一二三四五六七八九十0-9]+[章节篇]"
    r"|[（(]?[一二三四五六七八九十]+[）)]\s*[|｜]"
    r")"
)
NUMBERED_START_RE = re.compile(r"^\d+\.\s*")
STRUCTURAL_EXACT = {
    "绪",
    "论",
    "扫描图片",
    "体验AR",
    "思考题",
    "思考题解题思路",
}
FIG_LINE_RE = re.compile(r"^图\s*\d+")
TABLE_LINE_RE = re.compile(r"^表\s*\d+")
IMAGE_RE = re.compile(r"^!\[.*\]\(")
FIGURE_RE = re.compile(r"^::figure\{")
FENCE_RE = re.compile(r"^:::")

# Chinese term + Latin/English + copula — the textbook's definition style.
DEF_RE = re.compile(
    r"^(?:\d+\.\s*)?"
    r"(?P<label>[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9（）()\-]{0,22})"
    r"\s*(?P<eng>[A-Za-z][A-Za-z0-9\s\-',/()]{1,55}?)\s*"
    r"(?:是指|是为|称为|又称|也称|又名|即是|是)"
)
# Classification lines such as “长骨long bone 分布于四肢”
CLASS_RE = re.compile(
    r"^(?:\d+\.\s*)?"
    r"(?P<label>[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9（）()\-]{0,22})"
    r"\s*(?P<eng>[A-Za-z][A-Za-z0-9\s\-',/()]{1,55}?)\s*"
    r"(?:分为|分布于|由|位于|包括|属于)"
)

CLINICAL_RE = re.compile(
    r"临床(?:上)?(?:称为|常称|又称|常选|常经|可经|常将|常以|诊断为)|"
    r"具有重要的临床意义|临床意义|"
    r"好发部位|穿刺|手术时应注意|抢救"
)
PITFALL_RE = re.compile(
    r"注意(?:[:：勿区区]|勿)|初学者一定要注意|两种完全不同|"
    r"勿损伤|切勿|易误认为|容易引起|易发生|容易骨折|"
    r"勿混淆|不可混淆|不要将|不宜|相对最为薄弱|"
    r"骨折时易|脱位时"
)
INSIGHT_RE = re.compile(
    r"总之|综上所述|具有重要意义|必须遵循的基本原则|"
    r"三个结合|四个观点|被动部分|主动部分"
)
NOTE_RE = re.compile(r"^(?:补充|附注|说明)[:：]")

LABEL_STOP = {
    "因此",
    "但是",
    "如果",
    "虽然",
    "此外",
    "同时",
    "通常",
    "一般",
    "分别",
    "其中",
    "由于",
    "另外",
    "所以",
    "然而",
    "而且",
    "并且",
    "因为",
    "例如",
    "如图",
    "上述",
    "下列",
    "以下",
    "以上",
    "本章",
    "本节",
    "人体",
    "成人",
    "幼儿",
    "新生儿",
    "两侧",
    "一侧",
    "前面",
    "后面",
    "上面",
    "下面",
}

SKIP_LABEL_PREFIX = (
    "图",
    "表",
    "见",
    "据",
    "按",
    "以",
    "将",
    "把",
    "被",
    "对",
    "在",
    "当",
    "从",
    "与",
    "和",
    "或",
    "而",
    "但",
    "如",
)


def is_heading_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if s in STRUCTURAL_EXACT:
        return True
    if HEADING_RE.match(s):
        # Long heading-like lines that continue as prose are still headings
        # when they are short or end without a copula sentence.
        if len(s) <= 48:
            return True
        if "是" not in s and "称为" not in s and "指" not in s:
            return True
    return False


def is_atomic_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return True
    if is_heading_line(line):
        return True
    if IMAGE_RE.match(s) or FIGURE_RE.match(s) or FENCE_RE.match(s):
        return True
    if FIG_LINE_RE.match(s) or TABLE_LINE_RE.match(s):
        return True
    return False


def joined(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def is_table_like(block: str) -> bool:
    lines = [ln for ln in block.splitlines() if ln.strip()]
    if len(lines) >= 5:
        avg = sum(len(ln.strip()) for ln in lines) / len(lines)
        periods = block.count("。")
        if avg < 18 and periods <= 1:
            return True
    return False


def first_sentence(text: str) -> str:
    t = joined(text)
    m = re.search(r".{8,80}?[。；]", t)
    if m:
        return m.group(0).rstrip("。；")
    return t[:80]


def extract_label(block: str) -> str | None:
    t = joined(block)
    t = NUMBERED_START_RE.sub("", t)
    m = DEF_RE.match(t) or CLASS_RE.match(t)
    if not m:
        return None
    label = m.group("label").strip()
    label = re.sub(r"[（(].*$", "", label).strip("，、 　")
    if len(label) < 2 or len(label) > 18:
        return None
    if label in LABEL_STOP:
        return None
    if label.startswith(SKIP_LABEL_PREFIX):
        return None
    return label


def classify_block(block: str) -> str | None:
    if is_table_like(block):
        return None
    t = joined(block)
    if len(t) < 12 or len(t) > 900:
        return None
    if t.startswith("思考题"):
        return None
    if NOTE_RE.match(t):
        return "note"
    label = extract_label(block)
    if label and DEF_RE.match(NUMBERED_START_RE.sub("", t)):
        return "definition"
    if CLINICAL_RE.search(t) and 20 <= len(t) <= 700:
        return "example"
    if PITFALL_RE.search(t) and 16 <= len(t) <= 700:
        return "pitfall"
    if label and CLASS_RE.match(NUMBERED_START_RE.sub("", t)) and len(t) <= 420:
        return "definition"
    if INSIGHT_RE.search(t) and 16 <= len(t) <= 360:
        return "insight"
    return None


def wrap(kind: str, label: str, body: str) -> str:
    body = body.strip("\n")
    if kind == "note" and not label:
        return f":::note\n{body}\n:::"
    return f":::{kind}{{label=\"{label}\"}}\n{body}\n:::"


def example_label(block: str) -> str:
    t = joined(block)
    m = re.search(r"临床(?:上)?(?:称为|常称|又称)\s*([\u4e00-\u9fffA-Za-z0-9]{2,16})", t)
    if m:
        return f"临床联系 · {m.group(1)}"
    m = re.search(r"([\u4e00-\u9fff]{2,12}(?:穿刺|脱位|骨折|突出症|疝|止血))", t)
    if m:
        return f"临床联系 · {m.group(1)}"
    return "临床联系"


def pitfall_label(block: str) -> str:
    t = joined(block)
    if "两种完全不同" in t or "勿混淆" in t or "不可混淆" in t:
        return "易混"
    if "勿损伤" in t:
        return "注意勿损伤"
    if "薄弱" in t or "脱位" in t:
        return "易损 / 脱位"
    if "骨折" in t:
        return "易骨折"
    return "注意"


def insight_label(block: str) -> str:
    t = joined(block)
    if "三个结合" in t or "四个观点" in t:
        return "学习方法"
    if "被动部分" in t or "主动部分" in t:
        return "运动系统组成"
    if "必须遵循" in t:
        return "描述原则"
    return "小结"


def split_blocks(text: str) -> list[tuple[str, str]]:
    """Return (kind, raw) where kind is 'blank' | 'atomic' | 'prose'."""
    lines = text.splitlines()
    out: list[tuple[str, str]] = []
    buf: list[str] = []

    def flush() -> None:
        if buf:
            out.append(("prose", "\n".join(buf)))
            buf.clear()

    for line in lines:
        if line.strip() == "":
            flush()
            out.append(("blank", line))
        elif is_atomic_line(line):
            flush()
            out.append(("atomic", line))
        else:
            buf.append(line)
    flush()
    return out


def caps_for(n_chars: int) -> dict[str, int]:
    if n_chars < 4000:
        return {"definition": 10, "example": 4, "pitfall": 4, "insight": 2, "note": 2}
    if n_chars < 25000:
        return {"definition": 16, "example": 8, "pitfall": 6, "insight": 3, "note": 2}
    return {"definition": 22, "example": 10, "pitfall": 8, "insight": 3, "note": 2}


def memory_facts(text: str, wrapped_defs: list[tuple[str, str]]) -> list[str]:
    facts: list[str] = []
    seen: set[str] = set()

    def add(s: str) -> None:
        s = re.sub(r"\s+", " ", s).strip(" ；;。·- ")
        if len(s) < 8 or len(s) > 90:
            return
        key = re.sub(r"\s+", "", s)
        if key in seen:
            return
        seen.add(key)
        facts.append(s)

    for label, body in wrapped_defs:
        sent = first_sentence(body)
        if label and label not in sent:
            add(f"{label}：{sent}")
        else:
            add(sent)

    # Numeric / classification sentences already in the file.
    joined_text = joined(text)
    for pat in (
        r"成人有206\s*块骨[^。]{0,40}",
        r"人体的基本组织包括[^。]{8,60}",
        r"分别组成9\s*大系统[^。]{0,20}",
        r"骨骼肌[^。]{0,40}约占体重的40%",
        r"关节的基本构造[^。]{8,50}",
        r"脊柱有颈、胸、腰、骶4\s*个生理性弯曲",
        r"真肋|假肋|浮肋",
    ):
        m = re.search(pat, joined_text)
        if m:
            add(m.group(0))

    # First-sentence grabs from remaining high-value copulas if still short.
    if len(facts) < 6:
        for m in re.finditer(
            r"([\u4e00-\u9fff]{2,12}(?:[A-Za-z][A-Za-z\s\-]{2,24})?\s*(?:是|称为)\s*[^。]{8,60}。)",
            joined_text,
        ):
            add(m.group(1).rstrip("。"))
            if len(facts) >= 10:
                break

    return facts[:10]


def enhance(text: str) -> tuple[str, dict[str, int]]:
    counts = {k: 0 for k in ("definition", "example", "pitfall", "insight", "note", "memory")}
    if ":::memory" in text and ":::definition" in text:
        return text, counts

    caps = caps_for(len(text))
    seen_def_labels: set[str] = set()
    wrapped_defs: list[tuple[str, str]] = []
    pieces: list[str] = []
    in_fence = False

    blocks = split_blocks(text)
    for kind, raw in blocks:
        if kind != "prose":
            if raw.startswith(":::") and not raw.startswith("::figure"):
                in_fence = not in_fence if raw.strip() == ":::" or raw.startswith(":::") else in_fence
                if raw.strip() == ":::":
                    in_fence = False
                elif raw.startswith(":::") and not raw.endswith(":::"):
                    in_fence = True
            pieces.append(raw)
            continue
        if in_fence or ":::definition" in raw or ":::example" in raw:
            pieces.append(raw)
            continue

        cls = classify_block(raw)
        if not cls:
            pieces.append(raw)
            continue
        if counts[cls] >= caps[cls]:
            pieces.append(raw)
            continue

        if cls == "definition":
            label = extract_label(raw)
            if not label or label in seen_def_labels:
                pieces.append(raw)
                continue
            seen_def_labels.add(label)
            pieces.append(wrap("definition", label, raw))
            wrapped_defs.append((label, raw))
            counts["definition"] += 1
        elif cls == "example":
            pieces.append(wrap("example", example_label(raw), raw))
            counts["example"] += 1
        elif cls == "pitfall":
            pieces.append(wrap("pitfall", pitfall_label(raw), raw))
            counts["pitfall"] += 1
        elif cls == "insight":
            pieces.append(wrap("insight", insight_label(raw), raw))
            counts["insight"] += 1
        elif cls == "note":
            pieces.append(wrap("note", "", raw))
            counts["note"] += 1
        else:
            pieces.append(raw)

    # Rejoin: preserve original blank lines.
    out = "\n".join(pieces)
    if not out.endswith("\n"):
        out += "\n"

    if ":::memory{label=\"本节必背要点\"}" not in out:
        facts = memory_facts(out, wrapped_defs)
        if not facts:
            # Fallback: first definition-like sentences from the file itself.
            for m in re.finditer(
                r"([\u4e00-\u9fff]{2,16}\s*[A-Za-z][A-Za-z\s\-]{2,30}\s*是[^。]{8,70})",
                joined(out),
            ):
                s = re.sub(r"\s+", " ", m.group(1)).strip()
                if s not in facts:
                    facts.append(s)
                if len(facts) >= 6:
                    break
        if facts:
            bullets = "\n".join(f"- {f}" for f in facts[:10])
            out += f"\n:::memory{{label=\"本节必背要点\"}}\n{bullets}\n:::\n"
            counts["memory"] = 1

    return out, counts


def main() -> None:
    total = {k: 0 for k in ("definition", "example", "pitfall", "insight", "note", "memory")}
    edited: list[str] = []
    for path in sorted(FOLDER.glob("*.md")):
        if path.name in SKIP_NAMES:
            continue
        original = path.read_text(encoding="utf-8")
        updated, counts = enhance(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            edited.append(path.name)
            for k, v in counts.items():
                total[k] += v
            print(f"{path.name:12} {counts}")
        else:
            print(f"{path.name:12} unchanged {counts}")
    print("---")
    print("edited", len(edited))
    print("totals", total)


if __name__ == "__main__":
    main()
