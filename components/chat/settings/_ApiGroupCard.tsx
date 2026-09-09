"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { type CustomApiGroup, type CustomModelConfig, buildCustomModelRegistryId } from "@/lib/ai/models";
import { EMPTY_FORM, inputCls, labelCls, modelToForm, ModelRow } from "./_shared";
import { ModelForm } from "./ModelForm";

/** 单个自定义 API 分组卡片（可折叠）。 */
export function ApiGroupCard({
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
          data-testid={`custom-api-group-toggle-${group.id}`}
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
              data-testid="custom-api-add-model"
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
