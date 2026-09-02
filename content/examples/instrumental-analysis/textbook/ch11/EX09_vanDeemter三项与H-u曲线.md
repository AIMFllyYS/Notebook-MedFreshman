:::example{label="van Deemter 三项与 H–u 曲线两侧对策"}
**题目**：范氏方程怎样写，三项各代表什么？$A$、$B$、$C$ 本版公式是什么？怎样缩小涡流扩散，过细颗粒的代价是什么？$D_{\mathrm{g}}$ 本版三句怎样写，氢气与氮气谁的扩散系数更大？气液色谱为什么可忽略 $C_{\mathrm{g}}$，减小 $C$ 的主要办法是什么？$u_{\mathrm{opt}}$ 和 $H_{\min}$ 怎样由求导得到？高流速、低流速各由哪一项控制，对策为什么不能写反？思考题第 7 题答案是什么？

**解**：
教材 theorem：$H=A+B/u+Cu$。$A$ 涡流（多径）扩散，$B/u$ 纵向（分子）扩散，$Cu$ 传质阻抗。$u$ 是流动相线速度。

教材 definition：$A=2\lambda d_{\mathrm{p}}$，与流速无关。细颗粒、粒度范围窄、均匀填充可缩小 $A$；过细则柱阻力过大、渗透性变差。$B=2\gamma D_{\mathrm{g}}$，$\gamma$ 弯曲因子一般小于 $1$。本版：$D_{\mathrm{g}}$ 与温度成正比，与流动相的黏度成正比，而黏度又与相对分子质量的平方根成反比；同一组分在氢气中的扩散系数大于在氮气中。

教材 definition：一般叙述 $C=C_{\mathrm{m}}+C_{\mathrm{s}}$；气液色谱 $C=C_{\mathrm{g}}+C_{\mathrm{l}}$，$C_{\mathrm{g}}$ 很小可忽略。$C\approx C_{\mathrm{l}}=\dfrac{2k}{3(1+k)^{2}}\cdot\dfrac{d_{\mathrm{f}}^{2}}{D_{\mathrm{l}}}$。降低液膜厚度是减小 $C$ 的主要方法；完全覆盖载体前提下适当减少固定液，太少则柱寿命短。

教材 derivation：$\mathrm{d}H/\mathrm{d}u=-B/u^{2}+C=0$ → $u_{\mathrm{opt}}=\sqrt{B/C}$，$H_{\min}=A+2\sqrt{BC}$。图 11-9：1 为 $B/u$，2 为 $Cu$，3 为水平的 $A$。

教材 compare：$u\ge u_{\mathrm{opt}}$ 时 $Cu$ 控制 → 低流速、较低固定液量、较高柱温、较大 $D_{\mathrm{l}}$ 的固定液。$u\le u_{\mathrm{opt}}$ 时 $B/u$ 控制 → 较高流速、较低柱温、相对分子质量较大的流动相。

教材 pitfall：**高流速控制项是传质阻抗，不是纵向扩散。** 思考题第 7 题选 A。两侧对策对调，柱温和载气分子量会全部答反。$C_{\mathrm{m}}/C_{\mathrm{s}}$ 与 $C_{\mathrm{g}}/C_{\mathrm{l}}$ 是同一件事的两套称呼，不要四项相加。

易错点：把 $A=2\lambda d_{\mathrm{p}}$ 的 $\lambda$ 写成 $A$；氢气 $D_{\mathrm{g}}$ 更大就断言氢气一定柱效更高；习题 3 不会套 $u_{\mathrm{opt}}=\sqrt{B/C}$。
:::
