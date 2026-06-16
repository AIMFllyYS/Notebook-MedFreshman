# 第 10 节：随机变量独立性与多维函数分布

> 本节前置：第 8、9 节（联合、边缘、条件分布；消元积分法求边缘；矩形区域与非矩形区域的差异）
> 本节通向：第 11 节（数学期望——把分布"浓缩"为数字特征，在多维场景下大量使用本节结论）
> 关键风格：公理化 / 反例优先 / 性质反用

---

## 一、本节知识要点总览（知识点清单表格）

| 编号 | 知识点 | 一句话说明 |
|------|--------|------------|
| KP1 | 独立性定义——联合 $=$ 边缘乘积（Joint $=$ Marginal Product） | $F(x,y)=F_X(x)F_Y(y)$ 对所有 $x,y$；连续型等价 $f(x,y)=f_X(x)f_Y(y)$；离散型等价 $P(X=x_i,Y=y_j)=P(X=x_i)P(Y=y_j)$ |
| KP2 | $Z=X+Y$ 的分布——卷积公式（Convolution Formula） | 独立时 $f_{X+Y}(z)=\int_{-\infty}^{+\infty}f_X(x)f_Y(z-x)\,dx$；正态之和仍正态、独立指数之和为伽马 |
| KP3 | $Z=\max(X,Y)$ 与 $Z=\min(X,Y)$ 的分布函数（Extremes） | 独立时 $F_{\max}(z)=F_X(z)F_Y(z)$，$F_{\min}(z)=1-(1-F_X(z))(1-F_Y(z))$；对应并联/串联系统寿命 |
| KP4 | $Y=g(X)$ 的一维变换——分布函数法 / 严格单调密度变换 | 通用方法：先求 $F_Y(y)=P(g(X)\le y)$ 再求导；严格单调可导时 $f_Y(y)=f_X(h(y))\cdot\|h'(y)\|$，$h=g^{-1}$ |

---

## 二、知识点详解

### KP1：独立性定义——联合 $=$ 边缘乘积（Independence: Joint $=$ Marginal Product）

- **公理化定义 / 正式定义**：
  设 $(X,Y)$ 为二维随机向量，称 $X$ 与 $Y$ **相互独立**，若对任意实数 $x,y$ 都有
  $$F(x,y)=F_X(x)\cdot F_Y(y).$$
  其中 $F$ 为联合分布函数，$F_X,F_Y$ 为边缘分布函数。
  - 对**连续型**：等价于对几乎所有 $(x,y)$，$f(x,y)=f_X(x)\cdot f_Y(y)$。
  - 对**离散型**：等价于对所有取值 $(x_i,y_j)$，$P(X=x_i,Y=y_j)=P(X=x_i)\cdot P(Y=y_j)$。
  - 一个实用判据：若 $f(x,y)$ 在一个**矩形区域** $\{(x,y):a<x<b,\ c<y<d\}$ 上可写成 $g(x)\cdot h(y)$，则 $X$ 与 $Y$ 独立。

- **关键性质**：
  1. 独立事件对 Borel 集 $A,B$ 有 $P(X\in A,\ Y\in B)=P(X\in A)\cdot P(Y\in B)$。
  2. 若 $X,Y$ 独立，则 $g(X)$ 与 $h(Y)$ 也独立（对可测函数 $g,h$）。
  3. 独立时条件分布 $=$ 边缘分布：$f_{Y|X}(y|x)=f_Y(y)$。
  4. 联合密度可分离变量 $+$ 矩形定义域 $\Rightarrow$ 独立。

- **反例 / 易混淆澄清**：
  "可分离变量"本身不能推出独立，**必须联合定义域是矩形**。考虑**三角区域** $D=\{(x,y):x\ge 0,\ y\ge 0,\ x+y\le 1\}$ 上的均匀分布
  $$f(x,y)=\begin{cases}2, & (x,y)\in D,\\0, & \text{其他}.\end{cases}$$
  定义域不是矩形（$y$ 的上界依赖于 $x$），计算边缘
  $$f_X(x)=\int_{0}^{1-x}2\,dy=2(1-x),\quad 0<x<1;\qquad f_Y(y)=2(1-y),\quad 0<y<1.$$
  于是 $f_X(x)\cdot f_Y(y)=4(1-x)(1-y)\neq 2=f(x,y)$，所以 $X$ 与 $Y$ **不独立**。直观上也是如此：知道 $X=x$ 就限制了 $Y\le 1-x$，信息泄露说明不独立。

- **术语对照**：独立性 Independence / 联合分布 Joint distribution / 边缘分布 Marginal distribution / 矩形区域 Rectangle domain / 三角区域 Triangular domain。

> **案例 C1（密度可分离 + 矩形定义域判定独立）**
> 【题目】设 $(X,Y)$ 的联合密度为 $f(x,y)=6e^{-2x-3y}$，$x>0,\ y>0$，其他为 $0$。判断 $X,Y$ 是否独立，并求边缘。
> 【分析】$f(x,y)$ 可写成 $g(x)\cdot h(y)=6e^{-2x}\cdot e^{-3y}$（或等价地 $2e^{-2x}\cdot 3e^{-3y}$），且定义域 $\{x>0,y>0\}$ 是矩形（$x,y$ 的范围互不依赖），由判据知独立。
> 【求解步骤】
> ① 求 $f_X(x)=\int_{0}^{+\infty}6e^{-2x-3y}\,dy=6e^{-2x}\int_{0}^{+\infty}e^{-3y}dy=6e^{-2x}\cdot\frac{1}{3}=2e^{-2x}$，$x>0$。即 $X\sim\text{Exp}(2)$。
> ② 求 $f_Y(y)=\int_{0}^{+\infty}6e^{-2x-3y}\,dx=3e^{-3y}$，$y>0$。即 $Y\sim\text{Exp}(3)$。
> ③ 验证 $f_X(x)\cdot f_Y(y)=2e^{-2x}\cdot 3e^{-3y}=6e^{-2x-3y}=f(x,y)$。
> 【答案】$X$ 与 $Y$ 相互独立；$X\sim\text{Exp}(2)$，$Y\sim\text{Exp}(3)$。
> 【点评】"可分离 + 矩形"判据是最快捷的识别方法，非常适合考试现场判断。

> **案例 C2（离散联合表验证独立）**
> 【题目】抛掷两枚均匀骰子，$X=$ 第一枚点数，$Y=$ 第二枚点数。取两组值 $(1,2)$ 与 $(3,4)$ 验证独立。
> 【分析】离散独立等价于 $P(X=x_i,Y=y_j)=P(X=x_i)P(Y=y_j)$ 对所有 $i,j$ 成立。
> 【求解步骤】
> ① $P(X=1)=\frac16,\ P(Y=2)=\frac16$，而 $P(X=1,Y=2)=\frac{1}{36}=\frac16\cdot\frac16$。
> ② $P(X=3)=\frac16,\ P(Y=4)=\frac16$，而 $P(X=3,Y=4)=\frac{1}{36}=\frac16\cdot\frac16$。
> ③ 同理对任意 $(i,j)$ 都成立。
> 【答案】两骰子点数独立。
> 【点评】离散独立的验证只需逐格核对：行和 $\times$ 列和是否等于格值。

> **案例 C3（反例：三角区域均匀不独立）**
> 【题目】设 $(X,Y)$ 在 $D=\{x\ge 0,y\ge 0,x+y\le 1\}$ 上均匀。验证 $X,Y$ 不独立。
> 【分析】先求边缘，再看乘积是否等于联合密度。
> 【求解步骤】
> ① $D$ 的面积 $=\frac12$，所以 $f(x,y)=2$ 在 $D$ 上。
> ② $f_X(x)=\int_{0}^{1-x}2\,dy=2(1-x)$，$0<x<1$。同理 $f_Y(y)=2(1-y)$，$0<y<1$。
> ③ $f_X(x)\cdot f_Y(y)=4(1-x)(1-y)$，在 $D$ 内显然 $\neq 2$（例如取 $x=y=0$ 左 $=4$，右 $=2$）。
> 【答案】$X$ 与 $Y$ 不独立。
> 【点评】只要定义域非矩形，即使密度在内部是常数也不独立——"知道一个变量会约束另一个"。

### KP2：$Z=X+Y$ 的分布——卷积公式（Convolution Formula）

- **公理化定义 / 正式定义**：
  设 $(X,Y)$ 为连续型，联合密度 $f(x,y)$。令 $Z=X+Y$，则
  $$f_Z(z)=\int_{-\infty}^{+\infty}f(x,\,z-x)\,dx.$$
  当 $X,Y$ **独立**时，$f(x,z-x)=f_X(x)f_Y(z-x)$，故
  $$f_{X+Y}(z)=\int_{-\infty}^{+\infty}f_X(x)\,f_Y(z-x)\,dx,$$
  称为 $f_X$ 与 $f_Y$ 的**卷积**（convolution），记作 $f_X*f_Y$。对称地也有 $\int f_X(z-y)f_Y(y)\,dy$。

- **关键性质**：
  1. 独立正态之和仍正态：若 $X\sim N(\mu_1,\sigma_1^2),\ Y\sim N(\mu_2,\sigma_2^2)$ 独立，则 $X+Y\sim N(\mu_1+\mu_2,\,\sigma_1^2+\sigma_2^2)$。
  2. 独立同参数指数之和为伽马：$X_i\stackrel{\text{i.i.d.}}{\sim}\text{Exp}(\lambda)$，则 $X_1+\cdots+X_n\sim\Gamma(n,\lambda)$（形状 $n$，率 $\lambda$）。
  3. 离散对应：$P(X+Y=k)=\sum_{i}P(X=i)P(Y=k-i)$。

- **反例 / 易混淆澄清**：
  不独立时**卷积公式不成立**，必须回到一般公式 $f_{X+Y}(z)=\int f(x,z-x)\,dx$。特别地，如果 $Y=-X$，则 $Z=X+Y=0$ 是常数，密度退化——而 $\int f_X(x)f_X(z-x)\,dx$ 不会给出退化分布。

- **术语对照**：卷积 Convolution / 求和分布 Sum distribution / 伽马分布 Gamma distribution / 正态再生性 Reproductive property of normal。

> **案例 C4（两独立 Uniform(0,1) 之和——三角分布）**
> 【题目】$X,Y$ 独立且均服从 $U(0,1)$，求 $Z=X+Y$ 的密度。
> 【分析】卷积 $f_Z(z)=\int_{-\infty}^{+\infty}f_X(x)f_Y(z-x)\,dx$，其中 $f_X=1_{(0,1)}$，$f_Y=1_{(0,1)}$。被积函数 $\neq 0$ 要求 $0<x<1$ 且 $0<z-x<1$，即 $x\in(\max(0,z-1),\ \min(1,z))$。
> 【求解步骤】
> ① $0<z\le 1$：$x\in(0,z)$，$f_Z(z)=\int_{0}^{z}1\cdot 1\,dx=z$。
> ② $1<z<2$：$x\in(z-1,1)$，$f_Z(z)=\int_{z-1}^{1}1\,dx=2-z$。
> ③ 其他 $z$：$f_Z(z)=0$。
> 【答案】$f_Z(z)=\begin{cases}z, & 0<z\le 1,\\2-z, & 1<z<2,\\0, & \text{其他}.\end{cases}$（三角分布 / Triangular distribution）。
> 【点评】两均匀之和由"平+平"得到三角形——是卷积几何直观的经典入门例。

> **案例 C5（两独立同参数指数之和）**
> 【题目】$X,Y$ 独立，$X\sim\text{Exp}(\lambda),\ Y\sim\text{Exp}(\lambda)$，求 $Z=X+Y$ 的密度。
> 【分析】使用卷积：$f_X(t)=\lambda e^{-\lambda t}\cdot 1_{(t>0)}$，所以 $f_Z(z)=\int_{0}^{z}\lambda e^{-\lambda x}\cdot\lambda e^{-\lambda(z-x)}\,dx$（$x>0$ 且 $z-x>0$）。
> 【求解步骤】
> ① $f_Z(z)=\lambda^2 e^{-\lambda z}\int_{0}^{z}dx=\lambda^2 z\,e^{-\lambda z}$，$z>0$。
> ② 此即 $\Gamma(2,\lambda)$ 的密度（形状 $2$，率 $\lambda$）。
> 【答案】$Z=X+Y\sim\Gamma(2,\lambda)$，$f_Z(z)=\lambda^2 z\,e^{-\lambda z}$，$z>0$。
> 【点评】本科阶段只需记住"独立同参数指数之和为伽马"；若要继续推导 $n$ 个相加则得到 $\Gamma(n,\lambda)$。

> **案例 C6（两独立标准正态之和——卷积推导）**
> 【题目】$X\sim N(0,1),\ Y\sim N(0,1)$ 独立，求 $Z=X+Y$ 的密度。
> 【分析】由卷积 $f_Z(z)=\frac{1}{2\pi}\int_{-\infty}^{+\infty}e^{-x^2/2}\cdot e^{-(z-x)^2/2}dx$。配方指数：$x^2+(z-x)^2=2x^2-2zx+z^2=2(x-z/2)^2+z^2/2$。
> 【求解步骤】
> ① $f_Z(z)=\frac{1}{2\pi}e^{-z^2/4}\int_{-\infty}^{+\infty}e^{-(x-z/2)^2}dx$。
> ② 积分 $=\sqrt{\pi}$（$N(z/2,1/2)$ 密度归一化），故 $f_Z(z)=\frac{1}{\sqrt{2\pi}\sqrt{2}}\,e^{-z^2/(2\cdot 2)}$。
> 【答案】$Z\sim N(0,2)$。
> 【点评】这给出了"正态 $+$ 正态 $=$ 正态"在独立情形下的一个直接证明（也可用第 7 节的矩母函数法）。

### KP3：$Z=\max(X,Y)$ / $Z=\min(X,Y)$ 的分布函数（Extremes）

- **公理化定义 / 正式定义**：
  设 $X,Y$ 独立，分布函数分别为 $F_X,F_Y$。
  $$F_{\max}(z)=P(\max(X,Y)\le z)=P(X\le z,\,Y\le z)=F_X(z)\cdot F_Y(z),$$
  $$F_{\min}(z)=P(\min(X,Y)\le z)=1-P(\min(X,Y)>z)=1-P(X>z,\,Y>z)=1-(1-F_X(z))(1-F_Y(z)).$$
  若 $X_1,\ldots,X_n$ 独立同分布（i.i.d.），公共分布函数为 $F$，则
  $$F_{\max}(z)=[F(z)]^n,\qquad F_{\min}(z)=1-[1-F(z)]^n.$$

- **关键性质**：
  1. 串联系统寿命 $=\min$（任一失效则系统失效）；并联系统寿命 $=\max$（全部失效才系统失效）。
  2. 独立指数族的**最小值仍为指数**：$X\sim\text{Exp}(\lambda),\ Y\sim\text{Exp}(\mu)$ 独立 $\Rightarrow\ \min(X,Y)\sim\text{Exp}(\lambda+\mu)$。
  3. 最大值不再保持指数型——分布函数变为 $F(z)=(1-e^{-\lambda z})^n$，不再是单参数指数族。

- **反例 / 易混淆澄清**：
  公式 $F_{\max}=F_XF_Y$ **仅当独立**成立。若 $Y=X$（完全相关），则 $\max(X,Y)=X$，$F_{\max}(z)=F_X(z)$，而 $[F_X(z)]^2$ 给出不同结果。

- **术语对照**：最大值 Max / 最小值 Min / 极值 Extremes / 串联系统 Series system / 并联系统 Parallel system / 无记忆性 Memoryless property。

> **案例 C7（独立同分布指数的最小值仍是指数）**
> 【题目】$X,Y$ 独立，$X\sim\text{Exp}(\lambda),\ Y\sim\text{Exp}(\mu)$，求 $\min(X,Y)$ 的分布。
> 【分析】用最小者公式 $F_{\min}(z)=1-(1-F_X(z))(1-F_Y(z))$。
> 【求解步骤】
> ① $F_X(x)=1-e^{-\lambda x},\ F_Y(y)=1-e^{-\mu y}$（$x,y>0$）。
> ② $F_{\min}(z)=1-e^{-\lambda z}\cdot e^{-\mu z}=1-e^{-(\lambda+\mu)z}$，$z>0$。
> 【答案】$\min(X,Y)\sim\text{Exp}(\lambda+\mu)$。
> 【点评】这是指数族"最小者仍为指数"的记忆性来源：多个独立指数寿命组件中"第一个失效时间"仍服从指数，参数相加。

> **案例 C8（串联 vs 并联的可靠性比较）**
> 【题目】设三个组件寿命独立同分布 $\text{Exp}(1)$。比较（a）串联、（b）并联两种系统在时刻 $t=1$ 的可靠度 $P(T>1)$。
> 【分析】串联寿命 $T_s=\min(X_1,X_2,X_3)$；并联寿命 $T_p=\max(X_1,X_2,X_3)$。
> 【求解步骤】
> ① $F(t)=1-e^{-t}$。$P(T_s>t)=(1-F(t))^3=e^{-3t}$。$P(T_s>1)=e^{-3}\approx 0.050$。
> ② $P(T_p>t)=1-[F(t)]^3=1-(1-e^{-t})^3$。$P(T_p>1)=1-(1-e^{-1})^3\approx 0.747$。
> 【答案】$P(T_s>1)\approx 0.050$，$P(T_p>1)\approx 0.747$。并联系统显著更可靠。
> 【点评】从"系统可靠性"角度看 $\min$ 与 $\max$ 的差异非常直观——并联总是更稳。

> **案例 C9（$n$ 个 i.i.d. 的 max/min 一般公式应用）**
> 【题目】设 $X_1,\ldots,X_n$ i.i.d. $\sim U(0,1)$，求 $M=\max(X_i)$ 和 $L=\min(X_i)$ 的密度。
> 【分析】$F(x)=x$（$0<x<1$）。$F_M(x)=x^n$，$F_L(x)=1-(1-x)^n$。
> 【求解步骤】
> ① $f_M(x)=F_M'(x)=n x^{n-1}$，$0<x<1$。
> ② $f_L(x)=F_L'(x)=n(1-x)^{n-1}$，$0<x<1$。
> 【答案】$f_M(x)=n x^{n-1}$；$f_L(x)=n(1-x)^{n-1}$，$0<x<1$。
> 【点评】这是第 18 节"顺序统计量"分布的雏形：$n$ 个均匀样本的最大值更可能靠近 $1$，最小值更可能靠近 $0$。

### KP4：$Y=g(X)$ 的一维变换——分布函数法 / 严格单调密度变换

- **公理化定义 / 正式定义**：
  **通用方法（分布函数法）**：对任意可测函数 $g$，先求 $Y$ 的分布函数
  $$F_Y(y)=P(g(X)\le y),$$
  再对 $y$ 求导得到密度 $f_Y(y)=F_Y'(y)$。关键是解出 $\{g(X)\le y\}$ 对应的 $X$ 区间。

  **严格单调可导情形（密度变换公式）**：设 $g$ 在 $X$ 的取值区间 $I$ 上**严格单调且可导**，令 $h=g^{-1}$ 为其反函数，则
  $$f_Y(y)=f_X(h(y))\cdot|h'(y)|,$$
  其中 $y$ 取值于 $g(I)$。

- **关键性质**：
  1. 线性变换 $Y=aX+b$（$a\neq 0$）：$h(y)=(y-b)/a$，$h'(y)=1/a$，故 $f_Y(y)=\frac{1}{|a|}f_X\!\left(\frac{y-b}{a}\right)$。
  2. $X\sim N(\mu,\sigma^2)\Rightarrow\ Z=\frac{X-\mu}{\sigma}\sim N(0,1)$（第 7 节标准化的严格证明）。
  3. 平方变换 $Y=X^2$，$X\sim N(0,1)\Rightarrow\ Y\sim\chi^2(1)$，密度 $f_Y(y)=\frac{1}{\sqrt{2\pi y}}e^{-y/2}$（$y>0$）——为第 17 节 $\chi^2$ 分布铺垫。
  4. 指数变换 $Y=e^X$，$X\sim N(\mu,\sigma^2)\Rightarrow\ Y$ 服从**对数正态**分布。

- **反例 / 易混淆澄清**：
  非单调情形（例如 $Y=X^2$ 对一般 $X$）**不能直接套用单调公式**，必须用分布函数法**分段**讨论：对 $y>0$，$P(X^2\le y)=P(-\sqrt{y}\le X\le\sqrt{y})=F_X(\sqrt{y})-F_X(-\sqrt{y})$；对 $y\le 0$ 为 $0$。

- **术语对照**：变换 Transformation / 反函数 Inverse function / 严格单调 Strictly monotonic / 雅可比因子 Jacobian factor（此处 $|h'(y)|$）/ 对数正态 Lognormal / 卡方 $\chi^2$（Chi-square）。

> **案例 C10（$Y=X^2$，$X\sim N(0,1)$——$\chi^2(1)$ 密度）**
> 【题目】$X\sim N(0,1)$，求 $Y=X^2$ 的密度。
> 【分析】使用分布函数法，$g(x)=x^2$ 不单调，分 $y>0$ 与 $y\le 0$。
> 【求解步骤】
> ① $y\le 0$：$F_Y(y)=P(X^2\le y)=0$。
> ② $y>0$：$F_Y(y)=P(-\sqrt{y}\le X\le\sqrt{y})=\Phi(\sqrt{y})-\Phi(-\sqrt{y})=2\Phi(\sqrt{y})-1$。
> ③ 求导：$f_Y(y)=\varphi(\sqrt{y})\cdot\frac{1}{\sqrt{y}}=\frac{1}{\sqrt{2\pi y}}e^{-y/2}$。
> 【答案】$f_Y(y)=\frac{1}{\sqrt{2\pi y}}e^{-y/2}$（$y>0$），即自由度 1 的 $\chi^2$ 分布。
> 【点评】这是 $\chi^2$ 分布的"种子"——后面 $\chi^2(n)$ 就是 $n$ 个独立标准正态的平方和。

> **案例 C11（$Y=e^X$，$X\sim N(0,1)$——对数正态密度）**
> 【题目】$X\sim N(0,1)$，求 $Y=e^X$ 的密度。
> 【分析】$g(x)=e^x$ 在 $\mathbb{R}$ 上严格递增，反函数 $h(y)=\ln y$，$h'(y)=1/y$，$y>0$。
> 【求解步骤】
> ① $f_Y(y)=f_X(\ln y)\cdot\left|\frac{1}{y}\right|=\frac{1}{y\sqrt{2\pi}}\,e^{-(\ln y)^2/2}$，$y>0$。
> 【答案】$Y$ 服从对数正态分布，$f_Y(y)=\frac{1}{y\sqrt{2\pi}}\,e^{-(\ln y)^2/2}$，$y>0$。
> 【点评】对数正态在金融、收入分布建模中常见：大量独立乘积因素的极限效应。

> **案例 C12（严格单调情形应用变换公式——$Y=aX+b$）**
> 【题目】$X\sim N(\mu,\sigma^2)$，用密度变换证明 $Z=\frac{X-\mu}{\sigma}\sim N(0,1)$。
> 【分析】$g(x)=\frac{x-\mu}{\sigma}$ 严格单增（$\sigma>0$），反函数 $h(z)=\sigma z+\mu$，$h'(z)=\sigma$。
> 【求解步骤】
> ① $f_Z(z)=f_X(\sigma z+\mu)\cdot\sigma=\frac{1}{\sqrt{2\pi}\sigma}\,e^{-(\sigma z+\mu-\mu)^2/(2\sigma^2)}\cdot\sigma=\frac{1}{\sqrt{2\pi}}\,e^{-z^2/2}$。
> 【答案】$Z\sim N(0,1)$。
> 【点评】这为第 7 节"正态标准化"提供了严格密度推导。

---

## 三、本节例题汇总

- C1：由联合密度可分离变量 $+$ 矩形定义域判定独立（指数分离例）。
- C2：离散联合表（两骰子）验证独立。
- C3：三角区域均匀分布——构造不独立反例。
- C4：两独立 $U(0,1)$ 之和——三角分布（卷积）。
- C5：两独立同参数指数之和——$\Gamma(2,\lambda)$。
- C6：两独立 $N(0,1)$ 之和——$N(0,2)$ 的卷积推导。
- C7：独立指数的最小值仍是指数（记忆性）。
- C8：串联 vs 并联系统的可靠度数值比较。
- C9：$n$ 个 i.i.d. $U(0,1)$ 的 max/min 密度。
- C10：$Y=X^2$，$X\sim N(0,1)$——$\chi^2(1)$ 密度。
- C11：$Y=e^X$，$X\sim N(0,1)$——对数正态密度。
- C12：严格单调密度变换——正态标准化。

---

## 四、反例与反命题澄清（小结）

| 常见误解 | 正确说法 | 备注 |
|----------|----------|------|
| "只要 $f(x,y)$ 能写成 $g(x)h(y)$，就独立" | 必须同时满足**定义域是矩形**（$x,y$ 的取值范围互不依赖） | 三角区域均匀 $f=2$ "看起来"可分离，但不独立 |
| "不相关 $\Rightarrow$ 独立"（本节还未正式定义，但常被提前混淆） | 独立 $\Rightarrow$ 不相关；反推一般不成立 | 第 14 节有标准反例 $X\sim U[-1,1],\ Y=X^2$ |
| "$Z=X+Y$ 的密度总是卷积 $\int f_X(x)f_Y(z-x)\,dx$" | 仅在 $X,Y$ 独立时成立；一般为 $\int f(x,z-x)\,dx$ | $Y=-X$ 时 $Z\equiv 0$，卷积公式给出非退化答案 |
| "独立指数的最大值仍是指数" | 只有**最小值**保持指数族；最大值不再是指数 | $F_{\max}(z)=(1-e^{-\lambda z})^2$ 无法写成 $1-e^{-\mu z}$ |
| "$Y=X^2$ 可直接套单调变换公式" | $g(x)=x^2$ 在 $\mathbb{R}$ 上不单调；必须用分布函数法分段讨论 | 对 $y>0$ 写 $P(\vert X\vert\le\sqrt{y})$ |

---

## 五、通向下一步的衔接

- 本节的"独立 $\Leftrightarrow$ 联合 $=$ 边缘乘积"结论，将在下一节（数学期望）中频繁用来分解二重期望 $E[g(X,Y)]$，并推出独立时 $E(XY)=E(X)E(Y)$ 与 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)$。
- 卷积与极值公式也会直接用于第 15 节"大量独立随机变量之和的极限行为"（中心极限定理 / 极值理论直觉）。
- 若跳过本节，则无法计算 $X+Y$、$\max$、$\min$、$g(X)$ 的分布——整个第 11–14 节的数字特征推导会失去"对何种分布成立"的把握，也无法构造"独立 vs 不独立"的关键反例。
