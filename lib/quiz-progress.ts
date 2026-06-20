// 题目测试成绩本地持久化（localStorage）。
// 交卷评分后，分数「首先确保存储在本地」，随后才展示详细解析；刷新/重进不丢成绩。
// 与 useSettings 一致的轻量 load/persist 模式，纯客户端使用（SSR 安全降级）。

const LS_KEY = "gailvlun-quiz-progress-v1";

/** 单题得分快照（用于回看 / 统计）。 */
export interface QuestionScore {
  id: string;
  awarded: number;
  max: number;
  /** 客观题是否完全答对；主观题为 null。 */
  correct: boolean | null;
}

/** 一次作答记录。 */
export interface QuizAttempt {
  earned: number;
  max: number;
  /** 百分制得分（保留一位小数）。 */
  percent: number;
  /** 完成时间（ISO 字符串）。 */
  completedAt: string;
  /** 阶段：submitted=刚交卷(客观分已定)，final=自评完成。 */
  stage: "submitted" | "final";
  hintsUsed?: number;
  perQuestion?: QuestionScore[];
}

/** 某章节的成绩档案。 */
export interface ChapterProgress {
  /** 历史最佳百分制。 */
  best: number;
  /** 最近一次作答。 */
  last: QuizAttempt;
  /** 累计作答次数（仅统计 final）。 */
  attempts: number;
}

type ProgressMap = Record<string, ChapterProgress>;

function keyOf(subjectId: string, chapterId: string): string {
  return `${subjectId}/${chapterId}`;
}

function loadAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function persistAll(map: ProgressMap): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/** 读取某章节成绩档案（无则 null）。 */
export function getChapterProgress(
  subjectId: string,
  chapterId: string,
): ChapterProgress | null {
  if (!subjectId || !chapterId) return null;
  return loadAll()[keyOf(subjectId, chapterId)] ?? null;
}

/**
 * 保存一次作答记录到本地。
 * - stage="submitted"：交卷即存（客观分已定），保证「分数先落地」。
 * - stage="final"：自评完成后存最终分，更新 best 与 attempts。
 * 返回是否写入成功（localStorage 不可用时为 false）。
 */
export function saveAttempt(
  subjectId: string,
  chapterId: string,
  attempt: QuizAttempt,
): boolean {
  if (!subjectId || !chapterId) return false;
  const map = loadAll();
  const k = keyOf(subjectId, chapterId);
  const prev = map[k];
  const best = Math.max(prev?.best ?? 0, attempt.percent);
  const attempts = (prev?.attempts ?? 0) + (attempt.stage === "final" ? 1 : 0);
  map[k] = { best, last: attempt, attempts };
  return persistAll(map);
}
