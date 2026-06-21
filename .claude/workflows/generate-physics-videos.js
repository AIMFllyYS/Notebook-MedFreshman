export const meta = {
  name: "generate-physics-videos",
  description: "大学物理-详解12章38节全量拆解为KP/EX视频清单并扇出生成Manim场景脚本（不含渲染）",
  phases: [
    { title: "拆解", detail: "每章1个分析子体，把小节拆为KP/EX视频清单" },
    { title: "场景", detail: "每个视频item扇出1个子体写Manim场景.py" },
  ],
};

const ROOT = "D:/new_project/Gailvlun";

// ─── 12 章小节配置（来自 content/physics-detail.ts）──────────────────────
const CHAPTERS = [
  { id: "ch02", num: 2, title: "流体运动", sections: [
    { id: "2.1", title: "理想流体的稳定流动与连续性方程" },
    { id: "2.2", title: "伯努利方程及其应用" },
    { id: "2.3", title: "黏性流体、泊肃叶定律与血液流动" },
  ]},
  { id: "ch03", num: 3, title: "振动", sections: [
    { id: "3.1", title: "简谐振动" },
    { id: "3.2", title: "简谐振动的合成" },
    { id: "3.3", title: "阻尼振动、受迫振动和共振" },
  ]},
  { id: "ch04", num: 4, title: "机械波", sections: [
    { id: "4.1", title: "机械波的特点与平面简谐波" },
    { id: "4.2", title: "波的能量、衍射、干涉与驻波" },
    { id: "4.3", title: "多普勒效应与声波" },
  ]},
  { id: "ch05", num: 5, title: "分子动理论", sections: [
    { id: "5.1", title: "分子动理论基本概念与理想气体" },
    { id: "5.2", title: "气体分子速率分布与液体表面现象" },
  ]},
  { id: "ch07", num: 7, title: "静电场", sections: [
    { id: "7.1", title: "电荷、库仑定律与电场强度" },
    { id: "7.2", title: "电场线、电通量与高斯定理" },
    { id: "7.3", title: "静电场的环路定理、电势与场强关系" },
    { id: "7.4", title: "电偶极子与电偶层" },
  ]},
  { id: "ch08", num: 8, title: "稳恒磁场", sections: [
    { id: "8.1", title: "磁场与磁感应强度" },
    { id: "8.2", title: "电流的磁场与毕奥-萨伐尔定律" },
    { id: "8.3", title: "安培环路定理" },
    { id: "8.4", title: "磁场对运动电荷与载流导线的作用" },
  ]},
  { id: "ch09", num: 9, title: "电磁感应与电磁波", sections: [
    { id: "9.1", title: "法拉第电磁感应定律" },
    { id: "9.2", title: "动生电动势与感生电动势" },
    { id: "9.3", title: "自感、互感与磁场能量" },
    { id: "9.4", title: "麦克斯韦方程组与电磁波" },
  ]},
  { id: "ch10", num: 10, title: "几何光学", sections: [
    { id: "10.1", title: "几何光学基础与单球面折射" },
    { id: "10.2", title: "薄透镜成像与透镜组合" },
    { id: "10.3", title: "眼的光学结构与调节" },
    { id: "10.4", title: "放大镜与显微镜" },
  ]},
  { id: "ch11", num: 11, title: "波动光学", sections: [
    { id: "11.1", title: "光的相干性与干涉" },
    { id: "11.2", title: "光的衍射现象" },
    { id: "11.3", title: "光的偏振现象" },
  ]},
  { id: "ch12", num: 12, title: "量子力学初步", sections: [
    { id: "12.1", title: "黑体辐射与能量量子化" },
    { id: "12.2", title: "氢原子光谱与原子模型" },
    { id: "12.3", title: "微观粒子的波粒二象性" },
    { id: "12.4", title: "波函数与统计解释" },
  ]},
  { id: "ch13", num: 13, title: "原子核和放射性", sections: [
    { id: "13.1", title: "原子核的组成与基本性质" },
    { id: "13.2", title: "天然放射性与衰变类型" },
  ]},
  { id: "ch14", num: 14, title: "X射线与激光", sections: [
    { id: "14.1", title: "X 射线的产生与性质" },
    { id: "14.2", title: "激光的特点与发光原理" },
  ]},
];

// 已由金标准范本制作完成的「首概念视频」，对应小节的同类型 KP 从 seq=2 起编号
const DONE_KP1 = { "7.1": "phys-ch07-7.1-kp1-electric-field", "4.1": "phys-ch04-4.1-kp1-plane-wave" };

// ─── 工具：由逻辑字段确定性地推出 id/类名/文件路径 ─────────────────────
function pascal(slug) {
  return String(slug).split(/[-_\s]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}
function chNum2(chapterId) { return chapterId.replace("ch", ""); }
function buildItem(chapterId, r) {
  const secU = String(r.sectionId).replace(/\./g, "_");
  const slugU = String(r.slug).replace(/-/g, "_");
  const typeCap = r.type === "kp" ? "Kp" : "Ex";
  const id = `phys-${chapterId}-${r.sectionId}-${r.type}${r.seq}-${r.slug}`;
  const sceneClass = `Ch${chNum2(chapterId)}${typeCap}${r.seq}${pascal(r.slug)}`;
  const file = `manim/physics/${chapterId}/scene_${secU}_${r.type}${r.seq}_${slugU}.py`;
  return { ...r, chapterId, id, sceneClass, file };
}

// ─── 提示词 ────────────────────────────────────────────────────────────
function decomposePrompt(ch) {
  const secList = ch.sections.map((s) => `  - ${s.id} ${s.title}`).join("\n");
  const doneNote = ch.sections.some((s) => DONE_KP1[s.id])
    ? `\n【重要：已存在的视频，勿重复】本章中小节 ${ch.sections.filter((s) => DONE_KP1[s.id]).map((s) => s.id).join("、")} 的「首个核心概念视频」已制作完成；这些小节的 kp 序号请从 seq=2 开始编号（不要再出 seq=1 的概念视频，但可继续出该节的其它 KP 与例题视频）。`
    : "";
  return `你是大学物理资深讲师与教学动画策划。请把第${ch.num}章「${ch.title}」拆解成一份「教学视频清单」，供后续逐条生成 Manim 动画。

本章小节：
${secList}

【动手前必读（用 Glob/Read）】
1. 本章学习指导原文：用 Glob 找 ${ROOT}/content/_raw/physics/study-guide/${ch.num}-*.md 并 Read（这是最权威的知识点与例题来源）。
2. 每个小节的现有详解笔记：${ROOT}/content/physics/detail/<sectionId>.md（如 ${ch.sections[0].id}.md），了解已讲的知识点脉络。
3. 例题目录（了解可用例题）：${ROOT}/content/examples/physics/${ch.id}/<sectionId>/ 下的 *.md。
4. 拆解与提取规范：Read C:/Users/AIMFl/.claude/skills/lecture-to-manim/content-schema.md 的「提取规则」。

【拆解规则（务必遵守）】
- 逐小节提取核心知识点(type=kp)：每节通常 2-4 个，覆盖该节最该被「动起来」的概念/定理/推导。
- 例题(type=ex)：只挑「有可视化增量」的题（涉及场/波/光路/几何作图/矢量分解/动态过程/参数依赖）；纯代数代入计算题不要出视频。每节 0-3 个。
- 本章条目总数控制在 12-20 条之间（不要超过 20）。${doneNote}
- 每条必须给出：
  - type: "kp" 或 "ex"
  - sectionId: 如 "${ch.sections[0].id}"
  - seq: 该小节内同类型(kp/ex)的序号，从 1 开始（被标注「已存在」的小节其 kp 从 2 开始）
  - slug: 英文 kebab-case，2-5 个词，准确描述主题（如 coulomb-law、standing-wave、lens-imaging），仅小写字母与连字符
  - title: 中文标题（简洁）
  - description: 中文一句话，说明这个视频讲什么
  - vizPlan: 中文，详述如何用动画可视化——用什么坐标/图形/矢量/场线/光路，哪些量用 ValueTracker 扫动，分几步呈现（这是动画作者的施工图，越具体越好）
  - keyFormulas: 纯 ASCII LaTeX 字符串数组（绝不含中文或全角标点），如 ["E=\\\\frac{1}{4\\\\pi\\\\varepsilon_0}\\\\frac{q}{r^2}"]

只需返回结构化结果 { chapterId: "${ch.id}", items: [...] }，不要写任何文件。`;
}

function authorPrompt(it, ch) {
  const formulas = (it.keyFormulas || []).join("  ;  ");
  return `你是 Manim CE 动画作者。请创建一个教学动画场景文件，目标是让零基础读者看完真正理解，而非炫技。

目标文件（用 Write 写入）：${ROOT}/${it.file}
视频 ID：${it.id}
场景类名：${it.sceneClass}
所属：第${ch.num}章「${ch.title}」· 小节 ${it.sectionId}
视频标题：${it.title}
类型：${it.type === "kp" ? "知识点讲解" : "例题精讲"}

【可视化方案（施工图，严格按此实现）】
${it.vizPlan}

【关键公式（纯 ASCII，可直接放进 MathTex）】
${formulas || "（无，按主题自定）"}

【动手前必读】
1. 物理金标准范本（与本片同风格，务必对齐其结构与质量；二选一更贴近本片题材）：
   - 矢量场/场线/受力类 → Read ${ROOT}/manim/physics/ch07/scene_7_1_kp1_electric_field.py
   - 波动/振动/函数曲线类 → Read ${ROOT}/manim/physics/ch04/scene_4_1_kp1_plane_wave.py
2. 技术规范与错误速查：Read C:/Users/AIMFl/.claude/skills/lecture-to-manim/manim-rules.md

【铁律约束（违反会导致渲染失败）】
- 文件头：from manim import *  / import math  / import numpy as np / 顶部定义 CYAN = "#00FFFF" 与 CJK = "Microsoft YaHei"
- 中文文字一律 Text("...", font=CJK)；数学公式用 MathTex(r"...")。
- MathTex / Tex 内部绝对不能出现中文或全角标点（：，。（）【】 等）——本机 LaTeX 无 CJK，违反则整场景渲染失败。中文+公式混排用 VGroup(Text(...), MathTex(...)).arrange(RIGHT)。
- 禁止：config.font=、np.math.*（用 import math 的 math.*）、ThreeDScene（用 2D 替代）、import 不存在的符号。不确定的符号一律改用标准符号：Axes、NumberPlane、Arrow、Vector、Dot、Line、DashedLine、Brace、SurroundingRectangle、MathTex、Text、VGroup。
- 质量：时长约 90s-2min，10-12 个动画步骤，顺序为 标题 → 生活类比 → 定义(逐行出现) → 推导(逐步、关键项变色高亮) → 几何/矢量/曲线直觉(尽量用 ValueTracker + always_redraw 扫动参数) → 数值例子 → 小结卡(关键公式汇总+方框)。
- 布局安全：to_edge / next_to / arrange / scale_to_fit_width 防止超出屏幕；每步之间 self.wait(1) 到 self.wait(2)；切换场景前 self.play(FadeOut(...)) 清场。
- 文件顶层必须导出 REGISTER（单条）：
REGISTER = [{ "scene": "${it.sceneClass}", "id": "${it.id}", "chapterId": "${it.chapterId}", "sectionId": "${it.sectionId}", "title": "${it.title}", "description": "一句话说明动画讲了什么" }]

【完成后】只用 Write 写该 .py 文件，不要运行渲染命令，不要改其它文件。
返回结构化结果：{ id: "${it.id}", sectionId: "${it.sectionId}", scene: "${it.sceneClass}", file: "${it.file}", ok: true }`;
}

// ─── Schema ────────────────────────────────────────────────────────────
const itemsSchema = {
  type: "object",
  properties: {
    chapterId: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["kp", "ex"] },
          sectionId: { type: "string" },
          seq: { type: "number" },
          slug: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          vizPlan: { type: "string" },
          keyFormulas: { type: "array", items: { type: "string" } },
        },
        required: ["type", "sectionId", "seq", "slug", "title", "vizPlan"],
      },
    },
  },
  required: ["chapterId", "items"],
};

const sceneSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    sectionId: { type: "string" },
    scene: { type: "string" },
    file: { type: "string" },
    ok: { type: "boolean" },
  },
  required: ["id", "ok"],
};

// ─── 主流程：每章 拆解 → 该章各 item 并行写场景（章间流水线）──────────
const perChapter = await pipeline(
  CHAPTERS,
  (ch) =>
    agent(decomposePrompt(ch), {
      label: `拆解 ${ch.id} ${ch.title}`,
      phase: "拆解",
      model: "sonnet",
      schema: itemsSchema,
    }),
  (decomp, ch) => {
    if (!decomp || !Array.isArray(decomp.items) || decomp.items.length === 0) {
      log(`⚠️ ${ch.id} 拆解为空，跳过`);
      return [];
    }
    const items = decomp.items.map((r) => buildItem(ch.id, r));
    log(`${ch.id}「${ch.title}」拆出 ${items.length} 条视频（kp ${items.filter((i) => i.type === "kp").length} / ex ${items.filter((i) => i.type === "ex").length}）`);
    return parallel(
      items.map((it) => () =>
        agent(authorPrompt(it, ch), {
          label: `场景 ${it.id}`,
          phase: "场景",
          model: "sonnet",
          schema: sceneSchema,
        }).then((res) => ({ ok: false, ...(res || {}), id: it.id, sectionId: it.sectionId, chapterId: it.chapterId, scene: it.sceneClass, file: it.file, title: it.title, description: it.description })),
      ),
    );
  },
);

// ─── 汇总 ──────────────────────────────────────────────────────────────
const flat = perChapter.flat().filter(Boolean);
const authored = flat.filter((r) => r.ok);
const failed = flat.filter((r) => !r.ok);
log(`场景脚本生成完毕：成功 ${authored.length} / 共 ${flat.length}`);
if (failed.length) log(`失败 ${failed.length}：${failed.map((f) => f.id).join(", ")}`);

return {
  totalItems: flat.length,
  authored: authored.length,
  failedIds: failed.map((f) => f.id),
  // 完整清单（供后续 Phase 3 渲染 / Phase 4 集成使用）
  manifest: flat.map((r) => ({
    id: r.id, chapterId: r.chapterId, sectionId: r.sectionId,
    scene: r.scene, file: r.file, title: r.title, description: r.description,
  })),
};
