"use client";

import React, { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";

interface ConceptCardProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function ConceptCard({ node, children }: ConceptCardProps) {
  const term = String(node?.properties?.term ?? "");
  const [open, setOpen] = useState(false);

  if (!term) return <div className="concept-card">{children}</div>;

  return (
    <div className="concept-card history-directive">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="concept-card-header"
        aria-expanded={open}
      >
        <span className="concept-card-icon">
          <BookOpen size={16} />
        </span>
        <span className="concept-card-term">{term}</span>
        <span className="concept-card-hint">{open ? "点击收起" : "点击展开"}</span>
        <ChevronRight
          size={16}
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }}
          color="var(--ink-faint)"
        />
      </button>
      {open && <div className="concept-card-body">{children}</div>}
    </div>
  );
}
