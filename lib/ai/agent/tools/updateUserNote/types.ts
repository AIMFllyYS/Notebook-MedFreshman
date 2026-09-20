import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export type UpdateUserNoteAction = "update" | "delete";

export interface UpdateUserNoteInput {
  markdown?: string;
  title?: string;
  noteId?: string;
  action?: UpdateUserNoteAction;
}

/**
 * updateUserNote 的返回值 = 一份「待用户同意的候选稿」，不是已经完成的写入。
 *
 * 工具本身只产出候选稿；真正的数据变更发生在客户端用户点击「同意修改 / 确认删除」之后
 * （见 lib/stores/noteChangeProposals.ts）。因此这里没有任何「已完成」语义：
 * `ok` 只说明服务端产出了一份可确认的候选稿。
 */
export interface UpdateUserNoteOutput extends TextToolOutput {
  /** 幂等键：一次工具调用 = 一份候选稿。取 toolCallId，刷新/重放历史都不变。 */
  proposalId: string;
  /** 服务端是否产出了可确认的候选稿。false 时前端不渲染确认卡。 */
  ok: boolean;
  noteId: string;
  markdown: string;
  title?: string;
  action: UpdateUserNoteAction;
  /** 生成草稿时模型读到的正文是否完整；false = 被截断，禁止整篇替换。 */
  sourceComplete: boolean;
  /** 草稿依据的正文指纹（markdownDigest(模型实际读到的正文)）；点同意时做并发校验。 */
  baseDigest: string;
  /** 供确认卡显示的一句话变更说明；空串表示没有可确认的操作。 */
  summary: string;
}
