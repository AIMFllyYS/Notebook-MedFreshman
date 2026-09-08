// AI 工具系统（单一真相源）：AI SDK `tool()` 定义 + 服务端执行。
// 全科目覆盖：基于 contentTree，支持复合路径如 "physics/detail/2.1"。
//
// 每次请求通过 buildStudyTools(ctx) 以闭包创建一套工具：闭包捕获当前页面定位、技能列表、
// 学年，以及跨轮次的可变状态（imageSearch 配额、contextKey 去重）。
// output 只有 `text` 回灌模型（toModelOutput），其余字段供前端思考链展示。

import { tool, type ToolSet } from "ai";
import { z } from "zod";
import {
  getMultiSubjectOutline,
  resolveContentPath,
  findContentItem,
  readContentMarkdown,
  searchAllContent,
  type ContentSearchScope,
} from "@/lib/content/loader";
import { runWebSearchDetailed } from "@/lib/ai/webSearch";
import { searchImages, trackPhotoDownload } from "@/lib/ai/imageSearch";
import type { Skill } from "@/lib/types/skill";
import { CHEM_DRAW_GUIDE } from "@/lib/chemistry/svgTemplates";
import {
  ACADEMIC_YEAR_IDS,
  ACADEMIC_YEAR_LABELS,
  type AcademicYearId,
} from "@/lib/constants/academic-year";
import { subjectsOfYear } from "@/lib/content-data/subjects.registry";
import type {
  StudyToolName,
  GetCurrentPageOutput,
  GetOutlineOutput,
  GetSectionOutput,
  SearchNotesOutput,
  SearchNoteImagesOutput,
  WebSearchOutput,
  ImageSearchOutput,
  RenderInteractiveOutput,
  DrawDiagramOutput,
  GenerateImageOutput,
  UseSkillOutput,
  TextToolOutput,
  CreateQuizInput,
  CreateQuizOutput,
  WriteDocumentInput,
  WriteDocumentOutput,
} from "@/lib/ai/agent/toolTypes";
import { getIndexHealth } from "@/lib/ai/search/indexHealth";
import { getLastSearchDiagnostics } from "@/lib/ai/search/hybridSearch";
import { createQuizInputSchema, normalizeQuiz, describeQuizForModel } from "@/lib/ai/agent/quizTool";
import { searchNoteImages, describeNoteImagesForModel } from "@/lib/content/noteImages";
import { validateDocumentSpec, documentSpecSchema } from "@/lib/ai/agent/documentTool";

export const IMAGE_SEARCH_MAX_TOTAL = 20;
export const MAX_TOOL_STEPS = 6;

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

export interface StudyToolContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 本次请求携带的全部技能（含正文），供 useSkill 按名取用。 */
  skills: Skill[];
  /** 当前 UI 学年。getOutline / searchNotes 默认只搜该学年，crossYear 可放开。 */
  academicYear: AcademicYearId;
  /** 发起本次对话时选中的模型 id（透传给 renderInteractive / generateImage 的前端卡片）。 */
  modelId?: string;
  /** 生图模式下当前模型不支持 HTML 交互生成的提示。 */
  artifactUnsupportedReason?: string;
}

/** 跨工具轮次的可变状态（同一请求内共享）。 */
export interface StudyToolRuntime {
  imageSearchFetchedCount: number;
  loadedContextKeys: Set<string>;
}

export function createToolRuntime(): StudyToolRuntime {
  return { imageSearchFetchedCount: 0, loadedContextKeys: new Set() };
}

function normalizeContextKeyPart(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** 同一 contextKey 在本次对话工具链中已注入过 → 只回「已加载」提示，避免重复展开全文。 */
function dedupeByContextKey<T extends TextToolOutput & { contextKey?: string; deduped?: boolean }>(
  runtime: StudyToolRuntime,
  toolName: string,
  output: T,
): T {
  if (!output.contextKey) return output;
  if (runtime.loadedContextKeys.has(output.contextKey)) {
    return {
      ...output,
      deduped: true,
      text: `【上下文已加载】${toolName} 的上下文 ${output.contextKey} 已在本次对话工具链中注入过，请引用前文已加载内容，不要重复展开全文。`,
    };
  }
  runtime.loadedContextKeys.add(output.contextKey);
  return output;
}

/** toModelOutput 只回灌 text（必须以内联 lambda 形式传入，预先定型的函数会破坏 tool() 的 OUTPUT 推断）。 */
const toText = (output: TextToolOutput) => ({ type: "text" as const, value: output.text });

function currentPagePayload(ctx: StudyToolContext): string {
  const md = readContentMarkdown(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const title = found
    ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
    : `${ctx.subjectId} / ${ctx.categoryId} / ${ctx.itemId}`;
  if (!md) {
    return `【${title}】该页正文尚未生成（占位）。可结合标题与课程大纲作答，并说明该处正在完善。`;
  }
  return `【${title}】\n\n${md}`;
}

export interface BuildStudyToolsOptions {
  enableSearch: boolean;
  disabled?: string[];
}

/**
 * 构建本次请求的工具集。
 * - enableSearch 控制是否暴露 webSearch/imageSearch；
 * - disabled 来自用户设置；
 * - useSkill 只在有可调用技能时暴露，技能名作为 enum（提升选名准确度，且会话内稳定利于 prefix 缓存）。
 */
export function buildStudyTools(
  ctx: StudyToolContext,
  runtime: StudyToolRuntime,
  opts: BuildStudyToolsOptions,
): ToolSet {
  const disabled = new Set(opts.disabled ?? []);
  const menuSkillNames = ctx.skills.filter((s) => !s.pinned).map((s) => s.name).filter(Boolean);

  const all = {
    getCurrentPage: tool({
      description:
        "获取用户当前正在阅读的页面完整正文（含标题、公式、知识点）。当问题出现'这一节/这页/当前/这里/上面这段/这道题'等指代当前页面的说法时，应优先调用。",
      inputSchema: z.object({}),
      execute: async (): Promise<GetCurrentPageOutput> =>
        dedupeByContextKey(runtime, "getCurrentPage", {
          text: currentPagePayload(ctx),
          contextKey: `page:${ctx.subjectId}/${ctx.categoryId}/${ctx.itemId}`,
        }),
      toModelOutput: ({ output }) => toText(output),
    }),

    getOutline: tool({
      description: `获取课程目录。默认返回当前学年科目（${describeSubjectsByYear()}）。需要了解课程全貌、各章关系，或把某知识点定位到哪一小节时调用。返回的每个条目后附有复合路径（如 anatomy/textbook/ch01-1），可直接传给 getSection 获取全文。跨学年知识（如大一化学与大二生化）把 crossYear 设为 true。`,
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
    }),

    getSection: tool({
      description:
        '按路径获取任意科目任意页面的完整笔记正文，用于跨小节或跨科目讲解与对比（不要凭记忆复述教材）。path 格式为 "科目/分类/内容id"，例如 "physics/detail/2.1"、"chemistry/recording/rec-05"。也可只传 sectionId（如 "1.4"），默认读取当前科目的 detail 分类。可先调用 getOutline 查看有效路径。',
      inputSchema: z.object({
        path: z.string().optional().describe('复合路径，格式 "科目/分类/内容id"，如 "physics/detail/2.1"、"chemistry/recording/rec-05"。优先使用此参数。'),
        sectionId: z.string().optional().describe('向下兼容：纯小节 id（如 "1.4"），默认读取当前科目 detail 分类。优先使用 path 参数。'),
      }),
      execute: async ({ path, sectionId }): Promise<GetSectionOutput> => {
        const input = (path ?? "") || (sectionId ?? "");
        if (!input) {
          return {
            text: '缺少参数：请传入 path（如 "physics/detail/2.1"）或 sectionId（如 "1.4"）。可调用 getOutline 查看有效路径。',
            found: false,
          };
        }
        const resolved = resolveContentPath(input, ctx.subjectId);
        const md = readContentMarkdown(resolved.subjectId, resolved.categoryId, resolved.itemId);
        const contextKey = `section:${resolved.subjectId}/${resolved.categoryId}/${resolved.itemId}`;
        if (!md) {
          return dedupeByContextKey(runtime, "getSection", {
            text: `【${resolved.title}】未找到该页面内容${resolved.found ? "（正文尚未生成）" : "（路径无效）"}。可调用 getOutline 查看有效路径。`,
            contextKey,
            title: resolved.title,
            found: false,
          });
        }
        return dedupeByContextKey(runtime, "getSection", {
          text: `【${resolved.title}】\n\n${md}`,
          contextKey,
          title: resolved.title,
          found: true,
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    searchNotes: tool({
      description:
        "在课程内容（教材、详解、录音、纪要）中做语义+关键词检索，返回带上下文的相关片段及其所在位置。默认只搜当前学年；不确定教材是否讲过某点、或知识点可能跨学年时先检索。查询用知识点短语（如「核糖体」「被覆上皮」），不要用「什么是…」整句。返回结果的 path 字段可直接传给 getSection 获取完整内容；片段不够时必须再调 getSection。",
      inputSchema: z.object({
        query: z.string().describe("检索短语，如 '贝叶斯公式'、'线粒体'、'肝小叶'、'被覆上皮'。用知识点本身，不要用完整问句。"),
        crossYear: z.boolean().optional().describe("true 时跨学年检索（大一与大二都搜）。医学基础常与大一化学/物理交叉，此时应打开。"),
        subjectId: z.string().optional().describe("限定科目 id，如 histology、biochemistry、anatomy、cell-biology、instrumental-analysis。不传则搜当前学年全部科目。"),
      }),
      execute: async ({ query, crossYear, subjectId }): Promise<SearchNotesOutput> => {
        const health = getIndexHealth();
        if (!health.ok) {
          return { text: `检索索引未加载：${health.reason}`, hits: [] };
        }
        const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
        const queryContext = found
          ? `${found.subjectName} ${found.parentTitle ?? ""} ${found.item.title}`.replace(/\s+/g, " ").trim()
          : undefined;
        const scope: ContentSearchScope = crossYear ? "all" : ctx.academicYear;
        const run = (year: ContentSearchScope) =>
          searchAllContent(query, {
            limit: 8,
            academicYear: year,
            subjectId: subjectId || undefined,
            preferSubjectId: subjectId ? undefined : ctx.subjectId,
            queryContext,
          });
        let hits = await run(scope);
        let widened = false;
        if (!hits.length && scope !== "all") {
          hits = await run("all");
          widened = hits.length > 0;
        }
        const diag = getLastSearchDiagnostics();
        const diagnostics = diag
          ? {
              bm25Hits: diag.bm25Hits,
              vecHits: diag.vecHits,
              mode: diag.mode,
              indexBuiltAt: diag.indexBuiltAt || health.manifest?.builtAt,
              ms: diag.ms,
              embedError: diag.embedError,
            }
          : undefined;
        if (!hits.length) {
          return { text: "未检索到相关内容。可尝试更换关键词，或调用 getOutline 浏览目录。", hits: [], diagnostics };
        }
        const lines = hits.map((h) => `[${h.title}] (path: ${h.path})\n…${h.snippet}…`);
        if (widened) lines.unshift("（当前学年无命中，以下为跨学年结果）");
        lines.push('\n如需查看完整内容，可调用 getSection(path: "对应路径")。');
        return dedupeByContextKey(runtime, "searchNotes", {
          text: lines.join("\n\n"),
          contextKey: `search:${normalizeContextKeyPart(query)}`,
          hits: hits.slice(0, 5).map((h) => ({ title: h.title, path: h.path, snippet: h.snippet })),
          diagnostics,
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    webSearch: tool({
      description:
        "联网搜索互联网实时信息，用于教材之外的最新进展、外部事实核实。使用后须注明来源，且与教材内容区分。",
      inputSchema: z.object({
        query: z.string().describe("搜索关键词，建议用中文"),
        numResults: z.number().optional().describe("返回结果数量，默认 5"),
      }),
      execute: async ({ query, numResults }): Promise<WebSearchOutput> => {
        const r = await runWebSearchDetailed(query, Number(numResults) || 5);
        return dedupeByContextKey(runtime, "webSearch", {
          text: r.content,
          contextKey: `web:${normalizeContextKeyPart(query)}`,
          sources: r.sources,
          cacheHit: r.cacheHit,
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    imageSearch: tool({
      description:
        "搜索互联网图片并返回可嵌入的图片链接。当讲解需要配图（如物理实验装置、化学分子结构、生物组织图等）时调用。返回结果包含图片 URL，可直接以 Markdown 图片语法嵌入回复。【重要限制】一次对话中所有 imageSearch 调用合计最多抓取 20 张图片；每次调用 numResults 建议不超过 4；若系统提示已达到限额，禁止再次调用 imageSearch。请在第一次调用时就使用精准关键词，避免因结果不满意而反复重复调用。",
      inputSchema: z.object({
        query: z.string().describe("图片搜索关键词，如 '高斯面示意图'"),
        numResults: z.number().optional().describe("返回图片数量，默认 3，最大 4"),
      }),
      execute: async ({ query, numResults }): Promise<ImageSearchOutput> => {
        const already = runtime.imageSearchFetchedCount;
        if (already >= IMAGE_SEARCH_MAX_TOTAL) {
          return {
            text: `【图片搜索已达本次对话上限 ${IMAGE_SEARCH_MAX_TOTAL} 张，不再抓取新图片】请直接基于已有图片继续讲解。`,
            sources: [],
            provider: "unsplash",
            limitReached: true,
          };
        }
        const remaining = IMAGE_SEARCH_MAX_TOTAL - already;
        const requested = Math.min(Math.max(Number(numResults) || 3, 1), 4);
        const results = await searchImages(query, Math.min(requested, remaining));
        if (!results.length) {
          return { text: `未找到「${query}」的相关图片。`, sources: [], provider: "unsplash" };
        }
        runtime.imageSearchFetchedCount += results.length;
        const text = results
          .map((r, i) => `[${i + 1}] ${r.alt}\n![${r.alt}](${r.url})\nPhoto by [${r.author}](${r.source}) on [Unsplash](https://unsplash.com)`)
          .join("\n\n");
        const quota = `（本次对话已累计抓取 ${runtime.imageSearchFetchedCount}/${IMAGE_SEARCH_MAX_TOTAL} 张）`;
        for (const r of results) trackPhotoDownload(r.downloadLocation);
        return dedupeByContextKey<ImageSearchOutput>(runtime, "imageSearch", {
          text: `${text}\n\n${quota}`,
          contextKey: `image:${normalizeContextKeyPart(query)}`,
          sources: results.map((r) => ({
            title: r.alt || r.author,
            url: r.url,
            snippet: "",
            media: r.thumbnail,
            alt: r.alt,
            author: r.author,
            authorUrl: r.source,
          })),
          provider: "unsplash",
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    searchNoteImages: tool({
      description:
        "检索课程笔记中已经存在的图片（教材插图、课堂板书示意图等）。当讲解需要引用教材已有图示、或学生问“书里的图/笔记里的图”时调用。返回站内根相对路径，可直接以 ::figure 指令嵌入回复。",
      inputSchema: z.object({
        query: z.string().describe("图片检索短语，如图注关键词、知识点名称，如 '肝小叶' '凸透镜成像' '被覆上皮'。"),
        crossYear: z.boolean().optional().describe("true 时跨学年检索。医学基础常与大一大二化学/物理交叉，此时应打开。"),
        subjectId: z.string().optional().describe("限定科目 id，如 histology、biochemistry、anatomy。"),
        limit: z.number().optional().describe("返回图片数量，默认 6，最大 12。"),
      }),
      execute: async ({ query, crossYear, subjectId, limit }): Promise<SearchNoteImagesOutput> => {
        const images = searchNoteImages(query, {
          academicYear: crossYear ? "all" : ctx.academicYear,
          subjectId,
          preferSubjectId: subjectId ? undefined : ctx.subjectId,
          limit: Number(limit) || undefined,
        });
        return dedupeByContextKey<SearchNoteImagesOutput>(runtime, "searchNoteImages", {
          text: describeNoteImagesForModel(query, images),
          contextKey: `note-img:${normalizeContextKeyPart(query)}`,
          images,
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    createQuiz: tool({
      description:
        "把即时检验题/诊断题/练习题/章节小测渲染为可作答的题目卡片。调用后前端直接展示结构化题目，学生可作答、查看提示、提交后自动判分并查看解析。不要再在正文里重复题干、选项、提示或答案。",
      inputSchema: createQuizInputSchema,
      execute: async (input, { toolCallId }): Promise<CreateQuizOutput> => {
        const quizId = `quiz_${toolCallId}`;
        const normalized = normalizeQuiz(input as CreateQuizInput, quizId);
        return {
          text: describeQuizForModel(input.title, normalized),
          quizId,
          title: input.title,
          intent: input.intent ?? "practice",
          questions: normalized.questions,
          droppedCount: normalized.droppedCount,
        };
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    writeDocument: tool({
      description:
        "撰写长文章、论文、报告或复习讲义。调用后前端会展示文档生成卡片并分节流式生成；导出支持 Markdown / Word / LaTeX / PDF。用于需要一次性产出较长、结构化文档的场景（如课程论文、章节总结、实验报告）。",
      inputSchema: documentSpecSchema,
      execute: async (input, { toolCallId }): Promise<WriteDocumentOutput> => {
        const validated = validateDocumentSpec(input);
        const spec = validated.ok ? validated.spec : (input as WriteDocumentInput);
        if (!validated.ok) {
          return {
            text: `文档参数校验未通过：${validated.error}。请修正后重新调用 writeDocument。`,
            documentId: `doc_${toolCallId}`,
            spec,
            unsupportedReason: validated.error,
          };
        }
        return {
          text: `长文档「${spec.title}」已生成任务卡片，将在前端分节生成。请用一句话说明这篇文档将帮助学生做什么，然后继续你的讲解。`,
          documentId: `doc_${toolCallId}`,
          spec,
          modelId: ctx.modelId,
        };
      },
      toModelOutput: ({ output }) => toText(output),
    }),

    renderInteractive: tool({
      description:
        "当一个概念用静态文字难以讲清、且交互能显著提升理解时，调用本工具在后台生成一个可交互的 HTML 演示（例如：可拖动滑块看概率分布随参数变化、物理受力/矢量合成、分子构象翻转/反应机理分步等）。生成后用户可在对话卡片右上角点击「打开演示」。仅在交互确有必要时调用，不要滥用。",
      inputSchema: z.object({
        title: z.string().describe("演示标题（简短）"),
        prompt: z.string().describe("要可视化/讲解的知识点与交互需求的详细描述"),
      }),
      // 产物 id 随 tool 结果下发；前端卡片拿到 title/prompt 后独立请求 /api/artifact 流式生成 HTML，
      // 不阻塞主聊天流。
      execute: async ({ title, prompt }, { toolCallId }): Promise<RenderInteractiveOutput> => ({
        text: `交互演示「${title || "交互演示"}」已开始在前端独立生成。请用一两句话说明这个演示将帮助理解什么，然后继续你的讲解。`,
        artifactId: `art_${toolCallId}`,
        title,
        prompt,
        modelId: ctx.modelId,
        unsupportedReason: ctx.artifactUnsupportedReason,
      }),
      toModelOutput: ({ output }) => toText(output),
    }),

    drawDiagram: tool({
      description:
        'SVG 图形预处理工具：分析图形需求并返回 SVG 编写指南（推荐结构、颜色规范、模板片段）。调用后按指南在回复中编写 <SvgDiagram mode="raw">，标签体必须包含完整 <svg ...>...</svg> 根标签。简单函数图像仍优先用 ::plot。',
      inputSchema: z.object({
        title: z.string().describe("图形标题"),
        description: z.string().describe("需要绘制的图形的详细描述"),
        type: z.enum(["circuit", "optics", "field", "molecule", "geometry", "custom"]).optional().describe("图形类型"),
      }),
      execute: async ({ title, description, type }): Promise<DrawDiagramOutput> => ({
        text: buildDiagramGuidance(type ?? "custom", title || "示意图", description),
      }),
      toModelOutput: ({ output }) => toText(output),
    }),

    generateImage: tool({
      description:
        "AI 生图工具。当 SVG/交互演示无法充分展示（需要写实风格图片、复杂场景、艺术化呈现），或用户明确要求生图时调用。调用后系统会先展示生图提示词卡片，用户批准后才会实际生成图片，生成过程在独立窗口中展示。优先使用用户配置的默认生图模型，未配置时降级使用硅基流动生图模型。不要滥用——优先使用 SVG 和交互演示，仅在确实需要真实图片时调用。",
      inputSchema: z.object({
        prompt: z.string().describe("优化的生图提示词（英文或中文，描述要生成的图片内容、风格、构图等）"),
        title: z.string().describe("图片标题（简短中文）"),
        size: z.enum(["1024x1024", "960x1280", "768x1024", "720x1440", "720x1280"]).optional().describe("图片尺寸"),
        count: z.number().optional().describe("生成数量（1-4），默认 1"),
      }),
      // 不在此处调用生图 API——前端展示批准卡片，用户批准后独立请求 /api/image-gen。
      execute: async ({ prompt, title, size, count }, { toolCallId }): Promise<GenerateImageOutput> => ({
        text: `生图请求「${title || "AI 生图"}」已提交，等待用户批准后才会实际生成。请用一两句话说明这张图将帮助理解什么，然后继续你的讲解。`,
        imageGenId: `img_${toolCallId}`,
        prompt,
        title,
        size: size ?? "1024x1024",
        count: Math.min(Math.max(Number(count) || 1, 1), 4),
        modelId: ctx.modelId,
      }),
      toModelOutput: ({ output }) => toText(output),
    }),

    useSkill: tool({
      description:
        "调用一个用户上传的「技能」，把它的完整内容加载到上下文作为专门指导。当用户的问题与某技能的名称/描述相关时调用；可用技能见系统提示词中的「可调用的技能库」清单。一次只调用最相关的一个技能，同一技能不要重复调用。",
      inputSchema: z.object({
        name: (menuSkillNames.length > 0
          ? z.enum(menuSkillNames as [string, ...string[]])
          : z.string()
        ).describe("要调用的技能名称，必须与技能库清单中的名称完全一致。"),
      }),
      execute: async ({ name }): Promise<UseSkillOutput> => {
        const wanted = String(name ?? "").trim();
        const list = ctx.skills;
        const skill =
          list.find((s) => s.name === wanted) ??
          list.find((s) => s.name.toLowerCase() === wanted.toLowerCase());
        if (!skill) {
          const available = list.map((s) => s.name).join("、") || "（无）";
          return { text: `未找到名为「${wanted}」的技能。可用技能：${available}。`, skill: wanted, found: false };
        }
        const head = skill.description ? `${skill.description}\n\n` : "";
        return dedupeByContextKey(runtime, "useSkill", {
          text: `【技能：${skill.name}】\n${head}${skill.content}`,
          contextKey: `skill:${skill.id || normalizeContextKeyPart(skill.name)}`,
          skill: skill.name,
          found: true,
        });
      },
      toModelOutput: ({ output }) => toText(output),
    }),
  } satisfies Record<StudyToolName, unknown>;

  const names: StudyToolName[] = [
    "getCurrentPage",
    "getOutline",
    "getSection",
    "searchNotes",
    "searchNoteImages",
    "renderInteractive",
    "drawDiagram",
    "generateImage",
    "createQuiz",
    "writeDocument",
  ];
  if (opts.enableSearch) names.push("webSearch", "imageSearch");
  if (menuSkillNames.length > 0) names.push("useSkill");

  const selected: ToolSet = {};
  for (const n of names) {
    if (!disabled.has(n)) selected[n] = all[n];
  }
  return selected;
}

// ─── drawDiagram 引导壳 ───────────────────────────────────────────────

const DIAGRAM_GUIDANCE_COMMON = `【颜色规范】
- 线条/文字：currentColor（自动适配主题）
- 强调色：var(--diagram-primary)、var(--diagram-secondary)、var(--diagram-tertiary)
- 错误/警告：var(--diagram-error)
- 填充/背景：none 或 var(--diagram-surface)
- 禁止硬编码 black/white/#000/#fff`;

const TYPE_GUIDANCE: Record<string, { dims: string; tips: string }> = {
  molecule: {
    dims: 'width="400" height="300"',
    tips: CHEM_DRAW_GUIDE,
  },
  circuit: {
    dims: 'width="550" height="350"',
    tips: `【电路元件模板】
- 导线：<line stroke="currentColor" stroke-width="2"/>
- 电阻：锯齿线（6段 zigzag）或矩形
- 电容：两条平行短线（间距5px）
- 电池：一长一短平行线
- 开关：断开线段 + 圆点
- 电流方向：marker-end 箭头
- 节点：<circle r="3" fill="currentColor"/>`,
  },
  optics: {
    dims: 'width="550" height="300"',
    tips: `【光学元件模板】
- 凸透镜：双弧线 + 上下箭头
- 凹透镜：内凹弧线 + 上下反向箭头
- 光线：<line stroke="var(--diagram-primary)"/> + marker-end
- 焦点标记：<circle r="3"/> + "F" 文字
- 虚像/虚光线：stroke-dasharray="5 3"
- 光轴：<line stroke="currentColor" stroke-dasharray="2 4"/>`,
  },
  field: {
    dims: 'width="450" height="400"',
    tips: `【场线模板】
- 电场线：<path d="M... Q..." /> 二次贝塞尔曲线 + marker-end
- 正电荷：<circle fill="var(--diagram-error)"/> + "+" 文字
- 负电荷：<circle fill="var(--diagram-primary)"/> + "−" 文字
- 等势线：<circle fill="none" stroke-dasharray="4 3"/>
- 磁场：用 ⊙（出纸面）和 ⊗（入纸面）表示`,
  },
  geometry: {
    dims: 'width="450" height="400"',
    tips: `【几何模板】
- 顶点标签：<text font-size="14" font-weight="600">A</text>（偏移顶点外侧）
- 边：<line stroke="currentColor" stroke-width="1.5"/>
- 角弧：<path d="M... A..." fill="none"/>（小圆弧）
- 辅助线：stroke-dasharray="4 3" + 较细 stroke-width="1"
- 直角标记：小正方形 <rect width="8" height="8" fill="none"/>
- 长度标注：平行偏移线 + 双箭头 + 数值文字`,
  },
  custom: {
    dims: 'width="500" height="350"',
    tips: `【通用建议】
- 使用 <defs> 定义可复用的 marker（箭头等）
- 文字标注用 <text>，对齐用 text-anchor
- 分组用 <g transform="translate(...)">
- 保持元素间留足间距（≥20px）`,
  },
};

function buildDiagramGuidance(type: string, title: string, desc: string): string {
  const guide = TYPE_GUIDANCE[type] || TYPE_GUIDANCE.custom;
  return `【drawDiagram 编写指南】
类型：${type} | 需求：${desc}

【输出格式】
<SvgDiagram title="${title}" mode="raw" ${guide.dims}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">
    ...SVG 元素...
  </svg>
</SvgDiagram>

${DIAGRAM_GUIDANCE_COMMON}

${guide.tips}

请在你的下一段回复中直接输出完整的 <SvgDiagram> 标签；mode="raw" 的标签体必须是完整 <svg ...>...</svg>，不要只输出 <path>/<rect>/<text> 等 SVG 子元素。`;
}
