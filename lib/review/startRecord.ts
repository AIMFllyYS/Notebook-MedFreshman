import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { useRecordPreviews } from "@/lib/hooks/useRecordPreviews";
import { useSettings } from "@/lib/hooks/useSettings";
import { CUSTOM_MODEL_ID } from "@/lib/ai/models";
import { getSubject, getCategory, getContentItem } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";
import type { ReviewCardContext } from "@/lib/review/types";

// 「记录」编排：所有入口（划词 / 右键消息 / 复习板内划词）统一走这里。
//   1. 先把原文落库为 parsing 卡（绝不丢）；
//   2. 弹出预览浮窗（绑定卡 id）；
//   3. 后台调 /api/record 成卡 → finalize / markError。
// AI 端点解析与 /api/chat 一致：自定义端点时带 customProvider，否则后端默认走 deepseek-flash。

// 客户端兜底截断（路由端也会再 clamp）。
const MAX_CHARS = 6000;

function clamp(text: string): string {
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
}

async function runRecord(cardId: string, text: string, ctx: ReviewCardContext) {
  const settings = useSettings.getState();
  const isCustom = settings.selectedModelId === CUSTOM_MODEL_ID;

  const sid = isSubjectId(ctx.subjectId) ? ctx.subjectId : null;
  const subjectName = sid ? getSubject(sid)?.name ?? "" : "";
  const categoryName = sid && ctx.categoryId ? getCategory(sid, ctx.categoryId)?.name ?? "" : "";
  const itemLabel =
    sid && ctx.categoryId && ctx.itemId
      ? getContentItem(sid, ctx.categoryId, ctx.itemId)?.title ?? ""
      : "";

  try {
    const resp = await fetch("/api/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: clamp(text),
        subjectName,
        categoryName,
        itemLabel,
        modelId: isCustom ? "custom" : undefined,
        customProvider: isCustom
          ? {
              baseUrl: settings.customBaseUrl,
              apiKey: settings.customApiKey,
              model: settings.customModelId,
            }
          : undefined,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data.card) {
      useReviewCards.getState().finalize(cardId, data.card, data.model || "");
    } else {
      useReviewCards.getState().markError(cardId, data.error || `成卡失败（${resp.status}）`);
    }
  } catch {
    useReviewCards.getState().markError(cardId, "网络异常，成卡失败");
  }
}

/** 发起一次「记录」：落库原文 → 开预览窗 → 后台成卡。返回卡片 id。 */
export function startRecord(
  text: string,
  ctx: ReviewCardContext,
  anchor: { x: number; y: number },
): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const cardId = useReviewCards.getState().addPending(trimmed, ctx);
  useRecordPreviews.getState().open(cardId, anchor);
  void runRecord(cardId, trimmed, ctx);
  return cardId;
}

/** 重试成卡（预览窗「重做」按钮调用）。 */
export function retryRecord(cardId: string): void {
  const card = useReviewCards.getState().byId[cardId];
  if (!card) return;
  useReviewCards.getState().markParsing(cardId);
  void runRecord(cardId, card.originalText, {
    subjectId: card.subjectId,
    categoryId: card.categoryId,
    itemId: card.itemId,
    sourceLabel: card.sourceLabel,
  });
}
