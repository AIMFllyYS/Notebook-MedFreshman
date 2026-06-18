// 内容模型类型定义 —— 章 / 小节树，驱动左侧导航、笔记加载与 AI 工具。

import type { SubjectId } from "@/lib/types/content";

export type ContentStatus = "stub" | "draft" | "done";

export interface SectionRef {
  /** 小节 id，同时也是 md 文件名，如 "1.2" -> content/chapters/ch01/1.2.md */
  id: string;
  /** 小节标题，如 "事件间的关系与运算" */
  title: string;
  /** 一句话摘要，供大纲与 AI 工具快速了解 */
  summary?: string;
  /** 内容完成度 */
  status?: ContentStatus;
  /** 挂载的视频 id（指向 media-manifest） */
  videoIds?: string[];
  /** 挂载的交互组件 id（指向 interactives/registry） */
  interactiveIds?: string[];
}

export interface ChapterRef {
  /** 章 id，如 "ch01" */
  id: string;
  /** 章序号 */
  number: number;
  /** 章标题，如 "随机事件与概率" */
  title: string;
  /** 一句话摘要 */
  summary?: string;
  /** 来源录音逐字稿文件名（docs/ 下） */
  recordings?: string[];
  sections: SectionRef[];
}

export interface Manifest {
  course: string;
  chapters: ChapterRef[];
}

/** 媒体清单：视频条目 */
export interface VideoEntry {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  sectionId: string;
  title: string;
  /** 相对 public 的路径，如 /media/videos/ch01/1.4-gudian.mp4 */
  src: string;
  poster?: string;
  /** 时长（秒），可选 */
  duration?: number;
  description?: string;
  /** 视频配套讲稿（KP md 原文），在视频卡片下方折叠区展示 */
  scriptMd?: string;
}

export interface MediaManifest {
  videos: VideoEntry[];
}
