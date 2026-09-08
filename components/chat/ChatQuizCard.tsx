'use client';

import React, { useMemo, useState } from 'react';
import type { QuestionType, QuizQuestion as Q, UserAnswer } from '@/lib/quiz/types';
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

const INTENT_LABEL: Record<string, string> = {
  check: '即时检验',
  diagnose: '漏洞诊断',
  practice: '练习',
  exam: '小测',
};

/** 点一下选项就能判定：单选 / 判断。多选要先选完再确认，避免半途揭晓。 */
function isInstantChoice(type: QuestionType): boolean {
  return type === 'single_choice' || type === 'true_false';
}

function isAnswered(answer: UserAnswer | undefined): boolean {
  if (answer === undefined || answer === null) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (typeof answer === 'object') return Object.keys(answer).length > 0;
  return true;
}

function resultOf(q: Q, answer: UserAnswer): QuestionResult {
  const max = maxPointsOf(q);
  if (isObjective(q.type)) {
    const [awarded, correct] = autoGrade(q, answer);
    return { question: q, answer, awarded, max, correct, objective: true };
  }
  return { question: q, answer, awarded: 0, max, correct: false, objective: false };
}

function revealLabel(type: QuestionType): string {
  if (type === 'fill_blank') return '查看答案';
  if (type === 'multiple_choice') return '确认并查看对错';
  return '查看解析';
}

export default function ChatQuizCard({ title, questions, intent, droppedCount }: ChatQuizCardProps) {
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);

  const reveal = (id: string) => setRevealed((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

  const onAnswer = (q: Q, a: UserAnswer) => {
    setAnswers((prev) => ({ ...prev, [q.id]: a }));
    if (isInstantChoice(q.type)) reveal(q.id);
  };

  const results = useMemo(() => {
    const map: Record<string, QuestionResult> = {};
    for (const q of questions) {
      if (!revealed[q.id]) continue;
      map[q.id] = resultOf(q, answers[q.id] ?? null);
    }
    return map;
  }, [questions, answers, revealed]);

  if (!questions.length) {
    return (
      <div className="my-3 min-w-0 overflow-hidden rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3 text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
        出题失败：没有可渲染的题目。
      </div>
    );
  }

  const revealedCount = questions.filter((q) => revealed[q.id]).length;

  return (
    <div className="chat-quiz-card my-3 min-w-0 overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">
        <AgentQuizIcon size={18} className="shrink-0" />
        <span className="min-w-0 truncate">{title}</span>
        <span className="ml-auto shrink-0 text-[11px] font-normal text-[var(--md-sys-color-on-surface-variant)]">
          {intent ? INTENT_LABEL[intent] || intent : '练习'} · {questions.length} 题
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((q, i) => {
          const open = !!revealed[q.id];
          const needsConfirm = !isInstantChoice(q.type);
          return (
            <div key={q.id} className="min-w-0">
              <QuizQuestion
                question={q}
                index={i}
                total={questions.length}
                mode={open ? 'review' : 'answer'}
                answer={answers[q.id] ?? null}
                onChange={(a) => onAnswer(q, a)}
                result={results[q.id]}
                hintsUsed={hintsUsed}
                onUseHint={(id) => setHintsUsed((prev) => (prev.includes(id) ? prev : [...prev, id]))}
              />
              {needsConfirm && !open ? (
                <button
                  type="button"
                  disabled={!isAnswered(answers[q.id])}
                  onClick={() => reveal(q.id)}
                  className="mt-3 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
                >
                  {revealLabel(q.type)}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {revealedCount > 0 ? (
        <div className="mt-4 flex items-center gap-3 text-[13px]">
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
            已反馈 {revealedCount} / {questions.length}
          </span>
          <button
            type="button"
            onClick={() => { setAnswers({}); setHintsUsed([]); setRevealed({}); }}
            className="ml-auto rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-[12px] hover:bg-[var(--md-sys-color-surface-container-high)]"
          >
            重做
          </button>
        </div>
      ) : null}

      {droppedCount ? (
        <div className="mt-3 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          （有 {droppedCount} 道题因结构不完整被丢弃）
        </div>
      ) : null}
    </div>
  );
}
