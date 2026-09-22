/**
 * Creem 最小 REST 封装（不引 SDK，直接 fetch）：
 *   - POST {base}/v1/checkouts 建托管收银台，header 带 x-api-key；
 *   - webhook 验签：creem-signature = hex(HMAC-SHA256(webhook_secret, raw body))。
 * 文档：https://docs.creem.io （checkouts / webhooks）
 *
 * env：CREEM_API_KEY（必备，测试环境是 creem_test_...）、CREEM_API_BASE_URL
 * （可选，默认 https://api.creem.io；test mode 换 https://test-api.creem.io）、
 * CREEM_WEBHOOK_SECRET、各套餐 product id（见 plans.ts 的 productEnv）。
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const CREEM_DEFAULT_API_BASE = "https://api.creem.io";
export const CREEM_SIGNATURE_HEADER = "creem-signature";

export interface CreemCheckoutCreated {
  id: string;
  checkoutUrl: string;
}

/** webhook 事件只取履约需要的字段，其余原样留在 object 里。 */
export interface CreemEvent {
  id?: string;
  eventType?: string;
  object?: {
    id?: string;
    request_id?: string;
    status?: string;
    metadata?: Record<string, unknown>;
    customer?: { id?: string; email?: string } | string;
    order?: {
      id?: string;
      customer?: string;
      amount?: number;
      currency?: string;
      status?: string;
    };
  };
}

function envText(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function resolveCreemApiKey(): string {
  return envText("CREEM_API_KEY");
}

export function resolveCreemApiBase(): string {
  return (envText("CREEM_API_BASE_URL") || CREEM_DEFAULT_API_BASE).replace(/\/+$/, "");
}

export function resolveWebhookSecret(): string {
  return envText("CREEM_WEBHOOK_SECRET");
}

export function creemConfigured(): boolean {
  return resolveCreemApiKey() !== "";
}

/** 建 checkout 下单。requestId 用本地订单 id，webhook 回传时按它找回订单。 */
export async function creemCreateCheckout(input: {
  productId: string;
  requestId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
  fetchImpl?: typeof fetch;
}): Promise<CreemCheckoutCreated> {
  const res = await (input.fetchImpl ?? fetch)(`${resolveCreemApiBase()}/v1/checkouts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": resolveCreemApiKey(),
    },
    body: JSON.stringify({
      product_id: input.productId,
      request_id: input.requestId,
      success_url: input.successUrl,
      units: 1,
      ...(input.customerEmail ? { customer: { email: input.customerEmail } } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
  });
  const data = (await res.json().catch(() => null)) as
    | { id?: unknown; checkout_url?: unknown; message?: unknown }
    | null;
  if (!res.ok) {
    const detail = typeof data?.message === "string" ? data.message : `HTTP ${res.status}`;
    throw new Error(`creem checkout failed: ${detail}`);
  }
  const id = typeof data?.id === "string" ? data.id : "";
  const checkoutUrl = typeof data?.checkout_url === "string" ? data.checkout_url : "";
  if (!checkoutUrl || !id) throw new Error("creem checkout failed: missing checkout_url");
  return { id, checkoutUrl };
}

/** 验签：hex HMAC-SHA256 + 定长比较；签名格式不对直接 false。 */
export function verifyCreemSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!secret || !signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = computeCreemSignature(rawBody, secret);
  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
}

export function computeCreemSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

/** 解析 webhook 事件体；非 JSON 或非对象返回 null。 */
export function parseCreemEvent(rawBody: string): CreemEvent | null {
  try {
    const parsed = JSON.parse(rawBody) as CreemEvent;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function eventText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
