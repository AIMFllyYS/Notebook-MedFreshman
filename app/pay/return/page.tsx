"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

type OrderState =
  | "checking"
  | "waiting"
  | "success"
  | "pending"
  | "failed"
  | "missing"
  | "notFound"
  | "unauthorized";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

/**
 * Creem 支付成功后的回跳页。订单终态靠轮询 /api/pay/status 拿（webhook 是异步的），
 * ~30s 内 paid 即成功，failed/cancelled 即失败，超时按「确认中」展示。
 */
function PayReturnBody() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("order")?.trim() ?? "";
  const [state, setState] = useState<OrderState>(orderId ? "checking" : "missing");
  const [tier, setTier] = useState<string>("");

  useEffect(() => {
    if (!orderId) return;
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let cancelled = false;
    const poll = async () => {
      while (!cancelled && Date.now() < deadline) {
        try {
          const res = await fetch(`/api/pay/status?order=${encodeURIComponent(orderId)}`, {
            cache: "no-store",
          });
          if (res.status === 401) {
            if (!cancelled) setState("unauthorized");
            return;
          }
          if (res.status === 404) {
            if (!cancelled) setState("notFound");
            return;
          }
          const data = (await res.json().catch(() => ({}))) as {
            status?: string;
            fulfilled?: boolean;
            tier?: string;
          };
          if (cancelled) return;
          if (data.status === "paid") {
            setTier(typeof data.tier === "string" ? data.tier : "");
            setState(data.fulfilled ? "success" : "pending");
            if (data.fulfilled) return;
          } else if (data.status === "failed" || data.status === "cancelled" || data.status === "refunded") {
            setState("failed");
            return;
          } else {
            setState("waiting");
          }
        } catch {
          if (!cancelled) setState("waiting");
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      if (!cancelled) setState((s) => (s === "success" || s === "failed" ? s : "pending"));
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const tierLabel = tier ? t(`panel.quota.tier.${tier}`) : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] px-6 py-8 text-center">
        <h1 className="text-[15px] font-semibold text-[var(--ink)]">{t("panel.membership.payReturn.title")}</h1>
        <div className="mt-5 flex flex-col items-center gap-3">
          {(state === "checking" || state === "waiting" || state === "pending") && (
            <LoaderCircle size={34} className="animate-spin text-[var(--md-sys-color-primary)]" />
          )}
          {state === "success" && <CircleCheck size={34} className="text-[var(--md-sys-color-primary)]" />}
          {(state === "failed" || state === "missing" || state === "notFound" || state === "unauthorized") && (
            <CircleX size={34} className="text-[var(--md-sys-color-error)]" />
          )}
          <p className="text-[13px] font-medium text-[var(--ink)]">
            {state === "checking" && t("panel.membership.payReturn.checking")}
            {state === "waiting" && t("panel.membership.payReturn.waiting")}
            {state === "pending" && t("panel.membership.payReturn.pending")}
            {state === "success" && t("panel.membership.payReturn.success")}
            {state === "failed" && t("panel.membership.payReturn.failed")}
            {state === "missing" && t("panel.membership.payReturn.missing")}
            {state === "notFound" && t("panel.membership.payReturn.notFound")}
            {state === "unauthorized" && t("panel.membership.payReturn.signInRequired")}
          </p>
          {state === "success" && (
            <p className="text-[12px] text-[var(--ink-soft)]">
              {t("panel.membership.payReturn.successDesc", { tier: tierLabel })}
            </p>
          )}
          {state === "pending" && (
            <p className="text-[12px] text-[var(--ink-soft)]">{t("panel.membership.payReturn.pendingDesc")}</p>
          )}
          {state === "failed" && (
            <p className="text-[12px] text-[var(--ink-soft)]">{t("panel.membership.payReturn.failedDesc")}</p>
          )}
          {state !== "checking" && state !== "waiting" && (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-2 rounded-lg bg-[var(--md-sys-color-primary)] px-4 py-1.5 text-[12.5px] font-semibold text-white"
            >
              {t("panel.membership.payReturn.backHome")}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PayReturnPage() {
  return (
    <Suspense>
      <PayReturnBody />
    </Suspense>
  );
}
