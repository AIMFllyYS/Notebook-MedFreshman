export const ch07Content = {
  sections: [
    {
      id: "7.1",
      title: "点估计",
      content: `
在实际问题中，由于各种限制，我们往往无法对总体的所有个体进行全面调查，而只能通过抽样得到部分样本观测值 $x_1, x_2, \\dots, x_n$。**参数估计 (Parameter Estimation)** 就是利用样本观测值去推断总体分布中所包含的未知参数或参数的函数。

参数估计分为**点估计**和**区间估计**。本节我们主要探讨点估计。

### 1. 点估计的基本概念
设总体 $X$ 的分布函数形式 $F(x; \\theta)$ 为已知，但其中含有一个或多个未知参数 $\\theta$（$\\theta$ 属于参数空间 $\\Theta$）。
- **点估计 (Point Estimation)**：构造一个统计量 $\\hat{\\theta} = \\hat{\\theta}(X_1, X_2, \\dots, X_n)$，用它的观测值 $\\hat{\\theta}(x_1, x_2, \\dots, x_n)$ 作为未知参数 $\\theta$ 的近似值。
- **估计量 (Estimator)**：用于估计未知参数的统计量 $\\hat{\\theta}(X_1, X_2, \\dots, X_n)$。它是一个随机变量。
- **估计值 (Estimate)**：估计量在具体样本观测值下的取值 $\\hat{\\theta}(x_1, x_2, \\dots, x_n)$。它是一个具体的数值。

---

### 2. 矩估计法 (Method of Moments)
矩估计法是由英国统计学家卡尔·皮尔逊 (Karl Pearson) 最先提出的。其核心思想基于**辛钦大数定律**：当样本容量 $n$ 足够大时，样本的原点矩在概率上收敛于相应的总体原点矩。因此，我们可以用样本矩作为总体矩的估计，并以此求解未知参数。

#### 矩估计法的具体步骤
设总体 $X$ 的分布中含有 $m$ 个未知参数 $\\theta_1, \\dots, \\theta_m$。
1. 计算总体的低阶原点矩：
   $$ \\mu_k = E(X^k) = g_k(\\theta_1, \\theta_2, \\dots, \\theta_m), \\quad k = 1, 2, \\dots, m $$
2. 计算样本的低阶原点矩：
   $$ A_k = \\frac{1}{n} \\sum_{i=1}^n X_i^k, \\quad k = 1, 2, \\dots, m $$
3. 建立方程组，令总体矩等于样本矩：
   $$ g_k(\\theta_1, \\theta_2, \\dots, \\theta_m) = A_k, \\quad k = 1, 2, \\dots, m $$
4. 从此方程组中解出 $\\theta_1, \\dots, \\theta_m$。解得的 $\\hat{\\theta}_j = h_j(A_1, \\dots, A_m)$ 即为参数 $\\theta_j$ 的**矩估计量**。

#### 经典例题
**例 1**：设总体 $X \\sim U[a, b]$，其中 $a, b$ 为未知参数。求 $a$ 和 $b$ 的矩估计量。

**解**：
首先求出总体的一阶矩和二阶中心矩（方差）：
$$ E(X) = \\frac{a+b}{2}, \\quad D(X) = \\frac{(b-a)^2}{12} $$
用样本均值 $\\bar{X}$ 代替 $E(X)$，用样本二阶中心矩（样本方差的偏差版本）$S_0^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$ 代替 $D(X)$，建立方程组：
$$ \\frac{a+b}{2} = \\bar{X} $$
$$ \\frac{(b-a)^2}{12} = S_0^2 $$
由第二式得 $b - a = 2\\sqrt{3}S_0$（因为 $b > a$），联立第一式解得：
$$ \\hat{a} = \\bar{X} - \\sqrt{3}S_0, \\quad \\hat{b} = \\bar{X} + \\sqrt{3}S_0 $$
其中 $S_0 = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}$。这就是 $a, b$ 的矩估计量。

---

### 3. 最大似然估计法 (Maximum Likelihood Estimation, MLE)
最大似然估计法是由英国统计学家费希尔 (R. A. Fisher) 提出的。其基本思想是：在一次试验中，如果某个结果出现了，那么这个结果在所有可能的结果中发生的概率应当是最大的。因此，我们选择使当前观测样本出现概率达到最大的参数值，作为未知参数的估计。

#### 似然函数 (Likelihood Function)
设 $X_1, X_2, \\dots, X_n$ 是来自总体 $X$ 的简单随机样本，其观测值为 $x_1, x_2, \\dots, x_n$。
- **离散型总体**：设其分布律为 $P(X = x) = p(x; \\theta)$，称如下积函数为似然函数：
  $$ L(\\theta) = L(x_1, x_2, \\dots, x_n; \\theta) = \\prod_{i=1}^n p(x_i; \\theta) $$
- **连续型总体**：设其概率密度为 $f(x; \\theta)$，称如下积函数为似然函数：
  $$ L(\\theta) = L(x_1, x_2, \\dots, x_n; \\theta) = \\prod_{i=1}^n f(x_i; \\theta) $$

#### 最大似然估计的计算步骤
为了求出使 $L(\\theta)$ 达到最大值的 $\\hat{\\theta}$，通常按照以下步骤：
1. 写出似然函数 $L(\\theta)$。
2. 对 $L(\\theta)$ 取对数，得到对数似然函数 $\\ln L(\\theta)$。
3. 若对数似然函数关于 $\\theta$ 可导，求导数并令其为 0，建立**似然方程**：
   $$ \\frac{d}{d\\theta} \\ln L(\\theta) = 0 $$
   （若有多个未知参数，则建立偏导数方程组：$\\frac{\\partial}{\\partial\\theta_j} \\ln L(\\theta_1, \\dots, \\theta_m) = 0$）
4. 解似然方程，得到最大似然估计值 $\\hat{\\theta}$。

下面我们通过交互推导卡片来学习指数分布和正态分布的最大似然估计求法。

#### 指数分布的最大似然估计推导
<FormulaSteps formula="\\hat{\\lambda}_{MLE} = \\frac{1}{\\bar{X}}" steps={[
  "写出指数分布的概率密度函数：f(x; \\lambda) = \\lambda e^{-\\lambda x} \\ (x > 0)。对独立同分布样本 x_1, \\dots, x_n，写出似然函数 L(\\lambda) = \\prod_{i=1}^n f(x_i; \\lambda) = \\lambda^n e^{-\\lambda \\sum_{i=1}^n x_i}。",
  "对似然函数两边取自然对数，得到对数似然函数：\\ln L(\\lambda) = n \\ln \\lambda - \\lambda \\sum_{i=1}^n x_i。",
  "对对数似然函数求关于参数 \\lambda 的一阶导数：\\frac{d}{d\\lambda} \\ln L(\\lambda) = \\frac{n}{\\lambda} - \\sum_{i=1}^n x_i。",
  "令一阶导数为 0（即建立似然方程）：\\frac{n}{\\lambda} - \\sum_{i=1}^n x_i = 0，求出驻点值 \\hat{\\lambda} = \\frac{n}{\\sum_{i=1}^n x_i} = \\frac{1}{\\bar{x}}。",
  "求二阶导数：\\frac{d^2}{d\\lambda^2} \\ln L(\\lambda) = -\\frac{n}{\\lambda^2} < 0。由于二阶导数恒小于 0，说明该驻点确实是最大值点。因此，\\lambda 的最大似然估计量为 \\hat{\\lambda}_{MLE} = \\frac{1}{\\bar{X}}。"
]} />

#### 正态分布参数的最大似然估计推导
<FormulaSteps formula="\\hat{\\mu} = \\bar{X}, \\quad \\hat{\\sigma}^2 = \\frac{1}{n} \\sum_{i=1}^n (X_i - \\bar{X})^2" steps={[
  "正态分布 N(\\mu, \\sigma^2) 的概率密度函数为 f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}。建立联合似然函数：L(\\mu, \\sigma^2) = \\prod_{i=1}^n \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x_i-\\mu)^2}{2\\sigma^2}} = (2\\pi\\sigma^2)^{-\\frac{n}{2}} e^{-\\sum_{i=1}^n \\frac{(x_i-\\mu)^2}{2\\sigma^2}}。",
  "取自然对数，得到对数似然函数：\\ln L(\\mu, \\sigma^2) = -\\frac{n}{2}\\ln(2\\pi) - \\frac{n}{2}\\ln(\\sigma^2) - \\frac{1}{2\\sigma^2}\\sum_{i=1}^n (x_i - \\mu)^2。",
  "对未知参数 \\mu 和 \\sigma^2 分别求偏导数：\\frac{\\partial}{\\partial\\mu} \\ln L = \\frac{1}{\\sigma^2}\\sum_{i=1}^n (x_i-\\mu)；\\frac{\\partial}{\\partial(\\sigma^2)} \\ln L = -\\frac{n}{2\\sigma^2} + \\frac{1}{2(\\sigma^2)^2}\\sum_{i=1}^n (x_i-\\mu)^2。",
  "令两个偏导数分别等于 0 建立似然方程组。由第一个方程 \\sum_{i=1}^n (x_i-\\mu) = 0 解得 \\hat{\\mu} = \\bar{x}。",
  "将 \\hat{\\mu} = \\bar{x} 代入第二个方程，得到 -\\frac{n}{2\\sigma^2} + \\frac{1}{2(\\sigma^2)^2}\\sum_{i=1}^n (x_i-\\bar{x})^2 = 0，解得 \\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i=1}^n (x_i-\\bar{x})^2。",
  "由此可得参数 \\mu 和 \\sigma^2 的最大似然估计量分别为：\\hat{\\mu}_{MLE} = \\bar{X}，\\hat{\\sigma}^2_{MLE} = \\frac{1}{n}\\sum_{i=1}^n (X_i-\\bar{X})^2。"
]} />

---

### 4. 边界参数的 MLE（求导失效的情形）
在一些分布中，总体的取值范围依赖于未知参数。此时，似然函数在边界处不连续或不可导，不能通过求导数来求解最大似然估计。此时需要利用**单调性**和**边界条件**直接求解。

**例 2**：设总体 $X \\sim U[0, \\theta]$，其中 $\\theta > 0$ 未知。求 $\\theta$ 的最大似然估计量。

**解**：
总体的概率密度为：
$$ f(x; \\theta) = \\begin{cases} \\frac{1}{\\theta}, & 0 \\le x \\le \\theta \\\\ 0, & \\text{其他} \\end{cases} $$
因此，似然函数为：
$$ L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta) = \\begin{cases} \\frac{1}{\\theta^n}, & 0 \\le x_1, x_2, \\dots, x_n \\le \\theta \\\\ 0, & \\text{其他} \\end{cases} $$
分析条件 $0 \\le x_i \\le \\theta \\ (i=1, \\dots, n)$ 可知，这等价于 $\\theta \\ge \\max(x_1, \\dots, x_n)$ 且所有 $x_i \\ge 0$。
记 $x_{(n)} = \\max(x_1, \\dots, x_n)$ 为样本的最大观测值（即顺序统计量 $X_{(n)}$ 的值）。
则当 $\\theta \\ge x_{(n)}$ 时，$L(\\theta) = \\theta^{-n}$。
因为 $\\theta^{-n}$ 在区间 $[x_{(n)}, +\\infty)$ 上是关于 $\\theta$ 的单调递减函数，所以为了使 $L(\\theta)$ 取得最大值，$\\theta$ 应当取其定义域内的最小值。
即：
$$ \\hat{\\theta}_{MLE} = x_{(n)} = \\max(x_1, x_2, \\dots, x_n) $$
所以，$\\theta$ 的最大似然估计量为：
$$ \\hat{\\theta}_{MLE} = X_{(n)} = \\max(X_1, X_2, \\dots, X_n) $$

---

### 5. 最大似然估计的单值不变性 (Invariance Property)
最大似然估计具有一个非常优良的性质：若 $\\hat{\\theta}$ 是参数 $\\theta$ 的最大似然估计，且函数 $g(\\theta)$ 是连续的，则 $g(\\hat{\\theta})$ 也是 $g(\\theta)$ 的最大似然估计。

例如，在正态总体 $N(\\mu, \\sigma^2)$ 中，$\\sigma^2$ 的最大似然估计为 $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum (X_i - \\bar{X})^2$，那么总体标准差 $\\sigma$ 的最大似然估计就是：
$$ \\hat{\\sigma} = \\sqrt{\\hat{\\sigma}^2} = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2} $$
      `
    },
    {
      id: "7.2",
      title: "估计量的评选标准",
      content: `
对于同一个参数，采用不同的估计方法（如矩估计法 and 最大似然估计法）可能得到不同的估计量。即使同一种方法，也可能存在多种可行的估计量。为了衡量估计量的优劣，统计学中提出了几个主要的评选标准：**无偏性**、**有效性**和**一致性 (相合性)**。

### 1. 无偏性 (Unbiasedness)
由于样本是随机的，估计量 $\\hat{\\theta} = \\hat{\\theta}(X_1, \\dots, X_n)$ 也是一个随机变量。如果对于不同的样本，估计量的值在未知参数的真实值周围波动，且平均而言等于真实值，那么这个估计量就是无偏的。

#### 定义
设 $\\hat{\\theta}$ 是未知参数 $\\theta$ 的估计量。若对任意 $\\theta \\in \\Theta$，都有：
$$ E(\\hat{\\theta}) = \\theta $$
则称 $\\hat{\\theta}$ 是 $\\theta$ 的**无偏估计量 (Unbiased Estimator)**。否则称为有偏估计。

#### 经典结论及其推导
1. **样本均值 $\\bar{X}$ 是总体期望 $\\mu$ 的无偏估计**：
   $$ E(\\bar{X}) = E\\left( \\frac{1}{n} \\sum_{i=1}^n X_i \\right) = \\frac{1}{n} \\sum_{i=1}^n E(X_i) = \\frac{1}{n} \\cdot n\\mu = \\mu $$
   这表明，无论总体服从何种分布（只要均值存在），样本均值永远是总体均值的无偏估计。

2. **样本方差 $S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$ 是总体方差 $\\sigma^2$ 的无偏估计**：
   这是期末考试与考研中最常考的经典推导之一。
   我们需要证明 $E(S^2) = \\sigma^2$。
   首先将偏差项进行恒等变形：
   $$ X_i - \\bar{X} = (X_i - \\mu) - (\\bar{X} - \\mu) $$
   两边平方并求和：
   $$ \\sum_{i=1}^n (X_i - \\bar{X})^2 = \\sum_{i=1}^n \\left[ (X_i - \\mu) - (\\bar{X} - \\mu) \\right]^2 = \\sum_{i=1}^n (X_i - \\mu)^2 - 2(\\bar{X} - \\mu)\\sum_{i=1}^n (X_i - \\mu) + n(\\bar{X} - \\mu)^2 $$
   注意到 $\\sum_{i=1}^n (X_i - \\mu) = n(\\bar{X} - \\mu)$，代入上式化简得：
   $$ \\sum_{i=1}^n (X_i - \\bar{X})^2 = \\sum_{i=1}^n (X_i - \\mu)^2 - n(\\bar{X} - \\mu)^2 $$
   两边取期望：
   $$ E\\left[ \\sum_{i=1}^n (X_i - \\bar{X})^2 \\right] = \\sum_{i=1}^n E\\left[ (X_i - \\mu)^2 \\right] - n E\\left[ (\\bar{X} - \\mu)^2 \\right] $$
   根据方差定义，对于独立同分布的样本：
   - $E[(X_i - \\mu)^2] = D(X_i) = \\sigma^2$
   - $E[(\bar{X} - \\mu)^2] = D(\\bar{X}) = \\frac{\\sigma^2}{n}$
   因此：
   $$ E\\left[ \\sum_{i=1}^n (X_i - \\bar{X})^2 \\right] = n\\sigma^2 - n \\left(\\frac{\\sigma^2}{n}\\right) = (n-1)\\sigma^2 $$
   所以：
   $$ E(S^2) = E\\left[ \\frac{1}{n-1} \\sum_{i=1}^n (X_i - \\bar{X})^2 \\right] = \\frac{1}{n-1} (n-1)\\sigma^2 = \\sigma^2 $$
   这就证明了为什么样本方差分母必须是 $n-1$ 才能保证无偏性。
   
   > **注意**：我们通过矩估计和MLE得到的方差估计量 $S_0^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$ 的期望是 $E(S_0^2) = \\frac{n-1}{n}\\sigma^2$。因此，$S_0^2$ 是有偏估计（收缩偏差）。

---

### 2. 有效性 (Efficiency)
当同一个参数存在多个无偏估计量时，我们显然希望估计量的波动越小越好。**有效性**就是通过比较无偏估计量的**方差**来评价其优劣。

#### 定义
设 $\\hat{\\theta}_1$ 和 $\\hat{\\theta}_2$ 是未知参数 $\\theta$ 的两个无偏估计量。若对任意 $\\theta \\in \\Theta$，有：
$$ D(\\hat{\\theta}_1) \\le D(\\hat{\\theta}_2) $$
且至少存在一个 $\\theta$ 使等号不成立，则称 $\\hat{\\theta}_1$ 比 $\\hat{\\theta}_2$ **更有效 (More Efficient)**。

在所有无偏估计量中，方差达到最小的估计量称为**最小方差无偏估计量 (Minimum Variance Unbiased Estimator, MVUE)**。

---

### 3. 一致性 / 相合性 (Consistency)
无偏性和有效性都是在样本容量 $n$ 固定时评估估计量的标准。而**一致性**是当样本容量 $n \\to \\infty$ 时的极限性质（大样本性质）。

#### 定义
设 $\\hat{\\theta}_n = \\hat{\\theta}_n(X_1, \\dots, X_n)$ 是参数 $\\theta$ 的估计量。若对于任意给定的 $\\varepsilon > 0$，有：
$$ \\lim_{n \\to \\infty} P(|\\hat{\\theta}_n - \\theta| < \\varepsilon) = 1 $$
即当 $n \\to \\infty$ 时，$\\hat{\\theta}_n$ 依概率收敛于 $\\theta$（记为 $\\hat{\\theta}_n \\xrightarrow{P} \\theta$），则称 $\\hat{\\theta}_n$ 是 $\\theta$ 的**一致估计量**或**相合估计量**。

例如，由辛钦大数定律可得，样本均值 $\\bar{X}$ 是总体均值 $\\mu$ 的一致估计量。样本方差 $S^2$ 也是总体方差 $\\sigma^2$ 的一致估计量。
      `
    },
    {
      id: "7.3",
      title: "区间估计",
      content: `
点估计只给出了未知参数的一个具体数值，但没有指出这个估计的精确度和可信程度。在实际应用中，我们不仅需要给出估计值，还希望能给出一个范围，并说明这个未知参数落在此范围内的概率（即可信度）。这就是**区间估计**。

### 1. 区间估计的基本概念
设总体 $X$ 的未知参数为 $\\theta$。若对于给定的显著性水平 $\\alpha \\ (0 < \\alpha < 1)$，有两个统计量 $\\underline{\\theta} = \\underline{\\theta}(X_1, \\dots, X_n)$ 和 $\\overline{\\theta} = \\overline{\\theta}(X_1, \\dots, X_n)$ 满足：
$$ P(\\underline{\\theta} \\le \\theta \\le \\overline{\\theta}) \\ge 1 - \\alpha $$
则称随机区间 $[\\underline{\\theta}, \\overline{\\theta}]$ 是 $\\theta$ 的**置信区间 (Confidence Interval)**。
- $1 - \\alpha$ 称为**置信度**或**置信水平**（通常取 0.95 或 0.99）。
- $\\underline{\\theta}$ and $\\overline{\\theta}$ 分别称为置信区间的**置信下限** and **置信上限**。

#### 置信区间的几何直观与概率含义
对于一个确定的置信区间，例如在一次具体抽样中算得区间为 $[2.5, 4.8]$，我们**不能**说“未知参数 $\\theta$ 落在区间 $[2.5, 4.8]$ 的概率为 95%”。因为真实参数 $\\theta$ 是一个**固定常数**，而区间 $[2.5, 4.8]$ 也是**确定区间**，$\\theta$ 要么在里面（概率为 1），要么不在里面（概率为 0）。

95% 置信水平的真实含义是：如果进行多次重复抽样，每次抽样都构造一个置信区间，那么在大量的这些区间中，约有 95% 的区间会包含参数 $\\theta$ 的真实值。
我们通过以下动画来建立这一几何直观。

<ManimAnimation src="/videos/ch07/confidence_interval.mp4" title="置信区间的几何直观与覆盖率模拟" />

---

### 2. 构造置信区间的核心方法：枢轴量法 (Pivotal Quantity Method)
枢轴量法是构造置信区间最通用的方法。具体步骤如下：
1. **构造枢轴量**：找一个包含未知参数 $\\theta$ 以及样本 $X_1, \\dots, X_n$ 的随机变量 $G(X_1, \\dots, X_n; \\theta)$，使得它的分布是**完全确定的**，且不依赖于任何未知参数。
2. **确定分位数**：对于给定的置信度 $1-\\alpha$，根据 $G$ 的分布确定常数 $a$ 和 $b$，使得：
   $$ P(a \\le G(X_1, \\dots, X_n; \\theta) \\le b) = 1 - \\alpha $$
   （为了使区间长度尽量小，对于对称分布通常取对称的临界值，即双侧分位数）。
3. **求解不等式**：将不等式 $a \\le G(X_1, \\dots, X_n; \\theta) \\le b$ 进行代数变形，解出未知参数 $\\theta$，得到：
   $$ P(\\underline{\\theta} \\le \\theta \\le \\overline{\\theta}) = 1 - \\alpha $$
   则 $[\\underline{\\theta}, \\overline{\\theta}]$ 即为所求的置信区间。

---

### 3. 单个正态总体参数的区间估计
设总体 $X \\sim N(\\mu, \\sigma^2)$，样本为 $X_1, \\dots, X_n$，样本均值为 $\\bar{X}$，样本标准差为 $S$。我们分四种情形讨论：

#### 情形一：已知方差 $\\sigma^2$，求均值 $\\mu$ 的置信区间
由于 $\\sigma^2$ 已知，我们用标准化变量作为枢轴量：
$$ G(X_1, \\dots, X_n; \\mu) = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\sim N(0, 1) $$
对于置信度 $1-\\alpha$，由标准正态分布的对称性，我们取双侧临界值 $z_{\\alpha/2}$ 满足 $P(|Z| \\le z_{\\alpha/2}) = 1-\\alpha$。
$$ P\\left( -z_{\\alpha/2} \\le \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\le z_{\\alpha/2} \\right) = 1 - \\alpha $$
解此不等式得：
$$ P\\left( \\bar{X} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right) = 1 - \\alpha $$
因此，$\\mu$ 的置信区间为：
$$ \\left[ \\bar{X} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}, \\ \\bar{X} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right] $$

你可以观察正态分布图表，理解其概率密度分布和置信水平的关联：
<InteractiveDistribution type="normal" mean={0} stdDev={1} />

#### 情形二：未知方差 $\\sigma^2$，求均值 $\\mu$ 的置信区间
由于 $\\sigma^2$ 未知，我们不能使用标准正态分布，而需要用样本方差 $S^2$ 代替 $\\sigma^2$。构造枢轴量：
$$ G(X_1, \\dots, X_n; \\mu) = \\frac{\\bar{X} - \\mu}{S / \\sqrt{n}} \\sim t(n-1) $$
该随机变量服从自由度为 $n-1$ 的 $t$ 分布。对于置信度 $1-\\alpha$，取双侧临界值 $t_{\\alpha/2}(n-1)$。
$$ P\\left( -t_{\\alpha/2}(n-1) \\le \\frac{\\bar{X} - \\mu}{S / \\sqrt{n}} \\le t_{\\alpha/2}(n-1) \\right) = 1 - \\alpha $$
解此不等式，可得 $\\mu$ 的置信区间为：
$$ \\left[ \\bar{X} - t_{\\alpha/2}(n-1) \\frac{S}{\\sqrt{n}}, \\ \\bar{X} + t_{\\alpha/2}(n-1) \\frac{S}{\\sqrt{n}} \\right] $$

#### 情形三：未知均值 $\\mu$，求方差 $\\sigma^2$ 的置信区间
我们利用样本方差的抽样分布定理，构造枢轴量：
$$ G(X_1, \\dots, X_n; \\sigma^2) = \\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1) $$
该变量服从自由度为 $n-1$ 的卡方分布。由于卡方分布不对称，我们取双侧分位数 $\\chi^2_{1-\\alpha/2}(n-1)$ 和 $\\chi^2_{\\alpha/2}(n-1)$：
$$ P\\left( \\chi^2_{1-\\alpha/2}(n-1) \\le \\frac{(n-1)S^2}{\\sigma^2} \\le \\chi^2_{\\alpha/2}(n-1) \\right) = 1 - \\alpha $$
取倒数并整理不等式方向，解得 $\\sigma^2$ 的置信区间为：
$$ \\left[ \\frac{(n-1)S^2}{\\chi^2_{\\alpha/2}(n-1)}, \\ \\frac{(n-1)S^2}{\\chi^2_{1-\\alpha/2}(n-1)} \\right] $$

#### 情形四：已知均值 $\\mu$，求方差 $\\sigma^2$ 的置信区间
若均值 $\\mu$ 已知，我们无需估计均值，直接构造枢轴量：
$$ G(X_1, \\dots, X_n; \\sigma^2) = \\sum_{i=1}^n \\frac{(X_i - \\mu)^2}{\\sigma^2} \\sim \\chi^2(n) $$
此时自由度为 $n$（因为没有因估计 $\\mu$ 而损失自由度）。同理可解得置信区间为：
$$ \\left[ \\frac{\\sum_{i=1}^n (X_i - \\mu)^2}{\\chi^2_{\\alpha/2}(n)}, \\ \\frac{\\sum_{i=1}^n (X_i - \\mu)^2}{\\chi^2_{1-\\alpha/2}(n)} \\right] $$

---

### 4. 两个独立正态总体参数的区间估计
设有两个独立正态总体 $X \\sim N(\\mu_1, \\sigma_1^2)$，其样本容量为 $n_1$；$Y \\sim N(\\mu_2, \\sigma_2^2)$，其样本容量为 $n_2$。

#### 两个总体均值差 $\\mu_1 - \\mu_2$ 的置信区间
1. **已知方差 $\\sigma_1^2, \\sigma_2^2$**：
   选择枢轴量 $Z = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_1 - \\mu_2)}{\\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}} \\sim N(0, 1)$。
   置信区间为：
   $$ \\left[ (\\bar{X} - \\bar{Y}) \\pm z_{\\alpha/2} \\sqrt{\\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}} \\right] $$

2. **未知方差但假设 $\\sigma_1^2 = \\sigma_2^2 = \\sigma^2$**：
   引入两样本合并方差估计（联合方差）：
   $$ S_p^2 = \\frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1+n_2-2} $$
   构造枢轴量 $t = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_1 - \\mu_2)}{S_p \\sqrt{1/n_1 + 1/n_2}} \\sim t(n_1+n_2-2)$。
   置信区间为：
   $$ \\left[ (\\bar{X} - \\bar{Y}) \\pm t_{\\alpha/2}(n_1+n_2-2) S_p \\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}} \\right] $$

#### 两个总体方差比 $\\sigma_1^2 / \\sigma_2^2$ 的置信区间（均值未知）
构造比值型枢轴量：
$$ G = \\frac{S_1^2 / \\sigma_1^2}{S_2^2 / \\sigma_2^2} = \\frac{S_1^2}{S_2^2} \\cdot \\frac{\\sigma_2^2}{\\sigma_1^2} \\sim F(n_1-1, n_2-1) $$
服从自由度为 $(n_1-1, n_2-1)$ 的 $F$ 分布。对于置信度 $1-\\alpha$，有：
$$ P\\left( F_{1-\\alpha/2}(n_1-1, n_2-1) \\le \\frac{S_1^2}{S_2^2} \\cdot \\frac{\\sigma_2^2}{\\sigma_1^2} \\le F_{\\alpha/2}(n_1-1, n_2-1) \\right) = 1 - \\alpha $$
解出 $\\sigma_1^2 / \\sigma_2^2$ 得到其置信区间：
$$ \\left[ \\frac{S_1^2}{S_2^2} \\frac{1}{F_{\\alpha/2}(n_1-1, n_2-1)}, \\ \\frac{S_1^2}{S_2^2} \\frac{1}{F_{1-\\alpha/2}(n_1-1, n_2-1)} \\right] $$
利用性质 $F_{1-\\alpha/2}(d_1, d_2) = \\frac{1}{F_{\\alpha/2}(d_2, d_1)}$，可以写为：
$$ \\left[ \\frac{S_1^2}{S_2^2} \\frac{1}{F_{\\alpha/2}(n_1-1, n_2-1)}, \\ \\frac{S_1^2}{S_2^2} F_{\\alpha/2}(n_2-1, n_1-1) \\right] $$
      `
    }
  ]
};
