:::example{label="二代三大是焦磷酸、Illumina、SOLiD；不要把 SMRT 填进第二代；三代无须 PCR"}
**题目**：第二代三大平台是哪三个、各用什么酶、各读什么信号？Illumina 标在 $\mathrm{ddNTP}$ 上还是可逆修饰的 $\mathrm{dNTP}$ 上？焦磷酸一次加几种 $\mathrm{dNTP}$？$\mathrm{SOLiD}$ 还要不要乳液 $\mathrm{PCR}$，能不能答成单分子测序？第三代点名哪三种，共同处是什么？$\mathrm{SMRT}$ 的 $\mathrm{ZMW}$ 一孔里是一球扩增片段还是一个聚合酶？纳米孔读的是荧光还是电流，直接 $\mathrm{RNA}$ 测序是不是三种单分子技术的共同写法？

**解**：
教材 keypoint：**第二代三大平台**——$2005$ 焦磷酸测序（$454$）：聚合酶 $+$ 焦磷酸发光；$2006$ Illumina：聚合酶 $+$ 可逆荧光 $\mathrm{dNTP}$；$2007$ $\mathrm{SOLiD}$：连接酶 $+$ 双碱基编码探针。问「哪一个不用 $\mathrm{DNA}$ 聚合酶延伸」，答 $\mathrm{SOLiD}$。教材 pitfall：**不要把 $\mathrm{SMRT}$ 填进「第二代三大平台」那一格。**

教材 definition：**Illumina** 策略类似自动激光荧光测序，但四色荧光连在 $\mathrm{dNTP}$ 的 $3'$-$\mathrm{OH}$ 的可逆修饰基团上：掺入后合成终止，读荧光；去修饰，恢复 $3'$-$\mathrm{OH}$，进入下一轮。教材 pitfall：**Illumina 标在 $\mathrm{dNTP}$ 的可逆 $3'$-$\mathrm{OH}$ 上，不是 $\mathrm{ddNTP}$。** 第一代才是荧光 $\mathrm{ddNTP}$、不可逆终止。读长超过 $1\,000\,\mathrm{bp}$、准确率 $99.999\%$ 是第一代自动仪的数字，不要安到焦磷酸、$\mathrm{SOLiD}$ 或纳米孔上。

教材 definition：**焦磷酸测序（$454$）**将微球转入只能容 $1$ 个微球的微孔；一次仅加入一种 $\mathrm{dNTP}$，互补孔里聚合酶将其接到链上，释放焦磷酸，触发 $\mathrm{ATP}$ 硫酸化酶和荧光素酶级联发光，$\mathrm{CCD}$ 读取。离子半导体（$2011$）策略类似，改用微型 $\mathrm{pH}$ 计读合成时释放的 $\mathrm{H}^{+}$。教材 pitfall：**一次只加一种 $\mathrm{dNTP}$，不是四种荧光 $\mathrm{ddNTP}$ 同时终止。** 微乳滴 $\mathrm{PCR}$ 是给每个反应器准备足够模板，不是测序循环本身。

教材 definition：**$\mathrm{SOLiD}$** 基于寡核苷酸连接反应，$8$ 碱基探针前 $2$ 个是双碱基编码，中间 $3$ 个通用配对，后 $3$ 个带荧光并被剪切；偏移共 $5$ 轮，每个碱基读 $2$ 遍。因读长短、拼接复杂、速度慢，已较少使用。教材 pitfall：**代替的是聚合酶，不是取消模板扩增。** $\mathrm{SOLiD}$ 仍用乳液 $\mathrm{PCR}$。把 $\mathrm{SOLiD}$ 答成单分子测序，HeliScope／$\mathrm{SMRT}$／纳米孔就没有分界。教材 pitfall：**$5$ 轮不是 $25\sim 30$ 次 $\mathrm{PCR}$ 循环。**

教材 definition：**第三代无须 $\mathrm{PCR}$ 扩增模板，直接对 $\mathrm{DNA}$ 单分子测序。** 点名 HeliScope（$2008$，荧光 $\mathrm{dNTP}$，读长短、仪器贵，应用不多）、$\mathrm{SMRT}$（零模波导 $\mathrm{ZMW}$，每个微纳米孔仅固定 $1$ 个 $\mathrm{DNA}$ 聚合酶，读掺入荧光 $\mathrm{dNTP}$ 的荧光）、纳米孔（单链 $\mathrm{DNA}$ 或 $\mathrm{RNA}$ 穿过加电压的蛋白质纳米孔，按电流差别读碱基）。教材 pitfall：**第三代不是「循环芯片的第四个平台」。** 教材 pitfall：**纳米孔读的是电流，不是荧光。** 教材 pitfall：**「直接进行 $\mathrm{RNA}$ 测序」写在纳米孔条下，不要给三种单分子技术统一抄「直接测 $\mathrm{RNA}$」。** $\mathrm{SMRT}$ 孔里是 $1$ 个酶对着一条模板，与 $454$「一孔一球（球上已扩增）」不同。

| | 第二代三大 | 第三代单分子 |
|--|-----------|--------------|
| 模板准备 | 先扩增（微乳滴／乳液 $\mathrm{PCR}$ 等） | 无须 $\mathrm{PCR}$ |
| 成员 | 焦磷酸、$454$；Illumina；$\mathrm{SOLiD}$ | HeliScope；$\mathrm{SMRT}$（$\mathrm{ZMW}$ 一孔一酶）；纳米孔（电流） |
| 不要填进去的 | $\mathrm{SMRT}$、纳米孔 | 把 $\mathrm{SOLiD}$ 当单分子 |

易错点：$\mathrm{SMRT}$ 进第二代三大；Illumina 写成 $\mathrm{ddNTP}$；$454$ 写成四色同时终止；$\mathrm{SOLiD}$ 取消 $\mathrm{PCR}$；纳米孔读荧光；三种三代都直接测 $\mathrm{RNA}$。
:::
