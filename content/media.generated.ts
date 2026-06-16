import type { VideoEntry } from "@/lib/content/types";

// ⚠️ 本文件由 manim/render.py 自动生成，请勿手动编辑。
export const generatedVideos: VideoEntry[] = [
  {
    "id": "ch01-1.1-sample-space",
    "chapterId": "ch01",
    "sectionId": "1.1",
    "title": "样本空间与事件",
    "src": "/media/videos/ch01/ch01-1.1-sample-space.mp4",
    "description": "用掷骰子直观展示样本空间 Ω 与事件 A = 出现偶数。"
  },
  {
    "id": "ch01-1.2-ops",
    "chapterId": "ch01",
    "sectionId": "1.2",
    "title": "事件的关系与运算",
    "src": "/media/videos/ch01/ch01-1.2-ops.mp4",
    "description": "维恩图动画依次展示并集、交集、差集、对立事件，最后以左右对比演示德摩根律。"
  },
  {
    "id": "ch01-1.3-freq",
    "chapterId": "ch01",
    "sectionId": "1.3",
    "title": "频率的稳定性",
    "src": "/media/videos/ch01/ch01-1.3-freq.mp4",
    "description": "模拟 200 次抛硬币，动态折线展示正面频率随试验次数增大而稳定趋于理论概率 0.5。"
  },
  {
    "id": "ch01-1.4-classical",
    "chapterId": "ch01",
    "sectionId": "1.4",
    "title": "古典概型与计数",
    "src": "/media/videos/ch01/ch01-1.4-classical.mp4",
    "description": "以掷两颗骰子为例，用 6×6 网格展示 36 个等可能结果，高亮和为 7 的 6 个有利结果，推导 P(A) = 6/36 = 1/6。"
  },
  {
    "id": "ch01-1.5-bayes",
    "chapterId": "ch01",
    "sectionId": "1.5",
    "title": "全概率与贝叶斯",
    "src": "/media/videos/ch01/ch01-1.5-bayes.mp4",
    "description": "用面积划分展示全概率公式，再通过树状图反推贝叶斯公式，直观呈现「由因推果」与「由果溯因」。"
  },
  {
    "id": "ch01-1.6-indep",
    "chapterId": "ch01",
    "sectionId": "1.6",
    "title": "事件的独立性",
    "src": "/media/videos/ch01/ch01-1.6-indep.mp4",
    "description": "用单位正方形面积直观演示 P(AB)=P(A)P(B)，并对比串联/并联系统的可靠度公式。"
  },
  {
    "id": "ch02-2.1-rv-concept",
    "chapterId": "ch02",
    "sectionId": "2.1",
    "title": "随机变量：样本空间到实数轴的映射",
    "src": "/media/videos/ch02/ch02-2.1-rv-concept.mp4",
    "description": "用抛硬币与掷骰子两个例子，直观展示随机变量是从样本空间到实数轴的函数映射。"
  },
  {
    "id": "ch02-2.2-discrete-dist",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "二项分布与泊松分布",
    "src": "/media/videos/ch02/ch02-2.2-discrete-dist.mp4",
    "description": "通过 B(10,0.3) 直方图与 Poisson(3) 叠加对比，直观展示 np=λ 固定时二项分布收敛到泊松分布的极限过程。"
  },
  {
    "id": "ch02-2.3-cdf",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "分布函数：概率的累积",
    "src": "/media/videos/ch02/ch02-2.3-cdf.mp4",
    "description": "用阶梯图展示离散型 CDF 的逐步累积，再用正态分布 PDF 的积分面积直观呈现连续型 CDF，最后以箭头说明 F'(x)=f(x) 的微积分关系。"
  },
  {
    "id": "ch02-2.4-continuous-dist",
    "chapterId": "ch02",
    "sectionId": "2.4",
    "title": "连续分布：均匀、指数与正态",
    "src": "/media/videos/ch02/ch02-2.4-continuous-dist.mp4",
    "description": "三幕动画分别展示均匀分布的等高PDF、指数分布的无记忆性、正态分布的1σ/2σ/3σ规则。"
  },
  {
    "id": "ch02-2.5-func-dist",
    "chapterId": "ch02",
    "sectionId": "2.5",
    "title": "随机变量函数的分布",
    "src": "/media/videos/ch02/ch02-2.5-func-dist.mp4",
    "description": "用分布函数法推导 Y=X^2 (X~N(0,1)) 的密度，展示正态曲线折叠成 chi^2(1) 的过程。"
  },
  {
    "id": "ch03-3.1-joint-dist",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "二维随机变量与联合分布",
    "src": "/media/videos/ch03/ch03-3.1-joint-dist.mp4",
    "description": "通过离散联合分布律表格、热力图与左下角求和动画，直观呈现联合分布函数 F(x,y) 的含义与性质。"
  },
  {
    "id": "ch03-3.2-marginal-dist",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "边缘分布：从联合到单个",
    "src": "/media/videos/ch03/ch03-3.2-marginal-dist.mp4",
    "description": "通过 3×3 联合分布表格的逐列、逐行汇总动画，展示边缘分布律的计算过程及连续型的积分直觉。"
  },
  {
    "id": "ch03-3.3-conditional-dist",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "条件分布：固定一维看另一维",
    "src": "/media/videos/ch03/ch03-3.3-conditional-dist.mp4",
    "description": "高亮联合分布热力图的 Y=1 行，归一化后动画弹出条形图展示条件分布 P(X|Y=1) 的形成过程。"
  },
  {
    "id": "ch03-3.4-rv-independence",
    "chapterId": "ch03",
    "sectionId": "3.4",
    "title": "随机变量的独立性",
    "src": "/media/videos/ch03/ch03-3.4-rv-independence.mp4",
    "description": "通过联合分布热力图对比与 Y=X² 反例，直观展示独立与不相关的本质区别。"
  },
  {
    "id": "ch03-3.5-sum-dist",
    "chapterId": "ch03",
    "sectionId": "3.5",
    "title": "两随机变量之和的分布",
    "src": "/media/videos/ch03/ch03-3.5-sum-dist.mp4",
    "description": "通过卷积积分演示 U(0,1)+U(0,1) 得三角分布，以及正态+正态仍为正态（均值相加、方差相加）。"
  },
  {
    "id": "ch04-4.1-expectation",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "数学期望：概率加权的中心",
    "src": "/media/videos/ch04/ch04-4.1-expectation.mp4",
    "description": "用杠杆平衡类比展示离散随机变量的期望，再过渡到连续分布的加权重心。"
  },
  {
    "id": "ch04-4.2-variance",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "方差：偏离均值的平均平方",
    "src": "/media/videos/ch04/ch04-4.2-variance.mp4",
    "description": "通过正态分布 PDF 直观演示方差 D(X)=E[(X-mu)^2] 的计算过程，并对比高低方差分布的宽窄形态。"
  },
  {
    "id": "ch04-4.3-covariance",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "协方差与相关系数",
    "src": "/media/videos/ch04/ch04-4.3-covariance.mp4",
    "description": "通过散点云动画展示相关系数 rho 从 -0.9 到 +0.9 的变化，并以 Y=X^2 反例说明不相关不等于独立。"
  },
  {
    "id": "ch04-4.4-moments",
    "chapterId": "ch04",
    "sectionId": "4.4",
    "title": "矩与协方差矩阵的几何意义",
    "src": "/media/videos/ch04/ch04-4.4-moments.mp4",
    "description": "动画演示协方差矩阵 Sigma 如何通过特征向量（主轴方向）和特征值（半轴长的平方）决定二维正态分布等高线椭圆的形状、方向与大小。"
  },
  {
    "id": "ch05-5.1-chebyshev",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "切比雪夫不等式的几何直觉",
    "src": "/media/videos/ch05/ch05-5.1-chebyshev.mp4",
    "description": "以正态分布 PDF 为例，动态展示 ε 增大时尾部面积（真实概率）与 σ²/ε² 上界同步收缩，直观验证切比雪夫不等式始终成立。"
  },
  {
    "id": "ch05-5.2-lln",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "大数定律：样本均值的收敛",
    "src": "/media/videos/ch05/ch05-5.2-lln.mp4",
    "description": "用 5 条样本均值折线与收窄的 epsilon 带，直观展示大数定律——样本量越大，均值依概率收敛到总体均值 mu。"
  },
  {
    "id": "ch05-5.3-clt",
    "chapterId": "ch05",
    "sectionId": "5.3",
    "title": "中心极限定理：任何分布加起来都变正态",
    "src": "/media/videos/ch05/ch05-5.3-clt.mp4",
    "description": "演示均匀分布叠加 n 个样本后，标准化直方图从矩形→三角形→逐步收敛到正态钟形曲线，直观揭示中心极限定理。"
  },
  {
    "id": "ch06-6.1-population-sample",
    "chapterId": "ch06",
    "sectionId": "6.1",
    "title": "总体、样本与统计量",
    "src": "/media/videos/ch06/ch06-6.1-population-sample.mp4",
    "description": "从正态总体随机抽取 8 个样本，计算均值 X̄ 与无偏方差 S²，展示统计量是样本的函数。"
  },
  {
    "id": "ch06-6.2-sampling-dist",
    "chapterId": "ch06",
    "sectionId": "6.2",
    "title": "三大抽样分布：χ²、t、F",
    "src": "/media/videos/ch06/ch06-6.2-sampling-dist.mp4",
    "description": "从标准正态出发，逐步构造 χ²、t、F 三大抽样分布，动画对比各分布 PDF 形状随自由度的变化规律。"
  },
  {
    "id": "ch06-6.3-normal-sampling",
    "chapterId": "ch06",
    "sectionId": "6.3",
    "title": "正态总体的四大抽样分布定理",
    "src": "/media/videos/ch06/ch06-6.3-normal-sampling.mp4",
    "description": "逐幕演示 X̄、(n-1)S²/σ²、t 统计量、F 统计量各服从的分布及其条件，最终汇总对照表。"
  },
  {
    "id": "ch06-6.4-order-stat",
    "chapterId": "ch06",
    "sectionId": "6.4",
    "title": "顺序统计量与样本分位数",
    "src": "/media/videos/ch06/ch06-6.4-order-stat.mp4",
    "description": "演示无序样本排序为顺序统计量的过程，展示最小值 X(1) 和样本中位数的分布规律随样本量 n 变化的趋势。"
  },
  {
    "id": "ch07-7.1-moment-est",
    "chapterId": "ch07",
    "sectionId": "7.1",
    "title": "矩估计法：用样本矩替换总体矩",
    "src": "/media/videos/ch07/ch07-7.1-moment-est.mp4",
    "description": "动画演示指数分布与均匀分布的矩估计推导，展示「用样本矩替换总体矩」的核心思想及估计量随 n 增大收敛到真实参数的过程。"
  },
  {
    "id": "ch07-7.2-mle",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "极大似然估计：让数据最可能出现的参数",
    "src": "/media/videos/ch07/ch07-7.2-mle.mp4",
    "description": "以指数分布为例，动态展示对数似然函数的曲线、MLE 峰值点 lambda_hat，并说明正态分布的联合 MLE 公式。"
  },
  {
    "id": "ch07-7.3-estimator-quality",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "好估计量的三个标准：无偏、有效、相合",
    "src": "/media/videos/ch07/ch07-7.3-estimator-quality.mp4",
    "description": "用靶心四象限类比和数轴收缩动画，直观展示无偏性、有效性与相合性的含义与区别。"
  },
  {
    "id": "ch07-7.4-conf-interval",
    "chapterId": "ch07",
    "sectionId": "7.4",
    "title": "置信区间：捕获真实参数的随机区间",
    "src": "/media/videos/ch07/ch07-7.4-conf-interval.mp4",
    "description": "模拟 100 次重复抽样，展示约 95 条置信区间覆盖真实均值 μ（绿色），约 5 条不覆盖（红色），直观说明置信度是频率概念而非概率。"
  },
  {
    "id": "ch08-8.1-hyp-test-intro",
    "chapterId": "ch08",
    "sectionId": "8.1",
    "title": "假设检验：小概率反证法",
    "src": "/media/videos/ch08/ch08-8.1-hyp-test-intro.mp4",
    "description": "通过法庭类比与标准正态分布拒绝域动画，直观展示假设检验的小概率反证思想及三种拒绝域形式。"
  },
  {
    "id": "ch08-8.2-mean-test",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "均值检验：Z 检验与 t 检验",
    "src": "/media/videos/ch08/ch08-8.2-mean-test.mp4",
    "description": "并排展示 Z 检验与 t 检验的拒绝域，演示自由度增大时 t 临界值收缩至 Z 临界值 1.96。"
  },
  {
    "id": "ch08-8.3-variance-test",
    "chapterId": "ch08",
    "sectionId": "8.3",
    "title": "方差检验：χ² 检验与 F 检验",
    "src": "/media/videos/ch08/ch08-8.3-variance-test.mp4",
    "description": "通过 χ²(9) 与 F(5,8) 分布密度曲线，直观展示双侧 χ² 检验拒绝域与单侧 F 检验拒绝域的不对称性。"
  },
  {
    "id": "ch08-8.4-two-errors",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "两类错误与功效曲线",
    "src": "/media/videos/ch08/ch08-8.4-two-errors.mp4",
    "description": "通过并排正态分布图，直观展示 I/II 类错误面积的权衡以及样本量增大后两类错误同时缩小的功效提升。"
  }
];
