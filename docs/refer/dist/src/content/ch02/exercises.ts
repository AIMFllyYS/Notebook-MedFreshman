import type { Exercise } from '../../types/exercise';

export const ch02Exercises: Exercise[] = [
  {
    id: "2.2-1",
    chapterId: 2,
    sectionId: "2.2",
    difficulty: "basic",
    type: "choice",
    tags: ["二项分布", "泊松近似", "考研真题"],
    question: "设某独立射击试验中，击中目标的概率为 $p = 0.02$。现重复独立进行该试验 $100$ 次，用泊松分布近似计算至少击中 $2$ 次目标的概率（提示：$e^{-2} \\approx 0.135$）：",
    options: ["0.595", "0.865", "0.406", "0.270"],
    answer: "A",
    solution: `
设随机变量 $X$ 为击中目标的次数。试验总次数 $n = 100$，每次击中的概率 $p = 0.02$。因此 $X$ 服从二项分布：
$$ X \\sim B(100, 0.02) $$

由于试验次数 $n$ 较大且概率 $p$ 较小，可以使用泊松分布进行近似计算。泊松分布的参数为：
$$ \\lambda = n p = 100 \\times 0.02 = 2 $$

我们要计算“至少击中 2 次”的概率，即 $P(X \\ge 2)$。考虑其对立事件：
$$ P(X \\ge 2) = 1 - P(X = 0) - P(X = 1) $$

代入泊松分布的概率计算公式：
$$ P(X = 0) \\approx \\frac{\\lambda^0 e^{-\\lambda}}{0!} = e^{-2} \\approx 0.135 $$
$$ P(X = 1) \\approx \\frac{\\lambda^1 e^{-\\lambda}}{1!} = 2 e^{-2} \\approx 2 \\times 0.135 = 0.270 $$

进而得到：
$$ P(X \\ge 2) \\approx 1 - 0.135 - 0.270 = 0.595 $$

因此，正确选项为 A。
    `,
    hints: [
      "当 $n$ 很大且 $p$ 很小时，二项分布可使用参数为 $\\lambda = np$ 的泊松分布进行近似。",
      "计算“至少...”概率时，转化为计算余事件的概率往往更加简便。"
    ],
    relatedFormulas: ["P(X = k) \\approx \\frac{\\lambda^k e^{-\\lambda}}{k!}", "\\lambda = np"],
    commonMistakes: [
      "容易算错成刚好击中 2 次的概率 $P(X = 2)$。",
      "在计算余事件概率时漏算掉了 $P(X = 0)$，只减去了 $P(X = 1)$。"
    ]
  },
  {
    id: "2.3-1",
    chapterId: 2,
    sectionId: "2.3",
    difficulty: "exam",
    type: "choice",
    tags: ["分布函数", "概念性质", "考研真题"],
    question: "设 $F_1(x)$ 与 $F_2(x)$ 分别是随机变量 $X_1$ 与 $X_2$ 的分布函数。为使 $F(x) = a F_1(x) - b F_2(x)$ 也是某个随机变量的分布函数，下列选项中的常数 $a, b$ 合适的是：",
    options: [
      "$a = \\frac{3}{2}, b = \\frac{1}{2}$",
      "$a = \\frac{2}{3}, b = -\\frac{1}{3}$",
      "$a = \\frac{1}{2}, b = \\frac{1}{2}$",
      "$a = -\\frac{1}{2}, b = -\\frac{3}{2}$"
    ],
    answer: "B",
    solution: `
要使 $F(x) = a F_1(x) - b F_2(x)$ 成为分布函数，它必须满足分布函数的充要条件：单调非减性、有界性、右连续性。

首先考查有界性条件：
$$ \\lim_{x \\to -\\infty} F(x) = a \\cdot 0 - b \\cdot 0 = 0 $$
$$ \\lim_{x \\to \\infty} F(x) = a \\cdot 1 - b \\cdot 1 = a - b $$
因此必须有 $a - b = 1$。
我们逐一检查各个选项：
- A：$a - b = \\frac{3}{2} - \\frac{1}{2} = 1$
- B：$a - b = \\frac{2}{3} - (-\\frac{1}{3}) = 1$
- C：$a - b = \\frac{1}{2} - \\frac{1}{2} = 0 \\neq 1$（排除）
- D：$a - b = -\\frac{1}{2} - (-\\frac{3}{2}) = 1$

接着考查单调非减性：
设 $a \\ge 0$ 且 $-b \\ge 0$（即 $b \\le 0$），则有：
$$ F(x) = a F_1(x) + (-b) F_2(x) $$
因为 $F_1(x), F_2(x)$ 是单调非减函数，且两系数 $a, -b$ 均非负，所以它们的线性组合 $F(x)$ 必为单调非减函数。

若 $b > 0$，则有可能破坏单调性或有界性上限。例如设 $F_1(x) = \\begin{cases} 0, & x < 0 \\\\ 1, & x \\ge 0 \\end{cases}$，而 $F_2(x) = \\begin{cases} 0, & x < 1 \\\\ 1, & x \\ge 1 \\end{cases}$。
对于 A 选项 $a = \\frac{3}{2}, b = \\frac{1}{2}$，当 $x \\in [0, 1)$ 时：
$$ F(x) = \\frac{3}{2} F_1(x) - \\frac{1}{2} F_2(x) = \\frac{3}{2} \\cdot 1 - \\frac{1}{2} \\cdot 0 = \\frac{3}{2} > 1 $$
这违反了分布函数的值域必须在 $[0, 1]$ 内的有界性要求。

对于 D 选项 $a = -\\frac{1}{2}$，其为负数，无法保证 $F(x)$ 单调非减。

而在 B 选项中，$a = \\frac{2}{3} \\ge 0, b = -\\frac{1}{3} \\le 0$，此时 $F(x) = \\frac{2}{3} F_1(x) + \\frac{1}{3} F_2(x)$ 为凸组合，显然在有界性、单调性和右连续性上均完全符合要求。

综上所述，正确选项为 B。
`,
    hints: [
      "利用极限值性质 $\\lim_{x \\to \\infty} F(x) = 1$ 建立关于 $a$ 和 $b$ 的基础等式关系。",
      "注意当线性组合中包含负系数（即 $b > 0$）时，可能会产生反例导致局部数值超过 1 或无法保证单调性。"
    ],
    relatedFormulas: ["\\lim_{x \\to \\infty} F(x) = 1", "\\lim_{x \\to -\\infty} F(x) = 0", "0 \\le F(x) \\le 1"],
    commonMistakes: [
      "误以为只要系数和满足 $a - b = 1$ 即可，漏掉了当 $b > 0$ 时会引起非单调或越界的可能性分析。"
    ]
  },
  {
    id: "2.4-1",
    chapterId: 2,
    sectionId: "2.4",
    difficulty: "basic",
    type: "choice",
    tags: ["正态分布", "标准化", "概率计算"],
    question: "设随机变量 $X \\sim N(3, 2^2)$，已知标准正态分布函数值 $\\Phi(1) = 0.8413$, $\\Phi(2) = 0.9772$，则概率 $P(1 < X \\le 7)$ 的值为：",
    options: ["0.8185", "0.1359", "0.6826", "0.9544"],
    answer: "A",
    solution: `
已知随机变量 $X$ 服从参数为 $\\mu = 3, \\sigma = 2$ 的正态分布。
根据正态分布标准化性质，新随机变量：
$$ Z = \\frac{X - \\mu}{\\sigma} = \\frac{X - 3}{2} \\sim N(0, 1) $$

我们要求解的概率为：
$$ P(1 < X \\le 7) = P\\left( \\frac{1 - 3}{2} < \\frac{X - 3}{2} \\le \\frac{7 - 3}{2} \\right) $$
$$ = P(-1 < Z \\le 2) $$
$$ = \\Phi(2) - \\Phi(-1) $$

由于标准正态分布的概率密度曲线关于 $y$ 轴对称，其分布函数具有对称性：
$$ \\Phi(-1) = 1 - \\Phi(1) $$

代入已知的 $\\Phi(1)$ 和 $\\Phi(2)$ 数值：
$$ P(1 < X \\le 7) = \\Phi(2) - [1 - \\Phi(1)] $$
$$ = 0.9772 - (1 - 0.8413) $$
$$ = 0.9772 - 0.1587 = 0.8185 $$

因此，正确答案为 A。
`,
    hints: [
      "利用正态分布标准化公式 $Z = \\frac{X - \\mu}{\\sigma}$，把 $X$ 的区间概率转化为标准正态变量 $Z$ 的区间概率。",
      "利用标准正态分布函数的对称关系：$\\Phi(-z) = 1 - \\Phi(z)$ 进行代入求解。"
    ],
    relatedFormulas: ["Z = \\frac{X - \\mu}{\\sigma}", "P(a < X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)", "\\Phi(-z) = 1 - \\Phi(z)"],
    commonMistakes: [
      "错把正态分布参数中的 $\\sigma^2 = 2^2$ 误认成标准差为 4 进行了除法运算。",
      "把负数处的标准正态分布值记错为 $\\Phi(-1) = -\\Phi(1)$ 或其它错误表达式。"
    ]
  },
  {
    id: "2.4-2",
    chapterId: 2,
    sectionId: "2.4",
    difficulty: "intermediate",
    type: "choice",
    tags: ["指数分布", "概率密度", "参数确定"],
    question: "设随机变量 $X$ 服从参数为 $\\lambda$ 的指数分布，其概率密度为 $f(x) = \\lambda e^{-\\lambda x} \\, (x > 0)$。若已知 $P(X > 2) = e^{-4}$，则概率 $P(X \\le 1)$ 的值为：",
    options: ["$1 - e^{-1}$", "$1 - e^{-2}$", "$e^{-2}$", "$e^{-1}$"],
    answer: "B",
    solution: `
设随机变量 $X$ 服从指数分布 $X \\sim Exp(\\lambda)$。
其分布函数为：
$$ F(x) = \\begin{cases} 1 - e^{-\\lambda x}, & x \\ge 0 \\\\ 0, & x < 0 \\end{cases} $$

根据题中给出的概率：
$$ P(X > 2) = 1 - P(X \\le 2) = 1 - F(2) = 1 - (1 - e^{-2\\lambda}) = e^{-2\\lambda} $$

已知 $P(X > 2) = e^{-4}$，建立指数方程：
$$ e^{-2\\lambda} = e^{-4} \\implies -2\\lambda = -4 \\implies \\lambda = 2 $$

得到分布的参数 $\\lambda = 2$。接着计算 $P(X \\le 1)$：
$$ P(X \\le 1) = F(1) = 1 - e^{-\\lambda \\cdot 1} = 1 - e^{-2} $$

因此，正确答案为 B。
`,
    hints: [
      "首先根据指数分布右尾概率公式 $P(X > x) = e^{-\\lambda x}$ 建立等式求出未知参数 $\\lambda$。",
      "参数确定后直接使用指数分布函数公式求取 $P(X \\le 1)$。"
    ],
    relatedFormulas: ["F(x) = 1 - e^{-\\lambda x}", "P(X > x) = e^{-\\lambda x}"],
    commonMistakes: [
      "在建立方程时把 $P(X > 2)$ 错写成 $\\int_2^{\\infty} e^{-\\lambda x} dx = \\frac{1}{\\lambda} e^{-2\\lambda}$ 导致系数计算错误。",
      "最终计算的是 $P(X \\le 1)$，容易错算成对立的右尾概率 $e^{-2}$。"
    ]
  },
  {
    id: "2.5-1",
    chapterId: 2,
    sectionId: "2.5",
    difficulty: "exam",
    type: "choice",
    tags: ["随机变量函数的分布", "均匀分布", "分布函数法", "考研真题"],
    question: "设随机变量 $X \\sim U(0, \\pi)$（在 $(0, \\pi)$ 上服从均匀分布），记随机变量 $Y = \\sin X$，则 $Y$ 在区间 $(0, 1)$ 内的概率密度 $f_Y(y)$ 为：",
    options: [
      "\\frac{1}{\\pi \\sqrt{1-y^2}}",
      "\\frac{2}{\\pi \\sqrt{1-y^2}}",
      "\\frac{1}{\\sqrt{1-y^2}}",
      "\\frac{2}{\\pi}"
    ],
    answer: "B",
    solution: `
由于 $X \\sim U(0, \\pi)$，其概率密度为：
$$ f_X(x) = \\begin{cases} \\frac{1}{\\pi}, & 0 < x < \\pi \\\\ 0, & \\text{其他} \\end{cases} $$

我们要推导 $Y = \\sin X$ 的概率密度。因为当 $X \\in (0, \\pi)$ 时，$Y = \\sin X \\in (0, 1]$。因此当 $y \\le 0$ 或 $y > 1$ 时，$f_Y(y) = 0$。

对于 $y \\in (0, 1)$，利用分布函数法：
$$ F_Y(y) = P(Y \\le y) = P(\\sin X \\le y) $$

在区间 $(0, \\pi)$ 内，满足正弦值 $\\sin X \\le y$ 的 $X$ 范围是两段区间的并集：
$$ 0 < X \\le \\arcsin y \\quad \\text{与} \\quad \\pi - \\arcsin y \\le X < \\pi $$

所以有：
$$ F_Y(y) = P(0 < X \\le \\arcsin y) + P(\\pi - \\arcsin y \\le X < \\pi) $$
由于 $X$ 的概率密度在 $(0, \\pi)$ 内是常数 $\\frac{1}{\\pi}$：
$$ F_Y(y) = \\int_0^{\\arcsin y} \\frac{1}{\\pi} dx + \\int_{\\pi - \\arcsin y}^{\\pi} \\frac{1}{\\pi} dx $$
$$ = \\frac{1}{\\pi} \\arcsin y + \\frac{1}{\\pi} [\\pi - (\\pi - \\arcsin y)] = \\frac{2}{\\pi} \\arcsin y $$

对分布函数 $F_Y(y)$ 关于 $y$ 求导数，即得到 $Y$ 在区间 $(0, 1)$ 内的概率密度函数：
$$ f_Y(y) = F_Y'(y) = \\frac{2}{\\pi} \\cdot \\frac{d}{dy}(\\arcsin y) = \\frac{2}{\\pi \\sqrt{1-y^2}} $$

所以，正确选项为 B。
`,
    hints: [
      "注意到函数 $g(x) = \\sin x$ 在区间 $(0, \\pi)$ 内不是严格单调的（先增后减），因此绝对不能直接使用公式法变换密度。",
      "必须使用最基础的分布函数法，利用正弦曲线几何特征，将事件 $\\{\\sin X \\le y\\}$ 拆分成两个互斥的 $X$ 子区间之和进行求和积分。"
    ],
    relatedFormulas: ["F_Y(y) = P(g(X) \\le y)", "(\\arcsin y)' = \\frac{1}{\\sqrt{1-y^2}}"],
    commonMistakes: [
      "强行套用公式法得到 $f_Y(y) = f_X(\\arcsin y) |(\\arcsin y)'| = \\frac{1}{\\pi \\sqrt{1-y^2}}$，因为忽略了正弦函数非单调性，漏掉了对称分支，从而少乘以 2。"
    ]
  },
  {
    id: "2.5-2",
    chapterId: 2,
    sectionId: "2.5",
    difficulty: "intermediate",
    type: "choice",
    tags: ["随机变量函数的分布", "对数正态分布", "公式法"],
    question: "设随机变量 $X > 0$，已知其对数 $Y = \\ln X \\sim N(\\mu, \\sigma^2)$。则随机变量 $X$ 的概率密度 $f_X(x)$ 为：",
    options: [
      "\\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(\\ln x - \\mu)^2}{2\\sigma^2}} \\quad (x > 0)",
      "\\frac{1}{\\sqrt{2\\pi}\\sigma x} e^{-\\frac{(\\ln x - \\mu)^2}{2\\sigma^2}} \\quad (x > 0)",
      "\\frac{1}{\\sqrt{2\\pi}\\sigma x^2} e^{-\\frac{(\\ln x - \\mu)^2}{2\\sigma^2}} \\quad (x > 0)",
      "\\frac{x}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(\\ln x - \\mu)^2}{2\\sigma^2}} \\quad (x > 0)"
    ],
    answer: "B",
    solution: `
我们要根据已知随机变量 $Y = \\ln X \\sim N(\\mu, \\sigma^2)$ 的分布求随机变量 $X$ 的概率密度 $f_X(x)$。
因为 $X = e^Y > 0$，因此当 $x \\le 0$ 时，$f_X(x) = 0$。

当 $x > 0$ 时，我们使用分布函数法来求。
$X$ 的分布函数为：
$$ F_X(x) = P(X \\le x) = P(e^Y \\le x) $$
由于对数函数 $y = \\ln x$ 在 $(0, \\infty)$ 内是单调递增的，所以不等式可以等价变形为：
$$ F_X(x) = P(Y \\le \\ln x) = F_Y(\\ln x) $$

两边关于 $x$ 求导数，得到 $X$ 的概率密度：
$$ f_X(x) = F_X'(x) = f_Y(\\ln x) \\cdot \\frac{d}{dx}(\\ln x) = f_Y(\\ln x) \\cdot \\frac{1}{x} $$

已知 $Y \\sim N(\\mu, \\sigma^2)$，其概率密度为：
$$ f_Y(y) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(y-\\mu)^2}{2\\sigma^2}} $$

将 $y = \\ln x$ 代入，即可求得 $x > 0$ 时的概率密度：
$$ f_X(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma x} e^{-\\frac{(\\ln x - \\mu)^2}{2\\sigma^2}} $$

所以，正确选项为 B。
`,
    hints: [
      "首先明确由于 $X > 0$，所以 $x \\le 0$ 时概率密度必为 0。",
      "由于 $g(y) = e^y$ 是严格单调的，所以既可以用反函数公式法，也可以用分布函数求导法。复合函数求导记得代入链式法则。"
    ],
    relatedFormulas: ["f_X(x) = f_Y(h(x)) |h'(x)|", "F_X(x) = F_Y(\\ln x)"],
    commonMistakes: [
      "求导时忘记对内层函数 $\\ln x$ 进行求导，漏掉了 $\\frac{1}{x}$ 这一关键因子，错选了 A。"
    ]
  },
  {
    id: "2.5-3",
    chapterId: 2,
    sectionId: "2.5",
    difficulty: "challenge",
    type: "choice",
    tags: ["概率积分变换", "分布函数", "均匀分布", "概念定理"],
    question: "设 $X$ 是一个连续型随机变量，其分布函数 $F(x)$ 在 $\\mathbb{R}$ 上严格单调增加。令新随机变量 $Y = F(X)$，则 $Y$ 服从的分布是：",
    options: [
      "标准正态分布 $N(0, 1)$",
      "在区间 $(0, 1)$ 上的均匀分布 $U(0, 1)$",
      "参数为 $1$ 的指数分布 $Exp(1)$",
      "单点退化分布"
    ],
    answer: "B",
    solution: `
此题是极其经典的**概率积分变换 (Probability Integral Transform)** 定理的直接证明。

对于新随机变量 $Y = F(X)$，因为 $F(x)$ 是连续随机变量 $X$ 的分布函数，所以对于任意 $X$ 的实数值，其对应的分布函数取值必定有：
$$ 0 \\le F(X) \\le 1 $$
也就是说，随机变量 $Y$ 的取值范围被限制在闭区间 $[0, 1]$ 上。

下面求解 $Y$ 的分布函数 $F_Y(y) = P(Y \\le y)$：
- 当 $y < 0$ 时，由于 $F(X) \\ge 0$ 恒成立，因此事件 $\\{F(X) \\le y\\}$ 为不可能事件，概率 $F_Y(y) = 0$。
- 当 $y \\ge 1$ 时，由于 $F(X) \\le 1$ 恒成立，因此事件 $\\{F(X) \\le y\\}$ 为必然事件，概率 $F_Y(y) = 1$。
- 当 $0 \\le y < 1$ 时，计算概率：
  $$ F_Y(y) = P(F(X) \\le y) $$
  因为分布函数 $F(x)$ 是在 $\\mathbb{R}$ 上严格单调递增的连续函数，所以其反函数 $F^{-1}$ 存在且亦严格单调递增。我们可以将不等式两端同时作用反函数 $F^{-1}$ 而不改变不等号方向：
  $$ P(F(X) \\le y) = P(X \\le F^{-1}(y)) $$
  根据定义，$P(X \\le x_0) = F(x_0)$，因此我们有：
  $$ P(X \\le F^{-1}(y)) = F(F^{-1}(y)) = y $$

综合上述结果，可以写出 $Y$ 的分布函数表达式：
$$
F_Y(y) = \\begin{cases}
0, & y < 0 \\\\
y, & 0 \\le y < 1 \\\\
1, & y \\ge 1
\\end{cases}
$$
这正是区间 $(0, 1)$ 上的均匀分布 $U(0, 1)$ 的分布函数。

由此证明了，经过自身分布函数变换的任何严格单调连续随机变量，其变换后的变量均服从 $(0, 1)$ 上的均匀分布。

所以，正确选项为 B。
`,
    hints: [
      "由于 $F(X)$ 代表一个概率分布值，它的可能取值范围一定是 $[0, 1]$。",
      "利用 $F(x)$ 的严格单调递增性质，在不等式 $F(X) \\le y$ 两侧取反函数 $F^{-1}$ 从而得到关于 $X$ 的等价表示。"
    ],
    relatedFormulas: ["F_Y(y) = P(F(X) \\le y)", "P(X \\le F^{-1}(y)) = F(F^{-1}(y)) = y"],
    commonMistakes: [
      "以为 $F(X)$ 指向具体某个概率值而不是随机变量，误认为其服从某种退化分布。",
      "认为转换后的分布与原分布 $X$ 种类相同。"
    ]
  }
];
