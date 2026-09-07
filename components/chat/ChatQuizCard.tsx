'use client';

import React, { useState, useMemo } from 'react';
import type { QuizQuestion as Q, UserAnswer } from '@/lib/quiz/types';
import { autoGrade, isObjective, maxPointsOf } from '@/lib/quiz/types';
import type { QuestionResult } from '@/lib/quiz-store';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import { AgentQuizIcon } from '@/components/icons/AgentIcons';

interface ChatQuizCardProps {
  title: string;
  questions: Q[];
  intent?: string;
  droppedCount?: number;
}

export default function ChatQuizCard({ title, questions, intent, droppedCount }: ChatQuizCardProps) {
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo<Record<string, QuestionResult>>(() => {
    const map: Record<string, QuestionResult> = {};
    if (!submitted) return map;
    for (const q of questions) {
      const answer = answers[q.id] ?? null;
      const max = maxPointsOf(q);
      if (isObjective(q.type)) {
        const [awarded, correct] = autoGrade(q, answer);
        map[q.id] = { question: q, answer, awarded, max, correct, objective: true };
      } else {
        map[q.id] = { question: q, answer, awarded: 0, max, correct: false, objective: false };
      }
    }
    return map;
  }, [submitted, questions, answers]);

  const totalObjectiveMax = useMemo(() => questions.filter((q) => isObjective(q.type)).reduce((s, q) => s + maxPointsOf(q), 0), [questions]);
  const earned = useMemo(() => Object.values(results).reduce((s, r) => s + r.awarded, 0), [results]);
  const allAnswered = questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== null && (Array.isArray(answers[q.id]) ? (answers[q.id] as unknown[]).length > 0 : true));

  if (!questions.length) {
    return (
      <div className="my-3 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3 text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
        出题失败：没有可渲染的题目。
      </div>
    );
  }

  const intentLabel: Record<string, string> = {
    check: '即时检验',
    diagnose: '漏洞诊断',
    practice: '练习',
    exam: '小测',
  };

  return (
    <div className="my-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-4">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">
        <AgentQuizIcon size={18} />
        <span className="truncate">{title}</span>
        <span className="ml-auto text-[11px] font-normal text-[var(--md-sys-color-on-surface-variant)]">
          {intent ? intentLabel[intent] || intent : '练习'} · {questions.length} 题
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuizQuestion
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            mode={submitted ? 'review' : 'answer'}
            answer={answers[q.id] ?? null}
            onChange={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
            result={results[q.id]}
            hintsUsed={hintsUsed}
            onUseHint={(id) => setHintsUsed((prev) => (prev.includes(id) ? prev : [...prev, id]))}
          />
        ))}
      </div>

      {!submitted ? (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="rounded-lg bg-[var(--md-sys-color-primary)] px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
          >
            提交并查看解析
          </button>
          {!allAnswered && <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">还有未答题目</span>}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 text-[13px]">
          <span className="font-semibold text-[var(--md-sys-color-primary)]">客观题得分：{earned} / {totalObjectiveMax}</span>
          <button
            type="button"
            onClick={() => { setAnswers({}); setHintsUsed([]); setSubmitted(false); }}
            className="ml-auto rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] hover:bg-[var(--md-sys-color-surface-container-high)]"
          >
            重做
          </button>
        </div>
      )}

      {droppedCount ? (
        <div className="mt-3 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          （有 {droppedCount} 道题因结构不完整被丢弃）
        </div>
      ) : null}
    </div>
  );
}
