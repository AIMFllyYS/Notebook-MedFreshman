# 考点十一·期望与方差

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch04 数字特征
> 题量：17题（选择7题 + 填空10题）

---

### 第1题

:::callout{kind=note label="题目"}
随机变量 $X, Y$，假设相应的矩都存在，则下列不等式不成立的是（　　）

A. $(EXY)^2 \leq EX^2 EY^2$
B. $EX^2 \leq (EX)^2$
C. $DX \leq E(X - C)^2$
D. $1 - \frac{DX}{\varepsilon^2} \leq P(|X - EX| < \varepsilon)$
:::

:::callout{kind=insight label="解析"}
A. 柯西-施瓦茨不等式：$(EXY)^2 \leq EX^2 EY^2$，成立。

B. $EX^2 \geq (EX)^2$（由 $DX = EX^2 - (EX)^2 \geq 0$），所以 B 不成立。

C. 方差的性质：$DX = E(X - EX)^2 \leq E(X - C)^2$ 对任意常数 $C$ 成立（方差是偏离期望的最小均方误差），成立。

D. 切比雪夫不等式：$P(|X - EX| \geq \varepsilon) \leq \frac{DX}{\varepsilon^2}$，所以 $P(|X - EX| < \varepsilon) \geq 1 - \frac{DX}{\varepsilon^2}$，成立。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$EX^2 \geq (EX)^2$，等号当且仅当 $X$ 为常数。方差是最小均方误差。
:::

---

### 第2题

:::callout{kind=note label="题目"}
对于任意两个随机变量 $X$ 和 $Y$，若 $E(XY) = EX \cdot EY$，则（　　）

A. $X, Y$ 相互独立
B. $X, Y$ 不相互独立
C. $D(XY) = DX \cdot DY$
D. $D(X + Y) = DX + DY$
:::

:::callout{kind=insight label="解析"}
$E(XY) = EX \cdot EY$ 意味着 $\text{Cov}(X, Y) = 0$，即 $X, Y$ 不相关。

不相关不一定独立（A、B 都不一定正确）。

$D(X + Y) = DX + DY + 2\text{Cov}(X, Y) = DX + DY$，D 正确。

$D(XY)$ 的计算复杂，不一定等于 $DX \cdot DY$，C 错误。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
不相关 ⟹ 方差可加：$D(X + Y) = DX + DY$。不相关 $\nRightarrow$ 独立。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $X$ 的数学期望 $\mu$ 和方差 $\sigma^2$ 均为有限常数，则由切比雪夫不等式，有 $P(|X - \mu| < 3\sigma)$（　　）

A. $\geq \frac{1}{9}$
B. $\leq \frac{1}{9}$
C. $\geq \frac{8}{9}$
D. $\leq \frac{8}{9}$
:::

:::callout{kind=insight label="解析"}
切比雪夫不等式：$P(|X - \mu| \geq \varepsilon) \leq \frac{\sigma^2}{\varepsilon^2}$

取 $\varepsilon = 3\sigma$：$P(|X - \mu| \geq 3\sigma) \leq \frac{\sigma^2}{9\sigma^2} = \frac{1}{9}$

因此 $P(|X - \mu| < 3\sigma) = 1 - P(|X - \mu| \geq 3\sigma) \geq 1 - \frac{1}{9} = \frac{8}{9}$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
切比雪夫不等式：$P(|X - \mu| \geq k\sigma) \leq \frac{1}{k^2}$，$P(|X - \mu| < k\sigma) \geq 1 - \frac{1}{k^2}$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X \sim B(n, p)$，$Y \sim P(\lambda)$，且 $X, Y$ 不相关，则（　　）

A. $E(X + Y) = p + \lambda$
B. $X + Y \sim P(p\lambda)$
C. $D(X + Y) = np(1-p) + \lambda$
D. $E(XY) = p\lambda$
:::

:::callout{kind=insight label="解析"}
$X \sim B(n, p)$：$EX = np$，$DX = np(1-p)$

$Y \sim P(\lambda)$：$EY = \lambda$，$DY = \lambda$

不相关：$\text{Cov}(X, Y) = 0$，即 $E(XY) = EX \cdot EY = np \cdot \lambda$

A. $E(X + Y) = EX + EY = np + \lambda$，不是 $p + \lambda$，错误。

B. 二项分布与泊松分布之和不一定是泊松分布，错误。

C. $D(X + Y) = DX + DY = np(1-p) + \lambda$，正确。

D. $E(XY) = np \cdot \lambda$，不是 $p \cdot \lambda$，错误。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
不相关时方差可加。注意二项分布期望是 $np$ 不是 $p$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
随机变量 $X, Y$ 均服从标准正态分布，则 $E[\max(X, Y) + \min(X, Y)] =$（　　）

A. 0
B. 1
C. 2
D. 3
:::

:::callout{kind=insight label="解析"}
$\max(X, Y) + \min(X, Y) = X + Y$

$E[\max(X, Y) + \min(X, Y)] = E(X + Y) = EX + EY = 0 + 0 = 0$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$\max(a, b) + \min(a, b) = a + b$。期望的线性性质。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $X \sim U(0, 6)$，$Y \sim P(\lambda)$，且 $X, Y$ 不相关，则下列选项错误的是（　　）

A. $E(X + Y) = 3 + \lambda$
B. $X + Y \sim P(3\lambda)$
C. $D(X + Y) = 3 + \lambda$
D. $E(XY) = 3\lambda$
:::

:::callout{kind=insight label="解析"}
$X \sim U(0, 6)$：$EX = 3$，$DX = 3$

$Y \sim P(\lambda)$：$EY = \lambda$，$DY = \lambda$

不相关：$E(XY) = EX \cdot EY = 3\lambda$

A. $E(X + Y) = 3 + \lambda$，正确。

B. 均匀分布与泊松分布之和不可能是泊松分布，错误。

C. $D(X + Y) = DX + DY = 3 + \lambda$，正确。

D. $E(XY) = 3\lambda$，正确。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
不同类型分布之和通常不保持原分布类型（如均匀+泊松≠泊松）。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E\left(\frac{1}{2}\right)$，其概率分布函数为 $F(x)$，则 $E\left[[F(X)]^2 + X\right] =$（　　）

A. $\frac{3}{2}$
B. $\frac{5}{2}$
C. $\frac{7}{3}$
D. 1
:::

:::callout{kind=insight label="解析"}
$X \sim E\left(\frac{1}{2}\right)$，密度 $f(x) = \frac{1}{2}e^{-x/2}$，$x \geq 0$

分布函数 $F(x) = 1 - e^{-x/2}$

由概率积分变换：$F(X) \sim U(0, 1)$

$E[F(X)] = \frac{1}{2}$，$E[F(X)^2] = \int_0^1 u^2 \, du = \frac{1}{3}$

$EX = \frac{1}{1/2} = 2$

$E\left[[F(X)]^2 + X\right] = E[F(X)^2] + EX = \frac{1}{3} + 2 = \frac{7}{3}$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
概率积分变换：$F(X) \sim U(0, 1)$。$E[U^n] = \frac{1}{n+1}$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设随机变量 $X$ 服从参数为1的泊松分布，则 $P(X = EX^2) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X \sim P(1)$：$EX = 1$，$DX = 1$

$EX^2 = DX + (EX)^2 = 1 + 1 = 2$

$P(X = EX^2) = P(X = 2) = \frac{1^2 e^{-1}}{2!} = \frac{e^{-1}}{2}$
:::

:::callout{kind=tip label="结论速记"}
$EX^2 = DX + (EX)^2$。泊松分布 $P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设随机变量 $X \sim B(2, 0.1)$，则 $E(2^X) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X \sim B(2, 0.1)$，分布列：
- $P(X = 0) = 0.9^2 = 0.81$
- $P(X = 1) = 2 \times 0.1 \times 0.9 = 0.18$
- $P(X = 2) = 0.1^2 = 0.01$

$E(2^X) = 2^0 \times 0.81 + 2^1 \times 0.18 + 2^2 \times 0.01 = 1 \times 0.81 + 2 \times 0.18 + 4 \times 0.01 = 0.81 + 0.36 + 0.04 = 1.21$
:::

:::callout{kind=tip label="结论速记"}
函数期望：$E[g(X)] = \sum g(x) P(X = x)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
二维随机变量 $(X, Y) \sim N(1, 1, 4, 9, -0.5)$，$Z = \frac{1}{2}X - \frac{1}{3}Y$，则 $Z$ 的方差 $DZ =$ ______。
:::

:::callout{kind=insight label="解析"}
$DX = 4$，$DY = 9$，$\rho_{XY} = -0.5$

$\text{Cov}(X, Y) = \rho_{XY} \sqrt{DX} \sqrt{DY} = -0.5 \times 2 \times 3 = -3$

$DZ = D\left(\frac{1}{2}X - \frac{1}{3}Y\right) = \frac{1}{4}DX + \frac{1}{9}DY - 2 \times \frac{1}{2} \times \frac{1}{3} \text{Cov}(X, Y)$

$$= \frac{1}{4} \times 4 + \frac{1}{9} \times 9 - \frac{1}{3} \times (-3) = 1 + 1 + 1 = 3$$
:::

:::callout{kind=tip label="结论速记"}
线性组合方差：$D(aX + bY) = a^2 DX + b^2 DY + 2ab \text{Cov}(X, Y)$。
:::

---

### 第11题

:::callout{kind=note label="题目"}
设随机变量 $X \sim P(\lambda)$，$P(X = 1) = P(X = 2)$，则 $EX^2 =$ ______。
:::

:::callout{kind=insight label="解析"}
$P(X = 1) = \frac{\lambda e^{-\lambda}}{1!} = \lambda e^{-\lambda}$

$P(X = 2) = \frac{\lambda^2 e^{-\lambda}}{2!} = \frac{\lambda^2 e^{-\lambda}}{2}$

$\lambda e^{-\lambda} = \frac{\lambda^2 e^{-\lambda}}{2} \Rightarrow \lambda = 2$

$EX = \lambda = 2$，$DX = \lambda = 2$

$EX^2 = DX + (EX)^2 = 2 + 4 = 6$
:::

:::callout{kind=tip label="结论速记"}
泊松分布：$EX = DX = \lambda$。$EX^2 = \lambda + \lambda^2$。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设随机变量 $X \sim U(-1, 2)$，由切比雪夫不等式得 $P(|X - 0.5| < 1)$ ______。
:::

:::callout{kind=insight label="解析"}
$X \sim U(-1, 2)$：$EX = \frac{-1 + 2}{2} = 0.5$，$DX = \frac{(2 - (-1))^2}{12} = \frac{9}{12} = \frac{3}{4}$

切比雪夫不等式：$P(|X - EX| \geq \varepsilon) \leq \frac{DX}{\varepsilon^2}$

取 $\varepsilon = 1$：$P(|X - 0.5| \geq 1) \leq \frac{3/4}{1} = \frac{3}{4}$

$P(|X - 0.5| < 1) \geq 1 - \frac{3}{4} = \frac{1}{4}$
:::

:::callout{kind=tip label="结论速记"}
均匀分布 $U(a, b)$：$EX = \frac{a+b}{2}$，$DX = \frac{(b-a)^2}{12}$。
:::

---

### 第13题

:::callout{kind=note label="题目"}
从长度为3的线段上任取两点，则两点间距离的期望是______，方差是______。
:::

:::callout{kind=insight label="解析"}
设两点位置为 $X, Y \sim U(0, 3)$，独立。

距离 $D = |X - Y|$

$ED = \int_0^3 \int_0^3 |x - y| \cdot \frac{1}{9} \, dx \, dy$

由对称性，$ED = \frac{2}{9} \int_0^3 \int_0^x (x - y) \, dy \, dx = \frac{2}{9} \int_0^3 \left[xy - \frac{y^2}{2}\right]_0^x \, dx$

$$= \frac{2}{9} \int_0^3 \frac{x^2}{2} \, dx = \frac{1}{9} \left[\frac{x^3}{3}\right]_0^3 = \frac{1}{9} \times 9 = 1$$

$ED^2 = \frac{1}{9} \int_0^3 \int_0^3 (x - y)^2 \, dx \, dy = \frac{1}{9} \int_0^3 \left[\frac{(x-y)^3}{3}\right]_0^x \, dx = \frac{1}{27} \int_0^3 x^3 \, dx = \frac{1}{27} \times \frac{81}{4} = \frac{3}{4}$

$DD = ED^2 - (ED)^2 = \frac{3}{4} - 1 = -\frac{1}{4}$（计算有误，重新计算）

$ED^2 = \frac{1}{9} \int_0^3 \int_0^3 (x^2 - 2xy + y^2) \, dx \, dy = \frac{1}{9} \left[\int_0^3 \int_0^3 x^2 \, dx \, dy - 2\int_0^3 \int_0^3 xy \, dx \, dy + \int_0^3 \int_0^3 y^2 \, dx \, dy\right]$

$$= \frac{1}{9} \left[3 \times 9 - 2 \times 4.5 \times 4.5 + 3 \times 9\right] = \frac{1}{9} \times 13.5 = 1.5$$

$DD = 1.5 - 1 = 0.5$
:::

:::callout{kind=tip label="结论速记"}
两点距离的期望：对于 $U(0, L)$，$E|X - Y| = \frac{L}{3}$。本题 $L = 3$，期望为1。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设随机变量 $X \sim B(n, p)$，若 $P(X = 1) = 3 \cdot EX \cdot P(X = 0)$，则 $p =$ ______。
:::

:::callout{kind=insight label="解析"}
$X \sim B(n, p)$：
- $P(X = 0) = (1-p)^n$
- $P(X = 1) = np(1-p)^{n-1}$
- $EX = np$

$np(1-p)^{n-1} = 3 \cdot np \cdot (1-p)^n$

$(1-p)^{n-1} = 3(1-p)^n$

$1 = 3(1-p)$

$1-p = \frac{1}{3}$

$p = \frac{2}{3}$
:::

:::callout{kind=tip label="结论速记"}
二项分布：$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$。
:::

---

### 第15题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 独立，且 $X \sim P(2)$，$Y \sim U(-1, 1)$，则 $E(X^2 Y^2) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X, Y$ 独立：$E(X^2 Y^2) = E(X^2) E(Y^2)$

$X \sim P(2)$：$EX = 2$，$DX = 2$，$E(X^2) = DX + (EX)^2 = 2 + 4 = 6$

$Y \sim U(-1, 1)$：$EY = 0$，$DY = \frac{4}{12} = \frac{1}{3}$，$E(Y^2) = DY + (EY)^2 = \frac{1}{3}$

$E(X^2 Y^2) = 6 \times \frac{1}{3} = 2$
:::

:::callout{kind=tip label="结论速记"}
独立变量乘积期望：$E(XY) = EX \cdot EY$。$E(X^2) = DX + (EX)^2$。
:::

---

### 第16题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(\lambda)$，求：

(1) $Y = [X] + 1$ 的分布，其中 $[ ]$ 为取整函数；
(2) 随机变量 $Y$ 的期望。
:::

:::callout{kind=insight label="解析"}
**(1) $Y$ 的分布**

$Y = [X] + 1$，取值为 $1, 2, 3, \ldots$

$P(Y = k) = P([X] + 1 = k) = P([X] = k - 1) = P(k - 1 \leq X < k)$

$$= F(k) - F(k-1) = (1 - e^{-\lambda k}) - (1 - e^{-\lambda(k-1)}) = e^{-\lambda(k-1)} - e^{-\lambda k}$$

$$= e^{-\lambda(k-1)}(1 - e^{-\lambda})$$

这是几何分布 $Ge(1 - e^{-\lambda})$。

**(2) $EY$**

几何分布期望：$EY = \frac{1}{1 - e^{-\lambda}}$
:::

:::callout{kind=tip label="结论速记"}
指数分布取整后为几何分布。$P(k-1 \leq X < k) = e^{-\lambda(k-1)} - e^{-\lambda k}$。
:::

---

### 第17题

:::callout{kind=note label="题目"}
已知 $X, Y$ 服从标准正态分布，并且独立，设 $Z = |X - Y|$，求：

(1) $Z$ 的概率密度 $f_Z(z)$；
(2) $EZ$；
(3) $DZ$。
:::

:::callout{kind=insight label="解析"}
**(1) $Z$ 的概率密度**

$X, Y \sim N(0, 1)$ 独立，则 $X - Y \sim N(0, 2)$

设 $W = X - Y$，则 $W \sim N(0, 2)$，密度 $f_W(w) = \frac{1}{2\sqrt{\pi}} e^{-w^2/4}$

$Z = |W|$，对于 $z \geq 0$：

$$F_Z(z) = P(|W| \leq z) = P(-z \leq W \leq z) = F_W(z) - F_W(-z) = 2F_W(z) - 1$$

$$f_Z(z) = 2f_W(z) = \frac{1}{\sqrt{\pi}} e^{-z^2/4}, z \geq 0$$

**(2) $EZ$**

$$EZ = \int_0^{+\infty} z \cdot \frac{1}{\sqrt{\pi}} e^{-z^2/4} \, dz$$

令 $t = z^2/4$，$dz = \frac{2}{z} dt$

$$= \frac{1}{\sqrt{\pi}} \int_0^{+\infty} z e^{-t} \cdot \frac{2}{z} \, dt = \frac{2}{\sqrt{\pi}} \int_0^{+\infty} e^{-t} \, dt = \frac{2}{\sqrt{\pi}}$$

**(3) $DZ$**

$$EZ^2 = \int_0^{+\infty} z^2 \cdot \frac{1}{\sqrt{\pi}} e^{-z^2/4} \, dz$$

令 $t = z^2/4$，$z = 2\sqrt{t}$，$dz = \frac{1}{\sqrt{t}} dt$

$$= \frac{1}{\sqrt{\pi}} \int_0^{+\infty} 4t \cdot e^{-t} \cdot \frac{1}{\sqrt{t}} \, dt = \frac{4}{\sqrt{\pi}} \int_0^{+\infty} \sqrt{t} e^{-t} \, dt$$

$$= \frac{4}{\sqrt{\pi}} \Gamma\left(\frac{3}{2}\right) = \frac{4}{\sqrt{\pi}} \cdot \frac{\sqrt{\pi}}{2} = 2$$

$$DZ = EZ^2 - (EZ)^2 = 2 - \frac{4}{\pi}$$
:::

:::callout{kind=tip label="结论速记"}
独立标准正态之差：$X - Y \sim N(0, 2)$。绝对值的分布用折叠正态分布。
:::

---

> 本考点练习完
