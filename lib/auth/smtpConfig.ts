/**
 * Supabase Auth custom SMTP via Management API.
 * Password is sent to the API only; snapshots never keep smtp_pass.
 */
import {
  EMAIL_OTP_EXPIRY_SECONDS,
  EMAIL_OTP_RESEND_INTERVAL_SECONDS,
} from "./otp.ts";
import type { SmtpEnv } from "./env.ts";

export const AUTH_CONFIG_API_PATH = "/config/auth";
export const DIRECTMAIL_SMTP_HOSTS = ["smtpdm.aliyun.com", "smtpdm.aliyuncs.com"] as const;
export const CUSTOM_SMTP_EMAIL_RATE_LIMIT = 30;

/** Default GoTrue templates omit `{{ .Token }}`; OTP login needs the code in the mail. */
export const MAILER_SUBJECT_CONFIRMATION = "{{ .Token }} is your verification code";
export const MAILER_SUBJECT_MAGIC_LINK = "{{ .Token }} is your sign-in code";
export const MAILER_TEMPLATE_CONFIRMATION = `<h2>Confirm your email address</h2>
<p>Your verification code is <strong>{{ .Token }}</strong>.</p>
<p>Or follow the link below to confirm this email address and finish signing up.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>`;
export const MAILER_TEMPLATE_MAGIC_LINK = `<h2>Your sign-in code</h2>
<p>Your verification code is <strong>{{ .Token }}</strong>.</p>
<p>Or follow the link below to sign in. This link expires shortly and can only be used once.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in</a></p>`;

export interface AuthConfigSnapshot {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpSenderName: string;
  smtpAdminEmail: string;
  smtpMaxFrequency: number;
  mailerOtpExp: number;
  externalEmailEnabled: boolean;
  mailerAutoconfirm: boolean;
  customSmtpEnabled: boolean;
}

export type AuthConfigPatch = Record<string, string | number | boolean>;

export function authConfigUrl(projectRef: string): string {
  return `https://api.supabase.com/v1/projects/${projectRef}${AUTH_CONFIG_API_PATH}`;
}

export function buildAuthSmtpPatch(smtp: SmtpEnv): AuthConfigPatch {
  return {
    external_email_enabled: true,
    mailer_autoconfirm: false,
    mailer_secure_email_change_enabled: true,
    disable_signup: false,
    smtp_admin_email: smtp.adminEmail,
    smtp_host: smtp.host,
    smtp_port: smtp.port,
    smtp_user: smtp.user,
    smtp_pass: smtp.pass,
    smtp_sender_name: smtp.senderName,
    smtp_max_frequency: EMAIL_OTP_RESEND_INTERVAL_SECONDS,
    mailer_otp_exp: EMAIL_OTP_EXPIRY_SECONDS,
    rate_limit_email_sent: CUSTOM_SMTP_EMAIL_RATE_LIMIT,
    mailer_subjects_confirmation: MAILER_SUBJECT_CONFIRMATION,
    mailer_subjects_magic_link: MAILER_SUBJECT_MAGIC_LINK,
    mailer_templates_confirmation_content: MAILER_TEMPLATE_CONFIRMATION,
    mailer_templates_magic_link_content: MAILER_TEMPLATE_MAGIC_LINK,
  };
}

export function snapshotAuthConfig(raw: Record<string, unknown>): AuthConfigSnapshot {
  const smtpHost = String(raw.smtp_host ?? "").trim();
  return {
    smtpHost,
    smtpPort: String(raw.smtp_port ?? "").trim(),
    smtpUser: String(raw.smtp_user ?? "").trim(),
    smtpSenderName: String(raw.smtp_sender_name ?? "").trim(),
    smtpAdminEmail: String(raw.smtp_admin_email ?? "").trim(),
    smtpMaxFrequency: Number(raw.smtp_max_frequency ?? 0),
    mailerOtpExp: Number(raw.mailer_otp_exp ?? 0),
    externalEmailEnabled: Boolean(raw.external_email_enabled),
    mailerAutoconfirm: Boolean(raw.mailer_autoconfirm),
    customSmtpEnabled: smtpHost.length > 0,
  };
}

export function isAliyunDirectMailSmtp(
  config: Pick<AuthConfigSnapshot, "smtpHost" | "customSmtpEnabled">,
): boolean {
  if (!config.customSmtpEnabled) return false;
  const host = config.smtpHost.toLowerCase();
  return DIRECTMAIL_SMTP_HOSTS.some((allowed) => host === allowed);
}

/** Markers that appear in a delivered message when it left via Aliyun DirectMail. */
export const DIRECTMAIL_DELIVERY_MARKERS = [
  "smtpdm.aliyun.com",
  "smtpdm.aliyuncs.com",
  "alimail",
  "aliyun-dm",
] as const;

export function collectDirectMailDeliveryTraces(haystack: string): string[] {
  const lower = haystack.toLowerCase();
  return DIRECTMAIL_DELIVERY_MARKERS.filter((marker) => lower.includes(marker));
}

async function parseAuthResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const message =
      body && typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : text.slice(0, 400);
    throw new Error(`Supabase auth config ${res.status}: ${message}`);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Supabase auth config: unexpected response body");
  }
  return body as Record<string, unknown>;
}

export async function fetchAuthConfig(opts: {
  accessToken: string;
  projectRef: string;
  fetchImpl?: typeof fetch;
}): Promise<AuthConfigSnapshot> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(authConfigUrl(opts.projectRef), {
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      Accept: "application/json",
    },
  });
  return snapshotAuthConfig(await parseAuthResponse(res));
}

export async function applyAuthSmtpConfig(opts: {
  accessToken: string;
  projectRef: string;
  smtp: SmtpEnv;
  fetchImpl?: typeof fetch;
}): Promise<AuthConfigSnapshot> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(authConfigUrl(opts.projectRef), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildAuthSmtpPatch(opts.smtp)),
  });
  return snapshotAuthConfig(await parseAuthResponse(res));
}
