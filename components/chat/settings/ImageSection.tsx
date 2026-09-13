"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { getAllModels } from "@/lib/ai/models";
import { labelCls } from "./_shared";
import AppSelect from "@/components/ui/AppSelect";
import SettingsDisclosure from "./SettingsDisclosure";

export function ImageSection() {
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const defaultImageModelId = useSettings((s) => s.defaultImageModelId);
  const setDefaultImageModel = useSettings((s) => s.setDefaultImageModel);
  const imageModeTextModel = useSettings((s) => s.imageModeTextModel);
  const setImageModeTextModel = useSettings((s) => s.setImageModeTextModel);
  const imageModeTextModelFallback = useSettings((s) => s.imageModeTextModelFallback);
  const setImageModeTextModelFallback = useSettings((s) => s.setImageModeTextModelFallback);
  const [imageGenExpanded, setImageGenExpanded] = useState(true);
  const allTextModels = getAllModels(customApiGroups).filter((m) => m.type !== "image");

  return (
    <SettingsDisclosure expanded={imageGenExpanded} onToggle={() => setImageGenExpanded((v) => !v)}
      icon={<Sparkles size={14} />} title="生图设置" meta="默认模型、提示词模型与容灾">
        <div className="flex flex-col gap-2.5">
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            默认生图模型可在「内置模型」或「自定义 API」中点击 ⭐ 设置。生图模式下，
            AI 会先用文本模型理解意图并优化提示词，再调用生图模型实际生成图片。
          </p>
          <div className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
            <div className="text-[12.5px] text-[var(--md-sys-color-on-surface)]">
              当前默认生图模型
            </div>
            <div className="text-[11.5px] text-[var(--md-sys-color-primary)]">
              {defaultImageModelId ?? "（降级使用内置生图模型）"}
            </div>
          </div>
          {defaultImageModelId && (
            <button
              onClick={() => setDefaultImageModel(null)}
              className="press self-start rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
            >
              清除默认（恢复降级）
            </button>
          )}
          <div>
            <label className={labelCls}>生图模式文本模型（理解意图 + 优化提示词）</label>
            <AppSelect label="生图模式文本模型" value={imageModeTextModel} onValueChange={setImageModeTextModel}
              options={allTextModels.map((m) => ({ value: m.id, label: `${m.label} · ${m.group}` }))} />
          </div>
          <div>
            <label className={labelCls}>容灾降级模型（主模型失败时使用）</label>
            <AppSelect label="容灾降级模型" value={imageModeTextModelFallback} onValueChange={setImageModeTextModelFallback}
              options={allTextModels.map((m) => ({ value: m.id, label: `${m.label} · ${m.group}` }))} />
          </div>
        </div>
    </SettingsDisclosure>
  );
}
