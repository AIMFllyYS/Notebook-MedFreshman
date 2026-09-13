"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { formatImageGenError } from "@/lib/ai/imageGenError";
import {
  EMPTY_CAPABILITY_ENDPOINTS,
  IMAGE_API_STYLES,
  capabilityNeedsForImageGen,
  selectCapabilityEndpointsForRequest,
  type ImageApiStyle,
} from "@/lib/ai/capabilityEndpoints";
import { inputCls, labelCls } from "./_shared";
import AppSelect from "@/components/ui/AppSelect";
import SettingsDisclosure from "./SettingsDisclosure";

export function CapabilityEndpointsSection() {
  const capabilityEndpoints = useSettings((s) => s.capabilityEndpoints) ?? EMPTY_CAPABILITY_ENDPOINTS;
  const setCapabilityEndpoints = useSettings((s) => s.setCapabilityEndpoints);
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const defaultImageModelId = useSettings((s) => s.defaultImageModelId);
  const selectedModelId = useSettings((s) => s.selectedModelId);
  const [expanded, setExpanded] = useState(false);
  const [probeBusy, setProbeBusy] = useState(false);
  const [probeMessage, setProbeMessage] = useState<string | null>(null);

  const probeImageEndpoint = async () => {
    setProbeBusy(true);
    setProbeMessage(null);
    try {
      const res = await fetch("/api/image-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          probe: true,
          modelId: selectedModelId,
          customApiGroups,
          defaultImageModelId,
          capabilityEndpoints: selectCapabilityEndpointsForRequest(
            capabilityEndpoints,
            capabilityNeedsForImageGen(),
          ),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setProbeMessage(formatImageGenError(res.status, body));
        return;
      }
      setProbeMessage(typeof body?.message === "string" ? body.message : "生图端点已配置");
    } catch (err) {
      setProbeMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setProbeBusy(false);
    }
  };

  return (
    <SettingsDisclosure expanded={expanded} onToggle={() => setExpanded((v) => !v)}
      icon={<KeyRound size={14} />} title="能力端点" meta="生图、向量、搜索与重排">
        <div className="flex flex-col gap-3">
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            每一项留空 = 使用平台默认。填写自己的密钥后，该能力不计入平台额度。
          </p>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-3">
            <legend className="px-1 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
              生图
            </legend>
            <div>
              <label className={labelCls}>Base URL</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.imageBaseUrl}
                onChange={(e) => setCapabilityEndpoints({ imageBaseUrl: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>API Key</label>
              <input
                className={inputCls}
                type="password"
                value={capabilityEndpoints.imageApiKey}
                onChange={(e) => setCapabilityEndpoints({ imageApiKey: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>模型 ID</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.imageModelId}
                onChange={(e) => setCapabilityEndpoints({ imageModelId: e.target.value })}
                placeholder="留空 = 内置生图模型"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>API 风格</label>
              <AppSelect label="生图 API 风格" value={capabilityEndpoints.imageApiStyle}
                onValueChange={(imageApiStyle: ImageApiStyle) => setCapabilityEndpoints({ imageApiStyle })}
                options={IMAGE_API_STYLES.map((style) => ({ value: style, label: style }))} />
            </div>
            <button
              type="button"
              onClick={() => void probeImageEndpoint()}
              disabled={probeBusy}
              className="press self-start rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--md-sys-color-on-surface)]"
            >
              {probeBusy ? "检查中…" : "测试生图连通"}
            </button>
            {probeMessage && (
              <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                {probeMessage}
              </p>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-3">
            <legend className="px-1 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
              向量 embedding
            </legend>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              查询向量需与索引构建模型一致。离线建索引仍只用环境变量。
            </p>
            <div>
              <label className={labelCls}>Base URL</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.embeddingBaseUrl}
                onChange={(e) => setCapabilityEndpoints({ embeddingBaseUrl: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>API Key</label>
              <input
                className={inputCls}
                type="password"
                value={capabilityEndpoints.embeddingApiKey}
                onChange={(e) => setCapabilityEndpoints({ embeddingApiKey: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>模型 ID</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.embeddingModelId}
                onChange={(e) => setCapabilityEndpoints({ embeddingModelId: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-3">
            <legend className="px-1 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
              重排 rerank
            </legend>
            <div>
              <label className={labelCls}>Base URL</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.rerankBaseUrl}
                onChange={(e) => setCapabilityEndpoints({ rerankBaseUrl: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>API Key</label>
              <input
                className={inputCls}
                type="password"
                value={capabilityEndpoints.rerankApiKey}
                onChange={(e) => setCapabilityEndpoints({ rerankApiKey: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>模型 ID</label>
              <input
                className={inputCls}
                value={capabilityEndpoints.rerankModelId}
                onChange={(e) => setCapabilityEndpoints({ rerankModelId: e.target.value })}
                placeholder="留空 = 平台默认"
                autoComplete="off"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-3">
            <legend className="px-1 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
              联网搜索（智谱）
            </legend>
            <div>
              <label className={labelCls}>智谱 API Key</label>
              <input
                className={inputCls}
                type="password"
                value={capabilityEndpoints.webSearchApiKey}
                onChange={(e) => setCapabilityEndpoints({ webSearchApiKey: e.target.value })}
                placeholder="留空 = 平台 ZHIPU_API_KEY"
                autoComplete="off"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-3">
            <legend className="px-1 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
              搜图（Unsplash）
            </legend>
            <div>
              <label className={labelCls}>Unsplash Access Key</label>
              <input
                className={inputCls}
                type="password"
                value={capabilityEndpoints.unsplashAccessKey}
                onChange={(e) => setCapabilityEndpoints({ unsplashAccessKey: e.target.value })}
                placeholder="留空 = 平台 UNSPLASH_ACCESS_KEY"
                autoComplete="off"
              />
            </div>
          </fieldset>
        </div>
    </SettingsDisclosure>
  );
}
