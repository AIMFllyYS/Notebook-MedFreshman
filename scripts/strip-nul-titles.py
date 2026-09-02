"""Strip NUL bytes from sophomore textbook titles, markdown, and generated nav."""
from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TARGETS = [
    REPO / "lib" / "content-data" / "histology-textbook.ts",
    REPO / "lib" / "content-data" / "anatomy-textbook.ts",
    REPO / "lib" / "content-data" / "cell-biology-textbook.ts",
    REPO / "lib" / "content-data" / "biochemistry-textbook.ts",
    REPO / "lib" / "content-data" / "instrumental-analysis-textbook.ts",
    REPO / "lib" / "content-data" / "nav.generated.json",
]


def strip_text(text: str) -> str:
    return text.replace("\x00", "").replace("\ufffd", "")


def main() -> None:
    n = 0
    for path in TARGETS:
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        updated = strip_text(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            n += 1
            print(f"stripped {path.relative_to(REPO)}")
    for subject in ["histology", "anatomy", "cell-biology", "biochemistry", "instrumental-analysis"]:
        folder = REPO / "content" / subject / "textbook"
        if not folder.exists():
            continue
        for md in folder.glob("*.md"):
            original = md.read_text(encoding="utf-8")
            updated = strip_text(original)
            if updated != original:
                md.write_text(updated, encoding="utf-8")
                n += 1
    print(f"updated {n} files")


if __name__ == "__main__":
    main()
