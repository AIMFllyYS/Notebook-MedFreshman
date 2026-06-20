"use client";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function Derivation({ node, children }: NodeProps) {
  const label = String(node?.properties?.label ?? "推导过程");
  return (
    <details className="derivation">
      <summary>{label}</summary>
      <div className="derivation-body">{children}</div>
    </details>
  );
}
