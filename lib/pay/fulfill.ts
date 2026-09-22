/**
 * checkout.completed 履约：标 paid → 复用 applyUser+insertGrant 路径升档发额度。
 *
 * 幂等设计：Creem 会重投 webhook，重复事件重跑本函数必须安全。
 *   - 订单靠 metadata.order_id（下单时塞的本地订单 id）找回，request_id 兜底；
 *   - pending → paid 是原子迁移，抢到的那次才继续发额度，重投只拿到 alreadyFulfilled；
 *   - provider_order_id 有数据库部分唯一索引兜底；
 *   - 发额度中途失败把订单放回 pending，让下一次重投继续，而不是卡死在半核销状态。
 */

import { asUserTier } from "@/lib/billing/quotaGate";
import { applyMembershipUpgrade } from "@/lib/billing/redeemCode";
import { eventText, type CreemEvent } from "@/lib/pay/creem";
import { activePayStore, type PayDeps } from "@/lib/pay/orders";

export type FulfillResult =
  | { ok: true; alreadyFulfilled?: boolean; tier?: string }
  | { ok: false; reason: "no_order_ref" | "order_not_found" | "user_not_found" };

function eventOrderRef(event: CreemEvent): string {
  const object = event.object ?? {};
  return eventText(object.metadata?.order_id) || eventText(object.request_id);
}

export async function handleCheckoutCompleted(
  event: CreemEvent,
  deps: PayDeps = {},
): Promise<FulfillResult> {
  const store = activePayStore(deps);
  const now = (deps.now ?? (() => new Date()))();

  const orderRef = eventOrderRef(event);
  const order = orderRef
    ? await store.findOrderById(orderRef)
    : event.object?.id
      ? await store.findByCheckoutId(eventText(event.object.id))
      : null;
  if (!order) return { ok: false, reason: orderRef ? "order_not_found" : "no_order_ref" };

  const providerOrderId = eventText(event.object?.order?.id) || null;

  if (order.status !== "pending") {
    return { ok: true, alreadyFulfilled: true, tier: order.tier };
  }

  const claimed = await store.markOrderPaid(order.id, providerOrderId, now.toISOString());
  if (!claimed) return { ok: true, alreadyFulfilled: true, tier: order.tier };

  try {
    const user = await store.getUser(order.user_id);
    if (!user) {
      await store.revertToPending(order.id);
      return { ok: false, reason: "user_not_found" };
    }
    const upgraded = await applyMembershipUpgrade({
      userId: order.user_id,
      user,
      tier: asUserTier(order.tier),
      months: order.months,
      source: "payment",
      store,
      now,
    });
    return { ok: true, tier: upgraded.tier };
  } catch (error) {
    await store.revertToPending(order.id).catch(() => {});
    throw error;
  }
}
