/**
 * 有机结构「画法」指南 + 投影式精校模板。
 *
 * 双轨策略：
 *  - 普通键线式/结构式 → 让 AI 写 SMILES，用 `<SvgDiagram mode="molecule">` 交 RDKit 确定性渲染（最可靠）。
 *  - 投影式（费歇尔/纽曼/哈沃斯/锯架）与楔形立体式 → RDKit 不支持，AI 用 `<SvgDiagram mode="raw">`
 *    照下列模板画 SVG。模板给出**几何规则 + 骨架坐标**，AI 据此填原子/标签。
 *
 * 该字符串注入 drawDiagram 工具（type=molecule）的返回指南。坐标为 viewBox 内像素，可整体缩放。
 */
export const CHEM_DRAW_GUIDE = `# 有机结构绘制（双轨）

## 1. 普通结构 → 写 SMILES（首选，最准）
能用 SMILES 表达的分子（键线式/结构式/芳环/官能团）一律用：
<SvgDiagram mode="molecule" title="乙酸乙酯">CCOC(=O)C</SvgDiagram>
（标签里只放 SMILES 文本；RDKit 自动排键、布芳香性、不会交叉。反应物可分别画，或用反应物.产物各一个分子。）

## 2. 立体/投影式 → 写模板 SVG（mode="raw"）
RDKit 画不了费歇尔/纽曼/哈沃斯/锯架。用 <SvgDiagram mode="raw"> 按下列规则画，颜色统一用 currentColor。

### 楔形键（立体）片段
- 实楔形（朝向观察者）：<polygon points="x1,y1 x2-4,y2 x2+4,y2" fill="currentColor"/>
- 虚楔形/后键（远离）：<line x1=".." y1=".." x2=".." y2=".." stroke="currentColor" stroke-width="2" stroke-dasharray="2 3"/>
- 普通键：<line ... stroke="currentColor" stroke-width="2"/>；双键画两条平行线（间距 3px）。

### 费歇尔投影（Fischer）——竖直主链、横键朝前
规则：竖直线=主链(上下为远离观察者)；每个手性碳的两条横线=朝向观察者；最氧化端在上。
<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="16" text-anchor="middle" font-size="14">CHO</text>
  <line x1="100" y1="22" x2="100" y2="248" stroke="currentColor" stroke-width="2"/>
  <line x1="42" y1="92" x2="158" y2="92" stroke="currentColor" stroke-width="2"/>
  <line x1="42" y1="168" x2="158" y2="168" stroke="currentColor" stroke-width="2"/>
  <text x="36" y="96" text-anchor="end" font-size="14">H</text>
  <text x="164" y="96" text-anchor="start" font-size="14">OH</text>
  <text x="36" y="172" text-anchor="end" font-size="14">HO</text>
  <text x="164" y="172" text-anchor="start" font-size="14">H</text>
  <text x="100" y="266" text-anchor="middle" font-size="13">CH2OH</text>
</svg>

### 纽曼投影（Newman）——前碳 Y 型、后碳从圆周伸出
规则：圆=前后碳重叠视线；前碳 3 键从圆心出发（默认 90°/210°/330°）；后碳 3 键从圆周边缘出发，
交错构象再转 60°（210°→270° 等）。重叠构象则前后键同向。
<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <circle cx="110" cy="110" r="58" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="110" y1="110" x2="110" y2="44" stroke="currentColor" stroke-width="2"/>
  <line x1="110" y1="110" x2="53" y2="143" stroke="currentColor" stroke-width="2"/>
  <line x1="110" y1="110" x2="167" y2="143" stroke="currentColor" stroke-width="2"/>
  <line x1="110" y1="168" x2="110" y2="205" stroke="currentColor" stroke-width="2"/>
  <line x1="60" y1="81" x2="28" y2="62" stroke="currentColor" stroke-width="2"/>
  <line x1="160" y1="81" x2="192" y2="62" stroke="currentColor" stroke-width="2"/>
</svg>

### 哈沃斯投影（Haworth）——环平铺、取代基竖直上下
规则：六元环画成略压扁的六边形，前缘（下方两键）加粗表示朝向观察者；环上取代基用竖直短线 + 标签，
环氧在右后。糖类 OH 在右=向下。
<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,70 110,55 180,70 180,120 110,135 60,120" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="60" y1="120" x2="110" y2="135" stroke="currentColor" stroke-width="3.5"/>
  <line x1="110" y1="135" x2="180" y2="120" stroke="currentColor" stroke-width="3.5"/>
  <line x1="60" y1="70" x2="60" y2="48" stroke="currentColor" stroke-width="2"/>
  <text x="60" y="42" text-anchor="middle" font-size="12">CH2OH</text>
</svg>

### 锯架投影（Sawhorse）——斜向看两碳
规则：一条斜线连接前后两碳（左下=前碳、右上=后碳）；每碳各引 3 键（约 120° 分布）。
<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
  <line x1="80" y1="130" x2="140" y2="80" stroke="currentColor" stroke-width="2"/>
  <line x1="80" y1="130" x2="80" y2="170" stroke="currentColor" stroke-width="2"/>
  <line x1="80" y1="130" x2="44" y2="112" stroke="currentColor" stroke-width="2"/>
  <line x1="80" y1="130" x2="116" y2="112" stroke="currentColor" stroke-width="2"/>
  <line x1="140" y1="80" x2="140" y2="40" stroke="currentColor" stroke-width="2"/>
  <line x1="140" y1="80" x2="104" y2="62" stroke="currentColor" stroke-width="2"/>
  <line x1="140" y1="80" x2="176" y2="98" stroke="currentColor" stroke-width="2"/>
</svg>

要点：颜色一律 currentColor（自动适配深浅色主题）；优先 SMILES，模板只用于投影/立体式。`;
