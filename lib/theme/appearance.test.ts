import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_APPEARANCE_SETTINGS,
  FONT_CHOICES,
  buildAppearanceCssVars,
  normalizeAppearanceSettings,
  safeHexColor,
  serializeAppearanceSettings,
  type AppearanceSettings,
} from "./appearance.ts";

test("safeHexColor accepts six-digit hex colors and rejects unsafe values", () => {
  assert.equal(safeHexColor("#4f7cff", "#000000"), "#4f7cff");
  assert.equal(safeHexColor("#ABCDEF", "#000000"), "#abcdef");
  assert.equal(safeHexColor("4f7cff", "#000000"), "#000000");
  assert.equal(safeHexColor("red", "#000000"), "#000000");
  assert.equal(safeHexColor("url(javascript:alert(1))", "#000000"), "#000000");
});

test("normalizeAppearanceSettings recovers from invalid persisted data", () => {
  assert.deepEqual(normalizeAppearanceSettings(null), DEFAULT_APPEARANCE_SETTINGS);
  assert.deepEqual(normalizeAppearanceSettings("not-json"), DEFAULT_APPEARANCE_SETTINGS);
  assert.deepEqual(
    normalizeAppearanceSettings({ mode: "strange", custom: { lightAccent: "red" } }),
    DEFAULT_APPEARANCE_SETTINGS,
  );
});

test("normalizeAppearanceSettings preserves valid mode, colors, and font", () => {
  const settings = normalizeAppearanceSettings({
    mode: "custom",
    custom: {
      lightAccent: "#1188CC",
      darkAccent: "#F3B65E",
      selection: "#22AA77",
      font: "songti",
    },
  });

  assert.equal(settings.mode, "custom");
  assert.equal(settings.custom.lightAccent, "#1188cc");
  assert.equal(settings.custom.darkAccent, "#f3b65e");
  assert.equal(settings.custom.selection, "#22aa77");
  assert.equal(settings.custom.font, "songti");
});

test("serializeAppearanceSettings writes a compact stable payload", () => {
  const settings: AppearanceSettings = {
    mode: "custom",
    custom: {
      lightAccent: "#2255aa",
      darkAccent: "#c7d8ff",
      selection: "#bb7722",
      font: "kaiti",
    },
  };

  assert.equal(
    serializeAppearanceSettings(settings),
    '{"mode":"custom","custom":{"lightAccent":"#2255aa","darkAccent":"#c7d8ff","selection":"#bb7722","font":"kaiti"}}',
  );
});

test("buildAppearanceCssVars exposes custom color and font variables", () => {
  const vars = buildAppearanceCssVars({
    mode: "custom",
    custom: {
      lightAccent: "#2255aa",
      darkAccent: "#c7d8ff",
      selection: "#bb7722",
      font: "songti",
    },
  });

  assert.equal(vars["--appearance-light-accent"], "#2255aa");
  assert.equal(vars["--appearance-dark-accent"], "#c7d8ff");
  assert.equal(vars["--appearance-selection"], "#bb7722");
  assert.equal(vars["--appearance-selection-bg"], "color-mix(in srgb, #bb7722 34%, transparent)");
  assert.equal(vars["--font-sans"], FONT_CHOICES.songti.cssValue);
});

test("buildAppearanceCssVars keeps default mode from overriding CSS tokens", () => {
  assert.deepEqual(buildAppearanceCssVars(DEFAULT_APPEARANCE_SETTINGS), {});
});
