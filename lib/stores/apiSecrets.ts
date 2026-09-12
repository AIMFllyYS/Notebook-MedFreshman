/**
 * 自定义分组 apiKey 的本地存储。
 * - persist 名 `gailvlun-settings-v1` 不变；密钥拆到独立 key 并做轻量混淆（不是加密）。
 * - 桌面端另走 Electron safeStorage（DPAPI）。
 */

import type { CustomApiGroup } from "@/lib/ai/models";

export const SETTINGS_LS_KEY = "gailvlun-settings-v1";
export const API_SECRETS_LS_KEY = "gailvlun-api-secrets-v1";

export type StoredApiSecrets = {
  v: 1;
  groups: Record<string, string>;
};

const OBFUSCATE_PREFIX = "obf1.";
const XOR_SEED = "gailvlun-api-secrets-v1";

function xorKeyBytes(): Uint8Array {
  return new TextEncoder().encode(XOR_SEED);
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function b64ToBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** 轻量混淆：防顺手 grep，不是加密。 */
export function obfuscateSecret(plain: string): string {
  if (!plain) return "";
  const bytes = new TextEncoder().encode(plain);
  const key = xorKeyBytes();
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[i % key.length];
  return OBFUSCATE_PREFIX + bytesToB64(out);
}

export function deobfuscateSecret(stored: string): string {
  if (!stored) return "";
  if (!stored.startsWith(OBFUSCATE_PREFIX)) return stored;
  try {
    const bytes = b64ToBytes(stored.slice(OBFUSCATE_PREFIX.length));
    const key = xorKeyBytes();
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[i % key.length];
    return new TextDecoder().decode(out);
  } catch {
    return "";
  }
}

export function extractPlainGroupKeys(groups: unknown): Record<string, string> {
  if (!Array.isArray(groups)) return {};
  const out: Record<string, string> = {};
  for (const item of groups) {
    if (!item || typeof item !== "object") continue;
    const g = item as Partial<CustomApiGroup>;
    if (typeof g.id !== "string" || !g.id) continue;
    if (typeof g.apiKey !== "string" || !g.apiKey.trim()) continue;
    out[g.id] = g.apiKey;
  }
  return out;
}

export function stripGroupApiKeys<T extends { apiKey?: string }>(groups: T[]): T[] {
  return groups.map((g) => (g.apiKey ? { ...g, apiKey: "" } : g));
}

export function applyGroupApiKeys<T extends { id: string; apiKey?: string }>(
  groups: T[],
  keys: Record<string, string>,
): T[] {
  return groups.map((g) => {
    const k = keys[g.id];
    return typeof k === "string" && k ? { ...g, apiKey: k } : g;
  });
}

export function encodeWebSecrets(groups: Record<string, string>): string {
  const obfuscated: Record<string, string> = {};
  for (const [id, key] of Object.entries(groups)) {
    if (key) obfuscated[id] = obfuscateSecret(key);
  }
  const payload: StoredApiSecrets = { v: 1, groups: obfuscated };
  return JSON.stringify(payload);
}

export function decodeWebSecrets(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Partial<StoredApiSecrets>;
    if (!parsed || parsed.v !== 1 || !parsed.groups || typeof parsed.groups !== "object") return {};
    const out: Record<string, string> = {};
    for (const [id, val] of Object.entries(parsed.groups)) {
      if (typeof val === "string" && val) out[id] = deobfuscateSecret(val);
    }
    return out;
  } catch {
    return {};
  }
}

export function decodeDesktopSecrets(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== "object") return {};
  const groups = (payload as StoredApiSecrets).groups;
  if (!groups || typeof groups !== "object") return {};
  const out: Record<string, string> = {};
  for (const [id, val] of Object.entries(groups)) {
    if (typeof val === "string" && val.trim()) out[id] = val;
  }
  return out;
}

export type SettingsSecretsSplit = {
  groupsForMemory: CustomApiGroup[];
  groupKeys: Record<string, string>;
  rewriteSettings: boolean;
  rewriteSecrets: boolean;
};

/**
 * 三种迁移：
 * 1. 旧 key 有明文、新 key 不存在 → 抽到新 key，剥离旧 JSON
 * 2. 新 key 已存在、旧 key 已剥离 → 用新 key
 * 3. 两者都有 → 新 key 覆盖同 id，旧 key 里多出来的分组仍保留，并剥离明文
 */
export function splitSettingsSecrets(
  groups: CustomApiGroup[],
  secretsRaw: string | null | undefined,
  legacyCustomApiKey?: string,
): SettingsSecretsSplit {
  const fromOld = extractPlainGroupKeys(groups);
  const fromNew = decodeWebSecrets(secretsRaw);
  const groupKeys = { ...fromOld, ...fromNew };
  if (
    !Object.keys(groupKeys).length
    && typeof legacyCustomApiKey === "string"
    && legacyCustomApiKey.trim()
    && groups[0]
  ) {
    groupKeys[groups[0].id] = legacyCustomApiKey;
  }
  const rewriteSettings = Object.keys(fromOld).length > 0
    || (typeof legacyCustomApiKey === "string" && legacyCustomApiKey.trim() !== "");
  const rewriteSecrets = Object.keys(groupKeys).length > 0 && (!secretsRaw || rewriteSettings);
  return {
    groupsForMemory: applyGroupApiKeys(stripGroupApiKeys(groups), groupKeys),
    groupKeys,
    rewriteSettings,
    rewriteSecrets,
  };
}

export type DesktopSecretsBridge = {
  load: () => Promise<unknown>;
  save: (payload: StoredApiSecrets) => Promise<unknown>;
};

export function getDesktopSecretsBridge(): DesktopSecretsBridge | undefined {
  if (typeof window === "undefined") return undefined;
  const desktop = (window as unknown as { desktop?: { isElectron?: boolean; secrets?: DesktopSecretsBridge } }).desktop;
  if (!desktop?.isElectron || !desktop.secrets) return undefined;
  return desktop.secrets;
}

export function isElectronDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { desktop?: { isElectron?: boolean } }).desktop?.isElectron;
}
