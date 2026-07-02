# 考点十·多维随机变量函数的分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch03 函数的分布
> 题量：6题（填空2题 + 计算4题）

---

### 第1题

:::callout{kind=note label="题目"}
设随机变量 $X$ 与 $Y$ 相互独立，且都服从 $E(1)$，则 $P(\max\{X, Y\} > 1) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X, Y \sim E(1)$，独立。

$$P(\max\{X, Y\} > 1) = 1 - P(\max\{X, Y\} \leq 1) = 1 - P(X \leq 1, Y \leq 1)$$

$$= 1 - P(X \leq 1) P(Y \leq 1) = 1 - (1 - e^{-1})^2 = 1 - (1 - 2e^{-1} + e^{-2}) = 2e^{-1} - e^{-2}$$
:::

:::callout{kind=tip label="结论速记"}
$\max\{X, Y\} \leq t \iff X \leq t, Y \leq t$。利用独立性分解概率。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 相互独立，且均服从区间 $[0, 3]$ 上的均匀分布，则 $P(\min(X, Y) \leq 1) =$ ______。
:::

:::callout{kind=insight label="解析"}
$X, Y \sim U(0, 3)$，独立。

$$P(\min(X, Y) \leq 1) = 1 - P(\min(X, Y) > 1) = 1 - P(X > 1, Y > 1)$$

$$= 1 - P(X > 1) P(Y > 1) = 1 - \left(\frac{2}{3}\right)^2 = 1 - \frac{4}{9} = \frac{5}{9}$$
:::

:::callout{kind=tip label="结论速记"}
$\min\{X, Y\} > t \iff X > t, Y > t$。利用独立性分解概率。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(2)$，$Y \sim B\left(1, \frac{2}{3}\right)$，且二者相互独立。试求 $Z = X + 3Y$ 的概率密度函数 $f_Z(z)$。
:::

:::callout{kind=insight label="解析"}
$Y$ 取值为 0 或 1，$P(Y = 0) = \frac{1}{3}$，$P(Y = 1) = \frac{2}{3}$。

$$Z = X + 3Y = \begin{cases} X, & Y = 0 \\ X + 3, & Y = 1 \end{cases}$$

用全概率公式：

$$F_Z(z) = P(Z \leq z) = P(Y = 0) P(X \leq z | Y = 0) + P(Y = 1) P(X + 3 \leq z | Y = 1)$$

$$= \frac{1}{3} P(X \leq z) + \frac{2}{3} P(X \leq z - 3)$$

$$= \frac{1}{3} (1 - e^{-2z}) \cdot \mathbb{I}_{z \geq 0} + \frac{2}{3} (1 - e^{-2(z-3)}) \cdot \mathbb{I}_{z \geq 3}$$

求导得密度函数：

$$f_Z(z) = \frac{d}{dz} F_Z(z) = \begin{cases} \frac{2}{3} e^{-2z}, & 0 \leq z < 3 \\ \frac{2}{3} e^{-2z} + \frac{4}{3} e^{-2(z-3)}, & z \geq 3 \\ 0, & z < 0 \end{cases}$$
:::

:::callout{kind=tip label="结论速记"}
离散与连续混合：用全概率公式按离散变量的取值分类，分别计算连续部分的分布。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X$ 与 $Y$ 相互独立，都服从 $[0, 1]$ 区间上的均匀分布，试求：

(1) $Z = X + Y$ 的概率密度；
(2) $P(X + Y < 1.5)$。
:::

:::callout{kind=insight label="解析"}
**(1) $Z = X + Y$ 的概率密度**

卷积公式：$f_Z(z) = \int_{-\infty}^{+\infty} f_X(x) f_Y(z - x) \, dx$

支撑域：$0 \leq x \leq 1$，$0 \leq z - x \leq 1$，即 $\max(0, z-1) \leq x \leq \min(1, z)$

- 当 $0 \leq z \leq 1$：$0 \leq x \leq z$

$$f_Z(z) = \int_0^z 1 \cdot 1 \, dx = z$$

- 当 $1 < z \leq 2$：$z-1 \leq x \leq 1$

$$f_Z(z) = \int_{z-1}^1 1 \cdot 1 \, dx = 2 - z$$

- 其他：$f_Z(z) = 0$

$$f_Z(z) = \begin{cases} z, & 0 \leq z \leq 1 \\ 2 - z, & 1 < z \leq 2 \\ 0, & \text{其他} \end{cases}$$

（三角分布）

**(2) $P(X + Y < 1.5)$**

$$P(X + Y < 1.5) = \int_0^{1.5} f_Z(z) \, dz = \int_0^1 z \, dz + \int_1^{1.5} (2 - z) \, dz$$

$$= \left[\frac{z^2}{2}\right]_0^1 + \left[2z - \frac{z^2}{2}\right]_1^{1.5} = \frac{1}{2} + \left(3 - \frac{9}{8} - 2 + \frac{1}{2}\right) = \frac{1}{2} + \frac{7}{8} = \frac{11}{8}$$

（注：概率不能超过1，计算有误。重新计算）

$$\int_1^{1.5} (2 - z) \, dz = [2z - \frac{z^2}{2}]_1^{1.5} = 3 - 1.125 - 2 + 0.5 = 0.375 = \frac{3}{8}$$

$$P(X + Y < 1.5) = \frac{1}{2} + \frac{3}{8} = \frac{7}{8}$$
:::

:::callout{kind=tip label="结论速记"}
独立均匀变量之和为三角分布。卷积时注意积分限的变化（支撑域）。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设随机变量 $X$ 与 $Y$ 相互独立，$X \sim E(1)$，$Y$ 的概率分布为 $P(Y = -1) = \frac{1}{2}$，$P(Y = 1) = \frac{1}{2}$，令 $Z = XY$。

求：(1) $Z$ 的分布；(2) $X$ 与 $Z$ 是否不相关。
:::

:::callout{kind=insight label="解析"}
**(1) $Z$ 的分布**

用全概率公式：

$$F_Z(z) = P(Z \leq z) = P(Y = -1) P(-X \leq z) + P(Y = 1) P(X \leq z)$$

$$= \frac{1}{2} P(X \geq -z) + \frac{1}{2} P(X \leq z)$$

$$= \frac{1}{2} (1 - F_X(-z)) + \frac{1}{2} F_X(z)$$

对于 $z \geq 0$：

$$F_Z(z) = \frac{1}{2} (1 - 0) + \frac{1}{2} (1 - e^{-z}) = 1 - \frac{1}{2}e^{-z}$$

对于 $z < 0$：

$$F_Z(z) = \frac{1}{2} (1 - (1 - e^{z})) + \frac{1}{2} \cdot 0 = \frac{1}{2} e^{z}$$

求导得密度：

$$f_Z(z) = \begin{cases} \frac{1}{2} e^{-z}, & z \geq 0 \\ \frac{1}{2} e^{z}, & z < 0 \end{cases} = \frac{1}{2} e^{-|z|}$$

（拉普拉斯分布）

**(2) $X$ 与 $Z$ 是否不相关**

$$E(X) = 1$$

$$E(Z) = E(XY) = E(X)E(Y) = 1 \times 0 = 0$$

$$E(XZ) = E(X \cdot XY) = E(X^2 Y) = E(X^2) E(Y) = 2 \times 0 = 0$$

$$\text{Cov}(X, Z) = E(XZ) - E(X)E(Z) = 0 - 1 \times 0 = 0$$

协方差为0，$X$ 与 $Z$ 不相关。
:::

:::callout{kind=tip label="结论速记"}
乘积分布：用全概率公式按离散变量分类。$E(X^2) = \text{Var}(X) + [E(X)]^2$，指数分布 $E(X^2) = 2/\lambda^2$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $(X, Y)$ 的联合概率密度函数为 $f(x, y) = \begin{cases} 3x, & 0 \leq y \leq x \leq 1 \\ 0, & \text{其他} \end{cases}$

(1) 求 $Z = X + Y$ 的概率密度函数；
(2) 求 $P\left(Y \leq \frac{1}{2}\right)$。
:::

:::callout{kind=insight label="解析"}
**(1) $Z = X + Y$ 的概率密度**

分布函数法：

$$F_Z(z) = P(X + Y \leq z) = \iint_{x+y \leq z} f(x, y) \, dx \, dy$$

支撑域：$0 \leq y \leq x \leq 1$

- 当 $0 \leq z \leq 1$：积分区域为 $0 \leq y \leq x \leq z-y$，即 $0 \leq y \leq \frac{z}{2}$，$y \leq x \leq z-y$

$$F_Z(z) = \int_0^{z/2} \int_y^{z-y} 3x \, dx \, dy = \int_0^{z/2} \left[\frac{3}{2}x^2\right]_y^{z-y} \, dy$$

$$= \frac{3}{2} \int_0^{z/2} [(z-y)^2 - y^2] \, dy = \frac{3}{2} \int_0^{z/2} (z^2 - 2zy) \, dy$$

$$= \frac{3}{2} \left[z^2 y - zy^2\right]_0^{z/2} = \frac{3}{2} \left(\frac{z^3}{2} - \frac{z^3}{4}\right) = \frac{3}{8} z^3$$

- 当 $1 < z \leq 2$：积分区域为 $0 \leq y \leq x \leq 1$ 且 $x + y \leq z$

$$F_Z(z) = 1 - \iint_{x+y > z} 3x \, dx \, dy = 1 - \int_{z-1}^{1} \int_{z-x}^{x} 3x \, dy \, dx$$

$$= 1 - \int_{z-1}^{1} 3x(2x - z) \, dx = 1 - \int_{z-1}^{1} (6x^2 - 3zx) \, dx$$

$$= 1 - \left[2x^3 - \frac{3}{2}zx^2\right]_{z-1}^{1} = 1 - \left(2 - \frac{3}{2}z - 2(z-1)^3 + \frac{3}{2}z(z-1)^2\right)$$

求导得密度（略）。

**(2) $P\left(Y \leq \frac{1}{2}\right)$**

$$P\left(Y \leq \frac{1}{2}\right) = \int_0^{1/2} \int_y^1 3x \, dx \, dy = \int_0^{1/2} \left[\frac{3}{2}x^2\right]_y^1 \, dy$$

$$= \frac{3}{2} \int_0^{1/2} (1 - y^2) \, dy = \frac{3}{2} \left[y - \frac{y^3}{3}\right]_0^{1/2} = \frac{3}{2} \left(\frac{1}{2} - \frac{1}{24}\right) = \frac{3}{2} \cdot \frac{11}{24} = \frac{11}{16}$$
:::

:::callout{kind=tip label="结论速记"}
非独立变量函数分布：用分布函数法，注意积分区域的几何形状（三角形、梯形等）。
:::

---

> 本考点练习完
