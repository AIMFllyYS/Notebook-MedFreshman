"""
PDF → Markdown 降级解析脚本（MinerU 不可用时使用）

用法：
    python scripts/fallback-pdf.py <input.pdf> <output.md>

依赖安装：
    pip install pymupdf

注意：
    - 此方案适用于文本型 PDF（非扫描件）
    - 公式会以纯文本形式输出，需后续手动添加 $...$ 标记
    - 扫描件请改用 marker: pip install marker-pdf && marker_single <file>
"""

import sys
import os

try:
    import fitz  # pymupdf
except ImportError:
    print("ERROR: pymupdf not installed. Run: pip install pymupdf")
    sys.exit(1)


def pdf_to_markdown(pdf_path: str, output_path: str) -> None:
    doc = fitz.open(pdf_path)
    md_lines: list[str] = []
    md_lines.append(f"# {os.path.basename(pdf_path)}\n")

    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip():
            md_lines.append(f"\n<!-- Page {page_num} -->\n")
            md_lines.append(text.strip())
            md_lines.append("")

    doc.close()

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))

    print(f"✓ {os.path.basename(pdf_path)} → {output_path}")
    print(f"  Pages: {doc.page_count if hasattr(doc, 'page_count') else 'N/A'}")
    print(f"  ⚠  公式可能需手动添加 $...$ 标记")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/fallback-pdf.py <input.pdf> <output.md>")
        sys.exit(1)
    pdf_to_markdown(sys.argv[1], sys.argv[2])
