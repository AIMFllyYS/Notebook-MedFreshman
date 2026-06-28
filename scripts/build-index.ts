// 离线索引构建脚本：生成 vectors.json + bm25.json 到 content/.index/
// 用法: npx tsx scripts/build-index.ts
import * as fs from 'node:fs';
import * as path from 'node:path';

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

interface VectorIndex {
  model: string;
  dimension: number;
  builtAt: string;
  chunks: Array<{
    id: string;
    path: string;
    subjectId: string;
    subjectName: string;
    categoryId: string;
    itemId: string;
    title: string;
    chunkIndex: number;
    text: string;
    vector: number[];
  }>;
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

  // ── BM25 索引 ──
  console.log('📑 Building BM25 inverted index...');
  const bm25Index = buildBM25Index(chunks);
  const bm25Path = path.join(indexDir, 'bm25.json');
  fs.writeFileSync(bm25Path, JSON.stringify(bm25Index));
  console.log(`   → BM25 index written to ${bm25Path} (${(fs.statSync(bm25Path).size / 1024 / 1024).toFixed(2)} MB)`);

  // ── 向量索引 ──
  console.log('🧠 Generating embeddings via SiliconFlow API...');
  console.log(`   Model: ${process.env.AI_EMBEDDING_MODEL || 'BAAI/bge-m3'}`);
  console.log(`   API: ${process.env.AI_BASE_URL || '(not set)'}`);
  const embedding = new SiliconFlowEmbedding();

  const textsToEmbed = chunks.map((c) => c.contextPrefix + '\n' + c.text);
  const batchSize = 32;
  const allVectors: number[][] = new Array(textsToEmbed.length);
  let processedCount = 0;

  for (let i = 0; i < textsToEmbed.length; i += batchSize) {
    const batch = textsToEmbed.slice(i, i + batchSize);
    try {
      const vectors = await embedding.embedBatch(batch);
      for (let j = 0; j < vectors.length; j++) {
        allVectors[i + j] = vectors[j];
      }
      processedCount += batch.length;
      const pct = ((processedCount / textsToEmbed.length) * 100).toFixed(1);
      process.stdout.write(`\r   → Progress: ${processedCount}/${textsToEmbed.length} (${pct}%)`);
    } catch (err) {
      console.error(`\n❌ Embedding API error at batch starting index ${i}:`, err);
      process.exit(1);
    }

    // Rate limit: brief pause between batches
    if (i + batchSize < textsToEmbed.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  console.log('');

  const dimension = allVectors[0]?.length ?? 1024;

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

  const vectorIndex: VectorIndex = {
    model: process.env.AI_EMBEDDING_MODEL || 'BAAI/bge-m3',
    dimension,
    builtAt: new Date().toISOString(),
    chunks: chunks.map((c, i) => ({
      id: c.id,
      path: c.path,
      subjectId: c.subjectId,
      subjectName: c.subjectName,
      categoryId: c.categoryId,
      itemId: c.itemId,
      title: c.title,
      chunkIndex: c.chunkIndex,
      text: c.text,
      vector: allVectors[i],
    })),
  };

  const vectorPath = path.join(indexDir, 'vectors.json');
  fs.writeFileSync(vectorPath, JSON.stringify(vectorIndex));
  console.log(`   → Vector index written to ${vectorPath} (${(fs.statSync(vectorPath).size / 1024 / 1024).toFixed(2)} MB)`);

  console.log('\n✅ Index build complete!');
  console.log(`   Chunks: ${chunks.length}`);
  console.log(`   Dimension: ${dimension}`);
  console.log(`   BM25 terms: ${Object.keys(bm25Index.invertedIndex).length}`);

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

      for (const filename of ['bm25.json', 'vectors.json', 'chunks-meta.json']) {
        const localPath = path.join(indexDir, filename);
        const key = `index/${filename}`;
        const size = (fs.statSync(localPath).size / 1024 / 1024).toFixed(2);
        await new Promise<void>((resolve, reject) => {
          cos.putObject(
            {
              Bucket: bucket,
              Region: region,
              Key: key,
              Body: fs.createReadStream(localPath),
              ContentType: 'application/json',
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
