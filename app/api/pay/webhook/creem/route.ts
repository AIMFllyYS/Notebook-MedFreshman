import { NextResponse, type NextRequest } from "next/server";
import {
  CREEM_SIGNATURE_HEADER,
  eventText,
  parseCreemEvent,
  resolveWebhookSecret,
  verifyCreemSignature,
} from "@/lib/pay/creem";
import { handleCheckoutCompleted } from "@/lib/pay/fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creem webhook 入口。无用户会话——鉴权就是 creem-signature 验签。
 * 验签失败 / 找不到订单 → 4xx；其他事件类型记录后直接 200；
 * 只有内部错误才回 500，让 Creem 按退避重投。
 */
export async function POST(req: NextRequest) {
  const secret = resolveWebhookSecret();
  if (!secret) {
    console.error("[pay] webhook 收到事件但 CREEM_WEBHOOK_SECRET 未配置");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get(CREEM_SIGNATURE_HEADER);
  if (!verifyCreemSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const event = parseCreemEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const eventType = eventText(event.eventType);
  if (eventType !== "checkout.completed") {
    console.info("[pay] webhook 忽略事件:", eventType || "unknown", "event:", eventText(event.id));
    return NextResponse.json({ ok: true, ignored: eventType || "unknown" });
  }

  try {
    const result = await handleCheckoutCompleted(event);
    if (!result.ok) {
      const status = result.reason === "no_order_ref" ? 400 : 404;
      console.warn("[pay] webhook 未履约:", result.reason, "event:", eventText(event.id));
      return NextResponse.json({ error: result.reason }, { status });
    }
    return NextResponse.json({ ok: true, already: result.alreadyFulfilled === true });
  } catch (error) {
    console.error("[pay] webhook 履约失败:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
