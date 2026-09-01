"""Add callouts/知识卡片 to ingested textbook markdown without dropping prose or images."""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SUBJECTS = ["anatomy", "histology", "cell-biology", "biochemistry"]

EXAMPLE_RE = re.compile(
    r"(^|\n)((?:【例】|例\s*\d+[\-－—]\d+)[^\n]*(?:\n(?!(?:【例】|例\s*\d+|#{1,3}\s|:::))[^\n]*){0,40})",
    re.M,
)
NOTE_RE = re.compile(r"(^|\n)((?:注意|要点)[：:][^\n]+)", re.M)
SUMMARY_RE = re.compile(
    r"(本章小结[^\n]*\n(?:.*\n){1,40}?)(?=\n#{1,3}\s|\n思考题|\n复习|\Z)",
    re.M,
)


def enhance(text: str) -> str:
    if ":::example" not in text:
        def wrap_ex(m: re.Match) -> str:
            body = m.group(2).strip()
            if ":::example" in body:
                return m.group(0)
            return f"{m.group(1)}\n:::example{{label=\"例题\"}}\n{body}\n:::\n"

        text = EXAMPLE_RE.sub(wrap_ex, text, count=8)

    if ":::pitfall" not in text:
        text = NOTE_RE.sub(
            lambda m: f"{m.group(1)}\n:::pitfall{{label=\"注意\"}}\n{m.group(2).strip()}\n:::\n",
            text,
            count=8,
        )

    if ":::memory" not in text:
        m = re.search(r"本章小结[\s\S]{30,1500}", text)
        if m:
            block = m.group(0)
            bullets = re.findall(r"[。；;]\s*([^。；;\n]{8,80})", block)
            if bullets:
                mem = "\n".join(f"- {b.strip().rstrip('。')}" for b in bullets[:8])
                text += f"\n\n:::memory{{label=\"本节必背要点\"}}\n{mem}\n:::\n"
    return text


def main() -> None:
    n = 0
    for subject in SUBJECTS:
        folder = REPO / "content" / subject / "textbook"
        for path in folder.glob("*.md"):
            if path.name == "toc.md":
                continue
            original = path.read_text(encoding="utf-8")
            updated = enhance(original)
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                n += 1
    print(f"enhanced {n} files")


if __name__ == "__main__":
    main()
