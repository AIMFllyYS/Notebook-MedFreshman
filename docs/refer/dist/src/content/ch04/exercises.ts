import type { Exercise } from '../../types/exercise';

export const ch04Exercises: Exercise[] = [
  {
    id: "4.1-1",
    chapterId: 4,
    sectionId: "4.1",
    difficulty: "basic",
    type: "choice",
    tags: ["数学期望", "连续型随机变量", "指数分布", "函数的期望"],
    question: "设随机变量 $X$ 服从参数为 $\\lambda = 2$ 的指数分布，求随机变量 $Y = e^{-X}$ 的数学期望 $E(Y)$：",
    options: [
      "\\frac{1}{3}",
      "\\frac{2}{3}",
      "\\frac{1}{2}",
      "2"
    ],
    answer: "B",
    solution: `
根据连续型随机变量函数的数学期望公式（LOTUS 定理），我们有：
$$ E(Y) = E(e^{-X}) = \\int_{-\\infty}^{\\infty} e^{-x} f(x) dx $$

因为 $X \\sim Exp(2)$，其概率密度函数为：
$$ f(x) = \\begin{cases} 2e^{-2x}, & x \\ge 0 \\\\ 0, & x < 0 \\end{cases} $$

将密度函数代入期望公式中计算：
$$ E(e^{-X}) = \\int_{0}^{\\infty} e^{-x} \\cdot 2e^{-2x} dx = 2 \\int_{0}^{\\infty} e^{-3x} dx $$

计算此广义积分：
$$ 2 \\int_{0}^{\\infty} e^{-3x} dx = 2 \\left[ -\\frac{1}{3} e^{-3x} \\right]_0^{\\infty} = 2 \\left( 0 - \\left(-\\frac{1}{3}\\right) \\right) = \\frac{2}{3} $$

因此，随机变量 $Y$ 的数学期望为 $\\frac{2}{3}$。答案选 B。
    `,
    hints: [
      "应用 LOTUS 定理，即 $E(g(X)) = \\int g(x) f(x) dx$。",
      "指数分布的非零积分区间为 $[0, \\infty)$，不要忘记概率密度中的系数 $\\lambda$。"
    ],
    relatedFormulas: [
      "E(g(X)) = \\int_{-\\infty}^{\\infty} g(x) f(x) dx",
      "f(x) = \\lambda e^{-\\lambda x} \\quad (x \\ge 0)"
    ],
    commonMistakes: [
      "容易漏掉指数分布概率密度函数中的常数系数 $\\lambda = 2$，导致积分计算错误。",
      "误认为期望可以直接穿透函数，即错误地认为 $E(e^{-X}) = e^{-E(X)}$。"
    ]
  },
  {
    id: "4.2-1",
    chapterId: 4,
    sectionId: "4.2",
    difficulty: "intermediate",
    type: "choice",
    tags: ["方差性质", "二项分布", "正态分布", "独立性"],
    question: "设随机变量 $X$ 与 $Y$ 相互独立，且 $X \\sim B(10, 0.4)$，$Y \\sim N(1, 4)$。求随机变量 $Z = 2X - 3Y + 5$ 的方差 $D(Z)$：",
    options: [
      "21.6",
      "38.4",
      "45.6",
      "27.6"
    ],
    answer: "C",
    solution: `
根据方差的数学性质，我们可以将原式的方差进行化简：
1. 常数平移不改变方差：$D(Z) = D(2X - 3Y + 5) = D(2X - 3Y)$。
2. 因为随机变量 $X$ 与 $Y$ 相互独立，所以和差的方差等于各自方差的和：
   $$ D(2X - 3Y) = D(2X) + D(-3Y) $$
3. 常数因子提出来要平方：
   $$ D(2X) + D(-3Y) = 2^2 D(X) + (-3)^2 D(Y) = 4 D(X) + 9 D(Y) $$

接下来分别求 $X$ 和 $Y$ 的方差：
- 对于二项分布 $X \\sim B(10, 0.4)$，其方差为：
  $$ D(X) = np(1-p) = 10 \\cdot 0.4 \\cdot (1 - 0.4) = 2.4 $$
- 对于正态分布 $Y \\sim N(1, 4)$，根据符号表示，第二个参数 4 即为方差：
  $$ D(Y) = 4 $$

将各自方差代回化简后的表达式中：
$$ D(Z) = 4 \\cdot 2.4 + 9 \\cdot 4 = 9.6 + 36 = 45.6 $$

因此，答案选 C。
    `,
    hints: [
      "记住方差平移性质 $D(X + C) = D(X)$。",
      "系数提取出方差时要平方，注意负号平方后变为正号，即 $D(aX + bY) = a^2 D(X) + b^2 D(Y)$。",
      "理清正态分布 $N(\\mu, \\sigma^2)$ 中的第二个参数是方差 $\\sigma^2 = 4$。"
    ],
    relatedFormulas: [
      "D(aX + bY + c) = a^2 D(X) + b^2 D(Y) \\quad (X, Y 独立)",
      "D(X) = np(1-p) \\quad (X \\sim B(n,p))"
    ],
    commonMistakes: [
      "在计算 $D(-3Y)$ 时，没有对系数平方，错写为 $-3D(Y)$，从而算得 $D(Z) = 4D(X) - 9D(Y)$ 甚至出现负数方差。",
      "将正态分布的参数 $4$ 误认为是标准差 $\\sigma$，认为方差为 $4^2 = 16$。"
    ]
  },
  {
    id: "4.3-1",
    chapterId: 4,
    sectionId: "4.3",
    difficulty: "exam",
    type: "choice",
    tags: ["相关系数", "独立性", "不相关", "概念辨析"],
    question: "设随机变量 $X \\sim N(0, 1)$，$Y = X^2$。关于随机变量 $X$ 与 $Y$ 的关系，下列说法正确的是：",
    options: [
      "X 与 Y 独立且不相关",
      "X 与 Y 相关且不独立",
      "X 与 Y 不相关且不独立",
      "X 与 Y 相关且独立"
    ],
    answer: "C",
    solution: `
我们需要分别研究 $X$ 与 $Y$ 的独立性和相关性：

**1. 独立性判定**：
因为随机变量 $Y$ 的值被 $X$ 的值完全决定（$Y = X^2$），它们之间存在着极强的函数对应关系。显而易见，它们是不独立的。

**2. 相关性判定**：
我们通过计算协方差来分析它们之间的相关性：
$$ Cov(X,Y) = E(XY) - E(X)E(Y) $$

因为 $X \\sim N(0, 1)$，所以均值 $E(X) = 0$。
接下来求混合矩 $E(XY)$：
$$ E(XY) = E(X \\cdot X^2) = E(X^3) $$

根据标准正态分布的概率密度函数 $f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2}$ 关于 $x=0$ 对称，且被积函数 $x^3 f(x)$ 是奇函数。
因此，奇数阶矩在对称区间上的积分值为 0：
$$ E(X^3) = \\int_{-\\infty}^{\\infty} x^3 \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}} dx = 0 $$

代回协方差公式：
$$ Cov(X,Y) = 0 - 0 \\cdot E(Y) = 0 $$
因为协方差为 0，所以两者的相关系数 $\\rho_{XY} = 0$，即它们不相关。

综上所述，$X$ 与 $Y$ 不相关且不独立。答案选 C。
    `,
    hints: [
      "独立性要求两变量无任何形式的依赖；相关性仅刻画两者是否存在线性关系。",
      "判断相关性应使用协方差公式：$Cov(X,Y) = E(XY) - E(X)E(Y)$。",
      "注意正态分布的对称性对奇数阶矩积分的简化作用。"
    ],
    relatedFormulas: [
      "Cov(X,Y) = E(XY) - E(X)E(Y)",
      "\\rho_{XY} = 0 \\iff Cov(X,Y) = 0"
    ],
    commonMistakes: [
      "误认为只要两个随机变量有确定的函数关系（如 $Y = X^2$），它们就必定是相关的。这混淆了相关（线性）与依赖（一般关系）。",
      "将不相关和独立混为一谈，错选 A。"
    ]
  },
  {
    id: "4.3-2",
    chapterId: 4,
    sectionId: "4.3",
    difficulty: "exam",
    type: "choice",
    tags: ["协方差", "相关系数", "联合分布律", "考研真题"],
    question: "设二维随机变量 $(X, Y)$ 的联合分布律为：$P(X=0, Y=0) = \\frac{1}{8}$，$P(X=0, Y=1) = \\frac{3}{8}$；$P(X=1, Y=0) = \\frac{3}{8}$，$P(X=1, Y=1) = \\frac{1}{8}$。求随机变量 $X$ 与 $Y$ 的相关系数 $\\rho_{XY}$：",
    options: [
      "-0.5",
      "0.5",
      "-0.25",
      "0.25"
    ],
    answer: "A",
    solution: `
我们通过四个步骤来严格计算相关系数 $\\rho_{XY}$。

**第一步：计算边缘分布律**
- $P(X=0) = P(X=0, Y=0) + P(X=0, Y=1) = \\frac{1}{8} + \\frac{3}{8} = \\frac{1}{2}$。
- $P(X=1) = P(X=1, Y=0) + P(X=1, Y=1) = \\frac{3}{8} + \\frac{1}{8} = \\frac{1}{2}$。
- 同理可得：
  $P(Y=0) = \\frac{1}{2}$，$P(Y=1) = \\frac{1}{2}$。

**第二步：求各变量的均值与方差**
- 期望：
  $$ E(X) = 0 \\cdot \\frac{1}{2} + 1 \\cdot \\frac{1}{2} = \\frac{1}{2} $$
  $$ E(Y) = 0 \\cdot \\frac{1}{2} + 1 \\cdot \\frac{1}{2} = \\frac{1}{2} $$
- 因为 $X$ 和 $Y$ 均为 0-1 变量，有 $X^2 = X, Y^2 = Y$，故二阶矩为 $E(X^2) = E(X) = \\frac{1}{2}$。
- 计算方差：
  $$ D(X) = E(X^2) - [E(X)]^2 = \\frac{1}{2} - \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4} $$
  $$ D(Y) = E(Y^2) - [E(Y)]^2 = \\frac{1}{2} - \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4} $$

**第三步：计算协方差**
- 求混合矩 $E(XY)$：
  $$ E(XY) = \\sum x_i y_j P(X=x_i, Y=y_j) = 1 \\cdot 1 \\cdot P(X=1, Y=1) = \\frac{1}{8} $$
- 代入协方差公式：
  $$ Cov(X,Y) = E(XY) - E(X)E(Y) = \\frac{1}{8} - \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{8} - \\frac{1}{4} = -\\frac{1}{8} $$

**第四步：计算相关系数**
$$ \\rho_{XY} = \\frac{Cov(X,Y)}{\\sqrt{D(X)D(Y)}} = \\frac{-\\frac{1}{8}}{\\sqrt{\\frac{1}{4} \\cdot \\frac{1}{4}}} = \\frac{-\\frac{1}{8}}{\\frac{1}{4}} = -0.5 $$

所以答案选 A。
    `,
    hints: [
      "求出 X 和 Y 的边缘分布，确认它们都是均等的 0-1 变量。",
      "由于只有在 $X=1, Y=1$ 时乘积 $XY$ 为 1，故混合矩 $E(XY) = P(X=1, Y=1)$ 极大简化了计算。"
    ],
    relatedFormulas: [
      "Cov(X,Y) = E(XY) - E(X)E(Y)",
      "\\rho_{XY} = \\frac{Cov(X,Y)}{\\sqrt{D(X)D(Y)}}"
    ],
    commonMistakes: [
      "在计算 $E(XY)$ 时，忘记了只计算非零项，或者横纵求和时将项漏掉。",
      "计算出协方差为 $-\\frac{1}{8}$ 后，忘记除以标准差之积，直接算成了 $-\\frac{1}{8}$。"
    ]
  },
  {
    id: "4.4-1",
    chapterId: 4,
    sectionId: "4.4",
    difficulty: "challenge",
    type: "choice",
    tags: ["协方差矩阵", "正态随机向量", "独立性", "矩阵代数"],
    question: "设二维正态随机向量 $\\mathbf{X} = (X_1, X_2)^T$ 服从正态分布 $N(\\boldsymbol{\mu}, \\mathbf{\\Sigma})$，其协方差矩阵为 $\\mathbf{\\Sigma} = \\begin{pmatrix} 4 & 1 \\\\ 1 & 4 \\end{pmatrix}$。定义新的随机变量 $Y_1 = X_1 + X_2$，$Y_2 = X_1 - X_2$。则随机向量 $\\mathbf{Y} = (Y_1, Y_2)^T$ 的协方差矩阵 $Cov(\\mathbf{Y})$ 及 $Y_1$ 与 $Y_2$ 的独立性为：",
    options: [
      "Cov(\\mathbf{Y}) = \\begin{pmatrix} 10 & 0 \\\\ 0 & 6 \\end{pmatrix}，且 Y_1 与 Y_2 相互独立",
      "Cov(\\mathbf{Y}) = \\begin{pmatrix} 10 & 0 \\\\ 0 & 6 \\end{pmatrix}，但 Y_1 与 Y_2 不独立",
      "Cov(\\mathbf{Y}) = \\begin{pmatrix} 8 & 2 \\\\ 2 & 8 \\end{pmatrix}，且 Y_1 与 Y_2 不独立",
      "Cov(\\mathbf{Y}) = \\begin{pmatrix} 8 & 0 \\\\ 0 & 8 \\end{pmatrix}，且 Y_1 与 Y_2 相互独立"
    ],
    answer: "A",
    solution: `
我们可以采用两种方法求 $Cov(\\mathbf{Y})$。

**方法一：代数分量法**
已知 $D(X_1) = 4, D(X_2) = 4, Cov(X_1, X_2) = 1$。
1. 计算 $Y_1$ 的方差：
   $$ D(Y_1) = D(X_1 + X_2) = D(X_1) + D(X_2) + 2Cov(X_1, X_2) = 4 + 4 + 2(1) = 10 $$
2. 计算 $Y_2$ 的方差：
   $$ D(Y_2) = D(X_1 - X_2) = D(X_1) + D(X_2) - 2Cov(X_1, X_2) = 4 + 4 - 2(1) = 6 $$
3. 计算两者的协方差：
   $$ Cov(Y_1, Y_2) = Cov(X_1 + X_2, X_1 - X_2) $$
   展开算式：
   $$ Cov(Y_1, Y_2) = Cov(X_1, X_1) - Cov(X_1, X_2) + Cov(X_2, X_1) - Cov(X_2, X_2) $$
   因为 $Cov(X_1, X_2) = Cov(X_2, X_1)$，且 $Cov(X_i, X_i) = D(X_i)$，所以：
   $$ Cov(Y_1, Y_2) = D(X_1) - D(X_2) = 4 - 4 = 0 $$

**方法二：矩阵变换法**
我们将线性组合关系写成矩阵形式：
$$ \\mathbf{Y} = \\begin{pmatrix} Y_1 \\\\ Y_2 \\end{pmatrix} = \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} \\begin{pmatrix} X_1 \\\\ X_2 \\end{pmatrix} = \\mathbf{A} \\mathbf{X} $$
其中 $\\mathbf{A} = \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$。
根据协方差矩阵的线性变换性质：
$$ Cov(\\mathbf{Y}) = \\mathbf{A} \\mathbf{\\Sigma} \\mathbf{A}^T $$
代入计算：
$$ \\mathbf{A} \\mathbf{\\Sigma} = \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} \\begin{pmatrix} 4 & 1 \\\\ 1 & 4 \\end{pmatrix} = \\begin{pmatrix} 5 & 5 \\\\ 3 & -3 \\end{pmatrix} $$
$$ Cov(\\mathbf{Y}) = \\begin{pmatrix} 5 & 5 \\\\ 3 & -3 \\end{pmatrix} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} = \\begin{pmatrix} 10 & 0 \\\\ 0 & 6 \\end{pmatrix} $$

**独立性判定**：
因为 $\\mathbf{X}$ 是正态随机向量，而 $\\mathbf{Y} = \\mathbf{A}\\mathbf{X}$ 是其线性变换，根据多维正态分布的性质，线性变换后的向量 $\\mathbf{Y}$ 仍然服从多维正态分布。
对多维正态分布而言，分量之间不相关（协方差为 0）等价于相互独立。
由于 $Cov(Y_1, Y_2) = 0$，故 $Y_1$ 与 $Y_2$ 相互独立。

综上所述，答案为 A。
    `,
    hints: [
      "写出变换矩阵 $\\mathbf{A}$，利用 $Cov(\\mathbf{AX}) = \\mathbf{A}\\mathbf{\\Sigma}\\mathbf{A}^T$ 进行求解。",
      "注意，对于非正态随机变量，协方差为 0 只能判定不相关；但因为题目给定了正态分布，所以可判定独立。"
    ],
    relatedFormulas: [
      "Cov(\\mathbf{A}\\mathbf{X} + \\mathbf{b}) = \\mathbf{A} \\mathbf{\\Sigma} \\mathbf{A}^T",
      "Cov(X+Y, X-Y) = D(X) - D(Y)"
    ],
    commonMistakes: [
      "算错 $D(Y_1)$ 或 $D(Y_2)$，忽略了原变量分量不独立的特性，即漏算了协方差交叉项 $2Cov(X_1, X_2)$。",
      "由于发现其协方差为 0，便套用一般情况的“不相关不能推出独立”，从而误选了 B。"
    ]
  }
];
