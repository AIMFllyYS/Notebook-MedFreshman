import type { SubjectId } from '@/lib/types/content';

export const SUBJECTS: Record<SubjectId, string> = {
  'probability': '概率论与数理统计',
  'physics': '大学物理',
  'chemistry': '有机化学',
  'modern-history': '中国近现代史纲要',
  'maogai': '毛概',
  'other': '其他',
};

/** 默认分类模板，仅供新科目初始化参考，不再作为运行时校验约束。 */
export const DEFAULT_CATEGORIES: Record<string, string> = {
  'textbook': '教材',
  'detail': '详解',
  'recording': '课上录音',
  'summary': '课堂纪要',
};

export const SUBJECT_ICONS: Record<SubjectId, string> = {
  'probability': 'Calculator',
  'physics': 'Atom',
  'chemistry': 'FlaskConical',
  'modern-history': 'BookOpen',
  'maogai': 'ScrollText',
  'other': 'Folder',
};

export const DEFAULT_SUBJECT: SubjectId = 'probability';
export const DEFAULT_CATEGORY: string = 'detail';
