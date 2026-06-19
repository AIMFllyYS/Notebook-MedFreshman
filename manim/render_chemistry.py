#!/usr/bin/env python
"""
有机化学 Manim 渲染管线（独立于 render.py，互不干扰）。

为什么独立：render.py 的 write_generated 不写 subjectId，且会整体重写
media.generated.ts；为避免破坏概率论视频，本脚本只渲染 manim/chemistry/ 下的
场景，产物落 public/media/videos/chemistry/，并写入**独立**的
content/media.chemistry.generated.ts（条目带 subjectId="chemistry"）。
media.ts 会把两份清单合并。

场景约定：每个 manim/chemistry/<chXX>/*.py 模块顶层导出 REGISTER 列表：
    REGISTER = [{
        "scene": "ClassName", "id": "ch04-4.1-newman",
        "chapterId": "ch04", "sectionId": "4.1",
        "title": "...", "description": "...",
    }]

用法：
    python manim/render_chemistry.py                 # 渲染全部缺失视频
    python manim/render_chemistry.py --chapter ch04  # 仅某章
    python manim/render_chemistry.py --force         # 强制重渲
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
SCENES_DIR = ROOT / "manim" / "chemistry"
MEDIA_OUT = ROOT / "manim" / "media_chemistry"
PUBLIC_VIDEOS = ROOT / "public" / "media" / "videos" / "chemistry"
GENERATED_TS = ROOT / "content" / "media.chemistry.generated.ts"


def discover_modules(chapter: str | None) -> list[Path]:
    if not SCENES_DIR.exists():
        return []
    files: list[Path] = []
    for py in sorted(SCENES_DIR.rglob("*.py")):
        if py.name.startswith("_"):
            continue
        if chapter and chapter not in py.parts:
            continue
        files.append(py)
    return files


def load_register(py: Path) -> list[dict]:
    spec = importlib.util.spec_from_file_location(py.stem, py)
    if not spec or not spec.loader:
        return []
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)  # type: ignore[union-attr]
    except Exception as exc:  # noqa: BLE001
        print(f"  [warn] 无法导入 {py.name}: {exc}")
        return []
    reg = getattr(module, "REGISTER", [])
    for r in reg:
        r["_file"] = str(py)
    return reg


def _clean_env_for_latex() -> dict:
    """MiKTeX bin 置于 PATH 最前，剔除 Python 安装目录（其 DLL 与 latex.exe 冲突）。"""
    miktex_bin = r"C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64"
    env = os.environ.copy()
    path_parts = env.get("PATH", "").split(os.pathsep)
    cleaned = [miktex_bin]
    for p in path_parts:
        if p == miktex_bin:
            continue
        low = p.lower()
        if "python\\python3" in low or low.rstrip("\\").endswith("python3"):
            continue
        cleaned.append(p)
    env["PATH"] = os.pathsep.join(cleaned)
    return env


def render_scene(py: Path, scene: str, vid_id: str, quality: str) -> Path | None:
    cmd = [
        sys.executable, "-m", "manim", "render",
        f"-q{quality}", "-o", vid_id,
        "--media_dir", str(MEDIA_OUT),
        "--no_latex_cleanup",
        str(py), scene,
    ]
    print("  $", " ".join(cmd))
    res = subprocess.run(cmd, cwd=str(ROOT), env=_clean_env_for_latex())
    if res.returncode != 0:
        print(f"  [error] 渲染失败：{scene}")
        return None
    candidates = sorted(
        MEDIA_OUT.glob(f"videos/**/{vid_id}.mp4"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def write_generated(entries: list[dict]) -> None:
    clean = [
        {
            "subjectId": "chemistry",
            "id": e["id"],
            "chapterId": e["chapterId"],
            "sectionId": e["sectionId"],
            "title": e["title"],
            "src": e["src"],
            **({"description": e["description"]} if e.get("description") else {}),
        }
        for e in entries
    ]
    body = json.dumps(clean, ensure_ascii=False, indent=2)
    GENERATED_TS.write_text(
        'import type { VideoEntry } from "@/lib/content/types";\n\n'
        "// ⚠️ 本文件由 manim/render_chemistry.py 自动生成，请勿手动编辑。\n"
        f"export const chemistryVideos: VideoEntry[] = {body};\n",
        encoding="utf-8",
    )
    print(f"\n✓ 已写入 {GENERATED_TS.relative_to(ROOT)}（{len(clean)} 个视频）")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapter", default=None)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--quality", default="m", choices=["l", "m", "h", "k"])
    args = ap.parse_args()

    PUBLIC_VIDEOS.mkdir(parents=True, exist_ok=True)
    all_entries: list[dict] = []
    failed: list[str] = []

    for py in discover_modules(args.chapter):
        reg = load_register(py)
        if not reg:
            continue
        print(f"\n● {py.relative_to(ROOT)}  ({len(reg)} scene)")
        for e in reg:
            dest = PUBLIC_VIDEOS / e["chapterId"] / f"{e['id']}.mp4"
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists() and not args.force:
                print(f"  · 跳过（已存在）{e['id']}")
            else:
                out = render_scene(Path(e["_file"]), e["scene"], e["id"], args.quality)
                if out is None:
                    failed.append(e["id"])
                    continue
                shutil.copyfile(out, dest)
                print(f"  ✓ {e['id']} -> {dest.relative_to(ROOT)}")
            if dest.exists():
                e["src"] = f"/media/videos/chemistry/{e['chapterId']}/{e['id']}.mp4"
                all_entries.append(e)

    # 合并已存在但本次未处理（--chapter 时）的其它章视频
    if args.chapter:
        for py in discover_modules(None):
            for e in load_register(py):
                if e["chapterId"] == args.chapter:
                    continue
                dest = PUBLIC_VIDEOS / e["chapterId"] / f"{e['id']}.mp4"
                if dest.exists():
                    e["src"] = f"/media/videos/chemistry/{e['chapterId']}/{e['id']}.mp4"
                    all_entries.append(e)

    seen: dict[str, dict] = {}
    for e in all_entries:
        seen[e["id"]] = e
    write_generated(list(seen.values()))
    if failed:
        print(f"\n⚠️ 渲染失败 {len(failed)} 个：{', '.join(failed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
