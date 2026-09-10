# docs/archive

本目录存放从仓库跟踪中移除、但仍有查阅价值的历史材料。

## trae-specs/

来源：`.trae/specs/*/spec.md`（Trae 工具私有目录，已从 git 索引移除）。

每个文件对应一次历史内容整合或架构升级规格，只归档 `spec.md`，不含当时的 `tasks.md` / `checklist.md`。

| 文件 | 主题 |
|------|------|
| `integrate-maogai-content.md` | 毛概学科内容整合 |
| `integrate-organic-chemistry-content.md` | 有机化学内容整合 |
| `integrate-modern-history-content.md` | 中国近现代史纲要纪要补全 |
| `quick-explain-window-upgrade.md` | 划词快捷解释浮窗升级 |
| `unify-viz-and-multi-subject-sop.md` | 统一可视化与多学科 SOP 架构 |
| `upgrade-ai-chat-and-architecture.md` | AI 对话系统升级与架构规范化 |

`.claude/workflows/*.js` 是已被 `scripts/` 取代的旧生成脚本，不归档。

## 简化版本/

概率论与数理统计的独立自学笔记草稿（README + Lesson_01~18，共 19 个文件），与 `content/` 里课堂录音驱动的正式课件是两套体系，不受本仓库代码重构影响。原先误放在 `docs/` 根目录，现移入本目录以免与项目规范文档混淆；正文未改动。

## REWRITE-LOOP.md

大二上医学教材富文本改写循环的任务专属操作卡，原在仓库根目录。任务已完成（五科教材整科收口），其中可复用的反降质机制已沉淀进 `docs/sop/00-infrastructure.md`「内容生产闭环与反降质契约」及 `01`/`02`/`02b`/`03`/`04` 各自的验收细节，现移入本目录仅作历史操作记录保留，不再被其他文档引用。
