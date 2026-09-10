# 21 · 内容展示体系修复计划（布局档位与能力驱动）

> 背景与根因见 `17-code-quality-audit-2026-09.md` §7。
> 本计划由**一次 AI 会话**独立完成。前置依赖：`18` 已完成。与 `20` 可并行（两者触碰的文件几乎不重叠：本计划碰 `ContentPageClient` / `RightPanel` / `AppShell` 的布局分支与 manifest 类型；`20` 碰浮窗组件）。
>
> 用户原话："新导入的课件文章，它只是一个文档的形式，需要用最简化的相关板块。"

---

## 目标

1. 内容项/板块声明一个**布局档位**（`layoutProfile`），渲染层按档位决定显示哪些区块，不再"一套重布局硬套所有内容"。
2. manifest 里已有的 `capabilities` 从"只决定读不读文件"升级为"同时决定渲染不渲染 UI"。
3. 新导入的纯文档课件默认走最简档位：单栏正文 + 目录 + 可折叠的 AI 面板，无例题/测验 tab，无动画/可交互/浏览器 tab。
4. `lib/content/loader.ts` 里 `contentRoot.detail === "chapters"` 的学科级特判改为 manifest 声明。

## 非目标

- 不改 markdown 渲染管线（`lib/markdown/**`、`prose.css`）。
- 不改内容文件本身、不迁移 `content/chapters/` 目录结构（只让 loader 按声明找路径）。
- 不改 `RightPanel` 内部各 tab 的实现，只改"显示哪些 tab"。
- 不做移动端专项（移动端已有独立分支，本计划的档位逻辑对它同样生效，但不额外优化）。

---

## 并发避让（2026-09 新增，执行前必读）

内容 Agent 在本计划排期期间**正在改动**以下文件，且可能处于未提交状态：

- `lib/content-data/manifest.ts`
- `lib/content-data/subjects.registry.ts`
- `lib/content-data/nav.generated.json`（生成物）
- `lib/constants/academic-year.ts`
- `tests/content/academic-year.test.ts`、`components/layout/{HomeBookshelf,SubjectSidebar}.test.tsx`

这与本计划的阶段 A3（给 `category-templates.ts` / manifest 加 `layoutProfile`）和阶段 C1（改 `subjects.registry.ts` 的 `contentRoot.detail` 枚举）**直接重叠**。

执行规则：

1. 开工第一件事跑 `git status --short`，记录哪些文件是对方的在途脏文件。
2. 编辑上述任何文件**之前**都必须用 Read 工具重新读一遍最新内容，绝不依赖早先的读取结果或计划里的行号。
3. 只做**加字段**的改动，绝不修改任何已有条目的数据值（学科名、items 数组、录音清单、学年常量）。
4. `nav.generated.json` 是生成物，不要手改；若你的改动需要它更新，跑 `pnpm gen-nav`，且**只在它本身不是对方脏文件时**才这么做。
5. 提交时 `git add` 只写你自己改的文件路径；若对方的脏文件与你要改的是同一个文件，把你的改动做完后**只提交该文件**，并在报告里明确说明"该文件在提交时可能同时包含对方的在途改动"，让主智能体判断。
6. 若发现 `subjects.registry.ts` 正被对方大改（diff 很大），阶段 C 可以推迟并在报告里说明，不要强行改。

## 现状（执行前核对）

- `lib/types/content.ts:42`：`Category.capabilities?: readonly CategoryCapability[]`，四种能力 `examples | quiz | search | media`。`lib/content-data/category-templates.ts:13-18` 为六个标准板块声明了子集，其中 `summary: ['search']`、`kaoqian-moni: []`、`shizhan-yanlian: []`。
- 消费方只有三处，全部是"读不读数据"：`lib/content/categoryKeys.ts:20`、`app/[subject]/[category]/[id]/page.tsx:69`、`lib/store.ts:148`。
- `ContentPageClient.tsx:90`：`visibleTabs = renderType === 'markdown' ? CONTENT_TABS : [content]`——按 `renderType` 而非 `capabilities` 决定 tab。一个 `capabilities: ['search']` 的 markdown 纪要会显示"例题""题目测试"两个空 tab。
- `RightPanel.tsx:32` `RIGHT_TABS` 固定四项。
- `AppShell.tsx:187-364`：桌面三栏（`SubjectSidebar` / `#notes-panel` / `RightPanel`）用 `react-resizable-panels`，`:249` 与 `:330` 两处 `#notes-panel`（桌面/移动）。路由 → store 同步在 AppShell（`ContentPageClient.tsx:100` 注释可证），所以 AppShell 能拿到当前 `categoryId`。
- `lib/content/loader.ts:15,43`：`CONTENT_ROOT = content/chapters`；`getSubjectMeta(subjectId)?.contentRoot?.detail === "chapters" && categoryId === "detail"` 走 `ch01/1.1.md` 结构。

---

## 阶段 A · 类型与推导

### A1 `LayoutProfile` 类型

`lib/types/content.ts`：

```ts
/**
 * 布局档位：决定内容页渲染哪些区块。缺省由 capabilities 推导（见 lib/content/layoutProfile.ts）。
 * - full      三栏 + 正文/例题/测验 tab + 右侧全部 tab（详解、教材）
 * - article   单栏正文 + 目录 + 可折叠 AI 面板；无例题/测验；右侧只有 AI（课件、纪要、纯文档）
 * - reference 同 article 但隐藏 AI 面板入口（考前模拟、只读资料）
 */
export type LayoutProfile = 'full' | 'article' | 'reference';
```

`Category` 与 `ContentItem` 各加 `layoutProfile?: LayoutProfile`（item 覆盖 category）。

### A2 推导函数

新建 `lib/content/layoutProfile.ts`：

```ts
export function resolveLayoutProfile(cat: Pick<Category, 'capabilities' | 'layoutProfile'> | undefined, item?: Pick<ContentItem, 'layoutProfile' | 'type' | 'renderType'>): LayoutProfile {
  if (item?.layoutProfile) return item.layoutProfile;
  if (cat?.layoutProfile) return cat.layoutProfile;
  const caps = cat?.capabilities ?? [];
  if (caps.includes('examples') || caps.includes('quiz') || caps.includes('media')) return 'full';
  if (item?.type === 'document') return 'article';
  return caps.length === 0 ? 'reference' : 'article';
}

export interface LayoutFlags {
  showExamplesTab: boolean;   // caps.examples
  showQuizTab: boolean;       // caps.quiz
  showToc: boolean;           // renderType === 'markdown'
  rightTabs: RightTab[];      // full → 全部；article → ['ai']；reference → []（右栏折叠）
  defaultRightCollapsed: boolean; // article/reference 默认折叠右栏
  articleMaxWidth: 'prose' | 'wide'; // article/reference 用更宽的阅读列
}
export function layoutFlags(profile: LayoutProfile, cat: ..., item: ...): LayoutFlags { … }
```

注意 `rightTabs` 里 `'video' | 'interactive'` 只在 `caps.media` 时出现；`'browser'` 只在 `full`。

单元测试 `lib/content/layoutProfile.test.ts`（node:test）：六个标准板块模板 × 推导结果；item 覆盖 category；`document` 类型默认 article。

### A3 manifest 显式标注

`lib/content-data/category-templates.ts` 的 `STANDARD_CATEGORIES`：`summary` 加 `layoutProfile: 'article'`，`kaoqian-moni` / `shizhan-yanlian` 加 `'reference'`。其余不标（走推导，结果为 `full`）。`buildCategory()` 透传该字段。

`lib/content-data/sophomore-categories.ts` 与各学科 manifest 里凡是"新导入课件/文档型"板块（执行时 `rg "type: 'document'" lib/content-data` 找出），在板块级加 `layoutProfile: 'article'`。

现有 `tests/content/categoryCapabilities.test.ts`、`tests/content/manifest.test.ts` 保持通过，并补一例：所有 `capabilities: []` 的板块推导为 `reference`。

Commit：`feat(content): add layoutProfile type, resolver and manifest annotations`

---

## 阶段 B · 渲染层消费

### B1 服务端把档位下发

`app/[subject]/[category]/[id]/page.tsx`：计算 `const profile = resolveLayoutProfile(category, item)` 与 `const flags = layoutFlags(profile, category, item)`，作为 props 传给 `ContentPageClient`。同时把 `profile` 写进 `<ContentPageClient data-layout-profile>` 或经 store 同步（见 B3）。

### B2 `ContentPageClient` 按 flags 渲染

- `:90` `visibleTabs` 改为：`content` 恒有；`examples` 需 `flags.showExamplesTab`；`quiz` 需 `flags.showQuizTab`。`renderType !== 'markdown'` 仍然只留 `content`（两条件取交）。
- 只有一个 tab 时**不渲染 tab 栏**（只保留右侧的收起顶栏按钮与任务栏容器），正文区上移。
- `:204` `<article className="max-w-3xl">`：`flags.articleMaxWidth === 'wide'` 时用 `max-w-4xl`。
- `useToc` 与 `useCitationLocator` 的 enabled 条件加 `flags.showToc`（当前已按 renderType 判断，等价，改为读 flags 以便集中）。
- `SelectionPopover`（划词 AI）在 `reference` 档位不挂载。

### B3 `AppShell` / `RightPanel` 按档位决定右栏

路由 → store 同步处（AppShell 内）已知 `categoryId`/`itemId`。在 `lib/store.ts` 加 `layoutProfile: LayoutProfile` 与 `rightTabs: RightTab[]`，由同步逻辑用 `resolveLayoutProfile` + `layoutFlags` 计算写入（manifest 在客户端可用，`lib/content-data/manifest.ts` 是纯数据）。

- `RightPanel.tsx:32`：`RIGHT_TABS` 变为 `ALL_RIGHT_TABS`，渲染时 `filter(t => rightTabs.includes(t.id))`。当前 `rightTab` 不在允许列表时，`useEffect` 切回 `'ai'`（或列表首项）。
- `AppShell` 桌面分支：`profile !== 'full'` 时右栏 `Panel` 的 `defaultSize` 用折叠尺寸并显示一个"展开 AI 面板"的边缘按钮；`reference` 档位 `rightTabs` 为空时不渲染右栏 `Panel` 与其 `PanelResizeHandle`。**保留 `#notes-panel` id 与 DOM 位置**（`20` 依赖它做 artifact 全屏对齐）。
- 用户手动展开/折叠右栏的状态按 `profile` 分别记忆（`persist` 到 localStorage：`rightCollapsedByProfile: Record<LayoutProfile, boolean>`），避免用户在 article 页面展开了 AI 面板，切到下一篇又被折叠。

### B4 测试

- `components/layout/RightPanel.test.tsx`（若无则新建，vitest）：`rightTabs=['ai']` 时只渲染一个 tab 按钮；当前 tab 不在列表时回退。
- `tests/rightPanelBoundary.test.ts` 保持通过。
- `ContentPageClient` 目前无测试；新建 `app/[subject]/[category]/[id]/ContentPageClient.test.tsx`：`showExamplesTab=false && showQuizTab=false` 时无 tab 栏；`full` 时三个 tab。

Commit：`feat(content): render content page and right panel by layout profile`

---

## 阶段 C · `loader.ts` 特判声明化

### C1 声明

`lib/content-data/subjects.registry.ts` 的学科元信息里 `contentRoot.detail` 目前取值 `"chapters"` 表示走 `content/chapters/chNN/x.y.md`。把它改成更明确的枚举 `contentRoot.detail: 'subject-tree' | 'legacy-chapters'`（默认 `'subject-tree'` = `content/<subject>/<category>/<id>.md`），并在类型上加注释说明两种目录形态。

### C2 loader 改为查表

`lib/content/loader.ts:43` 的 `if (getSubjectMeta(...)?.contentRoot?.detail === "chapters" && categoryId === "detail")` 改为：

```ts
const resolver = CONTENT_PATH_RESOLVERS[getSubjectMeta(subjectId)?.contentRoot?.detail ?? 'subject-tree'];
const filePath = resolver(subjectId, categoryId, itemId, ext);
```

`CONTENT_PATH_RESOLVERS` 是两个纯函数的映射，放在 `lib/content/contentPaths.ts`，各自单测。`CONTENT_ROOT` 常量改名 `LEGACY_CHAPTERS_ROOT`。`readContentMarkdown` / `readContentHtml` / `searchAllContent` 里所有拼路径的地方统一走 resolver。

`tests/api/loader.test.ts` 保持通过；补两例：legacy 学科解析到 `content/chapters/ch01/1.1.md`；普通学科解析到 `content/<subject>/<category>/<id>.md`。

Commit：`refactor(content): replace chapters special-case with declarative path resolvers`

---

## 阶段 D · 新课件接入 SOP

`docs/sop/05-content-integration.md` 追加一节"纯文档课件接入"：manifest 里 `type: 'document'` + 板块 `capabilities: ['search']`（若要 AI 能检索）或 `[]`；不写 `layoutProfile` 即自动得到 `article`/`reference`；需要例题/测验时再加能力，档位自动升为 `full`。附一个最小 manifest 片段示例。

Commit：`docs(sop): document-only courseware integration with layout profiles`

---

## 验证

- `pnpm exec tsc --noEmit && pnpm lint && pnpm test`。
- `pnpm test:content` 结果与执行前一致（仍只有 ch08-4 一例失败）。
- 真机：
  1. 打开任一"详解"小节 → 三栏、三 tab、右侧四 tab（与现在完全一致）。
  2. 打开任一"课堂纪要" → 无例题/测验 tab、右侧只有 AI 且默认折叠、正文列更宽。
  3. 打开"考前模拟" → 无右栏、无划词弹窗。
  4. 在纪要页展开 AI 面板 → 切到另一篇纪要 → 仍展开；切到详解 → 按详解自己的记忆。
  5. `pnpm build` 通过 `prebuild` 且 `next build` 的 SSG 页数不变（对比执行前 `.next/server/app` 下的路由数）。
- `rg '"chapters"' lib/content/loader.ts` 零命中。

## 验收标准

- `LayoutProfile` 类型存在且被 `page.tsx` / `ContentPageClient` / `AppShell` / `RightPanel` 四处消费。
- `capabilities` 的消费方从 3 处（读数据）增加到含 `layoutProfile.ts`（渲染），`ContentPageClient.tsx` 不再直接以 `renderType === 'markdown'` 决定 examples/quiz tab。
- 所有 `capabilities: []` 板块自动为 `reference`，`summary` 为 `article`。
- `loader.ts` 无学科名/`"chapters"` 字符串特判。
- SOP 有纯文档接入章节。

## 风险与回滚

- 阶段 B3 触碰 `AppShell` 的 `react-resizable-panels` 布局，这是全站骨架。改动前先跑一次现有 `tests/windowLayerPlacement.test.ts`，改动后必须通过——它保证浮窗层仍挂在全局层而非被挤进某个 Panel。
- 右栏折叠时 `#notes-panel` 宽度变化会触发 `[data-resizing]` 之外的 reflow；`globals.css:529-547` 的拖拽冻结策略不覆盖"程序性折叠"。若真机看到折叠瞬间闪烁，给 AppShell 的折叠动作包一层 `document.documentElement.dataset.resizing = '1'` → 下一帧删除。
- 不要在本计划里顺手把 `ContentPageClient` 的 `renderType='html'` iframe 合并进 `ManagedWindow`——那是 `20` 完成后的可选项，混做会让两份计划的 commit 互相依赖。

---

## 派发前校准（2026-09-09，主智能体实测）

本计划正文写于计划 `20`、`22` 之前，「现状（执行前核对）」一节的**路径和行号已经漂移**。下面是实测的当前锚点，以本节为准；但**编辑任何文件前仍必须用 Read 重读**（并发避让规则不变）。

**最重要的一条漂移：`lib/store.ts` 已经不是 store 了。**

计划 `22` 把全部 Zustand store 搬到了 `lib/stores/`。现在：

- `lib/store.ts` 只剩 2 行 —— `@public @deprecated` 的 `export * from "@/lib/stores/ui"` 转发壳。
- 真身是 **`lib/stores/ui.ts`（198 行）**，正文提到的 `lib/store.ts:148` 那个 capabilities 消费点现在在 **`lib/stores/ui.ts:148`**。
- 本计划要改这个消费点时，**改 `lib/stores/ui.ts`，不要改转发壳**；否则会出现"改了没反应"，正是计划 `20` 刚收拾掉的那类问题。

**其余锚点的当前位置**

| 正文写的 | 实测当前 |
|----------|----------|
| `lib/store.ts:148`（capabilities 消费） | `lib/stores/ui.ts:148` |
| `RightPanel.tsx:32` 的 `RIGHT_TABS` | `components/layout/RightPanel.tsx:33`（全文 218 行） |
| `AppShell.tsx:187-364` 三栏布局 | `AppShell.tsx` 全文只有 **342 行**，该区间已越界；`#notes-panel` 两处在 **`:251`（桌面）** 与 **`:333`（移动）** |
| `ContentPageClient.tsx:90` 的 `visibleTabs` | 未漂移，仍在 `:90` |
| `lib/content/layoutProfile.ts` | **尚不存在**，由本计划新建 |

- `AppShell.tsx` 里的 `#notes-panel` 现在通过 `lib/constants/layout.ts` 的 **`NOTES_PANEL_ID`** 常量引用（`AppShell.tsx:20` 导入）。这是计划 `20` 的既成不变量：**不要写回 `id="notes-panel"` 字面量**。
- `lib/content-data/category-templates.ts` 的六个模板声明（`summary: ['search']`、`kaoqian-moni: []`、`shizhan-yanlian: []`）**与正文一致，未被改动**，阶段 A3 的前提成立。
- `lib/types/content.ts` 现 52 行；`lib/content/categoryKeys.ts` 现 57 行；`lib/content/loader.ts` 现 446 行。

**必须遵守的既成不变量（`00-execution-contract.md` 第六节）**

本计划要改 `AppShell` / `RightPanel` / `ContentPageClient`，与前序计划的成果同处一片区域：

1. **滚动契约（计划 `19`）**：`ChatThread.tsx` / `useStickToBottom.ts` 不在本计划范围内，**不要碰**。若阶段 B 的折叠动画影响到聊天区高度，也不要去改滚动逻辑，改自己这侧并在报告里说明。
2. **窗口层契约（计划 `20`）**：浮窗必须留在 `AppShell` 的全局窗口层、`createPortal` 到 `document.body`。阶段 B3 动 `react-resizable-panels` 时，`tests/windowLayerPlacement.test.ts` 是唯一防线，改动前后各跑一次。右栏折叠不得把浮窗层挤进某个 Panel（那会让 `ManagedWindow` 的 `position: fixed` 落进新的包含块，全部浮窗定位错乱）。
3. 新增浮层一律复用 `components/window/ManagedWindow.tsx`，不要手写 portal。

**并发状态（派发时实测）**

- 内容 Agent 最近一次代码提交是 `cdec28da`（按课程名长度排序大二学科），此后整个计划 `20`、`22` 期间未再提交代码。
- 但它当前有两个在途脏文件：`docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md`。后者是文档解析指南，**说明下一批课件导入在路上**，落地时会再动 `manifest.ts` / `nav.generated.json` / `subjects.registry.ts`。
- 所以并发避让那一节的六条规则**照旧全部有效**，尤其第 6 条：若发现 `subjects.registry.ts` 正被大改，阶段 C 可以推迟并在报告里说明。

---

## 二次复核（2026-09-10，计划 23 / 24 落地后，主智能体实测）

计划 `23`、`24` 是在上一节校准之后合入的，文件普遍变长（`RightPanel` 218→**239**、`AppShell` 342→**367**、`lib/stores/ui.ts` 198→**225**、`lib/types/content.ts` 52→**61**、`lib/content/loader.ts` 446→**495**、`ContentPageClient.tsx` **315**、`page.tsx` **84**）。

但**上一节列的具体锚点行号全部仍然准确**，无需再改：

| 锚点 | 复核结果 |
|---|---|
| `ContentPageClient.tsx:90` `visibleTabs` | 未漂 ✓ |
| `RightPanel.tsx:33` `RIGHT_TABS` | 未漂 ✓ |
| `AppShell.tsx:251` / `:333` 的 `NOTES_PANEL_ID` | 未漂 ✓ |
| `loader.ts:15` `CONTENT_ROOT`、`:43` chapters 特判 | 未漂 ✓ |
| `category-templates.ts:13-18` 六模板 | 未漂 ✓（`summary: ['search']`、两个 `[]` 均在） |

**已排除的一个红线冲突**：阶段 A2 的 `LayoutFlags.rightTabs: RightTab[]` 需要 `RightTab` 类型，曾担心它定义在 `components/` 从而让新建的 `lib/content/layoutProfile.ts` 违反计划 `23` 的「`lib` 不得 import `components`」。实测 `RightTab` 定义在 **`lib/stores/ui.ts`**，属 lib→lib，**不违规**。

注意 `components/layout/RightPanel.tsx:9` 目前是从 `@/lib/store`（`@deprecated` 转发壳）导入 `RightTab` 的。本计划若要动这行，**改成从 `@/lib/stores/ui` 导入**；同理所有新写的代码都不要再引转发壳。

**新增的既成不变量（计划 `24`，见 `00-execution-contract.md` 第六节）**：本计划不碰 `lib/markdown/**`，但若因任何原因需要动指令解析，`normalizeDirectiveLabels` 的属性边界只能按 `KNOWN_ATTRS` 白名单判定，不得退回形状匹配。

**并发状态（本次派发时实测）**：内容 Agent 最近一次代码提交仍是 `cdec28da`，在途脏文件仍是 `docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md` 两份（与上一节一致，未扩散到 manifest）。`lib/content-data/**` 当前干净，阶段 A3 / C1 可以正常进行。
