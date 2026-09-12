import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_CAPABILITY_ENDPOINTS,
  capabilitySecretValues,
  normalizeCapabilityEndpoints,
  overlayOptional,
  resolveCapabilityEndpoint,
  resolveCapabilitySecret,
} from "./capabilityEndpoints.ts";
import { runWithCapabilityEndpoints, getCapabilityEndpoints } from "./capabilityContext.ts";

test("normalizeCapabilityEndpoints：空缺与非法字段回落为空/auto", () => {
  assert.deepEqual(normalizeCapabilityEndpoints(undefined), EMPTY_CAPABILITY_ENDPOINTS);
  assert.equal(normalizeCapabilityEndpoints({ imageApiStyle: "nope" }).imageApiStyle, "auto");
  assert.equal(normalizeCapabilityEndpoints({ webSearchApiKey: "  sk-user  " }).webSearchApiKey, "sk-user");
});

test("resolveCapabilitySecret：用户 key 优先，否则平台", () => {
  assert.deepEqual(resolveCapabilitySecret(" user-key ", "platform"), {
    value: "user-key",
    usedPlatformCredentials: false,
  });
  assert.deepEqual(resolveCapabilitySecret("", "platform"), {
    value: "platform",
    usedPlatformCredentials: true,
  });
});

test("resolveCapabilityEndpoint：无用户 key 时忽略用户 baseUrl", () => {
  const r = resolveCapabilityEndpoint({
    userBaseUrl: "https://evil.example/v1",
    userApiKey: "",
    platformBaseUrl: "https://api.siliconflow.cn/v1",
    platformApiKey: "platform-key",
  });
  assert.equal(r.usedPlatformCredentials, true);
  assert.equal(r.customBaseUrl, false);
  assert.equal(r.baseUrl, "https://api.siliconflow.cn/v1");
  assert.equal(r.apiKey, "platform-key");
});

test("resolveCapabilityEndpoint：用户 key + 可选 baseUrl", () => {
  const withBase = resolveCapabilityEndpoint({
    userBaseUrl: "https://mine.example/v1",
    userApiKey: "user-key",
    platformBaseUrl: "https://api.siliconflow.cn/v1",
    platformApiKey: "platform-key",
  });
  assert.equal(withBase.usedPlatformCredentials, false);
  assert.equal(withBase.customBaseUrl, true);
  assert.equal(withBase.baseUrl, "https://mine.example/v1");
  assert.equal(withBase.apiKey, "user-key");

  const keyOnly = resolveCapabilityEndpoint({
    userBaseUrl: "",
    userApiKey: "user-key",
    platformBaseUrl: "https://api.siliconflow.cn/v1",
    platformApiKey: "platform-key",
  });
  assert.equal(keyOnly.customBaseUrl, false);
  assert.equal(keyOnly.baseUrl, "https://api.siliconflow.cn/v1");
});

test("overlayOptional / capabilitySecretValues / ALS", () => {
  assert.equal(overlayOptional("  mine  ", "plat"), "mine");
  assert.equal(overlayOptional("", "plat"), "plat");
  assert.deepEqual(capabilitySecretValues({
    ...EMPTY_CAPABILITY_ENDPOINTS,
    imageApiKey: "a",
    webSearchApiKey: "b",
  }), ["a", "b"]);
  assert.deepEqual(getCapabilityEndpoints(), EMPTY_CAPABILITY_ENDPOINTS);
  const inner = runWithCapabilityEndpoints({ unsplashAccessKey: " us " }, () => getCapabilityEndpoints());
  assert.equal(inner.unsplashAccessKey, "us");
  assert.equal(getCapabilityEndpoints().unsplashAccessKey, "");
});
