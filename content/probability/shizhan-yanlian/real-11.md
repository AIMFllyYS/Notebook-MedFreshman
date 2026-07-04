# 2024-2025学年第二学期 概率论与数理统计期末考试A卷

> 来源：华中科技大学
> 考试时间：120 分钟　满分：100 分
> 题型：单项选择题 10 题（每题 3 分）+ 填空题 4 题（每题 3 分）+ 计算题 5 大题

---

## 一、单项选择题（每题 3 分，共 30 分）

### 第1题

:::callout{kind=note label="题目"}
设 $A, B$ 为互不相容的两个事件，已知 $P(A) = \dfrac{1}{9}$，事件 $A, B$ 都不发生的概率为 $\dfrac{2}{3}$，则 $P(B) = ($　　$)$。

A. $\dfrac{1}{4}$　　B. $\dfrac{1}{3}$　　C. $\dfrac{2}{9}$　　D. 无法确定
:::

:::callout{kind=insight label="解析"}
**【答案】C**

"事件 $A, B$ 都不发生"即 $\overline{A}\,\overline{B} = \overline{A \cup B}$，由对立事件公式：

$$P(A \cup B) = 1 - P(\overline{A \cup B}) = 1 - \frac{2}{3} = \frac{1}{3}$$

又 $A, B$ 互不相容，故 $P(AB) = 0$，由加法公式：

$$P(A \cup B) = P(A) + P(B) - P(AB) = \frac{1}{9} + P(B)$$

因此：

$$P(B) = \frac{1}{3} - \frac{1}{9} = \frac{2}{9}$$

- **A 错**：$\dfrac{1}{4}$ 未正确使用互不相容条件简化加法公式。
- **B 错**：$\dfrac{1}{3}$ 误将 $P(A \cup B)$ 当作 $P(B)$。
- **D 错**：由已知条件可唯一确定 $P(B)$，并非无法确定。
:::

:::callout{kind=note label="知识卡片：事件关系与概率公式"}
| 概念 | 公式/表述 | 条件 |
|------|------|------|
| 互不相容 | $AB = \varnothing$，$P(AB) = 0$ | — |
| 对立事件 | $P(\overline{A}) = 1 - P(A)$ | — |
| 都不发生 | $P(\overline{A}\,\overline{B}) = P(\overline{A \cup B}) = 1 - P(A \cup B)$ | — |
| 加法公式（互斥） | $P(A \cup B) = P(A) + P(B)$ | $AB = \varnothing$ |
| 一般加法公式 | $P(A \cup B) = P(A) + P(B) - P(AB)$ | 恒成立 |
:::

:::callout{kind=tip label="结论速记"}
互不相容时 $P(A \cup B) = P(A) + P(B)$；"都不发生" $= 1 - P(A \cup B)$，由此反解 $P(B)$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X$ 取值 $0, 2, 3$ 的概率分别为 $0.3, 0.1, 0.6$。令 $Y = 3(X-1)^2$，若 $Y$ 的分布函数为 $F_Y(y)$，则 $F_Y(7) = ($　　$)$。

A. $0.3$　　B. $0.4$　　C. $0.6$　　D. $0.7$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

先计算 $Y$ 在各 $X$ 取值处的对应值：

| $X$ | $P$ | $Y = 3(X-1)^2$ |
|-----|-----|-----------------|
| $0$ | $0.3$ | $3 \times (0-1)^2 = 3$ |
| $2$ | $0.1$ | $3 \times (2-1)^2 = 3$ |
| $3$ | $0.6$ | $3 \times (3-1)^2 = 12$ |

故 $Y$ 的取值为 $3$（概率 $0.3 + 0.1 = 0.4$）和 $12$（概率 $0.6$）。

$$F_Y(7) = P(Y \leq 7) = P(Y = 3) = 0.4$$

- **A 错**：$0.3$ 只统计了 $X = 0$ 的概率，遗漏 $X = 2$ 也对应 $Y = 3$。
- **C 错**：$0.6$ 是 $Y = 12$ 的概率，但 $12 > 7$ 不应计入。
- **D 错**：$0.7$ 误将 $P(Y = 3) + P(Y \leq 7 \text{ 的部分})$ 混淆。
:::

:::callout{kind=note label="知识卡片：离散型随机变量函数的分布"}
| 方法 | 步骤 | 适用场景 |
|------|------|----------|
| 直接映射法 | 逐个计算 $Y = g(X)$ 的值，合并相同值对应的概率 | $X$ 离散，$g$ 显式 |
| 分布函数法 | $F_Y(y) = P(g(X) \leq y) = \sum_{g(x_i) \leq y} P(X = x_i)$ | 通用 |
| 注意事项 | 多个 $X$ 值可能映射到同一 $Y$ 值，概率需合并 | — |
:::

:::callout{kind=tip label="结论速记"}
离散变量函数的分布函数：$F_Y(y) = \sum_{g(x_i) \leq y} p_i$，务必合并映射到相同 $Y$ 值的概率。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $X \sim U(0, 1)$，则 $Y = \ln X$ 的密度函数是（　　）。

A. $p_Y(y) = e^{-y} I_{(0,+\infty)}(y)$

B. $p_Y(y) = e^{-y} I_{(-\infty,0)}(y)$

C. $p_Y(y) = e^{y} I_{(0,+\infty)}(y)$

D. $p_Y(y) = e^{y} I_{(-\infty,0)}(y)$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

$X \in (0, 1)$，故 $Y = \ln X \in (-\infty, 0)$。由反函数 $x = e^y$，$y \in (-\infty, 0)$，雅可比因子：

$$\left|\frac{dx}{dy}\right| = e^y$$

$X$ 的密度为 $f_X(x) = 1$（$0 < x < 1$），由变量代换公式：

$$f_Y(y) = f_X(e^y) \cdot e^y = 1 \cdot e^y = e^y, \quad y \in (-\infty, 0)$$

即 $p_Y(y) = e^{y} I_{(-\infty,0)}(y)$。

验证：$\displaystyle\int_{-\infty}^{0} e^y \, dy = [e^y]_{-\infty}^{0} = 1 - 0 = 1$ ✓

- **A 错**：$e^{-y} I_{(0,+\infty)}$ 的支撑集方向错误，且指数符号错误。
- **B 错**：$e^{-y}$ 符号错误，应为 $e^y$。
- **C 错**：支撑集应为 $(-\infty, 0)$ 而非 $(0, +\infty)$。
:::

:::callout{kind=note label="知识卡片：连续型随机变量函数的密度"}
| 方法 | 公式 | 条件 |
|------|------|------|
| 公式法（单调） | $f_Y(y) = f_X(g^{-1}(y)) \cdot \left\lvert\dfrac{d}{dy}g^{-1}(y)\right\rvert$ | $g$ 严格单调可导 |
| 分布函数法 | $F_Y(y) = P(g(X) \leq y)$，再求导 | 通用 |
| 支撑集确定 | 由 $Y = g(X)$ 的值域确定 | — |
| 本题 | $x = e^y$，$\left\lvert\dfrac{dx}{dy}\right\rvert = e^y$ | $g(x) = \ln x$ 单调递增 |
:::

:::callout{kind=tip label="结论速记"}
$Y = \ln X$，$X \sim U(0,1)$ $\Rightarrow$ $f_Y(y) = e^y I_{(-\infty,0)}(y)$，注意支撑集由 $X \in (0,1)$ 决定 $Y < 0$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $X \sim N(0, 1)$，$Y \sim N(0, 1)$，则（　　）。

A. $X + Y \sim N(0, 2)$

B. $X - Y \sim N(0, 2)$

C. $(X, Y)$ 服从二维正态分布

D. $2X \sim N(0, 4)$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

逐一分析：

**D 正确**：对单个正态变量作线性变换，由 $X \sim N(\mu, \sigma^2)$ $\Rightarrow$ $aX + b \sim N(a\mu + b, a^2\sigma^2)$，故：

$$2X \sim N(2 \times 0, \; 2^2 \times 1) = N(0, 4)$$

**A、B 错**：$X + Y$ 和 $X - Y$ 的正态性需要 $X, Y$ 独立（或联合正态）才能保证。题目仅给出边缘分布，未说明独立性，故 $X \pm Y$ 不一定服从正态分布。

**C 错**：边缘正态不能推出联合正态。存在反例：两个标准正态边缘的随机变量，其联合分布可以不是二维正态。

- **A 错**：独立性未知，$X + Y$ 的分布不能确定。
- **B 错**：同理，独立性未知。
- **C 错**：边缘正态 $\not\Rightarrow$ 联合正态（经典反例存在）。
:::

:::callout{kind=note label="知识卡片：正态分布的性质"}
| 性质 | 表述 | 条件 |
|------|------|------|
| 线性变换 | $aX + b \sim N(a\mu + b, a^2\sigma^2)$ | $X \sim N(\mu, \sigma^2)$，单变量 |
| 独立可加 | $X + Y \sim N(\mu_X + \mu_Y, \sigma_X^2 + \sigma_Y^2)$ | $X, Y$ 独立且分别正态 |
| 联合正态 $\Rightarrow$ 边缘正态 | 成立 | — |
| 边缘正态 $\Rightarrow$ 联合正态 | **不成立** | 需独立性或其他条件 |
| 二维正态判定 | 所有线性组合 $aX + bY$ 服从正态 | 充要条件 |
:::

:::callout{kind=tip label="结论速记"}
单变量线性变换必正态；双变量和差正态需独立性；边缘正态不保证联合正态。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \cdots, X_n$ 相互独立且均服从参数为 $\lambda$ 的泊松分布，$\bar{X} = \dfrac{1}{n}\displaystyle\sum_{k=1}^{n} X_k$，$\Phi$ 为标准正态分布函数，则（　　）。

A. $X_1 - \bar{X}$ 与 $X_2 - \bar{X}$ 相互独立

B. $X_1 - \bar{X}$ 与 $X_2 - \bar{X}$ 不相关

C. 当 $n$ 充分大时，$P\{a < n\bar{X} \leq b\} \approx \Phi\!\left(\dfrac{b - n\lambda}{\sqrt{n\lambda^2}}\right) - \Phi\!\left(\dfrac{a - n\lambda}{\sqrt{n\lambda^2}}\right)$

D. 当 $n$ 充分大时，$P\{a < n\bar{X} \leq b\} \approx \Phi\!\left(\dfrac{b - n\lambda}{\sqrt{n\lambda}}\right) - \Phi\!\left(\dfrac{a - n\lambda}{\sqrt{n\lambda}}\right)$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

**关键事实**：泊松分布具有可加性，$n\bar{X} = \displaystyle\sum_{i=1}^{n} X_i \sim P(n\lambda)$，其均值和方差均为 $n\lambda$。

**D 正确**：由中心极限定理，$n\bar{X}$ 的标准化为 $\dfrac{n\bar{X} - n\lambda}{\sqrt{n\lambda}}$，故：

$$P\{a < n\bar{X} \leq b\} \approx \Phi\!\left(\frac{b - n\lambda}{\sqrt{n\lambda}}\right) - \Phi\!\left(\frac{a - n\lambda}{\sqrt{n\lambda}}\right)$$

**A 错**：$X_1 - \bar{X}$ 与 $X_2 - \bar{X}$ 都含共同的 $\bar{X}$，一般不独立。

**B 错**：计算协方差：

$$\text{Cov}(X_1 - \bar{X}, \; X_2 - \bar{X}) = -\frac{\lambda}{n} \neq 0$$

故二者相关，B 错。

**C 错**：分母用了 $\sqrt{n\lambda^2}$，应为 $\sqrt{n\lambda}$（泊松方差等于均值）。

- **A 错**：共同项 $\bar{X}$ 导致依赖。
- **B 错**：$\text{Cov} = -\lambda/n \neq 0$。
- **C 错**：标准化分母应为 $\sqrt{n\lambda}$ 而非 $\sqrt{n\lambda^2}$。
:::

:::callout{kind=note label="知识卡片：泊松分布的可加性与中心极限定理"}
| 性质 | 公式 | 说明 |
|------|------|------|
| 可加性 | $\sum_{i=1}^n X_i \sim P(n\lambda)$ | $X_i$ 独立同 $P(\lambda)$ |
| 均值/方差 | $E = \text{Var} = n\lambda$ | 泊松分布特性 |
| CLT 标准化 | $\dfrac{n\bar{X} - n\lambda}{\sqrt{n\lambda}} \xrightarrow{d} N(0,1)$ | $n \to \infty$ |
| 协方差计算 | $\text{Cov}(X_i - \bar{X}, X_j - \bar{X}) = -\dfrac{\lambda}{n}$（$i \neq j$） | 共享 $\bar{X}$ 项 |
:::

:::callout{kind=tip label="结论速记"}
$n\bar{X} = \sum X_i \sim P(n\lambda)$（均值=方差=$n\lambda$），CLT 标准化分母为 $\sqrt{n\lambda}$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设样本观察值为 $1, 5, 5, 13, 9, 10, 10, 8, 24$，则下列说法正确的是（　　）。

A. 样本中位数为 $9$

B. 样本中位数为 $10$

C. 样本容量为 $8$

D. 样本极差为 $24$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

将数据从小到大排序：

$$1, \; 5, \; 5, \; 8, \; 9, \; 10, \; 10, \; 13, \; 24$$

- **样本容量** $n = 9$（共 9 个数据），C 错。
- **中位数**：$n = 9$ 为奇数，中位数为第 $\dfrac{9+1}{2} = 5$ 个数，即 $9$，A 对、B 错。
- **极差** $= \max - \min = 24 - 1 = 23 \neq 24$，D 错。

- **B 错**：中位数是第 5 个数 $9$，不是 $10$。
- **C 错**：样本容量为 $9$ 而非 $8$。
- **D 错**：极差 $= 24 - 1 = 23$，不是 $24$。
:::

:::callout{kind=note label="知识卡片：样本数据的描述性统计量"}
| 统计量 | 定义 | 本题值 |
|------|------|--------|
| 样本容量 | 数据个数 $n$ | $9$ |
| 中位数（$n$ 奇） | 排序后第 $\dfrac{n+1}{2}$ 个数 | 第 5 个 $= 9$ |
| 中位数（$n$ 偶） | 第 $\dfrac{n}{2}$ 与 $\dfrac{n}{2}+1$ 个数的平均 | — |
| 极差 | $\max - \min$ | $24 - 1 = 23$ |
| 众数 | 出现次数最多的值 | $5$ 和 $10$（各 2 次） |
:::

:::callout{kind=tip label="结论速记"}
中位数 = 排序后第 $\lceil n/2 \rceil$ 个（$n$ 奇）或中间两个的平均（$n$ 偶）；极差 = 最大值 $-$ 最小值。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, X_3, X_4)$ 是来自正态总体 $N(1, 2^2)$ 的 i.i.d. 样本，

$$Y = \frac{\sqrt{3}(X_1 - 1)}{\sqrt{(X_2 - 1)^2 + (X_3 - 1)^2 + (X_4 - 1)^2}}$$

则 $Y$ 服从（　　）。

A. $\chi^2(3)$　　B. $F(1, 3)$　　C. $t(3)$　　D. $t(2)$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

**第一步：标准化。** 由 $X_i \sim N(1, 2^2)$，令 $Z_i = \dfrac{X_i - 1}{2} \sim N(0, 1)$，则：

$$X_1 - 1 = 2Z_1, \quad X_i - 1 = 2Z_i \;(i = 2,3,4)$$

**第二步：代入化简。**

$$Y = \frac{\sqrt{3} \cdot 2Z_1}{\sqrt{4Z_2^2 + 4Z_3^2 + 4Z_4^2}} = \frac{2\sqrt{3}\, Z_1}{2\sqrt{Z_2^2 + Z_3^2 + Z_4^2}} = \frac{\sqrt{3}\, Z_1}{\sqrt{Z_2^2 + Z_3^2 + Z_4^2}}$$

**第三步：识别分布。** 令 $W = Z_2^2 + Z_3^2 + Z_4^2 \sim \chi^2(3)$，且 $Z_1$ 与 $W$ 独立（因为 $X_i$ 相互独立），则：

$$Y = \frac{Z_1}{\sqrt{W / 3}} = \frac{Z_1}{\sqrt{\chi^2(3)/3}} \sim t(3)$$

- **A 错**：$\chi^2$ 分布取值非负，而 $Y$ 可正可负。
- **B 错**：$F$ 分布是两个独立 $\chi^2$ 之比，本题分子是 $Z_1^2 \sim \chi^2(1)$ 但 $Y$ 本身不是平方形式。
- **D 错**：自由度应为 $3$（分母有 3 个独立标准正态平方和），不是 $2$。
:::

:::callout{kind=note label="知识卡片：三大抽样分布的构造"}
| 分布 | 构造 | 自由度 | 取值范围 |
|------|------|--------|----------|
| $\chi^2(n)$ | $\sum_{i=1}^n Z_i^2$，$Z_i \sim N(0,1)$ 独立 | $n$ | $[0, +\infty)$ |
| $t(n)$ | $\dfrac{Z}{\sqrt{\chi^2(n)/n}}$，$Z \perp \chi^2(n)$ | $n$ | $(-\infty, +\infty)$ |
| $F(m,n)$ | $\dfrac{\chi^2(m)/m}{\chi^2(n)/n}$，两个 $\chi^2$ 独立 | $(m, n)$ | $(0, +\infty)$ |
| 关键关系 | $t(n)^2 \sim F(1, n)$ | — | — |
:::

:::callout{kind=tip label="结论速记"}
$\dfrac{Z}{\sqrt{\chi^2(n)/n}} \sim t(n)$（$Z \perp \chi^2$），标准化后分子分母分离即可识别 $t$ 分布。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设 $\theta$ 为总体 $X$ 的待估参数，随机区间 $(\underline{\theta}, \overline{\theta})$ 是 $\theta$ 的置信水平为 $95\%$ 的置信区间，其含义是（　　）。

A. $\theta$ 有 $95\%$ 的概率落在该区间内

B. $\theta$ 有 $5\%$ 的概率落在该区间内

C. 该随机区间有 $95\%$ 的概率包含参数 $\theta$

D. 该随机区间有 $5\%$ 的概率包含参数 $\theta$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

在频率学派框架下，参数 $\theta$ 是**固定但未知**的常量，不是随机变量。随机性在于**置信区间** $(\underline{\theta}, \overline{\theta})$ ——它由样本构造，每次抽样得到不同的区间。

"置信水平 $95\%$"的严格含义：反复抽样多次，其中约 $95\%$ 的随机区间会覆盖真值 $\theta$：

$$P(\underline{\theta} < \theta < \overline{\theta}) = 0.95$$

这里的概率是针对**随机区间覆盖固定参数**而言的。

- **A 错**：$\theta$ 不是随机变量，不能说"$\theta$ 有 $95\%$ 概率落在区间内"——这是贝叶斯学派的解读，频率学派中 $\theta$ 是常量。
- **B 错**：方向完全反了，且表述不严谨。
- **D 错**：$5\%$ 是**不覆盖**的概率（显著性水平），而非覆盖概率。
:::

:::callout{kind=note label="知识卡片：置信区间的频率学派解释"}
| 学派 | 对 $\theta$ 的看法 | 置信水平含义 |
|------|------|------|
| 频率学派 | $\theta$ 是固定常量 | 随机区间以该概率覆盖 $\theta$ |
| 贝叶斯学派 | $\theta$ 有先验/后验分布 | $\theta$ 落入区间的后验概率 |
| 关键区分 | 概率主体是**区间**（频率）还是**参数**（贝叶斯） | — |
| 显著性水平 $\alpha$ | $P(\text{不覆盖}) = \alpha$ | $\alpha = 1 - 0.95 = 0.05$ |
:::

:::callout{kind=tip label="结论速记"}
频率学派：$\theta$ 固定，区间随机 $\Rightarrow$ "$95\%$ 的随机区间覆盖 $\theta$"，而非"$\theta$ 有 $95\%$ 概率落入"。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $X_1, X_2$ 是来自两点分布 $B(1, p)$ 的 i.i.d. 样本，$X_1^*, X_2^*$ 为其顺序统计量，下列结论**错误**的是（　　）。

A. $X_1^*, X_2^*$ 均服从两点分布

B. $X_1^*, X_2^*$ 不相互独立

C. $X_1^* \sim B(1, p^2)$

D. $X_2^* \sim B(1, 1 - p^2)$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

$X_1^* = \min(X_1, X_2)$，$X_2^* = \max(X_1, X_2)$，二者只取 $0$ 或 $1$。

**C 正确**：$X_1^* = \min(X_1, X_2) = 1$ 当且仅当 $X_1 = 1$ 且 $X_2 = 1$：

$$P(X_1^* = 1) = P(X_1 = 1, X_2 = 1) = p^2$$

故 $X_1^* \sim B(1, p^2)$。

**D 错误**：$X_2^* = \max(X_1, X_2) = 0$ 当且仅当 $X_1 = 0$ 且 $X_2 = 0$：

$$P(X_2^* = 0) = (1-p)^2$$

$$P(X_2^* = 1) = 1 - (1-p)^2 = 2p - p^2$$

而 $1 - p^2 \neq 2p - p^2$（除非 $p = 0$ 或 $p = 1$），故 $X_2^* \not\sim B(1, 1-p^2)$。

**A 正确**：$X_1^*, X_2^*$ 都只取 $0, 1$，均为两点分布。

**B 正确**：$X_1^* \leq X_2^*$ 恒成立，存在约束关系，不独立。

- **A 正确**（非错误项）：均取 $0/1$。
- **B 正确**（非错误项）：$X_1^* \leq X_2^*$ 限制独立性。
- **C 正确**（非错误项）：$P(\min = 1) = p^2$。
:::

:::callout{kind=note label="知识卡片：两点分布样本的顺序统计量"}
| 顺序统计量 | 定义 | $P(=1)$ | 分布 |
|------|------|---------|------|
| $X_1^* = \min$ | 最小值 | $p^2$ | $B(1, p^2)$ |
| $X_2^* = \max$ | 最大值 | $1 - (1-p)^2 = 2p - p^2$ | $B(1, 2p - p^2)$ |
| 关系 | $X_1^* \leq X_2^*$ | — | 不独立 |
| 联合分布 | $P(0,0) = (1-p)^2$，$P(0,1) = 2p(1-p)$，$P(1,1) = p^2$ | — | — |
:::

:::callout{kind=tip label="结论速记"}
$\min$ 的 $P(=1) = p^2$（全为 1）；$\max$ 的 $P(=1) = 1-(1-p)^2 = 2p-p^2$（至少一个 1），注意区别 $1-p^2$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $\hat{\theta}_0, \hat{\theta}_1$ 都是未知参数 $\theta$ 的相互独立的无偏估计量，且 $D(\hat{\theta}_0) = \sigma_0^2$，$D(\hat{\theta}_1) = \sigma_1^2$。令 $\hat{\theta}_\alpha = \alpha\hat{\theta}_1 + (1-\alpha)\hat{\theta}_0$，$0 \leq \alpha \leq 1$，则最有效估计量对应的 $\alpha = ($　　$)$。

A. $\dfrac{\sigma_1^2}{\sigma_0^2 + \sigma_1^2}$　　B. $\dfrac{\sigma_0^2}{\sigma_0^2 + \sigma_1^2}$　　C. $\dfrac{\sigma_1}{\sigma_0 + \sigma_1}$　　D. $\dfrac{\sigma_0}{\sigma_0 + \sigma_1}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

**无偏性验证**：因 $\hat{\theta}_0, \hat{\theta}_1$ 无偏且独立：

$$E(\hat{\theta}_\alpha) = \alpha E(\hat{\theta}_1) + (1-\alpha) E(\hat{\theta}_0) = \alpha\theta + (1-\alpha)\theta = \theta$$

**方差计算**：由独立性，$\text{Cov}(\hat{\theta}_0, \hat{\theta}_1) = 0$：

$$D(\hat{\theta}_\alpha) = \alpha^2 \sigma_1^2 + (1-\alpha)^2 \sigma_0^2$$

**最小化**：对 $\alpha$ 求导并令其为零：

$$\frac{d}{d\alpha} D(\hat{\theta}_\alpha) = 2\alpha\sigma_1^2 - 2(1-\alpha)\sigma_0^2 = 0$$

$$\alpha\sigma_1^2 = (1-\alpha)\sigma_0^2 \implies \alpha(\sigma_0^2 + \sigma_1^2) = \sigma_0^2$$

$$\boxed{\alpha = \frac{\sigma_0^2}{\sigma_0^2 + \sigma_1^2}}$$

直观理解：$\hat{\theta}_0$ 方差越大（越不精确），权重应越小，$\alpha$ 越大（偏向 $\hat{\theta}_1$）。

- **A 错**：分子分母颠倒了，$\alpha$ 应与 $\sigma_0^2$ 成正比（方差大的权重小）。
- **C 错**：用标准差而非方差，维度不对。
- **D 错**：同上，用标准差而非方差。
:::

:::callout{kind=note label="知识卡片：无偏估计的最优线性组合"}
| 项目 | 公式 |
|------|------|
| 组合形式 | $\hat{\theta}_\alpha = \alpha\hat{\theta}_1 + (1-\alpha)\hat{\theta}_0$ |
| 无偏性 | $E(\hat{\theta}_\alpha) = \theta$（只要 $\hat{\theta}_0, \hat{\theta}_1$ 无偏） |
| 方差（独立） | $D = \alpha^2\sigma_1^2 + (1-\alpha)^2\sigma_0^2$ |
| 最优 $\alpha$ | $\alpha^* = \dfrac{\sigma_0^2}{\sigma_0^2 + \sigma_1^2} = \dfrac{1/\sigma_1^2}{1/\sigma_0^2 + 1/\sigma_1^2}$ |
| 最小方差 | $D_{\min} = \dfrac{\sigma_0^2 \sigma_1^2}{\sigma_0^2 + \sigma_1^2}$（调和均值之半） |
| 一般规律 | 权重 $\propto$ 精度（$1/\sigma^2$），即方差越小权重越大 |
:::

:::callout{kind=tip label="结论速记"}
最优权重 $\alpha = \dfrac{\sigma_0^2}{\sigma_0^2 + \sigma_1^2}$——权重与**自身**对应的另一个估计量的方差成正比（对方方差大则己方权重大）。
:::

---

## 二、填空题（每题 3 分，共 12 分）

### 第11题

:::callout{kind=note label="题目"}
设在平面的两条平行直线上分别标有 $5$ 个点和 $4$ 个点，从中任选 $3$ 个点，则所选三点能构成三角形的概率为______。
:::

:::callout{kind=insight label="解析"}
**【答案】** $\dfrac{5}{6}$

**总选法**（从 $5 + 4 = 9$ 个点中任选 3 个）：

$$\binom{9}{3} = \frac{9 \times 8 \times 7}{3 \times 2 \times 1} = 84$$

**不能构成三角形**（三点共线）：三点全在第一条直线或全在第二条直线上。

$$\text{共线选法} = \binom{5}{3} + \binom{4}{3} = 10 + 4 = 14$$

（跨两条直线选取的点必不共线，因为两条直线平行不重合。）

**能构成三角形的概率**：

$$P = \frac{84 - 14}{84} = \frac{70}{84} = \frac{5}{6}$$
:::

:::callout{kind=note label="知识卡片：组合计数与几何概率"}
| 模型 | 公式 | 本题 |
|------|------|------|
| 总选法 | $\dbinom{n}{k}$ | $\dbinom{9}{3} = 84$ |
| 对立事件 | $P(\text{构成}) = 1 - P(\text{不构成})$ | $1 - \dfrac{14}{84}$ |
| 共线计数 | 分别在各直线上取 3 点 | $\dbinom{5}{3} + \dbinom{4}{3} = 14$ |
| 关键约束 | 平行直线上跨线选取必不共线 | 三点分布在两条线上即可构成三角形 |
:::

:::callout{kind=tip label="结论速记"}
构成三角形 $\Leftrightarrow$ 三点不共线 $\Rightarrow$ 总选法减去各直线上的共线选法：$\dfrac{\binom{9}{3} - \binom{5}{3} - \binom{4}{3}}{\binom{9}{3}} = \dfrac{5}{6}$。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设 $X \sim E(\mu)$，$Y \sim E(\lambda)$ 且相互独立，则 $P\{X > Y\} = $ ______。
:::

:::callout{kind=insight label="解析"}
**【答案】** $\dfrac{\lambda}{\lambda + \mu}$

按 $E(\lambda)$ 表示率参数为 $\lambda$ 的指数分布，密度函数 $f_Y(y) = \lambda e^{-\lambda y}$（$y > 0$），生存函数 $P(X > y) = e^{-\mu y}$。

由全概率公式（对 $Y$ 取条件）：

$$P(X > Y) = \int_0^{+\infty} P(X > y) \cdot f_Y(y) \, dy = \int_0^{+\infty} e^{-\mu y} \cdot \lambda e^{-\lambda y} \, dy$$

$$= \lambda \int_0^{+\infty} e^{-(\mu + \lambda) y} \, dy = \lambda \cdot \left[\frac{-e^{-(\mu+\lambda)y}}{\mu + \lambda}\right]_0^{+\infty} = \lambda \cdot \frac{1}{\mu + \lambda} = \frac{\lambda}{\lambda + \mu}$$
:::

:::callout{kind=note label="知识卡片：指数分布的竞争概率"}
| 场景 | 公式 | 条件 |
|------|------|------|
| $P(X > Y)$ | $\dfrac{\lambda_Y}{\lambda_X + \lambda_Y}$ | $X \sim E(\lambda_X)$，$Y \sim E(\lambda_Y)$ 独立 |
| $P(Y > X)$ | $\dfrac{\lambda_X}{\lambda_X + \lambda_Y}$ | 同上 |
| 对称性 | $P(X>Y) + P(Y>X) = 1$ | 连续型无相等概率 |
| 密度/生存 | $f_Y(y) = \lambda e^{-\lambda y}$，$P(X>y) = e^{-\mu y}$ | 率参数形式 |
| 记忆 | 率参数大 $\Rightarrow$ 先发生的概率大 | $\propto \lambda$ |
:::

:::callout{kind=tip label="结论速记"}
独立指数变量竞争：$P(X > Y) = \dfrac{\lambda_Y}{\lambda_X + \lambda_Y}$——"谁的率参数大谁先到"。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 服从单位圆 $\{(x, y) : x^2 + y^2 = 1\}$ 上的均匀分布，则 $P\!\left\{Y > \dfrac{1}{2} \;\Big|\; X = 1\right\} = $ ______。
:::

:::callout{kind=insight label="解析"}
**【答案】** $0$

**关键观察**：$(X, Y)$ 服从**单位圆周**（$x^2 + y^2 = 1$，注意是等号不是不等号）上的均匀分布。

在圆周 $x^2 + y^2 = 1$ 上，$X = 1$ 当且仅当 $1 + y^2 = 1$，即 $y = 0$。因此条件 $X = 1$ 对应唯一确定的点 $(1, 0)$，此时 $Y = 0$ 必然成立。

$$P\!\left(Y > \frac{1}{2} \;\Big|\; X = 1\right) = P(Y > 1/2 \mid Y = 0) = 0$$

**注意**：此题考察的是单位圆**周**（曲线）而非单位圆**盘**（区域）。若为单位圆盘上的均匀分布，$X = 1$ 同样退化为点 $(1, 0)$（因为圆盘边界 $x = 1$ 处 $y$ 只能为 $0$），结论一致。
:::

:::callout{kind=note label="知识卡片：条件分布与退化条件"}
| 概念 | 表述 |
|------|------|
| 单位圆周 | $x^2 + y^2 = 1$（曲线，一维流形） |
| 单位圆盘 | $x^2 + y^2 \leq 1$（区域，二维） |
| 退化条件 | 条件 $X = x_0$ 使 $Y$ 取唯一值 $\Rightarrow$ 条件分布退化 |
| 本题关键 | $X = 1 \Rightarrow y^2 = 0 \Rightarrow Y = 0$ |
| 条件概率 | 退化条件下 $P(Y > c \mid X = 1) = 0$（若 $c \geq 0$） |
:::

:::callout{kind=tip label="结论速记"}
单位圆周上 $X = 1$ 仅对应 $(1, 0)$，$Y = 0$ 退化 $\Rightarrow$ $P(Y > 1/2 \mid X = 1) = 0$。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设 $X$ 是来自指数分布 $E(\lambda)$ 的单个样本，若取 $[X, 2X]$ 为参数函数 $\dfrac{1}{\lambda}$ 的置信区间，则该区间的置信水平是______。
:::

:::callout{kind=insight label="解析"}
**【答案】** $e^{-1/2} - e^{-1}$

参数函数 $\dfrac{1}{\lambda}$ 的置信区间 $[X, 2X]$ 包含 $\dfrac{1}{\lambda}$ 当且仅当：

$$X \leq \frac{1}{\lambda} \leq 2X \quad \Longleftrightarrow \quad \frac{1}{2\lambda} \leq X \leq \frac{1}{\lambda}$$

由 $X \sim E(\lambda)$，密度 $f(x) = \lambda e^{-\lambda x}$（$x > 0$），分布函数 $F(x) = 1 - e^{-\lambda x}$：

$$P\!\left(\frac{1}{2\lambda} \leq X \leq \frac{1}{\lambda}\right) = F\!\left(\frac{1}{\lambda}\right) - F\!\left(\frac{1}{2\lambda}\right)$$

$$= \left(1 - e^{-\lambda \cdot \frac{1}{\lambda}}\right) - \left(1 - e^{-\lambda \cdot \frac{1}{2\lambda}}\right) = (1 - e^{-1}) - (1 - e^{-1/2})$$

$$= e^{-1/2} - e^{-1} \approx 0.6065 - 0.3679 = 0.2386$$
:::

:::callout{kind=note label="知识卡片：枢轴量法构造置信区间"}
| 步骤 | 内容 | 本题 |
|------|------|------|
| 确定枢轴量 | 含参数且分布已知的统计量 | $\lambda X \sim E(1)$（即 $E(\lambda)$ 的尺度变换） |
| 构造区间 | 使枢轴量落入某区间的概率为 $1-\alpha$ | $X \leq 1/\lambda \leq 2X$ |
| 等价转化 | 转化为 $X$ 的取值范围 | $\frac{1}{2\lambda} \leq X \leq \frac{1}{\lambda}$ |
| 计算概率 | 用 $X$ 的分布函数求差 | $F(1/\lambda) - F(1/(2\lambda))$ |
| 指数分布 $F(x)$ | $1 - e^{-\lambda x}$，$x > 0$ | — |
:::

:::callout{kind=tip label="结论速记"}
$[X, 2X]$ 包含 $1/\lambda$ $\Leftrightarrow$ $\frac{1}{2\lambda} \leq X \leq \frac{1}{\lambda}$ $\Rightarrow$ 置信水平 $= e^{-1/2} - e^{-1}$。
:::

---

## 三、（12 分）

### 第15题

:::callout{kind=note label="题目"}
设 $X$ 与 $Y$ 相互独立且同服从几何分布，分布列为

$$P\{X = k\} = (1-p)^{k-1} p, \quad k = 1, 2, \cdots.$$

1. 求 $Z = \max\{X, Y\}$ 的分布列；
2. 求二维随机向量 $(X, Z)$ 的联合分布列。
:::

:::callout{kind=insight label="解析"}
**【解】**

记 $q = 1 - p$，则 $P(X = k) = q^{k-1} p$，分布函数 $F_X(k) = P(X \leq k) = 1 - q^k$。

**第 1 问：$Z = \max\{X, Y\}$ 的分布列**

由 $X, Y$ 独立：

$$P(Z \leq k) = P(X \leq k, Y \leq k) = P(X \leq k) \cdot P(Y \leq k) = (1 - q^k)^2$$

故对 $k = 1, 2, \cdots$：

$$P(Z = k) = P(Z \leq k) - P(Z \leq k-1) = (1 - q^k)^2 - (1 - q^{k-1})^2$$

展开化简：

$$P(Z = k) = 2q^{k-1}(1-q) - q^{2k-2}(1-q^2) = p q^{k-1}(2 - q^{k-1} - q^k) \cdot \frac{1}{1}$$

或保留差分形式：

$$\boxed{P(Z = k) = (1 - q^k)^2 - (1 - q^{k-1})^2, \quad k = 1, 2, \cdots}$$

**第 2 问：$(X, Z)$ 的联合分布列**

对 $k, z = 1, 2, \cdots$，分三种情况讨论：

**情况一：$z < k$**

$Z = \max(X, Y) \geq X = k > z$，不可能，故：

$$P(X = k, Z = z) = 0$$

**情况二：$z = k$**

$Z = k$ 且 $X = k$，要求 $Y \leq k$：

$$P(X = k, Z = k) = P(X = k) \cdot P(Y \leq k) = p q^{k-1} (1 - q^k)$$

**情况三：$z > k$**

$Z = z > k = X$，要求 $Y = z$（因为 $\max(X, Y) = z$ 且 $X = k < z$ 则 $Y$ 必须等于 $z$）：

$$P(X = k, Z = z) = P(X = k) \cdot P(Y = z) = p q^{k-1} \cdot p q^{z-1} = p^2 q^{k+z-2}$$

综合：

$$\boxed{P(X = k, Z = z) = \begin{cases} 0, & z < k \\ p\, q^{k-1}(1 - q^k), & z = k \\ p^2\, q^{k+z-2}, & z > k \end{cases}}$$

**验证**：对固定 $k$，对 $z$ 求和：

$$\sum_{z=1}^{\infty} P(X=k, Z=z) = p q^{k-1}(1-q^k) + \sum_{z=k+1}^{\infty} p^2 q^{k+z-2}$$

$$= p q^{k-1}(1-q^k) + p^2 q^{k-1} \cdot \frac{q^k}{1-q} = p q^{k-1}(1-q^k) + p q^{k-1} \cdot q^k = p q^{k-1}$$

与 $P(X = k) = p q^{k-1}$ 一致 ✓
:::

:::callout{kind=note label="知识卡片：离散型最大值分布与联合分布"}
| 模型 | 公式 | 条件 |
|------|------|------|
| $\max$ 的 CDF | $P(\max \leq k) = \prod_i F_i(k)$ | 独立 |
| $\max$ 的 PMF | $P(\max = k) = P(\max \leq k) - P(\max \leq k-1)$ | 差分 |
| 几何分布 CDF | $F(k) = 1 - q^k$，$q = 1-p$ | $k = 1, 2, \cdots$ |
| 联合分布拆分 | 按 $z$ 与 $k$ 的大小关系分 $z < k$、$z = k$、$z > k$ 三段 | — |
| $z > k$ 时 | $\max = z$ 且 $X = k < z \Rightarrow Y = z$（唯一确定） | — |
:::

:::callout{kind=tip label="结论速记"}
$\max$ 的分布用 CDF 平方（独立时）；联合分布按 $z$ 与 $k$ 的大小关系分三段：$z<k$ 为 $0$，$z=k$ 用 $P(Y \leq k)$，$z>k$ 用 $P(Y=z)$。
:::

---

## 四、（10 分）

### 第16题

:::callout{kind=note label="题目"}
在区间 $(0, 1)$ 内任取一点 $X$，再从区间 $(0, X)$ 内任取一点 $Y$，求：

1. $Y$ 的密度函数；
2. $P\{X + Y > 1\}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

由题意：$X \sim U(0, 1)$，条件分布 $Y \mid X = x \sim U(0, x)$。

条件密度：

$$f_{Y|X}(y \mid x) = \frac{1}{x}, \quad 0 < y < x < 1$$

$X$ 的密度 $f_X(x) = 1$（$0 < x < 1$）。

**第 1 问：$Y$ 的密度函数**

由全概率公式（边际密度 = 条件密度对 $X$ 积分）：

$$f_Y(y) = \int_{-\infty}^{+\infty} f_{Y|X}(y \mid x) \cdot f_X(x) \, dx$$

需要 $0 < y < x < 1$，即 $x \in (y, 1)$：

$$f_Y(y) = \int_y^1 \frac{1}{x} \cdot 1 \, dx = \big[\ln x\big]_y^1 = 0 - \ln y = -\ln y$$

$$\boxed{f_Y(y) = -\ln y, \quad 0 < y < 1}$$

其它处 $f_Y(y) = 0$。

**第 2 问：$P\{X + Y > 1\}$**

条件于 $X = x$：

- 若 $x \leq \dfrac{1}{2}$：$Y \in (0, x)$，故 $X + Y < x + x \leq 1$，不可能 $> 1$，贡献为 $0$。
- 若 $x > \dfrac{1}{2}$：需要 $Y > 1 - x$，又 $Y \mid X = x \sim U(0, x)$：

$$P(Y > 1 - x \mid X = x) = \frac{x - (1-x)}{x} = \frac{2x - 1}{x} = 2 - \frac{1}{x}$$

对 $X$ 积分：

$$P(X + Y > 1) = \int_{1/2}^1 \left(2 - \frac{1}{x}\right) dx = \big[2x - \ln x\big]_{1/2}^1$$

$$= (2 - 0) - \left(1 - \ln\frac{1}{2}\right) = 2 - 1 + \ln\frac{1}{2} = 1 - \ln 2$$

$$\boxed{P\{X + Y > 1\} = 1 - \ln 2}$$
:::

:::callout{kind=note label="知识卡片：条件密度与全概率公式"}
| 方法 | 公式 | 适用 |
|------|------|------|
| 边际密度 | $f_Y(y) = \displaystyle\int f_{Y\|X}(y\|x) f_X(x) \, dx$ | 已知条件密度 |
| 条件概率 | $P(Y \in A \mid X = x) = \displaystyle\int_A f_{Y\|X}(y\|x) \, dy$ | 计算 $P(X+Y>1)$ 等 |
| 全概率 | $P(X+Y>1) = \displaystyle\int P(X+Y>1 \mid X=x) f_X(x) \, dx$ | 分段讨论 |
| 积分限确定 | $0 < y < x < 1$ $\Rightarrow$ $x \in (y, 1)$ | 画区域图辅助 |
| 均匀条件 | $Y \mid X=x \sim U(0,x)$ $\Rightarrow$ $P(Y > c \mid X=x) = \dfrac{x-c}{x}$ | $0 < c < x$ |
:::

:::callout{kind=tip label="结论速记"}
$f_Y(y) = \displaystyle\int_y^1 \frac{1}{x} dx = -\ln y$；$P(X+Y>1)$ 按 $X$ 分段：$x \leq 1/2$ 贡献 $0$，$x > 1/2$ 贡献 $2 - 1/x$，积分得 $1 - \ln 2$。
:::

---

## 五、（12 分）

### 第17题

:::callout{kind=note label="题目"}
设 $\varphi(x)$, $\Phi(x)$ 分别表示标准正态分布的密度函数与分布函数。对实数 $\lambda$，令

$$p_\lambda(x) = 2\varphi(x)\Phi(\lambda x), \quad x \in \mathbb{R}.$$

1. 证明对任意实数 $\lambda$，$p_\lambda(x)$ 都是一个概率密度函数；
2. 设 $X \sim p_1(x)$，$Y \sim B(1, p)$，且 $X, Y$ 相互独立，求 $Z = XY$ 的概率分布。
:::

:::callout{kind=insight label="解析"}
**【解】**

**第 1 问：证明 $p_\lambda(x)$ 是密度函数**

需要验证：(i) $p_\lambda(x) \geq 0$；(ii) $\displaystyle\int_{-\infty}^{+\infty} p_\lambda(x) \, dx = 1$。

**(i) 非负性**：$\varphi(x) > 0$ 对所有 $x$ 成立，$\Phi(\lambda x) \geq 0$（分布函数值非负），故 $p_\lambda(x) = 2\varphi(x)\Phi(\lambda x) \geq 0$。

**(ii) 积分为 1**：利用标准正态密度的对称性 $\varphi(x) = \varphi(-x)$ 和分布函数的互补关系 $\Phi(t) + \Phi(-t) = 1$。

记 $I = \displaystyle\int_{-\infty}^{+\infty} \varphi(x) \Phi(\lambda x) \, dx$。作变量代换 $x \to -x$：

$$I = \int_{-\infty}^{+\infty} \varphi(-x) \Phi(-\lambda x) \, dx = \int_{-\infty}^{+\infty} \varphi(x) \Phi(-\lambda x) \, dx$$

将两个表达式相加：

$$2I = \int_{-\infty}^{+\infty} \varphi(x) \big[\Phi(\lambda x) + \Phi(-\lambda x)\big] \, dx = \int_{-\infty}^{+\infty} \varphi(x) \cdot 1 \, dx = 1$$

因此 $I = \dfrac{1}{2}$，于是：

$$\int_{-\infty}^{+\infty} p_\lambda(x) \, dx = 2I = 2 \times \frac{1}{2} = 1 \quad \checkmark$$

故 $p_\lambda(x)$ 是概率密度函数。

**第 2 问：$Z = XY$ 的分布**

$Y \sim B(1, p)$，取值 $0$（概率 $1-p$）或 $1$（概率 $p$），$X \sim p_1(x) = 2\varphi(x)\Phi(x)$，且 $X \perp Y$。

**当 $Y = 0$（概率 $1-p$）**：$Z = X \cdot 0 = 0$，在 $z = 0$ 处产生原子质量 $1 - p$。

**当 $Y = 1$（概率 $p$）**：$Z = X \cdot 1 = X$，连续部分密度为 $p \cdot p_1(z) = 2p\,\varphi(z)\Phi(z)$。

因此 $Z$ 是**混合型随机变量**：

$$\boxed{Z \text{ 的分布：在 } z = 0 \text{ 处有原子质量 } 1 - p \text{；连续部分密度 } f_Z(z) = 2p\,\varphi(z)\Phi(z), \; z \in \mathbb{R}}$$

**验证**：总概率 $= (1-p) + \displaystyle\int_{-\infty}^{+\infty} 2p\,\varphi(z)\Phi(z) \, dz = (1-p) + p \times 1 = 1$ ✓

（这里用了第 1 问 $\lambda = 1$ 的结论：$\displaystyle\int 2\varphi(z)\Phi(z) \, dz = 1$。）
:::

:::callout{kind=note label="知识卡片：偏正态分布与零膨胀混合分布"}
| 概念 | 内容 |
|------|------|
| 偏正态分布 | $p_\lambda(x) = 2\varphi(x)\Phi(\lambda x)$，$\lambda$ 控制偏度 |
| 对称性 | $\varphi(x) = \varphi(-x)$，$\Phi(t) + \Phi(-t) = 1$ |
| 积分技巧 | 利用 $x \to -x$ 代换后两式相加，利用互补恒等式 |
| $\lambda = 0$ | $p_0(x) = 2\varphi(x) \cdot \frac{1}{2} = \varphi(x)$（标准正态） |
| 混合分布 | 离散（原子）+ 连续（密度）的组合 |
| 零膨胀 | $Z = XY$，$Y \sim B(1,p)$ 时 $z=0$ 处有质量 $1-p$ |
:::

:::callout{kind=tip label="结论速记"}
证明密度用 $\varphi$ 对称性 + $\Phi$ 互补恒等式；$Z = XY$（$Y$ 为 0/1）产生零膨胀混合分布：原子 $1-p$ + 连续 $2p\varphi\Phi$。
:::

---

## 六、（10 分）

### 第18题

:::callout{kind=note label="题目"}
设有一枚质地均匀的正方体骰子，六个面分别刻有 $1, 2, 3, 4, 5, 6$ 点，将骰子独立投掷 $n$ 次。求 $1$ 点出现次数 $X$ 和 $6$ 点出现次数 $Y$ 的相关系数 $\rho_{XY}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

每次投掷是多项分布的一次试验，$6$ 个结果概率均为 $\dfrac{1}{6}$。记 $p_1 = \dfrac{1}{6}$（出 $1$ 点），$p_6 = \dfrac{1}{6}$（出 $6$ 点）。

$n$ 次独立投掷中，$(X, Y)$ 服从多项分布 $M(n; p_1, \ldots, p_6)$ 的边缘。

**第一步：方差**

$$D(X) = n \cdot p_1 \cdot (1 - p_1) = n \cdot \frac{1}{6} \cdot \frac{5}{6} = \frac{5n}{36}$$

$$D(Y) = n \cdot p_6 \cdot (1 - p_6) = n \cdot \frac{1}{6} \cdot \frac{5}{6} = \frac{5n}{36}$$

**第二步：协方差**

多项分布中不同类别的计数具有负协方差（一次投掷出 $1$ 点就不出 $6$ 点，互相排斥）：

$$\text{Cov}(X, Y) = -n \cdot p_1 \cdot p_6 = -n \cdot \frac{1}{6} \cdot \frac{1}{6} = -\frac{n}{36}$$

**第三步：相关系数**

$$\rho_{XY} = \frac{\text{Cov}(X, Y)}{\sqrt{D(X) \cdot D(Y)}} = \frac{-n/36}{\sqrt{\dfrac{5n}{36} \cdot \dfrac{5n}{36}}} = \frac{-n/36}{5n/36} = -\frac{1}{5}$$

$$\boxed{\rho_{XY} = -\frac{1}{5}}$$

**直观理解**：$X$ 和 $Y$ 负相关——出 $1$ 点多了，出 $6$ 点的机会就少了。但负相关性不强（$-1/5$），因为每次还有 $4/6$ 的概率出其他点，不会强烈抑制。
:::

:::callout{kind=note label="知识卡片：多项分布的协方差结构"}
| 性质 | 公式 | 说明 |
|------|------|------|
| 单项方差 | $D(X_i) = n p_i (1 - p_i)$ | 二项分布方差 |
| 协方差（不同类） | $\text{Cov}(X_i, X_j) = -n p_i p_j$ | $i \neq j$，负相关 |
| 相关系数 | $\rho_{ij} = \dfrac{-n p_i p_j}{\sqrt{n p_i(1-p_i) \cdot n p_j(1-p_j)}}$ | — |
| 本题化简 | $\rho = \dfrac{-p_1 p_6}{\sqrt{p_1(1-p_1) \cdot p_6(1-p_6)}}$ | $n$ 消去 |
| 等概率时 | $p_i = p_j = \frac{1}{m}$ $\Rightarrow$ $\rho = \dfrac{-1}{m-1}$ | $m=6$ 时 $\rho = -\frac{1}{5}$ |
:::

:::callout{kind=tip label="结论速记"}
骰子 $n$ 次投掷，两类计数协方差 $= -np_1 p_6$，方差 $= np_i(1-p_i)$，等概率时 $\rho = \dfrac{-1}{m-1} = -\dfrac{1}{5}$（$m=6$ 面）。
:::

---

## 七、（14 分）

### 第19题

:::callout{kind=note label="题目"}
设总体 $X \sim B(m, p)$，$p$ 未知，$X_1, X_2, \cdots, X_n$ 是来自总体 $X$ 的 i.i.d. 样本。

1. 求参数函数 $p^2$ 的极大似然估计量 $\hat{p}^2_{MLE}$；
2. $\hat{p}^2_{MLE}$ 是否为 $p^2$ 的无偏估计量？为什么？
3. 构造 $p^2$ 的一个无偏估计量，并验证之。
:::

:::callout{kind=insight label="解析"}
**【解】**

记 $T = \displaystyle\sum_{i=1}^n X_i$。由 $X_i \sim B(m, p)$ 独立，泊松/二项可加性：

$$T \sim B(nm, p)$$

记 $N = nm$（总试验次数），则 $T \sim B(N, p)$。

**第 1 问：$p^2$ 的极大似然估计**

似然函数（关于 $T \sim B(N, p)$）：

$$L(p) = \binom{N}{T} p^T (1-p)^{N-T}$$

对数似数取导令零：

$$\frac{d}{dp} \ln L = \frac{T}{p} - \frac{N-T}{1-p} = 0 \implies \hat{p} = \frac{T}{N} = \frac{\sum_{i=1}^n X_i}{nm} = \frac{\bar{X}}{m}$$

由 MLE 的**不变性**（若 $\hat{p}$ 是 $p$ 的 MLE，则 $g(\hat{p})$ 是 $g(p)$ 的 MLE）：

$$\boxed{\hat{p}^2_{MLE} = \hat{p}^2 = \left(\frac{T}{nm}\right)^2 = \left(\frac{\bar{X}}{m}\right)^2}$$

**第 2 问：无偏性检验**

$$E(\hat{p}^2) = E\!\left(\frac{T}{N}\right)^2 = D\!\left(\frac{T}{N}\right) + \left[E\!\left(\frac{T}{N}\right)\right]^2 = \frac{p(1-p)}{N} + p^2$$

其中 $T \sim B(N, p)$，$D(T/N) = \dfrac{Np(1-p)}{N^2} = \dfrac{p(1-p)}{N}$。

$$E(\hat{p}^2) = p^2 + \frac{p(1-p)}{N} \neq p^2 \quad (\text{当 } 0 < p < 1 \text{ 且 } N \geq 1)$$

故 $\hat{p}^2_{MLE}$ **不是** $p^2$ 的无偏估计量，存在正偏差 $\dfrac{p(1-p)}{N}$。

**第 3 问：构造无偏估计量**

利用二阶阶乘矩的无偏性。对 $T \sim B(N, p)$：

$$E\big[T(T-1)\big] = N(N-1) p^2$$

（因为 $E[T(T-1)] = E[T^2] - E[T] = \big[D(T) + (ET)^2\big] - ET = Np(1-p) + N^2p^2 - Np = N(N-1)p^2$。）

因此当 $N = nm \geq 2$ 时：

$$\boxed{\tilde{\theta} = \frac{T(T-1)}{N(N-1)} = \frac{T(T-1)}{nm(nm-1)}}$$

是 $p^2$ 的无偏估计量。验证：

$$E(\tilde{\theta}) = \frac{E[T(T-1)]}{N(N-1)} = \frac{N(N-1)p^2}{N(N-1)} = p^2 \quad \checkmark$$

其中 $T = \displaystyle\sum_{i=1}^n X_i$，$N = nm$。
:::

:::callout{kind=note label="知识卡片：极大似然估计与无偏估计构造"}
| 概念 | 公式/结论 | 说明 |
|------|------|------|
| MLE 不变性 | $\hat{g(\theta)} = g(\hat{\theta})$ | $g$ 连续即可 |
| MLE 无偏性 | 不一定无偏 | 本题 $\hat{p}^2$ 有正偏差 |
| 偏差计算 | $E(\hat{p}^2) - p^2 = \dfrac{p(1-p)}{N}$ | $\hat{p}$ 的方差 |
| 阶乘矩 | $E[T(T-1)] = N(N-1)p^2$（$T \sim B(N,p)$） | 消去一阶项 |
| 无偏构造 | $\dfrac{T(T-1)}{N(N-1)}$ | 阶乘矩标准化 |
| 条件 | $N \geq 2$（即 $nm \geq 2$） | 分母非零 |
| 一般方法 | 用 $\dbinom{T}{k}\big/\dbinom{N}{k}$ 估 $p^k$ | $k$ 阶无偏 |
:::

:::callout{kind=tip label="结论速记"}
MLE 由不变性得 $\hat{p}^2 = (\bar{X}/m)^2$（有偏）；无偏估计用阶乘矩 $E[T(T\!-\!1)] = N(N\!-\!1)p^2$ 构造 $\dfrac{T(T-1)}{nm(nm-1)}$。
:::

---
