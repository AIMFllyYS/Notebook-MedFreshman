"use client";

import React from "react";

interface CompareTableProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function CompareTable({ node, children }: CompareTableProps) {
  const title = String(node?.properties?.title ?? node?.properties?.label ?? "");

  return (
    <div className="compare-table history-directive">
      {title && <div className="compare-table-header">{title}</div>}
      <div className="compare-table-content">{children}</div>
    </div>
  );
}
