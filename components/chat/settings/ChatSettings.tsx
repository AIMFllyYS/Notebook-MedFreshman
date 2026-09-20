"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ArrowLeft, Database, Orbit, Palette, PlugZap, ScrollText, Settings2, SlidersHorizontal } from "lucide-react";
import { AppearanceSection } from "./AppearanceSection";
import { BuiltinModelsSection, DefaultsSection, RecordAssistantSection } from "./ModelSection";
import { ApiGroupsSection } from "./ApiGroupsSection";
import { ImageSection } from "./ImageSection";
import { CapabilityEndpointsSection } from "./CapabilityEndpointsSection";
import { ToolsSection } from "./ToolsSection";
import { ContextSection } from "./ContextSection";
import { BillingSection, CloudSyncSection, ExportSection, RedemptionSection } from "./DataSection";
import { SkillsSection } from "./SkillsSection";
import { useT } from "@/lib/i18n";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { onSettingsFieldBlur, onSettingsFieldFocus } from "@/lib/settings/settingsSaveToast";

type SectionId = "general" | "appearance" | "models" | "capabilities" | "skills" | "data";
const SECTIONS: { id: SectionId; labelKey: string; hintKey: string; icon: typeof Settings2 }[] = [
  { id: "general", labelKey: "settings.section.general.label", hintKey: "settings.section.general.hint", icon: SlidersHorizontal },
  { id: "appearance", labelKey: "settings.section.appearance.label", hintKey: "settings.section.appearance.hint", icon: Palette },
  { id: "models", labelKey: "settings.section.models.label", hintKey: "settings.section.models.hint", icon: PlugZap },
  { id: "capabilities", labelKey: "settings.section.capabilities.label", hintKey: "settings.section.capabilities.hint", icon: Orbit },
  { id: "skills", labelKey: "settings.section.skills.label", hintKey: "settings.section.skills.hint", icon: ScrollText },
  { id: "data", labelKey: "settings.section.data.label", hintKey: "settings.section.data.hint", icon: Database },
];

const CONTENT: Record<SectionId, { titleKey: string; descriptionKey: string; body: ReactNode }> = {
  general: {
    titleKey: "settings.section.general.title", descriptionKey: "settings.section.general.desc",
    body: <><DefaultsSection /><RecordAssistantSection /><ContextSection /></>,
  },
  appearance: {
    titleKey: "settings.section.appearance.title", descriptionKey: "settings.section.appearance.desc",
    body: <AppearanceSection />,
  },
  models: {
    titleKey: "settings.section.models.title", descriptionKey: "settings.section.models.desc",
    body: <><BuiltinModelsSection /><ApiGroupsSection /><CapabilityEndpointsSection /><ImageSection /></>,
  },
  capabilities: {
    titleKey: "settings.section.capabilities.title", descriptionKey: "settings.section.capabilities.desc",
    body: <ToolsSection />,
  },
  skills: {
    titleKey: "settings.section.skills.title", descriptionKey: "settings.section.skills.desc",
    body: <SkillsSection />,
  },
  data: {
    titleKey: "settings.section.data.title", descriptionKey: "settings.section.data.desc",
    body: <><BillingSection /><RedemptionSection /><CloudSyncSection /><ExportSection /></>,
  },
};

export default function ChatSettings({
  onClose,
  showBack = true,
  navPlacement = "side",
}: {
  onClose?: () => void;
  /** 手机底栏「设置」已是独立板块，不再显示返回对话。 */
  showBack?: boolean;
  /** 手机全屏：顶栏 Tab；桌面仍左侧导航。 */
  navPlacement?: "side" | "top";
}) {
  const [active, setActive] = useState<SectionId>("general");
  const t = useT();
  const close = useCallback(() => onClose?.(), [onClose]);
  useOverlayRegistration({
    id: "chat-settings-workspace",
    open: Boolean(onClose) && showBack,
    onClose: close,
    priority: 50,
  });
  const content = CONTENT[active];

  return <div
    className="chat-settings-workspace"
    data-testid="chat-settings-workspace"
    data-nav={navPlacement}
    onFocus={onSettingsFieldFocus}
    onBlur={onSettingsFieldBlur}
  >
    <aside className="chat-settings-sidebar" aria-label={t("settings.workspace.navAria")}>
      {showBack ? (
        <button type="button" onClick={close} className="chat-settings-back" aria-label={t("settings.workspace.back")}>
          <ArrowLeft size={15} /><span>{t("settings.workspace.back")}</span>
        </button>
      ) : null}
      <div className="chat-settings-brand">
        <span className="chat-settings-brand-icon"><Settings2 size={16} /></span>
        <span><strong>{t("settings.workspace.brand")}</strong><small>AI Agent</small></span>
      </div>
      <nav className="chat-settings-nav">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const selected = active === section.id;
          return <button key={section.id} type="button" aria-current={selected ? "page" : undefined}
            className="chat-settings-nav-item" data-testid={`chat-settings-nav-${section.id}`} onClick={() => setActive(section.id)}>
            <Icon size={15} /><span><strong>{t(section.labelKey)}</strong><small>{t(section.hintKey)}</small></span>
          </button>;
        })}
      </nav>
    </aside>
    <main className="chat-settings-main" tabIndex={-1}>
      <header className="chat-settings-content-header">
        <h1 className="sr-only">{t(content.titleKey)}</h1>
        <p>{t(content.descriptionKey)}</p>
      </header>
      <div key={active} className="chat-settings-content" data-testid={`chat-settings-content-${active}`}>
        {content.body}
      </div>
    </main>
  </div>;
}
