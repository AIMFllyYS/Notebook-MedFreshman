# 交接：内容注册表收敛 — 剩余机械工作

> 分支：`refactor/content-registry-consolidation`（自 master 切出，4 个实现 commit + 1 个规划 commit）
> 规划原文：[12-content-registry-consolidation.md](./12-content-registry-consolidation.md)
> 本文给接手者（任意 AI 或人）：**核心架构已完成并验证，下面的全部是照样板复制、改文档、跑命令，不需要设计决策。**
> 每完成一小节就 commit 一次，commit message 风格照 `git log -6`。

---

## 0. 当前状态（接手前必读）

### 已完成（勿重做）

| 阶段 | Commit | 内容 |
|---|---|---|
| A 学科注册表 | `7d2fffd5` | `lib/content-data/subjects.registry.ts` 是学科唯一真相源；`SubjectId`、`SUBJECTS`、`SUBJECT_ICONS`、学年数组、AI 提示词映射全部派生；5 个组件的 `ICON_MAP` 删除改用 `components/shared/SubjectIcon.tsx`；`ChatPanel` 学科名 bug 修复 |
| B 板块能力 | `e8516900` | `Category.capabilities` / `keyStrategy`；`lib/content-data/category-templates.ts`；`lib/content/categoryKeys.ts`；page/loader/chunker/store 的 categoryId 硬编码全部移除；复习页不再硬跳 `/detail/` |
| C 录音（physics） | `216f45d1` | `lib/content-data/recordings.ts` + `physics-lectures.ts`；`PHYSICS_RECORDING_IDS` 从 lectures 派生 |
| D 一致性校验 | `2b056b33` | `scripts/check-registry-consistency.ts`，已进 `prebuild` 与 `build-desktop.mjs` |

### 验证基线

```bash
pnpm exec tsc --noEmit          # 0 error
node scripts/run-unit-tests.mjs # 2156 tests，2155 pass，1 fail（见下）
pnpm check:registry             # 0 error，84 warning（全部是存量内容问题，见 §4）
```

**唯一失败的测试** `tests/content/sophomore-textbooks.test.ts` → `cell-biology/textbook/ch08-4 有图题但没有任何图片引用`：
master 上就失败，是内容启发式误判（正文提到"图 8-x"但无图）。与本次重构无关，**不要为了让它过而改测试逻辑**，交给内容负责人处理（补图或调整正文）。

### 三份"照着抄"的样板

| 要做的事 | 样板 |
|---|---|
| 把一个学科的录音改成 lectures 声明 | `lib/content-data/physics-lectures.ts` + `manifest.ts` 第 165–166 行 |
| 新增一个板块 | `lib/content-data/category-templates.ts` 的 `STANDARD_CATEGORIES`；私有板块看 `manifest.ts` 里 `other` 学科的 `english` |
| 新增一个学科 | `subjects.registry.ts` 追加一个对象 → manifest 用 `subjectHeader(id)` + `sophomoreCategorySkeleton(...)` |

---

## 1. 阶段 C 剩余：其余四科录音迁移（纯机械）

目标：`manifest.ts` 中不再出现任何 `id: 'rec-` / `id: 'sum-` 字面量。

### 1.1 每科步骤（probability / chemistry / modern-history / maogai 各做一遍）

1. 新建 `lib/content-data/{subject}-lectures.ts`，格式同 `physics-lectures.ts`：
   ```ts
   import type { LectureMeta } from './recordings';
   export const chemistryLectures: readonly LectureMeta[] = [
     { id: '01', title: '第一讲·绪论', summaryTitle: '第一讲纪要·绪论' },
     ...
   ];
   ```
   规则：
   - `id` 取 `rec-XX` 的 `XX`（保留两位数字符串）。
   - `title` 取原 recording 条目的 title。
   - 原 summary 条目的 title 若与 recording 不同（chemistry / modern-history / maogai 都是 `第N讲纪要·…`），写 `summaryTitle`。
   - 原 summary 里**没有**对应 `sum-XX` 的讲（chemistry 缺 `sum-15`）写 `hasSummary: false`。
   - 原 recording 里没有但 summary 里有的 id：不存在这种情况，若发现请停下来问。
   - **不要**顺手改任何标题文字。
2. `manifest.ts`：把该科 `category('recording', [ ... ])` / `category('summary', [ ... ])` 两个数组字面量替换为
   `category('recording', recordingItems(xxxLectures))` / `category('summary', summaryItems(xxxLectures))`，顶部加 import。
3. 把 `*-detail.ts` 里的源文件映射并入 `source` 字段（可选，本轮允许只加 `@deprecated` 注释不迁移）：
   - `probabilityRecordings` / `maogaiRecordings` / `modernHistoryRecordings`：`Record<chapterId, txt[]>`，按章而非按讲，无法一一对应 → **保留原导出，加 `/** @deprecated 仅供旧 manifest.chapters 使用 */`**，不迁移。
   - `organicChemistryRecordings`（`rec-XX → txt`）、`organicChemistrySummaries`（`sum-XX → docx`）：可直接填到 `chemistryLectures[i].source = { transcript, minutes }`，填完后删除这两个导出，并同步改 `scripts/content/extract-docx-images.mjs` 第 22 行的注释。
4. 验证（每科做完都跑）：
   ```bash
   npx tsx scripts/gen-nav-manifest.ts && git diff --stat lib/content-data/nav.generated.json
   ```
   **期望 diff 为空**（说明派生结果与手写条目逐字一致）。若有 diff，说明 title / id 抄错，回去比对，不要接受 diff。
   ```bash
   pnpm exec tsc --noEmit
   node --import tsx --test tests/content/recordings.test.ts tests/content/manifest.test.ts tests/content/categoryCapabilities.test.ts
   pnpm check:registry
   ```
5. `tests/content/recordings.test.ts` 末尾仿照 physics 的用例，为每科加一条"manifest recording/summary 由 xxxLectures 派生"的断言。

### 1.2 验收

```bash
rg -n "id: 'rec-|id: 'sum-" lib/content-data/manifest.ts   # 期望 0 命中
```

Commit：`refactor(content): 其余四科课堂录音迁移为 lectures 声明`

---

## 2. 阶段 E：SOP 文档修正与重组（纯文档）

### 2.1 全局路径替换

在 `docs/sop/**/*.md` 中：

| 查找 | 替换为 |
|---|---|
| `content/manifest.ts` | `lib/content-data/manifest.ts` |
| `content/media.generated.ts` | `lib/content-data/media.generated.ts` |
| `content/media.ts` | `lib/content-data/media.ts` |
| `components/notes/directives.tsx` | `components/shared/directives/`（先 `ls` 确认实际文件名） |
| `app/api/section/route.ts` 的 `readContentFile` | `lib/content/loader.ts` 的 `readContentMarkdown` |

验收：`rg -n "content/manifest.ts|VALID_SUBJECTS|VALID_CATEGORIES|content/media" docs/sop` 为 0 命中。

### 2.2 `docs/sop/subject-onboarding.md` 重写（≤ 6KB）

先把现有文件**原样**移动到 `docs/refer/framework-extension.md`（§4 Markdown 指令、§5 原语组件、§6 AI XML 标签、§8 画布这些是框架开发内容，不是接入学科要看的），然后新写 `subject-onboarding.md`，只包含：

1. **注册学科**：在 `lib/content-data/subjects.registry.ts` 的 `SUBJECT_REGISTRY` 追加一个对象（字段说明照 `SubjectMeta` 接口注释；icon 必须是 `lib/ui/subjectIcons.ts` 白名单内的名字，否则 tsc 报错）。
2. **挂载内容树**：在 `lib/content-data/manifest.ts` 的 `contentTree.subjects` 追加
   ```ts
   { ...subjectHeader('xxx'), categories: sophomoreCategorySkeleton(xxxTextbookItems) }
   ```
   或手写 `categories: [category('textbook', ...), category('detail', ...), ...]`。
3. **教材条目**：由 `python scripts/ingest-sophomore-textbooks.py --subject xxx` 生成 `lib/content-data/xxx-textbook.ts`（前置：`extract-textbook-pdf.py` 产出 `content/_raw/xxx/textbook.md` 与 `textbook.toc.json`），导出名固定为 `xxxTextbookItems`（kebab → camel）。
4. **正文文件**：`content/xxx/{category}/{itemId}.md`。
5. **可选**：`lib/ai/prompts/subjects/xxx.md`（学科专属 system prompt，不写则只用 global.md）。
6. **验证**：`pnpm check:registry` 0 error；`pnpm exec tsc --noEmit`；`pnpm dev` 访问 `/xxx/textbook/ch01`。
7. **明确写出"不需要改"的清单**：`components/`、`app/`、`lib/ai/tools.ts`、`lib/constants/`、任何 `ICON_MAP`。

### 2.3 其它 SOP 的具体修改

| 文件 | 修改 |
|---|---|
| `docs/sop/README.md` | §4 路径约定表加一列"能力（capabilities）"并补 `other` 学科的 4 个板块；§6 删除 `content/manifest.ts` 行；新增"§8 新增板块"一节：标准板块改 `category-templates.ts`，学科私有板块在 manifest 写完整对象并声明 `capabilities` / `keyStrategy`，例题/Quiz/搜索是否生效由此决定；所有 SOP 的"集成验证"统一改为 `pnpm check:registry` |
| `docs/sop/01-textbook-processing.md` | Step 5 改为"运行 `ingest-sophomore-textbooks.py --subject` → manifest 挂载 → `pnpm check:registry`"；说明生成的是章→节两级树；补 `extract-textbook-pdf.py` 前置步骤 |
| `docs/sop/03-recording-processing.md` | Step 5 改为"在 `lib/content-data/{subject}-lectures.ts` 追加 `{ id, title, summaryTitle?, source? }`，rec/sum 自动生成"；删除"NN 为两位数"限制；补"完成后 `pnpm build-index` 重建检索索引" |
| `docs/sop/04-quiz-generation.md` | 补一句：quiz 生效前提是所属板块声明了 `quiz` 能力（标准板块已声明）；删除任何提到 `PHYSICS_RECORDING_IDS` 手工维护的内容 |
| `docs/sop/05-content-integration.md` | §4.2–4.4 三个"已知限制"和 §6 TODO 清单全部删除（已修复）；Step 3 验证命令改为 `pnpm check:registry` |
| `docs/sop/08-exam-paper-integration.md` | 第 141 行路径修正；§"AI 检索"段改为"考前模拟/实战演练默认无 `search` 能力，若要可搜在 `category-templates.ts` 给模板加 `'search'` 并重跑 `pnpm build-index`" |
| `docs/sops/english-unit-content-sop.md` | 移到 `docs/sop/09-english-unit-content.md`，在 README 表格登记，删除 `docs/sops/` 目录 |
| `README.md`（仓库根） | "接入新学科" 5 步改为指向新 `subject-onboarding.md`；开发指南加 `pnpm check:registry` |
| `CHANGELOG.md` | 顶部加 Unreleased 段，列 A/B/C/D 四条 + 图标变更（maogai `ScrollText→Scale`、other `Folder→FolderOpen` 采用 UI 实际值） |

Commit：`docs(sop): 对齐注册表架构，拆分接入手册与框架扩展指南`

---

## 3. 阶段 F：清理（低风险，最后做）

1. 删除 `@deprecated` 包装并修正调用方：
   - `lib/content/loader.ts` `deriveExampleKey`（先 `rg deriveExampleKey` 确认只剩 `tests/api/loader.test.ts` 在用 → 把那些用例改为调用 `deriveExampleKeyFor(category('detail', []), ...)`，或直接删除对应用例，因为 `tests/content/categoryCapabilities.test.ts` 已覆盖）
   - `lib/store.ts` `deriveChapterId`（同理，`lib/store.test.ts`）
   - `lib/constants/academic-year.ts` 的 `FRESHMAN_SUBJECT_IDS` / `SOPHOMORE_SUBJECT_IDS`（`rg` 确认无消费方后删除）
2. `lib/content-data/manifest.ts` 末尾的旧 `manifest` 对象与 `lib/content/loader.ts` 的 `getManifest` / `findChapter` / `getOutlineText` / `searchNotes` / `readSectionMarkdown`：
   先 `rg -n "getManifest\(|findChapter\(|getOutlineText|searchNotes\(|manifest\.chapters"` — 若只有 `tests/api/loader.test.ts:144` 在用，删掉那条用例后一并删除；否则保留。
3. `lib/store.ts:146-150` 与 `components/layout/AppShell.tsx` 中的 `"probability"` / `"1.1"` 默认值改为 `DEFAULT_SUBJECT`（`lib/constants/subjects.ts`）——纯替换。
4. `lib/content/loader.ts:63` 的 `subjectId === "probability" && categoryId === "detail"` 改为
   `getSubjectMeta(subjectId)?.contentRoot?.detail === "chapters" && categoryId === "detail"`。
5. **需要用户确认后才能删**（列出来即可，不要自行删除）：
   - 仓库根目录 `({`、`{`、`{img.loading`（3 个 0 字节文件）、`projectsDev-ToolsStudyReview-Platformtmpqa*.png`（3 张误存截图）
   - `docs/refer/prototype-v0.0.tar.gz`（28MB）
   - `content/probability/shizyan-yanlian/`（拼写错误目录，需与 `shizhan-yanlian` 比对内容）

Commit：`chore: 移除注册表迁移期的兼容包装与默认值字面量`

---

## 4. `pnpm check:registry` 暴露的存量内容问题（转给内容负责人，不属于本次重构）

这些是校验脚本第一次跑就发现的"文件在、UI 看不到"或反过来的情况，全部只 warning 不阻断。修完后把对应条目从 `scripts/check-registry-consistency.ts` 的 `KNOWN_ORPHANS` / `KNOWN_ORPHAN_PATTERNS` 里删掉，让规则重新生效。

| 类别 | 条目 | 含义 / 建议 |
|---|---|---|
| examples.orphan | `content/examples/chemistry/ch15/15.1` … `ch18/18.2`（10 个目录） | manifest 里这些节的 id 是 `ppt-15.1` 而目录是 `15.1`，例题 Tab 永远读不到。**把 `organic-chemistry-detail.ts` 里 `ppt-15.1` 等 10 个 id 改为 `15.1`（同时把 `content/chemistry/detail/ppt-15.1.md` 重命名为 `15.1.md`），或把目录改名**。改完后从 `tests/content/categoryCapabilities.test.ts` 的 `KNOWN_KEY_GAPS` 删除这 10 条 |
| examples.orphan | `content/examples/ch02/1.4`、`ch03/1.5`、`physics/ch06/6.1` | 目录与 item 编号不符（如 1.4 放在 ch02 下），需人工核对 |
| quiz.orphan | `content/quiz/maogai/ch06.json`、`ch10`、`ch11`、`ch13` 等 | 毛概 detail 里对应章是 stub 或不存在，quiz 无入口 |
| orphan.file | `content/chemistry/detail/ppt-1.2.md` … 41 个 | 早期 PPT 草稿未挂载；决定挂载（加 manifest 条目）或移到 `content/_raw/chemistry/` |
| orphan.file | `content/{maogai,modern-history}/detail/chXX-examples.md` | 出题脚本工作文件；建议移到 `content/_raw/{subject}/`，并更新 `scripts/gen_maogai_quiz_*.py` 里的相对路径注释 |
| orphan.category | `content/probability/shizyan-yanlian/` | 拼写错误，与 `shizhan-yanlian` 比对后合并删除 |
| registry.prompt | `modern-history` / `maogai` / `other` 无 `lib/ai/prompts/subjects/*.md` | 与迁移前一致（原 `SUBJECT_FILE` 就没有它们）；要不要补是内容决策 |
| 测试 | `cell-biology/textbook/ch08-4` 图题无图 | 见 §0 |

---

## 5. 端到端验证 / 打包（交给端测）

**不要在本分支做端测与打包前的内容修复**；本分支只保证 tsc / 单测 / check:registry 通过。端测清单：

1. `pnpm dev` 后逐个学科点开侧边栏，确认图标：毛概应为天平（Scale），其他应为打开的文件夹（FolderOpen）——这是本次唯一有意的 UI 变化。
2. 手机宽度下顶栏学科短名显示（`subjectShortName`），AI 面板标题显示学科短名（原来非物理/化学一律显示"概率论"，现在应正确）。
3. 任选 `physics/recording/rec-07`：例题 Tab 与题目测试 Tab 可用；`physics/summary/sum-07`：两者不出现（与迁移前一致）。
4. 任选 `probability/detail/1.4`：视频 / 交互 / 例题 / Quiz 四个 Tab 均可用（`section-dot` 策略）。
5. 大二任一学科 `anatomy/textbook/ch01-1`：例题 Tab、Quiz Tab（`tb-ch01`）与迁移前一致。
6. `/{subject}/review` 页"学习"按钮：对没有 detail 内容的学科（如 anatomy）应落到教材首节而不是 404。
7. AI 面板 `getOutline`：描述文字里的学科列表应为动态生成（大二上：细胞生物/生化/系统解剖/组胚/仪分；大一下：概率论/物理/有机/近代史/毛概）。
8. `pnpm build` 通过（prebuild 现在会先 gen-nav + check:registry）；`pnpm desktop:build` 同理。

### 零代码接入实证（可选，5 分钟）

按规划文档 §5 的脚本：在 registry 加 `demo-subject`、manifest 加一行、放一个 md，`pnpm check:registry` 通过且页面可访问，全程不碰 `components/ app/ lib/ai/ lib/constants/`。做完 `git checkout .` 回滚。

---

## 6. 不要做的事

- 不要把 `kaoqian-moni` / `shizhan-yanlian` 加 `search` 能力（会改变 AI 行为，需用户决定）。
- 不要为了让 `sophomore-textbooks.test.ts` 通过而放宽断言。
- 不要手改 `lib/content-data/nav.generated.json`，永远用 `pnpm gen-nav`。
- 不要在 `components/` 里新建任何学科 icon 或名字映射；只能用 `SubjectIcon` / `subjectName` / `subjectShortName`。
- 不要新增 `categoryId === '...'` 判断；用 `hasCapability(cat, ...)`。
