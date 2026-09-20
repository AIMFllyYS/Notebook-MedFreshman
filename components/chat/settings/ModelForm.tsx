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
import AppSelect from "@/components/ui/AppSelect";
import { useT } from "@/lib/i18n";

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
  const t = useT();
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
          {t(isEditing ? "settings.modelForm.edit" : "settings.modelForm.add")}
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
              <Cpu size={11} /> {t("settings.modelForm.typeText")}
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
              <ImagePlus size={11} /> {t("settings.modelForm.typeImage")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>{t("settings.modelForm.modelId")}</label>
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
          <label className={labelCls}>{t("settings.modelForm.label")}</label>
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
              <label className={labelCls}>{t("settings.modelForm.contextK")}</label>
              <input
                type="number"
                value={form.contextK}
                onChange={(e) => setForm({ ...form, contextK: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("settings.modelForm.cacheTtl")}</label>
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
            {t(isImage ? "settings.modelForm.imagePrice" : "settings.modelForm.inputPrice")}
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
            {t(isImage ? "settings.modelForm.imageOutputPrice" : "settings.modelForm.outputPrice")}
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
              <label className={labelCls}>{t("settings.modelForm.cachedInputPrice")}</label>
              <input
                type="number"
                step="0.001"
                value={form.cachedInputPrice}
                onChange={(e) => setForm({ ...form, cachedInputPrice: e.target.value })}
                placeholder={t("settings.modelForm.noCache")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("settings.modelForm.cacheWritePrice")}</label>
              <input
                type="number"
                step="0.001"
                value={form.cacheWritePrice}
                onChange={(e) => setForm({ ...form, cacheWritePrice: e.target.value })}
                placeholder={t("settings.modelForm.cacheHit")}
                className={inputCls}
              />
            </div>
          </>
        )}
      </div>

      {/* 能力勾选（文本模型） */}
      {!isImage && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-2">
          <div className={labelCls}>{t("settings.modelForm.capabilities")}</div>
          <div className="flex flex-wrap gap-3 text-[12px] text-[var(--md-sys-color-on-surface)]">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.checked })}
              />
              <span>{t("settings.modelForm.vision")}</span>
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
              <span>{t("settings.modelForm.thinking")}</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.tools}
                onChange={(e) => setForm({ ...form, tools: e.target.checked })}
              />
              <span>{t("settings.modelForm.tools")}</span>
            </label>
          </div>

          {form.thinking && (
            <div className="mt-1.5 flex flex-col gap-1.5" data-testid="custom-model-thinking-levels">
              <div className={labelCls}>{t("settings.modelForm.thinkingLevels")}</div>
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
                {t("settings.modelForm.thinkingLevelsHint")}
              </p>
              <label className="inline-flex items-center gap-1.5 text-[12px] text-[var(--md-sys-color-on-surface)]">
                <input
                  type="checkbox"
                  checked={form.thinkingRequired}
                  data-testid="custom-model-thinking-required"
                  onChange={(e) => setForm({ ...form, thinkingRequired: e.target.checked })}
                />
                <span>{t("settings.modelForm.thinkingRequired")}</span>
              </label>
            </div>
          )}

          {/* API 兼容格式（三选一） */}
          <div className="mt-1">
            <div className={labelCls}>{t("settings.modelForm.apiProtocol")}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "openai", label: "OpenAI", hint: "OpenAI / DeepSeek / One-API" },
                { value: "anthropic", label: "Anthropic", hint: t("settings.modelForm.protocolAnthropicHint") },
                { value: "siliconflow", label: "SiliconFlow", hint: t("settings.modelForm.protocolSiliconflowHint") },
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
              {t("settings.modelForm.apiProtocolHint")}
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
                {t("settings.modelForm.advanced")}
              </summary>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div>
                  <label className={labelCls}>{t("settings.modelForm.reasoningField")}</label>
                  <input
                    type="text"
                    value={form.reasoningField}
                    onChange={(e) => setForm({ ...form, reasoningField: e.target.value })}
                    placeholder={t("settings.modelForm.reasoningFieldHint")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t("settings.modelForm.thinkingStyle")}</label>
                  <AppSelect label={t("settings.modelForm.thinkingStyleAria")} value={form.thinkingRequestStyle}
                    onValueChange={(thinkingRequestStyle) => setForm({ ...form, thinkingRequestStyle })}
                    options={[
                      { value: "siliconflow", label: "enable_thinking / thinking_budget" },
                      { value: "openai-reasoning-effort", label: "reasoning_effort" },
                      { value: "openrouter-reasoning", label: t("settings.modelForm.styleOpenrouter") },
                      { value: "deepseek-thinking", label: t("settings.modelForm.styleDeepseek") },
                      { value: "mimo-thinking", label: t("settings.modelForm.styleMimo") },
                      { value: "gemini-thinking-level", label: t("settings.modelForm.styleGemini") },
                      { value: "anthropic-thinking", label: t("settings.modelForm.styleAnthropic") },
                      { value: "none", label: t("settings.modelForm.styleNone") },
                    ] as const} />
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* 生图参数 */}
      {isImage && (
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] p-2">
          <div className={labelCls}>{t("settings.modelForm.sizes")}</div>
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
            <label className={labelCls}>{t("settings.modelForm.maxCount")}</label>
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
            <label className={labelCls}>{t("settings.modelForm.imageApiStyle")}</label>
            <AppSelect label={t("settings.modelForm.imageApiStyle")} value={form.imageApiStyle}
              onValueChange={(imageApiStyle) => setForm({ ...form, imageApiStyle })}
              options={[
                { value: "auto", label: t("settings.modelForm.imageStyleAuto") },
                { value: "openai", label: "OpenAI Images API" },
                { value: "siliconflow", label: t("settings.modelForm.imageStyleSiliconflow") },
              ] as const} />
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
          {t("settings.common.save")}
        </button>
        <button
          onClick={onCancel}
          className="press rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
