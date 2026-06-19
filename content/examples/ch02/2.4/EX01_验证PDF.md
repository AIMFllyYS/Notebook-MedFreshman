:::example{label=验证PDF}
设随机变量 $X$ 的概率密度函数为

$$f(x) = A e^{-|x|}, \quad -\infty < x < +\infty$$

**(1)** 求常数 $A$ 的值。

**(2)** 求 $X$ 的累积分布函数 $F(x)$。

**(3)** 计算概率 $P(-1 < X < 2)$。
:::

:::insight{label=分析}
本题是一道标准的"验证并利用PDF"的综合题，考查三个核心技能：
- **归一化求参数**：利用 $\int_{-\infty}^{+\infty} f(x)dx = 1$ 确定未知常数 $A$；
- **分段积分建立CDF**：由于 $|x|$ 在 $x=0$ 处绝对值改变分支，需对 $x<0$ 和 $x \geq 0$ 分段处理；
- **利用CDF计算区间概率**：$P(-1 < X < 2) = F(2) - F(-1)$，避免重复积分。

**解题前检验**：$f(x) = Ae^{-|x|}$，由于 $e^{-|x|} > 0$ 对所有 $x$ 成立，因此只要 $A > 0$ 就满足非负性条件，合理。
:::

:::derivation{label=解答}
### 第(1)步：求常数 $A$

利用归一化条件 $\int_{-\infty}^{+\infty} f(x)dx = 1$：

$$\int_{-\infty}^{+\infty} Ae^{-|x|}dx = 1$$

由于 $e^{-|x|}$ 关于原点对称（偶函数），可以利用对称性：

$$A \int_{-\infty}^{+\infty} e^{-|x|}dx = 2A \int_0^{+\infty} e^{-x}dx$$

计算积分：
$$\int_0^{+\infty} e^{-x}dx = \left[-e^{-x}\right]_0^{+\infty} = 0 - (-1) = 1$$

因此：
$$2A \cdot 1 = 1 \implies \boxed{A = \frac{1}{2}}$$

### 第(2)步：求CDF $F(x)$

定义 $F(x) = \int_{-\infty}^{x} f(t)dt$，需对 $x < 0$ 和 $x \geq 0$ 分两段讨论。

**当 $x < 0$ 时**：积分区间 $(-\infty, x]$ 完全在负半轴上，$|t| = -t$：

$$F(x) = \int_{-\infty}^{x} \frac{1}{2}e^{-|t|}dt = \int_{-\infty}^{x} \frac{1}{2}e^{t}dt = \frac{1}{2}\left[e^t\right]_{-\infty}^{x} = \frac{1}{2}e^x$$

**当 $x \geq 0$ 时**：积分区间跨越 $x = 0$，需分段：

$$F(x) = \int_{-\infty}^{0} \frac{1}{2}e^{t}dt + \int_0^{x} \frac{1}{2}e^{-t}dt$$

$$= \frac{1}{2}\left[e^t\right]_{-\infty}^{0} + \frac{1}{2}\left[-e^{-t}\right]_0^{x}$$

$$= \frac{1}{2}(1 - 0) + \frac{1}{2}(1 - e^{-x}) = \frac{1}{2} + \frac{1}{2} - \frac{1}{2}e^{-x} = 1 - \frac{1}{2}e^{-x}$$

因此，$X$ 的累积分布函数为：

$$\boxed{F(x) = \begin{cases} \dfrac{1}{2}e^{x}, & x < 0 \\[6pt] 1 - \dfrac{1}{2}e^{-x}, & x \geq 0 \end{cases}}$$

**验证连续性**：在 $x = 0$ 处，左极限 $F(0^-) = \frac{1}{2}e^0 = \frac{1}{2}$，右侧 $F(0) = 1 - \frac{1}{2}e^0 = \frac{1}{2}$，连续 ✓。

### 第(3)步：计算 $P(-1 < X < 2)$

利用CDF：

$$P(-1 < X < 2) = F(2) - F(-1)$$

代入分段公式：
$$F(2) = 1 - \frac{1}{2}e^{-2} \quad (x = 2 \geq 0)$$

$$F(-1) = \frac{1}{2}e^{-1} \quad (x = -1 < 0)$$

因此：

$$P(-1 < X < 2) = \left(1 - \frac{1}{2e^2}\right) - \frac{1}{2e}$$

$$= 1 - \frac{1}{2e^2} - \frac{1}{2e}$$

$$\approx 1 - \frac{1}{2 \times 7.389} - \frac{1}{2 \times 2.718}$$

$$\approx 1 - 0.0677 - 0.1839 \approx \boxed{0.748}$$
:::

:::theorem{label=关键公式}
**归一化条件（求常数 $A$）**：
$$\int_{-\infty}^{+\infty} f(x)\,dx = 1$$

**利用偶函数对称性**：
$$\int_{-\infty}^{+\infty} e^{-|x|}dx = 2\int_0^{+\infty} e^{-x}dx = 2$$

**CDF分段结果**：
$$F(x) = \begin{cases} \frac{1}{2}e^x, & x < 0 \\ 1 - \frac{1}{2}e^{-x}, & x \geq 0 \end{cases}$$

**区间概率**：
$$P(-1 < X < 2) = F(2) - F(-1) = 1 - \frac{1}{2e^2} - \frac{1}{2e} \approx 0.748$$
:::

:::pitfall{label=易错点1}
**积分未分段处理绝对值**

$\int_{-\infty}^{+\infty} e^{-|x|}dx$ 必须在 $x = 0$ 处分段，将 $|x|$ 替换为 $x$（$x \geq 0$时）或 $-x$（$x < 0$时）。若不分段，直接写 $\int_{-\infty}^{+\infty} e^{-x}dx$，积分结果为发散，是严重错误。
:::

:::pitfall{label=易错点2}
**建立CDF时 $x \geq 0$ 段的积分下限**

$x \geq 0$ 时，$F(x) = \int_{-\infty}^{x} f(t)dt$ 需要从 $-\infty$ 到 $x$ 积分，其中包含 $(-\infty, 0)$ 段（贡献 $1/2$）和 $[0, x]$ 段。直接只对 $[0, x]$ 积分（漏掉负半段的面积）是最常见错误。
:::

:::pitfall{label=易错点3}
**CDF连续性验证被忽略**

建立分段CDF后应在拼接点 $x = 0$ 处验证左右极限相等（即连续性）。连续型随机变量的CDF必须处处连续，这是检验分段积分是否正确的重要手段。
:::
