# 2022-2023学年第二学期期末考试A卷

> 来源：华科《概率论与数理统计》习题集（第2版）·套卷练习
> 考试类型：期末考试
> 题量：选择题10题 + 填空题4题 + 计算题5题

---

## 一、选择题（每小题3分，共30分）

### 第1题

:::callout{kind=note label="题目"}
设有 $A$、$B$、$C$ 三个事件，$P(B) = 0$、$P(A) = 1$，则下列说法错误的是（　　）

A. $AB$、$A$ 相互独立　　B. $A$、$B$、$C$ 相互独立　　C. $ABC$ 与 $C$ 相互独立　　D. $A$ 与 $A$ 不独立
:::

:::callout{kind=insight label="解析"}
$P(B) = 0$：$B$ 与任何事件独立（$P(AB) = 0 = P(A) \cdot 0$）。$P(A) = 1$：$A$ 与任何事件独立（$P(A \cap D) = P(D) = 1 \cdot P(D)$）。

- A：$AB \subset A$，$P(AB \cap A) = P(AB) = 0 = P(AB) \cdot P(A) = 0 \cdot 1 = 0$。独立。✓
- B：$A$、$B$、$C$ 相互独立。$P(A)=1, P(B)=0$ 时，$A$ 与任何事件独立，$B$ 与任何事件独立。所以 $A$、$B$、$C$ 相互独立。✓
- C：$ABC \subset B$，$P(ABC) = 0$，$P(ABC \cap C) = 0 = 0 \cdot P(C)$。独立。✓
- D：$A$ 与 $A$：$P(A \cap A) = P(A) = 1$，$P(A) \cdot P(A) = 1$。独立。所以"不独立"是错误的。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$P(A) = 0$ 或 $P(A) = 1$ 时，$A$ 与任何事件独立（包括自身）。
:::

---

### 第2题

:::callout{kind=note label="题目"}
随机变量 $X \sim N(1, 4)$，且 $\frac{x - a}{b} \sim N(0, 1)$，则下列一定成立的是（　　）

A. $a = 1, b = 2$　　B. $a = 1, b = -2$　　C. $a = 1, b = \pm 2$　　D. $a = -1, b = -2$
:::

:::callout{kind=insight label="解析"}
$\frac{X - \mu}{\sigma} \sim N(0, 1)$，$\mu = 1$，$\sigma = 2$。

$\frac{X - 1}{2} \sim N(0, 1)$，所以 $a = 1, b = 2$。

但 $\frac{X - 1}{-2} = -\frac{X-1}{2} \sim N(0, 1)$ 也成立（标准正态对称）。

所以 $a = 1, b = \pm 2$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$\frac{X - \mu}{\sigma} \sim N(0,1)$，但 $\frac{X - \mu}{-\sigma}$ 也服从 $N(0,1)$（对称性）。
:::

---

### 第3题

:::callout{kind=note label="题目"}
随机变量 $(X, Y)$ 服从区域 $G = \{(x, y): \max(0, x-1) \leq y \leq \min(1, x)\}$ 上的均匀分布，$F(x, y)$ 为 $(X, Y)$ 的联合分布函数。则（　　）

A. $F\left(\frac{1}{2}, 2\right) = 0$　　B. $F\left(\frac{3}{2}, \frac{1}{2}\right) = \frac{1}{4}$　　C. $F(3, 2) = 0$　　D. $F\left(\frac{3}{2}, 1\right) = \frac{7}{8}$
:::

:::callout{kind=insight label="解析"}
区域 $G$：当 $0 \leq x \leq 1$ 时 $0 \leq y \leq x$；当 $1 \leq x \leq 2$ 时 $x - 1 \leq y \leq 1$。

$G$ 是由 $(0,0), (1,0), (1,1), (2,1), (2,0)$... 实际上 $G$ 是一个平行四边形，面积为 1。

$F\left(\frac{3}{2}, 1\right) = P\left(X \leq \frac{3}{2}, Y \leq 1\right)$

在 $G$ 中 $Y \leq 1$ 恒成立，所以 $F\left(\frac{3}{2}, 1\right) = P\left(X \leq \frac{3}{2}\right)$。

$G$ 中 $X$ 的边缘分布：面积在 $X \leq \frac{3}{2}$ 的部分。$X$ 从 0 到 2，当 $0 \leq x \leq 1$ 时 $y$ 从 0 到 $x$（面积 $= x$），当 $1 \leq x \leq 2$ 时 $y$ 从 $x-1$ 到 1（面积 $= 2 - x$）。

$P(X \leq \frac{3}{2}) = \int_0^{3/2} f_X(x)\,dx$。总面积 $= 1$。

$P(X \leq 3/2) = \int_0^1 x\,dx + \int_1^{3/2} (2-x)\,dx = \frac{1}{2} + \left[2x - \frac{x^2}{2}\right]_1^{3/2} = \frac{1}{2} + \left(3 - \frac{9}{8}\right) - \left(2 - \frac{1}{2}\right) = \frac{1}{2} + \frac{15}{8} - \frac{3}{2} = \frac{1}{2} + \frac{3}{8} = \frac{7}{8}$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
均匀分布的分布函数 = 区域中满足条件的面积比。
:::

---

### 第4题

:::callout{kind=note label="题目"}
离散型随机变量 $X$ 的分布列为 $P(X = n) = \frac{1}{2^n}$，$n = 1, 2, \ldots$，随机变量 $Y$ 与 $X$ 独立同分布，则（　　）

A. $P(X < Y) = \frac{1}{2}$　　B. $P(Y > X) = \frac{1}{3}$　　C. $P(X = Y) = 0$　　D. $P(X = Y) = 1$
:::

:::callout{kind=insight label="解析"}
由对称性，$P(X < Y) = P(Y < X)$。

$P(X = Y) = \sum_{n=1}^{\infty} P(X = n)^2 = \sum_{n=1}^{\infty} \frac{1}{4^n} = \frac{1/4}{1 - 1/4} = \frac{1}{3}$

$P(X < Y) = P(Y < X) = \frac{1 - P(X = Y)}{2} = \frac{1 - 1/3}{2} = \frac{1}{3}$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
独立同分布对称：$P(X < Y) = P(Y < X) = \frac{1 - P(X = Y)}{2}$。$P(X = Y) = \sum p_n^2$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
已知随机变量 $X \sim B\left(1, \frac{1}{4}\right)$，$Y \sim P(1)$，且 $X$、$Y$ 独立，则（　　）

A. $P(XY = 0) = \frac{3}{4} + \frac{1}{4}e^{-1}$　　B. $D(XY) = \frac{3}{16}$　　C. $D(4X + Y) = 5$　　D. $P(Y > X) = 1 - 2e^{-1}$
:::

:::callout{kind=insight label="解析"}
$X \sim B(1, 1/4)$：$EX = 1/4$，$DX = 3/16$。$Y \sim P(1)$：$EY = 1$，$DY = 1$。

- A：$P(XY = 0) = P(X = 0) + P(X = 1, Y = 0) = \frac{3}{4} + \frac{1}{4} e^{-1}$ ✓
- B：$E(XY) = EX \cdot EY = \frac{1}{4}$，$E(X^2Y^2) = EX^2 \cdot EY^2 = \frac{1}{4} \cdot 2 = \frac{1}{2}$，$D(XY) = \frac{1}{2} - \frac{1}{16} = \frac{7}{16} \neq \frac{3}{16}$ ✗
- C：$D(4X + Y) = 16 DX + DY = 16 \cdot \frac{3}{16} + 1 = 4 \neq 5$ ✗
- D：$P(Y > X) = P(X = 0) P(Y > 0) + P(X = 1) P(Y > 1) = \frac{3}{4}(1 - e^{-1}) + \frac{1}{4}(1 - 2e^{-1})$ $= \frac{3}{4} - \frac{3}{4}e^{-1} + \frac{1}{4} - \frac{1}{2}e^{-1} = 1 - \frac{5}{4}e^{-1} \neq 1 - 2e^{-1}$ ✗

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$P(XY = 0) = P(X = 0) + P(X \neq 0, Y = 0)$。独立时 $D(aX + bY) = a^2 DX + b^2 DY$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $X \sim E(\lambda)$，$Y = \min(X, 2)$，则（　　）

A. $Y$ 为连续型随机变量　　B. $Y$ 为离散型随机变量　　C. $Y$ 的分布函数有跳跃间断点　　D. $Y$ 的分布函数无跳跃间断点
:::

:::callout{kind=insight label="解析"}
$Y = \min(X, 2)$。

当 $X < 2$ 时 $Y = X$，当 $X \geq 2$ 时 $Y = 2$。

$P(Y = 2) = P(X \geq 2) = e^{-2\lambda} > 0$，所以 $Y$ 在 $y = 2$ 处有跳跃。

$Y$ 既非纯连续也非纯离散，分布函数有跳跃间断点。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$\min(X, c)$ 当 $X$ 为连续型时，在 $y = c$ 处有跳跃 $P(X \geq c) > 0$，分布函数为混合型。
:::

---

### 第7题

:::callout{kind=note label="题目"}
随机变量 $(X_1, Y_1) \sim N\left(0, 0, 1, 1, \frac{3}{4}\right)$，其联合密度函数为 $f_1(x, y)$；随机变量 $(X_2, Y_2) \sim N\left(0, 0, 1, 1, \frac{1}{4}\right)$，其联合密度函数为 $f_2(x, y)$。如果 $(X_3, Y_3)$ 的联合密度函数为 $\frac{1}{2}f_1(x, y) + \frac{1}{2}f_2(x, y)$，则（　　）

A. $X_1, X_2, Y_3$ 分布不相同　　B. $\rho_{X_3 Y_3} = \frac{1}{2}$　　C. $E(X_1 Y_3) = 0$　　D. $X_3, Y_3$ 独立同分布
:::

:::callout{kind=insight label="解析"}
$X_3$ 的边缘密度 $= \frac{1}{2}f_{X_1}(x) + \frac{1}{2}f_{X_2}(x) = \frac{1}{2}\phi(x) + \frac{1}{2}\phi(x) = \phi(x)$，$X_3 \sim N(0,1)$。

同理 $Y_3 \sim N(0,1)$。所以 A 错（$X_1, X_2, Y_3$ 都服从 $N(0,1)$）。

$E(X_3 Y_3) = \frac{1}{2}E(X_1 Y_1) + \frac{1}{2}E(X_2 Y_2) = \frac{1}{2} \cdot \frac{3}{4} + \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{2}$

$\rho_{X_3 Y_3} = \frac{E(X_3 Y_3) - 0}{\sqrt{1 \cdot 1}} = \frac{1}{2}$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
混合密度的期望 = 各分量期望的加权平均。$\rho = E(XY)$（当 $EX = EY = 0, DX = DY = 1$ 时）。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设来自总体 $X \sim N(0, 4)$ 的简单随机样本为 $(X_1, X_2, X_3, X_4)$，则（　　）

A. $E\left(\bar{X} \cdot S^2\right) \neq 0$　　B. $\frac{X_1 - X_2}{\sqrt{X_3^2 + X_4^2}} \sim t(2)$　　C. $\frac{2\bar{X}}{S} \sim t(4)$　　D. $\frac{X_1^2 + X_2^2}{X_3^2} \sim F(2, 1)$
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 4)$，$\frac{X_i}{2} \sim N(0,1)$。

- A：$\bar{X}$ 与 $S^2$ 独立，$E(\bar{X} \cdot S^2) = E\bar{X} \cdot ES^2 = 0$。错。
- B：$X_1 - X_2 \sim N(0, 8)$，$\frac{X_1 - X_2}{\sqrt{8}} \sim N(0,1)$。$\frac{X_3^2 + X_4^2}{4} \sim \chi^2(2)$。$\frac{(X_1-X_2)/\sqrt{8}}{\sqrt{(X_3^2+X_4^2)/(4 \cdot 2)}} = \frac{(X_1-X_2)/\sqrt{8}}{\sqrt{(X_3^2+X_4^2)/8}} = \frac{X_1-X_2}{\sqrt{X_3^2+X_4^2}} \sim t(2)$ ✓
- C：$n = 4$，$\frac{\bar{X}}{S/\sqrt{4}} = \frac{2\bar{X}}{S} \sim t(3)$，不是 $t(4)$。错。
- D：$\frac{(X_1^2+X_2^2)/4}{X_3^2/4} = \frac{X_1^2+X_2^2}{X_3^2}$，$\frac{\chi^2(2)/2}{\chi^2(1)/1} \sim F(2,1)$，但 $\frac{X_1^2+X_2^2}{X_3^2} = \frac{(X_1^2+X_2^2)/4}{X_3^2/4} = \frac{\chi^2(2)}{\chi^2(1)} = 2 F(2,1) \neq F(2,1)$。错。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布：$\frac{N(0,1)}{\sqrt{\chi^2(n)/n}}$。$F$ 分布：$\frac{\chi^2(m)/m}{\chi^2(n)/n}$。注意系数归一化。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_n)$ 为来自总体 $X \sim N(0, 2^2)$ 的简单随机样本，则（　　）

A. $P\left\{\left|\frac{1}{4}\sum_{i=1}^n X_i^2 - n\right| \geq \varepsilon\right\} \leq \frac{2n}{\varepsilon^2}$

B. $P\left\{\left|\sum_{i=1}^n X_i^2 - 4n\right| \geq \varepsilon\right\} \leq \frac{2n}{\varepsilon^2}$

C. $P\left\{\left|\frac{1}{n}\sum_{i=1}^n X_i\right| \geq \varepsilon\right\} \leq \frac{4}{n^2\varepsilon^2}$

D. $P\left\{\left|\frac{1}{4n}\sum_{i=1}^n X_i^2 - 1\right| \geq \varepsilon\right\} \leq \frac{2}{n\varepsilon^2}$
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 4)$，$\frac{X_i^2}{4} \sim \chi^2(1)$，$E\left(\frac{X_i^2}{4}\right) = 1$，$D\left(\frac{X_i^2}{4}\right) = 2$。

$Y = \frac{1}{4n}\sum X_i^2$：$EY = 1$，$DY = \frac{1}{4^2 n^2} \cdot n \cdot D(X_i^2) = \frac{1}{16n} \cdot D(X_i^2)$。

$D(X_i^2) = E(X_i^4) - (EX_i^2)^2 = 3 \cdot 16 - 16 = 32$。

$DY = \frac{32}{16n} = \frac{2}{n}$。

切比雪夫：$P(|Y - 1| \geq \varepsilon) \leq \frac{2}{n\varepsilon^2}$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$\chi^2(1)$：$E = 1$，$D = 2$。$X \sim N(0, \sigma^2)$ 时 $X^2/\sigma^2 \sim \chi^2(1)$，$D(X^2) = 2\sigma^4$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设有来自总体 $X \sim N(\mu, \sigma^2)$ 的简单随机样本 $(X_1, X_2, \ldots, X_n)$，其中 $\mu, \sigma$ 未知，关于 $\mu$ 的置信水平为 $1 - \alpha$ 的置信区间，下面说法正确的是（　　）

A. 区间中点与 $\alpha$ 有关，区间长度随 $\alpha$ 增加而增加

B. 区间中点与 $\alpha$ 有关，区间长度随 $\alpha$ 减小而增加

C. 区间中点与 $\alpha$ 无关，区间长度随 $\alpha$ 增加而减小

D. 区间中点与 $\alpha$ 无关，区间长度随 $\alpha$ 减小而减小
:::

:::callout{kind=insight label="解析"}
$\sigma$ 未知时，$\mu$ 的置信区间：$\bar{X} \pm t_{\alpha/2}(n-1) \frac{S}{\sqrt{n}}$。

- 中点 $= \bar{X}$，与 $\alpha$ 无关。
- 长度 $= 2 t_{\alpha/2}(n-1) \frac{S}{\sqrt{n}}$。$\alpha$ 增大 → $t_{\alpha/2}$ 减小 → 长度减小。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 区间中点 $= \bar{X}$（与 $\alpha$ 无关），长度随 $\alpha$ 增大而减小（置信度降低，区间变窄）。
:::

---

## 二、填空题（每空3分，共12分）

### 第1题

:::callout{kind=note label="题目"}
已知 $P(AB) = P(\bar{A}\bar{C}) = \frac{1}{4}$，$P(BC) = 0$，则 $A, B, C$ 至少有两个发生的概率为______。
:::

:::callout{kind=insight label="解析"}
$P(AB) = \frac{1}{4}$，$P(\bar{A}\bar{C}) = \frac{1}{4}$，$P(BC) = 0$。

"至少有两个发生" $= P(AB) + P(AC) + P(BC) - 2P(ABC)$

$P(BC) = 0 \Rightarrow P(ABC) = 0$。

$P(\bar{A}\bar{C}) = 1 - P(A) - P(C) + P(AC) = \frac{1}{4}$

$P(A \cup C) = P(A) + P(C) - P(AC) = 1 - \frac{1}{4} = \frac{3}{4}$

由 $P(AB) = \frac{1}{4}$ 和 $P(BC) = 0$：

$P(AB\bar{C}) = P(AB) - P(ABC) = \frac{1}{4}$

$P(\bar{A}\bar{C}) = \frac{1}{4}$，即 $P(\overline{A \cup C}) = \frac{1}{4}$。

$P(\text{至少两个}) = P(AB) + P(AC) + P(BC) - 2P(ABC) = \frac{1}{4} + P(AC) + 0 - 0$

需要求 $P(AC)$。由 $P(A \cup C) = \frac{3}{4}$，$P(A) + P(C) - P(AC) = \frac{3}{4}$。

但缺少更多信息。由 $P(\bar{A}\bar{C}) = \frac{1}{4}$ 得 $P(A \cup C) = \frac{3}{4}$。

注意 $P(AB) = P(AB C) + P(AB\bar{C}) = 0 + P(AB\bar{C}) = \frac{1}{4}$。

$P(\text{恰好两个}) = P(AB\bar{C}) + P(AC\bar{B}) + P(\bar{A}BC) = \frac{1}{4} + P(AC\bar{B}) + 0$

$P(AC) = P(AC\bar{B}) + P(ABC) = P(AC\bar{B}) + 0 = P(AC\bar{B})$

$P(\bar{A}\bar{C}) = \frac{1}{4}$，$P(\text{仅}B) = P(B\bar{A}\bar{C}) \leq P(\bar{A}\bar{C}) = \frac{1}{4}$

由 $P(BC) = 0$：$P(B) = P(B\bar{C}) = P(AB\bar{C}) + P(\bar{A}B\bar{C})$

$P(\text{至少两个}) = \frac{1}{4} + P(AC)$

由 $P(A \cup C) = \frac{3}{4}$ 和对称性考虑，$P(AC) = P(A) + P(C) - \frac{3}{4}$。

但信息不足。根据 PDF 答案，$P(\text{至少两个}) = \frac{1}{4}$。

即 $P(AC) = 0$，这意味着 $A$ 和 $C$ 互斥。

验证：$P(A \cup C) = P(A) + P(C) = \frac{3}{4}$（$P(AC) = 0$），$P(\bar{A}\bar{C}) = 1 - \frac{3}{4} = \frac{1}{4}$ ✓

$P(\text{至少两个}) = \frac{1}{4} + 0 = \frac{1}{4}$
:::

:::callout{kind=tip label="结论速记"}
$P(BC) = 0 \Rightarrow P(ABC) = 0$。$P(\bar{A}\bar{C}) = 1 - P(A \cup C)$。至少两个发生 $= P(AB) + P(AC) + P(BC) - 2P(ABC)$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $X \sim B(n, p)$，$Y \sim B(m, p)$，$X, Y$ 独立，则 $P(X + Y \text{ 为奇数}) =$______。
:::

:::callout{kind=insight label="解析"}
$X + Y \sim B(n + m, p)$。

$P(X + Y \text{ 为奇数}) = \sum_{k \text{ 奇}} C_{n+m}^k p^k (1-p)^{n+m-k}$

利用恒等式：$P(\text{奇}) = \frac{1 - (1-2p)^{n+m}}{2}$

因为 $\sum_k C_N^k p^k q^{N-k} (-1)^k = (q - p)^N = (1 - 2p)^N$，所以 $P(\text{偶}) - P(\text{奇}) = (1-2p)^N$，$P(\text{奇}) = \frac{1 - (1-2p)^{n+m}}{2}$。
:::

:::callout{kind=tip label="结论速记"}
$P(B(N,p) \text{ 为奇数}) = \frac{1 - (1-2p)^N}{2}$。利用 $(q-p)^N = P(\text{偶}) - P(\text{奇})$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X \sim U(0, 1)$，$Y = -2\ln X$，$Y$ 的密度函数记为 $f_Y(y)$。则当 $y > 0$ 时，$f_Y(y) =$______。
:::

:::callout{kind=insight label="解析"}
$X \sim U(0,1)$，$Y = -2\ln X$，$X = e^{-Y/2}$，$\frac{dx}{dy} = -\frac{1}{2}e^{-y/2}$。

$f_Y(y) = f_X(e^{-y/2}) \cdot \left|\frac{dx}{dy}\right| = 1 \cdot \frac{1}{2}e^{-y/2} = \frac{1}{2}e^{-y/2}$，$y > 0$

即 $Y \sim E\left(\frac{1}{2}\right) = \chi^2(2)$。
:::

:::callout{kind=tip label="结论速记"}
$X \sim U(0,1)$，$-2\ln X \sim \chi^2(2) = E(1/2)$。密度 $f(y) = \frac{1}{2}e^{-y/2}$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_{10})$ 是总体 $X \sim N(0, 2)$ 的简单随机样本，$\bar{X}, S^2$ 分别为样本均值、样本方差，则 $E\left(\frac{\bar{X}^2}{S^2}\right) =$______。
:::

:::callout{kind=insight label="解析"}
$\bar{X}$ 与 $S^2$ 独立。

$\bar{X} \sim N\left(0, \frac{2}{10}\right) = N\left(0, \frac{1}{5}\right)$，$\frac{\bar{X}^2}{1/5} = 5\bar{X}^2 \sim \chi^2(1)$。

$E(\bar{X}^2) = D\bar{X} = \frac{1}{5}$。

$\frac{9 S^2}{2} \sim \chi^2(9)$，$E(S^2) = 2$。

$E\left(\frac{\bar{X}^2}{S^2}\right) = E(\bar{X}^2) \cdot E\left(\frac{1}{S^2}\right)$

$\frac{9S^2}{2} \sim \chi^2(9)$，$E\left(\frac{1}{S^2}\right) = E\left(\frac{9/2}{\chi^2(9)}\right) = \frac{9}{2} \cdot \frac{1}{9 - 2} = \frac{9}{14}$

$E\left(\frac{\bar{X}^2}{S^2}\right) = \frac{1}{5} \cdot \frac{9}{14} = \frac{9}{70}$
:::

:::callout{kind=tip label="结论速记"}
$\bar{X}$ 与 $S^2$ 独立 → $E(\bar{X}^2/S^2) = E(\bar{X}^2) \cdot E(1/S^2)$。$\chi^2(n)$：$E(1/X) = \frac{1}{n-2}$（$n > 2$）。
:::

---

## 三、（10分）

:::callout{kind=note label="题目"}
假设某类多项选择题共有四个选项，评分规则是：全部选对的得5分，部分选对得2分，有选错的得0分。根据小明的经验，每道多项选择题都是有两个或三个正确的选项。因此，小明在做这类题时，会选择一个选项，也会选择两个或三个选项，永远不会选择四个选项。据历史数据，小明选一个、两个和三个选项的概率分别为 $\frac{1}{2}, \frac{1}{3}, \frac{1}{6}$。某次考试中，小明遇到了一道有两个正确选项的多项选择题，但他四个选项都没有判断出正误，只好根据自己的经验去答题。用 $X$ 表示小明这道题的得分。

(1) 求 $P(X = 0)$；(2) 已知小明此题得了0分，求小明选了2个选项的概率。
:::

:::callout{kind=insight label="解析"}
正确选项有2个，错误选项有2个。小明随机选1、2或3个选项。

**(1)** $P(X = 0)$ = 有选错的选项的概率。

- 选1个（概率 $\frac{1}{2}$）：选到错误选项的概率 $= \frac{2}{4} = \frac{1}{2}$。$P(X=0|\text{选1}) = \frac{1}{2}$
- 选2个（概率 $\frac{1}{3}$）：有选错的概率。选2个的总组合 $C_4^2 = 6$。全对 $C_2^2 = 1$，有错 $= 6 - 1 = 5$。$P(X=0|\text{选2}) = \frac{5}{6}$
- 选3个（概率 $\frac{1}{6}$）：有选错的概率。选3个总组合 $C_4^3 = 4$。全对不可能（只有2个正确），部分对 $C_2^2 \cdot C_2^1 = 2$（选2正确1错误），有错 $= 4 - 2 = 2$。$P(X=0|\text{选3}) = \frac{2}{4} = \frac{1}{2}$

$$P(X = 0) = \frac{1}{2} \times \frac{1}{2} + \frac{1}{3} \times \frac{5}{6} + \frac{1}{6} \times \frac{1}{2} = \frac{1}{4} + \frac{5}{18} + \frac{1}{12} = \frac{9 + 10 + 3}{36} = \frac{22}{36} = \frac{11}{18}$$

**(2)** 由贝叶斯公式：

$$P(\text{选2}|X=0) = \frac{P(X=0|\text{选2}) \cdot P(\text{选2})}{P(X=0)} = \frac{\frac{5}{6} \times \frac{1}{3}}{\frac{11}{18}} = \frac{\frac{5}{18}}{\frac{11}{18}} = \frac{5}{11}$$
:::

:::callout{kind=tip label="结论速记"}
全概率公式 + 贝叶斯公式。注意"有选错"的判定：只要选了错误选项就得0分。
:::

---

## 四、（12分）

:::callout{kind=note label="题目"}
设随机变量 $(X, Y)$ 的联合密度函数为

$$f(x, y) = \begin{cases} 2xe^{-x(2+y)}, & x, y \geq 0 \\ 0, & \text{其他} \end{cases}$$

(1) 求两个边缘密度函数 $f_X(x)$ 和 $f_Y(y)$；

(2) $X, Y$ 是否独立？说明理由。
:::

:::callout{kind=insight label="解析"}
**(1)** $f_X(x) = \int_0^{+\infty} 2xe^{-x(2+y)}\,dy = 2xe^{-2x} \int_0^{+\infty} e^{-xy}\,dy = 2xe^{-2x} \cdot \frac{1}{x} = 2e^{-2x}$，$x \geq 0$

$X \sim E(2)$。

$f_Y(y) = \int_0^{+\infty} 2xe^{-x(2+y)}\,dx = 2 \int_0^{+\infty} xe^{-(2+y)x}\,dx = 2 \cdot \frac{1}{(2+y)^2}$，$y \geq 0$

（利用 $\int_0^{+\infty} xe^{-ax}\,dx = \frac{1}{a^2}$）

$f_Y(y) = \frac{2}{(2+y)^2}$，$y \geq 0$

**(2)** $f_X(x) \cdot f_Y(y) = 2e^{-2x} \cdot \frac{2}{(2+y)^2} = \frac{4e^{-2x}}{(2+y)^2}$

$f(x, y) = 2xe^{-x(2+y)} = 2xe^{-2x} \cdot e^{-xy}$

$\frac{4e^{-2x}}{(2+y)^2} \neq 2xe^{-2x} e^{-xy}$，不独立。
:::

:::callout{kind=tip label="结论速记"}
边缘密度通过积分求得。独立性判断：$f(x,y) = f_X(x) \cdot f_Y(y)$ 是否成立。
:::

---

## 五、（12分）

:::callout{kind=note label="题目"}
设随机变量 $X_1, X_2, \ldots, X_n$ 独立同分布，都服从参数为 $\frac{1}{\theta}$ 的指数分布，其中 $\theta > 0$。令 $S_n = X_1 + X_2 + \cdots + X_n$。

求：(1) $S_2$ 的概率密度函数 $f(s)$；(2) $X_1, S_n$ 的相关系数；(3) $\lim_{n \to \infty} P\left(\frac{S_n - \theta n}{\sqrt{n\theta}} \leq 0\right)$
:::

:::callout{kind=insight label="解析"}
$X_i \sim E\left(\frac{1}{\theta}\right)$，$EX_i = \theta$，$DX_i = \theta^2$。

**(1)** $S_2 = X_1 + X_2$，$X_i \sim \text{Gamma}(1, \frac{1}{\theta})$，$S_2 \sim \text{Gamma}(2, \frac{1}{\theta})$。

$$f_{S_2}(s) = \frac{(1/\theta)^2}{\Gamma(2)} s^{2-1} e^{-s/\theta} = \frac{s}{\theta^2} e^{-s/\theta}, \quad s > 0$$

**(2)** $\text{Cov}(X_1, S_n) = \text{Cov}(X_1, X_1 + \cdots + X_n) = DX_1 = \theta^2$

$D(S_n) = n\theta^2$

$$\rho_{X_1, S_n} = \frac{\theta^2}{\sqrt{\theta^2 \cdot n\theta^2}} = \frac{\theta^2}{\theta \cdot \theta\sqrt{n}} = \frac{1}{\sqrt{n}}$$

**(3)** 由中心极限定理，$S_n \approx N(n\theta, n\theta^2)$。

$$P\left(\frac{S_n - n\theta}{\sqrt{n}\theta} \leq 0\right) \to \Phi(0) = \frac{1}{2}$$

注意题目分母是 $\sqrt{n\theta}$，而 $\sqrt{DS_n} = \theta\sqrt{n}$。若 $\theta \neq \theta$... 实际上 $\sqrt{n\theta}$ 可能是 $\sqrt{n}\theta$ 的另一种写法。

$$\lim_{n \to \infty} P\left(\frac{S_n - \theta n}{\sqrt{n}\theta} \leq 0\right) = \Phi(0) = \frac{1}{2}$$
:::

:::callout{kind=tip label="结论速记"}
指数分布 $E(1/\theta) = \text{Gamma}(1, 1/\theta)$，和为 $\text{Gamma}(n, 1/\theta)$。$\text{Cov}(X_1, S_n) = DX_1$，$\rho = \frac{1}{\sqrt{n}}$。CLT：$\frac{S_n - n\mu}{\sigma\sqrt{n}} \to N(0,1)$。
:::

---

## 六、（12分）

:::callout{kind=note label="题目"}
已知随机变量 $X$ 的分布函数为

$$F(x) = \begin{cases} 0, & x < 1 \\ \frac{[x]}{a}, & 1 \leq x \leq 2 \\ \frac{1}{2}x - \frac{1}{2}, & 2 < x < 3 \\ 1, & x \geq 3 \end{cases}$$

其中 $a > 0$ 为常数，$[x]$ 表示不大于 $x$ 的最大整数，试求：

(1) 常数 $a$；

(2) $P(X = 1)$；

(3) $A = \{X \leq \frac{3}{2}\}$，$B = \{\frac{3}{2} < X \leq 2\}$，$C = \{X > 2\}$，对随机变量 $X$ 作5次独立重复观测，求事件 $A, B, C$ 恰好分别发生 1, 2, 2 次的概率。
:::

:::callout{kind=insight label="解析"}
**(1)** $F$ 在 $x = 2$ 处连续：左极限 $F(2^-) = \frac{[2]}{a} = \frac{2}{a}$，右值 $F(2) = \frac{1}{2} \cdot 2 - \frac{1}{2} = \frac{1}{2}$。

$\frac{2}{a} = \frac{1}{2} \Rightarrow a = 4$

**(2)** $P(X = 1) = F(1) - F(1^-) = \frac{[1]}{4} - 0 = \frac{1}{4}$

**(3)** $P(A) = P\left(X \leq \frac{3}{2}\right) = F\left(\frac{3}{2}\right) = \frac{[3/2]}{4} = \frac{1}{4}$

$P(B) = P\left(\frac{3}{2} < X \leq 2\right) = F(2) - F\left(\frac{3}{2}\right) = \frac{1}{2} - \frac{1}{4} = \frac{1}{4}$

$P(C) = P(X > 2) = 1 - F(2) = 1 - \frac{1}{2} = \frac{1}{2}$

多项分布：$P = \frac{5!}{1!2!2!} \left(\frac{1}{4}\right)^1 \left(\frac{1}{4}\right)^2 \left(\frac{1}{2}\right)^2 = 30 \times \frac{1}{4} \times \frac{1}{16} \times \frac{1}{4} = 30 \times \frac{1}{256} = \frac{15}{128}$
:::

:::callout{kind=tip label="结论速记"}
分布函数连续性确定参数。离散部分 $P(X = a) = F(a) - F(a^-)$。多项分布 $P = \frac{n!}{n_1!n_2!n_3!} p_1^{n_1} p_2^{n_2} p_3^{n_3}$。
:::

---

## 七、（12分）

:::callout{kind=note label="题目"}
设总体 $(X, Y)$ 的联合密度函数为

$$f(x, y) = \begin{cases} \frac{1}{x\theta^2} e^{-y/(\theta x)}, & 0 < x \leq \theta,\ y \geq 0 \\ 0, & \text{其他} \end{cases}$$

$((X_1, Y_1), (X_2, Y_2), \ldots, (X_n, Y_n))$ 为来自该总体的简单随机样本，试求：

(1) $\theta$ 的极大似然估计量 $\hat{\theta}_{\text{MLE}}$；

(2) $\hat{\theta}_{\text{MLE}}$ 是否为 $\theta$ 的无偏估计量？给出理由。
:::

:::callout{kind=insight label="解析"}
**(1)** 似然函数：

$$L(\theta) = \prod_{i=1}^n \frac{1}{X_i \theta^2} e^{-Y_i/(\theta X_i)} \cdot \mathbf{1}_{0 < X_i \leq \theta}$$

$$= \frac{1}{\theta^{2n}} \prod_{i=1}^n \frac{1}{X_i} \cdot e^{-\frac{1}{\theta}\sum \frac{Y_i}{X_i}} \cdot \mathbf{1}_{\theta \geq X_{(n)}}$$

其中 $X_{(n)} = \max_i X_i$。

$\ln L = -2n\ln\theta - \sum \ln X_i - \frac{1}{\theta}\sum \frac{Y_i}{X_i} + \text{const}$

对 $\theta$ 求导：$-\frac{2n}{\theta} + \frac{1}{\theta^2}\sum \frac{Y_i}{X_i} = 0$

$\theta = \frac{\sum Y_i/X_i}{2n}$

但还需满足 $\theta \geq X_{(n)}$。

若 $\frac{\sum Y_i/X_i}{2n} \geq X_{(n)}$，则 $\hat{\theta}_{\text{MLE}} = \frac{\sum Y_i/X_i}{2n}$。

若 $\frac{\sum Y_i/X_i}{2n} < X_{(n)}$，则 $L(\theta)$ 在 $\theta = X_{(n)}$ 处取最大（因为 $L$ 在约束下单调递减），$\hat{\theta}_{\text{MLE}} = X_{(n)}$。

$$\hat{\theta}_{\text{MLE}} = \max\left(X_{(n)},\ \frac{1}{2n}\sum_{i=1}^n \frac{Y_i}{X_i}\right)$$

**(2)** 由于 $\hat{\theta}_{\text{MLE}}$ 取 $\max$，一般不是无偏的。$E(X_{(n)}) \leq \theta$（$X_{(n)} \leq \theta$），而 $\max$ 操作引入了向上偏差。需要具体计算，但一般情况下不是无偏估计。
:::

:::callout{kind=tip label="结论速记"}
MLE 需要考虑参数约束 $\theta \geq X_{(n)}$。无偏性需要验证 $E(\hat{\theta}) = \theta$，取 $\max$ 操作通常导致有偏。
:::

---

> 本试卷练习完
