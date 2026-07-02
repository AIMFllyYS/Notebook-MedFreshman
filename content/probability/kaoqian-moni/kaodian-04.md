# 考点四·随机变量及其分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch02 随机变量及其分布
> 题量：11题（选择9题 + 计算2题）

---

### 第1题

:::callout{kind=note label="题目"}
随机变量 $X$ 的分布函数 $F(x)$ 定义为（　　）

A. $P(X < x)$
B. $P(X \leq x)$
C. $P(X > x)$
D. $P(X \geq x)$
:::

:::callout{kind=insight label="解析"}
分布函数的定义：$F(x) = P(X \leq x)$

这是概率论中的标准定义，表示随机变量 $X$ 取值不超过 $x$ 的概率。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
分布函数定义：$F(x) = P(X \leq x)$。注意是"小于等于"而非"小于"。
:::

---

### 第2题

:::callout{kind=note label="题目"}
连续型随机变量 $X$ 的概率密度为 $f(x)$，分布函数为 $F(x)$，则（　　）

A. $X$ 是连续函数
B. $f(x)$ 是连续函数
C. $F(x)$ 是连续函数
D. 对任意实数 $x$，有 $f(x) = F'(x)$
:::

:::callout{kind=insight label="解析"}
连续型随机变量的分布函数 $F(x)$ 是连续函数（甚至绝对连续），这是其定义的必然结果。

$f(x)$ 不一定连续（可以有跳跃点），$X$ 不是函数谈不上连续性。
$F'(x) = f(x)$ 只在 $f(x)$ 连续的点成立，不保证处处成立。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
分布函数 $F(x)$ 必连续，密度函数 $f(x)$ 不一定连续。$F'(x) = f(x)$ 只在连续点成立。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X \sim B(3, 0.5)$，$X$ 的分布函数为 $F(x)$，则 $F(1) - F(1^-) =$（　　）

A. $\frac{3}{8}$
B. $\frac{1}{4}$
C. $\frac{1}{2}$
D. $\frac{3}{4}$
:::

:::callout{kind=insight label="解析"}
$X \sim B(3, 0.5)$，分布列：
- $P(X=0) = \binom{3}{0}(0.5)^3 = \frac{1}{8}$
- $P(X=1) = \binom{3}{1}(0.5)^3 = \frac{3}{8}$
- $P(X=2) = \binom{3}{2}(0.5)^3 = \frac{3}{8}$
- $P(X=3) = \binom{3}{3}(0.5)^3 = \frac{1}{8}$

$F(1) = P(X \leq 1) = P(X=0) + P(X=1) = \frac{1}{8} + \frac{3}{8} = \frac{1}{2}$

$F(1^-) = P(X < 1) = P(X=0) = \frac{1}{8}$

$F(1) - F(1^-) = \frac{1}{2} - \frac{1}{8} = \frac{3}{8}$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$F(x) - F(x^-) = P(X = x)$，即分布函数在 $x$ 处的跳跃高度等于该点的概率。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $F(x)$ 为随机变量 $X$ 的分布函数，则（　　）

A. $X$ 是连续型或离散型随机变量
B. $F(x)$ 严格单调递增
C. $F(x)$ 连续
D. $\lim_{x \to +\infty} F(x) = 1$
:::

:::callout{kind=insight label="解析"}
分布函数的性质：
- 右连续单调不减（非严格单调）
- $\lim_{x \to -\infty} F(x) = 0$，$\lim_{x \to +\infty} F(x) = 1$
- 离散型随机变量的分布函数不连续（有跳跃）

因此 D 正确，A 不一定（还有混合型），B 错（可能为常数区间），C 错（离散型不连续）。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
分布函数极限性质：$\lim_{x \to -\infty} F(x) = 0$，$\lim_{x \to +\infty} F(x) = 1$。这是分布函数的基本性质。
:::

---

### 第5题

:::callout{kind=note label="题目"}
已知随机变量 $X, Y$ 同分布，且期望存在，则下列表述可能有误的是（　　）

A. $E(X) = E(Y)$
B. $P(X > 1) = P(Y > 1)$
C. $P(X = 1) = P(Y = 1)$
D. $P(X = Y) = 1$
:::

:::callout{kind=insight label="解析"}
同分布意味着 $P(X \in A) = P(Y \in A)$ 对任意可测集 $A$ 成立。

A、B、C 都是同分布的直接推论，正确。

D 错误：同分布不代表 $X$ 与 $Y$ 相等。例如 $X, Y$ 独立同分布时，$P(X = Y)$ 通常小于1（连续型时为0）。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
同分布 $\neq$ 相等。同分布只保证概率分布相同，不保证随机变量本身相等。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $X_1, X_2$ 是两个连续性随机变量，它们的概率密度函数分别为 $f_1(x), f_2(x)$，概率分布函数分别为 $F_1(x), F_2(x)$，则（　　）

A. $f_1(x) + f_2(x)$ 必为密度函数
B. $f_1(x)f_2(x)$ 必为密度函数
C. $F_1(x) + F_2(x)$ 必为分布函数
D. $F_1(x)F_2(x)$ 必为分布函数
:::

:::callout{kind=insight label="解析"}
密度函数需满足：非负且积分为1。
- $f_1(x) + f_2(x)$ 积分为2，不是密度函数
- $f_1(x)f_2(x)$ 积分不一定为1，不是密度函数

分布函数需满足：单调不减、右连续、极限为0和1。
- $F_1(x) + F_2(x)$ 极限为2，不是分布函数
- $F_1(x)F_2(x)$：单调不减（乘积）、右连续、$\lim_{x \to -\infty} = 0$，$\lim_{x \to +\infty} = 1$，是分布函数

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
分布函数的乘积仍是分布函数（对应独立随机变量的最大值分布）。密度函数的乘积不是密度函数。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设连续型随机变量 $X$ 的分布函数为 $F(x) = \begin{cases} 0, & x < a-1 \\ ax, & a-1 \leq x < 1 \\ 1, & x \geq 1 \end{cases}$，则 $a$ 的取值为（　　）

A. 1
B. 0
C. -1
D. 无法确定
:::

:::callout{kind=insight label="解析"}
分布函数在 $x = 1$ 处连续：

$$\lim_{x \to 1^-} F(x) = a \cdot 1 = a$$

$$F(1) = 1$$

连续性要求 $a = 1$。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
分布函数连续性：在分段点处左右极限相等。本题中 $F(1^-) = F(1)$ 得出 $a = 1$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
已知二维随机变量 $(X, Y)$ 的概率分布函数为 $F(x, y)$，概率密度函数 $f(x, y) = \begin{cases} 2, & 0 \leq y \leq x < 1 \\ 0, & \text{其他} \end{cases}$，则 $F\left(\frac{1}{2}, \frac{1}{4}\right) =$（　　）

A. $\frac{1}{8}$
B. $\frac{3}{16}$
C. $\frac{3}{8}$
D. $\frac{3}{32}$
:::

:::callout{kind=insight label="解析"}
$$F\left(\frac{1}{2}, \frac{1}{4}\right) = P\left(X \leq \frac{1}{2}, Y \leq \frac{1}{4}\right) = \iint_{x \leq \frac{1}{2}, y \leq \frac{1}{4}} f(x, y) \, dx \, dy$$

积分区域：$0 \leq y \leq \min\left(x, \frac{1}{4}\right)$，$0 \leq x \leq \frac{1}{2}$

$$= \int_0^{\frac{1}{4}} \int_y^{\frac{1}{2}} 2 \, dx \, dy = \int_0^{\frac{1}{4}} 2\left(\frac{1}{2} - y\right) \, dy$$

$$= 2\left[\frac{1}{2}y - \frac{1}{2}y^2\right]_0^{\frac{1}{4}} = 2\left(\frac{1}{8} - \frac{1}{32}\right) = 2 \times \frac{3}{32} = \frac{3}{16}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
二维分布函数计算：在密度函数支撑域内积分。注意积分区域的边界条件（$y \leq x$）。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 独立同分布，则下列叙述错误的是（　　）

A. 当 $X, Y$ 是连续型随机变量时，$P(X < Y) = P(X > Y) = \frac{1}{2}$
B. 当 $X, Y$ 是连续型随机变量时，$P(X < Y) = P(X \geq Y)$
C. 当 $X, Y$ 是离散型随机变量时，$P(X = Y) = 0$
D. 当 $X, Y$ 是离散型随机变量时，$P(X < Y) = P(X > Y)$
:::

:::callout{kind=insight label="解析"}
连续型独立同分布：由对称性 $P(X < Y) = P(X > Y)$，且 $P(X = Y) = 0$，所以 $P(X < Y) = \frac{1}{2}$。A、B 正确。

离散型独立同分布：$P(X = Y) = \sum_k P(X=k)P(Y=k) = \sum_k [P(X=k)]^2 > 0$（除非分布退化）。C 错误。

离散型独立同分布：$P(X < Y) = P(X > Y)$ 由对称性成立。D 正确。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
连续型独立同分布：$P(X = Y) = 0$，$P(X < Y) = \frac{1}{2}$。离散型独立同分布：$P(X = Y) > 0$，但 $P(X < Y) = P(X > Y)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
连续型随机变量 $X$ 的分布函数为 $F(x) = \begin{cases} 0, & x \leq 0 \\ ax^2 + bx, & 0 < x < 1 \\ 1, & x \geq 1 \end{cases}$，且 $P\left(X < \frac{1}{3}\right) = P\left(X > \frac{1}{3}\right)$。

(1) 求常数 $a$ 和 $b$；
(2) 求 $X$ 的密度函数。
:::

:::callout{kind=insight label="解析"}
**(1) 求常数 $a$ 和 $b$**

由 $F(1) = 1$：$a \cdot 1^2 + b \cdot 1 = a + b = 1$

由 $P\left(X < \frac{1}{3}\right) = P\left(X > \frac{1}{3}\right)$：

$$F\left(\frac{1}{3}^-\right) = 1 - F\left(\frac{1}{3}\right)$$

$$a\left(\frac{1}{3}\right)^2 + b\left(\frac{1}{3}\right) = 1 - \left[a\left(\frac{1}{3}\right)^2 + b\left(\frac{1}{3}\right)\right]$$

$$\frac{a}{9} + \frac{b}{3} = \frac{1}{2}$$

联立方程：
- $a + b = 1$
- $\frac{a}{9} + \frac{b}{3} = \frac{1}{2}$

解得：$a = -\frac{3}{2}, b = \frac{5}{2}$

**(2) 求密度函数**

$$f(x) = F'(x) = \begin{cases} 2ax + b, & 0 < x < 1 \\ 0, & \text{其他} \end{cases} = \begin{cases} -3x + \frac{5}{2}, & 0 < x < 1 \\ 0, & \text{其他} \end{cases}$$
:::

:::callout{kind=tip label="结论速记"}
分布函数求导得密度函数：$f(x) = F'(x)$（在可导点）。注意边界条件和归一化条件。
:::

---

### 第11题

:::callout{kind=note label="题目"}
设连续型随机变量 $X$ 的分布函数为 $F(x) = \begin{cases} Ae^x, & x < 0 \\ B, & 0 \leq x < 1 \\ 1 - Ae^{-(x-1)}, & x \geq 1 \end{cases}$。

求：(1) 常数 $A, B$ 的值；(2) $X$ 的概率密度函数；(3) $EX$。
:::

:::callout{kind=insight label="解析"}
**(1) 求常数 $A, B$**

在 $x = 0$ 处连续：$Ae^0 = B$，即 $A = B$

在 $x = 1$ 处连续：$B = 1 - Ae^{-(1-1)} = 1 - A$

联立：$A = 1 - A$，得 $A = \frac{1}{2}, B = \frac{1}{2}$

**(2) 求密度函数**

$$f(x) = F'(x) = \begin{cases} \frac{1}{2}e^x, & x < 0 \\ 0, & 0 \leq x < 1 \\ \frac{1}{2}e^{-(x-1)}, & x > 1 \end{cases}$$

（在 $x=0$ 和 $x=1$ 处导数不存在，但密度函数在这些点的值不影响积分）

**(3) 求 $EX$**

$$EX = \int_{-\infty}^{+\infty} xf(x) \, dx = \int_{-\infty}^{0} x \cdot \frac{1}{2}e^x \, dx + \int_{1}^{+\infty} x \cdot \frac{1}{2}e^{-(x-1)} \, dx$$

第一项：$\int_{-\infty}^{0} \frac{1}{2}xe^x \, dx = \frac{1}{2}[xe^x - e^x]_{-\infty}^{0} = \frac{1}{2}(0 - 1 - 0 + 0) = -\frac{1}{2}$

第二项：令 $t = x-1$，$\int_{0}^{+\infty} \frac{1}{2}(t+1)e^{-t} \, dt = \frac{1}{2}\left(\int_0^{+\infty} te^{-t} \, dt + \int_0^{+\infty} e^{-t} \, dt\right) = \frac{1}{2}(1 + 1) = 1$

$$EX = -\frac{1}{2} + 1 = \frac{1}{2}$$
:::

:::callout{kind=tip label="结论速记"}
分段分布函数：利用连续性确定常数，求导得密度函数，用分部积分计算期望。
:::

---

> 本考点练习完
