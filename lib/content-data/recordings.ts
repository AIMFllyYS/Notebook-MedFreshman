// 课堂录音单点声明：一讲写一次，recording（rec-XX）与 summary（sum-XX）两个板块的 items 自动派生。
// 新增一讲：在 {subject}-lectures.ts 追加 { id, title }，放 rec-XX.md / sum-XX.md 即可。
import type { ContentItem } from '@/lib/types/content';

export interface LectureMeta {
  /** 讲次编号，不含 rec-/sum- 前缀；两位数以内自动补零（"7" → rec-07），也允许 "100"。 */
  id: string;
  /** 录音条目标题，如「第七讲·机械波与平面简谐波」。 */
  title: string;
  /** 纪要标题；缺省与 title 相同。部分学科历史上写成「第七讲纪要·…」，可在此显式给出。 */
  summaryTitle?: string;
  /** 该讲是否有课堂纪要；缺省 true。为 false 时不生成 sum-XX。 */
  hasSummary?: boolean;
  status?: ContentItem['status'];
  /** 源文件名（飞书逐字稿 .txt / 智能纪要 .docx），仅供内容生产脚本追溯，不进入 UI。 */
  source?: { transcript?: string | string[]; minutes?: string };
}

export function lectureNumber(id: string): string {
  return /^\d+$/.test(id) ? id.padStart(2, '0') : id;
}

export function recordingId(l: LectureMeta): string {
  return `rec-${lectureNumber(l.id)}`;
}

export function summaryId(l: LectureMeta): string {
  return `sum-${lectureNumber(l.id)}`;
}

export function recordingItems(lectures: readonly LectureMeta[]): ContentItem[] {
  return lectures.map((l) => ({
    id: recordingId(l),
    title: l.title,
    type: 'document',
    status: l.status ?? 'done',
  }));
}

export function summaryItems(lectures: readonly LectureMeta[]): ContentItem[] {
  return lectures
    .filter((l) => l.hasSummary !== false)
    .map((l) => ({
      id: summaryId(l),
      title: l.summaryTitle ?? l.title,
      type: 'document',
      status: l.status ?? 'done',
    }));
}

/** 全部 rec-XX id，供题库校验脚本等按 manifest 而非手抄白名单取用。 */
export function recordingIds(lectures: readonly LectureMeta[]): string[] {
  return lectures.map(recordingId);
}
