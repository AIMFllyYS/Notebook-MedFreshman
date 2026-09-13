"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SettingsDisclosureProps {
  expanded: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}

/** Shared top-level disclosure used by the model configuration workspace. */
export default function SettingsDisclosure({
  expanded,
  onToggle,
  icon,
  title,
  meta,
  children,
}: SettingsDisclosureProps) {
  return (
    <section className="settings-disclosure">
      <button
        type="button"
        className="settings-disclosure-trigger"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="settings-disclosure-icon" aria-hidden>{icon}</span>
        <span className="settings-disclosure-label">
          <strong>{title}</strong>
          {meta ? <small>{meta}</small> : null}
        </span>
        <ChevronDown size={14} className="settings-disclosure-chevron" aria-hidden />
      </button>
      {expanded ? <div className="settings-disclosure-content">{children}</div> : null}
    </section>
  );
}
