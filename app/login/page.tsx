"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="login-overlay"
      data-testid="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) router.push("/");
      }}
    >
      <div className="login-dialog" role="dialog" aria-modal="true" aria-label="登录 StudySolo">
        <LoginForm onClose={() => router.push("/")} />
      </div>
    </div>,
    document.body,
  );
}
