"use client";

import { BookText } from "lucide-react";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import SkillsManager from "../SkillsManager";
import { h3Cls } from "./_shared";

export function SkillsSection() {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <PencilSparklesIcon size={14} className="text-[var(--md-sys-color-primary)]" />
        <h3 className={h3Cls}>技能库（Skills）</h3>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        导入 <BookText size={11} className="inline align-text-bottom" /> 单个 .md、ZIP 或 .skill 包（对齐 Agent skills：优先 SKILL.md）。
        AI 按名称与描述按需调用全文；打开右侧开关可将该技能「固定开启」（每轮强制注入）。
      </p>
      <SkillsManager />
    </section>
  );
}
