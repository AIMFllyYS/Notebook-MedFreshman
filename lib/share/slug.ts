/**
 * 分享 id（slug）。
 *
 * 12 位 base62 = 62^12 ≈ 3.2×10^21，逐个枚举不可行；必须用 crypto.getRandomValues
 * 而不是 Math.random——后者不是密码学随机源，同源脚本可以观测/预测序列。
 * 服务端生成 id，客户端只做 isShareId 校验，所以这一份前后端都跑。
 */

export const SHARE_ID_LENGTH = 12;

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * 拒绝采样阈值：256 % 62 = 8，直接取模会让前 8 个字符出现得更频繁（虽然差异很小，
 * 但「不可猜测」是这个 id 唯一的防线，不留偏差）。248 是不超过 256 的 62 的最大倍数。
 */
const REJECT_AT = Math.floor(256 / BASE62.length) * BASE62.length;

const SHARE_ID_RE = new RegExp(`^[0-9A-Za-z]{${SHARE_ID_LENGTH}}$`);

export function createShareId(): string {
  const source = globalThis.crypto;
  if (!source?.getRandomValues) {
    // 没有安全随机源时宁可炸掉，也不要退化成可预测的 id。
    throw new Error("createShareId: crypto.getRandomValues is unavailable");
  }
  let id = "";
  while (id.length < SHARE_ID_LENGTH) {
    const bytes = new Uint8Array(SHARE_ID_LENGTH - id.length);
    source.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= REJECT_AT) continue;
      id += BASE62[byte % BASE62.length];
      if (id.length === SHARE_ID_LENGTH) break;
    }
  }
  return id;
}

/** 路由参数、RPC 入参都要先过这一关：形状不对就不必发请求。 */
export function isShareId(value: unknown): value is string {
  return typeof value === "string" && SHARE_ID_RE.test(value);
}
