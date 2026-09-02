"""Dump TOC of all four sophomore PDFs."""
from pathlib import Path
import json
import fitz

REPO = Path(__file__).resolve().parents[1]
SRC = REPO / "content" / "_raw-src"
OUT = REPO / "content" / "_raw"

BOOKS = [
    ("cell-biology", "cell-biology.pdf"),
    ("biochemistry", "biochemistry.pdf"),
    ("anatomy", "anatomy.pdf"),
    ("histology", "histology.pdf"),
    ("instrumental-analysis", "instrumental-analysis.pdf"),
]

def main() -> None:
    for subject, filename in BOOKS:
        pdf = SRC / filename
        print(f"\n=== {subject} {pdf.name} exists={pdf.exists()} ===")
        if not pdf.exists():
            continue
        doc = fitz.open(str(pdf))
        toc = [{"level": int(lv), "title": (t or "").strip(), "page": int(p)} for lv, t, p in doc.get_toc(simple=True)]
        out_dir = OUT / subject
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / "textbook.toc.json"
        path.write_text(json.dumps({"pages": doc.page_count, "toc": toc}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"pages={doc.page_count} toc={len(toc)} -> {path}")
        for entry in toc[:40]:
            print(f"  L{entry['level']} p{entry['page']:4d} {entry['title']}")
        if len(toc) > 40:
            print(f"  ... {len(toc) - 40} more")
        doc.close()

if __name__ == "__main__":
    main()
