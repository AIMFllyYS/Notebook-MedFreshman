"use client";

import { Languages, PanelRight, Pin, Type } from "lucide-react";
import { LOCALES, useT } from "@/lib/i18n";
import { useSettings } from "@/lib/hooks/useSettings";
import { useStore } from "@/lib/stores/ui";
import { useTheme } from "@/lib/hooks/useTheme";
import AppearanceSettingsControls from "@/components/layout/AppearanceSettingsControls";
import { h3Cls, Toggle } from "./_shared";

export function AppearanceSection() {
  const fontScale = useSettings((s) => s.fontScale);
  const setFontScale = useSettings((s) => s.setFontScale);
  const showRightPanelTabBar = useSettings((s) => s.showRightPanelTabBar);
  const setShowRightPanelTabBar = useSettings((s) => s.setShowRightPanelTabBar);
  const pinChatHeader = useSettings((s) => s.pinChatHeader);
  const setPinChatHeader = useSettings((s) => s.setPinChatHeader);
  const locale = useSettings((s) => s.locale);
  const setLocale = useSettings((s) => s.setLocale);
  const t = useT();
  const { theme, setTheme, appearance, setAppearanceMode, setCustomAppearance, resetAppearance } = useTheme();

  return (
    <section className="flex flex-col gap-3">
      <h3 className={h3Cls}>Agent 面板</h3>
      {[
        {
          on: showRightPanelTabBar,
          set: (next: boolean) => {
            setShowRightPanelTabBar(next);
            if (!next) useStore.getState().setRightTab("ai");
          },
          label: "右侧栏顶部标签",
          desc: "显示「AI 对话 / 动画讲解 / 可交互」那一行",
          icon: <PanelRight size={16} />,
          ariaLabel: "显示右侧栏顶部标签",
        },
        {
          on: pinChatHeader,
          set: setPinChatHeader,
          label: "固定助教顶部导航",
          desc: "始终显示「设置 / 历史 / 新对话」，不随对话自动收起",
          icon: <Pin size={16} />,
          ariaLabel: "固定 AI 助教顶部导航",
        },
      ].map((it) => (
        <div
          key={it.label}
          className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--md-sys-color-primary)]">{it.icon}</span>
            <div>
              <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                {it.label}
              </div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                {it.desc}
              </div>
            </div>
          </div>
          <Toggle on={it.on} onClick={() => it.set(!it.on)} aria-label={it.ariaLabel} />
        </div>
      ))}
      <div className="settings-section-divider" />
      <h3 className={h3Cls}>整个项目</h3>
      {/* 语言是全局设置，跟外观一起归在「整个项目」；分段控件复用明暗主题那组胶囊的既有写法。 */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--md-sys-color-primary)]"><Languages size={16} /></span>
          <div>
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              {t("settings.language.title")}
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.language.desc")}
            </div>
          </div>
        </div>
        <div
          role="group"
          aria-label={t("settings.language.title")}
          className="flex shrink-0 items-center gap-0.5 rounded-full p-0.5"
          style={{ background: "var(--md-sys-color-surface-container-highest)" }}
        >
          {LOCALES.map((value) => {
            const active = locale === value;
            return (
              <button
                key={value}
                type="button"
                data-testid={`settings-locale-${value}`}
                aria-pressed={active}
                onClick={() => setLocale(value)}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={{
                  background: active ? "var(--md-sys-color-primary)" : "transparent",
                  color: active
                    ? "var(--md-sys-color-on-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
                }}
              >
                {value === "zh" ? t("settings.language.zh") : t("settings.language.en")}
              </button>
            );
          })}
        </div>
      </div>
      <AppearanceSettingsControls theme={theme} setTheme={setTheme} appearance={appearance}
        setAppearanceMode={setAppearanceMode} setCustomAppearance={setCustomAppearance} resetAppearance={resetAppearance} />
      <div className="settings-section-divider" />
      <h3 className={h3Cls}>对话阅读</h3>
      <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
        <Type size={14} />
        <span className="text-[12.5px]">对话字体大小</span>
        <span className="ml-auto text-[12px] font-medium text-[var(--md-sys-color-primary)]">
          {Math.round(fontScale * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0.85}
        max={1.35}
        step={0.05}
        value={fontScale}
        onChange={(e) => setFontScale(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--md-sys-color-primary)" }}
      />
      <div
        className="rounded-lg bg-[var(--md-sys-color-surface-container)] px-3 py-2 text-[var(--md-sys-color-on-surface)]"
        style={{ fontSize: `${13 * fontScale}px`, lineHeight: 1.6 }}
      >
        预览：这段文字的字号会随上面的滑块实时变化，对话区的回答也会同步缩放。
      </div>
    </section>
  );
}
