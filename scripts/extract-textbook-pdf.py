"""Extract a textbook PDF to Markdown + on-disk figures.

Usage:
    python scripts/extract-textbook-pdf.py --pdf content/_raw-src/anatomy.pdf --subject anatomy --basename textbook

Outputs:
    content/_raw/{subject}/{basename}.md
    content/_raw/{subject}/{basename}.toc.json
    public/images/{subject}/{basename}/pXXXX_YY.png
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    print("ERROR: pymupdf not installed. Run: pip install pymupdf")
    sys.exit(1)

MIN_IMAGE_PX = 80
SKIP_TITLES = re.compile(r"^(封面|版权|前言|编写说明|目录|索引|参考文献)$")


def safe_save_pixmap(pix: fitz.Pixmap, dest: Path) -> bool:
    try:
        if pix.n - pix.alpha > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        if pix.width < MIN_IMAGE_PX or pix.height < MIN_IMAGE_PX:
            return False
        pix.save(str(dest))
        return dest.exists() and dest.stat().st_size > 0
    except Exception:
        return False


def extract_page_images(doc: fitz.Document, page: fitz.Page, page_no: int, img_dir: Path, rel_prefix: str) -> list[str]:
    refs: list[str] = []
    seen: set[int] = set()
    for img_index, img in enumerate(page.get_images(full=True), start=1):
        xref = img[0]
        if xref in seen:
            continue
        seen.add(xref)
        name = f"p{page_no:04d}_{img_index:02d}.png"
        dest = img_dir / name
        try:
            pix = fitz.Pixmap(doc, xref)
        except Exception:
            continue
        if safe_save_pixmap(pix, dest):
            refs.append(f"![]({rel_prefix}/{name})")
        pix = None
    return refs


def dump_toc(doc: fitz.Document) -> list[dict]:
    out = []
    for level, title, page in doc.get_toc(simple=True):
        title = (title or "").strip()
        if not title:
            continue
        out.append({"level": int(level), "title": title, "page": int(page)})
    return out


def extract(pdf_path: Path, subject: str, basename: str, repo: Path) -> None:
    raw_dir = repo / "content" / "_raw" / subject
    img_dir = repo / "public" / "images" / subject / basename
    raw_dir.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    toc = dump_toc(doc)
    toc_path = raw_dir / f"{basename}.toc.json"
    toc_path.write_text(json.dumps({"pages": doc.page_count, "toc": toc}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"TOC {len(toc)} entries, {doc.page_count} pages -> {toc_path}")

    rel_prefix = f"/images/{subject}/{basename}"
    md_lines: list[str] = [f"# {subject} 教材原文\n"]
    image_count = 0

    for i, page in enumerate(doc, start=1):
        md_lines.append(f"\n<!-- Page {i} -->\n")
        text = page.get_text("text") or ""
        text = text.replace("\u00a0", " ").strip()
        if text:
            md_lines.append(text)
            md_lines.append("")
        refs = extract_page_images(doc, page, i, img_dir, rel_prefix)
        if refs:
            image_count += len(refs)
            md_lines.extend(refs)
            md_lines.append("")
        if i % 50 == 0:
            print(f"  page {i}/{doc.page_count} images={image_count}")

    out_md = raw_dir / f"{basename}.md"
    out_md.write_text("\n".join(md_lines), encoding="utf-8")
    print(f"Wrote {out_md} ({out_md.stat().st_size} bytes), {image_count} figures")
    doc.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--basename", default="textbook")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    pdf_path = Path(args.pdf)
    if not pdf_path.is_absolute():
        pdf_path = repo / pdf_path
    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}")
        sys.exit(1)
    extract(pdf_path, args.subject, args.basename, repo)


if __name__ == "__main__":
    main()
