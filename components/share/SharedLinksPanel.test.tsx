import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { translate } from "@/lib/i18n";
import { useToast } from "@/lib/stores/toast";
import SharedLinksPanel from "./SharedLinksPanel";

/**
 * SharedLinksPanel：只盯四件事 —— 四种「没有列表可看」的状态分得清（尤其 401 不等于加载失败）、
 * 开 / 关是**就地**翻转（不重拉整表）、PATCH 失败要回滚、已关闭的行不给「打开」入口。
 */

const zh = (key: string, vars?: Record<string, string | number>) => translate("zh", key, vars);

const ENABLED = { id: "aaa111bbb222", title: "组织学复习", createdAt: "2026-09-20T10:00:00.000Z", revoked: false };
const DISABLED = { id: "ccc333ddd444", title: "药理学问答", createdAt: "2026-09-18T08:30:00.000Z", revoked: true };

const fetchMock = vi.fn();

/** 只造面板真正读到的字段：ok / status / json。 */
function reply(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function methodOf(init: unknown): string | undefined {
  return (init as { method?: string } | undefined)?.method;
}

function toasts(): string[] {
  return useToast.getState().toasts.map((item) => item.message);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useToast.getState().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useToast.getState().clear();
});

it("请求还没回来时显示加载中", () => {
  fetchMock.mockReturnValue(new Promise(() => {}));
  render(<SharedLinksPanel />);
  expect(screen.getByTestId("shared-links-loading")).toHaveTextContent(zh("share.assets.loading"));
});

it("空列表显示空态，不是失败", async () => {
  fetchMock.mockResolvedValue(reply(200, { shares: [] }));
  render(<SharedLinksPanel />);

  await waitFor(() => expect(screen.getByTestId("shared-links-empty")).toHaveTextContent(zh("share.assets.empty")));
  expect(screen.queryByTestId("shared-links-failed")).toBeNull();
});

it("有数据时渲染标题、本地化时间与状态徽标；只有已开启的行给「打开」入口", async () => {
  fetchMock.mockResolvedValue(reply(200, { shares: [ENABLED, DISABLED] }));
  render(<SharedLinksPanel />);

  await waitFor(() => expect(screen.getByTestId("shared-links-list")).toBeInTheDocument());
  expect(screen.getByText(ENABLED.title)).toBeInTheDocument();
  expect(screen.getByText(DISABLED.title)).toBeInTheDocument();
  expect(screen.getByTestId(`shared-link-state-${ENABLED.id}`)).toHaveTextContent(zh("share.assets.enabled"));
  expect(screen.getByTestId(`shared-link-state-${DISABLED.id}`)).toHaveTextContent(zh("share.assets.disabled"));
  // 时间走 toLocaleString 插值，不是手写格式
  expect(
    screen.getByText(zh("share.assets.createdAt", { time: new Date(ENABLED.createdAt).toLocaleString() })),
  ).toBeInTheDocument();

  const open = screen.getByTestId(`shared-link-open-${ENABLED.id}`);
  expect(open).toHaveAttribute("href", expect.stringMatching(new RegExp(`/s/${ENABLED.id}$`)));
  expect(open).toHaveAttribute("target", "_blank");
  // 已关闭 = 链接打不开，就不给入口
  expect(screen.queryByTestId(`shared-link-open-${DISABLED.id}`)).toBeNull();
});

it("点开关：发 PATCH 并就地翻转这一行，不重新 GET", async () => {
  fetchMock.mockImplementation((_url: string, init?: { method?: string }) =>
    Promise.resolve(methodOf(init) === "PATCH" ? reply(200, { ok: true }) : reply(200, { shares: [ENABLED] })),
  );
  render(<SharedLinksPanel />);

  const toggle = await screen.findByTestId(`shared-link-toggle-${ENABLED.id}`);
  expect(toggle).toHaveTextContent(zh("share.assets.disable"));
  fireEvent.click(toggle);

  await waitFor(() =>
    expect(screen.getByTestId(`shared-link-state-${ENABLED.id}`)).toHaveTextContent(zh("share.assets.disabled")),
  );
  expect(screen.getByTestId(`shared-link-toggle-${ENABLED.id}`)).toHaveTextContent(zh("share.assets.enable"));
  expect(screen.queryByTestId(`shared-link-open-${ENABLED.id}`)).toBeNull();

  const patch = fetchMock.mock.calls.find(([, init]) => methodOf(init) === "PATCH");
  expect(patch?.[0]).toBe("/api/share");
  expect(JSON.parse(String((patch?.[1] as { body?: string }).body))).toEqual({ id: ENABLED.id, enabled: false });
  // 只有挂载那一次 GET：开关不重拉整表
  expect(fetchMock.mock.calls.filter(([, init]) => methodOf(init) !== "PATCH")).toHaveLength(1);
});

it("PATCH 失败：回滚到点击前的状态并提示", async () => {
  fetchMock.mockImplementation((_url: string, init?: { method?: string }) =>
    Promise.resolve(methodOf(init) === "PATCH" ? reply(503, { error: "boom" }) : reply(200, { shares: [ENABLED] })),
  );
  render(<SharedLinksPanel />);

  fireEvent.click(await screen.findByTestId(`shared-link-toggle-${ENABLED.id}`));

  await waitFor(() => expect(toasts()).toContain(zh("share.assets.toggleFailed")));
  expect(screen.getByTestId(`shared-link-state-${ENABLED.id}`)).toHaveTextContent(zh("share.assets.enabled"));
  expect(screen.getByTestId(`shared-link-toggle-${ENABLED.id}`)).toHaveTextContent(zh("share.assets.disable"));
  expect(screen.getByTestId(`shared-link-open-${ENABLED.id}`)).toBeInTheDocument();
});

it("401 显示未登录提示，而不是通用加载失败", async () => {
  fetchMock.mockResolvedValue(reply(401, { error: "请先登录" }));
  render(<SharedLinksPanel />);

  await waitFor(() =>
    expect(screen.getByTestId("shared-links-signed-out")).toHaveTextContent(zh("share.assets.loginRequired")),
  );
  expect(screen.queryByTestId("shared-links-failed")).toBeNull();
  expect(screen.queryByText(zh("share.assets.failed"))).toBeNull();
});

it("503 走通用失败态", async () => {
  fetchMock.mockResolvedValue(reply(503, { error: "boom" }));
  render(<SharedLinksPanel />);

  await waitFor(() => expect(screen.getByTestId("shared-links-failed")).toHaveTextContent(zh("share.assets.failed")));
});
