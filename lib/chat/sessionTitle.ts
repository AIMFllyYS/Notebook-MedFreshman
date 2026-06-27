export const DEFAULT_SESSION_TITLE_MODEL = "Qwen/Qwen3-8B";
export const SESSION_TITLE_MAX_CHARS = 20;

const LEADING_CONTEXT_RE = /^针对当前页面这段原文：\s*/;

export function sanitizeSessionTitle(raw: string, fallback = "新对话"): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[《》“”"'\r\n]/g, "")
    .replace(/^标题[:：]\s*/i, "")
    .replace(/^解释如下[:：]?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const oneLine = cleaned || fallback;
  return oneLine
    .slice(0, SESSION_TITLE_MAX_CHARS)
    .replace(/[：:，,、；;的到和与及在从]+$/g, "")
    .trim() || fallback;
}

export function buildFallbackSessionTitle(content: string): string {
  const withoutContextLead = content.trim().replace(LEADING_CONTEXT_RE, "");
  const withoutMarkdownQuote = withoutContextLead
    .split(/\r?\n/)
    .map((line) => line.replace(/^>\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
  return sanitizeSessionTitle(withoutMarkdownQuote, "新对话");
}
