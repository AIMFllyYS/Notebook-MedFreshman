# 00 · 代码清洗执行契约（2026-09）

> 适用范围：`18`–`22` 五份计划的**所有**执行型与验收型子智能体。开工前必读，全程遵守。
> 本契约的存在理由：本仓库同时有另一个 Agent 在持续更新**正文讲解内容**，它走 `feat/*` 分支 + PR 合并进 `master`。两边必须互不干扰。

---

## 一、并发作业隔离

**另一个 Agent 的作业域（我方绝对不碰）：**

- `content/**` —— 全部教学正文、例题、测验 JSON
- `public/images/**`、`public/media/**` —— 内容配图与媒体
- `lib/content-data/**` 里的**数据条目**（学科/板块/内容项的具体 name、items 数组、录音清单等）
- `content/.index/`（生成物）

**我方作业域（另一个 Agent 不会碰）：**

- 构建与工具配置：`package.json` scripts、`tsconfig.json`、`eslint.config.mjs`、`knip.json`、`vitest.config.ts`、`.gitignore`
- `scripts/**`（构建链脚本与归档整理）
- `components/**`、`app/**`（除 `content` 数据外的所有 tsx/ts）
- `lib/**`（除上面点名的数据条目）
- `docs/plans/**`、`docs/refer/**`、`docs/archive/**`
- `tests/**`（测试代码；但见下条）

**灰色地带与处理方式：**

- `lib/content-data/category-templates.ts`、`lib/types/content.ts`：计划 `21` 会给**类型和模板**加字段（如 `layoutProfile`）。允许改，但**编辑前必须重新 Read 该文件**（不要依赖几十分钟前的读取结果），且只加字段、不动任何已有条目的数据值。
- `tests/content/**`：这些是**内容校验**测试，断言的是另一个 Agent 正在产出的内容。它们失败**不是**我方的问题：
  - 严禁通过修改 `content/**` 下的 markdown 来"修复"它们。
  - 严禁通过放宽断言来"修复"它们。
  - 正确做法：记录失败项，在报告里列出，继续自己的任务。
  - 已知基线失败：`tests/content/sophomore-textbooks.test.ts` → `cell-biology/textbook/ch08-4 有图题但没有任何图片引用`。执行期间可能出现**新的**内容测试失败（对方正在合内容），同样只记录不修。

---

## 二、Git 纪律（违反会破坏另一个 Agent 的工作）

**禁止：**

- `git add -A`、`git add .`、`git commit -a` —— 会把对方的在途文件一起提交
- `git stash`（任何形式）、`git reset --hard`、`git checkout -- .`、`git clean`、`git restore .`
- `git pull`、`git fetch` + `merge`、`git rebase`、`git push`、任何分支切换（`checkout`/`switch`）
- 任何会重写历史的操作（`filter-repo`、`commit --amend` 已推送的提交、`rebase -i`）
- 修改 `.git/` 下任何内容

**必须：**

- 只用显式路径提交：`git add path/a path/b && git commit -m "..."`
- 每个阶段（计划里标了 Commit 的地方）单独提交，提交粒度小、可 revert
- 提交前跑 `git status --short`，确认暂存区里**只有**自己改的文件
- 若发现工作区有不属于自己的脏文件（对方的在途内容），**原样留着**，不要提交、不要还原、不要问
- Commit message 沿用仓库风格（`type(scope): 中文或英文描述`）
- 全程留在 `master` 分支，不推送。推送与 PR 由用户决定

---

## 三、模型与工具

- 所有子智能体统一使用 **Cursor Grok 4.6 Xhigh Fast**，由主智能体在派发时指定，子智能体自身不再派发其他模型的子任务。
- 环境：Windows 10 / PowerShell / pnpm。路径用反斜杠或引号包裹，注意 PowerShell 的引号与编码坑（仓库里有大量中文文件名，`Test-Path` 对某些字符会报错，改用 `git ls-files` 或 `Get-ChildItem -LiteralPath`）。
- 文件操作一律用 Read / StrReplace / Write / Glob / Grep 工具，不要用 `cat`/`sed`/`awk`/`echo >`。
- 端口：`pnpm dev` 固定 `35349`（见 package.json）。起了 dev server 记得在任务结束前关掉。

---

## 四、验证纪律

每个阶段完成后至少跑：

```powershell
pnpm exec tsc --noEmit
pnpm lint
pnpm test:react
```

计划全部完成后再跑完整 `pnpm test`。区分两类失败：

- **代码失败** → 必须修到绿
- **内容失败**（`tests/content/**`）→ 记录，不修（见第一节）

不要为了让测试通过而删除/跳过测试用例。确需调整断言的，必须在报告里单列并说明理由。

---

## 五、交付物

每个执行型子智能体在完成后，向调用方返回一份结构化报告，包含：

1. 每个阶段的 commit hash 与一句话说明
2. 实际改动与计划的**偏差**（计划里写的做法在真实代码里不成立时你怎么处理的），这是最重要的一节
3. 计划里要求写入"执行记录"的数据（如 knip 首跑数量、persist name 清单、抖动帧数）
4. 未完成项与原因
5. 遗留风险 / 给验收方的重点检查提示

同时把 1–3 追加写进对应计划文档末尾的 `## 执行记录` 小节。

---

## 六、遇到阻塞时

- 计划与真实代码冲突（文件不存在、行号对不上、API 版本不同）：**以真实代码为准**，按计划的**意图**调整做法，并在报告的"偏差"一节写清。
- 不要为了照搬计划而制造不合理的代码。
- 不要扩大作业范围去"顺手优化"计划外的东西——那会让 commit 无法二分定位。
- 真正无法决断的（涉及产品取舍、数据安全、需要用户选择的），停下来在报告里说明，不要猜。
