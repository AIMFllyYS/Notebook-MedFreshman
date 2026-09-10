# 第 18 节：参数估计——矩估计与极大似然

> 本节前置：第 16–17 节（样本矩、无偏样本方差 $S^2$、正态总体抽样分布）
> 本节通向：后续课程的区间估计与假设检验（本课在此收束，给出"估计量 $\pm$ 标准误"的直觉桥梁）
> 关键风格：公理化 / 反例优先 / 性质反用

---

## 一、本节知识要点总览（知识点清单表格）

| 编号 | 知识点 | 一句话说明 |
|------|--------|------------|
| KP1 | 点估计一般思想：估计量 vs 估计值 | $\hat\theta=\hat\theta(X_1,\dots,X_n)$ 是随机变量；代入样本值得常数；评价标准：无偏 / 有效 / 相合 |
| KP2 | 矩估计法 Method of Moments (MoM) | "样本矩 $=$ 总体矩"解方程；有几个参数就匹配几阶矩；相合但不一定无偏 |
| KP3 | 极大似然估计 Maximum Likelihood (MLE) | 选择使观测样本出现概率（密度）最大的 $\theta$；$\hat\theta=\argmax L(\theta)=\argmax \ell(\theta)$；求导或边界技巧 |
| KP4 | MLE 的不变性 Invariance Property | 若 $\hat\theta$ 是 $\theta$ 的 MLE，则 $g(\hat\theta)$ 是 $g(\theta)$ 的 MLE |
| KP5 | 估计量的评价与对比（典型例题 $U(0,\theta)$） | 矩估计 $\theta_1=2\bar X$ 与 MLE $\theta_2=\max(X_i)$ 的无偏性 / 方差 / 相合性完整对比 |

---

## 二、知识点详解

### KP1：点估计的一般思想；估计量 vs 估计值

- **公理化定义 / 正式定义**：
  设总体分布 $f(x;\theta)$ 依赖未知参数 $\theta$，参数空间为 $\Theta$。样本 $X_1,\dots,X_n$ i.i.d. 一个**估计量**是样本的函数（统计量）：
  $$\hat\theta=\hat\theta(X_1,\dots,X_n).$$
  代入具体观测值 $x_1,\dots,x_n$ 得到的数值 $\hat\theta(x_1,\dots,x_n)$ 称为**估计值**（一个常数）。

- **关键性质（评价标准）**：
  1. **无偏性**：$E[\hat\theta]=\theta$，对所有 $\theta\in\Theta$。
  2. **有效性**：对两个无偏估计量，方差较小者更有效（"波动更小"）。
  3. **相合性**：$\hat\theta\xrightarrow{P}\theta$（大样本时依概率收敛到真值）。
  4. **标准误 / 均方误差**：$\text{SE}(\hat\theta)=\sqrt{\text{Var}(\hat\theta)}$；$\text{MSE}(\hat\theta)=\text{Var}(\hat\theta)+(\text{Bias}(\hat\theta))^2$。

- **反例 / 易混淆澄清**：
  - **无偏不唯一**：可以构造多个无偏估计，必须进一步用方差挑选。
  - **有偏估计未必更差**：在均方误差意义下，一个小方差的有偏估计可以优于一个大方差的无偏估计（James–Stein 估计是高级课程的典型例子）。

- **术语对照**：点估计 Point estimation / 估计量 Estimator / 估计值 Estimate / 无偏性 Unbiasedness / 有效性 Efficiency / 相合性 Consistency / 均方误差 Mean squared error (MSE)。

> **案例 C1（同一参数可有多个合理估计）**
> 【题目】设总体 $U(0,\theta)$。提出 $\theta$ 的至少两种自然估计，并说明思想。
> 【分析】矩估计用一阶矩匹配；MLE 用"使所有观测 $\le \theta$ 的最小 $\theta$"。
> 【求解步骤】
> ① 矩估计：$\mu_1=\theta/2$，$A_1=\bar X$，故 $\hat\theta_1=2\bar X$。
> ② MLE：似然 $L(\theta)=1/\theta^n$ 对 $\theta\ge\max(x_i)$，且随 $\theta$ 增大而减小，故 $\hat\theta_2=\max(X_i)$。
> 【答案】矩估计 $2\bar X$，MLE $\max(X_i)$。
> 【点评】两种估计思路完全不同，性质也不同（见 KP5 详细对比）。

> **案例 C2（三评价标准说明）**
> 【题目】对上面两个估计，用一句话分别说明无偏性、有效性、相合性的含义。
> 【求解步骤】
> ① 无偏性：大量重复抽样后，$\hat\theta$ 的平均等于真值 $\theta$——"长期平均准"。
> ② 有效性：在无偏估计中挑一个"波动最小"的，它给出更紧密的估计。
> ③ 相合性：当样本量无限增大时，$\hat\theta$ 在概率上可以任意接近 $\theta$——"样本越大越准"。
> 【答案】如上三条直觉。
> 【点评】三条标准分别回答"平均准不准""波动大不大""样本够大时靠不靠谱"。

---

### KP2：矩估计法（Method of Moments, MoM）

- **公理化定义 / 正式定义**：
  设总体有 $k$ 个未知参数 $\theta=(\theta_1,\dots,\theta_k)$。总体 $j$ 阶矩 $\mu_j(\theta)=E(X^j;\theta)$。令
  $$\mu_j(\theta)=A_j=\dfrac{1}{n}\sum_{i=1}^n X_i^j,\quad j=1,\dots,k,$$
  解此 $k$ 元方程组得到的解 $\hat\theta$ 称为**矩估计**。

- **关键性质**：
  1. 由 LLN，$A_j\xrightarrow{P}\mu_j(\theta_0)$；若映射 $\theta\mapsto(\mu_1,\dots,\mu_k)$ 在真值 $\theta_0$ 处可逆且连续，则 $\hat\theta\xrightarrow{P}\theta_0$——**相合**。
  2. 一般**不保证无偏**。
  3. 计算简单、便于理解，常作为迭代算法的初值。

- **反例 / 易混淆澄清**：
  - "矩方程"可以有多组解或无解（病态总体），此时需附加合理约束。
  - 对同一参数可以通过匹配不同阶矩得到不同矩估计；惯例是"先用低阶矩，若不够再加高阶"。

- **术语对照**：矩估计 Method of moments / 总体矩 Population moment / 矩方程 Moment equation。

> **案例 C3（正态 $N(\mu,\sigma^2)$：矩估计）**
> 【题目】设总体 $N(\mu,\sigma^2)$，求 $\mu$ 与 $\sigma^2$ 的矩估计。
> 【求解步骤】
> ① $\mu_1=\mu=A_1=\bar X\Rightarrow\hat\mu=\bar X$（无偏）。
> ② $\mu_2=\sigma^2+\mu^2=A_2$，故 $\hat\sigma^2=A_2-\bar X^2=\tfrac{1}{n}\sum(X_i-\bar X)^2=M_2$（**有偏**，因 $E[M_2]=\tfrac{n-1}{n}\sigma^2$）。
> 【答案】$\hat\mu=\bar X$，$\hat\sigma^2=\tfrac{1}{n}\sum(X_i-\bar X)^2$。
> 【点评】与 $S^2=\tfrac{1}{n-1}\sum$ 的差别：矩估计给出的是**有偏**的 $M_2$。

> **案例 C4（指数 $\text{Exp}(\lambda)$：矩估计）**
> 【题目】总体 $\text{Exp}(\lambda)$，密度 $f(x)=\lambda e^{-\lambda x}\ (x\ge 0)$，$E(X)=1/\lambda$。求 $\lambda$ 的矩估计。
> 【求解步骤】
> ① 令 $A_1=\mu_1=1/\lambda$。
> ② 得 $\hat\lambda=1/\bar X$。
> 【答案】$\hat\lambda=1/\bar X$。
> 【点评】注意 $\hat\lambda$ 是有偏的（$1/\bar X$ 不是 $1/E(X)$），但相合。

> **案例 C5（均匀 $U(0,\theta)$：矩估计）**
> 【题目】总体 $U(0,\theta)$，$E(X)=\theta/2$。求矩估计。
> 【求解步骤】
> ① $\bar X=\theta/2\Rightarrow\hat\theta=2\bar X$。
> ② $E[\hat\theta]=2\cdot\theta/2=\theta$（无偏）。
> ③ $\text{Var}(\hat\theta)=4\cdot\text{Var}(\bar X)=4\cdot(\theta^2/12)/n=\theta^2/(3n)$。
> 【答案】$\hat\theta=2\bar X$，无偏，方差 $\theta^2/(3n)$。
> 【点评】此估计会出现"小于最大值"的不合理样本：$2\bar X$ 可能小于某个 $X_i$（比如 $n=2$，样本 $9,1$：$\hat\theta=10$ 合理，但有时 $2\bar X<\max$）。MLE $\max(X_i)$ 不会出现这种不合理。

> **案例 C6（伯努利 $B(1,p)$：矩估计）**
> 【题目】总体 $B(1,p)$，$E(X)=p$。求 $p$ 的矩估计。
> 【求解步骤】
> ① $\bar X=p\Rightarrow\hat p=\bar X$（样本比例）。
> ② 无偏：$E[\hat p]=p$；$\text{Var}(\hat p)=p(1-p)/n$。
> 【答案】$\hat p=\bar X$。
> 【点评】这是民意调查中"赞成比例"的标准估计。

---

### KP3：极大似然估计（Maximum Likelihood Estimation, MLE）

- **公理化定义 / 正式定义**：
  似然函数：$L(\theta)=\prod_{i=1}^n f(x_i;\theta)$（视为 $\theta$ 的函数，样本固定）。
  对数似然：$\ell(\theta)=\sum_{i=1}^n\ln f(x_i;\theta)$。
  MLE 定义为：
  $$\hat\theta=\argmax_{\theta\in\Theta}\ L(\theta)=\argmax_{\theta\in\Theta}\ \ell(\theta).$$

- **关键性质**：
  1. **求导解方程**：对正则情形，令 $\ell'(\theta)=0$（或向量时梯度为 0）。
  2. **二阶条件**：需验证 $\ell''(\hat\theta)<0$ 或比较边界值，以确保是最大值。
  3. **边界解情形**：当似然在参数空间边界上达到最大时，求导失效，须直接比较。典型例子：$U(0,\theta)$ 的 MLE 为 $\max(X_i)$。
  4. **大样本性质**：在正则条件下，MLE 是渐近无偏、渐近正态、渐近有效（达到 Cramér–Rao 下界）。

- **反例 / 易混淆澄清**：
  - 导数为 0 只给出**临界点**，可能是极小值或拐点；务必二阶判断或边界比较。
  - MLE 对离散与连续都适用——离散时 $L$ 是概率，连续时是密度值。连续下 $L$ 可大于 1，勿误解。
  - 似然函数**不是** $\theta$ 的概率密度（没有积分归一的要求）。

- **术语对照**：极大似然 Maximum likelihood (ML) / 似然函数 Likelihood function / 对数似然 Log-likelihood / 临界点 Critical point / 边界解 Boundary solution / 渐近有效性 Asymptotic efficiency。

> **案例 C7（正态 $N(\mu,\sigma^2)$：MLE）**
> 【题目】$X_1,\dots,X_n\stackrel{\text{iid}}{\sim}N(\mu,\sigma^2)$。求 $\mu$ 与 $\sigma^2$ 的 MLE。
> 【求解步骤】
> ① $\ell(\mu,\sigma^2)=-\tfrac{n}{2}\ln(2\pi)-\tfrac{n}{2}\ln\sigma^2-\tfrac{1}{2\sigma^2}\sum_{i=1}^n(X_i-\mu)^2$。
> ② 对 $\mu$ 求导令为 0：$\sum(X_i-\mu)=0\Rightarrow\hat\mu=\bar X$（与矩估计相同）。
> ③ 对 $\sigma^2$ 求导令为 0：$-\tfrac{n}{2\sigma^2}+\tfrac{1}{2\sigma^4}\sum(X_i-\bar X)^2=0\Rightarrow\hat\sigma^2=\tfrac{1}{n}\sum(X_i-\bar X)^2$（与矩估计相同；有偏）。
> 【答案】$\hat\mu=\bar X$，$\hat\sigma^2=\tfrac{1}{n}\sum(X_i-\bar X)^2$。
> 【点评】二阶 Hesse 矩阵在解处为负定，确为最大值。

> **案例 C8（指数 $\text{Exp}(\lambda)$：MLE）**
> 【题目】求 $\lambda>0$ 的 MLE。
> 【求解步骤】
> ① $\ell(\lambda)=n\ln\lambda-\lambda\sum X_i$。
> ② $\ell'(\lambda)=n/\lambda-\sum X_i=0\Rightarrow\hat\lambda=n/\sum X_i=1/\bar X$（与矩估计相同）。
> ③ 验证：$\ell''(\lambda)=-n/\lambda^2<0$，是最大值。
> 【答案】$\hat\lambda=1/\bar X$。
> 【点评】对指数分布，MoM 与 MLE 一致；并非所有分布都如此。

> **案例 C9（均匀 $U(0,\theta)$：MLE——边界解、求导失效）**
> 【题目】求 $\theta$ 的 MLE 并讨论其期望。
> 【求解步骤】
> ① 似然：$L(\theta)=\prod_{i=1}^n \tfrac{1}{\theta}\mathbf{1}\{0\le X_i\le\theta\}=\theta^{-n}\mathbf{1}\{\theta\ge\max(X_i)\}$。
> ② 在 $\theta\ge M$（其中 $M=\max(X_i)$）范围内，$L(\theta)=\theta^{-n}$ 是 $\theta$ 的严格递减函数——最大值在**最小可取** $\theta=M$ 处达到。
> ③ 因此 $\hat\theta_{\text{MLE}}=M=\max(X_i)$（求导失效例，用**单调性 + 边界**判断）。
> ④ 分布：$P(M\le t)=(t/\theta)^n\ (0\le t\le\theta)$；密度 $f_M(t)=n t^{n-1}/\theta^n$。
> ⑤ $E(M)=\int_0^\theta t\cdot n t^{n-1}/\theta^n\,dt=n\theta/(n+1)$——**有偏**（偏低）；修正为 $(n+1)/n\cdot M$ 即无偏。
> ⑥ $\text{Var}(M)=n\theta^2/((n+1)^2(n+2))$。
> 【答案】$\hat\theta=M=\max(X_i)$；$E(M)=n\theta/(n+1)$。
> 【点评】边界解是 MLE 的一个重要情形；导数法不是万能的。

> **案例 C10（伯努利 $B(1,p)$：MLE）**
> 【题目】求 $p\in(0,1)$ 的 MLE。
> 【求解步骤】
> ① $L(p)=\prod_{i=1}^n p^{X_i}(1-p)^{1-X_i}=p^{\sum X_i}(1-p)^{n-\sum X_i}$。
> ② $\ell(p)=\sum X_i\cdot\ln p+(n-\sum X_i)\cdot\ln(1-p)$。
> ③ $\ell'(p)=\sum X_i/p-(n-\sum X_i)/(1-p)=0\Rightarrow \hat p=\bar X$（与矩估计相同）。
> 【答案】$\hat p=\bar X$。
> 【点评】对伯努利，三种视角（矩 / 似然 / 频率直觉）统一给出"样本比例"。

---

### KP4：MLE 的不变性（Invariance Property）

- **公理化定义 / 正式定义**：
  设 $\hat\theta$ 是 $\theta$ 的 MLE，$g:\Theta\to\mathbb{R}^m$ 是可测函数（不必一一、可导、连续）。则 $g(\hat\theta)$ 是 $g(\theta)$ 的 MLE。

- **关键性质**：
  1. 令 $\phi=g(\theta)$。定义"诱导似然" $M(\phi)=\sup_{\{\theta: g(\theta)=\phi\}}L(\theta)$。则 MLE 定义为使 $M(\phi)$ 最大的 $\phi$——结果恰为 $g(\hat\theta)$。
  2. 特别地，对一对一函数这是显然的；对多对一函数仍成立（取每个 $\phi$ 对应的 $\theta$ 中使 $L$ 最大者）。

- **反例 / 易混淆澄清**：
  - "不变性"不是"保持无偏性"：$\hat\sigma^2$ 有偏，$\hat\sigma=\sqrt{\hat\sigma^2}$ 也不是 $\sigma$ 的无偏估计，但它仍是 MLE。
  - 不变性只说"MLE 变换后仍为 MLE"，没有说"矩估计变换后仍为矩估计"（一般不成立）。

- **术语对照**：不变性 Invariance / 诱导似然 Induced likelihood / 可测变换 Measurable transformation。

> **案例 C11（正态方差的 MLE $\rightarrow$ 标准差的 MLE）**
> 【题目】正态 $\hat\sigma^2=\tfrac{1}{n}\sum(X_i-\bar X)^2$ 是 $\sigma^2$ 的 MLE。给出 $\sigma$ 的 MLE。
> 【求解步骤】
> ① 取 $g(x)=\sqrt{x}$。
> ② 由不变性：$\hat\sigma_{\text{MLE}}=\sqrt{\hat\sigma^2}$。
> 【答案】$\hat\sigma=\sqrt{\tfrac{1}{n}\sum(X_i-\bar X)^2}$。
> 【点评】注意它**有偏**（这是"MLE 不一定无偏"的典型）。

> **案例 C12（概率 $p$ 的 MLE $\rightarrow$ 胜率 odds $p/(1-p)$ 的 MLE）**
> 【题目】$B(1,p)$ 中 $\hat p=\bar X$。求 $g(p)=p/(1-p)$ 的 MLE。
> 【求解步骤】
> ① $\hat g_{\text{MLE}}=g(\hat p)=\hat p/(1-\hat p)=\bar X/(1-\bar X)$。
> 【答案】$\hat p/(1-\hat p)$。
> 【点评】常用于分类问题中的 odds 估计。

---

### KP5：估计量的评价与对比（典型例题 $U(0,\theta)$）

- **公理化定义 / 正式定义**：
  总体 $U(0,\theta)$。比较：
  - 矩估计：$\hat\theta_1=2\bar X$。
  - MLE：$\hat\theta_2=\max(X_i)$。
  - 修正 MLE：$\hat\theta_3=\tfrac{n+1}{n}\max(X_i)$。

- **关键性质（逐项对比）**：
  1. **期望**：
     - $E[\hat\theta_1]=2\cdot\theta/2=\theta$（无偏）。
     - $E[\hat\theta_2]=n\theta/(n+1)$（偏下）。
     - $E[\hat\theta_3]=\theta$（无偏）。
  2. **方差**：
     - $\text{Var}(\hat\theta_1)=\theta^2/(3n)$。
     - $\text{Var}(\hat\theta_2)=n\theta^2/((n+1)^2(n+2))$。
     - $\text{Var}(\hat\theta_3)=(n+1)^2/n^2\cdot \text{Var}(\hat\theta_2)=\theta^2/(n(n+2))$。
     - 比较：对 $n>1$，$n(n+2)>3n$，故 $\hat\theta_3$ 的方差小于 $\hat\theta_1$——**修正 MLE 更有效**。
  3. **均方误差 MSE**：
     - $\text{MSE}(\hat\theta_1)=\theta^2/(3n)$（无偏，MSE=方差）。
     - $\text{MSE}(\hat\theta_2)=\text{Var}(\hat\theta_2)+(\theta/(n+1))^2=n\theta^2/((n+1)^2(n+2))+\theta^2/(n+1)^2=(2n+2)\theta^2/((n+1)^2(n+2))=2\theta^2/((n+1)(n+2))$。
     - $\text{MSE}(\hat\theta_3)=\theta^2/(n(n+2))$。
     - 对大 $n$ 三者都趋于 0，但 MLE 类下降更快。
  4. **相合性**：三者都依概率收敛到 $\theta$——$\hat\theta_1$ 由 LLN，$\hat\theta_2$ 由 $P(\max(X_i)<t)=(t/\theta)^n\to 0$（对 $t<\theta$）与 $\to 1$（对 $t\ge\theta$）。
  5. **标准误直觉**：对任意估计量 $\hat\theta$，$\text{SE}(\hat\theta)=\sqrt{\text{Var}(\hat\theta)}$ 给出"典型误差量级"；区间估计直觉：$\hat\theta\pm 1.96\cdot\hat{\text{SE}}$。

- **反例 / 易混淆澄清**：
  - "有偏一定差"错误：$\hat\theta_2=M$ 的 MSE 通常小于无偏的 $\hat\theta_1$——虽然偏，但其方差很小，整体更靠近真值。
  - "MLE 一定最优"是渐近陈述；有限样本下可以通过无偏化修正（如 $\tfrac{n+1}{n}M$）进一步改善无偏性。

- **术语对照**：估计量对比 Estimator comparison / 标准误 Standard error / 均方误差 Mean squared error。

> **案例 C13（$U(0,\theta)$ 的完整对比）**
> 【题目】对 $U(0,\theta)$，列出三种估计的期望、方差、MSE 并比较。
> 【求解步骤】
> ① 结论汇总于上表思想：$\hat\theta_1=2\bar X$ 无偏、方差 $\theta^2/(3n)$；$\hat\theta_2=\max(X_i)$ 偏下 $E=n\theta/(n+1)$、方差 $n\theta^2/((n+1)^2(n+2))$；$\hat\theta_3=\tfrac{n+1}{n}\max$ 无偏、方差 $\theta^2/(n(n+2))$。
> ② 数值例 $n=10$：$\text{Var}(\hat\theta_1)=\theta^2/30\approx 0.033\theta^2$；$\text{Var}(\hat\theta_3)=\theta^2/120\approx 0.0083\theta^2$——后者约为前者 1/4，更精确。
> 【答案】修正 MLE 在无偏估计中方差最小。
> 【点评】这是"MLE 修正后优于矩估计"的经典演示。

> **案例 C14（方差比较——有效性讨论）**
> 【题目】在 $\hat\theta_1$ 与 $\hat\theta_3$ 之间，哪个更有效？
> 【求解步骤】
> ① 两者都无偏，比较方差：$\text{Var}(\hat\theta_3)=\theta^2/(n(n+2))<\theta^2/(3n)=\text{Var}(\hat\theta_1)$ 对任意 $n>1$。
> ② $\hat\theta_3$ 更有效，其方差比约为 $3/(n+2)$；当 $n=10$ 时约 $3/12=1/4$。
> 【答案】$\hat\theta_3$ 更有效。
> 【点评】有效性只在无偏估计之间谈；有偏估计用 MSE 比较更公平。

> **案例 C15（"估计量 $\pm$ 标准误"的直觉——通往区间估计）**
> 【题目】设 $\hat\theta$ 是一个渐近正态的估计量，标准误为 $\hat{\text{SE}}$。如何近似构造一个对 $\theta$ 的 95% 区间估计？
> 【求解步骤】
> ① 大样本下 $(\hat\theta-\theta)/\hat{\text{SE}}\approx N(0,1)$。
> ② 因此近似区间：$\hat\theta\pm 1.96\hat{\text{SE}}$。
> ③ 对有限样本 + 正态总体 + $\sigma$ 未知情形，应将 1.96 换成 $t$ 分位（第 17 节 KP2）。
> 【答案】$\hat\theta\pm 1.96\hat{\text{SE}}$（大样本）；小样本正态下 $\hat\theta\pm t_{0.025}(df)\hat{\text{SE}}$。
> 【点评】这是后续课程"区间估计 / 假设检验"的核心公式。

---

## 三、本节例题汇总

| 编号 | 所在 KP | 一句话摘要 |
|------|---------|------------|
| C1 | KP1 | $U(0,\theta)$：提出矩估计 $2\bar X$ 与 MLE $\max(X_i)$ 两种自然估计 |
| C2 | KP1 | 三条评价标准的直觉：无偏=长期平均准；有效=波动小；相合=样本大就收敛 |
| C3 | KP2 | $N(\mu,\sigma^2)$ 矩估计：$\hat\mu=\bar X$，$\hat\sigma^2=\tfrac{1}{n}\sum(X_i-\bar X)^2$（有偏） |
| C4 | KP2 | $\text{Exp}(\lambda)$ 矩估计：$\hat\lambda=1/\bar X$ |
| C5 | KP2 | $U(0,\theta)$ 矩估计：$\hat\theta=2\bar X$，无偏，方差 $\theta^2/(3n)$ |
| C6 | KP2 | $B(1,p)$ 矩估计：$\hat p=\bar X$，样本比例 |
| C7 | KP3 | $N(\mu,\sigma^2)$ MLE：与矩估计相同；$\hat\sigma^2$ 仍有偏 |
| C8 | KP3 | $\text{Exp}(\lambda)$ MLE：$\hat\lambda=1/\bar X$（与矩估计一致）；二阶导 $<0$ 验证 |
| C9 | KP3 | $U(0,\theta)$ MLE：$\max(X_i)$（边界解，求导失效）；$E=n\theta/(n+1)$ |
| C10 | KP3 | $B(1,p)$ MLE：$\hat p=\bar X$（与矩估计一致） |
| C11 | KP4 | 正态：$\hat\sigma=\sqrt{\hat\sigma^2}$ 是 $\sigma$ 的 MLE（由不变性） |
| C12 | KP4 | 伯努利：$\hat p/(1-\hat p)$ 是 odds 的 MLE（由不变性） |
| C13 | KP5 | $U(0,\theta)$ 三估计的期望 / 方差 / MSE 完整对比 |
| C14 | KP5 | 无偏估计的方差比较：$\hat\theta_3=(n+1)/n\cdot\max$ 比 $\hat\theta_1=2\bar X$ 更有效 |
| C15 | KP5 | "估计量 $\pm$ 标准误"的区间直觉——大样本用 $1.96$，小样本正态用 $t$ |

---

## 四、反例与反命题澄清（小结）

| 常见误解 | 正确说法 | 备注 |
|----------|----------|------|
| "MLE 一定无偏" | MLE 可能有偏（如 $U(0,\theta)$ 的 $\max$，正态的 $\hat\sigma^2$）；有时可以用简单因子修正使其无偏 | 大样本下偏倚通常趋于 0 |
| "无偏估计是最优的" | 有偏估计的 MSE 可以更小（如 $U(0,\theta)$ 的 $\max$ 相比 $2\bar X$）；"有效性"只在无偏估计之间比较 | MSE 是综合比较的通用指标 |
| "似然函数是参数的概率密度" | 似然是"样本作为 $\theta$ 的函数"的联合密度值——没有概率密度的归一性（可大于 1，可不积分为 1） | 贝叶斯框架下与先验结合才得后验密度 |
| "求导解方程一定给出 MLE" | 仅在"内部最大值"情形；对边界解（如 $U(0,\theta)$ 的 $\max$）求导失效，要用单调性/边界比较 | 检查二阶条件或边界很重要 |
| "矩估计与 MLE 相同" | 对正态、指数、伯努利等常见单参数族相同，但对许多分布不同（如 $U(0,\theta)$、位置-尺度混合模型） | 二者思想来源完全不同 |
| "MLE 的不变性意味着保持无偏性" | 不变性只保持"MLE 属性"，**不**保持"无偏属性"——$\hat\sigma=\sqrt{\hat\sigma^2}$ 仍是 MLE，但不是 $\sigma$ 的无偏估计 | 非线性操作下期望交换失败 |

---

## 五、通向下一步的衔接

- 本节给出的两种估计方法——矩估计与 MLE——以及"估计量 $\pm$ 标准误"的区间直觉，是后续课程**区间估计**（confidence interval）与**假设检验**（hypothesis testing）的起点：对正态总体均值，用 $\bar X\pm t_{\alpha/2}(n-1)S/\sqrt{n}$；对总体方差，用 $[(n-1)S^2/\chi^2_{\alpha/2}(n-1),\ (n-1)S^2/\chi^2_{1-\alpha/2}(n-1)]$；对比两方差用 $F$ 分布。
- 若跳过本节，将不知道"为什么置信区间长这样""为什么这些检验统计量服从这些分布""大样本近似从哪来"。本课在此收束于**参数点估计及其标准误**——它是统计推断这座大厦的一楼。
