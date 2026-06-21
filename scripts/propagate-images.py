"""
Propagate recovered MinerU images into physics example and detail markdown files.

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

# Heading keywords that identify which detail section an image belongs to
SECTION_KEYWORDS = {
    "11.2": ["衍射", "单缝衍射", "光栅衍射"],
    "11.1": ["干涉", "双缝", "杨氏", "薄膜", "劈尖", "牛顿环"],
    "11.3": ["偏振", "马吕斯"],
    "10.1": ["折射", "反射", "几何光学基础", "全反射"],
    "10.2": ["透镜", "成像公式"],
    "10.3": ["放大镜", "显微镜", "望远镜", "光学仪器"],
    "10.4": ["光的本性"],
    "12.1": ["黑体", "光电效应", "辐射", "普朗克"],
    "12.2": ["氢原子", "光谱", "能级", "玻尔"],
    "12.3": ["德布罗意", "不确定", "波粒二象"],
    "12.4": ["薛定谔", "量子力学基础", "波函数"],
    "13.1": ["原子核", "核力", "结合能", "核结构"],
    "13.2": ["衰变", "放射性", "半衰期", "核反应"],
    "14.1": ["X射线"],
    "14.2": ["激光", "受激辐射"],
    "5.1": ["分子动理论", "理想气体", "压强公式", "能量公式", "自由度"],
    "5.2": ["速率分布", "麦克斯韦", "自由程", "表面张力", "表面现象", "毛细"],
    "3.1": ["简谐振动", "简谐运动", "振幅", "弹簧振子"],
    "3.2": ["合成", "拍", "同方向"],
    "3.3": ["阻尼", "受迫", "共振"],
    "4.1": ["行波", "平面波", "波函数", "简谐波"],
    "4.2": ["能量", "惠更斯", "多普勒"],
    "4.3": ["驻波", "叠加"],
}


def build_figure_map() -> dict[str, list[str]]:
    """Build mapping from figure IDs (e.g. '8-4') to image paths."""
    fig_map: dict[str, list[str]] = {}

    for md_file in sorted(RAW_DIR.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        lines = content.split("\n")

        image_positions: list[tuple[int, str]] = []
        for i, line in enumerate(lines):
            img_match = re.search(r'!\[[^\]]*\]\(([^)]+)\)', line)
            if img_match:
                image_positions.append((i, img_match.group(1)))

        for i, line in enumerate(lines):
            fig_refs = re.findall(r'图\s*(\d+)-(\d+)', line)
            for ch, num in fig_refs:
                fig_id = f"{ch}-{num}"
                if fig_id not in fig_map:
                    fig_map[fig_id] = []

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


def build_section_image_map() -> dict[str, list[str]]:
    """Build mapping from detail file ID to list of image paths."""
    section_images: dict[str, list[str]] = {}

    for md_file in sorted(RAW_DIR.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        lines = content.split("\n")

        fname = md_file.stem
        ch_match = re.match(r'(\d+)', fname)
        if not ch_match:
            continue
        ch_num = ch_match.group(1)

        # Find all headings and images
        headings: list[tuple[int, str]] = []
        images: list[tuple[int, str]] = []

        for i, line in enumerate(lines):
            heading_match = re.match(r'^(#{1,3})\s+(.+)', line)
            if heading_match:
                headings.append((i, heading_match.group(2).strip()))
            img_match = re.search(r'!\[[^\]]*\]\(([^)]+)\)', line)
            if img_match:
                images.append((i, img_match.group(1)))

        if not images:
            continue

        # For each image, find its section
        for img_line, img_path in images:
            # Find the closest preceding heading
            section_title = ""
            for h_line, h_text in reversed(headings):
                if h_line < img_line:
                    section_title = h_text
                    break

            # Try keyword matching
            matched_detail = None
            for detail_id, keywords in SECTION_KEYWORDS.items():
                if not detail_id.startswith(ch_num + "."):
                    continue
                for kw in keywords:
                    if kw in section_title:
                        matched_detail = detail_id
                        break
                if matched_detail:
                    break

            # Fallback: if no keyword match, use position-based splitting
            if not matched_detail:
                # Find all detail files for this chapter
                detail_files = sorted(DETAIL_DIR.glob(f"{ch_num}.*.md"))
                if len(detail_files) >= 2:
                    # Split images evenly across sections
                    total_images = len(images)
                    img_idx = images.index((img_line, img_path))
                    section_count = len(detail_files)
                    section_idx = min(img_idx * section_count // total_images, section_count - 1)
                    matched_detail = detail_files[section_idx].stem

            if matched_detail:
                if matched_detail not in section_images:
                    section_images[matched_detail] = []
                if img_path not in section_images[matched_detail]:
                    section_images[matched_detail].append(img_path)

    return section_images


def process_example_files(fig_map: dict[str, list[str]]) -> int:
    """Scan example files and insert figure directives."""
    changes = 0

    for md_file in sorted(EXAMPLES_DIR.rglob("*.md")):
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
            if fig_id in inserted:
                continue
            if fig_id not in fig_map or not fig_map[fig_id]:
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


def process_detail_files(fig_map: dict[str, list[str]]) -> int:
    """Scan detail files and insert figure directives."""
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


def process_detail_files_from_sections(section_images: dict[str, list[str]]) -> int:
    """Inject ::figure into detail files based on section-image mapping."""
    if not DETAIL_DIR.exists():
        return 0

    changes = 0

    for detail_id, image_paths in sorted(section_images.items()):
        detail_file = DETAIL_DIR / f"{detail_id}.md"
        if not detail_file.exists():
            continue

        content = detail_file.read_text(encoding="utf-8")

        if "::figure{" in content or "![" in content:
            continue

        lines = content.split("\n")
        new_lines = list(lines)

        # Find heading positions (## level)
        heading_positions = []
        for i, line in enumerate(new_lines):
            if re.match(r'^##\s', line):
                heading_positions.append(i)

        inserted = 0

        if len(heading_positions) >= 2:
            # Distribute images across sections
            for idx, img_path in enumerate(image_paths[:6]):
                section_idx = min(idx * len(heading_positions) // max(len(image_paths), 1), len(heading_positions) - 1)
                insert_at = heading_positions[section_idx]

                # Find first blank line after heading
                for j in range(insert_at + 1, min(len(new_lines), insert_at + 8)):
                    if new_lines[j].strip() == "":
                        insert_at = j
                        break
                    # Don't insert inside callout
                    if re.match(r'^:::', new_lines[j]):
                        break

                # Check we're not inside a callout
                in_callout = 0
                for j in range(insert_at + 1):
                    if re.match(r'^:::(?!:)', new_lines[j]):
                        in_callout += 1
                    if re.match(r'^:::$', new_lines[j]):
                        in_callout -= 1
                if in_callout > 0:
                    continue

                img_ref = f'\n::figure{{src="{img_path}" alt="" caption=""}}\n'
                if img_path not in content:
                    new_lines.insert(insert_at + 1, img_ref)
                    inserted += 1
                    # Recalculate heading positions
                    heading_positions = [h + 1 if h > insert_at else h for h in heading_positions]
        elif heading_positions:
            # Single section: insert all after first heading
            insert_at = heading_positions[0]
            for j in range(insert_at + 1, min(len(new_lines), insert_at + 5)):
                if new_lines[j].strip() == "":
                    insert_at = j
                    break

            for img_path in image_paths[:4]:
                if img_path not in content:
                    img_ref = f'\n::figure{{src="{img_path}" alt="" caption=""}}\n'
                    new_lines.insert(insert_at + 1, img_ref)
                    inserted += 1
                    insert_at += 1

        if inserted > 0:
            new_content = "\n".join(new_lines)
            if DRY_RUN:
                print(f"  [dry-run] would update: {detail_file.relative_to(ROOT)} ({inserted} images)")
            else:
                detail_file.write_text(new_content, encoding="utf-8")
                print(f"  updated: {detail_file.relative_to(ROOT)} ({inserted} images)")
            changes += 1

    return changes


def main():
    print("=== Image Propagation Script ===")
    if DRY_RUN:
        print("  (dry-run mode — no files will be modified)\n")

    print("Building figure map from raw study guides...")
    fig_map = build_figure_map()
    print(f"  Found {len(fig_map)} unique figure IDs with images")

    print("\nBuilding section-image mapping...")
    section_images = build_section_image_map()
    total_imgs = sum(len(imgs) for imgs in section_images.values())
    print(f"  Mapped {total_imgs} images to {len(section_images)} detail sections")
    for sid, imgs in sorted(section_images.items()):
        print(f"    {sid}: {len(imgs)} images")

    print("\nProcessing example files...")
    ex_changes = process_example_files(fig_map)

    print("\nProcessing detail files (figure ID)...")
    dt_changes = process_detail_files(fig_map)

    print("\nProcessing detail files (section mapping)...")
    sec_changes = process_detail_files_from_sections(section_images)

    total = ex_changes + dt_changes + sec_changes
    print(f"\nDone. {total} files {'would be ' if DRY_RUN else ''}updated.")


if __name__ == "__main__":
    main()
