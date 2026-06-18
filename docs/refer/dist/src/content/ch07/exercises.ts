import type { Exercise } from '../../types/exercise';

export const ch07Exercises: Exercise[] = [
  {
    id: "7.1-1",
    chapterId: 7,
    sectionId: "7.1",
    difficulty: "exam",
    type: "choice",
    tags: ["矩估计", "最大似然估计", "连续分布"],
    question: "设总体 $X$ 的概率密度为 $f(x; \\theta) = \\theta x^{\\theta - 1}$ ($0 < x < 1, \\theta > 0$)，而 $X_1, X_2, \\dots, X_n$ 是来自该总体的简单随机样本，则 $\\theta$ 的矩估计量 $\\hat{\\theta}_M$ 和最大似然估计量 $\\hat{\\theta}_{MLE}$ 分别为：",
    options: [
      "$\\hat{\\theta}_M = \\frac{\\bar{X}}{1-\\bar{X}}$, $\\hat{\\theta}_{MLE} = -\\frac{n}{\\sum_{i=1}^n \\ln X_i}$",
      "$\\hat{\\theta}_M = \\frac{1-\\bar{X}}{\\bar{X}}$, $\\hat{\\theta}_{MLE} = \\frac{n}{\\sum_{i=1}^n \\ln X_i}$",
      "$\\hat{\\theta}_M = \\frac{\\bar{X}}{1-\\bar{X}}$, $\\hat{\\theta}_{MLE} = \\frac{n}{\\sum_{i=1}^n \\ln X_i}$",
      "$\\hat{\\theta}_M = \\frac{1-\\bar{X}}{\\bar{X}}$, $\\hat{\\theta}_{MLE} = -\\frac{n}{\\sum_{i=1}^n \\ln X_i}$"
    ],
    answer: "A",
    solution: "首先求解矩估计量：根据定义，总体一阶矩（期望）为：\n$$ E(X) = \\int_0^1 x \\theta x^{\\theta-1} dx = \\theta \\int_0^1 x^\\theta dx = \\frac{\\theta}{\\theta+1} $$\n令 $E(X) = \\bar{X}$，得到关于 $\\theta$ 的方程：\n$$ \\frac{\\theta}{\\theta+1} = \\bar{X} \\implies \\theta = \\bar{X}(\\theta + 1) \\implies \\theta(1-\\bar{X}) = \\bar{X} $$\n解得矩估计量为：\n$$ \\hat{\\theta}_M = \\frac{\\bar{X}}{1-\\bar{X}} $$\n\n接着求解最大似然估计量：似然函数为：\n$$ L(\\theta) = \\prod_{i=1}^n \\theta x_i^{\\theta-1} = \\theta^n \\left( \\prod_{i=1}^n x_i \\right)^{\\theta-1} $$\n取对数得到对数似然函数：\n$$ \\ln L(\\theta) = n \\ln \\theta + (\\theta-1) \\sum_{i=1}^n \\ln x_i $$\n对对数似然函数关于 $\\theta$ 求导并令其等于 0：\n$$ \\frac{d}{d\\theta} \\ln L(\\theta) = \\frac{n}{\\theta} + \\sum_{i=1}^n \\ln x_i = 0 $$\n解得最大似然估计量为：\n$$ \\hat{\\theta}_{MLE} = -\\frac{n}{\\sum_{i=1}^n \\ln X_i} $$\n所以正确选项是 A。",
    hints: [
      "一阶矩估计只需要建立 $E(X) = \\bar{X}$ 的方程并求解参数。",
      "对于最大似然估计，对数似然方程是通过求导求驻点，注意样本取值在 0 到 1 之间，所以对数积为负，结果含有负号以保证估计量为正数。"
    ],
    relatedFormulas: [
      "E(X) = \\int_{a}^{b} x f(x) dx",
      "L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta)"
    ],
    commonMistakes: [
      "容易在解矩估计方程时化简错误得到分式颠倒。",
      "在最大似然求导时，容易把负号漏掉，导致估计出的参数为负值，违反参数本身的取值范围约束。"
    ]
  },
  {
    id: "7.1-2",
    chapterId: 7,
    sectionId: "7.1",
    difficulty: "basic",
    type: "choice",
    tags: ["最大似然估计", "均匀分布", "边界参数"],
    question: "设 $X_1, X_2, \\dots, X_n$ 是来自总体 $X \\sim U[0, \\theta]$ 的简单随机样本，其中 $\\theta > 0$ 是未知参数，则 $\\theta$ 的最大似然估计量为：",
    options: [
      "$\\bar{X}$",
      "$2\\bar{X}$",
      "$\\max(X_1, X_2, \\dots, X_n)$",
      "$\\min(X_1, X_2, \\dots, X_n)$"
    ],
    answer: "C",
    solution: "均匀分布 $U[0, \\theta]$ 的概率密度为 $f(x; \\theta) = \\frac{1}{\\theta}$ (当 $0 \\le x \\le \\theta$)。写出样本的似然函数：\n$$ L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta) = \\begin{cases} \\frac{1}{\\theta^n}, & 0 \\le x_1, \\dots, x_n \\le \\theta \\\\ 0, & \\text{其他} \\end{cases} $$\n要使得似然函数不为 0，参数 $\\theta$ 必须满足 $\\theta \\ge x_i$ 对所有的 $i=1, \\dots, n$ 都成立。也就是说，$\\theta \\ge \\max(x_1, \\dots, x_n) = x_{(n)}$。\n在此范围内，似然函数 $L(\\theta) = \\theta^{-n}$ 是关于 $\\theta$ 的严格递减函数。为了让似然函数取得最大值，我们需要选取使得 $L(\\theta)$ 最大的那个 $\\theta$。因为它是减函数，所以我们要取其定义域的最小下限：\n$$ \\hat{\\theta}_{MLE} = x_{(n)} = \\max(X_1, X_2, \\dots, X_n) $$\n因此正确答案是 C。",
    hints: [
      "由于总体取值范围与参数相关，似然函数最大化不能通过求导数来做，而应该通过观察单调性和自变量的取值范围来判断。"
    ],
    relatedFormulas: [
      "L(\\theta) = \\theta^{-n} \\quad (\\theta \\ge X_{(n)})"
    ],
    commonMistakes: [
      "常犯错误是直接对对数似然函数 $-n \\ln \\theta$ 求导并令其为 0，得到 $-n/\\theta = 0$，从而误以为似然估计不存在。",
      "容易与矩估计的估计量 $2\\bar{X}$ 混淆。"
    ]
  },
  {
    id: "7.2-1",
    chapterId: 7,
    sectionId: "7.2",
    difficulty: "intermediate",
    type: "choice",
    tags: ["无偏性", "有效性", "估计量评选"],
    question: "设 $X_1, X_2, X_3$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，设 $\\hat{\\mu}_1 = \\frac{1}{2}X_1 + \\frac{1}{3}X_2 + \\frac{1}{6}X_3$ 和 $\\hat{\\mu}_2 = \\frac{1}{3}X_1 + \\frac{1}{3}X_2 + \\frac{1}{3}X_3$ 都是 $\\mu$ 的无偏估计。关于它们的有效性，下列说法正确的是：",
    options: [
      "$\\hat{\\mu}_1$ 较 $\\hat{\\mu}_2$ 更有效",
      "$\\hat{\\mu}_2$ 较 $\\hat{\\mu}_1$ 更有效",
      "两者同样有效",
      "有效性与 $\\sigma^2$ 的大小有关，无法确定"
    ],
    answer: "B",
    solution: "由于两者都是无偏估计（系数和为 1，且总体独立同期望），我们比较它们的方差大小。方差更小者更有效。\n计算第一个估计量 $\\hat{\\mu}_1$ 的方差：\n$$ D(\\hat{\\mu}_1) = D\\left(\\frac{1}{2}X_1 + \\frac{1}{3}X_2 + \\frac{1}{6}X_3\\right) = \\left(\\frac{1}{4} + \\frac{1}{9} + \\frac{1}{36}\\right)\\sigma^2 = \\frac{9 + 4 + 1}{36}\\sigma^2 = \\frac{14}{36}\\sigma^2 = \\frac{7}{18}\\sigma^2 \\approx 0.389\\sigma^2 $$\n计算第二个估计量 $\\hat{\\mu}_2$ 的方差：\n$$ D(\\hat{\\mu}_2) = D(\\bar{X}) = \\frac{\\sigma^2}{3} = \\frac{6}{18}\\sigma^2 \\approx 0.333\\sigma^2 $$\n因为 $D(\\hat{\\mu}_2) < D(\\hat{\\mu}_1)$，所以 $\\hat{\\mu}_2$ 的波动度更小，它比 $\\hat{\\mu}_1$ 更有效。因此正确答案是 B。",
    hints: [
      "有效性是在无偏估计的前提下，通过对比各自方差的大小进行衡量的。",
      "由于样本独立，求线性组合的方差时，系数需要求平方和。"
    ],
    relatedFormulas: [
      "D(\\sum c_i X_i) = \\sum c_i^2 D(X_i)"
    ],
    commonMistakes: [
      "容易忘记系数在求方差时要平方，误算为系数直接求和，从而认为方差相等。"
    ]
  },
  {
    id: "7.2-2",
    chapterId: 7,
    sectionId: "7.2",
    difficulty: "exam",
    type: "choice",
    tags: ["有偏估计", "一致估计", "样本方差", "大样本性质"],
    question: "设 $X_1, X_2, \\dots, X_n$ ($n \\ge 2$) 是来自总体 $X \\sim N(\\mu, \\sigma^2)$ 的简单随机样本。令 $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$，则下列关于 $\\hat{\\sigma}^2$ 的说法正确的是：",
    options: [
      "$\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的无偏估计，也是一致估计",
      "$\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的有偏估计，但不是一致估计",
      "$\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的有偏估计，也是一致估计",
      "$\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的无偏估计，但不是一致估计"
    ],
    answer: "C",
    solution: "首先验证无偏性：我们已知样本方差 $S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$ 是 $\\sigma^2$ 的无偏估计。而 $\\hat{\\sigma}^2 = \\frac{n-1}{n} S^2$。求期望：\n$$ E(\\hat{\\sigma}^2) = E\\left( \\frac{n-1}{n} S^2 \\right) = \\frac{n-1}{n} E(S^2) = \\frac{n-1}{n} \\sigma^2 \\ne \\sigma^2 $$\n所以 $\\hat{\\sigma}^2$ 是有偏估计。\n\n然后验证一致性：根据大数定律与连续映射定理，样本方差 $S^2 \\xrightarrow{P} \\sigma^2$。而：\n$$ \\hat{\\sigma}^2 = \\frac{n-1}{n} S^2 = \\left( 1 - \\frac{1}{n} \\right) S^2 $$\n当 $n \\to \\infty$ 时，系数 $1 - \\frac{1}{n} \\to 1$。根据依概率收敛的代数性质，有：\n$$ \\hat{\\sigma}^2 \\xrightarrow{P} 1 \\cdot \\sigma^2 = \\sigma^2 $$\n所以 $\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的一致估计。\n综上，$\\hat{\\sigma}^2$ 是 $\\sigma^2$ 的有偏估计，也是一致估计。正确选项为 C。",
    hints: [
      "注意区分 $S^2$（分母为 $n-1$）和最大似然估计量 $\\hat{\\sigma}^2$（分母为 $n$）在无偏性上的区别。",
      "一致性表示在大样本极限下估计量收敛到参数真值，因而有偏估计量也可以是一致估计。"
    ],
    relatedFormulas: [
      "E(S^2) = \\sigma^2",
      "S^2 \\xrightarrow{P} \\sigma^2"
    ],
    commonMistakes: [
      "容易根据直觉错误地认为只要是有偏估计，就一定不会是一致估计。其实很多 MLE 是有偏的但是一致的。"
    ]
  },
  {
    id: "7.3-1",
    chapterId: 7,
    sectionId: "7.3",
    difficulty: "basic",
    type: "choice",
    tags: ["置信区间", "置信水平", "临界值"],
    question: "对于正态总体 $N(\\mu, \\sigma^2)$ 的均值 $\\mu$ 进行区间估计，在样本容量 $n$ 不变的情况下，如果将置信度从 $95\\%$ 提高到 $99\\%$，则置信区间的长度将：",
    options: [
      "变长",
      "变短",
      "不变",
      "无法确定"
    ],
    answer: "A",
    solution: "无论是方差已知（采用 $z$ 临界值）还是方差未知（采用 $t$ 临界值），均值 $\\mu$ 的双侧置信区间长度都正比于对应的临界值。当置信度 $1-\\alpha$ 增大时，显著性水平 $\\alpha$ 减小，双侧临界值（如 $z_{\\alpha/2}$）相应变大。在样本容量 $n$ 以及波动程度不变的情况下，临界值的增大会直接导致置信区间的宽度 $2 z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}$（或 $2 t_{\\alpha/2} \\frac{S}{\\sqrt{n}}$）增加，即区间变长。因此，更高的置信度（更高的覆盖概率）需要牺牲精确度（区间长度），正确答案为 A。",
    hints: [
      "置信度是指区间罩住真实参数的把握度。把握度要求越高，估计的区间范围显然需要越宽越安全。"
    ],
    relatedFormulas: [
      "L = 2 z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}"
    ],
    commonMistakes: [
      "容易把置信度的提高错误理解为精度的提高，从而认为区间应该收窄。"
    ]
  },
  {
    id: "7.3-2",
    chapterId: 7,
    sectionId: "7.3",
    difficulty: "intermediate",
    type: "choice",
    tags: ["枢轴量", "区间估计", "卡方分布"],
    question: "设 $X_1, X_2, \\dots, X_n$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，$\\mu, \\sigma^2$ 均未知。要对 $\\sigma^2$ 进行区间估计，应当选择的枢轴量是：",
    options: [
      "$\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}$",
      "$\\frac{(n-1)S^2}{\\sigma^2}$",
      "$\\frac{\\sum_{i=1}^n (X_i - \\mu)^2}{\\sigma^2}$",
      "$\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}}$"
    ],
    answer: "B",
    solution: "枢轴量的选择需要满足：第一，包含待估计参数 $\\sigma^2$；第二，它的概率分布形式完全已知，且该分布不能带有任何未知参数。\n- A选项：服从自由度为 $n-1$ 的 $t$ 分布，其中没有未知参数，但它用于估计未知均值 $\\mu$，无法用来求解 $\\sigma^2$。\n- B选项：$\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)$。它的公式中只含有待估参数 $\\sigma^2$ 以及样本统计量 $S^2$（均值已消去），分布为完全确定的 $\\chi^2(n-1)$。符合条件。\n- C选项：虽服从 $\\chi^2(n)$ 分布，但公式中含有未知常数 $\\mu$。由于 $\\mu$ 未知，无法在此方程中解出 $\\sigma^2$ 的置信区间。\n- D选项：服从 $N(0, 1)$，但也包含了未知参数 $\\mu$。\n综上，枢轴量应选 B。",
    hints: [
      "判断枢轴量的核心在于看它的表达式中是否含有估计参数之外的其它未知参数。如果含有其它未知参数（如未知均值 $\\mu$），在计算临界值后便无法解出唯一的参数区间。"
    ],
    relatedFormulas: [
      "\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)"
    ],
    commonMistakes: [
      "容易选错成 C，忽略了虽然 C 的分布形式确定，但是因包含未知参数 $\\mu$ 而无法在实际样本中计算出置信区间界限。"
    ]
  },
  {
    id: "7.1-3",
    chapterId: 7,
    sectionId: "7.1",
    difficulty: "exam",
    type: "calculation",
    tags: ["最大似然估计", "无偏性", "考研真题", "边界参数"],
    question: "设总体 $X$ 的概率密度为 $f(x; \\theta) = \\begin{cases} \\frac{2x}{\\theta^2}, & 0 < x < \\theta \\\\ 0, & \\text{其他} \\end{cases}$，其中 $\\theta > 0$ 是未知参数。设 $X_1, X_2, \\dots, X_n$ 是来自该总体的简单随机样本。  \n(1) 求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}_{MLE}$；  \n(2) 判断 $\\hat{\\theta}_{MLE}$ 是否为 $\\theta$ 的无偏估计。",
    answer: "(1) \\hat{\\theta}_{MLE} = X_{(n)} = \\max(X_1, \\dots, X_n); (2) 否，其期望为 \\frac{2n}{2n+1}\\theta，是有偏估计。",
    solution: "解：(1) 写出样本的联合似然函数。当样本取值全部在 $(0, \\theta)$ 之间时，似然函数为：\n$$ L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta) = \\prod_{i=1}^n \\frac{2x_i}{\\theta^2} = \\frac{2^n \\prod_{i=1}^n x_i}{\\theta^{2n}} $$\n此时要求每个观测样本都满足 $0 < x_i < \\theta$，这等价于 $\\theta \\ge \\max(x_1, \\dots, x_n)$ 且所有 $x_i > 0$。\n记 $x_{(n)} = \\max(x_1, \\dots, x_n)$ 为样本的最大值。当 $\\theta \\ge x_{(n)}$ 时，似然函数可以写为：\n$$ L(\\theta) = \\left( 2^n \\prod_{i=1}^n x_i \\right) \\theta^{-2n} $$\n由于 $\\theta > 0$ 且 $-2n < 0$，该函数关于自变量 $\\theta$ 在范围 $[x_{(n)}, +\\infty)$ 上是严格单调递减的。所以，为了使似然函数 $L(\\theta)$ 取得最大值，$\\theta$ 必须取可能的最小值。即：\n$$ \\hat{\\theta}_{MLE} = x_{(n)} = \\max(x_1, x_2, \\dots, x_n) $$\n因此，$\\theta$ 的最大似然估计量为：\n$$ \\hat{\\theta}_{MLE} = X_{(n)} = \\max(X_1, X_2, \\dots, X_n) $$\n\n(2) 验证该估计量是否为无偏估计。为此，求其数学期望 $E(X_{(n)})$。首先推导最大值统计量 $X_{(n)}$ 的分布函数。\n总体 $X$ 的累积分布函数为：\n当 $x \\le 0$ 时，$F(x) = 0$；\n当 $0 < x < \\theta$ 时：\n$$ F(x) = \\int_0^x \\frac{2t}{\\theta^2} dt = \\frac{x^2}{\\theta^2} $$\n当 $x \\ge \\theta$ 时，$F(x) = 1$。\n因此最大值统计量 $X_{(n)}$ 的累积分布函数为：\n$$ F_{(n)}(x) = [F(x)]^n = \\left( \\frac{x^2}{\\theta^2} \\right)^n = \\frac{x^{2n}}{\\theta^{2n}}, \\quad 0 < x < \\theta $$\n求导得到 $X_{(n)}$ 的概率密度函数：\n$$ f_{(n)}(x) = \\frac{d}{dx} F_{(n)}(x) = \\frac{2n x^{2n-1}}{\\theta^{2n}}, \\quad 0 < x < \\theta $$\n计算 $X_{(n)}$ 的数学期望：\n$$ E(X_{(n)}) = \\int_0^\\theta x f_{(n)}(x) dx = \\int_0^\\theta x \\frac{2n x^{2n-1}}{\\theta^{2n}} dx = \\frac{2n}{\\theta^{2n}} \\int_0^\\theta x^{2n} dx = \\frac{2n}{\\theta^{2n}} \\left[ \\frac{x^{2n+1}}{2n+1} \\right]_0^\\theta = \\frac{2n}{2n+1} \\theta $$\n由于 $E(X_{(n)}) = \\frac{2n}{2n+1} \\theta \\ne \\theta$，因此最大似然估计量 $\\hat{\\theta}_{MLE}$ 不是无偏估计量。说明它是 $\\theta$ 的有偏估计量（但随着样本容量 $n \\to \\infty$，它收敛到无偏，因而是渐近无偏的）。",
    hints: [
      "若总体的概率密度函数在其值域范围的边界上包含未知参数，那么对似然函数取对数求导通常会失效，此时要写出精确的边界限制关系，根据似然函数的单调性直接求最大值点。",
      "若要求最大值统计量 $X_{(n)}$ 的期望，应首先依据总体分布函数推导出 $X_{(n)}$ 的概率分布函数，然后再利用定义积分求解期望值。"
    ],
    relatedFormulas: [
      "F_{(n)}(x) = [F(x)]^n",
      "f_{(n)}(x) = n [F(x)]^{n-1} f(x)"
    ],
    commonMistakes: [
      "第一步直接套用常规求导法，导致似然方程求导后没有常数零点，从而误以为似然估计不存在。",
      "第二步直接把样本最大值的期望当作单个样本的期望来求，没有对统计量本身的概率密度进行正确推导。"
    ]
  },
  {
    id: "7.3-3",
    chapterId: 7,
    sectionId: "7.3",
    difficulty: "exam",
    type: "calculation",
    tags: ["置信区间", "样本容量", "均值区间估计", "正态总体"],
    question: "设总体 $X \\sim N(\\mu, \\sigma^2)$，其中 $\\sigma^2 = 9$。现要求对 $\\mu$ 进行区间估计，要求置信度为 $0.95$。若希望置信区间的长度不超过 $2$，则样本容量 $n$ 至少应为多少？（设 $z_{0.025} = 1.96$）",
    answer: "35",
    solution: "解：由于总体方差 $\\sigma^2 = 9 \\implies \\sigma = 3$ 已知，因此采用 $z$ 统计量作为均值 $\\mu$ 区间估计的枢轴量。其双侧置信区间的解析式为：\n$$ \\left[ \\bar{X} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}, \\ \\bar{X} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right] $$\n置信区间的区间长度 $L$ 为：\n$$ L = 2 z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} $$\n已知已知数据：$\\sigma = 3$，显著性水平 $\\alpha = 1 - 0.95 = 0.05$，对应的双侧临界值 $z_{\\alpha/2} = z_{0.025} = 1.96$。\n要求置信区间的长度不超过 2，即：\n$$ L \\le 2 \\implies 2 \\times 1.96 \\times \\frac{3}{\\sqrt{n}} \\le 2 $$\n不等式两边消去 2，得：\n$$ 1.96 \\times 3 \\le \\sqrt{n} \\implies \\sqrt{n} \\ge 5.88 $$\n两边平方：\n$$ n \\ge (5.88)^2 = 34.5744 $$\n因为样本容量 $n$ 在抽样设计中必须是正整数，为了确保区间长度绝对不超过 2，必须向上取整：\n$$ n \\ge 35 $$\n答：若要求置信区间长度不超过 2，则样本容量 $n$ 至少应当为 35。",
    hints: [
      "理清题意中给出的方差是已知还是未知。若已知，使用正态分布分位数；若未知，使用 $t$ 分位数。",
      "注意置信区间的长度是置信上限减去置信下限，对应公式中的系数为 2。"
    ],
    relatedFormulas: [
      "L = 2 z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}"
    ],
    commonMistakes: [
      "容易将“置信区间的长度不超过 2”错误地看成“允许误差（即半区间长度）不超过 2”，导致分母少除了 2，算出 $n$ 值为 8.6，结果取整为 9 造成巨大差错。",
      "在最终求样本数时对 34.57 误作普通的四舍五入得到 34。实际上如果 $n=34$，代入区间长度会发现长度略大于 2，无法满足“不超过 2”的硬性要求，故凡此类题必须一律进位取整。"
    ]
  }
];
