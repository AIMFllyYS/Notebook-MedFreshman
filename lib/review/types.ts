// 记忆系统 —— 复习卡片数据模型（单一真相源）。
//
// 用户在正文 / AI 输出处划词或右键「记录」→ 先把原文落库（status=parsing，绝不丢），
// 再由后台 DeepSeek-V4-Flash（/api/record）异步把内容转成卡片：
//   - 知识点 → cloze 填空闪卡（front 含 ____，back 为填全后的完整句）
//   - 题目   → qa 问答卡（front 为题干，back 为答案/解析）
// 卡片携带章节出处（subject/category/item/sourceLabel）以便复习时溯源。

export type CardType = "cloze" | "qa";
export type CardStatus = "parsing" | "ready" | "error";

/** 记录发起时由前端从当前活动路由（或复习板自带科目）采集的上下文。 */
export interface ReviewCardContext {
  subjectId: string;
  categoryId?: string;
  itemId?: string;
  /** 人类可读出处，如「大学物理 / 详解 / 1.1 质点运动学」。 */
  sourceLabel: string;
}

/** /api/record 返回的成卡结果（不含出处，由前端合并）。 */
export interface RecordCardAI {
  cardType: CardType;
  front: string;
  back: string;
  /** cloze 卡被挖去的答案片段（按出现顺序），便于后续做交互式填空。 */
  blanks?: string[];
  explanation?: string;
}

/** 一张复习卡片（IndexedDB 持久化）。 */
export interface ReviewCard extends ReviewCardContext {
  id: string;
  originalText: string;
  cardType: CardType;
  front: string;
  back: string;
  blanks?: string[];
  explanation?: string;
  status: CardStatus;
  /** status=error 时的原因。 */
  error?: string;
  /** 实际成卡所用模型 id。 */
  model?: string;
  createdAt: number;
}

/** 下载导出的容器结构（本科目或全部）。 */
export interface ReviewExport {
  app: "gailvlun";
  kind: "review-cards";
  version: 1;
  exportedAt: number;
  scope: "subject" | "all";
  subjectId?: string;
  count: number;
  cards: ReviewCard[];
}
