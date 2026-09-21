/**
 * 中文词典——本期 i18n 的**唯一真相源**。
 *
 * 为什么中文是真相源：仓库现有文案全是中文，迁移时只做「把字面量搬进字典」这一件事，
 * 不做二次创作；en.ts 用 `satisfies LocaleMessages` 对齐它的形状，漏 key 会在 typecheck 直接报错。
 * 取值统一走 dot-path（如 `agent.nav.assets`），嵌套只用于分组，不参与拼 key。
 *
 * 本文件只留 `agent`（上一轮迁完的那一批）。设置 / 菜单 / 面板 / 思考链四块各自在
 * `parts/zh/<namespace>.ts` 里维护，在这里合并 —— 分片是为了让几路并行迁移时
 * 各改各的文件，不在合并阶段互相覆盖。
 */
import { appZh } from "./parts/zh/app";
import { commonZh } from "./parts/zh/common";
import { menuZh } from "./parts/zh/menu";
import { panelZh } from "./parts/zh/panel";
import { settingsZh } from "./parts/zh/settings";
import { shareZh } from "./parts/zh/share";
import { traceZh } from "./parts/zh/trace";
import { windowZh } from "./parts/zh/window";

export const zh = {
  app: appZh,
  common: commonZh,
  agent: {
    nav: {
      aria: "Agent 板块导航",
      newChat: "新对话",
      assets: "我的资产",
      scheduled: "定时任务",
      plugins: "插件市场",
    },
    sidebar: {
      title: "对话",
      search: "全局搜索",
      collapse: "折叠侧边栏",
      projects: "项目",
      recents: "最近",
      archived: "已归档",
      newProject: "新建项目",
      backToList: "返回对话列表",
      viewArchived: "查看已归档对话",
      more: "还有 {count} 个",
      project: {
        name: "项目名称",
        newChat: "在「{name}」里新建对话",
        rename: "重命名项目",
      },
      empty: {
        project: "空项目",
        notes: "暂无笔记对话",
        selection: "暂无划词对话",
        recents: "暂无对话",
        archived: "没有归档的对话",
      },
    },
    session: {
      rename: "对话名称",
      untitled: "新对话",
      empty: "空对话",
      messageCount: "{count} 条消息",
    },
    menu: {
      aria: "对话整理",
      newChat: "新建对话",
      newChatInProject: "在此新建对话",
      renameSession: "重命名",
      moveToProject: "移动到项目",
      removeFromProject: "移出项目",
      systemNote: "这一组由来源决定（笔记窗内的 Agent），不能改挂到别的项目。",
      systemFloating: "这一组由来源决定（划词助手），不能改挂到别的项目。",
      archive: "归档",
      deleteSession: "删除对话",
      deleteProject: "删除项目",
      deleteSessionConfirm: "删除后云端记录一并删除，无法恢复。",
      deleteProjectConfirm: "删除项目后，里面的对话会退回 Recents（对话本身不删）。",
      confirmDelete: "删除",
    },
    center: {
      tab: {
        answer: "回答",
        links: "来源",
        images: "图片",
      },
      tabs: {
        aria: "内容视图",
      },
    },
    sources: {
      // 窗口标题（右侧面板标签条会原样显示 win.title）
      traceWindowTitle: "来源追踪 · {count} 条",
      webWindowTitle: "联网来源 · {count} 条",
      untitled: "未命名来源",
      count: "来源 · {count}",
      openPanel: "打开来源面板",
      query: "搜索「{query}」",
      empty: "本轮没有可追踪的引用依据。",
      noLink: "暂无链接",
    },
    rail: {
      count: "参考 · {count}",
      sources: "来源",
      quiz: "出题 · {count}",
      interactive: "演示 · {count}",
      document: "文档 · {count}",
      questions: "{count} 题",
      openQuiz: "在右侧作答",
      openInteractive: "在右侧查看演示",
      openDocument: "在右侧查看文档",
    },
    citation: {
      markerAria: "来源 {index}：{title}",
      kindWeb: "网页",
      kindNote: "教材",
      open: "点击查看来源",
      untitled: "未命名来源",
    },
    links: {
      empty: "这次对话还没有可追溯的来源。",
    },
    images: {
      empty: "这次对话还没有图片。",
      search: "搜索到的图片",
      generated: "生成的图片",
    },
    quiz: {
      empty: "出题失败：没有可渲染的题目。",
      card: {
        title: "{title} · {count} 题",
      },
      redo: "重做",
      progress: "已反馈 {done} / {total}",
      dropped: "（有 {count} 道题因结构不完整被丢弃）",
      dock: {
        title: "出题",
        open: "在右侧作答",
        created: "已出题 · {count} 题",
      },
      intent: {
        check: "即时检验",
        diagnose: "漏洞诊断",
        practice: "练习",
        exam: "小测",
      },
      reveal: {
        blank: "查看答案",
        multiple: "确认并查看对错",
        default: "查看解析",
      },
    },
    selection: {
      title: "划词 · {snippet}",
    },
    dock: {
      collapse: "收起右侧面板",
      global: "全屏显示这个板块",
      shrink: "缩小到右栏",
    },
  },
  settings: settingsZh,
  menu: menuZh,
  panel: panelZh,
  trace: traceZh,
  window: windowZh,
  share: shareZh,
};
