# 第 14 节：相关系数性质、独立与不相关

> 本节前置：第 13 节（协方差、相关系数、切比雪夫不等式；$E(XY)=E(X)E(Y)$ 与独立的关系）
> 本节通向：第 15 节（大数定律与中心极限定理——把 $\rho=0$ 的"正交性"转化为和的方差收敛论证）
> 关键风格：公理化 / 反例优先 / 性质反用

---

## 一、本节知识要点总览（知识点清单表格）

| 编号 | 知识点 | 一句话说明 |
|------|--------|------------|
| KP1 | $|\rho|\le 1$；$\rho=\pm 1\Leftrightarrow Y=aX+b$ a.s. | 证明由 $\text{Var}(tX-Y)\ge 0$ 对所有 $t$ 展开；二次式判别式 $\le 0\Rightarrow \rho^2\le 1$；等号对应 $t_0X-Y$ 退化 |
| KP2 | 独立 $\Rightarrow$ 不相关；反推不成立 | 标准反例：$X\sim U[-1,1],\ Y=X^2$——$\rho=0$ 但 $Y$ 完全由 $X$ 决定 |
| KP3 | 二维正态的特殊性：在联合正态前提下，$\rho=0\Leftrightarrow$ 独立 | 联合密度 $\rho=0$ 时可因式分解为 $f_X(x)f_Y(y)$；仅"边缘正态"不保证联合正态（标准反例：$X\sim N(0,1),\ Y=X\cdot Z$ 其中 $Z=\pm 1$ 独立对称）|

---

## 二、知识点详解

### KP1：$|\rho|\le 1$，$\rho=\pm 1\Leftrightarrow Y=aX+b$ 几乎处处成立

- **公理化定义 / 正式定义**：
  设 $\sigma_X>0,\ \sigma_Y>0$，$\rho=\rho_{XY}$。则
  $$|\rho|\le 1.$$
  且：
  - $\rho=1\ \Leftrightarrow$ 存在 $a>0,\ b\in\mathbb{R}$ 使得 $Y=aX+b$ a.s.
  - $\rho=-1\Leftrightarrow$ 存在 $a<0,\ b\in\mathbb{R}$ 使得 $Y=aX+b$ a.s.

- **证明思路（用方差非负）**：
  对任意 $t\in\mathbb{R}$，考虑 $V_t=tX-Y$，有
  $$0\le \text{Var}(V_t)=t^2\text{Var}(X)-2t\,\text{Cov}(X,Y)+\text{Var}(Y).$$
  把它视为 $t$ 的二次函数 $At^2+Bt+C$，其中 $A=\sigma_X^2>0$，$B=-2\text{Cov}(X,Y)$，$C=\sigma_Y^2$。
  - 非负对所有 $t$ 成立 $\Rightarrow$ 判别式 $\Delta\le 0$：
    $$\Delta=B^2-4AC=4\,\text{Cov}(X,Y)^2-4\sigma_X^2\sigma_Y^2\le 0\ \Rightarrow\ \text{Cov}(X,Y)^2\le\sigma_X^2\sigma_Y^2\ \Rightarrow\ \rho^2\le 1.$$
  - 等号 $\rho^2=1\ \Leftrightarrow$ 判别式 $=0$，此时二次式有唯一根 $t_0$ 满足 $\text{Var}(t_0X-Y)=0$，即 $Y=t_0X+c$ a.s.（退化）。
    - $t_0=B/(2A)=(2\text{Cov})/(2\sigma_X^2)=\text{Cov}/\sigma_X^2=\rho\sigma_Y/\sigma_X$。
    - 当 $\rho=1$ 时 $t_0>0$；当 $\rho=-1$ 时 $t_0<0$。

- **关键性质与直觉**：
  1. $\rho$ 精确衡量"线性拟合程度"。
  2. $R^2$ 在线性回归中就是 $\rho^2$——解释方差的比例（为统计学课程铺垫）。
  3. $\rho=0$ 只说明"最好的线性拟合是一条水平线"——不说明 $X$ 与 $Y$ 没有关系。

- **术语对照**：柯西–施瓦茨 Cauchy–Schwarz（在概率语境下 $\text{Cov}^2\le\text{Var}(X)\text{Var}(Y)$ 是它的概率形式）/ 完美线性 Perfect linear / 退化 Degenerate。

> **案例 C1（由方差非负推导 $|\rho|\le 1$）**
> 【题目】利用 $\text{Var}(tX-Y)\ge 0$ 对所有 $t$，直接推出 $|\rho|\le 1$。
> 【分析】前面给出的证明。
> 【求解步骤】
> ① 写 $\text{Var}(tX-Y)=t^2\sigma_X^2-2t\,\text{Cov}(X,Y)+\sigma_Y^2\ge 0$。
> ② 判别式 $\Delta=4\text{Cov}^2-4\sigma_X^2\sigma_Y^2\le 0$。
> ③ 即 $\text{Cov}^2\le\sigma_X^2\sigma_Y^2$，故 $\rho^2\le 1$。
> 【答案】$|\rho|\le 1$。
> 【点评】这是学生必须掌握的标准推导。

> **案例 C2（构造几乎处处线性的例：$Y=2X+1\Rightarrow \rho=1$）**
> 【题目】设 $X$ 有正方差，$Y=2X+1$。计算 $\rho_{XY}$。
> 【分析】用线性变换下的保号不变性（C6 第 13 节），或直接代入。
> 【求解步骤】
> ① $\sigma_Y=2\sigma_X$。
> ② $\text{Cov}(X,Y)=\text{Cov}(X,2X+1)=2\,\text{Var}(X)=2\sigma_X^2$。
> ③ $\rho=(2\sigma_X^2)/(\sigma_X\cdot 2\sigma_X)=1$。
> 【答案】$\rho=1$。
> 【点评】一般地，若 $Y=aX+b$ 且 $a>0$，则 $\rho=1$；$a<0$ 则 $\rho=-1$。

> **案例 C3（强调"线性"——$\rho=0$ 不意味无关系）**
> 【题目】$X\sim N(0,1),\ Y=X^2$。计算 $\rho_{XY}$ 并说明 $X$ 与 $Y$ 是否有关系。
> 【分析】$\text{Cov}(X,Y)=E(XY)-E(X)E(Y)=E(X^3)-0=0$（正态奇数阶中心矩 $=0$）。
> 【求解步骤】
> ① $E(X)=0$，$E(X^3)=0$，故 $\text{Cov}=0$，$\rho=0$。
> ② 但 $Y=X^2$——$Y$ 完全由 $X$ 决定，显然有"关系"。
> 【答案】$\rho=0$，但 $X,Y$ 有完美的二次关系——$\rho$ 对此完全失明。
> 【点评】这是"相关系数衡量线性关系"的核心直觉——必须反复给学生强调。

### KP2：独立 $\Rightarrow$ 不相关。核心反例：不相关但不独立

- **公理化定义 / 正式定义**：
  若 $X,Y$ 独立，则 $E(XY)=E(X)E(Y)$，故 $\text{Cov}(X,Y)=0$，从而 $\rho=0$。即
  $$\text{独立}\ \Longrightarrow\ \text{不相关}.$$
  反推一般**不成立**。

- **标准反例**（$X\sim U[-1,1],\ Y=X^2$）：
  - $E(X)=0$（奇函数对称）。
  - $E(Y)=E(X^2)=\int_{-1}^{1}x^2/2\,dx=1/3$。
  - $E(XY)=E(X^3)=0$（奇函数对称）。
  - $\text{Cov}(X,Y)=0-0=0$，$\rho=0$——不相关。
  - 但 $Y$ 完全由 $X$ 决定（$Y=X^2$），显然**不独立**。
  - 更具体：$P(X>1/2,\ Y>3/4)=P(X>1/2,\ |X|>\sqrt{3}/2)=P(X>\sqrt{3}/2)\neq P(X>1/2)\cdot P(Y>3/4)$。

- **直观信息**：
  $\rho$ 只捕捉**线性**依赖；如果真实关系是对称非线性（如 $Y=X^2$，在对称分布下正负抵消导致三阶矩为 0），$\rho$ 就给出"零"——这正是它的**盲点**。

- **术语对照**：不相关但不独立 Uncorrelated but dependent / 非线性依赖 Nonlinear dependence / 盲点 Blind spot。

> **案例 C4（$X\sim U[-1,1],\ Y=X^2$——完整计算）**
> 【题目】完整计算 $\rho$，并通过一组具体概率验证不独立。
> 【分析】同上，再加一次数值验证。
> 【求解步骤】
> ① 已得 $\rho=0$。
> ② 取 $A=\{X>0.5\}$，$B=\{Y>0.25\}$。$P(A)=0.25$；$P(B)=P(|X|>0.5)=0.5$；$P(A\cap B)=P(X>0.5)=0.25$。
> ③ $P(A)P(B)=0.25\times 0.5=0.125\neq 0.25=P(A\cap B)$。
> 【答案】$P(A\cap B)\neq P(A)P(B)$，所以不独立。
> 【点评】数值验证很关键——仅说"$Y$ 完全由 $X$ 决定"虽然直观，但写成严格不等式才算完成论证。

> **案例 C5（对称分布的类似反例——$X$ 对称，$Y=|X|$）**
> 【题目】$X\sim U[-1,1],\ Y=|X|$。判断 $\rho=0$ 是否成立，并判断是否独立。
> 【分析】$E(X)=0$；$E(XY)=E(X|X|)=\int_{-1}^{1}x|x|/2\,dx=0$（奇函数）。
> 【求解步骤】
> ① $\text{Cov}(X,Y)=0-0=0\Rightarrow \rho=0$。
> ② 但明显 $Y$ 由 $X$ 决定，不独立。
> 【答案】$\rho=0$ 但不独立。
> 【点评】这里的机制与 $Y=X^2$ 相同——只要 $g(X)$ 使得 $X\cdot g(X)$ 是奇函数，对称分布下 $E(Xg(X))=0$，就会得到 $\rho=0$ 但不独立。

> **案例 C6（反例强化：不相关 $\neq$ 独立——必须从定义上区分）**
> 【题目】给出一句记忆口诀并给出一个"独立 $\Rightarrow \rho=0$"的简单正向例（如 $X,Y$ 独立 $N(0,1)$）。
> 【分析】$X,Y$ 独立 $N(0,1)$，显然 $\text{Cov}=E(XY)-0=0$，$\rho=0$。
> 【求解步骤】
> ① 独立 $\Rightarrow$ 联合密度 $=$ 边缘乘积 $\Rightarrow E(XY)=E(X)E(Y)\Rightarrow \rho=0$。
> ② 但 $\rho=0\nRightarrow$ 独立（KP2 反例）。
> 【答案】口诀："独立 $\Rightarrow$ 不相关；不相关 $\nRightarrow$ 独立。"
> 【点评】记忆这句并能"默写"标准反例是本科概率必考题目。

### KP3：二维正态的特殊性——$\rho=0\Leftrightarrow$ 独立（在联合正态前提下）

- **公理化定义 / 正式定义**：
  二维正态向量 $(X,Y)\sim N(\mu_1,\mu_2,\sigma_1^2,\sigma_2^2,\rho)$ 的联合密度为
  $$f(x,y)=\frac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}}\,\exp\left\{-\frac{1}{2(1-\rho^2)}\left[\frac{(x-\mu_1)^2}{\sigma_1^2}-2\rho\frac{(x-\mu_1)(y-\mu_2)}{\sigma_1\sigma_2}+\frac{(y-\mu_2)^2}{\sigma_2^2}\right]\right\}.$$
  当 $\rho=0$ 时，交叉项消失：
  $$f(x,y)=\frac{1}{2\pi\sigma_1\sigma_2}\exp\left\{-\frac{(x-\mu_1)^2}{2\sigma_1^2}-\frac{(y-\mu_2)^2}{2\sigma_2^2}\right\}=f_X(x)\,f_Y(y).$$
  因此 $\rho=0\Rightarrow$ 独立。结合"独立 $\Rightarrow\rho=0$"的一般结论，得到：
  $$\text{在联合二维正态前提下：}\quad\text{独立}\ \Longleftrightarrow\ \rho=0\ \Longleftrightarrow\ \text{不相关}.$$

- **关键性质**：
  1. 联合密度 $\rho=0$ 时**可分离变量** $\Rightarrow$ 独立（矩形定义域显然成立——$\mathbb{R}^2$ 当然是矩形）。
  2. 条件分布仍为正态：$Y|X=x\sim N(\mu_2+\rho\sigma_2(x-\mu_1)/\sigma_1,\ \sigma_2^2(1-\rho^2))$。当 $\rho=0$，条件均值 $=\mu_2$（不依赖 $x$），条件方差 $=\sigma_2^2$——即知道 $X$ 不改变 $Y$ 的分布信息 $=$ 独立。
  3. 边缘分布：$X\sim N(\mu_1,\sigma_1^2),\ Y\sim N(\mu_2,\sigma_2^2)$——总是正态（无论 $\rho$ 为何）。

- **反例 / 易混淆澄清——"仅边缘正态不保证联合正态"**：
  经典构造：$X\sim N(0,1)$，令 $Z$ 是与 $X$ 独立的随机变量，$P(Z=1)=P(Z=-1)=1/2$。令
  $$Y=X\cdot Z.$$
  - 对任意 $y$，$P(Y\le y)=P(XZ\le y)=\frac12 P(X\le y)+\frac12 P(-X\le y)=\frac12\Phi(y)+\frac12(1-\Phi(-y))=\Phi(y)$（因为 $\Phi(-y)=1-\Phi(y)$）。所以 $Y\sim N(0,1)$。
  - 但 $(X,Y)$ **不是联合正态**。反证：若联合正态且 $\rho=E(XY)=E(X^2 Z)=E(X^2)E(Z)=1\cdot 0=0$，则 $X,Y$ 独立（KP3 结论）。但 $P(Y>1\ |\ X=1)=P(Z>1\ |\ X=1)=P(Z>1)=0$，而 $P(Y>1)=1-\Phi(1)\approx 0.1587\neq 0$，矛盾。故不是联合正态。
  - 这个反例说明：**"边缘正态"不自动推出"联合正态"**。要使用"$\rho=0\Leftrightarrow$ 独立"的结论，必须先确认**联合正态**。

- **术语对照**：联合正态 Bivariate normal / 二维正态 Bivariate normal / 条件分布 Conditional distribution / 边缘正态 Marginal normal / 联合正态 vs 仅边缘正态。

> **案例 C7（由联合密度说明 $\rho=0$ 时可分离）**
> 【题目】写出二维正态联合密度，代入 $\rho=0$ 并分解出 $f_X(x)f_Y(y)$。
> 【分析】直接代入。
> 【求解步骤】
> ① 代入 $\rho=0$：$f(x,y)=\frac{1}{2\pi\sigma_1\sigma_2}\exp\left\{-\frac{(x-\mu_1)^2}{2\sigma_1^2}-\frac{(y-\mu_2)^2}{2\sigma_2^2}\right\}$。
> ② $f_X(x)=\frac{1}{\sqrt{2\pi}\sigma_1}e^{-(x-\mu_1)^2/(2\sigma_1^2)}$，$f_Y(y)=\frac{1}{\sqrt{2\pi}\sigma_2}e^{-(y-\mu_2)^2/(2\sigma_2^2)}$。
> ③ 乘积 $f_X(x)f_Y(y)=f(x,y)$。
> 【答案】联合密度 $\rho=0$ 时等于边缘密度乘积 $\Rightarrow$ 独立。
> 【点评】这是本结论的标准证明思路。

> **案例 C8（对比"仅边缘正态"反例：$Y=X\cdot Z$ 构造）**
> 【题目】如上构造 $Y=X\cdot Z$，说明 $Y$ 是正态 $N(0,1)$ 但 $(X,Y)$ 不是联合正态。
> 【分析】前面已完成论证。
> 【求解步骤】
> ① $Y\sim N(0,1)$（如上）。
> ② $E(XY)=0$，$\rho=0$。
> ③ $P(Y>1\ |\ X=1)=0$ 与 $P(Y>1)\approx 0.1587$ 矛盾——条件分布不再是正态（联合正态的条件分布必为正态），因此不是联合正态。
> 【答案】$(X,Y)$ 不是联合正态。
> 【点评】学生必须能写出此构造并说明理由——这是"仅边缘不保证联合"的标准反例。

> **案例 C9（条件均值的数值例——$\rho=0$ 时条件均值不依赖 $x$）**
> 【题目】设 $(X,Y)\sim N(0,0,1,1,\rho)$。计算 $E(Y|X=x)$，并解释当 $\rho=0$ 时意味着什么。
> 【分析】二元正态条件分布公式：$Y|X=x\sim N(\rho x,\ 1-\rho^2)$。
> 【求解步骤】
> ① $E(Y|X=x)=\rho x$。
> ② 当 $\rho=0$，$E(Y|X=x)=0$——不依赖 $x$。
> 【答案】$\rho=0$ 时，$X$ 的信息完全不改变对 $Y$ 的条件均值预测——这正是"$X$ 对 $Y$ 无线性预测价值"，在联合正态下进一步等价于"独立"。
> 【点评】这是"信息论"角度理解独立：知道 $X$ 不对 $Y$ 提供信息。

---

## 三、本节例题汇总

- C1：由 $\text{Var}(tX-Y)\ge 0$ 推导 $|\rho|\le 1$。
- C2：完美线性 $Y=2X+1$ 的 $\rho=1$。
- C3：$X\sim N(0,1),\ Y=X^2$ 的 $\rho=0$ 但有完美非线性关系——展示 $\rho$ 的盲点。
- C4：标准反例 $X\sim U[-1,1],\ Y=X^2$ 的完整计算与数值验证（$P(A\cap B)\neq P(A)P(B)$）。
- C5：对称 $X$ 的 $Y=|X|$——同类反例构造。
- C6："独立 $\Rightarrow$ 不相关；不相关 $\nRightarrow$ 独立"口诀化记忆。
- C7：联合密度代入 $\rho=0$ 分离为边缘乘积 $\Rightarrow$ 独立的证明。
- C8：$Y=X\cdot Z$ 构造（$Z=\pm 1$ 对称）的"仅边缘正态非联合正态"反例。
- C9：联合正态条件均值 $E(Y|X=x)=\rho\sigma_2(x-\mu_1)/\sigma_1+\mu_2$ 在 $\rho=0$ 时不依赖 $x$——信息论解释。

---

## 四、反例与反命题澄清（小结）

| 常见误解 | 正确说法 | 备注 |
|----------|----------|------|
| "$\rho=0\Rightarrow$ 独立" | 独立 $\Rightarrow \rho=0$；反推不成立（除非联合正态） | 标准反例：$X\sim U[-1,1],\ Y=X^2$ |
| "只要两个边缘都是正态，联合就是二维正态" | 仅边缘正态 **不** 保证联合正态 | 反例：$Y=X\cdot Z$，$Z=\pm 1$ 独立对称 |
| "$\rho$ 衡量 $X$ 与 $Y$ 的关系强度" | $\rho$ 只衡量**线性**关系强度；完美非线性关系可能 $\rho=0$ | $Y=X^2$ 对称分布例 |
| "$\rho=1$ 说明 $X$ 与 $Y$ 完全相同" | $\rho=1$ 意味着 $Y=aX+b$ a.s.（$a>0$）——允许平移与缩放 | $Y=2X+1$ 与 $X$ 的 $\rho=1$ |
| "在联合正态下 $\rho=0\Leftrightarrow$ 独立，所以联合正态是万能的" | 联合正态是特殊情形；**一般**分布下 $\rho=0$ 不独立 | 联合正态结论不可外推到任意分布 |
| "$Y=X\cdot Z$ 构造出来 $Y$ 不是正态" | 恰恰 $Y$ **是** $N(0,1)$（对称混合 $N(0,1)$）——但 $(X,Y)$ 不是联合正态 | 关键区分：**边缘正态** vs **联合正态** |

---

## 五、通向下一步的衔接

- 本节关于"独立 $\Rightarrow$ 不相关"的结论以及 $|\rho|\le 1$ 的证明，为第 15 节"大量独立随机变量之和"的方差收敛估计提供了核心工具——若无相关性交叉项消失，$\text{Var}(\sum X_i)=\sum\text{Var}(X_i)$ 就成立。
- 切比雪夫 + 独立（或不相关）就是大数定律：$P(|\bar{X}_n-\mu|\ge\varepsilon)\le\sigma^2/(n\varepsilon^2)\to 0$。
- 二维正态（KP3）在后续统计课程（线性回归、多元正态、似然方法）中是最常见的"默认模型"——理解它的"$\rho=0\Leftrightarrow$ 独立"特殊性是关键。
- 若跳过本节，则无法在选择题/证明题中正确使用"独立 $\Rightarrow$ 不相关但反之不成立"；也无法理解联合正态与边缘正态的差异——这是本科概率常考易错点。
