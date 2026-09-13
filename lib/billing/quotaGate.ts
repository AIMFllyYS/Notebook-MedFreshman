/**
 * 额度闸门：请求前「明显耗尽则拒」，结算后扣。8 条花钱路由共用，解析 body 后各调一次。
 * 历史错 pool 行不改；聚合按当前周期 + kind/meta 再判。
 */

import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import type { UsagePool } from "@/lib/billing/usagePool";

export const TIER_QUOTA_CNY = { free: 7, plus: 70, pro: 700 } as const;
export type UserTier = keyof typeof TIER_QUOTA_CNY;

export const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
export const QUOTA_CACHE_TTL_MS = 5_000;
export const QUOTA_EXHAUSTED_CODE = "quota_exhausted" as const;
export const QUOTA_EXHAUSTED_STATUS = 402 as const;
export const QUOTA_UNAVAILABLE_CODE = "quota_unavailable" as const;
export const QUOTA_UNAVAILABLE_STATUS = 503 as const;
export const QUOTA_UNAVAILABLE_MESSAGE =
  "额度服务暂时不可用，请稍后重试。为避免记错账，本次请求未发往模型。";

export const PLATFORM_QUOTA_EXHAUSTED_MESSAGE =
  "平台额度已用完。可改用 BYOK（在设置中填写自己的 API 密钥）继续使用。";
export const BYOK_QUOTA_EXHAUSTED_MESSAGE =
  "BYOK 平台侧开销额度已用完。使用自备密钥的主模型仍可继续。";

const OVERHEAD_KINDS = new Set(["embedding", "rerank", "web-search", "image-search"]);
const OVERHEAD_SOURCES = new Set([
  "chat-title",
  "webSearch",
  "imageSearch",
  "embedding",
  "rerank",
]);

export interface QuotaPeriod {
  start: Date;
  end: Date;
}

export interface QuotaSnapshot {
  userId: string;
  tier: UserTier;
  period: QuotaPeriod;
  rolled: boolean;
  cap: Record<UsagePool, number>;
  used: Record<UsagePool, number>;
  remaining: Record<UsagePool, number>;
}

export type QuotaDecision =
  | { ok: true; snapshot: QuotaSnapshot | null }
  | {
      ok: false;
      status: typeof QUOTA_EXHAUSTED_STATUS | typeof QUOTA_UNAVAILABLE_STATUS;
      code: typeof QUOTA_EXHAUSTED_CODE | typeof QUOTA_UNAVAILABLE_CODE;
      error: string;
      pool: UsagePool;
    };

export interface QuotaGrantRow {
  pool: UsagePool;
  tier: string;
  amount_cny: number;
  period_start: string;
  period_end: string;
}

export interface QuotaLedgerRow {
  pool: UsagePool;
  kind: string;
  cost_cny: number;
  meta?: Record<string, unknown> | null;
}

export interface QuotaUserRow {
  id: string;
  tier: string;
  period_start: string;
  period_end: string;
}

export interface QuotaStore {
  getUser(userId: string): Promise<QuotaUserRow | null>;
  savePeriod(userId: string, period: QuotaPeriod, tier?: UserTier): Promise<void>;
  listGrants(userId: string): Promise<QuotaGrantRow[]>;
  listLedger(userId: string, period: QuotaPeriod): Promise<QuotaLedgerRow[]>;
}

export interface QuotaGateTestDeps {
  resolveUserId?: (headers: { get(name: string): string | null }) => Promise<string | null>;
  store?: QuotaStore;
  now?: () => Date;
}

let testDeps: QuotaGateTestDeps | null = null;

const snapshotCache = new Map<string, { at: number; snapshot: QuotaSnapshot }>();

export function setQuotaGateTestDeps(deps: QuotaGateTestDeps | null): void {
  testDeps = deps;
  snapshotCache.clear();
}

export function invalidateQuotaCache(userId?: string | null): void {
  if (!userId) {
    snapshotCache.clear();
    return;
  }
  snapshotCache.delete(userId);
}

export function quotaExhaustedMessage(pool: UsagePool): string {
  return pool === "byok" ? BYOK_QUOTA_EXHAUSTED_MESSAGE : PLATFORM_QUOTA_EXHAUSTED_MESSAGE;
}

export function quotaRejectedJson(decision: Extract<QuotaDecision, { ok: false }>): Response {
  return Response.json(
    { error: decision.error, code: decision.code, pool: decision.pool },
    { status: decision.status },
  );
}

/** 区分「没配 Supabase」与「配了但查不通」：前者放行，后者必须拒。 */
export function isQuotaServiceUnconfigured(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.startsWith("Need SUPABASE_") ||
    message.startsWith("Need NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    message.startsWith("SUPABASE_URL must be")
  );
}

export function isUserTier(value: string): value is UserTier {
  return value === "free" || value === "plus" || value === "pro";
}

export function asUserTier(value: string | null | undefined): UserTier {
  return value && isUserTier(value) ? value : "free";
}

export function addPeriodMs(from: Date, months: number): Date {
  return new Date(from.getTime() + months * PERIOD_MS);
}

export function rollQuotaPeriod(period: QuotaPeriod, now: Date): { period: QuotaPeriod; rolled: boolean } {
  let start = period.start;
  let end = period.end;
  let rolled = false;
  if (end.getTime() - start.getTime() <= 0) {
    end = addPeriodMs(start, 1);
  }
  while (now.getTime() >= end.getTime()) {
    start = end;
    end = addPeriodMs(start, 1);
    rolled = true;
  }
  return { period: { start, end }, rolled };
}

export function isPlatformOverheadRow(row: { kind: string; meta?: Record<string, unknown> | null }): boolean {
  if (OVERHEAD_KINDS.has(row.kind)) return true;
  const source = typeof row.meta?.source === "string" ? row.meta.source : "";
  return OVERHEAD_SOURCES.has(source);
}

/** 历史错 pool 行不改；主模型 BYOK（pool=byok 且非平台侧开销）不计入任何池。 */
export function ledgerRowCountsTowardPool(row: QuotaLedgerRow): UsagePool | null {
  if (row.meta && row.meta.countsTowardQuota === false) return null;
  if (isPlatformOverheadRow(row)) return row.pool;
  if (row.pool === "byok") return null;
  return "platform";
}

function grantOverlaps(grant: QuotaGrantRow, period: QuotaPeriod): boolean {
  const start = new Date(grant.period_start).getTime();
  const end = new Date(grant.period_end).getTime();
  return start < period.end.getTime() && end > period.start.getTime();
}

export function sumGrantCap(
  grants: QuotaGrantRow[],
  period: QuotaPeriod,
  pool: UsagePool,
  tier: UserTier,
): number {
  let sum = 0;
  for (const grant of grants) {
    if (grant.pool !== pool) continue;
    if (grant.tier !== tier) continue;
    if (!grantOverlaps(grant, period)) continue;
    const amount = Number(grant.amount_cny);
    if (Number.isFinite(amount) && amount > 0) sum += amount;
  }
  return sum > 0 ? sum : TIER_QUOTA_CNY[tier];
}

export function sumLedgerUsed(rows: QuotaLedgerRow[], pool: UsagePool): number {
  let sum = 0;
  for (const row of rows) {
    if (ledgerRowCountsTowardPool(row) !== pool) continue;
    const cost = Number(row.cost_cny);
    if (Number.isFinite(cost) && cost > 0) sum += cost;
  }
  return sum;
}

function defaultStore(): QuotaStore {
  return {
    async getUser(userId) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("app_users")
        .select("id, tier, period_start, period_end")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as QuotaUserRow | null) ?? null;
    },
    async savePeriod(userId, period, tier) {
      const client = createServiceAuthClient();
      const patch: Record<string, string> = {
        period_start: period.start.toISOString(),
        period_end: period.end.toISOString(),
      };
      if (tier) patch.tier = tier;
      const { error } = await client.from("app_users").update(patch).eq("id", userId);
      if (error) throw new Error(error.message);
    },
    async listGrants(userId) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("quota_grants")
        .select("pool, tier, amount_cny, period_start, period_end")
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return (data ?? []) as QuotaGrantRow[];
    },
    async listLedger(userId, period) {
      const client = createServiceAuthClient();
      const { data, error } = await client
        .from("usage_ledger")
        .select("pool, kind, cost_cny, meta")
        .eq("user_id", userId)
        .gte("occurred_at", period.start.toISOString())
        .lt("occurred_at", period.end.toISOString());
      if (error) throw new Error(error.message);
      return (data ?? []) as QuotaLedgerRow[];
    },
  };
}

function store(): QuotaStore {
  return testDeps?.store ?? defaultStore();
}

function nowDate(): Date {
  return testDeps?.now ? testDeps.now() : new Date();
}

export async function resolveQuotaUserId(
  headers: { get(name: string): string | null },
): Promise<string | null> {
  if (testDeps?.resolveUserId) return testDeps.resolveUserId(headers);
  const { resolveLedgerUserId } = await import("@/lib/billing/usageLedger");
  return resolveLedgerUserId(headers);
}

export async function loadQuotaSnapshot(userId: string): Promise<QuotaSnapshot | null> {
  const cached = snapshotCache.get(userId);
  const now = nowDate();
  if (cached && now.getTime() - cached.at < QUOTA_CACHE_TTL_MS) return cached.snapshot;

  const db = store();
  const user = await db.getUser(userId);
  if (!user) return null;

  const rolled = rollQuotaPeriod(
    { start: new Date(user.period_start), end: new Date(user.period_end) },
    now,
  );
  const tier = asUserTier(user.tier);
  if (rolled.rolled) {
    await db.savePeriod(userId, rolled.period);
    invalidateQuotaCache(userId);
  }

  const [grants, ledger] = await Promise.all([
    db.listGrants(userId),
    db.listLedger(userId, rolled.period),
  ]);

  const cap = {
    platform: sumGrantCap(grants, rolled.period, "platform", tier),
    byok: sumGrantCap(grants, rolled.period, "byok", tier),
  };
  const used = {
    platform: sumLedgerUsed(ledger, "platform"),
    byok: sumLedgerUsed(ledger, "byok"),
  };
  const snapshot: QuotaSnapshot = {
    userId,
    tier,
    period: rolled.period,
    rolled: rolled.rolled,
    cap,
    used,
    remaining: {
      platform: cap.platform - used.platform,
      byok: cap.byok - used.byok,
    },
  };
  snapshotCache.set(userId, { at: now.getTime(), snapshot });
  return snapshot;
}

/**
 * pool=null 表示主模型 BYOK，不进池、不拦截。
 * 无 userId 时放行（proxy 已拦未登录；单测直调路由也走这里）。
 */
export async function assertQuotaAvailable(input: {
  userId?: string | null;
  headers?: { get(name: string): string | null };
  pool: UsagePool | null;
}): Promise<QuotaDecision> {
  if (input.pool == null) return { ok: true, snapshot: null };
  const userId = input.userId ?? (input.headers ? await resolveQuotaUserId(input.headers) : null);
  if (!userId) return { ok: true, snapshot: null };

  try {
    const snapshot = await loadQuotaSnapshot(userId);
    if (!snapshot) return { ok: true, snapshot: null };
    if (snapshot.remaining[input.pool] <= 0) {
      return {
        ok: false,
        status: QUOTA_EXHAUSTED_STATUS,
        code: QUOTA_EXHAUSTED_CODE,
        error: quotaExhaustedMessage(input.pool),
        pool: input.pool,
      };
    }
    return { ok: true, snapshot };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    // 没配额度服务（本地开发、自托管未接 Supabase）本就没有额度可言，放行。
    if (isQuotaServiceUnconfigured(error)) {
      console.warn("[quota] 额度服务未配置，跳过闸门:", detail);
      return { ok: true, snapshot: null };
    }
    // 配了但查不通：必须拒。放行等于无限额度，而且这笔钱花出去还不会入账。
    console.error("[quota] 额度查询失败，拒绝本次请求:", detail);
    return {
      ok: false,
      status: QUOTA_UNAVAILABLE_STATUS,
      code: QUOTA_UNAVAILABLE_CODE,
      error: QUOTA_UNAVAILABLE_MESSAGE,
      pool: input.pool,
    };
  }
}
