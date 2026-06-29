import assert from "node:assert/strict";
import { test } from "node:test";
import { eventMatchesCombo, parseKeyCombo } from "@/lib/keyboard/match";

test("parseKeyCombo parses mod+shift+f", () => {
  assert.deepEqual(parseKeyCombo("mod+shift+f"), {
    mod: true,
    alt: false,
    shift: true,
    key: "f",
  });
});

test("eventMatchesCombo matches ctrl+shift+f", () => {
  const e = {
    key: "f",
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: true,
  } as KeyboardEvent;
  assert.equal(eventMatchesCombo(e, "mod+shift+f"), true);
});

test("eventMatchesCombo matches meta+i on mac", () => {
  const e = {
    key: "i",
    ctrlKey: false,
    metaKey: true,
    altKey: false,
    shiftKey: false,
  } as KeyboardEvent;
  assert.equal(eventMatchesCombo(e, "mod+i"), true);
});

test("eventMatchesCombo matches alt+enter", () => {
  const e = {
    key: "Enter",
    ctrlKey: false,
    metaKey: false,
    altKey: true,
    shiftKey: false,
  } as KeyboardEvent;
  assert.equal(eventMatchesCombo(e, "alt+enter"), true);
});

test("eventMatchesCombo matches mod+4", () => {
  const e = {
    key: "4",
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  } as KeyboardEvent;
  assert.equal(eventMatchesCombo(e, "mod+4"), true);
});

test("eventMatchesCombo matches mod+shift+/ as ?", () => {
  const e = {
    key: "?",
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: true,
  } as KeyboardEvent;
  assert.equal(eventMatchesCombo(e, "mod+shift+/"), true);
});
