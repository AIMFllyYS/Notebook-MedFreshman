# AI押题模拟卷二·Claude生成

> 来源：AI生成押题卷（Claude）·华中科技大学《概率论与数理统计》
> 考试类型：期末押题模拟
> 题量：选择题10题 + 填空题8题 + 计算题7题

---

## 一、单项选择题（每小题2分，共20分）

### 第1题

:::callout{kind=note label="题目"}
设 $A$、$B$ 为两事件，$P(A)=0.4$，$P(B)=0.3$，$P(A\cup B)=0.6$，则 $P(A\mid B)=$（　　）

A. $\frac{1}{4}$

B. $\frac{1}{3}$

C. $\frac{1}{2}$

D. $\frac{2}{3}$
:::

:::callout{kind=insight label="解析"}
先求交事件概率：

$$P(AB)=P(A)+P(B)-P(A\cup B)=0.4+0.3-0.6=0.1$$

再由条件概率定义：

$$P(A\mid B)=\frac{P(AB)}{P(B)}=\frac{0.1}{0.3}=\frac{1}{3}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
条件概率 $P(A\mid B)=\frac{P(AB)}{P(B)}$；求交事件用加法公式 $P(AB)=P(A)+P(B)-P(A\cup B)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：加法公式 $P(A\cup B)=P(A)+P(B)-P(AB)$；条件概率 $P(A\mid B)=\frac{P(AB)}{P(B)}$。

**解题方法**：已知 $P(A)$、$P(B)$、$P(A\cup B)$ 时，先反解 $P(AB)$，再代入条件概率公式。

**易错警示**：不要把 $P(A\mid B)$ 与 $P(B\mid A)$ 混淆；$P(A\mid B)$ 的分母是 $P(B)$。

**关联考点**：考点二·概率基本概念与计算；考点三·贝叶斯公式。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设 $X\sim N(1,4)$，则 $P\{-1<X<3\}=$（　　）

A. $2\Phi(1)-1$

B. $\Phi(1)-1$

C. $2\Phi(2)-1$

D. $\Phi(2)-\Phi(1)$
:::

:::callout{kind=insight label="解析"}
$X\sim N(1,4)$，即 $\mu=1$，$\sigma=2$。标准化：

$$P\{-1<X<3\}=P\left\{\frac{-1-1}{2}<\frac{X-1}{2}<\frac{3-1}{2}\right\}=P\{-1<Z<1\}$$

其中 $Z\sim N(0,1)$。由标准正态分布对称性：

$$P\{-1<Z<1\}=\Phi(1)-\Phi(-1)=2\Phi(1)-1$$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
正态分布标准化：$X\sim N(\mu,\sigma^2)$ 时，$\frac{X-\mu}{\sigma}\sim N(0,1)$；$P\{|X-\mu|<\sigma\}=2\Phi(1)-1$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：若 $X\sim N(\mu,\sigma^2)$，则 $F_X(x)=\Phi\left(\frac{x-\mu}{\sigma}\right)$；$P\{a<X<b\}=\Phi\left(\frac{b-\mu}{\sigma}\right)-\Phi\left(\frac{a-\mu}{\sigma}\right)$。

**解题方法**：遇到一般正态概率，先标准化为标准正态，再查 $\Phi$ 表或利用对称性。

**易错警示**：标准化时分母是 $\sigma$（本题是 $2$），不是 $\sigma^2$；$\Phi(-x)=1-\Phi(x)$。

**关联考点**：考点七·随机变量函数的分布；考点六·连续型随机变量的分布。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $X\sim B(n,p)$，且 $E(X)=2.4$，$D(X)=1.44$，则 $n=$（　　）

A. $4$

B. $5$

C. $6$

D. $8$
:::

:::callout{kind=insight label="解析"}
二项分布 $X\sim B(n,p)$ 满足 $E(X)=np$，$D(X)=np(1-p)$。由题意：

$$np=2.4,\quad np(1-p)=1.44$$

两式相除：

$$1-p=\frac{1.44}{2.4}=0.6\Rightarrow p=0.4$$

代回 $np=2.4$：

$$n=\frac{2.4}{0.4}=6$$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
二项分布 $B(n,p)$：$E=np$，$D=np(1-p)$；由期望和方差可联立解出 $n$、$p$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim B(n,p)$，$P\{X=k\}=C_n^k p^k(1-p)^{n-k}$，$E(X)=np$，$D(X)=np(1-p)$。

**解题方法**：已知期望和方差，两式相除消去 $n$ 得 $1-p$，再代回求 $n$。

**易错警示**：不要把 $np(1-p)$ 误写为 $np^2$；$n$ 必须是正整数，解出后要验证。

**关联考点**：考点五·离散型随机变量的分布；考点十一·期望与方差。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设二维随机变量 $(X,Y)$ 的分布律为下表，则 $\mathrm{Cov}(X,Y)=$（　　）

| $X\backslash Y$ | $0$ | $1$ |
|---|---|---|
| $0$ | $0.4$ | $0.1$ |
| $1$ | $0.2$ | $0.3$ |

A. $-0.1$

B. $0$

C. $0.1$

D. $0.2$
:::

:::callout{kind=insight label="解析"}
由联合分布律求边缘：

$$P\{X=0\}=0.5,\quad P\{X=1\}=0.5$$
$$P\{Y=0\}=0.6,\quad P\{Y=1\}=0.4$$

期望：

$$E(X)=0.5,\quad E(Y)=0.4$$

$$E(XY)=0\times0\times0.4+0\times1\times0.1+1\times0\times0.2+1\times1\times0.3=0.3$$

协方差：

$$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=0.3-0.5\times0.4=0.1$$

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
离散型协方差：$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$；$E(XY)$ 是对所有非零 $xy$ 的取值乘概率求和。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$；$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)D(Y)}}$。

**解题方法**：先求边缘分布算 $E(X)$、$E(Y)$，再直接按联合律算 $E(XY)$，最后相减。

**易错警示**：$E(XY)$ 不等于 $E(X)E(Y)$ 除非 $X$、$Y$ 独立；本题只有 $X=1,Y=1$ 时 $XY$ 非零。

**关联考点**：考点十二·协方差与相关系数。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X\sim N(0,1)$，令 $Y=X^2$，则 $X$ 与 $Y$（　　）

A. 相互独立

B. 不相关，但不独立

C. 相关且独立

D. 相关，但独立
:::

:::callout{kind=insight label="解析"}
$X\sim N(0,1)$，则 $E(X)=0$。$Y=X^2$，$E(Y)=E(X^2)=1$。

$$E(XY)=E(X^3)=0$$

因为标准正态分布的三阶矩为 $0$（奇函数关于原点对称）。故

$$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=0-0=0$$

$X$ 与 $Y$ 不相关。但 $Y=X^2$ 是 $X$ 的确定函数，二者存在函数关系，因此不独立。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
不相关只能推出“无线性关系”，推不出独立；$Y=X^2$ 是判断“不相关但不独立”的经典反例。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim N(0,1)$ 时，$E(X)=0$，$E(X^2)=1$，$E(X^3)=0$；$\mathrm{Cov}(X,Y)=0$ 等价于 $X$、$Y$ 不相关。

**解题方法**：判断独立与不相关时，先算协方差判断是否相关；再看是否存在函数关系判断是否独立。

**易错警示**：独立 ⇒ 不相关，但 converse 不成立；不要从“协方差为0”直接跳到“独立”。

**关联考点**：考点十二·协方差与相关系数。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设 $X\sim N(0,1)$，$Y\sim\chi^2(n)$，且 $X$、$Y$ 相互独立，则统计量 $\frac{X}{\sqrt{Y/n}}$ 服从（　　）

A. $N(0,1)$

B. $t(n)$

C. $\chi^2(n)$

D. $F(1,n)$
:::

:::callout{kind=insight label="解析"}
$t$ 分布的定义：若 $Z\sim N(0,1)$，$V\sim\chi^2(n)$，且 $Z$、$V$ 独立，则

$$T=\frac{Z}{\sqrt{V/n}}\sim t(n)$$

本题中 $X$ 对应 $Z$，$Y$ 对应 $V$，因此统计量 $\frac{X}{\sqrt{Y/n}}\sim t(n)$。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布构造：$\frac{N(0,1)}{\sqrt{\chi^2(n)/n}}$；$F$ 分布构造：$\frac{\chi^2(m)/m}{\chi^2(n)/n}$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：三大抽样分布：$\chi^2(n)$ 是 $n$ 个独立标准正态的平方和；$t(n)=\frac{Z}{\sqrt{V/n}}$；$F(m,n)=\frac{U/m}{V/n}$。

**解题方法**：识别分子分母的分布类型：标准正态比卡方根号 → $t$；卡方比卡方 → $F$。

**易错警示**：$t$ 分布分母必须是“卡方除以自己的自由度再开根号”；不要混淆自由度位置。

**关联考点**：考点十五·三大分布。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $X_1,\ldots,X_n$ 是来自正态总体 $N(\mu,\sigma^2)$ 的样本，$\bar{X}$、$S^2$ 分别为样本均值与样本方差，则下列结论正确的是（　　）

A. $\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim t(n-1)$

B. $\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$

C. $\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n)$

D. $\bar{X}\sim N(\mu,\sigma^2)$
:::

:::callout{kind=insight label="解析"}
对正态总体：
- $\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim N(0,1)$，不是 $t(n-1)$，故 A 错。
- $\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$，不是 $\chi^2(n)$，故 C 错。
- $\bar{X}\sim N\!\left(\mu,\frac{\sigma^2}{n}\right)$，不是 $N(\mu,\sigma^2)$，故 D 错。
- $\sigma$ 未知时，$\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$，B 正确。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\sigma$ 已知用 $Z$；$\sigma$ 未知用 $t$；$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$；$\bar{X}\sim N(\mu,\sigma^2/n)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：正态总体抽样分布基本结论：$\bar{X}\sim N(\mu,\sigma^2/n)$；$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$；$\bar{X}$ 与 $S^2$ 独立；$\sigma$ 未知时 $\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$。

**解题方法**：先判断总体参数是否已知，再对应选择 $Z$、$t$、$\chi^2$ 分布；注意自由度是 $n-1$。

**易错警示**：$\bar{X}$ 的方差是 $\sigma^2/n$ 而不是 $\sigma^2$；$S^2$ 对应的卡方自由度是 $n-1$。

**关联考点**：考点十五·三大分布；考点十七·区间估计。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设 $X_1,X_2,\ldots$ 独立同分布，$E(X_i)=\mu$，$D(X_i)=\sigma^2>0$，$\Phi(x)$ 为标准正态分布函数，则对任意实数 $x$，

$$\lim_{n\to\infty}P\left\{\frac{\sum_{i=1}^{n}X_i-n\mu}{\sigma\sqrt{n}}\le x\right\}=$$
（　　）

A. $0$

B. $1$

C. $\Phi(x)$

D. $1-\Phi(x)$
:::

:::callout{kind=insight label="解析"}
由独立同分布中心极限定理（Lindeberg–Lévy）：

$$\frac{\sum_{i=1}^{n}X_i-n\mu}{\sigma\sqrt{n}}\xrightarrow{d}N(0,1)$$

因此其分布函数的极限为标准正态分布函数 $\Phi(x)$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
中心极限定理：标准化和 $\frac{\sum X_i-n\mu}{\sigma\sqrt{n}}$ 的极限分布是 $N(0,1)$，分布函数极限为 $\Phi(x)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：Lindeberg–Lévy CLT：$\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\xrightarrow{d}N(0,1)$；De Moivre–Laplace 是二项分布情形的特例。

**解题方法**：看到“独立同分布、$n$ 充分大、标准化”立即套用 CLT；注意分子是“和减期望”，分母是“标准差乘以 $\sqrt{n}$”。

**易错警示**：分母是 $\sigma\sqrt{n}$，不是 $\sigma^2\sqrt{n}$；极限分布函数是 $\Phi(x)$，不是 $1-\Phi(x)$。

**关联考点**：考点十三·大数定律和中心极限定理。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设总体 $X\sim N(\mu,\sigma^2)$，$\mu$ 未知，$X_1,X_2,X_3,X_4$ 为样本。以下都是 $\mu$ 的无偏估计，其中方差最小的是（　　）

A. $\frac{1}{2}X_1+\frac{1}{2}X_2$

B. $\frac{1}{4}(X_1+X_2+X_3+X_4)$

C. $\frac{1}{3}(X_1+X_2+X_3)$

D. $\frac{1}{6}X_1+\frac{1}{3}X_2+\frac{1}{3}X_3+\frac{1}{6}X_4$
:::

:::callout{kind=insight label="解析"}
样本独立同方差 $\sigma^2$，线性估计 $L=\sum a_iX_i$ 的方差为 $D(L)=\sigma^2\sum a_i^2$。

各选项系数平方和：
- A：$\frac{1}{4}+\frac{1}{4}=\frac{1}{2}$
- B：$4\times\frac{1}{16}=\frac{1}{4}$
- C：$3\times\frac{1}{9}=\frac{1}{3}$
- D：$\frac{1}{36}+\frac{1}{9}+\frac{1}{9}+\frac{1}{36}=\frac{10}{36}=\frac{5}{18}\approx0.278$

最小的是 B（$\frac{1}{4}$），即等权样本均值。这与“样本均值是总体均值的最小方差无偏估计”一致。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
独立同方差下，$D\left(\sum a_iX_i\right)=\sigma^2\sum a_i^2$；等权样本均值的方差最小。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$D\left(\sum a_iX_i\right)=\sum a_i^2D(X_i)$（独立时）；$D(\bar{X})=\sigma^2/n$。

**解题方法**：验证无偏性（系数和为1）后，比较系数平方和，平方和最小者方差最小。

**易错警示**：方差最小不是样本量最小；等权样本均值在所有无偏线性估计中方差最小（Gauss–Markov）。

**关联考点**：考点十一·期望与方差；考点十四·总体与样本。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $F\sim F(m,n)$，$F_\alpha(m,n)$ 为其上 $\alpha$ 分位点（即 $P\{F>F_\alpha(m,n)\}=\alpha$），则 $F_{1-\alpha}(m,n)=$（　　）

A. $\frac{1}{F_\alpha(m,n)}$

B. $\frac{1}{F_\alpha(n,m)}$

C. $-F_\alpha(m,n)$

D. $F_\alpha(n,m)$
:::

:::callout{kind=insight label="解析"}
$F$ 分布的重要性质：若 $F\sim F(m,n)$，则 $\frac{1}{F}\sim F(n,m)$。

由分位点定义：

$$P\{F>F_{1-\alpha}(m,n)\}=1-\alpha\Leftrightarrow P\left\{\frac{1}{F}<\frac{1}{F_{1-\alpha}(m,n)}\right\}=1-\alpha$$

而 $\frac{1}{F}\sim F(n,m)$，故

$$P\left\{\frac{1}{F}>\frac{1}{F_{1-\alpha}(m,n)}\right\}=\alpha\Rightarrow \frac{1}{F_{1-\alpha}(m,n)}=F_\alpha(n,m)$$

因此

$$F_{1-\alpha}(m,n)=\frac{1}{F_\alpha(n,m)}$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$F$ 分位点关系：$F_{1-\alpha}(m,n)=\frac{1}{F_\alpha(n,m)}$；注意自由度顺序互换。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$F\sim F(m,n)$，$\frac{1}{F}\sim F(n,m)$；$F_{1-\alpha}(m,n)=1/F_\alpha(n,m)$。

**解题方法**：利用倒数关系转换自由度顺序；注意 $F$ 分布取值非负，不存在负分位点。

**易错警示**：$F_{1-\alpha}(m,n)$ 不等于 $1/F_\alpha(m,n)$，自由度必须互换。

**关联考点**：考点十五·三大分布。
:::

---

## 二、填空题（每小题2分，共16分）

### 第11题

:::callout{kind=note label="题目"}
设 $P(A)=0.5$，$P(B)=0.6$，$P(B\mid A)=0.8$，则 $P(A\cup B)=$__________。
:::

:::callout{kind=insight label="解析"}
由乘法公式：

$$P(AB)=P(A)P(B\mid A)=0.5\times0.8=0.4$$

再由加法公式：

$$P(A\cup B)=P(A)+P(B)-P(AB)=0.5+0.6-0.4=0.7$$

答案：$0.7$。
:::

:::callout{kind=tip label="结论速记"}
乘法公式 $P(AB)=P(A)P(B\mid A)$；加法公式 $P(A\cup B)=P(A)+P(B)-P(AB)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：乘法公式 $P(AB)=P(A)P(B\mid A)$；加法公式 $P(A\cup B)=P(A)+P(B)-P(AB)$。

**解题方法**：已知条件概率时先求交事件概率；再用加法公式求并事件概率。

**易错警示**：$P(B\mid A)$ 不等于 $P(B)$，不要直接用 $P(A)P(B)$ 算 $P(AB)$。

**关联考点**：考点二·概率基本概念与计算。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的概率密度 $f(x)=cx^2$（$0\le x\le1$），其余为 $0$，则常数 $c=$__________。
:::

:::callout{kind=insight label="解析"}
由密度函数的规范性：

$$\int_{0}^{1}cx^2\,dx=1\Rightarrow c\cdot\frac{1}{3}=1\Rightarrow c=3$$

答案：$3$。
:::

:::callout{kind=tip label="结论速记"}
密度函数必须满足 $\int_{-\infty}^{+\infty}f(x)\,dx=1$；幂函数积分 $\int_0^1 x^2 dx=1/3$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：连续型密度规范性 $\int f(x)dx=1$；$\int_0^1 x^k dx=\frac{1}{k+1}$。

**解题方法**：写出密度非零区间的积分等于1，解出常数。

**易错警示**：$cx^2$ 的积分是 $c/3$ 而不是 $c$；注意区间端点是否包含不影响积分值。

**关联考点**：考点六·连续型随机变量的分布。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设 $X\sim P(\lambda)$（泊松分布），且 $P\{X=1\}=P\{X=2\}$，则 $\lambda=$__________。
:::

:::callout{kind=insight label="解析"}
泊松分布 $P\{X=k\}=\frac{\lambda^k}{k!}e^{-\lambda}$。由 $P\{X=1\}=P\{X=2\}$：

$$\frac{\lambda}{1!}e^{-\lambda}=\frac{\lambda^2}{2!}e^{-\lambda}$$

约去 $e^{-\lambda}$（$\lambda>0$）：

$$\lambda=\frac{\lambda^2}{2}\Rightarrow \lambda=2$$

答案：$2$。
:::

:::callout{kind=tip label="结论速记"}
泊松分布概率质量函数 $P\{X=k\}=\frac{\lambda^k}{k!}e^{-\lambda}$；令相邻概率相等可解参数。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim P(\lambda)$，$P\{X=k\}=\frac{\lambda^k}{k!}e^{-\lambda}$，$E(X)=D(X)=\lambda$。

**解题方法**：根据概率等式列方程，注意约去公共因子后求解。

**易错警示**：$P\{X=1\}=P\{X=2\}$ 不要直接令 $1=2$；要完整代入泊松概率公式。

**关联考点**：考点五·离散型随机变量的分布。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设 $X\sim U(0,6)$（均匀分布），则 $D(X)=$__________。
:::

:::callout{kind=insight label="解析"}
均匀分布 $U(a,b)$ 的方差为

$$D(X)=\frac{(b-a)^2}{12}$$

代入 $a=0$，$b=6$：

$$D(X)=\frac{6^2}{12}=\frac{36}{12}=3$$

答案：$3$。
:::

:::callout{kind=tip label="结论速记"}
均匀分布 $U(a,b)$：$E(X)=\frac{a+b}{2}$，$D(X)=\frac{(b-a)^2}{12}$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim U(a,b)$，$f(x)=\frac{1}{b-a}$（$a<x<b$），$E(X)=\frac{a+b}{2}$，$D(X)=\frac{(b-a)^2}{12}$。

**解题方法**：均匀分布方差只与区间长度有关，直接用公式。

**易错警示**：不要把方差写成 $(b-a)^2/4$ 或 $(b-a)^2$；区间是 $(0,6)$ 不是 $(0,3)$。

**关联考点**：考点六·连续型随机变量的分布。
:::

---

### 第15题

:::callout{kind=note label="题目"}
设 $X$、$Y$ 相互独立，$D(X)=4$，$D(Y)=9$，则 $D(2X-Y+1)=$__________。
:::

:::callout{kind=insight label="解析"}
由方差线性性质，独立时协方差为 $0$：

$$D(2X-Y+1)=D(2X-Y)=4D(X)+D(Y)=4\times4+9=16+9=25$$

答案：$25$。
:::

:::callout{kind=tip label="结论速记"}
独立时 $D(aX+bY+c)=a^2D(X)+b^2D(Y)$；常数项方差为 $0$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$D(aX+bY+c)=a^2D(X)+b^2D(Y)+2ab\,\mathrm{Cov}(X,Y)$；独立时 $\mathrm{Cov}=0$。

**解题方法**：先判断独立与否，再决定是否保留协方差项；注意常数项不影响方差。

**易错警示**：$D(2X-Y)$ 不是 $4D(X)-D(Y)$，而是 $4D(X)+D(Y)$。

**关联考点**：考点十一·期望与方差。
:::

---

### 第16题

:::callout{kind=note label="题目"}
设 $D(X)=1$，$D(Y)=4$，$\mathrm{Cov}(X,Y)=1$，则相关系数 $\rho_{XY}=$__________。
:::

:::callout{kind=insight label="解析"}
由相关系数定义：

$$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)}\sqrt{D(Y)}}=\frac{1}{\sqrt{1}\times\sqrt{4}}=\frac{1}{2}=0.5$$

答案：$0.5$。
:::

:::callout{kind=tip label="结论速记"}
$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)D(Y)}}$；取值范围 $[-1,1]$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)}\sqrt{D(Y)}}$；$\rho=1$ 表示完全正线性相关，$\rho=-1$ 表示完全负线性相关，$\rho=0$ 表示不相关。

**解题方法**：先算协方差和方差，再代入公式；注意开方。

**易错警示**：$\rho_{XY}$ 的分母是标准差乘积，不是方差乘积。

**关联考点**：考点十二·协方差与相关系数。
:::

---

### 第17题

:::callout{kind=note label="题目"}
设 $X_1,\ldots,X_n$ 是来自 $N(\mu,\sigma^2)$ 的样本，则样本均值 $\bar{X}$ 服从的分布为__________。
:::

:::callout{kind=insight label="解析"}
正态总体样本均值仍服从正态分布，且

$$E(\bar{X})=\mu,\quad D(\bar{X})=\frac{\sigma^2}{n}$$

因此

$$\bar{X}\sim N\!\left(\mu,\frac{\sigma^2}{n}\right)$$

答案：$N\!\left(\mu,\frac{\sigma^2}{n}\right)$。
:::

:::callout{kind=tip label="结论速记"}
样本均值 $\bar{X}\sim N(\mu,\sigma^2/n)$；方差随样本量 $n$ 增大而减小。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：独立正态变量的线性组合仍正态；$\bar{X}=\frac{1}{n}\sum X_i$，$D(\bar{X})=\frac{\sigma^2}{n}$。

**解题方法**：求样本均值分布时，用“独立正态线性组合仍正态”加期望方差计算。

**易错警示**：$\bar{X}$ 的方差是 $\sigma^2/n$ 而不是 $\sigma^2$；分布是 $N(\mu,\sigma^2/n)$，不要写成参数 $(\mu,\sigma/\sqrt{n})$。

**关联考点**：考点十五·三大分布；考点十四·总体与样本。
:::

---

### 第18题

:::callout{kind=note label="题目"}
设 $X_1,\ldots,X_n$ 是来自标准正态总体 $N(0,1)$ 的样本，则 $\sum_{i=1}^{n}X_i^2$ 服从的分布为__________。
:::

:::callout{kind=insight label="解析"}
由 $\chi^2$ 分布的定义：$n$ 个相互独立的标准正态随机变量的平方和服从自由度为 $n$ 的 $\chi^2$ 分布。因此

$$\sum_{i=1}^{n}X_i^2\sim\chi^2(n)$$

答案：$\chi^2(n)$。
:::

:::callout{kind=tip label="结论速记"}
$\chi^2(n)$ 定义：$n$ 个独立 $N(0,1)$ 变量的平方和；期望 $n$，方差 $2n$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：若 $Z_i\stackrel{iid}{\sim}N(0,1)$，则 $\sum_{i=1}^n Z_i^2\sim\chi^2(n)$；$E(\chi^2(n))=n$，$D(\chi^2(n))=2n$。

**解题方法**：识别“独立标准正态的平方和”即卡方分布；注意自由度是变量个数。

**易错警示**：$X_i\sim N(0,1)$ 是前提；若 $X_i\sim N(\mu,\sigma^2)$，需先标准化。

**关联考点**：考点十五·三大分布。
:::

---

## 三、计算题（共64分）

### 第19题

:::callout{kind=note label="题目"}
某工厂由甲、乙、丙三条流水线生产同一种产品，产量分别占全厂的 $25\%$、$35\%$、$40\%$；相应的次品率分别为 $5\%$、$4\%$、$2\%$。现从该厂全部产品中任取一件。

（1）求取到次品的概率；

（2）已知取到的是次品，求它来自乙流水线的概率。
:::

:::callout{kind=insight label="解析"}
设 $B_1,B_2,B_3$ 分别表示产品来自甲、乙、丙流水线，$A$ 表示产品为次品。已知

$$P(B_1)=0.25,\ P(B_2)=0.35,\ P(B_3)=0.40$$
$$P(A\mid B_1)=0.05,\ P(A\mid B_2)=0.04,\ P(A\mid B_3)=0.02$$

（1）由全概率公式：

$$P(A)=\sum_{i=1}^{3}P(B_i)P(A\mid B_i)=0.25\times0.05+0.35\times0.04+0.40\times0.02=0.0345$$

（2）由贝叶斯公式：

$$P(B_2\mid A)=\frac{P(B_2)P(A\mid B_2)}{P(A)}=\frac{0.35\times0.04}{0.0345}=\frac{0.014}{0.0345}\approx0.4058$$
:::

:::callout{kind=tip label="结论速记"}
全概率求“结果”的总概率；贝叶斯求“已知结果，追溯原因”的后验概率。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：全概率 $P(A)=\sum_i P(B_i)P(A\mid B_i)$；贝叶斯 $P(B_j\mid A)=\frac{P(B_j)P(A\mid B_j)}{P(A)}$。

**解题方法**：列出所有可能原因（划分）及其概率、条件概率；全概率求和，贝叶斯用单一路径除以总概率。

**易错警示**：分母必须是全概率算出的 $P(A)$；不要混淆先验 $P(B_i)$ 与条件 $P(A\mid B_i)$。

**关联考点**：考点三·贝叶斯公式；考点十八·综合题。
:::

---

### 第20题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的概率密度为

$$f(x)=\begin{cases}\frac{x}{2},&0\le x\le2,\\0,&\text{其他}\end{cases}$$

（1）验证 $f(x)$ 满足密度的规范性并求分布函数 $F(x)$；

（2）求 $P\{0.5<X<1.5\}$；

（3）求 $E(X)$ 与 $D(X)$；

（4）设 $Y=X^2$，求 $Y$ 的概率密度 $f_Y(y)$。
:::

:::callout{kind=insight label="解析"}
（1）规范性：

$$\int_{0}^{2}\frac{x}{2}\,dx=\frac{x^2}{4}\bigg|_{0}^{2}=1$$

分布函数：当 $x<0$ 时 $F(x)=0$；当 $0\le x\le2$ 时

$$F(x)=\int_{0}^{x}\frac{t}{2}\,dt=\frac{x^2}{4}$$

当 $x>2$ 时 $F(x)=1$。故

$$F(x)=\begin{cases}0,&x<0,\\\frac{x^2}{4},&0\le x\le2,\\1,&x>2\end{cases}$$

（2）

$$P\{0.5<X<1.5\}=F(1.5)-F(0.5)=\frac{2.25}{4}-\frac{0.25}{4}=\frac{2}{4}=0.5$$

（3）

$$E(X)=\int_{0}^{2}x\cdot\frac{x}{2}\,dx=\int_{0}^{2}\frac{x^2}{2}\,dx=\frac{x^3}{6}\bigg|_{0}^{2}=\frac{4}{3}$$

$$E(X^2)=\int_{0}^{2}x^2\cdot\frac{x}{2}\,dx=\int_{0}^{2}\frac{x^3}{2}\,dx=\frac{x^4}{8}\bigg|_{0}^{2}=2$$

$$D(X)=E(X^2)-[E(X)]^2=2-\frac{16}{9}=\frac{2}{9}$$

（4）$y=x^2$ 在 $x\in(0,2)$ 上单调递增，反函数 $x=\sqrt{y}$，$y\in(0,4)$，导数 $\frac{dx}{dy}=\frac{1}{2\sqrt{y}}$。

由公式法：

$$f_Y(y)=f_X(\sqrt{y})\left|\frac{dx}{dy}\right|=\frac{\sqrt{y}}{2}\cdot\frac{1}{2\sqrt{y}}=\frac{1}{4},\quad0<y<4$$

即

$$f_Y(y)=\begin{cases}\frac{1}{4},&0<y<4,\\0,&\text{其他}\end{cases}$$
:::

:::callout{kind=tip label="结论速记"}
一维连续型：先验证规范性；分布函数分段积分；函数分布用公式法或分布函数法。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$F(x)=\int_{-\infty}^{x}f(t)\,dt$；$E(X^k)=\int x^k f(x)\,dx$；$D(X)=E(X^2)-[E(X)]^2$；函数分布公式法 $f_Y(y)=f_X(h(y))|h'(y)|$。

**解题方法**：密度含分段时，分布函数和期望都要分段讨论；函数分布先判断单调性，再求反函数和导数。

**易错警示**：$f_Y(y)$ 的支撑集是 $(0,4)$，不是 $(0,2)$；公式法别忘了绝对值。

**关联考点**：考点六·连续型随机变量的分布；考点七·随机变量函数的分布。
:::

---

### 第21题

:::callout{kind=note label="题目"}
设二维随机变量 $(X,Y)$ 的概率密度为

$$f(x,y)=\begin{cases}c(x+y),&0\le x\le1,\ 0\le y\le1,\\0,&\text{其他}\end{cases}$$

（1）求常数 $c$；

（2）求边缘密度 $f_X(x)$、$f_Y(y)$；

（3）判断 $X$ 与 $Y$ 是否相互独立，并说明理由；

（4）求 $\mathrm{Cov}(X,Y)$；

（5）求 $P\{X+Y\le1\}$。
:::

:::callout{kind=insight label="解析"}
（1）由归一化：

$$\int_{0}^{1}\int_{0}^{1}c(x+y)\,dx\,dy=c\int_{0}^{1}\left(x+\frac{1}{2}\right)\,dx=c\left(\frac{1}{2}+\frac{1}{2}\right)=c=1$$

故 $c=1$。

（2）边缘密度：

$$f_X(x)=\int_{0}^{1}(x+y)\,dy=x+\frac{1}{2},\quad0<x<1$$

由对称性

$$f_Y(y)=y+\frac{1}{2},\quad0<y<1$$

（3）因为

$$f_X(x)f_Y(y)=\left(x+\frac{1}{2}\right)\left(y+\frac{1}{2}\right)\neq x+y=f(x,y)$$

所以 $X$ 与 $Y$ 不相互独立。

（4）

$$E(X)=\int_{0}^{1}x\left(x+\frac{1}{2}\right)\,dx=\frac{1}{3}+\frac{1}{4}=\frac{7}{12}$$

由对称性 $E(Y)=\frac{7}{12}$。

$$E(XY)=\int_{0}^{1}\int_{0}^{1}xy(x+y)\,dx\,dy=\int_{0}^{1}\left(\frac{y}{3}+\frac{y^2}{2}\right)\,dy=\frac{1}{6}+\frac{1}{6}=\frac{1}{3}$$

$$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=\frac{1}{3}-\frac{49}{144}=\frac{48-49}{144}=-\frac{1}{144}$$

（5）

$$P\{X+Y\le1\}=\int_{0}^{1}\int_{0}^{1-x}(x+y)\,dy\,dx=\int_{0}^{1}\left[x(1-x)+\frac{(1-x)^2}{2}\right]\,dx=\frac{1}{6}$$
:::

:::callout{kind=tip label="结论速记"}
二维连续型：归一化求常数；边缘密度积分；独立性看联合密度是否等于边缘乘积；区域概率注意积分限。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：联合密度归一化；$f_X(x)=\int f(x,y)dy$；$E(XY)=\iint xy f(x,y)dxdy$；$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$。

**解题方法**：求区域概率时，先画出积分区域（如 $x+y\le1$ 在第一象限的三角形），再确定积分限。

**易错警示**：虽然 $f(x,y)=x+y$ 在支撑集 $[0,1]^2$ 上，但 $f_X(x)f_Y(y)\neq f(x,y)$，故不独立。

**关联考点**：考点八·多维随机变量与条件分布；考点九·随机变量的独立性；考点十二·协方差与相关系数。
:::

---

### 第22题

:::callout{kind=note label="题目"}
某单位有 $200$ 部电话分机，设每部分机在任一时刻使用外线的概率为 $0.05$，各分机是否使用外线相互独立。为使每部分机在需要使用外线时能及时接通的概率不小于 $0.90$，问该单位的总机至少需要装设多少条外线？（用中心极限定理近似计算，取 $\Phi(1.28)\approx0.90$）
:::

:::callout{kind=insight label="解析"}
设 $S$ 为同时使用外线的分机数，则 $S\sim B(200,0.05)$。

$$E(S)=200\times0.05=10,\quad D(S)=200\times0.05\times0.95=9.5$$

设需要 $m$ 条外线，要求 $P\{S\le m\}\ge0.90$。由中心极限定理，$S$ 近似服从 $N(10,9.5)$。使用连续性修正：

$$P\{S\le m\}\approx\Phi\left(\frac{m+0.5-10}{\sqrt{9.5}}\right)\ge0.90$$

取 $\Phi(1.28)=0.90$，则

$$\frac{m-9.5}{\sqrt{9.5}}\ge1.28$$

$$m\ge9.5+1.28\times\sqrt{9.5}\approx9.5+3.95=13.45$$

因为 $m$ 为整数，故至少需要 $14$ 条外线。
:::

:::callout{kind=tip label="结论速记"}
二项分布正态近似：$S\sim B(n,p)$ 近似 $N(np,np(1-p))$；离散变量用连续性修正。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：De Moivre–Laplace：$\frac{S-np}{\sqrt{np(1-p)}}\approx N(0,1)$；$P\{S\le m\}\approx\Phi\left(\frac{m+0.5-np}{\sqrt{np(1-p)}}\right)$。

**解题方法**：识别二项模型；计算期望方差；将概率要求转化为标准正态分位点；最后取整并验证。

**易错警示**：注意分位点方向：“至少 $90\%$ 能接通”对应左侧概率 $0.90$；离散变量近似正态要做连续性修正。

**关联考点**：考点十三·大数定律和中心极限定理。
:::

---

### 第23题

:::callout{kind=note label="题目"}
设总体 $X$ 的概率密度为

$$f(x;\theta)=\begin{cases}(\theta+1)x^{\theta},&0<x<1,\\0,&\text{其他}\end{cases}$$

$\theta>-1$ 为未知参数，$X_1,X_2,\ldots,X_n$ 是来自该总体的一个样本。

（1）求参数 $\theta$ 的矩估计量；

（2）求参数 $\theta$ 的极大似然估计量。
:::

:::callout{kind=insight label="解析"}
（1）矩估计：

$$E(X)=\int_{0}^{1}x(\theta+1)x^{\theta}\,dx=(\theta+1)\int_{0}^{1}x^{\theta+1}\,dx=\frac{\theta+1}{\theta+2}$$

令 $E(X)=\bar{X}$，解得

$$\bar{X}(\theta+2)=\theta+1\Rightarrow\theta=\frac{2\bar{X}-1}{1-\bar{X}}$$

故矩估计量为

$$\hat{\theta}_M=\frac{2\bar{X}-1}{1-\bar{X}}$$

（2）极大似然估计：样本独立，似然函数

$$L(\theta)=\prod_{i=1}^{n}(\theta+1)x_i^{\theta}=(\theta+1)^n\left(\prod_{i=1}^{n}x_i\right)^{\theta}$$

取对数：

$$\ln L(\theta)=n\ln(\theta+1)+\theta\sum_{i=1}^{n}\ln x_i$$

对 $\theta$ 求导并令其为 $0$：

$$\frac{d\ln L}{d\theta}=\frac{n}{\theta+1}+\sum_{i=1}^{n}\ln x_i=0$$

解得

$$\hat{\theta}_L=-1-\frac{n}{\sum_{i=1}^{n}\ln X_i}$$
:::

:::callout{kind=tip label="结论速记"}
矩估计：令 $E(X)=\bar{X}$；MLE：写似然函数 → 取对数 → 求导置零。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：矩估计 $E(X)=\bar{X}$；MLE $L(\theta)=\prod f(X_i;\theta)$，$\ln L$ 求导。

**解题方法**：矩估计先算总体一阶矩；MLE 注意取对数后化简；验证导数为0的点是否为最大值。

**易错警示**：$(\theta+1)x^{\theta}$ 的期望积分是 $(\theta+1)/(\theta+2)$，不是 $(\theta+1)/(\theta+1)$；MLE 结果用大写 $X_i$ 表示估计量。

**关联考点**：考点十六·矩估计和极大似然估计。
:::

---

### 第24题

:::callout{kind=note label="题目"}
设某种零件的长度 $X\sim N(\mu,\sigma^2)$（单位：cm）。今随机抽取 $16$ 个零件，测得样本均值 $\bar{x}=20.0$，样本标准差 $s=0.4$。

（1）若已知 $\sigma=0.4$，求 $\mu$ 的置信度为 $0.95$ 的置信区间；

（2）若 $\sigma$ 未知，求 $\mu$ 的置信度为 $0.95$ 的置信区间。

（$z_{0.025}=1.96$，$t_{0.025}(15)=2.131$）
:::

:::callout{kind=insight label="解析"}
（1）$\sigma$ 已知，使用 $Z$ 枢轴量：

$$Z=\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim N(0,1)$$

$95\%$ 置信区间为

$$\bar{x}\pm z_{0.025}\frac{\sigma}{\sqrt{n}}=20.0\pm1.96\times\frac{0.4}{\sqrt{16}}=20.0\pm0.196$$

即 $(19.804,\ 20.196)$。

（2）$\sigma$ 未知，使用 $t$ 枢轴量：

$$T=\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$$

$95\%$ 置信区间为

$$\bar{x}\pm t_{0.025}(15)\frac{s}{\sqrt{n}}=20.0\pm2.131\times\frac{0.4}{4}=20.0\pm0.2131$$

即 $(19.7869,\ 20.2131)$。
:::

:::callout{kind=tip label="结论速记"}
$\sigma$ 已知：$Z$ 区间；$\sigma$ 未知：$t$ 区间；$95\%$ 对应双侧分位点 $z_{0.025}$ 或 $t_{0.025}(n-1)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\sigma$ 已知：$\bar{X}\pm z_{\alpha/2}\sigma/\sqrt{n}$；$\sigma$ 未知：$\bar{X}\pm t_{\alpha/2}(n-1)S/\sqrt{n}$。

**解题方法**：先识别总体分布与参数已知情况，选择枢轴量；注意分位点是双侧 $\alpha/2$。

**易错警示**：$\sigma$ 未知时不要用 $z$ 分位点；$t$ 分布自由度是 $n-1$；样本标准差 $s$ 与总体 $\sigma$ 不要混淆。

**关联考点**：考点十七·区间估计。
:::

---

### 第25题

:::callout{kind=note label="题目"}
设随机变量 $X$、$Y$ 的方差 $D(X)>0$、$D(Y)>0$ 均存在，其相关系数记为 $\rho_{XY}$。试证明：

$$|\rho_{XY}|\le1$$
:::

:::callout{kind=insight label="解析"}
标准化：令

$$X^*=\frac{X-E(X)}{\sqrt{D(X)}},\quad Y^*=\frac{Y-E(Y)}{\sqrt{D(Y)}}$$

则 $E(X^*)=E(Y^*)=0$，$D(X^*)=D(Y^*)=1$，且由相关系数定义

$$\rho_{XY}=E(X^*Y^*)$$

考虑随机变量 $X^*-tY^*$ 的方差，对任意实数 $t$：

$$D(X^*-tY^*)=D(X^*)+t^2D(Y^*)-2t\,\mathrm{Cov}(X^*,Y^*)=1+t^2-2t\rho_{XY}\ge0$$

取 $t=\rho_{XY}$，得

$$1+\rho_{XY}^2-2\rho_{XY}^2=1-\rho_{XY}^2\ge0$$

即 $|\rho_{XY}|\le1$。

等号成立当且仅当 $D(X^*-tY^*)=0$，即 $X^*$ 与 $Y^*$ 以概率1呈线性关系，等价于 $Y=aX+b$（$a\neq0$）。
:::

:::callout{kind=tip label="结论速记"}
相关系数有界性：$|\rho_{XY}|\le1$；等号对应 $X$、$Y$ 几乎必然线性相关。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)D(Y)}}$；$|\rho|\le1$；也可由柯西–施瓦茨不等式 $|\mathrm{Cov}(X,Y)|\le\sqrt{D(X)D(Y)}$ 直接得到。

**解题方法**：标准化后利用方差非负构造二次不等式；或直接用柯西–施瓦茨不等式。

**易错警示**：$\rho=1$ 不一定是 $Y=X$，而是 $Y=aX+b$（$a>0$）；$\rho=-1$ 对应 $a<0$。

**关联考点**：考点十二·协方差与相关系数。
:::

---

> 本试卷练习完
