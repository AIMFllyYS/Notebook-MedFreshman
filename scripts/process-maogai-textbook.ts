/**
 * 毛概教材 PDF → MinerU 解析脚本
 *
 * 用法：
 *   npx tsx scripts/process-maogai-textbook.ts
 *
 * 环境变量（从 .env.local 自动加载）：
 *   MinerU_API_Token
 *
 * 输入：
 *   C:\Users\AIMFl\OneDrive\文档\课程文件\毛概\教材\*.pdf
 *
 * 产出：
 *   scripts/temp/maogai-textbook/raw/{slug}/full.md
 *   scripts/temp/maogai-textbook/raw/{slug}/images/*
 *   scripts/temp/maogai-textbook/raw/_meta.json
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Load .env.local ────────────────────────────────────────────────────────

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const MINERU_API_BASE = "https://mineru.net/api/v4";
const TOKEN = process.env.MinerU_API_Token;

if (!TOKEN) {
  console.error("ERROR: MinerU_API_Token not found in .env.local");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

// ─── Configuration ──────────────────────────────────────────────────────────

const PDF_DIR = path.normalize("C:/Users/AIMFl/OneDrive/文档/课程文件/毛概/教材");
const OUTPUT_ROOT = path.join(process.cwd(), "scripts", "temp", "maogai-textbook", "raw");
const META_FILE = path.join(OUTPUT_ROOT, "_meta.json");

const SLUG_MAP: Record<string, string> = {
  "毛概-教材-目录": "toc",
  "毛概-教材-导论马克思主义中国化时代化的历史进程与理论成果": "ch00",
  "毛概-教材-第一章-毛泽东思想及其历史地位": "ch01",
  "毛概-教材-第二章-新民主主义革命理论": "ch02",
  "毛概-教材-第三章-社会主义改造理论": "ch03",
  "毛概-教材-第四章-社会主义建设道路初步探索的理论成果": "ch04",
  "毛概-教材-第五章-中国特色社会主义理论体系的形式发展": "ch05",
  "毛概-教材-第六章-邓小平理论": "ch06",
  "毛概-教材-第七章-三个代表重要思想": "ch07",
  "毛概-教材-第八章-科学发展观": "ch08",
  "毛概-教材-后记与结语": "epilogue",
};

const BATCH_SIZE = 50;
const POLL_TIMEOUT_MS = 600000; // 10 min
const POLL_INTERVAL_MS = 5000;

// ─── Types ──────────────────────────────────────────────────────────────────

interface BatchFile {
  name: string;
  data_id: string;
  slug: string;
  filePath: string;
}

interface ExtractResult {
  file_name: string;
  state: string;
  full_zip_url?: string;
  err_msg?: string;
  data_id?: string;
}

interface MetaEntry {
  slug: string;
  fileName: string;
  filePath: string;
  batchId: string;
  dataId: string;
  state: string;
  startedAt: string;
  finishedAt?: string;
  error?: string;
  outputDir: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirRecursive(src: string, dest: string): void {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findFile(dir: string, target: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(fullPath, target);
      if (found) return found;
    } else if (entry.name === target) {
      return fullPath;
    }
  }
  return null;
}

function slugifyFileName(fileName: string): string {
  if (typeof fileName !== "string") {
    throw new Error(`slugifyFileName expected string, got ${typeof fileName}`);
  }
  const base = fileName.replace(/\.pdf$/i, "");
  return SLUG_MAP[base] ?? base.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_");
}

// ─── MinerU API ─────────────────────────────────────────────────────────────

async function requestUploadUrls(files: BatchFile[]): Promise<{ batchId: string; fileUrls: string[] }> {
  const body = JSON.stringify({
    files: files.map((f) => ({ name: f.name, data_id: f.data_id })),
    model_version: "vlm",
    enable_formula: true,
    enable_table: true,
    language: "ch",
  });
  console.log("  Request body preview:", body.slice(0, 400));
  const res = await fetch(`${MINERU_API_BASE}/file-urls/batch`, {
    method: "POST",
    headers: HEADERS,
    body,
  });
  const json = await res.json() as { code: number; msg: string; data?: { batch_id?: string; file_urls?: string[] } };
  console.log("  Response:", JSON.stringify(json).slice(0, 400));
  if (json.code !== 0) {
    throw new Error(`Failed to get upload URLs: ${json.msg}`);
  }
  if (!json.data || !json.data.batch_id || !Array.isArray(json.data.file_urls)) {
    throw new Error(`Unexpected response structure: ${JSON.stringify(json)}`);
  }
  return { batchId: json.data.batch_id, fileUrls: json.data.file_urls };
}

async function uploadFile(filePath: string, uploadUrl: string): Promise<void> {
  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(uploadUrl, { method: "PUT", body: fileBuffer });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Upload failed for ${path.basename(filePath)}: HTTP ${res.status}`);
  }
}

async function pollBatchResults(batchId: string): Promise<ExtractResult[]> {
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const res = await fetch(`${MINERU_API_BASE}/extract-results/batch/${batchId}`, {
      method: "GET",
      headers: HEADERS,
    });
    const json = await res.json() as { code: number; data: { extract_result: ExtractResult[] } };
    if (json.code !== 0) {
      throw new Error(`Poll failed: code ${json.code}`);
    }

    const results = json.data.extract_result;
    const allDone = results.every((r) => r.state === "done" || r.state === "failed");
    const elapsed = Math.round((Date.now() - start) / 1000);
    const running = results.filter((r) => r.state === "running").length;
    const pending = results.filter((r) => r.state === "pending" || r.state === "waiting-file").length;
    const done = results.filter((r) => r.state === "done").length;
    const failed = results.filter((r) => r.state === "failed").length;
    console.log(`  [${elapsed}s] done=${done} running=${running} pending=${pending} failed=${failed}`);

    if (allDone) return results;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`Polling timed out after ${POLL_TIMEOUT_MS / 1000}s. batch_id: ${batchId}`);
}

async function downloadAndExtract(zipUrl: string, outputDir: string): Promise<void> {
  const res = await fetch(zipUrl);
  if (!res.ok) throw new Error(`Failed to download zip: HTTP ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  const zipPath = path.join(outputDir, "_mineru.zip");
  fs.writeFileSync(zipPath, Buffer.from(arrayBuffer));

  const extractDir = path.join(outputDir, "_extracted");
  ensureDir(extractDir);

  try {
    const { execSync } = await import("node:child_process");
    execSync(
      `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`,
      { stdio: "pipe" },
    );

    const fullMdPath = findFile(extractDir, "full.md");
    if (fullMdPath) {
      fs.copyFileSync(fullMdPath, path.join(outputDir, "full.md"));
      console.log(`    → full.md`);

      const mdParentDir = path.dirname(fullMdPath);
      const imagesDir = path.join(mdParentDir, "images");
      if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
        const destImagesDir = path.join(outputDir, "images");
        copyDirRecursive(imagesDir, destImagesDir);
        const imgCount = fs.readdirSync(destImagesDir).length;
        console.log(`    → ${imgCount} images`);
      }
    } else {
      console.warn(`    ⚠ full.md not found in zip`);
    }
  } finally {
    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  ensureDir(OUTPUT_ROOT);

  if (!fs.existsSync(PDF_DIR)) {
    console.error(`ERROR: PDF directory not found: ${PDF_DIR}`);
    process.exit(1);
  }

  const pdfFiles = fs
    .readdirSync(PDF_DIR)
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => path.join(PDF_DIR, f))
    .sort();

  if (pdfFiles.length === 0) {
    console.error("ERROR: No PDF files found in input directory");
    process.exit(1);
  }

  console.log(`=== 毛概教材 MinerU 解析 ===`);
  console.log(`PDF 目录: ${PDF_DIR}`);
  console.log(`发现 ${pdfFiles.length} 个 PDF\n`);

  const meta: MetaEntry[] = [];

  // Build batch files
  const batchFiles: BatchFile[] = pdfFiles.map((filePath) => {
    const fileName = path.basename(filePath);
    const slug = slugifyFileName(fileName);
    const dataId = slug.replace(/[^a-zA-Z0-9_.-]/g, "_");
    return { name: fileName, data_id: dataId, slug, filePath };
  });

  // Validate slug mapping
  for (const bf of batchFiles) {
    const base = bf.name.replace(/\.pdf$/i, "");
    if (!SLUG_MAP[base]) {
      console.warn(`⚠ 未在 SLUG_MAP 中映射的文件: ${bf.name}，将使用自动 slug: ${bf.slug}`);
    }
  }

  // Process in batches
  for (let i = 0; i < batchFiles.length; i += BATCH_SIZE) {
    const batch = batchFiles.slice(i, i + BATCH_SIZE);
    console.log(`--- Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} files) ---`);

    const { batchId, fileUrls } = await requestUploadUrls(batch);
    console.log(`batch_id: ${batchId}`);

    console.log("Uploading files...");
    for (let j = 0; j < batch.length; j++) {
      await uploadFile(batch[j].filePath, fileUrls[j]);
      console.log(`  ✓ ${batch[j].name} → slug=${batch[j].slug}`);
    }

    console.log("Waiting for parsing results...");
    const results = await pollBatchResults(batchId);

    console.log("Downloading results...");
    for (const result of results) {
      const bf = batch.find((b) => b.name === result.file_name);
      if (!bf) {
        console.error(`  ✗ 无法匹配结果: ${result.file_name}`);
        continue;
      }

      const outputDir = path.join(OUTPUT_ROOT, bf.slug);
      ensureDir(outputDir);

      const entry: MetaEntry = {
        slug: bf.slug,
        fileName: result.file_name,
        filePath: bf.filePath,
        batchId,
        dataId: bf.data_id,
        state: result.state,
        startedAt: new Date().toISOString(),
        outputDir,
      };

      if (result.state === "done" && result.full_zip_url) {
        try {
          await downloadAndExtract(result.full_zip_url, outputDir);
          entry.finishedAt = new Date().toISOString();
        } catch (e) {
          entry.state = "download_failed";
          entry.error = (e as Error).message;
          console.error(`  ✗ ${result.file_name}: ${entry.error}`);
        }
      } else if (result.state === "failed") {
        entry.error = result.err_msg;
        console.error(`  ✗ ${result.file_name}: ${result.err_msg}`);
      }

      meta.push(entry);
    }
  }

  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), "utf8");

  const success = meta.filter((m) => m.state === "done").length;
  const failed = meta.filter((m) => m.state !== "done").length;
  console.log(`\n=== 完成 ===`);
  console.log(`成功: ${success}/${meta.length}`);
  console.log(`失败: ${failed}/${meta.length}`);
  console.log(`元数据: ${META_FILE}`);
  console.log(`输出目录: ${OUTPUT_ROOT}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
