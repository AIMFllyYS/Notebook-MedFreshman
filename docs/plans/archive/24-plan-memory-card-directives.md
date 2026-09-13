# 24 · 记忆卡与指令属性解析修复

> 前置：无（与计划 `21`、`23` 无文件重叠，可独立执行）。本计划由**一次 AI 会话**完成。
> 起因：计划 `23` 的交互验收顺带挖出两个 P0。**两者都是既存缺陷，不是计划 18–23 的回归**（归因证据见 `23-plan-ui-layer-relocation.md` 文末）。

---

## 摘要

记忆卡（`:::memory`）的**挖空（cloze）功能全站失效**，且卡内正文会丢掉加粗、清单项与数学公式。全站 **711** 处 `:::memory`，其中 **78** 处写了 `mode=cloze` —— 这 78 张卡一张都没能正确工作，用户还会在标题上直接看到 `氨基酸等电点“ mode=”cloze` 这样的乱码。

两个根因互相叠加，必须一起修，只修一个看不到效果。

---

## 根因 A：`normalizeDirectiveLabels` 把整个花括号当成一个 label 值

`lib/markdown/normalizeDirectiveLabels.ts`：

```ts
const DIRECTIVE_OPEN = /^(\s*:{1,4}[A-Za-z][\w-]*)(\{[^}\n]*\})([^\n]*)$/;
const LABEL_BRACE = /^\{(label|title)=([\s\S]*)\}$/;
```

`LABEL_BRACE` 的 `([\s\S]*)` **贪婪吃到收尾 `}`**，于是「label 之后的其他属性」被一起当成了 label 的值；`fixBraces` 再看到值首尾都是 `"` 就剥掉一层引号、把内部成对引号转成中文弯引号、最后整体重包。

**实测（直接跑仓库里的真实函数，Node 类型剥离）：**

| 输入 | 输出 | mode |
|---|---|---|
| `:::memory{label="氨基酸等电点" mode="cloze"}` | `:::memory{label="氨基酸等电点“ mode=”cloze"}` | **丢失** |
| `:::memory{label="名词解释答题三问" mode=cloze}` | `:::memory{label="“名词解释答题三问” mode=cloze"}` | **丢失** |
| `:::memory{label="融合与 S 期"}` | 原样不变 | — |
| `:::definition{label="σ-p 超共轭"}` | 原样不变 | — |
| `:::callout{kind=note label="题目"}` | 原样不变 | — |

注意后三行：**单属性形状是正确的**，所以这不是归一化整体坏掉，而是「label/title 后面还跟别的属性」这一种形状被吃掉。`:::callout{kind=note label=…}` 之所以幸免，是因为花括号不以 `label=` 开头，`LABEL_BRACE` 不匹配、整段被跳过。

**连锁后果：** `MemoryCard` 从 `node.properties.mode` 读 mode（`MemoryCard.tsx:35`），属性被吞后 `mode` 恒为 `undefined` → `isCloze` 恒为 `false` → **挖空分支从未被执行过**，全部 78 张 cloze 卡都掉进了清单分支。

### 影响面（全量扫描 3201 个正文文件，38683 个带花括号的指令行）

- **78 行** `:::memory{... mode=cloze}` —— 真实受害，挖空全废 + 标题可见乱码。
- 另有约 17 行被朴素探针误报（`:::derivation{label="… A260=…"}`、`{label="… Vep=…"}` 之类，label 里含公式的 `X=`）。这些经 `fixBraces` 后**原样输出、无害**，不要跟着一起改。
- 未来风险：任何人想给指令加第二个属性都会踩同一个坑。

---

## 根因 B：`MemoryCard` 从已解析的 React 树回抽文本，按构造有损

`MemoryCard.tsx:42-58` 的 `extract()` 只收集 string / number 叶子，然后把结果重新交给 markdown 渲染器。注释里也写了这是刻意为之（「把它当作字符串重新渲染，这样可以在渲染阶段做挖空/清单处理」）。问题在于 **children 已经是 react-markdown 解析后的节点**，源码语法早就没了：

| 源码写法 | 解析后 | `extract()` 拿到 | 后果 |
|---|---|---|---|
| `**帝国主义**` | `<strong>帝国主义</strong>` | `帝国主义` | `ClozeText` 找不到 `**…**`，**挖空数为 0** |
| `- [ ] 实事求是` | `<input type=checkbox>` + 文本 | `实事求是` | `ChecklistMarkdown` 找不到清单项，退化成纯文本 |
| `$\mathrm{pI}$` | rehype-katex 走 `dangerouslySetInnerHTML` | **空字符串**（内容在属性里，不在 children 里） | 卡内公式变成空白 |

实测卡体 HTML（`/biochemistry/detail/1.2`，「氨基酸等电点」）：

```html
<div class="memory-checklist"><div class="chat-prose"><p>兼性离子、净电荷为零时的 pH 才叫 ，不是「中性氨基酸的 」。</p></div></div>
```

对照源码 `**pH**` + `$\mathrm{pI}$` + `$\mathrm{pH}=7$`：加粗标记消失、两处公式变成空格。同页 `:::memory{label="名解考场总清单"}`（**没写 mode**）展开后 `bodyH≈16`、`.chat-prose` 是空的。

**这解释了为什么定义框里的公式正常、只有记忆卡内的公式没了**：定义框直接渲染 children，没有回抽这一步。

---

## 目标

1. `normalizeDirectiveLabels` 只规范化 **label / title 自身的值**，其余属性原样保留；78 张 cloze 卡的 `mode` 能传到组件。
2. 记忆卡正文不再经过有损回抽：挖空、清单、加粗、KaTeX 全部正常。
3. 两条都有**自动护栏**，防止再次静默退化（这两个缺陷能存活这么久，正是因为没有任何测试覆盖）。

## 非目标

- 不改任何正文内容（`content/**` 是内容 Agent 的作业域，只读）。**不允许**用「改写 78 处正文写法」来绕过解析缺陷。
- 不改指令名、不改 `:::memory` 的作者语法。
- 不动 remark/rehype 插件链的整体结构，不动 `prose.css`。
- 不碰计划 `23` 建立的分层与断环红线：`QuizMarkdownBase` **不得** import 指令 registry，`MemoryCard` **不得**改回 import `QuizMarkdown`。

---

## 阶段 A · 修 label/title 归一化（根因 A）

1. 把 `fixBraces` 改成**只处理第一个 `label=` / `title=` 属性的值**，其余部分原样拼回。实现要点：
   - 值可能带引号也可能不带；不带引号时，值的边界是「下一个 `\s+[\w-]+=`」之前（这正是当前 remark-directive 的痛点，也是这个函数存在的理由）。
   - 保持**幂等**（重复跑一次结果不变，现有注释已声明这一点）。
   - 保持既有行为：成对 ASCII 引号 → 中文弯引号；用 ASCII 双引号给值定界。
   - 代码围栏内不处理（现有逻辑，保留）。
   - CRLF 行尾要继续工作（`72c7464d` 专门修过这个，`[^\n]*` 的写法不要退回 `.*`）。
2. **新增单元测试** `lib/markdown/normalizeDirectiveLabels.test.ts`（纯函数，最容易钉死），至少覆盖上面那张实测表的 5 行，外加：
   - `{label="含 = 号的标题 A260=1.0"}` 必须原样输出（防止把 label 里的公式误判成属性）；
   - `{label="…" mode=cloze}`（值带引号、后续属性不带引号）；
   - `{label=不带引号的标题 mode=cloze}`；
   - 幂等性：`f(f(x)) === f(x)`；
   - CRLF 行尾。
3. 跑 `git grep -c ":::memory{.*mode" -- content` 确认 78 这个数字，并在执行记录里写清修复后 `mode` 能被解析出来的验证方式。

Commit：`fix(markdown): keep non-label attributes when normalizing directive labels`

## 阶段 B · 记忆卡正文改用源文本（根因 B）

**首选方案：在 remark 阶段把原始正文塞进节点属性。**

1. 在 `lib/markdown/remarkDirectives.ts` 处理 `name === "memory"` 的分支里（约 49 行 `data.hName = "memorycard"` 附近），用节点的 `position` 从原始 source 切出**容器内部的原文**，写进 `data.hProperties`（例如 `raw`）。
   - remark 插件能拿到 `file.value` / `vfile`，配合 `node.position.start/end.offset` 切片；注意要切「开闭围栏之间」的内容，不要把 `:::memory{...}` 与收尾 `:::` 带进去。
   - 属性值会进 HTML 属性，**注意体量与转义**；若某张卡正文过大（例如 >8KB）就退回现有行为并在注释里写清阈值理由。
2. `MemoryCard` 优先使用 `node.properties.raw`；缺失时**保留**现有 `extract()` 作为兜底（AI 生成的聊天内容可能没有 position 信息）。不要直接删掉 `extract()`。
3. 验证 `ClozeText` 能看到 `**…**`、`ChecklistMarkdown` 能看到 `- [ ]`、卡内 `$…$` 能出 `.katex`。

**若阶段 B 的 remark 方案受阻**（拿不到可靠的 offset、或属性体量不可接受），备选方案是让 `extract()` **可逆地**还原语法：遇到 `<strong>` 补回 `**`、遇到 checkbox 补回 `- [ ]`、遇到 katex 节点从其 `annotation` / 原始 TeX 补回 `$…$`。这条路更脆，**只在首选方案确实不可行时采用，并在执行记录里写清受阻原因**。

4. **新增组件测试**（vitest + jsdom），至少：
   - `mode=cloze` + `**…**` → 渲染出 `.memory-cloze-blank`，点击后显示答案文本；
   - `- [ ]` 清单 → 渲染出可点击项，点击后显示要点；
   - 卡内 `$…$` → 出现 `.katex`；
   - 无 mode 且无清单项 → 正文原样渲染（不是空壳）。

Commit：`fix(directives): render memory card body from source instead of lossy extraction`

## 阶段 C · 真机验证与记录

1. `/biochemistry/detail/1.2`（38 张卡，含 `mode=cloze` 与无 mode 两种）：标题不再泄漏 `mode=`；挖空显示 `?` 且点击揭示；「名解考场总清单」正文不再是空壳；卡内公式正常。
2. `/anatomy/detail/1.1`（`mode=cloze` 不带引号的写法）同样正常。
3. 聊天侧：让模型输出一个带 `**…**` 的 `:::memory{label="…" mode="cloze"}`，确认气泡内挖空可点（走 `extract()` 兜底路径时行为要写清）。
4. 控制台无新增报错；`components/shared/directives/registry.evaluation-order.test.tsx` 仍全绿（**不要削弱它**，尤其不要只断言键存在而不断言值是函数）。

Commit：`docs(plans): record plan 24 execution`

---

## 验证

- `pnpm exec tsc --noEmit`、`pnpm lint`（**0 error**）、`pnpm test:react`、完整 `pnpm test`、完整 `pnpm build`。
- 基线（计划 23 收尾实测，退出码全 0）：`pnpm lint` = 0 error / **85** warning；`pnpm test:react` = **249**；`pnpm build` = **1210** 页。新增测试会让 vitest 数变大，属正常。
- `pnpm test:content` 的失败**只记录不修**。
- `git diff --stat` 证明 `content/**` **零改动**。

## 验收标准

- 78 张 `mode=cloze` 记忆卡：标题干净、挖空可点、揭示正常。
- 记忆卡正文里的加粗、清单、KaTeX 都不再丢失。
- `normalizeDirectiveLabels` 与 `MemoryCard` 各有测试覆盖，且测试**能在缺陷复现时失败**（写完后可临时改回旧逻辑确认测试变红，再改回来——这一步要在执行记录里写清）。
- 计划 23 的分层与断环红线未被破坏。

## 风险与回滚

- **最大风险是归一化改动波及其他指令。** 全站 38683 个带花括号的指令行都会过这个函数，其中单属性形状目前是正确的，**不能被改坏**。测试必须包含「原样输出」的用例，尤其是 label 里含 `=`、空格、ASCII 引号的那些（`72c7464d`、`24738d98` 两次修复换来的行为）。
- 阶段 A、B 各自可独立 revert。
- 阶段 B 若走 `hProperties`，注意别把大段正文塞进 HTML 属性导致页面体积异常；有阈值就写清。

## 并发避让

内容 Agent 的作业域是 `content/**`、`public/images|media/**`、`lib/content-data/**` 的数据条目。本计划只碰 `lib/markdown/**`、`components/shared/directives/**` 与 `docs/**`，与之零重叠。Git 纪律照 `00-execution-contract.md` 第二节：只用显式路径提交，留在 `dev`，不推送，对方的在途脏文件原样留着。

---

# 执行记录

状态：**阶段 A / B 已执行并通过全部自动门禁；阶段 C 真机验证待人工完成**（步骤见文末）。

## 提交

| Commit | 内容 |
|---|---|
| `905794d3` | 阶段 A：归一化时保留 label/title 之后的其他属性 |
| `84150072` | 阶段 B：记忆卡正文改用 remark 写入的源文本 |
| `fdf68997` | 阶段 A 修正：属性边界改按**白名单**判定（详见下节，这一步是必需的） |

`content/**` 零改动（`git diff --stat 771e6e24..fdf68997 -- content` 为空）。

## 对计划的偏离：属性边界不能用形状匹配

计划阶段 A 第 1 条原本写「不带引号时，值的边界是「下一个 `\s+[\w-]+=`」之前」。**照此实现会制造新的回归**，`905794d3` 最初正是这么写的，`fdf68997` 把它改掉了。

原因是**结构上无法区分**「第二个属性」和「标题正文里的公式」——`mode=cloze` 与 `k=0` 长得一模一样。形状匹配会打坏两类真实写法：

| 写法 | 正文处数 | 形状匹配的输出 | 后果 |
|---|---|---|---|
| `{label=易错点：泊松分布中 k=0 不要漏掉}`（未加引号 + 公式） | 2 | `{label="易错点：泊松分布中" k=0 不要漏掉}` | 标题被截断，公式变成假属性 |
| `{label="熵"的本质}`（标题内嵌 ASCII 引号） | 21 | 在闭合引号处截断、尾部原样拼回 | 变回 remark-directive 解析不了的形状，即 `24738d98` / `72c7464d` 修掉的原始缺陷复发 |

也就是说形状匹配是「修好 78 处、打坏 23 处」。

**改法**：只把 `remarkDirectives.ts` 里真正读取的 29 个 `attrs.*` 名字当作属性边界（`KNOWN_ATTRS`），并让带引号值的边界搜索从**闭合引号之后**才开始（避免标题内含白名单词时切进引号内部，如 `{label="用 width=3 画图" mode=cloze}`）。

> 维护提醒：**新增指令属性时必须同步 `KNOWN_ATTRS`**，否则该属性会被当作标题正文吞掉。这条已写进 `00-execution-contract.md` 的不变量。

## 验证证据

**全量比对**（新旧函数在全部正文上逐行对比）：3201 个内容文件、74923 行指令行，**仅 78 行输出变化**，全部是本该修复的 `mode` 保留，其余逐字一致——既证明修好了目标，也证明没有波及其他指令（对应「风险与回滚」里的最大风险项）。

旧输出形如 `{label="“膈三孔与穿行” mode=”cloze"}`（mode 的值被卷进标题弯引号），新输出 `{label="膈三孔与穿行" mode="cloze"}`。

**生产构建产物**（`.next/server/app/anatomy/detail/1.1.html` 的 RSC payload，即端侧真实拿到的 props）：

```
"kind":"memory","label":"名词解释答题三问","mode":"cloze","raw":"…先写**位置**…"
```

标题干净、`mode="cloze"` 送达组件、`raw` 保留了 `**` 标记——两个根因均在真实产物中闭环。

**`raw` 的体积代价**（阶段 B 风险项）：711 张卡平均正文 589 字符，中位页面新增约 **1.3 KB**、最重页面 **8.1 KB**（`content/histology/textbook/ch17-1.md`），而页面本身 300 KB–5 MB，占比不到 0.5%。最大单卡 4168 字符，**8 KB 阈值从未触发**，即 711 张卡全部走保真路径，没有一张静默退回 `extract()`。

**门禁**（全部退出码 0）：

| 门禁 | 结果 | 基线 |
|---|---|---|
| `tsc --noEmit` | 0 error | 0 |
| `pnpm lint`（eslint + knip） | **0 error / 85 warning** | 0 / 85，未新增 |
| `pnpm test:unit` | 551 通过 / 0 失败 | — |
| `pnpm test:content` | 1915 通过 / 0 失败 | — |
| `pnpm test:react` | 254 通过（64 文件） | 249 → +5 为本计划新增 |
| `pnpm build` | 1210/1210 页，成功 | 1210 |

新增测试：`normalizeDirectiveLabels.test.ts` 20 例（含 4 例专钉白名单边界）、`MemoryCard.test.tsx` 5 例、`remarkDirectives.test.ts`。`registry.evaluation-order.test.tsx` 未被削弱，仍全绿。

> 构建插曲：首次 `pnpm build` 报 `ENOENT: mkdir …ch07-3.segments`。原因是**此前子智能体异常退出遗留的 dev server（PID 11028，端口 35349）仍在写同一个 `.next`**，与 build 抢目录，与本计划代码无关。清掉该进程与 `.next` 后构建通过。排查时确认另外 6 个监听端口分属用户其他项目（OldersNews / 3D-Result / real-estate-frontend / openclaw），未触碰。

## 阶段 C · 待人工完成的真机验证

自动门禁已覆盖交互逻辑本身：`MemoryCard.test.tsx` 走**真实 QuizMarkdown 管道**（含 `remarkDirectives` → `raw`），断言了挖空点击揭示、清单点击打勾、卡内 `$…$` 出 `.katex`、无 mode 时正文非空壳、以及聊天侧 `extract()` 兜底路径。

jsdom 覆盖不到的只剩两项，需要真浏览器：

1. **水合**：`raw` 把含 `**`、`$`、引号的原文送进 payload，需确认控制台无 hydration 报错。
2. **视觉**：挖空块 / 清单项的样式与展开动画。

操作步骤：

```
pnpm build   # 若 .next 已是最新可跳过
pnpm start   # 端口 35349
```

- `/biochemistry/detail/1.2`：标题不含 `mode=`；cloze 卡展开后显示 `?`，点击揭示；「名解考场总清单」展开后正文非空；卡内公式正常。
- `/anatomy/detail/1.1`：`mode=cloze` 不带引号的写法同样正常。
- `/chapters/ch02/2.2`：标题「易错点：泊松分布中 k=0 不要漏掉」**完整不截断**（白名单回归位）。
- 聊天侧：让模型输出带 `**…**` 的 `:::memory{label="…" mode="cloze"}`，确认气泡内挖空可点（走 `extract()` 兜底）。
- 全程 F12 控制台无新增报错，尤其无 hydration mismatch。
