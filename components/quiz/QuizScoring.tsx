"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useQuizStore, computeBreakdown } from "@/lib/quiz-store";
import QuizQuestion from "./QuizQuestion";

/** 主观题自评滑块。 */
function SelfScoreSlider({
  id,
  awarded,
  max,
}: {
  id: string;
  awarded: number;
  max: number;
}) {
  const setSelfScore = useQuizStore((s) => s.setSelfScore);
  // 满分较小（如 ≤10）时按 0.5 步长，否则整数步长。
  const step = max <= 10 ? 0.5 : 1;
  return (
    <div
      style={{
        marginTop: "14px",
        padding: "12px 14px",
        borderRadius: "var(--md-sys-shape-corner-medium)",
        background: "var(--md-sys-color-surface-container-high)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--md-sys-color-on-surface)" }}>
          对照评分要点为本题自评
        </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--md-sys-color-primary)" }}>
          {awarded} / {max} 分
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={awarded}
        onChange={(e) => setSelfScore(id, Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--md-sys-color-primary)" }}
      />
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        {[0, 0.5, 1].map((frac) => (
          <button
            key={frac}
            type="button"
            onClick={() => setSelfScore(id, Math.round(max * frac * 2) / 2)}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--md-sys-shape-corner-full)",
              border: "1px solid var(--md-sys-color-outline-variant)",
              background: "var(--md-sys-color-surface-container-lowest)",
              color: "var(--md-sys-color-on-surface-variant)",
              cursor: "pointer",
            }}
          >
            {frac === 0 ? "未答对" : frac === 0.5 ? "部分正确" : "完全正确"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function QuizScoring() {
  const results = useQuizStore((s) => s.results);
  const answers = useQuizStore((s) => s.answers);
  const finishScoring = useQuizStore((s) => s.finishScoring);
  const breakdown = computeBreakdown(results);

  const hasSubjective = results.some((r) => !r.objective);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-10">
      <div style={{ marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-primary)" }}>
        逐题评分
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--md-sys-color-on-surface)", margin: "0 0 6px" }}>
        核对答案与自评
      </h2>
      <p style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)", margin: "0 0 8px" }}>
        客观题已自动判分；{hasSubjective ? "主观题请对照参考答案与评分要点拖动滑块自评。" : "可查看每题解析。"}
      </p>

      {/* 当前累计得分 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          padding: "10px 14px",
          marginBottom: "20px",
          borderRadius: "var(--md-sys-shape-corner-medium)",
          background: "var(--md-sys-color-surface-container)",
          border: "1px solid var(--md-sys-color-outline-variant)",
          boxShadow: "var(--md-sys-elevation-level1)",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface-variant)" }}>当前得分</span>
        <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--md-sys-color-primary)" }}>
          {breakdown.earned}
        </span>
        <span style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface-variant)" }}>
          / {breakdown.max} 分（{breakdown.percent} 分制）
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {results.map((r, i) => (
          <motion.div
            key={r.question.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            style={{
              padding: "18px 20px",
              borderRadius: "var(--md-sys-shape-corner-large)",
              background: "var(--md-sys-color-surface-container-low)",
              border: "1px solid var(--md-sys-color-outline-variant)",
            }}
          >
            <QuizQuestion
              question={r.question}
              index={i}
              total={results.length}
              mode="review"
              answer={answers[r.question.id] ?? null}
              result={r}
            />
            {!r.objective && (
              <SelfScoreSlider id={r.question.id} awarded={r.awarded} max={r.max} />
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
        <button
          type="button"
          onClick={finishScoring}
          className="press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "11px 22px",
            borderRadius: "var(--md-sys-shape-corner-full)",
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
            fontSize: "14px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--md-sys-elevation-level1)",
          }}
        >
          完成并查看总结
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
