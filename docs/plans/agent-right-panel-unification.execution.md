# Agent 右侧工作区统一改造执行记录

> 与 `agent-right-panel-unification.md` 配套的短记录。只记录实际代码状态、验证结果和与规划的差异；不替代规划正文。
> 最近一次更新：2026-09-19，由接手 Agent 完成真实浏览器验收后重写。

## 基线与分支

- 日期：2026-09-19
- 实施分支：`codex/agent-right-panel-unification`
- 基线提交：`3445f3c8`
- 已核对：`master`、`dev`、`feat/glassmorphism-design-system` 均与基线一致；本任务分支已从该基线创建。
- 工作区**仍未提交、未推送、未合并、未部署**。
- 接手前工作区改动已保留：`docs/README.md`、`docs/design-snapshots/`、规划文档本身。
- 仓库内未发现 `AGENTS.md`。
- 本轮未使用 `git reset --hard` / `git checkout --` / `git clean`，未删除任何既有文件。
- 浏览器验收脚本与截图全部写在仓库之外（`C:\\Users\\AIMFl\\.codex\\visualizations\\2026\\09\\19\\agent-dock-acceptance\\`），仓库内没有新增临时文件。

## 阶段进度

| 阶段 | 状态 | 实际结果 |
|---|---|---|
| 0. 文档/笔记/iframe 小范围验证 | 完成（含真实浏览器） | 笔记编辑器、Markdown 附件（DocumentWorkspace）、source preview iframe 均已确认通过公共壳进入右侧工作区，切标签不重建。 |
| 1. 全部 managed 窗口接入 | 完成（含真实浏览器） | 既有 `ManagedWindow` 内容按展示策略自动选择浮窗 / Agent 桌面 dock / 窄屏 sheet；本轮实测覆盖笔记、附件文档、API 计费总览、AI 助手浮窗、source preview。 |
| 2. 独立业务弹层适配 | 完成（含真实浏览器） | Agent 设置、全局设置、账户信息、额度、快捷键帮助、登录已实测进入统一宿主并可真实关闭。 |
| 3. 附属层、窄屏、焦点与键盘 | 完成（真实浏览器 + 单测） | Esc 语义、Alt+W/Alt+M、最小化、收起/展开、移动 sheet、焦点归还全部实测；Lightbox / 画布全屏按"保持附属层"结论登记（见限制）。 |
| 4. 整体验收与清理 | 完成 | 全部测试、类型检查、ESLint、构建通过；完整 `pnpm run lint` 仍被既有 Knip 问题阻断（非本次引入）。 |

## 已落地的公共设计

- `lib/window/presentation.ts`：统一解析 `floating` / `dock` / `sheet` / `pending`，以及 dock 的可交互条件。
- `lib/window/agentDockRuntime.ts`：维护稳定 content host、managed/external/builtin 活动引用、收起状态、打开请求和外部 surface 元数据。
- `lib/window/dockTypingFocus.ts`（本轮新增）：非模态右栏的 Esc 焦点守卫，用 `useSyncExternalStore` 订阅 `focusin`/`focusout`。
- `components/window/AgentDockHost.tsx`、`AgentDockTabs.tsx`：右侧宿主、统一标签、关闭和添加内容入口。
- `ManagedWindow` / `WindowChrome` / `useManagedWindowChrome`：普通模式保持浮窗；Agent 桌面 portal 到 `#agent-dock-content`；移动端降级为右侧 sheet；dock 不再使用 fixed 几何/拖拽/浮窗 resize 外壳。
- `windowManager` / `windowActions`：同实例复用、最小化后重新选取可见活动窗口、真实关闭继续走业务清理契约；Agent 活动 surface 与窗口管理器同步。
- `RightPanel` / `AgentWorkspace` / `WindowTaskbar`：标签栏和内容区分离，内置 AI/视频/交互/浏览器与 managed/external surface 不重复叠外壳；收起保留宿主与内容身份。
- `WorkspaceSurface`：设置、登录、账号、额度、搜索、快捷键帮助等非 ManagedWindow 表面的薄适配器，负责 dock/sheet、外部标签、关闭和焦点归还。
- 笔记编辑器和课堂便签只在真正前台且 dock 展开时挂载重型编辑器。

## 本轮（接手后）修复的真实问题

1. **右侧工具栏溢出，收起按钮被挤出视口（真实浏览器发现，1440×900）**
   内置工具标签条（含浏览器收藏夹固定标签，宽度可达 454px）此前是 `shrink-0`，会把窗口标签和 `收起右侧面板` 按钮推到 x=1538（视口 1440）之外，导致**收起按钮点不到**。
   修复：`RightPanel` 的工具栏按"是否存在窗口坞标签"分配空间——有坞标签时内置条改为 `min-w-0 shrink basis-auto max-w-[45%]`（可横向滚动），否则 `flex-1`；窗口标签容器相应在 `flex-1` / `shrink-0` 之间切换。
2. **添加内容按钮会被标签滚动带走**
   修复：`AgentDockTabs` 拆成"可滚动 tablist + 固定 addContent"，标签再多也不会把「＋」滚出可视区。
3. **窄 dock 下窗口动作按钮与"扩展右侧工作区"重叠（真实浏览器发现，dock 宽 230px）**
   业务 `actions` 是 `min-width:auto` 的 flex item，会同时溢出自己的容器并盖住 dock 扩展按钮，导致「删除这篇笔记」等动作点不到。
   修复：`WindowChrome` 把 `actions` 放进 `min-w-0 overflow-x-auto` 区域，外链与 dock 扩展按钮 `shrink-0`，右侧整组限制为 `max-w-[calc(100%-6rem)]`。窗口控制始终可点，业务动作可横向滚动到。
4. **前台 Esc 会关掉右栏文档（规划 §7.4 要求但此前未实现）**
   实测：焦点在中央对话输入框时按 Esc，会命中 overlay 栈把右侧笔记关掉。
   修复：新增 `useDockTypingFocusGuard`；`ManagedWindow`（dock）与 `WorkspaceSurface`（dock）在"焦点位于右栏之外的输入框"时不注册前台关闭浮层。行为与 `KeyboardShortcutProvider` 现有的输入框保护规则一致。Sheet（移动端）不受影响。
5. **窄屏 sheet 关闭后焦点丢到 body，且缺少模态语义**
   修复：`ManagedWindow` 在 `sheet` 展示下记录打开前的焦点，关闭时归还；sheet 根节点补 `role="dialog"` + `aria-label`。

## 覆盖清单

### ManagedWindow（17 种类型，公共壳自动分流）

| 类型 | 本轮浏览器实测 | 说明 |
|---|---|---|
| user-note-editor | 是 | dock 内编辑标题/源码草稿，切标签、收起/展开、跨视口都保留正文 |
| user-note-library | 是（移动端 sheet） | 390×844 下为整屏 sheet，无 dock 控件 |
| source-preview | 是 | 强制内嵌路径下 iframe 在 dock 内；同 URL 重复打开只有一个标签 |
| attachment-preview | 是 | 上传 Markdown → DocumentWorkspace 在 230px 窄 dock 内不越界 |
| billing-dashboard | 是（Ctrl+4） | 宽内容在窄 dock 内不越界，工具栏仍可达 |
| floating-chat | 是（Ctrl+I） | 在 dock 内渲染，不产生 body 浮窗；Alt+W/Alt+M 生效 |
| artifact-viewer / document-viewer / note-citation-viewer / source-trace-viewer / image-gen-viewer / record-preview / membership-sponsor / flashcard-cite-picker / agent-product-picker / memory-proposal / quiz-explain | 否 | 需要 Agent 会话产物、课堂录音或本地文档数据；沿用同一公共壳与关闭分发，本轮未做浏览器实测（见限制） |

- 覆盖结果：**所有 managed 类型都走同一个公共展示策略和关闭分发**，没有为任何业务组件复制 Agent 版本；只有笔记/课堂便签保留"仅前台挂载重编辑器"的薄适配。
- 真实关闭：标签叉号 → `closeManagedWindow(win)` → 业务 store 清理（实测删除笔记后 windowManager 记录与标签同时消失，无空标签）。

### 独立业务 surface（非 ManagedWindow）

| 入口 | 状态 | 实测结果 |
|---|---|---|
| AgentSettingsOverlay（顶栏"设置"） | 已接入 | dock 内全宽渲染，独立标签，标签叉号走原 `onClose`，无残留标签 |
| GlobalSettings（左下用户菜单"设置"） | 已接入 | 使用 page 变体填满 dock，无浮窗外壳 |
| UserQuotaPanel（用户菜单"额度"） | 已接入 | dock 内渲染，关闭后无标签 |
| AccountDialog（设置内"查看账户"） | 已接入 | 与其他 surface 并存为两个标签；dock 下不再显示自带关闭头 |
| LoginOverlay（设置内"登录"） | 已接入 | 登录表单填满 dock（不再居中浮窗），原 `openLoginOverlay`/`onClose` 未改 |
| SpotlightDialog / GlobalSearch | 已接入 | 通过 `WorkspaceSurface` 复用搜索正文；本轮未在浏览器逐一打开（快捷键帮助已实测同一条适配路径） |
| ShortcutHelpOverlay（Ctrl+Shift+/） | 已接入 | dock 内渲染，Esc 关闭的是它而不是后台笔记 |

### 保持附属层语义（未改成标签）

| 表面 | 结论 |
|---|---|
| 删除确认 | 实测 `role="alertdialog"` + `aria-modal="true"`，portal 到 body，**不进入 dock、不新增标签**，按钮顺序仍为 取消 → 删除 |
| 输入上限提示 | 实测 `role="alertdialog"`，非 dock、无新标签 |
| 图片 Lightbox | 代码未改动，仍是 body portal 的模态层（`useOverlayRegistration` priority 90、锁 body 滚动）。本轮没有可触发的带图消息，未做浏览器实测 |
| CanvasFullscreenPortal | 代码未改动，注释已说明必须 portal 到 body（祖先 `contain:layout` / `transform` 会吃掉 fixed）。**保持全屏附属层是有意设计**，不是待统一的标签 |
| 人机验证 `HumanChallengeDialog` | 代码未改动，仍是认证流程内的局部模态层；需要后端下发验证挑战才能触发，本轮未实测 |
| 下拉菜单/右键菜单/tooltip/模型选择 | 未改动，仍锚定触发点 |

## 已执行验证（本轮实际命令与结果）

| 命令 | 结果 |
|---|---|
| `pnpm run test:react` | 通过：144 个文件 / **534** 个测试（上一轮 530，本轮新增 4 个针对新行为的测试） |
| `pnpm run test:unit` | 通过：232 个文件 / **1311** 个测试 |
| `pnpm exec tsc --noEmit --incremental false` | exit 0 |
| `git diff --check` | exit 0 |
| `pnpm run lint:eslint` | exit 0：**0 errors / 92 warnings**（与基线一致，均为既有规则警告） |
| `pnpm run build` | 通过：Turbopack 编译成功，1337/1337 静态页面生成完成 |
| `pnpm run lint` | **exit 1**：ESLint 0 error/92 warning 通过；Knip 阶段报 3 个未使用文件、14 个未使用导出、1 个未使用导出类型、5 条配置提示——全部为既有问题（含 `SelectionAssistantGuard.tsx`、`useFlashcardCitations.ts`、`useUserNotes.ts`、`lib/workspace/agentDock.ts: agentFullscreenPanelId`；后者在基线 `HEAD` 就已无人引用）。本轮新增文件/导出未被 Knip 标记 |

### 本轮新增的回归测试

- `components/window/ManagedWindow.test.tsx`
  - 焦点在 dock 之外的输入框时，dock 窗口不注册前台 Esc；焦点回到 dock 内部后重新注册
  - 移动端 sheet 关闭后焦点归还触发按钮
- `components/window/WorkspaceSurface.test.tsx`
  - external surface 在同样的输入框焦点条件下不抢前台 Esc
- `components/window/WindowChrome.test.tsx`
  - dock 模式下业务 actions 位于可横向滚动区域，窗口控制（关闭/收起标签/扩展）与其并列，不再互相覆盖

这些是行为断言（overlay 栈成员、activeElement、DOM 兄弟关系），不是类名断言。

## 真实浏览器验收（Playwright + Chromium，黑盒）

### 环境

- 开发态：`pnpm dev`（端口 35349），脚本访问 **`http://localhost:35349/agent`**。
- 生产态：`pnpm run build` 后 `pnpm start`（端口 35349），脚本访问 `http://127.0.0.1:35349/agent`，复跑核心流程 + 控制台巡检。
- **重要环境结论（不是产品 bug）**：Next 16 开发服务器默认阻止非同源 dev 资源（`/_next/webpack-hmr`）。用 `127.0.0.1` 访问 dev 时页面 SSR 正常但**不会 hydrate**，所有点击都无反应——上一轮"添加内容菜单打不开"即由此产生。改用 `localhost` 后单击即开菜单（脚本一次点击成功）。生产构建两种主机名都正常。

### 桌面 1440×900（脚本 flow1 / flow2 / flow3 / flow5 / flow6）

全部通过的关键结论：

1. 单击「添加内容」→ `aria-expanded=true` + `role="menu"` 出现（一次点击）。
2. 新建笔记 → 编辑器出现在 `#agent-dock-content` 内，有统一标签。
3. 改标题 + 切「源码」+ 写 Markdown 草稿 → 草稿进入正文。
4. 切到内置「动画讲解」→ 笔记节点 **同一 DOM 节点仍在**（`sameNode:true`），`display:none`，草稿文本仍在 DOM；标签 `aria-selected=false`。
5. 切回笔记标签 → 标题与草稿逐字保留。
6. 收起右侧面板 → 面板实测宽度 0，`data-agent-dock-host` 仍在、`data-dock-collapsed=true`、标签记录仍在、笔记节点身份未变、草稿保留。
7. 收起状态下按 Esc → 不关闭隐藏内容。
8. 展开 → 笔记恢复显示，草稿不变。
9. 焦点在笔记内按 Esc → 关闭笔记；焦点在中央输入框按 Esc → **不关闭**笔记。
10. Agent 设置 → dock 内全宽 surface + 标签；切回笔记标签时设置 surface 只是隐藏不销毁；标签叉号关闭后无残留标签、无空标签。
11. 额度 / 全局设置 / 快捷键帮助（Ctrl+Shift+/）→ 同样的 dock surface 行为；Esc 关闭的是当前 active 的快捷键帮助而不是后台笔记。
12. source preview：同 URL 连续打开两次 → 只有一个标签；iframe 元素身份与文档状态（写入的 DOM 标记）在切标签后仍保留，即**切标签不重载 iframe**；关闭后 ManagedWindow、标签、iframe 同时消失。
13. AI 助手浮窗（Ctrl+I）在 dock 内渲染，不产生 body 浮窗；Alt+W 只关闭当前 active 标签；Alt+M 最小化后窗口保留标签但退出内容区，Esc 不会误关最小化窗口，点标签可还原。
14. 窄 dock（把分栏拖到最小，实测面板宽 230px）：Markdown 附件以 `document-workspace` 渲染且不超出内容区；文档宽度 229 = 内容区宽度；页面无横向溢出；Ctrl+4 的 API 计费总览同样不越界，`收起右侧面板` 仍可点。
15. 登录 / 账户信息作为 external surface 与设置并存为标签，宽度等于 dock 宽度；关闭当前 external 标签后 dock 回落到内置工具页，剩余标签可再次激活，最后关闭不留孤儿。
16. 删除确认：`alertdialog` + `aria-modal`，不在 dock 内、不新增标签、取消在前删除在后；取消保留笔记，确认后笔记窗口与标签一起消失。
17. resize handle：右侧面板从 403 → 552，dock 内容宽度跟着变（551 = 内容区 551），工具栏控件都在视口内，页面无横向溢出。
18. 浏览器缩放等效宽度：125%（1152px）与 80%（1800px）下均无横向溢出，`收起右侧面板` 与「＋」都在视口内。
19. 控制台巡检（生产构建，走完笔记/内置标签/收起展开/设置/iframe/额度）：**0 个 console error、0 个 pageerror**；只有 1 条既有 Chromium 警告（source preview 的 `sandbox="allow-scripts allow-same-origin"` 提示，来自未改动的 `SourcePreviewViewer`）。

### 移动端 390×844（脚本 flow4，`is_mobile` + touch）

- 移动端 `/agent` 会被 AppShell 重定向到上一次 Studio 路径，页面上**不存在** `[data-agent-dock-host]`（符合"不能假设右侧 DOM 一定存在"）。
- 从移动端 UI 打开笔记库窗口 → `[data-surface="sheet"]`：`position:fixed`、x=0、宽 390、高 844，页面无横向溢出。
- sheet 内**没有**"收起当前标签""扩展窗口""拖拽缩放窗口"等桌面控件；根节点带 `role="dialog"` 与标题。
- 关闭后 sheet 卸载，焦点回到触发按钮（实测 activeElement 为 BUTTON）。
- 桌面 → 390px：右侧宿主消失，同一篇笔记转为 sheet，正文逐字保留；回到 1440px 后应用按既有规则停在 Studio 路由（笔记以浮窗继续存在），通过模式切换器回到 Agent 后笔记重新 dock（`position:relative`，无浮窗），标签与草稿都在。

### 截图

截图目录：`C:\\Users\\AIMFl\\.codex\\visualizations\\2026\\09\\19\\agent-dock-acceptance\\`

- `01-add-menu.png` 添加内容菜单
- `02-note-dock.png` / `03-note-draft.png` 笔记 dock + 草稿
- `04-builtin-tab.png` 内置标签下笔记被隐藏
- `06-collapsed.png` / `07-expanded.png` 收起与展开
- `09-settings-dock.png` Agent 设置在 dock
- `11-quota-dock.png` / `12-global-settings-dock.png` 额度与全局设置
- `13-shortcut-help-dock.png` 快捷键帮助
- `14-iframe-dock.png` / `17-iframe-dock.png` source preview iframe
- `19-mobile-sheet.png` 移动端 sheet
- `20-narrow-after-desktop.png` / `21-back-to-desktop.png` 跨视口往返
- `22-resized-panel.png` 手动拖拽分栏
- `23-zoom-125.png` / `23-zoom-80.png` 缩放等效宽度
- `24-narrow-doc-dock.png` 窄 dock 里的 DocumentWorkspace
- `25-narrow-billing-dock.png` 窄 dock 里的宽内容
- `26-delete-confirm.png` 删除确认
- `27-login-dock.png` / `28-account-dock.png` 登录与账户
- `29-floating-chat-dock.png` / `30-minimized-dock.png` AI 浮窗与最小化
- `31-input-limit.png` 输入上限

## 浏览器未能执行的项目及原因

1. **artifact-viewer、image-gen-viewer、document-viewer、note-citation-viewer、source-trace-viewer、record-preview、membership-sponsor、flashcard-cite-picker、agent-product-picker、memory-proposal、quiz-explain**：需要真实 Agent 会话产物、课堂录音或本地文档/产物数据。本轮没有可用的会话与仓库数据，未做交互实测；它们与已验证类型共用同一公共壳、同一条 `closeManagedWindow` 分发。
2. **图片 Lightbox**：只有在聊天消息里点图片才会打开，本轮没有带图会话。
3. **画布全屏（CanvasFullscreenPortal）**：只能从 Agent 产物画布进入，同上。
4. **人机验证（HumanChallengeDialog）**：需要后端下发验证挑战，本轮没有可用凭据。
5. **额度面板数值、登录/验证码真实请求**：没有测试账号与验证码通道，只验证了容器、标签、关闭与焦点，没有提交真实认证请求。
6. **真实手机软键盘遮挡**：Playwright 无法弹出移动端软键盘，只验证了 390×844 的布局、可视高度与控件可达性。
7. **刷新页面恢复语义**：本轮未测；`windowPersist` 行为未改动。
8. **Electron/`<webview>` 分支**：`SourcePreviewViewer` 在 Electron 走 `WebviewSite`，本轮只在 Chromium 里跑了 iframe 分支。

## 仍存在的限制

1. **编辑器"源码/渲染/分栏"模式选择是组件局部 state**：Agent↔Studio 或 dock↔sheet 切换（组件被重新挂载）后会回到默认的"渲染编辑"。**正文草稿不会丢**（已在浏览器实测），但模式选择、选区、完整撤销栈不保证保留。
2. **iframe 在不同展示形态之间（dock→sheet→dock）会被重新创建**：本次实测证明"同一 dock 内切标签不重载 iframe"（元素身份与文档状态均保留）；跨展示形态切换时 React 会重建 portal 内容，iframe 内部状态无法导出，未做保留承诺。
3. **窄 dock 的取舍**：右侧面板最小 16%（1440px 下约 230px），低于笔记编辑器声明的 460px 最小宽度。公共壳保证了"控制按钮始终可点、业务动作可横向滚动"，但没有为业务组件做窄栏专用布局；没有采用 `min-width:520px` 撑破页面的做法。
4. **DocumentWorkspace 的"窄栏目录折叠"未实现**：规划 §9.2 建议把左侧目录折叠成按钮/抽屉。实测 230px 下 DocumentWorkspace 仍能完整落在内容区内、页面不横向溢出，因此本轮只做了公共壳修复，没有改业务组件。
5. **移动 sheet 未加 `aria-modal`**：sheet 覆盖整屏但应用没有焦点陷阱，加 `aria-modal="true"` 会与真实行为不符；本轮只补了 `role="dialog"` + `aria-label` + 焦点归还。另外 `KeyboardShortcutProvider` 在移动端直接 return，移动端本来就不响应 Esc。
6. **依赖输入框保护而非通用焦点优先级**：Esc 的抑制条件是"焦点在右栏之外的输入框"，不是规划 §7.4 设想的完整"嵌套确认 → 有焦点表面 → 工作区"优先链。已覆盖真实风险（打字误关文档），其余焦点场景仍走既有 overlay 栈。
7. **`pnpm run lint` 仍 exit 1**：Knip 既有问题（见上表），未做无关删除。
8. **开发态必须用 `localhost` 访问**（Next 16 dev 跨源保护），否则页面不 hydrate；这只影响本地验收脚本，不影响产品。

## 与原规划的重要差异

- 没有让 `windowManager.openWindow` 调用 DOM 测量式 `placeAgentDockWindow`；Agent dock 使用 stable host portal，窗口几何只作为普通模式和模式切换的恢复数据。
- 规划中的统一壳落地为 `AgentDockRuntime + AgentDockHost + WorkspaceSurface` 三个薄层，而不是引入新的大型窗口框架或把所有表面强行改成一种 store。
- 移动端明确使用 sheet；桌面 dock 收起时保留宿主和内容身份，区分收起、最小化和真实关闭。
- 没有实现规划 §13 提到的 `agentDockEnabled` 开发开关：Agent 桌面 dock 就是默认展示策略，回退靠代码层而非运行时开关（未做可运行时切换的降级通道）。
- 没有实现规划 §9.2 的"按可用工作区宽度自动降级（并排 → 覆盖抽屉/单页）"：目前只有"移动断点 → sheet"这一条硬分界，桌面窄栏一律留在 dock 内。
- 增加了一处规划未写明的公共能力：`lib/window/dockTypingFocus.ts`（非模态右栏的 Esc 焦点守卫）与 sheet 关闭后的焦点归还。
- 修复了规划未预见、但真实浏览器暴露的工具栏溢出与窄栏动作重叠问题（见上文"本轮修复的真实问题"1–3）。

---

# 第二轮：按用户评审返工（2026-09-19 晚）

用户看过第一轮成果后指出两个方向性错误，本轮先纠正再重做 Agent 外壳。

## A. 撤回「把弹层搬到右侧」的错误改造

用户原话："不要把任何弹窗都复刻到最右侧，也要根据功能来""既然在页面的左下角放置了一个设置按钮或者用户按钮……它为什么要给我放在右侧？""只写一套代码，设置 import 就可以了"。

因此**撤销**第一轮把独立弹层接入右侧工作区的做法，恢复它们原本的左侧锚定 / 居中模态，Agent 模式与其它模式共用同一套实现：

| 文件 | 处置 |
|---|---|
| `components/layout/GlobalSettings.tsx` | 恢复为左下用户按钮锚定的弹出面板（`git show HEAD` 逐字还原） |
| `components/layout/UserQuotaPanel.tsx` | 同上，恢复左锚定额度面板 |
| `components/layout/AccountDialog.tsx` | 恢复居中对话框 |
| `components/auth/LoginOverlay.tsx`、`LoginForm.tsx` | 恢复居中登录浮层，撤回 `showClose` 参数 |
| `components/chat/AgentSettingsOverlay.tsx` | 恢复页面正中设置层 |
| `components/keyboard/ShortcutHelpOverlay.tsx` | 恢复居中快捷键面板 |
| `components/search/SpotlightDialog.tsx`、`GlobalSearchButton.tsx` | 恢复 Spotlight 模态，撤回 Agent 分支 |
| `components/window/WorkspaceSurface.tsx`(+test) | **删除**（该适配器只服务于已被否定的方向） |
| `lib/window/agentDockRuntime.ts` | 移除 `externals` / `registerExternal` / `unregisterExternal` / `activateExternalSurface` |
| `AgentDockTabs`、`RightPanel`、`AgentDockHost`、`windowManager` | 同步移除 external surface 分支 |

右侧工作区现在只承载「文档 / 产物 / 网页等 ManagedWindow 内容」（即用户说的"新增打开的文档或 Agent 输出的内容"），不再承载业务弹窗。

## B. 按用户给的四张 Agent 截图重做外壳

参考 DSH / Codex / ChatGPT 桌面端的共同结构：左栏不常驻、由顶栏按钮从左侧弹出且顶部与顶栏平齐、三栏各自有头部。

| 需求 | 落地 |
|---|---|
| 1(a) 顶栏不再有“＋” | Agent 顶栏只剩 `StudySolo · Agent` + 右侧 `全屏` `左侧面板` 两个按钮；Agent 模式不再注入 WindowTaskbar |
| 1(b) 全局搜索移到左侧导航 | 顶栏移除 `GlobalSearchButton`，搜索入口放进左侧面板头部 |
| 1(c) 不再显示面包屑 | Agent 模式下不渲染 subject/category/item 面包屑 |
| 2(a) 去掉全屏左侧的收起按钮 | Agent 模式不再渲染 `收起顶部导航栏` |
| 2(b) 最右侧新增面板按钮 | `全屏` 右侧新增面板开关（PanelLeft 图标），成为左栏唯一开关（Agent 下同时移除顶栏左侧 ☰，避免两个入口歧义） |
| 2(c) 面板从左侧弹出、顶部与导航栏平齐 | 新增 `components/layout/AgentLeftPanel.tsx`：`position:fixed; left:0; top:0; height:100dvh`，实测 y=0 = 顶栏 top |
| 3(a) 不含内置工具页 | 左侧面板不渲染 动画讲解/可交互/浏览器 |
| 3(b)(c) 只有一个“＋” | 面板内唯一“＋”= `AddContentButton showUrlField={false}`；"新对话"改用笔形图标，不再是第二个加号 |
| 3(d) 显示正常对话 / 划词助手对话 | 复用 `AgentConversationSidebar`（未复制第二份） |
| 4(a) 右键菜单 | 面板空白处右键 → 新建对话 / 新建文件夹；对话右键 → 归档 / 移动到文件夹 / 删除；文件夹右键 → 重命名 / 删除 |
| 4(b) 渐进式披露 | 正常对话与划词对话默认各显示前 5 条，其余用「···」展开（`SESSION_PREVIEW_LIMIT = 5`） |
| 5 对话归档 | `SessionMeta.archived` + `chatHistory.archiveSession`，归档后从默认列表移出；面板底部（访客右侧）新增归档入口，可查看/返回 |
| 6 设置与额度不再放右侧 | 由 A 段撤回达成，仍在左下用户按钮的二级菜单里 |

配套：新增文件夹能力（`ChatFolder` 写进 manifest 的 `folders`、`SessionMeta.folderId`，旧数据缺省为空）、`归档/文件夹` 全部走 `saveManifest` 持久化；`AddContentButton` 的菜单注册进 Esc 浮层栈（priority 62），保证 Esc 先关菜单而不是误关左侧面板。

## C. 本轮验证

- `pnpm run test:react`：143 文件 / **536** 测试通过（新增：左栏不常驻、面板默认不弹出、渐进披露、右键新建文件夹、归档后移出列表等）
- `pnpm run test:unit`：1311 测试通过（同步更新了 `tests/appModeChrome.test.ts` 里对 `data-agent-slot="conversations"` 的源码断言）
- `pnpm exec tsc --noEmit --incremental false`：exit 0
- `git diff --check`：exit 0
- `pnpm run lint:eslint`：0 error / 92 warning（与基线一致）
- `pnpm run build`：编译成功，1345/1345 静态页面
- 真实浏览器（Playwright，`http://localhost:35349/agent`，1440×900）`flow7.py` 全部 16 项通过，截图 `32-topbar.png`、`33-left-panel.png`、`34-left-panel-plus.png`、`35-panel-context-menu.png`、`36-folder-created.png`；另复跑第一轮 `flow1.py` 的 21 项 dock 断言，无回归。

## D. 本轮仍待确认 / 未做

1. **面板按钮位置的确认**：需求 2(b) 写的是"右侧面板按钮"，但 2(c) 与第 3 节说的是"从左侧弹出的左侧面板"。本轮按后者实现（按钮在顶栏最右、面板在左侧）。若按钮本意是开关**右侧**工作区，只需把 `toggleAgentPanel` 换成右栏 collapse/expand。
2. **文件夹内的对话拖动排序**、文件夹嵌套、归档批量管理未做。
3. 左侧面板目前默认关闭、状态不持久化（每次进入 Agent 都是收起状态）。
4. 归档对话只是从列表移出，仍在本地 manifest 里；没有单独的"归档管理页"。

---

# 附：hydration mismatch 修复（用户实测报错，方案 A）

## 症状与定性

用户报告 `Hydration failed because the server rendered HTML didn't match the client`，差异落在 `ChatInput` 的「联网搜索」开关上。
**与右侧工作区改造无关**：`git diff HEAD -- components/chat/ChatInput.tsx lib/stores/settings.ts components/chat/ChatPanel.tsx` 为空，最后一次改动 `ChatInput` 的提交是 `ae621137`（2026-09-17，早于基线）。

## 根因

- `lib/stores/settings.ts:235` — `load()` 在服务端直接返回 `DEFAULTS`；
- `lib/stores/settings.ts:489-490` — `useSettings = create(...)` 在**浏览器模块初始化时同步读 localStorage**；
- 于是「本机设置 ≠ 默认值」的用户，首帧客户端渲染与服务端 SSR 不一致；
- 触发点是把设置值在首帧直接渲染的组件。

## 实测爆破半径（逐项播种，非默认值）

| 设置 | 修复前 | 修复后 | 引爆点 |
|---|---|---|---|
| `defaultSearch: true` | ❌ | ✅ | `ChatInput` 联网搜索开关 |
| `defaultThinkingEffort: "high"` | ❌ 文本 | ✅ | 「深度思考·High」文案 |
| `selectedModelId: gpt-5.6-sol` | ❌ 文本 | ✅ | `ModelMenu` 模型按钮文案 + `ChatInput` |
| `showRightPanelTabBar: false` | ❌（/ 与 /agent） | ✅ | `RightPanel` 工具栏整行 + `ChatPanel` 头部按钮 |
| 其余 9 项设置 / theme / academicYear / browser | ✅ | ✅ | 当前渲染分支未直接使用 |

## 修复（方案 A：定点 + 通用小工具）

新增 `lib/hooks/useHydratedSetting.ts`：用 `useSyncExternalStore` 的 **server snapshot** 让首帧（含 hydration）返回服务端默认值，水合完成后自动切回本机值。既消除 mismatch，也不需要在水合后于 effect 里 setState（符合仓库既有约定）。

改造点：`ChatInput`（`defaultSearch` / `defaultThinking` / `defaultThinkingEffort` / `selectedModelId` / `customApiGroups`，其中三个开关改为「本机默认 + 用户覆盖」派生，交互语义不变）、`ChatPanel`（`showRightPanelTabBar`）、`ModelMenu`（`selectedModelId` / `customApiGroups`）、`RightPanel`（`showRightPanelTabBar`）。

新增回归测试 `lib/hooks/useHydratedSetting.test.tsx`：同进程内先用默认值 `renderToString`，再把 store 改成"本机值"并 `hydrateRoot`，断言 `onRecoverableError` 未被触发且水合后值生效。**做过反证**：把 server snapshot 换回客户端值后该测试立刻失败。

## 验证

- 浏览器（dev `localhost` 与 production `127.0.0.1` 各跑一遍）：6 个播种场景（含"全部叠加"）hydration 报错全部为 0，且水合后本机值正确生效（联网搜索=on、深度思考·High）。
- 全量逐项扫描：14 个场景全部 0 报错。
- `pnpm run test:react`：144 文件 / 537 测试通过（新增 1 个回归测试）。
- `pnpm run test:unit`：1311 通过。`tsc` exit 0。`git diff --check` exit 0。`pnpm run lint:eslint`：0 error / 92 warning（与基线一致）。
- `pnpm run build`：通过，1337 静态页面。
- 回归：第一轮 dock 流程 21 项、第二轮外壳流程 16 项，均无失败。

## 仍存风险（方案 B 待评估）

任何**新增**的"把持久化设置渲染进首屏"的代码都会重新引入同类问题；目前靠 `useHydratedSetting` 逐个接入。
`ChatInput` 里 `const settingsSnapshot = useSettings()`（整 store 订阅）仍参与 `readPlanModeGate / resolvePlanMode`，只是 `planMode*` 字段当前不在 `Persisted` 里，尚未引爆。彻底做法（方案 B）是让 settings store 首帧恒为 DEFAULTS、水合后统一应用本机快照。

---

# 附二：hydration 根因修复（方案 R2）+ 自动化护栏（R3）

上一节（附一）用 `useHydratedSetting` 逐点隔离了 5 处渲染，本节把根因修掉并补上护栏。

## R2：settings store 改为「默认值起手 + 水合后应用」

`lib/stores/settings.ts`

- store 初值改为 `{ ...DEFAULTS, hydrated: false }`，**模块初始化不再读 localStorage**；
  服务端与客户端首帧因此完全一致。
- 新增导出 `hydrateSettings()`（幂等）：读取本机配置并应用，然后触发桌面端密钥水合。
- 新增 `pickStoredOverrides()`：只挑出「盘上确实与默认值不同」的字段做**加性合并**。
  这样即便水合发生在一次早期写入之后，也不会把刚改的字段冲回旧值；
  正常路径下与「整份覆盖」等价。
- `setter` 包装：任何写入之前若尚未水合，先 `hydrateSettings()`，
  避免这次修改被随后的水合冲掉、或把 DEFAULTS 落到盘上。
- `persist()` 兜底：未水合直接返回，绝不覆盖盘上配置。
- `settingsLoadWarning` 单独随水合一起带上（它不属于持久化字段，否则恢复流程的警告会丢）。

`components/layout/AppShell.tsx`：在既有的根 `useLayoutEffect`（已调 `hydrateLayout/hydrateMode`）里加 `hydrateSettings()`。
AppShell 在 `app/layout.tsx` 里包住所有路由，因此每条路由都会触发。

**收尾**：删除了 `lib/hooks/useHydratedSetting.ts` 及其测试，`ChatInput` / `ChatPanel` / `ModelMenu` / `RightPanel`
的 5 处调用恢复为普通订阅——store 自身已保证首帧等于服务端默认值，不需要第二套机制。

顺带修掉同类问题：`ChatInput` 的 `planMode` 初始化器原先也用 `useSettings.getState()`（新 ESLint 规则抓出来的），
改为「设置派生值 + 用户覆盖」。

## R3：让这类问题以后能被自动发现

| 护栏 | 位置 | 覆盖 |
|---|---|---|
| store 契约测试（始终运行） | `lib/stores/settings.hydration.test.tsx` | ①模块初始化不读本机设置（`vi.resetModules` + 动态 import 断言 `hydrated=false` 且值等于 DEFAULTS）；②`renderToString` + `hydrateRoot` 无 `onRecoverableError`，水合后才切到本机值；③水合前写入不会丢盘上其它配置 |
| ESLint 规则（始终运行） | `eslint.config.mjs` → `no-restricted-syntax` | 禁止 `useState(() => useSettings.getState()…)` / `useAppMode.getState()…`；已用探针文件反证会报错 |
| 真实浏览器检查（需手动跑） | `scripts/check-hydration.py` + `pnpm run check:hydration` | 用「非默认设置」种子打开 `/` 与 `/agent`，断言 0 条 hydration 报错；无 Playwright 时打印 SKIP 并非静默通过 |

契约测试做过反证：把 store 改回「初始化即读 localStorage」，测试立刻失败。

## 验证（本轮实跑）

- `pnpm run test:react`：144 文件 / **539** 通过（新增 3 个 store 契约测试，更新 `settings.persist.test.tsx` 使其显式模拟水合）。
- `pnpm run test:unit`：1311 通过。
- `pnpm exec tsc --noEmit --incremental false`：exit 0；`git diff --check`：exit 0。
- `pnpm run lint:eslint`：**0 error / 92 warning**（与基线一致，本轮新增的告警已全部清掉）。
- `pnpm run build`：通过，1337 静态页面。
- `pnpm run check:hydration`：dev（`localhost`）与 production（`127.0.0.1`）**各 6 个场景全部 hydration=0**，且水合后本机值正确生效（联网搜索开、深度思考·High）。
- 浏览器回归：第一轮 dock 流程 21 项、第二轮外壳流程 16 项，无失败。

## 已知取舍

1. **首帧会短暂显示默认值**：改过设置的用户在「SSR HTML 首次绘制 → 水合完成」之间会看到默认值
   （模型芯片、联网搜索/深度思考开关、右栏工具栏行等约 5 处）。这是本方案与「服务端拿不到 localStorage」的必然代价；
   若要连这点闪动也消掉，需要像 `theme` 那样把关键值放进 `app/layout.tsx` 的预绘制内联脚本或改用 cookie 快照。
2. `lib/stores/browser.ts` 仍是「模块初始化同步读 localStorage」的同类例外，目前靠消费方 `useIsClient()` 兜住，
   未纳入本次改造。
3. 计划模式的 `planMode*/agentPlanMode` 字段目前不在 `Persisted` 里，`readPlanModeGate` 实际恒为默认值；
   已顺带改成水合安全的写法，等设置页补上这些字段后无需再改。

---

# 附三：按用户逐条纠正重做外壳（左右彻底捋清）

用户明确指出上一轮把左右搞反了，并给出 5 条权威口径：

| # | 口径 | 处置 |
|---|---|---|
| 1 | 右侧面板**通到窗口最顶**（比顶栏高、与顶栏最上沿平齐），**从左侧拉出** | 右侧工作区改为顶层布局里与「顶栏 + 主区」并列的一列；实测 `y=0, h=900`（视口 900），左边界 951，顶栏只覆盖 x=0..950 |
| 2 | **顶栏最右按钮控制右侧面板**（此前被我接成了左侧导航） | `data-testid="agent-dock-toggle"`，aria-label「展开/收起右侧工作区」，改的是 `rightCollapsedByProfile` |
| 3 | 左侧导航栏**结构固定**，可自由压缩、可收起 | 删除上一轮的 `AgentLeftPanel` 覆盖式抽屉与 `agentPanelOpen`；左栏恢复为 PanelGroup 常驻列（`agent-conversations`，14%–40% 可拖、可收起），板块仍是 新对话 / 我的资产 / 正常对话 / 划词助手对话 |
| 4 | 动画讲解 / 可交互 / 浏览器**在 Agent 里必须没有** | `RightPanel` 新增 `hideBuiltinTabs`：Agent 右侧工作区不再渲染内置栏目，收藏夹与浏览器设置一并消失 |
| 5 | **Agent 输出的东西进右侧面板** | 右侧工作区只承载 ManagedWindow（文档/产物/网页）；实测新建笔记落在右栏列内 |

## 结构调整

- 新增 `components/layout/AgentDockColumn.tsx`：右侧工作区整列（`data-agent-slot="windows"` + `#right-panel` + `AgentDockHost > RightPanel hideAiTab hideBuiltinTabs showWindowDock`）。
- `AppShell` 新增 Agent 专用桌面外壳（`isAgentRoute`）：`PanelGroup[ 主列(顶栏 + children) | 拖拽条 | 右栏 ]`，`autoSaveId="studysolo-agent-shell-v1"`；右栏扩展控制器（`registerPanelControls`）与 store→面板同步 effect 都搬到这里。
- `AgentWorkspace` 回到「左对话栏 + 中央对话」，不再持有右侧窗坞；恢复「展开对话栏」按钮。
- `AgentConversationSidebar` 的收起按钮恢复控制左栏折叠（`setSidebarCollapsed`），标题回到「对话」。
- CSS：删掉左侧抽屉样式，新增 `.agent-dock-column` 从左侧拉出的进入动画（尊重 reduced motion）。

## 本轮浏览器实测发现并修掉的真实缺陷

新外壳最初漏掉了业务窗口挂载层（`DeferredWindowLayers` 等），右栏会出现**"有标签没正文"**：
新建笔记后只出现 tab、`[data-surface]` 为空。已在 Agent 外壳补回 `DeferredWindowLayers / AgentSettingsOverlay / LoginOverlay / PipPlayer / ToastHost`，
复测 `[data-surface="dock"]` 正常挂载在 `#agent-dock-content` 下。

## 验证

- 新增浏览器脚本 `flow8.py`：10 项断言全通过（通顶几何、顶栏按钮控制右栏、左栏常驻与板块、内置栏目消失、Agent 输出落位），截图 `40-agent-shell.png` / `41-dock-collapsed.png` / `42-agent-output-in-dock.png`。
- 回归：`flow1.py` 的 21 项 dock 断言无失败；`pnpm run test:react` 144 文件 / 538 通过；`pnpm run test:unit` 1311 通过；
  `tsc` 与 `git diff --check` 通过；`pnpm run lint:eslint` 0 error / 92 warning（与基线一致）；`pnpm run build` 通过（1337 页）。
- 同步更新 `tests/appModeChrome.test.ts` 与 `AgentWorkspace.test.tsx` 对新结构的断言。

## 说明

上一轮提交（`2881da61`）里的左侧覆盖面板方案已按本轮口径整体替换；`flow7.py` 是旧外壳的脚本，已不再适用。
