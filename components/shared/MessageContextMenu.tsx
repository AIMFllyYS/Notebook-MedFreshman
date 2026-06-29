"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Copy, Quote, MessageSquare, BookmarkPlus } from "lucide-react";
import { useContextMenu } from "@/lib/hooks/useContextMenu";
import { useChatUI } from "@/lib/hooks/useChatUI";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";
import { useStore } from "@/lib/store";
import { startRecord } from "@/lib/review/startRecord";
import { currentRecordContext } from "@/lib/review/recordContext";
import { copyTextToClipboard } from "@/lib/clipboard/copyText";

const MENU_W = 168;

// 全站消息右键菜单。挂在 AppShell（桌面+移动），portal 到 body。
export default function MessageContextMenu() {
  const open = useContextMenu((s) => s.open);
  const x = useContextMenu((s) => s.x);
  const y = useContextMenu((s) => s.y);
  const text = useContextMenu((s) => s.text);
  const subjectOverride = useContextMenu((s) => s.subjectOverride);
  const closeMenu = useContextMenu((s) => s.closeMenu);

  useEffect(() => {
    if (!open) return;
    const onDown = () => closeMenu();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    // 捕获阶段监听：点菜单内的按钮由 onClick 先执行，再冒泡到这里关闭
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onDown, true);
    window.addEventListener("resize", onDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onDown, true);
      window.removeEventListener("resize", onDown);
    };
  }, [open, closeMenu]);

  if (!open) return null;

  const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1440) - MENU_W - 8);
  const top = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 900) - 196);

  function handleCopy() {
    void copyTextToClipboard(text);
    closeMenu();
  }
  function handleQuote() {
    useChatUI.getState().setQuotedText(text);
    useStore.getState().setRightTab("ai");
    closeMenu();
  }
  function handleAsk() {
    useFloatingChats.getState().openWindow({ anchor: { x, y }, seedMode: "ask", seedText: text });
    closeMenu();
  }
  function handleRecord() {
    startRecord(text, currentRecordContext(subjectOverride), { x, y });
    closeMenu();
  }

  return createPortal(
    <div
      // 阻止菜单自身的 pointerdown 冒泡到 window 的关闭监听之前先触发按钮 onClick
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left,
        top,
        width: MENU_W,
        zIndex: 10000,
        background: "var(--md-sys-color-surface-container-low)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        borderRadius: 12,
        boxShadow: "0 10px 30px -8px rgba(0,0,0,0.3)",
        padding: 5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      className="animate-fade-up"
    >
      <Item onClick={handleCopy} icon={Copy} label="复制" />
      <Item onClick={handleQuote} icon={Quote} label="引用到对话" />
      <Item onClick={handleAsk} icon={MessageSquare} label="追问" />
      <div style={{ height: 1, margin: "3px 6px", background: "var(--md-sys-color-outline-variant)" }} />
      <Item onClick={handleRecord} icon={BookmarkPlus} label="记录到复习板" accent />
    </div>,
    document.body,
  );
}

function Item({
  onClick,
  icon: Icon,
  label,
  accent,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="press"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        width: "100%",
        padding: "7px 10px",
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: accent ? "var(--accent)" : "var(--ink)",
        fontSize: 13,
        fontWeight: accent ? 600 : 500,
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--md-sys-color-secondary-container)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
