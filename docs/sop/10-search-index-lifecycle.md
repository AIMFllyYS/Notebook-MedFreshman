# SOP · 检索索引生命周期

## 适用场景

内容变更后重建 `content/.index/`、把索引同步到自托管服务器、发布后冒烟。

## 何时重建

- 新增 / 大改教材、详解、录音稿之后
- 改了 BM25 字段（标题入索引）或向量 schema 之后
- `GET /api/health/search` 返回 `contentHashMatch: false`

## 本地构建

```powershell
pnpm build-index --bm25-only   # 只重建关键词（秒级）
pnpm build-index               # BM25 + 增量补向量（新增 chunk 才消耗 embedding）
```

产物五个文件必须齐全：`bm25.json`、`chunks-meta.json`、`vectors.bin`、`vectors.ids.json`、`manifest.json`。

不要把 `content/.index/` 提交进 git。部署时把该目录作为**部署产物**同步到服务器，与代码同路径：`<app>/content/.index/`。

`--publish` 仅在要把索引作为制品上传到对象存储时使用；运行时**不会**再从 COS 回退下载。

## 服务器验证

部署并重启 Node 进程后：

```powershell
curl http://127.0.0.1:35349/api/health/search
```

期望：`ok: true`，`contentHashMatch: true`，`chunkCount` 与本地 manifest 一致。

日志应出现 `search.index.loaded`。若出现 `search.index.missing`，检查目录是否同步、进程工作目录是否为项目根。

## 回滚

保留上一份 `content/.index/` 备份。出问题把五件套拷回去并重启进程（索引是模块级单例）。

## 阶段 0 止血（无本地索引的线上机）

把本机 `content/.index/` 五个文件拷到服务器同路径后重启。不要再依赖 COS 上 2026-06 的旧 `bm25.json` / `vectors.json`。
