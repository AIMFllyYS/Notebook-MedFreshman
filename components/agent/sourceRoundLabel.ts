import type { SourceRound } from "@/lib/chat/traceSources";
import type { Translate } from "@/lib/i18n";

/**
 * 检索轮次的分组文案。
 *
 * 为什么要有这一层：来源面板内部只有 TOOL_PRESENTATION 那套旧措辞（「搜索网页 / 检索笔记 / 检索笔记图片」），
 * 与词典里的「联网搜索 / 笔记检索 / 图片检索」并存会让同一件事在对话页签与右侧面板里叫两个名字。
 * 轮次自带可选的 label 字段，所以调用方在打开面板前把词典文案贴上去，面板只管显示。
 */
const ROUND_LABEL_KEY: Record<SourceRound["tool"], string> = {
  searchNotes: "agent.sources.round.notes",
  searchNoteImages: "agent.sources.round.notes",
  imageSearch: "agent.sources.round.images",
  webSearch: "agent.sources.round.web",
};

export function sourceRoundLabelKey(tool: SourceRound["tool"]): string {
  return ROUND_LABEL_KEY[tool];
}

/** 复制轮次并贴上词典文案；sources 数组保持同一引用（调用方还在按 indexOf 取下标）。 */
export function labelRounds(rounds: readonly SourceRound[], t: Translate): SourceRound[] {
  return rounds.map((round) => ({ ...round, label: t(sourceRoundLabelKey(round.tool)) }));
}
