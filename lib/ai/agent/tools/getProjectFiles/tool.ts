import { tool } from "ai";
import { z } from "zod";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import type { GetProjectFilesOutput } from "@/lib/ai/agent/tools/projectFiles/types";

/**
 * 项目文件索引：本地解析出来的文件树 + 每个文件的切片表（id / 标题 / 字数 / 首 80 字）。
 *
 * 为什么只有索引：文件内容只在本机（不上云），服务端拿不到浏览器存储——正文靠
 * 「带入对话」的切片随请求上行，再用 readProjectSlices 读。
 */
export function createGetProjectFilesTool(ctx: StudyToolContext) {
  const files = ctx.projectFiles ?? [];
  return tool({
    description:
      "查看项目文件的索引：文件树 + 每个文件的切片表（切片 id、标题、字数、摘要）。项目内容是本地解析的，正文不在上下文里——先看索引，再用 readProjectSlices 读需要的切片；如果切片标着「未携带」，告诉用户在项目文件窗点「带入对话」。",
    inputSchema: z.object({
      fileId: z.string().optional().describe("只看某一个文件；不传就列整个项目"),
      query: z.string().optional().describe("按文件名 / 切片标题 / 摘要粗筛"),
    }),
    execute: async ({ fileId, query }): Promise<GetProjectFilesOutput> => {
      if (files.length === 0) {
        return {
          text: "当前对话没有带项目文件。可以让用户在右栏「+ → 项目文件」里导入本机文件，或引用一条 Studio 教材。",
          found: false,
          fileCount: 0,
          sliceCount: 0,
        };
      }
      const needle = query?.trim().toLowerCase() ?? "";
      const pool = files.filter((file) => {
        if (fileId && file.fileId !== fileId) return false;
        if (!needle) return true;
        const hay = [file.name, ...file.slices.map((slice) => `${slice.title} ${slice.summary}`)].join(" ").toLowerCase();
        return hay.includes(needle);
      });
      if (pool.length === 0) {
        const available = files.map((file) => `${file.fileId}（${file.name}）`).join("、");
        return {
          text: `没有匹配的项目文件。可用：${available || "（空）"}`,
          found: false,
          fileCount: files.length,
          sliceCount: 0,
        };
      }
      const blocks = pool.map((file) => {
        const head = file.kind === "studio-ref"
          ? `- ${file.name}｜Studio 教材引用｜path: ${file.studioRef?.path ?? "（缺路径）"}`
          : `- ${file.name}｜${file.slices.length} 片｜${file.status === "indexed" ? "已索引" : file.status === "parsing" ? "解析中" : `解析失败（${file.error ?? "未知"}）`}`;
        const slices = file.slices.length
          ? file.slices
              .map((slice) => `    - ${slice.sliceId}｜${slice.title}｜${slice.chars} 字｜${slice.summary}`)
              .join("\n")
          : file.kind === "studio-ref"
            ? "    （软链接：正文请用 getSection(path) 读）"
            : "    （还没有切片）";
        return `${head}\n${slices}`;
      });
      return {
        text: `【项目文件索引】共 ${pool.length} 个文件\n${blocks.join("\n")}\n\n要读正文：readProjectSlices(fileId, sliceIds 或 query)。`,
        found: true,
        fileCount: pool.length,
        sliceCount: pool.reduce((sum, file) => sum + file.slices.length, 0),
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}