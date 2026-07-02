# 考点十六·矩估计和极大似然估计、估计量评选标准

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch07 参数估计
> 题量：13题（选择+填空+计算）

---

### 第1题

:::callout{kind=note label="题目"}
设总体 $X \sim N(\mu, \sigma^2)$，$X_1, X_2, \ldots, X_n$ 和 $Y_1, Y_2, \ldots, Y_m$ 分别是来自总体 $X$ 和 $Y$ 的简单随机样本，且同分布，样本方差分别是 $S_X^2, S_Y^2$，则 $\sigma^2$ 的一个无偏估计是（　　）

A. $S_X^2 + S_Y^2$
B. $\frac{(m-1)S_X^2 + (n-1)S_Y^2}{m + n - 2}$
C. $\frac{S_X^2 + S_Y^2}{m + n - 2}$
D. $\frac{(m-1)S_X^2 + (n-1)S_Y^2}{m + n}$
:::

:::callout{kind=insight label="解析"}
$ES_X^2 = \sigma^2$，$ES_Y^2 = \sigma^2$（样本方差无偏性）

联合估计：$\hat{\sigma}^2 = \frac{(m-1)S_X^2 + (n-1)S_Y^2}{m + n - 2}$

$$E\hat{\sigma}^2 = \frac{(m-1)\sigma^2 + (n-1)\sigma^2}{m + n - 2} = \sigma^2$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
两样本方差联合无偏估计：加权平均，权重为各自自由度。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设总体 $X$ 的密度函数为 $f(x) = \begin{cases} \theta x^{\theta-1}, & 0 < x < 1 \\ 0, & \text{其他} \end{cases}$（$\theta > 0$），$X_1, X_2, \ldots, X_n$ 为样本，则 $\theta$ 的矩估计量为______。
:::

:::callout{kind=insight label="解析"}
$$EX = \int_0^1 x \cdot \theta x^{\theta-1} \, dx = \theta \int_0^1 x^\theta \, dx = \theta \cdot \frac{1}{\theta + 1} = \frac{\theta}{\theta + 1}$$

样本均值 $\bar{X} = \frac{1}{n}\sum X_i$

令 $\bar{X} = \frac{\theta}{\theta + 1}$，解得 $\theta = \frac{\bar{X}}{1 - \bar{X}}$

矩估计量：$\hat{\theta} = \frac{\bar{X}}{1 - \bar{X}}$
:::

:::callout{kind=tip label="结论速记"}
矩估计：用样本矩代替总体矩，解方程求参数。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设总体 $X \sim U(0, \theta)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\theta$ 的极大似然估计量为______。
:::

:::callout{kind=insight label="解析"}
似然函数：$L(\theta) = \prod_{i=1}^n f(x_i; \theta) = \begin{cases} \frac{1}{\theta^n}, & 0 < x_i < \theta, \forall i \\ 0, & \text{其他} \end{cases}$

要使 $L(\theta)$ 最大，需要 $\theta$ 尽可能小，但 $\theta \geq \max\{x_1, \ldots, x_n\}$

因此 $\hat{\theta} = \max\{X_1, \ldots, X_n\} = X_{(n)}$
:::

:::callout{kind=tip label="结论速记"}
均匀分布 $U(0, \theta)$ 的MLE：$\hat{\theta} = X_{(n)}$（样本最大值）。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设总体 $X \sim E(\lambda)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\lambda$ 的极大似然估计量为______。
:::

:::callout{kind=insight label="解析"}
似然函数：$L(\lambda) = \prod_{i=1}^n \lambda e^{-\lambda x_i} = \lambda^n e^{-\lambda \sum x_i}$

对数似然：$\ln L(\lambda) = n \ln \lambda - \lambda \sum x_i$

求导：$\frac{d}{d\lambda} \ln L(\lambda) = \frac{n}{\lambda} - \sum x_i = 0$

$$\hat{\lambda} = \frac{n}{\sum X_i} = \frac{1}{\bar{X}}$$
:::

:::callout{kind=tip label="结论速记"}
指数分布MLE：$\hat{\lambda} = \frac{1}{\bar{X}}$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设总体 $X \sim P(\lambda)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\lambda$ 的矩估计量和极大似然估计量分别为______。
:::

:::callout{kind=insight label="解析"}
矩估计：$EX = \lambda$，令 $\bar{X} = \lambda$，$\hat{\lambda}_{\text{矩}} = \bar{X}$

极大似然：$L(\lambda) = \prod_{i=1}^n \frac{e^{-\lambda} \lambda^{x_i}}{x_i!} = e^{-n\lambda} \lambda^{\sum x_i} \prod \frac{1}{x_i!}$

$\ln L(\lambda) = -n\lambda + (\sum x_i) \ln \lambda + \text{常数}$

$\frac{d}{d\lambda} \ln L(\lambda) = -n + \frac{\sum x_i}{\lambda} = 0$

$\hat{\lambda}_{\text{MLE}} = \frac{\sum X_i}{n} = \bar{X}$

两者相同：$\hat{\lambda} = \bar{X}$
:::

:::callout{kind=tip label="结论速记"}
泊松分布：矩估计和MLE都是 $\bar{X}$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设总体 $X \sim N(\mu, \sigma^2)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\mu$ 和 $\sigma^2$ 的极大似然估计量分别为______。
:::

:::callout{kind=insight label="解析"}
似然函数：$L(\mu, \sigma^2) = \prod_{i=1}^n \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x_i - \mu)^2}{2\sigma^2}}$

对数似然：$\ln L = -\frac{n}{2}\ln(2\pi\sigma^2) - \frac{1}{2\sigma^2}\sum (x_i - \mu)^2$

对 $\mu$ 求导：$\frac{\partial}{\partial \mu} \ln L = \frac{1}{\sigma^2}\sum (x_i - \mu) = 0$

$\hat{\mu} = \bar{X}$

对 $\sigma^2$ 求导：$\frac{\partial}{\partial \sigma^2} \ln L = -\frac{n}{2\sigma^2} + \frac{1}{2\sigma^4}\sum (x_i - \bar{X})^2 = 0$

$\hat{\sigma}^2 = \frac{1}{n}\sum (X_i - \bar{X})^2$（注意：这是有偏估计）
:::

:::callout{kind=tip label="结论速记"}
正态分布MLE：$\hat{\mu} = \bar{X}$，$\hat{\sigma}^2 = \frac{1}{n}\sum(X_i - \bar{X})^2$（有偏）。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $\hat{\theta}_1$ 和 $\hat{\theta}_2$ 都是参数 $\theta$ 的无偏估计，且 $D\hat{\theta}_1 < D\hat{\theta}_2$，则称 $\hat{\theta}_1$ 比 $\hat{\theta}_2$ ______。
:::

:::callout{kind=insight label="解析"}
有效性：若两个估计量都是无偏的，方差较小的更有效。

$\hat{\theta}_1$ 比 $\hat{\theta}_2$ 更有效。
:::

:::callout{kind=tip label="结论速记"}
无偏估计的比较：方差越小越有效。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设总体 $X \sim U(\theta, \theta + 1)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\theta$ 的矩估计量为______。
:::

:::callout{kind=insight label="解析"}
$X \sim U(\theta, \theta + 1)$：$EX = \theta + \frac{1}{2}$，$DX = \frac{1}{12}$

令 $\bar{X} = \theta + \frac{1}{2}$，解得 $\hat{\theta} = \bar{X} - \frac{1}{2}$
:::

:::callout{kind=tip label="结论速记"}
均匀分布 $U(a, b)$：$EX = \frac{a+b}{2}$，$DX = \frac{(b-a)^2}{12}$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设总体 $X$ 的密度函数为 $f(x) = \begin{cases} \frac{1}{\theta} e^{-x/\theta}, & x > 0 \\ 0, & x \leq 0 \end{cases}$（$\theta > 0$），$X_1, X_2, \ldots, X_n$ 为样本，则 $\theta$ 的极大似然估计量为______。
:::

:::callout{kind=insight label="解析"}
$X \sim E(\frac{1}{\theta})$，即 $EX = \theta$

似然函数：$L(\theta) = \prod_{i=1}^n \frac{1}{\theta} e^{-x_i/\theta} = \theta^{-n} e^{-\sum x_i/\theta}$

$\ln L(\theta) = -n \ln \theta - \frac{\sum x_i}{\theta}$

$\frac{d}{d\theta} \ln L(\theta) = -\frac{n}{\theta} + \frac{\sum x_i}{\theta^2} = 0$

$\hat{\theta} = \frac{\sum X_i}{n} = \bar{X}$
:::

:::callout{kind=tip label="结论速记"}
指数分布参数的MLE：$\hat{\theta} = \bar{X}$（当密度为 $\frac{1}{\theta}e^{-x/\theta}$ 时）。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设总体 $X \sim B(1, p)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $p$ 的矩估计量和极大似然估计量分别为______。
:::

:::callout{kind=insight label="解析"}
矩估计：$EX = p$，令 $\bar{X} = p$，$\hat{p}_{\text{矩}} = \bar{X}$

极大似然：$L(p) = \prod_{i=1}^n p^{x_i} (1-p)^{1-x_i} = p^{\sum x_i} (1-p)^{n - \sum x_i}$

$\ln L(p) = (\sum x_i) \ln p + (n - \sum x_i) \ln(1-p)$

$\frac{d}{dp} \ln L(p) = \frac{\sum x_i}{p} - \frac{n - \sum x_i}{1-p} = 0$

$\hat{p}_{\text{MLE}} = \frac{\sum X_i}{n} = \bar{X}$

两者相同：$\hat{p} = \bar{X}$
:::

:::callout{kind=tip label="结论速记"}
伯努利分布：矩估计和MLE都是样本均值 $\bar{X}$。
:::

---

### 第11题

:::callout{kind=note label="题目"}
设 $\hat{\theta}$ 是 $\theta$ 的无偏估计，且 $\lim_{n \to \infty} D\hat{\theta} = 0$，则 $\hat{\theta}$ 是 $\theta$ 的______估计。
:::

:::callout{kind=insight label="解析"}
相合性（一致性）：若估计量依概率收敛于真实参数，则称为相合估计。

由切比雪夫不等式：$P(|\hat{\theta} - \theta| \geq \varepsilon) \leq \frac{D\hat{\theta}}{\varepsilon^2} \to 0$

因此 $\hat{\theta}$ 是相合估计。
:::

:::callout{kind=tip label="结论速记"}
无偏 + 方差趋于0 ⟹ 相合（一致）估计。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设总体 $X \sim N(\mu, 1)$，$X_1, X_2, \ldots, X_n$ 为样本，则 $\mu$ 的极大似然估计量 $\hat{\mu}$ 的方差为______。
:::

:::callout{kind=insight label="解析"}
$\hat{\mu} = \bar{X}$

$$D\hat{\mu} = D\bar{X} = \frac{DX}{n} = \frac{1}{n}$$
:::

:::callout{kind=tip label="结论速记"}
正态总体均值的MLE方差：$D\bar{X} = \frac{\sigma^2}{n}$。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设总体 $X$ 的密度函数为 $f(x) = \begin{cases} (\theta + 1)x^\theta, & 0 < x < 1 \\ 0, & \text{其他} \end{cases}$（$\theta > -1$），$X_1, X_2, \ldots, X_n$ 为样本，$x_1, x_2, \ldots, x_n$ 为样本观测值，求 $\theta$ 的矩估计量和极大似然估计值。
:::

:::callout{kind=insight label="解析"}
**(1) 矩估计**

$$EX = \int_0^1 x \cdot (\theta + 1)x^\theta \, dx = (\theta + 1) \int_0^1 x^{\theta + 1} \, dx = (\theta + 1) \cdot \frac{1}{\theta + 2} = \frac{\theta + 1}{\theta + 2}$$

令 $\bar{X} = \frac{\theta + 1}{\theta + 2}$，解得 $\hat{\theta} = \frac{2\bar{X} - 1}{1 - \bar{X}}$

**(2) 极大似然估计**

似然函数：$L(\theta) = \prod_{i=1}^n (\theta + 1)x_i^\theta = (\theta + 1)^n \left(\prod x_i\right)^\theta$

$\ln L(\theta) = n \ln(\theta + 1) + \theta \sum \ln x_i$

$\frac{d}{d\theta} \ln L(\theta) = \frac{n}{\theta + 1} + \sum \ln x_i = 0$

$\hat{\theta} = -1 - \frac{n}{\sum \ln X_i}$
:::

:::callout{kind=tip label="结论速记"}
幂分布参数估计：矩估计用期望，MLE用对数似然。
:::

---

> 本考点练习完
