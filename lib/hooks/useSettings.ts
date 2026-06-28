import { create } from "zustand";
import { DEFAULT_MODEL_ID, type CustomModelConfig } from "@/lib/ai/models";

/**
 * 全站 AI 设置（localStorage 持久化）。统一管理：
 * - 选中的模型 / 自定义 provider（env 为默认，这里填的作为"自定义模型"并存不冲突）
 * - 聊天区字体缩放、工具启用/禁用、默认思考/搜索（S4 设置面板消费）
 */
export interface SettingsState {
  // ── 模型 ──────────────────────────────
  selectedModelId: string;
  customBaseUrl: string;
  customApiKey: string;
  /** @deprecated 已迁移到 customModels 数组，保留用于向后兼容读取。 */
  customModelId: string;
  customModels: CustomModelConfig[];

  // ── 体验（S4）────────────────────────
  fontScale: number; // 0.85 ~ 1.35
  disabledTools: string[]; // 被禁用的工具名
  defaultThinking: boolean;
  defaultSearch: boolean;

  // ── 全局补充上下文 ────────────────────
  /** 所有对话自动注入的用户自定义文本（拼入稳定系统前缀）。 */
  globalContext: string;

  setSelectedModelId: (id: string) => void;
  setCustomProvider: (p: { baseUrl?: string; apiKey?: string }) => void;
  addCustomModel: (model: CustomModelConfig) => void;
  updateCustomModel: (id: string, model: CustomModelConfig) => void;
  removeCustomModel: (id: string) => void;
  setFontScale: (v: number) => void;
  toggleTool: (name: string, enabled: boolean) => void;
  setDefaultThinking: (v: boolean) => void;
  setDefaultSearch: (v: boolean) => void;
  setGlobalContext: (v: string) => void;
}

const LS_KEY = "gailvlun-settings-v1";

type Persisted = Pick<
  SettingsState,
  | "selectedModelId"
  | "customBaseUrl"
  | "customApiKey"
  | "customModelId"
  | "customModels"
  | "fontScale"
  | "disabledTools"
  | "defaultThinking"
  | "defaultSearch"
  | "globalContext"
>;

const DEFAULTS: Persisted = {
  selectedModelId: DEFAULT_MODEL_ID,
  customBaseUrl: "",
  customApiKey: "",
  customModelId: "",
  customModels: [],
  fontScale: 1,
  disabledTools: [],
  defaultThinking: false,
  defaultSearch: false,
  globalContext: "",
};

function load(): Persisted {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Persisted;
      // 向后兼容：旧版 customModelId 非空但 customModels 为空时，自动迁移
      if (parsed.customModelId && (!parsed.customModels || parsed.customModels.length === 0)) {
        parsed.customModels = [{ id: parsed.customModelId }];
      }
      if (!parsed.customModels) parsed.customModels = [];
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

function persist(get: () => SettingsState) {
  if (typeof window === "undefined") return;
  const s = get();
  const data: Persisted = {
    selectedModelId: s.selectedModelId,
    customBaseUrl: s.customBaseUrl,
    customApiKey: s.customApiKey,
    customModelId: s.customModelId,
    customModels: s.customModels,
    fontScale: s.fontScale,
    disabledTools: s.disabledTools,
    defaultThinking: s.defaultThinking,
    defaultSearch: s.defaultSearch,
    globalContext: s.globalContext,
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...load(),

  setSelectedModelId: (id) => {
    set({ selectedModelId: id });
    persist(get);
  },
  setCustomProvider: (p) => {
    set((s) => ({
      customBaseUrl: p.baseUrl ?? s.customBaseUrl,
      customApiKey: p.apiKey ?? s.customApiKey,
    }));
    persist(get);
  },
  addCustomModel: (model) => {
    set((s) => ({
      customModels: [...s.customModels.filter((m) => m.id !== model.id), model],
    }));
    persist(get);
  },
  updateCustomModel: (id, model) => {
    set((s) => ({
      customModels: s.customModels.map((m) => (m.id === id ? model : m)),
    }));
    persist(get);
  },
  removeCustomModel: (id) => {
    set((s) => ({
      customModels: s.customModels.filter((m) => m.id !== id),
    }));
    persist(get);
  },
  setFontScale: (v) => {
    set({ fontScale: Math.min(1.35, Math.max(0.85, v)) });
    persist(get);
  },
  toggleTool: (name, enabled) => {
    set((s) => ({
      disabledTools: enabled
        ? s.disabledTools.filter((t) => t !== name)
        : Array.from(new Set([...s.disabledTools, name])),
    }));
    persist(get);
  },
  setDefaultThinking: (v) => {
    set({ defaultThinking: v });
    persist(get);
  },
  setDefaultSearch: (v) => {
    set({ defaultSearch: v });
    persist(get);
  },
  setGlobalContext: (v) => {
    set({ globalContext: v });
    persist(get);
  },
}));
