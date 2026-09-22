/**
 * payment_orders 存取层。与 lib/billing/redeemCode.ts 同款模式：
 * 接口化 store（单测注入内存实现）+ service_role 默认实现 + setPayTestDeps。
 */

import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import type { MembershipUpgradeStore, RedeemUserRow } from "@/lib/billing/redeemCode";
import type { PayTier } from "@/lib/pay/plans";

export type PaymentOrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface PaymentOrderRow {
  id: string;
  user_id: string;
  provider: string;
  plan: string;
  tier: PayTier;
  months: number;
  amount_cents: number;
  currency: string;
  status: PaymentOrderStatus;
  provider_checkout_id: string | null;
  provider_order_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  paid_at: string | null;
}

export interface PayStore extends MembershipUpgradeStore {
  createOrder(row: {
    id: string;
    userId: string;
    plan: string;
    tier: PayTier;
    months: number;
    amountCents: number;
    currency: string;
  }): Promise<void>;
  findOrderById(id: string): Promise<PaymentOrderRow | null>;
  findByCheckoutId(checkoutId: string): Promise<PaymentOrderRow | null>;
  attachCheckout(orderId: string, checkoutId: string): Promise<void>;
  /**
   * pending → paid 的原子迁移（防重放的核心）：只有当前还是 pending 的订单
   * 才会被这次 webhook 置 paid 并写入 provider_order_id / paid_at，返回是否抢到。
   * provider_order_id 上另有部分唯一索引兜底。
   */
  markOrderPaid(orderId: string, providerOrderId: string | null, paidAt: string): Promise<boolean>;
  /** 履约中途失败时把订单放回 pending，webhook 重投可以重试（与 markOrderPaid 对应）。 */
  revertToPending(orderId: string): Promise<void>;
  setOrderStatus(orderId: string, status: PaymentOrderStatus): Promise<void>;
}

export interface PayDeps {
  store?: PayStore;
  now?: () => Date;
}

let testDeps: PayDeps | null = null;

export function setPayTestDeps(deps: PayDeps | null): void {
  testDeps = deps;
}

const ORDER_COLUMNS =
  "id, user_id, provider, plan, tier, months, amount_cents, currency, status, provider_checkout_id, provider_order_id, metadata, created_at, paid_at";

function defaultStore(): PayStore {
  return {
    async createOrder(row) {
      const client = createServiceAuthClient();
      const { error } = await client.from("payment_orders").insert({
        id: row.id,
        user_id: row.userId,
        provider: "creem",
        plan: row.plan,
        tier: row.tier,
        months: row.months,
        amount_cents: row.amountCents,
        currency: row.currency,
        status: "pending",
      });
      if (error) throw new Error(error.message);
    },
    async findOrderById(id) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("payment_orders")
        .select(ORDER_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as PaymentOrderRow | null) ?? null;
    },
    async findByCheckoutId(checkoutId) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("payment_orders")
        .select(ORDER_COLUMNS)
        .eq("provider_checkout_id", checkoutId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as PaymentOrderRow | null) ?? null;
    },
    async attachCheckout(orderId, checkoutId) {
      const client = createServiceAuthClient();
      const { error } = await client
        .from("payment_orders")
        .update({ provider_checkout_id: checkoutId })
        .eq("id", orderId);
      if (error) throw new Error(error.message);
    },
    async markOrderPaid(orderId, providerOrderId, paidAt) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("payment_orders")
        .update({
          status: "paid",
          paid_at: paidAt,
          ...(providerOrderId ? { provider_order_id: providerOrderId } : {}),
        })
        .eq("id", orderId)
        .eq("status", "pending")
        .select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
    async revertToPending(orderId) {
      const client = createServiceAuthClient();
      const { error } = await client
        .from("payment_orders")
        .update({ status: "pending", paid_at: null })
        .eq("id", orderId);
      if (error) throw new Error(error.message);
    },
    async setOrderStatus(orderId, status) {
      const client = createServiceAuthClient();
      const { error } = await client
        .from("payment_orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw new Error(error.message);
    },
    async getUser(userId) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("app_users")
        .select("id, tier, period_start, period_end")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as RedeemUserRow | null) ?? null;
    },
    async applyUser(userId, patch) {
      const client = createServiceAuthClient();
      const { error } = await client
        .from("app_users")
        .update({
          tier: patch.tier,
          period_start: patch.periodStart.toISOString(),
          period_end: patch.periodEnd.toISOString(),
        })
        .eq("id", userId);
      if (error) throw new Error(error.message);
    },
    async insertGrant(row) {
      const client = createServiceAuthClient();
      const { error } = await client.from("quota_grants").insert({
        user_id: row.userId,
        pool: row.pool,
        tier: row.tier,
        amount_cny: row.amountCny,
        period_start: row.periodStart.toISOString(),
        period_end: row.periodEnd.toISOString(),
        source: row.source ?? "payment",
      });
      if (error) throw new Error(error.message);
    },
  };
}

export function activePayStore(deps?: PayDeps): PayStore {
  return deps?.store ?? testDeps?.store ?? defaultStore();
}
