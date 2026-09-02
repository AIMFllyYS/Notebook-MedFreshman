"""Rasterize PDF pages for 图X-Y captions that currently have no image embeds."""
from __future__ import annotations

import re
from pathlib import Path

import fitz

REPO = Path(__file__).resolve().parents[1]
BOOKS = {
    "biochemistry": REPO / "content" / "_raw-src" / "biochemistry.pdf",
    "anatomy": REPO / "content" / "_raw-src" / "anatomy.pdf",
    "histology": REPO / "content" / "_raw-src" / "histology.pdf",
    "cell-biology": REPO / "content" / "_raw-src" / "cell-biology.pdf",
    "instrumental-analysis": REPO / "content" / "_raw-src" / "instrumental-analysis.pdf",
}
FIG_RE = re.compile(r"图\s*(\d+)\s*[-－—]\s*(\d+)")
IMG_RE = re.compile(r"!\[\]\(/images/[^)]+\)|::figure\{[^}]*src=\"/images/[^\"]+\"")


def load_pages(subject: str) -> dict[int, str]:
    raw = (REPO / "content" / "_raw" / subject / "textbook.md").read_text(encoding="utf-8")
    pages: dict[int, str] = {}
    current = 0
    buf: list[str] = []
    for line in raw.splitlines():
        m = re.match(r"^<!-- Page (\d+) -->\s*$", line)
        if m:
            if current:
                pages[current] = "\n".join(buf)
            current = int(m.group(1))
            buf = []
        else:
            buf.append(line)
    if current:
        pages[current] = "\n".join(buf)
    return pages


def figure_to_pages(pages: dict[int, str]) -> dict[str, list[int]]:
    mapping: dict[str, list[int]] = {}
    for pnum, text in pages.items():
        for m in FIG_RE.finditer(text):
            key = f"图{int(m.group(1))}-{int(m.group(2))}"
            mapping.setdefault(key, []).append(pnum)
    return mapping


def render_page(doc: fitz.Document, page_no: int, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        page = doc.load_page(page_no - 1)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.7, 1.7), alpha=False)
        dest.parent.mkdir(parents=True, exist_ok=True)
        pix.save(str(dest))
        return dest.exists() and dest.stat().st_size > 0
    except Exception as exc:
        print(f"  render fail p{page_no}: {exc}")
        return False


def unique_figs(text: str) -> list[str]:
    seen: list[str] = []
    for m in FIG_RE.finditer(text):
        key = f"图{int(m.group(1))}-{int(m.group(2))}"
        if key not in seen:
            seen.append(key)
    return seen


def insert_after_caption(text: str, fig: str, img_md: str) -> str:
    pattern = re.compile(rf"({re.escape(fig)}[^\n]*)")
    m = pattern.search(text)
    if not m:
        return text.rstrip() + "\n\n" + img_md + "\n"
    if img_md in text:
        return text
    return text[: m.end()] + "\n\n" + img_md + "\n" + text[m.end() :]


def process_subject(subject: str, pdf_path: Path) -> int:
    if not pdf_path.exists():
        print(f"skip {subject}: missing pdf")
        return 0
    pages = load_pages(subject)
    fig_pages = figure_to_pages(pages)
    doc = fitz.open(str(pdf_path))
    img_dir = REPO / "public" / "images" / subject / "textbook"
    changed = 0
    folder = REPO / "content" / subject / "textbook"
    for path in sorted(folder.glob("*.md")):
        if path.name == "toc.md":
            continue
        text = path.read_text(encoding="utf-8")
        figs = unique_figs(text)
        if not figs or IMG_RE.search(text):
            continue
        inserted: set[int] = set()
        updated = text
        for fig in figs:
            for pnum in fig_pages.get(fig, []):
                if pnum in inserted:
                    continue
                dest = img_dir / f"p{pnum:04d}_page.png"
                if not render_page(doc, pnum, dest):
                    continue
                rel = f"/images/{subject}/textbook/{dest.name}"
                caption = fig
                img_md = f'::figure{{src="{rel}" caption="{caption}"}}'
                updated = insert_after_caption(updated, fig, img_md)
                inserted.add(pnum)
                break
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"  {subject}/{path.name} +{len(inserted)} page renders")
    doc.close()
    return changed


def main() -> None:
    total = 0
    for subject, pdf in BOOKS.items():
        print(f"=== {subject} ===")
        total += process_subject(subject, pdf)
    print(f"updated {total} leaves")


if __name__ == "__main__":
    main()
