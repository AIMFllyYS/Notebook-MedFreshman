"use client";

import { useMemo } from "react";
import { getToolPartsByName } from "@/lib/chat/messageParts";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useImageGen } from "@/lib/stores/imageGen";
import {
  collectMessageImages,
  mergeGeneratedImages,
  type AgentImageItem,
  type GeneratedImage,
} from "@/lib/agent/sessionImages";
import type { ChatMessage } from "@/lib/types/chat";

/** 没有对话时共用的空数组：选择器每次返回新 [] 会让 zustand 每帧都判定变化。 */
const EMPTY_MESSAGES: ChatMessage[] = [];

/** 当前对话里出现过的全部图片（联网检索 + 笔记配图 + 已生成）。 */
export function useSessionImages(): AgentImageItem[] {
  const messages = useChatHistory((state) => {
    const sid = state.activeSessionId;
    return sid ? state.messagesById[sid] ?? EMPTY_MESSAGES : EMPTY_MESSAGES;
  });
  const sessions = useImageGen((state) => state.sessions);

  return useMemo(() => {
    const base = collectMessageImages(messages.flatMap((message) => message.parts));
    const generated: GeneratedImage[] = [];
    for (const message of messages) {
      for (const part of getToolPartsByName({ parts: message.parts }, "generateImage")) {
        if (part.state !== "output-available" || !part.output?.imageGenId) continue;
        const session = sessions[part.output.imageGenId];
        // 批准之前生图会话里没有图；只有真正出图了才算「这个对话有这张图」。
        if (!session || session.status !== "done" || session.images.length === 0) continue;
        generated.push({
          imageGenId: session.id,
          title: session.title,
          prompt: session.prompt,
          images: session.images,
        });
      }
    }
    return mergeGeneratedImages(base, generated);
  }, [messages, sessions]);
}
