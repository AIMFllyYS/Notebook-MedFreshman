"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Check, X, Lightbulb, BookOpen, Film } from "lucide-react";
import type { QuizQuestion as Q, UserAnswer } from "@/lib/quiz/types";
import { isComposite } from "@/lib/quiz/types";
import type { QuestionResult } from "@/lib/quiz-store";
import { useQuizStore } from "@/lib/quiz-store";
import { getVideo } from "@/lib/content-data/media";
import { openMessageMenu } from "@/lib/hooks/useContextMenu";
import QuizMarkdown from "./QuizMarkdown";
import { useQuizExplain } from "@/lib/stores/quizExplain";
import { useT } from "@/lib/i18n";

const InlinePlayer = dynamic(() => import("@/components/video/InlinePlayer"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full animate-shimmer rounded-lg" />,
});

const DIFFICULTY_LABELS: Record<Q["difficulty"], string> = {
  basic: "window.quiz.difficulty.basic",
  medium: "window.quiz.difficulty.medium",
  hard: "window.quiz.difficulty.hard",
};

/** 题型默认显示名（等价于 lib/quiz/types 的 displayLabel，只是走词典）。 */
const TYPE_LABELS: Record<Q["type"], string> = {
  single_choice: "window.quiz.type.singleChoice",
  multiple_choice: "window.quiz.type.multipleChoice",
  true_false: "window.quiz.type.trueFalse",
  analysis: "window.quiz.type.analysis",
  fill_blank: "window.quiz.type.fillBlank",
  essay: "window.quiz.type.essay",
  reading: "window.quiz.type.reading",
  cloze: "window.quiz.type.cloze",
  translation: "window.quiz.type.translation",
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
  /** 可选：外部控制提示状态；未提供时使用全局 quiz store。 */
  hintsUsed?: string[];
  onUseHint?: (id: string) => void;
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
  const t = useT();
  const isExamFocus = q.label === "考试重点";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-primary)" }}>
        {t("window.quiz.question.indexTotal", { index: index + 1, total })}
      </span>
      <Chip>{isExamFocus ? t(TYPE_LABELS[q.type]) : q.label?.trim() || t(TYPE_LABELS[q.type])}</Chip>
      <Chip>{t(DIFFICULTY_LABELS[q.difficulty])}</Chip>
      {isExamFocus && <Chip tone="exam">{t("window.quiz.question.examFocus")}</Chip>}
      {q.source === "review" && <Chip tone="review">{t("window.quiz.question.reviewPrefix", { chapter: q.sourceChapter ?? t("window.quiz.question.previousChapter") })}</Chip>}
      <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)" }}>
        {t("window.quiz.question.points", { points: q.points })}
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
function HintBlock({ q, onUse, used }: { q: Q; onUse: () => void; used: boolean }) {
  const t = useT();
  if (!q.hint) return null;
  return (
    <div style={{ marginTop: "14px" }}>
      {!used ? (
          <button
            type="button"
            onClick={onUse}
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
          {t("window.quiz.question.showHint")}
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
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const video = getVideo(id);
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", marginBottom: "6px" }}>
        <Film size={14} style={{ color: "var(--md-sys-color-primary)" }} />
        {t("window.quiz.question.manimTitle")}
      </div>
      {!video ? (
        <div style={{ fontSize: "12.5px", color: "var(--md-sys-color-on-surface-variant)", padding: "10px 12px", borderRadius: "var(--md-sys-shape-corner-medium)", border: "1px dashed var(--md-sys-color-outline-variant)" }}>
          {t("window.quiz.question.manimPending", { id })}
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
            {video.title || t("window.quiz.question.playVideo")}
          </span>
        </button>
      )}
    </div>
  );
}

/** review 模式：深度解析 + 参考答案 + 评分要点 + 来源目录 + 视频。 */
function ReviewExplain({ q }: { q: Q }) {
  const t = useT();
  const isSubjective = q.type === "analysis" || q.type === "fill_blank" || q.type === "essay";
  return (
    <div
      data-testid="quiz-explain-card"
      style={{
        marginTop: "6px",
        padding: "10px 12px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: q.explanation || isSubjective || (q.scoring_criteria && q.scoring_criteria.length > 0) ? "6px" : 0,
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)" }}>
          {t("window.quiz.question.explain")}
        </span>
        <button
          type="button"
          data-testid="quiz-explain-agent-btn"
          onClick={() => useQuizExplain.getState().openWindow(q)}
          style={{
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 600,
            lineHeight: 1.3,
            padding: "3px 8px",
            borderRadius: "var(--md-sys-shape-corner-full)",
            border: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container-lowest)",
            color: "var(--md-sys-color-primary)",
            cursor: "pointer",
          }}
        >
          {t("window.quiz.question.askAgent")}
        </button>
      </div>

      {/* 辨析题：先给命题判断 */}
      {q.type === "analysis" && (
        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: q.answer === 1 ? SUCCESS : ERROR }}>
          {t("window.quiz.question.proposition", { verdict: q.answer === 1 ? t("window.quiz.question.verdictTrue") : t("window.quiz.question.verdictFalse") })}
        </div>
      )}

      {/* 参考答案（主观题） */}
      {isSubjective && (
        <>
          <SectionLabel tight>{t("window.quiz.question.referenceAnswer")}</SectionLabel>
          <div style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--md-sys-color-on-surface)" }}>
            <QuizMarkdown>{q.type === "analysis" ? q.reasoning || String(q.answer ?? "") : String(q.answer ?? "")}</QuizMarkdown>
          </div>
        </>
      )}

      {/* 评分要点 */}
      {q.scoring_criteria && q.scoring_criteria.length > 0 && (
        <>
          <SectionLabel tight={!isSubjective}>{t("window.quiz.question.scoringCriteria")}</SectionLabel>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {q.scoring_criteria.map((c, i) => (
              <li key={i} style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--md-sys-color-on-surface)" }}>
                <QuizMarkdown inline>{c}</QuizMarkdown>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 深度解析正文 */}
      {q.explanation && (
        <div
          style={{ fontSize: "13.5px", lineHeight: 1.75, color: "var(--md-sys-color-on-surface-variant)" }}
          onContextMenu={(e) => openMessageMenu(e, q.explanation!)}
        >
          <QuizMarkdown>{q.explanation}</QuizMarkdown>
        </div>
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
            {t("window.quiz.question.source", { label: q.sourceRef.label ?? "" })}
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

function SectionLabel({ children, tight }: { children: React.ReactNode; tight?: boolean }) {
  return (
    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", margin: tight ? "4px 0 6px" : "12px 0 6px" }}>
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
  hintsUsed: hintsUsedProp,
  onUseHint: onUseHintProp,
}: QuizQuestionProps) {
  const t = useT();
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
        if (next.has(i)) {
          next.delete(i);
        } else {
          next.add(i);
        }
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
      { val: 1, label: t("window.quiz.question.verdictTrue") },
      { val: 0, label: t("window.quiz.question.verdictFalse") },
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
      placeholder={t("window.quiz.question.answerPlaceholder")}
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

  const storeHintsUsed = useQuizStore((s) => s.hintsUsed);
  const storeUseHint = useQuizStore((s) => s.useHint);
  const used = (hintsUsedProp ?? storeHintsUsed).includes(q.id);
  const handleUseHint = () => {
    (onUseHintProp ?? storeUseHint)(q.id);
  };

  const compositeRecord = (
    typeof answer === "object" && answer !== null && !Array.isArray(answer)
      ? (answer as Record<string, unknown>)
      : {}
  );

  const getComposite = (subId: string): UserAnswer => {
    const v = compositeRecord[subId];
    if (v === undefined) return null;
    if (typeof v === "number" || typeof v === "string" || Array.isArray(v)) return v as UserAnswer;
    return null;
  };

  const setCompositeAnswer = (subId: string, subAnswer: UserAnswer) => {
    onChange?.({ ...compositeRecord, [subId]: subAnswer });
  };

  /** 单选/判断选项渲染（支持传入自定义数据，用于复合题型）。 */
  function SimpleChoice({
    subId,
    type,
    options,
    correctAnswer,
    label,
  }: {
    subId: string;
    type: "single_choice" | "multiple_choice" | "true_false";
    options?: string[];
    correctAnswer: number | number[];
    label?: React.ReactNode;
  }) {
    const subAnswer = getComposite(subId);
    const isMultiple = type === "multiple_choice";
    const isTrueFalse = type === "true_false";

    if (isTrueFalse) {
      const picked = typeof subAnswer === "number" ? subAnswer : null;
      const correct = correctAnswer as number;
      const opts = [
        { val: 1, label: t("window.quiz.question.verdictTrue") },
        { val: 0, label: t("window.quiz.question.verdictFalse") },
      ];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {label}
          <div style={{ display: "flex", gap: "10px" }}>
            {opts.map(({ val, label: text }) => {
              let state: "neutral" | "correct" | "wrong" = "neutral";
              if (reviewing) {
                if (val === correct) state = "correct";
                else if (picked === val) state = "wrong";
              }
              const selected = picked === val;
              let borderColor = "var(--md-sys-color-outline-variant)";
              let bg = "var(--md-sys-color-surface-container-lowest)";
              let color = "var(--md-sys-color-on-surface)";
              if (!reviewing && selected) {
                borderColor = PRIMARY;
                bg = "var(--md-sys-color-primary-container)";
                color = "var(--md-sys-color-on-primary-container)";
              } else if (state === "correct") {
                borderColor = SUCCESS;
                bg = "color-mix(in srgb, var(--color-success) 14%, transparent)";
                color = SUCCESS;
              } else if (state === "wrong") {
                borderColor = ERROR;
                bg = "color-mix(in srgb, var(--color-error) 14%, transparent)";
                color = ERROR;
              }
              return (
                <button
                  key={val}
                  type="button"
                  disabled={reviewing}
                  onClick={() => !reviewing && setCompositeAnswer(subId, val)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "var(--md-sys-shape-corner-medium)",
                    border: `1.5px solid ${borderColor}`,
                    background: bg,
                    color,
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: reviewing ? "default" : "pointer",
                  }}
                >
                  {text}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const correctSet = new Set<number>(isMultiple ? (correctAnswer as number[]) : [correctAnswer as number]);
    const pickedArr: number[] = isMultiple
      ? Array.isArray(subAnswer)
        ? (subAnswer as number[])
        : []
      : typeof subAnswer === "number"
        ? [subAnswer as number]
        : [];
    const pickedSet = new Set(pickedArr);

    const toggle = (i: number) => {
      if (reviewing) return;
      if (isMultiple) {
        const next = new Set(pickedSet);
        if (next.has(i)) {
          next.delete(i);
        } else {
          next.add(i);
        }
        setCompositeAnswer(subId, [...next].sort((a, b) => a - b));
      } else {
        setCompositeAnswer(subId, i);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {label}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(options ?? []).map((opt, i) => {
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
      </div>
    );
  }

  /** 阅读理解渲染。 */
  const renderReading = () => {
    const subs = q.subQuestions ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {q.passage && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--md-sys-shape-corner-medium)",
              background: "var(--md-sys-color-surface-container)",
              border: "1px solid var(--md-sys-color-outline-variant)",
              fontSize: "14px",
              lineHeight: 1.75,
            }}
          >
            <QuizMarkdown>{q.passage}</QuizMarkdown>
          </div>
        )}
        {subs.map((sq, idx) => (
          <div key={sq.id}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--md-sys-color-on-surface)",
                marginBottom: "8px",
              }}
            >
              {idx + 1}. <QuizMarkdown inline>{sq.stem}</QuizMarkdown>
            </div>
            <SimpleChoice
              subId={sq.id}
              type={sq.type}
              options={sq.options}
              correctAnswer={sq.answer}
            />
            {reviewing && sq.explanation && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  borderRadius: "var(--md-sys-shape-corner-medium)",
                  background: "var(--md-sys-color-surface-container-high)",
                  fontSize: "13px",
                  color: "var(--md-sys-color-on-surface-variant)",
                  lineHeight: 1.65,
                }}
              >
                <QuizMarkdown>{sq.explanation}</QuizMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /** 完形填空渲染。 */
  const renderCloze = () => {
    const blanks = q.blanks ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {q.passage && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--md-sys-shape-corner-medium)",
              background: "var(--md-sys-color-surface-container)",
              border: "1px solid var(--md-sys-color-outline-variant)",
              fontSize: "14px",
              lineHeight: 1.75,
            }}
          >
            <QuizMarkdown>{q.passage}</QuizMarkdown>
          </div>
        )}
        {blanks.map((b, idx) => (
          <SimpleChoice
            key={b.id}
            subId={b.id}
            type="single_choice"
            options={b.options}
            correctAnswer={b.answer}
            label={
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--md-sys-color-on-surface)" }}>
                ({idx + 1})
              </span>
            }
          />
        ))}
      </div>
    );
  };

  /** 翻译题渲染。 */
  const renderTranslation = () => {
    const items = q.items ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {items.map((item, idx) => (
          <div key={item.id}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--md-sys-color-on-surface)",
                marginBottom: "8px",
              }}
            >
              {idx + 1}. <QuizMarkdown inline>{item.source}</QuizMarkdown>
              <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)", fontWeight: 500 }}>
                {t("window.quiz.question.subPoints", { points: item.points })}
              </span>
            </div>
            <textarea
              value={typeof getComposite(item.id) === "string" ? (getComposite(item.id) as string) : ""}
              onChange={(e) => setCompositeAnswer(item.id, e.target.value)}
              disabled={reviewing}
              rows={reviewing ? 3 : 5}
              placeholder={t("window.quiz.question.translationPlaceholder")}
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
            {reviewing && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  borderRadius: "var(--md-sys-shape-corner-medium)",
                  background: "var(--md-sys-color-surface-container-high)",
                  fontSize: "13px",
                  color: "var(--md-sys-color-on-surface-variant)",
                  lineHeight: 1.65,
                }}
              >
                <strong style={{ color: "var(--md-sys-color-on-surface)" }}>{t("window.quiz.question.referenceTranslation")}</strong>
                <QuizMarkdown inline>{item.reference}</QuizMarkdown>
                {item.explanation && (
                  <>
                    <br />
                    <strong style={{ color: "var(--md-sys-color-on-surface)" }}>{t("window.quiz.question.keyPoints")}</strong>
                    <QuizMarkdown inline>{item.explanation}</QuizMarkdown>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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
      {q.type === "analysis" && renderTextArea(t("window.quiz.question.analysisPlaceholder"))}
      {q.type === "essay" && renderTextArea(t("window.quiz.question.essayPlaceholder"))}
      {q.type === "reading" && renderReading()}
      {q.type === "cloze" && renderCloze()}
      {q.type === "translation" && renderTranslation()}

      {/* 客观题判分徽标（review）；复合题型由子结构分别展示，此处不重复 */}
      {reviewing && result && result.objective && !isComposite(q.type) && (
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
          {t("window.quiz.question.resultLine", { verdict: result.correct ? t("window.quiz.question.correct") : t("window.quiz.question.wrong"), awarded: result.awarded, max: result.max })}
        </div>
      )}

      {/* 交卷前提示 / 交卷后深度解析 */}
      {!reviewing && <HintBlock q={q} onUse={handleUseHint} used={used} />}
      {reviewing && <ReviewExplain q={q} />}
    </div>
  );
}

