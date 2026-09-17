import assert from "node:assert/strict";
import { test } from "node:test";
import {
  changeAccountPassword,
  hasPasswordSet,
  setAccountPassword,
  validateNewPassword,
  type PasswordAuthClient,
} from "./password";

test("password_set metadata decides whether a password exists", () => {
  assert.equal(hasPasswordSet({ user_metadata: { password_set: true } }), true);
  assert.equal(hasPasswordSet({ user_metadata: {} }), false);
  assert.equal(hasPasswordSet(null), false);
});

test("new passwords must be long enough and confirmed", () => {
  assert.equal(validateNewPassword("short", "short"), "密码至少 8 位");
  assert.equal(validateNewPassword("long-enough", "other"), "两次输入的密码不一致");
  assert.equal(validateNewPassword("long-enough", "long-enough"), null);
});

function mockClient(opts: {
  hasPassword?: boolean;
  updateError?: string | null;
  signInError?: string | null;
}): PasswordAuthClient & { updates: unknown[]; signIns: unknown[] } {
  const updates: unknown[] = [];
  const signIns: unknown[] = [];
  return {
    updates,
    signIns,
    auth: {
      getUser: async () => ({
        data: { user: { email: "sofia@example.com", user_metadata: { password_set: opts.hasPassword === true } } },
        error: null,
      }),
      updateUser: async (attrs) => {
        updates.push(attrs);
        return { error: opts.updateError ? { message: opts.updateError } : null };
      },
      signInWithPassword: async (creds) => {
        signIns.push(creds);
        return { error: opts.signInError ? { message: opts.signInError } : null };
      },
    },
  };
}

test("first-time setPassword does not ask for an old password", async () => {
  const client = mockClient({});
  const result = await setAccountPassword(client, "new-secret", "new-secret");
  assert.equal(result.ok, true);
  assert.deepEqual(client.updates[0], { password: "new-secret", data: { password_set: true } });
  assert.equal(client.signIns.length, 0);
});

test("changePassword verifies the current password first", async () => {
  const client = mockClient({});
  const ok = await changeAccountPassword(client, "sofia@example.com", "old-secret", "new-secret", "new-secret");
  assert.equal(ok.ok, true);
  assert.deepEqual(client.signIns[0], { email: "sofia@example.com", password: "old-secret" });

  const denied = mockClient({ signInError: "Invalid login credentials" });
  const fail = await changeAccountPassword(denied, "sofia@example.com", "wrong", "new-secret", "new-secret");
  assert.equal(fail.ok, false);
  if (!fail.ok) assert.match(fail.message, /当前密码不正确/);
});
