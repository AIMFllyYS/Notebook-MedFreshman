:::example{label="UPLC 降粒径抬柱压，LC-MS 靠 API 才不再不可能"}
**题目**：UPLC 的英文、厂商产品和粒径口径？式（14-12）怎样只留下 $d_{\mathrm{p}}$，图 14-20 粒径变小后 $H$–$u$ 怎样变？表 14-6 里柱长、内径、粒度、柱压、流量、进样体积怎样对照 HPLC？LC-MS 曾经为什么不可能，API 含哪两种源、哪个最广？ESI 喷嘴、电压、多电荷例子和适用样品？APCI 为什么要求气化、相对分子质量窗口和流量？不要把第 15 章电泳写进来，也不要把 EI 灯丝搬到液相出口。

**解**：
教材 definition：**超高效液相色谱法**——ultra-performance liquid chromatography，UPLC。Waters 21 世纪初 ACQUITY UPLC。粒径 $<2\,\mu\mathrm{m}$，系统体积很低，检测要快。

教材 definition：**只留下粒径的范氏式**——$H=Ad_{\mathrm{p}}+C_{\mathrm{m}}d_{\mathrm{p}}^{2}u+C_{\mathrm{sm}}d_{\mathrm{p}}^{2}u$。$d_{\mathrm{p}}$ 降，$A$ 降、$C$ 降得更狠；最佳线速度升高，优化区变宽。图 14-20：$10\,\mu\mathrm{m}$（1970s）→ $5\,\mu\mathrm{m}$（1980s）→ $2.5\,\mu\mathrm{m}$（2000）→ $1.7\,\mu\mathrm{m}$（2004），曲线越低越平。没有超高压泵、装填和死体积设计，旧泵上换 $1.7\,\mu\mathrm{m}$ 柱会超压漏液。

教材 compare：**表 14-6**——UPLC 对 HPLC：柱长 $30\sim 100$ 对 $100\sim 300\,\mathrm{mm}$；内径 $2.1$ 对 $3\sim 5\,\mathrm{mm}$；粒度 $1.5\sim 2.0$ 对 $3\sim 10\,\mu\mathrm{m}$；柱压 $40\sim 100$ 对 $5\sim 20\,\mathrm{MPa}$；流量 $0.1\sim 0.7$ 对 $0.5\sim 2.5\,\mathrm{mL\cdot min^{-1}}$；进样 $<10$ 对 $10\sim 100\,\mu\mathrm{L}$。三点优点：速度、分离效能、灵敏度（峰更窄更高）。

教材 definition：**为什么曾经不可能**——溶剂蒸气压对质谱真空；难挥发、热不稳定对不上 EI／CI 气化；缓冲剂干扰。80 年代中期大气压电离源（API）兼接口和离子源。API 含 ESI 和 APCI，ESI 最广。

教材 definition：**电喷雾电离**——喷嘴约 $0.1\,\mathrm{mm}$，$0.5\sim 5\,\mu\mathrm{L\cdot min^{-1}}$，$3\sim 8\,\mathrm{kV}$（约 $10^{6}\,\mathrm{V\cdot m^{-1}}$）。真空梯度：常压 → $200\sim 400\,\mathrm{Pa}$ → $20\sim 40\,\mathrm{Pa}$ → $10^{-5}\sim 10^{-4}\,\mathrm{Pa}$。库仑爆裂把离子排入气相。最温和，适合强极性大分子（蛋白、肽、糖）。相对分子质量 $10\,000$ 带 10 个电荷则 $m/z=1000$；质量范围 $1000\sim 2400$ 的仪器可测数百万蛋白质。

教材 definition：**大气压化学电离**——热气动喷雾：先加热气化，电晕放电产生 $\mathrm{H_3O^{+}}$ 等，离子－分子反应得准分子离子。适合弱极性到中等极性、热稳定、相对分子质量一般 $<1000$，主要单电荷，流量可高达 $2\,\mathrm{mL\cdot min^{-1}}$ 水溶液。

| 项目 | ESI | APCI |
|------|-----|------|
| 电离 | 液滴表面、多电荷 | 气态离子－分子、单电荷 |
| 样品 | 强极性大分子 | 弱～中等极性、热稳定 |
| $M_{\mathrm{r}}$ | 靠多电荷可达数百万 | 一般 $<1000$ |

易错点：UPLC 当成柱更长、流量更大；把 EI 搬到液相出口；ESI 当万能、APCI 当硬电离碎片源。
:::
