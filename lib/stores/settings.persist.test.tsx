import { afterEach, describe, expect, it } from "vitest";
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
});
