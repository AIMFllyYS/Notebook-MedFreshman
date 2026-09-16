import { displayLabel, TYPE_LABELS, type QuizQuestion } from "@/lib/quiz/types";

const LETTERS = "ABCDEFGHIJ";

function choiceLabel(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}

function formatOfficialAnswer(q: QuizQuestion): string | null {
  if (q.type === "true_false" || q.type === "analysis") {
    return q.answer === 1 ? "正确" : "错误";
  }
  if (q.type === "single_choice" && typeof q.answer === "number") {
    return choiceLabel(q.answer);
  }
  if (q.type === "multiple_choice" && Array.isArray(q.answer)) {
    return q.answer.map((i) => choiceLabel(i)).join("、");
  }
  if (typeof q.answer === "string" && q.answer.trim()) return q.answer.trim();
  return null;
}

/** 把题目 + 已有解析编成干净上下文，供窗内 Agent 自己解答。不进系统前缀，以免打断 prompt cache。 */
export function formatQuestionContext(q: QuizQuestion): string {
  const blocks: string[] = [`题型：${displayLabel(q) || TYPE_LABELS[q.type]}`, `题干：\n${q.stem.trim()}`];

  if (q.passage?.trim()) blocks.push(`材料：\n${q.passage.trim()}`);

  if (q.options?.length) {
    blocks.push(`选项：\n${q.options.map((opt, i) => `${choiceLabel(i)}. ${opt}`).join("\n")}`);
  }

  if (q.subQuestions?.length) {
    const lines = q.subQuestions.map((sq, i) => {
      const opts = sq.options?.length
        ? `\n${sq.options.map((opt, j) => `  ${choiceLabel(j)}. ${opt}`).join("\n")}`
        : "";
      const exp = sq.explanation?.trim() ? `\n  子题解析：${sq.explanation.trim()}` : "";
      return `${i + 1}. ${sq.stem.trim()}${opts}${exp}`;
    });
    blocks.push(`小题：\n${lines.join("\n")}`);
  }

  if (q.blanks?.length) {
    const lines = q.blanks.map((blank, i) => {
      const opts = blank.options.map((opt, j) => `  ${choiceLabel(j)}. ${opt}`).join("\n");
      const exp = blank.explanation?.trim() ? `\n  空解析：${blank.explanation.trim()}` : "";
      return `空 ${i + 1}：\n${opts}${exp}`;
    });
    blocks.push(`完形填空：\n${lines.join("\n")}`);
  }

  if (q.items?.length) {
    const lines = q.items.map((item, i) => {
      const exp = item.explanation?.trim() ? `\n  解析：${item.explanation.trim()}` : "";
      return `${i + 1}. ${item.source.trim()}${exp}`;
    });
    blocks.push(`翻译条目：\n${lines.join("\n")}`);
  }

  const official = formatOfficialAnswer(q);
  if (official) blocks.push(`参考答案：${official}`);
  if (q.reasoning?.trim()) blocks.push(`参考理由：\n${q.reasoning.trim()}`);
  if (q.scoring_criteria?.length) {
    blocks.push(`评分要点：\n${q.scoring_criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`);
  }

  const explanation = q.explanation?.trim();
  blocks.push(explanation ? `已有解析：\n${explanation}` : "已有解析：（本题暂无现成解析）");

  return blocks.join("\n\n");
}

/** 窗内首条用户消息：让 Agent 自己解答，题目正文走用户消息以保住系统前缀 cache。 */
export const QUIZ_EXPLAIN_SEED_PROMPT =
  "请你独立解答下面这道题：写出完整推理，说明为何该答案成立、干扰项为何不成立。已有解析仅供对照，不要照抄，也不要再出新题。";
