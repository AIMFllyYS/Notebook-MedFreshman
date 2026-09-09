"use client";

import {
  type CustomModelConfig,
  type ThinkingEffort,
  THINKING_EFFORT_VALUES,
  THINKING_EFFORT_LABELS,
  normalizeThinkingLevels,
} from "@/lib/ai/models";
import { Pencil, Star, Trash2 } from "lucide-react";

const SIZE_OPTIONS = ["1024x1024", "960x1280", "768x1024", "720x1440", "720x1280"];
const DEFAULT_SIZES = ["1024x1024", "960x1280", "768x1024"];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors"
      style={{
        background: on
          ? "var(--md-sys-color-primary)"
          : "var(--md-sys-color-surface-container-highest)",
      }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full transition-[left]"
        style={{
          left: on ? 21 : 3,
          background: "var(--md-sys-color-on-primary)",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2.5 py-2 text-[13px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]";
const labelCls =
  "block text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1";
const h3Cls = "text-[13px] font-bold text-[var(--md-sys-color-on-surface)] m-0";

interface ModelFormState {
  modelType: "text" | "image";
  id: string;
  label: string;
  contextK: string;
  cacheTtlSec: string;
  inputPrice: string;
  cachedInputPrice: string;
  cacheWritePrice: string;
  outputPrice: string;
  vision: boolean;
  thinking: boolean;
  thinkingLevels: ThinkingEffort[];
  thinkingRequired: boolean;
  tools: boolean;
  apiProtocol: "openai" | "anthropic" | "siliconflow";
  reasoningField: string;
  thinkingRequestStyle: "none" | "siliconflow" | "openai-reasoning-effort" | "openrouter-reasoning" | "anthropic-thinking";
  showAdvanced: boolean;
  imageApiStyle: "auto" | "openai" | "siliconflow";
  sizes: string[];
  maxCount: string;
}

const EMPTY_FORM: ModelFormState = {
  modelType: "text",
  id: "",
  label: "",
  contextK: "128",
  cacheTtlSec: "3600",
  inputPrice: "",
  cachedInputPrice: "",
  cacheWritePrice: "",
  outputPrice: "",
  vision: false,
  thinking: false,
  thinkingLevels: [...THINKING_EFFORT_VALUES],
  thinkingRequired: false,
  tools: true,
  apiProtocol: "openai",
  reasoningField: "",
  thinkingRequestStyle: "siliconflow",
  showAdvanced: false,
  imageApiStyle: "auto",
  sizes: DEFAULT_SIZES.slice(),
  maxCount: "4",
};

/** 老配置 → 新 apiProtocol 字段的迁移推断（与 lib/ai/provider.inferProtocolFromLegacy 保持一致）。 */
function inferApiProtocol(m: CustomModelConfig): "openai" | "anthropic" | "siliconflow" {
  if (m.apiProtocol) return m.apiProtocol;
  if (m.thinkingRequestStyle === "anthropic-thinking") return "anthropic";
  if (m.thinkingRequestStyle === "siliconflow") return "siliconflow";
  return "openai";
}

function modelToForm(m: CustomModelConfig): ModelFormState {
  const isImage = m.type === "image";
  return {
    modelType: isImage ? "image" : "text",
    id: m.id,
    label: m.label ?? "",
    contextK: String(m.contextK ?? 128),
    cacheTtlSec: String(m.cacheTtlSec ?? 3600),
    inputPrice: m.pricing ? String(m.pricing.input) : "",
    cachedInputPrice: m.pricing?.cachedInput != null ? String(m.pricing.cachedInput) : "",
    cacheWritePrice: m.pricing?.cacheWrite != null ? String(m.pricing.cacheWrite) : "",
    outputPrice: m.pricing ? String(m.pricing.output) : "",
    vision: !!m.vision,
    thinking: !!m.thinking,
    thinkingLevels: m.thinking
      ? (m.thinkingLevels === undefined ? [...THINKING_EFFORT_VALUES] : normalizeThinkingLevels(m.thinkingLevels))
      : [],
    thinkingRequired: !!m.thinkingRequired,
    tools: m.tools ?? !isImage,
    apiProtocol: inferApiProtocol(m),
    reasoningField: m.reasoningField ?? "",
    thinkingRequestStyle: m.thinkingRequestStyle ?? (m.thinking ? "siliconflow" : "none"),
    showAdvanced: !!(m.reasoningField || m.thinkingRequestStyle),
    imageApiStyle: m.imageApiStyle ?? "auto",
    sizes: m.imageParams?.sizes?.length ? m.imageParams.sizes : DEFAULT_SIZES.slice(),
    maxCount: String(m.imageParams?.maxCount ?? 4),
  };
}

function formToModel(f: ModelFormState): CustomModelConfig {
  if (f.modelType === "image") {
    return {
      id: f.id.trim(),
      label: f.label.trim() || undefined,
      type: "image",
      tools: false,
      thinking: false,
      imageApiStyle: f.imageApiStyle,
      imageParams: {
        sizes: f.sizes.length ? f.sizes : DEFAULT_SIZES.slice(),
        maxCount: Number(f.maxCount) || 4,
      },
      pricing:
        f.inputPrice.trim() || f.outputPrice.trim()
          ? {
              input: Number(f.inputPrice) || 0,
              output: Number(f.outputPrice) || 0,
              cachedInput: f.cachedInputPrice.trim() ? Number(f.cachedInputPrice) : undefined,
              cacheWrite: f.cacheWritePrice.trim() ? Number(f.cacheWritePrice) : undefined,
            }
          : undefined,
    };
  }
  return {
    id: f.id.trim(),
    label: f.label.trim() || undefined,
    type: "text",
    contextK: Number(f.contextK) || 128,
    cacheTtlSec: Number(f.cacheTtlSec) || 3600,
    vision: f.vision || undefined,
    thinking: f.thinking || undefined,
    thinkingLevels: f.thinking ? normalizeThinkingLevels(f.thinkingLevels) : undefined,
    thinkingRequired: f.thinking && f.thinkingRequired ? true : undefined,
    tools: f.tools,
    apiProtocol: f.apiProtocol,
    // 高级 override：仅当用户展开高级面板并显式填写时保留；否则清空由 apiProtocol 自动装配。
    reasoningField: f.showAdvanced ? f.reasoningField.trim() || undefined : undefined,
    thinkingRequestStyle: f.showAdvanced
      ? (f.thinking ? f.thinkingRequestStyle : "none")
      : undefined,
    pricing: {
      input: Number(f.inputPrice) || 0,
      output: Number(f.outputPrice) || 0,
      cachedInput: f.cachedInputPrice.trim() ? Number(f.cachedInputPrice) : undefined,
      cacheWrite: f.cacheWritePrice.trim() ? Number(f.cacheWritePrice) : undefined,
    },
  };
}

/** 单条模型行：展示名称、能力徽章、定价；提供编辑/删除/⭐ 设为默认生图。 */
function ModelRow({
  model,
  isDefaultImage,
  onSetDefault,
  onEdit,
  onDelete,
  isEditing,
}: {
  model: CustomModelConfig;
  isDefaultImage?: boolean;
  onSetDefault?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}) {
  const isImage = model.type === "image";
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-2"
      style={{
        borderColor: isEditing ? "var(--md-sys-color-primary)" : "var(--md-sys-color-outline-variant)",
        background: isEditing
          ? "color-mix(in srgb, var(--md-sys-color-primary) 6%, var(--md-sys-color-surface))"
          : "var(--md-sys-color-surface)",
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
            {model.label || model.id}
          </span>
          {isImage && (
            <span
              className="shrink-0 rounded px-1 text-[9px]"
              style={{
                background: "color-mix(in srgb, var(--md-sys-color-secondary) 18%, transparent)",
                color: "var(--md-sys-color-secondary)",
              }}
            >
              生图
            </span>
          )}
          {model.thinking && (
            <span
              className="shrink-0 rounded px-1 text-[9px]"
              style={{
                background: "var(--md-sys-color-surface-container-high)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              {model.thinkingRequired ? "思考不可关" : "思考"}
              {normalizeThinkingLevels(model.thinkingLevels).length > 0
                ? ` · ${normalizeThinkingLevels(model.thinkingLevels).map((l) => THINKING_EFFORT_LABELS[l]).join("/")}`
                : model.thinkingLevels === undefined
                  ? ` · ${THINKING_EFFORT_VALUES.map((l) => THINKING_EFFORT_LABELS[l]).join("/")}`
                  : ""}
            </span>
          )}
          {model.vision && (
            <span
              className="shrink-0 rounded px-1 text-[9px]"
              style={{
                background:
                  "color-mix(in srgb, var(--md-sys-color-tertiary) 15%, transparent)",
                color: "var(--md-sys-color-tertiary)",
              }}
            >
              视觉
            </span>
          )}
        </div>
        <div className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
          {model.id}
          {!isImage && ` · ${model.contextK ?? 128}K`}
          {model.pricing && ` · ¥${model.pricing.input}/${model.pricing.output}`}
          {isImage && model.imageParams?.sizes?.length
            ? ` · ${model.imageParams.sizes.length} 尺寸`
            : ""}
        </div>
      </div>
      {isImage && onSetDefault && (
        <button
          onClick={onSetDefault}
          title={isDefaultImage ? "已是默认生图模型" : "设为默认生图模型"}
          className="rounded p-1 hover:bg-[var(--md-sys-color-surface-container-high)]"
          style={{
            color: isDefaultImage
              ? "var(--md-sys-color-primary)"
              : "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <Star size={13} fill={isDefaultImage ? "currentColor" : "none"} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Pencil size={13} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export { Toggle, ModelRow, inputCls, labelCls, h3Cls, SIZE_OPTIONS, DEFAULT_SIZES, EMPTY_FORM, modelToForm, formToModel };
export type { ModelFormState };
