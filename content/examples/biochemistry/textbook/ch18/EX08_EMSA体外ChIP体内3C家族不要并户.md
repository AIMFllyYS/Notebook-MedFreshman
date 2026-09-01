:::example{label="EMSA 体外、ChIP 体内是蛋白质–DNA；3C／4C／5C／Hi-C／ChIA-PET 不要并成一种技术"}
**题目**：$\mathrm{EMSA}$ 和 $\mathrm{ChIP}$ 哪个体外、哪个体内？$\mathrm{EMSA}$ 的胶为什么必须非变性、不加 $\mathrm{SDS}$，看见的是蛋白质染料还是标记探针？$\mathrm{ChIP}$ 四步顺序是什么，抗体认的是蛋白质还是 $\mathrm{DNA}$？$\mathrm{ChIP}$-seq 能不能代替「先交联、再抗体」？$3\mathrm{C}$、$4\mathrm{C}$、$5\mathrm{C}$、$\mathrm{Hi}$-$\mathrm{C}$、$\mathrm{ChIA}$-$\mathrm{PET}$ 读出各是什么，$\mathrm{Hi}$-$\mathrm{C}$ 的生物素打在哪，$\mathrm{ChIA}$-$\mathrm{PET}$ 的抗体认谁？$4\mathrm{C}$ 的「环状」是纳米孔吗？染色质构象捕获是 $\mathrm{ChIP}$ 的别名吗？

**解**：
教材 definition：**核酸–蛋白质大多非共价、可逆、往往较弱。** 策略一：温和生理条件下分析，代表 $\mathrm{EMSA}$。策略二：用甲醛、紫外光等交联已经靠近的大分子再分析，代表 $\mathrm{ChIP}$。两种策略不是同一实验的前后两步。

教材 definition：**电泳迁移率变动分析（$\mathrm{EMSA}$）**也称凝胶阻滞、凝胶移位结合分析或 $\mathrm{DNA}$ 结合分析。标记 $\mathrm{DNA}$ 探针（核素或生物素等）$\rightarrow$ 与细胞核提取物温育形成复合物 $\rightarrow$ 非变性聚丙烯酰胺凝胶电泳（不加 $\mathrm{SDS}$）$\rightarrow$ 按标记显示探针条带。蛋白质绑上探针后分子量变大，条带相对滞后。也可用于蛋白质-$\mathrm{RNA}$。教材 pitfall：**$\mathrm{EMSA}$ 是体外结合，不是活细胞染色质上的 $\mathrm{ChIP}$。** 教材 pitfall：**看见的是 $\mathrm{DNA}$ 探针，不是蛋白质染料。** 不要答成考马斯亮蓝染蛋白胶。教材 pitfall：**变性胶或加了 $\mathrm{SDS}$，滞后条带消失，不是「没有结合」，是把结合拆掉了。**

教材 definition：**染色质免疫沉淀（$\mathrm{ChIP}$）**是目前研究体内 $\mathrm{DNA}$ 与蛋白质相互作用的主要方法。四步：①活细胞交联，固定蛋白质-$\mathrm{DNA}$；②随机切断成一定长度的染色质小片段；③特异性抗体沉淀复合体；④序列分析确定结合的 $\mathrm{DNA}$。教材 insight：**抗体认的是蛋白质，测序读的是 $\mathrm{DNA}$。** 教材 pitfall：**$\mathrm{ChIP}$ 是体内，$\mathrm{EMSA}$ 是体外，不要用「都能看 $\mathrm{DNA}$ 结合」并成一种。** 教材 pitfall：**「序列分析」不是把 $\mathrm{ChIP}$ 改名为测序技术。** 全基因组铺开才联用 $\mathrm{ChIP}$-chip、$\mathrm{ChIP}$-seq。教材 pitfall：**$\mathrm{ChIP}$-seq 不能代替「先交联、再抗体」。** 没有交联和特异性抗体，测序读到的不是「这个转录因子当时占据的位点」。

教材 definition：**$3\mathrm{C}$ 一族共享「交联把空间邻近冻住」，分歧从交联之后开始。** $3\mathrm{C}$：酶切、连接后成对引物 $\mathrm{PCR}$，看局部预定位点。$4\mathrm{C}$（circular $3\mathrm{C}$）：逆 $\mathrm{PCR}$ $+$ 芯片，从单个位点扩开。$5\mathrm{C}$：变性 $\mathrm{PCR}$ 扩增后测序，多对接触的碳拷贝。$\mathrm{Hi}$-$\mathrm{C}$：生物素标记连接位点，亲和素捕获后配对末端测序，全基因组远程。$\mathrm{ChIA}$-$\mathrm{PET}$：针对靶蛋白质免疫沉淀，加接头、连接，配对末端测序，问的是该蛋白质在场的接触。教材 pitfall：**染色质构象捕获不是 $\mathrm{ChIP}$ 的别名。** $\mathrm{ChIP}$ 问「这个蛋白质绑在哪些 $\mathrm{DNA}$ 上」；$3\mathrm{C}$ 一族问「哪些 $\mathrm{DNA}$ 片段当时在空间上靠近」。教材 pitfall：**$4\mathrm{C}$ 的「环状」不是纳米孔，也不是测序仪上的连接酶读序。** 教材 pitfall：**$\mathrm{Hi}$-$\mathrm{C}$ 的生物素打在连接位点上，$\mathrm{ChIA}$-$\mathrm{PET}$ 的抗体认的是蛋白质。** 两个「捞」的化学不同。不要把五条技术并成同一次 $\mathrm{PCR}$ 或都写成 $\mathrm{Hi}$-$\mathrm{C}$。

| | $\mathrm{EMSA}$ | $\mathrm{ChIP}$ | $3\mathrm{C}$ 一族 |
|--|----------------|---------------|-------------------|
| 主要问题 | 这段探针体外能不能被蛋白质抓住 | 活细胞里这个蛋白质当时绑在哪些 $\mathrm{DNA}$ 上 | 哪些 $\mathrm{DNA}$ 片段当时在空间上靠近 |
| 交联 | 无 | 有 | 有 |
| 抗体 | 无 | 有 | $3\mathrm{C}$/$4\mathrm{C}$/$5\mathrm{C}$/$\mathrm{Hi}$-$\mathrm{C}$ 无；$\mathrm{ChIA}$-$\mathrm{PET}$ 有 |
| 读出 | 非变性胶滞后 | 沉淀 $\mathrm{DNA}$ 的序列／芯片／测序 | $\mathrm{PCR}$、芯片、配对末端测序等 |

易错点：$\mathrm{EMSA}$ 加 $\mathrm{SDS}$；$\mathrm{ChIP}$ 答成体外；五条 $3\mathrm{C}$ 并户；$4\mathrm{C}$ 写成纳米孔；$\mathrm{Hi}$-$\mathrm{C}$ 与 $\mathrm{ChIA}$-$\mathrm{PET}$ 的「捞」对调；把本节写成测序课。
:::
