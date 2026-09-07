// 离线索引构建脚本：生成 bm25.json + chunks-meta.json + vectors.bin 到 content/.index/
// 用法:
//   npx tsx scripts/build-index.ts              # BM25 + 增量补齐向量
//   npx tsx scripts/build-index.ts --bm25-only  # 只重建关键词索引
//   npx tsx scripts/build-index.ts --vectors    # 只补齐缺失向量
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

// 手动加载 .env.local（Next.js 不在 CLI 脚本中自动加载）
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch { /* file not found is ok */ }
}
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

// ── BM25 分词：中文 bigram + 英文空格分割小写 ──

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let englishBuf = '';

  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x4dff && code < 0x9fff) {
      if (englishBuf.trim()) {
        tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
        englishBuf = '';
      }
      tokens.push(char);
    } else if (/[a-zA-Z0-9]/.test(char)) {
      englishBuf += char;
    } else {
      if (englishBuf.trim()) {
        tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
        englishBuf = '';
      }
    }
  }
  if (englishBuf.trim()) {
    tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
  }

  // 中文 bigram
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i]);
    if (
      i < tokens.length - 1 &&
      tokens[i].length === 1 &&
      tokens[i + 1].length === 1 &&
      tokens[i].codePointAt(0)! > 0x4dff &&
      tokens[i + 1].codePointAt(0)! > 0x4dff
    ) {
      result.push(tokens[i] + tokens[i + 1]);
    }
  }

  return result;
}

// ── 索引数据结构 ──

interface ChunkData {
  id: string;
  path: string;
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;
  chunkIndex: number;
  text: string;
  contextPrefix: string;
}

interface BM25Index {
  builtAt: string;
  avgDocLen: number;
  docCount: number;
  invertedIndex: Record<string, { df: number; postings: Array<{ id: string; tf: number }> }>;
  docLengths: Record<string, number>;
}

function buildBM25Index(chunks: ChunkData[]): BM25Index {
  const invertedIndex: Record<string, { df: number; postings: Array<{ id: string; tf: number }> }> = {};
  const docLengths: Record<string, number> = {};
  let totalLen = 0;

  for (const chunk of chunks) {
    const terms = tokenize(chunk.text);
    docLengths[chunk.id] = terms.length;
    totalLen += terms.length;

    const termFreqs: Record<string, number> = {};
    for (const term of terms) {
      termFreqs[term] = (termFreqs[term] || 0) + 1;
    }

    for (const [term, tf] of Object.entries(termFreqs)) {
      if (!invertedIndex[term]) {
        invertedIndex[term] = { df: 0, postings: [] };
      }
      invertedIndex[term].df += 1;
      invertedIndex[term].postings.push({ id: chunk.id, tf });
    }
  }

  return {
    builtAt: new Date().toISOString(),
    avgDocLen: chunks.length > 0 ? totalLen / chunks.length : 0,
    docCount: chunks.length,
    invertedIndex,
    docLengths,
  };
}

function hashText(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 16);
}

function contentHashOf(chunks: ChunkData[]): string {
  const h = createHash('sha256');
  for (const c of chunks) {
    h.update(c.id);
    h.update('\n');
    h.update(c.text);
    h.update('\n');
  }
  return h.digest('hex');
}

interface EmbedCache {
  model: string;
  dimension: number;
  hashes: Record<string, string>;
  vectors: Map<string, number[]>;
}

function readJsonIfExists<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function loadEmbedCache(indexDir: string): EmbedCache {
  const cache: EmbedCache = {
    model: process.env.AI_EMBEDDING_MODEL || 'BAAI/bge-m3',
    dimension: 0,
    hashes: {},
    vectors: new Map(),
  };

  const progressMeta = readJsonIfExists<{
    model?: string;
    dimension?: number;
    hashes?: Record<string, string>;
  }>(path.join(indexDir, 'embed-cache.meta.json'));
  const progressIds = readJsonIfExists<string[]>(path.join(indexDir, 'embed-cache.ids.json'));
  const progressBin = (() => {
    try {
      return fs.readFileSync(path.join(indexDir, 'embed-cache.bin'));
    } catch {
      return null;
    }
  })();

  if (progressMeta?.hashes) cache.hashes = progressMeta.hashes;
  if (progressMeta?.model) cache.model = progressMeta.model;

  const ingest = (ids: string[], buf: Buffer, dimensionHint?: number) => {
    const copy = new Uint8Array(buf.byteLength);
    copy.set(buf);
    const floats = new Float32Array(copy.buffer);
    const dim = dimensionHint || (ids.length > 0 ? Math.floor(floats.length / ids.length) : 0);
    if (!dim || dim * ids.length !== floats.length) return;
    cache.dimension = dim;
    for (let i = 0; i < ids.length; i++) {
      cache.vectors.set(ids[i], Array.from(floats.subarray(i * dim, (i + 1) * dim)));
    }
  };

  if (progressIds && progressBin) ingest(progressIds, progressBin, progressMeta?.dimension);

  const finalIds = readJsonIfExists<string[]>(path.join(indexDir, 'vectors.ids.json'));
  const finalBin = (() => {
    try {
      return fs.readFileSync(path.join(indexDir, 'vectors.bin'));
    } catch {
      return null;
    }
  })();
  if (finalIds && finalBin) ingest(finalIds, finalBin);

  return cache;
}

function writeFloat32Bin(filePath: string, rows: number[][]): void {
  if (!rows.length) {
    fs.writeFileSync(filePath, Buffer.alloc(0));
    return;
  }
  const dim = rows[0].length;
  const buf = Buffer.allocUnsafe(rows.length * dim * 4);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let d = 0; d < dim; d++) {
      buf.writeFloatLE(row[d] ?? 0, (i * dim + d) * 4);
    }
  }
  fs.writeFileSync(filePath, buf);
}

function persistCache(indexDir: string, cache: EmbedCache, orderedIds: string[]): void {
  const ids = orderedIds.filter((id) => cache.vectors.has(id));
  const rows = ids.map((id) => cache.vectors.get(id)!);
  writeFloat32Bin(path.join(indexDir, 'embed-cache.bin'), rows);
  fs.writeFileSync(path.join(indexDir, 'embed-cache.ids.json'), JSON.stringify(ids));
  fs.writeFileSync(
    path.join(indexDir, 'embed-cache.meta.json'),
    JSON.stringify({ model: cache.model, dimension: cache.dimension, hashes: cache.hashes }),
  );
}

async function embedBatchWithRetry(
  embedding: { embedBatch: (texts: string[]) => Promise<number[][]> },
  texts: string[],
  retries = 6,
): Promise<number[][]> {
  let delay = 2000;
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await embedding.embedBatch(texts);
    } catch (err) {
      lastErr = err;
      const msg = String(err);
      const rateLimited = msg.includes('429') || /rate limit|TPM limit/i.test(msg);
      if (!rateLimited || attempt === retries - 1) throw err;
      console.warn(`\n   ⏳ rate limited, retry ${attempt + 1}/${retries} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 60000);
    }
  }
  throw lastErr;
}

function finalizeVectors(indexDir: string, chunks: ChunkData[], cache: EmbedCache, contentHash: string): number {
  const ids = chunks.filter((c) => cache.vectors.has(c.id)).map((c) => c.id);
  const rows = ids.map((id) => cache.vectors.get(id)!);
  const dimension = cache.dimension || rows[0]?.length || 0;
  writeFloat32Bin(path.join(indexDir, 'vectors.bin'), rows);
  fs.writeFileSync(path.join(indexDir, 'vectors.ids.json'), JSON.stringify(ids));
  const manifest = {
    version: 2 as const,
    builtAt: new Date().toISOString(),
    embeddingModel: cache.model,
    dimension,
    chunkCount: chunks.length,
    vectorCount: ids.length,
    contentHash,
    files: ['bm25.json', 'chunks-meta.json', 'vectors.bin', 'vectors.ids.json', 'manifest.json'],
  };
  fs.writeFileSync(path.join(indexDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return ids.length;
}

// ── 主流程 ──

async function main() {
  // 动态导入（确保 env 已加载）
  const { generateChunks } = await import('../lib/ai/indexing/chunker');
  const { SiliconFlowEmbedding } = await import('../lib/ai/embedding');

  const indexDir = path.join(process.cwd(), 'content', '.index');
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }

  console.log('🔍 Generating chunks from content tree...');
  const chunks = generateChunks();
  console.log(`   → ${chunks.length} chunks generated`);

  if (!chunks.length) {
    console.error('❌ No chunks generated. Check content files.');
    process.exit(1);
  }

  // ── BM25 索引（不依赖 embedding，必须先落盘）──
  console.log('📑 Building BM25 inverted index...');
  const bm25Index = buildBM25Index(chunks);
  const bm25Path = path.join(indexDir, 'bm25.json');
  fs.writeFileSync(bm25Path, JSON.stringify(bm25Index));
  console.log(`   → BM25 index written to ${bm25Path} (${(fs.statSync(bm25Path).size / 1024 / 1024).toFixed(2)} MB)`);

  const chunksMeta = {
    builtAt: new Date().toISOString(),
    chunks: chunks.map((c) => ({
      id: c.id,
      path: c.path,
      subjectId: c.subjectId,
      subjectName: c.subjectName,
      categoryId: c.categoryId,
      itemId: c.itemId,
      title: c.title,
      chunkIndex: c.chunkIndex,
      text: c.text,
    })),
  };
  const chunksMetaPath = path.join(indexDir, 'chunks-meta.json');
  fs.writeFileSync(chunksMetaPath, JSON.stringify(chunksMeta));
  console.log(`   → Chunks meta written to ${chunksMetaPath}`);

  const { academicYearOfSubject } = await import('../lib/constants/academic-year');
  const sophomoreCount = chunks.filter((c) => academicYearOfSubject(c.subjectId) === 'sophomore-1').length;
  console.log(`   → Sophomore textbook/detail chunks: ${sophomoreCount}`);

  const contentHash = contentHashOf(chunks);
  const skipVectors = process.argv.includes('--bm25-only');
  const staleJson = path.join(indexDir, 'vectors.json');
  if (fs.existsSync(staleJson)) {
    fs.unlinkSync(staleJson);
    console.log('   → Removed legacy vectors.json (改用 vectors.bin，避免与 BM25 混代)');
  }

  if (skipVectors) {
    const cache = loadEmbedCache(indexDir);
    const kept = finalizeVectors(indexDir, chunks, cache, contentHash);
    console.log(`\n✅ BM25-only index build complete! 保留已有向量 ${kept}/${chunks.length}`);
    console.log(`   Chunks: ${chunks.length}`);
    console.log(`   BM25 terms: ${Object.keys(bm25Index.invertedIndex).length}`);
    return;
  }

  // ── 向量索引（增量：只 embed 缺失或正文已变的 chunk；大二优先）──
  console.log('🧠 Generating embeddings via SiliconFlow API...');
  console.log(`   Model: ${process.env.AI_EMBEDDING_MODEL || 'BAAI/bge-m3'}`);
  console.log(`   API: ${process.env.AI_BASE_URL || '(not set)'}`);
  const embedding = new SiliconFlowEmbedding();
  const cache = loadEmbedCache(indexDir);
  cache.model = process.env.AI_EMBEDDING_MODEL || cache.model || 'BAAI/bge-m3';

  const sophomoreFirst = [
    ...chunks.filter((c) => academicYearOfSubject(c.subjectId) === 'sophomore-1'),
    ...chunks.filter((c) => academicYearOfSubject(c.subjectId) !== 'sophomore-1'),
  ];
  const missing = sophomoreFirst.filter((c) => {
    const hash = hashText(c.contextPrefix + '\n' + c.text);
    const cached = cache.vectors.get(c.id);
    return !cached || cache.hashes[c.id] !== hash;
  });
  console.log(`   → Cached vectors: ${cache.vectors.size}; to embed: ${missing.length}`);

  const batchSize = 32;
  let embedded = 0;
  let failedBatches = 0;
  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    const texts = batch.map((c) => c.contextPrefix + '\n' + c.text);
    try {
      const vectors = await embedBatchWithRetry(embedding, texts);
      if (!cache.dimension && vectors[0]?.length) cache.dimension = vectors[0].length;
      for (let j = 0; j < batch.length; j++) {
        if (!vectors[j]?.length) continue;
        cache.vectors.set(batch[j].id, vectors[j]);
        cache.hashes[batch[j].id] = hashText(texts[j]);
      }
      embedded += batch.length;
      failedBatches = 0;
      const pct = missing.length ? ((embedded / missing.length) * 100).toFixed(1) : '100.0';
      process.stdout.write(`\r   → Progress: ${embedded}/${missing.length} (${pct}%)`);
      if (embedded % (batchSize * 8) === 0 || i + batchSize >= missing.length) {
        persistCache(indexDir, cache, sophomoreFirst.map((c) => c.id));
        console.log(`\n   → checkpoint ${embedded}/${missing.length} vectors=${cache.vectors.size}`);
      }
    } catch (err) {
      failedBatches += 1;
      console.error(`\n⚠ Embedding API error at batch starting index ${i}:`, err);
      persistCache(indexDir, cache, sophomoreFirst.map((c) => c.id));
      if (failedBatches >= 5) {
        console.error('   → 连续失败过多，停止请求；已写入的向量会保留，下次可续跑。');
        break;
      }
    }
    if (i + batchSize < missing.length) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  console.log('');

  const vectorCount = finalizeVectors(indexDir, chunks, cache, contentHash);
  const vectorBinPath = path.join(indexDir, 'vectors.bin');
  const vectorSize = fs.existsSync(vectorBinPath)
    ? (fs.statSync(vectorBinPath).size / 1024 / 1024).toFixed(2)
    : '0';
  console.log(`   → Vector index written to ${vectorBinPath} (${vectorSize} MB, ${vectorCount} vectors)`);

  for (const leftover of ['embed-cache.bin', 'embed-cache.ids.json', 'embed-cache.meta.json']) {
    const p = path.join(indexDir, leftover);
    if (fs.existsSync(p) && vectorCount === chunks.length) fs.unlinkSync(p);
  }

  console.log('\n✅ Index build complete!');
  console.log(`   Chunks: ${chunks.length}`);
  console.log(`   Vectors: ${vectorCount}`);
  console.log(`   Dimension: ${cache.dimension || 'n/a'}`);
  console.log(`   BM25 terms: ${Object.keys(bm25Index.invertedIndex).length}`);
  if (vectorCount < chunks.length) {
    console.log(`⚠ PARTIAL vectors: ${vectorCount}/${chunks.length} — rerun pnpm build-index to resume`);
  }

  // ── 上传到 COS（可选）──
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;

  if (secretId && secretKey && bucket && region) {
    console.log('\n☁️  Uploading index files to COS...');
    try {
      const COS = (await import('cos-nodejs-sdk-v5')).default;
      const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

      for (const filename of ['bm25.json', 'chunks-meta.json', 'vectors.bin', 'vectors.ids.json', 'manifest.json']) {
        const localPath = path.join(indexDir, filename);
        if (!fs.existsSync(localPath)) {
          console.log(`   · skip ${filename} (missing)`);
          continue;
        }
        const key = `index/${filename}`;
        const size = (fs.statSync(localPath).size / 1024 / 1024).toFixed(2);
        await new Promise<void>((resolve, reject) => {
          cos.putObject(
            {
              Bucket: bucket,
              Region: region,
              Key: key,
              Body: fs.createReadStream(localPath),
              ContentType: filename.endsWith('.bin') ? 'application/octet-stream' : 'application/json',
            },
            (err: unknown, _data: unknown) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
        console.log(`   ✓ index/${filename} (${size} MB)`);
      }
      console.log(`\n   COS_INDEX_BASE_URL=https://${bucket}.cos.${region}.myqcloud.com/index/`);
    } catch (e) {
      console.error('   ✗ COS upload failed:', e);
    }
  } else {
    console.log('\n   (跳过 COS 上传：未设置 COS_SECRET_ID/COS_SECRET_KEY/COS_BUCKET/COS_REGION)');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
