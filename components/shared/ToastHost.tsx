"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { scaleInVariants } from "@/lib/motion";
import { useToast } from "@/lib/stores/toast";

/** 全局轻量 toast。挂在 AppShell，几秒后自动关，不挡阅读。 */
export default function ToastHost() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="app-toast-host" aria-live="polite" aria-relevant="additions">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            data-testid="app-toast"
            className="app-toast"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => dismiss(toast.id)}
          >
            <Check size={14} strokeWidth={2.4} aria-hidden />
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
