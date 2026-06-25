"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";

interface Props {
  label: React.ReactNode;
  defaultOpen?: boolean;
  /** 标题行右侧附加信息（如字数）。 */
  meta?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 统一的「展开/收起」小节：chevron 标题行 + AnimatedCollapse 高度动画。
 * 复用于记录预览窗的原文区等长内容，省掉固定高度滚动框的空间浪费。
 * 触发按钮标 data-no-flip / data-no-drag，嵌在翻卡或浮窗里点它不会误触翻面/拖拽。
 */
export default function CollapsibleSection({ label, defaultOpen = false, meta, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <button
        type="button"
        data-no-flip
        data-no-drag
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 2px",
          border: "none",
          background: "transparent",
          color: "var(--ink-soft)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <ChevronRight
          size={13}
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "none",
          }}
        />
        <span>{label}</span>
        {meta != null && (
          <span style={{ marginLeft: "auto", fontWeight: 400, color: "var(--ink-faint)", fontSize: 11.5 }}>
            {meta}
          </span>
        )}
      </button>
      <AnimatedCollapse isOpen={open}>{children}</AnimatedCollapse>
    </div>
  );
}
