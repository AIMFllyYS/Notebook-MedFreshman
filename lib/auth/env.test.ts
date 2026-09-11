import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_AUTH_PROJECT_REF,
  DEFAULT_AUTH_SUPABASE_URL,
  resolveManagementAuthEnv,
  resolvePublicAuthEnv,
  resolveServiceAuthEnv,
  resolveSmtpEnv,
  stripEnvValue,
} from "./env.ts";

test("stripEnvValue drops quotes and inline comments used in .env.local", () => {
  assert.equal(stripEnvValue('"verify@example.com"          # comment'), "verify@example.com");
  assert.equal(stripEnvValue("'smtpdm.aliyun.com'"), "smtpdm.aliyun.com");
  assert.equal(stripEnvValue("465"), "465");
});

test("resolvePublicAuthEnv prefers public URL/key and falls back to live project URL", () => {
  const resolved = resolvePublicAuthEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co/",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_URL: "https://ignored.supabase.co",
  });
  assert.deepEqual(resolved, {
    supabaseUrl: "https://abc123.supabase.co",
    anonKey: "anon-key",
  });

  const fallback = resolvePublicAuthEnv({
    SUPABASE_ANON_KEY: "legacy-anon",
  });
  assert.equal(fallback.supabaseUrl, DEFAULT_AUTH_SUPABASE_URL);
  assert.equal(fallback.supabaseUrl.includes(DEFAULT_AUTH_PROJECT_REF), true);
  assert.equal(fallback.anonKey, "legacy-anon");
});

test("resolvePublicAuthEnv rejects missing keys and non-supabase hosts", () => {
  assert.throws(() => resolvePublicAuthEnv({}), /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.throws(
    () =>
      resolvePublicAuthEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.com",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "x",
      }),
    /SUPABASE_URL/,
  );
});

test("resolveServiceAuthEnv and management/smtp env require their secrets", () => {
  const service = resolveServiceAuthEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "placeholder",
  });
  assert.equal(service.serviceRoleKey, "placeholder");

  assert.throws(
    () =>
      resolveServiceAuthEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    /SUPABASE_SERVICE_ROLE_KEY/,
  );

  const mgmt = resolveManagementAuthEnv({
    SUPABASE_ACCESS_TOKEN: "placeholder",
    NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co",
  });
  assert.equal(mgmt.projectRef, "abc123");

  const smtp = resolveSmtpEnv({
    ALIYUN_SMTP_HOST: "smtpdm.aliyun.com",
    ALIYUN_SMTP_USER: '"verify@example.com"          # 发信地址',
    ALIYUN_SMTP_PASSWORD: '"smtp-pass-placeholder"      # comment',
    ALIYUN_SMTP_SENDER_NAME: "StudyReview_Platform",
  });
  assert.equal(smtp.port, "465");
  assert.equal(smtp.user, "verify@example.com");
  assert.equal(smtp.pass, "smtp-pass-placeholder");
  assert.equal(smtp.adminEmail, "verify@example.com");
  assert.throws(() => resolveSmtpEnv({}), /ALIYUN_SMTP_HOST/);
});
