// createQuiz 工具的参数 schema 与归一化：把模型写的宽松题目对象收敛成题库组件
// （components/quiz/QuizQuestion）可直接渲染、autoGrade 可直接判分的 QuizQuestion[]。
//
// 只暴露理工/医学课程真正用到的 6 种题型；阅读理解/完形/翻译属于英语题库，不在此开放。

import { z } from "zod";
import type { Difficulty, QuestionType, QuizQuestion } from "@/lib/quiz/types";
import { isObjective } from "@/lib/quiz/types";
import type { CreateQuizInput, CreateQuizQuestionInput } from "@/lib/ai/agent/toolTypes";

export const QUIZ_TOOL_TYPES = ["single_choice", "multiple_choice", "true_false", "fill_blank", "analysis", "essay"] as const;
export const QUIZ_MAX_QUESTIONS = 12;

const DEFAULT_POINTS: Record<(typeof QUIZ_TOOL_TYPES)[number], number> = {
  single_choice: 2,
  multiple_choice: 3,
  true_false: 1,
  fill_blank: 2,
  analysis: 5,
  essay: 8,
};

export const quizQuestionInputSchema = z.object({
  type: z.enum(QUIZ_TOOL_TYPES).describe(
    "题型：single_choice 单选 / multiple_choice 多选 / true_false 判断 / fill_blank 填空 / analysis 辨析（先判断对错再说理由）/ essay 简答·计算·论述",
  ),
  stem: z.string().min(1).describe("题干，Markdown + KaTeX（$...$）。选择题不要把选项写进题干。"),
  options: z.array(z.string()).optional().describe("选项文本数组（不带 A/B/C 字母），仅 single_choice / multiple_choice 需要，2–6 项。"),
  answer: z.union([z.number(), z.array(z.number()), z.string()]).optional().describe(
    "single_choice：正确选项下标（0 起）；multiple_choice：下标数组；true_false / analysis：1=正确 0=错误；fill_blank / essay：参考答案文本。",
  ),
  hint: z.string().optional().describe("提示，分「方向 → 原理 → 步骤」三档写成 Markdown 列表；学生主动点开前不可见。"),
  explanation: z.string().optional().describe("深度解析：为什么对、其他选项为什么错、易错点。"),
  difficulty: z.enum(["basic", "medium", "hard"]).optional().describe("难度，默认 medium。"),
  points: z.number().optional().describe("分值，省略时按题型给默认值。"),
  label: z.string().optional().describe("细分题型显示名，如「计算题」「简答题」。"),
  scoring_criteria: z.array(z.string()).optional().describe("主观题评分要点（essay / analysis / fill_blank）。"),
  reasoning: z.string().optional().describe("analysis 题的参考理由。"),
  sourceRef: z.object({ path: z.string().optional(), label: z.string().optional() }).optional().describe(
    "答案出处：path 为笔记复合路径（如 histology/textbook/ch03-2），label 为小节名。",
  ),
});

export const createQuizInputSchema = z.object({
  title: z.string().min(1).describe("这组题的标题，如「贝叶斯公式 · 即时检验」。"),
  intent: z.enum(["check", "diagnose", "practice", "exam"]).optional().describe(
    "check=讲解后的即时检验（1–2 题）；diagnose=针对学生漏洞的诊断题；practice=学生要求的练习；exam=章节小测（多题）。",
  ),
  questions: z.array(quizQuestionInputSchema).min(1).max(QUIZ_MAX_QUESTIONS).describe(`题目数组，1–${QUIZ_MAX_QUESTIONS} 道。`),
});

function asIndexArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const nums = value.filter((v): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0);
  return nums.length === value.length && nums.length > 0 ? [...new Set(nums)].sort((a, b) => a - b) : null;
}

/** 允许模型用 "A"/"B" 或 "正确"/"错误" 之类文字给客观题答案。 */
function coerceIndex(value: unknown, optionCount: number): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < optionCount) return value;
  if (typeof value === "string") {
    const letter = value.trim().toUpperCase();
    if (/^[A-J]$/.test(letter)) {
      const idx = letter.charCodeAt(0) - 65;
      return idx < optionCount ? idx : null;
    }
    const num = Number(letter);
    if (Number.isInteger(num) && num >= 0 && num < optionCount) return num;
  }
  return null;
}

function coerceBoolean(value: unknown): 0 | 1 | null {
  if (value === 1 || value === 0) return value;
  if (value === true) return 1;
  if (value === false) return 0;
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (["1", "true", "正确", "对", "√", "t", "yes"].includes(t)) return 1;
    if (["0", "false", "错误", "错", "×", "f", "no"].includes(t)) return 0;
  }
  return null;
}

/**
 * 归一化单题；结构不完整（如选择题缺选项 / 答案越界）返回 null 由调用方丢弃，
 * 而不是让前端渲染出无法判分的题。
 */
export function normalizeQuizQuestion(raw: CreateQuizQuestionInput, id: string): QuizQuestion | null {
  const type = raw.type as QuestionType;
  const stem = (raw.stem ?? "").trim();
  if (!stem || !(QUIZ_TOOL_TYPES as readonly string[]).includes(type)) return null;
  const difficulty: Difficulty = raw.difficulty ?? "medium";
  const points = typeof raw.points === "number" && raw.points > 0 ? raw.points : DEFAULT_POINTS[type as (typeof QUIZ_TOOL_TYPES)[number]];

  let options: string[] | undefined;
  let answer: QuizQuestion["answer"];

  if (type === "single_choice" || type === "multiple_choice") {
    options = (raw.options ?? []).map((o) => String(o ?? "").trim()).filter(Boolean);
    if (options.length < 2) return null;
    if (type === "single_choice") {
      const idx = coerceIndex(raw.answer, options.length);
      if (idx === null) return null;
      answer = idx;
    } else {
      const arr = asIndexArray(raw.answer) ?? (() => {
        const single = coerceIndex(raw.answer, options.length);
        return single === null ? null : [single];
      })();
      if (!arr || arr.some((i) => i >= options!.length)) return null;
      answer = arr;
    }
  } else if (type === "true_false" || type === "analysis") {
    const b = coerceBoolean(raw.answer);
    if (b === null) return null;
    answer = b;
  } else {
    const text = typeof raw.answer === "string" ? raw.answer.trim() : Array.isArray(raw.answer) ? raw.answer.join("、") : raw.answer != null ? String(raw.answer) : "";
    answer = text || (raw.explanation ?? "").trim();
  }

  const q: QuizQuestion = {
    id,
    type,
    difficulty,
    source: "current_chapter",
    points,
    stem,
    answer,
  };
  if (options) q.options = options;
  if (raw.label?.trim()) q.label = raw.label.trim();
  if (raw.hint?.trim()) q.hint = raw.hint.trim();
  if (raw.explanation?.trim()) q.explanation = raw.explanation.trim();
  if (raw.reasoning?.trim()) q.reasoning = raw.reasoning.trim();
  if (raw.scoring_criteria?.length) q.scoring_criteria = raw.scoring_criteria.map((c) => String(c).trim()).filter(Boolean);
  if (!isObjective(type)) q.total_points = points;
  if (raw.sourceRef && (raw.sourceRef.path || raw.sourceRef.label)) {
    q.sourceRef = { path: raw.sourceRef.path ?? "", label: raw.sourceRef.label ?? "" };
  }
  return q;
}

export interface NormalizedQuiz {
  questions: QuizQuestion[];
  droppedCount: number;
}

/** 题目 id 带 quizId 前缀，保证跨消息唯一（题库组件 / 提示状态按 id 记录）。 */
export function normalizeQuiz(input: CreateQuizInput, quizId: string): NormalizedQuiz {
  const questions: QuizQuestion[] = [];
  let droppedCount = 0;
  input.questions.slice(0, QUIZ_MAX_QUESTIONS).forEach((raw, i) => {
    const q = normalizeQuizQuestion(raw, `${quizId}-q${i + 1}`);
    if (q) questions.push(q);
    else droppedCount++;
  });
  return { questions, droppedCount };
}

/** 回灌模型的文字：告诉它题目已渲染成组件，不要在正文重复题干/答案。 */
export function describeQuizForModel(title: string, normalized: NormalizedQuiz): string {
  const { questions, droppedCount } = normalized;
  if (questions.length === 0) {
    return "出题失败：没有一道题结构完整（选择题需要 ≥2 个选项且 answer 为有效下标；判断/辨析题 answer 为 1 或 0）。请修正后重新调用 createQuiz。";
  }
  const lines = questions.map((q, i) => `${i + 1}. [${q.type}] ${q.stem.replace(/\s+/g, " ").slice(0, 60)}`);
  const dropped = droppedCount > 0 ? `\n（另有 ${droppedCount} 道题因结构不完整被丢弃。）` : "";
  return `题组「${title}」已渲染为可作答的题目卡片（共 ${questions.length} 道），学生可以直接在卡片里作答、查看提示、提交后自动判分并看到解析。\n${lines.join("\n")}${dropped}\n\n接下来请只用一两句话引导学生去做题（例如说明这组题检验哪个知识点），不要在正文里重复题干、选项、提示或答案。`;
}
