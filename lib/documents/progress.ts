import type { DocumentSection, DocumentStatus } from "./types";

export function countDoneSections(sections: readonly Pick<DocumentSection, "status">[]): number {
  return sections.filter((section) => section.status === "done").length;
}

export function currentWritingSection<T extends Pick<DocumentSection, "status">>(
  sections: readonly T[],
): T | undefined {
  return sections.find((section) => section.status === "streaming");
}

export function documentProgressRatio(doneCount: number, total: number): number {
  if (!(total > 0) || !Number.isFinite(doneCount) || !Number.isFinite(total)) return 0;
  return Math.min(1, Math.max(0, doneCount / total));
}

/** 卡片与查看器共用的「N / M 节」文案；两侧斜杠带空格。 */
export function formatSectionProgress(doneCount: number, total: number): string {
  if (!(total > 0)) return "";
  return `${doneCount} / ${total} 节`;
}

export function documentCardHeading(input: {
  title: string;
  inFlight: boolean;
  done: boolean;
  errored: boolean;
  status?: DocumentStatus;
  sectionCount: number;
}): string {
  const title = input.title.trim() || "未命名文档";
  if (input.errored) return "文档生成失败";
  const planning =
    input.inFlight &&
    (input.status === "outlining" || input.status === "idle" || input.sectionCount === 0);
  if (planning) return `正在规划章节：${title}…`;
  if (input.inFlight) return `正在撰写：${title}…`;
  if (input.done) return `文档已就绪：${title}`;
  return `文档未完成：${title}`;
}
