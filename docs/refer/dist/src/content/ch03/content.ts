export const ch03Content = {
  sections: [
    {
      id: "3.1",
      title: "二维随机变量",
      content: `
在实际问题中，随机试验的结果往往需要同时用两个或多个数值特征来描述。例如，研究成人的身体状况时，我们需要同时观测其身高 $X$ 与体重 $Y$；观测导弹落点位置时，需要同时记录其横坐标 $X$ 与纵坐标 $Y$。这就引入了多维随机变量的概念。本章以二维随机变量为主进行讨论，其核心方法可推广至更高维数。

### 1. 二维随机变量的定义
设随机试验 $E$ 的样本空间为 $\\Omega$。设 $X = X(\\omega)$ 和 $Y = Y(\\omega)$ 是定义在 $\\Omega$ 上的两个随机变量，则由它们组成的向量 $(X, Y)$ 称为**二维随机变量 (Two-Dimensional Random Variable)** 或二维随机向量。
数学上，二维随机变量 $(X, Y)$ 是从样本空间 $\\Omega$ 到平面 $\\mathbb{R}^2$ 的映射：
$$ (X, Y): \\Omega \\to \\mathbb{R}^2 $$
对于每个样本点 $\\omega \\in \\Omega$，映射对应实数对 $(x, y) = (X(\\omega), Y(\\omega))$。

### 2. 联合分布函数 (Joint Cumulative Distribution Function)
为了完整描述二维随机变量 $(X, Y)$ 的概率特性，我们引入联合分布函数的概念。
设 $(X, Y)$ 是二维随机变量，对于任意实数 $x, y$，事件 $\\{X \\le x\\}$ 与 $\\{Y \\le y\\}$ 同时发生的概率：
$$ F(x, y) = P(X \\le x, Y \\le y) = P(\\{\\omega \\mid X(\\omega) \\le x\\} \\cap \\{\\omega \\mid Y(\\omega) \\le y\\}) $$
称为二维随机变量 $(X, Y)$ 的**联合分布函数 (Joint CDF)**。
在几何上，如果把 $(X, Y)$ 看作平面上的随机点，那么 $F(x, y)$ 表示该随机点落在以 $(x, y)$ 为东北角顶点的左下方无穷区域内的概率。

联合分布函数具有以下四个核心基本性质：
1. **单调非减性**：对于任意固定的 $y$，$F(x, y)$ 是 $x$ 的单调非减函数，即若 $x_1 < x_2$，则 $F(x_1, y) \\le F(x_2, y)$；对于任意固定的 $x$，$F(x, y)$ 是 $y$ 的单调非减函数，即若 $y_1 < y_2$，则 $F(x, y_1) \\le F(x, y_2)$。
2. **有界性**：
   - $0 \\le F(x, y) \\le 1$。
   - 对任意实数 $x, y$：
     $$ F(-\\infty, y) = \\lim_{x \\to -\\infty} F(x, y) = 0 $$
     $$ F(x, -\\infty) = \\lim_{y \\to -\\infty} F(x, y) = 0 $$
     $$ F(-\\infty, -\\infty) = \\lim_{x \\to -\\infty, y \\to -\\infty} F(x, y) = 0 $$
     $$ F(\\infty, \\infty) = \\lim_{x \\to \\infty, y \\to \\infty} F(x, y) = 1 $$
3. **右连续性**：对每个自变量均右连续，即：
   $$ F(x+0, y) = \\lim_{t \\to x^+} F(t, y) = F(x, y), \\quad F(x, y+0) = \\lim_{t \\to y^+} F(x, t) = F(x, y) $$
4. **非负矩形概率性质**：对于任意实数 $x_1 < x_2$ 且 $y_1 < y_2$，有：
   $$ P(x_1 < X \\le x_2, y_1 < Y \\le y_2) = F(x_2, y_2) - F(x_1, y_2) - F(x_2, y_1) + F(x_1, y_1) \\ge 0 $$
   该性质在考研中常作为判定一个二元函数能否成为联合分布函数的必要和充分条件。如果某一函数不满足该式非负，即使前三条满足，也不能作为分布函数。

### 3. 二维离散型随机变量
若二维随机变量 $(X, Y)$ 的所有可能取值是有限对或可列无限对实数对 $(x_i, y_j)$ ($i, j = 1, 2, \\dots$)，则称 $(X, Y)$ 为**二维离散型随机变量**。
称
$$ P(X = x_i, Y = y_j) = p_{ij}, \\quad i, j = 1, 2, \\dots $$
为 $(X, Y)$ 的**联合分布律 (Joint Distribution Law)**，或概率质量函数 (PMF)。
联合分布律必须满足：
1. **非负性**：$p_{ij} \\ge 0$
2. **规范性**：$\\sum_{i=1}^{\\infty} \\sum_{j=1}^{\\infty} p_{ij} = 1$
其联合分布函数为：
$$ F(x, y) = \\sum_{x_i \\le x} \\sum_{y_j \\le y} p_{ij} $$

### 4. 二维连续型随机变量
若对于二维随机变量 $(X, Y)$ 的分布函数 $F(x, y)$，存在非负可积函数 $f(x, y)$，使得对于任意实数 $x, y$ 都有：
$$ F(x, y) = \\int_{-\\infty}^{x} \\int_{-\\infty}^{y} f(u, v) \\, dv \\, du $$
则称 $(X, Y)$ 为**二维连续型随机变量**，称 $f(x, y)$ 为其**联合概率密度函数 (Joint PDF)**。
联合概率密度具有性质：
1. **非负性**：$f(x, y) \\ge 0$
2. **规范性**：$\\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} f(x, y) \\, dx \\, dy = 1$
3. **与分布函数关系**：若 $f(x, y)$ 在点 $(x, y)$ 处连续，则有：
   $$ \\frac{\\partial^2 F(x, y)}{\\partial x \\partial y} = f(x, y) $$
4. **区域概率计算**：设 $D$ 是 $xOy$ 平面上的一个有界区域，则随机点 $(X, Y)$ 落在 $D$ 内的概率为：
   $$ P((X, Y) \\in D) = \\iint_{D} f(x, y) \\, dx \\, dy $$
      `
    },
    {
      id: "3.2",
      title: "边缘分布",
      content: `
二维随机变量 $(X, Y)$ 作为一个整体，其每个分量 $X$ 和 $Y$ 也都是随机变量。它们各自的分布函数 $F_X(x)$ and $F_Y(y)$ 分别称为二维随机变量 $(X, Y)$ 的**边缘分布函数 (Marginal CDF)**。

### 1. 边缘分布函数的定义
根据联合分布函数与边缘分布的关系：
$$ F_X(x) = P(X \\le x) = P(X \\le x, Y < \\infty) = F(x, \\infty) = \\lim_{y \\to \\infty} F(x, y) $$
$$ F_Y(y) = P(Y \\le y) = P(X < \\infty, Y \\le y) = F(\\infty, y) = \\lim_{x \\to \\infty} F(x, y) $$

### 2. 边缘分布律 (离散型)
对于离散型随机变量 $(X, Y)$，其联合分布律为 $P(X = x_i, Y = y_j) = p_{ij}$，则 $X$ 和 $Y$ 的边缘分布律分别为：
- $X$ 的边缘分布律：
  $$ P(X = x_i) = p_{i\\cdot} = \\sum_{j=1}^{\\infty} p_{ij}, \\quad i = 1, 2, \\dots $$
- $Y$ 的边缘分布律：
  $$ P(Y = y_j) = p_{\\cdot j} = \\sum_{i=1}^{\\infty} p_{ij}, \\quad j = 1, 2, \\dots $$
在联合分布律表格中，行边缘求和得到 $X$ 的边缘分布律，列边缘求和得到 $Y$ 的边缘分布律。

### 3. 边缘概率密度 (连续型)
对于连续型随机变量 $(X, Y)$，若其联合概率密度为 $f(x, y)$，则 $X$ 和 $Y$ 也是连续型随机变量，其边缘概率密度为：
- $X$ 的边缘概率密度：
  $$ f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy $$
- $Y$ 的边缘概率密度：
  $$ f_Y(y) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dx $$

### 4. 两个重要的多维分布

#### (1) 二维均匀分布 (Two-Dimensional Uniform Distribution)
设 $D$ 是平面上的一个有界区域，其面积为 $A$。如果二维随机变量 $(X, Y)$ 的联合概率密度为：
$$ f(x, y) = \\begin{cases} \\frac{1}{A}, & (x, y) \\in D \\\\ 0, & \\text{其他} \\end{cases} $$
则称 $(X, Y)$ 在区域 $D$ 上服从**均匀分布**，记作 $(X, Y) \\sim U(D)$。
> **考研警示**：如果 $(X, Y)$ 在区域 $D$ 上服从均匀分布，不能简单地认为分量 $X$ 或 $Y$ 也是一维均匀分布。只有当 $D$ 是矩形区域且边平行于坐标轴时，边缘分布才是一维均匀分布。

#### (2) 二维正态分布 (Two-Dimensional Normal Distribution)
设二维随机变量 $(X, Y)$ 的联合概率密度为：
$$ f(x, y) = \\frac{1}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^2}} \\exp\\left\\{ -\\frac{1}{2(1-\\rho^2)} \\left[ \\frac{(x-\\mu_1)^2}{\\sigma_1^2} - 2\\rho\\frac{(x-\\mu_1)(y-\\mu_2)}{\\sigma_1\\sigma_2} + \\frac{(y-\\mu_2)^2}{\\sigma_2^2} \\right] \\right\\} $$
其中 $\\mu_1, \\mu_2, \\sigma_1, \\sigma_2, \\rho$ 均为常数，且 $\\sigma_1 > 0, \\sigma_2 > 0, -1 < \\rho < 1$。则称 $(X, Y)$ 服从参数为 $\\mu_1, \\mu_2, \\sigma_1^2, \\sigma_2^2, \\rho$ 的**二维正态分布**，记作 $(X, Y) \\sim N(\\mu_1, \\mu_2, \\sigma_1^2, \\sigma_2^2, \\rho)$。

二维正态分布的边缘分布具有极佳的对称性质：其边缘分布必定是一维正态分布，即：
$$ X \\sim N(\\mu_1, \\sigma_1^2), \\quad Y \\sim N(\\mu_2, \\sigma_2^2) $$
以下是边缘密度 $f_X(x)$ 的详细配方与积分推导过程：

<FormulaSteps formula="f_X(x) = \\int_{-\\infty}^{\\infty} f(x, y) \\, dy = \\frac{1}{\\sqrt{2\\pi}\\sigma_1} \\exp\\left\\{-\\frac{(x-\\mu_1)^2}{2\\sigma_1^2}\\right\\}" steps={[
  "写出联合密度积分式：f_X(x) = \\int_{-\\infty}^{\\infty} \\frac{1}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^2}} \\exp\\{-Q(x,y)/2(1-\\rho^2)\\} dy，其中 Q(x,y) = \\frac{(x-\\mu_1)^2}{\\sigma_1^2} - 2\\rho\\frac{(x-\\mu_1)(y-\\mu_2)}{\\sigma_1\\sigma_2} + \\frac{(y-\\mu_2)^2}{\\sigma_2^2}。",
  "对 Q(x,y) 中包含 y 的项进行配方。令 u = \\frac{x-\\mu_1}{\\sigma_1}，v = \\frac{y-\\mu_2}{\\sigma_2}，则 Q 对应的部分为 u^2 - 2\\rho uv + v^2 = (v - \\rho u)^2 + u^2(1-\\rho^2)。",
  "将配方后的式子代入指数部分，拆分不含 y 的项：\\exp\\{-Q/2(1-\\rho^2)\\} = \\exp\\{-\\frac{u^2}{2}\\} \\exp\\{-\\frac{(v-\\rho u)^2}{2(1-\\rho^2)}\\}。",
  "代入积分中，将不含 y 的项提到积分符号外：f_X(x) = \\frac{\\exp\\{-u^2/2\\}}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^2}} \\int_{-\\infty}^{\\infty} \\exp\\{-\\frac{(y-\\mu_2-\\rho\\frac{\\sigma_2}{\\sigma_1}(x-\\mu_1))^2}{2\\sigma_2^2(1-\\rho^2)}\\} dy。",
  "令 t = \\frac{y-\\mu_2-\\rho\\frac{\\sigma_2}{\\sigma_1}(x-\\mu_1)}{\\sigma_2\\sqrt{1-\\rho^2}}，则 dy = \\sigma_2\\sqrt{1-\\rho^2} dt，积分限不变。",
  "积分项变为标准高斯积分：\\int_{-\\infty}^{\\infty} \\exp\\{-t^2/2\\} dt = \\sqrt{2\\pi}。常数项相消，最终化简得到 f_X(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma_1} \\exp\\{-\\frac{(x-\\mu_1)^2}{2\\sigma_1^2}\\}。"
]} />

一维正态分布的特征可以通过下方交互界面来加深体会：
<InteractiveDistribution type="normal" mean={0} stdDev={1} />
      `
    },
    {
      id: "3.3",
      title: "条件分布",
      content: `
在二维随机变量 $(X, Y)$ 中，如果我们已知其中一个分量取特定值的条件下，去研究另一个分量的概率分布，这就是条件分布。

### 1. 条件分布律 (离散型)
设 $(X, Y)$ 是二维离散型随机变量，其联合分布律为 $P(X = x_i, Y = y_j) = p_{ij}$，边缘分布律为 $P(X = x_i) = p_{i\\cdot}$，$P(Y = y_j) = p_{\\cdot j}$。
若对于某固定的 $j$，有 $P(Y = y_j) = p_{\\cdot j} > 0$，则称
$$ P(X = x_i \\mid Y = y_j) = \\frac{P(X = x_i, Y = y_j)}{P(Y = y_j)} = \\frac{p_{ij}}{p_{\\cdot j}}, \\quad i = 1, 2, \\dots $$
为在条件 $Y = y_j$ 下随机变量 $X$ 的**条件分布律**。
类似地，对于固定的 $i$，若 $P(X = x_i) = p_{i\\cdot} > 0$，在条件 $X = x_i$ 下随机变量 $Y$ 的**条件分布律**为：
$$ P(Y = y_j \\mid X = x_i) = \\frac{P(X = x_i, Y = y_j)}{P(X = x_i)} = \\frac{p_{ij}}{p_{i\\cdot}}, \\quad j = 1, 2, \\dots $$

### 2. 条件概率密度 (连续型)
对于二维连续型随机变量 $(X, Y)$，由于单点事件 $P(Y = y) = 0$，我们无法直接用经典的条件概率公式计算。我们需要使用极限的方法定义条件密度。
设 $(X, Y)$ 的联合概率密度为 $f(x, y)$，$Y$ 的边缘概率密度为 $f_Y(y)$。对于任意固定的 $y$，若 $f_Y(y) > 0$，我们定义在条件 $Y = y$ 下，$X$ 的**条件概率密度**为：
$$ f_{X\\mid Y}(x \\mid y) = \\frac{f(x, y)}{f_Y(y)} $$
由此，可以定义在条件 $Y = y$ 下，$X$ 的条件分布函数：
$$ F_{X\\mid Y}(x \\mid y) = P(X \\le x \\mid Y = y) = \\int_{-\\infty}^{x} f_{X\\mid Y}(u \\mid y) \\, du = \\int_{-\\infty}^{x} \\frac{f(u, y)}{f_Y(y)} \\, du $$

> **极限解释的推导**：
> 实际上，对于极小的间隔 $\\epsilon > 0$，有
> $$ P(X \\le x \\mid y - \\epsilon < Y \\le y + \\epsilon) = \\frac{\\int_{-\\infty}^{x} \\left( \\int_{y-\\epsilon}^{y+\\epsilon} f(u, v) \\, dv \\right) du}{\\int_{y-\\epsilon}^{y+\\epsilon} f_Y(v) \\, dv} $$
> 设 $f(x, y)$ 和 $f_Y(y)$ 连续，根据积分中值定理，分子和分母在 $\\epsilon \\to 0^+$ 时，可以近似展开。当取极限时：
> $$ \\lim_{\\epsilon \\to 0^+} P(X \\le x \\mid y - \\epsilon < Y \\le y + \\epsilon) = \\int_{-\\infty}^{x} \\frac{f(u, y)}{f_Y(y)} \\, du $$
> 这说明该定义具有严密的测度极限合理性。

同理，在条件 $X = x$ 且 $f_X(x) > 0$ 的条件下，$Y$ 的条件概率密度为：
$$ f_{Y\\mid X}(y \\mid x) = \\frac{f(x, y)}{f_X(x)} $$

### 3. 二维正态分布的条件分布
设 $(X, Y) \\sim N(\\mu_1, \\mu_2, \\sigma_1^2, \\sigma_2^2, \\rho)$。若已知 $Y = y$，则 $X$ 在此条件下的条件分布仍为一维正态分布，其参数为：
$$ X \\mid Y = y \\sim N\\left( \\mu_1 + \\rho \\frac{\\sigma_1}{\\sigma_2}(y - \\mu_2), \\, \\sigma_1^2(1 - \\rho^2) \right) $$
该结果在现代数理统计学（最小二乘回归、高斯过程等）中有着极其核心的地位：
1. **条件期望（回归方程）**：$E(X \\mid Y=y) = \\mu_1 + \\rho \\frac{\\sigma_1}{\\sigma_2}(y - \\mu_2)$ 是关于 $y$ 的线性函数。
2. **条件方差（均方误差）**：$D(X \\mid Y=y) = \\sigma_1^2(1 - \\rho^2)$ 与具体的条件观测值 $y$ 无关，且由于 $|\\rho| < 1$，条件方差小于或等于无条件方差 $\\sigma_1^2$。这说明引入辅助观测 $Y$ 使得对 $X$ 估计的精度获得了提高。
      `
    },
    {
      id: "3.4",
      title: "相互独立的随机变量",
      content: `
相互独立性是概率论中最核心的简化假设之一，它代表一个随机变量的取值概率不受另一个随机变量取值情况的任何影响。

### 1. 独立性的定义
设 $(X, Y)$ 是二维随机变量，$F(x, y)$ 是其联合分布函数，$F_X(x), F_Y(y)$ 分别是 $X$ 和 $Y$ 的边缘分布函数。
若对任意实数 $x, y$，都有：
$$ F(x, y) = F_X(x) F_Y(y) $$
则称随机变量 $X$ 和 $Y$ 是**相互独立的 (Independent)**。

### 2. 离散型随机变量的独立性判定
对于二维离散型随机变量 $(X, Y)$，它们相互独立的充分必要条件是，对于其联合分布律表中的所有 $i, j$，都有：
$$ P(X = x_i, Y = y_j) = P(X = x_i) P(Y = y_j) \\quad (\\text{即 } p_{ij} = p_{i\\cdot} p_{\\cdot j}) $$

### 3. 连续型随机变量的独立性判定
对于二维连续型随机变量 $(X, Y)$，它们相互独立的充分必要条件是，在平面上几乎处处有联合概率密度等于边缘概率密度的乘积：
$$ f(x, y) = f_X(x) f_Y(y) $$
如果 $X$ 和 $Y$ 相互独立，那么它们的条件概率密度直接退化为边缘概率密度：
$$ f_{X\\mid Y}(x \\mid y) = f_X(x), \\quad f_{Y\\mid X}(y \\mid x) = f_Y(y) $$

### 4. 独立随机变量的函数性质
**定理**：如果 $X$ 和 $Y$ 相互独立，且 $g(x)$ 与 $h(y)$ 是连续函数（或更一般的可测映射），则新生成的随机变量 $U = g(X)$ 与 $V = h(Y)$ 也必定是相互独立的。
例如，若 $X$ 与 $Y$ 独立，则 $X^2$ 与 $\\cos(Y)$ 也必然独立。

### 5. 二维正态分布与独立性
设 $(X, Y) \\sim N(\\mu_1, \\mu_2, \\sigma_1^2, \\sigma_2^2, \\rho)$。则 $X$ 与 $Y$ 相互独立的**充分必要条件**是其相关系数 $\\rho = 0$。
> **考研关键辨析**：
> 1. “不相关”与“相互独立”在一元分布或一般二维分布下是不等价的（独立必不相关，但不相关不一定独立）。
> 2. 但在**联合正态分布**这个强前提下，“相互独立”与“不相关 ($\\rho = 0$)”是互为充要条件的。
> 3. 注意，必须是**联合正态**。若仅有 $X \\sim N(0, 1)$，$Y \\sim N(0, 1)$ 且 $\\rho = 0$，若它们不是联合正态的，它们仍可能不独立。
      `
    },
    {
      id: "3.5",
      title: "两个随机变量的函数的分布",
      content: `
在实际应用中，我们常常需要根据已知的二维随机变量 $(X, Y)$ 的联合分布，求出它们的某个函数 $Z = g(X, Y)$ 的概率分布。这是概率论考试中计算量最大、考查频率极高的考点。

### 1. 和的分布 $Z = X + Y$（卷积公式）
设 $(X, Y)$ 为二维连续型随机变量，联合概率密度为 $f(x, y)$。我们求 $Z = X + Y$ 的概率密度。
首先，求 $Z$ 的分布函数 $F_Z(z)$：
$$ F_Z(z) = P(X + Y \\le z) = \\iint_{x+y \\le z} f(x, y) \\, dx \\, dy $$
将该积分区域转化为累次积分（固定 $x$，积分限 $y \\in (-\\infty, z - x]$）：
$$ F_Z(z) = \\int_{-\\infty}^{\\infty} \\left[ \\int_{-\\infty}^{z-x} f(x, y) \\, dy \\right] dx $$
对其两边关于 $z$ 求导（利用含参变量积分求导法则）：
$$ f_Z(z) = \\frac{d}{dz} F_Z(z) = \\int_{-\\infty}^{\\infty} f(x, z-x) \\, dx $$
同理，利用对称性也可以得到：
$$ f_Z(z) = \\int_{-\\infty}^{\\infty} f(z-y, y) \\, dy $$
以上两个公式称为**卷积公式 (Convolution Formula)**。

若 $X$ 和 $Y$ 相互独立，则 $f(x, y) = f_X(x)f_Y(y)$，卷积公式写为：
$$ f_Z(z) = \\int_{-\\infty}^{\\infty} f_X(x) f_Y(z-x) \\, dx = \\int_{-\\infty}^{\\infty} f_X(z-y) f_Y(y) \\, dy $$
我们可以通过下面的交互式步骤器复习卷积公式的导数推导过程：

<FormulaSteps formula="f_Z(z) = \\int_{-\\infty}^{\\infty} f_X(x) f_Y(z-x) \\, dx" steps={[
  "写出 Z 的累积分布函数：F_Z(z) = P(X + Y \\le z) = \\iint_{x+y \\le z} f_X(x) f_Y(y) dx dy。",
  "转化为累次积分，内层以 y 为自变量，上限为 z-x：F_Z(z) = \\int_{-\\infty}^{\\infty} f_X(x) [\\int_{-\\infty}^{z-x} f_Y(y) dy] dx。",
  "对 z 求导以获得概率密度：f_Z(z) = \\frac{d}{dz} \\int_{-\\infty}^{\\infty} f_X(x) [\\int_{-\\infty}^{z-x} f_Y(y) dy] dx。",
  "根据含参变量积分求导法则，将微分号移入外层积分内：f_Z(z) = \\int_{-\\infty}^{\\infty} f_X(x) [\\frac{d}{dz} \\int_{-\\infty}^{z-x} f_Y(y) dy] dx。",
  "内层求导应用微积分基本定理：\\frac{d}{dz} \\int_{-\\infty}^{z-x} f_Y(y) dy = f_Y(z-x) \\cdot \\frac{d(z-x)}{dz} = f_Y(z-x)。",
  "合并两层，即证卷积公式得：f_Z(z) = \\int_{-\\infty}^{\\infty} f_X(x) f_Y(z-x) dx。"
]} />

关于卷积积分在几何与物理上的直观表示，可参考以下视频演示：
<ManimAnimation src="/videos/ch03/convolution.mp4" title="二维随机变量函数的分布：卷积公式几何物理直观" />

#### 重要和分布结论：
1. **正态分布的再生性**：
   设 $X \\sim N(\\mu_1, \\sigma_1^2)$，$Y \\sim N(\\mu_2, \\sigma_2^2)$，且 $X$ 与 $Y$ 相互独立。则：
   $$ Z = X + Y \\sim N(\\mu_1 + \\mu_2, \\, \\sigma_1^2 + \\sigma_2^2) $$
   推广到一般线性组合：若 $X_1, X_2$ 独立，则 $a X_1 + b X_2 \\sim N(a\\mu_1 + b\\mu_2, \\, a^2\\sigma_1^2 + b^2\\sigma_2^2)$。
2. **泊松分布的再生性**：
   设 $X \\sim P(\\lambda_1)$，$Y \\sim P(\\lambda_2)$，且 $X$ 与 $Y$ 相互独立。则：
   $$ Z = X + Y \\sim P(\\lambda_1 + \\lambda_2) $$
   对于离散型卷积：$P(Z=z) = \\sum_{k=0}^{z} P(X=k) P(Y=z-k)$，展开即得。

### 2. 商的分布 $Z = Y / X$
设连续型随机变量 $X, Y$ 相互独立，概率密度分别为 $f_X(x), f_Y(y)$。求商 $Z = Y / X$ 的概率密度：
$$ f_Z(z) = \\int_{-\\infty}^{\\infty} |x| f_X(x) f_Y(xz) \\, dx $$
*证明简述*：
$$ F_Z(z) = P\\left(\\frac{Y}{X} \\le z\\right) = \\iint_{y/x \\le z} f_X(x)f_Y(y) \\, dx \\, dy $$
分区间 $x > 0$ 和 $x < 0$ 讨论：
$$ F_Z(z) = \\int_{0}^{\\infty} f_X(x) \\left[ \\int_{-\\infty}^{zx} f_Y(y) \\, dy \\right] dx + \\int_{-\\infty}^{0} f_X(x) \\left[ \\int_{zx}^{\\infty} f_Y(y) \\, dy \\right] dx $$
对其两边关于 $z$ 求导：
$$ f_Z(z) = \\int_{0}^{\\infty} x f_X(x) f_Y(zx) \\, dx + \\int_{-\\infty}^{0} (-x) f_X(x) f_Y(zx) \\, dx = \\int_{-\\infty}^{\\infty} |x| f_X(x) f_Y(xz) \\, dx $$

### 3. 最大值与最小值的分布
设 $X_1, X_2, \\dots, X_n$ 是相互独立的随机变量，其分布函数分别为 $F_{X_1}(x), F_{X_2}(x), \\dots, F_{X_n}(x)$。

#### (1) 最大值随机变量 $M = \\max(X_1, X_2, \\dots, X_n)$ 的分布
系统由 $n$ 个独立部件并联而成，当且仅当所有部件都失效时系统才失效。系统寿命为 $M$。
其分布函数为：
$$ F_M(z) = P(\\max(X_1, \\dots, X_n) \\le z) = P(X_1 \\le z, \\dots, X_n \\le z) $$
由于独立性，有：
$$ F_M(z) = F_{X_1}(z) F_{X_2}(z) \\dots F_{X_n}(z) $$
若 $X_1, \\dots, X_n$ 独立同分布于 $F(x)$，则：
$$ F_M(z) = [F(z)] ^ n $$

#### (2) 最小值随机变量 $N = \\min(X_1, X_2, \\dots, X_n)$ 的分布
系统由 $n$ 个独立部件串联而成，只要有一个部件失效系统即失效。系统寿命为 $N$。
其分布函数为：
$$ F_N(z) = P(\\min(X_1, \\dots, X_n) \\le z) = 1 - P(\\min(X_1, \\dots, X_n) > z) = 1 - P(X_1 > z, \\dots, X_n > z) $$
由于独立性，有：
$$ F_N(z) = 1 - [1 - F_{X_1}(z)][1 - F_{X_2}(z)] \\dots [1 - F_{X_n}(z)] $$
若 $X_1, \\dots, X_n$ 独立同分布于 $F(x)$，则：
$$ F_N(z) = 1 - [1 - F(z)] ^ n $$
      `
    }
  ]
};
