"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Brain } from "lucide-react";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

/**
 * 知识点记忆卡（Markdown 指令式）。
 *
 * 用法：
 *   :::memory{label=毛泽东思想活的灵魂}
 *   - [ ] 实事求是
 *   - [ ] 群众路线
 *   - [ ] 独立自主
 *   :::
 *
 *   :::memory{label=新民主主义革命总路线 mode=cloze}
 *   无产阶级领导的、人民大众的、反对**帝国主义、封建主义和官僚资本主义**的革命。
 *   :::
 *
 * 行为：
 *   - 默认折叠：正面只显示标题，点击展开全部内容。
 *   - 清单项 `- [ ]` 会被渲染为可逐项点击的背诵条目，点击后显示该项并打勾。
 *   - mode=cloze 时，内容中的 `**...**` 会被遮蔽为可点击挖空。
 */
export function MemoryCard({ node, children }: NodeProps) {
  const label = String(node?.properties?.label ?? "");
  const mode = String(node?.properties?.mode ?? "").toLowerCase();
  const isCloze = mode === "cloze";

  const [open, setOpen] = useState(false);

  // children 是经过 react-markdown 处理后的 React 节点；为了支持 cloze 与 checklist 交互，
  // 我们把它当作字符串重新由 QuizMarkdown 渲染。这样可以在渲染阶段做挖空/清单处理。
  const rawText = useMemo(() => {
    if (!children) return "";
    // 从 React 节点中尽量提取文本；若已是字符串则直接返回。
    const extract = (child: React.ReactNode): string => {
      if (child === null || child === undefined) return "";
      if (typeof child === "string") return child;
      if (typeof child === "number" || typeof child === "boolean") return String(child);
      if (Array.isArray(child)) return child.map(extract).join("");
      if (React.isValidElement(child)) {
        // 对于 p/ul/li/div 等容器，提取内部文本
        const element = child as React.ReactElement<{ children?: React.ReactNode }>;
        return extract(element.props.children);
      }
      return "";
    };
    return extract(children).trim();
  }, [children]);

  return (
    <div className="callout callout-memory">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="memory-card-header"
        aria-expanded={open}
      >
        <Brain size={16} className="memory-card-icon" />
        <span className="memory-card-label">{label || "记忆卡"}</span>
        <span className="memory-card-hint">{open ? "点击收起" : "点击展开"}</span>
        <ChevronRight
          size={16}
          className="memory-card-chevron"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="memory-card-body"
          >
            <div className="memory-card-content">
              {isCloze ? (
                <ClozeText text={rawText} />
              ) : (
                <ChecklistMarkdown text={rawText} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 挖空模式：把 `**...**`、`<u>...</u>`、下划线 `_..._` 中的内容遮蔽，点击后显示。
 */
function ClozeText({ text }: { text: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // 分段：保留普通文本与挖空片段
  const segments = useMemo(() => {
    const pattern = /(\*\*[\s\S]+?\*\*|<u>[\s\S]+?<\/u>|_[^_\n]+?_)/g;
    const parts: { type: "text" | "cloze"; value: string; index: number }[] = [];
    let lastIndex = 0;
    let matchIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ type: "text", value: text.slice(lastIndex, m.index), index: -1 });
      }
      const raw = m[1];
      let inner = raw;
      if (raw.startsWith("**") && raw.endsWith("**")) {
        inner = raw.slice(2, -2);
      } else if (raw.startsWith("<u>") && raw.endsWith("</u>")) {
        inner = raw.slice(3, -4);
      } else if (raw.startsWith("_") && raw.endsWith("_")) {
        inner = raw.slice(1, -1);
      }
      parts.push({ type: "cloze", value: inner, index: matchIndex++ });
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", value: text.slice(lastIndex), index: -1 });
    }
    return parts;
  }, [text]);

  if (!text) return null;

  return (
    <div className="memory-cloze">
      {segments.map((seg, idx) =>
        seg.type === "text" ? (
          <QuizMarkdown key={idx} inline className="chat-prose">
            {seg.value}
          </QuizMarkdown>
        ) : (
          <button
            key={idx}
            type="button"
            onClick={() =>
              setRevealed((prev) => {
                const next = new Set(prev);
                next.add(seg.index);
                return next;
              })
            }
            className={`memory-cloze-blank ${revealed.has(seg.index) ? "revealed" : ""}`}
          >
            {revealed.has(seg.index) ? (
              <QuizMarkdown inline className="chat-prose">
                {seg.value}
              </QuizMarkdown>
            ) : (
              <span className="memory-cloze-placeholder">?</span>
            )}
          </button>
        ),
      )}
    </div>
  );
}

/**
 * 清单模式：把 `- [ ] ...` 渲染为可逐项点击的背诵条目。
 * 非清单内容正常渲染。
 */
function ChecklistMarkdown({ text }: { text: string }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  // 先按行拆分，识别清单项与普通段落
  const lines = text.split("\n");
  const items: { type: "check" | "text"; value: string; index: number }[] = [];
  let checkIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*]\s*\[\s*\]\s+/.test(trimmed)) {
      items.push({
        type: "check",
        value: trimmed.replace(/^[-*]\s*\[\s*\]\s+/, ""),
        index: checkIndex++,
      });
    } else if (trimmed) {
      items.push({ type: "text", value: line, index: -1 });
    }
  }

  if (items.length === 0) {
    // 没有清单项时，直接渲染原文
    return <QuizMarkdown className="chat-prose">{text}</QuizMarkdown>;
  }

  return (
    <div className="memory-checklist">
      {items.map((item, idx) =>
        item.type === "text" ? (
          <QuizMarkdown key={idx} className="chat-prose">
            {item.value}
          </QuizMarkdown>
        ) : (
          <button
            key={idx}
            type="button"
            onClick={() =>
              setChecked((prev) => {
                const next = new Set(prev);
                next.add(item.index);
                return next;
              })
            }
            className={`memory-checklist-item ${checked.has(item.index) ? "revealed" : ""}`}
          >
            <span className="memory-checklist-box">
              {checked.has(item.index) ? "✓" : ""}
            </span>
            <span className="memory-checklist-text">
              {checked.has(item.index) ? (
                <QuizMarkdown inline className="chat-prose">
                  {item.value}
                </QuizMarkdown>
              ) : (
                <span className="memory-checklist-placeholder">点击显示要点</span>
              )}
            </span>
          </button>
        ),
      )}
    </div>
  );
}
