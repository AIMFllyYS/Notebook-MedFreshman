export type ThemeMode = "light" | "dark";
export type AppearanceMode = "default" | "colorful" | "custom";
export type GlobalFontId = "system" | "songti" | "kaiti" | "hei" | "serif" | "mono";

export interface CustomAppearanceSettings {
  lightAccent: string;
  darkAccent: string;
  selection: string;
  font: GlobalFontId;
}

export interface AppearanceSettings {
  mode: AppearanceMode;
  custom: CustomAppearanceSettings;
}

export const APPEARANCE_LS_KEY = "gailvlun-appearance-v1";

export const FONT_CHOICES: Record<GlobalFontId, { label: string; cssValue: string }> = {
  system: {
    label: "系统默认",
    cssValue:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", sans-serif',
  },
  songti: {
    label: "宋体阅读",
    cssValue:
      '"Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, Georgia, "Times New Roman", serif',
  },
  kaiti: {
    label: "楷体手写",
    cssValue:
      'KaiTi, STKaiti, "Kaiti SC", "LXGW WenKai", "Ma Shan Zheng", "Microsoft YaHei", cursive',
  },
  hei: {
    label: "黑体清晰",
    cssValue:
      '"Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
  },
  serif: {
    label: "英文衬线",
    cssValue: 'Georgia, "Times New Roman", "Noto Serif SC", "Songti SC", serif',
  },
  mono: {
    label: "等宽",
    cssValue: '"JetBrains Mono", "Cascadia Code", Consolas, "Microsoft YaHei", monospace',
  },
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  mode: "default",
  custom: {
    lightAccent: "#6750a4",
    darkAccent: "#a8c7fa",
    selection: "#ff9800",
    font: "system",
  },
};

const APPEARANCE_MODES = new Set<AppearanceMode>(["default", "colorful", "custom"]);
const FONT_IDS = new Set<GlobalFontId>(Object.keys(FONT_CHOICES) as GlobalFontId[]);

const INLINE_VAR_NAMES = [
  "--appearance-light-accent",
  "--appearance-dark-accent",
  "--appearance-light-on-accent",
  "--appearance-dark-on-accent",
  "--appearance-light-accent-container",
  "--appearance-dark-accent-container",
  "--appearance-light-on-accent-container",
  "--appearance-dark-on-accent-container",
  "--appearance-selection",
  "--appearance-selection-bg",
  "--appearance-highlight-a",
  "--appearance-highlight-b",
  "--appearance-highlight-c",
  "--appearance-highlight-d",
  "--appearance-highlight-shadow",
  "--font-sans",
] as const;

export function safeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : fallback;
}

function parsePayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function contrastText(hex: string): string {
  const rgb = hex.slice(1).match(/.{2}/g)?.map((part) => parseInt(part, 16));
  if (!rgb || rgb.length !== 3) return "#ffffff";
  const [r, g, b] = rgb.map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.56 ? "#111318" : "#ffffff";
}

function readFontId(value: unknown): GlobalFontId {
  return typeof value === "string" && FONT_IDS.has(value as GlobalFontId)
    ? (value as GlobalFontId)
    : DEFAULT_APPEARANCE_SETTINGS.custom.font;
}

export function normalizeAppearanceSettings(value: unknown): AppearanceSettings {
  const parsed = parsePayload(value);
  if (!parsed || typeof parsed !== "object") return DEFAULT_APPEARANCE_SETTINGS;
  const raw = parsed as { mode?: unknown; custom?: unknown };
  if (typeof raw.mode !== "string" || !APPEARANCE_MODES.has(raw.mode as AppearanceMode)) {
    return DEFAULT_APPEARANCE_SETTINGS;
  }

  const custom = raw.custom && typeof raw.custom === "object"
    ? (raw.custom as Partial<CustomAppearanceSettings>)
    : {};

  return {
    mode: raw.mode as AppearanceMode,
    custom: {
      lightAccent: safeHexColor(custom.lightAccent, DEFAULT_APPEARANCE_SETTINGS.custom.lightAccent),
      darkAccent: safeHexColor(custom.darkAccent, DEFAULT_APPEARANCE_SETTINGS.custom.darkAccent),
      selection: safeHexColor(custom.selection, DEFAULT_APPEARANCE_SETTINGS.custom.selection),
      font: readFontId(custom.font),
    },
  };
}

export function serializeAppearanceSettings(settings: AppearanceSettings): string {
  const normalized = normalizeAppearanceSettings(settings);
  return JSON.stringify({
    mode: normalized.mode,
    custom: normalized.custom,
  });
}

export function buildAppearanceCssVars(settings: AppearanceSettings): Record<string, string> {
  const normalized = normalizeAppearanceSettings(settings);
  if (normalized.mode !== "custom") return {};

  const { lightAccent, darkAccent, selection, font } = normalized.custom;
  return {
    "--appearance-light-accent": lightAccent,
    "--appearance-dark-accent": darkAccent,
    "--appearance-light-on-accent": contrastText(lightAccent),
    "--appearance-dark-on-accent": contrastText(darkAccent),
    "--appearance-light-accent-container": `color-mix(in srgb, ${lightAccent} 16%, white)`,
    "--appearance-dark-accent-container": `color-mix(in srgb, ${darkAccent} 24%, #10131a)`,
    "--appearance-light-on-accent-container": contrastText(lightAccent),
    "--appearance-dark-on-accent-container": contrastText(darkAccent),
    "--appearance-selection": selection,
    "--appearance-selection-bg": `color-mix(in srgb, ${selection} 34%, transparent)`,
    "--appearance-highlight-a": `color-mix(in srgb, ${selection} 28%, transparent)`,
    "--appearance-highlight-b": `color-mix(in srgb, ${selection} 42%, transparent)`,
    "--appearance-highlight-c": `color-mix(in srgb, ${selection} 30%, transparent)`,
    "--appearance-highlight-d": `color-mix(in srgb, ${selection} 38%, transparent)`,
    "--appearance-highlight-shadow": `color-mix(in srgb, ${selection} 30%, transparent)`,
    "--font-sans": FONT_CHOICES[font].cssValue,
  };
}

export function readAppearanceFromStorage(storage: Storage | null | undefined): AppearanceSettings {
  if (!storage) return DEFAULT_APPEARANCE_SETTINGS;
  try {
    return normalizeAppearanceSettings(storage.getItem(APPEARANCE_LS_KEY));
  } catch {
    return DEFAULT_APPEARANCE_SETTINGS;
  }
}

export function writeAppearanceToStorage(
  storage: Storage | null | undefined,
  settings: AppearanceSettings,
): void {
  if (!storage) return;
  try {
    storage.setItem(APPEARANCE_LS_KEY, serializeAppearanceSettings(settings));
  } catch {
    /* ignore */
  }
}

export function applyAppearanceToDocument(
  doc: Document | null | undefined,
  settings: AppearanceSettings,
): void {
  if (!doc) return;
  const normalized = normalizeAppearanceSettings(settings);
  const root = doc.documentElement;
  root.setAttribute("data-appearance", normalized.mode);
  root.setAttribute("data-font", normalized.custom.font);

  for (const name of INLINE_VAR_NAMES) {
    root.style.removeProperty(name);
  }

  const vars = buildAppearanceCssVars(normalized);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
