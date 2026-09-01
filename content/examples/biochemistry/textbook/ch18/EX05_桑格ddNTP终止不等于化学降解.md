:::example{label="桑格用 ddNTP 缺 3′-OH 终止；化学降解是碱基专一切断，不要并成同一种反应"}
**题目**：$1977$ 年测序第一次飞跃是哪两套方法，哪一年分享诺贝尔化学奖？桑格法为什么能终止，缺的是 $3'$-$\mathrm{OH}$ 还是 $5'$ 磷酸？四管产物共同起点是什么，胶为什么必须是变性 $\mathrm{PAGE}$？只加 $\mathrm{ddNTP}$、不加 $\mathrm{dNTP}$ 行不行？化学降解法切断的是正在合成的链还是已有的 $\mathrm{DNA}$，后来为什么没铺开？$1980$ 年的化学奖是发给 $\mathrm{PCR}$ 吗？

**解**：
教材 definition：**$\mathrm{DNA}$ 测序的目的是确定一段 $\mathrm{DNA}$ 中 $\mathrm{A}$、$\mathrm{G}$、$\mathrm{C}$、$\mathrm{T}$ 的排列顺序。** $1977$ 年 $\mathrm{Maxam}$-$\mathrm{Gilbert}$ 化学降解法与 $\mathrm{Sanger}$-$\mathrm{Coulson}$ 双脱氧法建立，实现 $\mathrm{DNA}$ 测序第一次飞跃，分享 $1980$ 年诺贝尔化学奖。此前部分酶解等方法仅能测定 $\mathrm{RNA}$。教材 pitfall：**$1980$ 年的化学奖发给测序，不是发给 $\mathrm{PCR}$。** $\mathrm{PCR}$ 是 $1983$ 年 $\mathrm{Mullis}$。教材 pitfall：**早期部分酶解测的是 $\mathrm{RNA}$，不要写成第一种 $\mathrm{DNA}$ 测序。**

教材 definition：**桑格－库森法又称双脱氧法、链终止法。** $\mathrm{ddNTP}$ 的 $3'$－位碳原子上缺少羟基，不能与下一位脱氧核苷酸的 $5'$－位磷酸基形成 $3',5'$－磷酸二酯键，新链 $3'$ 端一旦装上 $\mathrm{ddNTP}$ 即终止。$4$ 个独立体系分别掺入适量 $4$ 种不同 $\mathrm{ddNTP}$，得到共起点（引物 $5'$－末端）、不同终点的一系列长度片段；变性聚丙烯酰胺凝胶电泳可分辨 $1$ 个核苷酸差别，自显影或荧光读序。教材 pitfall：**缺的是 $3'$-$\mathrm{OH}$，不是 $5'$ 磷酸。** 图中 $\mathrm{ddNTP}$ 仍带三磷酸。教材 pitfall：**$\mathrm{dNTP}$ 和 $\mathrm{ddNTP}$ 要同时在管里。** 若只加 $\mathrm{ddNTP}$，链在第一个该碱基处全部停死，没有阶梯。教材 pitfall：**分辨 $1$ 个核苷酸的是变性 $\mathrm{PAGE}$，不是琼脂糖。** 第一节 Southern 用琼脂糖分基因组大片段，户头不同。

教材 definition：**化学降解法又称碱基特异性裂解法。** 单链 $\mathrm{DNA}$ 末端核素标记 $\rightarrow$ 几组专一性化学试剂修饰碱基并在修饰处随机断裂 $\rightarrow$ $4$ 套长短不一的片段混合物 $\rightarrow$ 凝胶电泳、自显影读序。因对待测 $\mathrm{DNA}$ 要求较高、试剂毒性、自动化较难，并未得到广泛应用。教材 pitfall：**化学法切断的是已有的 $\mathrm{DNA}$，不是边合成边终止。** 不要把「$4$ 套片段」都写成 $\mathrm{ddNTP}$ 产物。

教材 compare：**$\mathrm{PCR}$ 延伸 vs 桑格延伸**——都用 $\mathrm{DNA}$ 聚合酶和引物；$\mathrm{PCR}$ 底物只有 $\mathrm{dNTP}$，$3'$ 一直有 $\mathrm{OH}$；桑格多适量某一种 $\mathrm{ddNTP}$，故意在特定碱基停住，读的是差 $1\,\mathrm{nt}$ 的阶梯而不是「有没有这条带」。

| | 桑格－库森 | 马克萨姆－吉尔伯特 |
|--|------------|---------------------|
| 关键化学 | $\mathrm{ddNTP}$ 缺 $3'$-$\mathrm{OH}$，合成终止 | 碱基专一性化学修饰 $+$ 断裂 |
| 四套产物 | 四管各掺一种 $\mathrm{ddNTP}$ | 几组试剂得到四套断裂混合物 |
| 后来命运 | 自动化、四色荧光、循环芯片的源头 | 毒性、难自动化，未广泛使用 |

易错点：两法并成同一种终止；$\mathrm{ddNTP}$ 答成没有磷酸；只加 $\mathrm{ddNTP}$；用琼脂糖读序；化学法也写成边合成边终止；$1980$ 奖发给 $\mathrm{PCR}$。
:::
