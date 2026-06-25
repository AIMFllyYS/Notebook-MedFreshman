"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Check, X, ChevronDown, Lightbulb, BookOpen, Film } from "lucide-react";
import type { QuizQuestion as Q, UserAnswer } from "@/lib/quiz/types";
import { displayLabel, TYPE_LABELS } from "@/lib/quiz/types";
import type { QuestionResult } from "@/lib/quiz-store";
import { useQuizStore } from "@/lib/quiz-store";
import { getVideo } from "@/lib/content-data/media";
import { openMessageMenu } from "@/lib/hooks/useContextMenu";
import QuizMarkdown from "./QuizMarkdown";

const InlinePlayer = dynamic(() => import("@/components/video/InlinePlayer"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full animate-shimmer rounded-lg" />,
});

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

function Chip({ children, tone }: { children: React.ReactNode; tone?: "review" | "exam" }) {
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
            : tone === "exam"
              ? "var(--md-sys-color-error-container)"
              : "var(--md-sys-color-surface-container-high)",
        color:
          tone === "review"
            ? "var(--md-sys-color-on-tertiary-container)"
            : tone === "exam"
              ? "var(--md-sys-color-on-error-container)"
              : "var(--md-sys-color-on-surface-variant)",
      }}
    >
      {children}
    </span>
  );
}

function MetaBar({ q, index, total }: { q: Q; index: number; total: number }) {
  const isExamFocus = q.label === "考试重点";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-primary)" }}>
        第 {index + 1} / {total} 题
      </span>
      <Chip>{isExamFocus ? TYPE_LABELS[q.type] : displayLabel(q)}</Chip>
      <Chip>{DIFFICULTY_LABELS[q.difficulty]}</Chip>
      {isExamFocus && <Chip tone="exam">考试重点</Chip>}
      {q.source === "review" && <Chip tone="review">复习 · {q.sourceChapter ?? "前序章节"}</Chip>}
      <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)" }}>
        {q.points} 分
      </span>
    </div>
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

/** 交卷前的「提示」按钮（不泄露答案）。 */
function HintBlock({ q }: { q: Q }) {
  const used = useQuizStore((s) => s.hintsUsed.includes(q.id));
  const useHint = useQuizStore((s) => s.useHint);
  if (!q.hint) return null;
  return (
    <div style={{ marginTop: "14px" }}>
      {!used ? (
        <button
          type="button"
          onClick={() => useHint(q.id)}
          className="press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 14px",
            borderRadius: "var(--md-sys-shape-corner-full)",
            border: "1px solid var(--color-warning)",
            background: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
            color: "var(--color-warning)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Lightbulb size={15} />
          查看提示
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "11px 14px",
            borderRadius: "var(--md-sys-shape-corner-medium)",
            background: "color-mix(in srgb, var(--color-warning) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-warning) 40%, transparent)",
          }}
        >
          <Lightbulb size={16} style={{ color: "var(--color-warning)", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "13.5px", lineHeight: 1.65, color: "var(--md-sys-color-on-surface)" }}>
            <QuizMarkdown inline>{q.hint}</QuizMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

/** Manim 视频讲解卡片（复杂题，点击播放）。 */
function ManimVideo({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);
  const video = getVideo(id);
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", marginBottom: "6px" }}>
        <Film size={14} style={{ color: "var(--md-sys-color-primary)" }} />
        Manim 视频讲解
      </div>
      {!video ? (
        <div style={{ fontSize: "12.5px", color: "var(--md-sys-color-on-surface-variant)", padding: "10px 12px", borderRadius: "var(--md-sys-shape-corner-medium)", border: "1px dashed var(--md-sys-color-outline-variant)" }}>
          本题视频讲解正在生成中（{id}）。
        </div>
      ) : playing ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <InlinePlayer video={video} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="hover-lift"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            textAlign: "left",
            padding: "12px 14px",
            borderRadius: "var(--md-sys-shape-corner-medium)",
            border: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container-lowest)",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "var(--md-sys-shape-corner-full)", background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--md-sys-color-on-surface)" }}>
            {video.title || "播放本题动画讲解"}
          </span>
        </button>
      )}
    </div>
  );
}

/** review 模式：深度解析 + 参考答案 + 评分要点 + 来源目录 + 视频。 */
function ReviewExplain({ q }: { q: Q }) {
  const isSubjective = q.type === "analysis" || q.type === "fill_blank" || q.type === "essay";
  return (
    <div
      style={{
        marginTop: "14px",
        padding: "13px 15px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* 辨析题：先给命题判断 */}
      {q.type === "analysis" && (
        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: q.answer === 1 ? SUCCESS : ERROR }}>
          此命题：{q.answer === 1 ? "正确 √" : "错误 ×"}
        </div>
      )}

      {/* 参考答案（主观题） */}
      {isSubjective && (
        <>
          <SectionLabel>参考答案</SectionLabel>
          <div style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--md-sys-color-on-surface)" }}>
            <QuizMarkdown>{q.type === "analysis" ? q.reasoning || String(q.answer ?? "") : String(q.answer ?? "")}</QuizMarkdown>
          </div>
        </>
      )}

      {/* 评分要点 */}
      {q.scoring_criteria && q.scoring_criteria.length > 0 && (
        <>
          <SectionLabel>评分要点</SectionLabel>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {q.scoring_criteria.map((c, i) => (
              <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--md-sys-color-on-surface)" }}>
                <QuizMarkdown inline>{c}</QuizMarkdown>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 深度解析 */}
      {q.explanation && (
        <>
          <SectionLabel>深度解析</SectionLabel>
          <div
            style={{ fontSize: "13.5px", lineHeight: 1.75, color: "var(--md-sys-color-on-surface-variant)" }}
            onContextMenu={(e) => openMessageMenu(e, q.explanation!)}
          >
            <QuizMarkdown>{q.explanation}</QuizMarkdown>
          </div>
        </>
      )}

      {/* 来源目录 */}
      {q.sourceRef && (q.sourceRef.label || q.sourceRef.path) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px dashed var(--md-sys-color-outline-variant)",
            fontSize: "12px",
            color: "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <BookOpen size={14} style={{ flexShrink: 0, marginTop: "2px", color: "var(--md-sys-color-primary)" }} />
          <span>
            来源：{q.sourceRef.label}
            {q.sourceRef.path && (
              <code style={{ marginLeft: "6px", fontSize: "11.5px", color: "var(--md-sys-color-on-surface-variant)", fontFamily: "var(--font-mono)" }}>
                {q.sourceRef.path}
              </code>
            )}
          </span>
        </div>
      )}

      {/* Manim 视频讲解 */}
      {q.manimVideoId && <ManimVideo id={q.manimVideoId} />}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", margin: "12px 0 6px" }}>
      {children}
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

  // analysis（辨析）与 essay（简答/材料分析/论述）统一用多行文本作答
  const renderTextArea = (placeholder: string) => (
    <textarea
      value={typeof answer === "string" ? answer : ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={reviewing}
      rows={reviewing ? 4 : 7}
      placeholder={placeholder}
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

  return (
    <div>
      <MetaBar q={q} index={index} total={total} />

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
      {q.type === "analysis" && renderTextArea("先判断「正确/错误」，再写出你的理由…")}
      {q.type === "essay" && renderTextArea("在此作答（要点式即可）…")}

      {/* 客观题判分徽标（review） */}
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

      {/* 交卷前提示 / 交卷后深度解析 */}
      {!reviewing && <HintBlock q={q} />}
      {reviewing && <ReviewExplain q={q} />}
    </div>
  );
}
