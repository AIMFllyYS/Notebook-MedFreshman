// writeDocument 工具的参数校验与归一化（服务端）。

import { z } from "zod";
import {
  DOCUMENT_FORMATS,
  DOCUMENT_GENRES,
  type DocumentLanguage,
  type DocumentSpec,
} from "@/lib/documents/types";

const documentSpecSchema = z.object({
  title: z.string().min(1).describe("文章标题"),
  format: z.enum(DOCUMENT_FORMATS as [string, ...string[]]).describe("目标交付格式：markdown / docx / pdf"),
  genre: z.enum(DOCUMENT_GENRES as [string, ...string[]]).describe("文体：article / paper / report / review-notes / essay"),
  brief: z.string().min(1).describe("写作要求：主题、受众、论点、风格、需要覆盖的知识点等"),
  outline: z.array(z.string().min(1)).optional().describe("可选的章节标题列表；省略时由 outline 阶段生成"),
  references: z.string().optional().describe("参考材料（模型从笔记/检索整理的要点与引用）"),
  targetWords: z.number().int().min(100).optional().describe("目标总字数（中文按字、英文按词）"),
  language: z.enum(["zh", "en"]).optional().describe("语言，默认 zh"),
});

export function validateDocumentSpec(input: unknown): { ok: true; spec: DocumentSpec } | { ok: false; error: string } {
  const parsed = documentSpecSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("；") };
  }
  return {
    ok: true,
    spec: {
      ...parsed.data,
      language: (parsed.data.language ?? "zh") as DocumentLanguage,
    } as DocumentSpec,
  };
}

export { documentSpecSchema };
