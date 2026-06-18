import type { MediaManifest, VideoEntry } from "@/lib/content/types";
import type { SubjectId } from "@/lib/types/content";
import { generatedVideos } from "./media.generated";

/**
 * 视频媒体清单。条目由 manim/render.py 渲染后写入 media.generated.ts。
 * src 为相对 public 的路径，例如 /media/videos/ch01/ch01-1.4-classical.mp4
 */
export const mediaManifest: MediaManifest = {
  videos: generatedVideos,
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
