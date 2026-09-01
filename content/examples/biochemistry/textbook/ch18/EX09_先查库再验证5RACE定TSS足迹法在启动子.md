:::example{label="先查 NCBI／EBI／DDBJ／CNGBdb 再验证；5′-RACE 定 TSS；DNase I 足迹在本节启动子"}
**题目**：本版基因表达分析的一般策略，是先做芯片还是先查库？世界三大综合数据库是哪三个，中国第四大综合库是哪个？$\mathrm{BLAST}$ 给出的是实验验证还是参考信息／预测？转录起点（$\mathrm{TSS}$）是启动子还是起始密码子？$5'$-$\mathrm{RACE}$ 里 $\mathrm{CIAP}$ 和 $\mathrm{TAP}$ 谁先谁后，$\mathrm{GSP}$ 是不是随机 $9$ 核苷酸引物？$\mathrm{DNase}\ \mathrm{I}$ 足迹法的胶是变性还是非变性，空白区表示什么？足迹法本版写在第四节 $\mathrm{ChIP}$ 还是第五节启动子？

**解**：
教材 definition：**本版的一般策略首先是查询各大数据库（表18-1），进而实验验证基因表达。** 验证常用实时 $\mathrm{PCR}$、基因芯片等。顺序不能倒。教材 keypoint：**三大综合库加中国两条**——三大综合：$\mathrm{NCBI}$、$\mathrm{EBI}$、$\mathrm{DDBJ}$；中国：$\mathrm{CNGBdb}$（第四大综合）、$\mathrm{CNCB}$（自建库 $+$ 镜像）。$\mathrm{GEO}$ 挂在 $\mathrm{NCBI}$。教材 pitfall：**实时 $\mathrm{PCR}$ 和芯片是验证手段，不是「不用再查库」。** 教材 pitfall：**不要把染色质构象捕获再写一遍当本节开头。** $3\mathrm{C}$ 一族已在第四节。

教材 definition：**$\mathrm{BLAST}$** 是特定基因表达分析里最简单的同源检索，用来拿染色体定位、序列及多态性、功能区域、表达产物等参考信息，并预测等电点、跨膜区、信号肽等。教材 pitfall：**$\mathrm{BLAST}$ 给出的是参考信息和预测，不是实验验证本身。** 研究者自己设定条件下的表达，仍要回到实时 $\mathrm{PCR}$、芯片或组学实验。

教材 definition：**转录起点（$\mathrm{TSS}$）**是 $\mathrm{RNA}$ 聚合酶识别、结合启动子之后，在基因上启动转录的位置。教材 insight：**$\mathrm{TSS}$ 不是启动子，也不是起始密码子。** 启动子是被识别结合的调控序列；起始密码子还要再往 $3'$ 走一段 $5'$-$\mathrm{UTR}$。教材 definition：**$5'$-$\mathrm{RACE}$** 基于 $\mathrm{PCR}$、从低丰度转录本中快速扩增 $\mathrm{cDNA}$ 的 $5'$－末端，用来鉴定 $\mathrm{TSS}$。图18-9：先 $\mathrm{CIAP}$（碱性磷酸酶）去掉降解 $\mathrm{mRNA}$、$\mathrm{rRNA}$、$\mathrm{tRNA}$ 和 $\mathrm{DNA}$ 的 $5'$ 磷酸，全长带帽 $\mathrm{mRNA}$ 得以保留；再 $\mathrm{TAP}$（烟草酸焦磷酸酶）去帽，露出 $5'\mathrm{p}$ 才能连接头；随机 $9$ 核苷酸引物逆转录后，用 $5'$-$\mathrm{RACE}$ 外侧／内侧引物与基因特异性引物 $\mathrm{GSP1}$、$\mathrm{GSP2}$ 做巢式 $\mathrm{PCR}$。教材 insight：**$\mathrm{CIAP}$ 和 $\mathrm{TAP}$ 的顺序不能换。** 教材 pitfall：**$\mathrm{GSP}$ 是基因特异性引物，不是随机 $9$ 核苷酸引物。** 逆转录用随机 $9$ 核苷酸；巢式 $\mathrm{PCR}$ 的 $\mathrm{GSP}$ 才对着目的基因。同一技术在编码区小节是「钓末端补全长」，鉴定 $\mathrm{TSS}$ 时才专门看 $5'$ 端从哪一个核苷酸开始。

教材 definition：**$\mathrm{DNA}$ 足迹法**分析启动子中潜在的调节蛋白结合位点，利用电泳条带连续性中断的图谱判断结合区域。按切割试剂分酶足迹法和化学足迹法；图18-10 是酶足迹法，切割试剂是 $\mathrm{DNase}\ \mathrm{I}$。步骤：双链 $\mathrm{DNA}$ 单链末端标记 $\rightarrow$ 加入 $\mathrm{DNA}$ 结合蛋白 $\rightarrow$ $\mathrm{DNase}\ \mathrm{I}$ 切割（控制时间）$\rightarrow$ 变性凝胶电泳：无蛋白对照为连续梯带，蛋白-$\mathrm{DNA}$ 样品出现空白区 $\rightarrow$ 对空白区相应 $\mathrm{DNA}$ 克隆测序。教材 insight：**「足迹」就是胶上那一段空白。** 教材 pitfall：**足迹法的胶是变性胶，$\mathrm{EMSA}$ 的胶是非变性胶。** 教材 pitfall：**足迹法放在第五节「确定启动子」，不要搬回第四节当 $\mathrm{ChIP}$ 的原理。** $\mathrm{EMSA}/\mathrm{ChIP}$ 告诉你「有结合」；足迹法告诉你「结合占住了哪一段梯子」。

| | 查库／$\mathrm{BLAST}$ | $5'$-$\mathrm{RACE}$ | $\mathrm{DNase}\ \mathrm{I}$ 足迹 |
|--|---------------------|---------------------|-------------------------------|
| 问什么 | 已有注释和表达谱线索 | 转录从哪一个核苷酸开始 | 启动子上蛋白质占住哪一段 |
| 不是 | 已经测完表达 | 启动子本身；起始密码子 | $\mathrm{ChIP}$；非变性 $\mathrm{EMSA}$ |

易错点：先做芯片再查库；三大库只背 $\mathrm{NCBI}$；$\mathrm{BLAST}$ 当成实验验证；$\mathrm{TSS}=$ 启动子 $=$ 起始密码子；$\mathrm{CIAP}/\mathrm{TAP}$ 对调；$\mathrm{GSP}$ 写成随机引物；足迹法胶写成非变性或搬回 $\mathrm{ChIP}$。
:::
