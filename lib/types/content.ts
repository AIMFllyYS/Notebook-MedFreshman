// 多科内容树类型定义 —— 科目 / 分类 / 内容项层级，驱动多科导航与 AI 工具。
// SubjectId 与合法学科列表由 lib/content-data/subjects.registry.ts 派生，此处仅 re-export 保持旧 import 路径可用。

export type { SubjectId } from '@/lib/content-data/subjects.registry';
export { SUBJECT_IDS, isSubjectId } from '@/lib/content-data/subjects.registry';
import type { SubjectId } from '@/lib/content-data/subjects.registry';

export type CategoryId = string;

export type RenderType = 'markdown' | 'html' | 'component';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  categories: Category[];
}

/**
 * 板块能力：由 manifest 声明，替代散落在 page / loader / store / chunker 里的 categoryId 判断。
 * - examples：右侧「例题」Tab，从 content/examples/{subject}/{chapterId}/{sectionId}/ 读取
 * - quiz：右侧「题目测试」Tab，从 content/quiz/{subject}/{quizId}.json 读取
 * - search：进入 AI 全文检索 / 混合索引 / getOutline 大纲
 * - media：右侧「动画」「可交互」Tab 按 (chapterId, sectionId) 查找视频与交互组件
 */
export type CategoryCapability = 'examples' | 'quiz' | 'search' | 'media';

/**
 * itemId → (chapterId, sectionId, quizId) 的推导策略。见 lib/content/categoryKeys.ts。
 * - section-dot：itemId 形如 "3.2" → chapter ch03 / section 3.2 / quiz ch03（详解）
 * - item：chapter = section = quiz = itemId（英语 unit）
 * - category-item：chapter = 板块 id，section = quiz = itemId（课堂录音）
 * - chapter-prefix：itemId 形如 ch05-2 / tb-ch05 → section ch05 / quiz tb-ch05（教材）
 */
export type CategoryKeyStrategy = 'section-dot' | 'item' | 'category-item' | 'chapter-prefix';

/**
 * 布局档位：决定内容页渲染哪些区块。缺省由 capabilities 推导（见 lib/content/layoutProfile.ts）。
 * - full      三栏 + 正文/例题/测验 tab + 右侧全部 tab（详解、教材）
 * - article   单栏正文 + 目录 + 可折叠 AI 面板；无例题/测验；右侧只有 AI（课件、纪要、纯文档）
 * - reference 同 article 但隐藏 AI 面板入口（考前模拟、只读资料）
 */
export type LayoutProfile = 'full' | 'article' | 'reference';

export interface Category {
  id: string;
  name: string;
  items: ContentItem[];
  /** 缺省 = 无（只读正文 + AI 当前页）。 */
  capabilities?: readonly CategoryCapability[];
  /** 缺省 = 不推导（chapterId / sectionId / quizId 全为空）。 */
  keyStrategy?: CategoryKeyStrategy;
  /** 缺省由 capabilities / item.type 推导；item.layoutProfile 可覆盖。 */
  layoutProfile?: LayoutProfile;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'section' | 'document';
  status?: 'done' | 'draft' | 'stub';
  summary?: string;
  videoIds?: string[];
  interactiveIds?: string[];
  children?: ContentItem[];
  renderType?: RenderType;
  /** 覆盖所属板块的 layoutProfile。 */
  layoutProfile?: LayoutProfile;
}

export interface ContentTree {
  subjects: Subject[];
}

interface ContentRoute {
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
}
