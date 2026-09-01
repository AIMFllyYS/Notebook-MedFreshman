"""Turn 本章小结 blocks into :::memory cards without deleting the original section."""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SUBJECTS = ["anatomy", "histology", "cell-biology", "biochemistry"]


def add_memory(text: str) -> str:
    if ":::memory" in text:
        return text
    m = re.search(r"(本章小结[\s\S]{20,2500}?)(?=\n思考题|\n复习思考|\n插入框|\Z)", text)
    if not m:
        return text
    block = m.group(1)
    parts = re.split(r"[。；;\n]", block)
    bullets = []
    for p in parts:
        s = re.sub(r"^本章小结", "", p).strip()
        s = re.sub(r"^[\d一二三四五六七八九十]+[、.．]", "", s).strip()
        if 8 <= len(s) <= 90 and not s.startswith("图") and not s.startswith("表"):
            bullets.append(s)
        if len(bullets) >= 8:
            break
    if len(bullets) < 3:
        return text
    mem = "\n".join(f"- {b}" for b in bullets)
    return text.rstrip() + f"\n\n:::memory{{label=\"本节必背要点\"}}\n{mem}\n:::\n"


def main() -> None:
    n = 0
    for subject in SUBJECTS:
        folder = REPO / "content" / subject / "textbook"
        for path in folder.glob("*.md"):
            if path.name == "toc.md":
                continue
            original = path.read_text(encoding="utf-8")
            updated = add_memory(original)
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                n += 1
    print(f"memory cards added to {n} files")


if __name__ == "__main__":
    main()
