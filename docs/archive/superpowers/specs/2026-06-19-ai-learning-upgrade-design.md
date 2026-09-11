# AI 学习系统深度升级 · 主设计文档 / 路线图

> 状态：进行中（无人值守）。每完成一个阶段即 commit。本文件是跨会话的持久蓝图，
> 上下文被压缩后从这里恢复进度。

## 0. 目标

系统性升级右侧 AI 助教与划词助手，使其真正以最高效率帮助学习。同时升级右侧面板
（新增浏览器 Tab）。整体遵守项目既有架构：文件按职责拆分、不过长、复用组件、路由清晰、
暗色 CSS 变量体系、SSR 正文不破坏。

## 1. 现状关键发现（开工前体检）

技术栈：Next.js 16.2 + React 19.2 + TS（pnpm）；三栏布局；右侧 3 Tab（AI对话/动画讲解/可交互）。
AI 走 OpenAI 兼容端点（`.env.local`：`AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL_PRO`/`AI_MODEL_FLASH`/
`AI_REASONING_FIELD`），后端 `app/api/chat/route.ts` 做工具循环 + SSE 流。

**已确认的断点 / bug：**
1. **工具名不匹配**：route 把 `getActiveTools()`（camelCase：`getCurrentPage`/`getFolderTree`/
   `getPageContent`/`webSearch`，来自 `lib/types/tools.ts`）发给模型，但 `runTool()`（`lib/ai/tools.ts`）
   的 switch 只认 snake_case（`get_current_page`/`get_outline`/`get_section`/`search_notes`）→
   任何工具调用都命中 `未知工具`。两套工具定义并存，必须统一。
2. **自定义 API 配置完全断连**：`ChatSettings.tsx` 把 endpoint/key/model 写入 localStorage
   (`gailvlun-chat-settings`)，但 `useChat`/route 从不读取它 → 用户填的自定义 API 无效
   （这正是"配置冲突"bug）。需求：env 为站点默认；自定义配置作为"自定义模型"并存、不冲突。
3. **模型选择未接线**：`ModelSwitch.tsx`（pro/flash）存在，但 `ChatPanel` 把 model 硬编码为
   `enableThinking ? 'pro' : 'flash'`；`ChatInput` 右下角模型指示器硬编码 `deepseek-pro/flash`。
   需求：像 agent 软件那样的模型下拉菜单，可选硅基流动多个顶尖模型 + 自定义模型。
4. **划词无弹窗（bug）**：`SelectionPopover.tsx`（解释/举例/追问/引用）组件存在，但**未在任何地方挂载**
   → 划词后不出现。`QuickExplainWindow.tsx`（WPS 式浮窗）已在 `AppShell` 挂载，但它依赖
   `SelectionPopover` 触发 `setQuickExplain`，故也无从触发。
5. **`outbound`/`sendToChat` 无人消费**：store 有划词→对话的 `outbound` 通道，注释说 ChatPanel 监听，
   但实际无任何组件读取 → 划词"问AI"链路断。
6. **提示词内嵌且单一**：`lib/constants/prompts.ts` 单文件、仅概率论口径、未分学科、未独立成 MD。
7. **联网搜索/向量为空壳**：`webSearch` 工具有声明无实现；`contextMode: 'semantic'` 标"即将推出"。

## 2. 已核实事实（用真实 key 查 `GET /v1/models` + 联网调研）

- Base：`https://api.siliconflow.cn/v1`，OpenAI 兼容，Bearer 鉴权。
- **顶尖对话/推理模型（真实存在）**：`deepseek-ai/DeepSeek-V4-Pro`（1M，旗舰推理，三档思考）、
  `deepseek-ai/DeepSeek-V4-Flash`（1M，性价比推理）、`deepseek-ai/DeepSeek-V3.2`、`zai-org/GLM-5.2`、
  `Pro/zai-org/GLM-5.1`、`zai-org/GLM-Z1-AirX`、`zai-org/GLM-4.7-FlashX`、`Qwen/Qwen3.6-35B-A3B`、
  `Qwen/Qwen3.6-27B`、`moonshotai/Kimi-K2.7-Code`、`Pro/moonshotai/Kimi-K2.6`、`MiniMaxAI/MiniMax-M3`、
  `deepseek-ai/DeepSeek-V3`、`deepseek-ai/DeepSeek-R1`。env 现有 V4-Pro/Flash **有效**。
- 思维链字段：`reasoning_content`（流式 `delta.reasoning_content`）。开关：`enable_thinking` /
  `thinking_budget`（各家默认不一，需显式传）。function calling：OpenAI 格式 `tools`。
- **Embedding**：`/v1/embeddings`，默认推荐 `BAAI/bge-m3`（1024 维，8192 上下文，中文好）。
- **Rerank**：`/v1/rerank`，默认 `BAAI/bge-reranker-v2-m3`。
- **联网搜索：平台不内置**。自建 `webSearch`：默认走博查 Bocha
  `POST https://api.bochaai.com/v1/web-search`（Bearer，中文/时效好，`summary` 字段 RAG 友好）；
  可选 Tavily `https://api.tavily.com/search`。
- **Prompt caching**：DeepSeek-V4 系自带前缀自动缓存（命中价≈2% miss 价）。实践：稳定 system prompt
  放最前且逐字节一致；易变内容（页面快照、检索结果、对话历史）放最后，用工具调用获取而非插进 system。

## 3. 架构决策

- **AI Provider 层**（新增 `lib/ai/provider.ts` + `lib/ai/models.ts`）：集中解析"用哪个 base/key/model"。
  优先级：请求体里指定的自定义 provider（来自前端设置，仅当用户填了 customBaseUrl+customApiKey+customModel）
  → 否则 env 默认。模型注册表 `models.ts` 导出精选硅基流动模型（id/label/能力标签：思考/工具/上下文）。
- **统一工具系统**：删除重复定义，单一来源 `lib/ai/tools.ts`（定义 + 执行），camelCase 命名，
  route 同时从这里取 defs 与 executor，彻底修复名字不匹配。工具：`getCurrentPage`/`getOutline`/
  `getSection`/`searchNotes`/`webSearch`/`renderInteractive`(后期)。ToolContext 带完整
  `{subjectId, categoryId, itemId}`。
- **动态提示词系统**（`lib/ai/prompts/`）：
  - `lib/ai/prompts/global.md`（全局系统提示词，作为稳定缓存前缀）
  - `lib/ai/prompts/subjects/{probability,physics,chemistry}.md`（分学科专门化）
  - `lib/ai/prompts/index.ts`：服务端 `import` 这些 md 文本（Next 可用 `?raw` 或 fs 读取），
    按 `subjectId` 拼装：global + 工具说明 + 学科段 + （末尾）易变上下文。保持前缀稳定利于缓存。
- **设置存储**：`lib/ai/settings.ts` + `useSettings` store（localStorage 持久化）：自定义 provider、
  默认模型、字体大小、各工具开关、默认思考/搜索。前端设置经请求体传到 route，覆盖 env（仅自定义项）。
- **划词复用**：`SelectionPopover` 在内容容器与右侧聊天容器都挂载（containerRef 注入）；修复 `outbound`
  消费（ChatPanel 监听并 sendMessage）。

## 4. 分阶段计划（每阶段 = 一次 commit，遵循 PDCA）

> 全部 9 阶段已完成并提交（S1=8e5621c, S2=97965ed, S3=ec7654a, S4=e2dc966, S5=4e545e7,
> S6=c416e96, S7=a21edc2, S8=469d7ce, S9=f8e799c）。每阶段经 tsc + pnpm build + 真实 key 烟测。

- [x] **S1 右侧浏览器 Tab**：RightPanel 顶部 Tab 栏新增"浏览器"（在"可交互"右侧）；可滑动横向 Tab 栏；
  最右侧"+"功能按钮：设置浏览器/新增固定网址（收藏夹式 Tab，localStorage 持久）；iframe 渲染任意 URL，
  本地基础安全（sandbox/allow 合理放开 B 站等）。新组件 `components/browser/`。
- [ ] **S2 AI Provider/模型层 + 多模型菜单 + 自定义 API 修复 + 工具名 bug 修复 + env 扩展**：
  `lib/ai/{provider,models}.ts`；route 用 provider 层；统一工具系统；`ModelMenu` 下拉（替代 ModelSwitch）；
  设置里自定义 provider 与 env 并存；扩展 `.env.local`/`.env.example`（嵌入/重排/搜索占位）。真实 key 烟测。
- [ ] **S3 动态提示词系统**：`lib/ai/prompts/` MD 化 + 加载器；全局 + 三学科；route 接入；防幻觉/工具策略/
  追问/苏格拉底刹车。
- [ ] **S4 设置融入按钮 + 设置增强**：去掉"对话/设置"子 Tab，改为对话头部的设置小按钮（弹出面板/抽屉）；
  设置真实生效：字体大小（聊天区）、各工具启用/禁用、默认模型/思考/搜索/自定义 provider。
- [ ] **S5 联网搜索工具 + 前端组件 + 缓存**：实现 `webSearch`（Bocha，env key）；后端缓存（内存 LRU + 可选
  embedding 语义缓存命中）；前端"联网搜索中/来源卡片"组件（复用 ToolCallDashboard 思路）。
- [ ] **S6 快捷指令复用 FollowUp + 开始后隐藏**：解释概念/给我出题/推理过程三按钮在"新对话空态"时以
  FollowUp 组件样式出现在顶部，一旦开始对话即隐藏。
- [ ] **S7 划词弹窗修复 + 右侧复用**：挂载 `SelectionPopover`（正文 + 右侧聊天）；修复 `outbound` 消费；
  "添加至对话/即时分析"WPS 式浮窗复用。
- [ ] **S8 富文本排版升级**：右侧渲染（MessageContent/NoteRenderer）排版高级化，行距/段距/标题层级/表格/
  代码块/公式块间距，参考 docx/refer 旧版 V4。
- [ ] **S9 AI 生成交互式 HTML**：`renderInteractive` 工具 → 后台子智能体撰写 HTML（独立 API 路由流式）；
  对话顶部横幅（流式时）→ 半屏预览 → 完成后内嵌进工具调用思考链 + "查看"弹窗（左侧）渲染 iframe。

## 5. 不变量 / 约束（务必遵守）

- 暗色优先 + CSS 变量翻转，禁硬编码浅色。
- 跨学科 id 命名空间：内容叶子 id 仅在 (subject, category) 内唯一；勿按裸 id 全局查。
- 导航单一同步点在 AppShell（路由驱动 store）。勿回退。
- SSR 正文 + media 讲稿拆分不破坏；勿盲目重跑 render.py。
- 文件按职责拆分、组件复用、路由清晰。每阶段 `pnpm exec tsc --noEmit` 通过 + 关键路径烟测后再 commit。
- 提交用显式 `git add <我的文件>`，不卷入用户既有 BrandLogo/scratch 改动。

## 6.5 增补：浏览器机制升级（2026-06-20）

针对内置浏览器的两点机制更新（右侧面板偏手机端布局）：

1. **全部内嵌网址自适应屏幕（手机视图模拟）**：`BrowserTab` 的 iframe 改为
   `FramedSite`：`ResizeObserver` 量容器宽，手机视图以固定逻辑视口宽 `414px` 渲染、
   `transform: scale(容器宽/414)` 缩放贴合面板 → 任意站点拿到手机视口、无横向溢出；
   工具栏「手机/桌面」切换，`viewMode` 持久化（默认 mobile）。

2. **浏览器标签默认必应搜索页 + 书签为独立固定标签**：
   - 已核实 `www.bing.com/` 首页带 `X-Frame-Options: SAMEORIGIN` 不可内嵌，但
     `bing.com/search?q=...` 结果页无 XFO 可内嵌 → 默认页改为**本地必应搜索起始页**
     （`BingStartPage`，深色响应式，回车走 bing 结果页）。
   - `useBrowser` 状态从单 `currentUrl` 拆为 `browseUrl`(通用浏览器页面) + `activeTabId`
     (`__browse__` 或书签 id)，`currentUrl` 为派生显示页；新增 `openBrowse`/`openBookmark`。
   - 点「浏览器」→ `__browse__`(必应起始页/上次自由浏览页)；点 B站等书签 → 各自独立标签。
     `RightPanel` 在核心标签与书签标签间加分隔符；起始页移除书签磁贴（书签只作顶部固定标签）。

3. **可嵌入预检 + 优雅外开**（应对"很多网站打不开"）：内嵌是纯 Web 的硬天花板——
   墙 A=站点 `X-Frame-Options`/CSP `frame-ancestors` 拒绝跨域内嵌；墙 B=Cloudflare/Turnstile
   人机校验 + 第三方 Cookie 分区（用户实遇 DeepSeek "Max challenge attempts exceeded"）。前端无法绕过。
   - 新增 `app/api/can-embed/route.ts`：服务端抓目标响应头，判 XFO / CSP frame-ancestors（墙 A 可靠可探测）；
     并对顶层 GET 的非正常状态（202/403/429/503…）判为疑似人机校验（墙 B 的近似探测，DeepSeek 返回 202）。
   - `BrowserTab` 乐观渲染 iframe 同时探测，判不可内嵌则切到 `EmbedBlocked` 面板（主推「在新标签打开」+
     「仍要尝试内嵌」兜底），结果按 url 缓存。真实站点实测：DeepSeek/Google/Bing首页→拦截外开；
     Bing结果页/B站播放器/example.com→正常内嵌。
   - 真·全站只有桌面版（Tauri/Electron）WebView 一条实路；反向代理打不过 Cloudflare 且风险大，未采用。

## 6.6 增补：交互式 HTML 产物机制深度修复（2026-06-20）

用户反馈两点：①生成 HTML 时看不到“流式输出代码”；②看不到“渲染/打开按钮”。

**根因定位（用 `scripts/temp` 探针直打 `/api/chat` 取证，已删除）：**
- 服务端管线本身**完全正确**：模型确实走 `renderInteractive`、SSE `artifact start/delta/done` 逐条流式
  （单次 4292 个 delta、~3.8 分钟）、`done` 带完整 HTML、`tool result` 带 `artifactId`。自然措辞请求也走工具，
  正文里**不**夹带 HTML。故两 bug 均为**前端呈现层**问题：
  1. **流式源码藏在顶部独立横幅**（`ArtifactBanner`），与用户视线（消息气泡）分离 → 漫长生成期里消息区只见
     “正在思考”转圈 → 误判“没有流式输出”。
  2. **“查看”按钮被双层折叠吞掉**：`ChatMessage` 的 ProcessingSteps 在完成瞬间 `isProcessing→false` 自动收起，
     其内 `ToolCallDashboard` 又默认折叠 → 演示就绪那一刻按钮恰好消失。
  3. `artifactId` 仅在结尾 `tool result` 才到达消息 → 无法在消息内从流式一开始就挂卡片。
  4. `max_tokens:6000` 对 ~15.7KB 产物有**截断风险** → 未闭合 `<script>`/`<body>` 致 iframe 空白。
  5. （潜在）`parseXmlTags` 会把正文里的 HTML 小写标签当组件切碎成“未知标签占位框”。

**修复（更规范：把产物做成消息内常驻、流式、可一键打开的卡片）：**
- `route.ts`：`renderInteractive` 的 `artifactId` 在 **call 事件**即下发（不再等 result）；`useChat` 在 call 阶段
  即把 `artifactId` 挂到该工具调用块。
- 新增 `components/chat/ArtifactCard.tsx`：按 id **反应式**订阅 `useArtifacts`，渲染于**消息气泡内**
  （`ChatMessage`，置于会折叠的 ProcessingSteps 之外）。生成中流式显示源码 + “已写入 N 字符”进度；
  完成后给**常驻显眼**「打开演示」（开 `ArtifactViewer` iframe）+「新标签打开」+「查看/隐藏源码」。
- 删除顶部 `ArtifactBanner` 与 `ToolCallDashboard` 内的重复（且会被折叠的）查看按钮。
- `artifact.ts`：`max_tokens` 6000→12000；捕获 `finish_reason`，`finalizeHtml()` 对截断产物补救
  （丢弃半截标签、平衡 `<script>`、补 `</body></html>`）。
- `xmlParser.tsx`：标签正则改为**仅匹配大写字母开头**的组件标签 → 小写 HTML 永不被切碎（防御性，修复潜在 bug）。

注：单次产物生成仍需数分钟（上游模型整篇 HTML 二次流式），属上游速度上限；本次修复让等待期“看得见在写代码”、
完成后“按钮一直在”，并保证截断也能渲染。

## 6. 研究产出引用

- 硅基流动模型/搜索/嵌入/缓存：见 §2。
- 学习型提示词（苏格拉底+刹车、费曼/自解释、渐隐例题、ICAP、布鲁姆、间隔检索、脚手架、元认知、
  错误诊断）与全局/三学科成稿：落地于 S3 的 MD 文件。caching 拼装顺序：global→工具定义→学科段→
  会话稳定上下文→易变上下文（最后）。
