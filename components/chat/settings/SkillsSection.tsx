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
        上传单个 <BookText size={11} className="inline align-text-bottom" /> .md 文件作为「技能」。AI 会根据名称与描述按需调用其完整内容；
        打开右侧开关可将该技能「固定开启」（每轮强制注入）。
      </p>
      <SkillsManager />
    </section>
  );
}
