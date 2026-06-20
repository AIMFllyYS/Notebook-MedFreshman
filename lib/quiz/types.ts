// 题目测试系统 —— 共享类型定义（前端组件 / Zustand store / 服务端 loader / API 共用）。
// JSON Schema 与 docs/sop/04-quiz-generation.md 一致。纯类型，无运行时依赖，可在服务端安全导入。

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "analysis" // 辨析题：判断正误并说明理由（主观自评）
  | "fill_blank"
  | "essay"; // 简答 / 材料分析 / 论述 / 计算解答（用 label 细分显示）

export type Difficulty = "basic" | "medium" | "hard";

export type QuestionSource = "current_chapter" | "review";

/** 答案来源出处（深度解析须指明），供「来源目录」展示。 */
export interface SourceRef {
  /** 来源文件路径（来源目录），如 content/modern-history/detail/2.1.md */
  path?: string;
  /** 人类可读的定位，如 "2.1 银荒与末世 · 二、银铜双本位制" */
  label?: string;
}

/** 单题。answer 字段约定见 SOP-04「各题型 answer 字段约定」。 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  source: QuestionSource;
  /** review 题标注来源章节 id（如 "ch02"）；current_chapter 题可省略。 */
  sourceChapter?: string;
  /** 显示用题型名（细分 essay：如 "材料分析题" / "论述题" / "简答题"），缺省用类型默认名。 */
  label?: string;
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
   * - analysis: number（1=命题正确，0=命题错误）——判断部分；理由见 answer/scoring_criteria
   * - fill_blank: string
   * - essay: string（完整参考答案）
   */
  answer: number | number[] | string;
  /** 交卷前可点击查看的提示（启发思路，不泄露答案）。 */
  hint?: string;
  /**
   * 深度解析：必须真实、逐点说明为何此答案正确、干扰项为何错，
   * 并落到具体知识点（与 sourceRef 配合指明来源目录）。支持 Markdown / KaTeX。
   */
  explanation?: string;
  /** 答案来源出处（来源目录 + 定位）。 */
  sourceRef?: SourceRef;
  /** analysis 题的参考理由 / 论证（与 answer 的判断配套）。 */
  reasoning?: string;
  /** 得分点（仅主观题 analysis/fill_blank/essay） */
  scoring_criteria?: string[];
  /** 本题满分（仅主观题；缺省时回退到 points） */
  total_points?: number;
  /** 关联的 Manim 讲解视频 id（指向 content/media*；概率论等复杂题用）。 */
  manimVideoId?: string;
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
export const SUBJECTIVE_TYPES: QuestionType[] = ["analysis", "fill_blank", "essay"];

/** 题型默认显示名（label 缺省时使用）。 */
export const TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  true_false: "判断题",
  analysis: "辨析题",
  fill_blank: "填空题",
  essay: "解答题",
};

export function isObjective(type: QuestionType): boolean {
  return OBJECTIVE_TYPES.includes(type);
}

/** 题型显示名：优先 label，否则类型默认名。 */
export function displayLabel(q: QuizQuestion): string {
  return q.label?.trim() || TYPE_LABELS[q.type];
}

/** 本题满分：主观题优先 total_points，其余用 points。 */
export function maxPointsOf(q: QuizQuestion): number {
  if (typeof q.total_points === "number" && !isObjective(q.type)) return q.total_points;
  return q.points ?? 0;
}

/**
 * 客观题自动判分，返回 [得分, 是否完全正确]。
 * - single_choice / true_false：答对满分，否则 0。
 * - multiple_choice：全对满分；漏选（未选错项）得半分；错选 0 分（SOP-04 策略）。
 * 主观题（analysis / fill_blank / essay）不在此判分，返回 [0, false] 由用户自评。
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
