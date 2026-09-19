# Agent 左栏 / 我的资产 / 项目文件 · 落地记录

配套规划：[`agent-sidebar-assets.md`](./agent-sidebar-assets.md)（含三项已确认口径与边界表）。
分支：`feat/agent-right-panel-unification`；起点 `6289c40e`，终态提交见文末。

## 附一 · 外壳：左栏提到布局层（`feat(agent-shell)`）

**改法**

| 落点 | 改动 |
|---|---|
| `components/layout/AgentShell.tsx`（原 `AgentWorkspace.tsx`） | 签名改为接 `children`：左栏（分栏 Panel、吸附、折叠、拖拽骨架、`--agent-left-width` 观测）原样保留，中央区变成路由插槽 |
| `app/agent/layout.tsx`（新） | `/agent/**` 共用同一个左栏 |
| `components/agent/AgentChatCenter.tsx`（新） | 原 `ChatPanel hideHeader emptyLayout="agent"` 槽位 |
| `lib/hooks/useAgentChatContext.ts`（新） | 外壳与页面共用同一份 chatContext（只带科目 + 学年） |
| `app/agent/{scheduled,plugins}/page.tsx` + `AgentPlaceholderPage`（新） | 两个占位页：明写「未开发」，不摆假开关、不放假数据 |

**关键决定**：`#notes-panel` 锚点从对话组件内部挪到外壳的中央区。窗口全屏（`fullscreenTarget="notes"`）要量它，而 `/agent/assets` 这类子路由里没有 ChatPanel——锚点若留在对话组件里，这些页面上全屏会量不到矩形。

**实测**（Playwright，1440×900，`http://localhost:35349`）

```
/agent            sidebar=true  main=true  notesPanelOnMain=true  chatPanel=true   dock=true
/agent/scheduled  sidebar=true  main=true  notesPanelOnMain=true  placeholder=定时任务
/agent/plugins    sidebar=true  main=true  notesPanelOnMain=true  placeholder=插件市场
console errors: []
```

## 附二 · 左栏 Codex 化 + 项目体系（`feat(agent-sidebar)`）

**左栏结构**：固定头（标题 / 全局搜索 / 折叠）→ 固定四行导航（新对话 / 我的资产 / 定时任务 / 插件市场）→ 滚动区（Projects + Recents）→ 固定底（头像设置 + 归档开关）。滚动容器带 `data-agent-scroll`，是会话列表哨兵的 IntersectionObserver `root`。

**拆出的组件**（`components/agent/`）：`AgentNavRows`、`AgentSectionHeader`、`AgentSessionList`（10 条/批 + 哨兵）、`AgentSessionRow`（含内联重命名）、`AgentPanelMenu`（右键菜单 + 删除二次确认）。纯逻辑放 `lib/agent/projectViews.ts`（系统项目按 `kind`、用户项目按 `folderId`、Recents 收未归组的 main 会话、归档独立）。

**两个已核实缺陷（本次修掉）**

1. **云端拉取会丢项目（P0）**：`lib/sync/engine.ts` 的两处 `saveManifest` 手写字段，漏了 `folders`。任何一次 `pullAndPushAll` 或远端 tombstone 都会把用户项目整批清空，会话的 `folderId` 全变悬空 —— 左栏表现为「项目没了、会话也没了」。
   修法：manifest 收敛成唯一构造入口 `chatStorage.buildManifest` / `manifestFrom`（store 侧 `manifestOf` 委托），并把 `version: 2` 字面量从 store 与引擎里全部清掉（`tests/agentNavStructure.test.ts` + `lib/storage/chatStorage.manifest.test.ts` 双重钉死）。
2. **移动会话后没同步**：`moveSessionToFolder` 缺 `scheduleCloudUpsert('chat-session')`，换设备看不到归属。已补，并且系统项目里的会话（note / floating）不允许改挂（归属由来源决定）。

**云端同步新增 `chat-project`**

- 客户端：`lib/sync/{types,payload,engine,usage}.ts`；负载只有 `{id,name,createdAt,updatedAt,system?}`，上限 32 KB。
- 数据库：`supabase/migrations/0007_sync_chat_project_kind.sql`（kind 约束 + 重建字节上限函数）。
- 降级：`isSyncUnknownKindError` 命中时只提示一次「云端还不认识项目名这类数据，已改为只保留本机」，本次会话不再重试该 kind —— 迁移没跑也不会刷屏、不影响其它同步。

**迁移状态：`0007` 已在云端执行（2026-09-20，见文末运维待办与「云端迁移实测」）。**

**云端迁移实测**（Supabase 项目 `jlahwwnjbhqfnsicdjsx` = StudyReview-Platform）

| 检查 | 迁移前 | 迁移后 |
|---|---|---|
| `sync_documents_kind_check` | 7 个 kind（无 `chat-project`） | 8 个 kind，含 `'chat-project'` |
| `sync_documents_enforce_bytes()` | 无 `chat-project` 分支 | 命中 `chat-project` 且含 `32768` |
| `public.schema_migrations` | 0001–0006 | 0001–**0007**（7 条 checksum 与本地文件逐一相符） |
| 触发器 `sync_documents_byte_limits` | 在 | 在（重建后仍在） |

外加两条功能证据：

1. **事务内探测**：以真实 `user_id` 插一行 `kind='chat-project'` → 成功（约束与 32 KB 触发器都放行）→ `rollback`；事后 `leftover = 0`，没有留下任何行。
2. **客户端真跑通**：迁移记录写入后约 10 秒，云端出现两行 `chat-project`（`project-note` / `project-floating`）——用户本机已登录的客户端把两个系统项目推了上来，整条链路（客户端新 kind → 约束 → 行）就此验证，不再需要那条降级提示。

## 附三 · 我的资产（`feat(agent-assets)`）

| 层 | 落点 | 说明 |
|---|---|---|
| 纯函数 | `lib/agent/assetCatalog.ts` | 六类来源 → `AssetItem[]`；筛选 / 排序 / 计数 / 角标文案 |
| 路由 | `lib/agent/assetHref.ts` | `/agent/assets/{kind}/{id}`；非法 kind → `notFound()` |
| 聚合 hook | `lib/hooks/useAgentAssets.ts` | 任一来源未水合就返回 `null`（骨架），不用半份数据渲染 |
| 本地导入记录 | `lib/stores/imports.ts` | 只存路径与元数据；同路径/同网址只更新不追加 |
| 云角标 | `lib/sync/status.ts` 的 `hasCloudRow` | 读最近一次拉取快照；`null` = 没对过账 → 不显示角标 |
| 页面 | `components/agent/AgentAssetsPage.tsx` / `AgentAssetCard.tsx` / `AgentAssetDetail.tsx` | 标签 + 视图切换 + 搜索 + 排序；卡片跳详情；详情复用既有渲染件 |

**写入点**（只记「用户意图」的三处）：输入框附件（`useImageAttachments.addFiles`）、加号菜单「添加文件」、加号菜单「打开网址」。图片不记（那是对话附件，记进来会把资产页刷满）。

**实测**（Playwright 走真实交互：加号菜单建笔记 + 打开网址，再点左栏「我的资产」）

```
标签：全部 3 | 笔记 2 | 闪卡 0 | 长文本 0 | 可交互 0 | 文件 0 | 网址 1
列表/橱窗切换：assets-list / assets-grid 均渲染；localStorage 记住选择
搜索 lecture/example：过滤正确；无结果给「没有匹配…」+ 清空搜索
详情：点击卡片 → /agent/assets/note/example-user-note，左栏保留，data-asset-kind=note，正文由 NoteRenderer 渲染（含 KaTeX）
console errors: []（详情页直连与点击两条路径都验过）
```

## 附四 · 输入框项目 chip（`feat(composer)`）

- `components/chat/composer/ProjectPickerChip.tsx`：默认 `No Projects`；菜单给最近项目（≤5）、添加新项目、不使用项目。
- 位置：`.chat-input-editor-row` 里、发送键左侧（输入框右下角）；样式 `.chat-input-project-chip`（容器查询 ≤520px 只留图标）。
- 门控：只有 Agent 中央对话渲染 —— `ChatPanel` 传 `showProjectPicker={emptyLayout === "agent"}`，划词浮窗 / 题目解析 / 手机迷你聊天 / 笔记窗一律不带项目归属。
- 语义：选中项目既改「下次新建对话的落点」，也把当前这条会话挂过去；空白会话同样直接挂。

**实测**：`/agent` 空对话页右下角出现 chip，显示当前项目名「我的项目」（截图 `s5-project-files.png` 可见）。

## 附五 · 项目文件（`feat(project-files)`）

| 层 | 落点 | 要点 |
|---|---|---|
| 解析 | `lib/project/parse.ts` + `pdfText.ts` | 文本/md/html/docx 复用 `fileToDocumentAttachment`；pptx 复用 `parsePptxSlideBytes`；pdf 走 pdfjs 文本层（与 `PdfDocumentPane` 同一份 worker 资源） |
| 切片 | `lib/project/slice.ts` | 标题优先（`#`~`###`）；无标题按 2500 字窗口 + 200 重叠；单片封顶 4800；片数封顶 60；同时产出「隐藏索引 md」 |
| 目录/携带 | `lib/project/catalog.ts` | 目录 ≤ 64 KB（超了从尾部裁切片并标 truncated）；正文 ≤ 48 KB 默认全带，否则只带勾选片 |
| 存储 | `lib/stores/projectFiles.ts` | 三步写入 `beginImport → finishImport/failImport`；重启时把 `parsing` 标成 error，不假装还在跑 |
| 教材软链接 | `lib/project/studioRefs.ts` | 只记 path；检索跨全部科目的导航树 |
| 窗口 | `components/project/ProjectFilesWindow.tsx` + `ProjectFilesLayer.tsx` | 左树右正文；`ManagedWindowType` 新增 `project-files`，一个项目一个窗 |
| 入口 | `WindowTaskbar` 的加号菜单顶部组（仅 Agent） | 没有选中项目时：优先最近有对话的项目，一个都没有才建「我的项目」 |
| 工具 | `lib/ai/agent/tools/{getProjectFiles,readProjectSlices}/` | 目录看索引；切片读正文；未携带给「点带入对话」的可执行提示；studio-ref 指回 `getSection(path)` |

**为什么是「目录 + 按需切片」**：服务端工具读不到浏览器 IndexedDB，仓库既有范式（`userNotes` / `flashcards`）就是「请求体注入目录 + 服务端检索」。项目文件沿用同一条路：目录每次上行，正文只在携带范围内上行。因此**文件内容不上云、也不离机**。

**实测**（Playwright：加号菜单 → 项目文件 → 导入一份 md → 拦截 `/api/chat` 看真实请求体，不打模型额度）

```
menu has project entry: True
window opened: tree=True  carry=还没有可带入的内容  empty=True
after import: tree='MD 组胚讲义.md'  carry='已全部带入（3 片 · 50 字）'
request: projectFiles=1  projectSlices=3
         fileName=组胚讲义.md
         sliceIndex=['上皮组织','单层上皮','复层上皮']
         sliceIds=['slice-1','slice-2','slice-3']
console errors: 仅探针自己制造的 500 与未登录的 401
```

## 与规划的三处偏差（都是落地时更优的选择）

1. **资产路由与页面一起落在阶段 3**，阶段 0 不先放空壳页 —— 少一次「先建后改」的反复。
2. **视图偏好不在 effect 里 setState**（`react-hooks/set-state-in-effect` 会拦，也会级联渲染）：改成 `useIsClient()` + 渲染期读 localStorage。
3. **「重新解析」变成「重新导入」**：解析后不保留 `File` 句柄，凭同路径/同名的重新导入触发覆盖更新（去重规则写在 `beginImport` 里）。

## 质量门

| 门 | 结果 |
|---|---|
| `npx tsc --noEmit` | 0 |
| `pnpm run test:unit` | **1374 pass / 0 fail**（本轮 +45） |
| `pnpm run test:react` | **148 文件 / 574 pass**（本轮 +4 文件 / +21 用例） |
| `npx eslint .` | 0 error（warning 90，基线 91） |
| `npx knip` | 未用文件 3 / 未用导出 14 / 未用类型 1 —— 与基线一致（本次新增的导出都有消费者） |
| `pnpm run check:encoding` | 3575 个 Markdown 全部合法 UTF-8 |
| `git diff --check` | 0 |

## 门记录（末次全量运行）

```
npx tsc --noEmit                 → 0
pnpm run test:unit               → tests 1374 / pass 1374 / fail 0
pnpm run test:react              → Test Files 148 passed / Tests 574 passed
npx eslint .                     → 0 errors, 90 warnings（基线 91）
npx knip --no-progress           → Unused files 3 / exports 14 / types 1（与基线一致）
pnpm run check:encoding          → 3575 个 Markdown 均为合法 UTF-8
git diff --check                 → 0
```

本轮新增/改写的测试：`lib/agent/projectViews.test.ts`（6）、`lib/agent/assetCatalog.test.ts`（6）、
`lib/storage/chatStorage.manifest.test.ts`（4）、`lib/project/slice.test.ts`（6）、`lib/project/catalog.test.ts`（6）、
`tests/agentNavStructure.test.ts`（5）、`tests/agentAssetsStructure.test.ts`（6）、`tests/agentProjectFilesStructure.test.ts`（6）、
`components/layout/AgentShell.test.tsx`（5）、`components/layout/AgentConversationSidebar.test.tsx`（8）、
`components/agent/AgentAssetsPage.test.tsx`（6）、`components/agent/AgentAssetDetail.test.tsx`（3）、
`components/project/ProjectFilesWindow.test.tsx`（3）、`components/chat/composer/ProjectPickerChip.test.tsx`（5）。

## 运维待办

1. ~~**`0007` 迁移还没在云端执行**~~ → **已于 2026-09-20 执行完毕**。
   实际路径不是 `pnpm db:migrate`（它要 `SUPABASE_ACCESS_TOKEN` 环境变量，仓库里没有），而是用**已登录的 Supabase CLI**
   （`supabase projects list` 能列出项目，说明登录态在）走管理 API：
   ```powershell
   supabase db query --linked --project-ref jlahwwnjbhqfnsicdjsx --file supabase/migrations/0007_sync_chat_project_kind.sql
   # 记账（checksum 用仓库同一套 sha256，保证 db:migrate:status 不会报漂移）
   supabase db query --linked --project-ref jlahwwnjbhqfnsicdjsx "insert into public.schema_migrations (version, name, checksum) values ('0007','sync_chat_project_kind','<sha256>') on conflict (version) do update set name = excluded.name, checksum = excluded.checksum"
   ```
   注意：`--project-ref` 必须和 `--linked` 一起用（CLI 的硬性要求），单独传 ref 会报错。
   后续迁移照这个路径走即可；`pnpm db:migrate:status --compare` 需要额外提供 `SUPABASE_ACCESS_TOKEN` 才能跑。
2. 项目文件是纯本机数据：换设备 / 清 IndexedDB 后需要重新导入（这也是「不上云」的代价，已在窗口里写明）。
3. 本轮的三个新入口都写「本地导入记录」：如果用户大量导入文件，「我的资产 → 文件」会变长——目前没有上限，后续可按 `createdAt` 分页。