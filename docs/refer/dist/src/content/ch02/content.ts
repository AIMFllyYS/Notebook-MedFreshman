export const ch02Content = {
  sections: [
    {
      id: "2.1",
      title: "随机变量",
      content: `
在对随机现象进行的研究中，我们不仅关注事件是否发生，更关注与试验结果相关的数值大小。例如，掷一枚骰子观察出现的点数，记录某电话交换台在单位时间内收到的呼叫次数，或者测量某种型号灯泡的寿命。

为了使用数学分析等工具来深入研究这些随机现象，我们需要将试验结果**数量化**。

### 1. 随机变量的定义
设随机试验 $E$ 的样本空间为 $\\Omega$。如果对于 $\\Omega$ 中的每一个样本点 $\\omega \\in \\Omega$，都有一个确定的实数 $X(\\omega)$ 与之对应，且对于任意实数 $x$，集合 $\\{\\omega \\mid X(\\omega) \\le x\\}$ 都是一个随机事件，则称定义在 $\\Omega$ 上的单值实值函数 $X = X(\\omega)$ 为**随机变量 (Random Variable)**。

> **数学本质**：随机变量并不是一个“变量”，而是一个以样本空间 $\\Omega$ 为定义域、以实数集 $\\mathbb{R}$ 为值域的**实值映射（函数）**。在测度论中，它被严格定义为可测空间上的可测映射。它将抽象的样本点映射为具体可计算的实数，从而架起了事件与实数域之间的桥梁。

### 2. 随机变量表示的事件
引入随机变量后，我们可以用关于它的代数关系式来描述各种随机事件。例如，设 $x, a, b$ 为实数：
- $\\{X = x\\}$ 表示事件 $\\{\\omega \\in \\Omega \\mid X(\\omega) = x\\}$
- $\\{X \\le x\\}$ 表示事件 $\\{\\omega \\in \\Omega \\mid X(\\omega) \\le x\\}$
- $\\{a < X \\le b\\}$ 表示事件 $\\{\\omega \\in \\Omega \\mid a < X(\\omega) \\le b\\}$

例如，抛掷一枚硬币，样本空间 $\\Omega = \\{\\omega_1, \\omega_2\\}$（$\\omega_1$ 表示正面，$\\omega_2$ 表示反面）。我们可以定义一个随机变量 $X$：
$$ X(\\omega_1) = 1, \\quad X(\\omega_2) = 0 $$
这样，事件“出现正面”就可以等价地表示为 $\\{X = 1\\}$，其概率为 $P(X = 1)$。

### 3. 随机变量的分类
根据随机变量可能取值的个数或特征，通常将其分为以下两类：
1. **离散型随机变量**：取值是有限个或可列无限个的随机变量。
2. **连续型随机变量**：取值可以充满某个区间或整个实数轴的随机变量。
      `
    },
    {
      id: "2.2",
      title: "离散型随机变量及其分布律",
      content: `
### 1. 分布律的定义
若随机变量 $X$ 的全部可能取值为有限个或可列无限个：$x_1, x_2, \\dots, x_n, \\dots$，则称 $X$ 为**离散型随机变量 (Discrete Random Variable)**。

为了完整刻画离散型随机变量的统计规律，我们必须知道它可能取哪些值，以及取每个值的概率。我们称
$$ P(X = x_k) = p_k, \\quad k = 1, 2, \\dots $$
为离散型随机变量 $X$ 的**分布律 (Probability Distribution)** 或概率质量函数 (PMF)。

分布律也可以用表格形式表示：
$$
\\begin{array}{c|ccccc}
X & x_1 & x_2 & \\dots & x_k & \\dots \\\\
\\hline
P & p_1 & p_2 & \\dots & p_k & \\dots \\\\
\\end{array}
$$

离散型随机变量的分布律必须满足以下两个核心性质：
1. **非负性**：$p_k \\ge 0, \\quad k = 1, 2, \\dots$
2. **规范性**：$\\sum_{k=1}^{\\infty} p_k = 1$

---

### 2. 几种重要的离散型分布

#### (1) 0-1分布（两点分布 / 伯努利分布）
随机变量 $X$ 只可能取 $0$ 和 $1$ 两个值，其分布律为：
$$ P(X = 1) = p, \\quad P(X = 0) = 1 - p \\quad (0 < p < 1) $$
则称 $X$ 服从参数为 $p$ 的**0-1分布**，记作 $X \\sim B(1, p)$。它用于描述只有两种结果（成功或失败）的单次随机试验（即伯努利试验）。

#### (2) 二项分布 (Binomial Distribution)
设试验 $E$ 只有两个可能结果：事件 $A$ 发生（概率为 $p$）和事件 $A$ 不发生（概率为 $1-p$）。将试验 $E$ 在相同条件下独立重复进行 $n$ 次，这一串试验称为 **$n$ 重伯努利试验**。

设随机变量 $X$ 表示 $n$ 重伯努利试验中事件 $A$ 发生的次数，则 $X$ 的所有可能取值为 $0, 1, \\dots, n$。其分布律为：
$$ P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\quad k = 0, 1, \\dots, n $$
其中 $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$。称 $X$ 服从参数为 $n, p$ 的**二项分布**，记作 $X \\sim B(n, p)$。

下面是二项分布的交互式分布图，你可以调节参数 $n$ 和 $p$ 观察分布的变化趋势：
<InteractiveDistribution type="binomial" n={15} p={0.4} />

#### (3) 泊松分布 (Poisson Distribution)
设随机变量 $X$ 的所有可能取值为 $0, 1, 2, \\dots$，其分布律为：
$$ P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad k = 0, 1, 2, \\dots $$
其中 $\\lambda > 0$ 是常数。则称 $X$ 服从参数为 $\\lambda$ 的**泊松分布**，记作 $X \\sim \\pi(\\lambda)$ 或 $X \\sim P(\\lambda)$。

泊松分布常用于描述在单位时间或单位空间内，稀有事件发生的次数（例如电话交换台收到的呼叫次数、网页的访问量、放射性物质释放出的粒子数）。

<InteractiveDistribution type="poisson" lambda={4} />

*定理（泊松定理 / 泊松逼近）*：
设 $\\lambda > 0$ 是常数，$n$ 是正整数。设 $p_n$ 是与 $n$ 有关的概率，满足 $\\lim_{n \\to \\infty} n p_n = \\lambda$。则对于任意固定的非负整数 $k$，有：
$$ \\lim_{n \\to \\infty} \\binom{n}{k} p_n^k (1-p_n)^{n-k} = \\frac{\\lambda^k e^{-\\lambda}}{k!} $$

下面是泊松定理的详细推导步骤：
<FormulaSteps formula="\\lim_{n \\to \\infty} \\binom{n}{k} p_n^k (1-p_n)^{n-k} = \\frac{\\lambda^k e^{-\\lambda}}{k!}" steps={[
  "设 \\lambda_n = n p_n，则 p_n = \\frac{\\lambda_n}{n} 且当 n \\to \\infty 时 \\lambda_n \\to \\lambda。",
  "代入二项分布公式展开：\\binom{n}{k} p_n^k (1-p_n)^{n-k} = \\frac{n(n-1)\\dots(n-k+1)}{k!} \\left(\\frac{\\lambda_n}{n}\\right)^k \\left(1 - \\frac{\\lambda_n}{n}\\right)^{n-k}。",
  "整理式子：\\frac{\\lambda_n^k}{k!} \\cdot \\left[ 1 \\cdot \\left(1-\\frac{1}{n}\\right)\\dots\\left(1-\\frac{k-1}{n}\\right) \\right] \\cdot \\left(1 - \\frac{\\lambda_n}{n}\\right)^n \\cdot \\left(1 - \\frac{\\lambda_n}{n}\\right)^{-k}。",
  "当 n \\to \\infty 时，中括号部分趋向于 1，最后一部分 \\left(1 - \\frac{\\lambda_n}{n}\\right)^{-k} 趋向于 1。",
  "根据重要极限，\\lim_{n \\to \\infty} \\left(1 - \\frac{\\lambda_n}{n}\\right)^n = e^{-\\lambda} 且 \\lim_{n \\to \\infty} \\lambda_n^k = \\lambda^k。",
  "综合各项极限，即证极限为 \\frac{\\lambda^k e^{-\\lambda}}{k!}。"
]} />

#### (4) 几何分布 (Geometric Distribution)
在重复独立的伯努利试验中，若每次试验事件 $A$ 发生的概率为 $p$ ($0 < p < 1$)。设随机变量 $X$ 为事件 $A$ 首次发生时所需的试验次数，则 $X$ 的可能取值为 $1, 2, \\dots$。其分布律为：
$$ P(X = k) = (1-p)^{k-1} p, \\quad k = 1, 2, \\dots $$
则称 $X$ 服从参数为 $p$ 的**几何分布**，记作 $X \\sim Geom(p)$。

几何分布具有非常重要的**无记忆性 (Memoryless Property)**：对于任意正整数 $s, t$，有
$$ P(X > s+t \\mid X > s) = P(X > t) $$
*证明*：
因为前 $m$ 次试验事件 $A$ 均未发生，所以有：
$$ P(X > m) = (1-p)^m $$
从而：
$$ P(X > s+t \\mid X > s) = \\frac{P(X > s+t \\cap X > s)}{P(X > s)} = \\frac{P(X > s+t)}{P(X > s)} = \\frac{(1-p)^{s+t}}{(1-p)^s} = (1-p)^t = P(X > t) $$
      `
    },
    {
      id: "2.3",
      title: "随机变量的分布函数",
      content: `
分布律只能描述离散型随机变量，而连续型随机变量取任何单点的概率通常都为 $0$。为了能以统一的方法描述所有类型的随机变量（包括离散型、连续型以及混合型），我们需要引入**分布函数**。

### 1. 定义
设 $X$ 是一个随机变量，$x$ 是任意实数。称函数
$$ F(x) = P(X \\le x), \\quad -\\infty < x < \\infty $$
为随机变量 $X$ 的**累积分布函数 (Cumulative Distribution Function)**，简称**分布函数**。

若已知随机变量 $X$ 的分布函数 $F(x)$，则对于任意实数 $a < b$，其落在区间 $(a, b]$ 内的概率为：
$$ P(a < X \\le b) = P(X \\le b) - P(X \\le a) = F(b) - F(a) $$

---

### 2. 分布函数的性质
一个实值函数 $F(x)$ 能作为某个随机变量的分布函数的**充分必要条件**是满足以下三条基本性质：

1. **单调非减性**：对于任意实数 $x_1 < x_2$，有 $F(x_1) \\le F(x_2)$。
   *证明*：由于 $\\{X \\le x_1\\} \\subset \\{X \\le x_2\\}$，根据概率的单调性，必然有 $P(X \\le x_1) \\le P(X \\le x_2)$。
2. **有界性**：且
   $$ \\lim_{x \\to -\\infty} F(x) = 0 \\quad (\\text{记作 } F(-\\infty) = 0) $$
   $$ \\lim_{x \\to \\infty} F(x) = 1 \\quad (\\text{记作 } F(\\infty) = 1) $$
3. **右连续性**：对于任意实数 $x_0$，当 $x$ 从右侧趋于 $x_0$ 时有：
   $$ \\lim_{x \\to x_0^+} F(x) = F(x_0) $$

---

### 3. 单点概率与半开闭区间概率的计算
利用概率的可列可加性，我们可以推导：
$$ P(X < x) = \\lim_{t \\to x^-} F(t) = F(x^-) $$
从而对于任意实数 $x$，有：
$$ P(X = x) = F(x) - F(x^-) $$
- 若 $F(x)$ 在点 $x$ 处是连续的，则 $P(X = x) = 0$。
- 若 $F(x)$ 在点 $x$ 处有跳跃间断点，其跳跃高度 $F(x) - F(x^-)$ 即为 $X$ 取该点值的概率。

对于任意区间，概率计算公式如下：
- $P(a < X \\le b) = F(b) - F(a)$
- $P(a \\le X \\le b) = F(b) - F(a^-)$
- $P(a < X < b) = F(b^-) - F(a)$
- $P(a \\le X < b) = F(b^-) - F(a^-)$

### 4. 离散型随机变量的分布函数
设离散型随机变量 $X$ 的分布律为 $P(X = x_k) = p_k$。则其分布函数为阶梯状跳跃函数：
$$ F(x) = \\sum_{x_k \\le x} p_k $$
其中和式是对所有满足 $x_k \\le x$ 的项求和。它在每个可能取值 $x_k$ 处产生一个高度为 $p_k$ 的向上跳跃。
      `
    },
    {
      id: "2.4",
      title: "连续型随机变量及其概率密度",
      content: `
### 1. 定义
设 $X$ 是一个随机变量，其分布函数为 $F(x)$。如果存在实轴上的非负可积函数 $f(x)$，使得对任意实数 $x$，有
$$ F(x) = \\int_{-\\infty}^x f(t) dt $$
则称 $X$ 为**连续型随机变量 (Continuous Random Variable)**，并称 $f(x)$ 为 $X$ 的**概率密度函数 (Probability Density Function)**，简称**概率密度**或**密度函数**。

---

### 2. 概率密度函数 $f(x)$ 的基本性质
由定义易知，概率密度函数 $f(x)$ 必须满足以下性质：
1. **非负性**：$f(x) \\ge 0$。
2. **规范性**：$\\int_{-\\infty}^{\\infty} f(x) dx = 1$。
3. **区间概率**：对于任意实数 $a < b$，有
   $$ P(a < X \\le b) = \\int_a^b f(x) dx $$
   几何上，这表示曲线 $y = f(x)$ 在区间 $[a, b]$ 上方与 $x$ 轴围成的图形的面积。
4. **导数关系**：若 $f(x)$ 在点 $x$ 处连续，则有
   $$ F'(x) = f(x) $$
5. **局部概率近似**：当 $\\Delta x$ 很小时，有
   $$ P(x < X \\le x + \\Delta x) \\approx f(x) \\Delta x $$

> **特别注意**：对于连续型随机变量，它取任何单点的概率都为 $0$，即 $P(X = a) = \\int_a^a f(x) dx = 0$。因此，包含或扣除区间的端点对概率值没有影响：
> $$ P(a < X \\le b) = P(a \\le X \\le b) = P(a < X < b) = P(a \\le X < b) $$
> 在概率论中，“概率为0的事件”不一定是不可能事件（例如连续型随机变量取某一具体确定值的事件），“概率为1的事件”也不一定是必然事件。

---

### 3. 三种重要的连续型分布

#### (1) 均匀分布 (Uniform Distribution)
如果随机变量 $X$ 的概率密度为：
$$
f(x) = \\begin{cases}
\\frac{1}{b-a}, & a \\le x \\le b \\\\
0, & \\text{其他}
\\end{cases}
$$
则称 $X$ 在区间 $[a, b]$ 上服从**均匀分布**，记作 $X \\sim U(a, b)$。
其分布函数为：
$$
F(x) = \\begin{cases}
0, & x < a \\\\
\\frac{x-a}{b-a}, & a \\le x < b \\\\
1, & x \\ge b
\\end{cases}
$$

#### (2) 指数分布 (Exponential Distribution)
如果随机变量 $X$ 的概率密度为：
$$
f(x) = \\begin{cases}
\\lambda e^{-\\lambda x}, & x > 0 \\\\
0, & x \\le 0
\\end{cases}
$$
其中 $\\lambda > 0$ 是常数。则称 $X$ 服从参数为 $\\lambda$ 的**指数分布**，记作 $X \\sim Exp(\\lambda)$。
其分布函数为：
$$
F(x) = \\begin{cases}
1 - e^{-\\lambda x}, & x \\ge 0 \\\\
0, & x < 0
\\end{cases}
$$

指数分布常用于描述寿命、排队等待时间、电子元器件的无故障运行时间等。它在连续型随机变量中独有**无记忆性**：对任意 $s, t > 0$，有
$$ P(X > s+t \\mid X > s) = P(X > t) $$
*证明*：
因为 $P(X > x) = 1 - F(x) = e^{-\\lambda x}$ ($x > 0$)，所以：
$$ P(X > s+t \\mid X > s) = \\frac{P(X > s+t)}{P(X > s)} = \\frac{e^{-\\lambda(s+t)}}{e^{-\\lambda s}} = e^{-\\lambda t} = P(X > t) $$

#### (3) 正态分布 (Normal Distribution / 高斯分布)
如果随机变量 $X$ 的概率密度为：
$$ f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}, \\quad -\\infty < x < \\infty $$
其中 $\\mu$ 和 $\\sigma$ ($\\sigma > 0$) 为常数。则称 $X$ 服从参数为 $\\mu, \\sigma^2$ 的**正态分布**，记作 $X \\sim N(\\mu, \\sigma^2)$。

正态分布概率密度曲线 $y = f(x)$ 的几何特征：
1. 曲线关于直线 $x = \\mu$ 对称。
2. 当 $x = \\mu$ 时，密度函数取得最大值 $f(\\mu) = \\frac{1}{\\sqrt{2\\pi}\\sigma}$。
3. 当 $x \\to \\pm\\infty$ 时，曲线以 $x$ 轴为渐近线。
4. $\\sigma$ 的值越小，曲线越尖锐（数据越集中）；$\\sigma$ 的值越大，曲线越扁平（数据越分散）。

*标准正态分布*：当 $\\mu = 0, \\sigma = 1$ 时，称 $X$ 服从**标准正态分布**，记作 $X \\sim N(0, 1)$。
其密度函数和分布函数分别记为 $\\phi(x)$ 和 $\\Phi(x)$：
$$ \\phi(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}} $$
$$ \\Phi(x) = \\frac{1}{\\sqrt{2\\pi}} \\int_{-\\infty}^x e^{-\\frac{t^2}{2}} dt $$
由于对称性，显然有 $\\Phi(-x) = 1 - \\Phi(x)$。

*标准化公式*：若 $X \\sim N(\\mu, \\sigma^2)$，则新随机变量 $Z = \\frac{X-\\mu}{\\sigma} \\sim N(0, 1)$。
利用此公式，我们可以方便地将任意正态分布的概率计算转化为标准正态分布表来查询：
$$ P(a < X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right) $$

下面是标准正态分布的交互式分布图，你可以直观地看到曲线形状及其对应的概率：
<InteractiveDistribution type="normal" mean={0} stdDev={1} />
      `
    },
    {
      id: "2.5",
      title: "随机变量的函数的分布",
      content: `
在实际应用中，很多时候我们无法直接观测到目标随机变量 $Y$，而只能测得另一个与它有函数关系的随机变量 $X$（即 $Y = g(X)$）。我们需要通过 $X$ 的已知分布来推导 $Y$ 的分布。

### 1. 离散型随机变量的函数的分布
设离散型随机变量 $X$ 的分布律为：
$$ P(X = x_k) = p_k, \\quad k = 1, 2, \\dots $$
设 $Y = g(X)$ 是 $X$ 的函数。若 $X$ 的取值 $x_1, x_2, \\dots$ 对应的 $g(x_1), g(x_2), \\dots$ 中有相同的值，我们需要合并同类项。
具体计算公式：
$$ P(Y = y_j) = \\sum_{g(x_k)=y_j} P(X = x_k) $$

---

### 2. 连续型随机变量的函数的分布
设连续型随机变量 $X$ 的概率密度为 $f_X(x)$，求 $Y = g(X)$ 的概率密度 $f_Y(y)$。我们常用的方法有以下两种：

#### (1) 分布函数法 (CDF Method)
这是最基础、最普适的方法。它的思路是先求出 $Y$ 的分布函数 $F_Y(y)$，然后求导得到其概率密度。

具体步骤如下：
1. 根据 $X$ 的取值范围，确定 $Y = g(X)$ 的取值范围。
2. 写出 $Y$ 的分布函数定义式：
   $$ F_Y(y) = P(Y \\le y) = P(g(X) \\le y) $$
3. 通过解不等式 $g(X) \\le y$，将事件转化成关于 $X$ 的区间：
   $$ F_Y(y) = \\int_{g(x) \\le y} f_X(x) dx $$
4. 对 $F_Y(y)$ 关于 $y$ 求导得到概率密度 $f_Y(y) = F_Y'(y)$。

**经典案例：$Y = X^2$ 的分布**
设 $X \\sim N(0, 1)$，求 $Y = X^2$ 的概率密度 $f_Y(y)$。
- 首先，因为 $X^2 \\ge 0$，所以当 $y \\le 0$ 时，$F_Y(y) = 0$，进而 $f_Y(y) = 0$。
- 当 $y > 0$ 时，分布函数为：
  $$ F_Y(y) = P(X^2 \\le y) = P(-\\sqrt{y} \\le X \\le \\sqrt{y}) = F_X(\\sqrt{y}) - F_X(-\\sqrt{y}) $$
- 两边对 $y$ 求导：
  $$ f_Y(y) = F_Y'(y) = f_X(\\sqrt{y}) \\cdot \\frac{1}{2\\sqrt{y}} - f_X(-\\sqrt{y}) \\cdot \\left(-\\frac{1}{2\\sqrt{y}}\\right) = \\frac{1}{2\\sqrt{y}} [f_X(\\sqrt{y}) + f_X(-\\sqrt{y})] $$
- 代入标准正态分布密度 $\\phi(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}$：
  $$ f_Y(y) = \\frac{1}{\\sqrt{2\\pi y}} e^{-\\frac{y}{2}}, \\quad y > 0 $$
  这个分布被称为自由度为 1 的卡方分布，记作 $Y \\sim \\chi^2(1)$。

#### (2) 公式法（密度变换定理）
当 $y = g(x)$ 具有良好的单调性时，可以直接套用变换公式。

*定理*：设连续型随机变量 $X$ 具有概率密度 $f_X(x)$，且其可能取值充满区间 $I$。若 $y = g(x)$ 在 $I$ 上是严格单调且可导的函数，其导数 $g'(x) \\neq 0$，反函数为 $x = h(y) = g^{-1}(y)$。则随机变量 $Y = g(X)$ 的概率密度为：
$$
f_Y(y) = \\begin{cases}
f_X(h(y)) \\cdot |h'(y)|, & y \\in J \\\\
0, & y \\notin J
\\end{cases}
$$
其中 $J$ 为 $g(x)$ 在 $I$ 上的值域。

下面是公式法（单调递增情形）的详细推导步骤：
<FormulaSteps formula="f_Y(y) = f_X(h(y)) \\cdot |h'(y)|" steps={[
  "设 g(x) 严格单调递增，则其反函数 h(y) 亦严格单调递增，且 h'(y) > 0。",
  "写出 Y 的分布函数：F_Y(y) = P(Y \\le y) = P(g(X) \\le y) = P(X \\le h(y)) = F_X(h(y))。",
  "由于 h(y) 是可导函数，利用复合函数求导法则对 y 求导：f_Y(y) = \\frac{d}{dy} F_X(h(y)) = f_X(h(y)) \\cdot h'(y)。",
  "因为 h'(y) > 0，所以 h'(y) = |h'(y)|，结论成立。",
  "同理可证当 g(x) 严格递减时，F_Y(y) = 1 - F_X(h(y))，求导得 f_Y(y) = -f_X(h(y)) \\cdot h'(y)。由于 h'(y) < 0，所以 -h'(y) = |h'(y)|，结论依然成立。"
]} />
      `
    }
  ]
};
