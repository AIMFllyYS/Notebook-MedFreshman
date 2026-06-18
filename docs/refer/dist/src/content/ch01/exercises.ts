import type { Exercise } from '../../types/exercise';

export const ch01Exercises: Exercise[] = [
  {
    id: '1.2-1',
    chapterId: 1,
    sectionId: '1.2',
    difficulty: 'basic',
    type: 'choice',
    tags: ['事件关系', '基本概念'],
    question: '设 $A, B$ 为两随机事件，且 $A \\subset B$，则下列式子中**不一定正确**的是：',
    options: [
      '$A \\cup B = B$',
      '$A \\cap B = A$',
      '$\\bar{A} \\supset \\bar{B}$',
      '$A - B = A$'
    ],
    answer: 'D',
    solution: `
我们要分析在 $A \\subset B$ 的前提下，哪个选项是错误的。

- **A选项**：由于 $A$ 是 $B$ 的子集，所以 $A$ 和 $B$ 的并集必然是更大的那个集合，即 $B$。所以 $A \\cup B = B$ 正确。
- **B选项**：同理，$A$ 和 $B$ 的交集必然是更小的那个集合，即 $A$。所以 $A \\cap B = A$ 正确。
- **C选项**：由于 $A \\subset B$（即发生A必发生B），所以如果不发生B（$\\bar{B}$），就肯定不发生A（$\\bar{A}$）。所以 $\\bar{B} \\subset \\bar{A}$，即 $\\bar{A} \\supset \\bar{B}$ 正确。
- **D选项**：$A - B$ 表示发生A且不发生B。但因为 $A \\subset B$，只要A发生，B必然发生。所以 $A - B = \\emptyset$。原选项说 $A - B = A$ 是错误的（除非 $A = \\emptyset$）。

因此，不一定正确的（实际是错误的）是 D。
    `,
    hints: [
      '画一个韦恩图（Venn Diagram），让圆A完全被包含在圆B内。',
      '$A - B$ 的含义是：在A中但不在B中的部分。如果A全在B里，这部分还有东西吗？'
    ],
    relatedFormulas: [],
    commonMistakes: [
      '容易把事件的差集 $A - B$ 和数字的减法混淆，认为 $A - B$ 就是从A里减去B，由于B比A大，减完还是A（这是完全没有道理的直觉错误）。'
    ]
  },
  {
    id: '1.5-1',
    chapterId: 1,
    sectionId: '1.5',
    difficulty: 'exam',
    type: 'choice',
    tags: ['条件概率', '考研真题'],
    question: '袋中有3个红球，2个白球。现从中无放回地依次抽取2个球。已知第一次抽到的是红球，求第二次抽到白球的概率：',
    options: [
      '$\\frac{1}{2}$',
      '$\\frac{2}{5}$',
      '$\\frac{3}{10}$',
      '$\\frac{3}{5}$'
    ],
    answer: 'A',
    solution: `
这是一个典型的条件概率问题。

设 $A$ = "第一次抽到红球"，$B$ = "第二次抽到白球"。我们要计算的是 $P(B|A)$。

**直觉解法（缩小样本空间）**：
已知第一次抽走了一个红球，那么袋子里的情况变成了：**2个红球，2个白球**，总共4个球。
在这样的新袋子中抽一次，抽到白球的概率显然是 $\\frac{2}{4} = \\frac{1}{2}$。

**公式解法**：
$$P(A) = \\frac{3}{5}$$
$$P(AB) = P(\\text{先红后白}) = \\frac{3}{5} \\times \\frac{2}{4} = \\frac{6}{20} = \\frac{3}{10}$$
根据条件概率定义：
$$P(B|A) = \\frac{P(AB)}{P(A)} = \\frac{\\frac{3}{10}}{\\frac{3}{5}} = \\frac{1}{2}$$

对比发现，直觉解法更快捷！
    `,
    hints: [
      '注意"已知"二字，这就是条件概率的信号。',
      '直接思考第一步发生后，袋子里还剩下什么球？'
    ],
    relatedFormulas: ['P(B|A) = P(AB) / P(A)'],
    commonMistakes: [
      '容易算成边缘概率 $P(B)$（即全概率公式算出的结果），或者算成了联合概率 $P(AB)$。'
    ]
  }
];
