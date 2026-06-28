# 存储架构规范

> 本文档描述客户端持久化分层、水合门控、迁移策略与扩展指南。
> 任何修改存储层、新增持久化 store 的操作，都应先阅读本文档。

---

## 1. 架构总览

```
┌───────────────────────────────────────────────────────────────┐
│                    存储层 (lib/storage/)                        │
│                                                                 │
│  idbStorage.ts                                                  │
│  ├─ DB_NAME = "gailvlun-db"                                    │
│  ├─ STORE_NAME = "keyval"                                      │
│  ├─ PERSIST_KEYS = { chatHistory, artifacts }                  │
│  ├─ idbStorage (StateStorage 适配器)                            │
│  │   └─ getItem: 先读 IndexedDB → 回退 localStorage → 播种迁移  │
│  ├─ estimateSize(key)                                          │
│  └─ clearAll()                                                 │
│                                                                 │
│  useHydrated.ts                                                 │
│  └─ useHydrated(store) → boolean                               │
└───────────────────────────────────────────────────────────────┘
         │                                          │
    ┌────┴──────────────┐                ┌───────────┴──────────┐
    │  IndexedDB 层      │                │  localStorage 层      │
    │  (大数据、异步)     │                │  (小数据、同步)        │
    │                    │                │                       │
    │  useChatHistory    │                │  useSettings          │
    │  useArtifacts      │                │  useTheme             │
    │                    │                │  useChatUI            │
    │                    │                │  useBrowser           │
    │                    │                │  quiz-progress        │
    └────────────────────┘                └───────────────────────┘
```

### 核心原则

- **大数据走 IndexedDB**：对话历史（含 toolCalls 元数据）和交互演示 HTML（8-40KB/个）存入 IndexedDB，容量数百 MB。
- **小数据留 localStorage**：设置、主题、UI 状态、书签、成绩等 <10KB 数据保留 localStorage，同步读取无水合问题。
- **单一真相源**：DB 名、store 名、持久化 key 全部集中在 `lib/storage/idbStorage.ts` 顶部常量区。
- **SSR 安全**：所有存储操作 `typeof window === "undefined"` 守卫降级。

---

## 2. IndexedDB 存储适配器 (`lib/storage/idbStorage.ts`)

### 2.1 常量

| 常量 | 值 | 说明 |
|---|---|---|
| `DB_NAME` | `gailvlun-db` | 专属数据库，不与默认 `keyval-store` 混淆 |
| `STORE_NAME` | `keyval` | 单 object store，所有 key 共存 |
| `PERSIST_KEYS.chatHistory` | `chat-history` | 对话历史 v1（迁移后删除） |
| `PERSIST_KEYS.chatManifest` | `chat-manifest` | Storage v2 manifest |
| `PERSIST_KEYS.artifacts` | `artifacts` | 交互演示持久化 key |
| `chat-session:{id}` | per-session | 单会话消息数组 |
| `chat-blob:{id}` | per-blob | 图片附件 data-url |

### 2.2 StateStorage 接口

`idbStorage` 提供 `getItem`/`setItem`/`removeItem` 三个异步方法，供 zustand `createJSONStorage` 使用。

**透明迁移**：`getItem` 首次读不到 IndexedDB 时，回退读旧 localStorage 并播种到 IndexedDB，然后清除旧 key。此过程幂等，Strict Mode 双跑安全。

### 2.3 工具函数

| 函数 | 用途 |
|---|---|
| `estimateSize(key)` | 估算 IndexedDB 中某 key 的数据大小（字节） |
| `clearAll()` | 清空全部持久化数据（设置面板"清空"可复用） |

---

## 3. 水合门控 (`lib/hooks/useHydrated.ts`)

### 3.1 问题

IndexedDB 是异步存储。zustand `persist` 从 IndexedDB 恢复数据时，首屏 store 为空。若用户在此窗口期发送消息，`createSession` 会创建竞争会话，与稍后回灌的持久化会话冲突，导致活动会话/历史丢失。

### 3.2 方案

每个 IndexedDB 持久化 store 包含 `_hasHydrated: boolean` 标志，通过 `onRehydrateStorage` 回调在水合完成时置真。

`useHydrated(store)` hook 封装 `persist.onFinishHydration` / `persist.hasHydrated()` 订阅，返回 boolean。

### 3.3 消费点

| 消费方 | 门控行为 |
|---|---|
| `ChatPanel` | 未水合时显示"正在加载历史记录…"，禁用输入框 |
| `useChat.sendMessage` | 未水合时直接 return（双保险） |
| `ChatPanel` outbound effect | 未水合时不触发 sendMessage |

---

## 4. 跨 Store 孤儿清理

artifact 随会话产生但分属不同 store。删除会话时需联动清理孤儿 artifact：

- `useArtifacts.prune(keepIds: string[])`：删除不在 keepIds 中的 artifact。
- `useChatHistory.deleteSession`：删除后收集剩余会话的全部 `artifactId`，调用 `prune`。
- `useChatHistory.createSession`：最多保留 50 个会话，溢出的老会话其 artifact 一并 prune。

---

## 5. 持久化 Store 清单

### IndexedDB 层

| Store | Key | partialize | 说明 |
|---|---|---|---|
| `useChatHistory` | `chat-history` | `sessions`, `activeSessionId` | 排除 `_hasHydrated` |
| `useArtifacts` | `artifacts` | `order`, `byId` | 排除 `viewerId`（临时 UI 态）、`_hasHydrated` |

### localStorage 层（不迁移）

| Store | Key | 原因 |
|---|---|---|
| `useSettings` | `gailvlun-settings-v1` | ~1KB，纯配置 |
| `useTheme` | `gailvlun-theme` | ~10B，含 layout 内联防闪脚本 |
| `useChatUI` | `quickExplainWindowSize` | ~50B |
| `useBrowser` | `gailvlun-browser` | ~1-5KB，书签/视图模式 |
| `quiz-progress` | `gailvlun-quiz-progress-v1` | ~2-20KB，成绩记录 |

---

## 6. 扩展指南

### 6.1 新增 IndexedDB 持久化 store

1. 在 `idbStorage.ts` 的 `PERSIST_KEYS` 中添加新 key
2. 在 store 中使用 `persist(fn, { name: PERSIST_KEYS.xxx, storage: createJSONStorage(() => idbStorage) })`
3. 添加 `_hasHydrated` + `onRehydrateStorage` 置真
4. 用 `partialize` 排除临时状态和 `_hasHydrated`
5. 消费方用 `useHydrated(store)` 门控

### 6.2 新增 localStorage 持久化 store

直接使用 zustand `persist` 默认的 localStorage（不传 `storage` 参数），无需走 IndexedDB。

---

## 7. Storage v2 对话分层（2026-06-28）

### 7.1 Key 契约

| Key | 内容 |
|-----|------|
| `chat-manifest` | `{ version: 2, activeSessionId, sessions: SessionMeta[] }` |
| `chat-session:{id}` | `ChatMessage[]`（附件为 `ChatAttachmentRef`） |
| `chat-blob:{id}` | 图片 data-url |
| `chat-history` | v1 遗留；`migrateFromV1IfNeeded()` 成功后删除 |

`SessionMeta` 含 `messageCount`、`preview`、`artifactIds`（冷卸载时 prune 用）。

### 7.2 模块

- `lib/storage/chatStorage.ts`：纯 IO（manifest / session / blob / 迁移 / 导出 hydrate）
- `lib/hooks/useChatHistory.ts`：内存 `sessionsMeta` + `messagesById`（LRU ≤3）；**不再**使用 zustand `persist`
- `ensureChatHistoryBootstrap()`：启动时迁移 → 加载 manifest → 加载 active 会话
- `useChatReady()`：manifest 已加载且 active 会话消息就绪

### 7.3 水合

| 消费方 | 门控 |
|--------|------|
| `ChatPanel` / `FloatingChatBody` | `useChatReady()` |
| `useChat.sendMessage` | `_hasHydrated` + 会话 `messagesById` 就绪 |

`useHydrated(useChatHistory)` 仍可用（`persist` 兼容 shim）。

### 7.4 附件

发送时 `persistInlineAttachments` 将 inline base64 拆到 `chat-blob:{id}`；API 发送前 `hydrateAttachmentsForApi` 还原。

---

## 8. 禁止事项

- **不要**在 store 中硬编码 DB 名或 key 名 — 必须从 `PERSIST_KEYS` 导入
- **不要**在未水合时创建会话或发送消息 — 必须通过 `useHydrated` 门控
- **不要**持久化临时 UI 状态（如 `viewerId`）— 用 `partialize` 排除
- **不要**在 SSR 环境直接访问 `indexedDB` — 必须守卫降级
- **不要**删除 `onRehydrateStorage` 回调 — 否则 `_hasHydrated` 永远为 false，输入被永久禁用
