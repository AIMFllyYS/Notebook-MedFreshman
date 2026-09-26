import { NextResponse, type NextRequest } from "next/server";
import { consumeRateLimit, requestClientIp } from "@/lib/auth/rateLimit";
import { resolveSessionUserId } from "@/lib/billing/quotaGate";
import { activePayStore } from "@/lib/pay/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PAY_STATUS_RATE_LIMIT_MAX = 60;
export const PAY_STATUS_RATE_LIMIT_WINDOW_MS = 60_000;

/** 前端 /pay/return 轮询本接口拿到订单终态（session 用户 + owner 校验）。 */
export async function GET(req: NextRequest) {
  const userId = await resolveSessionUserId(req.headers);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orderId = req.nextUrl.searchParams.get("order")?.trim() ?? "";
  if (!orderId) {
    return NextResponse.json({ error: "missing_order" }, { status: 400 });
  }

  const hit = consumeRateLimit(`pay:status:user:${userId}`, {
    max: PAY_STATUS_RATE_LIMIT_MAX,
    windowMs: PAY_STATUS_RATE_LIMIT_WINDOW_MS,
  });
  const ipHit = consumeRateLimit(`pay:status:ip:${requestClientIp(req.headers)}`, {
    max: PAY_STATUS_RATE_LIMIT_MAX,
    windowMs: PAY_STATUS_RATE_LIMIT_WINDOW_MS,
  });
  if (!hit.ok || !ipHit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const order = await activePayStore().findOrderById(orderId);
  if (!order || order.user_id !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    status: order.status,
    fulfilled: order.status === "paid",
    tier: order.tier,
    months: order.months,
    paidAt: order.paid_at,
  });
}
