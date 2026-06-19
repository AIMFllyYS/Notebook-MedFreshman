# Output 视频与例题迁移计划（ch04-ch18 → 项目 ch02-ch08）

## 概述

将 output 目录中剩余的 ch04-ch18 共 15 个章节的视频、KP 讲稿和 EX 例题，按照已验证的 ch01-ch03 试点方案，批量迁移到项目的 8 章 35 小节体系中。

## 决策记录

| 决策项 | 结论 | 理由 |
|--------|------|------|
| 无 mp4 的 KP | **不注册，跳过** | 只迁移有视频的 KP，保持 VideoEntry 一致性 |
| output ch07 | **完全跳过** | 与 ch04 内容高度重复 |

## 一、章节映射总表

| 项目章节 | 项目小节 | 来源 output 章节 |
|---------|---------|-----------------|
| **ch02 随机变量及其分布** | 2.2 离散型随机变量与常见分布 | ch04(6 KP mp4 + 5 EX mp4 + 5 EX md) |
| | 2.3 随机变量的分布函数 | ch05-KP02(CDF, 无 mp4→跳过) |
| | 2.4 连续型随机变量与常见连续分布 | ch05-KP05,06(有 mp4); ch05-EX01-05(仅 md) |
| | 2.5 随机变量函数的分布 | ch06-KP05,06(有 mp4); ch06-EX01-03(仅 md) |
| **ch03 多维随机变量及其分布** | 3.1-3.2 联合/边缘分布 | ch08-EX01-03(仅 md); ch09-EX01-06(仅 md); ch10-EX01-05(仅 md) |
| | 3.3 条件分布 | ch08-KP05(有 mp4); ch11-EX01-05(仅 md) |
| | 3.4 独立性 | ch11-EX01-05(仅 md，部分与 3.3 重叠) |
| | 3.5 函数的分布 | ch12-KP05(有 mp4); ch12-EX01,04,05(仅 md) |
| **ch04 随机变量的数字特征** | 4.1 数学期望 | ch13-EX01,02(有 mp4); ch13-EX03,04(仅 md) |
| | 4.3 协方差与相关系数 | ch14-EX01-03(仅 md) |
| **ch05 大数定律与中心极限定理** | 5.1-5.2 切比雪夫/大数定律 | ch14-EX04,05(仅 md) |
| | 5.3 中心极限定理 | ch15-EX01-05(仅 md) |
| **ch06 样本及抽样分布** | 6.1-6.3 统计量/抽样/正态 | ch16-KP05,06,08(有 mp4); ch16-EX01-05(仅 md) |
| **ch07 参数估计** | 7.1-7.4 | ch17-EX01-04(仅 md) |
| **ch08 假设检验** | 8.1-8.4 | ch18-EX01-04(仅 md) |

## 二、需迁移资源清单

### 2.1 MP4 视频（共 22 个）

**KP 视频（15 个，含 scriptMd）**：

| # | output 来源 | 项目 sectionId | 文件名 |
|---|-----------|---------------|--------|
| 1 | ch04-KP01 | 2.2 | KP01_二项分布.mp4 |
| 2 | ch04-KP02 | 2.2 | KP02_二项分布中心项与众数.mp4 |
| 3 | ch04-KP03 | 2.2 | KP03_泊松分布.mp4 |
| 4 | ch04-KP04 | 2.2 | KP04_负二项分布.mp4 |
| 5 | ch04-KP05 | 2.2 | KP05_几何分布.mp4 |
| 6 | ch04-KP06 | 2.2 | KP06_超几何分布.mp4 |
| 7 | ch05-KP05 | 2.4 | KP05_正态分布.mp4 |
| 8 | ch05-KP06 | 2.4 | KP06_正态标准化.mp4 |
| 9 | ch06-KP05 | 2.5 | KP05_连续型函数分布公式法.mp4 |
| 10 | ch06-KP06 | 2.5 | KP06_概率积分变换.mp4 |
| 11 | ch08-KP05 | 3.3 | KP05_条件分布.mp4 |
| 12 | ch12-KP05 | 3.5 | KP05_卷积公式.mp4 |
| 13 | ch16-KP05 | 6.2 | KP05_t分布.mp4 |
| 14 | ch16-KP06 | 6.2 | KP06_F分布.mp4 |
| 15 | ch16-KP08 | 6.4 | KP08_分位点.mp4 |

**EX 视频（7 个，无 scriptMd）**：

| # | output 来源 | 项目 sectionId | 文件名 |
|---|-----------|---------------|--------|
| 1 | ch04-EX01 | 2.2 | EX01_二项分布应用_盲品实验.mp4 |
| 2 | ch04-EX02 | 2.2 | EX02_泊松分布_商店进货决策.mp4 |
| 3 | ch04-EX03 | 2.2 | EX03_负二项分布_大炮轰击.mp4 |
| 4 | ch04-EX04 | 2.2 | EX04_泊松分布稳定性_复合泊松模型.mp4 |
| 5 | ch04-EX05 | 2.2 | EX05_泊松逼近二项分布_染色体异常.mp4 |
| 6 | ch13-EX01 | 4.1 | EX01_掷骰子.mp4 |
| 7 | ch13-EX02 | 4.1 | EX02_连续型期望.mp4 |

### 2.2 EX md 文件（约 62 个，需转换为指令格式）

| output 来源 | 项目 chapterId | 项目 sectionId | 数量 |
|-----------|---------------|---------------|------|
| ch04 EX01-EX05 | ch02 | 2.2 | 5 |
| ch05 EX01-EX05 | ch02 | 2.4 | 5 |
| ch06 EX01-EX03 | ch02 | 2.5 | 3 |
| ch08 EX01-EX03 | ch03 | 3.1 | 3 |
| ch09 EX01-EX06 | ch03 | 3.2 | 6 |
| ch10 EX01-EX05 | ch03 | 3.1 | 5 |
| ch11 EX01-EX05 | ch03 | 3.3 | 5 |
| ch12 EX01,04,05 | ch03 | 3.5 | 3 |
| ch13 EX01-EX04 | ch04 | 4.1 | 4 |
| ch14 EX01-EX03 | ch04 | 4.3 | 3 |
| ch14 EX04-EX05 | ch05 | 5.1 | 2 |
| ch15 EX01-EX05 | ch05 | 5.3 | 5 |
| ch16 EX01-EX05 | ch06 | 6.1-6.3 | 5 |
| ch17 EX01-EX04 | ch07 | 7.1-7.4 | 4 |
| ch18 EX01-EX04 | ch08 | 8.2-8.3 | 4 |
| **合计** | | | **62** |

## 三、分批执行计划

### 每批标准流程

1. **确认 mp4 路径** — 在 output 子目录中定位实际文件路径
2. **复制 MP4** → `public/media/videos/{projectChapterId}/`
3. **读取 KP md → 提取 scriptMd** → 去除元数据行，保留核心内容
4. **读取 EX md → 转换为指令格式** → `content/examples/{projectChapterId}/{sectionId}/`
5. **注册 VideoEntry** → `media.generated.ts` 追加 KP（含 scriptMd）和 EX 条目
6. **TypeScript 编译验证** — `npx tsc --noEmit`

### 批次 1：project ch02（随机变量及其分布）

**来源**：output ch04 + ch05 + ch06（ch07 跳过）

**KP VideoEntry（10 条，含 scriptMd）**：
- ch04-KP01~KP06（6 条）→ sectionId: 2.2
- ch05-KP05, KP06（2 条）→ sectionId: 2.4
- ch06-KP05, KP06（2 条）→ sectionId: 2.5

**EX VideoEntry（5 条，无 scriptMd）**：
- ch04-EX01~EX05 → sectionId: 2.2

**EX md 转换（13 个）**：
- ch04 EX01-EX05 → `content/examples/ch02/2.2/`
- ch05 EX01-EX05 → `content/examples/ch02/2.4/`
- ch06 EX01-EX03 → `content/examples/ch02/2.5/`

### 批次 2：project ch03（多维随机变量及其分布）

**来源**：output ch08 + ch09 + ch10 + ch11 + ch12

**KP VideoEntry（2 条，含 scriptMd）**：
- ch08-KP05 → sectionId: 3.3
- ch12-KP05 → sectionId: 3.5

**EX md 转换（约 25 个）**：
- ch08 EX01-EX03 → 3.1
- ch09 EX01-EX06 → 3.2
- ch10 EX01-EX05 → 3.1
- ch11 EX01-EX05 → 3.3
- ch12 EX01,04,05 → 3.5

### 批次 3：project ch04（随机变量的数字特征）

**来源**：output ch13 + ch14(部分)

**EX VideoEntry（2 条，含 mp4）**：
- ch13-EX01 → sectionId: 4.1
- ch13-EX02 → sectionId: 4.1

**EX md 转换（约 7 个）**：
- ch13 EX01-EX04 → 4.1, 4.2
- ch14 EX01-EX03 → 4.3

### 批次 4：project ch05（大数定律与中心极限定理）

**来源**：output ch14(部分) + ch15

**无 KP/EX 视频**

**EX md 转换（约 7 个）**：
- ch14 EX04-EX05 → 5.1, 5.2
- ch15 EX01-EX05 → 5.3

### 批次 5：project ch06（样本及抽样分布）

**来源**：output ch16

**KP VideoEntry（3 条，含 scriptMd）**：
- ch16-KP05 → sectionId: 6.2
- ch16-KP06 → sectionId: 6.2
- ch16-KP08 → sectionId: 6.4

**EX md 转换（5 个）**：
- ch16 EX01-EX05 → 6.1-6.3

### 批次 6：project ch07（参数估计）

**来源**：output ch17

**无 KP/EX 视频**

**EX md 转换（4 个）**：
- ch17 EX01-EX04 → 7.1, 7.2, 7.4

### 批次 7：project ch08（假设检验）

**来源**：output ch18

**无 KP/EX 视频**

**EX md 转换（4 个）**：
- ch18 EX01-EX04 → 8.2, 8.3

## 四、技术实现细节

### 4.1 MP4 复制
- 源路径格式：`D:\new_project\subject\概率论与数理统计A视频\output\{chXX}\知识点\{KP dir}\{name}.mp4` 或 `output\{chXX}\例题\{EX dir}\{name}.mp4`
- 目标路径：`public/media/videos/{projectChapterId}/{name}.mp4`
- 文件名保持原样（含中文）

### 4.2 scriptMd 提取（同 ch01-ch03 试点）
从 KP md 中提取核心讲稿内容：
- 去除 `> 第X节 ·` 引用块
- 去除 `---` 分隔线
- 去除 `*对应视频：*` 底部说明
- 去除 `# KP0x` 标题行
- 保留知识点定义、公式、表格、列表

### 4.3 EX md 转换（同试点）
```
## 题目 / 问题      → :::example{label=...}
## 核心概念         → :::example{label=...}（风格A 变体）
## 解题思路         → :::insight{label=分析}
## 详细解答         → :::derivation{label=解答}
## 关键公式         → :::theorem{label=关键公式}
## 动画演示说明     → 删除（面向视频制作，非用户内容）
## 易错点 / 常见错误 → :::pitfall{label=易错点N}
## 与其他知识点联系 → :::note{label=知识关联}
## 结果汇总 / 验证  → :::note{label=验证}
```

### 4.4 media.generated.ts 注册格式

**KP 条目（含 scriptMd）**：
```ts
{
  subjectId: "probability",
  id: "ch04-KP01-二项分布",
  chapterId: "ch02",
  sectionId: "2.2",
  title: "KP01 二项分布",
  src: "/media/videos/ch02/KP01_二项分布.mp4",
  description: "...",
  scriptMd: "..."
}
```

**EX 条目（无 scriptMd）**：
```ts
{
  subjectId: "probability",
  id: "ch04-EX01-盲品实验",
  chapterId: "ch02",
  sectionId: "2.2",
  title: "EX01 二项分布应用——盲品实验",
  src: "/media/videos/ch02/EX01_二项分布应用_盲品实验.mp4",
  description: "..."
}
```

### 4.5 skip 规则
- **output ch07 完全跳过**：与 ch04 内容高度重复
- **无 mp4 的 KP 不注册**：仅迁移有视频的知识点
- **EX md 无论有无视频都转换**：例题文字内容始终纳入

## 五、统计汇总

| 指标 | 数量 |
|------|------|
| 需复制的 MP4 文件 | 22 个 |
| 需注册的 KP VideoEntry | 15 条（全部含 scriptMd） |
| 需注册的 EX VideoEntry | 7 条 |
| 需转换的 EX md 文件 | 62 个 |
| 新增 content/examples 子目录 | ~20 个 |

## 六、验证步骤

每批次完成后：
1. `npx tsc --noEmit` — TypeScript 编译零错误
2. 抽查 2-3 个小节的 VideoTab 和 ExampleTab 是否正常渲染

## 七、执行顺序

1. **批次 1（ch02）** — 11 mp4 + 13 EX，资源最丰富
2. **批次 2（ch03）** — 2 mp4 + 25 EX
3. **批次 3（ch04）** — 2 EX mp4 + 7 EX
4. **批次 4（ch05）** — 7 EX（纯 md）
5. **批次 5（ch06）** — 3 KP mp4 + 5 EX
6. **批次 6（ch07）** — 4 EX（纯 md）
7. **批次 7（ch08）** — 4 EX（纯 md）

## 八、风险与注意事项

1. **ch09 标题异常**：目录名"数字特征"但内容是"二维随机变量的分布"，按实际内容映射到 ch03
2. **mp4 路径确认**：需逐个确认 mp4 在 KP/EX 子目录中的实际位置
3. **EX md 格式变体**：ch04 的 EX 有风格 A（叙述式）和风格 B（编号式），转换时统一为标准格式
4. **scriptMd 长度**：部分 KP md 较长（~500 字），内联到 media.generated.ts 会增大文件但不影响性能
