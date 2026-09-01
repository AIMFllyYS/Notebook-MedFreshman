:::example{label="HGP 四张图：遗传用 cM，物理用 kb，转录用 EST，序列靠鸟枪法组装"}
**题目**：人染色体 $\mathrm{DNA}$ 为什么不能直接测序，作图是把超长 $\mathrm{DNA}$ 分解标记成可操作区域吗？人类基因组计划产出哪四张图？遗传图谱的单位是 $\mathrm{cM}$ 还是 $\mathrm{bp}$，$1\%$ 重组对应 $1\,\mathrm{cM}$ 约多少 $\mathrm{kb}$，常用标志 $\mathrm{RFLP}$、$\mathrm{VNTR}$、$\mathrm{SNP}$ 哪一个精确度最高（$0.5\sim 1.0\,\mathrm{kb}$）？物理图谱以什么标实际距离，三张子图里最重要的是哪一张，$\mathrm{STS}$ 是单拷贝能 $\mathrm{PCR}$ 还是一段重复，$\mathrm{Alu}$ 能不能当 $\mathrm{STS}$，每隔多少 $\mathrm{kb}$ 一个标志？转录图谱以 $\mathrm{EST}$ 为位标，$\mathrm{EST}$ 是全长 $\mathrm{cDNA}$ 还是 $5'/3'$ 端 $300\sim 500\,\mathrm{bp}$，成年特定组织大约百分之几的基因表达？序列图谱是 $\mathrm{BAC}$ 文库加鸟枪法随机测序再拼接（基因组组装），还是对着染色体逐碱基从头读到尾？

**解**：
教材 definition：**人类基因组计划（$\mathrm{HGP}$）是结构基因组学解析人类自身 $\mathrm{DNA}$ 序列和结构的主要实施途径。** 产出四张图：遗传图谱、物理图谱、序列图谱、转录图谱。教材 definition：**作图是将很长的染色体 $\mathrm{DNA}$ 分解、标记，使之成为可操作的较小结构区域。** 不能直接对整条人染色体测序，是作图的理由。

教材 definition：**遗传图谱又称连锁图谱。** 遗传作图确定连锁的遗传标志或分子标志在一条染色体上的排列顺序及相对遗传距离，单位是厘摩尔根（$\mathrm{cM}$）。重组值 $1\%$ 对应 $1\,\mathrm{cM}$，约为 $1\,000\,\mathrm{kb}$。常用标志：$\mathrm{RFLP}$、$\mathrm{VNTR}$、$\mathrm{SNP}$，其中 $\mathrm{SNP}$ 的精确度最高（$0.5\sim 1.0\,\mathrm{kb}$）。教材 pitfall：**$1\,\mathrm{cM}$ 不是 $1\,\mathrm{bp}$，$\mathrm{SNP}$ 也不是“最粗”的标志。** $1\,\mathrm{cM}\approx 1\,000\,\mathrm{kb}$ 是教材给的换算，不是说重组率处处均匀。把连锁图的 $\mathrm{cM}$ 直接当成测序读长，后面的 $\mathrm{STS}$ 每隔 $100\,\mathrm{kb}$ 会失去意义。

教材 definition：**物理图谱以 $\mathrm{bp}$ 或 $\mathrm{kb}$ 标示遗传标志在染色体上的实际位置和距离，是遗传作图基础上更详细的基因组图谱。** 包括荧光原位杂交图（$\mathrm{FISH}$ 图）、限制性酶切图及克隆重叠群图等。构建克隆重叠群图是最重要的一种物理作图：用酶切位点稀有的限制酶或高频超声把 $\mathrm{DNA}$ 打成大片段，构建 $\mathrm{YAC}$ 或 $\mathrm{BAC}$，获取含已知 $\mathrm{STS}$ 的 $\mathrm{DNA}$ 大片段，再连成覆盖每条染色体的连续克隆系，为大规模测序做准备。教材 definition：**$\mathrm{STS}$（序列标签位点）是在染色体上定位明确、并且可用 $\mathrm{PCR}$ 扩增的单拷贝序列，每隔 $100\,\mathrm{kb}$ 距离就有一个标志。** 教材 pitfall：**$\mathrm{STS}$ 是单拷贝、能 $\mathrm{PCR}$，不是一段重复序列。** 第二节的 $\mathrm{Alu}$、$50$ 万拷贝不能拿来当 $\mathrm{STS}$。

教材 definition：**转录图谱又称 $\mathrm{cDNA}$ 图或表达图，以表达序列标签（$\mathrm{EST}$）为位标。** 一个特定个体的所有类型细胞含同样一套基因组；成年个体每一特定组织中一般只有 $10\%$ 的基因表达；同一种细胞在发育不同阶段表达谱也不一样。教材 definition：**$\mathrm{EST}$ 是从 $\mathrm{cDNA}$ 文库随机挑克隆测序得到的部分 $\mathrm{cDNA}$ 的 $5'$ 或 $3'$ 端序列，一般长 $300\sim 500\,\mathrm{bp}$。** 用 $\mathrm{mRNA}$ 逆转录的 $\mathrm{cDNA}$ 片段作探针与基因组 $\mathrm{DNA}$ 杂交，标记可表达基因在基因组上的位置。教材 pitfall：**$\mathrm{EST}$ 不是全长 $\mathrm{cDNA}$，也不是基因组测序读段。** 来源是 $\mathrm{cDNA}$ 文库，已经过逆转录，反映的是表达过的基因。$1.5\%$ 编码序列说明必须另画一张表达图；序列图谱看全部 $\mathrm{DNA}$（含 $98.5\%$ 非蛋白质编码序列）。

教材 definition：**在作图基础上，经 $\mathrm{BAC}$ 克隆系构建和鸟枪法测序完成全基因组测序，再用生物信息学构建序列图谱。** 全基因组鸟枪法：直接将整个基因组打成不同大小的 $\mathrm{DNA}$ 片段，构建 $\mathrm{BAC}$ 文库，对文库随机测序，再用生物信息学把测序片段拼接成全基因组序列，这一拼接称为基因组组装（genome assembly）。教材 pitfall：**鸟枪法不是“对着染色体逐碱基从头读到尾”。** 没有物理骨架（尤其 $\mathrm{STS}$ 克隆重叠群），随机读段就对不回染色体。

| | 距离含义 | 单位／位标 |
|--|----------|------------|
| 遗传图谱 | 相对遗传距离（重组率） | $\mathrm{cM}$；$1\,\mathrm{cM}\approx 1\,000\,\mathrm{kb}$；$\mathrm{RFLP}$、$\mathrm{VNTR}$、$\mathrm{SNP}$ |
| 物理图谱 | 实际位置和距离 | $\mathrm{bp}/\mathrm{kb}$；$\mathrm{FISH}$、酶切、克隆重叠群；$\mathrm{STS}$ 每 $100\,\mathrm{kb}$ |
| 转录图谱 | 可表达基因的位置 | $\mathrm{EST}$ $300\sim 500\,\mathrm{bp}$；成年组织约 $10\%$ 表达 |
| 序列图谱 | 全基因组序列 | $\mathrm{BAC}$ 文库 $+$ 鸟枪法 $+$ 组装 |

易错点：$1\,\mathrm{cM}$ 写成 $1\,\mathrm{bp}$；$\mathrm{SNP}$ 写成最粗；$\mathrm{STS}$ 用 $\mathrm{Alu}$ 充当；$\mathrm{EST}$ 写成全长 $\mathrm{mRNA}$ 或鸟枪法基因组片段；鸟枪法听成逐碱基从头读到尾；漏掉“成年组织约 $10\%$ 表达”。
:::
