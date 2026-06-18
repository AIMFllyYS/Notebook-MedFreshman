import type { ContentTree } from '@/lib/types/content';
import { probabilityDetailItems, probabilityRecordings } from './probability-detail';

export const contentTree: ContentTree = {
  subjects: [
    {
      id: 'probability',
      name: '概率论与数理统计',
      icon: 'Calculator',
      categories: [
        {
          id: 'textbook',
          name: '教材',
          items: [
            { id: 'main-textbook', title: '概率论与数理统计（教材）', type: 'document', status: 'stub' },
          ],
        },
        {
          id: 'detail',
          name: '详解',
          items: probabilityDetailItems,
        },
        {
          id: 'recording',
          name: '课上录音',
          items: [
            { id: 'rec-01', title: '第一节录音', type: 'document', status: 'stub' },
            { id: 'rec-02', title: '第二节录音', type: 'document', status: 'stub' },
            { id: 'rec-03', title: '第三节录音', type: 'document', status: 'stub' },
            { id: 'rec-04', title: '第四节录音', type: 'document', status: 'stub' },
          ],
        },
        {
          id: 'summary',
          name: '课堂纪要',
          items: [
            { id: 'sum-01', title: '第一节纪要', type: 'document', status: 'stub' },
            { id: 'sum-02', title: '第二节纪要', type: 'document', status: 'stub' },
            { id: 'sum-03', title: '第三节纪要', type: 'document', status: 'stub' },
            { id: 'sum-04', title: '第四节纪要', type: 'document', status: 'stub' },
          ],
        },
      ],
    },
    {
      id: 'physics',
      name: '大学物理',
      icon: 'Atom',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '大学物理（教材）', type: 'document', status: 'stub' }] },
        { id: 'detail', name: '详解', items: [] },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
    {
      id: 'chemistry',
      name: '大学化学',
      icon: 'FlaskConical',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '大学化学（教材）', type: 'document', status: 'stub' }] },
        { id: 'detail', name: '详解', items: [] },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
    {
      id: 'modern-history',
      name: '中国近现代史纲要',
      icon: 'BookOpen',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '中国近现代史纲要（教材）', type: 'document', status: 'stub' }] },
        { id: 'detail', name: '详解', items: [] },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
    {
      id: 'maogai',
      name: '毛泽东思想和中国特色社会主义理论体系概论',
      icon: 'Scale',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '毛概（教材）', type: 'document', status: 'stub' }] },
        { id: 'detail', name: '详解', items: [] },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
    {
      id: 'other',
      name: '其他',
      icon: 'FolderOpen',
      categories: [
        { id: 'textbook', name: '教材', items: [] },
        { id: 'detail', name: '详解', items: [] },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
  ],
};

// ── 兼容导出：保留原有 manifest 结构，指向概率论详解分类数据 ──
export const manifest = {
  course: '概率论与数理统计',
  chapters: contentTree.subjects[0].categories[1].items.map((ch) => ({
    id: ch.id,
    number: parseInt(ch.id.replace('ch', '')),
    title: ch.title,
    summary: ch.summary || '',
    sections: (ch.children || []).map((sec) => ({
      id: sec.id,
      title: sec.title,
      summary: sec.summary || '',
      status: sec.status || 'stub',
      videoIds: sec.videoIds || [],
      interactiveIds: sec.interactiveIds || [],
    })),
    recordings: probabilityRecordings[ch.id] || [],
  })),
};

export default manifest;
