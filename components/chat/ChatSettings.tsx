"use client";

import { useState } from "react";
import { Settings, X, Eye, EyeOff, Type, Brain, Globe, BookText, Download, Plus, Trash2, Pencil } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { type CustomModelConfig } from "@/lib/ai/models";
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
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors"
      style={{ background: on ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container-highest)" }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full transition-[left]"
        style={{ left: on ? 21 : 3, background: "var(--md-sys-color-on-primary)", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}
      />
    </button>
  );
}

/** AI 对话设置面板（作为对话区的浮层；数据落 useSettings）。 */
export default function ChatSettings({ onClose }: { onClose?: () => void }) {
  const customBaseUrl = useSettings((s) => s.customBaseUrl);
  const customApiKey = useSettings((s) => s.customApiKey);
  const customModels = useSettings((s) => s.customModels);
  const setCustomProvider = useSettings((s) => s.setCustomProvider);
  const addCustomModel = useSettings((s) => s.addCustomModel);
  const updateCustomModel = useSettings((s) => s.updateCustomModel);
  const removeCustomModel = useSettings((s) => s.removeCustomModel);
  const fontScale = useSettings((s) => s.fontScale);
  const setFontScale = useSettings((s) => s.setFontScale);
  const disabledTools = useSettings((s) => s.disabledTools);
  const toggleTool = useSettings((s) => s.toggleTool);
  const defaultThinking = useSettings((s) => s.defaultThinking);
  const setDefaultThinking = useSettings((s) => s.setDefaultThinking);
  const defaultSearch = useSettings((s) => s.defaultSearch);
  const setDefaultSearch = useSettings((s) => s.setDefaultSearch);
  const globalContext = useSettings((s) => s.globalContext);
  const setGlobalContext = useSettings((s) => s.setGlobalContext);

  const [showKey, setShowKey] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [formModel, setFormModel] = useState({
    id: '', label: '', contextK: '128',
    inputPrice: '', cachedInputPrice: '', cacheWritePrice: '', outputPrice: '',
    cacheTtlSec: '3600',
  });

  const resetForm = () => {
    setFormModel({ id: '', label: '', contextK: '128', inputPrice: '', cachedInputPrice: '', cacheWritePrice: '', outputPrice: '', cacheTtlSec: '3600' });
    setEditingModelId(null);
  };
  const startAdd = () => { resetForm(); setShowModelForm(true); };
  const startEdit = (m: CustomModelConfig) => {
    setFormModel({
      id: m.id, label: m.label ?? '', contextK: String(m.contextK ?? 128),
      inputPrice: m.pricing ? String(m.pricing.input) : '',
      cachedInputPrice: m.pricing?.cachedInput != null ? String(m.pricing.cachedInput) : '',
      cacheWritePrice: m.pricing?.cacheWrite != null ? String(m.pricing.cacheWrite) : '',
      outputPrice: m.pricing ? String(m.pricing.output) : '',
      cacheTtlSec: String(m.cacheTtlSec ?? 3600),
    });
    setEditingModelId(m.id);
    setShowModelForm(true);
  };
  const saveModel = () => {
    if (!formModel.id.trim() || !formModel.inputPrice.trim() || !formModel.outputPrice.trim()) return;
    const config: CustomModelConfig = {
      id: formModel.id.trim(),
      label: formModel.label.trim() || undefined,
      contextK: Number(formModel.contextK) || 128,
      pricing: {
        input: Number(formModel.inputPrice) || 0,
        cachedInput: formModel.cachedInputPrice.trim() ? Number(formModel.cachedInputPrice) : undefined,
        cacheWrite: formModel.cacheWritePrice.trim() ? Number(formModel.cacheWritePrice) : undefined,
        output: Number(formModel.outputPrice) || 0,
      },
      cacheTtlSec: Number(formModel.cacheTtlSec) || 3600,
    };
    if (editingModelId) updateCustomModel(editingModelId, config);
    else addCustomModel(config);
    setShowModelForm(false);
    resetForm();
  };

  const label = "block text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1";
  const input =
    "w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2.5 py-2 text-[13px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]";
  const h3 = "text-[13px] font-bold text-[var(--md-sys-color-on-surface)] m-0";

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--md-sys-color-surface-container-low)]">
      {/* 头部 */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Settings size={15} className="text-[var(--md-sys-color-primary)]" />
          <span className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">AI 设置</span>
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
          <h3 className={h3}>外观</h3>
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

        {/* 自定义 API */}
        <section className="flex flex-col gap-2.5">
          <h3 className={h3}>自定义 API（与站点默认并存）</h3>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            站点默认 AI 由部署方在 .env 配置。你也可在此填入自己的 OpenAI 兼容端点，
            添加多个模型并配置各自定价，全部出现在模型菜单中。
          </p>
          <div>
            <label className={label}>API 端点（base URL，含 /v1）</label>
            <input
              type="url"
              value={customBaseUrl}
              onChange={(e) => setCustomProvider({ baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className={input}
            />
          </div>
          <div>
            <label className={label}>API 密钥</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={customApiKey}
                onChange={(e) => setCustomProvider({ apiKey: e.target.value })}
                placeholder="sk-..."
                className={input + " pr-9"}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* 模型列表 */}
          <div>
            <label className={label}>已添加模型（{customModels.length}）</label>
            {customModels.length === 0 ? (
              <p className="text-[11.5px] text-[var(--md-sys-color-on-surface-variant)] py-2">
                暂无自定义模型，点击下方按钮添加
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {customModels.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
                        {m.label || m.id}
                      </div>
                      <div className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
                        {m.id} · {m.contextK ?? 128}K
                        {m.pricing && ` · ¥${m.pricing.input}/${m.pricing.output}`}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(m)}
                      className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removeCustomModel(m.id)}
                      className="rounded p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 添加/编辑模型表单 */}
          {showModelForm ? (
            <div className="flex flex-col gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3">
              <span className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
                {editingModelId ? '编辑模型' : '添加模型'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={label}>模型 ID（必填）</label>
                  <input
                    type="text"
                    value={formModel.id}
                    onChange={(e) => setFormModel({ ...formModel, id: e.target.value })}
                    placeholder="gpt-4o-mini"
                    className={input}
                    disabled={!!editingModelId}
                  />
                </div>
                <div>
                  <label className={label}>显示名（可选）</label>
                  <input
                    type="text"
                    value={formModel.label}
                    onChange={(e) => setFormModel({ ...formModel, label: e.target.value })}
                    placeholder="GPT-4o mini"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>上下文窗口 K（默认 128）</label>
                  <input
                    type="number"
                    value={formModel.contextK}
                    onChange={(e) => setFormModel({ ...formModel, contextK: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>缓存 TTL 秒（默认 3600）</label>
                  <input
                    type="number"
                    value={formModel.cacheTtlSec}
                    onChange={(e) => setFormModel({ ...formModel, cacheTtlSec: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>输入价格 ¥/百万（必填）</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formModel.inputPrice}
                    onChange={(e) => setFormModel({ ...formModel, inputPrice: e.target.value })}
                    placeholder="0"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>输出价格 ¥/百万（必填）</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formModel.outputPrice}
                    onChange={(e) => setFormModel({ ...formModel, outputPrice: e.target.value })}
                    placeholder="0"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>缓存命中价格（可选）</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formModel.cachedInputPrice}
                    onChange={(e) => setFormModel({ ...formModel, cachedInputPrice: e.target.value })}
                    placeholder="不填=无缓存"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>缓存写入价格（可选）</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formModel.cacheWritePrice}
                    onChange={(e) => setFormModel({ ...formModel, cacheWritePrice: e.target.value })}
                    placeholder="不填=按缓存命中"
                    className={input}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveModel}
                  disabled={!formModel.id.trim() || !formModel.inputPrice.trim() || !formModel.outputPrice.trim()}
                  className="press rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
                >
                  保存
                </button>
                <button
                  onClick={() => { setShowModelForm(false); resetForm(); }}
                  className="press rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startAdd}
              className="press flex items-center gap-1.5 self-start rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
            >
              <Plus size={13} /> 添加模型
            </button>
          )}
        </section>

        {/* 工具 */}
        <section className="flex flex-col gap-2">
          <h3 className={h3}>工具调用</h3>
          {TOOLS.map((t) => {
            const enabled = !disabledTools.includes(t.name);
            return (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">{t.label}</div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{t.desc}</div>
                </div>
                <Toggle on={enabled} onClick={() => toggleTool(t.name, !enabled)} />
              </div>
            );
          })}
        </section>

        {/* 默认选项 */}
        <section className="flex flex-col gap-2">
          <h3 className={h3}>新对话默认</h3>
          {[
            { on: defaultThinking, set: setDefaultThinking, label: "深度思考", desc: "新对话默认开启深度推理", icon: <Brain size={16} /> },
            { on: defaultSearch, set: setDefaultSearch, label: "联网搜索", desc: "新对话默认开启联网搜索", icon: <Globe size={16} /> },
          ].map((it) => (
            <div
              key={it.label}
              className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[var(--md-sys-color-primary)]">{it.icon}</span>
                <div>
                  <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">{it.label}</div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{it.desc}</div>
                </div>
              </div>
              <Toggle on={it.on} onClick={() => it.set(!it.on)} />
            </div>
          ))}
        </section>

        {/* 全局补充上下文 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3}>全局补充上下文</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            这里的文字会注入每次对话的系统提示词（拼入稳定前缀，利于缓存）。适合放通用背景、称呼、风格偏好等。
          </p>
          <textarea
            value={globalContext}
            onChange={(e) => setGlobalContext(e.target.value)}
            placeholder="例如：请用简洁的中文回答，公式用 KaTeX，回答末尾附一句要点总结。"
            rows={4}
            className={input + " resize-y leading-relaxed"}
          />
          <div className="self-end text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
            {globalContext.length} 字
          </div>
        </section>

        {/* 技能库 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <PencilSparklesIcon size={14} className="text-[var(--md-sys-color-primary)]" />
            <h3 className={h3}>技能库（Skills）</h3>
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
            <h3 className={h3}>数据</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            把全部聊天记录（主对话 + 划词）导出为本地 JSON 文件备份。仅保存到你选择的位置，绝不上传任何服务器。
          </p>
          <button
            onClick={() => {
              const r = exportAllChats();
              setExportMsg(r.ok ? `已导出 ${r.count} 个会话` : "暂无可导出的聊天数据");
            }}
            className="press flex items-center gap-1.5 self-start rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)]"
          >
            <Download size={13} /> 导出所有聊天数据
          </button>
          {exportMsg && (
            <span className="text-[11px] font-medium text-[var(--md-sys-color-primary)]">{exportMsg}</span>
          )}
        </section>
      </div>
    </div>
  );
}
