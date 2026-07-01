"use client";

import { Fragment, useState } from "react";
import {
  Settings,
  X,
  Eye,
  EyeOff,
  Type,
  Brain,
  Globe,
  BookText,
  Download,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  Star,
  ImagePlus,
  Sparkles,
  Cpu,
  DollarSign,
} from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import {
  type CustomModelConfig,
  type CustomApiGroup,
  MODELS,
  getAllModels,
  buildCustomModelRegistryId,
} from "@/lib/ai/models";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import { exportAllChats } from "@/lib/chat/exportChats";
import SkillsManager from "./SkillsManager";

const TOOLS: { name: string; label: string; desc: string }[] = [
  { name: "getCurrentPage", label: "读取当前页", desc: "让 AI 获取你正在阅读的页面内容" },
  { name: "getOutline", label: "课程大纲", desc: "让 AI 查看全部科目的章节大纲" },
  { name: "getSection", label: "读取指定页面", desc: "让 AI 调取任意科目的任意小节正文" },
  { name: "searchNotes", label: "全文检索", desc: "让 AI 在全部课程笔记中按关键词检索" },
  { name: "webSearch", label: "联网搜索", desc: "需配置 Bocha key；联网获取实时信息" },
  { name: "renderInteractive", label: "交互演示", desc: "让 AI 生成可交互的 HTML 讲解（横幅/弹窗查看）" },
  { name: "drawDiagram", label: "SVG 绘图", desc: "让 AI 绘制矢量示意图（分子/电路/光路/几何等）" },
  { name: "generateImage", label: "AI 生图", desc: "让 AI 生成图片（需用户批准，优先 SVG，仅必要时使用）" },
];

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
  tools: boolean;
  reasoningField: string;
  thinkingRequestStyle: "none" | "siliconflow" | "openai-reasoning-effort" | "openrouter-reasoning" | "anthropic-thinking";
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
  tools: true,
  reasoningField: "",
  thinkingRequestStyle: "siliconflow",
  imageApiStyle: "auto",
  sizes: DEFAULT_SIZES.slice(),
  maxCount: "4",
};

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
    tools: m.tools ?? !isImage,
    reasoningField: m.reasoningField ?? "",
    thinkingRequestStyle: m.thinkingRequestStyle ?? (m.thinking ? "siliconflow" : "none"),
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
    tools: f.tools,
    reasoningField: f.reasoningField.trim() || undefined,
    thinkingRequestStyle: f.thinking ? f.thinkingRequestStyle : "none",
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
              思考
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

/** 模型表单（添加/编辑），支持文本/生图 Tab 切换 + 能力勾选。 */
function ModelForm({
  initial,
  isEditing,
  onSave,
  onCancel,
}: {
  initial: ModelFormState;
  isEditing: boolean;
  onSave: (config: CustomModelConfig) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ModelFormState>(initial);
  const isImage = form.modelType === "image";
  const canSave =
    form.id.trim().length > 0 &&
    (isImage || (form.inputPrice.trim() && form.outputPrice.trim()));

  const toggleSize = (sz: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(sz) ? f.sizes.filter((s) => s !== sz) : [...f.sizes, sz],
    }));
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
          {isEditing ? "编辑模型" : "添加模型"}
        </span>
        {/* Tab 切换：文本 / 生图 */}
        {!isEditing && (
          <div
            className="flex overflow-hidden rounded-lg border"
            style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
          >
            <button
              onClick={() => setForm((f) => ({ ...f, modelType: "text" }))}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                background:
                  form.modelType === "text"
                    ? "var(--md-sys-color-primary)"
                    : "transparent",
                color:
                  form.modelType === "text"
                    ? "var(--md-sys-color-on-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <Cpu size={11} /> 文本模型
            </button>
            <button
              onClick={() => setForm((f) => ({ ...f, modelType: "image" }))}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                background:
                  form.modelType === "image"
                    ? "var(--md-sys-color-primary)"
                    : "transparent",
                color:
                  form.modelType === "image"
                    ? "var(--md-sys-color-on-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <ImagePlus size={11} /> 生图模型
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>模型 ID（必填）</label>
          <input
            type="text"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder={isImage ? "Tongyi-MAI/Z-Image-Turbo" : "gpt-4o-mini"}
            className={inputCls}
            disabled={isEditing}
          />
        </div>
        <div>
          <label className={labelCls}>显示名（可选）</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={isImage ? "Z-Image Turbo" : "GPT-4o mini"}
            className={inputCls}
          />
        </div>

        {!isImage && (
          <>
            <div>
              <label className={labelCls}>上下文窗口 K（默认 128）</label>
              <input
                type="number"
                value={form.contextK}
                onChange={(e) => setForm({ ...form, contextK: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>缓存 TTL 秒（默认 3600）</label>
              <input
                type="number"
                value={form.cacheTtlSec}
                onChange={(e) => setForm({ ...form, cacheTtlSec: e.target.value })}
                className={inputCls}
              />
            </div>
          </>
        )}

        <div>
          <label className={labelCls}>
            {isImage ? "单价 ¥/张（可选）" : "输入价格 ¥/百万（必填）"}
          </label>
          <input
            type="number"
            step="0.001"
            value={form.inputPrice}
            onChange={(e) => setForm({ ...form, inputPrice: e.target.value })}
            placeholder={isImage ? "0.10" : "0"}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            {isImage ? "(占位，留空)" : "输出价格 ¥/百万（必填）"}
          </label>
          <input
            type="number"
            step="0.001"
            value={form.outputPrice}
            onChange={(e) => setForm({ ...form, outputPrice: e.target.value })}
            placeholder="0"
            className={inputCls}
            disabled={isImage}
          />
        </div>

        {!isImage && (
          <>
            <div>
              <label className={labelCls}>缓存命中价格（可选）</label>
              <input
                type="number"
                step="0.001"
                value={form.cachedInputPrice}
                onChange={(e) => setForm({ ...form, cachedInputPrice: e.target.value })}
                placeholder="不填=无缓存"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>缓存写入价格（可选）</label>
              <input
                type="number"
                step="0.001"
                value={form.cacheWritePrice}
                onChange={(e) => setForm({ ...form, cacheWritePrice: e.target.value })}
                placeholder="不填=按缓存命中"
                className={inputCls}
              />
            </div>
          </>
        )}
      </div>

      {/* 能力勾选（文本模型） */}
      {!isImage && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-2">
          <div className={labelCls}>能力</div>
          <div className="flex flex-wrap gap-3 text-[12px] text-[var(--md-sys-color-on-surface)]">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.checked })}
              />
              <span>视觉（图片输入）</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.thinking}
                onChange={(e) => setForm({ ...form, thinking: e.target.checked })}
              />
              <span>深度思考</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.tools}
                onChange={(e) => setForm({ ...form, tools: e.target.checked })}
              />
              <span>工具调用</span>
            </label>
          </div>
          {form.thinking && (
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className={labelCls}>推理字段</label>
                <input
                  type="text"
                  value={form.reasoningField}
                  onChange={(e) => setForm({ ...form, reasoningField: e.target.value })}
                  placeholder="reasoning_content"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>思考参数格式</label>
                <select
                  value={form.thinkingRequestStyle}
                  onChange={(e) => setForm({
                    ...form,
                    thinkingRequestStyle: e.target.value as ModelFormState["thinkingRequestStyle"],
                  })}
                  className={inputCls}
                >
                  <option value="siliconflow">enable_thinking / thinking_budget</option>
                  <option value="openai-reasoning-effort">reasoning_effort</option>
                  <option value="openrouter-reasoning">reasoning.effort（OpenRouter）</option>
                  <option value="anthropic-thinking">thinking.budget_tokens（Anthropic 原生）</option>
                  <option value="none">不发送思考参数</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 生图参数 */}
      {isImage && (
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-2">
          <div className={labelCls}>支持尺寸（多选）</div>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((sz) => (
              <label
                key={sz}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
                style={{
                  borderColor: form.sizes.includes(sz)
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-outline-variant)",
                  background: form.sizes.includes(sz)
                    ? "color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent)"
                    : "transparent",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.sizes.includes(sz)}
                  onChange={() => toggleSize(sz)}
                  className="hidden"
                />
                {sz}
              </label>
            ))}
          </div>
          <div>
            <label className={labelCls}>最大生成数量</label>
            <input
              type="number"
              min={1}
              max={8}
              value={form.maxCount}
              onChange={(e) => setForm({ ...form, maxCount: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>生图 API 格式</label>
            <select
              value={form.imageApiStyle}
              onChange={(e) => setForm({
                ...form,
                imageApiStyle: e.target.value as ModelFormState["imageApiStyle"],
              })}
              className={inputCls}
            >
              <option value="auto">自动识别</option>
              <option value="openai">OpenAI Images API</option>
              <option value="siliconflow">SiliconFlow 图片接口</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSave(formToModel(form))}
          disabled={!canSave}
          className="press rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="press rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
        >
          取消
        </button>
      </div>
    </div>
  );
}

/** 单个自定义 API 分组卡片（可折叠）。 */
function ApiGroupCard({
  group,
  defaultImageModelId,
  onUpdate,
  onRemove,
  onAddModel,
  onUpdateModel,
  onRemoveModel,
  onSetDefaultImage,
}: {
  group: CustomApiGroup;
  defaultImageModelId: string | null;
  onUpdate: (patch: Partial<Omit<CustomApiGroup, "id">>) => void;
  onRemove: () => void;
  onAddModel: (m: CustomModelConfig) => void;
  onUpdateModel: (modelId: string, m: CustomModelConfig) => void;
  onRemoveModel: (modelId: string) => void;
  onSetDefaultImage: (modelId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  const startAdd = () => {
    setEditingModelId(null);
    setShowAddForm(true);
  };
  const startEdit = (m: CustomModelConfig) => {
    setShowAddForm(false);
    setEditingModelId(m.id);
  };
  const handleSave = (config: CustomModelConfig) => {
    if (!config.id) return;
    if (editingModelId) onUpdateModel(editingModelId, config);
    else onAddModel(config);
    setShowAddForm(false);
    setEditingModelId(null);
  };

  return (
    <div className="rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
      {/* 折叠头 */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {editingName ? (
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              onUpdate({ name: nameDraft.trim() || group.name });
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate({ name: nameDraft.trim() || group.name });
                setEditingName(false);
              }
              if (e.key === "Escape") {
                setNameDraft(group.name);
                setEditingName(false);
              }
            }}
            autoFocus
            className="min-w-0 flex-1 rounded border border-[var(--md-sys-color-primary)] bg-transparent px-1.5 py-0.5 text-[12.5px] text-[var(--md-sys-color-on-surface)] outline-none"
          />
        ) : (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold text-[var(--md-sys-color-on-surface)]"
          >
            {group.name}
          </button>
        )}
        <span className="shrink-0 text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
          {group.models.length} 个模型
        </span>
        <button
          onClick={() => {
            setNameDraft(group.name);
            setEditingName(true);
          }}
          title="重命名分组"
          className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => {
            if (confirm(`删除分组 ${group.name}？此操作不可撤销。`)) onRemove();
          }}
          title="删除分组"
          className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* 展开内容 */}
      {expanded && (
        <div className="flex flex-col gap-2.5 border-t border-[var(--md-sys-color-outline-variant)] p-3">
          <div>
            <label className={labelCls}>API 端点（base URL，含 /v1）</label>
            <input
              type="url"
              value={group.baseUrl}
              onChange={(e) => onUpdate({ baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>API 密钥</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={group.apiKey}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="sk-..."
                className={inputCls + " pr-9"}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>已添加模型（{group.models.length}）</label>
            {group.models.length === 0 ? (
              <p className="py-2 text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">
                暂无模型，点击下方按钮添加
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {group.models.map((m) => (
                  <Fragment key={m.id}>
                    <ModelRow
                      model={m}
                      isDefaultImage={
                        m.type === "image" &&
                        defaultImageModelId === buildCustomModelRegistryId(group.id, m.id)
                      }
                      onSetDefault={
                        m.type === "image"
                          ? () => onSetDefaultImage(buildCustomModelRegistryId(group.id, m.id))
                          : undefined
                      }
                      onEdit={() => startEdit(m)}
                      onDelete={() => {
                        if (confirm(`删除模型 ${m.label || m.id}？`)) onRemoveModel(m.id);
                      }}
                      isEditing={editingModelId === m.id}
                    />
                    {editingModelId === m.id && (
                      <div className="rounded-lg border border-[var(--md-sys-color-primary)] bg-[color-mix(in_srgb,var(--md-sys-color-primary)_4%,var(--md-sys-color-surface))] p-2.5">
                        <ModelForm
                          initial={modelToForm(m)}
                          isEditing
                          onSave={handleSave}
                          onCancel={() => setEditingModelId(null)}
                        />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {showAddForm ? (
            <ModelForm
              initial={EMPTY_FORM}
              isEditing={false}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={startAdd}
              className="press flex items-center gap-1.5 self-start rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
            >
              <Plus size={13} /> 添加模型
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** AI 对话设置面板（作为对话区的浮层；数据落 useSettings）。 */
export default function ChatSettings({ onClose }: { onClose?: () => void }) {
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const addApiGroup = useSettings((s) => s.addApiGroup);
  const updateApiGroup = useSettings((s) => s.updateApiGroup);
  const removeApiGroup = useSettings((s) => s.removeApiGroup);
  const addModelToGroup = useSettings((s) => s.addModelToGroup);
  const updateModelInGroup = useSettings((s) => s.updateModelInGroup);
  const removeModelFromGroup = useSettings((s) => s.removeModelFromGroup);

  const defaultImageModelId = useSettings((s) => s.defaultImageModelId);
  const setDefaultImageModel = useSettings((s) => s.setDefaultImageModel);
  const imageModeTextModel = useSettings((s) => s.imageModeTextModel);
  const setImageModeTextModel = useSettings((s) => s.setImageModeTextModel);
  const imageModeTextModelFallback = useSettings((s) => s.imageModeTextModelFallback);
  const setImageModeTextModelFallback = useSettings((s) => s.setImageModeTextModelFallback);

  const fontScale = useSettings((s) => s.fontScale);
  const setFontScale = useSettings((s) => s.setFontScale);
  const disabledTools = useSettings((s) => s.disabledTools);
  const toggleTool = useSettings((s) => s.toggleTool);
  const defaultThinking = useSettings((s) => s.defaultThinking);
  const setDefaultThinking = useSettings((s) => s.setDefaultThinking);
  const defaultThinkingEffort = useSettings((s) => s.defaultThinkingEffort);
  const setDefaultThinkingEffort = useSettings((s) => s.setDefaultThinkingEffort);
  const defaultSearch = useSettings((s) => s.defaultSearch);
  const setDefaultSearch = useSettings((s) => s.setDefaultSearch);
  const globalContext = useSettings((s) => s.globalContext);
  const setGlobalContext = useSettings((s) => s.setGlobalContext);
  const usdExchangeRate = useSettings((s) => s.usdExchangeRate);
  const setUsdExchangeRate = useSettings((s) => s.setUsdExchangeRate);

  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [builtinExpanded, setBuiltinExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(true);
  const [imageGenExpanded, setImageGenExpanded] = useState(true);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupBaseUrl, setNewGroupBaseUrl] = useState("");
  const [newGroupApiKey, setNewGroupApiKey] = useState("");

  const handleCreateGroup = () => {
    const name = newGroupName.trim() || `API 分组 ${customApiGroups.length + 1}`;
    addApiGroup({
      id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      baseUrl: newGroupBaseUrl.trim(),
      apiKey: newGroupApiKey.trim(),
      models: [],
    });
    setNewGroupName("");
    setNewGroupBaseUrl("");
    setNewGroupApiKey("");
    setShowNewGroupForm(false);
  };

  // 内置生图模型（用于「设为默认生图」toggle）
  const builtinImageModels = MODELS.filter((m) => m.type === "image");
  const builtinTextModels = MODELS.filter((m) => m.type !== "image");
  // 文本模型下拉选项（含自定义）
  const allTextModels = getAllModels(customApiGroups).filter((m) => m.type !== "image");

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--md-sys-color-surface-container-low)]">
      {/* 头部 */}
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
        {/* 外观 */}
        <section className="flex flex-col gap-2">
          <h3 className={h3Cls}>外观</h3>
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

        {/* 内置模型（折叠） */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => setBuiltinExpanded((v) => !v)}
            className="flex items-center gap-1.5 self-start"
          >
            {builtinExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <h3 className={h3Cls}>内置模型（站点默认）</h3>
            <span className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
              · {MODELS.length} 个
            </span>
          </button>
          {builtinExpanded && (
            <div className="flex flex-col gap-2 pl-4">
              <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                由部署方在 .env 配置，所有用户共享。下方仅展示，不可修改。
              </p>
              <div>
                <div className={labelCls}>文本模型（{builtinTextModels.length}）</div>
                <div className="flex flex-col gap-1.5">
                  {builtinTextModels.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                            {m.label}
                          </span>
                          {m.thinking && (
                            <span
                              className="shrink-0 rounded px-1 text-[9px]"
                              style={{
                                background: "var(--md-sys-color-surface-container-high)",
                                color: "var(--md-sys-color-on-surface-variant)",
                              }}
                            >
                              思考
                            </span>
                          )}
                          {m.vision && (
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
                          {m.group} · {m.contextK}K{" "}
                          {m.pricing && `· ¥${m.pricing.input}/${m.pricing.output}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {builtinImageModels.length > 0 && (
                <div>
                  <div className={labelCls}>生图模型（{builtinImageModels.length}）</div>
                  <div className="flex flex-col gap-1.5">
                    {builtinImageModels.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                              {m.label}
                            </span>
                            <span
                              className="shrink-0 rounded px-1 text-[9px]"
                              style={{
                                background:
                                  "color-mix(in srgb, var(--md-sys-color-secondary) 18%, transparent)",
                                color: "var(--md-sys-color-secondary)",
                              }}
                            >
                              生图
                            </span>
                          </div>
                          <div className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
                            {m.hint}
                          </div>
                        </div>
                        <button
                          onClick={() => setDefaultImageModel(m.id)}
                          title={
                            defaultImageModelId === m.id
                              ? "已是默认生图模型"
                              : "设为默认生图模型"
                          }
                          className="rounded p-1 hover:bg-[var(--md-sys-color-surface-container-high)]"
                          style={{
                            color:
                              defaultImageModelId === m.id
                                ? "var(--md-sys-color-primary)"
                                : "var(--md-sys-color-on-surface-variant)",
                          }}
                        >
                          <Star
                            size={13}
                            fill={defaultImageModelId === m.id ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 自定义 API（多分组折叠） */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => setCustomExpanded((v) => !v)}
            className="flex items-center gap-1.5 self-start"
          >
            {customExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <h3 className={h3Cls}>自定义 API（与站点默认并存）</h3>
            <span className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
              · {customApiGroups.length} 个分组
            </span>
          </button>
          {customExpanded && (
            <div className="flex flex-col gap-2 pl-4">
              <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                可创建多个 API 分组，每组独立 baseUrl/apiKey + 模型列表，全部出现在模型菜单中。
              </p>

              {customApiGroups.map((group) => (
                <ApiGroupCard
                  key={group.id}
                  group={group}
                  defaultImageModelId={defaultImageModelId}
                  onUpdate={(patch) => updateApiGroup(group.id, patch)}
                  onRemove={() => removeApiGroup(group.id)}
                  onAddModel={(m) => addModelToGroup(group.id, m)}
                  onUpdateModel={(modelId, m) => updateModelInGroup(group.id, modelId, m)}
                  onRemoveModel={(modelId) => removeModelFromGroup(group.id, modelId)}
                  onSetDefaultImage={(modelId) => setDefaultImageModel(modelId)}
                />
              ))}

              {showNewGroupForm ? (
                <div className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3">
                  <span className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    新建 API 分组
                  </span>
                  <div>
                    <label className={labelCls}>分组名称</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="我的 API"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>API 端点（base URL，含 /v1）</label>
                    <input
                      type="url"
                      value={newGroupBaseUrl}
                      onChange={(e) => setNewGroupBaseUrl(e.target.value)}
                      placeholder="https://api.example.com/v1"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>API 密钥</label>
                    <input
                      type="password"
                      value={newGroupApiKey}
                      onChange={(e) => setNewGroupApiKey(e.target.value)}
                      placeholder="sk-..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateGroup}
                      className="press rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)]"
                    >
                      创建
                    </button>
                    <button
                      onClick={() => {
                        setShowNewGroupForm(false);
                        setNewGroupName("");
                        setNewGroupBaseUrl("");
                        setNewGroupApiKey("");
                      }}
                      className="press rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewGroupForm(true)}
                  className="press flex items-center gap-1.5 self-start rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
                >
                  <Plus size={13} /> 新建 API 分组
                </button>
              )}
            </div>
          )}
        </section>

        {/* 生图设置 */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => setImageGenExpanded((v) => !v)}
            className="flex items-center gap-1.5 self-start"
          >
            {imageGenExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Sparkles size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3Cls}>生图设置</h3>
          </button>
          {imageGenExpanded && (
            <div className="flex flex-col gap-2.5 pl-4">
              <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                默认生图模型可在「内置模型」或「自定义 API」中点击 ⭐ 设置。生图模式下，
                AI 会先用文本模型理解意图并优化提示词，再调用生图模型实际生成图片。
              </p>
              <div className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
                <div className="text-[12.5px] text-[var(--md-sys-color-on-surface)]">
                  当前默认生图模型
                </div>
                <div className="text-[11.5px] text-[var(--md-sys-color-primary)]">
                  {defaultImageModelId ?? "（降级使用硅基流动 Z-Image-Turbo）"}
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
                <select
                  value={imageModeTextModel}
                  onChange={(e) => setImageModeTextModel(e.target.value)}
                  className={inputCls}
                >
                  {allTextModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} · {m.group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>容灾降级模型（主模型失败时使用）</label>
                <select
                  value={imageModeTextModelFallback}
                  onChange={(e) => setImageModeTextModelFallback(e.target.value)}
                  className={inputCls}
                >
                  {allTextModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} · {m.group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* 工具 */}
        <section className="flex flex-col gap-2">
          <h3 className={h3Cls}>工具调用</h3>
          {TOOLS.map((t) => {
            const enabled = !disabledTools.includes(t.name);
            return (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                    {t.label}
                  </div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    {t.desc}
                  </div>
                </div>
                <Toggle on={enabled} onClick={() => toggleTool(t.name, !enabled)} />
              </div>
            );
          })}
        </section>

        {/* 默认选项 */}
        <section className="flex flex-col gap-2">
          <h3 className={h3Cls}>新对话默认</h3>
          {[
            {
              on: defaultThinking,
              set: setDefaultThinking,
              label: "深度思考",
              desc: "新对话默认开启深度推理",
              icon: <Brain size={16} />,
            },
            {
              on: defaultSearch,
              set: setDefaultSearch,
              label: "联网搜索",
              desc: "新对话默认开启联网搜索",
              icon: <Globe size={16} />,
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
              <Toggle on={it.on} onClick={() => it.set(!it.on)} />
            </div>
          ))}

          {/* 默认思考力度 segmented（仅在 defaultThinking=true 时高亮，关闭时置灰但仍可选） */}
          <div
            className={
              "flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2 " +
              (defaultThinking ? "" : "opacity-60")
            }
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[var(--md-sys-color-primary)]">
                <Brain size={16} />
              </span>
              <div>
                <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                  默认思考力度
                </div>
                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  新对话默认使用的思考深度（仅在开启深度思考时生效）
                </div>
              </div>
            </div>
            <div
              role="radiogroup"
              aria-label="默认思考力度"
              className="flex items-center rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-variant)] p-0.5"
            >
              {(["low", "medium", "high", "max"] as const).map((lvl) => {
                const active = defaultThinkingEffort === lvl;
                const label = lvl === "low" ? "Low" : lvl === "medium" ? "Med" : lvl === "high" ? "High" : "Max";
                const hint = lvl === "low"
                  ? "~8k tokens"
                  : lvl === "medium"
                  ? "~16k tokens"
                  : lvl === "high"
                  ? "~32k tokens"
                  : "~64k tokens";
                return (
                  <button
                    key={lvl}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDefaultThinkingEffort(lvl)}
                    title={hint}
                    data-testid={`default-thinking-effort-${lvl}`}
                    className={
                      "px-2 py-0.5 text-[11px] font-medium rounded transition-colors " +
                      (active
                        ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                        : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface)]")
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 全局补充上下文 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3Cls}>全局补充上下文</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            这里的文字会注入每次对话的系统提示词（拼入稳定前缀，利于缓存）。适合放通用背景、称呼、风格偏好等。
          </p>
          <textarea
            value={globalContext}
            onChange={(e) => setGlobalContext(e.target.value)}
            placeholder="例如：请用简洁的中文回答，公式用 KaTeX，回答末尾附一句要点总结。"
            rows={4}
            className={inputCls + " resize-y leading-relaxed"}
          />
          <div className="self-end text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
            {globalContext.length} 字
          </div>
        </section>

        {/* 计费与汇率 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3Cls}>计费与汇率</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            计费大盘中支持翻转卡片将人民币 (¥) 切换为美元 ($)。你可以在这里自定义兑换汇率。
          </p>
          <div className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
            <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
              美元汇率 (USD/CNY)
            </div>
            <input
              type="number"
              min={0.01}
              max={10.00}
              step={0.01}
              value={usdExchangeRate || ""}
              onBlur={(e) => {
                // store 内部已 clamp，这里只做失焦兜底（NaN 回默认 + 两位小数）
                const val = parseFloat(e.target.value);
                setUsdExchangeRate(Number.isNaN(val) ? 7.00 : val);
              }}
              onChange={(e) => {
                // 仅在能解析出有效数字时更新；清空/无效输入暂不写 store，避免跳值
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v)) setUsdExchangeRate(v);
              }}
              className="w-20 rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2 py-1 text-right text-[12.5px] outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>
        </section>

        {/* 技能库 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <PencilSparklesIcon size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3Cls}>技能库（Skills）</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            上传单个 <BookText size={11} className="inline align-text-bottom" /> .md 文件作为「技能」。AI 会根据名称与描述按需调用其完整内容；
            打开右侧开关可将该技能「固定开启」（每轮强制注入）。
          </p>
          <SkillsManager />
        </section>

        {/* 数据 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Download size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3Cls}>数据</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            把全部聊天记录（主对话 + 划词）导出为本地 JSON 文件备份。仅保存到你选择的位置，绝不上传任何服务器。
          </p>
          <button
            onClick={() => {
              void exportAllChats().then((r) => {
                setExportMsg(r.ok ? `已导出 ${r.count} 个会话` : "暂无可导出的聊天数据");
              });
            }}
            className="press flex items-center gap-1.5 self-start rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)]"
          >
            <Download size={13} /> 导出所有聊天数据
          </button>
          {exportMsg && (
            <span className="text-[11px] font-medium text-[var(--md-sys-color-primary)]">
              {exportMsg}
            </span>
          )}
        </section>
      </div>
    </div>
  );
}
