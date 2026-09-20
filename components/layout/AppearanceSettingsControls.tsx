"use client";

import { Moon, RotateCcw, Sun, Type } from "lucide-react";
import AppSelect from "@/components/ui/AppSelect";
import { useT } from "@/lib/i18n";
import {
  FONT_CHOICES,
  type AppearanceMode,
  type AppearanceSettings,
  type CustomAppearanceSettings,
  type GlobalFontId,
  type ThemeMode,
} from "@/lib/theme/appearance";

/** 外观模式 → 文案 key（值见 settings.appearance.mode*）；渲染方用 t() 取词。 */
export const APPEARANCE_LABEL_KEYS: Record<AppearanceMode, string> = {
  default: "settings.appearance.modeDefault",
  colorful: "settings.appearance.modeColorful",
  custom: "settings.appearance.modeCustom",
};

function AppearanceModeButton({
  mode,
  active,
  onClick,
}: {
  mode: AppearanceMode;
  active: boolean;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
      style={{
        background: active ? "var(--md-sys-color-primary)" : "transparent",
        color: active
          ? "var(--md-sys-color-on-primary)"
          : "var(--md-sys-color-on-surface-variant)",
      }}
    >
      {t(APPEARANCE_LABEL_KEYS[mode])}
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg bg-[var(--md-sys-color-surface-container-lowest)] px-3 py-2">
      <span className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">{label}</span>
      <span className="flex items-center gap-2">
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="h-7 w-9 cursor-pointer rounded border border-[var(--md-sys-color-outline-variant)] bg-transparent p-0.5"
        />
        <span className="w-[66px] text-right font-mono text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          {value}
        </span>
      </span>
    </label>
  );
}

export default function AppearanceSettingsControls({
  theme,
  setTheme,
  appearance,
  setAppearanceMode,
  setCustomAppearance,
  resetAppearance,
}: {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  appearance: AppearanceSettings;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setCustomAppearance: (next: Partial<CustomAppearanceSettings>) => void;
  resetAppearance: () => void;
}) {
  const t = useT();
  const updateCustomAppearance = (patch: Partial<CustomAppearanceSettings>) => {
    if (appearance.mode !== "custom") setAppearanceMode("custom");
    setCustomAppearance(patch);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--md-sys-color-surface-container-lowest)] px-3 py-2">
        <span className="text-[13px] text-[var(--md-sys-color-on-surface)]">{t("settings.appearance.theme")}</span>
        <div
          className="flex items-center gap-0.5 rounded-full p-0.5"
          style={{ background: "var(--md-sys-color-surface-container-highest)" }}
        >
          {(["light", "dark"] as const).map((mode) => {
            const active = theme === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={{
                  background: active ? "var(--md-sys-color-primary)" : "transparent",
                  color: active
                    ? "var(--md-sys-color-on-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
                }}
              >
                {mode === "light" ? <Sun size={13} /> : <Moon size={13} />}
                {t(mode === "light" ? "settings.appearance.light" : "settings.appearance.dark")}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex items-center gap-0.5 rounded-full p-0.5"
        style={{ background: "var(--md-sys-color-surface-container-highest)" }}
      >
        {(["default", "colorful", "custom"] as const).map((mode) => (
          <AppearanceModeButton
            key={mode}
            mode={mode}
            active={appearance.mode === mode}
            onClick={() => setAppearanceMode(mode)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <ColorField
          label={t("settings.appearance.lightAccent")}
          value={appearance.custom.lightAccent}
          onChange={(value) => updateCustomAppearance({ lightAccent: value })}
        />
        <ColorField
          label={t("settings.appearance.darkAccent")}
          value={appearance.custom.darkAccent}
          onChange={(value) => updateCustomAppearance({ darkAccent: value })}
        />
        <ColorField
          label={t("settings.appearance.selectionColor")}
          value={appearance.custom.selection}
          onChange={(value) => updateCustomAppearance({ selection: value })}
        />
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg bg-[var(--md-sys-color-surface-container-lowest)] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
          <Type size={14} /> {t("settings.appearance.font")}
        </span>
        <AppSelect label={t("settings.appearance.font")} value={appearance.custom.font}
          onValueChange={(font) => updateCustomAppearance({ font })}
          className="max-w-[150px]"
          options={(Object.keys(FONT_CHOICES) as GlobalFontId[]).map((fontId) => ({
            value: fontId, label: t(FONT_CHOICES[fontId].labelKey),
          }))} />
      </label>

      <button
        type="button"
        onClick={resetAppearance}
        className="press flex items-center justify-center gap-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-lowest)] px-3 py-2 text-[12.5px] font-semibold text-[var(--md-sys-color-on-surface-variant)]"
      >
        <RotateCcw size={14} /> {t("settings.appearance.reset")}
      </button>
    </div>
  );
}
