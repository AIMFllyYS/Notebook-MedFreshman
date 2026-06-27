"use client";

import { useState } from "react";
import { Settings, X, Eye, EyeOff, Type, Brain, Globe, BookText, Download } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { CUSTOM_MODEL_ID } from "@/lib/ai/models";
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
  const selectedModelId = useSettings((s) => s.selectedModelId);
  const setSelectedModelId = useSettings((s) => s.setSelectedModelId);
  const customBaseUrl = useSettings((s) => s.customBaseUrl);
  const customApiKey = useSettings((s) => s.customApiKey);
  const customModelId = useSettings((s) => s.customModelId);
  const setCustomProvider = useSettings((s) => s.setCustomProvider);
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
            填好后在模型菜单选「自定义模型」即可使用，不影响默认。
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
          <div>
            <label className={label}>自定义模型 ID</label>
            <input
              type="text"
              value={customModelId}
              onChange={(e) => setCustomProvider({ model: e.target.value })}
              placeholder="例如 gpt-4o-mini / your-model-id"
              className={input}
            />
          </div>
          <button
            onClick={() => setSelectedModelId(CUSTOM_MODEL_ID)}
            disabled={!(customBaseUrl && customApiKey && customModelId)}
            className="press self-start rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
          >
            {selectedModelId === CUSTOM_MODEL_ID ? "已选用自定义模型" : "选用自定义模型"}
          </button>
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
