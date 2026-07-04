# 2024-2025学年第一学期 概率论与数理统计期末考试A卷

> 来源：华中科技大学
> 考试时间：120 分钟　满分：100 分
> 题型：单项选择题 10 题（每题 3 分）+ 填空题 4 题（每题 3 分）+ 计算题 5 大题

---

## 一、单项选择题（每题 3 分，共 30 分）

### 第1题

:::callout{kind=note label="题目"}
一盒中有 2 个红球，1 个黑球，1 个白球，从中有放回地取三次，每次取一球，则三次中每种颜色各取一次的概率为（　　）

A. $\dfrac{1}{32}$　　B. $\dfrac{3}{16}$　　C. $\dfrac{4}{32}$　　D. $\dfrac{5}{16}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

盒中共 4 球：红 2、黑 1、白 1。有放回取三次，每次取到各色的概率为：

$$P(\text{红}) = \frac{2}{4} = \frac{1}{2}, \quad P(\text{黑}) = \frac{1}{4}, \quad P(\text{白}) = \frac{1}{4}$$

"三种颜色各出现一次"即红、黑、白各一次，排列方式共有 $3! = 6$ 种，故：

$$P = 6 \times \frac{1}{2} \times \frac{1}{4} \times \frac{1}{4} = \frac{6}{32} = \frac{3}{16}$$

- **A 错**：$\frac{1}{32}$ 仅计算了某一固定次序（如红黑白）的概率 $\frac{1}{32}$，漏乘排列数 $3!$。
- **C 错**：$\frac{4}{32} = \frac{1}{8}$，排列数取错（误用 4 而非 6）。
- **D 错**：$\frac{5}{16}$ 将某色概率算重或混淆了无放回情形。
:::

:::callout{kind=note label="知识卡片：有放回抽样与多项概率"}
| 模型 | 公式 | 说明 |
|------|------|------|
| 有放回独立抽样 | 每次概率不变 | 各次相互独立 |
| 多项分布 | $\dfrac{n!}{n_1!n_2!\cdots n_k!}p_1^{n_1}\cdots p_k^{n_k}$ | $n$ 次试验中各色出现指定次数 |
| 本题代入 | $3!\cdot\left(\frac{1}{2}\right)\left(\frac{1}{4}\right)\left(\frac{1}{4}\right)$ | $n=3$，三色各一次 |
| 排列计数 | $3! = 6$ | 三种颜色的全排列数 |
:::

:::callout{kind=tip label="结论速记"}
有放回取球求"各色各一次"：先算单次各色概率，再乘全排列数 $3!$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
抛一枚硬币 20 次，设 $X$ 为 20 次中正面向上的次数，$Y$ 为 20 次中反面向上的次数，则 $\rho_{XY} =$（　　）

A. $\dfrac{1}{4}$　　B. $0$　　C. $\dfrac{1}{2}$　　D. $-1$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

每次抛硬币要么正面要么反面，故恒有：

$$X + Y = 20 \quad \Rightarrow \quad Y = 20 - X$$

$X$ 与 $Y$ 存在完全确定的线性关系（斜率为 $-1$），因此为完全负相关：

$$\rho_{XY} = -1$$

也可严格推导：$\mathrm{Cov}(X,Y) = \mathrm{Cov}(X, 20-X) = -\mathrm{Var}(X)$，而 $D(Y)=D(X)$，故：

$$\rho_{XY} = \frac{-D(X)}{\sqrt{D(X)\cdot D(X)}} = -1$$

- **A 错**：$\frac{1}{4}$ 无依据，混淆了部分相关情形。
- **B 错**：$\rho=0$ 表示不相关，但 $Y$ 完全由 $X$ 决定，不可能不相关。
- **C 错**：$\frac{1}{2}$ 为正相关，方向错误。
:::

:::callout{kind=note label="知识卡片：相关系数与线性关系"}
| 关系 | 相关系数 $\rho$ | 含义 |
|------|------|------|
| $Y = aX+b,\ a>0$ | $+1$ | 完全正相关 |
| $Y = aX+b,\ a<0$ | $-1$ | 完全负相关 |
| 独立 | $0$ | 不相关（独立必不相关） |
| 不相关 | $0$ | 未必独立（除正态分布外） |
| 公式 | $\rho_{XY}=\dfrac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)D(Y)}}$ | 取值 $[-1,1]$ |
:::

:::callout{kind=tip label="结论速记"}
$X+Y=\text{常数} \Rightarrow Y=-X+\text{常数} \Rightarrow \rho_{XY}=-1$，完全负相关。
:::

---

### 第3题

:::callout{kind=note label="题目"}
随机变量 $X$ 的密度函数为

$$f(x) = \begin{cases} 3x^2, & 0 \leq x \leq 1 \\ 0, & \text{其他} \end{cases}$$

分布函数为 $F(x)$，则 $P\!\left(F(X) > 1 - EX\right) =$（　　）

A. $\dfrac{1}{4}$　　B. $\dfrac{3}{4}$　　C. $\dfrac{1}{2}$　　D. $\dfrac{1}{3}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

先求 $EX$：

$$EX = \int_0^1 x \cdot 3x^2\, dx = \int_0^1 3x^3\, dx = \frac{3}{4}$$

由**概率积分变换**：若 $X$ 为连续型随机变量，$F$ 为其分布函数，则 $F(X) \sim U(0,1)$。

因此：

$$P\!\left(F(X) > 1 - EX\right) = P\!\left(U > 1 - \frac{3}{4}\right) = P\!\left(U > \frac{1}{4}\right) = 1 - \frac{1}{4} = \frac{3}{4}$$

- **A 错**：$\frac{1}{4}$ 误将 $P(U > \frac{1}{4})$ 算成 $\frac{1}{4}$（即算成 $P(U \leq \frac{1}{4})$）。
- **C 错**：$\frac{1}{2}$ 误认为 $EX=\frac{1}{2}$（未正确积分）。
- **D 错**：$\frac{1}{3}$ 计算过程出错。
:::

:::callout{kind=note label="知识卡片：概率积分变换"}
| 结论 | 表述 |
|------|------|
| 定理 | 若 $X$ 连续型，$F$ 为其分布函数，则 $F(X) \sim U(0,1)$ |
| 逆变换 | 若 $U\sim U(0,1)$，则 $F^{-1}(U) \sim X$ |
| 用途 | 随机数生成、概率计算 |
| 本题关键 | $F(X)$ 视作 $U(0,1)$，再比较 $1-EX=\frac{1}{4}$ |
| $EX$ 计算 | $\int_0^1 3x^3\,dx = \frac{3}{4}$ |
:::

:::callout{kind=tip label="结论速记"}
连续型随机变量 $X$ 的分布函数 $F(X)\sim U(0,1)$，把 $F(X)$ 整体当均匀分布处理即可。
:::

---

### 第4题

:::callout{kind=note label="题目"}
若 $A$、$B$ 是两个随机事件，则一定有（　　）

A. $P(AB) \leq \dfrac{P(A)+P(B)}{2}$

B. $P(AB) < P(A \mid B)$

C. $P(AB) \leq P(A)+P(B)-1$

D. $P(AB) = P(A)P(B)$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

由事件包含关系 $AB \subset A$ 及 $AB \subset B$，结合概率单调性：

$$P(AB) \leq P(A), \quad P(AB) \leq P(B)$$

两式相加：

$$2\,P(AB) \leq P(A) + P(B) \quad \Rightarrow \quad P(AB) \leq \frac{P(A)+P(B)}{2}$$

该不等式对任意两个事件恒成立。

- **B 错**：应为 $P(AB) \leq P(A\mid B)$（因 $P(A\mid B)=\frac{P(AB)}{P(B)}\geq P(AB)$），严格小于不一定成立（如 $P(B)=1$ 时取等）。
- **C 错**：$P(AB) \geq P(A)+P(B)-1$（Bonferroni 下界），方向相反；$P(AB)\leq P(A)+P(B)-1$ 不恒成立（如 $A=B=\Omega$ 时左边 1 右边 1 取等，但 $A,B$ 独立小概率时左边大于右边）。
- **D 错**：$P(AB)=P(A)P(B)$ 仅当 $A,B$ 独立时成立，非恒等式。
:::

:::callout{kind=note label="知识卡片：事件概率不等式"}
| 不等式 | 条件 | 方向 |
|------|------|------|
| $P(AB)\leq P(A),\ P(AB)\leq P(B)$ | 恒成立 | 单调性 |
| $P(AB)\leq \dfrac{P(A)+P(B)}{2}$ | 恒成立 | 本题结论 |
| $P(A\cup B)\leq P(A)+P(B)$ | 恒成立 | 加法公式推论 |
| $P(AB)\geq P(A)+P(B)-1$ | 恒成立 | Bonferroni 下界 |
| $P(AB)=P(A)P(B)$ | $A,B$ 独立 | 等式 |
:::

:::callout{kind=tip label="结论速记"}
$AB\subset A$ 且 $AB\subset B$ $\Rightarrow$ $P(AB)$ 同时不超过 $P(A)$、$P(B)$ $\Rightarrow$ 不超过二者平均值。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 相互独立，且 $X\sim N(0,5)$，$Y\sim N(-2,4)$，若 $P(3X+Y < a) = P(X > Y)$，则 $a =$（　　）

A. $a=\dfrac{2}{3}$　　B. $a=2$　　C. $a=\dfrac{4}{3}$　　D. $a=\dfrac{8}{3}$
:::

:::callout{kind=insight label="解析"}
**【答案】D**

由独立正态变量的线性组合仍为正态分布：

$$X - Y \sim N\!\left(0-(-2),\ 5+4\right) = N(2, 9), \quad \sigma_{X-Y}=3$$

$$3X + Y \sim N\!\left(3\cdot 0+(-2),\ 9\cdot 5+4\right) = N(-2, 49), \quad \sigma_{3X+Y}=7$$

分别标准化：

$$P(X>Y) = P(X-Y>0) = P\!\left(\frac{X-Y-2}{3} > \frac{0-2}{3}\right) = 1 - \Phi\!\left(-\frac{2}{3}\right) = \Phi\!\left(\frac{2}{3}\right)$$

$$P(3X+Y<a) = P\!\left(\frac{3X+Y+2}{7} < \frac{a+2}{7}\right) = \Phi\!\left(\frac{a+2}{7}\right)$$

令两概率相等，由 $\Phi$ 单调：

$$\frac{a+2}{7} = \frac{2}{3} \quad \Rightarrow \quad a+2 = \frac{14}{3} \quad \Rightarrow \quad a = \frac{8}{3}$$

- **A 错**：$\frac{2}{3}$ 混淆了分位数 $\frac{2}{3}$ 与 $a$ 本身。
- **B 错**：$a=2$ 漏算了标准化中的平移或尺度。
- **C 错**：$\frac{4}{3}$ 计算时方差合并出错。
:::

:::callout{kind=note label="知识卡片：正态分布线性组合"}
| 性质 | 公式 |
|------|------|
| 独立和差 | $X\sim N(\mu_1,\sigma_1^2),\ Y\sim N(\mu_2,\sigma_2^2)$ 独立 $\Rightarrow aX+bY\sim N(a\mu_1+b\mu_2,\ a^2\sigma_1^2+b^2\sigma_2^2)$ |
| 标准化 | $P(Z<c) = \Phi\!\left(\dfrac{c-\mu}{\sigma}\right)$ |
| 分位数对应 | 两正态变量概率相等 $\Leftrightarrow$ 标准化后分位数相等 |
| 本题 | $X-Y\sim N(2,9)$，$3X+Y\sim N(-2,49)$ |
:::

:::callout{kind=tip label="结论速记"}
两正态概率相等 $\Rightarrow$ 标准正态分位数相等 $\Rightarrow \dfrac{a-(-2)}{7}=\dfrac{0-2}{3}\Rightarrow a=\dfrac{8}{3}$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设随机变量 $X, Y$ 相互独立，且 $X\sim E(10)$，$Y\sim U(1,5)$，则 $P(2X+Y=0) =$（　　）

A. $1$　　B. $\dfrac{3}{4}$　　C. $0$　　D. $\dfrac{4}{5}$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

指数分布 $X\sim E(10)$ 取值为正：$X > 0$（几乎必然）。

均匀分布 $Y\sim U(1,5)$ 取值范围 $Y \in [1,5]$，故 $Y \geq 1 > 0$。

因此：

$$2X + Y > 0 \quad \text{几乎必然成立}$$

$2X+Y$ 为连续型随机变量（独立连续变量之和仍连续），连续型随机变量取任一单点的概率为 $0$：

$$P(2X+Y=0) = 0$$

- **A 错**：$1$ 误将 $P(2X+Y>0)$ 与 $P(2X+Y=0)$ 混淆。
- **B 错**：$\frac{3}{4}$ 无依据。
- **D 错**：$\frac{4}{5}$ 无依据。
:::

:::callout{kind=note label="知识卡片：连续型随机变量性质"}
| 性质 | 表述 |
|------|------|
| 单点概率 | 连续型 $X$：$P(X=c)=0$，$\forall c\in\mathbb{R}$ |
| 区间概率 | $P(a<X<b)=\int_a^b f(x)\,dx$ |
| 和的连续性 | 独立连续变量之和仍连续 |
| 取值范围 | $E(\lambda): X>0$；$U(a,b): X\in[a,b]$ |
| 几乎必然 | 概率为 1 的事件，允许不成立的零测集例外 |
:::

:::callout{kind=tip label="结论速记"}
连续型随机变量取单点概率恒为 $0$；$X>0,\ Y>0 \Rightarrow 2X+Y>0 \Rightarrow P(2X+Y=0)=0$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
已知 $X_1, X_2, \ldots, X_n$ 是来自正态总体 $N(\mu,\sigma^2)$ 的简单随机样本，则

$$\frac{(n-3)\left[(X_1-\mu)^2 + (X_2-\mu)^2\right]}{2\displaystyle\sum_{i=3}^{n}(X_i-\bar{X})^2}$$

服从（　　）

A. $F(n-3, 2)$　　B. $t(n-3)$　　C. $F(2, n-3)$　　D. $\chi^2(n-3)$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

**分子部分**：因 $X_i \sim N(\mu,\sigma^2)$，故 $\dfrac{X_i-\mu}{\sigma}\sim N(0,1)$，且 $X_1-\mu$ 与 $X_2-\mu$ 独立：

$$\frac{(X_1-\mu)^2 + (X_2-\mu)^2}{\sigma^2} \sim \chi^2(2)$$

**分母部分**：$\displaystyle\sum_{i=3}^{n}\frac{(X_i-\bar{X})^2}{\sigma^2} \sim \chi^2(n-3)$

（样本中用 $\bar{X}$ 估计均值损失自由度，且分子部分的 $X_1,X_2$ 与分母独立）

**构造 $F$ 分布**：

$$\frac{\dfrac{(X_1-\mu)^2+(X_2-\mu)^2}{\sigma^2}\Big/2}{\displaystyle\sum_{i=3}^{n}\frac{(X_i-\bar{X})^2}{\sigma^2}\Big/(n-3)} = \frac{(n-3)\left[(X_1-\mu)^2+(X_2-\mu)^2\right]}{2\displaystyle\sum_{i=3}^{n}(X_i-\bar{X})^2} \sim F(2, n-3)$$

- **A 错**：$F(n-3, 2)$ 自由度顺序颠倒（分子自由度应为 2）。
- **B 错**：$t$ 分布需 $\frac{N(0,1)}{\sqrt{\chi^2/\nu}}$ 结构，本题是 $\chi^2$ 之比，属 $F$ 分布。
- **D 错**：$\chi^2$ 分布对应单个平方和，本题是两个平方和之比。
:::

:::callout{kind=note label="知识卡片：抽样分布构造"}
| 分布 | 构造方式 | 自由度 |
|------|------|------|
| $\chi^2(n)$ | $\sum_{i=1}^n Z_i^2,\ Z_i\sim N(0,1)$ 独立 | $n$ |
| $t(n)$ | $\dfrac{Z}{\sqrt{\chi^2(n)/n}}$，$Z$ 与 $\chi^2$ 独立 | $n$ |
| $F(m,n)$ | $\dfrac{\chi^2(m)/m}{\chi^2(n)/n}$，两 $\chi^2$ 独立 | $(m,n)$ |
| $\dfrac{(n-1)S^2}{\sigma^2}$ | $\sim\chi^2(n-1)$ | $n-1$ |
| 本题 | 分子 $\chi^2(2)/2$，分母 $\chi^2(n-3)/(n-3)$ | $F(2,n-3)$ |
:::

:::callout{kind=tip label="结论速记"}
两个独立 $\chi^2$ 平方和之比（各除以自由度）$\sim F$ 分布，分子自由度在前：$F(2, n-3)$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
Markov 推广了 Chebyshev 不等式：若 $X$ 非负，则 $\forall \epsilon > 0$，

$$P(X \geq \epsilon) \leq \frac{EX}{\epsilon}$$

设随机变量 $X$ 和 $Y$ 的数学期望分别为 $3$ 和 $-2$，方差分别为 $1$ 和 $4$，相关系数为 $-\dfrac{1}{2}$，在此信息下用上面的 Markov 不等式能得到 $P(|X+Y| \geq 4)$ 的最小上界为（　　）

A. $\dfrac{1}{5}$　　B. $\dfrac{1}{4}$　　C. $\dfrac{1}{2}$　　D. $\dfrac{3}{5}$
:::

:::callout{kind=insight label="解析"}
**【答案】B**

令 $Z = X+Y$，需估计 $P(|Z| \geq 4) = P(Z^2 \geq 16)$。

因 $Z^2$ 非负，可对 $Z^2$ 用 Markov 不等式：

$$P(|Z|\geq 4) = P(Z^2 \geq 16) \leq \frac{E(Z^2)}{16}$$

计算 $E(Z^2)$：

$$E(Z) = EX + EY = 3 + (-2) = 1$$

$$D(Z) = D(X)+D(Y)+2\rho_{XY}\sqrt{D(X)D(Y)} = 1 + 4 + 2\!\left(-\frac{1}{2}\right)\cdot 1 \cdot 2 = 5 - 2 = 3$$

$$E(Z^2) = D(Z) + [E(Z)]^2 = 3 + 1 = 4$$

故最小上界为：

$$P(|X+Y|\geq 4) \leq \frac{4}{16} = \frac{1}{4}$$

- **A 错**：$\frac{1}{5}$ 误用 $E|Z|$ 或除以其他数。
- **C 错**：$\frac{1}{2}$ 仅用了 $E(Z^2)$ 未除以 16，或误用 Chebyshev $\frac{D(Z)}{16}=\frac{3}{16}$ 后取近似。
- **D 错**：$\frac{3}{5}$ 计算错误。
:::

:::callout{kind=note label="知识卡片：Markov 与 Chebyshev 不等式"}
| 不等式 | 形式 | 条件 |
|------|------|------|
| Markov | $P(X\geq\epsilon)\leq \dfrac{EX}{\epsilon}$ | $X\geq 0$ |
| Chebyshev | $P(\|X-EX\|\geq\epsilon)\leq \dfrac{DX}{\epsilon^2}$ | $DX$ 存在 |
| 推广 Markov | $P(\|X\|\geq\epsilon)\leq \dfrac{E(X^2)}{\epsilon^2}$ | $X^2\geq 0$ |
| 方差公式 | $D(X+Y)=D(X)+D(Y)+2\mathrm{Cov}(X,Y)$ | 一般情形 |
| 协方差 | $\mathrm{Cov}(X,Y)=\rho\sqrt{D(X)D(Y)}$ | 由相关系数 |
:::

:::callout{kind=tip label="结论速记"}
对 $|Z|\geq 4$ 用 Markov：$P\leq \dfrac{E(Z^2)}{16}=\dfrac{D(Z)+(EZ)^2}{16}=\dfrac{3+1}{16}=\dfrac{1}{4}$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
随机变量 $(X,Y) \sim N\!\left(0, 0, 1, 1, \dfrac{1}{2}\right)$，则下列结论错误的是（　　）

A. $X^2 + Y^2 \sim \chi^2(2)$

B. $\rho_{XY} = \dfrac{1}{2}$

C. $E(XY) = \dfrac{1}{2}$

D. $D(X+Y) = 3$
:::

:::callout{kind=insight label="解析"}
**【答案】A**

$(X,Y)\sim N(0,0,1,1,\frac{1}{2})$ 表示 $EX=EY=0$，$DX=DY=1$，$\rho_{XY}=\frac{1}{2}\neq 0$，故 $X$ 与 $Y$ **不独立**。

- **A 错（即为本题答案）**：$X^2+Y^2\sim\chi^2(2)$ 要求 $X,Y$ 为**独立**的标准正态变量。本题 $\rho=\frac{1}{2}\neq 0$，二者不独立，故 $X^2+Y^2$ **不服从** $\chi^2(2)$。

其余选项验证：

- **B 正确**：$\rho_{XY}=\frac{1}{2}$ 由参数直接给出。
- **C 正确**：$E(XY)=\mathrm{Cov}(X,Y)+EX\cdot EY = \rho\sqrt{DX\cdot DY} + 0 = \frac{1}{2}\cdot 1 = \frac{1}{2}$。
- **D 正确**：$D(X+Y)=DX+DY+2\,\mathrm{Cov}(X,Y)=1+1+2\cdot\frac{1}{2}=3$。
:::

:::callout{kind=note label="知识卡片：二元正态分布性质"}
| 参数 | $(X,Y)\sim N(\mu_1,\mu_2,\sigma_1^2,\sigma_2^2,\rho)$ |
|------|------|
| 边缘 | $X\sim N(\mu_1,\sigma_1^2)$，$Y\sim N(\mu_2,\sigma_2^2)$ |
| 协方差 | $\mathrm{Cov}(X,Y)=\rho\sigma_1\sigma_2$ |
| 独立性 | $X,Y$ 独立 $\Leftrightarrow \rho=0$（正态特有） |
| $\chi^2$ 构造 | $X^2+Y^2\sim\chi^2(2)$ **当且仅当** $X,Y$ 独立标准正态 |
| 和的方差 | $D(X+Y)=\sigma_1^2+\sigma_2^2+2\rho\sigma_1\sigma_2$ |
:::

:::callout{kind=tip label="结论速记"}
二元正态中 $\rho\neq 0 \Rightarrow$ 不独立 $\Rightarrow$ $X^2+Y^2$ 不是 $\chi^2(2)$；独立是 $\chi^2$ 可加性的前提。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \cdots, X_n$ 是来自几何分布总体的简单随机样本，则

$$E\!\left[\frac{X_1+X_2+X_3}{X_1+X_2+\cdots+X_n}\right] =$$（　　）

A. $\dfrac{1}{n}$　　B. $\dfrac{2}{n}$　　C. $\dfrac{3}{n}$　　D. $\dfrac{1}{2}$
:::

:::callout{kind=insight label="解析"}
**【答案】C**

记 $S = X_1+X_2+\cdots+X_n$，则所求为：

$$E\!\left[\frac{X_1+X_2+X_3}{S}\right] = E\!\left[\frac{X_1}{S}\right]+E\!\left[\frac{X_2}{S}\right]+E\!\left[\frac{X_3}{S}\right]$$

由 $X_1, X_2, \ldots, X_n$ 独立同分布，**对称性**保证：

$$E\!\left[\frac{X_1}{S}\right] = E\!\left[\frac{X_2}{S}\right] = \cdots = E\!\left[\frac{X_n}{S}\right]$$

又因 $\displaystyle\sum_{i=1}^{n}\frac{X_i}{S} = \frac{S}{S} = 1$，两边取期望：

$$n\cdot E\!\left[\frac{X_1}{S}\right] = 1 \quad \Rightarrow \quad E\!\left[\frac{X_i}{S}\right] = \frac{1}{n}$$

因此：

$$E\!\left[\frac{X_1+X_2+X_3}{S}\right] = \frac{3}{n}$$

- **A 错**：$\frac{1}{n}$ 只算了其中一项的期望。
- **B 错**：$\frac{2}{n}$ 只算了两项。
- **D 错**：$\frac{1}{2}$ 与 $n$ 无关，不符合对称性结论。
:::

:::callout{kind=note label="知识卡片：对称性与期望的技巧"}
| 结论 | 表述 |
|------|------|
| 同分布对称 | iid 样本 $X_1,\ldots,X_n$，$E\!\left[\dfrac{X_i}{S}\right]$ 与 $i$ 无关 |
| 归一化 | $\sum_{i=1}^n \dfrac{X_i}{S}=1 \Rightarrow E\!\left[\dfrac{X_i}{S}\right]=\dfrac{1}{n}$ |
| 推广 | 前 $k$ 项占比期望为 $\dfrac{k}{n}$ |
| 注意 | 本结论不依赖总体分布，几何分布仅为题设 |
:::

:::callout{kind=tip label="结论速记"}
iid 样本前 $k$ 项之和占总和比例的期望为 $\dfrac{k}{n}$（对称性 + 归一化），本题 $k=3$。
:::

---

## 二、填空题（每题 3 分，共 12 分）

### 第1题

:::callout{kind=note label="题目"}
设总体 $X\sim E(1)$，$X_1, X_2, \cdots, X_n$ 是来自总体的简单随机样本，则 $P\!\left(\min\{X_1, X_2, \cdots, X_n\} > 1\right) =$ ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$\mathrm{e}^{-n}$**

$X\sim E(1)$ 的分布函数 $F(x)=1-\mathrm{e}^{-x}\ (x>0)$，生存函数 $P(X>x)=\mathrm{e}^{-x}$。

最小值大于 1 等价于**所有样本都大于 1**，由独立性：

$$P\!\left(\min\{X_1,\ldots,X_n\} > 1\right) = P(X_1>1, X_2>1, \ldots, X_n>1) = \prod_{i=1}^{n} P(X_i > 1) = \left(\mathrm{e}^{-1}\right)^n = \mathrm{e}^{-n}$$
:::

:::callout{kind=note label="知识卡片：顺序统计量的分布"}
| 统计量 | 分布（iid 样本，分布函数 $F$，密度 $f$） |
|------|------|
| $\min\{X_i\}$ | $F_{\min}(x)=1-[1-F(x)]^n$ |
| $\max\{X_i\}$ | $F_{\max}(x)=[F(x)]^n$ |
| $P(\min > a)$ | $[1-F(a)]^n=[P(X>a)]^n$ |
| $P(\max \leq a)$ | $[F(a)]^n$ |
| 指数特例 | $X\sim E(\lambda)\Rightarrow P(X>a)=\mathrm{e}^{-\lambda a}$ |
:::

:::callout{kind=tip label="结论速记"}
$\min > a \Leftrightarrow$ 所有样本 $> a$ $\Rightarrow P=\prod P(X_i>a)=\mathrm{e}^{-n}$。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的分布函数 $F_X(x)$ 在 $x_0$ 处连续，则 $P(X = x_0) =$ ____。
:::

:::callout{kind=insight label="解析"}
**【答案】$0$**

分布函数 $F_X(x)=P(X\leq x)$ 在点 $x_0$ 处连续，意味着：

$$\lim_{x\to x_0} F_X(x) = F_X(x_0)$$

而 $P(X=x_0) = F_X(x_0) - F_X(x_0^-)$（此处 $F_X(x_0^-)=\lim_{x\to x_0^-}F_X(x)$ 为左极限）。

连续性保证 $F_X(x_0^-) = F_X(x_0)$，故：

$$P(X=x_0) = F_X(x_0) - F_X(x_0) = 0$$

即该点处分布函数无跳跃，取该点的概率为 $0$。
:::

:::callout{kind=note label="知识卡片：分布函数与单点概率"}
| 关系 | 公式 |
|------|------|
| 单点概率 | $P(X=x_0)=F(x_0)-F(x_0^-)$ |
| 连续点 | $F$ 连续 $\Rightarrow F(x_0^-)=F(x_0)\Rightarrow P(X=x_0)=0$ |
| 跳跃点 | $F$ 有跳跃 $\Rightarrow P(X=x_0)=$ 跳跃高度 |
| 连续型 | 密度存在 $\Rightarrow F$ 处处连续 $\Rightarrow$ 任一点概率为 0 |
| 离散型 | $F$ 为阶梯函数，跳跃处概率 $>0$ |
:::

:::callout{kind=tip label="结论速记"}
分布函数在 $x_0$ 连续 $\Leftrightarrow$ 该点无跳跃 $\Leftrightarrow P(X=x_0)=0$。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设正态总体 $N(\mu, 0.9^2)$ 的一个容量为 $9$ 的样本的样本均值 $\bar{X}=5$，则参数 $\mu$ 的置信水平为 $0.95$ 的置信区间为 ____。（标准正态分布的上 $0.025$ 分位数 $u_{0.025}=1.96$）
:::

:::callout{kind=insight label="解析"}
**【答案】$(4.412,\ 5.588)$**

方差 $\sigma^2 = 0.9^2$ 已知，$\mu$ 的 $1-\alpha$ 置信区间公式为：

$$\left(\bar{X} - u_{\alpha/2}\cdot\frac{\sigma}{\sqrt{n}},\ \ \bar{X} + u_{\alpha/2}\cdot\frac{\sigma}{\sqrt{n}}\right)$$

代入数据：$\bar{X}=5$，$\sigma=0.9$，$n=9$，$u_{0.025}=1.96$：

$$u_{\alpha/2}\cdot\frac{\sigma}{\sqrt{n}} = 1.96 \times \frac{0.9}{\sqrt{9}} = 1.96 \times 0.3 = 0.588$$

故置信区间为：

$$(5 - 0.588,\ \ 5 + 0.588) = (4.412,\ 5.588)$$
:::

:::callout{kind=note label="知识卡片：正态总体均值置信区间"}
| 条件 | 置信区间（$1-\alpha$） | 关键量 |
|------|------|------|
| $\sigma^2$ 已知 | $\bar{X}\pm u_{\alpha/2}\dfrac{\sigma}{\sqrt{n}}$ | 标准正态分位数 |
| $\sigma^2$ 未知 | $\bar{X}\pm t_{\alpha/2}(n-1)\dfrac{S}{\sqrt{n}}$ | $t$ 分布分位数 |
| 本题 | $5\pm 1.96\times\dfrac{0.9}{3}$ | $\sigma=0.9,n=9$ |
| 区间半宽 | $1.96\times 0.3=0.588$ | — |
:::

:::callout{kind=tip label="结论速记"}
$\sigma$ 已知时 $\mu$ 的 $95\%$ 置信区间：$\bar{X}\pm 1.96\cdot\dfrac{\sigma}{\sqrt{n}}=5\pm 0.588=(4.412,5.588)$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
独立地抛掷一枚均匀的硬币 $10000$ 次，则正面出现次数在 $4950\sim 5050$ 之间的概率约为 ____。（用标准正态分布的分布函数 $\Phi(x)$ 给出）
:::

:::callout{kind=insight label="解析"}
**【答案】$2\Phi(1)-1$**

设正面出现次数为 $X$，则 $X\sim B(10000, \frac{1}{2})$。

$$EX = np = 10000 \times \frac{1}{2} = 5000$$

$$DX = np(1-p) = 10000 \times \frac{1}{2} \times \frac{1}{2} = 2500, \quad \sigma = 50$$

由**中心极限定理**（De Moivre–Laplace），$X$ 近似服从 $N(5000, 50^2)$，标准化：

$$P(4950 \leq X \leq 5050) \approx P\!\left(\frac{4950-5000}{50} \leq \frac{X-5000}{50} \leq \frac{5050-5000}{50}\right) = P(-1 \leq Z \leq 1)$$

$$= \Phi(1) - \Phi(-1) = \Phi(1) - [1-\Phi(1)] = 2\Phi(1) - 1$$
:::

:::callout{kind=note label="知识卡片：中心极限定理与二项分布"}
| 内容 | 公式 |
|------|------|
| 二项分布 | $X\sim B(n,p)$，$EX=np$，$DX=np(1-p)$ |
| 中心极限定理 | $X\overset{\cdot}{\sim}N(np,\ np(1-p))$（$n$ 大时） |
| 标准化 | $Z=\dfrac{X-np}{\sqrt{np(1-p)}}\overset{\cdot}{\sim}N(0,1)$ |
| 对称区间 | $P(\|Z\|\leq c)=2\Phi(c)-1$ |
| 本题 | $n=10000,p=\frac{1}{2}\Rightarrow\sigma=50$，区间端点对应 $Z=\pm 1$ |
:::

:::callout{kind=tip label="结论速记"}
$n=10000$ 次抛硬币，$\sigma=50$，区间 $4950\sim 5050$ 对应 $Z\in[-1,1]$，概率 $2\Phi(1)-1$。
:::

---

## 三、计算题（共 10 分）

### 第11题

:::callout{kind=note label="题目"}
对于保险公司某险种的一个投保人，假定其年理赔次数 $N$ 服从参数为 $1$ 的泊松分布，再假定每个投保人每年的理赔额是随机变量 $X$。当 $N=1$ 时，$X$ 服从均值为 $2$ 的指数分布；而当 $N>1$ 时，$X$ 服从均值为 $4$ 的指数分布。求：

（1）投保人年理赔额超过 $8$ 的概率；

（2）若投保人的年理赔额没有超过 $8$，则此人当年理赔次数为 $1$ 的概率。
:::

:::callout{kind=insight label="解析"}
**【解】**

$N\sim P(1)$，故：

$$P(N=0)=\mathrm{e}^{-1},\quad P(N=1)=\mathrm{e}^{-1},\quad P(N>1)=1-P(N=0)-P(N=1)=1-2\mathrm{e}^{-1}$$

**条件分布**：
- $N=1$ 时，$X\sim E\!\left(\text{rate}=\frac{1}{2}\right)$（均值 2），$P(X>8\mid N=1)=\mathrm{e}^{-8/2}=\mathrm{e}^{-4}$
- $N>1$ 时，$X\sim E\!\left(\text{rate}=\frac{1}{4}\right)$（均值 4），$P(X>8\mid N>1)=\mathrm{e}^{-8/4}=\mathrm{e}^{-2}$

**（1）由全概率公式：**

$$P(X>8)=P(N=1)\cdot\mathrm{e}^{-4}+P(N>1)\cdot\mathrm{e}^{-2}=\mathrm{e}^{-1}\cdot\mathrm{e}^{-4}+(1-2\mathrm{e}^{-1})\cdot\mathrm{e}^{-2}$$

$$\boxed{P(X>8)=\mathrm{e}^{-5}+(1-2\mathrm{e}^{-1})\mathrm{e}^{-2}}$$

**（2）由贝叶斯公式：**

$$P(N=1\mid X\leq 8)=\frac{P(N=1,\,X\leq 8)}{P(X\leq 8)}=\frac{P(N=1)\cdot P(X\leq 8\mid N=1)}{1-P(X>8)}$$

其中 $P(X\leq 8\mid N=1)=1-\mathrm{e}^{-4}$，故：

$$\boxed{P(N=1\mid X\leq 8)=\frac{\mathrm{e}^{-1}(1-\mathrm{e}^{-4})}{1-\mathrm{e}^{-5}-(1-2\mathrm{e}^{-1})\mathrm{e}^{-2}}}$$
:::

:::callout{kind=note label="知识卡片：全概率公式与贝叶斯公式"}
| 公式 | 形式 |
|------|------|
| 全概率 | $P(B)=\sum_i P(A_i)P(B\mid A_i)$，$\{A_i\}$ 为划分 |
| 贝叶斯 | $P(A_k\mid B)=\dfrac{P(A_k)P(B\mid A_k)}{\sum_i P(A_i)P(B\mid A_i)}$ |
| 泊松分布 | $P(N=k)=\dfrac{\lambda^k}{k!}\mathrm{e}^{-\lambda}$，$N\sim P(\lambda)$ |
| 指数分布 | $X\sim E(\lambda)$（rate），$EX=\frac{1}{\lambda}$，$P(X>x)=\mathrm{e}^{-\lambda x}$ |
| 本题划分 | $\{N=0\},\{N=1\},\{N>1\}$，但 $N=0$ 时无理赔额 |
:::

:::callout{kind=tip label="结论速记"}
全概率拆分按 $N$ 的取值，贝叶斯逆向求条件；指数分布 $P(X>x)=\mathrm{e}^{-\lambda x}$ 中 $\lambda$ 是均值的倒数。
:::

---

## 四、计算题（共 12 分）

### 第12题

:::callout{kind=note label="题目"}
设随机变量 $(X,Y)$ 的联合密度函数为

$$f(x,y) = \begin{cases} 1, & 0\leq x\leq 1,\ 0\leq y\leq 1 \\ 0, & \text{其他} \end{cases}$$

记

$$U = \begin{cases} -1, & X < Y \\ 1, & X \geq Y \end{cases}$$

（1）$X$ 与 $U$ 是否相互独立？为什么？

（2）求 $Z = X + U$ 的分布。
:::

:::callout{kind=insight label="解析"}
**【解】**

$(X,Y)$ 在单位正方形 $[0,1]^2$ 上均匀分布。

**（1）判断独立性：**

条件概率：

$$P(U=1\mid X=x) = P(Y\leq x\mid X=x) = P(Y\leq x) = x$$

（因 $X,Y$ 独立，$Y\sim U(0,1)$，$P(Y\leq x)=x$ 对 $0\leq x\leq 1$）

由于 $P(U=1\mid X=x)=x$ **依赖于 $x$**，故 $U$ 与 $X$ **不独立**。

**（2）求 $Z=X+U$ 的分布：**

分两种情况：

- **当 $U=-1$（即 $X<Y$）时**：$Z=X-1\in[-1, 0]$。条件密度 $f_{Z\mid U=-1}(z)=-(z)$（由 $X$ 在 $[0,1]$ 均匀，$Z=X-1$ 平移），且 $P(U=-1)=P(X<Y)=\frac{1}{2}$。

- **当 $U=1$（即 $X\geq Y$）时**：$Z=X+1\in[1, 2]$。条件密度 $f_{Z\mid U=1}(z)=z-1$，且 $P(U=1)=\frac{1}{2}$。

全概率得 $Z$ 的密度：

$$\boxed{f_Z(z) = \begin{cases} -z, & -1\leq z\leq 0 \\ z-1, & 1\leq z\leq 2 \\ 0, & \text{其他} \end{cases}}$$
:::

:::callout{kind=note label="知识卡片：随机变量函数的分布"}
| 方法 | 适用情形 |
|------|------|
| 分布函数法 | $F_Z(z)=P(Z\leq z)$，再求导 |
| 全概率公式 | 离散-连续混合：$f_Z(z)=\sum f_{Z\mid U}(z)P(U)$ |
| 卷积公式 | 独立变量之和 $f_Z(z)=\int f_X(x)f_Y(z-x)\,dx$ |
| 独立性判据 | $P(U\mid X)=P(U)$ 恒成立则独立 |
| 本题技巧 | 按 $U$ 取值分类，分别求条件密度再加权 |
:::

:::callout{kind=tip label="结论速记"}
$P(U=1\mid X=x)=x$ 依赖 $x$ $\Rightarrow$ 不独立；$Z=X+U$ 按 $U=\pm 1$ 分两段求密度。
:::

---

## 五、计算题（共 12 分）

### 第13题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的密度函数为

$$f(x) = \begin{cases} \dfrac{1}{2\theta}\sin\dfrac{x}{\theta}, & 0 < x < \theta\pi \\ 0, & \text{其他} \end{cases}$$

其中 $0 < \theta < 1$。对 $X$ 进行独立重复的观测，直到第 $2$ 个大于 $\dfrac{\pi\theta}{3}$ 的观测值出现时停止，记 $Y$ 为观测次数。

（1）求 $Y$ 的分布；

（2）对 $X$ 观测了 $5$ 次，观测值分别为 $\dfrac{\pi}{3}, \dfrac{\pi}{6}, \dfrac{\pi}{2}, \dfrac{\pi}{6}, \dfrac{\pi}{4}$，求 $\theta$ 的矩估计值。
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）求 $Y$ 的分布：**

先计算单次观测"成功"（$X>\frac{\pi\theta}{3}$）的概率 $p$：

$$p = P\!\left(X>\frac{\pi\theta}{3}\right) = \int_{\pi\theta/3}^{\pi\theta}\frac{1}{2\theta}\sin\frac{x}{\theta}\,dx$$

令 $u=\frac{x}{\theta}$，$dx=\theta\,du$：

$$p = \int_{\pi/3}^{\pi}\frac{1}{2\theta}\sin u\cdot\theta\,du = \frac{1}{2}\int_{\pi/3}^{\pi}\sin u\,du = \frac{1}{2}\Big[-\cos u\Big]_{\pi/3}^{\pi} = \frac{1}{2}\left(1-\left(-\frac{1}{2}\right)\right)=\frac{1}{2}\cdot\frac{3}{2}=\frac{3}{4}$$

$Y$ 为得到第 $2$ 个成功所需的观测次数，服从**负二项分布** $NB(2, p)$：

$$\boxed{P(Y=k) = \binom{k-1}{1}p^2(1-p)^{k-2} = (k-1)\left(\frac{3}{4}\right)^2\left(\frac{1}{4}\right)^{k-2}, \quad k=2,3,\ldots}$$

**（2）求 $\theta$ 的矩估计值：**

先求 $EX$：

$$EX = \int_0^{\pi\theta} x\cdot\frac{1}{2\theta}\sin\frac{x}{\theta}\,dx$$

令 $u=\frac{x}{\theta}$：

$$EX = \frac{\theta}{2}\int_0^{\pi} u\sin u\,du = \frac{\theta}{2}\Big[-u\cos u+\sin u\Big]_0^{\pi} = \frac{\theta}{2}\cdot\pi = \frac{\pi\theta}{2}$$

样本均值：

$$\bar{x}=\frac{1}{5}\left(\frac{\pi}{3}+\frac{\pi}{6}+\frac{\pi}{2}+\frac{\pi}{6}+\frac{\pi}{4}\right)=\frac{\pi}{5}\left(\frac{1}{3}+\frac{1}{6}+\frac{1}{2}+\frac{1}{6}+\frac{1}{4}\right)$$

$$=\frac{\pi}{5}\cdot\frac{4+2+6+2+3}{12}=\frac{\pi}{5}\cdot\frac{17}{12}=\frac{17\pi}{60}$$

由矩方程 $EX=\bar{x}$：

$$\frac{\pi\theta}{2}=\frac{17\pi}{60}\quad\Rightarrow\quad\boxed{\hat{\theta}=\frac{2\bar{x}}{\pi}=\frac{17}{30}}$$
:::

:::callout{kind=note label="知识卡片：负二项分布与矩估计"}
| 内容 | 公式 |
|------|------|
| 负二项分布 | $Y\sim NB(r,p)$：第 $r$ 次成功所需试验次数 |
| 概率律 | $P(Y=k)=\dbinom{k-1}{r-1}p^r(1-p)^{k-r},\ k=r,r+1,\ldots$ |
| 矩估计 | 令 $EX=\bar{X}$，解出参数 |
| 分部积分 | $\int u\sin u\,du=-u\cos u+\sin u+C$ |
| 本题 | $r=2,\ p=\frac{3}{4}$；$EX=\frac{\pi\theta}{2}$ |
:::

:::callout{kind=tip label="结论速记"}
"第 2 个成功停止" $\Rightarrow$ 负二项 $NB(2,p)$；矩估计令 $EX=\bar{x}$，解得 $\hat{\theta}=\dfrac{17}{30}$。
:::

---

## 六、计算题（共 14 分）

### 第14题

:::callout{kind=note label="题目"}
设随机变量 $Y$ 的密度函数为

$$f_Y(y) = \begin{cases} 5y^4, & 0\leq y\leq 1 \\ 0, & \text{其他} \end{cases}$$

随机变量 $X$ 关于 $Y$ 的条件密度函数为：当 $0 < y < 1$ 时，

$$f(x\mid y) = \begin{cases} \dfrac{3x^2}{y^3}, & 0\leq x\leq y \\ 0, & \text{其他} \end{cases}$$

求：

（1）$P\!\left(X > \dfrac{1}{2}\right)$；

（2）$\rho_{XY}$。
:::

:::callout{kind=insight label="解析"}
**【解】**

**联合密度：**

$$f(x,y)=f(x\mid y)\,f_Y(y)=\frac{3x^2}{y^3}\cdot 5y^4=15x^2 y,\quad 0\leq x\leq y\leq 1$$

**（1）求 $P\!\left(X>\frac{1}{2}\right)$：**

注意区域 $0\leq x\leq y\leq 1$，当 $x>\frac{1}{2}$ 时 $y$ 从 $x$ 到 $1$：

$$P\!\left(X>\frac{1}{2}\right)=\int_{1/2}^{1}\int_{x}^{1}15x^2 y\,dy\,dx$$

内层积分：

$$\int_{x}^{1}15x^2 y\,dy=15x^2\cdot\frac{1-x^2}{2}=\frac{15}{2}x^2(1-x^2)$$

外层积分：

$$P=\frac{15}{2}\int_{1/2}^{1}(x^2-x^4)\,dx=\frac{15}{2}\left[\frac{x^3}{3}-\frac{x^5}{5}\right]_{1/2}^{1}=\frac{15}{2}\left(\frac{2}{15}-\left(\frac{1}{24}-\frac{1}{160}\right)\right)$$

$$=\frac{15}{2}\left(\frac{2}{15}-\frac{20-3}{480}\right)=\frac{15}{2}\left(\frac{2}{15}-\frac{17}{480}\right)=\frac{15}{2}\cdot\frac{64-17}{480}=\frac{15}{2}\cdot\frac{47}{480}$$

$$\boxed{P\!\left(X>\frac{1}{2}\right)=\frac{47}{64}}$$

**（2）求 $\rho_{XY}$：**

逐项计算各阶矩：

$$EX=\int_0^1\int_0^y x\cdot 15x^2 y\,dx\,dy=\int_0^1 15y\cdot\frac{y^4}{4}\,dy=\frac{15}{4}\int_0^1 y^5\,dy=\frac{15}{24}=\frac{5}{8}$$

$$EY=\int_0^1 y\cdot 5y^4\,dy=\frac{5}{6}$$

$$EX^2=\int_0^1\int_0^y x^2\cdot 15x^2 y\,dx\,dy=\int_0^1 3y^6\,dy=\frac{3}{7}$$

$$DX=EX^2-(EX)^2=\frac{3}{7}-\frac{25}{64}=\frac{192-175}{448}=\frac{17}{448}$$

$$DY=EY^2-(EY)^2=\int_0^1 y^2\cdot 5y^4\,dy-\frac{25}{36}=\frac{5}{7}-\frac{25}{36}=\frac{180-175}{252}=\frac{5}{252}$$

$$EXY=\int_0^1\int_0^y xy\cdot 15x^2 y\,dx\,dy=\int_0^1 15y^2\cdot\frac{y^4}{4}\,dy=\frac{15}{4}\int_0^1 y^6\,dy=\frac{15}{4}\cdot\frac{1}{7}=\frac{15}{28}$$

$$\mathrm{Cov}(X,Y)=EXY-EX\cdot EY=\frac{15}{28}-\frac{5}{8}\cdot\frac{5}{6}=\frac{180}{336}-\frac{175}{336}=\frac{5}{336}$$

$$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{DX\cdot DY}}=\frac{\dfrac{5}{336}}{\sqrt{\dfrac{17}{448}\cdot\dfrac{5}{252}}}=\frac{\dfrac{5}{336}}{\sqrt{\dfrac{85}{112896}}}=\frac{\dfrac{5}{336}}{\dfrac{\sqrt{85}}{336}}=\frac{5}{\sqrt{85}}=\frac{5}{\sqrt{5\cdot 17}}=\frac{\sqrt{5}}{\sqrt{17}}$$

$$\boxed{\rho_{XY}=\sqrt{\frac{5}{17}}}$$
:::

:::callout{kind=note label="知识卡片：联合密度与相关系数计算"}
| 步骤 | 公式 |
|------|------|
| 联合密度 | $f(x,y)=f(x\mid y)\,f_Y(y)$ |
| 边缘密度 | $f_X(x)=\int f(x,y)\,dy$ |
| 矩计算 | $EX^k Y^l=\iint x^k y^l f(x,y)\,dx\,dy$ |
| 协方差 | $\mathrm{Cov}(X,Y)=EXY-EX\cdot EY$ |
| 相关系数 | $\rho_{XY}=\dfrac{\mathrm{Cov}(X,Y)}{\sqrt{DX\cdot DY}}$ |
| 积分区域 | 注意 $0\leq x\leq y\leq 1$ 的支撑集 |
:::

:::callout{kind=tip label="结论速记"}
联合密度 $=$ 条件密度 $\times$ 边缘密度；相关系数需依次算 $EX, EY, DX, DY, \mathrm{Cov}$ 五大量。
:::

---

## 七、计算题（共 10 分）

### 第15题

:::callout{kind=note label="题目"}
设某类电子元件的失效时间为 $T$（单位：小时），其密度函数为

$$f(t) = \begin{cases} \beta\mathrm{e}^{-\beta(t-t_0)}, & t > t_0 \\ 0, & t\leq t_0 \end{cases}$$

其中参数 $\beta > 0$，$t_0 \geq 0$。假定现在拟独立地对 $n$ 个此类元件进行试验，记录其失效时间分别为 $T_1, T_2, \ldots, T_n$。

（1）当 $t_0$ 已知时，求 $\dfrac{1}{\beta}$ 的极大似然估计量，判断它是否为无偏估计量；

（2）当 $\beta$ 已知时，求 $t_0$ 的最大似然估计量，判断它是否为渐近无偏估计量。
:::

:::callout{kind=insight label="解析"}
**【解】**

**（1）$t_0$ 已知，求 $\frac{1}{\beta}$ 的 MLE：**

似然函数（要求所有 $T_i > t_0$）：

$$L(\beta)=\prod_{i=1}^n \beta\mathrm{e}^{-\beta(T_i-t_0)}=\beta^n\exp\!\left(-\beta\sum_{i=1}^n(T_i-t_0)\right)$$

对数似然：

$$\ln L(\beta)=n\ln\beta-\beta\sum_{i=1}^n(T_i-t_0)$$

求导令其为零：

$$\frac{d\ln L}{d\beta}=\frac{n}{\beta}-\sum_{i=1}^n(T_i-t_0)=0\quad\Rightarrow\quad\hat{\beta}=\frac{n}{\displaystyle\sum_{i=1}^n(T_i-t_0)}$$

由 MLE 的**不变性**：

$$\widehat{1/\beta}=\frac{1}{\hat{\beta}}=\frac{1}{n}\sum_{i=1}^n(T_i-t_0)$$

**无偏性判断**：令 $W_i=T_i-t_0$，则 $W_i\sim E(\beta)$（平移后标准指数），$EW_i=\frac{1}{\beta}$。

$$E\!\left[\widehat{1/\beta}\right]=\frac{1}{n}\sum_{i=1}^n E(T_i-t_0)=\frac{1}{n}\cdot n\cdot\frac{1}{\beta}=\frac{1}{\beta}$$

故 $\widehat{1/\beta}=\dfrac{1}{n}\displaystyle\sum_{i=1}^n(T_i-t_0)$ 是 $\dfrac{1}{\beta}$ 的**无偏估计**。

**（2）$\beta$ 已知，求 $t_0$ 的 MLE：**

似然函数 $L(t_0)=\beta^n\exp\!\left(-\beta\sum(T_i-t_0)\right)$，要求 $t_0 < \min_i T_i = T_{(1)}$。

展开：

$$L(t_0)=\beta^n\exp\!\left(-\beta\sum T_i+n\beta t_0\right)$$

$L$ 关于 $t_0$ 单调递增（因 $n\beta>0$），故在约束 $t_0\leq T_{(1)}$ 下，$L$ 在 $t_0=T_{(1)}$ 处取最大值：

$$\hat{t}_0=T_{(1)}=\min_i T_i$$

**渐近无偏性判断**：

$T_i = t_0 + W_i$，$W_i\sim E(\beta)$，故 $T_{(1)}=t_0+W_{(1)}$，其中 $W_{(1)}=\min_i W_i\sim E(n\beta)$（指数分布最小值仍指数，参数变 $n$ 倍）。

$$E\hat{t}_0=t_0+E W_{(1)}=t_0+\frac{1}{n\beta}$$

当 $n\to\infty$ 时，$E\hat{t}_0\to t_0$，故 $\hat{t}_0$ 是**渐近无偏**的（但非无偏，偏差为 $\frac{1}{n\beta}$）。
:::

:::callout{kind=note label="知识卡片：极大似然估计与无偏性"}
| 内容 | 公式 / 结论 |
|------|------|
| 似然函数 | $L(\theta)=\prod f(T_i;\theta)$ |
| 对数似然求导 | $\dfrac{\partial\ln L}{\partial\theta}=0$ |
| 不变性原理 | $\hat{g(\theta)}=g(\hat{\theta})$ |
| 无偏性 | $E\hat{\theta}=\theta$ |
| 渐近无偏 | $\lim_{n\to\infty}E\hat{\theta}=\theta$ |
| 指数最小值 | $W_i\sim E(\beta)\Rightarrow\min W_i\sim E(n\beta)$ |
| 平移参数 MLE | 单调似然 $\Rightarrow$ 取边界 $\hat{t}_0=T_{(1)}$ |
:::

:::callout{kind=tip label="结论速记"}
$t_0$ 已知：$\widehat{1/\beta}=\dfrac{1}{n}\sum(T_i-t_0)$ 无偏；$\beta$ 已知：$\hat{t}_0=T_{(1)}$，偏差 $\frac{1}{n\beta}$，渐近无偏。
:::

---
