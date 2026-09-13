# 15 · 检索工具失效根因分析与 RAG 修复方案

> 状态：**分析完成，未做任何代码修改**。本文是 2026-09-08 对 `searchNotes` 工具"未检索到相关内容"问题的完整调查记录、根因定性与分阶段解决方案。
>
> 结论先行：**嵌入模型、向量索引、BM25 在代码层面全部正常**；失效来自"索引分发断裂 + 索引设计缺陷 + 零可观测性"三者叠加。部署平台已从腾讯云 EdgeOne 迁到自托管服务器，但代码与文档仍按 EdgeOne/COS 架构运转，这是分发断裂的直接背景。

---

## 目录

- [0. 执行摘要](#0-执行摘要)
- [1. 症状与环境](#1-症状与环境)
- [2. 检索链路全景](#2-检索链路全景)
- [3. 验证记录](#3-验证记录)
- [4. 根因分析](#4-根因分析)
- [5. 澄清："嵌入模型和向量模型没工作"的感觉从哪来](#5-澄清嵌入模型和向量模型没工作的感觉从哪来)
- [6. 解决方案（分阶段）](#6-解决方案分阶段)
- [7. 文档与代码清洗清单（EdgeOne / COS 残留）](#7-文档与代码清洗清单edgeone--cos-残留)
- [8. 风险、开放问题与需要确认的事项](#8-风险开放问题与需要确认的事项)
- [附录 A · 复现与验证命令](#附录-a--复现与验证命令)
- [附录 B · 关键代码定位索引](#附录-b--关键代码定位索引)

---

## 0. 执行摘要

| 维度 | 结论 |
|---|---|
| 嵌入模型（SiliconFlow `BAAI/bge-m3`） | **正常**。查询向量 1024 维，与索引维度一致 |
| 向量索引（`vectors.bin`） | **正常**。32688 条 × 1024 维，字节数与 ids 严格对齐 |
| BM25 索引（`bm25.json`） | **正常但过重**。340 MB，加载 3 s，heap 1.5 GB |
| Rerank（`bge-reranker-v2-m3`） | **正常** |
| 本地端到端 `hybridSearch("绪论", 大二上, 偏好 cell-biology)` | **返回 6 条** |
| **主根因 R1** | `content/.index/` 被 gitignore，自托管服务器上没有索引 → 回退到 COS → COS 上是 **2026-06-23 的旧索引（9778 docs，仅大一五科）** → 学年过滤（大二上）把全部结果过滤掉 → 生产环境禁用子串兜底 → 返回空 |
| **主根因 R2** | BM25 只索引 chunk 正文，**章节标题/面包屑不入索引**；rerank 也只看正文。"绪论"这种只在标题里出现的词在细胞生物学下 0 命中 |
| **主根因 R3** | 检索链路所有失败均被 `catch {}` 静默吞掉，无日志、无指标，"没命中"与"API 挂了/索引没加载"不可区分 |
| 平台错位 | 部署已迁到自托管服务器，但 `next.config.mjs`、`build` 脚本、`edgeone.json`、`indexIo.ts`/`bm25Store.ts` 的 COS 回退、23 个文档文件仍按 EdgeOne + COS 架构编写 |

修复优先级：**R1（止血） → R3（加日志） → R2（标题入索引） → 存储瘦身 → 文档/代码清洗**。

---

## 1. 症状与环境

### 1.1 症状

用户在「医学细胞生物学 > 教材 > 第一章 绪论」页面提问，AI 助教调用 `searchNotes({ query: "绪论" })`，返回：

```
未检索到相关内容。可尝试更换关键词，或调用 getOutline 浏览目录。
```

处理耗时 19 s。随后模型退而调用 `getSection` / `getOutline` 才拿到内容。

### 1.2 运行环境事实

| 项 | 值 |
|---|---|
| 部署平台 | **自托管服务器**（用户确认；腾讯云 EdgeOne 已弃用） |
| 索引是否随 git 分发 | **否**。`.gitignore:72` 忽略 `content/.index/`，`git ls-files content/.index` 为 0 |
| 服务器无本地索引时的回退 | `COS_INDEX_BASE_URL=https://qimo1b-1392708216.cos.ap-nanjing.myqcloud.com/index/` |
| COS 上实际存在的文件 | `bm25.json`（101 MB，2026-06-24）、`vectors.json`（221 MB，2026-06-24）；`manifest.json` / `chunks-meta.json` / `vectors.bin` / `vectors.ids.json` **均 404** |
| COS 旧索引覆盖范围 | `docCount: 9778`，尾部 chunk 全是 `maogai`；即只有大一下五科（概率/物理/有机/近代史/毛概），**无任何大二内容** |
| 本地 `content/.index/` | 2026-09-07 12:20 构建，manifest v2，32688 chunks / 32688 vectors，含全部 10 科 |
| `.next/standalone/content/.index/` 与 `dist-desktop/.../standalone/content/.index/` | 同为 9 月 7 日新版（桌面端不受 R1 影响） |
| `.env.local` 中 COS 上传凭据 | `COS_SECRET_ID/COS_SECRET_KEY/COS_BUCKET/COS_REGION` **全部缺失** → `build-index.ts` 每次都静默跳过上传 |

---

## 2. 检索链路全景

```
searchNotes(query, crossYear?, subjectId?)          lib/ai/agent/tools.ts:203
  └─ searchAllContent(q, {limit:8, academicYear, subjectId, preferSubjectId})
                                                     lib/content/loader.ts:470
       ├─ normalizeSearchQuery(q)                    lib/ai/search/queryNormalize.ts
       ├─ hybridSearch(q, {topK:24, filter})          lib/ai/search/hybridSearch.ts:139
       │    ├─ isVectorIndexLoaded() ──► vectorStore.loadIndexAsync()
       │    │      local vectors.bin+ids ► local vectors.json(legacy) ► COS vectors.bin ► COS vectors.json
       │    ├─ isBM25IndexLoaded()   ──► bm25Store.loadIndexAsync()
       │    │      local bm25.json ► /tmp ► COS bm25.json ；chunks-meta ► vectors.json 兜底
       │    ├─ [BM25]  bm25Search(q, 40, filter)     ← chunkInScope 过滤学年/科目
       │    ├─ [向量]  getQueryEmbeddingClient(model).embed(q) → vectorSearch(v, 40, filter)
       │    │          ↑ 任何异常 catch {} 吞掉
       │    ├─ rrfMerge → applyPreferSubject(×1.12) → 取前 40
       │    ├─ rerank(q, candidates.map(c => c.text), max(topK,8))
       │    │          ↑ 任何异常 catch {} 退化为按 RRF 顺序截断
       │    └─ 按 path 去重 → MultiSearchHit[]
       ├─ 二次过滤 subjectVisibleToAgent(hit.subjectId, scope)
       └─ 结果为空 且 NODE_ENV==='production' → 直接返回 []（禁用子串兜底）
```

索引构建侧：

```
pnpm build-index  (scripts/build-index.ts)
  generateChunks()  lib/ai/indexing/chunker.ts   → ChunkData{ id, path, title(面包屑), text, contextPrefix }
  buildBM25Index(chunks)   ← 只 tokenize(chunk.text)                    ★ R2
  chunks-meta.json         ← 含 title，但运行时只用于展示/过滤
  embed(contextPrefix + '\n' + text)  → vectors.bin + vectors.ids.json + manifest.json
  COS 上传：需 4 个 COS_* 变量，缺则静默 skip                            ★ R1
```

---

## 3. 验证记录

所有验证在本机（Windows，Node v24.15.0，31 GB RAM）执行，`.env.local` 环境。

### 3.1 索引文件完整性

```
content/.index/
  bm25.json         340,224,062 B  2026-09-07 12:20
  chunks-meta.json   31,098,201 B
  vectors.bin       133,890,048 B  = 32688 × 1024 × 4  ✔ 严格对齐
  vectors.ids.json    1,062,067 B  32688 个 id，全部存在于 chunks-meta ✔
  manifest.json     version 2, embeddingModel BAAI/bge-m3, dimension 1024,
                    chunkCount 32688, vectorCount 32688
```

按科目 chunk 分布：probability 2458 · physics 2136 · chemistry 3004 · modern-history 3029 · maogai 3155 · **cell-biology 2634** · biochemistry 7189 · anatomy 2038 · histology 4262 · instrumental-analysis 2783。

### 3.2 端到端链路（与 `searchNotes` 完全相同的参数）

```
bm25 loaded: true (2975 ms, heapUsed 1511 MB)
bm25 hits("绪论", 大二上): 10 → anatomy/textbook/ch00-6#2 22.85, ch00-7#1 18.86, ...
[search] 向量索引 vectors.bin 已加载：32688 条 × 1024 维
embed("绪论") → dim 1024, model BAAI/bge-m3
vector hits: 10 → anatomy/textbook/ch00-7#27 0.512, instrumental-analysis/textbook/ch01-3#23 0.510, ...
hybrid hits: 6 → anatomy/ch00-4, anatomy/ch00-5, anatomy/ch00-6, instrumental-analysis/ch01-2, biochemistry/ch00-3, ...
total 4444 ms
```

**结论：本地索引 + 本地 API 配置下，检索链路可用，不会返回空。** 截图中的空结果必然来自"没有本地索引"的运行环境。

### 3.3 COS 远端状态

```
HEAD index/manifest.json      404
HEAD index/chunks-meta.json   404
HEAD index/vectors.bin        404
HEAD index/vectors.ids.json   404
HEAD index/bm25.json          200  101,005,337 B  Last-Modified: 2026-06-24
HEAD index/vectors.json       200  221,539,854 B  Last-Modified: 2026-06-24
bm25.json 头部: {"builtAt":"2026-06-23T17:12:18Z","avgDocLen":327.03,"docCount":9778,...
vectors.json 尾 4 MB subjectId 统计: { maogai: 176 }   ← 无任何大二科目
```

### 3.4 标题词覆盖（R2 证据）

```
cell-biology 正文含"绪论"的 chunk：0
cell-biology 标题含"绪论"的 chunk：83
  '医学细胞生物学 > 教材 > 第一章　绪论 > ch01-1 第一节　细胞生物学概述' 等 3 个 path
正文含"绪论"按科目：chemistry 4 · biochemistry 2 · anatomy 23 · histology 5 · instrumental-analysis 4
```

---

## 4. 根因分析

### R1 · 索引分发断裂（导致"空结果"，严重度 ★★★★★）

**因果链**：

1. `content/.index/` 被 `.gitignore` 忽略（`.gitignore:72`），从未进入仓库。
2. 自托管服务器如通过 `git pull → pnpm install → pnpm build → pnpm start` 部署，则服务器上 `process.cwd()/content/.index/` **不存在**。
3. `hasLocalSearchIndex()` 为 false → `bm25Store` / `vectorStore` 全部走 COS 回退（`indexIo.ts:72-74`, `bm25Store.ts:83-90`）。
4. COS 上只有 2026-06-23 的旧文件。`build-index.ts:428-433` 的上传逻辑因缺 4 个 `COS_*` 变量而**每次静默跳过**，且脚本只打印一行"(跳过 COS 上传…)"，没有任何 warning 级别的提醒。
5. 旧索引只含大一内容。`searchNotes` 默认 `academicYear = ctx.academicYear`（大二上）→ `chunkInScope()`（`searchScope.ts:14-20`）在 BM25 和向量两路都把全部 chunk 过滤掉。
6. `rankings.length === 0` → `hybridSearch` 返回 `[]`（`hybridSearch.ts:172`）。
7. `searchAllContent` 检查 `substringSearchAllowed()`，`NODE_ENV === 'production'` → 返回 `[]`（`loader.ts:498-500`）。
8. `searchNotes` 输出"未检索到相关内容"。

**19 秒耗时的解释**：首次调用要从 COS 下载 101 MB `bm25.json` + 221 MB `vectors.json`（`chunks-meta.json` 404 后回退拉 `vectors.json`），全量 `resp.text()` 入内存再 `JSON.parse`。之后的请求会命中 `/tmp/.search-index` 缓存或内存单例，但结果依然为空。

**平台错位的加重效应**：整套"本地无索引 → COS 下载到 /tmp"设计是为 EdgeOne serverless 的 64 MB /dev/shm 限制设计的（`next.config.mjs:9-12`, `indexIo.ts:1-3`）。自托管服务器完全没有这个限制，本可以把索引直接放在磁盘上，却继承了一条为另一个平台设计、且数据源已经陈旧 3 个月的回退路径。

**为什么本地/桌面端看不到问题**：本地 dev、`.next/standalone`、`dist-desktop` 三处的 `content/.index/` 都是 9 月 7 日新版（桌面构建脚本 `build-desktop.mjs:257` 用 robocopy 整目录复制 `content/`）。

### R2 · 标题/面包屑不入索引（导致"检索质量差"，严重度 ★★★★）

`chunker.ts:147-157` 为每个 chunk 生成了两份高价值元信息：

- `title`：完整面包屑，如 `医学细胞生物学 > 教材 > 第一章　绪论 > ch01-1 第一节　细胞生物学概述`
- `contextPrefix`：`[科目/板块] 面包屑 | 正文首行 80 字`

但三处消费者都没用上：

| 消费者 | 实际输入 | 位置 |
|---|---|---|
| BM25 倒排 | 仅 `chunk.text` | `build-index.ts:104` |
| 向量嵌入 | `contextPrefix + '\n' + text`（唯一吃到标题的地方，但 300 token 正文稀释后信号很弱） | `build-index.ts:374` |
| Rerank 文档 | 仅 `c.text` | `hybridSearch.ts:184` |

后果：

- "绪论"在细胞生物学正文中 0 次出现，BM25 必然 0 命中；向量 top 分只有 0.51 且被解剖学 23 个正文含"绪论"的 chunk 压过。
- `preferSubjectId` 只是 RRF 后 ×1.12 的软加权（`hybridSearch.ts:65-74`），候选里没有 cell-biology 时毫无作用。
- 用户站在细胞生物学绪论页面搜"绪论"，返回全是解剖学/仪器分析/生化的绪论——这在用户感知里等价于"语义检索坏了"。

同类会失效的查询：章节名（"第三章"、"蛋白质的结构与功能"）、只出现在标题里的术语、录音编号（"rec-05"）。

### R3 · 零可观测性（导致排查困难，严重度 ★★★★）

| 位置 | 行为 |
|---|---|
| `hybridSearch.ts:167-169` | embedding 失败 `catch {}`，无日志 |
| `hybridSearch.ts:191-193` | rerank 失败 `catch {}`，无日志 |
| `loader.ts:494-496` | `hybridSearch` 任何异常 `catch {}`，无日志 |
| `bm25Store.ts:87-97, 105-124, 144-146` | 下载/解析失败均静默 |
| `indexIo.ts:101-103` | COS 下载异常静默 |
| `logSearchIndexOnce` | 整个进程生命周期**只打印第一条**消息（`indexIo.ts:117-123`），后续所有诊断被吞 |
| `build-index.ts:469` | COS 上传跳过只有普通 `console.log` |

后果：线上无法区分"确实没命中"、"索引没加载"、"加载的是旧索引"、"embedding 401"、"rerank 超时"五种完全不同的故障。

### 次级问题 A–I

| # | 问题 | 位置 | 影响 | 严重度 |
|---|---|---|---|---|
| A | `bm25.json` 340 MB 单文件，`readFileSync('utf8')` 全量字符串 + `JSON.parse`，heap 1.5 GB，首次 3 s | `bm25Store.ts:73-97` | 服务器内存 <4 GB 时有 OOM 风险；每次进程重启都要重付 3 s；Node 字符串上限 512 MB，内容再翻一倍即崩 | ★★★★ |
| B | `bm25Store.ts` 与 `indexIo.ts` 两套 I/O 逻辑并存、行为不一致（前者 `resp.text()` 全量入内存、不受"本地有索引则禁远端"约束；后者流式落盘） | 两文件 | 维护漂移，R1 的一半原因 | ★★★ |
| C | 向量索引 `model` 取自 `process.env.AI_EMBEDDING_MODEL` 而非 `manifest.json`；`manifest.json` 无任何运行时读取 | `vectorStore.ts:161, 214` | 换模型/维度不会被发现；`getQueryEmbeddingClient` 的模型匹配逻辑形同虚设 | ★★★ |
| D | `FailoverEmbedding`（`getEmbeddingClient`）会静默降级到智谱 `embedding-3`（维度不同） | `embedding.ts:121-153` | 当前无调用方，但一旦误用余弦全是噪声 | ★★ |
| E | 中文 bigram 分词对 1–2 字查询只产出 ≤3 个 token，且不做停用词/同义扩展 | `bm25Store.ts:153-193` | 短查询召回差 | ★★ |
| F | 学年过滤为**硬过滤**，无"当前学年为空则放开到全部"的回退 | `searchScope.ts`, `tools.ts:212` | 任何索引覆盖不全的情况都表现为空结果 | ★★★ |
| G | `searchAllContent` 生产环境禁用子串兜底，但没有任何 warning 告知"索引缺失" | `loader.ts:503-509` 只在 production 打印一次 | 与 R3 叠加 | ★★ |
| H | `AI_API_KEY` 在桌面端由用户手填，为空时 embedding 与 rerank 必 401，且被静默吞掉 | `electron/main.js:152` + R3 | 桌面端退化为纯 BM25 而用户无感知 | ★★ |
| I | `edgeone.json`、`free-build-disk.mjs`、`report-disk.mjs`、`outputFileTracingExcludes` 等 EdgeOne 专用构建逻辑仍在 `pnpm build` 主链路上 | `package.json:14`, `next.config.mjs:9-18` | 无害但误导；`outputFileTracingExcludes` 会让 standalone 构建**主动排除** `.index/`，与自托管需求相反 | ★★★ |

---

## 5. 澄清："嵌入模型和向量模型没工作"的感觉从哪来

用户直觉"嵌入模型和向量模型好像没有正常工作、RAG 打包的向量语义有问题"，与事实的对应关系：

| 直觉 | 事实 | 真正的原因 |
|---|---|---|
| 嵌入模型没工作 | SiliconFlow `bge-m3` 正常返回 1024 维 | 线上根本没走到嵌入（索引为旧版 → 过滤后为空），或走到了但被静默吞掉，外部表现相同 |
| 向量模型没工作 | `vectors.bin` 完整、对齐、可检索 | 线上加载的是 COS 上 3 个月前的 `vectors.json`，不含大二内容 |
| RAG 打包的向量语义有问题 | 向量本身正常；问题在**打包时没把标题喂给 BM25 和 rerank** | R2。这是索引 schema 设计问题，不是嵌入质量问题 |

换言之：模型层没有 bug，**数据分发层和索引 schema 层**有 bug，而**可观测性层**让两者看起来像模型层的 bug。

---

## 6. 解决方案（分阶段）

每阶段独立可交付、可回滚。阶段 0 与阶段 1 合起来解决 R1；阶段 2 解决 R3；阶段 3 解决 R2；阶段 4 解决 A/B；阶段 5 解决 I 与文档；阶段 6 是验收。

### 阶段 0 · 立即止血（当天可完成，不改代码）

**目标**：让线上服务器立刻有正确的索引。

**做法**（任选其一，推荐 0-a）：

- **0-a 直接同步索引目录到服务器**
  ```powershell
  # 本机 → 服务器（约 507 MB，只需 5 个文件）
  scp content/.index/{bm25.json,chunks-meta.json,vectors.bin,vectors.ids.json,manifest.json} user@host:/path/to/app/content/.index/
  ```
  然后重启 Node 进程（索引是模块级单例，进程不重启不会重新加载）。
- **0-b 在服务器上直接构建**：`pnpm build-index`。需要服务器上有 `AI_API_KEY`，32688 条 embedding 约需 20–40 分钟并消耗 API 配额；不推荐作为常规手段。

**验收**：服务器日志出现 `[search] 向量索引 vectors.bin 已加载：32688 条 × 1024 维`；在细胞生物学页面调用 `searchNotes("细胞膜")` 有命中。

**同时做的一件事**：把 COS 上的旧 `index/bm25.json` 与 `index/vectors.json` **删除或重命名**。只要它们还在，任何"没有本地索引"的进程都会静默拉到错误数据；宁可让它 404 报错，也不要让它成功地返回旧内容。

### 阶段 1 · 索引分发重设计（R1 根治）

**设计原则**：自托管服务器没有 serverless 的文件系统限制，索引应当**作为部署产物的一部分随代码一起落盘**，运行时**不再有任何远程回退**。

**1.1 分发方式（三选一，推荐 1.1-a）**

| 方案 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| **1.1-a 部署脚本内置索引同步** | 在部署脚本（或 CI）中增加一步：从固定的制品位置（对象存储/私有制品库/rsync 源）拉取与当前 `contentHash` 匹配的索引包到 `content/.index/` | 与代码解耦，仓库不膨胀，可版本化 | 需要一个制品存储位置（可以继续用 COS 桶，但只作**制品仓库**而非运行时回退） |
| 1.1-b Git LFS 跟踪 `content/.index/*` | 取消 gitignore，LFS 跟踪 | 最简单，`git pull` 即得 | 507 MB × 每次重建都产生新版本，LFS 配额/带宽压力大；bm25.json 需先瘦身（阶段 4） |
| 1.1-c 部署时在服务器构建 | CI/部署脚本跑 `pnpm build-index` | 无制品管理 | 每次部署消耗嵌入 API 配额；慢；需要服务器持有 API key |

**1.2 运行时改动**

1. **删除 COS 运行时回退**：`indexIo.ts` 的 `downloadFromCosToFile`/`readIndexFile` 远程分支、`bm25Store.ts` 的 `downloadFromCos`、`electron/config.js:27`、`.env.example:43` 的 `COS_INDEX_BASE_URL`。运行时只认 `content/.index/`。
2. **合并 I/O 层**：`bm25Store.ts` 改为通过 `indexIo.ts` 读文件，删除其私有的 `LOCAL_INDEX_DIR/TMP_INDEX_DIR/readJsonFromPaths/downloadFromCos`（解决次级 B）。
3. **启动期索引健康检查**（新增 `lib/ai/search/indexHealth.ts`，在 `app/api/chat/route.ts` 首次请求或 Next `instrumentation.ts` 中调用一次）：
   - 读 `manifest.json`，校验 `version === 2`、五个文件齐全、`vectors.bin` 字节数 = `vectorCount × dimension × 4`、`embeddingModel === process.env.AI_EMBEDDING_MODEL`。
   - 计算当前 `contentTree` 的 `contentHash`（复用 `build-index.ts` 的 `contentHashOf`，需抽到 `lib/ai/indexing/`），与 manifest 比对；不一致打 **warn**："索引落后于内容，请重建"。
   - 结果缓存为单例，`searchNotes` 在索引缺失/损坏时返回**明确的错误文案**（"检索索引未加载：<原因>"）而非"未检索到相关内容"，让模型和用户都知道这是基础设施问题。
4. **`vectorStore` 的 `model`/`dimension` 改为读 manifest**（解决次级 C），`getQueryEmbeddingClient(indexModel)` 才真正生效。
5. **`build-index.ts`**：上传步骤改为显式开关 `--publish`；缺凭据时用 `console.warn` 加醒目提示；成功后打印制品地址。

**1.3 学年过滤回退（解决次级 F）**

`searchNotes` 在当前学年过滤后为空时，自动放开到 `all` 再搜一次，并在返回文本首行标注"（当前学年无命中，以下为跨学年结果）"。这样即便索引覆盖不全，也不会给模型一个"什么都没有"的错误信号。

**验收**：
- 全新 clone + 部署脚本一键跑通后，`content/.index/manifest.json` 存在且 `contentHash` 与内容一致。
- 删除 `content/.index/` 后启动服务，`searchNotes` 返回"检索索引未加载"而非"未检索到相关内容"，且服务器日志有 error 级别记录。
- 代码中 grep `COS_INDEX_BASE_URL|downloadFromCos|TMP_INDEX_DIR` 为 0。

### 阶段 2 · 可观测性（R3 根治）

**2.1 结构化日志**

新增 `lib/ai/search/searchLog.ts`，统一 `searchLog.info/warn/error(event, fields)`，输出单行 JSON（便于 pm2/journald/grep）。替换所有 `catch {}`：

| 位置 | 事件名 | 字段 |
|---|---|---|
| `hybridSearch` embedding 失败 | `search.embed.error` | `model, status, message, queryLen` |
| `hybridSearch` rerank 失败 | `search.rerank.error` | `model, status, message, candidates` |
| `hybridSearch` 每次调用 | `search.query` | `mode, bm25Hits, vecHits, merged, reranked, final, filter, ms` |
| `vectorStore`/`bm25Store` 加载 | `search.index.loaded` / `search.index.missing` | `file, bytes, count, dimension, ms` |
| `searchAllContent` 兜底 | `search.fallback.substring` / `search.fallback.disabled` | `env, query` |

`logSearchIndexOnce` 改为**按 message 去重**（同一条只打一次），而不是全局只打第一条。

**2.2 工具输出附带诊断**

`SearchNotesOutput` 增加可选 `diagnostics: { bm25Hits, vecHits, mode, indexBuiltAt, ms }`，前端 Trace UI 的 `ToolTraceStep` 展示为折叠小字。这样截图里就能直接看到"BM25 0 / 向量 0 / 索引 2026-06-23"而不用翻服务器日志。

**2.3 健康端点**

新增 `GET /api/health/search`（仅返回非敏感字段）：索引 builtAt / chunkCount / vectorCount / model / contentHash 是否匹配 / embedding 可达性（可选 ping）。部署脚本在发布后 curl 一次作为冒烟。

**验收**：人为把 `AI_API_KEY` 改错，日志出现 `search.embed.error status=401`，且 `searchNotes` 仍返回 BM25 结果并在 diagnostics 中标注 `vecHits: 0, embedError: 401`。

### 阶段 3 · 索引质量（R2 根治 + 次级 E）

**3.1 多字段 BM25（核心改动）**

`build-index.ts` 的 `buildBM25Index` 改为对两个字段分别建倒排，或用简单的字段加权拼接：

- 方案 3.1-a（简单，推荐先做）：索引文本 = `title 去掉科目/板块前缀后的章节+小节名（重复 2 次以提权）` + `\n` + `text`。实现成本极低，"绪论"立刻可被 BM25 命中。
- 方案 3.1-b（规范）：BM25F。`invertedIndex[term].postings[i] = { id, tfTitle, tfBody }`，查询时 `score = idf × (w_title·tfNorm_title + w_body·tfNorm_body)`，`w_title ≈ 2.5`。需要同步改 `bm25Store.bm25Search`。

同时把 `docLengths` 与 `avgDocLen` 按新文本重算。

**3.2 Rerank 文档拼标题**

`hybridSearch.ts:184`：`candidates.map(c => \`${shortTitle(c.title)}\n${c.text}\`)`。`bge-reranker-v2-m3` 对"标题 + 段落"的相关性判断明显优于裸段落，尤其对短查询。

**3.3 向量侧**

- 保持 `contextPrefix + text` 的嵌入方式（已是正确做法），但把 `contextPrefix` 里的正文首行 80 字改成 **item 级摘要**（章节第一段前 120 字），避免首行是"第一节 细胞生物学概述"这种与标题重复的信息。
- 为每个 **item（页面）** 额外生成一条"标题向量"（只嵌入面包屑 + 首段），id 形如 `path#title`，`chunkIndex = -1`。查询"绪论"时该向量会以高分命中，再由 `path` 去重合并。代价：+~1500 条向量（每个 item 一条），可忽略。

**3.4 短查询处理**

- `normalizeSearchQuery` 之后，若 query ≤ 2 个汉字且当前页面 `ctx` 存在，自动把当前页面的章节名拼入向量查询（不拼入 BM25，避免噪声）："绪论" → "医学细胞生物学 第一章 绪论"。
- `preferSubjectId` 从"×1.12 软加权"改为"**两阶段**"：先在 `preferSubjectId` 内搜，若 ≥ 3 条则直接返回；否则再放开全学年。

**3.5 重建索引并回归**

改 schema 后必须全量 `pnpm build-index`（BM25 部分秒级；向量部分因 `contentHash` 与 `embed-cache` 机制只会补 3.3 新增的标题向量）。

**验收**（写成 `lib/ai/search/hybridSearch.integration.test.ts`，依赖本地索引存在，CI 无索引时 skip）：

| 查询 | 上下文 | 期望 |
|---|---|---|
| `绪论` | cell-biology / 大二上 | top-3 含 `cell-biology/textbook/ch01-*` |
| `第三章` | biochemistry | top-5 含 biochemistry ch03 |
| `被覆上皮` | histology | top-1 为 histology |
| `贝叶斯公式` | cell-biology / crossYear=true | top-3 含 probability |
| `rec-05` | chemistry | top-1 path 为 `chemistry/recording/rec-05` |

### 阶段 4 · 存储格式瘦身（次级 A）

当前 340 MB 的原因：`invertedIndex` 是 `{ term: { df, postings: [{id: "biochemistry/textbook/ch07-5#12", tf: 3}, ...] } }`，每个 posting 重复存一遍 30+ 字节的字符串 id，且 JSON 文本本身有 3–4 倍膨胀。

**方案对比**：

| 方案 | 预计体积 | 加载时间 | 实现成本 | 备注 |
|---|---|---|---|---|
| **4-a 紧凑 JSON**：id 改为整数下标（指向 `vectors.ids.json` 的顺序），postings 改为平铺数组 `[docIdx, tf, docIdx, tf, ...]` | ~60–80 MB | <1 s | 低（只改 build 与 store 两处） | 与现有架构完全兼容，推荐先做 |
| 4-b 二进制：`terms.json`（term → offset/len）+ `postings.bin`（Uint32 平铺） | ~40 MB | <0.5 s，可 mmap 式按需读 | 中 | 与 `vectors.bin` 风格一致 |
| 4-c SQLite FTS5（`better-sqlite3`） | ~150 MB 单文件 | 按需查询，进程 heap 几乎不涨 | 中高（引入原生依赖，Electron 需 rebuild） | 顺带解决 R2 的多字段与中文分词（需 trigram/自定义 tokenizer） |

推荐路线：**4-a 立即做**（一次性把 heap 从 1.5 GB 降到 ~300 MB），4-b/4-c 视服务器内存与后续内容规模再评估。

同时给 `bm25Store` 加载加 `try { JSON.parse } catch (e) { searchLog.error('search.index.parse_error', …) }`，并在超过 `buffer.constants.MAX_STRING_LENGTH × 0.8` 时提前告警。

**验收**：`pnpm build-index --bm25-only` 后 `bm25.json` < 100 MB；服务器进程 RSS 稳态 < 800 MB；首次 `searchNotes` < 1.5 s。

### 阶段 5 · 平台归位：EdgeOne / COS 清洗（次级 I + 文档）

**5.1 代码与配置**

| 文件 | 处理 |
|---|---|
| `edgeone.json` | 删除 |
| `package.json:14` `build` 脚本 | 改为 `next build`；删除 `scripts/free-build-disk.mjs`、`scripts/report-disk.mjs`（或移入 `scripts/legacy/` 并标注） |
| `next.config.mjs:9-18` | 删除 `outputFileTracingExcludes` 中对 `content/.index/**` 的排除（自托管 standalone 应**包含**索引）；重写注释；`_raw/**`、`examples/**` 的排除可保留 |
| `lib/ai/search/indexIo.ts` | 删除 `TMP_INDEX_DIR`、`getCosIndexBaseUrl`、`downloadFromCosToFile`、`shouldFetchIndexFromCos`、`readLocalOrTmp`；文件头注释重写 |
| `lib/ai/search/bm25Store.ts` | 删除 COS/tmp 逻辑，改用 `indexIo`；文件头注释重写 |
| `lib/ai/search/vectorStore.ts` | 删除 `remoteBin/remoteLegacy` 分支；文件头注释重写 |
| `lib/ai/sdk/heartbeat.ts:2` | 注释里 EdgeOne 相关表述改为通用"反向代理/网关空闲超时" |
| `scripts/build-index.ts:427-470` | COS 上传改为 `--publish` 显式开关（若采用 1.1-a 且继续用 COS 桶作制品仓库则保留；否则删除并移除 `cos-nodejs-sdk-v5` 依赖） |
| `scripts/build-desktop.mjs:244` | 注释更新 |
| `electron/config.js:26-27` | 删除 `COS_INDEX_BASE_URL` |
| `.env.example:40-43, 63` | 删除 `COS_INDEX_BASE_URL`；视频 CDN 注释"托管在腾讯云 COS"改为中性表述（视频 CDN 若仍用 COS 则保留，与索引解耦） |
| `scripts/media/upload-videos-cos.mjs` | 与索引无关，视频仍走 COS CDN 则保留 |

**5.2 文档**

| 文件 | 匹配行 | 处理 |
|---|---|---|
| `docs/research/13-build-scripts.md` | 302, 308, 315, 316, 322, 348, 386, 414, 487 | 重写"构建与部署"章节为自托管流程；EdgeOne 段落移入"历史/已弃用" |
| `docs/research/16-automation-platform.md` | 163, 268, 271, 373, 410, 501, 517, 595, 627, 647, 675 | 同上；CI/CD 目标从 EdgeOne 改为服务器部署脚本 |
| `docs/research/15-nextjs-compliance.md` | 235, 446, 480–497, 612 | 删除 `COS_INDEX_BASE_URL` 配置说明；standalone 章节改为包含索引 |
| `docs/research/10-routing-ssr-ssg.md` | 192, 246, 342, 357, 509, 521 | serverless 假设改为长驻 Node 进程 |
| `docs/research/07-performance-optimization.md` | 271, 273, 284, 491 | /tmp 缓存策略段落删除，改为"索引常驻内存 + 阶段 4 瘦身" |
| `docs/research/04-ai-chat-system.md` | 211, 444 | 检索架构图更新（去掉 COS 回退） |
| `docs/research/00-research-plan.md` | 270, 313, 543 | 平台假设更新 |
| `docs/research/11-electron-desktop.md` | 158, 160, 289 | 桌面端"索引随包分发"表述保留，去掉 COS 回退 |
| `docs/research/overview.md` | 354 | 部署平台一句话更新 |
| `docs/sop/06-desktop-packaging-release.md` | 7, 170 | 同上 |
| `electron/README.md` | 61 | 同上 |
| `README.md` | 检索/部署章节 | 新增"索引分发"小节，链接本文与部署脚本 |
| `docs/plans/README.md` | 文件索引表 | 登记本文（15） |

**5.3 新增文档**

- `docs/sop/09-search-index-lifecycle.md`：何时重建索引（内容变更后）、如何发布制品、如何在服务器验证（health 端点）、回滚方式。

**验收**：`rg -i "edgeone|COS_INDEX_BASE_URL|/dev/shm|myqcloud.*index" --glob '!docs/releases/**' --glob '!CHANGELOG.md'` 仅剩显式标注为"历史"的段落。

### 阶段 6 · 测试与验收矩阵

| 层 | 测试 | 文件 |
|---|---|---|
| 单元 | `chunkInScope` 学年回退；`normalizeSearchQuery` 短查询扩展；`rrfMerge`；BM25F 打分 | `lib/ai/search/*.test.ts` |
| 单元 | `indexHealth` 对缺文件/维度不齐/模型不符/hash 不符的四种判定 | `lib/ai/search/indexHealth.test.ts` |
| 集成（需本地索引，否则 skip） | 阶段 3 的 5 条查询矩阵 | `lib/ai/search/hybridSearch.integration.test.ts` |
| 集成 | 索引缺失时 `searchNotes` 文案为"检索索引未加载" | `lib/ai/agent/tools.test.ts` |
| 部署冒烟 | `curl /api/health/search` 返回 `contentHashMatch: true` | 部署脚本 |
| 手动 | 细胞生物学绪论页 → 问"绪论" → Trace 显示 diagnostics 且 top 含 cell-biology | — |

---

## 7. 文档与代码清洗清单（EdgeOne / COS 残留）

完整命中（23 个文件，115 处）已在 §5 表格中逐一给出处理方式。按类型归总：

- **必须删除/改写（影响行为）**：`edgeone.json`、`package.json` build 脚本、`next.config.mjs` tracing excludes、`indexIo.ts`、`bm25Store.ts`、`vectorStore.ts`、`electron/config.js`、`.env.example`。
- **必须改写（影响理解）**：`docs/research/` 下 9 个文件、`docs/sop/06`、`electron/README.md`、`lib/ai/sdk/heartbeat.ts` 注释、`scripts/build-desktop.mjs` 注释。
- **可保留（与索引无关）**：`scripts/media/upload-videos-cos.mjs`、`NEXT_PUBLIC_VIDEO_CDN_BASE`（视频 CDN 若仍用 COS）、`CHANGELOG.md`/`docs/releases/` 历史记录。
- **视阶段 1 决策**：`scripts/build-index.ts` COS 上传段与 `cos-nodejs-sdk-v5` 依赖。

---

## 8. 风险、开放问题与需要确认的事项

1. **部署方式确认**：本文假设服务器通过 git 拉代码 + `pnpm build/start`（或 standalone）运行。若实际是把本机 `.next/standalone` 整体 rsync 上去，则服务器可能已有索引，R1 的触发路径需要重新核对（此时应优先查服务器上 `content/.index/manifest.json` 是否存在、日志里 `[search]` 首条消息是什么）。
2. **服务器内存**：当前 BM25 加载需 heap 1.5 GB。若服务器内存 ≤ 4 GB，阶段 4 应提前到阶段 1 之后立即做。
3. **COS 桶后续角色**：若阶段 1 选 1.1-a 并继续用 COS 作制品仓库，需补齐 `COS_SECRET_*` 并把上传改成显式步骤；否则彻底移除。
4. **桌面端**：不受 R1 影响，但受 R2/R3/H 影响。阶段 2 的 diagnostics 对桌面端用户排查"没填 SiliconFlow key"尤其有用。
5. **索引重建成本**：阶段 3 改 schema 后 BM25 全量重建是秒级；向量因 `embed-cache` 增量机制只补新增条目，不会重新消耗 32688 次嵌入。
6. **`hybridSearch` 的 `catch {}` 在阶段 2 改为记日志后**，行为不变（仍降级），不会引入新的失败路径。

---

## 附录 A · 复现与验证命令

```powershell
# A1 本地索引完整性
Get-ChildItem -Force content\.index | Select-Object Name,Length,LastWriteTime
Get-Content content\.index\manifest.json

# A2 远端 COS 状态（阶段 0 后应全部 404 或已删除）
$base='https://qimo1b-1392708216.cos.ap-nanjing.myqcloud.com/index/'
foreach ($f in 'manifest.json','bm25.json','chunks-meta.json','vectors.bin','vectors.ids.json','vectors.json') {
  try { $r=Invoke-WebRequest -Uri ($base+$f) -Method Head -UseBasicParsing; "$f $($r.StatusCode) $($r.Headers['Content-Length']) $($r.Headers['Last-Modified'])" }
  catch { "$f ERR" } }

# A3 端到端链路（tsx 临时脚本，运行后删除）
#   手动加载 .env.local → import bm25Store / vectorStore / embedding / hybridSearch
#   → hybridSearch("绪论", { topK: 8, academicYear: "sophomore-1", preferSubjectId: "cell-biology" })
#   期望：hits > 0；阶段 3 后 top-3 含 cell-biology/textbook/ch01-*

# A4 标题覆盖检查
#   读取 chunks-meta.json，统计 subjectId==='cell-biology' 且 text/title 包含目标词的数量

# A5 仓库是否跟踪索引
git ls-files content/.index | Measure-Object
```

## 附录 B · 关键代码定位索引

| 文件 | 行 | 说明 |
|---|---|---|
| `lib/ai/agent/tools.ts` | 203–231 | `searchNotes` 工具定义与"未检索到相关内容"文案 |
| `lib/content/loader.ts` | 470–509 | `searchAllContent`、生产禁用子串兜底 |
| `lib/ai/search/hybridSearch.ts` | 139–217 | 混合检索主流程；167–169 / 191–193 静默 catch；184 rerank 只传正文 |
| `lib/ai/search/searchScope.ts` | 14–20 | 学年/科目硬过滤 |
| `lib/ai/search/vectorStore.ts` | 146–167, 225–281 | bin 加载、COS 回退、model 取自 env |
| `lib/ai/search/bm25Store.ts` | 40–150 | 独立的 COS/tmp/本地 I/O 与 340 MB JSON.parse |
| `lib/ai/search/indexIo.ts` | 1–3, 53–104, 117–123 | EdgeOne 设计假设、COS 下载、只打一条的日志 |
| `lib/ai/embedding.ts` | 121–166 | Failover 陷阱与查询客户端选择 |
| `lib/ai/indexing/chunker.ts` | 107–175 | `title` / `contextPrefix` 生成 |
| `scripts/build-index.ts` | 98–129, 374, 428–470 | BM25 只索引正文；嵌入输入；COS 上传静默跳过 |
| `next.config.mjs` | 9–18 | standalone 排除 `.index/` |
| `.gitignore` | 71–72 | 索引不入库 |
| `electron/config.js` | 26–27 | 桌面端 COS 回退配置 |
| `edgeone.json` | 全文 | 已弃用平台配置 |
