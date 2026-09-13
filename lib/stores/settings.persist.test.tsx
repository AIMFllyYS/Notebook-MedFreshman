import { afterEach, describe, expect, it, vi } from "vitest";
import { API_SECRETS_LS_KEY, SETTINGS_LS_KEY } from "@/lib/stores/apiSecrets";
import { useSettings } from "@/lib/stores/settings";

describe("settings apiKey persist", () => {
  afterEach(() => {
    localStorage.removeItem(SETTINGS_LS_KEY);
    localStorage.removeItem(API_SECRETS_LS_KEY);
  });

  it("把 apiKey 写到独立 key 并混淆，settings v1 不含明文", () => {
    useSettings.getState().addApiGroup({
      id: "persist-g",
      name: "G",
      baseUrl: "https://x.example/v1",
      apiKey: "sk-plain-secret",
      models: [],
    });
    const settingsRaw = localStorage.getItem(SETTINGS_LS_KEY) ?? "";
    const secretsRaw = localStorage.getItem(API_SECRETS_LS_KEY) ?? "";
    expect(settingsRaw).not.toContain("sk-plain-secret");
    expect(secretsRaw).not.toContain("sk-plain-secret");
    expect(JSON.parse(settingsRaw).customApiKey).toBe("");
    expect(useSettings.getState().customApiGroups.find((g) => g.id === "persist-g")?.apiKey).toBe("sk-plain-secret");
    useSettings.getState().removeApiGroup("persist-g");
  });

  it("把 capabilityEndpoints apiKey 写到独立 key，settings v1 不含明文", () => {
    useSettings.getState().setCapabilityEndpoints({ webSearchApiKey: "sk-cap-plain" });
    const settingsRaw = localStorage.getItem(SETTINGS_LS_KEY) ?? "";
    const secretsRaw = localStorage.getItem(API_SECRETS_LS_KEY) ?? "";
    expect(settingsRaw).not.toContain("sk-cap-plain");
    expect(secretsRaw).not.toContain("sk-cap-plain");
    expect(JSON.parse(settingsRaw).capabilityEndpoints.webSearchApiKey).toBe("");
    expect(useSettings.getState().capabilityEndpoints.webSearchApiKey).toBe("sk-cap-plain");
    useSettings.getState().setCapabilityEndpoints({ webSearchApiKey: "" });
  });

  it("一次性把能力密钥从 gailvlun-settings-v1 迁走，刷新后仍可用且旧 blob 无明文", async () => {
    const legacyKey = "sk-legacy-cap";
    localStorage.setItem(
      SETTINGS_LS_KEY,
      JSON.stringify({ capabilityEndpoints: { webSearchApiKey: legacyKey } }),
    );
    localStorage.removeItem(API_SECRETS_LS_KEY);
    vi.resetModules();
    const { useSettings: loadSettings } = await import("@/lib/stores/settings");
    expect(loadSettings.getState().capabilityEndpoints.webSearchApiKey).toBe(legacyKey);
    const settingsRaw = localStorage.getItem(SETTINGS_LS_KEY) ?? "";
    expect(settingsRaw).not.toContain(legacyKey);
    expect(JSON.parse(settingsRaw).capabilityEndpoints.webSearchApiKey).toBe("");
    const secretsRaw = localStorage.getItem(API_SECRETS_LS_KEY) ?? "";
    expect(secretsRaw).not.toContain(legacyKey);
    expect(secretsRaw.length).toBeGreaterThan(0);

    vi.resetModules();
    const { useSettings: reloadSettings } = await import("@/lib/stores/settings");
    expect(reloadSettings.getState().capabilityEndpoints.webSearchApiKey).toBe(legacyKey);
    expect(localStorage.getItem(SETTINGS_LS_KEY) ?? "").not.toContain(legacyKey);
  });
});
