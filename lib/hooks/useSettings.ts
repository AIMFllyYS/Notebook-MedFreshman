import { create } from "zustand";
import {
  DEFAULT_MODEL_ID,
  normalizeCustomModelRegistryId,
  type CustomModelConfig,
  type CustomApiGroup,
} from "@/lib/ai/models";

export type ThinkingEffort = 'low' | 'medium' | 'high' | 'max';
const THINKING_EFFORTS: readonly ThinkingEffort[] = ['low', 'medium', 'high', 'max'];
function normalizeThinkingEffort(v: unknown): ThinkingEffort {
  return THINKING_EFFORTS.includes(v as ThinkingEffort) ? (v as ThinkingEffort) : 'medium';
}

/**
 * 全站 AI 设置（localStorage 持久化）。统一管理：
 * - 选中的模型 / 自定义 API 分组（多组，每组独立 baseUrl/apiKey + 模型列表）
 * - 默认生图模型 / 生图模式文本模型 + 容灾降级
 * - 聊天区字体缩放、工具启用/禁用、默认思考/搜索（S4 设置面板消费）
 */
export interface SettingsState {
  // ── 模型 ──────────────────────────────
  selectedModelId: string;

  // ── 自定义 API 分组（新版多组架构）─────
  customApiGroups: CustomApiGroup[];
  /** 默认生图模型 ID（互斥 toggle，null = 降级使用硅基流动内置生图模型）。 */
  defaultImageModelId: string | null;
  /** 生图模式下的文本模型（用于理解用户意图并生成生图提示词）。 */
  imageModeTextModel: string;
  /** 生图模式文本模型的容灾降级模型。 */
  imageModeTextModelFallback: string;

  // ── 旧版字段（@deprecated，仅用于向后兼容读取/迁移）──
  /** @deprecated 已迁移到 customApiGroups[0]。 */
  customBaseUrl: string;
  /** @deprecated 已迁移到 customApiGroups[0]。 */
  customApiKey: string;
  /** @deprecated 已迁移到 customApiGroups[0].models。 */
  customModelId: string;
  /** @deprecated 已迁移到 customApiGroups[0].models。 */
  customModels: CustomModelConfig[];

  // ── 体验（S4）────────────────────────
  fontScale: number; // 0.85 ~ 1.35
  disabledTools: string[]; // 被禁用的工具名
  defaultThinking: boolean;
  /** 新对话默认思考力度（仅在 defaultThinking=true 时生效）。 */
  defaultThinkingEffort: ThinkingEffort;
  defaultSearch: boolean;

  // ── 全局补充上下文 ────────────────────
  /** 所有对话自动注入的用户自定义文本（拼入稳定系统前缀）。 */
  globalContext: string;

  // ── 计费换算 ──────────────────────────
  /** 人民币兑美元汇率，默认 7.00 */
  usdExchangeRate: number;

  // ── Actions ──────────────────────────
  setSelectedModelId: (id: string) => void;

  // 新版：API 分组管理
  addApiGroup: (group: CustomApiGroup) => void;
  updateApiGroup: (id: string, patch: Partial<Omit<CustomApiGroup, "id">>) => void;
  removeApiGroup: (id: string) => void;
  addModelToGroup: (groupId: string, model: CustomModelConfig) => void;
  updateModelInGroup: (groupId: string, modelId: string, model: CustomModelConfig) => void;
  removeModelFromGroup: (groupId: string, modelId: string) => void;

  // 新版：生图设置
  setDefaultImageModel: (modelId: string | null) => void;
  setImageModeTextModel: (modelId: string) => void;
  setImageModeTextModelFallback: (modelId: string) => void;

  // 旧版 Actions（@deprecated，操作 customApiGroups[0]）
  setCustomProvider: (p: { baseUrl?: string; apiKey?: string }) => void;
  addCustomModel: (model: CustomModelConfig) => void;
  updateCustomModel: (id: string, model: CustomModelConfig) => void;
  removeCustomModel: (id: string) => void;

  setFontScale: (v: number) => void;
  toggleTool: (name: string, enabled: boolean) => void;
  setDefaultThinking: (v: boolean) => void;
  setDefaultThinkingEffort: (v: ThinkingEffort) => void;
  setDefaultSearch: (v: boolean) => void;
  setGlobalContext: (v: string) => void;
  setUsdExchangeRate: (v: number) => void;
}

const LS_KEY = "gailvlun-settings-v1";

type Persisted = Pick<
  SettingsState,
  | "selectedModelId"
  | "customApiGroups"
  | "defaultImageModelId"
  | "imageModeTextModel"
  | "imageModeTextModelFallback"
  | "customBaseUrl"
  | "customApiKey"
  | "customModelId"
  | "customModels"
  | "fontScale"
  | "disabledTools"
  | "defaultThinking"
  | "defaultThinkingEffort"
  | "defaultSearch"
  | "globalContext"
  | "usdExchangeRate"
>;

const DEFAULTS: Persisted = {
  selectedModelId: DEFAULT_MODEL_ID,
  customApiGroups: [],
  defaultImageModelId: null,
  imageModeTextModel: "mimo-v2.5",
  imageModeTextModelFallback: "Pro/moonshotai/Kimi-K2.6",
  customBaseUrl: "",
  customApiKey: "",
  customModelId: "",
  customModels: [],
  fontScale: 1,
  disabledTools: [],
  defaultThinking: false,
  defaultThinkingEffort: 'medium',
  defaultSearch: false,
  globalContext: "",
  usdExchangeRate: 7.00,
};

function load(): Persisted {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Persisted;
      // 向后兼容 1：旧版 customModelId 非空但 customModels 为空时，自动迁移
      if (parsed.customModelId && (!parsed.customModels || parsed.customModels.length === 0)) {
        parsed.customModels = [{ id: parsed.customModelId }];
      }
      if (!parsed.customModels) parsed.customModels = [];

      // 向后兼容 2：旧版单组 API → 迁移到 customApiGroups
      if (!parsed.customApiGroups || parsed.customApiGroups.length === 0) {
        const hasOldConfig =
          (parsed.customBaseUrl && parsed.customBaseUrl.trim()) ||
          (parsed.customApiKey && parsed.customApiKey.trim()) ||
          parsed.customModels.length > 0;
        if (hasOldConfig) {
          parsed.customApiGroups = [{
            id: "migrated",
            name: "我的 API",
            baseUrl: parsed.customBaseUrl || "",
            apiKey: parsed.customApiKey || "",
            models: parsed.customModels,
          }];
        } else {
          parsed.customApiGroups = [];
        }
      }
      if (!parsed.defaultImageModelId) parsed.defaultImageModelId = null;
      if (!parsed.imageModeTextModel) parsed.imageModeTextModel = "mimo-v2.5";
      if (!parsed.imageModeTextModelFallback) parsed.imageModeTextModelFallback = "Pro/moonshotai/Kimi-K2.6";
      if (typeof parsed.usdExchangeRate !== "number" || !Number.isFinite(parsed.usdExchangeRate) || parsed.usdExchangeRate <= 0) {
        parsed.usdExchangeRate = 7.00;
      }
      parsed.defaultThinkingEffort = normalizeThinkingEffort(parsed.defaultThinkingEffort);
      parsed.selectedModelId = normalizeCustomModelRegistryId(parsed.selectedModelId, parsed.customApiGroups);
      parsed.defaultImageModelId = parsed.defaultImageModelId
        ? normalizeCustomModelRegistryId(parsed.defaultImageModelId, parsed.customApiGroups)
        : null;
      parsed.imageModeTextModel = normalizeCustomModelRegistryId(
        parsed.imageModeTextModel,
        parsed.customApiGroups,
      );
      parsed.imageModeTextModelFallback = normalizeCustomModelRegistryId(
        parsed.imageModeTextModelFallback,
        parsed.customApiGroups,
      );
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
  // 旧版字段从 customApiGroups[0] 派生，保持向后兼容
  const firstGroup = s.customApiGroups[0];
  const data: Persisted = {
    selectedModelId: s.selectedModelId,
    customApiGroups: s.customApiGroups,
    defaultImageModelId: s.defaultImageModelId,
    imageModeTextModel: s.imageModeTextModel,
    imageModeTextModelFallback: s.imageModeTextModelFallback,
    customBaseUrl: firstGroup?.baseUrl ?? "",
    customApiKey: firstGroup?.apiKey ?? "",
    customModelId: "",
    customModels: firstGroup?.models ?? [],
    fontScale: s.fontScale,
    disabledTools: s.disabledTools,
    defaultThinking: s.defaultThinking,
    defaultThinkingEffort: s.defaultThinkingEffort,
    defaultSearch: s.defaultSearch,
    globalContext: s.globalContext,
    usdExchangeRate: s.usdExchangeRate,
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

  // ── 新版：API 分组管理 ──────────────
  addApiGroup: (group) => {
    set((s) => ({ customApiGroups: [...s.customApiGroups, group] }));
    persist(get);
  },
  updateApiGroup: (id, patch) => {
    set((s) => ({
      customApiGroups: s.customApiGroups.map((g) =>
        g.id === id ? { ...g, ...patch } : g,
      ),
    }));
    persist(get);
  },
  removeApiGroup: (id) => {
    set((s) => ({
      customApiGroups: s.customApiGroups.filter((g) => g.id !== id),
    }));
    persist(get);
  },
  addModelToGroup: (groupId, model) => {
    set((s) => ({
      customApiGroups: s.customApiGroups.map((g) =>
        g.id === groupId
          ? { ...g, models: [...g.models.filter((m) => m.id !== model.id), model] }
          : g,
      ),
    }));
    persist(get);
  },
  updateModelInGroup: (groupId, modelId, model) => {
    set((s) => ({
      customApiGroups: s.customApiGroups.map((g) =>
        g.id === groupId
          ? { ...g, models: g.models.map((m) => (m.id === modelId ? model : m)) }
          : g,
      ),
    }));
    persist(get);
  },
  removeModelFromGroup: (groupId, modelId) => {
    set((s) => ({
      customApiGroups: s.customApiGroups.map((g) =>
        g.id === groupId
          ? { ...g, models: g.models.filter((m) => m.id !== modelId) }
          : g,
      ),
    }));
    persist(get);
  },

  // ── 新版：生图设置 ──────────────────
  setDefaultImageModel: (modelId) => {
    set({ defaultImageModelId: modelId });
    persist(get);
  },
  setImageModeTextModel: (modelId) => {
    set({ imageModeTextModel: modelId });
    persist(get);
  },
  setImageModeTextModelFallback: (modelId) => {
    set({ imageModeTextModelFallback: modelId });
    persist(get);
  },

  // ── 旧版 Actions（@deprecated，操作 customApiGroups[0]）──
  setCustomProvider: (p) => {
    set((s) => {
      const groups = [...s.customApiGroups];
      if (groups.length === 0) {
        groups.push({ id: "migrated", name: "我的 API", baseUrl: "", apiKey: "", models: [] });
      }
      if (p.baseUrl !== undefined) groups[0] = { ...groups[0], baseUrl: p.baseUrl };
      if (p.apiKey !== undefined) groups[0] = { ...groups[0], apiKey: p.apiKey };
      return { customApiGroups: groups };
    });
    persist(get);
  },
  addCustomModel: (model) => {
    set((s) => {
      const groups = [...s.customApiGroups];
      if (groups.length === 0) {
        groups.push({ id: "migrated", name: "我的 API", baseUrl: "", apiKey: "", models: [] });
      }
      groups[0] = {
        ...groups[0],
        models: [...groups[0].models.filter((m) => m.id !== model.id), model],
      };
      return { customApiGroups: groups };
    });
    persist(get);
  },
  updateCustomModel: (id, model) => {
    set((s) => {
      const groups = [...s.customApiGroups];
      if (groups.length === 0) return s;
      groups[0] = {
        ...groups[0],
        models: groups[0].models.map((m) => (m.id === id ? model : m)),
      };
      return { customApiGroups: groups };
    });
    persist(get);
  },
  removeCustomModel: (id) => {
    set((s) => {
      const groups = [...s.customApiGroups];
      if (groups.length === 0) return s;
      groups[0] = {
        ...groups[0],
        models: groups[0].models.filter((m) => m.id !== id),
      };
      return { customApiGroups: groups };
    });
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
  setDefaultThinkingEffort: (v) => {
    set({ defaultThinkingEffort: normalizeThinkingEffort(v) });
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
  setUsdExchangeRate: (v) => {
    // 单一真相源：clamp 到 [0.01, 10]，非有限数回退默认 7.00
    const safe = Number.isFinite(v) ? Math.max(0.01, Math.min(10, v)) : 7.00;
    set({ usdExchangeRate: safe });
    persist(get);
  },
}));
