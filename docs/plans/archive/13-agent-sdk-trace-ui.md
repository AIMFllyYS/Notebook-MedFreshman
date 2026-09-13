# Agent SDK 7 与 Trace UI 迁移记录

本记录承接 `docs/HANDOFF-agent-sdk-trace-ui.md`。分支为 `feat/agent-sdk-trace-ui`；原 Step 3 未提交改动全部保留。本轮没有 commit、push、reset、清理工作区或修改 Git 配置。

后续更新：用户报告真实聊天不可用后，已定位受限启动环境的 EACCES、修复错误收尾和协议兼容，并按参考图重做单色活动列表。以下为首次迁移记录；当前状态以 [真实连接与图标返修](14-chat-runtime-and-icons.md) 为准。

## 实现边界

| 模块 | 现有职责 / 本轮结果 |
| --- | --- |
| `lib/ai/sdk/` | 原模型工厂、reasoning 归一化、failover、SSE 心跳保持不变；新增非聊天路由共享消费器 `routeGeneration.ts` |
| `lib/ai/agent/` + `/api/chat` | 保留交接的 ToolLoopAgent、工具定义、请求 schema、提示词顺序与用量输出；六个旧静态扫描测试改为验证新职责位置 |
| `lib/hooks/useChat.ts` | 用 `DefaultChatTransport` 发送 UIMessage，`consumeStudyStream` 调用 `readUIMessageStream`，只把快照写回原 Zustand store |
| `lib/chat/buildTrace.ts` | 从 parts 推导有序 reasoning/tool/intermediate-text 步骤，最后一个工具之后的 text 作为最终回答，避免重复 |
| `components/chat/AgentTrace*` | MD3 细轨道、紧凑工具摘要、运行态脉冲、完成折叠、停止/错误/批准状态、键盘可访问性与 reduced-motion |
| `components/chat/ChatMessage.tsx` | 不再依赖扁平 content/reasoningContent/toolCalls；最终回答、笔记引用、来源、图片画廊、artifact、生图批准卡独立于折叠过程 |
| 其他文本生成接口 | artifact、record、chat-title、follow-ups、canvas-revise 迁入 `resolveLanguageModel()`；请求字段、客户端 JSON/SSE 格式及专用 HTML 收尾策略保留 |
| `/api/image-gen` | 继续使用专用生图协议，无改动 |

SDK 接入按仓库实际安装的 `ai@7.0.85` 源码和类型校验；参考官方 [UIMessage stream reader](https://ai-sdk.dev/docs/reference/ai-sdk-ui/read-ui-message-stream) 与 [ToolLoopAgent](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent)。不要把 provider 层 `LanguageModelV4Usage` 的嵌套 token 字段与 SDK Core 返回的 `LanguageModelUsage` 混淆：后者是数值 `inputTokens` / `outputTokens`，缓存详情在 `inputTokenDetails.cacheReadTokens`。

## 必须维持的契约

- Zustand 与 IndexedDB 是消息真相源；不引入 AI SDK React hook 的第二份消息状态。
- SDK 会更新 stream reader 的内部消息，必须克隆占位输入；服务端 start ID 不覆盖本地消息主键。
- UI 快照继续约 60ms 节流，退出路径强制提交尾帧。原始 SSE 字节活动（含注释心跳）用于 stall 检测。
- 正常 `finish` 才终结尚未结束的文本/思考；取消、错误或意外 EOF 保留中断标记，UI 用“请求已停止 + 未结束 part”展示停止，不把部分输出误标为成功。
- reader 显式取消；组件卸载、附件水合期间取消、服务端 abort 和网络错误均不得继续写入过期请求。
- 自动发送（主面板 outbound / 浮窗 seed）使用可取消微任务，兼容 StrictMode effect 重放；仅在 hook 接受请求后消费待发项。浮窗 seed 在窗口状态中确认，最小化再恢复不重复发起。
- data-usage 与 metadata.usage 可能重复携带同一用量，但只在请求收尾结算一次；冻结本轮模型与定价配置，主面板/浮窗的 token 看板互不污染。
- `data-info` 是各 hook 独立的临时连接提示，显示为 `role=status`，不落库；context-breakdown 与 followup 保留原看板/追问行为。
- 软上限只裁剪请求消息，不删除本地历史；附件正文仍按原 blob 引用策略存储并在发送前水合。
- `toModelOutput` 只回灌工具输出中的 text；其余字段仍供 UI 使用。生图工具只创建批准卡，不自动批准付费生成。
- 旧会话在读库时懒迁移，历史 artifact 不因查看而重新生成。

## 清理

已确认无运行时消费者后删除 `lib/ai/anthropicAdapter.ts` 及其专用测试、`components/chat/Message.tsx`、`components/chat/ReasoningBlock.tsx`。删除可通过 Git 历史恢复；新的 SDK / API 回归覆盖原协议职责。

`ProcessingSteps` 保留为 typed Trace 薄包装；`ToolCallDashboard` 仅保留历史 inline `<ToolCall>` 的局部适配，真实聊天不再走旧格式。只删除确认无消费者的 `.processing-steps*` CSS，仍被其他正文使用的 `pulse-dot` 保留。未找到 `scratch-tool.ts`，未创建/删除额外调试文件。

## 验证方式

测试使用真实安装的 SDK 和拦截的上游 HTTP，不需要、也没有调用真实付费 provider。新增覆盖包括原生 Anthropic 思考/图片、OpenAI-compatible reasoning、多步工具循环、503 failover、401 不切换、终结事件顺序、生图工具限制、附件、取消、标题、计费和浮窗隔离。

浏览器在新的隔离 context 中执行，通过本地模拟 provider 调用实际 Next 路由；不会修改用户已有浏览器存储。原 `35349` 开发服务占用且不响应，未停止该进程；验收临时使用 `35350` 和独立 `.next/trace-qa` 输出目录。

验收脚本、完整命令日志与截图留在 git-ignored `tmp/agent-sdk/`，不混入产品源码。截图包括运行态、展开/完成态、移动端、旧会话、浮窗与批准生图；本地模型只验证协议/交互，不证明真实模型回答质量。

## 最终验收结果

核验日期：2026-09-07。未满足的门禁不记为通过。

| 检查 | 最终结果 | 证据（`tmp/agent-sdk/`） |
| --- | --- | --- |
| TypeScript 严格检查 | 0 错误 | `tsc-final.log`；本地 `pnpm exec tsc` 有命令查找异常，改用相同本地编译器入口 `pnpm exec node node_modules/typescript/bin/tsc --noEmit`，退出码 0 |
| `pnpm test:unit` | 2230 / 2231 通过；唯一失败为已知教材缺图 | `unit-final.log` |
| `pnpm test:react` | 39 个文件，177 / 177 通过 | `react-final.log`；保留已有 ChatInput `act(...)` 警告 |
| `pnpm test` | 2230 / 2231，因同一内容测试返回 1 | `full-test.log`；脚本的 `&&` 阻止继续运行 React，所以已单独运行上行的完整 React suite |
| 本轮新增/改写生产文件 ESLint | 0 error、1 warning | `lint-migration.log`；warning 为既有 TanStack Virtual 与 React Compiler 的兼容提示 |
| `pnpm lint` 全仓 | 890 errors、16140 warnings，未通过 | `lint-final.log`；包括 `dist-desktop` 打包文件、临时目录及其他旧模块；未降低规则或扩大到无关重构 |
| `pnpm build` | 在 prebuild 的已知教材测试处停止 | `build.log`；编码、注册表、媒体/公式等前置守卫已运行；未修改或跳过项目门禁 |
| Next 生产构建单独验证 | 退出码 0，1152 / 1152 静态页面生成完成 | `next-build.log`；命令 `node node_modules/next/dist/bin/next build`，用于区分内容门禁与编译结果，不等同于完整 `pnpm build` 通过 |
| Diff 空白检查 | 通过 | `git diff --check` |

### 浏览器覆盖与边界

- `browser-smoke.log`：实际 Next 路由 + 本地模拟 provider 的流式 reasoning/getSection/最终答案、完成折叠与手动展开、追问、IndexedDB 刷新恢复、只有思考时停止、跨学年 searchNotes 引用卡、独立 artifact HTML 流、生图批准卡、390px 移动端聊天面板，以及旧 content/reasoningContent/toolCalls 数据懒迁移。该轮无 pageerror。
- `browser-extras.log`：真实图片上传并水合为 SDK file part、异步标题落入 manifest、StrictMode 划词解释的独立会话/模型、主面板消息不变、每轮恰好一条计费记录；批准前没有生图请求，批准后仅一次 mock 生图请求且查看器显示图片。
- Anthropic 原生思考 + 图片 + 两轮 tool_use/tool_result、OpenAI-compatible、503 failover、401 不切换及成功追问的事件顺序由实际 SDK HTTP fixture 测试验证；没有真实付费 provider、联网搜索或 Unsplash 调用。
- 网页来源卡与图片画廊使用旧会话中的 fixture 验证迁移和展示，不能视为外部搜索服务可用性或模型视觉识别质量已验收。
- 临时 `35350` / `35351` 服务已停止；已有 `35349` 服务未结束。Next 对临时 tsconfig include 的自动添加已撤回，不保留 QA 专用项目配置。

结论：本轮实现与上述定向回归完成，但 Step 8 **不是全部通过**；已知内容测试、全仓 lint 及下面的受保护稳定层缺陷仍明确保留。

## 未扩大范围的已知问题

交接要求不要修改已完成的稳定文件。只读协议复核发现 `/api/chat` 的流内错误收尾和 request schema 的缺省学年兼容问题，未擅自改动；详见 [稳定层待修复问题](13-agent-sdk-known-issues.md)。

此外，全仓 lint 包含打包产物/临时文件和其他模块的存量错误；本轮不会通过关闭规则、隐藏产品源码或顺带重构无关模块来制造“全绿”。已知 `cell-biology/textbook/ch08-4` 图题无图的内容测试按交接要求保留原状。
