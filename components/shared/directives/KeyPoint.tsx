"use client";

import React from "react";

interface KeyPointProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function KeyPoint({ node, children }: KeyPointProps) {
  const label = String(node?.properties?.label ?? node?.properties?.title ?? "核心要点");

  return (
    <div className="keypoint history-directive">
      <div className="keypoint-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}
