:::example{label=题目描述}

设总体 $X \sim N(\mu, \sigma^2)$，其中 $\mu$ 和 $\sigma^2$ 均未知。$(X_1, X_2, \ldots, X_n)$ 为来自该总体的简单随机样本，试用**最大似然估计法**求 $\mu$ 和 $\sigma^2$ 的估计量。

:::

:::insight{label=分析}

本题有两个未知参数 $\mu$ 和 $\sigma^2$，需要联立两个方程（对两个参数分别求偏导并令其为零）。

关键步骤：
1. 写出正态分布的概率密度函数，构造似然函数 $L(\mu, \sigma^2)$。
2. 取对数得对数似然函数 $\ell(\mu, \sigma^2)$，将乘积化为求和，大幅简化。
3. 分别对 $\mu$ 和 $\sigma^2$ 求偏导，令偏导等于零，得到似然方程组。
4. 解方程组，得到 $\hat{\mu}$ 和 $\hat{\sigma}^2$，并说明其是最大值点。

:::

:::derivation{label=解答}

**第一步：构造似然函数**

正态分布 $N(\mu, \sigma^2)$ 的密度函数为：

$$
f(x;\mu,\sigma^2) = \frac{1}{\sqrt{2\pi}\,\sigma}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
$$

似然函数（$n$ 个独立同分布样本的联合密度）：

$$
L(\mu,\sigma^2) = \prod_{i=1}^n f(x_i;\mu,\sigma^2) = \prod_{i=1}^n \frac{1}{\sqrt{2\pi}\,\sigma}\exp\left(-\frac{(x_i-\mu)^2}{2\sigma^2}\right)
$$

$$
L(\mu,\sigma^2) = \left(\frac{1}{\sqrt{2\pi}\,\sigma}\right)^n \exp\left(-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2\right)
$$

**第二步：取对数似然函数**

$$
\ell(\mu,\sigma^2) = \ln L = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln(\sigma^2) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
$$

**第三步：建立似然方程组**

对 $\mu$ 求偏导并令其为零：

$$
\frac{\partial \ell}{\partial \mu} = \frac{1}{\sigma^2}\sum_{i=1}^n(x_i - \mu) = 0
$$

$$
\sum_{i=1}^n(x_i - \mu) = 0 \implies n\mu = \sum_{i=1}^n x_i \implies \boxed{\hat{\mu} = \bar{x} = \frac{1}{n}\sum_{i=1}^n x_i}
$$

令 $\sigma^2 = t$（令 $t = \sigma^2$，对 $t$ 求偏导更方便）：

$$
\frac{\partial \ell}{\partial t} = -\frac{n}{2t} + \frac{1}{2t^2}\sum_{i=1}^n(x_i-\mu)^2 = 0
$$

代入已求得的 $\hat{\mu} = \bar{x}$：

$$
-\frac{n}{2t} + \frac{1}{2t^2}\sum_{i=1}^n(x_i-\bar{x})^2 = 0
$$

两边乘以 $2t^2$：

$$
-nt + \sum_{i=1}^n(x_i-\bar{x})^2 = 0 \implies t = \frac{1}{n}\sum_{i=1}^n(x_i-\bar{x})^2
$$

$$
\boxed{\hat{\sigma}^2 = \frac{1}{n}\sum_{i=1}^n(X_i - \bar{X})^2}
$$

**最终结果**：

$$
\hat{\mu} = \bar{X} = \frac{1}{n}\sum_{i=1}^n X_i
$$

$$
\hat{\sigma}^2 = \frac{1}{n}\sum_{i=1}^n(X_i - \bar{X})^2
$$

**讨论估计量的性质**：

- $\hat{\mu} = \bar{X}$：**无偏且有效**，$E[\bar{X}] = \mu$。
- $\hat{\sigma}^2 = \frac{1}{n}\sum(X_i-\bar{X})^2$：**有偏估计**，$E[\hat{\sigma}^2] = \frac{n-1}{n}\sigma^2 \neq \sigma^2$。

若需 $\sigma^2$ 的无偏估计，应使用样本方差 $S^2 = \frac{1}{n-1}\sum(X_i-\bar{X})^2$（分母为 $n-1$）。

MLE 的不变性：$\sigma$ 的MLE为 $\hat{\sigma} = \sqrt{\hat{\sigma}^2} = \sqrt{\frac{1}{n}\sum(X_i-\bar{X})^2}$。

:::

:::theorem{label=关键公式}

正态分布的对数似然函数：

$$
\ell(\mu, \sigma^2) = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln\sigma^2 - \frac{\sum_{i=1}^n(X_i-\mu)^2}{2\sigma^2}
$$

MLE 结果：

$$
\hat{\mu} = \bar{X}, \quad \hat{\sigma}^2 = \frac{1}{n}\sum_{i=1}^n(X_i-\bar{X})^2
$$

与无偏估计的对比：

$$
S^2 = \frac{n}{n-1}\hat{\sigma}^2 = \frac{1}{n-1}\sum_{i=1}^n(X_i-\bar{X})^2 \quad \text{（无偏）}
$$

:::

:::pitfall{label=易错点1}

**对 $\sigma^2$ 的偏导推导错误**：建议令 $t = \sigma^2$ 再求偏导，避免对 $\sigma$ 求导引起的复杂链式法则。关键是 $\frac{\partial}{\partial t}\left(-\frac{n}{2}\ln t\right) = -\frac{n}{2t}$ 和 $\frac{\partial}{\partial t}\left(-\frac{Q}{2t}\right) = \frac{Q}{2t^2}$（其中 $Q = \sum(x_i-\mu)^2$）。

:::

:::pitfall{label=易错点2}

**MLE 结果写成分母 $n-1$**：正态分布方差的MLE是 $\frac{1}{n}\sum(X_i-\bar{X})^2$（有偏），而无偏的样本方差分母是 $n-1$，两者不同，不要混淆。

:::

:::pitfall{label=易错点3}

**漏掉常数项的对数**：对数似然函数中 $-\frac{n}{2}\ln(2\pi)$ 是与参数无关的常数，求导时为零，但在写 $\ell$ 时应包含（虽然不影响最大值的位置）。

:::

:::pitfall{label=易错点4}

**未代入 $\hat{\mu}$ 再解 $\hat{\sigma}^2$**：解第二个方程时，应先将已求得的 $\hat{\mu} = \bar{x}$ 代入，否则方程中仍有两个未知数，无法化简。

:::

:::pitfall{label=易错点5}

**忽略解是最大值点的验证**：一般情况下，通过检查二阶偏导数矩阵（Hessian矩阵）负定来验证是最大值点，考试中通常只要说明"由实际意义知此解为最大值点"即可。

:::
