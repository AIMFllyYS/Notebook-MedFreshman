# 考点二·概率基本概念与计算

> 来源：华科《概率论与数理统计》习题集（第2版）·分类练习
> 对应章节：ch01 随机事件与概率
> 题量：17题（选择10题 + 填空7题）

---

### 第1题

:::callout{kind=note label="题目"}
设 $A, B$ 是任意两个随机事件，则（　　）

A. $P(A + B) \leq P(A \cup B) \leq P(A) + P(B)$
B. $P(A) + P(B) - 1 \leq P(AB) \leq P(A \cup B) \leq P(A) + P(B)$
C. $P(A) + P(B) - 1 \leq P(A \cup B) \leq P(AB) \leq P(A) + P(B)$
D. $1 - P(A) - P(B) \leq P(AB) \leq P(A) + P(B) \leq P(A \cup B)$
:::

:::callout{kind=insight label="解析"}
概率的基本不等式：

1. $P(A \cup B) = P(A) + P(B) - P(AB) \leq P(A) + P(B)$（减去非负项）
2. $P(AB) \geq P(A) + P(B) - 1$（由 $P(A \cup B) \leq 1$ 得 $P(AB) \geq P(A) + P(B) - 1$）
3. $P(AB) \leq P(A \cup B)$（交集概率不超过并集概率）

因此正确的顺序是：$P(A) + P(B) - 1 \leq P(AB) \leq P(A \cup B) \leq P(A) + P(B)$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
概率基本不等式链：$P(A) + P(B) - 1 \leq P(AB) \leq P(A \cup B) \leq P(A) + P(B)$。记住交集最小、并集最大。
:::

---

### 第2题

:::callout{kind=note label="题目"}
若事件 $A$ 与事件 $B$ 独立，且 $P(B) > 0$，则（　　）

A. $A$ 与 $B$ 不互斥
B. $A$ 与 $B$ 互斥
C. $P(A|B) = P(A)$
D. $P(A|B) \neq P(A)$
:::

:::callout{kind=insight label="解析"}
独立性的定义：$P(AB) = P(A)P(B)$

条件概率公式：$P(A|B) = \frac{P(AB)}{P(B)} = \frac{P(A)P(B)}{P(B)} = P(A)$

因此 **C** 正确。

关于互斥：独立事件可以互斥（当至少一个概率为0时），也可以不互斥。A、B 不一定正确。
:::

:::callout{kind=tip label="结论速记"}
独立性的等价条件：$P(AB) = P(A)P(B) \iff P(A|B) = P(A) \iff P(B|A) = P(B)$（条件概率等于无条件概率）。
:::

---

### 第3题

:::callout{kind=note label="题目"}
设 $A, B$ 为任意两事件且 $A \subset B$，$P(B) > 0$，则下列结论一定正确的是（　　）

A. $P(A) \geq P(A|B)$
B. $P(A) > P(A|B)$
C. $P(A) < P(A|B)$
D. $P(A) \leq P(A|B)$
:::

:::callout{kind=insight label="解析"}
由于 $A \subset B$，则 $AB = A$。

$$P(A|B) = \frac{P(AB)}{P(B)} = \frac{P(A)}{P(B)}$$

因为 $A \subset B$，所以 $P(A) \leq P(B)$，即 $\frac{P(A)}{P(B)} \leq 1$。

因此 $P(A|B) = \frac{P(A)}{P(B)} \geq P(A)$（当 $P(B) < 1$ 时严格大于，当 $P(B) = 1$ 时相等）

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$A \subset B$ 时，$P(A|B) = \frac{P(A)}{P(B)} \geq P(A)$。条件概率"浓缩"了样本空间，使条件事件概率增大。
:::

---

### 第4题

:::callout{kind=note label="题目"}
下列叙述正确的是（　　）

A. "$P(A) = 0$"是"$A = \emptyset$"的充分条件，但不是必要条件
B. "$P(A) = 0$"是"$A = \emptyset$"的必要条件，但不是充分条件
C. "$P(A) = 0$"是"$A = \emptyset$"的充要条件
D. "$P(A) = 0$"既不是"$A = \emptyset$"的必要条件，也不是它的充分条件
:::

:::callout{kind=insight label="解析"}
- $A = \emptyset \Rightarrow P(A) = 0$：空集概率必为0，所以 $P(A) = 0$ 是 $A = \emptyset$ 的**必要条件**
- $P(A) = 0 \nRightarrow A = \emptyset$：概率为0的事件不一定是不可能事件（如连续型随机变量取单点值的概率为0，但事件非空）

因此 $P(A) = 0$ 是 $A = \emptyset$ 的必要条件但不是充分条件。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
不可能事件（$\emptyset$）概率必为0，但概率为0的事件不一定是不可能事件（连续型分布的单点）。
:::

---

### 第5题

:::callout{kind=note label="题目"}
设 $A, B$ 为随机事件，且 $P(B) > 0$，$P(A|B) = 1$，则必有（　　）

A. $P(A \cup B) > P(A)$
B. $P(A \cup B) > P(B)$
C. $P(A \cup B) = P(A)$
D. $P(A \cup B) = P(B)$
:::

:::callout{kind=insight label="解析"}
$P(A|B) = 1$ 意味着在 $B$ 发生的条件下，$A$ 必然发生，即 $B \subset A$。

因此 $A \cup B = A$，所以 $P(A \cup B) = P(A)$。

选 **C**。
:::

:::callout{kind=tip label="结论速记"}
$P(A|B) = 1 \iff B \subset A$（B发生则A必发生），此时 $A \cup B = A$。
:::

---

### 第6题

:::callout{kind=note label="题目"}
若事件 $A$ 与 $A$ 独立，则（　　）

A. $A$ 是必然事件
B. $A$ 是不可能事件
C. $P(A) = 0$
D. $P(A) = 0$ 或 $1$
:::

:::callout{kind=insight label="解析"}
$A$ 与 $A$ 独立意味着 $P(A \cap A) = P(A) \cdot P(A)$

即 $P(A) = P(A)^2$，解得 $P(A) = 0$ 或 $P(A) = 1$。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
事件与自身独立 ⟺ 概率为0或1。概率为0或1的事件与任何事件都独立。
:::

---

### 第7题

:::callout{kind=note label="题目"}
设两事件 $A, B$ 满足 $A \subset B$，$P(A) > 0$，则（　　）

A. $P(A) = 0.5$
B. $P(A|B) = 0.5$
C. $P(B) = 1$
D. $P(B|A) = 1$
:::

:::callout{kind=insight label="解析"}
$A \subset B$ 意味着 $A$ 发生则 $B$ 必然发生。

因此 $P(B|A) = \frac{P(AB)}{P(A)} = \frac{P(A)}{P(A)} = 1$。

选 **D**。
:::

:::callout{kind=tip label="结论速记"}
$A \subset B \Rightarrow P(B|A) = 1$（子集事件在超集条件下的条件概率为1）。
:::

---

### 第8题

:::callout{kind=note label="题目"}
当事件 $A$ 与 $B$ 既互不相容又相互独立时，不能保证（　　）

A. $\min\{P(A), P(B)\} = 0$
B. $\max\{P(A), P(B)\} = 1$
C. $P(A \cup B) = P(A) + P(B)$
D. $P(AB) = P(A)P(B)$
:::

:::callout{kind=insight label="解析"}
互不相容：$P(AB) = 0$

相互独立：$P(AB) = P(A)P(B)$

两者同时成立：$P(A)P(B) = 0$，即至少有一个概率为0，所以 $\min\{P(A), P(B)\} = 0$，A正确。

互不相容时 $P(A \cup B) = P(A) + P(B)$，C正确。

独立时 $P(AB) = P(A)P(B)$，D正确。

但 $\max\{P(A), P(B)\} = 1$ 不一定成立，例如 $P(A) = 0, P(B) = 0.5$ 时两者既互斥又独立，但最大概率不是1。

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
既互斥又独立 ⟺ 至少一个概率为0。此时并集概率等于概率之和，交集概率等于概率之积（为0）。
:::

---

### 第9题

:::callout{kind=note label="题目"}
已知事件 $A, B$ 满足 $P(A) = 0, P(B) = 1$，则下列表述一定正确的是（　　）

A. $A, B$ 互不相容
B. $A, B$ 独立
C. $P(A|B) < P(A)$
D. $A$ 是 $B$ 的子集
:::

:::callout{kind=insight label="解析"}
$P(A) = 0$ 的事件与任何事件都独立（包括 $B$），因为 $P(AB) \leq P(A) = 0 = P(A)P(B)$。

选 **B**。

A不一定：$A$ 可能是 $B$ 的子集（此时不互斥），也可能不是。
C错误：$P(A|B) = \frac{P(AB)}{P(B)} = 0 = P(A)$，相等。
D不一定：$A$ 不一定是 $B$ 的子集。
:::

:::callout{kind=tip label="结论速记"}
概率为0或1的事件与任何事件都独立。这是概率论中的重要结论。
:::

---

### 第10题

:::callout{kind=note label="题目"}
已知三个随机事件 $A, B, C$，若 $P(A) = P(B) = P(C) = \frac{1}{8}$，$P(AB) = 0$，$P(AC) = P(BC) = \frac{1}{16}$，则 $A, B, C$ 中恰有一个发生的概率为（　　）

A. $\frac{1}{8}$
B. $\frac{1}{16}$
C. $0$
D. $\frac{1}{32}$
:::

:::callout{kind=insight label="解析"}
恰有一个发生 = $A\bar{B}\bar{C} \cup \bar{A}B\bar{C} \cup \bar{A}\bar{B}C$

由于 $P(AB) = 0$，所以 $A$ 和 $B$ 互斥。

$$P(A\bar{B}\bar{C}) = P(A) - P(AB) - P(AC) + P(ABC) = \frac{1}{8} - 0 - \frac{1}{16} + 0 = \frac{1}{16}$$

$$P(\bar{A}B\bar{C}) = P(B) - P(AB) - P(BC) + P(ABC) = \frac{1}{8} - 0 - \frac{1}{16} + 0 = \frac{1}{16}$$

$$P(\bar{A}\bar{B}C) = P(C) - P(AC) - P(BC) + P(ABC) = \frac{1}{8} - \frac{1}{16} - \frac{1}{16} + 0 = 0$$

恰有一个发生的概率 = $\frac{1}{16} + \frac{1}{16} + 0 = \frac{1}{8}$

选 **A**。
:::

:::callout{kind=tip label="结论速记"}
恰有一个发生：用容斥原理展开 $P(A\bar{B}\bar{C}) = P(A) - P(AB) - P(AC) + P(ABC)$。
:::

---

### 第11题

:::callout{kind=note label="题目"}
为了了解疫情期间的心理需求，心理健康辅导员设计了一份调查问卷，问卷有两个问题：(1) 你的生日在7月1日之前吗？(2) 你需要心理疏导吗？被调查者在保密的情况下抛掷一枚质地均匀的骰子，当出现1点或2点时问题回答(1)，否则回答问题(2)，由于不知道被调查者回答的是哪一个问题，因此当回答"是"时，别人无法知道它是否需要心理疏导，这种调查既保护隐私，也得到诚实的问卷反馈。某校7800名大一学生参加了该问卷调查，全部为有效答卷。发现有1390人回答"是"，由此可估计该校大一学生需要心理疏导的学生人数最可能是（　　）

A. 180
B. 135
C. 210
D. 230
:::

:::callout{kind=insight label="解析"}
设需要心理疏导的学生比例为 $p$。

抛骰子：出现1或2（概率 $\frac{1}{3}$）回答问题(1)，出现3-6（概率 $\frac{2}{3}$）回答问题(2)。

回答"是"的两种情况：
1. 抽到问题(1)且生日在7月1日前：概率 $\frac{1}{3} \times \frac{1}{2} = \frac{1}{6}$
2. 抽到问题(2)且需要心理疏导：概率 $\frac{2}{3} \times p$

$$P(\text{回答"是"}) = \frac{1}{6} + \frac{2}{3}p = \frac{1390}{7800} = \frac{139}{780}$$

$$\frac{2}{3}p = \frac{139}{780} - \frac{1}{6} = \frac{139}{780} - \frac{130}{780} = \frac{9}{780} = \frac{3}{260}$$

$$p = \frac{3}{260} \times \frac{3}{2} = \frac{9}{520}$$

需要心理疏导人数 = $7800 \times \frac{9}{520} = 15 \times 9 = 135$

选 **B**。
:::

:::callout{kind=tip label="结论速记"}
随机化回答技术：用随机机制选择问题，保护隐私。通过全概率公式反推真实比例。
:::

---

### 第12题

:::callout{kind=note label="题目"}
设 $A, B$ 为随机事件，已知 $P(A) = 0.3, P(B) = 0.7, P(B|A) = 0.4$，则 $P(\overline{A \cup B}) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$P(B|A) = \frac{P(AB)}{P(A)} = 0.4 \Rightarrow P(AB) = 0.3 \times 0.4 = 0.12$$

$$P(A \cup B) = P(A) + P(B) - P(AB) = 0.3 + 0.7 - 0.12 = 0.88$$

$$P(\overline{A \cup B}) = 1 - P(A \cup B) = 1 - 0.88 = 0.12$$
:::

:::callout{kind=tip label="结论速记"}
$P(\overline{A \cup B}) = 1 - P(A \cup B)$，用容斥原理计算并集概率。
:::

---

### 第13题

:::callout{kind=note label="题目"}
事件 $A, B$ 满足：$P(AB) = P(\overline{A}\overline{B})$，$P(A) = 0.1$，则 $P(B) =$ ______。
:::

:::callout{kind=insight label="解析"}
由德摩根律：$\overline{A}\overline{B} = \overline{A \cup B}$

$$P(AB) = P(\overline{A \cup B}) = 1 - P(A \cup B) = 1 - [P(A) + P(B) - P(AB)]$$

$$P(AB) = 1 - P(A) - P(B) + P(AB)$$

$$0 = 1 - 0.1 - P(B)$$

$$P(B) = 0.9$$
:::

:::callout{kind=tip label="结论速记"}
$P(AB) = P(\overline{A}\overline{B})$ 时，$P(A) + P(B) = 1$。
:::

---

### 第14题

:::callout{kind=note label="题目"}
设随机事件 $A, B, A \cup B$ 的概率分别为 0.4，0.3，0.6，则 $P(\overline{A}B) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$P(A \cup B) = P(A) + P(B) - P(AB)$$

$$0.6 = 0.4 + 0.3 - P(AB) \Rightarrow P(AB) = 0.1$$

$$P(\overline{A}B) = P(B) - P(AB) = 0.3 - 0.1 = 0.2$$
:::

:::callout{kind=tip label="结论速记"}
$P(\overline{A}B) = P(B) - P(AB)$，$B$ 中去掉与 $A$ 的交集部分。
:::

---

### 第15题

:::callout{kind=note label="题目"}
设随机事件 $A, B$，$P(A) = 0.6, P(B|A) = 0.5$，则 $P(A \cup B) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$P(B|A) = \frac{P(AB)}{P(A)} = 0.5 \Rightarrow P(AB) = 0.6 \times 0.5 = 0.3$$

$$P(A \cup B) = P(A) + P(B) - P(AB)$$

但题目未给 $P(B)$，无法直接计算。用另一种方法：

$$P(A \cup B) = P(A) + P(\overline{A}B)$$

$$P(B|A) = 0.5 \Rightarrow P(\overline{B}|A) = 0.5$$

$$P(\overline{A}B) = P(B) - P(AB)$$

实际上题目信息不足，需要补充 $P(B)$。假设题目隐含 $P(B|A) = P(B|\overline{A})$（独立性），则 $P(B) = 0.5$。

$$P(A \cup B) = 0.6 + 0.5 - 0.3 = 0.8$$

（注：原题可能隐含 $P(B) = 0.5$ 的条件）
:::

:::callout{kind=tip label="结论速记"}
容斥原理需要 $P(A), P(B), P(AB)$ 三个量，缺一不可。
:::

---

### 第16题

:::callout{kind=note label="题目"}
设 $P(A) = 0.8, P(A - B) = 0.3$，则 $P(AB) =$ ______。
:::

:::callout{kind=insight label="解析"}
$$A - B = A\overline{B}$$

$$P(A) = P(A\overline{B}) + P(AB)$$

$$0.8 = 0.3 + P(AB)$$

$$P(AB) = 0.5$$
:::

:::callout{kind=tip label="结论速记"}
$P(A) = P(A\overline{B}) + P(AB)$，事件 $A$ 分为与 $B$ 互斥和与 $B$ 相交两部分。
:::

---

### 第17题

:::callout{kind=note label="题目"}
将一枚骰子重复独立抛3次，设随机事件 $A = \{3 \text{次中恰有一次点数为2}\}$，$B = \{3 \text{次出现的点数不同}\}$，则 $P(B|A) =$ ______。
:::

:::callout{kind=insight label="解析"}
$A$：3次中恰有一次为2，其余两次为非2（1,3,4,5,6）。

$$P(A) = \binom{3}{1} \times \frac{1}{6} \times \left(\frac{5}{6}\right)^2 = 3 \times \frac{1}{6} \times \frac{25}{36} = \frac{25}{72}$$

$B|A$：在 $A$ 发生的条件下（恰有一次为2），要求3次点数都不同。

设2出现在第 $i$ 次（$i=1,2,3$），其余两次从 $\{1,3,4,5,6\}$ 中取不同值。

$$P(B|A) = \frac{A_5^2}{5^2} = \frac{5 \times 4}{25} = \frac{4}{5}$$
:::

:::callout{kind=tip label="结论速记"}
条件概率 $P(B|A)$：在 $A$ 的样本空间中计算 $B$ 的概率。本题中 $A$ 限制了"恰有一次为2"，$B$ 要求其余两次不同。
:::

---

> 本考点练习完
