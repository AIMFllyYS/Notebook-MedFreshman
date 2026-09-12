export type ImageGenErrorBody = {
  error?: string;
  code?: string;
};

/** 把生图 HTTP 错误收成可区分的中文：未登录 / 未配置 / 端点不对 / 上游拒绝。 */
export function formatImageGenError(status: number, body: ImageGenErrorBody | null | undefined): string {
  if (status === 401) return "未登录，请先登录后再生成图片";
  const code = body?.code;
  const message = typeof body?.error === "string" && body.error.trim() ? body.error.trim() : "";
  if (code === "unconfigured" || /未配置/.test(message)) {
    return message || "生图 API 未配置";
  }
  if (code === "bad_endpoint" || status === 404) {
    return message || "生图端点不对，请检查设置中的 Base URL";
  }
  if (code === "upstream_auth") {
    return message || "生图上游拒绝访问，请检查端点与密钥";
  }
  return message || `生图请求失败（${status}）`;
}
