import type { Exercise } from '../../types/exercise';

export const ch09Exercises: Exercise[] = [
  {
    id: "9.1-1",
    chapterId: 9,
    sectionId: "9.1",
    difficulty: "basic",
    type: "choice",
    tags: ["方差分析", "自由度", "F检验"],
    question: "在单因素方差分析中，设因素 $A$ 有 $k = 4$ 个水平，总观测次数为 $n = 24$。在原假设 $H_0$（各组均值无显著差异）成立的条件下，组间平方和 $S_A$ 与组内平方和 $S_E$ 的自由度，以及检验统计量 $F$ 服从的分布分别为：",
    options: [
      "df_A = 3, df_E = 20, F \\sim F(3, 20)",
      "df_A = 4, df_E = 20, F \\sim F(4, 20)",
      "df_A = 3, df_E = 21, F \\sim F(3, 21)",
      "df_A = 4, df_E = 24, F \\sim F(4, 24)"
    ],
    answer: "A",
    solution: `
我们要根据方差分析的理论基础确定各项变异的自由度及其统计量分布：

1. **组间自由度 (Factor A Degrees of Freedom)**：
   设组数为 $k$，则组间偏差平方和 $S_A$ 的自由度为：
   $$ df_A = k - 1 = 4 - 1 = 3 $$

2. **组内（误差）自由度 (Error Degrees of Freedom)**：
   设总样本量为 $n$，则组内（误差）偏差平方和 $S_E$ 的自由度为：
   $$ df_E = n - k = 24 - 4 = 20 $$

3. **F 统计量的分布**：
   在原假设 $H_0$ 成立时，组间均方与组内均方的比值构成 $F$ 统计量：
   $$ F = \\frac{MS_A}{MS_E} = \\frac{S_A / df_A}{S_E / df_E} $$
   由于 $\\frac{S_A}{\\sigma^2} \\sim \\chi^2(df_A)$，$\\frac{S_E}{\\sigma^2} \\sim \\chi^2(df_E)$，且它们相互独立。
   因此其比值服从第一自由度为 $df_A$、第二自由度为 $df_E$ 的 $F$ 分布：
   $$ F \\sim F(3, 20) $$

综上所述，答案选 A。
    `,
    hints: [
      "总自由度为 $n-1$，组间自由度为 $k-1$，误差自由度为 $n-k$。",
      "注意自由度相加关系：$df_T = df_A + df_E$。"
    ],
    relatedFormulas: [
      "df_A = k - 1",
      "df_E = n - k",
      "F = \\frac{S_A / (k-1)}{S_E / (n-k)} \\sim F(k-1, n-k)"
    ],
    commonMistakes: [
      "混淆组间自由度为 $k$，导致选 B。",
      "将误差自由度误计算为 $n - k - 1$，导致选 C。"
    ]
  },
  {
    id: "9.1-2",
    chapterId: 9,
    sectionId: "9.1",
    difficulty: "exam",
    type: "choice",
    tags: ["方差分析", "平方和分解", "F值计算", "计算题"],
    question: "某研究者为了检验三种肥料（A1, A2, A3）对小麦产量的影响是否相同，在每个水平下分别种植了 5 株小麦（即组容量 $n_1 = n_2 = n_3 = 5$）。测得三组的产量总和分别为 $T_1 = 15$，$T_2 = 30$，$T_3 = 45$。若已知总偏差平方和 $S_T = 110$，则组间平方和 $S_A$、误差平方和 $S_E$ 以及用于检验的 $F$ 统计量观测值分别为：",
    options: [
      "S_A = 90, S_E = 20, F = 27",
      "S_A = 80, S_E = 30, F = 16",
      "S_A = 90, S_E = 20, F = 18",
      "S_A = 60, S_E = 50, F = 7.2"
    ],
    answer: "A",
    solution: `
我们通过以下步骤严格计算方差分析表中的各项数值：

**第一步：计算各组均值与总均值**
- 组容量：$n_1 = n_2 = n_3 = 5$，总观测数 $n = 15$。
- 各组均值：
  $$ \\bar{X}_{1\\cdot} = \\frac{T_1}{n_1} = \\frac{15}{5} = 3 $$
  $$ \\bar{X}_{2\\cdot} = \\frac{T_2}{n_2} = \\frac{30}{5} = 6 $$
  $$ \\bar{X}_{3\\cdot} = \\frac{T_3}{n_3} = \\frac{45}{5} = 9 $$
- 总均值：
  $$ \\bar{X}_{\\cdot\\cdot} = \\frac{T_1 + T_2 + T_3}{n} = \\frac{15 + 30 + 45}{15} = \\frac{90}{15} = 6 $$

**第二步：计算组间偏差平方和 $S_A$**
根据组间平方和的定义：
$$ S_A = \\sum_{i=1}^3 n_i (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})^2 $$
$$ S_A = 5 \\cdot (3 - 6)^2 + 5 \\cdot (6 - 6)^2 + 5 \\cdot (9 - 6)^2 $$
$$ S_A = 5 \\cdot 9 + 5 \\cdot 0 + 5 \\cdot 9 = 45 + 45 = 90 $$

**第三步：计算组内误差平方和 $S_E$**
利用偏差平方和的分解恒等式 $S_T = S_A + S_E$：
$$ S_E = S_T - S_A = 110 - 90 = 20 $$

**第四步：计算均方与 F 统计量观测值**
- 组间自由度：$df_A = k - 1 = 3 - 1 = 2$。
- 误差自由度：$df_E = n - k = 15 - 3 = 12$。
- 组间均方：
  $$ MS_A = \\frac{S_A}{df_A} = \\frac{90}{2} = 45 $$
- 误差均方：
  $$ MS_E = \\frac{S_E}{df_E} = \\frac{20}{12} = \\frac{5}{3} \\approx 1.667 $$
- F 统计量观测值：
  $$ F = \\frac{MS_A}{MS_E} = \\frac{45}{5/3} = 45 \\cdot \\frac{3}{5} = 27 $$

综上所述，计算结果为 $S_A = 90$，$S_E = 20$，$F = 27$。答案选 A。
    `,
    hints: [
      "首先求出各组的均值 $\\bar{X}_{i\\cdot}$ 和全体总均值 $\\bar{X}_{\\cdot\\cdot}$。",
      "利用公式 $S_A = \\sum n_i (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})^2$ 计算组间平方和，再通过 $S_E = S_T - S_A$ 求出误差平方和。",
      "注意，求 F 统计量时，平方和要分别除以各自的自由度得到均方 MS，而不是直接将平方和相除。"
    ],
    relatedFormulas: [
      "S_A = \\sum_{i=1}^k n_i (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})^2",
      "S_E = S_T - S_A",
      "F = \\frac{S_A / (k-1)}{S_E / (n-k)}"
    ],
    commonMistakes: [
      "在计算 $S_A$ 时，忘记乘以各组的权重 $n_i = 5$，导致算得 $S_A = (3-6)^2 + (6-6)^2 + (9-6)^2 = 18$。",
      "直接用平方和相除：$F = S_A / S_E = 90 / 20 = 4.5$，忽视了自由度的调整作用。"
    ]
  },
  {
    id: "9.2-1",
    chapterId: 9,
    sectionId: "9.2",
    difficulty: "basic",
    type: "choice",
    tags: ["线性回归", "最小二乘法", "参数估计"],
    question: "已知 5 组观测数据 $(x_i, Y_i)$ 分别为：$(1, 2)$，$(2, 3)$，$(3, 5)$，$(4, 4)$，$(5, 6)$。采用最小二乘法估计得到的一元线性回归方程 $\\hat{Y} = \\hat{\\beta}_0 + \\hat{\\beta}_1 x$ 为：",
    options: [
      "\\hat{Y} = 1.3 + 0.9x",
      "\\hat{Y} = 1.0 + 1.0x",
      "\\hat{Y} = 0.9 + 1.3x",
      "\\hat{Y} = 1.5 + 0.8x"
    ],
    answer: "A",
    solution: `
我们通过最小二乘估计的步骤来严格求解回归系数 $\\hat{\\beta}_1$ 与 $\\hat{\\beta}_0$：

**第一步：计算均值**
- 数据量 $n = 5$。
- $\\sum_{i=1}^5 x_i = 1 + 2 + 3 + 4 + 5 = 15 \\implies \\bar{x} = 3$。
- $\\sum_{i=1}^5 Y_i = 2 + 3 + 5 + 4 + 6 = 20 \\implies \\bar{Y} = 4$。

**第二步：计算各离差平方和与乘积和**
- $\\sum_{i=1}^5 x_i^2 = 1^2 + 2^2 + 3^2 + 4^2 + 5^2 = 1 + 4 + 9 + 16 + 25 = 55$。
- $S_{xx} = \\sum_{i=1}^5 x_i^2 - n \\bar{x}^2 = 55 - 5 \\cdot 3^2 = 55 - 45 = 10$。
- $\\sum_{i=1}^5 x_i Y_i = 1\\cdot 2 + 2\\cdot 3 + 3\\cdot 5 + 4\\cdot 4 + 5\\cdot 6 = 2 + 6 + 15 + 16 + 30 = 69$。
- $S_{xy} = \\sum_{i=1}^5 x_i Y_i - n \\bar{x} \\bar{Y} = 69 - 5 \\cdot 3 \\cdot 4 = 69 - 60 = 9$。

**第三步：求回归系数估计值**
- 斜率 $\\hat{\\beta}_1$：
  $$ \\hat{\\beta}_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{9}{10} = 0.9 $$
- 截距 $\\hat{\\beta}_0$：
  $$ \\hat{\\beta}_0 = \\bar{Y} - \\hat{\\beta}_1 \\bar{x} = 4 - 0.9 \\cdot 3 = 4 - 2.7 = 1.3 $$

因此，回归直线方程为 $\\hat{Y} = 1.3 + 0.9x$。答案选 A。
    `,
    hints: [
      "求回归斜率的公式为 $\\hat{\\beta}_1 = S_{xy}/S_{xx}$。",
      "计算 $S_{xx}$ 和 $S_{xy}$ 时，可以直接用简化计算公式，即 $\\sum x_i Y_i - n\\bar{x}\\bar{y}$。"
    ],
    relatedFormulas: [
      "\\hat{\\beta}_1 = \\frac{\\sum x_i Y_i - n\\bar{x}\\bar{Y}}{\\sum x_i^2 - n\\bar{x}^2}",
      "\\hat{\\beta}_0 = \\bar{Y} - \\hat{\\beta}_1 \\bar{x}"
    ],
    commonMistakes: [
      "将截距和斜率的计算顺序颠倒，或者将公式记为 $\\hat{\\beta}_1 = S_{xx}/S_{xy}$ 导致计算错误。",
      "在计算 $S_{xx}$ 时，将 $n \\bar{x}^2$ 错写为 $\\bar{x}^2$，即少除了系数 $n$。"
    ]
  },
  {
    id: "9.2-2",
    chapterId: 9,
    sectionId: "9.2",
    difficulty: "intermediate",
    type: "choice",
    tags: ["回归分析", "方差分解", "相关系数", "F检验"],
    question: "在对 10 组样本数据进行一元线性回归分析中，得到因变量的总偏差平方和为 $S_{yy} = 100$，残差平方和为 $Q = 36$。若斜率估计值 $\\hat{\\beta}_1 > 0$，则样本相关系数 $r$ 以及回归方程显著性检验的 $F$ 统计量观测值分别为：",
    options: [
      "r = 0.8, F = 14.22",
      "r = 0.6, F = 8.00",
      "r = 0.8, F = 16.00",
      "r = -0.8, F = 14.22"
    ],
    answer: "A",
    solution: `
我们通过回归方差分解和显著性检验的指标定义进行求解：

**第一步：计算回归平方和 $U$**
利用方差分解公式 $S_{yy} = U + Q$：
$$ U = S_{yy} - Q = 100 - 36 = 64 $$

**第二步：计算样本相关系数 $r$**
在一元线性回归中，决定系数（样本相关系数的平方）定义为：
$$ r^2 = R^2 = \\frac{U}{S_{yy}} = \\frac{64}{100} = 0.64 $$
由于斜率估计值 $\\hat{\\beta}_1 > 0$，说明自变量与因变量为正相关，故样本相关系数 $r$ 取正值：
$$ r = \\sqrt{0.64} = 0.8 $$

**第三步：计算显著性检验的 F 统计量**
- 回归平方和的自由度为 1。
- 残差平方和的自由度为 $n - 2 = 10 - 2 = 8$。
- 残差均方（方差 $\\sigma^2$ 的无偏估计）为：
  $$ s^2 = \\frac{Q}{n - 2} = \\frac{36}{8} = 4.5 $$
- F 统计量观测值：
  $$ F = \\frac{U / 1}{Q / (n-2)} = \\frac{64}{4.5} = \\frac{128}{9} \\approx 14.22 $$

因此，相关系数 $r = 0.8$，$F \\approx 14.22$。答案选 A。
    `,
    hints: [
      "利用回归方差分解恒等式 $S_{yy} = U + Q$ 先求出回归平方和 $U$。",
      "样本相关系数 $r$ 的平方等于 $U/S_{yy}$，其符号与回归系数 $\\hat{\\beta}_1$ 保持一致。",
      "F 统计量公式为 $\\frac{U}{Q/(n-2)}$，注意自由度分母为 $n-2$。"
    ],
    relatedFormulas: [
      "S_{yy} = U + Q",
      "r^2 = \\frac{U}{S_{yy}}",
      "F = \\frac{U}{Q/(n-2)}"
    ],
    commonMistakes: [
      "忽视了 $\\hat{\\beta}_1 > 0$ 的符号限制，在其他题目中如果斜率为负，相关系数必须取负数。",
      "在计算 F 值时，分母的残差平方和没有除以自由度 $n-2=8$，直接算成了 $F = U/Q = 64/36 \\approx 1.78$。"
    ]
  },
  {
    id: "9.2-3",
    chapterId: 9,
    sectionId: "9.2",
    difficulty: "challenge",
    type: "choice",
    tags: ["回归系数", "抽样分布", "估计量方差", "考研难点"],
    question: "在一元线性回归模型 $Y_i = \\beta_0 + \\beta_1 x_i + \\epsilon_i$ 中，假设 $\\epsilon_i \\sim N(0, \sigma^2)$ 独立同分布。令 $\\hat{\\beta}_1$ 为斜率的最小二乘估计量，$s^2 = \\frac{Q}{n-2}$ 为误差方差的无偏估计。在原假设 $H_0: \\beta_1 = 0$ 成立时，统计量 $T = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{s}$ 服从的分布，以及当自变量的取值范围收窄（使得 $S_{xx} = \\sum (x_i - \\bar{x})^2$ 减小）时，$\\hat{\\beta}_1$ 的方差变化情况分别为：",
    options: [
      "T \\sim t(n-2)，且 \\hat{\\beta}_1 的方差增大",
      "T \\sim t(n-2)，且 \\hat{\\beta}_1 的方差减小",
      "T \\sim F(1, n-2)，且 \\hat{\\beta}_1 的方差增大",
      "T \\sim t(n-1)，且 \\hat{\\beta}_1 的方差不变"
    ],
    answer: "A",
    solution: `
本题考查回归系数估计量的概率分布特性以及它的精度决定机制：

**1. 统计量 T 的分布推导**
- 我们知道，斜率估计量服从正态分布：
  $$ \\hat{\\beta}_1 \\sim N\\left(\\beta_1, \\frac{\\sigma^2}{S_{xx}}\\right) $$
- 在原假设 $H_0: \\beta_1 = 0$ 成立的条件下，有 $\\hat{\\beta}_1 \\sim N(0, \\frac{\\sigma^2}{S_{xx}})$。标准化后得到：
  $$ Z = \\frac{\\hat{\\beta}_1 - 0}{\\sqrt{\\sigma^2 / S_{xx}}} = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{\\sigma} \\sim N(0, 1) $$
- 同时，残差平方和满足：
  $$ \\chi^2 = \\frac{Q}{\\sigma^2} \\sim \\chi^2(n-2) $$
- 且在正态假设下，估计量 $\\hat{\\beta}_1$ 与残差平方和 $Q$（因而与 $s^2$）是相互独立的。
- 构造 t 统计量（标准正态除以独立的卡方与自由度之比的平方根）：
  $$ T = \\frac{Z}{\\sqrt{\\chi^2 / (n-2)}} = \\frac{\\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{\\sigma}}{\\sqrt{\\frac{Q}{\\sigma^2} / (n-2)}} = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{s} \\sim t(n-2) $$

**2. 估计量方差与 $S_{xx}$ 的关系**
- 回归斜率估计量的方差表达式为：
  $$ D(\\hat{\\beta}_1) = \\frac{\\sigma^2}{S_{xx}} $$
- 当自变量的取值范围收窄时，各自变量观测值与其均值的偏离程度减小，使得自变量的离差平方和 $S_{xx} = \\sum_{i=1}^n (x_i - \\bar{x})^2$ 减小。
- 由于 $S_{xx}$ 在分母位置，它的减小将直接导致 $D(\\hat{\\beta}_1)$ **增大**（这在物理上意味着，自变量变化范围越小，我们对于斜率的估计就越不精确、波动越大）。

综上所述，统计量 $T \\sim t(n-2)$，且 $\\hat{\\beta}_1$ 的方差增大。答案选 A。
    `,
    hints: [
      "斜率估计量标准误的估计值为 $s / \\sqrt{S_{xx}}$，所以 $T$ 实际上是标准化斜率估计量。",
      "回忆 t 分布的构造，其自由度来源于独立的卡方随机变量的自由度，即残差平方和的自由度 $n-2$。",
      "从公式 $D(\\hat{\\beta}_1) = \\sigma^2/S_{xx}$ 中直接分析分母变小对结果的影响。"
    ],
    relatedFormulas: [
      "D(\\hat{\\beta}_1) = \\frac{\\sigma^2}{S_{xx}}",
      "T = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{s} \\sim t(n-2)"
    ],
    commonMistakes: [
      "错误记忆了残差平方和的自由度为 $n-1$，从而认为 $T \\sim t(n-1)$，导致错选 D。",
      "直觉上认为自变量范围收窄可以让波动减小，从而误认为方差减小，错选 B。"
    ]
  }
];
