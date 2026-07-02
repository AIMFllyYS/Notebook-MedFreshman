# 考点十四·总体与样本

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch06 样本及抽样分布
> 题量：9题（选择4题 + 填空5题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{10})$ 为来自总体 $X \sim E(1)$ 的简单随机样本，则 $DX$ 和 $ES^2$ 分别为（　　）

A. 1, 1
B. 0.1, 1
C. 0.1, 2
D. 1, 0.2
:::

:::callout{kind=insight label="解析"}
$X \sim E(1)$：$EX = 1$，$DX = 1$

样本均值 $\bar{X} = \frac{1}{10}\sum_{i=1}^{10} X_i$

$$D\bar{X} = \frac{DX}{n} = \frac{1}{10} = 0.1$$

样本方差 $S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2$

对于任何总体，$ES^2 = DX = 1$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
样本均值方差：$D\bar{X} = \frac{DX}{n}$。样本方差期望：$ES^2 = DX$（无偏性）。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设总体 $X \sim B(1, p)$，$(X_1, X_2, X_3)$ 是该总体的样本，$U = X_1 + X_2$，$V = 2X_3$，则（　　）

A. $U = V$
B. $P(U = V) = 1$
C. $DU = DV$
D. $EU = EV$
:::

:::callout{kind=insight label="解析"}
$X_i \sim B(1, p)$：$EX_i = p$，$DX_i = p(1-p)$

$EU = E(X_1 + X_2) = 2p$

$EV = E(2X_3) = 2p$

$EU = EV$，D 正确。

$DU = D(X_1 + X_2) = 2p(1-p)$

$DV = D(2X_3) = 4p(1-p)$

$DU \neq DV$，C 错误。

A、B 显然错误。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
期望的线性性质：$E(aX + bY) = aEX + bEY$。方差的性质：$D(aX) = a^2 DX$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $X_1 \sim X_{10}$ 是来自总体 $X$ 的简单随机样本，$EX = 4$，$DX = 0.9$，则（　　）

A. $E\bar{X} = 4$，$D\bar{X} = 0.09$
B. $E\bar{X} = 4$，$D\bar{X} = 0.9$
C. $E\bar{X} = 0.4$，$D\bar{X} = 0.09$
D. $E\bar{X} = 0.4$，$D\bar{X} = 0.9$
:::

:::callout{kind=insight label="解析"}
样本均值 $\bar{X} = \frac{1}{10}\sum_{i=1}^{10} X_i$

$$E\bar{X} = EX = 4$$

$$D\bar{X} = \frac{DX}{n} = \frac{0.9}{10} = 0.09$$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
样本均值性质：$E\bar{X} = EX$（无偏），$D\bar{X} = \frac{DX}{n}$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, X_3)$ 为取自总体 $N(0, \sigma^2)$ 的样本，$\sigma^2$ 为未知参数，$T_1 = X_1 + X_2 + X_3$，$T_2 = \frac{X_3 - X_1}{2}$，$T_3 = \frac{\sum_{i=1}^n X_i}{\sigma}$ 和 $T_4 = \max\{X_1, X_2, X_3\}$ 中不是统计量的为（　　）

A. $T_1$
B. $T_2$
C. $T_3$
D. $T_4$
:::

:::callout{kind=insight label="解析"}
统计量的定义：不依赖于未知参数的样本函数。

$T_1, T_2, T_4$ 都不依赖于 $\sigma^2$，是统计量。

$T_3 = \frac{\sum X_i}{\sigma}$ 依赖于未知参数 $\sigma$，不是统计量。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
统计量：样本的函数，不包含任何未知参数。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, X_3, X_4)$ 为取自总体 $E(3)$ 的样本，$\bar{X}$ 为样本均值，则 $D\bar{X} =$（　　）

A. $\frac{1}{3}$
B. $\frac{1}{36}$
C. $\frac{1}{9}$
D. $\frac{1}{12}$
:::

:::callout{kind=insight label="解析"}
$X \sim E(3)$：$DX = \frac{1}{3^2} = \frac{1}{9}$

$$D\bar{X} = \frac{DX}{n} = \frac{1/9}{4} = \frac{1}{36}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
指数分布 $E(\lambda)$：$DX = \frac{1}{\lambda^2}$。样本均值方差：$D\bar{X} = \frac{DX}{n}$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{10})$ 为取自二项总体 $B(25, \frac{1}{5})$ 的样本，$S^2$ 为样本方差，则 $ES^2 =$（　　）

A. $\frac{1}{5}$
B. 5
C. 25
D. 4
:::

:::callout{kind=insight label="解析"}
$X \sim B(25, \frac{1}{5})$：$DX = 25 \times \frac{1}{5} \times \frac{4}{5} = 4$

样本方差的无偏性：$ES^2 = DX = 4$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
样本方差无偏性：$ES^2 = DX$。二项分布方差：$DX = np(1-p)$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设总体 $X \sim P(2)$，设 $X_1, X_2, \ldots, X_n$ 是来自总体 $X$ 的简单随机样本，记 $\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$，则 $D\bar{X} =$（　　）

A. $\frac{2}{n^2}$
B. $\frac{2}{n}$
C. $\frac{4}{n}$
D. $\frac{4}{n^2}$
:::

:::callout{kind=insight label="解析"}
$X \sim P(2)$：$DX = 2$

$$D\bar{X} = \frac{DX}{n} = \frac{2}{n}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
泊松分布方差：$DX = \lambda$。样本均值方差：$D\bar{X} = \frac{\lambda}{n}$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
从总体 $U(\theta - 1.5, \theta + 1.5)$ 抽取样本 $X_1, X_2, \ldots, X_n$，用样本均值 $\bar{X}$ 估计未知参数 $\theta$，当样本容量 $n$ ______ 时，$D\bar{X} \leq 0.01$。
:::

:::callout{kind=insight label="解析"}
$X \sim U(\theta - 1.5, \theta + 1.5)$：$DX = \frac{[ (\theta + 1.5) - (\theta - 1.5) ]^2}{12} = \frac{9}{12} = \frac{3}{4}$

$$D\bar{X} = \frac{DX}{n} = \frac{3/4}{n} \leq 0.01$$

$$\frac{3}{4n} \leq 0.01$$

$$n \geq \frac{3}{4 \times 0.01} = \frac{3}{0.04} = 75$$

当 $n \geq 75$ 时，$D\bar{X} \leq 0.01$。
:::

:::callout{kind=tip label="结论速记"}
均匀分布 $U(a, b)$：$DX = \frac{(b-a)^2}{12}$。样本均值方差随 $n$ 增大而减小。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{10})$ 是来自总体 $X \sim N(\mu, 2^2)$ 的简单随机样本，其中 $\mu$ 未知，$\bar{X}, S^2$ 分别为样本均值、样本方差，则 $D(\bar{X} + S^2) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X \sim N(\mu, 4)$：$DX = 4$

$$D\bar{X} = \frac{DX}{n} = \frac{4}{10} = 0.4$$

对于正态总体，$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$

$$DS^2 = \frac{2\sigma^4}{n-1} = \frac{2 \times 16}{9} = \frac{32}{9}$$

$\bar{X}$ 与 $S^2$ 独立（正态总体的性质）

$$D(\bar{X} + S^2) = D\bar{X} + DS^2 = 0.4 + \frac{32}{9} = \frac{3.6 + 32}{9} = \frac{35.6}{9} = \frac{89}{25}$$
:::

:::callout{kind=tip label="结论速记"}
正态总体：$\bar{X}$ 与 $S^2$ 独立。$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$，$DS^2 = \frac{2\sigma^4}{n-1}$。
:::

---

> 本考点练习完
