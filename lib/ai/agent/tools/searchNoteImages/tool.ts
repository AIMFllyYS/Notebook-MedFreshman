import { tool } from "ai";
import { z } from "zod";
import { searchNoteImages, describeNoteImagesForModel } from "@/lib/content/noteImages";
import type { SearchNoteImagesOutput } from "@/lib/ai/agent/tools/searchNoteImages/types";
import {
  dedupeByContextKey,
  normalizeContextKeyPart,
  toText,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";

/** 测试可替换检索，避免扫全库笔记。 */
export const searchNoteImagesIo = { searchNoteImages, describeNoteImagesForModel };

export function createSearchNoteImagesTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      "检索课程笔记中已经存在的图片（教材插图、课堂板书示意图等）。当讲解需要引用教材已有图示、或学生问“书里的图/笔记里的图”时调用。返回站内根相对路径，可直接以 ::figure 指令嵌入回复。",
    inputSchema: z.object({
      query: z.string().describe("图片检索短语，如图注关键词、知识点名称，如 '肝小叶' '凸透镜成像' '被覆上皮'。"),
      crossYear: z.boolean().optional().describe("true 时跨学年检索。医学基础常与大一大二化学/物理交叉，此时应打开。"),
      subjectId: z.string().optional().describe("限定科目 id，如 histology、biochemistry、anatomy。"),
      limit: z.number().optional().describe("返回图片数量，默认 6，最大 12。"),
    }),
    execute: async ({ query, crossYear, subjectId, limit }): Promise<SearchNoteImagesOutput> => {
      const images = searchNoteImagesIo.searchNoteImages(query, {
        academicYear: crossYear ? "all" : ctx.academicYear,
        subjectId,
        preferSubjectId: subjectId ? undefined : ctx.subjectId,
        limit: Number(limit) || undefined,
      });
      return dedupeByContextKey<SearchNoteImagesOutput>(runtime, "searchNoteImages", {
        text: searchNoteImagesIo.describeNoteImagesForModel(query, images),
        contextKey: `note-img:${normalizeContextKeyPart(query)}`,
        images,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
