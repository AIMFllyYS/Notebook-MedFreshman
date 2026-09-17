import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import { resolveQuotaUserId } from "@/lib/billing/quotaGate";
import { membershipLabel, normalizeNickname, type MembershipTier } from "./displayName";

export interface AccountProfileRow {
  email: string | null;
  nickname: string | null;
  tier: string;
}

export interface AccountProfileDb {
  getProfile(userId: string): Promise<AccountProfileRow | null>;
  saveNickname(userId: string, nickname: string | null): Promise<AccountProfileRow | null>;
}

interface ProfileApiTestDeps {
  resolveUserId?: (headers: { get(name: string): string | null }) => Promise<string | null>;
  db?: AccountProfileDb;
}

let testDeps: ProfileApiTestDeps | null = null;

export function setProfileApiTestDeps(deps: ProfileApiTestDeps | null): void {
  testDeps = deps;
}

function asTier(value: string | null | undefined): MembershipTier {
  return value === "plus" || value === "pro" || value === "free" ? value : "free";
}

function defaultDb(): AccountProfileDb {
  const client = createServiceAuthClient();
  return {
    async getProfile(userId) {
      const { data, error } = await client
        .from("app_users")
        .select("email, nickname, tier")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        email: typeof data.email === "string" ? data.email : null,
        nickname: typeof data.nickname === "string" ? data.nickname : null,
        tier: typeof data.tier === "string" ? data.tier : "free",
      };
    },
    async saveNickname(userId, nickname) {
      const { data, error } = await client
        .from("app_users")
        .update({ nickname })
        .eq("id", userId)
        .select("email, nickname, tier")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        email: typeof data.email === "string" ? data.email : null,
        nickname: typeof data.nickname === "string" ? data.nickname : null,
        tier: typeof data.tier === "string" ? data.tier : "free",
      };
    },
  };
}

export async function resolveProfileUserId(
  headers: { get(name: string): string | null },
): Promise<string | null> {
  if (testDeps?.resolveUserId) return testDeps.resolveUserId(headers);
  return resolveQuotaUserId(headers);
}

export function toProfileView(userId: string, row: AccountProfileRow) {
  const nickname = row.nickname?.trim() || null;
  const tier = asTier(row.tier);
  return {
    userId,
    email: row.email,
    nickname,
    tier,
    membership: membershipLabel(tier),
  };
}

export async function loadAccountProfile(userId: string) {
  const db = testDeps?.db ?? defaultDb();
  const row = await db.getProfile(userId);
  return row ? toProfileView(userId, row) : null;
}

export async function updateAccountNickname(userId: string, raw: unknown) {
  const nickname = raw == null || raw === "" ? null : normalizeNickname(String(raw));
  const db = testDeps?.db ?? defaultDb();
  const row = await db.saveNickname(userId, nickname);
  return row ? toProfileView(userId, row) : null;
}
