:::example{label="米氏方程、Km意义与Vmax如何按前提写"}
**题目**：在酶浓度和其他条件不变时，$v$ 对 $[\mathrm{S}]$ 作图呈什么曲线，$\mathrm{a}$、$\mathrm{b}$、$\mathrm{c}$ 三段各是几级反应，$V_{\max}$ 出现在什么时候？米氏方程怎样写，$K_\mathrm{m}$ 和 $V_{\max}$ 各是什么，$1913$ 年谁根据什么学说提出？推导的三个前提是什么，$K_\mathrm{m}$ 用三个速率常数怎样定义，$V_{\max}$ 与 $k_3$、$[\mathrm{E}_\mathrm{t}]$ 的关系是什么？$K_\mathrm{m}$ 的操作定义是什么，它是不是酶的特征性常数，与酶浓度有没有关，取值多在什么范围？什么条件下 $K_\mathrm{m}$ 才能代表亲和力，$K_\mathrm{m}$ 大是亲和力大还是小？转换数是什么、单位是什么，碳酸酐酶 $10^{-6}\,\mathrm{mol/L}$ 在 $1\,\mathrm{s}$ 内生成 $0.6\,\mathrm{mol/L}\,\mathrm{H}_2\mathrm{CO}_3$ 时 $k_3$ 等于多少？为什么不能把米氏方程听成任何时刻都成立，也不能把 $K_\mathrm{m}$ 听成越大越亲、或听成酶加得越多 $K_\mathrm{m}$ 越大？

**解**：
教材 definition：**在酶浓度和其他反应条件不变时，$v$ 对 $[\mathrm{S}]$ 作图呈矩形双曲线。** $\mathrm{a}$ 段 $[\mathrm{S}]$ 很低，一级反应；$\mathrm{b}$ 段混合级；$\mathrm{c}$ 段酶被底物饱和，$v=V_{\max}$，零级反应。教材 definition：**$1902$ 年 Henri 提出酶-底物中间复合物：$\mathrm{E}+\mathrm{S}\rightleftharpoons\mathrm{ES}\to\mathrm{E}+\mathrm{P}$。$1913$ 年 Michaelis 与 Menten 给出米氏方程**

$$
v=\frac{V_{\max}[\mathrm{S}]}{K_\mathrm{m}+[\mathrm{S}]}
$$

$[\mathrm{S}]\ll K_\mathrm{m}$ 时 $v=(V_{\max}/K_\mathrm{m})[\mathrm{S}]$，一级；$[\mathrm{S}]\gg K_\mathrm{m}$ 时 $v=V_{\max}$，零级。教材 pitfall：**米氏方程三前提缺一不可：单底物、初速率、$[\mathrm{S}]$ 远大于 $[\mathrm{E}]$（初速率范围内底物消耗 $<5\%$）。** 多底物、反应已经走了很远、或 $[\mathrm{S}]$ 并不远大于 $[\mathrm{E}]$，不能套这公式。

教材 derivation：**稳态时 $\mathrm{ES}$ 生成 $=$ 分解，定义 $K_\mathrm{m}=(k_2+k_3)/k_1$；初速率下 $v=k_3[\mathrm{ES}]$；酶全部变成 $\mathrm{ES}$ 时 $V_{\max}=k_3[\mathrm{E}_\mathrm{t}]$。** 教材 definition：**$K_\mathrm{m}$ 值等于酶促反应速率为最大反应速率一半时的底物浓度。** 把 $v=V_{\max}/2$ 代入即得 $K_\mathrm{m}=[\mathrm{S}]$。教材 definition：**$K_\mathrm{m}$ 是酶的特征性常数：与酶的结构、底物结构、反应环境的 $\mathrm{pH}$、温度和离子强度有关，而与酶浓度无关。** 多在 $10^{-6}\sim 10^{-2}\,\mathrm{mol/L}$。同一酶对不同底物 $K_\mathrm{m}$ 可以差一个数量级，它是“这对酶-底物”的特征。教材 pitfall：**特征性常数不是“永远不变”，只是与酶浓度无关。**

教材 definition：**当 $k_3\ll k_2$ 时 $K_\mathrm{m}\approx k_2/k_1=K_\mathrm{s}$，此时 $K_\mathrm{m}$ 代表亲和力：$K_\mathrm{m}$ 越大亲和力越小，$K_\mathrm{m}$ 越小亲和力越大。** 教材 pitfall：**并非所有反应都能用 $K_\mathrm{m}$ 代表亲和力。** 有时 $k_3$ 甚至远大于 $k_2$，这时 $K_\mathrm{m}$ 就不能表示亲和力。教材 definition：**转换数是酶被底物完全饱和时，单位时间内每个酶分子（或活性中心）催化底物转变成产物的分子数，即 $k_3$，单位 $\mathrm{s}^{-1}$。** 碳酸酐酶：$k_3=0.6/10^{-6}=6\times 10^{5}\,\mathrm{s}^{-1}$。大多数生理性底物的转换数在 $1\sim 10^{4}\,\mathrm{s}^{-1}$。

| 条件 | $K_\mathrm{m}$ 等于什么 | 能不能代表亲和力 |
|------|-------------------------|--------------------|
| 一般 | $(k_2+k_3)/k_1$ | 不一定 |
| $k_3\ll k_2$ | $\approx k_2/k_1=K_\mathrm{s}$ | 能：$K_\mathrm{m}$ 大则亲和力小 |
| $k_3\gg k_2$ | $\approx k_3/k_1$ | 不能 |

易错点：缺三前提就套米氏方程；把 $K_\mathrm{m}$ 听成越大越亲；把“特征性”听成任何条件下同一个数，或听成酶加得越多 $K_\mathrm{m}$ 越大；把所有反应的 $K_\mathrm{m}$ 都写成亲和力；漏写 $V_{\max}=k_3[\mathrm{E}_\mathrm{t}]$ 和转换数单位。
:::
