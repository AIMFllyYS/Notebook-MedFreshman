"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import Message, { type ChatMsg } from "./Message";
import ModelSwitch from "./ModelSwitch";

let counter = 0;
const newId = () => `m${++counter}`;

const SUGGESTIONS = [
  "讲讲当前这一节的核心思想",
  "这一节和前一节有什么联系？",
  "围绕本节知识点出两道例题并讲解",
];

export default function ChatPanel() {
  const model = useStore((s) => s.model);
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);
  const outbound = useStore((s) => s.outbound);
  const clearOutbound = useStore((s) => s.clearOutbound);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const messagesRef = useRef<ChatMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const flushScheduled = useRef(false);
  const lastNonce = useRef(0);

  const commit = useCallback(() => {
    if (flushScheduled.current) return;
    flushScheduled.current = true;
    requestAnimationFrame(() => {
      flushScheduled.current = false;
      setMessages(messagesRef.current.slice());
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const patchAi = useCallback(
    (id: string, producer: (m: ChatMsg) => Partial<ChatMsg>) => {
      const arr = messagesRef.current;
      const idx = arr.findIndex((m) => m.id === id);
      if (idx < 0) return;
      arr[idx] = { ...arr[idx], ...producer(arr[idx]) };
    },
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setBusy(true);

      const userMsg: ChatMsg = { id: newId(), role: "user", content, tools: [] };
      const aiId = newId();
      const aiMsg: ChatMsg = {
        id: aiId,
        role: "assistant",
        content: "",
        reasoning: "",
        tools: [],
        streaming: true,
      };
      messagesRef.current = [...messagesRef.current, userMsg, aiMsg];
      setMessages(messagesRef.current.slice());
      setInput("");
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });

      const history = messagesRef.current
        .filter((m) => m.id !== aiId)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, model, chapterId, sectionId }),
        });
        if (!res.body) throw new Error("无响应流");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            let ev: any;
            try {
              ev = JSON.parse(data);
            } catch {
              continue;
            }
            if (ev.type === "reasoning") {
              patchAi(aiId, (m) => ({ reasoning: (m.reasoning ?? "") + ev.delta }));
              commit();
            } else if (ev.type === "content") {
              patchAi(aiId, (m) => ({ content: m.content + ev.delta }));
              commit();
            } else if (ev.type === "tool") {
              patchAi(aiId, (m) => {
                if (ev.status === "call") {
                  return { tools: [...m.tools, { id: ev.id, name: ev.name, args: ev.args, status: "call" }] };
                }
                return {
                  tools: m.tools.map((t) => (t.id === ev.id ? { ...t, status: "result" } : t)),
                };
              });
              commit();
            } else if (ev.type === "error") {
              patchAi(aiId, () => ({ error: ev.message }));
              commit();
            } else if (ev.type === "done") {
              patchAi(aiId, () => ({ streaming: false }));
              commit();
            }
          }
        }
        patchAi(aiId, () => ({ streaming: false }));
        setMessages(messagesRef.current.slice());

        // 举一反三追问
        const ai = messagesRef.current.find((m) => m.id === aiId);
        if (ai && ai.content && !ai.error) {
          fetch("/api/follow-ups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
            }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (Array.isArray(d.questions) && d.questions.length) {
                patchAi(aiId, () => ({ followUps: d.questions }));
                setMessages(messagesRef.current.slice());
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        patchAi(aiId, () => ({ streaming: false, error: String((e as Error)?.message ?? e) }));
        setMessages(messagesRef.current.slice());
      } finally {
        setBusy(false);
      }
    },
    [busy, model, chapterId, sectionId, commit, patchAi],
  );

  // 划词 / 外部注入
  useEffect(() => {
    if (outbound && outbound.nonce !== lastNonce.current) {
      lastNonce.current = outbound.nonce;
      send(outbound.content);
      clearOutbound();
    }
  }, [outbound, send, clearOutbound]);

  const clearChat = () => {
    messagesRef.current = [];
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--bg-panel)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--line-soft)] px-3 py-2">
        <ModelSwitch />
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="rounded-md px-2 py-1 text-[12px] text-[var(--ink-faint)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink-soft)]"
          >
            清空
          </button>
        )}
      </div>

      <div ref={scrollRef} className="scroll-y flex-1 space-y-4 px-3 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-weak)] text-2xl">
              💬
            </div>
            <h3 className="text-[15px] font-semibold">问我关于这门课的任何问题</h3>
            <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--ink-faint)]">
              我能读取你正在看的页面与全书大纲，结合上下文为你讲解。也可在左侧划词直接提问。
            </p>
            <div className="mt-4 flex w-full max-w-xs flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="press rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-left text-[13px] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:bg-[var(--accent-weak)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <Message key={m.id} message={m} onFollow={send} />)
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--line)] p-2.5">
        <div className="flex items-end gap-2 rounded-xl border border-[var(--line)] bg-white px-2.5 py-1.5 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="输入问题，Enter 发送 / Shift+Enter 换行"
            className="max-h-32 flex-1 resize-none bg-transparent py-1 text-[14px] outline-none scroll-y"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="press grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white transition-opacity disabled:opacity-40"
          >
            {busy ? (
              <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
