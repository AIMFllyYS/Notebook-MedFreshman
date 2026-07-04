"use client";

import React, { useMemo } from "react";
import { ArrowDown } from "lucide-react";

interface CauseEffectProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

interface ChainNode {
  type: "cause" | "effect" | "result";
  label: string;
  text: string;
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(element.props.children);
  }
  return "";
}

function parseChain(text: string): ChainNode[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const nodes: ChainNode[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-*]\s*/, "");
    if (cleaned.startsWith("因：") || cleaned.startsWith("原因：")) {
      nodes.push({ type: "cause", label: "因", text: cleaned.replace(/^因[：:]/, "").replace(/^原因[：:]/, "").trim() });
    } else if (cleaned.startsWith("果：") || cleaned.startsWith("结果：")) {
      nodes.push({ type: "result", label: "结果", text: cleaned.replace(/^果[：:]/, "").replace(/^结果[：:]/, "").trim() });
    } else if (cleaned.startsWith("影响：") || cleaned.startsWith("后果：")) {
      nodes.push({ type: "effect", label: "影响", text: cleaned.replace(/^影响[：:]/, "").replace(/^后果[：:]/, "").trim() });
    } else {
      nodes.push({ type: nodes.length === 0 ? "cause" : "effect", label: nodes.length === 0 ? "因" : "影响", text: cleaned });
    }
  }
  return nodes;
}

export function CauseEffect({ node, children }: CauseEffectProps) {
  const title = String(node?.properties?.title ?? node?.properties?.label ?? "因果链");
  const rawText = useMemo(() => extractText(children).trim(), [children]);
  const nodes = useMemo(() => parseChain(rawText), [rawText]);

  return (
    <div className="cause-effect history-directive">
      <div className="cause-effect-title">{title}</div>
      <div className="cause-effect-chain">
        {nodes.map((n, idx) => (
          <React.Fragment key={idx}>
            <div className={`cause-effect-node ${n.type}`}>
              <span className="cause-effect-node-label">{n.label}</span>
              <span>{n.text}</span>
            </div>
            {idx < nodes.length - 1 && (
              <div className="cause-effect-arrow">
                <ArrowDown size={18} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
