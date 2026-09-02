:::example{label="朗伯-比尔定律 A=Elc 与透光率指数关系"}
**题目**：朗伯–比尔定律描述的是哪三件事之间的关系？本版数学式怎样写，$T$ 和 $A$ 如何定义？浓度增大一倍时，透光率变成什么、吸光度变成什么？多组分何时可以写 $A_{\text{总}}=A_{\mathrm{a}}+A_{\mathrm{b}}+A_{\mathrm{c}}+\cdots$？推导时两个假设是什么？例 4-1 氯霉素 $T=24.3\%$、$2.00\,\mathrm{mg}/100\,\mathrm{mL}$、$l=1.00\,\mathrm{cm}$、$M=323.15\,\mathrm{g}\cdot\mathrm{mol}^{-1}$，怎样求出 $A$、$E_{1\,\mathrm{cm}}^{1\%}$ 和 $\varepsilon$？$\varepsilon$ 与 $E_{1\,\mathrm{cm}}^{1\%}$ 的换算式分母为什么是 10？$E_{1\,\mathrm{cm}}^{1\%}$ 的 $c$ 用什么单位？

**解**：
教材 definition：**朗伯–比尔定律描述物质对单色光吸收的强弱与吸光物质的厚度和浓度间的关系。本版数学式为 $A=-\lg(I/I_0)=Ecl$。** $T=I/I_0$，常用百分数表示；$A=-\lg T=Elc$；$T=10^{-A}=10^{-Elc}$。

教材 insight：**浓度加倍，$T$ 变成平方，$A$ 才加倍。** $T$ 对 $c$ 或 $l$ 是指数函数，不能把 $T$ 当直线去内插浓度。

教材 definition：**各组分吸光物质之间没有相互作用时，同一波长下总吸光度等于各组分吸光度之和。** 第 3 节多组分定量都靠加和性。

教材 keypoint：**推导假设：①入射光是单色光；②溶液是稀溶液。** 主要偏离因素就是光学和化学两个方面。

教材 example 例 4-1：

$$
A=-\lg 0.243=0.614,\quad E_{1\,\mathrm{cm}}^{1\%}=\frac{0.614}{2.00\times 10^{-3}\times 1}=307,\quad \varepsilon=\frac{323.15}{10}\times 307=9\,921
$$

教材 definition：**$\varepsilon=(M/10)E_{1\,\mathrm{cm}}^{1\%}$。** $\varepsilon$ 对应 $1\,\mathrm{mol}\cdot\mathrm{L}^{-1}$、$1\,\mathrm{cm}$；$E_{1\,\mathrm{cm}}^{1\%}$ 对应 $1\%$（$\mathrm{g}/100\,\mathrm{mL}$）、$1\,\mathrm{cm}$。教材 pitfall：**$E_{1\,\mathrm{cm}}^{1\%}$ 的 $c$ 是 $\mathrm{g}/100\,\mathrm{mL}$，不是 $\mathrm{mol}\cdot\mathrm{L}^{-1}$。** $2.00\,\mathrm{mg}/100\,\mathrm{mL}=2.00\times 10^{-3}\,\mathrm{g}/100\,\mathrm{mL}$。$\varepsilon$ 达 $10^{4}$ 划为强吸收，小于 $10^{2}$ 为弱吸收，不能直接用 $1\,\mathrm{mol}\cdot\mathrm{L}^{-1}$ 或 $1\%$ 那样高的浓度去测，需用稀溶液换算。

| 量 | 关系 | 易错 |
|----|------|------|
| $T$ | $10^{-Elc}$ | 浓度加倍 $T$ 不是减半 |
| $A$ | $Elc=-\lg T$ | 与 $c$、$l$ 正比 |
| $\varepsilon$ | $(M/10)E_{1\,\mathrm{cm}}^{1\%}$ | 丢掉分母 10 |
| 加和性 | 组分间无相互作用 | 有解离缔合时不能硬加 |

易错点：$A=\lg T$ 漏负号；$T=24.3\%$ 当成 $24.3$ 再取对数；$c$ 单位用错；把 $\varepsilon$ 直接当成 $E_{1\,\mathrm{cm}}^{1\%}$。
:::
