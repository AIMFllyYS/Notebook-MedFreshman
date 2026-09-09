"use client";

import { Type } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { h3Cls } from "./_shared";

export function AppearanceSection() {
  const fontScale = useSettings((s) => s.fontScale);
  const setFontScale = useSettings((s) => s.setFontScale);

  return (
    <section className="flex flex-col gap-2">
      <h3 className={h3Cls}>外观</h3>
      <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
        <Type size={14} />
        <span className="text-[12.5px]">对话字体大小</span>
        <span className="ml-auto text-[12px] font-medium text-[var(--md-sys-color-primary)]">
          {Math.round(fontScale * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0.85}
        max={1.35}
        step={0.05}
        value={fontScale}
        onChange={(e) => setFontScale(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--md-sys-color-primary)" }}
      />
      <div
        className="rounded-lg bg-[var(--md-sys-color-surface-container)] px-3 py-2 text-[var(--md-sys-color-on-surface)]"
        style={{ fontSize: `${13 * fontScale}px`, lineHeight: 1.6 }}
      >
        预览：这段文字的字号会随上面的滑块实时变化，对话区的回答也会同步缩放。
      </div>
    </section>
  );
}
