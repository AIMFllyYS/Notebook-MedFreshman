# Agent SDK 问题复核记录（已修复）

> **这是已修复档案，不是待办。** 两项均已在 `5ff57f18`（`fix(chat): harden SDK errors and refresh trace UI`）落地，并有 `tests/api/chat-sdk.test.ts` 回归。不要按下面的「修复前实际」去改现网。

初次核验日期：2026-09-07。两项问题在初次交接时按稳定层约束暂未修改；用户随后反馈真实聊天不可用，本轮已修复并补齐回归。下面保留修复前的复现信息，最新运行环境与图标返修结果见 [真实连接与图标返修](14-chat-runtime-and-icons.md)。

下述请求使用 `.invalid` 测试域名和 `test-only` 假密钥。复现时调用本地 `POST(new Request(...))`，并 mock `globalThis.fetch` 返回指定上游响应；不需要真实凭证，也不请求真实模型。现有 `tests/api/chat-sdk.test.ts` 同样只 mock 上游，覆盖成功路径和请求期错误，未将以下缺陷包装成“正确行为”的通过测试。

## 1. 上游流内报错后仍触发追问及成功收尾

状态：✅ 已修复（`5ff57f18`）。流内 error/abort 立即终止当前 generation，不再生成追问或发成功 finish；统一的 `toChatErrorMessage` 识别网络权限等根因并脱敏。客户端用聊天区 alert 呈现已处理的错误，不再 `console.error` 触发开发遮罩。

位置：`app/api/chat/route.ts:172` 转发 UI 流；`:176` 读取聚合结果；`:179`—`:188` 发起追问；`:210`—`:213` 写入元数据和 `finish`。行号对应本次核验版本。

最小请求：

```json
{
  "academicYear": "freshman-2",
  "contextTruncated": true,
  "modelId": "custom:test:study-model",
  "messages": [{ "id": "u1", "role": "user", "parts": [{ "type": "text", "text": "hello" }] }],
  "customApiGroups": [{
    "id": "test", "name": "Test",
    "baseUrl": "https://review.invalid/v1", "apiKey": "test-only",
    "models": [{ "id": "study-model", "apiProtocol": "openai", "thinking": false, "tools": false }]
  }]
}
```

第一次 mock fetch 返回 `Content-Type: text/event-stream`，正文为下面两条事件，然后关闭流：

```text
data: {"choices":[{"delta":{"content":"partial answer"}}]}

data: {"error":{"message":"upstream interrupted","type":"server_error"}}

```

如收到第二次 fetch，mock 为正常 JSON 完成响应：

```json
{"choices":[{"message":{"content":"后续问题"},"finish_reason":"stop"}],"usage":{"prompt_tokens":1,"completion_tokens":1}}
```

预期：保留已收到的部分正文并报告失败，不再发起追问请求，不把失败流作为成功结果收尾；客户端应能收到可读错误原因。

修复前实际：收到 `text-delta` 后输出 `errorText: "An error occurred."`，随后仍发生第二次 fetch，并输出 `data-followup`、`data-context-breakdown`、零用量 `message-metadata` 和 `finish`。这不仅使错误后出现成功收尾，还可能产生额外追问请求费用。默认错误文本同时遮蔽了 `upstream interrupted`。

原因：`toUIMessageStream` 的 error 是流内事件，不保证聚合结果 Promise 拒绝；路由只转发事件，未在进入追问和收尾前判断失败状态。

已采用的修正：转发 error/abort 时中断 generation signal 并结束失败分支；给 `toUIMessageStream` 传入安全错误格式化器。新增「部分正文 → 流内错误」回归，断言无第二次模型调用、无成功 `finish`；同时覆盖 EACCES、401 与密钥脱敏。

## 2. 省略 academicYear 时未应用默认学年

状态：✅ 已修复（`5ff57f18`）。schema 明确声明 `.default(DEFAULT_ACADEMIC_YEAR)`，缺失/非法/有效学年均有单测，实际路由也覆盖省略字段的请求。

位置：`lib/ai/agent/requestSchema.ts:72`—`:74`。

最小请求体：

```json
{"messages":[]}
```

预期：省略学年时应用 `DEFAULT_ACADEMIC_YEAR`，不因该字段缺失返回请求格式错误。

修复前实际：直接返回 HTTP 400，错误包含：

```json
{"code":"invalid_type","expected":"nonoptional","path":["academicYear"],"message":"Invalid input: expected nonoptional, received undefined"}
```

此时尚未调用上游，因此此项复现甚至不需要模型配置。当前新版 hook 会发送 `academicYear`，常规界面请求不受影响；省略该字段的旧客户端和最小 API 请求会失败。

原因：在当前安装的 Zod 4 中，`.unknown().transform(...)` 不能代替对象字段的显式默认值声明。

已采用的修正：在 transform 前增加 `.default(DEFAULT_ACADEMIC_YEAR)`，继续保留现有合法学年检查；新增字段缺失、非法值与合法值三种情况的测试。

## 已补齐的通过覆盖

`tests/api/chat-sdk.test.ts` 新增两项独立成功场景：

- Anthropic 原生 `thinking → tool_use → tool_result → text` 两轮链路：分片 JSON 入参、thinking 签名回传、工具输出仅 text 回灌、跨步用量和缓存累计。
- 正文不含 `<FollowUp>` 时的成功追问兜底：复用自定义模型与凭证、清理编号并最多三问、`data-followup` 位于正文之后且在唯一 `finish` 之前。

返修后 `tests/api/chat-sdk.test.ts` 已为 12/12 通过，包含以上错误路径、默认学年与旧 customProvider 追问继承；错误格式化器和 schema 的纯函数测试另行覆盖。
