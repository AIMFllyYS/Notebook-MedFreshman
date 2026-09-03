import type { ContentTree } from '@/lib/types/content';
import { subjectHeader } from './subjects.registry';
import { category, stubCategory, stubTextbookItem } from './category-templates';
import { probabilityDetailItems, probabilityRecordings } from './probability-detail';
import { modernHistoryDetailItems, modernHistoryRecordings } from './modern-history-detail';
import { modernHistoryTextbookItems } from './modern-history-textbook';
import { organicChemistryDetailItems } from './organic-chemistry-detail';
import { maogaiDetailItems } from './maogai-detail';
import { maogaiTextbookItems } from './maogai-textbook';
import { physicsDetailItems } from './physics-detail';
import { physicsLectures } from './physics-lectures';
import { recordingItems, summaryItems } from './recordings';
import { sophomoreCategorySkeleton } from './sophomore-categories';
import { cellBiologyTextbookItems } from './cell-biology-textbook';
import { biochemistryTextbookItems } from './biochemistry-textbook';
import { anatomyTextbookItems } from './anatomy-textbook';
import { histologyTextbookItems } from './histology-textbook';
import { instrumentalAnalysisTextbookItems } from './instrumental-analysis-textbook';


const physicsKaoqianMoniItems = [
  { id: 'sim-01', title: '大学物理期末模拟试卷一（押题A卷）', type: 'document' as const, status: 'done' as const },
  { id: 'sim-02', title: '大学物理期末模拟试卷二（押题B卷）', type: 'document' as const, status: 'done' as const },
  { id: 'sim-03', title: '大学物理期末模拟试卷三（押题C卷）', type: 'document' as const, status: 'done' as const },
  { id: 'sim-04', title: '大学物理期末模拟试卷四（华科第一套）', type: 'document' as const, status: 'done' as const },
  { id: 'sim-05', title: '大学物理期末模拟试卷五（华科第二套）', type: 'document' as const, status: 'done' as const },
  { id: 'sim-06', title: '大学物理期末模拟试卷六（华科第三套）', type: 'document' as const, status: 'done' as const },
];

const chemistryKaoqianMoniItems = [
  { id: 'sim-01', title: '有机化学期末模拟试卷一', type: 'document' as const, status: 'done' as const },
  { id: 'sim-02', title: '有机化学期末模拟试卷二', type: 'document' as const, status: 'done' as const },
  { id: 'sim-03', title: '有机化学期末模拟试卷三', type: 'document' as const, status: 'done' as const },
  { id: 'real-01', title: '有机化学期末真题模拟卷（一）', type: 'document' as const, status: 'done' as const },
  { id: 'real-02', title: '有机化学期末真题模拟卷（二）', type: 'document' as const, status: 'done' as const },
  { id: 'real-03', title: '有机化学期末真题模拟卷（三）', type: 'document' as const, status: 'done' as const },
  { id: 'real-04', title: '华中科技大学有机化学期末真题（四）2021-2022', type: 'document' as const, status: 'done' as const },
  { id: 'real-05', title: '华中科技大学有机化学期末真题（五）2023-2024', type: 'document' as const, status: 'done' as const },
];

const maogaiShizhanYanlianItems = [
  { id: 'maogai-practice-unit-intro-01', title: '导论·马克思主义中国化单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-01-mao-thought-01', title: '第一章·毛泽东思想及其历史地位 单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-02-new-democracy-01', title: '第二章·新民主主义革命理论 单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-03-socialist-transform-01', title: '第三章·社会主义改造理论 单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-04-socialist-explore-01', title: '第四章·社会主义建设道路初步探索 单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-06-deng-theory-01', title: '第六章·邓小平理论 单元真题训练', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-practice-unit-08-scientific-dev-01', title: '第八章·科学发展观 单元真题训练', type: 'document' as const, status: 'done' as const },
];

const probabilityKaoqianMoniItems = [
  { id: 'kaodian-01', title: '考点一·排列组合问题', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-02', title: '考点二·概率基本概念与计算', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-03', title: '考点三·贝叶斯公式', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-04', title: '考点四·随机变量及其分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-05', title: '考点五·离散型随机变量的分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-06', title: '考点六·连续型随机变量的分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-07', title: '考点七·随机变量函数的分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-08', title: '考点八·多维随机变量与条件分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-09', title: '考点九·随机变量的独立性', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-10', title: '考点十·多维随机变量函数的分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-11', title: '考点十一·期望与方差', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-12', title: '考点十二·协方差与相关系数', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-13', title: '考点十三·大数定律和中心极限定理', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-14', title: '考点十四·总体与样本', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-15', title: '考点十五·三大分布', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-16', title: '考点十六·矩估计和极大似然估计', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-17', title: '考点十七·区间估计', type: 'document' as const, status: 'done' as const },
  { id: 'kaodian-18', title: '考点十八·综合题', type: 'document' as const, status: 'done' as const },
  { id: 'exam-01', title: '2019-2020学年第二学期期末考试B卷', type: 'document' as const, status: 'done' as const },
  { id: 'exam-02', title: '2021-2022学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'exam-03', title: '2021-2022学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'exam-04', title: '2022-2023学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'exam-05', title: '2022-2023学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'exam-06', title: '2023-2024学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'mock-ai-01', title: 'AI押题模拟卷一·ChatGPT生成', type: 'document' as const, status: 'done' as const },
  { id: 'mock-ai-02', title: 'AI押题模拟卷二·Claude生成', type: 'document' as const, status: 'done' as const },
  { id: 'mock-ai-03', title: 'AI押题模拟卷三·Perplexity生成', type: 'document' as const, status: 'done' as const },
];

const probabilityShizhanYanlianItems = [
  { id: 'real-01', title: '2019-2020学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-02', title: '2019-2020学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-03', title: '2020-2021学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-04', title: '2021-2022学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-05', title: '2021-2022学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-06', title: '2022-2023学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-07', title: '2022-2023学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-08', title: '2023-2024学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-09', title: '2023-2024学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-10', title: '2024-2025学年第一学期期末考试A卷', type: 'document' as const, status: 'done' as const },
  { id: 'real-11', title: '2024-2025学年第二学期期末考试A卷', type: 'document' as const, status: 'done' as const },
];

const modernHistoryKaoqianMoniItems = [
  { id: 'modern-history-mock-final-paper-01', title: '纲要2026期末押题模拟试卷一（Claude生成）', type: 'document' as const, status: 'done' as const },
  { id: 'modern-history-mock-final-paper-02', title: '纲要2026期末押题模拟试卷二（Claude生成）', type: 'document' as const, status: 'done' as const },
  { id: 'modern-history-mock-final-paper-03', title: '纲要2026期末押题模拟试卷三（Claude生成）', type: 'document' as const, status: 'done' as const },
  { id: 'modern-history-mock-final-paper-04', title: '纲要2026期末押题冲刺卷一（Perplexity生成）', type: 'document' as const, status: 'done' as const },
  { id: 'modern-history-mock-final-paper-05', title: '纲要2026期末押题冲刺卷二（Perplexity生成）', type: 'document' as const, status: 'done' as const },
  { id: 'modern-history-mock-final-paper-06', title: '纲要2026期末押题冲刺卷三（Perplexity生成）', type: 'document' as const, status: 'done' as const },
];

const maogaiKaoqianMoniItems = [
  { id: 'maogai-mock-final-paper-01', title: '毛概2026期末押题模拟试卷一', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-mock-final-paper-02', title: '毛概2026期末押题模拟试卷二', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-mock-final-paper-03', title: '毛概2026期末押题模拟试卷三', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-mock-final-paper-04', title: '毛概2026期末押题模拟卷·基础巩固（第一套）', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-mock-final-paper-05', title: '毛概2026期末押题模拟卷·中等难度（第二套）', type: 'document' as const, status: 'done' as const },
  { id: 'maogai-mock-final-paper-06', title: '毛概2026期末押题模拟卷·提高冲刺（第三套）', type: 'document' as const, status: 'done' as const },
];

export const contentTree: ContentTree = {
  subjects: [
    {
      ...subjectHeader('probability'),
      categories: [
        category('textbook', [
            { id: 'main-textbook', title: '概率论与数理统计（教材）', type: 'document', status: 'stub' },
          ]),
        category('detail', probabilityDetailItems),
        category('recording', [
            { id: 'rec-01', title: '第一节·课程导论与概率史', type: 'document', status: 'done' },
            { id: 'rec-02', title: '第二节·事件代数与概率公理', type: 'document', status: 'done' },
            { id: 'rec-03', title: '第三节·条件概率与贝叶斯', type: 'document', status: 'done' },
            { id: 'rec-04', title: '第四节·离散随机变量与常见分布', type: 'document', status: 'done' },
            { id: 'rec-07', title: '第七节·正态分布与连续分布', type: 'document', status: 'done' },
            { id: 'rec-08', title: '第八节·多维随机变量与联合分布', type: 'document', status: 'done' },
            { id: 'rec-09', title: '第九节·边缘分布与条件分布', type: 'document', status: 'done' },
            { id: 'rec-10', title: '第十节·独立性与多维函数分布', type: 'document', status: 'done' },
            { id: 'rec-11', title: '第十一节·多维总结与期望引入', type: 'document', status: 'done' },
            { id: 'rec-12', title: '第十二节·期望性质与柯西不等式', type: 'document', status: 'done' },
            { id: 'rec-13', title: '第十三节·方差与标准化', type: 'document', status: 'done' },
            { id: 'rec-14', title: '第十四节·相关系数与大数定律', type: 'document', status: 'done' },
            { id: 'rec-15', title: '第十五节·大数定律与中心极限定理', type: 'document', status: 'done' },
            { id: 'rec-16', title: '第十六节·样本与抽样分布', type: 'document', status: 'done' },
            { id: 'rec-17', title: '第十七节·三大分布与分位点', type: 'document', status: 'done' },
          ]),
        category('summary', [
            { id: 'sum-01', title: '第一节·课程导论与概率史', type: 'document', status: 'done' },
            { id: 'sum-02', title: '第二节·事件代数与概率公理', type: 'document', status: 'done' },
            { id: 'sum-03', title: '第三节·条件概率与贝叶斯', type: 'document', status: 'done' },
            { id: 'sum-04', title: '第四节·离散随机变量与常见分布', type: 'document', status: 'done' },
            { id: 'sum-07', title: '第七节·正态分布与连续分布', type: 'document', status: 'done' },
            { id: 'sum-08', title: '第八节·多维随机变量与联合分布', type: 'document', status: 'done' },
            { id: 'sum-09', title: '第九节·边缘分布与条件分布', type: 'document', status: 'done' },
            { id: 'sum-10', title: '第十节·独立性与多维函数分布', type: 'document', status: 'done' },
            { id: 'sum-11', title: '第十一节·多维总结与期望引入', type: 'document', status: 'done' },
            { id: 'sum-12', title: '第十二节·期望性质与柯西不等式', type: 'document', status: 'done' },
            { id: 'sum-13', title: '第十三节·方差与标准化', type: 'document', status: 'done' },
            { id: 'sum-14', title: '第十四节·相关系数与大数定律', type: 'document', status: 'done' },
            { id: 'sum-15', title: '第十五节·大数定律与中心极限定理', type: 'document', status: 'done' },
            { id: 'sum-16', title: '第十六节·样本与抽样分布', type: 'document', status: 'done' },
            { id: 'sum-17', title: '第十七节·三大分布与分位点', type: 'document', status: 'done' },
          ]),
        category('kaoqian-moni', probabilityKaoqianMoniItems),
        category('shizhan-yanlian', probabilityShizhanYanlianItems),
      ],
    },
    {
      ...subjectHeader('physics'),
      categories: [
        category('textbook', [stubTextbookItem('大学物理（教材）')]),
        category('detail', physicsDetailItems),
        category('recording', recordingItems(physicsLectures)),
        category('summary', summaryItems(physicsLectures)),
        category('kaoqian-moni', physicsKaoqianMoniItems),
        stubCategory('shizhan-yanlian'),
      ],
    },
    {
      ...subjectHeader('chemistry'),
      categories: [
        category('textbook', [stubTextbookItem('有机化学（教材）')]),
        category('detail', organicChemistryDetailItems),
        category('recording', [
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
          ]),
        category('summary', [
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
          ]),
        category('kaoqian-moni', chemistryKaoqianMoniItems),
        stubCategory('shizhan-yanlian'),
      ],
    },
    {
      ...subjectHeader('modern-history'),
      categories: [
        category('textbook', modernHistoryTextbookItems),
        category('detail', modernHistoryDetailItems),
        category('recording', [
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
          ]),
        category('summary', [
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
          ]),
        category('kaoqian-moni', modernHistoryKaoqianMoniItems),
        category('shizhan-yanlian', [
            { id: 'placeholder', title: '敬请期待', type: 'document' as const, status: 'stub' as const },
          ]),
      ],
    },
    {
      ...subjectHeader('maogai'),
      categories: [
        category('textbook', maogaiTextbookItems),
        category('detail', maogaiDetailItems),
        category('recording', [
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
          ]),
        category('summary', [
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
          ]),
        category('kaoqian-moni', maogaiKaoqianMoniItems),
        category('shizhan-yanlian', maogaiShizhanYanlianItems),
      ],
    },
    {
      ...subjectHeader('cell-biology'),
      categories: sophomoreCategorySkeleton(cellBiologyTextbookItems),
    },
    {
      ...subjectHeader('biochemistry'),
      categories: sophomoreCategorySkeleton(biochemistryTextbookItems),
    },
    {
      ...subjectHeader('anatomy'),
      categories: sophomoreCategorySkeleton(anatomyTextbookItems),
    },
    {
      ...subjectHeader('histology'),
      categories: sophomoreCategorySkeleton(histologyTextbookItems),
    },
    {
      ...subjectHeader('instrumental-analysis'),
      categories: sophomoreCategorySkeleton(instrumentalAnalysisTextbookItems),
    },
    {
      ...subjectHeader('other'),
      // 「其他」是杂项容器，板块非标准，直接声明完整 Category（含 capabilities）。
      categories: [
        {
          id: 'english',
          name: '英语练习',
          capabilities: ['examples', 'quiz'],
          keyStrategy: 'item',
          items: [
            { id: 'unit-1', title: '大学英语 Unit 1 · The True Value of Education', type: 'document', status: 'done' },
            { id: 'unit-2', title: '大学英语 Unit 2 · The Myth of a Dream Job', type: 'document', status: 'done' },
            { id: 'unit-3', title: '大学英语 Unit 3 · The Business of Life', type: 'document', status: 'done' },
            { id: 'unit-4', title: '大学英语 Unit 4 · Explore the Unknown', type: 'document', status: 'done' },
            { id: 'unit-5', title: '大学英语 Unit 5 · The Power of Language', type: 'document', status: 'done' },
            { id: 'unit-6', title: '大学英语 Unit 6 · Technology and Human Connection', type: 'document', status: 'done' },
            { id: 'unit-7', title: '大学英语 Unit 7 · The Art of Innovation', type: 'document', status: 'done' },
            { id: 'unit-8', title: '大学英语 Unit 8 · Nature and Human Society', type: 'document', status: 'done' },
          ],
        },
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
