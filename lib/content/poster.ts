import type { VideoEntry } from "@/lib/content/types";

/**
 * 由视频 src 推导静态封面（poster）路径，约定：
 *   /media/videos/<rel>.mp4  →  /media/posters/<rel>.jpg
 * 封面由 scripts/gen-posters.mjs 用 ffmpeg 抽帧生成（与此约定一致），
 * 不写入自动生成的 media.generated.ts，故 render.py 重跑不会破坏。
 *
 * 优先使用条目自带的 poster 字段；否则按约定推导；无法推导时返回 ""。
 * 前端 <img>/<video> 应配合 onError 在封面缺失时回退到占位渐变。
 */
export function videoPoster(v: Pick<VideoEntry, "src" | "poster">): string {
  if (v.poster) return v.poster;
  if (v.src.includes("/media/videos/") && /\.mp4$/i.test(v.src)) {
    return v.src.replace("/media/videos/", "/media/posters/").replace(/\.mp4$/i, ".jpg");
  }
  return "";
}

const VIDEO_CDN_BASE = process.env.NEXT_PUBLIC_VIDEO_CDN_BASE ?? "";

/**
 * 将视频 src 解析为实际播放 URL。
 *
 * 当设置了 NEXT_PUBLIC_VIDEO_CDN_BASE 环境变量时（如 https://cdn.example.com），
 * /media/videos/ch01/foo.mp4 → https://cdn.example.com/media/videos/ch01/foo.mp4
 *
 * 未设置时保持原路径不变（从 public/ 静态目录提供）。
 * 这样视频文件可以从仓库和构建产物中移除，仅托管在 CDN 上，
 * 避免构建环境磁盘空间不足（ENOSPC）。
 */
export function resolveVideoSrc(src: string): string {
  if (!VIDEO_CDN_BASE) return src;
  if (src.startsWith("/media/videos/")) {
    // COS 上路径为 /videos/...（无 media 前缀），去掉 /media 前缀拼接 CDN base
    return VIDEO_CDN_BASE.replace(/\/$/, "") + src.replace("/media/videos/", "/videos/");
  }
  return src;
}
