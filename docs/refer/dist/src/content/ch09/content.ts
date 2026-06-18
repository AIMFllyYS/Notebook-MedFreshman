export const ch09Content = {
  sections: [
    {
      id: "9.1",
      title: "单因素方差分析",
      content: `
在实际生产和科研中，我们经常需要研究某些因素（如不同工艺条件、不同原料配比、不同施肥量等）对某个观测指标（如产量、寿命、纯度等）的影响。这些因素可能会有多个不同的状态，我们称为**水平**。单因素方差分析 (One-Way Analysis of Variance, ANOVA) 就是用来检验一个因素的多个水平之间，其总体均值是否存在显著差异的统计方法。

### 1. 偏差分析与模型假设

设我们要考察一个因素 $A$，它有 $k$ 个不同的水平：$A_1, A_2, \\dots, A_k$。
在水平 $A_i$ ($i = 1, 2, \\dots, k$) 下，我们进行 $n_i$ 次独立重复试验，得到的观测数据为 $X_{i1}, X_{i2}, \\dots, X_{in_i}$。
总观测次数为：
$$ n = \\sum_{i=1}^k n_i $$

为了能进行定量的统计推断，单因素方差分析模型建立在以下三个基本假设之上：
1. **独立性假设**：所有观测值 $X_{ij}$ ($i = 1, \\dots, k; j = 1, \\dots, n_i$) 相互独立。
2. **正态性假设**：在每个水平 $A_i$ 下的总体都服从正态分布，即：
   $$ X_{ij} \\sim N(\\mu_i, \\sigma^2), \\quad j = 1, 2, \\dots, n_i $$
3. **方差齐性假设**：各个水平下的总体方差相同，即：
   $$ D(X_{ij}) = \\sigma^2, \\quad i = 1, 2, \\dots, k $$

这三个假设（独立性、正态性、方差齐性）是方差分析的理论基石，在实际应用中需要通过残差分析或方差齐性检验进行验证。

---

### 2. 基本统计模型与假设检验

我们将每个水平下的均值 $\\mu_i$ 分解为总均值 $\\mu$ 与水平效应 $\\delta_i$ 的和。
定义全体总均值 $\\mu$（加权均值）为：
$$ \\mu = \\frac{1}{n} \\sum_{i=1}^k n_i \\mu_i $$
水平 $A_i$ 的效应定义为该水平的均值与总均值之差：
$$ \\delta_i = \\mu_i - \\mu $$
显然，效应满足约束条件：
$$ \\sum_{i=1}^k n_i \\delta_i = 0 $$

此时，观测值 $X_{ij}$ 可以表示为如下线性模型：
$$ X_{ij} = \\mu + \\delta_i + \\epsilon_{ij} $$
其中，$\\epsilon_{ij}$ 是随机误差，代表未加控制的随机波动，满足：
$$ \\epsilon_{ij} \\stackrel{\\text{i.i.d.}}{\\sim} N(0, \\sigma^2) $$

我们的目标是检验因素 $A$ 的不同水平对观测指标是否有显著影响。如果有显著影响，说明不同水平下的均值 $\\mu_i$ 不全相等，即效应 $\\delta_i$ 不全为 0。因此，建立假设检验：
- **原假设 $H_0$**：$\\delta_1 = \\delta_2 = \\dots = \\delta_k = 0$ (各水平均值无显著差异，即因素 $A$ 对指标无显著影响)
- **备择假设 $H_1$**：$\\delta_1, \\delta_2, \\dots, \\delta_k$ 不全为 0 (各水平均值有显著差异，即因素 $A$ 对指标有显著影响)

---

### 3. 偏差平方和的分解（核心数学定理）

为了构造检验统计量，需要对总变异进行分解。我们引入以下统计量记号：
- 第 $i$ 组的样本和：
  $$ T_{i\\cdot} = \\sum_{j=1}^{n_i} X_{ij} $$
- 第 $i$ 组的样本均值：
  $$ \\bar{X}_{i\\cdot} = \\frac{1}{n_i} T_{i\\cdot} $$
- 全体样本总和：
  $$ T_{\\cdot\\cdot} = \\sum_{i=1}^k \\sum_{j=1}^{n_i} X_{ij} = \\sum_{i=1}^k T_{i\\cdot} $$
- 全体总均值：
  $$ \\bar{X}_{\\cdot\\cdot} = \\frac{1}{n} T_{\\cdot\\cdot} = \\frac{1}{n} \\sum_{i=1}^k n_i \\bar{X}_{i\\cdot} $$

总偏差平方和 $S_T$ 刻画了全部观测数据偏离总均值的总波动程度：
$$ S_T = \\sum_{i=1}^k \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{\\cdot\\cdot})^2 $$
我们可以将它分解为组间平方和 $S_A$ 与组内平方和 $S_E$。下面是该分解公式的严格分步数学推导：

<FormulaSteps formula="S_T = S_A + S_E" steps={[
  "写出总偏差平方和的定义式：S_T = \\sum_{i=1}^k \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{\\cdot\\cdot})^2",
  "在括号内插入中间项 \\bar{X}_{i\\cdot} 进行恒等变形：S_T = \\sum_{i=1}^k \\sum_{j=1}^{n_i} [(X_{ij} - \\bar{X}_{i\\cdot}) + (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})]^2",
  "展开括号内的完全平方式，分成三项：S_T = \\sum_{i=1}^k \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot})^2 + \\sum_{i=1}^k \\sum_{j=1}^{n_i} (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot}) ^ 2 + 2 \\sum_{i=1}^k \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot})(\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})",
  "简化第二项：由于 (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot}) 与求和指标 j 无关，故第二项为 \\sum_{i=1}^k n_i (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot})^2，定义为组间平方和 S_A",
  "简化第三项（交叉项）：提取与 j 无关的因子后，得到 2 \\sum_{i=1}^k (\\bar{X}_{i\\cdot} - \\bar{X}_{\\cdot\\cdot}) \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot})。因为 \\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot}) = T_{i\\cdot} - n_i \\bar{X}_{i\\cdot} = 0，因此交叉项恒为 0",
  "最终只剩下第一项（定义为误差平方和 S_E）和第二项（组间平方和 S_A），得证：S_T = S_A + S_E"
]} />

#### 偏差平方和的物理意义
- **总偏差平方和 $S_T$**：全部样本数据的总变异，其自由度为 $df_T = n - 1$。
- **效应平方和（组间平方和）$S_A$**：反映了由于因素 $A$ 的不同水平（不同总体均值）引起的差异，代表了可解释的变异。其自由度为 $df_A = k - 1$。
- **误差平方和（组内平方和）$S_E$**：反映了在各单一水平内部，由于随机误差导致的波动，代表了不可解释的变异。其自由度为 $df_E = n - k$。

自由度也满足可加性：
$$ df_T = df_A + df_E \\implies (n-1) = (k-1) + (n-k) $$

---

### 4. 平方和的分布与期望分析

在假设检验中，我们需要确定 $S_A$ 和 $S_E$ 的概率分布性质：
1. **组内平方和 $S_E$ 的性质**：
   无论原假设 $H_0$ 是否成立，由于各组样本是正态分布且方差齐，根据单总体方差的抽样分布性质可知，每一组的偏差平方和除以 $\sigma^2$ 服从卡方分布，即：
   $$ \\frac{\\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot})^2}{\\sigma^2} \\sim \\chi^2(n_i - 1) $$
   根据卡方分布的可加性，各组独立求和后，我们有：
   $$ \\frac{S_E}{\\sigma^2} = \\sum_{i=1}^k \\frac{\\sum_{j=1}^{n_i} (X_{ij} - \\bar{X}_{i\\cdot})^2}{\\sigma^2} \\sim \\chi^2(n - k) $$
   定有：
   $$ E(MS_E) = E\\left( \\frac{S_E}{n-k} \\right) = \\sigma^2 $$
   这说明 **$MS_E$ 始终是总体随机误差方差 $\sigma^2$ 的无偏估计**。

2. **组间平方和 $S_A$ 的性质**：
   在原假设 $H_0$（$\\delta_1 = \\dots = \\delta_k = 0$）成立的条件下，由于 $\\bar{X}_{i\\cdot} \\sim N(\\mu, \\sigma^2/n_i)$ 且相互独立，可以证明：
   $$ \\frac{S_A}{\\sigma^2} \\sim \\chi^2(k - 1) $$
   在 $H_0$ 成立时，组间均方 $MS_A = S_A / (k - 1)$ 满足：
   $$ E(MS_A) = \\sigma^2 $$
   但若 $H_0$ 不成立，可以推导得出其数学期望为：
   $$ E(MS_A) = \\sigma^2 + \\frac{1}{k-1} \\sum_{i=1}^k n_i \\delta_i^2 $$
   这说明，当水平效应 $\\delta_i$ 不全为 0 时，$E(MS_A) > \\sigma^2$。

3. **独立性**：
   可以证明，随机变量序列 $\\bar{X}_{1\\cdot}, \\dots, \\bar{X}_{k\\cdot}$ 与组内偏差 $X_{ij}-\\bar{X}_{i\\cdot}$ 相互独立，因此 **$S_A$ 与 $S_E$ 相互独立**。

---

### 5. F 检验法与方差分析表

根据上述分布性质，在原假设 $H_0$ 成立的条件下，检验统计量：
$$ F = \\frac{MS_A}{MS_E} = \\frac{S_A / (k-1)}{S_E / (n-k)} \\sim F(k-1, n-k) $$
若 $H_0$ 不成立，由于 $E(MS_A) > E(MS_E)$，统计量 $F$ 的观测值倾向于偏大。因此，该检验是一个单侧右侧检验。

对于给定的显著性水平 $\\alpha$，其拒绝域为：
$$ W = \\left\\{ F > F_{\\alpha}(k-1, n-k) \\right\\} $$

我们将上述计算过程整理为**方差分析表 (ANOVA Table)**：

| 变异来源 | 偏差平方和 (SS) | 自由度 (df) | 均方 (MS) | F 统计量 | F 临界值 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **组间 (因素A)** | $S_A$ | $k-1$ | $MS_A = \\frac{S_A}{k-1}$ | $F = \\frac{MS_A}{MS_E}$ | $F_{\\alpha}(k-1, n-k)$ |
| **组内 (误差E)** | $S_E$ | $n-k$ | $MS_E = \\frac{S_E}{n-k}$ | | |
| **总和 (Total)** | $S_T$ | $n-1$ | | | |

为了简化计算，偏差平方和的计算公式通常采用如下快捷方法：
$$ S_T = \\sum_{i=1}^k \\sum_{j=1}^{n_i} X_{ij}^2 - \\frac{T_{\\cdot\\cdot}^2}{n} $$
$$ S_A = \\sum_{i=1}^k \\frac{T_{i\\cdot}^2}{n_i} - \\frac{T_{\\cdot\\cdot}^2}{n} $$
$$ S_E = S_T - S_A $$
其中 $\\frac{T_{\\cdot\\cdot}^2}{n}$ 称为**修正因子 (Correction Factor)**，常记为 $C$。
      `
    },
    {
      id: "9.2",
      title: "一元线性回归",
      content: `
在实际问题中，变量之间的关系通常分为两类：一类是完全确定的**函数关系**（如圆的面积与半径）；另一类是变量之间存在紧密联系但又不能精确预测的**相关关系**（如身高与体重，施肥量与作物产量）。一元线性回归分析就是研究一个自变量与一个因变量之间线性相关关系的数学方法。

### 1. 一元线性回归模型

设自变量为 $x$（在统计学中，通常假定 $x$ 是可以精确测定和控制的非随机变量），因变量为 $Y$（服从某种概率分布的随机变量）。一元线性回归的基本模型为：
$$ Y = \\beta_0 + \\beta_1 x + \\epsilon $$
其中：
- $\\beta_0, \\beta_1$ 称为**回归系数**，是未知常数。$\\beta_0$ 为截距，$\\beta_1$ 为斜率。
- $\\epsilon$ 称为**随机误差**，代表除 $x$ 之外的所有未知随机因素对 $Y$ 的综合影响。

#### Gauss-Markov 假设（高斯-马尔可夫假设）
为了进行回归参数的估计 and 统计推断，通常对随机误差 $\\epsilon$ 作出如下基本假设：
1. **零均值假设**：$E(\\epsilon) = 0$。这意味着回归方程 $E(Y) = \\beta_0 + \\beta_1 x$ 刻画了 $Y$ 的均值变动。
2. **同方差假设**：对任意的 $x$，$D(\\epsilon) = \\sigma^2 > 0$（$\\sigma^2$ 是不依赖于 $x$ 的未知常数）。
3. **独立性假设**：在不同的试验中，随机误差 $\\epsilon_i$ 之间是相互独立的。
4. **正态性假设**：随机误差服从正态分布，即 $\\epsilon \\sim N(0, \\sigma^2)$。

结合以上假设，若我们有 $n$ 组独立观测数据 $(x_1, Y_1), (x_2, Y_2), \\dots, (x_n, Y_n)$，则有：
$$ Y_i = \\beta_0 + \\beta_1 x_i + \\epsilon_i, \\quad \\epsilon_i \\stackrel{\\text{i.i.d.}}{\\sim} N(0, \\sigma^2) $$
这意味着：
$$ Y_i \\sim N(\\beta_0 + \\beta_1 x_i, \\sigma^2) \\quad \\text{且相互独立} $$

下面我们通过 Manim 动画来形象地展示回归直线在概率空间中的物理意义，包括点偏离直线的随机性与方差分解几何投影：
<ManimAnimation src="/videos/ch09/regression_line.mp4" title="最小二乘回归线的几何投影与方差分解物理意义" />

---

### 2. 参数的最小二乘估计 (LSE)

为了估计未知的回归系数 $\\beta_0$ 和 $\\beta_1$，我们采用**最小二乘法 (Method of Least Squares)**。
其基本思想是寻找估计值 $\\hat{\\beta}_0$ 与 $\\hat{\\beta}_1$，使得所有观测值 $Y_i$ 与回归直线的拟合值 $\\hat{Y}_i = \\hat{\\beta}_0 + \\hat{\\beta}_1 x_i$ 之间的残差平方和达到最小。
定义目标函数为：
$$ Q(\\beta_0, \\beta_1) = \\sum_{i=1}^n (Y_i - \\beta_0 - \\beta_1 x_i)^2 $$

我们通过求导极小化该目标函数，估计步骤如下：

<FormulaSteps formula="\\hat{\\beta}_1 = \\frac{S_{xy}}{S_{xx}}, \\quad \\hat{\\beta}_0 = \\bar{Y} - \\hat{\\beta}_1 \\bar{x}" steps={[
  "定义残差平方和目标函数：Q(\\beta_0, \\beta_1) = \\sum_{i=1}^n (Y_i - \\beta_0 - \\beta_1 x_i)^2",
  "分别对 \\beta_0 和 \\beta_1 求一阶偏导数：\\frac{\\partial Q}{\\partial \\beta_0} = -2 \\sum (Y_i - \\beta_0 - \\beta_1 x_i) 和 \\frac{\\partial Q}{\\partial \\beta_1} = -2 \\sum x_i (Y_i - \\beta_0 - \\beta_1 x_i)",
  "令两个偏导数等于 0，整理可得正规方程组 (Normal Equations)：n \\beta_0 + \\beta_1 \\sum x_i = \\sum Y_i 以及 \\beta_0 \\sum x_i + \\beta_1 \\sum x_i^2 = \\sum x_i Y_i",
  "两边除以 n，由第一个方程可直接解得：\\hat{\\beta}_0 = \\bar{Y} - \\hat{\\beta}_1 \\bar{x}，其中 \\bar{Y} = \\frac{1}{n} \\sum Y_i，\\bar{x} = \\frac{1}{n} \\sum x_i",
  "将 \\hat{\\beta}_0 代入第二个正规方程中：(\\bar{Y} - \\hat{\\beta}_1 \\bar{x}) \\sum x_i + \\hat{\\beta}_1 \\sum x_i^2 = \\sum x_i Y_i",
  "展开并合并同类项，得到：\\hat{\\beta}_1 [ \\sum x_i^2 - n \\bar{x}^2 ] = \\sum x_i Y_i - n \\bar{x} \\bar{Y}",
  "引入离差平方和记号：S_{xx} = \\sum (x_i - \\bar{x})^2，S_{xy} = \\sum (x_i - \\bar{x})(Y_i - \\bar{Y})。故解出斜率估计值：\\hat{\\beta}_1 = \\frac{S_{xy}}{S_{xx}}"
]} />

由此，我们得到一元线性回归方程：
$$ \\hat{Y} = \\hat{\\beta}_0 + \\hat{\\beta}_1 x $$

其中相关离差记号为：
- $S_{xx} = \\sum_{i=1}^n (x_i - \\bar{x})^2 = \\sum_{i=1}^n x_i^2 - n \\bar{x}^2$
- $S_{yy} = \\sum_{i=1}^n (Y_i - \\bar{Y})^2 = \\sum_{i=1}^n Y_i^2 - n \\bar{Y}^2$
- $S_{xy} = \\sum_{i=1}^n (x_i - \\bar{x})(Y_i - \\bar{Y}) = \\sum_{i=1}^n x_i Y_i - n \\bar{x} \\bar{Y}$

---

### 3. 估计量的性质与概率分布

由于观测值 $Y_i$ 是随机变量，最小二乘估计量 $\\hat{\\beta}_0$ 和 $\\hat{\\beta}_1$ 也是随机变量。根据模型假设，它们具有以下优良性质：

1. **无偏性 (Unbiasedness)**：
   - 对于斜率：
     $$ E(\\hat{\\beta}_1) = E\\left( \\sum_{i=1}^n \\frac{x_i - \\bar{x}}{S_{xx}} Y_i \\right) = \\sum_{i=1}^n \\frac{x_i - \\bar{x}}{S_{xx}} E(Y_i) = \\sum_{i=1}^n \\frac{x_i - \\bar{x}}{S_{xx}} (\\beta_0 + \\beta_1 x_i) $$
     由于 $\\sum (x_i - \\bar{x}) = 0$，上式简化为：
     $$ E(\\hat{\\beta}_1) = \\beta_1 \\sum_{i=1}^n \\frac{(x_i - \\bar{x})x_i}{S_{xx}} = \\beta_1 \\frac{S_{xx}}{S_{xx}} = \\beta_1 $$
   - 对于截距：
     $$ E(\\hat{\\beta}_0) = E(\\bar{Y} - \\hat{\\beta}_1 \\bar{x}) = (\\beta_0 + \\beta_1 \\bar{x}) - \\beta_1 \\bar{x} = \\beta_0 $$
   因此，它们均是相应参数的无偏估计。

2. **方差与协方差**：
   通过代数计算，估计量的方差为：
   $$ D(\\hat{\\beta}_1) = \\frac{\\sigma^2}{S_{xx}} $$
   $$ D(\\hat{\\beta}_0) = \\sigma^2 \\left( \\frac{1}{n} + \\frac{\\bar{x}^2}{S_{xx}} \\right) $$
   $$ Cov(\\hat{\\beta}_0, \\hat{\\beta}_1) = -\\frac{\\bar{x} \\sigma^2}{S_{xx}} $$
   *(注意：如果自变量进行中心化处理，使得 $\\bar{x} = 0$，则截距与斜率的估计值将不相关)*。

3. **正态性**：
   因为 $\\hat{\\beta}_0$ 和 $\\hat{\\beta}_1$ 都是独立正态随机变量 $Y_i$ 的线性组合，所以它们仍然服从正态分布：
   $$ \\hat{\\beta}_1 \\sim N\\left(\\beta_1, \\frac{\\sigma^2}{S_{xx}}\\right) $$
   $$ \\hat{\\beta}_0 \\sim N\\left(\\beta_0, \\sigma^2 \\left( \\frac{1}{n} + \\frac{\\bar{x}^2}{S_{xx}} \\right)\\right) $$

---

### 4. 方差分解与显著性检验

为了判定我们求得的回归直线是否具有实际意义，我们需要检验自变量 $x$ 的变化是否确实能线性影响因变量 $Y$，即进行显著性检验。

#### (1) 方差分解公式
类似于方差分析，我们可以将因变量的总变异进行分解。
总偏差平方和 $S_{yy}$ 拆分为：
$$ S_{yy} = \\sum_{i=1}^n (Y_i - \\bar{Y})^2 $$
拟合值 $\\hat{Y}_i = \\hat{\\beta}_0 + \\hat{\\beta}_1 x_i$ 的回归平方和 $U$（又记作 $S_R$）定义为：
$$ U = \\sum_{i=1}^n (\\hat{Y}_i - \\bar{Y})^2 = \\hat{\\beta}_1^2 S_{xx} = \\frac{S_{xy}^2}{S_{xx}} $$
残差平方和 $Q$（又记作 $S_E$）定义为：
$$ Q = \\sum_{i=1}^n (Y_i - \\hat{Y}_i)^2 = S_{yy} - U = S_{yy} - \\frac{S_{xy}^2}{S_{xx}} $$

可以严格证明方差分解公式成立：
$$ S_{yy} = U + Q $$
其自由度分解为：
$$ n - 1 = 1 + (n - 2) $$

#### (2) $\\sigma^2$ 的无偏估计
由于随机误差方差 $\\sigma^2$ 未知，我们利用残差平方和 $Q$ 进行估计。可以证明：
$$ \\frac{Q}{\\sigma^2} \\sim \\chi^2(n - 2) $$
因此，$\\sigma^2$ 的无偏估计量（即误差均方）为：
$$ s^2 = \\hat{\\sigma}^2 = \\frac{Q}{n-2} $$

#### (3) 显著性检验的三种等价方法
我们要检验的零假设为：
- $H_0: \\beta_1 = 0$ (自变量与因变量之间无显著线性关系)
- $H_1: \\beta_1 \\neq 0$ (有显著线性关系)

##### 1. F 检验法
在 $H_0$ 成立时，回归平方和 $U$ 与残差均方的比值服从 F 分布：
$$ F = \\frac{U / 1}{Q / (n-2)} = \\frac{U}{s^2} \\sim F(1, n-2) $$
拒绝域为：
$$ F > F_{\\alpha}(1, n-2) $$

##### 2. t 检验法
利用斜率估计量的正态分布性质，构造检验统计量：
$$ t = \\frac{\\hat{\\beta}_1 - 0}{\\sqrt{D(\\hat{\\beta}_1)}} \\approx \\frac{\\hat{\\beta}_1}{\\sqrt{s^2 / S_{xx}}} = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{s} $$
在 $H_0$ 成立时，该统计量服从自由度为 $n-2$ 的 t 分布：
$$ t = \\frac{\\hat{\\beta}_1 \\sqrt{S_{xx}}}{s} \\sim t(n-2) $$
对于给定的显著性水平 $\\alpha$，双侧检验的拒绝域为：
$$ |t| > t_{\\alpha/2}(n-2) $$
*(注意：由于 $F = t^2$ 且 $F_{\\alpha}(1, n-2) = t^2_{\\alpha/2}(n-2)$，一元线性回归中 F 检验与 t 检验是完全等价的)*。

##### 3. 相关系数检验法
样本相关系数 $r$ 定义为：
$$ r = \\frac{S_{xy}}{\\sqrt{S_{xx} S_{yy}}} $$
显然 $-1 \\le r \\le 1$。相关系数越接近 $\\pm 1$，说明线性相关性越强。
利用 $r$，我们可以构造与 t 检验完全等价的检验统计量：
$$ t = \\frac{r \\sqrt{n-2}}{\\sqrt{1 - r^2}} \\sim t(n-2) $$
通过比较 $|r|$ 与相关系数临界值表 $r_{\\alpha}(n-2)$，或使用上面的 t 统计量进行判定。

---

### 5. 预测与区间估计

回归分析的核心应用之一是进行预测。设给定自变量的一个新观测值 $x = x_0$，我们希望对因变量 $Y_0$ 进行点估计与区间估计。

#### (1) $Y_0$ 的均值 $E(Y_0)$ 的区间估计
对于固定的 $x_0$，其总体均值为 $\\mu_0 = E(Y_0) = \\beta_0 + \\beta_1 x_0$。
它的点估计值为：
$$ \\hat{Y}_0 = \\hat{\\beta}_0 + \\hat{\\beta}_1 x_0 $$
因为 $\\hat{Y}_0$ 是正态随机变量的线性组合，易证其均值为 $E(\\hat{Y}_0) = \\beta_0 + \\beta_1 x_0$，方差为：
$$ D(\\hat{Y}_0) = \\sigma^2 \\left( \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}} \\right) $$
因此，构造枢轴量：
$$ \\frac{\\hat{Y}_0 - E(Y_0)}{s \\sqrt{\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}}} \\sim t(n-2) $$
得到 $E(Y_0)$ 的置信度为 $1-\\alpha$ 的置信区间为：
$$ \\left[ \\hat{Y}_0 - t_{\\alpha/2}(n-2) s \\sqrt{\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}}, \\ \\hat{Y}_0 + t_{\\alpha/2}(n-2) s \\sqrt{\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}} \\right] $$

#### (2) 个别值 $Y_0$ 的预测区间
如果我们想对单个未来的观测值 $Y_0 = \\beta_0 + \\beta_1 x_0 + \\epsilon_0$ 进行预测。
其预测误差为 $Y_0 - \\hat{Y}_0$。由于未来的随机误差 $\\epsilon_0$ 与历史观测数据独立，所以：
$$ D(Y_0 - \\hat{Y}_0) = D(Y_0) + D(\\hat{Y}_0) = \\sigma^2 + \\sigma^2 \\left( \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}} \\right) = \\sigma^2 \\left( 1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}} \\right) $$
由此可得，个别值 $Y_0$ 的置信度为 $1-\\alpha$ 的预测区间为：
$$ \\left[ \\hat{Y}_0 - t_{\\alpha/2}(n-2) s \\sqrt{1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}}, \\ \\hat{Y}_0 + t_{\\alpha/2}(n-2) s \\sqrt{1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}} \\right] $$
      `
    }
  ]
};
