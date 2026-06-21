"""
PPTX → Markdown 降级解析脚本（MinerU 不可用时使用）

用法：
    python scripts/fallback-pptx.py <input.pptx> <output.md>

依赖安装：
    pip install python-pptx
"""

import sys
import os

try:
    from pptx import Presentation
except ImportError:
    print("ERROR: python-pptx not installed. Run: pip install python-pptx")
    sys.exit(1)


def pptx_to_markdown(pptx_path: str, output_path: str) -> None:
    prs = Presentation(pptx_path)
    md_lines: list[str] = []
    md_lines.append(f"# {os.path.basename(pptx_path)}\n")

    for i, slide in enumerate(prs.slides, 1):
        md_lines.append(f"\n## Slide {i}\n")
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    text = para.text.strip()
                    if not text:
                        continue
                    if shape == slide.shapes.title:
                        md_lines.append(f"### {text}\n")
                    else:
                        md_lines.append(f"{text}\n")

            if shape.has_table:
                table = shape.table
                rows = list(table.rows)
                header = "| " + " | ".join(
                    cell.text.strip() for cell in rows[0].cells
                ) + " |"
                separator = "| " + " | ".join("---" for _ in rows[0].cells) + " |"
                md_lines.append(header)
                md_lines.append(separator)
                for row in rows[1:]:
                    row_text = "| " + " | ".join(
                        cell.text.strip() for cell in row.cells
                    ) + " |"
                    md_lines.append(row_text)
                md_lines.append("")

        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                md_lines.append(f"\n> 备注：{notes}\n")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"✓ {os.path.basename(pptx_path)} → {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/fallback-pptx.py <input.pptx> <output.md>")
        sys.exit(1)
    pptx_to_markdown(sys.argv[1], sys.argv[2])
