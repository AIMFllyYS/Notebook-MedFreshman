// 题目测试系统 —— 共享类型定义（前端组件 / Zustand store / 服务端 loader / API 共用）。
// JSON Schema 与 docs/sop/04-quiz-generation.md 一致。纯类型，无运行时依赖，可在服务端安全导入。

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "essay";

export type Difficulty = "basic" | "medium" | "hard";

export type QuestionSource = "current_chapter" | "review";

/** 单题。answer 字段约定见 SOP-04「各题型 answer 字段约定」。 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  source: QuestionSource;
  /** review 题标注来源章节 id（如 "ch02"）；current_chapter 题可省略。 */
  sourceChapter?: string;
  /** 本题分值 */
  points: number;
  /** 题干（支持 KaTeX $...$ 与 $$...$$、Markdown） */
  stem: string;
  /** 选项（仅 single_choice / multiple_choice） */
  options?: string[];
  /**
   * 正确答案：
   * - single_choice: number（0-indexed）
   * - multiple_choice: number[]
   * - true_false: number（1=正确，0=错误）
   * - fill_blank: string
   * - essay: string（完整参考答案）
   */
  answer: number | number[] | string;
  /** 解析 */
  explanation?: string;
  /** 得分点（仅 essay / fill_blank 等主观题，自评参考） */
  scoring_criteria?: string[];
  /** 本题满分（仅 essay；缺省时回退到 points） */
  total_points?: number;
}

export interface QuizExamConfig {
  source: string;
  /** 百分制总分 */
  totalPoints: number;
  /** 建议答题时间（分钟） */
  timeLimit?: number;
}

export interface QuizSummaryStats {
  totalQuestions: number;
  byType: Partial<Record<QuestionType, number>>;
  bySource: Partial<Record<QuestionSource, number>>;
  byDifficulty: Partial<Record<Difficulty, number>>;
}

export interface QuizData {
  subjectId: string;
  chapterId: string;
  generatedAt: string;
  examConfig: QuizExamConfig;
  questions: QuizQuestion[];
  summary?: QuizSummaryStats;
}

/** 用户作答：选择/判断为索引，多选为索引数组，填空/大题为文本。 */
export type UserAnswer = number | number[] | string | null;

/** 客观题（系统自动判分） vs 主观题（用户自评）。 */
export const OBJECTIVE_TYPES: QuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
];
export const SUBJECTIVE_TYPES: QuestionType[] = ["fill_blank", "essay"];

export function isObjective(type: QuestionType): boolean {
  return OBJECTIVE_TYPES.includes(type);
}

/** 本题满分：essay 优先 total_points，其余用 points。 */
export function maxPointsOf(q: QuizQuestion): number {
  if (q.type === "essay" && typeof q.total_points === "number") return q.total_points;
  return q.points ?? 0;
}

/**
 * 客观题自动判分，返回 [得分, 是否完全正确]。
 * - single_choice / true_false：答对满分，否则 0。
 * - multiple_choice：全对满分；漏选（未选错项）得半分；错选 0 分（SOP-04 策略）。
 * 主观题（fill_blank / essay）不在此判分，返回 [0, false] 由用户自评。
 */
export function autoGrade(q: QuizQuestion, answer: UserAnswer): [number, boolean] {
  const full = maxPointsOf(q);
  if (q.type === "single_choice" || q.type === "true_false") {
    return answer === q.answer ? [full, true] : [0, false];
  }
  if (q.type === "multiple_choice") {
    const correct = new Set((q.answer as number[]) ?? []);
    const picked = new Set(Array.isArray(answer) ? (answer as number[]) : []);
    if (picked.size === 0) return [0, false];
    const hasWrong = [...picked].some((i) => !correct.has(i));
    if (hasWrong) return [0, false];
    const allCorrect = picked.size === correct.size;
    if (allCorrect) return [full, true];
    // 漏选但无错选 → 半分
    return [Math.round((full / 2) * 100) / 100, false];
  }
  return [0, false];
}
