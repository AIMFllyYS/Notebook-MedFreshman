// 技能（Skill）类型 —— 用户上传的单个 .md 文件，作为 AI 可按需调用的专门指导。
// 存储：lib/hooks/useSkills.ts（Zustand + IndexedDB）；注入：app/api/chat/route.ts。

export interface Skill {
  /** 稳定排序键（创建时间戳字符串），保证服务端拼装稳定前缀逐字节一致、利于缓存。 */
  id: string;
  /** 技能名称：frontmatter.name → 否则文件名（去扩展名）；用户可编辑。 */
  name: string;
  /** 技能描述：frontmatter.description → 否则正文首段；供 AI 判断何时调用，用户可编辑。 */
  description: string;
  /** 技能正文（已剥离 frontmatter），被调用/固定时注入上下文。 */
  content: string;
  /** 手动固定开启：true = 每轮强制注入全文（不依赖 AI 判断，且不进可调用菜单）。 */
  pinned: boolean;
  createdAt: number;
}
