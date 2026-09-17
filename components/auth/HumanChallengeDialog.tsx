"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHALLENGE_TRACKS,
  getChallengePublic,
  gradeChallenge,
  remainingCooldownMs,
  shuffleMedicineOrder,
  type ChallengeAnswer,
  type ChallengeGrade,
  type ChallengeTrack,
} from "@/lib/auth/humanChallenge";
import { MEDICINE_SVGS } from "./CentralDogmaSvgs";

function moveItem(order: string[], index: number, delta: number): string[] {
  const next = order.slice();
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  const tmp = next[index]!;
  next[index] = next[target]!;
  next[target] = tmp;
  return next;
}

export default function HumanChallengeDialog({
  open,
  onClose,
  onPassed,
}: {
  open: boolean;
  onClose: () => void;
  onPassed: () => void;
}) {
  const [track, setTrack] = useState<ChallengeTrack>("science");
  const [scienceChoice, setScienceChoice] = useState("");
  const [humanitiesSelected, setHumanitiesSelected] = useState<string[]>([]);
  const [humanitiesAnswers, setHumanitiesAnswers] = useState<Record<string, string>>({});
  const [otherAnswers, setOtherAnswers] = useState<Record<string, string>>({});
  const [medicineOrder, setMedicineOrder] = useState(() => shuffleMedicineOrder());
  const [grade, setGrade] = useState<ChallengeGrade | null>(null);
  const [failedAt, setFailedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const challenge = useMemo(() => getChallengePublic(track), [track]);
  const cooldown = remainingCooldownMs(failedAt, now);
  const cooling = cooldown > 0;

  useEffect(() => {
    if (!cooling) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [cooling]);

  if (!open || typeof document === "undefined") return null;

  function resetReveal() {
    setGrade(null);
  }

  function submit() {
    if (cooling) return;
    let answer: ChallengeAnswer;
    if (track === "science") answer = { track, choiceId: scienceChoice };
    else if (track === "humanities") {
      answer = { track, selectedIds: humanitiesSelected, answers: humanitiesAnswers };
    } else if (track === "medicine") answer = { track, order: medicineOrder };
    else answer = { track, answers: otherAnswers };
    const next = gradeChallenge(answer);
    setGrade(next);
    if (next.passed) {
      setFailedAt(null);
      onPassed();
      return;
    }
    setFailedAt(Date.now());
    setNow(Date.now());
  }

  return createPortal(
    <div
      className="human-challenge-overlay"
      data-testid="human-challenge-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="human-challenge-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="人机验证"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--md-sys-color-primary)]">STUDYSOLO</p>
            <h2 className="mt-1 text-[16px] font-bold text-[var(--md-sys-color-on-surface)]">先证明你是人</h2>
            <p className="mt-1 text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">
              任选一科答对即可发邮件。提交后才看答案；失败冷却 10 秒。
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-[12px] text-[var(--md-sys-color-on-surface-variant)]"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-3 flex gap-1 px-5" role="tablist" aria-label="验证科目">
          {CHALLENGE_TRACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={track === item.id}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
              style={{
                background: track === item.id ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container)",
                color: track === item.id ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
              }}
              onClick={() => {
                setTrack(item.id);
                resetReveal();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {challenge.track === "science" && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">{challenge.title}</p>
              <div className="rounded-2xl bg-[var(--md-sys-color-surface-container)] px-4 py-3">
                <p className="font-mono text-[15px] text-[var(--md-sys-color-on-surface)]">{challenge.equation}</p>
                <p className="mt-1 font-mono text-[13px] text-[var(--md-sys-color-on-surface-variant)]">{challenge.condition}</p>
                <p className="mt-2 text-[12px] text-[var(--md-sys-color-on-surface-variant)]">{challenge.prompt}</p>
              </div>
              <div role="radiogroup" aria-label="微分方程答案">
                {challenge.choices.map((choice) => (
                  <label key={choice.id} className="mb-2 flex items-center gap-2 text-[13px]">
                    <input
                      type="radio"
                      name="science-ode"
                      value={choice.id}
                      checked={scienceChoice === choice.id}
                      onChange={() => setScienceChoice(choice.id)}
                    />
                    {choice.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {challenge.track === "humanities" && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold">{challenge.title}</p>
              <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">{challenge.hint}</p>
              {challenge.questions.map((question, index) => {
                const selected = humanitiesSelected.includes(question.id);
                return (
                  <fieldset key={question.id} className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] p-3">
                    <legend className="px-1 text-[12.5px] font-semibold">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setHumanitiesSelected((current) => {
                              if (current.includes(question.id)) return current.filter((id) => id !== question.id);
                              if (current.length >= 3) return current;
                              return [...current, question.id];
                            });
                          }}
                        />
                        {index + 1}. {question.prompt}
                      </label>
                    </legend>
                    {selected && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {question.choices.map((choice) => (
                          <label key={choice.id} className="flex items-center gap-2 text-[12.5px]">
                            <input
                              type="radio"
                              name={`hum-${question.id}`}
                              value={choice.id}
                              checked={humanitiesAnswers[question.id] === choice.id}
                              onChange={() => setHumanitiesAnswers((current) => ({ ...current, [question.id]: choice.id }))}
                            />
                            {choice.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                );
              })}
            </div>
          )}

          {challenge.track === "medicine" && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold">{challenge.title}</p>
              <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">{challenge.hint}</p>
              <ol className="flex flex-col gap-2">
                {medicineOrder.map((id, index) => {
                  const step = challenge.steps.find((item) => item.id === id);
                  const Svg = MEDICINE_SVGS[id];
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-3 py-2"
                    >
                      <span className="w-5 text-[12px] font-bold text-[var(--md-sys-color-primary)]">{index + 1}</span>
                      {Svg ? <Svg /> : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{step?.title}</p>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{step?.caption}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button type="button" aria-label={`上移 ${step?.title ?? id}`} disabled={index === 0} onClick={() => setMedicineOrder((current) => moveItem(current, index, -1))}>
                          ↑
                        </button>
                        <button type="button" aria-label={`下移 ${step?.title ?? id}`} disabled={index === medicineOrder.length - 1} onClick={() => setMedicineOrder((current) => moveItem(current, index, 1))}>
                          ↓
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {challenge.track === "other" && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold">{challenge.title}</p>
              <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">{challenge.hint}</p>
              {challenge.questions.map((question, index) => (
                <fieldset key={question.id} className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] p-3">
                  <legend className="px-1 text-[12.5px] font-semibold">{index + 1}. {question.prompt}</legend>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {question.choices.map((choice) => (
                      <label key={choice.id} className="flex items-center gap-2 text-[12.5px]">
                        <input
                          type="radio"
                          name={`other-${question.id}`}
                          value={choice.id}
                          checked={otherAnswers[question.id] === choice.id}
                          onChange={() => setOtherAnswers((current) => ({ ...current, [question.id]: choice.id }))}
                        />
                        {choice.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {grade && (
            <div className="mt-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] p-3" data-testid="human-challenge-reveal">
              <p className={`text-[12.5px] font-semibold ${grade.passed ? "text-[var(--md-sys-color-primary)]" : "text-[var(--md-sys-color-error)]"}`}>
                {grade.message}
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-[12px]">
                {grade.reveal.map((item) => (
                  <li key={item.id}>
                    {item.correct ? "对" : "错"}：你的答案 {item.given}；正确 {item.expected}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--md-sys-color-outline-variant)] px-5 py-3">
          <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
            {cooling ? `冷却中 ${Math.ceil(cooldown / 1000)} 秒` : "提交后显示对错"}
          </p>
          <button
            type="button"
            disabled={cooling}
            onClick={submit}
            className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
              opacity: cooling ? 0.45 : 1,
            }}
          >
            提交
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
