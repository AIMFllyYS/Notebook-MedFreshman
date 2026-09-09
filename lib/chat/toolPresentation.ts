// 工具的「展示契约」单一真相源（客户端安全，无服务端依赖）。
//
// 新增一个 Agent 工具时，只需在这里补一条记录，思考链步骤标题 / 图标 / 折叠摘要、
// 设置面板里的开关文案就全部一致了。结果卡片（回答下方的富展示）由
// components/chat/ToolResultCards.tsx 按工具名分发，是同一套约定的另一半。

import type { StudyToolName } from '@/lib/ai/agent/toolTypes';
import { STUDY_TOOL_NAMES } from '@/lib/ai/agent/toolTypes';

export type ToolIconKind = 'search' | 'file' | 'image' | 'gallery' | 'skill' | 'terminal' | 'quiz' | 'document';

export interface ToolPresentation {
  /** 思考链步骤标题（动词短语）。 */
  label: string;
  /** 设置面板开关名。 */
  settingsLabel: string;
  /** 设置面板描述。 */
  description: string;
  icon: ToolIconKind;
  /** 是否在设置面板中提供开关；imageSearch 随「联网搜索」开关，useSkill 随技能库。 */
  toggleable: boolean;
}

export const TOOL_PRESENTATION: Record<StudyToolName, ToolPresentation> = {
  getCurrentPage: {
    label: '阅读当前页面',
    settingsLabel: '读取当前页',
    description: '让 AI 获取你正在阅读的页面内容',
    icon: 'file',
    toggleable: true,
  },
  getOutline: {
    label: '查阅课程大纲',
    settingsLabel: '课程大纲',
    description: '让 AI 查看全部科目的章节大纲',
    icon: 'file',
    toggleable: true,
  },
  getSection: {
    label: '读取笔记章节',
    settingsLabel: '读取指定页面',
    description: '让 AI 调取任意科目的任意小节正文',
    icon: 'file',
    toggleable: true,
  },
  searchNotes: {
    label: '检索笔记',
    settingsLabel: '全文检索',
    description: '让 AI 在全部课程笔记中按关键词检索',
    icon: 'search',
    toggleable: true,
  },
  searchNoteImages: {
    label: '检索笔记图片',
    settingsLabel: '笔记图片',
    description: '让 AI 检索并直接引用课程笔记里已有的插图',
    icon: 'gallery',
    toggleable: true,
  },
  webSearch: {
    label: '搜索网页',
    settingsLabel: '联网搜索',
    description: '需配置 Bocha key；联网获取实时信息',
    icon: 'search',
    toggleable: true,
  },
  imageSearch: {
    label: '搜索图片',
    settingsLabel: '联网图片',
    description: '随联网搜索开关启用；从 Unsplash 搜索真实照片',
    icon: 'search',
    toggleable: false,
  },
  renderInteractive: {
    label: '创建交互演示',
    settingsLabel: '交互演示',
    description: '让 AI 生成可交互的 HTML 讲解（横幅/弹窗查看）',
    icon: 'terminal',
    toggleable: true,
  },
  drawDiagram: {
    label: '绘制图示',
    settingsLabel: 'SVG 绘图',
    description: '让 AI 绘制矢量示意图（分子/电路/光路/几何等）',
    icon: 'image',
    toggleable: true,
  },
  generateImage: {
    label: '准备生成图片',
    settingsLabel: 'AI 生图',
    description: '让 AI 生成图片（需用户批准，优先 SVG，仅必要时使用）',
    icon: 'image',
    toggleable: true,
  },
  createQuiz: {
    label: '出题',
    settingsLabel: '结构化出题',
    description: '让 AI 用题库组件出可作答、可判分的题目（替代折叠文本）',
    icon: 'quiz',
    toggleable: true,
  },
  writeDocument: {
    label: '撰写长文档',
    settingsLabel: '长文档撰写',
    description: '让 AI 分节撰写长文章/论文/报告，可导出 Markdown / Word / LaTeX / PDF',
    icon: 'document',
    toggleable: true,
  },
  useSkill: {
    label: '调用技能',
    settingsLabel: '技能',
    description: '随技能库启用',
    icon: 'skill',
    toggleable: false,
  },
};

/** 设置面板「工具调用」区展示的工具，按 STUDY_TOOL_NAMES 顺序。 */
export const TOGGLEABLE_TOOLS: readonly { name: StudyToolName; label: string; desc: string }[] = STUDY_TOOL_NAMES
  .filter((name) => TOOL_PRESENTATION[name].toggleable)
  .map((name) => ({ name, label: TOOL_PRESENTATION[name].settingsLabel, desc: TOOL_PRESENTATION[name].description }));

export function getToolPresentation(name: string): ToolPresentation | undefined {
  return (TOOL_PRESENTATION as Record<string, ToolPresentation | undefined>)[name];
}

export function toolLabel(name: string): string | undefined {
  return getToolPresentation(name)?.label;
}
