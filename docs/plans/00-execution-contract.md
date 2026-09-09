# 00 · 代码清洗执行契约�?026-09�?
> 适用范围：`18`–`22` 五份计划�?*所�?*执行型与验收型子智能体。开工前必读，全程遵守�?> 本契约的存在理由：本仓库同时有另一�?Agent 在持续更�?*正文讲解内容**，它�?`feat/*` 分支 + PR 合并�?`master`。两边必须互不干扰�?
---

## 一、并发作业隔�?
**另一�?Agent 的作业域（我方绝对不碰）�?*

- `content/**` —�?全部教学正文、例题、测�?JSON
- `public/images/**`、`public/media/**` —�?内容配图与媒�?- `lib/content-data/**` 里的**数据条目**（学�?板块/内容项的具体 name、items 数组、录音清单等�?- `content/.index/`（生成物�?
**我方作业域（另一�?Agent 不会碰）�?*

- 构建与工具配置：`package.json` scripts、`tsconfig.json`、`eslint.config.mjs`、`knip.json`、`vitest.config.ts`、`.gitignore`
- `scripts/**`（构建链脚本与归档整理）
- `components/**`、`app/**`（除 `content` 数据外的所�?tsx/ts�?- `lib/**`（除上面点名的数据条目）
- `docs/plans/**`、`docs/refer/**`、`docs/archive/**`
- `tests/**`（测试代码；但见下条�?
**灰色地带与处理方式：**

- `lib/content-data/category-templates.ts`、`lib/types/content.ts`：计�?`21` 会给**类型和模�?*加字段（�?`layoutProfile`）。允许改，但**编辑前必须重�?Read 该文�?*（不要依赖几十分钟前的读取结果），且只加字段、不动任何已有条目的数据值�?- `tests/content/**`：这些是**内容校验**测试，断言的是另一�?Agent 正在产出的内容。它们失�?*不是**我方的问题：
  - 严禁通过修改 `content/**` 下的 markdown �?修复"它们�?  - 严禁通过放宽断言�?修复"它们�?  - 正确做法：记录失败项，在报告里列出，继续自己的任务�?  - 已知基线失败：`tests/content/sophomore-textbooks.test.ts` �?`cell-biology/textbook/ch08-4 有图题但没有任何图片引用`。执行期间可能出�?*新的**内容测试失败（对方正在合内容），同样只记录不修�?
---

## 二、Git 纪律（违反会破坏另一�?Agent 的工作）

**禁止�?*

- `git add -A`、`git add .`、`git commit -a` —�?会把对方的在途文件一起提�?- `git stash`（任何形式）、`git reset --hard`、`git checkout -- .`、`git clean`、`git restore .`
- `git pull`、`git fetch` + `merge`、`git rebase`、`git push`、任何分支切换（`checkout`/`switch`�?- 任何会重写历史的操作（`filter-repo`、`commit --amend` 已推送的提交、`rebase -i`�?- 修改 `.git/` 下任何内�?
**必须�?*

- 只用显式路径提交：`git add path/a path/b && git commit -m "..."`
- 每个阶段（计划里标了 Commit 的地方）单独提交，提交粒度小、可 revert
- 提交前跑 `git status --short`，确认暂存区�?*只有**自己改的文件
- 若发现工作区有不属于自己的脏文件（对方的在途内容）�?*原样留着**，不要提交、不要还原、不要问
- Commit message 沿用仓库风格（`type(scope): 中文或英文描述`�?- 全程留在 `master` 分支，不推送。推送与 PR 由用户决�?
---

## 三、模型与工具

- 所有子智能体统一使用 **Cursor Grok 4.6 Xhigh Fast**，由主智能体在派发时指定，子智能体自身不再派发其他模型的子任务�?- 环境：Windows 10 / PowerShell / pnpm。路径用反斜杠或引号包裹，注�?PowerShell 的引号与编码坑（仓库里有大量中文文件名，`Test-Path` 对某些字符会报错，改�?`git ls-files` �?`Get-ChildItem -LiteralPath`）�?- 文件操作一律用 Read / StrReplace / Write / Glob / Grep 工具，不要用 `cat`/`sed`/`awk`/`echo >`�?- 端口：`pnpm dev` 固定 `35349`（见 package.json）。起�?dev server 记得在任务结束前关掉�?
---

## 四、验证纪�?
每个阶段完成后至少跑�?
```powershell
pnpm exec tsc --noEmit
pnpm lint
pnpm test:react
```

计划全部完成后再跑完�?`pnpm test`。区分两类失败：

- **代码失败** �?必须修到�?- **内容失败**（`tests/content/**`）→ 记录，不修（见第一节）

不要为了让测试通过而删�?跳过测试用例。确需调整断言的，必须在报告里单列并说明理由�?
---

## 五、交付物

每个执行型子智能体在完成后，向调用方返回一份结构化报告，包含：

1. 每个阶段�?commit hash 与一句话说明
2. 实际改动与计划的**偏差**（计划里写的做法在真实代码里不成立时你怎么处理的），这是最重要的一�?3. 计划里要求写�?执行记录"的数据（�?knip 首跑数量、persist name 清单、抖动帧数）
4. 未完成项与原�?5. 遗留风险 / 给验收方的重点检查提�?
同时�?1�? 追加写进对应计划文档末尾�?`## 执行记录` 小节�?
---

## 六、既成不变量（后续计划不得回退�?
这些是前序计划付出代价换来的结论，改动相关代码时必须保持�?
**滚动契约（计�?19 建立，经三轮真机验证�?*

- **退出贴底跟随只认真实用户手�?*：`wheel` �?`deltaY < 0`、下�?`touchmove`、`PageUp`/`ArrowUp`/`Home`、滚动条 gutter 拖拽�?- **`scrollTop` 位置只用�?用户滑回底部后自动恢复跟�?**，绝不用于反�?用户是否想离开底部"�?- 原因：内容骤缩（�?`AgentTrace` 思考块折叠）会让浏览器�?`scrollTop` 夹到 0，用位置反推会把这个程序性下降误判成用户上滑，跟随一断，整段流式都不再跟随——这就是用户反馈"生成时整页忽上忽�?的真正机制�?- 涉及 `components/chat/ChatThread.tsx`、`lib/hooks/useStickToBottom.ts`�?*不要退回用 `scrollHeight - scrollTop - clientHeight` 判断用户意图�?*
- 贴底状态下内容收缩时应继续钉住新的 `scrollHeight - clientHeight`，不要停在半截�?- `AgentTrace` 折叠�?`max-height` 过渡（约 160ms）是把结束帧的数�?px 单跳摊成 10�?4px 台阶的关键，**不要无故拆掉**�?- `.chat-message` 不得再使�?`content-visibility` / `contain-intrinsic-size`（与 tanstack �?`measureElement` 冲突）。当前是 `contain: style paint`；若往消息气泡里加**�?portal** 的浮层（下拉、气泡提示），需重新评估退�?`contain: style`�?
**窗口层契�?*

- AI 对话产物（artifact / document / imageGen）的浮窗属于 `AppShell` �?*全局窗口�?*，`createPortal` �?`document.body`；它们既不属于右侧面板，也不属于中间笔记区。任何新浮层都必�?portal �?body，不要假定祖先没�?`contain` / `transform` 造成的包含块�?
## 七、遇到阻塞时

- 计划与真实代码冲突（文件不存在、行号对不上、API 版本不同）：**以真实代码为�?*，按计划�?*意图**调整做法，并在报告的"偏差"一节写清�?- 不要为了照搬计划而制造不合理的代码�?- 不要扩大作业范围�?顺手优化"计划外的东西——那会让 commit 无法二分定位�?- 真正无法决断的（涉及产品取舍、数据安全、需要用户选择的），停下来在报告里说明，不要猜�?