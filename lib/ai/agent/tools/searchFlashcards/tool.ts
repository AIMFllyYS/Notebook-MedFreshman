import { tool } from "ai";
import { z } from "zod";
import type { FlashcardHit, SearchFlashcardsOutput } from "@/lib/ai/agent/tools/searchFlashcards/types";
import {
  filterCardsBySubject,
  findFlashcard,
  listFlashcardLines,
  searchFlashcardCatalog,
} from "@/lib/ai/agent/tools/memoryCatalog";
import { subjectLabel } from "@/lib/notes/userNote";
import {
  dedupeByContextKey,
  toText,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";

function toHits(cards: ReturnType<typeof searchFlashcardCatalog>): FlashcardHit[] {
  return cards.map((card) => ({
    id: card.id,
    title: card.front.trim() || card.originalText.trim() || "复习闪卡",
    snippet: card.snippet,
    subjectId: card.subjectId,
    sourceLabel: card.sourceLabel,
  }));
}

function windowOnlyMessage(): SearchFlashcardsOutput {
  return {
    text: "窗内笔记对话请只整理当前这篇笔记。查找闪卡请到右侧主对话。",
    hits: [],
  };
}

export function createSearchFlashcardsTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      "查找学生已有的复习闪卡（复用复习板，不另开存储）。先列表（id + 正面/原文片段），需要引用分析某一张时再传 id 取正反面与原文。可按科目过滤。主对话在学生提到闪卡、要对照旧卡或分析记得对不对时主动调用。窗内笔记对话不要翻整库。不要用这个工具写入新卡（写入走 proposeMemory + commitFlashcards）。",
    inputSchema: z.object({
      query: z.string().optional().describe("检索短语，如「长骨」「被覆上皮」。空查询则列出闪卡。"),
      id: z.string().optional().describe("闪卡 id，只取这一张全文做引用分析。"),
      subjectId: z.string().optional().describe("限定科目 id，如 anatomy、histology。"),
    }),
    execute: async ({ query, id, subjectId }): Promise<SearchFlashcardsOutput> => {
      if (!(ctx.flashcards?.length) && ctx.editingUserNote && !(ctx.userNotes?.length)) {
        return windowOnlyMessage();
      }
      const catalog = ctx.flashcards ?? [];
      const cardId = id?.trim();
      if (cardId) {
        const card = findFlashcard(catalog, cardId);
        if (!card) {
          const available = listFlashcardLines(catalog).join("\n") || "（目录为空）";
          return { text: `未找到闪卡 id=${cardId}。可先 searchFlashcards 看列表：\n${available}`, hits: [] };
        }
        const title = card.front.trim() || card.originalText.trim() || "复习闪卡";
        return dedupeByContextKey(runtime, "searchFlashcards", {
          text: [
            `【闪卡 ${title} / ${card.id} / ${card.sourceLabel || subjectLabel(card.subjectId)}】`,
            `正面：${card.front || "（空）"}`,
            `背面：${card.back || "（空）"}`,
            `原文：${card.originalText || "（空）"}`,
            card.explanation ? `说明：${card.explanation}` : "",
          ].filter(Boolean).join("\n"),
          contextKey: `flashcard:${card.id}`,
          hits: [{
            id: card.id,
            title,
            snippet: card.originalText || card.back || card.front,
            subjectId: card.subjectId,
            sourceLabel: card.sourceLabel,
          }],
        });
      }

      const cards = filterCardsBySubject(catalog, subjectId);
      if (!cards.length) {
        return { text: subjectId ? `没有绑定 ${subjectId} 的闪卡。` : "本机没有可查找的闪卡。", hits: [] };
      }
      const q = (query ?? "").trim();
      if (!q) {
        return {
          text: `闪卡 ${cards.length} 张（先看列表，需要哪张再 searchFlashcards(id)）：\n${listFlashcardLines(cards).join("\n")}`,
          hits: toHits(searchFlashcardCatalog(cards, "")),
        };
      }
      const hits = searchFlashcardCatalog(cards, q);
      if (!hits.length) {
        return { text: "未检索到相关闪卡。可换关键词，或 searchFlashcards 先列出。", hits: [] };
      }
      const lines = hits.map((card) => {
        const title = card.front.trim() || card.originalText.trim() || "复习闪卡";
        return `[${title}] (id: ${card.id} / ${card.sourceLabel || subjectLabel(card.subjectId)})\n…${card.snippet}…`;
      });
      lines.push("\n如需引用分析某一张，再调用 searchFlashcards(id)。不要一次展开多张。");
      return {
        text: lines.join("\n\n"),
        hits: toHits(hits),
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
