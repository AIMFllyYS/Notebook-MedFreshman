import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ShareButton from "./ShareButton";
import { translate } from "@/lib/i18n";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useToast } from "@/lib/stores/toast";
import type { SessionMeta } from "@/lib/storage/chatStorage";
import type { ChatMessage } from "@/lib/types/chat";

/**
 * ShareButton：只负责「打成快照 → POST → 把链接写进剪贴板」，所以这一组断言只盯三件事：
 * 不该发请求时一个字节都不发、成功后剪贴板拿到的确实是服务端给的 url、失败一定走错误提示。
 */

let authStatus: "loading" | "signedOut" | "signedIn" = "signedIn";
vi.mock("@/lib/hooks/useAuthSession", () => ({
  useAuthSession: () => ({ status: authStatus, userId: authStatus === "signedIn" ? "u1" : null }),
}));

vi.mock("@/lib/share/snapshot", () => ({
  buildSharedSnapshot: vi.fn(() => ({
    v: 1,
    title: "对话标题",
    createdAt: 0,
    sourceClientId: "s1",
    meta: {},
    messages: [],
    artifacts: [],
  })),
}));

import { buildSharedSnapshot } from "@/lib/share/snapshot";

const META: SessionMeta = {
  id: "s1",
  title: "对话标题",
  createdAt: 1,
  updatedAt: 1,
  messageCount: 1,
  artifactIds: [],
};

function messages(text: string): ChatMessage[] {
  return [{ id: "m1", role: "user", parts: [{ type: "text", text }], timestamp: 1 }] as unknown as ChatMessage[];
}

const writeText = vi.fn(() => Promise.resolve());
const fetchMock = vi.fn();

function toasts(): string[] {
  return useToast.getState().toasts.map((item) => item.message);
}

beforeEach(() => {
  authStatus = "signedIn";
  // 词典默认语言是 zh，但用户本机可能是 en；显式钉住，断言才只反映组件行为。
  useChatHistory.setState({ activeSessionId: "s1", sessionsMeta: [META], messagesById: { s1: messages("你好") } });
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  writeText.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useToast.getState().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useToast.getState().clear();
  useChatHistory.setState({ activeSessionId: null, sessionsMeta: [], messagesById: {} });
});

it("空对话只提示，不发分享请求", async () => {
  useChatHistory.setState({ sessionsMeta: [{ ...META, messageCount: 0 }], messagesById: { s1: [] } });
  render(<ShareButton />);

  fireEvent.click(screen.getByTestId("share-conversation"));

  await waitFor(() => expect(toasts()).toContain(translate("zh", "share.empty")));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(buildSharedSnapshot).not.toHaveBeenCalled();
});

it("未登录同样不发请求，只提示先登录", async () => {
  authStatus = "signedOut";
  render(<ShareButton />);

  fireEvent.click(screen.getByTestId("share-conversation"));

  await waitFor(() => expect(toasts()).toContain(translate("zh", "share.loginRequired")));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("成功后把服务端返回的 url 写进剪贴板并提示已复制", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ id: "abc123", url: "https://studysolo.test/s/abc123" }),
  });
  render(<ShareButton />);

  fireEvent.click(screen.getByTestId("share-conversation"));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://studysolo.test/s/abc123"));
  expect(toasts()).toContain(translate("zh", "share.copied"));
  expect(buildSharedSnapshot).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(String(fetchMock.mock.calls[0][0])).toBe("/api/share");
});

it("接口失败走错误提示，不碰剪贴板", async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "boom" }) });
  render(<ShareButton />);

  fireEvent.click(screen.getByTestId("share-conversation"));

  await waitFor(() => expect(toasts()).toContain(translate("zh", "share.failed")));
  expect(writeText).not.toHaveBeenCalled();
});
