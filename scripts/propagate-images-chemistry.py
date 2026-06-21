"""
Propagate MinerU-recovered images into chemistry detail and example markdown files.

Strategy (chemistry-specific):
1. Map each PPT chapter to its image directory under public/images/chemistry/{baseName}/
2. For each detail file (ppt-{X.Y}.md), select representative images from the
   corresponding chapter's image directory and inject as ::figure directives
   at the top of the file (after the H1 title).
3. For example files (EX*.md / HW*.md), inject one representative image from
   the chapter's image directory at the top (after the :::example directive).

Unlike the physics script (which matches "图X-Y" references), chemistry PPTs
have hash-named images without figure numbers, so we use chapter-level mapping.

Usage:
    python scripts/propagate-images-chemistry.py [--dry-run] [--max-per-detail N] [--max-per-example N]
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "public" / "images" / "chemistry"
DETAIL_DIR = ROOT / "content" / "chemistry" / "detail"
EXAMPLES_DIR = ROOT / "content" / "examples" / "chemistry"

DRY_RUN = "--dry-run" in sys.argv

# Default: inject up to 3 images per detail, 1 per example
MAX_PER_DETAIL = 3
MAX_PER_EXAMPLE = 1
for i, arg in enumerate(sys.argv):
    if arg == "--max-per-detail" and i + 1 < len(sys.argv):
        MAX_PER_DETAIL = int(sys.argv[i + 1])
    if arg == "--max-per-example" and i + 1 < len(sys.argv):
        MAX_PER_EXAMPLE = int(sys.argv[i + 1])


# PPT chapter number -> image directory name mapping
# Based on tmp/chemistry-ppt-pdf/ file names
CHAPTER_TO_IMG_DIR = {
    1: "01. 第1章-绪论-王锋",
    2: "02. 第2章-有机化合物的命名-王锋",
    3: "03. 第3章 有机分子的弱相互作用与物理性质-王锋",
    4: "04. 第4章 烷烃与环烷烃-王锋",
    5: "05. 第5章 有机化学中的取代基效应-王锋",
    6: "06. 第6章 烯与炔-王锋",
    7: "07. 第7章 芳香烃-王锋",
    8: "08. 第8章 对映异构-王锋",
    9: "09. 第9章 卤代烃-王锋",
    11: "10. 第11章 醇酚醚-王锋",
    12: "11. 第12章 醛酮-王锋",
    13: "12. 第13章 羧酸及其衍生物-王锋",
    15: "13. 第15章 含氮有机化合物-王锋",
    16: "14. 第16章 芳香杂环化合物-王锋",
    17: "15. 第17章 糖类与脂类化合物-王锋",
    18: "16. 第18章 含氮天然化合物-王锋",
}

# Homework PPTs (for example files) - map chapter ranges to homework image dirs
HW_IMG_DIRS = {
    "1-5": "18. 作业讲解（第1-5章）-王锋",
    "6-8": "19. 作业讲解（第6-8章）-王锋",
    "9-13": "20.  作业讲解（第9-13章）-王锋",
    "15-18": "21. 作业讲解（第15-18章）-王锋",
}


def get_chapter_images(chapter: int) -> list[str]:
    """Get list of image paths for a given chapter."""
    img_dir_name = CHAPTER_TO_IMG_DIR.get(chapter)
    if not img_dir_name:
        return []
    img_dir = IMAGES_DIR / img_dir_name
    if not img_dir.exists():
        return []
    # Return absolute public paths, sorted for determinism
    images = []
    for f in sorted(img_dir.iterdir()):
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            images.append(f"/images/chemistry/{img_dir_name}/{f.name}")
    return images


def get_hw_images_for_chapter(chapter: int) -> list[str]:
    """Get homework PPT images for a given chapter."""
    if chapter in (1, 2, 3, 4, 5):
        range_key = "1-5"
    elif chapter in (6, 7, 8):
        range_key = "6-8"
    elif chapter in (9, 10, 11, 12, 13):
        range_key = "9-13"
    elif chapter in (15, 16, 17, 18):
        range_key = "15-18"
    else:
        return []

    img_dir_name = HW_IMG_DIRS.get(range_key)
    if not img_dir_name:
        return []
    img_dir = IMAGES_DIR / img_dir_name
    if not img_dir.exists():
        return []
    images = []
    for f in sorted(img_dir.iterdir()):
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            images.append(f"/images/chemistry/{img_dir_name}/{f.name}")
    return images


def select_representative_images(images: list[str], count: int, offset: int = 0) -> list[str]:
    """Select representative images evenly spaced from the list.

    Skips the first few images (often title slides) using offset.
    """
    if not images or count <= 0:
        return []
    # Filter out very small images (likely icons) by name pattern
    # Hash-named images from MinerU are all valid content images
    pool = images[offset:] if offset < len(images) else images
    if not pool:
        return []
    if len(pool) <= count:
        return pool
    # Evenly sample
    step = len(pool) / count
    selected = [pool[int(i * step)] for i in range(count)]
    return selected


def process_detail_files() -> int:
    """Inject ::figure directives into detail files."""
    changes = 0
    for md_file in sorted(DETAIL_DIR.glob("ppt-*.md")):
        content = md_file.read_text(encoding="utf-8")

        # Skip if already has figure directives
        if "::figure{" in content:
            continue

        # Extract chapter number from filename (ppt-{X.Y}.md)
        match = re.match(r"ppt-(\d+)\.\d+\.md", md_file.name)
        if not match:
            continue
        chapter = int(match.group(1))

        images = get_chapter_images(chapter)
        if not images:
            continue

        # Select representative images (skip first 5 to avoid title slides)
        selected = select_representative_images(images, MAX_PER_DETAIL, offset=5)
        if not selected:
            continue

        # Build figure directives block
        fig_block = "\n:::note{label=课件示意图}\n"
        fig_block += "以下示意图摘自王锋老师课堂讲授 PPT，配合本节内容阅读。\n\n"
        for i, img_path in enumerate(selected, 1):
            fig_block += f'::figure{{src="{img_path}" alt="课件示意图 {i}" caption="课件示意图 {i}"}}\n'
        fig_block += ":::\n\n"

        # Insert after the H1 title line
        lines = content.split("\n")
        insert_idx = 1  # After first line (H1)
        # Find the first non-empty line after H1
        while insert_idx < len(lines) and not lines[insert_idx].strip():
            insert_idx += 1

        new_lines = lines[:insert_idx] + [fig_block.rstrip()] + lines[insert_idx:]
        new_content = "\n".join(new_lines)

        rel_path = md_file.relative_to(ROOT)
        if DRY_RUN:
            print(f"  [dry-run] would update: {rel_path} (+{len(selected)} images)")
        else:
            md_file.write_text(new_content, encoding="utf-8")
            print(f"  updated: {rel_path} (+{len(selected)} images)")
        changes += 1

    return changes


def process_example_files() -> int:
    """Inject ::figure directives into example files."""
    changes = 0
    for md_file in sorted(EXAMPLES_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")

        # Skip if already has figure directives
        if "::figure{" in content:
            continue

        # Extract chapter from path: examples/chemistry/ch{XX}/...
        path_parts = md_file.parts
        ch_match = re.search(r"ch(\d+)", str(md_file))
        if not ch_match:
            continue
        chapter = int(ch_match.group(1))

        # Try homework PPT images first (more relevant to examples)
        images = get_hw_images_for_chapter(chapter)
        if not images:
            # Fall back to lecture PPT images
            images = get_chapter_images(chapter)
        if not images:
            continue

        # Select one representative image
        selected = select_representative_images(images, MAX_PER_EXAMPLE, offset=2)
        if not selected:
            continue

        img_path = selected[0]
        directive = f'\n::figure{{src="{img_path}" alt="课件示意图" caption="课件示意图"}}\n'

        # Insert after the :::example directive line
        lines = content.split("\n")
        insert_idx = None
        for i, line in enumerate(lines):
            if line.strip().startswith(":::example"):
                insert_idx = i + 1
                break

        if insert_idx is None:
            # Fallback: insert at the beginning
            insert_idx = 0

        new_lines = lines[:insert_idx] + [directive.rstrip()] + lines[insert_idx:]
        new_content = "\n".join(new_lines)

        rel_path = md_file.relative_to(ROOT)
        if DRY_RUN:
            print(f"  [dry-run] would update: {rel_path}")
        else:
            md_file.write_text(new_content, encoding="utf-8")
            print(f"  updated: {rel_path}")
        changes += 1

    return changes


def main():
    print("=== Chemistry Image Propagation Script ===")
    if DRY_RUN:
        print("  (dry-run mode — no files will be modified)\n")
    print(f"  Max images per detail file: {MAX_PER_DETAIL}")
    print(f"  Max images per example file: {MAX_PER_EXAMPLE}\n")

    # Show available image counts per chapter
    print("Available images per chapter:")
    for ch in sorted(CHAPTER_TO_IMG_DIR.keys()):
        imgs = get_chapter_images(ch)
        print(f"  ch{ch:02d}: {len(imgs)} images")
    print()

    print("Processing detail files (ppt-*.md)...")
    dt_changes = process_detail_files()

    print("\nProcessing example files (EX*.md / HW*.md)...")
    ex_changes = process_example_files()

    total = dt_changes + ex_changes
    print(f"\nDone. {total} files {'would be ' if DRY_RUN else ''}updated.")
    print(f"  Detail files: {dt_changes}")
    print(f"  Example files: {ex_changes}")


if __name__ == "__main__":
    main()
