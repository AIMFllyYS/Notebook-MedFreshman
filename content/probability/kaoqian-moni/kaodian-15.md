# 考点十五·三大分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch06 三大抽样分布
> 题量：13题（选择7题 + 填空6题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $X_1 \sim X_{10}$ 相互独立，均服从 $N(0, 1)$。$Z = c \times \frac{X_1^2}{X_2^2 + X_3^2 + X_4^2}$ 服从 $F$ 分布，则常数 $c =$（　　）

A. 3
B. $\frac{1}{3}$
C. $\frac{2}{3}$
D. $\frac{1}{2}$
:::

:::callout{kind=insight label="解析"}
$X_1^2 \sim \chi^2(1)$

$X_2^2 + X_3^2 + X_4^2 \sim \chi^2(3)$

$F$ 分布定义：若 $U \sim \chi^2(n_1)$，$V \sim \chi^2(n_2)$ 独立，则 $\frac{U/n_1}{V/n_2} \sim F(n_1, n_2)$

$$\frac{X_1^2/1}{(X_2^2 + X_3^2 + X_4^2)/3} \sim F(1, 3)$$

$$\frac{X_1^2}{X_2^2 + X_3^2 + X_4^2} = \frac{1}{3} F(1, 3)$$

因此 $c = 3$ 时，$Z = 3 \times \frac{X_1^2}{X_2^2 + X_3^2 + X_4^2} \sim F(1, 3)$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$F$ 分布构造：$\frac{\chi^2(n_1)/n_1}{\chi^2(n_2)/n_2} \sim F(n_1, n_2)$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
在正态分布、指数分布、均匀分布、泊松分布、$\chi^2$ 分布、$t$ 分布和 $F$ 分布这7个一维分布中，具有可加性的有（　　）

A. 2个
B. 3个
C. 4个
D. 5个
:::

:::callout{kind=insight label="解析"}
具有可加性的分布：
- 正态分布：独立正态变量之和仍为正态
- 泊松分布：独立泊松变量之和仍为泊松
- $\chi^2$ 分布：独立 $\chi^2$ 变量之和仍为 $\chi^2$
- 指数分布：独立指数变量之和为伽马分布（非指数，但可加）
- 均匀分布：不可加
- $t$ 分布：不可加
- $F$ 分布：不可加

严格来说，正态、泊松、$\chi^2$ 具有可加性。指数分布的和是伽马分布，不算保持原分布的可加性。

选 **B**（3个：正态、泊松、$\chi^2$）。
:::

:::callout{kind=tip label="结论速记"}
可加性分布：正态、泊松、$\chi^2$。独立同分布变量之和仍为同类型分布。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X \sim \chi^2(5)$，若 $P(X < x) = 0.9$，则 $x =$（　　）

A. $\chi^2_{0.1}(5)$
B. $\chi^2_{0.9}(5)$
C. $-\chi^2_{0.9}(5)$
D. $-\chi^2_{0.1}(5)$
:::

:::callout{kind=insight label="解析"}
$\chi^2$ 分布的分位数定义：$\chi^2_\alpha(n)$ 满足 $P(X > \chi^2_\alpha(n)) = \alpha$

$P(X < x) = 0.9 \iff P(X > x) = 0.1$

因此 $x = \chi^2_{0.1}(5)$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$\chi^2$ 分位数：$\chi^2_\alpha(n)$ 是上侧 $\alpha$ 分位数，$P(X > \chi^2_\alpha(n)) = \alpha$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_6)$ 是取自正态总体 $N(0, 2)$ 的样本，若 $a \cdot \frac{X_1 + X_3 - X_5}{\sqrt{X_2^2 + X_4^2 + X_6^2}} \sim t$ 分布，则常数 $a =$（　　）

A. $\sqrt{\frac{1}{3}}$
B. $\sqrt{\frac{2}{3}}$
C. 1
D. $\sqrt{\frac{1}{2}}$
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 2)$：$X_i/\sqrt{2} \sim N(0, 1)$

分子：$X_1 + X_3 - X_5 \sim N(0, 6)$

标准化：$\frac{X_1 + X_3 - X_5}{\sqrt{6}} \sim N(0, 1)$

分母：$X_2^2 + X_4^2 + X_6^2$

$$\frac{X_2^2 + X_4^2 + X_6^2}{2} \sim \chi^2(3)$$

$t$ 分布定义：$\frac{N(0,1)}{\sqrt{\chi^2(n)/n}} \sim t(n)$

$$\frac{\frac{X_1 + X_3 - X_5}{\sqrt{6}}}{\sqrt{\frac{X_2^2 + X_4^2 + X_6^2}{2 \times 3}}} = \frac{X_1 + X_3 - X_5}{\sqrt{X_2^2 + X_4^2 + X_6^2}} \sim t(3)$$

与题目形式对比：$a \cdot \frac{X_1 + X_3 - X_5}{\sqrt{X_2^2 + X_4^2 + X_6^2}}$

因此 $a = 1$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布构造：$\frac{N(0,1)}{\sqrt{\chi^2(n)/n}} \sim t(n)$。分子是标准正态，分母是卡方除以自由度开方。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $(X_1, \ldots, X_n)$ 是来自正态总体 $N(\mu, \sigma^2)$ 的样本，$\bar{X}$ 为样本均值，则 $\frac{1}{\sigma^2}\sum_{i=1}^n (X_i - \mu)^2$ 和 $\frac{1}{\sigma^2}\sum_{i=1}^n (X_i - \bar{X})^2$ 分别服从的分布为（　　）

A. $\chi^2(n)$, $\chi^2(n)$
B. $\chi^2(n)$, $\chi^2(n-1)$
C. $\chi^2(n-1)$, $\chi^2(n-1)$
D. $\chi^2(n-1)$, $\chi^2(n)$
:::

:::callout{kind=insight label="解析"}
$\frac{X_i - \mu}{\sigma} \sim N(0, 1)$

$$\sum_{i=1}^n \left(\frac{X_i - \mu}{\sigma}\right)^2 = \frac{1}{\sigma^2}\sum_{i=1}^n (X_i - \mu)^2 \sim \chi^2(n)$$

$\frac{X_i - \bar{X}}{\sigma}$ 满足约束 $\sum (X_i - \bar{X}) = 0$，自由度为 $n-1$

$$\sum_{i=1}^n \left(\frac{X_i - \bar{X}}{\sigma}\right)^2 = \frac{1}{\sigma^2}\sum_{i=1}^n (X_i - \bar{X})^2 \sim \chi^2(n-1)$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\frac{\sum(X_i - \mu)^2}{\sigma^2} \sim \chi^2(n)$，$\frac{\sum(X_i - \bar{X})^2}{\sigma^2} \sim \chi^2(n-1)$。后者自由度少1因为样本均值约束。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $T \sim t(6)$，若 $P(|T| < x) = 0.8$，则 $x =$（　　）

A. $t_{0.2}(6)$
B. $t_{0.8}(6)$
C. $t_{0.1}(6)$
D. $t_{0.3}(6)$
:::

:::callout{kind=insight label="解析"}
$t$ 分布对称：$P(|T| < x) = 0.8$

$$P(T < x) - P(T < -x) = 0.8$$

$$P(T < x) - (1 - P(T < x)) = 0.8$$

$$2P(T < x) - 1 = 0.8$$

$$P(T < x) = 0.9$$

因此 $x = t_{0.1}(6)$（上侧0.1分位数，即 $P(T > t_{0.1}(6)) = 0.1$）

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布对称：$P(|T| < x) = 0.8 \iff P(T < x) = 0.9 \iff x = t_{0.1}(n)$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{10})$ 为取自正态总体 $N(0, 1)$ 的样本，则统计量 $Y = \frac{1}{S}\sum_{k=1}^5 X_k^2 + \sum_{k=6}^{10} X_k^2$ 服从的分布为______。
:::

:::callout{kind=insight label="解析"}
$\sum_{k=1}^5 X_k^2 \sim \chi^2(5)$，$\sum_{k=6}^{10} X_k^2 \sim \chi^2(5)$

设 $U = \sum_{k=1}^5 X_k^2$，$V = \sum_{k=6}^{10} X_k^2$

$Y = \frac{U}{S} + V$，其中 $S^2$ 是样本方差。

实际上题目可能有误，$S$ 的定义不明确。假设 $S^2 = \frac{1}{9}\sum_{i=1}^{10}(X_i - \bar{X})^2$。

此题较为复杂，可能需要更明确的定义。
:::

:::callout{kind=tip label="结论速记"}
标准正态样本平方和服从卡方分布。注意自由度。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 是来自总体 $N(\mu, \sigma^2)$ 的样本，$\bar{X}$ 为样本均值，则 $\frac{\bar{X} - \mu}{S/\sqrt{n}}$ 服从______分布。
:::

:::callout{kind=insight label="解析"}
$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim N(0, 1)$$

$$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$$

由 $t$ 分布定义：

$$\frac{\bar{X} - \mu}{S/\sqrt{n}} = \frac{\frac{\bar{X} - \mu}{\sigma/\sqrt{n}}}{\sqrt{\frac{(n-1)S^2}{\sigma^2(n-1)}}} \sim t(n-1)$$
:::

:::callout{kind=tip label="结论速记"}
单样本 $t$ 统计量：$\frac{\bar{X} - \mu}{S/\sqrt{n}} \sim t(n-1)$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_{n_1}$ 和 $Y_1, Y_2, \ldots, Y_{n_2}$ 分别来自 $N(\mu_1, \sigma^2)$ 和 $N(\mu_2, \sigma^2)$ 的独立样本，则 $\frac{(\bar{X} - \bar{Y}) - (\mu_1 - \mu_2)}{S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}}$ 服从______分布，其中 $S_w^2 = \frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1 + n_2 - 2}$。
:::

:::callout{kind=insight label="解析"}
两样本 $t$ 统计量：

$$\frac{(\bar{X} - \bar{Y}) - (\mu_1 - \mu_2)}{S_w\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}} \sim t(n_1 + n_2 - 2)$$
:::

:::callout{kind=tip label="结论速记"}
两样本 $t$ 统计量：自由度为 $n_1 + n_2 - 2$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 是来自总体 $N(\mu, \sigma^2)$ 的样本，则 $\frac{nS^2}{\sigma^2}$ 服从______分布。
:::

:::callout{kind=insight label="解析"}
$$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$$

$$\frac{nS^2}{\sigma^2} = \frac{n}{n-1} \cdot \frac{(n-1)S^2}{\sigma^2}$$

这不是标准的卡方分布，而是卡方分布的常数倍。

如果题目指的是 $\frac{(n-1)S^2}{\sigma^2}$，则服从 $\chi^2(n-1)$。
:::

:::callout{kind=tip label="结论速记"}
标准形式：$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$。
:::

---

### 第11题

:::callout{kind=note label="题目"}
设 $X \sim F(m, n)$，则 $\frac{1}{X}$ 服从______分布。
:::

:::callout{kind=insight label="解析"}
$F$ 分布性质：若 $X \sim F(m, n)$，则 $\frac{1}{X} \sim F(n, m)$。
:::

:::callout{kind=tip label="结论速记"}
$F$ 分布倒数性质：$F(m, n)$ 的倒数服从 $F(n, m)$。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设 $T \sim t(n)$，则 $T^2$ 服从______分布。
:::

:::callout{kind=insight label="解析"}
$t$ 分布与 $F$ 分布的关系：若 $T \sim t(n)$，则 $T^2 \sim F(1, n)$。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布平方：$t(n)$ 的平方服从 $F(1, n)$。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设 $X_1, X_2, X_3, X_4$ 是来自 $N(0, 4)$ 的样本，则 $\frac{X_1^2 + X_2^2}{X_3^2 + X_4^2}$ 服从______分布。
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 4)$：$\frac{X_i}{2} \sim N(0, 1)$

$$\frac{X_1^2 + X_2^2}{4} \sim \chi^2(2), \quad \frac{X_3^2 + X_4^2}{4} \sim \chi^2(2)$$

$$\frac{X_1^2 + X_2^2}{X_3^2 + X_4^2} = \frac{\frac{X_1^2 + X_2^2}{4}/2}{\frac{X_3^2 + X_4^2}{4}/2} \sim F(2, 2)$$
:::

:::callout{kind=tip label="结论速记"}
正态样本平方和比：$\frac{\chi^2(m)/m}{\chi^2(n)/n} \sim F(m, n)$。
:::

---

> 本考点练习完
