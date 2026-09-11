import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { AGENT_LOG_FILENAME, resolveAgentLogPath } from "./agentLog.ts";
import { agentLogContentDisposition, readRawAgentLog } from "./exportLogs.ts";
import { GET } from "../../../app/api/logs/export/route.ts";

const RAW_JSONL = Buffer.from(
  [
    '{"ts":"2026-01-02T03:04:05.000Z","hook":"onStepStart","data":{"apiKey":"KEEP_THIS","extraField":1,"nested":{"token":"ALSO_KEEP"}}}',
    "this line is not json and must survive",
    '{"hook":"onStepEnd","data":{"authorization":"Bearer sk-abc12345678","spaces":"  keep  "}}',
    "",
  ].join("\n"),
  "utf8",
);

const dirs: string[] = [];
const prevAgentLogPath = process.env.AGENT_LOG_PATH;

function tempLogFile(contents: Buffer): string {
  const dir = mkdtempSync(path.join(tmpdir(), "agent-log-export-"));
  dirs.push(dir);
  const file = path.join(dir, AGENT_LOG_FILENAME);
  writeFileSync(file, contents);
  return file;
}

afterEach(() => {
  if (prevAgentLogPath === undefined) delete process.env.AGENT_LOG_PATH;
  else process.env.AGENT_LOG_PATH = prevAgentLogPath;
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("readRawAgentLog：原样返回字节，不改写字段、不丢非法行", () => {
  const file = tempLogFile(RAW_JSONL);
  const result = readRawAgentLog(file);
  assert.equal(result.exists, true);
  assert.equal(result.path, file);
  assert.deepEqual(result.bytes, RAW_JSONL);
  const text = result.bytes.toString("utf8");
  assert.match(text, /"apiKey":"KEEP_THIS"/);
  assert.match(text, /"extraField":1/);
  assert.match(text, /this line is not json and must survive/);
  assert.match(text, /"authorization":"Bearer sk-abc12345678"/);
  assert.equal(text.includes("[REDACTED]"), false);
});

test("readRawAgentLog：缺文件返回空字节，不发明内容", () => {
  const missing = path.join(tmpdir(), `missing-agent-log-${Date.now()}.jsonl`);
  const result = readRawAgentLog(missing);
  assert.equal(result.exists, false);
  assert.equal(result.bytes.byteLength, 0);
});

test("readRawAgentLog：默认路径跟随 resolveAgentLogPath（#52）", () => {
  const file = tempLogFile(RAW_JSONL);
  process.env.AGENT_LOG_PATH = file;
  assert.equal(resolveAgentLogPath(), file);
  assert.deepEqual(readRawAgentLog().bytes, RAW_JSONL);
});

test("GET /api/logs/export：响应体与落盘文件字节级一致", async () => {
  const file = tempLogFile(RAW_JSONL);
  process.env.AGENT_LOG_PATH = file;
  const res = await GET();
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-disposition"), agentLogContentDisposition(AGENT_LOG_FILENAME));
  assert.equal(res.headers.get("x-agent-log-exists"), "1");
  const out = Buffer.from(await res.arrayBuffer());
  assert.deepEqual(out, RAW_JSONL);
  const parsed = JSON.parse(out.toString("utf8").split("\n")[0]) as {
    data: { apiKey: string; extraField: number };
  };
  assert.equal(parsed.data.apiKey, "KEEP_THIS");
  assert.equal(parsed.data.extraField, 1);
});
