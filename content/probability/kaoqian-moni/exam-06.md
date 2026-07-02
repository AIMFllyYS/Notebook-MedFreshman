# 2023-2024学年第一学期期末考试A卷

> 来源：华科《概率论与数理统计》习题集（第2版）·套卷练习
> 考试类型：期末考试
> 题量：选择题10题 + 填空题4题 + 计算题5题

---

## 一、选择题（每小题3分，共30分）

### 第1题

:::callout{kind=note label="题目"}
设随机事件 $A$、$B$ 满足 $A \subset B$，则（　　）

A. 当 $B$ 发生时，$A$ 可能发生　　B. 当 $A \cup B$ 发生时，$B$ 一定发生　　C. 当 $AB$ 发生时，$AB$ 可能发生　　D. 当 $B$ 发生时，$A$ 一定发生
:::

:::callout{kind=insight label="解析"}
$A \subset B$ 意味着 $A$ 发生 $\Rightarrow$ $B$ 发生，但 $B$ 发生时 $A$ 不一定发生。

- A：$B$ 发生时 $A$ 可能发生（也可能不发生）。正确。
- B：$A \cup B = B$（因为 $A \subset B$），所以 $A \cup B$ 发生时 $B$ 一定发生。正确。
- C：$AB = A$（因为 $A \subset B$），$AB$ 发生时 $AB$ 一定发生（同义反复）。表述模糊。
- D：$B$ 发生时 $A$ 一定发生。错误，$A \subset B$ 不意味着 $B \subset A$。

选 **D**。（题目问"不正确的是"，但选项表述为"则"，最可能选 D 为错误叙述）

实际上题目问的是哪个正确。A 和 B 都正确，但 B 更确定。重新审视：

$A \subset B$：$A \cup B = B$，所以 B 正确（$A \cup B$ 发生即 $B$ 发生）。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$A \subset B \Rightarrow A \cup B = B$，$AB = A$。$B$ 发生不意味着 $A$ 发生。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机事件 $A$、$B$ 满足 $P(AB) > 0$，则一定有：（　　）

A. $P(A) < P(A|B)$　　B. $P(B | AB) > 0$　　C. $P(A|AB) = 1$　　D. $P[AB | (A \cup B)] < 1$
:::

:::callout{kind=insight label="解析"}
- A：不一定，$P(A|B) = \frac{P(AB)}{P(B)}$，可以大于、等于或小于 $P(A)$。
- B：$P(B|AB) = \frac{P(AB \cap B)}{P(AB)} = \frac{P(AB)}{P(AB)} = 1 > 0$。正确，但不是最优。
- C：$P(A|AB) = \frac{P(A \cap AB)}{P(AB)} = \frac{P(AB)}{P(AB)} = 1$。正确。
- D：$P[AB | (A \cup B)] = \frac{P(AB)}{P(A \cup B)}$。$AB \subset A \cup B$，所以 $\leq 1$。但 $P(A \cup B) > P(AB)$（一般情况），所以 $< 1$。但如果 $A = B$，则 $A \cup B = AB = A$，$P = 1$。不一定 $< 1$。

B 和 C 都正确，但 C 更明确。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$AB \subset A$，所以 $P(A|AB) = 1$。条件概率中条件事件已经是子集时概率为1。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $A$、$B$、$C$ 为三个随机事件，已知 $P(\bar{B}) = 0.4$，$P(B|A) = 0.6$，$P(C) = 1$；则下列结论错误的是（　　）

A. 事件 $A$ 与事件 $B$ 相互独立　　B. $P(B|A) = 0.4$　　C. 三事件 $A$、$B$、$C$ 相互独立　　D. 事件 $(A \cup B)$ 与事件 $C$ 不独立
:::

:::callout{kind=insight label="解析"}
$P(B) = 1 - P(\bar{B}) = 0.6$，$P(B|A) = 0.6 = P(B)$，所以 $A$ 与 $B$ 独立。A 正确。

B：$P(B|A) = 0.6 \neq 0.4$。错误。

$P(C) = 1$：$C$ 与任何事件独立。所以 $A$、$B$、$C$ 相互独立（C 正确），$(A \cup B)$ 与 $C$ 独立（D 错误）。

B 和 D 都错误，但题目问"错误的是"。

选 **B**。（$P(B|A) = 0.6 \neq 0.4$，B 明确错误）

但 D 也错误（$(A \cup B)$ 与 $C$ 独立，说"不独立"是错的）。

根据选项设计，B 是最直接错误的。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$P(C) = 1 \Rightarrow C$ 与任何事件独立。$P(B|A) = P(B) \Rightarrow A, B$ 独立。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设随机变量 $X \sim P(1)$，$Y \sim E(1)$，其分布函数分别为 $F_X(x)$，$F_Y(y)$；则（　　）

A. $F_X(x)$，$F_Y(y)$ 都是连续函数　　B. $F_X\left(\frac{3}{2}\right) = 0$　　C. $EX \neq EY$　　D. $F_Y(1) = 1 - e^{-1}$
:::

:::callout{kind=insight label="解析"}
$X \sim P(1)$（泊松分布，离散型），$Y \sim E(1)$（指数分布，连续型）。

- A：$F_X$ 是阶梯函数（离散型），不连续。错。
- B：$F_X(3/2) = P(X \leq 3/2) = P(X \leq 1) = e^{-1}(1 + 1) = 2e^{-1} \neq 0$。错。
- C：$EX = 1$，$EY = 1$，$EX = EY$。错。
- D：$F_Y(1) = 1 - e^{-1}$。正确。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
泊松分布 $P(\lambda)$：$EX = \lambda$，离散型分布函数有跳跃。指数分布 $E(\lambda)$：$EY = 1/\lambda$，$F_Y(y) = 1 - e^{-\lambda y}$。
:::

---

### 第5题

:::callout{kind=note label="题目"}
已知随机变量 $X \sim B(6, p)$ 且 $EX = 4.8$，则下列结论错误的是（　　）

A. $p = 0.8$　　B. $P\{X = 5\} = \max_{1 \leq k \leq 6} P\{X = k\}$　　C. $D(2X) = 1.92$　　D. $D(X + 6) = 0.96$
:::

:::callout{kind=insight label="解析"}
$EX = 6p = 4.8 \Rightarrow p = 0.8$。A 正确。

$DX = 6 \times 0.8 \times 0.2 = 0.96$。

- B：$B(n, p)$ 最可能值 $k = [(n+1)p] = [7 \times 0.8] = [5.6] = 5$。正确。
- C：$D(2X) = 4DX = 4 \times 0.96 = 3.84 \neq 1.92$。错误。
- D：$D(X + 6) = DX = 0.96$。正确。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$D(aX + b) = a^2 DX$。$B(n,p)$ 最可能值 $k = [(n+1)p]$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y)$ 服从区域 $G = \{(x, y) | x + y \leq 1, 0 \leq x \leq 1, 0 \leq y\}$ 上的均匀分布，其联合分布函数为 $F(x, y)$，则下列结论错误的是（　　）

A. $F\left(\frac{1}{2}, 1\right) = \frac{3}{4}$　　B. $X \sim U(0, 1)$　　C. $E(X) = E(Y)$　　D. $P\{X > Y\} = \frac{1}{2}$
:::

:::callout{kind=insight label="解析"}
$G$ 是三角形区域，顶点 $(0,0), (1,0), (0,1)$，面积 $= \frac{1}{2}$。

- A：$F(1/2, 1) = P(X \leq 1/2, Y \leq 1)$。在 $G$ 中 $Y \leq 1$ 恒成立，所以 $= P(X \leq 1/2)$。$f_X(x) = 2(1-x)$，$P(X \leq 1/2) = \int_0^{1/2} 2(1-x)\,dx = 2[x - x^2/2]_0^{1/2} = 2(1/2 - 1/8) = 2 \times 3/8 = 3/4$。正确。
- B：$f_X(x) = 2(1-x)$，不是均匀分布。错误。
- C：由对称性 $E(X) = E(Y) = 1/3$。正确。
- D：$P(X > Y) = 1/2$（由对称性）。正确。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
三角形均匀分布的边缘不是均匀分布。$f_X(x) = \frac{\text{截面长度}}{\text{总面积}}$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设离散型随机变量 $X$ 的概率分布列为：$P\{X = -1\} = \frac{1}{2}$，$P\{X = 1\} = \frac{1}{2}$；随机变量 $Y \sim N(0, 1)$ 且与 $X$ 相互独立；令 $Z = XY$，则下列结论错误的是（　　）

A. 随机变量 $Z$ 既非离散型也非连续型　　B. $D(X + Y) = 2$　　C. $Z \sim N(0, 1)$　　D. $XZ \sim N(0, 1)$
:::

:::callout{kind=insight label="解析"}
$Z = XY$，$X = \pm 1$ 各概率 $\frac{1}{2}$，$Y \sim N(0,1)$ 独立。

$Z | X = 1 \sim N(0,1)$，$Z | X = -1 \sim -N(0,1) = N(0,1)$（对称）。

所以 $Z \sim N(0,1)$，C 正确。

$F_Z(z) = \frac{1}{2}P(Y \leq z) + \frac{1}{2}P(-Y \leq z) = \frac{1}{2}\Phi(z) + \frac{1}{2}\Phi(z) = \Phi(z)$

$Z$ 是连续型（$N(0,1)$），A 错误。

$D(X + Y) = DX + DY = 1 + 1 = 2$（独立），B 正确。

$XZ = X^2 Y = Y$（因为 $X^2 = 1$），$XZ = Y \sim N(0,1)$，D 正确。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
$X = \pm 1$ 等概率且与 $Y \sim N(0,1)$ 独立时，$XY \sim N(0,1)$（随机符号不改变对称分布）。$X^2 = 1$。
:::

---

### 第8题

:::callout{kind=note label="题目"}
设二维随机向量 $(X, Y) \sim N\left(0, 2, 1, 1, \frac{3}{4}\right)$，则下列结论错误的是（　　）

A. $Y \sim N(2, 1)$　　B. $\rho_{XY} = \frac{3}{4}$　　C. $E(XY) = \frac{3}{4}$　　D. $D(X + Y) = \frac{11}{4}$
:::

:::callout{kind=insight label="解析"}
$(X, Y) \sim N(\mu_1, \mu_2, \sigma_1^2, \sigma_2^2, \rho) = N(0, 2, 1, 1, 3/4)$。

- A：$Y \sim N(\mu_2, \sigma_2^2) = N(2, 1)$。正确。
- B：$\rho_{XY} = 3/4$。正确。
- C：$E(XY) = \text{Cov}(X,Y) + EX \cdot EY = \rho \sigma_1 \sigma_2 + 0 \times 2 = \frac{3}{4} \times 1 \times 1 = \frac{3}{4}$。正确。
- D：$D(X + Y) = DX + DY + 2\text{Cov}(X,Y) = 1 + 1 + 2 \times \frac{3}{4} = 2 + \frac{3}{2} = \frac{7}{2} = \frac{14}{4} \neq \frac{11}{4}$。错误。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$D(X + Y) = DX + DY + 2\rho\sigma_1\sigma_2$。$\text{Cov}(X,Y) = \rho\sigma_1\sigma_2$。
:::

---

### 第9题

:::callout{kind=note label="题目"}
$(X_1, X_2, \cdots, X_n)^T$ 是来自总体 $X \sim N(1, 4)$ 的独立同分布样本，$\Phi(x)$ 为标准正态的分布函数，则（　　）

A. $X_1, X_2, \cdots, X_n$ 不相互独立　　B. $X_1, X_2$ 分布不相同　　C. $X_1 - 2X_2 \sim N(-1, 20)$　　D. $P\{X_3 < 3\} = \Phi\left(\frac{1}{2}\right)$
:::

:::callout{kind=insight label="解析"}
- A：独立同分布样本，相互独立。错。
- B：同分布。错。
- C：$X_1 - 2X_2 \sim N(1 - 2, 4 + 4 \times 4) = N(-1, 20)$。正确。
- D：$P(X_3 < 3) = P\left(\frac{X_3 - 1}{2} < 1\right) = \Phi(1) \neq \Phi(1/2)$。错。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
独立正态变量线性组合：$aX_1 + bX_2 \sim N(a\mu_1 + b\mu_2, a^2\sigma_1^2 + b^2\sigma_2^2)$。
:::

---

### 第10题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \cdots, X_n)$ 是来自总体 $X \sim N(0, 4)$ 的独立同分布样本，则（　　）

A. $\frac{X_1^2 + X_2^2}{2} \sim \chi^2(2)$　　B. $\frac{X_1 + X_2}{\sqrt{X_3^2 + X_4^2}} \sim t(2)$　　C. $\frac{X_1^2 + X_2^2}{X_3^2 + X_4^2} \sim F(2, 1)$　　D. $P\left\{\frac{X_1 + X_2}{|X_1 - X_2|} < 0\right\} = \frac{1}{2}$
:::

:::callout{kind=insight label="解析"}
$X_i \sim N(0, 4)$，$X_i/2 \sim N(0,1)$，$X_i^2/4 \sim \chi^2(1)$。

- A：$\frac{X_1^2 + X_2^2}{2} = \frac{X_1^2/4 + X_2^2/4}{2/4} = \frac{\chi^2(2)}{1/2} = 2\chi^2(2) \neq \chi^2(2)$。错。
- B：$X_1 + X_2 \sim N(0, 8)$，$\frac{X_1+X_2}{\sqrt{8}} \sim N(0,1)$。$\frac{X_3^2 + X_4^2}{4} \sim \chi^2(2)$。$\frac{(X_1+X_2)/\sqrt{8}}{\sqrt{(X_3^2+X_4^2)/(4 \times 2)}} = \frac{X_1+X_2}{\sqrt{X_3^2+X_4^2}} \sim t(2)$。正确。
- C：$\frac{X_1^2+X_2^2}{X_3^2+X_4^2} = \frac{(X_1^2+X_2^2)/4}{(X_3^2+X_4^2)/4} = \frac{\chi^2(2)/2}{\chi^2(2)/2} \sim F(2, 2) \neq F(2, 1)$。错。
- D：$X_1 + X_2$ 与 $X_1 - X_2$ 独立正态且对称，$\frac{X_1+X_2}{|X_1-X_2|}$ 对称于0，$P < 0 = \frac{1}{2}$。正确。

B 和 D 都正确。但题目只有一个答案。

选 **B**。（更标准的 $t$ 分布结论）

实际上 D 也正确。重新审视：$\frac{X_1+X_2}{|X_1-X_2|} \sim t(1)$，对称分布 $P < 0 = \frac{1}{2}$。D 正确。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$t$ 分布对称，$P(T < 0) = 1/2$。$\frac{\chi^2(m)/m}{\chi^2(n)/n} \sim F(m,n)$，注意自由度。
:::

---

## 二、填空题（每空3分，共12分）

（注：$\Phi(1) = 0.841, \Phi(2) = 0.977$；其中 $\Phi(x)$ 为标准正态变量的分布函数）

### 第1题

:::callout{kind=note label="题目"}
已知 $P(A) = \frac{1}{2}$，$P(B) = \frac{11}{24}$，$P(A\bar{B} \cup \bar{A}B) = \frac{7}{24}$；则 $P(B|A) =$______。
:::

:::callout{kind=insight label="解析"}
$P(A\bar{B} \cup \bar{A}B) = P(A) + P(B) - 2P(AB) = \frac{7}{24}$

$$\frac{1}{2} + \frac{11}{24} - 2P(AB) = \frac{7}{24}$$

$$\frac{12 + 11}{24} - 2P(AB) = \frac{7}{24}$$

$$\frac{23}{24} - 2P(AB) = \frac{7}{24}$$

$$2P(AB) = \frac{16}{24} = \frac{2}{3}$$

$$P(AB) = \frac{1}{3}$$

$$P(B|A) = \frac{P(AB)}{P(A)} = \frac{1/3}{1/2} = \frac{2}{3}$$
:::

:::callout{kind=tip label="结论速记"}
$P(A\bar{B} \cup \bar{A}B) = P(A) + P(B) - 2P(AB)$（对称差概率）。
:::

---

### 第2题

:::callout{kind=note label="题目"}
设随机变量 $X \sim E(\lambda)$，令 $Y = 1 - e^{-\lambda X}$；$F_Y(y)$ 为随机变量的分布函数，则 $F_Y\left(\frac{1}{2}\right) =$______。
:::

:::callout{kind=insight label="解析"}
$Y = 1 - e^{-\lambda X}$，$X \sim E(\lambda)$，$F_X(x) = 1 - e^{-\lambda x}$。

$F_Y(y) = P(Y \leq y) = P(1 - e^{-\lambda X} \leq y) = P(e^{-\lambda X} \geq 1 - y) = P(-\lambda X \geq \ln(1-y))$

$= P\left(X \leq -\frac{\ln(1-y)}{\lambda}\right) = F_X\left(-\frac{\ln(1-y)}{\lambda}\right) = 1 - e^{-\lambda \cdot \left(-\frac{\ln(1-y)}{\lambda}\right)} = 1 - (1-y) = y$

所以 $Y \sim U(0, 1)$（概率积分变换）。

$F_Y(1/2) = 1/2$
:::

:::callout{kind=tip label="结论速记"}
$F(X) \sim U(0,1)$（概率积分变换）。$1 - e^{-\lambda X} = F_X(X)$ 当 $X \sim E(\lambda)$ 时。
:::

---

### 第3题

:::callout{kind=note label="题目"}
为获得某物理量 $\mu$ 的值，对该物理量做了 $n$ 次重复独立的测量，假定每次测量的值 $X \sim N(\mu, 2)$，现以测量的平均值 $\bar{X}$ 作为该物理量 $\mu$ 的估计值，为使得 $P\{|\bar{X} - \mu| \leq 0.5\} \geq 0.954$ 成立，则至少应该测量的次数为______。
:::

:::callout{kind=insight label="解析"}
$\bar{X} \sim N\left(\mu, \frac{2}{n}\right)$，$\frac{\bar{X} - \mu}{\sqrt{2/n}} \sim N(0, 1)$。

$$P\{|\bar{X} - \mu| \leq 0.5\} = P\left\{\left|\frac{\bar{X} - \mu}{\sqrt{2/n}}\right| \leq \frac{0.5}{\sqrt{2/n}}\right\} = 2\Phi\left(\frac{0.5\sqrt{n}}{\sqrt{2}}\right) - 1 \geq 0.954$$

$$\Phi\left(\frac{0.5\sqrt{n}}{\sqrt{2}}\right) \geq 0.977$$

由 $\Phi(2) = 0.977$：

$$\frac{0.5\sqrt{n}}{\sqrt{2}} \geq 2$$

$$\sqrt{n} \geq \frac{2\sqrt{2}}{0.5} = 4\sqrt{2}$$

$$n \geq 32$$

至少测量 32 次。
:::

:::callout{kind=tip label="结论速记"}
$\bar{X} \sim N(\mu, \sigma^2/n)$，$P(|\bar{X}-\mu| \leq d) = 2\Phi(d\sqrt{n}/\sigma) - 1$。$0.954 \approx 2\Phi(2) - 1$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
设某大学的学生中，每节课中戳手机的次数 $X \sim P(4)$，现从该校随机抽取一个大班，共100名学生，估算他们在一节课中戳手机的总次数超过440次的概率约为______。
:::

:::callout{kind=insight label="解析"}
每人 $X_i \sim P(4)$，$EX_i = 4$，$DX_i = 4$。

$S_{100} = \sum_{i=1}^{100} X_i$，$ES_{100} = 400$，$DS_{100} = 400$。

由中心极限定理：$S_{100} \approx N(400, 400)$，$\sigma = 20$。

$$P(S_{100} > 440) = P\left(\frac{S_{100} - 400}{20} > 2\right) = 1 - \Phi(2) = 1 - 0.977 = 0.023$$
:::

:::callout{kind=tip label="结论速记"}
泊松分布 $P(\lambda)$：$EX = DX = \lambda$。$n$ 个独立泊松之和 $P(n\lambda)$，CLT 标准化后查 $\Phi$。
:::

---

## 三、（12分）

:::callout{kind=note label="题目"}
设有甲、乙、丙三个不透明的箱子，每个箱中分别装有除颜色不同外其它都相同的5个球，其中：甲箱装3黄2黑，乙箱装4红1白，丙箱装2红3白。摸球规则如下：先从甲箱摸出两球，如果从甲箱中摸出两球颜色相同，则从乙箱中摸出一球放入丙箱，再从丙箱摸出两球；如果从甲箱中摸出两球颜色相异，则从丙箱摸出一球放入乙箱，再从乙箱摸出两球。试求：

(1) 最后摸出两球颜色相同的概率？

(2) 已知最后摸出的两球颜色相同，求从甲箱中摸出的两球颜色不同的概率？
:::

:::callout{kind=insight label="解析"}
设 $D_1$ = 甲箱摸出两球同色，$D_2$ = 甲箱摸出两球异色。

$P(D_1) = \frac{C_3^2 + C_2^2}{C_5^2} = \frac{3 + 1}{10} = \frac{4}{10} = \frac{2}{5}$

$P(D_2) = \frac{C_3^1 C_2^1}{C_5^2} = \frac{6}{10} = \frac{3}{5}$

**$D_1$ 发生时**：从乙箱（4红1白）摸一球放入丙箱（2红3白→变为3红4白或2红4白）。

从乙箱摸出红球概率 $4/5$，白球概率 $1/5$。

- 乙箱摸出红球（概率 $4/5$）：丙箱变为3红4白（7球），摸两球同色概率 $= \frac{C_3^2 + C_4^2}{C_7^2} = \frac{3 + 6}{21} = \frac{9}{21} = \frac{3}{7}$
- 乙箱摸出白球（概率 $1/5$）：丙箱变为2红4白（6球），摸两球同色概率 $= \frac{C_2^2 + C_4^2}{C_6^2} = \frac{1 + 6}{15} = \frac{7}{15}$

$P(\text{同色}|D_1) = \frac{4}{5} \times \frac{3}{7} + \frac{1}{5} \times \frac{7}{15} = \frac{12}{35} + \frac{7}{75} = \frac{360 + 49}{525} = \frac{409}{525}$

**$D_2$ 发生时**：从丙箱（2红3白）摸一球放入乙箱（4红1白→变为5红1白或4红2白）。

从丙箱摸出红球概率 $2/5$，白球概率 $3/5$。

- 丙箱摸出红球（概率 $2/5$）：乙箱变为5红1白（6球），摸两球同色概率 $= \frac{C_5^2 + C_1^2}{C_6^2} = \frac{10 + 0}{15} = \frac{10}{15} = \frac{2}{3}$
- 丙箱摸出白球（概率 $3/5$）：乙箱变为4红2白（6球），摸两球同色概率 $= \frac{C_4^2 + C_2^2}{C_6^2} = \frac{6 + 1}{15} = \frac{7}{15}$

$P(\text{同色}|D_2) = \frac{2}{5} \times \frac{2}{3} + \frac{3}{5} \times \frac{7}{15} = \frac{4}{15} + \frac{7}{25} = \frac{20 + 21}{75} = \frac{41}{75}$

**(1)** $P(\text{同色}) = P(D_1) \cdot P(\text{同色}|D_1) + P(D_2) \cdot P(\text{同色}|D_2)$

$= \frac{2}{5} \times \frac{409}{525} + \frac{3}{5} \times \frac{41}{75} = \frac{818}{2625} + \frac{123}{375} = \frac{818}{2625} + \frac{861}{2625} = \frac{1679}{2625}$

**(2)** 由贝叶斯公式：

$$P(D_2|\text{同色}) = \frac{P(\text{同色}|D_2) \cdot P(D_2)}{P(\text{同色})} = \frac{\frac{41}{75} \times \frac{3}{5}}{\frac{1679}{2625}} = \frac{\frac{123}{375}}{\frac{1679}{2625}} = \frac{123 \times 2625}{375 \times 1679} = \frac{123 \times 7}{1679} = \frac{861}{1679}$$
:::

:::callout{kind=tip label="结论速记"}
复杂概率问题：分解为条件分支，全概率公式求总概率，贝叶斯公式求后验。
:::

---

## 四、（10分）

:::callout{kind=note label="题目"}
设二维随机变量 $(X, Y)$ 的联合概率分布密度函数为

$$f(x, y) = \begin{cases} A\cos(X + Y), & 0 \leq x \leq \frac{\pi}{4},\ 0 \leq y \leq \frac{\pi}{4} \\ 0, & \text{其他} \end{cases}$$

(1) 求常数 $A$；(2) 求 $Z = X + Y$ 的概率密度函数。
:::

:::callout{kind=insight label="解析"}
**(1)** $\int_0^{\pi/4} \int_0^{\pi/4} A\cos(x+y)\,dy\,dx = 1$

$$A\int_0^{\pi/4} [\sin(x+y)]_0^{\pi/4}\,dx = A\int_0^{\pi/4} \left[\sin\left(x + \frac{\pi}{4}\right) - \sin x\right] dx$$

$$= A\left[-\cos\left(x + \frac{\pi}{4}\right) + \cos x\right]_0^{\pi/4}$$

$$= A\left[-\cos\frac{\pi}{2} + \cos\frac{\pi}{4} + \cos\frac{\pi}{4} - \cos 0\right]$$

$$= A\left[0 + \frac{\sqrt{2}}{2} + \frac{\sqrt{2}}{2} - 1\right] = A(\sqrt{2} - 1) = 1$$

$$A = \frac{1}{\sqrt{2} - 1} = \sqrt{2} + 1$$

**(2)** $Z = X + Y$，$0 \leq Z \leq \frac{\pi}{2}$。

$f_Z(z) = \int f(x, z-x)\,dx$，需 $0 \leq x \leq \pi/4$，$0 \leq z - x \leq \pi/4$。

即 $\max(0, z - \pi/4) \leq x \leq \min(\pi/4, z)$。

当 $0 \leq z \leq \pi/4$：$x \in [0, z]$

$$f_Z(z) = \int_0^z A\cos(z)\,dx = Az\cos(z) = (\sqrt{2}+1)z\cos z$$

当 $\pi/4 < z \leq \pi/2$：$x \in [z - \pi/4, \pi/4]$

$$f_Z(z) = \int_{z-\pi/4}^{\pi/4} A\cos(z)\,dx = A\left(\frac{\pi}{4} - z + \frac{\pi}{4}\right)\cos z = A\left(\frac{\pi}{2} - z\right)\cos z$$

$$= (\sqrt{2}+1)\left(\frac{\pi}{2} - z\right)\cos z$$
:::

:::callout{kind=tip label="结论速记"}
归一化求常数，卷积公式求和的密度。注意 $\cos(x + (z-x)) = \cos z$ 简化积分。
:::

---

## 五、（12分）

:::callout{kind=note label="题目"}
设二维随机变量 $(X, Y)$ 所服从的联合概率密度函数为

$$f(x, y) = \begin{cases} \frac{1}{\pi} e^{x^2+y^2}, & xy < 0 \\ 0, & \text{其他} \end{cases}$$

求：(1) 边缘概率分布密度函数 $f_X(x)$、$f_Y(y)$；(2) 随机变量 $X$ 和 $Y$ 是否独立？为什么？(3) 二维随机变量 $(X, Y)$ 是否服从二维正态分布？（只回答是或否）
:::

:::callout{kind=insight label="解析"}
$xy < 0$ 意味着 $X$ 和 $Y$ 异号：$x > 0, y < 0$ 或 $x < 0, y > 0$。

**(1)** 当 $x > 0$ 时：$y < 0$

$$f_X(x) = \int_{-\infty}^0 \frac{1}{\pi} e^{x^2+y^2}\,dy = \frac{e^{x^2}}{\pi} \int_{-\infty}^0 e^{y^2}\,dy$$

注意 $e^{y^2}$ 当 $y \to -\infty$ 时趋于 $+\infty$，积分发散。题目可能有误，应为 $e^{-(x^2+y^2)}$。

假设 $f(x,y) = \frac{1}{\pi} e^{-(x^2+y^2)}$，$xy < 0$：

当 $x > 0$：$f_X(x) = \frac{e^{-x^2}}{\pi} \int_{-\infty}^0 e^{-y^2}\,dy = \frac{e^{-x^2}}{\pi} \cdot \frac{\sqrt{\pi}}{2} = \frac{e^{-x^2}}{2\sqrt{\pi}}$

当 $x < 0$：$f_X(x) = \frac{e^{-x^2}}{\pi} \int_0^{+\infty} e^{-y^2}\,dy = \frac{e^{-x^2}}{2\sqrt{\pi}}$

所以 $f_X(x) = \frac{e^{-x^2}}{2\sqrt{\pi}}$，$x \in \mathbb{R}$。同理 $f_Y(y) = \frac{e^{-y^2}}{2\sqrt{\pi}}$。

**(2)** $f_X(x) \cdot f_Y(y) = \frac{e^{-(x^2+y^2)}}{4\pi} \neq \frac{e^{-(x^2+y^2)}}{\pi} \cdot \mathbf{1}_{xy < 0} = f(x,y)$

不独立，因为联合密度在 $xy > 0$ 时为 0，而边缘密度的乘积不为 0。

**(3)** 否。$(X, Y)$ 的联合密度只在 $xy < 0$ 区域非零，不是二维正态分布的形式。
:::

:::callout{kind=tip label="结论速记"}
联合密度支撑集限制在部分区域时，边缘密度乘积一般不等于联合密度 → 不独立。二维正态分布的支撑集为全平面。
:::

---

## 六、(12分)

:::callout{kind=note label="题目"}
设将一枚均匀硬币重复独立投掷，直到出现正面为止，设 $X$ 表示总的投掷次数，令：

$$Y = \begin{cases} 1, & \text{第一次投掷获得正面} \\ 0, & \text{第一次投掷获得反面} \end{cases}$$

试求：(1) $X$ 的概率分布列；(2) 相关系数 $\rho_{XY}$
:::

:::callout{kind=insight label="解析"}
**(1)** $X$ 为首次出现正面的投掷次数，$X \sim \text{Geo}(1/2)$。

$$P(X = k) = \left(\frac{1}{2}\right)^k, \quad k = 1, 2, 3, \ldots$$

**(2)** $EX = \frac{1}{1/2} = 2$，$DX = \frac{1/2}{(1/2)^2} = 2$。

$EY = P(\text{第一次正面}) = \frac{1}{2}$，$DY = \frac{1}{2} \times \frac{1}{2} = \frac{1}{4}$。

$E(XY)$：

$Y = 1$ 时（第一次正面，概率 $1/2$）：$X = 1$，$XY = 1$。

$Y = 0$ 时（第一次反面，概率 $1/2$）：$X \geq 2$，$XY = 0$。

$E(XY) = \frac{1}{2} \times 1 + \frac{1}{2} \times 0 = \frac{1}{2}$

$\text{Cov}(X, Y) = E(XY) - EX \cdot EY = \frac{1}{2} - 2 \times \frac{1}{2} = -\frac{1}{2}$

$$\rho_{XY} = \frac{-1/2}{\sqrt{2 \times 1/4}} = \frac{-1/2}{\sqrt{1/2}} = \frac{-1/2}{1/\sqrt{2}} = -\frac{\sqrt{2}}{2} = -\frac{1}{\sqrt{2}}$$
:::

:::callout{kind=tip label="结论速记"}
几何分布 $Geo(p)$：$EX = 1/p$，$DX = (1-p)/p^2$。$Y = 1$ 时 $X = 1$，$Y = 0$ 时 $X \geq 2$，利用这个关系简化 $E(XY)$。
:::

---

## 七、（12分）

:::callout{kind=note label="题目"}
设总体 $X \sim B(m, p)$，其中 $m$ 已知，但 $p$ 未知；$(X_1, X_2, \cdots, X_n)^T$ 是来自总体 $X$ 的独立同分布样本，试求：

(1) 总体参数 $p$ 的极大似然估计量 $\hat{p}_{\text{MLE}}$；

(2) $\hat{p}_{\text{MLE}}$ 是否为总体参数 $p$ 的无偏估计量？并给出理由。
:::

:::callout{kind=insight label="解析"}
**(1)** $X_i \sim B(m, p)$，$P(X_i = k) = C_m^k p^k (1-p)^{m-k}$。

$$L(p) = \prod_{i=1}^n C_m^{X_i} p^{X_i} (1-p)^{m - X_i} = \left[\prod C_m^{X_i}\right] p^{\sum X_i} (1-p)^{mn - \sum X_i}$$

$$\ln L = \text{const} + \left(\sum X_i\right) \ln p + \left(mn - \sum X_i\right) \ln(1-p)$$

对 $p$ 求导：$\frac{\sum X_i}{p} - \frac{mn - \sum X_i}{1-p} = 0$

$$\hat{p}_{\text{MLE}} = \frac{\sum_{i=1}^n X_i}{mn} = \frac{\bar{X}}{m}$$

**(2)** $E(\hat{p}_{\text{MLE}}) = \frac{E\bar{X}}{m} = \frac{mp}{m} = p$

$\hat{p}_{\text{MLE}}$ 是 $p$ 的无偏估计量。
:::

:::callout{kind=tip label="结论速记"}
$B(m, p)$ 的 MLE：$\hat{p} = \bar{X}/m$。$E\bar{X} = mp$，所以 $E(\bar{X}/m) = p$，无偏。
:::

---

> 本试卷练习完
