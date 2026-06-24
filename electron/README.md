# Gailvlun 桌面版 (Electron)

把整个 Next.js 应用打包成 Windows 桌面 .exe，功能与本地 `pnpm start` **完全一致**。
设计为「Route A」：Electron 主进程在启动 Next standalone 服务**之前**，把用户填的
3 个 API 密钥作为环境变量注入。**Next 应用代码零改动。**

## 密钥与配置的边界

- **用户首次运行时自填的 3 个密钥**（加密存于 `userData/keys.enc`，**绝不进安装包**）：
  - `AI_API_KEY`（硅基流动，必填）— AI 对话 / 语义搜索 embedding+rerank / 追问 / 生成
  - `MIMO_API_KEY`（小米，可选）— MiMo 模型
  - `ZHIPU_API_KEY`（智谱，可选）— 联网搜索
- **内置的非密钥配置**（见 `electron/config.js`，可安全打进 exe）：base URL、模型名、
  reasoning 字段、embedding/rerank 模型、search mode、视频 CDN、索引 COS 兜底。

## 离线 / 在线

- **完全离线**：内容页（SSR/KaTeX/高亮）、笔记、BM25 关键词搜索、Quiz、图片、进度（IndexedDB）。
- **需联网 + 对应 key**：AI 对话、向量/混合语义搜索、联网搜索、视频播放（CDN 流）。

## 构建

```bash
pnpm install            # 含 electron / electron-builder
pnpm run desktop:build  # 1) next build (standalone) 2) 拷 static/public/content(含307MB索引) 3) electron-builder
```

产物在 `dist-desktop/`：

- `Gailvlun-portable-<version>.exe` —— 免安装单文件，双击即用（每次启动自解压，稍慢）。
- `Gailvlun-setup-<version>.exe` —— NSIS 安装版，装一次后秒启（推荐日常使用）。

## 本地联调（不打包，验证启动链路）

```bash
# 先产出 standalone 并补齐资源（等同 desktop:build 的前两步）
BUILD_STANDALONE=1 pnpm exec next build
node -e "const{cpSync}=require('fs');cpSync('.next/static','.next/standalone/.next/static',{recursive:true});cpSync('public','.next/standalone/public',{recursive:true});cpSync('content','.next/standalone/content',{recursive:true})"
pnpm run desktop:dev    # electron . —— 走真实主进程：弹密钥设置 → 起 server → 开窗
```

## 工作原理（简）

1. `main.js` 读取/收集 3 个密钥（`safeStorage` 加密）。
2. 以 `ELECTRON_RUN_AS_NODE` 用 Electron 自带 Node 跑 `.next/standalone/server.js`，
   `cwd` 设为 standalone 目录（应用用 `process.cwd()` 读 `content/`），注入 env + 动态端口。
3. 轮询端口就绪后开 `BrowserWindow` 加载 `127.0.0.1:PORT`。
4. 「应用 → API 密钥设置」可改密钥，保存后自动重启 server 并刷新（因 `provider.ts`
   在模块加载时读 env，密钥变更需重启服务进程）。

## 备注

- 未做代码签名：首次运行 Windows SmartScreen/杀软可能提示，「仍要运行」即可（或后续配置签名）。
- 图标可选：放 `build/icon.ico` 后在 `electron-builder.yml` 取消 `icon` 注释。
- `next.config.mjs` 仅当 `BUILD_STANDALONE=1` 才切到 standalone + 关图片优化，**不影响 Web/EdgeOne 构建**。
