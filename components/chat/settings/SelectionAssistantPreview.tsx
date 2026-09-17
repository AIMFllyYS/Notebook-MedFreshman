"use client";

import {
  SELECTION_ASSISTANT_ACTIONS,
  SELECTION_ASSISTANT_ACTION_LABELS,
  type SelectionAssistantAction,
  type SelectionAssistantActions,
} from "@/lib/notes/selectionAssistant";
import {
  SELECTION_ACTION_ICONS,
  SelectionPopBtn,
  SelectionPopIconBtn,
  SelectionPopoverCard,
  SelectionPopoverDivider,
} from "@/components/notes/selectionPopoverChrome";
import { labelCls } from "./_shared";

const MID_ACTIONS = ["explain", "record", "note", "ask"] as const satisfies readonly SelectionAssistantAction[];

export default function SelectionAssistantPreview({
  actions,
  enabled,
  onToggle,
}: {
  actions: SelectionAssistantActions;
  enabled: boolean;
  onToggle: (action: SelectionAssistantAction, visible: boolean) => void;
}) {
  const copyOn = actions.copy !== false;
  const quoteOn = actions.quote !== false;

  return (
    <div
      className={enabled ? "flex flex-col gap-2" : "flex flex-col gap-2 opacity-60"}
      data-testid="selection-assistant-preview"
    >
      <div className={labelCls}>划词助手展示动作</div>
      <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
        点缩小版浮条上的按钮开关动作；关掉的不会出现在真实划词助手上。
      </p>
      <div
        className="flex justify-center overflow-x-auto rounded-xl px-3 py-4"
        style={{
          background: "var(--md-sys-color-surface-container-lowest)",
          border: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <div className="origin-center scale-[0.86]">
          <SelectionPopoverCard>
            <SelectionPopIconBtn
              onClick={() => onToggle("copy", !copyOn)}
              icon={SELECTION_ACTION_ICONS.copy}
              title={SELECTION_ASSISTANT_ACTION_LABELS.copy}
              active={copyOn}
              disabled={!enabled}
              testId="selection-action-copy"
            />
            <SelectionPopoverDivider />
            {MID_ACTIONS.map((action) => (
              <SelectionPopBtn
                key={action}
                onClick={() => onToggle(action, actions[action] === false)}
                icon={SELECTION_ACTION_ICONS[action]}
                label={SELECTION_ASSISTANT_ACTION_LABELS[action]}
                active={actions[action] !== false}
                disabled={!enabled}
                testId={`selection-action-${action}`}
              />
            ))}
            <SelectionPopoverDivider />
            <SelectionPopBtn
              onClick={() => onToggle("quote", !quoteOn)}
              icon={SELECTION_ACTION_ICONS.quote}
              label={SELECTION_ASSISTANT_ACTION_LABELS.quote}
              active={quoteOn}
              disabled={!enabled}
              testId="selection-action-quote"
            />
          </SelectionPopoverCard>
        </div>
      </div>
      <p className="text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
        {enabled
          ? `当前显示 ${SELECTION_ASSISTANT_ACTIONS.filter((action) => actions[action] !== false).length} / ${SELECTION_ASSISTANT_ACTIONS.length} 个动作`
          : "总开关关闭时，划词不会弹出本站动作条"}
      </p>
    </div>
  );
}
