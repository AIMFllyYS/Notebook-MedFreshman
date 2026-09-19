import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "./settings";

const LS_KEY = "gailvlun-settings-v1";

function Probe() {
  const enabled = useSettings((s) => s.defaultSearch);
  const hydrated = useSettings((s) => s.hydrated);
  return <span data-testid="probe">{enabled ? "on" : "off"}:{hydrated ? "h" : "n"}</span>;
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("settings store 的 SSR 安全性", () => {
  it("模块初始化不读本机设置：首帧恒为 DEFAULTS，hydrateSettings() 之后才生效", async () => {
    localStorage.setItem(LS_KEY, JSON.stringify({ defaultSearch: true }));
    vi.resetModules();
    const fresh = await import("./settings");

    // 这一段是本次修复的核心契约：任何"导入即读到本机值"的写法都会让首帧与服务端不一致。
    expect(fresh.useSettings.getState().hydrated).toBe(false);
    expect(fresh.useSettings.getState().defaultSearch).toBe(false);

    fresh.hydrateSettings();
    expect(fresh.useSettings.getState().hydrated).toBe(true);
    expect(fresh.useSettings.getState().defaultSearch).toBe(true);

    // 幂等：重复调用不会把已经水合的状态再改回去
    fresh.hydrateSettings();
    expect(fresh.useSettings.getState().defaultSearch).toBe(true);
  });

  it("服务端默认值渲染 → 客户端水合无报错，随后应用本机值", async () => {
    useSettings.setState({ defaultSearch: false, hydrated: false });
    const html = renderToString(<Probe />);
    // React 会在文本节点间插入 <!-- --> 分隔符，这里比对去掉注释后的文本
    expect(html).toContain("off");
    expect(html).toContain("probe");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable: unknown[] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      hydrateRoot(container, <Probe />, { onRecoverableError: (error) => recoverable.push(error) });
    });
    await act(async () => {});

    expect(errorSpy.mock.calls.map((call) => String(call[0])).join("\n")).not.toMatch(/hydrat/i);
    expect(recoverable).toHaveLength(0);
    // 水合那一刻仍是默认值（与 SSR 一致）
    expect(container.textContent).toBe("off:n");

    // 根组件 layout effect 调 hydrateSettings() 之后才切到本机值
    await act(async () => {
      useSettings.setState({ defaultSearch: true, hydrated: true });
    });
    expect(container.textContent).toBe("on:h");
  });

  it("水合完成前的写入会先补齐本机值（加性合并），不会丢掉盘上的其它配置", async () => {
    localStorage.setItem(LS_KEY, JSON.stringify({ defaultSearch: true, globalContext: "本机配置" }));
    vi.resetModules();
    const fresh = await import("./settings");

    // 未水合就调用 setter：persist() 先 hydrateSettings()（只合并盘上非默认字段）再写，
    // 未触碰的 globalContext 必须保留，被改的 defaultSearch 必须是新值。
    fresh.useSettings.getState().setDefaultSearch(false);
    expect(JSON.parse(localStorage.getItem(LS_KEY) ?? "{}")).toMatchObject({
      defaultSearch: false,
      globalContext: "本机配置",
    });
  });
});
