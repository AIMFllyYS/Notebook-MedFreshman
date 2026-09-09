import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";

export const presentation: ToolPresentation = {
  label: "调用技能",
  settingsLabel: "技能",
  description: "随技能库启用",
  icon: "skill",
  toggleable: false,
};
