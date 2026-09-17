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
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { onSettingsFieldBlur, onSettingsFieldFocus } from "@/lib/settings/settingsSaveToast";

type SectionId = "general" | "appearance" | "models" | "capabilities" | "skills" | "data";
const SECTIONS: { id: SectionId; label: string; hint: string; icon: typeof Settings2 }[] = [
  { id: "general", label: "通用", hint: "常规与对话默认", icon: SlidersHorizontal },
  { id: "appearance", label: "外观", hint: "主题与阅读体验", icon: Palette },
  { id: "models", label: "模型配置", hint: "模型、API 与生图", icon: PlugZap },
  { id: "capabilities", label: "Agent 能力", hint: "工具与演示", icon: Orbit },
  { id: "skills", label: "Skills", hint: "技能库与注入", icon: ScrollText },
  { id: "data", label: "数据与账户", hint: "计费、同步与导出", icon: Database },
];

const CONTENT: Record<SectionId, { title: string; description: string; body: ReactNode }> = {
  general: {
    title: "通用设置", description: "调整新对话默认行为、划词助手和全局补充上下文。",
    body: <><DefaultsSection /><RecordAssistantSection /><ContextSection /></>,
  },
  appearance: {
    title: "外观", description: "这里与项目左下角的外观设置共用同一份配置，修改会立即同步。",
    body: <AppearanceSection />,
  },
  models: {
    title: "模型配置", description: "集中管理内置模型、自定义 API、专用能力端点与图片生成流程。",
    body: <><BuiltinModelsSection /><ApiGroupsSection /><CapabilityEndpointsSection /><ImageSection /></>,
  },
  capabilities: {
    title: "Agent 能力", description: "控制 Agent 可以调用的工具与交互能力，不影响模型或历史对话。",
    body: <ToolsSection />,
  },
  skills: {
    title: "Skills", description: "维护可供 Agent 按需调用或固定注入的技能。",
    body: <SkillsSection />,
  },
  data: {
    title: "数据与账户", description: "查看计费偏好、兑换、云同步与本地导出。",
    body: <><BillingSection /><RedemptionSection /><CloudSyncSection /><ExportSection /></>,
  },
};

export default function ChatSettings({
  onClose,
  showBack = true,
}: {
  onClose?: () => void;
  /** 手机底栏「设置」已是独立板块，不再显示返回对话。 */
  showBack?: boolean;
}) {
  const [active, setActive] = useState<SectionId>("general");
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
    onFocus={onSettingsFieldFocus}
    onBlur={onSettingsFieldBlur}
  >
    <aside className="chat-settings-sidebar" aria-label="Agent 设置分类">
      {showBack ? (
        <button type="button" onClick={close} className="chat-settings-back" aria-label="返回对话">
          <ArrowLeft size={15} /><span>返回对话</span>
        </button>
      ) : null}
      <div className="chat-settings-brand">
        <span className="chat-settings-brand-icon"><Settings2 size={16} /></span>
        <span><strong>设置</strong><small>AI Agent</small></span>
      </div>
      <nav className="chat-settings-nav">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const selected = active === section.id;
          return <button key={section.id} type="button" aria-current={selected ? "page" : undefined}
            className="chat-settings-nav-item" data-testid={`chat-settings-nav-${section.id}`} onClick={() => setActive(section.id)}>
            <Icon size={15} /><span><strong>{section.label}</strong><small>{section.hint}</small></span>
          </button>;
        })}
      </nav>
    </aside>
    <main className="chat-settings-main" tabIndex={-1}>
      <header className="chat-settings-content-header">
        <h1 className="sr-only">{content.title}</h1>
        <p>{content.description}</p>
      </header>
      <div key={active} className="chat-settings-content" data-testid={`chat-settings-content-${active}`}>
        {content.body}
      </div>
    </main>
  </div>;
}
