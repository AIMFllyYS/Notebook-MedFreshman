# 2023-2024学年第二学期 概率论与数理统计期末考试A卷

> 来源：华中科技大学
> 考试时间：120 分钟　满分：100 分
> 题型：单项选择题 10 题（每题 3 分）+ 填空题 4 题（每题 3 分）+ 计算题 5 大题

---

## 一、单项选择题（每题 3 分，共 30 分）

### 第1题

:::callout{kind=note label="题目"}
盒中装有 3 个红球，2 个黑球，1 个白球，现从中不放回地抽取两次，每次取一球，则取出的两球中没有红球的概率为（　　）

A. $\dfrac{2}{15}$　　B. $\dfrac{3}{15}$　　C. $\dfrac{4}{15}$　　D. $\dfrac{5}{15}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

盒中共 6 个球（3 红 + 2 黑 + 1 白），不放回取两球。总取法数为 $\dbinom{6}{2} = 15$。

"没有红球"意味着两球均取自 3 个非红球（2 黑 + 1 白），取法数为 $\dbinom{3}{2} = 3$：

$$P = \frac{\dbinom{3}{2}}{\dbinom{6}{2}} = \frac{3}{15}$$

- **A 错**：$\dfrac{2}{15}$ 误将非红球数当作 2（只算黑球，漏掉白球）。
- **C 错**：$\dfrac{4}{15}$ 可能错算非红球组合数为 $\dbinom{4}{2}$。
- **D 错**：$\dfrac{5}{15}$ 混淆了分子取法。
:::

:::callout{kind=note label="知识卡片：古典概型与组合计数"}
| 模型 | 公式 | 说明 |
|------|------|------|
| 无放回组合 | $\dbinom{n}{k} = \dfrac{n!}{k!(n-k)!}$ | 从 $n$ 个不同元素中取 $k$ 个 |
| 事件概率 | $P(A) = \dfrac{\lvert A \rvert}{\lvert \Omega \rvert}$ | 古典概型等可能假设 |
| 本题 | $\dfrac{\dbinom{3}{2}}{\dbinom{6}{2}} = \dfrac{3}{15}$ | 非红球 3 个中取 2 个 |
:::

:::callout{kind=tip label="结论速记"}
"无红球" $\Rightarrow$ 从 3 个非红球中取 2 个 $\Rightarrow \dfrac{\dbinom{3}{2}}{\dbinom{6}{2}} = \dfrac{3}{15}$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
将一枚均匀硬币掷 10 次，$A = \{$恰好出现两次正面$\}$，$B = \{$前五次均出现反面$\}$，则 $P(B \mid A) = $（　　）

A. $\dfrac{1}{4}$　　B. $\dfrac{3}{8}$　　C. $\dfrac{2}{9}$　　D. $\dfrac{3}{9}$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

在条件 $A$（恰好两次正面）下，两次正面在 10 次投掷中的位置等可能选取，共有 $\dbinom{10}{2} = 45$ 种放法。

$B$ 发生要求前五次都是反面，即两次正面都落在后五次中，共有 $\dbinom{5}{2} = 10$ 种放法：

$$P(B \mid A) = \frac{\dbinom{5}{2}}{\dbinom{10}{2}} = \frac{10}{45} = \frac{2}{9}$$

- **A 错**：$\dfrac{1}{4}$ 未正确使用组合计数。
- **B 错**：$\dfrac{3}{8}$ 计算路径错误。
- **D 错**：$\dfrac{3}{9}$ 化简前的分子分母均不对。
:::

:::callout{kind=note label="知识卡片：条件概率与超几何分配"}
| 概念 | 公式 |
|------|------|
| 条件概率 | $P(B \mid A) = \dfrac{P(AB)}{P(A)} = \dfrac{\lvert AB \rvert}{\lvert A \rvert}$（等可能） |
| 位置分配 | $k$ 个正面在 $n$ 次中的位置 $\sim$ 等可能 $\dbinom{n}{k}$ 种 |
| 本题模型 | 条件 $A$ 下，2 个正面位置从 $\{1,\ldots,10\}$ 均匀选 2 个 |
:::

:::callout{kind=tip label="结论速记"}
条件 $A$（恰 2 次正面）下，正面位置从 10 选 2 $\to$ 限制在后 5 位 $\to \dfrac{\dbinom{5}{2}}{\dbinom{10}{2}} = \dfrac{2}{9}$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
在一维几何概型中，样本空间 $\Omega = [0, 1]$，事件 $A = [0, 0.4]$，$B = [a, b]$，$P(B) = 0.7$，且 $A$ 与 $B$ 相互独立，则（　　）

A. $a = 0.10, b = 0.80$　　B. $a = 0.11, b = 0.81$

C. $a = 0.12, b = 0.82$　　D. $a = 0.13, b = 0.83$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

由 $P(B) = 0.7$ 得 $b - a = 0.7$。

由独立性 $P(A \cap B) = P(A) \cdot P(B) = 0.4 \times 0.7 = 0.28$。

$A \cap B = [0, 0.4] \cap [a, b]$，其长度为 $\max(0,\, 0.4 - a)$（注意 $a < 0.4$，否则交集为空，长度 0，不等于 0.28）。故：

$$0.4 - a = 0.28 \quad \Rightarrow \quad a = 0.12$$

$$b = a + 0.7 = 0.82$$

验证：$A \cap B = [0.12, 0.40]$，长度 $= 0.28$ ✓

- **A 错**：$a=0.10$ 时 $A \cap B$ 长度 $0.30 \neq 0.28$。
- **B 错**：$a=0.11$ 时 $A \cap B$ 长度 $0.29 \neq 0.28$。
- **D 错**：$a=0.13$ 时 $A \cap B$ 长度 $0.27 \neq 0.28$。
:::

:::callout{kind=note label="知识卡片：几何概型与独立性"}
| 条件 | 公式 |
|------|------|
| 几何概率 | $P(A) = \dfrac{\lvert A \rvert}{\lvert \Omega \rvert}$（长度/面积/体积比） |
| 独立性 | $P(AB) = P(A) \cdot P(B)$ |
| 区间交集长度 | $\lvert [c_1, d_1] \cap [c_2, d_2] \rvert = \max(0,\, \min(d_1, d_2) - \max(c_1, c_2))$ |
| 本题 | $b - a = 0.7$，$0.4 - a = 0.28 \Rightarrow a = 0.12, b = 0.82$ |
:::

:::callout{kind=tip label="结论速记"}
独立性 $\Rightarrow P(A \cap B) = P(A)P(B) = 0.28 \Rightarrow 0.4 - a = 0.28 \Rightarrow a = 0.12$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
若仅知道某分布函数在 $(-\infty, a]$ 上的表达式为 $F(x) = \dfrac{2}{2 + x^2}$，则一定有（　　）

A. $a \leq 0$　　B. $a = 0$　　C. $a > 0$　　D. $P\{X \geq a\} = 0$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

分布函数必须满足**单调不减**性。考察 $F(x) = \dfrac{2}{2 + x^2}$ 的导数：

$$F'(x) = \frac{-4x}{(2 + x^2)^2}$$

- 当 $x < 0$ 时，$F'(x) > 0$，$F$ 递增 ✓
- 当 $x > 0$ 时，$F'(x) < 0$，$F$ 递减 ✗

因此 $F$ 在 $x > 0$ 上递减，违反单调不减性，故区间端点必须满足 $a \leq 0$。

- **B 错**：$a = 0$ 是充分条件但非必要，$a < 0$ 也可（后续段可补成分布函数）。
- **C 错**：$a > 0$ 时 $F$ 在 $(0, a]$ 递减，违反单调性。
- **D 错**：$P\{X \geq a\} = 1 - F(a) = 1 - \dfrac{2}{2+a^2}$，仅当 $a = 0$ 时为 $0$，但 $a$ 未必等于 $0$。
:::

:::callout{kind=note label="知识卡片：分布函数的判定条件"}
| 性质 | 要求 |
|------|------|
| 单调不减 | $x_1 < x_2 \Rightarrow F(x_1) \leq F(x_2)$ |
| 右连续 | $F(x+) = F(x)$ |
| 极限 | $\lim_{x \to -\infty} F(x) = 0$，$\lim_{x \to +\infty} F(x) = 1$ |
| 取值范围 | $0 \leq F(x) \leq 1$ |
| 判定技巧 | 求 $F'(x)$ 符号判断单调性 |
:::

:::callout{kind=tip label="结论速记"}
$F(x) = \dfrac{2}{2+x^2}$ 在 $x > 0$ 递减 $\Rightarrow$ 必须 $a \leq 0$ 才能保证单调不减。
:::

---

### 第5题

:::callout{kind=note label="题目"}
考试成绩以 60 分为及格标准。考试前，A 同学认为自己成绩 $X \sim N(65, a^2)$，B 同学认为自己成绩 $Y \sim N(60 + a, 10^2)$。若 A 同学及格的概率不小于 B 同学及格的概率，则（　　）

A. $a^2 \leq 10$　　B. $a^2 \geq 10$　　C. $a^2 \leq 50$　　D. $a^2 \geq 50$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

分别标准化计算两同学的及格概率：

$$P(X \geq 60) = P\!\left(\frac{X - 65}{a} \geq \frac{60 - 65}{a}\right) = 1 - \Phi\!\left(-\frac{5}{a}\right) = \Phi\!\left(\frac{5}{a}\right)$$

$$P(Y \geq 60) = P\!\left(\frac{Y - (60+a)}{10} \geq \frac{60 - (60+a)}{10}\right) = 1 - \Phi\!\left(-\frac{a}{10}\right) = \Phi\!\left(\frac{a}{10}\right)$$

由题意 $P(X \geq 60) \geq P(Y \geq 60)$，即：

$$\Phi\!\left(\frac{5}{a}\right) \geq \Phi\!\left(\frac{a}{10}\right)$$

由于 $\Phi$ 单调递增：

$$\frac{5}{a} \geq \frac{a}{10} \quad \Rightarrow \quad 50 \geq a^2 \quad \Rightarrow \quad a^2 \leq 50$$

- **A 错**：$a^2 \leq 10$ 过强，非必要条件。
- **B 错**：方向相反。
- **D 错**：方向相反。
:::

:::callout{kind=note label="知识卡片：正态分布的标准化与概率比较"}
| 步骤 | 公式 |
|------|------|
| 标准化 | $X \sim N(\mu, \sigma^2) \Rightarrow Z = \dfrac{X - \mu}{\sigma} \sim N(0,1)$ |
| 尾概率 | $P(X \geq c) = 1 - \Phi\!\left(\dfrac{c - \mu}{\sigma}\right) = \Phi\!\left(\dfrac{\mu - c}{\sigma}\right)$ |
| $\Phi$ 单调性 | $\Phi$ 严格递增 $\Rightarrow$ 比较概率等价于比较自变量 |
| 本题 | $\dfrac{5}{a} \geq \dfrac{a}{10} \Rightarrow a^2 \leq 50$ |
:::

:::callout{kind=tip label="结论速记"}
$P(X \geq 60) = \Phi(5/a)$，$P(Y \geq 60) = \Phi(a/10)$，$\Phi$ 单调增 $\Rightarrow 5/a \geq a/10 \Rightarrow a^2 \leq 50$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $X \sim P(\ln 2)$，$Y \sim B\!\left(1, \dfrac{1}{2}\right)$，且它们相互独立，则 $P\{XY = 0\} = $（　　）

A. $\dfrac{1}{4}$　　B. $\dfrac{3}{4}$　　C. $\dfrac{1}{4}\ln 2$　　D. $\dfrac{3}{4}\ln 2$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

$XY = 0$ 的对立事件为 $XY \neq 0$，即 $X > 0$ 且 $Y = 1$。由独立性：

$$P(XY \neq 0) = P(X > 0) \cdot P(Y = 1)$$

对泊松分布 $X \sim P(\ln 2)$：

$$P(X = 0) = e^{-\ln 2} = \frac{1}{2} \quad \Rightarrow \quad P(X > 0) = 1 - \frac{1}{2} = \frac{1}{2}$$

对两点分布 $Y \sim B\!\left(1, \dfrac{1}{2}\right)$：

$$P(Y = 1) = \frac{1}{2}$$

故：

$$P(XY = 0) = 1 - P(XY \neq 0) = 1 - \frac{1}{2} \times \frac{1}{2} = 1 - \frac{1}{4} = \frac{3}{4}$$

- **A 错**：$\dfrac{1}{4}$ 误将 $P(XY \neq 0)$ 当作 $P(XY = 0)$。
- **C 错**：$\dfrac{1}{4}\ln 2$ 无理论依据，混入 $\ln 2$。
- **D 错**：$\dfrac{3}{4}\ln 2$ 同样误混入 $\ln 2$。
:::

:::callout{kind=note label="知识卡片：泊松分布与两点分布"}
| 分布 | 记号 | $P(X=0)$ | $P(X>0)$ |
|------|------|----------|----------|
| 泊松 | $P(\lambda)$ | $e^{-\lambda}$ | $1 - e^{-\lambda}$ |
| 两点 | $B(1, p)$ | $1 - p$ | $p$ |
| 本题 $X$ | $P(\ln 2)$ | $e^{-\ln 2} = \dfrac{1}{2}$ | $\dfrac{1}{2}$ |
| 本题 $Y$ | $B(1, \frac{1}{2})$ | $\dfrac{1}{2}$ | $\dfrac{1}{2}$ |
| 独立乘积为零 | $P(XY=0) = 1 - P(X>0)P(Y=1)$ | — | — |
:::

:::callout{kind=tip label="结论速记"}
$P(XY=0) = 1 - P(X>0)\cdot P(Y=1) = 1 - \dfrac{1}{2}\cdot\dfrac{1}{2} = \dfrac{3}{4}$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $X \sim E(1)$，$a > 0$，则 $P\{X \leq a + 1 \mid X > a\} = $（　　）

A. $1 - e^{-1}$　　B. $e^{-1}$　　C. $1 - e^{-a}$　　D. $e^{-a}$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

指数分布 $E(1)$ 具有**无记忆性**：

$$P(X > s + t \mid X > s) = P(X > t)$$

等价地：

$$P(X \leq s + t \mid X > s) = P(X \leq t)$$

代入 $s = a$，$t = 1$：

$$P(X \leq a + 1 \mid X > a) = P(X \leq 1) = 1 - e^{-1}$$

也可直接用条件概率定义验证：

$$P(X \leq a+1 \mid X > a) = \frac{P(a < X \leq a+1)}{P(X > a)} = \frac{e^{-a} - e^{-(a+1)}}{e^{-a}} = 1 - e^{-1}$$

- **B 错**：$e^{-1}$ 是 $P(X > 1)$，方向取反。
- **C 错**：$1 - e^{-a}$ 误将条件概率当作无条件 $P(X \leq a)$。
- **D 错**：$e^{-a}$ 是 $P(X > a)$，非所求条件概率。
:::

:::callout{kind=note label="知识卡片：指数分布的无记忆性"}
| 性质 | 公式 |
|------|------|
| 分布函数 | $F(x) = 1 - e^{-\lambda x}$，$x \geq 0$ |
| 无记忆性 | $P(X > s+t \mid X > s) = P(X > t)$ |
| 等价形式 | $P(X \leq s+t \mid X > s) = P(X \leq t) = 1 - e^{-\lambda t}$ |
| 唯一性 | 指数分布是唯一具有无记忆性的连续型分布 |
| 本题 | $\lambda = 1$，$t = 1$ $\Rightarrow$ $1 - e^{-1}$ |
:::

:::callout{kind=tip label="结论速记"}
指数分布无记忆性：$P(X \leq a+1 \mid X > a) = P(X \leq 1) = 1 - e^{-1}$，与 $a$ 无关。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 服从区域 $D = \{(x, y) : 0 \leq y \leq \dfrac{1}{x},\ 1 \leq x \leq e^2\}$ 上的均匀分布，$F_X(x)$ 为 $X$ 的分布函数，则 $F_X(2) = $（　　）

A. $\dfrac{1}{2}\ln 2$　　B. $\ln 2$　　C. $\dfrac{1}{4}$　　D. $\dfrac{1}{2}$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

**第 1 步：求区域 $D$ 的面积**

$$S_D = \int_1^{e^2} \frac{1}{x}\,dx = \ln x \Big|_1^{e^2} = 2 - 0 = 2$$

故联合密度 $p(x,y) = \dfrac{1}{2}$，$(x, y) \in D$。

**第 2 步：求 $F_X(2) = P(X \leq 2)$**

$$F_X(2) = \iint_{D \cap \{x \leq 2\}} \frac{1}{2}\,dx\,dy = \frac{1}{2} \int_1^{2} \frac{1}{x}\,dx = \frac{1}{2}\ln 2$$

- **B 错**：$\ln 2$ 漏乘 $\dfrac{1}{2}$（未归一化）。
- **C 错**：$\dfrac{1}{4}$ 计算积分限时出错。
- **D 错**：$\dfrac{1}{2}$ 误将面积当作概率。
:::

:::callout{kind=note label="知识卡片：二维均匀分布的边缘分布"}
| 步骤 | 公式 |
|------|------|
| 区域面积 | $S_D = \iint_D dx\,dy$ |
| 联合密度 | $p(x,y) = \dfrac{1}{S_D}$，$(x,y) \in D$ |
| 边缘分布函数 | $F_X(x) = \dfrac{1}{S_D}\iint_{D \cap \{u \leq x\}} du\,dv$ |
| 边缘密度 | $p_X(x) = \dfrac{1}{S_D}\int_{y_{\min}(x)}^{y_{\max}(x)} dy$ |
| 本题 | $S_D = 2$，$F_X(2) = \dfrac{1}{2}\int_1^2 \dfrac{dx}{x} = \dfrac{\ln 2}{2}$ |
:::

:::callout{kind=tip label="结论速记"}
$S_D = \int_1^{e^2} \frac{dx}{x} = 2$，$F_X(2) = \dfrac{1}{S_D}\int_1^2 \frac{dx}{x} = \dfrac{\ln 2}{2}$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $(X, Y) \sim N(1, 0, 1, 1, \dfrac{1}{9})$，则下列结论错误的是（　　）

A. $Y^2 \sim \chi^2(1)$　　B. $\rho_{XY} = \dfrac{1}{9}$

C. $E(XY) = \dfrac{1}{9}$　　D. $D(X + Y) = \dfrac{19}{9}$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

二维正态分布 $N(\mu_X, \mu_Y, \sigma_X^2, \sigma_Y^2, \rho)$ 的参数为：$\mu_X = 1$，$\mu_Y = 0$，$\sigma_X^2 = 1$，$\sigma_Y^2 = 1$，$\rho = \dfrac{1}{9}$。

逐一验证：

**A**：$Y \sim N(0, 1)$，故 $Y^2 \sim \chi^2(1)$ ✓

**B**：$\rho_{XY} = \dfrac{1}{9}$ ✓（直接由参数给出）

**C**：$E(XY) = \text{Cov}(X, Y) + E(X) \cdot E(Y) = \rho \sigma_X \sigma_Y + \mu_X \mu_Y = \dfrac{1}{9} \cdot 1 \cdot 1 + 1 \cdot 0 = \dfrac{1}{9}$ ✓

**D**：$D(X + Y) = D(X) + D(Y) + 2\,\text{Cov}(X, Y) = 1 + 1 + 2 \cdot \dfrac{1}{9} = \dfrac{20}{9} \neq \dfrac{19}{9}$ ✗

- **A 正确**：标准正态平方服从 $\chi^2(1)$。
- **B 正确**：相关系数由参数直接给出。
- **C 正确**：$E(XY) = \text{Cov} + E(X)E(Y) = \dfrac{1}{9}$。
:::

:::callout{kind=note label="知识卡片：二维正态分布的数字特征"}
| 量 | 公式 | 本题值 |
|------|------|--------|
| 边缘分布 | $X \sim N(\mu_X, \sigma_X^2)$，$Y \sim N(\mu_Y, \sigma_Y^2)$ | $X \sim N(1,1)$，$Y \sim N(0,1)$ |
| 协方差 | $\text{Cov}(X,Y) = \rho\,\sigma_X\sigma_Y$ | $\dfrac{1}{9}$ |
| $E(XY)$ | $\text{Cov}(X,Y) + \mu_X\mu_Y$ | $\dfrac{1}{9} + 0 = \dfrac{1}{9}$ |
| $D(X+Y)$ | $\sigma_X^2 + \sigma_Y^2 + 2\rho\sigma_X\sigma_Y$ | $1 + 1 + \dfrac{2}{9} = \dfrac{20}{9}$ |
| $D(X-Y)$ | $\sigma_X^2 + \sigma_Y^2 - 2\rho\sigma_X\sigma_Y$ | $1 + 1 - \dfrac{2}{9} = \dfrac{16}{9}$ |
| $\chi^2$ 分布 | $Z \sim N(0,1) \Rightarrow Z^2 \sim \chi^2(1)$ | $Y^2 \sim \chi^2(1)$ |
:::

:::callout{kind=tip label="结论速记"}
$D(X \pm Y) = \sigma_X^2 + \sigma_Y^2 \pm 2\rho\sigma_X\sigma_Y$；本题 $D(X+Y) = \dfrac{20}{9} \neq \dfrac{19}{9}$，D 错误。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $X_1, X_2$ 是来自正态总体 $N(0, \sigma^2)$ 的 i.i.d. 样本，$\bar{X}$ 与 $S^2$ 分别表示样本均值与样本方差，则（　　）

A. $X_1$ 与 $X_2$ 不相互独立

B. $X_1$ 与 $X_2$ 分布不相同

C. $E(\bar{X}^2 S^2) = \dfrac{\sigma^2}{2}$

D. $D(\bar{X}^2) = \dfrac{\sigma^4}{2}$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

由 i.i.d. 定义，$X_1$ 与 $X_2$ 独立同分布，故 A、B 均错误。

正态样本中 $\bar{X}$ 与 $S^2$ 相互独立（关键性质），且：

$$\bar{X} \sim N\!\left(0, \frac{\sigma^2}{2}\right) \quad \Rightarrow \quad E(\bar{X}^2) = D(\bar{X}) = \frac{\sigma^2}{2}$$

$$E(S^2) = \sigma^2 \quad \text{（无偏估计）}$$

**验证 C**：

$$E(\bar{X}^2 S^2) = E(\bar{X}^2) \cdot E(S^2) = \frac{\sigma^2}{2} \cdot \sigma^2 = \frac{\sigma^4}{2} \neq \frac{\sigma^2}{2}$$

C 错误（量纲和数值都不对）。

**验证 D**：

由 $\bar{X} \sim N\!\left(0, \dfrac{\sigma^2}{2}\right)$，令 $Z = \dfrac{\bar{X}}{\sigma/\sqrt{2}} \sim N(0,1)$，则 $\bar{X}^2 = \dfrac{\sigma^2}{2} Z^2$，其中 $Z^2 \sim \chi^2(1)$，$D(Z^2) = 2$：

$$D(\bar{X}^2) = \left(\frac{\sigma^2}{2}\right)^2 \cdot D(Z^2) = \frac{\sigma^4}{4} \cdot 2 = \frac{\sigma^4}{2}$$

D 正确 ✓

- **A 错**：i.i.d. 保证独立。
- **B 错**：i.i.d. 保证同分布。
- **C 错**：$E(\bar{X}^2 S^2) = \dfrac{\sigma^4}{2}$，非 $\dfrac{\sigma^2}{2}$。
:::

:::callout{kind=note label="知识卡片：正态样本的数字特征"}
| 量 | 公式 | 本题值 |
|------|------|--------|
| $\bar{X}$ 分布 | $N\!\left(\mu, \dfrac{\sigma^2}{n}\right)$ | $N\!\left(0, \dfrac{\sigma^2}{2}\right)$ |
| $E(\bar{X}^2)$ | $D(\bar{X}) + [E(\bar{X})]^2$ | $\dfrac{\sigma^2}{2}$ |
| $E(S^2)$ | $\sigma^2$（无偏） | $\sigma^2$ |
| $\bar{X}$ 与 $S^2$ | 正态总体下独立 | — |
| $D(\bar{X}^2)$ | $\dfrac{2\sigma^4}{n^2}$（一般 $n$） | $\dfrac{\sigma^4}{2}$（$n=2$） |
| $\chi^2$ 方差 | $D(\chi^2(k)) = 2k$ | $D(\chi^2(1)) = 2$ |
:::

:::callout{kind=tip label="结论速记"}
$\bar{X} \sim N(0, \sigma^2/2) \Rightarrow \bar{X}^2 = \dfrac{\sigma^2}{2}Z^2$，$Z^2 \sim \chi^2(1) \Rightarrow D(\bar{X}^2) = \dfrac{\sigma^4}{4}\cdot 2 = \dfrac{\sigma^4}{2}$。
:::

---

## 二、填空题（每题 3 分，共 12 分）

### 第1题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 的联合分布列为：

| $X \backslash Y$ | 0 | 1 | 2 |
|------|------|------|------|
| 0 | 0.06 | 0.15 | $\alpha$ |
| 1 | $\beta$ | 0.35 | 0.21 |

当 $X$ 与 $Y$ 独立时，$2\alpha + 3\beta = $ ______。
:::

:::callout{kind=insight label="解析"}
**【答案】$0.6$**

**第 1 步：求行和与列和**

$$P(X=0) = 0.06 + 0.15 + \alpha = 0.21 + \alpha$$

$$P(X=1) = \beta + 0.35 + 0.21 = \beta + 0.56$$

$$P(Y=1) = 0.15 + 0.35 = 0.50$$

**第 2 步：利用独立性求解**

由 $P(X=0, Y=1) = P(X=0) \cdot P(Y=1)$：

$$0.15 = (0.21 + \alpha) \times 0.5 \quad \Rightarrow \quad 0.21 + \alpha = 0.3 \quad \Rightarrow \quad \alpha = 0.09$$

**第 3 步：由归一化求 $\beta$**

$$0.06 + 0.15 + 0.09 + \beta + 0.35 + 0.21 = 1 \quad \Rightarrow \quad \beta = 0.14$$

验证独立性：$P(X=0) = 0.3$，$P(X=1) = 0.7$，$P(Y=0) = 0.06 + 0.14 = 0.20$，$P(Y=2) = 0.09 + 0.21 = 0.30$。

- $P(X=0)P(Y=0) = 0.3 \times 0.2 = 0.06$ ✓
- $P(X=1)P(Y=0) = 0.7 \times 0.2 = 0.14 = \beta$ ✓
- $P(X=0)P(Y=2) = 0.3 \times 0.3 = 0.09 = \alpha$ ✓

**第 4 步：计算**

$$2\alpha + 3\beta = 2 \times 0.09 + 3 \times 0.14 = 0.18 + 0.42 = 0.6$$
:::

:::callout{kind=note label="知识卡片：离散型独立性判定"}
| 条件 | 公式 |
|------|------|
| 独立性 | $P(X=x_i, Y=y_j) = P(X=x_i) \cdot P(Y=y_j)$，对所有 $i, j$ |
| 行和 | $P(X=x_i) = \sum_j p_{ij}$ |
| 列和 | $P(Y=y_j) = \sum_i p_{ij}$ |
| 归一化 | $\sum_{i,j} p_{ij} = 1$ |
| 求解策略 | 选一个已知格子建立方程，再归一化求其余 |
:::

:::callout{kind=tip label="结论速记"}
独立性 $\Rightarrow 0.15 = P(X=0)\cdot 0.5 \Rightarrow P(X=0) = 0.3 \Rightarrow \alpha = 0.09$，归一化 $\Rightarrow \beta = 0.14$，$2\alpha+3\beta = 0.6$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $X \sim E(1)$，$Y \sim E(2)$ 且相互独立，$Z = \max(X, Y)$ 的密度函数记作 $p_Z(z)$，则当 $z > 0$ 时，$p_Z(z) = $ ______。
:::

:::callout{kind=insight label="解析"}
**【答案】$e^{-z} + 2e^{-2z} - 3e^{-3z}$**

**第 1 步：求 $Z = \max(X, Y)$ 的分布函数**

由独立性：

$$F_Z(z) = P(Z \leq z) = P(X \leq z, Y \leq z) = P(X \leq z) \cdot P(Y \leq z)$$

$$F_Z(z) = (1 - e^{-z})(1 - e^{-2z}) = 1 - e^{-z} - e^{-2z} + e^{-3z}$$

**第 2 步：求导得密度**

$$p_Z(z) = F_Z'(z) = e^{-z} + 2e^{-2z} - 3e^{-3z}$$
:::

:::callout{kind=note label="知识卡片：极值分布"}
| 模型 | 分布函数 | 密度函数 |
|------|----------|----------|
| $Z = \max(X, Y)$ | $F_Z = F_X \cdot F_Y$（独立时） | $p_Z = p_X F_Y + F_X p_Y$ |
| $W = \min(X, Y)$ | $F_W = 1 - (1-F_X)(1-F_Y)$ | $p_W = p_X(1-F_Y) + (1-F_X)p_Y$ |
| 指数 $E(\lambda)$ | $F(x) = 1 - e^{-\lambda x}$ | $p(x) = \lambda e^{-\lambda x}$ |
| 本题 | $(1-e^{-z})(1-e^{-2z})$ | $e^{-z} + 2e^{-2z} - 3e^{-3z}$ |
:::

:::callout{kind=tip label="结论速记"}
$\max$ 的分布 $F_Z = F_X \cdot F_Y$，求导即得密度：$e^{-z} + 2e^{-2z} - 3e^{-3z}$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \cdots, X_{16})$ 是来自总体 $X \sim N(0, \sigma^2)$ 的 i.i.d. 样本，$X_1^*, \cdots, X_{16}^*$ 为其顺序统计量，$S^2$ 为样本方差，则 $\dfrac{1}{4S}(X_1^* + \cdots + X_{16}^*)$ 服从 ______ 分布。
:::

:::callout{kind=insight label="解析"}
**【答案】$t(15)$**

**第 1 步：顺序统计量之和等于样本和**

$$X_1^* + X_2^* + \cdots + X_{16}^* = X_1 + X_2 + \cdots + X_{16} = 16\bar{X}$$

**第 2 步：化简表达式**

$$\frac{X_1^* + \cdots + X_{16}^*}{4S} = \frac{16\bar{X}}{4S} = \frac{4\bar{X}}{S} = \frac{\bar{X}}{S/4} = \frac{\bar{X}}{S/\sqrt{16}}$$

**第 3 步：识别 $t$ 分布**

正态总体 $N(\mu, \sigma^2)$ 下，枢轴量：

$$T = \frac{\bar{X} - \mu}{S/\sqrt{n}} \sim t(n - 1)$$

本题 $\mu = 0$，$n = 16$，故：

$$\frac{\bar{X}}{S/\sqrt{16}} \sim t(15)$$
:::

:::callout{kind=note label="知识卡片：正态总体的抽样分布"}
| 枢轴量 | 分布 | 条件 |
|--------|------|------|
| $\dfrac{\bar{X} - \mu}{\sigma/\sqrt{n}}$ | $N(0,1)$ | $\sigma$ 已知 |
| $\dfrac{\bar{X} - \mu}{S/\sqrt{n}}$ | $t(n-1)$ | $\sigma$ 未知 |
| $\dfrac{(n-1)S^2}{\sigma^2}$ | $\chi^2(n-1)$ | $\mu$ 未知 |
| $\dfrac{\bar{X} - \mu}{S/\sqrt{n}} \Big/ \sqrt{\dfrac{(n-1)S^2}{\sigma^2(n-1)}}$ | $t(n-1)$ | 独立性保证 |
| 顺序统计量和 | $\sum X_i^* = \sum X_i = n\bar{X}$ | 排序不改总和 |
:::

:::callout{kind=tip label="结论速记"}
顺序统计量之和 $= n\bar{X}$ $\Rightarrow \dfrac{n\bar{X}}{4S} = \dfrac{\bar{X}}{S/\sqrt{n}} \sim t(n-1) = t(15)$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
某大学学生每天用于自习的时间 $X \sim U(0, 4)$。随机抽选 27 名同学，求他们每天用于自习的总时间超过 57 小时的概率近似为 ______。（用 $\Phi$ 表示）
:::

:::callout{kind=insight label="解析"}
**【答案】$1 - \Phi(0.5)$**

**第 1 步：求单个 $X$ 的均值与方差**

$X \sim U(0, 4)$：

$$E(X) = \frac{0 + 4}{2} = 2, \qquad D(X) = \frac{(4 - 0)^2}{12} = \frac{16}{12} = \frac{4}{3}$$

**第 2 步：求总和 $T = X_1 + \cdots + X_{27}$ 的均值与方差**

$$E(T) = 27 \times 2 = 54, \qquad D(T) = 27 \times \frac{4}{3} = 36$$

**第 3 步：中心极限定理近似**

$$T \stackrel{\cdot}{\sim} N(54, 36), \qquad \sigma_T = 6$$

$$P(T > 57) = P\!\left(\frac{T - 54}{6} > \frac{57 - 54}{6}\right) = P(Z > 0.5) = 1 - \Phi(0.5)$$
:::

:::callout{kind=note label="知识卡片：中心极限定理与均匀分布"}
| 概念 | 公式 |
|------|------|
| 均匀分布 $U(a,b)$ | $E = \dfrac{a+b}{2}$，$D = \dfrac{(b-a)^2}{12}$ |
| 独立和的均值 | $E\!\left(\sum X_i\right) = n \cdot E(X)$ |
| 独立和的方差 | $D\!\left(\sum X_i\right) = n \cdot D(X)$ |
| 中心极限定理 | $\sum_{i=1}^n X_i \stackrel{\cdot}{\sim} N(n\mu,\, n\sigma^2)$（$n$ 较大） |
| 标准化 | $P(T > c) = 1 - \Phi\!\left(\dfrac{c - n\mu}{\sigma\sqrt{n}}\right)$ |
| 本题 | $n=27$，$n\mu = 54$，$\sigma\sqrt{n} = \sqrt{36} = 6$ |
:::

:::callout{kind=tip label="结论速记"}
$T \approx N(54, 36)$ $\Rightarrow$ $P(T > 57) = 1 - \Phi\!\left(\dfrac{57-54}{6}\right) = 1 - \Phi(0.5)$。
:::

---

## 三、（12 分）

### 第1题

:::callout{kind=note label="题目"}
设有编号为 1, 2, 3, 4 的四个球，随机装入编号为 1, 2, 3, 4 的四个箱中，每箱只装一个球。用 $A_i$ 表示"编号为 $i$ 的球恰好放入 $i$ 号箱"事件，求：

1. $P(A_1 \cup A_2 \cup A_3 \cup A_4)$；
2. $P(\bar{A}_3 \bar{A}_4 \mid \bar{A}_1 \bar{A}_2)$。
:::

:::callout{kind=insight label="解析"}
**【解】**

四个球随机入四个箱（每箱一球）等价于 4 个元素的全排列，样本空间大小 $|\Omega| = 4! = 24$。

**第 1 步：求 $P(A_1 \cup A_2 \cup A_3 \cup A_4)$**

用容斥原理或补事件法。"至少一球放对"的补事件为"全错排"（无一球放对），错排数：

$$D_4 = 4!\left(1 - \frac{1}{1!} + \frac{1}{2!} - \frac{1}{3!} + \frac{1}{4!}\right) = 24 \times \frac{9}{24} = 9$$

$$P(A_1 \cup A_2 \cup A_3 \cup A_4) = 1 - \frac{D_4}{4!} = 1 - \frac{9}{24} = \frac{15}{24} = \frac{5}{8}$$

**第 2 步：求 $P(\bar{A}_3 \bar{A}_4 \mid \bar{A}_1 \bar{A}_2)$**

由条件概率定义：

$$P(\bar{A}_3 \bar{A}_4 \mid \bar{A}_1 \bar{A}_2) = \frac{P(\bar{A}_1 \bar{A}_2 \bar{A}_3 \bar{A}_4)}{P(\bar{A}_1 \bar{A}_2)} = \frac{|\bar{A}_1 \bar{A}_2 \bar{A}_3 \bar{A}_4|}{|\bar{A}_1 \bar{A}_2|}$$

- 分子 $|\bar{A}_1 \bar{A}_2 \bar{A}_3 \bar{A}_4|$ = 全错排数 $D_4 = 9$
- 分母 $|\bar{A}_1 \bar{A}_2|$：满足球 1 不入箱 1 且球 2 不入箱 2 的排列数，由容斥：

$$|\bar{A}_1 \bar{A}_2| = 4! - |A_1| - |A_2| + |A_1 A_2| = 24 - 6 - 6 + 2 = 14$$

故：

$$P(\bar{A}_3 \bar{A}_4 \mid \bar{A}_1 \bar{A}_2) = \frac{9}{14}$$

**答**：$P(A_1 \cup A_2 \cup A_3 \cup A_4) = \dfrac{5}{8}$，$P(\bar{A}_3 \bar{A}_4 \mid \bar{A}_1 \bar{A}_2) = \dfrac{9}{14}$。
:::

:::callout{kind=note label="知识卡片：错排数与容斥原理"}
| 概念 | 公式 |
|------|------|
| 错排数 | $D_n = n!\displaystyle\sum_{k=0}^n \frac{(-1)^k}{k!}$ |
| $D_4$ | $24\left(1 - 1 + \dfrac{1}{2} - \dfrac{1}{6} + \dfrac{1}{24}\right) = 9$ |
| 容斥原理 | $\lvert A_1 \cup \cdots \cup A_n \rvert = \sum \lvert A_i \rvert - \sum \lvert A_i A_j \rvert + \cdots$ |
| 补事件法 | $P(\cup A_i) = 1 - P(\cap \bar{A}_i) = 1 - \dfrac{D_n}{n!}$ |
| 条件概率 | $P(B \mid C) = \dfrac{\lvert B \cap C \rvert}{\lvert C \rvert}$（古典概型） |
| $|A_i|$ | $(n-1)!$（固定一球对位，其余全排） |
| $|A_i A_j|$ | $(n-2)!$（固定两球对位） |
:::

:::callout{kind=tip label="结论速记"}
至少一球对位 $= 1 - \dfrac{D_4}{4!} = \dfrac{5}{8}$；条件概率 $= \dfrac{D_4}{|\bar{A}_1\bar{A}_2|} = \dfrac{9}{14}$。
:::

---

## 四、（10 分）

### 第1题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 的联合密度函数为

$$p(x, y) = A \cdot I_{\{(x,y): |x| < y < 1\}}(x, y)$$

求：

1. 常数 $A$；
2. 边缘密度函数 $p_X(x)$，$p_Y(y)$；
3. $X$ 与 $Y$ 是否相互独立，为什么？
:::

:::callout{kind=insight label="解析"}
**【解】**

支撑域 $D = \{(x, y) : |x| < y < 1\}$，即 $0 < y < 1$ 且 $-y < x < y$（三角形区域）。

**第 1 步：求常数 $A$（归一化）**

$$\iint_D A\,dx\,dy = A \int_0^1 \int_{-y}^{y} dx\,dy = A \int_0^1 2y\,dy = A \cdot 1 = 1$$

$$\boxed{A = 1}$$

**第 2 步：求边缘密度**

对 $|x| < 1$，$y$ 从 $|x|$ 到 $1$：

$$p_X(x) = \int_{|x|}^{1} 1\,dy = 1 - |x|, \quad |x| < 1$$

其他处 $p_X(x) = 0$。

对 $0 < y < 1$，$x$ 从 $-y$ 到 $y$：

$$p_Y(y) = \int_{-y}^{y} 1\,dx = 2y, \quad 0 < y < 1$$

其他处 $p_Y(y) = 0$。

**第 3 步：判断独立性**

$X$ 与 $Y$ **不独立**，理由有二：

1. **支撑域非矩形**：联合密度的支撑集 $D = \{|x| < y < 1\}$ 是三角形区域，而 $X$ 的支撑集 $(-1, 1)$ 与 $Y$ 的支撑集 $(0, 1)$ 的直积是矩形 $(-1,1)\times(0,1)$，二者不一致。
2. **密度不分解**：$p(x,y) = 1 \neq (1 - |x|) \cdot 2y = p_X(x) \cdot p_Y(y)$（例如取 $x=0, y=0.5$ 时 $1 \neq 1 \times 1 = 1$，但取 $x = 0.3, y = 0.5$ 时 $1 \neq 0.7 \times 1 = 0.7$）。

**答**：$A = 1$；$p_X(x) = 1 - |x|$（$|x| < 1$），$p_Y(y) = 2y$（$0 < y < 1$）；$X$ 与 $Y$ 不独立。
:::

:::callout{kind=note label="知识卡片：联合密度与独立性判定"}
| 步骤 | 公式 |
|------|------|
| 归一化 | $\iint p(x,y)\,dx\,dy = 1$ |
| 边缘密度（$X$） | $p_X(x) = \int_{-\infty}^{+\infty} p(x,y)\,dy$ |
| 边缘密度（$Y$） | $p_Y(y) = \int_{-\infty}^{+\infty} p(x,y)\,dx$ |
| 独立性判定 1 | 支撑域是否为矩形（直积形式） |
| 独立性判定 2 | $p(x,y) \stackrel{?}{=} p_X(x) \cdot p_Y(y)$ 处处成立 |
| 示性函数 | $I_D(x,y) = \begin{cases}1, & (x,y) \in D \\ 0, & \text{其他}\end{cases}$ |
:::

:::callout{kind=tip label="结论速记"}
三角形支撑域 $\Rightarrow$ 非矩形 $\Rightarrow$ 不独立；$p_X(x) = 1 - |x|$，$p_Y(y) = 2y$。
:::

---

## 五、（12 分）

### 第1题

:::callout{kind=note label="题目"}
设 $X \sim U(0, 1)$，$Y \sim U(0, 1)$ 且相互独立，求：

1. $Z = X + Y$ 的密度函数 $p_Z(z)$；
2. 若矩形的长、宽分别为 $X, Y$，用 $p_Z(z)$ 表达矩形周长 $L$ 的密度函数 $p_L(l)$。
:::

:::callout{kind=insight label="解析"}
**【解】**

**第 1 步：求 $Z = X + Y$ 的密度（卷积公式）**

由独立性，$p_Z(z) = \int_{-\infty}^{+\infty} p_X(x) \cdot p_Y(z - x)\,dx$。需 $0 \leq x \leq 1$ 且 $0 \leq z - x \leq 1$，即 $\max(0, z-1) \leq x \leq \min(1, z)$。

- **当 $0 < z < 1$ 时**：$x \in [0, z]$

$$p_Z(z) = \int_0^z 1 \cdot 1\,dx = z$$

- **当 $1 \leq z < 2$ 时**：$x \in [z - 1, 1]$

$$p_Z(z) = \int_{z-1}^{1} 1 \cdot 1\,dx = 1 - (z - 1) = 2 - z$$

- **其他**：$p_Z(z) = 0$

$$p_Z(z) = \begin{cases} z, & 0 < z < 1 \\ 2 - z, & 1 \leq z < 2 \\ 0, & \text{其他} \end{cases}$$

**第 2 步：求周长 $L = 2(X + Y) = 2Z$ 的密度**

由 $L = 2Z$，即 $Z = \dfrac{L}{2}$，$\dfrac{dZ}{dL} = \dfrac{1}{2}$，用变量变换公式：

$$p_L(l) = p_Z\!\left(\frac{l}{2}\right) \cdot \left|\frac{dZ}{dL}\right| = \frac{1}{2}\,p_Z\!\left(\frac{l}{2}\right)$$

- 当 $0 < \dfrac{l}{2} < 1$，即 $0 < l < 2$：$p_L(l) = \dfrac{1}{2} \cdot \dfrac{l}{2} = \dfrac{l}{4}$
- 当 $1 \leq \dfrac{l}{2} < 2$，即 $2 \leq l < 4$：$p_L(l) = \dfrac{1}{2} \cdot \left(2 - \dfrac{l}{2}\right) = \dfrac{4 - l}{4}$
- 其他：$p_L(l) = 0$

$$p_L(l) = \begin{cases} \dfrac{l}{4}, & 0 < l < 2 \\ \dfrac{4 - l}{4}, & 2 \leq l < 4 \\ 0, & \text{其他} \end{cases}$$

**答**：$p_Z(z)$ 如上；$p_L(l) = \dfrac{1}{2}\,p_Z\!\left(\dfrac{l}{2}\right)$，分段表达式如上。
:::

:::callout{kind=note label="知识卡片：卷积公式与变量变换"}
| 模型 | 公式 |
|------|------|
| 独立和的密度 | $p_{X+Y}(z) = \int p_X(x)\,p_Y(z-x)\,dx$ |
| 分段原则 | 由 $p_X(x) > 0$ 与 $p_Y(z-x) > 0$ 共同决定积分限 |
| 均匀分布和 | $U(0,1) + U(0,1)$ 为三角分布（$\wedge$ 形） |
| 线性变换 | $Y = aX + b$ $\Rightarrow$ $p_Y(y) = \dfrac{1}{\lvert a \rvert}\,p_X\!\left(\dfrac{y-b}{a}\right)$ |
| 周长 $L = 2Z$ | $p_L(l) = \dfrac{1}{2}\,p_Z\!\left(\dfrac{l}{2}\right)$ |
:::

:::callout{kind=tip label="结论速记"}
独立均匀和为三角分布；$L = 2Z \Rightarrow p_L(l) = \dfrac{1}{2}p_Z(l/2)$，支撑域扩大到 $(0, 4)$。
:::

---

## 六、（10 分）

### 第1题

:::callout{kind=note label="题目"}
袋中装有 3 个球，其中标号为 $i$ 的球有 $i$ 个（$i = 1, 2$），除编号外无其它区别。从中不放回地依次摸出 2 个球，每次摸出一个，用 $X_k$ 表示第 $k$ 次摸出的球的号码。求：

1. $(X_1, X_2)$ 的联合分布列和各自边缘分布列；
2. $(X_1, X_2)$ 的相关系数 $\rho_{X_1 X_2}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

袋中共 3 个球：1 个 1 号球、2 个 2 号球。不放回摸两次。

**第 1 步：求联合分布列**

$$P(X_1 = 1, X_2 = 1) = \frac{1}{3} \times 0 = 0 \quad \text{（仅一个 1 号球，不放回）}$$

$$P(X_1 = 1, X_2 = 2) = \frac{1}{3} \times \frac{2}{2} = \frac{1}{3} \quad \text{（摸完 1 号后剩两个 2 号）}$$

$$P(X_1 = 2, X_2 = 1) = \frac{2}{3} \times \frac{1}{2} = \frac{1}{3}$$

$$P(X_1 = 2, X_2 = 2) = \frac{2}{3} \times \frac{1}{2} = \frac{1}{3}$$

| $X_1 \backslash X_2$ | 1 | 2 | $P(X_1 = \cdot)$ |
|------|------|------|------|
| 1 | 0 | $\dfrac{1}{3}$ | $\dfrac{1}{3}$ |
| 2 | $\dfrac{1}{3}$ | $\dfrac{1}{3}$ | $\dfrac{2}{3}$ |
| $P(X_2 = \cdot)$ | $\dfrac{1}{3}$ | $\dfrac{2}{3}$ | 1 |

**第 2 步：求相关系数**

$$E(X_1) = E(X_2) = 1 \times \frac{1}{3} + 2 \times \frac{2}{3} = \frac{5}{3}$$

$$E(X_1^2) = E(X_2^2) = 1 \times \frac{1}{3} + 4 \times \frac{2}{3} = 3$$

$$D(X_1) = D(X_2) = 3 - \left(\frac{5}{3}\right)^2 = 3 - \frac{25}{9} = \frac{2}{9}$$

$$E(X_1 X_2) = 1 \times 1 \times 0 + 1 \times 2 \times \frac{1}{3} + 2 \times 1 \times \frac{1}{3} + 2 \times 2 \times \frac{1}{3} = \frac{2 + 2 + 4}{3} = \frac{8}{3}$$

$$\text{Cov}(X_1, X_2) = E(X_1 X_2) - E(X_1)\,E(X_2) = \frac{8}{3} - \frac{25}{9} = \frac{24 - 25}{9} = -\frac{1}{9}$$

$$\rho_{X_1 X_2} = \frac{\text{Cov}(X_1, X_2)}{\sqrt{D(X_1)\,D(X_2)}} = \frac{-1/9}{\sqrt{(2/9)(2/9)}} = \frac{-1/9}{2/9} = -\frac{1}{2}$$

**答**：联合分布列如上表，$\rho_{X_1 X_2} = -\dfrac{1}{2}$。
:::

:::callout{kind=note label="知识卡片：离散型联合分布与相关系数"}
| 概念 | 公式 |
|------|------|
| 联合分布列 | $p_{ij} = P(X_1 = x_i, X_2 = y_j)$，$\sum p_{ij} = 1$ |
| 边缘分布 | $P(X_1 = x_i) = \sum_j p_{ij}$ |
| 期望 | $E(X) = \sum x_i \cdot P(X = x_i)$ |
| 方差 | $D(X) = E(X^2) - [E(X)]^2$ |
| 协方差 | $\text{Cov}(X,Y) = E(XY) - E(X)E(Y)$ |
| 相关系数 | $\rho_{XY} = \dfrac{\text{Cov}(X,Y)}{\sqrt{D(X)D(Y)}}$ |
| 不放回抽样 | 前次结果影响后次概率（条件概率调整） |
:::

:::callout{kind=tip label="结论速记"}
不放回抽样 $\Rightarrow$ 负相关；$\text{Cov} = -\dfrac{1}{9}$，$\rho = \dfrac{-1/9}{2/9} = -\dfrac{1}{2}$。
:::

---

## 七、（14 分）

### 第1题

:::callout{kind=note label="题目"}
设总体 $X$ 的密度函数为

$$p(x; \theta) = \frac{2x}{\theta}\,e^{-x^2/\theta}\,I_{(0,+\infty)}(x)$$

其中 $\theta > 0$ 为未知参数，$X_1, \cdots, X_n$ 是来自总体 $X$ 的 i.i.d. 样本。令

$$I(\theta) = -E\!\left[\frac{\partial^2 \ln p(X; \theta)}{\partial \theta^2}\right]$$

为参数 $\theta$ 的 Fisher 信息量。求：

1. $I(\theta)$；
2. $\theta$ 的极大似然估计量 $\hat{\theta}_{MLE}$；
3. 证明 $\hat{\theta}_{MLE}$ 是否为 $\theta$ 的无偏估计量；
4. 证明 $D(\hat{\theta}_{MLE}) = \dfrac{1}{n\,I(\theta)}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

**预备：求 $X^2$ 的分布**

令 $T = X^2$，则 $t > 0$ 时：

$$P(T \leq t) = P(X \leq \sqrt{t}) = \int_0^{\sqrt{t}} \frac{2x}{\theta}\,e^{-x^2/\theta}\,dx$$

令 $u = x^2$，$du = 2x\,dx$：

$$= \int_0^t \frac{1}{\theta}\,e^{-u/\theta}\,du = 1 - e^{-t/\theta}$$

故 $T = X^2 \sim E\!\left(\dfrac{1}{\theta}\right)$（参数 $\lambda = \dfrac{1}{\theta}$ 的指数分布），从而：

$$E(X^2) = E(T) = \theta, \qquad D(X^2) = D(T) = \theta^2$$

---

**第 1 步：求 Fisher 信息量 $I(\theta)$**

$$\ln p(X; \theta) = \ln(2X) - \ln\theta - \frac{X^2}{\theta}$$

$$\frac{\partial \ln p}{\partial \theta} = -\frac{1}{\theta} + \frac{X^2}{\theta^2}$$

$$\frac{\partial^2 \ln p}{\partial \theta^2} = \frac{1}{\theta^2} - \frac{2X^2}{\theta^3}$$

$$I(\theta) = -E\!\left[\frac{1}{\theta^2} - \frac{2X^2}{\theta^3}\right] = -\frac{1}{\theta^2} + \frac{2\,E(X^2)}{\theta^3} = -\frac{1}{\theta^2} + \frac{2\theta}{\theta^3} = -\frac{1}{\theta^2} + \frac{2}{\theta^2} = \frac{1}{\theta^2}$$

$$\boxed{I(\theta) = \frac{1}{\theta^2}}$$

---

**第 2 步：求 $\hat{\theta}_{MLE}$**

似然函数：

$$L(\theta) = \prod_{i=1}^n \frac{2X_i}{\theta}\,e^{-X_i^2/\theta} = \left(\prod_{i=1}^n 2X_i\right) \cdot \theta^{-n} \cdot e^{-\frac{1}{\theta}\sum_{i=1}^n X_i^2}$$

对数似然：

$$\ell(\theta) = C - n\ln\theta - \frac{1}{\theta}\sum_{i=1}^n X_i^2$$

令 $\dfrac{d\ell}{d\theta} = 0$：

$$-\frac{n}{\theta} + \frac{1}{\theta^2}\sum_{i=1}^n X_i^2 = 0 \quad \Rightarrow \quad \hat{\theta}_{MLE} = \frac{1}{n}\sum_{i=1}^n X_i^2$$

$$\boxed{\hat{\theta}_{MLE} = \frac{1}{n}\sum_{i=1}^n X_i^2}$$

---

**第 3 步：证明无偏性**

$$E\!\left(\hat{\theta}_{MLE}\right) = E\!\left(\frac{1}{n}\sum_{i=1}^n X_i^2\right) = \frac{1}{n}\sum_{i=1}^n E(X_i^2) = \frac{1}{n} \cdot n\theta = \theta$$

故 $\hat{\theta}_{MLE}$ 是 $\theta$ 的**无偏估计量**。$\blacksquare$

---

**第 4 步：证明 $D(\hat{\theta}_{MLE}) = \dfrac{1}{n\,I(\theta)}$**

由 $X_1, \ldots, X_n$ 独立，$X_i^2$ 也独立：

$$D\!\left(\hat{\theta}_{MLE}\right) = D\!\left(\frac{1}{n}\sum_{i=1}^n X_i^2\right) = \frac{1}{n^2}\sum_{i=1}^n D(X_i^2) = \frac{1}{n^2} \cdot n\theta^2 = \frac{\theta^2}{n}$$

而：

$$\frac{1}{n\,I(\theta)} = \frac{1}{n \cdot \frac{1}{\theta^2}} = \frac{\theta^2}{n}$$

故：

$$D\!\left(\hat{\theta}_{MLE}\right) = \frac{\theta^2}{n} = \frac{1}{n\,I(\theta)} \qquad \blacksquare$$

**答**：$I(\theta) = \dfrac{1}{\theta^2}$，$\hat{\theta}_{MLE} = \dfrac{1}{n}\displaystyle\sum_{i=1}^n X_i^2$，无偏，且 $D(\hat{\theta}_{MLE}) = \dfrac{1}{n\,I(\theta)}$。
:::

:::callout{kind=note label="知识卡片：Fisher 信息量与极大似然估计"}
| 概念 | 公式 |
|------|------|
| Fisher 信息量 | $I(\theta) = -E\!\left[\dfrac{\partial^2 \ln p}{\partial \theta^2}\right]$ |
| MLE 求法 | 令 $\dfrac{\partial \ell}{\partial \theta} = 0$ 解方程 |
| 无偏性 | $E(\hat{\theta}) = \theta$ |
| Cramér-Rao 下界 | $D(\hat{\theta}) \geq \dfrac{1}{n\,I(\theta)}$（无偏估计） |
| 达到下界条件 | $\dfrac{\partial \ell}{\partial \theta} = I(\theta)\,(\hat{\theta} - \theta)$（线性形式） |
| 指数分布 $E(\lambda)$ | $E = \dfrac{1}{\lambda}$，$D = \dfrac{1}{\lambda^2}$ |
| 本题 $T = X^2$ | $T \sim E(1/\theta)$，$E(T) = \theta$，$D(T) = \theta^2$ |
| 变量替换求分布 | $P(T \leq t) = P(g(X) \leq t)$，再求导得密度 |
:::

:::callout{kind=tip label="结论速记"}
$X^2 \sim E(1/\theta) \Rightarrow E(X^2) = \theta$；MLE $= \overline{X^2}$ 无偏；$D = \theta^2/n = 1/(nI(\theta))$ 达到 C-R 下界。
:::

---
