# docs/prompt

存放给 AI 派发具体任务时用的**提示词模板**，不是操作规范本身（操作规范在 `docs/sop/`）。这里的模板负责"怎么把 SOP 的要求正确地喂给一次具体的任务派发"。

| 文件 | 用途 |
|---|---|
| [`goal-model.md`](./goal-model.md) | 通用「Goal Model」提示词模板：派发"把一批东西同步/生成进某个位置"这类内容任务时使用，强制 AI 自己读规范、自己守住反降质红线，而不是靠派发者复述一遍规范 |
| [`sync-quiz.md`](./sync-quiz.md) | 批量增加题目（对应 SOP `04`） |
| [`sync-textbook.md`](./sync-textbook.md) | 批量整理教材（对应 SOP `01`） |
| [`sync-courseware.md`](./sync-courseware.md) | 批量整理课件 → 落地为详解板块（对应 SOP `02`/`02b`） |
| [`sync-recording.md`](./sync-recording.md) | 批量整理课堂录音（对应 SOP `03`） |

四份 `sync-*.md` 是 `goal-model.md` 针对内容生产四大场景的现成填空版，直接抄改花括号占位就能派发；派发的都是同一套四段结构（先自行分析规范 → 涉及位置 → 禁令 → 需要更新的内容），场景之间只换 Context/禁令/交付物三块。

## 使用场景

任何要求 AI 往 `content/**`、`docs/**` 或代码里写入结构化产出的一次性任务派发，都应该照这个模板写 prompt，而不是随手一句话描述需求。它的存在理由见 `docs/sop/00-infrastructure.md`「内容生产闭环与反降质契约」——同样的降质风险不会因为你换了个任务场景就消失，模板把这条契约的核心红线固化进了每一次派发。
