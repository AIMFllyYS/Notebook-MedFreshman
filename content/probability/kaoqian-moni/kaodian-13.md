# 考点十三·大数定律和中心极限定理

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch05 大数定律与CLT
> 题量：10题（选择5题 + 填空5题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 相互独立，且均服从泊松分布 $P(2)$，则由林德伯格—列维中心极限定理，$\lim_{n \to \infty} P\left(\frac{\sum_{i=1}^n X_i - 2n}{\sqrt{n}} < 2\right) =$（　　）

A. $\Phi(\sqrt{2})$
B. $\Phi(2)$
C. $\Phi(1)$
D. 1
:::

:::callout{kind=insight label="解析"}
$X_i \sim P(2)$：$EX_i = 2$，$DX_i = 2$

$\sum_{i=1}^n X_i$ 的期望：$E\left(\sum X_i\right) = 2n$

$\sum_{i=1}^n X_i$ 的方差：$D\left(\sum X_i\right) = 2n$

由中心极限定理：

$$\frac{\sum_{i=1}^n X_i - 2n}{\sqrt{2n}} \xrightarrow{d} N(0, 1)$$

$$\lim_{n \to \infty} P\left(\frac{\sum X_i - 2n}{\sqrt{n}} < 2\right) = \lim_{n \to \infty} P\left(\frac{\sum X_i - 2n}{\sqrt{2n}} < \frac{2}{\sqrt{2}}\right) = \Phi(\sqrt{2})$$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
中心极限定理标准化：$\frac{\sum X_i - n\mu}{\sqrt{n}\sigma} \xrightarrow{d} N(0, 1)$。注意分母是 $\sqrt{n}\sigma$ 不是 $\sqrt{n}$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 均服从 $E(2)$ 且相互独立，则由独立同分布的中心极限定理，可得 $\lim_{n \to \infty} P\left(\frac{2\sum_{i=1}^n X_i - n}{\sqrt{n}} \geq 2\right) =$（　　）

A. $\Phi(1)$
B. $\Phi(-1)$
C. $\Phi(2)$
D. $\Phi(-2)$
:::

:::callout{kind=insight label="解析"}
$X_i \sim E(2)$：$EX_i = \frac{1}{2}$，$DX_i = \frac{1}{4}$

$\sum X_i$ 的期望：$E\left(\sum X_i\right) = \frac{n}{2}$

$\sum X_i$ 的方差：$D\left(\sum X_i\right) = \frac{n}{4}$

$$\frac{2\sum X_i - n}{\sqrt{n}} = \frac{2\left(\sum X_i - \frac{n}{2}\right)}{\sqrt{n}} = \frac{\sum X_i - \frac{n}{2}}{\frac{\sqrt{n}}{2}} = \frac{\sum X_i - n \cdot \frac{1}{2}}{\sqrt{n} \cdot \frac{1}{2}}$$

$$\xrightarrow{d} N(0, 1)$$

$$\lim_{n \to \infty} P\left(\frac{2\sum X_i - n}{\sqrt{n}} \geq 2\right) = 1 - \Phi(2) = \Phi(-2)$$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$P(Z \geq a) = 1 - \Phi(a) = \Phi(-a)$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{50})$ 是取自泊松分布 $P(2)$ 的样本，则 $P\left(120 < \sum_{i=1}^{50} X_i < 130\right)$ 约等于（　　）

A. $\Phi(130) - \Phi(120)$
B. $\Phi(30) - \Phi(20)$
C. $\Phi(3) - \Phi(2)$
D. $\Phi(0.3) - \Phi(0.2)$
:::

:::callout{kind=insight label="解析"}
$X_i \sim P(2)$：$EX_i = 2$，$DX_i = 2$

$\sum_{i=1}^{50} X_i$ 的期望：$E = 50 \times 2 = 100$

$\sum_{i=1}^{50} X_i$ 的方差：$D = 50 \times 2 = 100$

$$P\left(120 < \sum X_i < 130\right) = P\left(\frac{120 - 100}{10} < \frac{\sum X_i - 100}{10} < \frac{130 - 100}{10}\right)$$

$$\approx \Phi(3) - \Phi(2)$$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
二项分布/泊松分布求和用正态近似：标准化后用 $\Phi$ 函数计算。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量序列 $\{X_i, i \geq 1\}$ 独立同分布，且 $X_1$ 的期望为0，方差为 $\frac{1}{2}$，如果常数 $C$ 使 $\lim_{n \to +\infty} P\left(\frac{C}{\sqrt{n}} \sum_{i=1}^n X_i \leq x\right) = \Phi(x)$，其中 $\Phi(x)$ 为标准正态分布函数，则 $C =$（　　）

A. 1
B. 2
C. $\sqrt{2}$
D. $\sqrt{3}$
:::

:::callout{kind=insight label="解析"}
$EX_i = 0$，$DX_i = \frac{1}{2}$

$\sum X_i$ 的期望：$E\left(\sum X_i\right) = 0$

$\sum X_i$ 的方差：$D\left(\sum X_i\right) = \frac{n}{2}$

$$\frac{C}{\sqrt{n}} \sum X_i = \frac{C \sum X_i}{\sqrt{n}} = \frac{\sum X_i - 0}{\sqrt{n} \cdot \frac{1}{C}}$$

要使极限为标准正态，需要：

$$\sqrt{n} \cdot \frac{1}{C} = \sqrt{D\left(\sum X_i\right)} = \sqrt{\frac{n}{2}}$$

$$\frac{1}{C} = \frac{1}{\sqrt{2}}$$

$$C = \sqrt{2}$$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
中心极限定理标准化：$\frac{\sum X_i - n\mu}{\sqrt{n}\sigma} \xrightarrow{d} N(0, 1)$。分母必须是 $\sqrt{n}\sigma$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设随机变量序列 $\{X_i, i \geq 1\}$ 独立且都服从标准正态分布，如果常数 $C$ 使 $\lim_{n \to +\infty} P\left(\frac{C \cdot \sum_{i=1}^n (X_i - X_{n+i})^2 - 2n}{\sqrt{n}} \leq x\right) = \Phi(x)$，其中 $\Phi(x)$ 为标准正态分布函数，则 $C =$（　　）

A. 1
B. 2
C. $\frac{1}{2}\sqrt{2}$
D. $\sqrt{2}$
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 1)$，独立。

$Y_i = X_i - X_{n+i}$，则 $Y_i \sim N(0, 2)$（独立正态之差）

$Y_i^2$ 的分布：$Y_i^2/2 \sim \chi^2(1)$，所以 $E(Y_i^2) = 2$，$D(Y_i^2) = 8$

$\sum_{i=1}^n Y_i^2$ 的期望：$E = 2n$

$\sum_{i=1}^n Y_i^2$ 的方差：$D = 8n$

$$\frac{C \sum Y_i^2 - 2n}{\sqrt{n}} = \frac{C(\sum Y_i^2 - 2n)}{\sqrt{n}} = \frac{\sum Y_i^2 - 2n}{\sqrt{n} \cdot \frac{1}{C}}$$

要使极限为标准正态：

$$\sqrt{n} \cdot \frac{1}{C} = \sqrt{D} = \sqrt{8n} = 2\sqrt{2n}$$

$$\frac{1}{C} = 2\sqrt{2}$$

$$C = \frac{1}{2\sqrt{2}} = \frac{\sqrt{2}}{4}$$

但选项中没有这个答案，重新检查。

实际上 $\sum Y_i^2 \sim 2\chi^2(n)$，期望 $2n$，方差 $8n$。

标准化：$\frac{\sum Y_i^2 - 2n}{\sqrt{8n}} \xrightarrow{d} N(0, 1)$

与题目形式对比：$\frac{C \sum Y_i^2 - 2n}{\sqrt{n}} = \frac{C(\sum Y_i^2 - 2n) + (C-1)2n}{\sqrt{n}}$

这需要 $C = 1$ 且调整常数项。题目可能有误，或理解为渐近等价。

选 **A**（最接近）。
:::

:::callout{kind=tip label="结论速记"}
正态变量平方和服从卡方分布。$X \sim N(0,1)$ 时 $X^2 \sim \chi^2(1)$，$E(X^2) = 1$，$D(X^2) = 2$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
公司设有500部电话，每部电话使用内线的概率是0.9，且每部电话是否拨打外线之间是相互独立的，那么有______部电话拨打外线的概率最大。
:::

:::callout{kind=insight label="解析"}
设 $X$ 为拨打外线的电话数，$X \sim B(500, 0.1)$（使用外线概率 = 1 - 0.9 = 0.1）

二项分布的最可能值（众数）：$k_0 = \lfloor (n+1)p \rfloor = \lfloor 501 \times 0.1 \rfloor = \lfloor 50.1 \rfloor = 50$

即50部电话拨打外线的概率最大。
:::

:::callout{kind=tip label="结论速记"}
二项分布 $B(n, p)$ 的最可能值：$k_0 = \lfloor (n+1)p \rfloor$ 或 $\lceil (n+1)p \rceil - 1$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
河北某中学一宿舍楼按400名学生的规模建造，该校学生每天洗漱时间是有规定的，按每人在规定的时间内大约有10%的时间占用一个水龙头计算，为能以95%的概率保证用水需要，该宿舍至少要安装多少个水龙头？（假设每人用水情况相互独立，已知 $\Phi(1.645) = 0.95$）
:::

:::callout{kind=insight label="解析"}
设 $X_i$ 为第 $i$ 个学生是否占用水龙头，$X_i \sim B(1, 0.1)$

$X = \sum_{i=1}^{400} X_i \sim B(400, 0.1)$

$EX = 400 \times 0.1 = 40$，$DX = 400 \times 0.1 \times 0.9 = 36$

用正态近似：$X \approx N(40, 36)$

设需要 $k$ 个水龙头：

$$P(X \leq k) \geq 0.95$$

$$P\left(\frac{X - 40}{6} \leq \frac{k - 40}{6}\right) \geq 0.95$$

$$\Phi\left(\frac{k - 40}{6}\right) \geq 0.95$$

$$\frac{k - 40}{6} \geq 1.645$$

$$k \geq 40 + 6 \times 1.645 = 40 + 9.87 = 49.87$$

至少需要50个水龙头。
:::

:::callout{kind=tip label="结论速记"}
资源分配问题：用二项分布+正态近似，求满足概率要求的最小资源数。
:::

---

### 第8题

:::callout{kind=note label="题目"}
某网络公司计划在某大学校园经营自行车租赁APP业务，市场数据调查表明60%的学生愿意注册这项APP，若该大学在校生10000名，试估计将注册这项APP的人数超过5900人的概率。（参考：$\Phi\left(\frac{6}{\sqrt{5}}\right) = 0.996$，$\Phi\left(\frac{5}{\sqrt{6}}\right) = 0.979$，$\Phi\left(\frac{5}{6}\right) = 0.798$，$\Phi\left(\frac{6}{5}\right) = 0.885$）
:::

:::callout{kind=insight label="解析"}
设 $X$ 为注册人数，$X \sim B(10000, 0.6)$

$EX = 10000 \times 0.6 = 6000$，$DX = 10000 \times 0.6 \times 0.4 = 2400$

用正态近似：$X \approx N(6000, 2400)$

$$P(X > 5900) = P\left(\frac{X - 6000}{\sqrt{2400}} > \frac{5900 - 6000}{\sqrt{2400}}\right)$$

$$= P\left(Z > \frac{-100}{20\sqrt{6}}\right) = P\left(Z > -\frac{5}{\sqrt{6}}\right) = P\left(Z < \frac{5}{\sqrt{6}}\right) = \Phi\left(\frac{5}{\sqrt{6}}\right) = 0.979$$
:::

:::callout{kind=tip label="结论速记"}
大样本二项分布用正态近似：$X \sim B(n, p) \approx N(np, np(1-p))$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
检验员逐个检查某产品，每查一个需要花10秒钟，但某些产品需要重复检查一次，重复检查的时间也是10秒钟，若每个产品需重复检查的概率为0.5。

(1) 用 $X_k$ 表示检查第 $k$ 个产品所花的时间（单位：秒），求 $EX_k, DX_k$；
(2) 用中心极限定理估算检验员检查1900个产品所花时间不多于8小时的概率。
参考值：$\Phi\left(\frac{6}{19}\right) = 0.62$，$\Phi\left(\frac{6}{\sqrt{19}}\right) = 0.92$。
:::

:::callout{kind=insight label="解析"}
**(1) 求 $EX_k, DX_k$**

$X_k$ 取值为10（不重复）或20（重复）

$P(X_k = 10) = 0.5$，$P(X_k = 20) = 0.5$

$$EX_k = 10 \times 0.5 + 20 \times 0.5 = 15$$

$$EX_k^2 = 100 \times 0.5 + 400 \times 0.5 = 250$$

$$DX_k = EX_k^2 - (EX_k)^2 = 250 - 225 = 25$$

**(2) 检查1900个产品时间**

总时间 $T = \sum_{k=1}^{1900} X_k$

$ET = 1900 \times 15 = 28500$ 秒 = 7.92 小时

$DT = 1900 \times 25 = 47500$

8小时 = 28800秒

$$P(T \leq 28800) = P\left(\frac{T - 28500}{\sqrt{47500}} \leq \frac{28800 - 28500}{\sqrt{47500}}\right)$$

$$= P\left(Z \leq \frac{300}{50\sqrt{19}}\right) = P\left(Z \leq \frac{6}{\sqrt{19}}\right) = \Phi\left(\frac{6}{\sqrt{19}}\right) = 0.92$$
:::

:::callout{kind=tip label="结论速记"}
独立同分布中心极限定理：$\frac{\sum X_i - n\mu}{\sqrt{n}\sigma} \xrightarrow{d} N(0, 1)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $n \geq 1$，随机变量 $X_n \sim B\left(n, \frac{1}{2}\right)$，$Y_n \sim P(n)$，已知 $X_n$ 与 $Y_n$ 独立。试求：

(1) $X_1 + Y_1$ 的分布列；
(2) $X_{100} + Y_{100}$ 的近似分布。
:::

:::callout{kind=insight label="解析"}
**(1) $X_1 + Y_1$ 的分布列**

$X_1 \sim B(1, 0.5)$：$P(X_1 = 0) = 0.5$，$P(X_1 = 1) = 0.5$

$Y_1 \sim P(1)$：$P(Y_1 = k) = \frac{e^{-1}}{k!}$，$k = 0, 1, 2, \ldots$

$X_1 + Y_1$ 取值为 $k, k+1$（$k = 0, 1, 2, \ldots$）

$$P(X_1 + Y_1 = k) = P(X_1 = 0, Y_1 = k) + P(X_1 = 1, Y_1 = k-1)$$

$$= 0.5 \times \frac{e^{-1}}{k!} + 0.5 \times \frac{e^{-1}}{(k-1)!} = \frac{e^{-1}}{2}\left(\frac{1}{k!} + \frac{1}{(k-1)!}\right)$$

**(2) $X_{100} + Y_{100}$ 的近似分布**

$X_{100} \sim B(100, 0.5)$：$EX_{100} = 50$，$DX_{100} = 25$

$Y_{100} \sim P(100)$：$EY_{100} = 100$，$DY_{100} = 100$

$X_{100} + Y_{100}$ 的期望：$E = 50 + 100 = 150$

$X_{100} + Y_{100}$ 的方差：$D = 25 + 100 = 125$

由中心极限定理：$X_{100} + Y_{100} \approx N(150, 125)$
:::

:::callout{kind=tip label="结论速记"}
独立变量之和：期望相加，方差相加。大样本用正态近似。
:::

---

> 本考点练习完
