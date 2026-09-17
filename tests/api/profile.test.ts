import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET, PATCH } from "@/app/api/profile/route";
import { setProfileApiTestDeps } from "@/lib/profile/server";

afterEach(() => setProfileApiTestDeps(null));

test("profile GET requires the verified session, not a query userId", async () => {
  setProfileApiTestDeps({ resolveUserId: async () => null });
  const result = await GET(new Request("https://app.invalid/api/profile?userId=other"));
  assert.equal(result.status, 401);
  assert.match(result.headers.get("cache-control")!, /private, no-store/);
});

test("profile GET returns nickname and membership, never an avatar", async () => {
  setProfileApiTestDeps({
    resolveUserId: async () => "own",
    db: {
      getProfile: async (id) => {
        assert.equal(id, "own");
        return { email: "sofia@example.com", nickname: "苏", tier: "plus" };
      },
      saveNickname: async () => null,
    },
  });
  const response = await GET(new Request("https://app.invalid/api/profile"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.userId, "own");
  assert.equal(body.nickname, "苏");
  assert.equal(body.tier, "plus");
  assert.equal(body.membership, "Plus 会员");
  assert.equal(body.avatar, undefined);
});

test("profile PATCH writes only nickname for the session user", async () => {
  let saved: { userId: string; nickname: string | null } | null = null;
  setProfileApiTestDeps({
    resolveUserId: async () => "own",
    db: {
      getProfile: async () => ({ email: "sofia@example.com", nickname: null, tier: "free" }),
      saveNickname: async (userId, nickname) => {
        saved = { userId, nickname };
        return { email: "sofia@example.com", nickname, tier: "free" };
      },
    },
  });
  const response = await PATCH(
    new Request("https://app.invalid/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: "  苏  ", tier: "pro", avatar: "data:image/png;base64,x" }),
    }),
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(saved, { userId: "own", nickname: "苏" });
  assert.equal(body.nickname, "苏");
  assert.equal(body.tier, "free");
});
