"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, ChevronRight } from "lucide-react";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";
import type { CardType } from "@/lib/review/types";

// 复习闪卡：正面=问题/挖空，背面=答案；点击翻面（rotateY 3D），卡内可自由滚动。
// 受控组件（flipped/onFlip 外部持有），复习板与记录预览窗共用。
// 翻面时避开「正在划词选区 / 点击链接」——保证复习板内可继续划词记录。

const FRONT_LABEL: Record<CardType, string> = {
  cloze: "填空 · 回忆被挖去的内容",
  qa: "题目 · 先思考再翻面",
};

interface FlipCardCard {
  cardType: CardType;
  front: string;
  back: string;
  explanation?: string;
}

interface FlipCardProps {
  card: FlipCardCard;
  flipped: boolean;
  onFlip: () => void;
  className?: string;
}

function CardFace({
  rotate,
  label,
  accent,
  children,
}: {
  rotate: number;
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: 18,
        border: "1px solid var(--line)",
        background: "var(--bg-panel)",
        boxShadow: "0 8px 30px -12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: `rotateY(${rotate}deg)`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: accent ? "var(--accent-ink)" : "var(--ink-soft)",
          background: accent ? "var(--accent-weak)" : "var(--bg-muted)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: accent ? "var(--accent)" : "var(--ink-faint)",
          }}
        />
        {label}
      </div>
      <div
        className="scroll-y"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px 20px" }}
      >
        {children}
      </div>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          padding: "7px 0",
          fontSize: 11.5,
          color: "var(--ink-faint)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <RotateCw size={12} /> 点击卡片翻面
      </div>
    </div>
  );
}

export default function FlipCard({ card, flipped, onFlip, className }: FlipCardProps) {
  // 解析/提示默认收起 —— 强化「先回忆答案，再点开看提示」。
  const [hintOpen, setHintOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    // 正在划词选区时不翻面（复习板内可继续划词记录）
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    // 点链接/按钮/标注 data-no-flip 不翻面
    if ((e.target as HTMLElement).closest("a, button, [data-no-flip]")) return;
    onFlip();
  }

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{ perspective: 1800, height: "100%", width: "100%" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          transformStyle: "preserve-3d",
          cursor: "pointer",
        }}
      >
        <CardFace rotate={0} accent label={FRONT_LABEL[card.cardType]}>
          <QuizMarkdown className="chat-prose">{card.front}</QuizMarkdown>
        </CardFace>
        <CardFace rotate={180} label="答案 · 解析">
          <QuizMarkdown className="chat-prose">{card.back}</QuizMarkdown>
          {card.explanation ? (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
              <button
                type="button"
                data-no-flip
                onClick={(e) => {
                  e.stopPropagation();
                  setHintOpen((o) => !o);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  border: "none",
                  background: "transparent",
                  color: "var(--accent)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <ChevronRight
                  size={13}
                  style={{ transition: "transform 0.2s", transform: hintOpen ? "rotate(90deg)" : "none" }}
                />
                提示 · 解析
              </button>
              {hintOpen && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
                  <QuizMarkdown inline className="chat-prose">
                    {card.explanation}
                  </QuizMarkdown>
                </div>
              )}
            </div>
          ) : null}
        </CardFace>
      </motion.div>
    </div>
  );
}
