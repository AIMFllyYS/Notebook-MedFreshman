import { create } from "zustand";
import type { QuizData, QuizQuestion, UserAnswer } from "@/lib/quiz/types";
import { autoGrade, isObjective, maxPointsOf } from "@/lib/quiz/types";

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
  /** 当前已加载的 quiz 键（subjectId/chapterId），用于避免重复加载。 */
  loadedKey: string | null;
  errorMessage: string | null;

  // ── 做题状态 ───────────────────────────────
  phase: QuizPhase;
  currentIndex: number;
  /** questionId → 用户作答 */
  answers: Record<string, UserAnswer>;
  /** 提交后计算的逐题结果（含主观题自评分，可被 setSelfScore 修改） */
  results: QuestionResult[];

  // ── actions ────────────────────────────────
  load: (subjectId: string, chapterId: string) => Promise<void>;
  reset: () => void;
  setAnswer: (id: string, answer: UserAnswer) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** 作答 → 评分：自动判分客观题，主观题初始化为 0 待自评。 */
  submit: () => void;
  /** 主观题自评打分（0 ~ 满分），同时同步到 results。 */
  setSelfScore: (id: string, awarded: number) => void;
  /** 评分 → 总结。 */
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
  results: [] as QuestionResult[],
};

export const useQuizStore = create<QuizState>((set, get) => ({
  status: "idle",
  data: null,
  loadedKey: null,
  errorMessage: null,
  ...ANSWERING_DEFAULTS,

  load: async (subjectId, chapterId) => {
    const key = `${subjectId}/${chapterId}`;
    // 已是同一套题且加载成功，无需重复请求。
    if (get().loadedKey === key && get().status === "ready") return;
    if (!subjectId || !chapterId) {
      set({ status: "empty", data: null, loadedKey: key, ...ANSWERING_DEFAULTS });
      return;
    }
    set({ status: "loading", errorMessage: null, loadedKey: key, ...ANSWERING_DEFAULTS });
    try {
      const res = await fetch(
        `/api/quiz?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      );
      // 当前章节未生成题目：API 返回 404。
      if (res.status === 404) {
        // 仅在仍是最新请求时落定状态，避免快速切换章节时的竞态。
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
      set({ status: "ready", data: json.quiz, ...ANSWERING_DEFAULTS });
    } catch (e) {
      if (get().loadedKey !== key) return;
      set({ status: "error", errorMessage: e instanceof Error ? e.message : "加载失败" });
    }
  },

  reset: () =>
    set({ status: "idle", data: null, loadedKey: null, errorMessage: null, ...ANSWERING_DEFAULTS }),

  setAnswer: (id, answer) =>
    set((s) => ({ answers: { ...s.answers, [id]: answer } })),

  goTo: (index) => {
    const total = get().data?.questions.length ?? 0;
    set({ currentIndex: Math.max(0, Math.min(index, Math.max(0, total - 1))) });
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
  },

  setSelfScore: (id, awarded) =>
    set((s) => ({
      results: s.results.map((r) =>
        r.question.id === id
          ? { ...r, awarded: Math.max(0, Math.min(awarded, r.max)) }
          : r,
      ),
    })),

  finishScoring: () => set({ phase: "summary" }),
  backToScoring: () => set({ phase: "scoring" }),

  restart: () => set({ ...ANSWERING_DEFAULTS }),
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
