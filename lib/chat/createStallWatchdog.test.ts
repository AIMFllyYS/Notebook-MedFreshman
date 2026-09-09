import assert from "node:assert/strict";
import { test } from "node:test";
import { createStallWatchdog } from "./createStallWatchdog.ts";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("createStallWatchdog：超时后触发 onStall，且只触发一次", async () => {
  let count = 0;
  const watchdog = createStallWatchdog(() => {
    count += 1;
  }, 20, 8);
  await wait(50);
  watchdog.stop();
  assert.equal(count, 1);
});

test("createStallWatchdog：touch 会推迟超时", async () => {
  let count = 0;
  const watchdog = createStallWatchdog(() => {
    count += 1;
  }, 40, 8);
  await wait(20);
  watchdog.touch();
  await wait(20);
  watchdog.stop();
  assert.equal(count, 0);
});
