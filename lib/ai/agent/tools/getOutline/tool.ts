import { tool } from "ai";
import { z } from "zod";
import { getMultiSubjectOutline, type ContentSearchScope } from "@/lib/content/loader";
import { ACADEMIC_YEAR_IDS, ACADEMIC_YEAR_LABELS } from "@/lib/constants/academic-year";
import { subjectsOfYear } from "@/lib/content-data/subjects.registry";
import type { GetOutlineOutput } from "@/lib/ai/agent/tools/getOutline/types";
import { dedupeByContextKey, toText, type StudyToolContext, type StudyToolRuntime } from "@/lib/ai/agent/tools/_shared";

/** 由 registry 拼出「大二上：细胞生物/生化/…；大一下：概率论/物理/…」。空学期不写入提示词。 */
function describeSubjectsByYear(): string {
  return ACADEMIC_YEAR_IDS.map((year) => {
    const names = subjectsOfYear(year)
      .filter((s) => s.id !== "other")
      .map((s) => s.shortName);
    if (names.length === 0) return null;
    return `${ACADEMIC_YEAR_LABELS[year].replace("学期", "")}：${names.join("/")}`;
  })
    .filter((part): part is string => part !== null)
    .join("；");
}

export function createGetOutlineTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    // 学年科目名单来自 registry，不随当前 UI 学年变化，避免换学年 bust 工具 schema。
    description: `获取课程目录。默认返回当前学年科目（${describeSubjectsByYear()}）。需要了解课程全貌、各章关系，或把某知识点定位到哪一小节时调用。返回的每个条目后附有复合路径（如 anatomy/textbook/ch01-1），可直接传给 getSection 获取全文。跨学年知识（如大一化学与大二生化）把 crossYear 设为 true。当前学年见 system 定位行。`,
    inputSchema: z.object({
      crossYear: z.boolean().optional().describe("true 时返回全部学年目录。默认 false，只返回当前学年。"),
    }),
    execute: async ({ crossYear }): Promise<GetOutlineOutput> => {
      const scope: ContentSearchScope = crossYear ? "all" : ctx.academicYear;
      return dedupeByContextKey(runtime, "getOutline", {
        text: getMultiSubjectOutline(scope),
        contextKey: crossYear ? "outline:all" : `outline:${scope}`,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
