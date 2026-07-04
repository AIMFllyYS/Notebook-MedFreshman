"use client";

import React, { useMemo } from "react";

interface TimelineProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(element.props.children);
  }
  return "";
}

function parseTimelineItems(text: string): TimelineItem[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: TimelineItem[] = [];
  for (const line of lines) {
    // Match: - **year** title — desc
    // Or: - **year** title
    const match = line.match(/^[-*]\s*\*\*(.+?)\*\*\s*(.*)$/);
    if (match) {
      const year = match[1].trim();
      const rest = match[2].trim();
      const [title, desc] = rest.split(/[—–-]/, 2).map((s) => s.trim());
      items.push({ year, title: title || rest, desc: desc || "" });
    } else {
      // Fallback: plain line becomes desc with no year
      items.push({ year: "", title: "", desc: line.replace(/^[-*]\s*/, "") });
    }
  }
  return items;
}

export function Timeline({ node, children }: TimelineProps) {
  const period = String(node?.properties?.period ?? "");
  const rawText = useMemo(() => extractText(children).trim(), [children]);
  const items = useMemo(() => parseTimelineItems(rawText), [rawText]);

  return (
    <div className="timeline history-directive">
      <div className="timeline-header">
        {period ? `时间轴 · ${period}` : "时间轴"}
      </div>
      <ul className="timeline-list">
        {items.map((item, idx) => (
          <li key={idx} className="timeline-item">
            {item.year && <div className="timeline-year">{item.year}</div>}
            {item.title && <div className="timeline-title">{item.title}</div>}
            {item.desc && <div className="timeline-desc">{item.desc}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
