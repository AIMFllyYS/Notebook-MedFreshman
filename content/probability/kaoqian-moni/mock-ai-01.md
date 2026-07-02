# AI押题模拟卷一·ChatGPT生成

> 来源：AI生成押题卷（ChatGPT）·华中科技大学《概率论与数理统计》
> 考试类型：期末押题模拟
> 题量：填空题10题 + 计算与证明题7题

---

## 一、客观题（每小题2分，共20分）

请将答案写在表格中；涉及分布请写出完整参数，自由度顺序不可颠倒。

### 第1题

:::callout{kind=note label="题目"}
已知 $P(A)=0.4$，$P(B)=0.5$，$P(A\cup B)=0.7$，则 $P(A\mid B)=$__________；$A$ 与 $B$ 是否独立：__________。
:::

:::callout{kind=insight label="解析"}
由加法公式：

$$P(AB)=P(A)+P(B)-P(A\cup B)=0.4+0.5-0.7=0.2$$

再由条件概率定义：

$$P(A\mid B)=\frac{P(AB)}{P(B)}=\frac{0.2}{0.5}=0.4$$

判断独立性：$P(A)P(B)=0.4\times0.5=0.2=P(AB)$，故 $A$ 与 $B$ 独立。

答案：$0.4$；独立。
:::

:::callout{kind=tip label="结论速记"}
$P(A\mid B)=P(A)$ 等价于 $A$、$B$ 独立；也可通过 $P(AB)=P(A)P(B)$ 验证。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：加法公式 $P(A\cup B)=P(A)+P(B)-P(AB)$；条件概率 $P(A\mid B)=\frac{P(AB)}{P(B)}$；独立性 $P(AB)=P(A)P(B)$。

**解题方法**：先由加法公式求 $P(AB)$，再算条件概率；最后用乘法公式验证独立性。

**易错警示**：不要把 $P(A\mid B)=P(A)$ 当作显然，必须通过计算验证；$P(A\cup B)$ 大的时候要扣除重复部分。

**关联考点**：考点二·概率基本概念与计算；考点三·贝叶斯公式。
:::

---

### 第2题

:::callout{kind=note label="题目"}
若 $X\sim B(20,0.4)$，则使 $P\{X=k\}$ 达到最大的整数 $k$ 为__________。
:::

:::callout{kind=insight label="解析"}
二项分布 $B(n,p)$ 的概率质量函数在 $k$ 处取得最大值的 $k$ 满足

$$(n+1)p-1\le k^*\le(n+1)p$$

代入 $n=20$，$p=0.4$：

$$(20+1)\times0.4-1=7.4\le k^*\le8.4$$

因此 $k^*=8$。

答案：$8$。
:::

:::callout{kind=tip label="结论速记"}
二项分布最可能值 $k^*$ 落在 $[(n+1)p-1,(n+1)p]$ 区间内；若不是整数，取不超过该区间的整数。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim B(n,p)$，$P\{X=k\}=C_n^k p^k(1-p)^{n-k}$。最可能值 $k^*$ 满足 $P\{X=k^*\}\ge P\{X=k^*-1\}$ 且 $P\{X=k^*\}\ge P\{X=k^*+1\}$，近似 $k^*\approx np$。

**解题方法**：用比值 $\frac{P\{X=k\}}{P\{X=k-1\}}=\frac{(n-k+1)p}{k(1-p)}$ 判断单调性；比值大于1时递增，小于1时递减。

**易错警示**：$np=8$ 时可能 $k^*=8$ 或 $k^*=7$、$8$ 同时最大；本题用 $(n+1)p=8.4$，取 $k=8$。

**关联考点**：考点五·离散型随机变量的分布。
:::

---

### 第3题

:::callout{kind=note label="题目"}
若 $X\sim E(\lambda)$，则 $P\{X>s+t\mid X>s\}=$__________，其中 $s,t>0$。
:::

:::callout{kind=insight label="解析"}
指数分布具有无记忆性：对任意 $s,t>0$，

$$P\{X>s+t\mid X>s\}=P\{X>t\}$$

而 $P\{X>t\}=e^{-\lambda t}$，因此

$$P\{X>s+t\mid X>s\}=e^{-\lambda t}$$

答案：$e^{-\lambda t}$。
:::

:::callout{kind=tip label="结论速记"}
指数分布无记忆性：已知“已存活 $s$ 时间”，再活 $t$ 时间的概率与“新的寿命”相同。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：指数分布 $X\sim E(\lambda)$，$P\{X>x\}=e^{-\lambda x}$（$x>0$），$E(X)=\frac{1}{\lambda}$，$D(X)=\frac{1}{\lambda^2}$；无记忆性 $P\{X>s+t\mid X>s\}=P\{X>t\}$。

**解题方法**：识别指数分布后直接用无记忆性；或用条件概率定义验证：$\frac{P\{X>s+t\}}{P\{X>s\}}=\frac{e^{-\lambda(s+t)}}{e^{-\lambda s}}=e^{-\lambda t}$。

**易错警示**：不要把无记忆性写成“$P\{X>s+t\}$”或“$P\{X>s\}$”；结果与 $s$ 无关。

**关联考点**：考点六·连续型随机变量的分布。
:::

---

### 第4题

:::callout{kind=note label="题目"}
若 $F_X(x)=\Phi\left(\frac{x-2}{3}\right)$，则 $X\sim$__________；$P\{|X-2|\le6\}=$__________。
:::

:::callout{kind=insight label="解析"}
由一般正态分布函数与标准正态分布函数的关系：

$$F_X(x)=\Phi\left(\frac{x-\mu}{\sigma}\right)$$

对比得 $X\sim N(2,9)$。

$$P\{|X-2|\le6\}=P\left\{-6\le X-2\le6\right\}=P\left\{-2\le\frac{X-2}{3}\le2\right\}=2\Phi(2)-1$$

答案：$N(2,9)$；$2\Phi(2)-1$。
:::

:::callout{kind=tip label="结论速记"}
$F_X(x)=\Phi\left(\frac{x-\mu}{\sigma}\right)$ 对应 $X\sim N(\mu,\sigma^2)$；$P\{|X-\mu|\le a\}=2\Phi\left(\frac{a}{\sigma}\right)-1$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim N(\mu,\sigma^2)$，$F_X(x)=\Phi\left(\frac{x-\mu}{\sigma}\right)$；标准化 $Z=\frac{X-\mu}{\sigma}\sim N(0,1)$。

**解题方法**：从分布函数识别参数 $\mu$、$\sigma^2$；求概率时先标准化，再利用标准正态表。

**易错警示**：$N(2,9)$ 表示方差为 $9$（标准差为 $3$），不是标准差为 $9$。

**关联考点**：考点六·连续型随机变量的分布；考点七·随机变量函数的分布。
:::

---

### 第5题

:::callout{kind=note label="题目"}
若 $X\sim P(2)$，$Y\sim P(5)$ 且独立，则 $X+Y\sim$__________。
:::

:::callout{kind=insight label="解析"}
独立泊松随机变量具有可加性：若 $X\sim P(\lambda_1)$，$Y\sim P(\lambda_2)$ 且独立，则

$$X+Y\sim P(\lambda_1+\lambda_2)$$

代入 $\lambda_1=2$，$\lambda_2=5$，得 $X+Y\sim P(7)$。

答案：$P(7)$。
:::

:::callout{kind=tip label="结论速记"}
独立泊松变量之和仍服从泊松分布，参数相加；独立正态变量之和仍服从正态分布，均值和方差分别相加。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：若 $X\sim P(\lambda_1)$，$Y\sim P(\lambda_2)$ 独立，则 $X+Y\sim P(\lambda_1+\lambda_2)$；若 $X\sim N(\mu_1,\sigma_1^2)$，$Y\sim N(\mu_2,\sigma_2^2)$ 独立，则 $X+Y\sim N(\mu_1+\mu_2,\sigma_1^2+\sigma_2^2)$。

**解题方法**：识别独立同类型变量，直接套用可加性结论。

**易错警示**：可加性要求独立；不要把泊松参数相乘或相除。

**关联考点**：考点五·离散型随机变量的分布；考点十·多维随机变量函数的分布。
:::

---

### 第6题

:::callout{kind=note label="题目"}
若 $(X,Y)$ 在三角形 $D=\{(x,y):x\ge0,y\ge0,x+y\le1\}$ 上服从二维均匀分布，则联合密度在 $D$ 上的常数为__________，且 $f_X(x)=$__________（$0<x<1$）。
:::

:::callout{kind=insight label="解析"}
三角形 $D$ 的面积为

$$S_D=\frac{1}{2}\times1\times1=\frac{1}{2}$$

二维均匀分布的联合密度为区域面积的倒数，故常数

$$c=\frac{1}{S_D}=2$$

边缘密度：

$$f_X(x)=\int_{0}^{1-x}2\,dy=2(1-x),\quad0<x<1$$

答案：$2$；$2(1-x)$。
:::

:::callout{kind=tip label="结论速记"}
二维均匀分布的密度为区域面积的倒数；边缘密度对另一个变量积分，注意积分限由区域边界决定。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：二维均匀分布 $f(x,y)=\frac{1}{S_D}$（$(x,y)\in D$）；边缘密度 $f_X(x)=\int f(x,y)\,dy$。

**解题方法**：先求区域面积得密度常数；边缘密度积分时，$y$ 的范围从 $0$ 到 $1-x$（由 $x+y\le1$ 决定）。

**易错警示**：三角形面积是 $1/2$，不是 $1$；边缘密度积分限随 $x$ 变化。

**关联考点**：考点八·多维随机变量与条件分布；考点六·连续型随机变量的分布。
:::

---

### 第7题

:::callout{kind=note label="题目"}
二维正态分布中，若第五个参数相关系数 $\rho=0$，则 $X$ 与 $Y$ 的关系是__________。
:::

:::callout{kind=insight label="解析"}
二维正态分布具有特殊性质：$X$ 与 $Y$ 不相关等价于 $X$ 与 $Y$ 相互独立。

由 $\rho=0$ 知 $X$ 与 $Y$ 不相关，因此 $X$ 与 $Y$ 相互独立。

答案：相互独立。
:::

:::callout{kind=tip label="结论速记"}
二维正态分布中：不相关 $\iff$ 独立；这是一般分布不具备的特殊性质。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：二维正态 $(X,Y)\sim N(\mu_1,\mu_2,\sigma_1^2,\sigma_2^2,\rho)$，$X$ 与 $Y$ 独立 $\iff$ $\rho=0$。

**解题方法**：遇到二维正态分布，看到 $\rho=0$ 可直接写独立；但其他分布不相关不一定独立。

**易错警示**：不要把“不相关等价于独立”推广到非正态分布；典型反例：$X\sim N(0,1)$，$Y=X^2$。

**关联考点**：考点九·随机变量的独立性；考点十二·协方差与相关系数。
:::

---

### 第8题

:::callout{kind=note label="题目"}
若 $X_1,\ldots,X_n$ 来自 $N(\mu,\sigma^2)$，则 $\frac{(n-1)S^2}{\sigma^2}\sim$__________，且 $\bar{X}$ 与 $S^2$__________。
:::

:::callout{kind=insight label="解析"}
正态总体样本方差定理：若 $X_1,\ldots,X_n\stackrel{iid}{\sim}N(\mu,\sigma^2)$，则

$$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$$

且样本均值 $\bar{X}$ 与样本方差 $S^2$ 相互独立。

答案：$\chi^2(n-1)$；相互独立。
:::

:::callout{kind=tip label="结论速记"}
正态总体下：$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$；$\bar{X}$ 与 $S^2$ 独立；$\frac{\bar{X}-\mu}{S/\sqrt{n}}\sim t(n-1)$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$S^2=\frac{1}{n-1}\sum_{i=1}^{n}(X_i-\bar{X})^2$；$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$；$\bar{X}$ 与 $S^2$ 独立。

**解题方法**：构造 $t$ 统计量或卡方统计量时，必须先确认正态总体条件；非正态总体结论不成立。

**易错警示**：卡方分布自由度是 $n-1$ 不是 $n$；$S^2$ 定义中分母是 $n-1$。

**关联考点**：考点十五·三大分布；考点十四·总体与样本。
:::

---

### 第9题

:::callout{kind=note label="题目"}
若 $T\sim t(n)$，上 $\alpha$ 分位点记为 $t_\alpha(n)$，则 $t_{1-\alpha}(n)=$__________。
:::

:::callout{kind=insight label="解析"}
$t$ 分布的密度函数关于 $0$ 对称。因此

$$P\{T\le t_{1-\alpha}(n)\}=1-\alpha\Leftrightarrow P\{T>-t_{1-\alpha}(n)\}=1-\alpha$$

由对称性，$-t_{1-\alpha}(n)$ 是右侧 $\alpha$ 分位点，即

$$-t_{1-\alpha}(n)=t_\alpha(n)$$

故

$$t_{1-\alpha}(n)=-t_\alpha(n)$$

答案：$-t_\alpha(n)$。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布对称：$t_{1-\alpha}(n)=-t_\alpha(n)$；标准正态分布也有 $z_{1-\alpha}=-z_\alpha$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$t$ 分布关于 $0$ 对称，$t_{1-\alpha}(n)=-t_\alpha(n)$；$F$ 分布不对称，$F_{1-\alpha}(m,n)=1/F_\alpha(n,m)$。

**解题方法**：利用对称性转换分位点；注意对称分布（$t$、正态）与不对称分布（$F$、$\chi^2$）的公式不同。

**易错警示**：不要把 $t$ 分布与 $F$ 分布的分位点公式混淆。

**关联考点**：考点十五·三大分布。
:::

---

### 第10题

:::callout{kind=note label="题目"}
来自泊松总体 $P(\lambda)$ 的样本 $X_1,\ldots,X_n$，其参数 $\lambda$ 的极大似然估计量为__________。
:::

:::callout{kind=insight label="解析"}
泊松分布 $P(\lambda)$ 的概率质量函数为

$$P\{X_i=x_i\}=\frac{\lambda^{x_i}}{x_i!}e^{-\lambda}$$

样本独立，似然函数为

$$L(\lambda)=\prod_{i=1}^{n}\frac{\lambda^{x_i}}{x_i!}e^{-\lambda}=\frac{\lambda^{\sum x_i}}{\prod x_i!}e^{-n\lambda}$$

取对数：

$$\ln L(\lambda)=\sum x_i\ln\lambda-n\lambda-\ln\left(\prod x_i!\right)$$

对 $\lambda$ 求导并令其为 $0$：

$$\frac{\sum x_i}{\lambda}-n=0\Rightarrow\lambda=\frac{1}{n}\sum_{i=1}^{n}x_i=\bar{x}$$

因此极大似然估计量为 $\bar{X}$（样本均值）。

答案：$\bar{X}$（样本均值）。
:::

:::callout{kind=tip label="结论速记"}
泊松分布参数的 MLE 是样本均值；矩估计也是样本均值，两者一致。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：泊松总体 $P(\lambda)$ 的 MLE 为 $\hat{\lambda}=\bar{X}$；指数分布 $E(\lambda)$ 的 MLE 为 $\hat{\lambda}=1/\bar{X}$；正态总体 $N(\mu,\sigma^2)$ 的 MLE 为 $\hat{\mu}=\bar{X}$，$\hat{\sigma}^2=\frac{1}{n}\sum(X_i-\bar{X})^2$。

**解题方法**：写似然函数 → 取对数 → 求导置零；注意泊松分布取对数后形式简洁。

**易错警示**：不要把泊松分布的 MLE 写成 $1/\bar{X}$（那是指数分布）；MLE 结果区分估计量（大写 $X_i$）和估计值（小写 $x_i$）。

**关联考点**：考点十六·矩估计和极大似然估计。
:::

---

## 二、计算与证明题（共80分）

### 第11题

:::callout{kind=note label="题目"}
条件概率、全概率与贝叶斯公式（10分）

某电子元件由甲、乙、丙三条生产线供货，供货比例分别为 $30\%$、$50\%$、$20\%$，对应次品率分别为 $1\%$、$2\%$、$5\%$。从总库存中随机抽取 $1$ 件，设 $D$ 表示“抽到次品”。

（1）求 $P(D)$；

（2）若已知抽到的是次品，求它来自丙线的概率；

（3）若独立抽取 $100$ 件，求恰有 $3$ 件次品的精确表达式，并给出泊松近似表达式。
:::

:::callout{kind=insight label="解析"}
设 $A_1$、$A_2$、$A_3$ 分别表示产品来自甲、乙、丙生产线，则 $A_1,A_2,A_3$ 构成样本空间的一个划分。已知

$$P(A_1)=0.30,\ P(A_2)=0.50,\ P(A_3)=0.20$$
$$P(D\mid A_1)=0.01,\ P(D\mid A_2)=0.02,\ P(D\mid A_3)=0.05$$

（1）由全概率公式：

$$P(D)=\sum_{i=1}^{3}P(A_i)P(D\mid A_i)=0.30\times0.01+0.50\times0.02+0.20\times0.05=0.023$$

（2）由贝叶斯公式：

$$P(A_3\mid D)=\frac{P(A_3)P(D\mid A_3)}{P(D)}=\frac{0.20\times0.05}{0.023}=\frac{0.01}{0.023}=\frac{10}{23}\approx0.4348$$

（3）独立抽取 $100$ 件，每件次品概率 $p=0.023$，设 $N$ 为次品数，则 $N\sim B(100,0.023)$。

精确表达式：

$$P\{N=3\}=C_{100}^{3}(0.023)^3(0.977)^{97}$$

泊松近似：$\lambda=np=100\times0.023=2.3$，则

$$P\{N=3\}\approx\frac{2.3^3}{3!}e^{-2.3}$$
:::

:::callout{kind=tip label="结论速记"}
全概率“由因到果”求总概率；贝叶斯“由果追因”求后验；二项分布 $n$ 大 $p$ 小时可用泊松近似。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：全概率公式 $P(D)=\sum_i P(A_i)P(D\mid A_i)$；贝叶斯公式 $P(A_j\mid D)=\frac{P(A_j)P(D\mid A_j)}{P(D)}$；泊松近似 $C_n^k p^k(1-p)^{n-k}\approx\frac{\lambda^k}{k!}e^{-\lambda}$，其中 $\lambda=np$。

**解题方法**：画出“原因—结果”树；全概率沿第一层展开；贝叶斯用一条路径除以总概率；泊松近似要求 $n$ 大、$p$ 小、$np$ 适中。

**易错警示**：第二问是“已知次品求来源”，不是 $P(D\mid A_3)$；泊松近似中 $\lambda=np$，不是 $np(1-p)$。

**关联考点**：考点三·贝叶斯公式；考点十三·大数定律和中心极限定理。
:::

---

### 第12题

:::callout{kind=note label="题目"}
二维连续型随机变量：联合、边缘、条件与独立性（12分）

设二维随机变量 $(X,Y)$ 的联合密度为

$$f(x,y)=\begin{cases}c(x+y),&0<x<1,\ 0<y<1,\\0,&\text{其他}\end{cases}$$

（1）求常数 $c$；

（2）求边缘密度 $f_X(x)$、$f_Y(y)$；

（3）求条件密度 $f_{Y\mid X=x}(y)$；

（4）求 $P\{X+Y\le1\}$；

（5）求 $\mathrm{Cov}(X,Y)$ 并判断 $X$ 与 $Y$ 是否独立。
:::

:::callout{kind=insight label="解析"}
（1）由归一化：

$$\int_{0}^{1}\int_{0}^{1}c(x+y)\,dx\,dy=c\int_{0}^{1}\left(\frac{1}{2}+y\right)\,dy=c\left(\frac{1}{2}+\frac{1}{2}\right)=c=1$$

故 $c=1$。

（2）边缘密度：

$$f_X(x)=\int_{0}^{1}(x+y)\,dy=x+\frac{1}{2},\quad0<x<1$$

由对称性

$$f_Y(y)=y+\frac{1}{2},\quad0<y<1$$

（3）条件密度：当 $0<x<1$ 时

$$f_{Y\mid X=x}(y)=\frac{f(x,y)}{f_X(x)}=\frac{x+y}{x+\frac{1}{2}},\quad0<y<1$$

（4）

$$P\{X+Y\le1\}=\int_{0}^{1}\int_{0}^{1-x}(x+y)\,dy\,dx=\int_{0}^{1}\left[x(1-x)+\frac{(1-x)^2}{2}\right]\,dx=\frac{1}{4}$$

（5）

$$E(X)=\int_{0}^{1}x\left(x+\frac{1}{2}\right)\,dx=\frac{1}{3}+\frac{1}{4}=\frac{7}{12}$$

由对称性 $E(Y)=\frac{7}{12}$。而

$$E(XY)=\int_{0}^{1}\int_{0}^{1}xy(x+y)\,dx\,dy=\frac{1}{3}$$

$$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=\frac{1}{3}-\frac{49}{144}=\frac{48-49}{144}=-\frac{1}{144}$$

因为

$$f_X(x)f_Y(y)=\left(x+\frac{1}{2}\right)\left(y+\frac{1}{2}\right)\neq x+y=f(x,y)$$

所以 $X$ 与 $Y$ 不独立。
:::

:::callout{kind=tip label="结论速记"}
二维连续型：归一化求常数；边缘密度积分；条件密度=联合/边缘；独立性看联合密度是否等于边缘乘积。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$f_{Y\mid X=x}(y)=\frac{f(x,y)}{f_X(x)}$；$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$；独立性 $f(x,y)=f_X(x)f_Y(y)$。

**解题方法**：求区域概率时先画出积分区域；判断独立性时，即使支撑集是矩形，也要验证联合密度是否可分解。

**易错警示**：本题 $f(x,y)=x+y$ 不可分解为 $g(x)h(y)$，因此 $X$ 与 $Y$ 不独立；协方差 $-1/144$ 很小但不等于零。

**关联考点**：考点八·多维随机变量与条件分布；考点九·随机变量的独立性；考点十二·协方差与相关系数。
:::

---

### 第13题

:::callout{kind=note label="题目"}
随机变量函数分布与系统寿命（10分）

设两个部件寿命相互独立，$X\sim E(\lambda)$，$Y\sim E(2\lambda)$。记

$$T_s=\min(X,Y),\quad T_p=\max(X,Y),\quad T_b=X+Y$$

（1）求串联系统寿命 $T_s$ 的分布和期望；

（2）求并联系统寿命 $T_p$ 的分布和期望；

（3）求备用系统寿命 $T_b$ 的密度和期望；

（4）比较三种系统的平均寿命。
:::

:::callout{kind=insight label="解析"}
$X$、$Y$ 独立，分布函数分别为

$$F_X(x)=1-e^{-\lambda x}\ (x>0),\quad F_Y(y)=1-e^{-2\lambda y}\ (y>0)$$

（1）串联系统 $T_s=\min(X,Y)$：

$$P\{T_s>t\}=P\{X>t,Y>t\}=P\{X>t\}P\{Y>t\}=e^{-\lambda t}\cdot e^{-2\lambda t}=e^{-3\lambda t}$$

故 $T_s\sim E(3\lambda)$，$F_{T_s}(t)=1-e^{-3\lambda t}$，$E(T_s)=\frac{1}{3\lambda}$。

（2）并联系统 $T_p=\max(X,Y)$：

$$F_{T_p}(t)=P\{X\le t,Y\le t\}=F_X(t)F_Y(t)=(1-e^{-\lambda t})(1-e^{-2\lambda t})$$

$$=1-e^{-\lambda t}-e^{-2\lambda t}+e^{-3\lambda t}$$

密度

$$f_{T_p}(t)=\lambda e^{-\lambda t}+2\lambda e^{-2\lambda t}-3\lambda e^{-3\lambda t}\quad(t>0)$$

期望

$$E(T_p)=\frac{1}{\lambda}+\frac{1}{2\lambda}-\frac{1}{3\lambda}=\frac{6+3-2}{6\lambda}=\frac{7}{6\lambda}$$

（3）备用系统 $T_b=X+Y$：由卷积公式，$t>0$ 时

$$f_{T_b}(t)=\int_{0}^{t}f_X(x)f_Y(t-x)\,dx=\int_{0}^{t}\lambda e^{-\lambda x}\cdot2\lambda e^{-2\lambda(t-x)}\,dx$$

$$=2\lambda^2 e^{-2\lambda t}\int_{0}^{t}e^{\lambda x}\,dx=2\lambda^2 e^{-2\lambda t}\cdot\frac{e^{\lambda t}-1}{\lambda}=2\lambda(e^{-\lambda t}-e^{-2\lambda t})$$

期望

$$E(T_b)=E(X)+E(Y)=\frac{1}{\lambda}+\frac{1}{2\lambda}=\frac{3}{2\lambda}$$

（4）平均寿命比较：

$$E(T_s)=\frac{1}{3\lambda}<E(T_p)=\frac{7}{6\lambda}<E(T_b)=\frac{3}{2\lambda}$$

即串联最短，并联居中，备用最长。
:::

:::callout{kind=tip label="结论速记"}
串联系统寿命取最小值，并联取最大值；最小值用“都大于”的对立最快，最大值用“都小于”计算；和的分布用卷积。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$X\sim E(\lambda)$，$Y\sim E(\mu)$ 独立，$\min(X,Y)\sim E(\lambda+\mu)$；$f_{X+Y}(t)=\int f_X(x)f_Y(t-x)dx$。

**解题方法**：最大值分布用 $F_{\max}(t)=F_X(t)F_Y(t)$；最小值用 $P(\min>t)=P(X>t)P(Y>t)$；和用卷积。

**易错警示**：不要把三种系统公式混用；并联密度是三个指数密度的组合，需保证非负；备用系统期望可用线性性直接相加。

**关联考点**：考点六·连续型随机变量的分布；考点七·随机变量函数的分布；考点十·多维随机变量函数的分布。
:::

---

### 第14题

:::callout{kind=note label="题目"}
数字特征：样本均值、离差与相关系数（12分）

设 $X_1,\ldots,X_n$ 独立同分布，$E(X_i)=\mu$，$D(X_i)=\sigma^2>0$，$n\ge2$。记

$$\bar{X}=\frac{1}{n}\sum_{i=1}^{n}X_i,\quad Y_i=X_i-\bar{X}$$

（1）求 $E(\bar{X})$ 与 $D(\bar{X})$；

（2）求 $D(Y_i)$；

（3）当 $i\neq j$ 时求 $\mathrm{Cov}(Y_i,Y_j)$；

（4）求 $\rho_{Y_1Y_2}$。
:::

:::callout{kind=insight label="解析"}
（1）由期望和方差的线性性质：

$$E(\bar{X})=\frac{1}{n}\sum_{i=1}^{n}E(X_i)=\mu$$

$$D(\bar{X})=\frac{1}{n^2}\sum_{i=1}^{n}D(X_i)=\frac{\sigma^2}{n}$$

（2）

$$Y_i=X_i-\bar{X}=\left(1-\frac{1}{n}\right)X_i-\frac{1}{n}\sum_{k\neq i}X_k$$

由于 $X_i$ 与 $\sum_{k\neq i}X_k$ 独立，

$$D(Y_i)=\left(1-\frac{1}{n}\right)^2\sigma^2+\frac{1}{n^2}(n-1)\sigma^2$$

$$=\frac{(n-1)^2}{n^2}\sigma^2+\frac{n-1}{n^2}\sigma^2=\frac{(n-1)(n-1+1)}{n^2}\sigma^2=\frac{n-1}{n}\sigma^2$$

（3）当 $i\neq j$ 时，

$$\mathrm{Cov}(Y_i,Y_j)=\mathrm{Cov}(X_i-\bar{X},X_j-\bar{X})$$

$$=\mathrm{Cov}(X_i,X_j)-\mathrm{Cov}(X_i,\bar{X})-\mathrm{Cov}(X_j,\bar{X})+D(\bar{X})$$

$X_i$ 与 $X_j$ 独立，$\mathrm{Cov}(X_i,X_j)=0$；

$$\mathrm{Cov}(X_i,\bar{X})=\mathrm{Cov}\left(X_i,\frac{1}{n}X_i\right)=\frac{\sigma^2}{n}$$

因此

$$\mathrm{Cov}(Y_i,Y_j)=0-\frac{\sigma^2}{n}-\frac{\sigma^2}{n}+\frac{\sigma^2}{n}=-\frac{\sigma^2}{n}$$

（4）因为 $D(Y_1)=D(Y_2)=\frac{n-1}{n}\sigma^2$，所以

$$\rho_{Y_1Y_2}=\frac{\mathrm{Cov}(Y_1,Y_2)}{\sqrt{D(Y_1)D(Y_2)}}=\frac{-\frac{\sigma^2}{n}}{\frac{n-1}{n}\sigma^2}=-\frac{1}{n-1}$$
:::

:::callout{kind=tip label="结论速记"}
离差 $Y_i=X_i-\bar{X}$ 满足 $D(Y_i)=\frac{n-1}{n}\sigma^2$；$\mathrm{Cov}(Y_i,Y_j)=-\frac{\sigma^2}{n}$（$i\neq j$）；$\rho_{Y_1Y_2}=-\frac{1}{n-1}$。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$D(\bar{X})=\frac{\sigma^2}{n}$；$D(Y_i)=\frac{n-1}{n}\sigma^2$；$\sum_{i=1}^{n}Y_i=0$ 导致离差之间存在负相关。

**解题方法**：将 $Y_i$ 表示为 $X_i$ 与 $\bar{X}$ 的线性组合，再用协方差双线性展开；或直接利用 $\sum Y_i=0$ 推导。

**易错警示**：$Y_i$ 与 $Y_j$ 虽然都依赖于相同的 $X_i$，但协方差是负的；不要把 $D(Y_i)$ 误写为 $\sigma^2$。

**关联考点**：考点十一·期望与方差；考点十二·协方差与相关系数；考点十四·总体与样本。
:::

---

### 第15题

:::callout{kind=note label="题目"}
大数定律与中心极限定理（10分）

某车间有 $400$ 台独立设备，每台在某时刻开工的概率为 $0.6$。设 $S$ 为开工台数。

（1）说明 $\frac{S}{400}$ 随设备数增大时会稳定到什么数，并指出依据的定理；

（2）用正态近似求最小供电容量 $m$，使 $P\{S\le m\}\ge0.99$。可用 $u_{0.01}=2.33$，建议使用连续性修正；

（3）近似求 $P\{S\ge270\}$。
:::

:::callout{kind=insight label="解析"}
$S\sim B(400,0.6)$，$E(S)=400\times0.6=240$，$D(S)=400\times0.6\times0.4=96$。

（1）由伯努利大数定律，

$$\frac{S}{400}=\frac{1}{400}\sum_{i=1}^{400}X_i\xrightarrow{P}0.6$$

其中 $X_i$ 表示第 $i$ 台设备是否开工。因此 $\frac{S}{400}$ 稳定到 $0.6$。

（2）由 De Moivre–Laplace 中心极限定理，$S$ 近似服从 $N(240,96)$。使用连续性修正：

$$P\{S\le m\}\approx\Phi\left(\frac{m+0.5-240}{\sqrt{96}}\right)\ge0.99$$

$\Phi(2.33)=0.99$，故

$$\frac{m-239.5}{\sqrt{96}}\ge2.33\Rightarrow m\ge239.5+2.33\times9.798\approx262.33$$

取最小整数 $m=263$。

（3）

$$P\{S\ge270\}\approx1-\Phi\left(\frac{269.5-240}{\sqrt{96}}\right)=1-\Phi(3.01)\approx1-0.9987=0.0013$$
:::

:::callout{kind=tip label="结论速记"}
伯努利大数定律：频率依概率收敛到概率；二项分布正态近似要连续性修正。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：De Moivre–Laplace：$S\sim B(n,p)$ 近似 $N(np,np(1-p))$；$P\{S\le k\}\approx\Phi\left(\frac{k+0.5-np}{\sqrt{np(1-p)}}\right)$。

**解题方法**：识别二项模型后，计算 $np$ 和 $np(1-p)$；根据概率方向确定分位点；离散变量近似正态必须做连续性修正。

**易错警示**：“至少 $99\%$”对应左侧概率 $0.99$，分位点取 $2.33$；$P\{S\ge270\}$ 的连续性修正用 $269.5$。

**关联考点**：考点十三·大数定律和中心极限定理。
:::

---

### 第16题

:::callout{kind=note label="题目"}
抽样分布：卡方、$t$ 与 $F$ 的构造（14分）

设 $X_1,\ldots,X_{n+1}$ 来自正态总体 $N(\mu,\sigma^2)$。令

$$\bar{X}_n=\frac{1}{n}\sum_{i=1}^{n}X_i,\quad S_n^2=\frac{1}{n-1}\sum_{i=1}^{n}(X_i-\bar{X}_n)^2$$

$$U=\sqrt{\frac{n}{n+1}}\frac{X_{n+1}-\bar{X}_n}{\sigma},\quad V=\frac{(n-1)S_n^2}{\sigma^2}$$

$$T=\sqrt{\frac{n}{n+1}}\frac{X_{n+1}-\bar{X}_n}{S_n}$$

（1）求 $U$ 的分布；

（2）写出 $V$ 的分布，并说明 $U$ 与 $V$ 是否独立；

（3）求 $T$ 的分布；

（4）若另有独立样本 $Y_1,\ldots,Y_m\sim N(\nu,\tau^2)$，样本方差为 $S_Y^2$，求 $W=\frac{S_n^2/\sigma^2}{S_Y^2/\tau^2}$ 的分布。
:::

:::callout{kind=insight label="解析"}
（1）$X_{n+1}\sim N(\mu,\sigma^2)$，$\bar{X}_n\sim N(\mu,\sigma^2/n)$，且二者独立，故

$$X_{n+1}-\bar{X}_n\sim N\!\left(0,\sigma^2+\frac{\sigma^2}{n}\right)=N\!\left(0,\sigma^2\frac{n+1}{n}\right)$$

标准化得

$$U=\sqrt{\frac{n}{n+1}}\frac{X_{n+1}-\bar{X}_n}{\sigma}\sim N(0,1)$$

（2）由正态总体样本方差定理：

$$V=\frac{(n-1)S_n^2}{\sigma^2}\sim\chi^2(n-1)$$

$\bar{X}_n$ 与 $S_n^2$ 独立，且 $X_{n+1}$ 与 $S_n^2$ 独立，因此 $U$ 与 $V$ 独立。

（3）$t$ 分布构造：

$$T=\frac{U}{\sqrt{V/(n-1)}}\sim t(n-1)$$

（4）因为

$$\frac{(n-1)S_n^2}{\sigma^2}\sim\chi^2(n-1),\quad \frac{(m-1)S_Y^2}{\tau^2}\sim\chi^2(m-1)$$

且二者独立，所以

$$W=\frac{S_n^2/\sigma^2}{S_Y^2/\tau^2}=\frac{\frac{(n-1)S_n^2}{\sigma^2}/(n-1)}{\frac{(m-1)S_Y^2}{\tau^2}/(m-1)}\sim F(n-1,m-1)$$
:::

:::callout{kind=tip label="结论速记"}
标准正态 / 卡方根号 → $t$；卡方/卡方 → $F$；注意自由度顺序。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：$t$ 分布：$T=\frac{Z}{\sqrt{V/k}}\sim t(k)$，$Z\sim N(0,1)$，$V\sim\chi^2(k)$，独立；$F$ 分布：$F=\frac{U/m}{V/n}\sim F(m,n)$，$U\sim\chi^2(m)$，$V\sim\chi^2(n)$，独立。

**解题方法**：把待求统计量改写成标准正态与卡方的组合形式；注意独立性证明（正态总体下 $\bar{X}$ 与 $S^2$ 独立）。

**易错警示**：$F$ 分布自由度顺序是“分子卡方自由度在前，分母卡方自由度在后”；$t$ 分布自由度是卡方自由度。

**关联考点**：考点十五·三大分布；考点十四·总体与样本。
:::

---

### 第17题

:::callout{kind=note label="题目"}
参数估计：矩估计与极大似然估计（12分）

总体密度为

$$f(x;\theta)=\begin{cases}\theta x^{\theta-1},&0<x<1,\\0,&\text{其他}\end{cases}$$

设 $X_1,\ldots,X_n$ 为样本。

（1）求 $\theta$ 的矩估计量；

（2）求 $\theta$ 的极大似然估计量；

（3）若观测值为 $0.50$、$0.70$、$0.80$、$0.90$，分别给出两种估计值。
:::

:::callout{kind=insight label="解析"}
（1）矩估计。总体一阶原点矩：

$$E(X)=\int_{0}^{1}x\cdot\theta x^{\theta-1}\,dx=\theta\int_{0}^{1}x^{\theta}\,dx=\frac{\theta}{\theta+1}$$

令 $E(X)=\bar{X}$，解得

$$\bar{X}(\theta+1)=\theta\Rightarrow\theta=\frac{\bar{X}}{1-\bar{X}}$$

故矩估计量

$$\hat{\theta}_M=\frac{\bar{X}}{1-\bar{X}}$$

（2）极大似然估计。样本独立，似然函数

$$L(\theta)=\prod_{i=1}^{n}\theta x_i^{\theta-1}=\theta^n\left(\prod_{i=1}^{n}x_i\right)^{\theta-1}$$

取对数：

$$\ln L(\theta)=n\ln\theta+(\theta-1)\sum_{i=1}^{n}\ln x_i$$

对 $\theta$ 求导并令其为 $0$：

$$\frac{d\ln L}{d\theta}=\frac{n}{\theta}+\sum_{i=1}^{n}\ln x_i=0$$

解得

$$\hat{\theta}_L=-\frac{n}{\sum_{i=1}^{n}\ln X_i}$$

（3）观测值均值

$$\bar{x}=\frac{0.50+0.70+0.80+0.90}{4}=0.725$$

矩估计值：

$$\hat{\theta}_M=\frac{0.725}{1-0.725}=\frac{0.725}{0.275}\approx2.6364$$

对数似然和

$$\sum\ln x_i=\ln0.50+\ln0.70+\ln0.80+\ln0.90\approx-1.3783$$

极大似然估计值：

$$\hat{\theta}_L=-\frac{4}{-1.3783}\approx2.9020$$
:::

:::callout{kind=tip label="结论速记"}
矩估计：令总体矩等于样本矩；MLE：写似然函数 → 取对数 → 求导置零；注意参数估计量与估计值的区别。
:::

:::callout{kind=memory label="知识延伸"}
**核心公式**：矩估计：$E(X)=\bar{X}$；MLE：$L(\theta)=\prod f(X_i;\theta)$，$\ln L$ 求导置零。

**解题方法**：矩估计先算 $E(X)$；MLE 取对数后把连乘变求和；最后验证驻点为最大值（可用二阶导数或边界分析）。

**易错警示**：$\theta x^{\theta-1}$ 的期望积分是 $\theta/(\theta+1)$，不是 $1$；MLE 结果写估计量用大写 $X_i$，代入数值后才是估计值。

**关联考点**：考点十六·矩估计和极大似然估计。
:::

---

> 本试卷练习完
