import type { SubjectId } from '@/lib/types/content';

export const SUBJECTS: Record<SubjectId, string> = {
  'probability': '概率论与数理统计',
  'physics': '大学物理',
  'chemistry': '有机化学',
  'modern-history': '中国近现代史纲要',
  'maogai': '毛概',
  'other': '其他',
  'cell-biology': '医学细胞生物学',
  'biochemistry': '生物化学与分子生物学',
  'anatomy': '系统解剖学',
  'histology': '组织学与胚胎学',
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
  'cell-biology': 'Microscope',
  'biochemistry': 'Dna',
  'anatomy': 'Bone',
  'histology': 'Layers',
};

/** 每个学科的专属主色（书架封面书脊/图标/水印取色，告别统一同色）。 */
export const SUBJECT_COLORS: Record<SubjectId, string> = {
  'probability': '#6366f1',     // 靛蓝
  'physics': '#0ea5e9',         // 天蓝
  'chemistry': '#10b981',       // 翠绿
  'modern-history': '#ef4444',  // 朱红
  'maogai': '#f59e0b',          // 琥珀
  'other': '#64748b',           // 石板灰
  'cell-biology': '#a855f7',    // 紫
  'biochemistry': '#ec4899',    // 粉
  'anatomy': '#f97316',         // 橙
  'histology': '#14b8a6',       // 青
};

/** 取学科主色（缺省回退石板灰）。 */
export function subjectColor(id: string): string {
  return (SUBJECT_COLORS as Record<string, string>)[id] ?? '#64748b';
}

export const DEFAULT_SUBJECT: SubjectId = 'probability';
export const DEFAULT_CATEGORY: string = 'detail';
