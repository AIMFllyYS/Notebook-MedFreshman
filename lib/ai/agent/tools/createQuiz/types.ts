import type { QuizQuestion } from "@/lib/quiz/types";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

/** 模型在工具参数里写的单题（宽松：id / difficulty / points 等可省略，服务端补默认值）。 */
export interface CreateQuizQuestionInput {
  type: QuizQuestion["type"];
  stem: string;
  options?: string[];
  /** 选择题为选项下标（多选为下标数组）；判断题 1=正确 0=错误；主观题为参考答案文本。 */
  answer?: number | number[] | string;
  hint?: string;
  explanation?: string;
  difficulty?: QuizQuestion["difficulty"];
  points?: number;
  label?: string;
  scoring_criteria?: string[];
  reasoning?: string;
  sourceRef?: { path?: string; label?: string };
  passage?: string;
  subQuestions?: QuizQuestion["subQuestions"];
  blanks?: QuizQuestion["blanks"];
  items?: QuizQuestion["items"];
}

export interface CreateQuizInput {
  title: string;
  /** 出题意图：讲解后即时检验 / 针对漏洞诊断 / 用户主动要练习 / 章节小测。 */
  intent?: "check" | "diagnose" | "practice" | "exam";
  questions: CreateQuizQuestionInput[];
}

export interface CreateQuizOutput extends TextToolOutput {
  quizId: string;
  title: string;
  intent: NonNullable<CreateQuizInput["intent"]>;
  /** 已归一化的题目（补齐 id / difficulty / source / points），前端直接交给 QuizQuestion 渲染。 */
  questions: QuizQuestion[];
  /** 被丢弃的非法题目数量（结构不完整），给前端做提示。 */
  droppedCount: number;
}
