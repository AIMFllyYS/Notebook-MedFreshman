import { afterEach, describe, expect, it, vi } from "vitest";
import { API_SECRETS_LS_KEY, SETTINGS_LS_KEY } from "@/lib/stores/apiSecrets";
import { SETTINGS_BACKUP_KEY } from './settingsRecovery';
import { getSettingsPersistGeneration, useSettings } from "@/lib/stores/settings";

describe("settings apiKey persist", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(SETTINGS_LS_KEY);
    localStorage.removeItem(API_SECRETS_LS_KEY);
    localStorage.removeItem(SETTINGS_BACKUP_KEY);
    delete (window as unknown as { desktop?: unknown }).desktop;
  });

  it('failed secret migration does not strip old keys or make API groups disappear', async () => {
    const group = { id: 'upgrade', name: '旧 API', baseUrl: 'https://example.invalid/v1', apiKey: 'old-key', models: [{ id: 'my-model' }] };
    const original = JSON.stringify({ customApiGroups: [group], selectedModelId: 'custom:my-model' });
    localStorage.setItem(SETTINGS_LS_KEY, original);
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === API_SECRETS_LS_KEY) throw new DOMException('full', 'QuotaExceededError');
      setItem.call(this, key, value);
    });
    vi.resetModules();
    const { useSettings: loaded } = await import('./settings');
    expect(loaded.getState().customApiGroups).toEqual([group]);
    expect(loaded.getState().selectedModelId).toBe('custom:upgrade:my-model');
    expect(loaded.getState().settingsLoadWarning).toBeTruthy();
    expect(localStorage.getItem(SETTINGS_LS_KEY)).toBe(original);
    loaded.getState().setFontScale(1.1);
    expect(localStorage.getItem(SETTINGS_LS_KEY)).toBe(original);
  });

  it('wrapped upgrade config with a null selection still loads groups and survives reload', async () => {
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify({ state: { selectedModelId: null, customApiGroups: [{ id: 'wrapped', name: '旧分组', baseUrl: '', apiKey: 'key', models: ['model-a'] }] } }));
    vi.resetModules();
    const { useSettings: loaded } = await import('./settings');
    expect(loaded.getState().customApiGroups[0].models[0].id).toBe('model-a');
    expect(loaded.getState().customApiGroups[0].apiKey).toBe('key');
    vi.resetModules();
    const { useSettings: reloaded } = await import('./settings');
    expect(reloaded.getState().customApiGroups[0].apiKey).toBe('key');
  });

  it('malformed settings cannot be overwritten by a model selection', async () => {
    localStorage.setItem(SETTINGS_LS_KEY, '{broken');
    vi.resetModules();
    const { useSettings: loaded } = await import('./settings');
    loaded.getState().setSelectedModelId('auto');
    expect(localStorage.getItem(SETTINGS_LS_KEY)).toBe('{broken');
    expect(loaded.getState().settingsLoadWarning).toBeTruthy();
  });

  it('delayed desktop secret hydration cannot roll back an edited API key', async () => {
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify({ customApiGroups: [{ id: 'desktop', name: 'Desktop', baseUrl: 'https://example.invalid/v1', apiKey: 'old-key', models: [{ id: 'test' }] }] }));
    let complete!: (value: unknown) => void;
    const save = vi.fn(async () => {});
    (window as unknown as { desktop: unknown }).desktop = { isElectron: true, secrets: { load: () => new Promise((resolve) => { complete = resolve; }), save } };
    vi.resetModules();
    const { useSettings: loaded } = await import('./settings');
    await Promise.resolve();
    loaded.getState().updateApiGroup('desktop', { apiKey: 'new-key' });
    complete({ v: 1, groups: { desktop: 'old-key' }, capability: {} });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(loaded.getState().customApiGroups[0].apiKey).toBe('new-key');
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

  it("持久化最大工具轮数、答题模型与划词助手策略", async () => {
    useSettings.getState().setMaxToolRounds(12);
    useSettings.getState().setQuizModelId("deepseek/deepseek-v4.1-flash");
    useSettings.getState().setSelectionAssistantEnabled(false);
    useSettings.getState().setSelectionAssistantAction("quote", false);
    useSettings.getState().setBlockForeignSelectionAssistants(true);
    const raw = JSON.parse(localStorage.getItem(SETTINGS_LS_KEY) ?? "{}");
    expect(raw.maxToolRounds).toBe(12);
    expect(raw.quizModelId).toBe("deepseek/deepseek-v4.1-flash");
    expect(raw.selectionAssistantEnabled).toBe(false);
    expect(raw.selectionAssistantActions.quote).toBe(false);
    expect(raw.blockForeignSelectionAssistants).toBe(true);

    vi.resetModules();
    const { useSettings: reloaded } = await import("@/lib/stores/settings");
    expect(reloaded.getState().maxToolRounds).toBe(12);
    expect(reloaded.getState().quizModelId).toBe("deepseek/deepseek-v4.1-flash");
    expect(reloaded.getState().selectionAssistantEnabled).toBe(false);
    expect(reloaded.getState().selectionAssistantActions.quote).toBe(false);
    expect(reloaded.getState().blockForeignSelectionAssistants).toBe(true);
    expect(reloaded.getState().selectionAssistantActions.note).toBe(true);
  });

  it("成功 persist 后递增代数，写入失败则不递增", async () => {
    const before = getSettingsPersistGeneration();
    useSettings.getState().setGlobalContext("persist-ok");
    expect(getSettingsPersistGeneration()).toBe(before + 1);

    localStorage.setItem(SETTINGS_LS_KEY, '{broken');
    vi.resetModules();
    const { useSettings: loaded, getSettingsPersistGeneration: genAfterLoad } = await import("./settings");
    const blocked = genAfterLoad();
    loaded.getState().setGlobalContext("should-not-write");
    expect(genAfterLoad()).toBe(blocked);
    expect(localStorage.getItem(SETTINGS_LS_KEY)).toBe("{broken");
  });

  it("persist Agent 面板顶部标签与固定助教导航开关", async () => {
    useSettings.getState().setShowRightPanelTabBar(false);
    useSettings.getState().setPinChatHeader(true);
    const raw = JSON.parse(localStorage.getItem(SETTINGS_LS_KEY) ?? "{}");
    expect(raw.showRightPanelTabBar).toBe(false);
    expect(raw.pinChatHeader).toBe(true);
    vi.resetModules();
    const { useSettings: reloaded } = await import("@/lib/stores/settings");
    expect(reloaded.getState().showRightPanelTabBar).toBe(false);
    expect(reloaded.getState().pinChatHeader).toBe(true);
  });
});
