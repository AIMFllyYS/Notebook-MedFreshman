/**
 * 插件市场（MCP）env 凭证的本地存储。
 * 与 apiSecrets 同一口径：localStorage + 轻量混淆（不是加密），只在本机用。
 * key 形状：`<mcpEntryId>:<ENV_NAME>` → 混淆后的值。
 */

import { createPersistedStore } from "@/lib/stores/_persist";
import { deobfuscateSecret, obfuscateSecret } from "@/lib/stores/apiSecrets";

export const PLUGIN_SECRETS_LS_KEY = "gailvlun-plugin-secrets-v1";

export function pluginSecretKey(entryId: string, envName: string): string {
  return `${entryId}:${envName}`;
}

interface PluginSecretsState {
  /** 已混淆的凭证值（落盘形态）。 */
  values: Record<string, string>;
  /** 写入/更新一条凭证；空串等于清除。 */
  setSecret: (key: string, plain: string) => void;
  removeSecret: (key: string) => void;
}

export const usePluginSecrets = createPersistedStore<PluginSecretsState>(
  (set) => ({
    values: {},
    setSecret: (key, plain) => {
      const trimmed = plain.trim();
      set((s) => {
        const values = { ...s.values };
        if (!trimmed) delete values[key];
        else values[key] = obfuscateSecret(trimmed);
        return { values };
      });
    },
    removeSecret: (key) => {
      set((s) => {
        if (!(key in s.values)) return s;
        const values = { ...s.values };
        delete values[key];
        return { values };
      });
    },
  }),
  {
    name: PLUGIN_SECRETS_LS_KEY,
    storage: "local",
    partialize: (s) => ({ values: s.values }),
  },
);

/** 取某条 MCP 条目已填的 env 明文值（map: ENV_NAME → plain）。 */
export function pluginSecretsFor(values: Record<string, string>, entryId: string, envNames: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of envNames) {
    const stored = values[pluginSecretKey(entryId, name)];
    const plain = stored ? deobfuscateSecret(stored) : "";
    if (plain) out[name] = plain;
  }
  return out;
}
