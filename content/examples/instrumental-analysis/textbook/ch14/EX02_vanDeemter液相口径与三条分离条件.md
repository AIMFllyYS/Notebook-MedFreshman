:::example{label="液相 van Deemter 丢掉 B/u 之后怎样选条件"}
**题目**：表 14-2 里气体和液体的扩散系数、密度、黏度各差多少数量级？HPLC 的 $A$、$B$ 本版公式是什么？为什么 $B/u$ 可以忽略，式（14-1）和式（14-5）各留下哪几项？键合相为什么丢掉 $C_{\mathrm{s}}$？$C_{\mathrm{m}}$、$C_{\mathrm{sm}}$ 与 $d_{\mathrm{p}}$、$D_{\mathrm{m}}$ 什么关系？甲醇、乙腈、乙醇的 $\eta$ 各是多少，分析型流量和柱温本版怎么写？图 14-1 的 HPLC 曲线为什么近似直线？不要把第 7 节 UPLC 的 $H$–$u$ 图提前写满。

**解**：
教材 compare：**表 14-2**——$D$：气体 $10^{-1}$、液体 $10^{-5}\,\mathrm{cm^{2}\cdot s^{-1}}$；$\rho$：$10^{-3}$ 对 $1$；$\eta$：$10^{-4}$ 对 $10^{-2}$。扩散约小 $10^{4}\sim 10^{5}$ 倍，黏度约 100 倍，密度约 1000 倍。

教材 definition：**涡流扩散项**——$A=2\lambda d_{\mathrm{p}}$，与 GC 相同。降 $d_{\mathrm{p}}$、降 $\lambda$（球形、$\mathrm{RSD}<5\%$、匀浆装柱）。

教材 definition：**纵向扩散项可忽略**——$B=2\gamma D_{\mathrm{m}}$，$D_{\mathrm{m}}\propto T/\eta$。液体黏度大、室温、$D_{\mathrm{m}}$ 约小 $10^{5}$ 倍，实际流速常是 $u_{\mathrm{opt}}$ 的 $3\sim 5$ 倍，故 $H=A+Cu$（14-1）。$A$ 截距、$C$ 斜率。

教材 definition：**传质阻抗三项**——$C=C_{\mathrm{s}}+C_{\mathrm{m}}+C_{\mathrm{sm}}$。键合相单分子层，$d_{\mathrm{f}}$ 可忽略，$C_{\mathrm{s}}$ 丢掉。$C_{\mathrm{m}}=\omega_{\mathrm{m}}d_{\mathrm{p}}^{2}/D_{\mathrm{m}}$，$C_{\mathrm{sm}}$ 同样 $\propto d_{\mathrm{p}}^{2}/D_{\mathrm{m}}$。式（14-5）：$H=A+C_{\mathrm{m}}u+C_{\mathrm{sm}}u$。

教材 compare：**三个 $\eta$**——乙腈 $0.34$、甲醇 $0.54$、乙醇 $1.08\,\mathrm{mPa\cdot s}$，很少用乙醇。

教材 definition：**三条分离条件**——小粒径窄分布球形键合相、匀浆装柱；低黏度甲醇或乙腈，流量约 $1\,\mathrm{mL\cdot min^{-1}}$；柱温 $25\sim 30\,^{\circ}\mathrm{C}$，过低黏度升、过高起泡。

教材 keypoint：**图 14-1**——GC 有最低点；HPLC 的 $u_{\mathrm{opt}}$ 靠近原点，常用区段近似直线。图 14-2：（b）涡流路径不同，（c）流路中心快边缘慢，（d）深孔晚回，（e）厚液膜是涂渍相的账。

| 项 | 液相口径 | 不要听成 |
|----|----------|----------|
| $B/u$ | 可忽略 | 仍是主项 |
| $C_{\mathrm{s}}$ | 键合相可忽略 | 图 14-2（e）是键合相主项 |
| 流量 | 常用约 $1\,\mathrm{mL\cdot min^{-1}}$ | 第 1 节 $1\sim 10$ 被作废 |

易错点：把 $\lambda$ 听成紫外波长；柱温按气相程序升温来升；把 UPLC 的 $1\sim 2\,\mu\mathrm{m}$ 在第 2 节写满仪器耐压。
:::
