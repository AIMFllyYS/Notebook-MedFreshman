import { tool } from "ai";
import { z } from "zod";
import { runWebSearchDetailed, type WebSearchDetailed } from "@/lib/ai/webSearch";
import type { WebSearchOutput, WebSearchProgress, WebSearchProvider } from "@/lib/ai/agent/tools/webSearch/types";
import {
  dedupeByContextKey,
  normalizeContextKeyPart,
  toText,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";
import { allocateCiteIndex, appendCiteLegend, formatCiteLine } from "@/lib/ai/agent/tools/citeIndex";
import { PROVIDER_LABELS } from "@/lib/ai/search/policy";
import { SEARCH_MAX_SOURCES } from "@/lib/ai/search/selectSources";
import type { SearchItem, SearchProgressEvent } from "@/lib/ai/search/types";
import type { WebSearchSource } from "@/lib/types/chat";

/** 测试可替换联网搜索，避免打真实供应商。 */
export const webSearchIo = { runWebSearchDetailed };

type ChannelMsg =
  | { type: "event"; event: SearchProgressEvent }
  | { type: "result"; result: WebSearchDetailed };

/**
 * 单生产者—单消费者异步队列：搜索子智能体在推进度事件，async-generator 形态的
 * execute 按到达节奏逐个 yield 成 preliminary 输出——既是前端走马灯的数据源，
 * 这些真实流块也在工具执行期间持续喂客户端看门狗（等价于"有事在做"的心跳），
 * 而"真没数据"的 idle 语义不变（没事件就没字节，超时照判）。
 */
function createChannel() {
  const queue: ChannelMsg[] = [];
  const waiters: (() => void)[] = [];
  return {
    push(msg: ChannelMsg) {
      queue.push(msg);
      waiters.shift()?.();
    },
    async take(): Promise<ChannelMsg | undefined> {
      if (queue.length) return queue.shift();
      await new Promise<void>((resolve) => waiters.push(resolve));
      return queue.shift();
    },
  };
}

function progressText(progress: WebSearchProgress): string {
  if (progress.stage === "planning") return "联网搜索中：正在选择搜索源…";
  if (progress.stage === "synthesizing") return "联网搜索中：多源已返回，正在交叉综述…";
  if (progress.stage === "done") return "联网搜索完成。";
  const parts = progress.providers.map((p) => {
    if (p.state === "done") return p.label + " ✓" + (typeof p.count === "number" ? "（" + p.count + " 条）" : "");
    if (p.state === "error") return p.label + " ✗";
    return p.label + " 搜索中…";
  });
  return "联网搜索中：" + (parts.join("；") || "正在检索…");
}

/**
 * 联网搜索：背后是**多供应商并行 + 精选截断 + 跨源综述**的子智能体。
 *
 * 三家的定位（提示词里也要说清，模型才知道该选谁）：
 *  - 默认优先级：Kimi > 智谱 > Perplexity
 *  - 权威性：    Perplexity > Kimi > 智谱
 *  - 成本敏感：  智谱 > Kimi > Perplexity
 *
 * execute 是 async generator：执行期间的每次进度事件都会作为 preliminary
 * 输出流给前端（part.preliminary=true，带 progress 字段），最后一次 yield 才是
 * 喂给模型的正式结果（toModelOutput 只吃最终值）。
 */
export function createWebSearchTool(runtime: StudyToolRuntime) {
  return tool({
    description: [
      "联网搜索互联网实时信息（外部事实、最新进展、需要查证的数字与人名）。用后须注明来源，并与教材内容区分。",
      "可以自己决定这次搜几个来源（mode）：",
      "- daily（默认）：Kimi + 智谱。日常事务、新闻、天气、价格这类问题用它，便宜够快。",
      "- academic：Perplexity + Kimi。学术问题、需要证据/数据/权威来源时用它（Perplexity 权威性最高）。",
      "- comprehensive：三家全上并做跨源综述。问题复杂、需要交叉验证或系统性分析时才用（受总预算 ~90s 约束，慢源会被截断但已收到的部分仍返回）。",
      "- auto：交给策略按问题性质自动判断（拿不准就用它）。",
      "也可以显式点名 providers（kimi / zhipu / perplexity 里的一家或几家）。多源结果会自动按 URL 去重，并在两家以上出结果时做一次跨源综述。",
      `单次调用最多回灌 ${SEARCH_MAX_SOURCES} 条精选来源（按相关度与权威性截断，截断数量会在结果里说明）。一次没搜够就分多次搜：换关键词、拆子问题、或调 mode/providers/numResults 再搜一次——别用同一个 query 反复调。`,
      "numResults 控制每家源取回多少条（默认 5，上限 30）；学术/综述类问题建议给到 15–30。",
      "回灌结果带有 [n] 编号。凡依据某条来源写出的句子，句末必须标注对应编号。",
    ].join("\n"),
    inputSchema: z.object({
      query: z.string().describe("搜索关键词，建议用中文"),
      mode: z.enum(["auto", "daily", "academic", "comprehensive"]).optional().describe("搜索广度，缺省 auto"),
      providers: z.array(z.enum(["kimi", "zhipu", "perplexity"])).max(3).optional().describe("显式点名搜索源"),
      numResults: z.number().optional().describe("每个来源返回的结果数量，默认 5，上限 30"),
    }),
    execute: async function* ({ query, mode, providers, numResults }): AsyncGenerator<WebSearchOutput, void, void> {
      const channel = createChannel();
      const status = new Map<WebSearchProvider, { id: WebSearchProvider; label: string; state: "pending" | "done" | "error"; count?: number }>();
      const snapshot = (stage: WebSearchProgress["stage"]): WebSearchProgress => ({
        stage,
        // 克隆条目：同一对象后续还会被改，不能把可变引用塞进已发出的输出。
        providers: [...status.values()].map((p) => ({ ...p })),
      });
      /**
       * 已流到前端的原始来源（按 URL 去重，保序）。
       * 「搜到一个显示一个」就靠它：每家一返回就把条目并进来，下一次 preliminary 输出
       * 带着完整累积清单——前端来源条因此是逐张长出来的，而不是等最后一次性冒出来。
       * 这只是**展示层**的候选；喂给模型的仍只有最后一次 yield 的精选结果。
       */
      const streamed: WebSearchSource[] = [];
      const streamedUrls = new Set<string>();
      const absorb = (items: readonly SearchItem[] | undefined) => {
        for (const item of items ?? []) {
          const key = item.url.replace(/[#?].*$/, "").replace(/\/+$/, "").toLowerCase();
          if (!key || streamedUrls.has(key)) continue;
          streamedUrls.add(key);
          streamed.push({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            media: item.media,
          });
        }
      };
      const running = webSearchIo.runWebSearchDetailed(query, Number(numResults) || 5, {
        mode: mode ?? "auto",
        providers,
        onProgress: (event) => channel.push({ type: "event", event }),
      }).then(
        (result) => channel.push({ type: "result", result }),
        // 子智能体承诺不抛；真抛了也别让生成器悬挂，落成失败文本交差。
        (error: unknown) => channel.push({
          type: "result",
          result: {
            content: "联网搜索执行失败：" + String((error as { message?: unknown })?.message ?? error),
            sources: [], cacheHit: false,
          },
        }),
      );
      void running;

      yield { text: progressText({ stage: "planning", providers: [] }), sources: [], progress: snapshot("planning") };

      let final: WebSearchDetailed | undefined;
      for (;;) {
        const msg = await channel.take();
        if (!msg || msg.type === "result") {
          final = msg?.type === "result" ? msg.result : undefined;
          break;
        }
        const ev = msg.event;
        if (ev.stage === "planned") {
          for (const id of ev.planned ?? []) {
            status.set(id, { id, label: PROVIDER_LABELS[id], state: "pending" });
          }
          yield { text: progressText(snapshot("searching")), sources: [], progress: snapshot("searching") };
        } else if (ev.stage === "provider" && ev.provider) {
          const cur = status.get(ev.provider)
            ?? { id: ev.provider, label: PROVIDER_LABELS[ev.provider], state: "pending" as const };
          cur.state = ev.providerState === "error" ? "error" : "done";
          cur.count = ev.resultCount ?? 0;
          status.set(ev.provider, cur);
          // 这一家刚回的条目立刻并进流式清单：前端下一次渲染就有新卡。
          absorb(ev.items);
          yield {
            text: progressText(snapshot("searching")),
            sources: [...streamed],
            progress: snapshot("searching"),
          };
        } else if (ev.stage === "synthesizing") {
          yield { text: progressText(snapshot("synthesizing")), sources: [...streamed], progress: snapshot("synthesizing") };
        }
        // "done" 事件不必发 preliminary：正式结果紧随其后。
      }

      const r = final ?? { content: "联网搜索未返回结果。", sources: [], cacheHit: false };
      const contextKey = "web:" + normalizeContextKeyPart(query) + ":" + (mode ?? "auto") + ":" + (providers ?? []).join("_");
      if (runtime.loadedContextKeys.has(contextKey)) {
        yield dedupeByContextKey(runtime, "webSearch", {
          text: r.content,
          contextKey,
          sources: r.sources,
          cacheHit: r.cacheHit,
          omittedSources: r.omittedSources,
          progress: snapshot("done"),
        });
        return;
      }
      const sources = (r.sources ?? []).map((source) => ({
        ...source,
        citeIndex: allocateCiteIndex(runtime),
      }));
      const lines = sources.map((source) =>
        formatCiteLine(source.citeIndex, source.title || source.url || source.alt || "", source.url ?? ""),
      );
      yield dedupeByContextKey(runtime, "webSearch", {
        text: appendCiteLegend(r.content, lines),
        // 不同搜索策略不能互相去重：同一个问题用 daily 搜过，改成 comprehensive 必须真的再搜一次。
        contextKey,
        sources,
        cacheHit: r.cacheHit,
        omittedSources: r.omittedSources,
        progress: snapshot("done"),
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
