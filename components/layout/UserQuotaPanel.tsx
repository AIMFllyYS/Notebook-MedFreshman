"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Gauge, X } from "lucide-react";
import { AccountQuota } from "@/components/chat/AccountQuota";
import { StorageQuotaBlock } from "@/components/chat/StorageQuota";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

function computePos(anchor: HTMLElement | null) {
  const gap = 8;
  const margin = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const width = Math.min(360, vw - margin * 2);
  if (!anchor) {
    return { left: margin, bottom: 48, width, maxHeight: vh - 64 };
  }
  const r = anchor.getBoundingClientRect();
  let left = r.left;
  if (left + width > vw - margin) left = vw - margin - width;
  if (left < margin) left = margin;
  return {
    left,
    bottom: Math.max(margin, vh - r.top + gap),
    width,
    maxHeight: Math.max(160, r.top - gap - margin),
  };
}

export default function UserQuotaPanel({
  anchorRef,
  onClose,
}: {
  anchorRef: { readonly current: HTMLElement | null };
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => computePos(null));

  useLayoutEffect(() => {
    const place = () => setPos(computePos(anchorRef.current));
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchorRef]);

  useOverlayRegistration({
    id: "user-quota-panel",
    open: true,
    onClose,
    priority: 72,
  });

  useLayoutEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (panelRef.current?.contains(event.target as Node) || anchorRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [anchorRef, onClose]);

  return createPortal(
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="额度"
      data-testid="user-quota-panel"
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.05, 0.7, 0.1, 1] }}
      className="fixed z-[9998] flex flex-col overflow-hidden rounded-[var(--md-sys-shape-corner-extra-large,28px)]"
      style={{
        left: pos.left,
        bottom: pos.bottom,
        width: pos.width,
        maxHeight: pos.maxHeight,
        transformOrigin: "left bottom",
        background: "var(--md-sys-color-surface-container-low)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        boxShadow: "var(--md-sys-elevation-level3, 0 8px 24px rgba(0,0,0,0.32))",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3.5"
        style={{
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          background: "var(--md-sys-color-surface-container)",
        }}
      >
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-[var(--md-sys-color-primary)]" />
          <span className="text-[14px] font-bold text-[var(--md-sys-color-on-surface)]">额度</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
          title="关闭"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <AccountQuota variant="panel" />
        <div>
          <div className="mb-1.5 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">存储额度</div>
          <StorageQuotaBlock />
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
