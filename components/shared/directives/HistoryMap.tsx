"use client";

import React, { useMemo } from "react";
import { MapPin } from "lucide-react";

interface HistoryMapProps {
  node?: { properties?: Record<string, unknown> };
}

interface MapPoint {
  name: string;
  x: number;
  y: number;
}

function parsePoints(value: string): MapPoint[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, xStr, yStr] = part.split(":");
      const x = parseFloat(xStr ?? "0");
      const y = parseFloat(yStr ?? "0");
      return { name: name?.trim() ?? "", x: Number.isNaN(x) ? 50 : x, y: Number.isNaN(y) ? 50 : y };
    });
}

export function HistoryMap({ node }: HistoryMapProps) {
  const title = String(node?.properties?.title ?? node?.properties?.label ?? "历史地图");
  const pointsRaw = String(node?.properties?.points ?? "");
  const caption = String(node?.properties?.caption ?? "");
  const points = useMemo(() => parsePoints(pointsRaw), [pointsRaw]);

  return (
    <div className="history-map history-directive">
      <div className="history-map-header">
        <MapPin size={16} />
        {title}
      </div>
      <div className="history-map-canvas">
        {points.map((p, idx) => (
          <div
            key={idx}
            className="history-map-point"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={p.name}
          >
            <span className="history-map-dot" />
            <span className="history-map-label">{p.name}</span>
          </div>
        ))}
      </div>
      {caption && <div className="history-map-caption">{caption}</div>}
    </div>
  );
}
