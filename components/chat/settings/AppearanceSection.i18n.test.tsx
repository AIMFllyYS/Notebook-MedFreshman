import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { useSettings } from "@/lib/stores/settings";
import { AppearanceSection } from "./AppearanceSection";

/** 设置页新增的语言行：控件只改 locale，文案本身走词典。 */
describe("AppearanceSection 语言行", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    useSettings.setState({ locale: "zh" });
  });

  it("默认中文，点 English 后写入 locale 并落盘，整行文案跟着变", async () => {
    const user = userEvent.setup();
    render(<AppearanceSection />);

    expect(screen.getByTestId("settings-locale-zh")).toHaveTextContent("中文");
    expect(screen.getByRole("group", { name: "语言" })).toBeInTheDocument();

    await user.click(screen.getByTestId("settings-locale-en"));
    expect(useSettings.getState().locale).toBe("en");
    expect(JSON.parse(localStorage.getItem("gailvlun-settings-v1") ?? "{}").locale).toBe("en");
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();

    await user.click(screen.getByTestId("settings-locale-zh"));
    expect(useSettings.getState().locale).toBe("zh");
    expect(screen.getByRole("group", { name: "语言" })).toBeInTheDocument();
  });
});
