# 考点八·多维随机变量与条件分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch03 多维随机变量
> 题量：10题（选择5题 + 填空5题）

---

### 第1题

:::callout{kind=note label="题目"}
设二维随机变量 $(X, Y) \sim N(1, 2, 1, 1, 0.5)$，则 $\{X = 1\}$ 的概率密度函数值是（　　）

A. $\frac{1}{\sqrt{2\pi}}$
B. $\frac{1}{2\pi}$
C. $\frac{1}{\sqrt{2\pi}e}$
D. $\frac{1}{\sqrt{2\pi}e^{\frac{1}{2}}}$
:::

:::callout{kind=insight label="解析"}
二维正态分布 $N(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho)$ 的边缘分布仍为正态分布：
- $X \sim N(\mu_1, \sigma_1^2) = N(1, 1)$
- $Y \sim N(\mu_2, \sigma_2^2) = N(2, 1)$

$X$ 的密度函数：$f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{(x-1)^2}{2}}$

$f_X(1) = \frac{1}{\sqrt{2\pi}} e^{-\frac{(1-1)^2}{2}} = \frac{1}{\sqrt{2\pi}}$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
二维正态的边缘分布是一维正态，参数为对应边缘的均值和方差。$X \sim N(\mu_1, \sigma_1^2)$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
下列叙述中正确的是（　　）

(1) 二维正态分布的边缘分布是正态分布，条件分布也是正态分布
(2) 二维正态分布的边缘分布是正态分布，但条件分布不是正态分布
(3) 二维均匀分布的边缘分布是均匀分布，条件分布是均匀分布
(4) 二维均匀分布的边缘分布不一定是均匀分布，条件分布也不一定为均匀分布

A. (1), (3)
B. (2), (3)
C. (1), (4)
D. (2), (4)
:::

:::callout{kind=insight label="解析"}
(1) 正确：二维正态的边缘分布和条件分布都是正态分布。
(2) 错误：条件分布也是正态分布。
(3) 错误：二维均匀分布的边缘分布不一定是均匀分布（如矩形区域边缘是均匀，但非矩形区域如圆形边缘不是均匀）。
(4) 正确：二维均匀分布的边缘分布和条件分布都不一定是均匀分布。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
二维正态：边缘和条件都是正态。二维均匀：边缘和条件不一定均匀（除非区域是矩形）。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设甲乙两台设备的寿命分别服从参数为2与3的指数分布，且相互独立，则甲比乙先坏的概率是（　　）

A. 0.2
B. 0.4
C. 0.6
D. 0.8
:::

:::callout{kind=insight label="解析"}
设甲寿命 $X \sim E(2)$，乙寿命 $Y \sim E(3)$，独立。

$$P(X < Y) = \int_0^{+\infty} f_X(x) P(Y > x) \, dx = \int_0^{+\infty} 2e^{-2x} \cdot e^{-3x} \, dx$$

$$= 2 \int_0^{+\infty} e^{-5x} \, dx = 2 \cdot \frac{1}{5} = \frac{2}{5} = 0.4$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
独立指数变量比较：$P(X < Y) = \frac{\lambda_X}{\lambda_X + \lambda_Y}$。本题 $\frac{2}{2+3} = 0.4$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设一维随机变量 $X$ 与 $Y$ 相互独立，且都服从均匀分布，那么下列随机变量中服从均匀分布的是（　　）

A. $XY$
B. $X - Y$
C. $(X, Y)$
D. $X + Y$
:::

:::callout{kind=insight label="解析"}
$X, Y$ 独立且都服从均匀分布，则 $(X, Y)$ 服从二维均匀分布（在矩形区域上）。

$X + Y$ 的分布是三角分布（卷积），不是均匀分布。
$X - Y$ 的分布也是三角分布。
$XY$ 的分布不是均匀分布。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
独立均匀变量的联合分布是二维均匀分布。和/差/积的分布通常不是均匀分布。
:::

---

### 第5题

:::callout{kind=note label="题目"}
已知随机变量 $(X, Y)$ 服从二维正态分布 $N(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho)$，且 $P(X < \mu_1, Y > \mu_2) = \frac{1}{3}$，则 $P(\max\{X - \mu_1, Y - \mu_2\} > 0) =$（　　）

A. $\frac{1}{4}$
B. $\frac{5}{6}$
C. $\frac{1}{6}$
D. $\frac{2}{3}$
:::

:::callout{kind=insight label="解析"}
二维正态分布关于均值 $(\mu_1, \mu_2)$ 对称。

$$P(X < \mu_1, Y > \mu_2) = P(X > \mu_1, Y < \mu_2) = \frac{1}{3}$$

$$P(X < \mu_1, Y < \mu_2) = P(X > \mu_1, Y > \mu_2)$$

由归一化：$4 \times \frac{1}{3} + 2 \times P(X < \mu_1, Y < \mu_2) = 1$

$$P(X < \mu_1, Y < \mu_2) = \frac{1}{6}$$

$$P(\max\{X - \mu_1, Y - \mu_2\} > 0) = P(X > \mu_1 \cup Y > \mu_2)$$

$$= 1 - P(X \leq \mu_1, Y \leq \mu_2) = 1 - \frac{1}{6} = \frac{5}{6}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
二维正态对称性：四个象限概率关系。$\max\{X-\mu_1, Y-\mu_2\} > 0$ 即至少一个大于均值。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $(X, Y) \sim N(1, 0, 1, 4, 0.5)$，则随机变量 $X$ 的概率密度函数为______。
:::

:::callout{kind=insight label="解析"}
二维正态 $N(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho)$ 的边缘分布 $X \sim N(\mu_1, \sigma_1^2)$。

$X \sim N(1, 1)$，密度函数：

$$f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{(x-1)^2}{2}}$$
:::

:::callout{kind=tip label="结论速记"}
边缘分布直接取对应参数：$X \sim N(\mu_1, \sigma_1^2)$，与相关系数 $\rho$ 无关。
:::

---

### 第7题

:::callout{kind=note label="题目"}
[注：判断相关性需要用到协方差相关内容] 在区间 $[0.5, 1]$ 中任取一个值 $x$，再在区间 $[-x, x]$ 中任取一个值 $y$，构成二维随机变量 $(X, Y)$。

(1) 求 $(X, Y)$ 的联合密度函数 $f(x, y)$，关于 $Y$ 的边缘密度函数 $f_Y(y)$，并判断 $X, Y$ 是否独立；
(2) 求 $\text{Cov}(X, Y)$，并据此判断 $X, Y$ 是否相关。
:::

:::callout{kind=insight label="解析"}
**(1) 联合密度和边缘密度**

$X$ 在 $[0.5, 1]$ 上均匀分布：$f_X(x) = \frac{1}{0.5} = 2$，$x \in [0.5, 1]$

给定 $X = x$ 时，$Y$ 在 $[-x, x]$ 上均匀分布：$f_{Y|X}(y|x) = \frac{1}{2x}$，$y \in [-x, x]$

$$f(x, y) = f_X(x) f_{Y|X}(y|x) = 2 \cdot \frac{1}{2x} = \frac{1}{x}$$

支撑域：$0.5 \leq x \leq 1$，$-x \leq y \leq x$

$$f_Y(y) = \int f(x, y) \, dx$$

对于 $y \in [-0.5, 0]$：$x \in [0.5, 1]$，$-x \leq y$ 恒成立

$$f_Y(y) = \int_{0.5}^{1} \frac{1}{x} \, dx = \ln 2$$

对于 $y \in [0, 0.5]$：$x \in [\max(0.5, y), 1]$

$$f_Y(y) = \int_{\max(0.5, y)}^{1} \frac{1}{x} \, dx = \ln\left(\frac{1}{\max(0.5, y)}\right)$$

由于 $f(x, y) \neq f_X(x) f_Y(y)$，$X, Y$ 不独立。

**(2) 协方差**

$$EX = \int_{0.5}^{1} x \cdot 2 \, dx = [x^2]_{0.5}^{1} = 1 - 0.25 = 0.75$$

$$EY = \iint y f(x, y) \, dx \, dy = 0$$（对称性）

$$E(XY) = \iint xy \cdot \frac{1}{x} \, dx \, dy = \iint y \, dx \, dy = 0$$

$$\text{Cov}(X, Y) = E(XY) - EX \cdot EY = 0 - 0.75 \times 0 = 0$$

协方差为0，$X, Y$ 不相关。
:::

:::callout{kind=tip label="结论速记"}
不相关 $\nRightarrow$ 独立。本题中 $X, Y$ 不相关（协方差为0）但不独立（联合密度不能分解）。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设随机变量 $X \sim U(0, 1)$，已知 $X = x$ 时，$Y$ 服从 $(x, 1)$ 上的均匀分布，求：

(1) $P(0.2 < Y < 0.6 | X = 0.5)$；
(2) $(X, Y)$ 的联合概率密度 $f(x, y)$；
(3) $(X, Y)$ 关于 $Y$ 的边缘概率密度 $f_Y(y)$。
:::

:::callout{kind=insight label="解析"}
**(1) 条件概率**

给定 $X = 0.5$，$Y \sim U(0.5, 1)$

$$P(0.2 < Y < 0.6 | X = 0.5) = 0$$（$Y$ 的取值范围是 $[0.5, 1]$）

**(2) 联合密度**

$$f_X(x) = 1, x \in [0, 1]$$

$$f_{Y|X}(y|x) = \begin{cases} \frac{1}{1-x}, & x < y < 1 \\ 0, & \text{其他} \end{cases}$$

$$f(x, y) = f_X(x) f_{Y|X}(y|x) = \begin{cases} \frac{1}{1-x}, & 0 \leq x < y \leq 1 \\ 0, & \text{其他} \end{cases}$$

**(3) 边缘密度**

$$f_Y(y) = \int_0^y \frac{1}{1-x} \, dx = [-\ln(1-x)]_0^y = -\ln(1-y), y \in [0, 1]$$
:::

:::callout{kind=tip label="结论速记"}
条件分布构造联合密度：$f(x, y) = f_X(x) f_{Y|X}(y|x)$。注意支撑域的条件关系。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设随机变量 $(X, Y)$ 的联合密度函数为 $f(x, y) = \begin{cases} ae^{-(2x+3y)}, & x, y > 0 \\ 0, & \text{其他} \end{cases}$，求：

(1) 参数 $a$；
(2) 边缘分布 $X$ 的概率密度 $f_X(x)$；
(3) $W = \min(X, Y)$ 的分布函数。
:::

:::callout{kind=insight label="解析"}
**(1) 求参数 $a$**

$$\int_0^{+\infty} \int_0^{+\infty} ae^{-(2x+3y)} \, dx \, dy = a \int_0^{+\infty} e^{-2x} \, dx \int_0^{+\infty} e^{-3y} \, dy = a \cdot \frac{1}{2} \cdot \frac{1}{3} = \frac{a}{6} = 1$$

$$a = 6$$

**(2) 边缘密度 $f_X(x)$**

$$f_X(x) = \int_0^{+\infty} 6e^{-(2x+3y)} \, dy = 6e^{-2x} \int_0^{+\infty} e^{-3y} \, dy = 6e^{-2x} \cdot \frac{1}{3} = 2e^{-2x}, x > 0$$

即 $X \sim E(2)$。

**(3) $W = \min(X, Y)$ 的分布函数**

$$F_W(w) = P(W \leq w) = 1 - P(W > w) = 1 - P(X > w, Y > w)$$

$$= 1 - \int_w^{+\infty} \int_w^{+\infty} 6e^{-(2x+3y)} \, dx \, dy = 1 - 6 \int_w^{+\infty} e^{-2x} \, dx \int_w^{+\infty} e^{-3y} \, dy$$

$$= 1 - 6 \cdot \frac{e^{-2w}}{2} \cdot \frac{e^{-3w}}{3} = 1 - e^{-5w}, w \geq 0$$

即 $W \sim E(5)$。
:::

:::callout{kind=tip label="结论速记"}
独立指数变量的最小值仍为指数分布，参数为各参数之和。本题 $X \sim E(2), Y \sim E(3)$，$\min(X, Y) \sim E(5)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
已知 $(X, Y)$ 的概率密度函数为 $f(x, y) = \begin{cases} \frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}}, & x^2 + y^2 > 1 \\ \frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}} + \frac{xy}{100}, & x^2 + y^2 \leq 1 \end{cases}$

(1) 求边缘密度函数 $f_X(x), f_Y(y)$；
(2) $X, Y$ 是否独立，为什么？若不独立，求 $X, Y$ 的相关系数。
:::

:::callout{kind=insight label="解析"}
**(1) 边缘密度**

由于对称性，$f_X(x) = f_Y(y)$。

$$f_X(x) = \int_{-\infty}^{+\infty} f(x, y) \, dy$$

对于 $|x| > 1$：$x^2 + y^2 > 1$ 恒成立

$$f_X(x) = \int_{-\infty}^{+\infty} \frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}} \, dy = \frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}}$$

对于 $|x| \leq 1$：需分段积分

$$f_X(x) = \int_{-\sqrt{1-x^2}}^{\sqrt{1-x^2}} \left(\frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}} + \frac{xy}{100}\right) \, dy + \int_{|y| > \sqrt{1-x^2}} \frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}} \, dy$$

第二项积分为 $\frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}} - \int_{-\sqrt{1-x^2}}^{\sqrt{1-x^2}} \frac{1}{2\pi}e^{-\frac{x^2+y^2}{2}} \, dy$

第一项中 $\int_{-\sqrt{1-x^2}}^{\sqrt{1-x^2}} \frac{xy}{100} \, dy = 0$（奇函数对称区间）

因此 $f_X(x) = \frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}}$ 对所有 $x$ 成立。

即 $X, Y$ 都服从标准正态分布 $N(0, 1)$。

**(2) 独立性和相关系数**

由于 $f(x, y) \neq f_X(x) f_Y(y)$（在单位圆内多出 $\frac{xy}{100}$ 项），$X, Y$ 不独立。

$$E(XY) = \iint xy f(x, y) \, dx \, dy = \iint_{x^2+y^2 \leq 1} xy \cdot \frac{xy}{100} \, dx \, dy$$

$$= \frac{1}{100} \iint_{x^2+y^2 \leq 1} x^2 y^2 \, dx \, dy$$

用极坐标：$x = r\cos\theta, y = r\sin\theta$

$$= \frac{1}{100} \int_0^{2\pi} \int_0^1 r^4 \cos^2\theta \sin^2\theta \cdot r \, dr \, d\theta$$

$$= \frac{1}{100} \int_0^1 r^5 \, dr \int_0^{2\pi} \cos^2\theta \sin^2\theta \, d\theta = \frac{1}{100} \cdot \frac{1}{6} \cdot \frac{\pi}{4} = \frac{\pi}{2400}$$

$$\rho_{XY} = \frac{E(XY) - EX \cdot EY}{\sqrt{DX} \sqrt{DY}} = \frac{\pi/2400 - 0}{1 \times 1} = \frac{\pi}{2400}$$
:::

:::callout{kind=tip label="结论速记"}
边缘分布是标准正态不意味着联合是二维正态。本题中边缘是正态但联合不是正态（单位圆内修正）。
:::

---

> 本考点练习完
