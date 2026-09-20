/** 无结果卡片。有 UI 时放 `components/chat/toolCards/useSkillCard.tsx`。 */
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  labelKey: "trace.tool.useSkill.label",
  settingsLabelKey: "trace.tool.useSkill.settingsLabel",
  descriptionKey: "trace.tool.useSkill.description",
  icon: "skill",
  toggleable: false,
};
