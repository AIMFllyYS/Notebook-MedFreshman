import { describe, expect, it } from "vitest";
import { PANEL_PRESETS, nestedShares, type PanelPresetKey } from "./panelPresets";

const KEYS = Object.keys(PANEL_PRESETS) as PanelPresetKey[];

describe("panelPresets", () => {
  it("右栏展开时三列相加正好占满窗口", () => {
    for (const key of KEYS) {
      const preset = PANEL_PRESETS[key];
      if (preset.right === 0) continue;
      expect(preset.left + preset.center + preset.right, key).toBe(100);
    }
  });

  it("Agent 预设就是用户确认的比例，且右栏超过窗口的 1/3", () => {
    expect(PANEL_PRESETS.agent).toEqual({ left: 14, center: 49, right: 37, rightExpanded: 48 });
    expect(PANEL_PRESETS.agent.right).toBeGreaterThan(100 / 3);
  });

  it("Studio 保持改造前的现值（左 19 / 中 50 / 右 31，article 默认收起）", () => {
    expect(PANEL_PRESETS["studio:full"]).toEqual({ left: 19, center: 50, right: 31, rightExpanded: 31 });
    expect(PANEL_PRESETS["studio:article"].right).toBe(0);
    expect(PANEL_PRESETS["studio:article"].rightExpanded).toBe(31);
    expect(PANEL_PRESETS["studio:reference"].right).toBe(31);
    expect(PANEL_PRESETS["studio:no-right"].center).toBe(81);
  });

  it("嵌套分组换算：Agent 左栏 14% 的窗口宽度 = 组内 22.2%", () => {
    const shares = nestedShares(PANEL_PRESETS.agent);
    expect(shares.left).toBe(22.2);
    expect(shares.center).toBe(77.8);
    expect(shares.left + shares.center).toBe(100);
  });
});
