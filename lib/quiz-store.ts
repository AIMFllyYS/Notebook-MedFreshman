import { create } from "zustand";
import type { QuizData, QuizQuestion, UserAnswer } from "@/lib/quiz/types";
import { autoGrade, isObjective, maxPointsOf } from "@/lib/quiz/types";
import { saveAttempt, saveSession, getSession, clearSession, type QuizAttempt } from "@/lib/quiz-progress";

export type QuizStatus = "idle" | "loading" | "ready" | "empty" | "error";

/** 做题流程阶段：作答 → 评分/自评 → 总结。 */
export type QuizPhase = "answering" | "scoring" | "summary";

/** 单题评分结果（提交后计算）。 */
export interface QuestionResult {
  question: QuizQuestion;
  answer: UserAnswer;
  /** 客观题：自动判分；主观题：用户自评（提交时初始化为 0）。 */
  awarded: number;
  max: number;
  /** 仅客观题有意义：是否完全答对。 */
  correct: boolean;
  /** 客观题为 true（自动判分），主观题为 false（需自评）。 */
  objective: boolean;
}

interface QuizState {
  // ── 数据加载 ───────────────────────────────
  status: QuizStatus;
  data: QuizData | null;
  subjectId: string;
  chapterId: string;
  /** 当前已加载的 quiz 键（subjectId/chapterId），用于避免重复加载。 */
  loadedKey: string | null;
  errorMessage: string | null;

  // ── 做题状态 ───────────────────────────────
  phase: QuizPhase;
  currentIndex: number;
  /** questionId → 用户作答 */
  answers: Record<string, UserAnswer>;
  /** 已查看提示的题目 id（交卷前点击提示） */
  hintsUsed: string[];
  /** 提交后计算的逐题结果（含主观题自评分，可被 setSelfScore 修改） */
  results: QuestionResult[];

  // ── actions ────────────────────────────────
  load: (subjectId: string, chapterId: string) => Promise<void>;
  reset: () => void;
  setAnswer: (id: string, answer: UserAnswer) => void;
  useHint: (id: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** 作答 → 评分：自动判分客观题，主观题初始化为 0 待自评；并把当前成绩先落地本地。 */
  submit: () => void;
  /** 主观题自评打分（0 ~ 满分），同时同步到 results。 */
  setSelfScore: (id: string, awarded: number) => void;
  /** 评分 → 总结：存最终成绩到本地。 */
  finishScoring: () => void;
  /** 回到评分面板（从总结返回修改自评）。 */
  backToScoring: () => void;
  /** 重做本套题（保留已加载数据，清空作答）。 */
  restart: () => void;
}

const ANSWERING_DEFAULTS = {
  phase: "answering" as QuizPhase,
  currentIndex: 0,
  answers: {} as Record<string, UserAnswer>,
  hintsUsed: [] as string[],
  results: [] as QuestionResult[],
};

/** 从 results 中提取主观题自评分快照（id → awarded）。 */
function buildSelfScores(results: QuestionResult[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const r of results) {
    if (!r.objective) scores[r.question.id] = r.awarded;
  }
  return scores;
}

/** 将当前做题状态持久化到 localStorage（覆盖式，仅保留一份最新）。 */
function persistSession(state: QuizState): void {
  if (!state.subjectId || !state.chapterId || state.status !== "ready") return;
  saveSession(state.subjectId, state.chapterId, {
    answers: state.answers,
    phase: state.phase,
    currentIndex: state.currentIndex,
    hintsUsed: state.hintsUsed,
    selfScores: buildSelfScores(state.results),
    savedAt: new Date().toISOString(),
  });
}

/**
 * 从已保存的 session 重建 results（用于恢复 scoring/summary 阶段）。
 * 客观题重新自动判分；主观题使用保存的自评分。
 */
function rebuildResults(
  questions: QuizQuestion[],
  answers: Record<string, UserAnswer>,
  selfScores: Record<string, number>,
): QuestionResult[] {
  return questions.map((q) => {
    const answer = answers[q.id] ?? null;
    const max = maxPointsOf(q);
    const objective = isObjective(q.type);
    if (objective) {
      const [awarded, correct] = autoGrade(q, answer);
      return { question: q, answer, awarded, max, correct, objective };
    }
    return { question: q, answer, awarded: selfScores[q.id] ?? 0, max, correct: false, objective };
  });
}

/** 由当前 results 构造一次作答记录（用于本地持久化）。 */
export function buildAttempt(state: QuizState, stage: QuizAttempt["stage"]): QuizAttempt {
  const earned = state.results.reduce((a, r) => a + r.awarded, 0);
  const max = state.results.reduce((a, r) => a + r.max, 0);
  return {
    earned,
    max,
    percent: max > 0 ? Math.round((earned / max) * 1000) / 10 : 0,
    completedAt: new Date().toISOString(),
    stage,
    hintsUsed: state.hintsUsed.length,
    perQuestion: state.results.map((r) => ({
      id: r.question.id,
      awarded: r.awarded,
      max: r.max,
      correct: r.objective ? r.correct : null,
    })),
  };
}

export const useQuizStore = create<QuizState>((set, get) => ({
  status: "idle",
  data: null,
  subjectId: "",
  chapterId: "",
  loadedKey: null,
  errorMessage: null,
  ...ANSWERING_DEFAULTS,

  load: async (subjectId, chapterId) => {
    const key = `${subjectId}/${chapterId}`;
    // 已是同一套题且加载成功，无需重复请求。
    if (get().loadedKey === key && get().status === "ready") return;
    if (!subjectId || !chapterId) {
      set({ status: "empty", data: null, subjectId, chapterId, loadedKey: key, ...ANSWERING_DEFAULTS });
      return;
    }
    set({
      status: "loading",
      errorMessage: null,
      subjectId,
      chapterId,
      loadedKey: key,
      ...ANSWERING_DEFAULTS,
    });
    try {
      const res = await fetch(
        `/api/quiz?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      );
      // 当前章节未生成题目：API 返回 404。
      if (res.status === 404) {
        if (get().loadedKey === key) set({ status: "empty", data: null });
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { quiz: QuizData | null };
      if (get().loadedKey !== key) return; // 期间已切换章节，丢弃过期结果
      if (!json.quiz || !json.quiz.questions?.length) {
        set({ status: "empty", data: null });
        return;
      }
      // 尝试恢复上次答题会话
      const saved = getSession(subjectId, chapterId);
      if (saved) {
        const currentIds = new Set(json.quiz.questions.map((q) => q.id));
        const savedIds = Object.keys(saved.answers);
        const matchCount = savedIds.filter((id) => currentIds.has(id)).length;
        const matchRate = savedIds.length > 0 ? matchCount / savedIds.length : 1;
        if (matchRate >= 0.5) {
          // 清理已不存在的题目答案
          const restoredAnswers = { ...saved.answers };
          for (const id of savedIds) {
            if (!currentIds.has(id)) delete restoredAnswers[id];
          }
          // 重建 results（若上次已交卷/已完成）
          const results =
            saved.phase === "scoring" || saved.phase === "summary"
              ? rebuildResults(json.quiz.questions, restoredAnswers, saved.selfScores)
              : [];
          set({
            status: "ready",
            data: json.quiz,
            answers: restoredAnswers,
            phase: saved.phase,
            currentIndex: Math.min(saved.currentIndex, json.quiz.questions.length - 1),
            hintsUsed: saved.hintsUsed,
            results,
          });
          return;
        }
      }
      set({ status: "ready", data: json.quiz, ...ANSWERING_DEFAULTS });
    } catch (e) {
      if (get().loadedKey !== key) return;
      set({ status: "error", errorMessage: e instanceof Error ? e.message : "加载失败" });
    }
  },

  reset: () =>
    set({
      status: "idle",
      data: null,
      subjectId: "",
      chapterId: "",
      loadedKey: null,
      errorMessage: null,
      ...ANSWERING_DEFAULTS,
    }),

  setAnswer: (id, answer) => {
    set((s) => ({ answers: { ...s.answers, [id]: answer } }));
    persistSession(get());
  },

  useHint: (id) => {
    set((s) => (s.hintsUsed.includes(id) ? s : { hintsUsed: [...s.hintsUsed, id] }));
    persistSession(get());
  },

  goTo: (index) => {
    const total = get().data?.questions.length ?? 0;
    set({ currentIndex: Math.max(0, Math.min(index, Math.max(0, total - 1))) });
    persistSession(get());
  },
  next: () => get().goTo(get().currentIndex + 1),
  prev: () => get().goTo(get().currentIndex - 1),

  submit: () => {
    const { data, answers } = get();
    if (!data) return;
    const results: QuestionResult[] = data.questions.map((q) => {
      const answer = answers[q.id] ?? null;
      const max = maxPointsOf(q);
      const objective = isObjective(q.type);
      if (objective) {
        const [awarded, correct] = autoGrade(q, answer);
        return { question: q, answer, awarded, max, correct, objective };
      }
      // 主观题：待用户自评，初始 0 分。
      return { question: q, answer, awarded: 0, max, correct: false, objective };
    });
    set({ results, phase: "scoring" });
    // 「分数首先确保存储在本地」：交卷即把客观分落地（随后才在评分页展示解析）。
    const s = get();
    saveAttempt(s.subjectId, s.chapterId, buildAttempt(s, "submitted"));
    persistSession(s);
  },

  setSelfScore: (id, awarded) => {
    set((s) => ({
      results: s.results.map((r) =>
        r.question.id === id
          ? { ...r, awarded: Math.max(0, Math.min(awarded, r.max)) }
          : r,
      ),
    }));
    persistSession(get());
  },

  finishScoring: () => {
    set({ phase: "summary" });
    const s = get();
    // 自评完成 → 存最终成绩，更新历史最佳与作答次数。
    saveAttempt(s.subjectId, s.chapterId, buildAttempt(s, "final"));
    persistSession(s);
  },
  backToScoring: () => {
    set({ phase: "scoring" });
    persistSession(get());
  },

  restart: () => {
    const s = get();
    if (s.subjectId && s.chapterId) clearSession(s.subjectId, s.chapterId);
    set({ ...ANSWERING_DEFAULTS });
  },
}));

// ── 派生统计（供 QuizSummary 使用，非 store 状态）───────────────

export interface QuizScoreBreakdown {
  earned: number;
  max: number;
  /** 百分制总分（earned/max*100，保留一位小数） */
  percent: number;
  byType: Record<string, { earned: number; max: number; count: number }>;
  bySource: Record<string, { earned: number; max: number; count: number }>;
  byDifficulty: Record<string, { earned: number; max: number; count: number }>;
}

export function computeBreakdown(results: QuestionResult[]): QuizScoreBreakdown {
  const acc = (
    bucket: Record<string, { earned: number; max: number; count: number }>,
    key: string,
    earned: number,
    max: number,
  ) => {
    const cur = bucket[key] ?? { earned: 0, max: 0, count: 0 };
    cur.earned += earned;
    cur.max += max;
    cur.count += 1;
    bucket[key] = cur;
  };

  const byType: QuizScoreBreakdown["byType"] = {};
  const bySource: QuizScoreBreakdown["bySource"] = {};
  const byDifficulty: QuizScoreBreakdown["byDifficulty"] = {};
  let earned = 0;
  let max = 0;

  for (const r of results) {
    earned += r.awarded;
    max += r.max;
    acc(byType, r.question.type, r.awarded, r.max);
    acc(bySource, r.question.source, r.awarded, r.max);
    acc(byDifficulty, r.question.difficulty, r.awarded, r.max);
  }

  const percent = max > 0 ? Math.round((earned / max) * 1000) / 10 : 0;
  return { earned, max, percent, byType, bySource, byDifficulty };
}
