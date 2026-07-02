# 考点十七·区间估计

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch07 区间估计
> 题量：7题（选择5题 + 填空1题 + 计算1题）

---

### 第1题

:::callout{kind=note label="题目"}
未知参数的最小置信区间的长度随着置信度的增加而（　　）

A. 增加　　B. 减小　　C. 不变　　D. 不能确定
:::

:::callout{kind=insight label="解析"}
置信度 $1 - \alpha$ 增加意味着 $\alpha$ 减小，从而 $z_{\alpha/2}$（或 $t_{\alpha/2}$）增大。置信区间长度为 $2 \times z_{\alpha/2} \times \frac{\sigma}{\sqrt{n}}$，因此长度随置信度增加而增加。

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
置信度↑ → 分位数↑ → 区间长度↑。置信度与精度此消彼长。
:::

---

### 第2题

:::callout{kind=note label="题目"}
未知参数的最小置信区间的长度随着样本容量的增加而（　　）

A. 增加　　B. 减小　　C. 不变　　D. 不能确定
:::

:::callout{kind=insight label="解析"}
置信区间长度正比于 $\frac{1}{\sqrt{n}}$，样本容量 $n$ 增大时 $\frac{1}{\sqrt{n}}$ 减小，因此区间长度减小。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
样本容量↑ → $\frac{1}{\sqrt{n}}$↓ → 区间长度↓。增大样本量可提高估计精度。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $(X_1, X_2, \ldots, X_9)$ 为取自正态总体 $N(\mu, 9)$ 的样本，则 $\mu$ 的置信水平为 95% 的置信区间的长度为（　　）（$u_{0.025} = 1.96, u_{0.05} = 1.64$）

A. 3.28　　B. 3.92　　C. 1.96　　D. 1.64
:::

:::callout{kind=insight label="解析"}
$\sigma^2 = 9$，$\sigma = 3$，$n = 9$，$u_{0.025} = 1.96$

置信区间：$\bar{X} \pm u_{0.025} \cdot \frac{\sigma}{\sqrt{n}} = \bar{X} \pm 1.96 \times \frac{3}{3} = \bar{X} \pm 1.96$

区间长度 $= 2 \times 1.96 = 3.92$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\sigma^2$ 已知时置信区间长度 $= 2 u_{\alpha/2} \frac{\sigma}{\sqrt{n}}$。
:::

---

### 第4题

:::callout{kind=note label="题目"}
正态总体方差未知时，均值的置信水平为 $1 - \alpha$ 的置信区间为

$$\left[\bar{X} - \frac{S}{\sqrt{n}} t_{\alpha/2}(n-1),\ \bar{X} + \frac{S}{\sqrt{n}} t_{\alpha/2}(n-1)\right]$$

给定 $n$ 和样本，则该区间长度（　　）

A. 随 $\alpha$ 增大而增大　　B. 随 $\alpha$ 增大而减小　　C. 与 $\alpha$ 的大小无关　　D. 无法确定与 $\alpha$ 的关系
:::

:::callout{kind=insight label="解析"}
区间长度 $= 2 \cdot \frac{S}{\sqrt{n}} \cdot t_{\alpha/2}(n-1)$。

给定 $n$ 和样本后，$S$ 和 $n$ 固定。$\alpha$ 增大时，$t_{\alpha/2}(n-1)$ 减小（因为 $\alpha/2$ 增大意味着上侧分位数减小），因此区间长度减小。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
$\alpha$↑ → 置信度 $1-\alpha$↓ → $t_{\alpha/2}$↓ → 区间长度↓。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $X_1, X_2, \ldots, X_n$ 为正态总体 $X \sim N(\mu, \sigma^2)$ 的简单随机样本，其中 $\mu, \sigma^2$ 均未知，$\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$，$S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2$。则 $\mu$ 的置信水平为 0.95 的置信区间的置信下限为（　　）

A. $\bar{X} - \frac{S}{\sqrt{n}} t_{0.025}(n-1)$　　B. $\bar{X} + \frac{S}{\sqrt{n}} t_{0.025}(n-1)$

C. $\bar{X} - \frac{S}{\sqrt{n}} t_{0.05}(n-1)$　　D. $\bar{X} + \frac{S}{\sqrt{n}} t_{0.05}(n-1)$
:::

:::callout{kind=insight label="解析"}
$\sigma^2$ 未知时，$\mu$ 的双侧置信区间为：

$$\left[\bar{X} - \frac{S}{\sqrt{n}} t_{\alpha/2}(n-1),\ \bar{X} + \frac{S}{\sqrt{n}} t_{\alpha/2}(n-1)\right]$$

置信水平 0.95 对应 $\alpha = 0.05$，$\alpha/2 = 0.025$。

置信下限 $= \bar{X} - \frac{S}{\sqrt{n}} t_{0.025}(n-1)$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
双侧置信区间下限：$\bar{X} - \frac{S}{\sqrt{n}} t_{\alpha/2}(n-1)$，注意分位数用 $\alpha/2$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
已知一批零件的长度 $X$（单位：cm）服从正态分布 $N(\mu, \sigma^2)$，从中随机地抽取 9 个零件，如果置信度为 0.95 的最短置信区间是 $[0.5, 1.5]$，则该样本的样本均值为______。
:::

:::callout{kind=insight label="解析"}
最短置信区间以样本均值 $\bar{X}$ 为中心，即区间中点 $= \bar{X}$。

$$\bar{X} = \frac{0.5 + 1.5}{2} = 1$$

样本均值为 $1$。
:::

:::callout{kind=tip label="结论速记"}
正态总体最短置信区间以 $\bar{X}$ 为中心，$\bar{X} = \frac{\text{下限} + \text{上限}}{2}$。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设 $Y = \ln X$ 服从正态分布 $N(\mu, 1)$。

(1) 求 $X$ 的数学期望 $EX$；

(2) 总体 $X$ 的一组样本观察值为 0.50, 1.25, 0.80, 2.00，试求 $\mu$ 的置信水平为 0.95 的置信区间。

参考分位点：$u(0.025) = 1.96,\ u(0.05) = 1.645,\ t_{0.025}(3) = 3.1824,\ t_{0.05}(3) = 2.3534$
:::

:::callout{kind=insight label="解析"}
**(1)** $Y = \ln X \sim N(\mu, 1)$，则 $X = e^Y$。

$$EX = E(e^Y) = \int_{-\infty}^{+\infty} e^y \cdot \frac{1}{\sqrt{2\pi}} e^{-\frac{(y-\mu)^2}{2}} dy$$

利用矩母函数：$E(e^{tY}) = e^{\mu t + \frac{t^2}{2}}$（$Y \sim N(\mu, 1)$），令 $t = 1$：

$$EX = e^{\mu + \frac{1}{2}}$$

**(2)** $Y = \ln X$，样本观察值 $x_1 = 0.50, x_2 = 1.25, x_3 = 0.80, x_4 = 2.00$。

对应的 $y_i = \ln x_i$：

$$y_1 = \ln 0.50 \approx -0.693, \quad y_2 = \ln 1.25 \approx 0.223, \quad y_3 = \ln 0.80 \approx -0.223, \quad y_4 = \ln 2.00 \approx 0.693$$

$$\bar{y} = \frac{-0.693 + 0.223 - 0.223 + 0.693}{4} = 0$$

$Y \sim N(\mu, 1)$，$\sigma^2 = 1$ 已知，$n = 4$，使用 $Z$ 检验：

$$\mu \text{ 的置信区间} = \bar{y} \pm u_{0.025} \cdot \frac{\sigma}{\sqrt{n}} = 0 \pm 1.96 \times \frac{1}{2} = 0 \pm 0.98$$

$$\mu \text{ 的 0.95 置信区间为 } [-0.98, 0.98]$$
:::

:::callout{kind=tip label="结论速记"}
$Y = \ln X \sim N(\mu, \sigma^2)$ 时，$EX = e^{\mu + \sigma^2/2}$（对数正态分布期望）。$\sigma^2$ 已知时用 $Z$ 区间估计 $\mu$。
:::

---

> 本考点练习完
