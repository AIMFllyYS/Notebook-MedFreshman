"""OCR a scanned textbook PDF into textbook.md + compressed page JPEGs.

Usage:
    python scripts/extract-scanned-textbook.py --pdf content/_raw-src/instrumental-analysis.pdf --subject instrumental-analysis --basename textbook
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import fitz
import numpy as np
from rapidocr_onnxruntime import RapidOCR

OCR_ZOOM = 2.0
JPEG_ZOOM = 1.25
JPEG_QUALITY = 72


def pix_to_bgr(pix: fitz.Pixmap) -> np.ndarray:
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n == 4:
        img = img[:, :, :3]
    return np.ascontiguousarray(img[:, :, ::-1])


def ocr_page(engine: RapidOCR, img: np.ndarray) -> str:
    result, _elapse = engine(img)
    if not result:
        return ""
    lines: list[str] = []
    for item in result:
        text = item[1] if len(item) > 1 else ""
        text = str(text or "").strip()
        if text:
            lines.append(text)
    return "\n".join(lines)


def assemble_markdown(subject: str, basename: str, pages: int, texts: dict[int, str]) -> str:
    rel = f"/images/{subject}/{basename}"
    chunks = [f"# {subject} 教材原文\n"]
    for i in range(1, pages + 1):
        chunks.append(f"\n<!-- Page {i} -->\n")
        body = (texts.get(i) or "").strip()
        if body:
            chunks.append(body)
            chunks.append("")
        chunks.append(f"![]({rel}/p{i:04d}_01.jpg)")
        chunks.append("")
    return "\n".join(chunks)


CHAPTER_LINE = re.compile(
    r"^第\s*([0-9零〇一二三四五六七八九十百]+)\s*章\s*(.*)$"
)
SECTION_LINE = re.compile(r"^(\d+)\.(\d+)(?!\d)\s*(.*)$")


def guess_toc(pages: int, texts: dict[int, str]) -> list[dict]:
    toc: list[dict] = []
    seen_ch: set[str] = set()
    seen_sec: set[tuple[str, str]] = set()
    for i in range(1, pages + 1):
        body = texts.get(i) or ""
        for raw in body.splitlines():
            line = raw.strip().replace("　", " ")
            m = CHAPTER_LINE.match(line)
            if m:
                key = m.group(1)
                if key not in seen_ch:
                    seen_ch.add(key)
                    title = f"第{key}章　{m.group(2).strip()}".strip()
                    toc.append({"level": 1, "title": title, "page": i})
                continue
            m = SECTION_LINE.match(line)
            if m and int(m.group(2)) != 0:
                key = (m.group(1), m.group(2))
                rest = m.group(3).strip()
                if key in seen_sec:
                    continue
                if len(rest) < 2:
                    continue
                seen_sec.add(key)
                n = int(m.group(2))
                toc.append(
                    {
                        "level": 2,
                        "title": f"第{n}节　{rest}",
                        "page": i,
                    }
                )
    return toc


def extract(pdf_path: Path, subject: str, basename: str, repo: Path) -> None:
    raw_dir = repo / "content" / "_raw" / subject
    img_dir = repo / "public" / "images" / subject / basename
    page_dir = raw_dir / "ocr-pages"
    raw_dir.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)
    page_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    pages = doc.page_count
    print(f"PDF {pdf_path.name}: {pages} pages (scanned OCR)")

    engine = RapidOCR()
    texts: dict[int, str] = {}
    for i in range(1, pages + 1):
        txt_path = page_dir / f"p{i:04d}.txt"
        jpg_path = img_dir / f"p{i:04d}_01.jpg"
        if txt_path.exists() and jpg_path.exists() and jpg_path.stat().st_size > 0:
            texts[i] = txt_path.read_text(encoding="utf-8")
            if i % 50 == 0:
                print(f"  skip {i}/{pages}")
            continue

        page = doc[i - 1]
        if not jpg_path.exists() or jpg_path.stat().st_size == 0:
            small = page.get_pixmap(matrix=fitz.Matrix(JPEG_ZOOM, JPEG_ZOOM), alpha=False)
            small.save(str(jpg_path), jpg_quality=JPEG_QUALITY)
            small = None

        pix = page.get_pixmap(matrix=fitz.Matrix(OCR_ZOOM, OCR_ZOOM), alpha=False)
        img = pix_to_bgr(pix)
        pix = None
        text = ocr_page(engine, img)
        txt_path.write_text(text, encoding="utf-8")
        texts[i] = text
        if i % 10 == 0 or i == 1:
            print(f"  page {i}/{pages} chars={len(text)} jpg={jpg_path.stat().st_size}")

    doc.close()

    md_path = raw_dir / f"{basename}.md"
    md_path.write_text(assemble_markdown(subject, basename, pages, texts), encoding="utf-8")
    toc = guess_toc(pages, texts)
    toc_path = raw_dir / f"{basename}.toc.json"
    toc_path.write_text(
        json.dumps({"pages": pages, "toc": toc, "source": "ocr-guess"}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {md_path} ({md_path.stat().st_size} bytes)")
    print(f"Wrote {toc_path} entries={len(toc)}")
    for entry in toc:
        if entry["level"] == 1:
            print(f"  L1 p{entry['page']:04d} {entry['title']}")


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
