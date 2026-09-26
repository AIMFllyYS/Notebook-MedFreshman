/**
 * 在售套餐常量。tier/months 决定升档与额度；usdCents 只是下单参考价，
 * 实际售价以 Creem 后台 product 配置为准（改价不动代码）。
 * product_id 不放代码里：生产 / 测试环境各一套，从对应 env 读。
 */

export type PayTier = "plus" | "pro";

export interface PayPlan {
  key: string;
  tier: PayTier;
  months: number;
  usdCents: number;
  /** 装 Creem product_id 的环境变量名。 */
  productEnv: string;
}

export const PAY_PLANS = {
  plus_monthly: { key: "plus_monthly", tier: "plus", months: 1, usdCents: 590, productEnv: "CREEM_PRODUCT_PLUS_MONTHLY" },
  plus_yearly: { key: "plus_yearly", tier: "plus", months: 12, usdCents: 5900, productEnv: "CREEM_PRODUCT_PLUS_YEARLY" },
  pro_monthly: { key: "pro_monthly", tier: "pro", months: 1, usdCents: 1790, productEnv: "CREEM_PRODUCT_PRO_MONTHLY" },
  pro_yearly: { key: "pro_yearly", tier: "pro", months: 12, usdCents: 17900, productEnv: "CREEM_PRODUCT_PRO_YEARLY" },
} as const satisfies Record<string, PayPlan>;

export type PayPlanKey = keyof typeof PAY_PLANS;

export function isPayPlanKey(value: unknown): value is PayPlanKey {
  return typeof value === "string" && value in PAY_PLANS;
}
