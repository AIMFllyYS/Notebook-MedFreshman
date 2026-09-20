/**
 * common 命名空间（中文真相源）—— 跨模块复用的**通用动作词**。
 *
 * 为什么单开一个顶层命名空间：这几个词在设置页 / 右键菜单 / 分享弹窗 / 划词助手 / 窗口错误态里
 * 各自存过一份**逐字相同**的副本（取消 ×4、重试 ×3、复制 ×3、已复制 ×2），改一次文案要全仓找。
 * 收口后每个词只有一个 key。
 *
 * 没有并进来的近义词（中文同形，但语义不同 —— 见各自 key 上的注释）：
 * - 「关闭」：panel.common.close（关掉窗口/浮层）≠ menu.thinking.off.label / share.assets.disable（关掉开关）；
 * - 「失败」：window.common.failed（操作失败的结果）≠ trace.step.status.error / menu.history.status.error（状态词）。
 */
export const commonZh = {
  cancel: "取消",
  retry: "重试",
  copy: "复制",
  copied: "已复制",
};
