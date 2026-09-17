"use client";

import { AgentCloseIcon, AgentFileIcon } from "@/components/icons/AgentIcons";
import {
  COMPOSER_PLAN_LABEL,
  FORCED_TOOL_LABELS,
  isForcedComposerTool,
  type AttachedFileRef,
  type ComposerForcedTool,
} from "@/lib/chat/composerIntent";
import { ForcedToolIcon, PlanModeIcon } from "./ComposerIcons";

export default function ComposerChips({
  planMode,
  forcedTool,
  forcedSkillName,
  attachedFiles,
  onClearPlan,
  onClearTool,
  onRemoveFile,
}: {
  planMode: boolean;
  forcedTool?: ComposerForcedTool;
  forcedSkillName?: string;
  attachedFiles: AttachedFileRef[];
  onClearPlan: () => void;
  onClearTool: () => void;
  onRemoveFile: (path: string) => void;
}) {
  if (!planMode && !forcedTool && attachedFiles.length === 0) return null;
  return (
    <div className="composer-chips" data-testid="composer-chips">
      {planMode ? (
        <span className="composer-chip composer-chip-plan" data-testid="composer-chip-plan">
          <PlanModeIcon />
          <span>{COMPOSER_PLAN_LABEL}</span>
          <button type="button" aria-label="关闭计划模式" onClick={onClearPlan}>
            <AgentCloseIcon size={12} />
          </button>
        </span>
      ) : null}
      {forcedTool ? (
        <span className="composer-chip composer-chip-tool" data-testid="composer-chip-tool">
          {isForcedComposerTool(forcedTool) ? <ForcedToolIcon tool={forcedTool} /> : null}
          <span>
            {isForcedComposerTool(forcedTool) ? FORCED_TOOL_LABELS[forcedTool] : (forcedSkillName || "技能")}
          </span>
          <button type="button" aria-label="取消指定工具" onClick={onClearTool}>
            <AgentCloseIcon size={12} />
          </button>
        </span>
      ) : null}
      {attachedFiles.map((file) => (
        <span key={file.path} className="composer-chip composer-chip-file" data-testid="composer-chip-file" title={file.address}>
          <AgentFileIcon size={14} />
          <span>{file.title}</span>
          <button type="button" aria-label={`移除 ${file.title}`} onClick={() => onRemoveFile(file.path)}>
            <AgentCloseIcon size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
