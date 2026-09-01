:::example{label="cyclin如何周期性出现而Cdk要三重打开才完全激活"}
**题目**：哺乳动物 cyclin 按出现阶段分成哪四类、各配对哪一种 Cdk、各管哪一转换？细胞周期蛋白框、破坏框和 PEST 序列各干什么、APC 与 SCF 分别降解谁？Cdk 完全激活要过哪三步、Thr161 与 Thr14/Tyr15 谁是活化型磷酸化、谁是抑制性磷酸化？CIP/KIP 与 INK4 怎样负性调节？cyclin D–Cdk4/6 和 cyclin E–Cdk2 怎样经 Rb–E2F 越过限制点？cyclin A–Cdk2 怎样保证 DNA 只复制一次？

**解**：
细胞周期蛋白（cyclin）为全酶调节亚基，细胞周期蛋白依赖性激酶（Cdk）为催化亚基。不同 cyclin 选择性结合特定 Cdk，结合后 Cdk 呈现激酶活性，再通过磷酸化一系列特定底物，实现不同周期进程及转换。cyclin 能随周期进程周期性地出现（合成）及消失（降解）。

按出现及发挥作用的阶段，哺乳动物 cyclin 分成四类：①G1 期 cyclin D；②G1/S 期 cyclin E；③S 期 cyclin A；④M 期 cyclin B。

| Cdk | 结合的 cyclin | 主要作用时期 | 作用特点 |
|-----|---------------|--------------|----------|
| Cdk4/6 | cyclin D（D1/D2/D3） | G1 中、晚期 | 使晚 G1 细胞跨越限制点进入 S |
| Cdk2 | cyclin E | G1 晚期 | 使晚 G1 细胞跨越限制点进入 S |
| Cdk2 | cyclin A | S | 启动 DNA 复制，并阻止已复制的 DNA 再复制 |
| Cdk1 | cyclin A | G2 | 促进 G2→M |
| Cdk1 | cyclin B | G2、M | 磷酸化多种有丝分裂相关蛋白，促进 G2→M（即 MPF） |

不同 cyclin 分子结构上有一段氨基酸组成保守的细胞周期蛋白框，约 $100$ 个氨基酸残基，介导与 Cdk 结合。S 期及 M 期 cyclin 近 N 端还有一段由 $9$ 个氨基酸残基构成的破坏框，介导 cyclin A、B 的快速降解。G1 期周期蛋白虽不具破坏框，但可通过 C 端一段 PEST 序列介导降解。参与的 E3 泛素连接酶主要有两类：活化的 APC（与 Cdc20 结合后被激活）把泛素连到 cyclin A、B 破坏框附近的赖氨酸上；SCF 则把泛素连到 cyclin D、E 上。APC 还可泛素化 securin，SCF 还可泛素化某些 CKI（如 p27$^{\mathrm{Kip1}}$）。

Cdk 只有在结合 cyclin 的前提下，再完成活化型磷酸化及抑制性磷酸的去除，才能被完全激活：

1. **结合 cyclin**：无活性 Cdk 的 T 环封闭催化口袋；cyclin 与 T 环强烈相互作用，T 环位移，入口打开，Cdk 获得部分活性。
2. **CAK 磷酸化 Thr161**：Thr161 位于 T 环上，磷酸化后复合物与底物的结合能力显著增强，催化活性可提高约 $300$ 倍，故称活化型磷酸化。
3. **Cdc25 去除 Thr14、Tyr15**：这两个残基分布于 Cdk 与 ATP 结合部位，由 Wee1/Myt1 等激酶事先加上抑制性磷酸；必须由 Cdc25 磷酸酶去除后，Cdk 才最终被激活。

反向关闭：CKI 结合（G1 为主）；SCF 降解 cyclin D/E；APC 降解 cyclin A/B 并使 securin 消失。cyclin 一旦被蛋白酶体拆掉，该 Cdk 立即失去活性，转换不可逆。

哺乳动物 CKI 分为两大家族：CIP/KIP（p21$^{\mathrm{Cip1/Waf1}}$、p27$^{\mathrm{Kip1}}$、p57$^{\mathrm{Kip2}}$ 等）与 cyclin–Cdk 形成三元复合物而抑制活性；INK4（p16$^{\mathrm{INK4}}$、p15$^{\mathrm{INK4}}$、p18$^{\mathrm{INK4}}$ 等）与 Cdk4 或 Cdk6 结合，阻断它们与 cyclin D 结合。

G1/S 转化：外界生长因子刺激下 cyclin D 表达增强，cyclin D–Cdk4/6 磷酸化 Rb 使其失活，释放被 Rb 抑制的转录因子 E2F，启动 S 期相关基因及 cyclin E、A 转录。G1 晚期 cyclin E–Cdk2 进一步激活 E2F（正反馈），使细胞跨过限制点。进入 S 期后 cyclin D/E 降解不可逆，已进入 S 期的细胞无法退回 G1。cyclin A–Cdk2 磷酸化预复制复合体使之激活，DNA 合成启动；随后使 Cdc6 从 ORC 上解离，预复制复合体去组装，原复制起点不能再次复制，从而保证 DNA 只复制一次。

教材 concept：**cyclin 是时间表，Cdk 是引擎，三重打开才算点火。** 只记住“cyclin 结合 Cdk”不够：没有 Thr161 的活化型磷酸化，活性仍低；没有 Cdc25 拆掉 Wee1 写上的抑制性磷酸，MPF 打不开。把 APC 和 SCF 的底物写反，G1 cyclin 和 M 期 cyclin 的降解时间表就会整段翻掉。

易错点：把 cyclin D/E/A/B 的时相对错 Cdk；把破坏框写成 G1 cyclin 的降解信号、PEST 写成 A/B 的；把 Thr161 写成抑制性磷酸化；把 Cdc25 写成激酶而不是磷酸酶；把 INK4 写成抑制所有 Cdk；把 cyclin A–Cdk2 只写成“启动复制”而漏掉“只复制一次”。
:::
