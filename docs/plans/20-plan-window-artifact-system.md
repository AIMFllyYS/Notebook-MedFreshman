# 20 · 窗口 / Artifact 体系收敛计划

> 背景与根因见 `17-code-quality-audit-2026-09.md` §5。
> 本计划由**一次 AI 会话**独立完成。前置依赖：`18` 已完成（死代码 `HtmlCanvasLayer` / 顶层 `MoleculeRenderer` 已删，knip 与 import 边界规则已生效）。与 `21` 可并行；`22` 依赖本计划。
>
> 这份计划直接回应用户反馈："改右侧 Agent 面板的可视化 HTML 组件改半天没反应"、"改完后笔记区中间冒出组件"。完成后，任何人/模型搜索"artifact"应只命中一条清晰的链路。

---

## 目标

1. 八个浮窗组件共用一个 `ManagedWindow` 壳，拖拽/缩放/全屏/最小化/外链/缩放柄/portal 逻辑只存在一份。
2. `ArtifactViewer` 的"全屏对齐笔记区"从隐式硬编码变成显式、可配置的语义。
3. "撰写可视化 HTML" 这条链路的三个名字（`renderInteractive` / artifact / 可视化 HTML）收敛为一个对外术语，并在代码里留下路径地图。
4. `components/interactives/`（手写 React 交互组件）与 AI artifact 在命名和文档上明确区分。

## 非目标

- 不改 `useWindowManager` 的状态模型（z 序、几何、最小化语义都保留）。
- 不改 artifact 的生成链（`lib/ai/artifact.ts`、`app/api/artifact/route.ts`、`ArtifactCard` 的 SSE 消费）。
- 不改 `ContentPageClient` 的 `renderType='html'` 内容页 iframe——那是 `21` 的范围；本计划只在文档里标注它与 `ArtifactViewer` 的关系。
- 不改 `components/canvas/**` 的消息内联画布。

---

## 现状地图（执行前先核对）

浮窗组件（均 `createPortal(…, document.body)`，均由 `AppShell.tsx:282-287`（桌面）与 `:357-362`（移动）挂载）：

- `components/chat/ArtifactViewer.tsx` —— type `artifact-viewer`，数据 `useArtifacts`
- `components/chat/ImageGenViewer.tsx` —— `image-gen-viewer`，`useImageGen`
- `components/chat/DocumentViewer.tsx` —— `document-viewer`，`useDocuments`
- `components/chat/NoteCitationViewer.tsx` —— `note-citation-viewer`，`useNoteCitations`
- `components/chat/SourceTraceViewer.tsx` —— `source-trace-viewer`
- `components/chat/SourcePreviewViewer.tsx` —— `source-preview`
- `components/chat/FloatingChatWindow.tsx` —— `floating-chat`，`useFloatingChats`
- `components/review/RecordPreviewWindow.tsx` —— `record-preview`，`useRecordPreviews`
- `components/chat/BillingDashboard.tsx` —— `billing-dashboard`（复制程度较低，3 处命中，最后处理）

共享原语（已存在，保留）：`lib/hooks/useWindowManager.ts`、`lib/hooks/useDraggable.ts`、`lib/hooks/useResizable.ts`、`lib/hooks/useFullscreenTrack.ts`、`lib/keyboard/useOverlayRegistration.ts`、`components/window/WindowChrome.tsx`、`components/window/WindowTaskbar.tsx`。

每个 viewer 里逐字重复的部分（以 `ArtifactViewer.tsx` 为例）：`:29-44` drag/resize 接线、`:46-53` fullscreen track + overlay 注册、`:58-62` `openExternal` Blob URL、`:64-80` `toggleFullscreen` + `preExpandRef`、`:94-114` 外层 fixed 容器 style、`:138-163` 右下角缩放柄 SVG。

---

## 阶段 A · 抽取 `ManagedWindow` 壳

### A1 新建 `components/window/ManagedWindow.tsx`

Props 设计（以覆盖八个 viewer 的全部差异为准）：

```ts
interface ManagedWindowProps {
  /** useWindowManager 中的窗口 id，如 `artifact-viewer:${artifactId}` */
  windowId: string;
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  /** 全屏时贴合的目标：'viewport' 铺满视口；'notes' 对齐 #notes-panel；也可传返回 DOMRect 的函数 */
  fullscreenTarget?: 'viewport' | 'notes' | (() => DOMRect | null);
  /** 最小尺寸，默认 { minW: 420, minH: 320 } */
  minSize?: { minW: number; minH: number };
  /** 是否显示"新页面打开"按钮及其行为 */
  externalLink?: { onOpen: () => void } | false;
  /** WindowChrome 右侧自定义按钮区 */
  actions?: React.ReactNode;
  /** 传给 WindowChrome 的 bodyClassName */
  bodyClassName?: string;
  /** overlay 注册优先级（Esc 关闭顺序），默认 30 */
  overlayPriority?: number;
  /** 最小化时是否卸载 children（iframe 类窗口应为 true 以释放资源，默认 false） */
  unmountWhenMinimized?: boolean;
  children: React.ReactNode;
}
```

内部实现就是把 `ArtifactViewer.tsx:24-165` 的通用部分搬过来：读 `managed = useWindowManager(s => s.windows.find(w => w.id === windowId))`，`managed` 不存在返回 `null`；`useDraggable` / `useResizable` / `useFullscreenTrack` / `useOverlayRegistration` 接线；`toggleFullscreen` 按 `fullscreenTarget` 决定几何；外层 fixed 容器 + `WindowChrome` + 缩放柄。

`fullscreenTarget` 解析：

```ts
function resolveFullscreenRect(target: ManagedWindowProps['fullscreenTarget']): DOMRect | null {
  if (typeof target === 'function') return target();
  if (target === 'notes') {
    const r = document.getElementById('notes-panel')?.getBoundingClientRect();
    return r && r.width > 0 && r.height > 0 ? r : null;
  }
  return null; // 'viewport' 或 undefined：由 setFullscreen 铺满视口（沿用现有行为）
}
```

**把 `openExternal` 的 Blob URL 逻辑抽到 `lib/utils/openHtmlInNewTab.ts`**（`ArtifactViewer` / `ImageGenViewer` / `renderers/HtmlRenderer` 都在用同一段代码）。

### A2 单元测试

`components/window/ManagedWindow.test.tsx`：
- 窗口不在 manager 中时渲染 `null`。
- `fullscreenTarget='notes'` 且 `#notes-panel` 存在时，点全屏后 `commitGeometry` 收到该 rect。
- `fullscreenTarget='viewport'` 时不调用 `commitGeometry`，只调用 `setFullscreen(true)`。
- 退出全屏恢复 `preExpand` 几何。
- `unmountWhenMinimized` 为 true 时最小化后 children 不在 DOM。

现有 `tests/windowLayerPlacement.test.ts`、`tests/windowManager.test.ts`、`components/window/WindowChrome.test.tsx` 必须保持通过。

Commit：`feat(window): extract ManagedWindow shell from duplicated viewer chrome`

---

## 阶段 B · 逐个迁移（每个 viewer 一个 commit）

迁移顺序按复制程度由高到低、风险由低到高：

1. `SourcePreviewViewer` —— 最简单，纯 iframe/url。
2. `SourceTraceViewer`
3. `NoteCitationViewer`
4. `ImageGenViewer`
5. `DocumentViewer`
6. `ArtifactViewer` —— **传 `fullscreenTarget='notes'`**，保持现有"全屏 = 覆盖笔记区"行为；同时在文件顶部加路径地图注释（见阶段 D）。
7. `RecordPreviewWindow`
8. `FloatingChatWindow` —— 内含 `FloatingChatBody`，最复杂，最后做。
9. `BillingDashboard` —— 视复制程度决定是否迁移，可跳过。

每个迁移后的 viewer 应只剩：读自身 store 拿数据 → 决定 `windowId` / `title` / `actions` → `<ManagedWindow …>{内容}</ManagedWindow>`。目标行数：`ArtifactViewer` 从 167 行降到 ≤ 60 行。

每迁一个：`pnpm test:react` + 真机打开该窗口验证拖拽、缩放、全屏、最小化到任务栏再恢复、Esc 关闭、外链。

Commit 模式：`refactor(window): migrate <Name> to ManagedWindow`

### B-后 · 删除孤儿

迁移完成后 `rg "preExpandRef|nwse-resize" components` 应只命中 `ManagedWindow.tsx`。`knip` 会指出不再被引用的辅助函数，删除。

---

## 阶段 C · Artifact 全屏语义显式化

### C1 设置项

现在"全屏 = 覆盖笔记区"是硬编码。加一个用户可选项：`lib/hooks/useSettings.ts` 增加 `artifactFullscreenTarget: 'notes' | 'viewport'`，默认 `'notes'`（保持现状）。`ArtifactViewer` 读它传给 `ManagedWindow`。`ChatSettings.tsx` 的工具设置区加一个开关（文案："演示全屏时覆盖：笔记区 / 整个窗口"）。

> 这一步的价值不只是功能：它把"为什么 artifact 会出现在页面中间"变成设置面板上一行可见的文字，之后没有人会再误以为它是笔记区的组件。

### C2 `#notes-panel` 契约

`rg 'id="notes-panel"'` 找到定义处（应在 `AppShell.tsx` 或 `ContentPageClient.tsx`），在该行加注释：`/* 被 ManagedWindow fullscreenTarget='notes' 用作全屏对齐目标，勿改 id */`。在 `lib/constants/` 下导出 `NOTES_PANEL_ID = 'notes-panel'`，定义处与 `ManagedWindow` 都改用常量。

Commit：`feat(artifact): make fullscreen target an explicit setting`

---

## 阶段 D · 命名与路径地图

### D1 对外术语统一为"演示（Artifact）"

`lib/chat/toolPresentation.ts` 里 `renderInteractive` 的 `label` 与 `settingsDescription` 目前是"撰写可视化 HTML"一类文案。统一为：label `HTML 演示`，描述 `生成可交互的 HTML 演示页（Artifact），在独立浮窗中打开`。`ArtifactCard` 的按钮文案已是"打开演示"，保持一致。

### D2 工具 id 是否改名——**不改**，理由必须写进代码

`renderInteractive` 作为 part type `tool-renderInteractive` 已经持久化在用户的 IndexedDB 聊天历史里（`lib/storage/chatStorage.ts`、`tests/fixtures/chat-history-v1.json` 可证）。改 id 需要存储迁移，收益不匹配风险。在 `lib/ai/agent/tools.ts` 的 `renderInteractive` 定义上方加注释：

```ts
/**
 * renderInteractive —— 生成 HTML 演示（Artifact）。
 * 工具 id 因已持久化在聊天历史（tool-renderInteractive part）中而保留历史名称；
 * 对外文案、组件、store 统一用 "artifact / 演示"。
 * 链路：本工具 → lib/ai/artifact.ts（生成）→ app/api/artifact/route.ts（SSE）
 *      → components/chat/ArtifactCard.tsx（消息内卡片）→ lib/hooks/useArtifacts.ts（store）
 *      → components/chat/ArtifactViewer.tsx（全局浮窗，AppShell 挂载，不属于右侧面板或笔记区）。
 * 与 components/interactives/（手写 React 交互组件、右侧"可交互"tab）无关。
 * 与 components/canvas/renderers/HtmlRenderer.tsx（drawDiagram html 模式、消息内联 iframe）无关。
 */
```

同样的路径地图注释放到 `ArtifactViewer.tsx`、`ArtifactCard.tsx`、`useArtifacts.ts` 文件头（可精简为指向 `tools.ts` 的一句话 + 本文件在链路中的位置）。

### D3 `components/interactives/` 去歧义

`components/interactives/README.md`（新建，10 行以内）：说明这里是**手写**的 React 交互组件注册表（`registry.ts`），对应 manifest `renderType='component'` 与右侧"可交互"tab；与 AI 生成的 artifact 无关，后者见 `lib/ai/agent/tools.ts` 的路径地图。

`lib/ai/prompts/global.md` 里 3 处 `renderInteractive` 的措辞若含"交互组件"字样，改为"HTML 演示"，避免模型把它与 interactives 混淆。

### D4 `docs/refer/rendering-architecture.md` 更新

在该文档追加一节"AI 产物的四条渲染路径"：artifact 浮窗 / canvas 内联 iframe / 内容页 html iframe / interactives 注册表，各一句话 + 入口文件。这是给后续模型看的，是本计划最重要的交付物之一。

Commit：`docs(artifact): unify terminology, add path maps, disambiguate interactives`

---

## 验证

- `pnpm exec tsc --noEmit && pnpm lint && pnpm test`。
- `rg "useDraggable\(" components` 只命中 `ManagedWindow.tsx`（`SelectionPopover` 等非窗口组件若也用了 `useDraggable`，属正常，记录即可）。
- `rg "getElementById\(\"notes-panel\"\)|getElementById\('notes-panel'\)" components lib` 零命中（应全部走 `NOTES_PANEL_ID`）。
- 真机：打开 artifact → 全屏 → 覆盖笔记区；切设置为"整个窗口"→ 全屏铺满视口；最小化到任务栏 → 恢复；同时开 artifact + 文档 + 图片三个窗口，z 序与任务栏徽标正常。
- 真机：划词浮窗聊天（`FloatingChatWindow`）拖拽/缩放/最小化正常，且流式输出不抖（`19` 的成果不被回退）。

## 验收标准

- 九个浮窗组件（或八个，若 BillingDashboard 跳过）全部经由 `ManagedWindow`。
- `ArtifactViewer.tsx` ≤ 60 行。
- 设置面板可见 `artifactFullscreenTarget` 开关。
- `tools.ts` / `ArtifactViewer.tsx` / `ArtifactCard.tsx` / `useArtifacts.ts` 文件头有路径地图；`components/interactives/README.md` 存在；`docs/refer/rendering-architecture.md` 有"四条渲染路径"一节。
- `toolPresentation.ts` 中不再出现"可视化 HTML"字样。

## 风险与回滚

- 阶段 B 每个 viewer 一个 commit，任一回归可单独 revert。
- `FloatingChatWindow` 内部可能有针对流式输出的特殊尺寸逻辑（如随内容自动增高），迁移前先读完整文件；若与 `ManagedWindow` 的固定几何模型冲突，允许它保留自定义外壳但复用 `ManagedWindow` 导出的 `useManagedWindowChrome()` hook（把 A1 的接线部分再拆一层 hook），不要硬塞。
- 不要在本计划里改 `useWindowManager` 的 `ManagedWindowType` 联合类型或 z 序算法；`22` 若要把 window store 搬到 `lib/stores/`，届时一起处理。
