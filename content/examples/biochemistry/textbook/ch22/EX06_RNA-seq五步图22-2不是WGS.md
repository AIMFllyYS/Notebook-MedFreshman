:::example{label="RNA-seq 五步按图22-2；材料是 RNA，不是 WGS"}
**题目**：表型克隆针对未知基因，现在常用哪两种转录组方法？图22-2 五步按什么顺序，能不能跳到「上机」就结束？第五步验证用什么？差异一定来自基因结构改变吗？$\mathrm{RNA}$-$\mathrm{seq}$ 和 $\mathrm{WGS}$ 都有「文库—高通量测序—分析」，为什么不是同一户？能不能把 $\mathrm{RNA}$-$\mathrm{seq}$ 写成定位克隆或 $\mathrm{GWAS}$ 的别名？

**解**：
教材 definition：**$\mathrm{RNA}$-$\mathrm{seq}$ 在鉴定方法里的位置**——转录组测序（$\mathrm{RNA}$ sequencing，$\mathrm{RNA}$-$\mathrm{seq}$）比较疾病与正常组织全部 $\mathrm{mRNA}$ 的表达种类和含量，从而克隆或指向疾病相关基因。属于表型克隆针对未知基因的这一路，与定位克隆、$\mathrm{GWAS}$、全基因组 $\mathrm{DNA}$ 测序互补。目前常用的主要是 $\mathrm{cDNA}$ 微阵列和 $\mathrm{RNA}$-$\mathrm{seq}$。教材 pitfall：**差异可能源于基因结构改变，也可能源于表达调控机制改变。** 只答「找到了突变」，调控改变那一户就丢了。

教材 insight：**图22-2 按 $1$ 到 $5$ 读，不要跳到「上机」就结束。** ①样本准备：收集样本、提取 $\mathrm{RNA}$、对 $\mathrm{RNA}$ 质控。②文库制备：逆转录、序列特异性连接、$\mathrm{PCR}$ 扩增。③高通量测序：文库上机，本版点名 Illumina HiSeq、NovaSeq 等。④数据分析：原始数据处理和质控、与参考基因组比对、计算表达量、差异表达、功能注释。⑤结果解读和验证：差异表达基因的功能和通路富集；验证实验如实时定量 $\mathrm{PCR}$ 或免疫印迹等。第五步把第一节「已知基因比表达」里的实时定量 $\mathrm{RT}$-$\mathrm{PCR}$ 收回来当验证，不是另开一种鉴定哲学。

教材 pitfall：**$\mathrm{RNA}$-$\mathrm{seq}$ 不是 $\mathrm{WGS}$。** 图22-2 的材料是 $\mathrm{RNA}$，产物是表达量和差异基因。图22-3 的材料是基因组 $\mathrm{DNA}$，产物是 $\mathrm{SNP}$／$\mathrm{InDel}$ 等变异。两张图都有「文库—高通量测序—分析」，起点和问的问题不同。教材 pitfall：**定位克隆 ≠ $\mathrm{GWAS}$ ≠ $\mathrm{RNA}$-$\mathrm{seq}$ ≠ $\mathrm{WGS}$。** 定位克隆问染色体大体位置；$\mathrm{GWAS}$ 问全基因组常见 $\mathrm{SNP}$ 与表型关联；$\mathrm{RNA}$-$\mathrm{seq}$ 问转录组差异；$\mathrm{WGS}$ 问整个核苷酸序列上的变异。写成「鉴定方法就是测序」，四户就并了。

| 策略（第一节） | 本节对应的技术 |
|----------------|----------------|
| 直接比基因组 $\mathrm{DNA}$ | 错配筛选、$\mathrm{RDA}$（动态突变）；大尺度结构变异也可在 $\mathrm{WGS}$ 的 $\mathrm{SV}$／$\mathrm{CNV}$ 里被看见 |
| 已知基因比表达 | Northern、$\mathrm{RNA}$ 酶保护、$\mathrm{RT}$-$\mathrm{PCR}$、实时定量 $\mathrm{RT}$-$\mathrm{PCR}$；也是图22-2 第 $5$ 步的验证手段 |
| 未知基因比全部 $\mathrm{mRNA}$ | 早前 $\mathrm{mRNA}$-$\mathrm{DD}$、$\mathrm{SSH}$、$\mathrm{SAGE}$；目前芯片和 $\mathrm{RNA}$-$\mathrm{seq}$（图22-2） |

易错点：五步写成「提 $\mathrm{RNA}$ 就上机」；把 $\mathrm{RNA}$-$\mathrm{seq}$ 写成 $\mathrm{WGS}$；差异只答基因突变；把芯片／$\mathrm{RNA}$-$\mathrm{seq}$ 并成定位克隆或 $\mathrm{GWAS}$；验证步漏掉实时定量 $\mathrm{PCR}$ 或免疫印迹。
:::
