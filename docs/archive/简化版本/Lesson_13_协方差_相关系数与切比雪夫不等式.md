# 第 13 节：协方差、相关系数与切比雪夫不等式

> 本节前置：第 11–12 节（期望、方差、独立时 $E(XY)=E(X)E(Y)$、LOTUS）
> 本节通向：第 14 节（相关系数性质、独立 vs 不相关）、第 15 节（大数定律的证明——切比雪夫是关键工具）
> 关键风格：公理化 / 反例优先 / 性质反用

---

## 一、本节知识要点总览（知识点清单表格）

| 编号 | 知识点 | 一句话说明 |
|------|--------|------------|
| KP1 | 协方差 $\text{Cov}(X,Y)=E[(X-EX)(Y-EY)]$，实用公式 $\text{Cov}=E(XY)-E(X)E(Y)$ | 对称双线性；独立 $\Rightarrow\text{Cov}=0$；一般 $\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)+2\text{Cov}(X,Y)$ |
| KP2 | 相关系数 $\rho=\text{Cov}(X,Y)/(\sigma_X\sigma_Y)$ | 无量纲；$|\rho|\le 1$；$\rho=\pm 1\Leftrightarrow Y=aX+b$ a.s.；在线性变换下保号不变 |
| KP3 | 切比雪夫不等式 $P(|X-\mu|\ge\varepsilon)\le\sigma^2/\varepsilon^2$ | 对任意分布成立的保守尾部估计；等价 $P(|X-\mu|\ge k\sigma)\le 1/k^2$ |

---

## 二、知识点详解

### KP1：协方差

- **公理化定义 / 正式定义**：
  设 $E(X)=\mu_X,\ E(Y)=\mu_Y$。定义
  $$\text{Cov}(X,Y)=E[(X-\mu_X)(Y-\mu_Y)].$$
  展开（LOTUS）得到最实用的公式：
  $$\text{Cov}(X,Y)=E(XY)-E(X)\,E(Y).$$

- **关键性质**：
  1. **对称性**：$\text{Cov}(X,Y)=\text{Cov}(Y,X)$。
  2. **自身协方差**：$\text{Cov}(X,X)=\text{Var}(X)$。
  3. **双线性性**：对常数 $a,b,c,d$，
     $$\text{Cov}(aX+b,\ cY+d)=ac\cdot\text{Cov}(X,Y);$$
     $$\text{Cov}(X_1+X_2,\ Y)=\text{Cov}(X_1,Y)+\text{Cov}(X_2,Y).$$
  4. **方差加法一般公式**：
     $$\text{Var}(X+Y)=\text{Var}(X)+\text{Var}(Y)+2\text{Cov}(X,Y).$$
  5. 独立 $\Rightarrow \text{Cov}(X,Y)=0$（因 $E(XY)=E(X)E(Y)$）。

- **反例 / 易混淆澄清**：
  - $\text{Cov}(X,Y)=0$ 叫**不相关**，不代表独立。反例在下一节集中出现（$X\sim U[-1,1],\ Y=X^2$）。
  - 注意双线性性的**平方**：$\text{Cov}(aX+b,cY+d)=ac\,\text{Cov}(X,Y)$，里面是 $ac$（不是 $|ac|$，不是 $a^2c^2$）。
  - 学生易漏乘：$\text{Var}(X-Y)=\text{Var}(X)+\text{Var}(Y)-2\text{Cov}(X,Y)$（对一般情形）。独立时当然也是 $\text{Var}(X-Y)=\text{Var}(X)+\text{Var}(Y)$（因为 $\text{Cov}=0$，且 $\text{Var}(-Y)=\text{Var}(Y)$）。

- **术语对照**：协方差 Covariance / 双线性 Bilinear / 不相关 Uncorrelated / 交叉项 Cross term。

> **案例 C1（单位三角区域均匀——计算 $\text{Cov}$）**
> 【题目】$(X,Y)$ 在 $D=\{x\ge 0,\ y\ge 0,\ x+y\le 1\}$ 上均匀。求 $\text{Cov}(X,Y)$。
> 【分析】面积 $=1/2$，所以 $f=2$。先求 $E(X),E(Y),E(XY)$。由对称性 $E(X)=E(Y)$。
> 【求解步骤】
> ① $E(X)=\iint_D x\cdot 2\,dxdy=2\int_{0}^{1}x\int_{0}^{1-x}dy\,dx=2\int_{0}^{1}x(1-x)\,dx=2\left(\frac12-\frac13\right)=\frac13$。
> ② $E(XY)=2\int_{0}^{1}\int_{0}^{1-x}xy\,dydx=2\int_{0}^{1}x\cdot\frac{(1-x)^2}{2}\,dx=\int_{0}^{1}x(1-2x+x^2)\,dx=\int_{0}^{1}(x-2x^2+x^3)\,dx=\frac12-\frac23+\frac14=\frac{1}{12}$。
> ③ $\text{Cov}(X,Y)=E(XY)-E(X)E(Y)=\frac{1}{12}-\frac13\cdot\frac13=\frac{1}{12}-\frac{1}{9}=-\frac{1}{36}$。
> 【答案】$\text{Cov}(X,Y)=-1/36$。
> 【点评】$X$ 大时 $Y$ 被迫小（因 $x+y\le 1$）——负相关，直观吻合符号。

> **案例 C2（双线性性应用：$\text{Var}(3X-2Y+5)$）**
> 【题目】设 $\text{Var}(X)=4,\ \text{Var}(Y)=9,\ \text{Cov}(X,Y)=2$。求 $\text{Var}(3X-2Y+5)$。
> 【分析】用双线性性展开：$\text{Var}(aX+bY+c)=a^2\text{Var}(X)+b^2\text{Var}(Y)+2ab\,\text{Cov}(X,Y)$。
> 【求解步骤】
> ① $\text{Var}(3X-2Y+5)=9\text{Var}(X)+4\text{Var}(Y)+2(3)(-2)\text{Cov}(X,Y)$
> ② $=9\cdot 4+4\cdot 9-12\cdot 2=36+36-24=48$。
> 【答案】$\text{Var}=48$。
> 【点评】常数 5 不影响方差；交叉项系数 $2ab$ 的符号很关键。

> **案例 C3（独立时 $\text{Cov}=0$ 的验证）**
> 【题目】$X,Y$ 独立 $N(0,1)$，直接验证 $\text{Cov}(X,Y)=0$。
> 【分析】$\text{Cov}(X,Y)=E(XY)-E(X)E(Y)$。独立 $\Rightarrow E(XY)=E(X)E(Y)$。
> 【求解步骤】
> ① $E(X)=0,\ E(Y)=0$。
> ② $E(XY)=E(X)E(Y)=0$（独立）。
> ③ $\text{Cov}=0-0=0$。
> 【答案】$\text{Cov}(X,Y)=0$。
> 【点评】对二维正态，这等价于独立（见第 14 节 KP3）。

### KP2：相关系数

- **公理化定义 / 正式定义**：
  设 $\sigma_X=\sqrt{\text{Var}(X)}>0,\ \sigma_Y=\sqrt{\text{Var}(Y)}>0$。定义
  $$\rho=\rho_{XY}=\frac{\text{Cov}(X,Y)}{\sigma_X\,\sigma_Y}.$$
  $\rho$ 也叫 Pearson 相关系数。

- **关键性质**：
  1. **无量纲**：不受尺度影响。
  2. **取值范围**：$|\rho|\le 1$（由柯西–施瓦茨或 $\text{Var}(tX-Y)\ge 0$ 对所有 $t$ 推出，见第 14 节 KP1）。
  3. **完美线性关系**：$\rho=1\Leftrightarrow Y=aX+b$ a.s.（且 $a>0$）；$\rho=-1\Leftrightarrow Y=aX+b$ a.s.（且 $a<0$）。
  4. **独立 $\Rightarrow \rho=0$**，反推不成立（见下一节反例）。
  5. **在线性变换下保号不变**：
     $$\rho_{aX+b,\ cY+d}=(\text{sgn}(ac))\cdot\rho_{XY}.$$
     若 $a,c$ 同号，$\rho$ 完全不变；若异号，$\rho$ 反号。

- **反例 / 易混淆澄清**：
  $\rho$ 只衡量**线性**关系。$Y=X^2$ 与 $X$ 有完美的二次关系，但若 $X$ 对称（如 $X\sim U[-1,1]$），则 $\rho=0$——这并不意味着"没有关系"，只是**线性关系为零**。$\rho$ 无法识别非线性依赖。

- **术语对照**：相关系数 Correlation coefficient / 皮尔逊相关 Pearson correlation / 线性关系 Linear relationship / 保号不变 Sign-preserving。

> **案例 C4（承接 C1——单位三角区域均匀的 $\rho$）**
> 【题目】在 C1 的基础上，求 $\rho_{XY}$。
> 【分析】需要 $\text{Var}(X)$ 与 $\text{Var}(Y)$。先算 $E(X^2)$。
> 【求解步骤】
> ① $E(X^2)=\iint_D x^2\cdot 2\,dxdy=2\int_{0}^{1}x^2(1-x)\,dx=2(\frac13-\frac14)=\frac16$。
> ② $\text{Var}(X)=E(X^2)-(E(X))^2=\frac16-\frac19=\frac{1}{18}$。同理 $\text{Var}(Y)=\frac{1}{18}$。
> ③ $\rho=\frac{-1/36}{\sqrt{(1/18)(1/18)}}=\frac{-1/36}{1/18}=-\frac12$。
> 【答案】$\rho=-\frac12$。
> 【点评】中度负相关——这正是"$x+y\le 1$"约束带来的几何负相关。

> **案例 C5（独立骰子：$\rho=0$）**
> 【题目】两独立公平骰子点数 $X,Y$。求 $\rho_{XY}$。
> 【分析】独立 $\Rightarrow \text{Cov}=0\Rightarrow \rho=0$。
> 【求解步骤】
> ① $E(X)=E(Y)=7/2$，$\text{Var}(X)=\text{Var}(Y)=35/12$。
> ② $E(XY)=E(X)E(Y)=49/4$。
> ③ $\text{Cov}=0$，$\rho=0$。
> 【答案】$\rho=0$。
> 【点评】独立 $\Rightarrow \rho=0$ 永远成立；但对二元离散联合分布，务必"逐格核对联合 $=$ 边缘乘积"才能判定独立。

> **案例 C6（线性变换下的不变性）**
> 【题目】令 $U=aX+b,\ V=cY+d$（$a,c>0$）。证明 $\rho_{UV}=\rho_{XY}$。
> 【分析】用双线性性。
> 【求解步骤】
> ① $\text{Cov}(U,V)=ac\,\text{Cov}(X,Y)$。
> ② $\sigma_U=|a|\sigma_X=a\sigma_X$；$\sigma_V=c\sigma_Y$。
> ③ $\rho_{UV}=ac\,\text{Cov}(X,Y)/(a\sigma_X\cdot c\sigma_Y)=\text{Cov}/(\sigma_X\sigma_Y)=\rho_{XY}$。
> 【答案】$\rho_{UV}=\rho_{XY}$（若 $ac>0$）。
> 【点评】若 $a>0,c<0$，则 $\rho_{UV}=-\rho_{XY}$，符号反转。

### KP3：切比雪夫不等式

- **公理化定义 / 正式定义**：
  设 $E(X)=\mu,\ \text{Var}(X)=\sigma^2<\infty$。则对任意 $\varepsilon>0$，
  $$P(|X-\mu|\ge\varepsilon)\le\frac{\sigma^2}{\varepsilon^2}.$$
  等价形式：对任意 $k>0$，
  $$P(|X-\mu|\ge k\sigma)\le\frac{1}{k^2}.$$

- **证明思路**（马尔可夫不等式的推广）：
  马尔可夫不等式：对非负随机变量 $Y$ 与 $\varepsilon>0$，$P(Y\ge\varepsilon)\le E(Y)/\varepsilon$。
  令 $Y=(X-\mu)^2$，则
  $$P(|X-\mu|\ge\varepsilon)=P((X-\mu)^2\ge\varepsilon^2)\le\frac{E[(X-\mu)^2]}{\varepsilon^2}=\frac{\sigma^2}{\varepsilon^2}.$$

- **关键性质与直觉**：
  1. **对任意分布都成立**（仅需期望与方差有限）。
  2. **保守的上界**——通常远大于真实尾部概率（尤其对正态情形）。
  3. 取 $k=2$：切比雪夫给出 $P(|X-\mu|\ge 2\sigma)\le\frac14=25\%$；而对正态，真实尾部概率约为 $4.55\%$——切比雪夫松了很多倍，但它**不需要正态假设**。
  4. 切比雪夫是**大数定律**证明的核心工具：
     $$P(|\bar{X}_n-\mu|\ge\varepsilon)\le\frac{\text{Var}(\bar{X}_n)}{\varepsilon^2}=\frac{\sigma^2}{n\varepsilon^2}\xrightarrow{n\to\infty}0.$$

- **反例 / 易混淆澄清**：
  - 切比雪夫给出的是**上界**，不要把它当成近似公式。
  - 如果方差无穷（如柯西），切比雪夫**不适用**（实际上柯西也没有有限的 $\mu$ 与 $\sigma$）。
  - 切比雪夫**不能**用于"估计接近中心的概率"——它只对远离均值的尾部给出上界。

- **术语对照**：切比雪夫不等式 Chebyshev's inequality / 马尔可夫不等式 Markov's inequality / 尾部上界 Tail bound / 大数定律 Law of Large Numbers。

> **案例 C7（任意分布的尾部估计）**
> 【题目】设一个群体的平均身高 $\mu=170$ cm，标准差 $\sigma=10$ cm。对任意分布，估计随机抽取一人身高与均值差超过 30 cm 的概率上界。
> 【分析】切比雪夫：$P(|X-170|\ge 30)\le\sigma^2/\varepsilon^2$。
> 【求解步骤】
> ① $P(|X-170|\ge 30)\le 10^2/30^2=1/9\approx 0.111$。
> 【答案】概率不超过 $1/9$（约 11.1%）。
> 【点评】若为正态，真实值约为 $P(|Z|\ge 3)=0.27\%$——切比雪夫给出的上界是非常松的，但它对任何分布都成立。

> **案例 C8（切比雪夫 vs 正态 2σ 的差异对比）**
> 【题目】对比切比雪夫与正态在 2σ 的尾部概率。
> 【分析】$k=2$ 时切比雪夫给出 $1/4=25\%$。真实正态双侧 $2\sigma$ 尾部约为 $4.55\%$。
> 【求解步骤】
> ① 切比雪夫上界：$1/2^2=1/4=25\%$。
> ② 标准正态双侧：$2(1-\Phi(2))\approx 2\times(1-0.97725)=0.0455=4.55\%$。
> 【答案】切比雪夫上界 25%，正态真实 4.55%。
> 【点评】切比雪夫的"松"是为了换取"对任意分布成立"的普适性——这是概率理论中典型的权衡。

> **案例 C9（切比雪夫 $\Rightarrow$ 伯努利大数定律）**
> 【题目】设 $S_n\sim B(n,p)$（$n$ 次独立伯努利成功数）。证明：对任意 $\varepsilon>0$，$P(|\frac{S_n}{n}-p|\ge\varepsilon)\to 0$（$n\to\infty$）。
> 【分析】令 $\bar{X}_n=S_n/n$。$E(\bar{X}_n)=p$，$\text{Var}(\bar{X}_n)=p(1-p)/n$。
> 【求解步骤】
> ① 切比雪夫：$P(|\bar{X}_n-p|\ge\varepsilon)\le\frac{p(1-p)}{n\varepsilon^2}$。
> ② 固定 $\varepsilon>0$，令 $n\to\infty$，右边 $\to 0$。
> 【答案】故 $\frac{S_n}{n}\xrightarrow{P}p$（频率依概率收敛于概率）——这就是伯努利大数定律。
> 【点评】切比雪夫的最大理论价值在于证明"均值收敛于期望"——这是整个统计学频率主义的基石。

---

## 三、本节例题汇总

- C1：单位三角区域均匀分布——计算 $\text{Cov}(X,Y)=-1/36$。
- C2：双线性性展开 $\text{Var}(3X-2Y+5)$（数值例）。
- C3：独立 $N(0,1)$ 验证 $\text{Cov}=0$。
- C4：单位三角区域均匀——计算 $\rho=-1/2$。
- C5：两独立骰子 $\rho=0$。
- C6：线性变换下相关系数保号不变。
- C7：切比雪夫尾部估计（身高例）。
- C8：切比雪夫 vs 正态 2σ 的数值对比。
- C9：切比雪夫 $\Rightarrow$ 伯努利大数定律。

---

## 四、反例与反命题澄清（小结）

| 常见误解 | 正确说法 | 备注 |
|----------|----------|------|
| "$\rho=0\Rightarrow X,Y$ 独立" | 独立 $\Rightarrow \rho=0$；反推不成立 | 标准反例：$X\sim U[-1,1],\ Y=X^2$（第 14 节正式讲解） |
| "双线性性里常数也要保留" | $\text{Cov}(aX+b,cY+d)=ac\,\text{Cov}(X,Y)$——常数项消失 | 常数没有方差/协方差波动 |
| "切比雪夫给出近似尾部概率" | 切比雪夫只给出**上界**；通常非常保守 | 正态 2σ 真实约 4.55%，切比雪夫上界 25% |
| "切比雪夫对任何分布都适用" | 仅在**期望与方差有限**时适用 | 柯西分布不适用（没有有限方差） |
| "$\rho=1$ 意味着 $X$ 与 $Y$ 完全相同" | $\rho=1$ 意味着 $Y=aX+b$ a.s.——允许平移缩放，不必相同 | 比如 $Y=2X+1$ 与 $X$ 的 $\rho=1$ |
| "$\text{Var}(X-Y)=\text{Var}(X)-\text{Var}(Y)$" | 对一般情形：$\text{Var}(X-Y)=\text{Var}(X)+\text{Var}(Y)-2\text{Cov}(X,Y)$；独立时 $=\text{Var}(X)+\text{Var}(Y)$ | 不要漏掉"$-$"号对交叉项的负号贡献 |

---

## 五、通向下一步的衔接

- 本节关于 $\rho$ 的性质（$|\rho|\le 1$，$\rho=\pm 1$ 对应几乎处处线性关系）将在第 14 节 KP1 给出正式证明（利用 $\text{Var}(tX-Y)\ge 0$ 对所有 $t$ 成立）。
- "$\rho=0$ 不 $\Rightarrow$ 独立"的标准反例（$X\sim U[-1,1],\ Y=X^2$）也会在第 14 节 KP2 系统讲解，并推广到二维正态的特殊性（KP3）。
- 切比雪夫不等式直接用于第 15 节"大数定律"的证明，是连接"均值的方差收敛"与"概率收敛"的关键桥梁。
- 若跳过本节，则无法定义相关系数，也无法证明大数定律——整个数理统计的理论基础将缺失一块关键拼图。
