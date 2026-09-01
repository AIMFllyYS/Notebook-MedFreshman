:::example{label="GST 牵拉是体外蛋白质–蛋白质；酵母双杂交靠 GAL4 的 BD 与 AD 重组装，不是测序"}
**题目**：标签蛋白质牵拉沉淀和酵母双杂交各在管里还是细胞里，读出各是什么？最常用标签是 $\mathrm{GST}$ 还是 $\mathrm{GSH}$，珠子上偶联的是谁，用什么竞争洗脱？表达宿主本版写的是大肠埃希菌还是酵母？牵拉沉淀是免疫共沉淀的别名吗？酵母双杂交拆开 $\mathrm{GAL4}$ 后丧失的是激活还是 $\mathrm{DNA}$ 结合？$\mathrm{BD}$ 直接结合猎物蛋白质吗？阳性克隆随后测序，实验本身是不是测序技术？本版有没有写干扰素抑制翻译？

**解**：
教材 definition：**标签蛋白质牵拉沉淀实验（pull-down）**基于亲和色谱，分析蛋白质体外直接相互作用：带标签的纯化融合蛋白质作钓饵，与待测纯化蛋白质或细胞裂解液体外温育，用可结合该标签的琼脂糖珠牵拉回收，洗脱后电泳染色；若结合，待测蛋白质与融合蛋白质同时出现在胶上。用途：证明直接物理结合、划结合结构部位、筛未知分子；亦常用于重组融合蛋白质纯化。教材 pitfall：**牵拉沉淀不是免疫共沉淀的别名。** 免疫共沉淀用抗体认内源或表位；牵拉沉淀用重组标签认珠子。

教材 definition：**目前最常用的标签是谷胱甘肽 $\mathrm{S}$ 转移酶（$\mathrm{GST}$）。** 商品化载体把目的基因接到 $\mathrm{GST}$ 编码区下游，在大肠埃希菌中表达。利用 $\mathrm{GST}$ 与还原型谷胱甘肽（$\mathrm{GSH}$）结合，用偶联了 $\mathrm{GSH}$ 的琼脂糖珠做 $\mathrm{GST}$ pull-down；洗涤后用含游离 $\mathrm{GSH}$ 的缓冲液竞争洗脱。另一常用标签是 $6\times\mathrm{His}$，结合镍离子琼脂糖珠。图18-7 电子版缺失，仍要能默写五步：$\mathrm{X}$ 接 $\mathrm{GST}$ 下游 $\rightarrow$ $\mathrm{GST}$ 绑到 $\mathrm{GSH}$－珠 $\rightarrow$ $\mathrm{Y}$ 若与 $\mathrm{X}$ 互作被间接牵下 $\rightarrow$ 洗涤 $\rightarrow$ 游离 $\mathrm{GSH}$ 竞争洗脱上胶。教材 pitfall：**$\mathrm{GSH}$ 是谷胱甘肽，$\mathrm{GST}$ 是酶标签，不要写反。** 教材 pitfall：**大肠埃希菌表达的是 $\mathrm{GST}$ 融合蛋白质，不是酵母双杂交那一套。**

教材 definition：**酵母双杂交系统**把酵母转录激活因子 $\mathrm{GAL4}$ 拆成 $\mathrm{DNA}$ 结合结构域（$\mathrm{BD}$）和激活结构域（$\mathrm{AD}$），分别融合两种待测蛋白质；二者互作则 $\mathrm{BD}$ 与 $\mathrm{AD}$ 重组装，下游基因重新被激活。用途：①证明两种已知序列蛋白质可互作；②划功能结构域或关键残基；③用 $\mathrm{BD}$ 融合的诱饵质粒筛 $\mathrm{AD}$ 融合的猎物 $\mathrm{cDNA}$ 文库。教材 pitfall：**$\mathrm{BD}$ 结合的是下游基因的 $\mathrm{DNA}$，不是猎物蛋白质。** 写成「$\mathrm{BD}$ 直接结合猎物」，酵母双杂交就变成了 $\mathrm{EMSA}$。教材 pitfall：**分开后丧失激活，不是丧失 $\mathrm{DNA}$ 结合。** $\mathrm{BD}$ 仍可能绑在 $\mathrm{DNA}$ 上，只是没有 $\mathrm{AD}$ 就转不起来。教材 pitfall：**不要把酵母双杂交写成测序。** 读出是报告基因表达被重新激活；阳性克隆随后测序鉴定是后处理。教材 pitfall：**不要发明干扰素抑制翻译当本节例题。** 本版诱饵是 $\mathrm{GST}$ 融合蛋白质或 $\mathrm{GAL4}$-$\mathrm{BD}$，没有写干扰素、没有写翻译抑制。也不要把第十九章重组 $\mathrm{DNA}$ 克隆五步写进本章当主考点。

| | 标签蛋白质牵拉沉淀 | 酵母双杂交 |
|--|-------------------|------------|
| 场所 | 体外温育 | 酵母细胞内 |
| 抓住的依据 | 标签与珠子亲和（如 $\mathrm{GST}$-$\mathrm{GSH}$） | 互作把 $\mathrm{GAL4}$ 的 $\mathrm{BD}$ 与 $\mathrm{AD}$ 拉到一起 |
| 读出 | 电泳胶上共沉淀条带 | 下游基因被重新激活 |
| 不是 | 测序反应；免疫共沉淀的别名 | 测序反应；$\mathrm{EMSA}$ |

易错点：$\mathrm{GST}/\mathrm{GSH}$ 写反；牵拉沉淀发生在酵母里；$\mathrm{BD}$ 直接绑猎物；拆开 $\mathrm{GAL4}$ 后不再认 $\mathrm{DNA}$；把本节答成测序或干扰素翻译抑制。
:::
