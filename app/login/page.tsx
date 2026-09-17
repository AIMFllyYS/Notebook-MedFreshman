"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const goHome = () => router.push("/");

  return (
    <div
      className="login-overlay"
      data-testid="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) goHome();
      }}
    >
      <div className="login-dialog" role="dialog" aria-modal="true" aria-label="登录 StudySolo">
        <LoginForm onClose={goHome} />
      </div>
    </div>
  );
}
