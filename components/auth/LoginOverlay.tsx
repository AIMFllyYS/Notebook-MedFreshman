"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/stores/ui";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import LoginForm from "./LoginForm";

export default function LoginOverlay() {
  const open = useStore((s) => s.loginOverlayOpen);
  const openLoginOverlay = useStore((s) => s.openLoginOverlay);
  const closeLoginOverlay = useStore((s) => s.closeLoginOverlay);
  const { needsNewPassword } = useAuthSession();
  const onClose = useCallback(() => closeLoginOverlay(), [closeLoginOverlay]);

  useEffect(() => {
    if (needsNewPassword) openLoginOverlay();
  }, [needsNewPassword, openLoginOverlay]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="login-overlay"
      data-testid="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="login-dialog" role="dialog" aria-modal="true" aria-label="登录 StudySolo">
        <LoginForm onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
