# 教材富文本改写循环

> **状态：任务已完成，本文归档为历史记录。** 本文记录的「大二上教材富文本改写」任务已整科收口（细胞生物学/组织学/生物化学/系统解剖学/仪器分析五科教材均已完成）。其中被真实翻车教训验证过的通用机制——反模式黑名单、闭环单元模型、并发调度铁律、机械+视觉双层验收协议、编排 prompt 骨架——已沉淀进 [`docs/sop/00-infrastructure.md`「内容生产闭环与反降质契约」](../sop/00-infrastructure.md#内容生产闭环与反降质契约)，并按内容类型分别体现在 [`01`](../sop/01-textbook-processing.md)/[`02`](../sop/02-detail-generation.md)/[`02b`](../sop/02b-detail-generation-humanities.md)/[`03`](../sop/03-recording-processing.md)/[`04`](../sop/04-quiz-generation.md) 各自的验收细节里。本文原地保留作为该任务的完整操作记录与实例，其中的具体数值（如 20–70 KB 体积区间、3680 字节黑图阈值）是医学教材这一具体任务的校准结果，不是通用默认值，不要跨领域直接套用。

这份文档把「大二上教材富文本改写」里真正能复用的做法写死。给两类读者：

1. **编排智能体**：拆任务、打包原料、验收截图、在会话压缩后从磁盘恢复。
2. **章节子智能体**：把 PDF dump 写成 NoteRenderer 能渲染的教材正文，再写例题和题目测试，并自己做浏览器端测。

项目：StudyReview-Platform。教材走 `content/{subject}/textbook/`，自定义指令由 `lib/markdown/remarkDirectives.ts` 解析，页面由 `NoteRenderer` + `.prose-notes` 渲染。

---

## 0. 一分钟同步进度

不要凭记忆报完成度。每次续跑先扫磁盘：

| 问什么 | 看哪里 |
|--------|--------|
| 这一章正文改完没有 | `content/{subject}/textbook/chXX-*.md` 字节数、`:::definition` 数量、是否还留「本章数字资源 / 第一篇 / 页码」 |
| 例题齐了没有 | `content/examples/{subject}/textbook/chXX/` 是否正好 10 个 `EX01`–`EX10` |
| 测验齐了没有 | `content/quiz/{subject}/tb-chXX.json` 的 `chapterId` 必须是 `tb-chXX` |
| 端测过了没有 | `tmp/qa/` 截图字节 ≫ 3680；肉眼能看见「定义」卡片或标题 `题目测试 · TB-CHXX` |
| 学年对不对 | 截图左侧「大二上学期」按下；`localStorage.gailvlun-academic-year = sophomore-1` |
| 开发服务器活着没有 | `GET http://localhost:35349` 应为 200。挂了再启，不要无故重启 |

**判定「这一章闭环完成」**：正文全节已重写 + 每节有有效截图 + 10 道例题 + `tb-chXX.json` + 例题页截图 + 测验页截图标题为 `TB-CHXX`。缺任何一项都不算完。磁盘上有文件、截图是黑图，不算完。

### 2026-09-01 快照

学年开关、四科注册、板块骨架（教材 / 详解 stub / 录音 stub / 纪要 stub / 考前模拟 stub / 实战演练 stub）已落地。大一内容只隐藏、不删除。

| 科目 | 章（教材树） | 正文改写 + 端测 | 例题 10 道 | 题目测试 | 状态 |
|------|-------------|-----------------|-----------|----------|------|
| 医学细胞生物学 `cell-biology` | ch01–ch18（18） | 18/18 | 18/18 | tb-ch01–tb-ch18 | **整科完成** |
| 组织学与胚胎学 `histology` | ch01–ch28（28） | 28/28 | 28/28 | tb-ch01–tb-ch28 | **整科完成** |
| 生物化学与分子生物学 `biochemistry` | 绪论 ch00 + ch01–ch27（28） | 28/28 | 28/28 | tb-ch00–tb-ch27 | **整科完成** |
| 系统解剖学 `anatomy` | 绪论 ch00 + ch01–ch09（10） | 10/10 | 10/10 | tb-ch00–tb-ch09 | **整科完成** |
| 仪器分析 `instrumental-analysis` | ch01–ch15（15） | 15/15 | 15/15 | tb-ch01–tb-ch15 | **整科完成**（扫描版 OCR；季一兵，高教社 2020） |

生物化学细目（磁盘为准，2026-09-02）：**整科完成。** ch00–ch27 各 10 道例题 + `tb-ch00`–`tb-ch27`。`bio-ch06-1.png` 仍是 3680 黑图，合格重拍是 `bio-ch06-1b.png`。

系统解剖学细目（磁盘为准，2026-09-02）：**整科完成。** 39 个教材 md；每章 10 道例题（ch00–ch09 共 100 个）+ `tb-ch00`–`tb-ch09`。最后闭环是第九章神经系统：总论 / 中枢 / 周围 / 传导通路 + 例题 + `题目测试 · TB-CH09`。中枢从 169 KB dump 压到 67 KB；传导通路未写入索引/编委/定价。

金标对照（不要用 dump 当金标）：

- 正文：`content/biochemistry/textbook/ch05-1.md`、`ch04-1.md`、`content/histology/textbook/ch19-1.md`；毛概 `content/maogai/textbook/` 第一章
- 例题：`content/examples/biochemistry/textbook/ch03/`、`content/examples/maogai/textbook/ch01/`
- 测验：`content/quiz/biochemistry/tb-ch03.json`、`content/quiz/histology/tb-ch18.json`

大二上四科医学教材改写循环（细胞生物学 → 组织学 → 生物化学 → 系统解剖学）**已整科收口。** 仪器分析（季一兵，高教社 2020，扫描版 OCR）**已整科收口**（ch01–ch15 正文 + 每章 10 道例题 + `tb-ch01`–`tb-ch15`）。详解 / 课上录音 / 课堂纪要 / 考前模拟 / 实战演练仍是 stub，不要编造。视频与可交互 HTML 仍按章评估、默认跳过。编排端最多同时 2–3 个 `general-purpose` 子智能体。编排端**禁止**代写章节正文。金标正文现可再加解剖学 `ch03-1.md`、`ch07-1.md`、`ch09-1.md` 以及仪器分析 `ch04-1.md`、`ch11-3.md`。仪器分析页图是整页 JPG，改写时只嵌有图的页；未摄入附录/参考文献/索引。

---

## 1. 子智能体提示词（复制后填槽）

下面整段可直接作为 `spawn_subagent` 的 `prompt`。花括号是槽，编排端填完再派。不要把三章塞进一个子智能体。

````markdown
你是 StudyReview-Platform 的章节改写智能体。编排端不写正文。你必须独立完成「读原料 → 整页重写 → 浏览器端测 → 例题+测验 → 再端测」这一整圈。不要用 Python 批注入 callout，不要把 dump 留在文件里再点缀几张卡片。

## 身份与禁令
- 工作区：D:\projects\Dev-Tools\StudyReview-Platform
- 开发服务器：http://localhost:35349 （已在跑就不要重启；GET 失败再告诉编排端）
- 不要改 `lib/content-data/{subject}-textbook.ts` 目录树
- 不要编造「详解 / 课上录音 / 课堂纪要 / 考前模拟 / 实战演练」
- 不要写 `::video` / `::interactive`（默许跳过；若某段动态过程值得做，只在回报里点名，不落盘）
- 不要发明教材没有的数字、RNI、ATP 产额、GLUT 成员数；以**本版教材**为准，不要用 Wikipedia / 莱宁格替换
- 标签必须带 ASCII 双引号：`:::definition{label="糖酵解"}`。禁止 `label=糖酵解`
- `:::timeline` 的条目里禁止 `$…$`（会水合失败）
- 0 字节 PNG 禁止 `::figure`；正文保留图号 + `:::note{label="电子版缺失"}`

## 槽（编排端填写）
- subjectId: {cell-biology|biochemistry|histology|anatomy|instrumental-analysis}
- 中文课名: {…}
- 章号与标题: {chXX 第X章 …}
- 本任务文件（保持路径和 H1）:
  {列出 chXX-Y.md 及对应 `# 第N节　…`}
- 原料：
  - 当前 dump：`content/{subject}/textbook/chXX-*.md`
  - 带页码切片：`content/_raw/{subject}/slices/chXX.md`（切片编码可能损坏，中文以 dump 为准，页码/插图以切片为准）
  - 金标正文：`content/biochemistry/textbook/ch05-1.md`（医学）或同学金标
  - 金标例题：`content/examples/biochemistry/textbook/ch03/EX01_….md`
  - 金标测验：`content/quiz/biochemistry/tb-ch03.json`
  - 指令语法：`lib/markdown/remarkDirectives.ts`、`lib/markdown/calloutTypes.ts`
- 插图根：`public/images/{subject}/textbook/`
  - 非空文件清单（文件名 + 字节）: {编排端贴表}
  - 0 字节跳过: {列表}
  - 你必须用 Read 打开非空 PNG，按画面匹配「图X-N」，不要信 dump 里已经写错的 src
- 浏览器：
  - session 名：{biochXX / hischXX / anaXX}，例题阶段加 `ex` 后缀
  - 可执行文件：`C:\Users\AIMFl\AppData\Roaming\npm\node_modules\agent-browser\bin\agent-browser-win32-x64.exe`
  - 一律 `--session {name}`；`eval` 一律 `--stdin`；不要 `npx`，不要 PowerShell 里 `python -c` 套引号（改写 `.py` 文件再运行）
- 截图路径：`tmp/qa/{prefix}-chXX-Y.png`、`…-examples.png`、`…-quiz.png`
- URL：`http://localhost:35349/{subject}/textbook/chXX-Y`
- 学年：`localStorage` 键 `gailvlun-academic-year` = `sophomore-1`（大二上学期）

## A. 正文重写
对每一个指定 md：
1. 读完全部原料，按教材结构重写成干净 Markdown。删掉：页眉「第N篇」、页码、「本章数字资源」、「动画」占位、作者行、被吞进来的下一章/下一篇前言、索引。
2. H1 后写 2–4 句导读，然后是完整教材散文，不是提纲。
3. 教材里的定义、对比、流程、易错点分别落成指令块，密度对齐金标（一节常见十几到几十个 `:::definition`，外加 compare / pitfall / insight / keypoint / concept / memory）。
4. 插图用叶子指令（两个冒号，一行）：
   `::figure{src="/images/{subject}/textbook/p0XXX_YY.png" caption="图m-n　…" alt="…"}`
5. 公式用 KaTeX `$…$` / `$$…$$`，化学式用 `$\mathrm{NAD}^{+}$`。
6. 可用指令（只写会渲染的）：
   - 容器：`:::definition` `:::theorem` `:::example` `:::insight` `:::pitfall` `:::note` `:::tip` `:::memory` `:::derivation` `:::timeline` `:::event` `:::concept` `:::compare` `:::cause-effect` `:::keypoint`
   - 叶子：`::figure` `::plot` `::video` `::interactive` `::map`（后三个本任务默认不写）
7. 目标体量：干净重写通常每节 20–70 KB。仍是 4–12 KB 且几乎没有 definition，就是 dump。单文件突然 100 KB+ 还夹着索引/篇序，是吞了后文，必须删。

## B. 正文端测（写完立刻做，不要攒）
1. 命名 session 打开对应 URL。第一次 `open` 常 ETIMEDOUT，页面可能已经落地——先 `get url`。若是 `about:blank`，再 open。不要在 open 之前 `set viewport`（会把 URL 打回空白页）。
2. `eval --stdin` 写入学年。确认左侧「大二上学期」按下。
3. 等到正文里出现「定义」卡片，再截图。截图必须 ≫ 3680 字节。3680 左右的黑图是失败，换 session 名重拍，**不要覆盖已经合格的 PNG**。
4. 用 `eval --stdin` 检查：callout 数量、`img` 的 `naturalWidth===0`、是否泄漏「第一篇」「本章数字资源」。
5. 关 session。

## C. 例题（正文端测通过后再写）
路径：`content/examples/{subject}/textbook/chXX/EX01_….md` … `EX10_….md`
（`deriveExampleKey("textbook","chXX-1")` → `{chapterId:"textbook", sectionId:"chXX"}`）

每个文件只有一个：

```markdown
:::example{label="用一句话写出考点"}
**题目**：把本节若干事实和陷阱串成一长问。
**解**：点名「教材 definition / pitfall / insight / compare」，可附小表。
易错点：…
:::
```

禁止脱离教材发挥。覆盖本章真正的分户和陷阱，不要十道题重复同一句话。

## D. 题目测试
路径：`content/quiz/{subject}/tb-chXX.json`
`deriveChapterId("textbook","chXX-1")` → `tb-chXX`。绪论 `ch00-1` → `tb-ch00`。页面标题必须是 `题目测试 · TB-CHXX`，不能串到上一章。

约定（医学教材这一轮的稳定配比）：
- `subjectId`、`chapterId`、`generatedAt`
- `examConfig.totalPoints = 100`，`timeLimit = 45`，`source` 列出本章全部 md
- 14 题：7 单选（5 分，`answer` 为 0-index 整数）+ 2 多选（8 分，`answer` 为 number[]）+ 2 判断（5 分，`options: ["错误","正确"]`，1=对 0=错）+ 1 填空（10 分，5 空）+ 2 简答（14+15）
- 难度：10 basic / 3 medium / 1 hard；`source: "current_chapter"`
- JSON 里的 KaTeX 要双反斜杠：`$\\mathrm{Asn}$`
- 判断题可以把多句错误捆在一起，只要解释逐句拆穿
- 简答以「参考答案：」开头，并带 `scoring_criteria`

## E. 例题 / 测验端测
新 session `{name}ex`。打开任一本章 textbook URL → 点「例题」截图 → 点「题目测试」截图。测验标题必须是 `TB-CHXX`。尽量不要点「查看提示」（会变成已作答 1/14）。例题列表首屏可能只渲染 5–6 张卡片（LazyVisible），API/目录仍应是 10 道；点开第一张让「题目/解」可见即可。

## 回报
文件字节数、definition/figure 数量、图号→文件名对照、跳过的空图、各 PNG 字节数、测验 `chapterId`、是否跳过视频。不要只说「已完成」。
````

---

## 2. 编排经验（为什么这样能做完、之前为什么散架）

### 2.1 失败模式（已经付过学费）

- **PyMuPDF dump 当教材**：换行碎、页眉页码进正文、`:::definition` 插在半句中间。用户原话是「所有的富文本全都散架了」「连最基础的 MD 都没有转换过来」。
- **Python 批注入 callout**：体积几乎不变，卡片套在 dump 上，NoteRenderer 看起来仍是一堵墙。禁止再走这条路。
- **编排端自己写 80 章**：上下文会被切片和金标撑爆，质量必然滑坡。约定：**1 个章节子智能体负责一整圈**；编排端只打包、派发、按截图验收。
- **一章尚未端测就派例题**：测验 `chapterId` 会串章，截图标题变成 `TB-CH16` 实际是第 17 章。
- **相信子智能体的口头「完成」**：有的进程在写完文件后死于代理流错误（`cli-chat-proxy` / `reqwest`），回报丢失；有的截了 3680 字节黑图仍报成功。**磁盘 + 截图才是真相。**

### 2.2 拆任务

- 默认 **1 智能体 = 1 整章（该章全部「节」文件）**。
- 拆开的信号：切片 > ~40 KB，或 ≥4 个节文件，或单节 dump 已经 >15 KB 且概念密度高（糖代谢有氧氧化、胚胎发生总论、心血管发生）。拆开后例题/测验仍按**整章**出一份 `tb-chXX.json`。
- 并行上限 **2–3**。再多会抢 named session、打爆本机 Chrome，Next 热更新也更爱把页面打成空白。
- 顺序：细胞生物学 → 组织学 → 生物化学 → 系统解剖学。不要回头改已验收章，除非截图证明回归。
- 正文通过后再派例题。允许「第 N 章例题」与「第 N+1 章正文」并行。

### 2.3 打包（编排端唯一该写的东西）

给子智能体的 prompt 里直接贴：

- 文件路径与必须保留的 H1
- 切片路径 + 页码范围
- 金标路径（点名 1 个正文 + 1 个例题 + 1 个测验，不要把三章金标全文塞进 prompt）
- **插图表：文件名、字节、疑似图号、0 字节列表**
- session 名、截图文件名、URL、学年键
- 这一章特有的陷阱（例如：酶是 7 大类含易位酶；钠钾氯镁交给病理生理学；本版 B-DNA 直径 2.37 nm 不是口诀 2 nm；ch06-2 文末不要留「第二篇」前言）

编排端可以跑 `tmp/qa/slice_*.py` 从 `<!-- Page N -->` 切原料，**不可以**用脚本改章节正文。

### 2.4 学年、路径、ID

- 学年：`freshman-2` / `sophomore-1`；存储键 `gailvlun-academic-year`；默认大二上。切换只过滤，不删文件。
- 大二科目：`cell-biology` `biochemistry` `anatomy` `histology` `instrumental-analysis`（`lib/constants/academic-year.ts`）。
- 仪器分析是扫描版：dump 来自 RapidOCR；页图是 `pXXXX_01.jpg` 整页扫描，改写时只嵌真正有谱图/仪器结构的页面，不要 400 张整页全塞进去。不要摄入附录/参考文献/索引。
- 例题目录：`content/examples/{subject}/textbook/chXX/`。
- 测验：`content/quiz/{subject}/tb-chXX.json`。`ch00` 绪论 → `tb-ch00`。
- 插图 URL 前缀：`/images/{subject}/textbook/`。
- 标题里的 NUL `\x00` 必须清掉（曾用 `scripts/strip-nul-titles.py`），否则侧栏和 H1 会乱码。

### 2.5 浏览器端测（Windows 实装）

- 用本地 `agent-browser-win32-x64.exe`，不要 `npx`（这里会 EINVAL）。
- `--session` 必须唯一。编排端自己截图经常落到 `about:blank`，**不要拿编排端的空白页当失败证据**；以子智能体 named session 的 PNG 为准。
- `eval --stdin` 传 JS。PowerShell 里不要嵌套引号的 `python -c`。
- Next.js 开发态左下角「N 1 Issue」水合警告经常是框架自己的，不是正文错误。全页灰块可能是 `content-visibility` 截图伪影——滚动后再截一张即可，不要为此重写正文。
- KaTeX 的 `innerText` 重复是无障碍副本，不是正文复读。

### 2.6 质量门槛（验收时就看这些）

正文截图里必须能看到自定义卡片（定义 / 易错点 / 对比表），而不是纯 dump 长文。测验截图标题必须是本章 `TB-CHXX`。例题「解」要引用教材指令名。空图不得出现破图图标。

---

## 3. 运行卡顿

这一轮单次会话经常走到 6–7 小时，不是因为「模型写得慢」这一条，而是 **等待 + 浏览器 + 会话压缩 + 环境坑** 叠在一起。下面按 (a)(b)(c)(d) 写。

### (a) 经常卡住的地方

1. **agent-browser 启动与第一跳**  
   Windows 上 `npx agent-browser` → EINVAL；`spawnSync ETIMEDOUT`；`set viewport` 之后 URL 变 `about:blank`；截到 3680 字节黑图（空标签页）。子智能体在这里会空转十几分钟还以为页面没挂载。

2. **等「三个子智能体全部结束」**  
   一章例题 12 分钟结束，另一章正文 25 分钟，编排端若 `wait` 全部，空等 13 分钟。乘上几十章就是小时级浪费。会话一压缩，三个 `subagent_id` 变成 `not_found`，编排端以为全死了，又去重新探索目录。

3. **会话压缩 / 代理流断开**  
   子智能体写完文件甚至截完图，回报阶段死于 `cli-chat-proxy` / `reqwest`「error sending request」。编排端拿不到结语，于是重做同一章，或把已合格截图覆盖成黑图（ch06-1 就是这样：先有合格页，后被 3680 黑图盖掉）。

4. **上下文被原料撑满**  
   子智能体把整章切片（生物化学 ch07 切片约 100 KB）、三份金标全文、十几张图的 vision 全部读进同一轮，到端测时 token 已经 30%+，后面开始摘要式偷懒——这会表现为「定义很少、散文被提纲替换」，需要整章作废重来。

5. **PowerShell 命令写法**  
   `python -c` 里的 `for` / 嵌套引号直接被 PowerShell 解析器打回 `IncorrectValueForCommandParameter`。子智能体反复换写法，看起来像「卡死在列目录」。

6. **开发服务器自己死**  
   `next dev` 在本机跑满约 10 小时会挂。子智能体还在 `open localhost:35349`，全部超时。编排端若此时再 `pnpm dev` 抢端口，会更乱。

7. **任务切得太大**  
   一个智能体扛「糖代谢 8 节」或「胚胎发生 7 节」时，写到第 5 节开始漏图、漏定义。不是浏览器卡，是质量卡死，最后整单重做。

8. **重复端测**  
   同一 URL 截主图、局部图、滚动图、再 eval 一遍计数，浏览器阶段占单章 30–50% 墙钟时间。

### (b) 卡住时怎么处理

| 现象 | 处理 |
|------|------|
| 子智能体 `not_found` / 流错误 | **先扫磁盘**。正文/例题/测验/截图在，就按文件验收，不要重写。只缺截图就 `resume_from` 只跑浏览器，或另派一个「只端测」的短任务。 |
| PNG ≈ 3680 或纯黑 | 视为失败。新 session 名重拍。**禁止覆盖**已经 >100 KB 且肉眼合格的旧图。 |
| URL 为 `about:blank` | 再 `open` 一次。不要先 `set viewport`。仍空白则换 session。 |
| `npx` EINVAL / spawnSync 超时 | 改本地 exe；超时后先 `get url`，多数时候页面已在。 |
| GET 35349 失败 | 只重启这一件事：`$env:CI="true"; node node_modules/next/dist/bin/next dev -p 35349`。不要顺手重启 pnpm 全家桶。 |
| 正文体积几乎没涨、definition < 5 | 判定为 dump 注入，杀掉重派，不要在原文件上继续打补丁。 |
| 单文件突然 100 KB+ 且含目录/篇序 | 删后文，只留本章。组织学 ch28-4、生物化学 ch27-5 都是这个坑。 |
| PowerShell 解析失败 | 把逻辑写成 `tmp/qa/*.py` 再 `python tmp/qa/….py`。 |
| 超过约 8 分钟没有任何新文件 | 视为卡死。看磁盘决定 resume 还是杀。不要无期限 `wait`。 |
| 编排端自己的空白截图 | 忽略。 |

### (c) 如何校验（不要用「智能体说做完了」）

硬校验，编排端自己跑，不开浏览器也能做完前四条：

1. **体积**：重写节通常 20–70 KB；仍 <12 KB 当可疑 dump。
2. **指令**：`:::definition` 应明显多于 dump（金标一节常 10–40 个）；`label="` 必须有引号。
3. **垃圾标记**：不应再出现「本章数字资源」「第一篇」「第N篇 」「（作者名）」；H1 不应含 `\x00`。
4. **测验 JSON**：`chapterId === "tb-chXX"`，14 题，`summary.totalQuestions === 14`，分值合计 100。
5. **例题数**：目录内正好 10 个 md，且各含一个 `:::example{label="…"}`。
6. **截图字节**：合格页常见 140–250 KB；3680 一律失败。
7. **截图内容**（必须肉眼看，不能只看体积）：学年「大二上学期」、定义卡片或测验标题 `TB-CHXX`、插图不是破图。
8. **活页**：对 URL 做 GET，确认 200。服务器挂了，截图再漂亮也不算本轮可回归。

建议每次续跑先写（或更新）一段「快照表」到对话里，避免压缩后重新 `list_dir` 半小时。

### (d) 如何加快，同时不把质量做回去

保质底线不变：每章仍要「整页重写 + 浏览器端测 + 例题 + 测验」。加速来自少做**无效动作**，不是少做圈。

1. **按槽位轮转，不要 wait-all**  
   三个在跑时，谁先落盘谁先验收，立刻补下一个。目标是始终 2–3 个活槽，而不是三个人一起打卡下班。

2. **压缩后从磁盘恢复，不从记忆恢复**  
   子智能体 handle 丢失是正常的。用第 0 节的表同步。这能省掉每次「继续」后 20–40 分钟的探索。

3. **瘦包**  
   金标只点名路径，让子智能体自己读一份。插图由编排端先列出「非空/空文件」，子智能体只 vision 非空的。不要把 100 KB 切片全文贴进 prompt。

4. **提前拆章**  
   糖代谢、脂质、生物氧化、基因表达这类章，一上来就按 1–4 节 / 5–8 节拆，避免写到一半作废。

5. **端测收口**  
   每节 **一张** 主截图；只有小结在首屏外才加一张 `*-end.png`。不要为每张插图再截一张局部。eval 一次计数即可。

6. **合格截图视为不可变**  
   重拍必须用新文件名。这能避免 ch06-1 那种「修好又拍黑」。

7. **例题任务不要再读切片**  
   正文已经是金标 Markdown。例题智能体只读 `chXX-*.md` + 一份例题金标 + 一份测验金标。

8. **缺的只补缺的**  
   ch04 现在只缺两张端测图，不要重写 10 道例题。ch06-1 只缺一张合格截图。

9. **视频/交互继续默认跳过**  
   动态过程（视循环、三羧酸、GLUT4 转位）只在回报里记一笔。这一轮的时间应该花在 20 多章尚未改写的正文上。

10. **本机环境**  
    固定端口 35349；`CI=true` 减少 Next 交互式开销；子智能体不要装依赖、不要 `pnpm install`、不要动 desktop 打包。

按上面做，单章墙钟应从「一个智能体 20–40 分钟且经常作废」降到「正文 12–20 分钟 + 例题 8–12 分钟，作废率明显下降」。整科不会变成几分钟，但 6–7 小时空转会少很多。

---

## 4. 与现有 SOP 的关系

- SOP 01（教材解析）负责 PDF → dump / 图片。**本循环从 dump 之后开始**，不替代 MinerU/PyMuPDF。
- SOP 02（详解）本轮不生产。大二四科详解保持 stub。
- SOP 04（测验）的「50% 滚动复习 / 读详解」在大二教材这一轮改成：**100% 当前教材章，因为详解不存在。** 题型配比用第 1 节提示词里的 14 题模板。
- SOP 06 桌面打包不要在改写循环里动。

---

## 5. 续跑检查清单

1. `GET http://localhost:35349` 是否 200。
2. 按第 0 节表格更新快照，找出「文件在、截图缺」的章，优先补端测。
3. 保持 2–3 个活槽：生物化学剩余章 → 系统解剖学。
4. 每收下一批，只把**截图合格**的章标完成。
5. 会话明显变长、开始丢 subagent handle 时：停派新的长任务，先把磁盘快照写进对话，再继续。
