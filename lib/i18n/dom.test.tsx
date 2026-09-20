import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "@/lib/stores/settings";
import { syncDocumentLocale } from "./dom";
import { type Translate, useT } from "./index";

const LS_KEY = "gailvlun-settings-v1";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  useSettings.setState({ locale: "zh" });
  document.documentElement.lang = "";
  delete document.documentElement.dataset.locale;
});

function Probe({ onRender }: { onRender?: (t: Translate) => void }) {
  const t = useT();
  onRender?.(t);
  return <span data-testid="probe">{t("agent.nav.assets")}</span>;
}

describe("syncDocumentLocale", () => {
  it("中文写 zh-CN，英文写 en，data-locale 用语言码", () => {
    syncDocumentLocale("zh");
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.documentElement.dataset.locale).toBe("zh");
    syncDocumentLocale("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.locale).toBe("en");
  });

  it("不认识的语言值回退中文（盘上手改过的值不能把 lang 写坏）", () => {
    syncDocumentLocale("fr" as never);
    expect(document.documentElement.dataset.locale).toBe("zh");
    expect(document.documentElement.lang).toBe("zh-CN");
  });
});

describe("useT", () => {
  it("消费者挂载时就把文档语言同步好（不依赖 AppShell）", () => {
    render(<Probe />);
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.documentElement.dataset.locale).toBe("zh");
  });

  it("切到 en 后重新渲染成英文，引用在语言不变时保持稳定", () => {
    const seen: Translate[] = [];
    const { rerender } = render(<Probe onRender={(t) => seen.push(t)} />);
    expect(screen.getByTestId("probe")).toHaveTextContent("我的资产");

    // 语言没变：重渲染必须复用同一个 t（调用方可以把它放进依赖数组）
    rerender(<Probe onRender={(t) => seen.push(t)} />);
    expect(seen[1]).toBe(seen[0]);

    act(() => {
      useSettings.getState().setLocale("en");
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("My assets");
    expect(document.documentElement.lang).toBe("en");
    expect(seen[seen.length - 1]).not.toBe(seen[0]);
  });

  it("setLocale 与其它设置一样落盘，hydrate 后仍是英文", async () => {
    useSettings.getState().setLocale("en");
    expect(JSON.parse(localStorage.getItem(LS_KEY) ?? "{}").locale).toBe("en");

    vi.resetModules();
    const fresh = await import("@/lib/stores/settings");
    fresh.hydrateSettings();
    expect(fresh.useSettings.getState().locale).toBe("en");
  });
});
