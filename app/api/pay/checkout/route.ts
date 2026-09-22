import { NextResponse, type NextRequest } from "next/server";
import { consumeRateLimit, requestClientIp } from "@/lib/auth/rateLimit";
import { resolveSessionUserId } from "@/lib/billing/quotaGate";
import { creemConfigured, creemCreateCheckout } from "@/lib/pay/creem";
import { activePayStore } from "@/lib/pay/orders";
import { isPayPlanKey, PAY_PLANS } from "@/lib/pay/plans";
import { siteOrigin } from "@/lib/share/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PAY_CHECKOUT_RATE_LIMIT_MAX = 10;
export const PAY_CHECKOUT_RATE_LIMIT_WINDOW_MS = 60_000;
export const PAY_CHECKOUT_IP_RATE_LIMIT_MAX = 30;

/**
 * 建单 + 建 Creem 托管收银台。本地先落 pending 订单，订单 id 同时作为
 * Creem 的 request_id 与 metadata.order_id 透传，webhook 回来时按它找回。
 */
export async function POST(req: NextRequest) {
  const userId = await resolveSessionUserId(req.headers);
  if (!userId) {
    return NextResponse.json({ error: "请先登录后再购买。" }, { status: 401 });
  }

  const userHit = consumeRateLimit(`pay:checkout:user:${userId}`, {
    max: PAY_CHECKOUT_RATE_LIMIT_MAX,
    windowMs: PAY_CHECKOUT_RATE_LIMIT_WINDOW_MS,
  });
  const ipHit = consumeRateLimit(`pay:checkout:ip:${requestClientIp(req.headers)}`, {
    max: PAY_CHECKOUT_IP_RATE_LIMIT_MAX,
    windowMs: PAY_CHECKOUT_RATE_LIMIT_WINDOW_MS,
  });
  if (!userHit.ok || !ipHit.ok) {
    const retryAfter = Math.max(userHit.ok ? 1 : userHit.retryAfterSec, ipHit.ok ? 1 : ipHit.retryAfterSec);
    return NextResponse.json(
      { error: "操作过于频繁，请稍后再试。" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
  if (!isPayPlanKey(body.plan)) {
    return NextResponse.json({ error: "invalid_plan", code: "invalid_plan" }, { status: 400 });
  }
  const plan = PAY_PLANS[body.plan];

  if (!creemConfigured()) {
    return NextResponse.json({ error: "pay_not_configured", code: "pay_not_configured" }, { status: 503 });
  }
  const productId = process.env[plan.productEnv]?.trim() ?? "";
  if (!productId) {
    return NextResponse.json({ error: "invalid_plan", code: "invalid_plan" }, { status: 400 });
  }

  const store = activePayStore();
  const orderId = crypto.randomUUID();
  await store.createOrder({
    id: orderId,
    userId,
    plan: plan.key,
    tier: plan.tier,
    months: plan.months,
    amountCents: plan.usdCents,
    currency: "USD",
  });

  try {
    const checkout = await creemCreateCheckout({
      productId,
      requestId: orderId,
      successUrl: `${siteOrigin()}/pay/return?order=${orderId}`,
      metadata: { order_id: orderId, user_id: userId, plan: plan.key },
    });
    await store.attachCheckout(orderId, checkout.id);
    return NextResponse.json({ ok: true, orderId, url: checkout.checkoutUrl });
  } catch (error) {
    await store.setOrderStatus(orderId, "failed").catch(() => {});
    console.warn("[pay] creem checkout failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "pay_upstream", code: "pay_upstream" }, { status: 502 });
  }
}
