# 考点十八·综合题

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：综合
> 题量：5题（选择3题 + 计算2题）

---

### 第1题

:::callout{kind=note label="题目"}
下列叙述中不正确的是（　　）

A. 若 $P(A) = 1$，$P(B) = 1$，则 $P(AB)$ 不一定等于 1；

B. $P(A + B) \geq P(AB)$；

C. 当随机变量 $X, Y$ 同分布时，$P(X = Y) = 1$ 不一定成立；

D. 通过增加样本容量可以提高区间估计精度。
:::

:::callout{kind=insight label="解析"}
- **A 不正确**：$P(A) = 1, P(B) = 1$ 时，$P(\bar{A}) = 0, P(\bar{B}) = 0$，$P(\overline{AB}) \leq P(\bar{A}) + P(\bar{B}) = 0$，所以 $P(AB) = 1 - P(\overline{AB}) = 1$。因此 $P(AB)$ 一定等于 1，说"不一定"是错的。
- B 正确：$A + B \supset AB$，故 $P(A+B) \geq P(AB)$。
- C 正确：同分布不意味着恒相等，如 $X, Y$ 独立同分布时 $P(X = Y)$ 可以小于 1。
- D 正确：样本容量增大时置信区间变窄，精度提高。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$P(A) = P(B) = 1 \Rightarrow P(AB) = 1$（必然事件的交仍为必然事件）。
:::

---

### 第2题

:::callout{kind=note label="题目"}
下面表述正确的有（　　）个

(1) 设 $A, B$ 为任意两个随机事件，则 $P(A \cup B) + P(A \cap B) = P(A) + P(B)$

(2) 连续型随机变量 $X$ 的概率密度 $f(x)$ 不一定是连续函数

(3) 一维随机变量的概率分布函数 $F(x)$ 的定义域是 $(-\infty, +\infty)$

(4) 设随机变量 $X, Y$ 均服从 $\chi^2$ 分布，则随机变量 $X + Y$ 也服从 $\chi^2$ 分布

(5) 二维正态分布的条件分布一定服从正态分布

(6) 二维均匀分布的边缘分布一定服从均匀分布

A. 2　　B. 3　　C. 4　　D. 5
:::

:::callout{kind=insight label="解析"}
逐条分析：

- **(1) 正确**：由容斥原理 $P(A \cup B) = P(A) + P(B) - P(AB)$，所以 $P(A \cup B) + P(AB) = P(A) + P(B)$。
- **(2) 正确**：概率密度函数可以有有限个间断点，如均匀分布的密度函数。
- **(3) 正确**：分布函数定义域为全体实数。
- **(4) 错误**：$X \sim \chi^2(n_1), Y \sim \chi^2(n_2)$ 且独立时 $X + Y \sim \chi^2(n_1 + n_2)$，但题目未说明独立，且自由度不同时非独立情况不一定成立。
- **(5) 正确**：二维正态分布的条件分布仍为正态分布。
- **(6) 错误**：二维均匀分布的边缘分布不一定服从均匀分布（如矩形区域上的均匀分布，边缘是均匀的；但非矩形区域则不一定）。

正确的有 (1)(2)(3)(5)，共 4 个。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
容斥恒等式、密度函数可不连续、分布函数定义域为 $\mathbb{R}$、二维正态条件分布为正态——均为基本性质。$\chi^2$ 可加性需独立性，二维均匀边缘不一定均匀。
:::

---

### 第3题

:::callout{kind=note label="题目"}
下面表述正确的有（　　）个

(1) 设 $A$ 为随机事件，若 $P(A) = 1$，则 $A$ 为必然事件

(2) 常数与任意随机变量独立

(3) 设随机变量 $X \sim P(\lambda_1)$，$Y \sim P(\lambda_2)$，且相互独立，则 $X + Y \sim P(\lambda_1 + \lambda_2)$

(4) 设 $X, Y$ 为随机变量，如果 $X^2$ 与 $Y^2$ 相互独立，则 $X, Y$ 也相互独立

(5) 设随机变量 $X, Y$ 分布相同，则 $P(X = Y) = 1$

A. 2　　B. 3　　C. 4　　D. 5
:::

:::callout{kind=insight label="解析"}
逐条分析：

- **(1) 错误**：$P(A) = 1$ 不意味着 $A = \Omega$。$A$ 可以差一个零概率事件。
- **(2) 正确**：常数 $C$ 与任意随机变量 $X$ 独立，因为 $P(C \in B, X \in A) = P(X \in A) \cdot \mathbf{1}_{C \in B} = P(C \in B) \cdot P(X \in A)$。
- **(3) 正确**：独立泊松变量之和仍为泊松分布，参数相加。
- **(4) 错误**：$X^2$ 与 $Y^2$ 独立不能推出 $X$ 与 $Y$ 独立。反例：$X$ 服从对称分布，$Y = X$ 时 $X^2 = Y^2$ 恒成立（不独立），但即使 $X^2$ 与 $Y^2$ 独立，$X$ 和 $Y$ 的符号仍可能相关。
- **(5) 错误**：同分布不意味着恒相等。如 $X, Y$ 独立同分布，$P(X = Y)$ 可以远小于 1。

正确的有 (2)(3)，共 2 个。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$P(A) = 1 \not\Rightarrow A = \Omega$；常数与任意随机变量独立；泊松可加性需独立；$X^2, Y^2$ 独立 $\not\Rightarrow X, Y$ 独立；同分布 $\not\Rightarrow$ 恒等。
:::

---

### 第4题

:::callout{kind=note label="题目"}
由统计物理学知，分子运动速度的绝对值 $X$ 服从 Maxwell 分布，其密度函数为：

$$f(x) = \begin{cases} Cx^2 e^{-x^2/a^2}, & x > 0 \\ 0, & \text{其他} \end{cases}$$

(1) 确定常数 $C$；

(2) 求质量为一个单位的分子动能 $Y = 0.5X^2$ 的概率密度函数；

(3) 求 $DX$ 和 $EY$。

(4) 设总体 $X$ 具有上述密度函数，$a$ 是未知参数，$X_1, X_2, \ldots, X_n$ 是来自总体的一个样本。求 $a$ 的矩估计量 $\hat{a}_M$ 与 $a$ 的极大似然估计量 $\hat{a}_\mu$。
:::

:::callout{kind=insight label="解析"}
**(1)** 由 $\int_0^{+\infty} Cx^2 e^{-x^2/a^2} dx = 1$。

令 $t = x/a$，则 $dx = a\,dt$：

$$\int_0^{+\infty} C(a t)^2 e^{-t^2} a\,dt = Ca^3 \int_0^{+\infty} t^2 e^{-t^2} dt = 1$$

利用 $\int_0^{+\infty} t^2 e^{-t^2} dt = \frac{\sqrt{\pi}}{4}$：

$$Ca^3 \cdot \frac{\sqrt{\pi}}{4} = 1 \implies C = \frac{4}{a^3 \sqrt{\pi}}$$

**(2)** $Y = 0.5X^2$，$X = \sqrt{2Y}$，$\frac{dx}{dy} = \frac{1}{\sqrt{2y}}$

$$f_Y(y) = f_X(\sqrt{2y}) \cdot \left|\frac{dx}{dy}\right| = \frac{4}{a^3\sqrt{\pi}} (2y) e^{-2y/a^2} \cdot \frac{1}{\sqrt{2y}}$$

$$= \frac{4\sqrt{2y}}{a^3\sqrt{\pi}} e^{-2y/a^2}, \quad y > 0$$

**(3)** 利用 $X$ 的矩：

$$EX = \int_0^{+\infty} x \cdot \frac{4}{a^3\sqrt{\pi}} x^2 e^{-x^2/a^2} dx = \frac{4}{a^3\sqrt{\pi}} \int_0^{+\infty} x^3 e^{-x^2/a^2} dx$$

令 $t = x^2/a^2$，可得 $EX = \frac{2a}{\sqrt{\pi}}$。

$$EX^2 = \int_0^{+\infty} x^2 \cdot \frac{4}{a^3\sqrt{\pi}} x^2 e^{-x^2/a^2} dx = \frac{4}{a^3\sqrt{\pi}} \int_0^{+\infty} x^4 e^{-x^2/a^2} dx = \frac{3a^2}{2}$$

$$DX = EX^2 - (EX)^2 = \frac{3a^2}{2} - \frac{4a^2}{\pi} = a^2\left(\frac{3}{2} - \frac{4}{\pi}\right)$$

$$EY = E(0.5X^2) = 0.5 \cdot EX^2 = 0.5 \cdot \frac{3a^2}{2} = \frac{3a^2}{4}$$

**(4) 矩估计**：由 $EX = \frac{2a}{\sqrt{\pi}}$，令 $\bar{X} = \frac{2\hat{a}_M}{\sqrt{\pi}}$：

$$\hat{a}_M = \frac{\sqrt{\pi}}{2} \bar{X}$$

**极大似然估计**：似然函数 $L(a) = \prod_{i=1}^n \frac{4}{a^3\sqrt{\pi}} x_i^2 e^{-x_i^2/a^2}$

$$\ln L = n\ln\frac{4}{\sqrt{\pi}} + 2\sum \ln x_i - 3n\ln a - \frac{\sum x_i^2}{a^2}$$

对 $a$ 求导令其为 0：

$$-\frac{3n}{a} + \frac{2\sum x_i^2}{a^3} = 0 \implies \hat{a}_\mu = \sqrt{\frac{2\sum_{i=1}^n x_i^2}{3n}}$$
:::

:::callout{kind=tip label="结论速记"}
Maxwell 分布归一化常数 $C = \frac{4}{a^3\sqrt{\pi}}$；$EX = \frac{2a}{\sqrt{\pi}}$，$EX^2 = \frac{3a^2}{2}$。矩估计用 $EX$，MLE 对 $\ln L$ 求导。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(\lambda)$，$Y \sim P(\lambda)$，已知 $E(X + Y) = 2$。

(1) 求 $\lambda$ 的值；

(2) 若 $X, Y$ 独立，求 $P(X + Y \leq 1)$。
:::

:::callout{kind=insight label="解析"}
**(1)** $EX = \frac{1}{\lambda}$，$EY = \lambda$。

$$E(X + Y) = \frac{1}{\lambda} + \lambda = 2$$

$$\lambda + \frac{1}{\lambda} = 2 \implies \lambda^2 - 2\lambda + 1 = 0 \implies (\lambda - 1)^2 = 0 \implies \lambda = 1$$

**(2)** $X \sim E(1)$，$Y \sim P(1)$，且独立。

$$P(X + Y \leq 1) = P(Y = 0) \cdot P(X \leq 1) + P(Y = 1) \cdot P(X \leq 0)$$

$$P(Y = 0) = e^{-1}, \quad P(Y = 1) = e^{-1}$$

$$P(X \leq 1) = 1 - e^{-1}, \quad P(X \leq 0) = 0$$

$$P(X + Y \leq 1) = e^{-1}(1 - e^{-1}) + e^{-1} \cdot 0 = e^{-1} - e^{-2} = \frac{e - 1}{e^2}$$
:::

:::callout{kind=tip label="结论速记"}
$E(X+Y) = EX + EY$ 不需要独立性。求 $P(X+Y \leq c)$ 时对离散变量枚举再利用独立性拆分。
:::

---

> 本考点练习完
