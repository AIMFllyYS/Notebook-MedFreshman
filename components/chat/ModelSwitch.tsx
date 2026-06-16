"use client";

import clsx from "clsx";
import { useStore, type ModelTier } from "@/lib/store";

const LABELS: Record<ModelTier, { name: string; hint: string }> = {
  pro: { name: "V4 Pro", hint: "深度推理（带思考）" },
  flash: { name: "V4 Flash", hint: "快速回答" },
};

export default function ModelSwitch() {
  const model = useStore((s) => s.model);
  const setModel = useStore((s) => s.setModel);
  return (
    <div className="inline-flex rounded-lg bg-[var(--bg-muted)] p-0.5 text-[12.5px] font-medium">
      {(["pro", "flash"] as ModelTier[]).map((m) => (
        <button
          key={m}
          onClick={() => setModel(m)}
          title={LABELS[m].hint}
          className={clsx(
            "rounded-md px-2.5 py-1 transition-colors",
            model === m
              ? "bg-white text-[var(--accent-ink)] shadow-sm"
              : "text-[var(--ink-faint)] hover:text-[var(--ink-soft)]",
          )}
        >
          {LABELS[m].name}
        </button>
      ))}
    </div>
  );
}
