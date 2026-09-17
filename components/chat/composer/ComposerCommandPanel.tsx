"use client";

import type { Skill } from "@/lib/types/skill";
import {
  FORCED_COMPOSER_TOOLS,
  FORCED_TOOL_LABELS,
  type ComposerForcedTool,
  type ForcedComposerTool,
  skillForcedTool,
} from "@/lib/chat/composerIntent";
import { ForcedToolIcon, PlanModeIcon, SkillIcon } from "./ComposerIcons";

export type ComposerCommandId = "plan" | ComposerForcedTool;

export interface ComposerCommandPanelProps {
  planMode: boolean;
  planAllowed: boolean;
  forcedTool?: ComposerForcedTool;
  skills: Skill[];
  query?: string;
  activeIndex?: number;
  onSelectPlan: () => void;
  onSelectTool: (tool: ForcedComposerTool) => void;
  onSelectSkill: (skill: Skill) => void;
}

export function listComposerCommands(input: {
  planAllowed: boolean;
  skills: Skill[];
  query?: string;
}): Array<{ id: ComposerCommandId; kind: "plan" | "tool" | "skill"; skill?: Skill }> {
  const query = input.query?.trim().toLowerCase() ?? "";
  const match = (label: string) => !query || label.toLowerCase().includes(query);
  const items: Array<{ id: ComposerCommandId; kind: "plan" | "tool" | "skill"; skill?: Skill }> = [];
  if (input.planAllowed && match("计划模式")) items.push({ id: "plan", kind: "plan" });
  for (const tool of FORCED_COMPOSER_TOOLS) {
    if (match(FORCED_TOOL_LABELS[tool]) || match(tool)) items.push({ id: tool, kind: "tool" });
  }
  for (const skill of input.skills) {
    if (match(skill.name) || match(skill.description)) {
      items.push({ id: skillForcedTool(skill.id), kind: "skill", skill });
    }
  }
  return items;
}

export default function ComposerCommandPanel({
  planMode,
  planAllowed,
  forcedTool,
  skills,
  query,
  activeIndex = 0,
  onSelectPlan,
  onSelectTool,
  onSelectSkill,
}: ComposerCommandPanelProps) {
  const items = listComposerCommands({ planAllowed, skills, query });
  const showPlan = items.some((item) => item.kind === "plan");
  const tools = items.filter((item) => item.kind === "tool");
  const skillItems = items.filter((item) => item.kind === "skill");
  const selectedId = items[activeIndex]?.id;

  return (
    <div className="composer-command-panel" data-testid="composer-command-panel" role="listbox" aria-label="对话命令">
      {showPlan && (
        <button
          type="button"
          role="option"
          aria-selected={selectedId === "plan"}
          className="app-menu-item"
          onClick={onSelectPlan}
        >
          <span className="app-menu-check"><PlanModeIcon /></span>
          <span>计划模式</span>
          {planMode ? <span className="composer-command-on">已开</span> : null}
        </button>
      )}
      {showPlan && tools.length > 0 ? <div className="app-menu-separator" /> : null}
      {tools.length > 0 ? <div className="app-menu-heading">特定工具</div> : null}
      {tools.map((item) => {
        const tool = item.id as ForcedComposerTool;
        return (
          <button
            key={tool}
            type="button"
            role="option"
            aria-selected={selectedId === tool}
            className="app-menu-item"
            onClick={() => onSelectTool(tool)}
          >
            <span className="app-menu-check"><ForcedToolIcon tool={tool} /></span>
            <span>{FORCED_TOOL_LABELS[tool]}</span>
            {forcedTool === tool ? <span className="composer-command-on">已选</span> : null}
          </button>
        );
      })}
      {skillItems.length > 0 ? <div className="app-menu-separator" /> : null}
      {skillItems.length > 0 ? <div className="app-menu-heading">已导入 Skills</div> : null}
      {skillItems.map((item) => (
        <button
          key={item.skill!.id}
          type="button"
          role="option"
          aria-selected={selectedId === skillForcedTool(item.skill!.id)}
          className="app-menu-item"
          onClick={() => onSelectSkill(item.skill!)}
        >
          <span className="app-menu-check"><SkillIcon /></span>
          <span>{item.skill!.name}</span>
          {forcedTool === skillForcedTool(item.skill!.id) ? <span className="composer-command-on">已选</span> : null}
        </button>
      ))}
      {items.length === 0 ? <div className="app-menu-heading">没有匹配的命令</div> : null}
    </div>
  );
}
