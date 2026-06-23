import type { MediaManifest, VideoEntry } from "@/lib/content/types";
import type { SubjectId } from "@/lib/types/content";
import { generatedVideos } from "./media.generated";
import { chemistryVideos } from "./media.chemistry.generated";
import { physicsVideos } from "./media.physics.generated";

/**
 * 视频媒体清单。概率论等条目由 manim/render.py 写入 media.generated.ts；
 * 有机化学条目由 manim/render_chemistry.py 写入 media.chemistry.generated.ts；
 * 大学物理条目由 manim/render_physics.py 写入 media.physics.generated.ts，
 * 三份清单在此合并。src 为相对 public 的路径。
 */
export const mediaManifest: MediaManifest = {
  videos: [...generatedVideos, ...chemistryVideos, ...physicsVideos],
};

// 防御：视频 id 必须全局唯一。getVideo 与内联 ::video{id=...} 均按裸 id 查找；
// 跨学科复用同一 id 会静默返回错视频，这里在模块加载时立即抛错。
(() => {
  const seen = new Set<string>();
  for (const v of mediaManifest.videos) {
    if (seen.has(v.id)) {
      throw new Error(`[media] 重复的视频 id: "${v.id}"（视频 id 必须全局唯一）`);
    }
    seen.add(v.id);
  }
})();

export function getVideo(id?: string | null): VideoEntry | undefined {
  if (!id) return undefined;
  return mediaManifest.videos.find((v) => v.id === id);
}

export function getVideosForSection(
  subjectId: SubjectId,
  chapterId: string,
  sectionId: string,
): VideoEntry[] {
  return mediaManifest.videos.filter(
    (v) =>
      v.subjectId === subjectId &&
      v.chapterId === chapterId &&
      v.sectionId === sectionId,
  );
}
