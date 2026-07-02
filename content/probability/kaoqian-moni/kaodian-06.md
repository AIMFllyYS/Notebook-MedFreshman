# 考点六·连续型随机变量的分布

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch02 连续型随机变量的分布
> 题量：5题（选择3题 + 计算2题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $F(x)$ 为某连续性随机变量的分布函数，$f(x)$ 为相应的密度函数，则（　　）

A. $F(x)$ 连续但不一定可导
B. $F(x)$ 可导
C. $f(x)$ 连续
D. $0 \leq f(x) \leq 1$
:::

:::callout{kind=insight label="解析"}
连续型随机变量的分布函数 $F(x)$ 是连续函数（绝对连续），但不一定可导（密度函数可能有跳跃点）。

密度函数 $f(x)$ 不一定连续，且 $f(x)$ 可以大于1（如均匀分布 $U(0, 0.1)$ 的密度为10）。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
分布函数连续但不一定可导。密度函数不一定连续，且不一定在[0,1]范围内。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X \sim N(\mu, 3^2)$，则 $P(|X - \mu| < 3) =$（　　）

A. $\Phi(1)$
B. $\Phi(-1)$
C. $2\Phi(1) - 1$
D. $2\Phi(-1) - 1$
:::

:::callout{kind=insight label="解析"}
$$P(|X - \mu| < 3) = P\left(\left|\frac{X - \mu}{3}\right| < 1\right) = P(|Z| < 1)$$

其中 $Z \sim N(0, 1)$。

$$P(|Z| < 1) = P(-1 < Z < 1) = \Phi(1) - \Phi(-1) = \Phi(1) - (1 - \Phi(1)) = 2\Phi(1) - 1$$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
正态分布标准化：$P(|X - \mu| < k\sigma) = 2\Phi(k) - 1$。本题 $k = 1$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X \sim N(0, 1)$，$\Phi(x)$ 为 $X$ 的分布函数，则 $P\left(\Phi(X) > \frac{2}{3}\right) =$ ______。
:::

:::callout{kind=insight label="解析"}
设 $Y = \Phi(X)$，则 $Y \sim U(0, 1)$（概率积分变换）。

$$P\left(\Phi(X) > \frac{2}{3}\right) = P\left(Y > \frac{2}{3}\right) = 1 - \frac{2}{3} = \frac{1}{3}$$
:::

:::callout{kind=tip label="结论速记"}
概率积分变换：若 $X$ 连续且分布函数为 $F(x)$，则 $F(X) \sim U(0, 1)$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设一批元件的寿命独立同分布，其概率密度函数为 $f(x) = \begin{cases} e^{-x}, & x \geq 0 \\ 0, & x < 0 \end{cases}$，系统开始工作时只有一个元件工作，在它损坏后立即更换一个新元件接替工作，求系统从开始工作到时刻 $T$（$T > 0$）为止，恰更换了一个元件的概率。
:::

:::callout{kind=insight label="解析"}
元件寿命 $X \sim E(1)$（指数分布，参数 $\lambda = 1$）。

"恰更换一个元件"意味着：第一个元件在时刻 $t$ 损坏（$0 < t < T$），第二个元件工作到时刻 $T$ 未损坏。

设第一个元件寿命为 $X_1$，第二个为 $X_2$，$X_1, X_2$ 独立同分布 $E(1)$。

$$P(\text{恰更换一个}) = P(X_1 < T, X_1 + X_2 > T)$$

$$= \int_0^T f_{X_1}(t) P(X_2 > T - t) \, dt = \int_0^T e^{-t} \cdot e^{-(T-t)} \, dt$$

$$= \int_0^T e^{-T} \, dt = Te^{-T}$$
:::

:::callout{kind=tip label="结论速记"}
指数分布无记忆性：$P(X > s + t | X > s) = P(X > t)$。本题用条件概率或积分方法计算。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设某产品有两个型号，I型产品的寿命 $X \sim E(6)$，II型产品的寿命 $Y \sim E(2)$。

(1) 求 $P(X \leq Y)$；
(2) 依据两种产品平均寿命的比例为这两种产品定价；
(3) 厂商称"II型产品寿命至少是I型产品寿命的3倍"，这话可信吗？为什么？
:::

:::callout{kind=insight label="解析"}
**(1) 求 $P(X \leq Y)$**

$X \sim E(6)$，$Y \sim E(2)$，独立。

$$P(X \leq Y) = \int_0^{+\infty} f_X(x) P(Y \geq x) \, dx = \int_0^{+\infty} 6e^{-6x} \cdot e^{-2x} \, dx$$

$$= 6 \int_0^{+\infty} e^{-8x} \, dx = 6 \cdot \frac{1}{8} = \frac{3}{4}$$

**(2) 依据平均寿命定价**

$EX = \frac{1}{6}$，$EY = \frac{1}{2}$

平均寿命比：$\frac{EY}{EX} = \frac{1/2}{1/6} = 3$

II型平均寿命是I型的3倍，定价比例应为3:1。

**(3) 厂商说法分析**

厂商称"II型产品寿命至少是I型产品寿命的3倍"，即 $P(Y \geq 3X)$。

$$P(Y \geq 3X) = \int_0^{+\infty} f_X(x) P(Y \geq 3x) \, dx = \int_0^{+\infty} 6e^{-6x} \cdot e^{-2 \cdot 3x} \, dx$$

$$= 6 \int_0^{+\infty} e^{-12x} \, dx = 6 \cdot \frac{1}{12} = \frac{1}{2}$$

只有50%的概率满足"至少3倍"，厂商说法不可信（夸大宣传）。
:::

:::callout{kind=tip label="结论速记"}
指数分布比较：$P(X \leq Y) = \frac{\lambda_X}{\lambda_X + \lambda_Y}$。注意"平均寿命"与"实际寿命"的区别。
:::

---

> 本考点练习完
