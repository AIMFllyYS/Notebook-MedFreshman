/**
 * MinerU 批量文档解析脚本
 *
 * 用法：
 *   npx tsx scripts/parse-docs.ts --subject probability --files "path1.pdf,path2.pptx"
 *   npx tsx scripts/parse-docs.ts --subject chemistry --files "课件.pptx" --model pipeline
 *
 * 环境变量（从 .env.local 自动加载）：
 *   MinerU_API_Token — MinerU 精准解析 API 的 Bearer Token
 *
 * 产出：
 *   content/_raw/{subject}/{filename}.md
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";

// 加载 .env.local
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
  console.error("");
  console.error("=== 降级方案（见 docs/sop/00-infrastructure.md#容灾降级机制）===");
  console.error("  PDF:  marker_single <file> --output_dir <dir>");
  console.error("        python -c \"import fitz; ...\"  (pymupdf)");
  console.error("  PPTX: python scripts/fallback-pptx.py <file> <output>");
  console.error("  DOCX: pandoc <file> -o <output> --wrap=none");
  console.error("");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

// ─── CLI Args ───────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    subject: { type: "string" },
    files: { type: "string" },
    model: { type: "string", default: "vlm" },
    output: { type: "string" },
  },
});

if (!values.subject || !values.files) {
  console.error("Usage: npx tsx scripts/parse-docs.ts --subject <id> --files <paths>");
  console.error("  --subject   Subject ID (e.g. probability, chemistry)");
  console.error("  --files     Comma-separated file paths");
  console.error("  --model     Model version: vlm (default) | pipeline");
  console.error("  --output    Output directory (default: content/_raw/{subject}/)");
  process.exit(1);
}

const subject = values.subject;
const filePaths = values.files.split(",").map((f) => f.trim()).filter(Boolean);
const modelVersion = values.model || "vlm";
const outputDir = values.output || path.join(process.cwd(), "content", "_raw", subject);

// ─── Ensure output directory ────────────────────────────────────────────────

fs.mkdirSync(outputDir, { recursive: true });

// ─── Step 1: Request upload URLs ────────────────────────────────────────────

interface BatchFile {
  name: string;
  data_id: string;
}

async function requestUploadUrls(files: BatchFile[]): Promise<{ batchId: string; fileUrls: string[] }> {
  const res = await fetch(`${MINERU_API_BASE}/file-urls/batch`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      files,
      model_version: modelVersion,
      enable_formula: true,
      enable_table: true,
      language: "ch",
    }),
  });
  const json = await res.json() as { code: number; msg: string; data: { batch_id: string; file_urls: string[] } };
  if (json.code !== 0) {
    throw new Error(`Failed to get upload URLs: ${json.msg}`);
  }
  return { batchId: json.data.batch_id, fileUrls: json.data.file_urls };
}

// ─── Step 2: Upload files ───────────────────────────────────────────────────

async function uploadFile(filePath: string, uploadUrl: string): Promise<void> {
  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: fileBuffer,
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Upload failed for ${filePath}: HTTP ${res.status}`);
  }
}

// ─── Step 3: Poll for results ───────────────────────────────────────────────

interface ExtractResult {
  file_name: string;
  state: string;
  full_zip_url?: string;
  err_msg?: string;
  data_id?: string;
}

async function pollBatchResults(batchId: string, timeoutMs = 300000): Promise<ExtractResult[]> {
  const start = Date.now();
  const interval = 5000;

  while (Date.now() - start < timeoutMs) {
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
    console.log(`[${elapsed}s] done=${done} running=${running} pending=${pending} failed=${failed}`);

    if (allDone) return results;

    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error(`Polling timed out after ${timeoutMs / 1000}s. batch_id: ${batchId}`);
}

// ─── Image injection from layout.json ──────────────────────────────────────

/**
 * MinerU VLM model extracts images but doesn't include ![]() references in full.md.
 * This function reads layout.json to find image positions and injects references.
 */
function injectImagesFromLayout(
  md: string,
  extractDir: string,
  subject: string,
  baseName: string,
): string {
  const layoutPath = findFile(extractDir, "layout.json");
  if (!layoutPath) return md;

  try {
    const layout = JSON.parse(fs.readFileSync(layoutPath, "utf8"));
    if (!layout.pdf_info) return md;

    // Extract image positions from layout.json
    const imageBlocks: { pageNum: number; text: string; imagePath: string }[] = [];

    for (const page of layout.pdf_info) {
      for (const block of page.para_blocks || []) {
        let imagePath: string | null = null;
        const textParts: string[] = [];

        for (const line of block.lines || []) {
          for (const span of line.spans || []) {
            if (span.image_path) imagePath = span.image_path;
            if (span.content) textParts.push(span.content);
          }
        }

        if (imagePath) {
          imageBlocks.push({
            pageNum: page.page_idx,
            text: textParts.join(" ").slice(0, 100),
            imagePath,
          });
        }
      }
    }

    if (imageBlocks.length === 0) return md;

    // Inject images into markdown at positions matching nearby text
    const lines = md.split("\n");
    const inserted = new Set<string>();
    let injected = 0;

    for (const img of imageBlocks) {
      if (inserted.has(img.imagePath)) continue;

      // Find the best matching line in markdown by searching for text fragments
      const fragments = img.text
        .split(/[，。、；：！？\s]+/)
        .filter((f: string) => f.length >= 6)
        .slice(0, 3);

      let bestLine = -1;
      let bestScore = 0;

      for (let i = 0; i < lines.length; i++) {
        let score = 0;
        for (const frag of fragments) {
          if (lines[i].includes(frag)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          bestLine = i;
        }
      }

      if (bestLine >= 0 && bestScore >= 1) {
        const imgRef = `\n![](/images/${subject}/${baseName}/${img.imagePath})\n`;
        lines.splice(bestLine + 1, 0, imgRef);
        inserted.add(img.imagePath);
        injected++;
      }
    }

    if (injected > 0) {
      console.log(`  🔗 Injected ${injected} image references from layout.json`);
    }

    return lines.join("\n");
  } catch (e) {
    console.warn(`  ⚠ Failed to inject images from layout.json: ${(e as Error).message}`);
    return md;
  }
}

// ─── Step 4: Download and extract markdown ──────────────────────────────────

async function downloadAndExtractMarkdown(zipUrl: string, outputPath: string): Promise<void> {
  const res = await fetch(zipUrl);
  if (!res.ok) throw new Error(`Failed to download zip: HTTP ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  const zipPath = outputPath.replace(/\.md$/, ".zip");
  fs.writeFileSync(zipPath, Buffer.from(arrayBuffer));

  try {
    const { execSync } = await import("node:child_process");
    const extractDir = zipPath.replace(/\.zip$/, "_extracted");
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(
      `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`,
      { stdio: "pipe" },
    );

    const fullMdPath = findFile(extractDir, "full.md");
    if (fullMdPath) {
      fs.copyFileSync(fullMdPath, outputPath);
      console.log(`  → ${path.basename(outputPath)}`);

      // Preserve images/ folder from MinerU zip and rewrite paths in markdown
      const mdParentDir = path.dirname(fullMdPath);
      const imagesDir = path.join(mdParentDir, "images");
      if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
        const baseName = path.basename(outputPath, ".md");
        const publicImagesDir = path.join(
          process.cwd(), "public", "images", subject, baseName,
        );
        fs.mkdirSync(publicImagesDir, { recursive: true });
        copyDirRecursive(imagesDir, publicImagesDir);
        const imgCount = fs.readdirSync(publicImagesDir).length;
        console.log(`  📷 ${imgCount} images → public/images/${subject}/${baseName}/`);

        // Rewrite relative image paths in the markdown to absolute public paths
        let md = fs.readFileSync(outputPath, "utf8");
        md = md.replace(
          /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
          `![$1](/images/${subject}/${baseName}/$2)`,
        );

        // NEW: If no image references in md, inject from layout.json
        if (!md.includes("![](")) {
          md = injectImagesFromLayout(md, extractDir, subject, baseName);
        }

        fs.writeFileSync(outputPath, md, "utf8");
      }
    } else {
      console.warn(`  ⚠ full.md not found in zip for ${path.basename(outputPath)}`);
    }

    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
  } catch (e) {
    console.error(`  ✗ Failed to extract: ${(e as Error).message}`);
  }
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
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

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== MinerU Document Parser ===`);
  console.log(`Subject: ${subject}`);
  console.log(`Model: ${modelVersion}`);
  console.log(`Files: ${filePaths.length}`);
  console.log(`Output: ${outputDir}\n`);

  // Validate files exist
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) {
      console.error(`ERROR: File not found: ${fp}`);
      process.exit(1);
    }
  }

  // Batch in groups of 50 (API limit)
  const batchSize = 50;
  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);
    console.log(`--- Batch ${Math.floor(i / batchSize) + 1} (${batch.length} files) ---`);

    // Prepare file metadata
    const batchFiles: BatchFile[] = batch.map((fp) => ({
      name: path.basename(fp),
      data_id: path.basename(fp, path.extname(fp)).replace(/[^a-zA-Z0-9_.-]/g, "_"),
    }));

    // Step 1: Get upload URLs
    console.log("Requesting upload URLs...");
    const { batchId, fileUrls } = await requestUploadUrls(batchFiles);
    console.log(`batch_id: ${batchId}`);

    // Step 2: Upload files
    console.log("Uploading files...");
    for (let j = 0; j < batch.length; j++) {
      await uploadFile(batch[j], fileUrls[j]);
      console.log(`  ✓ ${path.basename(batch[j])}`);
    }

    // Step 3: Poll for results
    console.log("Waiting for parsing results...");
    const results = await pollBatchResults(batchId);

    // Step 4: Download markdown
    console.log("Downloading results...");
    for (const result of results) {
      if (result.state === "done" && result.full_zip_url) {
        const baseName = result.file_name.replace(/\.[^.]+$/, "");
        const outPath = path.join(outputDir, `${baseName}.md`);
        await downloadAndExtractMarkdown(result.full_zip_url, outPath);
      } else if (result.state === "failed") {
        console.error(`  ✗ ${result.file_name}: ${result.err_msg}`);
      }
    }
  }

  console.log(`\n✓ Done. Output: ${outputDir}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  console.error("");
  console.error("=== 降级方案（见 docs/sop/00-infrastructure.md#容灾降级机制）===");
  console.error("  PDF:  marker_single <file> --output_dir <dir>");
  console.error("  PPTX: python scripts/fallback-pptx.py <file> <output>");
  console.error("  DOCX: pandoc <file> -o <output> --wrap=none");
  console.error("");
  process.exit(1);
});
