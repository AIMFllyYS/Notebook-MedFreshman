// 交互式 HTML 产物生成：用一次独立的 LLM 流式调用产出一个自包含 HTML 文档。
// 本模块只负责把上游 HTML delta 转换成 artifact 事件，由 /api/artifact 独立 SSE 路由消费。
import type { LanguageModel } from "ai";
import { APICallError } from "@ai-sdk/provider";
import type { ResolvedProvider } from "@/lib/ai/provider";
import { buildCustomModelRegistryId } from "@/lib/ai/models";
import { resolveLanguageModel } from "@/lib/ai/sdk/languageModel";
import { streamRouteText } from "@/lib/ai/sdk/routeGeneration";

const ARTIFACT_SYSTEM = `你是交互式教学演示生成专家。你的唯一任务是输出一个完整、自包含的 HTML 文档。

## 严格输出规则（违反将导致渲染失败）
- 只输出 HTML 代码本身。不要输出任何解释、说明、注释、问候或总结文字。
- 不要使用 \`\`\` 代码围栏包裹输出。
- 第一个字符必须是 <!DOCTYPE html>，最后一个字符应是 </html>。
- 如果你输出了 HTML 以外的任何内容，系统将无法渲染演示，用户将看到空白。

## HTML 结构要求
- 必须以 <!DOCTYPE html> 开头，包含 <html lang="zh"><head><body>。
- 自写的 CSS 与 JavaScript 内联在 <style> 和 <script> 标签中。
- **允许引用常用 CDN 库**（运行环境可联网）：优先用 cdnjs / jsdelivr / unpkg 的 <script src=...> 或 <link href=...>，例如 Chart.js、D3、Three.js、ECharts、KaTeX/MathJax、GSAP、Tailwind Play CDN 等。需要图表/3D/数学排版/复杂动画时**应当**引库，不必再纯手写。
- 仅引你真正用到的库，给 <script src> 标明完整可用的 CDN 地址（带版本号）；纯 JS/SVG/Canvas 能轻松搞定的简单图形则不必引库。

## 交互与设计要求
- 面向学习者，做成可交互的（滑块/按钮/拖拽即时改变可视化），帮助直观理解给定知识点。
- 深色背景友好（body 背景用 #1a1a2e 或类似深色）、布局自适应（width:100%）、中文文案。
- 代码精简优先：核心交互优先，避免冗余装饰；保持精简，但复杂演示可按需扩展（约 16000 字符以内）。

## 骨架模板（可在此基础上填充）
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { background:#1a1a2e; color:#e0e0e0; font-family:system-ui,sans-serif; margin:0; padding:16px; }
  /* 在此添加样式 */
</style>
</head>
<body>
  <!-- 在此添加 HTML 结构 -->
  <script>
    // 在此添加交互逻辑
  </script>
</body>
</html>`;

export function stripFences(s: string): string {
  let t = s.trim();
  // 去掉可能的 ```html ... ``` 围栏
  t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  return t.trim();
}

/**
 * 从原始输出中提取 HTML 文档部分。
 * 优先匹配 <!DOCTYPE html>...</html>，回退到 <html...</html>，再回退到原文。
 * 这层防护确保即使 LLM 在 HTML 前后输出了解释文字，也能正确提取。
 */
export function extractHtml(raw: string): string {
  const fullMatch = raw.match(/<!DOCTYPE\s+html>[\s\S]*<\/html>/i);
  if (fullMatch) return fullMatch[0].trim();

  const htmlMatch = raw.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) return htmlMatch[0].trim();

  return raw;
}

/**
 * 收尾并“尽量修复”生成的 HTML：提取 + 去围栏 + 对被截断（达到 max_tokens 而中途停止）的文档做补救，
 * 避免未闭合的 <script>/<body>/<html> 导致 iframe 渲染整段空白。
 */
export function finalizeHtml(raw: string, truncated: boolean): string {
  let html = extractHtml(raw);
  html = stripFences(html);
  if (!html) return html;
  const lower = html.toLowerCase();

  // 截断时，若停在某个标签中途（最后一个 '<' 之后没有匹配的 '>'），丢弃这半截标签。
  if (truncated) {
    const lt = html.lastIndexOf("<");
    const gt = html.lastIndexOf(">");
    if (lt > gt) html = html.slice(0, lt);
  }

  // 平衡 <script>：未闭合会把后续内容全部当脚本吞掉。
  const openScript = (lower.match(/<script\b/g) || []).length;
  const closeScript = (lower.match(/<\/script>/g) || []).length;
  for (let i = 0; i < openScript - closeScript; i++) html += "\n</script>";

  // 补全 body / html 闭合标签。
  if (lower.includes("<body") && !lower.includes("</body>")) html += "\n</body>";
  if (lower.includes("<html") && !lower.includes("</html>")) html += "\n</html>";

  return html;
}

export type ArtifactStreamEvent =
  | { type: "artifact"; id: string; status: "start"; title: string }
  | { type: "artifact"; id: string; status: "delta"; delta: string }
  | { type: "artifact"; id: string; status: "done"; html: string }
  | { type: "artifact"; id: string; status: "error"; message: string };

interface StreamInteractiveArtifactOptions {
  send: (event: ArtifactStreamEvent) => void;
  artifactId: string;
  args: { title?: string; prompt?: string };
  provider: ResolvedProvider;
  /** The route passes its resolved model so endpoint failover remains intact. */
  model?: LanguageModel;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * 流式生成交互式 HTML 产物。
 * 调用方负责把 send() 发出的事件编码为 SSE 或其他传输格式。
 */
export async function streamInteractiveArtifact(
  options: StreamInteractiveArtifactOptions,
): Promise<void> {
  const { send, artifactId, args, provider, signal, timeoutMs = provider.timeoutMs } = options;
  const title = (args.title || "交互演示").slice(0, 60);
  const prompt = (args.prompt || args.title || "").trim();

  send({ type: "artifact", id: artifactId, status: "start", title });

  if (!prompt) {
    send({ type: "artifact", id: artifactId, status: "error", message: "缺少演示描述" });
    return;
  }

  try {
    // Preserve the helper's older provider-only callers, including explicit
    // Anthropic endpoints, without resolving their credentials a second time.
    const model = options.model ?? resolveLanguageModel(
      buildCustomModelRegistryId("artifact", provider.apiModelId),
      [{
        id: "artifact", name: "Artifact", baseUrl: provider.baseUrl, apiKey: provider.apiKey,
        models: [{ id: provider.apiModelId, apiProtocol: provider.apiProtocol, thinking: false }],
      }],
    ).model;
    const result = await streamRouteText({
      model,
      instructions: ARTIFACT_SYSTEM,
      prompt: `知识点 / 需求：${prompt}\n标题：${title}`,
      temperature: 0.4,
      maxOutputTokens: 4096,
      abortSignal: signal,
      idleTimeoutMs: timeoutMs,
      onText: (delta) => send({ type: "artifact", id: artifactId, status: "delta", delta }),
    });

    // finish_reason === "length" 表示达到 max_tokens 被截断 → 收尾时补救闭合标签。
    const html = finalizeHtml(result.text, result.finishReason === "length");
    send({ type: "artifact", id: artifactId, status: "done", html });
  } catch (e) {
    const isAbort = e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError");
    send({
      type: "artifact",
      id: artifactId,
      status: "error",
      message: isAbort ? "生成超时，请重试" : APICallError.isInstance(e) && e.statusCode
        ? `生成失败 ${e.statusCode}` : String((e as Error)?.message ?? e),
    });
  }
}
