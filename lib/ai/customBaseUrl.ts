// 自定义上游 baseUrl 的基本 SSRF 防护：只允许 http(s)，拒绝回环与私网主机。
// 只看 URL 字面主机（含 Node 已规范化的 IPv4 写法），不做 DNS 解析。

import { BlockList, isIP } from "node:net";

export type UnsafeCustomBaseUrlReason = "invalid" | "protocol" | "private";

export class UnsafeCustomBaseUrlError extends Error {
  readonly reason: UnsafeCustomBaseUrlReason;

  constructor(reason: UnsafeCustomBaseUrlReason, message: string) {
    super(message);
    this.name = "UnsafeCustomBaseUrlError";
    this.reason = reason;
  }
}

const BLOCKED = new BlockList();
BLOCKED.addSubnet("0.0.0.0", 8, "ipv4");
BLOCKED.addSubnet("10.0.0.0", 8, "ipv4");
BLOCKED.addSubnet("100.64.0.0", 10, "ipv4");
BLOCKED.addSubnet("127.0.0.0", 8, "ipv4");
BLOCKED.addSubnet("169.254.0.0", 16, "ipv4");
BLOCKED.addSubnet("172.16.0.0", 12, "ipv4");
BLOCKED.addSubnet("192.168.0.0", 16, "ipv4");
BLOCKED.addAddress("::", "ipv6");
BLOCKED.addAddress("::1", "ipv6");
BLOCKED.addSubnet("fe80::", 10, "ipv6");
BLOCKED.addSubnet("fc00::", 7, "ipv6");
BLOCKED.addSubnet("ff00::", 8, "ipv6");

const LOOPBACK_NAMES = new Set([
  "localhost",
  "localhost6",
  "ip6-localhost",
  "ip6-loopback",
]);

export interface CustomBaseUrlCheckOk {
  ok: true;
  url: string;
}

export interface CustomBaseUrlCheckFail {
  ok: false;
  reason: UnsafeCustomBaseUrlReason;
  message: string;
}

export type CustomBaseUrlCheck = CustomBaseUrlCheckOk | CustomBaseUrlCheckFail;

function fail(reason: UnsafeCustomBaseUrlReason, message: string): CustomBaseUrlCheckFail {
  return { ok: false, reason, message };
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
}

function isBlockedIp(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return BLOCKED.check(address, "ipv4");
  if (version === 6) return BLOCKED.check(address, "ipv6");
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  if (!hostname) return true;
  // 合法 IP 只按网段判断；IPv6 不含点，不能走后面的单标签规则。
  if (isIP(hostname)) return isBlockedIp(hostname);
  if (LOOPBACK_NAMES.has(hostname)) return true;
  if (hostname.endsWith(".localhost") || hostname.endsWith(".localhost6")) return true;
  if (hostname === "local" || hostname.endsWith(".local")) return true;
  // 无点主机名通常走 DHCP 搜索域，落到内网。
  if (!hostname.includes(".")) return true;
  return false;
}

/** 校验自定义 baseUrl；合法时返回 trim 后的原字符串。 */
export function checkCustomBaseUrl(raw: string): CustomBaseUrlCheck {
  const url = raw.trim();
  if (!url) return fail("invalid", "自定义 API 地址格式无效");

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail("invalid", "自定义 API 地址格式无效");
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return fail("protocol", "自定义 API 地址仅支持 http 或 https 协议");
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || isBlockedHostname(hostname)) {
    return fail("private", "自定义 API 地址不能指向回环或私网主机");
  }

  return { ok: true, url };
}

/** 合法则返回 trim 后的地址，否则抛出 UnsafeCustomBaseUrlError。 */
export function assertSafeCustomBaseUrl(raw: string): string {
  const result = checkCustomBaseUrl(raw);
  if (!result.ok) throw new UnsafeCustomBaseUrlError(result.reason, result.message);
  return result.url;
}
