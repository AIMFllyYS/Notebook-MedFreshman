"use client";

import { Settings, X } from "lucide-react";
import { AppearanceSection } from "./AppearanceSection";
import { BuiltinModelsSection, DefaultsSection, RecordAssistantSection } from "./ModelSection";
import { ApiGroupsSection } from "./ApiGroupsSection";
import { ImageSection } from "./ImageSection";
import { CapabilityEndpointsSection } from "./CapabilityEndpointsSection";
import { ToolsSection } from "./ToolsSection";
import { ContextSection } from "./ContextSection";
import { BillingSection, ExportSection } from "./DataSection";
import { SkillsSection } from "./SkillsSection";

export default function ChatSettings({ onClose }: { onClose?: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--md-sys-color-surface-container-low)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Settings size={15} className="text-[var(--md-sys-color-primary)]" />
          <span className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">
            AI 设置
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <AppearanceSection />
        <BuiltinModelsSection />
        <ApiGroupsSection />
        <RecordAssistantSection />
        <ImageSection />
        <CapabilityEndpointsSection />
        <ToolsSection />
        <DefaultsSection />
        <ContextSection />
        <BillingSection />
        <SkillsSection />
        <ExportSection />
      </div>
    </div>
  );
}
