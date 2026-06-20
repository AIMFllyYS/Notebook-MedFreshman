"use client";

import { CALLOUT_META } from "@/lib/markdown/calloutTypes";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function Callout({ node, children }: NodeProps) {
  const kind = String(node?.properties?.kind ?? "note");
  const label = String(node?.properties?.label ?? "");
  const meta = CALLOUT_META[kind] ?? CALLOUT_META.note;
  return (
    <div className={`callout ${meta.cls}`}>
      <div className="callout-label">
        {meta.label}
        {label ? ` · ${label}` : ""}
      </div>
      {children}
    </div>
  );
}
