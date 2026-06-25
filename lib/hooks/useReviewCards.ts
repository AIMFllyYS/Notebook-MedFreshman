import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage, PERSIST_KEYS } from "@/lib/storage/idbStorage";
import type {
  ReviewCard,
  ReviewCardContext,
  RecordCardAI,
  ReviewExport,
} from "@/lib/review/types";

// 复习卡片仓库（IndexedDB 持久化，复用 useArtifacts 范式）。
// 写入路径：addPending（先存原文，绝不丢）→ finalize / markError（后台成卡回填）。
// 预览窗的临时 UI 态（拖拽位置等）不在此持久化。

const genId = () => Math.random().toString(36).slice(2, 11);

interface ReviewCardsState {
  byId: Record<string, ReviewCard>;
  order: string[];
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  /** 立即落库一张 parsing 卡（持有原文），返回卡片 id。 */
  addPending: (originalText: string, ctx: ReviewCardContext) => string;
  /** 后台成卡成功，回填卡片内容并置为 ready。 */
  finalize: (id: string, ai: RecordCardAI, model: string) => void;
  /** 重试成卡：把卡片置回 parsing（清错误）。 */
  markParsing: (id: string) => void;
  /** 后台成卡失败，置为 error（原文仍在，可重试/删除）。 */
  markError: (id: string, message: string) => void;
  /** 删除一张卡。 */
  remove: (id: string) => void;
  /** 取某科目下的卡片（按创建时间倒序，最新在前）。 */
  bySubject: (subjectId: string) => ReviewCard[];
  /** 导出某科目 / 全部为可下载结构。 */
  exportSubject: (subjectId: string) => ReviewExport;
  exportAll: () => ReviewExport;
}

function orderedCards(state: ReviewCardsState): ReviewCard[] {
  return state.order.map((id) => state.byId[id]).filter(Boolean);
}

export const useReviewCards = create<ReviewCardsState>()(
  persist(
    (set, get) => ({
      byId: {},
      order: [],
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      addPending: (originalText, ctx) => {
        const id = genId();
        const card: ReviewCard = {
          id,
          subjectId: ctx.subjectId,
          categoryId: ctx.categoryId,
          itemId: ctx.itemId,
          sourceLabel: ctx.sourceLabel,
          originalText,
          cardType: "qa",
          front: "",
          back: "",
          status: "parsing",
          createdAt: Date.now(),
        };
        set((s) => ({ byId: { ...s.byId, [id]: card }, order: [...s.order, id] }));
        return id;
      },

      finalize: (id, ai, model) =>
        set((s) => {
          const prev = s.byId[id];
          if (!prev) return s;
          return {
            byId: {
              ...s.byId,
              [id]: {
                ...prev,
                cardType: ai.cardType,
                front: ai.front,
                back: ai.back,
                blanks: ai.blanks,
                explanation: ai.explanation,
                status: "ready",
                error: undefined,
                model,
              },
            },
          };
        }),

      markParsing: (id) =>
        set((s) => {
          const prev = s.byId[id];
          if (!prev) return s;
          return { byId: { ...s.byId, [id]: { ...prev, status: "parsing", error: undefined } } };
        }),

      markError: (id, message) =>
        set((s) => {
          const prev = s.byId[id];
          if (!prev) return s;
          return { byId: { ...s.byId, [id]: { ...prev, status: "error", error: message } } };
        }),

      remove: (id) =>
        set((s) => {
          if (!s.byId[id]) return s;
          const byId = { ...s.byId };
          delete byId[id];
          return { byId, order: s.order.filter((x) => x !== id) };
        }),

      bySubject: (subjectId) =>
        orderedCards(get())
          .filter((c) => c.subjectId === subjectId)
          .reverse(),

      exportSubject: (subjectId) => {
        const cards = orderedCards(get()).filter((c) => c.subjectId === subjectId);
        return {
          app: "gailvlun",
          kind: "review-cards",
          version: 1,
          exportedAt: Date.now(),
          scope: "subject",
          subjectId,
          count: cards.length,
          cards,
        };
      },

      exportAll: () => {
        const cards = orderedCards(get());
        return {
          app: "gailvlun",
          kind: "review-cards",
          version: 1,
          exportedAt: Date.now(),
          scope: "all",
          count: cards.length,
          cards,
        };
      },
    }),
    {
      name: PERSIST_KEYS.reviewCards,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ byId: s.byId, order: s.order }),
      onRehydrateStorage: () => (state) => {
        // 水合后把上次未完成的 parsing 卡转为 error（原文仍在，可删/可重试），避免卡死在「解析中」。
        if (state) {
          for (const id of state.order) {
            const c = state.byId[id];
            if (c && c.status === "parsing") {
              state.byId[id] = { ...c, status: "error", error: "上次解析未完成" };
            }
          }
        }
        state?._setHasHydrated(true);
      },
    },
  ),
);
