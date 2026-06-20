"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, ArrowLeft, Trophy } from "lucide-react";
import { useQuizStore, computeBreakdown } from "@/lib/quiz-store";

const TYPE_LABELS: Record<string, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  true_false: "判断题",
  fill_blank: "填空题",
  essay: "材料分析 / 解答题",
};
const SOURCE_LABELS: Record<string, string> = {
  current_chapter: "本章题目",
  review: "滚动复习",
};
const DIFFICULTY_LABELS: Record<string, string> = {
  basic: "基础",
  medium: "中等",
  hard: "提高",
};

function gradeOf(percent: number): { label: string; color: string } {
  if (percent >= 90) return { label: "优秀", color: "var(--color-success)" };
  if (percent >= 80) return { label: "良好", color: "var(--color-info)" };
  if (percent >= 60) return { label: "及格", color: "var(--color-warning)" };
  return { label: "待加强", color: "var(--md-sys-color-error)" };
}

/** 一组分类统计的进度条列表。 */
function StatGroup({
  title,
  labels,
  data,
}: {
  title: string;
  labels: Record<string, string>;
  data: Record<string, { earned: number; max: number; count: number }>;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--md-sys-color-on-surface-variant)", marginBottom: "10px" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {entries.map(([key, v]) => {
          const pct = v.max > 0 ? Math.round((v.earned / v.max) * 100) : 0;
          return (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface)" }}>
                  {labels[key] ?? key}
                  <span style={{ color: "var(--md-sys-color-on-surface-variant)", marginLeft: "6px" }}>
                    （{v.count} 题）
                  </span>
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--md-sys-color-on-surface-variant)" }}>
                  {v.earned} / {v.max} 分 · {pct}%
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  borderRadius: "var(--md-sys-shape-corner-full)",
                  background: "var(--md-sys-color-surface-container-highest)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
                  style={{
                    height: "100%",
                    borderRadius: "var(--md-sys-shape-corner-full)",
                    background:
                      pct >= 60 ? "var(--md-sys-color-primary)" : "var(--md-sys-color-error)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuizSummary() {
  const results = useQuizStore((s) => s.results);
  const restart = useQuizStore((s) => s.restart);
  const backToScoring = useQuizStore((s) => s.backToScoring);
  const breakdown = computeBreakdown(results);
  const grade = gradeOf(breakdown.percent);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-10">
      {/* 总分卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          padding: "28px",
          borderRadius: "var(--md-sys-shape-corner-extra-large)",
          background: "var(--md-sys-color-surface-container-low)",
          border: "1px solid var(--md-sys-color-outline-variant)",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            flexShrink: 0,
            background: `conic-gradient(${grade.color} ${breakdown.percent * 3.6}deg, var(--md-sys-color-surface-container-highest) 0deg)`,
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "94px",
              height: "94px",
              borderRadius: "50%",
              background: "var(--md-sys-color-surface-container-low)",
            }}
          >
            <span style={{ fontSize: "30px", fontWeight: 800, color: grade.color, lineHeight: 1 }}>
              {breakdown.percent}
            </span>
            <span style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", marginTop: "2px" }}>
              百分制
            </span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Trophy size={18} style={{ color: grade.color }} />
            <span style={{ fontSize: "20px", fontWeight: 800, color: grade.color }}>{grade.label}</span>
          </div>
          <div style={{ fontSize: "14px", color: "var(--md-sys-color-on-surface)" }}>
            原始得分 <strong>{breakdown.earned}</strong> / {breakdown.max} 分
          </div>
          <div style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface-variant)", marginTop: "4px" }}>
            共 {results.length} 题
          </div>
        </div>
      </motion.div>

      {/* 分类统计 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
        <StatGroup title="按题型" labels={TYPE_LABELS} data={breakdown.byType} />
        <StatGroup title="按来源（本章 vs 复习）" labels={SOURCE_LABELS} data={breakdown.bySource} />
        <StatGroup title="按难度" labels={DIFFICULTY_LABELS} data={breakdown.byDifficulty} />
      </div>

      {/* 操作 */}
      <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
        <button
          type="button"
          onClick={backToScoring}
          className="press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "11px 20px",
            borderRadius: "var(--md-sys-shape-corner-full)",
            background: "var(--md-sys-color-surface-container-high)",
            color: "var(--md-sys-color-on-surface)",
            fontSize: "14px",
            fontWeight: 600,
            border: "1px solid var(--md-sys-color-outline-variant)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} />
          返回逐题评分
        </button>
        <button
          type="button"
          onClick={restart}
          className="press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "11px 20px",
            borderRadius: "var(--md-sys-shape-corner-full)",
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
            fontSize: "14px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={16} />
          重做本套题
        </button>
      </div>
    </div>
  );
}
