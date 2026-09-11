/**
 * Ping the live Supabase project with one lightweight PostgREST read.
 *
 *   pnpm db:keepalive
 *
 * Local: reads .env.local (NEXT_PUBLIC_SUPABASE_*).
 * CI: reads SUPABASE_URL / SUPABASE_ANON_KEY (or NEXT_PUBLIC_* ) secrets.
 * Prints one JSON line — that is the audit record (workflow log / stdout).
 */
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatKeepaliveRecord,
  formatKeepaliveSummary,
  resolveKeepaliveEnv,
  runKeepalive,
} from "../lib/db/keepalive.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (process.env[k] == null) process.env[k] = v;
    }
  } catch {
    // CI supplies env via secrets; a missing local file is fine.
  }
}

function keepaliveSource(): string {
  if (process.env.KEEPALIVE_SOURCE?.trim()) return process.env.KEEPALIVE_SOURCE.trim();
  if (process.env.GITHUB_ACTIONS === "true") return "github-actions";
  return "cli";
}

async function main() {
  loadEnvLocal();
  const env = resolveKeepaliveEnv();
  const result = await runKeepalive({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.apiKey,
    source: keepaliveSource(),
  });
  process.stdout.write(formatKeepaliveRecord(result));
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    appendFileSync(summary, formatKeepaliveSummary(result), "utf8");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
