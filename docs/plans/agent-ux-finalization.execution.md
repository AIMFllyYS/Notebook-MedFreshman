# Agent 页面 UX 收尾 · 实施记录

日期：2026-09-21
分支：`feat/agent-ux-finalization`（基线 `origin/dev` @ `b6a42b27`）
方案与需求拆解见同目录 [`agent-ux-finalization.md`](./agent-ux-finalization.md)。

---

## 1. 需求 → 落点对照

| # | 用户要求 | 实现 | 证据 |
|---|---|---|---|
| 1 | 搜索了哪个笔记 / 搜了什么内容都要有来源显示 | `SourceRound`（query + 来源）+ 右上角来源框 + 「来源」页签按轮次列出 query | 截图：来源页签显示 4 轮、每轮带搜索词 |
| 2 | Agent 自动出题，参考 Perplexity | `createQuiz` 在 Agent 面不再渲染折叠答题卡，改开右栏 `quiz-dock` 窗；对话里只留一条瘦行 | 截图：右栏出题窗 + 「已出题 · 2 题 / 在右侧作答」 |
| 3 | 顶部 Answer / Links / Images 可切换 | `AgentCenterTabs`（回答 / 来源 / 图片，带计数徽标） | 截图：顶部三页签 |
| 4 | 生成 HTML / 图片仍在对话里跑 | 回答页签只**隐藏**不卸载 ChatPanel；生成类工具卡一个没动 | — |
| 5 | 来源框固定在右上角 | `AgentSourceDock`（absolute 定位于中央区右上） | 截图：右栏收起时右上角出现「来源 · 8」 |
| 6 | 拉开右侧面板时来源框自动隐藏 | `hidden={isMobile \|\| !agentDockCollapsed \|\| centerTab !== "answer"}` | 截图：右栏展开后来源框消失 |
| 7 | 点来源框 → 右侧拉出面板，右导航 + 核心页两栏 | 复用 `openSourceTrace` → `source-trace-viewer`（`DocumentWorkspace`），目录按轮次分组 | 截图：来源面板 4 组 + 正文 |
| 8 | 出题直接在右侧面板 | 同上（自动开右栏、每 quizId 只自动弹一次） | 截图 |
| 9 | 划词 → 右侧拉出复用 Agent 的窗口 | `floating-chat` 在 Agent 下本就 dock；本轮补窗口标题「划词 · …」并在标题写入处保住前缀 | 标签条显示「划词 · …」/「Selection · …」 |
| 10 | i18n：默认中文，设置页可切中英文 | `lib/i18n`（93 key，zh 为真相源）+ `settings.locale` + 外观页语言分段控件 | 截图：切 English 后 Answer / Links / Images / Projects |
| 11 | 左栏项目名称右侧常显「+」 | `AgentConversationSidebar` 的 `agent-project-new-chat-*` 由 `opacity-0 group-hover` 改为常显 | 截图：「细胞生物学」行右侧的 + |

## 2. 新增模块

| 模块 | 职责 |
|---|---|
| `lib/i18n/` | `Locale` / zh·en 词典 / `translate` / `useT` / `syncDocumentLocale`。zh 是形状真相源，en 走 `satisfies` |
| `lib/stores/agentCenter.ts` | 中央区当前页签（回答 / 来源 / 图片），不落盘，换对话回回答 |
| `lib/agent/sessionImages.ts` + `lib/hooks/useSessionImages.ts` | 会话级图片收集（图搜 / 笔记配图 / 已生成），纯函数与订阅分离以便 node:test |
| `lib/hooks/useSessionSources.ts` | 会话级检索轮次（`rounds` / `sources` / `total`），返回稳定引用 |
| `lib/quiz-dock/open.ts` | 出题窗唯一入口（幂等 + sessionStorage 去重，刷新不重弹旧题） |
| `components/agent/AgentCenterTabs.tsx` | 顶部分段开关 |
| `components/agent/AgentSourceDock.tsx` | 右上角固定来源框 |
| `components/agent/AgentLinksPane.tsx` / `AgentImagesPane.tsx` | 来源 / 图片两个页签 |
| `components/agent/sourceRoundLabel.ts` | 把轮次文案统一成词典口径（否则面板会显示 TOOL_PRESENTATION 的旧措辞） |
| `components/quiz/QuizRunner.tsx` | 从 ChatQuizCard 抽出的作答主体，对话卡与右栏窗共用 |
| `components/quiz/AgentQuizWindow.tsx` | 右栏出题窗图层 |

主要改动文件：`AgentChatCenter.tsx`（组装三页签 + 来源框）、`lib/chat/traceSources.ts`（`SourceRound` 与会话级聚合）、
`components/chat/SourceTraceViewer.tsx` + `components/window/DocumentWorkspace.tsx`（按轮次分组）、
`lib/stores/windowManager.ts` + `components/window/DeferredWindowLayers.tsx` + `WindowTypeIcon.tsx`（`quiz-dock` 类型）、
`components/chat/toolCards/createQuizCard.tsx`（Agent 瘦行 + 自动开窗）、`components/chat/FloatingChatWindow.tsx`（划词窗标题）、
`components/layout/AgentConversationSidebar.tsx`（常显 +、i18n）、`lib/stores/settings.ts`（locale）。

## 3. 关键决定与理由

1. **回答页签只隐藏、不卸载 ChatPanel**：ChatThread 的划词容器 ref 是挂载时绑定的，卸载再挂载会让
   `SelectionPopover` 错过新节点（ChatPanel 里原有注释已写明这个坑）。
2. **词典以中文为真相源**：现有文案全是中文，迁移只做「字面量搬进字典」；`en.ts satisfies LocaleMessages`
   保证中英 key 集合一致，漏翻在 typecheck 阶段就报错。
3. **i18n 只覆盖 Agent 面**：全应用全量迁移是机械但巨大的后续工作，本期不做（见第 6 节）。
   为并行开发方便，`TranslateKey` 允许任意字符串：先引用未落地 key 不会编译失败，运行时回退中文并开发期告警。
4. **来源轮次自带 `label`**：面板内部只有旧措辞，调用方在打开前贴词典文案，避免同一件事两个名字。
5. **出题自动开窗用 sessionStorage 去重**：刷新页面重放历史消息时不会把旧题重新弹出来（与「刷新不自动弹出历史窗口」的既有语义一致）。
6. **划词前缀加在窗口标题而不是会话标题**：会话标题会被 `/api/chat-title` 自动改写，贴在那里等于白贴。

## 4. 验证

| 闸门 | 结果 |
|---|---|
| `pnpm typecheck` | 通过（0 错） |
| `pnpm test:unit`（node:test） | 1443 通过 / 0 失败 |
| `pnpm test:react`（vitest） | 165 文件 / 665 用例全绿 |
| `pnpm lint:eslint` | 0 error / 88 warning（历史噪声，仓库口径「只看 exit code 与 error」）；**本次改动涉及的 16 个文件单独跑 eslint 为 0 问题** |
| `pnpm lint:knip` | **失败，但与本次改动无关**：在 HEAD（`git stash` 后）跑 `npx knip` 得到完全相同的 3 个未使用文件 + 14 个未使用导出 + 1 个未使用类型，exit 1。既有基线问题。 |
| `pnpm build` | 通过（prebuild 闸门链 + `next build` 全绿） |
| 真浏览器验收 | `http://localhost:35349/agent`，见第 5 节 |

### 4.1 顺手修掉一个阻塞闸门的 flaky

`pnpm build` 连续两次在 prebuild 的单测步挂掉：`lib/ai/sdk/heartbeat.test.ts`
（`expected >=2 heartbeats, got 1`）。单独跑 3/3 通过 —— 是**测试写法**的问题而不是产品缺陷：

测试原本用 `await sleep(35)` 等两个 10ms 心跳周期。事件循环被占住时（`run-unit-tests.mjs` 单进程并行跑全部
`.test.ts`，本分支又新增了一个测试文件），一个 tick 只会跑一次 interval，等再久也只拿到 1 个心跳。

改法：判据从**时钟**换成**真实数据** —— 读到第 2 个心跳再放行首 chunk。断言一字未改，
语义（首 chunk 前有心跳、首 chunk 后停止）完全保留，结果确定。这是纯测试加固，不碰 `lib/ai/sdk/heartbeat.ts`。

## 5. 浏览器验收步骤与结果

用 `agent-browser` 在真实 `next dev`（35349）上逐项走查。**AI 请求需要登录**（当前是访客），
所以来源 / 出题 / 划词三项用**注入 IndexedDB 的合成会话**驱动（`gailvlun-db/keyval` 的 `chat-manifest` + `chat-session:<id>`），
其余项用真实交互。

| 项 | 结果 |
|---|---|
| 顶部三页签（回答 / 来源 8 / 图片 2） | ✅ 徽标计数正确，切换生效 |
| 右上角来源框（右栏收起时出现） | ✅ 「来源 · 8」+ host / 笔记标题 chip |
| 右栏展开后来源框自动隐藏 | ✅ |
| 点来源框 → 右侧来源面板 | ✅ 目录按 4 个检索轮次分组，每组带搜索词 |
| 来源页签 | ✅ 4 轮 × 各自来源，标题 + 路径/URL |
| 图片页签 | ✅ 分组网格，点击开 Lightbox |
| 出题进右栏 | ✅ 自动开 `quiz-dock`，对话里只剩「已出题 · 2 题 / 在右侧作答」 |
| 划词 → 解释 | ✅ 右栏新增标签「划词 · …」，会话落进「划词摘录」项目 |
| 设置 → 外观 → 语言 → English | ✅ `<html lang>` / `data-locale` 变 en，页签变 Answer / Links / Images，侧栏变 Projects / Recents |
| 左栏项目「+」常显 | ✅ |

## 6. 已知边界（不在本期）

- **i18n 只覆盖 Agent 面**：Studio / Class / 内容页 / 设置详情仍是中文硬编码。基础设施已就位，
  后续按模块把字面量搬进 `lib/i18n/messages/zh.ts` 即可（`en.ts` 漏 key 会被 typecheck 拦下）。
- **设置浮层仍在中央**（`AgentSettingsOverlay` 是居中 dialog），没进右栏 —— 属 `agent-right-panel-unification` 的第二阶段。
- **右栏内的笔记正文没有划词助手**：`SelectionPopover` 目前只挂在对话容器上，右栏文档里划词暂无动作。
- **来源框是浮层而非独立右轨**：宽屏下落在对话栏右侧留白里；窗口很窄时理论上可能与正文叠。已在移动端隐藏。
- `pnpm lint:knip` 的既有基线失败需要单独一轮清理，不属于本分支。
