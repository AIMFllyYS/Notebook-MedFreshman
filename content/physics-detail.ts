import type { ContentItem } from '@/lib/types/content';

/**
 * 大学物理 · 详解分类内容
 * 12 章 38 节，源自课件 PPT（第2-5、7-9、10-14章；无第1、6章课件）。
 */
export const physicsDetailItems: ContentItem[] = [
  {
    id: 'ch02',
    title: '流体运动',
    type: 'section',
    status: 'done',
    summary: '理想流体、连续性方程、伯努利方程、黏性流体与血液流动。',
    children: [
      { id: '2.1', title: '理想流体的稳定流动与连续性方程', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '2.2', title: '伯努利方程及其应用', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '2.3', title: '黏性流体、泊肃叶定律与血液流动', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch03',
    title: '振动',
    type: 'section',
    status: 'done',
    summary: '简谐振动、振动合成、阻尼振动与受迫振动。',
    children: [
      { id: '3.1', title: '简谐振动', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '3.2', title: '简谐振动的合成', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '3.3', title: '阻尼振动、受迫振动和共振', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch04',
    title: '机械波',
    type: 'section',
    status: 'done',
    summary: '平面简谐波、波的能量与干涉、多普勒效应与声波。',
    children: [
      { id: '4.1', title: '机械波的特点与平面简谐波', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '4.2', title: '波的能量、衍射、干涉与驻波', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '4.3', title: '多普勒效应与声波', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch05',
    title: '分子动理论',
    type: 'section',
    status: 'done',
    summary: '理想气体状态方程、压强与能量公式、速率分布、液体表面现象。',
    children: [
      { id: '5.1', title: '分子动理论基本概念与理想气体', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '5.2', title: '气体分子速率分布与液体表面现象', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch07',
    title: '静电场',
    type: 'section',
    status: 'done',
    summary: '库仑定律、电场强度、高斯定理、电势、电偶极子。',
    children: [
      { id: '7.1', title: '电荷、库仑定律与电场强度', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '7.2', title: '电场线、电通量与高斯定理', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '7.3', title: '静电场的环路定理、电势与场强关系', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '7.4', title: '电偶极子与电偶层', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch08',
    title: '稳恒磁场',
    type: 'section',
    status: 'done',
    summary: '磁感应强度、毕奥—萨伐尔定律、安培环路定理、洛伦兹力与霍尔效应。',
    children: [
      { id: '8.1', title: '磁场与磁感应强度', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '8.2', title: '电流的磁场与毕奥—萨伐尔定律', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '8.3', title: '安培环路定理', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '8.4', title: '磁场对运动电荷与载流导线的作用', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch09',
    title: '电磁感应与电磁波',
    type: 'section',
    status: 'done',
    summary: '法拉第定律、动生与感生电动势、自感互感、麦克斯韦方程组。',
    children: [
      { id: '9.1', title: '法拉第电磁感应定律', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '9.2', title: '动生电动势与感生电动势', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '9.3', title: '自感、互感与磁场能量', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '9.4', title: '麦克斯韦方程组与电磁波', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch10',
    title: '几何光学',
    type: 'section',
    status: 'done',
    summary: '球面折射、薄透镜成像、眼的光学、放大镜与显微镜。',
    children: [
      { id: '10.1', title: '几何光学基础与单球面折射', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '10.2', title: '薄透镜成像与透镜组合', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '10.3', title: '眼的光学结构与调节', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '10.4', title: '放大镜与显微镜', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch11',
    title: '波动光学',
    type: 'section',
    status: 'done',
    summary: '光的干涉（双缝、薄膜、牛顿环）、衍射（单缝、光栅）、偏振。',
    children: [
      { id: '11.1', title: '光的相干性与干涉', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '11.2', title: '光的衍射现象', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '11.3', title: '光的偏振现象', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch12',
    title: '量子力学初步',
    type: 'section',
    status: 'done',
    summary: '黑体辐射、光电效应、玻尔模型、物质波、薛定谔方程。',
    children: [
      { id: '12.1', title: '黑体辐射与能量量子化', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '12.2', title: '氢原子光谱与原子模型', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '12.3', title: '微观粒子的波粒二象性', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '12.4', title: '波函数与统计解释', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch13',
    title: '原子核和放射性',
    type: 'section',
    status: 'done',
    summary: '原子核组成、结合能、放射性衰变类型与规律。',
    children: [
      { id: '13.1', title: '原子核的组成与基本性质', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '13.2', title: '天然放射性与衰变类型', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
  {
    id: 'ch14',
    title: 'X射线与激光',
    type: 'section',
    status: 'done',
    summary: 'X射线的产生与性质、激光的发光原理与特点。',
    children: [
      { id: '14.1', title: 'X 射线的产生与性质', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
      { id: '14.2', title: '激光的特点与发光原理', type: 'section', status: 'done', videoIds: [], interactiveIds: [] },
    ],
  },
];
