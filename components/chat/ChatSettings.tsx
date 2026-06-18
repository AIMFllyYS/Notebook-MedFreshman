"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings, Eye, EyeOff, ChevronDown, Brain, Globe, Save } from "lucide-react";

const STORAGE_KEY = "gailvlun-chat-settings";

interface ChatSettingsData {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  customModel: string;
  contextMode: "full" | "semantic";
  defaultThinking: boolean;
  defaultSearch: boolean;
}

const DEFAULT_SETTINGS: ChatSettingsData = {
  apiEndpoint: "https://api.deepseek.com/v1/chat/completions",
  apiKey: "",
  model: "deepseek-chat",
  customModel: "",
  contextMode: "full",
  defaultThinking: false,
  defaultSearch: false,
};

function loadSettings(): ChatSettingsData {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(data: ChatSettingsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

const MODEL_OPTIONS = [
  { value: "deepseek-chat", label: "deepseek-chat" },
  { value: "deepseek-reasoner", label: "deepseek-reasoner" },
  { value: "custom", label: "自定义模型" },
];

export default function ChatSettings() {
  const [settings, setSettings] = useState<ChatSettingsData>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback(<K extends keyof ChatSettingsData>(key: K, value: ChatSettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-lowest)",
    color: "var(--md-sys-color-on-surface)",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface-variant)",
    marginBottom: "4px",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--md-sys-color-surface-container-low)",
      overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        background: "var(--md-sys-color-surface-container)",
      }}>
        <Settings size={14} style={{ color: "var(--md-sys-color-primary)" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--md-sys-color-on-surface)" }}>
          AI 设置
        </span>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* API Configuration */}
        <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-on-surface)", margin: 0 }}>
            API 配置
          </h3>

          <div>
            <label style={labelStyle}>API 端点</label>
            <input
              type="url"
              value={settings.apiEndpoint}
              onChange={(e) => update("apiEndpoint", e.target.value)}
              placeholder="https://api.deepseek.com/v1/chat/completions"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-outline-variant)"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>API 密钥</label>
            <div style={{ position: "relative" }}>
              <input
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => update("apiKey", e.target.value)}
                placeholder="sk-..."
                style={{ ...inputStyle, paddingRight: "36px" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-outline-variant)"; }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--md-sys-color-on-surface-variant)", padding: "2px",
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>模型</label>
            <div style={{ position: "relative" }}>
              <select
                value={settings.model}
                onChange={(e) => update("model", e.target.value)}
                style={{
                  ...inputStyle, appearance: "none", paddingRight: "28px", cursor: "pointer",
                }}
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{
                position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none", color: "var(--md-sys-color-on-surface-variant)",
              }} />
            </div>
          </div>

          {settings.model === "custom" && (
            <div>
              <label style={labelStyle}>自定义模型名称</label>
              <input
                type="text"
                value={settings.customModel}
                onChange={(e) => update("customModel", e.target.value)}
                placeholder="model-name"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--md-sys-color-outline-variant)"; }}
              />
            </div>
          )}
        </section>

        {/* Context Mode */}
        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-on-surface)", margin: 0 }}>
            上下文模式
          </h3>
          {(["full", "semantic"] as const).map((mode) => {
            const isDisabled = mode === "semantic";
            return (
              <label
                key={mode}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid",
                  borderColor: settings.contextMode === mode && !isDisabled
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-outline-variant)",
                  background: settings.contextMode === mode && !isDisabled
                    ? "var(--md-sys-color-primary-container)"
                    : "var(--md-sys-color-surface)",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.5 : 1,
                }}
                onClick={() => !isDisabled && update("contextMode", mode)}
              >
                <input
                  type="radio"
                  name="contextMode"
                  checked={settings.contextMode === mode}
                  onChange={() => !isDisabled && update("contextMode", mode)}
                  disabled={isDisabled}
                  style={{ accentColor: "var(--md-sys-color-primary)" }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--md-sys-color-on-surface)" }}>
                    {mode === "full" ? "全量上下文模式" : "语义检索模式"}
                    {isDisabled && (
                      <span style={{
                        marginLeft: "6px", fontSize: "10px", fontWeight: 600,
                        padding: "1px 6px", borderRadius: "4px",
                        background: "var(--md-sys-color-tertiary-container)",
                        color: "var(--md-sys-color-on-tertiary-container)",
                      }}>
                        即将推出
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", marginTop: "2px" }}>
                    {mode === "full" ? "发送完整上下文给模型" : "仅发送语义相关的上下文片段"}
                  </span>
                </div>
              </label>
            );
          })}
        </section>

        {/* Toggles */}
        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-on-surface)", margin: 0 }}>
            默认选项
          </h3>
          {[
            { key: "defaultThinking" as const, label: "深度思考", desc: "默认开启深度推理模式", icon: <Brain size={16} /> },
            { key: "defaultSearch" as const, label: "联网搜索", desc: "默认开启联网搜索功能", icon: <Globe size={16} /> },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: "10px",
                border: "1px solid var(--md-sys-color-outline-variant)",
                background: "var(--md-sys-color-surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--md-sys-color-primary)" }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--md-sys-color-on-surface)" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
              <button
                onClick={() => update(item.key, !settings[item.key])}
                style={{
                  width: "40px", height: "22px", borderRadius: "11px",
                  border: "none", cursor: "pointer", position: "relative",
                  background: settings[item.key]
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-surface-container-highest)",
                  transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "var(--md-sys-color-on-primary)",
                  position: "absolute", top: "3px",
                  left: settings[item.key] ? "21px" : "3px",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>
          ))}
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 16px", borderRadius: "10px",
            border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: saved ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)",
            color: saved ? "var(--md-sys-color-on-tertiary)" : "var(--md-sys-color-on-primary)",
            transition: "background 0.2s",
          }}
        >
          <Save size={14} />
          {saved ? "已保存" : "保存设置"}
        </button>
      </div>
    </div>
  );
}
