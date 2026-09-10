"use client";

import { useState } from "react";
import { BookmarkPlus, Brain, ChevronDown, ChevronRight, Globe, Star } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { MODELS, isPickerHiddenModel, getAllModels } from "@/lib/ai/models";
import { Toggle, h3Cls, inputCls, labelCls } from "./_shared";

export function BuiltinModelsSection() {
  const defaultImageModelId = useSettings((s) => s.defaultImageModelId);
  const setDefaultImageModel = useSettings((s) => s.setDefaultImageModel);
  const [builtinExpanded, setBuiltinExpanded] = useState(false);

  const builtinImageModels = MODELS.filter((m) => m.type === "image");
  const builtinTextModels = MODELS.filter((m) => m.type !== "image" && !isPickerHiddenModel(m.id));
  const builtinVisibleCount = builtinTextModels.length + builtinImageModels.length;

  return (
      <section className="flex flex-col gap-2">
        <button
          onClick={() => setBuiltinExpanded((v) => !v)}
          className="flex items-center gap-1.5 self-start"
        >
          {builtinExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <h3 className={h3Cls}>内置模型（站点默认）</h3>
          <span className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
            · {builtinVisibleCount} 个
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
  );
}

export function RecordAssistantSection() {
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const recordModelId = useSettings((s) => s.recordModelId);
  const setRecordModelId = useSettings((s) => s.setRecordModelId);
  const floatingChatModelId = useSettings((s) => s.floatingChatModelId);
  const setFloatingChatModelId = useSettings((s) => s.setFloatingChatModelId);
  const allTextModels = getAllModels(customApiGroups).filter((m) => m.type !== "image");

  return (
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <BookmarkPlus size={14} className="text-[var(--md-sys-color-primary)]" />
          <h3 className={h3Cls}>摘录与划词助手</h3>
        </div>
        <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
          摘录（划词「记录」成卡）和划词助手（划词「解释/追问」浮窗）默认使用的模型。
          独立于右侧主对话模型，避免因主对话切换自定义 API 而导致摘录报错。支持自定义 API 分组中的模型。
        </p>
        <div>
          <label className={labelCls}>摘录模型（划词「记录」成卡）</label>
          <select
            value={recordModelId}
            onChange={(e) => setRecordModelId(e.target.value)}
            className={inputCls}
          >
            {allTextModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.group}
              </option>
            ))}
          </select>
          <div className="mt-1 text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
            默认内置 DeepSeek V4 Flash（性价比高、成卡稳定）。选择自定义模型时需确保对应 API 分组已配置密钥。
          </div>
        </div>
        <div>
          <label className={labelCls}>划词助手模型（「解释/追问」浮窗）</label>
          <select
            value={floatingChatModelId}
            onChange={(e) => setFloatingChatModelId(e.target.value)}
            className={inputCls}
          >
            {allTextModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.group}
              </option>
            ))}
          </select>
          <div className="mt-1 text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
            划词后弹出的浮窗对话使用的默认模型。可在浮窗内随时切换。
          </div>
        </div>
      </section>
  );
}

export function DefaultsSection() {
  const defaultThinking = useSettings((s) => s.defaultThinking);
  const setDefaultThinking = useSettings((s) => s.setDefaultThinking);
  const defaultThinkingEffort = useSettings((s) => s.defaultThinkingEffort);
  const setDefaultThinkingEffort = useSettings((s) => s.setDefaultThinkingEffort);
  const defaultSearch = useSettings((s) => s.defaultSearch);
  const setDefaultSearch = useSettings((s) => s.setDefaultSearch);

  return (
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
  );
}
