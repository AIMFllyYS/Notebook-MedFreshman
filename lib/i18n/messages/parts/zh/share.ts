/**
 * share 命名空间（中文真相源）—— 对话分享（C 路由深链 + S 路由公开只读页）。
 */
export const shareZh = {
  action: "分享",
  failed: "分享失败，请稍后重试。",
  empty: "这条对话还没有内容可以分享。",
  loginRequired: "登录后才能生成分享链接。",
  page: {
    badge: "分享的对话",
    readonly: "只读",
    cta: "在 StudySolo 里打开",
    notFound: "分享不存在或已被撤回。",
    imagePlaceholder: "图片未随分享同步",
  },
  dialog: {
    title: "分享这条对话",
    intro: "生成链接后，任何拿到链接的人都能看到下面这些内容（只读）：",
    itemText: "对话正文、思考链与工具结果",
    itemSources: "引用过的笔记与网页来源",
    itemArtifacts: "对话里生成过的演示",
    warning: "图片不会随分享同步（云端同步本来就会剥掉媒体），分享页上只显示占位。",
    confirm: "生成分享链接",
    // 「正在生成…」的主语是**分享链接**，不要跟 window.imageGen.card.working 合并（那边是图片）。
    creating: "正在生成…",
    linkTitle: "分享链接已生成",
    hint: "链接长期有效，可在「我的资产 → 分享的链接」里随时关闭。",
  },
  assets: {
    tab: "分享的链接",
    loginRequired: "登录后才能查看分享链接。",
    toggleFailed: "操作失败，请稍后重试。",
    empty: "还没有分享过对话。",
    loading: "正在加载分享链接…",
    failed: "加载失败，请稍后重试。",
    enabled: "已开启",
    disabled: "已关闭",
    enable: "开启",
    // 这里是「把这个分享链接关掉」（英文 Turn off），不是 panel.common.close 的「关闭窗口」——
    // 中文同形、英文不同形，所以两份都留着。
    disable: "关闭",
    open: "打开",
    createdAt: "创建于 {time}",
  },
  route: {
    loading: "正在打开这条对话…",
    notFound: "找不到这条对话。",
    backToAgent: "回到 Agent",
  },
};
