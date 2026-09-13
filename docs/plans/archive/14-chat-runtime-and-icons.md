# 真实聊天连接与执行过程图标返修

日期：2026-09-07。承接用户反馈“任何问题都显示 An error occurred”以及思考链图标/布局不专业的问题。未提交、推送或修改 API 密钥，已保留此前工作区改动。

## 故障证据与处理

1. 原开发服务日志明确报 `Cannot connect to API: connect EACCES`；随后 SDK 重试三次，客户端只收到默认英文错误。
2. 不带密钥的同端点 HTTPS 探针：受限环境返回 EACCES，普通环境可以建立连接并得到 HTTP 响应。这是进程网络权限问题，不是提问内容或 Next.js 页面渲染错误。
3. 经核对 PID、端口及项目路径后，将本项目 35349 开发服务重启到非受限环境。未修改代理、系统设置或密钥；该服务保持运行，用户可刷新页面继续使用。
4. 实际 `/api/chat` 调用 DeepSeek V4 Flash：返回正常 `OK`、usage 和 finish。实际浏览器又完成 `getCurrentPage → 最终回答`，页面标题与主题正确，控制台没有 error。
5. MiMo V2.5 的当前环境凭据仍被上游返回 `401 Invalid API Key`；不能通过代码伪装修复。若选用 MiMo，需要用户更新该提供商的有效密钥。诊断浏览器已切回实际验证可用的 DeepSeek V4 Flash；未更改模型注册表默认值或用户其他浏览器的配置。

## 代码修复

- `lib/ai/sdk/errorMessage.ts`：遍历 SDK retry/cause 错误链，分别提示网络权限、DNS、连接、超时、认证与协议失败；不序列化 requestBody/headers/raw response，脱敏密钥和 URL。
- `/api/chat`：`toUIMessageStream` 使用同一安全错误格式化器；error/abort 终止 generation，保留已输出内容但不触发追问或成功 finish；SDK 外层重复重试关闭，端点 failover 仍由适配器负责。
- `useChat`：已处理的错误显示在聊天区的可访问 alert，使用 warning 日志而非触发 Next 开发遮罩的 console.error。
- 请求 schema 明确应用默认学年；追问兜底继续继承旧 customProvider 配置。
- reasoning adapter 覆盖所有 OpenAI-compatible 响应；恢复已知对象/数组与历史别名兼容。未知标准字段结构、畸形工具、错误帧仍由 SDK 严格处理；未改写 SSE 行保持原字节。

## 视觉返修

使用 frontend-design / React 规范落实用户参考图的平面活动列表：

- 新增 22 个原创 20-unit / 1.45px stroke SVG 图标，默认 18px，无新依赖或厂商品牌图案复制。
- 思考用中性循环符号，读文件/搜索/工具执行用文件、搜索和终端符号；移除思考链及主要聊天控件的 Lucide、灯泡、扳手、闪光装饰。
- 去掉彩色圆徽章、垂直连线、重复状态与步骤计数；运行工具不自动展开 JSON，详情由用户手动展开。
- 完成摘要为“已处理 X 秒 / X 分 Y 秒”，不把全部工具和等待时间称作思考时间。
- 输入栏、思考菜单、头部、产物/生图批准卡、追问列表同步使用自绘图标；追问区改为轻量分隔列表，不再套大色块卡片。
- 保留键盘操作、aria-expanded/controls、错误 alert、reduced-motion、原工具输出和产物行为。

浏览器已检查自然右侧面板与 390px 手机布局；面板无横向溢出。真实认证失败在聊天区可读显示，浏览器仅记录 warning，没有 Next Console Error 遮罩。临时 viewport 已复原，预览标签保持打开。

### 用户补充布局建议的落实

- 共享 `ChatInput` 改为聊天容器底部的 absolute 悬浮层，外层背景全透明；输入框自身保留轻薄半透明轮廓以保证文字可读。思考、搜索、上下文与模型控件在 textarea 上方，窄宽度自动换行且不隐藏标签。
- `ResizeObserver` 测量工具栏、输入框、引用、附件、notice 的总高度；主面板和划词浮窗将实测值作为 `ChatThread.bottomInset`，同步滚动留白、虚拟列表 scrollPaddingEnd 和“跟随最新输出”按钮位置。虚拟列表 spacer 不再被 flex 压缩。
- 主面板的上下文警告也进入同一测量区；浮窗使用独立 relative 容器，避免输入层定位到窗口外。
- 用户消息和头像靠右，气泡内文字左对齐；AI 内容靠左。用户内容上限为 `min(88%, 42rem)`，长 URL 可换行。
- Trace 总览位于基准线，步骤列表缩进 12px；工具动作行另内缩 12px，使折叠态也能看出次级层次。展开正文再缩进 28px，工具输入/结果再缩进 12px。所有 part 仍是同级时序列表项，视觉缩进不虚构逻辑父子关系。

实测几何关系：1280px 桌面下 toolbar 位于输入框上方，外层 computed background 为透明；多行草稿令预留区从 160px 增至 229px，清空后恢复。420px 划词浮窗也独立测得 130px 留白。360px 手机下预留 158px、无横向溢出，最后一条消息位于 composer 顶部以上；真实 401 错误条也完整出现在 composer 上方。测试草稿已清空，临时浮窗已关闭，viewport 已复原。

## 验证

命令输出保留在 git-ignored `tmp/chat-fix/`。实际 API 探针只发送了极短诊断问题，浏览器真实工具验证使用当前教材页；其余协议与错误路径均为 mock fixture。

验证结果：

- TypeScript 严格检查：0 错误。
- Node 单测：2253 / 2254 通过，唯一失败仍为原教材 `cell-biology/textbook/ch08-4` 缺图。
- React 全量：41 个文件，191 / 191 通过；最终工具行附加缩进的 20 条 Trace 回归另行通过。
- 本轮生产文件 ESLint：0 error，保留 TanStack Virtual 的既有兼容 warning。
- Next 生产构建：成功，1152 / 1152 静态页面；未将因已知内容测试而失败的完整 `pnpm build` 门禁记为通过。
- `git diff --check`：通过。

不修无关教材内容，也不扩大到全仓 lint 存量清理。实际配置中 MiMo 的 401 仍需有效凭据解决；DeepSeek V4 Flash 的真实链路已确认可用。
