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

// ── 全局成绩（设置面板「全局分数」消费）─────────────────────────

/** 一条章节成绩档案（已带回 subject/chapter 标识，便于聚合展示）。 */
export interface ProgressEntry {
  subjectId: string;
  chapterId: string;
  progress: ChapterProgress;
}

/** 读取全部章节成绩（仅含已作答的章节）。 */
export function getAllProgress(): ProgressEntry[] {
  const map = loadAll();
  return Object.entries(map).map(([k, progress]) => {
    const slash = k.indexOf("/");
    return {
      subjectId: slash >= 0 ? k.slice(0, slash) : k,
      chapterId: slash >= 0 ? k.slice(slash + 1) : "",
      progress,
    };
  });
}

/** 全局成绩汇总。 */
export interface GlobalSummary {
  /** 已测验的章节数 */
  chapters: number;
  /** 各章历史最佳分的平均（百分制，保留一位小数） */
  avgBest: number;
  /** 累计作答次数（final） */
  totalAttempts: number;
  /** 单章最高分 */
  bestEver: number;
}

export function getGlobalSummary(entries?: ProgressEntry[]): GlobalSummary {
  const list = entries ?? getAllProgress();
  if (list.length === 0) return { chapters: 0, avgBest: 0, totalAttempts: 0, bestEver: 0 };
  const sumBest = list.reduce((a, e) => a + e.progress.best, 0);
  const totalAttempts = list.reduce((a, e) => a + e.progress.attempts, 0);
  const bestEver = list.reduce((a, e) => Math.max(a, e.progress.best), 0);
  return {
    chapters: list.length,
    avgBest: Math.round((sumBest / list.length) * 10) / 10,
    totalAttempts,
    bestEver,
  };
}

/** 清空全部成绩，返回是否成功。 */
export function clearAllProgress(): boolean {
  return persistAll({});
}

/** 删除单章成绩，返回是否成功。 */
export function clearChapterProgress(subjectId: string, chapterId: string): boolean {
  const map = loadAll();
  delete map[keyOf(subjectId, chapterId)];
  return persistAll(map);
}

// ── 展示辅助（标签 / 排序 / 评级）──────────────────────────────

/** 章节 id → 中文短标签：ch07→「第 7 章」、rec-03→「录音 3」、sum-01→「纪要 1」。 */
export function chapterLabel(chapterId: string): string {
  const m = /^([a-z]+)-?0*(\d+)$/i.exec(chapterId);
  if (m) {
    const prefix = m[1].toLowerCase();
    const n = m[2];
    if (prefix === "ch") return `第 ${n} 章`;
    if (prefix === "rec") return `录音 ${n}`;
    if (prefix === "sum") return `纪要 ${n}`;
  }
  return chapterId;
}

function chapterRank(id: string): [number, number] {
  const m = /^([a-z]+)-?0*(\d+)/i.exec(id);
  const prefix = (m?.[1] ?? id).toLowerCase();
  const num = m ? parseInt(m[2], 10) : 0;
  const order = prefix === "ch" ? 0 : prefix === "rec" ? 1 : prefix === "sum" ? 2 : 3;
  return [order, num];
}

/** 章节排序：ch < rec < sum，组内按编号升序。 */
export function compareChapter(a: string, b: string): number {
  const [ra, na] = chapterRank(a);
  const [rb, nb] = chapterRank(b);
  return ra - rb || na - nb;
}

/** 百分制 → 评级（与 QuizSummary 一致的色阶）。 */
export function scoreGrade(percent: number): { label: string; color: string } {
  if (percent >= 90) return { label: "优秀", color: "var(--color-success)" };
  if (percent >= 80) return { label: "良好", color: "var(--color-info)" };
  if (percent >= 60) return { label: "及格", color: "var(--color-warning)" };
  return { label: "待加强", color: "var(--md-sys-color-error)" };
}
