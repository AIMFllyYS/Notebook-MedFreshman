// 交互式 HTML 产物生成（"子智能体"）：当主模型调用 renderInteractive 工具时，
// 用一次独立的 LLM 流式调用产出一个自包含 HTML 文档。
//
// 【内联模式】所有 artifact 事件（start/delta/done/error）通过主 SSE 流直接推送，
// 不再依赖 artifactRegistry 内存态和独立 /api/artifact-stream 端点。
// 主路由 await 本函数，生成完成后再继续对话。单连接、单请求生命周期，
// 兼容本地 dev 和 Serverless 部署（EdgeOne Pages）。
import { chatCompletionsUrl, type ResolvedProvider } from "@/lib/ai/provider";

const ARTIFACT_SYSTEM = `你是交互式教学演示生成专家。你的唯一任务是输出一个完整、自包含的 HTML 文档。

## 严格输出规则（违反将导致渲染失败）
- 只输出 HTML 代码本身。不要输出任何解释、说明、注释、问候或总结文字。
- 不要使用 \`\`\` 代码围栏包裹输出。
- 第一个字符必须是 <!DOCTYPE html>，最后一个字符应是 </html>。
- 如果你输出了 HTML 以外的任何内容，系统将无法渲染演示，用户将看到空白。

## HTML 结构要求
- 必须以 <!DOCTYPE html> 开头，包含 <html lang="zh"><head><body>。
- 所有 CSS 与 JavaScript 全部内联在 <style> 和 <script> 标签中。
- 严禁任何外部网络依赖：不要 <script src=...>、不要 <link href=...> 外链。
- 公式/图形用纯 JS、SVG 或 Canvas 自行绘制，不要引入任何库。

## 交互与设计要求
- 面向学习者，做成可交互的（滑块/按钮/拖拽即时改变可视化），帮助直观理解给定知识点。
- 深色背景友好（body 背景用 #1a1a2e 或类似深色）、布局自适应（width:100%）、中文文案。
- 代码精简优先：优先用最少的代码实现核心交互，避免冗余装饰。总长度控制在 8000 字符以内。

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

function stripFences(s: string): string {
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
function extractHtml(raw: string): string {
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
function finalizeHtml(raw: string, truncated: boolean): string {
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

interface SendFn {
  (o: unknown): void;
}

/**
 * 流式生成交互式 HTML 产物（内联到主 SSE 流）。
 *
 * 主路由 await 本函数。所有 artifact 事件通过 send() 直接推送到主 SSE 流，
 * 前端在主对话连接中实时接收，无需独立 SSE 端点。
 *
 * @param send 主 SSE 的发送函数，用于推送 artifact 事件
 * @returns 给主模型的简短工具结果（不含完整 HTML，省 token）
 */
export async function streamInteractiveArtifact(
  send: SendFn,
  artifactId: string,
  args: { title?: string; prompt?: string },
  provider: ResolvedProvider,
): Promise<string> {
  const title = (args.title || "交互演示").slice(0, 60);
  const prompt = (args.prompt || args.title || "").trim();

  send({ type: "artifact", id: artifactId, status: "start", title });

  if (!prompt) {
    send({ type: "artifact", id: artifactId, status: "error", message: "缺少演示描述" });
    return "未能生成交互演示：缺少演示描述。";
  }

  try {
    const res = await fetch(chatCompletionsUrl(provider.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: ARTIFACT_SYSTEM },
          { role: "user", content: `知识点 / 需求：${prompt}\n标题：${title}` },
        ],
        stream: true,
        temperature: 0.4,
        max_tokens: 12000,
      }),
    });

    if (!res.ok || !res.body) {
      send({ type: "artifact", id: artifactId, status: "error", message: `生成失败 ${res.status}` });
      return `交互演示生成失败（${res.status}）。可改用文字讲解。`;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let raw = "";
    let finish = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const choice = json?.choices?.[0];
          const delta = choice?.delta?.content;
          if (delta) {
            raw += delta;
            send({ type: "artifact", id: artifactId, status: "delta", delta });
          }
          if (choice?.finish_reason) finish = choice.finish_reason;
        } catch {
          /* 忽略解析失败行 */
        }
      }
    }

    // finish_reason === "length" 表示达到 max_tokens 被截断 → 收尾时补救闭合标签。
    const html = finalizeHtml(raw, finish === "length");
    send({ type: "artifact", id: artifactId, status: "done", html });
    return `已生成交互式演示「${title}」。请用一两句话说明这个演示将帮助理解什么，然后继续你的讲解。`;
  } catch (e) {
    send({ type: "artifact", id: artifactId, status: "error", message: String((e as Error)?.message ?? e) });
    return "交互演示生成出错，可改用文字讲解。";
  }
}
