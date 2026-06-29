:::example{label="例题 5：LC 振荡电路的频率"}

**题目**：一个无阻尼 LC 振荡电路，电感 $L=10\ \mathrm{mH}$，电容 $C=100\ \mathrm{\mu F}$。求振荡频率 $f$ 和角频率 $\omega$。

**解**：

1. **角频率公式**：
   $$
   \omega = \frac{1}{\sqrt{LC}}.
   $$

2. **代入数值**：
   $$
   LC = 10\times10^{-3}\times100\times10^{-6}=10^{-6}\ \mathrm{s^2}.
   $$
   $$
   \omega = \frac{1}{\sqrt{10^{-6}}}=\frac{1}{10^{-3}}=1000\ \mathrm{rad/s}.
   $$

3. **频率**：
   $$
   f = \frac{\omega}{2\pi}=\frac{1000}{2\pi}\approx 159\ \mathrm{Hz}.
   $$

**答案**：$\omega=1000\ \mathrm{rad/s}$，$f\approx 159\ \mathrm{Hz}$。

**易错点**：$f=\dfrac{1}{2\pi\sqrt{LC}}$ 与 $\omega=\dfrac{1}{\sqrt{LC}}$ 差一个 $2\pi$ 因子。要提高频率需减小 $L$ 和 $C$（少绕线圈、拉大极板间距），最终演化为天线结构。

:::
