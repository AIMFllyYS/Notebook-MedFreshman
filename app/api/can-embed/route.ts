import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 可嵌入预检：抓取目标站点的响应头，判断它是否允许被本应用的 iframe 内嵌
 * （仅检测「墙 A」：X-Frame-Options / CSP frame-ancestors —— 这类是可靠可探测的）。
 *
 * 注意：Cloudflare/Turnstile 这类「墙 B」人机挑战无法靠响应头可靠预判
 * （Cloudflare 覆盖极广且多数并不挑战），故不据此阻断；保留前端「在新标签打开」兜底。
 */
export function judge(headers: Headers): { embeddable: boolean; reason?: string } {
  const xfo = headers.get("x-frame-options");
  if (xfo) {
    const v = xfo.toLowerCase();
    if (v.includes("deny")) return { embeddable: false, reason: "X-Frame-Options: DENY" };
    if (v.includes("sameorigin")) return { embeddable: false, reason: "X-Frame-Options: SAMEORIGIN" };
    if (v.includes("allow-from")) return { embeddable: false, reason: "X-Frame-Options: ALLOW-FROM" };
  }
  const csp = headers.get("content-security-policy");
  if (csp) {
    const m = csp.match(/frame-ancestors([^;]*)/i);
    if (m) {
      const tokens = m[1].trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.includes("'none'")) return { embeddable: false, reason: "CSP frame-ancestors 'none'" };
      if (tokens.includes("*")) return { embeddable: true };
      // 'self' 或指定域名：不会包含本应用源 → 视为不可内嵌
      return { embeddable: false, reason: "CSP frame-ancestors " + m[1].trim() };
    }
  }
  return { embeddable: true };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ embeddable: true, reason: "no-url" });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ embeddable: true, reason: "bad-url" });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ embeddable: true, reason: "non-http" });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });
    // 只需响应头，丢弃响应体避免下载整页
    res.body?.cancel().catch(() => {});

    // 顶层 GET 返回非正常状态（202/403/429/503…）通常是人机校验/拦截页（墙 B，如 Cloudflare），
    // 其响应头与真实页面不同、内嵌后会卡在挑战页 → 直接判不可内嵌，引导外开。
    const OK = new Set([200, 204, 206, 301, 302, 303, 304, 307, 308]);
    if (!OK.has(res.status)) {
      return NextResponse.json({
        embeddable: false,
        reason: `HTTP ${res.status}（疑似人机校验/访问受限）`,
        status: res.status,
        finalUrl: res.url,
      });
    }

    const verdict = judge(res.headers);
    return NextResponse.json({ ...verdict, status: res.status, finalUrl: res.url });
  } catch (e) {
    // 抓取失败（网络/被服务端拦截）→ 不武断阻断，允许前端尝试内嵌
    return NextResponse.json({
      embeddable: true,
      reason: "probe-failed",
      error: String((e as Error)?.message ?? e),
    });
  } finally {
    clearTimeout(timer);
  }
}
