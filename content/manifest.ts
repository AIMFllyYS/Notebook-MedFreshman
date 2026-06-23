import type { ContentTree } from '@/lib/types/content';
import { probabilityDetailItems, probabilityRecordings } from './probability-detail';
import { modernHistoryDetailItems, modernHistoryRecordings } from './modern-history-detail';
import { organicChemistryDetailItems } from './organic-chemistry-detail';
import { maogaiDetailItems } from './maogai-detail';
import { physicsDetailItems } from './physics-detail';

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
        { id: 'detail', name: '详解', items: physicsDetailItems },
        { id: 'recording', name: '课上录音', items: [] },
        { id: 'summary', name: '课堂纪要', items: [] },
      ],
    },
    {
      id: 'chemistry',
      name: '有机化学',
      icon: 'FlaskConical',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '有机化学（教材）', type: 'document', status: 'stub' }] },
        {
          id: 'detail',
          name: '详解',
          items: organicChemistryDetailItems,
        },
        {
          id: 'recording',
          name: '课上录音',
          items: [
            { id: 'rec-01', title: '第一讲·绪论', type: 'document', status: 'done' },
            { id: 'rec-02', title: '第二讲·分子极性·酸碱理论·官能团', type: 'document', status: 'done' },
            { id: 'rec-03', title: '第三讲·有机化合物的命名', type: 'document', status: 'done' },
            { id: 'rec-04', title: '第四讲·分子间作用力', type: 'document', status: 'done' },
            { id: 'rec-05', title: '第五讲·烷烃结构与自由基取代', type: 'document', status: 'done' },
            { id: 'rec-06', title: '第六讲·环烷烃构象与诱导效应', type: 'document', status: 'done' },
            { id: 'rec-07', title: '第七讲·共轭与超共轭效应', type: 'document', status: 'done' },
            { id: 'rec-08', title: '第八讲·环己烷构象与电子效应应用', type: 'document', status: 'done' },
            { id: 'rec-09', title: '第九讲·烯烃的加成反应', type: 'document', status: 'done' },
            { id: 'rec-10', title: '第十讲·烯烃氧化·炔烃·芳香性', type: 'document', status: 'done' },
            { id: 'rec-11', title: '第十一讲·芳香亲电取代与定位效应', type: 'document', status: 'done' },
            { id: 'rec-12', title: '第十二讲·立体化学与手性', type: 'document', status: 'done' },
            { id: 'rec-13', title: '第十三讲·烯烃炔烃加成综合', type: 'document', status: 'done' },
            { id: 'rec-14', title: '第十四讲·卤代烃亲核取代', type: 'document', status: 'done' },
            { id: 'rec-15', title: '第十五讲·消除反应与金属有机', type: 'document', status: 'done' },
            { id: 'rec-16', title: '第十六讲·醇酚醚', type: 'document', status: 'done' },
            { id: 'rec-17', title: '第十七讲·醛酮', type: 'document', status: 'done' },
            { id: 'rec-18', title: '第十九讲·羧酸及其衍生物', type: 'document', status: 'done' },
            { id: 'rec-19', title: '第二十一讲·芳香取代与重氮盐', type: 'document', status: 'done' },
            { id: 'rec-20', title: '第二十五讲·含氮化合物与杂环', type: 'document', status: 'done' },
          ],
        },
        {
          id: 'summary',
          name: '课堂纪要',
          items: [
            { id: 'sum-01', title: '第一讲纪要·绪论', type: 'document', status: 'done' },
            { id: 'sum-02', title: '第二讲纪要·酸碱理论与命名', type: 'document', status: 'done' },
            { id: 'sum-03', title: '第三讲纪要·命名', type: 'document', status: 'done' },
            { id: 'sum-04', title: '第四讲纪要·分子间作用力', type: 'document', status: 'done' },
            { id: 'sum-05', title: '第五讲纪要·烷烃', type: 'document', status: 'done' },
            { id: 'sum-06', title: '第六讲纪要·环烷烃构象与诱导效应', type: 'document', status: 'done' },
            { id: 'sum-07', title: '第七讲纪要·共轭与超共轭', type: 'document', status: 'done' },
            { id: 'sum-08', title: '第八讲纪要·环己烷构象与电子效应', type: 'document', status: 'done' },
            { id: 'sum-09', title: '第九讲纪要·烯烃加成', type: 'document', status: 'done' },
            { id: 'sum-10', title: '第十讲纪要·炔烃与芳香性', type: 'document', status: 'done' },
            { id: 'sum-11', title: '第十一讲纪要·芳香亲电取代', type: 'document', status: 'done' },
            { id: 'sum-12', title: '第十二讲纪要·立体化学与手性', type: 'document', status: 'done' },
            { id: 'sum-13', title: '第十三讲纪要·烯炔加成综合', type: 'document', status: 'done' },
            { id: 'sum-14', title: '第十四讲纪要·卤代烃亲核取代', type: 'document', status: 'done' },
            { id: 'sum-16', title: '第十六讲纪要·醇酚醚', type: 'document', status: 'done' },
            { id: 'sum-17', title: '第十七讲纪要·醛酮', type: 'document', status: 'done' },
            { id: 'sum-18', title: '第十九讲纪要·羧酸及衍生物', type: 'document', status: 'done' },
            { id: 'sum-19', title: '第二十一讲纪要·芳香取代与重氮盐', type: 'document', status: 'done' },
            { id: 'sum-20', title: '第二十五讲纪要·含氮化合物', type: 'document', status: 'done' },
          ],
        },
      ],
    },
    {
      id: 'modern-history',
      name: '中国近现代史纲要',
      icon: 'BookOpen',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '中国近现代史纲要（教材）', type: 'document', status: 'stub' }] },
        {
          id: 'detail',
          name: '详解',
          items: modernHistoryDetailItems,
        },
        {
          id: 'recording',
          name: '课上录音',
          items: [
            { id: 'rec-01', title: '第一课·课程意义与安排', type: 'document', status: 'done' },
            { id: 'rec-02', title: '第三课·农民阶级（太平天国）', type: 'document', status: 'done' },
            { id: 'rec-03', title: '第四课·地主阶级洋务派', type: 'document', status: 'done' },
            { id: 'rec-04', title: '第五课·早期资产阶级与维新思想', type: 'document', status: 'done' },
            { id: 'rec-05', title: '第六课·戊戌变法政治实践', type: 'document', status: 'done' },
            { id: 'rec-06', title: '第七课·辛亥革命', type: 'document', status: 'done' },
            { id: 'rec-07', title: '第九课·五四运动', type: 'document', status: 'done' },
            { id: 'rec-08', title: '第十二课·国共合作与大革命', type: 'document', status: 'done' },
            { id: 'rec-09', title: '第十四课·抗日战争', type: 'document', status: 'done' },
            { id: 'rec-10', title: '第十五课·解放战争', type: 'document', status: 'done' },
          ],
        },
        {
          id: 'summary',
          name: '课堂纪要',
          items: [
            { id: 'sum-01', title: '第一课纪要·课程意义与安排', type: 'document', status: 'done' },
            { id: 'sum-02', title: '第三课纪要·农民阶级', type: 'document', status: 'done' },
            { id: 'sum-03', title: '第四课纪要·洋务派', type: 'document', status: 'done' },
            { id: 'sum-04', title: '第五课纪要·维新思想', type: 'document', status: 'done' },
            { id: 'sum-05', title: '第六课纪要·戊戌变法', type: 'document', status: 'done' },
            { id: 'sum-06', title: '第七课纪要·辛亥革命', type: 'document', status: 'done' },
            { id: 'sum-07', title: '第九课纪要·五四运动', type: 'document', status: 'done' },
            { id: 'sum-08', title: '第十二课纪要·国共合作', type: 'document', status: 'done' },
            { id: 'sum-09', title: '第十四课纪要·抗日战争', type: 'document', status: 'done' },
            { id: 'sum-10', title: '第十五课纪要·解放战争', type: 'document', status: 'done' },
          ],
        },
      ],
    },
    {
      id: 'maogai',
      name: '毛泽东思想和中国特色社会主义理论体系概论',
      icon: 'Scale',
      categories: [
        { id: 'textbook', name: '教材', items: [{ id: 'main', title: '毛概（教材）', type: 'document', status: 'stub' }] },
        {
          id: 'detail',
          name: '详解',
          items: maogaiDetailItems,
        },
        {
          id: 'recording',
          name: '课上录音',
          items: [
            { id: 'rec-01', title: '第一二节·课程导论', type: 'document', status: 'done' },
            { id: 'rec-02', title: '第二节·马克思主义中国化历史进程', type: 'document', status: 'done' },
            { id: 'rec-03', title: '第三节·毛泽东思想及其历史地位', type: 'document', status: 'done' },
            { id: 'rec-04', title: '第四节·新民主主义革命历史条件', type: 'document', status: 'done' },
            { id: 'rec-05', title: '第五节·新民主主义革命理论', type: 'document', status: 'done' },
            { id: 'rec-06', title: '第七节·新民主主义革命三大法宝', type: 'document', status: 'done' },
            { id: 'rec-07', title: '第八节·社会主义改造理论（上）', type: 'document', status: 'done' },
            { id: 'rec-08', title: '第九节·社会主义改造理论（下）', type: 'document', status: 'done' },
            { id: 'rec-09', title: '第十二节·毛泽东思想活的灵魂', type: 'document', status: 'done' },
            { id: 'rec-10', title: '第十四节·邓小平理论', type: 'document', status: 'done' },
            { id: 'rec-11', title: '第十五节·一国两制与祖国统一', type: 'document', status: 'done' },
            { id: 'rec-12', title: '补充课·期末复习', type: 'document', status: 'done' },
          ],
        },
        {
          id: 'summary',
          name: '课堂纪要',
          items: [
            { id: 'sum-01', title: '第一二节纪要·课程导论', type: 'document', status: 'done' },
            { id: 'sum-02', title: '第二节纪要·马克思主义中国化历史进程', type: 'document', status: 'done' },
            { id: 'sum-03', title: '第三节纪要·毛泽东思想及其历史地位', type: 'document', status: 'done' },
            { id: 'sum-04', title: '第四节纪要·新民主主义革命历史条件', type: 'document', status: 'done' },
            { id: 'sum-05', title: '第五节纪要·新民主主义革命理论', type: 'document', status: 'done' },
            { id: 'sum-06', title: '第七节纪要·新民主主义革命三大法宝', type: 'document', status: 'done' },
            { id: 'sum-07', title: '第八节纪要·社会主义改造理论（上）', type: 'document', status: 'done' },
            { id: 'sum-08', title: '第九节纪要·社会主义改造理论（下）', type: 'document', status: 'done' },
            { id: 'sum-09', title: '第十二节纪要·毛泽东思想活的灵魂', type: 'document', status: 'done' },
            { id: 'sum-10', title: '第十四节纪要·邓小平理论', type: 'document', status: 'done' },
            { id: 'sum-11', title: '第十五节纪要·一国两制与祖国统一', type: 'document', status: 'done' },
            { id: 'sum-12', title: '补充课纪要·期末复习', type: 'document', status: 'done' },
          ],
        },
      ],
    },
    {
      id: 'other',
      name: '其他',
      icon: 'FolderOpen',
      categories: [
        {
          id: 'misc',
          name: '工具',
          items: [
            { id: 'exam-source', title: '历届真题资源包', type: 'document', status: 'done', renderType: 'html' },
          ],
        },
        {
          id: 'gongshi',
          name: '公式',
          items: [
            { id: 'gongshi', title: '概率论公式', type: 'document', status: 'done', renderType: 'html' },
          ],
        },
        {
          id: 'guihua',
          name: '规划',
          items: [
            { id: 'schedule', title: '复习计划', type: 'document', status: 'done', renderType: 'html' },
          ],
        },
      ],
    },
  ],
};

/**
 * @deprecated 仅覆盖概率论 detail 分类。新代码应直接使用 contentTree。
 * 保留此导出供页面路由等旧消费方兼容。
 */
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
