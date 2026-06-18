import type { Exercise } from '../../types/exercise';

export const ch05Exercises: Exercise[] = [
  {
    id: '5.1-1',
    chapterId: 5,
    sectionId: '5.1',
    difficulty: 'basic',
    type: 'choice',
    tags: ['切比雪夫不等式', '概率估计'],
    question: '已知随机变量 $X$ 的期望为 $E(X) = 100$，方差为 $D(X) = 10$。利用切比雪夫不等式估计，随机变量 $X$ 落在区间 $(80, 120)$ 内的概率下界（即至少为多少）是：',
    options: [
      '$\\frac{39}{40}$',
      '$\\frac{3}{4}$',
      '$\\frac{1}{4}$',
      '$\\frac{1}{40}$'
    ],
    answer: 'A',
    solution: `
我们要估计概率 $P(80 < X < 120)$。
因为 $E(X) = 100$，所以区间 $(80, 120)$ 可以等价改写为：
$$ 80 < X < 120 \\iff -20 < X - 100 < 20 \\iff |X - 100| < 20 $$
对应的偏离幅度为 $\\varepsilon = 20$。
根据切比雪夫不等式的等价形式（下界形式）：
$$ P(|X - E(X)| < \\varepsilon) \\ge 1 - \\frac{D(X)}{\\varepsilon^2} $$
我们将已知数据 $E(X) = 100$, $D(X) = 10$ 且 $\\varepsilon = 20$ 代入公式中：
$$ P(|X - 100| < 20) \\ge 1 - \\frac{10}{20^2} = 1 - \\frac{10}{400} = 1 - \\frac{1}{40} = \\frac{39}{40} $$
因此，随机变量 $X$ 落在该区间内的概率至少为 $\\frac{39}{40}$。
正确选项为 A。
`,
    hints: [
      '首先计算区间范围对于期望中心点对称偏离的距离 ε，即 120 - 100 = 20。',
      '切比雪夫不等式有两个等价形式，本题求的是落在区间内部的概率下界，需使用 $P(|X - E(X)| < \\varepsilon) \\ge 1 - \\frac{D(X)}{\\varepsilon^2}$。'
    ],
    relatedFormulas: ['P(|X - E(X)| < \\varepsilon) \\ge 1 - D(X) / \\varepsilon^2'],
    commonMistakes: [
      '容易误用 $P(|X - E(X)| \\ge \\varepsilon) \\le \\frac{D(X)}{\\varepsilon^2}$ 算出的结果 $\\frac{1}{40}$，忽略了题目求的是落在区间“内”（即偏离小于 20）的概率下界，而非区间“外”的概率上界。'
    ]
  },
  {
    id: '5.1-2',
    chapterId: 5,
    sectionId: '5.1',
    difficulty: 'intermediate',
    type: 'choice',
    tags: ['大数定律', '依概率收敛', '指数分布'],
    question: '设随机变量序列 $X_1, X_2, \\dots, X_n, \\dots$ 相互独立，且都服从参数为 $\\lambda$ 的指数分布。设 $\\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^n X_i$，则当 $n \\to \\infty$ 时，$\\bar{X}_n$ 依概率收敛于：',
    options: [
      '$\\lambda$',
      '$\\frac{1}{\\lambda}$',
      '$\\frac{1}{\\lambda^2}$',
      '$0$'
    ],
    answer: 'B',
    solution: `
由于随机变量序列 $X_1, X_2, \\dots, X_n, \\dots$ 相互独立，且服从相同的指数分布，因此它们是独立同分布（i.i.d.）的随机变量序列。
指数分布 $Exp(\\lambda)$ 的期望和方差分别为：
$$ E(X_i) = \\frac{1}{\\lambda}, \\quad D(X_i) = \\frac{1}{\\lambda^2} $$
因为期望存在且为常数，根据**辛钦大数定律**，对于独立同分布且期望存在的随机变量序列，其样本均值必依概率收敛于该公共期望值，即：
$$ \\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^n X_i \\xrightarrow{P} E(X_1) = \\frac{1}{\\lambda} \\quad (n \\to \\infty) $$
因此，$\\bar{X}_n$ 依概率收敛于 $\\frac{1}{\\lambda}$。
正确选项为 B。
`,
    hints: [
      '判断序列是否满足独立同分布条件，并回顾指数分布的数学期望公式。',
      '辛钦大数定律指出：独立同分布且数学期望有限的随机变量序列，其样本均值依概率收敛于其数学期望。'
    ],
    relatedFormulas: ['\\bar{X}_n \\xrightarrow{P} E(X_1)'],
    commonMistakes: [
      '容易混淆指数分布的参数 $\\lambda$ 与其数学期望 $\\frac{1}{\\lambda}$，导致误选 A。',
      '部分考生将指数分布的期望与方差公式搞混。'
    ]
  },
  {
    id: '5.2-1',
    chapterId: 5,
    sectionId: '5.2',
    difficulty: 'exam',
    type: 'choice',
    tags: ['中心极限定理', '正态近似', '考研真题'],
    question: '某工厂生产的螺钉重量（单位：克）服从均值为 100，标准差为 4 的分布。现在将螺钉装箱，每箱装 100 个螺钉。假设每个螺钉的重量相互独立。求一箱螺钉的总重量在 9920 克到 10080 克之间的概率（已知标准正态分布函数值 $\\Phi(2) \\approx 0.9772$）：',
    options: [
      '$0.9544$',
      '$0.4772$',
      '$0.9772$',
      '$0.0456$'
    ],
    answer: 'A',
    solution: `
设 $X_i$ 为箱中第 $i$ 个螺钉的重量 ($i = 1, 2, \\dots, 100$)。
由题意可知，各 $X_i$ 相互独立且同分布，其期望和方差为：
$$ E(X_i) = \\mu = 100, \\quad D(X_i) = \\sigma^2 = 4^2 = 16 $$
设一箱螺钉的总重量为 $S_{100} = \\sum_{i=1}^{100} X_i$。
根据独立同分布中心极限定理，当每箱装螺钉的个数 $n = 100$ 较大时，$S_{100}$ 近似服从正态分布：
- 期望：$E(S_{100}) = n \\mu = 100 \\times 100 = 10000$ 克
- 方差：$D(S_{100}) = n \\sigma^2 = 100 \\times 16 = 1600$
- 标准差：$\\sqrt{D(S_{100})} = \\sqrt{1600} = 40$ 克

我们要计算的概率为：
$$ P(9920 \\le S_{100} \\le 10080) $$
对 $S_{100}$ 进行标准化处理：
$$ P(9920 \\le S_{100} \\le 10080) = P\\left( \\frac{9920 - 10000}{40} \\le \\frac{S_{100} - 10000}{40} \\le \\frac{10080 - 10000}{40} \\right) $$
$$ \\approx P(-2 \\le Z \\le 2) $$
其中 $Z \\sim N(0, 1)$。由标准正态分布的对称性：
$$ P(-2 \\le Z \\le 2) = \\Phi(2) - \\Phi(-2) = 2\\Phi(2) - 1 $$
将已知数据 $\\Phi(2) \\approx 0.9772$ 代入计算：
$$ 2 \\times 0.9772 - 1 = 1.9544 - 1 = 0.9544 $$
因此，一箱螺钉的总重量落在该区间的概率为 0.9544。
正确选项为 A。
`,
    hints: [
      '计算总和 $S_n$ 的期望与方差：期望为 $n \\mu$，方差为 $n \\sigma^2$。',
      '由于样本量 $n = 100$ 足够大，可以应用林德伯格-莱维中心极限定理。',
      '利用对称性公式 $P(-x \\le Z \\le x) = 2\\Phi(x) - 1$ 计算区间概率。'
    ],
    relatedFormulas: [
      'E(S_n) = n\\mu',
      'D(S_n) = n\\sigma^2',
      'P(a \\le S_n \\le b) \\approx \\Phi\\left(\\frac{b-n\\mu}{\\sqrt{n}\\sigma}\\right) - \\Phi\\left(\\frac{a-n\\mu}{\\sqrt{n}\\sigma}\\right)'
    ],
    commonMistakes: [
      '没有计算整体螺钉的方差，直接用了单个螺钉重量的标准差 4 代入标准化，导致分母算错。',
      '在做标准化时忘记对方差 $n\\sigma^2$ 开根号。'
    ]
  },
  {
    id: '5.2-2',
    chapterId: 5,
    sectionId: '5.2',
    difficulty: 'challenge',
    type: 'choice',
    tags: ['二项分布', '棣莫弗-拉普拉斯定理', '中心极限定理'],
    question: '某项考试全部为单项选择题，共 100 道题，每道题有 4 个选项，其中只有 1 个是正确的。某考生完全凭猜测回答全部 100 道题。假设各题回答正确与否相互独立。试求该考生答对 20 道题到 30 道题之间的概率（直接进行正态近似，不进行连续性修正。已知 $\\Phi(1.15) \\approx 0.8749$, $\\Phi(-1.15) \\approx 0.1251$）：',
    options: [
      '$0.7498$',
      '$0.8749$',
      '$0.1251$',
      '$0.5000$'
    ],
    answer: 'A',
    solution: `
设 $X$ 为答对题目的数量，由于每道题完全凭猜测，且各题相互独立，因此答对的题数服从二项分布：
$$ X \\sim B(n, p) $$
其中 $n = 100$，$p = 0.25$。
该二项分布的数学期望和方差为：
- 期望：$E(X) = n p = 100 \\times 0.25 = 25$
- 方差：$D(X) = n p (1-p) = 100 \\times 0.25 \\times 0.75 = 18.75$
- 标准差：$\\sigma(X) = \\sqrt{18.75} \\approx 4.33$

我们需要计算的概率范围是 $P(20 \\le X \\le 30)$。
根据棣莫弗-拉普拉斯中心极限定理，大样本下二项分布可近似为正态分布，将 $X$ 标准化：
$$ P(20 \\le X \\le 30) = P\\left( \\frac{20 - 25}{4.33} \\le \\frac{X - 25}{4.33} \\le \\frac{30 - 25}{4.33} \\right) $$
$$ \\approx P(-1.15 \\le Z \\le 1.15) $$
利用标准正态分布的对称性：
$$ P(-1.15 \\le Z \\le 1.15) = \\Phi(1.15) - \\Phi(-1.15) $$
代入已知的数据：
$$ \\Phi(1.15) - \\Phi(-1.15) \\approx 0.8749 - 0.1251 = 0.7498 $$
猜对 20 到 30 道题之间的概率约为 0.7498。
正确选项为 A。
`,
    hints: [
      '确定二项分布参数 $n=100$，每个问题被猜对的概率 $p=1/4=0.25$。',
      '计算二项分布对应的数学期望 $np$ 与标准差 $\\sqrt{np(1-p)}$。',
      '直接代入边界进行标准化计算概率。'
    ],
    relatedFormulas: [
      'E(X) = np',
      'D(X) = np(1-p)',
      'P(a \\le X \\le b) \\approx \\Phi\\left(\\frac{b-np}{\\sqrt{np(1-p)}}\\right) - \\Phi\\left(\\frac{a-np}{\\sqrt{np(1-p)}}\\right)'
    ],
    commonMistakes: [
      '误以为每道题做对概率是 $p = 0.5$（将4选1选择题当成了对错判断题）。',
      '标准化分母中误代入了方差 18.75 忘记开平方。'
    ]
  }
];
