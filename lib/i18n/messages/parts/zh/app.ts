/**
 * app 命名空间（中文真相源）—— 应用级外壳：顶栏、加载态、灯箱、登录与人机验证。
 *
 * 与其它分片的分工：agent / settings / menu / panel / trace / window 各自管一块界面，
 * 这里管「这些界面之外、但不属于 Studio 章节与正文」的那层壳。
 * Studio 的章节名、教材与笔记正文**不在 i18n 范围内**（用户口径）。
 */
export const appZh = {
  topbar: {
    expandNav: "展开导航",
    collapseNav: "收起导航",
    expandTopBar: "展开顶部导航栏",
    collapseTopBar: "收起顶部导航栏",
    enterFullscreen: "全屏",
    exitFullscreen: "退出全屏",
    expandDock: "展开右侧工作区",
    collapseDock: "收起右侧工作区",
    expandAiPanel: "展开 AI 面板",
    closeSidebar: "关闭侧栏",
  },
  loading: {
    label: "加载中",
  },
  sourcesToggle: {
    show: "显示来源",
    hide: "隐藏来源",
  },
  lightbox: {
    label: "图片查看",
    close: "关闭",
    zoomIn: "放大",
    zoomOut: "缩小",
    reset: "重置",
    download: "下载图片",
  },
  account: {
    guest: "访客",
    aria: "账户 {name}",
  },
};
