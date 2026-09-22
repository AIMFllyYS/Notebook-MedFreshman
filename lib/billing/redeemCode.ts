/**
 * 兑换码核销。service_role 写库；失败码对外折叠成同一句，不回显码是否存在。
 */

import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import {
  asUserTier,
  invalidateQuotaCache,
  TIER_QUOTA_CNY,
  type UserTier,
} from "@/lib/billing/quotaGate";

export const REDEEM_PUBLIC_ERROR = "兑换失败，请检查兑换码后重试。";
export const REDEEM_RATE_LIMIT_ERROR = "尝试过于频繁，请稍后再试。";

export const REDEEM_RATE_LIMIT_MAX = 5;
export const REDEEM_RATE_LIMIT_WINDOW_MS = 60_000;
export const REDEEM_IP_RATE_LIMIT_MAX = 15;

export type RedeemErrorCode =
  | "invalid"
  | "max_uses"
  | "already_redeemed"
  | "expired"
  | "rate_limited"
  | "unauthorized";

export interface RedeemCodeRow {
  id: string;
  code: string;
  tier: UserTier;
  months: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
}

export interface RedeemUserRow {
  id: string;
  tier: string;
  period_start: string;
  period_end: string;
}

export interface RedeemSuccess {
  ok: true;
  tier: UserTier;
  periodStart: string;
  periodEnd: string;
  months: number;
}

export interface RedeemFailure {
  ok: false;
  errorCode: RedeemErrorCode;
}

export type GrantSource = "signup" | "redemption" | "manual" | "payment";

export interface RedeemStore {
  findCode(code: string): Promise<RedeemCodeRow | null>;
  getUser(userId: string): Promise<RedeemUserRow | null>;
  hasRedemption(codeId: string, userId: string): Promise<boolean>;
  insertRedemption(codeId: string, userId: string): Promise<"ok" | "duplicate">;
  incrementUsedCount(codeId: string, maxUses: number): Promise<boolean>;
  applyUser(userId: string, patch: { tier: UserTier; periodStart: Date; periodEnd: Date }): Promise<void>;
  insertGrant(row: {
    userId: string;
    pool: "platform" | "byok";
    tier: UserTier;
    amountCny: number;
    periodStart: Date;
    periodEnd: Date;
    redemptionId?: string;
    source?: GrantSource;
  }): Promise<void>;
}

/** 升档 + 发额度共用的最小 store 面：支付履约与兑换码核销走同一条路径。 */
export type MembershipUpgradeStore = Pick<RedeemStore, "getUser" | "applyUser" | "insertGrant">;

export interface RedeemDeps {
  store?: RedeemStore;
  now?: () => Date;
}

let testDeps: RedeemDeps | null = null;

export function setRedeemTestDeps(deps: RedeemDeps | null): void {
  testDeps = deps;
}

export function normalizeRedeemCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

export function publicRedeemMessage(errorCode: RedeemErrorCode): string {
  if (errorCode === "rate_limited") return REDEEM_RATE_LIMIT_ERROR;
  if (errorCode === "unauthorized") return "请先登录后再兑换。";
  return REDEEM_PUBLIC_ERROR;
}

export function nextMembershipPeriod(input: {
  currentTier: UserTier;
  periodStart: Date;
  periodEnd: Date;
  codeTier: UserTier;
  months: number;
  now: Date;
}): { tier: UserTier; periodStart: Date; periodEnd: Date } {
  const months = Math.max(1, Math.floor(input.months));
  const added = months * (30 * 24 * 60 * 60 * 1000);
  if (input.currentTier === input.codeTier) {
    const base = input.periodEnd.getTime() > input.now.getTime() ? input.periodEnd : input.now;
    return {
      tier: input.codeTier,
      periodStart: input.periodStart.getTime() > input.now.getTime() ? input.now : input.periodStart,
      periodEnd: new Date(base.getTime() + added),
    };
  }
  const remaining = Math.max(0, input.periodEnd.getTime() - input.now.getTime());
  return {
    tier: input.codeTier,
    periodStart: input.now,
    periodEnd: new Date(input.now.getTime() + remaining + added),
  };
}

function defaultStore(): RedeemStore {
  return {
    async findCode(code) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("redemption_codes")
        .select("id, code, tier, months, max_uses, used_count, expires_at")
        .eq("code", code)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      return {
        ...data,
        tier: asUserTier(String(data.tier)),
        months: Number(data.months) || 1,
        max_uses: Number(data.max_uses) || 1,
        used_count: Number(data.used_count) || 0,
      } as RedeemCodeRow;
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
    async hasRedemption(codeId, userId) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("redemptions")
        .select("id")
        .eq("code_id", codeId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return !!data;
    },
    async insertRedemption(codeId, userId) {
      const client = createServiceAuthClient();
      const { error } = await client.from("redemptions").insert({ code_id: codeId, user_id: userId });
      if (!error) return "ok";
      if (error.code === "23505") return "duplicate";
      throw new Error(error.message);
    },
    async incrementUsedCount(codeId, maxUses) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("redemption_codes")
        .select("used_count")
        .eq("id", codeId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const used = Number(data?.used_count ?? 0);
      if (used >= maxUses) return false;
      const { data: updated, error: updError } = await client
        .from("redemption_codes")
        .update({ used_count: used + 1 })
        .eq("id", codeId)
        .eq("used_count", used)
        .select("id");
      if (updError) throw new Error(updError.message);
      return (updated ?? []).length > 0;
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
        source: row.source ?? "redemption",
        redemption_id: row.redemptionId ?? null,
      });
      if (error) throw new Error(error.message);
    },
  };
}

function activeStore(): RedeemStore {
  return testDeps?.store ?? defaultStore();
}

export interface MembershipUpgradeOutcome {
  tier: UserTier;
  periodStart: string;
  periodEnd: string;
  months: number;
}

/**
 * 升档 + 按档位面额发放平台/BYOK 双池额度，兑换码核销与在线支付履约共用：
 * 档位与月数由调用方给出，周期顺延规则（nextMembershipPeriod）与额度面额完全一致。
 */
export async function applyMembershipUpgrade(input: {
  userId: string;
  user: RedeemUserRow;
  tier: UserTier;
  months: number;
  source?: GrantSource;
  store: MembershipUpgradeStore;
  now: Date;
}): Promise<MembershipUpgradeOutcome> {
  const { store } = input;
  const months = Math.max(1, Math.floor(input.months));
  const next = nextMembershipPeriod({
    currentTier: asUserTier(input.user.tier),
    periodStart: new Date(input.user.period_start),
    periodEnd: new Date(input.user.period_end),
    codeTier: input.tier,
    months,
    now: input.now,
  });

  await store.applyUser(input.userId, {
    tier: next.tier,
    periodStart: next.periodStart,
    periodEnd: next.periodEnd,
  });

  const amount = TIER_QUOTA_CNY[next.tier] * months;
  for (const pool of ["platform", "byok"] as const) {
    await store.insertGrant({
      userId: input.userId,
      pool,
      tier: next.tier,
      amountCny: amount,
      periodStart: next.periodStart,
      periodEnd: next.periodEnd,
      source: input.source ?? "redemption",
    });
  }

  invalidateQuotaCache(input.userId);
  return {
    tier: next.tier,
    periodStart: next.periodStart.toISOString(),
    periodEnd: next.periodEnd.toISOString(),
    months,
  };
}

export async function redeemCodeForUser(
  userId: string,
  rawCode: unknown,
  deps: RedeemDeps = {},
): Promise<RedeemSuccess | RedeemFailure> {
  const code = normalizeRedeemCode(rawCode);
  if (!code) return { ok: false, errorCode: "invalid" };

  const now = (deps.now ?? testDeps?.now ?? (() => new Date()))();
  const db = deps.store ?? activeStore();

  const found = await db.findCode(code);
  if (!found) return { ok: false, errorCode: "invalid" };
  if (found.expires_at && new Date(found.expires_at).getTime() <= now.getTime()) {
    return { ok: false, errorCode: "expired" };
  }
  if (await db.hasRedemption(found.id, userId)) return { ok: false, errorCode: "already_redeemed" };
  if (found.used_count >= found.max_uses) return { ok: false, errorCode: "max_uses" };

  const user = await db.getUser(userId);
  if (!user) return { ok: false, errorCode: "invalid" };

  const inserted = await db.insertRedemption(found.id, userId);
  if (inserted === "duplicate") return { ok: false, errorCode: "already_redeemed" };

  const bumped = await db.incrementUsedCount(found.id, found.max_uses);
  if (!bumped) return { ok: false, errorCode: "max_uses" };

  const upgraded = await applyMembershipUpgrade({
    userId,
    user,
    tier: found.tier,
    months: found.months,
    store: db,
    now,
  });
  return { ok: true, ...upgraded };
}
