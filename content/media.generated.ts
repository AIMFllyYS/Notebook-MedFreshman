import type { VideoEntry } from "@/lib/content/types";

// [AUTO] 本文件由 manim/render.py 自动生成，请勿手动编辑。
export const generatedVideos: VideoEntry[] = [
  {
    "subjectId": "probability",
    "id": "ch01-1.1-sample-space",
    "chapterId": "ch01",
    "sectionId": "1.1",
    "title": "样本空间与事件",
    "src": "/media/videos/ch01/ch01-1.1-sample-space.mp4",
    "description": "用掷骰子直观展示样本空间 Ω 与事件 A = 出现偶数。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-1.2-ops",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "事件的关系与运算",
    "src": "/media/videos/ch01/ch01-1.2-ops.mp4",
    "description": "维恩图动画依次展示并集、交集、差集、对立事件，最后以左右对比演示德摩根律。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-1.3-freq",
    "chapterId": "ch01",
    "sectionId": "1.3",
    "title": "频率的稳定性",
    "src": "/media/videos/ch01/ch01-1.3-freq.mp4",
    "description": "模拟 200 次抛硬币，动态折线展示正面频率随试验次数增大而稳定趋于理论概率 0.5。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-1.4-classical",
    "chapterId": "ch01",
    "sectionId": "1.4",
    "title": "古典概型与计数",
    "src": "/media/videos/ch01/ch01-1.4-classical.mp4",
    "description": "以掷两颗骰子为例，用 6×6 网格展示 36 个等可能结果，高亮和为 7 的 6 个有利结果，推导 P(A) = 6/36 = 1/6。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-1.5-bayes",
    "chapterId": "ch01",
    "sectionId": "1.5",
    "title": "全概率与贝叶斯",
    "src": "/media/videos/ch01/ch01-1.5-bayes.mp4",
    "description": "用面积划分展示全概率公式，再通过树状图反推贝叶斯公式，直观呈现「由因推果」与「由果溯因」。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-1.6-indep",
    "chapterId": "ch01",
    "sectionId": "1.6",
    "title": "事件的独立性",
    "src": "/media/videos/ch01/ch01-1.6-indep.mp4",
    "description": "用单位正方形面积直观演示 P(AB)=P(A)P(B)，并对比串联/并联系统的可靠度公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-2.1-rv-concept",
    "chapterId": "ch02",
    "sectionId": "2.1",
    "title": "随机变量：样本空间到实数轴的映射",
    "src": "/media/videos/ch02/ch02-2.1-rv-concept.mp4",
    "description": "用抛硬币与掷骰子两个例子，直观展示随机变量是从样本空间到实数轴的函数映射。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-2.2-discrete-dist",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "二项分布与泊松分布",
    "src": "/media/videos/ch02/ch02-2.2-discrete-dist.mp4",
    "description": "通过 B(10,0.3) 直方图与 Poisson(3) 叠加对比，直观展示 np=λ 固定时二项分布收敛到泊松分布的极限过程。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-2.3-cdf",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "分布函数：概率的累积",
    "src": "/media/videos/ch02/ch02-2.3-cdf.mp4",
    "description": "用阶梯图展示离散型 CDF 的逐步累积，再用正态分布 PDF 的积分面积直观呈现连续型 CDF，最后以箭头说明 F'(x)=f(x) 的微积分关系。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-2.4-continuous-dist",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "连续分布：均匀、指数与正态",
    "src": "/media/videos/ch02/ch02-2.4-continuous-dist.mp4",
    "description": "三幕动画分别展示均匀分布的等高PDF、指数分布的无记忆性、正态分布的1σ/2σ/3σ规则。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-2.5-func-dist",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "随机变量函数的分布",
    "src": "/media/videos/ch02/ch02-2.5-func-dist.mp4",
    "description": "用分布函数法推导 Y=X^2 (X~N(0,1)) 的密度，展示正态曲线折叠成 chi^2(1) 的过程。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-3.1-joint-dist",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "二维随机变量与联合分布",
    "src": "/media/videos/ch03/ch03-3.1-joint-dist.mp4",
    "description": "通过离散联合分布律表格、热力图与左下角求和动画，直观呈现联合分布函数 F(x,y) 的含义与性质。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-3.2-marginal-dist",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "边缘分布：从联合到单个",
    "src": "/media/videos/ch03/ch03-3.2-marginal-dist.mp4",
    "description": "通过 3×3 联合分布表格的逐列、逐行汇总动画，展示边缘分布律的计算过程及连续型的积分直觉。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-3.3-conditional-dist",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "条件分布：固定一维看另一维",
    "src": "/media/videos/ch03/ch03-3.3-conditional-dist.mp4",
    "description": "高亮联合分布热力图的 Y=1 行，归一化后动画弹出条形图展示条件分布 P(X|Y=1) 的形成过程。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-3.4-rv-independence",
    "chapterId": "ch03",
    "sectionId": "3.4",
    "title": "随机变量的独立性",
    "src": "/media/videos/ch03/ch03-3.4-rv-independence.mp4",
    "description": "通过联合分布热力图对比与 Y=X² 反例，直观展示独立与不相关的本质区别。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-3.5-sum-dist",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "两随机变量之和的分布",
    "src": "/media/videos/ch03/ch03-3.5-sum-dist.mp4",
    "description": "通过卷积积分演示 U(0,1)+U(0,1) 得三角分布，以及正态+正态仍为正态（均值相加、方差相加）。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-4.1-expectation",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "数学期望：概率加权的中心",
    "src": "/media/videos/ch04/ch04-4.1-expectation.mp4",
    "description": "用杠杆平衡类比展示离散随机变量的期望，再过渡到连续分布的加权重心。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-4.2-variance",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "方差：偏离均值的平均平方",
    "src": "/media/videos/ch04/ch04-4.2-variance.mp4",
    "description": "通过正态分布 PDF 直观演示方差 D(X)=E[(X-mu)^2] 的计算过程，并对比高低方差分布的宽窄形态。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-4.3-covariance",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "协方差与相关系数",
    "src": "/media/videos/ch04/ch04-4.3-covariance.mp4",
    "description": "通过散点云动画展示相关系数 rho 从 -0.9 到 +0.9 的变化，并以 Y=X^2 反例说明不相关不等于独立。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-4.4-moments",
    "chapterId": "ch04",
    "sectionId": "4.4",
    "title": "矩与协方差矩阵的几何意义",
    "src": "/media/videos/ch04/ch04-4.4-moments.mp4",
    "description": "动画演示协方差矩阵 Sigma 如何通过特征向量（主轴方向）和特征值（半轴长的平方）决定二维正态分布等高线椭圆的形状、方向与大小。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-5.1-chebyshev",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "切比雪夫不等式的几何直觉",
    "src": "/media/videos/ch05/ch05-5.1-chebyshev.mp4",
    "description": "以正态分布 PDF 为例，动态展示 ε 增大时尾部面积（真实概率）与 σ²/ε² 上界同步收缩，直观验证切比雪夫不等式始终成立。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-5.2-lln",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "大数定律：样本均值的收敛",
    "src": "/media/videos/ch05/ch05-5.2-lln.mp4",
    "description": "用 5 条样本均值折线与收窄的 epsilon 带，直观展示大数定律——样本量越大，均值依概率收敛到总体均值 mu。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-5.3-clt",
    "chapterId": "ch05",
    "sectionId": "5.3",
    "title": "中心极限定理：任何分布加起来都变正态",
    "src": "/media/videos/ch05/ch05-5.3-clt.mp4",
    "description": "演示均匀分布叠加 n 个样本后，标准化直方图从矩形→三角形→逐步收敛到正态钟形曲线，直观揭示中心极限定理。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-6.1-population-sample",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "总体、样本与统计量",
    "src": "/media/videos/ch06/ch06-6.1-population-sample.mp4",
    "description": "从正态总体随机抽取 8 个样本，计算均值 X̄ 与无偏方差 S²，展示统计量是样本的函数。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-6.2-sampling-dist",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "三大抽样分布：χ²、t、F",
    "src": "/media/videos/ch06/ch06-6.2-sampling-dist.mp4",
    "description": "从标准正态出发，逐步构造 χ²、t、F 三大抽样分布，动画对比各分布 PDF 形状随自由度的变化规律。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-6.3-normal-sampling",
    "chapterId": "ch06",
    "sectionId": "6.3",
    "title": "正态总体的四大抽样分布定理",
    "src": "/media/videos/ch06/ch06-6.3-normal-sampling.mp4",
    "description": "逐幕演示 X̄、(n-1)S²/σ²、t 统计量、F 统计量各服从的分布及其条件，最终汇总对照表。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-6.4-order-stat",
    "chapterId": "ch06",
    "sectionId": "6.4",
    "title": "顺序统计量与样本分位数",
    "src": "/media/videos/ch06/ch06-6.4-order-stat.mp4",
    "description": "演示无序样本排序为顺序统计量的过程，展示最小值 X(1) 和样本中位数的分布规律随样本量 n 变化的趋势。"
  },
  {
    "subjectId": "probability",
    "id": "ch07-7.1-moment-est",
    "chapterId": "ch07",
    "sectionId": "7.1",
    "title": "矩估计法：用样本矩替换总体矩",
    "src": "/media/videos/ch07/ch07-7.1-moment-est.mp4",
    "description": "动画演示指数分布与均匀分布的矩估计推导，展示「用样本矩替换总体矩」的核心思想及估计量随 n 增大收敛到真实参数的过程。"
  },
  {
    "subjectId": "probability",
    "id": "ch07-7.2-mle",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "极大似然估计：让数据最可能出现的参数",
    "src": "/media/videos/ch07/ch07-7.2-mle.mp4",
    "description": "以指数分布为例，动态展示对数似然函数的曲线、MLE 峰值点 lambda_hat，并说明正态分布的联合 MLE 公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch07-7.3-estimator-quality",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "好估计量的三个标准：无偏、有效、相合",
    "src": "/media/videos/ch07/ch07-7.3-estimator-quality.mp4",
    "description": "用靶心四象限类比和数轴收缩动画，直观展示无偏性、有效性与相合性的含义与区别。"
  },
  {
    "subjectId": "probability",
    "id": "ch07-7.4-conf-interval",
    "chapterId": "ch07",
    "sectionId": "7.4",
    "title": "置信区间：捕获真实参数的随机区间",
    "src": "/media/videos/ch07/ch07-7.4-conf-interval.mp4",
    "description": "模拟 100 次重复抽样，展示约 95 条置信区间覆盖真实均值 μ（绿色），约 5 条不覆盖（红色），直观说明置信度是频率概念而非概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-8.1-hyp-test-intro",
    "chapterId": "ch08",
    "sectionId": "8.1",
    "title": "假设检验：小概率反证法",
    "src": "/media/videos/ch08/ch08-8.1-hyp-test-intro.mp4",
    "description": "通过法庭类比与标准正态分布拒绝域动画，直观展示假设检验的小概率反证思想及三种拒绝域形式。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-8.2-mean-test",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "均值检验：Z 检验与 t 检验",
    "src": "/media/videos/ch08/ch08-8.2-mean-test.mp4",
    "description": "并排展示 Z 检验与 t 检验的拒绝域，演示自由度增大时 t 临界值收缩至 Z 临界值 1.96。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-8.3-variance-test",
    "chapterId": "ch08",
    "sectionId": "8.3",
    "title": "方差检验：χ² 检验与 F 检验",
    "src": "/media/videos/ch08/ch08-8.3-variance-test.mp4",
    "description": "通过 χ²(9) 与 F(5,8) 分布密度曲线，直观展示双侧 χ² 检验拒绝域与单侧 F 检验拒绝域的不对称性。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-8.4-two-errors",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "两类错误与功效曲线",
    "src": "/media/videos/ch08/ch08-8.4-two-errors.mp4",
    "description": "通过并排正态分布图，直观展示 I/II 类错误面积的权衡以及样本量增大后两类错误同时缩小的功效提升。"
  },
  // ===== 以下为 output 视频资源整合（第一批 ch01-ch03）=====
  // KP 视频含 scriptMd（配套讲稿），EX 视频不含 scriptMd
  {
    "subjectId": "probability",
    "id": "ch01-KP05-和事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP05 和事件（并事件）",
    "src": "/media/videos/ch01/KP05_和事件.mp4",
    "description": "韦恩图展示并集，三种发生情况演示，加号使用条件，并联电路类比。",
    "scriptMd": "# KP05 和事件（并事件）\n\n## 核心定义\n\n> **和事件（Union）**：事件 $A$ 与事件 $B$ 的和事件，记为 $A \\cup B$。\n\n$$A \\cup B \\text{ 发生} \\iff A \\text{ 与 } B \\text{ 中} \\textbf{至少有一个} \\text{发生}$$\n\n## 三种发生情况\n\n| 情况 | 描述 | $A \\cup B$ 是否发生 |\n|------|------|-------------------|\n| 仅 $A$ 发生 | $B$ 不发生 | ✅ |\n| 仅 $B$ 发生 | $A$ 不发生 | ✅ |\n| $A$ 和 $B$ 同时发生 | — | ✅ |\n| $A$ 和 $B$ 都不发生 | — | ❌ |\n\n## 集合论意义\n\n$A \\cup B$ 是 $A$ 与 $B$ 的**并集**：包含属于 $A$ 或属于 $B$（或两者）的所有样本点。\n\n## 加号\"$+$\"的使用条件\n\n> ⚠️ **重要**：$A \\cup B$ 只有在 $A$ 与 $B$ **互不相容**（$AB = \\emptyset$）时，才可写为 $A + B$。\n\n$$AB = \\emptyset \\Longrightarrow A \\cup B = A + B \\text{（此时加号成立）}$$\n\n若 $A$ 与 $B$ 有重叠，则**不能**写成 $A + B$，只能写 $A \\cup B$。\n\n## 推广到多个事件\n\n$$\\bigcup_{i=1}^{n} A_i = A_1 \\cup A_2 \\cup \\cdots \\cup A_n$$\n\n**发生条件**：$n$ 个事件中**至少有一个**发生。\n\n## 实际应用：并联电路\n\n- 并联电路中，任意一条线路正常则系统正常\n- 对应：$A_1 \\cup A_2 \\cup \\cdots \\cup A_n$ 发生（至少一个元件正常）"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP06-积事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP06 积事件（交事件）",
    "src": "/media/videos/ch01/KP06_积事件.mp4",
    "description": "韦恩图展示交集，串联电路类比，积事件性质表。",
    "scriptMd": "# KP06 积事件（交事件）\n\n## 定义\n\n**积事件**（又称**交事件**）是指事件 $A$ 与事件 $B$ **同时发生**所构成的事件，记作：\n\n$$AB \\quad \\text{或} \\quad A \\cap B$$\n\n> 即：在一次随机实验中，$A$ 与 $B$ 都出现，该事件才算发生。\n\n## 集合意义\n\n在样本空间 $\\Omega$ 中，$AB$ 对应的样本点集合为 $A$ 与 $B$ 的**交集**：\n\n$$AB = A \\cap B = \\{\\omega \\mid \\omega \\in A \\text{ 且 } \\omega \\in B\\}$$\n\n## 推广：$n$ 个事件的积\n\n对于 $n$ 个事件 $A_1, A_2, \\ldots, A_n$，其积事件定义为：\n\n$$A_1 A_2 \\cdots A_n = \\bigcap_{i=1}^{n} A_i$$\n\n表示 $n$ 个事件**全部同时发生**。\n\n## 物理类比：串联电路\n\n积事件可类比为**串联电路**：\n\n- 只有当开关 $A$ **且**开关 $B$ 同时闭合，电路才能导通。\n- 对应：只有 $A$ 和 $B$ 都发生，积事件 $AB$ 才发生。\n\n## 特殊情况：$AB = \\emptyset$\n\n当 $AB = \\emptyset$ 时，表示 $A$ 与 $B$ **不能同时发生**，称 $A$ 与 $B$ **互不相容**（互斥）。\n\n| 情形 | 含义 |\n|------|------|\n| $AB \\neq \\emptyset$ | $A$ 与 $B$ 可以同时发生 |\n| $AB = \\emptyset$ | $A$ 与 $B$ 互斥，不能同时发生 |\n| $AB = A$ | $A \\subseteq B$，$A$ 发生时 $B$ 必发生 |\n\n## 性质\n\n| 性质 | 公式 |\n|------|------|\n| 交换律 | $AB = BA$ |\n| 结合律 | $(AB)C = A(BC)$ |\n| 幂等律 | $AA = A$ |\n| 与必然事件 | $A\\Omega = A$ |\n| 与不可能事件 | $A\\emptyset = \\emptyset$ |\n\n## 注意事项\n\n> **$AB$ 与 $A+B$ 的区别：**\n> - $AB$（积）：$A$ 与 $B$ **同时**发生\n> - $A \\cup B$（和）：$A$ 与 $B$ **至少一个**发生\n> 切勿混淆！"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP07-差事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP07 差事件",
    "src": "/media/videos/ch01/KP07_差事件.mp4",
    "description": "差事件定义、等价表达式 A-B=A B̄、韦恩图、不满足交换律、概率公式。",
    "scriptMd": "# KP07 差事件\n\n## 定义\n\n**差事件**是指事件 $A$ 发生而事件 $B$ **不发生**所构成的事件，记作：\n\n$$A - B$$\n\n> 即：在一次随机实验中，$A$ 出现但 $B$ 不出现，差事件 $A-B$ 才算发生。\n\n## 等价表达式\n\n差事件有两种等价写法，在计算中经常互相转化：\n\n$$\\boxed{A - B = A\\bar{B}}$$\n\n$$\\boxed{A - B = A - AB}$$\n\n**推导（第一个等式）：**\n\n$$A - B = \\{\\omega \\mid \\omega \\in A \\text{ 且 } \\omega \\notin B\\} = A \\cap \\bar{B} = A\\bar{B}$$\n\n## 集合意义\n\n在样本空间 $\\Omega$ 中，$A-B$ 对应的样本点集合：\n\n$$A - B = \\{\\omega \\mid \\omega \\in A \\text{ 且 } \\omega \\notin B\\}$$\n\n即：$A-B$ 是 $A$ 中**排除**与 $B$ 重叠部分后剩余的区域。\n\n## 不满足交换律\n\n差事件**不满足交换律**：\n\n$$A - B \\neq B - A \\quad \\text{（一般情况下）}$$\n\n**对比：**\n- $A - B$：$A$ 发生，$B$ 不发生\n- $B - A$：$B$ 发生，$A$ 不发生\n\n两者含义完全不同，是两个不同的事件。\n\n## 重要关系\n\n| 关系式 | 说明 |\n|--------|------|\n| $A - B = A\\bar{B}$ | 差事件等于积事件 |\n| $A - B = A - AB$ | 等价变形，便于计算 |\n| $A - B \\subseteq A$ | 差事件是 $A$ 的子集 |\n| $A - A = \\emptyset$ | 自身之差为不可能事件 |\n| $A - \\emptyset = A$ | 减去空集等于自身 |\n\n## 与其他运算的联系\n\n$$A = (A - B) \\cup AB \\quad \\text{（将 $A$ 拆分）}$$\n\n且 $(A-B)$ 与 $AB$ **互不相容**，故：\n\n$$P(A) = P(A-B) + P(AB)$$\n\n由此推出差事件的概率公式：\n\n$$P(A-B) = P(A) - P(AB)$$\n\n若 $B \\subseteq A$，则：\n\n$$P(A-B) = P(A) - P(B)$$"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP10-对称差",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP10 对称差",
    "src": "/media/videos/ch01/KP10_对称差.mp4",
    "description": "对称差定义、四种等价公式、韦恩图、性质表、概率公式。",
    "scriptMd": "# KP10 对称差\n\n## 定义\n\n**对称差**是指事件 $A$ 与事件 $B$ 中**恰好有一个**发生所构成的事件，记作：\n\n$$A \\triangle B$$\n\n> 即：$A$ 发生而 $B$ 不发生，**或者** $B$ 发生而 $A$ 不发生，两者选其一（不能同时发生）。\n\n## 等价公式\n\n对称差有以下几种等价表达方式：\n\n$$\\boxed{A \\triangle B = (A - B) \\cup (B - A)}$$\n\n$$\\boxed{A \\triangle B = (A \\cup B) - AB}$$\n\n$$\\boxed{A \\triangle B = A\\bar{B} \\cup \\bar{A}B}$$\n\n**公式推导：**\n\n- $A - B = A\\bar{B}$：$A$ 发生但 $B$ 不发生\n- $B - A = \\bar{A}B$：$B$ 发生但 $A$ 不发生\n- 两者互斥（不能同时满足），故：\n\n$$A \\triangle B = (A - B) \\cup (B - A) = A\\bar{B} \\cup \\bar{A}B$$\n\n## 性质\n\n| 性质 | 公式 |\n|------|------|\n| 交换律 | $A \\triangle B = B \\triangle A$ |\n| 结合律 | $(A \\triangle B) \\triangle C = A \\triangle (B \\triangle C)$ |\n| 与空集 | $A \\triangle \\emptyset = A$ |\n| 与自身 | $A \\triangle A = \\emptyset$ |\n| 与全集 | $A \\triangle \\Omega = \\bar{A}$ |\n| 与对立 | $A \\triangle \\bar{A} = \\Omega$ |\n\n## 与其他运算的关系\n\n$$A \\triangle B = (A \\cup B) - AB \\subseteq A \\cup B$$\n\n$$A \\triangle B = \\emptyset \\iff A = B$$\n\n$$P(A \\triangle B) = P(A) + P(B) - 2P(AB)$$\n\n## 与\"恰好一个发生\"的联系\n\n对称差 $A \\triangle B$ 恰好描述了：\n\n> **$A$ 和 $B$ 中恰好有一个发生**\n\n这是对称差在概率论中最直观的语义，在讨论\"恰好\"类问题时非常有用。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP11-运算律",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP11 事件运算的四大定律",
    "src": "/media/videos/ch01/KP11_运算律.mp4",
    "description": "交换律、结合律、分配律、德摩根律四大定律及推广，含化简示例。",
    "scriptMd": "# KP11 事件运算的四大定律\n\n## 一、交换律\n\n$$\\boxed{A \\cup B = B \\cup A}$$\n\n$$\\boxed{AB = BA}$$\n\n> 和事件与积事件都满足交换律，与顺序无关。\n\n## 二、结合律\n\n$$\\boxed{(A \\cup B) \\cup C = A \\cup (B \\cup C)}$$\n\n$$\\boxed{(AB)C = A(BC)}$$\n\n> 多个事件的并集或交集，运算顺序不影响结果。可推广到有限多个事件。\n\n## 三、分配律\n\n$$\\boxed{A \\cup (BC) = (A \\cup B)(A \\cup C)}$$\n\n$$\\boxed{A(B \\cup C) = AB \\cup AC}$$\n\n> 类比代数中的分配律：$\\cup$ 和 $\\cap$ 对彼此均可分配。\n\n## 四、德摩根律（De Morgan's Laws）\n\n$$\\boxed{\\overline{A \\cup B} = \\bar{A}\\bar{B} = \\bar{A} \\cap \\bar{B}}$$\n\n$$\\boxed{\\overline{AB} = \\bar{A} \\cup \\bar{B}}$$\n\n### 口诀：\"断帽子，不丢帽子\"\n\n| 步骤 | 操作 | 说明 |\n|------|------|------|\n| 第一步 | **断**（break）连接符 | $\\cup \\to \\cap$，$\\cap \\to \\cup$ |\n| 第二步 | **不丢帽子** | 给每个事件都加上\"非\"（上划线） |\n\n## 推广德摩根律\n\n对 $n$ 个事件，德摩根律推广为：\n\n$$\\boxed{\\overline{\\bigcup_{i=1}^{n} A_i} = \\bigcap_{i=1}^{n} \\bar{A_i}}$$\n\n$$\\boxed{\\overline{\\bigcap_{i=1}^{n} A_i} = \\bigcup_{i=1}^{n} \\bar{A_i}}$$\n\n## 四大定律汇总表\n\n| 定律 | 公式（∪版本） | 公式（∩版本） |\n|------|--------------|--------------|\n| 交换律 | $A \\cup B = B \\cup A$ | $AB = BA$ |\n| 结合律 | $(A \\cup B) \\cup C = A \\cup (B \\cup C)$ | $(AB)C = A(BC)$ |\n| 分配律 | $A \\cup (BC) = (A \\cup B)(A \\cup C)$ | $A(B \\cup C) = AB \\cup AC$ |\n| 德摩根 | $\\overline{A \\cup B} = \\bar{A}\\bar{B}$ | $\\overline{AB} = \\bar{A} \\cup \\bar{B}$ |\n\n## 其他重要等式\n\n| 等式 | 说明 |\n|------|------|\n| $A \\cup A = A$ | 幂等律（并） |\n| $AA = A$ | 幂等律（交） |\n| $A \\cup \\bar{A} = \\Omega$ | 排中律 |\n| $A\\bar{A} = \\emptyset$ | 矛盾律 |\n| $\\bar{\\bar{A}} = A$ | 双重否定律 |"
  },
  {
    "subjectId": "probability",
    "id": "ch01-EX05-双骰子",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "EX05 双骰子综合题",
    "src": "/media/videos/ch01/EX05_双骰子.mp4",
    "description": "双骰子样本空间下事件运算综合题，含和为7、对子等事件的关系判断。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-KP01-σ域",
    "chapterId": "ch02",
    "sectionId": "1.6",
    "title": "KP01 σ域（Sigma 域）",
    "src": "/media/videos/ch02/KP01_σ域.mp4",
    "description": "σ域定义三条公理、推论、最小/最大σ域、Borel σ域。",
    "scriptMd": "# KP01 σ域（Sigma 域）\n\n## 1. 为什么需要 σ 域\n\n在构建严格的概率论体系时，我们不能对样本空间 $\\Omega$ 的**所有**子集都定义概率——对于不可数的 $\\Omega$（如实数区间），某些子集（Vitali 集等）无法赋予合理的概率值。因此，我们需要选取一个\"足够好\"的子集族，使其对概率运算封闭，这就是 **σ 域**（也称 σ 代数）的动机。\n\n## 2. σ 域的定义\n\n> **定义（σ 域）**\n> 设 $\\Omega$ 为样本空间，$\\mathcal{F}$ 是 $\\Omega$ 的某些子集构成的集合族。若 $\\mathcal{F}$ 满足以下三个条件，则称 $\\mathcal{F}$ 为 $\\Omega$ 上的一个 **σ 域**（σ-field）或 **σ 代数**（σ-algebra）：\n>\n> **(F1) 全集条件**：$\\Omega \\in \\mathcal{F}$\n>\n> **(F2) 补集封闭**：若 $A \\in \\mathcal{F}$，则 $\\bar{A} = \\Omega \\setminus A \\in \\mathcal{F}$\n>\n> **(F3) 可列并封闭**：若 $A_1, A_2, A_3, \\ldots \\in \\mathcal{F}$，则\n> $$\\bigcup_{n=1}^{\\infty} A_n \\in \\mathcal{F}$$\n\n称满足上述条件的集合族 $\\mathcal{F}$ 中的元素为**可测集**或**事件**。\n\n## 3. 由定义推导出的性质（推论）\n\n### 推论 1：空集属于 F\n\n由 (F1) 知 $\\Omega \\in \\mathcal{F}$，再由 (F2) 知：\n\n$$\\emptyset = \\bar{\\Omega} \\in \\mathcal{F}$$\n\n### 推论 2：有限并封闭\n\n若 $A_1, A_2, \\ldots, A_n \\in \\mathcal{F}$，令 $A_{n+1} = A_{n+2} = \\cdots = \\emptyset \\in \\mathcal{F}$，由 (F3)：\n\n$$A_1 \\cup A_2 \\cup \\cdots \\cup A_n = \\bigcup_{k=1}^{\\infty} A_k \\in \\mathcal{F}$$\n\n### 推论 3：可列交封闭\n\n由 De Morgan 律和 (F2)、(F3)：\n\n$$\\bigcap_{n=1}^{\\infty} A_n = \\overline{\\bigcup_{n=1}^{\\infty} \\bar{A}_n} \\in \\mathcal{F}$$\n\n## 4. 最小与最大 σ 域\n\n### 最小 σ 域（平凡 σ 域）\n\n$$\\mathcal{F}_{\\min} = \\{\\emptyset, \\Omega\\}$$\n\n只含空集和全集，是最\"粗糙\"的 σ 域，对应于\"什么都不知道\"的信息量。\n\n### 最大 σ 域（幂集）\n\n$$\\mathcal{F}_{\\max} = 2^{\\Omega} = \\{\\text{所有 } \\Omega \\text{ 的子集}\\}$$\n\n包含 $\\Omega$ 的全部子集，是最\"精细\"的 σ 域。\n\n## 5. Borel σ 域（重要例子）\n\n> **定义**：由 $\\mathbb{R}$ 上所有开区间生成的最小 σ 域，称为 **Borel σ 域**，记为 $\\mathcal{B}(\\mathbb{R})$。\n\nBorel σ 域包含所有：\n- 开区间 $(a, b)$\n- 闭区间 $[a, b]$\n- 半开区间 $[a, b)$，$(a, b]$\n- 单点集 $\\{a\\}$\n- 可数并、交、补的结果\n\n## 6. 学习要点\n\n1. σ 域的三个条件（F1）（F2）（F3）是公理，须**逐条验证**。\n2. 最关键的推论是 $\\emptyset \\in \\mathcal{F}$，由全集和补集封闭共同推出。\n3. σ 域是概率空间 $(\\Omega, \\mathcal{F}, P)$ 三要素之一，后续定义概率 $P$ 时必须基于 $\\mathcal{F}$。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-EX01-扑克牌",
    "chapterId": "ch02",
    "sectionId": "1.4",
    "title": "EX01 扑克牌摸牌",
    "src": "/media/videos/ch02/EX01_扑克牌概率.mp4",
    "description": "古典概型+组合计数：52张牌取5张恰好3黑桃2红心的概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-EX02-生日问题",
    "chapterId": "ch02",
    "sectionId": "1.4",
    "title": "EX02 生日问题",
    "src": "/media/videos/ch02/EX02_生日问题.mp4",
    "description": "古典概型+对立事件法：30人至少两人生日相同的概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch02-EX03-投点入圆",
    "chapterId": "ch02",
    "sectionId": "1.4",
    "title": "EX03 投点入圆",
    "src": "/media/videos/ch02/EX03_投点入圆.mp4",
    "description": "几何概型+面积比+蒙特卡洛方法：正方形内切圆落点概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch03-KP03-划分",
    "chapterId": "ch03",
    "sectionId": "1.5",
    "title": "KP03 划分（完备事件组）",
    "src": "/media/videos/ch03/KP03_划分.mp4",
    "description": "划分三条件（互斥+完备+非退化）、全概率公式基础、常见错误。",
    "scriptMd": "# KP03 划分（完备事件组）\n\n## 核心概念\n\n**划分**（Partition），也称**完备事件组**，是全概率公式和贝叶斯公式的基础结构。其作用是将样本空间 $\\Omega$ 分割成若干个互不重叠、合起来覆盖全集的\"互斥完备\"的块，使得对任意事件 $A$，都可以通过逐块分析来计算 $P(A)$。\n\n**正式定义**：设 $B_1, B_2, \\ldots, B_n$ 是一组事件，若满足：\n\n1. **互斥性（不相交）**：$B_i B_j = \\emptyset$，对所有 $i \\neq j$，即各 $B_i$ 两两互不相容\n2. **完备性（覆盖全集）**：$B_1 \\cup B_2 \\cup \\cdots \\cup B_n = \\Omega$，即所有 $B_i$ 的并集等于整个样本空间\n3. **非退化性**：$P(B_i) > 0$，对所有 $i = 1, 2, \\ldots, n$\n\n则称 $\\{B_1, B_2, \\ldots, B_n\\}$ 为样本空间 $\\Omega$ 的一个**划分**（完备事件组）。\n\n## 关键公式\n\n**划分的验证条件**（三条）：\n$$B_i \\cap B_j = \\emptyset \\quad (i \\neq j), \\qquad \\bigcup_{i=1}^{n} B_i = \\Omega, \\qquad P(B_i) > 0$$\n\n**对任意事件 $A$ 的分解**：\n若 $\\{B_1, \\ldots, B_n\\}$ 是 $\\Omega$ 的一个划分，则\n$$A = A\\Omega = A(B_1 \\cup B_2 \\cup \\cdots \\cup B_n) = AB_1 \\cup AB_2 \\cup \\cdots \\cup AB_n$$\n\n由于 $AB_i$ 两两互斥，故\n$$P(A) = P(AB_1) + P(AB_2) + \\cdots + P(AB_n) = \\sum_{i=1}^{n} P(AB_i)$$\n\n这正是**全概率公式**的结构基础。\n\n**划分的归一性**：\n$$\\sum_{i=1}^{n} P(B_i) = 1$$\n\n## 直观理解\n\n划分的直觉是**将复杂问题分类讨论**。\n\n设想计算一个复杂事件 $A$ 的概率。如果 $A$ 在不同情形（\"场景\"）下的概率各不相同，我们就可以按照这些不同情形对样本空间进行分类。每一类情形对应一个 $B_i$，在该类情形下计算 $P(A \\mid B_i)$，再加权求和。\n\n**生活类比**：计算一家工厂产品的次品率。这家工厂有三条生产线（$B_1, B_2, B_3$），每条生产线的产量份额和各自的次品率已知。$B_1, B_2, B_3$ 的产量份额加起来等于100%（完备性），且三条线是相互独立运作的（互斥性）。这就是一个划分。\n\n**二元划分的重要性**：\n最常用的划分是 $\\{B, \\bar{B}\\}$，对应\"$B$ 发生\"与\"$B$ 不发生\"两种情形。这使得全概率公式退化为：\n$$P(A) = P(A \\mid B)P(B) + P(A \\mid \\bar{B})P(\\bar{B})$$\n这是最简洁实用的形式，大量习题都基于此。\n\n## 常见错误\n\n**错误1：只检查互斥性，忘记验证完备性**\n\n许多学生只验证 $B_i \\cap B_j = \\emptyset$，忘记验证 $\\bigcup B_i = \\Omega$。若划分不完备，则计算全概率时会遗漏部分可能性，导致结果偏小。\n\n**错误2：只检查完备性，忘记验证互斥性**\n\n若各 $B_i$ 有重叠，则在计算 $\\sum P(AB_i)$ 时会重复计算 $A$ 在重叠部分的概率，导致结果偏大。\n\n**错误3：忽略 $P(B_i) > 0$ 的条件**\n\n划分要求每个 $B_i$ 的概率严格大于零，否则对应的条件概率 $P(A \\mid B_i)$ 无定义，全概率公式就不能直接使用。"
  }
];
