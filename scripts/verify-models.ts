/**
 * 探测 lib/ai/models.ts 注册表内各模型在真实 API 上是否可调用。
 * 用法: npx tsx scripts/verify-models.ts [--strict]
 * 读取项目根 .env.local（不打印 key）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseUpstreamErrorBody } from "../lib/ai/upstream";

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
      process.env[k] = v;
    }
  } catch {
    console.warn("警告: 未找到 .env.local");
  }
}

loadEnvLocal();

async function main() {
  const { MODELS } = await import("../lib/ai/models");
  const { resolveProvider, chatCompletionsUrl } = await import("../lib/ai/provider");

  async function probe(registryId: string, endpointIndex: number) {
    const p = resolveProvider(registryId, undefined, endpointIndex);
    if (!p.configured) {
      return { status: "skip" as const, reason: "凭证未配置" };
    }
    const body = {
      model: p.apiModelId,
      messages: [{ role: "user", content: "回复 OK" }],
      max_tokens: 8,
      stream: false,
      temperature: 0,
    };
    try {
      const res = await fetch(chatCompletionsUrl(p.baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(p.timeoutMs),
      });
      const text = await res.text();
      if (res.ok) return { status: "ok" as const, httpStatus: res.status };
      const err = parseUpstreamErrorBody(text);
      return {
        status: "fail" as const,
        httpStatus: res.status,
        errorCode: err.errorCode,
        errorMsg: err.message,
      };
    } catch (e) {
      return { status: "fail" as const, errorCode: "NETWORK", errorMsg: String(e) };
    }
  }

  const strict = process.argv.includes("--strict");
  const results: unknown[] = [];
  let fail = 0;

  console.log("=== 模型注册表 API 探测 ===\n");

  for (const m of MODELS) {
    for (let i = 0; i < m.endpoints.length; i++) {
      const ep = m.endpoints[i];
      const r = await probe(m.id, i);
      const label = `${m.id} [${ep.provider} → ${ep.apiModelId}]`;
      const icon = r.status === "ok" ? "✓" : r.status === "skip" ? "○" : "✗";
      console.log(
        `${icon} ${label}`,
        r.status === "ok"
          ? `HTTP ${r.httpStatus}`
          : r.status === "skip"
            ? r.reason
            : `FAIL ${r.errorCode ?? ""} ${r.errorMsg ?? ""}`,
      );
      results.push({ registryId: m.id, endpointIndex: i, provider: ep.provider, apiModelId: ep.apiModelId, ...r });
      if (r.status === "fail") fail++;
      if (r.status === "ok" && i === 0 && m.endpoints.length > 1) break;
    }
  }

  const outPath = join(ROOT, "tmp", "model-api-test", "report.json");
  writeFileSync(outPath, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2));
  console.log(`\n报告: ${outPath}`);
  console.log(`失败: ${fail}`);

  if (strict && fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
