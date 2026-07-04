"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Users, Swords, TrendingUp } from "lucide-react";

interface EventCardProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function EventCard({ node, children }: EventCardProps) {
  const year = String(node?.properties?.year ?? "");
  const title = String(node?.properties?.title ?? "");
  const location = String(node?.properties?.location ?? "");
  const people = String(node?.properties?.people ?? "");
  const result = String(node?.properties?.result ?? "");
  const impact = String(node?.properties?.impact ?? "");
  const [open, setOpen] = useState(false);

  const hasDetails = Boolean(children);
  const fields = [
    { key: "location", label: "地点", value: location, icon: MapPin },
    { key: "people", label: "人物", value: people, icon: Users },
    { key: "result", label: "结果", value: result, icon: Swords },
    { key: "impact", label: "影响", value: impact, icon: TrendingUp },
  ].filter((f) => f.value);

  return (
    <div className="event-card history-directive">
      <div className="event-card-header">
        <div className="event-card-title-row">
          {year && <span className="event-card-year">{year}</span>}
          {title && <span className="event-card-title">{title}</span>}
        </div>
        {hasDetails && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="event-card-toggle"
            aria-expanded={open}
            aria-label={open ? "收起详情" : "展开详情"}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {fields.length > 0 && (
        <div className="event-card-grid">
          {fields.map((f) => (
            <div key={f.key} className="event-card-field">
              <span className="event-card-field-label">{f.label}</span>
              <span className="event-card-field-value">{f.value}</span>
            </div>
          ))}
        </div>
      )}
      {hasDetails && open && (
        <div className="event-card-body">{children}</div>
      )}
    </div>
  );
}
