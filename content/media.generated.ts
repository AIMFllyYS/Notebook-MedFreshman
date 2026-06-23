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
  {
    "subjectId": "probability",
    "id": "ch01-KP05-和事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP05 和事件（并事件）",
    "src": "/media/videos/ch01/KP05_和事件.mp4",
    "description": "韦恩图展示并集，三种发生情况演示，加号使用条件，并联电路类比。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP06-积事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP06 积事件（交事件）",
    "src": "/media/videos/ch01/KP06_积事件.mp4",
    "description": "韦恩图展示交集，串联电路类比，积事件性质表。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP07-差事件",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP07 差事件",
    "src": "/media/videos/ch01/KP07_差事件.mp4",
    "description": "差事件定义、等价表达式 A-B=A B̄、韦恩图、不满足交换律、概率公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP10-对称差",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP10 对称差",
    "src": "/media/videos/ch01/KP10_对称差.mp4",
    "description": "对称差定义、四种等价公式、韦恩图、性质表、概率公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch01-KP11-运算律",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "KP11 事件运算的四大定律",
    "src": "/media/videos/ch01/KP11_运算律.mp4",
    "description": "交换律、结合律、分配律、德摩根律四大定律及推广，含化简示例。"
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
    "description": "σ域定义三条公理、推论、最小/最大σ域、Borel σ域。"
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
    "description": "划分三条件（互斥+完备+非退化）、全概率公式基础、常见错误。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP01-二项分布",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP01 二项分布",
    "src": "/media/videos/ch02/KP01_二项分布.mp4",
    "description": "伯努利试验与n重独立重复；二项分布PMF推导；期望方差公式；条形图展示。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP02-二项分布中心项",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP02 二项分布的中心项与众数",
    "src": "/media/videos/ch02/KP02_二项分布的中心项与众数.mp4",
    "description": "相邻概率比值法求众数；⌊(n+1)p⌋公式；双众数特殊情况。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP03-泊松分布",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP03 泊松分布",
    "src": "/media/videos/ch02/KP03_泊松分布.mp4",
    "description": "泊松分布PMF；泊松逼近定理；期望=方差=λ；可加性。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP04-负二项分布",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP04 负二项分布（帕斯卡分布）",
    "src": "/media/videos/ch02/KP04_负二项分布.mp4",
    "description": "第r次成功所需试验次数；r=1退化为几何分布。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP05-几何分布",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP05 几何分布",
    "src": "/media/videos/ch02/KP05_几何分布.mp4",
    "description": "首次成功等待次数；无记忆性；等比数列递减。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-KP06-超几何分布",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "KP06 超几何分布",
    "src": "/media/videos/ch02/KP06_超几何分布.mp4",
    "description": "无放回抽样模型；组合计数推导；大N近似二项分布。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP01-概率密度函数",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP01 概率密度函数（PDF）",
    "src": "/media/videos/ch02/KP01_概率密度函数.mp4",
    "description": "PDF定义与两条基本性质；单点概率为零；密度与概率的区别。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP02-累积分布函数",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP02 累积分布函数（CDF）",
    "src": "/media/videos/ch02/KP02_累积分布函数CDF.mp4",
    "description": "CDF四大性质；区间概率F(b)-F(a)；PDF与CDF互推。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP03-均匀分布",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP03 均匀分布 U(a,b)",
    "src": "/media/videos/ch02/KP03_均匀分布.mp4",
    "description": "矩形PDF；等概率性；CDF斜坡形；期望方差公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP04-指数分布",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP04 指数分布 Exp(λ)",
    "src": "/media/videos/ch02/KP04_指数分布.mp4",
    "description": "指数分布PDF；无记忆性证明；均值=标准差=1/λ。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP05-正态分布",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP05 正态分布 N(μ,σ²)",
    "src": "/media/videos/ch02/KP05_正态分布.mp4",
    "description": "钟形曲线；μ位置参数σ形状参数；标准正态φ和Φ。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-KP06-正态标准化",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP06 正态标准化与3σ原则",
    "src": "/media/videos/ch02/KP06_正态标准化.mp4",
    "description": "标准化Z=(X-μ)/σ；Φ对称性；68-95-99.7经验法则。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP01-标准化与3σ",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP01 正态分布的标准化与3σ原则",
    "src": "/media/videos/ch02/KP01_正态分布的标准化与3σ原则.mp4",
    "description": "标准化变换详解；3σ概率值；查表四步法。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP02-混合型随机变量",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "KP02 混合型随机变量",
    "src": "/media/videos/ch02/KP02_混合型随机变量.mp4",
    "description": "截断变量min(V,V₀)；原子概率；分布函数跳跃。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP03-离散型函数分布",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "KP03 离散型随机变量函数分布",
    "src": "/media/videos/ch02/KP03_离散型随机变量函数分布.mp4",
    "description": "Y=g(X)分布律；多对一概率合并；LOTUS定律。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP04-分布函数法",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "KP04 连续型函数分布——分布函数法",
    "src": "/media/videos/ch02/KP04_连续型函数分布分布函数法.mp4",
    "description": "通用四步法；不等式转化；Y=X²分类讨论。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP05-公式法",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "KP05 连续型函数分布——公式法（严格单调）",
    "src": "/media/videos/ch02/KP05_连续型函数分布公式法严格单调.mp4",
    "description": "变量变换定理；Jacobian因子；拉伸压缩几何意义。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-KP06-概率积分变换",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "KP06 概率积分变换",
    "src": "/media/videos/ch02/KP06_概率积分变换.mp4",
    "description": "F(X)~U(0,1)定理；逆变换蒙特卡洛模拟；拟合优度检验。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-EX01-盲品实验",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "EX01 二项分布应用——盲品实验",
    "src": "/media/videos/ch02/EX01_二项分布应用_盲品实验.mp4",
    "description": "B(100,1/2)盲品实验，求极端概率与累积概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-EX02-商店进货决策",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "EX02 泊松分布——商店进货决策",
    "src": "/media/videos/ch02/EX02_泊松分布_商店进货决策.mp4",
    "description": "P(5)月销售量，保证99%不脱销的最少进货量。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-EX03-大炮轰击",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "EX03 负二项分布——大炮轰击",
    "src": "/media/videos/ch02/EX03_负二项分布_大炮轰击.mp4",
    "description": "NB(r,p)建模：击中r次摧毁目标的总轰击次数。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-EX04-复合泊松模型",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "EX04 泊松分布稳定性——复合泊松模型",
    "src": "/media/videos/ch02/EX04_泊松分布稳定性_复合泊松模型.mp4",
    "description": "顾客数Y~P(λ)，每人以概率p购买，售出台数X~P(λp)。"
  },
  {
    "subjectId": "probability",
    "id": "ch04-EX05-染色体异常",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "EX05 泊松逼近二项分布——染色体异常",
    "src": "/media/videos/ch02/EX05_泊松逼近二项分布_染色体异常.mp4",
    "description": "B(100,0.005)用P(0.5)近似，验证逼近精度。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-EX01-验证PDF",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "EX01 验证PDF",
    "src": "/media/videos/ch02/EX01_验证PDF.mp4",
    "description": "验证函数是否满足PDF的两条基本性质。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-EX02-指数分布无记忆性",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "EX02 指数分布无记忆性",
    "src": "/media/videos/ch02/EX02_指数分布无记忆性.mp4",
    "description": "灯泡寿命应用，验证指数分布的无记忆性。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-EX03-正态分布计算",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "EX03 正态分布计算",
    "src": "/media/videos/ch02/EX03_正态分布计算.mp4",
    "description": "X~N(3,4)多类型概率计算综合练习标准化技巧。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-EX04-均匀分布等车",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "EX04 均匀分布等车",
    "src": "/media/videos/ch02/EX04_均匀分布等车.mp4",
    "description": "公交车等待时间U(0,10)的期望方差与区间概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch05-EX05-零件合格率",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "EX05 正态分布零件合格率",
    "src": "/media/videos/ch02/EX05_正态分布零件合格率.mp4",
    "description": "质量控制中3σ原则和反推合格区间宽度。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-EX01-车门高度设计",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "EX01 车门高度设计",
    "src": "/media/videos/ch02/EX01_车门高度设计.mp4",
    "description": "正态标准化与反查表的工程应用。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-EX02-指数变换均匀",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "EX02 指数分布变换为均匀分布",
    "src": "/media/videos/ch02/EX02_指数分布变换为均匀分布.mp4",
    "description": "概率积分变换定理的直接验证。"
  },
  {
    "subjectId": "probability",
    "id": "ch06-EX03-正态线性变换",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "EX03 正态分布线性变换",
    "src": "/media/videos/ch02/EX03_正态分布线性变换.mp4",
    "description": "Y=aX+b的正态分布线性封闭性推导。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP01-联合分布函数",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP01 二维随机变量与联合分布函数",
    "src": "/media/videos/ch03/KP01_二维随机变量与联合分布函数.mp4",
    "description": "二维随机变量(X,Y)概念；联合分布函数F(x,y)定义与性质。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP02-离散联合分布列",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP02 二维离散型联合分布列与边缘分布",
    "src": "/media/videos/ch03/KP02_二维离散型联合分布列与边缘分布.mp4",
    "description": "联合分布律表格；边缘分布律求法；行和列求和。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP03-联合密度边缘密度",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP03 二维连续型联合密度与边缘密度",
    "src": "/media/videos/ch03/KP03_二维连续型联合密度与边缘密度.mp4",
    "description": "联合密度f(x,y)性质；边缘密度积分消元。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP04-二维正态分布",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP04 二维正态分布",
    "src": "/media/videos/ch03/KP04_二维正态分布.mp4",
    "description": "5参数N(μ₁,μ₂,σ₁²,σ₂²,ρ)；等高线椭圆；边缘仍正态。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP05-条件分布",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "KP05 条件分布",
    "src": "/media/videos/ch03/KP05_条件分布.mp4",
    "description": "离散型条件分布律；连续型条件密度；联合=边缘×条件。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-KP06-随机变量独立性",
    "chapterId": "ch03",
    "sectionId": "3.4",
    "title": "KP06 随机变量的独立性",
    "src": "/media/videos/ch03/KP06_随机变量独立性.mp4",
    "description": "F(x,y)=Fx·Fy；离散p_ij=p_i·p_j；连续f=f_x·f_y。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP01-二维均匀密度",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP01 二维均匀分布密度函数",
    "src": "/media/videos/ch03/KP01_二维均匀分布密度函数.mp4",
    "description": "区域D上密度=1/S(S为面积)；规范性验证。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP02-二维正态5参数",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP02 二维正态分布（5参数）",
    "src": "/media/videos/ch03/KP02_二维正态分布5参数.mp4",
    "description": "μ₁,μ₂位置；σ₁²,σ₂²尺度；ρ相关系数；|ρ|<1。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP03-边缘分布连续",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP03 边缘分布（连续型）",
    "src": "/media/videos/ch03/KP03_边缘分布连续型.mp4",
    "description": "f_X(x)=∫f(x,y)dy；积分上下限确定是关键。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP04-正态边缘正态",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP04 二维正态边缘仍为正态",
    "src": "/media/videos/ch03/KP04_二维正态边缘仍正态.mp4",
    "description": "边缘N(μ₁,σ₁²)和N(μ₂,σ₂²)；逆命题不成立。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP05-配密度法",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP05 配密度法求积分",
    "src": "/media/videos/ch03/KP05_配密度法求积分.mp4",
    "description": "识别正态密度形式；利用∫N(μ,σ²)=1直接消积分。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP06-边缘未必均匀",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP06 二维均匀分布的边缘未必均匀",
    "src": "/media/videos/ch03/KP06_二维均匀边缘未必均匀.mp4",
    "description": "非矩形区域(三角形)上边缘密度不恒定；仅矩形区域边缘均匀。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP07-离散条件分布",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "KP07 条件分布（离散型）",
    "src": "/media/videos/ch03/KP07_条件分布离散型.mp4",
    "description": "P(X=x_i|Y=y_j)=p_ij/p·_j；规范性验证。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP08-连续条件密度",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "KP08 条件分布（连续型）",
    "src": "/media/videos/ch03/KP08_条件分布连续型.mp4",
    "description": "f_{X|Y}(x|y)=f(x,y)/f_Y(y)；联合=边缘×条件。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP09-正态条件正态",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "KP09 二维正态的条件分布仍为正态",
    "src": "/media/videos/ch03/KP09_二维正态条件分布仍正态.mp4",
    "description": "条件均值依赖x，条件方差与x无关。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-KP10-随机变量独立性",
    "chapterId": "ch03",
    "sectionId": "3.4",
    "title": "KP10 随机变量的独立性",
    "src": "/media/videos/ch03/KP10_随机变量的独立性.mp4",
    "description": "联合=边缘之积；独立⟹不相关；二维正态中等价。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP01-联合分布函数",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP01 二维随机变量与联合分布函数",
    "src": "/media/videos/ch03/KP01_二维随机变量与联合分布函数.mp4",
    "description": "F(x,y)=P(X≤x,Y≤y)；四大性质；几何意义。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP02-离散联合分布律",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP02 二维离散型联合分布律",
    "src": "/media/videos/ch03/KP02_二维离散型随机变量与联合分布律.mp4",
    "description": "联合分布律表格；归一化∑p_ij=1。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP03-边缘分布律",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP03 边缘分布律",
    "src": "/media/videos/ch03/KP03_边缘分布律.mp4",
    "description": "对行/列求和得边缘分布律；联合确定边缘反之不然。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP04-联合密度函数",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP04 二维连续型联合密度函数",
    "src": "/media/videos/ch03/KP04_二维连续型随机变量与联合密度函数.mp4",
    "description": "f(x,y)≥0；∫∫f=1；概率=二重积分。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP05-边缘密度函数",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "KP05 边缘密度函数",
    "src": "/media/videos/ch03/KP05_边缘密度函数.mp4",
    "description": "f_X(x)=∫f(x,y)dy；积分范围由区域形状决定。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP06-均匀正态分布",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "KP06 二维均匀分布与二维正态分布",
    "src": "/media/videos/ch03/KP06_二维均匀分布与二维正态分布.mp4",
    "description": "两种重要二维分布的密度形式与参数含义。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-KP07-离散条件分布",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "KP07 条件分布（离散型）",
    "src": "/media/videos/ch03/KP07_条件分布_离散型.mp4",
    "description": "条件分布律定义；联合/边缘；规范性。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-KP01-离散函数分布",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "KP01 离散型随机变量函数分布",
    "src": "/media/videos/ch03/KP01_离散型函数分布.mp4",
    "description": "Y=g(X)分布律；多对一概率合并；LOTUS。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-KP02-分布函数法",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "KP02 分布函数法",
    "src": "/media/videos/ch03/KP02_分布函数法.mp4",
    "description": "通用四步法；不等式转化；Y=X²分类讨论。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-KP05-卷积公式",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "KP05 卷积公式",
    "src": "/media/videos/ch03/KP05_卷积公式.mp4",
    "description": "Z=X+Y的密度；正态可加性；独立同分布求和。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-KP06-最大最小值",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "KP06 最大值与最小值分布",
    "src": "/media/videos/ch03/KP06_最大最小值分布.mp4",
    "description": "max/min的CDF推导；独立同分布公式；串联并联可靠度。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-EX01-二维离散分布",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX01 二维离散分布计算",
    "src": "/media/videos/ch03/EX01_二维离散分布计算.mp4",
    "description": "联合分布律表格计算与边缘分布推导。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-EX02-三角形边缘密度",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX02 三角形均匀分布边缘密度",
    "src": "/media/videos/ch03/EX02_三角形均匀分布边缘密度.mp4",
    "description": "三角形区域二维均匀分布的边缘密度求解。"
  },
  {
    "subjectId": "probability",
    "id": "ch08-EX03-条件求联合",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX03 由条件分布求联合分布",
    "src": "/media/videos/ch03/EX03_由条件分布求联合分布.mp4",
    "description": "利用联合=边缘×条件反推联合分布。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX01-配密度法",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX01 二维正态边缘分布（配密度法）",
    "src": "/media/videos/ch03/EX01_二维正态边缘配密度法.mp4",
    "description": "配密度法求边缘密度的典型应用。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX02-正态反例",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX02 两正态边缘未必是二维正态",
    "src": "/media/videos/ch03/EX02_两正态边缘拼合非二维正态反例.mp4",
    "description": "Y=2X+1反例：边缘正态但联合非二维正态。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX03-射击问题",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX03 射击问题：联合、边缘与条件分布",
    "src": "/media/videos/ch03/EX03_射击问题联合边缘条件分布.mp4",
    "description": "几何分布+负二项分布的联合分布综合题。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX04-三角形边缘",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX04 三角形区域二维均匀分布边缘密度",
    "src": "/media/videos/ch03/EX04_三角形区域均匀分布边缘密度.mp4",
    "description": "非矩形区域积分上下限确定。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX05-边缘条件求联合",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX05 已知边缘和条件求联合密度",
    "src": "/media/videos/ch03/EX05_已知边缘和条件求联合密度.mp4",
    "description": "f(x,y)=f_X·f_{Y|X}；支撑集刻画。"
  },
  {
    "subjectId": "probability",
    "id": "ch09-EX06-泊松二项条件",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "EX06 泊松条件分布为二项",
    "src": "/media/videos/ch03/EX06_泊松分布条件分布为二项.mp4",
    "description": "X+Y~P(λ₁+λ₂)，给定Z=n时X|Z~B(n,λ₁/(λ₁+λ₂))。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-EX01-摸球联合分布",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX01 摸球问题联合分布律",
    "src": "/media/videos/ch03/EX01_摸球问题联合分布律.mp4",
    "description": "经典摸球模型构建联合分布律表格。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-EX02-联合求边缘",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX02 联合分布律求边缘分布",
    "src": "/media/videos/ch03/EX02_联合分布律求边缘分布.mp4",
    "description": "从联合分布律表格行/列求和得边缘分布。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-EX03-验证联合密度",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX03 验证联合密度函数并求概率",
    "src": "/media/videos/ch03/EX03_验证联合密度函数并求概率.mp4",
    "description": "验证归一性+计算区域概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-EX04-求边缘密度",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX04 求边缘密度函数",
    "src": "/media/videos/ch03/EX04_求边缘密度函数.mp4",
    "description": "从联合密度积分求边缘密度。"
  },
  {
    "subjectId": "probability",
    "id": "ch10-EX05-二维均匀概率",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "EX05 二维均匀分布求概率",
    "src": "/media/videos/ch03/EX05_二维均匀分布求概率.mp4",
    "description": "面积比法求概率。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-EX01-离散函数分布",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "EX01 离散函数分布",
    "src": "/media/videos/ch03/EX01_离散函数分布.mp4",
    "description": "Y=g(X)离散型分布律求解。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-EX02-卷积指数",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "EX04 卷积公式——指数分布之和",
    "src": "/media/videos/ch03/EX04_卷积指数分布.mp4",
    "description": "Gamma分布的卷积推导。"
  },
  {
    "subjectId": "probability",
    "id": "ch12-EX03-最大最小值",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "EX05 最大最小值分布",
    "src": "/media/videos/ch03/EX05_最大最小值分布.mp4",
    "description": "串联/并联系统可靠度计算。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP01-离散期望",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "KP01 离散型随机变量的期望",
    "src": "/media/videos/ch04/Ch13KP01_离散期望_期望.mp4",
    "description": "E[X]=Σxi·pi定义；加权平均直觉。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP02-连续型期望",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "KP02 连续型随机变量的期望",
    "src": "/media/videos/ch04/KP02_连续型期望.mp4",
    "description": "E[X]=∫xf(x)dx；绝对收敛条件。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP03-期望线性性",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "KP03 期望的线性性",
    "src": "/media/videos/ch04/KP03_期望的线性性.mp4",
    "description": "E[aX+b]=aE[X]+b；不要求独立。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP04-独立乘积期望",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "KP04 独立随机变量乘积的期望",
    "src": "/media/videos/ch04/KP04_独立随机变量乘积期望.mp4",
    "description": "E[XY]=E[X]E[Y]当X,Y独立。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP05-LOTUS",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "KP05 无意识统计学家定律（LOTUS）",
    "src": "/media/videos/ch04/KP05_函数期望LOTUS.mp4",
    "description": "E[g(X)]=Σg(xi)pi或∫g(x)f(x)dx。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP06-方差定义",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "KP06 方差的定义",
    "src": "/media/videos/ch04/Ch13KP06_方差定义.mp4",
    "description": "D(X)=E[(X-μ)²]=E[X²]-[E(X)]²。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP07-期望方差汇总",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "KP07 常见分布期望方差汇总",
    "src": "/media/videos/ch04/KP07_常见分布期望方差汇总.mp4",
    "description": "二项/泊松/均匀/指数/正态的E和D对照表。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-KP08-标准差切比雪夫",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "KP08 标准差与切比雪夫不等式",
    "src": "/media/videos/ch04/KP08_标准差与切比雪夫.mp4",
    "description": "σ=√D(X)；P(|X-μ|≥ε)≤σ²/ε²。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-KP01-协方差定义",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "KP01 协方差的定义",
    "src": "/media/videos/ch04/KP01_协方差定义.mp4",
    "description": "Cov(X,Y)=E[(X-μX)(Y-μY)]=E[XY]-E[X]E[Y]。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-KP02-协方差性质",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "KP02 协方差的性质",
    "src": "/media/videos/ch04/KP02_协方差性质.mp4",
    "description": "对称性；数乘性；加法性；D(X±Y)公式。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-KP03-相关系数定义",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "KP03 相关系数的定义",
    "src": "/media/videos/ch04/KP03_相关系数定义.mp4",
    "description": "ρ=Cov/(σX·σY)；标准化后协方差；|ρ|≤1。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-KP04-相关系数性质",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "KP04 相关系数的性质与意义",
    "src": "/media/videos/ch04/KP04_相关系数性质.mp4",
    "description": "|ρ|=1⟺线性关系；ρ=0不相关；只能度量线性关系。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-KP05-独立不相关",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "KP05 独立与不相关的关系",
    "src": "/media/videos/ch04/KP05_独立与不相关.mp4",
    "description": "独立⟹不相关；反之不然；二维正态中等价。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP01-总体样本",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "KP01 总体与样本",
    "src": "/media/videos/ch06/KP01_总体与样本.mp4",
    "description": "总体(随机变量)；简单随机样本(iid)；个体。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP02-统计量定义",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "KP02 统计量的定义",
    "src": "/media/videos/ch06/KP02_统计量的定义.mp4",
    "description": "不含未知参数的样本函数；X̄和S²。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP03-样本均值方差",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "KP03 样本均值与样本方差",
    "src": "/media/videos/ch06/KP03_样本均值与样本方差.mp4",
    "description": "X̄=ΣXi/n；S²=Σ(Xi-X̄)²/(n-1)；n-1无偏性。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP04-卡方分布",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "KP04 χ²分布",
    "src": "/media/videos/ch06/KP04_χ²分布.mp4",
    "description": "n个独立标准正态平方和；自由度n。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP05-t分布",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "KP05 t分布",
    "src": "/media/videos/ch06/KP05_t分布.mp4",
    "description": "X/√(χ²/n)结构；对称性；自由度增大趋向正态。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP06-F分布",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "KP06 F分布",
    "src": "/media/videos/ch06/KP06_F分布.mp4",
    "description": "两χ²之比；F(m,n)；F·F(1/n,1/m)倒数关系。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP07-抽样分布定理",
    "chapterId": "ch06",
    "sectionId": "6.3",
    "title": "KP07 正态总体的抽样分布定理",
    "src": "/media/videos/ch06/KP07_正态总体抽样分布定理.mp4",
    "description": "X̄~N(μ,σ²/n)；(n-1)S²/σ²~χ²；X̄⊥S²。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-KP08-分位点",
    "chapterId": "ch06",
    "sectionId": "6.4",
    "title": "KP08 分位点",
    "src": "/media/videos/ch06/KP08_分位点.mp4",
    "description": "上α分位点定义；χ²/t/F分位点查表。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-EX01-掷骰子",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "EX01 掷骰子期望",
    "src": "/media/videos/ch04/Ch13EX01_掷骰子.mp4",
    "description": "离散型期望计算综合练习。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-EX02-连续型期望",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "EX02 连续型期望",
    "src": "/media/videos/ch04/EX02_连续型期望.mp4",
    "description": "连续型随机变量期望积分计算。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-EX03-LOTUS",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "EX03 LOTUS法则应用",
    "src": "/media/videos/ch04/Ch13EX03_LOTUS法则.mp4",
    "description": "E[g(X)]不需求Y分布直接计算。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-EX04-期望方差性质",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "EX04 期望方差性质",
    "src": "/media/videos/ch04/EX04_期望方差性质.mp4",
    "description": "线性变换和独立和的期望方差计算。"
  },
  {
    "subjectId": "probability",
    "id": "ch13-EX05-综合期望方差",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "EX05 综合期望方差",
    "src": "/media/videos/ch04/EX05_综合期望方差.mp4",
    "description": "多种分布混合的期望方差综合计算。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-EX01-协方差联合",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "EX01 协方差——联合分布律",
    "src": "/media/videos/ch04/EX01_协方差联合分布.mp4",
    "description": "从联合分布律计算Cov(X,Y)。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-EX02-相关系数",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "EX02 计算相关系数",
    "src": "/media/videos/ch04/EX02_计算相关系数.mp4",
    "description": "给定数字特征求ρ_XY。"
  },
  {
    "subjectId": "probability",
    "id": "ch14-EX03-不相关不独立",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "EX03 不相关但不独立",
    "src": "/media/videos/ch04/EX03_不相关但不独立.mp4",
    "description": "X~N(0,1),Y=X²反例验证。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-EX01-判断统计量",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "EX01 判断统计量",
    "src": "/media/videos/ch06/EX01_判断统计量.mp4",
    "description": "判断样本函数是否为统计量。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-EX02-样本均值方差",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "EX02 计算样本均值方差",
    "src": "/media/videos/ch06/EX02_计算样本均值方差.mp4",
    "description": "给定样本数据计算X̄和S²。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-EX03-分位点查表",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "EX03 分位点查表",
    "src": "/media/videos/ch06/EX03_分位点查表.mp4",
    "description": "χ²/t/F分布分位点查找与应用。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-EX04-确定分布",
    "chapterId": "ch06",
    "sectionId": "6.3",
    "title": "EX04 确定统计量分布",
    "src": "/media/videos/ch06/EX04_确定统计量分布.mp4",
    "description": "利用抽样分布定理确定统计量服从的分布。"
  },
  {
    "subjectId": "probability",
    "id": "ch16-EX05-F统计量",
    "chapterId": "ch06",
    "sectionId": "6.3",
    "title": "EX05 F统计量",
    "src": "/media/videos/ch06/EX05_F统计量.mp4",
    "description": "两样本方差比F统计量的构造与应用。"
  }
];
