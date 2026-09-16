import { create } from "zustand";

// 「引用到对话」暂存区（不持久化）。
//
// 与 useChatUI.quotedText 是两回事：quotedText 是划词「引用自当前页面」的单条文本；
// 这里是用户主动挑选的一批用户笔记 / 复习卡，发送时会被 ChatInput 转成 markdown 附件。
// 刷新页面即清空 —— 草稿态不值得落盘。

export type ComposerCitationKind = "user-note" | "review-card";

export interface ComposerCitation {
  /** 稳定 id：`note:${noteId}` 或 `card:${cardId}`，用于去重与移除。 */
  id: string;
  kind: ComposerCitationKind;
  /** noteId 或 cardId。 */
  sourceId: string;
  title: string;
  markdown: string;
}

/** 用户笔记的引用 id（与 remove 联动时必须与此一致）。 */
export function userNoteCitationId(noteId: string): string {
  return `note:${noteId}`;
}

/** 复习卡的引用 id。 */
export function reviewCardCitationId(cardId: string): string {
  return `card:${cardId}`;
}

interface ComposerCitationsState {
  citations: ComposerCitation[];
  /** 追加引用；按 id 去重（已存在的跳过），保持插入顺序。 */
  addCitations: (items: ComposerCitation[]) => void;
  removeCitation: (id: string) => void;
  clearCitations: () => void;
}

export const useComposerCitations = create<ComposerCitationsState>((set) => ({
  citations: [],

  addCitations: (items) =>
    set((s) => {
      const seen = new Set(s.citations.map((c) => c.id));
      const added: ComposerCitation[] = [];
      for (const item of items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        added.push(item);
      }
      return added.length > 0 ? { citations: [...s.citations, ...added] } : s;
    }),

  removeCitation: (id) =>
    set((s) => {
      const citations = s.citations.filter((c) => c.id !== id);
      return citations.length === s.citations.length ? s : { citations };
    }),

  clearCitations: () => set((s) => (s.citations.length === 0 ? s : { citations: [] })),
}));
