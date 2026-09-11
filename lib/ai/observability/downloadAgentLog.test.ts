import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AGENT_LOG_EXPORT_FILENAME,
  AGENT_LOG_EXPORT_URL,
  exportAgentLogs,
  filenameFromContentDisposition,
} from "./downloadAgentLog.ts";

const RAW = new Uint8Array(
  Buffer.from(
    '{"hook":"onToolExecutionEnd","data":{"apiKey":"KEEP_THIS","extraField":true}}\nnot-json\n',
    "utf8",
  ),
);

test("filenameFromContentDisposition：读取附件名，缺省回落到原始文件名", () => {
  assert.equal(filenameFromContentDisposition(null), AGENT_LOG_EXPORT_FILENAME);
  assert.equal(
    filenameFromContentDisposition('attachment; filename="agent-lifecycle.jsonl"'),
    "agent-lifecycle.jsonl",
  );
});

test("exportAgentLogs：下载体是原始 JSONL 字节，不改写字段", async () => {
  const downloaded: { bytes: Uint8Array; filename: string }[] = [];
  const result = await exportAgentLogs({
    fetch: async (input) => {
      assert.equal(String(input), AGENT_LOG_EXPORT_URL);
      return new Response(RAW, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${AGENT_LOG_EXPORT_FILENAME}"`,
        },
      });
    },
    download: (bytes, filename) => {
      downloaded.push({ bytes, filename });
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.empty, false);
  assert.equal(result.filename, AGENT_LOG_EXPORT_FILENAME);
  assert.equal(downloaded.length, 1);
  assert.deepEqual(downloaded[0].bytes, RAW);
  assert.equal(downloaded[0].filename, AGENT_LOG_EXPORT_FILENAME);
  const text = Buffer.from(downloaded[0].bytes).toString("utf8");
  assert.match(text, /"apiKey":"KEEP_THIS"/);
  assert.match(text, /"extraField":true/);
  assert.match(text, /not-json/);
  assert.equal(text.includes("[REDACTED]"), false);
  assert.equal(text.includes("KEEP_THIS"), true);
});
