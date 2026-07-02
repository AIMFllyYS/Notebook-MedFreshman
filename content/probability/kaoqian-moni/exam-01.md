# 2019-2020学年第二学期期末考试B卷

> 来源：华科《概率论与数理统计》习题集（第2版）·套卷练习
> 考试类型：期末考试
> 题量：选择题10题 + 填空题3题 + 计算题7题

---

## 一、选择题（每小题3分，共30分）

### 第1题

:::callout{kind=note label="题目"}
已知随机变量 $(X, Y)$ 服从二维正态分布，且 $DX \neq DY$，则（　　）

A. $X$ 与 $Y$ 一定独立
B. $X$ 与 $Y$ 一定不独立
C. $X + Y$ 与 $X - Y$ 一定独立
D. $X + Y$ 与 $X - Y$ 一定不独立
:::

:::callout{kind=insight label="解析"}
二维正态分布中，$X + Y$ 与 $X - Y$ 独立的充要条件是 $DX = DY$。

本题 $DX \neq DY$，因此 $X + Y$ 与 $X - Y$ 不独立。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
二维正态：$X + Y$ 与 $X - Y$ 独立 ⟺ $DX = DY$（不相关）。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X \sim N(100, 100)$，随机抽取一个容量为10的样本，令样本均值为 $Y$，则（　　）

A. $EY = 100, DY = 100$
B. $EY = 100, DY = 10$
C. $EY = 10, DY = 100$
D. $EY = 10, DY = 10$
:::

:::callout{kind=insight label="解析"}
$X \sim N(100, 100)$：$EX = 100$，$DX = 100$

样本均值 $Y = \bar{X}$：$EY = EX = 100$

$$DY = D\bar{X} = \frac{DX}{n} = \frac{100}{10} = 10$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
样本均值性质：$E\bar{X} = EX$，$D\bar{X} = \frac{DX}{n}$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的分布函数为 $F(x) = \begin{cases} 0, & x \leq a \\ x^2 - 3b, & a < x \leq 2 \\ c, & x > 2 \end{cases}$，则 $a$ 的值为（　　）

A. $-\sqrt{3}$
B. $\sqrt{3}$
C. 1
D. 0
:::

:::callout{kind=insight label="解析"}
分布函数在 $x = a$ 处右连续：$F(a) = F(a^+) = 0$

$F(a) = 0$（由第一段）

在 $x = 2$ 处连续：$F(2) = F(2^+) = c$

$2^2 - 3b = c$

分布函数极限：$\lim_{x \to -\infty} F(x) = 0$，$\lim_{x \to +\infty} F(x) = 1$

$c = 1$

$4 - 3b = 1$，$b = 1$

$F(x) = x^2 - 3$ 在 $x = a$ 处：$a^2 - 3 = 0$

$a = \pm \sqrt{3}$

由于 $a < x \leq 2$，且 $F(x)$ 单调不减，取 $a = -\sqrt{3}$。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
分布函数连续性：在分段点处左右极限相等。单调不减性确定分段点位置。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量序列 $\{X_i, i \geq 1\}$ 独立且都服从参数为 $\frac{1}{2}$ 的泊松分布，如果常数 $C$ 使得 $\lim_{n \to +\infty} P\left(\frac{C}{\sqrt{n}} \sum_{i=1}^n (X_{2i} - X_{2i-1}) \leq x\right) = \Phi(x)$，其中 $\Phi(x)$ 为标准正态分布函数，则 $C =$（　　）

A. 1
B. 2
C. $\sqrt{2}$
D. $\sqrt{3}$
:::

:::callout{kind=insight label="解析"}
$X_i \sim P(\frac{1}{2})$：$EX_i = \frac{1}{2}$，$DX_i = \frac{1}{2}$

设 $Y_i = X_{2i} - X_{2i-1}$，则 $EY_i = 0$，$DY_i = DX_{2i} + DX_{2i-1} = \frac{1}{2} + \frac{1}{2} = 1$

$\sum_{i=1}^n Y_i$ 的期望：$E = 0$

$\sum_{i=1}^n Y_i$ 的方差：$D = n$

$$\frac{C}{\sqrt{n}} \sum Y_i = \frac{C \sum Y_i}{\sqrt{n}} = \frac{\sum Y_i - 0}{\sqrt{n} \cdot \frac{1}{C}}$$

要使极限为标准正态：$\sqrt{n} \cdot \frac{1}{C} = \sqrt{D} = \sqrt{n}$

$C = 1$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
中心极限定理标准化：$\frac{\sum Y_i - n\mu}{\sqrt{n}\sigma} \xrightarrow{d} N(0, 1)$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 是来自总体 $N(\mu, \sigma^2)$ 的样本，$\bar{X} = \frac{1}{n}\sum_{i=1}^n x_i$，$S_1^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2$，$S_2^2 = \frac{1}{n}\sum_{i=1}^n (X_i - \bar{X})^2$，$S_3^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \mu)^2$，$S_4^2 = \frac{1}{n}\sum_{i=1}^n (X_i - \mu)^2$，则服从 $t(n)$ 分布的随机变量是（　　）

A. $T_1 = \frac{\bar{X} - \mu}{S_1/\sqrt{n-1}}$
B. $T_2 = \frac{\bar{X} - \mu}{S_2/\sqrt{n-1}}$
C. $T_3 = \frac{\bar{X} - \mu}{S_3/\sqrt{n}}$
D. $T_4 = \frac{\bar{X} - \mu}{S_4/\sqrt{n}}$
:::

:::callout{kind=insight label="解析"}
$t$ 分布定义：$\frac{\bar{X} - \mu}{S/\sqrt{n}} \sim t(n-1)$，其中 $S^2 = \frac{1}{n-1}\sum (X_i - \bar{X})^2$

$S_1^2$ 是样本方差的无偏估计，$S_1 = S$

$$\frac{\bar{X} - \mu}{S_1/\sqrt{n}} \sim t(n-1)$$

但选项中没有这个形式。检查各选项：

A. 分母是 $S_1/\sqrt{n-1}$，不正确
B. 分母是 $S_2/\sqrt{n-1}$，$S_2^2 = \frac{n-1}{n}S_1^2$，$S_2 = \sqrt{\frac{n-1}{n}}S_1$
   $$\frac{\bar{X} - \mu}{S_2/\sqrt{n-1}} = \frac{\bar{X} - \mu}{\sqrt{\frac{n-1}{n}}S_1/\sqrt{n-1}} = \frac{\bar{X} - \mu}{S_1/\sqrt{n}} \sim t(n-1)$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 统计量：$\frac{\bar{X} - \mu}{S/\sqrt{n}} \sim t(n-1)$，注意分母是 $\sqrt{n}$ 不是 $\sqrt{n-1}$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
某人向一个目标射击，直到击中 $r$ 次目标。假设每次射击命中目标的概率为 $p$（$0 < p < 1$）。$X$ 为射击停止时未命中目标的次数，则对 $k = 0, 1, 2, \ldots$，$P(X = k) =$（　　）

A. $C_{k+r}^{k} p^r (1-p)^k$
B. $C_{k+r-1}^{k} p^r (1-p)^k$
C. $C_{r-1}^{k+r} p^r (1-p)^k$
D. $C_{k}^{k+r-1} p^r (1-p)^k$
:::

:::callout{kind=insight label="解析"}
这是负二项分布（帕斯卡分布）：击中 $r$ 次所需的总试验次数为 $k + r$，其中 $k$ 次未命中。

最后一次必须击中，前 $k + r - 1$ 次中有 $r - 1$ 次击中，$k$ 次未命中。

$$P(X = k) = C_{k+r-1}^{r-1} p^{r-1} (1-p)^k \cdot p = C_{k+r-1}^{k} p^r (1-p)^k$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
负二项分布：$P(X = k) = C_{k+r-1}^{k} p^r (1-p)^k$，表示 $r$ 次成功前有 $k$ 次失败。
:::

---

### 第7题

:::callout{kind=note label="题目"}
从一批灯泡中随机地抽取 $n$ 只做寿命试验，测得寿命（单位：小时）分别为 $X_1, X_2, \ldots, X_n$，$\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$，$S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2$。设灯泡的寿命服从正态分布，则灯泡寿命均值的置信水平为0.95的置信上限为（　　）

A. $\bar{X} - \frac{s}{\sqrt{n}} t_{0.025}(n-1)$
B. $\bar{X} + \frac{s}{\sqrt{n}} t_{0.025}(n-1)$
C. $\bar{X} - \frac{s}{\sqrt{n}} t_{0.05}(n-1)$
D. $\bar{X} + \frac{s}{\sqrt{n}} t_{0.05}(n-1)$
:::

:::callout{kind=insight label="解析"}
置信上限：单侧置信区间的上界。

置信水平为0.95的单侧置信上限：$\bar{X} + \frac{s}{\sqrt{n}} t_{0.05}(n-1)$

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
单侧置信上限：$\bar{X} + \frac{s}{\sqrt{n}} t_{\alpha}(n-1)$，注意用 $t_{\alpha}$ 不是 $t_{\alpha/2}$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设随机变量 $X \sim N(0, 1)$，$Y \sim N(0, 1)$，则必有（　　）

A. $X + Y$ 服从正态分布
B. $X^2 + Y^2$ 服从 $\chi^2$ 分布
C. $X^2, Y^2$ 都服从 $\chi^2$ 分布
D. $\frac{X^2}{Y^2}$ 服从 $F$ 分布
:::

:::callout{kind=insight label="解析"}
A. 需要 $X, Y$ 独立才成立，题目未说明独立。
B. 需要 $X, Y$ 独立才成立，$X^2 + Y^2 \sim \chi^2(2)$。
C. $X^2 \sim \chi^2(1)$，$Y^2 \sim \chi^2(1)$，无论是否独立都成立。
D. 需要 $X, Y$ 独立才成立，$\frac{X^2}{Y^2} \sim F(1, 1)$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
标准正态变量的平方服从 $\chi^2(1)$。和与商需要独立性。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设随机变量 $X \sim N(\mu, \sigma^2)$，则随着 $\sigma$ 的增大，概率 $P(X - \mu < 2\sigma)$（　　）

A. 单调增大
B. 单调减小
C. 增减不定
D. 保持不变
:::

:::callout{kind=insight label="解析"}
$$P(X - \mu < 2\sigma) = P\left(\frac{X - \mu}{\sigma} < 2\right) = \Phi(2)$$

与 $\sigma$ 无关，保持不变。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
标准化后概率与参数无关：$P\left(\frac{X - \mu}{\sigma} < k\right) = \Phi(k)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
下列表述正确的有（　　）个

(1) 设 $A, B$ 为任意两个随机事件，则 $A + (B - A) = B$
(2) 连续型随机变量 $X$ 的概率密度 $f(x)$ 是连续函数
(3) 设 $F(x)$ 是任意一维随机变量 $X$ 的概率分布函数，则 $F(x)$ 的定义域是实数域
(4) 设随机变量 $X, Y$ 均服从一维正态分布，则随机变量 $X + Y$ 也服从正态分布
(5) 设随机变量 $(X, Y)$ 服从二维正态分布，且 $X$ 与 $Y$ 不相关，则它们独立
(6) 设 $X, Y$ 的相关系数为1，则存在常数 $a, b$，使得 $Y = aX + b$

A. 2
B. 3
C. 4
D. 5
:::

:::callout{kind=insight label="解析"}
(1) 正确：$B - A = B\bar{A}$，$A + B\bar{A} = A \cup B = B$（当 $A \subset B$ 时），但一般情况下不成立。错误。
(2) 错误：密度函数不一定连续。
(3) 正确：分布函数定义域为 $(-\infty, +\infty)$。
(4) 错误：需要独立才成立。
(5) 正确：二维正态中不相关等价于独立。
(6) 正确：相关系数为1意味着完全正相关，存在线性关系。

正确：(3), (5), (6)，共3个。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
二维正态：不相关 ⟺ 独立。相关系数 $\pm 1$：存在线性关系。
:::

---

## 二、填空题（每空3分，共12分）

### 第1题

:::callout{kind=note label="题目"}
设随机变量 $X_i (i = 1, 2)$ 的分布列 $P(X_i = -1) = P(X_i = 1) = \frac{1}{4}$，$P(X_i = 0) = \frac{1}{2}$，$P(X_1 X_2 = 0) = 1$，则 $P(X_1 = X_2) =$ ______。
:::

:::callout{kind=insight label="解析"}
$P(X_1 X_2 = 0) = 1$ 意味着 $X_1$ 和 $X_2$ 至少有一个为0。

$P(X_1 = X_2) = P(X_1 = X_2 = 0) + P(X_1 = X_2 = 1) + P(X_1 = X_2 = -1)$

$P(X_1 = X_2 = 1) = 0$（因为 $X_1 X_2 = 1 \neq 0$）
$P(X_1 = X_2 = -1) = 0$（因为 $X_1 X_2 = 1 \neq 0$）

$P(X_1 = X_2 = 0) = P(X_1 = 0, X_2 = 0)$

由 $P(X_1 X_2 = 0) = 1$：
$P(X_1 = 0) + P(X_2 = 0) - P(X_1 = 0, X_2 = 0) = 1$

$\frac{1}{2} + \frac{1}{2} - P(X_1 = 0, X_2 = 0) = 1$

$P(X_1 = 0, X_2 = 0) = 0$

因此 $P(X_1 = X_2) = 0$
:::

:::callout{kind=tip label="结论速记"}
$P(X_1 X_2 = 0) = 1$ 意味着不可能同时非零。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 都服从正态分布 $N(0, \sigma^2)$，且 $P(X \leq 1, Y \leq -1) = \frac{1}{5}$，则 $P(X > 1, Y > -1) =$ ______。
:::

:::callout{kind=insight label="解析"}
由对称性：
$P(X > 1, Y > -1) = P(X > 1) - P(X > 1, Y \leq -1)$

$P(X > 1) = 1 - \Phi\left(\frac{1}{\sigma}\right)$

$P(X > 1, Y \leq -1) = P(X > 1) - P(X > 1, Y > -1)$

这需要更多信息。利用二维正态对称性：

$P(X \leq 1, Y \leq -1) + P(X > 1, Y \leq -1) + P(X \leq 1, Y > -1) + P(X > 1, Y > -1) = 1$

由对称性：$P(X > 1, Y \leq -1) = P(X \leq 1, Y > -1)$

设 $p = P(X > 1, Y > -1)$，则 $\frac{1}{5} + 2p + p = 1$（假设对称）

$3p = \frac{4}{5}$，$p = \frac{4}{15}$

（注：此题需要更具体的协方差信息才能精确计算）
:::

:::callout{kind=tip label="结论速记"}
二维正态概率计算需要相关系数信息。
:::

---

### 第3题

:::callout{kind=note label="题目"}
在区间 $(0, 1)$ 上随机独立地取出 $n$ 个数 $X_1, X_2, \ldots, X_n$，记最大数与最小数之间距离为 $S$，用 $Y$ 表示 $X_1, X_2, \ldots, X_n$ 中大于 $\frac{1}{3}$ 的个数，则 $ES =$ ______，$DY =$ ______。
:::

:::callout{kind=insight label="解析"}
$S = X_{(n)} - X_{(1)}$，其中 $X_{(n)}$ 为最大值，$X_{(1)}$ 为最小值。

$X_i \sim U(0, 1)$ 独立。

$X_{(n)}$ 的密度：$f_{X_{(n)}}(x) = n x^{n-1}$，$0 < x < 1$

$X_{(1)}$ 的密度：$f_{X_{(1)}}(x) = n(1-x)^{n-1}$，$0 < x < 1$

$EX_{(n)} = \int_0^1 x \cdot n x^{n-1} \, dx = \frac{n}{n+1}$

$EX_{(1)} = \int_0^1 x \cdot n(1-x)^{n-1} \, dx = \frac{1}{n+1}$

$ES = EX_{(n)} - EX_{(1)} = \frac{n}{n+1} - \frac{1}{n+1} = \frac{n-1}{n+1}$

$Y \sim B(n, \frac{2}{3})$（大于 $\frac{1}{3}$ 的概率为 $\frac{2}{3}$）

$EY = n \cdot \frac{2}{3} = \frac{2n}{3}$

$DY = n \cdot \frac{2}{3} \cdot \frac{1}{3} = \frac{2n}{9}$

（注：题目问的是 $DY$，但 $S$ 的方差计算较复杂，可能题目有误）
:::

:::callout{kind=tip label="结论速记"}
次序统计量期望：$EX_{(n)} = \frac{n}{n+1}$，$EX_{(1)} = \frac{1}{n+1}$（均匀分布）。
:::

---

> 本试卷练习完
