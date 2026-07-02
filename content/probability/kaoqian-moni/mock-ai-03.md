# AI押题模拟卷三·Perplexity生成

> 来源：AI生成押题卷（Perplexity）·华中科技大学《概率论与数理统计》
> 考试类型：期末押题模拟
> 题量：选择题5题 + 填空题5题 + 计算题6题

---

## 一、单项选择题（每小题4分，共20分）

### 第1题

:::callout{kind=note label="题目"}
设 $A$、$B$ 为随机事件，且 $P(A)=0.4$，$P(B)=0.3$，$P(AB)=0.1$，则 $P(A\cup B)=$（　　）

A. $0.5$

B. $0.6$

C. $0.7$

D. $0.8$
:::

:::callout{kind=insight label="解析"}
由加法公式

$$P(A\cup B)=P(A)+P(B)-P(AB)=0.4+0.3-0.1=0.6$$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
加法公式：$P(A\cup B)=P(A)+P(B)-P(AB)$，概率加法必须扣除重复部分。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：加法公式 $P(A\cup B)=P(A)+P(B)-P(AB)$；若 $A,B$ 互斥则 $P(A\cup B)=P(A)+P(B)$。

**解题方法**：已知两个事件概率及交事件概率，直接用加法公式求并事件概率；若已知并事件、求交事件则反向使用。

**易错警示**：$P(A\cup B)$ 不等于 $P(A)+P(B)$，除非 $A,B$ 互斥；不要漏掉减 $P(AB)$ 项。

**关联考点**：考点二·概率基本概念与计算；考点三·贝叶斯公式。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X$ 服从参数为 $\lambda$ 的泊松分布，若已知 $D(X)=E(X)$，则下列说法中正确的是（　　）

A. $\lambda$ 可以为任意正数

B. $\lambda$ 必为整数

C. $\lambda=1$

D. 该结论恒成立，无法确定 $\lambda$ 的具体值
:::

:::callout{kind=insight label="解析"}
泊松分布 $X\sim P(\lambda)$ 的期望与方差均等于参数 $\lambda$，即 $E(X)=D(X)=\lambda$，对任意 $\lambda>0$ 恒成立。

因此题干条件“$D(X)=E(X)$”对一切 $\lambda>0$ 都成立，无法确定 $\lambda$ 的具体值。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
泊松分布 $P(\lambda)$：$E(X)=D(X)=\lambda$，条件 $D(X)=E(X)$ 等价于 $\lambda=\lambda$，恒成立。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：若 $X\sim P(\lambda)$，则 $P\{X=k\}=\frac{\lambda^k}{k!}e^{-\lambda}$，$E(X)=D(X)=\lambda$。

**解题方法**：常见分布的期望、方差是“分布识别”类题目的速解依据；泊松分布最核心的性质就是 $E=D=\lambda$。

**易错警示**：泊松分布的取值是 $0,1,2,\ldots$，但参数 $\lambda$ 可以是任意正实数，不必是整数。

**关联考点**：考点五·离散型随机变量的分布；考点十一·期望与方差。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设二维随机变量 $(X,Y)$ 的联合密度函数为

$$f(x,y)=c\cdot e^{-(x+2y)},\quad x>0,\ y>0$$

则常数 $c=$（　　）

A. $1$

B. $2$

C. $\frac{1}{2}$

D. $4$
:::

:::callout{kind=insight label="解析"}
由联合密度函数的归一化条件：

$$\int_{0}^{+\infty}\int_{0}^{+\infty} c\cdot e^{-(x+2y)}\,dx\,dy=1$$

分离变量：

$$c\left(\int_{0}^{+\infty}e^{-x}\,dx\right)\left(\int_{0}^{+\infty}e^{-2y}\,dy\right)=c\cdot 1\cdot\frac{1}{2}=1$$

故 $c=2$。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
二维连续型联合密度必须满足 $\iint_{\mathbb{R}^2} f(x,y)\,dx\,dy=1$；分离变量后化为两个一维积分相乘。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：联合密度归一化 $1=\iint f(x,y)\,dx\,dy$；本题中 $X$ 与 $Y$ 独立，$f(x,y)=f_X(x)f_Y(y)$，其中 $f_X(x)=e^{-x}$，$f_Y(y)=2e^{-2y}$。

**解题方法**：求常数先写归一化方程；若联合密度可分离为 $g(x)h(y)$，则积分可拆成两个单变量积分的乘积。

**易错警示**：注意 $e^{-2y}$ 的积分是 $\frac{1}{2}$，不是 $1$；常数 $c$ 要与两个积分系数都匹配。

**关联考点**：考点六·连续型随机变量的分布；考点八·多维随机变量与条件分布。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设 $X_1,X_2,\ldots,X_n$ 为来自正态总体 $N(\mu,\sigma^2)$ 的简单随机样本，$\sigma^2$ 未知，检验假设 $H_0:\mu=\mu_0$ 应选用的统计量为（　　）

A. $Z$ 统计量（标准正态）

B. $t$ 统计量

C. $\chi^2$ 统计量

D. $F$ 统计量
:::

:::callout{kind=insight label="解析"}
当总体方差 $\sigma^2$ 未知时，需要用样本方差 $S^2$ 代替 $\sigma^2$，构造 $t$ 统计量：

$$T=\frac{\bar{X}-\mu_0}{S/\sqrt{n}}\sim t(n-1)$$

$Z$ 统计量用于 $\sigma^2$ 已知；$\chi^2$ 统计量用于方差推断；$F$ 统计量用于两总体方差比较。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\sigma^2$ 已知 → $Z$ 统计量；$\sigma^2$ 未知 → $t$ 统计量；方差检验 → $\chi^2$ 统计量。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：正态总体均值检验：若 $\sigma^2$ 未知，则 $T=\frac{\bar{X}-\mu_0}{S/\sqrt{n}}\sim t(n-1)$；若 $\sigma^2$ 已知，则 $Z=\frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}\sim N(0,1)$。

**解题方法**：先判断参数已知未知，再选对应抽样分布；单总体均值检验用 $Z$ 或 $t$，方差检验用 $\chi^2$。

**易错警示**：不要用 $Z$ 代替 $t$ 在 $\sigma^2$ 未知时，否则显著性水平会失控；自由度是 $n-1$ 不是 $n$。

**关联考点**：考点十五·三大分布；考点十七·区间估计；假设检验。
:::

---

### 第5题

:::callout{kind=note label="题目"}
若 $X$ 与 $Y$ 的相关系数 $\rho_{XY}=0$，则下列结论中正确的是（　　）

A. $X$ 与 $Y$ 一定独立

B. $X$ 与 $Y$ 之间没有任何关系

C. $X$ 与 $Y$ 不存在线性相关关系

D. $\mathrm{Cov}(X,Y)\neq 0$
:::

:::callout{kind=insight label="解析"}
相关系数 $\rho_{XY}=0$ 等价于 $\mathrm{Cov}(X,Y)=0$，它只说明 $X$ 与 $Y$ 之间不存在线性相关关系，不能推出独立（独立要求没有任何关系，包括非线性关系）。

选项 A、B 把“不线性相关”错误地加强为“独立”或“没有任何关系”；选项 D 与 $\rho_{XY}=0$ 矛盾。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$\rho_{XY}=0$ 等价于 $\mathrm{Cov}(X,Y)=0$，只说明“无线性关系”，不说明独立。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)}\sqrt{D(Y)}}$；$\rho=0$ 仅表示不存在线性相关。

**解题方法**：判断“独立”与“不相关”关系时记住：独立 ⇒ 不相关；反之一般不成立。典型反例：$X\sim N(0,1)$，$Y=X^2$，则 $X$ 与 $Y$ 不相关但不独立。

**易错警示**：不要把“不相关”等同于“独立”；二维正态分布是特殊情形，其中不相关与独立等价，但一般分布不适用。

**关联考点**：考点十二·协方差与相关系数。
:::

---

## 二、填空题（每小题4分，共20分）

### 第6题

:::callout{kind=note label="题目"}
设 $A$、$B$、$C$ 为三个事件，全概率公式为：__________；在袋中有 $5$ 个红球、$3$ 个白球，从中不放回取 $3$ 个，取到 $2$ 红 $1$ 白的概率为__________（用组合数表示）。
:::

:::callout{kind=insight label="解析"}
全概率公式：若 $B_1,B_2,\ldots,B_n$ 是样本空间的一个划分，则

$$P(A)=\sum_{i=1}^{n}P(B_i)P(A\mid B_i)$$

取到 $2$ 红 $1$ 白的概率：

$$P=\frac{C_5^2\,C_3^1}{C_8^3}=\frac{10\times 3}{56}=\frac{30}{56}=\frac{15}{28}$$

答案：$\frac{15}{28}$。
:::

:::callout{kind=tip label="结论速记"}
超几何分布：不放回取 $n$ 个，其中 $k$ 个来自某类，概率为 $\frac{C_M^k\,C_{N-M}^{n-k}}{C_N^n}$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：全概率公式 $P(A)=\sum_i P(B_i)P(A\mid B_i)$；贝叶斯公式 $P(B_j\mid A)=\frac{P(B_j)P(A\mid B_j)}{\sum_i P(B_i)P(A\mid B_i)}$。

**解题方法**：古典概型用“有利事件数/总事件数”；超几何问题是组合数直接相除。

**易错警示**：注意“不放回”对应组合数（无顺序），“放回”对应二项分布（有顺序）。

**关联考点**：考点一·排列组合问题；考点三·贝叶斯公式。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设随机变量 $X$ 服从指数分布，参数为 $\lambda$，其分布函数为：__________；若已知 $E(X)=2$，则 $\lambda=$__________。
:::

:::callout{kind=insight label="解析"}
指数分布 $X\sim E(\lambda)$ 的分布函数为

$$F(x)=\begin{cases}1-e^{-\lambda x},&x>0,\\0,&x\le 0\end{cases}$$

且 $E(X)=\frac{1}{\lambda}$。由 $E(X)=2$ 得 $\frac{1}{\lambda}=2$，故 $\lambda=\frac{1}{2}$。

答案：$F(x)=1-e^{-\lambda x}\ (x>0)$；$\lambda=\frac{1}{2}$。
:::

:::callout{kind=tip label="结论速记"}
指数分布 $E(\lambda)$：$E(X)=\frac{1}{\lambda}$，$D(X)=\frac{1}{\lambda^2}$，分布函数 $F(x)=1-e^{-\lambda x}$（$x>0$）。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：指数分布密度 $f(x)=\lambda e^{-\lambda x}$（$x>0$），具有无记忆性：$P\{X>s+t\mid X>s\}=P\{X>t\}$。

**解题方法**：已知期望求参数用 $E(X)=1/\lambda$；已知概率求参数可用分布函数或对数化。

**易错警示**：不要把指数分布参数与泊松分布参数混淆；指数分布的期望是参数的倒数。

**关联考点**：考点六·连续型随机变量的分布。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设 $(X,Y)$ 相互独立，$D(X)=4$，$D(Y)=9$，则 $D(2X-3Y+1)=$__________。
:::

:::callout{kind=insight label="解析"}
由方差的线性性质，独立随机变量 $X$、$Y$ 满足

$$D(2X-3Y+1)=D(2X-3Y)=4D(X)+9D(Y)$$

因为 $X$ 与 $Y$ 独立，$\mathrm{Cov}(X,Y)=0$，交叉项消失。代入：

$$D(2X-3Y+1)=4\times 4+9\times 9=16+81=97$$

答案：$97$。
:::

:::callout{kind=tip label="结论速记"}
独立时 $D(aX+bY+c)=a^2D(X)+b^2D(Y)$；注意常数方差为 $0$，交叉项为 $0$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$D(aX+bY+c)=a^2D(X)+b^2D(Y)+2ab\,\mathrm{Cov}(X,Y)$；独立时 $\mathrm{Cov}(X,Y)=0$。

**解题方法**：先判断独立与否，再决定是否保留协方差项；注意常数项对方差无贡献。

**易错警示**：$D(X-Y)$ 不是 $D(X)-D(Y)$，而是 $D(X)+D(Y)$（当 $X,Y$ 独立时）。

**关联考点**：考点十一·期望与方差；考点十二·协方差与相关系数。
:::

---

### 第9题

:::callout{kind=note label="题目"}
设 $X_1,\ldots,X_n$ 独立同分布，$E(X_i)=\mu$，$D(X_i)=\sigma^2$，由中心极限定理知，当 $n$ 充分大时：$\bar{X}=\frac{1}{n}\sum_{i=1}^{n}X_i$ 近似服从__________分布。
:::

:::callout{kind=insight label="解析"}
由独立同分布中心极限定理（Lindeberg–Lévy），

$$\frac{\sum_{i=1}^{n}X_i-n\mu}{\sigma\sqrt{n}}\xrightarrow{d}N(0,1)$$

等价地，样本均值

$$\bar{X}\,\dot{\sim}\,N\!\left(\mu,\frac{\sigma^2}{n}\right)$$

答案：$N\!\left(\mu,\frac{\sigma^2}{n}\right)$。
:::

:::callout{kind=tip label="结论速记"}
中心极限定理：$\bar{X}$ 近似 $N(\mu,\sigma^2/n)$；标准化后近似 $N(0,1)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：Lindeberg–Lévy CLT：$\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\xrightarrow{d}N(0,1)$；De Moivre–Laplace 是二项分布情形的特例。

**解题方法**：识别“独立同分布、$n$ 充分大”立即套用 CLT；注意标准化时分母是 $\sigma/\sqrt{n}$，不是 $\sigma/n$。

**易错警示**：$\bar{X}$ 的方差是 $\sigma^2/n$（不是 $\sigma^2$），因为 $n$ 个独立变量平均后方差缩小 $n$ 倍。

**关联考点**：考点十三·大数定律和中心极限定理。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设总体 $X\sim N(\mu,\sigma^2)$，$\sigma$ 已知，置信水平为 $1-\alpha$ 的 $\mu$ 的置信区间为：__________；若 $\sigma=2$，$n=25$，置信水平为 $95\%$，则 $z_{\alpha/2}=$__________。
:::

:::callout{kind=insight label="解析"}
$\sigma$ 已知时，使用标准正态枢轴量：

$$Z=\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim N(0,1)$$

因此 $\mu$ 的 $1-\alpha$ 置信区间为

$$\left(\bar{X}-z_{\alpha/2}\frac{\sigma}{\sqrt{n}},\ \bar{X}+z_{\alpha/2}\frac{\sigma}{\sqrt{n}}\right)$$

置信水平 $95\%$ 时，$\alpha=0.05$，$\alpha/2=0.025$，查标准正态表 $z_{0.025}=1.96$。

答案：$\left(\bar{X}-z_{\alpha/2}\frac{\sigma}{\sqrt{n}},\bar{X}+z_{\alpha/2}\frac{\sigma}{\sqrt{n}}\right)$；$1.96$。
:::

:::callout{kind=tip label="结论速记"}
$\sigma$ 已知 → $Z$ 区间 $\bar{X}\pm z_{\alpha/2}\sigma/\sqrt{n}$；$95\%$ 对应 $z_{0.025}=1.96$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：单正态总体均值区间估计：$\sigma$ 已知时用 $Z$ 枢轴量，$\sigma$ 未知时用 $t$ 枢轴量 $T=\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$，区间为 $\bar{X}\pm t_{\alpha/2}(n-1)\frac{S}{\sqrt{n}}$。

**解题方法**：先识别总体分布与已知/未知参数，再构造枢轴量；分位点方向：$1-\alpha$ 置信度对应双侧各 $\alpha/2$。

**易错警示**：$\sigma$ 已知用 $z_{\alpha/2}$，$\sigma$ 未知用 $t_{\alpha/2}(n-1)$；不要把分位点写成 $z_\alpha$ 或 $t_\alpha$。

**关联考点**：考点十七·区间估计。
:::

---

## 三、计算题（共60分）

### 第11题

:::callout{kind=note label="题目"}
设某工厂有三个车间生产同一种产品，产量分别占全厂的 $25\%$、$35\%$、$40\%$，各车间的次品率分别为 $5\%$、$4\%$、$2\%$。现从全厂产品中随机抽取一件。

（1）求该产品为次品的概率；

（2）若已知抽到的产品是次品，求该产品来自第一车间的概率（写出贝叶斯公式并代入计算）。
:::

:::callout{kind=insight label="解析"}
设 $B_1,B_2,B_3$ 分别表示产品来自第一、二、三车间，$A$ 表示产品为次品。已知

$$P(B_1)=0.25,\ P(B_2)=0.35,\ P(B_3)=0.40$$
$$P(A\mid B_1)=0.05,\ P(A\mid B_2)=0.04,\ P(A\mid B_3)=0.02$$

（1）由全概率公式：

$$P(A)=\sum_{i=1}^{3}P(B_i)P(A\mid B_i)$$
$$=0.25\times0.05+0.35\times0.04+0.40\times0.02$$
$$=0.0125+0.014+0.008=0.0345$$

（2）由贝叶斯公式：

$$P(B_1\mid A)=\frac{P(B_1)P(A\mid B_1)}{P(A)}=\frac{0.25\times0.05}{0.0345}=\frac{0.0125}{0.0345}\approx0.3623$$
:::

:::callout{kind=tip label="结论速记"}
全概率“由因到果”求总概率；贝叶斯“由果追因”求后验概率。分母必须是全概率算出的 $P(A)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：全概率公式 $P(A)=\sum_i P(B_i)P(A\mid B_i)$；贝叶斯公式 $P(B_j\mid A)=\frac{P(B_j)P(A\mid B_j)}{P(A)}$。

**解题方法**：画出“原因—结果”树：第一层为各原因 $B_i$ 的概率，第二层为各原因下结果 $A$ 的条件概率；全概率沿第一层展开，贝叶斯用一条路径除以总概率。

**易错警示**：贝叶斯分母不能写 $P(B_i)$，也不能只加部分原因；先验 $P(B_i)$ 与条件 $P(A\mid B_i)$ 不能混用。

**关联考点**：考点三·贝叶斯公式；考点十八·综合题。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设二维随机变量 $(X,Y)$ 的联合概率密度为

$$f(x,y)=\begin{cases}2e^{-(x+2y)},&x>0,\ y>0,\\0,&\text{其他}\end{cases}$$

（1）求常数 $c$，使 $f(x,y)$ 满足归一化条件；

（2）求边缘密度 $f_X(x)$ 和 $f_Y(y)$；

（3）判断 $X$ 与 $Y$ 是否相互独立。
:::

:::callout{kind=insight label="解析"}
（1）由归一化条件：

$$\int_{0}^{+\infty}\int_{0}^{+\infty}2e^{-(x+2y)}\,dx\,dy=2\cdot1\cdot\frac{1}{2}=1$$

故 $c=2$（密度已写为 $2e^{-(x+2y)}$）。

（2）边缘密度：

$$f_X(x)=\int_{0}^{+\infty}2e^{-(x+2y)}\,dy=e^{-x},\quad x>0$$

$$f_Y(y)=\int_{0}^{+\infty}2e^{-(x+2y)}\,dx=2e^{-2y},\quad y>0$$

（3）因为

$$f_X(x)f_Y(y)=e^{-x}\cdot2e^{-2y}=2e^{-(x+2y)}=f(x,y)$$

所以 $X$ 与 $Y$ 相互独立。
:::

:::callout{kind=tip label="结论速记"}
联合密度可分离为仅含 $x$ 与仅含 $y$ 的函数之积，且区域为矩形（乘积区间）时，$X$ 与 $Y$ 独立。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：边缘密度 $f_X(x)=\int_{-\infty}^{+\infty}f(x,y)\,dy$；独立性等价于 $f(x,y)=f_X(x)f_Y(y)$ 在支撑集上几乎处处成立。

**解题方法**：求 $f_X$ 时对 $y$ 积分，求 $f_Y$ 时对 $x$ 积分；独立性的快速判断：若联合密度可分解且支撑集为矩形，则独立。

**易错警示**：即使 $f(x,y)$ 可分解，若支撑集不是矩形（如 $0<y<x<1$），也不一定独立。

**关联考点**：考点八·多维随机变量与条件分布；考点九·随机变量的独立性。
:::

---

### 第13题

:::callout{kind=note label="题目"}
设随机变量 $X$ 的分布律为：$X$ 取值 $-1$、$0$、$2$，对应概率为 $0.2$、$0.5$、$0.3$。

（1）求 $E(X)$、$E(X^2)$、$D(X)$；

（2）设 $Y=2X+1$，求 $E(Y)$ 和 $D(Y)$。
:::

:::callout{kind=insight label="解析"}
（1）由离散型期望定义：

$$E(X)=(-1)\times0.2+0\times0.5+2\times0.3=-0.2+0+0.6=0.4$$

$$E(X^2)=(-1)^2\times0.2+0^2\times0.5+2^2\times0.3=0.2+0+1.2=1.4$$

$$D(X)=E(X^2)-[E(X)]^2=1.4-0.16=1.24$$

（2）由期望与方差的线性性质：

$$E(Y)=E(2X+1)=2E(X)+1=2\times0.4+1=1.8$$

$$D(Y)=D(2X+1)=4D(X)=4\times1.24=4.96$$
:::

:::callout{kind=tip label="结论速记"}
离散型：$E(X)=\sum x_i p_i$，$E(X^2)=\sum x_i^2 p_i$，$D(X)=E(X^2)-[E(X)]^2$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$E(g(X))=\sum g(x_i)p_i$；$D(X)=E(X^2)-[E(X)]^2$；$E(aX+b)=aE(X)+b$，$D(aX+b)=a^2D(X)$。

**解题方法**：先列分布表，再逐格计算期望；注意 $E(X^2)$ 不是 $[E(X)]^2$。

**易错警示**：计算 $D(X)$ 时勿把 $E(X^2)$ 与 $[E(X)]^2$ 混淆；$Y=2X+1$ 的方差不含常数项。

**关联考点**：考点十一·期望与方差。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设总体 $X\sim N(\mu,\sigma^2)$，从中抽取容量为 $16$ 的简单随机样本，测得样本均值 $\bar{x}=50$，样本标准差 $s=4$。

（1）在 $\sigma$ 未知的情况下，求 $\mu$ 的置信水平为 $95\%$ 的置信区间（已知 $t_{0.025}(15)=2.131$）；

（2）写出检验假设 $H_0:\mu=48$ 对 $H_1:\mu\neq48$ 时应使用的检验统计量及其分布。
:::

:::callout{kind=insight label="解析"}
（1）$\sigma$ 未知，使用 $t$ 枢轴量：

$$T=\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$$

$95\%$ 置信区间为

$$\bar{x}\pm t_{0.025}(n-1)\frac{s}{\sqrt{n}}$$

边际误差：

$$2.131\times\frac{4}{\sqrt{16}}=2.131\times1=2.131$$

置信区间：$(50-2.131,\ 50+2.131)=(47.869,\ 52.131)$。

（2）在 $H_0$ 成立下，检验统计量

$$T=\frac{\bar{X}-48}{S/\sqrt{n}}\sim t(15)$$

代入样本得 $T=\frac{50-48}{4/4}=2$。
:::

:::callout{kind=tip label="结论速记"}
$\sigma$ 未知：$\bar{X}\pm t_{\alpha/2}(n-1)S/\sqrt{n}$；检验统计量 $T=\frac{\bar{X}-\mu_0}{S/\sqrt{n}}\sim t(n-1)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$\sigma$ 已知：$Z=\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim N(0,1)$；$\sigma$ 未知：$T=\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$。注意 $S^2=\frac{1}{n-1}\sum(X_i-\bar{X})^2$。

**解题方法**：识别已知/未知参数，选择枢轴量；置信区间和假设检验的核心统计量一致，只是区间用于估计，检验用于判断。

**易错警示**：$\sigma$ 未知时千万不要用 $z$ 分位点；$t$ 分布自由度是 $n-1$，且分位点是 $t_{\alpha/2}(n-1)$ 不是 $t_\alpha$。

**关联考点**：考点十七·区间估计；考点十五·三大分布。
:::

---

### 第15题

:::callout{kind=note label="题目"}
设总体 $X$ 的概率密度为

$$f(x;\theta)=\begin{cases}\theta x^{\theta-1},&0<x<1,\\0,&\text{其他}\end{cases}$$

其中 $\theta>0$ 为未知参数，$X_1,X_2,\ldots,X_n$ 为来自总体 $X$ 的简单随机样本。

（1）求 $\theta$ 的矩估计量；

（2）求 $\theta$ 的最大似然估计量（写出似然函数、对数似然函数、求导过程）。
:::

:::callout{kind=insight label="解析"}
（1）矩估计。先求总体一阶原点矩：

$$E(X)=\int_{0}^{1}x\cdot\theta x^{\theta-1}\,dx=\theta\int_{0}^{1}x^{\theta}\,dx=\frac{\theta}{\theta+1}$$

令样本均值等于总体均值：

$$\bar{X}=\frac{\theta}{\theta+1}$$

解得矩估计量：

$$\hat{\theta}_M=\frac{\bar{X}}{1-\bar{X}}$$

（2）最大似然估计。样本独立，似然函数为

$$L(\theta)=\prod_{i=1}^{n}\theta x_i^{\theta-1}=\theta^n\left(\prod_{i=1}^{n}x_i\right)^{\theta-1}$$

取对数：

$$\ln L(\theta)=n\ln\theta+(\theta-1)\sum_{i=1}^{n}\ln x_i$$

对 $\theta$ 求导并令其为 $0$：

$$\frac{d\ln L}{d\theta}=\frac{n}{\theta}+\sum_{i=1}^{n}\ln x_i=0$$

解得最大似然估计量：

$$\hat{\theta}_L=-\frac{n}{\sum_{i=1}^{n}\ln X_i}$$
:::

:::callout{kind=tip label="结论速记"}
矩估计：令样本矩等于总体矩；MLE：写似然函数 → 取对数 → 求导置零 → 验证。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：矩估计：$A_k=\frac{1}{n}\sum X_i^k\approx E(X^k)$；MLE：$L(\theta)=\prod f(X_i;\theta)$，$\ln L$ 求导。

**解题方法**：矩估计一般从一阶矩开始；MLE 注意取对数后把连乘变求和；若似然函数对参数单调，最大值可能在边界取得。

**易错警示**：不要把总体期望的表达式写错；取对数时 $(\theta-1)\sum\ln x_i$ 的系数是 $\theta-1$ 而不是 $\theta$；MLE 结果要写估计量（大写 $X_i$）而不是估计值（小写 $x_i$）。

**关联考点**：考点十六·矩估计和极大似然估计。
:::

---

### 第16题

:::callout{kind=note label="题目"}
设 $X_1,X_2,\ldots,X_{100}$ 为来自总体的独立同分布样本，$E(X_i)=90$，$D(X_i)=100$。利用切比雪夫不等式估计：

$$P\!\left\{\left|\bar{X}-90\right|\ge5\right\}$$

的上界。
:::

:::callout{kind=insight label="解析"}
样本均值 $\bar{X}=\frac{1}{n}\sum_{i=1}^{n}X_i$ 满足

$$E(\bar{X})=E(X_i)=90,\quad D(\bar{X})=\frac{D(X_i)}{n}=\frac{100}{100}=1$$

由切比雪夫不等式：

$$P\!\left\{|\bar{X}-E(\bar{X})|\ge\varepsilon\right\}\le\frac{D(\bar{X})}{\varepsilon^2}$$

取 $\varepsilon=5$，得

$$P\!\left\{|\bar{X}-90|\ge5\right\}\le\frac{1}{25}=0.04$$

即所求概率上界为 $4\%$。
:::

:::callout{kind=tip label="结论速记"}
切比雪夫不等式：$P\{|X-EX|\ge\varepsilon\}\le D(X)/\varepsilon^2$；注意 $\bar{X}$ 的方差是 $D(X_i)/n$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：切比雪夫不等式 $P\{|X-E(X)|\ge\varepsilon\}\le\frac{D(X)}{\varepsilon^2}$；大数定律说明样本均值依概率收敛到总体均值。

**解题方法**：先求 $\bar{X}$ 的期望与方差，再直接套用切比雪夫不等式；注意样本均值方差要除以 $n$。

**易错警示**：不要把 $\bar{X}$ 的方差仍用 $D(X_i)=100$，否则上界会错误地写成 $100/25=4$（概率不能大于1）。

**关联考点**：考点十三·大数定律和中心极限定理；考点十一·期望与方差。
:::

---

> 本试卷练习完
