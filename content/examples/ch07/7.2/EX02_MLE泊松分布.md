:::example{label=题目描述}

设总体 $X$ 服从泊松分布 $P(\lambda)$，其中参数 $\lambda > 0$ 未知。$(X_1, X_2, \ldots, X_n)$ 为来自该总体的简单随机样本，观测值为 $(x_1, x_2, \ldots, x_n)$，试用**最大似然估计法**求 $\lambda$ 的估计量。

:::

:::insight{label=分析}

泊松分布是离散型分布，似然函数用概率质量函数（而非密度函数）的乘积构造。

关键步骤：
1. 写出泊松分布的概率质量函数，构造似然函数（概率的乘积）。
2. 取对数简化，得到对数似然函数。
3. 对 $\lambda$ 求导并令导数为零。
4. 解方程得到MLE，验证其为最大值点。

:::

:::derivation{label=解答}

**第一步：构造似然函数**

泊松分布 $P(\lambda)$ 的概率质量函数为：

$$
P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad k = 0, 1, 2, \ldots
$$

观测到样本值 $x_1, x_2, \ldots, x_n$ 的联合概率（即似然函数）：

$$
L(\lambda) = \prod_{i=1}^n P(X=x_i;\lambda) = \prod_{i=1}^n \frac{\lambda^{x_i} e^{-\lambda}}{x_i!}
$$

$$
L(\lambda) = \frac{\lambda^{\sum_{i=1}^n x_i} \cdot e^{-n\lambda}}{\prod_{i=1}^n x_i!}
$$

**第二步：取对数似然函数**

$$
\ell(\lambda) = \ln L(\lambda) = \left(\sum_{i=1}^n x_i\right)\ln\lambda - n\lambda - \sum_{i=1}^n \ln(x_i!)
$$

注意：最后一项 $\sum \ln(x_i!)$ 与参数 $\lambda$ 无关，是常数，不影响最大值的位置。

**第三步：求导并令导数为零**

$$
\frac{d\ell}{d\lambda} = \frac{\sum_{i=1}^n x_i}{\lambda} - n = 0
$$

$$
\frac{\sum_{i=1}^n x_i}{\lambda} = n
$$

$$
\boxed{\hat{\lambda} = \frac{1}{n}\sum_{i=1}^n x_i = \bar{x}}
$$

因此，$\lambda$ 的最大似然估计量为 $\hat{\lambda} = \bar{X}$（样本均值）。

**第四步：验证是最大值点**

$$
\frac{d^2\ell}{d\lambda^2} = -\frac{\sum_{i=1}^n x_i}{\lambda^2} < 0
$$

（在 $\lambda > 0$、$\sum x_i \geq 0$ 时，二阶导数为负），因此 $\hat{\lambda} = \bar{x}$ 确实是最大值点。

**讨论估计量的性质**：

- **无偏性**：$E[\hat{\lambda}] = E[\bar{X}] = E[X] = \lambda$，故 $\hat{\lambda} = \bar{X}$ 是 $\lambda$ 的无偏估计量。
- **相合性**：由大数定律，$\bar{X} \xrightarrow{P} E[X] = \lambda$，故 $\hat{\lambda}$ 是相合估计量。
- **注意**：泊松分布的MLE与矩估计法给出**相同的结果** $\hat{\lambda} = \bar{X}$，这是泊松分布属于指数族的结果。

**MLE不变性的应用**：

例如，泊松分布中事件发生概率 $P(X=0) = e^{-\lambda}$ 的MLE为 $e^{-\hat{\lambda}} = e^{-\bar{X}}$。

:::

:::theorem{label=关键公式}

泊松分布概率质量函数：

$$
P(X=k;\lambda) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad k=0,1,2,\ldots
$$

对数似然函数：

$$
\ell(\lambda) = \left(\sum_{i=1}^n X_i\right)\ln\lambda - n\lambda - \sum_{i=1}^n \ln(X_i!)
$$

MLE 结果：

$$
\hat{\lambda} = \bar{X} = \frac{1}{n}\sum_{i=1}^n X_i
$$

MLE 的期望和方差：

$$
E[\hat{\lambda}] = \lambda, \quad D[\hat{\lambda}] = D[\bar{X}] = \frac{D[X]}{n} = \frac{\lambda}{n}
$$

（泊松分布满足 $E[X] = D[X] = \lambda$）

:::

:::pitfall{label=易错点1}

**忘记处理 $k!$ 的阶乘项**：$\prod_{i=1}^n x_i!$ 与 $\lambda$ 无关，取对数后变为 $\sum \ln(x_i!)$，对 $\lambda$ 求导时等于零，**可以忽略**，但在构造似然函数时应当包含此项。

:::

:::pitfall{label=易错点2}

**指数化简错误**：$\prod_{i=1}^n e^{-\lambda} = e^{-n\lambda}$，不是 $e^{-\lambda}$，注意 $n$ 个样本每个贡献一个 $e^{-\lambda}$，累乘后指数是 $-n\lambda$。

:::

:::pitfall{label=易错点3}

**对 $\ell$ 求导时遗漏项**：$\ell(\lambda) = (\sum x_i)\ln\lambda - n\lambda + \text{const}$，对 $\lambda$ 求导时：$(\sum x_i)\cdot\frac{1}{\lambda}$ 来自第一项，$-n$ 来自第二项，两项都不能漏。

:::

:::pitfall{label=易错点4}

**误认为 MLE 必然无偏**：本题中 $\hat{\lambda}=\bar{X}$ 恰好无偏，但这是泊松分布的特殊性质（$E[X]=\lambda$），其他分布的MLE不一定无偏（如正态方差的MLE是有偏的）。

:::

:::pitfall{label=易错点5}

**不会应用 MLE 不变性**：题目若进一步问"$e^{-\lambda}$ 的MLE是什么"，直接代入 $\hat\lambda$ 得 $e^{-\bar{X}}$ 即可，无需重新建立似然方程，这是MLE不变性原理的直接应用。

:::
