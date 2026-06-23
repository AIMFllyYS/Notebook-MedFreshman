#!/usr/bin/env python
"""
Manim 渲染管线。

约定：每个场景模块（manim/chapters/<chapter>/*.py）在模块顶层导出一个
REGISTER 列表，描述要产出的视频：

    REGISTER = [
        {
            "scene": "SampleSpaceScene",   # 场景类名
            "id": "ch01-1.1-sample-space", # 全局唯一视频 id（= 输出文件名）
            "chapterId": "ch01",
            "sectionId": "1.1",
            "title": "样本空间与事件",
            "description": "用掷骰子直观展示样本空间 Ω 与事件 A。",
        },
    ]

用法：
    python manim/render.py                 # 渲染所有尚未生成的视频
    python manim/render.py --chapter ch01  # 仅处理 ch01
    python manim/render.py --force         # 强制重渲
    python manim/render.py --quality h     # l/m/h/k 画质（默认 m）

渲染产物复制到 public/media/videos/<chapterId>/<id>.mp4，
并把全部已存在视频写入 content/media.generated.ts（供前端读取）。
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

# Windows 控制台默认 GBK，含 ✓/● 等字符的 print 会触发 UnicodeEncodeError 而崩溃；
# 强制 stdout/stderr 使用 UTF-8。
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
SCENES_DIR = ROOT / "manim" / "chapters"
MEDIA_OUT = ROOT / "manim" / "media"
PUBLIC_VIDEOS = ROOT / "public" / "media" / "videos"
GENERATED_TS = ROOT / "lib" / "content-data" / "media.generated.ts"


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
    """返回适合 MiKTeX latex 运行的环境变量字典。

    Python 3.12 路径（AppData\\Local\\Programs\\Python\\Python312\\）含有与
    MiKTeX VC++ Runtime 冲突的 DLL，导致 latex.exe 以 0xC0000135 崩溃。
    此函数从 PATH 中剔除已知冲突目录，确保 MiKTeX bin 目录排在最前面。
    """
    miktex_bin = r"C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64"
    env = os.environ.copy()
    path_parts = env.get("PATH", "").split(os.pathsep)
    # 把 MiKTeX 放到最前面，剔除 Python 3.12 目录（已知与 latex.exe 冲突）
    cleaned = [miktex_bin]
    skip_keywords = [
        r"Python\Python312",
        r"Python312",
    ]
    for p in path_parts:
        if p == miktex_bin:
            continue
        if any(kw.lower() in p.lower() for kw in skip_keywords):
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
        "// ⚠️ 本文件由 manim/render.py 自动生成，请勿手动编辑。\n"
        f"export const generatedVideos: VideoEntry[] = {body};\n",
        encoding="utf-8",
    )
    print(f"\n✓ 已写入 {GENERATED_TS.relative_to(ROOT)}（{len(clean)} 个视频）")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapter", default=None, help="仅处理某章，如 ch01")
    ap.add_argument("--force", action="store_true", help="强制重渲已存在的视频")
    ap.add_argument("--quality", default="m", choices=["l", "m", "h", "k"])
    args = ap.parse_args()

    PUBLIC_VIDEOS.mkdir(parents=True, exist_ok=True)
    all_entries: list[dict] = []

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
                    continue
                shutil.copyfile(out, dest)
                print(f"  ✓ {e['id']} -> {dest.relative_to(ROOT)}")
            if dest.exists():
                e["src"] = f"/media/videos/{e['chapterId']}/{e['id']}.mp4"
                all_entries.append(e)

    # 合并：补齐其它章已存在但本次未处理的视频，避免覆盖丢失
    if args.chapter:
        for py in discover_modules(None):
            for e in load_register(py):
                if e["chapterId"] == args.chapter:
                    continue
                dest = PUBLIC_VIDEOS / e["chapterId"] / f"{e['id']}.mp4"
                if dest.exists():
                    e["src"] = f"/media/videos/{e['chapterId']}/{e['id']}.mp4"
                    all_entries.append(e)

    # 去重（按 id）
    seen: dict[str, dict] = {}
    for e in all_entries:
        seen[e["id"]] = e
    write_generated(list(seen.values()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
