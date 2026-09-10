"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { h3Cls, inputCls, labelCls } from "./_shared";
import { ApiGroupCard } from "./_ApiGroupCard";

export function ApiGroupsSection() {
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const addApiGroup = useSettings((s) => s.addApiGroup);
  const updateApiGroup = useSettings((s) => s.updateApiGroup);
  const removeApiGroup = useSettings((s) => s.removeApiGroup);
  const addModelToGroup = useSettings((s) => s.addModelToGroup);
  const updateModelInGroup = useSettings((s) => s.updateModelInGroup);
  const removeModelFromGroup = useSettings((s) => s.removeModelFromGroup);
  const defaultImageModelId = useSettings((s) => s.defaultImageModelId);
  const setDefaultImageModel = useSettings((s) => s.setDefaultImageModel);
  const [customExpanded, setCustomExpanded] = useState(true);
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

  return (
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
  );
}
