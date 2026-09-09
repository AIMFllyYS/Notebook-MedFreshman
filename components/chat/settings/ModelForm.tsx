"use client";

import { useState } from "react";
import { Cpu, ImagePlus } from "lucide-react";
import {
  type CustomModelConfig,
  THINKING_EFFORT_VALUES,
  THINKING_EFFORT_LABELS,
} from "@/lib/ai/models";
import {
  SIZE_OPTIONS,
  inputCls,
  labelCls,
  formToModel,
  type ModelFormState,
} from "./_shared";

/** 模型表单（添加/编辑），支持文本/生图 Tab 切换 + 能力勾选。 */
export function ModelForm({
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
                data-testid="custom-model-thinking-toggle"
                onChange={(e) =>
                  setForm({
                    ...form,
                    thinking: e.target.checked,
                    thinkingLevels: e.target.checked
                      ? form.thinkingLevels.length
                        ? form.thinkingLevels
                        : [...THINKING_EFFORT_VALUES]
                      : [],
                    thinkingRequired: e.target.checked ? form.thinkingRequired : false,
                  })
                }
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
            <div className="mt-1.5 flex flex-col gap-1.5" data-testid="custom-model-thinking-levels">
              <div className={labelCls}>思考强度（勾选该模型实际支持的档位）</div>
              <div className="flex flex-wrap gap-2">
                {THINKING_EFFORT_VALUES.map((level) => {
                  const on = form.thinkingLevels.includes(level);
                  return (
                    <label
                      key={level}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
                      style={{
                        borderColor: on
                          ? "var(--md-sys-color-primary)"
                          : "var(--md-sys-color-outline-variant)",
                        background: on
                          ? "color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent)"
                          : "transparent",
                        color: "var(--md-sys-color-on-surface)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        data-testid={`custom-model-thinking-level-${level}`}
                        onChange={() =>
                          setForm({
                            ...form,
                            thinkingLevels: on
                              ? form.thinkingLevels.filter((v) => v !== level)
                              : [...form.thinkingLevels, level],
                          })
                        }
                        className="hidden"
                      />
                      {THINKING_EFFORT_LABELS[level]}
                    </label>
                  );
                })}
              </div>
              <p className="text-[10.5px]" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                勾选的档位会出现在模型菜单和输入栏「深度思考」里，并按所选档位发给上游。一个都不勾则只保留思考开关，不发送强度。
              </p>
              <label className="inline-flex items-center gap-1.5 text-[12px] text-[var(--md-sys-color-on-surface)]">
                <input
                  type="checkbox"
                  checked={form.thinkingRequired}
                  data-testid="custom-model-thinking-required"
                  onChange={(e) => setForm({ ...form, thinkingRequired: e.target.checked })}
                />
                <span>思考不可关（如 GLM / Gemini 强制思考）</span>
              </label>
            </div>
          )}

          {/* API 兼容格式（三选一） */}
          <div className="mt-1">
            <div className={labelCls}>API 兼容格式</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "openai", label: "OpenAI", hint: "OpenAI / DeepSeek / One-API" },
                { value: "anthropic", label: "Anthropic", hint: "Claude 原生 /v1/messages" },
                { value: "siliconflow", label: "SiliconFlow", hint: "硅基流动 / 原生 Qwen" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-md border px-2 py-1.5 text-[11px]"
                  style={{
                    borderColor:
                      form.apiProtocol === opt.value
                        ? "var(--md-sys-color-primary)"
                        : "var(--md-sys-color-outline-variant)",
                    background:
                      form.apiProtocol === opt.value
                        ? "color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent)"
                        : "transparent",
                    color: "var(--md-sys-color-on-surface)",
                  }}
                >
                  <input
                    type="radio"
                    name={`apiProtocol-${form.id || "new"}`}
                    value={opt.value}
                    checked={form.apiProtocol === opt.value}
                    onChange={() =>
                      setForm({
                        ...form,
                        apiProtocol: opt.value as ModelFormState["apiProtocol"],
                      })
                    }
                    className="hidden"
                  />
                  <span className="font-medium">{opt.label}</span>
                  <span
                    className="truncate"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {opt.hint}
                  </span>
                </label>
              ))}
            </div>
            <div
              className="mt-1 text-[10.5px]"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              选中后：请求路径、鉴权头、图片编码、思考参数、推理字段全部自动匹配。
            </div>
          </div>

          {/* 高级 override（默认折叠） */}
          {form.thinking && (
            <details
              className="mt-1"
              open={form.showAdvanced}
              onToggle={(e) =>
                setForm({ ...form, showAdvanced: (e.target as HTMLDetailsElement).open })
              }
            >
              <summary
                className="cursor-pointer text-[11px]"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                高级：手动覆盖底层字段（多数用户无需展开）
              </summary>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div>
                  <label className={labelCls}>推理字段（override）</label>
                  <input
                    type="text"
                    value={form.reasoningField}
                    onChange={(e) => setForm({ ...form, reasoningField: e.target.value })}
                    placeholder="留空=按格式自动"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>思考参数格式（override）</label>
                  <select
                    value={form.thinkingRequestStyle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        thinkingRequestStyle: e.target.value as ModelFormState["thinkingRequestStyle"],
                      })
                    }
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
            </details>
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
          data-testid="custom-model-form-save"
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
