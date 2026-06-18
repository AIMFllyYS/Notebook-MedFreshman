import type { Exercise } from '../../types/exercise';

export const ch06Exercises: Exercise[] = [
  {
    id: "6.1-1",
    chapterId: 6,
    sectionId: "6.1",
    difficulty: "basic",
    type: "choice",
    tags: ["样本方差", "数学期望", "样本均值", "无偏估计"],
    question: "设随机变量 $X_1, X_2, \\dots, X_n$ 是来自总体 $X$ 的简单随机样本，其中 $E(X) = \\mu$，$D(X) = \\sigma^2$。记样本均值为 $\\bar{X}$，样本方差为 $S^2$。求随机变量 $E(S^2)$ 和 $E(\\bar{X}^2)$ 的值：",
    options: [
      "E(S^2) = \\sigma^2, \\quad E(\\bar{X}^2) = \\mu^2 + \\sigma^2",
      "E(S^2) = \\frac{n-1}{n}\\sigma^2, \\quad E(\\bar{X}^2) = \\mu^2 + \\frac{\\sigma^2}{n}",
      "E(S^2) = \\sigma^2, \\quad E(\\bar{X}^2) = \\mu^2 + \\frac{\\sigma^2}{n}",
      "E(S^2) = \\frac{n-1}{n}\\sigma^2, \\quad E(\\bar{X}^2) = \\mu^2 + \\sigma^2"
    ],
    answer: "C",
    solution: `
首先计算 $E(S^2)$：
根据课本定理，样本方差 $S^2 = \\frac{1}{n-1} \\sum_{i=1}^n (X_i - \\bar{X})^2$ 是总体方差 $\\sigma^2$ 的无偏估计。因此，无偏性直接给出：
$$ E(S^2) = \\sigma^2 $$

接着计算 $E(\\bar{X}^2)$：
由样本均值的性质可知，样本均值 $\\bar{X}$ 的数学期望和方差分别为：
$$ E(\\bar{X}) = \\mu, \\quad D(\\bar{X}) = \\frac{\\sigma^2}{n} $$
利用方差的定义式 $D(\\bar{X}) = E(\\bar{X}^2) - [E(\\bar{X})]^2$，我们可以变形得到：
$$ E(\\bar{X}^2) = D(\\bar{X}) + [E(\\bar{X})]^2 = \\frac{\\sigma^2}{n} + \\mu^2 $$

综上所述，有 $E(S^2) = \\sigma^2$ 且 $E(\\bar{X}^2) = \\mu^2 + \\frac{\\sigma^2}{n}$，答案选 C。
    `,
    hints: [
      "记住样本方差的分母设计为 $n-1$ 的初衷就是为了使其数学期望等于总体方差，即满足无偏性。",
      "任意随机变量 $Y$ 的二阶原点矩可以通过方差和均值求得，即 $E(Y^2) = D(Y) + [E(Y)]^2$。在此处将 $Y$ 替换为 $\\bar{X}$ 即可。"
    ],
    relatedFormulas: [
      "E(S^2) = \\sigma^2",
      "D(\\bar{X}) = \\frac{\\sigma^2}{n}",
      "E(X^2) = D(X) + [E(X)]^2"
    ],
    commonMistakes: [
      "误认为样本均值的方差与总体方差相等，即错记为 $D(\\bar{X}) = \\sigma^2$，从而导致 $E(\\bar{X}^2)$ 算错。",
      "将样本方差 $S^2$ 与样本未修正方差 $S^{*2}$ 混淆，误以为 $E(S^2) = \\frac{n-1}{n}\\sigma^2$。"
    ]
  },
  {
    id: "6.1-2",
    chapterId: 6,
    sectionId: "6.1",
    difficulty: "intermediate",
    type: "choice",
    tags: ["无偏估计", "方差最小化", "简单随机样本"],
    question: "设 $X_1, X_2, X_3, X_4$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本。若定义统计量 $\\hat{\\mu} = aX_1 + bX_2 + cX_3 + dX_4$ 是总体均值 $\\mu$ 的无偏估计，且要求 $\\hat{\\mu}$ 的方差最小，则系数 $a, b, c, d$ 应满足：",
    options: [
      "a = b = c = d = 1",
      "a = b = c = d = \\frac{1}{4}",
      "a = \\frac{1}{2}, \\ b = \\frac{1}{2}, \\ c = 0, \\ d = 0",
      "a = \\frac{1}{3}, \\ b = \\frac{1}{3}, \\ c = \\frac{1}{3}, \\ d = 0"
    ],
    answer: "B",
    solution: `
根据无偏估计的定义，估计量 $\\hat{\\mu}$ 的数学期望必须等于被估计的参数 $\\mu$：
$$ E(\\hat{\\mu}) = E(aX_1 + bX_2 + cX_3 + dX_4) = aE(X_1) + bE(X_2) + cE(X_3) + dE(X_4) $$
由于样本同分布，有 $E(X_i) = \\mu \\ (i=1,2,3,4)$。代入上式得：
$$ E(\\hat{\\mu}) = (a+b+c+d)\\mu = \\mu $$
因此，系数必须满足约束条件：
$$ a + b + c + d = 1 $$

又因为样本 $X_1, X_2, X_3, X_4$ 是相互独立的，所以 $\\hat{\\mu}$ 的方差为：
$$ D(\\hat{\\mu}) = D(aX_1 + bX_2 + cX_3 + dX_4) = a^2D(X_1) + b^2D(X_2) + c^2D(X_3) + d^2D(X_4) $$
已知 $D(X_i) = \\sigma^2$，所以：
$$ D(\\hat{\\mu}) = (a^2 + b^2 + c^2 + d^2)\\sigma^2 $$

要在约束条件 $a+b+c+d=1$ 下使方差 $D(\\hat{\\mu})$ 最小，只需使平方和 $a^2 + b^2 + c^2 + d^2$ 最小。
根据 Cauchy-Schwarz 不等式（柯西不等式）：
$$ (a^2 + b^2 + c^2 + d^2)(1^2 + 1^2 + 1^2 + 1^2) \\ge (a\\cdot 1 + b\\cdot 1 + c\\cdot 1 + d\\cdot 1)^2 $$
$$ 4(a^2 + b^2 + c^2 + d^2) \\ge (a+b+c+d)^2 = 1 $$
$$ a^2 + b^2 + c^2 + d^2 \\ge \\frac{1}{4} $$
等号成立当且仅当 $a = b = c = d$。结合 $a+b+c+d=1$，可得唯一解：
$$ a = b = c = d = \\frac{1}{4} $$
此时估计量的方差达到最小，即为样本均值 $\\bar{X}$。答案选 B。
    `,
    hints: [
      "先列出无偏估计的数学期望关系，推导得出系数相加等于 1 的条件限制。",
      "利用样本独立性展开方差，将其转化为带约束条件的多元函数求极值问题，采用柯西不等式可极速求解。"
    ],
    relatedFormulas: [
      "E(\\sum c_i X_i) = \\sum c_i E(X_i)",
      "D(\\sum c_i X_i) = \\sum c_i^2 D(X_i) \\quad (X_i 相互独立)"
    ],
    commonMistakes: [
      "直接套用对称性选择 B，但在做非等权组合（如某些样本精度不同）时可能会出错，建议掌握用柯西不等式或拉格朗日乘数法的严格推导过程。",
      "遗漏无偏性约束条件 $a+b+c+d=1$，导致无法求解。"
    ]
  },
  {
    id: "6.3-1",
    chapterId: 6,
    sectionId: "6.3",
    difficulty: "intermediate",
    type: "choice",
    tags: ["抽样分布", "卡方分布", "F分布", "数学期望", "独立分解"],
    question: "设 $X_1, X_2, \\dots, X_n$ ($n > 3$) 是来自总体 $X \\sim N(0, \\sigma^2)$ 的简单随机样本，设 $S^2$ 为样本方差，求统计量 $Y = \\frac{\\sum_{i=1}^n X_i^2}{S^2}$ 的数学期望 $E(Y)$：",
    options: [
      "\\frac{n(n-1)}{n-2}",
      "\\frac{n(n-2)}{n-3}",
      "\\frac{(n-1)(n-2)}{n-3}",
      "\\frac{n(n-1)}{n-3}"
    ],
    answer: "C",
    solution: `
因为总体均值 $E(X) = 0$，样本均值为 $\\bar{X}$，我们将分子的平方和进行恒等变形，分解为包含样本方差和样本均值两部分：
$$ \\sum_{i=1}^n X_i^2 = \\sum_{i=1}^n (X_i - \\bar{X})^2 + n\\bar{X}^2 = (n-1)S^2 + n\\bar{X}^2 $$
由此，统计量 $Y$ 可以写为：
$$ Y = \\frac{(n-1)S^2 + n\\bar{X}^2}{S^2} = (n-1) + \\frac{n\\bar{X}^2}{S^2} $$

由于总体为正态分布，根据正态总体抽样定理，样本均值 $\\bar{X}$ 与样本方差 $S^2$ 是相互独立的。
因此，随机变量 $n\\bar{X}^2$ 与 $S^2$ 也相互独立。
我们分别将其标准化，引入标准卡方变量：
1. 因为 $\\bar{X} \\sim N(0, \\sigma^2/n)$，故有 $\\frac{\\bar{X}}{\\sigma/\\sqrt{n}} \\sim N(0, 1)$。其平方服从自由度为 1 的卡方分布：
   $$ U = \\frac{n\\bar{X}^2}{\\sigma^2} \\sim \\chi^2(1) $$
2. 根据抽样定理，样本方差满足：
   $$ V = \\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1) $$
且 $U$ 与 $V$ 相互独立。

那么统计量 $Y$ 尾部项可以变形为：
$$ \\frac{n\\bar{X}^2}{S^2} = \\frac{U \\cdot \\sigma^2}{\\frac{V \\cdot \\sigma^2}{n-1}} = (n-1) \\frac{U}{V} $$
因此有：
$$ Y = (n-1) + (n-1) \\frac{U}{V} $$
要求 $E(Y)$，由期望的线性性质可得：
$$ E(Y) = (n-1) + (n-1) E\\left( \\frac{U}{V} \\right) $$
由于 $U$ 与 $V$ 相互独立，所以其商的期望等于期望的乘积：
$$ E\\left( \\frac{U}{V} \\right) = E(U) \\cdot E\\left( \\frac{1}{V} \\right) $$
- 因为 $U \\sim \\chi^2(1)$，故其数学期望为自由度 $E(U) = 1$。
- 因为 $V \\sim \\chi^2(n-1)$，关于卡方分布倒数的期望，若 $W \\sim \\chi^2(k)$ ($k > 2$)，则 $E(1/W) = \\frac{1}{k-2}$。这里自由度 $k = n-1 > 2$ (即 $n > 3$)，所以：
  $$ E\\left( \\frac{1}{V} \\right) = \\frac{1}{(n-1)-2} = \\frac{1}{n-3} $$
由此可算得：
$$ E\\left( \\frac{U}{V} \\right) = 1 \\cdot \\frac{1}{n-3} = \\frac{1}{n-3} $$
代回 $E(Y)$ 的表达式中：
$$ E(Y) = (n-1) + (n-1) \\cdot \\frac{1}{n-3} = (n-1) \\left( 1 + \\frac{1}{n-3} \\right) = (n-1) \\frac{n-2}{n-3} = \\frac{(n-1)(n-2)}{n-3} $$

因此，答案选 C。
    `,
    hints: [
      "分子并不是独立的，不能直接拆开。需要利用公式 $\\sum X_i^2 = (n-1)S^2 + n\\bar{X}^2$ 将分子展开。",
      "利用正态总体中 $\\bar{X}$ 与 $S^2$ 的独立性，将问题转化为独立的卡方变量之商。",
      "注意若 $V \\sim \\chi^2(k)$，则 $E(1/V) = \\frac{1}{k-2}$，这里自由度是 $n-1$。"
    ],
    relatedFormulas: [
      "\\sum_{i=1}^n X_i^2 = (n-1)S^2 + n\\bar{X}^2",
      "\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)",
      "E(1/W) = \\frac{1}{k-2} \\quad (W \\sim \\chi^2(k))"
    ],
    commonMistakes: [
      "错误地认为 $\\sum X_i^2$ 和 $S^2$ 相互独立，直接将分子分母的期望拆开相除。",
      "在计算卡方倒数的期望时，直接代入 $E(1/V) = 1/E(V) = 1/(n-1)$。事实上由于凸函数的 Jensen 不等式，恒有 $E(1/V) > 1/E(V)$，必须按照积分公式推导得到 $1/(k-2)$。"
    ]
  },
  {
    id: "6.3-2",
    chapterId: 6,
    sectionId: "6.3",
    difficulty: "exam",
    type: "choice",
    tags: ["抽样分布", "卡方分布", "F分布", "正态分布"],
    question: "设 $X_1, X_2, \\dots, X_6$ 是来自总体 $N(0, \\sigma^2)$ 的简单随机样本，则统计量 $Y = \\frac{(X_1 + X_2)^2 + (X_3 + X_4)^2}{2(X_5 - X_6)^2}$ 服从的分布为：",
    options: [
      "F(2, 1)",
      "F(1, 2)",
      "t(2)",
      "t(1)"
    ],
    answer: "A",
    solution: `
我们要根据统计量 $Y$ 的构造方式来寻找其与常见三大抽样分布的联系。
首先，利用正态分布的线性组合性质对分子和分母的每一项进行简化：
1. 对于 $X_1 + X_2$：由于 $X_1, X_2$ 独立且服从 $N(0, \\sigma^2)$，所以有 $X_1 + X_2 \\sim N(0, 2\\sigma^2)$。
   标准化得到：
   $$ \\frac{X_1 + X_2}{\\sqrt{2}\\sigma} \\sim N(0, 1) $$
   其平方服从自由度为 1 的卡方分布：
   $$ U_1 = \\frac{(X_1 + X_2)^2}{2\\sigma^2} \\sim \\chi^2(1) $$
2. 对于 $X_3 + X_4$：同理可得：
   $$ U_2 = \\frac{(X_3 + X_4)^2}{2\\sigma^2} \\sim \\chi^2(1) $$
3. 由于 $X_1, X_2$ 与 $X_3, X_4$ 相互独立，所以 $U_1$ 与 $U_2$ 相互独立。根据卡方分布的可加性，分子对应的平方和满足：
   $$ W_1 = U_1 + U_2 = \\frac{(X_1 + X_2)^2 + (X_3 + X_4)^2}{2\\sigma^2} \\sim \\chi^2(2) $$

4. 对于分母项中的 $X_5 - X_6$：由于 $X_5, X_6 \\sim N(0, \\sigma^2)$ 且独立，则 $X_5 - X_6 \\sim N(0, 2\\sigma^2)$。
   标准化并平方得到：
   $$ W_2 = \\frac{(X_5 - X_6)^2}{2\\sigma^2} \\sim \\chi^2(1) $$

由于样本 $X_1, \\dots, X_6$ 两两独立，可得 $W_1$ 与 $W_2$ 相互独立。
此时我们拥有了两个独立的卡方随机变量：
$$ W_1 \\sim \\chi^2(2), \\quad W_2 \\sim \\chi^2(1) $$
根据 $F$ 分布的数学定义，两独立卡方变量除以各自自由度后的比值服从 $F$ 分布：
$$ F_{stat} = \\frac{W_1 / 2}{W_2 / 1} \\sim F(2, 1) $$
将 $W_1$ 和 $W_2$ 代入比值公式中展开：
$$ F_{stat} = \\frac{\\frac{(X_1 + X_2)^2 + (X_3 + X_4)^2}{2\\sigma^2} / 2}{\\frac{(X_5 - X_6)^2}{2\\sigma^2} / 1} = \\frac{(X_1 + X_2)^2 + (X_3 + X_4)^2}{2(X_5 - X_6)^2} = Y $$
因此，统计量 $Y \\sim F(2, 1)$。答案选 A。
    `,
    hints: [
      "首先求出每个独立括号项在标准化后的分布情况，通常是先标准化为 $N(0,1)$ 再平方得到 $\\chi^2(1)$。",
      "利用卡方分布的可加性把分子化为一个卡方分布，分母化为另一个卡方分布。",
      "套用 $F$ 分布定义时，别忘了分子和分母都要除以各自的自由度。"
    ],
    relatedFormulas: [
      "X \\sim N(0, \\sigma^2), Y \\sim N(0, \\sigma^2) \\implies X \\pm Y \\sim N(0, 2\\sigma^2)",
      "\\sum_{i=1}^k Z_i^2 \\sim \\chi^2(k) \\quad (Z_i \\sim N(0,1) \\ i.i.d.)",
      "F = \\frac{U/n_1}{V/n_2} \\sim F(n_1, n_2) \\quad (U \\sim \\chi^2(n_1), V \\sim \\chi^2(n_2) \\ 独立)"
    ],
    commonMistakes: [
      "忽略了和差运算后的方差变为 $2\\sigma^2$，直接把 $(X_1+X_2)^2/\\sigma^2$ 当成卡方分布，漏掉分母上的系数 $2$。",
      "容易将第一自由度与第二自由度写反，错选为 $F(1, 2)$。请记住分子对应的自由度在前，分母对应的在后。"
    ]
  },
  {
    id: "6.3-3",
    chapterId: 6,
    sectionId: "6.3",
    difficulty: "challenge",
    type: "choice",
    tags: ["正态总体定理", "卡方分布", "概念辨析", "真假命题"],
    question: "设 $X_1, X_2, \\dots, X_n$ ($n > 2$) 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，$\\bar{X}$ 为样本均值，$S^2$ 为样本方差，则下列陈述中错误的是：",
    options: [
      "\\bar{X} \\sim N(\\mu, \\frac{\\sigma^2}{n})",
      "\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)",
      "\\frac{\\bar{X} - \\mu}{S / \\sqrt{n}} \\sim t(n-1)",
      "\\frac{1}{n} \\sum_{i=1}^n \\left( \\frac{X_i - \\mu}{\\sigma} \\right)^2 \\sim \\chi^2(n)"
    ],
    answer: "D",
    solution: `
我们需要逐一审视各个选项的正确性：
- 选项 A：由独立正态随机变量的线性组合性质，若每个 $X_i \\sim N(\\mu, \\sigma^2)$ 且独立，则其样本均值 $\\bar{X} = \\frac{1}{n}\\sum X_i$ 必定服从正态分布，期望为 $\\mu$，方差为 $\\sigma^2/n$。故 A 正确。
- 选项 B：此为单个正态总体抽样定理中的定理三，样本方差尺度变换后服从自由度为 $n-1$ 的卡方分布，即 $\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)$。故 B 正确。
- 选项 C：此为单个正态总体抽样定理中的定理四，由于 $\\bar{X}$ 与 $S^2$ 相互独立，其标准化商服从自由度为 $n-1$ 的 $t$ 分布。故 C 正确。
- 选项 D：因为 $X_i \\sim N(\\mu, \\sigma^2)$，所以 $\\frac{X_i - \\mu}{\\sigma} \\sim N(0, 1)$ 是相互独立的标准正态变量。
  根据卡方分布的定义，其平方和服从自由度为 $n$ 的卡方分布，即：
  $$ \\sum_{i=1}^n \\left( \\frac{X_i - \\mu}{\\sigma} \\right)^2 \\sim \\chi^2(n) $$
  然而，选项 D 中的表达式在求和符号前多了一个系数 $\\frac{1}{n}$！
  设 $W = \\sum_{i=1}^n \\left( \\frac{X_i - \\mu}{\\sigma} \\right)^2 \\sim \\chi^2(n)$，则选项 D 实际上是 $\\frac{1}{n}W$。
  因为对于任何非零常数 $c \\neq 1$，若 $W \\sim \\chi^2(n)$，则 $cW$ 不再服从卡方分布（其值域、期望和方差均改变，例如期望变为 $1$ 而不是 $n$）。
  因此，$\\frac{1}{n} \\sum_{i=1}^n \\left( \\frac{X_i - \\mu}{\\sigma} \\right)^2$ 并不服从 $\\chi^2(n)$ 分布。

由于题目要求选择错误的陈述，故答案选 D。
    `,
    hints: [
      "选项 A, B, C 均为书本中关于正态总体抽样分布的经典定理，属于必须熟记的内容。",
      "仔细比对选项 D 与标准卡方分布定义的代数形式，注意求和号前方的系数 $\\frac{1}{n}$。"
    ],
    relatedFormulas: [
      "\\sum_{i=1}^n Z_i^2 \\sim \\chi^2(n) \\quad (Z_i \\sim N(0,1) \\ i.i.d.)",
      "\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)"
    ],
    commonMistakes: [
      "做题过快，将选项 D 误看成了没有 $\\frac{1}{n}$ 的卡方变量定义，从而漏掉了这一常见陷阱。",
      "混淆了样本均值 $\\bar{X}$ 的期望与方差，错将 A 认为错误。"
    ]
  },
  {
    id: "6.3-4",
    chapterId: 6,
    sectionId: "6.3",
    difficulty: "exam",
    type: "choice",
    tags: ["F分布", "双正态总体", "样本方差", "方差不等"],
    question: "设样本 $X_1, X_2, \\dots, X_n$ ($n \\ge 2$) 是来自总体 $N(\\mu_1, \\sigma^2)$ 的样本，$Y_1, Y_2, \\dots, Y_m$ ($m \\ge 2$) 是来自总体 $N(\\mu_2, 2\\sigma^2)$ 的样本，两样本独立。记 $S_1^2$ 和 $S_2^2$ 分别为两样本的样本方差，则下列统计量服从 $F(n-1, m-1)$ 分布的是：",
    options: [
      "\\frac{S_1^2}{S_2^2}",
      "\\frac{2S_1^2}{S_2^2}",
      "\\frac{S_1^2}{2S_2^2}",
      "\\frac{S_2^2}{2S_1^2}"
    ],
    answer: "B",
    solution: `
设两独立正态总体的样本方差分别为 $S_1^2$ 和 $S_2^2$，它们的总体方差分别为 $\\sigma_1^2$ 和 $\\sigma_2^2$。
已知：
$$ \\sigma_1^2 = \\sigma^2, \\quad \\sigma_2^2 = 2\\sigma^2 $$
根据两个独立正态总体样本方差比的抽样定理（定理五），有如下关系：
$$ \\frac{S_1^2 / \\sigma_1^2}{S_2^2 / \\sigma_2^2} \\sim F(n-1, m-1) $$

我们将已知的总体方差代入上面的公式中进行化简：
$$ \\frac{S_1^2 / \\sigma^2}{S_2^2 / (2\\sigma^2)} = \\frac{S_1^2}{\\sigma^2} \\cdot \\frac{2\\sigma^2}{S_2^2} = \\frac{2S_1^2}{S_2^2} $$
因此，统计量 $\\frac{2S_1^2}{S_2^2}$ 服从自由度为 $(n-1, m-1)$ 的 $F$ 分布。

所以，答案选 B。
    `,
    hints: [
      "写出最普适的两个独立正态总体方差比的 $F$ 分布公式：$\\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2} \\sim F(n-1, m-1)$。",
      "将给定的总体方差关系 $\\sigma_1^2 = \\sigma^2, \\sigma_2^2 = 2\\sigma^2$ 代入公式中，消去 $\\sigma^2$ 整理得到统计量的形式。"
    ],
    relatedFormulas: [
      "\\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2} \\sim F(n-1, m-1)"
    ],
    commonMistakes: [
      "误以为只要两样本独立，样本方差之比 $\\frac{S_1^2}{S_2^2}$ 就一定服从 $F(n-1, m-1)$ 分布。只有当两总体的方差相等时这一结论才成立，方差不等时必须乘以方差之比的倒数。",
      "在化简比值时将系数算错，例如算成 $\\frac{S_1^2}{2S_2^2}$（错选 C）或将自由度次序弄反。"
    ]
  }
];
