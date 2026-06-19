import type { MediaManifest, VideoEntry } from "@/lib/content/types";
import type { SubjectId } from "@/lib/types/content";
import { generatedVideos } from "./media.generated";
import { chemistryVideos } from "./media.chemistry.generated";

/**
 * 视频媒体清单。概率论等条目由 manim/render.py 写入 media.generated.ts；
 * 有机化学条目由 manim/render_chemistry.py 写入 media.chemistry.generated.ts，
 * 两份清单在此合并。src 为相对 public 的路径。
 */
export const mediaManifest: MediaManifest = {
  videos: [...generatedVideos, ...chemistryVideos],
};

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
