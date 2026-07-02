# 考点十二·协方差与相关系数

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch04 协方差相关系数
> 题量：14题（选择3题 + 填空11题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $X$ 与 $Y$ 同分布，且期望、方差都存在，如果对任意的实数 $c$，都有 $D(cX + Y) = D(cX - Y)$，则下面说法中一定正确的是（　　）

A. $X$ 与 $Y$ 相互独立
B. $X$ 与 $Y$ 不相互独立
C. $X$ 与 $Y$ 不相关
D. $D(X) = 0$
:::

:::callout{kind=insight label="解析"}
$D(cX + Y) = c^2 DX + DY + 2c \text{Cov}(X, Y)$

$D(cX - Y) = c^2 DX + DY - 2c \text{Cov}(X, Y)$

由 $D(cX + Y) = D(cX - Y)$ 对任意 $c$ 成立：

$c^2 DX + DY + 2c \text{Cov}(X, Y) = c^2 DX + DY - 2c \text{Cov}(X, Y)$

$4c \text{Cov}(X, Y) = 0$ 对任意 $c$ 成立

因此 $\text{Cov}(X, Y) = 0$，即 $X$ 与 $Y$ 不相关。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$D(cX \pm Y) = c^2 DX + DY \pm 2c \text{Cov}(X, Y)$。对任意 $c$ 相等 ⟹ 协方差为0。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $(X, Y) \sim N(0, 1, \sigma^2, \sigma^2, 1)$，则（　　）

A. $P(Y = X) = 1$
B. $P(Y = X + 1) = 1$
C. $P(Y = -X + 1) = 1$
D. $P(Y = -X) = 1$
:::

:::callout{kind=insight label="解析"}
$(X, Y) \sim N(0, 1, \sigma^2, \sigma^2, 1)$，相关系数 $\rho = 1$。

相关系数为1意味着 $X$ 与 $Y$ 完全正相关，存在线性关系 $Y = aX + b$（几乎处处）。

由均值：$EY = a \cdot EX + b \Rightarrow 1 = a \cdot 0 + b \Rightarrow b = 1$

由方差：$DY = a^2 DX \Rightarrow \sigma^2 = a^2 \sigma^2 \Rightarrow a = \pm 1$

由于 $\rho = 1$（正相关），$a > 0$，所以 $a = 1$

因此 $Y = X + 1$（几乎处处），即 $P(Y = X + 1) = 1$。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
二维正态相关系数 $\rho = \pm 1$ 时，$Y$ 与 $X$ 有线性关系 $Y = aX + b$，其中 $a = \rho \frac{\sigma_Y}{\sigma_X}$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
若随机变量 $X$ 和 $Y$ 满足 $D(X - Y) = D(X + Y)$，则（　　）
:::

:::callout{kind=insight label="解析"}
$D(X - Y) = DX + DY - 2\text{Cov}(X, Y)$

$D(X + Y) = DX + DY + 2\text{Cov}(X, Y)$

由 $D(X - Y) = D(X + Y)$：

$DX + DY - 2\text{Cov}(X, Y) = DX + DY + 2\text{Cov}(X, Y)$

$-4\text{Cov}(X, Y) = 0$

$\text{Cov}(X, Y) = 0$

即 $X$ 与 $Y$ 不相关。
:::

:::callout{kind=tip label="结论速记"}
$D(X \pm Y) = DX + DY \pm 2\text{Cov}(X, Y)$。两者相等 ⟹ 协方差为0。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X$ 和 $Y$ 的相关系数为 $\rho$，则 $D(X + Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$D(X + Y) = DX + DY + 2\text{Cov}(X, Y) = DX + DY + 2\rho \sqrt{DX} \sqrt{DY}$
:::

:::callout{kind=tip label="结论速记"}
方差公式：$D(X + Y) = DX + DY + 2\rho \sigma_X \sigma_Y$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$DX = 4, DY = 9, \text{Cov}(X, Y) = 2$，则 $D(2X - 3Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$D(2X - 3Y) = 4DX + 9DY - 12\text{Cov}(X, Y) = 4 \times 4 + 9 \times 9 - 12 \times 2 = 16 + 81 - 24 = 73$
:::

:::callout{kind=tip label="结论速记"}
$D(aX + bY) = a^2 DX + b^2 DY + 2ab \text{Cov}(X, Y)$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $X$ 和 $Y$ 的相关系数为 $0.5$，$DX = DY = 1$，则 $D(X - Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$\text{Cov}(X, Y) = \rho \sqrt{DX} \sqrt{DY} = 0.5 \times 1 \times 1 = 0.5$

$D(X - Y) = DX + DY - 2\text{Cov}(X, Y) = 1 + 1 - 2 \times 0.5 = 1$
:::

:::callout{kind=tip label="结论速记"}
$D(X - Y) = DX + DY - 2\text{Cov}(X, Y)$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$EX = EY = 0$，$DX = DY = 1$，$\text{Cov}(X, Y) = 0.5$，则 $E[(X + Y)^2] =$ ______。
:::

:::callout{kind=insight label="解析"}
$E[(X + Y)^2] = D(X + Y) + [E(X + Y)]^2 = D(X + Y) + 0$

$D(X + Y) = DX + DY + 2\text{Cov}(X, Y) = 1 + 1 + 2 \times 0.5 = 3$

$E[(X + Y)^2] = 3$
:::

:::callout{kind=tip label="结论速记"}
$E(X^2) = DX + (EX)^2$。$E[(X + Y)^2] = D(X + Y) + [E(X + Y)]^2$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设随机变量 $X$ 和 $Y$ 独立同分布，$DX = 1$，则 $\text{Cov}(X + Y, X - Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$\text{Cov}(X + Y, X - Y) = \text{Cov}(X, X) - \text{Cov}(X, Y) + \text{Cov}(Y, X) - \text{Cov}(Y, Y)$

$$= DX - 0 + 0 - DY = 1 - 1 = 0$$
:::

:::callout{kind=tip label="结论速记"}
协方差双线性：$\text{Cov}(aX + bY, cX + dY) = ac DX + (ad + bc) \text{Cov}(X, Y) + bd DY$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$EX = 2, EY = 3, DX = 4, DY = 9, \text{Cov}(X, Y) = 1$，则 $E[(X - 1)(Y - 2)] =$ ______。
:::

:::callout{kind=insight label="解析"}
$E[(X - 1)(Y - 2)] = E(XY - 2X - Y + 2) = E(XY) - 2EX - EY + 2$

$E(XY) = \text{Cov}(X, Y) + EX \cdot EY = 1 + 2 \times 3 = 7$

$E[(X - 1)(Y - 2)] = 7 - 2 \times 2 - 3 + 2 = 7 - 4 - 3 + 2 = 2$
:::

:::callout{kind=tip label="结论速记"}
$E(XY) = \text{Cov}(X, Y) + EX \cdot EY$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设随机变量 $X$ 和 $Y$ 的相关系数为 $\rho$，则 $D\left(\frac{X - EX}{\sqrt{DX}} + \frac{Y - EY}{\sqrt{DY}}\right) =$ ______。
:::

:::callout{kind=insight label="解析"}
设 $X^* = \frac{X - EX}{\sqrt{DX}}$，$Y^* = \frac{Y - EY}{\sqrt{DY}}$，则 $DX^* = DY^* = 1$，$\text{Cov}(X^*, Y^*) = \rho$

$D(X^* + Y^*) = DX^* + DY^* + 2\text{Cov}(X^*, Y^*) = 1 + 1 + 2\rho = 2(1 + \rho)$
:::

:::callout{kind=tip label="结论速记"}
标准化变量：$X^* = \frac{X - EX}{\sqrt{DX}}$，$DX^* = 1$，$\text{Cov}(X^*, Y^*) = \rho$。
:::

---

### 第11题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$DX = 4, DY = 9$，则 $|\text{Cov}(X, Y)|$ 的最大值为______。
:::

:::callout{kind=insight label="解析"}
相关系数 $|\rho| = \frac{|\text{Cov}(X, Y)|}{\sqrt{DX} \sqrt{DY}} \leq 1$

$|\text{Cov}(X, Y)| \leq \sqrt{DX} \sqrt{DY} = \sqrt{4} \times \sqrt{9} = 2 \times 3 = 6$
:::

:::callout{kind=tip label="结论速记"}
柯西-施瓦茨不等式：$|\text{Cov}(X, Y)| \leq \sqrt{DX} \sqrt{DY}$，等号当且仅当 $X, Y$ 线性相关。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$DX = 1, DY = 4, \text{Cov}(X, Y) = 1$，则 $X$ 和 $Y$ 的相关系数为______。
:::

:::callout{kind=insight label="解析"}
$\rho = \frac{\text{Cov}(X, Y)}{\sqrt{DX} \sqrt{DY}} = \frac{1}{\sqrt{1} \times \sqrt{4}} = \frac{1}{2}$
:::

:::callout{kind=tip label="结论速记"}
相关系数定义：$\rho = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}$。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$EX = 1, EY = 2, DX = 4, DY = 9, \rho = 0.5$，则 $E(XY) =$ ______。
:::

:::callout{kind=insight label="解析"}
$\text{Cov}(X, Y) = \rho \sqrt{DX} \sqrt{DY} = 0.5 \times 2 \times 3 = 3$

$E(XY) = \text{Cov}(X, Y) + EX \cdot EY = 3 + 1 \times 2 = 5$
:::

:::callout{kind=tip label="结论速记"}
$E(XY) = \rho \sigma_X \sigma_Y + EX \cdot EY$。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设 $X, Y$ 为随机变量，$D(X + Y) = 10, D(X - Y) = 6$，则 $\text{Cov}(X, Y) =$ ______。
:::

:::callout{kind=insight label="解析"}
$D(X + Y) = DX + DY + 2\text{Cov}(X, Y) = 10$

$D(X - Y) = DX + DY - 2\text{Cov}(X, Y) = 6$

两式相减：$4\text{Cov}(X, Y) = 4$

$\text{Cov}(X, Y) = 1$
:::

:::callout{kind=tip label="结论速记"}
$D(X + Y) - D(X - Y) = 4\text{Cov}(X, Y)$。
:::

---

> 本考点练习完
