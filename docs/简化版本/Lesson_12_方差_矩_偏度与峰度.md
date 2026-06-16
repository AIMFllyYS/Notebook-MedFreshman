# 第 12 节：方差、矩、偏度与峰度

> 本节前置：第 11 节（期望定义、LOTUS、线性性、独立时 $E(XY)=E(X)E(Y)$）
> 本节通向：第 13 节（协方差、相关系数、切比雪夫不等式）、第 18 节（矩估计——样本矩 $\to$ 总体矩）
> 关键风格：公理化 / 反例优先 / 性质反用

---

## 一、本节知识要点总览（知识点清单表格）

| 编号 | 知识点 | 一句话说明 |
|------|--------|------------|
| KP1 | 方差 $\text{Var}(X)=E[(X-\mu)^2]$ 与实用公式 $\text{Var}=E(X^2)-(E(X))^2$ | 刻画分散程度；标准差 $\sigma=\sqrt{\text{Var}}$；$\text{Var}=0\Leftrightarrow X\equiv c$ a.s. |
| KP2 | 方差性质：平移不变、尺度平方、独立时可加 | $\text{Var}(aX+b)=a^2\text{Var}(X)$；独立时 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)$；标准化 $Z=(X-\mu)/\sigma$ 有零均值单位方差 |
| KP3 | $k$ 阶原点矩 $\alpha_k=E(X^k)$ 与 $k$ 阶中心矩 $\nu_k=E[(X-\mu)^k]$ | $\nu_2=\text{Var}$；样本矩 $\xrightarrow{P}$ 总体矩（LLN）——矩估计法基础 |
| KP4 | 偏度 $=\nu_3/\nu_2^{3/2}$ 与超额峰度 $=\nu_4/\nu_2^2-3$ | 偏度衡量不对称性；峰度衡量尾重（正态 $=0$）；指数偏度 $=2$、均匀峰度 $=-6/5$ |

---

## 二、知识点详解

### KP1：方差定义与计算公式

- **公理化定义 / 正式定义**：
  设 $\mu=E(X)$ 存在。定义方差
  $$\text{Var}(X)=E[(X-\mu)^2].$$
  等价**实用计算公式**（由 LOTUS 展开）：
  $$\text{Var}(X)=E(X^2)-(E(X))^2.$$
  标准差（Standard deviation）：$\sigma(X)=\sqrt{\text{Var}(X)}$。

- **关键性质**：
  1. $\text{Var}(X)\ge 0$。
  2. **退化刻画**：$\text{Var}(X)=0\ \Leftrightarrow\ P(X=\mu)=1$（$X$ 以概率 1 为常数）。
  3. 常用结果：
     - $B(1,p)$：$\text{Var}=p(1-p)$；$B(n,p)$：$\text{Var}=np(1-p)$。
     - $U(a,b)$：$\text{Var}=(b-a)^2/12$。
     - $\text{Exp}(\lambda)$：$\text{Var}=1/\lambda^2$。
     - $N(\mu,\sigma^2)$：$\text{Var}=\sigma^2$。
     - Poisson$(\lambda)$：$\text{Var}=\lambda$（方差 $=$ 均值）。

- **反例 / 易混淆澄清**：
  方差不是"距离 $E(X)$ 的平均距离"——它是**平方**距离，会放大大偏差；而 $E(|X-\mu|)$ 是另一个量（平均绝对偏差）。常见错误：把 $\text{Var}(X)$ 写成 $E(|X-\mu|)$；或忘记开方得到标准差。
  另一易错：**零方差**是"退化到常数"的判据，不应与"期望存在但方差无穷"混淆（存在分布期望有限但方差无穷，例如 $f(x)=2/x^3$ 在 $x\ge 1$，$E(X)=2$ 但 $\text{Var}(X)=\infty$）。

- **术语对照**：方差 Variance / 标准差 Standard deviation / 退化 Degenerate / 实用公式 Computational formula。

> **案例 C1（两点分布 $B(1,p)$ 的方差）**
> 【题目】$X\sim B(1,p)$，用定义算 $\text{Var}(X)$。
> 【分析】$E(X)=p$，$\text{Var}(X)=E[(X-p)^2]$。
> 【求解步骤】
> ① $E[(X-p)^2]=(0-p)^2(1-p)+(1-p)^2 p=p^2(1-p)+(1-p)^2 p=p(1-p)(p+1-p)=p(1-p)$。
> 【答案】$\text{Var}(X)=p(1-p)$。
> 【点评】注意 $p=0$ 或 $1$ 时方差 $=0$（确定性结果），符合"退化"直觉。

> **案例 C2（均匀 $U(a,b)$ 的方差）**
> 【题目】$X\sim U(a,b)$，求 $\text{Var}(X)$。
> 【分析】用 $\text{Var}=E(X^2)-(E(X))^2$，已得 $E(X)=(a+b)/2$。
> 【求解步骤】
> ① $E(X^2)=\int_{a}^{b}x^2/(b-a)\,dx=(b^3-a^3)/(3(b-a))=(a^2+ab+b^2)/3$。
> ② $\text{Var}(X)=(a^2+ab+b^2)/3-((a+b)/2)^2=(b-a)^2/12$。
> 【答案】$\text{Var}(X)=\frac{(b-a)^2}{12}$。
> 【点评】标准差 $=(b-a)/\sqrt{12}\approx 0.289(b-a)$，比直观"半区间长度 $(b-a)/2$"要小——因为平方后对尾部点权重小。

> **案例 C3（指数 $\text{Exp}(\lambda)$ 的方差）**
> 【题目】$X\sim\text{Exp}(\lambda)$，已算出 $E(X)=1/\lambda$，$E(X^2)=2/\lambda^2$。求 $\text{Var}(X)$。
> 【分析】直接用实用公式。
> 【求解步骤】
> ① $\text{Var}(X)=E(X^2)-(E(X))^2=2/\lambda^2-(1/\lambda)^2=1/\lambda^2$。
> 【答案】$\text{Var}(X)=1/\lambda^2$，标准差 $\sigma=1/\lambda=E(X)$。
> 【点评】指数族"方差 $=$ 均值平方"——是典型右偏长尾分布。

> **案例 C4（正态 $N(\mu,\sigma^2)$ 的方差）**
> 【题目】$X\sim N(\mu,\sigma^2)$，密度 $f(x)=\frac{1}{\sqrt{2\pi}\sigma}e^{-(x-\mu)^2/(2\sigma^2)}$，用定义求 $\text{Var}(X)$。
> 【分析】$\text{Var}(X)=\int_{-\infty}^{+\infty}(x-\mu)^2 f(x)\,dx$。令 $y=(x-\mu)/\sigma$。
> 【求解步骤】
> ① $\text{Var}(X)=\frac{\sigma^2}{\sqrt{2\pi}}\int_{-\infty}^{+\infty}y^2 e^{-y^2/2}\,dy$。
> ② $\int_{-\infty}^{+\infty}y^2 e^{-y^2/2}\,dy=\sqrt{2\pi}$（标准正态二阶矩）。
> ③ $\text{Var}(X)=\sigma^2$。
> 【答案】$\text{Var}(X)=\sigma^2$。
> 【点评】正是这个结果，使得 $\sigma^2$ 被称为"方差参数"。

### KP2：方差的性质

- **公理化定义 / 正式性质**：
  1. $\text{Var}(c)=0$（常数方差为 0）。
  2. **平移不变**：$\text{Var}(X+c)=\text{Var}(X)$。
  3. **尺度平方**：$\text{Var}(aX)=a^2\text{Var}(X)$。更一般 $\text{Var}(aX+b)=a^2\text{Var}(X)$。
  4. **独立时可加**：若 $X,Y$ 独立，则 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)$。
     - **一般情形**（不独立）：$\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)+2\text{Cov}(X,Y)$，其中 $\text{Cov}(X,Y)=E[(X-EX)(Y-EY)]$（第 13 节协方差定义）。
  5. **标准化**：设 $E(X)=\mu,\ \text{Var}(X)=\sigma^2>0$，令
     $$Z=\frac{X-\mu}{\sigma},$$
     则 $E(Z)=0,\ \text{Var}(Z)=1$。

- **关键性质**：
  - $\text{Var}(X-Y)=\text{Var}(X)+\text{Var}(Y)$（独立时）——注意 $\text{Var}(-Y)=\text{Var}(Y)$。
  - 若 $X_1,\dots,X_n$ i.i.d.，均值 $\mu$，方差 $\sigma^2$，则样本均值 $\bar{X}=\frac{1}{n}\sum_{i=1}^{n}X_i$ 的方差 $\text{Var}(\bar{X})=\frac{\sigma^2}{n}$——样本量越大，均值越精确。

- **反例 / 易混淆澄清**：
  独立时 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)$；**不独立时一般不成立**，要写成交叉项形式。
  - 若 $X$ 与 $Y$ **正相关**，则 $\text{Cov}(X,Y)>0$，故 $\text{Var}(X+Y)>\text{Var}(X)+\text{Var}(Y)$。
  - 若 $Y=-X$（完全负相关），$\text{Var}(X+Y)=\text{Var}(0)=0$，但 $\text{Var}(X)+\text{Var}(Y)=2\text{Var}(X)>0$。

- **术语对照**：标准化 Standardization / 线性变换 Linear transformation / 协方差 Covariance（下一节）/ 样本均值 Sample mean。

> **案例 C5（标准化随机变量的方差 $=1$）**
> 【题目】$E(X)=\mu,\ \text{Var}(X)=\sigma^2>0$，令 $Z=(X-\mu)/\sigma$。证 $E(Z)=0,\ \text{Var}(Z)=1$。
> 【分析】用线性期望与尺度平方。
> 【求解步骤】
> ① $E(Z)=(E(X)-\mu)/\sigma=0$。
> ② $\text{Var}(Z)=\frac{1}{\sigma^2}\text{Var}(X-\mu)=\frac{1}{\sigma^2}\text{Var}(X)=1$（平移不变）。
> 【答案】$Z$ 是标准化变量，均值 0，方差 1。
> 【点评】第 7 节"正态标准化 $Z\sim N(0,1)$"是这里的特殊情形。

> **案例 C6（i.i.d. 样本均值的方差 $=\sigma^2/n$）**
> 【题目】$X_1,\dots,X_n$ i.i.d.，均值 $\mu$，方差 $\sigma^2$。求 $\text{Var}(\bar{X})$。
> 【分析】展开 $\bar{X}=\frac{1}{n}\sum X_i$，独立时方差可加。
> 【求解步骤】
> ① $\text{Var}(\bar{X})=\frac{1}{n^2}\sum_{i=1}^{n}\text{Var}(X_i)=\frac{1}{n^2}\cdot n\sigma^2=\frac{\sigma^2}{n}$。
> 【答案】$\text{Var}(\bar{X})=\sigma^2/n$。
> 【点评】样本量翻 4 倍，均值标准差减半——统计学"精度 $\propto 1/\sqrt{n}$"的核心。

> **案例 C7（反例：正相关时 $\text{Var}(X+Y)>\text{Var}(X)+\text{Var}(Y)$）**
> 【题目】设 $X,Y$ 同分布，$\text{Var}(X)=\text{Var}(Y)=\sigma^2$，相关系数 $\rho>0$。比较 $\text{Var}(X+Y)$ 与 $2\sigma^2$。
> 【分析】用一般公式 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)+2\text{Cov}(X,Y)$。
> 【求解步骤】
> ① $\text{Cov}(X,Y)=\rho\sigma^2$（第 13 节定义 $\rho=\text{Cov}/\sigma_X\sigma_Y$）。
> ② $\text{Var}(X+Y)=\sigma^2+\sigma^2+2\rho\sigma^2=2\sigma^2(1+\rho)>2\sigma^2$（因 $\rho>0$）。
> 【答案】$\text{Var}(X+Y)=2\sigma^2(1+\rho)>2\sigma^2$。
> 【点评】正相关意味着"同涨同跌"，加总后波动更大——组合分散化需要负相关才对冲。

### KP3：$k$ 阶原点矩与 $k$ 阶中心矩

- **公理化定义 / 正式定义**：
  - $k$ 阶**原点矩**（Raw moments）：$\alpha_k=E(X^k)$，若 $E(|X|^k)<\infty$。
  - $k$ 阶**中心矩**（Central moments）：$\nu_k=E[(X-\mu)^k]$，其中 $\mu=\alpha_1$。

- **关键性质**：
  1. $\alpha_0=1$；$\alpha_1=\mu$（均值）；$\nu_1=0$（定义）；$\nu_2=\text{Var}(X)$（方差）。
  2. **奇数阶中心矩刻画不对称**：偏度与 $\nu_3$ 符号一致。
  3. **偶数阶中心矩刻画分散/尾重**：正态分布偶阶矩：
     $$\nu_{2k}=(2k-1)!!\,\sigma^{2k}=\frac{(2k)!}{2^k k!}\,\sigma^{2k},$$
     其中 $(2k-1)!!=(2k-1)(2k-3)\cdots 1$ 为双阶乘。（奇数阶中心矩 $=0$，因正态对称）。
  4. **样本矩**：$A_k=\frac{1}{n}\sum_{i=1}^{n}X_i^k$。由大数定律，$A_k\xrightarrow{P}\alpha_k$（为第 18 节矩估计铺垫）。

- **反例 / 易混淆澄清**：
  存在期望有限但高阶矩无穷的分布（如前面提到的 $f(x)=2/x^3$ 在 $x\ge 1$：$E(X)=2$ 但 $E(X^2)=\infty$）。因此，"所有矩存在"是一个**更强**的条件——不要默认每个分布都有任意高阶矩。

- **术语对照**：原点矩 Raw moments / 中心矩 Central moments / 双阶乘 Double factorial / 样本矩 Sample moments / 矩估计 Method of moments。

> **案例 C8（正态分布的中心矩公式记忆）**
> 【题目】$X\sim N(\mu,\sigma^2)$，求 $\nu_4=E[(X-\mu)^4]$。
> 【分析】令 $Y=(X-\mu)/\sigma\sim N(0,1)$。$\nu_4=\sigma^4 E(Y^4)$。
> 【求解步骤】
> ① $E(Y^4)=\int_{-\infty}^{+\infty}y^4\varphi(y)\,dy$，其中 $\varphi$ 为标准正态密度。
> ② 用正态矩递推或直接计算：$E(Y^4)=3$。
> ③ 故 $\nu_4=3\sigma^4$。
> 【答案】正态四阶中心矩 $=3\sigma^4$；即" excess kurtosis $=\nu_4/\nu_2^2-3=3\sigma^4/(\sigma^2)^2-3=0$"——正态超额峰度为 0，符合定义（KP4）。
> 【点评】$\nu_6=15\sigma^6,\ \nu_8=105\sigma^8$——双阶乘乘 $\sigma^{2k}$。

> **案例 C9（用矩表达偏度与峰度）**
> 【题目】设 $E(X)=\mu,\ \text{Var}(X)=\sigma^2$，用 $\alpha_1,\alpha_2,\alpha_3,\alpha_4$ 写出偏度与超额峰度。
> 【分析】先把中心矩用原点矩表达：$\nu_2=\alpha_2-\alpha_1^2$；$\nu_3=\alpha_3-3\alpha_1\alpha_2+2\alpha_1^3$；$\nu_4=\alpha_4-4\alpha_1\alpha_3+6\alpha_1^2\alpha_2-3\alpha_1^4$。
> 【求解步骤】
> ① 偏度 $=\nu_3/\nu_2^{3/2}$。
> ② 超额峰度 $=\nu_4/\nu_2^2-3$。
> 【答案】偏度 $=\dfrac{\alpha_3-3\alpha_1\alpha_2+2\alpha_1^3}{(\alpha_2-\alpha_1^2)^{3/2}}$；超额峰度 $=\dfrac{\alpha_4-4\alpha_1\alpha_3+6\alpha_1^2\alpha_2-3\alpha_1^4}{(\alpha_2-\alpha_1^2)^2}-3$。
> 【点评】这是实际计算中"从样本矩估计偏度/峰度"的模板。

> **案例 C10（样本矩 $\to$ 总体矩——为矩估计铺垫）**
> 【题目】设 $X_1,\dots,X_n$ i.i.d. $U(0,\theta)$。用前 1 阶矩估计 $\theta$。
> 【分析】总体一阶矩 $\alpha_1=E(X)=\theta/2$，样本一阶矩 $A_1=\bar{X}$。令 $A_1=\hat{\theta}/2$。
> 【求解步骤】
> ① 由 $\bar{X}=\hat{\theta}/2$ 得 $\hat{\theta}=2\bar{X}$。
> 【答案】矩估计 $\hat{\theta}=2\bar{X}$。
> 【点评】第 18 节会系统讲解：矩估计法就是"令样本矩 $=$ 总体矩（同阶）"来反解参数。

### KP4：偏度与峰度

- **公理化定义 / 正式定义**：
  设 $E(X)=\mu,\ \text{Var}(X)=\sigma^2$。
  - **偏度**（Skewness）：
    $$\gamma_1=\frac{\nu_3}{\nu_2^{3/2}}=\frac{E[(X-\mu)^3]}{\sigma^3}.$$
  - **（超额）峰度**（Excess kurtosis）：
    $$\gamma_2=\frac{\nu_4}{\nu_2^2}-3=\frac{E[(X-\mu)^4]}{\sigma^4}-3.$$
    （注：减去 3 是以正态为基准——正态的超额峰度 $=0$。不加 $-3$ 的版本叫"普通峰度"，正态普通峰度 $=3$。）

- **关键性质与判读**：
  1. 偏度 $\gamma_1$：
     - $\gamma_1>0$：正偏/右偏（长尾在右，例如指数、对数正态）。
     - $\gamma_1=0$："关于均值对称"是充分条件，但**非必要**（存在不对称但 $\nu_3=0$ 的分布）。
     - $\gamma_1<0$：负偏/左偏（长尾在左）。
  2. 超额峰度 $\gamma_2$：
     - $\gamma_2>0$：比正态更"尖峰/厚尾"（Laplace、$t$ 分布、金融收益率常见）。
     - $\gamma_2=0$：正态基准。
     - $\gamma_2<0$：比正态更"扁平/薄尾"（均匀、有界分布常见）。

- **反例 / 易混淆澄清**：
  - 偏度 $=0\ \not\Rightarrow$ 对称——可以构造"轻微不对称但三阶矩恰好为 0"的混合分布（本科了解即可）。
  - 正态的四阶矩 $\nu_4=3\sigma^4$，因此普通峰度 $=3$，超额峰度 $=0$；**不要写成 3 的版本去比较"尾重"**——软件里通常给你的是超额峰度。
  - 偏度与峰度对异常值极为敏感——少量异常点即可驱动它们剧烈变化。

- **术语对照**：偏度 Skewness / 峰度 Kurtosis / 超额峰度 Excess kurtosis / 右偏 Positive skew / 厚尾 Heavy tail。

> **案例 C11（指数分布 $\text{Exp}(\lambda)$ 的偏度 $=2$）**
> 【题目】$X\sim\text{Exp}(\lambda)$，计算偏度。
> 【分析】利用 $\text{Exp}(\lambda)$ 的 $k$ 阶原点矩：$E(X^k)=k!/\lambda^k$。由此计算 $\mu=1/\lambda$，$\nu_2=1/\lambda^2$，$\nu_3=E(X^3)-3\mu E(X^2)+2\mu^3$。
> 【求解步骤】
> ① $E(X^3)=6/\lambda^3$，$E(X^2)=2/\lambda^2$，$E(X)=1/\lambda$。
> ② $\nu_3=6/\lambda^3-3\cdot(1/\lambda)\cdot(2/\lambda^2)+2\cdot(1/\lambda)^3=6/\lambda^3-6/\lambda^3+2/\lambda^3=2/\lambda^3$。
> ③ $\gamma_1=\nu_3/\nu_2^{3/2}=(2/\lambda^3)/(1/\lambda^3)=2$。
> 【答案】$\text{Exp}(\lambda)$ 的偏度 $=2$（标准正偏、右尾长）。
> 【点评】无论 $\lambda$ 为何，偏度恒为 2——这是指数族的形状不变性。

> **案例 C12（均匀 $U(a,b)$ 的偏度 $=0$、超额峰度 $=-6/5$）**
> 【题目】$X\sim U(a,b)$，计算偏度与超额峰度。
> 【分析】用对称性与直接积分。令 $Y=X-(a+b)/2$（中心化为 0 对称），则奇次中心矩均为 0，故 $\nu_3=0$。
> 【求解步骤】
> ① 偏度 $=\nu_3/\nu_2^{3/2}=0$。
> ② 计算 $\nu_4=E[(X-\mu)^4]=\int_{a}^{b}(x-(a+b)/2)^4/(b-a)\,dx$。令 $h=b-a$，$y=x-(a+b)/2$，则 $\nu_4=\frac{2}{h}\int_{0}^{h/2}y^4 dy=2/h\cdot(h/2)^5/5=h^4/(16\cdot 5)=h^4/80$。
> ③ $\nu_2=h^2/12$，故 $\nu_4/\nu_2^2=(h^4/80)/(h^4/144)=144/80=9/5$。
> ④ 超额峰度 $=9/5-3=-6/5=-1.2$。
> 【答案】偏度 $=0$；超额峰度 $=-6/5$（薄尾、比正态扁）。
> 【点评】均匀是"薄尾"的典型——它根本就没有尾部。

> **案例 C13（Laplace(0,1) 的超额峰度 $=3$）**
> 【题目】$X$ 服从 Laplace(0,1)，即 $f(x)=\frac{1}{2}e^{-|x|}$（$x\in\mathbb{R}$）。计算超额峰度。
> 【分析】对称 $\Rightarrow \mu=0$，$\nu_k=E(X^k)$。奇偶性 $\Rightarrow$ 奇数阶矩 $=0$。
> 【求解步骤】
> ① $\nu_2=E(X^2)=\int_{-\infty}^{+\infty}x^2\cdot\frac{1}{2}e^{-|x|}dx=\int_{0}^{+\infty}x^2 e^{-x}dx=2$（因 $\Gamma(3)=2!=2$）。
> ② $\nu_4=E(X^4)=\int_{-\infty}^{+\infty}x^4\cdot\frac{1}{2}e^{-|x|}dx=\int_{0}^{+\infty}x^4 e^{-x}dx=24$（$\Gamma(5)=4!=24$）。
> ③ $\nu_4/\nu_2^2=24/4=6$。超额峰度 $=6-3=3$。
> 【答案】Laplace(0,1) 超额峰度 $=3$（显著厚尾）。
> 【点评】金融风险常用"厚尾模型"——Laplace 是最简单的厚尾基准之一。

---

## 三、本节例题汇总

- C1：两点分布 $B(1,p)$ 方差 $=p(1-p)$。
- C2：均匀 $U(a,b)$ 方差 $=(b-a)^2/12$。
- C3：指数 $\text{Exp}(\lambda)$ 方差 $=1/\lambda^2$。
- C4：正态 $N(\mu,\sigma^2)$ 方差 $=\sigma^2$（定义法）。
- C5：标准化 $Z=(X-\mu)/\sigma$ 的 $\text{Var}=1$。
- C6：i.i.d. 样本均值方差 $=\sigma^2/n$。
- C7：正相关时 $\text{Var}(X+Y)>\text{Var}(X)+\text{Var}(Y)$。
- C8：正态四阶中心矩 $=3\sigma^4$（正态峰度基准）。
- C9：偏度与峰度用原点矩表达的通用公式。
- C10：样本矩 $\to$ 总体矩——$U(0,\theta)$ 的矩估计 $\hat{\theta}=2\bar{X}$。
- C11：指数分布偏度 $=2$。
- C12：均匀偏度 $=0$、超额峰度 $=-6/5$。
- C13：Laplace(0,1) 超额峰度 $=3$。

---

## 四、反例与反命题澄清（小结）

| 常见误解 | 正确说法 | 备注 |
|----------|----------|------|
| "$\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)$ 对任何 $X,Y$ 成立" | 仅在**独立/不相关**时成立；一般要加 $2\text{Cov}(X,Y)$ | $Y=-X$ 时左边 $=0$，右边 $=2\text{Var}(X)$ |
| "方差为 0 说明数据 $=\mu$（所有实现都一样）" | $X=\mu$ **几乎处处**成立；允许存在零概率集合偏离 | 对样本方差"$s^2=0$"才说明所有样本值相等 |
| "$E(X^2)=(E(X))^2$" | $\text{Var}(X)=E(X^2)-(E(X))^2\ge 0$，等号仅在 $X$ 退化时成立 | 由 Jensen（$x^2$ 凸）直接看出 |
| "正态峰度 $=3$" | **普通**峰度 $=3$；**超额**峰度 $=0$ | 软件通常输出超额峰度，务必确认基准 |
| "偏度 $=0\Rightarrow$ 分布对称" | 对称 $\Rightarrow$ 偏度 $=0$；但反推不成立 | 可构造不对称但 $\nu_3=0$ 的混合分布 |
| "所有分布都有任意高阶矩" | 存在期望有限但方差无穷的分布；柯西根本没有任何矩 | $f(x)=2/x^3$（$x\ge 1$）：$E(X)=2$，$E(X^2)=\infty$ |

---

## 五、通向下一步的衔接

- 方差的"一般加法公式"$\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)+2\text{Cov}(X,Y)$ 直接定义了**协方差**——第 13 节的核心概念。
- 切比雪夫不等式（第 13 节）直接使用 $\mu$ 与 $\sigma$，给出"分布集中程度"的保守尾部估计，无需正态假设。
- 样本矩 $\to$ 总体矩（大数定律）将在第 18 节（矩估计）和第 15 节（大数定律）中成为"从样本到总体"的关键技术。
- 若跳过本节，则不知"协方差/相关系数/切比雪夫不等式"从何而来；无法理解样本均值精度 $\propto 1/\sqrt{n}$ 的来源；也无法解释数据为何呈现"尖峰厚尾"。
