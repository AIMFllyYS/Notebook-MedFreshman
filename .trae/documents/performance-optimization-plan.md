# 概率论学习应用 — 性能优化实施计划

## 摘要

基于前两轮深度分析，项目拖动面板卡顿的根因是：**运行时加载控制几乎空白** — 不可见组件仍消耗 React reconciliation 和浏览器 layout 资源。本计划按影响从大到小分 5 个阶段，逐一解决关键问题。

---

## 现状分析

### 已有优化（保留不动）
- 30+ 交互组件通过 `next/dynamic` + `ssr: false` 动态导入（registry.ts）
- `NoteRenderer` 和 `Message` 使用了 `memo`
- 部分交互组件使用了 `useCallback`/`useMemo`
- `AppShell` 面包屑用了 `useMemo`

### 关键缺失（本计划解决）
1. 右侧三个 Tab 全部同时挂载（hidden 而非条件渲染）
2. 36 个交互组件 0 个使用 `memo`
3. 无任何 `Suspense` boundary
4. 无 `useTransition`/`useDeferredValue`
5. 交互组件无视口懒加载
6. ChatPanel/VideoTab/InteractiveTab/PipPlayer 未动态导入
7. `autoSaveId` 每帧写 localStorage 无节流
8. SVG 重型组件无 `content-visibility`

---

## 阶段一：右侧面板条件渲染 + Tab 组件动态导入（影响最大）

### 1.1 RightPanel.tsx — 条件渲染替代 hidden

**文件**: `components/layout/RightPanel.tsx`

**现状** (L66-76):
```tsx
<div className={clsx("h-full", tab === "ai" ? "block" : "hidden")}>
  <ChatPanel />
</div>
<div className={clsx("h-full", tab === "video" ? "block" : "hidden")}>
  <VideoTab />
</div>
<div className={clsx("h-full", tab === "interactive" ? "block" : "hidden")}>
  <InteractiveTab />
</div>
```

**改为**:
```tsx
<div className="h-full">
  {tab === "ai" && <ChatPanel />}
  {tab === "video" && <VideoTab />}
  {tab === "interactive" && <InteractiveTab />}
</div>
```

**原因**: 条件渲染时，不可见 Tab 的组件完全从 React 树中卸载，resize 时不需要 reconciliation diff。注释中"保留各自状态"的需求可以通过 Zustand store 或 sessionStorage 解决（ChatPanel 的 messages 已在 store 外管理，但切换 Tab 丢失聊天记录是可接受的 UX — 用户不会频繁切换 Tab）。

**决策**: 如果需要保留聊天记录，ChatPanel 保持 hidden，仅 VideoTab 和 InteractiveTab 改为条件渲染。但考虑到这是性能优化的核心改动，建议三个 Tab 都改为条件渲染，聊天记录通过 Zustand store 持久化。

### 1.2 右侧面板组件动态导入

**文件**: `components/layout/RightPanel.tsx`

将 ChatPanel、VideoTab、InteractiveTab 改为 `next/dynamic` 导入：

```tsx
import dynamic from "next/dynamic";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });
```

**原因**: 这三个组件分别引入了重型依赖（NoteRenderer 的 remark/rehype 管线、视频列表、30+ 交互组件注册表），动态导入可将它们从首屏 bundle 中移除。

### 1.3 PipPlayer 动态导入

**文件**: `components/layout/AppShell.tsx`

```tsx
// 改前
import PipPlayer from "@/components/video/PipPlayer";

// 改后
import dynamic from "next/dynamic";
const PipPlayer = dynamic(() => import("@/components/video/PipPlayer"), { ssr: false });
```

**原因**: PipPlayer 是唯一使用 `framer-motion` 的组件（~30KB gzip），动态导入后首屏不加载。

---

## 阶段二：交互组件 memo 包裹（影响大，改动安全）

### 2.1 所有 36 个交互组件添加 memo

**文件**: `components/interactives/ch01-ch08/` 下所有 tsx

**模式**: 将每个组件的导出从：
```tsx
export default function BayesExplorer() { ... }
```
改为：
```tsx
function BayesExplorerBase() { ... }
export default memo(BayesExplorer);
```

**完整清单**（36 个组件）:

| 章节 | 组件 |
|------|------|
| ch01 | BayesExplorer, ClassicalProbLab, FrequencyConvergence, ReliabilityExplorer, SampleSpaceBuilder, VennPlayground |
| ch02 | BinomialExplorer, CDFVisualizer, FuncDistDemo, PDFExplorer, RVMapper |
| ch03 | ConditionalExplorer, ConvolutionDemo, IndependenceChecker, JointDistExplorer, MarginalExplorer |
| ch04 | CorrelationExplorer, CovMatrixDemo, ExpectationExplorer, VarianceExplorer |
| ch05 | ChebyshevDemo, CLTSimulator, LLNSimulator |
| ch06 | NormalSamplingDemo, QuantileExplorer, SamplingDistExplorer, StatisticCalculator |
| ch07 | ConfidenceIntervalExplorer, EstimatorComparator, MLEExplorer, MomentEstimator |
| ch08 | ErrorTypeDemo, HypTestDemo, MeanTestExplorer, VarianceTestExplorer |

**原因**: 这些组件通过 `registry.ts` 的 `dynamic()` 导入，`memo` 包裹后，当父组件（InteractiveTab 或 MediaEmbed）因面板 resize 重渲染时，交互组件的 props 不变则跳过渲染。由于这些组件都不接收 props（`Component: ComponentType<Record<string, never>>`），memo 几乎总是生效。

### 2.2 InteractiveTab 添加 memo

**文件**: `components/interactives/InteractiveTab.tsx`

InteractiveTab 接收 `chapterId` 和 `sectionId`（从 store 读取），memo 包裹后仅在这两个值变化时重渲染。

---

## 阶段三：面板 resize 使用 useTransition（影响大，改动小）

### 3.1 AppShell 中 Panel 尺寸变化使用 transition

**文件**: `components/layout/AppShell.tsx`

在 `onCollapse`/`onExpand` 回调中使用 `startTransition`：

```tsx
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

// 在 AppShell 组件内
const [, startTransition] = useTransition();

// Panel 回调
onCollapse={() => startTransition(() => setSidebarCollapsed(true))}
onExpand={() => startTransition(() => setSidebarCollapsed(false))}
```

**原因**: `onCollapse`/`onExpand` 触发的 store 更新会导致订阅组件重渲染，使用 `startTransition` 将其标记为非紧急更新，不阻塞 resize handle 的拖动响应。

### 3.2 NotesPane 和 RightPanel 的 store 订阅使用 useDeferredValue

**文件**: `components/notes/NotesPane.tsx`

```tsx
const chapterIdRaw = useStore((s) => s.activeChapterId);
const sectionIdRaw = useStore((s) => s.activeSectionId);
const chapterId = useDeferredValue(chapterIdRaw);
const sectionId = useDeferredValue(sectionIdRaw);
```

**原因**: 面板 resize 期间，如果用户同时切换小节，内容加载可以延迟到 resize 结束后。

---

## 阶段四：交互组件视口懒加载（影响中等）

### 4.1 创建 LazyVisible 通用组件

**新建文件**: `components/ui/LazyVisible.tsx`

```tsx
"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  rootMargin?: string;
  placeholder?: ReactNode;
}

export default function LazyVisible({ children, rootMargin = "200px", placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? children : (placeholder ?? <div className="h-40" />)}
    </div>
  );
}
```

### 4.2 InteractiveTab 中使用 LazyVisible

**文件**: `components/interactives/InteractiveTab.tsx`

```tsx
import LazyVisible from "@/components/ui/LazyVisible";

// 在 items.map 中
{items.map((item) => {
  const C = item.Component;
  return (
    <LazyVisible key={item.id} placeholder={<div className="h-48 rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] animate-pulse" />}>
      <div>
        <h3 ...>{item.title}</h3>
        <C />
      </div>
    </LazyVisible>
  );
})}
```

### 4.3 笔记内嵌交互组件使用 LazyVisible

**文件**: `components/notes/directives.tsx`

```tsx
function InteractiveEmbed({ id }: { id: string }) {
  const item = getInteractive(id);
  if (!item) { ... }
  const C = item.Component;
  return (
    <LazyVisible placeholder={<div className="my-5 h-48 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-muted)]" />}>
      <div className="my-5">
        ...
        <C />
      </div>
    </LazyVisible>
  );
}
```

---

## 阶段五：NoteRenderer 优化 + Suspense + 配置优化（影响中等）

### 5.1 NoteRenderer 插件数组稳定化

**文件**: `components/notes/NoteRenderer.tsx`

现状中 `remarkPlugins` 和 `rehypePlugins` 已在模块顶层定义（稳定引用），`components` 对象也在模块顶层。`memo` 已包裹。这部分已经做得不错。

**额外优化**: 为 `ReactMarkdown` 添加 `key` 基于 `content` 的 hash，避免内容不变时重渲染：

```tsx
function NoteRendererBase({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
```

由于 `memo` 已对 `content` prop 做浅比较，且 `content` 是字符串，这已经足够。无需额外改动。

### 5.2 添加 Suspense Boundary

**文件**: `app/layout.tsx`

```tsx
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-[var(--ink-faint)]">加载中…</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
```

### 5.3 Next.js 配置优化

**文件**: `next.config.mjs`

```mjs
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingIncludes: {
    "/api/**": ["./content/**/*"],
  },
  // 新增：webpack 分包优化
  experimental: {
    optimizePackageImports: ["d3", "framer-motion", "katex"],
  },
};
```

**注意**: `d3` 在 package.json 中声明了依赖但实际未在任何组件中 import，后续可考虑移除。

### 5.4 ChatPanel 消息列表虚拟化（可选，影响较小）

ChatPanel 的消息列表目前直接 map 渲染。如果消息量很大（>50 条），可引入虚拟滚动。但当前场景下消息量通常不大，暂不实施。

---

## 假设与决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 右侧 Tab 条件渲染 vs hidden | 条件渲染 | 性能收益远大于状态保持的便利性；聊天记录可通过 store 持久化 |
| ChatPanel 聊天记录保持 | 通过 Zustand store 持久化 messages | 切换 Tab 后聊天记录不丢失 |
| memo 包裹方式 | `function XBase() {} + export default memo(X)` | 与现有 NoteRenderer/Message 模式一致 |
| LazyVisible rootMargin | 200px | 提前 200px 开始加载，用户滚动时无感知 |
| useTransition 应用范围 | 仅 onCollapse/onExpand | resize 过程中 Panel 尺寸变化由 react-resizable-panels 内部管理，不需要 transition |
| d3 依赖 | 暂保留，标记为可移除 | 未使用但不影响运行，后续清理 |

---

## 验证步骤

### 阶段一验证
1. 启动 `pnpm dev`，打开应用
2. 切换右侧 Tab（AI/视频/交互），确认内容正常显示
3. 拖动面板 resize handle，观察卡顿是否明显改善
4. 打开 Chrome DevTools > Network，确认 ChatPanel/VideoTab/InteractiveTab 的 JS chunk 在 Tab 切换时才加载

### 阶段二验证
1. 在 Chrome DevTools > Performance 中录制拖动面板操作
2. 对比优化前后的 React commit 次数和渲染时间
3. 确认交互组件在 resize 时不触发重渲染（React DevTools Profiler）

### 阶段三验证
1. 拖动面板至 sidebar 折叠/展开边界
2. 确认折叠/展开动画不阻塞拖动

### 阶段四验证
1. 切换到"可交互"Tab，观察组件是否在滚动到视口时才加载
2. 在 Network 面板确认交互组件的 chunk 延迟加载

### 阶段五验证
1. 确认首屏加载时间缩短（Lighthouse 或 WebPageTest）
2. 确认 Suspense fallback 正常显示

---

## 实施顺序

1. **阶段一** → 立即可感知的拖动卡顿改善
2. **阶段二** → 减少不必要的 React 重渲染
3. **阶段三** → 面板交互流畅度提升
4. **阶段四** → 交互组件按需加载
5. **阶段五** → 首屏性能和全局优化

每个阶段完成后验证，再进入下一阶段。
