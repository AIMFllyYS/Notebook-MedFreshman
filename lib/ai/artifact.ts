// 交互式 HTML 产物生成（"子智能体"）：当主模型调用 renderInteractive 工具时，
// 用一次独立的 LLM 流式调用产出一个自包含 HTML 文档，并通过 SSE 的 artifact 事件
// 实时推给前端（顶部横幅 + 半屏源码 + 完成后弹窗渲染）。
import { chatCompletionsUrl, type ResolvedProvider } from "@/lib/ai/provider";

const ARTIFACT_SYSTEM = `你是交互式教学演示生成专家。请只输出一个完整、自包含的 HTML 文档用于在 iframe 中渲染：
- 必须以 <!DOCTYPE html> 开头，包含 <html><head><body>，所有 CSS 与 JavaScript 全部内联。
- 严禁任何外部网络依赖（不要 <script src=...> 或 <link href=...> 外链；公式/图形用纯 JS、SVG 或 Canvas 自行绘制）。
- 面向学习者，做成可交互的（滑块/按钮/拖拽即时改变可视化），帮助直观理解给定知识点。
- 深色背景友好、布局自适应（width:100%）、中文文案。
- 只输出 HTML 本身，不要任何解释文字，也不要用 \`\`\` 代码围栏包裹。`;

function stripFences(s: string): string {
  let t = s.trim();
  // 去掉可能的 ```html ... ``` 围栏
  t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  return t.trim();
}

/**
 * 收尾并“尽量修复”生成的 HTML：去围栏 + 对被截断（达到 max_tokens 而中途停止）的文档做补救，
 * 避免未闭合的 <script>/<body>/<html> 导致 iframe 渲染整段空白。
 */
function finalizeHtml(raw: string, truncated: boolean): string {
  let html = stripFences(raw);
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
 * 流式生成交互式 HTML 产物。emits: artifact start/delta/done/error。
 * 返回给主模型的简短工具结果（不含完整 HTML，省 token）。
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
    return `已生成交互式演示「${title}」，用户可在对话中点击「查看」打开。请用一两句话说明这个演示能帮助理解什么，然后继续你的讲解。`;
  } catch (e) {
    send({ type: "artifact", id: artifactId, status: "error", message: String((e as Error)?.message ?? e) });
    return "交互演示生成出错，可改用文字讲解。";
  }
}
