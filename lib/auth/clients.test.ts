import assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAuthClient } from "./browserClient.ts";
import { createServiceAuthClient } from "./serviceClient.ts";

test("createBrowserAuthClient exposes signInWithOtp / verifyOtp", () => {
  const client = createBrowserAuthClient({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  });
  assert.equal(typeof client.auth.signInWithOtp, "function");
  assert.equal(typeof client.auth.verifyOtp, "function");
});

test("createServiceAuthClient exposes Auth Admin", () => {
  const client = createServiceAuthClient({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "placeholder",
  });
  assert.equal(typeof client.auth.admin.createUser, "function");
  assert.equal(typeof client.auth.admin.deleteUser, "function");
});
