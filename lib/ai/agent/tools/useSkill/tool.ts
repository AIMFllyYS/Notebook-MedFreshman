import { tool } from "ai";
import { z } from "zod";
import type { UseSkillOutput } from "@/lib/ai/agent/tools/useSkill/types";
import {
  dedupeByContextKey,
  menuSkillNamesOf,
  normalizeContextKeyPart,
  toText,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";

export function createUseSkillTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  const menuSkillNames = menuSkillNamesOf(ctx.skills);
  return tool({
    description:
      "调用一个用户上传的「技能」，把它的完整内容加载到上下文作为专门指导。当用户的问题与某技能的名称/描述相关时调用；可用技能见系统提示词中的「可调用的技能库」清单。一次只调用最相关的一个技能，同一技能不要重复调用。",
    inputSchema: z.object({
      name: (menuSkillNames.length > 0
        ? z.enum(menuSkillNames as [string, ...string[]])
        : z.string()
      ).describe("要调用的技能名称，必须与技能库清单中的名称完全一致。"),
    }),
    execute: async ({ name }): Promise<UseSkillOutput> => {
      const wanted = String(name ?? "").trim();
      const list = ctx.skills;
      const skill =
        list.find((s) => s.name === wanted) ??
        list.find((s) => s.name.toLowerCase() === wanted.toLowerCase());
      if (!skill) {
        const available = list.map((s) => s.name).join("、") || "（无）";
        return { text: `未找到名为「${wanted}」的技能。可用技能：${available}。`, skill: wanted, found: false };
      }
      const head = skill.description ? `${skill.description}\n\n` : "";
      return dedupeByContextKey(runtime, "useSkill", {
        text: `【技能：${skill.name}】\n${head}${skill.content}`,
        contextKey: `skill:${skill.id || normalizeContextKeyPart(skill.name)}`,
        skill: skill.name,
        found: true,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
