# 2023-2024学年第一学期 概率论与数理统计期末考试A卷

> 来源：华中科技大学
> 考试时间：120 分钟　满分：100 分
> 题型：单项选择题 10 题（每题 3 分）+ 填空题 4 题（每题 3 分）+ 计算题 5 大题

---

## 一、单项选择题（每题 3 分，共 30 分）

### 第1题

:::callout{kind=note label="题目"}
设随机事件 $A, B$ 满足 $A \subset B$，则（　　）

A. 当 $\bar{B}$ 发生时，$A$ 可能发生　　B. 当 $A \cup B$ 发生时，$B$ 一定发生

C. 当 $AB$ 发生时，$A\bar{B}$ 可能发生　　D. 当 $B$ 发生时，$A$ 一定发生
:::

:::callout{kind=insight label="解析"}
**【答案】B**

由 $A \subset B$，有 $A \cup B = B$，所以 $A \cup B$ 发生时 $B$ 一定发生。

- **A 错**：$A \subset B \Rightarrow \bar{B} \subset \bar{A}$，$\bar{B}$ 发生时 $\bar{A}$ 必发生，即 $A$ 不可能发生。
- **C 错**：$AB$ 发生意味着 $A$ 与 $B$ 同时发生，而 $A\bar{B}$ 要求 $A$ 发生且 $B$ 不发生，二者互斥（$A\bar{B} = \varnothing$ 因 $A \subset B$）。
- **D 错**：$A \subset B$ 只保证 $A \Rightarrow B$，不保证 $B \Rightarrow A$。例如 $A = \{1\}, B = \{1,2\}$，$B$ 发生未必 $A$ 发生。
:::

:::callout{kind=note label="知识卡片：事件包含关系与运算"}
| 关系 | 含义 | 等价表述 |
|------|------|----------|
| $A \subset B$ | $A$ 发生必导致 $B$ 发生 | $AB = A$，$A \cup B = B$ |
| $A \subset B$ | $\bar{B} \subset \bar{A}$ | 逆反关系 |
| $A\bar{B} = \varnothing$ | $A$ 与 $\bar{B}$ 互斥 | 等价于 $A \subset B$ |
| $A \cup B = B$ | 并集等于大事件 | 等价于 $A \subset B$ |
| 单向蕴含 | $A \subset B$ 不蕴含 $B \subset A$ | 包含关系非对称 |
:::

:::callout{kind=tip label="结论速记"}
$A \subset B \Rightarrow A \cup B = B$，故 $A \cup B$ 发生 $\Rightarrow B$ 发生；但反向不成立。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机事件 $A, B$ 满足 $P(AB) > 0$，则一定有（　　）

A. $P(A) < P(A \mid B)$　　B. $P(\bar{B} \mid AB) > 0$

C. $P(A \mid AB) = 1$　　D. $P(AB \mid A \cup B) < 1$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

在 $AB$ 已发生的条件下，$A$ 必然发生（因 $AB \subset A$），故：

$$P(A \mid AB) = \frac{P(A \cap AB)}{P(AB)} = \frac{P(AB)}{P(AB)} = 1$$

- **A 错**：不一定成立。例如 $A, B$ 独立时 $P(A \mid B) = P(A)$；又如 $A \subset B$ 时 $P(A \mid B) = P(A)/P(B) \geq P(A)$，但若 $B \subset A$ 则 $P(A \mid B) = 1 \geq P(A)$，方向不确定。
- **B 错**：$AB$ 已发生意味着 $B$ 已发生，故 $P(\bar{B} \mid AB) = 0$，而非 $>0$。
- **D 错**：若 $A = B$，则 $AB = A \cup B = A$，$P(AB \mid A \cup B) = 1$，不满足 $<1$。
:::

:::callout{kind=note label="知识卡片：条件概率的判定"}
| 情形 | 结论 |
|------|------|
| $C \subset D$ | $P(D \mid C) = 1$（$C$ 发生则 $D$ 必发生） |
| $CD = \varnothing$ | $P(D \mid C) = 0$ |
| $P(D \mid C) = \dfrac{P(CD)}{P(C)}$ | 定义式，要求 $P(C) > 0$ |
| $AB \subset A$ | $P(A \mid AB) = 1$ |
| $AB \subset B$ | $P(B \mid AB) = 1$ |
:::

:::callout{kind=tip label="结论速记"}
$AB \subset A \Rightarrow P(A \mid AB) = 1$；条件事件包含目标事件时条件概率必为 1。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $A, B, C$ 为三个随机事件，已知 $P(\bar{B}) = 0.4$，$P(B \mid A) = 0.6$，$P(C) = 1$，则下列结论错误的是（　　）

A. 事件 $A$ 与事件 $B$ 相互独立　　B. $P(\bar{B} \mid A) = 0.4$

C. 三事件 $A, B, C$ 相互独立　　D. 事件 $A \cup B$ 与事件 $C$ 不独立
:::

:::callout{kind=insight label="解析"}
**【答案】D**

由 $P(\bar{B}) = 0.4$ 得 $P(B) = 0.6$，又 $P(B \mid A) = 0.6 = P(B)$，故 $A, B$ 独立，A 正确。

于是 $P(\bar{B} \mid A) = 1 - P(B \mid A) = 1 - 0.6 = 0.4$，B 正确。

又 $P(C) = 1$，概率为 1 的事件与任意事件独立，且与已经独立的 $A, B$ 组成相互独立事件组，C 正确。

既然 $C$ 与 $A, B$ 均独立，$C$ 与 $A \cup B$ 也独立（独立事件经并、交、补运算后仍保持独立性），故 D 错误。

- **A 正确**：$P(B \mid A) = P(B)$ 是独立的定义。
- **B 正确**：$P(\bar{B} \mid A) = 1 - P(B \mid A) = 0.4$。
- **C 正确**：$P(C)=1$ 的事件与任何事件独立，三事件相互独立。
:::

:::callout{kind=note label="知识卡片：概率为0或1的事件与独立性"}
| 性质 | 表述 |
|------|------|
| $P(C)=1$ | $C$ 与任意事件 $D$ 独立（因 $P(CD)=P(D)=P(C)P(D)$） |
| $P(C)=0$ | $C$ 与任意事件 $D$ 独立（因 $P(CD)=0=P(C)P(D)$） |
| 独立传递 | $A,B$ 独立且 $B,C$ 独立，再加 $A,C$ 独立才得三事件相互独立 |
| 独立运算 | $A,B$ 独立 $\Rightarrow$ $A$ 与 $B$ 的函数（并、交、补）仍独立 |
| 相互独立 | 两两独立 + 三者独立 = 相互独立（更高阶同理） |
:::

:::callout{kind=tip label="结论速记"}
$P(C)=1$ 的事件与任何事件独立；独立事件的并、交、补保持独立性，故 $A\cup B$ 与 $C$ 仍独立。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X \sim P(1)$，$Y \sim E(1)$，其分布函数分别为 $F_X(x), F_Y(y)$，则（　　）

A. $F_X(x), F_Y(y)$ 都是连续函数　　B. $F_X\!\left(\dfrac{3}{2}\right) = 0$

C. $EX \neq EY$　　D. $F_Y(1) = 1 - e^{-1}$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

- $X \sim P(1)$（泊松分布）是离散型，$F_X(x)$ 在非负整数处有跳跃，不是连续函数，A 错。
- $F_X\!\left(\dfrac{3}{2}\right) = P(X \leq \tfrac{3}{2}) = P(X \leq 1) = P(X=0) + P(X=1) = e^{-1} + e^{-1} = 2e^{-1} \neq 0$，B 错。
- $EX = 1$（泊松 $P(1)$ 的均值），$EY = \dfrac{1}{\lambda} = 1$（指数 $E(1)$ 的均值），$EX = EY$，C 错。
- $Y \sim E(1)$ 的分布函数 $F_Y(y) = 1 - e^{-y}$（$y \geq 0$），故 $F_Y(1) = 1 - e^{-1}$，D 正确。
:::

:::callout{kind=note label="知识卡片：泊松分布与指数分布对比"}
| 分布 | 记号 | 类型 | 均值 $E$ | 方差 $D$ | 分布函数 |
|------|------|------|----------|----------|----------|
| 泊松分布 | $P(\lambda)$ | 离散 | $\lambda$ | $\lambda$ | 阶梯型，有跳跃 |
| 指数分布 | $E(\lambda)$ | 连续 | $\dfrac{1}{\lambda}$ | $\dfrac{1}{\lambda^2}$ | $F(y)=1-e^{-\lambda y}$，$y\geq 0$ |
| 本题 | $X \sim P(1)$, $Y \sim E(1)$ | — | $EX=EY=1$ | $DX=1$, $DY=1$ | $F_X$ 不连续，$F_Y$ 连续 |
| $P(X=k)$ | $\dfrac{\lambda^k e^{-\lambda}}{k!}$ | — | — | — | $k=0,1,2,\ldots$ |
:::

:::callout{kind=tip label="结论速记"}
泊松 $P(1)$ 与指数 $E(1)$ 均值都为 1，但前者离散（分布函数有跳跃）、后者连续；$E(1)$ 的 $F_Y(1)=1-e^{-1}$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
已知随机变量 $X \sim B(6, p)$ 且 $EX = 4.8$，则下列结论错误的是（　　）

A. $p = 0.8$　　B. $P\{X = 5\} = \max\limits_{1 \leq k \leq 6} P\{X = k\}$

C. $D(2X) = 1.92$　　D. $D(X+6) = 0.96$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

由 $EX = 6p = 4.8$ 得 $p = 0.8$，A 正确。

二项分布 $B(n, p)$ 的众数（最可能值）为 $\lfloor (n+1)p \rfloor$：

$$\lfloor (6+1) \times 0.8 \rfloor = \lfloor 5.6 \rfloor = 5$$

故 $P\{X=5\}$ 最大，B 正确。

$$DX = np(1-p) = 6 \times 0.8 \times 0.2 = 0.96$$

由方差性质 $D(aX+b) = a^2 DX$：

$$D(2X) = 4 \cdot DX = 4 \times 0.96 = 3.84 \neq 1.92$$

故 C 错误。

$$D(X+6) = DX = 0.96$$

D 正确（常数平移不影响方差）。
:::

:::callout{kind=note label="知识卡片：二项分布的性质"}
| 性质 | 公式 |
|------|------|
| 均值 | $EX = np$ |
| 方差 | $DX = np(1-p)$ |
| 众数 | $\lfloor (n+1)p \rfloor$（取整数部分） |
| $D(aX+b)$ | $a^2 DX$（平移不变，缩放平方） |
| $D(X+b)$ | $DX$（加常数方差不变） |
| 本题 | $n=6, p=0.8, EX=4.8, DX=0.96$, 众数 5 |
:::

:::callout{kind=tip label="结论速记"}
$D(aX+b) = a^2 DX$：缩放系数平方、平移归零。$D(2X)=4DX=3.84$，$D(X+6)=DX=0.96$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 服从区域 $G = \{(x, y) \mid x + y \leq 1, 0 \leq x \leq 1, 0 \leq y\}$ 上的均匀分布，其联合分布函数为 $F(x, y)$，则下列结论错误的是（　　）

A. $F\!\left(\dfrac{1}{2}, 1\right) = \dfrac{3}{4}$　　B. $X \sim U(0, 1)$

C. $EX = EY$　　D. $P\{X > Y\} = \dfrac{1}{2}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

三角形区域 $G$ 面积为 $\dfrac{1}{2}$，故联合密度 $f(x,y) = 2$（在 $G$ 内）。

**A**：因 $y \leq 1$ 且 $G$ 中 $y \leq 1-x \leq 1$，$F\!\left(\tfrac{1}{2}, 1\right) = P\!\left(X \leq \tfrac{1}{2}\right)$：

$$F\!\left(\tfrac{1}{2}, 1\right) = \int_0^{1/2} \int_0^{1-x} 2\, dy\, dx = \int_0^{1/2} 2(1-x)\, dx = 2\left[x - \tfrac{x^2}{2}\right]_0^{1/2} = 2 \cdot \tfrac{3}{8} = \tfrac{3}{4}$$

A 正确。

**B**：$X$ 的边缘密度：

$$f_X(x) = \int_0^{1-x} 2\, dy = 2(1-x), \quad 0 \leq x \leq 1$$

这是三角分布而非均匀分布 $U(0,1)$（均匀分布密度应为常数 1），B 错误。

**C**：区域关于 $x = y$ 对称，故 $EX = EY$，C 正确。

**D**：由对称性 $P(X > Y) = P(Y > X) = \dfrac{1}{2}$（$P(X=Y)=0$），D 正确。
:::

:::callout{kind=note label="知识卡片：二维均匀分布的边缘与对称性"}
| 项目 | 公式 / 结论 |
|------|--------------|
| 联合密度 | $f(x,y) = \dfrac{1}{\text{Area}(G)}$，在 $G$ 内 |
| 边缘密度 | $f_X(x) = \int f(x,y)\, dy$（一般不再是均匀分布） |
| 对称区域 | $G$ 关于 $x=y$ 对称 $\Rightarrow EX=EY$, $P(X>Y)=\tfrac{1}{2}$ |
| 三角形 $x+y\leq1$ | 面积 $\tfrac{1}{2}$，$f_X(x)=2(1-x)$（线性递减） |
| 易错点 | 均匀分布的边缘未必均匀；只有矩形区域边缘才均匀 |
:::

:::callout{kind=tip label="结论速记"}
二维均匀分布在三角形区域上，边缘密度 $f_X(x)=2(1-x)$ 非常数，故 $X$ 不是 $U(0,1)$；但对称性保证 $EX=EY$ 且 $P(X>Y)=\tfrac{1}{2}$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设离散型随机变量 $X$ 的分布列为 $P\{X = -1\} = \dfrac{1}{2}$，$P\{X = 1\} = \dfrac{1}{2}$；随机变量 $Y \sim N(0, 1)$ 且与 $X$ 相互独立；令 $Z = XY$，则下列结论错误的是（　　）

A. 随机变量 $Z$ 既非离散型也非连续型　　B. $D(X+Y) = 2$

C. $Z \sim N(0, 1)$　　D. $XZ \sim N(0, 1)$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

因 $X = \pm 1$，$Z = XY$ 与 $Y$ 同分布：

- 当 $X = 1$（概率 $\tfrac{1}{2}$）时 $Z = Y \sim N(0,1)$；
- 当 $X = -1$（概率 $\tfrac{1}{2}$）时 $Z = -Y$，由于 $Y \sim N(0,1)$ 对称，$-Y \sim N(0,1)$。

故 $Z \sim N(0,1)$，是连续型随机变量，A 错误。

**B**：$X, Y$ 独立，$D(X+Y) = DX + DY = 1 + 1 = 2$，B 正确。

**C**：如上所述 $Z \sim N(0,1)$，C 正确。

**D**：$XZ = X \cdot (XY) = X^2 Y = Y$（因 $X^2 = 1$ 恒成立），故 $XZ \sim N(0,1)$，D 正确。
:::

:::callout{kind=note label="知识卡片：对称随机变量的乘积分布"}
| 情形 | 结论 |
|------|------|
| $X=\pm1$ 等概率，$Y$ 对称分布 | $XY$ 与 $Y$ 同分布 |
| $Y \sim N(0,1)$ | $-Y \sim N(0,1)$（标准正态关于 0 对称） |
| $X^2 = 1$ | $X \cdot (XY) = X^2 Y = Y$ |
| 独立方差可加 | $D(X+Y) = DX + DY$（独立时） |
| 离散×连续 | 结果通常为连续型（本题 $Z \sim N(0,1)$） |
:::

:::callout{kind=tip label="结论速记"}
$X=\pm1$ 等概率且 $Y$ 关于 0 对称 $\Rightarrow XY$ 与 $Y$ 同分布；$X^2=1$ 使 $XZ=Y$ 保持原分布。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y) \sim N(0, 2, 1, 1, \tfrac{3}{4})$，则下列结论错误的是（　　）

A. $Y \sim N(2, 1)$　　B. $\rho_{XY} = \dfrac{3}{4}$

C. $E(XY) = \dfrac{3}{4}$　　D. $D(X+Y) = \dfrac{11}{4}$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

二维正态分布 $N(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho)$ 的参数：$\mu_X = 0$，$\mu_Y = 2$，$\sigma_X^2 = 1$，$\sigma_Y^2 = 1$，$\rho = \tfrac{3}{4}$。

**A**：$Y \sim N(\mu_Y, \sigma_Y^2) = N(2, 1)$，A 正确。

**B**：$\rho_{XY} = \tfrac{3}{4}$，B 正确。

**C**：由协方差分解：

$$E(XY) = \text{Cov}(X,Y) + EX \cdot EY = \rho \sigma_X \sigma_Y + 0 \times 2 = \tfrac{3}{4} \times 1 \times 1 = \tfrac{3}{4}$$

C 正确。

**D**：

$$D(X+Y) = DX + DY + 2\,\text{Cov}(X,Y) = 1 + 1 + 2 \times \tfrac{3}{4} = 2 + \tfrac{3}{2} = \tfrac{7}{2} = \tfrac{14}{4} \neq \tfrac{11}{4}$$

D 错误。
:::

:::callout{kind=note label="知识卡片：二维正态分布的参数与运算"}
| 项目 | 公式 |
|------|------|
| 记号 | $(X,Y) \sim N(\mu_X, \mu_Y, \sigma_X^2, \sigma_Y^2, \rho)$ |
| 边缘 | $X \sim N(\mu_X, \sigma_X^2)$，$Y \sim N(\mu_Y, \sigma_Y^2)$ |
| 协方差 | $\text{Cov}(X,Y) = \rho \sigma_X \sigma_Y$ |
| $E(XY)$ | $\text{Cov}(X,Y) + \mu_X \mu_Y$ |
| $D(X \pm Y)$ | $DX + DY \pm 2\,\text{Cov}(X,Y)$ |
| $D(X+Y)$ 本题 | $1+1+2 \times \tfrac{3}{4} = \tfrac{7}{2}$ |
| 独立 $\Leftrightarrow$ | $\rho = 0$（二维正态特有） |
:::

:::callout{kind=tip label="结论速记"}
$D(X \pm Y) = DX + DY \pm 2\,\text{Cov}(X,Y)$；本题 $D(X+Y) = 1+1+2 \times \tfrac{3}{4} = \tfrac{7}{2}$，不是 $\tfrac{11}{4}$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
$(X_1, X_2, \cdots, X_n)^T$ 是来自总体 $X \sim N(1, 4)$ 的独立同分布样本，$\Phi(x)$ 为标准正态分布函数，则（　　）

A. $X_1, X_2, \cdots, X_n$ 不相互独立　　B. $X_1, X_2$ 分布不相同

C. $X_1 - 2X_2 \sim N(-1, 20)$　　D. $P\{X_3 < 3\} = \Phi\!\left(\dfrac{1}{2}\right)$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

样本为独立同分布，故 $X_1, \ldots, X_n$ 相互独立且同分布 $N(1, 4)$，A、B 均错。

**C**：独立正态变量的线性组合仍为正态：

$$E(X_1 - 2X_2) = 1 - 2 \times 1 = -1$$

$$D(X_1 - 2X_2) = DX_1 + 4\,DX_2 = 4 + 4 \times 4 = 4 + 16 = 20$$

故 $X_1 - 2X_2 \sim N(-1, 20)$，C 正确。

**D**：

$$P\{X_3 < 3\} = P\!\left\{\frac{X_3 - 1}{2} < \frac{3-1}{2}\right\} = P\!\left\{Z < 1\right\} = \Phi(1)$$

而非 $\Phi\!\left(\tfrac{1}{2}\right)$，D 错。
:::

:::callout{kind=note label="知识卡片：正态样本的线性组合"}
| 性质 | 公式 |
|------|------|
| 样本独立同分布 | $X_i \stackrel{\text{iid}}{\sim} N(\mu, \sigma^2)$ |
| 线性组合 | $\sum a_i X_i \sim N\!\left(\sum a_i \mu,\, \sum a_i^2 \sigma^2\right)$ |
| 标准化 | $P\{X < c\} = \Phi\!\left(\dfrac{c-\mu}{\sigma}\right)$ |
| 本题参数 | $\mu=1, \sigma=2$ |
| $X_1 - 2X_2$ | 均值 $1-2=-1$，方差 $4+4 \times 4=20$ |
| $P(X_3<3)$ | $\Phi\!\left(\dfrac{3-1}{2}\right) = \Phi(1)$ |
:::

:::callout{kind=tip label="结论速记"}
独立正态线性组合仍正态：$D(aX_1+bX_2) = a^2\sigma_1^2 + b^2\sigma_2^2$；标准化 $P\{X<c\}=\Phi\!\left(\dfrac{c-\mu}{\sigma}\right)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \cdots, X_n)$ 是来自总体 $X \sim N(0, 4)$ 的独立同分布样本，则（　　）

A. $\dfrac{X_1^2 + X_2^2}{2} \sim \chi^2(2)$　　B. $\dfrac{X_1 + X_2}{\sqrt{X_3^2 + X_4^2}} \sim t(2)$

C. $\dfrac{X_1^2 + X_2^2}{X_3^2 + X_4^2} \sim F(2, 1)$　　D. $P\!\left\{\dfrac{X_1 + X_2}{|X_1 - X_2|} < 0\right\} > \dfrac{1}{2}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

因 $X_i \sim N(0, 4)$，故 $\dfrac{X_i}{2} \sim N(0, 1)$，$\dfrac{X_i^2}{4} \sim \chi^2(1)$。

**A**：

$$\frac{X_1^2 + X_2^2}{2} = \frac{4\!\left[\left(\tfrac{X_1}{2}\right)^2 + \left(\tfrac{X_2}{2}\right)^2\right]}{2} = 2\,\chi^2(2)$$

这是 $2\,\chi^2(2)$ 而非 $\chi^2(2)$，A 错。

**B**：记 $Z_i = \dfrac{X_i}{2} \sim N(0,1)$。

- 分子：$X_1 + X_2 = 2(Z_1 + Z_2)$，其中 $Z_1 + Z_2 \sim N(0, 2)$，故 $\dfrac{X_1+X_2}{\sqrt{8}} = \dfrac{Z_1+Z_2}{\sqrt{2}} \sim N(0,1)$，记为 $Z$。
- 分母：$X_3^2 + X_4^2 = 4(Z_3^2 + Z_4^2) = 4\,\chi^2(2)$，故 $\sqrt{X_3^2 + X_4^2} = 2\sqrt{\chi^2(2)}$。
- 比值：

$$\frac{X_1 + X_2}{\sqrt{X_3^2 + X_4^2}} = \frac{2\sqrt{2}\, Z}{2\sqrt{\chi^2(2)}} = \frac{\sqrt{2}\, Z}{\sqrt{\chi^2(2)}} = \frac{Z}{\sqrt{\chi^2(2)/2}} \sim t(2)$$

B 正确。

**C**：

$$\frac{X_1^2 + X_2^2}{X_3^2 + X_4^2} = \frac{4\,\chi^2(2)}{4\,\chi^2(2)} = \frac{\chi^2(2)/2}{\chi^2(2)/2} \sim F(2, 2)$$

分母自由度应为 2，而非 1，C 错。

**D**：$\dfrac{X_1+X_2}{X_1-X_2}$ 的分布关于 0 对称（因 $(X_1+X_2)$ 与 $(X_1-X_2)$ 独立且都服从对称的正态分布），故 $P\!\left\{\dfrac{X_1+X_2}{|X_1-X_2|} < 0\right\} = \dfrac{1}{2}$，不满足 $> \dfrac{1}{2}$，D 错。
:::

:::callout{kind=note label="知识卡片：三大抽样分布的构造"}
| 分布 | 构造方式 | 自由度 |
|------|----------|--------|
| $\chi^2(n)$ | $\sum_{i=1}^n Z_i^2$，$Z_i \sim N(0,1)$ 独立 | $n$ |
| $t(n)$ | $\dfrac{Z}{\sqrt{\chi^2(n)/n}}$，$Z \perp \chi^2(n)$ | $n$ |
| $F(n_1, n_2)$ | $\dfrac{\chi^2(n_1)/n_1}{\chi^2(n_2)/n_2}$，二者独立 | $(n_1, n_2)$ |
| 本题关键 | $X_i \sim N(0,4) \Rightarrow X_i/2 \sim N(0,1)$ | — |
| 缩放注意 | $X_i^2 = 4 Z_i^2$，不能直接当 $\chi^2$ | — |
:::

:::callout{kind=tip label="结论速记"}
$N(0,4)$ 样本需先除 $\sigma=2$ 化为标准正态；$t(n) = \dfrac{Z}{\sqrt{\chi^2(n)/n}}$，$F(n_1,n_2) = \dfrac{\chi^2(n_1)/n_1}{\chi^2(n_2)/n_2}$。
:::

---

## 二、填空题（每空 3 分，共 12 分）

> 注：$\Phi(1) = 0.841$，$\Phi(2) = 0.977$；其中 $\Phi(x)$ 为标准正态变量的分布函数。

### 第1题

:::callout{kind=note label="题目"}
已知 $P(A) = \dfrac{1}{2}$，$P(B) = \dfrac{11}{24}$，$P(A\bar{B} \cup \bar{A}B) = \dfrac{7}{24}$，则 $P(B \mid A) =$ ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$\dfrac{2}{3}$**

$A\bar{B} \cup \bar{A}B = A \triangle B$（对称差），由：

$$P(A \triangle B) = P(A) + P(B) - 2P(AB)$$

代入：

$$\frac{7}{24} = \frac{1}{2} + \frac{11}{24} - 2P(AB) = \frac{12}{24} + \frac{11}{24} - 2P(AB) = \frac{23}{24} - 2P(AB)$$

$$2P(AB) = \frac{23}{24} - \frac{7}{24} = \frac{16}{24} = \frac{2}{3} \quad \Rightarrow \quad P(AB) = \frac{1}{3}$$

故：

$$P(B \mid A) = \frac{P(AB)}{P(A)} = \frac{\tfrac{1}{3}}{\tfrac{1}{2}} = \frac{2}{3}$$
:::

:::callout{kind=note label="知识卡片：对称差与条件概率"}
| 名称 | 公式 |
|------|------|
| 对称差 | $A \triangle B = A\bar{B} \cup \bar{A}B = (A \setminus B) \cup (B \setminus A)$ |
| 对称差概率 | $P(A \triangle B) = P(A) + P(B) - 2P(AB)$ |
| 条件概率 | $P(B \mid A) = \dfrac{P(AB)}{P(A)}$，$P(A) > 0$ |
| 容斥原理 | $P(A \cup B) = P(A) + P(B) - P(AB)$ |
| 推论 | 已知 $P(A), P(B), P(A \triangle B) \Rightarrow$ 可解 $P(AB)$ |
:::

:::callout{kind=tip label="结论速记"}
$P(A \triangle B) = P(A)+P(B)-2P(AB) \Rightarrow P(AB) = \tfrac{P(A)+P(B)-P(A\triangle B)}{2}$，再代入 $P(B \mid A) = \tfrac{P(AB)}{P(A)}$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(\lambda)$，令 $Y = 1 - e^{-\lambda X}$；$F_Y(y)$ 为随机变量 $Y$ 的分布函数，则 $F_Y\!\left(\dfrac{1}{2}\right) =$ ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$\dfrac{1}{2}$**

$X \sim E(\lambda)$ 的分布函数 $F_X(x) = 1 - e^{-\lambda x}$（$x \geq 0$）。

由于 $X \geq 0$，有 $e^{-\lambda X} \in (0, 1]$，故 $Y = 1 - e^{-\lambda X} \in [0, 1)$。

$$F_Y(y) = P\{Y \leq y\} = P\{1 - e^{-\lambda X} \leq y\} = P\{e^{-\lambda X} \geq 1 - y\}$$

$$= P\{-\lambda X \geq \ln(1-y)\} = P\!\left\{X \leq -\frac{\ln(1-y)}{\lambda}\right\} = F_X\!\left(-\frac{\ln(1-y)}{\lambda}\right)$$

$$= 1 - e^{-\lambda \cdot \left(-\tfrac{\ln(1-y)}{\lambda}\right)} = 1 - e^{\ln(1-y)} = 1 - (1-y) = y$$

故 $Y \sim U(0, 1)$，$F_Y\!\left(\tfrac{1}{2}\right) = \dfrac{1}{2}$。

**注**：这是概率积分变换（Probability Integral Transform）的典型例子——连续随机变量 $X$ 经其 own CDF 变换后必服从 $U(0,1)$。
:::

:::callout{kind=note label="知识卡片：概率积分变换"}
| 项目 | 内容 |
|------|------|
| 变换 | $Y = F_X(X)$，其中 $F_X$ 为 $X$ 的分布函数 |
| 结论 | $Y \sim U(0, 1)$（$X$ 为连续型时） |
| 本题 | $Y = 1 - e^{-\lambda X} = F_X(X)$（指数分布 CDF） |
| 推论 | $F_Y(y) = y$，$0 \leq y \leq 1$ |
| 应用 | 生成均匀随机数、逆变换法抽样 |
| 反函数法 | $X = F_X^{-1}(U)$，$U \sim U(0,1)$ 可生成 $X$ |
:::

:::callout{kind=tip label="结论速记"}
$Y = F_X(X) \sim U(0,1)$；指数分布 CDF 代入自身得 $Y=1-e^{-\lambda X}$，故 $F_Y(\tfrac12)=\tfrac12$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
为获得某物理量 $\mu$ 的值，对该物理量做了 $n$ 次重复独立的测量，假定每次测量的值 $X_i \sim N(\mu, 2)$，现以测量的平均值 $\bar{X}$ 作为该物理量 $\mu$ 的估计值，为使得 $P\!\left\{|\bar{X} - \mu| \leq 0.5\right\} \geq 0.954$ 成立，则至少应该测量的次数为 ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$n \geq 32$，即至少 32 次**

由 $X_i \sim N(\mu, 2)$ 独立，样本均值：

$$\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i \sim N\!\left(\mu, \frac{2}{n}\right)$$

标准化：

$$Z = \frac{\bar{X} - \mu}{\sqrt{2/n}} \sim N(0, 1)$$

要求：

$$P\{|\bar{X} - \mu| \leq 0.5\} = P\!\left\{|Z| \leq \frac{0.5}{\sqrt{2/n}}\right\} \geq 0.954$$

由 $0.954 = 2\Phi(2) - 1$（题给 $\Phi(2) = 0.977$），需：

$$\frac{0.5}{\sqrt{2/n}} \geq 2 \quad \Rightarrow \quad \sqrt{\frac{n}{2}} \geq \frac{2}{0.5} = 4$$

$$\frac{n}{2} \geq 16 \quad \Rightarrow \quad n \geq 32$$

故至少测量 32 次。
:::

:::callout{kind=note label="知识卡片：样本均值的分布与精度控制"}
| 项目 | 公式 |
|------|------|
| 样本均值分布 | $\bar{X} \sim N\!\left(\mu, \dfrac{\sigma^2}{n}\right)$ |
| 标准化 | $Z = \dfrac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim N(0,1)$ |
| $3\sigma$ 准则 | $P(|Z| \leq 2) \approx 0.954$，$P(|Z| \leq 3) \approx 0.997$ |
| 精度公式 | $P(|\bar{X}-\mu| \leq d) \geq 1-\alpha \Rightarrow n \geq \left(\dfrac{z_{\alpha/2}\,\sigma}{d}\right)^2$ |
| 本题 | $\sigma^2=2$，$d=0.5$，$z_{\alpha/2}=2$ $\Rightarrow n \geq \left(\tfrac{2\sqrt{2}}{0.5}\right)^2 = 32$ |
:::

:::callout{kind=tip label="结论速记"}
$\bar{X} \sim N(\mu, \sigma^2/n)$，要求 $P(|\bar{X}-\mu|\leq d) \geq 0.954 \Rightarrow \dfrac{d}{\sigma/\sqrt{n}} \geq 2 \Rightarrow n \geq \left(\dfrac{2\sigma}{d}\right)^2$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设某大学的学生中，每节课中戳手机的次数 $X \sim P(4)$，现从该校随机抽取一个大班，共 100 名学生，估算他们在一节课中戳手机的总次数超过 440 次的概率约为 ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$0.023$**

设第 $i$ 名学生一节课戳手机次数为 $X_i \sim P(4)$（独立），总次数 $S = \sum_{i=1}^{100} X_i$。

由泊松分布可加性，$S \sim P(400)$，其均值与方差均为 $E(S) = D(S) = 400$。

由**中心极限定理**，$n=100$ 较大时：

$$S \overset{\text{approx}}{\sim} N(400, 400)$$

标准化：

$$P\{S > 440\} \approx P\!\left\{Z > \frac{440 - 400}{\sqrt{400}}\right\} = P\{Z > 2\} = 1 - \Phi(2)$$

由题给 $\Phi(2) = 0.977$：

$$P\{S > 440\} \approx 1 - 0.977 = 0.023$$
:::

:::callout{kind=note label="知识卡片：泊松分布可加性与中心极限定理"}
| 性质 | 公式 |
|------|------|
| 泊松可加 | $X_i \sim P(\lambda_i)$ 独立 $\Rightarrow \sum X_i \sim P(\sum \lambda_i)$ |
| 本题 | $S = \sum_{i=1}^{100} X_i \sim P(400)$ |
| 均值方差 | $ES = DS = 400$ |
| 中心极限定理 | $\sum X_i \overset{\text{approx}}{\sim} N(n\mu, n\sigma^2)$（$n$ 大时） |
| 标准化 | $Z = \dfrac{S - \mu}{\sigma} \sim N(0,1)$ |
| 计算结果 | $P(S > 440) = 1 - \Phi(2) = 0.023$ |
:::

:::callout{kind=tip label="结论速记"}
100 个独立 $P(4)$ 之和 $\sim P(400) \approx N(400, 400)$，$P(S>440) = 1-\Phi(2) = 0.023$。
:::

---

## 三、计算题

### 第三题

:::callout{kind=note label="题目"}
设有甲、乙、丙三个不透明的箱子，每个箱中分别装有除颜色不同外其它都相同的 5 个球，其中：甲箱装 3 黄 2 黑，乙箱装 4 红 1 白，丙箱装 2 红 3 白。摸球规则如下：先从甲箱摸出两球，如果从甲箱中摸出两球颜色相同，则从乙箱中摸出一球放入丙箱，再从丙箱摸出两球；如果从甲箱中摸出两球颜色相异，则从丙箱摸出一球放入乙箱，再从乙箱摸出两球。试求：

（1）最后摸出两球颜色相同的概率？

（2）已知最后摸出的两球颜色相同，求从甲箱中摸出的两球颜色不同的概率？
:::

:::callout{kind=insight label="解析"}
**【解】**

记 $A$ = "甲箱摸出两球同色"，$\bar{A}$ = "甲箱摸出两球异色"，$B$ = "最后摸出两球同色"。

**第一步：计算甲箱情形概率**

甲箱 3 黄 2 黑共 5 球，取 2 球：

$$P(A) = \frac{\binom{3}{2} + \binom{2}{2}}{\binom{5}{2}} = \frac{3 + 1}{10} = \frac{4}{10} = \frac{2}{5}$$

$$P(\bar{A}) = 1 - \frac{2}{5} = \frac{3}{5}$$

**第二步：计算 $P(B \mid A)$**

$A$ 发生时：从乙箱（4 红 1 白）摸 1 球放入丙箱，丙箱变为 6 球后再摸 2 球。

- 乙箱摸出红球（概率 $\tfrac{4}{5}$）：丙箱变 3 红 3 白

$$P(B \mid \text{红入丙}) = \frac{\binom{3}{2} + \binom{3}{2}}{\binom{6}{2}} = \frac{3+3}{15} = \frac{6}{15} = \frac{2}{5}$$

- 乙箱摸出白球（概率 $\tfrac{1}{5}$）：丙箱变 2 红 4 白

$$P(B \mid \text{白入丙}) = \frac{\binom{2}{2} + \binom{4}{2}}{\binom{6}{2}} = \frac{1+6}{15} = \frac{7}{15}$$

$$P(B \mid A) = \frac{4}{5} \times \frac{2}{5} + \frac{1}{5} \times \frac{7}{15} = \frac{8}{25} + \frac{7}{75} = \frac{24}{75} + \frac{7}{75} = \frac{31}{75}$$

**第三步：计算 $P(B \mid \bar{A})$**

$\bar{A}$ 发生时：从丙箱（2 红 3 白）摸 1 球放入乙箱，乙箱变为 6 球后再摸 2 球。

- 丙箱摸出红球（概率 $\tfrac{2}{5}$）：乙箱变 5 红 1 白

$$P(B \mid \text{红入乙}) = \frac{\binom{5}{2} + \binom{1}{2}}{\binom{6}{2}} = \frac{10+0}{15} = \frac{10}{15} = \frac{2}{3}$$

- 丙箱摸出白球（概率 $\tfrac{3}{5}$）：乙箱变 4 红 2 白

$$P(B \mid \text{白入乙}) = \frac{\binom{4}{2} + \binom{2}{2}}{\binom{6}{2}} = \frac{6+1}{15} = \frac{7}{15}$$

$$P(B \mid \bar{A}) = \frac{2}{5} \times \frac{2}{3} + \frac{3}{5} \times \frac{7}{15} = \frac{4}{15} + \frac{21}{75} = \frac{20}{75} + \frac{21}{75} = \frac{41}{75}$$

**第四步：全概率公式**

$$P(B) = P(A) \cdot P(B \mid A) + P(\bar{A}) \cdot P(B \mid \bar{A}) = \frac{2}{5} \times \frac{31}{75} + \frac{3}{5} \times \frac{41}{75} = \frac{62}{375} + \frac{123}{375} = \frac{185}{375} = \frac{37}{75}$$

**第五步：贝叶斯公式**

$$P(\bar{A} \mid B) = \frac{P(\bar{A}) \cdot P(B \mid \bar{A})}{P(B)} = \frac{\tfrac{3}{5} \times \tfrac{41}{75}}{\tfrac{37}{75}} = \frac{\tfrac{123}{375}}{\tfrac{37}{75}} = \frac{123}{375} \times \frac{75}{37} = \frac{123}{5 \times 37} = \frac{123}{185}$$

**答案**：$P(B) = \dfrac{37}{75}$，$P(\text{甲箱异色} \mid B) = \dfrac{123}{185}$。
:::

:::callout{kind=note label="知识卡片：全概率公式与贝叶斯公式"}
| 公式 | 表述 |
|------|------|
| 全概率 | $P(B) = \sum_i P(A_i) P(B \mid A_i)$，$\{A_i\}$ 为完备事件组 |
| 贝叶斯 | $P(A_i \mid B) = \dfrac{P(A_i) P(B \mid A_i)}{P(B)}$ |
| 组合数 | $\dbinom{n}{k} = \dfrac{n!}{k!(n-k)!}$ |
| 古典概率 | $P = \dfrac{\text{有利情形}}{\text{总情形}}$ |
| 解题步骤 | 1) 划分完备事件组；2) 算各支概率；3) 全概率合并；4) 贝叶斯求后验 |
:::

:::callout{kind=tip label="结论速记"}
"先分情形（同色/异色）→ 各情形算条件概率 → 全概率合并 → 贝叶斯反求后验"；本题 $P(B)=\tfrac{37}{75}$，$P(\bar{A}\mid B)=\tfrac{123}{185}$。
:::

---

### 第四题

:::callout{kind=note label="题目"}
设二维随机变量 $(X, Y)$ 的联合概率分布密度函数为

$$f(x, y) = \begin{cases} A\cos(x+y), & 0 \leq x \leq \dfrac{\pi}{4},\ 0 \leq y \leq \dfrac{\pi}{4} \\ 0, & \text{其他} \end{cases}$$

（1）求常数 $A$；（2）求 $Z = X + Y$ 的概率密度函数。
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）求 $A$**

由归一化条件 $\iint f(x,y)\, dx\, dy = 1$：

$$A \int_0^{\pi/4} \int_0^{\pi/4} \cos(x+y)\, dy\, dx = 1$$

先算内层积分（对 $y$）：

$$\int_0^{\pi/4} \cos(x+y)\, dy = \big[\sin(x+y)\big]_{y=0}^{y=\pi/4} = \sin\!\left(x+\tfrac{\pi}{4}\right) - \sin x$$

再算外层积分（对 $x$）：

$$\int_0^{\pi/4} \left[\sin\!\left(x+\tfrac{\pi}{4}\right) - \sin x\right] dx = \left[-\cos\!\left(x+\tfrac{\pi}{4}\right) + \cos x\right]_0^{\pi/4}$$

$$= \left[-\cos\!\left(\tfrac{\pi}{2}\right) + \cos\!\left(\tfrac{\pi}{4}\right)\right] - \left[-\cos\!\left(\tfrac{\pi}{4}\right) + \cos 0\right]$$

$$= \left[0 + \tfrac{\sqrt{2}}{2}\right] - \left[-\tfrac{\sqrt{2}}{2} + 1\right] = \tfrac{\sqrt{2}}{2} + \tfrac{\sqrt{2}}{2} - 1 = \sqrt{2} - 1$$

故 $A(\sqrt{2}-1) = 1$，即：

$$A = \frac{1}{\sqrt{2}-1} = \sqrt{2}+1$$

**（2）求 $Z = X+Y$ 的密度**

$Z$ 的取值范围 $[0, \tfrac{\pi}{2}]$。用卷积公式 $f_Z(z) = \int f(x, z-x)\, dx$，需 $0 \leq x \leq \tfrac{\pi}{4}$ 且 $0 \leq z-x \leq \tfrac{\pi}{4}$，即 $\max(0, z-\tfrac{\pi}{4}) \leq x \leq \min(\tfrac{\pi}{4}, z)$。

- **当 $0 \leq z \leq \tfrac{\pi}{4}$**：$x \in [0, z]$，被积函数 $A\cos z$：

$$f_Z(z) = \int_0^z A\cos z\, dx = A z \cos z = (\sqrt{2}+1)\, z \cos z$$

- **当 $\tfrac{\pi}{4} < z \leq \tfrac{\pi}{2}$**：$x \in [z - \tfrac{\pi}{4}, \tfrac{\pi}{4}]$，区间长度 $\tfrac{\pi}{2} - z$：

$$f_Z(z) = \int_{z-\pi/4}^{\pi/4} A\cos z\, dx = A\cos z \cdot \left(\tfrac{\pi}{4} - \left(z - \tfrac{\pi}{4}\right)\right) = (\sqrt{2}+1)\left(\tfrac{\pi}{2} - z\right) \cos z$$

合并：

$$f_Z(z) = \begin{cases} (\sqrt{2}+1)\, z \cos z, & 0 \leq z < \dfrac{\pi}{4} \\[6pt] (\sqrt{2}+1)\left(\dfrac{\pi}{2} - z\right) \cos z, & \dfrac{\pi}{4} \leq z \leq \dfrac{\pi}{2} \\[6pt] 0, & \text{其他} \end{cases}$$

**答案**：$A = \sqrt{2}+1$，$f_Z(z)$ 如上。
:::

:::callout{kind=note label="知识卡片：联合密度的归一化与卷积"}
| 步骤 | 公式 |
|------|------|
| 归一化 | $\iint f\, dxdy = 1$ 解出常数 $A$ |
| 卷积公式 | $f_Z(z) = \int_{-\infty}^{+\infty} f(x, z-x)\, dx$ |
| 积分限 | 由 $0 \leq x \leq \tfrac{\pi}{4}$ 与 $0 \leq z-x \leq \tfrac{\pi}{4}$ 联立确定 |
| 分段 | $z$ 在不同区间，$x$ 的积分限不同 |
| 有理化解 | $\dfrac{1}{\sqrt{2}-1} = \sqrt{2}+1$（分母有理化） |
| 三角恒等 | $\cos(x+y)$ 对 $y$ 积分得 $\sin(x+y)$ |
:::

:::callout{kind=tip label="结论速记"}
归一化得 $A=\sqrt{2}+1$；卷积按 $z$ 分两段（$[0,\tfrac{\pi}{4}]$ 与 $[\tfrac{\pi}{4},\tfrac{\pi}{2}]$），积分限由约束联立确定。
:::

---

### 第五题

:::callout{kind=note label="题目"}
设二维随机变量 $(X, Y)$ 所服从的联合概率密度函数为

$$f(x, y) = \begin{cases} \dfrac{1}{\pi}\, e^{-\frac{x^2+y^2}{2}}, & xy < 0 \\ 0, & xy \geq 0 \end{cases}$$

求：

（1）边缘概率密度函数 $f_X(x)$ 与 $f_Y(y)$；

（2）随机变量 $X$ 和 $Y$ 是否独立？为什么？

（3）二维随机变量 $(X, Y)$ 是否服从二维正态分布？（只回答是或否）
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）求边缘密度**

支撑集 $xy < 0$ 即第二、四象限（$x, y$ 异号）。

当 $x > 0$ 时 $y < 0$：

$$f_X(x) = \int_{-\infty}^{0} \frac{1}{\pi}\, e^{-\frac{x^2+y^2}{2}}\, dy = \frac{1}{\pi}\, e^{-x^2/2} \int_{-\infty}^{0} e^{-y^2/2}\, dy$$

利用 $\int_{-\infty}^{0} e^{-y^2/2}\, dy = \dfrac{\sqrt{2\pi}}{2}$：

$$f_X(x) = \frac{1}{\pi}\, e^{-x^2/2} \cdot \frac{\sqrt{2\pi}}{2} = \frac{1}{\sqrt{2\pi}}\, e^{-x^2/2}$$

当 $x < 0$ 时 $y > 0$，由对称性结果相同：

$$f_X(x) = \frac{1}{\sqrt{2\pi}}\, e^{-x^2/2}, \quad x \in \mathbb{R}$$

即 $X \sim N(0, 1)$。同理：

$$f_Y(y) = \frac{1}{\sqrt{2\pi}}\, e^{-y^2/2}, \quad y \in \mathbb{R}$$

即 $Y \sim N(0, 1)$。

**（2）独立性判断**

若 $X, Y$ 独立，应有 $f(x,y) = f_X(x) \cdot f_Y(y)$。但：

$$f_X(x) \cdot f_Y(y) = \frac{1}{2\pi}\, e^{-\frac{x^2+y^2}{2}}$$

而题给 $f(x,y) = \dfrac{1}{\pi}\, e^{-\frac{x^2+y^2}{2}}$（仅当 $xy < 0$，其他处为 0）。

二者在支撑集上系数不同（$\tfrac{1}{\pi} \neq \tfrac{1}{2\pi}$），且 $f(x,y)$ 在 $xy \geq 0$ 处为 0 而 $f_X \cdot f_Y$ 不为 0，故：

$$X, Y \text{ 不独立}$$

理由：联合密度不等于边缘密度之积；且支撑集 $xy<0$ 不是矩形区域，不满足独立的必要条件。

**（3）是否二维正态**

**否**。虽然 $X, Y$ 的边缘都是正态分布，但联合密度仅在第二、四象限非零，支撑不是整个平面 $\mathbb{R}^2$；且 $X, Y$ 不独立。二维正态分布要求支撑为整个 $\mathbb{R}^2$，故 $(X, Y)$ 不服从二维正态分布。

**答案**：

$$f_X(x) = f_Y(x) = \frac{1}{\sqrt{2\pi}}\, e^{-x^2/2}$$

$X, Y$ 不独立；$(X, Y)$ 不服从二维正态分布。
:::

:::callout{kind=note label="知识卡片：边缘正态不蕴含联合正态"}
| 命题 | 结论 |
|------|------|
| 二维正态 $\Rightarrow$ 边缘正态 | 成立 |
| 边缘正态 $\Rightarrow$ 二维正态 | **不成立**（反例：本题） |
| 独立正态 $\Rightarrow$ 联合正态 | 成立 |
| 二维正态判据 | 支撑为整个 $\mathbb{R}^2$ 且联合密度为特定二次型指数形式 |
| 独立判据 | $f(x,y) = f_X(x) f_Y(y)$ 处处成立 |
| 支撑判据 | 独立要求支撑为矩形（笛卡尔积） |
| 本题关键 | $xy<0$ 非矩形支撑 $\Rightarrow$ 必不独立 |
:::

:::callout{kind=tip label="结论速记"}
边缘均为 $N(0,1)$ 不等于联合正态；支撑 $xy<0$ 非矩形 $\Rightarrow$ 不独立，故非二维正态。
:::

---

### 第六题

:::callout{kind=note label="题目"}
设将一枚均匀硬币重复独立投掷，直到出现正面为止，设 $X$ 表示总的投掷次数，令

$$Y = \begin{cases} 1, & \text{第一次投掷获得正面} \\ 0, & \text{第一次投掷获得反面} \end{cases}$$

试求：

（1）$X$ 的概率分布列；

（2）相关系数 $\rho_{XY}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）$X$ 的分布列**

"投掷直到出现正面为止"对应几何分布：前 $n-1$ 次均为反面、第 $n$ 次为正面，每次独立且 $P(\text{正}) = P(\text{反}) = \tfrac{1}{2}$。

$$P\{X = n\} = \left(\frac{1}{2}\right)^{n-1} \cdot \frac{1}{2} = \frac{1}{2^n}, \quad n = 1, 2, 3, \ldots$$

即 $X \sim \text{Geom}\!\left(\tfrac{1}{2}\right)$。

**（2）相关系数 $\rho_{XY}$**

先算各数字特征。对 $X \sim \text{Geom}(p)$，$p = \tfrac{1}{2}$：

$$EX = \frac{1}{p} = 2, \qquad DX = \frac{1-p}{p^2} = \frac{\tfrac{1}{2}}{\tfrac{1}{4}} = 2$$

对 $Y$（伯努利变量，$P(Y=1) = \tfrac{1}{2}$）：

$$EY = \frac{1}{2}, \qquad DY = \frac{1}{2} \times \frac{1}{2} = \frac{1}{4}$$

计算 $E(XY)$：

- 若 $Y = 1$（第一次正面，概率 $\tfrac{1}{2}$）：$X = 1$，$XY = 1$；
- 若 $Y = 0$（第一次反面，概率 $\tfrac{1}{2}$）：$X \geq 2$，$XY = 0$。

$$E(XY) = \frac{1}{2} \times 1 + \frac{1}{2} \times 0 = \frac{1}{2}$$

协方差：

$$\text{Cov}(X, Y) = E(XY) - EX \cdot EY = \frac{1}{2} - 2 \times \frac{1}{2} = \frac{1}{2} - 1 = -\frac{1}{2}$$

相关系数：

$$\rho_{XY} = \frac{\text{Cov}(X, Y)}{\sqrt{DX} \cdot \sqrt{DY}} = \frac{-\tfrac{1}{2}}{\sqrt{2} \times \tfrac{1}{2}} = \frac{-\tfrac{1}{2}}{\tfrac{\sqrt{2}}{2}} = -\frac{1}{\sqrt{2}} = -\frac{\sqrt{2}}{2}$$

**答案**：

$$P\{X = n\} = 2^{-n},\ n = 1, 2, \ldots; \qquad \rho_{XY} = -\frac{\sqrt{2}}{2}$$
:::

:::callout{kind=note label="知识卡片：几何分布与相关系数"}
| 项目 | 公式 |
|------|------|
| 几何分布 | $P(X=n) = (1-p)^{n-1} p$，$n=1,2,\ldots$ |
| 均值 / 方差 | $EX = \tfrac{1}{p}$，$DX = \tfrac{1-p}{p^2}$ |
| 伯努利变量 | $EY = p$，$DY = p(1-p)$ |
| 协方差 | $\text{Cov}(X,Y) = E(XY) - EX \cdot EY$ |
| 相关系数 | $\rho_{XY} = \dfrac{\text{Cov}(X,Y)}{\sigma_X \sigma_Y} \in [-1, 1]$ |
| 本题 | $p=\tfrac12$，$EX=2$，$DX=2$，$EY=\tfrac12$，$DY=\tfrac14$ |
| $\rho$ 符号 | $Y=1 \Rightarrow X=1$ 小；$Y=0 \Rightarrow X\geq2$ 大，负相关 |
:::

:::callout{kind=tip label="结论速记"}
$X\sim\text{Geom}(\tfrac12)$：$P(X=n)=2^{-n}$；$Y$ 指示第一次是否正面，与 $X$ 负相关 $\rho_{XY}=-\dfrac{\sqrt{2}}{2}$。
:::

---

### 第七题

:::callout{kind=note label="题目"}
设总体 $X \sim B(m, p)$，其中 $m$ 已知，但 $p$ 未知；$(X_1, X_2, \cdots, X_n)^T$ 是来自总体 $X$ 的独立同分布样本，试求：

（1）总体未知参数 $p$ 的极大似然估计 $\hat{p}_{MLE}$；

（2）$\hat{p}_{MLE}$ 是否为总体参数 $p$ 的无偏估计量？并给出理由。
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）求 $\hat{p}_{MLE}$**

总体 $X \sim B(m, p)$，单次观测 $X_i$ 的概率：

$$P\{X_i = x_i\} = \binom{m}{x_i} p^{x_i} (1-p)^{m - x_i}, \quad x_i = 0, 1, \ldots, m$$

样本的似然函数：

$$L(p) = \prod_{i=1}^n \binom{m}{x_i} p^{x_i} (1-p)^{m - x_i} = \left[\prod_{i=1}^n \binom{m}{x_i}\right] p^{\sum x_i} (1-p)^{nm - \sum x_i}$$

取对数：

$$\ln L(p) = \text{const} + \left(\sum_{i=1}^n x_i\right) \ln p + \left(nm - \sum_{i=1}^n x_i\right) \ln(1-p)$$

对 $p$ 求导并令其为 0：

$$\frac{d \ln L}{dp} = \frac{\sum x_i}{p} - \frac{nm - \sum x_i}{1-p} = 0$$

$$\left(\sum x_i\right)(1-p) = \left(nm - \sum x_i\right) p$$

$$\sum x_i - \left(\sum x_i\right) p = nm\, p - \left(\sum x_i\right) p$$

$$\sum x_i = nm\, p$$

解得：

$$\hat{p}_{MLE} = \frac{\sum_{i=1}^n X_i}{nm} = \frac{\bar{X}}{m}$$

其中 $\bar{X} = \dfrac{1}{n}\sum X_i$。

**（2）无偏性判断**

由 $E(X_i) = mp$（二项分布均值）：

$$E\!\left(\hat{p}_{MLE}\right) = E\!\left(\frac{\bar{X}}{m}\right) = \frac{1}{m} E(\bar{X}) = \frac{1}{m} \cdot \frac{1}{n} \sum_{i=1}^n E(X_i) = \frac{1}{m} \cdot \frac{1}{n} \cdot n \cdot mp = p$$

故 $\hat{p}_{MLE}$ 是 $p$ 的**无偏估计量**。

**理由**：$E(\bar{X}) = mp$，故 $E(\hat{p}_{MLE}) = E(\bar{X}/m) = p$，满足无偏性定义 $E(\hat{\theta}) = \theta$。

**答案**：

$$\hat{p}_{MLE} = \frac{\bar{X}}{m}$$

且 $\hat{p}_{MLE}$ 是 $p$ 的无偏估计量，因为 $E\!\left(\dfrac{\bar{X}}{m}\right) = p$。
:::

:::callout{kind=note label="知识卡片：极大似然估计与无偏性"}
| 步骤 | 内容 |
|------|------|
| 1. 写似然 | $L(\theta) = \prod f(x_i; \theta)$ |
| 2. 取对数 | $\ln L$ 简化乘积为求和 |
| 3. 求导令零 | $\dfrac{\partial \ln L}{\partial \theta} = 0$ |
| 4. 解方程 | 得 $\hat{\theta}_{MLE}$ |
| 5. 验无偏 | 计算 $E(\hat{\theta})$ 是否等于 $\theta$ |
| 二项 $B(m,p)$ | $EX = mp$，$DX = mp(1-p)$ |
| 样本均值 | $E(\bar{X}) = EX$，$D(\bar{X}) = DX/n$ |
| 不变性 | MLE 在参数变换下具有不变性 |
:::

:::callout{kind=tip label="结论速记"}
$X \sim B(m,p)$ 时 $\hat{p}_{MLE} = \dfrac{\bar{X}}{m}$；因 $E(\bar{X})=mp$，故 $E(\hat{p}_{MLE})=p$，无偏。
:::

---
