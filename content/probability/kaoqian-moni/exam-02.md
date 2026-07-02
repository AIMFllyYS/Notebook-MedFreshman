# 2021-2022学年第一学期期末考试A卷

> 来源：华科《概率论与数理统计》习题集（第2版）·套卷练习
> 考试类型：期末考试
> 题量：选择题10题 + 填空题4题 + 计算题5题

---

## 一、选择题（每小题3分，共30分）

### 第1题

:::callout{kind=note label="题目"}
袋中装有标记编号为1到10的10个球，现随机地抽出4个并按照标记的编号从小到大排列，现排在第二的球的编号为6的概率是（　　）

A. $\frac{1}{4}$　　B. $\frac{1}{5}$　　C. $\frac{1}{6}$　　D. $\frac{1}{7}$
:::

:::callout{kind=insight label="解析"}
排在第二的球编号为6，意味着4个球中：1个小于6，1个等于6，2个大于6。

小于6的编号有1,2,3,4,5共5个，选1个：$C_5^1 = 5$

等于6的编号有1个：$C_1^1 = 1$

大于6的编号有7,8,9,10共4个，选2个：$C_4^2 = 6$

总组合数：$C_{10}^4 = 210$

有利组合数：$5 \times 1 \times 6 = 30$

概率：$\frac{30}{210} = \frac{1}{7}$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
排列组合概率：计算满足条件的组合数除以总组合数。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $A, B$ 为两个随机事件，$P(B) > 0$，则下列选项一定正确的是（　　）

A. $P(A) \leq P(A|B)$　　B. $P(A) \geq P(A|B)$　　C. $P(AB) \leq P(A|B)$　　D. $P(AB) \geq P(A|B)$
:::

:::callout{kind=insight label="解析"}
$P(A|B) = \frac{P(AB)}{P(B)}$

由于 $P(B) \leq 1$，$\frac{P(AB)}{P(B)} \geq P(AB)$

因此 $P(A|B) \geq P(AB)$，即 $P(AB) \leq P(A|B)$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
条件概率性质：$P(A|B) = \frac{P(AB)}{P(B)} \geq P(AB)$（因为 $P(B) \leq 1$）。
:::

---

### 第3题

:::callout{kind=note label="题目"}
已知三个随机事件 $A, B, C$，若事件 $A, B$ 同时发生时，事件 $C$ 一定发生，则下列选项一定正确的是（　　）

A. $P(C) = P(AB)$　　B. $P(C) \leq P(AB)$　　C. $P(C) \geq P(AB)$　　D. $P(C) \neq P(AB)$
:::

:::callout{kind=insight label="解析"}
$A, B$ 同时发生 $\Rightarrow$ $C$ 发生，即 $AB \subset C$。

因此 $P(AB) \leq P(C)$，即 $P(C) \geq P(AB)$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
事件包含关系：$AB \subset C \Rightarrow P(AB) \leq P(C)$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设函数 $F(x) = \begin{cases} 0, & x < 1 \\ \frac{1}{2}(x-1), & 1 \leq x \leq 2 \\ 1, & x > 2 \end{cases}$，则 $F(x)$（　　）

A. 是离散型随机变量的分布函数

B. 是连续型随机变量的分布函数

C. 不是离散型也不是连续型随机变量的分布函数

D. 不是随机变量的分布函数
:::

:::callout{kind=insight label="解析"}
$F(x)$ 在 $[1,2]$ 上连续，$F(-\infty) = 0$，$F(+\infty) = 1$，单调不减。

但 $F(x)$ 在 $x = 1$ 处左极限为 0，右极限为 0，$F(1) = 0$，连续。在 $x = 2$ 处左极限为 $\frac{1}{2}$，$F(2) = \frac{1}{2}$，但 $x > 2$ 时 $F(x) = 1$，故 $x = 2$ 处有跳跃，跳跃高度为 $\frac{1}{2}$。

因此 $F(x)$ 既不是连续型（有跳跃间断点），也不是纯离散型（有连续部分），是混合型分布函数。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
分布函数既有连续段又有跳跃点 → 混合型，既非离散也非连续。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设随机变量 $X_1, X_2, \ldots, X_{100}$ 独立且都服从 $B(1, 0.2)$，则 $Y = \sum_{i=1}^{100} X_i$ 的分布函数 $F_Y(y) \approx$（　　）

A. $\Phi\left(\frac{y - 20}{4}\right)$　　B. $\Phi\left(\frac{y - 20}{16}\right)$　　C. $\Phi(4y + 20)$　　D. $\Phi(16y + 20)$
:::

:::callout{kind=insight label="解析"}
$X_i \sim B(1, 0.2)$，$EX_i = 0.2$，$DX_i = 0.2 \times 0.8 = 0.16$。

$Y = \sum_{i=1}^{100} X_i \sim B(100, 0.2)$，$EY = 20$，$DY = 16$。

由中心极限定理，$Y \approx N(20, 16)$，$\sigma = 4$。

$$F_Y(y) \approx \Phi\left(\frac{y - 20}{4}\right)$$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
二项分布 $B(n, p)$ 的中心极限定理近似：$F(y) \approx \Phi\left(\frac{y - np}{\sqrt{np(1-p)}}\right)$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
已知 $X, Y$ 为两个随机变量，且 $P\{X \leq 0, Y \leq 0\} = \frac{2}{5}$，$P\{X \leq 0\} = \frac{3}{5}$，$P\{Y \leq 0\} = \frac{4}{5}$，则 $P\{\min(X, Y) > 0\} =$（　　）

A. $\frac{2}{25}$　　B. 0　　C. $\frac{3}{5}$　　D. 1
:::

:::callout{kind=insight label="解析"}
$\min(X, Y) > 0 \iff X > 0 \text{ 且 } Y > 0$

$$P\{X > 0, Y > 0\} = 1 - P\{X \leq 0 \cup Y \leq 0\}$$

$$P\{X \leq 0 \cup Y \leq 0\} = P\{X \leq 0\} + P\{Y \leq 0\} - P\{X \leq 0, Y \leq 0\}$$

$$= \frac{3}{5} + \frac{4}{5} - \frac{2}{5} = 1$$

$$P\{X > 0, Y > 0\} = 1 - 1 = 0$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$P(\min(X,Y) > 0) = P(X > 0, Y > 0) = 1 - P(X \leq 0 \cup Y \leq 0)$，用容斥原理展开。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设随机变量 $X_1, X_2, \ldots, X_n$ 为来自正态总体 $N(0, \sigma^2)$ 的简单随机样本，则 $\frac{\frac{1}{n}\left(\sum_{i=1}^n X_i\right)^2}{\frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2}$ 的分布是（　　）

A. $F(1, n-1)$　　B. $F(n-1, 1)$　　C. $F(1, n)$　　D. $F(n, 1)$
:::

:::callout{kind=insight label="解析"}
$\bar{X} = \frac{1}{n}\sum X_i \sim N\left(0, \frac{\sigma^2}{n}\right)$，故 $\frac{n\bar{X}^2}{\sigma^2} = \frac{\left(\sum X_i\right)^2}{n\sigma^2} \sim \chi^2(1)$。

$\frac{(n-1)S^2}{\sigma^2} = \frac{\sum(X_i - \bar{X})^2}{\sigma^2} \sim \chi^2(n-1)$。

且 $\bar{X}$ 与 $S^2$ 独立。

$$\frac{\frac{1}{n}\left(\sum X_i\right)^2}{\frac{1}{n-1}\sum(X_i - \bar{X})^2} = \frac{\frac{\left(\sum X_i\right)^2}{n\sigma^2}}{\frac{\sum(X_i - \bar{X})^2}{(n-1)\sigma^2}} = \frac{\chi^2(1)/1}{\chi^2(n-1)/(n-1)} \sim F(1, n-1)$$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$\bar{X}$ 与 $S^2$ 独立时，$\frac{n\bar{X}^2/\sigma^2}{(n-1)S^2/\sigma^2} = \frac{\chi^2(1)/1}{\chi^2(n-1)/(n-1)} \sim F(1, n-1)$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 相互独立，期望和方差均存在，令 $U = \min(X, Y)$，$V = \max(X, Y)$，则下列叙述错误的是（　　）

A. $E(U + V) = E(U) + E(V)$　　B. $E(X + Y) = E(X) + E(Y)$

C. $D(U + V) = D(U) + D(V)$　　D. $D(X + Y) = D(X) + D(Y)$
:::

:::callout{kind=insight label="解析"}
$U + V = \min(X,Y) + \max(X,Y) = X + Y$，所以 $E(U+V) = E(X+Y) = E(X) + E(Y)$，A、B 正确。

$X, Y$ 独立时 $D(X + Y) = DX + DY$，D 正确。

但 $U$ 和 $V$ 不独立（$U \leq V$），所以 $D(U + V) \neq D(U) + D(V)$ 一般不成立。实际上 $D(U + V) = D(X + Y) = DX + DY$，但 $D(U) + D(V) \neq DX + DY$ 一般成立。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$\min + \max = X + Y$，但 $\min$ 和 $\max$ 不独立，方差不能直接相加。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设随机变量 $X_1, X_2, \ldots, X_n$ 为正态总体 $X \sim N(\mu, \sigma^2)$ 的简单随机样本，其中 $\mu, \sigma^2$ 均未知，$\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$，$S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2$，则 $\sigma$ 的置信水平为 0.95 的置信区间为（　　）

A. $\left(\sqrt{\frac{(n-1)S^2}{\chi^2_{0.975}(n-1)}}, \sqrt{\frac{(n-1)S^2}{\chi^2_{0.025}(n-1)}}\right)$

B. $\left(\sqrt{\frac{(n-1)S^2}{\chi^2_{0.025}(n-1)}}, \sqrt{\frac{(n-1)S^2}{\chi^2_{0.975}(n-1)}}\right)$

C. $\left(\frac{(n-1)S^2}{\chi^2_{0.975}(n-1)}, \frac{(n-1)S^2}{\chi^2_{0.025}(n-1)}\right)$

D. $\left(\frac{(n-1)S^2}{\chi^2_{0.025}(n-1)}, \frac{(n-1)S^2}{\chi^2_{0.975}(n-1)}\right)$
:::

:::callout{kind=insight label="解析"}
$\mu$ 未知时，$\frac{(n-1)S^2}{\sigma^2} \sim \chi^2(n-1)$。

$\sigma^2$ 的置信区间：$\left[\frac{(n-1)S^2}{\chi^2_{\alpha/2}(n-1)}, \frac{(n-1)S^2}{\chi^2_{1-\alpha/2}(n-1)}\right]$

$\sigma$ 的置信区间对上下限开平方：

$$\left(\sqrt{\frac{(n-1)S^2}{\chi^2_{0.025}(n-1)}}, \sqrt{\frac{(n-1)S^2}{\chi^2_{0.975}(n-1)}}\right)$$

注意 $\chi^2_{0.025}$ 较大，$\chi^2_{0.975}$ 较小，所以下限对应 $\chi^2_{0.025}$。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\sigma^2$ 置信区间 $\left[\frac{(n-1)S^2}{\chi^2_{\alpha/2}}, \frac{(n-1)S^2}{\chi^2_{1-\alpha/2}}\right]$，$\sigma$ 区间对两端开根号。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(1)$，$Y \sim E\left(\frac{1}{2}\right)$，且相关系数 $\rho_{XY} = 1$，则 $P\{Y = cX\} = 1$，其中 $c =$（　　）

A. 0　　B. $\frac{1}{2}$　　C. 1　　D. 2
:::

:::callout{kind=insight label="解析"}
$\rho_{XY} = 1$ 意味着 $Y = aX + b$ 且 $a > 0$。

$EX = 1$，$EY = 2$。$DX = 1$，$DY = 4$。

$\rho = 1 \Rightarrow \text{Cov}(X,Y) = \sqrt{DX \cdot DY} = \sqrt{1 \times 4} = 2$

$Y = aX + b$：$EY = a \cdot EX + b \Rightarrow 2 = a + b$

$\text{Cov}(X, Y) = a \cdot DX = a \Rightarrow a = 2$

$b = 2 - 2 = 0$，所以 $Y = 2X$，$c = 2$。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$\rho = 1$ 时 $Y = aX + b$（$a > 0$），$a = \frac{\text{Cov}(X,Y)}{DX} = \sqrt{\frac{DY}{DX}}$。
:::

---

## 二、填空题（每空3分，共12分）

### 第1题

:::callout{kind=note label="题目"}
假设生男生女的概率均为 $\frac{1}{2}$，已知某家庭有两个孩子，设随机事件 $A = \{$该家庭有男孩$\}$，$B = \{$该家庭有女孩$\}$，则 $P(B|A) =$______。
:::

:::callout{kind=insight label="解析"}
样本空间：{男男, 男女, 女男, 女女}，每个概率 $\frac{1}{4}$。

$A = \{$有男孩$\}$ = {男男, 男女, 女男}，$P(A) = \frac{3}{4}$。

$AB = \{$有男孩且有女孩$\}$ = {男女, 女男}，$P(AB) = \frac{2}{4} = \frac{1}{2}$。

$$P(B|A) = \frac{P(AB)}{P(A)} = \frac{1/2}{3/4} = \frac{2}{3}$$
:::

:::callout{kind=tip label="结论速记"}
条件概率：$P(B|A) = \frac{P(AB)}{P(A)}$，注意枚举样本空间。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $A, B$ 为随机事件，$0 < P(A) < 1$，$0 < P(B) < 1$，且 $A, B$ 相互独立，则 $P(A|B) + P(\bar{A}|\bar{B}) =$______。
:::

:::callout{kind=insight label="解析"}
$A, B$ 独立时，$A$ 与 $\bar{B}$ 独立，$\bar{A}$ 与 $\bar{B}$ 独立。

$$P(A|B) = P(A), \quad P(\bar{A}|\bar{B}) = P(\bar{A}) = 1 - P(A)$$

$$P(A|B) + P(\bar{A}|\bar{B}) = P(A) + 1 - P(A) = 1$$
:::

:::callout{kind=tip label="结论速记"}
$A, B$ 独立 $\Rightarrow$ $P(A|B) = P(A)$，$P(\bar{A}|\bar{B}) = P(\bar{A})$，两者之和恒为1。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X$ 服从标准正态分布，则 $P\{X \leq E(X^2 - 1)\} =$______。
:::

:::callout{kind=insight label="解析"}
$X \sim N(0, 1)$，$EX = 0$，$EX^2 = DX + (EX)^2 = 1$。

$$E(X^2 - 1) = EX^2 - 1 = 1 - 1 = 0$$

$$P\{X \leq 0\} = \Phi(0) = \frac{1}{2}$$
:::

:::callout{kind=tip label="结论速记"}
标准正态 $EX^2 = 1$，$E(X^2 - 1) = 0$，$P(X \leq 0) = 0.5$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X$ 和 $Y$ 相互独立，且 $P\{X = 0\} = P\{Y = 0\} = \frac{1}{3}$，$P\{X = 1\} = P\{Y = 1\} = \frac{2}{3}$，则 $P\{X = Y\} =$______。
:::

:::callout{kind=insight label="解析"}
$X, Y$ 独立，$P\{X = Y\} = P\{X = 0, Y = 0\} + P\{X = 1, Y = 1\}$

$$= P\{X = 0\} \cdot P\{Y = 0\} + P\{X = 1\} \cdot P\{Y = 1\}$$

$$= \frac{1}{3} \times \frac{1}{3} + \frac{2}{3} \times \frac{2}{3} = \frac{1}{9} + \frac{4}{9} = \frac{5}{9}$$
:::

:::callout{kind=tip label="结论速记"}
独立离散变量 $P(X = Y) = \sum_k P(X = k) \cdot P(Y = k)$。
:::

---

## 三、（10分）

:::callout{kind=note label="题目"}
设房间A中有3只白猫和2只黑猫，房间B中有2只白猫和3只黑猫，房间C中有4只白猫和6只黑猫。现在随机选取一个房间并从中随机选择一只猫，

(1) 求选择的猫为白猫的概率；

(2) 已知选择的猫为白猫，求此猫来自房间A的概率。
:::

:::callout{kind=insight label="解析"}
**(1)** 设 $D_i$ 为选第 $i$ 个房间（$i = A, B, C$），$P(D_A) = P(D_B) = P(D_C) = \frac{1}{3}$。

$$P(\text{白}) = P(D_A) \cdot \frac{3}{5} + P(D_B) \cdot \frac{2}{5} + P(D_C) \cdot \frac{4}{10}$$

$$= \frac{1}{3} \times \frac{3}{5} + \frac{1}{3} \times \frac{2}{5} + \frac{1}{3} \times \frac{2}{5} = \frac{3}{15} + \frac{2}{15} + \frac{2}{15} = \frac{7}{15}$$

**(2)** 由贝叶斯公式：

$$P(D_A | \text{白}) = \frac{P(\text{白}|D_A) \cdot P(D_A)}{P(\text{白})} = \frac{\frac{3}{5} \times \frac{1}{3}}{\frac{7}{15}} = \frac{\frac{1}{5}}{\frac{7}{15}} = \frac{3}{7}$$
:::

:::callout{kind=tip label="结论速记"}
全概率公式和贝叶斯公式是核心工具：先全概率求分母，再贝叶斯求后验。
:::

---

## 四、（12分）

:::callout{kind=note label="题目"}
已知 $(X, Y)$ 的概率密度函数为 $f(x, y) = \begin{cases} a(x + y), & |x| \leq y,\ 0 \leq y \leq 1 \\ 0, & \text{其他} \end{cases}$

求：(1) 常数 $a$ 的值；(2) 边缘密度函数 $f_X(x)$，$f_Y(y)$。
:::

:::callout{kind=insight label="解析"}
**(1)** 由归一化：$\iint f(x,y)\,dx\,dy = 1$

积分区域：$0 \leq y \leq 1$，$-y \leq x \leq y$

$$\int_0^1 \int_{-y}^{y} a(x + y)\,dx\,dy = a\int_0^1 \left[\frac{x^2}{2} + xy\right]_{-y}^{y} dy$$

$$= a\int_0^1 \left[\left(\frac{y^2}{2} + y^2\right) - \left(\frac{y^2}{2} - y^2\right)\right] dy = a\int_0^1 2y^2\,dy = a \cdot \frac{2}{3} = 1$$

$$a = \frac{3}{2}$$

**(2)** $f_Y(y) = \int_{-y}^{y} \frac{3}{2}(x + y)\,dx = \frac{3}{2} \cdot 2y^2 = 3y^2$，$0 \leq y \leq 1$

$f_X(x)$：当 $0 \leq x \leq 1$ 时，$y$ 从 $x$ 到 1：

$$f_X(x) = \int_x^1 \frac{3}{2}(x + y)\,dy = \frac{3}{2}\left[xy + \frac{y^2}{2}\right]_x^1 = \frac{3}{2}\left(x + \frac{1}{2} - x^2 - \frac{x^2}{2}\right) = \frac{3}{2}\left(x + \frac{1}{2} - \frac{3x^2}{2}\right)$$

当 $-1 \leq x \leq 0$ 时，$y$ 从 $-x$ 到 1：

$$f_X(x) = \int_{-x}^1 \frac{3}{2}(x + y)\,dy = \frac{3}{2}\left[xy + \frac{y^2}{2}\right]_{-x}^1 = \frac{3}{2}\left(x + \frac{1}{2} + x^2 - \frac{x^2}{2}\right) = \frac{3}{2}\left(x + \frac{1}{2} + \frac{x^2}{2}\right)$$
:::

:::callout{kind=tip label="结论速记"}
归一化求常数，注意积分区域的对称性。边缘密度对另一个变量积分，注意积分上下限由联合密度的支撑集决定。
:::

---

## 五、（12分）

:::callout{kind=note label="题目"}
已知 $(X, Y)$ 的概率密度函数为 $f(x, y) = \begin{cases} xy, & 0 \leq x \leq 2,\ 0 \leq y \leq 1 \\ 0, & \text{其他} \end{cases}$

求：(1) $Z_1 = X + Y$ 的概率密度函数；(2) $Z_2 = \begin{cases} 1, & X \leq 2Y \\ 0, & X > 2Y \end{cases}$ 的分布。
:::

:::callout{kind=insight label="解析"}
**(1)** 用卷积公式求 $Z = X + Y$ 的密度：

$$f_Z(z) = \int f(x, z - x)\,dx$$

需要 $0 \leq x \leq 2$，$0 \leq z - x \leq 1$，即 $z - 1 \leq x \leq z$。

当 $0 \leq z \leq 1$ 时，$x \in [0, z]$：

$$f_Z(z) = \int_0^z x(z-x)\,dx = \left[\frac{zx^2}{2} - \frac{x^3}{3}\right]_0^z = \frac{z^3}{2} - \frac{z^3}{3} = \frac{z^3}{6}$$

当 $1 < z \leq 2$ 时，$x \in [z-1, z]$：

$$f_Z(z) = \int_{z-1}^z x(z-x)\,dx = \left[\frac{zx^2}{2} - \frac{x^3}{3}\right]_{z-1}^z = \frac{z^3}{6} - \frac{z(z-1)^2}{2} + \frac{(z-1)^3}{3}$$

当 $2 < z \leq 3$ 时，$x \in [z-1, 2]$：

$$f_Z(z) = \int_{z-1}^{2} x(z-x)\,dx = \left[\frac{zx^2}{2} - \frac{x^3}{3}\right]_{z-1}^{2}$$

**(2)** $Z_2$ 是伯努利随机变量，$P(Z_2 = 1) = P(X \leq 2Y)$。

$$P(X \leq 2Y) = \iint_{x \leq 2y} f(x,y)\,dx\,dy = \int_0^1 \int_0^{\min(2y, 2)} xy\,dx\,dy$$

当 $0 \leq y \leq 1$ 时 $2y \leq 2$，所以 $x$ 从 0 到 $2y$：

$$= \int_0^1 \int_0^{2y} xy\,dx\,dy = \int_0^1 y \cdot \frac{(2y)^2}{2}\,dy = \int_0^1 2y^3\,dy = \frac{1}{2}$$

$Z_2 \sim B\left(1, \frac{1}{2}\right)$。
:::

:::callout{kind=tip label="结论速记"}
卷积公式求和的密度，注意分段讨论。伯努利分布只需算 $P(Z_2 = 1)$。
:::

---

## 六、（12分）

:::callout{kind=note label="题目"}
设随机变量 $X_1 \sim N(\mu_1, \sigma_1^2)$，$X_2 \sim N(\mu_2, \sigma_2^2)$，且 $X_1, X_2$ 相互独立，令 $Y = \alpha X_1 + \beta X_2$，$Z = \alpha X_1 - \beta X_2$，$\alpha$ 和 $\beta$ 是不为0的常数。

求：(1) $Y$ 和 $Z$ 的分布；(2) $Y$ 和 $Z$ 的相关系数。
:::

:::callout{kind=insight label="解析"}
**(1)** $X_1, X_2$ 独立且正态，线性组合仍为正态。

$$Y = \alpha X_1 + \beta X_2 \sim N(\alpha\mu_1 + \beta\mu_2,\ \alpha^2\sigma_1^2 + \beta^2\sigma_2^2)$$

$$Z = \alpha X_1 - \beta X_2 \sim N(\alpha\mu_1 - \beta\mu_2,\ \alpha^2\sigma_1^2 + \beta^2\sigma_2^2)$$

**(2)** $\text{Cov}(Y, Z) = \text{Cov}(\alpha X_1 + \beta X_2,\ \alpha X_1 - \beta X_2)$

$$= \alpha^2 \text{Var}(X_1) - \beta^2 \text{Var}(X_2) = \alpha^2 \sigma_1^2 - \beta^2 \sigma_2^2$$

$$DY = DZ = \alpha^2\sigma_1^2 + \beta^2\sigma_2^2$$

$$\rho_{YZ} = \frac{\alpha^2\sigma_1^2 - \beta^2\sigma_2^2}{\alpha^2\sigma_1^2 + \beta^2\sigma_2^2}$$
:::

:::callout{kind=tip label="结论速记"}
独立正态变量的线性组合仍正态。相关系数 = $\frac{\text{Cov}(Y,Z)}{\sqrt{DY \cdot DZ}}$，利用双线性展开协方差。
:::

---

## 七、（12分）

:::callout{kind=note label="题目"}
设某种元器件的标准长度为 $\mu_0$（已知），现抽取 $n$ 个元器件对长度进行测量，假设测量结果 $X_1, X_2, \ldots, X_n$ 为来自正态分布 $N(\mu_0, \sigma^2)$ 的简单随机样本，并记录绝对误差：$Y_i = |X_i - \mu_0|$，$i = 1, 2, \ldots, n$。

求：(1) $Y_1$ 的密度函数；(2) 基于 $X_1, X_2, \ldots, X_n$，求 $\sigma^2$ 的极大似然估计；(3) 基于 $Y_1, Y_2, \ldots, Y_n$，求 $\sigma^2$ 的极大似然估计。
:::

:::callout{kind=insight label="解析"}
**(1)** $X_1 \sim N(\mu_0, \sigma^2)$，$Y_1 = |X_1 - \mu_0|$。

令 $W = X_1 - \mu_0 \sim N(0, \sigma^2)$，$Y_1 = |W|$（半正态分布）。

当 $y > 0$ 时：

$$f_{Y_1}(y) = f_W(y) + f_W(-y) = \frac{1}{\sqrt{2\pi}\sigma}e^{-y^2/(2\sigma^2)} + \frac{1}{\sqrt{2\pi}\sigma}e^{-y^2/(2\sigma^2)} = \frac{2}{\sqrt{2\pi}\sigma}e^{-y^2/(2\sigma^2)}$$

$f_{Y_1}(y) = 0$，$y \leq 0$。

**(2)** $X_i \sim N(\mu_0, \sigma^2)$，$\mu_0$ 已知：

$$\ln L = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln\sigma^2 - \frac{\sum(X_i - \mu_0)^2}{2\sigma^2}$$

对 $\sigma^2$ 求导令其为 0：

$$\hat{\sigma}^2_{\text{MLE}} = \frac{1}{n}\sum_{i=1}^n (X_i - \mu_0)^2$$

**(3)** $Y_i = |X_i - \mu_0|$，密度 $f_Y(y) = \frac{2}{\sqrt{2\pi}\sigma}e^{-y^2/(2\sigma^2)}$，$y > 0$。

$$\ln L = n\ln\frac{2}{\sqrt{2\pi}} - \frac{n}{2}\ln\sigma^2 - \frac{\sum Y_i^2}{2\sigma^2}$$

对 $\sigma^2$ 求导令其为 0：

$$\hat{\sigma}^2_{\text{MLE}} = \frac{1}{n}\sum_{i=1}^n Y_i^2 = \frac{1}{n}\sum_{i=1}^n (X_i - \mu_0)^2$$

两种方法得到相同的估计。
:::

:::callout{kind=tip label="结论速记"}
$\mu$ 已知时 $\sigma^2$ 的 MLE $= \frac{1}{n}\sum(X_i - \mu_0)^2$。$|X_i - \mu_0|$ 的平方和等于 $(X_i - \mu_0)^2$ 的和，所以两种方法结果一致。
:::

---

> 本试卷练习完
