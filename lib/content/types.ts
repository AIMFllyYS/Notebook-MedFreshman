// 内容模型类型定义 —— 章 / 小节树，驱动左侧导航、笔记加载与 AI 工具。

import type { SubjectId } from "@/lib/types/content";

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
