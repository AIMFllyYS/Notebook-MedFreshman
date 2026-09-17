import assert from "node:assert/strict";
import { test } from "node:test";
import {
  APP_MODE_LABELS,
  APP_MODE_PATHS,
  APP_NAME,
  appModeFromPathname,
  appModeTitle,
  hrefForAppMode,
  hrefForMobileAppMode,
  isAppMode,
  isAppModePath,
  isAuthPath,
  isRememberableStudioPath,
  parseAppMode,
  parseAppModePersist,
  resolveAppMode,
  resolveMobileAppMode,
  usesMobileStudioChrome,
  usesStudioChrome,
} from "./app-mode";

test("模式表与顶栏文案：StudySolo · Studio", () => {
  assert.equal(APP_NAME, "StudySolo");
  assert.equal(appModeTitle("studio"), "StudySolo · Studio");
  assert.equal(appModeTitle("agent"), "StudySolo · Agent");
  assert.equal(appModeTitle("class"), "StudySolo · Class");
  assert.deepEqual(APP_MODE_LABELS, { studio: "Studio", agent: "Agent", class: "Class" });
  assert.deepEqual(APP_MODE_PATHS, { studio: "/", agent: "/agent", class: "/class" });
});

test("isAppMode / parseAppMode 拒绝未知值", () => {
  assert.equal(isAppMode("studio"), true);
  assert.equal(isAppMode("agent"), true);
  assert.equal(isAppMode("class"), true);
  assert.equal(isAppMode("review"), false);
  assert.equal(parseAppMode("class"), "class");
  assert.equal(parseAppMode("nope"), "studio");
  assert.equal(parseAppMode(null), "studio");
});

test("pathname 映射：Agent / Class 独立，登录不改 persist", () => {
  assert.equal(appModeFromPathname("/agent"), "agent");
  assert.equal(appModeFromPathname("/agent/"), "agent");
  assert.equal(appModeFromPathname("/class"), "class");
  assert.equal(appModeFromPathname("/login"), null);
  assert.equal(appModeFromPathname("/"), "studio");
  assert.equal(appModeFromPathname("/anatomy/detail/1.1"), "studio");
  assert.equal(isAppModePath("/agent"), true);
  assert.equal(isAppModePath("/class"), true);
  assert.equal(isAppModePath("/"), false);
  assert.equal(isAuthPath("/login"), true);
  assert.equal(usesStudioChrome("/"), true);
  assert.equal(usesStudioChrome("/login"), true);
  assert.equal(usesStudioChrome("/agent"), false);
  assert.equal(usesStudioChrome("/class"), false);
  assert.equal(usesMobileStudioChrome("/"), true);
  assert.equal(usesMobileStudioChrome("/agent"), true);
  assert.equal(usesMobileStudioChrome("/login"), true);
  assert.equal(usesMobileStudioChrome("/anatomy/detail/1.1"), true);
  assert.equal(usesMobileStudioChrome("/class"), false);
});

test("resolveAppMode：URL 优先，登录页当 Studio 壳", () => {
  assert.equal(resolveAppMode("/agent", "studio"), "agent");
  assert.equal(resolveAppMode("/class", "studio"), "class");
  assert.equal(resolveAppMode("/", "agent"), "studio");
  assert.equal(resolveAppMode("/login", "agent"), "studio");
});

test("resolveMobileAppMode：Studio 路由可保留 persist 的 Agent", () => {
  assert.equal(resolveMobileAppMode("/", "agent"), "agent");
  assert.equal(resolveMobileAppMode("/anatomy/detail/1.1", "agent"), "agent");
  assert.equal(resolveMobileAppMode("/", "studio"), "studio");
  assert.equal(resolveMobileAppMode("/class", "agent"), "class");
  assert.equal(resolveMobileAppMode("/login", "agent"), "studio");
  assert.equal(resolveMobileAppMode("/agent", "studio"), "agent");
});

test("切回 Studio 走 lastStudioPath，忽略 Agent/Class/登录路径", () => {
  assert.equal(isRememberableStudioPath("/anatomy/detail/1.1"), true);
  assert.equal(isRememberableStudioPath("/agent"), false);
  assert.equal(isRememberableStudioPath("/login"), false);
  assert.equal(hrefForAppMode("agent", "/anatomy/detail/1.1"), "/agent");
  assert.equal(hrefForAppMode("class", "/anatomy/detail/1.1"), "/class");
  assert.equal(hrefForAppMode("studio", "/anatomy/detail/1.1"), "/anatomy/detail/1.1");
  assert.equal(hrefForAppMode("studio", "/agent"), "/");
  assert.equal(hrefForMobileAppMode("agent", "/anatomy/detail/1.1"), "/anatomy/detail/1.1");
  assert.equal(hrefForMobileAppMode("class", "/anatomy/detail/1.1"), "/class");
  assert.equal(hrefForMobileAppMode("studio", "/anatomy/detail/1.1"), "/anatomy/detail/1.1");
});

test("persist JSON 与裸字符串兼容", () => {
  assert.deepEqual(parseAppModePersist(null), { mode: "studio", lastStudioPath: "/" });
  assert.deepEqual(
    parseAppModePersist(JSON.stringify({ mode: "agent", lastStudioPath: "/physics/detail/1.1" })),
    { mode: "agent", lastStudioPath: "/physics/detail/1.1" },
  );
  assert.deepEqual(
    parseAppModePersist(JSON.stringify({ mode: "nope", lastStudioPath: "/agent" })),
    { mode: "studio", lastStudioPath: "/" },
  );
  assert.deepEqual(parseAppModePersist("class"), { mode: "class", lastStudioPath: "/" });
  assert.deepEqual(parseAppModePersist("{"), { mode: "studio", lastStudioPath: "/" });
});
