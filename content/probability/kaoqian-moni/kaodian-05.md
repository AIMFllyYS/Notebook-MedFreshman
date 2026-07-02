# 考点五·离散型随机变量的分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch02 离散型随机变量的分布
> 题量：7题（选择2题 + 填空5题）

---

### 第1题

:::callout{kind=note label="题目"}
设随机变量 $X \sim P(5)$，$Y \sim P(3)$，且 $X, Y$ 独立，则（　　）

A. $X + Y \sim P(2)$
B. $X - Y \sim P(2)$
C. $X + Y \sim P(8)$
D. $X - Y \sim P(8)$
:::

:::callout{kind=insight label="解析"}
泊松分布的可加性：若 $X \sim P(\lambda_1)$，$Y \sim P(\lambda_2)$ 且独立，则 $X + Y \sim P(\lambda_1 + \lambda_2)$。

$X \sim P(5)$，$Y \sim P(3)$，$X + Y \sim P(5+3) = P(8)$

泊松分布的差不是泊松分布（可能取负值）。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
泊松分布可加性：独立泊松变量之和仍为泊松分布，参数相加。差不是泊松分布。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的分布列为 $P(X = k) = \frac{Ca^k}{(1+a)^{k+1}}$，$a > 0$，$k = 0, 1, \ldots$，则常数 $C$ 的值为（　　）

A. 1
B. 0.5
C. 0.3
D. 0.2
:::

:::callout{kind=insight label="解析"}
分布列归一化：$\sum_{k=0}^{\infty} P(X = k) = 1$

$$\sum_{k=0}^{\infty} \frac{Ca^k}{(1+a)^{k+1}} = \frac{C}{1+a} \sum_{k=0}^{\infty} \left(\frac{a}{1+a}\right)^k = \frac{C}{1+a} \cdot \frac{1}{1 - \frac{a}{1+a}} = \frac{C}{1+a} \cdot \frac{1+a}{1} = C$$

因此 $C = 1$。

选 **A**。

（注：这是几何分布 $Ge\left(\frac{1}{1+a}\right)$ 的另一种表达形式）
:::

:::callout{kind=tip label="结论速记"}
几何分布：$P(X = k) = (1-p)^k p$，$k = 0, 1, 2, \ldots$。本题中 $p = \frac{1}{1+a}$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
已知 $X \sim P(3)$，则 $P(X \geq 1) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$P(X \geq 1) = 1 - P(X = 0) = 1 - \frac{3^0 e^{-3}}{0!} = 1 - e^{-3}$$
:::

:::callout{kind=tip label="结论速记"}
泊松分布：$P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$。$P(X \geq 1) = 1 - e^{-\lambda}$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 都服从 $P(1)$，且 $X$ 与 $Y$ 相互独立，则 $P(X + Y = 1) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X + Y \sim P(1+1) = P(2)$

$$P(X + Y = 1) = \frac{2^1 e^{-2}}{1!} = 2e^{-2}$$
:::

:::callout{kind=tip label="结论速记"}
独立泊松之和仍为泊松，参数相加。直接用泊松分布公式计算。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X \sim B\left(1, \frac{1}{4}\right)$，$Y \sim B\left(1, \frac{1}{3}\right)$，且 $X, Y$ 独立，则 $P(X \neq Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X, Y$ 都是伯努利分布，取值为0或1。

$$P(X \neq Y) = P(X=0, Y=1) + P(X=1, Y=0)$$

$$= P(X=0)P(Y=1) + P(X=1)P(Y=0)$$

$$= \left(1 - \frac{1}{4}\right) \times \frac{1}{3} + \frac{1}{4} \times \left(1 - \frac{1}{3}\right)$$

$$= \frac{3}{4} \times \frac{1}{3} + \frac{1}{4} \times \frac{2}{3} = \frac{1}{4} + \frac{2}{12} = \frac{1}{4} + \frac{1}{6} = \frac{5}{12}$$
:::

:::callout{kind=tip label="结论速记"}
$P(X \neq Y) = P(X=0)P(Y=1) + P(X=1)P(Y=0)$，利用独立性分解。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 独立同分布，且 $P(X = k) = \frac{1}{2^k}$（$k = 1, 2, 3, \ldots$），则 $P(X > Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$P(X > Y) = \sum_{j=1}^{\infty} P(Y = j) P(X > j) = \sum_{j=1}^{\infty} \frac{1}{2^j} \sum_{k=j+1}^{\infty} \frac{1}{2^k}$$

$$\sum_{k=j+1}^{\infty} \frac{1}{2^k} = \frac{1/2^{j+1}}{1 - 1/2} = \frac{1}{2^j}$$

$$P(X > Y) = \sum_{j=1}^{\infty} \frac{1}{2^j} \cdot \frac{1}{2^j} = \sum_{j=1}^{\infty} \frac{1}{4^j} = \frac{1/4}{1 - 1/4} = \frac{1}{3}$$

由对称性，$P(X > Y) = P(X < Y)$，且 $P(X = Y) = \sum_{k=1}^{\infty} \frac{1}{2^k} \cdot \frac{1}{2^k} = \frac{1}{3}$，验证 $P(X > Y) + P(X < Y) + P(X = Y) = \frac{1}{3} + \frac{1}{3} + \frac{1}{3} = 1$。
:::

:::callout{kind=tip label="结论速记"}
独立同分布离散变量：$P(X > Y) = \sum_j P(Y=j)P(X > j)$。利用几何级数求和。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的分布列为 $P(X = k) = \frac{C}{2^k}$（$k = 1, 2, 3, \ldots$），则常数 $C =$ ______。
:::

:::callout{kind=insight label="解析"}
归一化：$\sum_{k=1}^{\infty} \frac{C}{2^k} = C \sum_{k=1}^{\infty} \frac{1}{2^k} = C \cdot \frac{1/2}{1 - 1/2} = C \cdot 1 = 1$

因此 $C = 1$。
:::

:::callout{kind=tip label="结论速记"}
几何级数：$\sum_{k=1}^{\infty} r^k = \frac{r}{1-r}$（$|r| < 1$）。本题 $r = \frac{1}{2}$，和为1。
:::

---

> 本考点练习完
