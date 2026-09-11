/**
 * 提交前凭证扫描：拦截被追踪/暂存文本里像真密钥的 sbp_ / sk- / eyJ / service_role。
 * 占位符（sk-xxxx…）与 Postgres 角色名不算命中；绕过必须显式确认词，禁止静默跳过。
 */

export const BYPASS_CONFIRMATION = "I_UNDERSTAND";
export const BYPASS_ENV = "SECRET_SCAN_ALLOW";

export type SecretKind = "sbp_" | "sk-" | "eyJ" | "service_role";

export type SecretFinding = {
  path: string;
  line: number;
  kind: SecretKind;
  excerpt: string;
};

export type ScanFilesOptions = {
  bypass: boolean;
  applyLegacyAllowlist: boolean;
};

/** 历史分析文档里抄过本地 env，本 Issue 禁止为过扫描去改它。--staged 仍会扫。 */
export const LEGACY_PATH_ALLOWLIST = new Set([
  "docs/analysis/9-9/15-nextjs-compliance.md",
]);

const SKIP_PATH_PREFIXES = [
  "content/",
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "dist-desktop/",
];

const SKIP_FILES = new Set(["pnpm-lock.yaml"]);

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".mp4",
  ".pdf",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".zip",
  ".gz",
  ".pfx",
  ".wasm",
  ".bin",
]);

const SK_RE = /(?<![A-Za-z0-9_])sk-([A-Za-z0-9_-]{20,})/g;
const SBP_RE = /(?<![A-Za-z0-9_])sbp_([A-Za-z0-9]{20,})/g;
const JWT_RE = /(?<![A-Za-z0-9_])(eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,})/g;
const SERVICE_ROLE_ASSIGN_RE = /SERVICE_ROLE(?:_KEY)?\s*[:=]\s*['"]?(\S+)/i;

export function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function shouldScanPath(filePath: string): boolean {
  const posix = normalizeRepoPath(filePath);
  if (!posix || posix.endsWith("/")) return false;
  if (SKIP_FILES.has(posix.split("/").pop() ?? "")) return false;
  if (SKIP_PATH_PREFIXES.some((prefix) => posix === prefix.slice(0, -1) || posix.startsWith(prefix))) {
    return false;
  }
  const dot = posix.lastIndexOf(".");
  if (dot >= 0 && SKIP_EXTENSIONS.has(posix.slice(dot).toLowerCase())) return false;
  return true;
}

export function isLegacyAllowlisted(filePath: string): boolean {
  return LEGACY_PATH_ALLOWLIST.has(normalizeRepoPath(filePath));
}

export function isPlaceholderSecret(raw: string): boolean {
  const value = raw.replace(/^['"`]+|['"`]+$/g, "").trim();
  if (!value) return true;
  const body = value.replace(/^(sk-|sbp_)/, "");
  const compact = body.replace(/[-_]/g, "");
  if (!compact) return true;
  if (/^(.)\1+$/.test(compact)) return true;
  if (/^x+$/i.test(compact)) return true;
  return /^(xxx+|placeholder|changeme|your[-_].*|example|dummy|redacted|todo|fixme)$/i.test(compact);
}

export function resolveBypass(
  argv: string[],
  env: Record<string, string | undefined> = {},
): boolean {
  let fromArg = "";
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--allow") {
      fromArg = argv[i + 1] ?? "";
      break;
    }
    if (token.startsWith("--allow=")) {
      fromArg = token.slice("--allow=".length);
      break;
    }
  }
  const fromEnv = env[BYPASS_ENV] ?? "";
  return fromArg === BYPASS_CONFIRMATION || fromEnv === BYPASS_CONFIRMATION;
}

function redact(kind: SecretKind, match: string): string {
  const shown = match.slice(0, Math.min(6, match.length));
  return `${shown}… (${kind}, ${match.length} chars)`;
}

function looksLikeServiceRoleSecret(line: string): boolean {
  const assigned = line.match(SERVICE_ROLE_ASSIGN_RE);
  if (assigned?.[1]) {
    const value = assigned[1].replace(/['",;]+$/g, "");
    if (value.length >= 8 && !isPlaceholderSecret(value)) return true;
  }
  return /\beyJ[A-Za-z0-9_-]{8,}/.test(line) && /service_role/i.test(line);
}

export function scanText(text: string, filePath: string): SecretFinding[] {
  const path = normalizeRepoPath(filePath);
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNo = i + 1;

    SK_RE.lastIndex = 0;
    for (const match of line.matchAll(SK_RE)) {
      const token = match[0];
      if (isPlaceholderSecret(token)) continue;
      findings.push({ path, line: lineNo, kind: "sk-", excerpt: redact("sk-", token) });
    }

    SBP_RE.lastIndex = 0;
    for (const match of line.matchAll(SBP_RE)) {
      const token = match[0];
      if (isPlaceholderSecret(token)) continue;
      findings.push({ path, line: lineNo, kind: "sbp_", excerpt: redact("sbp_", token) });
    }

    JWT_RE.lastIndex = 0;
    for (const match of line.matchAll(JWT_RE)) {
      const token = match[1];
      if (token.includes("...")) continue;
      findings.push({ path, line: lineNo, kind: "eyJ", excerpt: redact("eyJ", token) });
    }

    if (/service_role/i.test(line) && looksLikeServiceRoleSecret(line)) {
      findings.push({
        path,
        line: lineNo,
        kind: "service_role",
        excerpt: redact("service_role", "service_role"),
      });
    }
  }

  return findings;
}

export function scanFiles(
  files: Array<{ path: string; text: string }>,
  options: ScanFilesOptions,
): { findings: SecretFinding[]; skippedAllowlist: string[] } {
  const findings: SecretFinding[] = [];
  const skippedAllowlist: string[] = [];

  for (const file of files) {
    const path = normalizeRepoPath(file.path);
    if (!shouldScanPath(path)) continue;
    if (options.applyLegacyAllowlist && isLegacyAllowlisted(path)) {
      skippedAllowlist.push(path);
      continue;
    }
    findings.push(...scanText(file.text, path));
  }

  return { findings, skippedAllowlist };
}

export function formatScanReport(findings: SecretFinding[], bypassed: boolean): string {
  const lines = findings.map(
    (hit) => `  - ${hit.path}:${hit.line}  ${hit.kind}  ${hit.excerpt}`,
  );
  const header = bypassed
    ? `secret-scan: ${findings.length} finding(s) bypassed with ${BYPASS_ENV}/${"--allow"}=${BYPASS_CONFIRMATION}`
    : `secret-scan: blocked ${findings.length} likely secret(s). Bypass: ${BYPASS_ENV}=${BYPASS_CONFIRMATION} or --allow=${BYPASS_CONFIRMATION}`;
  return [header, ...lines].join("\n");
}
