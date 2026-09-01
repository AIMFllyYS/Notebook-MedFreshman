"""Add definition + memory cards to textbook files that still lack them.

Never deletes existing prose or image references.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SUBJECTS = ["anatomy", "histology", "cell-biology", "biochemistry"]

TERM_LINE = re.compile(
    r"^(.{2,40}?)[（(][A-Za-z][^）)]{2,60}[）)]\s*(?:是|即|指|又称|称为)"
)
ANAT_TERM = re.compile(
    r"^([\u4e00-\u9fff]{2,16})[A-Za-z][A-Za-z0-9\s,/\-]{1,40}\s+(?:是|称为|即)"
)


def first_definitions(text: str, limit: int = 3) -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("!") or line.startswith("::"):
            continue
        m = TERM_LINE.search(line) or ANAT_TERM.search(line)
        if not m:
            continue
        label = re.sub(r"[（(].*$", "", m.group(1)).strip(" 　、．.")
        if 2 <= len(label) <= 20:
            found.append((label, line))
        if len(found) >= limit:
            break
    return found


def memory_bullets(text: str) -> list[str]:
    bullets: list[str] = []
    seen: set[str] = set()
    for raw in text.splitlines():
        line = re.sub(r"\s+", " ", raw).strip()
        if line.startswith("!") or line.startswith("::") or line.startswith("#"):
            continue
        if line.startswith("图") or line.startswith("表"):
            continue
        m = TERM_LINE.search(line) or ANAT_TERM.search(line)
        if not m:
            continue
        label = re.sub(r"[（(].*$", "", m.group(1)).strip(" 　、．.")
        if re.match(r"^[\d.、]", line) or label.startswith("量"):
            continue
        item = f"{label}：{line[:70]}" if len(line) > 90 else line
        if item in seen:
            continue
        seen.add(item)
        bullets.append(item.rstrip("。"))
        if len(bullets) >= 6:
            break
    return bullets


def enhance(text: str) -> str:
    out = text
    if ":::definition" not in out:
        defs = first_definitions(out)
        blocks = []
        for label, line in defs:
            if line in out and f'label="{label}"' not in out:
                wrapped = f'\n:::definition{{label="{label}"}}\n{line}\n:::\n'
                out = out.replace(line, line + wrapped, 1)
                blocks.append(label)
        _ = blocks
    bullets = memory_bullets(text)
    if len(bullets) >= 3:
        mem = ":::memory{label=\"本节必背要点\"}\n" + "\n".join(f"- {b}" for b in bullets) + "\n:::\n"
        if ":::memory" in out:
            out = re.sub(
                r":::memory\{label=\"本节必背要点\"\}[\s\S]*?:::\s*",
                lambda _m: mem,
                out,
                count=1,
            )
        else:
            out = out.rstrip() + "\n\n" + mem
    return out


def main() -> None:
    changed = 0
    scanned = 0
    for subject in SUBJECTS:
        folder = REPO / "content" / subject / "textbook"
        for path in folder.glob("*.md"):
            if path.name == "toc.md":
                continue
            scanned += 1
            original = path.read_text(encoding="utf-8")
            updated = enhance(original)
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                changed += 1
    print(f"scanned {scanned}, enhanced {changed}")


if __name__ == "__main__":
    main()
