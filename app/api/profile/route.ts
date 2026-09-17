import {
  loadAccountProfile,
  resolveProfileUserId,
  updateAccountNickname,
} from "@/lib/profile/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie, Authorization" };

export async function GET(req: Request) {
  try {
    const userId = await resolveProfileUserId(req.headers);
    if (!userId) return Response.json({ error: "请先登录以查看账户。" }, { status: 401, headers });
    const profile = await loadAccountProfile(userId);
    if (!profile) return Response.json({ error: "账户档案暂不可用。" }, { status: 404, headers });
    return Response.json(profile, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "账户服务暂不可用";
    return Response.json({ error: message }, { status: 503, headers });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await resolveProfileUserId(req.headers);
    if (!userId) return Response.json({ error: "请先登录后再改昵称。" }, { status: 401, headers });
    const body = (await req.json().catch(() => null)) as { nickname?: unknown } | null;
    if (!body || !("nickname" in body)) {
      return Response.json({ error: "请提供昵称。" }, { status: 400, headers });
    }
    const profile = await updateAccountNickname(userId, body.nickname);
    if (!profile) return Response.json({ error: "账户档案暂不可用。" }, { status: 404, headers });
    return Response.json(profile, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "昵称未能保存";
    const status = message.includes("最多") || message.includes("无效") ? 400 : 503;
    return Response.json({ error: message }, { status, headers });
  }
}
