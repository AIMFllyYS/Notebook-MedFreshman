"use client";

import { useEffect } from "react";
import { useOverlayStack } from "./useOverlayStack";

interface UseOverlayRegistrationOptions {
  id: string;
  open: boolean;
  onClose: () => void;
  priority?: number;
}

/** 将浮层注册到全局 Esc 栈；open 为 true 时生效。 */
export function useOverlayRegistration({
  id,
  open,
  onClose,
  priority = 0,
}: UseOverlayRegistrationOptions): void {
  const register = useOverlayStack((s) => s.register);
  const unregister = useOverlayStack((s) => s.unregister);

  useEffect(() => {
    if (!open) {
      unregister(id);
      return;
    }
    register({ id, onClose, priority });
    return () => unregister(id);
  }, [id, open, onClose, priority, register, unregister]);
}
