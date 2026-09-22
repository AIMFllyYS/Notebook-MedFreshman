import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { NextRequest } from "next/server";
import { computeCreemSignature, CREEM_SIGNATURE_HEADER } from "@/lib/pay/creem";
import { setPayTestDeps, type PaymentOrderRow, type PayStore } from "@/lib/pay/orders";
import type { RedeemUserRow } from "@/lib/billing/redeemCode";
import { POST } from "@/app/api/pay/webhook/creem/route";

const SECRET = "whsec_test_123";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const ORDER = "11111111-2222-3333-4444-555555555555";

const savedSecret = process.env.CREEM_WEBHOOK_SECRET;
process.env.CREEM_WEBHOOK_SECRET = SECRET;

afterEach(() => {
  setPayTestDeps(null);
});

process.on("exit", () => {
  if (savedSecret === undefined) delete process.env.CREEM_WEBHOOK_SECRET;
  else process.env.CREEM_WEBHOOK_SECRET = savedSecret;
});

function signedRequest(payload: unknown, signature?: string) {
  const raw = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  headers[CREEM_SIGNATURE_HEADER] = signature ?? computeCreemSignature(raw, SECRET);
  return new Request("https://local.invalid/api/pay/webhook/creem", {
    method: "POST",
    headers,
    body: raw,
  }) as NextRequest;
}

function checkoutEvent(orderId = ORDER, providerOrderId = "ord_1") {
  return {
    id: "evt_1",
    eventType: "checkout.completed",
    object: {
      id: "ch_1",
      request_id: orderId,
      metadata: { order_id: orderId, user_id: USER },
      order: { id: providerOrderId, amount: 5.9, currency: "USD", status: "paid" },
    },
  };
}

function storeWithOrder(initial?: Partial<PaymentOrderRow>) {
  const user: RedeemUserRow = {
    id: USER,
    tier: "free",
    period_start: "2026-09-01T00:00:00.000Z",
    period_end: "2026-10-01T00:00:00.000Z",
  };
  const order: PaymentOrderRow = {
    id: ORDER,
    user_id: USER,
    provider: "creem",
    plan: "plus_monthly",
    tier: "plus",
    months: 1,
    amount_cents: 590,
    currency: "USD",
    status: "pending",
    provider_checkout_id: "ch_1",
    provider_order_id: null,
    metadata: {},
    created_at: "2026-09-22T00:00:00.000Z",
    paid_at: null,
    ...initial,
  };
  const grants: Array<{ pool: string; source: string; amountCny: number }> = [];
  const store: PayStore = {
    async createOrder() {},
    async findOrderById(id) {
      return id === order.id ? order : null;
    },
    async findByCheckoutId(checkoutId) {
      return checkoutId === order.provider_checkout_id ? order : null;
    },
    async attachCheckout() {},
    async markOrderPaid(id, providerOrderId, paidAt) {
      if (id !== order.id || order.status !== "pending") return false;
      order.status = "paid";
      order.provider_order_id = providerOrderId;
      order.paid_at = paidAt;
      return true;
    },
    async revertToPending(id) {
      if (id === order.id) order.status = "pending";
    },
    async setOrderStatus() {},
    async getUser() {
      return user;
    },
    async applyUser(_id, patch) {
      user.tier = patch.tier;
      user.period_start = patch.periodStart.toISOString();
      user.period_end = patch.periodEnd.toISOString();
    },
    async insertGrant(row) {
      grants.push({ pool: row.pool, source: row.source ?? "redemption", amountCny: row.amountCny });
    },
  };
  return { store, user, order, grants };
}

test("验签通过：订单 paid、用户升 plus、双池 source=payment", async () => {
  const fixture = storeWithOrder();
  setPayTestDeps({ store: fixture.store });
  const res = await POST(signedRequest(checkoutEvent()));
  assert.equal(res.status, 200);
  assert.equal(fixture.order.status, "paid");
  assert.equal(fixture.order.provider_order_id, "ord_1");
  assert.equal(fixture.user.tier, "plus");
  assert.equal(fixture.grants.length, 2);
  assert.ok(fixture.grants.every((g) => g.source === "payment"));
  assert.equal(fixture.grants[0].amountCny, 70);
});

test("验签失败 → 401，不履约", async () => {
  const fixture = storeWithOrder();
  setPayTestDeps({ store: fixture.store });
  const res = await POST(signedRequest(checkoutEvent(), "f".repeat(64)));
  assert.equal(res.status, 401);
  assert.equal(fixture.order.status, "pending");
  assert.equal(fixture.user.tier, "free");
  assert.equal(fixture.grants.length, 0);
});

test("同一事件重放：幂等 200，额度不重复发放", async () => {
  const fixture = storeWithOrder();
  setPayTestDeps({ store: fixture.store });
  const first = await POST(signedRequest(checkoutEvent()));
  const replay = await POST(signedRequest(checkoutEvent()));
  assert.equal(first.status, 200);
  assert.equal(replay.status, 200);
  const body = (await replay.json()) as { already: boolean };
  assert.equal(body.already, true);
  assert.equal(fixture.grants.length, 2);
});

test("找不到订单 → 404", async () => {
  const fixture = storeWithOrder();
  setPayTestDeps({ store: fixture.store });
  const res = await POST(signedRequest(checkoutEvent("99999999-0000-0000-0000-000000000000")));
  assert.equal(res.status, 404);
});
