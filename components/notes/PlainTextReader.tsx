"use client";

// 受控纯文本阅读器：用于课堂逐字稿（renderType="text"）。
// 关键安全 / 语义约束：
//  - 绝不经过 Markdown / HTML 管线，所有内容都以 React 文本节点渲染（天然转义）；
//  - 用 white-space: pre-wrap 保留原始换行与缩进；
//  - 仅对「@说话人 N HH:MM」标记行做展示性加粗（不解析、不改写正文）。
import { useMemo } from "react";

const SPEAKER_LINE_RE = /^@说话人\s*\S+\s+\d{1,2}:\d{2}(?::\d{2})?$/;

export default function PlainTextReader({ content }: { content: string }) {
  const lines = useMemo(() => content.replace(/\r\n/g, "\n").split("\n"), [content]);
  return (
    <div
      className="plain-text-notes text-[15px] leading-[2] text-[var(--ink)]"
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
      {lines.map((line, i) =>
        SPEAKER_LINE_RE.test(line.trim()) ? (
          <div
            key={i}
            className="mt-4 mb-1 inline-block rounded-md bg-[var(--accent-weak)] px-2 py-0.5 text-[12px] font-semibold tracking-wide text-[var(--accent-ink)]"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {line}
          </div>
        ) : (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            {line || "\u00a0"}
          </div>
        ),
      )}
    </div>
  );
}
