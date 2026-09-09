import { buildFallbackSessionTitle, sanitizeSessionTitle } from "@/lib/chat/sessionTitle";
import type { ChatContext } from "@/lib/types/chat";

export function kickoffSessionTitle(
  sessionId: string,
  userContent: string,
  ctx: Pick<ChatContext, "subjectId" | "categoryId" | "itemId">,
  applyRemoteTitle: (sessionId: string, title: string) => void,
): string {
  const fallbackTitle = buildFallbackSessionTitle(userContent);
  void fetch("/api/chat-title", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: userContent,
      subjectId: ctx.subjectId,
      categoryId: ctx.categoryId,
      itemId: ctx.itemId,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((payload: unknown) => {
      const title = payload && typeof payload === "object" ? (payload as { title?: unknown }).title : undefined;
      if (typeof title === "string") {
        applyRemoteTitle(sessionId, sanitizeSessionTitle(title, fallbackTitle));
      }
    })
    .catch(() => {
      /* 标题失败不影响主请求；本地标题已落库。 */
    });
  return fallbackTitle;
}
