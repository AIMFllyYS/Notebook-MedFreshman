import type { Exercise } from '../../types/exercise';

export const ch08Exercises: Exercise[] = [
  // ========== 8.1 假设检验的基本思想与直觉 (3题) ==========
  {
    id: "8.1-1",
    chapterId: 8,
    sectionId: "8.1",
    difficulty: "basic",
    type: "choice",
    tags: ["基本思想", "小概率原理"],
    question: "关于假设检验的基本思想，下列说法正确的是：",
    options: [
      "假设检验的目的是证明原假设 $H_0$ 为真。",
      "当样本数据在原假设 $H_0$ 为真时出现的概率很小时，我们有理由拒绝 $H_0$。",
      "只要样本均值 $\\bar{x}$ 与假设值 $\\mu_0$ 不相等，就应该拒绝 $H_0$。",
      "假设检验的结论是绝对确定的，不存在犯错误的可能。"
    ],
    answer: "B",
    solution: `
**逐项分析：**

- **A 错误**：假设检验采用"保护原假设"原则，我们**不能**通过有限样本"证明" $H_0$ 为真，只能在证据充分时拒绝 $H_0$。
- **B 正确**：这正是小概率原理的核心——若 $H_0$ 为真，则当前或更极端的数据出现的概率 $p$ 很小（$p \\le \\alpha$），说明 $H_0$ 下出现该数据极为罕见，故拒绝 $H_0$。
- **C 错误**：样本具有随机性，即使 $\\mu = \\mu_0$，$\\bar{x}$ 也几乎不可能精确等于 $\\mu_0$。必须考虑差异是否在随机波动范围内。
- **D 错误**：假设检验是概率意义上的决策，可能犯第一类错误（弃真）或第二类错误（纳伪）。

**结论**：正确选项为 B。
`,
    hints: [
      "回想费希尔'女士品茶'实验：全部猜对的概率仅约 1/70，小概率事件在一次试验中几乎不发生。",
      "区分'不拒绝 $H_0$'与'接受 $H_0$ 为真'。"
    ],
    relatedFormulas: [
      "P(\\text{观测数据} \\mid H_0 \\text{ 为真}) \\le \\alpha \\Rightarrow \\text{拒绝 } H_0"
    ],
    commonMistakes: [
      "认为样本均值与假设值不等就可以直接拒绝原假设。",
      "将假设检验理解为逻辑证明而非概率决策。"
    ]
  },
  {
    id: "8.1-2",
    chapterId: 8,
    sectionId: "8.1",
    difficulty: "basic",
    type: "fill",
    tags: ["法庭类比", "无罪推定"],
    question: "假设检验与法庭审判类比：原假设 $H_0$ 相当于被告________，只有当证据充分（统计量落入________）时才推翻 $H_0$。",
    answer: "无罪 和 拒绝域",
    solution: `
**填空解析：**

1. **第一空：无罪**
   - 法庭采用"无罪推定"，被告在被证明有罪之前视为无罪。
   - 假设检验中，$H_0$ 表示"无效应、无差异、维持现状"，在没有充分证据前应予以保护。

2. **第二空：拒绝域**
   - 法庭中，检察官提供的证据若足够充分，则判定有罪。
   - 假设检验中，当检验统计量落入拒绝域（概率为 $\\alpha$ 的极端区域）时，才拒绝 $H_0$。

**完整表述**：原假设 $H_0$ 相当于被告**无罪**，只有当证据充分（统计量落入**拒绝域**）时才推翻 $H_0$。
`,
    hints: [
      "回忆'保护原假设'原则与刑事诉讼中的无罪推定。",
      "拒绝域是 $H_0$ 为真时统计量取极端值的小概率区域。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "将拒绝域误写为接受域。",
      "认为 $H_0$ 对应'有罪'，颠倒了假设检验的逻辑。"
    ]
  },
  {
    id: "8.1-3",
    chapterId: 8,
    sectionId: "8.1",
    difficulty: "intermediate",
    type: "choice",
    tags: ["抛硬币", "二项分布", "p值直觉"],
    question: "某赌徒声称硬币公平（$p=0.5$）。连续抛掷 10 次，出现 8 次正面。在显著性水平 $\\alpha=0.05$ 下，关于是否拒绝\"硬币公平\"的原假设，下列说法正确的是：",
    options: [
      "应拒绝 $H_0$，因为 8 次正面明显多于 5 次。",
      "应拒绝 $H_0$，因为 $P(X=8) = \\binom{10}{8}(0.5)^{10} \\approx 0.044 < 0.05$。",
      "不应拒绝 $H_0$，因为双侧 $p$ 值 $P(X \\ge 8) + P(X \\le 2) \\approx 0.11 > 0.05$。",
      "不应拒绝 $H_0$，因为 $P(X=8) \\approx 0.044$ 恰好等于 0.05。"
    ],
    answer: "C",
    solution: `
**建立假设：**
$$ H_0: p = 0.5, \\quad H_1: p \\neq 0.5 $$

**在 $H_0$ 下**，正面次数 $X \\sim B(10, 0.5)$。

**计算双侧 p 值**（观测到 8 次正面或更极端）：
$$ P(X \\ge 8) = P(X=8) + P(X=9) + P(X=10) $$
$$ = \\binom{10}{8}(0.5)^{10} + \\binom{10}{9}(0.5)^{10} + \\binom{10}{10}(0.5)^{10} $$
$$ \\approx 0.0439 + 0.0098 + 0.0010 = 0.0547 $$

由对称性，$P(X \\le 2) = P(X \\ge 8) \\approx 0.0547$。

**双侧 p 值** $= 0.0547 + 0.0547 \\approx 0.109 > 0.05$。

**决策**：$p > \\alpha$，不拒绝 $H_0$。

**选项分析**：
- A：未考虑随机波动，错误。
- B：只用了 $P(X=8)$，且为单侧，未做双侧检验，错误。
- C：正确。
- D：$P(X=8) \\approx 0.044 \\neq 0.05$，且 p 值应包含更极端情况，错误。

**结论**：选 C。
`,
    hints: [
      "双侧检验的 p 值需同时考虑两侧极端值。",
      "p 值是在 $H_0$ 下观测到当前或更极端数据的概率，不是 $P(X=8)$ 单点概率。"
    ],
    relatedFormulas: [
      "X \\sim B(n, p), \\quad p\\text{-值} = P(|X - np| \\ge |x - np| \\mid H_0)"
    ],
    commonMistakes: [
      "将观测值与期望值 5 的简单比较当作检验依据。",
      "双侧检验时只计算单侧概率。"
    ]
  },

  // ========== 8.2 原假设与备择假设的建立 (5题) ==========
  {
    id: "8.2-1",
    chapterId: 8,
    sectionId: "8.2",
    difficulty: "basic",
    type: "choice",
    tags: ["假设建立", "单侧检验"],
    question: "某药厂声称新药使治愈率从 60% 提高到 80% 以上。为验证此声称，应建立的假设为：",
    options: [
      "$H_0: p = 0.80, \\; H_1: p \\neq 0.80$",
      "$H_0: p \\le 0.60, \\; H_1: p > 0.60$",
      "$H_0: p = 0.60, \\; H_1: p > 0.60$",
      "$H_0: p \\ge 0.80, \\; H_1: p < 0.80$"
    ],
    answer: "C",
    solution: `
**分析题意：**
- 药厂声称新药**提高了**治愈率，即 $p > 0.60$（相对于原标准 60%）。
- 原假设 $H_0$ 应表示"无提高"或"维持现状"。
- 备择假设 $H_1$ 应表示"有提高"，即 $p > 0.60$。

**正确假设：**
$$ H_0: p = 0.60, \\quad H_1: p > 0.60 $$

或等价地写 $H_0: p \\le 0.60$（复合原假设），但考研中常用等号形式 $H_0: p = 0.60$。

**选项分析：**
- A：检验的是 $p$ 是否等于 80%，与题意不符。
- B：$H_0: p \\le 0.60$ 也可接受，但 $H_1: p > 0.60$ 正确；然而 B 的 $H_0$ 用复合形式，C 用等号形式更标准。
- C：$H_0: p = 0.60$，$H_1: p > 0.60$，正确。
- D：方向相反，检验的是是否低于 80%，错误。

**结论**：选 C。
`,
    hints: [
      "备择假设应反映研究者的主张或待证结论。",
      "原假设通常含等号，表示'无效应'。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "将药厂声称的 80% 作为 $H_0$ 的取值。",
      "混淆单侧检验的方向（应检验是否'提高'而非是否'等于80%'）。"
    ]
  },
  {
    id: "8.2-2",
    chapterId: 8,
    sectionId: "8.2",
    difficulty: "intermediate",
    type: "fill",
    tags: ["假设建立", "双侧检验", "生产精度"],
    question: "某机床加工零件，标准规定直径均值为 50 mm。质检员怀疑机床出现系统偏差，需检验均值是否偏离 50 mm。应建立 $H_0$: $\\mu$________$50$，$H_1$: $\\mu$________$50$。",
    answer: "= 和 \\neq",
    solution: `
**题意分析：**
- "怀疑出现系统偏差"表示关心均值是否**偏离**标准值 50 mm，不限定偏高或偏低。
- 这是**双侧检验**。

**假设建立：**
$$ H_0: \\mu = 50, \\quad H_1: \\mu \\neq 50 $$

**填空答案：**
- 第一空：**=**（或写 $=$）
- 第二空：**$\\neq$**（或写 不等于）

**说明**：$H_0$ 含等号，表示"机床正常、均值等于标准值"；$H_1$ 表示"均值有偏差"。
`,
    hints: [
      "'偏离''有差异'通常对应双侧备择假设 $\\mu \\neq \\mu_0$。",
      "原假设 $H_0$ 应含等号。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "将'偏离'理解为单侧检验 $\\mu > 50$ 或 $\\mu < 50$。",
      "在 $H_0$ 中写 $\\mu \\neq 50$，违反原假设含等号的原则。"
    ]
  },
  {
    id: "8.2-3",
    chapterId: 8,
    sectionId: "8.2",
    difficulty: "exam",
    type: "choice",
    tags: ["Z检验", "拒绝域", "双侧检验"],
    question: "设总体 $X \\sim N(\\mu, \\sigma^2)$，$\\sigma^2$ 已知。检验 $H_0: \\mu = \\mu_0$ vs $H_1: \\mu \\neq \\mu_0$，统计量 $U = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}$。下列说法**错误**的是：",
    options: [
      "拒绝域为 $|U| \\ge z_{\\alpha/2}$。",
      "当 $\\bar{X}$ 落在 $\\left[\\mu_0 - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\mu_0 + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}\\right]$ 内时，不拒绝 $H_0$。",
      "当 $\\bar{X}$ 落在上述区间内时，应拒绝 $H_0$。",
      "$\\alpha$ 减小时，$z_{\\alpha/2}$ 增大，拒绝域缩小。"
    ],
    answer: "C",
    solution: `
**逐项分析：**

- **A 正确**：双侧检验，拒绝域为 $|U| \\ge z_{\\alpha/2}$。

- **B 正确**：由 $|U| \\le z_{\\alpha/2}$ 等价于
  $$ |\\bar{X} - \\mu_0| \\le z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} $$
  即 $\\bar{X}$ 落在以 $\\mu_0$ 为中心、半宽为 $z_{\\alpha/2}\\sigma/\\sqrt{n}$ 的区间内，此为**接受域**，不拒绝 $H_0$。

- **C 错误**：上述区间是接受域，落入其中应**不拒绝** $H_0$，而非拒绝。

- **D 正确**：$\\alpha$ 减小 $\\Rightarrow$ $z_{\\alpha/2}$ 增大 $\\Rightarrow$ 拒绝域 $|U| \\ge z_{\\alpha/2}$ 更难满足，拒绝域缩小。

**结论**：错误选项为 C。
`,
    hints: [
      "将 $|U| \\le z_{\\alpha/2}$ 转化为 $\\bar{X}$ 的区间，判断是接受域还是拒绝域。",
      "接受域与拒绝域互补。"
    ],
    relatedFormulas: [
      "U = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}} \\sim N(0,1)"
    ],
    commonMistakes: [
      "将接受域误认为拒绝域。",
      "认为 $\\alpha$ 越小拒绝域越大。"
    ]
  },
  {
    id: "8.2-4",
    chapterId: 8,
    sectionId: "8.2",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["假设建立", "次品率", "单侧检验"],
    question: "质检标准规定生产线次品率不超过 3%。抽检 200 件，发现 12 件次品。在显著性水平 $\\alpha=0.05$ 下，检验次品率是否超标。请写出 $H_0$、$H_1$，计算检验统计量，并做出决策。（$\\Phi(2.47) \\approx 0.9932$）",
    answer: "$H_0: p \\le 0.03, H_1: p > 0.03$；$Z \\approx 2.47$；拒绝 $H_0$，次品率可能超标。",
    solution: `
**第一步：建立假设**
- 关心次品率是否**超过**标准 3%
$$ H_0: p \\le 0.03, \\quad H_1: p > 0.03 $$

**第二步：计算样本比例**
$$ \\hat{p} = \\frac{12}{200} = 0.06 $$

**第三步：构造检验统计量**
在 $H_0$ 边界 $p = 0.03$ 下，用正态近似：
$$ Z = \\frac{\\hat{p} - p_0}{\\sqrt{p_0(1-p_0)/n}} = \\frac{0.06 - 0.03}{\\sqrt{0.03 \\times 0.97 / 200}} $$
$$ = \\frac{0.03}{\\sqrt{0.0001455}} = \\frac{0.03}{0.01206} \\approx 2.47 $$

**第四步：确定拒绝域**
右侧检验，$\\alpha = 0.05$，拒绝域 $Z \\ge z_{0.05} = 1.645$。
（或直接比较 p 值：$P(Z \\ge 2.47) = 1 - \\Phi(2.47) \\approx 0.0068 < 0.05$）

**第五步：决策**
$Z = 2.47 > 1.645$，落入拒绝域，**拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，有充分证据认为生产线次品率超标。
`,
    hints: [
      "'超标'对应右侧检验 $H_1: p > 0.03$。",
      "大样本比例检验可用正态近似，分母用 $p_0$ 而非 $\\hat{p}$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\hat{p}-p_0}{\\sqrt{p_0(1-p_0)/n}}"
    ],
    commonMistakes: [
      "将 $H_0$ 写为 $p = 0.03$ 而 $H_1$ 写为 $p \\neq 0.03$（双侧），与'超标'题意不符。",
      "分母误用 $\\hat{p}(1-\\hat{p})/n$。"
    ]
  },
  {
    id: "8.2-5",
    chapterId: 8,
    sectionId: "8.2",
    difficulty: "exam",
    type: "choice",
    tags: ["假设建立", "方差检验"],
    question: "要检验某正态总体方差是否等于 $\\sigma_0^2 = 4$，备择假设为方差有显著变化（变大或变小均可）。正确的假设为：",
    options: [
      "$H_0: \\sigma^2 = 4, \\; H_1: \\sigma^2 > 4$",
      "$H_0: \\sigma^2 \\le 4, \\; H_1: \\sigma^2 > 4$",
      "$H_0: \\sigma^2 = 4, \\; H_1: \\sigma^2 \\neq 4$",
      "$H_0: \\sigma^2 \\neq 4, \\; H_1: \\sigma^2 = 4$"
    ],
    answer: "C",
    solution: `
**题意**：检验方差是否等于 4，且"有显著变化"表示变大或变小均可 $\\Rightarrow$ **双侧检验**。

**正确假设：**
$$ H_0: \\sigma^2 = 4, \\quad H_1: \\sigma^2 \\neq 4 $$

**选项分析：**
- A：单侧（只检验变大），不符合"变大或变小均可"。
- B：单侧（只检验变大），且 $H_0$ 为复合假设。
- C：双侧，正确。
- D：$H_0$ 与 $H_1$ 角色颠倒，违反原假设含等号、被保护的原则。

**结论**：选 C。
`,
    hints: [
      "'有变化''有差异'对应双侧 $H_1: \\theta \\neq \\theta_0$。",
      "原假设 $H_0$ 必须含等号。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "将'有变化'误判为单侧检验。",
      "在 $H_0$ 中写 $\\neq$。"
    ]
  },

  // ========== 8.3 显著性水平与小概率原理 (4题) ==========
  {
    id: "8.3-1",
    chapterId: 8,
    sectionId: "8.3",
    difficulty: "basic",
    type: "choice",
    tags: ["显著性水平", "小概率原理"],
    question: "关于显著性水平 $\\alpha$，下列说法正确的是：",
    options: [
      "$\\alpha$ 是原假设 $H_0$ 为真的概率。",
      "$\\alpha$ 是当 $H_0$ 为真时，拒绝 $H_0$ 的概率的上限（第一类错误概率）。",
      "$\\alpha$ 越大，检验越保守，越不容易拒绝 $H_0$。",
      "$\\alpha$ 必须取 0.05，不能取其他值。"
    ],
    answer: "B",
    solution: `
**逐项分析：**

- **A 错误**：$\\alpha$ 不是 $P(H_0 \\text{ 为真})$，而是 $P(\\text{拒绝 } H_0 \\mid H_0 \\text{ 为真})$。

- **B 正确**：$\\alpha$ 是事先规定的显著性水平，也是第一类错误（弃真）概率的上限。

- **C 错误**：$\\alpha$ **越大**，拒绝域越大，越**容易**拒绝 $H_0$，检验越"激进"而非保守。

- **D 错误**：$\\alpha$ 通常取 0.05、0.01 或 0.10，但可根据问题需要选择。

**结论**：选 B。
`,
    hints: [
      "$\\alpha = P(\\text{第一类错误})$。",
      "$\\alpha$ 增大 $\\Rightarrow$ 临界值减小 $\\Rightarrow$ 更易拒绝 $H_0$。"
    ],
    relatedFormulas: [
      "\\alpha = P(\\text{拒绝 } H_0 \\mid H_0 \\text{ 为真})"
    ],
    commonMistakes: [
      "将 $\\alpha$ 理解为 $H_0$ 为真的概率。",
      "认为 $\\alpha$ 越大越保守。"
    ]
  },
  {
    id: "8.3-2",
    chapterId: 8,
    sectionId: "8.3",
    difficulty: "intermediate",
    type: "fill",
    tags: ["显著性水平", "临界值"],
    question: "在双侧 $Z$ 检验中，显著性水平 $\\alpha=0.05$ 时，拒绝域为 $|Z| \\ge$________，其中 $z_{0.025} \\approx$________。",
    answer: "z_{0.025} 和 1.96",
    solution: `
**双侧检验**：拒绝域分布在标准正态两侧，每侧概率 $\\alpha/2 = 0.025$。

**拒绝域：**
$$ |Z| \\ge z_{\\alpha/2} = z_{0.025} $$

**查表**：$z_{0.025} \\approx 1.96$（标准正态上侧 2.5% 分位数）。

**答案**：第一空 $z_{0.025}$（或 $z_{0.025}$），第二空 **1.96**。
`,
    hints: [
      "双侧检验用 $\\alpha/2$ 查分位数。",
      "$z_{0.025}$ 是常用临界值，约 1.96。"
    ],
    relatedFormulas: [
      "|Z| \\ge z_{\\alpha/2}"
    ],
    commonMistakes: [
      "双侧检验误用 $z_{0.05} = 1.645$。",
      "将 $z_{0.025}$ 与 $z_{0.05}$ 混淆。"
    ]
  },
  {
    id: "8.3-3",
    chapterId: 8,
    sectionId: "8.3",
    difficulty: "exam",
    type: "calculation",
    tags: ["显著性水平", "决策边界"],
    question: "设 $X \\sim N(\\mu, 4)$，$\\sigma^2=4$ 已知。抽取 $n=16$，检验 $H_0: \\mu=10$ vs $H_1: \\mu \\neq 10$，$\\alpha=0.05$。求拒绝域对应的 $\\bar{X}$ 范围，并判断 $\\bar{x}=11.2$ 时是否拒绝 $H_0$。（$z_{0.025}=1.96$）",
    answer: "拒绝域：$\\bar{X} \\le 9.02$ 或 $\\bar{X} \\ge 10.98$；$\\bar{x}=11.2$ 在拒绝域内，拒绝 $H_0$。",
    solution: `
**第一步：检验统计量**
$$ Z = \\frac{\\bar{X} - 10}{2/\\sqrt{16}} = \\frac{\\bar{X} - 10}{0.5} $$

**第二步：拒绝域（统计量形式）**
$$ |Z| \\ge 1.96 $$

**第三步：转化为 $\\bar{X}$ 的拒绝域**
$$ \\left|\\frac{\\bar{X} - 10}{0.5}\\right| \\ge 1.96 $$
$$ |\\bar{X} - 10| \\ge 1.96 \\times 0.5 = 0.98 $$
$$ \\bar{X} \\le 10 - 0.98 = 9.02 \\quad \\text{或} \\quad \\bar{X} \\ge 10 + 0.98 = 10.98 $$

**第四步：判断 $\\bar{x}=11.2$**
$11.2 \\ge 10.98$，落入拒绝域，**拒绝 $H_0$**。

**验证**：$Z = (11.2-10)/0.5 = 2.4 > 1.96$，一致。
`,
    hints: [
      "将 $|Z| \\ge z_{\\alpha/2}$ 转化为 $\\bar{X}$ 的不等式。",
      "半宽 $= z_{\\alpha/2} \\cdot \\sigma/\\sqrt{n}$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}"
    ],
    commonMistakes: [
      "忘记除以 $\\sqrt{n}$，用 $\\sigma$ 而非 $\\sigma/\\sqrt{n}$。",
      "接受域与拒绝域区间搞反。"
    ]
  },
  {
    id: "8.3-4",
    chapterId: 8,
    sectionId: "8.3",
    difficulty: "intermediate",
    type: "choice",
    tags: ["小概率原理", "p值"],
    question: "小概率原理在假设检验中的正确表述是：",
    options: [
      "若 $p$ 值小于 $\\alpha$，则 $H_0$ 一定为假。",
      "若在一次试验中发生了 $H_0$ 下概率小于 $\\alpha$ 的事件，则有理由怀疑 $H_0$。",
      "小概率事件永远不会发生。",
      "只要 $p < 0.05$，结果就一定有实际意义。"
    ],
    answer: "B",
    solution: `
**逐项分析：**

- **A 错误**：$p < \\alpha$ 只说明在 $\\alpha$ 水平下拒绝 $H_0$，不能断言 $H_0$ "一定为假"（可能犯第一类错误）。

- **B 正确**：小概率原理——$H_0$ 下小概率事件在一次试验中几乎不发生；若发生，则怀疑 $H_0$。

- **C 错误**：小概率事件**可能**发生，只是概率很小；多次试验中迟早可能发生。

- **D 错误**：统计显著 $\\neq$ 实际重要；大样本下微小差异也可能 $p<0.05$。

**结论**：选 B。
`,
    hints: [
      "小概率原理是'怀疑'而非'证明' $H_0$ 为假。",
      "区分统计显著与实际意义。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "认为拒绝 $H_0$ 等于证明 $H_0$ 为假。",
      "认为 $p$ 值是 $H_0$ 为真的概率。"
    ]
  },

  // ========== 8.4 两类错误的深入理解 (5题) ==========
  {
    id: "8.4-1",
    chapterId: 8,
    sectionId: "8.4",
    difficulty: "basic",
    type: "choice",
    tags: ["两类错误", "弃真纳伪"],
    question: "关于假设检验中的两类错误，下列说法正确的是：",
    options: [
      "显著性水平 $\\alpha$ 表示当 $H_0$ 为真时拒绝 $H_0$ 的概率的下限。",
      "若 $\\alpha$ 减小，则 $\\beta$ 在样本量固定时也一定会减小。",
      "第一类错误是弃真，第二类错误是纳伪。",
      "在样本量不变时，可以同时减小 $\\alpha$ 和 $\\beta$。"
    ],
    answer: "C",
    solution: `
**逐项分析：**

- **A 错误**：$\\alpha$ 是弃真概率的**上限**，不是下限。

- **B 错误**：$n$ 固定时，$\\alpha$ 与 $\\beta$ **此消彼长**；$\\alpha$ 减小 $\\Rightarrow$ 拒绝域缩小 $\\Rightarrow$ $\\beta$ 增大。

- **C 正确**：第一类错误 = 弃真（$H_0$ 真却拒绝）；第二类错误 = 纳伪（$H_0$ 假却未拒绝）。

- **D 错误**：$n$ 固定时无法同时减小 $\\alpha$ 和 $\\beta$；需**增加样本量**才能同时降低。

**结论**：选 C。
`,
    hints: [
      "弃真 = 第一类 = $\\alpha$；纳伪 = 第二类 = $\\beta$。",
      "降低两类错误的途径是增加 $n$。"
    ],
    relatedFormulas: [
      "\\alpha = P(\\text{拒绝 } H_0 \\mid H_0 \\text{ 真}), \\quad \\beta = P(\\text{不拒绝 } H_0 \\mid H_0 \\text{ 假})"
    ],
    commonMistakes: [
      "混淆弃真与纳伪。",
      "认为减小 $\\alpha$ 会同时减小 $\\beta$。"
    ]
  },
  {
    id: "8.4-2",
    chapterId: 8,
    sectionId: "8.4",
    difficulty: "intermediate",
    type: "fill",
    tags: ["两类错误", "功效"],
    question: "检验的功效（power）定义为 $1-\\beta$，即当 $H_0$ 为________时，正确________ $H_0$ 的概率。",
    answer: "假 和 拒绝",
    solution: `
**功效 (Power) 定义：**
$$ \\text{Power} = 1 - \\beta = P(\\text{拒绝 } H_0 \\mid H_0 \\text{ 为假}) $$

即当原假设**为假**时，检验能够**正确拒绝** $H_0$ 的概率。

**填空**：第一空 **假**，第二空 **拒绝**。
`,
    hints: [
      "$\\beta$ 是 $H_0$ 假时仍不拒绝的概率，故 $1-\\beta$ 是 $H_0$ 假时拒绝的概率。",
      "功效越高，检验发现真实效应的能力越强。"
    ],
    relatedFormulas: [
      "Power = 1 - \\beta = P(\\text{拒绝 } H_0 \\mid H_1 \\text{ 为真})"
    ],
    commonMistakes: [
      "将功效理解为 $1-\\alpha$。",
      "将'拒绝'误写为'接受'。"
    ]
  },
  {
    id: "8.4-3",
    chapterId: 8,
    sectionId: "8.4",
    difficulty: "exam",
    type: "calculation",
    tags: ["两类错误", "Z检验", "功效"],
    question: "设 $X \\sim N(\\mu, 1)$，$n=25$，检验 $H_0: \\mu=0$ vs $H_1: \\mu=0.5$，$\\alpha=0.05$（右侧）。求 $\\beta$（当 $\\mu=0.5$ 时接受 $H_0$ 的概率）。已知 $z_{0.05}=1.645$，$\\Phi(0.645)\\approx 0.74$。",
    answer: "$\\beta \\approx 0.20$",
    solution: `
**第一步：确定拒绝域（在 $H_0: \\mu=0$ 下）**
$$ Z = \\frac{\\bar{X}}{1/\\sqrt{25}} = 5\\bar{X} \\ge z_{0.05} = 1.645 $$
即 $\\bar{X} \\ge 0.329$ 时拒绝 $H_0$，接受域为 $\\bar{X} < 0.329$。

**第二步：在 $H_1: \\mu=0.5$ 下 $\\bar{X}$ 的分布**
$$ \\bar{X} \\sim N(0.5, 1/25), \\quad \\sigma_{\\bar{X}} = 0.2 $$

**第三步：计算 $\\beta$**
$$ \\beta = P(\\bar{X} < 0.329 \\mid \\mu=0.5) = \\Phi\\left(\\frac{0.329-0.5}{0.2}\\right) = \\Phi(-0.855) \\approx 0.20 $$

**验证（功效公式）：**
$$ 1-\\beta = \\Phi\\left(\\frac{0.5}{0.2} - 1.645\\right) = \\Phi(2.5-1.645) = \\Phi(0.855) \\approx 0.80 $$

**结论**：$\\beta \\approx 0.20$，功效 $\\approx 0.80$。
`,
    hints: [
      "先求拒绝域（基于 $H_0$），再在 $H_1$ 下计算落入接受域的概率。",
      "$\\beta$ 是在 $H_1$ 为真时接受 $H_0$ 的概率。"
    ],
    relatedFormulas: [
      "\\beta = P(\\bar{X} \\in \\text{接受域} \\mid \\mu = \\mu_1)"
    ],
    commonMistakes: [
      "在 $H_0$ 下计算 $\\beta$。",
      "混淆 $\\alpha$ 与 $\\beta$ 的计算条件。"
    ]
  },
  {
    id: "8.4-4",
    chapterId: 8,
    sectionId: "8.4",
    difficulty: "exam",
    type: "choice",
    tags: ["两类错误", "样本量"],
    question: "在显著性水平 $\\alpha$ 固定时，下列哪种做法可以同时减小第一类错误概率 $\\alpha$ 和第二类错误概率 $\\beta$？",
    options: [
      "减小 $\\alpha$",
      "增大 $\\alpha$",
      "增加样本量 $n$",
      "改用更复杂的检验统计量"
    ],
    answer: "C",
    solution: `
**分析：**

- **A**：减小 $\\alpha$ 会使 $\\beta$ **增大**（此消彼长），不能同时减小。

- **B**：增大 $\\alpha$ 会使 $\\beta$ 减小，但 $\\alpha$ 本身增大，不能"同时减小"两类错误。

- **C 正确**：增加样本量 $n$ 可减小抽样误差，使拒绝域与真实分布分离更清晰，从而**同时**降低 $\\alpha$ 和 $\\beta$（在固定 $\\alpha$ 下 $\\beta$ 随 $n$ 增大而减小）。

- **D**：$n$ 固定时，改变统计量不能同时减小两类错误。

**结论**：选 C。
`,
    hints: [
      "$n$ 增大 $\\Rightarrow$ 标准误减小 $\\Rightarrow$ 检验功效提高 $\\Rightarrow$ $\\beta$ 减小。",
      "$\\alpha$ 与 $\\beta$ 在 $n$ 固定时此消彼长。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "认为减小 $\\alpha$ 能同时减小 $\\beta$。",
      "忽略样本量对两类错误的影响。"
    ]
  },
  {
    id: "8.4-5",
    chapterId: 8,
    sectionId: "8.4",
    difficulty: "challenge",
    type: "proof",
    tags: ["两类错误", "OC曲线"],
    question: "证明：在样本量 $n$ 和显著性水平 $\\alpha$ 固定时，对于同一检验问题，减小 $\\alpha$ 必然导致 $\\beta$ 增大（或不变）。",
    answer: "见解答",
    solution: `
**证明：**

设检验的拒绝域为 $W$，接受域（不拒绝域）为 $\\bar{W}$，且 $W \\cup \\bar{W}$ 为全样本空间。

**定义：**
$$ \\alpha = P(\\bar{X} \\in W \\mid H_0 \\text{ 为真}) $$
$$ \\beta = P(\\bar{X} \\in \\bar{W} \\mid H_1 \\text{ 为真}) $$

**当 $\\alpha$ 减小时**：为控制 $P(W \\mid H_0) \\le \\alpha$，拒绝域 $W$ **缩小**（或不变），即 $W' \\subseteq W$，接受域 $\\bar{W}' \\supseteq \\bar{W}$ 扩大。

**在 $H_1$ 为真时**：样本落入接受域 $\\bar{W}'$ 的概率
$$ P(\\bar{X} \\in \\bar{W}' \\mid H_1) \\ge P(\\bar{X} \\in \\bar{W} \\mid H_1) = \\beta $$

即 $\\beta' \\ge \\beta$。

**结论**：$\\alpha$ 减小 $\\Rightarrow$ 拒绝域缩小 $\\Rightarrow$ 接受域扩大 $\\Rightarrow$ 在 $H_1$ 下更易接受 $H_0$ $\\Rightarrow$ $\\beta$ 增大或不变。证毕。
`,
    hints: [
      "拒绝域与接受域互补，拒绝域缩小等价于接受域扩大。",
      "在 $H_1$ 下，接受域越大，纳伪概率越大。"
    ],
    relatedFormulas: [
      "\\alpha = P(W \\mid H_0), \\quad \\beta = P(\\bar{W} \\mid H_1)"
    ],
    commonMistakes: [
      "认为 $\\alpha$ 与 $\\beta$ 独立变化。",
      "未说明 $n$ 固定这一前提。"
    ]
  },

  // ========== 8.5 检验统计量与拒绝域 (4题) ==========
  {
    id: "8.5-1",
    chapterId: 8,
    sectionId: "8.5",
    difficulty: "basic",
    type: "choice",
    tags: ["检验统计量", "拒绝域"],
    question: "在正态总体均值检验中，当 $\\sigma^2$ 未知时，应选用下列哪个统计量？",
    options: [
      "$Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}$",
      "$t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}$",
      "$\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2}$",
      "$F = \\frac{S_1^2}{S_2^2}$"
    ],
    answer: "B",
    solution: `
**分析：**
- **A**：$\\sigma$ 已知时用 $Z$ 统计量。
- **B 正确**：$\\sigma^2$ 未知，用样本标准差 $S$ 代替，统计量 $t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1)$。
- **C**：用于方差检验，不是均值检验。
- **D**：用于两总体方差比较。

**结论**：选 B。
`,
    hints: [
      "均值检验：$\\sigma$ 已知 $\\Rightarrow$ $Z$；$\\sigma$ 未知 $\\Rightarrow$ $t$。",
      "方差检验用 $\\chi^2$，两样本方差比用 $F$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1)"
    ],
    commonMistakes: [
      "方差未知时仍用 $Z$ 检验。",
      "混淆均值检验与方差检验的统计量。"
    ]
  },
  {
    id: "8.5-2",
    chapterId: 8,
    sectionId: "8.5",
    difficulty: "intermediate",
    type: "fill",
    tags: ["拒绝域", "t检验", "单侧"],
    question: "对 $H_0: \\mu \\ge \\mu_0$ vs $H_1: \\mu < \\mu_0$，显著性水平 $\\alpha$，自由度 $n-1$，拒绝域为 $t$________$t_{\\alpha}(n-1)$。",
    answer: "\\le -",
    solution: `
**左侧检验**：备择假设 $\\mu < \\mu_0$，关心统计量取**左尾**极端值。

**拒绝域：**
$$ t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\le -t_{\\alpha}(n-1) $$

或等价写 $t \\le -t_{\\alpha}(n-1)$。

**填空**：$t$ **$\\le -$** $t_{\\alpha}(n-1)$（即 $t \\le -t_{\\alpha}(n-1)$）。

**说明**：左侧检验用左尾分位数，由于 $t$ 分布对称，$-t_{\\alpha}(n-1)$ 为左尾临界值。
`,
    hints: [
      "备择假设方向决定拒绝域在左尾还是右尾。",
      "$H_1: \\mu < \\mu_0$ 对应左尾拒绝域。"
    ],
    relatedFormulas: [
      "t \\le -t_{\\alpha}(n-1) \\text{（左侧检验）}"
    ],
    commonMistakes: [
      "左侧检验误用 $t \\ge t_{\\alpha}$。",
      "双侧检验误用 $t_{\\alpha/2}$。"
    ]
  },
  {
    id: "8.5-3",
    chapterId: 8,
    sectionId: "8.5",
    difficulty: "exam",
    type: "calculation",
    tags: ["拒绝域", "Z检验", "考试成绩"],
    question: "某地区高考数学平均分 historically 为 72 分，标准差 $\\sigma=12$ 已知。今年随机抽取 36 名考生，平均分 $\\bar{x}=75$。检验 $H_0: \\mu=72$ vs $H_1: \\mu \\neq 72$，$\\alpha=0.05$。（$z_{0.025}=1.96$）求 $Z$ 统计量、拒绝域并决策。",
    answer: "$Z=1.5$；拒绝域 $|Z|\\ge 1.96$；不拒绝 $H_0$。",
    solution: `
**第一步：统计量**
$$ Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}} = \\frac{75-72}{12/\\sqrt{36}} = \\frac{3}{2} = 1.5 $$

**第二步：拒绝域**
双侧，$\\alpha=0.05$：$|Z| \\ge z_{0.025} = 1.96$。

**第三步：决策**
$|Z| = 1.5 < 1.96$，未落入拒绝域，**不拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，无充分证据认为今年平均分与 72 有显著差异。
`,
    hints: [
      "$\\sigma$ 已知用 $Z$ 检验。",
      "双侧比较 $|Z|$ 与 $z_{0.025}$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}"
    ],
    commonMistakes: [
      "用 $s$ 代替 $\\sigma$ 做 $t$ 检验。",
      "单侧与双侧临界值混用。"
    ]
  },
  {
    id: "8.5-4",
    chapterId: 8,
    sectionId: "8.5",
    difficulty: "challenge",
    type: "proof",
    tags: ["拒绝域", "置信区间", "对偶关系"],
    question: "证明：在 $\\sigma^2$ 已知的正态总体双侧 $Z$ 检验中，在显著性水平 $\\alpha$ 下拒绝 $H_0: \\mu=\\mu_0$ 当且仅当 $\\mu_0$ 不在 $\\mu$ 的 $1-\\alpha$ 置信区间内。",
    answer: "见解答",
    solution: `
**证明：**

**置信区间**：$\\mu$ 的 $1-\\alpha$ 置信区间为
$$ \\left[\\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\; \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}\\right] $$

**拒绝 $H_0: \\mu=\\mu_0$** $\\Leftrightarrow$ $|Z| \\ge z_{\\alpha/2}$
$$ \\Leftrightarrow \\left|\\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}\\right| \\ge z_{\\alpha/2} $$
$$ \\Leftrightarrow |\\bar{X} - \\mu_0| \\ge z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} $$
$$ \\Leftrightarrow \\mu_0 \\le \\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\; \\text{或} \\; \\mu_0 \\ge \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} $$
$$ \\Leftrightarrow \\mu_0 \\notin \\left[\\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\; \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}\\right] $$

即 $\\mu_0$ 不在 $1-\\alpha$ 置信区间内。证毕。
`,
    hints: [
      "将 $|Z| \\ge z_{\\alpha/2}$ 化为 $\\mu_0$ 与 $\\bar{X}$ 的不等式。",
      "置信区间以 $\\bar{X}$ 为中心，检验判断 $\\mu_0$ 是否在其中。"
    ],
    relatedFormulas: [
      "\\text{拒绝 } H_0 \\iff \\mu_0 \\notin [\\bar{X} \\pm z_{\\alpha/2}\\sigma/\\sqrt{n}]"
    ],
    commonMistakes: [
      "混淆置信区间与接受域（接受域以 $\\mu_0$ 为中心）。",
      "单侧检验的对偶关系需单独讨论。"
    ]
  },

  // ========== 8.6 p值与统计显著性 (5题) ==========
  {
    id: "8.6-1",
    chapterId: 8,
    sectionId: "8.6",
    difficulty: "basic",
    type: "choice",
    tags: ["p值", "定义"],
    question: "关于 $p$ 值，下列说法正确的是：",
    options: [
      "$p$ 值是原假设 $H_0$ 为真的概率。",
      "$p$ 值是在 $H_0$ 为真的前提下，观测到当前或更极端数据的概率。",
      "$p$ 值越小，$H_0$ 越可能为真。",
      "若 $p=0.03$，则 $H_0$ 为假的概率是 97%。"
    ],
    answer: "B",
    solution: `
**逐项分析：**

- **A 错误**：$p$ 值不是 $P(H_0 \\text{ 真})$，而是 $P(\\text{数据} \\mid H_0)$。

- **B 正确**：$p$ 值定义即在 $H_0$ 下，得到当前或更极端结果的概率。

- **C 错误**：$p$ 越小，越有理由**怀疑** $H_0$，而非 $H_0$ 越可能为真。

- **D 错误**：$p$ 值不能转换为 $H_0$ 为假的概率（贝叶斯后验需先验）。

**结论**：选 B。
`,
    hints: [
      "$p$ 值是条件概率 $P(\\text{数据} \\mid H_0)$。",
      "拒绝规则：$p \\le \\alpha$ 则拒绝 $H_0$。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "将 $p$ 值理解为 $H_0$ 为真的概率。",
      "认为 $p=0.03$ 意味着 97% 确信 $H_0$ 为假。"
    ]
  },
  {
    id: "8.6-2",
    chapterId: 8,
    sectionId: "8.6",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["p值", "Z检验"],
    question: "设 $Z$ 检验统计量观测值 $z=2.33$（双侧）。求 $p$ 值，并判断在 $\\alpha=0.05$ 和 $\\alpha=0.01$ 下是否拒绝 $H_0$。（$\\Phi(2.33)\\approx 0.9901$）",
    answer: "$p \\approx 0.02$；$\\alpha=0.05$ 拒绝，$\\alpha=0.01$ 不拒绝。",
    solution: `
**双侧 p 值：**
$$ p = 2 P(Z \\ge |z|) = 2 P(Z \\ge 2.33) = 2[1 - \\Phi(2.33)] $$
$$ = 2(1 - 0.9901) = 2 \\times 0.0099 = 0.0198 \\approx 0.02 $$

**决策：**
- $\\alpha=0.05$：$p=0.02 < 0.05$，**拒绝** $H_0$。
- $\\alpha=0.01$：$p=0.02 > 0.01$，**不拒绝** $H_0$。

**结论**：$p \\approx 0.02$；仅在 $\\alpha=0.05$ 下拒绝。
`,
    hints: [
      "双侧 p 值 = 2 × 单侧尾概率。",
      "比较 $p$ 与 $\\alpha$，而非 $z$ 与 $z_{\\alpha/2}$ 单独决策（等价但 p 值更信息丰富）。"
    ],
    relatedFormulas: [
      "p = 2[1-\\Phi(|z|)] \\text{（双侧）}"
    ],
    commonMistakes: [
      "双侧检验只算单侧 p 值。",
      "用 $p=1-\\Phi(2.33)$ 而非 $2[1-\\Phi(2.33)]$。"
    ]
  },
  {
    id: "8.6-3",
    chapterId: 8,
    sectionId: "8.6",
    difficulty: "exam",
    type: "fill",
    tags: ["p值", "t检验"],
    question: "某 $t$ 检验中 $t=2.5$，$df=20$，双侧检验。若 $t_{0.025}(20)=2.086$，则 $p$________$0.05$，在 $\\alpha=0.05$ 下应________$H_0$。",
    answer: "< 和 拒绝",
    solution: `
**分析：**
$|t| = 2.5 > t_{0.025}(20) = 2.086$，说明 p 值 $< 0.05$（因 $p \\le \\alpha$ 当且仅当 $|t| \\ge t_{\\alpha/2}$）。

**填空：**
- 第一空：**$<$**（$p < 0.05$）
- 第二空：**拒绝**

**验证**：$|t| > t_{0.025}$ $\\Leftrightarrow$ $p < 0.05$ $\\Leftrightarrow$ 在 $\\alpha=0.05$ 下拒绝 $H_0$。
`,
    hints: [
      "$|t| \\ge t_{\\alpha/2}$ 等价于 $p \\le \\alpha$。",
      "无需精确算 p 值，比较 $|t|$ 与临界值即可。"
    ],
    relatedFormulas: [
      "p \\le \\alpha \\iff |t| \\ge t_{\\alpha/2}(n-1)"
    ],
    commonMistakes: [
      "认为 $t=2.5$ 时 $p=0.05$ 精确成立。",
      "双侧检验用 $t_{0.05}$ 而非 $t_{0.025}$。"
    ]
  },
  {
    id: "8.6-4",
    chapterId: 8,
    sectionId: "8.6",
    difficulty: "exam",
    type: "calculation",
    tags: ["p值", "单侧", "药物效果"],
    question: "新药试验：100 名患者 72 人治愈，历史治愈率 $p_0=0.60$。检验 $H_0: p=0.60$ vs $H_1: p>0.60$。计算 $Z$ 统计量及单侧 $p$ 值，$\\alpha=0.05$ 下是否拒绝？（$\\Phi(2.45)\\approx 0.9932$）",
    answer: "$Z\\approx 2.45$；$p\\approx 0.007$；拒绝 $H_0$。",
    solution: `
**第一步：样本比例**
$$ \\hat{p} = 72/100 = 0.72 $$

**第二步：$Z$ 统计量**
$$ Z = \\frac{0.72-0.60}{\\sqrt{0.60 \\times 0.40 / 100}} = \\frac{0.12}{0.0490} \\approx 2.45 $$

**第三步：单侧 p 值**
$$ p = P(Z \\ge 2.45) = 1 - \\Phi(2.45) = 1 - 0.9932 = 0.0068 \\approx 0.007 $$

**第四步：决策**
$p = 0.007 < 0.05$，**拒绝** $H_0$。

**结论**：有证据表明新药提高了治愈率。
`,
    hints: [
      "右侧检验 p 值 = $P(Z \\ge z_{\\text{obs}})$。",
      "大样本比例检验用正态近似。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\hat{p}-p_0}{\\sqrt{p_0(1-p_0)/n}}"
    ],
    commonMistakes: [
      "双侧检验误用 $2[1-\\Phi(2.45)]$。",
      "分母用 $\\hat{p}$ 而非 $p_0$。"
    ]
  },
  {
    id: "8.6-5",
    chapterId: 8,
    sectionId: "8.6",
    difficulty: "challenge",
    type: "choice",
    tags: ["p值", "统计显著", "实际意义"],
    question: "某大型调查 $n=10000$，检验 $H_0: \\mu=100$ vs $H_1: \\mu \\neq 100$，得 $\\bar{x}=100.05$，$p=0.001$。下列说法最恰当的是：",
    options: [
      "因为 $p$ 很小，均值差异 0.05 一定有重要实际意义。",
      "因为 $p$ 很小，可以证明 $\\mu=100.05$。",
      "统计显著但效应量很小，需结合专业判断实际意义。",
      "$p=0.001$ 说明 $H_0$ 为真的概率是 0.001。"
    ],
    answer: "C",
    solution: `
**分析：**
- 大样本下，微小差异 $\\bar{x}-100=0.05$ 也可能 $p$ 极小（标准误 $\\sigma/\\sqrt{10000}$ 很小）。
- **统计显著** $\\neq$ **实际重要**。
- $p$ 值不是 $P(H_0 \\text{ 真})$，也不能"证明" $\\mu=100.05$。

**C 正确**：应报告效应量（如 Cohen's d）并结合领域知识判断 0.05 的差异是否有意义。

**结论**：选 C。
`,
    hints: [
      "大样本 $\\Rightarrow$ 小 p 值易获得。",
      "同时报告 p 值与效应量。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "认为 $p$ 小就等于效应大。",
      "将 p 值误解为 $H_0$ 为真的概率。"
    ]
  },

  // ========== 8.7 正态总体均值的Z检验 (7题) ==========
  {
    id: "8.7-1",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "basic",
    type: "choice",
    tags: ["Z检验", "适用条件"],
    question: "单个正态总体均值的 $Z$ 检验适用于：",
    options: [
      "$\\sigma^2$ 未知，$n$ 充分大",
      "$\\sigma^2$ 已知，总体正态或 $n$ 充分大",
      "$\\sigma^2$ 未知，$n$ 较小",
      "任意分布，$n$ 任意"
    ],
    answer: "B",
    solution: `
**$Z$ 检验条件：**
- $\\sigma^2$ **已知**
- 总体正态，或大样本下中心极限定理近似

**选项分析：**
- A：$\\sigma^2$ 未知应使用 $t$ 检验（或小样本时 $t$）。
- **B 正确**。
- C：$\\sigma^2$ 未知、小样本 $\\Rightarrow$ $t$ 检验。
- D：小样本非正态不能用 $Z$。

**结论**：选 B。
`,
    hints: [
      "$\\sigma$ 已知 $\\Rightarrow$ $Z$；未知 $\\Rightarrow$ $t$。",
      "大样本时可对非正态用 $Z$ 近似（若 $\\sigma$ 已知或用 $s$ 近似）。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}} \\sim N(0,1)"
    ],
    commonMistakes: [
      "方差未知时仍用 $Z$ 检验。",
      "小样本非正态总体用 $Z$ 检验。"
    ]
  },
  {
    id: "8.7-2",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["Z检验", "双侧", "生产精度"],
    question: "机床加工零件直径 $X \\sim N(\\mu, 0.04)$，即 $\\sigma=0.2$ mm。抽取 25 件，$\\bar{x}=50.08$ mm。检验 $H_0: \\mu=50$ vs $H_1: \\mu \\neq 50$，$\\alpha=0.05$。（$z_{0.025}=1.96$）",
    answer: "拒绝 $H_0$（$Z=2.0$）",
    solution: `
**第一步：统计量**
$$ Z = \\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}} = \\frac{50.08-50}{0.2/\\sqrt{25}} = \\frac{0.08}{0.04} = 2.0 $$

**第二步：拒绝域**
双侧：$|Z| \\ge 1.96$。

**第三步：决策**
$|Z| = 2.0 > 1.96$，落入拒绝域，**拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，认为机床存在系统偏差。
`,
    hints: [
      "$\\sigma=0.2$ 已知，用 $Z$ 检验。",
      "$\\sigma/\\sqrt{n} = 0.2/5 = 0.04$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}"
    ],
    commonMistakes: [
      "误用 $\\sigma^2=0.04$ 作为 $\\sigma$ 代入。",
      "边界值 $Z=2.0$ 与 $1.96$ 比较时出错。"
    ]
  },
  {
    id: "8.7-3",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "exam",
    type: "calculation",
    tags: ["Z检验", "单侧", "合金强度"],
    question: "某合金标准抗拉强度 $\\mu_0=520$ MPa，$\\sigma=15$ MPa。新工艺 16 件样本，$\\bar{x}=528$ MPa。检验新工艺是否显著提高强度，$\\alpha=0.05$。（$z_{0.05}=1.645$）",
    answer: "拒绝 $H_0$，新工艺显著提高强度（$Z\\approx 2.13$）",
    solution: `
**假设：**
$$ H_0: \\mu \\le 520, \\quad H_1: \\mu > 520 $$

**统计量：**
$$ Z = \\frac{528-520}{15/\\sqrt{16}} = \\frac{8}{3.75} \\approx 2.13 $$

**拒绝域：** $Z \\ge 1.645$

**决策：** $2.13 > 1.645$，**拒绝 $H_0$**。

**结论**：新工艺抗拉强度有显著提高。
`,
    hints: [
      "'提高' $\\Rightarrow$ 右侧检验。",
      "$n=16$，$\\sigma/\\sqrt{n}=15/4=3.75$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}"
    ],
    commonMistakes: [
      "双侧检验用 $z_{0.025}=1.96$。",
      "备择假设方向写反。"
    ]
  },
  {
    id: "8.7-4",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "exam",
    type: "fill",
    tags: ["Z检验", "临界值"],
    question: "双侧 $Z$ 检验，$\\alpha=0.01$，拒绝域为 $|Z| \\ge$________。$z_{0.005} \\approx$________。",
    answer: "z_{0.005} 和 2.576",
    solution: `
**双侧 $\\alpha=0.01$**：每侧 $\\alpha/2=0.005$。

**拒绝域：** $|Z| \\ge z_{0.005} \\approx 2.576$

**答案**：$z_{0.005}$ 和 **2.576**。
`,
    hints: [
      "双侧用 $\\alpha/2$ 查表。",
      "$z_{0.005} \\approx 2.576$，$z_{0.025} \\approx 1.96$。"
    ],
    relatedFormulas: [
      "|Z| \\ge z_{\\alpha/2}"
    ],
    commonMistakes: [
      "用 $z_{0.01}=2.326$ 代替 $z_{0.005}$。",
      "单侧与双侧分位数混淆。"
    ]
  },
  {
    id: "8.7-5",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["Z检验", "左侧检验"],
    question: "灯泡寿命 $X \\sim N(\\mu, 100)$，$\\sigma=10$。厂家声称 $\\mu \\ge 1000$ 小时。抽检 50 只，$\\bar{x}=990$。检验声称是否成立，$\\alpha=0.05$。（$z_{0.05}=1.645$）",
    answer: "拒绝 $H_0$（$Z\\approx -7.07$）",
    solution: `
**假设（检验声称是否成立，即是否 $\\mu \\ge 1000$）：**
$$ H_0: \\mu \\ge 1000, \\quad H_1: \\mu < 1000 $$

**统计量（在边界 $\\mu=1000$ 下）：**
$$ Z = \\frac{\\bar{x}-1000}{\\sigma/\\sqrt{n}} = \\frac{990-1000}{10/\\sqrt{50}} = \\frac{-10}{1.414} \\approx -7.07 $$

**左侧拒绝域：** $Z \\le -z_{0.05} = -1.645$

**决策：** $-7.07 < -1.645$，**拒绝 $H_0$**。

**结论**：样本不支持厂家声称（寿命不低于 1000 小时）。
`,
    hints: [
      "检验'声称成立' $\\Rightarrow$ $H_0$ 为声称内容 $\\mu \\ge 1000$。",
      "左侧检验拒绝域 $Z \\le -z_{\\alpha}$。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}"
    ],
    commonMistakes: [
      "将 $H_0$ 与 $H_1$ 颠倒。",
      "左侧检验误用 $Z \\ge 1.645$。"
    ]
  },
  {
    id: "8.7-6",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "challenge",
    type: "proof",
    tags: ["Z检验", "正态性"],
    question: "证明：设 $X_1,\\ldots,X_n$ 来自 $N(\\mu,\\sigma^2)$，$\\sigma^2$ 已知。在 $H_0: \\mu=\\mu_0$ 下，$Z=\\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}} \\sim N(0,1)$。",
    answer: "见解答",
    solution: `
**证明：**

由正态总体性质，$\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$。

在 $H_0: \\mu=\\mu_0$ 下：
$$ \\bar{X} \\sim N\\left(\\mu_0, \\frac{\\sigma^2}{n}\\right) $$

标准化：
$$ Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}} = \\frac{\\bar{X} - \\mu_0}{\\sqrt{\\sigma^2/n}} \\sim N(0, 1) $$

**结论**：在 $H_0$ 下 $Z \\sim N(0,1)$，与 $n$ 大小无关（精确分布，非渐近）。证毕。
`,
    hints: [
      "样本均值服从正态分布。",
      "标准化：$(X-\\mu)/\\sigma \\sim N(0,1)$。"
    ],
    relatedFormulas: [
      "\\bar{X} \\sim N(\\mu, \\sigma^2/n)"
    ],
    commonMistakes: [
      "认为必须 $n$ 很大才近似正态。",
      "分母误用 $\\sigma$ 而非 $\\sigma/\\sqrt{n}$。"
    ]
  },
  {
    id: "8.7-7",
    chapterId: 8,
    sectionId: "8.7",
    difficulty: "exam",
    type: "choice",
    tags: ["Z检验", "边界"],
    question: "设 $Z$ 检验中 $Z=1.96$，$\\alpha=0.05$ 双侧。下列正确的是：",
    options: [
      "不拒绝 $H_0$，因 $Z=1.96$ 未超过临界值",
      "拒绝 $H_0$，因 $Z=1.96$ 等于临界值，属于拒绝域",
      "无法判断",
      "应改用 $t$ 检验"
    ],
    answer: "B",
    solution: `
**拒绝域**：$|Z| \\ge z_{0.025} = 1.96$（**大于等于**）。

**$Z=1.96$**：$|Z| = 1.96 \\ge 1.96$，**落入拒绝域**，拒绝 $H_0$。

**结论**：选 B。注意拒绝域是 $\\ge$，边界值属于拒绝域。
`,
    hints: [
      "拒绝域通常为 $\\ge$ 或 $\\le$，边界包含在内。",
      "$|Z|=1.96$ 时 $p=0.05$ 精确成立。"
    ],
    relatedFormulas: [
      "|Z| \\ge z_{\\alpha/2}"
    ],
    commonMistakes: [
      "认为必须严格 $>$ 临界值才拒绝。",
      "边界值误判为接受域。"
    ]
  },

  // ========== 8.8 正态总体均值的t检验 (7题) ==========
  {
    id: "8.8-1",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "basic",
    type: "choice",
    tags: ["t检验", "适用条件"],
    question: "当 $\\sigma^2$ 未知时，单个正态总体均值检验应使用：",
    options: [
      "$Z$ 检验",
      "$t$ 检验，$df=n$",
      "$t$ 检验，$df=n-1$",
      "$\\chi^2$ 检验"
    ],
    answer: "C",
    solution: `
**$t$ 检验**：$\\sigma^2$ 未知，用 $S^2$ 估计，统计量
$$ t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1) $$

**自由度** $df = n-1$，不是 $n$。

**结论**：选 C。
`,
    hints: [
      "用 $S$ 代替 $\\sigma$ 损失一个自由度。",
      "$df = n-1$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1)"
    ],
    commonMistakes: [
      "自由度用 $n$ 而非 $n-1$。",
      "$\\sigma$ 未知仍用 $Z$ 检验。"
    ]
  },
  {
    id: "8.8-2",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "exam",
    type: "calculation",
    tags: ["t检验", "合金钢", "单侧"],
    question: "合金钢抗拉强度 $X \\sim N(\\mu,\\sigma^2)$，$n=10$，$\\bar{x}=53.6$，$s=2.2$，原工艺 $\\mu_0=52.0$。检验新工艺是否显著提高，$\\alpha=0.05$。（$t_{0.05}(9)=1.8331$）",
    answer: "拒绝 $H_0$，显著提高（$t\\approx 2.30$）",
    solution: `
**假设：**
$$ H_0: \\mu \\le 52.0, \\quad H_1: \\mu > 52.0 $$

**统计量：**
$$ t = \\frac{53.6-52.0}{2.2/\\sqrt{10}} = \\frac{1.6}{0.6957} \\approx 2.30 $$

**拒绝域：** $t \\ge t_{0.05}(9) = 1.8331$

**决策：** $2.30 > 1.8331$，**拒绝 $H_0$**。

**结论**：新工艺抗拉强度显著提高。
`,
    hints: [
      "方差未知 $\\Rightarrow$ $t$ 检验，$df=9$。",
      "右侧检验用 $t_{0.05}(9)$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1)"
    ],
    commonMistakes: [
      "错用双侧 $t_{0.025}(9)=2.2622$。",
      "分母忘记 $\\sqrt{n}$。"
    ]
  },
  {
    id: "8.8-3",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["t检验", "双侧", "考试成绩"],
    question: "16 名学生培训后成绩，$\\bar{x}=78$，$s=8$。历史平均 $\\mu_0=72$。检验培训是否有效（成绩有变化），$\\alpha=0.05$。（$t_{0.025}(15)=2.1314$）",
    answer: "拒绝 $H_0$（$t=3.0$）",
    solution: `
**假设：**
$$ H_0: \\mu = 72, \\quad H_1: \\mu \\neq 72 $$

**统计量：**
$$ t = \\frac{78-72}{8/\\sqrt{16}} = \\frac{6}{2} = 3.0 $$

**拒绝域：** $|t| \\ge t_{0.025}(15) = 2.1314$

**决策：** $|3.0| > 2.1314$，**拒绝 $H_0$**。

**结论**：培训对成绩有显著影响。
`,
    hints: [
      "'有变化' $\\Rightarrow$ 双侧检验。",
      "$df=15$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}"
    ],
    commonMistakes: [
      "单侧与双侧临界值混用。",
      "$s/\\sqrt{n} = 8/4 = 2$。"
    ]
  },
  {
    id: "8.8-4",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "exam",
    type: "fill",
    tags: ["t检验", "自由度"],
    question: "样本量 $n=20$，$t$ 检验的自由度为________，双侧 $\\alpha=0.05$ 的临界值为 $t_{0.025}($________$)$。",
    answer: "19 和 19",
    solution: `
**自由度：** $df = n - 1 = 20 - 1 = 19$

**双侧临界值：** $t_{0.025}(19)$

**答案**：19 和 19。
`,
    hints: [
      "$t$ 分布自由度恒为 $n-1$。",
      "双侧用 $\\alpha/2=0.025$。"
    ],
    relatedFormulas: [
      "df = n-1"
    ],
    commonMistakes: [
      "自由度写 20。",
      "用 $t_{0.05}(19)$ 做双侧检验。"
    ]
  },
  {
    id: "8.8-5",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["t检验", "左侧"],
    question: "某电池寿命 $n=12$，$\\bar{x}=480$ h，$s=40$ h。国家标准 $\\mu_0=500$ h。检验是否达标（寿命不低于标准），$\\alpha=0.05$。（$t_{0.05}(11)=1.7959$）",
    answer: "不拒绝 $H_0$（$t\\approx -1.73$）",
    solution: `
**假设（检验是否达标 $\\mu \\ge 500$）：**
$$ H_0: \\mu \\ge 500, \\quad H_1: \\mu < 500 $$

**统计量：**
$$ t = \\frac{480-500}{40/\\sqrt{12}} = \\frac{-20}{11.55} \\approx -1.73 $$

**左侧拒绝域：** $t \\le -t_{0.05}(11) = -1.7959$

**决策：** $-1.73 > -1.7959$，未落入拒绝域，**不拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，无充分统计证据断定电池未达标（尽管样本均值低于标准，但未达到显著性水平）。
`,
    hints: [
      "左侧检验 $t \\le -t_{\\alpha}(n-1)$。",
      "注意 $-1.73 > -1.7959$ 表示 t 未足够小。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}"
    ],
    commonMistakes: [
      "左侧检验符号搞反。",
      "认为 $\\bar{x}<\\mu_0$ 就一定拒绝 $H_0: \\mu \\ge \\mu_0$。"
    ]
  },
  {
    id: "8.8-6",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "challenge",
    type: "calculation",
    tags: ["t检验", "边界", "考研风格"],
    question: "设 $t$ 检验 $H_0: \\mu=10$ vs $H_1: \\mu \\neq 10$，$n=11$，$\\bar{x}=11$，$s=\\sqrt{3.6}$。$\\alpha=0.05$，$t_{0.025}(10)=2.228$。求 $t$ 值并决策。",
    answer: "不拒绝 $H_0$（$t\\approx 1.75$）",
    solution: `
**已知：** $s = \\sqrt{3.6} \\approx 1.897$，$n=11$，$df=10$。

**统计量：**
$$ t = \\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}} = \\frac{11-10}{\\sqrt{3.6/11}} = \\frac{1}{\\sqrt{0.3273}} \\approx \\frac{1}{0.572} \\approx 1.75 $$

**拒绝域（双侧）：** $|t| \\ge t_{0.025}(10) = 2.228$

**决策：** $|1.75| = 1.75 < 2.228$，未落入拒绝域，**不拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，无充分证据认为 $\\mu \\neq 10$。
`,
    hints: [
      "注意 $s$ 是标准差还是方差。",
      "边界附近需精确计算。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}"
    ],
    commonMistakes: [
      "将 $s^2=3.6$ 直接当 $s$ 用。",
      "自由度用 11。"
    ]
  },
  {
    id: "8.8-7",
    chapterId: 8,
    sectionId: "8.8",
    difficulty: "exam",
    type: "choice",
    tags: ["t检验", "Z检验", "选择错误"],
    question: "下列哪种情况**不应**使用 $t$ 检验？",
    options: [
      "$n=15$，$\\sigma^2$ 未知，总体正态",
      "$n=30$，$\\sigma^2$ 未知，总体正态",
      "$n=50$，$\\sigma=5$ 已知，总体正态",
      "$n=8$，$\\sigma^2$ 未知，总体正态"
    ],
    answer: "C",
    solution: `
**$t$ 检验**：$\\sigma^2$ **未知**时用。

**选项 C**：$\\sigma=5$ **已知**，应使用 **$Z$ 检验**，不应使用 $t$ 检验。

**A、B、D**：$\\sigma^2$ 未知，均应用 $t$ 检验。

**结论**：选 C。
`,
    hints: [
      "$\\sigma$ 已知 $\\Rightarrow$ $Z$；未知 $\\Rightarrow$ $t$。",
      "大样本 $n=30$ 时 $\\sigma$ 未知仍用 $t$（或近似 $Z$ 但严格应用 $t$）。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "认为大样本就必须用 $Z$。",
      "$\\sigma$ 已知时仍用 $t$。"
    ]
  },

  // ========== 8.9 两个正态总体均值的比较 (6题) ==========
  {
    id: "8.9-1",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "basic",
    type: "choice",
    tags: ["两样本t检验", "独立样本"],
    question: "比较两个独立正态总体均值，$\\sigma_1^2, \\sigma_2^2$ 均未知但相等时，应使用：",
    options: [
      "合并方差的 $t$ 检验",
      "Welch 近似 $t$ 检验",
      "$Z$ 检验",
      "配对 $t$ 检验"
    ],
    answer: "A",
    solution: `
**两独立样本，方差未知但相等（方差齐性）**：使用**合并方差**的 $t$ 检验：
$$ t = \\frac{\\bar{X}-\\bar{Y}}{S_p\\sqrt{1/n_1+1/n_2}}, \\quad df = n_1+n_2-2 $$

**B**：方差不等时用 Welch 检验。
**C**：$\\sigma$ 已知时用 $Z$。
**D**：配对数据用配对 $t$。

**结论**：选 A。
`,
    hints: [
      "先检验方差齐性（$F$ 检验），再选合并 $t$ 或 Welch $t$。",
      "独立样本 vs 配对样本。"
    ],
    relatedFormulas: [
      "S_p^2 = \\frac{(n_1-1)S_1^2+(n_2-1)S_2^2}{n_1+n_2-2}"
    ],
    commonMistakes: [
      "方差不等仍用合并 $t$ 检验。",
      "独立样本误用配对 $t$。"
    ]
  },
  {
    id: "8.9-2",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "exam",
    type: "calculation",
    tags: ["两样本t检验", "药物对比"],
    question: "A 药 $n_1=12$，$\\bar{x}_1=85$，$s_1^2=20$；B 药 $n_2=15$，$\\bar{x}_2=78$，$s_2^2=24$。检验 $H_0: \\mu_1=\\mu_2$ vs $H_1: \\mu_1 \\neq \\mu_2$，$\\alpha=0.05$。（$t_{0.025}(25)=2.060$）",
    answer: "拒绝 $H_0$（$t\\approx 3.84$）",
    solution: `
**第一步：合并方差**
$$ S_p^2 = \\frac{11 \\times 20 + 14 \\times 24}{25} = \\frac{220+336}{25} = \\frac{556}{25} = 22.24 $$
$$ S_p = \\sqrt{22.24} \\approx 4.716 $$

**第二步：$t$ 统计量**
$$ t = \\frac{85-78}{4.716 \\times \\sqrt{1/12+1/15}} = \\frac{7}{4.716 \\times \\sqrt{0.150}} = \\frac{7}{4.716 \\times 0.387} \\approx \\frac{7}{1.825} \\approx 3.84 $$

其中 $\\sqrt{1/12+1/15} = \\sqrt{0.0833+0.0667} = \\sqrt{0.15} \\approx 0.387$。

**第三步：拒绝域**
双侧检验，$|t| \\ge t_{0.025}(25) = 2.060$。

**第四步：决策**
$|3.84| > 2.060$，落入拒绝域，**拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，两药疗效有显著差异。
`,
    hints: [
      "合并方差 $S_p^2$ 的公式。",
      "$df = n_1+n_2-2 = 25$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}-\\bar{Y}}{S_p\\sqrt{1/n_1+1/n_2}}"
    ],
    commonMistakes: [
      "忘记 $\\sqrt{1/n_1+1/n_2}$ 因子。",
      "自由度用 $n_1+n_2$ 而非 $n_1+n_2-2$。"
    ]
  },
  {
    id: "8.9-3",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["两样本Z检验", "已知方差"],
    question: "设备 A：$n_1=20$，$\\bar{x}_1=50$，$\\sigma_1=3$；设备 B：$n_2=25$，$\\bar{x}_2=48$，$\\sigma_2=4$。检验均值是否相等，$\\alpha=0.05$。（$z_{0.025}=1.96$）",
    answer: "不拒绝 $H_0$（$Z\\approx 1.92$）",
    solution: `
**两样本 $Z$ 检验（$\\sigma$ 已知）：**
$$ Z = \\frac{\\bar{X}_1-\\bar{X}_2}{\\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}} = \\frac{50-48}{\\sqrt{9/20 + 16/25}} $$

$$ = \\frac{2}{\\sqrt{0.45 + 0.64}} = \\frac{2}{\\sqrt{1.09}} = \\frac{2}{1.044} \\approx 1.92 $$

**拒绝域：** $|Z| \\ge 1.96$

**决策：** $|Z| = 1.92 < 1.96$，**不拒绝 $H_0$**（接近临界值，但未落入拒绝域）。

**结论**：无充分证据认为两设备均值有显著差异。
`,
    hints: [
      "两样本 $Z$ 检验分母为 $\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}$。",
      "接近边界 1.96 时需精确计算。"
    ],
    relatedFormulas: [
      "Z = \\frac{\\bar{X}_1-\\bar{X}_2}{\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}}"
    ],
    commonMistakes: [
      "分母误用 $\\sigma_1/\\sqrt{n_1}+\\sigma_2/\\sqrt{n_2}$。",
      "$\\sigma$ 未知时仍用此公式。"
    ]
  },
  {
    id: "8.9-4",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "exam",
    type: "fill",
    tags: ["两样本t检验", "自由度"],
    question: "两独立样本 $n_1=8$，$n_2=10$，合并方差 $t$ 检验的自由度为________。",
    answer: "16",
    solution: `
**合并方差 $t$ 检验自由度：**
$$ df = n_1 + n_2 - 2 = 8 + 10 - 2 = 16 $$

**答案**：16。
`,
    hints: [
      "$df = n_1 + n_2 - 2$。",
      "不是 $n_1+n_2$ 或 $(n_1-1)(n_2-1)$。"
    ],
    relatedFormulas: [
      "df = n_1 + n_2 - 2"
    ],
    commonMistakes: [
      "自由度写 18 或 17。",
      "Welch 检验自由度公式与合并 $t$ 不同。"
    ]
  },
  {
    id: "8.9-5",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "challenge",
    type: "calculation",
    tags: ["两样本", "方差不等", "Welch"],
    question: "甲班 $n_1=6$，$\\bar{x}_1=72$，$s_1^2=16$；乙班 $n_2=9$，$\\bar{x}_2=68$，$s_2^2=9$。方差可能不等，用 Welch 检验 $H_0: \\mu_1=\\mu_2$，$\\alpha=0.05$。（$t_{0.025}(10)\\approx 2.228$）",
    answer: "不拒绝 $H_0$（$t\\approx 2.0$，$df\\approx 10$）",
    solution: `
**Welch $t$ 统计量：**
$$ t = \\frac{72-68}{\\sqrt{16/6 + 9/9}} = \\frac{4}{\\sqrt{2.667+1}} = \\frac{4}{\\sqrt{3.667}} \\approx \\frac{4}{1.915} \\approx 2.09 $$

**Welch 自由度（近似）：**
$$ df = \\frac{(s_1^2/n_1+s_2^2/n_2)^2}{\\frac{(s_1^2/n_1)^2}{n_1-1}+\\frac{(s_2^2/n_2)^2}{n_2-1}} $$

分子 $(16/6+1)^2 = (3.667)^2 = 13.44$
分母 $\\frac{(2.667)^2}{5}+\\frac{1^2}{8} = \\frac{7.11}{5}+0.125 = 1.422+0.125 = 1.547$
$df \\approx 13.44/1.547 \\approx 8.7$，取 $df \\approx 9$。

**临界值** $t_{0.025}(9) \\approx 2.262$，$|t|=2.09 < 2.262$，**不拒绝 $H_0$**。
`,
    hints: [
      "方差不等时用 Welch，不用合并 $t$。",
      "Welch 自由度需公式计算。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{X}_1-\\bar{X}_2}{\\sqrt{s_1^2/n_1+s_2^2/n_2}}"
    ],
    commonMistakes: [
      "方差不等仍用合并方差。",
      "Welch 自由度误用 $n_1+n_2-2$。"
    ]
  },
  {
    id: "8.9-6",
    chapterId: 8,
    sectionId: "8.9",
    difficulty: "exam",
    type: "choice",
    tags: ["检验选择", "独立vs配对"],
    question: "要比较两种教学方法对**同一批**学生的效果，应使用：",
    options: [
      "独立样本 $t$ 检验",
      "配对样本 $t$ 检验",
      "两样本 $Z$ 检验",
      "$F$ 检验"
    ],
    answer: "B",
    solution: `
**同一批学生** $\\Rightarrow$ 数据**配对**（每名学生在两种方法下各测一次）。

应使用**配对 $t$ 检验**：对差值 $D_i = X_i - Y_i$ 做单样本 $t$ 检验。

**A**：独立样本要求两组被试不同。
**C**：需 $\\sigma$ 已知，且为独立样本。
**D**：$F$ 检验用于方差比较。

**结论**：选 B。
`,
    hints: [
      "同一对象前后/两种条件 $\\Rightarrow$ 配对。",
      "不同对象两组 $\\Rightarrow$ 独立样本。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "配对数据误用独立样本 $t$ 检验。",
      "忽略数据的相关性。"
    ]
  },

  // ========== 8.10 配对样本t检验 (5题) ==========
  {
    id: "8.10-1",
    chapterId: 8,
    sectionId: "8.10",
    difficulty: "basic",
    type: "choice",
    tags: ["配对t检验", "适用条件"],
    question: "配对 $t$ 检验的本质是：",
    options: [
      "对两个独立样本分别检验后合并结论",
      "对差值 $D_i = X_i - Y_i$ 做单样本 $t$ 检验",
      "对 $X_i$ 和 $Y_i$ 分别做 $t$ 检验",
      "用 $F$ 检验判断能否使用配对 $t$"
    ],
    answer: "B",
    solution: `
**配对 $t$ 检验**：计算 $D_i = X_i - Y_i$，对 $\\mu_D$ 检验：
$$ t = \\frac{\\bar{D} - \\mu_{D0}}{S_D/\\sqrt{n}} \\sim t(n-1) $$

即转化为**单样本 $t$ 检验**（对差值）。

**结论**：选 B。
`,
    hints: [
      "配对检验 = 差值的单样本 $t$ 检验。",
      "消除个体间差异，提高功效。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{D}-\\mu_{D0}}{S_D/\\sqrt{n}}"
    ],
    commonMistakes: [
      "对原始两组数据做独立 $t$ 检验。",
      "忘记先求差值。"
    ]
  },
  {
    id: "8.10-2",
    chapterId: 8,
    sectionId: "8.10",
    difficulty: "exam",
    type: "calculation",
    tags: ["配对t检验", "减肥药"],
    question: "5 名志愿者服药前后体重（kg）：前 $(80,76,92,68,84)$，后 $(78,75,88,69,80)$。检验减肥药是否显著减重，$\\alpha=0.05$。（$t_{0.05}(4)=2.1318$）",
    answer: "不拒绝 $H_0$（$t\\approx 2.11$）",
    solution: `
**差值** $D = (2, 1, 4, -1, 4)$，$\\bar{d}=2$，$s_d^2=4.5$，$s_d=2.121$。

**假设：**
$$ H_0: \\mu_d \\le 0, \\quad H_1: \\mu_d > 0 $$

**统计量：**
$$ t = \\frac{2.0}{2.121/\\sqrt{5}} = \\frac{2.0}{0.949} \\approx 2.11 $$

**拒绝域：** $t \\ge t_{0.05}(4) = 2.1318$

**决策：** $2.11 < 2.1318$，**不拒绝 $H_0$**。

**结论**：无充分证据认为减肥药显著有效。
`,
    hints: [
      "先算差值 $D_i = \\text{前} - \\text{后}$。",
      "$df=4$，右侧检验。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{D}}{S_D/\\sqrt{n}}"
    ],
    commonMistakes: [
      "误用独立双样本 $t$ 检验。",
      "错用 $t_{0.05}(5)$。"
    ]
  },
  {
    id: "8.10-3",
    chapterId: 8,
    sectionId: "8.10",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["配对t检验", "培训效果"],
    question: "8 名员工培训前后效率（件/小时）：前 $(45,52,48,55,50,47,53,49)$，后 $(48,54,51,56,52,50,55,52)$。检验培训是否提高，$\\alpha=0.05$。（$t_{0.05}(7)=1.8946$）",
    answer: "拒绝 $H_0$（$t\\approx 9.03$）",
    solution: `
**第一步：建立假设并定义差值**

检验培训是否提高效率，设 $D_i = \\text{后}_i - \\text{前}_i$，则：
$$ H_0: \\mu_D \\le 0, \\quad H_1: \\mu_D > 0 $$

**第二步：计算差值**
$$ D = (48-45,\\; 54-52,\\; 51-48,\\; 56-55,\\; 52-50,\\; 50-47,\\; 55-53,\\; 52-49) = (3,2,3,1,2,3,2,3) $$

**第三步：差值均值与标准差**
$$ \\bar{d} = \\frac{19}{8} = 2.375 $$
$$ s_d^2 = \\frac{\\sum_{i=1}^8 (d_i - 2.375)^2}{7} = \\frac{3.875}{7} \\approx 0.554, \\quad s_d \\approx 0.744 $$

**第四步：$t$ 统计量**
$$ t = \\frac{\\bar{d}}{s_d/\\sqrt{n}} = \\frac{2.375}{0.744/\\sqrt{8}} = \\frac{2.375}{0.263} \\approx 9.03 $$

**第五步：决策**
右侧检验，$t \\ge t_{0.05}(7) = 1.8946$。因 $9.03 \\gg 1.8946$，**拒绝 $H_0$**。

**结论**：在 $\\alpha=0.05$ 下，培训显著提高了员工工作效率。
`,
    hints: [
      "检验'提高' $\\Rightarrow$ $D=\\text{后}-\\text{前}$，$H_1: \\mu_D>0$。",
      "$df=7$。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{D}-0}{S_D/\\sqrt{n}}"
    ],
    commonMistakes: [
      "差值方向搞反。",
      "用独立样本 $t$ 检验。"
    ]
  },
  {
    id: "8.10-4",
    chapterId: 8,
    sectionId: "8.10",
    difficulty: "exam",
    type: "fill",
    tags: ["配对t检验", "自由度"],
    question: "配对样本 $n=12$ 对数据，配对 $t$ 检验的自由度为________。",
    answer: "11",
    solution: `
配对 $t$ 检验等价于对 $n$ 个差值做单样本 $t$ 检验，自由度：
$$ df = n - 1 = 12 - 1 = 11 $$

**答案**：11。
`,
    hints: [
      "配对检验自由度 = 对数 - 1。",
      "不是 $2n-2$。"
    ],
    relatedFormulas: [
      "df = n-1"
    ],
    commonMistakes: [
      "自由度写 12 或 22。",
      "误用两样本合并自由度。"
    ]
  },
  {
    id: "8.10-5",
    chapterId: 8,
    sectionId: "8.10",
    difficulty: "challenge",
    type: "calculation",
    tags: ["配对t检验", "前后对照", "考研风格"],
    question: "10 台机器改造前后能耗（kWh）：差值 $d_i$ 为 $(2.1, 1.8, 2.5, 1.2, 2.0, 1.5, 2.3, 1.9, 2.2, 1.6)$（改造后减改造前，正值表示节能）。$\\bar{d}=1.91$，$s_d=0.42$。检验是否显著节能，$\\alpha=0.05$。（$t_{0.05}(9)=1.8331$）",
    answer: "拒绝 $H_0$（$t\\approx 14.4$）",
    solution: `
**假设：**
$$ H_0: \\mu_d \\le 0, \\quad H_1: \\mu_d > 0 $$

**统计量：**
$$ t = \\frac{1.91}{0.42/\\sqrt{10}} = \\frac{1.91}{0.1328} \\approx 14.4 $$

**拒绝域：** $t \\ge 1.8331$

**决策：** $14.4 \\gg 1.8331$，**拒绝 $H_0$**。

**结论**：改造显著降低能耗。
`,
    hints: [
      "已给 $\\bar{d}$ 和 $s_d$，直接代入公式。",
      "节能 $\\Rightarrow$ 改造后更小 $\\Rightarrow$ 差值定义为'前-后'>0 或'后-前'<0，需与假设一致。"
    ],
    relatedFormulas: [
      "t = \\frac{\\bar{D}}{S_D/\\sqrt{n}}"
    ],
    commonMistakes: [
      "差值符号与假设不一致。",
      "误用 $n=20$ 的自由度。"
    ]
  },

  // ========== 8.11 正态总体方差的χ²检验 (5题) ==========
  {
    id: "8.11-1",
    chapterId: 8,
    sectionId: "8.11",
    difficulty: "basic",
    type: "choice",
    tags: ["卡方检验", "方差检验"],
    question: "单个正态总体方差检验，$\\mu$ 未知时，检验统计量为：",
    options: [
      "$\\chi^2 = \\frac{nS^2}{\\sigma_0^2}$",
      "$\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2}$",
      "$\\chi^2 = \\frac{S^2}{\\sigma_0^2}$",
      "$\\chi^2 = \\frac{(n-1)S^2}{\\sigma^2}$"
    ],
    answer: "B",
    solution: `
**正态总体方差检验（$\\mu$ 未知）：**
$$ \\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2} \\sim \\chi^2(n-1) $$

**A**：分子应为 $(n-1)S^2$，不是 $nS^2$。
**C**：缺少 $(n-1)$ 因子。
**D**：分母应为假设值 $\\sigma_0^2$，不是未知 $\\sigma^2$。

**结论**：选 B。
`,
    hints: [
      "用样本方差 $S^2$，自由度 $n-1$。",
      "分母是 $H_0$ 下的 $\\sigma_0^2$。"
    ],
    relatedFormulas: [
      "\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2} \\sim \\chi^2(n-1)"
    ],
    commonMistakes: [
      "分子用 $nS^2$ 代替 $(n-1)S^2$。",
      "自由度用 $n$。"
    ]
  },
  {
    id: "8.11-2",
    chapterId: 8,
    sectionId: "8.11",
    difficulty: "exam",
    type: "calculation",
    tags: ["卡方检验", "单侧"],
    question: "$n=16$，$S^2=3.6$，检验 $H_0: \\sigma^2 \\le 2.0$ vs $H_1: \\sigma^2 > 2.0$，$\\alpha=0.05$。（$\\chi^2_{0.05}(15)=25.00$）",
    answer: "拒绝 $H_0$（$\\chi^2=27.0$）",
    solution: `
**统计量：**
$$ \\chi^2 = \\frac{(16-1) \\times 3.6}{2.0} = \\frac{54}{2} = 27.0 $$

**拒绝域（右侧）：** $\\chi^2 \\ge \\chi^2_{0.05}(15) = 25.00$

**决策：** $27.0 > 25.00$，**拒绝 $H_0$**。

**结论**：方差显著大于 2.0。
`,
    hints: [
      "$df = n-1 = 15$。",
      "$H_1: \\sigma^2 > \\sigma_0^2$ 为右尾检验。"
    ],
    relatedFormulas: [
      "\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2}"
    ],
    commonMistakes: [
      "用 $\\chi^2_{0.05}(16)$ 查表。",
      "分子算成 $16 \\times 3.6$。"
    ]
  },
  {
    id: "8.11-3",
    chapterId: 8,
    sectionId: "8.11",
    difficulty: "intermediate",
    type: "fill",
    tags: ["卡方检验", "双侧"],
    question: "检验 $H_0: \\sigma^2 = 4$ vs $H_1: \\sigma^2 \\neq 4$，$n=21$，$\\alpha=0.05$。双侧拒绝域为 $\\chi^2 \\le$________或 $\\chi^2 \\ge$________。（$\\chi^2_{0.975}(20)=9.591$，$\\chi^2_{0.025}(20)=34.170$）",
    answer: "9.591 和 34.170",
    solution: `
**双侧 $\\chi^2$ 检验**，$df=20$，每侧 $\\alpha/2=0.025$。

**左尾拒绝域：** $\\chi^2 \\le \\chi^2_{1-\\alpha/2}(20) = \\chi^2_{0.975}(20) = 9.591$

**右尾拒绝域：** $\\chi^2 \\ge \\chi^2_{\\alpha/2}(20) = \\chi^2_{0.025}(20) = 34.170$

**答案**：9.591 和 34.170。
`,
    hints: [
      "双侧用 $\\chi^2_{1-\\alpha/2}$ 和 $\\chi^2_{\\alpha/2}$。",
      "左尾用下侧分位数 $\\chi^2_{0.975}$。"
    ],
    relatedFormulas: [
      "W = \\{\\chi^2 \\le \\chi^2_{1-\\alpha/2}(n-1)\\} \\cup \\{\\chi^2 \\ge \\chi^2_{\\alpha/2}(n-1)\\}"
    ],
    commonMistakes: [
      "双侧只用右尾 $\\chi^2_{0.05}$。",
      "左尾临界值用 $\\chi^2_{0.025}$ 而非 $\\chi^2_{0.975}$。"
    ]
  },
  {
    id: "8.11-4",
    chapterId: 8,
    sectionId: "8.11",
    difficulty: "exam",
    type: "calculation",
    tags: ["卡方检验", "生产精度"],
    question: "零件重量波动要求 $\\sigma^2 \\le 0.25$。抽 $n=25$，$s^2=0.36$。检验波动是否超标，$\\alpha=0.05$。（$\\chi^2_{0.05}(24)=36.415$）",
    answer: "不拒绝 $H_0$（$\\chi^2=34.56$）",
    solution: `
**假设：**
$$ H_0: \\sigma^2 \\le 0.25, \\quad H_1: \\sigma^2 > 0.25 $$

**统计量（在边界 $\\sigma_0^2=0.25$）：**
$$ \\chi^2 = \\frac{24 \\times 0.36}{0.25} = \\frac{8.64}{0.25} = 34.56 $$

**拒绝域：** $\\chi^2 \\ge 36.415$

**决策：** $34.56 < 36.415$，**不拒绝 $H_0$**。

**结论**：无充分证据认为波动超标。
`,
    hints: [
      "'超标' $\\Rightarrow$ 右侧检验 $H_1: \\sigma^2 > 0.25$。",
      "$df=24$。"
    ],
    relatedFormulas: [
      "\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2}"
    ],
    commonMistakes: [
      "检验均值而非方差。",
      "用 $\\chi^2_{0.05}(25)$ 查表。"
    ]
  },
  {
    id: "8.11-5",
    chapterId: 8,
    sectionId: "8.11",
    difficulty: "challenge",
    type: "proof",
    tags: ["卡方检验", "抽样分布"],
    question: "证明：设 $X_1,\\ldots,X_n \\sim N(\\mu,\\sigma^2)$ 独立，则 $\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)$。",
    answer: "见解答",
    solution: `
**证明思路：**

1. 样本方差 $S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$。

2. 对正态样本，有恒等式 $\\sum_{i=1}^n (X_i - \\mu)^2 = \\sum_{i=1}^n (X_i - \\bar{X})^2 + n(\\bar{X}-\\mu)^2$。

3. 由 Cochran 定理或标准正态分解：
   - $\\frac{\\sum (X_i-\\bar{X})^2}{\\sigma^2} = \\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)$
   - $\\frac{n(\\bar{X}-\\mu)^2}{\\sigma^2} \\sim \\chi^2(1)$，且与前者独立。

4. 故 $\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)$。证毕。

**注**：这是方差检验统计量服从 $\\chi^2$ 分布的理论基础。
`,
    hints: [
      "利用正态样本下 $\\bar{X}$ 与 $S^2$ 独立。",
      "Cochran 定理是严格证明工具。"
    ],
    relatedFormulas: [
      "\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)"
    ],
    commonMistakes: [
      "认为必须知道 $\\mu$ 才能用此分布。",
      "自由度写成 $n$。"
    ]
  },

  // ========== 8.12 两个正态总体方差比较的F检验 (4题) ==========
  {
    id: "8.12-1",
    chapterId: 8,
    sectionId: "8.12",
    difficulty: "basic",
    type: "choice",
    tags: ["F检验", "方差齐性"],
    question: "两独立正态总体方差检验 $H_0: \\sigma_1^2=\\sigma_2^2$，检验统计量为：",
    options: [
      "$F = \\frac{S_1^2 + S_2^2}{2}$",
      "$F = \\frac{S_1^2}{S_2^2} \\sim F(n_1-1, n_2-1)$",
      "$F = \\frac{S_1^2}{S_2^2} \\sim F(n_1, n_2)$",
      "$F = \\frac{\\bar{X}_1-\\bar{X}_2}{S_p}$"
    ],
    answer: "B",
    solution: `
**$F$ 检验**：在 $H_0: \\sigma_1^2=\\sigma_2^2$ 下，
$$ F = \\frac{S_1^2}{S_2^2} \\sim F(n_1-1, n_2-1) $$

**C**：自由度应为 $n_1-1, n_2-1$。
**A、D**：不是 $F$ 检验统计量。

**结论**：选 B。
`,
    hints: [
      "习惯将较大 $S^2$ 放分子便于查表。",
      "自由度均为样本量减 1。"
    ],
    relatedFormulas: [
      "F = \\frac{S_1^2}{S_2^2} \\sim F(n_1-1, n_2-1)"
    ],
    commonMistakes: [
      "自由度用 $n_1, n_2$。",
      "与两样本 $t$ 检验统计量混淆。"
    ]
  },
  {
    id: "8.12-2",
    chapterId: 8,
    sectionId: "8.12",
    difficulty: "exam",
    type: "calculation",
    tags: ["F检验", "双侧", "设备比较"],
    question: "设备 A：$n_1=10$，$s_1^2=2.4$；设备 B：$n_2=13$，$s_2^2=0.8$。检验波动性是否有显著差异，$\\alpha=0.05$。（$F_{0.025}(9,12)=3.44$）",
    answer: "不拒绝 $H_0$（$F=3.0$）",
    solution: `
**假设：**
$$ H_0: \\sigma_1^2 = \\sigma_2^2, \\quad H_1: \\sigma_1^2 \\neq \\sigma_2 $$

**统计量（大方差放分子）：**
$$ F = \\frac{2.4}{0.8} = 3.0 \\sim F(9, 12) $$

**双侧拒绝域（分子为较大方差）：**
$$ F \\ge F_{0.025}(9, 12) = 3.44 $$

**决策：** $3.0 < 3.44$，**不拒绝 $H_0$**。

**结论**：无充分证据认为两设备波动性有显著差异。
`,
    hints: [
      "双侧 $F$ 检验用 $F_{\\alpha/2}$。",
      "较大 $s^2$ 放分子，只查上侧临界值。"
    ],
    relatedFormulas: [
      "F = \\frac{S_{\\max}^2}{S_{\\min}^2}"
    ],
    commonMistakes: [
      "用 $F_{0.05}(9,12)=2.80$ 导致错误拒绝。",
      "自由度顺序颠倒。"
    ]
  },
  {
    id: "8.12-3",
    chapterId: 8,
    sectionId: "8.12",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["F检验", "单侧"],
    question: "方法 1：$n_1=8$，$s_1^2=12$；方法 2：$n_2=10$，$s_2^2=5$。检验方法 1 波动是否更大，$\\alpha=0.05$。（$F_{0.05}(7,9)=3.29$）",
    answer: "不拒绝 $H_0$（$F=2.4$）",
    solution: `
**假设：**
$$ H_0: \\sigma_1^2 \\le \\sigma_2^2, \\quad H_1: \\sigma_1^2 > \\sigma_2^2 $$

**统计量：**
$$ F = \\frac{s_1^2}{s_2^2} = \\frac{12}{5} = 2.4 \\sim F(7, 9) $$

**拒绝域：** $F \\ge F_{0.05}(7, 9) = 3.29$

**决策：** $2.4 < 3.29$，**不拒绝 $H_0$**。

**结论**：无充分证据认为方法 1 波动更大。
`,
    hints: [
      "单侧右侧 $F$ 检验用 $F_{\\alpha}$。",
      "$H_1$ 方向决定哪方方差放分子。"
    ],
    relatedFormulas: [
      "F = \\frac{S_1^2}{S_2^2} \\sim F(n_1-1, n_2-1)"
    ],
    commonMistakes: [
      "双侧临界值 $F_{0.025}$ 用于单侧。",
      "较小方差放分子。"
    ]
  },
  {
    id: "8.12-4",
    chapterId: 8,
    sectionId: "8.12",
    difficulty: "exam",
    type: "fill",
    tags: ["F检验", "方差齐性"],
    question: "做两样本合并 $t$ 检验前，通常先用________检验判断 $\\sigma_1^2=\\sigma_2^2$。若 $p$ 值 $>\\alpha$，则认为方差________，可使用合并 $t$ 检验。",
    answer: "F 和 齐性（或相等）",
    solution: `
**标准流程：**
1. 先用 **$F$ 检验**（或 Levene 检验）检验 $H_0: \\sigma_1^2=\\sigma_2^2$。
2. 若 $p > \\alpha$，**不拒绝** $H_0$，认为方差**齐性**（相等），可使用**合并方差 $t$ 检验**。
3. 若拒绝 $H_0$，方差不等，用 **Welch $t$ 检验**。

**答案**：F 和 齐性（或相等）。
`,
    hints: [
      "$F$ 检验是方差齐性检验的标准工具。",
      "不拒绝 $H_0$ 不等于证明方差相等，但实践中可继续合并 $t$。"
    ],
    relatedFormulas: [],
    commonMistakes: [
      "跳过方差齐性检验直接合并 $t$。",
      "拒绝 $H_0$ 后仍用合并 $t$。"
    ]
  },

  // ========== 8.13 检验的功效与样本量确定 (4题) ==========
  {
    id: "8.13-1",
    chapterId: 8,
    sectionId: "8.13",
    difficulty: "basic",
    type: "choice",
    tags: ["功效", "样本量"],
    question: "要提高检验功效（降低 $\\beta$），在 $\\alpha$ 固定时最有效的方法是：",
    options: [
      "减小 $\\alpha$",
      "增加样本量 $n$",
      "改用双侧检验",
      "增大 $\\sigma$"
    ],
    answer: "B",
    solution: `
**功效** $= 1-\\beta = P(\\text{拒绝 } H_0 \\mid H_1 \\text{ 真})$。

**增加 $n$**：标准误减小，真实效应更易检测，$\\beta$ 降低，功效提高。

**A**：减小 $\\alpha$ 会增大 $\\beta$，降低功效。
**C**：单侧/双侧与功效无必然"提高"关系。
**D**：$\\sigma$ 增大使检验更难，功效降低。

**结论**：选 B。
`,
    hints: [
      "功效与效应量、$n$、$\\alpha$、$\\sigma$ 有关。",
      "$n$ 增大 $\\Rightarrow$ 功效增大。"
    ],
    relatedFormulas: [
      "Power = 1 - \\beta"
    ],
    commonMistakes: [
      "认为减小 $\\alpha$ 提高检验质量。",
      "忽略样本量对功效的决定性作用。"
    ]
  },
  {
    id: "8.13-2",
    chapterId: 8,
    sectionId: "8.13",
    difficulty: "intermediate",
    type: "calculation",
    tags: ["样本量", "Z检验"],
    question: "设 $X \\sim N(\\mu, 4)$，$\\sigma=2$。检验 $H_0: \\mu=10$ vs $H_1: \\mu=11$（右侧），$\\alpha=0.05$，$\\beta=0.10$。求所需样本量 $n$。（$z_{0.05}=1.645$，$z_{0.10}=1.282$）",
    answer: "$n = 35$",
    solution: `
**样本量公式（均值单侧 $Z$ 检验）：**
$$ n = \\frac{(z_\\alpha + z_\\beta)^2 \\sigma^2}{(\\mu_1 - \\mu_0)^2} $$

其中 $\\mu_0=10$，$\\mu_1=11$，$\\sigma=2$，$\\alpha=0.05$，$\\beta=0.10$。

**代入计算：**
$$ n = \\frac{(1.645 + 1.282)^2 \\times 4}{(11-10)^2} = \\frac{(2.927)^2 \\times 4}{1} = 8.567 \\times 4 = 34.27 $$

**向上取整**：$n = 35$。

**结论**：至少需要 35 个样本才能在 $\\alpha=0.05$、$\\beta=0.10$ 下检测 $\\mu$ 从 10 到 11 的变化。
`,
    hints: [
      "$n = \\frac{(z_\\alpha+z_\\beta)^2\\sigma^2}{(\\mu_1-\\mu_0)^2}$。",
      "结果向上取整。"
    ],
    relatedFormulas: [
      "n = \\frac{(z_\\alpha + z_\\beta)^2 \\sigma^2}{(\\mu_1 - \\mu_0)^2}"
    ],
    commonMistakes: [
      "忘记平方 $(z_\\alpha+z_\\beta)^2$。",
      "不向上取整。"
    ]
  },
  {
    id: "8.13-3",
    chapterId: 8,
    sectionId: "8.13",
    difficulty: "exam",
    type: "fill",
    tags: ["功效", "两类错误"],
    question: "当 $\\alpha=0.05$，$\\beta=0.20$ 时，检验功效为________。若样本量增大而 $\\alpha$ 不变，功效将________。",
    answer: "0.80 和 增大",
    solution: `
**功效：**
$$ 1 - \\beta = 1 - 0.20 = 0.80 $$

**样本量增大**：在 $\\alpha$ 固定时，标准误减小，更易检测真实效应，$\\beta$ 减小，功效**增大**。

**答案**：0.80 和 增大。
`,
    hints: [
      "功效 = $1-\\beta$。",
      "$n$ 增大 $\\Rightarrow$ $\\beta$ 减小 $\\Rightarrow$ 功效增大。"
    ],
    relatedFormulas: [
      "Power = 1 - \\beta"
    ],
    commonMistakes: [
      "功效写 0.20。",
      "认为 $n$ 增大时 $\\alpha$ 也变导致功效不确定。"
    ]
  },
  {
    id: "8.13-4",
    chapterId: 8,
    sectionId: "8.13",
    difficulty: "challenge",
    type: "calculation",
    tags: ["功效", "综合", "考研风格"],
    question: "已知 $Z$ 检验 $H_0: \\mu=0$ vs $H_1: \\mu=0.5$，$\\sigma=1$，$n=25$，$\\alpha=0.05$（右侧）。求功效 $1-\\beta$。（$z_{0.05}=1.645$，$\\Phi(0.855)\\approx 0.80$）",
    answer: "功效 $\\approx 0.80$",
    solution: `
**第一步：确定拒绝域（在 $H_0: \\mu=0$ 下）**

右侧检验，$\\alpha=0.05$：
$$ Z = \\frac{\\bar{X}}{\\sigma/\\sqrt{n}} = \\frac{\\bar{X}}{1/5} = 5\\bar{X} \\ge z_{0.05} = 1.645 $$
即 $\\bar{X} \\ge 0.329$ 时拒绝 $H_0$。

**第二步：在 $H_1: \\mu=0.5$ 下 $\\bar{X}$ 的分布**
$$ \\bar{X} \\sim N(0.5,\\; 1/25), \\quad \\sigma_{\\bar{X}} = 0.2 $$

**第三步：计算功效**
$$ \\text{Power} = P(\\bar{X} \\ge 0.329 \\mid \\mu=0.5) = P\\left(Z \\ge \\frac{0.329-0.5}{0.2}\\right) = P(Z \\ge -0.855) = \\Phi(0.855) \\approx 0.80 $$

**第四步：公式验证**

功效公式（单侧 $Z$ 检验）：
$$ \\text{Power} = \\Phi\\left(\\frac{\\mu_1 - \\mu_0}{\\sigma/\\sqrt{n}} - z_\\alpha\\right) = \\Phi\\left(\\frac{0.5}{0.2} - 1.645\\right) = \\Phi(0.855) \\approx 0.80 $$

**结论**：功效 $1-\\beta \\approx 0.80$，即当 $\\mu=0.5$ 时，检验有约 80% 的概率正确拒绝 $H_0$。
`,
    hints: [
      "先求基于 $H_0$ 的拒绝域，再在 $H_1$ 下算落入拒绝域的概率。",
      "功效 = $P(\\text{拒绝 } H_0 \\mid H_1 \\text{ 真})$。"
    ],
    relatedFormulas: [
      "Power = P(\\bar{X} \\in W \\mid \\mu = \\mu_1)"
    ],
    commonMistakes: [
      "在 $H_0$ 下计算功效。",
      "混淆 $\\Phi(0.645)$ 与 $\\Phi(0.855)$。"
    ]
  }
];
