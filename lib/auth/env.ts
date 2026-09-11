/**
 * Auth / SMTP env resolution. Secrets stay in process env; this module
 * never writes them to disk.
 */

export const DEFAULT_AUTH_PROJECT_REF = "jlahwwnjbhqfnsicdjsx";
export const DEFAULT_AUTH_SUPABASE_URL = `https://${DEFAULT_AUTH_PROJECT_REF}.supabase.co`;

const SUPABASE_HOST_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i;

export interface PublicAuthEnv {
  supabaseUrl: string;
  anonKey: string;
}

export interface ServiceAuthEnv extends PublicAuthEnv {
  serviceRoleKey: string;
}

export interface ManagementAuthEnv {
  accessToken: string;
  projectRef: string;
}

export interface SmtpEnv {
  host: string;
  port: string;
  user: string;
  pass: string;
  senderName: string;
  adminEmail: string;
}

/** Drop surrounding quotes and an inline `#` comment (`.env.local` style). */
export function stripEnvValue(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const quote = trimmed[0] === '"' || trimmed[0] === "'" ? trimmed[0] : "";
  if (quote) {
    const end = trimmed.indexOf(quote, 1);
    if (end > 0) return trimmed.slice(1, end);
  }
  const hash = trimmed.search(/\s+#/);
  return (hash >= 0 ? trimmed.slice(0, hash) : trimmed).trim();
}

function envText(env: NodeJS.ProcessEnv, key: string): string {
  const raw = env[key];
  return raw == null ? "" : stripEnvValue(raw);
}

function trimUrl(value: string): string {
  return stripEnvValue(value).replace(/\/+$/, "");
}

function requireSupabaseUrl(url: string): string {
  if (!SUPABASE_HOST_RE.test(url)) {
    throw new Error("SUPABASE_URL must be https://<ref>.supabase.co");
  }
  return url;
}

export function resolvePublicAuthEnv(env: NodeJS.ProcessEnv = process.env): PublicAuthEnv {
  const supabaseUrl = requireSupabaseUrl(
    trimUrl(
      env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || DEFAULT_AUTH_SUPABASE_URL,
    ),
  );
  const anonKey =
    envText(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    envText(env, "SUPABASE_ANON_KEY") ||
    envText(env, "SUPABASE_PUBLISHABLE_KEY");
  if (!anonKey) {
    throw new Error("Need NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)");
  }
  return { supabaseUrl, anonKey };
}

export function resolveServiceAuthEnv(env: NodeJS.ProcessEnv = process.env): ServiceAuthEnv {
  const pub = resolvePublicAuthEnv(env);
  const serviceRoleKey =
    envText(env, "SUPABASE_SERVICE_ROLE_KEY") || envText(env, "SUPABASE_SECRET_KEY");
  if (!serviceRoleKey) {
    throw new Error("Need SUPABASE_SERVICE_ROLE_KEY");
  }
  return { ...pub, serviceRoleKey };
}

export function resolveManagementAuthEnv(
  env: NodeJS.ProcessEnv = process.env,
): ManagementAuthEnv {
  const accessToken = envText(env, "SUPABASE_ACCESS_TOKEN");
  const projectRef =
    envText(env, "SUPABASE_PROJECT_REF") ||
    envText(env, "NEXT_PUBLIC_SUPABASE_URL").match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] ||
    DEFAULT_AUTH_PROJECT_REF;
  if (!accessToken) {
    throw new Error("Need SUPABASE_ACCESS_TOKEN");
  }
  return { accessToken, projectRef };
}

export function resolveSmtpEnv(env: NodeJS.ProcessEnv = process.env): SmtpEnv {
  const host = envText(env, "ALIYUN_SMTP_HOST");
  const port = envText(env, "ALIYUN_SMTP_PORT") || "465";
  const user = envText(env, "ALIYUN_SMTP_USER");
  const pass = envText(env, "ALIYUN_SMTP_PASSWORD");
  const senderName = envText(env, "ALIYUN_SMTP_SENDER_NAME") || "StudyReview";
  if (!host || !user || !pass) {
    throw new Error("Need ALIYUN_SMTP_HOST, ALIYUN_SMTP_USER, ALIYUN_SMTP_PASSWORD");
  }
  return { host, port, user, pass, senderName, adminEmail: user };
}
