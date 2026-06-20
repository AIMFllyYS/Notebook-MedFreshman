"use client";

import React, { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import type { QuizQuestion as Q, UserAnswer } from "@/lib/quiz/types";
import type { QuestionResult } from "@/lib/quiz-store";
import QuizMarkdown from "./QuizMarkdown";

const TYPE_LABELS: Record<Q["type"], string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  true_false: "判断题",
  fill_blank: "填空题",
  essay: "材料分析 / 解答题",
};

const DIFFICULTY_LABELS: Record<Q["difficulty"], string> = {
  basic: "基础",
  medium: "中等",
  hard: "提高",
};

const SUCCESS = "var(--color-success)";
const ERROR = "var(--md-sys-color-error)";
const PRIMARY = "var(--md-sys-color-primary)";
const LETTERS = "ABCDEFGHIJ";

interface QuizQuestionProps {
  question: Q;
  index: number;
  total: number;
  mode: "answer" | "review";
  answer: UserAnswer;
  onChange?: (a: UserAnswer) => void;
  result?: QuestionResult;
}

/** 题型 / 难度 / 来源 标签条。 */
function MetaBar({ q, index, total }: { q: Q; index: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-primary)" }}>
        第 {index + 1} / {total} 题
      </span>
      <Chip>{TYPE_LABELS[q.type]}</Chip>
      <Chip>{DIFFICULTY_LABELS[q.difficulty]}</Chip>
      {q.source === "review" && (
        <Chip tone="review">复习 · {q.sourceChapter ?? "前序章节"}</Chip>
      )}
      <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)" }}>
        {q.points} 分
      </span>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "review" }) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "var(--md-sys-shape-corner-full)",
        background:
          tone === "review"
            ? "var(--md-sys-color-tertiary-container)"
            : "var(--md-sys-color-surface-container-high)",
        color:
          tone === "review"
            ? "var(--md-sys-color-on-tertiary-container)"
            : "var(--md-sys-color-on-surface-variant)",
      }}
    >
      {children}
    </span>
  );
}

/** 选项按钮（单选/多选共用）。 */
function OptionRow({
  letter,
  text,
  selected,
  mode,
  state,
  onClick,
}: {
  letter: string;
  text: string;
  selected: boolean;
  mode: "answer" | "review";
  state: "neutral" | "correct" | "wrong";
  onClick?: () => void;
}) {
  let borderColor = "var(--md-sys-color-outline-variant)";
  let bg = "var(--md-sys-color-surface-container-lowest)";
  let markColor = "var(--md-sys-color-on-surface-variant)";

  if (mode === "answer" && selected) {
    borderColor = PRIMARY;
    bg = "var(--md-sys-color-primary-container)";
    markColor = "var(--md-sys-color-on-primary-container)";
  } else if (mode === "review" && state === "correct") {
    borderColor = SUCCESS;
    bg = "color-mix(in srgb, var(--color-success) 14%, transparent)";
    markColor = SUCCESS;
  } else if (mode === "review" && state === "wrong") {
    borderColor = ERROR;
    bg = "color-mix(in srgb, var(--md-sys-color-error) 14%, transparent)";
    markColor = ERROR;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={mode === "review"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        width: "100%",
        textAlign: "left",
        padding: "11px 13px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        border: `1.5px solid ${borderColor}`,
        background: bg,
        color: "var(--md-sys-color-on-surface)",
        cursor: mode === "answer" ? "pointer" : "default",
        transition: "border-color 200ms, background 200ms",
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          width: "22px",
          height: "22px",
          borderRadius: "var(--md-sys-shape-corner-full)",
          border: `1.5px solid ${markColor}`,
          color: markColor,
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {mode === "review" && state === "correct" ? (
          <Check size={13} />
        ) : mode === "review" && state === "wrong" ? (
          <X size={13} />
        ) : (
          letter
        )}
      </span>
      <span style={{ flex: 1, fontSize: "14px", lineHeight: 1.6, paddingTop: "1px" }}>
        <QuizMarkdown inline>{text}</QuizMarkdown>
      </span>
    </button>
  );
}

/** 参考答案 / 解析块（review 模式或 essay 折叠用）。 */
function AnswerReveal({
  q,
  defaultOpen,
}: {
  q: Q;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ marginTop: "14px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--md-sys-color-primary)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ChevronDown
          size={15}
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 200ms" }}
        />
        参考答案与评分要点
      </button>
      {open && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px 14px",
            borderRadius: "var(--md-sys-shape-corner-medium)",
            background: "var(--md-sys-color-surface-container)",
            border: "1px solid var(--md-sys-color-outline-variant)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", marginBottom: "6px" }}>
            参考答案
          </div>
          <div style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--md-sys-color-on-surface)" }}>
            <QuizMarkdown>{String(q.answer ?? "")}</QuizMarkdown>
          </div>
          {q.scoring_criteria && q.scoring_criteria.length > 0 && (
            <>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", margin: "12px 0 6px" }}>
                评分要点
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {q.scoring_criteria.map((c, i) => (
                  <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--md-sys-color-on-surface)" }}>
                    <QuizMarkdown inline>{c}</QuizMarkdown>
                  </li>
                ))}
              </ul>
            </>
          )}
          {q.explanation && (
            <>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", margin: "12px 0 6px" }}>
                解析
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--md-sys-color-on-surface-variant)" }}>
                <QuizMarkdown>{q.explanation}</QuizMarkdown>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizQuestion({
  question: q,
  index,
  total,
  mode,
  answer,
  onChange,
  result,
}: QuizQuestionProps) {
  const reviewing = mode === "review";

  // ── 选项类（单选 / 多选）─────────────────────
  const renderChoices = (multiple: boolean) => {
    const correctSet = new Set<number>(
      multiple ? ((q.answer as number[]) ?? []) : [q.answer as number],
    );
    const pickedArr: number[] = multiple
      ? Array.isArray(answer)
        ? (answer as number[])
        : []
      : typeof answer === "number"
        ? [answer as number]
        : [];
    const pickedSet = new Set(pickedArr);

    const toggle = (i: number) => {
      if (reviewing || !onChange) return;
      if (multiple) {
        const next = new Set(pickedSet);
        next.has(i) ? next.delete(i) : next.add(i);
        onChange([...next].sort((a, b) => a - b));
      } else {
        onChange(i);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {(q.options ?? []).map((opt, i) => {
          let state: "neutral" | "correct" | "wrong" = "neutral";
          if (reviewing) {
            if (correctSet.has(i)) state = "correct";
            else if (pickedSet.has(i)) state = "wrong";
          }
          return (
            <OptionRow
              key={i}
              letter={LETTERS[i] ?? String(i + 1)}
              text={opt}
              selected={pickedSet.has(i)}
              mode={mode}
              state={state}
              onClick={() => toggle(i)}
            />
          );
        })}
      </div>
    );
  };

  // ── 判断题 ──────────────────────────────────
  const renderTrueFalse = () => {
    const picked = typeof answer === "number" ? answer : null;
    const correct = q.answer as number;
    const opts = [
      { val: 1, label: "正确 √" },
      { val: 0, label: "错误 ×" },
    ];
    return (
      <div style={{ display: "flex", gap: "10px" }}>
        {opts.map(({ val, label }) => {
          let state: "neutral" | "correct" | "wrong" = "neutral";
          if (reviewing) {
            if (val === correct) state = "correct";
            else if (picked === val) state = "wrong";
          }
          const selected = picked === val;
          let borderColor = "var(--md-sys-color-outline-variant)";
          let bg = "var(--md-sys-color-surface-container-lowest)";
          let color = "var(--md-sys-color-on-surface)";
          if (mode === "answer" && selected) {
            borderColor = PRIMARY;
            bg = "var(--md-sys-color-primary-container)";
            color = "var(--md-sys-color-on-primary-container)";
          } else if (state === "correct") {
            borderColor = SUCCESS;
            bg = "color-mix(in srgb, var(--color-success) 14%, transparent)";
            color = SUCCESS;
          } else if (state === "wrong") {
            borderColor = ERROR;
            bg = "color-mix(in srgb, var(--md-sys-color-error) 14%, transparent)";
            color = ERROR;
          }
          return (
            <button
              key={val}
              type="button"
              disabled={reviewing}
              onClick={() => !reviewing && onChange?.(val)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "var(--md-sys-shape-corner-medium)",
                border: `1.5px solid ${borderColor}`,
                background: bg,
                color,
                fontSize: "15px",
                fontWeight: 600,
                cursor: reviewing ? "default" : "pointer",
                transition: "border-color 200ms, background 200ms",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  // ── 填空题 ──────────────────────────────────
  const renderFillBlank = () => (
    <input
      type="text"
      value={typeof answer === "string" ? answer : ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={reviewing}
      placeholder="在此输入你的答案…"
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        border: "1.5px solid var(--md-sys-color-outline-variant)",
        background: "var(--md-sys-color-surface-container-lowest)",
        color: "var(--md-sys-color-on-surface)",
        fontSize: "15px",
        outline: "none",
      }}
    />
  );

  // ── 解答 / 材料分析大题 ──────────────────────
  const renderEssay = () => (
    <textarea
      value={typeof answer === "string" ? answer : ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={reviewing}
      rows={reviewing ? 4 : 7}
      placeholder="在此作答（要点式即可）…"
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        border: "1.5px solid var(--md-sys-color-outline-variant)",
        background: "var(--md-sys-color-surface-container-lowest)",
        color: "var(--md-sys-color-on-surface)",
        fontSize: "14px",
        lineHeight: 1.7,
        resize: "vertical",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  );

  const isSubjective = q.type === "fill_blank" || q.type === "essay";

  return (
    <div>
      <MetaBar q={q} index={index} total={total} />

      {/* 题干 */}
      <div
        style={{
          fontSize: "16px",
          lineHeight: 1.75,
          color: "var(--md-sys-color-on-surface)",
          marginBottom: "16px",
          fontWeight: 500,
        }}
      >
        <QuizMarkdown>{q.stem}</QuizMarkdown>
      </div>

      {/* 作答区 */}
      {q.type === "single_choice" && renderChoices(false)}
      {q.type === "multiple_choice" && renderChoices(true)}
      {q.type === "true_false" && renderTrueFalse()}
      {q.type === "fill_blank" && renderFillBlank()}
      {q.type === "essay" && renderEssay()}

      {/* review 模式：客观题判分徽标 */}
      {reviewing && result && result.objective && (
        <div
          style={{
            marginTop: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 700,
            color: result.correct ? SUCCESS : ERROR,
          }}
        >
          {result.correct ? <Check size={15} /> : <X size={15} />}
          {result.correct ? "回答正确" : "回答错误"} · 得 {result.awarded} / {result.max} 分
        </div>
      )}

      {/* 解析 / 参考答案：
          - review 模式：客观题展开解析；主观题展开参考答案+评分要点
          - answer 模式：仅 essay 提供可折叠参考答案（默认收起，供自学对照） */}
      {reviewing && (q.explanation || isSubjective || q.scoring_criteria?.length) && (
        <AnswerReveal q={q} defaultOpen={isSubjective} />
      )}
      {!reviewing && q.type === "essay" && (q.scoring_criteria?.length || q.answer) && (
        <AnswerReveal q={q} defaultOpen={false} />
      )}
    </div>
  );
}
