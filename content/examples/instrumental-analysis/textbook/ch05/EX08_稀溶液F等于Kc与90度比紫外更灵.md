:::example{label="εcl＜0.05 时 F＝Kc，测的是侧面那一点光"}
**题目**：为什么不能在透射方向测荧光、一般在哪一方向观测？式（5-8）到式（5-11）怎样从 $I_\mathrm{f}=\varphi_\mathrm{f} I_\mathrm{a}$ 推到 $F=Kc$？线性条件本版写的是什么，何时不呈线性？第 2 节自熄灭的浓度界限为什么还要另记一笔？荧光分析法为什么比紫外–可见分光光度法灵敏度高？标准曲线法怎样调零、怎样用稳定标准校正，测维生素 $\mathrm{B}_1$ 用什么作基准？比例法的前提和式（5-12）、式（5-13）是什么？空白调不到零怎么办？

**解**：
教材 definition：**不能在透射光方向测定荧光**，一般与激发光源垂直观测（图 5-7）。这是荧光计与紫外–可见光度计最显眼的光路差别。

教材 derivation：$I_\mathrm{a}=I_0(1-10^{-\varepsilon cl})$，故 $I_\mathrm{f}=\varphi_\mathrm{f} I_0(1-10^{-\varepsilon cl})$ 为式（5-10）。$\varepsilon cl$ 很小时 $1-10^{-\varepsilon cl}\approx 2.303\,\varepsilon cl$，于是 $F=2.303\,\varphi_\mathrm{f} I_0\varepsilon cl=Kc$。线性条件：**$\varepsilon cl<0.05$**；$\varepsilon cl\geqslant 0.05$ 不呈线性。另：浓度超过 $1\,\mathrm{g}\cdot\mathrm{L}^{-1}$ 会自熄灭。

教材 insight：荧光测弱背景下的发射，放大检测器有用；紫外–可见测 $I/I_0$，两个一起放大商不变，对提高灵敏度不起作用。

标准曲线：空白调零，某一标准调至 $100\%$ 或 $50\%$；实际先测空白再减。不同时间用同一稳定标准校正。样品见光不稳时换发射波长相近的稳定标准；测维生素 $\mathrm{B}_1$ 可用硫酸奎宁。

比例法：曲线通过原点、线性范围内。$\dfrac{F_x-F_0}{F_\mathrm{s}-F_0}=\dfrac{c_x}{c_\mathrm{s}}$，即 $c_x=\dfrac{F_x-F_0}{F_\mathrm{s}-F_0}\times c_\mathrm{s}$。空白调不到 $0\%$ 必须扣 $F_0$。教材 pitfall：**曲线不过原点不要用比例法。**

易错点：把荧光读数当吸光度 $A$；在浓溶液硬套 $F=Kc$；漏扣空白；把“看起来挺稀”当成 $\varepsilon cl<0.05$。
:::
