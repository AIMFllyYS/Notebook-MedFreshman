# 交接文档：Artifact HTML 流式输出问题排查

## 项目背景

这是一个基于 Next.js 15 App Router 的教育辅助聊天应用。AI 助手可以生成交互式 HTML 演示（artifact），通过 SSE 流式推送到前端。

技术栈：Next.js 15 + React 18 + Zustand 5 + TypeScript + IndexedDB（idb-keyval）

## 问题描述

1. **HTML artifact 没有流式输出**：生成 HTML 演示时，代码不是逐行出现在卡片中，而是等很久后一次性出现（或完全不出现）
2. **"生成依据"（prompt）没有渲染 Markdown 富文本**：ArtifactCard 中的 prompt 目前是纯文本 `<span>{prompt}</span>`，用户希望渲染为 Markdown（含公式）
3. 本地开发环境也有此问题，排除 EdgeOne CDN/Nginx 缓冲

## 已完成的修复（请勿重复修改）

### 水合竞态修复（已完成 + 已验证 tsc/eslint 通过）

- `lib/hooks/useArtifacts.ts`：删除 `_streamingArtifacts` hack，恢复 `append` 为原子 `set((s)=>...)`，添加自定义 `merge` 深合并（current state 优先），用 debounce 800ms 包装 IndexedDB 写入
- `lib/hooks/useChat.ts:61`：添加 `useArtifacts.persist.hasHydrated()` 水合门控
- `components/chat/ChatPanel.tsx:47-48`：添加 `useHydrated(useArtifacts)` 双 store 水合门控

### 之前的流式修复（已完成）

- `edgeone.json`：maxDuration 60→120，添加 `X-Accel-Buffering: no`
- `app/api/chat/route.ts`：SSE 心跳保活、X-Accel-Buffering header、fetch 超时 AbortController
- `lib/ai/artifact.ts`：fetch 超时 AbortController + AbortError 处理
- `lib/hooks/useChat.ts`：前端 stall 超时检测、done 时 fail 未完成 artifact
- `lib/types/chat.ts`：ToolCallBlock 添加 prompt 字段
- `components/chat/ChatMessage.tsx`：传递 prompt 到 ArtifactCard
- `components/chat/ArtifactCard.tsx`：接收并展示 prompt

## 数据流全链路（已验证代码逻辑正确）

```
Server: lib/ai/artifact.ts → streamInteractiveArtifact()
  ① send({ type:"artifact", status:"start", id, title })     ← 立即发送
  ② await fetch(upstream LLM, { stream: true })               ← 等待 AI 响应
  ③ while (reader.read()) → send({ type:"artifact", status:"delta", delta })  ← 逐 chunk
  ④ send({ type:"artifact", status:"done", html: finalizeHtml(raw) })         ← 最终 HTML

Server: app/api/chat/route.ts → ReadableStream start()
  send = (o) => controller.enqueue(encoder.encode(sse(o)))
  sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`
  await streamInteractiveArtifact(send, ...)  ← 在 start() 内 await

Client: lib/hooks/useChat.ts → reader.read() loop
  parseSseLines(buffer) → 按 \n 分割，提取 data: 行 JSON.parse
  case 'artifact':
    start → a.start(id, title)
    delta → a.append(id, delta)     ← 逐 delta 追加 html
    done → a.finish(id, html)       ← 用 finalizeHtml 后的完整 HTML 替换
    error → a.fail(id)

Client: lib/hooks/useArtifacts.ts → Zustand store
  append: (id, delta) => set((s) => ({ byId: { ...s.byId, [id]: { ...a, html: a.html + delta } } }))
  ← 原子更新，创建新对象引用，触发订阅 re-render

Client: components/chat/ArtifactCard.tsx
  const art = useArtifacts((s) => s.byId[artifactId])  ← 订阅 artifact
  streaming = art?.status === 'streaming'
  useEffect: streaming → setShowCode(true)
  {showCode && (streaming || done) && <pre>{art?.html}</pre>}
```

## 已排除的可能原因

| 嫌疑 | 排除理由 |
|------|----------|
| EdgeOne Nginx 缓冲 | 本地 dev 也有问题 |
| `await` 阻塞主 SSE 流 | `send()` 是 `controller.enqueue()`，await 期间仍可推送 |
| `parseSseLines` 解析错误 | 代码审查正确，SSE 格式 `data: {...}\n\n` 正确处理 |
| `useArtifacts.append` 不更新 | 原子 `set((s)=>...)` 创建新对象引用，Zustand v5 正确触发 |
| `React.memo(ChatMessage)` 阻断 | ArtifactCard 有独立 Zustand 订阅，不受父组件 memo 影响 |
| 水合竞态 | 已修复（自定义 merge + 双 store 门控） |
| `partialize` 返回 undefined | 已修复（恢复为始终返回 { order, byId }） |

## 未排除的可能原因（按优先级排序）

### P0: 上游 LLM API 未真正流式返回

`lib/ai/artifact.ts:132-149` 对上游 LLM 发起 `fetch` 请求，设了 `stream: true`。但：
- 某些 API 代理（尤其是国内中转）会忽略 `stream: true`，先缓冲完整响应再一次性返回
- 某些 API 对不带 `tools` 的请求走不同路径，可能不流式
- **验证方法**：在 `artifact.ts:163` 的 `reader.read()` 循环中加 `console.log('[artifact] chunk size:', value?.length, 'time:', Date.now())`，观察是否逐 chunk 到达还是一次性到达
- **验证方法**：直接 `curl -N` 上游 API 端点，观察 SSE chunk 粒度

### P1: Next.js dev mode HTTP 响应缓冲

Next.js App Router 在 dev mode 下可能对 `ReadableStream` 响应做缓冲：
- `next.config.mjs` 没有显式禁用压缩
- **验证方法**：`next build && next start` 在生产模式下测试
- **验证方法**：在 `route.ts:86` 的 `send` 函数中加 `console.log('[send]', JSON.stringify(o).slice(0, 80), 'time:', Date.now())`，对比服务端 enqueue 时间和客户端收到时间

### P2: `controller.enqueue` 在嵌套 async 上下文中不及时 flush

`streamInteractiveArtifact` 在 `ReadableStream.start()` 内被 `await`。虽然 `controller.enqueue` 应该立即将数据加入流队列，但 Node.js HTTP 层的 flush 时机可能受事件循环影响：
- **验证方法**：在 `send` 函数中加 `console.log` 时间戳，在客户端 `reader.read()` 后加 `console.log` 时间戳，对比延迟

### P3: 客户端 `reader.read()` chunk 粒度问题

浏览器 fetch API 的 `reader.read()` 可能将多个 SSE 事件合并为一个 chunk 返回，导致 `parseSseLines` 一次处理多个事件。但这不应该影响流式效果 — 多个 delta 事件仍然会被逐个 `append`。

## 待实现的功能

### "生成依据" Markdown 渲染

`components/chat/ArtifactCard.tsx:91-103` 当前用纯文本 `<span>{prompt}</span>` 展示 prompt。

**推荐方案**：使用 `ReactMarkdown` + `sharedRemarkPlugins` + `sharedRehypePlugins`（来自 `lib/markdown/plugins.ts`）渲染 prompt。

```tsx
import ReactMarkdown from 'react-markdown';
import { sharedRemarkPlugins, sharedRehypePlugins } from '@/lib/markdown/plugins';

// 在 ArtifactCard 中替换 {prompt} 为：
<ReactMarkdown remarkPlugins={sharedRemarkPlugins} rehypePlugins={sharedRehypePlugins}>
  {prompt}
</ReactMarkdown>
```

注意：不需要完整的 `MessageContent` 组件（它包含 XML 标签解析、可视化等重型逻辑），只需要 Markdown + 公式渲染。

## 关键文件清单

| 文件 | 作用 |
|------|------|
| `lib/ai/artifact.ts` | `streamInteractiveArtifact()` — 服务端 artifact 生成 + SSE 推送 |
| `app/api/chat/route.ts` | 主聊天 SSE 路由 — `ReadableStream` + `send()` + 工具调用循环 |
| `lib/hooks/useChat.ts` | 客户端 SSE 解析 + 事件分发 + `parseSseLines()` |
| `lib/hooks/useArtifacts.ts` | Zustand store — artifact CRUD + IndexedDB 持久化（debounce） |
| `components/chat/ArtifactCard.tsx` | artifact 卡片 UI — 流式源码展示 + prompt 展示 |
| `components/chat/ChatMessage.tsx` | 消息组件 — `React.memo` 包裹，渲染 ArtifactCard |
| `lib/markdown/plugins.ts` | 共享 remark/rehype 插件（GFM + math + KaTeX + highlight） |
| `lib/storage/idbStorage.ts` | IndexedDB 存储适配器（idb-keyval） |
| `next.config.mjs` | Next.js 配置（无压缩相关配置） |

## 建议的排查步骤

1. **在 `artifact.ts` 的 `reader.read()` 循环中加诊断日志**：
   ```ts
   console.log(`[artifact] chunk: ${value?.length}b, buf: ${buf.length}, raw: ${raw.length}, t: ${Date.now()}`);
   ```

2. **在 `route.ts` 的 `send` 函数中加诊断日志**：
   ```ts
   const send = (o: unknown) => {
     const obj = o as { type?: string; status?: string };
     if (obj.type === 'artifact') console.log(`[send] artifact ${obj.status}, t: ${Date.now()}`);
     controller.enqueue(encoder.encode(sse(o)));
   };
   ```

3. **在 `useChat.ts` 的 artifact 事件处理中加诊断日志**：
   ```ts
   case 'artifact': {
     console.log(`[client] artifact ${event.status}, delta_len: ${event.delta?.length}, t: ${Date.now()}`);
     // ...
   }
   ```

4. **打开浏览器 DevTools → Network → /api/chat → EventStream 标签**，观察 artifact delta 事件的到达时间和大小

5. **用 `next build && next start` 在生产模式测试**，排除 dev mode 缓冲

6. **直接 curl 上游 API**：
   ```bash
   curl -N -X POST <AI_BASE_URL>/chat/completions \
     -H "Content-Type: application/json" -H "Authorization: Bearer <KEY>" \
     -d '{"model":"<MODEL>","messages":[{"role":"system","content":"test"},{"role":"user","content":"输出一个简单HTML"}],"stream":true}'
   ```
   观察 SSE chunk 是否逐条到达
