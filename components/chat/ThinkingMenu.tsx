"use client";

import { AgentCheckIcon, AgentLoopIcon } from "@/components/icons/AgentIcons";
import type { ThinkingEffort } from "@/lib/hooks/useSettings";
import AnchoredMenu from "@/components/ui/AnchoredMenu";

export const THINKING_EFFORT_OPTIONS: { value: ThinkingEffort; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "轻量推理 · 更快更省" },
  { value: "medium", label: "Med", hint: "平衡（多数任务默认）" },
  { value: "high", label: "High", hint: "加强推理 · 复杂题" },
  { value: "max", label: "Max", hint: "最深思考 · 最贵" },
];

export interface ThinkingMenuButtonProps {
  enabled: boolean;
  effort: ThinkingEffort;
  onChange: (next: { enabled: boolean; effort: ThinkingEffort }) => void;
  supported: boolean;
  disabled?: boolean;
  levels?: ThinkingEffort[];
  allowOff?: boolean;
}

/** Wide toolbar and compact overflow share the same capability-aware choices. */
export function ThinkingMenuItems({ enabled, effort, onChange, levels, allowOff = true, disabled }: ThinkingMenuButtonProps) {
  const options = THINKING_EFFORT_OPTIONS.filter((option) => !levels || levels.includes(option.value));
  const choices = [
    ...(allowOff ? [{ id: "off", label: "关闭", hint: "不启用推理链，直接回答", active: !enabled, next: { enabled: false, effort } }] : []),
    ...(options.length ? options.map((option) => ({ id: option.value, label: option.label, hint: option.hint,
      active: enabled && effort === option.value, next: { enabled: true, effort: option.value } }))
      : [{ id: "on", label: "开启", hint: "启用推理链，不区分强度档位", active: enabled, next: { enabled: true, effort } }]),
  ];
  return <div role="group" aria-label="深度思考">
    <div className="app-menu-heading">深度思考{!allowOff && <span> · 当前模型必须开启</span>}</div>
    {choices.map((choice) => <button key={choice.id} type="button" role="menuitemradio" aria-checked={choice.active}
      disabled={disabled} className="app-menu-item" data-testid={`thinking-menu-option-${choice.id}`} onClick={() => onChange(choice.next)}>
      <span className="app-menu-check">{choice.active && <AgentCheckIcon size={12} />}</span>
      <span><span>{choice.label}</span><small>{choice.hint}</small></span>
    </button>)}
  </div>;
}

export default function ThinkingMenuButton(props: ThinkingMenuButtonProps) {
  const options = THINKING_EFFORT_OPTIONS.filter((option) => !props.levels || props.levels.includes(option.value));
  const current = options.find((option) => option.value === props.effort) ?? options[0];
  const activeLabel = props.enabled ? (current?.label ?? "开") : null;
  return <AnchoredMenu label="深度思考" disabled={props.disabled || !props.supported} placement="top" width={240}
    testId="thinking-menu-button" triggerData={{ "data-enabled": props.enabled && props.supported ? "1" : "0", "data-effort": activeLabel ? props.effort : "" }}
    className={`chat-input-toggle chat-input-toggle-thinking ${props.enabled ? "chat-input-toggle-thinking-active" : ""}`}
    trigger={<><AgentLoopIcon size={12} /><span className="chat-input-toggle-text">{activeLabel ? `深度思考·${activeLabel}` : "深度思考"}</span></>}>
    {(close) => <ThinkingMenuItems {...props} onChange={(next) => { props.onChange(next); close(); }} />}
  </AnchoredMenu>;
}
