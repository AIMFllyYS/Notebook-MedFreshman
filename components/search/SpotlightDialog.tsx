"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n";
import {
  SPOTLIGHT_BACKDROP_CLASS,
  SPOTLIGHT_CLOSE_CLASS,
  SPOTLIGHT_HEADER_CLASS,
  SPOTLIGHT_PANEL_CLASS,
} from "@/components/search/spotlightChrome";

interface SpotlightDialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  icon: ReactNode;
  input: ReactNode;
  children?: ReactNode;
}

export default function SpotlightDialog({
  open,
  onClose,
  label,
  icon,
  input,
  children,
}: SpotlightDialogProps) {
  const t = useT();
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className={SPOTLIGHT_BACKDROP_CLASS}
      onPointerDown={(event) => {
        if ((event.target as Element | null)?.closest?.(".app-menu")) return;
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={SPOTLIGHT_PANEL_CLASS}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={SPOTLIGHT_HEADER_CLASS}>
          {icon}
          {input}
          <button
            type="button"
            onClick={onClose}
            title={t("panel.common.close")}
            aria-label={t("panel.common.close")}
            className={SPOTLIGHT_CLOSE_CLASS}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
