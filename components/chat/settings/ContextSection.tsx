"use client";

import { Globe } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { h3Cls, inputCls } from "./_shared";

export function ContextSection() {
  const globalContext = useSettings((s) => s.globalContext);
  const setGlobalContext = useSettings((s) => s.setGlobalContext);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Globe size={14} className="text-[var(--md-sys-color-primary)]" />
        <h3 className={h3Cls}>全局补充上下文</h3>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        这里的文字会注入每次对话的系统提示词（拼入稳定前缀，利于缓存）。适合放通用背景、称呼、风格偏好等。
      </p>
      <textarea
        value={globalContext}
        onChange={(e) => setGlobalContext(e.target.value)}
        placeholder="例如：请用简洁的中文回答，公式用 KaTeX，回答末尾附一句要点总结。"
        rows={4}
        className={inputCls + " resize-y leading-relaxed"}
      />
      <div className="self-end text-[10.5px] text-[var(--md-sys-color-on-surface-variant)]">
        {globalContext.length} 字
      </div>
    </section>
  );
}
