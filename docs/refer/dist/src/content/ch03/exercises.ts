import type { Exercise } from '../../types/exercise';

export const ch03Exercises: Exercise[] = [
  {
    id: "3.1-1",
    chapterId: 3,
    sectionId: "3.1",
    difficulty: "intermediate",
    type: "choice",
    tags: ["联合分布", "概率密度", "区域积分"],
    question: "设二维随机变量 $(X, Y)$ 的联合概率密度为\n$$ f(x, y) = \\begin{cases} C(x^2 + y^2), & 0 \\le x \\le 1, 0 \\le y \\le 1 \\\\ 0, & \\text{其他} \\end{cases} $$\n则常数 $C$ 和概率 $P(X \\ge Y)$ 分别是：",
    options: [
      "$C = \\frac{3}{2}, \\quad P(X \\ge Y) = \\frac{1}{2}$",
      "$C = \\frac{2}{3}, \\quad P(X \\ge Y) = \\frac{1}{2}$",
      "$C = \\frac{3}{2}, \\quad P(X \\ge Y) = \\frac{1}{3}$",
      "$C = \\frac{2}{3}, \\quad P(X \\ge Y) = \\frac{1}{4}$"
    ],
    answer: "A",
    solution: `
我们要依次求出常数 $C$ 和概率 $P(X \\ge Y)$。

**1. 求解常数 $C$**：
根据联合概率密度的规范性（全平面积分等于 1）：
$$ \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} f(x, y) \\, dx \\, dy = 1 $$
代入非零区域进行二重积分计算：
$$ \\int_0^1 \\int_0^1 C(x^2 + y^2) \\, dx \\, dy = 1 $$
$$ C \\int_0^1 \\left[ \\int_0^1 (x^2 + y^2) \\, dy \\right] dx = C \\int_0^1 \\left[ x^2 y + \\frac{y^3}{3} \\right]_{y=0}^{y=1} \\, dx = C \\int_0^1 \\left( x^2 + \\frac{1}{3} \\right) \\, dx $$
$$ C \\left[ \\frac{x^3}{3} + \\frac{x}{3} \\right]_0^1 = C \\left( \\frac{1}{3} + \\frac{1}{3} \\right) = C \\cdot \\frac{2}{3} = 1 $$
因此求得常数：
$$ C = \\frac{3}{2} $$

**2. 求解概率 $P(X \\ge Y)$**：
需要计算随机点落在区域 $D = \\{(x, y) \\mid 0 \\le x \\le 1, 0 \\le y \\le 1, x \\ge y\\}$ 内的概率。
由于联合概率密度 $f(x, y) = \\frac{3}{2}(x^2 + y^2)$ 具有对称性，即 $f(x, y) = f(y, x)$，且积分区域是正方形 $0 \\le x \\le 1, 0 \\le y \\le 1$ 被对角线 $y = x$ 平分得到的下半三角形。
因为概率密度在对角线两侧是对称的，所以落在 $X \\ge Y$ 区域的概率必然等于落在 $X < Y$ 区域的概率。
因此：
$$ P(X \\ge Y) = \\frac{1}{2} P(0 \\le X \\le 1, 0 \\le Y \\le 1) = \\frac{1}{2} \\times 1 = \\frac{1}{2} $$

综上所述，$C = \\frac{3}{2}, P(X \\ge Y) = \\frac{1}{2}$。正确选项为 A。
    `,
    hints: [
      "首先使用概率密度的规范性 $\\iint f(x, y) dx dy = 1$ 计算常数 $C$。",
      "注意观察联合概率密度关于 $x$ 和 $y$ 的对称性，并结合积分区域 $X \\ge Y$ 考虑是否可以免去复杂的二重积分计算。"
    ],
    relatedFormulas: [
      "\\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} f(x, y) \\, dx \\, dy = 1",
      "P((X,Y) \\in G) = \\iint_{G} f(x, y) \\, dx \\, dy"
    ],
    commonMistakes: [
      "二重积分在积分时将 $x^2$ 对 $y$ 积分漏写自变量 $y$（错积成 $x^2$ 而不是 $x^2 y$）。",
      "未能发现概率密度和区域的对称性，浪费大量时间硬算积分 $\\int_0^1 dx \\int_0^x \\frac{3}{2}(x^2+y^2) dy$，增加了算错的风险。"
    ]
  },
  {
    id: "3.2-1",
    chapterId: 3,
    sectionId: "3.2",
    difficulty: "exam",
    type: "choice",
    tags: ["边缘概率密度", "均匀分布", "考研真题"],
    question: "设二维随机变量 $(X, Y)$ 在区域 $D = \\{(x, y) \\mid 0 < y < x < 1\\}$ 上服从均匀分布。则 $X$ 与 $Y$ 的边缘概率密度在各自可能取值区间内分别为：",
    options: [
      "$f_X(x) = 2x \\quad (0<x<1), \\quad f_Y(y) = 2(1-y) \\quad (0<y<1)$",
      "$f_X(x) = x \\quad (0<x<1), \\quad f_Y(y) = 1-y \\quad (0<y<1)$",
      "$f_X(x) = 2(1-x) \\quad (0<x<1), \\quad f_Y(y) = 2y \\quad (0<y<1)$",
      "$f_X(x) = 1 \\quad (0<x<1), \\quad f_Y(y) = 1 \\quad (0<y<1)$"
    ],
    answer: "A",
    solution: `
这是一道经典的考研真题，主要考查二维均匀分布的联合概率密度以及如何计算边缘概率密度。

**1. 求联合概率密度 $f(x, y)$**：
区域 $D$ 是由 $y=0, x=1, y=x$ 围成的三角形区域。其底边长为 1，高为 1。
所以区域 $D$ 的面积为：
$$ A = \\frac{1}{2} \\times 1 \\times 1 = \\frac{1}{2} $$
因为 $(X, Y)$ 在 $D$ 上服从均匀分布，故其联合概率密度为：
$$ f(x, y) = \\begin{cases} \\frac{1}{A} = 2, & (x, y) \\in D \\\\ 0, & \\text{其他} \\end{cases} $$

**2. 求 $X$ 的边缘概率密度 $f_X(x)$**：
对于固定的 $x \\in (0, 1)$，要对整个实数轴上的 $y$ 进行积分。根据 $D$ 的定义 $0 < y < x < 1$，对固定的 $x$，$y$ 的取值范围是 $(0, x)$。
$$ f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy = \\int_0^x 2 \\, dy = 2x, \\quad (0 < x < 1) $$
当 $x \\le 0$ 或 $x \\ge 1$ 时，$f_X(x) = 0$。

**3. 求 $Y$ 的边缘概率密度 $f_Y(y)$**：
对于固定的 $y \\in (0, 1)$，要对整个实数轴上的 $x$ 进行积分。根据 $D$ 的定义 $0 < y < x < 1$，对固定的 $y$，$x$ 的取值范围是 $(y, 1)$。
$$ f_Y(y) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dx = \\int_y^1 2 \\, dx = 2(1-y), \\quad (0 < y < 1) $$
当 $y \\le 0$ 或 $y \\ge 1$ 时，$f_Y(y) = 0$。

因此，正确选项为 A。
    `,
    hints: [
      "区域 $D$ 的面积是三角形面积，联合概率密度为面积的倒数。",
      "求 $f_X(x)$ 时积分变量是 $y$，必须根据 $0 < y < x < 1$ 确定对于固定的 $x$，$y$ 的上下限；同理，求 $f_Y(y)$ 时积分变量是 $x$，需确定对于固定的 $y$，$x$ 的上下限。"
    ],
    relatedFormulas: [
      "f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy",
      "f_Y(y) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dx"
    ],
    commonMistakes: [
      "计算边缘分布时直接带入常数限 $0$ 到 $1$ 进行积分，没有考虑 $y < x$ 这个约束条件，导致错选 D。",
      "在写积分限时将 $f_X(x)$ 的结果中写出了 $y$。要记住，$X$ 的边缘概率密度只能含有自变量 $x$（或常数），绝不可能包含 $y$。"
    ]
  },
  {
    id: "3.3-1",
    chapterId: 3,
    sectionId: "3.3",
    difficulty: "exam",
    type: "choice",
    tags: ["条件概率密度", "条件分布", "考研真题"],
    question: "设随机变量 $(X, Y)$ 的联合概率密度为\n$$ f(x, y) = \\begin{cases} \\frac{1}{2} x y, & 0 \\le y \\le x \\le 2 \\\\ 0, & \\text{其他} \\end{cases} $$\n则在条件 $X = x \\ (0 < x < 2)$ 下，$Y$ 的条件概率密度 $f_{Y\\mid X}(y \\mid x)$ 为：",
    options: [
      "$f_{Y\\mid X}(y \\mid x) = \\frac{2y}{x^2} \\quad (0 \\le y \\le x)$",
      "$f_{Y\\mid X}(y \\mid x) = \\frac{y}{x} \\quad (0 \\le y \\le x)$",
      "$f_{Y\\mid X}(y \\mid x) = \\frac{x}{2} \\quad (0 \\le y \\le x)$",
      "$f_{Y\\mid X}(y \\mid x) = \\frac{2x}{y^2} \\quad (x \\le y \\le 2)$"
    ],
    answer: "A",
    solution: `
我们要根据条件概率密度的定义式 $f_{Y\\mid X}(y \\mid x) = \\frac{f(x, y)}{f_X(x)}$ 进行求解。

**1. 首先求解分母 $f_X(x)$**：
对于给定的 $x \\in (0, 2)$，联合密度的非零区域限制了 $y$ 的取值为 $0 \\le y \\le x$。
因此：
$$ f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy = \\int_0^x \\frac{1}{2} x y \\, dy $$
将不含 $y$ 的项移出积分号：
$$ f_X(x) = \\frac{1}{2} x \\left[ \\frac{y^2}{2} \\right]_0^x = \\frac{1}{2} x \\cdot \\frac{x^2}{2} = \\frac{1}{4} x^3, \\quad (0 < x < 2) $$

**2. 求解条件概率密度 $f_{Y\\mid X}(y \\mid x)$**：
当 $0 < x < 2$ 时：
$$ f_{Y\\mid X}(y \\mid x) = \\frac{f(x, y)}{f_X(x)} = \\frac{\\frac{1}{2} x y}{\\frac{1}{4} x^3} = \\frac{2y}{x^2} $$
注意，它的非零取值范围继承自联合概率密度的范围限制，即对给定的 $x$，要求 $0 \\le y \\le x$。

综上所述，$f_{Y\\mid X}(y \\mid x) = \\frac{2y}{x^2} \\quad (0 \\le y \\le x)$。正确选项为 A。
    `,
    hints: [
      "条件概率密度公式为 $f_{Y\\mid X}(y \\mid x) = f(x, y) / f_X(x)$。",
      "计算 $f_X(x)$ 时，需要注意积分变量为 $y$，积分上下限由约束 $0 \\le y \\le x \\le 2$ 决定为 $[0, x]$。"
    ],
    relatedFormulas: [
      "f_{Y\\mid X}(y \\mid x) = \\frac{f(x, y)}{f_X(x)}",
      "f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy"
    ],
    commonMistakes: [
      "在计算 $f_X(x)$ 时将积分区间写成了常数区间 $[0, 2]$，错积成 $\\frac{1}{2} x \\int_0^2 y dy = x$。",
      "忽略了条件概率密度中 $y$ 的取值范围依然是 $0 \\le y \\le x$（对给定的条件 $X=x$，变量 $Y$ 的取值不能超过这个 $x$）。"
    ]
  },
  {
    id: "3.4-1",
    chapterId: 3,
    sectionId: "3.4",
    difficulty: "intermediate",
    type: "choice",
    tags: ["独立性", "二维正态分布", "不相关"],
    question: "设随机变量 $X$ 和 $Y$ 独立，均服从标准正态分布 $N(0, 1)$。定义新随机变量 $U = X + Y$ 和 $V = X - Y$。关于 $U$ 与 $V$ 的独立性及相关系数 $\\rho_{UV}$，下列结论正确的是：",
    options: [
      "$U$ 与 $V$ 相互独立，且 $\\rho_{UV} = 0$",
      "$U$ 与 $V$ 不独立，且 $\\rho_{UV} = 0$",
      "$U$ 与 $V$ 相互独立，且 $\\rho_{UV} \\neq 0$",
      "$U$ 与 $V$ 不独立，且 $\\rho_{UV} \\neq 0$"
    ],
    answer: "A",
    solution: `
我们通过计算协方差以及利用正态分布的性质来分析 $U$ 与 $V$ 的关系。

**1. 计算协方差 $Cov(U, V)$**：
由于 $X, Y$ 独立且服从 $N(0, 1)$，所以我们有：
$$ E(X) = E(Y) = 0, \\quad D(X) = D(Y) = 1, \\quad Cov(X, Y) = 0 $$
计算 $U = X + Y$ 与 $V = X - Y$ 的协方差：
$$ Cov(U, V) = Cov(X + Y, X - Y) $$
根据协方差的性质（双线性性质）展开：
$$ Cov(U, V) = Cov(X, X) - Cov(X, Y) + Cov(Y, X) - Cov(Y, Y) $$
由于 $Cov(X, X) = D(X)$，$Cov(Y, Y) = D(Y)$，且 $Cov(X, Y) = Cov(Y, X) = 0$，代入得：
$$ Cov(U, V) = D(X) - D(Y) = 1 - 1 = 0 $$
因为协方差为 0，所以其相关系数：
$$ \\rho_{UV} = \\frac{Cov(U, V)}{\\sqrt{D(U)D(V)}} = 0 $$
即 $U$ 与 $V$ 不相关。

**2. 判断独立性**：
由于 $X, Y$ 独立且服从正态分布，它们联合服从二维正态分布。
而 $U$ 和 $V$ 是由 $X$ 和 $Y$ 经过线性变换得到的：
$$ \\begin{pmatrix} U \\\\ V \\end{pmatrix} = \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} \\begin{pmatrix} X \\\\ Y \\end{pmatrix} $$
根据多元正态分布的性质，正态变量的线性变换仍然服从联合正态分布。即 $(U, V)$ 联合服从二维正态分布。
对于联合服从二维正态分布的随机变量，相互独立与不相关（协方差为 0）是**等价**的。
因为已经算出 $Cov(U, V) = 0$，所以 $U$ 与 $V$ 相互独立。

综上所述，$U$ 与 $V$ 相互独立，且 $\\rho_{UV} = 0$。正确选项为 A。
    `,
    hints: [
      "先利用协方差的性质展开 $Cov(X+Y, X-Y)$，带入已知标准差求值。",
      "思考 $U$ 和 $V$ 的联合分布类型。对于联合正态分布，不相关是否等价于相互独立？"
    ],
    relatedFormulas: [
      "Cov(aX+bY, cU+dV) = acCov(X,U) + adCov(X,V) + bcCov(Y,U) + bdCov(Y,V)",
      "Cov(X, X) = D(X)",
      "\\rho_{XY} = 0 \\iff X, Y \\text{ 独立 (在联合正态的前提下)}"
    ],
    commonMistakes: [
      "直觉上认为 $U$ 和 $V$ 中都含有 $X$ 和 $Y$，它们一定会互相影响，因此断定它们不独立，错选了 B。",
      "混淆了不相关与独立的区别，认为只有在任何时候不相关都等价于独立。要切记，这个等价性只有在联合正态的强假设下才成立。"
    ]
  },
  {
    id: "3.5-1",
    chapterId: 3,
    sectionId: "3.5",
    difficulty: "challenge",
    type: "choice",
    tags: ["函数的分布", "指数分布", "最小值分布"],
    question: "设随机变量 $X$ 和 $Y$ 相互独立，且都服从参数为 $\\lambda = 1$ 的指数分布（其分布函数为 $F(x) = 1 - e^{-x}, x \\ge 0$）。定义新随机变量 $Z = \\min(X, Y)$。则 $Z$ 服从的分布及概率密度 $f_Z(z) \\ (z \\ge 0)$ 为：",
    options: [
      "参数为 $\\lambda = 2$ 的指数分布，$f_Z(z) = 2e^{-2z} \\quad (z \\ge 0)$",
      "参数为 $\\lambda = 1$ 的指数分布，$f_Z(z) = e^{-z} \\quad (z \\ge 0)$",
      "参数为 $\\lambda = \\frac{1}{2}$ 的指数分布，$f_Z(z) = \\frac{1}{2}e^{-\\frac{1}{2}z} \\quad (z \\ge 0)$",
      "非指数分布，$f_Z(z) = 2e^{-z}(1-e^{-z}) \\quad (z \\ge 0)$"
    ],
    answer: "A",
    solution: `
本题考查两个独立的连续型随机变量最小值的分布。

**1. 求 $Z = \\min(X, Y)$ 的分布函数 $F_Z(z)$**：
对于任意实数 $z$：
$$ F_Z(z) = P(\\min(X, Y) \\le z) $$
考虑其对立事件：
$$ F_Z(z) = 1 - P(\\min(X, Y) > z) $$
随机变量中的最小值大于 $z$，等价于每一个随机变量都大于 $z$：
$$ F_Z(z) = 1 - P(X > z, Y > z) $$
因为 $X$ 与 $Y$ 相互独立，所以联合概率可以拆为边缘概率的乘积：
$$ F_Z(z) = 1 - P(X > z) P(Y > z) = 1 - [1 - F_X(z)][1 - F_Y(z)] $$

**2. 带入指数分布的分布函数**：
当 $z \\ge 0$ 时，已知 $F_X(z) = F_Y(z) = 1 - e^{-z}$：
$$ 1 - F_X(z) = e^{-z}, \\quad 1 - F_Y(z) = e^{-z} $$
代入上式得：
$$ F_Z(z) = 1 - e^{-z} \\cdot e^{-z} = 1 - e^{-2z}, \\quad (z \\ge 0) $$
当 $z < 0$ 时，$F_Z(z) = 0$。

**3. 求概率密度 $f_Z(z)$**：
对分布函数 $F_Z(z)$ 求导：
$$ f_Z(z) = \\frac{d}{dz} F_Z(z) = \\begin{cases} 2e^{-2z}, & z \\ge 0 \\\\ 0, & z < 0 \\end{cases} $$
这正是参数为 $\\lambda = 2$ 的指数分布的概率密度。

因此，正确选项为 A。
    `,
    hints: [
      "利用最小值事件的等价性：$\\min(X, Y) > z \\iff X > z \\text{ 且 } Y > z$。",
      "由于 $X$ 和 $Y$ 独立，将联合概率 $P(X > z, Y > z)$ 转化为乘积形式，并带入各自的生存函数 $1 - F(z)$ 进行计算。"
    ],
    relatedFormulas: [
      "F_{\\min}(z) = 1 - [1 - F_X(z)][1 - F_Y(z)] \\quad (\\text{独立时})",
      "f(x) = \\lambda e^{-\\lambda x} \\quad (x \\ge 0, \\text{指数分布密度})"
    ],
    commonMistakes: [
      "误将最小值分布函数记成最大值分布函数的乘积形式，错用 $F_Z(z) = [F_X(z)]^2 = (1-e^{-z})^2$，求导后误选 D。",
      "直觉上认为两个指数分布取极值后参数会减半或取均值，从而误选 C。"
    ]
  }
];
