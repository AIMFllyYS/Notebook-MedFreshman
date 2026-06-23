# 09 — 概率论课堂录音清洗与纪要生成

> **执行方式**：独立 Chat · 可并行
> **后续任务**：完成后执行 [10-probability-recording-quiz.md](./10-probability-recording-quiz.md)

---

## 任务概述

将 15 个飞书导出的概率论课堂录音逐字稿（`.txt`）清洗为平台标准格式的「课上录音」，并生成结构化「课堂纪要」。同时修复 `probability-detail.ts` 中遗漏的第九节映射，更新 `manifest.ts` 注册全部 15 讲录音与纪要。

## 提示词

```
你是内容处理主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 任务
将概率论课堂录音逐字稿清洗为平台标准录音文件，并生成结构化课堂纪要。

## 核心约束
1. 源文件全部为飞书 ASR 导出的 .txt 逐字稿，**不需要 MinerU API 解析**，直接用 Read 工具读取即可
2. rec-ID 按实际讲次编号（rec-01~04, rec-07~17），跳过不存在的 rec-05/rec-06
3. 每个 rec-{NN} 必须对应一个 sum-{NN}，一一配对
4. 概率论是理工科，纪要中需特别注意**数学公式**的准确还原（ASR 无法识别公式，需根据上下文推断并用 LaTeX 标记）
5. 排除"概率论数理统计.txt"（无明确讲次编号的最后一个文件），只处理 15 个文件

## 必读 SOP（在开始前完整阅读）
1. docs/sop/03-recording-processing.md — 录音清洗与纪要生成完整规范
2. docs/sop/05-content-integration.md — manifest 注册与 AI 工具验证
3. docs/sop/README.md — 全局规范（subagent 分工铁律）

## 源文件清单与映射表

所有文件位于：D:\飞书文档保存\概率论与数理统计课堂录音和纪要\

| rec-ID | 源文件名 | 讲次 | 主题（从关键词/内容推断） | 对应教材章节 |
|--------|---------|------|------------------------|------------|
| rec-01 | 概率论与数理统计-第一节.txt | 1 | 课程导论·概率史·样本空间 | ch01 |
| rec-02 | 概率论-第二节.txt | 2 | 事件代数·σ域·概率公理·古典概型 | ch01 |
| rec-03 | 概率论-第三节.txt | 3 | 条件概率·乘法公式·全概率·贝叶斯 | ch01 |
| rec-04 | 概率论-第四节.txt | 4 | 离散随机变量·伯努利·二项·泊松 | ch01→ch02 |
| rec-07 | 概率论-第7节.txt | 7 | 正态分布·3σ规则·均匀·指数分布 | ch02 |
| rec-08 | 概率论-第8节.txt | 8 | 多维随机变量·联合/边缘CDF·二维离散/连续 | ch03 |
| rec-09 | 概率论-第九节.txt | 9 | 二维均匀/正态·边缘密度·条件分布 | ch03 |
| rec-10 | 概率论第十节多维随机变量分布讲解.txt | 10 | 独立性·二维随机变量函数·泊松可加性 | ch03 |
| rec-11 | 概率论第十一节.txt | 11 | ch03总结·ch04期望引入 | ch03→ch04 |
| rec-12 | 概率论第十二节.txt | 12 | 期望性质·柯西-施瓦茨不等式 | ch04 |
| rec-13 | 概率论第13节 随机变量期望方差性质讲解.txt | 13 | 方差·标准化·矩·偏度·峰度 | ch04 |
| rec-14 | 概率论第14节 相关系数与大数定律讲解.txt | 14 | 协方差·相关系数·独立vs不相关·大数定律引入 | ch04→ch05 |
| rec-15 | 概率论第15节 概率论数理统计.txt | 15 | 大数定律·切比雪夫·伯努利·辛钦·中心极限定理 | ch05 |
| rec-16 | 概率论第16节 统计课程之样本与分布讲解.txt | 16 | 简单随机样本·经验分布·统计量 | ch06 |
| rec-17 | 概率论-第17节.txt | 17 | χ²分布·t分布·F分布·分位点·历年考题 | ch06 |

## PADC 流程

### Phase P（Plan）
1. 读取 SOP 03 确认清洗和纪要生成规范
2. 读取上表中所有 15 个源 .txt 文件（使用 Read 工具直接读取，无需解析脚本）
3. 确认 content/probability/recording/ 和 content/probability/summary/ 目录需要创建
4. 规划 subagent 分组方案（见下方）
5. 读取已有样例作为格式参考：
   - content/maogai/recording/rec-01.md（录音样例）
   - content/maogai/summary/sum-01.md（纪要样例）

### Phase A（Act）

#### 阶段 0：目录准备
确保以下目录存在：
```bash
mkdir -p content/probability/recording
mkdir -p content/probability/summary
```

#### 阶段 1：录音清洗（并行 subagent）
按以下分组派发 GeneralPurpose subagent（使用 dispatching-parallel-agents skill）：

| 组 | rec-ID 范围 | 对应章节 | 文件数 |
|----|-----------|---------|-------|
| 1 | rec-01 ~ rec-04 | ch01 (事件与概率) | 4 |
| 2 | rec-07 ~ rec-10 | ch02-ch03 (随机变量·多维) | 4 |
| 3 | rec-11 ~ rec-14 | ch03-ch05 (数字特征·大数定律) | 4 |
| 4 | rec-15 ~ rec-17 | ch05-ch06 (极限定理·抽样) | 3 |

每个 Cleaner subagent 的 prompt 模板：
```
你是录音清洗子智能体，负责概率论课堂录音清洗，处理范围：{rec-ID 范围}。

必读：docs/sop/03-recording-processing.md（Step 3 清洗规范）
参考样例：content/maogai/recording/rec-01.md

输入文件路径（使用 Read 工具直接读取 .txt）：
{传入具体文件路径列表}

概率论特殊要求（理工科）：
1. ASR 无法识别数学符号 — 需根据上下文推断并标记为 LaTeX
   - 听到"x的平方" → $x^2$
   - 听到"期望" → $E[X]$
   - 听到"西格玛" → $\sigma$
   - 听到"积分从负无穷到正无穷" → $\int_{-\infty}^{+\infty}$
2. 对于复杂公式推导段落，在清洗时添加注释标记：
   <!-- 此处为公式推导段落，ASR 可能有较多误识别 -->
3. 保留教师对考试重点的暗示（"这个要考"、"重点"、"划一下"）

清洗步骤：
1. 去噪：移除签到、闲聊、过度重复的口头禅
2. 说话人合并：同一说话人 <30s 间隔的连续段合并
3. 说话人标注：说话人1=教师，其他=学生
4. 保留所有课程内容相关对话、教师即兴举例、学生Q&A、考试提示

输出格式：
每个文件产出 content/probability/recording/rec-{NN}.md
模板：
# 第{N}节 · {主题} · 课堂录音整理
> 录音整理，含说话人标注与时间戳

说话人 1 {MM:SS}
{清洗后的文字内容}
...

完成后列出所有产出文件路径。

禁止：
- 不修改 manifest.ts
- 不生成纪要（由 Summarizer 负责）
- 不写入其他科目目录
```

#### 阶段 2：纪要生成（并行 subagent，与阶段 1 可串行也可部分重叠）
使用相同分组派发 Summarizer subagent：

每个 Summarizer subagent 的 prompt 模板：
```
你是纪要生成子智能体，负责概率论课堂纪要生成，处理范围：{rec-ID 范围}。

必读：docs/sop/03-recording-processing.md（Step 4 纪要生成规范）
参考样例：content/maogai/summary/sum-01.md

输入：
- 清洗后的录音文件：content/probability/recording/rec-{NN}.md
  若清洗尚未完成，可直接从原始 .txt 文件生成
- 概率论教材详解：content/chapters/ch{XX}/（对应章节的详解可作知识结构参考）

概率论特殊要求（理工科纪要）：
1. **教学要点** 中的公式必须用 LaTeX 精确表示
2. 每个要点尽量包含：文字描述 + 核心公式
3. **考试重点标注** ⚠️ 必须保留教师明确提到的考试信息
4. 增加"核心公式汇总"子章节（列出本节出现的所有重要公式）

纪要固定模板：
# 第{N}节 · {主题} · 课堂纪要

## 关键词
{5-8 个核心关键词，逗号分隔}

## 核心议题
- {议题1}
- {议题2}

## 教学要点

### {子主题1}
- {要点 + 公式}

## 核心公式汇总
| 名称 | 公式 |
|------|------|
| {公式名} | $...$ |

## 考试重点标注
- ⚠️ {教师明确提到"要考"/"重点"的内容}

## 课堂讨论/互动
- Q: {学生问题}
  A: {教师回答要点}

产出路径：content/probability/summary/sum-{NN}.md

完成后列出所有产出文件路径。

禁止：
- 不修改 manifest.ts
- 不生成录音文件（由 Cleaner 负责）
```

#### 阶段 3：数据修复
修复 content/probability-detail.ts 中的 probabilityRecordings 映射：

1. 在 ch03 数组开头添加 '概率论-第九节.txt'
2. 清空 ch07 数组（原来的 '概率论数理统计.txt' 已排除）
3. 确认修改后的完整映射：

```typescript
export const probabilityRecordings: Record<string, string[]> = {
  ch01: [
    '概率论与数理统计-第一节.txt',
    '概率论-第二节.txt',
    '概率论-第三节.txt',
    '概率论-第四节.txt',
  ],
  ch02: ['概率论-第7节.txt', '概率论-第8节.txt'],
  ch03: ['概率论-第九节.txt', '概率论第十节多维随机变量分布讲解.txt', '概率论第十一节.txt', '概率论第十二节.txt'],
  ch04: ['概率论第13节 随机变量期望方差性质讲解.txt', '概率论第14节 相关系数与大数定律讲解.txt'],
  ch05: ['概率论第15节 概率论数理统计.txt'],
  ch06: ['概率论第16节 统计课程之样本与分布讲解.txt', '概率论-第17节.txt'],
  ch07: [],
  ch08: [],
};
```

#### 阶段 4：manifest 注册
编辑 content/manifest.ts，将 probability 科目的 recording 和 summary categories 替换为完整条目：

```typescript
// recording — 15 讲（按实际讲次编号，跳过 rec-05/rec-06）
{
  id: 'recording',
  name: '课上录音',
  items: [
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
  ],
},

// summary — 15 讲，与 rec 一一对应
{
  id: 'summary',
  name: '课堂纪要',
  items: [
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
  ],
},
```

注意：title 中的主题应在清洗/纪要完成后根据实际内容微调，上述为基于预分析的初始值。

#### 阶段 5：搜索索引更新
新内容加入后需重建搜索索引以支持 AI searchNotes 工具：

```bash
pnpm run build-index
```

### Phase D（Debug）
1. 运行 `npx tsc --noEmit` 确认 probability-detail.ts 和 manifest.ts 无类型错误
2. 验证每个文件可读取：
   ```
   对每个 rec-{NN}：readContentMarkdown("probability", "recording", "rec-{NN}") 返回非空
   对每个 sum-{NN}：readContentMarkdown("probability", "summary", "sum-{NN}") 返回非空
   ```
3. 验证路径实际存在：content/probability/recording/rec-{NN}.md × 15
4. 验证路径实际存在：content/probability/summary/sum-{NN}.md × 15
5. 抽查数学公式格式（LaTeX $...$ 和 $$...$$ 正确使用）

### Phase C（Commit）
```bash
git add content/probability/recording/ content/probability/summary/ content/probability-detail.ts content/manifest.ts
git commit -m "feat(content): 概率论课堂录音清洗+纪要生成 (15讲, rec-01~17)"
```

## 产出规范

| 产出 | 路径 | 数量 |
|------|------|------|
| 清洗后录音 | content/probability/recording/rec-{NN}.md | 15 |
| 结构化纪要 | content/probability/summary/sum-{NN}.md | 15 |
| 修复后映射 | content/probability-detail.ts（probabilityRecordings 更新） | 1 |
| manifest 注册 | content/manifest.ts（recording + summary items 更新） | 1 |

## 禁止事项
- ✗ 不使用 MinerU API（源文件为 .txt，直接读取）
- ✗ 不写入 content/quiz/（属于 Plan 10）
- ✗ 不修改 content/chapters/ 下的详解文件
- ✗ 不处理"概率论数理统计.txt"（已排除）
- ✗ 不创建 rec-05、rec-06（源文件不存在）
- ✗ 不修改其他科目的录音/纪要

## 概率论 ASR 常见误识别对照表

供 Cleaner subagent 参考，处理飞书逐字稿中的数学术语还原：

| ASR 可能输出 | 实际含义 | LaTeX |
|-------------|---------|-------|
| 花f / 华夫 | σ域 | $\sigma$-域 |
| 西格玛 | σ (标准差) | $\sigma$ |
| 谬 / 缪 | μ (均值) | $\mu$ |
| 兰姆达 | λ | $\lambda$ |
| 派 | π | $\pi$ |
| x的平方 | x² | $x^2$ |
| 根号下 | √ | $\sqrt{\cdot}$ |
| e的负x次方 | e^(-x) | $e^{-x}$ |
| 期望 | E[X] | $E[X]$ |
| 方差 | D(X) / Var(X) | $D(X)$ |
| 标准差 | σ | $\sigma$ |
| 积分 | ∫ | $\int$ |
| 求和 | Σ | $\sum$ |
| 划标/标准化 | 标准化 | 标准化变换 $Z=\frac{X-\mu}{\sigma}$ |
| 切比雪夫 | Chebyshev | 切比雪夫不等式 |
| 棣莫弗 | De Moivre | 棣莫弗-拉普拉斯定理 |
```

---

## 依赖说明
- 本任务无前置依赖（可与其他 plan 并行启动）
- 本任务完成后，继续执行 [10-probability-recording-quiz.md](./10-probability-recording-quiz.md)
