/**
 * 站点根 URL 的唯一入口。
 *
 * 分享链接必须指向用户此刻真正打开的那个站点：本机是 localhost:35349，生产挂在别的域名下。
 * 写死任何一边都会生成打不开的死链，所以顺序是
 *   NEXT_PUBLIC_SITE_URL → 浏览器当前 origin → 本机默认值。
 *
 * 注意 process.env.NEXT_PUBLIC_SITE_URL 必须保持「写死的静态字面量」：Next / Turbopack
 * 只内联这种形式的 NEXT_PUBLIC_*（同 lib/auth/env.ts 的理由），换成 env[...] 在浏览器里就是空。
 */

/** 本机开发的默认站点根，与 package.json 的 `dev -p 35349` 对齐。 */
export const DEFAULT_SITE_ORIGIN = "http://localhost:35349";

/** 只接受绝对 http(s) URL 并去掉末尾斜杠；空串、相对路径、缺协议一律视为「没配」。 */
export function normalizeSiteOrigin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) return null;
  return trimmed;
}

function envSiteOrigin(): string | null {
  try {
    // process 在浏览器里可能整个不存在（未内联时），所以包在 try 里。
    return normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  } catch {
    return null;
  }
}

/** file:// 或不透明来源的 iframe 里 origin 是字符串 "null"，同样要挡掉。 */
function browserSiteOrigin(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const origin: unknown = window.location?.origin;
    if (origin === "null") return null;
    return normalizeSiteOrigin(origin);
  } catch {
    return null;
  }
}

/** 分享链接、Open Graph 绝对地址等一律用它拼，不要在别处再拼一遍。 */
export function siteOrigin(): string {
  return envSiteOrigin() ?? browserSiteOrigin() ?? DEFAULT_SITE_ORIGIN;
}

/** 分享链接的唯一拼法：服务端生成 url 与客户端自校验共用，避免两处漂移。 */
export function shareUrl(id: string, origin: string = siteOrigin()): string {
  return `${origin}/s/${id}`;
}
