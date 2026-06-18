export const ch04Content = {
  sections: [
    {
      id: "4.1",
      title: "数学期望",
      content: `
数学期望（简称期望，又称均值）是概率论中最基本、应用最广泛的的数字特征之一。

### 1. 物理与几何直观意义
在物理学中，若我们将概率分布看作是一个质量分布，那么数学期望就对应于该系统的**质心 (Center of Mass)** 或 **重心 (Center of Gravity)**。几何上，它代表了概率密度曲线或概率质量分布的“平衡支点”。

<ManimAnimation src="/videos/ch04/expectation_gravity.mp4" title="期望与方差的物理几何直观意义" />

---

### 2. 数学定义

#### (1) 离散型随机变量的数学期望
设离散型随机变量 $X$ 的分布律为：
$$ P(X = x_k) = p_k, \\quad k = 1, 2, \\dots $$
若级数 $\\sum_{k=1}^{\\infty} x_k p_k$ 绝对收敛，即满足：
$$ \\sum_{k=1}^{\\infty} |x_k| p_k < \\infty $$
则称级数 $\\sum_{k=1}^{\\infty} x_k p_k$ 的和为随机变量 $X$ 的**数学期望 (Mathematical Expectation)**，记作 $E(X)$，即：
$$ E(X) = \\sum_{k=1}^{\\infty} x_k p_k $$

> **为什么要求“绝对收敛”？**
> 如果级数只条件收敛而不绝对收敛，根据微积分中的黎曼级数定理（Riemann Rearrangement Theorem），通过改变级数各项的相加顺序，可以使其收敛到任意实数，甚至发散。由于随机变量取值的“求和顺序”不应影响其平均值的物理本质，因此必须要求绝对收敛。若级数不绝对收敛，则称该随机变量的数学期望不存在。例如，柯西分布和圣彼得堡悖论中的随机变量均不存在数学期望。

#### (2) 连续型随机变量的数学期望
设连续型随机变量 $X$ 的概率密度函数为 $f(x)$。若广义积分 $\\int_{-\\infty}^{\\infty} x f(x) dx$ 绝对收敛，即满足：
$$ \\int_{-\\infty}^{\\infty} |x| f(x) dx < \\infty $$
则称该广义积分的值为随机变量 $X$ 的**数学期望**，记作 $E(X)$，即：
$$ E(X) = \\int_{-\\infty}^{\\infty} x f(x) dx $$

---

### 3. 随机变量函数的数学期望

#### 定理（LOTUS - 随机变量函数的期望公式）
设 $Y = g(X)$ 是随机变量 $X$ 的实值函数。
1. 若 $X$ 是离散型随机变量，其分布律为 $P(X=x_k)=p_k$。若级数 $\\sum_{k=1}^{\\infty} g(x_k) p_k$ 绝对收敛，则有：
   $$ E(g(X)) = \\sum_{k=1}^{\\infty} g(x_k) p_k $$
2. 若 $X$ 是连续型随机变量，其概率密度为 $f(x)$。若积分 $\\int_{-\\infty}^{\\infty} g(x) f(x) dx$ 绝对收敛，则有：
   $$ E(g(X)) = \\int_{-\\infty}^{\\infty} g(x) f(x) dx $$

> **LOTUS (Law of the Unconscious Statistician) 的核心意义**：
> 该定理表明，我们在计算随机变量函数 $g(X)$ 的期望时，**不需要**先去求出新随机变量 $Y = g(X)$ 的概率分布（这通常非常繁琐），而可以直接利用原随机变量 $X$ 的概率分布进行积分或求和。

#### 二维随机变量函数的数学期望
设 $Z = g(X,Y)$ 是二维随机变量 $(X,Y)$ 的函数。
1. 离散型：若联合分布律为 $P(X=x_i, Y=y_j) = p_{ij}$，则：
   $$ E(g(X,Y)) = \\sum_{i=1}^{\\infty} \\sum_{j=1}^{\\infty} g(x_i, y_j) p_{ij} $$
2. 连续型：若联合概率密度为 $f(x,y)$，则：
   $$ E(g(X,Y)) = \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} g(x,y) f(x,y) dx dy $$

---

### 4. 数学期望的数学性质
1. **常数的期望**：设 $C$ 是常数，则：
   $$ E(C) = C $$
2. **常数因子提出**：设 $C$ 是常数，则：
   $$ E(CX) = C E(X) $$
3. **期望的线性性质**：对任意两个随机变量 $X$ 和 $Y$，有：
   $$ E(X + Y) = E(X) + E(Y) $$
   该性质可以推广到任意有限个随机变量的线性组合：
   $$ E\\left( \\sum_{i=1}^n c_i X_i \\right) = \\sum_{i=1}^n c_i E(X_i) $$
   > **重要提醒**：线性性质的成立**不需要**随机变量之间相互独立！
4. **独立乘积性质**：若随机变量 $X$ 和 $Y$ 相互独立，则有：
   $$ E(XY) = E(X)E(Y) $$
   推广到 $n$ 个相互独立的随机变量，有：
   $$ E(X_1 X_2 \\dots X_n) = E(X_1) E(X_2) \\dots E(X_n) $$

---

### 5. 常见分布的数学期望及其严格推导

#### (1) 0-1分布
若 $X \\sim B(1, p)$，分布律为 $P(X=1)=p, P(X=0)=1-p$。
$$ E(X) = 1 \\cdot p + 0 \\cdot (1-p) = p $$

#### (2) 二项分布
若 $X \\sim B(n, p)$，可用**指示变量法**极速推导：
设 $X_i$ 为第 $i$ 次伯努利试验中事件 $A$ 发生的次数 ($X_i \\sim B(1, p)$)，则有 $X = \\sum_{i=1}^n X_i$。
利用期望的线性性质：
$$ E(X) = E\\left( \\sum_{i=1}^n X_i \\right) = \\sum_{i=1}^n E(X_i) = \\sum_{i=1}^n p = np $$

你可以调节下方二项分布的参数，观察其均值（期望）的移动：
<InteractiveDistribution type="binomial" n={20} p={0.5} />

#### (3) 泊松分布
若 $X \\sim P(\\lambda)$，其分布律为 $P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}$。
$$ E(X) = \\sum_{k=0}^{\\infty} k \\frac{\\lambda^k e^{-\\lambda}}{k!} = \\sum_{k=1}^{\\infty} \\frac{\\lambda^k e^{-\\lambda}}{(k-1)!} $$
令 $m = k-1$，则：
$$ E(X) = \\lambda e^{-\\lambda} \\sum_{m=0}^{\\infty} \\frac{\\lambda^m}{m!} = \\lambda e^{-\\lambda} e^{\\lambda} = \\lambda $$

#### (4) 均匀分布
若 $X \\sim U(a, b)$，概率密度为 $f(x) = \\frac{1}{b-a}$ ($a \\le x \\le b$)。
$$ E(X) = \\int_{a}^b x \\frac{1}{b-a} dx = \\frac{1}{b-a} \\left[ \\frac{1}{2} x^2 \\right]_a^b = \\frac{b^2 - a^2}{2(b-a)} = \\frac{a+b}{2} $$

#### (5) 指数分布
若 $X \\sim Exp(\\lambda)$ ($\\lambda > 0$)，概率密度为 $f(x) = \\lambda e^{-\\lambda x}$ ($x \\ge 0$)。
使用分部积分法：
$$ E(X) = \\int_{0}^{\\infty} x \\lambda e^{-\\lambda x} dx = \\left[ -x e^{-\\lambda x} \\right]_0^{\\infty} + \\int_{0}^{\\infty} e^{-\\lambda x} dx = 0 + \\left[ -\\frac{1}{\\lambda} e^{-\\lambda x} \\right]_0^{\\infty} = \\frac{1}{\\lambda} $$

#### (6) 正态分布
若 $X \\sim N(\\mu, \\sigma^2)$，其概率密度为 $f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$。
$$ E(X) = \\int_{-\\infty}^{\\infty} x \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}} dx $$
令 $t = \\frac{x-\\mu}{\\sigma}$，则 $x = \\sigma t + \\mu$，$dx = \\sigma dt$，代入得：
$$ E(X) = \\int_{-\\infty}^{\\infty} (\\sigma t + \\mu) \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{t^2}{2}} dt = \\sigma \\int_{-\\infty}^{\\infty} t \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{t^2}{2}} dt + \\mu \\int_{-\\infty}^{\\infty} \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{t^2}{2}} dt $$
根据奇偶性，第一项被积函数为奇函数，在对称区间上的积分为 0；第二项为标准正态分布的密度函数积分，值等于 1。所以：
$$ E(X) = 0 + \\mu \\cdot 1 = \\mu $$
      `,
    },
    {
      id: "4.2",
      title: "方差",
      content: `
数学期望刻画了随机变量取值的“中心位置”，但仅靠均值无法描述数据围绕均值波动的剧烈程度。为此我们引入**方差**。

### 1. 数学定义
设 $X$ 是一个随机变量，若 $E\\{[X-E(X)]^2\\}$ 存在，则称其为 $X$ 的**方差 (Variance)**，记作 $D(X)$ 或 $Var(X)$：
$$ D(X) = E\\{[X-E(X)]^2\\} $$
同时，称其算术平方根 $\\sigma(X) = \\sqrt{D(X)}$ 为随机变量 $X$ 的**标准差 (Standard Deviation)**。

---

### 2. 物理与几何直观意义
方差是刻画随机变量取值**分散程度（波动大小）**的数字特征。方差越大，说明随机变量取值偏离均值越远，分布越分散；方差越小，说明取值越集中在均值附近。
在物理学中，方差相当于概率质量分布关于质心（均值）的**转动惯量 (Moment of Inertia)**。

下面你可以调节正态分布的标准差 $\\sigma$，观察图形“胖瘦”和波动程度的关系：
<InteractiveDistribution type="normal" mean={0} stdDev={1} />

---

### 3. 计算公式
在实际计算中，我们常使用以下更方便的等价公式：
$$ D(X) = E(X^2) - [E(X)]^2 $$
> **证明**：
> 根据期望的线性性质展开定义式：
> $$ D(X) = E\\{[X - E(X)]^2\\} = E\\{X^2 - 2X E(X) + [E(X)]^2\\} $$
> 由于 $E(X)$ 是一个确定的实数常数，可直接移到期望符号外：
> $$ D(X) = E(X^2) - 2E(X)E(X) + [E(X)]^2 = E(X^2) - [E(X)]^2 $$

---

### 4. 方差的性质
1. **常数的方差为 0**：设 $C$ 是常数，则：
   $$ D(C) = 0 $$
   *(因为常数没有波动)*
2. **常数因子的平方提出**：设 $C$ 是常数，则：
   $$ D(CX) = C^2 D(X) $$
   进而有更通用的线性平移公式：
   $$ D(aX + b) = a^2 D(X) $$
3. **和差的方差公式**：设 $X, Y$ 是任意两个随机变量，则：
   $$ D(X \\pm Y) = D(X) + D(Y) \\pm 2 Cov(X,Y) $$
   特别地，若 $X$ 与 $Y$ **相互独立**（或不相关），则有：
   $$ D(X \\pm Y) = D(X) + D(Y) $$
   推广到 $n$ 个相互独立的随机变量，有：
   $$ D\\left( \\sum_{i=1}^n X_i \\right) = \\sum_{i=1}^n D(X_i) $$
4. **方差为 0 的充要条件**：
   $$ D(X) = 0 \\iff P(X = E(X)) = 1 $$
   即随机变量 $X$ 以概率 1 取常数值。

---

### 5. 常见分布的方差及其严格推导

#### (1) 0-1分布
若 $X \\sim B(1, p)$，已知 $E(X) = p$。由于 $X$ 只能取 $0$ 和 $1$，因此 $X^2 = X$。
$$ E(X^2) = E(X) = p $$
$$ D(X) = E(X^2) - [E(X)]^2 = p - p^2 = p(1-p) $$

#### (2) 二项分布
若 $X \\sim B(n, p)$，利用指示变量法：$X = \\sum_{i=1}^n X_i$。由于各次试验相互独立，因此指示变量 $X_i$ 之间相互独立。
$$ D(X) = D\\left( \\sum_{i=1}^n X_i \\right) = \\sum_{i=1}^n D(X_i) = \\sum_{i=1}^n p(1-p) = np(1-p) $$

#### (3) 泊松分布
若 $X \\sim P(\\lambda)$，已知 $E(X) = \\lambda$。我们先求 $E(X(X-1))$：
$$ E(X(X-1)) = \\sum_{k=0}^{\\infty} k(k-1) \\frac{\\lambda^k e^{-\\lambda}}{k!} = \\sum_{k=2}^{\\infty} \\frac{\\lambda^k e^{-\\lambda}}{(k-2)!} $$
令 $m = k-2$，则：
$$ E(X(X-1)) = \\lambda^2 e^{-\\lambda} \\sum_{m=0}^{\\infty} \\frac{\\lambda^m}{m!} = \\lambda^2 e^{-\\lambda} e^{\\lambda} = \\lambda^2 $$
根据期望的线性性质，$E(X^2) = E(X(X-1)) + E(X) = \\lambda^2 + \\lambda$。
$$ D(X) = E(X^2) - [E(X)]^2 = \\lambda^2 + \\lambda - \\lambda^2 = \\lambda $$

#### (4) 均匀分布
若 $X \\sim U(a, b)$，已知 $E(X) = \\frac{a+b}{2}$。先计算二阶矩：
$$ E(X^2) = \\int_{a}^b x^2 \\frac{1}{b-a} dx = \\frac{b^3 - a^3}{3(b-a)} = \\frac{a^2 + ab + b^2}{3} $$
代入方差公式：
$$ D(X) = \\frac{a^2 + ab + b^2}{3} - \\left(\\frac{a+b}{2}\\right)^2 = \\frac{4(a^2 + ab + b^2) - 3(a^2 + 2ab + b^2)}{12} = \\frac{a^2 - 2ab + b^2}{12} = \\frac{(b-a)^2}{12} $$

#### (5) 指数分布
若 $X \\sim Exp(\\lambda)$，已知 $E(X) = \\frac{1}{\\lambda}$。使用分部积分求二阶矩：
$$ E(X^2) = \\int_{0}^{\\infty} x^2 \\lambda e^{-\\lambda x} dx = \\left[ -x^2 e^{-\\lambda x} \\right]_0^{\\infty} + \\int_{0}^{\\infty} 2x e^{-\\lambda x} dx = 0 + \\frac{2}{\\lambda} E(X) = \\frac{2}{\\lambda^2} $$
$$ D(X) = E(X^2) - [E(X)]^2 = \\frac{2}{\\lambda^2} - \\frac{1}{\\lambda^2} = \\frac{1}{\\lambda^2} $$

#### (6) 正态分布
若 $X \\sim N(\\mu, \\sigma^2)$，已知 $E(X) = \\mu$。
$$ D(X) = E[(X-\\mu)^2] = \\int_{-\\infty}^{\\infty} (x-\\mu)^2 \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\mu)^2}{2\\sigma^2}} dx $$
令 $t = \\frac{x-\\mu}{\\sigma}$，则 $dx = \\sigma dt$，代入得：
$$ D(X) = \\sigma^2 \\int_{-\\infty}^{\\infty} t^2 \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{t^2}{2}} dt $$
使用分部积分法计算积分部分（将 $t e^{-t^2/2}$ 看作一项）：
$$ \\int_{-\\infty}^{\\infty} t^2 e^{-\\frac{t^2}{2}} dt = \\int_{-\\infty}^{\\infty} t d\\left(-e^{-\\frac{t^2}{2}}\\right) = \\left[ -t e^{-\\frac{t^2}{2}} \\right]_{-\\infty}^{\\infty} + \\int_{-\\infty}^{\\infty} e^{-\\frac{t^2}{2}} dt = 0 + \\sqrt{2\\pi} $$
将结果代回：
$$ D(X) = \\sigma^2 \\frac{1}{\\sqrt{2\\pi}} \\sqrt{2\\pi} = \\sigma^2 $$
      `,
    },
    {
      id: "4.3",
      title: "协方差及相关系数",
      content: `
对于单维随机变量，我们用期望和方差描述其均值与波动。而对于多维随机变量，我们需要定量刻画两个随机变量之间的**联合变化关系（关联程度）**。

### 1. 协方差 (Covariance)

#### 定义
设 $(X, Y)$ 是二维随机变量。若期望 $E\\{[X-E(X)][Y-E(Y)]\\}$ 存在，则称其为随机变量 $X$ 与 $Y$ 的**协方差 (Covariance)**，记作 $Cov(X,Y)$：
$$ Cov(X,Y) = E\\{[X-E(X)][Y-E(Y)]\\} $$

#### 协方差推导与简便计算公式
在实际应用中，我们使用下面的等价计算公式：
$$ Cov(X,Y) = E(XY) - E(X)E(Y) $$

下面是这一核心公式的严格分步推导过程：
<FormulaSteps formula="Cov(X,Y) = E(XY) - E(X)E(Y)" steps={[
  "根据协方差的原始定义，将括号内部乘积展开：Cov(X,Y) = E[ XY - X E(Y) - Y E(X) + E(X)E(Y) ]",
  "利用期望的线性性质，把期望符号 E 分别代入每一项：Cov(X,Y) = E(XY) - E(X E(Y)) - E(Y E(X)) + E(E(X)E(Y))",
  "由于 E(X) 和 E(Y) 都是确定性常数，可以移到期望符号外：Cov(X,Y) = E(XY) - E(Y)E(X) - E(X)E(Y) + E(X)E(Y)",
  "合并后两项同类项，正负抵消后即得最终公式：Cov(X,Y) = E(XY) - E(X)E(Y)"
]} />

#### 协方差的数学性质
1. **对称性**：$Cov(X,Y) = Cov(Y,X)$。
2. **常数提出**：对任意常数 $a, b$，有 $Cov(aX, bY) = ab Cov(X,Y)$。
3. **分配律**：$Cov(X_1 + X_2, Y) = Cov(X_1, Y) + Cov(X_2, Y)$。
4. **自协方差**：$Cov(X,X) = D(X)$。
5. **和差的方差与协方差**：
   $$ D(X \\pm Y) = D(X) + D(Y) \\pm 2 Cov(X,Y) $$

---

### 2. 相关系数 (Correlation Coefficient)

#### 定义
设随机变量 $X$ 与 $Y$ 的方差均大于 0，称：
$$ \\rho_{XY} = \\frac{Cov(X,Y)}{\\sqrt{D(X)D(Y)}} $$
为 $X$ 与 $Y$ 的**相关系数**（或 Pearson 相关系数），有时简记为 $\\rho$。

#### 相关系数的性质
1. **有界性**：
   $$ |\\rho_{XY}| \\le 1 $$
   *(该性质可由柯西-施瓦茨不等式严格证明)*。
2. **线性相关关系**：
   $$ |\\rho_{XY}| = 1 \\iff P(Y = aX + b) = 1 \\quad (a \\neq 0 \\text{ 为常数}) $$
   - 当 $\\rho_{XY} = 1$ 时，称 $X$ 与 $Y$ **完全正线性相关** ($a > 0$)。
   - 当 $\\rho_{XY} = -1$ 时，称 $X$ 与 $Y$ **完全负线性相关** ($a < 0$)。
   - 相关系数的大小 $|\\rho_{XY}|$ 直观上反映了 $X$ 与 $Y$ 之间的**线性关联紧密程度**。

---

### 3. “独立”与“不相关”的辩证关系

#### 不相关 (Uncorrelated) 的定义
若 $Cov(X,Y) = 0$（等价地，$\\rho_{XY} = 0$，或 $E(XY) = E(X)E(Y)$），则称 $X$ 与 $Y$ **不相关**。

#### 核心结论

1. **独立 $\\implies$ 不相关**：
   若 $X$ 与 $Y$ 独立，则它们必定不相关。
   > **证明**：若 $X$ 与 $Y$ 独立，则 $E(XY) = E(X)E(Y)$。
   > 代入协方差公式：$Cov(X,Y) = E(XY) - E(X)E(Y) = 0$，故相关系数 $\\rho_{XY} = 0$。

2. **不相关 $\\not\\implies$ 独立**：
   不相关仅仅说明两者之间不存在**线性**依赖关系，但可能存在非常强的**非线性**依赖（函数）关系。
   > **经典反例**：
   > 设随机变量 $X \\sim U(-1, 1)$，其概率密度为对称的。显然 $E(X) = 0$ 且 $E(X^3) = 0$。
   > 我们定义另一个随机变量 $Y = X^2$。显然 $Y$ 完全由 $X$ 决定，它们极度不独立。
   > 但是，我们来计算它们的协方差：
   > $$ E(XY) = E(X \\cdot X^2) = E(X^3) = 0 $$
   > $$ Cov(X,Y) = E(XY) - E(X)E(Y) = 0 - 0 \\cdot E(Y) = 0 $$
   > 因为 $Cov(X,Y) = 0$，所以 $X$ 与 $Y$ 不相关。
   > 这个例子生动地证明了：不相关不能推出独立。

3. **二维正态分布的特例**：
   若二维随机变量 $(X, Y)$ 服从二维正态分布，则 $X$ 与 $Y$ **独立** 与 **不相关** 是 **充分必要条件（完全等价）**。
   这是正态分布极其独特的优良数学特性，在实际考试中经常作为判断依据。
      `,
    },
    {
      id: "4.4",
      title: "矩、协方差矩阵",
      content: `
为了更加全面和系统地描述随机变量的分布形态，我们需要引入更高级的代数工具——**矩**，并将协方差的概念推广到多维随机向量，形成**协方差矩阵**。

### 1. 矩的概念 (Moments)
在力学中，矩用来描述力对物体旋转产生的效应。在概率论中，我们借用这一术语来系统地描述分布的代数特征：

- **$k$ 阶原点矩 (Raw Moment)**：
  $$ \\alpha_k = E(X^k), \\quad k = 1, 2, \\dots $$
  *(特别地，1 阶原点矩就是数学期望 $E(X)$)*
- **$k$ 阶中心矩 (Central Moment)**：
  $$ \\beta_k = E\\{[X - E(X)]^k\\}, \\quad k = 1, 2, \\dots $$
  *(特别地，2 阶中心矩就是方差 $D(X)$)*
- **$k+l$ 阶混合原点矩**：
  $$ \\mu_{kl} = E(X^k Y^l), \\quad k, l = 1, 2, \\dots $$
- **$k+l$ 阶混合中心矩**：
  $$ \\nu_{kl} = E\\{[X - E(X)]^k [Y - E(Y)]^l\\}, \\quad k, l = 1, 2, \\dots $$
  *(特别地，1+1 阶混合中心矩就是协方差 $Cov(X,Y)$)*

---

### 2. 协方差矩阵 (Covariance Matrix)

#### 定义
设 $n$ 维随机向量 $\\mathbf{X} = (X_1, X_2, \\dots, X_n)^T$。如果各个分量两两之间的协方差 $c_{ij} = Cov(X_i, X_j)$ 均存在，则称矩阵：
$$ \\mathbf{\\Sigma} = \\begin{pmatrix} c_{11} & c_{12} & \\dots & c_{1n} \\\\ c_{21} & c_{22} & \\dots & c_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ c_{n1} & c_{n2} & \\dots & c_{nn} \\end{pmatrix} $$
为随机向量 $\\mathbf{X}$ 的**协方差矩阵**，常记为 $\\mathbf{\\Sigma}$ 或 $Cov(\\mathbf{X})$。

#### 协方差矩阵的性质
1. **实对称矩阵**：因为 $c_{ij} = Cov(X_i, X_j) = Cov(X_j, X_i) = c_{ji}$，所以 $\\mathbf{\\Sigma}^T = \\mathbf{\\Sigma}$。
2. **对角线元素为方差**：主对角线上的第 $i$ 个元素为 $c_{ii} = Cov(X_i, X_i) = D(X_i)$。
3. **半正定性**：对任意实列向量 $\\mathbf{a} = (a_1, a_2, \\dots, a_n)^T \\neq \\mathbf{0}$，有：
   $$ \\mathbf{a}^T \\mathbf{\\Sigma} \\mathbf{a} = D\\left( \\sum_{i=1}^n a_i X_i \\right) \\ge 0 $$
   因此，协方差矩阵是**半正定矩阵**。如果分量之间不存在线性关系，则为**正定矩阵**。

---

### 3. 多维正态分布的矩阵表示
在矩阵代数的基础上，我们可以给出 $n$ 维正态随机向量 $\\mathbf{X} = (X_1, \\dots, X_n)^T \\sim N(\\boldsymbol{\mu}, \\mathbf{\\Sigma})$ 联合概率密度的紧凑形式：

$$ f(\\mathbf{x}) = \\frac{1}{(2\\pi)^{n/2} |\\mathbf{\\Sigma}|^{1/2}} \\exp\\left\\{ -\\frac{1}{2} (\\mathbf{x} - \\boldsymbol{\mu})^T \\mathbf{\\Sigma}^{-1} (\\mathbf{x} - \\boldsymbol{\mu}) \\right\\} $$

其中：
- $\\mathbf{x} = (x_1, x_2, \\dots, x_n)^T$ 是实数值向量。
- $\\boldsymbol{\mu} = (E(X_1), E(X_2), \\dots, E(X_n))^T$ 是均值向量。
- $\\mathbf{\\Sigma}$ 是 $\\mathbf{X}$ 的协方差矩阵（设其正定，从而行列式 $|\\mathbf{\\Sigma}| > 0$ 且逆矩阵 $\\mathbf{\\Sigma}^{-1}$ 存在）。

#### 多维正态分布的重要考点性质
1. **分量正态性**：若随机向量服从 $n$ 维正态分布，则它的任何一个子向量（包括每个分量 $X_i$）都服从相应低维的正态分布。
2. **独立与不相关等价**：对于多维正态分布而言，分量之间**相互独立**等价于它们的**协方差矩阵对角化**（即所有非对角线元素均为 0）。
3. **线性组合不变性**：设 $\\mathbf{X} \\sim N(\\boldsymbol{\mu}, \\mathbf{\\Sigma})$，$\\mathbf{A}$ 是 $m \\times n$ 阶实常数矩阵，$\\mathbf{b}$ 是 $m$ 维实常数向量，则线性变换后得到的随机向量 $\\mathbf{Y} = \\mathbf{A}\\mathbf{X} + \\mathbf{b}$ 依然服从 $m$ 维正态分布：
   $$ \\mathbf{Y} \\sim N(\\mathbf{A}\\boldsymbol{\mu} + \\mathbf{b}, \\mathbf{A}\\mathbf{\\Sigma}\\mathbf{A}^T) $$
      `,
    }
  ]
};
