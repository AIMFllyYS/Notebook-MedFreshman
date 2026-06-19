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
