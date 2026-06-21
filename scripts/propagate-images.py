"""
Propagate recovered MinerU images into physics example markdown files.

Strategy:
1. Parse raw study-guide markdown to build a map of 图X-Y -> image paths
2. Scan example files for references like "如图 X-Y" / "图X-Y所示"
3. Insert ::figure directives after the first line referencing each figure

Usage:
    python scripts/propagate-images.py [--dry-run]
"""

import os
import re
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "content" / "_raw" / "physics" / "study-guide"
EXAMPLES_DIR = ROOT / "content" / "examples" / "physics"
DETAIL_DIR = ROOT / "content" / "physics" / "detail"

DRY_RUN = "--dry-run" in sys.argv


def build_figure_map() -> dict[str, list[str]]:
    """Build mapping from figure IDs (e.g. '8-4') to image paths.
    
    Approach: first collect all image positions, then for each figure
    reference, find the closest image within 25 lines.
    """
    fig_map: dict[str, list[str]] = {}

    for md_file in sorted(RAW_DIR.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        lines = content.split("\n")

        # Pre-index all image positions
        image_positions: list[tuple[int, str]] = []
        for i, line in enumerate(lines):
            img_match = re.search(r'!\[[^\]]*\]\(([^)]+)\)', line)
            if img_match:
                image_positions.append((i, img_match.group(1)))

        # For each figure reference, find closest image
        for i, line in enumerate(lines):
            fig_refs = re.findall(r'图\s*(\d+)-(\d+)', line)
            for ch, num in fig_refs:
                fig_id = f"{ch}-{num}"
                if fig_id not in fig_map:
                    fig_map[fig_id] = []

                # Find closest image within 25 lines
                best_img = None
                best_dist = 26
                for img_line, img_path in image_positions:
                    dist = abs(img_line - i)
                    if dist < best_dist:
                        best_dist = dist
                        best_img = img_path

                if best_img and best_img not in fig_map[fig_id]:
                    fig_map[fig_id].append(best_img)

    return fig_map


def process_example_files(fig_map: dict[str, list[str]]) -> int:
    """Scan example files and insert figure directives for referenced figures."""
    changes = 0

    for md_file in sorted(EXAMPLES_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")

        # Skip if already has image/figure references
        if "::figure{" in content or "![" in content:
            continue

        # Find figure references
        fig_refs = re.findall(r'(?:如)?图\s*(\d+)-(\d+)', content)
        if not fig_refs:
            continue

        new_content = content
        inserted = set()

        for ch, num in fig_refs:
            fig_id = f"{ch}-{num}"
            if fig_id in inserted:
                continue
            if fig_id not in fig_map or not fig_map[fig_id]:
                continue

            img_path = fig_map[fig_id][0]
            directive = f'\n::figure{{src="{img_path}" alt="图{fig_id}" caption="图{fig_id}"}}\n'

            # Insert after the first line containing this figure reference
            pattern = rf'(.*(?:如)?图\s*{ch}-{num}.*)'
            match = re.search(pattern, new_content)
            if match:
                insert_pos = match.end()
                new_content = new_content[:insert_pos] + directive + new_content[insert_pos:]
                inserted.add(fig_id)

        if new_content != content:
            rel_path = md_file.relative_to(ROOT)
            if DRY_RUN:
                print(f"  [dry-run] would update: {rel_path}")
            else:
                md_file.write_text(new_content, encoding="utf-8")
                print(f"  updated: {rel_path}")
            changes += 1

    return changes


def process_detail_files(fig_map: dict[str, list[str]]) -> int:
    """Scan detail files and insert figure directives for referenced figures."""
    if not DETAIL_DIR.exists():
        return 0

    changes = 0

    for md_file in sorted(DETAIL_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")

        if "::figure{" in content or "![" in content:
            continue

        fig_refs = re.findall(r'(?:如)?图\s*(\d+)-(\d+)', content)
        if not fig_refs:
            continue

        new_content = content
        inserted = set()

        for ch, num in fig_refs:
            fig_id = f"{ch}-{num}"
            if fig_id in inserted or fig_id not in fig_map or not fig_map[fig_id]:
                continue

            img_path = fig_map[fig_id][0]
            directive = f'\n::figure{{src="{img_path}" alt="图{fig_id}" caption="图{fig_id}"}}\n'

            pattern = rf'(.*(?:如)?图\s*{ch}-{num}.*)'
            match = re.search(pattern, new_content)
            if match:
                insert_pos = match.end()
                new_content = new_content[:insert_pos] + directive + new_content[insert_pos:]
                inserted.add(fig_id)

        if new_content != content:
            rel_path = md_file.relative_to(ROOT)
            if DRY_RUN:
                print(f"  [dry-run] would update: {rel_path}")
            else:
                md_file.write_text(new_content, encoding="utf-8")
                print(f"  updated: {rel_path}")
            changes += 1

    return changes


def main():
    print("=== Image Propagation Script ===")
    if DRY_RUN:
        print("  (dry-run mode — no files will be modified)\n")

    print("Building figure map from raw study guides...")
    fig_map = build_figure_map()
    print(f"  Found {len(fig_map)} unique figure IDs with images")
    for fig_id, paths in sorted(fig_map.items(), key=lambda x: (int(x[0].split('-')[0]), int(x[0].split('-')[1]))):
        print(f"    图{fig_id}: {len(paths)} image(s)")

    print("\nProcessing example files...")
    ex_changes = process_example_files(fig_map)

    print("\nProcessing detail files...")
    dt_changes = process_detail_files(fig_map)

    total = ex_changes + dt_changes
    print(f"\nDone. {total} files {'would be ' if DRY_RUN else ''}updated.")


if __name__ == "__main__":
    main()
