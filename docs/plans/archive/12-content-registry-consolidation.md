# 内容注册表收敛与"零代码接入"修复规划

> 目标：让「新增教材 / 新增课堂录音 / 新增板块」三条核心增量路径真正做到**只写 Markdown + 改一个注册表，不改业务代码**。
> 依据：2026-09 对 `lib/`、`app/`、`components/`、`scripts/`、`docs/sop/` 的全量审查（三条路径分别追踪到文件与行号）。
> 本文是执行规格，不是研究报告：每一阶段都给出改哪个文件、改成什么、如何验证、什么时候 commit。

---

## 0. 现状诊断摘要

### 0.1 三条路径与理想状态的差距

| 路径 | 理想动作 | 当前实际必须碰的位置 | 结论 |
|---|---|---|---|
| 新增录音（现有学科） | 2 个 md + 1 条注册 | `manifest.ts` 的 `recording` 和 `summary` 各手写一条（标题重复）；重跑 `gen-nav`；physics 额外要改 `lib/quiz/physicsRecordingQuality.ts` 的 `PHYSICS_RECORDING_IDS` 白名单和 `tests/content/physicsRecordingQuizQuality.test.ts` 的 `length === 25` 断言 | 接近达标，两处硬编码 |
| 新增教材（新学科） | 若干 md + 1 个注册表 | `lib/types/content.ts`（联合类型 + 数组）、`lib/constants/subjects.ts`（3 个 Record）、`lib/constants/academic-year.ts`、`lib/ai/prompts/index.ts` `SUBJECT_FILE`、`manifest.ts`、`scripts/ingest-sophomore-textbooks.py` `BOOKS`；再加 **5 个组件各自的 `ICON_MAP`**、`components/chat/ChatPanel.tsx:84` 学科名三元表达式、`lib/ai/tools.ts:61` 描述文字；最后手动重跑 `gen-nav` 与 `build-index` | 不达标，同一信息散落 10+ 处 |
| 新增板块 | manifest 加 1 个 category | 路由层已 manifest 驱动（页面能打开）；但例题 / Quiz / 视频 / 交互 / AI 搜索 / AI 大纲全部由 `categoryId` 的 `Set` 或 `if` 分支决定，分布在 `page.tsx:70`、`loader.ts:143/288/295`、`lib/ai/indexing/chunker.ts:19`、`lib/store.ts:55-65,157-158` | 半达标："能看不能用" |

### 0.2 重复维护清单（修复对象）

**学科元数据**

| 信息 | 当前位置（重复次数） |
|---|---|
| 学科 ID 全集 | `SubjectId` 联合类型 + `SUBJECT_IDS` 数组（2） |
| 学科中文名 | `SUBJECTS`（constants）、manifest 每个 `subject.name`、`ChatPanel.tsx:84-86` 三元表达式（3；后者对新学科回退成"概率论"，是 bug） |
| 学科短名 | `MobileTopBar.tsx:32-43` `SHORT_NAMES`（1，且只在这里） |
| 学科 icon 名 | `SUBJECT_ICONS`（constants）与 manifest `icon` 字段**两份且已不一致**：maogai `ScrollText` vs `Scale`，other `Folder` vs `FolderOpen`；再加 `MobileTopBar.tsx:52-64` 又内联一份 mapping（3） |
| icon 名 → lucide 组件 | `SubjectSidebar`、`HomeBookshelf`、`MobileTopBar`、`MobileChapterPicker`、`GlobalSettings` 各一份 `ICON_MAP`（5） |
| 学年归属 | `academic-year.ts` 两个数组、`lib/ai/tools.ts:61` 描述文字、`scripts/build-index.ts:191` 日志、3 个测试文件（6+） |
| AI 提示词文件 | `SUBJECT_FILE` 映射 + `prompts/subjects/*.md` 文件存在性（2） |
| 教材 TS 导出名 | `scripts/ingest-sophomore-textbooks.py` `BOOKS` 字典 + `manifest.ts` import（2） |
| 导航树 | `manifest.ts` → `nav.generated.json`（生成物，`gen-nav` 不在 prebuild） |

**板块元数据 / 能力开关**

| 能力 | 硬编码位置 |
|---|---|
| 例题 Tab 预读 | `app/[subject]/[category]/[id]/page.tsx:70` `EXAMPLE_CATEGORIES` |
| 例题目录推导 | `lib/content/loader.ts:143-159` `deriveExampleKey`（含 `/^rec-\d{2}$/` 两位数限制） |
| Quiz / 视频 / 交互 key 推导 | `lib/store.ts:55-65` `deriveChapterId`；`setActiveRoute` 内 `categoryId === "detail" ? itemId : ""` |
| AI 搜索范围 | `lib/content/loader.ts:295` 与 `lib/ai/indexing/chunker.ts:19` 各一份 `SEARCHABLE_CATEGORIES` |
| AI 大纲中文标签 | `lib/content/loader.ts:288-293` `CATEGORY_LABEL`（仅 4 个） |
| 板块骨架 | `sophomore-categories.ts` 硬编码 6 个；`manifest.ts:16-31` `examPlaceholderCategories`；`tests/content/sophomore-textbooks.test.ts:10` `BLOCKS` 断言恰好 6 个 |
| 复习页入口 | `app/[subject]/review/page.tsx:121` 硬跳 `/detail/` |
| 默认板块 | `lib/constants/subjects.ts:18-23` `DEFAULT_CATEGORIES`、`:60` `DEFAULT_CATEGORY` |

**录音**

| 问题 | 位置 |
|---|---|
| rec / sum 标题成对手写 | `manifest.ts` 各学科 `recording` 与 `summary` items（physics 27 讲 = 54 行） |
| 录音源文件映射形态不一 | probability / maogai / modern-history 是 `Record<chapterId, txt[]>`，chemistry 是 `Record<recId, txt>` + `Record<sumId, docx>`，physics 无 |
| 录音例题、题库白名单 | 仅 physics 有 `content/examples/physics/recording/` 与 `PHYSICS_RECORDING_IDS` |

### 0.3 SOP 文档过期点

| 文档 | 过期内容 |
|---|---|
| 01 / 03 / 05 / 08 / subject-onboarding | 注册路径写 `content/manifest.ts`，实际 `lib/content-data/manifest.ts`；`docs/sop/README.md` §6 两条并列，自相矛盾 |
| subject-onboarding 开头与附录 | `SubjectId` 6 个（实际 11）；`VALID_SUBJECTS` / `VALID_CATEGORIES`（已删除）；`content/media.ts` / `content/media.generated.ts`（实际在 `lib/content-data/`）；`components/notes/directives.tsx`、`app/api/section/route.ts readContentFile`（已迁移） |
| 05 §4.2–4.4、§6 | getOutline / getSection / searchNotes 三个"已知限制"均已修复，文档仍标 TODO |
| 01 Step 5 | 只讲平铺 item；大二 5 科实际走 `extract-textbook-pdf.py → ingest-sophomore-textbooks.py` 生成两级树，SOP 未提 |
| 03 / 04 | 未提 `PHYSICS_RECORDING_IDS`、未提 `gen-nav` / `build-index` 必须重跑 |
| subject-onboarding 整体 | 27KB 里一半是 AI XML 标签 / 原语 / CanvasBlock 的框架开发内容，与"接入学科"无关 |
| 目录 | `docs/sop/` 与 `docs/sops/` 并存；`docs/refer/` 有 28MB `prototype-v0.0.tar.gz` 和两个乱码文件名 md |

---

## 1. 目标与非目标

### 目标（验收标准）

完成后必须同时满足：

1. **新增学科**：只需 (a) 在 `lib/content-data/subjects.registry.ts` 追加一个对象；(b) 新建 `lib/content-data/{subject}-textbook.ts`（可由脚本生成）；(c) 放 md 到 `content/{subject}/...`；(d) 可选放 `lib/ai/prompts/subjects/{subject}.md`。不需要碰任何 `components/`、`app/`、`lib/ai/`、`lib/constants/` 文件。
2. **新增录音**：只需 (a) 在该学科的 `recordings` 数组追加一条 `{ id, title }`；(b) 放 `rec-XX.md` / `sum-XX.md`；(c) 可选放例题目录和 quiz json。不需要改任何白名单或测试。
3. **新增板块**：只需在 manifest 的 `categories` 追加一个带 `capabilities` 的对象，例题 / Quiz / 搜索 / 大纲 / 中文标签自动按声明生效。
4. 上述三条路径**漏做任何一步都在 `pnpm build` 的 prebuild 阶段失败**，而不是线上出现空页或 404。
5. `nav.generated.json` 不再需要手动重跑。
6. `docs/sop/` 的路径、步骤与代码一致，且 subject-onboarding 只讲接入。

### 非目标

- 不改内容 md 的格式与指令语法。
- 不改 `content/chapters/` 概率论特例目录（保留 loader 的一处 if，但收敛到注册表里声明 `contentRoot` 覆盖）。
- 不重做检索索引算法；只保证新板块能被纳入索引。
- 不动 Electron 打包、渲染架构、AI 对话协议。

---

## 2. 目标架构

### 2.1 单一真相源：`lib/content-data/subjects.registry.ts`

```ts
// lib/content-data/subjects.registry.ts
import type { AcademicYearId } from '@/lib/constants/academic-year';

export interface SubjectMeta {
  id: string;
  name: string;
  shortName: string;
  icon: string;              // lucide 图标名，白名单见 lib/ui/subjectIcons.ts
  color: string;
  year: AcademicYearId;
  promptFile?: string;       // 相对 lib/ai/prompts/，缺省则 subjects/{id}.md 存在即用
  contentRoot?: {            // 仅概率论用：detail 走 content/chapters
    detail?: 'chapters';
  };
}

export const SUBJECT_REGISTRY = [
  { id: 'probability', name: '概率论与数理统计', shortName: '概率论', icon: 'Calculator', color: '#6366f1', year: 'freshman-2', contentRoot: { detail: 'chapters' } },
  { id: 'physics',     name: '大学物理',        shortName: '物理',   icon: 'Atom',       color: '#0ea5e9', year: 'freshman-2' },
  // ...
] as const satisfies readonly SubjectMeta[];

export type SubjectId = (typeof SUBJECT_REGISTRY)[number]['id'];
export const SUBJECT_IDS: readonly SubjectId[] = SUBJECT_REGISTRY.map((s) => s.id);
export const SUBJECT_BY_ID: Record<SubjectId, SubjectMeta> = Object.fromEntries(SUBJECT_REGISTRY.map((s) => [s.id, s])) as never;
export function isSubjectId(v: unknown): v is SubjectId { return typeof v === 'string' && v in SUBJECT_BY_ID; }
export function subjectName(id: string): string { return SUBJECT_BY_ID[id as SubjectId]?.name ?? id; }
```

派生关系（改造后全部**只读**它）：

| 原位置 | 改造后 |
|---|---|
| `lib/types/content.ts` `SubjectId` / `SUBJECT_IDS` / `isSubjectId` | 从 registry re-export，文件保留以免改 import 路径 |
| `lib/constants/subjects.ts` `SUBJECTS` / `SUBJECT_ICONS` / `SUBJECT_COLORS` | 用 `Object.fromEntries` 从 registry 派生并 re-export；删除 `DEFAULT_CATEGORIES` |
| `lib/constants/academic-year.ts` `FRESHMAN_SUBJECT_IDS` / `SOPHOMORE_SUBJECT_IDS` | 从 registry 按 `year` filter 派生 |
| `lib/ai/prompts/index.ts` `SUBJECT_FILE` | 删除；`buildSystemPrompt` 用 `meta.promptFile ?? subjects/${id}.md`，文件不存在返回空串（现有 `readMd` 已兼容） |
| `manifest.ts` 每个 subject 的 `name` / `icon` | 删除字面量，改为 `...subjectHeader('physics')`，或 `contentTree` 由 `SUBJECT_REGISTRY.map` 生成后再挂 categories |
| `MobileTopBar.tsx` `SHORT_NAMES` + 内联 mapping | 删除，读 `SUBJECT_BY_ID[id].shortName` |
| `ChatPanel.tsx:84-86` | `subjectName(chatContext?.subjectId)` |
| `lib/ai/tools.ts:61` getOutline 描述 | 由 registry 按学年拼接字符串 |
| `scripts/build-index.ts:191` | 从 registry 统计 |

### 2.2 icon 集中：`lib/ui/subjectIcons.ts` + `components/shared/SubjectIcon.tsx`

```ts
// lib/ui/subjectIcons.ts —— 唯一允许 import lucide 学科图标的地方
import { Calculator, Atom, FlaskConical, BookOpen, Scale, ScrollText, Folder, FolderOpen, Microscope, Dna, Bone, Layers, ScanLine } from 'lucide-react';
export const SUBJECT_ICON_COMPONENTS = { Calculator, Atom, FlaskConical, BookOpen, Scale, ScrollText, Folder, FolderOpen, Microscope, Dna, Bone, Layers, ScanLine } as const;
export type SubjectIconName = keyof typeof SUBJECT_ICON_COMPONENTS;
```

`SubjectMeta.icon` 类型收紧为 `SubjectIconName`，registry 里写错图标名直接 tsc 报错。`SubjectIcon` 组件接受 `subjectId` + `size` + `className`，五个 layout 组件全部替换为它并删除本地 `ICON_MAP`。

### 2.3 板块能力声明：`Category.capabilities`

```ts
// lib/types/content.ts
export type CategoryCapability = 'examples' | 'quiz' | 'search' | 'media';

export interface Category {
  id: string;
  name: string;
  items: ContentItem[];
  /** 缺省 = []（只读正文 + AI 当前页）。 */
  capabilities?: readonly CategoryCapability[];
  /** 例题 / quiz 的 key 推导策略；缺省 'item'。 */
  keyStrategy?: 'item' | 'section-dot' | 'chapter-prefix';
}
```

| 能力 | 替代的硬编码 |
|---|---|
| `examples` | `page.tsx:70` `EXAMPLE_CATEGORIES`；`deriveExampleKey` 的 categoryId 分支 |
| `quiz` | `store.ts deriveChapterId` 的 categoryId 分支 |
| `search` | `loader.ts:295` 与 `chunker.ts:19` 的 `SEARCHABLE_CATEGORIES`；`getMultiSubjectOutline` 的过滤 |
| `media` | `setActiveRoute` 里 `activeSectionId` 只在 detail 有值的判断（视频 / 交互 Tab 是否按 section 查找） |
| `name` | `loader.ts:288` `CATEGORY_LABEL`（直接用 `cat.name`） |

`keyStrategy` 收编现有三种推导：

| 策略 | 现有行为 | 适用 |
|---|---|---|
| `item` | key = itemId | recording、english |
| `section-dot` | `"3.2"` → chapter `ch03`，section `3.2` | detail |
| `chapter-prefix` | `ch05-2` / `tb-ch05` → `tb-ch05` | textbook |

新增公共函数 `lib/content/categoryKeys.ts`：

```ts
export function deriveContentKey(cat: Category, itemId: string): { chapterId: string; sectionId: string; quizId: string }
```

`page.tsx`、`loader.ts deriveExampleKey`、`store.ts deriveChapterId` 三处都调它；旧函数保留为薄包装并标 `@deprecated`，下一阶段删除。

标准板块模板放入 `lib/content-data/category-templates.ts`：

```ts
export const STANDARD_CATEGORIES = {
  textbook:        { name: '教材',     capabilities: ['examples', 'quiz', 'search'], keyStrategy: 'chapter-prefix' },
  detail:          { name: '详解',     capabilities: ['examples', 'quiz', 'search', 'media'], keyStrategy: 'section-dot' },
  recording:       { name: '课上录音', capabilities: ['examples', 'quiz', 'search'], keyStrategy: 'item' },
  summary:         { name: '课堂纪要', capabilities: ['search'] },
  'kaoqian-moni':  { name: '考前模拟', capabilities: [] },
  'shizhan-yanlian': { name: '实战演练', capabilities: [] },
} as const;
export function category(id: keyof typeof STANDARD_CATEGORIES, items: ContentItem[], overrides?: Partial<Category>): Category
export function stubCategory(id: keyof typeof STANDARD_CATEGORIES): Category   // 替代 examPlaceholderCategories / STUB_ITEM
```

`sophomore-categories.ts` 改为 `STANDARD_CATEGORY_ORDER.map(...)`，不再手写 6 个；`tests/content/sophomore-textbooks.test.ts:10` `BLOCKS` 改为读 `STANDARD_CATEGORY_ORDER`。

### 2.4 录音单点声明

```ts
// lib/content-data/recordings.ts
export interface LectureMeta {
  id: string;            // '28'，不含 rec-/sum- 前缀，允许任意位数
  title: string;         // '第二十八讲·xxx'
  summaryTitle?: string; // 缺省 = title
  hasSummary?: boolean;  // 缺省 true
  source?: { transcript?: string; minutes?: string };  // 收编 *Recordings / *Summaries 映射
}
export function recordingItems(l: LectureMeta[]): ContentItem[]   // → rec-XX
export function summaryItems(l: LectureMeta[]): ContentItem[]     // → sum-XX
```

各学科 manifest 改为：

```ts
category('recording', recordingItems(physicsLectures)),
category('summary',   summaryItems(physicsLectures)),
```

`physicsLectures` 等数组放在 `lib/content-data/{subject}-lectures.ts`；probability / maogai / modern-history 现有 `Record<chapterId, txt[]>` 映射迁移到 `source.transcript`，chemistry 的 `organicChemistryRecordings` / `organicChemistrySummaries` 同理。

`PHYSICS_RECORDING_IDS` 改为 `recordingItems(physicsLectures).map(i => i.id)`，`physicsRecordingQuizQuality.test.ts` 的 `length === 25` 改为与 manifest 一致性断言而非常量。

`deriveExampleKey` 的 `/^rec-\d{2}$/` 随 `keyStrategy: 'item'` 一并删除。

### 2.5 生成物与一致性校验进 prebuild

`package.json`：

```json
"gen-nav": "npx tsx scripts/gen-nav-manifest.ts",
"check:registry": "npx tsx scripts/check-registry-consistency.ts",
"prebuild": "node scripts/check-content-encoding.mjs && npx tsx scripts/gen-nav-manifest.ts && npx tsx scripts/check-registry-consistency.ts && node scripts/gen-script-ids.mjs && ...（其余不变）"
```

`scripts/check-registry-consistency.ts` 校验并在失败时非零退出：

| 规则 | 失败信息示例 |
|---|---|
| `SUBJECT_REGISTRY` 每个 id 在 `contentTree.subjects` 中存在，反之亦然 | `subject 'pharmacology' 在 registry 中但 manifest 缺失` |
| `meta.icon` ∈ `SUBJECT_ICON_COMPONENTS` | tsc 已保证，此处兜底 |
| `subjects/{id}.md` 提示词缺失 → warning（不阻断） | `prompt subjects/anatomy.md 不存在，AI 将只用 global.md` |
| manifest 中每个非 stub、`renderType !== 'component'` 的 item，对应 `content/...` 文件存在 | `physics/recording/rec-28 已注册但 content/physics/recording/rec-28.md 不存在` |
| `content/{subject}/{category}/*.md` 每个文件在 manifest 有 item（`_raw`、`_raw-src`、`_backup*` 除外） | `content/physics/summary/sum-28.md 存在但未注册` |
| 有 `examples` 能力的板块下 `content/examples/{subject}/...` 目录名能被 `deriveContentKey` 反解 | `examples/physics/recording/rec-99 无对应 item` |
| 有 `quiz` 能力的板块下 `content/quiz/{subject}/*.json` 的 chapterId 能映射到某 item | 同上 |
| `nav.generated.json` 与 `contentTree` 瘦身后深比较相等（若 gen-nav 已在前一步执行，此项恒真，作双保险） | `nav.generated.json 已过期，请运行 pnpm gen-nav` |
| 同一学科内 category id 唯一；同一 category 内 item id 唯一（含 children） | |
| `SUBJECT_REGISTRY` 里 `year` 覆盖 `ACADEMIC_YEAR_IDS` 全部值（避免某学年空） | warning |

`scripts/ingest-sophomore-textbooks.py` 的 `BOOKS` 字典改为：从 `--subject` 参数推导导出名（`kebab → camel + 'TextbookItems'`），不再维护字典；同时把 `write_ts` 的输出格式与 registry 对齐。

### 2.6 复习页与默认值

- `app/[subject]/review/page.tsx:121`：改为取该学科第一个具有 `media` 能力（否则第一个非 stub）的 category。
- `lib/constants/subjects.ts` 的 `DEFAULT_SUBJECT`、`lib/store.ts:146/197`、`AppShell.tsx:231/281/283` 的 `"probability"` 字面量：统一改为 `SUBJECT_REGISTRY[0].id`（或按当前学年第一个学科）。这是低优先级一致性修正，不阻断验收。

---

## 3. 分阶段执行计划

每阶段独立可合并、独立可回滚。阶段之间有依赖顺序，阶段内可并行。**每阶段结束运行 §5 对应命令并 commit。**

### 阶段 A —— 学科注册表合一（P0）

| # | 文件 | 动作 |
|---|---|---|
| A1 | `lib/content-data/subjects.registry.ts` | 新建，按 §2.1 写入 11 个学科；icon 统一采用 manifest 当前值（maogai `Scale`、other `FolderOpen`）并在 commit message 说明 constants 里的旧值被废弃 |
| A2 | `lib/ui/subjectIcons.ts`、`components/shared/SubjectIcon.tsx` | 新建，按 §2.2 |
| A3 | `lib/types/content.ts` | `SubjectId` / `SUBJECT_IDS` / `isSubjectId` 改为 re-export；其余类型不动 |
| A4 | `lib/constants/subjects.ts` | `SUBJECTS` / `SUBJECT_ICONS` / `SUBJECT_COLORS` 改为派生；删除 `DEFAULT_CATEGORIES`（阶段 B 由模板接管）；`DEFAULT_SUBJECT` 改派生 |
| A5 | `lib/constants/academic-year.ts` | 两个 ID 数组改派生；保留导出名不变 |
| A6 | `lib/ai/prompts/index.ts` | 删除 `SUBJECT_FILE`，按 `meta.promptFile ?? subjects/{id}.md` 读取 |
| A7 | `lib/content-data/manifest.ts` | 每个 subject 的 `name` / `icon` 改为从 registry 取（`...subjectHeader(id)`） |
| A8 | `components/layout/SubjectSidebar.tsx`、`HomeBookshelf.tsx`、`MobileTopBar.tsx`、`MobileChapterPicker.tsx`、`GlobalSettings.tsx` | 删除本地 `ICON_MAP` / `SUBJECT_ICON_MAP` / `SUBJECT_ICON_NAMES` / `SHORT_NAMES` / 内联 mapping，改用 `<SubjectIcon>` 与 `SUBJECT_BY_ID[id].shortName` |
| A9 | `components/chat/ChatPanel.tsx:84-86` | 改为 `subjectName(chatContext?.subjectId)` |
| A10 | `lib/ai/tools.ts:61` | getOutline 描述由 registry 按学年拼接 |
| A11 | `scripts/build-index.ts:191` | 统计改读 registry |
| A12 | `scripts/ingest-sophomore-textbooks.py` | 删除 `BOOKS`，导出名由 subject 推导；`--subject` 变为必填 |
| A13 | `tests/content/academic-year.test.ts`、`sophomore-search.test.ts`、`sophomore-textbooks.test.ts`、`tests/**/subjects.test.ts` | 把硬编码学科列表改为从 registry 读取后断言"派生结果与 registry 一致" |
| A14 | 新增 `tests/content/subjectsRegistry.test.ts` | 断言：无重复 id；icon 全部在白名单；每个 registry 学科在 manifest 中；`SUBJECTS` / `SUBJECT_ICONS` 与 registry 一一对应 |

**验收**：grep `components/ lib/ app/` 中不再出现除 `subjects.registry.ts` 与 `subjectIcons.ts` 外的学科 icon 字面量映射；`'chemistry' ? '化学'` 类三元不存在；`pnpm exec tsc --noEmit` 与 `pnpm test` 通过。

**Commit**：`refactor(content): 学科元数据收敛为单一注册表，集中 icon 映射`

### 阶段 B —— 板块能力声明（P0）

| # | 文件 | 动作 |
|---|---|---|
| B1 | `lib/types/content.ts` | `Category` 增加 `capabilities` / `keyStrategy`（§2.3） |
| B2 | `lib/content-data/category-templates.ts` | 新建 `STANDARD_CATEGORIES` / `STANDARD_CATEGORY_ORDER` / `category()` / `stubCategory()` |
| B3 | `lib/content/categoryKeys.ts` | 新建 `deriveContentKey(cat, itemId)`，实现三种 `keyStrategy`；单测覆盖 `1.4`、`ch05-2`、`tb-ch05`、`rec-100`、`unit-3` |
| B4 | `lib/content-data/manifest.ts` | 所有 `categories` 改用 `category()` / `stubCategory()`；删除 `examPlaceholderCategories`；`other` 学科的 `english` / `misc` / `gongshi` / `guihua` 显式写 `capabilities`（english: examples+quiz+search，其余 []） |
| B5 | `lib/content-data/sophomore-categories.ts` | 改为 `STANDARD_CATEGORY_ORDER.map(id => id === 'textbook' ? category('textbook', items) : stubCategory(id))` |
| B6 | `app/[subject]/[category]/[id]/page.tsx:70-76` | 删除 `EXAMPLE_CATEGORIES`；改为 `categoryData.capabilities?.includes('examples') ? deriveContentKey(categoryData, id) : empty` |
| B7 | `lib/content/loader.ts` | `deriveExampleKey` 改为包装 `deriveContentKey`（需先 `getCategory`），标 `@deprecated`；删除 `CATEGORY_LABEL`，`getMultiSubjectOutline` 直接用 `cat.name`；`SEARCHABLE_CATEGORIES` 改为 `cat.capabilities?.includes('search')` |
| B8 | `lib/ai/indexing/chunker.ts:19` | 同 B7，删除本地 `SEARCHABLE_CATEGORIES` |
| B9 | `lib/store.ts:55-65,157-158` | `deriveChapterId` 改为包装 `deriveContentKey(...).quizId`；`activeSectionId` 改为 `capabilities.includes('media') ? sectionId : ""` |
| B10 | `app/[subject]/review/page.tsx:121` | 按 §2.6 选择入口 category |
| B11 | `tests/content/sophomore-textbooks.test.ts:10` | `BLOCKS` 改读 `STANDARD_CATEGORY_ORDER` |
| B12 | 新增 `tests/content/categoryCapabilities.test.ts` | 断言：给任意学科临时追加 `{ id: 'formula-sheet', capabilities: ['search'] }` 后，`getMultiSubjectOutline` 包含它、`deriveContentKey` 返回空 key、`page.tsx` 的例题分支不触发（用 loader 层函数模拟） |
| B13 | `docs/sop/08-exam-paper-integration.md:380-399` | 删除"需手动改两处 `SEARCHABLE_CATEGORIES`"段，改为"在 category 上加 `'search'` 能力" |

**验收**：grep `lib/ app/ components/` 中 `SEARCHABLE_CATEGORIES`、`EXAMPLE_CATEGORIES`、`CATEGORY_LABEL`、`categoryId === "detail"`、`categoryId === "recording"`、`categoryId === "english"`、`categoryId === "textbook"` 全部为 0 命中（允许出现在 `category-templates.ts` 和 `categoryKeys.ts`）；手工在 physics 追加 `formula-sheet` category + 一个 md，`pnpm dev` 下页面可访问、AI getOutline 列出它、无例题 Tab。

**Commit**：`refactor(content): 板块能力改为 manifest 声明，移除 categoryId 硬编码开关`

### 阶段 C —— 录音单点声明（P1）

| # | 文件 | 动作 |
|---|---|---|
| C1 | `lib/content-data/recordings.ts` | 新建 `LectureMeta` / `recordingItems` / `summaryItems`（§2.4） |
| C2 | `lib/content-data/{probability,physics,chemistry,modern-history,maogai}-lectures.ts` | 新建，从 manifest 现有 rec/sum items 机械迁移；chemistry `rec-15` 无 sum → `hasSummary: false`；title 与 summaryTitle 不同的（chemistry、modern-history、maogai 的 "纪要·" 前缀）显式写 `summaryTitle` |
| C3 | `lib/content-data/*-detail.ts` | `probabilityRecordings` / `maogaiRecordings` / `modernHistoryRecordings` / `organicChemistryRecordings` / `organicChemistrySummaries` 迁入对应 `-lectures.ts` 的 `source` 字段；原导出保留为派生 getter 一版，标 `@deprecated`（`manifest.ts:555` 的旧 `manifest.chapters[].recordings` 仍在用） |
| C4 | `lib/content-data/manifest.ts` | 五个学科的 `recording` / `summary` 改为 `category('recording', recordingItems(xLectures))` 等 |
| C5 | `lib/quiz/physicsRecordingQuality.ts:3-29` | `PHYSICS_RECORDING_IDS` 改为 `recordingItems(physicsLectures).map(i => i.id)` |
| C6 | `tests/content/physicsRecordingQuizQuality.test.ts:54-59` | 删除 `length === 25`，改为"与 manifest physics/recording items 集合相等" |
| C7 | `scripts/check-physics-recording-quiz-quality.mjs` | 若内部复制了 ID 列表，改读 C5 导出 |
| C8 | 新增 `tests/content/recordings.test.ts` | 断言：rec/sum 成对；`hasSummary: false` 时无 sum；三位数 id 正常生成 `rec-100` |

**验收**：`manifest.ts` 中不再有任何 `id: 'rec-` / `id: 'sum-` 字面量；`deriveContentKey` 对 `rec-100` 返回 `quizId = 'rec-100'`。

**Commit**：`refactor(content): 课堂录音改为 lectures 单点声明，rec/sum 自动派生`

### 阶段 D —— 生成物与一致性校验（P0，可与 B/C 并行）

| # | 文件 | 动作 |
|---|---|---|
| D1 | `scripts/check-registry-consistency.ts` | 新建，按 §2.5 规则表实现；支持 `--fix-nav` 直接重生成 nav；输出按规则分组、含文件路径 |
| D2 | `package.json` | `gen-nav` 与 `check:registry` 加入 `prebuild`（放在 `check-content-encoding` 之后、`run-unit-tests` 之前）；新增 `"check:registry"` script |
| D3 | `scripts/build-desktop.mjs:221` 附近 | 桌面打包前同样调用 gen-nav + check:registry（它绕过了 prebuild） |
| D4 | `README.md` 开发指南 | 加 `pnpm check:registry` 说明；"接入新学科"5 步改为指向新 SOP |
| D5 | `.gitattributes` / CI（若有） | `nav.generated.json` 标记为生成物；若 CI 存在则加 `pnpm check:registry` |

**验收**：故意在 manifest 加一条没有 md 的 item → `pnpm build` 在 prebuild 阶段失败并指出路径；故意放一个未注册 md → 同样失败；删除 `nav.generated.json` → prebuild 自动重生成。

**Commit**：`build: 注册表一致性校验与 nav 生成进入 prebuild`

### 阶段 E —— SOP 文档修正与重组（P1）

| # | 文件 | 动作 |
|---|---|---|
| E1 | `docs/sop/subject-onboarding.md` | 重写为 ≤ 6KB 的纯接入手册：①在 `subjects.registry.ts` 加对象 ②放 md ③（可选）prompt ④（可选）`ingest-sophomore-textbooks.py --subject` ⑤`pnpm check:registry` ⑥验证清单。删除 §4–§6、§8 |
| E2 | 新建 `docs/refer/framework-extension.md` | 承接被删的 XML 标签、原语、CanvasBlock、AI 标签扩展内容（原文搬迁，不改写） |
| E3 | `docs/sop/01-textbook-processing.md` | Step 5 改为"运行 ingest 脚本生成 `{subject}-textbook.ts` → 在 manifest 挂载 → `pnpm check:registry`"；补两级树说明；补 `extract-textbook-pdf.py` 前置步骤 |
| E4 | `docs/sop/03-recording-processing.md` | Step 5 改为"在 `{subject}-lectures.ts` 追加 `{ id, title, source }`"；补 `build-index`；删除"NN 为两位数"限制 |
| E5 | `docs/sop/04-quiz-generation.md` | 补：quiz 生效前提是所属板块声明 `quiz` 能力；删除 physics 白名单相关手工步骤 |
| E6 | `docs/sop/05-content-integration.md` | 全文路径改 `lib/content-data/manifest.ts`；删除 §4.2–4.4 已修复的限制与 §6 TODO；Step 3 验证命令改为 `pnpm check:registry` |
| E7 | `docs/sop/08-exam-paper-integration.md:141` | 路径修正 |
| E8 | `docs/sop/README.md` | §4 路径约定表补 `capabilities` 一列与 `other` 学科板块；§6 删除 `content/manifest.ts` 行；新增"新增板块"一节指向 `category-templates.ts` |
| E9 | 目录整理 | `docs/sops/english-unit-content-sop.md` 移入 `docs/sop/09-english-unit-content.md` 并在 README 登记；`docs/refer/prototype-v0.0.tar.gz` 移出仓库（或加入 `.gitignore` 后 `git rm --cached`，需用户确认）；两个乱码文件名 md 重命名为 `docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md` 并更新引用 |
| E10 | `docs/plans/README.md` | 登记本文件为 12 |

**验收**：`docs/sop/**` 中 grep `content/manifest.ts`、`VALID_SUBJECTS`、`VALID_CATEGORIES`、`content/media` 为 0 命中；每个 SOP 的"参考文件"链接可解析。

**Commit**：`docs(sop): 对齐注册表架构，拆分接入手册与框架扩展指南`

### 阶段 F —— 收尾清理（P2）

| # | 动作 |
|---|---|
| F1 | 删除阶段 B/C 中标 `@deprecated` 的包装：`deriveExampleKey`（loader）、`deriveChapterId`（store）、`*Recordings` 旧导出；同步删 `manifest.ts:540-557` 的旧 `manifest` 对象（需先确认 `lib/content/loader.ts` 的 `getOutlineText` / `searchNotes` / `findChapter` 无消费方，否则一并删除） |
| F2 | `lib/store.ts:146/197`、`components/layout/AppShell.tsx:231/281/283` 的 `"probability"` 字面量改派生 |
| F3 | 仓库根目录清理：`({`、`{`、`{img.loading` 三个 0 字节文件和 `projectsDev-ToolsStudyReview-Platformtmpqa*.png` 三张误存图片（需用户确认后删除） |
| F4 | `lib/content/loader.ts:63` 概率论特例改为读 `SUBJECT_BY_ID.probability.contentRoot.detail === 'chapters'`，去掉字面量 |

**Commit**：`chore: 移除注册表迁移期的兼容包装与残留文件`

---

## 4. 依赖与并行

```
A（学科注册表） ──┬──> B（板块能力） ──┐
                  │                     ├──> E（文档） ──> F（清理）
                  ├──> C（录音声明） ──┤
                  └──> D（校验进 prebuild）┘
```

- A 必须最先完成（B/C/D 都依赖 `SUBJECT_REGISTRY`）。
- B、C、D 相互独立，可三个 subagent 并行；但都改 `manifest.ts`，建议 B 先落地 `category()` 后 C 再基于它改 recording/summary，D 只读 manifest 不写。
- E 在 B/C/D 合并后执行，保证文档写的就是最终形态。

---

## 5. 验证命令

每阶段通用：

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
```

阶段专用：

```bash
# A：不再有分散的学科硬编码（期望：仅 registry / subjectIcons 命中）
rg -n "Calculator|FlaskConical|ScanLine" components lib app --glob '!lib/ui/subjectIcons.ts' --glob '!lib/content-data/subjects.registry.ts'
rg -n "=== 'chemistry'|=== \"chemistry\"" components lib app

# B：板块开关全部消失（期望 0 命中）
rg -n "SEARCHABLE_CATEGORIES|EXAMPLE_CATEGORIES|CATEGORY_LABEL" lib app components
rg -n "categoryId === \"(detail|recording|english|textbook)\"" lib app components --glob '!lib/content/categoryKeys.ts'

# C：manifest 不再手写 rec/sum
rg -n "id: 'rec-|id: 'sum-" lib/content-data/manifest.ts

# D：一致性校验
pnpm check:registry
pnpm build   # prebuild 应包含 gen-nav + check:registry

# E：文档过期引用
rg -n "content/manifest.ts|VALID_SUBJECTS|VALID_CATEGORIES|content/media" docs/sop
```

端到端验收脚本（阶段 D 后手工执行一次，作为"零代码接入"的实证）：

1. 在 `subjects.registry.ts` 加 `{ id: 'demo-subject', name: '演示学科', shortName: '演示', icon: 'BookOpen', color: '#999', year: 'sophomore-1' }`。
2. 在 manifest 加 `{ ...subjectHeader('demo-subject'), categories: sophomoreCategorySkeleton([{ id: 'ch01', title: '第一章', type: 'document', status: 'done' }]) }`。
3. 新建 `content/demo-subject/textbook/ch01.md`。
4. `pnpm check:registry` 通过；`pnpm dev` 访问 `/demo-subject/textbook/ch01` 正常、侧边栏出现图标与短名、AI Tab 的 getOutline 包含它、ChatPanel 标题显示"演示学科"。
5. 全程未修改 `components/`、`app/`、`lib/ai/`、`lib/constants/`。
6. 回滚以上改动。

---

## 6. 风险与回退

| 风险 | 缓解 |
|---|---|
| `SubjectId` 从手写联合改为 `typeof` 派生后，IDE 提示与错误信息可读性下降 | `as const satisfies readonly SubjectMeta[]` 保证字面量类型；registry 顶部注释列出全部 id |
| icon 收敛时 maogai / other 的图标值二选一，UI 会变 | 采用 manifest 当前值（用户实际看到的），constants 旧值废弃；在 CHANGELOG 记录 |
| `deriveContentKey` 替换三处推导，某个学科的 itemId 命名不在三种策略内（如 `unit-1`、`toc`、`kaodian-01`） | B3 单测穷举现有 manifest 全部 item 跑一遍，任何返回空 key 且所属板块声明了 `examples` / `quiz` 的组合都列出来人工确认 |
| `SEARCHABLE_CATEGORIES` 改为能力后，`kaoqian-moni` / `shizhan-yanlian` 仍不可搜（与现状一致），用户可能期望可搜 | 本规划不改语义；若要开放，只需在模板加 `'search'`，并重跑 `build-index` |
| prebuild 加入 `check:registry` 后，已存在的"未注册 md"（如 `content/probability/shizyan-yanlian/` 拼写错误目录、`_backup_v1`）会让首次构建失败 | D1 先以 `--report-only` 跑一遍，把存量问题列成清单单独处理（改名 / 删除 / 加忽略）；忽略列表放在脚本顶部并注释原因 |
| 旧 `manifest` 对象（`manifest.ts:540`）仍有消费方 | F1 前 grep `getManifest|findChapter|getOutlineText|searchNotes|manifest.chapters` 确认；有消费方则先迁移 |
| `nav.generated.json` 进 prebuild 后 git diff 噪音 | 生成结果确定性排序；或改为构建期内存派生、不落盘（取消该文件），二者在 D 阶段择一 |

每阶段单独 commit，任一阶段出问题 `git revert` 该 commit 即可，不影响其他阶段。

---

## 7. 完成定义

- [ ] §1 六条验收标准全部满足
- [ ] §5 端到端验收脚本跑通并记录到本文件末尾
- [ ] `docs/sop/subject-onboarding.md` ≤ 6KB 且只含接入步骤
- [ ] `CHANGELOG.md` 记录本轮重构与图标变更
- [ ] `docs/plans/README.md` 登记本文件
