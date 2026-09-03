// 板块能力与 itemId → key 推导的唯一实现。
// page.tsx（例题预读）、loader.ts（例题目录）、store.ts（Quiz / 视频 / 交互 key）统一调用这里，
// 不要再按 categoryId 字面量写 if 分支。
import type { Category, CategoryCapability } from "@/lib/types/content";

export type CategoryLike = Pick<Category, "id" | "capabilities" | "keyStrategy">;

export interface ContentKey {
  /** 例题目录第一层 / 视频·交互查找用的章 id */
  chapterId: string;
  /** 例题目录第二层 / 视频·交互查找用的节 id */
  sectionId: string;
  /** content/quiz/{subject}/{quizId}.json */
  quizId: string;
}

export const EMPTY_KEY: ContentKey = { chapterId: "", sectionId: "", quizId: "" };

export function hasCapability(cat: CategoryLike | undefined | null, cap: CategoryCapability): boolean {
  return !!cat?.capabilities?.includes(cap);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 由板块声明的 keyStrategy 推导 key；未声明策略或 itemId 不匹配时返回全空。 */
export function deriveContentKey(cat: CategoryLike | undefined | null, itemId: string): ContentKey {
  if (!cat?.keyStrategy || !itemId) return EMPTY_KEY;
  switch (cat.keyStrategy) {
    case "section-dot": {
      const n = parseInt(itemId.split(".")[0], 10);
      if (Number.isNaN(n)) return EMPTY_KEY;
      const chapterId = `ch${pad2(n)}`;
      return { chapterId, sectionId: itemId, quizId: chapterId };
    }
    case "item":
      return { chapterId: itemId, sectionId: itemId, quizId: itemId };
    case "category-item":
      return { chapterId: cat.id, sectionId: itemId, quizId: itemId };
    case "chapter-prefix": {
      const m = itemId.match(/^(?:tb-)?(ch\d{2})/);
      const sectionId = itemId.startsWith("ch") ? itemId.split("-")[0] : itemId;
      return { chapterId: cat.id, sectionId, quizId: m ? `tb-${m[1]}` : "" };
    }
    default:
      return EMPTY_KEY;
  }
}

/** 例题 key：仅当板块声明 examples 能力时才推导。 */
export function deriveExampleKeyFor(cat: CategoryLike | undefined | null, itemId: string): Pick<ContentKey, "chapterId" | "sectionId"> {
  if (!hasCapability(cat, "examples")) return { chapterId: "", sectionId: "" };
  const { chapterId, sectionId } = deriveContentKey(cat, itemId);
  return { chapterId, sectionId };
}

/** 右侧 Quiz / 视频 / 交互 Tab 用的 store 字段：无 quiz 与 media 能力时全空。 */
export function deriveActiveKeys(cat: CategoryLike | undefined | null, itemId: string): { activeChapterId: string; activeSectionId: string } {
  const quiz = hasCapability(cat, "quiz");
  const media = hasCapability(cat, "media");
  if (!quiz && !media) return { activeChapterId: "", activeSectionId: "" };
  const key = deriveContentKey(cat, itemId);
  return {
    activeChapterId: key.quizId,
    activeSectionId: media ? key.sectionId : "",
  };
}
