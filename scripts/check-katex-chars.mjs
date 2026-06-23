#!/usr/bin/env node
/**
 * KaTeX 字符守卫 — 检查 Markdown 中 \text{...} 内是否含有 KaTeX Main-Regular
 * 字体不支持的字符（emoji、Unicode 上标等），在 build 前拦截。
 *
 * 背景：rehype-katex 以 throwOnError:false, strict:false 运行，遇到不支持的
 * 字符不会报错但会输出 "No character metrics for 'X'" 警告，且渲染结果可能
 * 字体不一致或显示为方框。此脚本在 prebuild 阶段静态扫描，从源头杜绝。
 *
 * 受检范围：content/ 下所有 .md 文件（不含 _raw/，因为 _raw 不参与构建）。
 * 检测规则：在 $...$ 或 $$...$$ 数学环境内的 \text{...} 中出现以下字符：
 *   - emoji: ❌ ✅ ⚠️ ❗ 等（U+1F000 以上或常见 emoji 区段）
 *   - Unicode 上标: ² ³ ¹ ⁰ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹
 *   - Unicode 下标: ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉
 *
 * 用法：node scripts/check-katex-chars.mjs   （prebuild 自动执行）
 * 退出码：0 全部合法；1 发现不合规字符。
 */
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const ROOTS = ["content"];
const EXTS = [".md", ".mdx"];
const EXCLUDE_DIRS = ["_raw"];

const BAD_CHARS = /[\u00B2\u00B3\u00B9\u2070\u2074-\u2079\u2080-\u2089\u2713\u2717\u2714\u2716\u2718\u2719\u271A\u271B\u271C\u271D\u271E\u271F\u2720\u2721\u2722\u2723\u2724\u2725\u2726\u2727\u2728\u2729\u272A\u272B\u272C\u272D\u272E\u272F\u2730\u2731\u2732\u2733\u2734\u2735\u2736\u2737\u2738\u2739\u273A\u273B\u273C\u273D\u273E\u273F\u2740\u2741\u2742\u2743\u2744\u2745\u2746\u2747\u2748\u2749\u274A\u274B\u274C\u274D\u274E\u274F\u2750\u2751\u2752\u2753\u2754\u2755\u2756\u2757\u2758\u2759\u275A\u275B\u275C\u275D\u275E\u275F\u2760\u2761\u2762\u2763\u2764\u2765\u2766\u2767\u2768\u2769\u276A\u276B\u276C\u276D\u276E\u276F\u2770\u2771\u2772\u2773\u2774\u2775\u2776\u2777\u2778\u2779\u277A\u277B\u277C\u277D\u277E\u277F\u2780\u2781\u2782\u2783\u2784\u2785\u2786\u2787\u2788\u2789\u278A\u278B\u278C\u278D\u278E\u278F\u2790\u2791\u2792\u2793\u2794\u2795\u2796\u2797\u2798\u2799\u279A\u279B\u279C\u279D\u279E\u279F\u27A0\u27A1\u27A2\u27A3\u27A4\u27A5\u27A6\u27A7\u27A8\u27A9\u27AA\u27AB\u27AC\u27AD\u27AE\u27AF\u27B0\u27B1\u27B2\u27B3\u27B4\u27B5\u27B6\u27B7\u27B8\u27B9\u27BA\u27BB\u27BC\u27BD\u27BE\u27BF\u27C0\u27C1\u27C2\u27C3\u27C4\u27C5\u27C6\u27C7\u27C8\u27C9\u27CA\u27CB\u27CC\u27CD\u27CE\u27CF\u27D0\u27D1\u27D2\u27D3\u27D4\u27D5\u27D6\u27D7\u27D8\u27D9\u27DA\u27DB\u27DC\u27DD\u27DE\u27DF\u27E0\u27E1\u27E2\u27E3\u27E4\u27E5\u27E6\u27E7\u27E8\u27E9\u27EA\u27EB\u27EC\u27ED\u27EE\u27EF\u27F0\u27F1\u27F2\u27F3\u27F4\u27F5\u27F6\u27F7\u27F8\u27F9\u27FA\u27FB\u27FC\u27FD\u27FE\u27FF\u2800\u2801\u2802\u2803\u2804\u2805\u2806\u2807\u2808\u2809\u280A\u280B\u280C\u280D\u280E\u280F\u2810\u2811\u2812\u2813\u2814\u2815\u2816\u2817\u2818\u2819\u281A\u281B\u281C\u281D\u281E\u281F\u2820\u2821\u2822\u2823\u2824\u2825\u2826\u2827\u2828\u2829\u282A\u282B\u282C\u282D\u282E\u282F\u2830\u2831\u2832\u2833\u2834\u2835\u2836\u2837\u2838\u2839\u283A\u283B\u283C\u283D\u283E\u283F\u2840\u2841\u2842\u2843\u2844\u2845\u2846\u2847\u2848\u2849\u284A\u284B\u284C\u284D\u284E\u284F\u2850\u2851\u2852\u2853\u2854\u2855\u2856\u2857\u2858\u2859\u285A\u285B\u285C\u285D\u285E\u285F\u2860\u2861\u2862\u2863\u2864\u2865\u2866\u2867\u2868\u2869\u286A\u286B\u286C\u286D\u286E\u286F\u2870\u2871\u2872\u2873\u2874\u2875\u2876\u2877\u2878\u2879\u287A\u287B\u287C\u287D\u287E\u287F\u2880\u2881\u2882\u2883\u2884\u2885\u2886\u2887\u2888\u2889\u288A\u288B\u288C\u288D\u288E\u288F\u2890\u2891\u2892\u2893\u2894\u2895\u2896\u2897\u2898\u2899\u289A\u289B\u289C\u289D\u289E\u289F\u28A0\u28A1\u28A2\u28A3\u28A4\u28A5\u28A6\u28A7\u28A8\u28A9\u28AA\u28AB\u28AC\u28AD\u28AE\u28AF\u28B0\u28B1\u28B2\u28B3\u28B4\u28B5\u28B6\u28B7\u28B8\u28B9\u28BA\u28BB\u28BC\u28BD\u28BE\u28BF\u28C0\u28C1\u28C2\u28C3\u28C4\u28C5\u28C6\u28C7\u28C8\u28C9\u28CA\u28CB\u28CC\u28CD\u28CE\u28CF\u28D0\u28D1\u28D2\u28D3\u28D4\u28D5\u28D6\u28D7\u28D8\u28D9\u28DA\u28DB\u28DC\u28DD\u28DE\u28DF\u28E0\u28E1\u28E2\u28E3\u28E4\u28E5\u28E6\u28E7\u28E8\u28E9\u28EA\u28EB\u28EC\u28ED\u28EE\u28EF\u28F0\u28F1\u28F2\u28F3\u28F4\u28F5\u28F6\u28F7\u28F8\u28F9\u28FA\u28FB\u28FC\u28FD\u28FE\u28FF\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u2B00-\u2BFF\u2C00-\u2E7F]/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (EXTS.some((e) => entry.name.endsWith(e))) {
      out.push(join(dir, entry.name).replace(/\\/g, "/"));
    }
  }
  return out;
}

const violations = [];
let total = 0;

for (const root of ROOTS) {
  for (const f of walk(root)) {
    total++;
    const text = readFileSync(f, "utf8");

    const mathBlocks = [];
    let i = 0;
    while (i < text.length) {
      if (text[i] === "$" && text[i + 1] === "$") {
        const end = text.indexOf("$$", i + 2);
        if (end === -1) break;
        mathBlocks.push(text.slice(i + 2, end));
        i = end + 2;
      } else if (text[i] === "$") {
        const end = text.indexOf("$", i + 1);
        if (end === -1) break;
        mathBlocks.push(text.slice(i + 1, end));
        i = end + 1;
      } else {
        i++;
      }
    }

    for (const block of mathBlocks) {
      let m;
      const textRe = /\\text\s*\{([^}]*)\}/g;
      while ((m = textRe.exec(block)) !== null) {
        const inner = m[1];
        if (BAD_CHARS.test(inner)) {
          const chars = [...new Set(inner.match(new RegExp(BAD_CHARS.source, "gu")))]
            .map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`)
            .join(", ");
          violations.push({ file: f, snippet: m[0], chars });
        }
      }
    }
  }
}

if (violations.length) {
  console.error(`\n✗ KaTeX 字符守卫：发现 ${violations.length} 处 \\text{} 内含不支持的字符（扫描 ${total} 个文件）：`);
  for (const v of violations) {
    console.error(`   - ${v.file}`);
    console.error(`     ${v.snippet}  (${v.chars})`);
  }
  console.error(`\n  KaTeX Main-Regular 字体不支持 emoji 和 Unicode 上下标。`);
  console.error(`  请将 emoji 移出数学环境，或将 Unicode 上标改为 ^n 形式。\n`);
  process.exit(1);
}
console.log(`✓ KaTeX 字符守卫：${total} 个 Markdown 文件中 \\text{} 内无不支持字符。`);
