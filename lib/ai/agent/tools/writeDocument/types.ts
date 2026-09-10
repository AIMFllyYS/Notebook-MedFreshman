import type { DocumentSpec } from "@/lib/documents/types";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export type WriteDocumentInput = DocumentSpec;

export interface WriteDocumentOutput extends TextToolOutput {
  /** 前端据此独立请求 /api/document 分节生成。 */
  documentId: string;
  spec: DocumentSpec;
  /** 发起时选中的模型 id，避免后续切换模型污染文档请求。 */
  modelId?: string;
  unsupportedReason?: string;
}
