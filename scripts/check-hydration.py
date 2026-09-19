# -*- coding: utf-8 -*-
"""种子化 hydration 检查：用「非默认本机设置」打开真实页面，断言没有 React hydration 报错。

为什么需要它：
  - jsdom 单测不跑 SSR -> hydrate 这条链路；
  - next build 只做类型与构建，不比对 hydration；
  - 干净 profile 下「本机值 == 默认值」，结构上不可能触发。
所以只有「带种子 profile 的真实浏览器」能抓到这类问题（本项目曾因此出现
Hydration failed，根因是设置 store 在客户端模块初始化时同步读 localStorage）。

用法：
  pnpm dev                       # 或 pnpm start（默认端口 35349）
  pnpm run check:hydration
  BASE=http://127.0.0.1:35349 pnpm run check:hydration

依赖 Playwright for Python（不是本仓依赖）：
  pip install playwright && playwright install chromium
未安装时脚本打印 SKIP 并以 0 退出——不会被误当成「已通过」。
"""
from __future__ import annotations

import json
import os
import sys

SETTINGS_KEY = "gailvlun-settings-v1"

# 每一项都是「与 DEFAULTS 不同的本机值」，历史上每一项都曾打破 hydration。
CASES = [
    ("defaultSearch", {"defaultSearch": True}, "/agent"),
    ("defaultThinkingEffort", {"defaultThinkingEffort": "high"}, "/agent"),
    ("selectedModelId", {"selectedModelId": "gpt-5.6-sol"}, "/agent"),
    ("showRightPanelTabBar", {"showRightPanelTabBar": False}, "/agent"),
    ("showRightPanelTabBar", {"showRightPanelTabBar": False}, "/"),
    (
        "all-combined",
        {
            "defaultSearch": True,
            "defaultThinking": True,
            "defaultThinkingEffort": "high",
            "selectedModelId": "gpt-5.6-sol",
            "showRightPanelTabBar": False,
        },
        "/agent",
    ),
]


def main() -> int:
    base = os.environ.get("BASE", "http://localhost:35349").rstrip("/")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("SKIP: 未安装 Playwright for Python，无法执行真实浏览器 hydration 检查。")
        print("      安装：pip install playwright && playwright install chromium")
        print("      然后用 pnpm dev 起服务并重跑。")
        return 0

    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, seed, route in CASES:
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            seed_js = "try { localStorage.setItem(%s, %s); } catch (e) {}" % (
                json.dumps(SETTINGS_KEY),
                json.dumps(json.dumps(seed)),
            )
            ctx.add_init_script(seed_js)
            page = ctx.new_page()
            messages: list[str] = []
            page.on("pageerror", lambda e: messages.append(str(e)))
            page.on("console", lambda m: messages.append(m.text) if m.type == "error" else None)
            try:
                page.goto(base + route, wait_until="load", timeout=120_000)
                page.wait_for_timeout(5_000)
            except Exception as exc:  # 服务没起或路由挂了：算失败，不要静默
                print("FAIL %-24s %-8s 无法加载：%s" % (name, route, str(exc).splitlines()[0][:120]))
                failures += 1
                ctx.close()
                continue
            hydration = [m for m in messages if "Hydration failed" in m or "did not match" in m]
            status = "PASS" if not hydration else "FAIL"
            if hydration:
                failures += 1
            print("%-4s %-24s %-8s hydration=%d" % (status, name, route, len(hydration)))
            if hydration:
                print("      " + hydration[0].splitlines()[0][:180])
            ctx.close()
        browser.close()

    if failures:
        print("")
        print("%d 个场景出现 hydration 报错。" % failures)
        return 1
    print("")
    print("全部场景通过：真实浏览器首屏没有 hydration 不一致。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
